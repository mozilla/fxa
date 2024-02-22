function migrationFunction(migration, context) {
  const capability = migration.editContentType('capability');
  const capabilitySlug = capability.editField('slug');
  capabilitySlug.validations([]);
  capability.changeFieldControl('slug', 'builtin', 'singleLine', {
    helpText: 'The raw capability string provided to the service by Accounts.',
  });
}
module.exports = migrationFunction;
