/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { FtlMsg } from 'fxa-react/lib/utils';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import InputText from '../../components/InputText';
import { REACT_ENTRYPOINT } from '../../constants';
import { logViewEvent } from '../../lib/metrics';
import { GleanClickEventDataAttrs } from '../../lib/types';
import { useFtlMsgResolver } from '../../models';
import CmsButtonWithFallback, { CmsButtonType } from '../CmsButtonWithFallback';

export enum InputModeEnum {
  text = 'text',
  tel = 'tel',
  email = 'email',
  numeric = 'numeric',
}

export const commonBackupCodeFormAttributes = {
  inputMode: InputModeEnum.text,
  pattern: '[a-zA-Z0-9]',
  maxLength: 10,
};

export type FormAttributes = {
  inputLabelText: string;
  inputFtlId: string;
  inputMode?: InputModeEnum;
  pattern: string;
  maxLength: number;
  submitButtonText: string;
  submitButtonFtlId: string;
};

export type FormVerifyCodeProps = {
  viewName: string;
  formAttributes: FormAttributes;
  verifyCode: (code: string) => Promise<void>;
  localizedCustomCodeRequiredMessage?: string;
  codeErrorMessage: string;
  setCodeErrorMessage: React.Dispatch<React.SetStateAction<string>>;
  setClearMessages?: React.Dispatch<React.SetStateAction<boolean>>;
  isLoading?: boolean;
  gleanDataAttrs?: GleanClickEventDataAttrs;
  submitFormOnPaste?: boolean;
  cmsButton?: CmsButtonType;
};

type FormData = {
  code: string;
};

const FormVerifyCode = ({
  viewName,
  verifyCode,
  formAttributes,
  localizedCustomCodeRequiredMessage,
  codeErrorMessage,
  setCodeErrorMessage,
  setClearMessages,
  gleanDataAttrs,
  submitFormOnPaste,
  cmsButton,
}: FormVerifyCodeProps) => {
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isDisabled, setIsDisabled] = useState<boolean>(true);

  const ftlMsgResolver = useFtlMsgResolver();
  const localizedLabel = ftlMsgResolver.getMsg(
    formAttributes.inputFtlId,
    formAttributes.inputLabelText
  );

  const onFocus = () => {
    if (!isFocused && viewName) {
      logViewEvent(`flow.${viewName}`, 'engage', REACT_ENTRYPOINT);
      setIsFocused(true);
    }
  };

  const { handleSubmit, register, errors, watch } = useForm<FormData>({
    mode: 'onBlur',
    criteriaMode: 'all',
    defaultValues: {
      code: '',
    },
  });

  const codeValue = watch('code');

  const localizedDefaultCodeRequiredMessage = ftlMsgResolver.getMsg(
    'form-verify-code-default-error',
    'This field is required'
  );

  useEffect(() => {
    if (errors?.code?.type === 'required') {
      setCodeErrorMessage(
        localizedCustomCodeRequiredMessage ||
          localizedDefaultCodeRequiredMessage
      );
    }
  }, [
    errors,
    setCodeErrorMessage,
    localizedCustomCodeRequiredMessage,
    localizedDefaultCodeRequiredMessage,
  ]);

  const onSubmit = async ({ code }: FormData) => {
    setIsSubmitting(true);
    await verifyCode(code.trim());
    setIsSubmitting(false);
  };

  const onPaste = async (event: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedText = event.clipboardData.getData('text').trim();
    const isValid = new RegExp(formAttributes.pattern).test(pastedText);
    if (isValid) {
      onSubmit({ code: pastedText });
    }
  };

  useEffect(() => {
    if (codeValue && codeValue.length > 0) {
      const isValid = new RegExp(formAttributes.pattern).test(codeValue);
      setIsDisabled(!isValid);
    } else {
      setIsDisabled(true);
    }
  }, [codeValue, formAttributes.pattern]);

  return (
    <form
      noValidate
      className="flex flex-col gap-4 my-6"
      onSubmit={handleSubmit(onSubmit)}
    >
      {/* Using `type="text" inputmode="numeric"` shows the numeric keyboard on mobile
      and strips out whitespace on desktop, but does not add an incrementer. */}
      <InputText
        name="code"
        type="text"
        inputMode={formAttributes.inputMode || InputModeEnum.numeric}
        label={localizedLabel}
        onChange={
          setClearMessages
            ? () => setClearMessages(true)
            : () => setCodeErrorMessage('')
        }
        onFocusCb={viewName ? onFocus : undefined}
        onPaste={submitFormOnPaste ? onPaste : undefined}
        errorText={codeErrorMessage}
        autoFocus
        pattern={formAttributes.pattern}
        maxLength={formAttributes.maxLength}
        className="text-start"
        anchorPosition="start"
        autoComplete="off"
        spellCheck={false}
        prefixDataTestId={viewName}
        tooltipPosition="bottom"
        inputRef={register({
          required: true,
        })}
      />

      <FtlMsg id={formAttributes.submitButtonFtlId}>
        <CmsButtonWithFallback
          type="submit"
          className="cta-primary cta-xl"
          disabled={isSubmitting || isDisabled}
          data-glean-id={gleanDataAttrs?.id}
          data-glean-label={gleanDataAttrs?.label}
          data-glean-type={gleanDataAttrs?.type}
          buttonColor={cmsButton?.color}
          buttonText={cmsButton?.text}
        >
          {formAttributes.submitButtonText}
        </CmsButtonWithFallback>
      </FtlMsg>
    </form>
  );
};

export default FormVerifyCode;
