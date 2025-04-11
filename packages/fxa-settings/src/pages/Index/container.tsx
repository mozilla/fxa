/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { RouteComponentProps, useLocation, useNavigate } from '@reach/router';
import * as Sentry from '@sentry/browser';
import Index from '.';
import { IndexContainerProps, LocationState } from './interfaces';
import { useCallback, useEffect, useState } from 'react';
import { useAuthClient, useFtlMsgResolver } from '../../models';
import firefox from '../../lib/channels/firefox';
import { AuthUiErrors } from '../../lib/auth-errors/auth-errors';
import { AuthError } from '../../lib/oauth';
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
import { ModelValidationErrors } from '../../lib/model-data';
import { getLocalizedEmailValidationErrorMessage } from './errorMessageMapper';
import {
  getHandledError,
  getLocalizedErrorMessage,
} from '../../lib/error-utils';

export const IndexContainer = ({
  integration,
  serviceName,
}: IndexContainerProps & RouteComponentProps) => {
  const authClient = useAuthClient();
  const ftlMsgResolver = useFtlMsgResolver();
  const navigate = useNavigate();
  const location = useLocation() as ReturnType<typeof useLocation> & {
    state?: LocationState;
  };
  const { queryParamModel, validationError } = useValidatedQueryParams(
    IndexQueryParams,
    // There is some concern that RPs or sub plat might not be validating emails
    // before sending them to us. Rather than fail hard here, let's monitor the
    // situation. Users should still be able to correct a bad email via the UI.
    false
  );

  useEffect(() => {
    // Since it's debatable as to whether or not we want to let potentially bogus
    // email / loginHints through... For now, let's log it so we can keep tabs on
    // the potential impact.
    if (validationError instanceof ModelValidationErrors) {
      console.warn(validationError);
      Sentry.captureException(validationError, {
        tags: {
          source: 'IndexContainer',
          condition: validationError.condition,
        },
      });

      // Clean up the URL to avoid repeat validation, since we already know this param is invalid
      const url = new URL(window.location.href);
      url.searchParams.delete('email');
      window.history.replaceState({}, '', url.toString());
    }
  }, [validationError]);

  const { prefillEmail, deleteAccountSuccess, hasBounced } =
    location.state || {};

  const [initialErrorBannerMessage, setInitialErrorBannerMessage] =
    useState('');
  const [initialTooltipErrorMessage, setInitialTooltipErrorMessage] =
    useState('');

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
            error: AuthUiErrors.EMAIL_REQUIRED as AuthError,
          };
        }
        const { exists, hasLinkedAccount, hasPassword } =
          await authClient.accountStatusByEmail(email, {
            thirdPartyAuthStatus: true,
          });

        if (!exists) {
          if (isEmailMask(email)) {
            return {
              error: AuthUiErrors.EMAIL_MASK_NEW_ACCOUNT as AuthError,
            };
            // "@firefox" or "@firefox.com" email addresses are not valid
            // at this time, therefore block the attempt.
            // the added 'i' disallows uppercase letters
          } else if (new RegExp('@firefox(\\.com)?$', 'i').test(email)) {
            return {
              error:
                AuthUiErrors.DIFFERENT_EMAIL_REQUIRED_FIREFOX_DOMAIN as AuthError,
            };
          }
          // DNS lookup for MX record
          await checkEmailDomain(email);
        }

        if (integration.isSync() || integration.isDesktopRelay()) {
          const { ok } = await firefox.fxaCanLinkAccount({ email });
          if (!ok) {
            return {
              error: AuthUiErrors.USER_CANCELED_LOGIN as AuthError,
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
    [authClient, handleSuccess, integration]
  );

  // If there is a suggested email, try to direct to either signin or signup
  // If no account exists for the suggested email, the same email validation steps
  // will be run as if the email was submitted manually.
  // RP-provided 'email' query param should take precedence, followed by 'login_hint'
  // then previous accounts.
  const suggestedEmail =
    queryParamModel.email ||
    queryParamModel.loginHint ||
    currentAccount()?.email ||
    lastStoredAccount()?.email;

  // If we just came from another Mozilla accounts page with a prefill email in location state,
  // ignore suggested email (they are probably stale)
  const useEmailSuggestion = suggestedEmail && !prefillEmail;

  useEffect(() => {
    if (!useEmailSuggestion) {
      return;
    }

    (async () => {
      const { error } = await signUpOrSignInHandler(suggestedEmail, false);
      if (error) {
        const localizedError = getLocalizedEmailValidationErrorMessage(
          error,
          ftlMsgResolver,
          suggestedEmail
        );
        switch (error.errno) {
          case AuthUiErrors.MX_LOOKUP_WARNING.errno:
          case AuthUiErrors.EMAIL_REQUIRED.errno:
          case AuthUiErrors.EMAIL_MASK_NEW_ACCOUNT.errno:
          case AuthUiErrors.DIFFERENT_EMAIL_REQUIRED_FIREFOX_DOMAIN.errno:
          case AuthUiErrors.INVALID_EMAIL_DOMAIN.errno:
            setInitialTooltipErrorMessage(localizedError);
            break;
          default:
            setInitialErrorBannerMessage(localizedError);
        }
      }
    })();
  }, [
    ftlMsgResolver,
    useEmailSuggestion,
    signUpOrSignInHandler,
    suggestedEmail,
  ]);

  if (isUnsupportedContext(integration.data.context)) {
    hardNavigate('/update_firefox', {}, true);
    return <LoadingSpinner fullScreen />;
  }

  if (useEmailSuggestion && !initialTooltipErrorMessage) {
    return <LoadingSpinner fullScreen />;
  }

  if (prefillEmail && hasBounced) {
    setInitialTooltipErrorMessage(
      getLocalizedErrorMessage(ftlMsgResolver, AuthUiErrors.SIGNUP_EMAIL_BOUNCE)
    );
  }

  return (
    <Index
      {...{
        integration,
        serviceName,
        signUpOrSignInHandler,
        deleteAccountSuccess,
        initialErrorBannerMessage,
        initialTooltipErrorMessage,
      }}
      prefillEmail={prefillEmail || suggestedEmail}
    />
  );
};
