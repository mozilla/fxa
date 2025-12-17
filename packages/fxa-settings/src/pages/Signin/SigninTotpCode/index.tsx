/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useEffect, useState } from 'react';
import { Link, RouteComponentProps, useLocation } from '@reach/router';
import { FtlMsg } from 'fxa-react/lib/utils';
import { useAlertBar, useFtlMsgResolver, useSession } from '../../../models';
import { logViewEvent } from '../../../lib/metrics';
import { MozServices } from '../../../lib/types';
import firefox from '../../../lib/channels/firefox';
import AppLayout from '../../../components/AppLayout';
import GleanMetrics from '../../../lib/glean';
import { SigninIntegration, SigninLocationState } from '../interfaces';
import { useNavigateWithQuery } from '../../../lib/hooks/useNavigateWithQuery';
import { handleNavigation } from '../utils';
import { FinishOAuthFlowHandler } from '../../../lib/oauth/hooks';
import { storeAccountData } from '../../../lib/storage-utils';
import {
  getLocalizedErrorMessage,
  HandledError,
} from '../../../lib/error-utils';
import protectionShieldIcon from '@fxa/shared/assets/images/protection-shield.svg';
import Banner from '../../../components/Banner';
import { SensitiveData } from '../../../lib/sensitive-data-client';
import { HeadingPrimary } from '../../../components/HeadingPrimary';
import FormVerifyTotp from '../../../components/FormVerifyTotp';

// TODO: show a banner success message if a user is coming from reset password
// in FXA-6491. This differs from content-server where currently, users only
// get an email confirmation with no success message.

export type SigninTotpCodeProps = {
  finishOAuthFlowHandler: FinishOAuthFlowHandler;
  integration: SigninIntegration;
  redirectTo?: string;
  signinState: SigninLocationState;
  // TODO: Switch to gql error shaped object
  submitTotpCode: (totpCode: string) => Promise<{ error?: HandledError }>;
  serviceName?: MozServices;
  setCurrentSplitLayout?: (value: boolean) => void;
} & SensitiveData.AuthData;

export const viewName = 'signin-totp-code';

export const SigninTotpCode = ({
  finishOAuthFlowHandler,
  integration,
  redirectTo,
  signinState,
  submitTotpCode,
  keyFetchToken,
  unwrapBKey,
  setCurrentSplitLayout,
}: SigninTotpCodeProps & RouteComponentProps) => {
  const ftlMsgResolver = useFtlMsgResolver();
  const location = useLocation();
  const navigateWithQuery = useNavigateWithQuery();
  const session = useSession();
  const isSessionAALUpgrade = signinState.isSessionAALUpgrade;
  const alertBar = useAlertBar();

  const [bannerError, setBannerError] = useState<string>('');

  const handleSignOut = async () => {
    try {
      setBannerError('');
      await session.destroy();
      // Send a logout event to Firefox even if the user is in a non-Sync flow.
      // If the user is signed into the browser, they need to drop the now
      // destroyed session token. Mobile users will have the web view closed
      // and can start the signin process from the menu.
      firefox.fxaLogout({ uid: signinState.uid });
      navigateWithQuery('/');
    } catch (error) {
      setBannerError(
        ftlMsgResolver.getMsg(
          'signin-totp-code-aal-sign-out-error',
          'Sorry, there was a problem signing you out'
        )
      );
    }
  };

  const localizedBannerAALUpgrade = isSessionAALUpgrade
    ? {
        header: ftlMsgResolver.getMsg(
          'signin-totp-code-aal-banner-header',
          'Why are you being asked to authenticate?'
        ),
        content: ftlMsgResolver.getMsg(
          'signin-totp-code-aal-banner-content',
          'You set up two-step authentication on your account, but haven’t signed in with a code on this device yet.'
        ),
      }
    : undefined;

  useEffect(() => {
    GleanMetrics.totpForm.view();
  }, []);

  const onSubmit = async (code: string) => {
    setBannerError('');

    const { error } = await submitTotpCode(code);
    GleanMetrics.totpForm.submit();
    logViewEvent('flow', `${viewName}.submit`);

    if (error) {
      setBannerError(getLocalizedErrorMessage(ftlMsgResolver, error));
      return;
    } else {
      // Clear lingering error alert caused by insufficient AAL error (see FXA-12707)
      if (isSessionAALUpgrade) {
        alertBar.hide();
      }

      GleanMetrics.totpForm.success();

      const {
        email,
        uid,
        sessionToken,
        verificationMethod,
        verificationReason,
        showInlineRecoveryKeySetup,
      } = signinState;

      storeAccountData({
        sessionToken,
        email,
        uid,
        // Update verification status of stored current account
        verified: true,
      });

      const navigationOptions = {
        email,
        signinData: {
          uid,
          sessionToken,
          verificationReason,
          verificationMethod,
          emailVerified: true,
          sessionVerified: true,
          keyFetchToken,
        },
        unwrapBKey,
        integration,
        finishOAuthFlowHandler,
        redirectTo,
        queryParams: location.search,
        showInlineRecoveryKeySetup,
        isSessionAALUpgrade,
        handleFxaLogin: true,
        handleFxaOAuthLogin: true,
        performNavigation: !integration.isFirefoxMobileClient(),
      };

      const { error: navError } = await handleNavigation(navigationOptions);
      if (navError) {
        setBannerError(getLocalizedErrorMessage(ftlMsgResolver, navError));
      }
    }
  };

  const cmsInfo = integration.getCmsInfo();
  const title = cmsInfo?.SigninTotpCodePage?.pageTitle;
  const splitLayout = cmsInfo?.SigninTotpCodePage?.splitLayout;

  return (
    <AppLayout {...{ cmsInfo, title, splitLayout, setCurrentSplitLayout }}>
      {cmsInfo ? (
        <>
          {cmsInfo.shared.logoUrl && cmsInfo.shared.logoAltText && (
            <img
              src={cmsInfo.shared.logoUrl}
              alt={cmsInfo.shared.logoAltText}
              className="justify-start mb-4 max-h-[40px]"
            />
          )}
        </>
      ) : (
        <FtlMsg id="signin-totp-code-header">
          <HeadingPrimary>Sign in</HeadingPrimary>
        </FtlMsg>
      )}

      <FtlMsg id="signin-totp-code-subheader-v2">
        <h2 className="card-header">Enter two-step authentication code</h2>
      </FtlMsg>

      {isSessionAALUpgrade && localizedBannerAALUpgrade && (
        <Banner
          type="info"
          content={{
            localizedHeading: localizedBannerAALUpgrade.header,
            localizedDescription: localizedBannerAALUpgrade.content,
          }}
        />
      )}

      <div className="flex space-x-4">
        <img src={protectionShieldIcon} alt="" />
        <FtlMsg id="signin-totp-code-instruction-v4">
          <p className="mt-5 text-md">
            Check your <strong>authenticator app</strong> to confirm your
            sign-in.
          </p>
        </FtlMsg>
      </div>

      {integration.isFirefoxClientServiceRelay() && (
        <FtlMsg id="signin-totp-code-desktop-relay">
          <p className="mt-2 mb-4 text-sm">
            Firefox will try sending you back to use an email mask after you
            sign in.
          </p>
        </FtlMsg>
      )}

      {bannerError && (
        <Banner type="error" content={{ localizedHeading: bannerError }} />
      )}

      <FormVerifyTotp
        codeLength={6}
        codeType="numeric"
        errorMessage={bannerError}
        localizedInputLabel={ftlMsgResolver.getMsg(
          'signin-totp-code-input-label-v4',
          'Enter 6-digit code'
        )}
        localizedSubmitButtonText={ftlMsgResolver.getMsg(
          'signin-totp-code-confirm-button',
          'Confirm'
        )}
        setErrorMessage={setBannerError}
        verifyCode={onSubmit}
        className="my-6"
        cmsButton={{
          color: cmsInfo?.shared.buttonColor,
        }}
      />
      <div className="mt-8 link-blue text-sm flex justify-between">
        {!isSessionAALUpgrade ? (
          <FtlMsg id="signin-totp-code-other-account-link">
            {/* TODO in FXA-8636 replace with Link component once index reactified */}
            <a
              href="/"
              className="text-sm link-blue"
              data-glean-id="login_totp_code_different_account_link"
              onClick={(e) => {
                e.preventDefault();
                navigateWithQuery('/', {
                  state: {
                    prefillEmail: signinState.email,
                  },
                });
              }}
            >
              Use a different account
            </a>
          </FtlMsg>
        ) : (
          <FtlMsg id="signin-totp-code-aal-sign-out">
            {/* If this is a session AAL upgrade, do not offer to use a different account, only
              sign out. This was a redirect from Settings and we do not reliably have Sync oauth
              query parameters in desktop or mobile to initiate a Sync login, or even be able to
              tell that it's a Sync integration */}
            <button
              className="link-blue"
              data-glean-id="login_totp_code_aal_sign_out"
              onClick={handleSignOut}
            >
              Sign out of this account
            </button>
          </FtlMsg>
        )}
        <FtlMsg id="signin-totp-code-recovery-code-link">
          <Link
            to={`/signin_recovery_choice${location.search}`}
            state={signinState}
            className="text-end"
            data-glean-id="login_totp_code_trouble_link"
          >
            Trouble entering code?
          </Link>
        </FtlMsg>
      </div>
    </AppLayout>
  );
};

export default SigninTotpCode;
