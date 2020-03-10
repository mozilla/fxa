import React from 'react';
import { QueryParams } from './types';
import { Config, config } from './config';
import ScreenInfo from './screen-info';

export type AppContextType = {
  config: Config;
  queryParams: QueryParams;
  matchMedia: (query: string) => boolean;
  matchMediaDefault: (query: string) => MediaQueryList;
  navigateToUrl: (url: string) => void;
  getScreenInfo: () => ScreenInfo;
  locationReload: (url: string) => void;
};

/* istanbul ignore next - this function does nothing worth covering */
const noopFunction = () => {};

export const defaultAppContext = {
  config,
  getScreenInfo: () => new ScreenInfo(),
  locationReload: noopFunction,
  matchMedia: () => false,
  matchMediaDefault: (query: string) => MediaQueryList,
  navigateToUrl: noopFunction,
  queryParams: {},
};

export const AppContext = React.createContext<AppContextType>(
  defaultAppContext
);

export default AppContext;
