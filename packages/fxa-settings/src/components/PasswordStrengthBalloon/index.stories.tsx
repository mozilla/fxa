/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import AppLayout from '../AppLayout';
import { Meta } from '@storybook/react';
import PasswordStrengthBalloon, { PasswordStrengthBalloonProps } from '.';
import InputPassword from '../InputPassword';

export default {
  title: 'components/PasswordStrengthBalloon',
  component: PasswordStrengthBalloon,
} as Meta;

const storyWithProps = (
  props: PasswordStrengthBalloonProps,
  passwordExample: string
) => {
  const story = () => (
    <AppLayout>
      <div className="tooltip-container">
        <InputPassword
          label="Password (example only, disabled for storybook)"
          defaultValue={passwordExample}
          className="text-start"
          disabled
        />
        <PasswordStrengthBalloon {...props} />
      </div>
    </AppLayout>
  );
  return story;
};

export const BeforePasswordInput = storyWithProps(
  {
    ...{
      hasUserTakenAction: false,
      isTooShort: true,
      isSameAsEmail: false,
      isCommon: false,
    },
  },
  ''
);

export const isTooShort = storyWithProps(
  {
    ...{
      hasUserTakenAction: true,
      isTooShort: true,
      isSameAsEmail: false,
      isCommon: false,
    },
  },
  'fg5hs34'
);

export const isSameAsEmail = storyWithProps(
  {
    ...{
      hasUserTakenAction: true,
      isTooShort: false,
      isSameAsEmail: true,
      isCommon: false,
    },
  },
  'test@example.com'
);

export const isCommon = storyWithProps(
  {
    ...{
      hasUserTakenAction: true,
      isTooShort: false,
      isSameAsEmail: false,
      isCommon: true,
    },
  },
  '123456789'
);
