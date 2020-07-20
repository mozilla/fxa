import React from 'react';
import { Plan } from '../../../store/types';
import { metadataFromPlan } from 'fxa-shared/subscriptions/metadata';
import DialogMessage from '../../../components/DialogMessage';
import fpnImage from '../../../images/fpn';
import { Localized } from '@fluent/react';

export default ({ plan, onDismiss }: { plan: Plan; onDismiss: () => void }) => {
  const { product_name: productName } = plan;
  const { webIconURL, webIconBackground } = metadataFromPlan(plan);

  const setWebIconBackground = webIconBackground
    ? { background: webIconBackground }
    : '';

  return (
    <DialogMessage
      onDismiss={onDismiss}
      data-testid="reactivate-subscription-success-dialog"
    >
      <div className="dialog-icon" style={{ ...setWebIconBackground }}>
        <img
          alt={productName}
          src={webIconURL || fpnImage}
          width="48"
          height="48"
        />
      </div>
      <p
        data-testid="reactivate-subscription-success"
        className="reactivate-subscription-success"
      >
        <Localized id="reactivate-success-copy">
          Thanks! You're all set.
        </Localized>
      </p>
      <button
        className="settings-button"
        onClick={onDismiss}
        data-testid="reactivate-subscription-success-button"
      >
        <Localized id="reactivate-success-button">Close</Localized>
      </button>
    </DialogMessage>
  );
};
