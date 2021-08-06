import React, {
  useEffect,
  useContext,
  useMemo,
  useState,
  useCallback,
  Suspense,
} from 'react';
import { connect } from 'react-redux';
import { Localized } from '@fluent/react';
import classNames from 'classnames';

import { PaymentError } from '../../lib/stripe';

import { AppContext } from '../../lib/AppContext';
import { useMatchMedia, useNonce, usePaypalButtonSetup } from '../../lib/hooks';
import { getSelectedPlan } from '../../lib/plan';
import useValidatorState, {
  State as ValidatorState,
} from '../../lib/validator';

import PaymentForm from '../../components/PaymentForm';
import { LoadingOverlay } from '../../components/LoadingOverlay';
import { PlanErrorDialog } from '../../components/PlanErrorDialog';
import NewUserEmailForm, {
  checkAccountExists,
} from '../../components/NewUserEmailForm';
import Header from '../../components/Header';
import { Form } from '../../components/fields';
import PaymentProcessing from '../../components/PaymentProcessing';
import SubscriptionTitle from '../../components/SubscriptionTitle';
import TermsAndPrivacy from '../../components/TermsAndPrivacy';
import PlanDetails from '../../components/PlanDetails';
import { PaymentConsentCheckbox } from '../../components/PaymentConsentCheckbox';

import { State } from '../../store/state';
import { sequences, SequenceFunctions } from '../../store/sequences';
import { selectors, SelectorReturns } from '../../store/selectors';

import * as Amplitude from '../../lib/amplitude';

import AcceptedCards from '../Product/AcceptedCards';

import './index.scss';

const PaypalButton = React.lazy(() => import('../../components/PayPalButton'));

export type CheckoutProps = {
  match: {
    params: {
      productId: string;
    };
  };
  plans: SelectorReturns['plans'];
  plansByProductId: SelectorReturns['plansByProductId'];
  fetchCheckoutRouteResources: SequenceFunctions['fetchCheckoutRouteResources'];
  paymentErrorInitialState?: PaymentError;
  validatorInitialState?: ValidatorState;
};

export const Checkout = ({
  match: {
    params: { productId },
  },
  plans,
  plansByProductId,
  fetchCheckoutRouteResources,
  paymentErrorInitialState,
  validatorInitialState,
}: CheckoutProps) => {
  const { locationReload, queryParams, matchMediaDefault } =
    useContext(AppContext);
  const { config } = useContext(AppContext);
  const checkboxValidator = useValidatorState();
  const isMobile = !useMatchMedia('(min-width: 768px)', matchMediaDefault);
  const [submitNonce, refreshSubmitNonce] = useNonce();
  const [transactionInProgress, setTransactionInProgress] = useState(false);
  const [checkboxSet, setCheckboxSet] = useState(false);
  const [validEmail, setValidEmail] = useState<string>('');
  const [accountExists, setAccountExists] = useState(false);
  const [paypalScriptLoaded, setPaypalScriptLoaded] = useState(false);
  const [inProgress, setInProgress] = useState(false);
  const [paymentError, setPaymentError] = useState<PaymentError>(
    paymentErrorInitialState
  );

  const planId = queryParams.plan;
  const signInURL = `${config.servers.content.url}/subscriptions/products/${productId}?plan=${planId}&signin=yes`;

  // Fetch plans on initial render or change in product ID
  useEffect(() => {
    fetchCheckoutRouteResources();
  }, [fetchCheckoutRouteResources]);

  const selectedPlan = useMemo(
    () => getSelectedPlan(productId, planId, plansByProductId),
    [productId, planId, plansByProductId]
  );

  const onFormMounted = useCallback(
    () => Amplitude.createSubscriptionMounted(selectedPlan),
    [selectedPlan]
  );

  const onFormEngaged = useCallback(
    () => Amplitude.createSubscriptionEngaged(selectedPlan),
    [selectedPlan]
  );

  // clear any error rendered with `ErrorMessage` on form change
  const onChange = useCallback(() => {
    if (paymentError) {
      setPaymentError(undefined);
    }
  }, [paymentError, setPaymentError]);

  const onSubmit = (evt: any) => {
    // Will be added in https://mozilla-hub.atlassian.net/browse/FXA-3666
    console.log('Not yet implemented: ', evt);
  };

  usePaypalButtonSetup(config, setPaypalScriptLoaded);

  if (plans.loading) {
    return <LoadingOverlay isLoading={true} />;
  }

  if (!plans.result || plans.error !== null || !selectedPlan) {
    return <PlanErrorDialog locationReload={locationReload} plans={plans} />;
  }

  function refreshSubscriptions() {
    // Will be added in https://mozilla-hub.atlassian.net/browse/FXA-3666
    console.log('not yet implemented: refreshSubscriptions');
  }

  return (
    <>
      <Header />
      <div className="main-content">
        <PaymentProcessing
          provider="paypal"
          className={classNames({
            hidden: !transactionInProgress || paymentError,
          })}
        />
        <SubscriptionTitle
          screenType="create"
          className={classNames({
            hidden: transactionInProgress || paymentError,
          })}
        />
        <div
          className={classNames('product-payment', {
            hidden: transactionInProgress || paymentError,
          })}
          data-testid="subscription-create"
        >
          <Localized id="new-user-step-1">
            <h2 className="step-header">1. Create a Firefox account</h2>
          </Localized>
          <hr />
          <NewUserEmailForm
            setValidEmail={setValidEmail}
            signInURL={signInURL}
            setAccountExists={setAccountExists}
            checkAccountExists={checkAccountExists}
          />

          <hr />
          <Localized id="new-user-step-2">
            <h2 className="step-header">2. Choose your payment method</h2>
          </Localized>
          <strong>required</strong>
          <Form validator={checkboxValidator}>
            <PaymentConsentCheckbox
              plan={selectedPlan}
              onClick={() => setCheckboxSet(!checkboxSet)}
            />
          </Form>
          <>
            {paypalScriptLoaded && (
              <>
                <div
                  className="subscription-create-pay-with-other"
                  data-testid="pay-with-other"
                >
                  <Suspense fallback={<div>Loading...</div>}>
                    <div className="paypal-button">
                      <PaypalButton
                        currencyCode={selectedPlan.currency}
                        customer={null}
                        idempotencyKey={submitNonce}
                        refreshSubmitNonce={refreshSubmitNonce}
                        refreshSubscriptions={refreshSubscriptions}
                        setPaymentError={setPaymentError}
                      />
                    </div>
                  </Suspense>
                </div>
                <div>
                  <Localized id="pay-with-heading-card-or">
                    <p className="pay-with-heading">Or pay with card</p>
                  </Localized>
                  <AcceptedCards />
                </div>
              </>
            )}
            {!paypalScriptLoaded && (
              <div>
                <Localized id="pay-with-heading-card-only">
                  <p className="pay-with-heading">Pay with card</p>
                </Localized>
                <AcceptedCards />
              </div>
            )}
          </>
          <div>
            <h3 className="billing-title">
              <Localized id="new-user-card-title">
                <span className="title">Enter your card information</span>
              </Localized>
            </h3>
            <PaymentForm
              {...{
                submitNonce,
                onSubmit,
                onChange,

                showLegal: true,
                submitButtonL10nId: 'new-user-submit',
                submitButtonCopy: 'Subscribe Now',
                shouldAllowSubmit:
                  checkboxSet && validEmail !== '' && !accountExists,

                inProgress,
                validatorInitialState,
                confirm: false,
                submit: true,
                plan: selectedPlan,
                onMounted: onFormMounted,
                onEngaged: onFormEngaged,
              }}
            />
          </div>

          <div className="subscription-create-footer">
            {selectedPlan && <TermsAndPrivacy plan={selectedPlan} />}
          </div>
        </div>
        <PlanDetails
          {...{
            className: classNames('default', {
              hidden: transactionInProgress && isMobile,
            }),
            selectedPlan,
            isMobile,
            showExpandButton: isMobile,
          }}
        />
      </div>
    </>
  );
};

export default connect(
  (state: State) => ({
    plans: selectors.plans(state),
    plansByProductId: selectors.plansByProductId(state),
  }),
  {
    fetchCheckoutRouteResources: sequences.fetchCheckoutRouteResources,
  }
)(Checkout);
