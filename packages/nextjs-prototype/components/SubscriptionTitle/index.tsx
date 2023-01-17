import { Localized } from '@fluent/react';
import { ReactElement } from 'react';

const CHECK_LOGO = '/images/check.svg';

export const titles = {
  create: 'Set up your subscription',
  success: 'Subscription confirmation',
  processing: 'Confirming subscription…',
  error: 'Error confirming subscription…',
  noplanchange: 'This subscription plan change is not supported',
  iapsubscribed: 'Already subscribed',
  iaperrorupgrade: 'We can’t upgrade you quite yet',
} as const;

export type SubscriptionTitleProps = {
  screenType: keyof typeof titles;
  subtitle?: ReactElement;
  className?: string;
};

export const SubscriptionTitle = ({
  screenType,
  subtitle,
  className = '',
}: SubscriptionTitleProps) => {
  const subtitleElement = subtitle || (
    <div className="green-icon-text mb-4">
      <img src={CHECK_LOGO} alt="" />

      <Localized id="sub-guarantee">
        <div className="font-semibold text-sm">30-day money-back guarantee</div>
      </Localized>
    </div>
  );

  return (
    <div
      className={`subscription-title bg-white shadow-sm shadow-grey-300 text-center mt-0 mb-auto pt-5 px-4 pb-px border-y-auto tablet:mx-0 ${className}`}
      data-testid={`subscription-${screenType}-title`}
    >
      <Localized id={`subscription-${screenType}-title`}>
        <h3 className="font-semibold leading-8 mb-2 text-grey-600 text-xl">
          {titles[screenType]}
        </h3>
      </Localized>

      {subtitleElement}
    </div>
  );
};

export type SubscriptionTitleType = typeof SubscriptionTitle;
export default SubscriptionTitle;
