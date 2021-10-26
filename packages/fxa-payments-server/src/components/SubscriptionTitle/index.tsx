import React from 'react';
import { Localized } from '@fluent/react';

import './index.scss';

export const titles = {
  create: 'Set up your subscription',
  success: 'Subscription confirmation',
  processing: 'Confirming subscription…',
  error: 'Error confirming subscription…',
  noplanchange: 'This subscription plan change is not supported',
  iapsubscribed: 'Already subscribed',
} as const;

export type SubscriptionTitleProps = {
  screenType: keyof typeof titles;
  subtitle?: React.ReactElement;
  className?: string;
};

export const SubscriptionTitle = ({
  screenType,
  subtitle,
  className = '',
}: SubscriptionTitleProps) => {
  const subtitleElement = subtitle ? (
    subtitle
  ) : (
    <Localized id="sub-guarantee">
      <p className="subtitle">30-day money-back guarantee</p>
    </Localized>
  );

  return (
    <div
      className={`subscription-title ${className}`}
      data-testid={`subscription-${screenType}-title`}
    >
      <Localized id={`subscription-${screenType}-title`}>
        <h3 className="title">{titles[screenType]}</h3>
      </Localized>
      {subtitleElement}
    </div>
  );
};

export type SubscriptionTitle = typeof SubscriptionTitle;
export default SubscriptionTitle;
