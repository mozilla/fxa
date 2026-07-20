/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Test } from '@nestjs/testing';

import { CurrencyManager } from './currency.manager';
import {
  CurrencyConfig,
  MockCurrencyConfigProvider,
} from './currency.config';

describe('CurrencyManager', () => {
  let currencyManager: CurrencyManager;
  let mockCurrencyConfig: CurrencyConfig;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [MockCurrencyConfigProvider, CurrencyManager],
    }).compile();

    currencyManager = module.get(CurrencyManager);
    mockCurrencyConfig = module.get(CurrencyConfig);
  });

  describe('getCurrencyForCountry', () => {
    it('returns usd for US country code', () => {
      const result = currencyManager.getCurrencyForCountry('US');
      expect(result).toEqual('usd');
    });

    it('returns eur for EU country codes', () => {
      expect(currencyManager.getCurrencyForCountry('FR')).toEqual('eur');
      expect(currencyManager.getCurrencyForCountry('DE')).toEqual('eur');
      expect(currencyManager.getCurrencyForCountry('NL')).toEqual('eur');
    });

    it('returns undefined for unknown country code', () => {
      const result = currencyManager.getCurrencyForCountry('ZZ');
      expect(result).toBeUndefined();
    });
  });

  describe('getTaxId', () => {
    it('returns the correct tax id for currency', async () => {
      const mockCurrency = Object.entries(mockCurrencyConfig.taxIds)[0];

      const result = currencyManager.getTaxId(mockCurrency[0]);
      expect(result).toEqual(mockCurrency[1]);
    });

    it('returns empty string when no  tax id found', async () => {
      const result = currencyManager.getTaxId('DOES NOT EXIST');
      expect(result).toEqual(undefined);
    });
  });
});
