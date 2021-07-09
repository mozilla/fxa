import React, { useEffect, useContext, useMemo } from 'react';
import { connect } from 'react-redux';
import { AppContext } from '../../lib/AppContext';
import { LoadingOverlay } from '../../components/LoadingOverlay';
import { PlanErrorDialog } from '../../components/PlanErrorDialog';
import { useMatchMedia } from '../../lib/hooks';
import { getSelectedPlan } from '../../lib/plan';

import { State } from '../../store/state';
import { sequences, SequenceFunctions } from '../../store/sequences';
import { selectors, SelectorReturns } from '../../store/selectors';

import './index.scss';

export type CheckoutProps = {
  match: {
    params: {
      productId: string;
    };
  };
  plans: SelectorReturns['plans'];
  plansByProductId: SelectorReturns['plansByProductId'];
  fetchCheckoutRouteResources: SequenceFunctions['fetchCheckoutRouteResources'];
};

export const Checkout = ({
  match: {
    params: { productId },
  },
  plans,
  plansByProductId,
  fetchCheckoutRouteResources,
}: CheckoutProps) => {
  const { locationReload, queryParams, matchMediaDefault } =
    useContext(AppContext);

  const isMobile = !useMatchMedia('(min-width: 768px)', matchMediaDefault);
  const planId = queryParams.plan;

  // Fetch plans on initial render or change in product ID
  useEffect(() => {
    fetchCheckoutRouteResources();
  }, [fetchCheckoutRouteResources]);

  const selectedPlan = useMemo(
    () => getSelectedPlan(productId, planId, plansByProductId),
    [plans]
  );

  if (plans.loading) {
    return <LoadingOverlay isLoading={true} />;
  }

  if (!plans.result || plans.error !== null || !selectedPlan) {
    return <PlanErrorDialog locationReload={locationReload} plans={plans} />;
  }

  return (
    <div data-testid="checkout-route-container">{selectedPlan?.plan_id}</div>
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
