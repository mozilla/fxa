/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import InputText from '../../components/InputText';
import { FtlMsg } from 'fxa-react/lib/utils';
import { logViewEvent } from '../../lib/metrics';
import { REACT_ENTRYPOINT } from '../../constants';
import { useFtlMsgResolver } from '../../models';

export type FormAttributes = {
  inputLabelText: string;
  inputFtlId: string;
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
}: FormVerifyCodeProps) => {
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

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

  const { handleSubmit, register, errors } = useForm<FormData>({
    mode: 'onBlur',
    criteriaMode: 'all',
    defaultValues: {
      code: '',
    },
  });

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

  return (
    <form
      noValidate
      className="flex flex-col gap-4"
      onSubmit={handleSubmit(onSubmit)}
    >
      {/* Using `type="text" inputmode="numeric"` shows the numeric pad on mobile and strips out whitespace on desktop. */}
      <InputText
        name="code"
        type="text"
        inputMode="numeric"
        label={localizedLabel}
        onChange={
          setClearMessages
            ? () => setClearMessages(true)
            : () => setCodeErrorMessage('')
        }
        onFocusCb={viewName ? onFocus : undefined}
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
        inputRef={register({ required: true })}
      />

      <FtlMsg id={formAttributes.submitButtonFtlId}>
        <button
          type="submit"
          className="cta-primary cta-xl"
          disabled={isSubmitting}
        >
          {formAttributes.submitButtonText}
        </button>
      </FtlMsg>
    </form>
  );
};

export default FormVerifyCode;
