/* global global */

import { writeFileSync } from 'fs';
import { join } from 'path';
import options from '../lib/extractArgs';
import { noop } from '../lib/util';

/**
 * @module filelogger
 */

/**
 * A File Logger class, that write to file
 * @class
 */
class FileLogger {
  /**
   * Create an instance of class FileLogger.
   * @param {object} gen - the instance of generator
   * @param {object} reportdir - the log directory, where file to be written
   */
  constructor(gen, reportdir) {
    gen.once('log:get-started', this.start.bind(this));
    gen.once('log:gen-ended', this.stop.bind(this));
    gen.on('work:event', this.gotAnEvent.bind(this));
    this.reportdir = reportdir;
    this.updateWriter();
  }

  /**
   * get current file name base on current date
   */
  static getFileName() {
    return `${String(new Date()).split(' ').slice(1, 4).join('_')}.json`;
  }

  /**
   * that will assign the writer as per current date
   */
  updateWriter() {
    const fileName = FileLogger.getFileName();
    if (fileName !== this.fileName) {
      this.stop();
      this.fileName = fileName;
      this.writer = [];
      this.start();
    }
  }

  /**
   * start the logger
   * @param {function} [callback] - if found, to be called when the service is stopped
   */
  start(callback = noop) { // eslint-disable-line class-methods-use-this
    this.log('GEN STARTED');
    callback();
  }

  /**
   * stop the logger, end the file stream
   * @param {function} [callback] - if found, to be called when the service is stopped
   */
  stop(callback = noop) {
    if (this.writer) {
      writeFileSync(join(this.reportdir, this.fileName), JSON.stringify(this.writer, null, 2));
      this.log('GEN ENDED');
      callback();
    }
  }

  /**
   * The error handler, eg when a url is is monitored un-healthy
   * @param {object} info - the data to be saved
   */
  gotAnEvent(info) {
    if (options.loglevel > -1) {
      this.updateWriter();
      this.writer.push(info);
    }
  }

  /**
   * The info handler, eg the service started /stopped etc
   * @param {*} ...args - the arguments to print
   */
  log(...args) { // eslint-disable-line class-methods-use-this
    if (options.loglevel > 1) {
      console.log(...args); // eslint-disable-line no-console
    }
  }

}

export default FileLogger;
