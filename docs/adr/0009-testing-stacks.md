# Consistency in testing tools

- Deciders: Les Orchard, attendees of testing discussion at Berlin All-Hands 2020
- Date: 2020-02-04

## Context and Problem Statement

We have a variety in tools used for unit & functional tests. This variety means developers need to learn & know many different tools. It would be nice to reduce this mental workload, while still using appropriate tools for testing.

## Decision Drivers

- Ensuring we're using the right tool for the job.
- Reducing developer mental workload for working with tests.

## Considered Options

- Convert all tests to use a single consistent stack of testing tools
- Accept ad-hoc testing stacks to be chosen as needed
- Identify a consistent stack of testing tools per aspect of the project

## Decision Outcome

Identify a consistent stack of testing tools per aspect of the project

## Pros and Cons of the Options

### Convert all tests to use a single consistent stack of testing tools

Many of our tests use some arrangement of [Mocha][], [Chai][], and [Sinon][] as a stack. We should just use that everywhere without variation.

- Pros
  - Developers only need to learn one stack to work with tests throughout the project
- Cons
  - Since we already have a variety of testing stacks, we'd need to rewrite a significant number of tests to assert consistency

### Accept ad-hoc testing stacks to be chosen as needed

Different services & apps in FxA could benefit from different ways of testing. Let's just pick whatever works on an ad-hoc basis.

- Pros
  - Developers can choose whatever testing stack seems to make sense for the current task
- Cons
  - Further variation of testing stacks over time, requiring more effort to learn how to work with tests in any given spot of the project.

### Identify a consistent stack of testing tools per aspect of the project

For React apps, we use [Jest][] and [React Testing Library][]. This is the stack that comes out of the box with [Create React App][], which makes it kind of a de facto standard for React.

All of our tests for microservices use some arrangement of [Mocha][], [Chai][], and [Sinon][] as a stack. We should keep doing that for future services.

Functional tests run against fxa-content-server use [Intern][] & [Selenium][]. These tests are mature and wouldn't really benefit from rewriting.

Future functional tests _might_ benefit from being written with a newer stack using Selenium or some other browser-automation tool (to be determined).

- Pros
  - Although there's more than one set of testing tools, we can minimize the variation.
- Cons
  - Developers still need to be aware of more than one set of testing tools.

[jest]: https://jestjs.io/
[react testing library]: https://testing-library.com/docs/react-testing-library/intro
[create react app]: https://github.com/facebook/create-react-app
[mocha]: https://mochajs.org/
[chai]: https://www.chaijs.com/
[sinon]: https://sinonjs.org/
[intern]: https://theintern.io/
[selenium]: https://selenium.dev/
