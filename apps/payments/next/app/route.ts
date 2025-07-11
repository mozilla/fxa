/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { redirect, notFound } from 'next/navigation';
import { config } from 'apps/payments/next/config';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  console.log('we are in route.ts');
  if (!config.contentServerClientConfig.url) {
    notFound();
  }
  console.log('this is the request url: ', request.url);
  console.log('this is the request url search: ', request.nextUrl.search);

  const requestUrl = new URL(request.url);
  const params = requestUrl.searchParams.toString();
  console.log('this is params: ', params);

  const redirectTo = `${config.contentServerClientConfig.url}/subscriptions` + (params ? `?${params}` : '');
  console.log('this is redirectTo: ', redirectTo);
  redirect(redirectTo);
}
