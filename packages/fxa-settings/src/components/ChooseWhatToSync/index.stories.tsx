/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import ChooseWhatToSync from '.';
import AppLayout from '../AppLayout';
import { Meta } from '@storybook/react';
import { Subject } from './mocks';

export default {
  title: 'components/ChooseWhatToSync',
  component: ChooseWhatToSync,
} as Meta;

export const Default = () => {
  return (
    <AppLayout>
      <Subject />
    </AppLayout>
  );
};
