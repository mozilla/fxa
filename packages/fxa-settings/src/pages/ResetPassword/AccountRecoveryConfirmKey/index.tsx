/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Link, useLocation } from '@reach/router';
import React, { useEffect } from 'react';
import { Control, useForm, useWatch } from 'react-hook-form';
import { FtlMsg } from 'fxa-react/lib/utils';
import { AuthUiErrors } from '../../../lib/auth-errors/auth-errors';
import GleanMetrics from '../../../lib/glean';
import { isBase32Crockford } from '../../../lib/utilities';
import { useFtlMsgResolver } from '../../../models/hooks';

import AppLayout from '../../../components/AppLayout';
import InputText from '../../../components/InputText';

import {
  AccountRecoveryConfirmKeyFormData,
  AccountRecoveryConfirmKeyProps,
} from './interfaces';
import { getLocalizedErrorMessage } from '../../../lib/error-utils';
import { RecoveryKeyImage } from '../../../components/images';
import { Constants } from '../../../lib/constants';
import Banner from '../../../components/Banner';
import { HeadingPrimary } from '../../../components/HeadingPrimary';

// TODO in FXA-7894 use sensitive data client to pass sensitive data
// Depends on FXA-7400

const RECOVERY_KEY_LENGTH = 32;

const AccountRecoveryConfirmKey = ({
  accountResetToken,
  code,
  email,
  emailToHashWith,
  errorMessage,
  estimatedSyncDeviceCount,
  recoveryKeyHint,
  isSubmitDisabled,
  recoveryKeyExists,
  setErrorMessage,
  setIsSubmitDisabled,
  verifyRecoveryKey,
  token,
  uid,
  totpExists,
}: AccountRecoveryConfirmKeyProps) => {
  const ftlMsgResolver = useFtlMsgResolver();
  const location = useLocation();

  const { control, getValues, handleSubmit, register } =
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

  const removeSpaces = (key: string) => key.replace(/\s/g, '');

  const onSubmit = () => {
    setErrorMessage('');
    const key = removeSpaces(getValues().recoveryKey);
    if (isBase32Crockford(key)) {
      setIsSubmitDisabled(true);
      GleanMetrics.passwordReset.recoveryKeySubmit();
      verifyRecoveryKey(key);
    } else {
      // if the submitted key does not match the expected format,
      // abort before submitting to the auth server
      setErrorMessage(
        getLocalizedErrorMessage(
          ftlMsgResolver,
          AuthUiErrors.INVALID_RECOVERY_KEY
        )
      );
    }
  };

  const truncateCode = (code: string) => {
    // Truncate any characters beyond the expected length of the recovery key (keeping spaces but ignoring them in the count).
    let count = 0;
    let truncatedCode = '';
    for (let i = 0; i < code.length; i++) {
      if (count === RECOVERY_KEY_LENGTH) {
        break;
      }
      if (code[i].match(/[a-zA-Z0-9]/)) {
        count++;
      }
      truncatedCode += code[i];
    }
    return truncatedCode;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (errorMessage) {
      setErrorMessage('');
    }

    const filteredCode = e.target.value
      // filter out any characters other than alphanumeric characters and spaces
      .replace(/[^a-zA-Z0-9\s]/g, '')
      // only allow single spaces
      .replace(/\s{2,}/g, ' ');

    // truncate any characters beyond the expected length of the recovery key (keeping spaces but ignoring them in the count)
    const truncatedCode = truncateCode(filteredCode);

    // update the input value to reflect the filtered and truncated code
    e.target.value = truncatedCode;

    // check if submit should be enabled/disabled
    const codeLengthWithoutSpaces = removeSpaces(truncatedCode).length;
    setIsSubmitDisabled(codeLengthWithoutSpaces !== RECOVERY_KEY_LENGTH);
  };

  const ControlledCharacterCount = ({
    control,
  }: {
    control: Control<AccountRecoveryConfirmKeyFormData>;
  }) => {
    const recoveryKey: string = useWatch({
      control,
      name: 'recoveryKey',
      defaultValue: getValues().recoveryKey,
    });
    return (
      <p className="text-end text-xs -my-2">
        {removeSpaces(recoveryKey).length}/{Constants.RECOVERY_KEY_LENGTH}
      </p>
    );
  };

  return (
    <AppLayout>
      <FtlMsg id="password-reset-flow-heading">
        <HeadingPrimary>Reset your password</HeadingPrimary>
      </FtlMsg>
      {errorMessage && (
        <Banner type="error" content={{ localizedHeading: errorMessage }} />
      )}
      <RecoveryKeyImage />
      <FtlMsg id="account-recovery-confirm-key-heading">
        <h2 className="card-header mb-2">Enter your account recovery key</h2>
      </FtlMsg>
      <FtlMsg id="account-recovery-confirm-key-instruction">
        <p className="text-sm">
          This key recovers your encrypted browsing data, such as passwords and
          bookmarks, from Firefox servers.
        </p>
      </FtlMsg>

      <form
        noValidate
        className="flex flex-col gap-4 mt-8"
        onSubmit={handleSubmit(onSubmit)}
        data-testid="account-recovery-confirm-key-form"
      >
        <ControlledCharacterCount {...{ control }} />
        <FtlMsg
          id="account-recovery-confirm-key-input-label"
          attrs={{ label: true }}
        >
          <InputText
            type="text"
            label="Enter your 32-character account recovery key"
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
            onChange={handleChange}
            hasErrors={!!errorMessage}
          />
        </FtlMsg>

        {recoveryKeyHint && (
          <div className="bg-grey-50 p-4 text-sm rounded-md">
            <FtlMsg id="account-recovery-confirm-key-hint">
              <p className="text-grey-500">Your storage hint is:</p>
            </FtlMsg>
            <p className="break-words">{recoveryKeyHint}</p>
          </div>
        )}

        <FtlMsg id="account-recovery-confirm-key-button-2">
          <button
            type="submit"
            className="cta-primary cta-xl mb-6"
            disabled={isSubmitDisabled}
          >
            Continue
          </button>
        </FtlMsg>
      </form>

      <FtlMsg id="account-recovery-lost-recovery-key-link-2">
        {totpExists ? (
          <Link
            to={`/confirm_totp_reset_password${location.search}`}
            className="link-blue text-sm"
            id="lost-recovery-key"
            state={{
              accountResetToken,
              code,
              email,
              emailToHashWith,
              estimatedSyncDeviceCount,
              recoveryKeyExists,
              recoveryKeyHint,
              token,
              uid,
            }}
            onClick={() => GleanMetrics.passwordReset.recoveryKeyCannotFind()}
          >
            Can’t find your account recovery key?
          </Link>
        ) : (
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
              recoveryKeyHint,
              token,
              uid,
            }}
            onClick={() => GleanMetrics.passwordReset.recoveryKeyCannotFind()}
          >
            Can’t find your account recovery key?
          </Link>
        )}
      </FtlMsg>
    </AppLayout>
  );
};

export default AccountRecoveryConfirmKey;
