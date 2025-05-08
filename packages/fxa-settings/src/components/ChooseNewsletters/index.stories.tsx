/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import ChooseNewsletters from '.';
import AppLayout from '../AppLayout';
import { Meta } from '@storybook/react';
import { SubjectWithNewsletters, SubjectWithNone } from './mocks';
import { withLocalization } from 'fxa-react/lib/storybooks';

export default {
  title: 'Components/ChooseNewsletters',
  component: ChooseNewsletters,
  decorators: [withLocalization],
} as Meta;

export const DefaultNone = () => {
  return (
    <AppLayout>
      <SubjectWithNone />
    </AppLayout>
  );
};

export const DefaultLetters = () => {
  return (
    <AppLayout>
      <SubjectWithNewsletters />
    </AppLayout>
  );
};
