import React, {
  useEffect,
  useContext,
  useCallback,
  useState,
  useRef,
} from 'react';
import { connect } from 'react-redux';
import { Localized } from '@fluent/react';

import * as Amplitude from '../../lib/amplitude';

import { AuthServerErrno } from '../../lib/errors';
import { AppContext } from '../../lib/AppContext';

import { actions, ActionFunctions } from '../../store/actions';
import { selectors, SelectorReturns } from '../../store/selectors';
import { sequences, SequenceFunctions } from '../../store/sequences';
import { State } from '../../store/state';
import { CustomerSubscription, Profile, Plan } from '../../store/types';

import './index.scss';
import SubscriptionItem from './SubscriptionItem';
import ReactivateSubscriptionSuccessDialog from './Reactivate/SuccessDialog';

import AlertBar from '../../components/AlertBar';
import DialogMessage from '../../components/DialogMessage';
import FetchErrorDialogMessage from '../../components/FetchErrorDialogMessage';
import { LoadingOverlay } from '../../components/LoadingOverlay';
import { ReactComponent as CloseIcon } from 'fxa-react/images/close.svg';
import { getLocalizedDate, getLocalizedDateString } from '../../lib/formats';

export type SubscriptionsProps = {
  profile: SelectorReturns['profile'];
  plans: SelectorReturns['plans'];
  customer: SelectorReturns['customer'];
  cancelSubscriptionStatus: SelectorReturns['cancelSubscriptionStatus'];
  reactivateSubscriptionStatus: SelectorReturns['reactivateSubscriptionStatus'];
  updatePaymentStatus: SelectorReturns['updatePaymentStatus'];
  customerSubscriptions: SelectorReturns['customerSubscriptions'];
  cancelSubscription: SequenceFunctions['cancelSubscriptionAndRefresh'];
  resetCancelSubscription: ActionFunctions['resetCancelSubscription'];
  reactivateSubscription: ActionFunctions['reactivateSubscription'];
  fetchSubscriptionsRouteResources: SequenceFunctions['fetchSubscriptionsRouteResources'];
  resetReactivateSubscription: ActionFunctions['resetReactivateSubscription'];
  updatePayment: SequenceFunctions['updatePaymentAndRefresh'];
  resetUpdatePayment: ActionFunctions['resetUpdatePayment'];
};

export const Subscriptions = ({
  profile,
  customer,
  plans,
  customerSubscriptions,
  fetchSubscriptionsRouteResources,
  cancelSubscription,
  cancelSubscriptionStatus,
  reactivateSubscription,
  reactivateSubscriptionStatus,
  resetReactivateSubscription,
  updatePayment,
  resetUpdatePayment,
  resetCancelSubscription,
  updatePaymentStatus,
}: SubscriptionsProps) => {
  const { config, locationReload, navigateToUrl } = useContext(AppContext);

  const [showPaymentSuccessAlert, setShowPaymentSuccessAlert] = useState(true);
  const clearSuccessAlert = useCallback(
    () => setShowPaymentSuccessAlert(false),
    [setShowPaymentSuccessAlert]
  );

  const SUPPORT_FORM_URL = `${config.servers.content.url}/support`;

  const engaged = useRef(false);

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

  const onSupportClick = useCallback(() => navigateToUrl(SUPPORT_FORM_URL), [
    navigateToUrl,
    SUPPORT_FORM_URL,
  ]);

  if (customer.loading || profile.loading || plans.loading) {
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

      {updatePaymentStatus.result && showPaymentSuccessAlert && (
        <AlertBar className="alert alertSuccess alertCenter">
          <Localized id="sub-billing-update-success">
            <span data-testid="success-billing-update" className="checked">
              Your billing information has been updated successfully
            </span>
          </Localized>

          <Localized id="close-aria">
            <span
              data-testid="clear-success-alert"
              className="close"
              aria-label="Close modal"
              onClick={clearSuccessAlert}
            >
              <CloseIcon role="img" className="close-icon close-alert-bar" />
            </span>
          </Localized>
        </AlertBar>
      )}

      {updatePaymentStatus.loading && (
        <AlertBar className="alert alertPending">
          <Localized id="sub-route-idx-updating">
            <span>Updating billing information...</span>
          </Localized>
        </AlertBar>
      )}

      {reactivateSubscriptionStatus.error && (
        <DialogMessage
          className="dialog-error"
          onDismiss={resetReactivateSubscription}
        >
          <Localized id="sub-route-idx-reactivating">
            <h4 data-testid="error-reactivation">
              Reactivating subscription failed
            </h4>
          </Localized>
          <p>{reactivateSubscriptionStatus.error.message}</p>
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
        >
          <Localized id="sub-route-idx-cancel-failed">
            <h4 data-testid="error-cancellation">
              Cancelling subscription failed
            </h4>
          </Localized>
          <p>{cancelSubscriptionStatus.error.message}</p>
        </DialogMessage>
      )}

      {profile.result && <ProfileBanner profile={profile.result} />}

      <div className="child-views" data-testid="subscription-management-loaded">
        <div className="settings-child-view support">
          <div className="settings-unit">
            <div className="settings-unit-stub">
              <header className="settings-unit-summary">
                <Localized id="settings-subscriptions">
                  <h2 className="settings-unit-title">
                    Subscriptions & Payments
                  </h2>
                </Localized>
              </header>
              <button
                data-testid="contact-support-button"
                className="settings-button primary-button settings-unit-toggle"
                onClick={onSupportClick}
              >
                <Localized id="sub-route-idx-contact">
                  <span className="change-button">Contact Support</span>
                </Localized>
              </button>
            </div>
          </div>

          {customer.result &&
            customerSubscriptions &&
            customerSubscriptions.map((customerSubscription, idx) => (
              <SubscriptionItem
                key={idx}
                {...{
                  customer: customer.result,
                  updatePayment,
                  resetUpdatePayment,
                  updatePaymentStatus,
                  cancelSubscription,
                  reactivateSubscription,
                  customerSubscription,
                  cancelSubscriptionStatus,
                  plan: planForId(customerSubscription.plan_id, plans.result),
                }}
              />
            ))}
        </div>
      </div>
    </div>
  );
};

const customerSubscriptionForId = (
  subscriptionId: string,
  customerSubscriptions: CustomerSubscription[]
): CustomerSubscription | null =>
  customerSubscriptions.filter(
    (subscription) => subscription.subscription_id === subscriptionId
  )[0];

const planForId = (planId: string, plans: Plan[]): Plan | null =>
  plans.filter((plan) => plan.plan_id === planId)[0];

type CancellationDialogMessageProps = {
  subscriptionId: string;
  customerSubscriptions: CustomerSubscription[];
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
  ) as CustomerSubscription;
  const plan = planForId(customerSubscription.plan_id, plans) as Plan;

  return (
    <DialogMessage onDismiss={resetCancelSubscription}>
      <Localized id="sub-route-idx-cancel-msg-title">
        <h4 data-testid="cancellation-message-title">
          We're sorry to see you go
        </h4>
      </Localized>
      <Localized
        id="sub-route-idx-cancel-msg"
        $name={plan.product_name}
        $date={getLocalizedDate(customerSubscription.current_period_end)}
      >
        <p>
          Your {plan.product_name} subscription has been cancelled.
          <br />
          You will still have access to {plan.product_name} until{' '}
          {getLocalizedDateString(
            customerSubscription.current_period_end,
            false
          )}
          .
        </p>
      </Localized>
      <Localized
        id="sub-route-idx-cancel-aside"
        $url={supportFormUrl}
        a={<a href={supportFormUrl}></a>}
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
      <img src={avatar} alt={displayName || email} className="profile-image" />
    </div>
    <div id="fxa-settings-profile-header">
      <h1 className="card-header">{displayName ? displayName : email}</h1>
      {displayName && <h2 className="card-subheader">{email}</h2>}
    </div>
  </header>
);

// TODO replace this with Redux hooks in component function body
// https://github.com/mozilla/fxa/issues/3020
export default connect(
  (state: State) => ({
    plans: selectors.plans(state),
    profile: selectors.profile(state),
    customer: selectors.customer(state),
    customerSubscriptions: selectors.customerSubscriptions(state),
    updatePaymentStatus: selectors.updatePaymentStatus(state),
    cancelSubscriptionStatus: selectors.cancelSubscriptionStatus(state),
    reactivateSubscriptionStatus: selectors.reactivateSubscriptionStatus(state),
    plansByProductId: selectors.plansByProductId(state),
  }),
  {
    fetchSubscriptionsRouteResources:
      sequences.fetchSubscriptionsRouteResources,
    updatePayment: sequences.updatePaymentAndRefresh,
    resetUpdatePayment: actions.resetUpdatePayment,
    cancelSubscription: sequences.cancelSubscriptionAndRefresh,
    resetCancelSubscription: actions.resetCancelSubscription,
    reactivateSubscription: sequences.reactivateSubscriptionAndRefresh,
    resetReactivateSubscription: actions.resetReactivateSubscription,
  }
)(Subscriptions);
