/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  isPasskeyAuthenticationEnabled,
  isPasskeyFeatureEnabled,
  isPasskeyRegistrationEnabled,
} from './passkey-utils';

describe('passkey-utils', () => {
  describe('isPasskeyFeatureEnabled', () => {
    it('should return true when passkeys are enabled', () => {
      const config = { passkeys: { enabled: true } };
      expect(isPasskeyFeatureEnabled(config)).toBe(true);
    });

    it('should throw featureNotEnabled error when passkeys are disabled', () => {
      const config = { passkeys: { enabled: false } };
      expect(() => isPasskeyFeatureEnabled(config)).toThrow(
        'Feature not enabled'
      );
    });

    it('should throw featureNotEnabled error when config.passkeys.enabled is undefined', () => {
      const config = { passkeys: {} };
      expect(() => isPasskeyFeatureEnabled(config)).toThrow(
        'Feature not enabled'
      );
    });
  });

  describe('isPasskeyRegistrationEnabled', () => {
    it('should return true when master and registration flags are both enabled', () => {
      const config = {
        passkeys: { enabled: true, registrationEnabled: true },
      };
      expect(isPasskeyRegistrationEnabled(config)).toBe(true);
    });

    it('should throw when master is enabled but registrationEnabled is false', () => {
      const config = {
        passkeys: { enabled: true, registrationEnabled: false },
      };
      expect(() => isPasskeyRegistrationEnabled(config)).toThrow(
        'Feature not enabled'
      );
    });

    it('should throw when master is disabled even if registrationEnabled is true', () => {
      const config = {
        passkeys: { enabled: false, registrationEnabled: true },
      };
      expect(() => isPasskeyRegistrationEnabled(config)).toThrow(
        'Feature not enabled'
      );
    });
  });

  describe('isPasskeyAuthenticationEnabled', () => {
    it('should return true when master and authentication flags are both enabled', () => {
      const config = {
        passkeys: { enabled: true, authenticationEnabled: true },
      };
      expect(isPasskeyAuthenticationEnabled(config)).toBe(true);
    });

    it('should throw when master is enabled but authenticationEnabled is false', () => {
      const config = {
        passkeys: { enabled: true, authenticationEnabled: false },
      };
      expect(() => isPasskeyAuthenticationEnabled(config)).toThrow(
        'Feature not enabled'
      );
    });

    it('should throw when master is disabled even if authenticationEnabled is true', () => {
      const config = {
        passkeys: { enabled: false, authenticationEnabled: true },
      };
      expect(() => isPasskeyAuthenticationEnabled(config)).toThrow(
        'Feature not enabled'
      );
    });
  });
});
