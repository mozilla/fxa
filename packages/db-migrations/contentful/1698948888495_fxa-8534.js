function migrationFunction(migration, context) {
  const offering = migration.editContentType('offering');
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
  offering.changeFieldControl('stripeLegacyPlans', 'builtin', 'tagEditor', {
    helpText:
      'All archived Stripe Plan IDs from Stripe associated to the Stripe Product ID of the product offering.',
  });
}
module.exports = migrationFunction;
