import React from 'react';
import MockApp from '../../../.storybook/components/MockApp';
import SubscriptionTitle, { SubscriptionTitleProps } from './index';
import { Meta } from '@storybook/react';

export default {
  title: 'components/SubscriptionTitle',
  component: SubscriptionTitle,
} as Meta;

const storyWithProps = (defaultProps: SubscriptionTitleProps) => {
  const story = () => (
    <MockApp>
      <SubscriptionTitle {...defaultProps} />
    </MockApp>
  );

  return story;
};

export const Default = storyWithProps({
  screenType: 'create',
});

export const Success = storyWithProps({
  screenType: 'success',
});

export const Processing = storyWithProps({
  screenType: 'processing',
});

export const Error = storyWithProps({
  screenType: 'error',
});

export const NoPlanChange = storyWithProps({
  screenType: 'noplanchange',
});

export const IapSubscribed = storyWithProps({
  screenType: 'iapsubscribed',
  subtitle: <p />,
});

export const IapUpgradeError = storyWithProps({
  screenType: 'iaperrorupgrade',
  subtitle: <p />,
});
