/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useCallback, useState } from 'react';
import {
  useAuthClient,
  useFtlMsgResolver,
  useSensitiveDataClient,
} from '../../models';
import { RouteComponentProps, useLocation } from '@reach/router';
import InlineRecoveryKeySetup from '.';
import { SigninLocationState } from '../Signin/interfaces';
import { cache } from '../../lib/cache';
import { generateRecoveryKey } from 'fxa-auth-client/browser';
import { CreateRecoveryKeyHandler } from './interfaces';
import { AUTH_DATA_KEY } from '../../lib/sensitive-data-client';
import { getSyncNavigate } from '../Signin/utils';
import { hardNavigate } from 'fxa-react/lib/utils';
import { formatRecoveryKey } from '../../lib/utilities';

export const InlineRecoveryKeySetupContainer = (_: RouteComponentProps) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [formattedRecoveryKey, setFormattedRecoveryKey] = useState<string>('');
  const ftlMsgResolver = useFtlMsgResolver();
  const authClient = useAuthClient();

  const location = useLocation() as ReturnType<typeof useLocation> & {
    state?: SigninLocationState;
  };
  const { email, uid, sessionToken } = location.state || {};

  const sensitiveDataClient = useSensitiveDataClient();
  const sensitiveData = sensitiveDataClient.getData(AUTH_DATA_KEY);
  const { authPW, emailForAuth, unwrapBKey } =
    (sensitiveData as {
      emailForAuth?: string;
      authPW?: string;
      unwrapBKey?: hexstring;
    }) || {};

  const navigateForward = useCallback(() => {
    setCurrentStep(currentStep + 1);
  }, [currentStep]);

  const createRecoveryKey = useCallback(
    (
        uid: string,
        sessionToken: string,
        unwrapBKey: string,
        emailForAuth: string,
        authPW: string
      ): (() => Promise<CreateRecoveryKeyHandler>) =>
      async () => {
        try {
          // We must reauth for another `keyFetchToken` because we sent it to Sync
          const reauth = await authClient.sessionReauthWithAuthPW(
            sessionToken,
            emailForAuth,
            authPW,
            {
              keys: true,
              reason: 'recovery_key',
            }
          );
          if (!reauth.keyFetchToken) throw new Error('Invalid keyFetchToken');
          const keys = await authClient.accountKeys(
            reauth.keyFetchToken,
            unwrapBKey
          );
          const { recoveryKey, recoveryKeyId, recoveryData } =
            await generateRecoveryKey(uid, keys);
          await authClient.createRecoveryKey(
            sessionToken,
            recoveryKeyId,
            recoveryData
          );

          cache.modify({
            id: cache.identify({ __typename: 'Account' }),
            fields: {
              recoveryKey() {
                return {
                  exists: true,
                };
              },
            },
          });
          setFormattedRecoveryKey(formatRecoveryKey(recoveryKey.buffer));
          navigateForward();
          return { data: { recoveryKey } };
        } catch (error) {
          return {
            localizedErrorMessage: ftlMsgResolver.getMsg(
              'inline-recovery-key-setup-create-error',
              'Oops! We couldn’t create your account recovery key. Please try again later.'
            ),
          };
        }
      },
    [authClient, navigateForward, ftlMsgResolver]
  );

  const updateRecoveryHint = useCallback(
    (sessionToken: string): ((hint: string) => Promise<void>) =>
      async (hint: string) => {
        // The try/catch for this is handled in the component where it's called
        // because we're sharing the Hint component with Settings + Account.ts
        authClient.updateRecoveryKeyHint(sessionToken, hint);
      },
    [authClient]
  );

  if (
    !uid ||
    !sessionToken ||
    !unwrapBKey ||
    !email ||
    !emailForAuth ||
    !authPW
  ) {
    // go to CAD with success messaging, we do not want to re-prompt for password
    const { to } = getSyncNavigate(location.search);
    hardNavigate(to);
    return <></>;
  }

  // Curry already checked values
  const createRecoveryKeyHandler = createRecoveryKey(
    uid,
    sessionToken,
    unwrapBKey,
    emailForAuth,
    authPW
  );
  const updateRecoveryHintHandler = updateRecoveryHint(sessionToken);

  return (
    <InlineRecoveryKeySetup
      {...{
        createRecoveryKeyHandler,
        updateRecoveryHintHandler,
        currentStep,
        email,
        formattedRecoveryKey,
        navigateForward,
      }}
    />
  );
};

export default InlineRecoveryKeySetupContainer;
