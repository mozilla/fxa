/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import 'server-only';
import { headers } from 'next/headers';
import { userAgentFromString } from 'next/server';
import { getIpAddress } from './getIpAddress';

export async function getAdditionalRequestArgs() {
  const headersList = await headers();
  const userAgentString = headersList.get('user-agent') || '';
  const userAgent = userAgentFromString(userAgentString);
  const experimentationId = headersList.get('x-experimentation-id') || '';

  return {
    ipAddress: await getIpAddress(),
    userAgent: userAgentString,
    deviceType: userAgent.device.type || 'desktop',
    experimentationId,
    isFreeTrial: false,
  };
}
