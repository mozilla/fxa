import { NextRequest } from 'next/server';
import { GET as AuthJsGET } from '../../../../../auth';
import { redirect } from 'next/navigation';
import { getApp } from '@fxa/payments/ui/server';

export { POST } from '../../../../../auth';

export async function GET(request: NextRequest) {
  const requestSearchParams = request.nextUrl.searchParams;
  const requestErrorQuery = requestSearchParams.get('error');
  const url = new URL(request.url);
  const newAccount = url.searchParams.get('newAccount');
  if (newAccount && newAccount === 'true') {
    const cookieStore = request.cookies;
    const redirectUrl =
      cookieStore.get('__Secure-authjs.callback-url') ||
      cookieStore.get('authjs.callback-url');

    if (redirectUrl?.value) {
      const updatedRedirectUrl = new URL(redirectUrl.value, request.url);
      updatedRedirectUrl.searchParams.set('newAccount', 'true');

      const updatedHeaders = new Headers(request.headers);
      const newCookieHeader = request.cookies
        .getAll()
        .map(({ name, value }) => {
          if (name === 'authjs.callback-url' || name === '__Secure-authjs.callback-url') {
            return `${name}=${encodeURIComponent(updatedRedirectUrl.toString())}`;
          }
          return `${name}=${value}`;
        })
        .join('; ');
      updatedHeaders.set('cookie', newCookieHeader);

      const newRequest = new NextRequest(request.url, {
        headers: updatedHeaders,
        method: request.method,
      });

      return AuthJsGET(newRequest);
    }
  }

  // Support failure on prompt=none
  // If fxa prompt=none login fails because the user is not logged in
  // the callback url will have query error=login_required.
  // In those cases, redirect to the callback url without trying to login.
  if (requestErrorQuery && requestErrorQuery === 'login_required') {
    const cookieStore = request.cookies;
    // Not ideal, however this is the most up to date work around I've been
    // able to find thus far. For more background, see the link below.
    // https://github.com/nextauthjs/next-auth/issues/4301
    const redirectUrl =
      cookieStore.get('__Secure-authjs.callback-url') ||
      cookieStore.get('authjs.callback-url');
    if (redirectUrl?.value) {
      getApp().getEmitterService().emit('auth', { type: 'prompt_none_fail' });
      redirect(redirectUrl.value);
    }
  }

  return AuthJsGET(request);
}
