/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { renderHook } from '@testing-library/react';
import React from 'react';
import type AuthClient from 'fxa-auth-client/browser';
import { hexToUint8 } from 'fxa-auth-client/lib/utils';
import { useFinishOAuthFlowHandler } from './hooks';
import {
  AppContext,
  IntegrationType,
  type AppContextValue,
  type OAuthIntegration,
} from '../../models';
import { mockAppContext } from '../../models/mocks';
import { SensitiveData, SensitiveDataClient } from '../sensitive-data-client';
import { createEncryptedBundle } from '../crypto/scoped-keys';
import { Constants } from '../constants';

jest.mock('../crypto/scoped-keys', () => ({
  __esModule: true,
  createEncryptedBundle: jest.fn(),
}));

const UID = 'uid-123';
const SESSION_TOKEN = 'session-token';
const KA = 'cd'.repeat(32);
const KB = 'ab'.repeat(32);
const CLIENT_ID = 'client-id';
const OAUTH_STATE = 'state-value';

type MockAuthClient = jest.Mocked<
  Pick<AuthClient, 'accountKeys' | 'getOAuthScopedKeyData' | 'createOAuthCode'>
>;

const buildAuthClient = (): MockAuthClient =>
  ({
    accountKeys: jest.fn(),
    getOAuthScopedKeyData: jest
      .fn()
      .mockResolvedValue({ [Constants.OAUTH_OLDSYNC_SCOPE]: { id: 'key' } }),
    createOAuthCode: jest.fn().mockResolvedValue({
      code: 'oauth-code',
      state: OAUTH_STATE,
      redirect: 'https://redirect.example/callback',
      scope: Constants.OAUTH_OLDSYNC_SCOPE,
    }),
  }) as MockAuthClient;

const buildIntegration = (wantsKeys: () => boolean) =>
  ({
    type: IntegrationType.OAuthNative,
    isSync: () => true,
    wantsKeys,
    getNormalizedScope: () => '',
    data: { clientId: CLIENT_ID, state: OAUTH_STATE, keysJwk: 'jwk-data' },
    clientInfo: { redirectUri: 'https://redirect.example/callback' },
  }) as unknown as OAuthIntegration;

let sensitiveDataClient: SensitiveDataClient;

const wrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(
    AppContext.Provider,
    { value: mockAppContext({ sensitiveDataClient }) as AppContextValue },
    children
  );

beforeEach(() => {
  jest.clearAllMocks();
  sensitiveDataClient = new SensitiveDataClient();
  (createEncryptedBundle as jest.Mock).mockResolvedValue('encrypted-jwe');
});

describe('useFinishOAuthFlowHandler with a supplied kB', () => {
  it('skips accountKeys, derives keys_jwe via getOAuthScopedKeyData, and returns the OAuth code', async () => {
    const authClient = buildAuthClient();
    const integration = buildIntegration(() => true);
    const { result } = renderHook(
      () =>
        useFinishOAuthFlowHandler(
          authClient as unknown as AuthClient,
          integration
        ),
      { wrapper }
    );

    const response = await result.current.finishOAuthFlowHandler(
      UID,
      SESSION_TOKEN,
      undefined,
      undefined,
      KB
    );

    expect(authClient.accountKeys).not.toHaveBeenCalled();
    expect(authClient.getOAuthScopedKeyData).toHaveBeenCalledWith(
      SESSION_TOKEN,
      CLIENT_ID,
      Constants.OAUTH_OLDSYNC_SCOPE
    );
    expect(response.code).toBe('oauth-code');
  });

  it('does not attach kB to a pending passkey wrap for the same account', async () => {
    sensitiveDataClient.setDataType(SensitiveData.Key.PasskeyWrap, {
      uid: UID,
      credentialId: 'cred-id',
      mfaToken: 'mfa-token',
      prfOut: new Uint8Array(1),
    });
    const authClient = buildAuthClient();
    const integration = buildIntegration(() => true);
    const { result } = renderHook(
      () =>
        useFinishOAuthFlowHandler(
          authClient as unknown as AuthClient,
          integration
        ),
      { wrapper }
    );

    await result.current.finishOAuthFlowHandler(
      UID,
      SESSION_TOKEN,
      undefined,
      undefined,
      KB
    );

    expect(
      sensitiveDataClient.getDataType(SensitiveData.Key.PasskeyWrap)
    ).toEqual({
      uid: UID,
      credentialId: 'cred-id',
      mfaToken: 'mfa-token',
      prfOut: new Uint8Array(1),
    });
  });

  it('skips all key derivation when the integration does not want keys', async () => {
    const authClient = buildAuthClient();
    const integration = buildIntegration(() => false);
    const { result } = renderHook(
      () =>
        useFinishOAuthFlowHandler(
          authClient as unknown as AuthClient,
          integration
        ),
      { wrapper }
    );

    await result.current.finishOAuthFlowHandler(
      UID,
      SESSION_TOKEN,
      undefined,
      undefined,
      KB
    );

    expect(authClient.accountKeys).not.toHaveBeenCalled();
    expect(authClient.getOAuthScopedKeyData).not.toHaveBeenCalled();
    const [, , , opts] = authClient.createOAuthCode.mock.calls[0];
    expect(opts?.keys_jwe).toBeUndefined();
  });
});

describe('useFinishOAuthFlowHandler deriving kB from a key fetch', () => {
  const KEY_FETCH_TOKEN = 'key-fetch-token';
  const UNWRAP_B_KEY = 'unwrap-b-key';

  it('attaches the derived kB to a pending passkey wrap for the same account', async () => {
    sensitiveDataClient.setDataType(SensitiveData.Key.PasskeyWrap, {
      uid: UID,
      credentialId: 'cred-id',
      mfaToken: 'mfa-token',
      prfOut: new Uint8Array(1),
    });
    const authClient = buildAuthClient();
    authClient.accountKeys.mockResolvedValue({ kA: KA, kB: KB });
    const integration = buildIntegration(() => true);
    const { result } = renderHook(
      () =>
        useFinishOAuthFlowHandler(
          authClient as unknown as AuthClient,
          integration
        ),
      { wrapper }
    );

    await result.current.finishOAuthFlowHandler(
      UID,
      SESSION_TOKEN,
      KEY_FETCH_TOKEN,
      UNWRAP_B_KEY
    );

    expect(authClient.accountKeys).toHaveBeenCalledWith(
      KEY_FETCH_TOKEN,
      UNWRAP_B_KEY
    );
    expect(
      sensitiveDataClient.getDataType(SensitiveData.Key.PasskeyWrap)
    ).toEqual({
      uid: UID,
      credentialId: 'cred-id',
      mfaToken: 'mfa-token',
      prfOut: new Uint8Array(1),
      kB: hexToUint8(KB),
    });
  });

  it('leaves a pending passkey wrap for a different account unchanged', async () => {
    sensitiveDataClient.setDataType(SensitiveData.Key.PasskeyWrap, {
      uid: 'other-uid',
      credentialId: 'cred-id',
      mfaToken: 'mfa-token',
      prfOut: new Uint8Array(1),
    });
    const authClient = buildAuthClient();
    authClient.accountKeys.mockResolvedValue({ kA: KA, kB: KB });
    const integration = buildIntegration(() => true);
    const { result } = renderHook(
      () =>
        useFinishOAuthFlowHandler(
          authClient as unknown as AuthClient,
          integration
        ),
      { wrapper }
    );

    await result.current.finishOAuthFlowHandler(
      UID,
      SESSION_TOKEN,
      KEY_FETCH_TOKEN,
      UNWRAP_B_KEY
    );

    expect(
      sensitiveDataClient.getDataType(SensitiveData.Key.PasskeyWrap)
    ).toEqual({
      uid: 'other-uid',
      credentialId: 'cred-id',
      mfaToken: 'mfa-token',
      prfOut: new Uint8Array(1),
    });
  });
});
