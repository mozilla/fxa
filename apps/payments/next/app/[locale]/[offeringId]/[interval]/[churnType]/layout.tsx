/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Breadcrumbs, Header } from '@fxa/payments/ui';
import { auth } from 'apps/payments/next/auth';
import { config } from 'apps/payments/next/config';

export const dynamic = 'force-dynamic';

export default async function ChurnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div className="min-h-[calc(100vh_-_4rem)] bg-white tablet:bg-grey-10 flex flex-col justify-start">
      <Header
        auth={{
          user: session?.user,
        }}
      />
      <Breadcrumbs
        contentServerUrl={config.contentServerUrl}
        paymentsNextUrl={config.paymentsNextHostedUrl}
      />
      <div className="flex flex-col tablet:pt-20 items-center flex-1">
        <div className="flex justify-center max-w-lg">{children}</div>
      </div>
    </div>
  );
}
