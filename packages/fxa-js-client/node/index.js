'use strict';

const amd = require('./amd-loader');
const sjcl = require('sjcl');
const util = require('util');

const FxAccountClient = amd(__dirname + '/../client/FxAccountClient.js', {
  'es6-promise': 'es6-promise',
});

function NodeFxAccountClient(uri, config) {
  if (!(this instanceof FxAccountClient)) {
    return new NodeFxAccountClient(sjcl, uri, config);
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

  FxAccountClient.call(this, sjcl, uri, config);
}

NodeFxAccountClient.VERSION = FxAccountClient.VERSION;

module.exports = NodeFxAccountClient;
util.inherits(NodeFxAccountClient, FxAccountClient);
