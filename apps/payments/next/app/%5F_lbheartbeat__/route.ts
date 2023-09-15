/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { NextResponse } from 'next/server';

import { app } from '../_nestapp/app';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  await app.getApp();
  const resp = new NextResponse('{}');
  resp.headers.set('Content-Type', 'application/json');
  return resp;
}
