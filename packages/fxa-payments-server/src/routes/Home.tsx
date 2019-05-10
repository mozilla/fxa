import React, { useEffect } from 'react';
import { connect, useDispatch } from 'react-redux';
import { actions, selectorsFromState } from '../store';
import { PlansFetchState } from '../store/types';
import { Link } from 'react-router-dom';

import LoadingSpinner from '../components/LoadingSpinner';

type IndexProps = {
  accessToken: string,
  isLoading: boolean,
  plans: PlansFetchState,
  products: Array<string>
};

export const Index = ({
  accessToken,
  isLoading,
  plans,
  products,
}: IndexProps) => {
  const dispatch = useDispatch();

  useEffect(() => {
    if (accessToken) {
      dispatch(actions.fetchPlans(accessToken));
    }
  }, [ dispatch, accessToken ]);

  if (isLoading) {
    return <LoadingSpinner />;
  }
  return (
    <div>
      <p>TODO: This should probably not be a useful page that links anywhere.</p>
      <p><Link to="/subscriptions">Manage subscriptions</Link></p>
      <h2>Available Products</h2>
      <ul>
        {plans.loading && <li>(plans loading...)</li>}
        {plans.error && <h1>(plans error! {'' + plans.error})</h1>}
        {plans.result && (
          products.map(productId =>
            <li key={productId}><Link to={`/products/${productId}`}>{productId}</Link></li>
          )
        )}
      </ul>
    </div>
  );
};

// TODO: replace this with a useSelector hook
export default connect(
  selectorsFromState('plans', 'products')
)(Index);
