# Contribution Guidelines for the Firefox Accounts Content Server

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

###Body (optional)
Just as in the **subject**, use the imperative, present tense: "change" not "changed" nor "changes"
The body should include the motivation for the change and contrast this with previous behavior.

###Footer
The footer should contain any information about **Breaking Changes** and is also the place to
reference GitHub issues that this commit **Closes**.

## Grunt Commands

[Grunt](http://gruntjs.com/) is used to run common tasks to build, test, and run local servers.

| Task | Description |
|------|-------------|
| `grunt jshint` | run JSHint on client side and testing JavaScript. |
| `grunt build` | build production resources. |
| `grunt clean` | remove any built production resources. |
| `grunt test` | run local Intern tests. |
| `grunt server` | run a local server running on port 3030 with development resources. |
| `grunt server:dist` | run a local server running on port 3030 with production resources. Production resources will be built as part of the task. |
| `grunt version` | stamp a new version. Updates the version number and creates a new CHANGELOG.md file. |
| `grunt imagemin` | if you added a new image to the project, then run this to optimize the images before committing |

## Servers

- **latest development** - https://accounts-latest.dev.lcip.org/
- **testing** - https://accounts.dev.lcip.org/
- **stage** - https://accounts.stage.mozaws.net/
- **production** - https://accounts.firefox.com/

## Dependency Servers

We use [Freight](https://github.com/vladikoff/freight) to package our npm and Bower dependencies.
Check Freight status at [freight.dev.lcip.org](https://freight.dev.lcip.org/).

## License

MPL 2.0
