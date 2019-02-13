# Welcome to Firefox Accounts

Firefox Accounts is the authentication and authorization system for Mozilla
Services, providing access to services such as Firefox Sync, Pocket and
https://addons.mozilla.org.

This repository contains documentation for getting started with Firefox
Accounts development.  Most of the actual code for the service lives in
sub-repositories linked from the docs below.

## Using your Firefox Accounts

You can [create an account](https://accounts.firefox.com/signup) or
[sign in](https://accounts.firefox.com/signin) directly on https://accounts.firefox.com, but you almost certainly want to start by using an account-attached
service such as [Firefox Sync](https://www.mozilla.org/firefox/sync/).


## Integrating with Firefox Accounts

Developing a service that needs Firefox Accounts authentication?  Head on over to the [Firefox Accounts Portal](https://mozilla.github.io/application-services/docs/accounts/welcome.html) for a description of the system, how it works, and how to plug into it.


## Contributing to Firefox Accounts

Interested in contributing to the development of Firefox Accounts?  Great!
Head over the [FxA Content Server quick start guide](https://github.com/mozilla/fxa-content-server/#quick-start) if you
want to contribute to the front-end or to the [FxA local development guide](https://github.com/mozilla/fxa-local-dev/blob/master/README.md)
to learn how to run the full stack.

Please review and understand the [Mozilla Community Participation Guidelines](https://www.mozilla.org/about/governance/policies/participation/) before contributing to this project.

##### Bugs List: [waffle.io/mozilla/fxa](https://waffle.io/mozilla/fxa)

## Admin Operations

### Adding new milestones

* Add the milestone by hand on the mozilla/fxa repo
* Get a [GitHub access token](https://github.com/settings/tokens), set `GITHUB_USERNAME` and `GITHUB_API_KEY`
* Run `scripts/sync_milestones.js` to propagate it to the other repos
