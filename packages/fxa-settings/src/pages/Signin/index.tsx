/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Link, RouteComponentProps, useLocation } from '@reach/router';
import { useNavigateWithQuery as useNavigate } from '../../lib/hooks/useNavigateWithQuery';
import classNames from 'classnames';
import LoadingSpinner from 'fxa-react/components/LoadingSpinner';
import { FtlMsg, hardNavigate } from 'fxa-react/lib/utils';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import AppLayout from '../../components/AppLayout';
import Banner, { BannerType } from '../../components/Banner';
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
import { isOAuthIntegration, useFtlMsgResolver } from '../../models';
import {
  isClientMonitor,
  isClientPocket,
} from '../../models/integrations/client-matching';
import { SigninFormData, SigninProps } from './interfaces';
import { handleNavigation } from './utils';
import { useWebRedirect } from '../../lib/hooks/useWebRedirect';
import { getCredentials } from 'fxa-auth-client/lib/crypto';
import { getLocalizedErrorMessage } from '../../lib/error-utils';

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
}: SigninProps & RouteComponentProps) => {
  usePageViewEvent(viewName, REACT_ENTRYPOINT);
  const location = useLocation();
  const navigate = useNavigate();
  const ftlMsgResolver = useFtlMsgResolver();
  const webRedirectCheck = useWebRedirect(integration.data.redirectTo);

  const [bannerError, setBannerError] = useState(
    localizedErrorFromLocationState || ''
  );
  const [passwordTooltipErrorText, setPasswordTooltipErrorText] =
    useState<string>('');
  const [signinLoading, setSigninLoading] = useState<boolean>(false);

  const isOAuth = isOAuthIntegration(integration);
  const clientId = integration.getService();
  const isPocketClient = isOAuth && isClientPocket(clientId);
  const isMonitorClient = isOAuth && isClientMonitor(clientId);
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

  useEffect(() => {
    if (!isPasswordNeededRef.current) {
      GleanMetrics.cachedLogin.view();
    } else {
      GleanMetrics.login.view();
    }
  }, [isPasswordNeededRef]);

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
          redirectTo: webRedirectCheck.isValid()
            ? integration.data.redirectTo
            : '',
          finishOAuthFlowHandler,
          queryParams: location.search,
        };

        const { error: navError } = await handleNavigation(navigationOptions);
        if (navError) {
          setBannerError(getLocalizedErrorMessage(ftlMsgResolver, navError));
        }
      }
      if (error) {
        setBannerError(getLocalizedErrorMessage(ftlMsgResolver, error));
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
      setBannerError,
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
          redirectTo: webRedirectCheck.isValid()
            ? integration.data.redirectTo
            : '',
          queryParams: location.search,
        };

        const { error: navError } = await handleNavigation(
          navigationOptions,
          true
        );
        if (navError) {
          setBannerError(getLocalizedErrorMessage(ftlMsgResolver, navError));
        }
      }
      if (error) {
        GleanMetrics.login.error({ event: { reason: error.message } });
        const { errno } = error;

        const localizedErrorMessage = getLocalizedErrorMessage(
          ftlMsgResolver,
          error
        );

        if (
          errno === AuthUiErrors.PASSWORD_REQUIRED.errno ||
          errno === AuthUiErrors.INCORRECT_PASSWORD.errno
        ) {
          setBannerError('');
          setPasswordTooltipErrorText(localizedErrorMessage);
        } else {
          switch (errno) {
            case AuthUiErrors.THROTTLED.errno:
            case AuthUiErrors.REQUEST_BLOCKED.errno:
              const { localizedErrorMessage: unblockErrorMessage } =
                await sendUnblockEmailHandler(email);
              if (unblockErrorMessage) {
                // Sending the unblock email could itself be rate limited.
                // If it is, the error should be displayed on this screen
                // and the user shouldn't even have the chance to continue.
                setBannerError(unblockErrorMessage);
                setSigninLoading(false);
                break;
              }

              // Fallback to using v1 creds for signin unblock and don't
              // upgrade user to v2 keys
              const v1Credentials = await getCredentials(email, password);
              // navigate only if sending the unblock code email is successful
              navigate('/signin_unblock', {
                state: {
                  email,
                  authPW: v1Credentials.authPW,
                  // TODO: in FXA-9177, remove hasLinkedAccount and hasPassword from state
                  // will be stored in Apollo cache at the container level
                  hasPassword,
                  hasLinkedAccount,
                },
              });
              break;
            case AuthUiErrors.EMAIL_HARD_BOUNCE.errno:
            case AuthUiErrors.EMAIL_SENT_COMPLAINT.errno:
              navigate('/signin_bounced');
              break;
            default:
              setBannerError(localizedErrorMessage);
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
      navigate,
      sendUnblockEmailHandler,
      setBannerError,
      finishOAuthFlowHandler,
      integration,
      location.search,
      webRedirectCheck,
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

  const hideThirdPartyAuth = integration.isSync() && hasPassword;

  return (
    <AppLayout>
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
      {bannerError && (
        <Banner type={BannerType.error}>
          <p>{bannerError}</p>
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
              params.delete('login_hint');
              hardNavigate(`/?${params.toString()}`);
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
