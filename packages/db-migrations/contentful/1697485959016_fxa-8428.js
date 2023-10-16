function migrationFunction(migration, context) {
  const commonContent = migration.editContentType('commonContent');
  const commonContentNewsletterLabelTextCode = commonContent.createField(
    'newsletterLabelTextCode'
  );
  commonContentNewsletterLabelTextCode
    .name('Newsletter Label Text Code')
    .type('Symbol')
    .localized(false)
    .required(false)
    .validations([{ in: ['default', 'hubs', 'mdnplus', 'snp'] }])
    .defaultValue({ en: 'default' })
    .disabled(false)
    .omitted(false);

  const commonContentNewsletterSlug =
    commonContent.createField('newsletterSlug');
  commonContentNewsletterSlug
    .name('Newsletter Slug')
    .type('Array')
    .localized(false)
    .required(false)
    .validations([])
    .defaultValue({ en: ['mozilla-accounts'] })
    .disabled(false)
    .omitted(false)
    .items({
      type: 'Symbol',
      validations: [
        {
          in: ['mozilla-accounts', 'hubs', 'mdnplus', 'security-privacy-news'],
        },
      ],
    });
  commonContent.changeFieldControl(
    'newsletterLabelTextCode',
    'builtin',
    'radio'
  );
  commonContent.changeFieldControl('newsletterSlug', 'builtin', 'checkbox');
}
module.exports = migrationFunction;
