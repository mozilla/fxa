/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { redirect, notFound } from 'next/navigation';
import { config } from 'apps/payments/next/config';

export async function GET() {
  if (!config.contentServerClientConfig.url) {
    notFound();
  }
  redirect(`${config.contentServerClientConfig.url}/subscriptions`);
}
