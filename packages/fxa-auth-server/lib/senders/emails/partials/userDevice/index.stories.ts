/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Meta } from '@storybook/html';
import { storyWithProps } from '../../storybook-email';
import {
  MOCK_DEVICE_ALL,
  MOCK_DEVICE_BROWSER,
  MOCK_DEVICE_BROWSER_OS,
  MOCK_DEVICE_OS,
  MOCK_DEVICE_OS_VERSION,
} from './mocks';

export default {
  title: 'Stateful partials/userInfo/userDevice',
} as Meta;

const createStory = storyWithProps(
  '_storybook',
  'The userDevice partial within userInfo, with various states depending on what data is available.',
  {
    subject: 'N/A',
    partial: 'userInfo',
    layout: null,
  }
);

export const DeviceAll = createStory(
  {
    device: MOCK_DEVICE_ALL,
  },
  'All device details: browser, OS, and OS version'
);

export const DeviceBrowserOs = createStory(
  {
    device: MOCK_DEVICE_BROWSER_OS,
  },
  'Some device details: browser and OS'
);

export const DeviceBrowser = createStory(
  {
    device: MOCK_DEVICE_BROWSER,
  },
  'Some device details: browser'
);

export const DeviceOS = createStory(
  {
    device: MOCK_DEVICE_OS,
  },
  'Some device details: OS'
);

export const DeviceOSVersion = createStory(
  {
    device: MOCK_DEVICE_OS_VERSION,
  },
  'Some device details: OS and OS version'
);
