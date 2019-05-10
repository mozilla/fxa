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

const ProductValueProposition = ({
  plan
}: ProductValuePropositionProps) => {
  const Details = plan.product_id in availableDetails
    ? availableDetails[plan.product_id]
    : DefaultDetails;

  return (
    <div className="productDetails">
      <p>For {plan.currency} {plan.amount} per {plan.interval}, your {plan.product_id} includes:</p>
      <Details plan={plan} />
    </div>
  );
};

export default ProductValueProposition;
