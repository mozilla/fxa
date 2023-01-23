/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import FormVerifyCode, { FormAttributes } from '.';
import { useFtlMsgResolver } from '../../models';

export const MOCK_EMAIL = 'test@example.com';

export const Subject = () => {
  type FormData = {
    code?: string;
  };

  const [code, setCode] = useState<string>('');
  const [codeErrorMessage, setCodeErrorMessage] = useState<string>('');
  const ftlMsgResolver = useFtlMsgResolver();

  const formAttributes: FormAttributes = {
    inputFtlId: 'demo-input-label-id',
    inputLabelText: 'Enter your 4-digit code',
    pattern: '[0-9]{4}',
    maxLength: 4,
    submitButtonFtlId: 'demo-submit-button-id',
    submitButtonText: 'Check that code',
  };

  const onFormSubmit = () => {
    if (!code) {
      const codeRequiredError = ftlMsgResolver.getMsg(
        'confirm-signup-code-required-error',
        'Confirmation code required'
      );
      setCodeErrorMessage(codeRequiredError);
    }
  };

  const { handleSubmit } = useForm<FormData>({
    mode: 'onBlur',
    criteriaMode: 'all',
    defaultValues: {
      code: '',
    },
  });

  return (
    <FormVerifyCode
      email={MOCK_EMAIL}
      onSubmit={handleSubmit(onFormSubmit)}
      viewName="default-view"
      {...{
        formAttributes,
        code,
        setCode,
        codeErrorMessage,
        setCodeErrorMessage,
      }}
    />
  );
};
