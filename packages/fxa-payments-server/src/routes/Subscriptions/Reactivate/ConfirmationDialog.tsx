import React from 'react';
import { Localized } from '@fluent/react';
import {
  getLocalizedDate,
  getLocalizedDateString,
  getLocalizedCurrency,
  getLocalizedCurrencyString,
} from '../../../lib/formats';
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
  periodEndDate: number;
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
      <Localized
        id="reactivate-confirm-dialog-header"
        $name={plan.product_name}
      >
        <h4>Want to keep using {plan.product_name}?</h4>
      </Localized>
      {/* TO DO: display card type, IE 'to the Visa card ending...' */}
      <Localized
        id="reactivate-confirm-copy"
        $name={plan.product_name}
        $amount={getLocalizedCurrency(plan.amount, plan.currency)}
        $last={last4}
        $endDate={getLocalizedDate(periodEndDate)}
      >
        <p>
          Your access to {plan.product_name} will continue, and your billing
          cycle and payment will stay the same. Your next charge will be
          {getLocalizedCurrencyString(plan.amount, plan.currency)} to the card
          ending in {last4} on {getLocalizedDateString(periodEndDate)}.
        </p>
      </Localized>
      <div className="action">
        <button
          className="settings-button"
          onClick={onConfirm}
          data-testid="reactivate-subscription-confirm-button"
        >
          <Localized id="reactivate-confirm-button">
            <span className="change-button">Resubscribe</span>
          </Localized>
        </button>
      </div>
    </DialogMessage>
  );
};
