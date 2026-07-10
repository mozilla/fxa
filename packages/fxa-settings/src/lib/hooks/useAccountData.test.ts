/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { renderHook, act } from '@testing-library/react';
import { useAccountData } from './useAccountData';
import { sessionToken as getSessionToken } from '../cache';

const mockSetAccountData = jest.fn();

jest.mock('../cache', () => ({ sessionToken: jest.fn() }));
jest.mock('../../models/contexts/AccountStateContext', () => ({
  useAccountState: () => ({ setAccountData: mockSetAccountData }),
}));
jest.mock('../config', () => ({
  oauth: { clientId: 'test' },
  servers: { profile: { url: 'http://localhost' } },
}));
jest.mock('@sentry/browser', () => ({ captureMessage: jest.fn() }));

const authClient = {
  account: jest.fn(),
  attachedClients: jest.fn(),
  createOAuthToken: jest.fn(),
} as any;

describe('useAccountData', () => {
  beforeEach(() => jest.clearAllMocks());

  it('starts with isLoading=true', () => {
    (getSessionToken as jest.Mock).mockReturnValue('tok');
    authClient.account.mockReturnValue(new Promise(() => {}));
    authClient.attachedClients.mockReturnValue(new Promise(() => {}));
    authClient.createOAuthToken.mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => useAccountData({ authClient }));
    expect(result.current.isLoading).toBe(true);
  });

  it('sets error when no session token', async () => {
    (getSessionToken as jest.Mock).mockReturnValue(null);
    let result: any;
    await act(async () => {
      ({ result } = renderHook(() => useAccountData({ authClient })));
    });
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error?.message).toBe('No session token available');
  });
});
