import React, { useEffect, useContext } from 'react';
import { Plan } from '../../../store/types';
import { AppContext } from '../../../lib/AppContext';

import { metadataFromPlan } from '../../../store/utils';
import fpnImage from '../../../images/fpn';
import './index.scss';

const defaultProductRedirectURL = 'https://mozilla.org';

export type SubscriptionRedirectProps = {
  plan: Plan;
};

export const SubscriptionRedirect = ({ plan }: SubscriptionRedirectProps) => {
  const { product_id, product_name } = plan;
  const { webIconURL, downloadURL } = metadataFromPlan(plan);
  const {
    config: { productRedirectURLs },
    navigateToUrl,
  } = useContext(AppContext);

  const redirectUrl =
    downloadURL || productRedirectURLs[product_id] || defaultProductRedirectURL;

  useEffect(() => {
    navigateToUrl(redirectUrl);
  }, [navigateToUrl, redirectUrl]);

  return (
    <div className="product-payment" data-testid="subscription-redirect">
      <div className="subscription-ready">
        <h2>Your subscription is ready</h2>
        <img
          alt={product_name}
          src={webIconURL || fpnImage}
          width="96"
          height="96"
        />
        <p>
          Hang on for a moment while we send you to the{' '}
          <span className="plan-name">{product_name}</span> download page.
        </p>
        <a href={redirectUrl}>
          Click here if you're not automatically redirected
        </a>
      </div>
    </div>
  );
};

export default SubscriptionRedirect;
