/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { fetchCartData, fetchFromContentful } from './stubs';

export async function getFakeCartData(cartId: string) {
  return fetchCartData(cartId);
}

export async function getContentfulContent(offering: string, locale: string) {
  // Fetch hardcoded data. Data is from Contentful Dev though
  const {
    offering: { defaultPurchase, commonContent: contentfulCommonContent },
  } = await fetchFromContentful();

  const purchaseDetails = {
    details: defaultPurchase.details,
    productName: defaultPurchase.productName,
    subtitle: defaultPurchase.subtitle,
    webIcon: defaultPurchase.webIcon,
  };

  const commonContent = {
    cancellationUrl: contentfulCommonContent.cancellationUrl,
    emailIcon: contentfulCommonContent.emailIcon,
    newsletterLabelTextCode: contentfulCommonContent.newsletterLabelTextCode,
    newsletterSlug: contentfulCommonContent.newsletterSlug,
    privacyNoticeDownloadUrl: contentfulCommonContent.privacyNoticeDownloadUrl,
    privacyNoticeUrl: contentfulCommonContent.privacyNoticeUrl,
    successActionButtonLabel: contentfulCommonContent.successActionButtonLabel,
    successActionButtonUrl: contentfulCommonContent.successActionButtonUrl,
    termsOfServiceDownloadUrl:
      contentfulCommonContent.termsOfServiceDownloadUrl,
    termsOfServiceUrl: contentfulCommonContent.termsOfServiceUrl,
  };
  return {
    purchaseDetails,
    commonContent,
  };
}
