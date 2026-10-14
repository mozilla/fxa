/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  decryptRecoveryKeyData,
  getRecoveryKeyIdByUid,
} from 'fxa-auth-client/lib/recoveryKey';
import { createRecoveryKeyWithReauth } from './recovery-key';
import { AuthUiErrors } from './auth-errors/auth-errors';
import { MOCK_EMAIL, MOCK_UID } from '../pages/mocks';

const MOCK_SESSION_TOKEN = 'sessionToken';
const MOCK_JWT = 'recoveryKeyJwt';
const MOCK_EMAILS = { primary: MOCK_EMAIL, original: MOCK_EMAIL };

const mockAuthClient = {
  accountEmails: jest.fn(),
  sessionReauth: jest.fn(),
  sessionReauthWithAuthPW: jest.fn(),
  accountKeys: jest.fn(),
  createRecoveryKey: jest.fn(),
  createRecoveryKeyWithJwt: jest.fn(),
};

const withPassword = { password: 'password' };
const withAuthPW = {
  email: MOCK_EMAIL,
  authPW: 'authPW',
  unwrapBKey: 'storedUnwrapBKey',
};

describe('createRecoveryKeyWithReauth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuthClient.accountEmails.mockResolvedValue(MOCK_EMAILS);
    mockAuthClient.sessionReauth.mockResolvedValue({
      keyFetchToken: 'reauthKeyFetchToken',
      unwrapBKey: 'reauthUnwrapBKey',
    });
    mockAuthClient.sessionReauthWithAuthPW.mockResolvedValue({
      keyFetchToken: 'reauthKeyFetchToken',
    });
    mockAuthClient.accountKeys.mockResolvedValue({ kA: 'kA', kB: 'kB' });
    mockAuthClient.createRecoveryKey.mockResolvedValue({});
    mockAuthClient.createRecoveryKeyWithJwt.mockResolvedValue({});
  });

  it('reauths with the password against the account emails', async () => {
    await createRecoveryKeyWithReauth(mockAuthClient, {
      uid: MOCK_UID,
      sessionToken: MOCK_SESSION_TOKEN,
      credentials: withPassword,
    });

    expect(mockAuthClient.sessionReauth).toHaveBeenCalledWith(
      MOCK_SESSION_TOKEN,
      MOCK_EMAILS,
      'password',
      { keys: true, reason: 'recovery_key' }
    );
    expect(mockAuthClient.accountKeys).toHaveBeenCalledWith(
      'reauthKeyFetchToken',
      'reauthUnwrapBKey'
    );
  });

  it('reauths with authPW and uses the supplied unwrapBKey', async () => {
    await createRecoveryKeyWithReauth(mockAuthClient, {
      uid: MOCK_UID,
      sessionToken: MOCK_SESSION_TOKEN,
      credentials: withAuthPW,
    });

    expect(mockAuthClient.sessionReauthWithAuthPW).toHaveBeenCalledWith(
      MOCK_SESSION_TOKEN,
      { primary: MOCK_EMAIL },
      'authPW',
      { keys: true, reason: 'recovery_key' }
    );
    expect(mockAuthClient.accountEmails).not.toHaveBeenCalled();
    expect(mockAuthClient.accountKeys).toHaveBeenCalledWith(
      'reauthKeyFetchToken',
      'storedUnwrapBKey'
    );
  });

  it('stores the key with the session token and returns the matching key', async () => {
    const recoveryKey = await createRecoveryKeyWithReauth(mockAuthClient, {
      uid: MOCK_UID,
      sessionToken: MOCK_SESSION_TOKEN,
      credentials: withPassword,
    });

    const expectedId = await getRecoveryKeyIdByUid(recoveryKey, MOCK_UID);
    expect(mockAuthClient.createRecoveryKey).toHaveBeenCalledWith(
      MOCK_SESSION_TOKEN,
      expectedId,
      expect.any(String),
      true,
      false
    );
    expect(mockAuthClient.createRecoveryKeyWithJwt).not.toHaveBeenCalled();
  });

  it('encrypts the account keys into the recovery data', async () => {
    const recoveryKey = await createRecoveryKeyWithReauth(mockAuthClient, {
      uid: MOCK_UID,
      sessionToken: MOCK_SESSION_TOKEN,
      credentials: withPassword,
    });

    const [, , recoveryData] = mockAuthClient.createRecoveryKey.mock.calls[0];
    expect(
      await decryptRecoveryKeyData(recoveryKey, recoveryData, MOCK_UID)
    ).toEqual({ kA: 'kA', kB: 'kB' });
  });

  it('stores the key with the MFA JWT and passes replaceKey', async () => {
    const recoveryKey = await createRecoveryKeyWithReauth(mockAuthClient, {
      uid: MOCK_UID,
      sessionToken: MOCK_SESSION_TOKEN,
      credentials: withPassword,
      replaceKey: true,
      mfaJwt: MOCK_JWT,
    });

    const expectedId = await getRecoveryKeyIdByUid(recoveryKey, MOCK_UID);
    expect(mockAuthClient.createRecoveryKeyWithJwt).toHaveBeenCalledWith(
      MOCK_JWT,
      expectedId,
      expect.any(String),
      true,
      true
    );
    expect(mockAuthClient.createRecoveryKey).not.toHaveBeenCalled();
  });

  it('rejects with the auth-server error when reauth fails', async () => {
    mockAuthClient.sessionReauth.mockRejectedValue(
      AuthUiErrors.INCORRECT_PASSWORD
    );

    await expect(
      createRecoveryKeyWithReauth(mockAuthClient, {
        uid: MOCK_UID,
        sessionToken: MOCK_SESSION_TOKEN,
        credentials: withPassword,
      })
    ).rejects.toBe(AuthUiErrors.INCORRECT_PASSWORD);
    expect(mockAuthClient.createRecoveryKey).not.toHaveBeenCalled();
  });

  it('rejects without storing a key when reauth returns no keyFetchToken', async () => {
    mockAuthClient.sessionReauthWithAuthPW.mockResolvedValue({});

    await expect(
      createRecoveryKeyWithReauth(mockAuthClient, {
        uid: MOCK_UID,
        sessionToken: MOCK_SESSION_TOKEN,
        credentials: withAuthPW,
      })
    ).rejects.toThrow('Reauth returned no keyFetchToken or unwrapBKey');
    expect(mockAuthClient.accountKeys).not.toHaveBeenCalled();
    expect(mockAuthClient.createRecoveryKey).not.toHaveBeenCalled();
  });
});
