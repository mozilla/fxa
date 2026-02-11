/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assign, pick } from 'underscore';
import UserAgent from '../../../lib/user-agent';

export default function setRemoteMetaData(remoteMetaData) {
  const userAgent = new UserAgent(remoteMetaData.ua);
  const remoteMetaDataWithOSInfo = assign(
    pick(remoteMetaData, 'city', 'country', 'ipAddress', 'region', 'ua'),
    {
      deviceType: userAgent.genericDeviceType(),
      family: userAgent.browser.name,
      OS: userAgent.genericOSName(),
    }
  );

  this.set({ remoteMetaData: remoteMetaDataWithOSInfo });
}
