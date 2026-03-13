/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useState, useCallback } from 'react';
import { RouteComponentProps } from '@reach/router';
import { FtlMsg } from 'fxa-react/lib/utils';
import { useFtlMsgResolver, useAuthClient } from '../../../models';
import { usePageViewEvent } from '../../../lib/metrics';
import { TwoFactorAuthImage } from '../../../components/images';
import CardHeader from '../../../components/CardHeader';
import FormVerifyCode, {
  FormAttributes,
} from '../../../components/FormVerifyCode';
import { MozServices } from '../../../lib/types';
import { REACT_ENTRYPOINT } from '../../../constants';
import { useNavigateWithQuery } from '../../../lib/hooks/useNavigateWithQuery';
import { Integration } from '../../../models';
import { getBasicAccountData } from '../../../lib/account-storage';

export type AuthTotpProps = {
  email?: string;
  serviceName?: MozServices;
  onVerified?: () => void;
  integration?: Integration;
};

export const viewName = 'pair.auth.totp';

const AuthTotp = ({
  email,
  serviceName,
  onVerified,
}: AuthTotpProps & RouteComponentProps) => {
  usePageViewEvent(viewName, REACT_ENTRYPOINT);
  const navigateWithQuery = useNavigateWithQuery();
  const authClient = useAuthClient();
  const [codeErrorMessage, setCodeErrorMessage] = useState('');

  const ftlMsgResolver = useFtlMsgResolver();
  const localizedCustomCodeRequiredMessage = ftlMsgResolver.getMsg(
    'auth-totp-code-required-error',
    'Authentication code required'
  );

  const formAttributes: FormAttributes = {
    inputFtlId: 'auth-totp-input-label',
    inputLabelText: 'Enter 6-digit code',
    pattern: '[0-9]{6}',
    maxLength: 6,
    submitButtonFtlId: 'auth-totp-confirm-button',
    submitButtonText: 'Confirm',
  };

  const onSubmit = useCallback(
    async (code: string) => {
      try {
        const accountData = getBasicAccountData();
        if (!accountData?.sessionToken) {
          setCodeErrorMessage('Session expired. Please sign in again.');
          return;
        }

        const result = await authClient.verifyTotpCode(
          accountData.sessionToken,
          code,
          { service: 'pair' }
        );

        if (!result.success) {
          setCodeErrorMessage(
            ftlMsgResolver.getMsg(
              'auth-totp-invalid-code',
              'Invalid authentication code'
            )
          );
          return;
        }

        if (onVerified) {
          onVerified();
        } else {
          navigateWithQuery('/pair/auth/allow', {
            state: { totpComplete: true },
          });
        }
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'Invalid code';
        setCodeErrorMessage(message);
      }
    },
    [authClient, ftlMsgResolver, navigateWithQuery, onVerified]
  );

  return (
    <>
      <CardHeader
        headingWithDefaultServiceFtlId="auth-totp-heading-w-default-service"
        headingWithCustomServiceFtlId="auth-totp-heading-w-custom-service"
        headingText="Enter authentication code"
        serviceName={serviceName}
      />

      <main>
        <div className="flex justify-center mx-auto">
          <TwoFactorAuthImage className="w-3/5" />
        </div>

        <FtlMsg id="auth-totp-instruction">
          <p id="totp-code-instruction" className="my-5 text-sm">
            Open your authentication app and enter the authentication code it
            provides.
          </p>
        </FtlMsg>

        <FormVerifyCode
          formAttributes={formAttributes}
          viewName={viewName}
          verifyCode={onSubmit}
          localizedCustomCodeRequiredMessage={localizedCustomCodeRequiredMessage}
          codeErrorMessage={codeErrorMessage}
          setCodeErrorMessage={setCodeErrorMessage}
        />
      </main>
    </>
  );
};

export default AuthTotp;
