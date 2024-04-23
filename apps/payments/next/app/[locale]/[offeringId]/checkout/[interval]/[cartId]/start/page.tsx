/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import Stripe from 'stripe';
import {
  app,
  handleStripeErrorAction,
  getCartOrRedirectAction,
  SupportedPages,
} from '@fxa/payments/ui/server';
import { DEFAULT_LOCALE } from '@fxa/shared/l10n';
import { auth, signIn, signOut } from 'apps/payments/next/auth';
import { headers } from 'next/headers';
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
  const l10nPromise = app.getL10n(locale);
  const cartPromise = getCartOrRedirectAction(
    params.cartId,
    SupportedPages.START
  );
  const [session, l10n, cart] = await Promise.all([
    sessionPromise,
    l10nPromise,
    cartPromise,
  ]);

  // Temporary function used to test handleStripeErrorAction
  // This is to be deleted as part of FXA-8850
  async function onSubmit() {
    'use server';
    const error: Stripe.StripeRawError = new Error(
      'Simulated Stripe Error'
    ) as unknown as Stripe.StripeRawError;
    error.type = 'card_error';
    await handleStripeErrorAction(cart.id, cart.version, error);
  }

  return (
    <>
      <section
        className="h-min-[640px] flex flex-col items-center justify-center"
        aria-label="Section under construction"
      >
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
        {/*
          Temporary function used to test handleStripeErrorAction
          This is to be deleted as part of FXA-8850
        */}
        <div>
          <form action={onSubmit} className="mb-8">
            <input type="text" name="name" />
            <button
              type="submit"
              className="flex items-center justify-center bg-blue-500 font-semibold h-12 rounded-md text-white w-full p-4"
            >
              <div>Test handle error</div>
            </button>
          </form>
        </div>
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
