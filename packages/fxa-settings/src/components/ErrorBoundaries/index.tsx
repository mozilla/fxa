/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { ReactNode } from 'react';
import { ModelValidationErrors } from '../../lib/model-data';
import * as Sentry from '@sentry/browser';
import AppErrorDialog from 'fxa-react/components/AppErrorDialog';
import { AuthUiErrors, isAuthUiError } from '../../lib/auth-errors/auth-errors';

/**
 * Handles errors that might occur in fxa-settings
 */
export class AppErrorBoundary extends React.Component<{ children: ReactNode }> {
  state: {
    error?: Error;
  };

  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { error: undefined };
  }

  static getDerivedStateFromError(error: Error) {
    return { error, hasError: true };
  }

  componentDidCatch(error: Error) {
    if (error instanceof ModelValidationErrors) {
      console.error('Model Validation errors encountered', error);
      Sentry.captureException(error, {
        tags: { source: 'AppErrorBoundary', condition: error.condition },
      });
    } else {
      console.error('AppError', error);
      Sentry.captureException(error, { tags: { source: 'AppErrorBoundary' } });
    }
    this.setState({ error });
  }

  render() {
    if (this.state.error) {
      return <AppError error={this.state.error} />;
    }

    return this.props.children;
  }
}

export const AppError = ({ error }: { error?: Error }) => {
  // Special handling for invalid session states
  if (
    isAuthUiError(error) &&
    (error.errno === AuthUiErrors.INVALID_TOKEN.errno ||
      error.errno === AuthUiErrors.UNVERIFIED_SESSION.errno)
  ) {
    // TODO: Add functionality so that is easy for a user to sign back in.
    return <AppErrorDialog errorType="invalid-session" />;
  }

  // Special handling for validation errors
  if (error instanceof ModelValidationErrors) {
    return <AppErrorDialog errorType="query-parameter-violation" />;
  }

  return <AppErrorDialog />;
};
