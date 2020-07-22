import React from 'react';
import { QueryParams } from './types';
import { Config, config } from './config';
import ScreenInfo from './screen-info';
import { loadStripe } from '@stripe/stripe-js';

export type AppContextType = {
  config: Config;
  queryParams: QueryParams;
  matchMedia: (query: string) => boolean;
  matchMediaDefault: (query: string) => MediaQueryList;
  navigateToUrl: (url: string) => void;
  getScreenInfo: () => ScreenInfo;
  locationReload: () => void;
  navigatorLanguages?: readonly string[];
  stripePromise: ReturnType<typeof loadStripe>;
};

/* istanbul ignore next - this function does nothing worth covering */
const noopFunction = () => {};

export const defaultAppContext = {
  config,
  getScreenInfo: () => new ScreenInfo(),
  locationReload: noopFunction,
  matchMedia: () => false,
  matchMediaDefault: (query: string) => matchMedia(query),
  navigateToUrl: noopFunction,
  queryParams: {},
  navigatorLanguages: ['en-US', 'en'],
  stripePromise: Promise.resolve(null),
};

export const AppContext = React.createContext<AppContextType>(
  defaultAppContext
);

export default AppContext;
