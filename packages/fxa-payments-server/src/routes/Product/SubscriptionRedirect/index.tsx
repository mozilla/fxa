import React from 'react';
import { Plan } from '../../../store/types';

import './index.scss';

export type SubscriptionRedirectProps = {
  plan: Plan,
  navigateToUrl: Function,
};

// Table of lazy-loaded plan detail components - the keys are plan IDs.
type availableRedirectsType = {
  [propName: string]: React.LazyExoticComponent<(props: SubscriptionRedirectProps) => JSX.Element>
};
const availableRedirects: availableRedirectsType = {
  // Examples:
  '123doneProProduct': React.lazy(() => import('./Redirect123donePro')),
  // '321doneProProduct': React.lazy(() => import('./Redirect321donePro')),
  'prod_Ex9Z1q5yVydhyk': React.lazy(() => import('./RedirectDev')),
};
const defaultRedirect = React.lazy(() => import('./RedirectDefault'));

export const SubscriptionRedirect = ({
  plan,
  navigateToUrl,
}: SubscriptionRedirectProps) => {
  const SubRedirect = plan.product_id in availableRedirects
    ? availableRedirects[plan.product_id]
    : defaultRedirect;
  return <SubRedirect {...{ plan, navigateToUrl }} />;
};

export default SubscriptionRedirect;
