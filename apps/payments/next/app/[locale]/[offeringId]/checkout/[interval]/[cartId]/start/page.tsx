/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { headers } from 'next/headers';
import Image from 'next/image';
import {
  BaseButton,
  ButtonVariant,
  PaymentSection,
  SignInForm,
} from '@fxa/payments/ui';
import {
  getApp,
  CheckoutParams,
  SupportedPages,
} from '@fxa/payments/ui/server';
import { getCartOrRedirectAction } from '@fxa/payments/ui/actions';
import AppleLogo from '@fxa/shared/assets/images/apple-logo.svg';
import GoogleLogo from '@fxa/shared/assets/images/google-logo.svg';
import { DEFAULT_LOCALE } from '@fxa/shared/l10n';
import {
  getFakeCartData,
  getCMSContent,
} from 'apps/payments/next/app/_lib/apiClient';
import { auth } from 'apps/payments/next/auth';

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
              'checkout-signin-or-create',
              '1. Sign in or create a Mozilla account'
            )}
          </h2>

          <SignInForm
            newsletterLabel={cms.commonContent.newsletterLabelTextCode}
          />

          <h3 className="font-semibold text-grey-600 text-start">
            {l10n.getString(
              'checkout-create-account',
              'Create a Mozilla account'
            )}
          </h3>

          <div className="flex flex-col gap-4 mt-6 mb-10 desktop:flex-row desktop:items-center desktop:justify-center">
            <BaseButton variant={ButtonVariant.ThirdParty}>
              <Image src={GoogleLogo} alt="" />
              {l10n.getString(
                'next-continue-with-google-button',
                'Continue with Google'
              )}
            </BaseButton>
            <BaseButton variant={ButtonVariant.ThirdParty}>
              <Image src={AppleLogo} alt="" />
              {l10n.getString(
                'next-continue-with-apple-button',
                'Continue with Apple'
              )}
            </BaseButton>
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
        cart={{
          ...cart,
        }}
        locale={locale}
      />
    </section>
  );
}
