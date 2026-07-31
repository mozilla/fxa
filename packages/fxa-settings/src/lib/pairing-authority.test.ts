/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { firefox } from './channels/firefox';
import { Constants } from './constants';
import {
  getPairingAuthorityAccount,
  getPairingChannelId,
  isPairingTotpVerified,
  markPairingTotpVerified,
  resetPairingTotpVerified,
} from './pairing-authority';

jest.mock('./channels/firefox', () => ({
  firefox: {
    requestSignedInUser: jest.fn(),
  },
}));

const mockRequestSignedInUser = firefox.requestSignedInUser as jest.Mock;

const MOCK_CHANNEL_ID = '1c2d3e4f5a6b7c8d';
const MOCK_ACCOUNT = {
  email: 'johndope@example.com',
  sessionToken: 'a'.repeat(64),
  uid: 'f9416ce3703e4916a4cd6b1e665a3f1a',
  verified: true,
};

describe('getPairingAuthorityAccount', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('asks the browser for the pairing account over the WebChannel', async () => {
    mockRequestSignedInUser.mockResolvedValue(MOCK_ACCOUNT);

    await getPairingAuthorityAccount();

    expect(mockRequestSignedInUser).toHaveBeenCalledWith(
      Constants.OAUTH_CONTEXT,
      true,
      Constants.SYNC_SERVICE
    );
  });

  it('returns the account the browser reports', async () => {
    mockRequestSignedInUser.mockResolvedValue(MOCK_ACCOUNT);

    await expect(getPairingAuthorityAccount()).resolves.toEqual(MOCK_ACCOUNT);
  });

  it('returns undefined when the browser has no signed-in account', async () => {
    mockRequestSignedInUser.mockResolvedValue(undefined);

    await expect(getPairingAuthorityAccount()).resolves.toBeUndefined();
  });

  it('returns undefined when the browser account has no session token', async () => {
    mockRequestSignedInUser.mockResolvedValue({
      ...MOCK_ACCOUNT,
      sessionToken: undefined,
    });

    await expect(getPairingAuthorityAccount()).resolves.toBeUndefined();
  });

  it('returns undefined when the WebChannel request rejects', async () => {
    mockRequestSignedInUser.mockRejectedValue(new Error('no WebChannel'));

    await expect(getPairingAuthorityAccount()).resolves.toBeUndefined();
  });
});

describe('pairing TOTP verification state', () => {
  beforeEach(() => {
    resetPairingTotpVerified();
  });

  it('is not verified before a code is accepted', () => {
    expect(isPairingTotpVerified(MOCK_CHANNEL_ID)).toBe(false);
  });

  it('is verified for the channel the code was accepted for', () => {
    markPairingTotpVerified(MOCK_CHANNEL_ID);

    expect(isPairingTotpVerified(MOCK_CHANNEL_ID)).toBe(true);
  });

  it('is not verified for a different pairing channel', () => {
    markPairingTotpVerified(MOCK_CHANNEL_ID);

    expect(isPairingTotpVerified('9f8e7d6c5b4a3210')).toBe(false);
  });

  // A pairing without a channel id can't be replayed across channels, and
  // requiring one here would bounce the approval page back to the prompt
  // forever. The in-memory, per-page-load guarantee still holds.
  it('is verified for a pairing with no channel id once a code is accepted', () => {
    markPairingTotpVerified('');

    expect(isPairingTotpVerified('')).toBe(true);
  });

  it('is not verified for a pairing with no channel id before a code is accepted', () => {
    expect(isPairingTotpVerified('')).toBe(false);
  });
});

describe('getPairingChannelId', () => {
  it('reads channel_id from the query string', () => {
    window.history.pushState(
      {},
      '',
      `/pair/auth/allow?channel_id=${MOCK_CHANNEL_ID}`
    );

    expect(getPairingChannelId()).toBe(MOCK_CHANNEL_ID);
  });

  it('returns an empty string when channel_id is absent', () => {
    window.history.pushState({}, '', '/pair/auth/allow');

    expect(getPairingChannelId()).toBe('');
  });

  it('ignores a channel_id in the hash, which is supplicant-only', () => {
    window.history.pushState(
      {},
      '',
      `/pair/auth/allow#channel_id=${MOCK_CHANNEL_ID}`
    );

    expect(getPairingChannelId()).toBe('');
  });
});
