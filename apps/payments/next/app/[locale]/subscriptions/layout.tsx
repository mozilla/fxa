/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { ManageParams } from '@fxa/payments/ui/server';
import { Header } from '@fxa/payments/ui';
import { auth, signOut } from 'apps/payments/next/auth';

export default async function ManagementLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: ManageParams;
}) {
  const session = await auth();

  return (
    <>
      <Header
        auth={{
          user: session?.user,
          signOut: async () => {
            'use server';
            await signOut({ redirect: false });
          },
        }}
      />
      {children}
    </>
  );
}
