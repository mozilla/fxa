import {
  OfferingCommonContentResult,
  PurchaseDetailsTransformed,
} from '@fxa/shared/cms';
import { StripeMetadataKeysForCMS } from './types';

/**
 *  Class that maps CMS Config onto a single Stripe Plan's metadata
 */
export class PlanMapperUtil {
  constructor(
    private commonContent: OfferingCommonContentResult,
    private purchaseDetails: PurchaseDetailsTransformed
  ) {}

  /**
   * Return the CMS config value for the provided Stripe metadata key,
   * in the format expected by Stripe metadata
   */
  getCMSForMetadataKey(stripeMetadataKey: StripeMetadataKeysForCMS) {
    switch (stripeMetadataKey) {
      case StripeMetadataKeysForCMS.DetailsLine1:
        return this.purchaseDetails.details[0];
      case StripeMetadataKeysForCMS.DetailsLine2:
        return this.purchaseDetails.details[1];
      case StripeMetadataKeysForCMS.DetailsLine3:
        return this.purchaseDetails.details[2];
      case StripeMetadataKeysForCMS.DetailsLine4:
        return this.purchaseDetails.details[3];
      case StripeMetadataKeysForCMS.Subtitle:
        return this.purchaseDetails.subtitle;
      case StripeMetadataKeysForCMS.WebIcon:
        return this.purchaseDetails.webIcon;
      case StripeMetadataKeysForCMS.PrivacyNotice:
        return this.commonContent.privacyNoticeUrl;
      case StripeMetadataKeysForCMS.PrivacyNoticeDownload:
        return this.commonContent.privacyNoticeDownloadUrl;
      case StripeMetadataKeysForCMS.ToS:
        return this.commonContent.termsOfServiceUrl;
      case StripeMetadataKeysForCMS.ToSDownload:
        return this.commonContent.termsOfServiceDownloadUrl;
      case StripeMetadataKeysForCMS.CancellationURL:
        return this.commonContent.cancellationUrl;
      case StripeMetadataKeysForCMS.EmailIcon:
        return this.commonContent.emailIcon;
      case StripeMetadataKeysForCMS.SuccessAction:
        return this.commonContent.successActionButtonUrl;
      case StripeMetadataKeysForCMS.SuccessActionLabel:
        return this.commonContent.successActionButtonLabel;
      case StripeMetadataKeysForCMS.NewsletterLabel:
        return this.commonContent.newsletterLabelTextCode;
      case StripeMetadataKeysForCMS.NewsletterSlug: {
        return (
          this.commonContent.newsletterSlug &&
          [...this.commonContent.newsletterSlug].sort().join(',')
        );
      }
      default:
        return undefined;
    }
  }

  /**
   * Build a Stripe-metadata-shaped object from CMS config values.
   */
  mapCMSToStripeMetadata() {
    const mappedMetadata: {
      [key in StripeMetadataKeysForCMS]?: string;
    } = {};
    Object.values(StripeMetadataKeysForCMS).forEach((key) => {
      const cmsValue = this.getCMSForMetadataKey(key);
      if (cmsValue !== null && cmsValue !== undefined) {
        mappedMetadata[key] = cmsValue;
      }
    });

    return mappedMetadata;
  }
}
