/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { signIn } from 'apps/payments/next/auth';
import { NextRequest } from 'next/server';
import { config } from 'apps/payments/next/config';
import { getMetricsFlowAction } from '@fxa/payments/ui/actions';
import { ManageParams } from '@fxa/payments/ui';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic'; // defaults to auto

export async function GET(
  request: NextRequest,
  { params }: { params: ManageParams }
) {
  const requestSearchParams = request.nextUrl.searchParams;
  const { locale } = params;

  const redirectToParam = requestSearchParams.get('redirect_to');
  requestSearchParams.delete('redirect_to');

  const redirectToPath =
    redirectToParam && redirectToParam.startsWith('/')
      ? redirectToParam
      : `/${locale}/subscriptions/manage`;

  const redirectToUrl = new URL(
    `${config.paymentsNextHostedUrl}${redirectToPath}`
  );
  redirectToUrl.search = requestSearchParams.toString();

  if (
    !redirectToUrl.searchParams.has('flow_id') &&
    !redirectToUrl.searchParams.has('flow_begin_time')
  ) {
    try {
      const metricsFlow = await getMetricsFlowAction();
      redirectToUrl.searchParams.set('flow_id', metricsFlow.flowId);
      redirectToUrl.searchParams.set(
        'flow_begin_time',
        metricsFlow.flowBeginTime.toString()
      );
    } catch (error) {
      // Prevent error propagation on failed metrics flow fetch
      console.error(error);
    }
  }

  let redirectUrl;
  try {
    redirectUrl = await signIn(
      'fxa',
      {
        redirect: false,
        redirectTo: redirectToUrl.href,
      },
      { prompt: 'none', return_on_error: 'false' }
    );
  } catch (error) {
    console.error(error);
  }

  redirect(redirectUrl ?? redirectToUrl.href);
}
