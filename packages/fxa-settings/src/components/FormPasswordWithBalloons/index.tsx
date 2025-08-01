/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useCallback, useRef, useState, useEffect } from 'react';
import { UseFormMethods } from 'react-hook-form';
import InputPassword from '../InputPassword';
import PasswordValidator from '../../lib/password-validator';
import { FtlMsg } from 'fxa-react/lib/utils';
import { useFtlMsgResolver } from '../../models';
import { SHOW_BALLOON_TIMEOUT, HIDE_BALLOON_TIMEOUT } from '../../constants';
import PasswordStrengthBalloon from '../PasswordStrengthBalloon';
import PasswordInfoBalloon from '../PasswordInfoBalloon';
import CmsButtonWithFallback, { CmsButtonType } from '../CmsButtonWithFallback';

export type PasswordFormType = 'signup' | 'reset' | 'post-verify-set-password';

export type FormPasswordWithBalloonsProps = {
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
  submitButtonGleanId?: string;
  requirePasswordConfirmation?: boolean;
  cmsButton?: CmsButtonType;
};

interface TemplateValues {
  passwordFtlId: string;
  passwordLabel: string;
  confirmPasswordFtlId: string;
  confirmPasswordLabel: string;
  buttonFtlId: string;
  buttonText: string;
}

const commonFields: Omit<TemplateValues, 'buttonFtlId' | 'buttonText'> = {
  passwordFtlId: 'signup-new-password-label',
  passwordLabel: 'Password',
  confirmPasswordFtlId: 'signup-confirm-password-label',
  confirmPasswordLabel: 'Repeat password',
};

const getTemplateValues = (
  passwordFormType: PasswordFormType
): TemplateValues => {
  switch (passwordFormType) {
    case 'signup':
      return {
        ...commonFields,
        buttonFtlId: 'signup-submit-button',
        buttonText: 'Create account',
      };
    case 'post-verify-set-password':
      return {
        ...commonFields,
        buttonFtlId: 'post-verify-set-password-submit-button',
        buttonText: 'Start syncing',
      };
    case 'reset':
      return {
        passwordFtlId: 'form-reset-password-with-balloon-new-password',
        passwordLabel: 'New password',
        confirmPasswordFtlId:
          'form-reset-password-with-balloon-confirm-password',
        confirmPasswordLabel: 'Re-enter password',
        buttonFtlId: 'form-reset-password-with-balloon-submit-button',
        buttonText: 'Reset password',
      };
  }
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
  submitButtonGleanId,
  requirePasswordConfirmation = true,
  cmsButton,
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
  const [hasBlurredConfirmPwd, setHasBlurredConfirmPwd] =
    useState<boolean>(false);
  const [srOnlyPwdFeedbackMessage, setSROnlyPwdFeedbackMessage] =
    useState<string>();
  const [srOnlyConfirmPwdFeedbackMessage, setSROnlyConfirmPwdFeedbackMessage] =
    useState<string>();
  const [emitEngageEvent, setEmitEngageEvent] = useState<boolean>(false);

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
    setSROnlyPwdFeedbackMessage('');
    setSROnlyConfirmPwdFeedbackMessage('');
    setPasswordMatchErrorText('');
    if (!hasNewPwdFocused) {
      setHasNewPwdFocused(true);
    }
  };

  // We are currently on React form hook V6 and this version
  // does not expose any focus methods. Upgrading is major refactor
  // so instead we pass an optional `inputRefDOM` that can
  // trigger focus and click events.
  const newPasswordRef = useRef<HTMLInputElement>(null);

  // Auto-focus the new password input on mount
  useEffect(() => {
    if (newPasswordRef.current) {
      newPasswordRef.current.focus();
      newPasswordRef.current.click();
    }
  }, []);

  useEffect(() => {
    if (hasUserTakenAction && onFocusMetricsEvent && !emitEngageEvent) {
      onFocusMetricsEvent();
      setEmitEngageEvent(true);
    }
  }, [hasUserTakenAction, onFocusMetricsEvent, emitEngageEvent]);

  const onNewPwdBlur = () => {
    // do not hide the password strength balloon if there are errors in the new password
    if (!errors.newPassword) {
      hideNewPwdBalloon();
      const srOnlyPasswordMeetsRequirements = ftlMsgResolver.getMsg(
        'form-password-sr-requirements-met',
        'The entered password respects all password requirements.'
      );
      setSROnlyPwdFeedbackMessage(srOnlyPasswordMeetsRequirements);
    } else {
      // if there are errors on blur, announce a screen-reader only message
      // visual feedback is provided by the password strength ballon
      if (errors.newPassword?.types?.length) {
        const srOnlyTooShortMessage = ftlMsgResolver.getMsg(
          'form-password-sr-too-short-message',
          'Password must contain at least 8 characters.'
        );
        setSROnlyPwdFeedbackMessage(srOnlyTooShortMessage);
      } else if (errors.newPassword?.types?.notEmail) {
        const srOnlyNotEmailMessage = ftlMsgResolver.getMsg(
          'form-password-sr-not-email-message',
          'Password must not contain your email address.'
        );
        setSROnlyPwdFeedbackMessage(srOnlyNotEmailMessage);
      } else if (errors.newPassword?.types?.uncommon) {
        const srOnlyNotCommonMessage = ftlMsgResolver.getMsg(
          'form-password-sr-not-common-message',
          'Password must not be a commonly used password.'
        );
        setSROnlyPwdFeedbackMessage(srOnlyNotCommonMessage);
      }
    }
    if (
      requirePasswordConfirmation &&
      hasBlurredConfirmPwd &&
      !errors.newPassword &&
      getValues('confirmPassword') !== '' &&
      getValues('confirmPassword') !== getValues('newPassword')
    ) {
      setPasswordMatchErrorText(localizedPasswordMatchError);
    }

    if (!formState.isValid && requirePasswordConfirmation) {
      trigger('confirmPassword');
    }
  };

  const onFocusConfirmPassword = useCallback(() => {
    setPasswordMatchErrorText('');
    setSROnlyPwdFeedbackMessage('');
    setSROnlyConfirmPwdFeedbackMessage('');
    if (
      passwordFormType === 'signup' &&
      getValues('newPassword') !== '' &&
      !errors.newPassword
    )
      showConfirmPwdBalloon();
  }, [errors.newPassword, getValues, passwordFormType, showConfirmPwdBalloon]);

  const onBlurConfirmPassword = useCallback(() => {
    setHasBlurredConfirmPwd(true);
    passwordFormType === 'signup' &&
      isConfirmPwdBalloonVisible &&
      hideConfirmPwdBalloon();

    if (getValues('confirmPassword') !== getValues('newPassword')) {
      setPasswordMatchErrorText(localizedPasswordMatchError);
    } else {
      const srOnlyPasswordsMatch = ftlMsgResolver.getMsg(
        'form-password-sr-passwords-match',
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
    hideConfirmPwdBalloon,
    isConfirmPwdBalloonVisible,
    localizedPasswordMatchError,
    passwordFormType,
    setPasswordMatchErrorText,
    trigger,
  ]);

  const onChangePassword = (inputName: string) => {
    const newPassword = getValues('newPassword');
    const confirmPassword = requirePasswordConfirmation
      ? getValues('confirmPassword')
      : '';
    if (inputName === 'newPassword') {
      !hasUserTakenAction && setHasUserTakenAction(true);
      trigger('newPassword');
    }

    if (!errors.newPassword) {
      setSROnlyPwdFeedbackMessage('');
    }

    if (!hasBlurredConfirmPwd || !requirePasswordConfirmation) {
      return;
    }

    if (
      hasBlurredConfirmPwd &&
      confirmPassword !== newPassword &&
      confirmPassword !== ''
    ) {
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
                  // TODO in FXA-7482, review our password requirements and best way to display them
                  // For now, this most closely matches parity to Backbone for a space-only password
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
              inputRefDOM={newPasswordRef}
              prefixDataTestId="new-password"
              aria-describedby="password-requirements"
            />
          </FtlMsg>
          <span
            id="password-requirements"
            aria-live="polite"
            className="text-xs"
          >
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
            {srOnlyPwdFeedbackMessage && (
              <span className="sr-only">{srOnlyPwdFeedbackMessage}</span>
            )}
          </span>
        </div>

        {requirePasswordConfirmation && (
          <div className=" relative mb-4">
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
                onFocusCb={onFocusConfirmPassword}
                onBlurCb={onBlurConfirmPassword}
                onChange={() => onChangePassword('confirmPassword')}
                hasErrors={errors.confirmPassword && passwordMatchErrorText}
                errorText={passwordMatchErrorText}
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
              {isConfirmPwdBalloonVisible && <PasswordInfoBalloon />}
              {srOnlyConfirmPwdFeedbackMessage && (
                <span className="sr-only">
                  {srOnlyConfirmPwdFeedbackMessage}
                </span>
              )}
            </span>
          </div>
        )}

        {children}

        <FtlMsg id={templateValues.buttonFtlId}>
          <CmsButtonWithFallback
            type="submit"
            className="cta-primary cta-xl"
            disabled={
              loading || (!formState.isValid && disableButtonUntilValid)
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

export default FormPasswordWithBalloons;
