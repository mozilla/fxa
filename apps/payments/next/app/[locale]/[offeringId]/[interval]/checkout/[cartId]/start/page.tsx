/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { headers } from 'next/headers';
import Image from 'next/image';
import clsx from 'clsx';
import {
  BaseButton,
  buildRedirectUrl,
  ButtonVariant,
  PaymentSection,
  SignInForm,
} from '@fxa/payments/ui';
import {
  getApp,
  SupportedPages,
  CheckoutParams,
  SignedIn,
} from '@fxa/payments/ui/server';
import AppleLogo from '@fxa/shared/assets/images/apple-logo.svg';
import GoogleLogo from '@fxa/shared/assets/images/google-logo.svg';
import { DEFAULT_LOCALE } from '@fxa/shared/l10n';
import { auth, signIn } from 'apps/payments/next/auth';
import {
  fetchCMSData,
  getCartOrRedirectAction,
} from '@fxa/payments/ui/actions';
import { config } from 'apps/payments/next/config';

export const dynamic = 'force-dynamic';

export default async function Checkout({
  params,
  searchParams,
}: {
  params: CheckoutParams;
  searchParams: Record<string, string> | undefined;
}) {
  // Temporarily defaulting to `accept-language`
  // This to be updated in FXA-9404
  //const locale = getLocaleFromRequest(
  //  params,
  //  headers().get('accept-language')
  //);
  const locale = headers().get('accept-language') || DEFAULT_LOCALE;
  const sessionPromise = auth();
  const l10n = getApp().getL10n(locale);
  const cmsDataPromise = fetchCMSData(params.offeringId, locale);
  const cartPromise = getCartOrRedirectAction(
    params.cartId,
    SupportedPages.START,
    searchParams
  );
  //TODO - Replace with cartPromise as part of FXA-8903
  const [session, cart, cms] = await Promise.all([
    sessionPromise,
    cartPromise,
    cmsDataPromise,
  ]);

  const redirectTo = buildRedirectUrl(
    params.offeringId,
    params.interval,
    'new',
    'checkout',
    {
      baseUrl: config.paymentsNextHostedUrl,
      locale: params.locale,
      searchParams,
    }
  );

  return (
    <section aria-label="Checkout">
      {!session?.user && (
        <>
          <h2 className="font-semibold text-grey-600 text-lg mt-10">
            {l10n.getString(
              'checkout-signin-or-create',
              '1. Sign in or create a Mozilla account'
            )}
          </h2>

          <SignInForm
            submitAction={async (email?: string) => {
              'use server';
              const additionalParams = email
                ? { login_hint: email }
                : undefined;
              await signIn('fxa', { redirectTo }, additionalParams);
            }}
            newsletterLabel={cms.commonContent.newsletterLabelTextCode}
          />

          <h3 className="font-semibold text-grey-600 text-start">
            {l10n.getString(
              'checkout-create-account',
              'Create a Mozilla account'
            )}
          </h3>

          <div className="flex flex-col gap-4 mt-6 mb-10 desktop:flex-row desktop:items-center desktop:justify-center">
            <form
              action={async () => {
                'use server';
                await signIn(
                  'fxa',
                  { redirectTo },
                  { deeplink: 'googleLogin' }
                );
              }}
            >
              <BaseButton variant={ButtonVariant.ThirdParty}>
                <Image src={GoogleLogo} alt="" />
                {l10n.getString(
                  'continue-signin-with-google-button',
                  'Continue with Google'
                )}
              </BaseButton>
            </form>
            <form
              action={async () => {
                'use server';
                await signIn('fxa', { redirectTo }, { deeplink: 'appleLogin' });
              }}
            >
              <BaseButton variant={ButtonVariant.ThirdParty}>
                <Image src={AppleLogo} alt="" />
                {l10n.getString(
                  'continue-signin-with-apple-button',
                  'Continue with Apple'
                )}
              </BaseButton>
            </form>
          </div>

          <hr className="mx-auto w-full border-grey-200" />
        </>
      )}

      {!session?.user?.email ? (
        <h2
          className={clsx(
            'font-semibold text-grey-600 text-lg mt-10 mb-5',
            !session?.user?.email &&
              'cursor-not-allowed relative focus:border-blue-400 focus:outline-none focus:shadow-input-blue-focus after:absolute after:content-[""] after:top-0 after:left-0 after:w-full after:h-full after:bg-white after:opacity-50 after:z-10 select-none'
          )}
          data-testid="header-prefix"
        >
          {l10n.getString(
            'payment-method-header-second-step-next',
            '2. Choose your payment method2'
          )}
        </h2>
      ) : (
        <>
          <div className="hidden tablet:block">
            <SignedIn email={session.user.email} />
          </div>
          <h2
            className="font-semibold text-grey-600 text-lg mt-10 mb-5"
            data-testid="header"
          >
            {l10n.getString(
              'next-payment-method-header',
              'Choose your payment method'
            )}
          </h2>
        </>
      )}
      <h3
        className={clsx(
          'font-semibold text-grey-600 text-start',
          !session?.user?.email &&
            'cursor-not-allowed relative focus:border-blue-400 focus:outline-none focus:shadow-input-blue-focus after:absolute after:content-[""] after:top-0 after:left-0 after:w-full after:h-full after:bg-white after:opacity-50 after:z-10 select-none'
        )}
      >
        {l10n.getString(
          'next-payment-method-first-approve',
          'First you’ll need to approve your subscription'
        )}
      </h3>

      {/*
        If currency could not be determiend, it is most likely due to an invalid
        or undetermined tax address. Future work will add the Tax Location picker
        which should allow a customer to set their tax location, which would then
        provide a valid currency.
      */}
      {cart.currency &&
        cart.taxAddress?.countryCode &&
        cart.taxAddress?.postalCode && (
          <PaymentSection
            cmsCommonContent={cms.commonContent}
            paymentsInfo={{
              amount: cart.amount,
              currency: cart.currency.toLowerCase(),
            }}
            cart={{
              ...cart,
              currency: cart.currency,
              taxAddress: {
                countryCode: cart.taxAddress.countryCode,
                postalCode: cart.taxAddress.postalCode,
              },
            }}
            locale={locale}
          />
        )}
    </section>
  );
}
