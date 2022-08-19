# Contribution Guidelines for Firefox Accounts

Anyone is welcome to help with Firefox Accounts, but it's important to
recognize that Firefox Accounts is a complex tool written by Mozilla and used
solely within Mozilla or by parties tightly coupled to Mozilla. The team's
goal is focused on serving Mozilla's requirements -- not being easy to set up
or easily usable in other scenarios.

In order to scale effectively, we may use technologies which have significant
barriers to entry (eg. cost or expertise).

If you're filing bugs, working on documentation, or helping reproduce a
problem, thank you for your help and please read below for guidelines.

If you want to write code, and you are not an experienced programmer you will
probably be more successful [looking for other projects at
Mozilla](https://whatcanidoformozilla.org) to contribute to. The Firefox
Accounts team is happy to support open source contributions but we have limited
time to assist in getting the FxA codebase up and running on other platforms.

We use the standard `help wanted` and `good first issue` labels on GitHub to
help identify bugs for contributors to work on.

To get in touch with us and other community members:

- Matrix: [#fxa:mozilla.org](https://chat.mozilla.org/#/room/#fxa:mozilla.org)
- Mailing list: <https://mail.mozilla.org/listinfo/dev-fxacct>
- and of course, [the issues list](https://github.com/mozilla/fxa/issues)

UPDATE: On March 2020, Mozilla moved from IRC to Matrix. For more information on Matrix, check out the following wiki article: <https://wiki.mozilla.org/Matrix>.

## Code of Conduct

You must agree to abide by the [Mozilla Community Participation Guidelines](https://www.mozilla.org/about/governance/policies/participation/)

## Bug Reports

You can [file issues on GitHub](https://github.com/mozilla/fxa/issues/new). Please try to include as much information as you can and under what conditions
you saw the issue.

## Development Process

[Read about our development process](https://mozilla.github.io/ecosystem-platform/reference/team-processes/development-process)

## Sending Pull Requests

Patches should be submitted as pull requests (PR).

Before submitting a PR:

- Your code must run and pass all the automated tests before you submit your PR for review. "Work in progress" pull requests are allowed to be submitted, but should be opened as a `draft` and should not be merged until all tests pass and the code has been reviewed.
- Your patch should include new tests that cover your changes. It is your and your reviewer's responsibility to ensure your patch includes adequate tests.
- Your patch must be [GPG signed](https://help.github.com/articles/managing-commit-signature-verification) to ensure the commits come from a trusted source.

When submitting a PR:

- You agree to and have the legal right to license your code under the project's [license](/LICENSE).
- Base your branch off the current `main`.
- Add both your code and new tests if relevant.
- Run `grunt lint` and `npm test` to make sure your code passes linting and tests.
- Please do not include merge commits in pull requests; include only commits with the new relevant code.
- Your commit message must follow the
  [commit guidelines](https://github.com/mozilla/fxa/blob/main/CONTRIBUTING.md#git-commit-guidelines).
- To skip CI tests add the "🙈 skip ci" github label to the PR.
  - You can skip only specific packages by also adding the corresponding "fxa-" label, for example "fxa-content-server".
- Be aware that a member of the FxA team will need to open a separate PR for CI
  to run properly.

See the main [README.md](/README.md) for information on prerequisites, installing, running and testing.

## Code Review

This project is production Mozilla code and subject to our [engineering practices and quality standards](https://developer.mozilla.org/docs/Mozilla/Developer_guide/Committing_Rules_and_Responsibilities). Every patch must be peer reviewed. This project is part of the [Firefox Accounts module](https://wiki.mozilla.org/Modules/Other#Firefox_Accounts), and your patch must be reviewed by one of the listed module owners or peers.

## Git Commit Guidelines

We loosely follow the [Angular commit guidelines](https://github.com/angular/angular.js/blob/master/CONTRIBUTING.md#type) of `<type>(<scope>): <subject>` where `type` must be one of:

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that do not affect the meaning of the code (white-space, formatting, missing
  semi-colons, etc)
- **refactor**: A code change that neither fixes a bug or adds a feature
- **perf**: A code change that improves performance
- **test**: Adding missing tests
- **chore**: Changes to the build process or auxiliary tools and libraries such as documentation
  generation

### Scope

The scope could be anything specifying place of the commit change. For example `oauth`,
`fxa-client`, `signup`, `l10n` etc...

### Subject

The subject contains succinct description of the change:

- use the imperative, present tense: "change" not "changed" nor "changes"
- don't capitalize first letter
- no dot (.) at the end

### Body

The body should describe the purpose of the commit, so that it's clear why this change is being
made. To assist in writing this along with the footer, a git commit template (saved as `~/.gitmessage`)
can be used:

```text
feat: SUBJECT LINE
Because:

*

This commit:

*

Closes #
```

After creating `~/.gitmessage`, update git to use the template with the following:

```
git config --global commit.template ~/.gitmessage
```

A text editor will open with the template any time `git commit` is run without the `-m` flag.

Just as in the **subject**, use the imperative, present tense: "change" not "changed" nor "changes". Commits
are expected to follow this format.

### Footer

The footer should contain any information about **Breaking Changes** and is also the place to
reference GitHub issues that this commit **Closes**. In order to maintain a reference to the context of the commit, add
`fixes #<issue_number>` if it closes a related issue or `issue #<issue_number>`
if it's a partial fix.

## How to keep your fork in sync with the latest changes?

Once your PR is merged, it's recommended to pull new changes from `main` (which will also include the one that you made).
So for that purpose, specify a new remote `upstream` which will be pointing to the actual [mozilla/fxa](https://github.com/mozilla/fxa) repo.

```sh
git remote add upstream https://github.com/mozilla/fxa.git
```

To sync your local copy of the fork with the `upstream` changes, run the following commands:

```sh
git fetch upstream

git checkout main

git merge upstream/main
```

Great, now the local copy of the repo is up-to-date. But your fork on Github won’t be updated until you push to it, so go ahead and run:

```sh
git push origin main
```

For more info, see [Github Help: Syncing a Fork](https://docs.github.com/en/github/collaborating-with-issues-and-pull-requests/syncing-a-fork).

## Servers

- **stage** - https://accounts.stage.mozaws.net/
- **production** - https://accounts.firefox.com/

## Dependencies and Tools

### yarn

We use [yarn](https://yarnpkg.com/) to manage dependencies. Required components are [automatically
installed](https://github.com/mozilla/fxa/blob/main/package.json#L6) when you install this project.

### L10N

To contribute translations visit [Pontoon](https://pontoon.mozilla.org/).

Use the `FXA_L10N_SHA` to pin L10N files to certain Git SHA. If not set then the `master` branch SHA will be used.
