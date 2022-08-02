import React, { useCallback, useEffect } from 'react';
import { Localized } from '@fluent/react';

import { Plan, Customer, Profile } from '../../../store/types';
import { SelectorReturns } from '../../../store/selectors';

import * as Amplitude from '../../../lib/amplitude';

import { getLocalizedDate, getLocalizedDateString } from '../../../lib/formats';
import { useCallbackOnce } from '../../../lib/hooks';

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
import { WebSubscription } from 'fxa-shared/subscriptions/types';

export type SubscriptionUpgradeProps = {
  isMobile: boolean;
  profile: Profile;
  customer: Customer;
  selectedPlan: Plan;
  upgradeFromPlan: Plan;
  upgradeFromSubscription: WebSubscription;
  updateSubscriptionPlanStatus: SelectorReturns['updateSubscriptionPlanStatus'];
  updateSubscriptionPlanAndRefresh: ProductProps['updateSubscriptionPlanAndRefresh'];
  resetUpdateSubscriptionPlan: ProductProps['resetUpdateSubscriptionPlan'];
};

export const SubscriptionUpgrade = ({
  isMobile,
  profile,
  customer,
  selectedPlan,
  upgradeFromPlan,
  upgradeFromSubscription,
  updateSubscriptionPlanAndRefresh,
  resetUpdateSubscriptionPlan,
  updateSubscriptionPlanStatus,
}: SubscriptionUpgradeProps) => {
  const ariaLabelledBy = 'error-plan-change-failed-header';
  const ariaDescribedBy = 'error-plan-change-failed-description';
  const validator = useValidatorState();

  const inProgress = updateSubscriptionPlanStatus.loading;

  const paymentProvider: PaymentProvider | undefined =
    customer?.payment_provider;

  useEffect(() => {
    Amplitude.updateSubscriptionPlanMounted(selectedPlan);
  }, [selectedPlan]);

  const engageOnce = useCallbackOnce(() => {
    Amplitude.updateSubscriptionPlanEngaged(selectedPlan);
  }, [selectedPlan]);

  const onSubmit = useCallback(
    (ev) => {
      ev.preventDefault();
      if (validator.allValid()) {
        updateSubscriptionPlanAndRefresh(
          upgradeFromSubscription.subscription_id,
          selectedPlan,
          paymentProvider
        );
      }
    },
    [
      validator,
      updateSubscriptionPlanAndRefresh,
      upgradeFromSubscription,
      selectedPlan,
      paymentProvider,
    ]
  );

  const mobileUpdateHeading = isMobile ? (
    <div className="mobile-subscription-title">
      <div className="subscription-update-heading">
        <Localized id="product-plan-change-heading">
          <h2>Review your change</h2>
        </Localized>
      </div>
    </div>
  ) : null;

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
          className="product-payment product-upgrade"
          data-testid="subscription-upgrade"
        >
          {!isMobile ? (
            <div
              className="subscription-update-heading"
              data-testid="subscription-update-heading"
            >
              <Localized id="product-plan-change-heading">
                <h2>Review your change</h2>
              </Localized>
              <p className="subheading"></p>
            </div>
          ) : null}
          <div className="payment-details">
            <h3 className="billing-title">
              <Localized id="sub-update-payment-title">
                <span className="title">Payment information</span>
              </Localized>
            </h3>
            <PaymentProviderDetails customer={customer!} />
          </div>

          <Form
            data-testid="upgrade-form"
            className="payment upgrade"
            {...{ validator, onSubmit }}
          >
            <hr />
            <Localized
              id="sub-update-copy"
              vars={{
                startingDate: getLocalizedDate(
                  upgradeFromSubscription.current_period_end
                ),
              }}
            >
              <p>
                Your plan will change immediately, and you’ll be charged an
                adjusted amount for the rest of your billing cycle. Starting
                {getLocalizedDateString(
                  upgradeFromSubscription.current_period_end
                )}{' '}
                you’ll be charged the full amount.
              </p>
            </Localized>

            <hr />

            <PaymentConsentCheckbox plan={selectedPlan} onClick={engageOnce} />

            <hr />

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

            <PaymentLegalBlurb provider={paymentProvider} />
            <TermsAndPrivacy plan={selectedPlan} />
          </Form>
        </div>
        <PlanUpgradeDetails
          {...{
            profile,
            selectedPlan,
            upgradeFromPlan,
            isMobile,
            showExpandButton: isMobile,
          }}
        />
        {mobileUpdateHeading}
      </div>
    </>
  );
};

export default SubscriptionUpgrade;
