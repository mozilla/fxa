/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Header } from '@fxa/payments/ui';
import { auth } from 'apps/payments/next/auth';

export const dynamic = 'force-dynamic';

export default async function ChurnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <>
      <Header
        auth={{
          user: session?.user,
        }}
      />
      <>{children}</>
    </>
  );
}
