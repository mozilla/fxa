/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { notFound } from 'next/navigation';

/**
 * This page only exists for Route Handlers, i.e. `/landing`, to redirect
 * to in cases where a not found error should be shown to the client.
 *
 * This page should not be confused with the Next.js not-found.tsx file
 */
export default async function NotFoundPage() {
  notFound();
}
