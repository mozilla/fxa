/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Test, TestingModule } from '@nestjs/testing';
import { StripeService } from './stripe.service';

describe('StripeService', () => {
  describe('customerChanged', () => {
    let service: StripeService;

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [StripeService],
      }).compile();

      service = module.get<StripeService>(StripeService);
    });

    it('should be defined', async () => {
      expect(service).toBeDefined();
      expect(service).toBeInstanceOf(StripeService);
    });
  });
});
