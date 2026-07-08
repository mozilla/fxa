/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useCallback, useEffect, useState } from 'react';

import { useForm } from 'react-hook-form';
import { FtlMsg } from 'fxa-react/lib/utils';
import LoadingSpinner from 'fxa-react/components/LoadingSpinner';
import AppLayout from '../../../components/AppLayout';
import Avatar from '../../../components/Settings/Avatar';
import { Banner } from '../../../components/Banner';
import InputPassword from '../../../components/InputPassword';
import GleanMetrics from '../../../lib/glean';
import { AccountAvatar } from '../../../lib/interfaces';
import { PasskeyMetricsSurface } from '../../../lib/passkeys/signin-flow';
import { EnterPasswordReason } from '../interfaces';

export type SigninPasskeyFallbackProps = {
  email?: string;
  onContinue?: (password: string) => Promise<void>;
  localizedErrorMessage?: string;
  avatarData?: { account: { avatar: AccountAvatar } };
  avatarLoading?: boolean;
  passkeySurface?: PasskeyMetricsSurface;
  /**
   * Why this page is shown. `passkey` (default) keeps the passkey copy + Glean
   * events; `resume` (Turn-on-Sync) shows generic copy and skips passkey metrics.
   */
  reason?: EnterPasswordReason;
};

type FormData = {
  password: string;
};

export const viewName = 'signin-passkey-fallback';

const SigninPasskeyFallback = ({
  email,
  onContinue,
  localizedErrorMessage,
  avatarData,
  avatarLoading,
  passkeySurface = 'emailfirst',
  reason = 'passkey',
}: SigninPasskeyFallbackProps) => {
  const [passwordErrorText, setPasswordErrorText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { handleSubmit, register, watch } = useForm<FormData>({
    mode: 'onTouched',
    criteriaMode: 'all',
    defaultValues: { password: '' },
  });

  useEffect(() => {
    if (reason !== 'passkey') return;
    GleanMetrics.passkeyEnterPassword.view({
      event: { reason: passkeySurface },
    });
  }, [reason, passkeySurface]);

  // Fire engage on the first keystroke into the password field. Mirrors the
  // pattern used in PostVerify/SetPassword.
  const [hasEngaged, setHasEngaged] = useState(false);
  const passwordValue = watch('password');
  useEffect(() => {
    if (reason === 'passkey' && !hasEngaged && passwordValue) {
      setHasEngaged(true);
      GleanMetrics.passkeyEnterPassword.engage({
        event: { reason: passkeySurface },
      });
    }
  }, [reason, hasEngaged, passwordValue, passkeySurface]);

  const handleContinue = useCallback(
    async (data: FormData) => {
      if (!onContinue) return;
      if (reason === 'passkey') {
        GleanMetrics.passkeyEnterPassword.submit({
          event: { reason: passkeySurface },
        });
      }
      setIsSubmitting(true);
      try {
        await onContinue(data.password);
      } finally {
        setIsSubmitting(false);
      }
    },
    [onContinue, passkeySurface, reason]
  );

  return (
    <AppLayout>
      {localizedErrorMessage && (
        <Banner
          type="error"
          content={{ localizedHeading: localizedErrorMessage }}
        />
      )}

      {reason === 'passkey' && (
        <FtlMsg id="signin-passkey-fallback-header">
          <p className="text-sm text-grey-500 mb-2">Finish sign in</p>
        </FtlMsg>
      )}

      <FtlMsg id="signin-passkey-fallback-heading">
        <h1 className="card-header mb-2">Enter your password to sync</h1>
      </FtlMsg>

      {reason === 'passkey' ? (
        <FtlMsg id="signin-passkey-fallback-body">
          <p className="text-sm mb-6">
            To keep your data safe, you need to enter your password when you use
            this passkey.
          </p>
        </FtlMsg>
      ) : (
        <FtlMsg id="signin-fallback-enter-password-body">
          <p className="text-sm mb-6">
            Your password encrypts your synced data so only you can access it.
          </p>
        </FtlMsg>
      )}

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
            name="password"
            label="Password"
            className="mb-6"
            errorText={passwordErrorText}
            anchorPosition="start"
            autoFocus
            onChange={() => setPasswordErrorText('')}
            inputRef={register({ required: true })}
            prefixDataTestId="password"
          />
        </FtlMsg>

        <FtlMsg id="signin-passkey-fallback-continue">
          <button
            type="submit"
            className="cta-primary cta-xl w-full"
            data-testid="continue-button"
            disabled={isSubmitting}
          >
            Continue
          </button>
        </FtlMsg>
      </form>
    </AppLayout>
  );
};

export default SigninPasskeyFallback;
