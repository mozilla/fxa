/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Meta } from '@storybook/html';
import { storyWithProps } from '../../storybook-email';
import {
  MOCK_USER_INFO,
  MOCK_USER_INFO_ALL,
  MOCK_USER_INFO_TRUNCATED,
} from './mocks';

export default {
  title: 'Stateful partials/userInfo',
} as Meta;

const createStory = storyWithProps(
  '_storybook',
  'This partial displays user information in various states, depending on what we choose to show in each email template. Check "<b>location</b>" and "<b>userDevice</b>" stories for location and device data varieties.</b>',
  {
    layout: null,
    subject: 'N/A',
    partial: 'userInfo',
  }
);

export const UserInfoAll = createStory(
  {
    ...MOCK_USER_INFO_ALL,
  },
  'All user info: primary email, device, location, IP, date, and time'
);

export const UserInfo = createStory(
  {
    ...MOCK_USER_INFO,
  },
  'Some user info (most commonly used): device, location, IP, date, and time'
);

export const UserInfoTruncated = createStory(
  {
    ...MOCK_USER_INFO_TRUNCATED,
  },
  'Some user info: device, location, and time'
);
