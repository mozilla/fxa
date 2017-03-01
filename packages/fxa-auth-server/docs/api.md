# Firefox Accounts Server API

This document provides protocol-level details of the Firefox Accounts Server API.  For a prose description of the client/server protocol and details on how each parameter is derived see the [API design document](https://wiki.mozilla.org/Identity/AttachedServices/KeyServerProtocol).

---

# Overview

## URL Structure

All requests will be to URLs for the form:

    https://<server-url>/v1/<api-endpoint>

Note that:

* All API access must be over a properly-validated HTTPS connection.
* The URL embeds a version identifier "v1"; future revisions of this API may introduce new version numbers.
* The base URL of the server may be configured on a per-client basis:
  * For a list of development servers see [Firefox Accounts deployments on MDN](https://developer.mozilla.org/en-US/Firefox_Accounts#Firefox_Accounts_deployments).
  * The canonical URL for Mozilla's hosted Firefox Accounts server is TODO-DEFINE-ME.


## Request Format

Requests that require authentication use [Hawk](https://github.com/hueniverse/hawk) request signatures.
These endpoints are marked :lock: in the description below.

All POST requests must have a content-type of `application/json` with a utf8-encoded JSON body, and must specify the content-length header.  Keys and other binary data are included in the JSON as base16 encoded strings.

The following request headers may be specified to influence the behaviour of the server:

* `Accept-Language`:  may be used to localize verification emails


## Response Format

All successful requests will produce a response with HTTP status code of "200" and content-type of "application/json".  The structure of the response body will depend on the endpoint in question.

Successful responses will also include the following headers, which may be useful for the client:

* `Timestamp`:  the current POSIX timestamp as seen by the server, in integer seconds.


Failures due to invalid behavior from the client will produce a response with HTTP status code in the "4XX" range and content-type of "application/json".  Failures due to an unexpected situation on the server will produce a response with HTTP status code in the "5XX" range and content-type of "application/json".

To simplify error handling for the client, the type of error is indicated both by a particular HTTP status code, and by an application-specific error code in the JSON response body.  For example:

```js
{
  "code": 400, // matches the HTTP status code
  "errno": 107, // stable application-level error number
  "error": "Bad Request", // string description of the error type
  "message": "the value of salt is not allowed to be undefined",
  "info": "https://docs.dev.lcip.og/errors/1234" // link to more info on the error
}
```

Responses for particular types of error may include additional parameters.

The currently-defined error responses are:

* status code 400, errno 101:  attempt to create an account that already exists
* status code 400, errno 102:  attempt to access an account that does not exist
* status code 400, errno 103:  incorrect password
* status code 400, errno 104:  attempt to operate on an unverified account
* status code 400, errno 105:  invalid verification code
* status code 400, errno 106:  request body was not valid json
* status code 400, errno 107:  request body contains invalid parameters
* status code 400, errno 108:  request body missing required parameters
* status code 401, errno 109:  invalid request signature
* status code 401, errno 110:  invalid authentication token
* status code 401, errno 111:  invalid authentication timestamp
* status code 411, errno 112:  content-length header was not provided
* status code 413, errno 113:  request body too large
* status code 429, errno 114:  client has sent too many requests (see [backoff protocol](#backoff-protocol))
* status code 401, errno 115:  invalid authentication nonce
* status code 410, errno 116:  endpoint is no longer supported
* status code 400, errno 117:  incorrect login method for this account
* status code 400, errno 118:  incorrect key retrieval method for this account
* status code 400, errno 119:  incorrect API version for this account
* status code 400, errno 120:  incorrect email case
* status code 400, errno 121:  account is locked (no longer used)
* status code 400, errno 122:  account is not locked (no longer used)
* status code 400, errno 123:  unknown device
* status code 400, errno 124:  session already registered by another device
* status code 400, errno 125:  request blocked for security reasons
* status code 400, errno 126:  account must be reset
* status code 400, errno 127:  invalid unblock code
* status code 400, errno 128:  missing token (no longer used)
* status code 400, errno 129:  invalid phone number
* status code 400, errno 130:  invalid region
* status code 400, errno 131:  invalid message id
* status code 400, errno 132:  message rejected
* status code 503, errno 201:  service temporarily unavailable to due high load (see [backoff protocol](#backoff-protocol))
* status code 503, errno 202:  feature has been disabled for operational reasons
* any status code, errno 999:  unknown error

The follow error responses include additional parameters:

* errno 111:  a `serverTime` parameter giving the current server time in seconds.
* errno 114:  a `retryAfter` parameter indicating how long the client should wait before re-trying.
* errno 120:  an `email` parameter indicating the case used to create the account.
* errno 130:  a `region` parameter indicating the region code that was deemed invalid.
* errno 132:  `reason` and `reasonCode` parameters indicating why the message was rejected
  (see [nexmo docs](https://docs.nexmo.com/messaging/sms-api/api-reference#status-codes)).
* errno 201:  a `retryAfter` parameter indicating how long the client should wait before re-trying.


## Responses from Intermediary Servers

Since this is a HTTP-based protocol, clients should be prepared to gracefully handle standard HTTP error responses that may be produced by proxies, load-balancers, or other intermediary servers.  Non-application responses can be identified by their lack of properly-formatted JSON response body.  Common examples would include:

* "413 Request Entity Too Large" may be produced by an upstream proxy server.
* "502 Gateway Timeout" may be produced by a load-balancer if it cannot contact the application servers.

---

# API Endpoints

* Account
    * [POST /v1/account/create](#post-v1accountcreate)
    * [GET  /v1/account/status](#get-v1accountstatus)
    * [POST /v1/account/status](#post-v1accountstatus)
    * [GET  /v1/account/keys (:lock: keyFetchToken) (verf-required)](#get-v1accountkeys)
    * [GET  /v1/account/profile (:lock: oauthBearerToken)](#get-v1accountprofile)
    * [POST /v1/account/reset (:lock: accountResetToken)](#post-v1accountreset)
    * [POST /v1/account/destroy](#post-v1accountdestroy)

* Authentication
    * [POST /v1/account/login](#post-v1accountlogin)
    * [POST /v1/account/send_unblock_code](#post-v1accountloginsend_unblock_code)
    * [POST /v1/account/reject_unblock_code](#post-v1accountloginreject_unblock_code)

* Session
    * [GET /v1/session/status (:lock: sessionToken)](#get-v1sessionstatus)
    * [POST /v1/session/destroy (:lock: sessionToken)](#post-v1sessiondestroy)

* Recovery Email
    * [GET  /v1/recovery_email/status (:lock: sessionToken)](#get-v1recovery_emailstatus)
    * [POST /v1/recovery_email/resend_code (:lock: sessionToken)](#post-v1recovery_emailresend_code)
    * [POST /v1/recovery_email/verify_code](#post-v1recovery_emailverify_code)

* Certificate Signing
    * [POST /v1/certificate/sign (:lock: sessionToken) (verf-required)](#post-v1certificatesign)

* Password
    * [POST /v1/password/change/start](#post-v1passwordchangestart)
    * [POST /v1/password/change/finish (:lock: passwordChangeToken)](#post-v1passwordchangefinish)
    * [POST /v1/password/forgot/send_code](#post-v1passwordforgotsend_code)
    * [POST /v1/password/forgot/resend_code (:lock: passwordForgotToken)](#post-v1passwordforgotresend_code)
    * [POST /v1/password/forgot/verify_code (:lock: passwordForgotToken)](#post-v1passwordforgotverify_code)
    * [GET /v1/password/forgot/status (:lock: passwordForgotToken)](#get-v1passwordforgotstatus)

* Device registration
    * [POST /v1/account/device (:lock: sessionToken)](#post-v1accountdevice)
    * [GET /v1/account/devices (:lock: sessionToken)](#get-v1accountdevices)
    * [POST /v1/account/devices/notify (:lock: sessionToken)](#post-v1accountdevicesnotify)
    * [POST /v1/account/device/destroy (:lock: sessionToken)](#post-v1accountdevicedestroy)

* Send SMS
    * [POST /v1/sms (:lock: sessionToken)](#post-v1sms)
    * [GET /v1/sms/status (:lock: sessionToken)](#get-v1smsstatus)

* Miscellaneous
    * [POST /v1/get_random_bytes](#post-v1get_random_bytes)


## POST /v1/account/create

Creates a user account. The client provides the email address with which this account will be labeled and a stretched password. Stretching is detailed on the [onepw](https://github.com/mozilla/fxa-auth-server/wiki/onepw-protocol#creating-the-account) wiki page.

This endpoint may send a verification email to the user.  Callers may optionally provide the `service` parameter to indicate what Identity-Attached Service they are acting on behalf of.  This is an opaque alphanumeric token which will be embedded in the verification link as a query parameter.

Creating an account also logs in. The response contains a `sessionToken` and optionally a `keyFetchToken` if the url has a query parameter of `keys=true`.

___Parameters___

* email - the primary email for this account
* authPW - the PBKDF2/HKDF stretched password as a hex string
* service - (optional) opaque alphanumeric token to be included in verification links
* redirectTo - (optional) a URL that the client should be redirected to after handling the request
* resume - (optional) opaque url-encoded string that will be included in the verification link as a querystring parameter, useful for continuing an OAuth flow for example.
* preVerifyToken - (optional) see below

### Request

```sh
curl -v \
-X POST \
-H "Content-Type: application/json" \
"https://api-accounts.dev.lcip.org/v1/account/create?keys=true" \
-d '{
  "email": "me@example.com",
  "authPW": "996bc6b1aa63cd69856a2ec81cbf19d5c8a604713362df9ee15c2bf07128efab"
}'
```

### Response

Successful requests will produce a "200 OK" response with the account's unique identifier in the JSON body:

```json
{
  "uid": "4c352927cd4f4a4aa03d7d1893d950b8",
  "sessionToken": "27cd4f4a4aa03d7d186a2ec81cbf19d5c8a604713362df9ee15c4f4a4aa03d7d",
  "keyFetchToken": "7d1893d950b8cd69856a2ec81cbfd7d1893d950b3362df9e56a2ec81cbf19d5c",
  "authAt": 1392144866
}
```

* authAt - authentication time for the session (seconds since epoch)

Failing requests may be due to the following errors:

* status code 400, errno 101:  attempt to create an account that already exists
* status code 400, errno 105:  invalid verification code
* status code 400, errno 106:  request body was not valid json
* status code 400, errno 107:  request body contains invalid parameters
* status code 400, errno 108:  request body missing required parameters
* status code 411, errno 112:  content-length header was not provided
* status code 413, errno 113:  request body too large

### preVerifyToken

A `preVerifyToken` is a signed [JWT](http://tools.ietf.org/html/draft-ietf-oauth-json-web-token-25) that certifies that the given email address has already been verified by the issuer.

___JOSE Header___

* alg - algorithm used to sign this JWT, currently only "RS256" is supported
* kid - key id of the JWK used to sign this JWT
* jku - the url of a [JWK set](http://tools.ietf.org/html/draft-ietf-jose-json-web-key-31#section-5) containing the public key used to sign this JWT (must be https)
  * example url: `https://nightly.dev.lcip.org/.well-known/public-keys`
  * example jwk set response:

```json
{
  "keys":[
  {
    "kid":"dev-1",
    "use": "sig",
    "kty":"RSA",
    "n":"W_lCUvksZMVxW2JLNtoyPPshvSHng28H5FggSBGBjmzv3eHkMgRdc8hpOkgcPwXYxHdVM6udtVdXZtbGN8nUyQX8gxD3AJg-GSrH3UOsoArPLCmcxwIEpk4B0wqwP68oK8dQHt0iK3N-XeCnMpv75ULlVn3LEOZT8CsuNraVOthYeClUb8r1PjRwqRB06QGNqnnhcPMmh-6cRzQ9HmTMz6CDcugiH5n2sjrvpeBugEsnXt3KpzVdSc4usXrIEmLRuFjwFbkzoo7FiAtSoXxBqc074qz8ejm-V0-2Wv3p6ePeLODeYkPQho4Lb1TBdoidr9RHY29Out4mhzb4nUrHHQ",
    "e":"AQAB"
  }]
}
```

___Payload___

* exp - expiration timestamp
* aud - the public DNS name of the auth-server. ex: api.accounts.firefox.com
* sub - the preverified email address
* typ - must be `"mozilla/fxa/preVerifyToken/v1"`

___Example___

```
{
  //...
  "preVerifyToken": "eyJhbGciOiJSUzI1NiIsImprdSI6Imh0dHA6Ly8xMjcuMC4wLjE6OTAwMC8ud2VsbC1rbm93bi9wdWJsaWMta2V5cyIsImtpZCI6ImRldi0xIn0.eyJpc3MiOiIxMjcuMC4wLjEiLCJleHAiOjE0MDkyNjE0NTc0NjIsImF1ZCI6IjEyNy4wLjAuMTo5MDAwIiwic3ViIjoiMC45Njg5NDI5MzQ4ODAwMzMxQGV4YW1wbGUuY29tIn0.541e3ebad20241f4247d483a4ca5b90ab6820d033ed6ff8c3fc0ac399b16ff045c2eb3f28ba83220b726de36c4f928e56664ba22fe470f6850bc3db690c17a1720e8ed5de927896d706ac7b26df90ca146225cfeaa64fb45f0ef0f0f2b06a76c5b763612c6544ba43c82630a26b5aea1675437719a86c264d81ffa71176596731f6c9223c66d959f02beffd3a715c91653c46fdf8f80f155905a468c3d2eadbb2f42ebde5ed8e4eff1f1b5557686ba60364fe6f4fd6d018c980ac91150086b3d3716d363d1c19953a80cf2f246e842b2a480126c116696eab003e6b0abb6ffe4633cdbda09a81c47ed8c7515c4dd37566d6ab1b2b3b9deebda7f45d40dd0f0f4"
}
```

## GET /v1/account/status

Gets the status of an account

### Request

```sh
curl -v "https://api-accounts.dev.lcip.org/v1/account/status?uid=4c352927cd4f4a4aa03d7d1893d950b8"
```

### Response

Successful requests will produce a "200 OK" response with the account status provided in the JSON body:

```json
{
  "exists": true
}
```

Failing requests may be due to the following errors:

* status code 400, errno 107:  request query contains invalid parameters
* status code 400, errno 108:  request query missing required parameters

## POST /v1/account/status

Gets the status of an account without exposing user data through query params. This
endpoint is rate limited by the [fxa-customs-server]()

___Parameters___

* email - the primary email for this account

### Request

```sh
curl -v \
-X POST \
-H "Content-Type: application/json" \
"https://api-accounts.dev.lcip.org/v1/account/status" \
-d '{
  "email": "me@example.com"
}'
```

### Response

Successful requests will produce a "200 OK" response with the account status provided in the JSON body:

```json
{
  "exists": true
}
```

Failing requests may be due to the following errors:

* status code 400, errno 107:  request query contains invalid parameters
* status code 429, errno 114:  client has sent too many requests

## POST /v1/account/login

Obtain a `sessionToken` and optionally a `keyFetchToken` by adding the query parameter `keys=true`.

___Parameters___

* email - the primary email for this account
* authPW - the PBKDF2/HKDF stretched password as a hex string
* service - (optional) opaque alphanumeric token to be included in verification links
* reason - (optional) alphanumeric string indicating the reason for establishing a new session; may be "login" (the default) or "reconnect"
* unblockCode - (optional) alphanumeric code used to unblock certain  rate-limitings

### Request

```sh
curl -v \
-X POST \
-H "Content-Type: application/json" \
https://api-accounts.dev.lcip.org/v1/account/login?keys=true \
-d '{
  "email": "me@example.com",
  "authPW": "996bc6b1aa63cd69856a2ec81cbf19d5c8a604713362df9ee15c2bf07128efab"
}'
```

### Response

Successful requests will produce a "200 OK" and a json body. `keyFetchToken` and `verificationReason` will only be present if `keys=true` was specified.

```json
{
  "uid": "4c352927cd4f4a4aa03d7d1893d950b8",
  "sessionToken": "27cd4f4a4aa03d7d186a2ec81cbf19d5c8a604713362df9ee15c4f4a4aa03d7d",
  "keyFetchToken": "7d1893d950b8cd69856a2ec81cbfd7d1893d950b3362df9e56a2ec81cbf19d5c",
  "verified": false,
  "authAt": 1392144866,
  "verificationReason": "login",
  "verificationMethod": "email"
}
```

* authAt - authentication time for the session (seconds since epoch)
* verificationReason - authentication method that was requested that required additional verification (Currently, only `login`)
* verificationMethod - the medium for how the user can verify (Currently, only `email`)

Failing requests may be due to the following errors:

* status code 400, errno 102:  attempt to access an account that does not exist
* status code 400, errno 103:  incorrect password
* status code 400, errno 106:  request body was not valid json
* status code 400, errno 107:  request body contains invalid parameters
* status code 400, errno 108:  request body missing required parameters
* status code 411, errno 112:  content-length header was not provided
* status code 413, errno 113:  request body too large
* status code 400, errno 120:  incorrect email case
* status code 400, errno 126:  account must be reset
* status code 400, errno 127:  invalid unblock code


## POST /v1/account/login/send_unblock_code

Send an unblock code to a provided email to reset rate-limiting.

___Parameters___

* email - the primary email for this account

### Request

```sh
curl -v \
-X POST \
-H "Content-Type: application/json" \
https://api-accounts.dev.lcip.org/v1/account/login/send_unblock_code \
-d '{
  "email": "me@example.com"
}'
```

### Response

Successful requests will produce a "200 OK" and an empty json body.

```json
{}
```


## POST /v1/account/login/reject_unblock_code

Used to reject and report an unblock code that was sent to a user

___Parameters___

* uid - the user id
* unblockCode - the unblock code

### Request

```sh
curl -v \
-X POST \
-H "Content-Type: application/json" \
https://api-accounts.dev.lcip.org/v1/account/login/reject_unblock_code \
-d '{
  "uid": "4c352927cd4f4a4aa03d7d1893d950b8",
  "unblockCode": "A1B2C3D4"
}'
```

### Response

Successful requests will produce a "200 OK" and an empty json body.

```json
{}
```


## GET /v1/account/keys

:lock: HAWK-authenticated with keyFetchToken

Get the base16 bundle of encrypted `kA|wrapKb`. The return value must be decrypted with a key derived from keyFetchToken, and then `wrapKb` must be further decrypted with a key derived from the user's password.

Since keyFetchToken is single-use, this can only be done once per session. Note that the keyFetchToken is consumed regardless of whether the request succeeds or fails.

This request will fail unless the account's email address and current session has been verified.

### Request

___Headers___

The request must include a HAWK header that authenticates the request using a `keyFetchToken` received from `/session/create`.

```sh
curl -v \
-X GET \
-H "Host: api-accounts.dev.lcip.org" \
-H "Content-Type: application/json" \
-H 'Authorization: Hawk id="d4c5b1e3f5791ef83896c27519979b93a45e6d0da34c7509c5632ac35b28b48d", ts="1373391043", nonce="ohQjqb", mac="LAnpP3P2PXelC6hUoUaHP72nCqY5Iibaa3eeiGBqIIU="' \
https://api-accounts.dev.lcip.org/v1/account/keys \
```

### Response

Successful requests will produce a "200 OK" response with the key data provided in the JSON body as hex-encoded bytes:

```json
{
  "bundle": "d486e79c9f3214b0010fe31bfb50fa6c12e1d093f7770c81c6b1c19c7ee375a6558dd1ab38dbc5eba37bc3cfbd6ac040c0208a48ca4f777688a1017e98cedcc1c36ba9c4595088d28dcde5af04ae2215bce907aa6e74dd68481e3edc6315d47efa6c7b6536e8c0adff9ca426805e9479607b7c105050f1391dffed2a9826b8ad"
}
```

See [decrypting the bundle](https://wiki.mozilla.org/Identity/AttachedServices/KeyServerProtocol#Decrypting_the_getToken2_Response)
for info on how to extract `kA|wrapKb` from the bundle.

Failing requests may be due to the following errors:

* status code 400, errno 104:  attempt to operate on an unverified account
* status code 401, errno 109:  invalid request signature
* status code 401, errno 110:  invalid authentication token
* status code 401, errno 111:  invalid authentication timestamp
* status code 401, errno 115:  invalid authentication nonce

## GET /v1/account/profile

:lock: OAuth Bearer token, or HAWK-authenticated with sessionToken

Get the email and locale of a user.

If an OAuth Bearer token is used, the values returned depend on the
scopes that the token is authorized for.

- `email` requires `profile:email` scope
- `locale` require `profile:locale` scope

The `profile` scope includes both of the above sub-scopes.

### Request

___Headers___

The request must include an OAuth Bearer token, or a HAWK header that authenticates the request using a `sessionToken` received from `/account/login`.

```sh
curl -v \
-X GET \
-H "Host: api-accounts.dev.lcip.org" \
-H "Content-Type: application/json" \
-H 'Authorization: Bearer d4c5b1e3f5791ef83896c27519979b93a45e6d0da34c7509c5632ac35b28b48d' \
https://api-accounts.dev.lcip.org/v1/account/keys \
```

### Response

Successful requests will produce a "200 OK" response with data returned as JSON:

```json
{
  "email": "me@example.com",
  "locale": "hi-IN"
}
```

## POST /v1/account/reset

:lock: HAWK-authenticated with accountResetToken

This sets the account password and resets wrapKb to a new random value.

The accountResetToken is single-use, and is consumed regardless of whether the request succeeds or fails.

The caller can optionally request a new `sessionToken` and `keyFetchToken`.

### Request

___Parameters___

* authPW - the PBKDF2/HKDF stretched password as a hex string
* sessionToken - (optional) boolean, whether to generate a new sessionToken; default is false
* keys - (optional) whether to request new `keyFetchToken`, `keys=true`


___Headers___

The request must include a HAWK header that authenticates the request (including payload) using a key derived from the `accountResetToken`, which is returned by `/v1/password/forgot/verify_code`.

```sh
curl -v \
-X POST \
-H "Host: api-accounts.dev.lcip.org" \
-H "Content-Type: application/json" \
-H 'Authorization: Hawk id="d4c5b1e3f5791ef83896c27519979b93a45e6d0da34c7509c5632ac35b28b48d", ts="1373391043", nonce="ohQjqb", hash="vBODPWhDhiRWM4tmI9qp+np+3aoqEFzdGuGk0h7bh9w=", mac="LAnpP3P2PXelC6hUoUaHP72nCqY5Iibaa3eeiGBqIIU="' \
https://api-accounts.dev.lcip.org/v1/account/reset?keys=true \
-d '{
  "authPW": "f9fae9253549b2428a403d6fa51e6fb43d2f8a302e132cf902ffade52c02e6a4",
  "sessionToken": true
  }
}'
```

### Response

Successful requests will produce a "200 OK" response with JSON body:

```json
{
  "uid": "4c352927cd4f4a4aa03d7d1893d950b8",
  "sessionToken": "27cd4f4a4aa03d7d186a2ec81cbf19d5c8a604713362df9ee15c4f4a4aa03d7d",
  "keyFetchToken": "7d1893d950b8cd69856a2ec81cbfd7d1893d950b3362df9e56a2ec81cbf19d5c",
  "authAt": 1392144866,
  "verified": true
}
```


If no `sessionToken` is requested the response is an empty JSON body:

```json
{}
```

Failing requests may be due to the following errors:

* status code 400, errno 106:  request body was not valid json
* status code 400, errno 107:  request body contains invalid parameters
* status code 400, errno 108:  request body missing required parameters
* status code 401, errno 109:  invalid request signature
* status code 401, errno 110:  invalid authentication token
* status code 401, errno 111:  invalid authentication timestamp
* status code 411, errno 112:  content-length header was not provided
* status code 413, errno 113:  request body too large
* status code 401, errno 115:  invalid authentication nonce


## POST /v1/account/destroy

This deletes the account completely. All stored data is erased. The client should seek user confirmation first. The client should erase data stored on any attached services before deleting the user's account data.

### Request

___Parameters___

* email - the account email address
* authPW - the PBKDF2/HKDF stretched password as a hex string

```sh
curl -v \
-X POST \
-H "Host: api-accounts.dev.lcip.org" \
-H "Content-Type: application/json" \
https://api-accounts.dev.lcip.org/v1/account/destroy \
-d '{
  "email": "me@example.com",
  "authPW": "f9fae9253549b2428a403d6fa51e6fb43d2f8a302e132cf902ffade52c02e6a4"
}'
```

### Response

Successful requests will produce a "200 OK" response with empty JSON body:

```json
{}
```

Failing requests may be due to the following errors:

* status code 400, errno 102:  attempt to access an account that does not exist
* status code 400, errno 103:  incorrect password
* status code 400, errno 106:  request body was not valid json
* status code 401, errno 109:  invalid request signature
* status code 401, errno 110:  invalid authentication token
* status code 401, errno 111:  invalid authentication timestamp
* status code 411, errno 112:  content-length header was not provided
* status code 413, errno 113:  request body too large
* status code 401, errno 115:  invalid authentication nonce
* status code 400, errno 120:  incorrect email case
* status code 400, errno 126:  account must be reset

## GET /v1/session/status

:lock: HAWK-authenticated with the sessionToken.

The request will return a success response as long as the token is valid.

### Request

___Headers___

The request must include a Hawk header that authenticates the request using a `sessionToken` received from `/v1/account/create` or `/v1/account/login`.

```sh
curl -v \
-X GET \
-H "Host: api-accounts.dev.lcip.org" \
-H "Content-Type: application/json" \
-H 'Authorization: Hawk id="d4c5b1e3f5791ef83896c27519979b93a45e6d0da34c7509c5632ac35b28b48d", ts="1373391043", nonce="ohQjqb", hash="vBODPWhDhiRWM4tmI9qp+np+3aoqEFzdGuGk0h7bh9w=", mac="LAnpP3P2PXelC6hUoUaHP72nCqY5Iibaa3eeiGBqIIU="' \
https://api-accounts.dev.lcip.org/v1/session/status \
```


### Response

Successful requests will produce a "200 OK" response with the account uid in the JSON body object:

```json
{
  "uid": "80dc2f2e373b4b3bb992468e6d578cd2"
}
```

Failing requests may be due to the following errors:

* status code 401, errno 109:  invalid request signature
* status code 401, errno 110:  invalid authentication token
* status code 401, errno 111:  invalid authentication timestamp
* status code 401, errno 115:  invalid authentication nonce


## POST /v1/session/destroy

:lock: HAWK-authenticated with the sessionToken.

Destroys this session, by invalidating the sessionToken. This is used when a device "signs-out", detaching itself from the  account. After calling this, the device must re-perform the `/v1/account/login` sequence to obtain a new sessionToken.

___Headers___

The request must include a Hawk header that authenticates the request using a `sessionToken` received from `/v1/account/login`.

### Request
```sh
curl -v \
-X POST \
-H "Host: api-accounts.dev.lcip.org" \
-H "Content-Type: application/json" \
-H 'Authorization: Hawk id="d4c5b1e3f5791ef83896c27519979b93a45e6d0da34c7509c5632ac35b28b48d", ts="1373391043", nonce="ohQjqb", mac="LAnpP3P2PXelC6hUoUaHP72nCqY5Iibaa3eeiGBqIIU="' \
https://api-accounts.dev.lcip.org/v1/session/destroy \
```

### Response

Successful requests will produce a "200 OK" response with an empty JSON body:

```json
{}
```

Failing requests may be due to the following errors:

* status code 400, errno 106:  request body was not valid json
* status code 401, errno 109:  invalid request signature
* status code 401, errno 110:  invalid authentication token
* status code 401, errno 111:  invalid authentication timestamp
* status code 411, errno 112:  content-length header was not provided
* status code 413, errno 113:  request body too large
* status code 401, errno 115:  invalid authentication nonce


## GET /v1/recovery_email/status

:lock: HAWK-authenticated with the sessionToken.

Returns the "verified" status for the account's recovery email address.

Currently, each account is associated with exactly one email address. This address must be "verified" before the account can be used (specifically, `/v1/certificate/sign` and `/v1/account/keys` will return errors until the address is verified). In the future, this may be expanded to include multiple addresses, and/or alternate types of recovery methods (e.g., SMS). A new API will be provided for this extra functionality.

This call is used to determine the current state (verified or unverified) of the account. During account creation, until the address is verified, the agent can poll this method to discover when it should proceed with `/v1/certificate/sign` and `/v1/account/keys`.


### Request

___Headers___

The request must include a Hawk header that authenticates the request using a `sessionToken` received from `/v1/account/login`.

```sh
curl -v \
-X GET \
-H "Host: api-accounts.dev.lcip.org" \
-H "Content-Type: application/json" \
-H 'Authorization: Hawk id="d4c5b1e3f5791ef83896c27519979b93a45e6d0da34c7509c5632ac35b28b48d", ts="1373391043", nonce="ohQjqb", hash="vBODPWhDhiRWM4tmI9qp+np+3aoqEFzdGuGk0h7bh9w=", mac="LAnpP3P2PXelC6hUoUaHP72nCqY5Iibaa3eeiGBqIIU="' \
https://api-accounts.dev.lcip.org/v1/recovery_email/status \
```


### Response

Successful requests will produce a "200 OK" response with the account email and details on the verification status in the JSON body object:

```json
{
  "email": "me@example.com",
  "verified": true,
  "sessionVerified": true,
  "emailVerified": true
}
```

Failing requests may be due to the following errors:

* status code 401, errno 109:  invalid request signature
* status code 401, errno 110:  invalid authentication token
* status code 401, errno 111:  invalid authentication timestamp
* status code 401, errno 115:  invalid authentication nonce


## POST /v1/recovery_email/resend_code

:lock: HAWK-authenticated with the sessionToken.

Re-sends a verification code to the account's recovery email address. The code is first sent when the account is created, but if the user thinks the message was lost or accidentally deleted, they can request a new message to be sent with this endpoint. The new message will contain the same code as the original message. When this code is provided to `/v1/recovery_email/verify_code` (below), the email will be marked as "verified".

This endpoint may send a verification email to the user.  Callers may optionally provide the `service` parameter to indicate what Identity-Attached Service they are acting on behalf of.  This is an opaque alphanumeric token which will be embedded in the verification link as a query parameter.


### Request

___Parameters___

* service - (optional) opaque alphanumeric token to be included in verification links
* redirectTo - (optional) a URL that the client should be redirected to after handling the request
* resume - (optional) opaque url-encoded string that will be included in the verification link as a querystring parameter, useful for continuing an OAuth flow for example.

___Headers___

The request must include a Hawk header that authenticates the request (including payload) using a `sessionToken` received from `/v1/session/create`.

```sh
curl -v \
-X POST \
-H "Host: api-accounts.dev.lcip.org" \
-H "Content-Type: application/json" \
-H 'Authorization: Hawk id="d4c5b1e3f5791ef83896c27519979b93a45e6d0da34c7509c5632ac35b28b48d", ts="1373391043", nonce="ohQjqb", hash="vBODPWhDhiRWM4tmI9qp+np+3aoqEFzdGuGk0h7bh9w=", mac="LAnpP3P2PXelC6hUoUaHP72nCqY5Iibaa3eeiGBqIIU="' \
https://api-accounts.dev.lcip.org/v1/recovery_email/resend_code
```

### Response

Successful requests will produce a "200 OK" response with an empty JSON body:

```json
{}
```

Failing requests may be due to the following errors:

* status code 400, errno 106:  request body was not valid json
* status code 401, errno 109:  invalid request signature
* status code 401, errno 110:  invalid authentication token
* status code 401, errno 111:  invalid authentication timestamp
* status code 411, errno 112:  content-length header was not provided
* status code 413, errno 113:  request body too large
* status code 401, errno 115:  invalid authentication nonce


## POST /v1/recovery_email/verify_code

Not HAWK-authenticated.

This is an endpoint that is used to verify tokens and recovery emails for an account. If a valid token code is detected, the account email and tokens will be set to verified. If a valid email code is detected, the email will be marked as verified.

The verification code will be a random token, delivered in the fragment portion of a URL sent to the user's email address. The URL will lead to a page that extracts the code from the URL fragment, and performs a POST to `/recovery_email/verify_code`. The link can be clicked from any browser, not just the one being attached to the Firefox account.

### Request

___Parameters___

* uid - account identifier
* code - the verification code (recovery email or token verification id)

```sh
curl -v \
-X POST \
-H "Host: api-accounts.dev.lcip.org" \
-H "Content-Type: application/json" \
https://api-accounts.dev.lcip.org/v1/recovery_email/verify_code \
-d '{
  "uid": "4c352927cd4f4a4aa03d7d1893d950b8",
  "code": "e3c5b0e3f5391e134596c27519979b93"
}'
```

### Response

Successful requests will produce a "200 OK" response with an empty JSON body:

```json
{}
```

Failing requests may be due to the following errors:

* status code 400, errno 102:  attempt to access an account that does not exist
* status code 400, errno 105:  invalid verification code
* status code 400, errno 106:  request body was not valid json
* status code 400, errno 107:  request body contains invalid parameters
* status code 400, errno 108:  request body missing required parameters
* status code 411, errno 112:  content-length header was not provided
* status code 413, errno 113:  request body too large


## POST /v1/certificate/sign

:lock: HAWK-authenticated with the sessionToken.

Sign a BrowserID public key. The server is given a public key, and returns a signed certificate using the same JWT-like mechanism as a BrowserID primary IdP would (see the [browserid-certifier project](https://github.com/mozilla/browserid-certifier) for details). The signed certificate includes a `principal.email` property to indicate the Firefox Account identifier (a uuid at the account server's primary domain) and is stamped with an expiry time based on the "duration" parameter.

This request will fail unless the account's email address has been verified.

Clients should include a query parameter `?service=<service-name>` for metrics and validation
purposes.  The value of `<service-name>` should be `sync` when connecting to sync, or the
OAuth client_id when connecting to an OAuth relier.

If you do not specify a `service` parameter, or if you specify `service=sync`,
this endpoint will assume the request is coming from a legacy Firefox sync client.
If the sessionToken does not have a corresponding device record,
one will be created automatically by the server.

___Parameters___

* publicKey - the key to sign (run `bin/generate-keypair` from [browserid-crypto](https://github.com/mozilla/browserid-crypto))
    * algorithm - "RS" or "DS"
    * n - RS only
    * e - RS only
    * y - DS only
    * p - DS only
    * q - DS only
    * g - DS only
* duration - time interval from now when the certificate will expire, in milliseconds, up to a maximum of 24 hours.

___Headers___

The request must include a Hawk header that authenticates the request (including payload) using a `sessionToken` received from `/v1/account/login`.

### Request
```sh
curl -v \
-X POST \
-H "Host: api-accounts.dev.lcip.org" \
-H "Content-Type: application/json" \
-H 'Authorization: Hawk id="d4c5b1e3f5791ef83896c27519979b93a45e6d0da34c7509c5632ac35b28b48d", ts="1373391043", nonce="ohQjqb", hash="vBODPWhDhiRWM4tmI9qp+np+3aoqEFzdGuGk0h7bh9w=", mac="LAnpP3P2PXelC6hUoUaHP72nCqY5Iibaa3eeiGBqIIU="' \
https://api-accounts.dev.lcip.org/v1/certificate/sign \
-d '{
  "publicKey": {
    "algorithm":"RS",
    "n":"4759385967235610503571494339196749614544606692567785790953934768202714280652973091341316862993582789079872007974809511698859885077002492642203267408776123",
    "e":"65537"
  },
  "duration": 86400000
}'
```

### Response


Successful requests will produce a "200 OK" response with the signed identity certificate in the JSON body object:

```json
{
  "cert": "eyJhbGciOiJEUzI1NiJ9.eyJwdWJsaWMta2V5Ijp7ImFsZ29yaXRobSI6IlJTIiwibiI6IjU3NjE1NTUwOTM3NjU1NDk2MDk4MjAyMjM2MDYyOTA3Mzg5ODMyMzI0MjUyMDY2Mzc4OTA0ODUyNDgyMjUzODg1MTA3MzQzMTY5MzI2OTEyNDkxNjY5NjQxNTQ3NzQ1OTM3NzAxNzYzMTk1NzQ3NDI1NTEyNjU5NjM2MDgwMzYzNjE3MTc1MzMzNjY5MzEyNTA2OTk1MzMyNDMiLCJlIjoiNjU1MzcifSwicHJpbmNpcGFsIjp7ImVtYWlsIjoiZm9vQGV4YW1wbGUuY29tIn0sImlhdCI6MTM3MzM5MjE4OTA5MywiZXhwIjoxMzczMzkyMjM5MDkzLCJpc3MiOiIxMjcuMC4wLjE6OTAwMCJ9.l5I6WSjsDIwCKIz_9d3juwHGlzVcvI90T2lv2maDlr8bvtMglUKFFWlN_JEzNyPBcMDrvNmu5hnhyN7vtwLu3Q"
}
```

The signed certificate includes these additional claims:

* fxa-generation - a number that increases each time the user's password is changed
* fxa-lastAuthAt - authentication time for this session (seconds since epoch)
* fxa-verifiedEmail - the user's verified recovery email address

Failing requests may be due to the following errors:

* status code 400, errno 104:  attempt to operate on an unverified account
* status code 400, errno 106:  request body was not valid json
* status code 400, errno 107:  request body contains invalid parameters
* status code 400, errno 108:  request body missing required parameters
* status code 401, errno 109:  invalid request signature
* status code 401, errno 110:  invalid authentication token
* status code 401, errno 111:  invalid authentication timestamp
* status code 411, errno 112:  content-length header was not provided
* status code 413, errno 113:  request body too large
* status code 401, errno 115:  invalid authentication nonce


## POST /v1/password/change/start

Begin the "change password" process. It returns a single-use `passwordChangeToken`, which will be delivered to `/v1/password/change/finish`. It also returns a single-use `keyFetchToken`.

___Parameters___

* email - the account email address
* oldAuthPW - the PBKDF2/HKDF stretched password as a hex string

### Request

```sh
curl -v \
-X POST \
-H "Content-Type: application/json" \
https://api-accounts.dev.lcip.org/v1/password/change/start \
-d '{
  "email": "me@example.com",
  "oldAuthPW": "d486e79c9f3214b0010fe31bfb50fa6c12e1d093f7770c81c6b1c19c7ee375a6"
}'
```

### Response

Successful requests will produce a "200 OK" response with the encrypted sessionToken+keyFetchToken bundle in the JSON body object:

```json
{
  "keyFetchToken": "fa6c7b6536e8c0adff9ca426805e9479607b7c105050f1391dffed2a9826b8ad",
  "passwordChangeToken": "0208a48ca4f777688a1017e98cedcc1c36ba9c4595088d28dcde5af04ae2215b",
  "verified": true
}
```

Failing requests may be due to the following errors:

* status code 400, errno 102:  attempt to access an account that does not exist
* status code 400, errno 103:  incorrect password
* status code 400, errno 106:  request body was not valid json
* status code 411, errno 112:  content-length header was not provided
* status code 413, errno 113:  request body too large
* status code 400, errno 120:  incorrect email case
* status code 400, errno 126:  account must be reset


## POST /v1/password/change/finish

:lock: HAWK-authenticated with the passwordChangeToken.

Change the password and update `wrapKb`. Optionally returns a `sessionToken` and
`keyFetchToken`.

___Parameters___

* authPW - the new PBKDF2/HKDF stretched password as a hex string
* wrapKb - the new wrapKb value as a hex string
* sessionToken - (optional) the current sessionToken as a hex string
* keys - (optional) whether to request new `keyFetchToken`, `keys=true`

### Request

```sh
curl -v \
-X POST \
-H "Content-Type: application/json" \
-H 'Authorization: Hawk id="d4c5b1e3f5791ef83896c27519979b93a45e6d0da34c7509c5632ac35b28b48d", ts="1373391043", nonce="ohQjqb", mac="LAnpP3P2PXelC6hUoUaHP72nCqY5Iibaa3eeiGBqIIU="' \
https://api-accounts.dev.lcip.org/v1/password/change/finish \
-d '{
  "authPW": "761443da0ab27b1fa18c98912af6291714e9600aa3499109c5632ac35b28a309",
  "wrapKb": "20e3f5391e134596c27519979b93a45e6d0da34c75ac55c0520f2edfb0267614",
  "sessionToken": "93a4f5391e134596c27519979b93a45e6d0da34c75ac55c0520f2edfb0267614'
}'
```

### Response

Successful requests will produce a "200 OK" response with JSON body:

```json
{
  "uid": "4c352927cd4f4a4aa03d7d1893d950b8",
  "sessionToken": "27cd4f4a4aa03d7d186a2ec81cbf19d5c8a604713362df9ee15c4f4a4aa03d7d",
  "keyFetchToken": "7d1893d950b8cd69856a2ec81cbfd7d1893d950b3362df9e56a2ec81cbf19d5c",
  "authAt": 1392144866,
  "verified": true
}
```

If a `sessionToken` was not requested, then an empty JSON body is returned:

```json
{}
```


Failing requests may be due to the following errors:

* status code 400, errno 106:  request body was not valid json
* status code 400, errno 107:  request body contains invalid parameters
* status code 400, errno 108:  request body missing required parameters
* status code 401, errno 109:  invalid request signature
* status code 401, errno 110:  invalid authentication token
* status code 401, errno 111:  invalid authentication timestamp
* status code 411, errno 112:  content-length header was not provided
* status code 413, errno 113:  request body too large
* status code 401, errno 115:  invalid authentication nonce


## POST /v1/password/forgot/send_code

Not HAWK-authenticated.

This requests a "reset password" code to be sent to the user's recovery email. The user should type this code into the agent, which will then submit it to `/v1/password/forgot/verify_code` (described below). `verify_code` will then return a `accountResetToken`, which can be used to reset the account password.

This code will be either 8 or 16 digits long, and the `send_code` response indicates the code length (so the UI can display a suitable input form). The email will either contain the code itself, or will contain a link to a web page which will display the code.

The `send_code` response includes a `passwordForgotToken`, which must be submitted with the code to `/v1/password/forgot/verify_code` later.

The response also specifies the ttl of this token, and a limit on the number of times `verify_code` can be called with this token. By limiting the number of submission attempts, we also limit an attacker's ability to guess the code. After the token expires, or the maximum number of submissions have happened, the agent must use `send_code` again to generate a new code and token.

Each account can have at most one `passwordForgotToken` valid at a time. Calling `send_code` causes any existing tokens to be canceled and a new one created. Each token is associated with a specific code, so `send_code` also invalidates any existing codes.

___Parameters___

* email - the recovery email for this account
* service - (optional) indicates the relying service that the user was interacting with that triggered the password reset
* redirectTo - (optional) a URL that the client should be redirected to after handling the request
* resume - (optional) opaque url-encoded string that will be included in the verification link as a querystring parameter, useful for continuing an OAuth flow for example.

### Request
```sh
curl -v \
-X POST \
-H "Content-Type: application/json" \
https://api-accounts.dev.lcip.org/v1/password/forgot/send_code \
-d '{
  "email": "me@example.com",
  "service": "sync",
  "redirectTo": "https://sync.firefox.com/after_reset"
}'
```

### Response

Successful requests will produce a "200 OK" response with details of the reset code in the JSON body object:

```json
{
  "passwordForgotToken": "10ce20e3f5391e134596c27519979b93a45e6d0da34c75ac55c0520f2edfb026761443da0ab27b1fa18c98912af6291714e9600aa3499109c5632ac35b28a309",
  "ttl": 900,
  "codeLength": 8,
  "tries": 3
}
```

Failing requests may be due to the following errors:

* status code 400, errno 102:  attempt to access an account that does not exist
* status code 400, errno 106:  request body was not valid json
* status code 400, errno 107:  request body contains invalid parameters
* status code 400, errno 108:  request body missing required parameters
* status code 411, errno 112:  content-length header was not provided
* status code 413, errno 113:  request body too large


## POST /v1/password/forgot/resend_code

:lock: HAWK-authenticated with the passwordForgotToken.

While the agent is waiting for the user to paste in the forgot-password code, if the user believes the email has been lost or accidentally deleted, the `/v1/password/forgot/resend_code` API can be used to send a new copy of the same code.

This API requires the `passwordForgotToken` returned by the original `send_code` call (only the original browser which started the process may request a replacement message). It will return the same response as `send_code` did, except with a shorter `ttl` indicating the remaining validity period. If `verify_code` has been called some number of times with the same token, then `tries` will be smaller too.

___Parameters___

* email - the recovery email for this account
* service - (optional) indicates the relying service that the user was interacting with that triggered the password reset
* redirectTo - (optional) a URL that the client should be redirected to after handling the request
* resume - (optional) opaque url-encoded string that will be included in the verification link as a querystring parameter, useful for continuing an OAuth flow for example.

### Request

```sh
curl -v \
-X POST \
-H "Content-Type: application/json" \
-H 'Authorization: Hawk id="d4c5b1e3f5791ef83896c27519979b93a45e6d0da34c7509c5632ac35b28b48d", ts="1373391043", nonce="ohQjqb", mac="LAnpP3P2PXelC6hUoUaHP72nCqY5Iibaa3eeiGBqIIU="' \
https://api-accounts.dev.lcip.org/v1/password/forgot/resend_code \
-d '{
  "email": "me@example.com"
}'
```

### Response

Successful requests will produce a "200 OK" response with details of the reset code in the JSON body object:

```json
{
  "passwordForgotToken": "10ce20e3f5391e134596c27519979b93a45e6d0da34c75ac55c0520f2edfb026761443da0ab27b1fa18c98912af6291714e9600aa3499109c5632ac35b28a309",
  "ttl": 550,
  "codeLength": 8,
  "tries": 2
}
```

Failing requests may be due to the following errors:

* status code 400, errno 102:  attempt to access an account that does not exist
* status code 400, errno 106:  request body was not valid json
* status code 400, errno 107:  request body contains invalid parameters
* status code 400, errno 108:  request body missing required parameters
* status code 401, errno 109:  invalid request signature
* status code 401, errno 110:  invalid authentication token
* status code 401, errno 111:  invalid authentication timestamp
* status code 411, errno 112:  content-length header was not provided
* status code 413, errno 113:  request body too large
* status code 401, errno 115:  invalid authentication nonce


## POST /v1/password/forgot/verify_code

:lock: HAWK-authenticated with the passwordForgotToken.

Once the code created by `/v1/password/forgot/send_code` is emailed to the user, and they paste it into their browser, the browser agent should deliver it to this `verify_code` endpoint (along with the `passwordForgotToken`). This will cause the server to allocate and return an `accountResetToken`, which can be used to reset the account password and wrap(kB) with the `/v1/account/reset` API (described above).

___Parameters___

* code - the code sent to the user's recovery method

### Request

```sh
curl -v \
-X POST \
-H "Content-Type: application/json" \
-H 'Authorization: Hawk id="d4c5b1e3f5791ef83896c27519979b93a45e6d0da34c7509c5632ac35b28b48d", ts="1373391043", nonce="ohQjqb", mac="LAnpP3P2PXelC6hUoUaHP72nCqY5Iibaa3eeiGBqIIU="' \
https://api-accounts.dev.lcip.org/v1/password/forgot/verify_code \
-d '{
  "code": "12345678"
}'
```

### Response

Successful requests will produce a "200 OK" response with accountResetToken in the JSON body object, as *unencrypted* hex-encoded bytes:

```json
{
  "accountResetToken": "99ce20e3f5391e134596c2ac55c0520f2edfb026761443da0ab27b1fa18c98912af6291714e9600aa349917519979b93a45e6d0da34c7509c5632ac35b2865d3"
}
```

Failing requests may be due to the following errors:

* status code 400, errno 105:  invalid verification code
* status code 400, errno 106:  request body was not valid json
* status code 400, errno 107:  request body contains invalid parameters
* status code 400, errno 108:  request body missing required parameters
* status code 401, errno 109:  invalid request signature
* status code 401, errno 110:  invalid authentication token
* status code 401, errno 111:  invalid authentication timestamp
* status code 411, errno 112:  content-length header was not provided
* status code 413, errno 113:  request body too large
* status code 401, errno 115:  invalid authentication nonce


## GET /v1/password/forgot/status

:lock: HAWK-authenticated with the passwordForgotToken.

Returns the status for the passwordForgotToken. If the request returns a success response, the token has not yet been consumed. When the token is consumed by a successful reset or expires you can expect to get a 401 HTTP status code with an errno of 110.

### Request

___Headers___

The request must include a Hawk header that authenticates the request using a `passwordForgotToken` received from `/v1/password/forgot/send_code`.

```sh
curl -v \
-X GET \
-H "Host: api-accounts.dev.lcip.org" \
-H "Content-Type: application/json" \
-H 'Authorization: Hawk id="d4c5b1e3f5791ef83896c27519979b93a45e6d0da34c7509c5632ac35b28b48d", ts="1373391043", nonce="ohQjqb", hash="vBODPWhDhiRWM4tmI9qp+np+3aoqEFzdGuGk0h7bh9w=", mac="LAnpP3P2PXelC6hUoUaHP72nCqY5Iibaa3eeiGBqIIU="' \
https://api-accounts.dev.lcip.org/v1/password/forgot/status \
```


### Response

Successful requests will produce a "200 OK" response with the tries and ttl in the JSON body object:

```json
{ "tries": 3, "ttl": 420 }
```

Failing requests may be due to the following errors:

* status code 401, errno 109:  invalid request signature
* status code 401, errno 110:  invalid authentication token
* status code 401, errno 111:  invalid authentication timestamp
* status code 401, errno 115:  invalid authentication nonce

## POST /v1/account/device

:lock: HAWK-authenticated with the sessionToken.

Either registers a new device for this user/session
(if a device `id` is not specified)
or updates existing device details for this user/session
(if a device `id` is specified).

If no device `id` is specified,
both `name` and `type` must be provided.
If a device `id` is specified,
at least one of `name`, `type`, `pushCallback` or the tuple (`pushCallback`, `pushPublicKey` and `pushAuthKey`)
must be present.
Beware that if you provide `pushCallback` without the couple (`pushPublicKey` and `pushAuthKey`), both of
the keys will be reset to an empty string.

Devices should register with this endpoint *before* attempting to obtain a signed certificate
and perform their first sync, so that an appropriate device name can be made available
to other connected devices.

### Request

___Headers___

The request must include a Hawk header that authenticates the request
using a `sessionToken` received from `/v1/account/create` or `/v1/account/login`.

#### Registering a new device

```sh
curl -v \
-X POST \
-H "Host: api-accounts.dev.lcip.org" \
-H "Content-Type: application/json" \
-H 'Authorization: Hawk id="d4c5b1e3f5791ef83896c27519979b93a45e6d0da34c7509c5632ac35b28b48d", ts="1373391043", nonce="ohQjqb", hash="vBODPWhDhiRWM4tmI9qp+np+3aoqEFzdGuGk0h7bh9w=", mac="LAnpP3P2PXelC6hUoUaHP72nCqY5Iibaa3eeiGBqIIU="' \
https://api-accounts.dev.lcip.org/v1/account/device \
-d '{
  "name": "My Phone",
  "type": "mobile",
  "pushCallback": "https://updates.push.services.mozilla.com/update/abcdef01234567890abcdefabcdef01234567890abcdef",
  "pushPublicKey": "BCp93zru09_hab2Bg37LpTNG__Pw6eMPEP2hrQpwuytoj3h4chXpGc-3qqdKyqjuvAiEupsnOd_RLyc7erJHWgA",
  "pushAuthKey": "w3b14Zjc-Afj2SDOLOyong"
}'
```

#### Updating an existing device

```sh
curl -v \
-X POST \
-H "Host: api-accounts.dev.lcip.org" \
-H "Content-Type: application/json" \
-H 'Authorization: Hawk id="d4c5b1e3f5791ef83896c27519979b93a45e6d0da34c7509c5632ac35b28b48d", ts="1373391043", nonce="ohQjqb", hash="vBODPWhDhiRWM4tmI9qp+np+3aoqEFzdGuGk0h7bh9w=", mac="LAnpP3P2PXelC6hUoUaHP72nCqY5Iibaa3eeiGBqIIU="' \
https://api-accounts.dev.lcip.org/v1/account/device \
-d '{
  "id": "0f7aa00356e5416e82b3bef7bc409eef",
  "name": "My Old Phone"
}'
```

### Response

Successful requests will return a `200 OK` response
with an object that contains the device id in the JSON body:

```json
{
  "id": "0f7aa00356e5416e82b3bef7bc409eef",
  "createdAt": 1447755864288,
  "name": "My Phone",
  "type": "mobile",
  "pushCallback": "https://updates.push.services.mozilla.com/update/abcdef01234567890abcdefabcdef01234567890abcdef",
  "pushPublicKey": "BCp93zru09_hab2Bg37LpTNG__Pw6eMPEP2hrQpwuytoj3h4chXpGc-3qqdKyqjuvAiEupsnOd_RLyc7erJHWgA",
  "pushAuthKey": "w3b14Zjc-Afj2SDOLOyong"
}
```

Failing requests may return the following errors:

* status code 400, errno 123: unknown device
* status code 400, errno 124: session already registered by another device

## GET /v1/account/devices

:lock: HAWK-authenticated with the sessionToken.

Returns the list of all registered devices
for the authenticated user.

### Request

___Headers___

The request must include a Hawk header that authenticates the request
using a `sessionToken` received from `/v1/account/create` or `/v1/account/login`.

```sh
curl -v \
-X GET \
-H "Host: api-accounts.dev.lcip.org" \
-H 'Authorization: Hawk id="d4c5b1e3f5791ef83896c27519979b93a45e6d0da34c7509c5632ac35b28b48d", ts="1373391043", nonce="ohQjqb", hash="vBODPWhDhiRWM4tmI9qp+np+3aoqEFzdGuGk0h7bh9w=", mac="LAnpP3P2PXelC6hUoUaHP72nCqY5Iibaa3eeiGBqIIU="' \
https://api-accounts.dev.lcip.org/v1/account/devices
```

### Response

Successful requests will return a `200 OK` response
with an array of device details in the JSON body:

```json
[
  {
    "id": "0f7aa00356e5416e82b3bef7bc409eef",
    "isCurrentDevice": true,
    "lastAccessTime": 1449235471335,
    "lastAccessTimeFormatted": "a few seconds ago",
    "name": "My Phone",
    "type": "mobile",
    "pushCallback": "https://updates.push.services.mozilla.com/update/abcdef01234567890abcdefabcdef01234567890abcdef",
    "pushPublicKey": "BCp93zru09_hab2Bg37LpTNG__Pw6eMPEP2hrQpwuytoj3h4chXpGc-3qqdKyqjuvAiEupsnOd_RLyc7erJHWgA",
    "pushAuthKey": "w3b14Zjc-Afj2SDOLOyong"
  },
  {
    "id": "0f7aa00356e5416e82b3bef7bc409eef",
    "isCurrentDevice": false,
    "lastAccessTime": 1417699471335,
    "lastAccessTimeFormatted": "a few seconds ago",
    "name": "My Desktop",
    "type": null,
    "pushCallback": "https://updates.push.services.mozilla.com/update/d4c5b1e3f5791ef83896c27519979b93a45e6d0da34c75",
    "pushPublicKey": "BCp93zru09_hab2Bg37LpTNG__Pw6eMPEP2hrQpwuytoj3h4chXpGc-3qqdKyqjuvAiEupsnOd_RLyc7erJHWgA",
    "pushAuthKey": "w3b14Zjc-Afj2SDOLOyong"
  }
]
```

Failing requests may return the following error:

* status code 400, errno 102: unknown account

## POST /v1/account/devices/notify

:lock: HAWK-authenticated with the sessionToken.

Notifies a set of devices in the caller's account of an event
by sending a Push notification. A typical use case would be to
send a notification to another device after sending a tab with Sync,
so it can sync as well and display the tab in a timely manner.

### Request

___Parameters___

* to - the devices to send the notification to. It can be the string "all" (all devices except the caller) or an array of devices id.
* excluded - (optional) only with "to": "all". Devices IDs to exclude from the notification.
* payload - payload to send. It will be validated against [pushpayloads.schema.json](pushpayloads.schema.json).
* TTL - (optional) TTL in seconds of the push notification (defaults to 0)

___Headers___

The request must include a Hawk header that authenticates the request
using a `sessionToken` received from `/v1/account/create` or `/v1/account/login`.

#### Notify all other devices except excluded devices identified by their id

```sh
curl -v \
-X POST \
-H "Host: api-accounts.dev.lcip.org" \
-H "Content-Type: application/json" \
-H 'Authorization: Hawk id="d4c5b1e3f5791ef83896c27519979b93a45e6d0da34c7509c5632ac35b28b48d", ts="1373391043", nonce="ohQjqb", hash="vBODPWhDhiRWM4tmI9qp+np+3aoqEFzdGuGk0h7bh9w=", mac="LAnpP3P2PXelC6hUoUaHP72nCqY5Iibaa3eeiGBqIIU="' \
https://api-accounts.dev.lcip.org/v1/account/devices/notify \
-d '{
  "to": "all",
  "excluded": ["0f7aa00356e5416e82b3bef7bc409eef"],
  "payload": {
    version: 1,
    command: "sync:collection_changed",
    data: {
      collections: ["clients"]
    }
  },
  "TTL": 10
}'
```

#### Notify specific devices identified by their id

```sh
curl -v \
-X POST \
-H "Host: api-accounts.dev.lcip.org" \
-H "Content-Type: application/json" \
-H 'Authorization: Hawk id="d4c5b1e3f5791ef83896c27519979b93a45e6d0da34c7509c5632ac35b28b48d", ts="1373391043", nonce="ohQjqb", hash="vBODPWhDhiRWM4tmI9qp+np+3aoqEFzdGuGk0h7bh9w=", mac="LAnpP3P2PXelC6hUoUaHP72nCqY5Iibaa3eeiGBqIIU="' \
https://api-accounts.dev.lcip.org/v1/account/devices/notify \
-d '{
  "to": ["0f7aa00356e5416e82b3bef7bc409eef", "fee904cb7feb3b28e6145e65300aa7f0"],
  "payload": {
    version: 1,
    command: "sync:collection_changed",
    data: {
      collections: ["clients"]
    }
  }
}'
```

### Response

Successful requests will return a `200 OK` response
with an empty object in the JSON body:

```json
{}
```

Failing requests may return the following error:

* status code 400, errno 107: may be sent if the payload parameter is not valid

## POST /v1/account/device/destroy

:lock: HAWK-authenticated with the sessionToken.

Destroys an existing device record
and its associated sessionToken
for the authenticated user.
The identified device must sign in again
to use the API after this request has succeeded.

### Request

___Headers___

The request must include a Hawk header that authenticates the request
using a `sessionToken` received from `/v1/account/create` or `/v1/account/login`.

```sh
curl -v \
-X POST \
-H "Host: api-accounts.dev.lcip.org" \
-H "Content-Type: application/json" \
-H 'Authorization: Hawk id="d4c5b1e3f5791ef83896c27519979b93a45e6d0da34c7509c5632ac35b28b48d", ts="1373391043", nonce="ohQjqb", hash="vBODPWhDhiRWM4tmI9qp+np+3aoqEFzdGuGk0h7bh9w=", mac="LAnpP3P2PXelC6hUoUaHP72nCqY5Iibaa3eeiGBqIIU="' \
https://api-accounts.dev.lcip.org/v1/account/device/destroy \
-d '{
  "id": "0f7aa00356e5416e82b3bef7bc409eef"
}'
```

### Response

Successful requests will return a `200 OK` response
with an empty object in the JSON body:

```json
{}
```

Failing requests may return the following error:

* status code 400, errno 123: unknown device

## POST /v1/sms

:lock: HAWK-authenticated with the sessionToken.

Sends an SMS message.

### Request

___Headers___

The request must include a Hawk header
that authenticates the request
using a `sessionToken`
received from `/v1/account/create` or `/v1/account/login`.

___Parameters___

* phoneNumber - the phone number to send the message to, in E.164 format
* messageId - the id of the message to send

___Example___

```sh
curl -v \
-X POST \
-H "Host: api-accounts.dev.lcip.org" \
-H "Content-Type: application/json" \
-H 'Authorization: Hawk id="d4c5b1e3f5791ef83896c27519979b93a45e6d0da34c7509c5632ac35b28b48d", ts="1373391043", nonce="ohQjqb", hash="vBODPWhDhiRWM4tmI9qp+np+3aoqEFzdGuGk0h7bh9w=", mac="LAnpP3P2PXelC6hUoUaHP72nCqY5Iibaa3eeiGBqIIU="' \
https://api-accounts.dev.lcip.org/v1/sms \
-d '{
  "phoneNumber": "+15036789977",
  "messageId": 1
}'
```

### Response

Successful requests
will return a `200 OK` response
with an empty object
in the JSON body:

```json
{}
```

Failing requests may return the following errors:

* status code 400, errno 129: invalid phone number
* status code 400, errno 130: invalid region
* status code 400, errno 131: invalid message id
* status code 500, errno 132: message rejected
* status code 500, errno 999: unexpected error

## GET /v1/sms/status

:lock: HAWK-authenticated with the sessionToken.

Returns SMS status for the current user.

### Request

___Headers___

The request must include a Hawk header
that authenticates the request
using a `sessionToken`
received from `/v1/account/create` or `/v1/account/login`.

___Example___

```sh
curl -v \
-X GET \
-H "Host: api-accounts.dev.lcip.org" \
-H 'Authorization: Hawk id="d4c5b1e3f5791ef83896c27519979b93a45e6d0da34c7509c5632ac35b28b48d", ts="1373391043", nonce="ohQjqb", hash="vBODPWhDhiRWM4tmI9qp+np+3aoqEFzdGuGk0h7bh9w=", mac="LAnpP3P2PXelC6hUoUaHP72nCqY5Iibaa3eeiGBqIIU="' \
https://api-accounts.dev.lcip.org/v1/sms/status \
```

### Response

Successful requests
will return a `200 OK` response
with an object
containing an `ok` property
indicating the result
in the JSON body:

```json
{"ok":true}
```

Failing requests may return the following errors:

* status code 500, errno 999: unexpected error

## POST /v1/get_random_bytes

Not HAWK-authenticated.

Get 32 bytes of random data.  This should be combined with locally-sourced entropy when creating salts, etc.

### Request

```sh
curl -X POST -v https://api-accounts.dev.lcip.org/v1/get_random_bytes
```

### Response

Successful requests will produce a "200 OK" response with the random bytes as hex-encoded data in the JSON body object:

```json
{
  "data": "ac55c0520f2edfb026761443da0ab27b1fa18c98912af6291714e9600aa34991"
}
```

There are no standard failure modes for this endpoint.


# Example flows

## Create account

* `POST /get_random_bytes`
* `POST /account/create`
* `POST /account/login?keys=true`
* `POST /account/device`
* `GET /recovery_email/status`
* `POST /recovery_email/verify_code`
* `GET /account/keys`
* `POST /certificate/sign`

## Attach a new device

* `POST /account/login?keys=true`
* `POST /account/device`
* `GET /account/keys`
* `POST /certificate/sign`

## Forgot password

* `POST /password/forgot/send_code`
* `POST /password/forgot/verify_code`
* `POST /account/reset`
* GOTO "Attach a new device"

## Change password

* start with active session (and keys)
* `POST /password/change/start`
* `GET /account/keys`
* `POST /password/change/finish`
* GOTO "Attach a new device"


# Backoff Protocol

During periods of heavy load, the auth server may request that clients enter a "backoff" state in which they avoid making further requests.

If the server is under too much load to handle the client's request, it will return a `503 Service Unavailable` HTTP response.  The response will include `Retry-After` header giving the number of seconds that the client should wait before issuing any further requests.  It will also include a [JSON error response](#response-format) with `errno` of 201, and with a `retryAfter` field that matches the value in the `Retry-After` header.  For example, the following response would indicate that the server could not process the request and the client should avoid sending additional requests for 30 seconds:

```
HTTP/1.1 503 Service Unavailable
Retry-After: 30
Content-Type: application/json

{
 "code": 503,
 "errno": 201,
 "error": "Service Unavailable",
 "message": "The server is experiencing heavy load, please try again shortly",
 "info": "https://github.com/mozilla/fxa-auth-server/blob/master/docs/api.md#response-format",
 "retryAfter": 30,
 "retryAfterLocalized": "in a few seconds"
}
```

The `Retry-After` value is included in both the headers and body so that clients can choose to handle it at the most appropriate level of abstraction for their environment.

If an individual client is found to be issuing too many requests in quick succession, the server may return a `429 Too Many Requests` response.  This is similar to the `503 Service Unavailable` response but indicates that the problem originates from the client's behavior, rather than the server.  The response will include `Retry-After` header giving the number of seconds that the client should wait before issuing any further requests.  It will also include a [JSON error response](#response-format) with `errno` of 114, and with a `retryAfter` field that matches the value in the `Retry-After` header.  For example:

```
HTTP/1.1 429 Too Many Requests
Retry-After: 30
Content-Type: application/json

{
 "code": 429,
 "errno": 114,
 "error": "Too Many Requests",
 "message": "This client has sent too many requests",
 "info": "https://github.com/mozilla/fxa-auth-server/blob/master/docs/api.md#response-format",
 "retryAfter": 30,
 "retryAfterLocalized": "in a few seconds"
}
```


# Reference Client

https://github.com/mozilla/fxa-js-client
