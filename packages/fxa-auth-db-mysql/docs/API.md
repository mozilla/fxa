# DB API #

There are a number of methods that a DB storage backend should implement:

* Accounts (using `uid`)
    * .createAccount(uid, data)
    * .account(uid)
    * .checkPassword(uid, hash)
    * .verifyEmail(uid)
    * .accountDevices(uid)
    * .resetAccount(uid, data)
    * .deleteAccount(uid)
    * .sessions(uid)
* Accounts (using `email`)
    * .emailRecord(emailBuffer)
    * .accountExists(emailBuffer)
* Session Tokens
    * .createSessionToken(tokenId, sessionToken)
    * .updateSessionToken(tokenId, sessionToken)
    * .sessionToken(id)
    * .sessionTokenVerified(tokenId)
    * .sessionWithDevice(tokenId)
    * .deleteSessionToken(tokenId)
* Key Fetch Tokens
    * .createKeyFetchToken(tokenId, keyFetchToken)
    * .keyFetchToken(id)
    * .keyFetchTokenVerified(tokenId)
    * .deleteKeyFetchToken(tokenId)
* Unverified session tokens and key fetch tokens
    * .verifyTokens(tokenVerificationId)
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
    * .createAccountResetToken(tokenId, accountResetToken)
    * .accountResetToken(id)
    * .deleteAccountResetToken(tokenId)
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

## .verifyEmail(uid) ##

Parameters:

* uid - (Buffer16) the uid of the account to be queried

Returns:

* success - returns an empty object
* error:
    * an error from the underlying storage engine

We do not separate the fact that the account uid may not exist and always
resolve to an empty object.

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

Deletes the account specified by `uid` and deletes all tokens related to this account.

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

## .emailRecord(emailBuffer) ##

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

## Tokens ##

All tokens (sessionTokens, keyFetchTokens, passwordForgotTokens, passwordChangeTokens, accountResetTokens) have three
functions which all work similarly. For example, the `sessionTokens` have:

### .createSessionToken(tokenId, token) ###
### .createKeyFetchToken(tokenId, token) ###
### .createPasswordChangeToken(tokenId, token) ###
### .createPasswordForgotToken(tokenId, token) ###
### .createAccountResetToken(tokenId, token) ###

Parameters.

* tokenId : (Buffer32) the unique id for this token
* token : (Object) the fields to be stored in the token (see below for each token type)

Each token takes the following fields for it's create method respectively:

* sessionToken : data, uid, createdAt, uaBrowser, uaBrowserVersion, uaOS, uaOSVersion, uaDeviceType,
                 tokenVerificationId
* keyFetchToken : authKey, uid, keyBundle, createdAt, tokenVerificationId
* passwordChangeToken : data, uid, createdAt
* passwordForgotToken : data, uid, passCode, createdAt, triesxb
* accountResetToken : data, uid, createdAt

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
### .sessionTokenVerified(tokenId) ###
### .keyFetchToken(tokenId) ###
### .keyFetchTokenVerified(tokenId) ###
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

Each token returns different fields. These fields are represented as `t.*` for a field
from the token and `a.*` for a field from the corresponding account.

* sessionToken : t.tokenData, t.uid, t.createdAt, t.uaBrowser, t.uaBrowserVersion,
                 t.uaOS, t.uaOSVersion, t.uaDeviceType, t.lastAccessTime,
                 a.emailVerified, a.email, a.emailCode, a.verifierSetAt,
                 a.createdAt AS accountCreatedAt
* sessionTokenVerified : t.tokenData, t.uid, t.createdAt, t.uaBrowser, t.uaBrowserVersion,
                         t.uaOS, t.uaOSVersion, t.uaDeviceType, t.lastAccessTime,
                         a.emailVerified, a.email, a.emailCode, a.verifierSetAt,
                         a.createdAt AS accountCreatedAt, ut.tokenVerificationId
* keyFetchToken : t.authKey, t.uid, t.keyBundle, t.createdAt, a.emailVerified, a.verifierSetAt
* keyFetchTokenVerified : t.authKey, t.uid, t.keyBundle, t.createdAt, a.emailVerified,
                          a.verifierSetAt, ut.tokenVerificationId
* passwordChangeToken : t.tokenData, t.uid, t.createdAt, a.verifierSetAt
* passwordForgotToken : t.tokenData, t.uid, t.createdAt, t.passCode, t.tries, a.email, a.verifierSetAt
* accountResetToken : t.uid, t.tokenData, t.createdAt, a.verifierSetAt

### .deleteSessionToken(tokenId) ###
### .deleteKeyFetchToken(tokenId) ###
### .deletePasswordChangeToken(tokenId) ###
### .deletePasswordForgotToken(tokenId) ###
### .deleteAccountResetToken(tokenId) ###

Will delete the token of the correct type designated by the given `tokenId`.

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
    * an object `{}` (whether a row was updated or not, ie. even if `tokenId` does not exist.)
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
    * an object `{}` (whether a row was updated or not, ie. even if `tokenId` does not exist.)
* rejects with:
    * any error from the underlying storage system (wrapped in `error.wrap()`)

## .verifyTokens(tokenVerificationId, token)

Verifies sessionTokens and keyFetchTokens.
Note that it takes the tokenVerificationId
specified when creating the token,
NOT the tokenId.

Returns a promise that:

* resolves with an object `{}`
  (whether a row was updated or not,
  i.e. even if `tokenVerificationId` does not exist).
* rejects with any error from the underlying storage system
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
    * createdA

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

These fields are represented as `t.*` for a field from the token `a.*` for a
field from the corresponding account and `d.*` for a field from devices.

The deviceCallbackPublicKey and deviceCallbackAuthKey fields are urlsafe-base64 strings, you can learn more about their format [here](https://developers.google.com/web/updates/2016/03/web-push-encryption).

* sessionToken : t.tokenData, t.uid, t.createdAt, t.uaBrowser, t.uaBrowserVersion,
                 t.uaOS, t.uaOSVersion, t.uaDeviceType, t.lastAccessTime,
                 a.emailVerified, a.email, a.emailCode, a.verifierSetAt,
                 a.createdAt AS accountCreatedAt, d.id AS deviceId,
                 d.name AS deviceName, d.type AS deviceType,
                 d.createdAt AS deviceCreatedAt, d.callbackURL AS deviceCallbackURL,
                 d.callbackPublicKey AS deviceCallbackPublicKey,
                 d.callbackAuthKey AS deviceCallbackAuthKey, ut.tokenVerificationId

(Ends)
