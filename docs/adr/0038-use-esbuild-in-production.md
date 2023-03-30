# Use esbuild for production builds

- Status: TBD
- Deciders: Ben Bangert, Wil Clouser, Dan Schomburg, Barry Chen, Julian Poyourow, Lauren Zugai, Vijay Budhram
- Date: 2023-03-29

## Context and Problem Statement

We currently use esbuild throughout the code base for running tests and starting up local development servers.
This has proven to be much faster and better for developer experience than compiling with typescript.

We do not, however, use esbuild in production. This means we compile our code using tsc just prior to deployment.
This is slow when compared to using esbuild, and often results in last minute typescript errors being encountered
on deployment.

## Decision Drivers

- Faster deployments
- Better parity between test/development and production
- Ability to retain type checking
- Ability to catch typescript errors early

## Considered Options

- A: Switch to using esbuild in production and add CI job for type checking
- B: Continue using esbuild for dev/test and tsc for production
- C: Switch everything over to tsc

## Decision Outcome

After a decent amount of discussion, we have decided to switch over to esbuild for our production builds. Other
teams have made the switch and not encountered major issues.

We will still use tsc, but do so in a separate CI job. This job is only responsible for running typescript compilation,
and can be run in parallel with other build operations.

By combining these two approaches we get the best of both worlds. We retain type safety, catch typescript errors sooner
rather than later, and have speedier builds that are closely with what we put under test.

## Pros and Cons of the Options

### A: Switch to using esbuild in production and add CI job for type checking

- Good, because it makes deployments faster
- Good, because it is similar to how we test and develop
- Good, because we can retain type safety by using a separate, preliminary CI job
- Good, because other teams have made this switch and viewed it as positive
- Bad, because esbuild is still on v0 and breaking changes could be introduced to the project

### B: Continue using esbuild for dev/test and tsc for production

- Good, because we do not have to change anything
- Good, because we are not using a v0 in production
- Bad, because we would continue to encounter problems late in the deployment process
- Bad, because our deployments would continue to slow

### C: Switch everything over to tsc

- Good, because we are not relying on something that is still a v0
- Bad, because it does not speed up deployments
- Bad, because it makes testing slower
- Bad, because it makes local development slower
- Bad, because we'd have to make a bunch of changes to our npm scripts
