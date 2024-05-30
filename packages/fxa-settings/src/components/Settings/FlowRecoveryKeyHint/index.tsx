/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useEffect, useState } from 'react';
import { FlowContainer } from '../FlowContainer';
import { ProgressBar } from '../ProgressBar';
import { FtlMsg } from 'fxa-react/lib/utils';
import { Control, useForm, useWatch } from 'react-hook-form';
import InputText from '../../InputText';
import { useFtlMsgResolver, useAccount, useAlertBar } from '../../../models';
import { logViewEvent } from '../../../lib/metrics';
import { LightbulbImage } from '../../images';
import { DISPLAY_SAFE_UNICODE } from '../../../constants';
import Banner, { BannerType } from '../../Banner';
import {
  AuthUiErrorNos,
  AuthUiErrors,
} from '../../../lib/auth-errors/auth-errors';
import classNames from 'classnames';
import { getErrorFtlId } from '../../../lib/error-utils';

export type FlowRecoveryKeyHintProps = {
  navigateForward: () => void;
  navigateBackward: () => void;
  localizedBackButtonTitle: string;
  localizedPageTitle: string;
  viewName: string;
};

type FormData = { hint: string };

export const maxHintLength: number = 255;

export const FlowRecoveryKeyHint = ({
  navigateForward,
  navigateBackward,
  localizedBackButtonTitle,
  localizedPageTitle,
  viewName,
}: FlowRecoveryKeyHintProps) => {
  const account = useAccount();
  const alertBar = useAlertBar();
  const [bannerText, setBannerText] = useState<string>();
  const [hintError, setHintError] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);
  const ftlMsgResolver = useFtlMsgResolver();

  const { control, getValues, handleSubmit, register } = useForm<FormData>({
    mode: 'onTouched',
    defaultValues: {
      hint: '',
    },
  });

  useEffect(() => {
    logViewEvent(`flow.${viewName}`, 'create-hint.view');
  }, [viewName]);

  const checkForHintError = (hint: string) => {
    if (hint.length > maxHintLength) {
      const localizedCharLimitError = ftlMsgResolver.getMsg(
        'flow-recovery-key-hint-char-limit-error',
        'The hint must contain fewer than 255 characters.'
      );
      return localizedCharLimitError;
    } else if (!DISPLAY_SAFE_UNICODE.test(hint)) {
      const localizedUnsafeUnicodeCharError = ftlMsgResolver.getMsg(
        'flow-recovery-key-hint-unsafe-char-error',
        'The hint cannot contain unsafe unicode characters. Only letters, numbers, punctuation marks and symbols are allowed.'
      );
      return localizedUnsafeUnicodeCharError;
    }
    return undefined;
  };

  const navigateForwardAndAlertSuccess = () => {
    navigateForward();
    alertBar.success(
      ftlMsgResolver.getMsg(
        'flow-recovery-key-success-alert',
        'Account recovery key created'
      )
    );
  };

  const onSubmit = async ({ hint }: FormData) => {
    setIsLoading(true);
    const trimmedHint = hint.trim();

    if (trimmedHint.length === 0) {
      logViewEvent(`flow.${viewName}`, 'create-hint.skip');
      navigateForwardAndAlertSuccess();
    } else {
      const hintErrorText = checkForHintError(trimmedHint);
      if (hintErrorText) {
        setHintError(hintErrorText);
        return;
      } else {
        try {
          logViewEvent(`flow.${viewName}`, 'create-hint.submit');
          await account.updateRecoveryKeyHint(trimmedHint);
          logViewEvent(`flow.${viewName}`, 'create-hint.success');
          navigateForwardAndAlertSuccess();
        } catch (e) {
          let localizedError: string;
          if (e.errno && AuthUiErrorNos[e.errno]) {
            localizedError = ftlMsgResolver.getMsg(getErrorFtlId(e), e.message);
          } else {
            // Any errors that aren't matched to a known error are reported to the user as an unexpected error
            const unexpectedError = AuthUiErrors.UNEXPECTED_ERROR;
            localizedError = ftlMsgResolver.getMsg(
              getErrorFtlId(unexpectedError),
              unexpectedError.message
            );
          }
          setBannerText(localizedError);
          logViewEvent(`flow.${viewName}`, 'create-hint.fail', e);
        } finally {
          setIsLoading(false);
        }
      }
    }
  };

  const ControlledCharacterCount = ({
    control,
  }: {
    control: Control<FormData>;
  }) => {
    const hint: string = useWatch({
      control,
      name: 'hint',
      defaultValue: getValues().hint,
    });
    const isTooLong: boolean = hint.length > maxHintLength;
    return (
      <p
        className={classNames('text-end text-xs mt-2', {
          'text-red-600': isTooLong,
        })}
      >
        {hint.length}/{maxHintLength}
      </p>
    );
  };

  return (
    <FlowContainer
      title={localizedPageTitle}
      localizedBackButtonTitle={localizedBackButtonTitle}
      onBackButtonClick={() => {
        logViewEvent(`flow.${viewName}`, 'create-hint.skip');
        navigateBackward();
      }}
    >
      <div className="w-full flex flex-col">
        <ProgressBar currentStep={4} numberOfSteps={4} />
        {bannerText && (
          <Banner type={BannerType.error}>
            <p className="w-full text-center">{bannerText}</p>
          </Banner>
        )}
        <LightbulbImage className="mx-auto my-10" />
        <FtlMsg id="flow-recovery-key-hint-header-v2">
          <h2 className="font-bold text-xl mb-4">
            Add a hint to help find your key
          </h2>
        </FtlMsg>

        <FtlMsg id="flow-recovery-key-hint-message-v3">
          <p className="text-md mb-4">
            This hint should help you remember where you stored your account
            recovery key. We can show it to you during the password reset to
            recover your data.
          </p>
        </FtlMsg>
        <form onSubmit={handleSubmit(onSubmit)}>
          <FtlMsg id="flow-recovery-key-hint-input-v2" attrs={{ label: true }}>
            <InputText
              name="hint"
              label="Enter a hint (optional)"
              prefixDataTestId="hint"
              autoFocus
              inputRef={register()}
              onChange={() => {
                setHintError(undefined);
                setBannerText(undefined);
              }}
              {...{ errorText: hintError }}
            />
          </FtlMsg>
          <ControlledCharacterCount {...{ control }} />
          <FtlMsg id="flow-recovery-key-hint-cta-text">
            <button
              className="cta-primary cta-xl w-full mt-6 mb-4"
              type="submit"
              disabled={isLoading}
            >
              Finish
            </button>
          </FtlMsg>
        </form>
      </div>
    </FlowContainer>
  );
};

export default FlowRecoveryKeyHint;
