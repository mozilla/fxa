/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

 import { fetchCMSData } from '@fxa/payments/ui/actions';
 import { buildRedirectUrl } from '@fxa/payments/ui';
 import type { Metadata } from 'next';
 import type { CheckoutParams, } from '@fxa/payments/ui/server';
 import type { Page, PageType } from './types';

 export async function buildPageMetadata(args: {
   params: CheckoutParams,
   titlePrefix: string,
   description: string,
   page: Page,
   pageType: PageType,
   acceptLanguage: string | null,
   baseUrl: string,
   searchParams?: Record<string, string> | undefined,
 }): Promise<Metadata> {
   const {
    params,
    titlePrefix,
    description,
    page,
    pageType,
    acceptLanguage,
    baseUrl,
    searchParams,
   } = args;

   const { locale, offeringId } = params;

   const cms = await fetchCMSData(offeringId, acceptLanguage, locale);
   const purchaseDetails = cms.defaultPurchase.purchaseDetails;
   const productTitle = purchaseDetails.localizations.at(0)?.productName || purchaseDetails.productName;

   const currentURL = buildRedirectUrl(
     params.offeringId,
     params.interval,
     page,
     pageType,
     {
       baseUrl,
       locale,
       cartId: params.cartId,
       searchParams: searchParams ?? {},
     }
   );

   return {
     title: `${titlePrefix} | ${productTitle}`,
     description: description,
     openGraph: {
       title: `${titlePrefix} | ${productTitle}`,
       description: description,
       url: currentURL,
       images: [
         {
           url: purchaseDetails.webIcon,
           width: 800,
           height: 800,
         },
       ],
       locale: locale.replace('-', '_'),
       type: 'website',
     },
   };
}
