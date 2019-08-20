var util = require('util');

var FxAccountClient = require('../client/FxAccountClient.js');

function NodeFxAccountClient(uri, config) {
  if (!(this instanceof FxAccountClient)) {
    return new NodeFxAccountClient(uri, config);
  }

  if (typeof uri !== 'string') {
    config = uri || {};
    uri = config.uri;
  }
  if (typeof config === 'undefined') {
    config = {};
  }

  if (!config.xhr) {
    config.xhr = require('xhr2');
  }

  FxAccountClient.call(this, uri, config);
}

NodeFxAccountClient.VERSION = FxAccountClient.VERSION;

module.exports = NodeFxAccountClient;
util.inherits(NodeFxAccountClient, FxAccountClient);
