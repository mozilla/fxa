/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useCallback, useState } from 'react';
import { UseFormMethods } from 'react-hook-form';
import InputPassword from '../InputPassword';
import PasswordValidator from '../../lib/password-validator';
import { FtlMsg } from 'fxa-react/lib/utils';
import { useFtlMsgResolver } from '../../models';
import PasswordStrengthInline from '../PasswordStrengthInline';

export type PasswordFormType = 'signup' | 'reset';

export type FormPasswordWithInlineCriteriaProps = {
  passwordFormType: PasswordFormType;
  formState: UseFormMethods['formState'];
  errors: UseFormMethods['errors'];
  onSubmit: () => void;
  trigger: UseFormMethods['trigger'];
  register: UseFormMethods['register'];
  getValues: UseFormMethods['getValues'];
  email: string;
  onFocusMetricsEvent?: () => void;
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
      templateValues.passwordFtlId =
        'form-password-with-inline-criteria-signup-new-password-label';
      templateValues.passwordLabel = 'Password';
      templateValues.confirmPasswordFtlId =
        'form-password-with-inline-criteria-signup-confirm-password-label';
      templateValues.confirmPasswordLabel = 'Repeat password';
      templateValues.buttonFtlId =
        'form-password-with-inline-criteria-signup-submit-button';
      templateValues.buttonText = 'Create account';
      break;
    case 'reset':
      templateValues.passwordFtlId =
        'form-password-with-inline-criteria-reset-new-password';
      templateValues.passwordLabel = 'New password';
      templateValues.confirmPasswordFtlId =
        'form-password-with-inline-criteria-confirm-password';
      templateValues.confirmPasswordLabel = 'Re-enter password';
      templateValues.buttonFtlId =
        'form-password-with-inline-criteria-reset-submit-button';
      templateValues.buttonText = 'Reset password';
      break;
  }
  return templateValues;
};

export const FormPasswordWithInlineCriteria = ({
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
  disableButtonUntilValid = true,
}: FormPasswordWithInlineCriteriaProps) => {
  const passwordValidator = new PasswordValidator(email);
  const [passwordMatchErrorText, setPasswordMatchErrorText] =
    useState<string>('');
  const [hasNewPwdFocused, setHasNewPwdFocused] = useState<boolean>(false);
  const [srOnlyPwdFeedbackMessage, setSROnlyPwdFeedbackMessage] =
    useState<string>();
  const [srOnlyConfirmPwdFeedbackMessage, setSROnlyConfirmPwdFeedbackMessage] =
    useState<string>();

  const ftlMsgResolver = useFtlMsgResolver();
  const localizedPasswordMatchError = ftlMsgResolver.getMsg(
    'form-password-with-inline-criteria-match-error',
    'Passwords do not match'
  );

  const templateValues = getTemplateValues(passwordFormType);

  const onNewPwdFocus = () => {
    setSROnlyPwdFeedbackMessage('');
    setSROnlyConfirmPwdFeedbackMessage('');
    setPasswordMatchErrorText('');
    if (!hasNewPwdFocused) {
      if (onFocusMetricsEvent) {
        onFocusMetricsEvent();
      }
      setHasNewPwdFocused(true);
    }
  };

  const onNewPwdBlur = () => {
    // do not hide the password strength info if there are errors in the new password
    if (!errors.newPassword) {
      // Without balloons, this created a jumpy ux.
      // hideNewPwdCriteria();
      const srOnlyPasswordMeetsRequirements = ftlMsgResolver.getMsg(
        'form-password-with-inline-criteria-sr-requirements-met',
        'The entered password respects all password requirements.'
      );
      setSROnlyPwdFeedbackMessage(srOnlyPasswordMeetsRequirements);
    } else {
      // if there are errors on blur, announce a screen-reader only message
      // visual feedback is provided by the password strength ballon
      if (errors.newPassword?.types?.length) {
        const srOnlyTooShortMessage = ftlMsgResolver.getMsg(
          'form-password-with-inline-criteria-sr-too-short-message',
          'Password must contain at least 8 characters.'
        );
        setSROnlyPwdFeedbackMessage(srOnlyTooShortMessage);
      } else if (errors.newPassword?.types?.notEmail) {
        const srOnlyNotEmailMessage = ftlMsgResolver.getMsg(
          'form-password-with-inline-criteria-sr-not-email-message',
          'Password must not contain your email address.'
        );
        setSROnlyPwdFeedbackMessage(srOnlyNotEmailMessage);
      } else if (errors.newPassword?.types?.uncommon) {
        const srOnlyNotCommonMessage = ftlMsgResolver.getMsg(
          'form-password-with-inline-criteria-sr-not-common-message',
          'Password must not be a commonly used password.'
        );
        setSROnlyPwdFeedbackMessage(srOnlyNotCommonMessage);
      }
    }
    if (
      !errors.newPassword &&
      getValues('confirmPassword') !== '' &&
      getValues('confirmPassword') !== getValues('newPassword')
    ) {
      setPasswordMatchErrorText(localizedPasswordMatchError);
    }

    if (!formState.isValid) {
      trigger('confirmPassword');
    }
  };

  const onFocusConfirmPassword = useCallback(() => {
    setPasswordMatchErrorText('');
    setSROnlyPwdFeedbackMessage('');
    setSROnlyConfirmPwdFeedbackMessage('');
  }, []);

  const onBlurConfirmPassword = useCallback(() => {
    if (getValues('confirmPassword') !== getValues('newPassword')) {
      setPasswordMatchErrorText(localizedPasswordMatchError);
    } else {
      const srOnlyPasswordsMatch = ftlMsgResolver.getMsg(
        'form-password-with-inline-criteria-sr-passwords-match',
        'Entered passwords match.'
      );
      setSROnlyConfirmPwdFeedbackMessage(srOnlyPasswordsMatch);
    }

    if (!formState.isValid) {
      trigger('newPassword');
    }
  }, [
    formState,
    ftlMsgResolver,
    getValues,
    localizedPasswordMatchError,
    setPasswordMatchErrorText,
    trigger,
  ]);

  const onChangePassword = (inputName: string) => {
    const newPassword = getValues('newPassword');
    const confirmPassword = getValues('confirmPassword');
    if (inputName === 'newPassword') {
      trigger('newPassword');
    }

    if (!errors.newPassword) {
      setSROnlyPwdFeedbackMessage('');
    }

    if (confirmPassword !== newPassword && confirmPassword !== '') {
      setPasswordMatchErrorText(localizedPasswordMatchError);
    } else {
      setPasswordMatchErrorText('');
    }

    trigger('confirmPassword');
  };

  return (
    <>
      <form {...{ onSubmit }} className="flex flex-col">
        {/* Hidden email field is to help password managers
           correctly associate the email and password. Without this,
           password managers may try to use another field as username */}
        <input
          type="email"
          value={email}
          className="hidden"
          autoComplete="username"
          readOnly
        />
        <div>
          <PasswordStrengthInline
            {...{
              isPasswordEmpty: (getValues('newPassword')?.length || 0) === 0,
              isConfirmedPasswordEmpty:
                (getValues('confirmPassword')?.length || 0) === 0,
              isTooShort: errors.newPassword?.types?.length,
              isSameAsEmail: errors.newPassword?.types?.notEmail,
              isCommon: errors.newPassword?.types?.uncommon,
              isUnconfirmed:
                getValues('confirmPassword') !== getValues('newPassword'),
            }}
          />
          <span
            id="password-requirements"
            aria-live="polite"
            className="text-xs"
          >
            <span className="sr-only">{srOnlyPwdFeedbackMessage}</span>
          </span>
        </div>

        <div className="relative mb-4" aria-atomic="true">
          <FtlMsg id={templateValues.passwordFtlId} attrs={{ label: true }}>
            <InputPassword
              name="newPassword"
              label={templateValues.passwordLabel}
              onFocusCb={onNewPwdFocus}
              onBlurCb={onNewPwdBlur}
              onChange={() => onChangePassword('newPassword')}
              hasErrors={
                formState.dirtyFields.newPassword ? errors.newPassword : false
              }
              inputRef={register({
                required: true,
                validate: {
                  length: (value: string) =>
                    value.length > 7 && value.trim() !== '',
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
              aria-describedby="password-requirements"
            />
          </FtlMsg>
        </div>

        <div className=" relative mb-4">
          <FtlMsg
            id={templateValues.confirmPasswordFtlId}
            attrs={{ label: true }}
          >
            <InputPassword
              name="confirmPassword"
              label={templateValues.confirmPasswordLabel}
              className="text-start"
              onFocusCb={onFocusConfirmPassword}
              onBlurCb={onBlurConfirmPassword}
              onChange={() => onChangePassword('confirmPassword')}
              hasErrors={errors.confirmPassword && passwordMatchErrorText}
              inputRef={register({
                required: true,
                validate: (value: string) => value === getValues().newPassword,
              })}
              anchorPosition="end"
              tooltipPosition="bottom"
              prefixDataTestId="verify-password"
              aria-describedby="repeat-password-information"
            />
          </FtlMsg>

          <span
            id="repeat-password-information"
            aria-live="polite"
            className="text-xs"
          >
            <span className="sr-only">{srOnlyConfirmPwdFeedbackMessage}</span>
          </span>
        </div>

        {children}
        <FtlMsg id={templateValues.buttonFtlId}>
          <button
            type="submit"
            className="cta-primary cta-xl"
            disabled={
              loading || (disableButtonUntilValid && !formState.isValid)
            }
          >
            {templateValues.buttonText}
          </button>
        </FtlMsg>
      </form>
    </>
  );
};

export default FormPasswordWithInlineCriteria;
