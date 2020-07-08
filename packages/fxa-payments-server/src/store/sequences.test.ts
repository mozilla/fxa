import { MOCK_PLANS } from '../lib/test-utils';

jest.mock('../lib/sentry');

jest.mock('./actions', () => ({
  ...jest.requireActual('./actions'),
  actions: {
    ...jest.requireActual('./actions').actions,
    updateSubscriptionPlan: jest
      .fn()
      .mockReturnValue({ type: 'updateSubscriptionPlan' }),
    fetchCustomer: jest.fn().mockReturnValue({ type: 'fetchCustomer' }),
    fetchSubscriptions: jest
      .fn()
      .mockReturnValue({ type: 'fetchSubscriptions' }),
  },
}));

import { actions } from './actions';
import { sequences } from './sequences';

const dispatch = jest.fn().mockImplementation(async (action) => {
  if (typeof action === 'function') {
    return await action(dispatch);
  }
  return true;
});

const dispatchError = jest.fn().mockImplementation(() => {
  throw 'ohno';
});

describe('updateSubscriptionPlanAndRefresh', () => {
  const plan = MOCK_PLANS[0];
  const subscriptionId = 'sub-8675309';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('handles action exceptions as expected', async () => {
    await sequences.updateSubscriptionPlanAndRefresh(
      subscriptionId,
      plan
    )(dispatchError);

    expect(dispatchError).toHaveBeenCalledTimes(1);
    expect(actions.updateSubscriptionPlan).toBeCalledWith(subscriptionId, plan);
    expect(actions.fetchCustomer).not.toBeCalled();
    expect(actions.fetchSubscriptions).not.toBeCalled();
  });

  it('calls actions as expected', async () => {
    await sequences.updateSubscriptionPlanAndRefresh(
      subscriptionId,
      plan
    )(dispatch);

    expect(dispatch).toHaveBeenCalledTimes(3);
    expect(actions.updateSubscriptionPlan).toBeCalledWith(subscriptionId, plan);
    expect(actions.fetchCustomer).toBeCalled();
  });
});
