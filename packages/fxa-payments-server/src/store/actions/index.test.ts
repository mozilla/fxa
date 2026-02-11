import actions, { Action } from './index';

type ActionsCollection = typeof actions;
type ActionsKey = keyof ActionsCollection;
type ActionsParameters = Parameters<ActionsCollection[ActionsKey]>;

const assertActionType =
  (name: ActionsKey, type: Action['type'], args: ActionsParameters = []) =>
  () =>
    expect(
      actions[name](
        // @ts-ignore TODO figure out if / how this type can work
        ...args
      ).type
    ).toEqual(type);

describe('resetActions', () => {
  const actionNames: ActionsKey[] = [
    'resetCancelSubscription',
    'resetReactivateSubscription',
    'resetUpdateSubscriptionPlan',
  ];
  actionNames.forEach((name) => {
    describe(`${name}`, () => {
      const type = name;
      it('produces the expected type', assertActionType(name, type));
    });
  });
});
