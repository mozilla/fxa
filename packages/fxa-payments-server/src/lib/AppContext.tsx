import React from 'react';
import { QueryParams, Token, Plan, Profile, Customer, Subscription } from './types';
import { Config, config } from './config';
import ScreenInfo from './screen-info';

export type AppContextType = {
  config: Config;
  queryParams: QueryParams;
  matchMedia: (query: string) => boolean;
  navigateToUrl: (url: string) => void;
  getScreenInfo: () => ScreenInfo;
  locationReload: (url: string) => void;
  token: Token | undefined;
  plans: Plan[] | undefined;
  profile: Profile | undefined;
  customer: Customer | undefined;
  fetchCustomer: () => Promise<any>;
  subscriptions: Subscription[] | undefined;
  fetchSubscriptions: () => Promise<any>;
};

/* istanbul ignore next - this function does nothing worth covering */
const noopFunction = () => {};

/* istanbul ignore next - this function does nothing worth covering */
const noopPromise = () => Promise.resolve();

export const defaultAppContext = {
  config,
  getScreenInfo: () => new ScreenInfo(),
  locationReload: noopFunction,
  matchMedia: () => false,
  navigateToUrl: noopFunction,
  queryParams: {},
  token: undefined,
  plans: undefined,
  profile: undefined,
  customer: undefined,
  subscriptions: undefined,
  fetchCustomer: noopPromise,
  fetchSubscriptions: noopPromise,
};

export const AppContext = React.createContext<AppContextType>(
  defaultAppContext
);

export default AppContext;
