/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FtlMsg } from 'fxa-react/lib/utils';
import { AuthUiErrors } from '../../../lib/auth-errors/auth-errors';
import { sessionToken } from '../../../lib/cache';
import { getLocalizedErrorMessage } from '../../../lib/error-utils';
import { useAuthClient, useFtlMsgResolver } from '../../../models';
import Banner from '../../Banner';
import { PasswordImage } from '../../images';
import InputPassword from '../../InputPassword';
import FlowContainer from '../FlowContainer';
import ProgressBar from '../ProgressBar';

type FormData = { password: string };

export type FlowDeleteSyncDataConfirmPwdProps = {
  localizedBackButtonTitle: string;
  localizedPageTitle: string;
  navigateBackward: () => void;
  navigateForward: () => void;
};

/**
 * Re-authenticates the session with the password. The auth server records it
 * on the session, and the Sync data destroy route refuses sessions that have
 * not done this.
 */
export const FlowDeleteSyncDataConfirmPwd = ({
  localizedBackButtonTitle,
  localizedPageTitle,
  navigateBackward,
  navigateForward,
}: FlowDeleteSyncDataConfirmPwdProps) => {
  const authClient = useAuthClient();
  const ftlMsgResolver = useFtlMsgResolver();
  const [errorText, setErrorText] = useState<string>();
  const [localizedBannerError, setLocalizedBannerError] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);

  const { formState, handleSubmit, register } = useForm<FormData>({
    mode: 'all',
    defaultValues: { password: '' },
  });
  const { isDirty } = formState;

  const reauth = async ({ password }: FormData) => {
    setIsLoading(true);
    setLocalizedBannerError(undefined);
    try {
      const token = sessionToken()!;
      await authClient.sessionReauth(
        token,
        await authClient.accountEmails(token),
        password,
        { reason: 'sync_data' }
      );
      navigateForward();
    } catch (err) {
      const localizedError = getLocalizedErrorMessage(ftlMsgResolver, err);
      if (err.errno === AuthUiErrors.INCORRECT_PASSWORD.errno) {
        setErrorText(localizedError);
      } else {
        setLocalizedBannerError(localizedError);
      }
      setIsLoading(false);
    }
  };

  return (
    <FlowContainer
      title={localizedPageTitle}
      onBackButtonClick={navigateBackward}
      {...{ localizedBackButtonTitle }}
    >
      <div className="w-full flex flex-col gap-4">
        <ProgressBar currentStep={1} numberOfSteps={2} />
        {localizedBannerError && (
          <Banner
            type="error"
            content={{ localizedHeading: localizedBannerError }}
          />
        )}
        <PasswordImage />
        <FtlMsg id="delete-sync-data-confirm-pwd-heading">
          <h2 className="font-heading text-xl">
            Re-enter your password for security
          </h2>
        </FtlMsg>
        <form onSubmit={handleSubmit(reauth)}>
          <InputPassword
            label={ftlMsgResolver.getMsg(
              'delete-sync-data-confirm-pwd-input-label',
              'Enter your password'
            )}
            onChange={() => errorText && setErrorText(undefined)}
            registration={register('password', { required: true })}
            {...{ errorText }}
          />
          <FtlMsg id="delete-sync-data-confirm-pwd-submit-button">
            <button
              className="cta-primary cta-xl w-full mt-4"
              type="submit"
              disabled={isLoading || !isDirty}
            >
              Continue
            </button>
          </FtlMsg>
        </form>
      </div>
    </FlowContainer>
  );
};

export default FlowDeleteSyncDataConfirmPwd;
