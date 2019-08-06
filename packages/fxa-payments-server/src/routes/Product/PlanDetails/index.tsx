import React from 'react';
import { Plan } from '../../../store/types';

import './index.scss';

export type PlanDetailsProps = { plan: Plan };

// Table of lazy-loaded plan detail components - the keys are plan IDs.
type availableDetailsType = {
  [propName: string]: React.LazyExoticComponent<
    (props: PlanDetailsProps) => JSX.Element
  >;
};
const availableDetails: availableDetailsType = {
  // Examples:
  // '123doneProProduct': React.lazy(() => import('./Details123donePro')),
  // '321doneProProduct': React.lazy(() => import('./Details321donePro')),
  plan_F4bof27uz71Vk7: React.lazy(() => import('./Details123DonePro')),
};
const defaultDetails = React.lazy(() => import('./DetailsDefault'));

export const PlanDetails = ({ plan }: PlanDetailsProps) => {
  const Details =
    plan.plan_id in availableDetails
      ? availableDetails[plan.plan_id]
      : defaultDetails;
  return <Details plan={plan} />;
};

export default PlanDetails;
