/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { GoogleJwtAuthGuard } from './google-jwt-auth.guard';

describe('GoogleJwtAuthGuard', () => {
  const context = {} as ExecutionContext;
  let passportCanActivate: jest.SpyInstance;

  const makeGuard = (authenticate: boolean) =>
    new GoogleJwtAuthGuard({
      get: () => ({ authenticate }),
    } as unknown as ConfigService);

  beforeEach(() => {
    passportCanActivate = jest
      .spyOn(Object.getPrototypeOf(GoogleJwtAuthGuard.prototype), 'canActivate')
      .mockResolvedValue(false);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('allows the request without Passport when authentication is off', () => {
    expect(makeGuard(false).canActivate(context)).toBe(true);
    expect(passportCanActivate).not.toHaveBeenCalled();
  });

  it('returns the Passport result when authentication is on', async () => {
    await expect(makeGuard(true).canActivate(context)).resolves.toBe(false);
    expect(passportCanActivate).toHaveBeenCalledWith(context);
  });
});
