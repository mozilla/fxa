import React, { useEffect, useContext, useMemo, useState } from 'react';
import { connect } from 'react-redux';
import { Localized } from '@fluent/react';
import { AuthServerErrno } from '../../lib/errors';
import { AppContext } from '../../lib/AppContext';
import { LoadingOverlay } from '../../components/LoadingOverlay';
import {
  useFetchInvoicePreview,
  useMatchMedia,
  useReactGA4Setup,
} from '../../lib/hooks';
import { getSelectedPlan } from '../../lib/plan';

import { State } from '../../store/state';
import { sequences, SequenceFunctions } from '../../store/sequences';
import { actions, ActionFunctions } from '../../store/actions';
import { selectors, SelectorReturns } from '../../store/selectors';
import { Plan } from '../../store/types';

import FetchErrorDialogMessage from '../../components/FetchErrorDialogMessage';
import PlanErrorDialog from '../../components/PlanErrorDialog';

import SubscriptionSuccess from '../Product/SubscriptionSuccess';
import SubscriptionUpgrade from '../Product/SubscriptionUpgrade';
import SubscriptionCreate from '../Product/SubscriptionCreate';
import SubscriptionChangeRoadblock from './SubscriptionChangeRoadblock';
import {
  AbbrevPlan,
  SubscriptionUpdateEligibility,
  WebSubscription,
  IapSubscription,
} from 'fxa-shared/subscriptions/types';
import { isWebSubscription } from 'fxa-shared/subscriptions/type-guards';
import { findCustomerIapSubscriptionByProductId } from '../../lib/customer';
import IapRoadblock from './IapRoadblock';
import { CouponDetails } from 'fxa-shared/dto/auth/payments/coupon';
import { useParams } from 'react-router-dom';
import DialogMessage from '../../components/DialogMessage';

// Check if the customer is subscribed to a product.
const customerIsSubscribedToProduct = (
  customerSubscriptions: ProductProps['customerSubscriptions'],
  productId: string
): boolean | null =>
  customerSubscriptions &&
  customerSubscriptions.some(
    (customerSubscription) => customerSubscription.product_id === productId
  );

// If the customer has any subscription plan that matches a plan for the
// selected product, then they are already subscribed.
const customerIsSubscribedToPlan = (
  customerSubscriptions: ProductProps['customerSubscriptions'],
  selectedPlan: Plan
): boolean | null =>
  customerSubscriptions &&
  customerSubscriptions.some(
    (customerSubscription) =>
      isWebSubscription(customerSubscription) &&
      selectedPlan.plan_id === customerSubscription.plan_id
  );

export type ProductProps = {
  profile: SelectorReturns['profile'];
  plans: SelectorReturns['plans'];
  customer: SelectorReturns['customer'];
  subscriptionChangeEligibility: SelectorReturns['subscriptionChangeEligibility'];
  customerSubscriptions: SelectorReturns['customerSubscriptions'];
  plansByProductId: SelectorReturns['plansByProductId'];
  updateSubscriptionPlanStatus: SelectorReturns['updateSubscriptionPlanStatus'];
  updateSubscriptionPlanAndRefresh: SequenceFunctions['updateSubscriptionPlanAndRefresh'];
  resetUpdateSubscriptionPlan: ActionFunctions['resetUpdateSubscriptionPlan'];
  fetchProductRouteResources: SequenceFunctions['fetchProductRouteResources'];
  fetchCustomerAndSubscriptions: SequenceFunctions['fetchCustomerAndSubscriptions'];
  fetchSubscriptionChangeEligibility: SequenceFunctions['fetchSubscriptionChangeEligibility'];
};

export const Product = ({
  profile,
  plans,
  customer,
  subscriptionChangeEligibility,
  customerSubscriptions,
  plansByProductId,
  fetchProductRouteResources,
  fetchCustomerAndSubscriptions,
  fetchSubscriptionChangeEligibility,
  updateSubscriptionPlanAndRefresh,
  resetUpdateSubscriptionPlan,
  updateSubscriptionPlanStatus,
}: ProductProps) => {
  const { productId } = useParams() as { productId: string };

  const {
    accessToken,
    config,
    locationReload,
    navigateToUrl,
    queryParams,
    matchMediaDefault,
  } = useContext(AppContext);

  const planId = queryParams.plan;

  if (!accessToken) {
    navigateToUrl(
      `${config.servers.content.url}/subscriptions/products/${productId}?plan=${planId}&signin=yes`
    );
  }

  useReactGA4Setup(config, productId, profile.result?.metricsEnabled);

  // Fetch plans on initial render, change in product ID, or auth change.
  useEffect(() => {
    fetchProductRouteResources();
  }, [fetchProductRouteResources]);

  const isMobile = useMatchMedia(
    '(max-width: 429px) and (max-height: 945px) and (orientation: portrait),(max-width: 945px) and (orientation: landscape) and (max-height: 429px)',
    matchMediaDefault
  );

  const selectedPlan: Plan = useMemo(
    () => getSelectedPlan(productId, planId, plansByProductId),
    [productId, planId, plansByProductId]
  );

  const [coupon, setCoupon] = useState<CouponDetails>();
  const invoicePreview = useFetchInvoicePreview(
    selectedPlan?.plan_id,
    customerSubscriptions
  );

  // Fetch plan update eligibility
  useEffect(() => {
    (async () => {
      if (selectedPlan && selectedPlan.active) {
        fetchSubscriptionChangeEligibility(selectedPlan);
      }
    })();
  }, [selectedPlan, fetchSubscriptionChangeEligibility]);

  // Please read the comment in `fetchProfileAndCustomer` in Checkout/index.tsx
  // regarding a possible race condition first.  The workaround here is to
  // simply delay the request on the front end so that the subscription is more
  // likely to have been updated by the time the fetch is handled.
  //
  // It's simpler, but the downside is that it affects all customers.  The
  // retry approach is tricker in this route due to a combination of, a) React
  // rendering and Redux app state, and, b) the customer could be a returning
  // customer, thus the initial subscriptions list won't be empty.
  //
  // (Note that the Checkout route uses hooks and so the retry fetches won't
  // affect any component state until some state updating setter function is
  // called.)
  const delayedFetchCustomerAndSubscriptions = () =>
    setTimeout(fetchCustomerAndSubscriptions, 500);

  if (
    !accessToken ||
    customer.loading ||
    plans.loading ||
    subscriptionChangeEligibility.loading ||
    profile.loading ||
    invoicePreview.loading
  ) {
    return <LoadingOverlay isLoading={true} />;
  }

  if (!profile.result || profile.error !== null) {
    return (
      <Localized id="product-plan-error">
        <FetchErrorDialogMessage
          testid="error-loading-profile"
          title="Problem loading profile"
          fetchState={profile}
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
      <Localized id="product-customer-error">
        <FetchErrorDialogMessage
          testid="error-loading-customer"
          title="Problem loading customer"
          fetchState={customer}
          onDismiss={locationReload}
        />
      </Localized>
    );
  }

  if (
    !plans.result ||
    plans.error !== null ||
    !selectedPlan ||
    !selectedPlan.active
  ) {
    return <PlanErrorDialog {...{ locationReload, plans }} />;
  }

  if (invoicePreview.error || !invoicePreview.result) {
    const ariaLabelledBy = 'product-invoice-preview-error-title';
    const ariaDescribedBy = 'product-invoice-preview-error-text';
    if (invoicePreview.error.errno === AuthServerErrno.UNSUPPORTED_LOCATION) {
      return (
        <DialogMessage
          className="dialog-error"
          onDismiss={locationReload}
          headerId="product-location-unsupported-error-title"
          descId="product-location-unsupported-error-text"
        >
          <Localized id="product-location-unsupported-error">
            <h4
              id="product-location-unsupported-error-title"
              data-testid="product-location-unsupported-error"
            >
              Location not supported
            </h4>
          </Localized>
          <Localized id="location-unsupported">
            <p id="product-location-unsupported-error-text">
              Your current location is not supported according to our Terms of
              Service.
            </p>
          </Localized>
        </DialogMessage>
      );
    }
    return (
      <DialogMessage
        className="dialog-error"
        onDismiss={locationReload}
        headerId={ariaLabelledBy}
        descId={ariaDescribedBy}
      >
        <Localized id="product-invoice-preview-error-title">
          <h4 id={ariaLabelledBy} data-testid="product-invoice-preview-error">
            Problem loading invoice preview
          </h4>
        </Localized>
        <Localized id="product-invoice-preview-error-text">
          <p id={ariaDescribedBy}>Could not load invoice preview</p>
        </Localized>
      </DialogMessage>
    );
  }

  // Only check for upgrade or existing subscription if we have a customer.
  if (customer.result && subscriptionChangeEligibility.result !== null) {
    const iapSubscription: IapSubscription | null =
      findCustomerIapSubscriptionByProductId(customerSubscriptions, productId);

    // Note regarding IAP roadblock:
    //
    // Currently, customers cannot upgrade IAP subscriptions directly.
    // Products that are eligible for upgrade can only be done through support.
    //
    // iapSubscription checks if user is subscribed to product (not product set)
    // planUpgradeEligibility returns 'blocked_iap' for all products on same product set.
    // Therefore, a combination of both is required to show IAP roadblock (planUpgradeEligibility)
    // and appropriate error messaging (iapSubscription).
    //
    // if desired product is already subscribed to, show iap already subscribed error
    // else, product is not subscribed to, but on same product set/might be eligible for upgrade
    // show iap upgrade contact support error messaging
    if (subscriptionChangeEligibility.result.eligibility === 'blocked_iap') {
      const currentPlan = subscriptionChangeEligibility.result.currentPlan!;
      return (
        <IapRoadblock
          {...{
            currentPlan,
            selectedPlan,
            customer: customer.result,
            profile: profile.result,
            isMobile,
            subscription: iapSubscription ? iapSubscription : undefined,
            code: iapSubscription
              ? 'iap_already_subscribed'
              : 'iap_upgrade_contact_support',
          }}
        />
      );
    }

    const webSubscriptions = (customerSubscriptions || []).filter((s) =>
      isWebSubscription(s)
    ) as WebSubscription[];

    const alreadySubscribedToSelectedPlan: boolean | null =
      customerIsSubscribedToPlan(webSubscriptions, selectedPlan);

    // Do we already have a subscription to the product in the selected plan?
    if (alreadySubscribedToSelectedPlan) {
      return (
        <SubscriptionSuccess
          {...{
            plan: selectedPlan,
            customer: customer.result,
            profile: profile.result,
            isMobile,
            coupon,
          }}
        />
      );
    }

    // Not an upgrade or a downgrade.
    if (
      subscriptionChangeEligibility.result.eligibility ===
      SubscriptionUpdateEligibility.INVALID
    ) {
      if (customerIsSubscribedToProduct(webSubscriptions, productId)) {
        return (
          <SubscriptionChangeRoadblock
            {...{ profile: profile.result, isMobile, selectedPlan }}
          />
        );
      }
      return (
        <SubscriptionCreate
          {...{
            isMobile,
            profile: profile.result,
            customer: customer.result,
            selectedPlan,
            refreshSubscriptions: delayedFetchCustomerAndSubscriptions,
            coupon: coupon,
            setCoupon: setCoupon,
          }}
        />
      );
    }

    if (
      subscriptionChangeEligibility.result.eligibility ===
      SubscriptionUpdateEligibility.DOWNGRADE
    ) {
      return (
        <SubscriptionChangeRoadblock
          {...{ profile: profile.result, isMobile, selectedPlan }}
        />
      );
    }

    if (
      subscriptionChangeEligibility.result.eligibility ===
      SubscriptionUpdateEligibility.UPGRADE
    ) {
      const currentPlan: AbbrevPlan =
        subscriptionChangeEligibility.result.currentPlan!;
      const currentSubscriptionFromPlan = webSubscriptions.find(
        (sub) => sub.plan_id === currentPlan.plan_id
      );
      return (
        <SubscriptionUpgrade
          {...{
            isMobile,
            profile: profile.result,
            customer: customer.result,
            selectedPlan,
            upgradeFromPlan: currentPlan,
            upgradeFromSubscription: currentSubscriptionFromPlan!,
            updateSubscriptionPlanAndRefresh,
            resetUpdateSubscriptionPlan,
            updateSubscriptionPlanStatus,
            invoicePreview: invoicePreview.result,
            discount: coupon?.discountAmount,
          }}
        />
      );
    }
  }

  return (
    <SubscriptionCreate
      {...{
        isMobile,
        profile: profile.result,
        customer: customer.result,
        selectedPlan,
        refreshSubscriptions: delayedFetchCustomerAndSubscriptions,
        coupon: coupon,
        setCoupon: setCoupon,
      }}
    />
  );
};

export default connect(
  (state: State) => ({
    customer: selectors.customer(state),
    subscriptionChangeEligibility:
      selectors.subscriptionChangeEligibility(state),
    customerSubscriptions: selectors.customerSubscriptions(state),
    profile: selectors.profile(state),
    plans: selectors.plans(state),
    updateSubscriptionPlanStatus: selectors.updateSubscriptionPlanStatus(state),
    plansByProductId: selectors.plansByProductId(state),
  }),
  {
    fetchProductRouteResources: sequences.fetchProductRouteResources,
    fetchCustomerAndSubscriptions: sequences.fetchCustomerAndSubscriptions,
    fetchSubscriptionChangeEligibility:
      sequences.fetchSubscriptionChangeEligibility,
    updateSubscriptionPlanAndRefresh:
      sequences.updateSubscriptionPlanAndRefresh,
    resetUpdateSubscriptionPlan: actions.resetUpdateSubscriptionPlan,
  }
)(Product);
