# Isolating payment content with third-party widgets from general account management

* Deciders: Ben Bangert, Ian Bicking, Wil Clouser, Les Orchard, Shane Tomlinson
* Date: 2019-05-06

## Context and Problem Statement

In the implementation of payment features for subscription services, we've
decided to use third-party JavaScript for payment widgets.

Best practices established by our security team indicate that third-party JS
should not be included on the highly-sensitive pages - i.e. such as those used
for general account management on Firefox Accounts.

So, we need a way to isolate the pages responsible for subscription sign-up and
management from the rest of Firefox Accounts.

## Decision Drivers

* Security when dealing with financial transactions.
* Security when including with third-party JS code for payment widgets.
* Simplicity in user experience flows.
* Delivering against the subscription services deadline.

## Considered Options

* Option A - Payment pages as separate app supplied with pre-generated access
  token
* Option B - Payment pages as separate app and normal OAuth Relying Party
* Option C - Payment-related content embedded in iframes with pre-generated
  access token passed via postMessage
* Option D - Payment pages as normal FxA content using iframes to isolate
  third-party widgets

## Decision Outcome

Chosen option: "Option A - Payment pages as separate app supplied with
pre-generated access token", because

* Further refinements to access token delivery mechanism in Option A do not
  significantly affect the rest of the payments app.
* Doesn't preclude an upgrade to Option B in the future - i.e. once [Issue
  #640](https://github.com/mozilla/fxa/issues/640) is resolved.
* Doesn't preclude Option C as a future option - e.g. offering embedded
  subscription widgets to third-parties. 
* Fastest practical option given existing record of reviews by security & UX and
  work completed so far.
* Fresh start with a more modern web stack (i.e. React).

## Pros and Cons of the Options

### Option A - Payment pages as separate app supplied with pre-generated access token

* Description
  * Payments pages as standalone web app (i.e. payments.firefox.com)
  * Access token generated via fxa-content-server (i.e. accounts.firefox.com) to
    access fxa-auth-server subscription APIs.
  * Access token conveyed to payments pages directly via URL parameter
    * Alternatively, access token conveyed indirectly via code exchange or other
      more secure mechanism.
* Pros
  * Can effectively isolate third-party widgets by virtue of living on a
    separate origin and receiving a scoped access token.
  * Our original plan of record reviewed by security and UX teams - i.e. time
    already spent.
  * Allows us to build something from scratch using a more modern framework like
    React.
* Cons
  * Building something with React is novel for the project overall.
  * We need to stand up yet another server.

### Option B - Payment pages as separate app and normal OAuth Relying Party

* Description:
  * Payments pages as standalone web app (i.e. payments.firefox.com).
  * Payments pages as full OAuth Relying Party with the usual login flow
    requesting scope to access fxa-auth-server subscription APIs.
  * Access token acquired via standard OAuth mechanisms.
* Pros
  * Can effectively isolate third-party widgets by virtue of living on a
    separate origin and receiving a scoped access token.
  * Allows us to build something from scratch using a more modern framework like
    React.
* Cons
  * There is [an open issue to support
    `?prompt=none`](https://github.com/mozilla/fxa/issues/640) for OpenID
    Connect login. Left unresolved, this issue means accessing payment pages can
    result in a redundant login prompt in UX flows.
  * Building something with React is novel for the project overall.
  * We need to stand up yet another server.

### Option C - Payment-related content embedded in iframes with pre-generated access token passed via postMessage

* Description
  * Payments content hosted on separate domain (i.e. payments.firefox.com)
    embedded in iframes on fxa-content-server pages (i.e. accounts.firefox.com)
  * Access token generated via fxa-content-server (i.e. accounts.firefox.com)
  * `iframe.postMessage()` API used to pass access token to payments content
* Pros
  * This can effectively isolate third-party widgets by virtue of living on a
    separate origin and receiving a scoped access token.
* Cons
  * We need to stand up yet another server - i.e. at least for the separate
    origin.
  * Security story around iframes on the same origin as user management pages
    has not been reviewed - i.e. additional time needed.
  * Seems an awkward fit with UX flows drafted so far, for both subscription
    management and sign-up.
  * Would most likely be more content built using Backbone requiring
    modernization later.
    * (unless we combined React & Backbone on fxa-content-server, which is not
      as clean as a separate app)

### Option D - Payment pages as normal FxA content using iframes to isolate third-party widgets

* Description
  * Payments pages hosted within fxa-content-server
    * (i.e. only accounts.firefox.com involved - no payments.firefox.com host
      created)
  * iframes used to embed and isolate third-party widgets
  * Session token used as usual for API authentication, no access token
    required.
* Pros
  * Requires the fewest novel technology choices.
  * Can reuse the existing fxa-content-server.
* Cons
  * Security story around iframes on the same origin as user management pages
    has not been reviewed - i.e. additional time needed.
  * Would most likely be more content built using Backbone requiring
    modernization later.
    * (unless we combined React & Backbone on fxa-content-server, which is not
      as clean as a separate app)

## Links

* Shane's earlier "[Securing the payment page][securing]" Google Doc.

[securing]:
https://docs.google.com/document/d/17NItC2sWtMH4iGfyaxo_WLxWmKAKpfWOw3N14tQY7I8/edit?usp=sharing