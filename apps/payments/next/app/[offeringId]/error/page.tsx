// import { FluentBundle } from '@fluent/bundle';
// import { getBundle } from '@fxa/shared/l10n';
// import { headers } from 'next/headers';
import { PurchaseDetails, TermsAndPrivacy } from '@fxa/payments/ui/server';

import { getCartData, getContentfulContent } from '../../_lib/apiClient';
import { app } from '../../_nestapp/app';

import Link from 'next/link';

// media
const CheckIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      aria-hidden="true"
    >
      <path
        d="M15.5554 7.90751C15.0801 7.42354 14.9741 6.68825 15.2934 6.08962C15.5214 5.66298 15.5374 5.15568 15.3361 4.71504C15.1354 4.27507 14.7408 3.95375 14.2688 3.84709C13.6082 3.6971 13.1209 3.13581 13.0669 2.45985C13.0276 1.97788 12.7663 1.54124 12.359 1.27992C11.953 1.01794 11.4477 0.961274 10.9924 1.12726C10.3551 1.35858 9.64179 1.1486 9.23115 0.609962C8.93783 0.225986 8.48186 0 7.99789 0C7.51459 0 7.05861 0.225986 6.7653 0.609962C6.35666 1.14926 5.64337 1.35925 5.00608 1.12793C4.55144 0.962607 4.04614 1.01927 3.63949 1.28059C3.23285 1.5419 2.97087 1.97854 2.9322 2.46051C2.87754 3.13647 2.3909 3.69844 1.73028 3.84776C1.25831 3.95442 0.863667 4.27573 0.663012 4.71571C0.462358 5.15568 0.478357 5.66365 0.706343 6.08962C1.02566 6.68758 0.919663 7.42354 0.445026 7.90751C0.105714 8.25215 -0.052943 8.73546 0.0157194 9.21409C0.0843818 9.69273 0.37303 10.112 0.795671 10.3474C1.38763 10.6773 1.69695 11.354 1.55829 12.0173C1.4603 12.4906 1.58762 12.9825 1.90427 13.3478C2.22158 13.7138 2.69089 13.9105 3.17219 13.8798C3.84948 13.8378 4.47411 14.2398 4.71676 14.8724C4.88942 15.3244 5.26339 15.669 5.72803 15.805C6.19134 15.941 6.69264 15.853 7.08195 15.567C7.62791 15.1651 8.37253 15.1651 8.91783 15.567C9.30714 15.8537 9.80844 15.9417 10.2717 15.805C10.7364 15.669 11.1104 15.3237 11.2837 14.8724C11.5257 14.2398 12.151 13.8371 12.8276 13.8798C13.3102 13.9105 13.7789 13.7138 14.0955 13.3478C14.4122 12.9825 14.5401 12.4906 14.4415 12.0173C14.3035 11.354 14.6121 10.6773 15.2048 10.3474C15.6267 10.1114 15.9147 9.69273 15.9841 9.21409C16.0534 8.73546 15.8941 8.25215 15.5554 7.90751ZM7.16661 11.5273L4.16679 8.61813L5.40472 7.38021L7.16661 9.05077L10.9284 5.19501L12.1663 6.43293L7.16661 11.5273Z"
        fill="#00736C"
      />
    </svg>
  );
};

const ErrorIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={80}
      height={80}
      viewBox="0 0 80 80"
      fill="none"
      aria-hidden="true"
    >
      <rect width="80" height="80" rx="40" fill="#FF4F5E" />
      <path
        d="M56.7323 50.0297L44.3498 25.2647C43.9347 24.4339 43.2963 23.7353 42.5064 23.247C41.7164 22.7587 40.806 22.5 39.8773 22.5C38.9487 22.5 38.0383 22.7587 37.2483 23.247C36.4584 23.7353 35.82 24.4339 35.4048 25.2647L23.0223 50.0397C22.6437 50.8016 22.4658 51.6475 22.5054 52.4974C22.545 53.3473 22.8008 54.173 23.2486 54.8964C23.6965 55.6198 24.3215 56.217 25.0645 56.6314C25.8075 57.0458 26.6441 57.2638 27.4948 57.2647H52.2573C53.1097 57.2651 53.9481 57.0475 54.6927 56.6328C55.4374 56.218 56.0636 55.6197 56.512 54.8948C56.9604 54.1699 57.216 53.3424 57.2546 52.4909C57.2931 51.6394 57.1134 50.7921 56.7323 50.0297ZM37.3773 32.2647C37.3773 31.6016 37.6407 30.9657 38.1096 30.4969C38.5784 30.0281 39.2143 29.7647 39.8773 29.7647C40.5404 29.7647 41.1763 30.0281 41.6451 30.4969C42.114 30.9657 42.3773 31.6016 42.3773 32.2647V42.2647C42.3773 42.9277 42.114 43.5636 41.6451 44.0324C41.1763 44.5013 40.5404 44.7647 39.8773 44.7647C39.2143 44.7647 38.5784 44.5013 38.1096 44.0324C37.6407 43.5636 37.3773 42.9277 37.3773 42.2647V32.2647ZM39.8773 52.8897C39.2593 52.8897 38.6551 52.7064 38.1412 52.363C37.6273 52.0196 37.2267 51.5316 36.9902 50.9605C36.7537 50.3895 36.6918 49.7612 36.8124 49.155C36.933 48.5488 37.2306 47.992 37.6676 47.5549C38.1047 47.1179 38.6615 46.8203 39.2677 46.6997C39.8739 46.5791 40.5022 46.641 41.0732 46.8775C41.6443 47.1141 42.1323 47.5146 42.4757 48.0285C42.8191 48.5424 43.0023 49.1466 43.0023 49.7647C43.0023 50.5935 42.6731 51.3883 42.0871 51.9744C41.501 52.5604 40.7062 52.8897 39.8773 52.8897Z"
        fill="white"
      />
    </svg>
  );
};

// checkout props
interface CheckoutParams {
  offeringId: string;
}

// forces dynamic rendering
// https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config
export const dynamic = 'force-dynamic';

// Error page
// shares stub information from Checkout page
// retains same comments as Checkout page
export default async function Error({ params }: { params: CheckoutParams }) {
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

  // Note: commented out as this portion is not part of main tasks
  // taken from T&P to assist in translations
  // comments retained from T&P
  // TODO - Temporary
  // Identify an approach to ensure we don't have to perform this logic
  // in every component/page that requires localization.
  // const languages = headers()
  //   .get('Accept-Language')
  //   ?.split(',')
  //   .map((language) => language.split(';')[0]);

  // TODO
  // Move to instantiation on start up. Ideally getBundle's, generateBundle, is only called once at startup,
  // and then that instance is used for all requests.
  // Approach 1 (Experimental): https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
  // Approach 2 (Node global): https://github.com/vercel/next.js/blob/canary/examples/with-knex/knex/index.js#L13
  // const l10n = await getBundle(languages);

  return (
    <>
      {/* error page header and subheader */}
      <header className="subscription-title page-title-container desktop:pt-10">
        <h1 className="font-semibold leading-8 mb-1 text-grey-600 text-xl">
          Error confirming subscription…
        </h1>
        <div className="flex items-center justify-center gap-2 text-green-900 mb-4">
          <CheckIcon />
          <h2 className="font-semibold text-sm">30-day money-back guarantee</h2>
        </div>
      </header>

      {/* body */}
      <article className="component-card border-t-0 mb-6 pt-4 rounded-t-lg text-grey-600 px-4 pb-12">
        {/* main content */}
        <section className="flex flex-col items-center justify-center">
          {/* error icon hidden to screen readers as this information does not add to the page */}
          <div className="mt-20 mb-12 mx-auto">
            <ErrorIcon />
          </div>

          {/* error copy retrieved from card data */}
          <div className="py-0 text-grey-400 mb-18 px-20 text-center">
            <p className="mb-4 text-sm">
              Your transaction could not be processed. Please verify your credit
              card information and try again.
              {/*
                  Note: commented out as this portion is not part of main tasks
                  {cart.errorReasonId}
                  {l10n.getMessage(cart.errorReasonId)?.value?.toString() ||
                'Your transaction could not be processed. Please verify your credit card information and try again.'}
              */}
            </p>
          </div>

          {/* Try again button */}
          <Link
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded w-full text-center"
            href="/123done/checkout?interval=monthly"
          >
            Try again
          </Link>

          {/*
              Note: accessibility issue in T&P unrelated to error page - fails best practice but minor
              Error: header levels should increase by one (missing h3)
              Additionally, this would probably be a footer to the article
          */}
          <TermsAndPrivacy
            {...cart}
            {...contentful.commonContent}
            {...contentful.purchaseDetails}
            showFXALinks={true}
          />
        </section>
      </article>

      {/*
          Note: purchase details
          on the fence about making this an aside as complementary information but is it legally required?
          left as a section to be safe
      */}
      <section className="payment-panel" aria-label="Purchase details">
        <PurchaseDetails
          interval={cart.interval}
          invoice={cart.nextInvoice}
          purchaseDetails={contentful.purchaseDetails}
        />
      </section>
    </>
  );
}
