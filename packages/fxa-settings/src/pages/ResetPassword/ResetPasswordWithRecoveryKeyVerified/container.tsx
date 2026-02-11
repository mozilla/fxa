/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { useCallback, useEffect, useState } from 'react';
import { RouteComponentProps } from '@reach/router';
import { ResetPasswordWithRecoveryKeyVerifiedProps } from './interfaces';
import { formatRecoveryKey } from '../../../lib/utilities';
import { useNavigateWithQuery } from '../../../lib/hooks/useNavigateWithQuery';
import { hardNavigate } from 'fxa-react/lib/utils';
import {
  Integration,
  isOAuthIntegration,
  useAccount,
  useAlertBar,
  useAuthClient,
  useFtlMsgResolver,
  useSensitiveDataClient,
} from '../../../models';
import {
  FinishOAuthFlowHandlerResult,
  useFinishOAuthFlowHandler,
} from '../../../lib/oauth/hooks';
import ResetPasswordWithRecoveryKeyVerified from './index';
import { SETTINGS_PATH } from '../../../constants';
import { SensitiveData } from '../../../lib/sensitive-data-client';
import { currentAccount } from '../../../lib/cache';

const ResetPasswordWithRecoveryKeyVerifiedContainer = ({
  integration,
}: ResetPasswordWithRecoveryKeyVerifiedProps & RouteComponentProps) => {
  const [showHint, setShowHint] = useState(false);

  const alertBar = useAlertBar();
  const ftlMsgResolver = useFtlMsgResolver();
  const navigateWithQuery = useNavigateWithQuery();
  const sensitiveDataClient = useSensitiveDataClient();

  const authClient = useAuthClient();
  const { finishOAuthFlowHandler } = useFinishOAuthFlowHandler(
    authClient,
    integration as Integration
  );
  const [oAuthError, setOAuthError] =
    useState<FinishOAuthFlowHandlerResult['error']>();

  const account = useAccount();
  const { uid, sessionToken, email } = currentAccount() || {};
  const updateRecoveryKeyHint = useCallback(
    async (hint: string) => account.updateRecoveryKeyHint(hint),
    [account]
  );
  const { keyFetchToken, unwrapBKey } =
    sensitiveDataClient.getDataType(SensitiveData.Key.AccountReset) || {};
  const recoveryKey = sensitiveDataClient.getDataType(
    SensitiveData.Key.NewRecoveryKey
  )?.recoveryKey;

  useEffect(() => {
    if (!email) {
      navigateWithQuery('/signin', { replace: true });
    }
    if (!recoveryKey) {
      // If we get here, that means a password reset was completed (with a verified account).
      // Along the way, we have lost a copy of the recovery key in memory if the page was unloaded.
      // This is fine - we navigate to the confirmed or settings page and carry on.
      const navigationPath = integration.isSync()
        ? '/settings'
        : '/reset_password_verified';
      navigateWithQuery(navigationPath, { replace: true });

      // For web integration and sync navigate to settings
      // Sync users will see an account recovery key promotion banner in settings
      // if they don't have one configured
      alertBar.success(
        ftlMsgResolver.getMsg(
          'reset-password-complete-header',
          'Your password has been reset'
        )
      );
    }
  }, [
    recoveryKey,
    email,
    navigateWithQuery,
    integration,
    alertBar,
    ftlMsgResolver,
  ]);

  if (!recoveryKey || !email) {
    return <></>;
  }

  const newRecoveryKey = formatRecoveryKey(recoveryKey.buffer);

  const navigateToHint = () => setShowHint(true);
  const navigateNext = async (continueToAccountEvent: () => void) => {
    // The Sync cases are handled prior to reaching this page (on CompleteResetPassword)
    if (isOAuthIntegration(integration) && !integration.isSync()) {
      // If we have lost the required bits for OAuth handling, we have to start again.
      if (!sessionToken || !uid) {
        navigateWithQuery('/signin', { replace: true });
        return;
      }

      const { redirect, error } = await finishOAuthFlowHandler(
        uid,
        sessionToken,
        keyFetchToken,
        unwrapBKey
      );

      if (error) {
        setOAuthError(error);
        return;
      }

      hardNavigate(redirect);
    } else {
      continueToAccountEvent();
      navigateWithQuery(SETTINGS_PATH, { replace: true });
    }
  };

  return (
    <ResetPasswordWithRecoveryKeyVerified
      {...{
        email,
        newRecoveryKey,
        showHint,
        oAuthError,
        navigateToHint,
        updateRecoveryKeyHint,
        navigateNext,
      }}
    />
  );
};

export default ResetPasswordWithRecoveryKeyVerifiedContainer;
