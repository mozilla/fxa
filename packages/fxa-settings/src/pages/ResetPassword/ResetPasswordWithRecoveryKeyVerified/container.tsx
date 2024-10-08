/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { useCallback, useState } from 'react';
import { RouteComponentProps, useLocation } from '@reach/router';
import { ResetPasswordWithRecoveryKeyVerifiedProps } from './interfaces';
import { formatRecoveryKey } from '../../../lib/utilities';
import { useNavigateWithQuery as useNavigate } from '../../../lib/hooks/useNavigateWithQuery';
import { hardNavigate } from 'fxa-react/lib/utils';
import {
  Integration,
  isOAuthIntegration,
  useAccount,
  useAuthClient,
  useSensitiveDataClient,
} from '../../../models';
import {
  FinishOAuthFlowHandlerResult,
  useFinishOAuthFlowHandler,
} from '../../../lib/oauth/hooks';
import ResetPasswordWithRecoveryKeyVerified from './index';
import { SETTINGS_PATH } from '../../../constants';

const ResetPasswordWithRecoveryKeyVerifiedContainer = ({
  integration,
}: ResetPasswordWithRecoveryKeyVerifiedProps & RouteComponentProps) => {
  const [showHint, setShowHint] = useState(false);

  const navigate = useNavigate();
  const sensitiveDataClient = useSensitiveDataClient();

  const location = useLocation();
  const { email } = location.state as Record<string, string>;

  const authClient = useAuthClient();
  const { finishOAuthFlowHandler } = useFinishOAuthFlowHandler(
    authClient,
    integration as Integration
  );
  const [oAuthError, setOAuthError] =
    useState<FinishOAuthFlowHandlerResult['error']>();

  const account = useAccount();
  const accountResetData = sensitiveDataClient.getData('accountResetData');
  const newRecoveryKeyData = sensitiveDataClient.getData('newRecoveryKeyData');
  const newRecoveryKey = formatRecoveryKey(newRecoveryKeyData.buffer);

  const updateRecoveryKeyHint = useCallback(
    async (hint: string) => account.updateRecoveryKeyHint(hint),
    [account]
  );

  const navigateToHint = () => setShowHint(true);
  const navigateNext = async (continueToAccountEvent: () => void) => {
    if (isOAuthIntegration(integration)) {
      const { redirect, error } = await finishOAuthFlowHandler(
        accountResetData.uid,
        accountResetData.sessionToken,
        accountResetData.keyFetchToken,
        accountResetData.unwrapBKey
      );
      if (error) {
        setOAuthError(error);
        return;
      }
      hardNavigate(redirect);
    } else {
      continueToAccountEvent();
      navigate(SETTINGS_PATH, { replace: true });
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
