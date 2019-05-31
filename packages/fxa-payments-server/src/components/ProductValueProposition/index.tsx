import React from 'react';
import { Plan } from '../../store/types';

// Table of lazy-loaded product detail components
type availableDetailsType = {
  [propName: string]: any; // TODO: need a better type for what React.lazy() produces
};
const availableDetails: availableDetailsType = {
  '123doneProProduct': React.lazy(() => import('./Details123donePro')),
  '321doneProProduct': React.lazy(() => import('./Details321donePro')),
  //'allDoneProProduct': React.lazy(() => import('./DetailsAlldonePro')),
};

const DefaultDetails = (plan: Plan) => <pre>{JSON.stringify(plan, null, ' ')}</pre>;

type ProductValuePropositionProps = { plan: Plan };

export const ProductValueProposition = ({
  plan
}: ProductValuePropositionProps) => {
  const Details = plan.product_id in availableDetails
    ? availableDetails[plan.product_id]
    : DefaultDetails;

  const { currency, amount, interval, plan_name } = plan;
  return (
    <div className="productDetails">
      <p>For {currency} {amount / 100.0} per {interval}, your {plan_name} includes:</p>
      <Details plan={plan} />
    </div>
  );
};

export default ProductValueProposition;
