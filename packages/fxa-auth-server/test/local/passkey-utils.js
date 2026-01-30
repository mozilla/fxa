/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const { isPasskeyFeatureEnabled } = require('../../lib/passkey-utils');
const { AppError } = require('@fxa/accounts/errors');

describe('passkey-utils', () => {
  describe('isPasskeyFeatureEnabled', () => {
    it('should return true when passkeys are enabled', () => {
      const config = {
        passkeys: {
          enabled: true,
        },
      };

      const result = isPasskeyFeatureEnabled(config);
      assert.equal(result, true, 'should return true when enabled');
    });

    it('should throw featureNotEnabled error when passkeys are disabled', () => {
      const config = {
        passkeys: {
          enabled: false,
        },
      };

      try {
        isPasskeyFeatureEnabled(config);
        assert.fail('should have thrown an error');
      } catch (error) {
        assert.equal(
          error.errno,
          AppError.featureNotEnabled().errno,
          'should throw featureNotEnabled error'
        );
        assert.equal(
          error.message,
          'Feature not enabled',
          'should have correct error message'
        );
      }
    });

    it('should throw featureNotEnabled error when config.passkeys.enabled is undefined', () => {
      const config = {
        passkeys: {},
      };

      try {
        isPasskeyFeatureEnabled(config);
        assert.fail('should have thrown an error');
      } catch (error) {
        assert.equal(
          error.errno,
          AppError.featureNotEnabled().errno,
          'should throw featureNotEnabled error'
        );
      }
    });
  });
});
