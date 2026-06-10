/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Link, RouteComponentProps, useLocation } from '@reach/router';
import { useNavigateWithQuery } from '../../lib/hooks/useNavigateWithQuery';
import { FtlMsg } from 'fxa-react/lib/utils';
import React, { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import AppLayout from '../../components/AppLayout';
import CardHeader from '../../components/CardHeader';
import InputPassword from '../../components/InputPassword';
import TermsPrivacyAgreement from '../../components/TermsPrivacyAgreement';
import AlternativeAuthOptions from '../../components/AlternativeAuthOptions';
import { AuthUiErrors } from '../../lib/auth-errors/auth-errors';
import GleanMetrics from '../../lib/glean';
import {
  useSensitiveDataClient,
  useFtlMsgResolver,
  isWebIntegration,
  isOAuthNativeIntegration,
  useAuthClient,
  useConfig,
} from '../../models';
import { usePasskeySignIn } from '../../lib/passkeys/signin-flow';
import { SigninFormData, SigninProps } from './interfaces';
import { handleNavigation } from './utils';
import { useWebRedirect } from '../../lib/hooks/useWebRedirect';
import { getLocalizedErrorMessage } from '../../lib/error-utils';
import Banner from '../../components/Banner';
import { SensitiveData } from '../../lib/sensitive-data-client';
import { BannerLinkProps } from '../../components/Banner/interfaces';
import CmsButtonWithFallback from '../../components/CmsButtonWithFallback';
import SigninUserLockup from './components/SigninUserLockup';

export const viewName = 'signin';

// Password-input signin. The container only renders this component when the
// flow needs a password.
const Signin = ({
  integration,
  email,
  hasLinkedAccount,
  beginSigninHandler,
  sendUnblockEmailHandler,
  hasPassword,
  avatarData,
  avatarLoading,
  localizedErrorFromLocationState,
  finishOAuthFlowHandler,
  localizedSuccessBannerHeading,
  localizedSuccessBannerDescription,
  flowQueryParams,
  useFxAStatusResult: { supportsKeysOptionalLogin },
  isSignedIntoFirefox = false,
  setCurrentSplitLayout,
}: SigninProps & RouteComponentProps) => {
  const config = useConfig();
  const location = useLocation();
  const navigateWithQuery = useNavigateWithQuery();
  const ftlMsgResolver = useFtlMsgResolver();
  const webRedirectCheck = useWebRedirect(integration.data.redirectTo);
  const sensitiveDataClient = useSensitiveDataClient();
  const authClient = useAuthClient();

  const passkey = usePasskeySignIn({
    integration,
    authClient,
    finishOAuthFlowHandler,
    ftlMsgResolver,
    navigateWithQuery,
    queryParams: location.search,
    surface: 'login',
  });

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

  const isOAuthNative = isOAuthNativeIntegration(integration);
  const isSync = integration.isSync();
  const clientId = integration.getClientId();

  const legalTerms = integration.getLegalTerms();

  // Hide "Use a different account" when the user is signed into Firefox Desktop.
  // Users cannot choose another account due to the inability to merge
  // account/sync data (the "merge stop"/warning).
  const hideAccountSwitchLink =
    isSignedIntoFirefox && integration.isFirefoxDesktopClient();

  const isServiceWithEmailVerification =
    !!clientId && config.servicesWithEmailVerification.includes(clientId);

  // Button stays visible without WebAuthn support; the hook surfaces an error.
  const showPasskeySignin = !!(
    config.featureFlags?.passkeysEnabled &&
    config.featureFlags?.passkeyAuthenticationEnabled
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
  const hideThirdPartyAuth = isSync
    ? hasPassword
    : isOAuthNative && !supportsKeysOptionalLogin;

  useEffect(() => {
    GleanMetrics.login.view({
      event: { thirdPartyLinks: !hideThirdPartyAuth },
    });
  }, [hideThirdPartyAuth]);

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
          isServiceWithEmailVerification,
          authClient
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
                  // TODO: in FXA-9177, consider persisting hasLinkedAccount and hasPassword to localStorage
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
                path: `/reset_password?email=${email}`,
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
      isServiceWithEmailVerification,
      authClient
    ]
  );

  const onSubmit = useCallback(
    async ({ password }: { password: string }) => {
      if (password === '') {
        setPasswordTooltipErrorText(localizedValidPasswordError);
        return;
      }
      signInWithPassword(password);
    },
    [signInWithPassword, localizedValidPasswordError]
  );

  const cmsInfo = integration.getCmsInfo();
  const signinPageCms = cmsInfo?.SigninPage;
  const title = signinPageCms?.pageTitle;
  const splitLayout = signinPageCms?.splitLayout;
  const additionalAccessibilityInfo =
    cmsInfo?.shared.additionalAccessibilityInfo;

  return (
    <AppLayout {...{ cmsInfo, title, splitLayout, setCurrentSplitLayout }}>
      {(localizedSuccessBannerHeading || localizedSuccessBannerDescription) && (
        <Banner
          type="success"
          content={{
            localizedHeading: localizedSuccessBannerHeading || '',
            localizedDescription: localizedSuccessBannerDescription || '',
          }}
        />
      )}
      <CardHeader
        headingText="Enter your password"
        headingAndSubheadingFtlId="signin-password-needed-header-2"
        {...{
          cmsLogoUrl: cmsInfo?.shared.logoUrl,
          cmsLogoAltText: cmsInfo?.shared.logoAltText,
          cmsHeadline: signinPageCms?.headline,
          cmsDescription: signinPageCms?.description,
          cmsHeadlineFontSize: cmsInfo?.shared.headlineFontSize,
          cmsHeadlineTextColor: cmsInfo?.shared.headlineTextColor,
        }}
      />
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
      <SigninUserLockup
        {...{
          email,
          avatarData,
          avatarLoading,
          additionalAccessibilityInfo,
        }}
      />
      <form onSubmit={handleSubmit(onSubmit)}>
        <input type="email" className="hidden" value={email} disabled />

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

        <div className="flex">
          <FtlMsg id="signin-button">
            <CmsButtonWithFallback
              type="submit"
              disabled={signinLoading}
              buttonColor={cmsInfo?.shared.buttonColor}
              buttonText={signinPageCms?.primaryButtonText}
            >
              Sign in
            </CmsButtonWithFallback>
          </FtlMsg>
        </div>
      </form>

      <AlternativeAuthOptions
        showThirdPartyAuth={!hideThirdPartyAuth}
        showPasskeySignin={showPasskeySignin}
        passkeySignIn={
          showPasskeySignin
            ? { isLoading: passkey.isLoading, onClick: passkey.onClick }
            : undefined
        }
        errorBanner={showPasskeySignin ? passkey.errorBanner : undefined}
        {...{ viewName, flowQueryParams }}
      />

      <TermsPrivacyAgreement legalTerms={legalTerms} />

      <div className="flex flex-col mt-8 tablet:justify-between tablet:flex-row">
        {!hideAccountSwitchLink && (
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
                const searchParams = new URLSearchParams(
                  window.location.search
                );
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
        )}
        <FtlMsg id="signin-forgot-password-link">
          <Link
            to={`/reset_password${
              location?.search ? `/${location?.search}` : ''
            }`}
            className="text-sm link-blue mx-auto tablet:mx-0"
            onClick={() => GleanMetrics.login.forgotPassword()}
          >
            Forgot password?
          </Link>
        </FtlMsg>
      </div>
    </AppLayout>
  );
};

export default Signin;
