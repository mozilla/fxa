import React from 'react';
import { QueryParams } from './types';
import { Config, config } from './config';
import ScreenInfo from './screen-info';

export type AppContextType = {
  accessToken: string;
  config: Config;
  queryParams: QueryParams;
  navigateToUrl: (url: string) => void;
  getScreenInfo: () => ScreenInfo;
  locationReload: (url: string) => void;
};

/* istanbul ignore next - this function does nothing worth covering */
const noopFunction = () => {};

export const defaultAppContext = {
  accessToken: '',
  config,
  getScreenInfo: () => new ScreenInfo(),
  locationReload: noopFunction,
  navigateToUrl: noopFunction,
  queryParams: {},
};

export const AppContext = React.createContext<AppContextType>(
  defaultAppContext
);

export default AppContext;
