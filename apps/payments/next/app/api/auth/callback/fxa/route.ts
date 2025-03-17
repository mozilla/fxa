import { NextRequest } from 'next/server';
import { GET as AuthJsGET } from '../../../../../auth';
import { redirect } from 'next/navigation';

export { POST } from '../../../../../auth';

export async function GET(request: NextRequest) {
  const requestSearchParams = request.nextUrl.searchParams;
  const requestErrorQuery = requestSearchParams.get('error');

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
      redirect(redirectUrl.value);
    }
  }

  return AuthJsGET(request);
}
