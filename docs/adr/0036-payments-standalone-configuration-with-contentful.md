# Payments standalone configuration solution with Contentful

- Status: accepted
- Deciders: Reino Muhl, Ben Bangert, Julian Poyourow, Bianca Danforth, Lisa Chan
- Date: 2023-03-08

## Context and Problem Statement

During the most recent Subscription Platform rearchitecture, to provide some limited configuration options for Relying Parties, Stripe metadata was adopted as a temporary solution for the Subscription Platform configuration.

However, this solution has quickly become inflexible, providing only a limited number of configuration options, introducing unintended behaviour that could not easily be resolved, and hindering some new feature requests from Relying Parties. This problem has only been exacerbated as more Relying Parties were onboarded.

## Decision Drivers

- Flexibility to expand configuration options
- Localization support
- User friendly frontend
- Provide immediate field validation
- Ease of use and configuration, to empower Relying Parties to own their configuration

## Considered Options

- A. Stripe metadata - Current solution
- B. Firestore
- C. hCMS - Strapi
- D. hCMS - Contentful

## Decision Outcome

Chosen option: "D. hCMS - Contentful", because it partially or completely meets all of the decision drivers, especially the user friendly frontend and ease of use drivers. This statement applies to both hCMSs considered in this ADR. Even though Strapi scored higher in the teams [hCMS comparison](https://docs.google.com/spreadsheets/d/1Ord_tO994_JdIpgXSQnIXWGeMuLQvy5AbYRx1ahw9zs/edit?usp=sharing), since Contentful is already in use at Mozilla and has already been setup, it saves the Subscription Platform team some time and money when compared to Strapi.

## Pros and Cons of the Options

### A. Stripe metadata

Maintain the current solution by continuing to use Stripe metadata.

- Good, because it's already implemented, and provides the minimum required configuration options
- Bad, because it is inflexible allowing only string key-value pairs
- Bad, because no validation when making changes to metadata. Validation errors are reported to Sentry, and engineers need to inform Relying Parties on any issues
- Bad, because it does not support multiple locales
- Bad, because it requires Stripe production access to maintain
- Bad, because it does not provide a user friendly frontend

### B. Firestore

Migrate configuration to a Firestore collection.

- Good, because gives engineering complete control and flexibility
- Good, because can reuse existing configuration, without requring additional effort from relying parties
- Neutral, because it is a totally bespoke solution
- Bad, because there is no user friendly frontend
- Bad, because there is no validation on field changes
- Bad, because it requires custom tooling and engineering support to maintain

### C. hCMS - Strapi

Using a self-hosted implementation of the headless CMS Strapi.

- Good, because it is flexible, providing a relational content model
- Good, because it enables more complex configuration and features, and at the same time simplifying configuration
- Good, because it provides localization support
- Good, because it provides a user friendly frontend
- Good, because it provides immediate validation when entering data
- Good, because it is extensible and uses a similar tech stack used by the Subscription Platform team
- Good, because it allows Relying Parties to own their configuration
- Good, because it is simple to get up and running
- Good, because it runs in the cloud and has SSO support
- Neutral, because Relying Parties would need training on new configuration
- Bad, because requires SRE effort to setup
- Bad, because not currently used within Mozilla
- Bad, because it does not provide workflow support

### D. hCMS - Contentful

Using a provider cloud hosted implemenatino of the headless CMS Contentful.

- Good, because it is flexible, providing a relational content model
- Good, because it enables more complex configuration and features, and at the same time simplifying configuration
- Good, because it provides a user friendly frontend
- Good, because it provides immediate validation when entering data
- Good, because it has an extensible front-end UI via React extensions
- Good, because it allows Relying Parties to own their configuration
- Good, because it is simple to get up and running
- Good, because already used in Mozilla, meaning no/minimal setup is required
- Good, because Enterprise options are cheaper than competitors (Due to existing contract)
- Good, because it provides workflow support
- Good, because it runs in the cloud and has SSO support
- Neutral, because Relying Parties would need training on new configuration
- Neutral, because it provides localization but does not currently support all languages supported by Subscription Platform
- Bad, because it had the lowest score in the hCMS comparison
- Bad, because of poor community support
