import actions from './actions';
import { Plan } from './types';

const PLAN: Plan = {
  plan_id: 'plan_8675309',
  plan_name: 'Example plan',
  product_id: 'prod_8675309',
  product_name: 'Example product',
  currency: 'usd',
  amount: 599,
  interval: 'monthly',
};

const assertActionType = (name, type, ...args: any) => () =>
  expect(actions[name](...args).type).toEqual(type);

[
  'createSubscriptionMounted',
  'createSubscriptionEngaged',
  'updatePaymentMounted',
  'updatePaymentEngaged',
  'cancelSubscriptionMounted',
  'cancelSubscriptionEngaged',
].forEach(name => {
  describe(name, () => {
    const type = name;
    it('produces the expected type', assertActionType(name, type, PLAN));
    it('includes plan in payload', () => {
      const result = actions[name](PLAN);
      expect(result.payload).toEqual({ plan: PLAN });
    });
  });
});

['manageSubscriptionsMounted', 'manageSubscriptionsEngaged'].forEach(name => {
  describe(name, () => {
    const type = name;
    it('produces the expected type', assertActionType(name, type));
  });
});
