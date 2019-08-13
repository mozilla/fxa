/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const hawk = require('./hawk');
const ERRORS = require('./errors');
/* global XMLHttpRequest */

/**
 * @class Request
 * @constructor
 * @param {String} baseUri Base URI
 * @param {Object} xhr XMLHttpRequest constructor
 * @param {Object} [options={}] Options
 *   @param {Number} [options.localtimeOffsetMsec]
 *   Local time offset with the remote auth server's clock
 */
function Request(baseUri, xhr, options) {
  if (!options) {
    options = {};
  }
  this.baseUri = baseUri;
  this._localtimeOffsetMsec = options.localtimeOffsetMsec;
  this.xhr = xhr || XMLHttpRequest;
  this.timeout = options.timeout || 30 * 1000;
}

/**
 * @method send
 * @param {String} path Request path
 * @param {String} method HTTP Method
 * @param {Object} credentials HAWK Headers
 * @param {Object} jsonPayload JSON Payload
 * @param {Object} [options={}] Options
 *   @param {String} [options.retrying]
 *   Flag indicating if the request is a retry
 *   @param {Array} [options.headers]
 *   A set of extra headers to add to the request
 * @return {Promise} A promise that will be fulfilled with JSON `xhr.responseText` of the request
 */
Request.prototype.send = function request(
  path,
  method,
  credentials,
  jsonPayload,
  options
) {
  /*eslint complexity: [2, 8] */
  var xhr = new this.xhr();
  var uri = this.baseUri + path;
  var payload = null;
  var self = this;
  options = options || {};

  if (jsonPayload) {
    payload = JSON.stringify(jsonPayload);
  }

  try {
    xhr.open(method, uri);
  } catch (e) {
    return Promise.reject({
      error: 'Unknown error',
      message: e.toString(),
      errno: 999,
    });
  }

  return new Promise(function(resolve, reject) {
    xhr.timeout = self.timeout;
    // eslint-disable-next-line complexity
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        var result = xhr.responseText;
        try {
          result = JSON.parse(xhr.responseText);
        } catch (e) {}

        if (result.errno) {
          // Try to recover from a timeskew error and not already tried
          if (result.errno === ERRORS.INVALID_TIMESTAMP && !options.retrying) {
            var serverTime = result.serverTime;
            self._localtimeOffsetMsec =
              serverTime * 1000 - new Date().getTime();

            // add to options that the request is retrying
            options.retrying = true;

            return self
              .send(path, method, credentials, jsonPayload, options)
              .then(resolve, reject);
          } else {
            return reject(result);
          }
        }

        if (typeof xhr.status === 'undefined' || xhr.status !== 200) {
          if (result.length === 0) {
            return reject({ error: 'Timeout error', errno: 999 });
          } else {
            return reject({
              error: 'Unknown error',
              message: result,
              errno: 999,
              code: xhr.status,
            });
          }
        }

        resolve(result);
      }
    };

    // calculate Hawk header if credentials are supplied
    if (credentials) {
      var hawkHeader = hawk.client.header(uri, method, {
        credentials: credentials,
        payload: payload,
        contentType: 'application/json',
        localtimeOffsetMsec: self._localtimeOffsetMsec || 0,
      });
      xhr.setRequestHeader('authorization', hawkHeader.field);
    }

    xhr.setRequestHeader('Content-Type', 'application/json');

    if (options && options.headers) {
      // set extra headers for this request
      for (var header in options.headers) {
        xhr.setRequestHeader(header, options.headers[header]);
      }
    }

    xhr.send(payload);
  });
};

module.exports = Request;
