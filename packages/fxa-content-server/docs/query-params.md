# Relier provided query parameters
Query parameters are used to pass data from the relier to Firefox Accounts.

## OAuth parameters

### `client_id`
Specify the OAuth client_id of the relier being signed in to.

#### When to specify
When authenticating a user for OAuth.

* /oauth/signin
* /oauth/signup
* /oauth/force_auth

### `migration`
If the user is migrating their account, specify which service they are migrating from.

#### When to specify
When signing up a user.

* /signup

#### Options
* `amo`

### `prompt`
Specifies whether the content server prompts for permissions consent. Only applicable for `trusted` reliers.
Untrusted reliers always show the prompt.

#### Options
* `consent` - Show the permissions prompt if any additional
  permissions are required.

#### When to specify
When authenticating a user for OAuth. Only applicable for `trusted` reliers.
Untrusted reliers always show the prompt.

* /oauth/signin
* /oauth/signup
* /oauth/force_auth


### `redirect_uri`
Which URI should a user be redirected back to upon completion of the OAuth transaction.

#### When to specify
When authenticating a user for OAuth.

* /oauth/signin
* /oauth/signup
* /oauth/force_auth

### `scope`
Specify the OAuth scope requested.

#### Options
* `profile`

#### When to specify
When authenticating a user for OAuth.

* /oauth/signin
* /oauth/signup
* /oauth/force_auth

### `state`
Specify an OAuth state token.

#### When to specify
When authenticating a user with OAuth.

* /oauth/signin
* /oauth/signup
* /oauth/force_auth

### `style`
Specify an alternate style for Firefox Accounts.

#### Options
* `trailhead` - Apply the Trailhead styling

#### When to specify
Anywhere

## Firefox/Sync parameters

### `action`

Specifies the behavior of users sent to `/`. As of January 2019, the preferred `action`
for all new integrations is `email`. By the end of Q1 2019, `signin` and `signup` will
be treated the same as `email`.

Specifying `action=email` causes the "email-first" flow where unauthenticated users are
first asked to enter their email address w/o a password. If an account exists for the
address, the user is asked to login, if no account exists, the user is asked to create
an account.

#### Options
* `email`
* `signin` (DEPRECATED, use `email`)
* `signup` (DEPRECATED, use `email`)

#### When to specify

* /

### `channel`
Force which Firefox release channel should be installed
after redirecting from `/m/:signinCode`.

#### Options
* `beta`
* `nightly`
* `release`

#### When to specify

* /m/:signinCode

### `country`
Force a country to be used when testing the SMS feature.

#### Options
* `CA`
* `GB`
* `RO`
* `US`

### `customizeSync`
Set the default value of the "Customize which values to sync" checkbox.

#### Options
* `true`
* `false` (default)

#### When to specify
Only available if `context` equals `fx_fennec_v1`, or `fx_ios_v1` and `service` equals `sync`.

* /signup

### `entrypoint`
If they user arrived at Firefox Accounts from within Firefox browser chrome, specify where in Firefox the user came from.

### `entrypoint_experiment` and `entrypoint_variation`

If an experiment is running at the entrypoint,
set these properties to
the name of the experiment
and the variation that
the user is part of.

#### When to specify
* /signin
* /signup
* /force_auth
* /settings

### `migration`
If the user is migrating their Sync account from "old sync" to "new sync", specify which sync they are migrating from.

#### When to specify
Only available if `context` equals `fx_desktop_v3`, `fx_fennec_v1`, or `fx_ios_v1`

* /signin
* /signup

#### Options
* `sync11`

### `service`
Specify which non-OAuth service a user is signing in to.

#### Options
* `sync`

#### When to specify
Only available if `context` equals `fx_desktop_v3`, `fx_fennec_v1`, or `fx_ios_v1`

* /signin
* /signup
* /force_auth

### `setting`
Specify a profile field to make editable.

#### Options
* `avatar`

#### When to specify
If Firefox Accounts is opened to `/settings` and a profile field should be made editable.

* /settings

## Generic parameters

### `context`
Specify an alternate context in which Firefox Accounts is being run, if not as a standard web page.

#### Options
* `fx_desktop_v3` - Firefox Accounts is being used to sign in to Sync on
   Firefox Desktop using WebChannels. Used to add the `syncPreferencesNotification`
   capability
* `fx_fennec_v1` - Firefox Accounts is being used to sign in to Sync on
   Firefox for Android using WebChannels.
* `fx_ios_v1` - Firefox Accounts is being used to sign in to Sync on Firefox
   for iOS using CustomEvents.

### `email`
When used on /signin, /oauth/signin, /signup, or /oauth/signup, suggest a user to sign in. If set to the string `blank`, an empty sign in form will be displayed and no suggested accounts will appear.

When specified at /force_auth, the user will be forced to sign in as the specified email. If an account does not exist for the specified email, the user will be unable to sign in.

#### When to specify
If the user's email address is already known.

* /signin
* /oauth/signin
* /signup
* /oauth/signup
* /force_auth
* /oauth/force_auth

### `utm_campaign`
The Google Analytics `utm_campaign` field. Will be passed back to the relier
when authentication completes.

#### When to specify

* /signin
* /signup
* /force_auth
* /

### `utm_content`
The Google Analytics `utm_content` field. Will be passed back to the relier
when authentication completes.

#### When to specify

* /signin
* /signup
* /force_auth
* /

### `utm_medium`
The Google Analytics `utm_medium` field. Will be passed back to the relier
when authentication completes.

#### When to specify

* /signin
* /signup
* /force_auth
* /

### `utm_source`
The Google Analytics `utm_source` field. Will be passed back to the relier
when authentication completes.

#### When to specify

* /signin
* /signup
* /force_auth
* /

### `utm_term`
The Google Analytics `utm_term` field. Will be passed back to the relier
when authentication completes.

#### When to specify

* /signin
* /signup
* /force_auth
* /

## Email verification parameters

### `code`
Used in the verification flows to specify the verification code.

#### When to use
Should not be used by reliers.

### `uid`
Used in two cases:
1. By the verification flows to specify the user id of the user being verified.
1. By reliers when loading a settings page to specify which account should be used.

#### When to use
Reliers who send users to a settings page to e.g., set an avatar, can pass a uid to
ensure users with multiple accounts update the avatar for the correct account.

## Experimental/development parameters

### `automatedBrowser`
 Used by functional tests to indicate the browser is being automated.

#### Options
*  `true`
* `false` (default)

### `disable_local_storage`
Used by functional tests to synthesize localStorage being disabled.

#### Options
* `0`
* `1`

#### When to use
Should not be used by reliers. Should only be used by functional tests.

### `forceAboutAccounts`
Force Sync brokers to act as if the user opened FxA from within about:accounts.

#### Options
* `true`

#### When to use
Should not be used by reliers. Should only be used for Sync based functional tests.

### `forceExperiment`
Force a particular AB test.

#### Options
* `emailFirst` - Should the user go through the email-first flow?
* `sendSms` - Allow users to send an SMS containing a Firefox Mobile installation link

### `forceExperimentGroup`
Force the user into a particular AB test experiment group.

#### Options
* `control` - default behavior.
* `treatment` - new behavior.
* `signinCodes` - a second treatment group, only used for the `sendSms` experiment.
  When sending an SMS, the install link contains a signinCode that helps the user sign in more easily on the second device.

## Reset Password parameters

### `reset_password_confirm`
Used to skip the confirmation form to reset a password

#### Options
* `true` (default)
* `false`

#### When to use
Should not be used by reliers.
Should only be used for accounts that must be reset.

### `emailToHashWith`
Allows you to override the default email that a reset password is hashed with.

#### Options
* user's current primary email (default)

#### When to use
After a user has changed their primary email you need to hash with the original account email
if they perform a reset password.

## Secondary email parameters

#### Options
* `true`
* `false` (default)

#### When to specify
* /settings/emails
