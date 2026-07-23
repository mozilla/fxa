/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { renderHook, waitFor } from '@testing-library/react';
import * as ModelsModule from '../../models';
import { useSigninAvatar } from './useSigninAvatar';

jest.mock('../../models', () => ({
  useAuthClient: jest.fn(),
  useConfig: jest.fn(),
}));

const CLIENT_ID = 'ea3ca969f8c6bb0d';
const SESSION_TOKEN = 'deadbeef';
const mockCreateOAuthToken = jest.fn();

const mockConfig = {
  servers: { profile: { url: 'http://localhost:1111' } },
  oauth: { clientId: CLIENT_ID },
};

beforeEach(() => {
  jest.resetAllMocks();
  mockCreateOAuthToken.mockResolvedValue({ access_token: 'access-token' });
  (ModelsModule.useAuthClient as jest.Mock).mockReturnValue({
    createOAuthToken: mockCreateOAuthToken,
  });
  (ModelsModule.useConfig as jest.Mock).mockReturnValue(mockConfig);
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: () =>
      Promise.resolve({ id: 'avatar-id', url: 'https://example.com/a.png' }),
  }) as jest.Mock;
});

describe('useSigninAvatar', () => {
  it('mints a profile:avatar token tagged exclude_dau when a session exists', async () => {
    renderHook(() => useSigninAvatar(SESSION_TOKEN));

    await waitFor(() =>
      expect(mockCreateOAuthToken).toHaveBeenCalledWith(
        SESSION_TOKEN,
        CLIENT_ID,
        expect.objectContaining({ scope: 'profile:avatar', exclude_dau: true })
      )
    );
  });

  it('does not mint a token when there is no session', async () => {
    const { result } = renderHook(() => useSigninAvatar(undefined));

    await waitFor(() => expect(result.current.avatarLoading).toBe(false));
    expect(mockCreateOAuthToken).not.toHaveBeenCalled();
  });
});
