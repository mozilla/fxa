# Improving Testing Standards and Experience in the Monorepo

- Status: proposed
- Deciders:

## Context and Problem Statement

The current testing ecosystem in the FxA is fragmented and inconsistent, leading to unnecessary cognitive overhead, inefficiencies in test execution, and friction in developer experience. Projects across the mono-repo use a mix of testing frameworks—primarily Mocha for legacy code and Jest for newer sub-projects. This inconsistency leads to increased context-switching, duplicated tooling knowledge, and issues when configuring tools like Nx which rely on consistent script naming conventions.

Additionally, the functional test suite, while valuable, consumes significant CI resources. A number of these tests could be more efficiently executed at the unit or integration test level. And, a recent discovery indicated at least one set of tests were running as false positives, not actually testing what we thought they were ⚠️ Need to find link to PR and ticket ⚠️

Similarily, the [test result dashboard][test results dashboard] that provides insight into metrics like run times and skip rates is partially broken and has not been accurately reporting since late February or early March on a few metrics. This reduces visibility into test health and performance, and provides a false positive on health.

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
2. Pilot Migration in Select Projects
3. Maintain Status Quo

#### Details

_further details on each option, explaining the idea/approach_

#### Pros and Cons of each option

- Migrate All Projects to Single Framework (Jest)
  - **Good**, because it provides interportability, and framework features are more commonly used.
  - **Good**, because support and documentation are more managable with a single framework to manage
  - **Good**, because we reduce the number of dependnencies for the project overall by removing Mocha and Sinon.
  - **Good**, because we can build a shared set of testing tools, fixtures, and support based on a single tool with usage across the full repo.
  - **Bad**, because it's a massive under taking, and the tests already run today without issue.
  - **Bad**, Don't fix what's not broken
- Pilot (targeted) Migration of Select Projects
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

1. Audit and Refactor for Shift Left
2. Audit and Identify Inaccurate/False Tests
3. Status Quo

#### Details

A recent dicovery found that one of our functional tests wasn't actually [testing what we thought it was][invalid test thread]. This lead to discussion about the tests viability and if it would make more sense to split it the functional test into a few different tests at the unit level. This would dramatically speed up the execution, more directly target the functionality (redirect logic and return/retry logic).

It's a good idea to audit functional tests on a regular basis regardless, making sure they're still valid business logic, testing what you expect them to test, and this would give us a chance to find tests that fit a similar bucket, split them apart into unit tests, and speed up test time and coverage.

Alternatively, we can just look for the tests that fit the bill, and fix them in place. This wouldn't require as extensive an investement, and would give us more confidence in our functional tests.

#### Pros and Cons of each option

- Audit and Refactor Functional Tests for Shift Left
  - **Good**, becuase it's necessary to audit functional tests on a semi-regular basis
  - **Good**, because we have the potential to reduce the number of functional tests, reducing the amount of time and CI Resources required to execute them.
  - **Good**, because we can test the same, or similar business logic faster in a unit or integration test
  - **Good**, because we also remove implicit assertions from tests. Functional tests may often test one flow, but implicitly test something along the way
  - **Good**, because it provides room to build functional tests against business flows (and map out the business flows) - not to self, need to figure out how to better explain this. There's been mention that Accounts operates as a "state machine" with the flows, but we don't appear to have documentation on those flows
  - **Bad**, because a large refactor of that scale can introduce new flakyness and instability in our functional tests.
  - **Bad**, because the tests provide value today, and we can easily miss that value if we are not diligent in the process and application of new patterns.
- Audit and Identify Inaccurate/False Tests
  - **Good**, because we would find tests that are giving potential false positives (or negitives)
  - **Bad**, because it would cause this problem
  </details>

<details>
<summary>C: Fixing Testing Dashboard</summary>

1.  Fix Existing Dashboard

        - Investigate and repair broken dashboards and data sources.
        - Resume tracking key metrics like run time, skip rates, and failures.
        - Start in depth review each week with the team, checking each metric for annomolies or deviations

2.  Deprioritize (_not_ recommended)

            - Accept the lack of visibility as non-critical and continue without it.

    </details>

<details>
<summary>D: Update and Expand Central Test Documentation</summary>
asdf

1.  Revise and Extend Existing Docs

        Update the existing documentation with modern practices.
          - Include guidance on:
            - Functional vs. integration vs. unit tests.
            - Patterns for writing effective and reliable tests.
            - Code smells to watch for (e.g., excessive mocking).
            - Limits on test assertions.
            - Debugging tips and Nx script conventions.
          - Create a dedicated testing documentation hub that links to all test types and tools in the monorepo.
            - Treat it as a living document for standards and test authoring.

2.  Minimal Edits Only

            Make small updates to current docs, without major restructuring or best-practice guidance.
              - Fix references to dead links,

    </details>

[test results dashboard]: https://mozilla.cloud.looker.com/dashboards/1982
[invalid test thread]: https://github.com/mozilla/fxa/pull/18662#discussion_r2031621069
