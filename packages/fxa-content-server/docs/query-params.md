# Relier provided query parameters

Query parameters are used to pass data from the relier to Firefox Accounts.

## OAuth parameters

### `client_id`

Specify the OAuth client_id of the relier being signed in to.

#### When to specify

When authenticating a user for OAuth.

### `migration`

If the user is migrating their account, specify which service they are migrating from.

#### When to specify

When signing up a user.

#### Options

- `amo`

### `prompt`

Specifies whether the content server prompts for permissions consent. Only applicable for `trusted` relying parties.
Untrusted relying parties always show the prompt.

#### Options

- `consent` - Show the permissions prompt if any additional
  permissions are required. Only applicable for `trusted` relying parties.
  Untrusted relying parties always show the prompt.
- `none` - Require no user interaction if the user is signed in.
  Only applicable for authorized relying parties that are not requesting
  keys. An error is returned to the RP for all others.
  See the [prompt=none doc][#prompt-none] for more info.

#### When to specify

When authenticating a user for OAuth.

### `redirect_uri`

Which URI should a user be redirected back to upon completion of the OAuth transaction.

#### When to specify

When authenticating a user for OAuth.

### `scope`

Specify the OAuth scope requested.

#### Options

- `profile`

#### When to specify

When authenticating a user for OAuth.

### `state`

Specify an OAuth state token.

#### When to specify

When authenticating a user with OAuth.

## Firefox/Sync parameters

### `action`

Specifies the behavior of users sent to `/`. As of December 2019, the only supported
`action` is `email` and `force_auth`. Both `signin` and `signup` act like `email`.

Specifying `action=email` causes the "email-first" flow where unauthenticated users are
first asked to enter their email address w/o a password. If an account exists for the
address, the user is asked to login, if no account exists, the user is asked to create
an account.

#### Options

- `email`
- `signin` (DEPRECATED, use `email`)
- `signup` (DEPRECATED, use `email`)
- `force_auth`

#### When to specify

When authenticating a user

### `channel`

Force which Firefox release channel should be installed
after redirecting from `/m/:signinCode`.

#### Options

- `beta`
- `nightly`
- `release`

#### When to specify

- /m/:signinCode

### `country`

Force a country to be used when testing the SMS feature.

#### Options

- `AT`
- `AU`
- `BE`
- `DE`
- `DE`
- `DK`
- `ES`
- `FR`
- `GB`
- `IT`
- `LU`
- `NL`
- `RO`
- `US`

### `entrypoint`

If they user arrived at Firefox Accounts from within Firefox browser chrome, specify where in Firefox the user came from.

### `entrypoint_experiment` and `entrypoint_variation`

If an experiment is running at the entrypoint,
set these properties to
the name of the experiment
and the variation that
the user is part of.

#### When to specify

Universal

### `service`

Specify which non-OAuth service a user is signing in to.

#### Options

- `sync`

#### When to specify

Only available if `context` equals `fx_desktop_v3`, `fx_fennec_v1`, or `fx_ios_v1`

### `setting`

Specify a profile field to make editable.

#### Options

- `avatar`

#### When to specify

If Firefox Accounts is opened to `/settings` and a profile field should be made editable.

- /settings

## Generic parameters

### `context`

Specify an alternate context in which Firefox Accounts is being run, if not as a standard web page.

#### Options

- `fx_desktop_v3` - Firefox Accounts is being used to sign in to Sync on
  Firefox Desktop using WebChannels. Used to add the `syncPreferencesNotification`
  capability
- `fx_fennec_v1` - Firefox Accounts is being used to sign in to Sync on
  Firefox for Android using WebChannels.
- `fx_ios_v1` - Firefox Accounts is being used to sign in to Sync on Firefox
  for iOS using CustomEvents.

### `email`

When used on /signin, /oauth/signin, /signup, or /oauth/signup, suggest a user to sign in. If set to the string `blank`, an empty sign in form will be displayed and no suggested accounts will appear.

When specified at /force_auth, the user will be forced to sign in as the specified email. If an account does not exist for the specified email, the user will be unable to sign in.

#### When to specify

If the user's email address is already known.

**MUST** be specified when using force_auth, either via ?action=force_auth in the OAuth flow, or browsing directly to /force_auth for Sync.

### `utm_campaign`

The Google Analytics `utm_campaign` field. Will be passed back to the relier
when authentication completes.

#### When to specify

Universal

### `utm_content`

The Google Analytics `utm_content` field. Will be passed back to the relier
when authentication completes.

#### When to specify

Universal

### `utm_medium`

The Google Analytics `utm_medium` field. Will be passed back to the relier
when authentication completes.

#### When to specify

Universal

### `utm_source`

The Google Analytics `utm_source` field. Will be passed back to the relier
when authentication completes.

#### When to specify

Universal

### `utm_term`

The Google Analytics `utm_term` field. Will be passed back to the relier
when authentication completes.

#### When to specify

Universal

## Email verification parameters

### `code`

Used in the verification flows to specify the verification code.

#### When to use

Should not be used by relying parties.

### `uid`

Used in two cases:

1. By the verification flows to specify the user id of the user being verified.
1. By relying parties when loading a settings page to specify which account should be used.

#### When to use

Relying parties who send users to a settings page to e.g., set an avatar, can pass a uid to
ensure users with multiple accounts update the avatar for the correct account.

## Experimental/development parameters

### `automatedBrowser`

Used by functional tests to indicate the browser is being automated.

#### Options

- `true`
- `false` (default)

### `disable_local_storage`

Used by functional tests to synthesize localStorage being disabled.

#### Options

- `0`
- `1`

#### When to use

Should not be used by relying parties. Should only be used by functional tests.

### `forceExperiment`

Force a particular AB test.

#### Options

- `emailFirst` - Should the user go through the email-first flow?
- `sendSms` - Allow users to send an SMS containing a Firefox Mobile installation link

### `forceExperimentGroup`

Force the user into a particular AB test experiment group.

#### Options

- `control` - default behavior.
- `treatment` - new behavior.
- `signinCodes` - a second treatment group, only used for the `sendSms` experiment.
  When sending an SMS, the install link contains a signinCode that helps the user sign in more easily on the second device.

## Reset Password parameters

### `reset_password_confirm`

Used to skip the confirmation form to reset a password

#### Options

- `true` (default)
- `false`

#### When to use

Should not be used by relying parties.
Should only be used for accounts that must be reset.

### `emailToHashWith`

Allows you to override the default email that a reset password is hashed with.

#### Options

- user's current primary email (default)

#### When to use

After a user has changed their primary email you need to hash with the original account email
if they perform a reset password.

## Secondary email parameters

#### Options

- `true`
- `false` (default)

#### When to specify

- /settings/emails

[#prompt-none]: https://github.com/mozilla/fxa/blob/master/packages/fxa-auth-server/fxa-oauth-server/docs/prompt-none.md
