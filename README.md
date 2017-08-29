# Welcome to Firefox Accounts [![Build Status](https://travis-ci.org/mozilla/fxa.svg?branch=master)](https://travis-ci.org/mozilla/fxa) [![Documentation Status](https://readthedocs.org/projects/fxa/badge/?version=latest)](https://readthedocs.org/projects/fxa/?badge=latest)

Firefox Accounts is the authentication and authorization system for Cloud
Services at Mozilla, providing access to services such as Firefox Sync, Pocket and
Addons.Mozilla.org.

This repository contains documentation for getting started with Firefox
Accounts development.  Most of the actual code for the service lives in
sub-repositories linked from the docs below.

## Using your Firefox Accounts

You can [create an account](https://accounts.firefox.com/signup) or
[sign in](https://accounts.firefox.com/signin) directly on https://accounts.firefox.com, but you almost certainly want to start by using an account-attached
service such as [Firefox Sync](https://www.mozilla.org/en-US/firefox/sync/).


## Integrating with Firefox Accounts

Developing a service that needs Firefox Accounts authentication?  Head on over to the [Firefox Accounts portal on MDN](https://developer.mozilla.org/docs/Mozilla/Tech/Firefox_Accounts) for a description of the system, how it works, and how to plug into it.


## Contributing to Firefox Accounts - [fxa.readthedocs.org](http://fxa.readthedocs.org)

Interested in contributing to the development of Firefox Accounts?  Great!
Head over to the [FxA developer documentation](http://fxa.readthedocs.org) on readthedocs.org (which is actually the same content as the local [docs](/docs/index.md) directory, but in a nice pre-rendered HTML view).

Please review and understand the [Mozilla Community Participation Guidelines](https://www.mozilla.org/en-US/about/governance/policies/participation/) before contributing to this project.

##### Bugs List: [waffle.io/mozilla/fxa](https://waffle.io/mozilla/fxa)

## Building this Documentation

```
pip install mkdocs
```

Build:

```
mkdocs build
```

Server + File Watching:

```
mkdocs serve --dev-addr localhost:9032
```

Publishing to http://fxa.readthedocs.org

```
# Documentation is built automatically from this repository.
git commit
git push origin/master
```

## Admin Operations

### Adding new milestones

* Add the milestone by hand on the mozilla/fxa repo
* Get a [GitHub access token](https://github.com/settings/tokens), set `GITHUB_USERNAME` and `GITHUB_API_KEY`
* Run `scripts/sync_milestones.js` to propagate it to the other repos
