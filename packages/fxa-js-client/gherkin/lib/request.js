define(['./hawk', '../../components/p/p'], function (hawk, p) {
  'use strict';
  /* global XMLHttpRequest */

  function defaultXhrFactory () { return new XMLHttpRequest(); }

  function Request (baseUri, xhrFactory) {
    this.baseUri = baseUri;
    this.xhr = xhrFactory || defaultXhrFactory;
  }

  Request.prototype.send = function request(path, method, credentials, jsonPayload) {
    var deferred = p.defer();
    var xhr = this.xhr();
    var uri = this.baseUri + path;
    var payload;

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
        return deferred.reject(result);
      }
      deferred.resolve(result);
    };

    // calculate Hawk header if credentials are supplied
    if (credentials) {
      var header = hawk.client.header(uri, method, {
                          credentials: credentials,
                          payload: payload
                        });
      xhr.setRequestHeader("authorization", header.field);
    }

    xhr.setRequestHeader("Content-Type", "application/json");

    xhr.send(payload);

    return deferred.promise;
  };

  return Request;

});
