# Upgrade content-server's tech stack by moving remaining routes into fxa-settings

- Status: accepted
- Deciders: Mill Soper, Lauren Zugai, Vijay Budhram
- Date: 2022-11-18

Technical Story: [FXA-3915](<[FXA-3915](https://mozilla-hub.atlassian.net/browse/FXA-3915)>), [FXA-6102](<[FXA-6102](https://mozilla-hub.atlassian.net/browse/FXA-6102)>)

## Context and Problem Statement

Many views in the content-server are still served up and rendered via [Backbone.js](https://backbonejs.org/), an increasingly out-of-date framework. To bring those views up-to-date and to bring down technical debt, we have already [converted the Settings views to React.js](https://jira.mozilla.com/browse/FXA-840) and moved them into [a separate React.js app](https://github.com/mozilla/fxa/blob/main/docs/adr/0011-create-new-react-app-for-settings-redesign.md). Now, we want to follow that example and [convert the remaining content-server routes to React.js](https://mozilla-hub.atlassian.net/browse/FXA-3915).

Open questions include how we'll handle API calls from the new pages, where the new views will live, how we'll safely roll these changes out to users, what any backend work may look like, and how we'll clean up the rollout infrastructure when we're finished.

## Decision Drivers

- We want to make the changes as safe as possible, minimizing any chance of disruption to the user experience
- We want to avoid any unnecessary work and clip out extra steps wherever possible
- Rolling out changes (and cleaning up upon successful rollout) should be as simple as possible
- For the sake of both simplicity and efficiency, we should lean on the decisions made in the `fxa-settings` conversion as much as possible
- We want to refactor what makes sense to change now in preparation of new work planned for 2023

## Decisions and Considered Options

### Location of Converted Views

- **Option A: New React App**: host the new content-server routes in a separate React app alongside the `fxa-settings` app. This would allow us to leave the Settings app untouched and unchanged.
- **Option B: Shared React App**: convert the existing React.js app (currently only used for `fxa-settings`) to also house the new routes.
- **Option C: Refactor Backbone Views in React**: embed React components in Backbone views, see more details from [a previous ADR here](https://github.com/mozilla/fxa/blob/main/docs/adr/0011-create-new-react-app-for-settings-redesign.md#option-b---take-the-1000-approach-by-creating-all-new-components-with-react-but-modify-existing-backbonemustache-files-or-refactor-these-components-as-react-components).

### Incremental Rollout Approach

#### Context

##### Groups of work

Many routes need to be released in a block or batch, like the routes for the `reset_password` flow, for both incremental rollout and to ensure routes that depend on each other, e.g. flows, work as expected. There may be as many groups of work as 9, which we can use experiment groups or feature flags we can turn on or off with boolean-valued environment variables to enable.

The multiple experiment approach requires more set up and tear down work than feature flags do and have some limitations (see next section) but does give us more granular control.

##### `/beta` URL

In the options below, the `/beta` route refers to an approach we originally took with the new Settings React application where our Express framework served Settings at routes that began with `/beta` so "new settings" could be tested at `/beta/settings/*` while "current settings" was still available at `/settings/*`. The alternative to this approach is to create a delta at the same path that Express can account for, e.g. `/reset_password` could show the existing content-server route while `/reset_password?showReactApp=true` shows the React version.

**We don't have access to experiment status at the routing level** since our experiment infra spins up at Backbone app start which occurs after route setup, but we _can_ check for this parameter and if a feature flag is turned on.

- Pros: Offers faster development setup
- Cons: Requires a plan of attack to eventually migrate routes from `/beta/whatever` to `/whatever`, which would likely require an implementation per route with re-QA. This was not the case for Settings because all routes were under the parent `/settings` route, so it was a one-time flip from `/beta/settings` to `/settings`.

##### Handling experiment status

Note that experiment status is only accessible on the Backbone side since we do not have experiment infrastructure set up in Settings. Regardless of which option is chosen, the React version of content-server routes living in `fxa-settings` will be accessible when a parameter is present and (if we choose a feature flag option) if the feature flag is on. While not entirely ideal, this is not a risk, and we could likely manually access local storage to check if users are in the experiment if it was.

In `fxa-content-server`'s `router` file, we can check experiment status and render the Backbone view via `createViewHandler` or if the user in is the experiment, use `navigateAway` to the route with a query parameter.

#### Options

- **Option A: Multiple experiments, no `/beta` route**: Each block of routes will be guarded by separate experiments. If a user is in the experiment, the router will send users to the React version of the page via a paramater. This may not be possible since we cannot access experiment status at the Express level.
- **Option B: Multiple experiments, `/beta` route**: Each block of routes will be guarded by separate experiments. If a user is in the experiment, the router will send users to the React version of the page via `/beta/<original_url>` with a parameter.
- **Option C: A single experiment with config settings, and a `/beta` route**: All routes will be guarded by one experiment and separate feature flags per block of routes. In the router file, we will check experiment status as well as feature flag status before send users to the React version of the page via `/beta/<original_url>` with a parameter.
- **Option D: A single experiment with config settings, and no `/beta` route**: All routes will be guarded by one experiment and separate feature flags per block of routes. In the router file, we will check experiment status as well as feature flag status before send users to the React version of the page via a parameter.

#### Other Considerations

`fxa-content-server` does a lot of things on app startup that Settings does not do, like metrics spin up, recognizing relying parties, OAuth and Sync checks, etc. Because we intend on eventually removing `fxa-content-server`, we need Settings to eventually do these things on app startup instead. When this is implemented, we won't need to access query params provided by content-server.

We may have a follow up ADR to cover the approach to launch `fxa-settings` as the new "base" application depending on complexity and discussions at that time.

### GQL Usage

#### When to Use

We want to extend the GQL functionality that already exists in `fxa-settings` due to the advantages GQL offers (see decision outcomes) and currently, FxA has only implemented GQL on authenticated pages.

- **Option A: Use GQL only on authenticated routes**: Use GQL on authenticated routes, and continue using REST for API calls when users are unauthenticated
- **Option B: Use GQL everywhere we can**: Add an option per mutation or query to talk to the `graphql-api` without being authenticated, allowing us to use it everywhere **except for likely oauth routes**, which is another can of worms.

#### Other Implications

If we want to use GQL everywhere we can instead of hitting auth-server directly with REST API calls, and likely even if we're more selective, we have to ensure that the `graphql-api` can handle:

1. Emitting metrics
2. Sending emails
3. Sending push notifications (SQS for event-broker)

- **Option I: Create a new API / set of endpoints in `fxa-auth-server` for `graphql-api`**
  - Pros: Faster to implement
  - Cons: Because it’s more ideal to move functionality into a shared space instead, we’re kicking the can down the road and will eventually need to remove the newly created API in favor of using the shared services
- **Option II: Use `auth-client` to access `fxa-auth-server` API in `graphql-api`**
  - Pros: Faster to implement, less risk than option I since we already use the auth-client for other routes in GQL
  - Cons: We will likely need to refactor later to remove this functionality in favor of using the shared services
- **Option III: Move these pieces of functionality into stand-alone library-type services in `fxa-shared` with Typescript**: We can use something like [Bull](https://optimalbits.github.io/bull/) or a job/worker scheme to decouple the service that needs to send an email from the actual email sending service
  - Pros: This gets us closer to our preferred architecture in the long-term and mitigates more refactoring work later
  - Cons: Large scope increase for this project
- **Option IV: Combination of II + III**: Use `auth-client` as needed in `graphql-api` while migrating other services to `fxa-shared`.
  - Pros: Seems like a happy medium that allows us to continue moving towards our preferred architecture without blocking work
  - Cons: Scope increase (less than option III), and still needing refactoring work at a later time (less than option II). May requires us to coordinate plans across teams.

Since Subscription Platform is looking to use GraphQL and move functionality into `graphql-api`, this is also potentially shared work with them.

## Decision Outcomes

### Location of Converted Views

Chosen option: **Option B: Shared React App**, because:

- This is the conventional React approach. A React app can cleanly handle internal routing, and locating all of the views within a single React app is the least confusing pattern for an engineer with work with.
- Shared state (for flow parameters for example) is much easier to handle if we aren't navigating between different apps
- We can more easily shared components between pages
- Navigation between pages will be more efficient

`Positive consequences:` Navigation is faster, the mental model for engineers is simpler (bringing down maintenance complexity), and we don't increase the amount of work to share state across apps.
`Negative consequences:` We do have to put in the work to update (and safely rollout changes to) the Settings app.

### Incremental Rollout Approach

Chosen option: **Option D: A single experiment with config settings, and no `/beta` route**, because:

- Config settings (feature flags) can be accessed at the Express level and require less set up and tear down than experiments
- Users will still need to be in an experiment to be directed to the React version of the routes
- Requires less refactoring and avoids re-QA vs the temporary `/beta` approach

`Positive consequences`: Less rework later, smoother experience for users and QA
`Negative consequences`: The non-beta approach requires a larger set up ticket with minor unknowns than the `/beta` approach

### GQL Usage

Chosen option: **Option A: Extend the GQL functionality that already exists in `fxa-settings`**, because:

- Using GQL for as many routes as possible ensures type consistency with complex type sharing, reduces interactions between back-end and front-end, allows the front-end to ask for exactly what it needs, and is consistent with the rest of `fxa-settings`
- Moving towards a more streamlined way of reading and writing data feeds into larger overarching goals

`Positive consequences:` This is consistent with the rest of our modernized stack and we gain all the benefits GQL offers us.
`Negative consequences:` We add on additional work to add the necessary queries/mutations.

Chosen option: ** Option IV, use `auth-client` as needed in `graphql-api` while migrating other services to `fxa-shared`**

`Positive consequences`: Front-end functionality work will be unblocked when GQL resolver work is done; it doesn't have to wait for refactoring work.
`Negative consequences`: Will require a little refactoring down the line, but not as much as option I.

### Links

- [Create new React app for Settings redesign (ADR)](https://github.com/mozilla/fxa/blob/main/docs/adr/0011-create-new-react-app-for-settings-redesign.md)
- [Use GraphQL and Apollo for Settings redesign (ADR)](https://github.com/mozilla/fxa/blob/main/docs/adr/0016-use-graphql-and-apollo-for-settings-redesign.md)
