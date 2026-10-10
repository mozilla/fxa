/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  resolvePasskeyService,
  shouldRequestWrapMaterial,
  type PasskeySignInIntegration,
} from './signin-flow';
import { IntegrationType } from '../../models';
import { OAuthNativeServices } from '@fxa/accounts/oauth';

describe('resolvePasskeyService', () => {
  const make = (overrides: {
    isSync?: () => boolean;
    getService?: () => string | undefined;
    getClientId?: () => string | undefined;
    type?: IntegrationType;
  }) =>
    ({
      isSync: () => false,
      getService: () => undefined,
      getClientId: () => undefined,
      type: IntegrationType.OAuthNative,
      ...overrides,
    }) as unknown as PasskeySignInIntegration;

  it('resolves to sync for a Sync integration when getService() is undefined', () => {
    expect(
      resolvePasskeyService(
        make({ isSync: () => true, getService: () => undefined })
      )
    ).toBe(OAuthNativeServices.Sync);
  });

  it('resolves to sync for a Sync integration when getService() returns sync', () => {
    expect(
      resolvePasskeyService(
        make({ isSync: () => true, getService: () => OAuthNativeServices.Sync })
      )
    ).toBe(OAuthNativeServices.Sync);
  });

  it('resolves to the Firefox service for a non-Sync Firefox service (vpn)', () => {
    expect(
      resolvePasskeyService(
        make({ isSync: () => false, getService: () => OAuthNativeServices.Vpn })
      )
    ).toBe(OAuthNativeServices.Vpn);
  });

  it('resolves to the client id for an OAuth integration with no Firefox service', () => {
    expect(
      resolvePasskeyService(
        make({
          isSync: () => false,
          getService: () => undefined,
          getClientId: () => 'client-id',
          type: IntegrationType.OAuthWeb,
        })
      )
    ).toBe('client-id');
  });

  it('resolves to undefined for a non-OAuth Web integration with no Firefox service', () => {
    expect(
      resolvePasskeyService(
        make({
          isSync: () => false,
          getService: () => undefined,
          getClientId: () => 'client-id',
          type: IntegrationType.Web,
        })
      )
    ).toBeUndefined();
  });
});

describe('shouldRequestWrapMaterial', () => {
  const desktopSync = (
    overrides: Partial<Record<string, unknown>> = {}
  ): PasskeySignInIntegration =>
    ({
      type: IntegrationType.OAuthNative,
      isSync: () => true,
      isFirefoxMobileClient: () => false,
      ...overrides,
    }) as unknown as PasskeySignInIntegration;

  const enabled = { passkeyPasswordlessSyncEnabled: true };

  it('requests it for a desktop Sync sign-in that needs keys', () => {
    expect(shouldRequestWrapMaterial(desktopSync(), enabled, true)).toBe(true);
  });

  it('withholds it when the feature flag is off', () => {
    expect(
      shouldRequestWrapMaterial(
        desktopSync(),
        { passkeyPasswordlessSyncEnabled: false },
        true
      )
    ).toBe(false);
    expect(shouldRequestWrapMaterial(desktopSync(), undefined, true)).toBe(
      false
    );
  });

  // No password step means no client-side kB, so there is nothing to wrap.
  it('withholds it when the sign-in needs no keys', () => {
    expect(shouldRequestWrapMaterial(desktopSync(), enabled, false)).toBe(
      false
    );
  });

  it('withholds it for a non-OAuth-native integration', () => {
    expect(
      shouldRequestWrapMaterial(
        desktopSync({ type: IntegrationType.SyncDesktopV3 }),
        enabled,
        true
      )
    ).toBe(false);
  });

  it('withholds it for a Firefox service that is not Sync', () => {
    expect(
      shouldRequestWrapMaterial(
        desktopSync({ isSync: () => false }),
        enabled,
        true
      )
    ).toBe(false);
  });

  // Mobile opens a stored wrap; only the offer to create one is desktop-only.
  it('requests it on a mobile client', () => {
    expect(
      shouldRequestWrapMaterial(
        desktopSync({ isFirefoxMobileClient: () => true }),
        enabled,
        true
      )
    ).toBe(true);
  });
});
