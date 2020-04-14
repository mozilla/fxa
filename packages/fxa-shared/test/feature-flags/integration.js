/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');

describe('featureFlags integration:', () => {
  let config, log, featureFlags;

  before(() => {
    config = {
      interval: 10000,
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      maxConnections: process.env.REDIS_POOL_MAX_CONNECTIONS || 1,
      minConnections: process.env.REDIS_POOL_MIN_CONNECTIONS || 1,
    };
    log = { info() {}, warn() {}, error() {} };
    featureFlags = require('../../feature-flags')(config, log, {});
  });

  after(() => featureFlags.terminate());

  describe('get:', () => {
    let result;

    before(async () => {
      result = await featureFlags.get();
    });

    it('returned an object', () => {
      assert.isObject(result);
    });
  });
});
