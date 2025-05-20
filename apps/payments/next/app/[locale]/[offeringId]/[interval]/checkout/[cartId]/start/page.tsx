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
  buildPageMetadata,
} from '@fxa/payments/ui';
import {
  getApp,
  SupportedPages,
  CheckoutParams,
  SignedIn,
} from '@fxa/payments/ui/server';
import AppleLogo from '@fxa/shared/assets/images/apple-logo.svg';
import GoogleLogo from '@fxa/shared/assets/images/google-logo.svg';
import { auth, signIn } from 'apps/payments/next/auth';
import {
  fetchCMSData,
  getCartOrRedirectAction,
} from '@fxa/payments/ui/actions';
import { config } from 'apps/payments/next/config';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export async function generateMetadata(
  {
    params,
    searchParams,
  }: {
    params: CheckoutParams;
    searchParams: Record<string, string> | undefined;
  },
): Promise<Metadata> {
  return buildPageMetadata({
    params,
    titlePrefix: 'Checkout',
    description: 'Enter your payment details to complete your purchase.',
    page: 'start',
    pageType: 'checkout',
    acceptLanguage: headers().get('accept-language'),
    baseUrl: config.paymentsNextHostedUrl,
    searchParams
  });
}

export default async function Checkout({
  params,
  searchParams,
}: {
  params: CheckoutParams;
  searchParams: Record<string, string> | undefined;
}) {
  const { locale } = params;

  const acceptLanguage = headers().get('accept-language');
  const sessionPromise = auth();
  const l10n = getApp().getL10n(acceptLanguage, locale);
  const cmsDataPromise = fetchCMSData(
    params.offeringId,
    acceptLanguage,
    locale
  );
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

  const redirectSearchParams: Record<string, string> = searchParams || {};
  if (cart.taxAddress) {
    redirectSearchParams.countryCode = cart.taxAddress.countryCode;
    redirectSearchParams.postalCode = cart.taxAddress.postalCode;
  }

  const redirectTo = buildRedirectUrl(
    params.offeringId,
    params.interval,
    'new',
    'checkout',
    {
      baseUrl: config.paymentsNextHostedUrl,
      locale,
      searchParams: redirectSearchParams,
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

          <div className="text-sm flex items-center justify-center my-6">
            <div className="flex-1 h-px bg-grey-400 divide-x"></div>

            <div className="mx-4 text-base text-grey-400 font-extralight">
              {l10n.getString('checkout-signin-options-or', 'or')}
            </div>
            <div className="flex-1 h-px bg-grey-400 divide-x"></div>
          </div>

          <div className="flex flex-col gap-4 my-10">
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
