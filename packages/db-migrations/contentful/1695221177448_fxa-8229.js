function migrationFunction(migration, context) {
  const couponConfig = migration.editContentType('couponConfig');
  couponConfig.deleteField('countries');
  const couponConfigCountries1 = couponConfig.createField('countries');
  couponConfigCountries1
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
  couponConfig.moveField('stripePromotionCodes').afterField('countries');
  couponConfig.changeFieldControl('countries', 'builtin', 'checkbox');
}
module.exports = migrationFunction;
