/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import {
  app,
  getCartOrRedirectAction,
  SupportedPages,
} from '@fxa/payments/ui/server';
import { DEFAULT_LOCALE } from '@fxa/shared/l10n';
import { auth, signIn } from 'apps/payments/next/auth';
import { headers } from 'next/headers';
import { CheckoutParams } from '../layout';
import {
  getFakeCartData,
  getContentfulContent,
} from 'apps/payments/next/app/_lib/apiClient';
import { PaymentSection } from '@fxa/payments/ui';

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
  const l10nPromise = app.getL10n(locale);
  const cartPromise = getCartOrRedirectAction(
    params.cartId,
    SupportedPages.START
  );
  //TODO - Replace with cartPromise as part of FXA-8903
  const fakeCartDataPromise = getFakeCartData(params.cartId);
  const cmsPromise = getContentfulContent(params.offeringId, locale);
  const [session, l10n, cart, fakeCart, cms] = await Promise.all([
    sessionPromise,
    l10nPromise,
    cartPromise,
    fakeCartDataPromise,
    cmsPromise,
  ]);

  return (
    <section>
      {!session && (
        <>
          <h4 className="font-semibold text-grey-600 text-lg mt-10">
            {l10n.getString(
              'next-new-user-step-1-2',
              '1. Create a Mozilla account'
            )}
          </h4>

          <form
            action={async () => {
              'use server';
              await signIn('fxa');
            }}
          >
            <p className="text-grey-400 text-sm mt-2 mb-4">
              {l10n.getFragmentWithSource(
                'next-new-user-sign-in-link-2',
                {
                  elems: {
                    a: (
                      <button className="underline text-grey-400 hover:text-grey-400">
                        Sign in
                      </button>
                    ),
                  },
                },
                <>
                  Already have a Mozilla account?&nbsp;
                  <button className="underline text-grey-400 hover:text-grey-400">
                    Sign in
                  </button>
                </>
              )}
            </p>
          </form>

          <hr className="mx-auto w-full border-grey-200" />

          <div className="h-64 text-center flex items-center justify-center">
            {'<placeholder>Passwordless signup</placeholder>'}
          </div>

          <hr className="mx-auto w-full border-grey-200" />
        </>
      )}

      {!session ? (
        <h4
          className="font-semibold text-grey-600 text-lg mt-14 mb-5"
          data-testid="header-prefix"
        >
          {l10n.getString(
            'payment-method-header-second-step-next',
            '2. Choose your payment method2'
          )}
        </h4>
      ) : (
        <h4
          className="font-semibold text-grey-600 text-lg mt-14 mb-5"
          data-testid="header"
        >
          {l10n.getString(
            'next-payment-method-header',
            'Choose your payment method'
          )}
        </h4>
      )}
      <p className="font-semibold my-3 text-grey-600 text-start">
        {l10n.getString(
          'next-payment-method-first-approve',
          `First you'll need to approve your subscription`
        )}
      </p>

      <PaymentSection
        cmsCommonContent={cms.commonContent}
        paymentsInfo={{
          amount: fakeCart.amount,
          currency: fakeCart.nextInvoice.currency,
        }}
        cart={cart}
      />
    </section>
  );
}
