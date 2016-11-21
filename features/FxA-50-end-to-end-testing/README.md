# FxA-50 End-to-end testing

> https://github.com/mozilla/fxa-features/issues/50

## Problem Summary

Currently we do not have enough end-to-end testing to make sure that changes to
Firefox Accounts or Firefox Sync do not break the basic features of those
services.

****

## Outcomes

Have daily end-to-end tests running against Nightly that validate that
Sync and FxA work well together.

## Hypothesis

We believe if we create a CI service that will run a set of tests against
the latest build of Firefox Nightly then we will improve test coverage and
quality of testing of our services.

****

## Detailed design

The test scripts that will run on Circle CI will be using the existing
automation tools (`firefox-ui-functional`). We would add additional tests
to existing Firefox functional tests and run the new set of tests in our
own environment.

First few tests to validate this would be signing up and signing into FxA and
would make sure the browser is able to properly connect to Firefox Sync.  

### Phase 1

* [ ] Automated testing every day with Firefox Nightly Release
* [ ] A single test that logs into sync and verifies that it is working
* [ ] Test that the device manager lists the new device

### Phase 2

* [ ] Add OAuth client testing
* [ ] Sync'd tabs testing

### Phase 3

* [ ] Explore the testing of Android / iOS clients
