# FxA-108: update dependencies in FxA projects

> https://github.com/mozilla/fxa-features/issues/17

## Problem Summary

This feature milestone deals with the following problems:

* Problem 1: Outdated node modules in FxA code repositories.
* Problem 2: Outdated version of node.js.
* Problem 3: Late response to security issues reported by NSP (Node Security Project).
* Problem 4: Some repositories are not covered by the NSP scanner.

****

## Outcomes

Success criteria to fix the problems listed in the problem summary:

* Update to latest major versions of core server dependencies.
* Production stack running with node 4. Migrated from node 0.10.
* Being able to receive notifications latest security alerts within a day of a reported issue for all FxA node.js-based repositories.

## Hypothesis

For problems [3] and [4]:

We believe that building a nightly reporter based on a CI service
for FxA developers will help react to NSP alerts and dependency changes in a more efficient manner.

We will know this is true when we see a more effective response to security alerts.

****

## Detailed design

To solve problem [1]:

Identify changes in latest versions of published modules and make the required changes.

To solve problem [2]:

Work with the DevOPS team to resolve any node 4 issues in staging and production stacks.

To solve problems [3] and [4]:

A script running against a [nightly build setup of Circle CI](https://circleci.com/docs/nightly-builds/)
will be able to report outdated modules for several repositories.
In addition it would forward NSP alerts to Sentry that can provide a visualization of affected repositories and
alert developers using email.
