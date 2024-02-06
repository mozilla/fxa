/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { usePageViewEvent } from '../../lib/metrics';
import { isOAuthIntegration, useFtlMsgResolver } from '../../models';
import { FtlMsg, hardNavigateToContentServer } from 'fxa-react/lib/utils';
import {
  RouteComponentProps,
  Link,
  useLocation,
  useNavigate,
} from '@reach/router';
import InputPassword from '../../components/InputPassword';
import TermsPrivacyAgreement from '../../components/TermsPrivacyAgreement';
import { REACT_ENTRYPOINT } from '../../constants';
import CardHeader from '../../components/CardHeader';
import ThirdPartyAuth from '../../components/ThirdPartyAuth';
import { BrandMessagingPortal } from '../../components/BrandMessaging';
import GleanMetrics from '../../lib/glean';
import AppLayout from '../../components/AppLayout';
import { SigninFormData, SigninProps } from './interfaces';
import Avatar from '../../components/Settings/Avatar';
import LoadingSpinner from 'fxa-react/components/LoadingSpinner';
import classNames from 'classnames';
import {
  isClientMonitor,
  isClientPocket,
} from '../../models/integrations/client-matching';
import { StoredAccountData, storeAccountData } from '../../lib/storage-utils';
import { useForm } from 'react-hook-form';
import Banner, { BannerType } from '../../components/Banner';
import { AuthUiErrors } from '../../lib/auth-errors/auth-errors';
import VerificationMethods from '../../constants/verification-methods';
import VerificationReasons from '../../constants/verification-reasons';

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
  hasPassword,
  avatarData,
  avatarLoading,
}: SigninProps & RouteComponentProps) => {
  usePageViewEvent(viewName, REACT_ENTRYPOINT);
  const location = useLocation();
  const navigate = useNavigate();
  const ftlMsgResolver = useFtlMsgResolver();

  const [passwordTooltipErrorText, setPasswordTooltipErrorText] =
    useState<string>('');
  const [signinLoading, setSigninLoading] = useState<boolean>(false);
  const [bannerErrorText, setBannerErrorText] = useState<string>('');

  const isOAuth = isOAuthIntegration(integration);
  const isPocketClient = isOAuth && isClientPocket(integration.getService());
  const isMonitorClient = isOAuth && isClientMonitor(integration.getService());
  const hasLinkedAccountAndNoPassword = hasLinkedAccount && !hasPassword;

  // We must use a ref because we may update this value in a callback
  let isPasswordNeededRef = useRef(
    (!sessionToken && hasPassword) ||
      (isOAuth && (integration.wantsKeys() || integration.wantsLogin()))
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

  useEffect(() => {
    if (!isPasswordNeededRef.current) {
      GleanMetrics.cachedLogin.view();
    } else {
      GleanMetrics.login.view();
    }
  }, [isPasswordNeededRef]);

  const navigationHandler = useCallback(
    ({
      verified,
      verificationReason,
      verificationMethod,
      sessionVerified,
    }: {
      verified: boolean;
      verificationReason: VerificationReasons;
      verificationMethod: VerificationMethods;
      sessionVerified?: boolean;
    }) => {
      // Note, all navigations are missing query params. Add these when working on
      // subsequent tickets.
      if (!verified) {
        // TODO: Does force password change ever reach here, or can we move
        // CHANGE_PASSWORD checks to another page?
        if (
          ((verificationReason === VerificationReasons.SIGN_IN ||
            verificationReason === VerificationReasons.CHANGE_PASSWORD) &&
            verificationMethod === VerificationMethods.TOTP_2FA) ||
          (isOAuth && integration.wantsTwoStepAuthentication())
        ) {
          // TODO with signin_totp_code ticket, content server says this (double check it):
          // Login requests that ask for 2FA but don't have it setup on their account
          // will return an error.
          navigate('/signin_totp_code', {
            state: { verificationReason, verificationMethod },
          });
        } else if (verificationReason === VerificationReasons.SIGN_UP) {
          // do we need this?
          // if (verificationMethod !== VerificationMethods.EMAIL_OTP) {
          //  send email verification since this screen doesn't do it automatically
          // }
          navigate('/confirm_signup_code');
        } else {
          // TODO: Pretty sure we want this to be the default. The check used to be:
          // if (
          //   verificationMethod === VerificationMethods.EMAIL_OTP &&
          //   (verificationReason === VerificationReasons.SIGN_IN || verificationReason === VerificationReasons.CHANGE_PASSWORD)) {
          navigate('/signin_token_code', {
            state: {
              email,
              // TODO: We may want to store this in local apollo cache
              // instead of passing it via location state, depending on
              // if we reference it in another spot or two and if we need
              // some action to happen dependent on it that should occur
              // without first reaching /signin.
              verificationReason,
            },
          });
        }
        // Verified account, but session hasn't been verified
      } else {
        navigate('/settings');
      }
    },
    [integration, isOAuth, navigate, email]
  );

  const signInWithCachedAccount = useCallback(
    async (sessionToken: hexstring) => {
      setSigninLoading(true);
      GleanMetrics.cachedLogin.submit();

      const { data, error } = await cachedSigninHandler(sessionToken);

      if (data) {
        GleanMetrics.cachedLogin.success();

        navigationHandler(data);
      }
      if (error) {
        if (error.errno === AuthUiErrors.SESSION_EXPIRED.errno) {
          isPasswordNeededRef.current = true;
        }
        setBannerErrorText(ftlMsgResolver.getMsg(error.ftlId, error.message));
        setSigninLoading(false);
      }
    },
    [cachedSigninHandler, ftlMsgResolver, navigationHandler]
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
        navigationHandler(data.signIn);
      }
      if (error) {
        GleanMetrics.login.error({ reason: error.message });
        const { message, ftlId, errno } = error;

        if (
          errno === AuthUiErrors.PASSWORD_REQUIRED.errno ||
          errno === AuthUiErrors.INCORRECT_PASSWORD.errno
        ) {
          setPasswordTooltipErrorText(ftlMsgResolver.getMsg(ftlId, message));
        } else {
          switch (errno) {
            case AuthUiErrors.THROTTLED.errno:
            case AuthUiErrors.REQUEST_BLOCKED.errno:
              if (
                error.verificationReason === VerificationReasons.SIGN_IN &&
                error.verificationMethod === VerificationMethods.EMAIL_CAPTCHA
              ) {
                // TODO: This is a copy-and-paste from content-server.
                // Check the comment and send the unblock email. FXA-9030
                //
                // Sending the unblock email could itself be rate limited.
                // If it is, the error should be displayed on this screen
                // and the user shouldn't even have the chance to continue.
                // return account.sendUnblockEmail().then(() => {
                //   return this.navigate('signin_unblock', {
                //     account: account,
                //     lastPage: this.currentPage,
                //     password: password,
                //   });
                // });
              } else {
                // TODO: This is a copy-and-paste from content-server.
                // Check if we should display the error message on this screen
                // and/or what the behavior is. FXA-9030
                //
                // Signin is blocked and cannot be unblocked, show the
                // error at another level.
                // return Promise.reject(err);
              }
              break;
            case AuthUiErrors.EMAIL_HARD_BOUNCE.errno:
            case AuthUiErrors.EMAIL_SENT_COMPLAINT.errno:
              navigate('/signin_bounced');
              break;
            case AuthUiErrors.TOTP_REQUIRED.errno:
            case AuthUiErrors.INSUFFICIENT_ACR_VALUES.errno:
              // TODO in Oauth ticket (this isn't in AuthUiErrors)
              // case OAuthError.MISMATCH_ACR_VALUES.errno:
              navigate('/inline_totp_setup');
              break;
            default:
              break;
          }
          setBannerErrorText(ftlMsgResolver.getMsg(ftlId, message));
        }
      }
    },
    [beginSigninHandler, email, ftlMsgResolver, navigate, navigationHandler]
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

  const hideThirdPartyAuth =
    integration.isSync() && hasLinkedAccount && hasPassword;

  return (
    <AppLayout>
      <BrandMessagingPortal {...{ viewName }} />
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
          {...{ serviceName }}
        />
      )}
      {bannerErrorText && (
        <Banner type={BannerType.error}>
          <p>{bannerErrorText}</p>
        </Banner>
      )}
      <div className="mt-9">
        {avatarData?.account.avatar ? (
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
        <div className="my-5 text-base break-all">{email}</div>
      </div>
      {!hasLinkedAccountAndNoPassword && (
        <form onSubmit={handleSubmit(onSubmit)}>
          <input type="email" className="hidden" value={email} disabled />

          {isPasswordNeededRef.current && (
            <InputPassword
              name="password"
              anchorPosition="start"
              className="mb-5 text-start"
              label={localizedPasswordFormLabel}
              errorText={passwordTooltipErrorText}
              tooltipPosition="bottom"
              required
              autoFocus
              onChange={() => {
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
        <ThirdPartyAuth showSeparator={!hasLinkedAccountAndNoPassword} />
      )}

      <TermsPrivacyAgreement {...{ isPocketClient, isMonitorClient }} />

      <div className="flex justify-between mt-5">
        <FtlMsg id="signin-use-a-different-account-link">
          <a
            href="/"
            className="text-sm link-blue"
            onClick={(e) => {
              e.preventDefault();
              const params = new URLSearchParams(location.search);
              // Tell content-server to stay on index and prefill the email
              params.set('prefillEmail', email);
              // Passing back the 'email' param causes various behaviors in
              // content-server since it marks the email as "coming from a RP".
              // Also remove other params that are passed when coming
              // from content-server to Backbone, see Signup container component
              // for more info.
              params.delete('email');
              params.delete('hasLinkedAccount');
              params.delete('hasPassword');
              params.delete('showReactApp');
              hardNavigateToContentServer(`/?${params.toString()}`);
            }}
          >
            Use a different account
          </a>
        </FtlMsg>
        {!hasLinkedAccountAndNoPassword && (
          <FtlMsg id="signin-forgot-password">
            <Link
              // TODO, pass params?
              to="/reset_password"
              className="text-sm link-blue"
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
