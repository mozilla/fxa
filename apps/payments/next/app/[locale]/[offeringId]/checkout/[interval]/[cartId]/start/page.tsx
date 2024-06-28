/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { PaymentSection } from '@fxa/payments/ui';
import {
  getApp,
  getCartOrRedirectAction,
  SupportedPages,
} from '@fxa/payments/ui/server';
import { DEFAULT_LOCALE } from '@fxa/shared/l10n';
import {
  getFakeCartData,
  getCMSContent,
} from 'apps/payments/next/app/_lib/apiClient';
import { auth, signIn } from 'apps/payments/next/auth';
import { PrimaryButton } from 'libs/payments/ui/src/lib/client/components/PrimaryButton';
import { CheckoutParams } from '../layout';

export const dynamic = 'force-dynamic';

export default async function Checkout({ params }: { params: CheckoutParams }) {
  // Temporarily defaulting to `accept-language`
  // This to be updated in FXA-9404
  //const locale = getLocaleFromRequest(
  //  params,
  //  headers().get('accept-language')
  //);
  const locale = headers().get('accept-language') || DEFAULT_LOCALE;
  const sessionPromise = auth();
  const l10n = getApp().getL10n(locale);
  const cartPromise = getCartOrRedirectAction(
    params.cartId,
    SupportedPages.START
  );
  //TODO - Replace with cartPromise as part of FXA-8903
  const fakeCartDataPromise = getFakeCartData(params.cartId);
  const cmsPromise = getCMSContent(params.offeringId, locale);
  const [session, cart, fakeCart, cms] = await Promise.all([
    sessionPromise,
    cartPromise,
    fakeCartDataPromise,
    cmsPromise,
  ]);

  return (
    <section>
      {!session && (
        <>
          <h2 className="font-semibold text-grey-600 text-lg mt-10">
            {l10n.getString(
              'next-new-user-step-1-2',
              '1. Create a Mozilla account'
            )}
          </h2>

          <form
            action={async () => {
              'use server';
              await signIn('fxa');
            }}
          >
            <p className="text-grey-400 text-sm mt-2 pb-4 row-divider-grey-200">
              {l10n.getFragmentWithSource(
                'next-new-user-sign-in-link-2',
                {
                  elems: {
                    a: (
                      <button className="underline hover:text-grey-400">
                        Sign in
                      </button>
                    ),
                  },
                },
                <>
                  Already have a Mozilla account?&nbsp;
                  <button className="underline hover:text-grey-400">
                    Sign in
                  </button>
                </>
              )}
            </p>
          </form>

          <div className="p-6 text-center">
            {/**
              Temporary Content. This will be replaced in M3b by the Passwordless
              email signup form.
            */}
            <p className="mb-6">{`Current cart email: ${cart.email}`}</p>
            <form
              action={async (formData: FormData) => {
                'use server';
                const email =
                  formData.get('email')?.toString() || 'test@example.com';
                await getApp().getActionsService().updateCart({
                  cartId: cart.id,
                  version: cart.version,
                  cartDetails: {
                    email,
                  },
                });
                revalidatePath('/');
              }}
            >
              <input
                type="email"
                name="email"
                className="w-full border rounded-md border-black/30 p-3 placeholder:text-grey-500 placeholder:font-normal focus:border focus:!border-black/30 focus:!shadow-[0_0_0_3px_rgba(10,132,255,0.3)] focus-visible:outline-none data-[invalid=true]:border-alert-red data-[invalid=true]:text-alert-red data-[invalid=true]:shadow-inputError"
              />
              <PrimaryButton type="submit"> Set email</PrimaryButton>
            </form>
          </div>

          <hr className="mx-auto w-full border-grey-200" />
        </>
      )}

      {!session ? (
        <h2
          className="font-semibold text-grey-600 text-lg mt-10 mb-5"
          data-testid="header-prefix"
        >
          {l10n.getString(
            'payment-method-header-second-step-next',
            '2. Choose your payment method2'
          )}
        </h2>
      ) : (
        <h2
          className="font-semibold text-grey-600 text-lg mt-10 mb-5"
          data-testid="header"
        >
          {l10n.getString(
            'next-payment-method-header',
            'Choose your payment method'
          )}
        </h2>
      )}
      <h3 className="font-semibold text-grey-600 text-start">
        {l10n.getString(
          'next-payment-method-first-approve',
          `First you'll need to approve your subscription`
        )}
      </h3>

      <PaymentSection
        cmsCommonContent={cms.commonContent}
        paymentsInfo={{
          amount: fakeCart.amount,
          currency: fakeCart.nextInvoice.currency,
        }}
        cart={cart}
        locale={locale}
      />
    </section>
  );
}
