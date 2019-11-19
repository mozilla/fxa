import apiActions from './api';
import metricsActions from './metrics';
import resetActions from './reset';

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
};

export default actions;
