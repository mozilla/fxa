/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import FormPassword from '.';

export const Subject = ({ includeCurrentPw = true }) => {
  type FormData = {
    oldPassword?: string;
    newPassword: string;
    confirmPassword: string;
  };
  const onFormSubmit = () => {
    // this alert is for Storybook
    alert('Form submitted! (onFormSubmit called)');
  };
  const [currentPasswordErrorText, setCurrentPasswordErrorText] =
    useState<string>();
  const [newPasswordErrorText, setNewPasswordErrorText] = useState<string>();

  const { handleSubmit, register, getValues, errors, formState, trigger } =
    useForm<FormData>({
      mode: 'onTouched',
      criteriaMode: 'all',
      defaultValues: {
        ...(includeCurrentPw && {
          oldPassword: '',
        }),
        newPassword: '',
        confirmPassword: '',
      },
    });

  return (
    <FormPassword
      {...{
        formState,
        errors,
        trigger,
        register,
        getValues,
        ...(includeCurrentPw && {
          currentPasswordErrorText,
          setCurrentPasswordErrorText,
        }),
        newPasswordErrorText,
        setNewPasswordErrorText,
      }}
      onSubmit={handleSubmit(onFormSubmit)}
      primaryEmail="test@example.com"
      loading={false}
    />
  );
};
