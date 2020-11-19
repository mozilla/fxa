/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { SessionTokenStrategy } from './session-token.strategy';
import { UnauthorizedException } from '@nestjs/common';
import { ExtendedError } from 'fxa-shared/nestjs/error';

describe('SessionTokenStrategy', () => {
  let strategy: SessionTokenStrategy;
  let authClient: any;

  beforeEach(async () => {
    authClient = {};
    strategy = new SessionTokenStrategy(authClient);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  it('returns the session status', async () => {
    authClient.sessionStatus = jest.fn().mockResolvedValue('sessiondata');
    const result = await strategy.validate('token');
    expect(result).toStrictEqual({ token: 'token', session: 'sessiondata' });
  });

  it('throws unauthorized', async () => {
    authClient.sessionStatus = jest
      .fn()
      .mockRejectedValue({ code: 400, message: 'unauthorized' });
    await expect(strategy.validate('token')).rejects.toThrowError(
      new UnauthorizedException('unauthorized')
    );
  });

  it('throws unexpected', async () => {
    authClient.sessionStatus = jest
      .fn()
      .mockRejectedValue({ message: 'unauthorized' });
    await expect(strategy.validate('token')).rejects.toThrowError(
      ExtendedError.withCause(
        'Unexpected error during authentication.',
        new Error('unauthorized')
      )
    );
  });
});
