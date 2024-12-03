import React, { useState, useCallback, useContext } from 'react';
import classNames from 'classnames';
import { Plan, Profile, Customer } from '../../../store/types';
import { State as ValidatorState } from '../../../lib/validator';

import {
  useCallbackOnce,
  useNonce,
  usePaypalButtonSetup,
} from '../../../lib/hooks';

import PlanDetails from '../../../components/PlanDetails';
import Header from '../../../components/Header';
import PaymentForm, {
  BasePaymentFormProps,
  StripePaymentSubmitResult,
  StripePaymentUpdateResult,
  PaypalPaymentSubmitResult,
  StripeSubmitHandler,
  StripeUpdateHandler,
} from '../../../components/PaymentForm';
import AcceptedCards from '../../Product/AcceptedCards';
import PaymentErrorView from '../../../components/PaymentErrorView';
import PaymentLegalBlurb from '../../../components/PaymentLegalBlurb';
import { SubscriptionTitle } from '../../../components/SubscriptionTitle';
import { TermsAndPrivacy } from '../../../components/TermsAndPrivacy';
import { PaymentProcessing } from '../../../components/PaymentProcessing';
import {
  getPaymentProviderMappedVal,
  PaymentProvider,
  PaymentProviders,
} from '../../../lib/PaymentProvider';
import { hasPaymentProvider } from '../../../lib/customer';
import {
  handleSubscriptionPayment,
  PaymentError,
  RetryStatus,
  SubscriptionCreateStripeAPIs,
} from '../../../lib/stripe';

import * as Amplitude from '../../../lib/amplitude';
import { Localized } from '@fluent/react';
import * as apiClient from '../../../lib/apiClient';

import '../../Product/SubscriptionCreate/index.scss';

import AppContext from '../../../lib/AppContext';
import { ButtonBaseProps } from '../../../components/PayPalButton';
import { apiCapturePaypalPayment } from '../../../lib/apiClient';
import { AuthServerErrno, GeneralError } from '../../../lib/errors';
import { PaymentMethodHeader } from '../../../components/PaymentMethodHeader';
import CouponForm from '../../../components/CouponForm';
import { CouponDetails } from 'fxa-shared/dto/auth/payments/coupon';
import { CheckoutType } from 'fxa-shared/subscriptions/types';

const PaypalButton = React.lazy(
  () => import('../../../components/PayPalButton')
);

export type SubscriptionCreateAuthServerAPIs = Pick<
  typeof apiClient,
  | 'apiCreateCustomer'
  | 'apiCreateSubscriptionWithPaymentMethod'
  | 'apiRetryInvoice'
  | 'apiDetachFailedPaymentMethod'
>;

export type SubscriptionCreateProps = {
  isMobile: boolean;
  profile: Profile;
  customer: Customer | null;
  selectedPlan: Plan;
  refreshSubscriptions: () => void;
  validatorInitialState?: ValidatorState;
  subscriptionErrorInitialState?: PaymentError;
  stripeOverride?: SubscriptionCreateStripeAPIs;
  apiClientOverrides?: Partial<SubscriptionCreateAuthServerAPIs>;
  paypalButtonBase?: React.FC<ButtonBaseProps>;
  coupon?: CouponDetails;
  setCoupon: (value: CouponDetails | undefined) => void;
};

export const SubscriptionCreate = ({
  isMobile,
  profile,
  customer,
  selectedPlan,
  refreshSubscriptions,
  validatorInitialState,
  subscriptionErrorInitialState,
  stripeOverride,
  apiClientOverrides = {},
  paypalButtonBase,
  coupon,
  setCoupon,
}: SubscriptionCreateProps) => {
  const checkoutType = CheckoutType.WITH_ACCOUNT;

  const [submitNonce, refreshSubmitNonce] = useNonce();
  const [transactionInProgress, setTransactionInProgress] = useState(false);
  const [checkboxSet, setCheckboxSet] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const onFormMounted = useCallbackOnce(
    () =>
      Amplitude.createSubscriptionMounted({
        ...selectedPlan,
        checkoutType: checkoutType,
      }),
    [checkoutType, selectedPlan]
  );

  const onFormEngaged = useCallbackOnce(
    () =>
      Amplitude.createSubscriptionEngaged({
        ...selectedPlan,
        checkoutType: checkoutType,
      }),
    [checkoutType, selectedPlan]
  );

  const [paypalScriptLoaded, setPaypalScriptLoaded] = useState(false);

  // The Stripe customer isn't created until payment is submitted, so
  // customer can be null and customer.payment_provider can be undefined.
  const paymentProvider: PaymentProvider | undefined =
    customer?.payment_provider;

  const { config } = useContext(AppContext);

  usePaypalButtonSetup(config, setPaypalScriptLoaded, paypalButtonBase);

  const [inProgress, setInProgress] = useState(false);

  const [subscriptionError, setSubscriptionError] = useState<
    PaymentError | GeneralError
  >(subscriptionErrorInitialState);
  const [retryStatus, setRetryStatus] = useState<RetryStatus>();

  // clear any error rendered with `ErrorMessage` on form change
  const onChange = useCallback(() => {
    if (subscriptionError) {
      setSubscriptionError(undefined);
    }
  }, [subscriptionError, setSubscriptionError]);

  const onStripeFormSubmit: StripeSubmitHandler | StripeUpdateHandler =
    useCallback(
      async ({
        stripe: stripeFromParams,
        ...params
      }: StripePaymentSubmitResult | StripePaymentUpdateResult) => {
        setInProgress(true);
        try {
          await handleSubscriptionPayment({
            ...params,
            ...apiClient,
            ...apiClientOverrides,
            stripe:
              stripeOverride /* istanbul ignore next - used for testing */ ||
              stripeFromParams,
            email: profile.email,
            selectedPlan,
            customer,
            checkoutType,
            discount: coupon?.discountAmount,
            retryStatus,
            onSuccess: refreshSubscriptions,
            onFailure: setSubscriptionError,
            onRetry: (status: RetryStatus) => {
              setRetryStatus(status);
              setSubscriptionError({
                type: 'card_error',
                code: 'card_declined',
              });
              setInProgress(false);
            },
          });
        } catch (error) {
          console.error('handleSubscriptionPayment failed', error);
          if (error.errno === AuthServerErrno.UNSUPPORTED_LOCATION) {
            error.code = 'location_unsupported';
          }
          setSubscriptionError(error);
          // Only set In Progress to false on subscription error
          // This is to prevent the Submit button from momentarily flashing as enabled
          // before navigating to the success screen.
          setInProgress(false);
        }
        refreshSubmitNonce();
      },
      [
        selectedPlan,
        profile,
        customer,
        retryStatus,
        apiClientOverrides,
        checkoutType,
        coupon,
        stripeOverride,
        setInProgress,
        refreshSubscriptions,
        refreshSubmitNonce,
        setSubscriptionError,
        setRetryStatus,
      ]
    );

  const onPaypalFormSubmit: (x: PaypalPaymentSubmitResult) => void =
    useCallback(
      async (params: PaypalPaymentSubmitResult) => {
        setInProgress(true);
        try {
          await apiCapturePaypalPayment({
            ...params,
            checkoutType: checkoutType,
            productId: selectedPlan.product_id,
          });
          refreshSubscriptions();
        } catch (error) {
          setSubscriptionError(error);
          // Only set In Progress to false on subscription error
          // This is to prevent the Submit button from momentarily flashing as enabled
          // before navigating to the success screen.
          setInProgress(false);
        }
        refreshSubmitNonce();
      },
      [
        setInProgress,
        refreshSubmitNonce,
        refreshSubscriptions,
        checkoutType,
        selectedPlan,
      ]
    );

  const onSubmit = getPaymentProviderMappedVal<
    BasePaymentFormProps['onSubmit']
  >(customer, {
    [PaymentProviders.stripe]: onStripeFormSubmit,
    [PaymentProviders.paypal]: onPaypalFormSubmit,
  });

  const handleClick = () => {
    if (!checkboxSet) {
      setShowTooltip(true);
    }
  };

  const handleKeyPress = (ev: React.KeyboardEvent<HTMLInputElement>) => {
    if (!checkboxSet && ev.key !== 'Tab') {
      ev.preventDefault();

      setShowTooltip(true);
    }
  };

  return (
    <>
      <Header {...{ profile }} />
      <div className="main-content">
        <PaymentErrorView
          error={subscriptionError}
          actionFn={() => {
            setSubscriptionError(undefined);
            setTransactionInProgress(false);
          }}
          className={classNames({
            hidden: !subscriptionError,
          })}
          plan={selectedPlan}
        />
        <PaymentProcessing
          provider="paypal"
          className={classNames({
            hidden: !transactionInProgress || subscriptionError,
          })}
        />
        <SubscriptionTitle
          screenType="create"
          className={classNames({
            hidden: transactionInProgress || subscriptionError,
          })}
        />
        {transactionInProgress && isMobile ? null : (
          <div className="payment-panel">
            <PlanDetails
              {...{
                selectedPlan,
                isMobile,
                showExpandButton: isMobile,
                coupon: coupon,
              }}
            />

            <CouponForm
              {...{
                planId: selectedPlan.plan_id,
                readOnly: false,
                subscriptionInProgress: inProgress || transactionInProgress,
                coupon,
                setCoupon,
              }}
            />
          </div>
        )}
        <div
          className={classNames(
            'product-payment component-card tablet:rounded-t-none',
            {
              hidden: transactionInProgress || subscriptionError,
            }
          )}
          data-testid="subscription-create"
        >
          <PaymentMethodHeader
            plan={selectedPlan}
            onClick={() => {
              onFormEngaged();
              setCheckboxSet(!checkboxSet);
              setShowTooltip(false);
            }}
            showTooltip={showTooltip}
          />
          <div
            data-testid="payment-form-container"
            className={`mt-8${!checkboxSet ? ' payment-form-disabled' : ''}`}
            tabIndex={!checkboxSet ? 0 : undefined}
            aria-disabled={!checkboxSet}
            onClick={handleClick}
            onKeyPress={handleKeyPress}
          >
            {!hasPaymentProvider(customer) && (
              <>
                {paypalScriptLoaded && (
                  <PaypalButton
                    disabled={!checkboxSet}
                    apiClientOverrides={apiClientOverrides}
                    customer={customer}
                    idempotencyKey={submitNonce}
                    refreshSubmitNonce={refreshSubmitNonce}
                    selectedPlan={selectedPlan}
                    newPaypalAgreement={true}
                    postSubscriptionAttemptPaypalCallback={refreshSubscriptions}
                    setSubscriptionError={setSubscriptionError}
                    ButtonBase={paypalButtonBase}
                    setTransactionInProgress={setTransactionInProgress}
                    promotionCode={coupon?.promotionCode}
                    checkoutType={checkoutType}
                  />
                )}

                <AcceptedCards />
              </>
            )}

            {hasPaymentProvider(customer) && (
              <Localized id="pay-with-heading-saved">
                <p className="pay-with-heading">Use saved payment option</p>
              </Localized>
            )}

            <div>
              <Localized id="sub-update-payment-title">
                <span className="label-title">Payment information</span>
              </Localized>

              <PaymentForm
                {...{
                  customer,
                  submitNonce,
                  onSubmit,
                  onChange,
                  shouldAllowSubmit: checkboxSet,
                  inProgress,
                  validatorInitialState,
                  plan: selectedPlan,
                  onMounted: onFormMounted,
                  onEngaged: onFormEngaged,
                  promotionCode: coupon?.promotionCode,
                  disabled: !checkboxSet,
                }}
              />
            </div>
          </div>

          <div className="payment-footer" data-testid="footer">
            <PaymentLegalBlurb provider={paymentProvider} />
            {selectedPlan && <TermsAndPrivacy plan={selectedPlan} />}
          </div>
        </div>
      </div>
    </>
  );
};

export default SubscriptionCreate;
