/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { useCallback } from 'react';
import { useNavigate } from 'react-router';
import { hardNavigate } from 'fxa-react/lib/utils';
import SetPassword from '.';
import { FinishAccountSetupLinkDamaged } from '../../../components/LinkDamaged';
import { useValidatedQueryParams } from '../../../lib/hooks';
import { FinishAccountSetupQueryParams } from '../../../models/pages/post-verify';
import { useAuthClient } from '../../../models';
import { storeAccountData } from '../../../lib/storage-utils';
import { AuthUiErrors } from '../../../lib/auth-errors/auth-errors';
import { getHandledError } from '../../../lib/error-utils';
import GleanMetrics from '../../../lib/glean';
import {
  CreatePasswordHandler,
  PostVerifySetPasswordIntegration,
} from './interfaces';

/**
 * Entry point for the `subscriptionAccountFinishSetup` email link. The account
 * already exists without a password, so the JWT from the link, not a session,
 * authorizes the password.
 */
const FinishAccountSetupContainer = ({
  integration,
}: {
  integration: PostVerifySetPasswordIntegration;
}) => {
  const authClient = useAuthClient();
  const navigate = useNavigate();
  const { queryParamModel, validationError } = useValidatedQueryParams(
    FinishAccountSetupQueryParams
  );
  const { token, email, productName } = queryParamModel;

  const createPasswordHandler: CreatePasswordHandler = useCallback(
    async (newPassword: string) => {
      try {
        const { uid, sessionToken, verified } = await authClient.finishSetup(
          token,
          { original: email },
          newPassword
        );

        storeAccountData({
          uid,
          sessionToken,
          email,
          verified,
          sessionVerified: verified,
          hasPassword: true,
        });

        GleanMetrics.postVerifySetPassword.success({
          event: { reason: 'subscription' },
        });

        // The email link carries no return URL, so there is nothing
        // flow-specific to go back to.
        hardNavigate('https://mozilla.org', { email });
        return { error: null };
      } catch (err) {
        const { error } = getHandledError(err);
        // A spent or malformed token leaves nothing to do on this page, so
        // send the user to sign-in instead of a banner with no way forward.
        // Replace the entry so Back does not return to the spent link.
        if (error.errno === AuthUiErrors.INVALID_TOKEN.errno) {
          GleanMetrics.postVerifySetPassword.submitFrontendError({
            event: { reason: 'subscription' },
          });
          navigate('/', { replace: true });
          return { error: null };
        }
        return { error };
      }
    },
    [authClient, email, navigate, token]
  );

  if (validationError) {
    return <FinishAccountSetupLinkDamaged />;
  }

  return (
    <SetPassword
      {...{ email, productName, integration, createPasswordHandler }}
      passwordCreationReason="subscription"
    />
  );
};

export default FinishAccountSetupContainer;
