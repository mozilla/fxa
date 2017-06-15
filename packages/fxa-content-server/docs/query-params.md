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
* `chromeless` - Show Firefox Accounts without extra "chrome" like the Firefox logo and outside border.

#### When to specify
When authenticating a user with OAuth and an alternate style is needed.

## Firefox/Sync parameters

#### When to specify

* /signin
* /signup
* /force_auth

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
Only available if `context` equals `fx_desktop_v1`, `fx_desktop_v2`, `fx_fennec_v1`, `fx_firstrun_v2`, `fx_ios_v1`, or `iframe` and `service` equals `sync`.

* /signup

### `entrypoint`
If they user arrived at Firefox Accounts from within Firefox browser chrome, specify where in Firefox the user came from.

#### When to specify
* /signin
* /signup
* /force_auth
* /settings

### `haltAfterSignIn`
Halt after the user signs in, do not redirect to the settings page.

#### When to specify (must specify context=iframe&service=sync or context=fx_firstrun_v2)
* /signin
* /signup
* /force_auth

### `migration`
If the user is migrating their Sync account from "old sync" to "new sync", specify which sync they are migrating from.

#### When to specify
Only available if `context` equals `fx_desktop_v1`, `fx_desktop_v2`, `fx_desktop_v3`, `fx_fennec_v1`, `fx_firstrun_v2`, `fx_ios_v1`, or `iframe`.

* /signin
* /signup

#### Options
* `sync11`

### `service`
Specify which non-OAuth service a user is signing in to.

#### Options
* `sync`

#### When to specify
Only available if `context` equals `fx_desktop_v1`, `fx_desktop_v2`, `fx_desktop_v3`, `fx_fennec_v1`, `fx_firstrun_v2`, `fx_ios_v1`, `iframe`, `mob_android_v1`,
`mob_ios_v1`.

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
* `fx_desktop_v1` - Firefox Accounts is being used to sign in to Sync on
   Firefox Desktop using CustomEvents.
* `fx_desktop_v2` - Firefox Accounts is being used to sign in to Sync on
   Firefox Desktop using WebChannels.
* `fx_desktop_v3` - Firefox Accounts is being used to sign in to Sync on
   Firefox Desktop using WebChannels. Used to add the `syncPreferencesNotification`
   capability
* `fx_fennec_v1` - Firefox Accounts is being used to sign in to Sync on
   Firefox for Android using WebChannels.
* `fx_firstrun_v2` - Firefox Accounts is being used to sign in to Sync
   on the Firefox Desktop firstrun page. Used to add the
   `syncPreferencesNotification` capability
* `fx_ios_v1` - Firefox Accounts is being used to sign in to Sync on Firefox
   for iOS using CustomEvents.
* `iframe` - Firefox Accounts is being used to sign in to Sync on Firefox
    Desktop firstrun page. Misnamed and should be called `fx_firstrun_v1`.
* `mob_android_v1` - Firefox Accounts is being used to sign in to Sync
    using the standalone Android library.
* `mob_ios_v1` - Firefox Accounts is being used to sign in to Sync
    using the standalone iOS library.

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

### `forceExperiment`
Force a particular AB test.

#### Options
* `connectAnotherDevice` - the "connect another device" experiment that
    encourages users to set up multiple devices.
* `mailcheck` - provide a tooltip to correct common domain name errors in the
    email.

### `forceExperimentGroup`
Force the user into a particular AB test experiment group.

#### Options
* `control` - default behavior.
* `treatment` - new behavior.

## Reset Password parameters

### `reset_password_confirm`
Used to skip the confirmation form to reset a password

#### Options
* `true` (default)
* `false`

#### When to use
Should not be used by reliers.
Should only be used for accounts that must be reset.
