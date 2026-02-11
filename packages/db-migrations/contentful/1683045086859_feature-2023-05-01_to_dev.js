function migrationFunction(migration, context) {
  const service = migration.createContentType('service');
  service
    .displayField('internalName')
    .name('Service')
    .description(
      'Mapping of services to relevant OAuth configuration and capabilities.'
    );

  const serviceInternalName = service.createField('internalName');
  serviceInternalName
    .name('Internal name')
    .type('Symbol')
    .localized(false)
    .required(true)
    .validations([{ unique: true }])
    .disabled(false)
    .omitted(false);

  const serviceDescription = service.createField('description');
  serviceDescription
    .name('Description')
    .type('Symbol')
    .localized(false)
    .required(false)
    .validations([])
    .disabled(false)
    .omitted(false);

  const serviceOAuthClientId = service.createField('oAuthClientId');
  serviceOAuthClientId
    .name('OAuth Client ID')
    .type('Symbol')
    .localized(false)
    .required(true)
    .validations([{ unique: true }])
    .disabled(false)
    .omitted(false);

  const serviceCapabilities = service.createField('capabilities');
  serviceCapabilities
    .name('Capabilities')
    .type('Array')
    .localized(false)
    .required(false)
    .validations([])
    .disabled(false)
    .omitted(false)
    .items({
      type: 'Link',
      validations: [{ linkContentType: ['capability'] }],
      linkType: 'Entry',
    });

  const capability = migration.createContentType('capability');
  capability
    .displayField('internalName')
    .name('Capability')
    .description(
      "Capabilities that services honor, and that customers are entitled to depending on the offering they've purchased."
    );

  const capabilityInternalName = capability.createField('internalName');
  capabilityInternalName
    .name('Internal name')
    .type('Symbol')
    .localized(false)
    .required(true)
    .validations([{ unique: true }])
    .disabled(false)
    .omitted(false);

  const capabilitySlug = capability.createField('slug');
  capabilitySlug
    .name('Slug')
    .type('Symbol')
    .localized(false)
    .required(true)
    .validations([{ size: { min: 3, max: 20 } }, { unique: true }])
    .disabled(false)
    .omitted(false);

  const capabilityDescription = capability.createField('description');
  capabilityDescription
    .name('Description')
    .type('Symbol')
    .localized(false)
    .required(false)
    .validations([])
    .disabled(false)
    .omitted(false);

  const capabilityServices = capability.createField('services');
  capabilityServices
    .name('Services')
    .type('Array')
    .localized(false)
    .required(false)
    .validations([])
    .disabled(false)
    .omitted(false)
    .items({
      type: 'Link',
      validations: [{ linkContentType: ['service'] }],
      linkType: 'Entry',
    });

  const offering = migration.createContentType('offering');
  offering
    .displayField('internalName')
    .name('Offering')
    .description('Offering configuration.');

  const offeringInternalName = offering.createField('internalName');
  offeringInternalName
    .name('Internal name')
    .type('Symbol')
    .localized(false)
    .required(true)
    .validations([{ unique: true }])
    .disabled(false)
    .omitted(false);

  const offeringDescription = offering.createField('description');
  offeringDescription
    .name('Description')
    .type('Symbol')
    .localized(false)
    .required(false)
    .validations([])
    .disabled(false)
    .omitted(false);

  const offeringApiIdentifier = offering.createField('apiIdentifier');
  offeringApiIdentifier
    .name('API Identifier')
    .type('Symbol')
    .localized(false)
    .required(true)
    .validations([{ size: { min: 1, max: 32 } }, { unique: true }])
    .disabled(false)
    .omitted(false);

  const offeringDefaultPurchase = offering.createField('defaultPurchase');
  offeringDefaultPurchase
    .name('Default purchase')
    .type('Link')
    .localized(false)
    .required(false)
    .validations([])
    .disabled(false)
    .omitted(false)
    .linkType('Entry');

  const offeringExperimentPurchases = offering.createField(
    'experimentPurchases'
  );
  offeringExperimentPurchases
    .name('Experiment purchases')
    .type('Array')
    .localized(false)
    .required(false)
    .validations([])
    .disabled(false)
    .omitted(false)
    .items({ type: 'Link', validations: [], linkType: 'Entry' });

  const offeringCapabilities = offering.createField('capabilities');
  offeringCapabilities
    .name('Capabilities')
    .type('Array')
    .localized(false)
    .required(false)
    .validations([])
    .disabled(false)
    .omitted(false)
    .items({
      type: 'Link',
      validations: [{ linkContentType: ['capability'] }],
      linkType: 'Entry',
    });

  const offeringActiveStripePlans = offering.createField('activeStripePlans');
  offeringActiveStripePlans
    .name('Active Stripe Plans')
    .type('Array')
    .localized(false)
    .required(false)
    .validations([])
    .disabled(false)
    .omitted(false)
    .items({
      type: 'Link',
      validations: [{ linkContentType: ['stripePlan'] }],
      linkType: 'Entry',
    });

  const offeringArchivedStripePlans = offering.createField(
    'archivedStripePlans'
  );
  offeringArchivedStripePlans
    .name('Archived Stripe Plans')
    .type('Array')
    .localized(false)
    .required(false)
    .validations([])
    .disabled(false)
    .omitted(false)
    .items({
      type: 'Link',
      validations: [{ linkContentType: ['stripePlan'] }],
      linkType: 'Entry',
    });

  const offeringCouponConfig = offering.createField('couponConfig');
  offeringCouponConfig
    .name('Coupon Config')
    .type('Array')
    .localized(false)
    .required(false)
    .validations([])
    .disabled(false)
    .omitted(false)
    .items({
      type: 'Link',
      validations: [{ linkContentType: ['couponConfig'] }],
      linkType: 'Entry',
    });

  const offeringIap = offering.createField('iap');
  offeringIap
    .name('IAP')
    .type('Array')
    .localized(false)
    .required(false)
    .validations([])
    .disabled(false)
    .omitted(false)
    .items({
      type: 'Link',
      validations: [{ linkContentType: ['iap'] }],
      linkType: 'Entry',
    });

  const purchase = migration.createContentType('purchase');
  purchase
    .displayField('internalName')
    .name('Purchase')
    .description('Purchase flow related configuration options.');

  const purchaseInternalName = purchase.createField('internalName');
  purchaseInternalName
    .name('Internal name')
    .type('Symbol')
    .localized(false)
    .required(true)
    .validations([{ unique: true }])
    .disabled(false)
    .omitted(false);

  const purchaseDescription = purchase.createField('description');
  purchaseDescription
    .name('Description')
    .type('Symbol')
    .localized(false)
    .required(false)
    .validations([])
    .disabled(false)
    .omitted(false);

  const purchaseStripePlanChoices = purchase.createField('stripePlanChoices');
  purchaseStripePlanChoices
    .name('Stripe Plan Choices')
    .type('Array')
    .localized(false)
    .required(true)
    .validations([])
    .disabled(false)
    .omitted(false)
    .items({
      type: 'Link',
      validations: [{ linkContentType: ['stripePlan'] }],
      linkType: 'Entry',
    });

  const purchasePurchaseDetails = purchase.createField('purchaseDetails');
  purchasePurchaseDetails
    .name('Purchase details')
    .type('Link')
    .localized(false)
    .required(true)
    .validations([{ linkContentType: ['purchaseDetails'] }])
    .disabled(false)
    .omitted(false)
    .linkType('Entry');

  const purchaseCommonContent = purchase.createField('commonContent');
  purchaseCommonContent
    .name('Common Content')
    .type('Link')
    .localized(false)
    .required(true)
    .validations([{ linkContentType: ['commonContent'] }])
    .disabled(false)
    .omitted(false)
    .linkType('Entry');

  const iap = migration.createContentType('iap');
  iap
    .displayField('internalName')
    .name('IAP')
    .description('IAP configuration options required for IAP integrations.');

  const iapInternalName = iap.createField('internalName');
  iapInternalName
    .name('Internal name')
    .type('Symbol')
    .localized(false)
    .required(true)
    .validations([{ unique: true }])
    .disabled(false)
    .omitted(false);

  const iapAppleProductIDs = iap.createField('appleProductIDs');
  iapAppleProductIDs
    .name('Apple Product IDs')
    .type('Array')
    .localized(false)
    .required(false)
    .validations([])
    .disabled(false)
    .omitted(false)
    .items({ type: 'Symbol', validations: [] });

  const iapGoogleSkUs = iap.createField('googleSKUs');
  iapGoogleSkUs
    .name('Google SKUs')
    .type('Array')
    .localized(false)
    .required(false)
    .validations([])
    .disabled(false)
    .omitted(false)
    .items({ type: 'Symbol', validations: [] });

  const stripePlan = migration.createContentType('stripePlan');
  stripePlan
    .displayField('internalName')
    .name('Stripe Plan')
    .description(
      '!!!! Automatically Generated from Stripe - Do not modify !!!!\n\nSynced Stripe Product and Stripe Plan information used by other content types.'
    );

  const stripePlanInternalName = stripePlan.createField('internalName');
  stripePlanInternalName
    .name('Internal name')
    .type('Symbol')
    .localized(false)
    .required(true)
    .validations([])
    .disabled(false)
    .omitted(false);

  const stripePlanStripeId = stripePlan.createField('stripeId');
  stripePlanStripeId
    .name('Stripe ID')
    .type('Symbol')
    .localized(false)
    .required(true)
    .validations([{ unique: true }])
    .disabled(false)
    .omitted(false);

  const stripePlanStripeProductId = stripePlan.createField('stripeProductId');
  stripePlanStripeProductId
    .name('Stripe Product ID')
    .type('Symbol')
    .localized(false)
    .required(true)
    .validations([{ unique: true }])
    .disabled(false)
    .omitted(false);

  const stripePlanStripeProductName =
    stripePlan.createField('stripeProductName');
  stripePlanStripeProductName
    .name('Stripe Product Name')
    .type('Symbol')
    .localized(false)
    .required(false)
    .validations([])
    .disabled(false)
    .omitted(false);

  const stripePromotionCode = migration.createContentType(
    'stripePromotionCode'
  );
  stripePromotionCode
    .displayField('internalName')
    .name('Stripe Promotion Code')
    .description(
      '!!!! Automatically Generated from Stripe - Do not modify !!!! \n\nSynced Stripe Coupon and Stripe Promotion Code information used by other content types.'
    );

  const stripePromotionCodeInternalName =
    stripePromotionCode.createField('internalName');
  stripePromotionCodeInternalName
    .name('Internal name')
    .type('Symbol')
    .localized(false)
    .required(true)
    .validations([])
    .disabled(false)
    .omitted(false);

  const stripePromotionCodePromotionCodeId =
    stripePromotionCode.createField('promotionCodeId');
  stripePromotionCodePromotionCodeId
    .name('Promotion Code ID')
    .type('Symbol')
    .localized(false)
    .required(true)
    .validations([{ unique: true }])
    .disabled(false)
    .omitted(false);

  const stripePromotionCodeCouponId =
    stripePromotionCode.createField('couponId');
  stripePromotionCodeCouponId
    .name('Coupon ID')
    .type('Symbol')
    .localized(false)
    .required(true)
    .validations([{ unique: true }])
    .disabled(false)
    .omitted(false);

  const stripePromotionCodeDiscountDetails =
    stripePromotionCode.createField('discountDetails');
  stripePromotionCodeDiscountDetails
    .name('Discount Details')
    .type('Object')
    .localized(false)
    .required(false)
    .validations([])
    .disabled(false)
    .omitted(false);

  const purchaseDetails = migration.createContentType('purchaseDetails');
  purchaseDetails
    .displayField('internalName')
    .name('Purchase details')
    .description('Available Purchase details component configuration options.');

  const purchaseDetailsInternalName =
    purchaseDetails.createField('internalName');
  purchaseDetailsInternalName
    .name('Internal name')
    .type('Symbol')
    .localized(false)
    .required(true)
    .validations([{ unique: true }])
    .disabled(false)
    .omitted(false);

  const purchaseDetailsDetails = purchaseDetails.createField('details');
  purchaseDetailsDetails
    .name('Details')
    .type('Text')
    .localized(true)
    .required(true)
    .validations([])
    .defaultValue({ 'en-US': 'Line 1\nLine 2\nLine 3\nLine 4' })
    .disabled(false)
    .omitted(false);

  const purchaseDetailsProductName = purchaseDetails.createField('productName');
  purchaseDetailsProductName
    .name('Product name')
    .type('Symbol')
    .localized(false)
    .required(true)
    .validations([])
    .disabled(false)
    .omitted(false);

  const purchaseDetailsSubtitle = purchaseDetails.createField('subtitle');
  purchaseDetailsSubtitle
    .name('Subtitle')
    .type('Symbol')
    .localized(true)
    .required(false)
    .validations([])
    .disabled(false)
    .omitted(false);

  const purchaseDetailsWebIcon = purchaseDetails.createField('webIcon');
  purchaseDetailsWebIcon
    .name('Web Icon')
    .type('Symbol')
    .localized(false)
    .required(false)
    .validations([
      {
        regexp: {
          pattern:
            '^(ftp|http|https):\\/\\/(\\w+:{0,1}\\w*@)?(\\S+)(:[0-9]+)?(\\/|\\/([\\w#!:.?+=&%@!\\-/]))?$',
          flags: null,
        },
      },
    ])
    .disabled(false)
    .omitted(false);

  const couponConfig = migration.createContentType('couponConfig');
  couponConfig
    .displayField('internalName')
    .name('Coupon config')
    .description(
      'Additional Coupon configuration options that are not currently supported by Stripe.'
    );

  const couponConfigInternalName = couponConfig.createField('internalName');
  couponConfigInternalName
    .name('Internal name')
    .type('Symbol')
    .localized(false)
    .required(true)
    .validations([{ unique: true }])
    .disabled(false)
    .omitted(false);

  const couponConfigCountries = couponConfig.createField('countries');
  couponConfigCountries
    .name('Countries')
    .type('Symbol')
    .localized(false)
    .required(false)
    .validations([
      {
        in: [
          'US - United States',
          'DE - Germany',
          'CA - Canada',
          'FR - France',
          'ES - Spain',
          'IT - Italy',
          'GB - Great Britain',
        ],
      },
    ])
    .disabled(false)
    .omitted(false);

  const couponConfigStripePromotionCodes = couponConfig.createField(
    'stripePromotionCodes'
  );
  couponConfigStripePromotionCodes
    .name('Stripe Promotion Codes')
    .type('Array')
    .localized(false)
    .required(false)
    .validations([])
    .disabled(false)
    .omitted(false)
    .items({
      type: 'Link',
      validations: [{ linkContentType: ['stripePromotionCode'] }],
      linkType: 'Entry',
    });

  const commonContent = migration.createContentType('commonContent');
  commonContent
    .displayField('internalName')
    .name('Common content')
    .description(
      'Content used on multiple pages, not specific to a certain component.'
    );

  const commonContentInternalName = commonContent.createField('internalName');
  commonContentInternalName
    .name('Internal name')
    .type('Symbol')
    .localized(false)
    .required(true)
    .validations([{ unique: true }])
    .disabled(false)
    .omitted(false);

  const commonContentPrivacyNoticeUrl =
    commonContent.createField('privacyNoticeUrl');
  commonContentPrivacyNoticeUrl
    .name('Privacy Notice URL')
    .type('Symbol')
    .localized(false)
    .required(false)
    .validations([
      {
        regexp: {
          pattern:
            '^(ftp|http|https):\\/\\/(\\w+:{0,1}\\w*@)?(\\S+)(:[0-9]+)?(\\/|\\/([\\w#!:.?+=&%@!\\-/]))?$',
          flags: null,
        },
      },
    ])
    .disabled(false)
    .omitted(false);

  const commonContentPrivacyNoticeDownloadUrl = commonContent.createField(
    'privacyNoticeDownloadUrl'
  );
  commonContentPrivacyNoticeDownloadUrl
    .name('Privacy Notice Download URL')
    .type('Symbol')
    .localized(false)
    .required(false)
    .validations([
      {
        regexp: {
          pattern:
            '^(ftp|http|https):\\/\\/(\\w+:{0,1}\\w*@)?(\\S+)(:[0-9]+)?(\\/|\\/([\\w#!:.?+=&%@!\\-/]))?$',
          flags: null,
        },
      },
    ])
    .disabled(false)
    .omitted(false);

  const commonContentTermsOfServiceUrl =
    commonContent.createField('termsOfServiceUrl');
  commonContentTermsOfServiceUrl
    .name('Terms of Service URL')
    .type('Symbol')
    .localized(false)
    .required(false)
    .validations([
      {
        regexp: {
          pattern:
            '^(ftp|http|https):\\/\\/(\\w+:{0,1}\\w*@)?(\\S+)(:[0-9]+)?(\\/|\\/([\\w#!:.?+=&%@!\\-/]))?$',
          flags: null,
        },
      },
    ])
    .disabled(false)
    .omitted(false);

  const commonContentTermsOfServiceDownloadUrl = commonContent.createField(
    'termsOfServiceDownloadUrl'
  );
  commonContentTermsOfServiceDownloadUrl
    .name('Terms of Service Download URL')
    .type('Symbol')
    .localized(false)
    .required(false)
    .validations([
      {
        regexp: {
          pattern:
            '^(ftp|http|https):\\/\\/(\\w+:{0,1}\\w*@)?(\\S+)(:[0-9]+)?(\\/|\\/([\\w#!:.?+=&%@!\\-/]))?$',
          flags: null,
        },
      },
    ])
    .disabled(false)
    .omitted(false);

  const commonContentCancellationSurvey =
    commonContent.createField('cancellationSurvey');
  commonContentCancellationSurvey
    .name('Cancellation survey')
    .type('Symbol')
    .localized(false)
    .required(false)
    .validations([
      {
        regexp: {
          pattern:
            '^(ftp|http|https):\\/\\/(\\w+:{0,1}\\w*@)?(\\S+)(:[0-9]+)?(\\/|\\/([\\w#!:.?+=&%@!\\-/]))?$',
          flags: null,
        },
      },
    ])
    .disabled(false)
    .omitted(false);

  const commonContentEmailIcon = commonContent.createField('emailIcon');
  commonContentEmailIcon
    .name('Email icon')
    .type('Symbol')
    .localized(false)
    .required(false)
    .validations([
      {
        regexp: {
          pattern:
            '^(ftp|http|https):\\/\\/(\\w+:{0,1}\\w*@)?(\\S+)(:[0-9]+)?(\\/|\\/([\\w#!:.?+=&%@!\\-/]))?$',
          flags: null,
        },
      },
    ])
    .disabled(false)
    .omitted(false);

  const commonContentSuccessActionButtonLabel = commonContent.createField(
    'successActionButtonLabel'
  );
  commonContentSuccessActionButtonLabel
    .name('Success Action Button Label')
    .type('Symbol')
    .localized(false)
    .required(false)
    .validations([])
    .disabled(false)
    .omitted(false);

  const commonContentSuccessActionButtonUrl = commonContent.createField(
    'successActionButtonUrl'
  );
  commonContentSuccessActionButtonUrl
    .name('Success Action Button URL')
    .type('Symbol')
    .localized(false)
    .required(false)
    .validations([
      {
        regexp: {
          pattern:
            '^(ftp|http|https):\\/\\/(\\w+:{0,1}\\w*@)?(\\S+)(:[0-9]+)?(\\/|\\/([\\w#!:.?+=&%@!\\-/]))?$',
          flags: null,
        },
      },
    ])
    .disabled(false)
    .omitted(false);
}
module.exports = migrationFunction;
