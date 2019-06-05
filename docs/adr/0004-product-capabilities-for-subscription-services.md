# Product Capabilities for Subscription Services

* Deciders: Ben Bangert, Ian Bicking, Ryan Kelly, Les Orchard, Shane Tomlinson
* Date: 2019-06-04

## Context and Problem Statement

For subscription services, we need a way to inform a Relying Party about the
relevant subscription status to enable features for a given user.

## Decision Drivers

* Engineering simplicity
* Security
* Business Operations
* Marketing

## Considered Options

* A. Single profile assertions consisting of a list of subscription capability
  strings based on requesting client ID

* B. Single boolean profile assertion indicating subscription status based on
  requesting client ID

* C. Dedicated profile server API for reporting subscription status based on
  OAuth scopes, separate from userinfo endpoint

* D. Multiple boolean profile assertions indicating capabilities based on OAuth
  scopes

## Decision Outcome

Chosen option A: Single profile assertions consisting of a list of subscription capability
strings based on requesting client ID.

* Subscription capabilities are conveyed as a single additional profile assertion.
* FxA maintains a mapping of client-to-capabilities, capabilities-to-product
* Relying Parties can provide multiple subscription-gated capabilities.
  * Example:
    * **RP-A** provides `goldBadge` and `silverBadge`
    * **RP-B** provides `goldBadge` and `unlimitedStorage`
    * **RP-C** provides `freePuppies`
* FxA can bundle capabilities into cross-RP products as needed for marketing &
  business purposes.
  * Example: 
    * **Product A** bundles `goldBadge` & `unlimitedStorage`
* RPs are not granted visibility into the user's entire subscription status.
  * Example:
    * User subscribes to **Product A**.
    * **RP-A** will see `goldBadge` but not `unlimitedStorage` in User's `subscriptions` claim in profile.
    * **RP-B** will see both `goldBadge` and `unlimitedStorage`
    * **RP-C** sees no capabilities listed

## Pros and Cons of the Options

### A. Single profile assertions consisting of a list of subscription capabilities strings based on requesting client ID

* Description
  * OpenID 'subscriptions' field, visible with 'profile' or
    'profile:subscriptions' OAuth scope
  * Result of 'subscription' field is a mapping of user's subscribed products to
    capabilities, filtered by relevant capabilities provided by requesting RP
  * Internal mappings of RP-to-capabilities, capabilities-to-product
* Pros
  * No additional OAuth complexity.
  * Fine-grained ability to specify different features per RP that each subscription can access.
  * Supports more subscriptions without changing OpenID fields.
  * We can include this for all RP scopes, to avoid having users later need to
    logout/login to change valid scopes.
* Cons
  * Requires update of the internal mapping table to determine what capabilities
    each RP provides, as well as a mapping from products to capabilities

### B. Single boolean profile assertion indicating subscription status based on requesting client ID

* Description
  * Single OpenID 'subscription_status' field
  * Internal service to subscription mapping
    * For subscription X, we track which RPs the subscription results in service
      for (maybe we can get the Stripe data to include this, but we'd still need
      a copy for event distribution look-ups).
    * During FxA Login to RP, we include the 'subscription_status' field if the
      RP is in the mapping, with a value of 'yes' or 'no'.
    * During event distribution, we resolve a users active subscriptions against
      which RPs that provides access to, and send the appropriate RP whether
      the user should be considered subscribed or not.
* Pros
  * Supports more subscriptions without changing OpenID fields.
  * We can include this for all RP scopes, to avoid having users later need to
    logout/login to change valid scopes.
* Cons
  * Assumes an RP provides a single service/product.
  * If an RP has tiers or multiple services, and we have different subscriptions
    providing access to different tiers/services a single RP provides this won't
    work.
  * Requires update of the internal mapping table to determine what RP provides
    service for which subscriptions.

### C. Dedicated profile server API for reporting subscription status based on OAuth scopes, separate from userinfo endpoint

* Description
  * OpenID 'subscriptions' scope, granting the RP access to getting the users'
    subscriptions/features via an API. We include this scope by default for
    RP's we recognize as subscription vendors/partners.
  * Profile Server modification
    * Profile API addition of /v1/subscriptions, requiring scope of
      profile:subscriptions (or features).
  * OAuth Server modification
    * Responds to profile server request to fetch active features/subscriptions
      for user
  * Internal service mapping to features/capabilities
    * See description from other solutions using service mapping of
      features/capabilities
* Pros
  * No additional OAuth complexity.
  * RPs do not need to specifically request this scope, we include it on our
    side.
  * RPs can request subscriptions for a user via API as needed with valid access
    at a later point if they're unsure of webhook delivery.
  * Subscription/Feature response in Profile Server API can be any scheme we
    choose, as the data doesn't have to fit in the idtoken.
* Cons
  * See cons from other solutions using service mapping of features/capabilities.

### D. Multiple boolean profile assertions indicating capabilities based on OAuth scopes

* Description
  * OpenID field per feature/tier (vpn, send_premium_1, etc)
  * Internal service mapping to features/capabilities
    * For subscription X, we track what features/capabilities the subscription
      includes, as well as which RP provides that feature.
    * During FxA Login to RP, we include all OpenID scopes for the RP based on
      the mapping, with a value of 'yes' or 'no' depending on if the sub
      includes it.
    * During event distribution, we determine OpenID scopes for the RP, then
      determine what features are being toggled for the subscription change
      based on the mapping.
* Pros
  * Fine-grained ability to specify different features per RP that each subscription can access.
* Cons
  * Requires update of the internal mapping table to determine what RP provides
    what feature/tier and for which subscriptions.
  * Requires adding more OpenID fields for every feature/tier.
  * Requires forcing users to logout/login to RP if a feature/tier the
    subscription applies to changes, as the OpenID scope for the RP will change.
