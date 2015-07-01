# Welcome to Firefox Accounts!

Firefox Accounts is the authentication and authorization system for Cloud
Services at Mozilla, providing access to services such as Firefox Sync and
Firefox Hello.

This documentation is for contributors wanting to help develop and maintain
the Firefox Accounts service.  We have separate documentation for other purposes:

#### Using your Firefox Account

You can [create an account](https://accounts.firefox.com/signup) or
[sign in](https://accounts.firefox.com/signin) directly on https://accounts.firefox.com,
but you almost certainly want to start by using an account-attached service such as
[Firefox Sync](https://www.mozilla.org/en-US/firefox/sync/)
or [Firefox Hello](https://www.mozilla.org/en-US/firefox/hello/).

More information is available on [Mozilla's support site](https://support.mozilla.org/en-US/kb/access-mozilla-services-firefox-accounts).


#### Integrating with Firefox Accounts

Developing a service that needs Firefox Accounts authentication?  Head on over to the [Firefox Accounts portal on MDN](https://developer.mozilla.org/docs/Mozilla/Tech/Firefox_Accounts) for a description of the system, how it works, and how to plug into it.

Note that all services integrating with Firefox Accounts require approval (and access credentials)
from Mozilla.  We are not (yet) offering Firefox Accounts authentication to third-party reliers
on the web.


## Code

Most repositories are [available via GitHub](https://github.com/mozilla?utf8=%E2%9C%93&query=fxa)

### Core Servers

- [fxa-content-server](https://github.com/mozilla/fxa-content-server)
- [fxa-auth-server](https://github.com/mozilla/fxa-auth-server)
- [fxa-oauth-server](https://github.com/mozilla/fxa-oauth-server)
- [fxa-profile-server](https://github.com/mozilla/fxa-profile-server)
- [fxa-auth-db-server](https://github.com/mozilla/fxa-auth-db-server)
- [fxa-auth-db-mem](https://github.com/mozilla/fxa-auth-db-mem)
- [fxa-auth-db-mysql](https://github.com/mozilla/fxa-auth-db-mysql)
- [fxa-customs-server](https://github.com/mozilla/fxa-customs-server)

### Other

- [fxa-js-client](https://github.com/mozilla/fxa-js-client)
- [fxa-relier-client](https://github.com/mozilla/fxa-relier-client)


## People and Places

These fine folks are the globally distributed team at the core of Firefox Accounts
development, and will be happy to help answer any questions you might have.

* [Ryan Kelly](https://github.com/rfk) - Engineering (Melbourne, approx UTC+10)
* [Shane Tomlinson](https://github.com/shane-tomlinson/) - Engineering (London, approx UTC)
* [Danny Coates](https://github.com/dannycoates/) - Engineering (Portland, approx UTC-8)
* [Sean McArthur](https://github.com/seanmonstar) - Engineering (Irvine, approx UTC-8)
* [Andy Chilton](https://github.com/chilts) - Engineering (Wellington, approx UTC+12)
* [Zach Carter](https://github.com/zaach) - Engineering (San Francisco, approx UTC-8)
* [Vlad Filippov](https://github.com/vladikoff) - Engineering (Toronto, approx UTC-5)
* [Phil Booth](https://github.com/philbooth) - Engineering (London, approx UTC)
* [John Morrison](https://github.com/jrgm) - Operations (Mountain View, approx UTC-8)
* [Peter deHaan](https://github.com/pdehaan) - QA (Mountain View, approx UTC-8)
* [Ryan Feeley](https://github.com/rfeeley) - UX (Toronto, approx UTC-5)
* [Chris Karlof](https://github.com/ckarlof) - Identity Services Manager (San Francisco, approx UTC-8)
* [Edwin Wong](https://github.com/edwong) - Program Manager (San Francisco, approx UTC-8)

We meet regularly to triage bugs and make grand plans for the future.  Anyone is welcome to
join us in the following forums:

* Regular video meetings, as noted on the [project calendar](https://www.google.com/calendar/embed?src=mozilla.com_urbkla6jvphpk1t8adi5c12kic%40group.calendar.google.com) and with minutes in the [coordination etherpad](https://id.etherpad.mozilla.org/fxa-engineering-coordination)
* The [Firefox Accounts mailing list](https://mail.mozilla.org/listinfo/dev-fxacct)
* The `#fxa` channel on [Mozilla IRC](https://wiki.mozilla.org/IRC)


## Bugs

Most of our work takes place on github, and we use [waffle.io](https://waffle.io) to provide an overview of bug status and activity:

* [GitHub issues for front-end content](https://waffle.io/mozilla/fxa-content-server)
* [GitHub issues for back-end APIs](https://waffle.io/mozilla/fxa-auth-server)

If you have found a bug in FxA, please file it via one of the two dashboards
above.

There is also a "Core/FxAccounts" bugzilla component that covers the accounts code inside Firefox itself, and a "Server: Firefox Accounts" component for when FxA code interacts with parts of Mozilla that operate out of bugzilla:

* [Bugzilla search for "Core/FxAccounts"](https://bugzilla.mozilla.org/buglist.cgi?query_format=advanced&bug_status=UNCONFIRMED&bug_status=NEW&bug_status=ASSIGNED&bug_status=REOPENED&component=FxAccounts&product=Core&list_id=12360036)
* [Bugzilla search for "Server: Firefox Accounts"](https://bugzilla.mozilla.org/buglist.cgi?query_format=advanced&bug_status=UNCONFIRMED&bug_status=NEW&bug_status=ASSIGNED&bug_status=REOPENED&component=Server%3A Firefox Accounts&product=Cloud Services)


## How To

* [Get started with local development](https://github.com/mozilla/fxa-local-dev)
* [Run your own FxA server stack](https://docs.services.mozilla.com/howtos/run-fxa.html)

