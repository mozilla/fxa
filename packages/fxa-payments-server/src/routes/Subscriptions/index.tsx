import React, {
  useEffect,
  useContext,
  useCallback,
  useState,
  useRef,
} from 'react';

import dayjs from 'dayjs';

import { AppContext } from '../../lib/AppContext';
import * as Amplitude from '../../lib/amplitude';
import FlowEvent from '../../lib/flow-event';

import {
  CustomerSubscription,
  Profile,
  Subscription,
  Plan,
} from '../../lib/types';

import './index.scss';
import SubscriptionItem from './SubscriptionItem';
import ReactivateSubscriptionSuccessDialog from './Reactivate/SuccessDialog';

import AlertBar from '../../components/AlertBar';
import DialogMessage from '../../components/DialogMessage';
import { LoadingOverlay } from '../../components/LoadingOverlay';
import CloseIcon from '../../components/CloseIcon';
import {
  apiCancelSubscription,
  apiUpdatePayment,
  apiReactivateSubscription,
} from '../../lib/apiClient';
import { useAwait, PromiseState } from '../../lib/hooks';

export type SubscriptionsProps = {
  match: {
    params: any;
  };
  initialCancelSubscriptionStatus?: PromiseState;
  initialUpdatePaymentStatus?: PromiseState;
  initialReactivateSubscriptionStatus?: PromiseState;
};

export const Subscriptions = ({
  initialCancelSubscriptionStatus,
  initialUpdatePaymentStatus,
  initialReactivateSubscriptionStatus,
}: SubscriptionsProps) => {
  const {
    config,
    navigateToUrl,
    profile,
    plans,
    customer,
    subscriptions,
  } = useContext(AppContext);

  const [
    cancelSubscriptionStatus,
    cancelSubscription,
    resetCancelSubscription,
  ] = useAwait(apiCancelSubscription, {
    initialState: initialCancelSubscriptionStatus,
    executeImmediately: false,
  });

  const [updatePaymentStatus, updatePayment, resetUpdatePayment] = useAwait(
    apiUpdatePayment,
    {
      initialState: initialUpdatePaymentStatus,
      executeImmediately: false,
    }
  );

  const [
    reactivateSubscriptionStatus,
    reactivateSubscription,
    resetReactivateSubscription,
  ] = useAwait(apiReactivateSubscription, {
    initialState: initialReactivateSubscriptionStatus,
    executeImmediately: false,
  });

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

  const onSupportClick = useCallback(() => navigateToUrl(SUPPORT_FORM_URL), [
    navigateToUrl,
    SUPPORT_FORM_URL,
  ]);

  if (!profile || !plans || !subscriptions) {
    return null;
  }

  const customerSubscriptions = customer ? customer.subscriptions : [];

  // If the customer has no subscriptions, redirect to the settings page
  if (customerSubscriptions.length === 0) {
    const SETTINGS_URL = `${config.servers.content.url}/settings`;
    navigateToUrl(SETTINGS_URL);
    return <LoadingOverlay isLoading={true} />;
  }

  return (
    <div className="subscription-management" onClick={onAnyClick}>
      {cancelSubscriptionStatus.result && (
        <CancellationDialogMessage
          {...{
            subscriptionId: cancelSubscriptionStatus.result.subscriptionId,
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
      {updatePaymentStatus.pending && (
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
        <ReactivateSubscriptionSuccessDialog
          planId={reactivateSubscriptionStatus.result.planId}
          onDismiss={resetReactivateSubscription}
        />
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
      <ProfileBanner profile={profile} />
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

          {customer &&
            customerSubscriptions &&
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
                  cancelSubscriptionStatus,
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
  customerSubscriptions: CustomerSubscription[]
): CustomerSubscription | null =>
  customerSubscriptions.filter(
    subscription => subscription.subscription_id === subscriptionId
  )[0];

const subscriptionForId = (
  subscriptionId: string,
  subscriptions: Subscription[]
): Subscription | null =>
  subscriptions.filter(
    subscription => subscription.subscriptionId === subscriptionId
  )[0];

const planForId = (planId: string, plans: Plan[]): Plan | null =>
  plans.filter(plan => plan.plan_id === planId)[0];

type CancellationDialogMessageProps = {
  subscriptionId: string;
  customerSubscriptions: CustomerSubscription[];
  plans: Plan[];
  resetCancelSubscription: () => void;
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

export default Subscriptions;
