import React from 'react';
import { Meta } from '@storybook/react';
import { PriceDetails, PriceDetailsProps } from '.';
import MockApp from '../../../.storybook/components/MockApp';
import { SignInLayout } from '../AppLayout';

export default {
  title: 'components/PriceDetails',
  component: PriceDetails,
} as Meta;

const defaultProps: PriceDetailsProps = {
  total: 500,
  currency: 'USD',
};

const storyWithParams = ({
  locale = 'en',
  props,
}: {
  locale?: string;
  props: PriceDetailsProps;
}) => {
  return () => {
    return (
      <MockApp languages={[locale || 'auto']}>
        <SignInLayout>
          <PriceDetails {...props} />
        </SignInLayout>
      </MockApp>
    );
  };
};

export const NoIntervalWithoutTax = storyWithParams({ props: defaultProps });

export const NoIntervalWithTax = storyWithParams({
  props: { ...defaultProps, tax: 123 },
});

export const IntervalOneWithoutTax = storyWithParams({
  props: { ...defaultProps, interval: 'month', intervalCount: 1 },
});

export const IntervalMultipleWithoutTax = storyWithParams({
  props: { ...defaultProps, interval: 'month', intervalCount: 6 },
});

export const IntervalOneWithTax = storyWithParams({
  props: { ...defaultProps, tax: 123, interval: 'month', intervalCount: 1 },
});

export const IntervalMultipleWithTax = storyWithParams({
  props: { ...defaultProps, tax: 123, interval: 'month', intervalCount: 6 },
});

export const NoIntervalWithTaxEuro = storyWithParams({
  props: { ...defaultProps, currency: 'EUR', tax: 123 },
});

export const IntervalMultipleWithTaxGermany = storyWithParams({
  locale: 'de',
  props: {
    ...defaultProps,
    currency: 'EUR',
    tax: 123,
    interval: 'month',
    intervalCount: 6,
  },
});

export const IntervalMultipleWithStyling = storyWithParams({
  locale: 'de',
  props: {
    ...defaultProps,
    tax: 123,
    interval: 'month',
    intervalCount: 6,
    className: 'font-semibold text-xl',
  },
});
