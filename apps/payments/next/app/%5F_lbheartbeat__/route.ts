/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { NextResponse } from 'next/server';

import { app } from '@fxa/payments/ui/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  await app.initialize();
  return NextResponse.json({});
}
