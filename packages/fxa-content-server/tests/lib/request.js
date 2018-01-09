/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var nodeXMLHttpRequest = require('xmlhttprequest');

function request(uri, method, jsonPayload, headers) {
  return new Promise(function (resolve, reject) {
    var xhr = new nodeXMLHttpRequest.XMLHttpRequest();
    var payload;

    xhr.open(method, uri);
    xhr.onerror = function onerror() {
      resolve(xhr.responseText);
    };
    xhr.onload = function onload() {
      var result;
      try {
        result = JSON.parse(xhr.responseText);
      } catch (e) {
        return reject(e);
      }
      if (result.error) {
        return reject(result.error);
      }

      resolve(result);
    };

    for (var headerName in headers) {
      xhr.setRequestHeader(headerName, headers[headerName]);
    }

    if (jsonPayload) {
      payload = JSON.stringify(jsonPayload);
      xhr.setRequestHeader('Content-Type', 'application/json');
    }

    xhr.send(payload);
  });
}

module.exports = request;
