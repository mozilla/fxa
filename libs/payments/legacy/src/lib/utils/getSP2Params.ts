import { SP2MapConfig } from '../sp2map.config';

type ValidInterval = 'daily' | 'monthly' | 'halfyearly' | 'yearly';

function isValidInterval(interval: string): interval is ValidInterval {
  return !(
    interval !== 'daily' &&
    interval !== 'monthly' &&
    interval !== 'halfyearly' &&
    interval !== 'yearly'
  );
}

export function getSP2Params(
  sp2map: SP2MapConfig,
  reportError: (...args: any) => void,
  offeringId: string,
  interval: string,
  currency?: string
) {
  if (!isValidInterval(interval)) {
    reportError('Interval is not supported', { interval });
    throw new Error('Interval is not supported');
  }

  if (!currency) {
    reportError('Currency is missing');
  }

  const calcInterval = isValidInterval(interval) ? interval : 'monthly';
  const calcCurrency = currency ? currency : 'USD';

  const offering = sp2map.offerings[offeringId];
  if (!offering) {
    reportError('Missing or invalid offering', { offeringId });
    throw new Error(`Missing or invalid offering: ${offeringId}`);
  }

  const intervalValues = offering.currencies[calcCurrency]?.[calcInterval];
  if (intervalValues?.length === 2) {
    return {
      productId: intervalValues[0],
      priceId: intervalValues[1],
    };
  } else {
    reportError('Invalid interval for offering', { offeringId, interval });
    throw new Error(
      `Invalid interval for offfering: ${interval}, ${offeringId}`
    );
  }
}
