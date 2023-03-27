/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { AppConfig } from '../config';
import { MockConfig, mockConfigOverrides } from '../mocks';
import { BasketService } from './basket.service';

describe('BasketService', () => {
  const validEmail = 'success@example.com';
  const invalidEmail = 'failure@example.com';
  let service: BasketService;
  let config: AppConfig['newsletters'];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BasketService, MockConfig],
    }).compile();
    service = module.get<BasketService>(BasketService);
    config = module.get<ConfigService>(ConfigService).get('').newsletters;
  });

  it('has api key', () => {
    // Ensure basket api key is set in config/secrets.json or as env variable
    expect(config.basketApiKey).toBeDefined();
  });

  it('looks up uid by valid email', async () => {
    if (!config.basketApiKey) {
      return;
    }
    const token = await service.getUserToken(validEmail);
    expect(token).toBeDefined();
    expect(token.length).toBeGreaterThan(8);
  });

  it('looks up invalid email', async () => {
    if (!config.basketApiKey) {
      return;
    }
    const token = await service.getUserToken(invalidEmail);
    expect(token).toBeUndefined();
  });

  it('unsubscribes from mailing lists', async () => {
    if (!config.basketApiKey) {
      return;
    }
    const token = await service.getUserToken(validEmail);
    const result = await service.unsubscribeAll(token);
    expect(result).toBeTruthy();
  });

  describe('Missing api key', () => {
    beforeAll(async () => {
      mockConfigOverrides.newsletters = {
        newsletterHost: '',
        basketHost: '',
        basketApiKey: '',
      };
      const module: TestingModule = await Test.createTestingModule({
        providers: [BasketService, MockConfig],
      }).compile();

      service = module.get<BasketService>(BasketService);
    });

    afterAll(() => {
      delete mockConfigOverrides.newsletters;
    });

    it('throws on query', async () => {
      await expect(async () => {
        await service.getUserToken(validEmail);
      }).rejects.toThrowError('No API key configured!');
    });
  });
});
