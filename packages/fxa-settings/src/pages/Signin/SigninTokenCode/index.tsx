/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useCallback, useEffect, useState } from 'react';
import { RouteComponentProps, useLocation } from '@reach/router';
import { FtlMsg } from 'fxa-react/lib/utils';
import { useFtlMsgResolver, useSession } from '../../../models';
import { usePageViewEvent } from '../../../lib/metrics';
import { MailImage } from '../../../components/images';
import FormVerifyCode, {
  FormAttributes,
} from '../../../components/FormVerifyCode';
import { REACT_ENTRYPOINT } from '../../../constants';
import CardHeader from '../../../components/CardHeader';
import GleanMetrics from '../../../lib/glean';
import AppLayout from '../../../components/AppLayout';
import { SigninTokenCodeProps } from './interfaces';
import { AuthUiErrors } from '../../../lib/auth-errors/auth-errors';
import Banner, {
  BannerProps,
  BannerType,
  ResendEmailSuccessBanner,
} from '../../../components/Banner';
import { handleNavigation } from '../utils';
import firefox from '../../../lib/channels/firefox';
import { getLocalizedErrorMessage } from '../../../lib/error-utils';

export const viewName = 'signin-token-code';

const SIX_DIGIT_NUMBER_REGEX = /^\d{6}$/;

const SigninTokenCode = ({
  finishOAuthFlowHandler,
  integration,
  signinState,
}: SigninTokenCodeProps & RouteComponentProps) => {
  usePageViewEvent(viewName, REACT_ENTRYPOINT);
  const session = useSession();
  const location = useLocation();

  const {
    email,
    uid,
    sessionToken,
    verificationReason,
    keyFetchToken,
    unwrapBKey,
  } = signinState;

  const [banner, setBanner] = useState<Partial<BannerProps>>({
    type: undefined,
    children: undefined,
  });
  const [animateBanner, setAnimateBanner] = useState(false);
  const [codeErrorMessage, setCodeErrorMessage] = useState<string>('');
  const [resendCodeLoading, setResendCodeLoading] = useState<boolean>(false);

  const ftlMsgResolver = useFtlMsgResolver();
  const localizedCustomCodeRequiredMessage = ftlMsgResolver.getMsg(
    'signin-token-code-required-error',
    'Confirmation code required'
  );
  const localizedInvalidCode = getLocalizedErrorMessage(
    ftlMsgResolver,
    AuthUiErrors.INVALID_VERIFICATION_CODE
  );

  const formAttributes: FormAttributes = {
    inputFtlId: 'signin-token-code-input-label-v2',
    inputLabelText: 'Enter 6-digit code',
    pattern: '[0-9]{6}',
    maxLength: 6,
    submitButtonFtlId: 'signin-token-code-confirm-button',
    submitButtonText: 'Confirm',
  };

  useEffect(() => {
    GleanMetrics.loginConfirmation.view();
  }, []);

  useEffect(() => {
    (async () => {
      if (integration.isSync()) {
        await firefox.fxaLogin({
          email,
          // keyFetchToken and unwrapBKey should always exist if Sync integration
          keyFetchToken: keyFetchToken!,
          unwrapBKey: unwrapBKey!,
          sessionToken,
          uid,
          verified: false,
        });
      }
    })();
    // Only send webchannel message if sync on initial render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAnimationEnd = () => {
    // We add the "shake" animation to bring attention to the success banner
    // when the success banner was already displayed. We have to remove the
    // class once the animation completes or the animation won't replay.
    setAnimateBanner(false);
  };

  const handleResendCode = async () => {
    setResendCodeLoading(true);
    try {
      await session.sendVerificationCode();
      if (banner.type === BannerType.success) {
        setAnimateBanner(true);
      } else {
        setBanner({
          type: BannerType.success,
        });
      }
    } catch (error) {
      const localizedErrorMessage =
        error.errno === AuthUiErrors.THROTTLED.errno
          ? getLocalizedErrorMessage(ftlMsgResolver, error)
          : ftlMsgResolver.getMsg(
              'link-expired-resent-code-error-message',
              'Something went wrong. A new code could not be sent.'
            );
      setBanner({
        type: BannerType.error,
        children: <p>{localizedErrorMessage}</p>,
      });
    } finally {
      setResendCodeLoading(false);
    }
  };

  const onSubmit = useCallback(
    async (code: string) => {
      if (!SIX_DIGIT_NUMBER_REGEX.test(code)) {
        setCodeErrorMessage(localizedInvalidCode);
        return;
      }

      GleanMetrics.loginConfirmation.submit();
      try {
        await session.verifySession(code);

        // TODO: Bounced email redirect to `/signin_bounced`. Try
        // reaching signin_token_code in one browser and deleting the account
        // in another. You reach the "Sorry. We've locked your account" screen
        GleanMetrics.loginConfirmation.success();

        const navigationOptions = {
          email,
          signinData: {
            uid,
            sessionToken,
            verificationReason,
            verified: true,
            keyFetchToken,
          },
          unwrapBKey,
          integration,
          finishOAuthFlowHandler,
          queryParams: location.search,
        };

        await GleanMetrics.isDone();

        const { error: navError } = await handleNavigation(navigationOptions);
        if (navError) {
          const localizedError = getLocalizedErrorMessage(
            ftlMsgResolver,
            navError
          );
          setBanner({
            type: BannerType.error,
            children: <p>{localizedError}</p>,
          });
        }
      } catch (error) {
        const localizedErrorMessage = getLocalizedErrorMessage(
          ftlMsgResolver,
          error
        );
        if (error.errno === AuthUiErrors.THROTTLED.errno) {
          setBanner({
            type: BannerType.error,
            children: <p>{localizedErrorMessage}</p>,
          });
        } else {
          setCodeErrorMessage(localizedErrorMessage);
        }
      }
    },
    [
      email,
      finishOAuthFlowHandler,
      ftlMsgResolver,
      integration,
      keyFetchToken,
      localizedInvalidCode,
      location.search,
      session,
      sessionToken,
      uid,
      unwrapBKey,
      verificationReason,
    ]
  );

  return (
    <AppLayout>
      <CardHeader
        headingText="Enter confirmation code"
        headingAndSubheadingFtlId="signin-token-code-heading-2"
      />
      {banner.type === BannerType.success && banner.children === undefined && (
        <ResendEmailSuccessBanner
          animation={{
            handleAnimationEnd,
            animate: animateBanner,
            className: 'animate-shake',
          }}
        />
      )}
      {banner.type && banner.children && (
        <Banner type={banner.type}>{banner.children}</Banner>
      )}

      <div className="flex justify-center mx-auto">
        <MailImage className="w-3/5" />
      </div>

      <FtlMsg id="signin-token-code-instruction" vars={{ email }}>
        <p id="verification-email-message" className="m-5 text-sm">
          Enter the code that was sent to {email} within 5 minutes.
        </p>
      </FtlMsg>

      <FormVerifyCode
        {...{
          formAttributes,
          viewName,
          verifyCode: onSubmit,
          localizedCustomCodeRequiredMessage,
          codeErrorMessage,
          setCodeErrorMessage,
        }}
      />

      <div className="animate-delayed-fade-in opacity-0 mt-5 text-grey-500 text-xs inline-flex gap-1">
        <FtlMsg id="signin-token-code-code-expired">
          <p>Code expired?</p>
        </FtlMsg>
        <FtlMsg id="signin-token-code-resend-code-link">
          <button
            className="link-blue"
            onClick={handleResendCode}
            disabled={resendCodeLoading}
          >
            Email new code.
          </button>
        </FtlMsg>
      </div>
    </AppLayout>
  );
};

export default SigninTokenCode;
