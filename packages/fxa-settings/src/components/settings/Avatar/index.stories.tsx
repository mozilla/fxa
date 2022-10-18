/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import Avatar from '.';
import { Account, AppSettingsContext } from '../../../models';
import { mockAppSettingsContext } from '../../../models/mocks';
import { MOCK_AVATAR_DEFAULT, MOCK_AVATAR_NON_DEFAULT } from './mocks';
import { Meta } from '@storybook/react';

export default {
  title: 'Components/Avatar',
  component: Avatar,
} as Meta;

const storyWithContext = (account: Account, storyName?: string) => {
  const story = () => (
    <AppSettingsContext.Provider value={mockAppSettingsContext({ account })}>
      <Avatar className="w-32 h-32" />
    </AppSettingsContext.Provider>
  );
  if (storyName) story.storyName = storyName;
  return story;
};

export const DefaultAvatar = storyWithContext(MOCK_AVATAR_DEFAULT);

export const NonDefaultAvatar = storyWithContext(MOCK_AVATAR_NON_DEFAULT);
