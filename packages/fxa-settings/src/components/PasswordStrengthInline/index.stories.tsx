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
  passwordExample: string
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
        <PasswordStrengthInline {...props} />
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
      isUnconfirmed: undefined,
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
      isUnconfirmed: undefined,
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
      isUnconfirmed: undefined,
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
      isUnconfirmed: undefined,
    },
  },
  '123456789'
);
