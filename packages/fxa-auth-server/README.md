Firefox Accounts Mailer
==========================

[![Build Status](https://travis-ci.org/mozilla/fxa-auth-mailer.svg?branch=master)](https://travis-ci.org/mozilla/fxa-auth-mailer)

Library to send out verification emails in the [fxa-auth-server](https://github.com/mozilla/fxa-auth-server/) which renders emails from a template (and handles localization).

The emails are written to postfix which tends sends them off to SES.

The auth-mailer also includes a restify API to send emails, but the auth server is using it as a library at the moment.

## Prerequisites

* node 0.10.x or higher
* npm
* postfix

## L10N

After updating a string in one of the templates in `./templates` you'll need to perform the following these steps:

1. `npm install` (updates the base .pot files)
2. `grunt` (extracts the new strings)
3. Copy `./server.pot` in to the FxA l10n repo, e.g. `cp server.pot ../fxa-content-server-l10n/locale/templates/LC_MESSAGES/server.pot`
4. From the l10n repo, run `./scripts/merge_po.sh` and submit a pull request with the changes

