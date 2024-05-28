/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Link, useLocation } from '@reach/router';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FtlMsg } from 'fxa-react/lib/utils';
import { AuthUiErrors } from '../../../lib/auth-errors/auth-errors';
import GleanMetrics from '../../../lib/glean';
import { isBase32Crockford } from '../../../lib/utilities';
import { useFtlMsgResolver } from '../../../models/hooks';

import AppLayout from '../../../components/AppLayout';
import Banner, { BannerType } from '../../../components/Banner';
import CardHeader from '../../../components/CardHeader';
import InputText from '../../../components/InputText';
import WarningMessage from '../../../components/WarningMessage';

import {
  AccountRecoveryConfirmKeyFormData,
  AccountRecoveryConfirmKeyProps,
} from './interfaces';
import { getLocalizedErrorMessage } from '../../../lib/error-utils';

const AccountRecoveryConfirmKey = ({
  accountResetToken,
  code,
  email,
  emailToHashWith,
  errorMessage,
  estimatedSyncDeviceCount,
  isSubmitting,
  recoveryKeyExists,
  serviceName,
  setErrorMessage,
  setIsSubmitting,
  verifyRecoveryKey,
  token,
  uid,
}: AccountRecoveryConfirmKeyProps) => {
  const ftlMsgResolver = useFtlMsgResolver();
  const location = useLocation();

  const { getValues, handleSubmit, register, formState } =
    useForm<AccountRecoveryConfirmKeyFormData>({
      mode: 'onChange',
      criteriaMode: 'all',
      defaultValues: {
        recoveryKey: '',
      },
    });

  useEffect(() => {
    GleanMetrics.passwordReset.recoveryKeyView();
  }, []);

  const onSubmit = () => {
    setErrorMessage('');
    // When users create their recovery key, the copyable output has spaces and we
    // display it visually this way to users as well for easier reading. Strip that
    // from here for less copy-and-paste friction for users.
    const recoveryKey = getValues('recoveryKey').replace(/\s/g, '');

    if (recoveryKey.length === 32 && isBase32Crockford(recoveryKey)) {
      setIsSubmitting(true);
      GleanMetrics.passwordReset.recoveryKeySubmit();
      verifyRecoveryKey(recoveryKey);
    } else {
      // if the submitted key does not match the expected format,
      // abort before submitting to the auth server
      const localizedErrorMessage = getLocalizedErrorMessage(
        ftlMsgResolver,
        AuthUiErrors.INVALID_RECOVERY_KEY
      );
      setErrorMessage(localizedErrorMessage);
      setIsSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <CardHeader
        headingWithDefaultServiceFtlId="account-recovery-confirm-key-heading-w-default-service"
        headingWithCustomServiceFtlId="account-recovery-confirm-key-heading-w-custom-service"
        headingText="Reset password with account recovery key"
        {...{ serviceName }}
      />

      {errorMessage && <Banner type={BannerType.error}>{errorMessage}</Banner>}

      <FtlMsg id="account-recovery-confirm-key-instructions-2">
        <p className="mt-4 text-sm">
          Please enter the one time use account recovery key you stored in a
          safe place to regain access to your Mozilla account.
        </p>
      </FtlMsg>
      <WarningMessage
        warningMessageFtlId="account-recovery-confirm-key-warning-message"
        warningType="Note:"
      >
        If you reset your password and don’t have account recovery key saved,
        some of your data will be erased (including synced server data like
        history and bookmarks).
      </WarningMessage>

      <form
        noValidate
        className="flex flex-col gap-4"
        onSubmit={handleSubmit(onSubmit)}
        data-testid="account-recovery-confirm-key-form"
      >
        <FtlMsg id="account-recovery-confirm-key-input" attrs={{ label: true }}>
          <InputText
            type="text"
            label="Enter account recovery key"
            name="recoveryKey"
            autoFocus
            // Crockford base32 encoding is case insensitive, so visually display as
            // uppercase here but don't bother transforming the submit data to match
            inputOnlyClassName="font-mono uppercase"
            className="text-start"
            autoComplete="off"
            spellCheck={false}
            prefixDataTestId="account-recovery-confirm-key"
            inputRef={register({ required: true })}
          />
        </FtlMsg>

        <FtlMsg id="account-recovery-confirm-key-button">
          <button
            type="submit"
            className="cta-primary cta-xl mb-6"
            disabled={
              isSubmitting ||
              !formState.isDirty ||
              !!formState.errors.recoveryKey
            }
          >
            Confirm account recovery key
          </button>
        </FtlMsg>
      </form>

      <FtlMsg id="account-recovery-lost-recovery-key-link">
        <Link
          to={`/complete_reset_password${location.search}`}
          className="link-blue text-sm"
          id="lost-recovery-key"
          state={{
            accountResetToken,
            code,
            email,
            emailToHashWith,
            estimatedSyncDeviceCount,
            recoveryKeyExists,
            token,
            uid,
          }}
          onClick={() => GleanMetrics.passwordReset.recoveryKeyCannotFind()}
        >
          Don’t have an account recovery key?
        </Link>
      </FtlMsg>
    </AppLayout>
  );
};

export default AccountRecoveryConfirmKey;
