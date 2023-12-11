import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default function Error() {
  const cookieStore = cookies();
  const redirectUrl = cookieStore.get('authjs.callback-url');
  console.log(redirectUrl);
  if (redirectUrl?.value) {
    redirect(`${redirectUrl.value}&signInAttempted=true`);
  }
  return <div>Loading...</div>;
}
