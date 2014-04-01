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
  * There is a development server available at [https://api-accounts.dev.lcip.org/](https://api-accounts.dev.lcip.org);
    data stored on this may be periodically purged.
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
* status code 503, errno 201:  service temporarily unavailable to due high load (see [backoff protocol](#backoff-protocol))
* any status code, errno 999:  unknown error

The follow error responses include additional parameters:

* errno 111:  a `serverTime` parameter giving the current server time in seconds.
* errno 114:  a `retryAfter` parameter indicating how long the client should wait before re-trying.
* errno 120:  a `email` parameter indicating the case used to create the account
* errno 201:  a `retryAfter` parameter indicating how long the client should wait before re-trying.


## Responses from Intermediary Servers

Since this is a HTTP-based protocol, clients should be prepared to gracefully handle standard HTTP error responses that may be produced by proxies, load-balancers, or other intermediary servers.  Non-application responses can be identified by their lack of properly-formatted JSON response body.  Common examples would include:

* "413 Request Entity Too Large" may be produced up an upstream proxy server.
* "502 Gateway Timeout" may be produced by a load-balancer if it cannot contact the application servers.

---

# API Endpoints

* Account
    * [POST /v1/account/create](#post-v1accountcreate)
    * [GET  /v1/account/status](#get-v1accountstatus)
    * [GET  /v1/account/devices (:lock: sessionToken)](#get-v1accountdevices)
    * [GET  /v1/account/keys (:lock: keyFetchToken) (verf-required)](#get-v1accountkeys)
    * [POST /v1/account/reset (:lock: accountResetToken)](#post-v1accountreset)
    * [POST /v1/account/destroy](#post-v1accountdestroy)

* Authentication
    * [POST /v1/account/login](#post-v1accountlogin)

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
* status code 400, errno 106:  request body was not valid json
* status code 400, errno 107:  request body contains invalid parameters
* status code 400, errno 108:  request body missing required parameters
* status code 411, errno 112:  content-length header was not provided
* status code 413, errno 113:  request body too large


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


## POST /v1/account/login

Obtain a `sessionToken` and optionally a `keyFetchToken` by adding the query parameter `keys=true`.

___Parameters___

* email - the primary email for this account
* authPW - the PBKDF2/HKDF stretched password as a hex string

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

Successful requests will produce a "200 OK" and a json body. `keyFetchToken` will only be present if `keys=true` was specified.

```json
{
  "uid": "4c352927cd4f4a4aa03d7d1893d950b8",
  "sessionToken": "27cd4f4a4aa03d7d186a2ec81cbf19d5c8a604713362df9ee15c4f4a4aa03d7d",
  "keyFetchToken": "7d1893d950b8cd69856a2ec81cbfd7d1893d950b3362df9e56a2ec81cbf19d5c",
  "verified": true,
  "authAt": 1392144866
}
```

* authAt - authentication time for the session (seconds since epoch)

Failing requests may be due to the following errors:

* status code 400, errno 102:  attempt to access an account that does not exist
* status code 400, errno 103:  incorrect password
* status code 400, errno 106:  request body was not valid json
* status code 400, errno 107:  request body contains invalid parameters
* status code 400, errno 108:  request body missing required parameters
* status code 411, errno 112:  content-length header was not provided
* status code 413, errno 113:  request body too large
* status code 400, errno 120:  incorrect email case


## GET /v1/account/devices

:lock: HAWK-authenticated with sessionToken

Gets the collection of devices currently authenticated and syncing for the user.

This is intentionally vague for now, and will be figured out soon.

Devices describe themselves to the server with arguments to `/v1/session/create`, which returns a distinct sessionToken for each one. This status API is expected to use that information.

___Headers___

The request must include a Hawk header that authenticates the request using a `sessionToken` received from `/v1/account/login`.

### Request

```sh
curl -v \
-X GET \
-H "Host: api-accounts.dev.lcip.org" \
-H "Content-Type: application/json" \
-H 'Authorization: Hawk id="d4c5b1e3f5791ef83896c27519979b93a45e6d0da34c7509c5632ac35b28b48d", ts="1373391043", nonce="ohQjqb", mac="LAnpP3P2PXelC6hUoUaHP72nCqY5Iibaa3eeiGBqIIU="' \
https://api-accounts.dev.lcip.org/v1/account/devices \
```

### Response

Successful requests will produce a "200 OK" response with the device details provided in the JSON body:

```json
{
  "devices": [
    {
      "id": "4c352927-cd4f-4a4a-a03d-7d1893d950b8",
      "type": "computer",
      "name": "Foxy's Macbook"
    }
  ]
}
```

Failing requests may be due to the following errors:

* status code 400, errno 102:  attempt to access an account that does not exist
* status code 401, errno 109:  invalid request signature
* status code 401, errno 110:  invalid authentication token
* status code 401, errno 111:  invalid authentication timestamp
* status code 401, errno 115:  invalid authentication nonce


## GET /v1/account/keys

:lock: HAWK-authenticated with keyFetchToken

Get the base16 bundle of encrypted `kA|wrapKb`. The return value must be decrypted with a key derived from keyFetchToken, and then `wrapKb` must be further decrypted with a key derived from the user's password.

Since keyFetchToken is single-use, this can only be done once per session. Note that the keyFetchToken is consumed regardless of whether the request succeeds or fails.

This request will fail unless the account's email address has been verified.

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

* status code 400, errno 102:  attempt to access an account that does not exist
* status code 400, errno 104:  attempt to operate on an unverified account
* status code 401, errno 109:  invalid request signature
* status code 401, errno 110:  invalid authentication token
* status code 401, errno 111:  invalid authentication timestamp
* status code 401, errno 115:  invalid authentication nonce


## POST /v1/account/reset

:lock: HAWK-authenticated with accountResetToken

This sets the account password and resets wrapKb to a new random value.

The accountResetToken is single-use, and is consumed regardless of whether the request succeeds or fails.

### Request

___Parameters___

* authPW - the PBKDF2/HKDF stretched password as a hex string


___Headers___

The request must include a HAWK header that authenticates the request (including payload) using a key derived from the `accountResetToken`, which is returned by `/v1/password/forgot/verify_code`.

```sh
curl -v \
-X POST \
-H "Host: api-accounts.dev.lcip.org" \
-H "Content-Type: application/json" \
-H 'Authorization: Hawk id="d4c5b1e3f5791ef83896c27519979b93a45e6d0da34c7509c5632ac35b28b48d", ts="1373391043", nonce="ohQjqb", hash="vBODPWhDhiRWM4tmI9qp+np+3aoqEFzdGuGk0h7bh9w=", mac="LAnpP3P2PXelC6hUoUaHP72nCqY5Iibaa3eeiGBqIIU="' \
https://api-accounts.dev.lcip.org/v1/account/reset \
-d '{
  "authPW": "f9fae9253549b2428a403d6fa51e6fb43d2f8a302e132cf902ffade52c02e6a4"
  }
}'
```

### Response

Successful requests will produce a "200 OK" response with empty JSON body:

```json
{}
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
* status code 400, errno 106:  request body was not valid json
* status code 401, errno 109:  invalid request signature
* status code 401, errno 110:  invalid authentication token
* status code 401, errno 111:  invalid authentication timestamp
* status code 411, errno 112:  content-length header was not provided
* status code 413, errno 113:  request body too large
* status code 401, errno 115:  invalid authentication nonce
* status code 400, errno 120:  incorrect email case


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

Successful requests will produce a "200 OK" response with an empty JSON body object:

```json
{}
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

* status code 400, errno 102:  attempt to access an account that does not exist
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

This call is used to determine the current state (verified or unverified) of the recovery email address. During account creation, until the address is verified, the agent can poll this method to discover when it should proceed with `/v1/certificate/sign` and `/v1/account/keys`.


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

Successful requests will produce a "200 OK" response with the account email and verification status in the JSON body object:

```json
{ "email": "me@example.com", "verified": true }
```

Failing requests may be due to the following errors:

* status code 400, errno 102:  attempt to access an account that does not exist
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

* status code 400, errno 102:  attempt to access an account that does not exist
* status code 400, errno 106:  request body was not valid json
* status code 401, errno 109:  invalid request signature
* status code 401, errno 110:  invalid authentication token
* status code 401, errno 111:  invalid authentication timestamp
* status code 411, errno 112:  content-length header was not provided
* status code 413, errno 113:  request body too large
* status code 401, errno 115:  invalid authentication nonce


## POST /v1/recovery_email/verify_code

Not HAWK-authenticated.

Used to submit a verification code that was previously sent to a user's recovery email. If correct, the account's recovery email address will be marked as "verified".

The verification code will be a random token, delivered in the fragment portion of a URL sent to the user's email address. The URL will lead to a page that extracts the code from the URL fragment, and performs a POST to `/recovery_email/verify_code`. This endpoint should be CORS-enabled, to allow the linked page to be hosted on a different (static) domain. The link can be clicked from any browser, not just the one being attached to the PICL account.

### Request

___Parameters___

* uid - account identifier
* code - the verification code

```sh
curl -v \
-X POST \
-H "Host: api-accounts.dev.lcip.org" \
-H "Content-Type: application/json" \
https://api-accounts.dev.lcip.org/v1/recovery_email/verify_code \
-d '{
  "uid": "4c352927cd4f4a4aa03d7d1893d950b8",
  "code": "e3c5b0e3f5391e134596c27519979b93a45e6d0da34c7509c5632ac35b28b48d"
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

Sign a BrowserID public key. The server is given a public key, and returns a signed certificate using the same JWT-like mechanism as a BrowserID primary IdP would (see the [browserid-certifier project](https://github.com/mozilla/browserid-certifier for details)). The signed certificate includes a `principal.email` property to indicate the Firefox Account identifier (a uuid at the account server's primary domain). The certificate is marked as being valid for a limited time period (TBD, but probably a few hours, maybe a day).

This request will fail unless the account's email address has been verified.

___Parameters___

* publicKey - the key to sign (run `bin/generate-keypair` from [jwcrypto](https://github.com/mozilla/jwcrypto))
    * algorithm - "RS" or "DS"
    * n - RS only
    * e - RS only
    * y - DS only
    * p - DS only
    * q - DS only
    * g - DS only
* duration - time interval from now when the certificate will expire in seconds

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

* status code 400, errno 102:  attempt to access an account that does not exist
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


## POST /v1/password/change/finish

:lock: HAWK-authenticated with the passwordChangeToken.

Change the password and update `wrapKb`.

___Parameters___

* authPW - the new PBKDF2/HKDF stretched password as a hex string
* wrapKb - the new wrapKb value as a hex string

### Request

```sh
curl -v \
-X POST \
-H "Content-Type: application/json" \
-H 'Authorization: Hawk id="d4c5b1e3f5791ef83896c27519979b93a45e6d0da34c7509c5632ac35b28b48d", ts="1373391043", nonce="ohQjqb", mac="LAnpP3P2PXelC6hUoUaHP72nCqY5Iibaa3eeiGBqIIU="' \
https://api-accounts.dev.lcip.org/v1/password/change/finish \
-d '{
  "authPW": "761443da0ab27b1fa18c98912af6291714e9600aa3499109c5632ac35b28a309",
  "wrapKb": "20e3f5391e134596c27519979b93a45e6d0da34c75ac55c0520f2edfb0267614"
}'
```

### Response

Successful requests will produce a "200 OK" response with an empty JSON body:

```json
{}
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

* status code 400, errno 102:  attempt to access an account that does not exist
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
* `GET /recovery_email/status`
* `POST /recovery_email/verify_code`
* `GET /account/keys`
* `POST /certificate/sign`

## Attach a new device

* `POST /account/login?keys=true`
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
 "retryAfter": 30
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
 "retryAfter": 30
}
```


# Reference Client

The [git repo](https://github.com/mozilla/fxa-auth-server) contains a reference implementation
of the client side of the protocol in [/client/index.js](/client/index.js) with
sample usage in [/client/example.js](/client/example.js)
