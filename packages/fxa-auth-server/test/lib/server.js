/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
const { default: Container } = require('typedi');
const sinon = require('sinon');

process.env.CONFIG_FILES = require.resolve('./oauth-test.json');
const { config } = require('../../config');
const version = config.get('apiVersion');
config.set('log.level', 'critical');
config.set('cloudTasks.oidc.aud', 'cloud-tasks');
config.set('cloudTasks.oidc.serviceAccountEmail', 'testo@iam.gcp.g.co');
const testConfig = config.getProperties();
const createServer = require('../../bin/key_server');
const { CapabilityService } = require('../../lib/payments/capability');

function wrapServer(server, close) {
  var wrap = {};
  function request(options) {
    return new Promise((resolve) => {
      resolve(server.inject(options));
    });
  }

  function opts(options) {
    if (typeof options === 'string') {
      options = { url: options };
    }
    return options;
  }

  wrap.post = function post(options) {
    options = opts(options);
    options.method = 'POST';
    return request(options);
  };

  wrap.get = function get(options) {
    options = opts(options);
    options.method = 'GET';
    return request(options);
  };

  wrap.delete = function _delete(options) {
    options = opts(options);
    options.method = 'DELETE';
    return request(options);
  };

  var api = {};
  Object.keys(wrap).forEach(function (key) {
    api[key] = function api(options) {
      options = opts(options);
      options.url = '/v' + version + options.url;
      return wrap[key](options);
    };
  });

  wrap.api = api;
  wrap.config = config;
  wrap.close = close;
  return wrap;
}

module.exports.start = async function () {
  if (!Container.has(CapabilityService)) {
    Container.set(CapabilityService, {
      subscriptionCapabilities: sinon.fake.resolves([]),
      determineClientVisibleSubscriptionCapabilities: sinon.fake.resolves(''),
    });
  }
  const { server, close } = await createServer(testConfig);
  return wrapServer(server, close);
};

module.exports.config = config;
