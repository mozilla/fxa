import React, { useCallback, useEffect, useState } from 'react';
import { Localized } from '@fluent/react';

import { Plan, Customer, Profile } from '../../../store/types';
import { SelectorReturns } from '../../../store/selectors';

import * as Amplitude from '../../../lib/amplitude';

import { getLocalizedDate, getLocalizedDateString } from '../../../lib/formats';
import { useCallbackOnce } from '../../../lib/hooks';
import {
  GAEvent,
  GAPurchaseType,
  ReactGALog,
} from '../../../lib/reactga-event';

import { Form, SubmitButton } from '../../../components/fields';
import { useValidatorState } from '../../../lib/validator';

import DialogMessage from '../../../components/DialogMessage';
import PaymentLegalBlurb from '../../../components/PaymentLegalBlurb';
import { TermsAndPrivacy } from '../../../components/TermsAndPrivacy';
import { PaymentProvider } from 'fxa-payments-server/src/lib/PaymentProvider';

import PlanUpgradeDetails from './PlanUpgradeDetails';
import Header from '../../../components/Header';

import './index.scss';

import { ProductProps } from '../index';
import { PaymentConsentCheckbox } from '../../../components/PaymentConsentCheckbox';
import { PaymentProviderDetails } from '../../../components/PaymentProviderDetails';
import { AbbrevPlan, WebSubscription } from 'fxa-shared/subscriptions/types';
import { FirstInvoicePreview } from 'fxa-shared/dto/auth/payments/invoice';

export type SubscriptionUpgradeProps = {
  profile: Profile;
  customer: Customer;
  selectedPlan: Plan;
  upgradeFromPlan: AbbrevPlan;
  upgradeFromSubscription: WebSubscription;
  invoicePreview: FirstInvoicePreview;
  discount?: number;
  isMobile?: boolean;
  updateSubscriptionPlanStatus: SelectorReturns['updateSubscriptionPlanStatus'];
  updateSubscriptionPlanAndRefresh: ProductProps['updateSubscriptionPlanAndRefresh'];
  resetUpdateSubscriptionPlan: ProductProps['resetUpdateSubscriptionPlan'];
};

export const SubscriptionUpgrade = ({
  isMobile = false,
  profile,
  customer,
  selectedPlan,
  upgradeFromPlan,
  upgradeFromSubscription,
  invoicePreview,
  updateSubscriptionPlanStatus,
  updateSubscriptionPlanAndRefresh,
  resetUpdateSubscriptionPlan,
  discount,
}: SubscriptionUpgradeProps) => {
  const ariaLabelledBy = 'error-plan-change-failed-header';
  const ariaDescribedBy = 'error-plan-change-failed-description';
  const validator = useValidatorState();
  const [showTooltip, setShowTooltip] = useState(false);
  const [checkboxSet, setCheckboxSet] = useState(false);

  const inProgress = updateSubscriptionPlanStatus.loading;

  const paymentProvider: PaymentProvider | undefined =
    customer?.payment_provider;

  useEffect(() => {
    const metrics = {
      paymentProvider: paymentProvider,
      previousPlanId: upgradeFromSubscription.plan_id,
      previousProductId: upgradeFromSubscription.product_id,
      subscriptionId: upgradeFromSubscription.subscription_id,
      ...selectedPlan,
    };
    Amplitude.updateSubscriptionPlanMounted(metrics);
  }, [
    paymentProvider,
    selectedPlan,
    upgradeFromSubscription.plan_id,
    upgradeFromSubscription.product_id,
    upgradeFromSubscription.subscription_id,
  ]);

  const engageOnce = useCallbackOnce(() => {
    const metrics = {
      paymentProvider: paymentProvider,
      previousPlanId: upgradeFromSubscription.plan_id,
      previousProductId: upgradeFromSubscription.product_id,
      subscriptionId: upgradeFromSubscription.subscription_id,
      ...selectedPlan,
    };
    Amplitude.updateSubscriptionPlanEngaged(metrics);
  }, [selectedPlan, upgradeFromSubscription.subscription_id]);

  const handleClick = () => {
    engageOnce();
    setShowTooltip(false);
    setCheckboxSet(!checkboxSet);
  };

  const onSubmit = useCallback(
    (ev) => {
      ev.preventDefault();
      ReactGALog.logEvent({
        eventName: GAEvent.PurchaseSubmit,
        plan: selectedPlan,
        purchaseType: GAPurchaseType.Upgrade,
        discount,
      });
      if (validator.allValid()) {
        updateSubscriptionPlanAndRefresh(
          upgradeFromSubscription.subscription_id,
          upgradeFromPlan,
          selectedPlan,
          paymentProvider
        );
        ReactGALog.logEvent({
          eventName: GAEvent.Purchase,
          plan: selectedPlan,
          purchaseType: GAPurchaseType.Upgrade,
          discount,
        });
      }

      if (!checkboxSet) {
        setShowTooltip(true);
      }
    },
    [
      validator,
      updateSubscriptionPlanAndRefresh,
      upgradeFromSubscription,
      upgradeFromPlan,
      selectedPlan,
      paymentProvider,
      checkboxSet,
      discount,
    ]
  );

  const nextInvoiceDate =
    selectedPlan.interval === upgradeFromPlan.interval &&
    selectedPlan.interval_count === upgradeFromPlan.interval_count
      ? upgradeFromSubscription.current_period_end
      : invoicePreview.line_items.find(
          (item) => item.id === selectedPlan.plan_id
        )?.period.end || upgradeFromSubscription.current_period_end;

  return (
    <>
      {updateSubscriptionPlanStatus.error && (
        <DialogMessage
          className="dialog-error"
          onDismiss={resetUpdateSubscriptionPlan}
          headerId={ariaLabelledBy}
          descId={ariaDescribedBy}
        >
          <Localized id="sub-change-failed">
            <h4 id={ariaLabelledBy} data-testid="error-plan-update-failed">
              Plan change failed
            </h4>
          </Localized>
          <p id={ariaDescribedBy}>
            {updateSubscriptionPlanStatus.error.message}
          </p>
        </DialogMessage>
      )}
      <Header {...{ profile }} />
      <div className="main-content">
        <div
          className="page-title-container"
          data-testid="subscription-update-heading"
        >
          <Localized id="product-plan-change-heading">
            <h2 className="page-title">Review your change</h2>
          </Localized>
        </div>
        <div
          className="component-card product-payment product-upgrade rounded-t-none "
          data-testid="subscription-upgrade"
        >
          <div className="payment-details">
            <Localized id="sub-update-payment-title">
              <span className="label-title">Payment information</span>
            </Localized>
            <PaymentProviderDetails customer={customer!} />
          </div>

          <Form
            data-testid="upgrade-form"
            className="payment upgrade"
            {...{ validator, onSubmit }}
          >
            <hr className="my-6" />

            <Localized
              id="sub-update-acknowledgment"
              vars={{
                startingDate: getLocalizedDate(nextInvoiceDate),
              }}
            >
              <p data-testid="sub-update-acknowledgment">
                Your plan will change immediately, and you’ll be charged a
                prorated amount today for the rest of this billing cycle.
                Starting {getLocalizedDateString(nextInvoiceDate)} you’ll be
                charged the full amount.
              </p>
            </Localized>

            <hr className="my-6" />

            <PaymentConsentCheckbox
              plan={selectedPlan}
              onClick={handleClick}
              showTooltip={showTooltip}
            />

            <hr className="my-6" />

            <div className="button-row">
              <SubmitButton
                data-testid="submit"
                className="button"
                name="submit"
                disabled={inProgress}
              >
                {inProgress ? (
                  <span data-testid="spinner-submit" className="spinner">
                    &nbsp;
                  </span>
                ) : (
                  <Localized id="sub-change-submit">
                    <span>Confirm change</span>
                  </Localized>
                )}
              </SubmitButton>
            </div>

            <div className="payment-footer" data-testid="footer">
              <PaymentLegalBlurb provider={paymentProvider} />
              <TermsAndPrivacy plan={selectedPlan} />
            </div>
          </Form>
        </div>
        <PlanUpgradeDetails
          {...{
            profile,
            selectedPlan,
            upgradeFromPlan,
            isMobile,
            showExpandButton: isMobile,
            invoicePreview,
            className: 'payment-panel',
          }}
        />
      </div>
    </>
  );
};

export default SubscriptionUpgrade;
