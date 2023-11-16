/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useCallback, useRef, useState, useEffect } from 'react';
import { UseFormMethods } from 'react-hook-form';
import InputPassword from '../InputPassword';
import PasswordValidator from '../../lib/password-validator';
import { logViewEvent, settingsViewName } from '../../lib/metrics';
import { FtlMsg } from 'fxa-react/lib/utils';
import { useFtlMsgResolver } from '../../models';
import { SHOW_BALLOON_TIMEOUT, HIDE_BALLOON_TIMEOUT } from '../../constants';
import PasswordStrengthBalloon from '../PasswordStrengthBalloon';
import PasswordInfoBalloon from '../PasswordInfoBalloon';

export type PasswordFormType = 'signup' | 'reset';

export type FormPasswordWithBalloonsProps = {
  passwordFormType: PasswordFormType;
  formState: UseFormMethods['formState'];
  errors: UseFormMethods['errors'];
  onSubmit: () => void;
  trigger: UseFormMethods['trigger'];
  register: UseFormMethods['register'];
  getValues: UseFormMethods['getValues'];
  email: string;
  onFocusMetricsEvent?: string;
  loading: boolean;
  children?: React.ReactNode;
  disableButtonUntilValid?: boolean;
};

const getTemplateValues = (passwordFormType: PasswordFormType) => {
  let templateValues = {
    passwordFtlId: '',
    passwordLabel: '',
    confirmPasswordFtlId: '',
    confirmPasswordLabel: '',
    buttonFtlId: '',
    buttonText: '',
  };
  switch (passwordFormType) {
    case 'signup':
      templateValues.passwordFtlId = 'signup-new-password-label';
      templateValues.passwordLabel = 'Password';
      templateValues.confirmPasswordFtlId = 'signup-confirm-password-label';
      templateValues.confirmPasswordLabel = 'Repeat password';
      templateValues.buttonFtlId = 'signup-submit-button';
      templateValues.buttonText = 'Create account';
      break;
    case 'reset':
      templateValues.passwordFtlId =
        'form-reset-password-with-balloon-new-password';
      templateValues.passwordLabel = 'New password';
      templateValues.confirmPasswordFtlId =
        'form-reset-password-with-balloon-confirm-password';
      templateValues.confirmPasswordLabel = 'Re-enter password';
      templateValues.buttonFtlId =
        'form-reset-password-with-balloon-submit-button';
      templateValues.buttonText = 'Reset password';
      break;
  }
  return templateValues;
};

export const FormPasswordWithBalloons = ({
  passwordFormType,
  formState,
  errors,
  onSubmit,
  email,
  trigger,
  register,
  getValues,
  onFocusMetricsEvent,
  loading,
  children,
  disableButtonUntilValid = false,
}: FormPasswordWithBalloonsProps) => {
  const passwordValidator = new PasswordValidator(email);
  const [passwordMatchErrorText, setPasswordMatchErrorText] =
    useState<string>('');
  const [hasNewPwdFocused, setHasNewPwdFocused] = useState<boolean>(false);
  const [hasUserTakenAction, setHasUserTakenAction] = useState<boolean>(false);
  const [isNewPwdBalloonVisible, setIsNewPwdBalloonVisible] =
    useState<boolean>(false);
  const [isConfirmPwdBalloonVisible, setIsConfirmPwdBalloonVisible] =
    useState<boolean>(false);

  const ftlMsgResolver = useFtlMsgResolver();
  const localizedPasswordMatchError = ftlMsgResolver.getMsg(
    'form-reset-password-with-balloon-match-error',
    'Passwords do not match'
  );

  const templateValues = getTemplateValues(passwordFormType);

  // Timeout to delay showing/hiding balloons, prevents jankiness
  // Blur timeout is shorter to prevent overlapping balloons when moving between password inputs
  // TODO: Validate clearTimeout method in FXA-6495

  const showSomethingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const hideSomethingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  useEffect(() => {
    return () => {
      const showTimer = showSomethingTimerRef.current;
      showTimer && clearTimeout(showTimer);
      const hideTimer = hideSomethingTimerRef.current;
      hideTimer && clearTimeout(hideTimer);
    };
  }, []);

  const showNewPwdBalloon = useCallback(() => {
    showSomethingTimerRef.current = setTimeout(() => {
      setIsNewPwdBalloonVisible(true);
    }, SHOW_BALLOON_TIMEOUT);
  }, [setIsNewPwdBalloonVisible]);

  const hideNewPwdBalloon = useCallback(() => {
    hideSomethingTimerRef.current = setTimeout(() => {
      setIsNewPwdBalloonVisible(false);
    }, HIDE_BALLOON_TIMEOUT);
  }, [setIsNewPwdBalloonVisible]);

  const showConfirmPwdBalloon = useCallback(() => {
    showSomethingTimerRef.current = setTimeout(() => {
      setIsConfirmPwdBalloonVisible(true);
    }, SHOW_BALLOON_TIMEOUT);
  }, [setIsConfirmPwdBalloonVisible]);

  const hideConfirmPwdBalloon = useCallback(() => {
    hideSomethingTimerRef.current = setTimeout(() => {
      setIsConfirmPwdBalloonVisible(false);
    }, HIDE_BALLOON_TIMEOUT);
  }, [setIsConfirmPwdBalloonVisible]);

  const onNewPwdFocus = () => {
    showNewPwdBalloon();
    if (!hasNewPwdFocused && onFocusMetricsEvent) {
      logViewEvent(settingsViewName, onFocusMetricsEvent);
      setHasNewPwdFocused(true);
    }
  };

  const onNewPwdBlur = () => {
    !hasUserTakenAction && setHasUserTakenAction(true);
    // do not hide the password strength balloon if there are errors in the new password
    if (getValues('newPassword') !== '' && !errors.newPassword) {
      hideNewPwdBalloon();
    }
  };

  const onBlurConfirmPassword = useCallback(() => {
    passwordFormType === 'signup' &&
      isConfirmPwdBalloonVisible &&
      hideConfirmPwdBalloon();

    getValues('confirmPassword') !== getValues('newPassword') &&
      setPasswordMatchErrorText(localizedPasswordMatchError);
  }, [
    getValues,
    hideConfirmPwdBalloon,
    isConfirmPwdBalloonVisible,
    localizedPasswordMatchError,
    passwordFormType,
    setPasswordMatchErrorText,
  ]);

  return (
    <>
      <form {...{ onSubmit }} className="flex flex-col">
        {/* Hidden email field is to allow Fx password manager
           to correctly save the updated password. Without it,
           the password manager tries to save the old password
           as the username. */}
        <input type="email" value={email} className="hidden" readOnly />
        <div className="relative mb-4">
          <FtlMsg id={templateValues.passwordFtlId} attrs={{ label: true }}>
            <InputPassword
              name="newPassword"
              className="text-start"
              label={templateValues.passwordLabel}
              onFocusCb={onFocusMetricsEvent ? onNewPwdFocus : undefined}
              onBlurCb={onNewPwdBlur}
              onChange={() => {
                getValues('confirmPassword') === getValues('newPassword') &&
                  setPasswordMatchErrorText('');
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
          {isNewPwdBalloonVisible && (
            <PasswordStrengthBalloon
              {...{
                hasUserTakenAction,
                isTooShort: errors.newPassword?.types?.length,
                isSameAsEmail: errors.newPassword?.types?.notEmail,
                isCommon: errors.newPassword?.types?.uncommon,
              }}
            />
          )}
        </div>

        <div className="relative mb-4">
          <FtlMsg
            id={templateValues.confirmPasswordFtlId}
            attrs={{ label: true }}
          >
            <InputPassword
              name="confirmPassword"
              label={templateValues.confirmPasswordLabel}
              className="text-start"
              // onFocusCb and onBlurCb control visibility of PasswordInfoBalloon
              // Only used for the 'signup' page
              onFocusCb={
                passwordFormType === 'signup' &&
                getValues('newPassword') !== '' &&
                !errors.newPassword
                  ? showConfirmPwdBalloon
                  : undefined
              }
              onBlurCb={() => onBlurConfirmPassword()}
              onChange={() => {
                getValues('confirmPassword') === getValues('newPassword') &&
                  setPasswordMatchErrorText('');
              }}
              hasErrors={errors.confirmPassword && passwordMatchErrorText}
              errorText={passwordMatchErrorText}
              inputRef={register({
                required: true,
                validate: (value: string) => value === getValues().newPassword,
              })}
              anchorPosition="end"
              tooltipPosition="bottom"
              prefixDataTestId="verify-password"
            />
          </FtlMsg>

          {isConfirmPwdBalloonVisible && <PasswordInfoBalloon />}
        </div>

        {children}
        <FtlMsg id={templateValues.buttonFtlId}>
          <button
            type="submit"
            className="cta-primary cta-xl"
            disabled={
              loading || (!formState.isValid && disableButtonUntilValid)
            }
          >
            {templateValues.buttonText}
          </button>
        </FtlMsg>
      </form>
    </>
  );
};

export default FormPasswordWithBalloons;
