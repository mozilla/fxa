define(['./lib/hawk', './vendor/sjcl'], function (hawk, sjcl) {
  'use strict';

  function FxAccountClient() {
    this.awesome = true;
    this.hawkHeaderVersion = hawk.crypto.headerVersion;
    this.sjcl = sjcl;
  }

  FxAccountClient.prototype.isAwesome = function() {
    return this.awesome;
  };

  return FxAccountClient;
});
