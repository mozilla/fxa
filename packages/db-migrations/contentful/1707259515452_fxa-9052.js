function migrationFunction(migration, context) {
    const service = migration.editContentType("service");
    const serviceCapabilities = service.editField("capabilities");
    serviceCapabilities
        .required(true)

    const capability = migration.editContentType("capability");
    const capabilityServices = capability.editField("services");
    capabilityServices
        .required(true)
}
module.exports = migrationFunction;
