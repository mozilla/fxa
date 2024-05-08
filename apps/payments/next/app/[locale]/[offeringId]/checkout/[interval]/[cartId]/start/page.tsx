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
import { StripeWrapper } from '@fxa/payments/ui';
import { getFakeCartData } from 'apps/payments/next/app/_lib/apiClient';

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
  const [session, l10n, cart, fakeCart] = await Promise.all([
    sessionPromise,
    l10nPromise,
    cartPromise,
    fakeCartDataPromise,
  ]);

  return (
    <>
      <section
        className="h-min-[640px]"
        aria-label="Section under construction"
      >
        {!session && (
          <>
            <h4 className="font-semibold text-grey-600 text-lg">
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
              <div className="text-grey-400 text-sm">
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
                  <button className="underline text-grey-400 hover:text-grey-400">
                    Sign in
                  </button>
                )}
              </div>
            </form>

            <hr className="mx-auto my-4 w-full border-grey-200" />
          </>
        )}

        <section className="flex flex-col gap-2 mb-8">
          <div>
            <h3 className="text-xl">Temporary L10n Section</h3>
            <p className="text-sm">
              Temporary section to illustrate various translations using the
              Localizer classes
            </p>
          </div>
          <div>
            <h4>Regular translation - no variables</h4>
            <p className="text-sm">
              {l10n.getString('app-footer-mozilla-logo-label', 'testing2')}
            </p>
          </div>
          <div>
            <h4>Regular translation - with variables</h4>
            <p className="text-sm">
              {l10n.getString(
                'app-page-title-2',
                { title: 'Test Title' },
                'testing2'
              )}
            </p>
          </div>
          <div>
            <h4>Regular translation - With Selector</h4>
            <p className="text-sm">
              {l10n.getString(
                'next-plan-price-interval-day',
                { intervalCount: 2, amount: 20 },
                'testing2'
              )}
            </p>
          </div>
          <div>
            <h4>Regular translation - With Currency</h4>
            <p className="text-sm">
              {l10n.getString(
                'list-positive-amount',
                {
                  amount: l10n.getLocalizedCurrency(502, 'usd'),
                },
                `${l10n.getLocalizedCurrencyString(502, 'usd')}`
              )}
            </p>
          </div>
          <div>
            <h4>Regular translation - With Date</h4>
            <p className="text-sm">
              {l10n.getString(
                'list-positive-amount',
                {
                  amount: l10n.getLocalizedCurrency(502, 'usd'),
                },
                `${l10n.getLocalizedCurrencyString(502, 'usd')}`
              )}
            </p>
          </div>
          <div>
            <h4>Get Fragment with Fallback element</h4>
            <p className="text-sm">
              {l10n.getFragmentWithSource(
                'next-payment-legal-link-stripe-3',
                {
                  elems: {
                    stripePrivacyLink: (
                      <a href="https://stripe.com/privacy">
                        Stripe privacy policy
                      </a>
                    ),
                  },
                },
                <a href="https://stripe.com/privacy">Stripe privacy policy</a>
              )}
            </p>
          </div>
          <div>
            <h4>Get Element - With reference</h4>
            <p className="text-sm">
              {l10n.getFragmentWithSource(
                'next-payment-confirm-with-legal-links-static-3',
                {
                  elems: {
                    termsOfServiceLink: (
                      <a href="https://stripe.com/privacy">
                        Stripe privacy policy
                      </a>
                    ),
                    privacyNoticeLink: (
                      <a href="https://stripe.com/privacy">
                        Stripe privacy policy
                      </a>
                    ),
                  },
                },
                <>
                  I authorize Mozilla to charge my payment method for the amount
                  shown, according to{' '}
                  <a href="https://www.example.com">Terms of Service</a> and{' '}
                  <a href="https://www.example.com">Privacy Notice</a>, until I
                  cancel my subscription.
                </>
              )}
            </p>
          </div>
        </section>
        <StripeWrapper
          amount={fakeCart.amount}
          currency={fakeCart.nextInvoice.currency}
          cart={cart}
        />
      </section>
    </>
  );
}
