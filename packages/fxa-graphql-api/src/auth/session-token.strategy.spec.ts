/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { UnauthorizedException } from '@nestjs/common';
import { ExtendedError } from 'fxa-shared/nestjs/error';

const mockSession = {
  SessionToken: {
    findByTokenId: jest.fn(),
  },
};
const mockAuthClient = {
  deriveHawkCredentials: jest.fn(),
};

jest.mock('fxa-auth-client', () => mockAuthClient);
jest.mock('fxa-shared/db/models/auth/session-token', () => mockSession);

// eslint-disable-next-line import/first
import { SessionTokenStrategy } from './session-token.strategy';

describe('SessionTokenStrategy', () => {
  let strategy: SessionTokenStrategy;

  beforeEach(async () => {
    jest.clearAllMocks();
    strategy = new SessionTokenStrategy();
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  it('returns the session status', async () => {
    mockSession.SessionToken.findByTokenId.mockResolvedValue({
      tokenVerified: true,
    });
    mockAuthClient.deriveHawkCredentials.mockResolvedValue({ id: 'testid' });
    const result = await strategy.validate('DEADC0DE');
    expect(result).toStrictEqual({
      token: 'DEADC0DE',
      session: { tokenVerified: true },
    });
  });

  it('throws unauthorized for a malformed token', async () => {
    mockSession.SessionToken.findByTokenId.mockResolvedValue(undefined);
    mockAuthClient.deriveHawkCredentials.mockResolvedValue({ id: 'testid' });
    await expect(strategy.validate('token')).rejects.toThrowError(
      new UnauthorizedException('Invalid token')
    );
  });

  it('throws unauthorized for an invalid token', async () => {
    mockSession.SessionToken.findByTokenId.mockResolvedValue(undefined);
    mockAuthClient.deriveHawkCredentials.mockResolvedValue({ id: 'testid' });
    await expect(strategy.validate('DEADC0DE')).rejects.toThrowError(
      new UnauthorizedException('Invalid token')
    );
  });

  it('throws unauthorized when mustVerify is not met', async () => {
    mockSession.SessionToken.findByTokenId.mockResolvedValue({
      mustVerify: true,
      tokenVerified: false,
      emailVerified: true,
    });
    mockAuthClient.deriveHawkCredentials.mockResolvedValue({ id: 'testid' });
    await expect(strategy.validate('DEADC0DE')).rejects.toThrowError(
      new UnauthorizedException('Must verify')
    );
  });

  it('throws unexpected', async () => {
    mockSession.SessionToken.findByTokenId.mockResolvedValue({
      tokenVerified: false,
    });
    mockAuthClient.deriveHawkCredentials.mockRejectedValue(
      new Error('unauthorized')
    );
    await expect(strategy.validate('DEADC0DE')).rejects.toThrowError(
      ExtendedError.withCause(
        'Unexpected error during authentication.',
        new Error('unauthorized')
      )
    );
  });
});
