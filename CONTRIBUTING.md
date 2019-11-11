# Contribution Guidelines for the Firefox Accounts Content Server

Anyone is welcome to help with Firefox Accounts. Feel free to get in touch with other community members on IRC, the
mailing list or through issues here on GitHub.

- IRC: `#fxa` on `irc.mozilla.org`
- Mailing list: <https://mail.mozilla.org/listinfo/dev-fxacct>
- and of course, [the issues list](https://github.com/mozilla/fxa/issues)

## Code of Conduct

You must agree to abide by the [Mozilla Community Participation Guidelines](https://www.mozilla.org/about/governance/policies/participation/)

## Bug Reports

You can [file issues on GitHub](https://github.com/mozilla/fxa/issues/new). Please try to include as much information as you can and under what conditions
you saw the issue.

## Bug Triage

We triage bugs twice a week: in the Monday FxA Weekly meeting (after agenda items), and in the Friday Triage meeting (see the [Firefox Accounts Public Calendar](https://calendar.google.com/calendar/embed?src=mozilla.com_urbkla6jvphpk1t8adi5c12kic%40group.calendar.google.com) for times and details). If you are a contributor and would like to attend triage, reach out and let us know.

The FxA core team uses ZenHub to measure velocity and organize work into Epics.

### Estimation and Point Values

Points are assigned to GitHub issues (ideally before starting work 😉) so that we can track our velocity over time, which aids in planning. Note that you'll need to be signed in to ZenHub to view and set estimates.

We don't assign points to pull requests, unless it's a pull request without a corresponding issue.

The goal of estimation is for us to assess the issue in terms of its relative complexity, effort, and doubt. When applying an estimate, we should consider all the steps in getting the particular work to a completed (ready for production) state for our consumer. The should include effort required for code reviews, security reviews, testing, integration and build/deploy.

| Points  | Relative Size | Description                                                                |
| ------- | ------------- | -------------------------------------------------------------------------- |
| 1       | xs            | This is a trivial change with clearly defined parameters.                  |
| 3       | m             | This is a small change, but there's some uncertainty.                      |
| 2       | s             | This is a small change with clearly defined parameters.                    |
| 5       | l             | Moderately complex, will require some effort but clearly defined.          |
| 8       | xl            | Moderately complex, medium effort, some uncertainty.                       |
| 13      | xxl           | Complex, large effort, well defined (these should be broken down further)  |
| 21 (20) | ∞             | Meta issue or We do not have clear scope. (This issue must be broken down) |

## Sending Pull Requests

Patches should be submitted as pull requests (PR).

Before submitting a PR:

- Your code must run and pass all the automated tests before you submit your PR for review. "Work in progress" pull requests are allowed to be submitted, but should be clearly labeled as such and should not be merged until all tests pass and the code has been reviewed.
- Your patch should include new tests that cover your changes. It is your and your reviewer's responsibility to ensure your patch includes adequate tests.
- Your patch must be [GPG signed](https://help.github.com/articles/managing-commit-signature-verification) to ensure the commits come from a trusted source.

When submitting a PR:

- You agree to license your code under the project's open source license ([MPL 2.0](/LICENSE)).
- Base your branch off the current `master`.
- Add both your code and new tests if relevant.
- Run `grunt lint` and `npm test` to make sure your code passes linting and tests.
- Please do not include merge commits in pull requests; include only commits with the new relevant code.
- Your commit message must follow the
  [commit guidelines](https://github.com/mozilla/fxa/blob/master/CONTRIBUTING.md#git-commit-guidelines).

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

In order to maintain a reference to the context of the commit, add
`fixes #<issue_number>` if it closes a related issue or `issue #<issue_number>`
if it's a partial fix.

You can also write a detailed description of the commit:
Just as in the **subject**, use the imperative, present tense: "change" not "changed" nor "changes"
It should include the motivation for the change and contrast this with previous behavior.

### Footer

The footer should contain any information about **Breaking Changes** and is also the place to
reference GitHub issues that this commit **Closes**.

## Servers

- **latest development** - https://accounts-latest.dev.lcip.org/
- **testing** - https://accounts.dev.lcip.org/
- **stage** - https://accounts.stage.mozaws.net/
- **production** - https://accounts.firefox.com/

## Dependencies and Tools

### npm

We use [npm](http://npmjs.com/) to manage dependencies. Required components are [automatically
installed](https://github.com/mozilla/fxa/blob/master/package.json#L6) when you install this project.

### L10N

To contribute translations visit [mozilla/fxa-content-server-l10n](https://github.com/mozilla/fxa-content-server-l10n).
Use the `FXA_L10N_SHA` to pin L10N files to certain Git SHA. If not set then the `master` branch SHA will be used.

## License

MPL 2.0
