/* global global */

import Generator from './generator';
import FileLogger from '../loggers/file';
import { pick } from '../lib/util';

/**
 * @module service
 */

/**
 * A Main Service Class which keeps gen and logger
 * @class
 */
class Service {
  /**
   * Create an instance of class Service.
   * @param {object} opts - the options required to initiate the class
   */
  constructor(opts) {
    this.gen = new Generator(pick(opts, 'employees', 'holidays', 'period', 'countries', 'holidaysSource'));
    this.logger = new FileLogger(this.gen, opts.reportdir);
  }

  /**
   * start the service
   */
  start() {
    this.gen.start();
    this.gen.generate();
  }

  /**
   * stop the service
   */
  stop() {
    this.gen.stop();
  }

}

export default Service;
