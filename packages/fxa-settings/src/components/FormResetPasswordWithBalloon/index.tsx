/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useState } from 'react';
import { UseFormMethods } from 'react-hook-form';
import InputPassword from '../InputPassword';
import PasswordValidator from '../../lib/password-validator';
import { logViewEvent, settingsViewName } from '../../lib/metrics';
import PasswordStrengthBalloon from '../PasswordStrengthBalloon';
import { FtlMsg } from 'fxa-react/lib/utils';
import { useFtlMsgResolver } from '../../models';

type FormResetPasswordWithBalloonProps = {
  formState: UseFormMethods['formState'];
  errors: UseFormMethods['errors'];
  onSubmit: any; // TODO: fix this type
  trigger: UseFormMethods['trigger'];
  register: UseFormMethods['register'];
  getValues: UseFormMethods['getValues'];
  email: string;
  onFocusMetricsEvent?: string;
  loading: boolean;
};

export const FormResetPasswordWithBalloon = ({
  formState,
  errors,
  onSubmit,
  email,
  trigger,
  register,
  getValues,
  onFocusMetricsEvent,
  loading,
}: FormResetPasswordWithBalloonProps) => {
  const passwordValidator = new PasswordValidator(email);
  const [hasFocused, setHasFocused] = useState(false);
  const [isNewPwdBubbleVisible, setIsNewPwdBubbleVisible] = useState(false);
  const [passwordMatchErrorText, setPasswordMatchErrorText] = useState<
    string | undefined
  >(undefined);
  const ftlMsgResolver = useFtlMsgResolver();

  const onFocus = () => {
    setIsNewPwdBubbleVisible(true);
    if (!hasFocused && onFocusMetricsEvent) {
      logViewEvent(settingsViewName, onFocusMetricsEvent);
      setHasFocused(true);
    }
  };

  const onBlur = () => {
    setIsNewPwdBubbleVisible(false);
  };

  return (
    <>
      <form {...{ onSubmit }} className="flex flex-col gap-4">
        {/* This relative div is required to position the PasswordStrengthBalloon */}
        <div className="relative">
          <FtlMsg
            id="form-reset-password-with-balloon-new-password"
            attrs={{ label: true }}
          >
            <InputPassword
              name="newPassword"
              className="text-start"
              label="New password"
              onFocusCb={onFocusMetricsEvent ? onFocus : undefined}
              onBlurCb={isNewPwdBubbleVisible ? onBlur : undefined}
              onChange={() => {
                trigger(['newPassword', 'confirmPassword']);
              }}
              hasErrors={
                formState.dirtyFields.newPassword ? errors.newPassword : false
              }
              inputRef={register({
                required: true,
                validate: {
                  length: (value: string) => value.length > 7,
                  notEmail: (value: string) => {
                    return !passwordValidator.isSameAsEmail(
                      value.toLowerCase()
                    );
                  },
                  uncommon: async (value: string) => {
                    // @ts-ignore
                    const list = await import('fxa-common-password-list');
                    const input = value.toLowerCase();
                    return (
                      !list.test(input) && !passwordValidator.isBanned(input)
                    );
                  },
                },
              })}
              prefixDataTestId="new-password"
            />
          </FtlMsg>
          {isNewPwdBubbleVisible && (
            <PasswordStrengthBalloon
              {...{
                hasUserTakenAction: formState.dirtyFields.newPassword,
                isTooShort: errors.newPassword?.types?.length,
                isSameAsEmail: errors.newPassword?.types?.notEmail,
                isCommon: errors.newPassword?.types?.uncommon,
              }}
            />
          )}
        </div>

        <FtlMsg
          id="form-reset-password-with-balloon-confirm-password"
          attrs={{ label: true }}
        >
          <InputPassword
            name="confirmPassword"
            label="Re-enter password"
            className="text-start"
            onChange={() => {
              if (passwordMatchErrorText) {
                setPasswordMatchErrorText(undefined);
              }
              trigger(['newPassword', 'confirmPassword']);
            }}
            onBlurCb={() => {
              if (errors.confirmPassword) {
                const errorMessage = ftlMsgResolver.getMsg(
                  'form-reset-password-with-balloon-match-error',
                  'Passwords do not match'
                );
                setPasswordMatchErrorText(errorMessage);
              }
            }}
            // Password confirmation field is disabled until new password is valid
            disabled={!formState.dirtyFields.newPassword || errors.newPassword}
            hasErrors={errors.confirmPassword && passwordMatchErrorText}
            errorText={passwordMatchErrorText}
            inputRef={register({
              required: true,
              validate: (value: string) => value === getValues().newPassword,
            })}
            anchorStart
            tooltipPosition="bottom"
            prefixDataTestId="verify-password"
          />
        </FtlMsg>
        <FtlMsg id="form-reset-password-with-balloon-submit-button">
          <button
            type="submit"
            className="cta-primary cta-xl"
            disabled={!formState.isDirty || !formState.isValid || loading}
          >
            Reset password
          </button>
        </FtlMsg>
      </form>
    </>
  );
};

export default FormResetPasswordWithBalloon;
