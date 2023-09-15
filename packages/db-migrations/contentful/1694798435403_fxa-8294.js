function migrationFunction(migration, context) {
  const subGroup = migration.editContentType('subGroup');
  const subGroupOffering = subGroup.editField('offering');
  subGroupOffering.items({
    type: 'Link',
    validations: [{ linkContentType: ['offering'] }],
    linkType: 'Entry',
  });
}
module.exports = migrationFunction;
