# Use existing InternJS for functional testing in settings v2

- Deciders: Vijay Budhram, Jody Heavener, Lauren Zugai
- Date: 2020-07-17

## Context and Problem Statement

For over the past 5 years (at least), we have been using [InternJS](https://github.com/theintern/intern) for our functional tests in the content-server. While this has worked well and caught several bugs, we should reevaluate it since we are migrating to react and have an opportunityto use newer/faster/better supported testing frameworks.

## Decision Drivers

- Ease of writing tests
- Good community support
- Learning curve of settings V2 development

## Decision Outcome

Use InternJS for functional testing in the settings v2 app, but also update the tests to support async/await. The biggest factor was not having to introduce another testing framework for developers to learn.

## Considered Options

- Option A - Use InternJS and update to async/await
- Option B - Use [NightmareJS]()
- Option C - Use [WebDriverIO](https://webdriver.io/)

## Pros and Cons of the Options

### Option A - Use InternJS and update to async/await

Pros:

- Active community
- Can reuse the testing patterns from content-server
- Lots of examples and helper functions to help write tests
- Developers won't have to context switch with testing frameworks

Cons:

- Still requires a learning curve to understand how things work and are structured
- It's kind of clunky, would be a lot of effort to go refactor all tests to async/await and could be better to just rewrite them with another library
- It's an older framework, a newer framework may offer greater support and features
- Our tests are a little flaky, can another framework help mitigate false failures from CI?

### Option B - Use NightmareJS

Pros:

- Claims to be 2x faster than PhantomJS

Cons:

- Developers/QA will have to learn a new testing framework on top of all the other new frameworks introduced
- Is chromium based

### Option C - Use WebDriverIO

Pros:

- Active community
- Used by other Mozilla services
- Simple API
- Solid documentation

Cons:

- Developers/QA will have to learn a new testing framework on top of all the other new frameworks introduced
