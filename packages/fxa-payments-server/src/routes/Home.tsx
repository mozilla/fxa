import React, { useEffect } from 'react';
import { connect, useDispatch } from 'react-redux';
import { actions, selectorsFromState } from '../store';
import { PlansFetchState, Plan } from '../store/types';
import { Link } from 'react-router-dom';

type IndexProps = {
  accessToken: string,
  isLoading: boolean,
  plans: PlansFetchState,
};

export const Index = ({
  accessToken,
  isLoading,
  plans,
}: IndexProps) => {
  const dispatch = useDispatch();

  useEffect(() => {
    if (accessToken) {
      dispatch(actions.fetchPlans(accessToken));
    }
  }, [ dispatch, accessToken ]);

  return (
    <div>
      <p>TODO: This should probably not be a useful page that links anywhere.</p>
      <p><Link to="/subscriptions">Manage subscriptions</Link></p>
      <h2>Available Plans</h2>
      <ul>
        {plans.loading && <li>(plans loading...)</li>}
        {plans.error && <h1>(plans error! {'' + plans.error})</h1>}
        {plans.result && (
          plans.result.map(({
            plan_id,
            plan_name,
            product_id,
          }: Plan) =>
            <li key={plan_id}><Link to={`/products/${product_id}?plan=${plan_id}`}>{plan_name}</Link></li>
          )
        )}
      </ul>
    </div>
  );
};

// TODO: replace this with a useSelector hook
export default connect(
  selectorsFromState('isLoading', 'plans')
)(Index);
