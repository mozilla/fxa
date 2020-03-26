import dayjs from 'dayjs';

export function formatCurrencyInCents(amount: number): string {
  const decimal = (amount / 100.0).toFixed(2);
  return `$${decimal}`;
}

// TODO: date formats will need i18n someday
export function formatPeriodEndDate(dt: number) {
  return dayjs.unix(dt).format('MMMM DD, YYYY');
}
