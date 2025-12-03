/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';

import { StaySubscribed, SubscriptionParams } from '@fxa/payments/ui';
import { getStaySubscribedFlowContentAction } from '@fxa/payments/ui/actions';
import { auth } from 'apps/payments/next/auth';
import { config } from 'apps/payments/next/config';

export default async function StaySubscribedPage({
  params,
  searchParams,
}: {
  params: SubscriptionParams;
  searchParams: Record<string, string> | undefined;
}) {
  const { locale, subscriptionId } = params;
  const acceptLanguage = headers().get('accept-language');

  const session = await auth();
  if (!session?.user?.id) {
    const redirectToUrl = new URL(
      `${config.paymentsNextHostedUrl}/${locale}/subscriptions/landing`
    );
    redirectToUrl.search = new URLSearchParams(searchParams).toString();
    redirect(redirectToUrl.href);
  }

  const uid = session.user.id;

  const pageContent = await getStaySubscribedFlowContentAction(
    uid,
    subscriptionId,
    acceptLanguage
  );

  if (pageContent.flowType === 'not_found') {
    notFound();
  }

  return (
    <StaySubscribed
      userId={uid}
      subscriptionId={subscriptionId}
      locale={locale}
      pageContent={pageContent}
    />
  );
}
