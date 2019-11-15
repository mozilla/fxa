import apiActions from './api';
import metricsActions from './metrics';
import resetActions from './reset';
import { FunctionWithIgnoredReturn } from '../../lib/types';

// https://gist.github.com/schettino/c8bf5062ef99993ce32514807ffae849#gistcomment-2906407
export type ActionType<
  TActions extends { [key: string]: (...args: any) => any }
> = ReturnType<TActions[keyof TActions]>;

export type ResetAction = ActionType<typeof resetActions>;
export type MetricsAction = ActionType<typeof metricsActions>;
export type ApiAction = ActionType<typeof apiActions>;
export type Action = ApiAction | ResetAction | MetricsAction;

export const actions = {
  ...apiActions,
  ...resetActions,
  ...metricsActions,
} as const;

export type ActionsCollection = typeof actions;
export type ActionsKey = keyof ActionsCollection;
export type ActionsParameters = Parameters<ActionsCollection[ActionsKey]>;

// Slightly relaxed type for actions that expects the return value to be
// ignored, which should help for easier mocking in tests & stories.
export type ActionFunctions = {
  [key in ActionsKey]: FunctionWithIgnoredReturn<ActionsCollection[key]>;
};

export default actions;
