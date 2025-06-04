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
  buildPageMetadata,
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

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: CheckoutParams;
  searchParams: Record<string, string> | undefined;
}): Promise<Metadata> {
  return buildPageMetadata({
    params,
    page: 'start',
    pageType: 'checkout',
    acceptLanguage: headers().get('accept-language'),
    baseUrl: config.paymentsNextHostedUrl,
    searchParams,
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
    <>
      {!session?.user && (
        <section
          className="order-2 bg-white shadow-sm shadow-grey-300 clip-shadow p-4 rounded-b-lg text-base tablet:rounded-b-none"
          aria-labelledby="signin-heading"
        >
          <h2
            id="signin-heading"
            className="font-semibold text-grey-600 text-lg mt-10"
          >
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

          <div
            role="separator"
            aria-hidden="true"
            className="text-sm flex items-center justify-center my-6"
          >
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
              aria-describedby="continue-with-google"
            >
              <BaseButton
                variant={ButtonVariant.ThirdParty}
                aria-label="Continue with Google"
              >
                <Image src={GoogleLogo} alt="" />
                <span id="continue-with-google">
                  {l10n.getString(
                    'continue-signin-with-google-button',
                    'Continue with Google'
                  )}
                </span>
              </BaseButton>
            </form>
            <form
              action={async () => {
                'use server';
                await signIn('fxa', { redirectTo }, { deeplink: 'appleLogin' });
              }}
              aria-describedby="continue-with-apple"
            >
              <BaseButton
                variant={ButtonVariant.ThirdParty}
                aria-label="Continue with Apple"
              >
                <Image src={AppleLogo} alt="" />
                <span id="continue-with-apple">
                  {l10n.getString(
                    'continue-signin-with-apple-button',
                    'Continue with Apple'
                  )}
                </span>
              </BaseButton>
            </form>
          </div>

          <div
            className="tablet:border-b tablet:border-grey-200"
            role="separator"
            aria-hidden="true"
          ></div>
        </section>
      )}

      {session?.user?.email && (
        <section
          aria-labelledby="signin-heading"
          className="order-2 bg-white clip-shadow shadow-sm shadow-grey-300 pt-4 px-4 pb-0 text-base hidden tablet:block "
        >
          <SignedIn email={session.user.email} />
        </section>
      )}

      <section
        className="order-4 mt-6 bg-white clip-shadow shadow-sm shadow-grey-300 pt-0 px-4 pb-4 rounded-t-lg text-base tablet:col-start-1 tablet:mt-0 tablet:rounded-t-none"
        aria-labelledby="payment-heading"
      >
        {!session?.user?.email ? (
          <h2
            id="payment-heading"
            className={clsx(
              'font-semibold text-grey-600 text-lg mb-5 mt-4 tablet:mt-6',
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
          <h2
            id="payment-heading"
            className="font-semibold text-grey-600 text-lg mb-5 mt-4 tablet:mt-10"
            data-testid="header"
          >
            {l10n.getString(
              'next-payment-method-header',
              'Choose your payment method'
            )}
          </h2>
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
    </>
  );
}
