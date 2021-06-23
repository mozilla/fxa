/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const initialise = require('fxa-shared/feature-flags').default;

describe('featureFlags integration:', () => {
  let config, log, featureFlags;

  before(() => {
    config = {
      interval: 10000,
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
    };
    log = { info() {}, warn() {}, error() {} };
    featureFlags = initialise(config, log, {});
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
