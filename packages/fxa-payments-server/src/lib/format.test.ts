import {
  getLocalizedCurrency,
  getLocalizedCurrencyString,
  getLocalizedDate,
  getLocalizedDateString,
} from './formats';

describe('format.ts', () => {
  describe('Currency Formatting', () => {
    describe('getLocalizedCurrency', () => {
      it('returns a FluentNumber with the correct currency options', () => {
        const localizedCurrency = getLocalizedCurrency(123, 'USD');

        expect(localizedCurrency.value).toEqual(1.23);
        expect(localizedCurrency.opts.currency).toEqual('USD');
        expect(localizedCurrency.opts.currencyDisplay).toEqual('symbol');
        expect(localizedCurrency.opts.style).toEqual('currency');
      });
    });

    describe('getLocalizedCurrencyString', () => {
      it('returns a correctly formatted currency string', () => {
        const expected = '$1.23';
        const actual = getLocalizedCurrencyString(123, 'USD');

        expect(actual).toEqual(expected);
      });
    });
  });

  describe('DateTime Formatting', () => {
    const unixSeconds = 1582329605; // GMT Saturday, February 22, 2020 12:00:05 AM
    describe('getLocalizedDate', () => {
      describe('when numericDate is false', () => {
        it('returns a FluentDateTime with the correct options', () => {
          const localizedDate = getLocalizedDate(unixSeconds);

          expect(localizedDate.value).toEqual(1582329605 * 1000);
          expect(localizedDate.opts.day).toEqual('2-digit');
          expect(localizedDate.opts.month).toEqual('long');
          expect(localizedDate.opts.year).toEqual('numeric');
        });
      });

      describe('when numericDate is true', () => {
        it('returns a FluentDateTime with the correct options', () => {
          const localizedDate = getLocalizedDate(unixSeconds, true);

          expect(localizedDate.value).toEqual(1582329605 * 1000);
          expect(localizedDate.opts.day).toEqual('2-digit');
          expect(localizedDate.opts.month).toEqual('2-digit');
          expect(localizedDate.opts.year).toEqual('numeric');
        });
      });
    });

    describe('getLocalizedDateString', () => {
      describe('when numericDate is false', () => {
        it('returns a correctly formatted string', () => {
          const pattern = /February \d\d, 2020/;
          const actual = getLocalizedDateString(unixSeconds);

          expect(actual).toMatch(pattern);
        });
      });

      describe('when numericDate is true', () => {
        it('returns a correctly formatted string', () => {
          const pattern = /02\/\d\d\/2020/;
          const actual = getLocalizedDateString(unixSeconds, true);
          expect(actual).toMatch(pattern);
        });
      });
    });
  });
});
