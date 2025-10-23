/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { FtlMsg } from 'fxa-react/lib/utils';
import React, { useCallback, useState } from 'react';
import { UseFormMethods } from 'react-hook-form';
import PasswordValidator from '../../lib/password-validator';
import { useFtlMsgResolver } from '../../models';
import CmsButtonWithFallback, { CmsButtonType } from '../CmsButtonWithFallback';
import InputPassword from '../InputPassword';
import PasswordStrengthInline from '../PasswordStrengthInline';

export type PasswordFormType = 'signup' | 'reset' | 'post-verify-set-password';

export type FormPasswordWithInlineCriteriaProps = {
  passwordFormType: PasswordFormType;
  formState: UseFormMethods['formState'];
  errors: UseFormMethods['errors'];
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  trigger: UseFormMethods['trigger'];
  register: UseFormMethods['register'];
  getValues: UseFormMethods['getValues'];
  email: string;
  loading: boolean;
  disableButtonUntilValid?: boolean;
  onFocusMetricsEvent?: () => void;
  requirePasswordConfirmation?: boolean;
  submitButtonGleanId?: string;
  cmsButton?: CmsButtonType;
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
      templateValues.confirmPasswordLabel = 'Confirm password';
      templateValues.buttonFtlId =
        'form-password-with-inline-criteria-reset-submit-button';
      templateValues.buttonText = 'Create new password';
      break;
    case 'post-verify-set-password':
      templateValues.passwordFtlId =
        'form-password-with-inline-criteria-set-password-new-password-label';
      templateValues.passwordLabel = 'Password';
      templateValues.confirmPasswordFtlId =
        'form-password-with-inline-criteria-set-password-confirm-password-label';
      templateValues.confirmPasswordLabel = 'Repeat password';
      templateValues.buttonFtlId =
        'form-password-with-inline-criteria-set-password-submit-button';
      templateValues.buttonText = 'Start syncing';
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
  disableButtonUntilValid = true,
  requirePasswordConfirmation = false,
  submitButtonGleanId,
  cmsButton,
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
  const showConfirmPasswordInput =
    passwordFormType === 'reset' || !!requirePasswordConfirmation;

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
      showConfirmPasswordInput &&
      !errors.newPassword &&
      getValues('confirmPassword') !== '' &&
      getValues('confirmPassword') !== getValues('newPassword')
    ) {
      setPasswordMatchErrorText(localizedPasswordMatchError);
    }

    if (!formState.isValid && showConfirmPasswordInput) {
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
    const confirmPassword = showConfirmPasswordInput
      ? getValues('confirmPassword')
      : '';
    if (inputName === 'newPassword') {
      trigger('newPassword');
    }

    if (!errors.newPassword) {
      setSROnlyPwdFeedbackMessage('');
    }

    if (!showConfirmPasswordInput) {
      return;
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
        {/* PasswordStrengthInline duplicated here because there are two
            possible placements (above the input for reset, below the input for
            other cases) */}
        {passwordFormType === 'reset' && (
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
                passwordFormType,
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
        )}

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

        {showConfirmPasswordInput && (
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
                  validate: (value: string) =>
                    value === getValues().newPassword,
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
        )}

        {(passwordFormType === 'signup' ||
          passwordFormType === 'post-verify-set-password') && (
          <div className="mb-1">
            <PasswordStrengthInline
              {...{
                isPasswordEmpty: (getValues('newPassword')?.length || 0) === 0,
                isConfirmedPasswordEmpty:
                  (getValues('confirmPassword')?.length || 0) === 0,
                isTooShort: errors.newPassword?.types?.length,
                isSameAsEmail: errors.newPassword?.types?.notEmail,
                isCommon: errors.newPassword?.types?.uncommon,
                isUnconfirmed: requirePasswordConfirmation
                  ? getValues('confirmPassword') !== getValues('newPassword')
                  : undefined,
                passwordFormType,
                requirePasswordConfirmation,
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
        )}

        <FtlMsg id={templateValues.buttonFtlId}>
          <CmsButtonWithFallback
            type="submit"
            className="cta-primary cta-xl"
            disabled={
              loading || (disableButtonUntilValid && !formState.isValid)
            }
            data-glean-id={submitButtonGleanId && submitButtonGleanId}
            buttonColor={cmsButton?.color}
            buttonText={cmsButton?.text}
          >
            {templateValues.buttonText}
          </CmsButtonWithFallback>
        </FtlMsg>
      </form>
    </>
  );
};

export default FormPasswordWithInlineCriteria;
