/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useState } from 'react';
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
  email: string;
  formAttributes: FormAttributes;
  onSubmit: () => void;
  code: string;
  setCode: React.Dispatch<React.SetStateAction<string>>;
  codeErrorMessage: string;
  setCodeErrorMessage: React.Dispatch<React.SetStateAction<string>>;
};

type FormData = {
  code: string;
};

const FormVerifyCode = ({
  viewName,
  email,
  onSubmit,
  formAttributes,
  code,
  setCode,
  codeErrorMessage,
  setCodeErrorMessage,
}: FormVerifyCodeProps) => {
  const [isFocused, setIsFocused] = useState<boolean>(false);

  const ftlMsgResolver = useFtlMsgResolver();
  const localizedLabel = ftlMsgResolver.getMsg(
    formAttributes.inputFtlId,
    formAttributes.inputLabelText
  );

  const onFocus = () => {
    if (!isFocused && viewName) {
      logViewEvent('flow', `${viewName}.engage`, REACT_ENTRYPOINT);
      setIsFocused(true);
    }
  };

  const { handleSubmit } = useForm<FormData>({
    mode: 'onBlur',
    criteriaMode: 'all',
    defaultValues: {
      code,
    },
  });

  return (
    <form
      noValidate
      className="flex flex-col gap-4"
      onSubmit={handleSubmit(onSubmit)}
    >
      {/* Using `type="text" inputmode="numeric"` shows the numeric pad on mobile and strips out whitespace on desktop. */}
      <InputText
        type="text"
        inputMode="numeric"
        label={localizedLabel}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          setCode(e.target.value);
          // clear error tooltip if user types in the field
          if (codeErrorMessage) {
            setCodeErrorMessage('');
          }
        }}
        onFocusCb={viewName ? onFocus : undefined}
        errorText={codeErrorMessage}
        autoFocus
        pattern={formAttributes.pattern}
        maxLength={formAttributes.maxLength}
        className="text-start"
        anchorStart
        autoComplete="off"
        spellCheck={false}
        prefixDataTestId={viewName}
        required
        tooltipPosition="bottom"
      />

      <FtlMsg id={formAttributes.submitButtonFtlId}>
        <button type="submit" className="cta-primary cta-xl">
          {formAttributes.submitButtonText}
        </button>
      </FtlMsg>
    </form>
  );
};

export default FormVerifyCode;
