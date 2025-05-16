/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Test, TestingModule } from '@nestjs/testing';
import { CustomsService } from './customs.service';
import { MozLoggerService } from '@fxa/shared/mozlog';
import { StatsD } from 'hot-shots';
import { RateLimit } from '../../../../../accounts/rate-limit/src';
import { ConfigService } from '@nestjs/config';
import * as superagent from 'superagent';
import { HttpException } from '@nestjs/common';

jest.mock('superagent', () => ({
  post: jest.fn()
}));

describe('Customs Service', () => {
  const mockConfig = new ConfigService({
    customsUrl: 'http://localhost:7000',
    l10n: {
      defaultLanguage: 'en',
      supportedLanguages: [
        'en', 'fr'
      ]
    }
  })
  const mockLogger = {
    debug: jest.fn(),
    warn: jest.fn(),
  };
  const mockStatsd = {
    increment: jest.fn(),
  };
  const mockRateLimit = {
    supportsAction: jest.fn(),
    skip: jest.fn(),
    check: jest.fn(),
  };
  const mockL10nTsFormatter = {
    format: jest.fn(),
  };

  let service: CustomsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: ConfigService, useValue: mockConfig },
        { provide: 'L10N_TS_FORMATTER', useValue: mockL10nTsFormatter },
        { provide: RateLimit, useValue: mockRateLimit },
        { provide: StatsD, useValue: mockStatsd },
        { provide: MozLoggerService, useValue: mockLogger },
        CustomsService
      ],
    }).compile();
    service = module.get<CustomsService>(CustomsService);

    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('for rate limit rule', () => {
    it('can call rate limiter when rate limit rule is defined', async () => {
      mockRateLimit.supportsAction.mockImplementation(() => true);
      await service.check({
        action: 'test',
        ip: '127.0.0.1',
      });

      expect(superagent.post).toBeCalledTimes(0)
      expect(mockRateLimit.check).toBeCalledTimes(1);
      expect(mockStatsd.increment).toBeCalledWith("customs.check.v2", ["action:test"]);
    });

    it('should throw too many requests error, when rate limit rule is defined', async () => {
      mockRateLimit.supportsAction.mockImplementation(() => true);
      mockRateLimit.check.mockImplementation(async (action) => {

        if (action === 'unblockEmail') {
          console.log('woo')
          return null;
        }

        return {
          retryAfter:100,
          block:true,
        }
      });

      let error:HttpException|undefined = undefined;
      try {
        await service.check({
          action: 'test',
          ip: '127.0.0.1',
          email: 'foo@mozilla.com',
          // Important! Trigger and check localized error message state!
          acceptLanguage: 'fr'
        });
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error!.message).toEqual('Client has sent too many requests');
      expect(error!.getResponse()).toEqual({
        code: 429,
        errno: 114,
        error: "Too Many Requests",
        message: "Client has sent too many requests",
        "retry-after": 100,
        // Since an 'acceptLanguage' of 'fr' was provided
        "retryAfterLocalized": 'dans 2 minutes',
        // Since we mocked an unblock being allowed.
        "verificationMethod": "email-captcha",
        "verificationReason": "login",
      })
    })
  })

  describe('for customs service', () => {
    it('can call customs', async () => {
      (superagent.post as unknown as jest.SpyInstance).mockReturnValue({
        send: () => ({
          ok: () => ({
            status:200,
            body:{
              blocked:false
            }
          }
        )})
      })

      await service.check({
        action: 'test',
        ip: '127.0.0.1',
      });

      expect(superagent.post).toBeCalledTimes(1)
      expect(mockRateLimit.check).toBeCalledTimes(0);
      expect(mockStatsd.increment).toBeCalledWith("customs.check.v1", ["action:test"]);
    });

    it('should throw too many requests error, when rate limit rule is defined', async () => {
      (superagent.post as unknown as jest.SpyInstance).mockReturnValue({
        send: () => ({
          ok: () => ({
            status:200,
            body:{
              block:true,
              retryAfter: 101
            }
          }
        )})
      })

      let error:HttpException|undefined = undefined;
      try {
        await service.check({
          action: 'test',
          ip: '127.0.0.1',
          // Important! Trigger and check localized error message state!
          acceptLanguage: 'fr'
        });
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error!.message).toEqual('Client has sent too many requests');
      expect(error!.getResponse()).toEqual({
        code: 429,
        errno: 114,
        error: "Too Many Requests",
        message: "Client has sent too many requests",
        "retry-after": 101,
        "retryAfterLocalized": 'dans 2 minutes'
      })
    })
  })









});
