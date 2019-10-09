import React, { useEffect, useContext } from 'react';
import { Plan } from '../../../store/types';
import { AppContext } from '../../../lib/AppContext';

import './index.scss';

const defaultProductRedirectURL = 'https://mozilla.org';

export type SubscriptionRedirectProps = {
  plan: Plan;
};

export const SubscriptionRedirect = ({
  plan: { product_id, plan_name },
}: SubscriptionRedirectProps) => {
  const {
    config: { productRedirectURLs },
    navigateToUrl,
  } = useContext(AppContext);

  const redirectUrl =
    productRedirectURLs[product_id] || defaultProductRedirectURL;

  useEffect(() => {
    navigateToUrl(redirectUrl);
  }, [navigateToUrl, redirectUrl]);

  return (
    <div className="subscription-ready">
      <h2>Your subscription is ready</h2>
      <div className="graphic graphic-fpn"></div>
      <p>
        Hang on for a moment while we send you to the{' '}
        <span className="plan-name">{plan_name}</span> download page.
      </p>
      <a href={redirectUrl}>
        Click here if you're not automatically redirected
      </a>
    </div>
  );
};

export default SubscriptionRedirect;
