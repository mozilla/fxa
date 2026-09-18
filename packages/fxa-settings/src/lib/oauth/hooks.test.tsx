/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { renderHook } from '@testing-library/react';
import AuthClient from 'fxa-auth-client/browser';
import { stashKbForPendingWrap, useFinishOAuthFlowHandler } from './hooks';
import { AppContext, IntegrationType } from '../../models';
import type { AppContextValue, Integration } from '../../models';
import { mockAppContext } from '../../models/mocks';
import { SensitiveDataClient } from '../sensitive-data-client';

jest.mock('../crypto/scoped-keys', () => ({
  createEncryptedBundle: jest.fn().mockResolvedValue('keys-jwe'),
}));

const UID = '11111111222222223333333344444444';
const OTHER_UID = 'ffffffff222222223333333344444444';
const KB_HEX = '0a'.repeat(32);
const KB_BYTES = new Uint8Array(32).fill(0x0a);

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

const finish = async () => {
  const { result } = renderHook(
    () => useFinishOAuthFlowHandler(authClient, syncIntegration()),
    { wrapper }
  );
  return result.current.finishOAuthFlowHandler(
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

describe('stashKbForPendingWrap', () => {
  it('adds kB as bytes to a pending wrap for the same account', () => {
    sensitiveDataClient.PasskeyWrapData = pendingWrap();

    stashKbForPendingWrap(sensitiveDataClient, UID, KB_HEX);

    expect(sensitiveDataClient.PasskeyWrapData).toEqual({
      ...pendingWrap(),
      kB: KB_BYTES,
    });
  });

  it('zeroes a kB already held before replacing it', () => {
    const superseded = new Uint8Array(32).fill(7);
    sensitiveDataClient.PasskeyWrapData = {
      ...pendingWrap(),
      kB: superseded,
    };

    stashKbForPendingWrap(sensitiveDataClient, UID, KB_HEX);

    expect(superseded).toEqual(new Uint8Array(32));
    expect(sensitiveDataClient.PasskeyWrapData?.kB).toEqual(KB_BYTES);
  });

  it('leaves a pending wrap for a different account untouched', () => {
    sensitiveDataClient.PasskeyWrapData = pendingWrap(OTHER_UID);

    stashKbForPendingWrap(sensitiveDataClient, UID, KB_HEX);

    expect(sensitiveDataClient.PasskeyWrapData).toEqual(pendingWrap(OTHER_UID));
  });

  it('stores nothing when no ceremony asked for kB', () => {
    stashKbForPendingWrap(sensitiveDataClient, UID, KB_HEX);

    expect(sensitiveDataClient.PasskeyWrapData).toBeUndefined();
  });
});

// Wiring only: the branches live in the block above. Without this, deleting the
// call from the hook leaves `kB` unstashed and every test above still passing.
describe('useFinishOAuthFlowHandler password-free passkey opt-in material', () => {
  it('hands kB to a ceremony waiting on this account', async () => {
    sensitiveDataClient.PasskeyWrapData = pendingWrap();

    const result = await finish();

    expect(result.error).toBeUndefined();
    expect(sensitiveDataClient.PasskeyWrapData?.kB).toEqual(KB_BYTES);
  });
});
