import React, { useState, useEffect } from 'react';
import { useInitialState } from '../../models';
import { RouteComponentProps } from '@reach/router';

export const PageWithLoggedInStatusState = (
  props: any & RouteComponentProps & { Page: React.ElementType }
) => {
  const { Page } = props;
  const { loading, error } = useInitialState();

  const [isSignedIn, setIsSignedIn] = useState<boolean>();

  useEffect(() => {
    if (!loading && error?.message.includes('Invalid token')) {
      setIsSignedIn(false);
    } else if (!loading && !error) {
      setIsSignedIn(true);
    }
  }, [error, loading]);

  return <Page {...props} {...{ isSignedIn }} />;
};

export default PageWithLoggedInStatusState;
