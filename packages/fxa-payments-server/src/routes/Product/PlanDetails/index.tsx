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


const loadDetails123DonePro =
      /* istanbul ignore next */
      () => import('./Details123DonePro');

const availableDetails: availableDetailsType = {
  'fortressProMonthly': React.lazy(loadDetails123DonePro),
  'plan_FUUOYlhpIhWtoo': React.lazy(loadDetails123DonePro),
  'plan_F4bof27uz71Vk7': React.lazy(loadDetails123DonePro),
  'prod_FfiuDs9u11ESbD': React.lazy(loadDetails123DonePro),
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
