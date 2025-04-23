# Improving Testing Standards and Experience in the Monorepo

- Status: Proposed
- Deciders: Wil Clouser, Dan Schomburg, Valerie Pomerleau, Barry Chen, Amri Toufali, Vijay Budhram

## Context and Problem Statement

The current testing ecosystem in the FxA is fragmented and inconsistent, leading to unnecessary cognitive overhead, inefficiencies in test execution, and friction in developer experience. Projects across the mono-repo use a mix of testing frameworks—primarily Mocha for legacy code and Jest for newer sub-projects. This inconsistency leads to increased context-switching, duplicated tooling knowledge, and issues when configuring tools like Nx which rely on consistent script naming conventions.

Additionally, while valuable, the functional test suite can consume significant CI resources and any effort to trim it back can help. A number of these tests could be more efficiently executed at the unit or integration test level. And, a [recent discovery][invalid test thread] found that at least one set of tests were running as false positives, not actually testing what we thought they were.

Similarly, the [test result dashboard][test metrics dashboard] that provides insight into metrics like run times and skip rates is partially broken and has not been accurately reporting since late February or early March 2025 on a few metrics. This reduces visibility into test health and performance, and provides a false positive on health.

Finally, documentation for testing _does_ exist, but some of it is outdated and does not include modern practices or guidance on designing tests. There is a lack of centralized best practices for when to use different types of tests (unit, integration, functional), identifying common code smells (e.g., excessive mocking, too many assertions), or how to standardize test structure and execution patterns across sub-projects. The knowledge that does exist lives fragmented in different locations, making onboarding and cross-team collaboration more difficult.

All of these are things that we should probably tackle at some point, but the level of implementation, order, and priority are yet to be understood.

## Decision Drivers

- Reduce time and resource cost of test runs, particularly in CI
- Improve developer experience and maintainability of tests
- Increase reliability and clarity of test results
- Promote consistency in framework usage, naming conventions, and structure
- Establish central documentation and best practices
- Improve ability to debug and diagnose test failures

## Considered Options

Given there are a few parallel ideas in this, we'll break them down individually, just expand each section to checkout more details!

<details>
  <summary>A: Unifying Testing Frameworks</summary>

Options:

1. Migrate All Projects to a Single Framework (Jest)
2. Pilot Migration in Select Projects **👍 Recommended**
3. Maintain Status Quo

#### Details

There is a divide in the test frameworks and how they run across all of the FxA monorepo. The vast majority of tests are split between using `Jest` and `Mocha`, with most new projects having been implemented with `Jest`. Migrating all tests (where possible) to use a single framework gains us some wins outlined below, however this would be a large undertaking, requiring several weeks of work including testing (ha), and cleanup of legacy setup to run `Mocha` or other runner based tests.

#### Pros and Cons of each option

- Migrate All Projects to Single Framework (Jest)
  - **Good**, because it provides interoperability, and framework features are more commonly used.
  - **Good**, because support and documentation are more manageable with a single framework to manage
  - **Good**, because we reduce the number of dependencies for the project overall by removing Mocha and Sinon.
  - **Good**, because we can build a shared set of testing tools, fixtures, and support based on a single tool with usage across the full repo.
  - **Bad**, because it's a massive under taking, and the tests already run today without issue.
  - **Bad**, Don't fix what's not broken
- Pilot (targeted) Migration of Select Projects **👍 Recommended**
  - **Good**, because we gain a concrete understanding of the level of effort to migrate from `mocha` -> `jest`; learnings can be captured should we decide to move other projects
  - **Good**, because we can target high traffic projects where the value would be most felt
  - **Bad**, because we may end up in the same position
- Maintain the Status Quo
  - **Good**, because we don't have to fix what's not borken. Tests are running just fine
  - **Good**, because focus can be kept on additions and new projects
  - **Bad**, because we're just pushing off the other problems
  </details>

<details>
<summary>B: Optimize Functional Tests</summary>

Options:

1. Audit and Refactor for Shift Left **👍 Recommended**
2. Audit and Identify Inaccurate/False Tests
3. Status Quo **👎 Not Recommended**

#### Details

A recent dicovery found that one of our functional tests wasn't actually [testing what we thought it was][invalid test thread]. This lead to discussion about the tests viability and if it would make more sense to split it the functional test into a few different tests at the unit level. This would dramatically speed up the execution, more directly target the functionality (redirect logic and return/retry logic).

It's a good idea to audit functional tests on a regular basis regardless, making sure they're still valid business logic, testing what you expect them to test, and this would give us a chance to find tests that fit a similar bucket, split them apart into unit tests, and speed up test time and coverage. There was a previous [audit][functional test audit] done, and we should revisit this with an eye on what tests can be split up and pushing left, and leveraging more features of Playwright like tagging.

Alternatively, we can just look for the tests that fit the bill, and fix them in place. This wouldn't require as extensive an investment, and would give us more confidence in our functional tests.

#### Pros and Cons of each option

- Audit and Refactor Functional Tests for Shift Left
  - **Good**, because it's necessary to audit functional tests on a semi-regular basis
  - **Good**, because we have the potential to reduce the number of functional tests, reducing the amount of time and CI Resources required to execute them.
  - **Good**, because an audit clarifies which tests act as smoke tests, how valuable they are, and whether their failures point to critical FxA issues.
  - **Good**, because we can test the same, or similar business logic faster in a unit or integration test
  - **Good**, because we also remove implicit assertions from tests. Functional tests may often be intended to test one flow, but implicitly test something else along the way.
  - **Bad**, because a large refactor of that scale can introduce new flakiness and instability in our functional tests.
  - **Bad**, because the tests provide value today, and we can easily miss that value if we are not diligent in the process and application of new patterns.
- Audit and Identify Inaccurate/False Tests
  - **Good**, because we would find tests that are giving potential false positives (or negatives)
  - **Good**, because we could remove tests that are no longer valid.
  - **Bad**, because we would still have tests that are long running, testing multiple functionalities instead of being focused. Functional tests are built step on top of step, and a failure early on in a test may not indicate a failure of the thing _being_ tested.
  </details>

<details>
<summary>C: Fixing Testing Dashboard</summary>

Options:

1. This is kind of a no-brainer, we need to fix it. [Bug ticket here][dashboard bug ticket]

However, to expand on this, we should consider a more robust process for review and triage of the [Test Metrics dashboard][test metrics dashboard], baking it into our greater development process. There is an opportunity to push towards improving some metrics, such as lowering skip counts, understanding spikes in execution times, lowering retry rates for functional tests, etc.

The dashboard has an opportunity to push metrics about test health into the limelight.

</details>

<details>
<summary>D: Update and Expand Central Test Documentation</summary>

Options:

1. Revise and Extend Existing Docs **👍 Recommended**
2. Minimal Edits for Accuracy

#### Details

We have most documentation around testing in the [developer docs], however test references and patterns are spread about throughout the docs, and we're missing guidance on how to write good tests. As a result, most patterns of testing come down to personal preference, or who is doing a code review. We try to stick to patterns but it can always vary.

Additionally, documentation around _what_ testing exists is spread around and may be difficult to find. It's okay to have them spread and closer to the thing they should be, but also linking test documentation back to a single source could make them easier to find and identify areas that we're missing.

At a minimum however, the documentation we do have may be out of date, or include reference we have not fully adopted, for example the [Test Strategy][test strategy] document. We should review all test related documents, update references and links, and if there are things yet to be fully adopted we should

#### Pros and Cons of each option

- Revise and Extend Existing Docs
  - **Good**, because we get a single "home" for testing in FxA
  - **Good**, because participating in testing, be that unit, integration, or functional, becomes easier when there is guidance on how to add and update tests
  - **Good**, because we also get a place for best practices and patterns, such as how to identify code-smell when making tests or avoiding too many assertions per test
  - **Bad**, because it could be come tedious to manage references and keeping testing documentation in sync with latest patterns
  - **Bad**, because this might be too "strict" and put too many guard rails on testing implementation.
- Minimal Edits for Accuracy
  - **Good**, because it's less invasive and focuses on bring any test documentation up to date
  - **Good**, because it would take _far_ less time and gives us a jumping point to improve patterns and documentation long term
  - **Bad**, because we might never combe back to it
  </details>

## Decision Outcome

The following improvements are recommended to enhance the consistency, reliability, and maintainability of testing across the monorepo:

A. Unify Testing Frameworks

      Decision: Proceed with a pilot migration of one or two high-traffic sub-projects to move from Mocha to Jest. Alternatively, we could tackle low-traffic projects, non-mocha test suites, or projects with a small test suite to assess level of effort.

      As of 4/16/25, checking the last `500` commits, these are the highest traffic (commit counts) projects in `packages`
      Commits  Subfolder
      -------  ---------
           69  fxa-auth-server      <- Candidate one
           66  fxa-settings         <- Already using Jest
           25  fxa-content-server   <- Candidate two, only server-side tests
           24  functional-tests     <- Playwright, cannot be migrated
           23  fxa-shared           <- Next Candidate
           12  fxa-admin-server
           11  fxa-graphql-api
           10  fxa-react
            7  fxa-event-broker
            7  fxa-customs-server   <- This is another candidate because it uses Tap, not Mocha or jest
            7  fxa-auth-client
            7  fxa-admin-panel
            6  fxa-payments-server
            4  db-migrations
            3  fxa-geodb
            2  fxa-profile-server
            2  fortress
            2  123done
            1  browserid-verifier

      This phased approach allows us to assess the return on investment and uncover potential migration challenges before making a larger commitment.

B. Optimize Functional Tests

      Decision: Audit and refactor long-running or flaky Playwright tests with a focus on shift-left. Tests are pushed to appropriate packages if they can be split into unit or integration tests.

      This will improve test execution time, reduce CI resource usage, and ensure test intent is aligned with the right level of abstraction.

C. Fix Testing Dashboard

      Decision: Fix the broken dashboard functionality and improve stability. Push an emphasis on alerting from the dashboard to fit into standard alerting/triage workflow.

      Test metrics can offer actionable insights into health trends, flakiness, skip counts, and CI performance over time.

D. Update and Expand Central Test Documentation

      Decision: Review, update, and consolidate test documentation, placing emphasis on best practices for test authoring and guidance for different test types.

      Documentation should also include reference patterns, CI tagging conventions, and serve as a discoverable entry point for developers across the monorepo.

These changes are intended to be incremental and collaborative, enabling the FxA team to adopt improvements in a way that aligns with our velocity.

Order of operations recommendations. All of these are valuable, and recommending one over another is objectively difficult. However, if we omit any consideration of LOE, the approach to priority is around what's broken vs. not and what sets us up for success with the others. Today, tests _are_ running, so making large sweeping changes, especially without a clear view into how those changes impact the overall test and quality health of FxA is not recommended. Additionally, we can foxfood by establishing patterns and best practices before making sweeping changes to tests.

As such, the suggested order is; **C** Fix Testing Dashboard, **D** Update and Expand Central Test Documentation, **A** Unify Testing Frameworks, **B** Optimize Functional Tests.

Statuses:

- **👍 Recommended**
- **👎 Not Recommended**
- **🧪 Experiment**

Links:

- [Test Metrics Dashboard][test metrics dashboard]
- [Dashboard bug ticket][dashboard bug ticket]
- [Github thread on invalid functional test][invalid test thread]
- [Test Strategy][test strategy]
- [Functional Test Audit][functional test audit]
- Test related [developer docs][developer docs]
  - [Tests in CircleCi][tests in circleci]
  - [Functional and Manual A/B Testing][functional and manual ab testing]
  - [Testing Emails][testing emails]
  - [Testing Coupons][testing coupons]
  - [Local Testing Setup][testing local setup]

[test metrics dashboard]: https://mozilla.cloud.looker.com/dashboards/1982
[dashboard bug ticket]: https://mozilla-hub.atlassian.net/browse/FXA-11519
[invalid test thread]: https://github.com/mozilla/fxa/pull/18662#discussion_r2031621069

<!-- links to testing related developer docs -->

[developer docs]: https://mozilla.github.io/ecosystem-platform/
[tests in circleci]: https://mozilla.github.io/ecosystem-platform/reference/tests-in-circleci
[functional and manual ab testing]: https://mozilla.github.io/ecosystem-platform/reference/experiments-ab-testing#functional-and-manual-testing
[testing emails]: https://mozilla.github.io/ecosystem-platform/reference/emails#tests
[testing coupons]: https://mozilla.github.io/ecosystem-platform/relying-parties/reference/sub-plat-coupons#testing-coupons
[testing local setup]: https://mozilla.github.io/ecosystem-platform/tutorials/development-setup#testing

<!-- There are many more... -->
<!-- end -->

[test strategy]: https://docs.google.com/document/d/1gYvGpXtLkSA84ELKJA-3tOPtlRlgcIQwmVOKbirtII0/
[functional test audit]: https://docs.google.com/spreadsheets/d/11Wq-Y-ipeNFXqLHbr3GJCh_f_qEAG-CUuqBt5Dcnh5k/edit?gid=0#gid=0
