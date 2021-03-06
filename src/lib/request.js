import http from 'http';
import https from 'https';
import urlp from 'url';
import { isObject, ifNoCaseKeyExists, pick, stringify } from './util';

class RequestError extends Error {
  constructor(message) {
    super(message);
    this.name = RequestError.name;
  }
}

function request(options) {
  let url;
  let method;
  let payload;
  let headers;
  let parser;
  return new Promise((resolve, reject) => {
    function cb(error, data) {
      if (error) reject(typeof error === 'string' ? new RequestError(error) : error);
      else resolve(data);
    }
    if (typeof options === 'string') {
      [url, method, parser] = [options, 'GET', JSON.parse];
    } else if (isObject(options)) {
      ({ url, method, payload, headers } = options);
      parser = (typeof options.parser === 'function' ? options.parser : JSON.parse);
    } else {
      return cb('INVALID_OPTIONS');
    }
    if (typeof url !== 'string' || !url.length) return cb('URL_NOT_FOUND');
    if (typeof method !== 'string' || !method.length) return cb('METHOD_NOT_FOUND');
    if (typeof headers !== 'object' || headers === null) headers = {};
    const obj = urlp.parse(url);
    obj.method = method;
    if (!ifNoCaseKeyExists(headers, 'content-type')) headers['content-type'] = 'application/json';
    obj.headers = headers;
    const startTime = (new Date()).getTime();
    const req = (obj.protocol === 'https:' ? https : http).request(obj, (res) => {
      let resc = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => { resc += chunk; });
      function respond() {
        const toSend = pick(res, 'statusCode', 'headers');
        toSend.responseTime = (new Date()).getTime() - startTime;
        toSend.content = resc;
        if (typeof parser === 'function') {
          try {
            toSend.parsed = parser(resc);
          } catch (er) {
            toSend.parseError = er;
          }
        }
        cb(null, toSend);
      }
      res.on('error', respond);
      res.on('end', respond);
    });
    req.once('error', reject);
    if (payload !== undefined) {
      payload = stringify(payload);
      req.end(payload);
    } else {
      req.end();
    }
    return undefined;
  });
}

export default request;
