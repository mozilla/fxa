import React, { useContext } from 'react';
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
import { webIconConfigFromProductConfig } from 'fxa-shared/subscriptions/configuration/utils';
import { WebSubscription } from 'fxa-shared/subscriptions/types';
import AppContext from '../../../lib/AppContext';
import { couponOnSubsequentInvoice } from '../../../lib/coupon';

const ConfirmationDialogContent = ({
  onConfirm,
  headerId,
  descId,
  periodEndDate,
  currency,
  productName,
  amount,
  last4,
  webIconBackground,
  webIconURL,
}: {
  onConfirm: () => void;
  headerId: string;
  descId: string;
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
        <h4 id={headerId}>Want to keep using {productName}?</h4>
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
          <p id={descId} data-testid="reactivate-modal-copy">
            Your access to {productName} will continue, and your billing cycle
            and payment will stay the same. Your next charge will be{' '}
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
          className="button settings-button"
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
  const { navigatorLanguages, config } = useContext(AppContext);
  const { webIcon, webIconBackground } = webIconConfigFromProductConfig(
    plan,
    navigatorLanguages,
    config.featureFlags.useFirestoreProductConfigs
  );
  const { last4 } = customer;

  const {
    promotion_code: promotionCode,
    promotion_end,
    current_period_end,
    promotion_duration,
  } = customerSubscription;

  const includeCoupon =
    promotionCode &&
    couponOnSubsequentInvoice(
      current_period_end,
      promotion_end,
      promotion_duration
    );

  // Depending on whether or not the coupon should be applied to the next invoice
  // use total or subtotal.
  const amount = includeCoupon
    ? customerSubscription.latest_invoice_items.total
    : customerSubscription.latest_invoice_items.subtotal;

  const ariaLabelledBy = 'confirmation-content-header';
  const ariaDescribedBy = 'confirmation-content-description';

  return (
    <DialogMessage
      onDismiss={onDismiss}
      headerId={ariaLabelledBy}
      descId={ariaDescribedBy}
    >
      <ConfirmationDialogContent
        onConfirm={onConfirm}
        headerId={ariaLabelledBy}
        descId={ariaDescribedBy}
        periodEndDate={periodEndDate}
        currency={plan.currency}
        productName={plan.product_name}
        amount={amount}
        last4={last4}
        webIconURL={webIcon}
        webIconBackground={webIconBackground}
      />
    </DialogMessage>
  );
};

export default ConfirmationDialog;
