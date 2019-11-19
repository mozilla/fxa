import React, {
  useEffect,
  useContext,
  useCallback,
  useState,
  useRef,
} from 'react';
import { connect } from 'react-redux';
import dayjs from 'dayjs';

import { FunctionWithIgnoredReturn } from '../../lib/types';
import { AuthServerErrno } from '../../lib/errors';
import { AppContext } from '../../lib/AppContext';
import { actions } from '../../store/actions';

import {
  plans,
  profile,
  customer,
  customerSubscriptions,
  subscriptions,
  updatePaymentStatus,
  cancelSubscriptionStatus,
  reactivateSubscriptionStatus,
  plansByProductId,
} from '../../store/selectors';

import {
  fetchSubscriptionsRouteResources,
  updatePaymentAndRefresh,
  cancelSubscriptionAndRefresh,
  reactivateSubscriptionAndRefresh,
} from '../../store/thunks';

import FlowEvent from '../../lib/flow-event';

import { State } from '../../store/defaultState';

import {
  CustomerSubscription,
  Profile,
  Subscription,
  Plan,
} from '../../store/types';

import './index.scss';
import fpnImage from '../../images/fpn';

import AlertBar from '../../components/AlertBar';
import DialogMessage from '../../components/DialogMessage';

import SubscriptionItem from './SubscriptionItem';
import { LoadingOverlay } from '../../components/LoadingOverlay';
import CloseIcon from '../../components/CloseIcon';

const {
  resetUpdatePayment,
  resetCancelSubscription,
  resetReactivateSubscription,
  manageSubscriptionsMounted,
  manageSubscriptionsEngaged,
  cancelSubscriptionMounted,
  cancelSubscriptionEngaged,
  updatePaymentMounted,
  updatePaymentEngaged,
} = actions;

export type SubscriptionsProps = {
  profile: State['profile'];
  plans: State['plans'];
  customer: State['customer'];
  subscriptions: State['subscriptions'];
  cancelSubscriptionStatus: State['cancelSubscription'];
  reactivateSubscriptionStatus: State['reactivateSubscription'];
  updatePaymentStatus: State['updatePayment'];
  customerSubscriptions: ReturnType<typeof customerSubscriptions>;
  cancelSubscription: FunctionWithIgnoredReturn<
    typeof cancelSubscriptionAndRefresh
  >;
  resetCancelSubscription: FunctionWithIgnoredReturn<
    typeof resetCancelSubscription
  >;
  reactivateSubscription: FunctionWithIgnoredReturn<
    typeof reactivateSubscriptionAndRefresh
  >;
  fetchSubscriptionsRouteResources: FunctionWithIgnoredReturn<
    typeof fetchSubscriptionsRouteResources
  >;
  resetReactivateSubscription: FunctionWithIgnoredReturn<
    typeof resetReactivateSubscription
  >;
  updatePayment: FunctionWithIgnoredReturn<typeof updatePaymentAndRefresh>;
  resetUpdatePayment: FunctionWithIgnoredReturn<typeof resetUpdatePayment>;
  manageSubscriptionsMounted: FunctionWithIgnoredReturn<
    typeof manageSubscriptionsMounted
  >;
  manageSubscriptionsEngaged: FunctionWithIgnoredReturn<
    typeof manageSubscriptionsEngaged
  >;
  cancelSubscriptionMounted: FunctionWithIgnoredReturn<
    typeof cancelSubscriptionMounted
  >;
  cancelSubscriptionEngaged: FunctionWithIgnoredReturn<
    typeof cancelSubscriptionEngaged
  >;
  updatePaymentMounted: FunctionWithIgnoredReturn<typeof updatePaymentMounted>;
  updatePaymentEngaged: FunctionWithIgnoredReturn<typeof updatePaymentEngaged>;
};

export const Subscriptions = ({
  profile,
  customer,
  plans,
  subscriptions,
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
  manageSubscriptionsMounted,
  manageSubscriptionsEngaged,
  cancelSubscriptionMounted,
  cancelSubscriptionEngaged,
  updatePaymentMounted,
  updatePaymentEngaged,
}: SubscriptionsProps) => {
  const { config, locationReload, navigateToUrl } = useContext(AppContext);

  // There is no way to do this with a React Hook. We need the
  // `navigationTiming.domComplete` value to calculate the "client" perf metric.
  // When `useEffect` is used, the `domComplete` value is always(?) null because
  // it fires too early. This is the reliable approach.
  window.onload = () =>
    FlowEvent.logPerformanceEvent('subscriptions', config.perfStartTime);

  const [showPaymentSuccessAlert, setShowPaymentSuccessAlert] = useState(true);
  const clearSuccessAlert = useCallback(
    () => setShowPaymentSuccessAlert(false),
    [setShowPaymentSuccessAlert]
  );

  const SUPPORT_FORM_URL = `${config.servers.content.url}/support`;

  const engaged = useRef(false);

  useEffect(() => {
    manageSubscriptionsMounted();
  }, [manageSubscriptionsMounted]);

  // Any button click is engagement
  const onAnyClick = useCallback(
    (evt: any) => {
      if (
        !engaged.current &&
        (evt.target.tagName === 'BUTTON' ||
          evt.target.parentNode.tagName === 'BUTTON')
      ) {
        manageSubscriptionsEngaged();
        engaged.current = true;
      }
    },
    [manageSubscriptionsEngaged, engaged]
  );

  // Fetch subscriptions and customer on initial render or auth change.
  useEffect(() => {
    fetchSubscriptionsRouteResources();
  }, [fetchSubscriptionsRouteResources]);

  const onSupportClick = useCallback(() => navigateToUrl(SUPPORT_FORM_URL), [
    navigateToUrl,
    SUPPORT_FORM_URL,
  ]);

  if (
    customer.loading ||
    subscriptions.loading ||
    profile.loading ||
    plans.loading
  ) {
    return <LoadingOverlay isLoading={true} />;
  }

  if (profile.error !== null) {
    return (
      <DialogMessage className="dialog-error" onDismiss={locationReload}>
        <h4 data-testid="error-profile-fetch">Problem loading profile</h4>
        <p>{profile.error.message}</p>
      </DialogMessage>
    );
  }

  if (plans.error !== null) {
    return (
      <DialogMessage className="dialog-error" onDismiss={locationReload}>
        <h4 data-testid="error-plans-fetch">Problem loading plans</h4>
        <p>{plans.error.message}</p>
      </DialogMessage>
    );
  }

  if (subscriptions.error !== null) {
    return (
      <DialogMessage className="dialog-error" onDismiss={locationReload}>
        <h4 data-testid="error-subscriptions-fetch">
          Problem loading subscriptions
        </h4>
        <p>{subscriptions.error.message}</p>
      </DialogMessage>
    );
  }

  if (
    customer.error &&
    // Unknown customer just means the user hasn't subscribed to anything yet
    customer.error.errno !== AuthServerErrno.UNKNOWN_SUBSCRIPTION_CUSTOMER
  ) {
    return (
      <DialogMessage className="dialog-error" onDismiss={locationReload}>
        <h4 data-testid="error-customer-fetch">
          Problem loading customer information
        </h4>
        <p>{customer.error.message}</p>
      </DialogMessage>
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
            subscription: cancelSubscriptionStatus.result,
            customerSubscriptions,
            plans,
            resetCancelSubscription,
            supportFormUrl: SUPPORT_FORM_URL,
          }}
        />
      )}

      {updatePaymentStatus.result && showPaymentSuccessAlert && (
        <AlertBar className="alert alertSuccess alertCenter">
          <span data-testid="success-billing-update" className="checked">
            Your billing information has been updated successfully
          </span>

          <span
            data-testid="clear-success-alert"
            className="close"
            aria-label="Close modal"
            onClick={clearSuccessAlert}
          >
            <CloseIcon className="close" />
          </span>
        </AlertBar>
      )}

      {updatePaymentStatus.loading && (
        <AlertBar className="alert alertPending">
          <span>Updating billing information...</span>
        </AlertBar>
      )}

      {reactivateSubscriptionStatus.error && (
        <DialogMessage
          className="dialog-error"
          onDismiss={resetReactivateSubscription}
        >
          <h4 data-testid="error-reactivation">
            Reactivating subscription failed
          </h4>
          <p>{reactivateSubscriptionStatus.error.message}</p>
        </DialogMessage>
      )}

      {reactivateSubscriptionStatus.result && (
        <DialogMessage onDismiss={resetReactivateSubscription}>
          <img alt="Firefox Private Network" src={fpnImage} />
          <p
            data-testid="reactivate-subscription-success"
            className="reactivate-subscription-success"
          >
            Thanks! You're all set.
          </p>
          <button
            className="settings-button"
            onClick={() => resetReactivateSubscription()}
            data-testid="reactivate-subscription-success-button"
          >
            Close
          </button>
        </DialogMessage>
      )}

      {cancelSubscriptionStatus.error && (
        <DialogMessage
          className="dialog-error"
          onDismiss={resetCancelSubscription}
        >
          <h4 data-testid="error-cancellation">
            Cancelling subscription failed
          </h4>
          <p>{cancelSubscriptionStatus.error.message}</p>
        </DialogMessage>
      )}

      {profile.result && <ProfileBanner profile={profile.result} />}

      <div className="child-views" data-testid="subscription-management-loaded">
        <div className="settings-child-view support">
          <div className="settings-unit">
            <div className="settings-unit-stub">
              <header className="settings-unit-summary">
                <h2 className="settings-unit-title">Subscriptions</h2>
              </header>
              <button
                data-testid="contact-support-button"
                className="settings-button primary-button settings-unit-toggle"
                onClick={onSupportClick}
              >
                <span className="change-button">Contact Support</span>
              </button>
            </div>
          </div>

          {customerSubscriptions &&
            customerSubscriptions.map((customerSubscription, idx) => (
              <SubscriptionItem
                key={idx}
                {...{
                  customer,
                  updatePayment,
                  resetUpdatePayment,
                  updatePaymentStatus,
                  cancelSubscription,
                  reactivateSubscription,
                  customerSubscription,
                  cancelSubscriptionMounted,
                  cancelSubscriptionEngaged,
                  cancelSubscriptionStatus,
                  updatePaymentMounted,
                  updatePaymentEngaged,
                  plan: planForId(customerSubscription.plan_id, plans),
                  subscription: subscriptionForId(
                    customerSubscription.subscription_id,
                    subscriptions
                  ),
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
  customerSubscriptions: SubscriptionsProps['customerSubscriptions']
): CustomerSubscription | null =>
  !customerSubscriptions
    ? null
    : customerSubscriptions.filter(
        subscription => subscription.subscription_id === subscriptionId
      )[0];

const subscriptionForId = (
  subscriptionId: string,
  subscriptions: SubscriptionsProps['subscriptions']
): Subscription | null =>
  !subscriptions.result
    ? null
    : subscriptions.result.filter(
        subscription => subscription.subscriptionId === subscriptionId
      )[0];

const planForId = (
  planId: string,
  plans: SubscriptionsProps['plans']
): Plan | null =>
  !plans.result
    ? null
    : plans.result.filter(plan => plan.plan_id === planId)[0];

type CancellationDialogMessageProps = {
  subscription: Subscription;
  customerSubscriptions: SubscriptionsProps['customerSubscriptions'];
  plans: SubscriptionsProps['plans'];
  resetCancelSubscription: SubscriptionsProps['resetCancelSubscription'];
  supportFormUrl: string;
};

const CancellationDialogMessage = ({
  subscription,
  customerSubscriptions,
  plans,
  resetCancelSubscription,
  supportFormUrl,
}: CancellationDialogMessageProps) => {
  const customerSubscription = customerSubscriptionForId(
    subscription.subscriptionId,
    customerSubscriptions
  ) as CustomerSubscription;
  const plan = planForId(customerSubscription.plan_id, plans) as Plan;

  // TODO: date formats will need i18n someday
  const periodEndDate = dayjs
    .unix(customerSubscription.current_period_end)
    .format('MMMM DD, YYYY');

  return (
    <DialogMessage onDismiss={resetCancelSubscription}>
      <h4 data-testid="cancellation-message-title">
        We're sorry to see you go
      </h4>
      <p>
        Your {plan.product_name} subscription has been cancelled.
        <br />
        You will still have access to {plan.product_name} until {periodEndDate}.
      </p>
      <p className="small">
        Have questions? Visit <a href={supportFormUrl}>Mozilla Support</a>.
      </p>
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

export default connect(
  (state: State) => ({
    plans: plans(state),
    profile: profile(state),
    customer: customer(state),
    customerSubscriptions: customerSubscriptions(state),
    subscriptions: subscriptions(state),
    updatePaymentStatus: updatePaymentStatus(state),
    cancelSubscriptionStatus: cancelSubscriptionStatus(state),
    reactivateSubscriptionStatus: reactivateSubscriptionStatus(state),
    plansByProductId: plansByProductId(state),
  }),
  {
    fetchSubscriptionsRouteResources,
    updatePayment: updatePaymentAndRefresh,
    resetUpdatePayment,
    cancelSubscription: cancelSubscriptionAndRefresh,
    resetCancelSubscription,
    reactivateSubscription: reactivateSubscriptionAndRefresh,
    resetReactivateSubscription,
    manageSubscriptionsMounted,
    manageSubscriptionsEngaged,
    cancelSubscriptionMounted,
    cancelSubscriptionEngaged,
    updatePaymentMounted,
    updatePaymentEngaged,
  }
)(Subscriptions);
