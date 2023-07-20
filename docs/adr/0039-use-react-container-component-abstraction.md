# Use React Container Component Abstraction

- Status: accepted
- Deciders: Lauren Zugai, Dan Schomburg, Barry Chen
- Date: 2023-07-12

## Context and Problem Statement

In [#8138](https://github.com/mozilla/fxa/pull/8138), the FxA team proposed and later implemented a refactoring effort to move API logic out of components in favor of an [`Account` class abstraction](https://github.com/mozilla/fxa/blob/2d130ed6a0cffa2394a6e1f13a6992140630dd84/packages/fxa-settings/src/models/Account.ts) that lives on `AppContext` and is accessible via a `useAccount` hook. While working on converting the remainder of `fxa-content-server` from Backbone to React in our `fxa-settings` package, extending the `Account` model has been cumbersome and `Account` has grown to be too large by essentially acting as our global API layer and model. Currently, we must pull from `Context` with `useAccount` just to make an API call even when account data is not required.

## Decision Drivers

- A large query runs on the first `useAccount` call, which we do across our newly converted pages just to make an API call even when data is not required. On non-Settings pages, this causes initial over fetching, some data which is not even available without a session token
- We should be [mindful of using Context](https://react.dev/learn/passing-data-deeply-with-context#before-you-use-context) but rely on it often, leading to tedious mocking and other issues like impure functions, possibly unintended rerenders, and less explicit and oftentimes unneeded component dependencies
- Our newly converted pages have varying data requirements and we need a consistent pattern set for when and where to use models and validation
- We currently use Apollo Client's query and mutation methods directly instead of using hooks which is not ideal (see "More Info"), but we want to keep our presentation layer light and don't want to have to use `<MockedProvider>` across all of our tests
- More consistent error handling and loading states; we have a mix of error handling in `Account` and our components, and `account.loading` has not been consistently used or reliable

## Considered Options

- Option A, separate `Account` as "authed" and "non-authed"
- Option B, per-page model + API layer like `Account`, validate with HOC or container
- Option C, per-page container components and models, validate in container

## Decision Outcome

Chosen option: Option C, because it most comprehensively resolves the issues and factors driving the decision.

[See the prototype](https://github.com/mozilla/fxa/pull/15493/) for this option that helped informed the decision outcome.

This decision applies to React pages in the `fxa-settings` package but not Settings pages. Once we've applied this pattern to newly refactored React pages we can decide how we want to handle Settings (which we may want to use just one container component for).

## More Info

It’s common practice to create an instance of Apollo Client at the root of a GraphQL application and pass the instance into `ApolloProvider`, allowing the use of Apollo’s hooks like `useQuery` and `useMutation` anywhere in the component tree.

Currently, we create the Apollo Client instance and instead, place it on our `AppContext`, then pull it into our Account model to perform queries and mutations away from our React components. As mentioned, we began using this pattern for better separation of presentation code from data-fetching logic and to make mocking easier — we don’t have to mock GQL queries/mutations or use [MockedProvider](https://www.apollographql.com/docs/react/development-testing/testing/#the-mockedprovider-component). Though, it's worth noting we have very minimal tests for our `Account` model at present.

If we choose not to perform operations inside React components using ApolloProvider and Apollo provided hooks, we must continue to use `apolloClient.query` and `apolloClient.mutate`. However, there are a few potential downsides associated with using these methods that are worth considering:

- This approach is uncommon - documentation and examples are much more sparse
- These methods are not tied to the React lifecycle, causing manual management of loading and error states as well as manually handling state updates since it does not automatically cause a rerender
- Polling, which we use to check account and session status on signin, signup, and Sync screens, is slightly more complicated because Apollo Client’s query method doesn’t support polling out of the box, only the hooks do. To reference `apolloClient.query` with polling, we have to use `setInterval` and `clearInterval`. (Note: We can’t use Apollo Client subscriptions because our database does not have real-time functionality.)

It's also worth noting that prior to the refactor to use `Account`, we had a [custom `MockedProvider` called `MockedCache`](https://github.com/mozilla/fxa/blob/7a2fef8b77778eaa1b85fd961b924f8aa5afdc14/packages/fxa-settings/src/models/_mocks.tsx#L119) to aid with testing boilerplate, and [a custom `useMutation` hook](https://github.com/mozilla/fxa/blob/690a6b31f787e1325f13776f3ab577f153f1f8b1/packages/fxa-settings/src/lib/hooks.tsx#L68) that reported network errors to Sentry ([see docs that explain more](https://github.com/mozilla/fxa/tree/2d130ed6a0cffa2394a6e1f13a6992140630dd84/packages/fxa-settings#gql-error-handling)).

All proposed options keep GQL in one layer, which will make it easier to refactor away from GQL if we ever desire to in the future compared to abstracting mutations and performing queries in page components, for example, as we would need to use `MockedProvider` in almost all of our tests.

## Pros and Cons of the Options

### Option A, separate `Account` as "authed" and "non-authed"

The FxA team held a preliminary meeting about our front-end architecture and initially noted splitting our Account model into an authenticated and non-authenticated version could address at least some concerns because a lot of account data requires a session token to access, and our global `useAccount` query attempts to fetch this data regardless of sessionToken status.

This was suggested prior to identifying further problems and decision drivers. This is not an ideal solution because we would still have two large models with overlapping methods that may be difficult to split later and does not address all related concerns, though better inversion of control could help this option be more viable.

### Per-page model + API layer like `Account`, validate with HOC or container

Description:

- Instead of a single `Account` model that provides an API layer and account data, create one per page. Continue using `apolloClient.query` and `apolloClient.mutate` and continue referencing `model.apiCallHandler` in components
- Pass dependencies into each page component rather than store them on Context
- If the page needs any validation, create a separate model containing the data to validate, and create a HOC or container component to perform the validation in (similar to [our current `LinkValidator` component](https://github.com/mozilla/fxa/tree/2d130ed6a0cffa2394a6e1f13a6992140630dd84/packages/fxa-settings/src/components/LinkValidator/index.tsx))

Pros and cons:

- Good, because it's better inversion of control than what we have now while keeping a similar pattern
- Good, because it allows us to move away from the `useAccount` hook and makes it easier to see what data needs to be fetched and used per page
- Bad, because it's preferable to use hooks over `apolloClient` direct methods
- Bad, because `apolloClient` and `authClient` should be singletons that we would need to pass into every new page model, or alternatively always pull these out from Context
- Bad, because our loading and error states may still be inconsistent without more refactoring

### Per-page container components and models, validate in container

[See the prototype](https://github.com/mozilla/fxa/pull/15493/) for this option that helped informed the decision outcome.

Description:

- Every page component that needs an API call or data validation will have a corresponding container component to handle them
- Wrap the application in `<ApolloProvider>` so the container component can execute queries and mutations with hooks
- Only perform API calls in container components. This includes `useQuery` for page-specific needed data, which will be stored in and then read from Apollo Cache in future queries, `useMutation` mutations, and `authClient` calls (until those can be refactored to use GQL)
- Handle all error processing in the container component
- If the page needs any validation, create a separate model containing the data to validate, and perform the validation in the container component

Pros and cons:

- Good, because container components are a common pattern and this approach provides a better separation of concerns among our API/network/business logic layer, data models, and presentation layer
- Good, because of more flexibility and inversion of control. We won’t have to mock entire models or partials with `as unknown as Account` type casting and can instead, mock only the handlers and their results when writing page-level tests
- Good, because it allows us to move away from the `useAccount` hook and makes it easier to see what data needs to be fetched and used per page
- Good, because placing validation and API handlers in the same location is explicit and clear
- Good, because of benefits gained when using Apollo Client's hooks (see "More Info")
- Good/neutral, because while we can create consistent error handling in container components, the prototype has shown we likely want to manually handle loading states in page components. Good for pattern setting, but not as smooth as being able to use Apollo Client's `result` object with `error`, `loading`, and `data` states
- Neutral, because GQL related container tests will require a `MockedProvider`. Most tests will be presentation/page-level and will _not_ require `MockedProvider`, but while this is standard when testing Apollo Client and will give us a higher degree of confidence in our API layer, it's another testing tool that engineers will need to familiarize themselves with
- Neutral, because we can isolate changes to non-Settings pages first without taking on a massive refactoring effort, but differing patterns between the two may feel awkward
