import { Stripe } from 'stripe';
import {
  OfferingCommonContentResult,
  PurchaseDetailsTransformed,
} from '@fxa/shared/contentful';
import { StripeMetadataKeysForContentful } from './types';

/**
 *  Class that maps Contentful Config onto a single Stripe Plan's metadata
 */
export class PlanMapperUtil {
  errorFields: string[] = [];
  constructor(
    private commonContent: OfferingCommonContentResult,
    private purchaseDetails: PurchaseDetailsTransformed,
    private stripeMetadata: Stripe.Metadata | null,
    private contentfulEnabled: boolean
  ) {}

  /**
   * For a specific Metadata key, determine whether to use the Stripe metadata value
   * or Contentful value
   */
  mapField(
    stripeFieldName: StripeMetadataKeysForContentful,
    stripeValue?: string,
    contentfulValue?: string | null
  ) {
    // If contentful config enabled, skip comparison and
    // return undefined if null, otherwise contentfulValue
    if (this.contentfulEnabled) {
      return contentfulValue === null ? undefined : contentfulValue;
    }

    // Return undefined if stripe and contentful aren't provided
    if (stripeValue === undefined && contentfulValue === null) {
      return undefined;
    }

    // Return contentful if no stripe value is available
    if (!stripeValue && !!contentfulValue) {
      return contentfulValue;
    }

    // If stripe does not match contentful, return stripe and log error
    if (stripeValue !== contentfulValue) {
      this.errorFields.push(stripeFieldName);
      return stripeValue;
    }

    return stripeValue;
  }

  /**
   * Return the Stripe metadata value for the provided key
   */
  getStripeForMetadataKey(stripeMetadataKey: StripeMetadataKeysForContentful) {
    if (!this.stripeMetadata) {
      return undefined;
    }

    switch (stripeMetadataKey) {
      case StripeMetadataKeysForContentful.NewsletterSlug:
        return (
          this.stripeMetadata[StripeMetadataKeysForContentful.NewsletterSlug] &&
          this.stripeMetadata[StripeMetadataKeysForContentful.NewsletterSlug]
            .split(',')
            .sort()
            .join(',')
        );
      default:
        return this.stripeMetadata[stripeMetadataKey];
    }
  }

  /**
   * Return the Contentful config value for the provided Stripe metadata key,
   * in the format expected by Stripe metadata
   */
  getContentfulForMetadataKey(
    stripeMetadataKey: StripeMetadataKeysForContentful
  ) {
    switch (stripeMetadataKey) {
      case StripeMetadataKeysForContentful.DetailsLine1:
        return this.purchaseDetails.details[0];
      case StripeMetadataKeysForContentful.DetailsLine2:
        return this.purchaseDetails.details[1];
      case StripeMetadataKeysForContentful.DetailsLine3:
        return this.purchaseDetails.details[2];
      case StripeMetadataKeysForContentful.DetailsLine4:
        return this.purchaseDetails.details[3];
      case StripeMetadataKeysForContentful.Subtitle:
        return this.purchaseDetails.subtitle;
      case StripeMetadataKeysForContentful.WebIcon:
        return this.purchaseDetails.webIcon;
      case StripeMetadataKeysForContentful.PrivacyNotice:
        return this.commonContent.privacyNoticeUrl;
      case StripeMetadataKeysForContentful.PrivacyNoticeDownload:
        return this.commonContent.privacyNoticeDownloadUrl;
      case StripeMetadataKeysForContentful.ToS:
        return this.commonContent.termsOfServiceUrl;
      case StripeMetadataKeysForContentful.ToSDownload:
        return this.commonContent.termsOfServiceDownloadUrl;
      case StripeMetadataKeysForContentful.CancellationURL:
        return this.commonContent.cancellationUrl;
      case StripeMetadataKeysForContentful.EmailIcon:
        return this.commonContent.emailIcon;
      case StripeMetadataKeysForContentful.SuccessAction:
        return this.commonContent.successActionButtonUrl;
      case StripeMetadataKeysForContentful.SuccessActionLabel:
        return this.commonContent.successActionButtonLabel;
      case StripeMetadataKeysForContentful.NewsletterLabel:
        return this.commonContent.newsletterLabelTextCode;
      case StripeMetadataKeysForContentful.NewsletterSlug: {
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
   * Merges Stripe and Contentful values where appropriate, and logs fields where
   * Contentful does not match Stripe metadata values
   */
  mergeStripeAndContentful() {
    const mappedMetadata: {
      [key in StripeMetadataKeysForContentful]?: string;
    } = {};
    Object.values(StripeMetadataKeysForContentful).forEach((key) => {
      mappedMetadata[key] = this.mapField(
        key,
        this.getStripeForMetadataKey(key),
        this.getContentfulForMetadataKey(key)
      );
    });

    return {
      metadata: mappedMetadata,
      errorFields: this.errorFields,
    };
  }
}
