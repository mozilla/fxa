/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { renderHook } from '@testing-library/react';
import AuthClient from 'fxa-auth-client/browser';
import { useFinishOAuthFlowHandler, useOAuthKeysCheck } from './hooks';
import { AppContext, IntegrationType } from '../../models';
import type { AppContextValue, Integration } from '../../models';
import { mockAppContext } from '../../models/mocks';
import { SensitiveDataClient } from '../sensitive-data-client';
import { integrationNeedsPermissions } from './permissions';
import { OAUTH_ERRORS } from './oauth-errors';
import { AuthUiErrors } from '../auth-errors/auth-errors';
import { Constants } from '../constants';
import { createEncryptedBundle } from '../crypto/scoped-keys';

jest.mock('./permissions', () => ({
  integrationNeedsPermissions: jest.fn(),
}));
jest.mock('../crypto/scoped-keys', () => ({
  createEncryptedBundle: jest.fn().mockResolvedValue('keys-jwe'),
}));

const UID = '11111111222222223333333344444444';
const KB_HEX = '0a'.repeat(32);
const KB_BUFFER = new Uint8Array(32).fill(0x0a);

const authClient = {
  accountKeys: jest.fn(),
  getOAuthScopedKeyData: jest.fn(),
  createOAuthCode: jest.fn(),
} as unknown as AuthClient;

const syncIntegration = () =>
  ({
    type: IntegrationType.OAuthNative,
    data: {
      clientId: 'client-id',
      state: 'state',
      keysJwk: 'jwk',
      service: 'sync',
    },
    clientInfo: { redirectUri: 'https://rp.example/redirect' },
    wantsKeys: () => true,
    getNormalizedScope: () => 'profile',
    isSync: () => true,
  }) as unknown as Integration;

let sensitiveDataClient: SensitiveDataClient;
const wrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(
    AppContext.Provider,
    { value: mockAppContext({ sensitiveDataClient } as AppContextValue) },
    children
  );

const pendingWrap = (uid = UID) => ({
  uid,
  credentialId: 'credential',
  mfaToken: 'mfa-token',
  prfOut: new Uint8Array(32).fill(3),
});

const finish = async (knownKb?: string) => {
  const { result } = renderHook(
    () => useFinishOAuthFlowHandler(authClient, syncIntegration()),
    { wrapper }
  );
  return knownKb
    ? result.current.finishOAuthFlowHandler(
        UID,
        'session-token',
        undefined,
        undefined,
        knownKb
      )
    : result.current.finishOAuthFlowHandler(
        UID,
        'session-token',
        'key-fetch-token',
        'unwrap-b-key'
      );
};

beforeEach(() => {
  jest.clearAllMocks();
  sensitiveDataClient = new SensitiveDataClient();
  (authClient.accountKeys as jest.Mock).mockResolvedValue({ kB: KB_HEX });
  (authClient.getOAuthScopedKeyData as jest.Mock).mockResolvedValue({
    'https://identity.mozilla.com/apps/oldsync': {},
  });
  (authClient.createOAuthCode as jest.Mock).mockResolvedValue({
    code: 'code',
    state: 'state',
    redirect: 'https://rp.example/redirect',
    scope: 'profile',
  });
});

describe('useFinishOAuthFlowHandler', () => {
  describe('password-free passkey opt-in material', () => {
    it('hands kB to a ceremony waiting on this account', async () => {
      sensitiveDataClient.PasskeyWrapData = pendingWrap();

      const result = await finish();

      expect(result.error).toBeUndefined();
      expect(sensitiveDataClient.PasskeyWrapData?.kB).toEqual(KB_BUFFER);
    });
  });

  describe('with a supplied kB', () => {
    it('skips accountKeys and still derives keys_jwe for the OAuth code', async () => {
      const result = await finish(KB_HEX);

      expect(result.error).toBeUndefined();
      expect(authClient.accountKeys).not.toHaveBeenCalled();
      expect(authClient.getOAuthScopedKeyData).toHaveBeenCalledWith(
        'session-token',
        'client-id',
        'https://identity.mozilla.com/apps/oldsync'
      );
      expect(authClient.createOAuthCode).toHaveBeenCalledWith(
        'session-token',
        'client-id',
        'state',
        expect.objectContaining({ keys_jwe: 'keys-jwe' })
      );
      // The bundle mock answers the same for any input, so the supplied `kB`
      // reaching it unaltered is the only thing separating this from a wrong
      // or stale key sealing the same bundle.
      expect(createEncryptedBundle).toHaveBeenCalledWith(
        KB_HEX,
        UID,
        expect.anything(),
        expect.anything()
      );
    });

    it('leaves a pending wrap for the same account without kB', async () => {
      sensitiveDataClient.PasskeyWrapData = pendingWrap();

      await finish(KB_HEX);

      expect(sensitiveDataClient.PasskeyWrapData).toEqual(pendingWrap());
    });
  });

  describe('permissions gate', () => {
    const mockIntegrationNeedsPermissions =
      integrationNeedsPermissions as jest.Mock;

    const finishWebFlow = (options?: { skipPermissions?: boolean }) => {
      const integration = {
        type: IntegrationType.OAuthWeb,
        data: { clientId: '325b4083e32fe8e7', state: 'state' },
        clientInfo: { redirectUri: 'https://rp.example/callback' },
        wantsKeys: () => false,
        getNormalizedScope: () => 'profile',
      } as unknown as Integration;
      const { result } = renderHook(
        () => useFinishOAuthFlowHandler(authClient, integration, options),
        { wrapper }
      );
      return result.current.finishOAuthFlowHandler(UID, 'session-token');
    };

    beforeEach(() => {
      mockIntegrationNeedsPermissions.mockReturnValue(true);
      window.history.replaceState({}, '', '/signup?client_id=325b4083e32fe8e7');
    });

    it('diverts to the permissions screen without creating a code', async () => {
      const result = await finishWebFlow();

      expect(result.error).toBeUndefined();
      expect(result.redirect).toBe(
        '/signin_permissions?client_id=325b4083e32fe8e7'
      );
      expect(authClient.createOAuthCode).not.toHaveBeenCalled();
    });

    it('completes the flow when the screen has shown the permissions', async () => {
      const result = await finishWebFlow({ skipPermissions: true });

      expect(authClient.createOAuthCode).toHaveBeenCalled();
      expect(result.redirect).toBe(
        'https://rp.example/callback?code=code&state=state'
      );
    });
  });
});

const webIntegration = () =>
  ({
    type: IntegrationType.OAuthWeb,
    data: { clientId: 'client-id', state: 'state' },
    clientInfo: { redirectUri: 'https://rp.example/callback' },
    wantsKeys: () => false,
    getNormalizedScope: () => 'profile',
  }) as unknown as Integration;

const withData = (integration: Integration, data: object) =>
  ({
    ...integration,
    data: { ...integration.data, ...data },
  }) as Integration;

const finishWith = async (integration: Integration) => {
  (integrationNeedsPermissions as jest.Mock).mockReturnValue(false);
  const { result } = renderHook(
    () => useFinishOAuthFlowHandler(authClient, integration),
    { wrapper }
  );
  return result.current.finishOAuthFlowHandler(
    UID,
    'session-token',
    'key-fetch-token',
    'unwrap-b-key'
  );
};

describe('useFinishOAuthFlowHandler OAuth data check', () => {
  const oAuthDataError = (integration: Integration) =>
    renderHook(() => useFinishOAuthFlowHandler(authClient, integration), {
      wrapper,
    }).result.current.oAuthDataError;

  it('reports no error for complete OAuth data', () => {
    expect(oAuthDataError(webIntegration())).toBeNull();
  });

  it.each([
    [
      'redirect URI',
      { ...webIntegration(), clientInfo: {} } as Integration,
      OAUTH_ERRORS.INCORRECT_REDIRECT.errno,
    ],
    [
      'client ID',
      withData(webIntegration(), { clientId: undefined }),
      OAUTH_ERRORS.UNKNOWN_CLIENT.errno,
    ],
    [
      'state',
      withData(webIntegration(), { state: undefined }),
      OAUTH_ERRORS.INVALID_PARAMETER.errno,
    ],
  ])('reports a missing %s', (_, integration, errno) => {
    expect(oAuthDataError(integration)?.errno).toBe(errno);
  });
});

describe('useFinishOAuthFlowHandler keys', () => {
  it('fetches key data for the URL scope when present', async () => {
    await finishWith(withData(syncIntegration(), { scope: 'raw-scope' }));

    expect(authClient.getOAuthScopedKeyData).toHaveBeenCalledWith(
      'session-token',
      'client-id',
      'profile'
    );
  });

  it('falls back to the oldsync scope for native flows without one', async () => {
    await finishWith(syncIntegration());

    expect(authClient.getOAuthScopedKeyData).toHaveBeenCalledWith(
      'session-token',
      'client-id',
      Constants.OAUTH_OLDSYNC_SCOPE
    );
  });

  it('resolves to TRY_AGAIN when the account keys fetch fails', async () => {
    (authClient.accountKeys as jest.Mock).mockRejectedValue(new Error());

    const result = await finishWith(syncIntegration());

    expect(result.error?.errno).toBe(OAUTH_ERRORS.TRY_AGAIN.errno);
    expect(authClient.createOAuthCode).not.toHaveBeenCalled();
  });
});

describe('useFinishOAuthFlowHandler OAuth code errors', () => {
  it.each([
    'UNVERIFIED_SESSION',
    'TOTP_REQUIRED',
    'INSUFFICIENT_ACR_VALUES',
  ] as const)('passes %s through to the caller', async (name) => {
    const error = { errno: AuthUiErrors[name].errno };
    (authClient.createOAuthCode as jest.Mock).mockRejectedValue(error);

    const result = await finishWith(webIntegration());

    expect(result.error).toBe(error);
  });

  it('maps any other error to TRY_AGAIN', async () => {
    (authClient.createOAuthCode as jest.Mock).mockRejectedValue({
      errno: AuthUiErrors.INCORRECT_PASSWORD.errno,
    });

    const result = await finishWith(webIntegration());

    expect(result.error?.errno).toBe(OAUTH_ERRORS.TRY_AGAIN.errno);
  });
});

describe('useFinishOAuthFlowHandler redirect and state', () => {
  beforeEach(() => {
    (authClient.createOAuthCode as jest.Mock).mockResolvedValue({
      code: 'code',
      state: 'response-state',
      redirect: 'https://server.example/redirect',
      scope: 'profile',
    });
  });

  it('returns the web channel redirect and integration state for Sync', async () => {
    const result = await finishWith(
      withData(syncIntegration(), { state: 'integration-state' })
    );

    expect(result.redirect).toBe(Constants.OAUTH_WEBCHANNEL_REDIRECT);
    expect(result.state).toBe('integration-state');
  });

  it('builds the redirect from the relier redirect URI for other flows', async () => {
    const result = await finishWith(webIntegration());

    expect(result.redirect).toBe(
      'https://rp.example/callback?code=code&state=response-state'
    );
    expect(result.state).toBe('response-state');
  });
});

describe('useOAuthKeysCheck', () => {
  const integration = {
    type: IntegrationType.OAuthNative,
    requiresKeys: () => true,
  };

  it.each([
    ['key fetch token', undefined, 'unwrap-b-key'],
    ['unwrap key', 'key-fetch-token', undefined],
  ])('errors when the %s is absent', (_, keyFetchToken, unwrapBKey) => {
    expect(
      useOAuthKeysCheck(integration, keyFetchToken, unwrapBKey)
        .oAuthKeysCheckError
    ).toBe(OAUTH_ERRORS.TRY_AGAIN);
  });

  it('passes when both tokens are present', () => {
    expect(
      useOAuthKeysCheck(integration, 'key-fetch-token', 'unwrap-b-key')
        .oAuthKeysCheckError
    ).toBeNull();
  });

  it('stays silent for third-party auth without tokens', () => {
    expect(
      useOAuthKeysCheck(integration, undefined, undefined, true)
        .oAuthKeysCheckError
    ).toBeNull();
  });

  it('errors for Sync desktop v3 when keys are required but tokens are absent', () => {
    expect(
      useOAuthKeysCheck({ ...integration, type: IntegrationType.SyncDesktopV3 })
        .oAuthKeysCheckError
    ).toBe(OAUTH_ERRORS.TRY_AGAIN);
  });

  it('stays silent without tokens when keys are not required', () => {
    expect(
      useOAuthKeysCheck({ ...integration, requiresKeys: () => false })
        .oAuthKeysCheckError
    ).toBeNull();
  });
});
