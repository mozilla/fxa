/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Breadcrumbs, Header } from '@fxa/payments/ui';
import { auth } from 'apps/payments/next/auth';
import { config } from 'apps/payments/next/config';

export default async function SubscriptionsLayout({
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
        redirectPath={`${config.contentServerUrl}/settings`}
      />
      <Breadcrumbs
        contentServerUrl={config.contentServerUrl}
        paymentsNextUrl={config.paymentsNextHostedUrl}
      />

      <div className="flex justify-center">{children}</div>
    </>
  );
}
