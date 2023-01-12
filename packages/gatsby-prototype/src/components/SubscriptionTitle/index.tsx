import React from 'react';
// import { Localized } from '@fluent/react';
import checkLogo from '../../images/check.svg';

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
  subtitle?: string;
};

const SubscriptionTitle = ({
  screenType,
  subtitle,
}: SubscriptionTitleProps) => (
  <div
    className={`subscription-title bg-white font-semibold shadow-sm shadow-grey-300 text-center mt-0 mb-auto pt-5 px-4 pb-px border-y-auto tablet:mx-0`}
    data-testid={`subscription-${screenType}-title`}
  >
    {/* <Localized id={`subscription-${screenType}-title`}> */}
      <h1 className="leading-8 mb-2 text-grey-600 text-xl">
        {titles[screenType]}
      </h1>
    {/* </Localized> */}

    <div className="text-sm mb-4">
      { subtitle ||
        <div className="flex gap-2 green-icon-text justify-center">
          <img src={checkLogo} alt="" />

          {/* <Localized id="sub-guarantee"> */}
            <div>
              30-day money back guarantee
            </div>
          {/* </Localized> */}
        </div>
      }
    </div>
  </div>
);

export type SubscriptionTitleType = typeof SubscriptionTitle;
export default SubscriptionTitle;
