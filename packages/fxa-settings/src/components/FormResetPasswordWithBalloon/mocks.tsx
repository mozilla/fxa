/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import FormResetPasswordWithBalloon from '.';

export const Subject = () => {
  type FormData = {
    oldPassword?: string;
    newPassword: string;
    confirmPassword: string;
  };
  const onFormSubmit = () => {
    // this alert is for Storybook
    alert('Form submitted! (onFormSubmit called)');
  };

  const [newPasswordErrorText, setNewPasswordErrorText] = useState<string>();

  const { handleSubmit, register, getValues, errors, formState, trigger } =
    useForm<FormData>({
      mode: 'onTouched',
      criteriaMode: 'all',
      defaultValues: {
        newPassword: '',
        confirmPassword: '',
      },
    });

  return (
    <FormResetPasswordWithBalloon
      {...{
        formState,
        errors,
        trigger,
        register,
        getValues,
        newPasswordErrorText,
        setNewPasswordErrorText,
      }}
      onSubmit={handleSubmit(onFormSubmit)}
      email="test@example.com"
      loading={false}
      onFocusMetricsEvent="test-event"
    />
  );
};
