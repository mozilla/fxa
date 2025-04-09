/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { RouteComponentProps, useLocation, useNavigate } from '@reach/router';
import Index from '.';
import { IndexContainerProps, LocationState } from './interfaces';
import { useCallback, useEffect } from 'react';
import { useAuthClient } from '../../models';
import firefox from '../../lib/channels/firefox';
import { AuthUiError, AuthUiErrors } from '../../lib/auth-errors/auth-errors';
import { getHandledError } from '../../lib/error-utils';
import { currentAccount, lastStoredAccount } from '../../lib/cache';
import { useValidatedQueryParams } from '../../lib/hooks/useValidate';
import { IndexQueryParams } from '../../models/pages/index';
import { isUnsupportedContext } from '../../models/integrations/utils';
import { hardNavigate } from 'fxa-react/lib/utils';
import LoadingSpinner from 'fxa-react/components/LoadingSpinner';
import { checkEmailDomain } from '../../lib/email-domain-validator';
import { isEmailMask, isEmailValid } from 'fxa-shared/email/helpers';
import { isOAuthWebIntegration } from '../../models/integrations/oauth-web-integration';
import GleanMetrics from '../../lib/glean';

// TODO: remove this function, it's only here to make TS happy until
// we work on FXA-9757. errnos are always defined
function getErrorWithDefinedErrNo(error: AuthUiError) {
  return {
    ...error,
    errno: error.errno!,
  };
}

export const IndexContainer = ({
  integration,
  serviceName,
}: IndexContainerProps & RouteComponentProps) => {
  // TODO, more strict validation for bad oauth params, FXA-11297
  const authClient = useAuthClient();
  const navigate = useNavigate();
  const location = useLocation() as ReturnType<typeof useLocation> & {
    state?: LocationState;
  };
  const { queryParamModel } = useValidatedQueryParams(IndexQueryParams, true);

  const { prefillEmail, deleteAccountSuccess, hasBounced } =
    location.state || {};

  const isWebChannelIntegration =
    integration.isSync() || integration.isDesktopRelay();

  // 'email' query param should take precedence, followed by 'login_hint'
  const suggestedEmail =
    queryParamModel.email ||
    queryParamModel.loginHint ||
    currentAccount()?.email ||
    lastStoredAccount()?.email;

  const hasEmailSuggestion = suggestedEmail && !prefillEmail;

  const handleSuccess = useCallback(
    (
      exists: boolean,
      hasLinkedAccount: boolean,
      hasPassword: boolean,
      email: string,
      isSubmit: boolean
    ) => {
      const url = new URL(window.location.href);
      const params = new URLSearchParams(location.search);
      // Remove the 'email' query parameter to avoid it taking precedence,
      // which would prevent users from signing up with a different email.
      // This deletion applies to both signup and signin routes and is a legacy
      // workaround from the Backbone-to-React transition (see FXA-10567).
      // Consider using useNavigateWithQuery once the issue is resolved.
      params.delete('email');
      url.search = params.toString();
      if (exists) {
        isSubmit &&
          GleanMetrics.emailFirst.submitSuccess({ event: { reason: 'login' } });
        const signinRoute = isOAuthWebIntegration(integration)
          ? '/oauth/signin'
          : '/signin';
        url.pathname = signinRoute;
        navigate(url.toString(), {
          state: {
            email,
            hasLinkedAccount,
            hasPassword,
          },
        });
      } else {
        isSubmit &&
          GleanMetrics.emailFirst.submitSuccess({
            event: { reason: 'registration' },
          });
        const signupRoute = isOAuthWebIntegration(integration)
          ? '/oauth/signup'
          : '/signup';
        url.pathname = signupRoute;
        navigate(url.toString(), {
          state: {
            email,
            emailStatusChecked: true,
          },
        });
      }
    },
    [integration, location.search, navigate]
  );

  const signUpOrSignInHandler = useCallback(
    async (email: string, isSubmit = true) => {
      try {
        if (!isEmailValid(email)) {
          return {
            error: getErrorWithDefinedErrNo(AuthUiErrors.EMAIL_REQUIRED),
          };
        }
        const { exists, hasLinkedAccount, hasPassword } =
          await authClient.accountStatusByEmail(email, {
            thirdPartyAuthStatus: true,
          });

        if (!exists) {
          if (isEmailMask(email)) {
            return {
              error: getErrorWithDefinedErrNo(
                AuthUiErrors.EMAIL_MASK_NEW_ACCOUNT
              ),
            };
            // "@firefox" or "@firefox.com" email addresses are not valid
            // at this time, therefore block the attempt.
            // the added 'i' disallows uppercase letters
          } else if (new RegExp('@firefox(\\.com)?$', 'i').test(email)) {
            return {
              error: getErrorWithDefinedErrNo(
                AuthUiErrors.DIFFERENT_EMAIL_REQUIRED_FIREFOX_DOMAIN
              ),
            };
          }
          // DNS lookup for MX record
          await checkEmailDomain(email);
        }

        if (isWebChannelIntegration) {
          const { ok } = await firefox.fxaCanLinkAccount({ email });
          if (!ok) {
            return {
              error: getErrorWithDefinedErrNo(AuthUiErrors.USER_CANCELED_LOGIN),
            };
          }
        }

        handleSuccess(exists, hasLinkedAccount, hasPassword, email, isSubmit);
        return { error: null };
      } catch (error) {
        GleanMetrics.emailFirst.submitFail();
        return getHandledError(error);
      }
    },
    [authClient, handleSuccess, isWebChannelIntegration]
  );

  useEffect(() => {
    if (!hasEmailSuggestion) {
      return;
    }

    signUpOrSignInHandler(suggestedEmail, false);
  }, [hasEmailSuggestion, signUpOrSignInHandler, suggestedEmail]);

  if (isUnsupportedContext(integration.data.context)) {
    hardNavigate('/update_firefox', {}, true);
    return <LoadingSpinner fullScreen />;
  }

  if (hasEmailSuggestion) {
    return <LoadingSpinner fullScreen />;
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
