/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
'use strict';

const { assert } = require('chai');
const proxyquire = require('proxyquire');

const ROOT_DIR = '../../..';

describe('Config', () => {
  describe('NODE_ENV=prod', () => {
    let originalEnv;

    function mockEnv(key, value) {
      originalEnv[key] = process.env[key];
      process.env[key] = value;
    }

    beforeEach(() => {
      originalEnv = {};
      mockEnv('NODE_ENV', 'prod');
    });

    afterEach(() => {
      for (const key in originalEnv) {
        process.env[key] = originalEnv[key];
      }
    });

    it('errors when secret settings have their default values', () => {
      assert.throws(() => {
        proxyquire(`${ROOT_DIR}/config`, {});
      }, /Config \'[a-zA-Z.]+\' must be set in production/);
    });

    it('succeeds when secret settings have all been configured', () => {
      mockEnv('PUSHBOX_KEY', 'production secret here');
      mockEnv('FLOW_ID_KEY', 'production secret here');
      mockEnv('OAUTH_SERVER_SECRET_KEY', 'production secret here');
      mockEnv(
        'PROFILE_SERVER_AUTH_SECRET_BEARER_TOKEN',
        'production secret here'
      );
      assert.doesNotThrow(() => {
        proxyquire(`${ROOT_DIR}/config`, {});
      });
    });
  });
});
