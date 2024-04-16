# Improving functional test architecture to ease support for React flows

- Status: Final
- Deciders: Katrina Anderson, Lauren Zugai, Valerie Pomerleau
- Consulted: Vijay Budharam
- Date: 2024-05-07

## Context and Problem Statement

Full rollout of React signin routes is currently scheduled for train 285 going to staging on
2024/05/22 and production on 2024/05/29.

However, in planning for full rollout of the React signin routes, local execution of the functional tests revealed that [~45% of the suite fails][1] as a
consequence of this route group being fully enabled.

Based on initial exploration, the rate of failure appears high for this route group because:

- the login POM created for Backbone covers the majority of signin and signup pages, and includes functions with stateful conditional logic
- signin is a pre-requisite for many functional tests, and this setup is currently configured to use the Backbone flow
- use of distinct locators for Backbone and React, with Backbone locators not working for React and vice-versa
- differences in flow between Backbone and React

Going forward, what cohesive approach should we adopt in order to ease rollout of React flows while maximizing coverage and minimizing impact on timelines?

### Previous React rollouts

- ResetPassword: Fully rolled out in production, Backbone routes no longer used. All Backbone tests are skipped. Only the new `React-conversion` tests are running. These tests were relatively well isolated and the migration strategy worked well.
- Signup: Full prod rollout was previously attempted and rolled back, second full prod rollout is planned for Train 283 (stage on 2024/04/24, production on 2024/05/01). New React tests were created, and where the signup flow was used in non-signup tests a condition was added with test steps to go through either flow based on feature flag. In preparation for the initial full prod rollout, Backbone signup tests were skipped when the feature flag was on. By consequence, with the feature flag currently on for all environments, all Backbone tests are skipped even though 85% of users see the Backbone version of the signup flow.

### Migration strategy and challenges

Up until now, the primary strategy for supporting React flows with functional tests has mainly been to:

- create new React-specific POMs (page object models)
- duplicate tests and place them in a `React-conversion` directory (tests selected for duplication are based on the [Playwright Migration Analysis][2])
- conditionally run these React tests based on a feature flag indicating the experiment is enabled for the route group

Additional strategies that have been used include:

- using conditional logic within tests to switch between React and Backbone and React for a portion of the tests steps, based on feature flag configuration
- using conditional logic within tests to run through both Backbone and React versions of flows.
- skip the Backbone tests for full prod rollout (but there is no configuration value that can be checked)

Additional challenges:

- competing ideas have been implemented to bridge the gaps between React and Backbone in the functional tests
- the desired end state of the React functional test migration is not universally agreed upon
- Multiple React routes at different phases of rollout means that conditional logic is required to navigate between React/Backbone test steps
- The tests in `React-conversion` will need to be modified again during the cleanup phase to remove all of the feature flag check and experiment parameters

### Questions

- Are there new pattern that would simplify conversion moving forward (e.g., user-facing locators, single page POMs, route check in POMs, etc.)
- Do we plan to discontinue all Backbone tests? If so, when should we remove vs skip?
- For tests that are not specific to the React conversion routes but that include test steps that use the converted routes, should we create new test files, or update the POM to be React/Backbone agnostic?
- How should we handle test setup (account creation and signup in fixtures) that currently use the Backbone POMs?
- How could we modify our test architecture to support coverage of both Backbone and React tests while a route group experiment is enabled but not fully rolled out?
- Would updating the locators to be Backbone/React agnostic resolve the majority of failures? (currently unknown without doing the work)
- Can we modify top-level fixtures to enroll in the React experiment instead of including `forceExperiment` params in all test steps?

## Decision Drivers

1. Test Coverage

The chosen option should ideally maintain or increase coverage for React flows and avoid compromising (skipping) coverage for Backbone flows.

2. Time & Effort

The chosen option should ideally be feasable within the planned timeframe for the signin React rollout (Train 285).

3. Best Practice & Technical Debt

The chosen option should follow guidelines outlined by [Playwright][3] and the [Ecosystem Documentation][4] in order not to compromise the overall success rate and prevent maintenance costs

## Considered Options

- Option 1: Single set of POMs for React/Backbone, update existing tests
  - Option 1a: Update by Page-First Approach
  - Option 1b: Update by Test-First Approach
- Option 2: Status Quo - Separate POMs for React and Backbone, Migrate Tests According to [Analysis][2]

## Decision Outcome

Chosen option: **Option 1b, Single set of POMs for React/Backbone, update existing tests with a test-first approach**

Overall, option 1b best fulfills our time & effort decision criteria, keeping the signin React rollout on track. While the action plan outlined in option 2 has served the team well thus far, separating the React and Backbone concerns, it will not scale in the signin use case, where the POM and test case duplication required would considerably extend the timeline for releasing the React signin feature set.

All options will maintain the same amount of test coverage, however option 1 better assures that requirement changes are universally applied to test cases for React and Backbone.

Option 1a offers the most clarity and efficiency in ensuring best practices and minimizing maintenance costs while moving towards are ideal POM state, but it's lack of focus on the blockers for the React signin rollout risks causing delays due to scope creep.

### Implementation guidelines

- Page models are tied to individual pages, not routes. Instead of a single login POM for all of signin/signup, individual POMs for signin, signinTokenCode, confirmSignupCode, etc. Ex. A first version of this approach has already been created for code-based pages.
- Locators use user-facing indicators (e.g., `getByRole`, `getByText` instead of test id, css classes), with `.or` alternative used when there is a distinct difference between Backbone and React for the same component.
- Test setup and account creation that is Backbone/React agnostic.
- New React tests are only created where there are differences in flows between Backbone and React.

NB - A minimal set of React specific tests is still required while the experiment is active to force the test through the React flow.

## Pros and Cons of the Options

### Option 1: Single set of POMs for React/Backbone, update existing tests

This approach involves phasing out the POMs that were created for Backbone (e.g. `login`) and instead using the POMs created for React across all tests. These new POMs use user-facing locators that are generally agnostic to React/Backbone.

##### Pros

- Only one set of POMs to maintain vs individual POMs for React/Backbone
- Using the most recently created POMs with current best practices
- Less test duplication
- Updating existing tests to work for both React and Backbone might identify bugs (if any) in the converted pages

##### Cons

- Tests converted so far might only be used for the experiment period, then cleaned up once no longer needed
- Adding new tests might still be required if there are flow differences between Backbone and React

#### Option 1a - Update by Page First Approach

Start by updating POMs on a per-page basis to be Backbone/React agnostic, then updating tests that use them.

##### Pros

- Organizes the work on a per-page basis, providing clear boundaries for updates.
- By focusing on updating POMs for individual pages, we can prioritize and tackle updates in a more granular manner. This approach allows for targeted modifications, ensuring that each page's functionality is properly handled.
- Updating POMs page by page minimizes the risk of disrupting dependencies across different pages. This incremental approach reduces the likelihood of introducing regressions and simplifies troubleshooting if issues arise.
- With updates concentrated on specific pages, testing efforts can be more focused and efficient. We can test changes for each page individually, ensuring that the updates meet the required criteria before moving on to the next page.
- As the project progresses, the page-first approach can scale more effectively to accommodate new pages or updates. Each new page can be integrated into the unified POM framework systematically, maintaining consistency across the test suite.

##### Cons

- Working on a page-first basis means we aren't initially targeting the failing tests for the React Signin rollout, might take longer to achieve that initial goal
- Working from a Backbone POM (`login`) that combines multiple pages both signin and signup routes makes it more difficult to see which test will be impacted where generic locators were used (such as a selector for any submmit button)
- Requires running the whole test suite to verify impact of changes

#### Option 1b: Update by Test-First Approach

This approach to unifying the POMs involves organizing the work on a per-test basis, and working from groups of failing tests and updating the corresponding POMs as needed.

##### Pros

- Phased updated prioritizing tests that are failing in React Signin full prod rollout, then updating the remaining tests
- Can isolate test runs to verify fixes (vs needing to run the entire suite to verify the impact of modifying locators and functions)

##### Cons

- The POMs are not updated systematically, but ad hoc based on test needs

### Option 2: Status Quo - Migrate Tests According to [Analysis][2]

Continuing with the status quo approach means continuing to create new, React-specific tests and POMs for React routes, with the expectation that these new tests will be the tests to keep once the rollout is completed. All Backbone POMs and tests would then be skipped and eventually deleted. POMs are not shared between React and Backbone.

With this approach, we need to ensure that Backbone tests are _always_ run unless 1) the feature flag is enabled, AND 2) the route groupe is fully rolled out to production.

#### Pros

- Consistent with approach used so far for reset password and signup
- Could make cleanup easier once Backbone routes are fully decomissioned

#### Cons

- Test failures in Backbone pages require creating new React-specific versions of tests or adding conditions in tests to keep the separation between old tests and new tests
- Newly created tests might only be used for a short period of time
- Requires multiple conditions to support route groups being turned on/off if issues arise in production, especially for tests that combine 2+ route groups
- React and Backbone versions of a tests can have different coverage scopes and requirement definitions over time due to feature development and maintenance. For example the names of many tests have changed over time for precision.

<!-- References -->

[1]: https://docs.google.com/spreadsheets/d/1XWBi24ZJcSqfFX5BXYOrYyatkktVBp6m-YT-MOAI3AQ/edit#gid=0
[2]: https://docs.google.com/spreadsheets/d/11Wq-Y-ipeNFXqLHbr3GJCh_f_qEAG-CUuqBt5Dcnh5k/edit#gid=0
[3]: https://playwright.dev/docs/best-practices
[4]: https://mozilla.github.io/ecosystem-platform/reference/functional-testing
