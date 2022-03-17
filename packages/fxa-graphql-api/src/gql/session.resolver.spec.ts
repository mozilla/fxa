/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Provider } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CustomsService } from 'fxa-shared/nestjs/customs/customs.service';
import { MozLoggerService } from 'fxa-shared/nestjs/logger/logger.service';

import { AuthClientService } from '../backend/auth-client.service';
import { SessionResolver } from './session.resolver';

describe('AccountResolver', () => {
  let resolver: SessionResolver;
  let logger: any;
  let authClient: any;

  beforeEach(async () => {
    logger = { debug: jest.fn(), error: jest.fn(), info: jest.fn() };
    const MockMozLogger: Provider = {
      provide: MozLoggerService,
      useValue: logger,
    };
    const MockMetricsFactory: Provider = {
      provide: 'METRICS',
      useFactory: () => undefined,
    };
    authClient = {};
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionResolver,
        MockMozLogger,
        MockMetricsFactory,
        { provide: CustomsService, useValue: {} },
        { provide: AuthClientService, useValue: authClient },
      ],
    }).compile();

    resolver = module.get<SessionResolver>(SessionResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  it('destroys the session', async () => {
    authClient.sessionDestroy = jest.fn().mockResolvedValue(true);
    const result = await resolver.destroySession('token', {
      clientMutationId: 'testid',
    });
    expect(authClient.sessionDestroy).toBeCalledTimes(1);
    expect(result).toStrictEqual({ clientMutationId: 'testid' });
  });

  it('returns the session verified', () => {
    const result = resolver.session('uid', 'verified');
    expect(result).toStrictEqual({ verified: true });
  });
});
