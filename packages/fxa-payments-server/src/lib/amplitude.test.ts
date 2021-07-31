import FlowEvent from '../lib/flow-event';
jest.mock('../lib/flow-event');

jest.mock('./sentry');

import * as Amplitude from './amplitude';

beforeEach(() => {
  (<jest.Mock>FlowEvent.logAmplitudeEvent).mockClear();
});

it('should call logAmplitudeEvent with the correct event group and type names', () => {
  const testCases: Array<[keyof typeof Amplitude, ...string[][]]> = [
    ['manageSubscriptionsMounted', ['subManage', 'view']],
    ['manageSubscriptionsEngaged', ['subManage', 'engage']],
    ['createSubscriptionMounted', ['subPaySetup', 'view']],
    ['createSubscriptionEngaged', ['subPaySetup', 'engage']],
    ['updateSubscriptionPlanMounted', ['subPayUpgrade', 'view']],
    ['updateSubscriptionPlanEngaged', ['subPayUpgrade', 'engage']],
    ['updateSubscriptionPlan_PENDING', ['subPayUpgrade', 'submit']],
    ['updateSubscriptionPlan_FULFILLED', ['subPayUpgrade', 'success']],
    ['updateSubscriptionPlan_REJECTED', ['subPayUpgrade', 'fail']],
    ['updatePaymentMounted', ['subPayManage', 'view']],
    ['updatePaymentEngaged', ['subPayManage', 'engage']],
    ['updatePayment_PENDING', ['subPayManage', 'submit']],
    ['updatePayment_FULFILLED', ['subPayManage', 'success']],
    ['updatePayment_REJECTED', ['subPayManage', 'fail']],
    ['cancelSubscriptionMounted', ['subCancel', 'view']],
    ['cancelSubscriptionEngaged', ['subCancel', 'engage']],
    ['cancelSubscription_PENDING', ['subCancel', 'submit']],
    [
      'cancelSubscription_FULFILLED',
      ['subCancel', 'success'],
      ['subCancel', 'complete'],
    ],
    ['cancelSubscription_REJECTED', ['subCancel', 'fail']],
  ];

  for (const [actionType, ...expectedArgs] of testCases) {
    Amplitude[actionType]({});

    for (const args of expectedArgs) {
      expect(FlowEvent.logAmplitudeEvent).toBeCalledWith(...args, {});
    }

    (<jest.Mock>FlowEvent.logAmplitudeEvent).mockClear();
  }
});
