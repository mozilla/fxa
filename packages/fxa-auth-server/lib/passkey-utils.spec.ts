/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { isPasskeyFeatureEnabled } from './passkey-utils';
import { AppError } from '@fxa/accounts/errors';

describe('passkey-utils', () => {
  describe('isPasskeyFeatureEnabled', () => {
    it('should return true when passkeys are enabled', () => {
      const config = { passkeys: { enabled: true } };
      const result = isPasskeyFeatureEnabled(config);
      expect(result).toBe(true);
    });

    it('should throw featureNotEnabled error when passkeys are disabled', () => {
      const config = { passkeys: { enabled: false } };
      try {
        isPasskeyFeatureEnabled(config);
        throw new Error('should have thrown an error');
      } catch (error: any) {
        expect(error.errno).toBe(AppError.featureNotEnabled().errno);
        expect(error.message).toBe('Feature not enabled');
      }
    });

    it('should throw featureNotEnabled error when config.passkeys.enabled is undefined', () => {
      const config = { passkeys: {} };
      try {
        isPasskeyFeatureEnabled(config);
        throw new Error('should have thrown an error');
      } catch (error: any) {
        expect(error.errno).toBe(AppError.featureNotEnabled().errno);
      }
    });
  });
});
