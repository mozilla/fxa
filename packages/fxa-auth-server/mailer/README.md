Firefox Accounts Mailer
==========================

[![Build Status](https://travis-ci.org/mozilla/fxa-auth-mailer.svg?branch=master)](https://travis-ci.org/mozilla/fxa-auth-mailer)
[![Coverage Status](https://coveralls.io/repos/github/mozilla/fxa-auth-mailer/badge.svg?branch=master)](https://coveralls.io/github/mozilla/fxa-auth-mailer?branch=master)

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

After updating a string in one of the templates in `./templates` you'll need to extract the strings using [this script](https://raw.githubusercontent.com/mozilla/fxa-content-server-l10n/master/scripts/extract_strings.sh):

``extract_strings.sh [--mailer-repo ./fxa-auth-mailer] [--content-repo ./fxa-content-server] [--l10n-repo ./fxa-content-server-l10n] train_number``

### Production

Use the `FXA_L10N_SHA` to pin L10N files to certain SHA. If not set then the `master` SHA will be used.
