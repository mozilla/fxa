/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import FormPasswordWithBalloons, { PasswordFormType } from '.';
import { MOCK_ACCOUNT } from '../../models/mocks';

type SubjectProps = {
  passwordFormType: PasswordFormType;
};

export const Subject = ({ passwordFormType }: SubjectProps) => {
  type FormData = {
    oldPassword?: string;
    newPassword: string;
    confirmPassword: string;
  };
  const onFormSubmit = () => {
    // this alert is for Storybook
    alert('Form submitted! (onFormSubmit called)');
  };

  const [passwordMatchErrorText, setPasswordMatchErrorText] =
    useState<string>('');

  const { handleSubmit, register, watch, errors, formState, trigger } =
    useForm<FormData>({
      mode: 'onChange',
      criteriaMode: 'all',
      defaultValues: {
        newPassword: '',
        confirmPassword: '',
      },
    });

  return (
    <FormPasswordWithBalloons
      {...{
        formState,
        errors,
        trigger,
        register,
        watch,
        passwordFormType,
        passwordMatchErrorText,
        setPasswordMatchErrorText,
      }}
      onSubmit={handleSubmit(onFormSubmit)}
      email={MOCK_ACCOUNT.primaryEmail.email}
      onEngageMetricsEvent="test-event"
    />
  );
};
