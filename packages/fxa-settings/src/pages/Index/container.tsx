/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as Sentry from '@sentry/browser';

import React, { useCallback, useEffect, useState } from 'react';
import { RouteComponentProps, useLocation } from '@reach/router';
import { isEmail } from 'class-validator';

import { isEmailMask } from 'fxa-shared/email/helpers';

import firefox from '../../lib/channels/firefox';
import { AuthUiError, AuthUiErrors } from '../../lib/auth-errors/auth-errors';
import { currentAccount, lastStoredAccount } from '../../lib/cache';
import { checkEmailDomain } from '../../lib/email-domain-validator';
import { getLocalizedErrorMessage } from '../../lib/error-utils';
import GleanMetrics from '../../lib/glean';
import { useValidatedQueryParams } from '../../lib/hooks/useValidate';
import { ModelValidationErrors } from '../../lib/model-data';
import { AuthError } from '../../lib/oauth';

import { useAuthClient, useFtlMsgResolver } from '../../models';
import { isOAuthWebIntegration } from '../../models/integrations/oauth-web-integration';
import { isUnsupportedContext } from '../../models/integrations/utils';
import { IndexQueryParams } from '../../models/pages/index';

import Index from '.';
import { getLocalizedEmailValidationErrorMessage } from './errorMessageMapper';
import { IndexContainerProps, LocationState } from './interfaces';
import { useNavigateWithQuery } from '../../lib/hooks/useNavigateWithQuery';
import { hardNavigate } from 'fxa-react/lib/utils';
import LoadingSpinner from 'fxa-react/components/LoadingSpinner';

const IndexContainer = ({
  integration,
  serviceName,
  flowQueryParams,
}: IndexContainerProps & RouteComponentProps) => {
  const authClient = useAuthClient();
  const ftlMsgResolver = useFtlMsgResolver();
  const navigateWithQuery = useNavigateWithQuery();
  const location = useLocation() as ReturnType<typeof useLocation> & {
    state?: LocationState;
  };

  const [errorBannerMessage, setErrorBannerMessage] = useState('');
  const [successBannerMessage, setSuccessBannerMessage] = useState('');
  const [tooltipErrorMessage, setTooltipErrorMessage] = useState('');
  const [hasFailedAutoEmailProcessing, setHasFailedAutoEmailProcessing] =
    useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const { queryParamModel, validationError } = useValidatedQueryParams(
    IndexQueryParams,
    // There is some concern that RPs or sub plat might not be validating emails
    // before sending them to us. Rather than fail hard here, let's monitor the
    // situation. Users should still be able to correct a bad email via the UI.
    false
  );

  const clearEmailParams = () => {
    // Clean up the URL to avoid repeat validation, since we already know this param is invalid
    const url = new URL(window.location.href);
    url.searchParams.delete('email');
    url.searchParams.delete('login_hint');
    window.history.replaceState({}, '', url.toString());
  };

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

      clearEmailParams();
    }
  }, [validationError]);

  const { prefillEmail, deleteAccountSuccess, hasBounced } =
    location.state || {};

  const handleSuccessNavigation = useCallback(
    (
      exists: boolean,
      hasLinkedAccount: boolean,
      hasPassword: boolean,
      email: string
    ) => {
      if (exists) {
        const signinRoute = isOAuthWebIntegration(integration)
          ? '/oauth/signin'
          : '/signin';
        navigateWithQuery(signinRoute, {
          state: {
            email,
            hasLinkedAccount,
            hasPassword,
          },
        });
      } else {
        const signupRoute = isOAuthWebIntegration(integration)
          ? '/oauth/signup'
          : '/signup';
        navigateWithQuery(signupRoute, {
          state: {
            email,
            emailStatusChecked: true,
          },
        });
      }
    },
    [integration, navigateWithQuery]
  );

  const handleEmailSubmissionError = useCallback(
    (email: string, error: AuthUiError) => {
      const localizedError = getLocalizedEmailValidationErrorMessage(
        error as AuthError,
        ftlMsgResolver,
        email
      );
      switch (error.errno) {
        case AuthUiErrors.MX_LOOKUP_WARNING.errno:
        case AuthUiErrors.EMAIL_REQUIRED.errno:
        case AuthUiErrors.EMAIL_MASK_NEW_ACCOUNT.errno:
        case AuthUiErrors.DIFFERENT_EMAIL_REQUIRED_FIREFOX_DOMAIN.errno:
        case AuthUiErrors.INVALID_EMAIL_DOMAIN.errno:
          setTooltipErrorMessage(localizedError);
          break;
        default:
          setErrorBannerMessage(localizedError);
      }
    },
    [ftlMsgResolver]
  );

  const processEmailSubmission = useCallback(
    async (email: string, isManualSubmission = true) => {
      let accountExists;
      try {
        if (!isEmail(email)) {
          throw AuthUiErrors.EMAIL_REQUIRED;
        }

        const { exists, hasLinkedAccount, hasPassword } =
          await authClient.accountStatusByEmail(email, {
            thirdPartyAuthStatus: true,
          });

        accountExists = exists;

        if (!exists) {
          if (isEmailMask(email)) {
            throw AuthUiErrors.EMAIL_MASK_NEW_ACCOUNT;
            // "@firefox" or "@firefox.com" email addresses are not valid
            // at this time, therefore block the attempt.
            // the added 'i' disallows uppercase letters
          } else if (new RegExp('@firefox(\\.com)?$', 'i').test(email)) {
            throw AuthUiErrors.DIFFERENT_EMAIL_REQUIRED_FIREFOX_DOMAIN;
          }
          // DNS lookup for MX record
          await checkEmailDomain(email);
        }

        if (integration.isSync() || integration.isDesktopRelay()) {
          const { ok } = await firefox.fxaCanLinkAccount({ email });
          if (!ok) {
            throw AuthUiErrors.USER_CANCELED_LOGIN;
          }
        }

        isManualSubmission &&
          GleanMetrics.emailFirst.submitSuccess({
            event: { reason: accountExists ? 'login' : 'registration' },
          });

        handleSuccessNavigation(exists, hasLinkedAccount, hasPassword, email);
      } catch (error) {
        if (isManualSubmission && isEmail(email)) {
          GleanMetrics.emailFirst.submitFail({
            event: { reason: accountExists ? 'login' : 'registration' },
          });
        }
        // if email verification fails, clear from params to avoid re-use
        if (!isManualSubmission) {
          clearEmailParams();
          setHasFailedAutoEmailProcessing(true);
        }
        handleEmailSubmissionError(email, error);
      }
    },
    [
      authClient,
      handleEmailSubmissionError,
      handleSuccessNavigation,
      integration,
    ]
  );

  const suggestedEmail =
    queryParamModel.email ||
    queryParamModel.loginHint ||
    currentAccount()?.email ||
    lastStoredAccount()?.email;

  // If we just came from another Mozilla accounts page with a prefill email in location state,
  // ignore suggested email. Prefill email is used for clicks on "Use different account" or "Change email".
  const shouldTrySuggestedEmail = suggestedEmail && !prefillEmail;

  useEffect(() => {
    if (isUnsupportedContext(integration.data.context)) {
      hardNavigate('/update_firefox', {}, true);
    } else if (shouldTrySuggestedEmail && !hasFailedAutoEmailProcessing) {
      processEmailSubmission(suggestedEmail, false);
    } else {
      setIsLoading(false);
    }
  }, [
    ftlMsgResolver,
    hasFailedAutoEmailProcessing,
    processEmailSubmission,
    suggestedEmail,
    shouldTrySuggestedEmail,
    integration.data.context,
    integration
  ]);

  useEffect(() => {
    if (prefillEmail && hasBounced) {
      setTooltipErrorMessage(
        getLocalizedErrorMessage(
          ftlMsgResolver,
          AuthUiErrors.SIGNUP_EMAIL_BOUNCE
        )
      );
    }
  }, [ftlMsgResolver, hasBounced, prefillEmail]);

  useEffect(() => {
    if (deleteAccountSuccess) {
      setSuccessBannerMessage(
        ftlMsgResolver.getMsg(
          'index-account-delete-success',
          'Account deleted successfully'
        )
      );
    }
  }, [ftlMsgResolver, deleteAccountSuccess]);

  const initialPrefill = prefillEmail || suggestedEmail;
  const deeplink = queryParamModel.deeplink;

  return isLoading ? (
    <LoadingSpinner fullScreen />
  ) : (
    <Index
      {...{
        integration,
        serviceName,
        processEmailSubmission,
        setErrorBannerMessage,
        setSuccessBannerMessage,
        setTooltipErrorMessage,
        errorBannerMessage,
        successBannerMessage,
        tooltipErrorMessage,
        deeplink,
        flowQueryParams,
      }}
      prefillEmail={initialPrefill}
    />
  );
};

export default IndexContainer;
