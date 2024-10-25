/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { OAuthNativeServices } from './oauth-native-integration';
import { isFirefoxService } from './utils';

describe('isFirefoxService', () => {
  it('should return true for OAuthNativeServices.Sync', () => {
    const result = isFirefoxService(OAuthNativeServices.Sync);
    expect(result).toBe(true);
  });

  it('should return true for OAuthNativeServices.Relay', () => {
    const result = isFirefoxService(OAuthNativeServices.Relay);
    expect(result).toBe(true);
  });

  it('should return false for a service that is not in OAuthNativeServices', () => {
    const result = isFirefoxService('testo');
    expect(result).toBe(false);
  });

  it('should return false for an empty string', () => {
    const result = isFirefoxService('');
    expect(result).toBe(false);
  });

  it('should return false for undefined service', () => {
    expect(isFirefoxService(undefined)).toBe(false);
  });
});
