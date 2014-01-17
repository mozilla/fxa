/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern/node_modules/dojo/node!xmlhttprequest',
], function (nodeXMLHttpRequest) {
  'use strict';

  function request(uri, method, jsonPayload, cb) {
    var xhr = new nodeXMLHttpRequest.XMLHttpRequest();
    var payload;

    xhr.open(method, uri);
    xhr.onerror = function onerror() {
      cb(xhr.responseText);
    };
    xhr.onload = function onload() {
      var result;
      try {
        result = JSON.parse(xhr.responseText);
      } catch (e) {
        return cb(e);
      }
      if (result.error) {
        return cb(result.error);
      }
      cb(null, result);
    };

    if (jsonPayload) {
      payload = JSON.stringify(jsonPayload);
      xhr.setRequestHeader('Content-Type', 'application/json');
    }

    xhr.send(payload);
  }

  return request;
});
