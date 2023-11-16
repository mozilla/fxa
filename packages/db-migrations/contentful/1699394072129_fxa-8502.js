function migrationFunction(migration, context) {
  const purchase = migration.editContentType('purchase');
  const purchaseStripePlanChoices = purchase.editField('stripePlanChoices');
  purchaseStripePlanChoices.required(false);
  purchase.changeFieldControl('stripePlanChoices', 'builtin', 'tagEditor', {
    helpText:
      'All active Stripe Plan IDs from Stripe associated to the Stripe Product ID of the product offering.',
  });
  purchase.changeFieldControl('purchaseDetails', 'builtin', 'entryLinkEditor', {
    helpText: 'Purchase details for this purchase entry.',
    showLinkEntityAction: true,
    showCreateEntityAction: true,
  });
  purchase.changeFieldControl('offering', 'builtin', 'entryLinkEditor', {
    helpText: 'Associated offering for this purchase entry.',
    showLinkEntityAction: true,
    showCreateEntityAction: true,
  });

  const offering = migration.editContentType('offering');
  const offeringCountries = offering.editField('countries');
  offeringCountries.items({
    type: 'Symbol',
    validations: [
      {
        in: [
          'CA - Canada',
          'FR - France',
          'DE - Germany',
          'GB - Great Britain',
          'IT - Italy',
          'ES - Spain',
          'US - United States',
        ],
      },
    ],
  });

  const offeringStripeLegacyPlans = offering.createField('stripeLegacyPlans');
  offeringStripeLegacyPlans
    .name('Stripe Legacy Plans')
    .type('Array')
    .localized(false)
    .required(false)
    .validations([])
    .disabled(false)
    .omitted(false)
    .items({ type: 'Symbol', validations: [] });
  offering.moveField('iap').beforeField('stripeLegacyPlans');
  offering.moveField('couponConfig').beforeField('stripeLegacyPlans');
  offering.moveField('commonContent').beforeField('stripeLegacyPlans');
  offering.moveField('capabilities').beforeField('stripeLegacyPlans');
  offering.changeFieldControl('internalName', 'builtin', 'singleLine', {
    helpText: 'e.g. 123Done Pro Plus',
  });
  offering.changeFieldControl('apiIdentifier', 'builtin', 'singleLine', {
    helpText:
      'Identifier used in the URL path to uniquely identify this Offering. (e.g. 123doneproplus)',
  });
  offering.changeFieldControl('stripeProductId', 'builtin', 'singleLine', {
    helpText: 'The Stripe Product ID of this product offering found in Stripe.',
  });
  offering.changeFieldControl('countries', 'builtin', 'checkbox', {
    helpText: 'The countries in which this product offering is available.',
  });
  offering.changeFieldControl('couponConfig', 'builtin', 'entryLinksEditor', {
    helpText: 'Coupons offered for this product offering.',
    bulkEditing: false,
    showLinkEntityAction: true,
    showCreateEntityAction: true,
  });
  offering.changeFieldControl('iap', 'builtin', 'entryLinksEditor', {
    helpText: 'IAP configuration for this product offering.',
    bulkEditing: false,
    showLinkEntityAction: true,
    showCreateEntityAction: true,
  });
  offering.changeFieldControl('commonContent', 'builtin', 'entryLinkEditor', {
    helpText: 'Common content for this product offering.',
    showLinkEntityAction: true,
    showCreateEntityAction: true,
  });
  offering.changeFieldControl('stripeLegacyPlans', 'builtin', 'tagEditor', {
    helpText:
      'All archived Stripe Plan IDs from Stripe associated to the Stripe Product ID of the product offering.',
  });

  const couponConfig = migration.editContentType('couponConfig');
  const couponConfigCountries = couponConfig.editField('countries');
  couponConfigCountries.items({
    type: 'Symbol',
    validations: [
      {
        in: [
          'CA - Canada',
          'FR - France',
          'DE - Germany',
          'GB - Great Britain',
          'IT - Italy',
          'ES - Spain',
          'US - United States',
        ],
      },
    ],
  });
  couponConfig.changeFieldControl(
    'stripePromotionCodes',
    'builtin',
    'tagEditor',
    {
      helpText:
        'All of the Stripe promotion codes valid for the product offering.',
    }
  );
  couponConfig.changeFieldControl('countries', 'builtin', 'checkbox', {
    helpText: 'The countries in which the promotion codes can be applied.',
  });

  const capability = migration.editContentType('capability');
  capability.changeFieldControl('services', 'builtin', 'entryLinksEditor', {
    helpText: 'Services associated with this Capability.',
    bulkEditing: false,
    showLinkEntityAction: true,
    showCreateEntityAction: true,
  });

  const commonContent = migration.editContentType('commonContent');
  commonContent.changeFieldControl(
    'privacyNoticeDownloadUrl',
    'builtin',
    'singleLine',
    {
      helpText:
        'The URL for a downloadable version of the Privacy Notice for the product offering, used in emails. This must be a URL to the FxA CDN. It can be either a) full, direct URL to a PDF b) a URL without the language and file extension.',
    }
  );
  commonContent.changeFieldControl(
    'termsOfServiceDownloadUrl',
    'builtin',
    'singleLine',
    {
      helpText:
        'The URL for a downloadable version of the Terms of Service for the product offering, used in emails. This must be a URL to the FxA CDN. It can be either a) full, direct URL to a PDF b) a URL without the language and file extension.',
    }
  );
  commonContent.changeFieldControl('cancellationUrl', 'builtin', 'singleLine', {
    helpText:
      'Override URL for the Cancellation Survey for the product offering. This parameter is used as a hyperlink in emails sent to the customer when their subscription is cancelled due, manual cancellation, Mozilla account deletion, or failed payment.',
  });
  commonContent.changeFieldControl(
    'newsletterLabelTextCode',
    'builtin',
    'radio',
    {
      helpText:
        'A code used to determine which pre-defined labels to add to the newsletter checkbox. If no code is selected, the default label text of "I’d like to receive product news and updates from ⁨Mozilla⁩" will be displayed.',
    }
  );
  commonContent.changeFieldControl('newsletterSlug', 'builtin', 'checkbox', {
    helpText:
      'Slugs that represent the available newsletters to send if a customer opts to sign up for them. Defaults to `mozilla-accounts`.',
  });

  const iap = migration.editContentType('iap');
  iap.changeFieldControl('internalName', 'builtin', 'singleLine');
  iap.changeFieldControl('appleProductIDs', 'builtin', 'tagEditor', {
    helpText:
      'All of the Apple App Store productIds that map to this product offering. There must only be one Stripe plan per App Store productId per environment (development/stage/production). ',
  });
  iap.changeFieldControl('googleSKUs', 'builtin', 'tagEditor', {
    helpText:
      'All of the Google Play product SKUs (now called product IDs) that map to this product offering. There must only be one Stripe plan per Google Play product SKU per environment (development/stage/production).',
  });

  const service = migration.editContentType('service');
  service.changeFieldControl('capabilities', 'builtin', 'entryLinksEditor', {
    helpText: 'Capabilities associated with this service.',
    bulkEditing: false,
    showLinkEntityAction: true,
    showCreateEntityAction: true,
  });

  const subGroup = migration.editContentType('subGroup');
  subGroup.changeFieldControl('groupName', 'builtin', 'singleLine', {
    helpText: 'Name of the subscription group.',
  });
  subGroup.changeFieldControl('offering', 'builtin', 'entryLinksEditor', {
    helpText:
      'All offerings included in this subscription group. The order of the offerings is the order in which a customer can upgrade from and to within the sub group.',
    bulkEditing: false,
    showLinkEntityAction: true,
    showCreateEntityAction: true,
  });
}
module.exports = migrationFunction;
