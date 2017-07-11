# DB API #

There are a number of methods that a DB storage backend should implement:

* Accounts (using `uid`)
    * .createAccount(uid, data)
    * .account(uid)
    * .checkPassword(uid, hash)
    * .verifyEmail(uid, emailCode)
    * .accountDevices(uid)
    * .resetAccount(uid, data)
    * .deleteAccount(uid)
    * .sessions(uid)
    * .accountEmails(uid)
    * .createEmail(uid, data)
    * .deleteEmail(uid, email)
    * .resetTokens(uid)
* Accounts (using `email`)
    * .emailRecord(emailBuffer)
    * .accountRecord(emailBuffer)
    * .accountExists(emailBuffer)
    * .getSecondaryEmail(emailBuffer)
    * .setPrimaryEmail(uid, emailBuffer)
* Session Tokens
    * .createSessionToken(tokenId, sessionToken)
    * .updateSessionToken(tokenId, sessionToken)
    * .sessionToken(id)
    * .sessionTokenWithVerificationStatus(tokenId)
    * .sessionWithDevice(tokenId)
    * .deleteSessionToken(tokenId)
* Key Fetch Tokens
    * .createKeyFetchToken(tokenId, keyFetchToken)
    * .keyFetchToken(id)
    * .keyFetchTokenWithVerificationStatus(tokenId)
    * .deleteKeyFetchToken(tokenId)
* Unverified session tokens and key fetch tokens
    * .verifyTokens(tokenVerificationId, accountData)
* Password Forgot Tokens
    * .createPasswordForgotToken(tokenId, passwordForgotToken)
    * .deletePasswordForgotToken(tokenId)
    * .passwordForgotToken(id)
    * .updatePasswordForgotToken(tokenId, token)
    * .forgotPasswordVerified(tokenId, accountResetToken)
* Password Change Tokens
    * .createPasswordChangeToken(tokenId, passwordChangeToken)
    * .passwordChangeToken(id)
    * .deletePasswordChangeToken(tokenId)
* Account Reset Tokens
    * .accountResetToken(id)
    * .deleteAccountResetToken(tokenId)
* Verification Reminders
    * .createVerificationReminder(body)
    * .fetchReminders(body, query)
    * .deleteReminder(body)
* Email Bounces
    * .createEmailBounce(body)
* Signin codes
    * .createSigninCode(code, uid, createdAt, flowId)
    * .consumeSigninCode(code)
* General
    * .ping()
    * .close()

## Types ##

# Parameters #

The types of each parameter is shown in brackets below. In some cases an extra clarification
is shown afterwards.

* number - a number (integer only)
* string - a string of undetermined length
* Buffer - a Buffer of undetermined length
* Buffer16 - a Buffer of length 16 bytes
* Buffer32 - a Buffer of length 32 bytes
* Buffer64 - a Buffer of length 64 bytes

The storage backends are not meant to be clever. They never infer anything and they shouldn't
default anything. The `fxa-auth-server` defaults everything it needs to. Backends shouldn't
default anything in code or in the datastore (either by default values or triggers).

Please note that when a parameter type is specified as `Buffer` you can choose whether to store as a binary type or as
a hex encoded string. This decision will depend on what your storage backend can do or if it is faster with one or the
other. e.g. the `mysql` backend stores these fields as `binary(??)`. The test `memory` backend stores these as
hex encoded strings.

# Promises #

All functions return a promise. Even if we are just returning a value it is wrapped
in a promise so that you can chain calls if you need to.

## .createAccount(uid, data) ##

Parameters:

* uid - (Buffer16) the uid of the account to be created - unique
* data:
    * email - (string)
    * normalizedEmail - (string) the same as above but `.toLowerCase()`
    * emailCode - (Buffer16)
    * emailVerified - (number) 0|1, to show whether an account has been verified
    * createdAt - (number) an epoch, such as that created with `Date.now()`
    * verifyHash - (Buffer32)
    * authSalt - (Buffer32)
    * wrapWrapKb - (Buffer32)
    * verifierSetAt - (number) an epoch, such as that created with `Date.now()`
    * verifierVersion - (number) currently always set to 1, may be 2 or more in the future

Returns:

* success - always returns an empty object when successful
* error (can be either):
    * a `error.duplicate()` if this uid already exists
    * an error from the underlying storage system

## .account(uid) ##

Parameters:

* uid - (Buffer16) the uid of the account to be created - unique

Returns:

* success - returns the account object above
* error (can be either):
    * a `error.notFound()` if this account does not exist
    * an error from the underlying storage system

## .checkPassword(uid, hash) ##

Parameters:

* uid - (Buffer16) the uid of the account to be queried
* hash:
    * verifyHash - (Buffer32)

Returns:

* resolves with:
    * an empty object `{}`
* rejects: with one of:
    * `error.notFound()` if the credentials are invalid
    * any error from the underlying storage engine

## .verifyEmail(uid, emailCode) ##

Parameters:

* uid - (Buffer16) the uid of the account to be queried
* emailCode - (Buffer16) the emailCode of the email to be verified

Returns:

* success - returns an empty object
* error:
    * an error from the underlying storage engine

We do not separate the fact that the account uid may not exist and always
resolve to an empty object. Verify Email will check both the account
and email table for specified emailCode and verify it.

## .accountDevices(uid) ##

Parameters:

* uid - (Buffer16) the uid of the account to be queried

Returns:

* success - an array of account devices (aka Session Tokens)
* error:
    * an error from the underlying storage engine (wrapped in error.wrap())

## .resetAccount(uid, data) ##

Resets the account specified by `uid` using the fields provided in `data`. Deletes all tokens
and devices related to this account.

Parameters:

* `uid` - (Buffer16) the uid of the account to be reset
* `data`:
    * verifyHash - (Buffer32)
    * authSalt - (Buffer32)
    * wrapWrapKb - (Buffer32)
    * verifierVersion - (number)

Returns:

* resolves with:
    * an empty object `{}`
* rejects with:
    * any errors from the underlying storage engine

EXCEPTION TO NOTES: currently the backend sets `verifierSetAt` to be `Date.now()`. This should be moved to the
`fxa-auth-server`.

## .deleteAccount(uid) ##

Deletes the account specified by `uid`
and all tokens and devices related to this account.

Parameters:

* `uid` - (Buffer16) the uid of the account to be reset

Returns:

* resolves with:
    * an empty object `{}`
* rejects with:
    * any errors from the underlying storage engine


## .sessions(uid) ##

Fetches all session tokens for a user,
without any of the secret data.

Parameters:

* `uid` - (Buffer16) the uid of the account to get sessions for

Returns:

* resolves with:
    * an array of incompletely-populated session tokens
* rejects with:
    * any errors from the underlying storage engine

## .accountEmails(uid) ##

    Fetches all the emails associated with the uid.

    Parameters:

    * `uid` - (Buffer16) the uid of the account to get emails for

    Returns:

    * resolves with:
        * an array of populated email records
    * rejects with:
        * any errors from the underlying storage engine

## .createEmail(uid, data) ##

    Creates a new email and associates it with the uid.

    Parameters:

    * `uid` - (Buffer16) the uid of the account to get emails for
    * `data`:
      * email - (string) email to create
      * normalizedEmail - (string) same as above but `.toLowerCase()`
      * emailCode - (Buffer16) email code
      * uid - (Buffer16) uid of the user
      * isVerified - (number) 0|1 flag for whether or not email is verified
      * isPrimary - (number) 0|1 flag for whether or not email is primary email

    Returns:

    * resolves with:
        * an empty object `{}`
    * rejects with:
        * any errors from the underlying storage engine

## .deleteEmail(uid, email) ##

    Deletes the associated email from the users account.

    Parameters:

    * `uid` - (Buffer16) the uid of the account to delete emails for
    * `email` - (string) the email to delete from user account

    Returns:

    * resolves with:
        * an empty object `{}`
    * rejects with:
        * any errors from the underlying storage engine
        
## .resetTokens(uid) ##

    Deletes all `accountResetTokens`, `passwordChangeTokens` and `passwordForgotTokens` from the asscociated `uid`.

    Parameters:

    * `uid` - (Buffer16) the uid of the account to delete tokens

    Returns:

    * resolves with:
        * an empty object `{}`
    * rejects with:
        * any errors from the underlying storage engine

## .emailRecord(emailBuffer) ##

Note: Using this method will emit a deprecation warning, please use `.accountRecord` instead.
This method only reads from the account table whereas `.accountRecord` checks the emails table and returns correct account record.

Gets the account record related to this (normalized) email address. The email is provided in a Buffer.

Parameters:

* emailBuffer: the email address will be a hex encoded string, which is converted back to a string, then
  `.toLowerCase()`. In the MySql backend we use `LOWER(?)` which uses the current locale for case-folding.

Returns:

* resolves with:
    * `account` - consisting of:
        * uid - (Buffer16)
        * email - (string)
        * normalizedEmail - (string)
        * emailVerified - 0|1
        * emailCode - (Buffer16)
        * kA - (Buffer32)
        * wrapWrapKb - (Buffer32)
        * verifierVersion - (number)
        * verifyHash - (Buffer32)
        * authSalt - (Buffer32)
        * verifierSetAt - (number) an epoch
* rejects: with one of:
    * `error.notFound()` if no account exists for this email address
    * any error from the underlying storage engine
    
## .accountRecord(emailBuffer) ##

Gets the account record related to this (normalized) email address by checking for email on emails table. 
The email is provided in a Buffer.

Parameters:

* emailBuffer: the email address will be a hex encoded string, which is converted back to a string, then
  `.toLowerCase()`. In the MySql backend we use `LOWER(?)` which uses the current locale for case-folding.

Returns:

* resolves with:
    * `account` - consisting of:
        * uid - (Buffer16)
        * email - (string)
        * normalizedEmail - (string)
        * emailVerified - 0|1
        * emailCode - (Buffer16)
        * kA - (Buffer32)
        * wrapWrapKb - (Buffer32)
        * verifierVersion - (number)
        * verifyHash - (Buffer32)
        * authSalt - (Buffer32)
        * verifierSetAt - (number) an epoch
        * primaryEmail - (string)
* rejects: with one of:
    * `error.notFound()` if no account exists for this email address
    * any error from the underlying storage engine

## .accountExists(email) ##

Checks if an account exists for this (normalized) email address.

Parameters:

* email: the email address will be a hex encoded string, which is converted back to a string, then `.toLowerCase()`. In
  the MySql backend we use `LOWER(?)` which uses the current locale for case-folding.

Returns:

* resolves with:
    * an empty object `{}`
* rejects: with one of:
    * `error.notFound()` if no account exists for this email address
    * any error from the underlying storage engine

## .getSecondaryEmail(emailBuffer) ##

Get the email entry associated with this `emailBuffer`. This email is located on the secondary email table.

Parameters:

* email: the email address will be a hex encoded string, which is converted back to a string, then `.toLowerCase()`. In
  the MySql backend we use `LOWER(?)` which uses the current locale for case-folding.

Returns:

* resolves with:
    * `email` - consisting of:
        * uid - (Buffer16)
        * email - (string)
        * emailCode - (Buffer16)
        * isPrimary - (boolean)
        * isVerified - (boolean)
        * normalizedEmail - (string)        
        * createdAt - (number)
* rejects: with one of:
    * `error.notFound()` if no email address exists on emails table
    * any error from the underlying storage engine

## .setPrimaryEmail(uid, emailBuffer) ##

Sets the primary email address as `emailBuffer` for account with `uid`.

Parameters:

* uid: the uid of the account
* email: the normalized email address that will be the new primary email

Returns:

* resolves with:
    * an empty object `{}`
* rejects: with one of:
    * `error.notFound()` if no email address exists on emails table
    * any error from the underlying storage engine
    
## Tokens ##

All tokens (sessionTokens, keyFetchTokens, passwordForgotTokens, passwordChangeTokens, accountResetTokens) have three
functions which all work similarly. For example, the `sessionTokens` have:

### .createSessionToken(tokenId, token) ###
### .createKeyFetchToken(tokenId, token) ###
### .createPasswordChangeToken(tokenId, token) ###
### .createPasswordForgotToken(tokenId, token) ###

Parameters.

* tokenId : (Buffer32) the unique id for this token
* token : (Object) the fields to be stored in the token (see below for each token type)

Each token takes the following fields for it's create method respectively:

* sessionToken : data, uid, createdAt, uaBrowser, uaBrowserVersion, uaOS, uaOSVersion, uaDeviceType,
                 mustVerify, tokenVerificationId
* keyFetchToken : authKey, uid, keyBundle, createdAt, tokenVerificationId
* passwordChangeToken : data, uid, createdAt
* passwordForgotToken : data, uid, passCode, createdAt, triesxb

Returns:

* resolves with:
    * an object `{}`
* rejects with:
    * `error.duplicate()` if a token already exists with the same `tokenId`
    * any error from the underlying storage system (wrapped in `error.wrap()`

Note: for some tokens there should only ever be one row per `uid`. This applies to `accountResetTokens`,
`passwordForgotTokens` and `passwordChangeTokens`. In the MySql driver we currently use `REPLACE INTO ...` so you
should do something equivalent with your storage backend.

### .sessionToken(tokenId) ###
### .sessionTokenWithVerificationStatus(tokenId) ###
### .keyFetchToken(tokenId) ###
### .keyFetchTokenWithVerificationStatus(tokenId) ###
### .passwordChangeToken(tokenId) ###
### .passwordForgotToken(tokenId) ###
### .accountResetToken(tokenId) ###

Parameters:

* `tokenId` - (Buffer32) the id of the token to retrieve

Returns:

* resolves with:
    * an object `{ ... }` with the relevant field (see below)
* rejects with:
    * `error.notFound()` if this token does not exist
    * any error from the underlying storage system (wrapped in `error.wrap()`

Each token returns different fields.
These fields are represented as
`t.*` for a field from the token,
`a.*` for a field from the corresponding account and
`ut.*` for a field from `unverifiedTokens`.

* sessionToken : t.tokenData, t.uid, t.createdAt, t.uaBrowser, t.uaBrowserVersion,
                 t.uaOS, t.uaOSVersion, t.uaDeviceType, t.lastAccessTime,
                 a.emailVerified, a.email, a.emailCode, a.verifierSetAt,
                 a.createdAt AS accountCreatedAt
* sessionTokenWithVerificationStatus : t.tokenData, t.uid, t.createdAt, t.uaBrowser, t.uaBrowserVersion,
                                       t.uaOS, t.uaOSVersion, t.uaDeviceType, t.lastAccessTime,
                                       a.emailVerified, a.email, a.emailCode, a.verifierSetAt,
                                       a.createdAt AS accountCreatedAt, ut.mustVerify, ut.tokenVerificationId
* keyFetchToken : t.authKey, t.uid, t.keyBundle, t.createdAt, a.emailVerified, a.verifierSetAt
* keyFetchTokenWithVerificationStatus : t.authKey, t.uid, t.keyBundle, t.createdAt, a.emailVerified,
                                        a.verifierSetAt, ut.mustVerify, ut.tokenVerificationId
* passwordChangeToken : t.tokenData, t.uid, t.createdAt, a.verifierSetAt
* passwordForgotToken : t.tokenData, t.uid, t.createdAt, t.passCode, t.tries, a.email, a.verifierSetAt
* accountResetToken : t.uid, t.tokenData, t.createdAt, a.verifierSetAt

### .deleteSessionToken(tokenId) ###
### .deleteKeyFetchToken(tokenId) ###
### .deletePasswordChangeToken(tokenId) ###
### .deletePasswordForgotToken(tokenId) ###
### .deleteAccountResetToken(tokenId) ###

Will delete the token of the correct type designated by the given `tokenId`.
For `sessionTokens`,
associated records in `devices` and `unverifiedTokens`
will also be deleted.
For `keyFetchTokens`,
associated records in `unverifiedTokens`
will also be deleted.


## .updateSessionToken(tokenId, token) ##

An extra function for `sessionTokens`. Just updates the `uaBrowser`, `uaBrowserVersion`, `uaOS`, `uaOSVersion`, `uaDeviceType` and `lastAccessTime` fields of the token.

Parameters.

* tokenId : (Buffer32) the unique id for this token
* token : (Object) -
    * uaBrowser : (string)
    * uaBrowserVersion : (string)
    * uaOS : (string)
    * uaOSVersion : (string)
    * uaDeviceType : (string)
    * lastAccessTime : (number)

Returns:

* resolves with:
    * an object `{}` (regardless of whether a row was updated or not, ie. even if `tokenId` does not exist.)
* rejects with:
    * any error from the underlying storage system (wrapped in `error.wrap()`)

## .updatePasswordForgotToken(tokenId, token) ##

An extra function for `passwordForgotTokens`. Just updates the `tries` field of the token.

Parameters.

* tokenId : (Buffer32) the unique id for this token
* token : (Object) -
    * tries : (number)

Returns:

* resolves with:
    * an object `{}` (regardless of whether a row was updated or not, ie. even if `tokenId` does not exist.)
* rejects with:
    * any error from the underlying storage system (wrapped in `error.wrap()`)

## .verifyTokens(tokenVerificationId, accountData)

Verifies sessionTokens and keyFetchTokens.
Note that it takes the tokenVerificationId
specified when creating the token,
NOT the tokenId.
`accountData` is an object
with a `uid` property.

Returns a promise that:

* Resolves with an object `{}`
  if a token was verified.
* Rejects with error `{ code: 404, errno: 116 }`
  if there was no matching token.
* Rejects with any error
  from the underlying storage system
  (wrapped in `error.wrap()`).

## .forgotPasswordVerified(tokenId, accountResetToken) ##

An extra function for `passwordForgotTokens`. This performs three operations:

1. deletes the `passwordForgotToken` corresponding to the `tokenId`
2. creates an `accountResetToken` corresponding to the fields specified in `accountResetToken`
3. sets the `emailVerified` fields of `accounts` to true specified by the `uid` in the `accountResetToken`

Parameters:

* tokenId : (Buffer32) the unique id for this token
* accountResetToken: (object)
    * tokenId
    * data
    * uid
    * createdAt

## .sessionWithDevice(tokenId) ##

Get the sessionToken
with its verification state
and matching device info.

Parameters:

* `tokenId` - (Buffer32) the id of the token to retrieve

Returns:

* resolves with:
    * an object `{ ... }` with the relevant field (see below)
* rejects with:
    * `error.notFound()` if this token does not exist
    * any error from the underlying storage system (wrapped in `error.wrap()`

These fields are represented as
`t.*` for a field from the token,
`a.*` for a field from the corresponding account,
`d.*` for a field from `devices` and
`ut.*` for a field from `unverifiedTokens`.

The deviceCallbackPublicKey and deviceCallbackAuthKey fields are urlsafe-base64 strings, you can learn more about their format [here](https://developers.google.com/web/updates/2016/03/web-push-encryption).

* sessionToken : t.tokenData, t.uid, t.createdAt, t.uaBrowser, t.uaBrowserVersion,
                 t.uaOS, t.uaOSVersion, t.uaDeviceType, t.lastAccessTime,
                 a.emailVerified, a.email, a.emailCode, a.verifierSetAt,
                 a.createdAt AS accountCreatedAt, d.id AS deviceId,
                 d.name AS deviceName, d.type AS deviceType,
                 d.createdAt AS deviceCreatedAt, d.callbackURL AS deviceCallbackURL,
                 d.callbackPublicKey AS deviceCallbackPublicKey,
                 d.callbackAuthKey AS deviceCallbackAuthKey, ut.mustVerify, ut.tokenVerificationId

## .createVerificationReminder(body) ##

Creates a new verification reminder for some `uid` and some reminder `type`.

Parameters:

* body: (object)
  * uid : user id
  * type : type of reminder

## .fetchReminders(body, query) ##

Fetch verification reminders based on `reminderTime` and `type`.

Parameters:

* body: (object)
* query: (object)
  * reminderTime : Milliseconds since account creation after which the first reminder is sent
  * reminderTimeOutdated : Milliseconds since account creation after which the reminder should not be sent
  * type : Type of the reminder
  * limit : Number of reminders to fetch

## .deleteReminder(body) ##

Delete the verification reminder based on `uid` and `type`.

Parameters:

* body: (object)
  * uid : user id
  * type : type of reminder

## .createEmailBounce(body) ##

Record when an email bounce has occurred.

Parameters:

* body: (object)
  * email: A string of the email address that bounced
  * bounceType: The bounce type ([`'Permanent'`, `'Transient'`, `'Complaint'`])
  * bounceSubType: The bounce sub type string

## .createSigninCode(code, uid, createdAt, flowId)

Create a user-specific, time-limited, single-use code
that can be used for expedited sign-in.

Parameters:

* `code` (Buffer):
  The value of the code
* `uid` (Buffer16):
  The uid for the relevant user
* `createdAt` (number):
  Creation timestamp for the code, milliseconds since the epoch
* `flowId` (Buffer32):
  The flow id of the originating flow.

## .consumeSigninCode(code)

Use (and delete) a sign-in code.

Parameters:

* `code` (Buffer):
  The value of the code
