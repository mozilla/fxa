/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import classNames from 'classnames';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { AuthUiErrors } from '../../lib/auth-errors/auth-errors';
import { getLocalizedErrorMessage } from '../../lib/error-utils';
import { useFtlMsgResolver } from '../../models';
import CmsButtonWithFallback from '../CmsButtonWithFallback';
import InputText from '../InputText';
import { FormVerifyTotpProps, VerifyTotpFormData } from './interfaces';

// Split inputs are not recommended for accesibility
// Code inputs should be a single input field
// See FXA-10390 for details on reverting from split input to single input

const FormVerifyTotp = ({
  clearBanners,
  codeLength,
  codeType,
  errorBannerId,
  errorMessage,
  setErrorDescription,
  localizedInputLabel,
  localizedSubmitButtonText,
  setErrorMessage,
  verifyCode,
  gleanDataAttrs,
  className = '',
  cmsButton,
}: FormVerifyTotpProps) => {
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);

  const ftlMsgResolver = useFtlMsgResolver();

  const { handleSubmit, register } = useForm<VerifyTotpFormData>({
    mode: 'onBlur',
    criteriaMode: 'all',
    defaultValues: {
      code: '',
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (errorMessage) {
      setErrorMessage('');
    }
    if (setErrorDescription) {
      setErrorDescription('');
    }
    // only accept characters that match the code type (numeric or alphanumeric)
    // strip out any other characters
    const filteredCode = e.target.value.replace(
      codeType === 'numeric' ? /[^0-9]/g : /[^a-zA-Z0-9]/g,
      ''
    );
    e.target.value = filteredCode;
    e.target.value.length === codeLength
      ? setIsSubmitDisabled(false)
      : setIsSubmitDisabled(true);
  };

  const onSubmit = async ({ code }: VerifyTotpFormData) => {
    clearBanners && clearBanners();
    setIsSubmitDisabled(true);
    // Only submit the code if it is the correct length
    // Otherwise, show an error message
    if (code.length !== codeLength) {
      setErrorMessage(
        getLocalizedErrorMessage(ftlMsgResolver, AuthUiErrors.INVALID_OTP_CODE)
      );
    } else if (!isSubmitDisabled) {
      await verifyCode(code);
    }
  };

  const getDisabledButtonTitle = () => {
    if (codeType === 'numeric') {
      return ftlMsgResolver.getMsg(
        'form-verify-totp-disabled-button-title-numeric',
        `Enter ${codeLength}-digit code to continue`,
        { codeLength }
      );
    } else {
      return ftlMsgResolver.getMsg(
        'form-verify-totp-disabled-button-title-alphanumeric',
        `Enter ${codeLength}-character code to continue`,
        { codeLength }
      );
    }
  };

  return (
    <form
      noValidate
      className={classNames('flex flex-col gap-4', className)}
      onSubmit={handleSubmit(onSubmit)}
    >
      {/* Using `type="text" inputmode="numeric"` shows the numeric keyboard on mobile
      and strips out whitespace on desktop, but does not add an incrementer. */}
      <InputText
        name="code"
        type="text"
        inputMode={codeType === 'numeric' ? 'numeric' : 'text'}
        label={localizedInputLabel}
        onChange={handleChange}
        maxLength={codeLength}
        className="text-start"
        anchorPosition="start"
        autoComplete="one-time-code"
        spellCheck={false}
        inputRef={register({ required: true })}
        hasErrors={!!errorMessage}
        ariaDescribedBy={errorBannerId}
      />

      <CmsButtonWithFallback
        type="submit"
        className="cta-primary cta-xl"
        disabled={isSubmitDisabled}
        title={isSubmitDisabled ? getDisabledButtonTitle() : ''}
        {...(gleanDataAttrs && {
          'data-glean-id': gleanDataAttrs.id,
          'data-glean-label': gleanDataAttrs.label,
          'data-glean-type': gleanDataAttrs.type,
        })}
        buttonColor={cmsButton?.color}
      >
        {localizedSubmitButtonText}
      </CmsButtonWithFallback>
    </form>
  );
};

export default FormVerifyTotp;
