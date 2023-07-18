/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { useContext } from 'react';
import { AppContext } from '../AppContext';
import { IntegrationFactory } from '../../lib/integrations/integration-factory';
import { DefaultIntegrationFlags } from '../../lib/integrations/integration-factory-flags';
import { useAuthClient, useRelier } from '../hooks';

function useIntegrationFlags() {
  const { urlQueryData, storageData } = useContext(AppContext);

  if (!urlQueryData || !storageData) {
    throw new Error('Are you forgetting an AppContext.Provider?');
  }

  return new DefaultIntegrationFlags(urlQueryData, storageData);
}

export function CreateIntegrationFactory() {
  const { windowWrapper: window, urlQueryData } = useContext(AppContext);

  if (!window || !urlQueryData) {
    throw new Error('Are you forgetting an AppContext.Provider?');
  }

  const relier = useRelier();
  const flags = useIntegrationFlags();
  const authClient = useAuthClient();
  return new IntegrationFactory(
    flags,
    relier,
    authClient,
    window,
    urlQueryData
  );
}
