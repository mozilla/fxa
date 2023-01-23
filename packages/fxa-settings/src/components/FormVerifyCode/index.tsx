/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import InputText from '../../components/InputText';
import { FtlMsg } from 'fxa-react/lib/utils';
import { logViewEvent } from '../../lib/metrics';

export type FormAttributes = {
  inputLabelText: string;
  inputFtlId: string;
  pattern: string;
  maxLength: number;
  submitButtonText: string;
  submitButtonFtlId: string;
};

// TODO: fix typing for onSubmit function
export type FormVerifyCodeProps = {
  viewName: string;
  email: string;
  formAttributes: FormAttributes;
  onSubmit: any;
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
  const [isFocused, setIsFocused] = useState(false);
  // const alertBar = useAlertBar();

  const onFocus = () => {
    if (!isFocused && viewName) {
      logViewEvent('flow', `${viewName}.engage`, {
        entrypoint_variation: 'react',
      });
      setIsFocused(true);
    }
  };

  const { handleSubmit } = useForm<FormData>({
    mode: 'onBlur',
    criteriaMode: 'all',
    defaultValues: {
      code: code,
    },
  });

  return (
    <form
      noValidate
      className="flex flex-col gap-4"
      onSubmit={handleSubmit(onSubmit)}
    >
      {/* Using `type="text" inputmode="numeric"` shows the numeric pad on mobile and strips out whitespace on desktop. */}
      <FtlMsg id={formAttributes.inputFtlId}>
        <InputText
          type="text"
          inputMode="numeric"
          label={formAttributes.inputLabelText}
          // TODO
          onChange={(e) => {
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
      </FtlMsg>

      <FtlMsg id={formAttributes.submitButtonFtlId}>
        <button type="submit" className="cta-primary cta-xl">
          {formAttributes.submitButtonText}
        </button>
      </FtlMsg>
    </form>
  );
};

export default FormVerifyCode;
