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

export const defaultAppContext = {
  accessToken: '',
  config,
  queryParams: {},
  navigateToUrl: () => {},
  getScreenInfo: () => new ScreenInfo(),
  locationReload: () => {},
};

export const AppContext = React.createContext<AppContextType>(
  defaultAppContext
);

export default AppContext;
