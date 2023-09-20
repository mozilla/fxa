import { fetchCartData, fetchFromContentful } from './stubs';

export async function getCartData(cartId: string) {
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
