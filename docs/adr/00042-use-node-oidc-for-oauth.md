## ADR 42: Evaluate Strategy for OAuth Implementation

Status: proposed

Deciders: Vijay Budhram, Wil Clouser, TBD

Date: 2024-03-21

## Context and Problem Statement

FxA has had a custom OAuth implementation for many years. However, it is complex and
difficult to maintain. Our implementation has been slow to adopt new specifications,
security updates and ensure compliant with OAuth 2.0 and OpenID Connect.
This ADR considers the pros and cons of various options to update and modernize our OAuth implementation.

## Decision Drivers

- Security: Address vulnerabilities.
- Maintainability: Simplify updates and maintenance.
- Compliance: Ensure compatibility with OAuth 2.0 and OpenID Connect.
- Transition Risk: Minimize migration risk.

## Considered Options

- Maintain Custom OAuth Implementation
- Use Node [OpenID Connect Provider](https://github.com/panva/node-oidc-provider)

## Decision Outcome

When demoing the proof of concept, the team decided to move forward with the Node OpenID Connect Provider. This decision was made based on the following factors:

- Compliance: Ensures up-to-date security and compliance.
- Features: OIDC provides more features and flexibility.
- Lower Maintenance: Open source and active community.

## Option 1: Maintain Custom OAuth Implementation

Pros

- Control: Complete control over OAuth implementation details and customization to specific needs.
- Integration: No immediate changes or migrations.

Cons

- Maintenance: Ongoing requirement to update and secure the custom implementation.
- Compliance: Increased risk of falling behind on OAuth standards and security practices without dedicated updates.

## Option 2: Transition to Node OpenID Connect Provider

Pros

- Compliance: Ensures up-to-date security and compliance.
- Lower Maintenance: Open source and active community (most popular OIDC library for Node.js).
- Metrics: Emits events for token create, delete, etc can be used for metrics and monitoring.

Cons

- Migration: Lots of unknowns in migrations.
- Learning Curve: New library and patterns to learn.
- Custom Adapter Development: Requires creating custom interfaces with MySQL and Redis to integrate with existing tokens.

Neutral

- Configuration: Easy to add the library but a ton of configuration options makes it confusing to set up.
- Migration: Can run both OAuth implementations in parallel for a period of time

While this ADR does not cover the details of the migration, the following steps are likely to be involved:

1. Deploy new OAuth routes under /oidc or something
2. We could create a new client or use an existing one to test out the routes and ensure compatibility
3. Enable this only in stage while we validate
