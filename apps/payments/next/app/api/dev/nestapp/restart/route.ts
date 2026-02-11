/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { reinitializeNestApp } from '@fxa/payments/ui/server';
import { notFound } from 'next/navigation';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Provides a route to reinitialize the standalone Nest.js app used by
 * Payments Next. This ensures the latest code changes are available
 * in the Nest.js App.
 *
 * NOTE: This route should only be used in a development environment.
 */
export async function GET() {
  if (process.env.NODE_ENV === 'development') {
    await reinitializeNestApp();
    return NextResponse.json({});
  } else {
    notFound();
  }
}
