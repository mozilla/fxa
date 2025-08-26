/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { createContext, useContext, ReactNode } from 'react';
import { RelierCmsInfo } from '../integrations';

type CmsContextValue = {
  cmsInfo: RelierCmsInfo | undefined;
  isLoading: boolean;
  error: Error | undefined;
  // extract commonly used props from shared
  backgroundColor: string | undefined;
  logoUrl: string | undefined;
  logoAltText: string | undefined;
  pageTitle: string | undefined;
  favicon: string | undefined;
};

const CmsContext = createContext<CmsContextValue | undefined>(undefined);

type CmsProviderProps = {
  children: ReactNode;
  cmsInfo: RelierCmsInfo | undefined;
  isLoading: boolean;
  error: Error | undefined;
};

export const CmsProvider = ({ children, cmsInfo, isLoading, error }: CmsProviderProps) => {

  const { backgroundColor, logoUrl, logoAltText, pageTitle, favicon } = cmsInfo?.shared || {};
  const value: CmsContextValue = {
    cmsInfo,
    isLoading,
    error,
    backgroundColor,
    logoUrl,
    logoAltText,
    pageTitle,
    favicon,
  };

  return (
    <CmsContext.Provider value={value}>
      {children}
    </CmsContext.Provider>
  );
};

export const useCms = (): CmsContextValue => {
  const context = useContext(CmsContext);
  if (context === undefined) {
    throw new Error('useCms must be used within a CmsProvider');
  }
  return context;
};

export { CmsContext };
