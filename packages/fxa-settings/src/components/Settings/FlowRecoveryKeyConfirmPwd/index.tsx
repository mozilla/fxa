/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useCallback, useEffect, useState } from 'react';
import { useErrorHandler } from 'react-error-boundary';
import FlowContainer from '../FlowContainer';
import ProgressBar from '../ProgressBar';
import { FtlMsg } from 'fxa-react/lib/utils';
import { useAccount, useFtlMsgResolver } from '../../../models';
import { useForm } from 'react-hook-form';
import { logViewEvent } from '../../../lib/metrics';
import { AuthUiErrors } from '../../../lib/auth-errors/auth-errors';
import InputPassword from '../../InputPassword';
import { PasswordImage } from '../../images';
import { RecoveryKeyAction } from '../PageRecoveryKeyCreate';
import { Link } from '@reach/router';
import { SETTINGS_PATH } from '../../../constants';
import { getLocalizedErrorMessage } from '../../../lib/error-utils';
import { formatRecoveryKey } from '../../../lib/utilities';
import Banner from '../../Banner';

type FormData = {
  password: string;
};

export type FlowRecoveryKeyConfirmPwdProps = {
  localizedBackButtonTitle: string;
  localizedPageTitle: string;
  navigateBackward: () => void;
  navigateForward: () => void;
  setFormattedRecoveryKey: React.Dispatch<React.SetStateAction<string>>;
  viewName: string;
};

export const FlowRecoveryKeyConfirmPwd = ({
  localizedBackButtonTitle,
  localizedPageTitle,
  navigateBackward,
  navigateForward,
  setFormattedRecoveryKey,
  viewName,
}: FlowRecoveryKeyConfirmPwdProps) => {
  const account = useAccount();
  const ftlMsgResolver = useFtlMsgResolver();
  const errorHandler = useErrorHandler();

  const [errorText, setErrorText] = useState<string>();
  const [localizedErrorBannerMessage, setLocalizedErrorBannerMessage] =
    useState<string>();
  const [isLoading, setIsLoading] = useState(false);
  const [actionType, setActionType] = useState<RecoveryKeyAction>();

  useEffect(() => {
    if (account.recoveryKey.exists === true) {
      setActionType(RecoveryKeyAction.Change);
    } else {
      setActionType(RecoveryKeyAction.Create);
    }
  }, [account.recoveryKey.exists]);

  const { formState, getValues, handleSubmit, register } = useForm<FormData>({
    mode: 'all',
    defaultValues: {
      password: '',
    },
  });

  const createRecoveryKey = useCallback(async () => {
    const password = getValues('password');
    logViewEvent(`flow.${viewName}`, 'confirm-password.submit');
    // if there is an error banner, clear it on form submission
    setLocalizedErrorBannerMessage('');
    try {
      const replaceKey = actionType === RecoveryKeyAction.Change;
      const recoveryKey = await account.createRecoveryKey(
        password,
        replaceKey,
        true
      );
      setFormattedRecoveryKey(formatRecoveryKey(recoveryKey.buffer));
      logViewEvent(`flow.${viewName}`, 'confirm-password.success');
      navigateForward();
    } catch (err) {
      if (err && err.code === 401 && err.errno === 110) {
        // JWT invalid/expired
        errorHandler(err);
        return;
      }

      const localizedErrorMessage = getLocalizedErrorMessage(
        ftlMsgResolver,
        err
      );

      if (err.errno === AuthUiErrors.INCORRECT_PASSWORD.errno) {
        // show error in tooltip if password is incorrect
        // the error will be cleared when the input content is changed
        setErrorText(localizedErrorMessage);
      } else {
        // otherwise show in a banner
        // the error will persist until the form is re-submitted
        setLocalizedErrorBannerMessage(localizedErrorMessage);
      }
      logViewEvent(`flow.${viewName}`, 'confirm-password.fail');
      setIsLoading(false);
    }
  }, [
    account,
    actionType,
    ftlMsgResolver,
    getValues,
    navigateForward,
    setErrorText,
    setIsLoading,
    setFormattedRecoveryKey,
    viewName,
    errorHandler,
  ]);

  return (
    <FlowContainer
      title={localizedPageTitle}
      onBackButtonClick={() => {
        navigateBackward();
        actionType === RecoveryKeyAction.Create
          ? logViewEvent(`flow.${viewName}`, 'create-key.cancel')
          : logViewEvent(`flow.${viewName}`, 'change-key.cancel');
      }}
      {...{ localizedBackButtonTitle }}
    >
      <div className="w-full flex flex-col gap-4">
        <ProgressBar currentStep={2} numberOfSteps={4} />
        {localizedErrorBannerMessage && (
          <Banner
            type="error"
            content={{ localizedHeading: localizedErrorBannerMessage }}
          />
        )}
        <PasswordImage />

        <FtlMsg id="flow-recovery-key-confirm-pwd-heading-v2">
          <h2 className="font-bold text-xl">
            Re-enter your password for security
          </h2>
        </FtlMsg>

        <form
          onSubmit={handleSubmit(({ password }) => {
            setIsLoading(true);
            createRecoveryKey();
          })}
        >
          <InputPassword
            name="password"
            label={ftlMsgResolver.getMsg(
              'flow-recovery-key-confirm-pwd-input-label',
              'Enter your password'
            )}
            onChange={() => {
              errorText && setErrorText(undefined);
            }}
            inputRef={register({
              required: true,
            })}
            {...{ errorText }}
          />
          {actionType === RecoveryKeyAction.Create && (
            <FtlMsg id="flow-recovery-key-confirm-pwd-submit-button">
              <button
                className="cta-primary cta-xl w-full mt-4"
                type="submit"
                disabled={isLoading || !formState.isDirty}
              >
                Create account recovery key
              </button>
            </FtlMsg>
          )}
          {actionType === RecoveryKeyAction.Change && (
            <FtlMsg id="flow-recovery-key-confirm-pwd-submit-button-change-key">
              <button
                className="cta-primary cta-xl w-full mt-4"
                type="submit"
                disabled={isLoading || !formState.isDirty}
              >
                Create new account recovery key
              </button>
            </FtlMsg>
          )}
        </form>
        {actionType === RecoveryKeyAction.Change && (
          <FtlMsg id="flow-recovery-key-info-cancel-link">
            <Link
              className="link-blue text-sm mx-auto"
              to={SETTINGS_PATH}
              onClick={() => {
                logViewEvent(`flow.${viewName}`, 'change-key.cancel');
              }}
            >
              Cancel
            </Link>
          </FtlMsg>
        )}
      </div>
    </FlowContainer>
  );
};

export default FlowRecoveryKeyConfirmPwd;
