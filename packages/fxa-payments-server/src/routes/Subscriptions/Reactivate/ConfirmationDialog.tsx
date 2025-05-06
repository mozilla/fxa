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
import AppContext from '../../../lib/AppContext';
import { SubsequentInvoicePreview } from 'fxa-shared/dto/auth/payments/invoice';
import * as Provider from '../../../lib/PaymentProvider';

const ConfirmationDialogContent = ({
  onConfirm,
  headerId,
  descId,
  periodEndDate,
  currency,
  productName,
  amount,
  last4,
  payment_provider,
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
  payment_provider: Provider.PaymentProvider | undefined;
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
      {Provider.isPaypal(payment_provider) || !last4 ? (
        <Localized
          id="reactivate-confirm-without-payment-method-copy"
          vars={{
            name: productName,
            amount: getLocalizedCurrency(amount, currency),
            endDate: getLocalizedDate(periodEndDate),
          }}
        >
          <p id={descId} data-testid="reactivate-modal-copy-paypal">
            Your access to {productName} will continue, and your billing cycle
            and payment will stay the same. Your next charge will be{' '}
            {getLocalizedCurrencyString(amount, currency)} on{' '}
            {getLocalizedDateString(periodEndDate)}.
          </p>
        </Localized>
      ) : (
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
  subsequentInvoice,
  periodEndDate,
}: {
  onDismiss: Function;
  onConfirm: () => void;
  plan: Plan;
  customer: Customer;
  subsequentInvoice: SubsequentInvoicePreview;
  periodEndDate: number;
}) => {
  const { navigatorLanguages, config } = useContext(AppContext);
  const { webIcon, webIconBackground } = webIconConfigFromProductConfig(
    plan,
    navigatorLanguages,
    config.featureFlags.useFirestoreProductConfigs
  );
  const { last4, payment_provider } = customer;

  const amount = subsequentInvoice.total;

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
        currency={subsequentInvoice.currency}
        productName={plan.product_name}
        amount={amount}
        last4={last4}
        payment_provider={payment_provider}
        webIconURL={webIcon}
        webIconBackground={webIconBackground}
      />
    </DialogMessage>
  );
};

export default ConfirmationDialog;
