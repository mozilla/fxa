export const incDateByMonth = (month: number, date: Date = new Date()) =>
  new Date(date.setMonth(date.getMonth() + month));

export const incDateByInterval = (
  interval_count: number,
  interval: string,
  date: Date = new Date()
) => {
  switch (interval) {
    case 'day':
      return new Date(date.setHours(date.getHours() + interval_count * 24));
    case 'week':
      return new Date(date.setHours(date.getHours() + interval_count * 24 * 7));
    case 'month':
      return incDateByMonth(interval_count, date);
    case 'year':
      return new Date(date.setFullYear(date.getFullYear() + interval_count));
    default:
      return date;
  }
};

/*
 * Check if the coupon will be reused on the next billing cycle.
 */
export const checkCouponRepeating = (
  interval_count: number,
  interval: string,
  durationInMonths: number
) => {
  // TODO - Instead of calculating this get it from the coupon invoice preview
  // Get the date the plan will renew.
  const renewalDate = incDateByInterval(interval_count, interval);
  // Get the date the coupon ends.
  const couponDurationDate = incDateByMonth(durationInMonths);

  return couponDurationDate.getTime() <= renewalDate.getTime() ? false : true;
};
