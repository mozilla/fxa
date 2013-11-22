define(['./lib/request', './vendor/sjcl', '../components/p/p'], function (Request, sjcl, p) {
  'use strict';

  function str2hex(str) {
    return sjcl.codec.hex.fromBits(sjcl.codec.utf8String.toBits(str));
  }

  function FxAccountClient(uri, config) {
    if (typeof uri !== 'string') {
      config = uri || {};
      uri = config.uri;
    }
    this.request = new Request(uri, config.xhr);
  }

  FxAccountClient.prototype.proxiedSignUp = function(email, password) {
    return this.request.send("/raw_password/account/create", "POST", null, {
      email: str2hex(email),
      password: password
    });
  };

  FxAccountClient.prototype.proxiedSignIn = function(email, password) {
    return this.request.send("/raw_password/session/create", "POST", null, {
      email: str2hex(email),
      password: password
    });
  };

  return FxAccountClient;
});
