import React from 'react';
import { Config, QueryParams } from './types';

export type AppContextType = {
  accessToken: string,
  config: Config,
  queryParams: QueryParams,
  navigateToUrl: (url: string) => void,
}

const defaultContext = {
  accessToken: '',
  config: {},
  queryParams: {},
  navigateToUrl: () => {}
};

export const AppContext = React.createContext<AppContextType>(defaultContext);