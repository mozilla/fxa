/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Upgrade',
  description:
    'Please enter your payment details to complete your subscription upgrade.',
};

export default async function Upgrade() {
  return (
    <section aria-label="Upgrade">INSERT UPGRADE PAGE CONTENT HERE</section>
  );
}
