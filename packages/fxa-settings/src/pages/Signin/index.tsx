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
import {
  useSensitiveDataClient,
  useFtlMsgResolver,
  isWebIntegration,
  isOAuthIntegration,
  isOAuthNativeIntegration,
} from '../../models';
import {
  isClientMonitor,
  isClientRelay,
} from '../../models/integrations/client-matching';
import { SigninFormData, SigninProps } from './interfaces';
import { handleNavigation } from './utils';
import { useWebRedirect } from '../../lib/hooks/useWebRedirect';
import { getLocalizedErrorMessage } from '../../lib/error-utils';
import Banner from '../../components/Banner';
import { SensitiveData } from '../../lib/sensitive-data-client';
import { BannerLinkProps } from '../../components/Banner/interfaces';
import CmsButtonWithFallback from '../../components/CmsButtonWithFallback';

export const viewName = 'signin';

const avatarClassNames = 'h-12 w-12 desktop:h-22 desktop:w-22';

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
  deeplink,
  flowQueryParams,
  useFxAStatusResult: { supportsKeysOptionalLogin },
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
  const [localizedBannerErrorDescription, setLocalizedBannerErrorDescription] =
    useState<string>('');
  const [localizedBannerErrorLink, setLocalizedBannerErrorLink] = useState<
    BannerLinkProps | undefined
  >(undefined);
  const [passwordTooltipErrorText, setPasswordTooltipErrorText] =
    useState<string>('');
  const [signinLoading, setSigninLoading] = useState<boolean>(false);
  const [hasEngaged, setHasEngaged] = useState<boolean>(false);

  const isOAuth = isOAuthIntegration(integration);
  const isFirefoxClientServiceRelay = integration.isFirefoxClientServiceRelay();
  const clientId = integration.getClientId();
  const isMonitorClient = isOAuth && isClientMonitor(clientId);
  const isRelayClient = isOAuth && isClientRelay(clientId);
  const hasLinkedAccountAndNoPassword = hasLinkedAccount && !hasPassword;

  const isDeeplinking = !!deeplink;

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

  // - Hide third-party auth if it's Sync and user has a password. Sync currently always
  // requires a PW for scoped keys. Passwordless users signing into Sync will be prompted
  // to create a PW at the end of the flow.
  // - Hide third party auth if it's an oauth native integration without passwordless support
  // Show for all other cases.
  const hideThirdPartyAuth = integration.isSync()
    ? hasPassword
    : isOAuthNativeIntegration(integration) && !supportsKeysOptionalLogin;

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
            emailVerified: data.emailVerified,
            sessionVerified: data.sessionVerified,
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
          performNavigation: !integration.isFirefoxMobileClient(),
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

        const isFullyVerified =
          data.signIn.emailVerified && data.signIn.sessionVerified;
        const navigationOptions = {
          email,
          signinData: data.signIn,
          unwrapBKey: data.unwrapBKey,
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
          performNavigation: !(
            integration.isFirefoxMobileClient() && isFullyVerified
          ),
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
          setLocalizedBannerErrorDescription('');
          setLocalizedBannerErrorLink(undefined);
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
            case AuthUiErrors.ACCOUNT_RESET.errno:
              setLocalizedBannerError(
                ftlMsgResolver.getMsg(
                  'signin-account-locked-banner-heading',
                  'Reset your password'
                )
              );
              setLocalizedBannerErrorDescription(
                ftlMsgResolver.getMsg(
                  'signin-account-locked-banner-description',
                  'We locked your account to keep it safe from suspicious activity.'
                )
              );
              setLocalizedBannerErrorLink({
                path: `/reset_password?email=${email}&email_to_hash_with=`,
                localizedText: ftlMsgResolver.getMsg(
                  'signin-account-locked-banner-link',
                  'Reset your password to sign in'
                ),
                gleanId: 'login_locked_account_banner_link',
              });
              GleanMetrics.login.lockedAccountBannerView();
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

  if (isDeeplinking) {
    // To avoid flickering, we only render third party auth and navigate
    return (
      <ThirdPartyAuth
        showSeparator={false}
        viewName="deeplink"
        deeplink={deeplink}
        flowQueryParams={flowQueryParams}
      />
    );
  }

  const cmsInfo = integration.getCmsInfo();
  const title = cmsInfo?.SigninPage.pageTitle;

  return (
    <AppLayout {...{ cmsInfo, title }}>
      {(localizedSuccessBannerHeading || localizedSuccessBannerDescription) && (
        <Banner
          type="success"
          content={{
            localizedHeading: localizedSuccessBannerHeading || '',
            localizedDescription: localizedSuccessBannerDescription || '',
          }}
        />
      )}
      {isPasswordNeededRef.current && hasPassword ? (
        <CardHeader
          headingText="Enter your password"
          headingAndSubheadingFtlId="signin-password-needed-header-2"
          {...{
            cmsLogoUrl: cmsInfo?.shared.logoUrl,
            cmsLogoAltText: cmsInfo?.shared.logoAltText,
            cmsHeadline: cmsInfo?.SigninPage.headline,
            cmsDescription: cmsInfo?.SigninPage.description,
          }}
        />
      ) : (
        <CardHeader
          headingText="Sign in"
          headingTextFtlId="signin-header"
          subheadingWithDefaultServiceFtlId="signin-subheader-without-logo-default"
          subheadingWithCustomServiceFtlId="signin-subheader-without-logo-with-servicename"
          {...{
            clientId,
            serviceName,
            cmsLogoUrl: cmsInfo?.shared.logoUrl,
            cmsLogoAltText: cmsInfo?.shared.logoAltText,
          }}
        />
      )}
      {localizedBannerError && (
        <Banner
          type="error"
          content={{
            localizedHeading: localizedBannerError,
            localizedDescription: localizedBannerErrorDescription,
          }}
          link={localizedBannerErrorLink}
        />
      )}
      <div className="mt-8 mb-7 desktop:my-6">
        <div className="flex desktop:flex-col items-center gap-3 desktop:gap-2">
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
          <div className="text-base break-all text-start desktop:text-center">
            {email}
          </div>
        </div>

        {isFirefoxClientServiceRelay && (
          <FtlMsg id="signin-desktop-relay">
            <p className="mt-6 mb-4 text-sm">
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
              <CmsButtonWithFallback
                className="cta-primary cta-xl"
                type="submit"
                disabled={signinLoading}
                buttonColor={cmsInfo?.shared.buttonColor}
              >
                Sign in
              </CmsButtonWithFallback>
            </FtlMsg>
          </div>
        </form>
      )}

      {!hideThirdPartyAuth && (
        <ThirdPartyAuth
          showSeparator={true}
          separatorType={
            hasLinkedAccountAndNoPassword ? 'signInWith' : undefined
          }
          {...{ viewName, flowQueryParams }}
        />
      )}

      <TermsPrivacyAgreement
        {...{
          isMonitorClient,
          isFirefoxClientServiceRelay,
          isRelayClient,
        }}
      />

      <div className="flex flex-col mt-8 tablet:justify-between tablet:flex-row">
        <FtlMsg id="signin-use-a-different-account-link">
          <a
            href="/"
            className="text-sm link-blue cursor-pointer mb-4 mx-auto tablet:mx-0 tablet:mb-0"
            onClick={(e) => {
              e.preventDefault();
              GleanMetrics.login.diffAccountLinkClick();

              // Some RPs may specify an email address in the query params which
              // we prioritize. Users attempting to change their email address is a signal
              // that the email in query params is not correct.
              const searchParams = new URLSearchParams(window.location.search);
              searchParams.delete('email');
              navigateWithQuery(`/?${searchParams.toString()}`, {
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
