import { MOCK_PLANS } from '../lib/test-utils';

import { actions } from './actions';
import { sequences } from './sequences';

jest.mock('../lib/sentry');

jest.mock('./actions', () => ({
  ...jest.requireActual('./actions'),
  actions: {
    ...jest.requireActual('./actions').actions,
    updateSubscriptionPlan: jest
      .fn()
      .mockReturnValue({ type: 'updateSubscriptionPlan' }),
    cancelSubscription: jest
      .fn()
      .mockReturnValue({ type: 'updateSubscriptionPlan' }),
    fetchCustomer: jest.fn().mockReturnValue({ type: 'fetchCustomer' }),
    fetchSubscriptions: jest
      .fn()
      .mockReturnValue({ type: 'fetchSubscriptions' }),
  },
}));

const dispatch = jest.fn().mockImplementation(async (action) => {
  if (typeof action === 'function') {
    return await action(dispatch);
  }
  return true;
});

const dispatchError = jest.fn().mockImplementation(() => {
  throw new Error('ohno');
});

describe('updateSubscriptionPlanAndRefresh', () => {
  const plan = MOCK_PLANS[0];
  const subscriptionId = 'sub-8675309';
  const paymentProvider = 'paypal';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('handles action exceptions as expected', async () => {
    await sequences.updateSubscriptionPlanAndRefresh(
      subscriptionId,
      plan,
      paymentProvider
    )(dispatchError);

    expect(dispatchError).toHaveBeenCalledTimes(1);
    expect(actions.updateSubscriptionPlan).toBeCalledWith(
      subscriptionId,
      plan,
      paymentProvider
    );
    expect(actions.fetchCustomer).not.toBeCalled();
    expect(actions.fetchSubscriptions).not.toBeCalled();
  });

  it('calls actions as expected', async () => {
    await sequences.updateSubscriptionPlanAndRefresh(
      subscriptionId,
      plan,
      paymentProvider
    )(dispatch);

    expect(dispatch).toHaveBeenCalledTimes(3);
    expect(actions.updateSubscriptionPlan).toBeCalledWith(
      subscriptionId,
      plan,
      paymentProvider
    );
    expect(actions.fetchCustomer).toBeCalled();
  });
});

describe('cancelSubscriptionAndRefresh', () => {
  const plan = MOCK_PLANS[0];
  const subscriptionId = 'sub-8675309';
  const paymentProvider = 'paypal';
  const promotionCode = 'takemymoney';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls actions as expected', async () => {
    await sequences.cancelSubscriptionAndRefresh(
      subscriptionId,
      plan,
      paymentProvider,
      promotionCode
    )(dispatch);

    expect(dispatch).toHaveBeenCalledTimes(3);
    expect(actions.cancelSubscription).toHaveBeenCalledWith(
      subscriptionId,
      plan,
      paymentProvider,
      promotionCode
    );
    expect(actions.fetchCustomer).toBeCalled();
  });
});
