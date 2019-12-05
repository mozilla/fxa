import React, { useContext } from 'react';
import { Plan } from '../../../lib/types';
import { metadataFromPlan } from '../../../lib/metadataFromPlan';
import DialogMessage from '../../../components/DialogMessage';
import fpnImage from '../../../images/fpn';
import { AppContext } from '../../../lib/AppContext';

export default ({
  planId,
  onDismiss,
}: {
  planId: string;
  onDismiss: () => void;
}) => {
  const { plans } = useContext(AppContext);
  const plan = planForId(planId, plans);
  if (!plan) {
    return null;
  }
  const { product_name: productName } = plan;
  const { webIconURL } = metadataFromPlan(plan);
  return (
    <DialogMessage
      onDismiss={onDismiss}
      data-testid="reactivate-subscription-success-dialog"
    >
      <img
        alt={productName}
        src={webIconURL || fpnImage}
        width="96"
        height="96"
      />
      <p
        data-testid="reactivate-subscription-success"
        className="reactivate-subscription-success"
      >
        Thanks! You're all set.
      </p>
      <button
        className="settings-button"
        onClick={onDismiss}
        data-testid="reactivate-subscription-success-button"
      >
        Close
      </button>
    </DialogMessage>
  );
};

const planForId = (planId: string, plans: Plan[] | undefined) => {
  return plans && plans.filter(plan => plan.plan_id === planId)[0];
};
