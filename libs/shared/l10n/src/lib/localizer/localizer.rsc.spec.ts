/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import * as formatters from '../l10n.formatters';
import { LocalizerRsc } from './localizer.rsc';
import { ReactLocalization } from '@fluent/react';

jest.mock('@fluent/react', () => {
  return {
    ReactLocalization: jest.fn().mockImplementation(),
  };
});

describe('LocalizerRsc', () => {
  let localizerRsc: LocalizerRsc;
  let spyCreateFragment: jest.SpyInstance;
  const mockReactLocalization = {
    getElement: jest.fn(),
    getString: jest.fn(),
    getBundle: jest.fn(),
  };

  beforeAll(() => {
    (ReactLocalization as jest.Mock).mockImplementation(() => {
      return mockReactLocalization;
    });
    spyCreateFragment = jest.spyOn(
      LocalizerRsc.prototype as any,
      'createFragment'
    );
  });

  beforeEach(() => {
    mockReactLocalization.getString.mockClear();
    mockReactLocalization.getElement.mockClear();
    mockReactLocalization.getBundle.mockClear();
    spyCreateFragment.mockClear();

    localizerRsc = new LocalizerRsc([] as any);
  });

  describe('getFragmentWithSource', () => {
    it('should call getElement with createElement fragment', () => {
      mockReactLocalization.getBundle = jest.fn().mockReturnValue(true);
      localizerRsc.getFragmentWithSource('id', {}, {} as any);
      expect(mockReactLocalization.getElement).toHaveBeenCalled();
      expect(spyCreateFragment).toHaveBeenCalledTimes(1);
    });

    it('should call getElement with fallback', () => {
      mockReactLocalization.getBundle = jest.fn().mockReturnValue(false);
      localizerRsc.getFragmentWithSource('id', {}, {} as any);
      expect(mockReactLocalization.getElement).toHaveBeenCalled();
      expect(spyCreateFragment).not.toHaveBeenCalled();
    });
  });

  describe('getFragment', () => {
    it('should call getElement', () => {
      localizerRsc.getFragment('id', {});
      expect(mockReactLocalization.getElement).toHaveBeenCalled();
    });
  });

  describe('getString', () => {
    const id = 'localizer-id';
    const fallback = 'fallback text';
    it('should call getString with no vars', () => {
      localizerRsc.getString(id, fallback);
      expect(mockReactLocalization.getString).toHaveBeenCalledWith(
        id,
        undefined,
        fallback
      );
    });

    it('should call getString with vars', () => {
      const vars = { test: 'var' };
      localizerRsc.getString(id, vars, fallback);
      expect(mockReactLocalization.getString).toHaveBeenCalledWith(
        id,
        vars,
        fallback
      );
    });
  });

  describe('formatters', () => {
    const amountInCents = 50;
    const currency = 'usd';
    const locale = 'fr';
    const unixSeconds = Date.now() / 1000;
    it('should call getLocalizedCurrency', () => {
      const spy = jest.spyOn(formatters, 'getLocalizedCurrency');
      localizerRsc.getLocalizedCurrency(amountInCents, currency);
      expect(spy).toHaveBeenCalledWith(amountInCents, currency);
    });

    it('should call getLocalizedCurrencyString', () => {
      const spy = jest.spyOn(formatters, 'getLocalizedCurrencyString');
      localizerRsc.getLocalizedCurrencyString(amountInCents, currency, locale);
      expect(spy).toHaveBeenCalledWith(amountInCents, currency, locale);
    });

    it('should call getLocalizedDate', () => {
      const spy = jest.spyOn(formatters, 'getLocalizedDate');
      localizerRsc.getLocalizedDate(unixSeconds);
      expect(spy).toHaveBeenCalledWith(unixSeconds, false);
    });

    it('should call getLocalizedDateString', () => {
      const spy = jest.spyOn(formatters, 'getLocalizedDateString');
      localizerRsc.getLocalizedDateString(unixSeconds, false, locale);
      expect(spy).toHaveBeenCalledWith(unixSeconds, false, locale);
    });

    it('should call getLocalizedMonthYearString', () => {
      const month = 4;
      const year = 2024;
      const spy = jest.spyOn(formatters, 'getLocalizedMonthYearString');
      localizerRsc.getLocalizedMonthYearString(month, year, locale);
      expect(spy).toHaveBeenCalledWith(month, year, locale);
    });
  });
});
