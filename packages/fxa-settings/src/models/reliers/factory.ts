/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { useContext } from 'react';
import { DefaultRelierFlags, RelierFactory } from '../../lib/reliers';
import { AppContext } from '../AppContext';

export function CreateRelierDelegates() {
  const { oauthClient, authClient, windowWrapper } = useContext(AppContext);

  if (!oauthClient || !authClient || !windowWrapper) {
    throw new Error('Are you forgetting an AppContext.Provider?');
  }

  const delegates = {
    getClientInfo: (id: string) => oauthClient.getClientInfo(id),
    getProductInfo: (id: string) => authClient.getProductInfo(id),
    getProductIdFromRoute: () => {
      const re = new RegExp('/subscriptions/products/(.*)');
      return re.exec(windowWrapper.location.pathname)?.[1] || '';
    },
  };

  return delegates;
}

export function CreateRelierFlags() {
  const { urlQueryData, storageData } = useContext(AppContext);

  if (!urlQueryData || !storageData) {
    throw new Error('Are you forgetting an AppContext.Provider?');
  }

  return new DefaultRelierFlags(urlQueryData, storageData);
}

export function CreateRelierFactory() {
  const {
    windowWrapper: window,
    urlQueryData,
    urlHashData,
  } = useContext(AppContext);

  if (!window || !urlHashData || !urlQueryData) {
    throw new Error('Are you forgetting an AppContext.Provider?');
  }

  const delegates = CreateRelierDelegates();
  const flags = CreateRelierFlags();
  const relierFactory = new RelierFactory({
    window,
    delegates,
    data: urlQueryData,
    channelData: urlHashData,
    flags,
  });
  return relierFactory;
}

export function CreateRelier() {
  return CreateRelierFactory().getRelier();
}
