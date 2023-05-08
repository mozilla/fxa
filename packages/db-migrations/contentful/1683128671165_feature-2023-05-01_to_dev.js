function migrationFunction(migration, context) {
  const commonContent = migration.editContentType('commonContent');
  const commonContentPrivacyNoticeUrl =
    commonContent.editField('privacyNoticeUrl');
  commonContentPrivacyNoticeUrl.required(true);

  const commonContentPrivacyNoticeDownloadUrl = commonContent.editField(
    'privacyNoticeDownloadUrl'
  );
  commonContentPrivacyNoticeDownloadUrl.required(true);

  const commonContentTermsOfServiceUrl =
    commonContent.editField('termsOfServiceUrl');
  commonContentTermsOfServiceUrl.required(true);

  const commonContentTermsOfServiceDownloadUrl = commonContent.editField(
    'termsOfServiceDownloadUrl'
  );
  commonContentTermsOfServiceDownloadUrl.required(true);

  const commonContentSuccessActionButtonLabel = commonContent.editField(
    'successActionButtonLabel'
  );
  commonContentSuccessActionButtonLabel.localized(true);

  const commonContentSuccessActionButtonUrl = commonContent.editField(
    'successActionButtonUrl'
  );
  commonContentSuccessActionButtonUrl.required(true);

  const offering = migration.editContentType('offering');
  const offeringDefaultPurchase = offering.editField('defaultPurchase');
  offeringDefaultPurchase.required(true);

  const offeringActiveStripePlans = offering.editField('activeStripePlans');
  offeringActiveStripePlans.required(true);
  offeringDefaultPurchase.validations([{ linkContentType: ['purchase'] }]);

  const offeringExperimentPurchases = offering.editField('experimentPurchases');
  offeringExperimentPurchases.items({
    type: 'Link',
    validations: [{ linkContentType: ['purchase'] }],
    linkType: 'Entry',
  });

  const purchaseDetails = migration.editContentType('purchaseDetails');
  const purchaseDetailsProductName = purchaseDetails.editField('productName');
  purchaseDetailsProductName.localized(true);
  purchaseDetailsProductName.required(false);

  const purchaseDetailsWebIcon = purchaseDetails.editField('webIcon');
  purchaseDetailsWebIcon.required(true);

  const stripePromotionCode = migration.editContentType('stripePromotionCode');
  const stripePromotionCodeCouponId = stripePromotionCode.editField('couponId');
  stripePromotionCodeCouponId.validations([]);

  const stripePlan = migration.editContentType('stripePlan');
  const stripePlanStripeProductId = stripePlan.editField('stripeProductId');
  stripePlanStripeProductId.validations([]);
}
module.exports = migrationFunction;
