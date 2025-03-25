/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { RouteComponentProps, useLocation, useNavigate } from '@reach/router';
import { useNavigateWithQuery } from '../../lib/hooks/useNavigateWithQuery';
import Index from '.';
import { IndexContainerProps, LocationState } from './interfaces';
import { useCallback, useEffect } from 'react';
import { useAuthClient } from '../../models';
import firefox from '../../lib/channels/firefox';
import { AuthUiError, AuthUiErrors } from '../../lib/auth-errors/auth-errors';
import { getHandledError } from '../../lib/error-utils';
import { currentAccount } from '../../lib/cache';
import { useValidatedQueryParams } from '../../lib/hooks/useValidate';
import { IndexQueryParams } from '../../models/pages/index';
import { isUnsupportedContext } from '../../models/integrations/utils';
import { hardNavigate } from 'fxa-react/lib/utils';
import LoadingSpinner from 'fxa-react/components/LoadingSpinner';
import { checkEmailDomain } from '../../lib/email-domain-validator';
import { isEmailMask, isEmailValid } from 'fxa-shared/email/helpers';

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
  // We want to fail hard / fast on the index page (ie email first). If query params don't pass validation here,
  // there's no point in continuing further in this flow. This error will be handled
  // by the app error boundary.
  const { queryParamModel } = useValidatedQueryParams(IndexQueryParams, true);

  // TODO, more strict validation for bad oauth params, FXA-11297
  const authClient = useAuthClient();
  const navigate = useNavigate();
  const navigateWithQuery = useNavigateWithQuery();
  const location = useLocation() as ReturnType<typeof useLocation> & {
    state?: LocationState;
  };

  const { prefillEmail, deleteAccountSuccess, hasBounced } =
    location.state || {};

  const isWebChannelIntegration =
    integration.isSync() || integration.isDesktopRelay();

  // 'email' query param followed by 'login_hint' should take precedence
  const email =
    queryParamModel.email ||
    integration.data.loginHint ||
    currentAccount()?.email;
  const shouldRedirectToSignin = email && !prefillEmail;

  useEffect(() => {
    if (shouldRedirectToSignin) {
      const route = location.pathname.startsWith('/oauth')
        ? '/oauth/signin?email=' + email
        : '/signin?email=' + email;
      navigateWithQuery(route, {
        state: {
          // TBD: Maybe this should only pass this as a query param, since we are
          //      validating and /signin pages are seen as entry points?
          email,
        },
      });
    }
  });

  const signUpOrSignInHandler = useCallback(
    async (email: string) => {
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

        const params = new URLSearchParams(location.search);
        // We delete 'email' if it is present because otherwise, that param will take
        // precedence and the user will be unable to create an account with a different
        // email. Remove for signin as well as it is unnecessary. This is a byproduct
        // of backwards compatibility between Backbone and React since we pass this
        // param from content-server, TODO: FXA-10567
        // We can also use useNavigateWithQuery after addressing the above.
        params.delete('email');
        const hasParams = params.size > 0;
        if (!exists) {
          navigate(`/signup${hasParams ? `?${params.toString()}` : ''}`, {
            state: {
              email,
              emailStatusChecked: true,
            },
          });
        } else {
          navigate(`/signin${hasParams ? `?${params.toString()}` : ''}`, {
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
    [authClient, navigate, isWebChannelIntegration, location.search]
  );

  if (isUnsupportedContext(integration.data.context)) {
    hardNavigate('/update_firefox', {}, true);
    return <LoadingSpinner fullScreen />;
  }

  if (shouldRedirectToSignin) {
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
