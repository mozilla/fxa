import { planIntervalLessThanEqualCouponDuration } from './coupon';

describe('planIntervalLessThanEqualCouponDuration', () => {
  let interval: string;
  let interval_count: number;
  let durationInMonths: number;

  it('day - plan interval is greater', () => {
    interval = 'day';
    interval_count = 40;
    durationInMonths = 1;
    const expected = false;

    const actual = planIntervalLessThanEqualCouponDuration(
      interval_count,
      interval,
      durationInMonths
    );
    expect(actual).toEqual(expected);
  });

  it('day - plan interval is less', () => {
    interval = 'day';
    interval_count = 1;
    durationInMonths = 1;
    const expected = true;

    const actual = planIntervalLessThanEqualCouponDuration(
      interval_count,
      interval,
      durationInMonths
    );
    expect(actual).toEqual(expected);
  });

  it('week - plan interval is greater', () => {
    interval = 'week';
    interval_count = 6;
    durationInMonths = 1;
    const expected = false;

    const actual = planIntervalLessThanEqualCouponDuration(
      interval_count,
      interval,
      durationInMonths
    );
    expect(actual).toEqual(expected);
  });

  it('week - plan interval is less', () => {
    interval = 'week';
    interval_count = 1;
    durationInMonths = 1;
    const expected = true;

    const actual = planIntervalLessThanEqualCouponDuration(
      interval_count,
      interval,
      durationInMonths
    );
    expect(actual).toEqual(expected);
  });

  it('month - plan interval is greater', () => {
    interval = 'month';
    interval_count = 2;
    durationInMonths = 1;
    const expected = false;

    const actual = planIntervalLessThanEqualCouponDuration(
      interval_count,
      interval,
      durationInMonths
    );
    expect(actual).toEqual(expected);
  });

  it('month - plan interval is less', () => {
    interval = 'month';
    interval_count = 1;
    durationInMonths = 2;
    const expected = true;

    const actual = planIntervalLessThanEqualCouponDuration(
      interval_count,
      interval,
      durationInMonths
    );
    expect(actual).toEqual(expected);
  });

  it('year - plan interval is greater', () => {
    interval = 'year';
    interval_count = 1;
    durationInMonths = 1;
    const expected = false;

    const actual = planIntervalLessThanEqualCouponDuration(
      interval_count,
      interval,
      durationInMonths
    );
    expect(actual).toEqual(expected);
  });
});
