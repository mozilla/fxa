/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import './styles/global.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mozilla',
  description: 'Subscription management',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <main className="mt-16 min-h-[calc(100vh_-_4rem)]">{children}</main>
      </body>
    </html>
  );
}
