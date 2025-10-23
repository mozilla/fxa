/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { useState } from 'react';
import FormVerifyCode, { FormAttributes, FormVerifyCodeProps } from '.';

const onFormSubmit = async () => {
  alert('Trying to submit');
};

export const Subject = ({
  localizedCustomCodeRequiredMessage = '',
  verifyCode = onFormSubmit,
  submitFormOnPaste = true,
  formAttributes: customFormAttributes,
}: Partial<FormVerifyCodeProps> & { formAttributes?: FormAttributes }) => {
  const [codeErrorMessage, setCodeErrorMessage] = useState<string>('');

  const formAttributes: FormAttributes = customFormAttributes || {
    inputFtlId: 'demo-input-label-id',
    inputLabelText: 'Enter your 4-digit code',
    pattern: '[0-9]{4}',
    maxLength: 4,
    submitButtonFtlId: 'demo-submit-button-id',
    submitButtonText: 'Check that code',
  };

  return (
    <FormVerifyCode
      viewName="default-view"
      {...{
        formAttributes,
        localizedCustomCodeRequiredMessage,
        verifyCode,
        submitFormOnPaste,
        codeErrorMessage,
        setCodeErrorMessage,
      }}
    />
  );
};
