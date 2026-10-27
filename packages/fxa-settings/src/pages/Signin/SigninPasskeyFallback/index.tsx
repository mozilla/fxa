/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useCallback, useEffect, useState } from 'react';

import { useForm } from 'react-hook-form';
import { Link, useLocation } from 'react-router';
import { FtlMsg, FtlMsgResolver } from 'fxa-react/lib/utils';
import LoadingSpinner from 'fxa-react/components/LoadingSpinner';
import AppLayout from '../../../components/AppLayout';
import CmsButtonWithFallback from '../../../components/CmsButtonWithFallback';
import Avatar from '../../../components/Settings/Avatar';
import { Banner } from '../../../components/Banner';
import type { BannerProps } from '../../../components/Banner/interfaces';
import InputPassword from '../../../components/InputPassword';
import GleanMetrics from '../../../lib/glean';
import { useGleanView } from '../../../lib/glean/useGleanView';
import { AuthUiErrors } from '../../../lib/auth-errors/auth-errors';
import { AccountAvatar } from '../../../lib/interfaces';
import type {
  PasskeyFallbackCause,
  PasskeyMetricsSurface,
} from '../../../lib/passkeys/signin-flow';
import { PASSKEY_TROUBLESHOOT_URL } from '../../../lib/passkeys/constants';
import { RelierCmsInfo, useFtlMsgResolver } from '../../../models';

export type SigninPasskeyFallbackContinueError = {
  errno?: number;
  localizedErrorMessage: string;
};

export type SigninPasskeyFallbackProps = {
  email?: string;
  onContinue?: (
    password: string
  ) => Promise<SigninPasskeyFallbackContinueError | void>;
  avatarData?: { account: { avatar: AccountAvatar } };
  avatarLoading?: boolean;
  passkeySurface?: PasskeyMetricsSurface;
  cmsInfo?: RelierCmsInfo;
  passkeyFallbackCause?: PasskeyFallbackCause;
};

type FormData = {
  password: string;
};

export const viewName = 'signin-passkey-fallback';

const SigninPasskeyFallback = ({
  email,
  onContinue,
  avatarData,
  avatarLoading,
  passkeySurface = 'emailfirst',
  cmsInfo,
  passkeyFallbackCause,
}: SigninPasskeyFallbackProps) => {
  const ftlMsgResolver = useFtlMsgResolver();
  const [passwordTooltipErrorText, setPasswordTooltipErrorText] = useState('');
  const [bannerErrorText, setBannerErrorText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isThrottled, setIsThrottled] = useState(false);
  const location = useLocation();

  const localizedValidPasswordError = ftlMsgResolver.getMsg(
    'auth-error-1010',
    'Valid password required'
  );

  const { handleSubmit, register, watch, formState } = useForm<FormData>({
    mode: 'onTouched',
    criteriaMode: 'all',
    defaultValues: { password: '' },
  });

  useGleanView(() =>
    GleanMetrics.passkeyEnterPassword.view({
      event: { reason: passkeySurface },
    })
  );

  const wrapUnusableBanner = getWrapUnusableBanner(
    ftlMsgResolver,
    passkeyFallbackCause
  );
  useGleanView(
    () =>
      GleanMetrics.passkeyEnterPassword.wrapUnusableBannerView({
        event: { reason: passkeyFallbackCause },
      }),
    !!wrapUnusableBanner
  );

  // Fire engage on the first keystroke into the password field. Mirrors the
  // pattern used in PostVerify/SetPassword.
  const [hasEngaged, setHasEngaged] = useState(false);
  const passwordValue = watch('password');
  useEffect(() => {
    if (!hasEngaged && passwordValue) {
      setHasEngaged(true);
      GleanMetrics.passkeyEnterPassword.engage({
        event: { reason: passkeySurface },
      });
    }
  }, [hasEngaged, passwordValue, passkeySurface]);

  const handleContinue = useCallback(
    async ({ password }: FormData) => {
      if (password === '') {
        setPasswordTooltipErrorText(localizedValidPasswordError);
        return;
      }
      if (!onContinue) return;
      GleanMetrics.passkeyEnterPassword.submit({
        event: { reason: passkeySurface },
      });
      setIsSubmitting(true);
      try {
        const result = await onContinue(password);
        if (result) {
          const { errno, localizedErrorMessage: message } = result;
          if (errno === AuthUiErrors.INCORRECT_PASSWORD.errno) {
            setBannerErrorText('');
            setPasswordTooltipErrorText(message);
          } else {
            setBannerErrorText(message);
            if (errno === AuthUiErrors.THROTTLED.errno) {
              // Only once the user has exhausted their password attempts do we
              // surface the reset path (it risks Sync data loss, so it is not
              // offered up front).
              setIsThrottled(true);
            }
          }
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [onContinue, passkeySurface, localizedValidPasswordError]
  );

  return (
    <AppLayout cmsInfo={cmsInfo}>
      {wrapUnusableBanner && <Banner {...wrapUnusableBanner} />}
      {bannerErrorText && (
        <Banner type="error" content={{ localizedHeading: bannerErrorText }} />
      )}

      <FtlMsg id="signin-passkey-fallback-header">
        <p className="text-sm text-grey-500 mb-2">Finish sign in</p>
      </FtlMsg>

      <FtlMsg id="signin-passkey-fallback-heading">
        <h1 className="card-header mb-2">Enter your password to sync</h1>
      </FtlMsg>

      <FtlMsg id="signin-passkey-fallback-body">
        <p className="text-sm mb-6">
          To keep your data safe, you need to enter your password when you use
          this passkey.
        </p>
      </FtlMsg>

      {email && (
        <div className="flex items-center gap-3 mb-6">
          {avatarLoading ? (
            <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center">
              <LoadingSpinner />
            </div>
          ) : (
            <Avatar
              className="w-10 h-10 flex-shrink-0"
              avatar={avatarData?.account?.avatar}
            />
          )}
          <span
            className="text-sm break-all"
            data-testid="passkey-fallback-email"
          >
            {email}
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit(handleContinue)}>
        <FtlMsg
          id="signin-passkey-fallback-password-label"
          attrs={{ label: true }}
        >
          <InputPassword
            label="Password"
            className="mb-6"
            errorText={
              passwordTooltipErrorText || formState.errors.password?.message
            }
            anchorPosition="start"
            tooltipPosition="bottom"
            autoFocus
            onChange={() => setPasswordTooltipErrorText('')}
            registration={register('password', {
              required: localizedValidPasswordError,
            })}
            prefixDataTestId="signin-passkey-fallback-password"
          />
        </FtlMsg>

        <FtlMsg id="signin-passkey-fallback-continue">
          <CmsButtonWithFallback
            type="submit"
            className="w-full"
            data-testid="continue-button"
            disabled={isSubmitting || !!passwordTooltipErrorText}
            buttonColor={cmsInfo?.shared.buttonColor}
          >
            Continue
          </CmsButtonWithFallback>
        </FtlMsg>
      </form>

      {isThrottled && (
        <div className="mt-6 text-sm text-center">
          <FtlMsg id="signin-passkey-fallback-forgot-password-link">
            <Link
              to={`/reset_password${location.search}`}
              className="link-blue"
              data-glean-id="signin_passkey_fallback_forgot_password"
            >
              Forgot password?
            </Link>
          </FtlMsg>
        </div>
      )}
    </AppLayout>
  );
};

export default SigninPasskeyFallback;

// Shown when the passkey has a wrap that couldn't be used on this device.
function getWrapUnusableBanner(
  ftlMsgResolver: FtlMsgResolver,
  cause?: PasskeyFallbackCause
): BannerProps | undefined {
  const link = {
    url: PASSKEY_TROUBLESHOOT_URL,
    localizedText: ftlMsgResolver.getMsg(
      'signin-passkey-fallback-wrap-unusable-link',
      'Learn more'
    ),
    gleanId: 'signin_passkey_fallback_wrap_unusable_learn_more',
  };
  if (cause === 'no_prf') {
    return {
      type: 'warning',
      content: {
        localizedHeading: ftlMsgResolver.getMsg(
          'signin-passkey-fallback-no-prf-heading',
          'Password needed on this device'
        ),
        localizedDescription: ftlMsgResolver.getMsg(
          'signin-passkey-fallback-no-prf-description',
          'This browser or device can’t use your passkey to sign in to sync on its own.'
        ),
      },
      link,
    };
  }
  if (cause === 'unwrap_failed') {
    return {
      type: 'error',
      content: {
        localizedHeading: ftlMsgResolver.getMsg(
          'signin-passkey-fallback-unwrap-failed-heading',
          'Your passkey couldn’t unlock sync'
        ),
        localizedDescription: ftlMsgResolver.getMsg(
          'signin-passkey-fallback-unwrap-failed-description',
          'Something went wrong, so you’ll need your password this time.'
        ),
      },
      link,
    };
  }
  return undefined;
}
