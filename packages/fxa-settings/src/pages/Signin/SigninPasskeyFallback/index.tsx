/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useCallback, useState } from 'react';
import { RouteComponentProps } from '@reach/router';
import { useForm } from 'react-hook-form';
import { FtlMsg } from 'fxa-react/lib/utils';
import AppLayout from '../../../components/AppLayout';
import { Banner } from '../../../components/Banner';
import InputPassword from '../../../components/InputPassword';

export type SigninPasskeyFallbackProps = {
  email?: string;
  onContinue?: (password: string) => Promise<void>;
  onGoToSettings?: () => void;
  localizedErrorMessage?: string;
};

type FormData = {
  password: string;
};

export const viewName = 'signin-passkey-fallback';

const SigninPasskeyFallback = ({
  email,
  onContinue,
  onGoToSettings,
  localizedErrorMessage,
}: SigninPasskeyFallbackProps & RouteComponentProps) => {
  const [passwordErrorText, setPasswordErrorText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { handleSubmit, register } = useForm<FormData>({
    mode: 'onTouched',
    criteriaMode: 'all',
    defaultValues: { password: '' },
  });

  const handleContinue = useCallback(
    async (data: FormData) => {
      if (!onContinue) return;
      setIsSubmitting(true);
      try {
        await onContinue(data.password);
      } finally {
        setIsSubmitting(false);
      }
    },
    [onContinue]
  );

  return (
    <AppLayout>
      {localizedErrorMessage && (
        <Banner
          type="error"
          content={{ localizedHeading: localizedErrorMessage }}
        />
      )}

      <FtlMsg id="signin-passkey-fallback-header">
        <p className="text-sm text-grey-500 mb-2">Finish sign in</p>
      </FtlMsg>

      <FtlMsg id="signin-passkey-fallback-heading">
        <h1 className="card-header mb-4">Enter your password to sync</h1>
      </FtlMsg>

      {email && (
        <p
          className="text-sm mb-2 break-all"
          data-testid="passkey-fallback-email"
        >
          {email}
        </p>
      )}

      <FtlMsg id="signin-passkey-fallback-body">
        <p className="text-sm mb-6">
          To keep your data safe, you need to enter your password when you use
          this passkey.
        </p>
      </FtlMsg>

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

        <div className="flex flex-col tablet:flex-row gap-4">
          <FtlMsg id="signin-passkey-fallback-go-to-settings">
            <button
              type="button"
              className="cta-neutral cta-base-p tablet:flex-1"
              onClick={onGoToSettings}
              data-testid="go-to-settings-button"
              disabled={isSubmitting}
            >
              Go to settings
            </button>
          </FtlMsg>

          <FtlMsg id="signin-passkey-fallback-continue">
            <button
              type="submit"
              className="cta-primary cta-base-p tablet:flex-1"
              data-testid="continue-button"
              disabled={isSubmitting}
            >
              Continue
            </button>
          </FtlMsg>
        </div>
      </form>
    </AppLayout>
  );
};

export default SigninPasskeyFallback;
