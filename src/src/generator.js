/* global global */

import { EventEmitter } from 'events';
import callRequest from '../lib/request';

const HOLIDAY_SOURCE = 'http://get-holidays.com/api/v1/holidays.json';

/**
 * @module gnerator
 */

/**
 * A Generator class
 * @class
 */
class Generator extends EventEmitter {
  /**
   * Create an instance of class Generator.
   * @param {object} - the various options
   */
  constructor(options) {
    super();
    this.employees = options.employees;
    this.countries = options.countries || [];
    this.period = options.period;
    this.preHolidays = Generator.convertToDateString(options.holidays || []);
    this.holidays = {};
    this.countries.forEach((country) => {
      this.holidays[country] = [];
    });
    this.loadHolidays(options.holidaysSource, options.countries);
  }

  /**
   * convert list of dates to date strings
   * @param {string[]} - list of dates
   */
  static convertToDateString(ar) {
    return (ar || [])
      .map(vl => new Date(vl))
      .filter(vl => !(isNaN(vl.getTime())))
      .map(vl => vl.toDateString());
  }

  /**
   * return if a day is holiday in a country
   * @param {Date} date - the date
   * @param {string} country - country
   */
  isAHoliday(date, country) {
    const ds = date.toDateString();
    if (this.preHolidays.indexOf(ds) !== -1) return true;
    if (country) {
      if (Array.isArray(this.holidays[country])) {
        return this.holidays[country].indexOf(ds) !== 1;
      }
    }
    return false;
  }

  /**
   * load holidays
   * @param {string} holidaysSource - the url file, to read the list of urls and assertions
   * @param {string[]} countries - list of countries
   */
  async loadHolidays(holidaysSource = HOLIDAY_SOURCE, countries) {
    if (Array.isArray(countries) && countries.length) {
      (await callRequest(`${holidaysSource}?country=${countries.join(',')}`))
        .forEach((ob) => {
          if (!Array.isArray(ob.country)) {
            this.holidays[ob.country] = [];
          }
          this.holidays[ob.country].push(...[ob.date]);
        });
    }
  }

  /**
   * start the work
   */
  start() {
    this.emit('log:gen-started');
  }

  /**
   * stop the service
   * @param {function} [callback] - if found, to be called when the service is stopped
   */
  stop() {
    this.emit('log:gen-ended');
  }

  /**
   * the function that is called generating the work events
   */
  generate() {
    let date = this.period[0];
    this.employees.forEach((ob) => {
      ob.leaves // eslint-disable-line no-param-reassign
        = Generator.convertToDateString(ob.leaves || []);
    });
    while (date <= this.period[1]) {
      this.employees.forEach((ob) => { // eslint-disable-line no-loop-func
        if (ob.isActive !== false &&
            ob.leaves.indexOf(date.toDateString()) === -1 &&
            !this.isAHoliday(date, ob.country)) {
          this.emit('work:event', { employeeId: ob.id, isWorking: true, date });
        }
      });
      date = new Date(date.getTime() + (24 * 60 * 60 * 1000));
    }
    this.stop();
  }

}

export default Generator;
