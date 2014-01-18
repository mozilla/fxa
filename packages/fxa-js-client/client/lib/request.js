/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
define(['./hawk', '../../components/p/p'], function (hawk, p) {
  'use strict';
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
  function Request (baseUri, xhr, options) {
    if (!options) {
      options = {};
    }
    this.baseUri = baseUri;
    this._localtimeOffsetMsec = options.localtimeOffsetMsec;
    this.xhr = xhr || XMLHttpRequest;
  }

  /**
   * @method send
   * @param {String} path Request path
   * @param {String} method HTTP Method
   * @param {Object} credentials HAWK Headers
   * @param {Object} jsonPayload JSON Payload
   * @param {Boolean} retrying Flag indicating if the request is a retry
   * @return {Promise} A promise that will be fulfilled with JSON `xhr.responseText` of the request
   */
  Request.prototype.send = function request(path, method, credentials, jsonPayload, retrying) {
    var deferred = p.defer();
    var xhr = new this.xhr();
    var uri = this.baseUri + path;
    var payload;
    var self = this;

    if (jsonPayload) {
      payload = JSON.stringify(jsonPayload);
    }

    xhr.open(method, uri);
    xhr.onerror = function onerror() {
      deferred.reject(xhr.responseText);
    };
    xhr.onload = function onload() {
      var result = JSON.parse(xhr.responseText);
      if (result.error) {
        // Try to recover from a timeskew error
        if (result.errno === 111 && !retrying) {
          var serverTime = Date.parse(xhr.getResponseHeader('Date'));
          self._localtimeOffsetMsec = serverTime - new Date();
          return self.send(path, method, credentials, jsonPayload, true)
            .then(deferred.resolve, deferred.reject);

        } else {
          return deferred.reject(result);
        }
      }
      deferred.resolve(result);
    };

    // calculate Hawk header if credentials are supplied
    if (credentials) {
      var header = hawk.client.header(uri, method, {
                          credentials: credentials,
                          payload: payload,
                          contentType: 'application/json',
                          localtimeOffsetMsec: this._localtimeOffsetMsec || 0
                        });
      xhr.setRequestHeader('authorization', header.field);
    }

    xhr.setRequestHeader('Content-Type', 'application/json');

    xhr.send(payload);

    return deferred.promise;
  };

  return Request;

});
