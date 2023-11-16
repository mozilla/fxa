/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { MOCK_DEVICE_ALL } from '../userDevice/mocks';

export const MOCK_USER_INFO = {
  date: 'Thursday, Sep 2, 2021',
  device: MOCK_DEVICE_ALL,
  time: '12:26:44 AM (CEST)',
};

export const MOCK_USER_INFO_ALL = {
  primaryEmail: 'primaryFoo@bar.com',
  ...MOCK_USER_INFO,
};
