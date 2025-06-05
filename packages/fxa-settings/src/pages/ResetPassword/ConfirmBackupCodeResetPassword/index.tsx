/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { Dispatch, SetStateAction } from 'react';

import LinkExternal from 'fxa-react/components/LinkExternal';
import { FtlMsg } from 'fxa-react/lib/utils';
import AppLayout from '../../../components/AppLayout';
import { BackupCodesImage } from '../../../components/images';
import Banner from '../../../components/Banner';
import ButtonBack from '../../../components/ButtonBack';
import { HeadingPrimary } from '../../../components/HeadingPrimary';
import FormVerifyTotp from '../../../components/FormVerifyTotp';
import { useFtlMsgResolver } from '../../../models';

export type ConfirmBackupCodeResetPasswordProps = {
  verifyBackupCode: (code: string) => Promise<void>;
  codeErrorMessage: string;
  setCodeErrorMessage: Dispatch<SetStateAction<string>>;
};

const ConfirmBackupCodeResetPassword = ({
  verifyBackupCode,
  codeErrorMessage,
  setCodeErrorMessage,
}: ConfirmBackupCodeResetPasswordProps) => {
  const ftlMsgResolver = useFtlMsgResolver();

  return (
    <AppLayout>
      <div className="relative flex items-center">
        <ButtonBack />
        <FtlMsg id="confirm-totp-reset-password-header">
          <HeadingPrimary marginClass="">Reset your password</HeadingPrimary>
        </FtlMsg>
      </div>

      {codeErrorMessage && (
        <Banner
          type="error"
          content={{
            localizedHeading: codeErrorMessage,
          }}
          bannerId="confirm-backup-code-reset-password-error-banner"
        />
      )}
      <BackupCodesImage />

      <h2 className="font-bold text-xl">
        <FtlMsg id="confirm-backup-code-reset-password-subheader">
          Enter backup authentication code
        </FtlMsg>
      </h2>

      <p className="my-5 text-md">
        <FtlMsg id="confirm-backup-code-reset-password-instruction">
          Enter one of the one-time-use codes you saved when you set up two-step
          authentication.
        </FtlMsg>
      </p>

      <FormVerifyTotp
        codeLength={10}
        codeType={'alphanumeric'}
        errorMessage={codeErrorMessage}
        clearBanners={() => setCodeErrorMessage('')}
        setErrorMessage={setCodeErrorMessage}
        localizedInputLabel={ftlMsgResolver.getMsg(
          'confirm-backup-code-reset-password-input-label',
          'Enter 10-character code'
        )}
        localizedSubmitButtonText={ftlMsgResolver.getMsg(
          'confirm-backup-code-reset-password-confirm-button',
          'Confirm'
        )}
        verifyCode={verifyBackupCode}
        gleanDataAttrs={{
          id: 'password_reset_backup_code_submit',
        }}
        errorBannerId="confirm-backup-code-reset-password-error-banner"
        className="my-6"
      />

      <div className="mt-5 link-blue text-sm flex justify-end">
        <FtlMsg id="confirm-backup-code-reset-password-locked-out-link">
          <LinkExternal
            href="https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication"
            gleanDataAttrs={{
              id: 'password_reset_backup_code_locked_out_link',
            }}
          >
            Are you locked out?
          </LinkExternal>
        </FtlMsg>
      </div>
    </AppLayout>
  );
};

export default ConfirmBackupCodeResetPassword;
