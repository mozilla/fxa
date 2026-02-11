import {
  checkCouponRepeating,
  couponOnSubsequentInvoice,
  incDateByInterval,
  incDateByMonth,
} from './coupon';

const getTimeInSeconds = (date: Date) => Math.floor(date.getTime() / 1000);

describe('lib/coupon', () => {
  describe('incDateByMonth', () => {
    const incrementMonth = 1;
    it('should incremenet current date by specified amount', () => {
      const date = new Date();
      const expected = new Date(
        date.setMonth(date.getMonth() + incrementMonth)
      );
      const actual = incDateByMonth(incrementMonth);
      expect(getTimeInSeconds(actual)).toEqual(getTimeInSeconds(expected));
    });

    it('should incremenet input date by specified amount', () => {
      const date = new Date(2022, 0, 1);
      const expected = new Date(2022, 1, 1);
      const actual = incDateByMonth(incrementMonth, date);
      expect(actual).toEqual(expected);
    });
  });

  describe('incDateByInterval', () => {
    it('should increment the date by the provided day', () => {
      const incrementValue = 6;
      const date = new Date(2022, 0, 1);
      const expected = new Date(2022, 0, 7);
      const actual = incDateByInterval(incrementValue, 'day', date);
      expect(actual).toEqual(expected);
    });

    it('should increment the date by the provided week', () => {
      const incrementValue = 2;
      const date = new Date(2022, 0, 1);
      const expected = new Date(2022, 0, 15);
      const actual = incDateByInterval(incrementValue, 'week', date);
      expect(actual).toEqual(expected);
    });

    it('should increment the date by the provided month', () => {
      const incrementValue = 6;
      const date = new Date(2022, 0, 1);
      const expected = new Date(2022, 6, 1);
      const actual = incDateByInterval(incrementValue, 'month', date);
      expect(actual).toEqual(expected);
    });

    it('should increment the date by the provided year', () => {
      const incrementValue = 1;
      const date = new Date(2022, 0, 1);
      const expected = new Date(2023, 0, 1);
      const actual = incDateByInterval(incrementValue, 'year', date);
      expect(actual).toEqual(expected);
    });

    it('should increment the current date by the provided value', () => {
      const incrementValue = 2;
      const expected = incDateByMonth(incrementValue);
      const actual = incDateByInterval(incrementValue, 'month');
      expect(getTimeInSeconds(actual)).toEqual(getTimeInSeconds(expected));
    });

    it('should return the input date if incorrect interval is provided', () => {
      const incrementValue = 2;
      const expected = new Date();
      const actual = incDateByInterval(incrementValue, 'invalid', expected);
      expect(actual).toEqual(expected);
    });
  });

  describe('checkCouponRepeating', () => {
    it.skip.each([
      {
        scenario: 'greater',
        interval: 'month',
        interval_count: 1,
        durationInMonths: 3,
        expected: true,
      },
      {
        scenario: 'less',
        interval: 'year',
        interval_count: 1,
        durationInMonths: 3,
        expected: false,
      },
      {
        scenario: 'equal',
        interval: 'month',
        interval_count: 1,
        durationInMonths: 1,
        expected: false,
      },
    ])(
      'should return $expected if coupon duration is $scenario than the interval (Fix required as of 2024/02/12 (see FXA-9118))',
      ({ interval, interval_count, durationInMonths, expected }) => {
        const actual = checkCouponRepeating(
          interval_count,
          interval,
          durationInMonths
        );
        expect(actual).toEqual(expected);
      }
    );
  });

  describe('couponOnSubsequentInvoice', () => {
    const invoiceCurrentPeriodEnd: number = Date.now();
    let promotionEnd: number | null;
    let couponDuration: string | null;

    it('false - if couponDuration is null', () => {
      promotionEnd = invoiceCurrentPeriodEnd + 10;
      couponDuration = null;

      const expected = false;
      const actual = couponOnSubsequentInvoice(
        invoiceCurrentPeriodEnd,
        promotionEnd,
        couponDuration
      );
      expect(actual).toEqual(expected);
    });

    it('false - couponDuration is once', () => {
      promotionEnd = invoiceCurrentPeriodEnd;
      couponDuration = 'once';

      const expected = false;
      const actual = couponOnSubsequentInvoice(
        invoiceCurrentPeriodEnd,
        promotionEnd,
        couponDuration
      );
      expect(actual).toEqual(expected);
    });

    it('false - couponDuration is repeating and promotionEnd is empty', () => {
      promotionEnd = null;
      couponDuration = 'once';

      const expected = false;
      const actual = couponOnSubsequentInvoice(
        invoiceCurrentPeriodEnd,
        promotionEnd,
        couponDuration
      );
      expect(actual).toEqual(expected);
    });

    it('false - couponDuration is repeating and promotionEnd is less than invoiceCurrentPeriodEnd', () => {
      promotionEnd = invoiceCurrentPeriodEnd - 10;
      couponDuration = 'once';

      const expected = false;
      const actual = couponOnSubsequentInvoice(
        invoiceCurrentPeriodEnd,
        promotionEnd,
        couponDuration
      );
      expect(actual).toEqual(expected);
    });

    it('false - couponDuration is repeating and promotionEnd is equal to invoiceCurrentPeriodEnd', () => {
      promotionEnd = invoiceCurrentPeriodEnd;
      couponDuration = 'once';

      const expected = false;
      const actual = couponOnSubsequentInvoice(
        invoiceCurrentPeriodEnd,
        promotionEnd,
        couponDuration
      );
      expect(actual).toEqual(expected);
    });

    it('true - couponDuration is forever', () => {
      promotionEnd = null;
      couponDuration = 'forever';

      const expected = true;
      const actual = couponOnSubsequentInvoice(
        invoiceCurrentPeriodEnd,
        promotionEnd,
        couponDuration
      );
      expect(actual).toEqual(expected);
    });

    it('true - couponDuration is repeating and promotionEnd is greater than invoiceCurrentPeriodEnd', () => {
      promotionEnd = invoiceCurrentPeriodEnd + 10;
      couponDuration = 'repeating';

      const expected = true;
      const actual = couponOnSubsequentInvoice(
        invoiceCurrentPeriodEnd,
        promotionEnd,
        couponDuration
      );
      expect(actual).toEqual(expected);
    });
  });
});
