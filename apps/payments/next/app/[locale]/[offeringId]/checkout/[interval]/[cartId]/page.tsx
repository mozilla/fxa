/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { app } from '@fxa/payments/ui/server';
import { auth, signIn, signOut } from 'apps/payments/next/auth';

export const dynamic = 'force-dynamic';

export default async function Checkout() {
  /* eslint-disable @typescript-eslint/no-unused-vars */
  const cartService = await app.getCartService();
  const session = await auth();

  return (
    <>
      <section
        className="h-[640px] flex items-center justify-center"
        aria-label="Section under construction"
      >
        {/*
            Temporary section to test NextAuth prompt/no prompt signin
            To be deleted as part of FXA-7521/FXA-7523 if not sooner where necessary
          */}
        {!session ? (
          <div className="flex flex-col gap-4">
            <form
              action={async () => {
                'use server';
                await signIn('fxa');
              }}
            >
              <button className="flex items-center justify-center bg-blue-500 font-semibold h-12 rounded-md text-white w-full p-4">
                <div className="block">Sign In - Login</div>
              </button>
            </form>
            <form
              action={async () => {
                'use server';
                await signIn('fxa', undefined, { prompt: 'none' });
              }}
            >
              <button className="flex items-center justify-center bg-blue-500 font-semibold h-12 rounded-md text-white w-full p-4">
                <div className="block">Sign In - No Prompt</div>
              </button>
            </form>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <p>Hello {session?.user?.id}</p>
            <form
              action={async () => {
                'use server';
                await signOut();
              }}
            >
              <button className="flex items-center justify-center bg-blue-500 font-semibold h-12 rounded-md text-white w-full p-4">
                <div className="block">Sign Out</div>
              </button>
            </form>
          </div>
        )}
      </section>
    </>
  );
}
