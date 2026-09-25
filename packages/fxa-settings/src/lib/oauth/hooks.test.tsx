/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { renderHook } from '@testing-library/react';
import AuthClient from 'fxa-auth-client/browser';
import { useFinishOAuthFlowHandler } from './hooks';
import { AppContext, IntegrationType } from '../../models';
import type { AppContextValue, Integration } from '../../models';
import { mockAppContext } from '../../models/mocks';
import { SensitiveDataClient } from '../sensitive-data-client';
import { createEncryptedBundle } from '../crypto/scoped-keys';

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
});
