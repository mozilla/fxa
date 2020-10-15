/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { gql } from '@apollo/client';
import { RouteComponentProps } from '@reach/router';
import { useForm } from 'react-hook-form';
import { useAlertBar, useMutation } from '../../lib/hooks';
import FlowContainer from '../FlowContainer';
import InputText from '../InputText';
import LinkExternal from 'fxa-react/components/LinkExternal';
import React, { useCallback, useEffect, useState } from 'react';
import VerifiedSessionGuard from '../VerifiedSessionGuard';
import AlertBar from '../AlertBar';
import { useSession } from 'fxa-settings/src/models';

export const CREATE_TOTP_MUTATION = gql`
  mutation createTotp($input: CreateTotpInput!) {
    createTotp(input: $input) {
      clientMutationId
      qrCodeUrl
      secret
      recoveryCodes
    }
  }
`;

type TotpForm = { totp: number };

export const PageTwoStepAuthentication = (_: RouteComponentProps) => {
  const goBack = useCallback(() => window.history.back(), []);
  const { register, handleSubmit, trigger, formState } = useForm<TotpForm>({
    mode: 'onTouched',
  });
  const isValidTotpFormat = (totp: string) => /\d{6}/.test(totp);

  const alertBar = useAlertBar();
  const [qrCodeUrl, setQrCodeUrl] = useState<string>();
  const [secret, setSecret] = useState<string>();
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);

  const onSubmit = ({ totp }: TotpForm) => {};

  const [createTotp] = useMutation(CREATE_TOTP_MUTATION, {
    onCompleted: (x) => {
      setQrCodeUrl(x.createTotp.qrCodeUrl);
      setSecret(x.createTotp.secret);
      setRecoveryCodes(x.createTotp.recoveryCodes);
    },
    onError: () => {
      alertBar.error('There was a problem retrieving your code.');
    },
  });

  const session = useSession();

  useEffect(() => {
    session.verified && createTotp({ variables: { input: {} } });
  }, [session]);

  return (
    <FlowContainer title="Two Step Authentication" subtitle="Step 1 of 3">
      {alertBar.visible && (
        <AlertBar onDismiss={alertBar.hide} type={alertBar.type}>
          <p data-testid="update-display-name-error">{alertBar.content}</p>
        </AlertBar>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <VerifiedSessionGuard onDismiss={goBack} onError={goBack} />

        <p className="mt-4 mb-4">
          Scan this QR code using one of{' '}
          <LinkExternal href="https://support.mozilla.org/kb/secure-firefox-account-two-step-authentication">
            these apps
          </LinkExternal>
          .
        </p>

        <div>
          {qrCodeUrl && (
            <img
              className="mx-auto w-40 h-40 qr-code-border"
              data-testid="2fa-qr-code"
              src={qrCodeUrl}
              alt={`Use the code ${secret} to set up two-step authentication in supported applications.`}
            />
          )}
        </div>

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
