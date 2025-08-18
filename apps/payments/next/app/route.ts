/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { redirect, notFound } from 'next/navigation';
import { config } from 'apps/payments/next/config';
import { type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  if (!config.contentServerClientConfig.url) {
    notFound();
  }
  if (config.featureFlagSubManage) {
    redirect(`/subscriptions/landing/${request.nextUrl.search}`);
  } else {
    redirect(
      `${config.contentServerClientConfig.url}/subscriptions${request.nextUrl.search}`
    );
  }
}
