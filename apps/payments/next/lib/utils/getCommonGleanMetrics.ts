/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { headers } from 'next/headers';
import { userAgentFromString } from 'next/server';
import { getIpAddress } from './getIpAddress';

export function getCommonGleanMetrics() {
  const userAgentString = headers().get('user-agent') || '';
  const userAgent = userAgentFromString(userAgentString);
  return {
    ipAddress: getIpAddress(),
    userAgent: userAgentString,
    deviceType: userAgent.device.type || 'desktop',
  };
}
