import React, { useCallback, useEffect } from 'react';
import { Localized } from '@fluent/react';

import {
  Plan,
  Customer,
  CustomerSubscription,
  PlanInterval,
} from '../../../store/types';
import { SelectorReturns } from '../../../store/selectors';
import { metadataFromPlan } from '../../../store/utils';

import * as Amplitude from '../../../lib/amplitude';

import {
  getLocalizedDate,
  getLocalizedDateString,
  getLocalizedCurrency,
  formatPlanPricing,
} from '../../../lib/formats';
import { useCallbackOnce } from '../../../lib/hooks';

import { Form, SubmitButton, Checkbox } from '../../../components/fields';
import { useValidatorState } from '../../../lib/validator';

import DialogMessage from '../../../components/DialogMessage';
import PaymentLegalBlurb from '../../../components/PaymentLegalBlurb';

import './index.scss';

import { ProductProps } from '../index';

function getDefaultConfirmText(
  amount: number,
  currency: string,
  interval: PlanInterval,
  intervalCount: number
) {
  const planPricing = formatPlanPricing(
    amount,
    currency,
    interval,
    intervalCount
  );
  return `I authorize Mozilla, maker of Firefox products, to charge my payment method <strong>${planPricing}</strong>, according to payment terms, until I cancel my subscription.`;
}

export type SubscriptionUpgradeProps = {
  customer: Customer;
  selectedPlan: Plan;
  upgradeFromPlan: Plan;
  upgradeFromSubscription: CustomerSubscription;
  updateSubscriptionPlanStatus: SelectorReturns['updateSubscriptionPlanStatus'];
  updateSubscriptionPlanAndRefresh: ProductProps['updateSubscriptionPlanAndRefresh'];
  resetUpdateSubscriptionPlan: ProductProps['resetUpdateSubscriptionPlan'];
};

export const SubscriptionUpgrade = ({
  customer,
  selectedPlan,
  upgradeFromPlan,
  upgradeFromSubscription,
  updateSubscriptionPlanAndRefresh,
  resetUpdateSubscriptionPlan,
  updateSubscriptionPlanStatus,
}: SubscriptionUpgradeProps) => {
  const validator = useValidatorState();

  const inProgress = updateSubscriptionPlanStatus.loading;

  useEffect(() => {
    Amplitude.updateSubscriptionPlanMounted(selectedPlan);
  }, [selectedPlan]);

  const engageOnce = useCallbackOnce(() => {
    Amplitude.updateSubscriptionPlanEngaged(selectedPlan);
  }, [selectedPlan]);

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
          <Localized id="sub-update-failed">
            <h4 data-testid="error-plan-update-failed">Plan update failed</h4>
          </Localized>
          <p>{updateSubscriptionPlanStatus.error.message}</p>
        </DialogMessage>
      )}

      <hr />

      <div className="upgrade-details">
        <h2>Review your upgrade details</h2>
        <ol className="upgrade-plans">
          <li className="from-plan">
            <PlanDetail plan={upgradeFromPlan} />
          </li>
          <Localized id="sub-update-indicator">
            <li
              role="img"
              aria-label="upgrade indicator"
              className="upgrade-indicator"
            >
              &nbsp;
            </li>
          </Localized>
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
          <Localized id="sub-update-title">
            <span className="title">Billing Information</span>
          </Localized>

          <span className="card-details">
            {/* TODO: we don't have data from subhub to determine card icon
                https://github.com/mozilla/fxa/issues/3037
              <span className="icon">&nbsp;</span>
            */}
            <Localized id="sub-update-card-ending" $last={cardLast4}>
              <span className="last">Card Ending {cardLast4}</span>
            </Localized>
            <Localized
              id="sub-update-card-exp"
              $cardExpMonth={cardExpMonth}
              $cardExpYear={cardExpYear}
            >
              <span className="expires">
                Expires {cardExpMonth}/{cardExpYear}
              </span>
            </Localized>
          </span>
        </h3>

        <Localized
          id="sub-update-copy"
          $startingDate={getLocalizedDate(
            upgradeFromSubscription.current_period_end
          )}
        >
          <p>
            Your plan will change immediately, and you’ll be charged an adjusted
            amount for the rest of your billing cycle. Starting{' '}
            {getLocalizedDateString(upgradeFromSubscription.current_period_end)}{' '}
            you’ll be charged the full amount.
          </p>
        </Localized>

        <Checkbox
          data-testid="confirm"
          name="confirm"
          onClick={engageOnce}
          required
        >
          <Localized
            id={`sub-update-confirm-${selectedPlan.interval}`}
            strong={<strong></strong>}
            $amount={getLocalizedCurrency(
              selectedPlan.amount,
              selectedPlan.currency
            )}
            $intervalCount={selectedPlan.interval_count}
          >
            <p>
              {getDefaultConfirmText(
                selectedPlan.amount,
                selectedPlan.currency,
                selectedPlan.interval,
                selectedPlan.interval_count
              )}
            </p>
          </Localized>
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
              <Localized id="sub-update-submit">
                <span>Change Plans</span>
              </Localized>
            )}
          </SubmitButton>
        </div>

        <PaymentLegalBlurb />
      </Form>
    </div>
  );
};

export const PlanDetail = ({ plan }: { plan: Plan }) => {
  const {
    product_name: productName,
    amount,
    currency,
    interval,
    interval_count,
  } = plan;
  const { webIconURL } = metadataFromPlan(plan);
  const planPrice = formatPlanPricing(
    amount,
    currency,
    interval,
    interval_count
  );

  return (
    <div className="upgrade-plan-detail">
      {webIconURL && (
        <img src={webIconURL} alt={productName} height="49" width="49" />
      )}
      <span className="product-name">{productName}</span>
      <Localized
        id={`plan-price-${interval}`}
        $amount={getLocalizedCurrency(amount, currency)}
        $intervalCount={interval_count}
      >
        <span className="plan-price">{planPrice}</span>
      </Localized>
    </div>
  );
};

export default SubscriptionUpgrade;
