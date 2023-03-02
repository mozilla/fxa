import React, { useState, useEffect } from 'react';
import { useInitialState, useRelier } from '../../models';
import { RouteComponentProps } from '@reach/router';

export const PageWithLoggedInStatusState = (
  props: any &
    RouteComponentProps & {
      Page: React.ElementType;
    }
) => {
  const { Page } = props;
  const { loading, error } = useInitialState();

  const [isSignedIn, setIsSignedIn] = useState<boolean>();
  const [isSync, setIsSync] = useState<boolean>();
  const [serviceName, setServiceName] = useState<string>();
  const relier = useRelier();

  // TODO: Get the broker `continue` action once https://mozilla-hub.atlassian.net/browse/FXA-6989 is merged
  let continueHandler: Function | undefined;

  useEffect(() => {
    if (!loading && error?.message.includes('Invalid token')) {
      setIsSignedIn(false);
    } else if (!loading && !error) {
      setIsSignedIn(true);
    }
    try {
      if (relier.service === 'sync') {
        setIsSync(true);
      } else {
        setIsSync(false);
      }
      setServiceName(relier.service);
    } catch {
      setIsSync(false);
    }
  }, [error, loading, relier, setIsSync, isSync]);

  return <Page {...{ isSignedIn, isSync, serviceName, continueHandler }} />;
};

export default PageWithLoggedInStatusState;
