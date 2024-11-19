/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { withLocalization } from 'fxa-react/lib/storybooks';
import SetPassword from '.';
import { Meta } from '@storybook/react';
import { SetPasswordProps } from './interfaces';
import { Subject } from './mocks';

export default {
  title: 'Pages/PostVerify/SetPassword',
  component: SetPassword,
  decorators: [withLocalization],
} as Meta;

const storyWithProps = ({
  ...props // overrides
}: Partial<SetPasswordProps> = {}) => {
  const story = () => <Subject {...props} />;
  return story;
};

export const Default = storyWithProps();
