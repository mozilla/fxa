import React from 'react';
import { Config, QueryParams } from './types';
import ScreenInfo from './screen-info';

export type AppContextType = {
  accessToken: string,
  config: Config,
  queryParams: QueryParams,
  navigateToUrl: (url: string) => void,
  getScreenInfo: () => ScreenInfo,
}

export const defaultAppContext = {
  accessToken: '',
  config: {},
  queryParams: {},
  navigateToUrl: () => {},
  getScreenInfo: () => new ScreenInfo(),
};

export const AppContext =
  React.createContext<AppContextType>(defaultAppContext);

export default AppContext;