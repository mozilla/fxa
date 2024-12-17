/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { signIn } from 'apps/payments/next/auth';
import { redirect } from 'next/navigation';
import { NextRequest } from 'next/server';
import { getMetricsFlowAction } from '@fxa/payments/ui/actions';

export const dynamic = 'force-dynamic'; // defaults to auto

/**
 * This landing route will initiate the OAuth no prompt signin
 * attempt with FxA.
 *
 * Only when an unexpected error occurs, will the user be redirected
 * to a generic error page.
 *
 * On successful authentication, the customer will be redirected
 * to the /new page in a "Signed In" state. (i.e. FxA uid added to cart)
 *
 * On failure the customer will be redirected to /error/auth/signin
 * where the error will be handled correctly, and ideally redirect
 * the customer to the /new page in a "Signed Out" state. (i.e. no
 * FxA uid added to the cart)
 *
 * This needs to be a route handler, since the `signIn` server
 * action needs to be executed from a route handler.
 */
export async function GET(request: NextRequest) {
  // Replace 'landing' in the URL with 'new'
  const redirectToUrl = request.nextUrl.clone();
  redirectToUrl.pathname = redirectToUrl.pathname.replace('/landing', '/new');

  let redirectUrl;
  try {
    const metricsFlow = await getMetricsFlowAction();
    redirectToUrl.searchParams.set('flowId', metricsFlow.flowId);
    redirectToUrl.searchParams.set(
      'flowBeginTime',
      metricsFlow.flowBeginTime.toString()
    );
    redirectUrl = await signIn(
      'fxa',
      {
        redirect: false,
        redirectTo: redirectToUrl.href,
      },
      { prompt: 'none' }
    );
  } catch (error) {
    // Log the error and redirect to /new without attempting signIn
    console.error(error);
  }

  if (!redirectUrl) {
    redirectUrl = redirectToUrl.href;
  }

  redirect(redirectUrl);
}
