import { PurchaseDetails, TermsAndPrivacy } from '@fxa/payments/ui/server';
import { getCartData, getContentfulContent } from '../../../_lib/apiClient';
import { app } from '@fxa/payments/ui/server';
import { headers } from 'next/headers';
import { getLocaleFromRequest } from '@fxa/shared/l10n';
import { CheckoutSearchParams } from '../layout';
import { auth, signIn, signOut } from 'apps/payments/next/auth';

export const dynamic = 'force-dynamic';

interface CheckoutParams {
  offeringId: string;
  cartId: string;
}

export default async function Checkout({
  params,
  searchParams,
}: {
  params: CheckoutParams;
  searchParams: CheckoutSearchParams;
}) {
  const headersList = headers();
  const locale = getLocaleFromRequest(
    searchParams,
    headersList.get('accept-language')
  );

  const contentfulData = getContentfulContent(params.offeringId, locale);
  const cartData = getCartData(params.cartId);
  const [contentful, cart] = await Promise.all([contentfulData, cartData]);
  /* eslint-disable @typescript-eslint/no-unused-vars */
  const cartService = await app.getCartService();
  const session = await auth();

  return (
    <>
      <header className="page-title-container">
        <h1 className="page-header">Under Construction</h1>
      </header>

      <section className="payment-panel" aria-label="Purchase details">
        <PurchaseDetails
          interval={cart.interval}
          locale={locale}
          invoice={cart.nextInvoice}
          purchaseDetails={contentful.purchaseDetails}
        />
      </section>

      <div className="page-body rounded-t-lg tablet:rounded-t-none">
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

        <TermsAndPrivacy
          locale={locale}
          {...cart}
          {...contentful.commonContent}
          {...contentful.purchaseDetails}
          showFXALinks={true}
        />
      </div>
    </>
  );
}
