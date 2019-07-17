import React, { useEffect } from 'react';
import { SubscriptionRedirectProps } from './index';

export const RedirectDev = ({
  navigateToUrl,
  plan: {
    plan_name
  }
}: SubscriptionRedirectProps) => {
  const redirectUrl = 'https://123done-latest.dev.lcip.org/'; 

  useEffect(() => {
    navigateToUrl(redirectUrl);
  }, [ navigateToUrl, redirectUrl ]);

  return (
    <div className="subscription-ready">
      <h2>Your subscription is ready</h2>
      <p>Hang on for a moment while we send you to the {plan_name} download page.</p>
      <a href={redirectUrl}>Click here if you're not automatically redirected</a>
    </div>
  );
};

export default RedirectDev;