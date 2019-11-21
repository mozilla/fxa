import React from 'react';
import { Plan } from '../../../store/types';
import { metadataFromPlan } from '../../../store/utils';
import DialogMessage from '../../../components/DialogMessage';
import fpnImage from '../../../images/fpn';

export default ({ plan, onDismiss }: { plan: Plan; onDismiss: () => void }) => {
  const { product_name: productName } = plan;
  const { webIconURL } = metadataFromPlan(plan);
  return (
    <DialogMessage onDismiss={onDismiss} data-testid="reactivate-subscription-success-dialog">
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
