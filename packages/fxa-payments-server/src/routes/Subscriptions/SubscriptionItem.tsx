/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// React looks unused here, but we need it for Storybook.
import React, { useContext } from 'react';
import { Localized } from '@fluent/react';
import { Plan, Customer } from '../../store/types';
import { SelectorReturns } from '../../store/selectors';
import { SubscriptionsProps } from './index';

import DialogMessage from '../../components/DialogMessage';
import AppContext from '../../lib/AppContext';

import CancelSubscriptionPanel from './Cancel/CancelSubscriptionPanel';
import ReactivateSubscriptionPanel from './Reactivate/ManagementPanel';
import { PaymentProvider } from 'fxa-payments-server/src/lib/PaymentProvider';
import { WebSubscription } from 'fxa-shared/subscriptions/types';
import { SubsequentInvoicePreview } from 'fxa-shared/dto/auth/payments/invoice';

export type SubscriptionItemProps = {
  customerSubscription: WebSubscription;
  plan: Plan | null;
  cancelSubscription: SubscriptionsProps['cancelSubscription'];
  reactivateSubscription: SubscriptionsProps['reactivateSubscription'];
  customer: Customer;
  cancelSubscriptionStatus: SelectorReturns['cancelSubscriptionStatus'];
  subsequentInvoice: SubsequentInvoicePreview | undefined;
};

export const SubscriptionItem = ({
  cancelSubscription,
  cancelSubscriptionStatus,
  reactivateSubscription,
  customer,
  plan,
  customerSubscription,
  subsequentInvoice,
}: SubscriptionItemProps) => {
  const { locationReload } = useContext(AppContext);
  const total = subsequentInvoice && subsequentInvoice.total;
  const period_start = subsequentInvoice && subsequentInvoice.period_start;

  const paymentProvider: PaymentProvider | undefined =
    customer?.payment_provider;
  const promotionCode = customerSubscription.promotion_code;
  // labelId is used as the landmark identifier for each product section
  // if no plan exists, this would result in "subscription-undefined"
  // however, the existence of plan is checked in the following line,
  // preventing any mislabelled landmarks from ever getting used
  const labelId = 'subscription-' + plan?.product_id;

  if (!plan) {
    const ariaLabelledBy = "error-product-plan-not-found-header";
    const ariaDescribedBy = "error-product-plan-not-found-description";
    // TODO: This really shouldn't happen, would mean the user has a
    // subscription to a plan that no longer exists in API results.
    return (
      <DialogMessage
        className="dialog-error"
        onDismiss={locationReload}
        headerId={ariaLabelledBy}
        descId={ariaDescribedBy}
      >
        <Localized id="product-plan-not-found">
          <h4 id={ariaLabelledBy} data-testid="error-subhub-missing-plan">Plan not found</h4>
        </Localized>
        <Localized id="sub-item-no-such-plan">
          <p id={ariaDescribedBy}>No such plan for this subscription.</p>
        </Localized>
      </DialogMessage>
    );
  }

  if (
    customerSubscription.cancel_at_period_end === false &&
    !((total || total === 0) && period_start)
  ) {
    const ariaLabelledBy = "invoice-not-found-header";
    const ariaDescribedBy = "invoice-not-found-description";
    return (
      <DialogMessage
        className="dialog-error"
        onDismiss={locationReload}
        headerId={ariaLabelledBy}
        descId={ariaDescribedBy}
      >
        <Localized id="invoice-not-found">
          <h4 id={ariaLabelledBy} data-testid="error-subhub-missing-subsequent-invoice">
            Subsequent invoice not found
          </h4>
        </Localized>
        <Localized id="sub-item-no-such-subsequent-invoice">
          <p id={ariaDescribedBy}>Subsequent invoice not found for this subscription.</p>
        </Localized>
      </DialogMessage>
    );
  }

  return (
    <section className="settings-unit" aria-labelledby={labelId}>
      <div className="subscription" data-testid="subscription-item">
        <header id={labelId}>
          <h2>{plan.product_name}</h2>
        </header>

        {!customerSubscription.cancel_at_period_end &&
        (total || total === 0) &&
        period_start ? (
          <CancelSubscriptionPanel
            {...{
              cancelSubscription,
              cancelSubscriptionStatus,
              customerSubscription,
              plan,
              paymentProvider,
              promotionCode,
              subsequentInvoiceAmount: total,
              subsequentInvoiceDate: period_start,
            }}
          />
        ) : (
          <>
            <ReactivateSubscriptionPanel
              {...{
                plan,
                customer,
                customerSubscription,
                reactivateSubscription,
              }}
            />
          </>
        )}
      </div>
    </section>
  );
};

export default SubscriptionItem;
