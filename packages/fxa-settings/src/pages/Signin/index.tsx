/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Link, RouteComponentProps, useLocation } from '@reach/router';
import { useNavigateWithQuery } from '../../lib/hooks/useNavigateWithQuery';
import classNames from 'classnames';
import LoadingSpinner from 'fxa-react/components/LoadingSpinner';
import { FtlMsg } from 'fxa-react/lib/utils';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import AppLayout from '../../components/AppLayout';
import CardHeader from '../../components/CardHeader';
import InputPassword from '../../components/InputPassword';
import Avatar from '../../components/Settings/Avatar';
import TermsPrivacyAgreement from '../../components/TermsPrivacyAgreement';
import ThirdPartyAuth from '../../components/ThirdPartyAuth';
import { REACT_ENTRYPOINT } from '../../constants';
import { AuthUiErrors } from '../../lib/auth-errors/auth-errors';
import GleanMetrics from '../../lib/glean';
import { usePageViewEvent } from '../../lib/metrics';
import { StoredAccountData, storeAccountData } from '../../lib/storage-utils';
import {
  useSensitiveDataClient,
  useFtlMsgResolver,
  isWebIntegration,
  isOAuthIntegration,
} from '../../models';
import {
  isClientMonitor,
  isClientPocket,
  isClientRelay,
} from '../../models/integrations/client-matching';
import { SigninFormData, SigninProps } from './interfaces';
import { handleNavigation } from './utils';
import { useWebRedirect } from '../../lib/hooks/useWebRedirect';
import { getLocalizedErrorMessage } from '../../lib/error-utils';
import Banner from '../../components/Banner';
import { SensitiveData } from '../../lib/sensitive-data-client';

export const viewName = 'signin';

/* The avatar size must not increase until the tablet breakpoint due to logging into
 * Pocket with FxA and maybe others later: an Apple-controlled modal displays FxA in a
 * web view and we want the "Sign in" button to be displayed above the fold. See FXA-7425 */
const avatarClassNames = 'mx-auto h-24 w-24 tablet:h-40 tablet:w-40';

const Signin = ({
  integration,
  email,
  sessionToken,
  serviceName,
  hasLinkedAccount,
  beginSigninHandler,
  cachedSigninHandler,
  sendUnblockEmailHandler,
  hasPassword,
  avatarData,
  avatarLoading,
  localizedErrorFromLocationState,
  finishOAuthFlowHandler,
  localizedSuccessBannerHeading,
  localizedSuccessBannerDescription,
}: SigninProps & RouteComponentProps) => {
  usePageViewEvent(viewName, REACT_ENTRYPOINT);
  const location = useLocation();
  const navigateWithQuery = useNavigateWithQuery();
  const ftlMsgResolver = useFtlMsgResolver();
  const webRedirectCheck = useWebRedirect(integration.data.redirectTo);
  const sensitiveDataClient = useSensitiveDataClient();

  const [localizedBannerError, setLocalizedBannerError] = useState(
    localizedErrorFromLocationState || ''
  );
  const [passwordTooltipErrorText, setPasswordTooltipErrorText] =
    useState<string>('');
  const [signinLoading, setSigninLoading] = useState<boolean>(false);
  const [hasEngaged, setHasEngaged] = useState<boolean>(false);

  const isOAuth = isOAuthIntegration(integration);
  const isDesktopRelay = integration.isDesktopRelay();
  const clientId = integration.getClientId();
  const isPocketClient = isOAuth && isClientPocket(clientId);
  const isMonitorClient = isOAuth && isClientMonitor(clientId);
  const isRelayClient = isOAuth && isClientRelay(clientId);
  const hasLinkedAccountAndNoPassword = hasLinkedAccount && !hasPassword;

  // We must use a ref because we may update this value in a callback
  let isPasswordNeededRef = useRef(
    (!sessionToken && hasPassword) ||
      integration.wantsKeys() ||
      (isOAuth && integration.wantsLogin())
  );

  const localizedPasswordFormLabel = ftlMsgResolver.getMsg(
    'signin-password-button-label',
    'Password'
  );
  const localizedValidPasswordError = ftlMsgResolver.getMsg(
    'auth-error-1010',
    'Valid password required'
  );

  const { handleSubmit, register } = useForm<SigninFormData>({
    mode: 'onTouched',
    criteriaMode: 'all',
    defaultValues: {
      email,
      password: '',
    },
  });

  const hideThirdPartyAuth =
    (integration.isSync() || isDesktopRelay) && hasPassword;

  useEffect(() => {
    if (!isPasswordNeededRef.current) {
      GleanMetrics.cachedLogin.view({
        event: { thirdPartyLinks: !hideThirdPartyAuth },
      });
    } else {
      GleanMetrics.login.view({
        event: { thirdPartyLinks: !hideThirdPartyAuth },
      });
    }
  }, [isPasswordNeededRef, hideThirdPartyAuth]);

  const signInWithCachedAccount = useCallback(
    async (sessionToken: hexstring) => {
      setSigninLoading(true);
      GleanMetrics.cachedLogin.submit();

      const { data, error } = await cachedSigninHandler(sessionToken);

      if (data) {
        GleanMetrics.cachedLogin.success();

        const navigationOptions = {
          email,
          signinData: {
            verified: data.verified,
            verificationMethod: data.verificationMethod,
            verificationReason: data.verificationReason,
            uid: data.uid,
            sessionToken,
          },
          integration,
          redirectTo:
            isWebIntegration(integration) && webRedirectCheck?.isValid
              ? integration.data.redirectTo
              : '',
          finishOAuthFlowHandler,
          queryParams: location.search,
        };

        const { error: navError } = await handleNavigation(navigationOptions);
        if (navError) {
          setLocalizedBannerError(
            getLocalizedErrorMessage(ftlMsgResolver, navError)
          );
        }
      }
      if (error) {
        setLocalizedBannerError(
          getLocalizedErrorMessage(ftlMsgResolver, error)
        );
        if (error.errno === AuthUiErrors.SESSION_EXPIRED.errno) {
          isPasswordNeededRef.current = true;
        }
        setSigninLoading(false);
      }
    },
    [
      cachedSigninHandler,
      email,
      ftlMsgResolver,
      setLocalizedBannerError,
      integration,
      finishOAuthFlowHandler,
      location.search,
      webRedirectCheck,
    ]
  );

  const signInWithPassword = useCallback(
    async (password: string) => {
      GleanMetrics.login.submit();

      setSigninLoading(true);
      const { data, error } = await beginSigninHandler(email, password);

      if (data) {
        GleanMetrics.login.success();

        const accountData: StoredAccountData = {
          email,
          uid: data.signIn.uid,
          lastLogin: Date.now(),
          sessionToken: data.signIn.sessionToken,
          verified: data.signIn.verified,
          metricsEnabled: data.signIn.metricsEnabled,
        };

        storeAccountData(accountData);

        const navigationOptions = {
          email,
          signinData: data.signIn,
          unwrapBKey: data.unwrapBKey,
          verified: data.signIn.verified,
          integration,
          finishOAuthFlowHandler,
          redirectTo:
            isWebIntegration(integration) && webRedirectCheck?.isValid
              ? integration.data.redirectTo
              : '',
          queryParams: location.search,
          showInlineRecoveryKeySetup: data.showInlineRecoveryKeySetup,
          handleFxaLogin: true,
          handleFxaOAuthLogin: true,
        };

        const { error: navError } = await handleNavigation(navigationOptions);
        if (navError) {
          setLocalizedBannerError(
            getLocalizedErrorMessage(ftlMsgResolver, navError)
          );
        }
      }
      if (error) {
        GleanMetrics.login.error({ event: { reason: error.message } });
        const { errno } = error;

        if (
          errno === AuthUiErrors.PASSWORD_REQUIRED.errno ||
          errno === AuthUiErrors.INCORRECT_PASSWORD.errno
        ) {
          setLocalizedBannerError('');
          setPasswordTooltipErrorText(
            getLocalizedErrorMessage(ftlMsgResolver, error)
          );
        } else {
          switch (errno) {
            case AuthUiErrors.THROTTLED.errno:
            case AuthUiErrors.REQUEST_BLOCKED.errno:
              const { localizedErrorMessage } =
                await sendUnblockEmailHandler(email);
              if (localizedErrorMessage) {
                // Sending the unblock email could itself be rate limited.
                // If it is, the error should be displayed on this screen
                // and the user shouldn't even have the chance to continue.
                setLocalizedBannerError(localizedErrorMessage);
                setSigninLoading(false);
                break;
              }

              // Store password to be used in another component
              sensitiveDataClient.setDataType(SensitiveData.Key.Password, {
                plainTextPassword: password,
              });
              // navigate only if sending the unblock code email is successful
              navigateWithQuery('/signin_unblock', {
                state: {
                  email,
                  // TODO: in FXA-9177, remove hasLinkedAccount and hasPassword from state
                  // will be stored in Apollo cache at the container level
                  hasPassword,
                  hasLinkedAccount,
                },
              });
              break;
            case AuthUiErrors.EMAIL_HARD_BOUNCE.errno:
            case AuthUiErrors.EMAIL_SENT_COMPLAINT.errno:
              navigateWithQuery('/signin_bounced');
              break;
            default:
              setLocalizedBannerError(
                getLocalizedErrorMessage(ftlMsgResolver, error)
              );
              setSigninLoading(false);
              break;
          }
        }
      }
    },
    [
      beginSigninHandler,
      email,
      ftlMsgResolver,
      hasLinkedAccount,
      hasPassword,
      navigateWithQuery,
      sendUnblockEmailHandler,
      setLocalizedBannerError,
      finishOAuthFlowHandler,
      integration,
      location.search,
      webRedirectCheck,
      sensitiveDataClient,
    ]
  );

  const onSubmit = useCallback(
    async ({ password }: { password: string }) => {
      if (isPasswordNeededRef.current && password === '') {
        setPasswordTooltipErrorText(localizedValidPasswordError);
        return;
      }

      !isPasswordNeededRef.current && sessionToken
        ? signInWithCachedAccount(sessionToken)
        : signInWithPassword(password);
    },
    [
      signInWithCachedAccount,
      signInWithPassword,
      isPasswordNeededRef,
      localizedValidPasswordError,
      sessionToken,
    ]
  );

  return (
    <AppLayout>
      {(localizedSuccessBannerHeading || localizedSuccessBannerDescription) && (
        <Banner
          type="success"
          content={{
            localizedHeading: localizedSuccessBannerHeading || '',
            localizedDescription: localizedSuccessBannerDescription || '',
          }}
        />
      )}
      {isPasswordNeededRef.current ? (
        <CardHeader
          headingText="Enter your password"
          headingAndSubheadingFtlId="signin-password-needed-header-2"
        />
      ) : (
        <CardHeader
          headingText="Sign in"
          headingTextFtlId="signin-header"
          subheadingWithDefaultServiceFtlId="signin-subheader-without-logo-default"
          subheadingWithCustomServiceFtlId="signin-subheader-without-logo-with-servicename"
          subheadingWithLogoFtlId="signin-subheader-with-logo"
          {...{ clientId, serviceName }}
        />
      )}
      {localizedBannerError && (
        <Banner
          type="error"
          content={{ localizedHeading: localizedBannerError }}
        />
      )}
      <div className="mt-9">
        {sessionToken && avatarData?.account?.avatar ? (
          <Avatar
            className={avatarClassNames}
            avatar={avatarData.account.avatar}
          />
        ) : avatarLoading ? (
          <div
            className={classNames(
              avatarClassNames,
              'flex justify-center items-center'
            )}
          >
            <LoadingSpinner />
          </div>
        ) : (
          // There was an error, so just show default avatar
          <Avatar className={avatarClassNames} />
        )}
        <div className="my-5 text-base break-all text-center">{email}</div>

        {isDesktopRelay && (
          <FtlMsg id="signin-desktop-relay">
            <p className="mt-2 mb-4 text-sm">
              Firefox will try sending you back to use an email mask after you
              sign in.
            </p>
          </FtlMsg>
        )}
      </div>
      {!hasLinkedAccountAndNoPassword && (
        <form onSubmit={handleSubmit(onSubmit)}>
          <input type="email" className="hidden" value={email} disabled />

          {isPasswordNeededRef.current && (
            <InputPassword
              name="password"
              anchorPosition="start"
              className="mb-5"
              label={localizedPasswordFormLabel}
              errorText={passwordTooltipErrorText}
              tooltipPosition="bottom"
              required
              autoFocus
              onChange={() => {
                // Only log the engage event once. Note that this text box is autofocused, so
                // using autofocus wouldn't be a good way to do this.
                if (hasEngaged === false) {
                  setHasEngaged(true);
                  GleanMetrics.login.engage();
                }

                // clear error tooltip if user types in the field
                if (passwordTooltipErrorText) {
                  setPasswordTooltipErrorText('');
                }
                // if the request errored, loading state must be marked as false to reenable submission on input type
                setSigninLoading(false);
              }}
              inputRef={register()}
            />
          )}
          {/* This non-fulfilled input tricks the browser, when trying to
              sign in with the wrong password, into not showing the doorhanger.
              TODO: this causes problems with react-hook-form, do we even need it?
           */}
          {/* <input className="hidden" required /> */}

          <div className="flex">
            <FtlMsg id="signin-button">
              <button
                className="cta-primary cta-xl"
                type="submit"
                disabled={signinLoading}
              >
                Sign in
              </button>
            </FtlMsg>
          </div>
        </form>
      )}

      {!hideThirdPartyAuth && (
        <ThirdPartyAuth
          showSeparator={!hasLinkedAccountAndNoPassword}
          {...{ viewName }}
        />
      )}

      <TermsPrivacyAgreement
        {...{ isPocketClient, isMonitorClient, isDesktopRelay, isRelayClient }}
      />

      <div className="flex flex-col mt-8 tablet:justify-between tablet:flex-row">
        <FtlMsg id="signin-use-a-different-account-link">
          <a
            href="/"
            className="text-sm link-blue cursor-pointer mb-4 mx-auto tablet:mx-0 tablet:mb-0"
            onClick={(e) => {
              e.preventDefault();
              GleanMetrics.login.diffAccountLinkClick();

              navigateWithQuery('/', {
                state: {
                  prefillEmail: email,
                },
              });
            }}
          >
            Use a different account
          </a>
        </FtlMsg>
        {!hasLinkedAccountAndNoPassword && (
          <FtlMsg id="signin-forgot-password-link">
            <Link
              to={`/reset_password${
                location?.search ? `/${location?.search}` : ''
              }`}
              className="text-sm link-blue mx-auto tablet:mx-0"
              onClick={() =>
                !isPasswordNeededRef.current
                  ? GleanMetrics.cachedLogin.forgotPassword()
                  : GleanMetrics.login.forgotPassword()
              }
            >
              Forgot password?
            </Link>
          </FtlMsg>
        )}
      </div>
    </AppLayout>
  );
};

export default Signin;
