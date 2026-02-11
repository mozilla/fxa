# Use nx for monorepo tooling

- Status: accepted
- Deciders: Ben Bangert, Wil Clouser, Dan Schomburg, Barry Chen
- Date: 2023-03-13
- Obsoletes: 0019-use-workspace-dependencies

## Context and Problem Statement

Our monorepo using a yarn workspace model has a few limitations we've experienced such as slow builds, complex bash scripts for running tasks, having to make each new library or component as its own package with its own dependencies, and an inflexible structure for refactoring our shared libraries. Each of the packages originally was setup with its own tooling and separate build processes with little standardization increasing the maintenance cost.

Monorepo tooling has progressed since the prior ADR on using workspace dependencies with yarn and we'd like to take advantage of these improvements.

## Decision Drivers

- Faster builds with dependency structure analysis and build caching.
- Easy to migrate into without large changes to our existing setup.
- Tooling built for monorepo needs.
- Task running, caching, and dependency handling for breaking down bash scripts and npm commands into simpler, cacheable tasks.
- Easy to create/share/move library/app code for re-use and encapsulation.
- Consistent tooling and structure via scaffolding for new libraries and applications.

## Considered Options

- A. nx
- B. Turborepo

## Decision Outcome

Chosen option: A. nx. Both options provide powerful build capabilities with similar caching options. nx is a little ahead on additional monorepo tooling that would benefit some of our upcoming work. nx supports two models of monorepo, a package-based approach (what FxA current is built with), and an integrated approach that utilizes TypeScript paths for splitting out and re-organizing code into a directory hierarchy. This allows it to work almost as-is with our existing monorepo. We can then integrate/refactor existing code into smaller code bundles within a `libs/` directory that are easier to work with than our existing `fxa-shared` package.

## Pros and Cons of the Options

### A. nx

- Good, because it has caching and dependency management of tasks for fast builds and splitting up yarn/bash commands.
- Good, because its package-based approach works as-is on our monorepo with yarn workspaces.
- Good, because its integrated libraries can be used in our existing packages with minimal changes.
- Good, because its well supported with good documentation and commercial support available.
- Good, because it has commands to move/delete/add libraries and update references automatically.
- Good, because it has generators to streamline new library/application creation for consistency.
- Good, because it has distributed caching via a paid cloud service available.
- Bad, because its a new tool to learn for builds.
- Bad, because the distributed caching service is paid-for only.

### B. Turborepo

- Good, because it has caching of tasks for fast builds.
- Good, because its well supported with good documentation and commercial support available.
- Good, because it has remote caching available, both paid and self-hosted.
- Bad, because its a new tool to learn for builds.
- Bad, because its solely a package-based approach which is more time consuming for organizing libraries and components.
