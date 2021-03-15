# Use a single config file for all services

- Deciders: Danny Coates, Barry Chen, Vijay Budhram, Wil Clouser, Jody Heavener
- Date: 2021-03-15

## Context and Problem Statement

The current state of service configuration has a lot of duplication and inconsistency across services. Each service defines its own structure, naming convention, and validation that could be shared among all of them. It is relatively difficult and error prone to make configuration changes or additions across services. Using anything but the default configuration for local development is a time consuming exercise. Our current config structure also makes it impossible to run all the fxa services in a single docker container, which would enable a simpler replacement for fxa-dev.

## Decision Drivers

- Developer ease of use
- Production compatibility
- Enable an fxa-dev replacement
- Consistency across services

## Considered Options

- Shared library with unified schema
- Shared library with schema adapters
- Create a configuration service

## Decision Outcome

The shared library with unified schema approach has the best balance of benefits to implementation cost for our current needs.

## Pros and Cons of the Options

### Shared library with unified schema

With this approach we would create a shared library that defines the unified schema and then refactor each service to follow that schema. We'd continue to use `convict` as the validator and exported config API.

Pros:

- Simple implementation
- Solves the duplication and inconsistency problem
- Doesn't preclude a config service at a later time

Cons:

- Requires refactoring services to use the new schema
- A large single config will need more careful maintenance to ensure changes don't orphan config variables or cause unintended effects to other services

### Shared library with schema adapters

This is an extension of the unified schema option that creates adapters for each service so that no refactoring of service code is required. Each adapter would convert the unified schema to a schema expected by each service as is.

Pros:

- No refactoring of service code required

Cons:

- Doesn't solve inconsistency in config structure across services
- Increases complexity by adding another layer of indirection

### Configuration Service

A configuration service would enable more features, flexability, and runtime configuration changes than a shared library.

Pros:

- Faster config change rollout in production
- Enables a broader set of features than a library

Cons:

- More complex design and implementation than a library
- Unclear if we'll need or utilize the extra features
