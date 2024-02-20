/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useState } from 'react';
import FormVerifyCode, { FormAttributes, FormVerifyCodeProps } from '.';

export const Subject = ({
  localizedCustomCodeRequiredMessage = '',
}: Partial<FormVerifyCodeProps>) => {
  const [codeErrorMessage, setCodeErrorMessage] = useState<string>('');

  const formAttributes: FormAttributes = {
    inputFtlId: 'demo-input-label-id',
    inputLabelText: 'Enter your 4-digit code',
    pattern: '[0-9]{4}',
    maxLength: 4,
    submitButtonFtlId: 'demo-submit-button-id',
    submitButtonText: 'Check that code',
  };

  const onFormSubmit = async () => {
    alert('Trying to submit');
  };

  return (
    <FormVerifyCode
      verifyCode={onFormSubmit}
      viewName="default-view"
      {...{
        formAttributes,
        localizedCustomCodeRequiredMessage,
        codeErrorMessage,
        setCodeErrorMessage,
      }}
    />
  );
};
