/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Provider } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CustomsService } from 'fxa-shared/nestjs/customs/customs.service';
import { MozLoggerService } from 'fxa-shared/nestjs/logger/logger.service';

import { AuthClientService } from '../backend/auth-client.service';
import { SessionResolver } from './session.resolver';

describe('SessionResolver', () => {
  let resolver: SessionResolver;
  let logger: any;
  let authClient: any;

  beforeEach(async () => {
    logger = {
      debug: jest.fn(),
      error: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
    };
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

  it('returns the session status', () => {
    const result = resolver.sessionStatus('42420000', 'verified');
    expect(result).toStrictEqual({ state: 'verified', uid: '42420000' });
  });

  it('reauthenticates a given session with auth-client', async () => {
    const headers = new Headers();
    const now = Date.now();
    const mockRespPayload = {
      clientMutationId: 'testid',
      uid: '1337',
      verified: true,
      authAt: now,
      metricsEnabled: true,
    };
    authClient.sessionReauthWithAuthPW = jest
      .fn()
      .mockResolvedValue(mockRespPayload);
    const result = await resolver.reauthSession(headers, {
      sessionToken: 'goodtoken',
      authPW: '00000000',
      email: 'testo@example.xyz',
      options: { service: 'testo-co' },
    });
    expect(authClient.sessionReauthWithAuthPW).toBeCalledTimes(1);
    expect(authClient.sessionReauthWithAuthPW).toBeCalledWith(
      'goodtoken',
      'testo@example.xyz',
      '00000000',
      { service: 'testo-co' },
      headers
    );
    expect(result).toStrictEqual(mockRespPayload);
  });

  it('resends a verify code through the auth-client', async () => {
    const sessionToken = 'goodtoken';
    const headers = new Headers();
    authClient.sessionResendVerifyCode = jest.fn().mockResolvedValue({});
    const result = await resolver.resendVerifyCode(sessionToken, headers, {
      clientMutationId: 'testid',
    });
    expect(authClient.sessionResendVerifyCode).toBeCalledTimes(1);
    expect(authClient.sessionResendVerifyCode).toBeCalledWith(
      'goodtoken',
      headers
    );
    expect(result).toStrictEqual({
      clientMutationId: 'testid',
    });
  });

  it('verifies a OTP code', async () => {
    const token = 'totallylegit';
    const headers = new Headers();
    const mockRespPayload = {};
    authClient.sessionVerifyCode = jest.fn().mockResolvedValue(mockRespPayload);
    const result = await resolver.verifyCode(token, headers, {
      clientMutationId: 'testid',
      code: '00000000',
      options: { service: 'testo-co' },
    });
    expect(authClient.sessionVerifyCode).toBeCalledTimes(1);
    expect(authClient.sessionVerifyCode).toBeCalledWith(
      token,
      '00000000',
      { service: 'testo-co' },
      headers
    );
    expect(result).toStrictEqual({
      clientMutationId: 'testid',
    });
  });

  it('consumes a backup authentication (recovery) code', async () => {
    const token = 'totallylegit';
    const mockRespPayload = { remaining: 3 };
    authClient.consumeRecoveryCode = jest
      .fn()
      .mockResolvedValue(mockRespPayload);
    const result = await resolver.consumeRecoveryCode(token, {
      clientMutationId: 'testid',
      code: '00000000',
    });
    expect(authClient.consumeRecoveryCode).toBeCalledTimes(1);
    expect(authClient.consumeRecoveryCode).toBeCalledWith(token, '00000000');
    expect(result).toStrictEqual({
      clientMutationId: 'testid',
      ...mockRespPayload,
    });
  });
});
