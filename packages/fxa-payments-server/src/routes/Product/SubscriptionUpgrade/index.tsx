import React, { useCallback } from 'react';

import {
  Plan,
  Profile,
  Customer,
  CustomerSubscription,
} from '../../../store/types';
import { SelectorReturns } from '../../../store/selectors';
import { metadataFromPlan } from '../../../store/utils';

import {
  formatCurrencyInCents,
  formatPeriodEndDate,
} from '../../../lib/formats';

import { Form, SubmitButton, Checkbox } from '../../../components/fields';
import { useValidatorState } from '../../../lib/validator';

import DialogMessage from '../../../components/DialogMessage';
import PaymentLegalBlurb from '../../../components/PaymentLegalBlurb';
import ProfileBanner from '../ProfileBanner';

import './index.scss';

import { ProductProps } from '../index';

export type SubscriptionUpgradeProps = {
  customer: Customer;
  profile: Profile;
  selectedPlan: Plan;
  upgradeFromPlan: Plan;
  upgradeFromSubscription: CustomerSubscription;
  updateSubscriptionPlanStatus: SelectorReturns['updateSubscriptionPlanStatus'];
  updateSubscriptionPlanAndRefresh: ProductProps['updateSubscriptionPlanAndRefresh'];
  resetUpdateSubscriptionPlan: ProductProps['resetUpdateSubscriptionPlan'];
};

export const SubscriptionUpgrade = ({
  customer,
  profile,
  selectedPlan,
  upgradeFromPlan,
  upgradeFromSubscription,
  updateSubscriptionPlanAndRefresh,
  resetUpdateSubscriptionPlan,
  updateSubscriptionPlanStatus,
}: SubscriptionUpgradeProps) => {
  const validator = useValidatorState();

  const inProgress = updateSubscriptionPlanStatus.loading;

  const onSubmit = useCallback(
    ev => {
      ev.preventDefault();
      if (validator.allValid()) {
        updateSubscriptionPlanAndRefresh(
          upgradeFromSubscription.subscription_id,
          selectedPlan
        );
      }
    },
    [
      validator,
      updateSubscriptionPlanAndRefresh,
      upgradeFromSubscription,
      selectedPlan,
    ]
  );

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
              Expires: {cardExpMonth}/{cardExpYear}
            </span>
          </span>
        </h3>

        <p>
          Your plan will change immediately, and you’ll be charged an adjusted
          price for the rest of your billing cycle. Starting{' '}
          {formatPeriodEndDate(upgradeFromSubscription.current_period_end)}{' '}
          you’ll be charged the full price.
        </p>

        <Checkbox data-testid="confirm" name="confirm" required>
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
