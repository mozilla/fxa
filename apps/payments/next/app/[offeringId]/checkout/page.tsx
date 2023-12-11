import { PurchaseDetails, TermsAndPrivacy } from '@fxa/payments/ui/server';

import { getCartData, getContentfulContent } from '../../_lib/apiClient';
import { app } from '../../_nestapp/app';
import NextAuthDemo from '../../components/NextAuthDemo';
import ClientWrapper from '../../components/ClientWrapper';
import { auth, signIn, signOut } from 'apps/payments/next/auth';
import { redirect } from 'next/navigation';

interface CheckoutParams {
  offeringId: string;
}

interface CheckoutSearchParams {
  interval?: string;
  signInAttempted?: string;
}

export const dynamic = 'force-dynamic';

export default async function Index({
  params,
  searchParams,
}: {
  params: CheckoutParams;
  searchParams: CheckoutSearchParams;
}) {
  // TODO - Fetch Cart ID from cookie
  // https://nextjs.org/docs/app/api-reference/functions/cookies
  const cartId = 'cart-uuid';
  // TODO - Fetch locale from params
  // Possible solution could be as link below
  // https://nextjs.org/docs/app/building-your-application/routing/internationalization
  const locale = 'en-US';

  const contentfulData = getContentfulContent(params.offeringId, locale);
  const cartData = getCartData(cartId);
  const [contentful, cart] = await Promise.all([contentfulData, cartData]);
  /* eslint-disable @typescript-eslint/no-unused-vars */
  const cartService = await app.getCartService();
  const session = await auth();
  console.log('Session', session);
  console.log('searchParams', searchParams);

  if (!session && !searchParams.signInAttempted) {
    // await signIn('fxa', undefined, { prompt: 'none' });
  }

  return (
    <>
      <h1 className="page-title-container">Under Construction</h1>
      <section className="payment-panel" aria-label="Purchase details">
        <PurchaseDetails
          interval={cart.interval}
          invoice={cart.nextInvoice}
          purchaseDetails={contentful.purchaseDetails}
        />
      </section>
      <div className="component-card border-t-0 mb-6 pt-4 px-4 pb-14 rounded-t-lg text-grey-600 tablet:rounded-t-none desktop:px-12 desktop:pb-12">
        <section
          className="h-[640px] flex items-center justify-center"
          aria-label="Section under construction"
        >
          {/*
          <ClientWrapper>
            <NextAuthDemo />
          </ClientWrapper>
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
              <p>Hello {session.user?.id}</p>
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
          {...cart}
          {...contentful.commonContent}
          {...contentful.purchaseDetails}
          showFXALinks={true}
        />
      </div>
    </>
  );
}
