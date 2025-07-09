/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ManageParams } from '@fxa/payments/ui';
import { auth } from 'apps/payments/next/auth';
import { config } from 'apps/payments/next/config';
import { redirect } from 'next/navigation';
import { URLSearchParams } from 'url';

export default async function Manage({
  params,
  searchParams,
}: {
  params: ManageParams;
  searchParams: Record<string, string | string[]> | undefined;
}) {
  const { locale } = params;
  const session = await auth();
  if (!session) {
    const redirectToUrl = new URL(
      `${config.paymentsNextHostedUrl}/${locale}/subscriptions/landing`
    );
    redirectToUrl.search = new URLSearchParams(searchParams).toString();
    redirect(redirectToUrl.href);
  }

  return <div>Subscription management</div>;
}
