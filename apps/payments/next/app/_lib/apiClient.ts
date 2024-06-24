/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { fetchCartData, fetchFromCMS } from './stubs';

export async function getFakeCartData(cartId: string) {
  return fetchCartData(cartId);
}

export async function getCMSContent(offering: string, locale: string) {
  // Fetch hardcoded data. Data is from CMS Dev though
  const {
    offering: { defaultPurchase, commonContent: cmsCommonContent },
  } = await fetchFromCMS();

  const purchaseDetails = {
    details: defaultPurchase.details,
    productName: defaultPurchase.productName,
    subtitle: defaultPurchase.subtitle,
    webIcon: defaultPurchase.webIcon,
  };

  const commonContent = {
    cancellationUrl: cmsCommonContent.cancellationUrl,
    emailIcon: cmsCommonContent.emailIcon,
    newsletterLabelTextCode: cmsCommonContent.newsletterLabelTextCode,
    newsletterSlug: cmsCommonContent.newsletterSlug,
    privacyNoticeDownloadUrl: cmsCommonContent.privacyNoticeDownloadUrl,
    privacyNoticeUrl: cmsCommonContent.privacyNoticeUrl,
    successActionButtonLabel: cmsCommonContent.successActionButtonLabel,
    successActionButtonUrl: cmsCommonContent.successActionButtonUrl,
    termsOfServiceDownloadUrl: cmsCommonContent.termsOfServiceDownloadUrl,
    termsOfServiceUrl: cmsCommonContent.termsOfServiceUrl,
  };
  return {
    purchaseDetails,
    commonContent,
  };
}
