/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import 'server-only';
import { headers } from 'next/headers';

export function getIpAddress() {
  return (headers().get('x-forwarded-for') ?? '127.0.0.1').split(',')[0];
}
