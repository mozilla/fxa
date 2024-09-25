/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import AppLayout from '../AppLayout';
import { Meta } from '@storybook/react';
import PasswordStrengthInline, { PasswordStrengthInlineProps } from '.';
import InputPassword from '../InputPassword';
import { withLocalization } from 'fxa-react/lib/storybooks';

export default {
  title: 'Components/PasswordStrengthInline',
  component: PasswordStrengthInline,
  decorators: [withLocalization],
} as Meta;

const storyWithProps = (
  props: PasswordStrengthInlineProps,
  passwordExample: string,
  confirmPasswordExample: string
) => {
  const story = () => (
    <AppLayout>
      <div className="relative">
        <InputPassword
          label="Password (example only, disabled for storybook)"
          defaultValue={passwordExample}
          className="text-start"
          disabled
        />
        <br />
        <InputPassword
          label="Confirm Password (example only, disabled for storybook)"
          defaultValue={confirmPasswordExample}
          className="text-start"
          disabled
        />
        <br />

        <PasswordStrengthInline {...props} />
      </div>
    </AppLayout>
  );
  return story;
};

export const BeforePasswordInput = storyWithProps(
  {
    ...{
      isPasswordEmpty: true,
      isConfirmedPasswordEmpty: true,
      isTooShort: false,
      isSameAsEmail: false,
      isCommon: false,
      isUnconfirmed: true,
    },
  },
  '',
  ''
);

export const isTooShort = storyWithProps(
  {
    ...{
      isPasswordEmpty: false,
      isConfirmedPasswordEmpty: true,
      isTooShort: true,
      isSameAsEmail: false,
      isCommon: false,
      isUnconfirmed: true,
    },
  },
  'fg5hs34',
  ''
);

export const isSameAsEmail = storyWithProps(
  {
    ...{
      isPasswordEmpty: false,
      isConfirmedPasswordEmpty: true,
      isTooShort: false,
      isSameAsEmail: true,
      isCommon: false,
      isUnconfirmed: true,
    },
  },
  'test@example.com',
  ''
);

export const isCommon = storyWithProps(
  {
    ...{
      isPasswordEmpty: false,
      isConfirmedPasswordEmpty: true,
      isTooShort: false,
      isSameAsEmail: false,
      isCommon: true,
      isUnconfirmed: true,
    },
  },
  '123456789',
  ''
);

export const beforeConfirmedInput = storyWithProps(
  {
    ...{
      isPasswordEmpty: false,
      isConfirmedPasswordEmpty: true,
      isTooShort: false,
      isSameAsEmail: false,
      isCommon: false,
      isUnconfirmed: true,
    },
  },
  '123456789',
  ''
);

export const afterConfirmedInputDoesNotMatch = storyWithProps(
  {
    ...{
      isPasswordEmpty: false,
      isConfirmedPasswordEmpty: false,
      isTooShort: false,
      isSameAsEmail: false,
      isCommon: false,
      isUnconfirmed: true,
    },
  },
  '123456789',
  '12345678'
);

export const afterConfirmedInputMatches = storyWithProps(
  {
    ...{
      isPasswordEmpty: false,
      isConfirmedPasswordEmpty: false,
      confirmPassword: '1324abcde',
      isTooShort: false,
      isSameAsEmail: false,
      isCommon: false,
      isUnconfirmed: false,
    },
  },
  '123456789',
  '123456789'
);
