/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern/node_modules/dojo/node!xmlhttprequest',
  'intern/node_modules/dojo/Deferred'
], function (nodeXMLHttpRequest, Deferred) {
  'use strict';

  function request(uri, method, jsonPayload) {
    var dfd = new Deferred();
    var xhr = new nodeXMLHttpRequest.XMLHttpRequest();
    var payload;

    xhr.open(method, uri);
    xhr.onerror = function onerror() {
      dfd.resolve(xhr.responseText);
    };
    xhr.onload = function onload() {
      var result;
      try {
        result = JSON.parse(xhr.responseText);
      } catch (e) {
        return dfd.reject(e);
      }
      if (result.error) {
        return dfd.reject(result.error);
      }
      dfd.resolve(result);
    };

    if (jsonPayload) {
      payload = JSON.stringify(jsonPayload);
      xhr.setRequestHeader('Content-Type', 'application/json');
    }

    xhr.send(payload);

    return dfd.promise;
  }

  return request;
});
