/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { UnauthorizedException } from '@nestjs/common';
import { ExtendedError } from 'fxa-shared/nestjs/error';

let mockSession = {
  sessionTokenData: jest.fn(),
};
let mockAuthClient = {
  deriveHawkCredentials: jest.fn(),
};
jest.mock('fxa-auth-client', () => mockAuthClient);
jest.mock('fxa-shared/db/models/auth', () => mockSession);

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
    mockSession.sessionTokenData.mockResolvedValue({ tokenVerified: true });
    mockAuthClient.deriveHawkCredentials.mockResolvedValue({ id: 'testid' });
    const result = await strategy.validate('token');
    expect(result).toStrictEqual({
      token: 'token',
      session: { tokenVerified: true },
    });
  });

  it('throws unauthorized', async () => {
    mockSession.sessionTokenData.mockResolvedValue(undefined);
    mockAuthClient.deriveHawkCredentials.mockResolvedValue({ id: 'testid' });
    await expect(strategy.validate('token')).rejects.toThrowError(
      new UnauthorizedException('Invalid token')
    );
  });

  it('throws unexpected', async () => {
    mockSession.sessionTokenData.mockResolvedValue({ tokenVerified: false });
    mockAuthClient.deriveHawkCredentials.mockRejectedValue('unauthorized');
    await expect(strategy.validate('token')).rejects.toThrowError(
      ExtendedError.withCause(
        'Unexpected error during authentication.',
        new Error('unauthorized')
      )
    );
  });
});
