# Contribution Guidelines for Mozilla Accounts

Anyone is welcome to help with Mozilla Accounts (formerly Firefox Accounts,
still abbreviated FxA), but it's important to recognize that FxA is a complex
service written by Mozilla and used solely within Mozilla or by parties tightly
coupled to Mozilla. The team's goal is focused on serving Mozilla's
requirements -- not being easy to set up or easily usable in other scenarios.

In order to scale effectively, we may use technologies which have significant
barriers to entry (e.g., cost or expertise).

If you're filing bugs, working on documentation, or helping reproduce a
problem, thank you for your help and please read below for guidelines.

If you want to write code, and you are not an experienced programmer you will
probably be more successful [looking for other projects at
Mozilla](https://codetribute.mozilla.org/) to contribute to. The FxA team is
happy to support open source contributions but we have limited time to assist
in getting the FxA codebase up and running on other platforms.

## Code of Conduct

You must agree to abide by the [Mozilla Community Participation Guidelines](https://www.mozilla.org/about/governance/policies/participation/). See [CODE_OF_CONDUCT.md](/CODE_OF_CONDUCT.md).

## Bug Reports

You can [file issues on GitHub](https://github.com/mozilla/fxa/issues/new/choose). Please include as much information as you can and the conditions under which you saw the issue.

Do not file security vulnerabilities as public issues. Follow [SECURITY.md](/SECURITY.md) instead.

## Communication

GitHub issues and pull requests are the place to ask questions and discuss changes. Keep the discussion on the issue or PR it belongs to.

Do not @-mention or request reviews from individual Mozilla staff. [CODEOWNERS](/.github/CODEOWNERS) requests the right reviewers automatically, and the team watches new issues and PRs.

## Development Process

1. **Start from an issue.** Find or file one before writing code, so the team can confirm the change is wanted and agree on the approach. Issues filed on GitHub are mirrored to the team's Jira project.
2. **Set up your environment.** Follow the [development setup tutorial](https://mozilla.github.io/ecosystem-platform/tutorials/development-setup).
3. **Work from a fork.** [Fork `mozilla/fxa`](https://github.com/mozilla/fxa/fork) and create a branch from the current `main`. See [Keeping your fork in sync](#keeping-your-fork-in-sync).
4. **Open a pull request from your fork.** Fill in the [pull request template](/.github/PULL_REQUEST_TEMPLATE.md). Open it as a draft until it is ready for review.
5. **Wait for CI.** Tests do not run on PRs from forks. A team member mirrors your PR to a branch in `mozilla/fxa` to run them.
6. **Get it reviewed and merged.** See [Code Review](#code-review). A team member merges the PR once it is approved and CI passes. Merged changes ship in a later scheduled release.

## Sending Pull Requests

Patches should be submitted as pull requests (PR).

Before submitting a PR:

- Your code must run and pass all the automated tests. Open work in progress as a **draft** PR. It is not merged until all tests pass and the code has been reviewed.
- Your patch should include new tests that cover your changes. It is your and your reviewer's responsibility to ensure your patch includes adequate tests.
- Your commits must be [signed](https://docs.github.com/en/authentication/managing-commit-signature-verification) (GPG or SSH) to ensure they come from a trusted source.
- If you used AI tools to write any of the code, you must have reviewed all of it yourself.

When submitting a PR:

- You agree to and have the legal right to license your code under the project's [license](/LICENSE).
- Lint and test the packages you changed. This repo uses [Nx](https://nx.dev/):

  ```sh
  npx nx lint <project>
  npx nx test-unit <project>
  npx nx test-integration <project>
  ```

  Available targets vary by project; check its `project.json` and `package.json`.

- Do not include merge commits in pull requests. Rebase onto `main` instead.
- Your commit messages must follow the [commit guidelines](#git-commit-guidelines).
- PRs with no activity for 60 days are marked stale and closed 7 days later.

## Code Review

This project is production Mozilla code. Every patch must be reviewed and approved by a member of the FxA team before it is merged. Reviewers are assigned through [CODEOWNERS](/.github/CODEOWNERS).

Reviewers look for:

- Tests that cover the change.
- Security and privacy impact, since this code handles authentication, payments and user data.
- Consistency with existing patterns in the monorepo, and reuse of existing helpers.

Respond to each review comment, either with a change or an explanation.

## Git Commit Guidelines

Save this template as `~/.gitmessage`:

```text
type(scope): subject

Because:

*

This commit:

*

Closes #FXA-
```

Then tell git to use it:

```sh
git config --global commit.template ~/.gitmessage
```

A text editor will open with the template any time `git commit` is run without the `-m` flag.

### Subject

The subject line uses the format `<type>(<scope>): <subject>`, where `type` must be one of:

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that do not affect the meaning of the code (white-space, formatting, missing
  semi-colons, etc)
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **perf**: A code change that improves performance
- **test**: Adds missing tests
- **chore**: Changes to the build process or auxiliary tools and libraries such as documentation
  generation

The scope names the area of the change, usually a package or feature. For example `auth`,
`settings`, `payments`, `l10n`.

The subject is a succinct description of the change:

- use the imperative, present tense: "change" not "changed" nor "changes"
- don't capitalize the first letter
- no dot (.) at the end
- keep the whole line to 72 characters or fewer

### Body

- **Because:** why the change is needed.
- **This commit:** what the change does, in the imperative, present tense.

### Footer

`Closes #FXA-<number>`, naming the Jira ticket this commit closes. GitHub issues sync to Jira
automatically; the issue shows its Jira ticket number once synced.

## Keeping your fork in sync

Use **Sync fork** on your fork's GitHub page, or add `mozilla/fxa` as an `upstream` remote:

```sh
git remote add upstream https://github.com/mozilla/fxa.git
git fetch upstream
git rebase upstream/main
```

For more info, see [GitHub Docs: Syncing a fork](https://docs.github.com/en/pull-requests/how-tos/work-with-forks/syncing-a-fork).

## Servers

- **stage** - https://accounts.stage.mozaws.net/
- **production** - https://accounts.firefox.com/

## Dependencies and Tools

### Node and Yarn

The required Node version is in [`.nvmrc`](/.nvmrc). We use [Yarn](https://yarnpkg.com/), pinned by the `packageManager` field in [`package.json`](/package.json). `yarn install` checks both before installing.

### L10N

To contribute translations visit [Pontoon](https://pontoon.mozilla.org/).
