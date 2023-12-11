'use client';

import { useSession, signIn, signOut } from 'next-auth/react';

export default function NextAuthDemo() {
  const { data: session } = useSession();
  if (session) {
    return (
      <div>
        Signed in as {session?.user?.email} <br />
        <button onClick={() => signOut()}>Sign out</button>
      </div>
    );
  }
  return (
    <div>
      Not signed in <br />
      <button onClick={() => signIn('fxa')}>Sign in - With Login</button>
      <button onClick={() => signIn('fxa', undefined, { prompt: 'none' })}>
        Sign in - No Prompt
      </button>
    </div>
  );
}
