/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { default as Container } from 'typedi';
import sinon from 'sinon';

process.env.CONFIG_FILES = require.resolve('./oauth-test.json');
const { config } = require('../../config');
const version = config.get('apiVersion');
config.set('log.level', 'critical');
config.set('cloudTasks.oidc.aud', 'cloud-tasks');
config.set('cloudTasks.oidc.serviceAccountEmail', 'testo@iam.gcp.g.co');
const testConfig = config.getProperties();
const createServer = require('../../bin/key_server');
const { CapabilityService } = require('../../lib/payments/capability');

interface RequestOptions {
  url?: string;
  method?: string;
  [key: string]: any;
}

function wrapServer(server: any, close: () => Promise<void>) {
  const wrap: Record<string, any> = {};

  function request(options: RequestOptions) {
    return server.inject(options);
  }

  function opts(options: string | RequestOptions): RequestOptions {
    if (typeof options === 'string') {
      return { url: options };
    }
    return options;
  }

  wrap.post = function post(options: string | RequestOptions) {
    const resolved = opts(options);
    resolved.method = 'POST';
    return request(resolved);
  };

  wrap.get = function get(options: string | RequestOptions) {
    const resolved = opts(options);
    resolved.method = 'GET';
    return request(resolved);
  };

  wrap.delete = function _delete(options: string | RequestOptions) {
    const resolved = opts(options);
    resolved.method = 'DELETE';
    return request(resolved);
  };

  const api: Record<string, any> = {};
  Object.keys(wrap).forEach(function (key) {
    api[key] = function (options: string | RequestOptions) {
      const resolved = opts(options);
      resolved.url = '/v' + version + resolved.url;
      return wrap[key](resolved);
    };
  });

  wrap.api = api;
  wrap.config = config;
  wrap.close = close;
  return wrap;
}

export async function start() {
  if (!Container.has(CapabilityService)) {
    Container.set(CapabilityService, {
      subscriptionCapabilities: sinon.fake.resolves([]),
      determineClientVisibleSubscriptionCapabilities: sinon.fake.resolves(''),
    });
  }
  const { server, close } = await createServer(testConfig);
  return wrapServer(server, close);
}

export { config };
