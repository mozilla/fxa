var util = require('util');

var amd = require('./amd-loader');

var map = {
    sjcl: 'sjcl',
    p: 'p-promise'
};

var FxAccountClient = amd(__dirname + '/../client/FxAccountClient.js', map);

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
        config.xhr = require('xmlhttprequest').XMLHttpRequest;
    }

    FxAccountClient.call(this, uri, config);
}

NodeFxAccountClient.VERSION = FxAccountClient.VERSION;

module.exports = NodeFxAccountClient;
util.inherits(NodeFxAccountClient, FxAccountClient);
