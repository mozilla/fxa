import React from 'react';
import { Config, QueryParams } from './types';

export type AppContextType = {
  accessToken: string,
  config: Config,
  queryParams: QueryParams,
}

const defaultContext = {
  accessToken: '',
  config: {},
  queryParams: {},
};

export const AppContext = React.createContext<AppContextType>(defaultContext);
