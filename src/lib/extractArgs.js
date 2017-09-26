/* eslint global-require:0, import/no-dynamic-require:0 */

import { join } from 'path';
import { mkdirSync } from 'fs';
import callRequest from './request';

const getStringValue = (inp) => {
  if (inp === '1' || inp === 'true') return true;
  if (inp) return inp;
  return undefined;
};

const { version, name, description } = require('../package.json'); // eslint-disable-line import/no-unresolved

const showError = function showError(message) {
  console.log(`\n    ${name} - ${description} .\n`); // eslint-disable-line no-console
  console.log(`    version - ${version}\n`); // eslint-disable-line no-console
  if (typeof message === 'string') {
    console.error(message);  // eslint-disable-line no-console
  }
  process.exit(2);
};

const ALLOWED_LOG_LEVELS = ['prod', 'test', 'dev'];

const options = { };
try {
  Object.assign(options, require(`${process.cwd()}/input.json`));
} catch (er) {
  try {
    Object.assign(options, require(`${process.cwd()}/input.sample.json`));
  } catch (err) {
    // do nothing
  }
}
let showHelp = false;

const argvs = process.argv.slice(2);
const arl = argvs.length;
for (let ind, arg, key, value, val, z = 0; z < arl; z += 1) {
  arg = argvs[z];
  ind = arg.indexOf('=');
  if (ind === -1) {
    continue; // eslint-disable-line no-continue
  }
  key = arg.substr(0, ind);
  value = getStringValue(arg.substr(ind + 1));
  val = ALLOWED_LOG_LEVELS.indexOf(value);
  switch (key.toLowerCase()) {
    case '-d':
    case '--reportdir':
      if (typeof value === 'string') {
        options.reportdir = value;
      } else {
        showHelp = 'Please provide correct value for output directory.';
      }
      break;
    case '-c':
    case '--countries':
      if (typeof value === 'string') {
        options.countries = value.split(',').map(vl => vl.trim());
      }
      break;
    case '-j':
    case '--jsonfile':
      if (typeof value === 'string') {
        options.jsonfile = value;
      }
      break;
    case '-p':
    case '--period':
      if (typeof value === 'string') {
        options.period = value.split('-')
          .map(vl => new Date(vl.trim()))
          .filter(vl => !(isNaN(vl.getTime())))
          .slice(0, 2);
        if (options.period.length === 2) {
          // ok
        } else {
          delete options.period;
          showHelp = 'Invalid period values.';
        }
      }
      break;
    case '-l':
    case '--loglevel':
      if (val !== -1) {
        options.loglevel = val;
      } else {
        showHelp = `Allowed values for \`${key}\` must be one of \`${String(ALLOWED_LOG_LEVELS)}\`.`;
      }
      break;
    case '-h':
    case '--help':
      showHelp = true;
      break;
    default :
      showHelp = `Invalid argument \`${key}\` was provided. Try again with valid arguments.`;
  }
}

if (!(showHelp)) {
  // set up defaults
}

if (showHelp) {
  showError(showHelp);
}

if (options.jsonfile) {
  if (options.jsonfile.startsWith('http')) {
    callRequest(options.jsonfile)
      .then(dt => Object.assign(options, dt))
      .catch((er) => { throw er; });
  } else {
    try {
      Object.assign(options, require(options.jsonfile));
    } catch (er) {
      // do nothing
    }
  }
}

if (!(Object.prototype.hasOwnProperty.call(options, 'reportdir'))) {
  options.reportdir = 'report';
}
if (!(options.reportdir.startsWith('/'))) {
  options.reportdir = join(process.cwd(), options.reportdir);
}

try {
  mkdirSync(options.reportdir);
} catch (er) {
  if (er.code !== 'EEXIST') throw er;
}

if (!(Object.prototype.hasOwnProperty.call(options, 'loglevel'))) {
  const loglevel = ALLOWED_LOG_LEVELS.indexOf(process.env.NODE_ENV);
  if (loglevel !== -1) {
    options.loglevel = loglevel;
  }
}
if (!(Object.prototype.hasOwnProperty.call(options, 'loglevel'))) {
  options.loglevel = 2;
}

if (!(Array.isArray(options.countries))) {
  options.countries = [];
}

if (Array.isArray(options.period) && options.period.length === 2) {
  options.period = options.period.map(vl => new Date(vl));
} else {
  const thirtyDays = 30 * 24 * 60 * 60 * 1000;
  options.period = [
    new Date(Date.now() - thirtyDays),
    new Date(Date.now() + thirtyDays),
  ];
}

export default options;
