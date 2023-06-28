/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { render, waitFor, screen, fireEvent } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import ResetPasswordContainer, {
  BEGIN_RESET_PASSWORD_MUTATION,
  BeginResetPasswordResult,
} from './container';
import { GraphQLError } from 'graphql';
import { MOCK_ACCOUNT } from '../../models/mocks';
import { AuthUiError, AuthUiErrors } from '../../lib/auth-errors/auth-errors';

interface MockResponseOptions {
  email?: string;
  service?: string;
  error?: AuthUiError | BeginResetPasswordResult['error'];
  data?: BeginResetPasswordResult['data'];
  message?: string;
}

function createMockResponse({
  email = 'john@dope.com',
  service = 'sync',
  error,
  data,
  message,
}: MockResponseOptions) {
  return {
    request: {
      query: BEGIN_RESET_PASSWORD_MUTATION,
      variables: {
        input: { email, service },
      },
    },
    // ❌ After writing this I noticed we have still have notes in fxa-settings
    //  on how to mock mutation errors so this probably needs to be refactored:
    // https://github.com/mozilla/fxa/tree/main/packages/fxa-settings#mocking-mutation-errors
    result: () => {
      if (error) {
        // TODO: why is `message` in `AuthServerError` possibly undefined?
        throw new GraphQLError(message!, null, null, null, null, null, error);
      }
      return { data };
    },
    error: message ? new Error(message) : undefined,
  };
}

const mockResponse = createMockResponse({
  data: {
    passwordForgotSendCode: {
      passwordForgotToken: '123',
    },
  },
});

const mockResponseWithUnknownAccountError = createMockResponse({
  error: AuthUiErrors.UNKNOWN_ACCOUNT,
  message: 'Error!',
});

const mockResponseWithThrottledError = createMockResponse({
  error: {
    ...AuthUiErrors.THROTTLED,
    retryAfterLocalized: 'in 15 minutes',
  },
  message: 'Throttled Error!',
});

const mockResponseWithNetworkError = createMockResponse({
  message: 'Network error',
});

// ❌ We may want to consider using `MockedCache` which was deleted in a refactor:
// https://github.com/mozilla/fxa/blob/7a2fef8b77778eaa1b85fd961b924f8aa5afdc14/packages/fxa-settings/src/models/_mocks.tsx#L119
//
// Alternatively, we can mock `beginPasswordResetResult.error` in ResetPassword.
// However, it'd be nice to have some testing in container components to ensure
// we're performing queries and mutations as expected and processing errors as
// expected that we're going to pass into ResetPassword. This could provide a
// separation of concerns between errors coming from API calls to be tested here
// and ResetPassword tests dealing with other errors (like an empty email input).
// We're currently lacking any tests in Account.ts.
describe('PageResetPassword', () => {
  it('should render without error', async () => {
    render(
      <MockedProvider mocks={[mockResponse]} addTypename={false}>
        <ResetPasswordContainer />
      </MockedProvider>
    );
    screen.getByRole('heading', { name: 'Reset Password' });
  });

  describe('should handle GraphQLErrors', () => {
    it('should handle an unknown account', async () => {
      render(
        <MockedProvider
          mocks={[mockResponseWithUnknownAccountError]}
          addTypename={false}
        >
          <ResetPasswordContainer />
        </MockedProvider>
      );

      fireEvent.input(screen.getByTestId('reset-password-input-field'), {
        target: { value: MOCK_ACCOUNT.primaryEmail.email },
      });

      fireEvent.click(screen.getByRole('button'));
      await waitFor(() => screen.findByText('Unknown account'));
    });

    it('should handle throttling', async () => {
      render(
        <MockedProvider
          mocks={[mockResponseWithThrottledError]}
          addTypename={false}
        >
          <ResetPasswordContainer />
        </MockedProvider>
      );

      fireEvent.input(screen.getByTestId('reset-password-input-field'), {
        target: { value: MOCK_ACCOUNT.primaryEmail.email },
      });

      fireEvent.click(screen.getByText('Begin reset'));

      await waitFor(() =>
        screen.findByText(
          'You’ve tried too many times. Please try again in 15 minutes.'
        )
      );
    });
  });

  it('should handle error state with network error', async () => {
    render(
      <MockedProvider
        mocks={[mockResponseWithNetworkError]}
        addTypename={false}
      >
        <ResetPasswordContainer />
      </MockedProvider>
    );

    fireEvent.input(screen.getByTestId('reset-password-input-field'), {
      target: { value: MOCK_ACCOUNT.primaryEmail.email },
    });

    fireEvent.click(screen.getByText('Begin reset'));
    await waitFor(() => screen.findByText('Unexpected error'));
  });
});
