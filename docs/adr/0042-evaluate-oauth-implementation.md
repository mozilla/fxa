## ADR 42: Evaluate Strategy for OAuth Implementation

Status: proposed

Deciders: Vijay Budhram, Wil Clouser, TBD

Date: 2024-03-21

## Context and Problem Statement

FxA has had custom OAuth implementation for many years. However, it is complex and 
difficult to maintain. Our implementation has been slow to adopt new specifications,  
security updates and ensure compliant with OAuth 2.0 and OpenID Connect. 
This ADR considers the pros and cons of various options to update and modernize our OAuth implementation.

## Decision Drivers

* Security: Address vulnerabilities.
* Maintainability: Simplify updates and maintenance.
* Compliance: Ensure compatiablity with OAuth 2.0 and OpenID Connect.
* Transition Risk: Minimize migration risk.

## Considered Options

* Maintain Custom OAuth Implementation
* Use Node [OpenID Connect Provider](https://github.com/panva/node-oidc-provider)
* Operate Both in Parallel (Hybrid Approach)

## Decision Outcome

To be determined.

## Option 1: Maintain Custom OAuth Implementation

Pros

* Control: Complete control over OAuth implementation details and customization to specific needs.
* Integration: No immediate changes or migrations.

Cons

* Maintenance: Ongoing requirement to update and secure the custom implementation.
* Compliance: Increased risk of falling behind on OAuth standards and security practices without dedicated updates.

## Option 2: Transition to Node OpenID Connect Provider

Pros

* Compliance: Ensures up-to-date security and compliance.
* Lower Maintenance: Open source and active community (most popular OIDC library for Node.js).
* Metrics: Emits events for token create, delete, etc can be used for metrics and monitoring.

Cons

* Migration: Lots of unknowns in migrations. 
* Learning Curve: New library and patterns to learn.
* Custom Adapter Development: Requires creating custom interfaces with MySQL and Redis to integrate with existing tokens.

Neutral

* Configuration: Easy to add the library but a ton of configuration options makes it confusing to set up.

## Option 3: Operate Both in Parallel

Pros

* Risk Mitigation: Allows gradual transition, minimizing risk by providing a fallback option.
* Testing: We can create test clients to do incremental testing

Cons

* Complexity: Potentially introduces additional complexity and confusion for developers and users.
* Longer Transition: May extend the overall time needed to migrate.
