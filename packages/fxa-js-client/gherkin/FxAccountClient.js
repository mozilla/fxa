define([], function () {
  'use strict';

  function FxAccountClient() {
    this.awesome = true;
  }

  FxAccountClient.prototype.isAwesome = function() {
    return this.awesome;
  };

  return FxAccountClient;
});
