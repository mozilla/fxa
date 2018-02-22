+++
title = "Getting Started"
+++

# Contributing

Please read through the [CONTRIBUTING.md](https://github.com/mozilla/fxa/blob/master/CONTRIBUTING.md) file
to get a better understanding of how to write a patch for Firefox Accounts.

## fxa-local-dev

Follow the README.md in the [fxa-local-dev repository](https://github.com/mozilla/fxa-local-dev)
to get started.

## Other

> Other development resources that are used across all repositories

### Updating npm shrinkwrap

* Install the [npmshrink](https://www.npmjs.com/package/npmshrink) tool.
* If you are updating the fxa-content-server run `npmshrink:prod` in the root directory.
All other repos use `npmshrink`.
