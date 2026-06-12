/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { ReactNode } from 'react';
import { ModelValidationErrors } from '../../lib/model-data';
import * as Sentry from '@sentry/browser';
import AppErrorDialog from 'fxa-react/components/AppErrorDialog';

/**
 * Handles errors that might occur in fxa-settings
 */
export class AppErrorBoundary extends React.Component<{ children: ReactNode }> {
  state: {
    error?: Error;
    sentryEventId?: string;
  };

  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { error: undefined, sentryEventId: undefined };
  }

  static getDerivedStateFromError(error: Error) {
    return { error, hasError: true };
  }

  componentDidCatch(error: Error) {
    let sentryEventId: string;
    if (error instanceof ModelValidationErrors) {
      console.error('Model Validation errors encountered', error);
      sentryEventId = Sentry.captureException(error, {
        tags: { source: 'AppErrorBoundary', condition: error.condition },
      });
    } else {
      console.error('AppError', error);
      sentryEventId = Sentry.captureException(error, {
        tags: { source: 'AppErrorBoundary' },
      });
    }
    this.setState({ error, sentryEventId });
  }

  render() {
    if (this.state.error) {
      return (
        <AppError
          error={this.state.error}
          sentryEventId={this.state.sentryEventId}
        />
      );
    }

    return this.props.children;
  }
}

export const AppError = ({
  error,
  sentryEventId,
}: {
  error?: Error;
  sentryEventId?: string;
}) => {
  // Special handling for validation errors
  if (error instanceof ModelValidationErrors) {
    return (
      <AppErrorDialog
        errorType="query-parameter-violation"
        {...{ error, sentryEventId }}
      />
    );
  }

  return <AppErrorDialog {...{ error, sentryEventId }} />;
};
