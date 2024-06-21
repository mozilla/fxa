// React looks unused here, but we need it for Storybook.
import React, { useEffect, useContext, useCallback, useRef } from 'react';
import { useBooleanState } from 'fxa-react/lib/hooks';
import { connect } from 'react-redux';
import { Localized } from '@fluent/react';

import * as Amplitude from '../../lib/amplitude';

import { AuthServerErrno } from '../../lib/errors';
import { AppContext } from '../../lib/AppContext';

import { actions, ActionFunctions } from '../../store/actions';
import { selectors, SelectorReturns } from '../../store/selectors';
import { sequences, SequenceFunctions } from '../../store/sequences';
import { State } from '../../store/state';
import { Profile, Plan } from '../../store/types';

import './index.scss';
import SubscriptionItem from './SubscriptionItem';
import ReactivateSubscriptionSuccessDialog from './Reactivate/SuccessDialog';

import AlertBar from '../../components/AlertBar';
import DialogMessage from '../../components/DialogMessage';
import FetchErrorDialogMessage from '../../components/FetchErrorDialogMessage';
import { LoadingOverlay } from '../../components/LoadingOverlay';
import { ReactComponent as PocketIcon } from '../../images/pocket-icon.svg';
import { getLocalizedDate, getLocalizedDateString } from '../../lib/formats';

import PaymentUpdateForm, {
  PaymentUpdateStripeAPIs,
  PaymentUpdateAuthServerAPIs,
} from './PaymentUpdateForm';
import {
  isIapSubscription,
  isWebSubscription,
} from 'fxa-shared/subscriptions/type-guards';
import {
  MozillaSubscription,
  WebSubscription,
} from 'fxa-shared/subscriptions/types';
import SubscriptionIapItem from './SubscriptionIapItem/SubscriptionIapItem';
import LinkExternal from 'fxa-react/components/LinkExternal';

export type SubscriptionsProps = {
  profile: SelectorReturns['profile'];
  plans: SelectorReturns['plans'];
  customer: SelectorReturns['customer'];
  cancelSubscriptionStatus: SelectorReturns['cancelSubscriptionStatus'];
  subsequentInvoices: SelectorReturns['subsequentInvoices'];
  reactivateSubscriptionStatus: SelectorReturns['reactivateSubscriptionStatus'];
  customerSubscriptions: SelectorReturns['customerSubscriptions'];
  cancelSubscription: SequenceFunctions['cancelSubscriptionAndRefresh'];
  resetCancelSubscription: ActionFunctions['resetCancelSubscription'];
  reactivateSubscription: ActionFunctions['reactivateSubscription'];
  fetchSubscriptionsRouteResources: SequenceFunctions['fetchSubscriptionsRouteResources'];
  resetReactivateSubscription: ActionFunctions['resetReactivateSubscription'];
  paymentUpdateStripeOverride?: PaymentUpdateStripeAPIs;
  paymentUpdateApiClientOverrides?: Partial<PaymentUpdateAuthServerAPIs>;
};

export const Subscriptions = ({
  profile,
  customer,
  plans,
  customerSubscriptions,
  subsequentInvoices,
  fetchSubscriptionsRouteResources,
  cancelSubscription,
  cancelSubscriptionStatus,
  reactivateSubscription,
  reactivateSubscriptionStatus,
  resetReactivateSubscription,
  resetCancelSubscription,
  paymentUpdateStripeOverride,
  paymentUpdateApiClientOverrides,
}: SubscriptionsProps) => {
  const { accessToken, config, locationReload, navigateToUrl } =
    useContext(AppContext);

  if (!accessToken) {
    window.location.href = `${config.servers.content.url}/subscriptions`;
  }

  const [
    updatePaymentIsSuccessViaSCA,
    setUpdatePaymentIsSuccess,
    resetUpdatePaymentIsSuccess,
  ] = useBooleanState(false);

  const [
    updatePaymentSuccessAlertIsHidden,
    hideSuccessAlert,
    resetSuccessAlert,
  ] = useBooleanState(false);

  // Combined reset function to clear both previous success status and user's
  // action to dismiss the alert.
  const resetUpdatePaymentIsSuccessAndAlert = useCallback(() => {
    resetUpdatePaymentIsSuccess();
    resetSuccessAlert();
  }, [resetUpdatePaymentIsSuccess, resetSuccessAlert]);

  const showPaymentSuccessAlert =
    !updatePaymentSuccessAlertIsHidden && updatePaymentIsSuccessViaSCA;

  const SUPPORT_FORM_URL = `${config.servers.content.url}/support`;

  const engaged = useRef(false);

  // Sort multiple subscriptions with web type subscriptions first, since
  // the list of active subs follows the `PaymentUpdateForm` which only
  // applies to web subscriptions.
  customerSubscriptions?.sort((a, b) => {
    const typeA = a._subscription_type;
    const typeB = b._subscription_type;
    return typeA > typeB ? -1 : typeA < typeB ? 1 : 0;
  });

  useEffect(() => {
    Amplitude.manageSubscriptionsMounted();
  }, []);

  // Any button click is engagement
  const onAnyClick = useCallback(
    (evt: any) => {
      if (
        !engaged.current &&
        (evt.target.tagName === 'BUTTON' ||
          evt.target.parentNode.tagName === 'BUTTON')
      ) {
        Amplitude.manageSubscriptionsEngaged();
        engaged.current = true;
      }
    },
    [engaged]
  );

  // Fetch subscriptions and customer on initial render or auth change.
  useEffect(() => {
    fetchSubscriptionsRouteResources();
  }, [fetchSubscriptionsRouteResources]);

  const onSupportClick = useCallback(
    () => navigateToUrl(SUPPORT_FORM_URL),
    [navigateToUrl, SUPPORT_FORM_URL]
  );

  if (
    !accessToken ||
    customer.loading ||
    profile.loading ||
    plans.loading ||
    subsequentInvoices.loading
  ) {
    return <LoadingOverlay isLoading={true} />;
  }

  if (!profile.result || profile.error !== null) {
    return (
      <Localized id="product-profile-error">
        <FetchErrorDialogMessage
          testid="error-loading-profile"
          title="Problem loading profile"
          fetchState={profile}
          onDismiss={locationReload}
        />
      </Localized>
    );
  }

  if (!plans.result || plans.error !== null) {
    return (
      <Localized id="product-plan-error">
        <FetchErrorDialogMessage
          testid="error-loading-plans"
          title="Problem loading plans"
          fetchState={plans}
          onDismiss={locationReload}
        />
      </Localized>
    );
  }

  if (
    customer.error &&
    // Unknown customer just means the user hasn't subscribed to anything yet
    customer.error.errno !== AuthServerErrno.UNKNOWN_SUBSCRIPTION_CUSTOMER
  ) {
    return (
      <Localized id="sub-customer-error">
        <FetchErrorDialogMessage
          testid="error-loading-customer"
          title="Problem loading customer"
          fetchState={customer}
          onDismiss={locationReload}
        />
      </Localized>
    );
  }

  if (subsequentInvoices.error !== null) {
    return (
      <Localized id="sub-invoice-error">
        <FetchErrorDialogMessage
          testid="error-loading-invoice"
          title="Problem loading invoices"
          fetchState={subsequentInvoices}
          onDismiss={locationReload}
        />
      </Localized>
    );
  }

  // If the customer has no subscriptions, redirect to the settings page
  if (
    (customerSubscriptions && customerSubscriptions.length === 0) ||
    (customer.error &&
      customer.error.errno === AuthServerErrno.UNKNOWN_SUBSCRIPTION_CUSTOMER)
  ) {
    const SETTINGS_URL = `${config.servers.content.url}/settings`;
    navigateToUrl(SETTINGS_URL);
    return <LoadingOverlay isLoading={true} />;
  }

  const activeWebSubscription =
    customerSubscriptions &&
    customerSubscriptions.find(
      (s) => isWebSubscription(s) && !s.cancel_at_period_end
    );

  const showPaymentUpdateForm =
    customer && customer.result && activeWebSubscription;
  const planId =
    activeWebSubscription && (activeWebSubscription as WebSubscription).plan_id;

  const ariaLabelledByReactivateSubscription =
    'error-subscription-reactivation-failed-header';
  const ariaDescribedByReactivateSubscription =
    'error-subscription-reactivation-failed-description';

  const ariaLabelledByCancellationStatus = 'error-cancellation-failed-header';
  const ariaDescribedByCancellationStatus =
    'error-cancellation-failed-description';

  return (
    <div className="subscription-management" onClick={onAnyClick}>
      {customerSubscriptions && cancelSubscriptionStatus.result !== null && (
        <CancellationDialogMessage
          {...{
            subscriptionId: cancelSubscriptionStatus.result.subscriptionId,
            customerSubscriptions,
            plans: plans.result,
            resetCancelSubscription,
            supportFormUrl: SUPPORT_FORM_URL,
          }}
        />
      )}

      {showPaymentSuccessAlert && (
        <AlertBar
          checked
          className="alert-success"
          dataTestId="success-billing-update"
          headerId="success-billing-update-header"
          localizedId="sub-billing-update-success"
          onClick={hideSuccessAlert}
        >
          Your billing information has been updated successfully
        </AlertBar>
      )}

      {reactivateSubscriptionStatus.error && (
        <DialogMessage
          className="dialog-error"
          onDismiss={resetReactivateSubscription}
          headerId={ariaLabelledByReactivateSubscription}
          descId={ariaDescribedByReactivateSubscription}
        >
          <Localized id="sub-route-idx-reactivating">
            <h4
              id={ariaLabelledByReactivateSubscription}
              data-testid="error-reactivation"
            >
              Reactivating subscription failed
            </h4>
          </Localized>
          <p id={ariaDescribedByReactivateSubscription}>
            {reactivateSubscriptionStatus.error.message}
          </p>
        </DialogMessage>
      )}

      {reactivateSubscriptionStatus.result && (
        <ReactivateSubscriptionSuccessDialog
          plan={reactivateSubscriptionStatus.result.plan}
          onDismiss={resetReactivateSubscription}
        />
      )}

      {cancelSubscriptionStatus.error && (
        <DialogMessage
          className="dialog-error"
          onDismiss={resetCancelSubscription}
          headerId={ariaLabelledByCancellationStatus}
          descId={ariaDescribedByCancellationStatus}
        >
          <Localized id="sub-route-idx-cancel-failed">
            <h4
              id={ariaLabelledByCancellationStatus}
              data-testid="error-cancellation"
            >
              Cancelling subscription failed
            </h4>
          </Localized>
          <p id={ariaDescribedByCancellationStatus}>
            {cancelSubscriptionStatus.error.message}
          </p>
        </DialogMessage>
      )}

      {profile.result && <ProfileBanner profile={profile.result} />}

      <div className="child-views" data-testid="subscription-management-loaded">
        <div className="settings-child-view support">
          <section
            className="settings-unit"
            aria-labelledby="subscriptions-support"
          >
            <div className="settings-unit-stub">
              <header
                id="subscriptions-support"
                className="settings-unit-summary"
              >
                <Localized id="settings-subscriptions-title">
                  <h2 className="font-semibold text-base">Subscriptions</h2>
                </Localized>
              </header>
              <button
                data-testid="contact-support-button"
                className="button settings-button primary-button settings-unit-toggle"
                onClick={onSupportClick}
              >
                <Localized id="sub-route-idx-contact">
                  <span className="change-button">Contact Support</span>
                </Localized>
              </button>
            </div>
          </section>

          {customer.result && showPaymentUpdateForm && (
            <PaymentUpdateForm
              {...{
                plan: planForId(planId!, plans.result),
                customer: customer.result,
                profile: profile.result,
                refreshSubscriptions: fetchSubscriptionsRouteResources,
                setUpdatePaymentIsSuccess,
                resetUpdatePaymentIsSuccess:
                  resetUpdatePaymentIsSuccessAndAlert,
                stripeOverride: paymentUpdateStripeOverride,
                apiClientOverrides: paymentUpdateApiClientOverrides,
              }}
            />
          )}

          {customer.result &&
            customerSubscriptions &&
            customerSubscriptions.map(
              (customerSubscription, idx) =>
                (isWebSubscription(customerSubscription) && (
                  <SubscriptionItem
                    key={idx}
                    subsequentInvoice={subsequentInvoices?.result?.find(
                      (invoice) =>
                        invoice.subscriptionId ===
                        customerSubscription.subscription_id
                    )}
                    {...{
                      customer: customer.result,
                      cancelSubscription,
                      reactivateSubscription,
                      customerSubscription,
                      cancelSubscriptionStatus,
                      plan: planForId(
                        customerSubscription.plan_id,
                        plans.result
                      ),
                      refreshSubscriptions: fetchSubscriptionsRouteResources,
                      setUpdatePaymentIsSuccess,
                      resetUpdatePaymentIsSuccess:
                        resetUpdatePaymentIsSuccessAndAlert,
                      paymentUpdateStripeOverride,
                      paymentUpdateApiClientOverrides,
                    }}
                  />
                )) ||
                (isIapSubscription(customerSubscription) && (
                  <SubscriptionIapItem
                    key={idx}
                    {...{
                      customerSubscription,
                      productName: productNameFromProductIdAndPlans(
                        customerSubscription.product_id,
                        plans.result
                      ),
                    }}
                  />
                ))
            )}

          <section className="settings-unit" aria-labelledby="pocket-external">
            <div className="subscription pocket-external">
              <div>
                <PocketIcon className="pocket-icon" />
              </div>
              <div>
                <p id="pocket-external" data-testid="manage-pocket-title">
                  <Localized id="manage-pocket-title-2">
                    <b>Looking for your Pocket Premium subscription?</b>
                  </Localized>
                </p>
                <Localized
                  id="manage-pocket-body-2"
                  elems={{
                    linkExternal: (
                      <LinkExternal
                        href="https://getpocket.com/premium/manage"
                        data-testid="manage-pocket-link"
                      >
                        click here
                      </LinkExternal>
                    ),
                  }}
                >
                  <p>
                    To manage it,{' '}
                    <LinkExternal
                      href="https://getpocket.com/premium/manage"
                      data-testid="manage-pocket-link"
                    >
                      click here
                    </LinkExternal>
                    .
                  </p>
                </Localized>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

const customerSubscriptionForId = (
  subscriptionId: string,
  customerSubscriptions: MozillaSubscription[]
): WebSubscription | null =>
  customerSubscriptions.filter(
    (subscription) =>
      isWebSubscription(subscription) &&
      subscription.subscription_id === subscriptionId
  )[0] as WebSubscription;

const planForId = (planId: string, plans: Plan[]): Plan | null =>
  plans.filter((plan) => plan.plan_id === planId)[0];

const productNameFromProductIdAndPlans = (
  productId: string,
  plans: Plan[]
): string =>
  plans.filter((plan) => plan.product_id === productId)[0].product_name || '';

type CancellationDialogMessageProps = {
  subscriptionId: string;
  customerSubscriptions: MozillaSubscription[];
  plans: Plan[];
  resetCancelSubscription: SubscriptionsProps['resetCancelSubscription'];
  supportFormUrl: string;
};

const CancellationDialogMessage = ({
  subscriptionId,
  customerSubscriptions,
  plans,
  resetCancelSubscription,
  supportFormUrl,
}: CancellationDialogMessageProps) => {
  const customerSubscription = customerSubscriptionForId(
    subscriptionId,
    customerSubscriptions
  );
  const ariaLabelledBy = 'subscription-cancellation-header';
  const ariaDescribedBy = 'subscription-cancellation-description';
  const plan = planForId(customerSubscription!.plan_id, plans) as Plan;

  return (
    <DialogMessage
      onDismiss={resetCancelSubscription}
      headerId={ariaLabelledBy}
      descId={ariaDescribedBy}
    >
      <Localized id="sub-route-idx-cancel-msg-title">
        <h4 id={ariaLabelledBy} data-testid="cancellation-message-title">
          We're sorry to see you go
        </h4>
      </Localized>
      <Localized
        id="sub-route-idx-cancel-msg"
        vars={{
          name: plan.product_name,
          date: getLocalizedDate(customerSubscription!.current_period_end),
        }}
      >
        <p id={ariaDescribedBy}>
          Your {plan.product_name} subscription has been cancelled.
          <br />
          You will still have access to {plan.product_name} until{' '}
          {getLocalizedDateString(
            customerSubscription!.current_period_end,
            false
          )}
          .
        </p>
      </Localized>
      <Localized
        id="sub-route-idx-cancel-aside-2"
        vars={{ url: supportFormUrl }}
        elems={{ a: <a href={supportFormUrl}>Mozilla Support</a> }}
      >
        <p className="small">
          Have questions? Visit <a href={supportFormUrl}>Mozilla Support</a>.
        </p>
      </Localized>
    </DialogMessage>
  );
};

type ProfileProps = {
  profile: Profile;
};

const ProfileBanner = ({
  profile: { email, avatar, displayName },
}: ProfileProps) => (
  <header id="fxa-settings-profile-header-wrapper">
    <div className="avatar-wrapper avatar-settings-view nohover">
      <img src={avatar} alt={displayName || email} className="avatar-image" />
    </div>
    <h2 id="fxa-settings-profile-header">
      <div className="card-header">{displayName ? displayName : email}</div>
      {displayName && (
        <div className="font-normal leading-6 text-base text-grey-400 mb-0">
          {email}
        </div>
      )}
    </h2>
  </header>
);

export default connect(
  (state: State) => ({
    plans: selectors.plans(state),
    profile: selectors.profile(state),
    customer: selectors.customer(state),
    customerSubscriptions: selectors.customerSubscriptions(state),
    subsequentInvoices: selectors.subsequentInvoices(state),
    cancelSubscriptionStatus: selectors.cancelSubscriptionStatus(state),
    reactivateSubscriptionStatus: selectors.reactivateSubscriptionStatus(state),
    plansByProductId: selectors.plansByProductId(state),
  }),
  {
    fetchSubscriptionsRouteResources:
      sequences.fetchSubscriptionsRouteResources,
    cancelSubscription: sequences.cancelSubscriptionAndRefresh,
    resetCancelSubscription: actions.resetCancelSubscription,
    reactivateSubscription: sequences.reactivateSubscriptionAndRefresh,
    resetReactivateSubscription: actions.resetReactivateSubscription,
  }
)(Subscriptions);
