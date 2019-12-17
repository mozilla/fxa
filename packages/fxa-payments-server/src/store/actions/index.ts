import apiActions from './api';
import resetActions from './reset';
import { FunctionWithIgnoredReturn, PromiseResolved } from '../../lib/types';

// https://gist.github.com/schettino/c8bf5062ef99993ce32514807ffae849#gistcomment-2906407
export type ActionType<
  TActions extends { [key: string]: (...args: any) => any }
> = ReturnType<TActions[keyof TActions]>;

export type ResetAction = ActionType<typeof resetActions>;
export type ApiAction = ActionType<typeof apiActions>;
export type Action = ApiAction | ResetAction;

export const actions = {
  ...apiActions,
  ...resetActions,
} as const;

export type ActionsCollection = typeof actions;
export type ActionsKey = keyof ActionsCollection;
export type ActionsParameters = Parameters<ActionsCollection[ActionsKey]>;

// Slightly relaxed type for actions that expects the return value to be
// ignored, which should help for easier mocking in tests & stories.
export type ActionFunctions = {
  [key in ActionsKey]: FunctionWithIgnoredReturn<ActionsCollection[key]>;
};

type PromisePayloadSequenceCreator = (
  ...a: any
) => { payload: () => Promise<any> };
type PromisePayloadActionCreator = (...a: any) => { payload: Promise<any> };
type PayloadActionCreator = (...a: any) => { payload: any };

export type ActionPayload<
  A extends
    | PromisePayloadSequenceCreator
    | PromisePayloadActionCreator
    | PayloadActionCreator
> = A extends PromisePayloadSequenceCreator
  ? PromiseResolved<ReturnType<ReturnType<A>['payload']>>
  : A extends PromisePayloadActionCreator
  ? PromiseResolved<ReturnType<A>['payload']>
  : A extends PayloadActionCreator
  ? ReturnType<A>['payload']
  : unknown;

export default actions;
