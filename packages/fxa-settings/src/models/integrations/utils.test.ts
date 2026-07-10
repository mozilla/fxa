/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { OAuthNativeServices } from '@fxa/accounts/oauth';
import { IntegrationType } from './integration';
import { isFirefoxService, resolveServiceOrClientId } from './utils';

const makeIntegration = (
  type: IntegrationType,
  service: string | undefined,
  clientId: string | undefined
) =>
  ({
    type,
    getService: () => service,
    getClientId: () => clientId,
  }) as Parameters<typeof resolveServiceOrClientId>[0];

describe('isFirefoxService', () => {
  it('should return true for OAuthNativeServices.Sync', () => {
    const result = isFirefoxService(OAuthNativeServices.Sync);
    expect(result).toBe(true);
  });

  it('should return true for OAuthNativeServices.Relay', () => {
    const result = isFirefoxService(OAuthNativeServices.Relay);
    expect(result).toBe(true);
  });

  it('should return true for OAuthNativeServices.SmartWindow', () => {
    const result = isFirefoxService(OAuthNativeServices.SmartWindow);
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

describe('resolveServiceOrClientId', () => {
  it('returns the service when getService() is a Firefox service (sync)', () => {
    expect(
      resolveServiceOrClientId(
        makeIntegration(
          IntegrationType.OAuthNative,
          OAuthNativeServices.Sync,
          'client-id'
        )
      )
    ).toBe(OAuthNativeServices.Sync);
  });

  it('returns the service when getService() is a Firefox service (vpn)', () => {
    expect(
      resolveServiceOrClientId(
        makeIntegration(
          IntegrationType.OAuthNative,
          OAuthNativeServices.Vpn,
          'client-id'
        )
      )
    ).toBe(OAuthNativeServices.Vpn);
  });

  it('returns the client id for an OAuth integration when getService() is undefined', () => {
    expect(
      resolveServiceOrClientId(
        makeIntegration(IntegrationType.OAuthWeb, undefined, 'client-id')
      )
    ).toBe('client-id');
  });

  it('returns the client id for an OAuth integration when getService() is not a Firefox service', () => {
    expect(
      resolveServiceOrClientId(
        makeIntegration(IntegrationType.OAuthWeb, 'monitor', 'client-id')
      )
    ).toBe('client-id');
  });

  it('returns undefined for an OAuth integration with no Firefox service and no client id', () => {
    expect(
      resolveServiceOrClientId(
        makeIntegration(IntegrationType.OAuthWeb, undefined, undefined)
      )
    ).toBeUndefined();
  });

  it('returns undefined for a non-OAuth integration when getService() is not a Firefox service', () => {
    expect(
      resolveServiceOrClientId(
        makeIntegration(IntegrationType.Web, undefined, 'client-id')
      )
    ).toBeUndefined();
  });
});
