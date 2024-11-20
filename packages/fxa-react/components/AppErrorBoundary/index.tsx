/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import AppErrorDialog from '../AppErrorDialog';
import * as Sentry from '@sentry/browser';

interface AppErrorBoundaryProps {
  children?: React.ReactNode;
}

interface AppErrorBoundaryState {
  error: Error | undefined;
}

class AppErrorBoundary extends React.Component<
  AppErrorBoundaryProps,
  AppErrorBoundaryState
> {
  state: {
    error: undefined | Error;
  };

  constructor(props: {}) {
    super(props);
    this.state = { error: undefined };
  }

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error('AppError', error);
    Sentry.captureException(error, { tags: { source: 'AppErrorBoundary' } });
  }

  render() {
    const { error } = this.state;
    return error ? (
      <AppErrorDialog {...{ error }} />
    ) : (
      (this.props as any).children
    );
  }
}

export default AppErrorBoundary;
