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
  // '123doneProProduct': React.lazy(() => import('./Redirect123donePro')),
  // '321doneProProduct': React.lazy(() => import('./Redirect321donePro')),
  'plan_F4bof27uz71Vk7': React.lazy(() => import('./Redirect123DonePro')),
};
const defaultRedirect = React.lazy(() => import('./RedirectDefault'));

export const SubscriptionRedirect = ({
  plan,
  navigateToUrl,
}: SubscriptionRedirectProps) => {
  const SubRedirect = plan.plan_id in availableRedirects
    ? availableRedirects[plan.plan_id]
    : defaultRedirect;
  return <SubRedirect {...{ plan, navigateToUrl }} />;
};

export default SubscriptionRedirect;
