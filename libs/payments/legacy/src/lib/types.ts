/**
 * Stripe metadata keys with CMS config
 */
export enum StripeMetadataKeysForCMS {
  DetailsLine1 = 'product:details:1',
  DetailsLine2 = 'product:details:2',
  DetailsLine3 = 'product:details:3',
  DetailsLine4 = 'product:details:4',
  Subtitle = 'product:subtitle',
  WebIcon = 'webIconURL',
  PrivacyNotice = 'product:privacyNoticeURL',
  PrivacyNoticeDownload = 'product:privacyNoticeDownloadURL',
  ToS = 'product:termsOfServiceURL',
  ToSDownload = 'product:termsOfServiceDownloadURL',
  CancellationURL = 'product:cancellationSurveyURL',
  EmailIcon = 'emailIconURL',
  SuccessAction = 'successActionButtonURL',
  SuccessActionLabel = 'product:successActionButtonLabel',
  NewsletterLabel = 'newsletterLabelTextCode',
  NewsletterSlug = 'newsletterSlug',
}

export type StripeMetadataWithCMS = Partial<
  Record<StripeMetadataKeysForCMS, string>
>;
