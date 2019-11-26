import React from 'react';
import { formatCurrencyInCents } from '../../../lib/formats';
import DialogMessage from '../../../components/DialogMessage';
import fpnImage from '../../../images/fpn';
import { Plan, Customer } from '../../../store/types';
import { metadataFromPlan } from '../../../store/utils';

export default ({
  onDismiss,
  onConfirm,
  plan,
  customer,
  periodEndDate,
}: {
  onDismiss: Function;
  onConfirm: () => void;
  plan: Plan;
  customer: Customer;
  periodEndDate: string;
}) => {
  const { webIconURL } = metadataFromPlan(plan);
  const { last4 } = customer;

  return (
    <DialogMessage onDismiss={onDismiss}>
      <img
        className="fpn-reactivate-subscription"
        alt={plan.product_name}
        src={webIconURL || fpnImage}
        height="48"
        width="48"
      />
      <h4>Want to keep using {plan.product_name}?</h4>
      {/* TO DO: display card type, IE 'to the Visa card ending...' */}
      <p>
        Your access to {plan.product_name} will continue, and your billing cycle
        and payment will stay the same. Your next charge will be $
        {formatCurrencyInCents(plan.amount)} to the card ending in {last4} on{' '}
        {periodEndDate}.
      </p>
      <div className="action">
        <button
          className="settings-button"
          onClick={onConfirm}
          data-testid="reactivate-subscription-confirm-button"
        >
          <span className="change-button">Resubscribe</span>
        </button>
      </div>
    </DialogMessage>
  );
};
