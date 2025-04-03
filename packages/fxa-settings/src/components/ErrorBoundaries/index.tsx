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
export class ErrorBoundary extends React.Component<{ children: ReactNode }> {
  state: {
    error?: Error;
  };

  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { error: undefined };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    this.setState({ error });

    if (error instanceof ModelValidationErrors) {
      console.warn('Model Validation errors encountered', error);
    } else {
      console.error('AppError', error);
      Sentry.captureException(error, { tags: { source: 'AppErrorBoundary' } });
    }
  }

  render() {
    if (this.state.error) {
      return <AppError error={this.state.error} />;
    }

    return this.props.children;
  }
}

export const AppError = ({ error }: { error?: Error }) => {
  // Special handling for validation errors
  if (
    error instanceof ModelValidationErrors &&
    error.condition === 'QueryParameterValidation'
  ) {
    const errors = error.toUserFriendlyErrorList().map((x) => {
      return (
        <p className="mb-3">
          {x.message && <b>{x.message}</b>}

          {x.constraints && (
            <ul className="ms-2">
              {x.constraints.map((x) => (
                <li>{x}</li>
              ))}
            </ul>
          )}
        </p>
      );
    });

    return (
      <AppErrorDialog errorType="query-parameter-violation" errors={errors} />
    );
  }
  return <AppErrorDialog />;
};
