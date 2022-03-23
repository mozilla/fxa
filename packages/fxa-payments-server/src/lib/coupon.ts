export const planIntervalLessThanEqualCouponDuration = (
  interval_count: number,
  interval: string,
  durationInMonths: number
) => {
  let renewalDate: Date;
  let currentDate = new Date();

  switch (interval) {
    case 'day':
      renewalDate = new Date(
        currentDate.setHours(currentDate.getHours() + interval_count * 24)
      );
      break;
    case 'week':
      renewalDate = new Date(
        currentDate.setHours(currentDate.getHours() + interval_count * 24 * 7)
      );
      break;
    case 'month':
      renewalDate = new Date(
        currentDate.setMonth(currentDate.getMonth() + interval_count)
      );
      break;
    case 'year':
      renewalDate = new Date(
        currentDate.setFullYear(currentDate.getFullYear() + interval_count)
      );
      break;
    default:
      return false;
  }

  currentDate = new Date();
  const couponDurationDate = new Date(
    currentDate.setMonth(currentDate.getMonth() + durationInMonths)
  );

  return couponDurationDate.getTime() - renewalDate.getTime() <= 0
    ? false
    : true;
};
