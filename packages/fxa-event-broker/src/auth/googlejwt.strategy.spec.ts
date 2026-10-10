/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { GoogleJwtStrategy } from './googlejwt.strategy';

describe('GoogleJwtStrategy', () => {
  const claim = { email: 'pubsub@example.com' } as any;
  let strategy: GoogleJwtStrategy;
  let done: jest.Mock;

  beforeEach(() => {
    const config = {
      get: () => ({ audience: 'example.com', verificationToken: 'abc123' }),
    } as unknown as ConfigService;
    strategy = new GoogleJwtStrategy(config);
    done = jest.fn();
  });

  it('accepts the claim when the verification token matches', () => {
    strategy.validate({ query: { token: 'abc123' } } as any, claim, done);
    expect(done).toHaveBeenCalledWith(null, claim);
  });

  it('rejects a wrong verification token', () => {
    strategy.validate({ query: { token: 'wrong' } } as any, claim, done);
    expect(done).toHaveBeenCalledWith(expect.any(UnauthorizedException), null);
  });

  it('rejects a missing verification token', () => {
    strategy.validate({ query: {} } as any, claim, done);
    expect(done).toHaveBeenCalledWith(expect.any(UnauthorizedException), null);
  });
});
