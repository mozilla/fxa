# Contribution Guidelines for the Firefox Accounts Content Server

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

## Servers

- **latest development** - https://accounts-latest.dev.lcip.org/
- **testing** - https://accounts.dev.lcip.org/
- **stage** - https://accounts.stage.mozaws.net/
- **production** - https://accounts.firefox.com/

## License

MPL 2.0
