/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { useNavigate, useLocation } from 'react-router';
import { useNavigateWithQuery, useWebRedirect } from '../../../../lib/hooks';
import { FtlMsg } from 'fxa-react/lib/utils';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import AppLayout from '../../../../components/AppLayout';
import CardHeader from '../../../../components/CardHeader';
import TermsPrivacyAgreement from '../../../../components/TermsPrivacyAgreement';
import { AuthUiErrors } from '../../../../lib/auth-errors/auth-errors';
import GleanMetrics from '../../../../lib/glean';
import { useGleanView } from '../../../../lib/glean/useGleanView';
import {
  useFtlMsgResolver,
  isWebIntegration,
  useAuthClient,
} from '../../../../models';
import { SigninCachedProps } from '../../interfaces';
import { handleNavigation, ensureCanLinkAcountOrRedirect } from '../../utils';
import { getLocalizedErrorMessage } from '../../../../lib/error-utils';
import Banner from '../../../../components/Banner';
import CmsButtonWithFallback from '../../../../components/CmsButtonWithFallback';
import { useConfig } from '../../../../models';
import SigninUserLockup from '../SigninUserLockup';
import { useCachedSigninLockup } from '../../useCachedSigninLockup';
import AccountSwitcher from '../../../../components/AccountSwitcher';
import { SwitchableAccount } from '../../../../lib/account-switcher';
import { useSwitchableAccounts } from '../../../../lib/hooks';
import { setCurrentAccountUid } from '../../../../lib/account-storage';

export const viewName = 'signin';

const SigninCached = ({
  integration,
  email,
  sessionToken,
  serviceName,
  hasLinkedAccount,
  hasPassword,
  avatarData,
  avatarLoading,
  cachedSigninHandler,
  localizedErrorFromLocationState,
  finishOAuthFlowHandler,
  localizedSuccessBannerHeading,
  localizedSuccessBannerDescription,
  isSignedIntoFirefox = false,
  setCurrentSplitLayout,
  onSessionExpired,
  supportsKeysOptionalLogin,
  firefoxSignedInUid,
  autoSignIn = false,
}: SigninCachedProps) => {
  const authClient = useAuthClient();
  const config = useConfig();
  const location = useLocation();
  const navigate = useNavigate();
  const navigateWithQuery = useNavigateWithQuery();
  const ftlMsgResolver = useFtlMsgResolver();
  const webRedirectCheck = useWebRedirect(integration.data.redirectTo);

  const [signinLoading, setSigninLoading] = useState<boolean>(false);

  const accountSwitcherEnabled = !!config.featureFlags?.accountSwitcherEnabled;
  const switchableAccounts = useSwitchableAccounts({
    firefoxSignedInUid,
    clientId: integration.isFirefoxClient()
      ? undefined
      : integration.getClientId(),
  });

  // Passwordless accounts that need keys (Sync, or a non-Sync Firefox service
  // when Sync is not decoupled) need to defer the browser login/OAuth messages
  // and let handleNavigation route to set_password.
  const deferKeysUntilPasswordSet =
    !hasPassword &&
    integration.requiresPasswordForLogin(supportsKeysOptionalLogin);

  const {
    clientId,
    legalTerms,
    cmsInfo,
    cachedPageCms,
    title,
    splitLayout,
    additionalAccessibilityInfo,
    localizedBannerError,
    setLocalizedBannerError,
  } = useCachedSigninLockup({ integration, localizedErrorFromLocationState });

  // Hide "Use a different account" when the user is signed into Firefox already
  // and they're in a Firefox login/authorization flow. On Desktop, users cannot
  // choose another account due to the inability to merge account/sync data (the
  // "merge stop"/warning) and on Mobile if cached sign-in is shown (Fx 151+),
  // they're already signed into Sync and are authorizing a new service, like
  // `service=vpn`, and Sync has not been decoupled yet, meaning in that flow
  // the Sync scope is not requested, so Mobile cannot use another account because
  // they cannot sign in without Sync.
  const hideAccountSwitchLink =
    isSignedIntoFirefox &&
    integration.isFirefoxClient() &&
    !!integration.getService();

  // Which account this page is about is already decided upstream and baked into
  // `email`; that account leads the chooser and its row is the submit control.
  const suggestedAccount = switchableAccounts.find(
    (account) => account.email === email
  );
  const primaryAccount = suggestedAccount && {
    ...suggestedAccount,
    isCurrent: true,
    // The page already fetched a fresh avatar for this account; the other rows
    // have only localStorage to go on.
    avatar: avatarData?.account?.avatar ?? suggestedAccount.avatar,
  };
  const otherAccounts = switchableAccounts.filter(
    (account) => account.email !== email
  );

  const showAccountChooser =
    accountSwitcherEnabled &&
    !hideAccountSwitchLink &&
    // The chooser replaces the Sign in button, which is where CMS puts
    // `primaryButtonText`. Keep the classic layout rather than drop an RP's copy.
    !cachedPageCms?.primaryButtonText &&
    !!primaryAccount &&
    otherAccounts.length > 0;

  // Re-enters the container rather than signing in from here: the branches below
  // (Sync merge, deferring keys until a password is set) depend on the chosen
  // account's own hasPassword/hasLinkedAccount, which only the container
  // fetches. It sends us back with `autoSignIn`, or on to the password step.
  const switchToAccount = useCallback(
    (account: SwitchableAccount) => {
      GleanMetrics.login.diffAccountLinkClick();
      if (account.hasSession) {
        setCurrentAccountUid(account.uid);
      }
      const searchParams = new URLSearchParams(window.location.search);
      searchParams.delete('email');
      navigateWithQuery(`/signin?${searchParams.toString()}`, {
        state: { email: account.email, autoSignIn: true },
      });
    },
    [navigateWithQuery]
  );

  const useAnotherAccount = useCallback(() => {
    GleanMetrics.login.diffAccountLinkClick();
    // The RP-supplied email is dropped: asking for another account signals it is
    // not the one the user wants.
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.delete('email');
    navigateWithQuery(`/?${searchParams.toString()}`, {
      state: { prefillEmail: email },
    });
  }, [email, navigateWithQuery]);

  const isServiceWithEmailVerification =
    !!clientId && config.servicesWithEmailVerification.includes(clientId);

  const { handleSubmit } = useForm({
    mode: 'onTouched',
    criteriaMode: 'all',
    defaultValues: { email },
  });

  useGleanView(() =>
    GleanMetrics.cachedLogin.view({ event: { thirdPartyLinks: false } })
  );

  const onSubmit = useCallback(async () => {
    setSigninLoading(true);
    GleanMetrics.cachedLogin.submit();

    const { data, error } = await cachedSigninHandler(sessionToken);

    if (data) {
      GleanMetrics.cachedLogin.success();

      // Sync merge check for cached signin
      // Pattern matches SigninPasswordlessCode
      if (
        (integration.isSync() || integration.isFirefoxNonSync()) &&
        !hasPassword &&
        !hasLinkedAccount
      ) {
        const canLink = await ensureCanLinkAcountOrRedirect({
          email,
          uid: data.uid,
          ftlMsgResolver,
          navigateWithQuery,
        });
        if (!canLink) {
          // User cancelled the merge - abort signin
          setSigninLoading(false);
          return;
        }
      }

      const navigationOptions = {
        navigate,
        email,
        signinData: {
          emailVerified: data.emailVerified,
          sessionVerified: data.sessionVerified,
          verificationMethod: data.verificationMethod,
          verificationReason: data.verificationReason,
          uid: data.uid,
          sessionToken,
        },
        // Lets handleNavigation divert an AAL2 RP to inline TOTP setup; without
        // it a passkey-AAL2 cached session with no TOTP would loop.
        accountHasTotp: data.totpIsActive,
        integration,
        redirectTo:
          isWebIntegration(integration) && webRedirectCheck?.isValid
            ? integration.data.redirectTo
            : '',
        finishOAuthFlowHandler,
        queryParams: location.search,
        // Passwordless accounts that need keys (Sync, or a non-Sync Firefox service
        // when Sync is not decoupled) need to navigate to set_password within the
        // webview, even on mobile clients. No webchannel messages are sent (deferred
        // until after password creation), so the webview must handle navigation
        // internally.
        performNavigation:
          (deferKeysUntilPasswordSet && !hasPassword) ||
          !integration.isFirefoxMobileClient(),
        isServiceWithEmailVerification,
        // Passwordless users in the cached path that still need keys (third-party
        // auth or OTP) defer web channel messages until after password creation.
        handleFxaLogin: !deferKeysUntilPasswordSet,
        handleFxaOAuthLogin: !deferKeysUntilPasswordSet,
        supportsKeysOptionalLogin,
        // Redirect these passwordless users to set_password after session
        // verification.
        isSignInWithThirdPartyAuth: deferKeysUntilPasswordSet,
        authClient,
      };
      const { error: navError } = await handleNavigation(navigationOptions);
      if (navError) {
        setLocalizedBannerError(
          getLocalizedErrorMessage(ftlMsgResolver, navError)
        );
      }
    }
    if (error) {
      const localizedErrorMessage = getLocalizedErrorMessage(
        ftlMsgResolver,
        error
      );
      if (error.errno === AuthUiErrors.SESSION_EXPIRED.errno) {
        // Container hoists us out of cached signin and carries this message
        // forward as the initial banner error.
        onSessionExpired(localizedErrorMessage);
        return;
      }
      setLocalizedBannerError(localizedErrorMessage);
      setSigninLoading(false);
    }
  }, [
    cachedSigninHandler,
    sessionToken,
    email,
    ftlMsgResolver,
    navigate,
    navigateWithQuery,
    integration,
    finishOAuthFlowHandler,
    deferKeysUntilPasswordSet,
    supportsKeysOptionalLogin,
    location.search,
    webRedirectCheck,
    isServiceWithEmailVerification,
    hasLinkedAccount,
    setLocalizedBannerError,
    hasPassword,
    onSessionExpired,
    authClient,
  ]);

  // The sign-in was already decided upstream (the switcher, or email-first with
  // a cached session), so submit without waiting for a second click. Guarded by
  // a ref rather than the effect deps so a re-render cannot fire a second
  // attempt.
  const hasAutoSubmitted = useRef(false);
  const shouldAutoSignIn = accountSwitcherEnabled && autoSignIn;
  const [isAutoSigningIn, setIsAutoSigningIn] = useState(shouldAutoSignIn);
  useEffect(() => {
    if (!shouldAutoSignIn || hasAutoSubmitted.current) {
      return;
    }
    hasAutoSubmitted.current = true;
    (async () => {
      await onSubmit();
      // Still mounted, so the submit did not navigate away — reveal the card so
      // the error it just set is visible.
      setIsAutoSigningIn(false);
    })();
  }, [shouldAutoSignIn, onSubmit]);

  // Nothing is actionable while the sign-in is in flight, and rendering the card
  // first flashed a page the user is about to be moved off.
  if (isAutoSigningIn) {
    return (
      <AppLayout
        {...{ cmsInfo, title, splitLayout, setCurrentSplitLayout }}
        loading
      />
    );
  }

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
        headingText={showAccountChooser ? 'Choose an account' : 'Sign in'}
        headingTextFtlId={
          showAccountChooser
            ? 'signin-cached-choose-account-header'
            : 'signin-header'
        }
        subheadingWithDefaultServiceFtlId="signin-subheader-without-logo-default"
        subheadingWithCustomServiceFtlId="signin-subheader-without-logo-with-servicename"
        {...{
          clientId,
          serviceName,
          cmsLogoUrl: cmsInfo?.shared.logoUrl,
          cmsLogoAltText: cmsInfo?.shared.logoAltText,
          cmsHeadline: cachedPageCms?.headline,
          cmsDescription: cachedPageCms?.description,
          cmsHeadlineFontSize: cmsInfo?.shared.headlineFontSize,
          cmsHeadlineTextColor: cmsInfo?.shared.headlineTextColor,
        }}
      />
      {localizedBannerError && (
        <Banner
          type="error"
          content={{ localizedHeading: localizedBannerError }}
        />
      )}
      {showAccountChooser ? (
        // No separate lockup or Sign in button: each row is itself the action,
        // and the suggested account's row is the form's submit control, so the
        // existing submit path is unchanged.
        <form onSubmit={handleSubmit(onSubmit)} className="mt-6">
          <input type="email" className="hidden" value={email} disabled />
          <AccountSwitcher
            variant="chooser"
            accounts={otherAccounts}
            onSelect={switchToAccount}
            onUseAnotherAccount={useAnotherAccount}
            disabled={signinLoading}
            gleanIdPrefix="cached_login_account_switcher"
            {...{ primaryAccount, serviceName }}
          />
        </form>
      ) : (
        <>
          <SigninUserLockup
            {...{
              email,
              avatarData,
              avatarLoading,
              sessionToken,
              additionalAccessibilityInfo,
            }}
          />
          <form onSubmit={handleSubmit(onSubmit)}>
            <input type="email" className="hidden" value={email} disabled />
            <div className="flex">
              <FtlMsg id="signin-button">
                <CmsButtonWithFallback
                  type="submit"
                  // Functional tests identify this step by test id: it shares
                  // /signin with the password step and all its copy is CMS-driven.
                  data-testid="cached-signin-submit"
                  disabled={signinLoading}
                  buttonColor={cmsInfo?.shared.buttonColor}
                  buttonText={cachedPageCms?.primaryButtonText}
                >
                  Sign in
                </CmsButtonWithFallback>
              </FtlMsg>
            </div>
          </form>
        </>
      )}

      <TermsPrivacyAgreement legalTerms={legalTerms} />

      {!hideAccountSwitchLink && !showAccountChooser && (
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
        </div>
      )}
    </AppLayout>
  );
};

export default SigninCached;
