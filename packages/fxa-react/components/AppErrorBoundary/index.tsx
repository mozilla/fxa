/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import AppErrorDialog from '../AppErrorDialog';
import * as Sentry from '@sentry/browser';

type AppErrorBoundaryProps = {
  children?: React.ReactNode;
};

type AppErrorBoundaryState = {
  error: Error | undefined;
  sentryEventId: string | undefined;
};

class AppErrorBoundary extends React.Component<
  AppErrorBoundaryProps,
  AppErrorBoundaryState
> {
  state: {
    error: undefined | Error;
    sentryEventId: undefined | string;
  };

  constructor(props: AppErrorBoundaryProps) {
    super(props);
    this.state = { error: undefined, sentryEventId: undefined };
  }

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error('AppError', error);
    const sentryEventId = Sentry.captureException(error, {
      tags: { source: 'AppErrorBoundary' },
    });
    this.setState({ sentryEventId });
  }

  render() {
    const { error, sentryEventId } = this.state;
    return error ? (
      <AppErrorDialog {...{ error, sentryEventId }} />
    ) : (
      this.props.children
    );
  }
}

export default AppErrorBoundary;
