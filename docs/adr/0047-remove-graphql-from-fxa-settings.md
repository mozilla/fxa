# Remove GraphQL from fxa-settings

- Status: proposed
- Deciders: Vijay Budhram, Lauren Zugai, Dan Schomburg, Barry Chen, Valerie Pomerleau, Amri Toufali, Reino Muhl
- Date: 2026-01-14

This ADR looks at fully removing GraphQL and Apollo from fxa-settings, building on [ADR-0044](0044-use-rest-over-gql-when-convenient.md) which established a preference for auth-client over GraphQL.

## Context and Problem Statement

In [ADR-0016](0016-use-graphql-and-apollo-for-settings-redesign.md) (2020), FxA adopted GraphQL and Apollo for the Settings Redesign project. The chosen approach was "Option B" - layering GraphQL on top of existing REST architecture via `fxa-graphql-api` as a proxy to `fxa-auth-server`.

Four years later, [ADR-0044](0044-use-rest-over-gql-when-convenient.md) (2024) acknowledged that the GraphQL experience had been "a mixed bag" and established a preference for using `auth-client` for new network requests. However, ADR-0044 stopped short of committing to remove GraphQL entirely, citing concerns about level-of-effort and potential future framework changes (NextJS).

This ADR evaluates whether to complete that migration by fully removing GraphQL from fxa-settings, or to maintain the current mixed approach.

**Key question**: Should we fully remove GraphQL and Apollo from fxa-settings?

## Decision Drivers

- **Operational complexity**: Running and maintaining `fxa-graphql-api` as a separate service
- **Infrastructure overhead**: Currently requires 4 additional Fastly sites (prod/stage for GraphQL and internal auth endpoints), generating monitoring noise despite lower traffic volumes
- **Security surface area**: GraphQL exposes a flexible query language that requires allowlists to restrict operations; removing it eliminates this attack vector and the need for allowlist generation/maintenance
- **Rate limiting**: Setting up firewall-level rate limits for GraphQL is a pain since everything goes through one endpoint
- **Error monitoring**: With GraphQL, we can't easily get error rates or request counts per operation in Sentry or our dashboards
- **Developer experience**: Cognitive load of maintaining two data-fetching paradigms
- **Testing complexity**: Apollo mocking vs direct auth-client mocking
- **State management**: Apollo Cache reactivity vs localStorage with `useSyncExternalStore`
- **Performance**: Direct auth-server calls vs GraphQL proxy overhead
- **Future flexibility**: Positioning for potential NextJS migration

## Considered Options

- **Option A**: Maintain current mixed GraphQL/auth-client approach (status quo from ADR-0044)
- **Option B**: Fully remove GraphQL from fxa-settings, use auth-client + localStorage with useSyncExternalStore
- **Option C**: Go "all-in" on GraphQL by refactoring to use libs directly in graphql-api

## Decision Outcome

**Chosen option: Option B** - Fully remove GraphQL from fxa-settings.

- We're maintaining 4 extra Fastly sites, generating allowlists, and running a whole separate service for GraphQL. That's a lot of overhead for what we're getting out of it.
- Having two ways to fetch data (GraphQL and auth-client) is confusing.
- We never really used Apollo Cache the way it was meant to be used anyway, so we're not losing much there.

### Positive Consequences

- **Reduced operational complexity**: No need to run/maintain `fxa-graphql-api` for settings
- **Infrastructure simplification**: Eliminates 4 Fastly sites (prod/stage for GraphQL and internal auth endpoints) that currently generate monitoring noise and operational overhead despite lower traffic volumes
- **Reduced attack surface**: Removes GraphQL query language exposure and eliminates the need for query allowlist generation/maintenance; attackers can no longer craft arbitrary GraphQL queries
- **Simpler testing**: Direct auth-client mocking instead of Apollo MockedProvider
- **Clearer data flow**: Components → auth-client → auth-server (no GraphQL proxy layer)
- **Cleaner architecture**: We stop proxying calls through graphql-api just to reach auth-server
- **Native React state management**: Uses React 18's `useSyncExternalStore` for localStorage reactivity instead of Apollo Cache
- **Smaller bundle size**: Removing `@apollo/client` dependency (~100KB+ gzipped)
- **Faster development**: No need to create GraphQL resolvers, mutations, and types for new features
- **Better error handling**: Direct REST errors vs GraphQL error wrapping
- **Better monitoring**: Sentry and our dashboards work better with REST endpoints since we get clear per-endpoint error rates and request counts
- **Positioned for NextJS**: NextJS has its own opinions about data fetching (Server Components, server actions, etc.) that don't mesh well with Apollo's client-side cache. If we migrate to NextJS with Apollo still in place, we'd have to rip it out then anyway. Better to do it now when we can take our time, rather than during a framework migration when we're already juggling a lot.

### Negative Consequences

- **Migration effort**: Requires completing migration of remaining GraphQL usages
- **Custom state synchronization**: Must use `useSyncExternalStore` with custom events for localStorage reactivity (replacing Apollo Cache's built-in reactivity). Note: TanStack Query could help here if we want caching and automatic refetching, but it's not required for our current needs.
- **Lost GQL benefits**: Lose declarative data requirements, GraphQL playground, and schema documentation (though in practice, nobody on the team actively uses the playground)
- **Requires server changes**: Auth-server endpoints must return all needed data (consolidated endpoints)
- **Testing patterns change**: Teams must learn new mocking patterns (though we already have auth-client mocking patterns in place from existing code)

## Pros and Cons of the Options

### Option A: Maintain current mixed GraphQL/auth-client approach

This is the status quo from ADR-0044 - prefer auth-client but keep GraphQL where already set up.

- Good, because no additional migration work required
- Good, because preserves existing GraphQL investments
- Good, because maintains flexibility to go either direction
- Bad, because developers must understand two data-fetching paradigms
- Bad, because Apollo Cache manual updates are error-prone and cause bugs
- Bad, because tests require both Apollo mocks and auth-client mocks
- Bad, because `fxa-graphql-api` service must continue running
- Bad, because new features face decision fatigue (use GQL or auth-client?)

### Option B: Fully remove GraphQL from fxa-settings

Complete the migration to auth-client with localStorage for persistence and `useSyncExternalStore` for reactive state management.

**Why `useSyncExternalStore`?** One thing Apollo gives us is automatic re-renders when cached data changes. When we remove Apollo, we lose that. We still need components to update when account data changes (e.g., user updates their display name and it should show up everywhere). React 18's `useSyncExternalStore` lets us do this with localStorage: components subscribe to changes, and when we update the stored account data, all subscribed components re-render. It's built into React, so no extra libraries needed.

- Good, because single data-fetching pattern reduces cognitive load
- Good, because testing is simpler with direct auth-client mocks
- Good, because eliminates GraphQL service dependency for settings
- Good, because consolidated `/account` endpoint reduces API calls (9 → 3)
- Good, because positions codebase well for NextJS migration (NextJS prefers server-side data fetching which doesn't play nice with Apollo's client-side cache; removing it now means one less thing to deal with during migration)
- Good, because reduces attack surface by eliminating GraphQL query language exposure and allowlist requirements
- Good, because eliminates 4 Fastly sites and associated operational/monitoring overhead
- Good, because smaller bundle size without Apollo client
- Bad, because requires completing migration work
- Bad, because replaces Apollo Cache reactivity with custom `useSyncExternalStore` + localStorage pattern
- Bad, because loses GraphQL playground and self-documenting schemas
- Bad, because requires understanding `useSyncExternalStore` pattern for localStorage reactivity

### Option C: Go "all-in" on GraphQL

Refactor to use libs directly in graphql-api (deprecate auth-client), as described in FXA-8633.

- Good, because eliminates mixed paradigm by going fully GraphQL
- Good, because could achieve better type safety with GraphQL codegen (though currently we manually declare model shapes on both client and server, so we don't get this benefit today)
- Good, because eliminates Apollo Cache manual update issues
- Good, because maintains GraphQL tooling benefits
- Bad, because requires significant backend refactoring
- Bad, because may conflict with NextJS migration plans
- Bad, because increases GraphQL service complexity
- Bad, because moving away from GQL later would be very expensive
- Bad, because requires migrating auth-client usage back to GraphQL

## Links

- Previous ADRs:
  - [ADR-0016: Use GraphQL and Apollo for Settings Redesign](0016-use-graphql-and-apollo-for-settings-redesign.md)
  - [ADR-0044: Use REST over GQL when convenient](0044-use-rest-over-gql-when-convenient.md)
  - [ADR-0039: Use container component pattern](0039-use-react-container-component-abstraction.md)
- Related tickets:
  - [FXA-8633: Epic for moving away from auth-client in graphql-api](https://mozilla-hub.atlassian.net/browse/FXA-8633)
  - [FXA-10861: Create auth-client wrapper](https://mozilla-hub.atlassian.net/browse/FXA-10861)
