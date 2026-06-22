/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { RouteComponentProps, useLocation } from '@reach/router';
import { FtlMsg } from 'fxa-react/lib/utils';
import React, { useEffect } from 'react';
import AppLayout from '../../../../components/AppLayout';
import CardHeader from '../../../../components/CardHeader';
import TermsPrivacyAgreement from '../../../../components/TermsPrivacyAgreement';
import AlternativeAuthOptions from '../../../../components/AlternativeAuthOptions';
import GleanMetrics from '../../../../lib/glean';
import { useNavigateWithQuery } from '../../../../lib/hooks/useNavigateWithQuery';
import Banner from '../../../../components/Banner';
import { SigninAlternativeAuthOptionsProps } from '../../interfaces';
import SigninUserLockup from '../SigninUserLockup';
import { useCachedSigninLockup } from '../../useCachedSigninLockup';
import {
  useAuthClient,
  useConfig,
  useFtlMsgResolver,
} from '../../../../models';
import { usePasskeySignIn } from '../../../../lib/passkeys/signin-flow';

export const viewName = 'signin-alternative-auth';

// Signin landing page for linked-passwordless users — their only paths
// forward are the alternative auth options (third-party providers or
// passkeys).
const SigninAlternativeAuthOptions = ({
  integration,
  email,
  serviceName,
  avatarData,
  avatarLoading,
  flowQueryParams,
  finishOAuthFlowHandler,
  localizedErrorFromLocationState,
  localizedSuccessBannerHeading,
  localizedSuccessBannerDescription,
  isSignedIntoFirefox = false,
  setCurrentSplitLayout,
  supportsKeysOptionalLogin,
}: SigninAlternativeAuthOptionsProps & RouteComponentProps) => {
  const config = useConfig();
  const authClient = useAuthClient();
  const ftlMsgResolver = useFtlMsgResolver();
  const location = useLocation();
  const navigateWithQuery = useNavigateWithQuery();

  const showPasskeySignin = !!(
    config.featureFlags?.passkeysEnabled &&
    config.featureFlags?.passkeyAuthenticationEnabled
  );

  const passkey = usePasskeySignIn({
    integration,
    authClient,
    finishOAuthFlowHandler,
    ftlMsgResolver,
    navigateWithQuery,
    queryParams: location.search,
    surface: 'alternative_auth',
    isButtonVisible: showPasskeySignin,
    supportsKeysOptionalLogin,
  });

  const {
    clientId,
    legalTerms,
    cmsInfo,
    cachedPageCms,
    title,
    splitLayout,
    additionalAccessibilityInfo,
    localizedBannerError,
  } = useCachedSigninLockup({ integration, localizedErrorFromLocationState });

  // Hide "Use a different account" when the user is signed into Firefox Desktop.
  // Users cannot choose another account due to the inability to merge
  // account/sync data (the "merge stop"/warning).
  // Note, there is an edge case where users signing in with third party auth can
  // select a different account once they are at Google/Apple. These users will
  // be blocked later, once we have access to the new account's UID.
  const hideAccountSwitchLink =
    isSignedIntoFirefox && integration.isFirefoxDesktopClient();

  useEffect(() => {
    // Linked-passwordless is the only render path where third-party auth /
    // passkey are the user's only options. Tracked under `login.alternative_auth_*`
    // so the view→click funnel for this cohort lives under one category and
    // is distinct from generic signin/TPA events.
    GleanMetrics.login.alternativeAuthView();
  }, []);

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
        headingText="Sign in"
        headingTextFtlId="signin-header"
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
      <SigninUserLockup
        {...{
          email,
          avatarData,
          avatarLoading,
          additionalAccessibilityInfo,
        }}
      />

      <AlternativeAuthOptions
        showThirdPartyAuth={true}
        showPasskeySignin={showPasskeySignin}
        isStandalone={true}
        passkeySignIn={
          showPasskeySignin
            ? { isLoading: passkey.isLoading, onClick: passkey.onClick }
            : undefined
        }
        errorBanner={showPasskeySignin ? passkey.errorBanner : undefined}
        {...{ viewName, flowQueryParams }}
      />

      <TermsPrivacyAgreement legalTerms={legalTerms} />

      {!hideAccountSwitchLink && (
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

export default SigninAlternativeAuthOptions;
