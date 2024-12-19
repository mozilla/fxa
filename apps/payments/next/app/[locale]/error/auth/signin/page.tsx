/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

interface ErrorAuthSigninSearchParams {
  error?: string;
}

/**
 * Handle Errors that might occur during Auth SignIn
 *
 * Most common error would be OAuthCallbackError. This error is expected if
 * no prompt signin is attempted on a user thats not currently signed into FxA.
 *
 * In situations like this, ideally the customer should be redirected to the
 * appropriate checkout page in a "signed out" state. To achieve this the
 * authjs.callback-url cookie is read to retrieve the correct redirect url,
 * otherwise it's not possible to know what offering and interval the customer
 * was attempting to reach.
 *
 */
export default async function Error({
  searchParams,
}: {
  searchParams: ErrorAuthSigninSearchParams;
}) {
  const fallbackErrorPagePath = '/error';

  // TODO: Consider adding this logic to signing callback for the provider
  if (searchParams?.error !== 'OAuthCallbackError') {
    redirect(fallbackErrorPagePath);
  }
  const cookieStore = cookies();
  // Not ideal, however this is the most up to date work around I've been
  // able to find thus far. For more background, see the link below.
  // https://github.com/nextauthjs/next-auth/issues/4301
  const redirectUrl =
    cookieStore.get('__Secure-authjs.callback-url') ||
    cookieStore.get('authjs.callback-url');

  if (redirectUrl?.value) {
    redirect(`${redirectUrl.value}`);
  } else {
    redirect(fallbackErrorPagePath);
  }
}
