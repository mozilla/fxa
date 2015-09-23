/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */


var request = require('request');

var config = require('../config');

var API_KEY = config.get('basket.api_key');
var API_URL = config.get('basket.api_url');
var API_TIMEOUT = config.get('basket.api_timeout');


// Send a request to the Basket backend
module.exports.request = function basketRequest(path, method, params, done) {
  var req = request({
    url: API_URL + path,
    //strictSSL: true,
    method: method,
    timeout: API_TIMEOUT,
    headers: {
      'X-API-Key': API_KEY
    },
    form: params
  }, done);

  return req;
};


// Error codes are defined in:
// https://github.com/mozilla/basket-client/blob/master/basket/errors.py
module.exports.errors = {
  NETWORK_FAILURE: 1,
  INVALID_EMAIL: 2,
  UNKNOWN_EMAIL: 3,
  UNKNOWN_TOKEN: 4,
  USAGE_ERROR: 5,
  EMAIL_PROVIDER_AUTH_FAILURE: 6,
  AUTH_ERROR: 7,
  SSL_REQUIRED: 8,
  INVALID_NEWSLETTER: 9,
  INVALID_LANGUAGE: 10,
  EMAIL_NOT_CHANGED: 11,
  CHANGE_REQUEST_NOT_FOUND: 12,

  // If you get this, report it as a bug so we can add a more specific
  // error code.
  UNKNOWN_ERROR: 99
};


module.exports.errorResponse = function errorResponse(desc, code) {
  // Format from
  // https://basket.readthedocs.org/en/latest/newsletter_api.html
  return {
    status: 'error',
    desc: String(desc),
    code: code || module.exports.errors.UNKNOWN_ERROR
  };
};
