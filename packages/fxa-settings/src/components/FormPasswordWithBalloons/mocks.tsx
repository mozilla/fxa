/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { useForm } from 'react-hook-form';
import FormPasswordWithBalloons, { FormPasswordWithBalloonsProps } from '.';
import { MOCK_ACCOUNT } from '../../models/mocks';

export const Subject = ({
  passwordFormType = 'signup',
  requirePasswordConfirmation,
}: Partial<FormPasswordWithBalloonsProps>) => {
  type FormData = {
    oldPassword?: string;
    newPassword: string;
    confirmPassword: string;
  };
  const onFormSubmit = () => {
    // this alert is for Storybook
    alert('Form submitted! (onFormSubmit called)');
  };

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
    <FormPasswordWithBalloons
      {...{
        formState,
        errors,
        trigger,
        register,
        getValues,
        passwordFormType,
        requirePasswordConfirmation,
      }}
      onSubmit={handleSubmit(onFormSubmit)}
      email={MOCK_ACCOUNT.primaryEmail.email}
      loading={false}
      onFocusMetricsEvent={() => {}}
    />
  );
};
