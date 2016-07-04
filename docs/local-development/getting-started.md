# Getting Started

## fxa-local-dev

Follow the README.md in the [fxa-local-dev repository](https://github.com/mozilla/fxa-local-dev)
to get started.

## Other

> Other development resources that are used across all repositories

### Updating npm shrinkwrap

* Install the [npmshrink](https://www.npmjs.com/package/npmshrink) tool.
* If you are updating the fxa-content-server run `npm run shrink:prod` in the root directory.
All other repos use ` npm run shrink`.