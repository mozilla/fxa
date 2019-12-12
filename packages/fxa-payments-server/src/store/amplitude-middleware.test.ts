import { Middleware, MiddlewareAPI, Dispatch, AnyAction } from 'redux';
import { AmplitudeMiddleware } from './amplitude-middleware';
import FlowEvent from '../lib/flow-event';
jest.mock('../lib/flow-event');
jest.mock('../lib/config', () => ({
  config: { perfStartTime: 9999, sentry: { dsn: '' } },
}));

let next: Dispatch<AnyAction>;
let dispatch: Dispatch<AnyAction>;
let getState: any;
let invoke: Function;
let perfStartTime: number;

const create = (
  middleware: Middleware,
  store: MiddlewareAPI<Dispatch<AnyAction>, any>,
  next: Dispatch<AnyAction>
) => {
  return (action: any) => middleware(store)(next)(action);
};

beforeEach(() => {
  (<jest.Mock>FlowEvent.logAmplitudeEvent).mockClear();
  next = jest.fn();
  dispatch = jest.fn();
  getState = jest.fn();
  invoke = create(AmplitudeMiddleware, { dispatch, getState }, next);
  perfStartTime = 9999;
});

it('should dispatch the next action', () => {
  invoke({ type: 'testo' });
  expect(next).toBeCalled();
});

it('should call logAmplitudeEvent with the correct event group and type names', () => {
  const testCases = [
    ['manageSubscriptionsMounted', ['subManage', 'view']],
    ['manageSubscriptionsEngaged', ['subManage', 'engage']],
    ['createSubscriptionMounted', ['subPaySetup', 'view']],
    ['createSubscriptionEngaged', ['subPaySetup', 'engage']],
    ['createSubscription_PENDING', ['subPaySetup', 'submit']],
    [
      'createSubscription_FULFILLED',
      ['subPaySetup', 'success'],
      ['subPaySetup', 'complete'],
    ],
    ['createSubscription_REJECTED', ['subPaySetup', 'fail']],
    ['updatePaymentMounted', ['subPayManage', 'view']],
    ['updatePaymentEngaged', ['subPayManage', 'engage']],
    ['updatePayment_PENDING', ['subPayManage', 'submit']],
    [
      'updatePayment_FULFILLED',
      ['subPayManage', 'success'],
      ['subPayManage', 'complete'],
    ],
    ['updatePayment_REJECTED', ['subPayManage', 'fail']],
  ];

  for (const [actionType, ...expectedArgs] of testCases) {
    invoke({ type: actionType });

    for (const args of expectedArgs as string[][]) {
      expect(FlowEvent.logAmplitudeEvent).toBeCalledWith(
        ...args,
        perfStartTime,
        {}
      );
    }

    (<jest.Mock>FlowEvent.logAmplitudeEvent).mockClear();
  }
});

it('should call logAmplitudeEvent with subscription plan info', () => {
  const plan = { plan_id: '123xyz_hourly', product_id: '123xyz' };
  invoke({
    type: 'createSubscription_PENDING',
    meta: { plan },
  });
  const eventProps = (<jest.Mock>(
    FlowEvent.logAmplitudeEvent
  )).mock.calls[0].pop();

  expect(eventProps).toMatchObject({
    planId: plan.plan_id,
    productId: plan.product_id,
  });
});

it('should call logAmplitudeEvent with reason for failure on fail event', () => {
  const plan = { plan_id: '123xyz_hourly', product_id: '123xyz' };
  const payload = { message: 'oopsie daisies' };
  invoke({
    type: 'createSubscription_REJECTED',
    meta: { plan },
    payload,
  });
  const eventProps = (<jest.Mock>(
    FlowEvent.logAmplitudeEvent
  )).mock.calls[0].pop();

  expect(eventProps).toMatchObject({
    planId: plan.plan_id,
    productId: plan.product_id,
    reason: payload.message,
  });
});
