function migrationFunction(migration, context) {
  const subGroup = migration.createContentType('subGroup');
  subGroup
    .displayField('internalName')
    .name('Sub group')
    .description('Subscription Group configuration.');

  const subGroupInternalName = subGroup.createField('internalName');
  subGroupInternalName
    .name('Internal Name')
    .type('Symbol')
    .localized(false)
    .required(true)
    .validations([{ unique: true }])
    .disabled(false)
    .omitted(false);

  const subGroupGroupName = subGroup.createField('groupName');
  subGroupGroupName
    .name('Group Name')
    .type('Symbol')
    .localized(false)
    .required(false)
    .validations([])
    .disabled(false)
    .omitted(false);

  const subGroupOffering = subGroup.createField('offering');
  subGroupOffering
    .name('Offering')
    .type('Array')
    .localized(false)
    .required(true)
    .validations([])
    .disabled(false)
    .omitted(false)
    .items({ type: 'Link', validations: [], linkType: 'Entry' });
  subGroup.changeFieldControl('internalName', 'builtin', 'singleLine');
  subGroup.changeFieldControl('groupName', 'builtin', 'singleLine');
  subGroup.changeFieldControl('offering', 'builtin', 'entryLinksEditor');
  migration.deleteContentType('stripePromotionCode');
  migration.deleteContentType('stripePlan');

  const couponConfig = migration.editContentType('couponConfig');
  const couponConfigStripePromotionCodes = couponConfig.editField(
    'stripePromotionCodes'
  );
  couponConfigStripePromotionCodes.items({ type: 'Symbol', validations: [] });
  couponConfig.changeFieldControl(
    'stripePromotionCodes',
    'builtin',
    'tagEditor'
  );

  const purchase = migration.editContentType('purchase');
  purchase.deleteField('commonContent');
  const purchaseStripePlanChoices = purchase.editField('stripePlanChoices');
  purchaseStripePlanChoices.items({ type: 'Symbol', validations: [] });
  purchase.changeFieldControl('stripePlanChoices', 'builtin', 'tagEditor');

  const offering = migration.editContentType('offering');
  const offeringArchivedStripePlans = offering.deleteField(
    'archivedStripePlans'
  );
  offering.deleteField('activeStripePlans');
  offering.deleteField('experimentPurchases');
  const offeringStripeProductId = offering.createField('stripeProductId');
  offeringStripeProductId
    .name('Stripe Product ID')
    .type('Symbol')
    .localized(false)
    .required(true)
    .validations([])
    .disabled(false)
    .omitted(false);

  const offeringCountries = offering.createField('countries');
  offeringCountries
    .name('Countries')
    .type('Array')
    .localized(false)
    .required(false)
    .validations([])
    .disabled(false)
    .omitted(false)
    .items({
      type: 'Symbol',
      validations: [
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
      ],
    });

  const offeringExperimentPurchase = offering.createField('experimentPurchase');
  offeringExperimentPurchase
    .name('Experiment purchase')
    .type('Array')
    .localized(false)
    .required(false)
    .validations([])
    .disabled(false)
    .omitted(false)
    .items({
      type: 'Link',
      validations: [{ linkContentType: ['purchase'] }],
      linkType: 'Entry',
    });
  offeringArchivedStripePlans.required(true);

  const offeringCommonContent = offering.createField('commonContent');
  offeringCommonContent
    .name('Common Content')
    .type('Link')
    .localized(false)
    .required(false)
    .validations([{ linkContentType: ['commonContent'] }])
    .disabled(false)
    .omitted(false)
    .linkType('Entry');
  offering.changeFieldControl('commonContent', 'builtin', 'entryLinkEditor');
  offering.changeFieldControl('countries', 'builtin', 'tagEditor');
  offering.changeFieldControl('defaultPurchase', 'builtin', 'entryLinkEditor', {
    helpText:
      'Default purchase configuration to be used if no experiment is provided.',
    showLinkEntityAction: true,
    showCreateEntityAction: true,
  });
  offering.changeFieldControl(
    'experimentPurchase',
    'builtin',
    'entryLinksEditor',
    {
      helpText: 'Experiment purchase configurations.',
      bulkEditing: false,
      showLinkEntityAction: true,
      showCreateEntityAction: true,
    }
  );
  offering.changeFieldControl('iap', 'builtin', 'entryLinksEditor');
  offering.changeFieldControl('stripeProductId', 'builtin', 'singleLine');

  const purchaseDetails = migration.editContentType('purchaseDetails');
  const purchaseDetailsProductName = purchaseDetails.editField('productName');
  purchaseDetailsProductName.required(true);
  purchaseDetails.changeFieldControl('details', 'builtin', 'markdown', {
    helpText:
      'Feature details for the product. Each new line will be a new point in a bullet-point list in the product.',
  });

  const commonContent = migration.editContentType('commonContent');
  commonContent.deleteField('cancellationSurvey');
  const commonContentCancellationUrl =
    commonContent.createField('cancellationUrl');
  commonContentCancellationUrl
    .name('Cancellation URL')
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
  commonContent.changeFieldControl('cancellationUrl', 'builtin', 'singleLine');

  const service = migration.editContentType('service');
  service.deleteField('oAuthClientId');
  const serviceOauthClientId = service.createField('oauthClientId');
  serviceOauthClientId
    .name('OAuth Client ID')
    .type('Symbol')
    .localized(false)
    .required(true)
    .validations([{ unique: true }])
    .disabled(false)
    .omitted(false);
  service.changeFieldControl('oauthClientId', 'builtin', 'singleLine', {
    helpText: 'Assigned OAuth Client ID from Account team.',
  });

  const iap = migration.editContentType('iap');
  iap.resetFieldControl('appleProductIDs');
  iap.resetFieldControl('googleSKUs');
  iap.resetFieldControl('internalName');
}
module.exports = migrationFunction;
