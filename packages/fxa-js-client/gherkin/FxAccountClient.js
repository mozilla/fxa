define(['./lib/hawk'], function (hawk) {
  'use strict';

  function FxAccountClient() {
    this.awesome = true;
    this.hawkHeaderVersion = hawk.crypto.headerVersion;
  }

  FxAccountClient.prototype.isAwesome = function() {
    return this.awesome;
  };

  return FxAccountClient;
});
