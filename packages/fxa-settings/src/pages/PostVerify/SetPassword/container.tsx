/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { RouteComponentProps } from '@reach/router';
import SetPassword from '.';
import { currentAccount } from '../../../lib/cache';
import LoadingSpinner from 'fxa-react/components/LoadingSpinner';
import { useNavigateWithQuery as useNavigate } from '../../../lib/hooks/useNavigateWithQuery';
import { useAuthClient, useSensitiveDataClient } from '../../../models';
import { cache } from '../../../lib/cache';
import { useCallback } from 'react';
import { CreatePasswordHandler, SetPasswordIntegration } from './interfaces';
import { HandledError } from '../../../lib/error-utils';
import {
  AuthUiErrorNos,
  AuthUiErrors,
} from '../../../lib/auth-errors/auth-errors';
import {
  AUTH_DATA_KEY,
  SensitiveDataClientAuthKeys,
} from '../../../lib/sensitive-data-client';

const SetPasswordContainer = ({
  integration,
}: { integration: SetPasswordIntegration } & RouteComponentProps) => {
  const navigate = useNavigate();
  const authClient = useAuthClient();
  const storedLocalAccount = currentAccount();
  const email = storedLocalAccount?.email;
  const sessionToken = storedLocalAccount?.sessionToken;
  const uid = storedLocalAccount?.uid;

  const sensitiveDataClient = useSensitiveDataClient();
  const sensitiveData = sensitiveDataClient.getData(AUTH_DATA_KEY);
  const { keyFetchToken, unwrapBKey } =
    (sensitiveData as SensitiveDataClientAuthKeys) || {};

  const createPasswordHandler: CreatePasswordHandler = useCallback(
    async (email, sessionToken, newPassword) => {
      try {
        const passwordCreated = await authClient.createPassword(
          sessionToken,
          email,
          newPassword
        );
        cache.modify({
          id: cache.identify({ __typename: 'Account' }),
          fields: {
            passwordCreated() {
              return passwordCreated;
            },
          },
        });
        return { error: null };
      } catch (error) {
        const { errno } = error as HandledError;
        if (errno && AuthUiErrorNos[errno]) {
          return { error };
        }
        return { error: AuthUiErrors.UNEXPECTED_ERROR as HandledError };
      }
    },
    [authClient]
  );

  // Users must be already authenticated on this page. This page is currently always
  // for the Sync flow so keys are always required.
  if (
    !email ||
    !sessionToken ||
    !uid ||
    !keyFetchToken ||
    !unwrapBKey ||
    !integration.isSync()
  ) {
    navigate('/signin', { replace: true });
    return <LoadingSpinner />;
  }

  return (
    <SetPassword
      {...{
        email,
        sessionToken,
        uid,
        createPasswordHandler,
        keyFetchToken,
        unwrapBKey,
        integration,
      }}
    />
  );
};

export default SetPasswordContainer;
