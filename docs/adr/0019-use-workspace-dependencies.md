# Use workspace dependencies in package.json

- Deciders: Danny Coates
- Date: 2020-05-27

## Context and Problem Statement

Since becoming a monorepo we haven't found a way to share code across packages that works well in local development, CI, and production without fragile, ad-hoc workarounds.

## Decision Drivers

- Simpler code sharing
- Minimal overhead in setup and deployment
- Works well for js and ts packages
- Low maintenance
- Long term viability

## Decision Outcome

The [workspace:\*](https://yarnpkg.com/features/workspaces) dependency type along with typescript [project references](https://www.typescriptlang.org/docs/handbook/project-references.html) provide a good internal dependency solution that addresses the shortcomings of our current situation.

Workspaces are not yet supported by npm but are on the [v7 roadmap](https://blog.npmjs.org/post/617484925547986944/npm-v7-series-introduction) so it's pretty safe to assume that they will be widely supported for the foreseeable future. In order to start using workspaces today we'll need to use yarn. This is a slight risk because although it is well supported it doesn't have the level of backing that npm does, however once workspaces are supported by npm there is nothing locking us in to yarn.

### Advantages

- No manual linking of dependencies
- Simpler builds
- Single lock file
- Hoisted dependencies

### Disadvantages

- In the short term this requires us to switch from npm to yarn as our package manager. This will change dev workflows and is another tool to understand.
- Some code changes are required to be compatible with yarn, however they're also backward compatible with npm.
- Yarn doesn't currently support auditing dependencies like npm does.

## Background

We've used a mix of the following strategies up to now. Each has some disadvantages that this change is striving to address.

#### Using "long" relative paths

The advantage of this approach is that it doesn't require any linking and doesn't disturb package-locks. It works ok when packages are plain js and have no build steps but requires dependencies to be carefully copied in production build steps. More and more of our code does require a build step, so now we need to orchestrate the build somehow to ensure packages get built in the correct order. This is difficult when the relations between packages are implicit and not declarative. This implementation includes various additions to package.json scripts that are difficult to maintain and keep correct in both local dev and production builds.

#### Using lerna and 'file' dependencies

[Lerna](https://github.com/lerna/lerna) is meant to handle versioning for monorepos. As a task runner it works fine for us but it's primarily designed for managing a set of packages that get published to a package registry like npm. By default lerna has no simple way to have dependencies on unpublished packages. The [file:](https://docs.npmjs.com/configuring-npm/package-json.html#local-paths) dependency type allows local dependencies to be declared but causes problems with package-locks. Using file dependencies breaks regular `npm ci` within package directories because of bugs in npm. It's difficult to maintain the package-lock once a file dependency has been added, usually requiring the lock to be deleted and recreated for any updates. It is not a viable long term solution.

#### Using published dependencies

Some of our packages were public before the monorepo. This led to occasional versioning confusion in the past and requires an awkward workflow when making a change that updates both a dependency and dependent package. We could publish all packages and use lerna as designed, however this is not desirable because we'd only be using it as a workaround for current lerna limitations. Publishing packages for no other reason would be confusing to others and a waste of resources.
