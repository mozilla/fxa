# Welcome to Firefox Accounts [![Build Status](https://travis-ci.org/mozilla/fxa.svg?branch=master)](https://travis-ci.org/mozilla/fxa) [![Documentation Status](https://readthedocs.org/projects/fxa/badge/?version=latest)](https://readthedocs.org/projects/fxa/?badge=latest)

Firefox Accounts is the authentication and authorization system for Cloud
Services at Mozilla, providing access to services such as Firefox Sync and
Firefox Hello.

This repository contains documentation for getting started with Firefox
Accounts development.  Most of the actual code for the service lives in
sub-repositories linked from the docs below.

## Using your Firefox Accounts

You can [create an account](https://accounts.firefox.com/signup) or
[sign in](https://accounts.firefox.com/signin) directly on https://accounts.firefox.com, but you almost certainly want to start by using an account-attached
service such as [Firefox Sync](https://www.mozilla.org/en-US/firefox/sync/)
or [Firefox Hello](https://www.mozilla.org/en-US/firefox/hello/).


## Integrating with Firefox Accounts

Developing a service that needs Firefox Accounts authentication?  Head on over to the [Firefox Accounts portal on MDN](https://developer.mozilla.org/docs/Mozilla/Tech/Firefox_Accounts) for a description of the system, how it works, and how to plug into it.


## Contributing to Firefox Accounts - [fxa.readthedocs.org](http://fxa.readthedocs.org)

Interested in contributing to the development of Firefox Accounts?  Great!
Head over to the [FxA developer documentation](http://fxa.readthedocs.org) on readthedocs.org (which is actually the same content as the local [docs](/docs/index.md) directory, but in a nice pre-rendered HTML view).

##### Track development updates: [![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/mozilla/fxa?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)
##### Fix bugs: [![Bugs in good first bug](https://badge.waffle.io/mozilla/fxa-content-server.svg?label=good%20first%20bug&title=Front-End)](http://waffle.io/mozilla/fxa-content-server) [![Stories in Ready](https://badge.waffle.io/mozilla/fxa-auth-server.svg?label=z-later&title=Server-Side)](http://waffle.io/mozilla/fxa-auth-server)

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
