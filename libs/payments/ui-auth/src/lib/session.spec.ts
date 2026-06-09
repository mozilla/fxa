/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

jest.mock('./auth', () => ({
  getAuthInstance: jest.fn(),
}));

import { getAuthInstance } from './auth';
import { UnauthenticatedError } from './auth.error';
import {
  getSessionEmail,
  getSessionUid,
  requireSessionUid,
} from './session';

const mockGetAuthInstance = getAuthInstance as jest.MockedFunction<
  typeof getAuthInstance
>;

function mockSession(session: unknown) {
  mockGetAuthInstance.mockReturnValue({
    auth: jest.fn().mockResolvedValue(session),
  } as unknown as ReturnType<typeof getAuthInstance>);
}

describe('session helpers', () => {
  describe('getSessionUid', () => {
    it('returns the uid when present on the session', async () => {
      mockSession({ user: { id: 'uid-123', email: 'user@example.com' } });
      await expect(getSessionUid()).resolves.toBe('uid-123');
    });

    it('returns undefined when the session is null', async () => {
      mockSession(null);
      await expect(getSessionUid()).resolves.toBeUndefined();
    });
  });

  describe('requireSessionUid', () => {
    it('returns the uid when present', async () => {
      mockSession({ user: { id: 'uid-456' } });
      await expect(requireSessionUid()).resolves.toBe('uid-456');
    });

    it('throws UnauthenticatedError when the uid is missing', async () => {
      mockSession(null);
      await expect(requireSessionUid()).rejects.toBeInstanceOf(
        UnauthenticatedError
      );
    });
  });

  describe('getSessionEmail', () => {
    it('returns the email when present on the session', async () => {
      mockSession({ user: { id: 'uid-789', email: 'user@example.com' } });
      await expect(getSessionEmail()).resolves.toBe('user@example.com');
    });

    it('returns undefined when the email is missing', async () => {
      mockSession({ user: { id: 'uid-789' } });
      await expect(getSessionEmail()).resolves.toBeUndefined();
    });

    it('returns undefined when the session itself is null', async () => {
      mockSession(null);
      await expect(getSessionEmail()).resolves.toBeUndefined();
    });
  });
});
