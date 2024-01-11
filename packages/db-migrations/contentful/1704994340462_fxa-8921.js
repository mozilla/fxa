function migrationFunction(migration, context) {
  const offering = migration.editContentType('offering');
  const offeringCountries = offering.editField('countries');
  offeringCountries.items({
    type: 'Symbol',
    validations: [
      {
        in: [
          'AT - Austria',
          'BE - Belgium',
          'BG - Bulgaria',
          'CA - Canada',
          'HR - Croatia',
          'CY - Cyprus',
          'CZ - Czech Republic',
          'DK - Denmark',
          'EE - Estonia',
          'FI - Finland',
          'FR - France',
          'DE - Germany',
          'GR - Greece',
          'HU - Hungary',
          'IE - Ireland',
          'IT - Italy',
          'LV - Latvia',
          'LT - Lithuania',
          'LU - Luxembourg',
          'MY - Malaysia',
          'MT - Malta',
          'NL - Netherlands',
          'NZ - New Zealand',
          'PL - Poland',
          'PT - Portugal',
          'RO - Romania',
          'SG - Singapore',
          'SK - Slovakia',
          'SI - Slovenia',
          'ES - Spain',
          'SE - Sweden',
          'CH - Switzerland',
          'UK - United Kingdom',
          'US - United States',
        ],
      },
    ],
  });
  offering.changeFieldControl('countries', 'builtin', 'checkbox', {
    helpText:
      'FEATURE - WORK IN PROGRESS: Select the countries in which this product offering is available.',
  });
  offering.changeFieldControl('couponConfig', 'builtin', 'entryLinksEditor', {
    helpText:
      'FEATURE - WORK IN PROGRESS (keep coupon configuration in Stripe until further notice): Coupons offered for this product offering.',
    bulkEditing: false,
    showLinkEntityAction: true,
    showCreateEntityAction: true,
  });

  const couponConfig = migration.editContentType('couponConfig');
  const couponConfigCountries = couponConfig.editField('countries');
  couponConfigCountries.items({
    type: 'Symbol',
    validations: [
      {
        in: [
          'AT - Austria',
          'BE - Belgium',
          'BG - Bulgaria',
          'CA - Canada',
          'HR - Croatia',
          'CY - Cyprus',
          'CZ - Czech Republic',
          'DK - Denmark',
          'EE - Estonia',
          'FI - Finland',
          'FR - France',
          'DE - Germany',
          'GR - Greece',
          'HU - Hungary',
          'IE - Ireland',
          'IT - Italy',
          'LV - Latvia',
          'LT - Lithuania',
          'LU - Luxembourg',
          'MY - Malaysia',
          'MT - Malta',
          'NL - Netherlands',
          'NZ - New Zealand',
          'PL - Poland',
          'PT - Portugal',
          'RO - Romania',
          'SG - Singapore',
          'SK - Slovakia',
          'SI - Slovenia',
          'ES - Spain',
          'SE - Sweden',
          'CH - Switzerland',
          'UK - United Kingdom',
          'US - United States',
        ],
      },
    ],
  });
  couponConfig.changeFieldControl('internalName', 'builtin', 'singleLine', {
    helpText:
      'FEATURE - WORK IN PROGRESS: Keep coupon configuration in Stripe until further notice.',
  });
}
module.exports = migrationFunction;
