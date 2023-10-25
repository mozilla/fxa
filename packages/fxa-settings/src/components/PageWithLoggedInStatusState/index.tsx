/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useState, useEffect } from 'react';
import { Integration, useInitialSettingsState } from '../../models';
import { RouteComponentProps } from '@reach/router';
import LoadingSpinner from 'fxa-react/components/LoadingSpinner';

// TODO: revisit this component in FXA-8098, do we need it?
// We should at least see if we want to check for `isSync()` instead
// and stop overfetching here with useInitialSettingsState
export const PageWithLoggedInStatusState = (
  props: any &
    RouteComponentProps & {
      Page: React.ElementType;
      integration: Integration;
    }
) => {
  const { Page, integration } = props;
  const { loading, error } = useInitialSettingsState();

  const [isSignedIn, setIsSignedIn] = useState<boolean>();
  const [isSync, setIsSync] = useState<boolean>();
  const [serviceName, setServiceName] = useState<string>();

  // TODO: Get the broker `continue` action once https://mozilla-hub.atlassian.net/browse/FXA-6989 is merged
  let continueHandler: Function | undefined;

  useEffect(() => {
    if (!loading && error?.message.includes('Invalid token')) {
      setIsSignedIn(false);
    } else if (!loading && !error) {
      setIsSignedIn(true);
    }
    if (integration.data.service === 'sync') {
      setIsSync(true);
    } else {
      setIsSync(false);
      (async () => {
        const name = await integration.getServiceName();
        setServiceName(name);
      })();
    }
  }, [error, loading, integration, setIsSync, isSync]);

  if (loading) {
    return (
      <LoadingSpinner className="bg-grey-20 flex items-center flex-col justify-center h-screen select-none" />
    );
  }
  return (
    // TODO: ResetPasswordConfirmed needs 'integration' but could also just take the
    // serviceName if we use integration.serviceName. Look @ in FXA-8098
    <Page
      {...{ isSignedIn, isSync, serviceName, continueHandler, integration }}
    />
  );
};

export default PageWithLoggedInStatusState;
