import { Stripe } from 'stripe';
import {
  OfferingCommonContentResult,
  PurchaseDetailsTransformed,
} from '@fxa/shared/cms';
import { StripeMetadataKeysForCMS } from './types';

/**
 *  Class that maps CMS Config onto a single Stripe Plan's metadata
 */
export class PlanMapperUtil {
  errorFields: string[] = [];
  constructor(
    private commonContent: OfferingCommonContentResult,
    private purchaseDetails: PurchaseDetailsTransformed,
    private stripeMetadata: Stripe.Metadata | null,
    private cmsEnabled: boolean
  ) {}

  /**
   * For a specific Metadata key, determine whether to use the Stripe metadata value
   * or CMS value
   */
  mapField(
    stripeFieldName: StripeMetadataKeysForCMS,
    stripeValue?: string,
    cmsValue?: string | null
  ) {
    // If cms config enabled, skip comparison and
    // return undefined if null, otherwise cmsValue
    if (this.cmsEnabled) {
      return cmsValue === null ? undefined : cmsValue;
    }

    // Return undefined if stripe and cms aren't provided
    if (stripeValue === undefined && cmsValue === null) {
      return undefined;
    }

    // Return cms if no stripe value is available
    if (!stripeValue && !!cmsValue) {
      return cmsValue;
    }

    // If stripe does not match cms, return stripe and log error
    if (stripeValue !== cmsValue) {
      this.errorFields.push(stripeFieldName);
      return stripeValue;
    }

    return stripeValue;
  }

  /**
   * Return the Stripe metadata value for the provided key
   */
  getStripeForMetadataKey(stripeMetadataKey: StripeMetadataKeysForCMS) {
    if (!this.stripeMetadata) {
      return undefined;
    }

    switch (stripeMetadataKey) {
      case StripeMetadataKeysForCMS.NewsletterSlug:
        return (
          this.stripeMetadata[StripeMetadataKeysForCMS.NewsletterSlug] &&
          this.stripeMetadata[StripeMetadataKeysForCMS.NewsletterSlug]
            .split(',')
            .sort()
            .join(',')
        );
      default:
        return this.stripeMetadata[stripeMetadataKey];
    }
  }

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
   * Merges Stripe and CMS values where appropriate, and logs fields where
   * CMS does not match Stripe metadata values
   */
  mergeStripeAndCMS() {
    const mappedMetadata: {
      [key in StripeMetadataKeysForCMS]?: string;
    } = {};
    Object.values(StripeMetadataKeysForCMS).forEach((key) => {
      mappedMetadata[key] = this.mapField(
        key,
        this.getStripeForMetadataKey(key),
        this.getCMSForMetadataKey(key)
      );
    });

    return {
      metadata: mappedMetadata,
      errorFields: this.errorFields,
    };
  }
}
