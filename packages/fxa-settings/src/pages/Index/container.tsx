/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { RouteComponentProps, useLocation } from '@reach/router';
import { useNavigateWithQuery as useNavigate } from '../../lib/hooks/useNavigateWithQuery';
import Index from '.';
import { IndexContainerProps, LocationState } from './interfaces';
import { useCallback } from 'react';
import { useAuthClient } from '../../models';
import firefox from '../../lib/channels/firefox';
import { AuthUiErrors } from '../../lib/auth-errors/auth-errors';
import { getHandledError } from '../../lib/error-utils';
import { currentAccount } from '../../lib/cache';
import { useValidatedQueryParams } from '../../lib/hooks/useValidate';
import { IndexQueryParams } from '../../models/pages/index';

export const IndexContainer = ({
  integration,
  serviceName,
}: IndexContainerProps & RouteComponentProps) => {
  // TODO, check BB route definition. If using fx_desktop_v1 etc., navigate to update_firefox
  // maybe similarly @ express level? (why are we doing that, there's not sensitive data)
  // TODO, more strict validation for bad oauth params
  const authClient = useAuthClient();
  const navigate = useNavigate();
  const location = useLocation() as ReturnType<typeof useLocation> & {
    state?: LocationState;
  };
  const { queryParamModel, validationError } =
    useValidatedQueryParams(IndexQueryParams);

  const { prefillEmail, deleteAccountSuccess, hasBounced } =
    location.state || {};

  const isWebChannelIntegration =
    integration.isSync() || integration.isDesktopRelay();

  const signUpOrSignInHandler = useCallback(
    async (email: string) => {
      try {
        const { exists, hasLinkedAccount, hasPassword } =
          await authClient.accountStatusByEmail(email, {
            thirdPartyAuthStatus: true,
          });
        if (!exists) {
          navigate('/signup', {
            state: {
              email,
              emailStatusChecked: true,
            },
          });
          return { error: null };
        } else {
          if (isWebChannelIntegration) {
            const { ok } = await firefox.fxaCanLinkAccount({ email });
            if (!ok) {
              const error = {
                // TODO FXA-9757, these should never be undefined
                errno: AuthUiErrors.USER_CANCELED_LOGIN.errno!,
                message: AuthUiErrors.USER_CANCELED_LOGIN.message!,
              };
              return { error };
            }
          }

          navigate('/signin', {
            state: {
              email,
              hasLinkedAccount,
              hasPassword,
            },
          });
        }
        return { error: null };
      } catch (error) {
        return getHandledError(error);
      }
    },
    [authClient, navigate, isWebChannelIntegration]
  );

  if (validationError) {
    // do somethin
  }

  // Query param should take precedence
  const email = queryParamModel.email || currentAccount()?.email;
  if (email && !prefillEmail) {
    navigate('/signin', {
      state: {
        email,
      },
    });
  }

  return (
    <Index
      {...{
        integration,
        serviceName,
        signUpOrSignInHandler,
        prefillEmail,
        deleteAccountSuccess,
        hasBounced,
      }}
    />
  );
};
