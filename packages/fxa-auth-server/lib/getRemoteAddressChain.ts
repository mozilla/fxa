/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Hapi from '@hapi/hapi';
import { IP_ADDRESS } from './routes/validators';

export function getRemoteAddressChain(
  request: Hapi.Request,
  remoteAddressChainOverride?: string
) {
  if (remoteAddressChainOverride) {
    return remoteAddressChainOverride.split(',');
  }

  const xff = (request.headers['x-forwarded-for'] as string || '').split(/\s*,\s*/);

  xff.push(request.info.remoteAddress);

  return xff
    .filter(Boolean)
    .map((address) => address.trim())
    .filter((address) => !IP_ADDRESS.required().validate(address).error);
}
