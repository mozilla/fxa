import React, { useEffect, useContext, useCallback, useState } from 'react';
import { connect } from 'react-redux';
import dayjs from 'dayjs';

import { AuthServerErrno } from '../../lib/errors';
import { actions, thunks, selectors } from '../../store';
import { AppContext } from '../../lib/AppContext';

import {
  State,
  CustomerSubscription,
  SubscriptionsFetchState,
  UpdatePaymentFetchState,
  PlansFetchState,
  CustomerFetchState,
  Profile,
  ProfileFetchState,
  Subscription,
  Plan,
  CancelSubscriptionFetchState,
  ReactivateSubscriptionFetchState,
} from '../../store/types';

import './index.scss';

import AlertBar from '../../components/AlertBar';
import DialogMessage from '../../components/DialogMessage';

import SubscriptionItem from './SubscriptionItem';
import { LoadingOverlay } from '../../components/LoadingOverlay';

export type SubscriptionsProps = {
  profile: ProfileFetchState;
  plans: PlansFetchState;
  customer: CustomerFetchState;
  subscriptions: SubscriptionsFetchState;
  customerSubscriptions: Array<CustomerSubscription>;
  fetchSubscriptionsRouteResources: Function;
  cancelSubscription: Function;
  cancelSubscriptionStatus: CancelSubscriptionFetchState;
  resetCancelSubscription: Function;
  reactivateSubscription: Function;
  reactivateSubscriptionStatus: ReactivateSubscriptionFetchState;
  resetReactivateSubscription: Function;
  updatePayment: Function;
  updatePaymentStatus: UpdatePaymentFetchState;
  resetUpdatePayment: Function;
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
}: SubscriptionsProps) => {
  const {
    accessToken,
    config,
    locationReload,
    navigateToUrl,
    queryParams,
  } = useContext(AppContext);

  const [showPaymentSuccessAlert, setShowPaymentSuccessAlert] = useState(true);
  const clearSuccessAlert = useCallback(
    () => setShowPaymentSuccessAlert(false),
    [setShowPaymentSuccessAlert]
  );
  const SUPPORT_FORM_URL = `${config.servers.content.url}/support`;

  // Fetch subscriptions and customer on initial render or auth change.
  useEffect(() => {
    if (accessToken) {
      fetchSubscriptionsRouteResources(accessToken);
    }
  }, [fetchSubscriptionsRouteResources, accessToken]);

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
        <h4>Problem loading profile</h4>
        <p>{profile.error.message}</p>
      </DialogMessage>
    );
  }

  if (plans.error !== null) {
    return (
      <DialogMessage className="dialog-error" onDismiss={locationReload}>
        <h4>Problem loading plans</h4>
        <p>{plans.error.message}</p>
      </DialogMessage>
    );
  }

  if (subscriptions.error !== null) {
    return (
      <DialogMessage className="dialog-error" onDismiss={locationReload}>
        <h4>Problem loading subscriptions</h4>
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
        <h4>Problem loading customer information</h4>
        <p>{customer.error.message}</p>
      </DialogMessage>
    );
  }

  return (
    <div className="subscription-management">
      {cancelSubscriptionStatus.result !== null && (
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
          <span className="checked">
            Your billing information has been updated successfully
          </span>
          <span className="close" onClick={clearSuccessAlert} />
        </AlertBar>
      )}

      {updatePaymentStatus.loading && (
        <AlertBar className="alert alertPending">
          <span>Updating billing information...</span>
        </AlertBar>
      )}

      {updatePaymentStatus.error && (
        <DialogMessage className="dialog-error" onDismiss={resetUpdatePayment}>
          <h4>Updating billing information failed</h4>
          <p>{updatePaymentStatus.error.message}</p>
        </DialogMessage>
      )}

      {reactivateSubscriptionStatus.error && (
        <DialogMessage
          className="dialog-error"
          onDismiss={resetReactivateSubscription}
        >
          <h4>Reactivating subscription failed</h4>
          <p>{reactivateSubscriptionStatus.error.message}</p>
        </DialogMessage>
      )}

      {queryParams.successfulSupportTicketSubmission && (
        <AlertBar className="alert alertSuccess">
          <span data-testid="supportFormSuccess">
            Your support question was sent! We'll reach out to you via email as
            soon as possible.
          </span>
        </AlertBar>
      )}

      {profile.result && <ProfileBanner profile={profile.result} />}

      <div className="child-views">
        <div className="settings-child-view support">
          <div className="settings-unit">
            <div className="settings-unit-stub">
              <header className="settings-unit-summary">
                <h2 className="settings-unit-title">Subscriptions</h2>
              </header>
              <button
                className="settings-button secondary-button settings-unit-toggle"
                onClick={onSupportClick}
              >
                <span className="change-button">Contact Support</span>
              </button>
            </div>
          </div>

          {customerSubscriptions.length === 0 && (
            <>
              {/*
              TODO: User probably shouldn't end up here, since the "Manage"
              button should be unavailable from FxA settings.
              https://github.com/mozilla/fxa/issues/1078
            */}
              <div className="settings-unit">
                <div className="subscription">
                  <p>No subscriptions available.</p>
                </div>
              </div>
            </>
          )}

          {customerSubscriptions.map((customerSubscription, idx) => (
            <SubscriptionItem
              key={idx}
              {...{
                accessToken,
                customer,
                updatePayment,
                resetUpdatePayment,
                updatePaymentStatus,
                cancelSubscription,
                reactivateSubscription,
                customerSubscription,
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
  customerSubscriptions: Array<CustomerSubscription>
): CustomerSubscription | null => {
  return customerSubscriptions.filter(
    subscription => subscription.subscription_id === subscriptionId
  )[0];
};

const subscriptionForId = (
  subscriptionId: string,
  subscriptions: SubscriptionsFetchState
): Subscription | null => {
  if (subscriptions.result === null) {
    return null;
  }
  return subscriptions.result.filter(
    subscription => subscription.subscriptionId === subscriptionId
  )[0];
};

const planForId = (planId: string, plans: PlansFetchState): Plan | null => {
  if (plans.result === null) {
    return null;
  }
  return plans.result.filter(plan => plan.plan_id === planId)[0];
};

type CancellationDialogMessageProps = {
  subscription: Subscription;
  customerSubscriptions: Array<CustomerSubscription>;
  plans: PlansFetchState;
  resetCancelSubscription: Function;
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
      <h4>We're sorry to see you go</h4>
      <p>
        Your {plan.plan_name} subscription has been cancelled. You will still
        have until access to {plan.plan_name} until {periodEndDate}.
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
    <div className="avatar-wrapper avatar-settings-view">
      <img src={avatar} alt={displayName || email} className="profile-image" />
    </div>
    <div id="fxa-settings-profile-header">
      {displayName && <h1 className="card-header">{displayName}</h1>}
      <h2 className="card-subheader">{email}</h2>
    </div>
  </header>
);

export default connect(
  (state: State) => ({
    plans: selectors.plans(state),
    profile: selectors.profile(state),
    customer: selectors.customer(state),
    customerSubscriptions: selectors.customerSubscriptions(state),
    subscriptions: selectors.subscriptions(state),
    updatePaymentStatus: selectors.updatePaymentStatus(state),
    cancelSubscriptionStatus: selectors.cancelSubscriptionStatus(state),
    reactivateSubscriptionStatus: selectors.reactivateSubscriptionStatus(state),
    plansByProductId: selectors.plansByProductId(state),
  }),
  {
    fetchSubscriptionsRouteResources: thunks.fetchSubscriptionsRouteResources,
    updatePayment: thunks.updatePaymentAndRefresh,
    resetUpdatePayment: actions.resetUpdatePayment,
    cancelSubscription: thunks.cancelSubscriptionAndRefresh,
    resetCancelSubscription: actions.resetCancelSubscription,
    reactivateSubscription: thunks.reactivateSubscriptionAndRefresh,
    resetReactivateSubscription: actions.resetReactivateSubscription,
  }
)(Subscriptions);
