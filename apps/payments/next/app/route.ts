/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { redirect, notFound } from 'next/navigation';
import { config } from 'apps/payments/next/config';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  if (!config.contentServerClientConfig.url) {
    notFound();
  }

  const requestUrl = new URL(request.url);
  const params = requestUrl.searchParams.toString();

  const redirectTo = `${config.contentServerClientConfig.url}/subscriptions` + (params ? `?${params}` : '');
  redirect(redirectTo);
}
