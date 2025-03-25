/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import AppErrorDialog from '../AppErrorDialog';
import * as Sentry from '@sentry/browser';
import { ValidationError } from 'class-validator';

interface AppErrorBoundaryProps {
  children?: React.ReactNode;
}

interface AppErrorBoundaryState {
  error: Error | { errors: ValidationError[] } | undefined;
}

class AppErrorBoundary extends React.Component<
  AppErrorBoundaryProps,
  AppErrorBoundaryState
> {
  state: {
    error: undefined | Error | { errors: ValidationError[] };
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

    // Check to see if there are set of validation issues.
    if (error && 'errors' in error) {
      return (
        <>
          <h1>Invalid application state detected.</h1>
        </>
      );
    }

    return error ? <AppErrorDialog /> : (this.props as any).children;
  }
}

export default AppErrorBoundary;
