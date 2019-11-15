import dayjs from 'dayjs';

export function formatCurrencyInCents(amount: number) {
  return (amount / 100.0).toFixed(2);
}

// TODO: date formats will need i18n someday
export function formatPeriodEndDate(dt: number) {
  return dayjs.unix(dt).format('MMMM DD, YYYY');
}
