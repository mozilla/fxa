import actions, { Action } from './index';
import { Plan } from '../types';

type ActionsCollection = typeof actions;
type ActionsKey = keyof ActionsCollection;
type ActionsParameters = Parameters<ActionsCollection[ActionsKey]>;

const assertActionType = (
  name: ActionsKey,
  type: Action['type'],
  args: ActionsParameters = []
) => () =>
  expect(
    actions[name](
      // @ts-ignore TODO figure out if / how this type can work
      ...args
    ).type
  ).toEqual(type);

const assertActionPayload = (
  name: ActionsKey,
  payload: any,
  args: ActionsParameters = []
) => () =>
  expect(
    actions[name](
      // @ts-ignore TODO figure out if / how this type can work
      ...args
    ).payload
  ).toEqual(payload);

const PLAN: Plan = {
  plan_id: 'plan_8675309',
  plan_name: 'Example plan',
  product_id: 'prod_8675309',
  product_name: 'Example product',
  currency: 'usd',
  amount: 599,
  interval: 'monthly',
};

describe('resetActions', () => {
  const actionNames: ActionsKey[] = [
    'resetCreateSubscription',
    'resetCancelSubscription',
    'resetReactivateSubscription',
    'resetUpdatePayment',
    'resetUpdateSubscriptionPlan',
  ];
  actionNames.forEach(name => {
    describe(name, () => {
      const type = name;
      it('produces the expected type', assertActionType(name, type));
    });
  });
});
