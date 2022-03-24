import React, { useState, useEffect } from 'react';
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
import { metadataFromPlan } from 'fxa-shared/subscriptions/metadata';
import { apiInvoicePreview } from '../../../lib/apiClient';
import { WebSubscription } from 'fxa-shared/subscriptions/types';
import LoadingSpinner from '../../../components/LoadingSpinner';
import { useHandleConfirmationDialog } from '../../../lib/hooks';

const ConfirmationDialogErrorContent = () => (
  <>
    <Localized id="general-error-heading">
      <h4 data-testid="reactivate-confirm-error-loading">
        General application error
      </h4>
    </Localized>
    <Localized id="basic-error-message">
      <p>Something went wrong. Please try again later.</p>
    </Localized>
  </>
);

const ConfirmationDialogContent = ({
  onConfirm,
  periodEndDate,
  currency,
  productName,
  amount,
  last4,
  webIconBackground,
  webIconURL,
}: {
  onConfirm: () => void;
  periodEndDate: number;
  currency: string;
  productName: string;
  amount: number;
  last4: string | undefined;
  webIconBackground: string | null | undefined;
  webIconURL: string | null;
}) => {
  return (
    <>
      <div
        className="dialog-icon"
        style={webIconBackground ? { background: webIconBackground } : {}}
      >
        <img
          className="reactivate-subscription"
          alt={productName}
          src={webIconURL || fpnImage}
          height="48"
          width="48"
        />
      </div>
      <Localized
        id="reactivate-confirm-dialog-header"
        vars={{
          name: productName,
        }}
      >
        <h4>Want to keep using {productName}?</h4>
      </Localized>
      {last4 && (
        <Localized
          id="reactivate-confirm-copy"
          vars={{
            name: productName,
            amount: getLocalizedCurrency(amount, currency),
            last: last4,
            endDate: getLocalizedDate(periodEndDate),
          }}
        >
          <p>
            Your access to {productName} will continue, and your billing cycle
            and payment will stay the same. Your next charge will be
            {getLocalizedCurrencyString(amount, currency)} to the card ending in{' '}
            {last4} on {getLocalizedDateString(periodEndDate)}.
          </p>
        </Localized>
      )}
      {!last4 && (
        <Localized
          id="reactivate-confirm-without-payment-method-copy"
          vars={{
            name: productName,
            amount: getLocalizedCurrency(amount, currency),
            endDate: getLocalizedDate(periodEndDate),
          }}
        >
          <p>
            Your access to {productName} will continue, and your billing cycle
            and payment will stay the same. Your next charge will be{' '}
            {getLocalizedCurrencyString(amount, currency)} on{' '}
            {getLocalizedDateString(periodEndDate)}.
          </p>
        </Localized>
      )}
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
    </>
  );
};

const ConfirmationDialog = ({
  onDismiss,
  onConfirm,
  plan,
  customer,
  customerSubscription,
  periodEndDate,
}: {
  onDismiss: Function;
  onConfirm: () => void;
  plan: Plan;
  customer: Customer;
  customerSubscription: WebSubscription;
  periodEndDate: number;
}) => {
  const { webIconURL, webIconBackground } = metadataFromPlan(plan);
  const { last4 } = customer;

  const { loading, error, amount } = useHandleConfirmationDialog(
    customerSubscription,
    plan
  );

  return (
    <DialogMessage onDismiss={onDismiss}>
      {!loading ? (
        <>
          {/* TO DO: display card type, IE 'to the Visa card ending...' */}
          {error ? (
            <ConfirmationDialogErrorContent />
          ) : (
            <ConfirmationDialogContent
              onConfirm={onConfirm}
              periodEndDate={periodEndDate}
              currency={plan.currency}
              productName={plan.product_name}
              amount={amount}
              last4={last4}
              webIconURL={webIconURL}
              webIconBackground={webIconBackground}
            />
          )}
        </>
      ) : (
        <div className="my-24">
          <LoadingSpinner />
        </div>
      )}
    </DialogMessage>
  );
};

export default ConfirmationDialog;
