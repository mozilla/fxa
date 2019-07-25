import React, { useEffect } from 'react';
import { Plan } from '../../../store/types';

import './index.scss';

// Mapping of product IDs to post-subscription redirect URLs
// TODO: Move / merge in some kind of configuration variable?
type productRedirectURLsType = { [productID: string]: string };
const productRedirectURLs: productRedirectURLsType = {
  '123doneProProduct': 'http://127.0.0.1:8080/',
  'prod_Ex9Z1q5yVydhyk': 'https://123done-latest.dev.lcip.org/',
  'prod_FUUNYnlDso7FeB': 'https://123done-stage.dev.lcip.org',
};
const defaultProductRedirectURL = 'https://mozilla.org';

export type SubscriptionRedirectProps = {
  plan: Plan,
  navigateToUrl: Function,
};

export const SubscriptionRedirect = ({
  navigateToUrl,
  plan: {
    product_id,
    plan_name,
  }
}: SubscriptionRedirectProps) => {
  const redirectUrl = productRedirectURLs[product_id]
    || defaultProductRedirectURL;

  useEffect(() => {
    navigateToUrl(redirectUrl);
  }, [ navigateToUrl, redirectUrl ]);

  return (
    <div className="subscription-ready">
      <h2>Your subscription is ready</h2>
      <p>Hang on for a moment while we send you to the <span className="plan-name">{plan_name}</span> download page.</p>
      <a href={redirectUrl}>Click here if you're not automatically redirected</a>
    </div>
  );
};

export default SubscriptionRedirect;
