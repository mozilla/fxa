import React, { useCallback, useEffect, useContext } from 'react';
import { Localized } from '@fluent/react';

import {
  Plan,
  Customer,
  CustomerSubscription,
  Profile,
} from '../../../store/types';
import { SelectorReturns } from '../../../store/selectors';

import * as Amplitude from '../../../lib/amplitude';

import {
  getLocalizedDate,
  getLocalizedDateString,
  getLocalizedCurrency,
  formatPlanPricing,
  getDefaultPaymentConfirmText,
} from '../../../lib/formats';
import { useCallbackOnce } from '../../../lib/hooks';

import { Form, SubmitButton, Checkbox } from '../../../components/fields';
import { useValidatorState } from '../../../lib/validator';

import DialogMessage from '../../../components/DialogMessage';
import PaymentLegalBlurb from '../../../components/PaymentLegalBlurb';
import { TermsAndPrivacy } from '../../../components/TermsAndPrivacy';

import PlanUpgradeDetails from './PlanUpgradeDetails';
import Header from '../../../components/Header';
import { AppContext } from '../../../lib/AppContext';
import { productDetailsFromPlan } from 'fxa-shared/subscriptions/metadata';

import './index.scss';

import { ProductProps } from '../index';

export type SubscriptionUpgradeProps = {
  isMobile: boolean;
  profile: Profile;
  customer: Customer;
  selectedPlan: Plan;
  upgradeFromPlan: Plan;
  upgradeFromSubscription: CustomerSubscription;
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
  const { navigatorLanguages } = useContext(AppContext);
  const { termsOfServiceURL, privacyNoticeURL } = productDetailsFromPlan(
    selectedPlan,
    navigatorLanguages
  );

  const validator = useValidatorState();

  const inProgress = updateSubscriptionPlanStatus.loading;

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

  const { last4: cardLast4, brand: cardBrand } = customer;

  const cardBrandLc = ('' + cardBrand).toLowerCase();

  const mobileUpdateHeading = isMobile ? (
    <div className="mobile-subscription-update-heading">
      <div className="subscription-update-heading">
        <Localized id="product-plan-upgrade-heading">
          <h2>Review your upgrade</h2>
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
        >
          <Localized id="sub-update-failed">
            <h4 data-testid="error-plan-update-failed">Plan update failed</h4>
          </Localized>
          <p>{updateSubscriptionPlanStatus.error.message}</p>
        </DialogMessage>
      )}
      <Header {...{ profile }} />
      <div className="main-content">
        <div
          className="product-payment product-upgrade"
          data-testid="subscription-upgrade"
        >
          <div
            className="subscription-update-heading"
            data-testid="subscription-update-heading"
          >
            <Localized id="product-plan-upgrade-heading">
              <h2>Review your upgrade</h2>
            </Localized>
            <p className="subheading"></p>
          </div>

          <div className="payment-details">
            <h3 className="billing-title">
              <Localized id="sub-update-title">
                <span className="title">Billing information</span>
              </Localized>
            </h3>

            <div>
              <Localized
                id="payment-confirmation-cc-preview"
                vars={{
                  last4: cardLast4 as string,
                }}
              >
                <p className={`c-card ${cardBrandLc}`}>
                  {' '}
                  ending in {cardLast4}
                </p>
              </Localized>
            </div>
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

            <Localized
              id={`sub-update-confirm-with-legal-links-${selectedPlan.interval}`}
              vars={{
                amount: getLocalizedCurrency(
                  selectedPlan.amount,
                  selectedPlan.currency
                ),
                intervalCount: selectedPlan.interval_count,
              }}
              elems={{
                strong: <strong></strong>,
                termsOfServiceLink: <a href={termsOfServiceURL}></a>,
                privacyNoticeLink: <a href={privacyNoticeURL}></a>,
              }}
            >
              <Checkbox
                data-testid="confirm"
                name="confirm"
                onClick={engageOnce}
                required
              >
                {getDefaultPaymentConfirmText(
                  selectedPlan.amount,
                  selectedPlan.currency,
                  selectedPlan.interval,
                  selectedPlan.interval_count
                )}
              </Checkbox>
            </Localized>

            <hr />

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
                    <span>Confirm upgrade</span>
                  </Localized>
                )}
              </SubmitButton>
            </div>

            <PaymentLegalBlurb />
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
