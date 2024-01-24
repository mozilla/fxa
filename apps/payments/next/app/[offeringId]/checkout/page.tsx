import { PurchaseDetails, TermsAndPrivacy } from '@fxa/payments/ui/server';

import { getCartData, getContentfulContent } from '../../_lib/apiClient';
import { app } from '../../_nestapp/app';

interface CheckoutParams {
  offeringId: string;
}

export const dynamic = 'force-dynamic';

export default async function Index({ params }: { params: CheckoutParams }) {
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

  return (
    <>
      <header className="page-title-container">
        <h1 className="page-header">Under Construction</h1>
      </header>

      <section className="payment-panel" aria-label="Purchase details">
        <PurchaseDetails
          interval={cart.interval}
          invoice={cart.nextInvoice}
          purchaseDetails={contentful.purchaseDetails}
        />
      </section>

      <div className="page-body rounded-t-lg tablet:rounded-t-none">
        <section
          className="h-[640px] flex items-center justify-center"
          aria-label="Section under construction"
        >
          Section Under Construction
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
