/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';

const mockSession = {
  SessionToken: {
    findByTokenId: jest.fn(),
  },
};
jest.mock('fxa-shared/db/models/auth/session-token', () => mockSession);

// eslint-disable-next-line import/first
import { UnverifiedSessionGuard } from './unverified-session-guard';

describe('SessionTokenStrategy', () => {
  const fakeToken =
    '1111111111111111111111111111111111111111111111111111111111111111';
  let guard: UnverifiedSessionGuard;

  beforeEach(async () => {
    jest.clearAllMocks();
    guard = new UnverifiedSessionGuard();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('extracts token', () => {
    const req = {
      headers: {
        authorization: `Bearer ${fakeToken}`,
      },
    };
    const result = guard.extractSessionToken(req);
    expect(result).toEqual(fakeToken);
  });

  it('rejects if authorization header is missing', () => {
    const headers = { headers: {} };
    expect(() => guard.extractSessionToken(headers)).toThrowError(
      UnauthorizedException
    );
  });

  it('rejects if authorization header is missing bearer prefix', () => {
    const req = {
      headers: {
        authorization: `${fakeToken}`,
      },
    };
    expect(() => guard.extractSessionToken(req)).toThrowError(
      UnauthorizedException
    );
  });

  it('rejects if authorization header contains invalid token', () => {
    const req = {
      headers: {
        authorization: 'Bearer FOOOO',
      },
    };
    expect(() => guard.extractSessionToken(req)).toThrowError(
      UnauthorizedException
    );
  });

  it('returns existing session token', async () => {
    mockSession.SessionToken.findByTokenId.mockResolvedValue({
      tokenId: 'fake',
    });
    const result = await guard.resolveSessionToken(fakeToken);
    expect(result).toEqual({
      tokenId: 'fake',
    });
  });

  it('rejects if session token cannot be found', async () => {
    mockSession.SessionToken.findByTokenId.mockResolvedValue(null);
    await expect(async () => {
      await guard.resolveSessionToken(fakeToken);
    }).rejects.toThrow(UnauthorizedException);
  });

  it('can activate', async () => {
    jest.spyOn(guard, 'getRequest').mockImplementation(() => {
      return {
        user: {},
        headers: {
          authorization: `Bearer ${fakeToken}`,
        },
      };
    });

    mockSession.SessionToken.findByTokenId.mockResolvedValue({
      tokenId: 'fake',
    });

    expect(
      await guard.canActivate({} as unknown as ExecutionContext)
    ).toBeTruthy();
  });
});
