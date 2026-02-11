# Use REST (auth-client) over GQL when convenient

- Status: accepted
- Deciders: Lauren Zugai, Ben Bangert, Dan Schomburg, Valerie Pomerleau, Barry Chen
- Date: 2024-12-11

## Context and Problem Statement

In [ADR 16](https://github.com/mozilla/fxa/blob/main/docs/adr/0016-use-graphql-and-apollo-for-settings-redesign.md), 4 1/2 years ago, FxA decided to use GraphQL and Apollo Cache with the Settings redesign project for developer tooling, client-side caching, and performance gains expectations. We began by layering GQL on top of our existing REST service for faster initial development in GQL and to mitigate risk around going "all in" on a novel technology for FxA, using auth-client (our client that talks to auth-server to connect to our REST endpoints) in graphql-api.

This worked fairly well inside of account settings where we could reduce network requests and it was clear what data we were querying, accessing, and updating client-side. However, in [#8138](https://github.com/mozilla/fxa/pull/8138), the FxA team proposed and later implemented a refactoring effort to move API logic out of components in favor of an [`Account` class abstraction](https://github.com/mozilla/fxa/blob/2d130ed6a0cffa2394a6e1f13a6992140630dd84/packages/fxa-settings/src/models/Account.ts). It may not have been clear at the time because we were also still using auth-client in some places likely due to convenience, but while this pattern allowed less tedious Apollo mocks for tests, it also requires us to manually update Apollo Cache with every request since they're called outside of React components. While we have mitigated some of this and created better separation of concerns by moving to container components ([see ADR 39](https://github.com/mozilla/fxa/blob/main/docs/adr/0039-use-react-container-component-abstraction.md)), we still have to manually update Apollo Cache with every auth-client call, and testing container components can feel tedious when using GQL.

Since expanding our React work beyond account settings, FxA's experience with GQL has been a mixed bag. While nice sometimes in the front-end, it has increased complexity of and time spent on some projects like key stretching because we're using both GQL and auth-client, increased some refactoring and new feature scopes due to needing to set up GQL resolvers and tests as well as creating a new type server-side and client-side, and our manual updating of Apollo Cache has caused more than one bug.

The varied usage of GQL and auth-client in our front-end feels fractured, we are not reaping the benefits of the end-to-end type safety, and our graphql-api still overfetches data it requests from auth-server via auth-client. All of this can be mitigated by going "all-in" on GraphQL with back-end refactoring - e.g. migrating pieces of auth-server into our new `libs/` directory and using them directly in graphql-api instead, and essentially deprecating auth-client. See our [Google doc "fxa-auth-client usage in FxA"](https://docs.google.com/document/d/1cXoINF50KIUvR1tp22qdZCS3YwN6kMNtdD2kvWN6xPk/edit) created in Q4 2023 for more details on this and [the epic made for it](https://mozilla-hub.atlassian.net/browse/FXA-8633).

Additionally, we don't have documentation on when to use our existing state management tools - Apollo Cache, location state, local storage, and "sensitive data client". On top of this, FxA desires a move to NextJS (or similar framework) at some point in the future which will require looking at our network requests and state management holistically. We don't want to spend a lot of time refactoring only to refactor to another approach later.

This brings us to our question: what do we want to do in the meantime about the state of GQL and auth-client in FxA?

## Decision Drivers

- Level-of-effort to get us consistent using one approach
- Ease of use, simplicity, and developer velocity
- Considerations for the future - we currently would like to move to NextJS eventually

## Considered Options

A. Use GQL for all new network requests, continue creating GQL resolvers that use auth-client, and plan to deprecate auth-client through client-side and server-side refactoring
B. Use auth-client for all new network requests, or prefer auth-client and only use GQL where already set up
C. Use auth-client for all new network requests, and plan to strip out GQL and use auth-client everywhere

## Decision Outcome

Chosen option: B, "Use auth-client for all new network requests, or prefer auth-client and only use GQL where already set up" because by standardizing on auth-client for now or at least using it when it is convenient, we minimize overhead in setting up and maintaining GQL mutations/resolvers while leaving open the possibility of moving to a framework like NextJS later, where we can re-evaluate our data-fetching and state strategies more holistically.

This option allow engineers the most flexibility to get tasks out the quickest way, especially if we can create a DRY wrapper for auth-client like what's described in [FXA-10861](https://mozilla-hub.atlassian.net/browse/FXA-10861).

Additionally, while we started a [state management/architecture doc](https://docs.google.com/document/d/17dCwjxhxBKXDclkydmPHD91Pj3suIFihR6fZw6m126Q/edit?tab=t.0#heading=h.3neqekw0gen1) in 2023, we should revisit and better finish this documentation to clarify when to use which tool for state management.

Note that every option requires varying levels of manually handling Apollo Cache updates unless we were to choose option A _and_ refactor away from our `useAccount` pattern inside account settings.

### Positive Consequences

- Clarity of direction while maximizing flexibility for developers for now
- Reduced complexity and cognitive load
- Increased developer velocity due to not needing to set up GQL resolvers
- By using auth-client we'll be directly querying auth-server instead of essentially using our GraphQL server as a proxy to talk to auth-server for us (which is preferable especially for simple mutations)

### Negative Consequences

- We'll still have to manually update Apollo Cache
- Potential loss of GQL benefits, including previous GQL refactoring investments
- We'll continue to have a mixed usage of GQL and auth-client in our client-side with no immediate plans to mitigate the inconsistency
- If we change our minds later, we'll have more factoring work to do to deprecate auth-client. However, it's worth noting FxA already has a very mixed usage of auth-client and GQL

## Pros and Cons of the Options

### Option A: Use GQL for all new network requests, continue creating GQL resolvers that use auth-client, and plan to deprecate auth-client through client-side and server-side refactoring

This option continues the work we began after [ADR 16](https://github.com/mozilla/fxa/blob/main/docs/adr/0016-use-graphql-and-apollo-for-settings-redesign.md), and planning to deprecate auth-client through client-side and server-side refactoring would lead us to "going all-in" on GraphQL.

- Good, because after deprecating auth-client we'll finally be able to realize the full benefits of using GQL
- Good, because it eliminates the complexity of maintaining two data-fetching paradigms, simplifying the codebase to a single approach
- Good, because we want to do some back-end refactoring to use `libs/` regardless
- Good, because this option would require the least amount of manual Apollo Cache handling out of all options, however, additional refactoring away from our current `useAccount` pattern would be required to eliminate this entirely
- Bad, because after we've "gone all-in" then moving away from GQL later if desired may be challenging due to significant client-side refactoring of our components and tests including rethinking our state management, we would need to build out new REST endpoints, and require regression testing
- Bad, because the level of effort to complete the back-end refactor is high and also requires front-end refactoring away from auth-client, both of which may not be useful to us if we move to NextJS in the future
- Bad, because until we can complete these required refactors, continuing to use GQL in this way adds development complexity (plus we may have to update auth-client and auth-server endpoints regardless), introduces additional points of failure and potential latency, and complicates error handling

### Option B: Use auth-client for all new network requests, or prefer auth-client and only use GQL where already set up

- Good, because it reduces some complexity right now and allows for the most flexibility for engineers when working through tasks
- Good, because it makes mocking in front-end tests easier
- Good, because we will avoid laborious back-end and front-end refactoring tasks now in favor of other work and revisiting a plan for consistency when we move to NextJS (or at some point in the future)
- Bad, because we'll continue to have a mixed usage of GQL and auth-client in our client-side with no immediate plans to mitigate the inconsistency
- Bad, because we'll need to update Apollo Cache manually for every auth-client request that we need to store the result of in Apollo Cache
- Bad, because it does not further leverage GQL’s potential benefits or capitalize on our previous GQL investments

### Option C: Use auth-client for all new network requests, and plan to strip out GQL and use auth-client everywhere

- Good, because it eliminates the complexity of maintaining two data-fetching paradigms, simplifying the codebase to a single approach
- Good, because it makes mocking in front-end tests easier
- Bad, because the level of effort to strip out GQL from our client-side code and remove Apollo Cache would be high and may not be the best use of engineering time until a future framework decision (like moving to NextJS) is made
- Bad, because it does not further leverage GQL’s potential benefits or capitalize on our previous GQL investments

## Links

- Previous ADRs:
  - [Use GraphQL in settings redesign](https://github.com/mozilla/fxa/blob/main/docs/adr/0016-use-graphql-and-apollo-for-settings-redesign.md)
  - [Use container component pattern](https://github.com/mozilla/fxa/blob/main/docs/adr/0039-use-react-container-component-abstraction.md)
- [Never finished doc](https://docs.google.com/document/d/1cXoINF50KIUvR1tp22qdZCS3YwN6kMNtdD2kvWN6xPk/edit) for fxa-settings front-end architecture
- [FXA-10861](https://mozilla-hub.atlassian.net/browse/FXA-10861) - Create auth-client wrapper
- [FXA-8633](https://mozilla-hub.atlassian.net/browse/FXA-8633) - Epic for moving away from auth-client in graphql-api
- [FxA + NextJS doc](https://docs.google.com/document/d/1eTWxFclGf_l0NwYefsP0zey8Q9CfrJcmMEZ5XdSXqOY/)
