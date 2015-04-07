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

### `keys`
Set to true to receive derived kA and kB keys that can be used to encrypt data.

#### Options
* `true`
* `false` (default)

#### When to specify
When authenticating a user for OAuth.

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

### `campaign`
If the user arrived at Firefox Accounts via a Mozilla marketing campaign,
specify the campaign identifier.

#### When to specify
Only available if `context=fx_desktop_v1`.

* /signin
* /signup
* /force_auth

### `customizeSync`
Set the default value of the "Customize which values to sync" checkbox.

#### Options
* `true`
* `false` (default)

#### When to specify
Only available if `context=fx_desktop_v1&service=sync`.

* /signup


### `entrypoint`
If they user arrived at Firefox Accounts from within Firefox browser chrome, specify where in Firefox the user came from.

#### When to specify
Only available if `context=fx_desktop_v1`.

* /signin
* /signup
* /force_auth

### `migration`
If the user is migrating their Sync account from "old sync" to "new sync", specify which sync they are migrating from.

#### When to specify
Only available if `context=fx_desktop_v1`.

* /signin
* /signup

### `service`
Specify which non-OAuth service a user is signing in to.

#### Options
* `sync`

#### When to specify
Only available if `context=fx_desktop_v1`.

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
* `fx_desktop_v1` - Firefox Accounts is being used to sign in to Sync.
* `iframe` - Firefox Accounts is displayed in an iframe.

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

### `preVerifyToken`
A preVerifyToken is accepted from certain trusted reliers.

#### When to specify
* /signup or /oauth/signup

### `webChannelId`
Sign into a Firefox service that listens on a [WebChannel](https://developer.mozilla.org/en-US/docs/Mozilla/JavaScript_code_modules/WebChannel.jsm).


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

### `mailcheck`
Indicate the "mailcheck" feature should be used to validate email addresses.

#### Options
* `true`
* `false` (default)

#### When to specify
If the "mailcheck" feature should be used.

* /signup
* /oauth/signup




