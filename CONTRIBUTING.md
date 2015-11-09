# Contribution Guidelines for the Firefox Accounts

Anyone is welcome to help with Firefox Accounts. Feel free to get in touch with other community members on IRC, the
mailing list or through issues here on GitHub.

- IRC: `#fxa` on `irc.mozilla.org`
- Mailing list: <https://mail.mozilla.org/listinfo/dev-fxacct>
- and of course, [the issues list](https://waffle.io/mozilla/fxa)

## Bug Reports ##

You can file issues here on GitHub. Please try to include as much information as you can and under what conditions
you saw the issue.

## Sending Pull Requests ##

Patches should be submitted as pull requests (PR).

Before submitting a PR:
- Your code must run and pass all the automated tests before you submit your PR for review. "Work in progress" pull requests are allowed to be submitted, but should be clearly labeled as such and should not be merged until all tests pass and the code has been reviewed.
- Your patch should include new tests that cover your changes. It is your and your reviewer's responsibility to ensure your patch includes adequate tests.

When submitting a PR:
- You agree to license your code under the project's open source license ([MPL 2.0](/LICENSE)).
- Base your branch off the current `master` (see below for an example workflow).
- Add both your code and new tests if relevant.
- Please do not include merge commits in pull requests; include only commits with the new relevant code.

See the main [README.md](/README.md) in each repository for information on prerequisites, installing, running and testing.

## Code Review ##

This project is production Mozilla code and subject to our [engineering practices and quality standards](https://developer.mozilla.org/en-US/docs/Mozilla/Developer_guide/Committing_Rules_and_Responsibilities). Every patch must be peer reviewed. This project is part of the [Firefox Accounts module](https://wiki.mozilla.org/Modules/Other#Firefox_Accounts), and your patch must be reviewed by one of the listed module owners or peers. 

## Git Commit Guidelines

We loosely follow the [Angular commit guidelines](https://github.com/angular/angular.js/blob/master/CONTRIBUTING.md#type) of `<type>(<scope>): <subject>` where `type` must be one of:

* **feat**: A new feature
* **fix**: A bug fix
* **docs**: Documentation only changes
* **style**: Changes that do not affect the meaning of the code (white-space, formatting, missing
  semi-colons, etc)
* **refactor**: A code change that neither fixes a bug or adds a feature
* **perf**: A code change that improves performance
* **test**: Adding missing tests
* **chore**: Changes to the build process or auxiliary tools and libraries such as documentation
  generation

### Scope
The scope could be anything specifying place of the commit change. For example `oauth`,
`fxa-client`, `signup`, `l10n` etc...

### Subject
The subject contains succinct description of the change:

* use the imperative, present tense: "change" not "changed" nor "changes"
* don't capitalize first letter
* no dot (.) at the end

###Body
In order to maintain a reference to the context of the commit, add
`fixes #<issue_number>` if it closes a related issue or `issue #<issue_number>`
if it's a partial fix.

You can also write a detailed description of the commit:
Just as in the **subject**, use the imperative, present tense: "change" not "changed" nor "changes"
It should include the motivation for the change and contrast this with previous behavior.

###Footer
The footer should contain any information about **Breaking Changes** and is also the place to
reference GitHub issues that this commit **Closes**.

## License

MPL 2.0
