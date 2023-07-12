/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { gql, useMutation } from '@apollo/client';
import ResetPassword from '.';
import { MozServices } from '../../lib/types';
import { useCallback, useState } from 'react';
import {
  AuthUiErrorNos,
  AuthUiErrors,
  composeAuthUiErrorTranslationId,
} from '../../lib/auth-errors/auth-errors';
import { RouteComponentProps } from '@reach/router';
import { GraphQLError } from 'graphql';
import { useValidatedQueryParams } from '../../lib/hooks/useValidate';
import {
  AccountRecoveryKeyInfo,
  ResetPasswordQueryParams,
} from '../../models/reset-password';
import LoadingSpinner from 'fxa-react/components/LoadingSpinner';

// WIP PROTOTYPE
// ❌ = Note for prototype review. Comment will be removed in implementation.

export interface PasswordForgotSendCodeResponse {
  passwordForgotSendCode: {
    passwordForgotToken: string;
  };
}

export type BeginResetPasswordHandler = (
  email: string,
  service?: MozServices
) => Promise<void>;

export interface BeginResetPasswordResult {
  // ❌ 'data' is undefined when the mutation is loading and is 'null' when there
  //  is an error
  data: PasswordForgotSendCodeResponse | null | undefined;
  loading: boolean;
  error?: {
    errno: number;
    message: string;
    ftlId: string;
    retryAfterLocalized?: string;
  };
}

export const BEGIN_RESET_PASSWORD_MUTATION = gql`
  mutation passwordForgotSendCode($input: PasswordForgotSendCodeInput!) {
    passwordForgotSendCode(input: $input) {
      passwordForgotToken
    }
  }
`;

// ❌ Every page component that needs an API call or data validation will have a
// corresponding container component to handle it.
const ResetPasswordContainer = (_: RouteComponentProps) => {
  // ❌ Instead of model.method in page components, e.g. `account.resetPassword`,
  // queries and mutations will be executed in a page container component. This
  // is possible by wrapping our app in `<ApolloProvider>` and allows:
  // 1) Keeping the presentation layer light. "Heavy lifting" in our components is
  // one reason we created the Account model (see pull/8138)
  // 2) Better separation of our API/network layer from our data model. The
  // Account model acts as both and has grown too large; having a per-page
  // container makes it easy to see what data needs to be fetched and used and
  // what processing occurs for that page. Keeping GQL in only this layer also
  // makes it easier to refactor away from GQL if we ever desire to in the future
  // 3) Using hooks instead of `apolloClient.query` or `apolloClient.mutate`
  // which has several benefits, including attaching to the React lifecycle,
  // easier polling, and more documentation
  // 4) Easier testing. By never using `useQuery` or `useMutation` in our
  // presentation layer, we don't need to use `MockedProvider`, which can require
  // heavy mocking and setup, _except_ for in page container tests. This also
  // provides more inversion of control.
  const [beginResetPassword, beginResetPasswordMutationResult] =
    useMutation<PasswordForgotSendCodeResponse>(BEGIN_RESET_PASSWORD_MUTATION);
  const [beginResetPasswordError, setBeginResetPasswordError] =
    useState<BeginResetPasswordResult['error']>(undefined);

  // ❌ Validate all the things. We may prefer for the model to handle these
  // variations for us, e.g. we have one model per page and we have it attempt
  // to read from router state, then localStorage, then query params but,
  // it may also be nice to be more explicit.
  const { queryParams, queryParamErrors } = useValidatedQueryParams(
    ResetPasswordQueryParams
  );
  // ❌ Haven't implemented, but same idea as useValidatedQueryParams
  // const { routerState, routerStateErrors } = useValidatedRouterState(
  //   AccountRecoveryKeyInfo
  // );

  const beginResetPasswordHandler: BeginResetPasswordHandler = useCallback(
    async (email, service) => {
      try {
        await beginResetPassword({
          variables: {
            input: {
              email,
              // Only include the `service` option if the service is Sync.
              // This becomes a query param (service=sync) on the email link.
              // We need to modify this in FXA-7657 to send the `client_id` param
              // when we work on the OAuth flow.
              ...(service &&
                service === MozServices.FirefoxSync && { service: 'sync' }),
            },
          },
        });
        setBeginResetPasswordError(undefined);
      } catch (error) {
        // ❌ All error processing should occur here. Let the presentation component
        // handle just the presentation.
        const graphQLError: GraphQLError = error.graphQLErrors[0];
        if (graphQLError && graphQLError.extensions) {
          const { errno, retryAfterLocalized } = graphQLError.extensions;

          setBeginResetPasswordError({
            errno,
            message: AuthUiErrorNos[errno].message,
            // ❌ Because grabbing the FTL ID from an error always requires a call to
            // composeAuthUiErrorTranslationId, it seemed best to do that here when
            // creating a new error object. Allow actual l10n with FtlMsg or FtlMsgResolver
            // to occur in the presentation layer.
            ftlId: composeAuthUiErrorTranslationId({ errno }),
            retryAfterLocalized,
          });
        } else {
          // ❌ Prior to our Account refactor, we had a custom `useMutation` hook that
          // would capture networkErrors in Sentry. We may want to use that here as well.
          // https://github.com/mozilla/fxa/blob/690a6b31f787e1325f13776f3ab577f153f1f8b1/packages/fxa-settings/src/lib/hooks.tsx#L68
          // See our docs that explain more:
          // https://github.com/mozilla/fxa/tree/main/packages/fxa-settings#gql-error-handling

          // TODO: why is `errno` in `AuthServerError` possibly undefined?
          // might want to grab from `ERRORS.UNEXPECTED_ERROR` instead
          const { errno = 999, message } = AuthUiErrors.UNEXPECTED_ERROR;
          setBeginResetPasswordError({
            errno,
            message,
            ftlId: composeAuthUiErrorTranslationId({ errno }),
          });
        }
      }
    },
    [beginResetPassword]
  );

  // ❌ We may or may not want this per container component but we can show a loading
  // spinner here if validation is required and hasn't occured yet.
  if (queryParams === null) {
    return <LoadingSpinner />;
  }
  // ❌ Handle query param validation errors, e.g. return LinkDamaged or whatever
  // makes sense for that error. Can also access errors like `queryParamErrors.email`
  if (queryParamErrors) {
    console.log('queryParamErrors', queryParamErrors);
  }

  // ❌ Create a result object per query or mutation whose name matches
  // the handler. On more complex pages we will be passing multiple handlers
  // and their results.
  const beginResetPasswordResult: BeginResetPasswordResult = {
    data: beginResetPasswordMutationResult.data,
    loading: beginResetPasswordMutationResult.loading,
    error: beginResetPasswordError,
  };

  return (
    <ResetPassword
      {...{ beginResetPasswordHandler, beginResetPasswordResult, queryParams }}
    />
  );
};

export default ResetPasswordContainer;
