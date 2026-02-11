import React from 'react';
import { Localized } from '@fluent/react';
import {
  formatPlanPricing,
  getLocalizedCurrency,
  getLocalizedCurrencyString,
} from '../../lib/formats';
import Stripe from 'stripe';

const NoInterval = ({
  total,
  currency,
  tax,
  showTax,
  className,
  dataTestId,
}: {
  total: number;
  currency: string;
  showTax: boolean;
  tax?: number;
  className?: string;
  dataTestId?: string;
}) => {
  const defaultVars = {
    priceAmount: getLocalizedCurrency(total, currency),
  };
  let vars = {};
  let fallbackText: string;
  let l10nId: string;
  if (showTax) {
    const taxAmount = tax || 0;
    vars = {
      ...defaultVars,
      taxAmount: getLocalizedCurrency(taxAmount, currency),
    };
    l10nId = 'price-details-tax';
    fallbackText = `${getLocalizedCurrencyString(
      total,
      currency
    )} + ${getLocalizedCurrencyString(taxAmount, currency)} tax`;
  } else {
    vars = defaultVars;
    l10nId = 'price-details-no-tax';
    fallbackText = getLocalizedCurrencyString(total, currency);
  }
  return (
    <Localized id={l10nId} vars={vars}>
      <span
        id="price-details"
        className={className}
        data-testid={dataTestId || l10nId}
      >
        {fallbackText}
      </span>
    </Localized>
  );
};

const Interval = ({
  total,
  currency,
  interval,
  intervalCount,
  tax,
  showTax,
  className,
  dataTestId,
}: {
  total: number;
  currency: string;
  interval: Stripe.Plan.Interval;
  intervalCount: number;
  showTax: boolean;
  tax?: number;
  className?: string;
  dataTestId?: string;
}) => {
  const defaultVars = {
    priceAmount: getLocalizedCurrency(total, currency),
    intervalCount,
  };
  let vars = {};
  let fallbackText: string;
  let l10nId: string;
  let testId: string;
  if (showTax) {
    const taxAmount = tax || 0;
    vars = {
      ...defaultVars,
      taxAmount: getLocalizedCurrency(taxAmount, currency),
    };
    l10nId = `price-details-tax-${interval}`;
    testId = dataTestId || 'price-details-tax-interval';
    fallbackText = formatPlanPricing(
      total,
      currency,
      interval,
      intervalCount,
      true,
      taxAmount
    );
  } else {
    vars = defaultVars;
    l10nId = `price-details-no-tax-${interval}`;
    testId = dataTestId || 'price-details-no-tax-interval';
    fallbackText = formatPlanPricing(total, currency, interval, intervalCount);
  }
  return (
    <Localized id={l10nId} attrs={{ title: true }} vars={vars}>
      <span id="price-details" className={className} data-testid={testId}>
        {fallbackText}
      </span>
    </Localized>
  );
};

export type PriceDetailsProps = {
  total: number;
  currency: string;
  tax?: number;
  showTax?: boolean;
  interval?: Stripe.Plan.Interval;
  intervalCount?: number;
  className?: string;
  dataTestId?: string;
};

export const PriceDetails = (props: PriceDetailsProps) => {
  // If a tax amount is provided, then the component will display the tax value, unless showTax is set to false.
  // However if showTax is set to true, if no tax amount is provided, it will be set to 0, and the tax value will be shown.
  const { showTax, tax } = props;
  const calculatedShowTax = showTax === undefined && tax ? true : !!showTax;
  if (props.interval && props.intervalCount) {
    return (
      <Interval
        {...props}
        interval={props.interval}
        intervalCount={props.intervalCount}
        showTax={calculatedShowTax}
      />
    );
  } else {
    return <NoInterval {...props} showTax={calculatedShowTax} />;
  }
};
