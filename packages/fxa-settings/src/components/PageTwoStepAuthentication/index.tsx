/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { RouteComponentProps } from '@reach/router';
import LinkExternal from 'fxa-react/components/LinkExternal';
import React, { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import FlowContainer from '../FlowContainer';
import InputText from '../InputText';
import VerifiedSessionGuard from '../VerifiedSessionGuard';

type TotpForm = { totp: number };

export const PageTwoStepAuthentication = (_: RouteComponentProps) => {
  const goBack = useCallback(() => window.history.back(), []);
  const { register, handleSubmit, trigger, formState } = useForm<TotpForm>({
    mode: 'onTouched',
  });

  const isValidTotpFormat = (totp: string) => /\d{6}/.test(totp);
  const onSubmit = ({ totp }: TotpForm) => {};

  return (
    <FlowContainer title="Two Step Authentication" subtitle="Step 1 of 3">
      <form onSubmit={handleSubmit(onSubmit)}>
        <VerifiedSessionGuard onDismiss={goBack} onError={goBack} />

        <p className="mt-4 mb-4">
          Scan this QR code using one of{' '}
          <LinkExternal href="https://support.mozilla.org/kb/secure-firefox-account-two-step-authentication">
            these apps
          </LinkExternal>
          .
        </p>

        <div>{/* QR CODE HERE */}</div>

        <p className="mt-4">
          Now enter the security code from the authentication app.
        </p>

        <div className="mt-4 mb-6" data-testid="recovery-key-input">
          <InputText
            name="totp"
            label="Enter security code"
            prefixDataTestId="totp"
            maxLength={6}
            onChange={() => trigger('totp')}
            inputRef={register({
              validate: isValidTotpFormat,
            })}
          />
        </div>

        <div className="flex justify-center mb-4 mx-auto max-w-64">
          <button
            type="button"
            className="cta-neutral mx-2 flex-1"
            onClick={() => window.history.back()}
          >
            Cancel
          </button>
          <button
            type="submit"
            data-testid="submit-totp"
            className="cta-primary mx-2 flex-1"
            disabled={!formState.isDirty || !formState.isValid}
          >
            Continue
          </button>
        </div>
      </form>
    </FlowContainer>
  );
};

export default PageTwoStepAuthentication;
