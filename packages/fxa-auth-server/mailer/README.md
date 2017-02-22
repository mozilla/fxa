Firefox Accounts Mailer
==========================

[![Build Status](https://travis-ci.org/mozilla/fxa-auth-server.svg?branch=master)](https://travis-ci.org/mozilla/fxa-auth-server)
[![Coverage Status](https://coveralls.io/repos/github/mozilla/fxa-auth-server/badge.svg?branch=master)](https://coveralls.io/github/mozilla/fxa-auth-server?branch=master)

Library to send out verification emails in the [fxa-auth-server](https://github.com/mozilla/fxa-auth-server/) which renders emails from a template (and handles localization).

The emails are written to postfix which tends sends them off to SES.

The auth-mailer also includes a restify API to send emails, but the auth server is using it as a library at the moment.

## Prerequisites

* node 4
* npm 2
* postfix

## Changing Templates

If you are changing or adding templates then you need to update `.html` and `.txt` templates.
Use the `/partials` directory to make changes to the HTML templates, then run `grunt templates` to regenerate the template.
This saves the HTML template into `/templates`. Then make changes to the `.txt` template in the `/templates` directory.

## L10N

After updating a string in one of the templates in `./templates` you'll need to extract the strings.
Follow the instructions at [mozilla/fxa-content-server-l10n](https://github.com/mozilla/fxa-content-server-l10n#string-extraction).

### Production

Use the `FXA_L10N_SHA` to pin L10N files to certain SHA. If not set then the `master` SHA will be used.
