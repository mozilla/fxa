/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useEffect, useState } from 'react';
import { FtlMsg } from 'fxa-react/lib/utils';
import { Control, useForm, useWatch } from 'react-hook-form';
import InputText from '../InputText';
import { RelierCmsInfo, useFtlMsgResolver } from '../../models';
import { logViewEvent } from '../../lib/metrics';
import { LightbulbImage } from '../images';
import { DISPLAY_SAFE_UNICODE } from '../../constants';
import classNames from 'classnames';
import { getLocalizedErrorMessage } from '../../lib/error-utils';
import Banner from '../Banner';
import CmsButtonWithFallback from '../CmsButtonWithFallback';

export type RecoveryKeySetupHintProps = {
  updateRecoveryKeyHint: (hint: string) => Promise<void>;
  navigateForward: () => void;
  viewName: string;
  cmsInfo?: RelierCmsInfo;
};

type FormData = { hint: string };

export const MAX_HINT_LENGTH = 255;

export const RecoveryKeySetupHint = ({
  updateRecoveryKeyHint,
  navigateForward,
  viewName,
  cmsInfo,
}: RecoveryKeySetupHintProps) => {
  const [localizedErrorMessage, setLocalizedErrorMessage] = useState<string>();
  const [hintError, setHintError] = useState<string>();
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(false);
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
    if (hint.length > MAX_HINT_LENGTH) {
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

  const onSubmit = async ({ hint }: FormData) => {
    setIsSubmitDisabled(true);
    const trimmedHint = hint.trim();

    if (trimmedHint.length === 0) {
      logViewEvent(`flow.${viewName}`, 'create-hint.skip');
      navigateForward();
    } else {
      const hintErrorText = checkForHintError(trimmedHint);
      if (hintErrorText) {
        setHintError(hintErrorText);
        return;
      } else {
        try {
          logViewEvent(`flow.${viewName}`, 'create-hint.submit');
          await updateRecoveryKeyHint(trimmedHint);
          logViewEvent(`flow.${viewName}`, 'create-hint.success');
          navigateForward();
        } catch (error) {
          setLocalizedErrorMessage(
            getLocalizedErrorMessage(ftlMsgResolver, error)
          );
          logViewEvent(`flow.${viewName}`, 'create-hint.fail', error);
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
    const isTooLong: boolean = hint.length > MAX_HINT_LENGTH;

    return (
      <p
        className={classNames('text-end text-xs my-2', {
          'text-red-600': isTooLong,
        })}
      >
        {hint.length}/{MAX_HINT_LENGTH}
      </p>
    );
  };

  return (
    <>
      {localizedErrorMessage && (
        <Banner
          type="error"
          content={{ localizedHeading: localizedErrorMessage }}
        />
      )}
      <LightbulbImage />
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
        <ControlledCharacterCount {...{ control }} />
        <FtlMsg id="flow-recovery-key-hint-input-v2" attrs={{ label: true }}>
          <InputText
            name="hint"
            label="Enter a hint (optional)"
            prefixDataTestId="hint"
            inputRef={register()}
            onChange={() => {
              setHintError(undefined);
              setLocalizedErrorMessage('');
              isSubmitDisabled && setIsSubmitDisabled(false);
            }}
            maxLength={MAX_HINT_LENGTH}
            {...{ errorText: hintError }}
          />
        </FtlMsg>
        <FtlMsg id="flow-recovery-key-hint-cta-text">
          <CmsButtonWithFallback
            className="cta-primary cta-xl w-full mt-4 mb-4"
            type="submit"
            disabled={isSubmitDisabled}
            buttonColor={cmsInfo?.shared?.buttonColor}
          >
            Finish
          </CmsButtonWithFallback>
        </FtlMsg>
      </form>
    </>
  );
};

export default RecoveryKeySetupHint;
