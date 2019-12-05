import React, { useCallback, useContext, useEffect } from 'react';

import { Plan, CustomerSubscription } from '../../../lib/types';
import { metadataFromPlan } from '../../../lib/metadataFromPlan';
import * as Amplitude from '../../../lib/amplitude';

import {
  formatCurrencyInCents,
  formatPeriodEndDate,
} from '../../../lib/formats';
import { useCallbackOnce } from '../../../lib/hooks';

import { Form, SubmitButton, Checkbox } from '../../../components/fields';
import { useValidatorState } from '../../../lib/validator';

import DialogMessage from '../../../components/DialogMessage';
import PaymentLegalBlurb from '../../../components/PaymentLegalBlurb';
import ProfileBanner from '../ProfileBanner';

import './index.scss';

import AppContext from '../../../lib/AppContext';
import { apiUpdateSubscriptionPlan } from '../../../lib/apiClient';
import { useAwait, PromiseState } from '../../../lib/hooks';
import { SignInLayoutContext } from '../../../components/AppLayout';

export type SubscriptionUpgradeProps = {
  selectedPlan: Plan;
  upgradeFromPlan: Plan;
  upgradeFromSubscription: CustomerSubscription;
  initialUpdateSubscriptionPlan?: PromiseState;
};

export const SubscriptionUpgrade = ({
  selectedPlan,
  upgradeFromPlan,
  upgradeFromSubscription,
  initialUpdateSubscriptionPlan,
}: SubscriptionUpgradeProps) => {
  const { customer, profile, fetchCustomer, fetchSubscriptions } = useContext(
    AppContext
  );

  const { setHideLogo } = useContext(SignInLayoutContext);
  useEffect(() => {
    setHideLogo(true);
  }, [setHideLogo]);

  const [
    updateSubscriptionPlanStatus,
    updateSubscriptionPlan,
    resetUpdateSubscriptionPlan,
  ] = useAwait(apiUpdateSubscriptionPlan, {
    initialState: initialUpdateSubscriptionPlan,
    executeImmediately: false,
  });

  const validator = useValidatorState();

  const inProgress = updateSubscriptionPlanStatus.pending;

  useEffect(() => {
    Amplitude.updateSubscriptionPlanMounted(selectedPlan);
  }, [selectedPlan]);

  const engageOnce = useCallbackOnce(() => {
    Amplitude.updateSubscriptionPlanEngaged(selectedPlan);
  }, [selectedPlan]);

  const onSubmit = useCallback(
    async ev => {
      ev.preventDefault();
      if (validator.allValid()) {
        await updateSubscriptionPlan({
          subscriptionId: upgradeFromSubscription.subscription_id,
          planId: selectedPlan.plan_id,
          productId: selectedPlan.product_id,          
        });
        await Promise.all([fetchCustomer(), fetchSubscriptions()]);
      }
    },
    [
      validator,
      updateSubscriptionPlan,
      upgradeFromSubscription,
      selectedPlan,
      fetchCustomer,
      fetchSubscriptions,
    ]
  );

  if (!customer || !profile) {
    return null;
  }

  const {
    last4: cardLast4,
    exp_month: cardExpMonth,
    exp_year: cardExpYear,
    // TODO https://github.com/mozilla/fxa/issues/3037
    // brand: cardBrand,
  } = customer;

  return (
    <div
      className="product-payment product-upgrade"
      data-testid="subscription-upgrade"
    >
      {updateSubscriptionPlanStatus.error && (
        <DialogMessage
          className="dialog-error"
          onDismiss={resetUpdateSubscriptionPlan}
        >
          <h4 data-testid="error-plan-update-failed">Plan update failed</h4>
          <p>{updateSubscriptionPlanStatus.error.message}</p>
        </DialogMessage>
      )}

      <ProfileBanner profile={profile} />

      <hr />

      <div className="upgrade-details">
        <h2>Review your upgrade details</h2>
        <ol className="upgrade-plans">
          <li className="from-plan">
            <PlanDetail plan={upgradeFromPlan} />
          </li>
          <li
            role="img"
            aria-label="upgrade indicator"
            className="upgrade-indicator"
          >
            &nbsp;
          </li>
          <li className="to-plan">
            <PlanDetail plan={selectedPlan} />
          </li>
        </ol>
      </div>

      <hr />

      <Form
        data-testid="upgrade-form"
        className="upgrade"
        {...{ validator, onSubmit }}
      >
        <h3 className="billing-title">
          <span className="title">Billing Information</span>

          <span className="card-details">
            {/* TODO: we don't have data from subhub to determine card icon
                https://github.com/mozilla/fxa/issues/3037
              <span className="icon">&nbsp;</span>
            */}
            <span className="last4">Card Ending {cardLast4}</span>
            <span className="expires">
              Expires {cardExpMonth}/{cardExpYear}
            </span>
          </span>
        </h3>

        <p>
          Your plan will change immediately, and you’ll be charged an adjusted
          amount for the rest of your billing cycle. Starting{' '}
          {formatPeriodEndDate(upgradeFromSubscription.current_period_end)}{' '}
          you’ll be charged the full amount.
        </p>

        <Checkbox
          data-testid="confirm"
          name="confirm"
          onClick={engageOnce}
          required
        >
          I authorize Mozilla, maker of Firefox products, to charge my payment
          method{' '}
          <strong>
            $
            {`${formatCurrencyInCents(selectedPlan.amount)}/${
              selectedPlan.interval
            }`}
          </strong>
          , according to payment terms, until I cancel my subscription.
        </Checkbox>

        <div className="button-row">
          <SubmitButton
            data-testid="submit"
            name="submit"
            disabled={inProgress}
          >
            {inProgress ? (
              <span data-testid="spinner-submit" className="spinner">
                &nbsp;
              </span>
            ) : (
              <span>Change Plans</span>
            )}
          </SubmitButton>
        </div>

        <PaymentLegalBlurb />
      </Form>
    </div>
  );
};

const PlanDetail = ({ plan }: { plan: Plan }) => {
  const { product_name: productName, amount, interval } = plan;
  const { webIconURL } = metadataFromPlan(plan);
  return (
    <div className="upgrade-plan-detail">
      {webIconURL && (
        <img src={webIconURL} alt={productName} height="49" width="49" />
      )}
      <span className="product-name">{productName}</span>
      <span className="plan-price">
        ${formatCurrencyInCents(amount)}/{interval}
      </span>
    </div>
  );
};

export default SubscriptionUpgrade;
