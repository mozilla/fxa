# Firefox Accounts authentication server API

This document is automatically generated.
If you are editing it,
read [this section](#this-document) first.

<!--begin-abstract-->
This document provides protocol-level details
of the Firefox Accounts auth server API.
For a prose description of the client/server protocol
and details on how each parameter is derived,
see the [API design document](https://wiki.mozilla.org/Identity/AttachedServices/KeyServerProtocol).
For a reference client implementation,
see [`mozilla/fxa-js-client`](https://github.com/mozilla/fxa-js-client).
<!--end-abstract-->
* [Overview](#overview)
  * [URL structure](#url-structure)
  * [Request format](#request-format)
  * [Response format](#response-format)
    * [Defined errors](#defined-errors)
    * [Responses from intermediary servers](#responses-from-intermediary-servers)
  * [Validation](#validation)
* [API endpoints](#api-endpoints)
  * [Account](#account)
    * [POST /account/create](#post-accountcreate)
    * [POST /account/login](#post-accountlogin)
    * [GET /account/status (:lock::unlock: sessionToken)](#get-accountstatus)
    * [POST /account/status](#post-accountstatus)
    * [GET /account/profile (:lock::unlock: sessionToken, oauthToken)](#get-accountprofile)
    * [GET /account/keys (:lock: keyFetchToken)](#get-accountkeys)
    * [POST /account/device (:lock: sessionToken)](#post-accountdevice)
    * [POST /account/devices/notify (:lock: sessionToken)](#post-accountdevicesnotify)
    * [GET /account/devices (:lock: sessionToken)](#get-accountdevices)
    * [GET /account/sessions (:lock: sessionToken)](#get-accountsessions)
    * [POST /account/device/destroy (:lock: sessionToken)](#post-accountdevicedestroy)
    * [GET /recovery_email/status (:lock: sessionToken)](#get-recovery_emailstatus)
    * [POST /recovery_email/resend_code (:lock: sessionToken)](#post-recovery_emailresend_code)
    * [POST /recovery_email/verify_code](#post-recovery_emailverify_code)
    * [GET /recovery_emails (:lock: sessionToken)](#get-recovery_emails)
    * [POST /recovery_email (:lock: sessionToken)](#post-recovery_email)
    * [POST /recovery_email/destroy (:lock: sessionToken)](#post-recovery_emaildestroy)
    * [POST /account/unlock/resend_code](#post-accountunlockresend_code)
    * [POST /account/unlock/verify_code](#post-accountunlockverify_code)
    * [POST /account/login/send_unblock_code](#post-accountloginsend_unblock_code)
    * [POST /account/login/reject_unblock_code](#post-accountloginreject_unblock_code)
    * [POST /account/reset (:lock: accountResetToken)](#post-accountreset)
    * [POST /account/destroy](#post-accountdestroy)
  * [Password](#password)
    * [POST /password/change/start](#post-passwordchangestart)
    * [POST /password/change/finish (:lock: passwordChangeToken)](#post-passwordchangefinish)
    * [POST /password/forgot/send_code](#post-passwordforgotsend_code)
    * [POST /password/forgot/resend_code (:lock: passwordForgotToken)](#post-passwordforgotresend_code)
    * [POST /password/forgot/verify_code (:lock: passwordForgotToken)](#post-passwordforgotverify_code)
    * [GET /password/forgot/status (:lock: passwordForgotToken)](#get-passwordforgotstatus)
  * [Session](#session)
    * [POST /session/destroy (:lock: sessionToken)](#post-sessiondestroy)
    * [GET /session/status (:lock: sessionToken)](#get-sessionstatus)
  * [Sign](#sign)
    * [POST /certificate/sign (:lock: sessionToken)](#post-certificatesign)
  * [Sms](#sms)
    * [POST /sms (:lock: sessionToken)](#post-sms)
    * [GET /sms/status (:lock: sessionToken)](#get-smsstatus)
  * [Util](#util)
    * [POST /get_random_bytes](#post-get_random_bytes)
    * [GET /verify_email](#get-verify_email)
    * [GET /complete_reset_password](#get-complete_reset_password)
* [Example flows](#example-flows)
* [Back-off protocol](#back-off-protocol)
* [This document](#this-document)

## Overview

### URL structure
<!--begin-url-structure-->
All requests use URLs of the form:

```
https://<base-URI>/v1/<endpoint-path>
```

Note that:

* All API access must be over a properly-validated HTTPS connection.
* The URL embeds a version identifier `v1`.
  Future revisions of this API may introduce new version numbers.
* The base URI of the server may be configured on a per-client basis:
  * For a list of development servers
    see [Firefox Accounts deployments on MDN](https://developer.mozilla.org/en-US/Firefox_Accounts#Firefox_Accounts_deployments).
  * The canonical URL for Mozilla's hosted Firefox Accounts server
    is `https://api.accounts.firefox.com/v1`.
<!--end-url-structure-->

### Request format
<!--begin-request-format-->
Requests that require authentication
use [Hawk](https://github.com/hueniverse/hawk) request signatures.
These endpoints are marked
with a :lock: icon.
Where the authentication is optional,
there will also be a :question: icon.

All POST requests must have a content-type of `application/json`
with a UTF8-encoded JSON body
and must specify the content-length header.
Keys and other binary data are included in the JSON
as hexadecimal strings.

The following request headers may be specified
to influence the behaviour of the server:

* `Accept-Language`
  may be used to localize
  emails and SMS messages.
<!--end-request-format-->

### Response format
<!--begin-response-format-->
All requests receive
a JSON response body
with a `Content-Type: application/json` header
and appropriate `Content-Length` set.
The body structure
depends on the endpoint returning it.

Successful responses will have
an HTTP status code of 200
and a `Timestamp` header
that contains the current server time
in seconds since the epoch.

Error responses caused by invalid client behaviour
will have an HTTP status code in the 4xx range.
Error responses caused by server-side problems
will have an HTTP status code in the 5xx range.
Failures due to invalid behavior from the client

To simplify error handling for the client,
the type of error is indicated by both
a defined HTTP status code
and an application-specific `errno` in the body.
For example:

```js
{
  "code": 400,  // Matches the HTTP status code
  "errno": 107, // Stable application-level error number
  "error": "Bad Request", // String description of the error type
  "message": "Invalid parameter in request body", // Specific error message
  "info": "https://docs.dev.lcip.og/errors/1234"  // Link to more information
}
```

Responses for some errors may include additional parameters.
<!--end-response-format-->

#### Defined errors

The currently-defined values
for `code` and `errno` are:

* `code: 400, errno: 100`:
  Incorrect Database Patch Level
* `code: 400, errno: 101`:
  Account already exists
* `code: 400, errno: 102`:
  Unknown account
* `code: 400, errno: 103`:
  Incorrect password
* `code: 400, errno: 104`:
  Unverified account
* `code: 400, errno: 105`:
  Invalid verification code
* `code: 400, errno: 106`:
  Invalid JSON in request body
* `code: 400, errno: 107`:
  Invalid parameter in request body
* `code: 400, errno: 108`:
  Missing parameter in request body
* `code: 401, errno: 109`:
  Invalid request signature
* `code: 401, errno: 110`:
  Invalid authentication token in request signature
* `code: 401, errno: 111`:
  Invalid timestamp in request signature
* `code: 411, errno: 112`:
  Missing content-length header
* `code: 413, errno: 113`:
  Request body too large
* `code: 429, errno: 114`:
  Client has sent too many requests
* `code: 401, errno: 115`:
  Invalid nonce in request signature
* `code: 410, errno: 116`:
  This endpoint is no longer supported
* `code: 400, errno: 120`:
  Incorrect email case
* `code: 400, errno: 123`:
  Unknown device
* `code: 400, errno: 124`:
  Session already registered by another device
* `code: 400, errno: 125`:
  The request was blocked for security reasons
* `code: 400, errno: 126`:
  Account must be reset
* `code: 400, errno: 127`:
  Invalid unblock code
* `code: 400, errno: 129`:
  Invalid phone number
* `code: 400, errno: 130`:
  Invalid region
* `code: 400, errno: 131`:
  Invalid message id
* `code: 500, errno: 132`:
  Message rejected
* `code: 400, errno: 133`:
  Email account sent complaint
* `code: 400, errno: 134`:
  Email account hard bounced
* `code: 400, errno: 135`:
  Email account soft bounced
* `code: 400, errno: 136`:
  Email already exists
* `code: 400, errno: 137`:
  Can not delete primary email
* `code: 400, errno: 138`:
  Unverified session
* `code: 400, errno: 139`:
  Can not add secondary email that is same as your primary
* `code: 400, errno: 140`:
  Email already exists
* `code: 400, errno: 141`:
  Email already exists
* `code: 400, errno: 142`:
  Sign in with this email type is not currently supported
* `code: 400, errno: 143`:
  Unknown email
* `code: 400, errno: 144`:
  Email already exists
* `code: 400, errno: 145`:
  Reset password with this email type is not currently supported
* `code: 503, errno: 201`:
  Service unavailable
* `code: 503, errno: 202`:
  Feature not enabled
* `code: 500, errno: 999`:
  Unspecified error

The following errors
include additional response properties:

* `errno: 100`: level, levelRequired
* `errno: 101`: email
* `errno: 102`: email
* `errno: 103`: email
* `errno: 105`
* `errno: 107`: validation
* `errno: 108`: param
* `errno: 111`: serverTime
* `errno: 114`: retryAfter, retryAfterLocalized, verificationMethod, verificationReason
* `errno: 120`: email
* `errno: 125`: verificationMethod, verificationReason
* `errno: 126`: email
* `errno: 130`: region
* `errno: 132`: reason, reasonCode
* `errno: 201`: retryAfter
* `errno: 202`: retryAfter

#### Responses from intermediary servers
<!--begin-responses-from-intermediary-servers-->
As with any HTTP-based API,
clients must handle standard errors that may be returned
by proxies, load-balancers or other intermediary servers.
These non-application responses can be identified
by the absence of a correctly-formatted JSON response body.

Common examples include:

* `413 Request Entity Too Large`:
  may be returned by an upstream proxy server.
* `502 Gateway Timeout`:
  may be returned if a load-balancer can't connect to application servers.
<!--end-responses-from-intermediary-servers-->

### Validation

In the documentation that follows,
some properties of requests and responses
are validated by common code
that has been refactored and extracted.
For reference,
those common validations are defined here.

#### lib/routes/validators

* `HEX_STRING`: `/^(?:[a-fA-F0-9]{2})+$/`
* `URLSAFEBASE64`: `/^[a-zA-Z0-9-_]*$/`
* `BASE_36`: `/^[a-zA-Z0-9]*$/`
* `DISPLAY_SAFE_UNICODE`: `/^(?:[^\u0000-\u001F\u007F\u0080-\u009F\u2028-\u2029\uD800-\uDFFF\uE000-\uF8FF\uFFF9-\uFFFF])*$/`
* `service`: `string, max(16), regex(/^[a-zA-Z0-9\-]*$/g)`
* `E164_NUMBER`: `/^\+[1-9]\d{1,14}$/`

#### lib/metrics/context

* `schema`: object({
    * `flowId`: string, length(64), regex(HEX_STRING), optional
    * `flowBeginTime`: number, integer, positive, optional

  }), unknown(false), and('flowId', 'flowBeginTime'), optional

## API endpoints

### Account

#### POST /account/create
<!--begin-route-post-accountcreate-->
Creates a user account.
The client provides the email address
with which this account will be associated
and a stretched password.
Stretching is detailed
on the [onepw](https://github.com/mozilla/fxa-auth-server/wiki/onepw-protocol#creating-the-account) wiki page.

This endpoint may send a verification email to the user.
Callers may optionally provide the `service` parameter
to indicate which service they are acting on behalf of.
This is an opaque alphanumeric token
that will be embedded in the verification link
as a query parameter.

Creating an account also logs in.
The response contains a `sessionToken`
and, optionally, a `keyFetchToken`
if the url has a query parameter of `keys=true`.
<!--end-route-post-accountcreate-->

##### Query parameters

* `keys`: *boolean, optional*

  <!--begin-query-param-post-accountcreate-keys-->
  Indicates whether a key-fetch token should be returned in the success response.
  <!--end-query-param-post-accountcreate-keys-->

* `service`: *validators.service*

  <!--begin-query-param-post-accountcreate-service-->
  Opaque alphanumeric token to be included in verification links.
  <!--end-query-param-post-accountcreate-service-->

##### Request body

* `email`: *validators.email.required*

  <!--begin-request-body-post-accountcreate-email-->
  The primary email for this account.
  <!--end-request-body-post-accountcreate-email-->

* `authPW`: *string, min(64), max(64), regex(HEX_STRING), required*

  <!--begin-request-body-post-accountcreate-authPW-->
  The PBKDF2/HKDF-stretched password as a hex string.
  <!--end-request-body-post-accountcreate-authPW-->

* `preVerified`: *boolean*

  <!--begin-request-body-post-accountcreate-preVerified-->
  
  <!--end-request-body-post-accountcreate-preVerified-->

* `service`: *validators.service*

  <!--begin-request-body-post-accountcreate-service-->
  Opaque alphanumeric token to be included in verification links.
  <!--end-request-body-post-accountcreate-service-->

* `redirectTo`: *validators.redirectTo(config.smtp.redirectDomain).optional*

  <!--begin-request-body-post-accountcreate-redirectTo-->
  URL that the client should be redirected to after handling the request.
  <!--end-request-body-post-accountcreate-redirectTo-->

* `resume`: *string, max(2048), optional*

  <!--begin-request-body-post-accountcreate-resume-->
  Opaque URL-encoded string to be included in the verification link as a query parameter.
  <!--end-request-body-post-accountcreate-resume-->

* `metricsContext`: *metricsContext.schema*

  <!--begin-request-body-post-accountcreate-metricsContext-->
  
  <!--end-request-body-post-accountcreate-metricsContext-->

##### Response body

* `uid`: *string, regex(HEX_STRING), required*

  <!--begin-response-body-post-accountcreate-uid-->
  
  <!--end-response-body-post-accountcreate-uid-->

* `sessionToken`: *string, regex(HEX_STRING), required*

  <!--begin-response-body-post-accountcreate-sessionToken-->
  
  <!--end-response-body-post-accountcreate-sessionToken-->

* `keyFetchToken`: *string, regex(HEX_STRING), optional*

  <!--begin-response-body-post-accountcreate-keyFetchToken-->
  
  <!--end-response-body-post-accountcreate-keyFetchToken-->

* `authAt`: *number, integer*

  <!--begin-response-body-post-accountcreate-authAt-->
  Authentication time for the session (seconds since epoch).
  <!--end-response-body-post-accountcreate-authAt-->

##### Error responses

Failing requests may be caused
by the following errors
(this is not an exhaustive list):

* `code: 400, errno: 101`:
  Account already exists

* `code: 400, errno: 144`:
  Email already exists


#### POST /account/login
<!--begin-route-post-accountlogin-->
Obtain a `sessionToken` and, optionally, a `keyFetchToken` if `keys=true`.
<!--end-route-post-accountlogin-->

##### Query parameters

* `keys`: *boolean, optional*

  <!--begin-query-param-post-accountlogin-keys-->
  Indicates whether a key-fetch token should be returned in the success response.
  <!--end-query-param-post-accountlogin-keys-->

* `service`: *validators.service*

  <!--begin-query-param-post-accountlogin-service-->
  Opaque alphanumeric token to be included in verification links.
  <!--end-query-param-post-accountlogin-service-->

##### Request body

* `email`: *validators.email.required*

  <!--begin-request-body-post-accountlogin-email-->
  The primary email for this account.
  <!--end-request-body-post-accountlogin-email-->

* `authPW`: *string, min(64), max(64), regex(HEX_STRING), required*

  <!--begin-request-body-post-accountlogin-authPW-->
  The PBKDF2/HKDF stretched password as a hex string.
  <!--end-request-body-post-accountlogin-authPW-->

* `service`: *validators.service*

  <!--begin-request-body-post-accountlogin-service-->
  Opaque alphanumeric token to be included in verification links.
  <!--end-request-body-post-accountlogin-service-->

* `redirectTo`: *string, uri, optional*

  <!--begin-request-body-post-accountlogin-redirectTo-->
  
  <!--end-request-body-post-accountlogin-redirectTo-->

* `resume`: *string, optional*

  <!--begin-request-body-post-accountlogin-resume-->
  Opaque URL-encoded string to be included in the verification link as a query parameter.
  <!--end-request-body-post-accountlogin-resume-->

* `reason`: *string, max(16), optional*

  <!--begin-request-body-post-accountlogin-reason-->
  Alphanumeric string indicating the reason for establishing a new session; may be "login" (the default) or "reconnect".
  <!--end-request-body-post-accountlogin-reason-->

* `unblockCode`: *string, regex(BASE_36), length(unblockCodeLen), optional*

  <!--begin-request-body-post-accountlogin-unblockCode-->
  Alphanumeric code used to unblock certain rate-limitings.
  <!--end-request-body-post-accountlogin-unblockCode-->

* `metricsContext`: *metricsContext.schema*

  <!--begin-request-body-post-accountlogin-metricsContext-->
  
  <!--end-request-body-post-accountlogin-metricsContext-->

##### Response body

* `uid`: *string, regex(HEX_STRING), required*

  <!--begin-response-body-post-accountlogin-uid-->
  
  <!--end-response-body-post-accountlogin-uid-->

* `sessionToken`: *string, regex(HEX_STRING), required*

  <!--begin-response-body-post-accountlogin-sessionToken-->
  
  <!--end-response-body-post-accountlogin-sessionToken-->

* `keyFetchToken`: *string, regex(HEX_STRING), optional*

  <!--begin-response-body-post-accountlogin-keyFetchToken-->
  
  <!--end-response-body-post-accountlogin-keyFetchToken-->

* `verificationMethod`: *string, optional*

  <!--begin-response-body-post-accountlogin-verificationMethod-->
  The medium for how the user can verify.
  <!--end-response-body-post-accountlogin-verificationMethod-->

* `verificationReason`: *string, optional*

  <!--begin-response-body-post-accountlogin-verificationReason-->
  The authentication method that required additional verification.
  <!--end-response-body-post-accountlogin-verificationReason-->

* `verified`: *boolean, required*

  <!--begin-response-body-post-accountlogin-verified-->
  
  <!--end-response-body-post-accountlogin-verified-->

* `authAt`: *number, integer*

  <!--begin-response-body-post-accountlogin-authAt-->
  Authentication time for the session (seconds since epoch).
  <!--end-response-body-post-accountlogin-authAt-->

##### Error responses

Failing requests may be caused
by the following errors
(this is not an exhaustive list):

* `code: 400, errno: 125`:
  The request was blocked for security reasons

* `code: 400, errno: 142`:
  Sign in with this email type is not currently supported

* `code: 400, errno: 103`:
  Incorrect password

* `code: 400, errno: 127`:
  Invalid unblock code


#### GET /account/status

:lock::unlock: Optionally HAWK-authenticated with session token
<!--begin-route-get-accountstatus-->
Gets the status of an account.
<!--end-route-get-accountstatus-->

##### Query parameters

* `uid`: *string, min(32), max(32), regex(validators.HEX_STRING)*

  <!--begin-query-param-get-accountstatus-uid-->
  
  <!--end-query-param-get-accountstatus-uid-->

##### Error responses

Failing requests may be caused
by the following errors
(this is not an exhaustive list):

* `code: 400, errno: 108`:
  Missing parameter in request body


#### POST /account/status
<!--begin-route-post-accountstatus-->
Gets the status of an account
without exposing user data
through query params.
This endpoint is rate limited
by [fxa-customs-server](https://github.com/mozilla/fxa-customs-server).
<!--end-route-post-accountstatus-->

##### Request body

* `email`: *validators.email.required*

  <!--begin-request-body-post-accountstatus-email-->
  
  <!--end-request-body-post-accountstatus-email-->

##### Response body

* `exists`: *boolean, required*

  <!--begin-response-body-post-accountstatus-exists-->
  
  <!--end-response-body-post-accountstatus-exists-->


#### GET /account/profile

:lock::unlock: Optionally authenticated with OAuth bearer token, or HAWK-authenticated with session token
<!--begin-route-get-accountprofile-->
Get the email and locale of a user.

If an OAuth bearer token is used,
the values returned depend on
the scopes that the token is authorized for:

* `email` requires `profile:email` scope.

* `locale` require `profile:locale` scope.

The `profile` scope includes both
of the `email` and `locale` sub-scopes.
<!--end-route-get-accountprofile-->


#### GET /account/keys

:lock: HAWK-authenticated with key fetch token
<!--begin-route-get-accountkeys-->
Get the base-16 bundle of encrypted `kA|wrapKb`.
The return value must be decrypted
with a key derived from `keyFetchToken`,
then `wrapKb` must be further decrypted
with a key derived from the user's password.

Since `keyFetchToken` is single-use,
this can only be done once per session.
Note that `keyFetchToken` is consumed
regardless of whether the request succeeds or fails.

This request will fail
unless the account's email address and current session
has been verified.
<!--end-route-get-accountkeys-->

##### Response body

* `bundle`: *string, regex(validators.HEX_STRING)*

  <!--begin-response-body-get-accountkeys-bundle-->
  See [decrypting the bundle](https://wiki.mozilla.org/Identity/AttachedServices/KeyServerProtocol#Decrypting_the_getToken2_Response)
  for information on how to extract `kA|wrapKb`
  from the bundle.
  <!--end-response-body-get-accountkeys-bundle-->

##### Error responses

Failing requests may be caused
by the following errors
(this is not an exhaustive list):

* `code: 400, errno: 104`:
  Unverified account


#### POST /account/device

:lock: HAWK-authenticated with session token
<!--begin-route-post-accountdevice-->
Either:

* Registers a new device for this session
  if no device id is specified, or;

* Updates existing device details for this session
  if a device id is specified.

If no device id is specified,
both `name` and `type` must be provided.
If a device id is specified,
at least one of `name`, `type`, `pushCallback`
or the tuple `{ pushCallback, pushPublicKey, pushAuthKey }`
must be present.
Beware that if you provide `pushCallback`
without the pair `{ pushPublicKey, pushAuthKey }`,
both of those keys will be reset
to the empty string.

Devices should register with this endpoint
before attempting to obtain a signed certificate
and perform their first sync,
so that an appropriate device name
can be made available to other connected devices.
<!--end-route-post-accountdevice-->

##### Request body

* `id`: *string, length(32), regex(HEX_STRING), required*

  <!--begin-request-body-post-accountdevice-id-->
  
  <!--end-request-body-post-accountdevice-id-->

* `name`: *string, max(255), regex(DISPLAY_SAFE_UNICODE), optional*;<br />or *string, max(255), regex(DISPLAY_SAFE_UNICODE), required*

  <!--begin-request-body-post-accountdevice-name-->
  
  <!--end-request-body-post-accountdevice-name-->

* `type`: *string, max(16), optional*;<br />or *string, max(16), required*

  <!--begin-request-body-post-accountdevice-type-->
  
  <!--end-request-body-post-accountdevice-type-->

* `pushCallback`: *string, uri({ scheme: 'https' }), regex(PUSH_SERVER_REGEX), max(255), optional, allow('')*

  <!--begin-request-body-post-accountdevice-pushCallback-->
  
  <!--end-request-body-post-accountdevice-pushCallback-->

* `pushPublicKey`: *string, max(88), regex(URLSAFEBASE64), optional, allow('')*

  <!--begin-request-body-post-accountdevice-pushPublicKey-->
  
  <!--end-request-body-post-accountdevice-pushPublicKey-->

* `pushAuthKey`: *string, max(24), regex(URLSAFEBASE64), optional, allow('')*

  <!--begin-request-body-post-accountdevice-pushAuthKey-->
  
  <!--end-request-body-post-accountdevice-pushAuthKey-->

##### Response body

* `id`: *string, length(32), regex(HEX_STRING), required*

  <!--begin-response-body-post-accountdevice-id-->
  
  <!--end-response-body-post-accountdevice-id-->

* `createdAt`: *number, positive, optional*

  <!--begin-response-body-post-accountdevice-createdAt-->
  
  <!--end-response-body-post-accountdevice-createdAt-->

* `name`: *string, max(255), optional*

  <!--begin-response-body-post-accountdevice-name-->
  
  <!--end-response-body-post-accountdevice-name-->

* `type`: *string, max(16), optional*

  <!--begin-response-body-post-accountdevice-type-->
  
  <!--end-response-body-post-accountdevice-type-->

* `pushCallback`: *string, uri({ scheme: 'https' }), max(255), optional, allow('')*

  <!--begin-response-body-post-accountdevice-pushCallback-->
  
  <!--end-response-body-post-accountdevice-pushCallback-->

* `pushPublicKey`: *string, max(88), regex(URLSAFEBASE64), optional, allow('')*

  <!--begin-response-body-post-accountdevice-pushPublicKey-->
  
  <!--end-response-body-post-accountdevice-pushPublicKey-->

* `pushAuthKey`: *string, max(24), regex(URLSAFEBASE64), optional, allow('')*

  <!--begin-response-body-post-accountdevice-pushAuthKey-->
  
  <!--end-response-body-post-accountdevice-pushAuthKey-->

##### Error responses

Failing requests may be caused
by the following errors
(this is not an exhaustive list):

* `code: 503, errno: 202`:
  Feature not enabled


#### POST /account/devices/notify

:lock: HAWK-authenticated with session token
<!--begin-route-post-accountdevicesnotify-->
Notifies a set of devices associated with the user's account
of an event by sending a browser push notification.
A typical use case would be
to send a notification to another device
after sending a tab with Sync,
so it can sync too
and display the tab in a timely manner.
<!--end-route-post-accountdevicesnotify-->

##### Request body

* `to`: *string, valid('all'), required*;<br />or *array, items(string, length(32), regex(HEX_STRING)), required*

  <!--begin-request-body-post-accountdevicesnotify-to-->
  Devices to notify.
  May be the string `'all'`
  or an array
  containing the relevant device ids.
  <!--end-request-body-post-accountdevicesnotify-to-->

* `excluded`: *array, items(string, length(32), regex(HEX_STRING)), optional*

  <!--begin-request-body-post-accountdevicesnotify-excluded-->
  Array of device ids
  to exclude from the notification.
  Ignored unless `to:"all"` is specified.
  <!--end-request-body-post-accountdevicesnotify-excluded-->

* `payload`: *object, required*

  <!--begin-request-body-post-accountdevicesnotify-payload-->
  Push payload,
  validated against [`pushpayloads.schema.json`](pushpayloads.schema.json).
  <!--end-request-body-post-accountdevicesnotify-payload-->

* `TTL`: *number, integer, min(0), optional*

  <!--begin-request-body-post-accountdevicesnotify-TTL-->
  Push notification TTL,
  defaults to `0`.
  <!--end-request-body-post-accountdevicesnotify-TTL-->

##### Error responses

Failing requests may be caused
by the following errors
(this is not an exhaustive list):

* `code: 503, errno: 202`:
  Feature not enabled

* `code: 400, errno: 107`:
  Invalid parameter in request body


#### GET /account/devices

:lock: HAWK-authenticated with session token
<!--begin-route-get-accountdevices-->
Returns an array
of registered device objects
for the authenticated user.
<!--end-route-get-accountdevices-->

##### Response body

* `id`: *string, length(32), regex(HEX_STRING), required*

  <!--begin-response-body-get-accountdevices-id-->
  
  <!--end-response-body-get-accountdevices-id-->

* `isCurrentDevice`: *boolean, required*

  <!--begin-response-body-get-accountdevices-isCurrentDevice-->
  
  <!--end-response-body-get-accountdevices-isCurrentDevice-->

* `lastAccessTime`: *number, min(0), required, allow(null)*

  <!--begin-response-body-get-accountdevices-lastAccessTime-->
  
  <!--end-response-body-get-accountdevices-lastAccessTime-->

* `lastAccessTimeFormatted`: *string, optional, allow('')*

  <!--begin-response-body-get-accountdevices-lastAccessTimeFormatted-->
  
  <!--end-response-body-get-accountdevices-lastAccessTimeFormatted-->

* `name`: *string, max(255), required, allow('')*

  <!--begin-response-body-get-accountdevices-name-->
  
  <!--end-response-body-get-accountdevices-name-->

* `type`: *string, max(16), required*

  <!--begin-response-body-get-accountdevices-type-->
  
  <!--end-response-body-get-accountdevices-type-->

* `pushCallback`: *string, uri({ scheme: 'https' }), max(255), optional, allow(''), allow(null)*

  <!--begin-response-body-get-accountdevices-pushCallback-->
  
  <!--end-response-body-get-accountdevices-pushCallback-->

* `pushPublicKey`: *string, max(88), regex(URLSAFEBASE64), optional, allow(''), allow(null)*

  <!--begin-response-body-get-accountdevices-pushPublicKey-->
  
  <!--end-response-body-get-accountdevices-pushPublicKey-->

* `pushAuthKey`: *string, max(24), regex(URLSAFEBASE64), optional, allow(''), allow(null)*

  <!--begin-response-body-get-accountdevices-pushAuthKey-->
  
  <!--end-response-body-get-accountdevices-pushAuthKey-->


#### GET /account/sessions

:lock: HAWK-authenticated with session token
<!--begin-route-get-accountsessions-->
Returns an array
of session objects
for the authenticated user.
<!--end-route-get-accountsessions-->

##### Response body

* `id`: *string, regex(HEX_STRING), required*

  <!--begin-response-body-get-accountsessions-id-->
  
  <!--end-response-body-get-accountsessions-id-->

* `lastAccessTime`: *number, min(0), required, allow(null)*

  <!--begin-response-body-get-accountsessions-lastAccessTime-->
  
  <!--end-response-body-get-accountsessions-lastAccessTime-->

* `lastAccessTimeFormatted`: *string, optional, allow('')*

  <!--begin-response-body-get-accountsessions-lastAccessTimeFormatted-->
  
  <!--end-response-body-get-accountsessions-lastAccessTimeFormatted-->

* `userAgent`: *string, max(255), required, allow('')*

  <!--begin-response-body-get-accountsessions-userAgent-->
  
  <!--end-response-body-get-accountsessions-userAgent-->

* `os`: *string, max(255), allow(''), allow(null)*

  <!--begin-response-body-get-accountsessions-os-->
  
  <!--end-response-body-get-accountsessions-os-->

* `deviceId`: *string, regex(HEX_STRING), allow(null)*

  <!--begin-response-body-get-accountsessions-deviceId-->
  
  <!--end-response-body-get-accountsessions-deviceId-->

* `deviceName`: *string, max(255), required, allow(''), allow(null)*

  <!--begin-response-body-get-accountsessions-deviceName-->
  
  <!--end-response-body-get-accountsessions-deviceName-->

* `deviceType`: *string, max(16), required, allow(null)*

  <!--begin-response-body-get-accountsessions-deviceType-->
  
  <!--end-response-body-get-accountsessions-deviceType-->

* `deviceCallbackURL`: *string, uri({ scheme: 'https' }), max(255), optional, allow(''), allow(null)*

  <!--begin-response-body-get-accountsessions-deviceCallbackURL-->
  
  <!--end-response-body-get-accountsessions-deviceCallbackURL-->

* `deviceCallbackPublicKey`: *string, max(88), regex(URLSAFEBASE64), optional, allow(''), allow(null)*

  <!--begin-response-body-get-accountsessions-deviceCallbackPublicKey-->
  
  <!--end-response-body-get-accountsessions-deviceCallbackPublicKey-->

* `deviceCallbackAuthKey`: *string, max(24), regex(URLSAFEBASE64), optional, allow(''), allow(null)*

  <!--begin-response-body-get-accountsessions-deviceCallbackAuthKey-->
  
  <!--end-response-body-get-accountsessions-deviceCallbackAuthKey-->

* `isDevice`: *boolean, required*

  <!--begin-response-body-get-accountsessions-isDevice-->
  
  <!--end-response-body-get-accountsessions-isDevice-->

* `isCurrentDevice`: *boolean, required*

  <!--begin-response-body-get-accountsessions-isCurrentDevice-->
  
  <!--end-response-body-get-accountsessions-isCurrentDevice-->


#### POST /account/device/destroy

:lock: HAWK-authenticated with session token
<!--begin-route-post-accountdevicedestroy-->
Destroys a device record
and the associated `sessionToken`
for the authenticated user.
The identified device must sign in again
to use the API after this request has succeeded.
<!--end-route-post-accountdevicedestroy-->

##### Request body

* `id`: *string, length(32), regex(HEX_STRING), required*

  <!--begin-request-body-post-accountdevicedestroy-id-->
  
  <!--end-request-body-post-accountdevicedestroy-id-->


#### GET /recovery_email/status

:lock: HAWK-authenticated with session token
<!--begin-route-get-recovery_emailstatus-->
Returns the "verified" status
for the account's recovery email address.

Currently, each account is associated
with exactly one email address.
This address must be verified
before the account can be used
(specifically, `POST /certificate/sign` and `GET /account/keys`
will return errors until the address is verified).
In the future, this may be expanded to include multiple addresses,
and/or alternate types of recovery methods (e.g. SMS).
A new API will be provided for this extra functionality.

This call is used to determine the current state
(verified or unverified)
of the account.
During account creation,
until the address is verified,
the agent can poll this method
to discover when it should proceed
with `POST /certificate/sign` and `GET /account/keys`.
<!--end-route-get-recovery_emailstatus-->

##### Query parameters

* `reason`: *string, max(16), optional*

  <!--begin-query-param-get-recovery_emailstatus-reason-->
  
  <!--end-query-param-get-recovery_emailstatus-reason-->

##### Response body

* `email`: *string, required*

  <!--begin-response-body-get-recovery_emailstatus-email-->
  
  <!--end-response-body-get-recovery_emailstatus-email-->

* `verified`: *boolean, required*

  <!--begin-response-body-get-recovery_emailstatus-verified-->
  
  <!--end-response-body-get-recovery_emailstatus-verified-->

* `sessionVerified`: *boolean, optional*

  <!--begin-response-body-get-recovery_emailstatus-sessionVerified-->
  
  <!--end-response-body-get-recovery_emailstatus-sessionVerified-->

* `emailVerified`: *boolean, optional*

  <!--begin-response-body-get-recovery_emailstatus-emailVerified-->
  
  <!--end-response-body-get-recovery_emailstatus-emailVerified-->

##### Error responses

Failing requests may be caused
by the following errors
(this is not an exhaustive list):

* `code: 401, errno: 110`:
  Invalid authentication token in request signature


#### POST /recovery_email/resend_code

:lock: HAWK-authenticated with session token
<!--begin-route-post-recovery_emailresend_code-->
Re-sends a verification code
to the account's recovery email address.
The code is first sent when the account is created,
but if the user thinks the message was lost
or accidentally deleted,
they can request a new message to be sent
via this endpoint.
The new message will contain the same code
as the original message.
When this code is provided to `/v1/recovery_email/verify_code`,
the email will be marked as "verified".

This endpoint may send a verification email to the user.
Callers may optionally provide
the `service` parameter to indicate
what identity-attached service
they're acting on behalf of.
This is an opaque alphanumeric token
that will be embedded
in the verification link
as a query parameter.
<!--end-route-post-recovery_emailresend_code-->

##### Query parameters

* `service`: *validators.service*

  <!--begin-query-param-post-recovery_emailresend_code-service-->
  Opaque alphanumeric token to be included in verification links.
  <!--end-query-param-post-recovery_emailresend_code-service-->

##### Request body

* `email`: *validators.email.optional*

  <!--begin-request-body-post-recovery_emailresend_code-email-->
  
  <!--end-request-body-post-recovery_emailresend_code-email-->

* `service`: *validators.service*

  <!--begin-request-body-post-recovery_emailresend_code-service-->
  Opaque alphanumeric token to be included in verification links.
  <!--end-request-body-post-recovery_emailresend_code-service-->

* `redirectTo`: *validators.redirectTo(config.smtp.redirectDomain).optional*

  <!--begin-request-body-post-recovery_emailresend_code-redirectTo-->
  
  <!--end-request-body-post-recovery_emailresend_code-redirectTo-->

* `resume`: *string, max(2048), optional*

  <!--begin-request-body-post-recovery_emailresend_code-resume-->
  Opaque URL-encoded string to be included in the verification link as a query parameter.
  <!--end-request-body-post-recovery_emailresend_code-resume-->

* `metricsContext`: *metricsContext.schema*

  <!--begin-request-body-post-recovery_emailresend_code-metricsContext-->
  
  <!--end-request-body-post-recovery_emailresend_code-metricsContext-->


#### POST /recovery_email/verify_code
<!--begin-route-post-recovery_emailverify_code-->
Verify tokens and/or recovery emails for an account.
If a valid token code is detected,
the account email and tokens will be set to verified.
If a valid email code is detected,
the email will be marked as verified.

The verification code will be a random token,
delivered in the fragment identifier of a URL
sent to the user's email address.
Navigating to the URL opens a page
that extracts the code from the fragment identifier
and performs a POST to `/recovery_email/verify_code`.
The link can be clicked from any browser,
not just the one being attached to the Firefox account.
<!--end-route-post-recovery_emailverify_code-->

##### Query parameters

* `service`: *validators.service*

  <!--begin-query-param-post-recovery_emailverify_code-service-->
  Opaque alphanumeric token to be included in verification links.
  <!--end-query-param-post-recovery_emailverify_code-service-->

* `reminder`: *string, max(32), alphanum, optional*

  <!--begin-query-param-post-recovery_emailverify_code-reminder-->
  The reminder email associated with the code.
  <!--end-query-param-post-recovery_emailverify_code-reminder-->

* `type`: *string, max(32), alphanum, optional*

  <!--begin-query-param-post-recovery_emailverify_code-type-->
  The type of code being verified.
  <!--end-query-param-post-recovery_emailverify_code-type-->

##### Request body

* `uid`: *string, max(32), regex(HEX_STRING), required*

  <!--begin-request-body-post-recovery_emailverify_code-uid-->
  
  <!--end-request-body-post-recovery_emailverify_code-uid-->

* `code`: *string, min(32), max(32), regex(HEX_STRING), required*

  <!--begin-request-body-post-recovery_emailverify_code-code-->
  
  <!--end-request-body-post-recovery_emailverify_code-code-->

* `service`: *validators.service*

  <!--begin-request-body-post-recovery_emailverify_code-service-->
  Opaque alphanumeric token to be included in verification links.
  <!--end-request-body-post-recovery_emailverify_code-service-->

* `reminder`: *string, max(32), alphanum, optional*

  <!--begin-request-body-post-recovery_emailverify_code-reminder-->
  The reminder email associated with the code.
  <!--end-request-body-post-recovery_emailverify_code-reminder-->

* `type`: *string, max(32), alphanum, optional*

  <!--begin-request-body-post-recovery_emailverify_code-type-->
  The type of code being verified.
  <!--end-request-body-post-recovery_emailverify_code-type-->

##### Error responses

Failing requests may be caused
by the following errors
(this is not an exhaustive list):

* `code: 400, errno: 105`:
  Invalid verification code


#### GET /recovery_emails

:lock: HAWK-authenticated with session token
<!--begin-route-get-recovery_emails-->
Returns an array of objects
containing details of the email addresses
associated with the logged-in user.
Currently,
the primary email address
is always the one
from the `accounts` table.
<!--end-route-get-recovery_emails-->

##### Response body

* `verified`: *boolean, required*

  <!--begin-response-body-get-recovery_emails-verified-->
  
  <!--end-response-body-get-recovery_emails-verified-->

* `isPrimary`: *boolean, required*

  <!--begin-response-body-get-recovery_emails-isPrimary-->
  
  <!--end-response-body-get-recovery_emails-isPrimary-->

* `email`: *validators.email.required*

  <!--begin-response-body-get-recovery_emails-email-->
  
  <!--end-response-body-get-recovery_emails-email-->

##### Error responses

Failing requests may be caused
by the following errors
(this is not an exhaustive list):

* `code: 503, errno: 202`:
  Feature not enabled


#### POST /recovery_email

:lock: HAWK-authenticated with session token
<!--begin-route-post-recovery_email-->
Add a secondary email address
to the logged-in account.
The created address will be unverified
and will not replace the primary email address.
<!--end-route-post-recovery_email-->

##### Request body

* `email`: *validators.email.required*

  <!--begin-request-body-post-recovery_email-email-->
  The email address to add to the account.
  <!--end-request-body-post-recovery_email-email-->

##### Error responses

Failing requests may be caused
by the following errors
(this is not an exhaustive list):

* `code: 503, errno: 202`:
  Feature not enabled

* `code: 400, errno: 104`:
  Unverified account

* `code: 400, errno: 138`:
  Unverified session

* `code: 400, errno: 139`:
  Can not add secondary email that is same as your primary

* `code: 400, errno: 140`:
  Email already exists

* `code: 400, errno: 141`:
  Email already exists


#### POST /recovery_email/destroy

:lock: HAWK-authenticated with session token
<!--begin-route-post-recovery_emaildestroy-->
Delete an email address
associated with the logged-in user.
<!--end-route-post-recovery_emaildestroy-->

##### Request body

* `email`: *validators.email.required*

  <!--begin-request-body-post-recovery_emaildestroy-email-->
  The email address to delete.
  <!--end-request-body-post-recovery_emaildestroy-email-->

##### Error responses

Failing requests may be caused
by the following errors
(this is not an exhaustive list):

* `code: 503, errno: 202`:
  Feature not enabled

* `code: 400, errno: 138`:
  Unverified session


#### POST /account/unlock/resend_code
<!--begin-route-post-accountunlockresend_code-->
This endpoint is deprecated.
<!--end-route-post-accountunlockresend_code-->

##### Error responses

Failing requests may be caused
by the following errors
(this is not an exhaustive list):

* `code: 410, errno: 116`:
  This endpoint is no longer supported


#### POST /account/unlock/verify_code
<!--begin-route-post-accountunlockverify_code-->
This endpoint is deprecated.
<!--end-route-post-accountunlockverify_code-->

##### Error responses

Failing requests may be caused
by the following errors
(this is not an exhaustive list):

* `code: 410, errno: 116`:
  This endpoint is no longer supported


#### POST /account/login/send_unblock_code
<!--begin-route-post-accountloginsend_unblock_code-->
Send an unblock code via email
to reset rate-limiting for an account.
<!--end-route-post-accountloginsend_unblock_code-->

##### Request body

* `email`: *validators.email.required*

  <!--begin-request-body-post-accountloginsend_unblock_code-email-->
  Primary email for the account.
  <!--end-request-body-post-accountloginsend_unblock_code-email-->

* `metricsContext`: *metricsContext.schema*

  <!--begin-request-body-post-accountloginsend_unblock_code-metricsContext-->
  
  <!--end-request-body-post-accountloginsend_unblock_code-metricsContext-->


#### POST /account/login/reject_unblock_code
<!--begin-route-post-accountloginreject_unblock_code-->
Used to reject and report
unblock codes that were not requested by the user.
<!--end-route-post-accountloginreject_unblock_code-->

##### Request body

* `uid`: *string, max(32), regex(HEX_STRING), required*

  <!--begin-request-body-post-accountloginreject_unblock_code-uid-->
  The user id.
  <!--end-request-body-post-accountloginreject_unblock_code-uid-->

* `unblockCode`: *string, regex(BASE_36), length(unblockCodeLen), required*

  <!--begin-request-body-post-accountloginreject_unblock_code-unblockCode-->
  The unblock code.
  <!--end-request-body-post-accountloginreject_unblock_code-unblockCode-->


#### POST /account/reset

:lock: HAWK-authenticated with account reset token
<!--begin-route-post-accountreset-->
This sets the account password
and resets `wrapKb` to a new random value.

Account reset tokens are single-use
and consumed regardless of
whether the request succeeds or fails.
They are returned by
the `POST /password/forgot/verify_code` endpoint.

The caller can optionally request
a new `sessionToken` and `keyFetchToken`.
<!--end-route-post-accountreset-->

##### Query parameters

* `keys`: *boolean, optional*

  <!--begin-query-param-post-accountreset-keys-->
  Indicates whether a new `keyFetchToken` is required, default to `false`.
  <!--end-query-param-post-accountreset-keys-->

##### Request body

* `authPW`: *string, min(64), max(64), regex(HEX_STRING), required*

  <!--begin-request-body-post-accountreset-authPW-->
  The PBKDF2/HKDF-stretched password as a hex string.
  <!--end-request-body-post-accountreset-authPW-->

* `sessionToken`: *boolean, optional*

  <!--begin-request-body-post-accountreset-sessionToken-->
  Indicates whether a new `sessionToken` is required, default to `false`.
  <!--end-request-body-post-accountreset-sessionToken-->

* `metricsContext`: *metricsContext.schema*

  <!--begin-request-body-post-accountreset-metricsContext-->
  
  <!--end-request-body-post-accountreset-metricsContext-->

##### Error responses

Failing requests may be caused
by the following errors
(this is not an exhaustive list):

* `code: 400, errno: 108`:
  Missing parameter in request body


#### POST /account/destroy
<!--begin-route-post-accountdestroy-->
Deletes an account.
All stored data is erased.
The client should seek user confirmation first.
The client should erase data
stored on any attached services
before deleting the user's account data.
<!--end-route-post-accountdestroy-->

##### Request body

* `email`: *validators.email.required*

  <!--begin-request-body-post-accountdestroy-email-->
  Primary email address of the account.
  <!--end-request-body-post-accountdestroy-email-->

* `authPW`: *string, min(64), max(64), regex(HEX_STRING), required*

  <!--begin-request-body-post-accountdestroy-authPW-->
  The PBKDF2/HKDF-stretched password as a hex string.
  <!--end-request-body-post-accountdestroy-authPW-->

##### Error responses

Failing requests may be caused
by the following errors
(this is not an exhaustive list):

* `code: 400, errno: 103`:
  Incorrect password


### Password

#### POST /password/change/start
<!--begin-route-post-passwordchangestart-->
Begin the "change password" process.
Returns a single-use `passwordChangeToken`,
to be sent to `POST /password/change/finish`.
Also returns a single-use `keyFetchToken`.
<!--end-route-post-passwordchangestart-->

##### Request body

* `email`: *validators.email.required*

  <!--begin-request-body-post-passwordchangestart-email-->
  Primary email address of the account.
  <!--end-request-body-post-passwordchangestart-email-->

* `oldAuthPW`: *string, min(64), max(64), regex(HEX_STRING), required*

  <!--begin-request-body-post-passwordchangestart-oldAuthPW-->
  The PBKDF2/HKDF-stretched password as a hex string.
  <!--end-request-body-post-passwordchangestart-oldAuthPW-->

##### Error responses

Failing requests may be caused
by the following errors
(this is not an exhaustive list):

* `code: 400, errno: 103`:
  Incorrect password


#### POST /password/change/finish

:lock: HAWK-authenticated with password change token
<!--begin-route-post-passwordchangefinish-->
Change the password and update `wrapKb`.
Optionally returns `sessionToken` and `keyFetchToken`.
<!--end-route-post-passwordchangefinish-->

##### Query parameters

* `keys`: *boolean, optional*

  <!--begin-query-param-post-passwordchangefinish-keys-->
  Indicates whether a new `keyFetchToken` is required, default to `false`.
  <!--end-query-param-post-passwordchangefinish-keys-->

##### Request body

* `authPW`: *string, min(64), max(64), regex(HEX_STRING), required*

  <!--begin-request-body-post-passwordchangefinish-authPW-->
  The PBKDF2/HKDF-stretched password as a hex string.
  <!--end-request-body-post-passwordchangefinish-authPW-->

* `wrapKb`: *string, min(64), max(64), regex(HEX_STRING), required*

  <!--begin-request-body-post-passwordchangefinish-wrapKb-->
  The new `wrapKb` value as a hex string.
  <!--end-request-body-post-passwordchangefinish-wrapKb-->

* `sessionToken`: *string, min(64), max(64), regex(HEX_STRING), optional*

  <!--begin-request-body-post-passwordchangefinish-sessionToken-->
  Indicates whether a new `sessionToken` is required, default to `false`.
  <!--end-request-body-post-passwordchangefinish-sessionToken-->


#### POST /password/forgot/send_code
<!--begin-route-post-passwordforgotsend_code-->
Requests a "reset password" code
to be sent to the user's recovery email.
The user should type this code into the agent,
which will then submit it
to `POST /password/forgot/verify_code`.

The code will be either 8 or 16 digits long,
with the length indicated in the response.
The email will either contain the code itself
or the URL for a web page that displays the code.

The response includes `passwordForgotToken`,
which must be submitted with the code
to `POST /password/forgot/verify_code`.

The response also specifies the TTL of `passwordForgotToken`
and an upper limit on the number of times
the token may be submitted.
By limiting the number of submission attempts,
we also limit an attacker's ability to guess the code.
After the token expires,
or the maximum number of submissions has been made,
the agent must call this endpoint again
to generate a new code and token pair.

Each account can have at most
one `passwordForgotToken` valid at a time.
Calling this endpoint causes existing tokens
to be invalidated and a new one created.
Each token is associated with a specific code,
so by extension the codes are invalidated
with their tokens.
<!--end-route-post-passwordforgotsend_code-->

##### Query parameters

* `service`: *validators.service*

  <!--begin-query-param-post-passwordforgotsend_code-service-->
  Identifies the relying service
  the user was interacting with
  that triggered the password reset.
  <!--end-query-param-post-passwordforgotsend_code-service-->

* `keys`: *boolean, optional*

  <!--begin-query-param-post-passwordforgotsend_code-keys-->
  
  <!--end-query-param-post-passwordforgotsend_code-keys-->

##### Request body

* `email`: *validators.email.required*

  <!--begin-request-body-post-passwordforgotsend_code-email-->
  Recovery email for the account.
  <!--end-request-body-post-passwordforgotsend_code-email-->

* `service`: *validators.service*

  <!--begin-request-body-post-passwordforgotsend_code-service-->
  Identifies the relying service
  the user was interacting with
  that triggered the password reset.
  <!--end-request-body-post-passwordforgotsend_code-service-->

* `redirectTo`: *validators.redirectTo(redirectDomain).optional*

  <!--begin-request-body-post-passwordforgotsend_code-redirectTo-->
  URL that the client should be redirected to
  after handling the request.
  <!--end-request-body-post-passwordforgotsend_code-redirectTo-->

* `resume`: *string, max(2048), optional*

  <!--begin-request-body-post-passwordforgotsend_code-resume-->
  Opaque URL-encoded string to be included in the verification link as a query parameter.
  <!--end-request-body-post-passwordforgotsend_code-resume-->

* `metricsContext`: *metricsContext.schema*

  <!--begin-request-body-post-passwordforgotsend_code-metricsContext-->
  
  <!--end-request-body-post-passwordforgotsend_code-metricsContext-->

##### Response body

* `passwordForgotToken`: *string*

  <!--begin-response-body-post-passwordforgotsend_code-passwordForgotToken-->
  
  <!--end-response-body-post-passwordforgotsend_code-passwordForgotToken-->

* `ttl`: *number*

  <!--begin-response-body-post-passwordforgotsend_code-ttl-->
  
  <!--end-response-body-post-passwordforgotsend_code-ttl-->

* `codeLength`: *number*

  <!--begin-response-body-post-passwordforgotsend_code-codeLength-->
  
  <!--end-response-body-post-passwordforgotsend_code-codeLength-->

* `tries`: *number*

  <!--begin-response-body-post-passwordforgotsend_code-tries-->
  
  <!--end-response-body-post-passwordforgotsend_code-tries-->

##### Error responses

Failing requests may be caused
by the following errors
(this is not an exhaustive list):

* `code: 400, errno: 145`:
  Reset password with this email type is not currently supported


#### POST /password/forgot/resend_code

:lock: HAWK-authenticated with password forgot token
<!--begin-route-post-passwordforgotresend_code-->
Resends the email
from `POST /password/forgot/send_code`,
for use when the original email
has been lost or accidentally deleted.

This endpoint requires the `passwordForgotToken`
returned in the original response,
so only the original client which started the process
may request a resent message.
The response will match that from
`POST /password/forgot/send_code`,
except `ttl` will be lower
to indicate the shorter validity period.
`tries` will also be lower
if `POST /password/forgot/verify_code`
has been called.
<!--end-route-post-passwordforgotresend_code-->

##### Query parameters

* `service`: *validators.service*

  <!--begin-query-param-post-passwordforgotresend_code-service-->
  Identifies the relying service
  the user was interacting with
  that triggered the password reset.
  <!--end-query-param-post-passwordforgotresend_code-service-->

##### Request body

* `email`: *validators.email.required*

  <!--begin-request-body-post-passwordforgotresend_code-email-->
  Recovery email for the account.
  <!--end-request-body-post-passwordforgotresend_code-email-->

* `service`: *validators.service*

  <!--begin-request-body-post-passwordforgotresend_code-service-->
  Identifies the relying service
  the user was interacting with
  that triggered the password reset.
  <!--end-request-body-post-passwordforgotresend_code-service-->

* `redirectTo`: *validators.redirectTo(redirectDomain).optional*

  <!--begin-request-body-post-passwordforgotresend_code-redirectTo-->
  URL that the client should be redirected to
  after handling the request.
  <!--end-request-body-post-passwordforgotresend_code-redirectTo-->

* `resume`: *string, max(2048), optional*

  <!--begin-request-body-post-passwordforgotresend_code-resume-->
  Opaque URL-encoded string to be included in the verification link as a query parameter.
  <!--end-request-body-post-passwordforgotresend_code-resume-->

* `metricsContext`: *metricsContext.schema*

  <!--begin-request-body-post-passwordforgotresend_code-metricsContext-->
  
  <!--end-request-body-post-passwordforgotresend_code-metricsContext-->

##### Response body

* `passwordForgotToken`: *string*

  <!--begin-response-body-post-passwordforgotresend_code-passwordForgotToken-->
  
  <!--end-response-body-post-passwordforgotresend_code-passwordForgotToken-->

* `ttl`: *number*

  <!--begin-response-body-post-passwordforgotresend_code-ttl-->
  
  <!--end-response-body-post-passwordforgotresend_code-ttl-->

* `codeLength`: *number*

  <!--begin-response-body-post-passwordforgotresend_code-codeLength-->
  
  <!--end-response-body-post-passwordforgotresend_code-codeLength-->

* `tries`: *number*

  <!--begin-response-body-post-passwordforgotresend_code-tries-->
  
  <!--end-response-body-post-passwordforgotresend_code-tries-->


#### POST /password/forgot/verify_code

:lock: HAWK-authenticated with password forgot token
<!--begin-route-post-passwordforgotverify_code-->
The code returned by `POST /v1/password/forgot/send_code`
should be submitted to this endpoint
with the `passwordForgotToken`.
For successful requests,
the server will return `accountResetToken`,
to be submitted in requests to `POST /account/reset`
to reset the account password and `wrapKb`.
<!--end-route-post-passwordforgotverify_code-->

##### Request body

* `code`: *string, min(32), max(32), regex(HEX_STRING), required*

  <!--begin-request-body-post-passwordforgotverify_code-code-->
  The code sent to the user's recovery email.
  <!--end-request-body-post-passwordforgotverify_code-code-->

* `metricsContext`: *metricsContext.schema*

  <!--begin-request-body-post-passwordforgotverify_code-metricsContext-->
  
  <!--end-request-body-post-passwordforgotverify_code-metricsContext-->

##### Response body

* `accountResetToken`: *string*

  <!--begin-response-body-post-passwordforgotverify_code-accountResetToken-->
  
  <!--end-response-body-post-passwordforgotverify_code-accountResetToken-->

##### Error responses

Failing requests may be caused
by the following errors
(this is not an exhaustive list):

* `code: 400, errno: 105`:
  Invalid verification code


#### GET /password/forgot/status

:lock: HAWK-authenticated with password forgot token
<!--begin-route-get-passwordforgotstatus-->
Returns the status of a `passwordForgotToken`.
Success responses indicate
the token has not yet been consumed.
For consumed or expired tokens,
an HTTP `401` response
with `errno: 110`
will be returned.
<!--end-route-get-passwordforgotstatus-->

##### Response body

* `tries`: *number*

  <!--begin-response-body-get-passwordforgotstatus-tries-->
  
  <!--end-response-body-get-passwordforgotstatus-tries-->

* `ttl`: *number*

  <!--begin-response-body-get-passwordforgotstatus-ttl-->
  
  <!--end-response-body-get-passwordforgotstatus-ttl-->


### Session

#### POST /session/destroy

:lock: HAWK-authenticated with session token
<!--begin-route-post-sessiondestroy-->
Destroys the current session
and invalidates `sessionToken`,
to be called when a user signs out.
To sign back in,
a call must be made to
`POST /account/login`
to obtain a new `sessionToken`.
<!--end-route-post-sessiondestroy-->

##### Request body

* `customSessionToken`: *string, min(64), max(64), regex(HEX_STRING), optional*

  <!--begin-request-body-post-sessiondestroy-customSessionToken-->
  Custom session token id to destroy.
  <!--end-request-body-post-sessiondestroy-customSessionToken-->

##### Error responses

Failing requests may be caused
by the following errors
(this is not an exhaustive list):

* `code: 401, errno: 110`:
  Invalid authentication token in request signature


#### GET /session/status

:lock: HAWK-authenticated with session token
<!--begin-route-get-sessionstatus-->
Returns a success response
if the session token is valid.
<!--end-route-get-sessionstatus-->

##### Response body

* `state`: *string, required*

  <!--begin-response-body-get-sessionstatus-state-->
  
  <!--end-response-body-get-sessionstatus-state-->

* `uid`: *string, regex(HEX_STRING), required*

  <!--begin-response-body-get-sessionstatus-uid-->
  
  <!--end-response-body-get-sessionstatus-uid-->


### Sign

#### POST /certificate/sign

:lock: HAWK-authenticated with session token
<!--begin-route-post-certificatesign-->
Sign a BrowserID public key.
The server is given a public key
and returns a signed certificate
using the same JWT-like mechanism
as a BrowserID primary IdP would
(see [browserid-certifier](https://github.com/mozilla/browserid-certifier) for details).
The signed certificate includes
a `principal.email` property
to indicate the Firefox Account identifier
(a UUID at the account server's primary domain)
and is stamped with an expiry time
based on the `duration` parameter.

This request will fail unless the
primary email address for the account
has been verified.

Clients should include a query parameter, `service`,
for metrics and validation purposes.
The value of `service` should be
`sync` when connecting to Firefox Sync
or the OAuth `client_id`
when connecting to an OAuth relier.

If you do not specify a `service` parameter,
or if you specify `service=sync`,
this endpoint assumes the request is from
a legacy Sync client.
If the session token
doesn't have a corresponding device record,
one will be created automatically by the server.

The signed certificate includes these additional claims:

* `fxa-generation`:
  A number that increases
  each time the user's password is changed.

* `fxa-lastAuthAt`:
  Authentication time for this session,
  in seconds since epoch.

* `fxa-verifiedEmail`:
  The user's verified recovery email address.
<!--end-route-post-certificatesign-->

##### Query parameters

* `service`: *validators.service*

  <!--begin-query-param-post-certificatesign-service-->
  
  <!--end-query-param-post-certificatesign-service-->

##### Request body

* `publicKey`: *object({ algorithm: string, valid('RS', 'DS'), required, n: string, e: string, y: string, p: string, q: string, g: string, version: string }), required*

  <!--begin-request-body-post-certificatesign-publicKey-->
  The key to sign
  (run `bin/generate-keypair`
  from [browserid-crypto](https://github.com/mozilla/browserid-crypto)).
  <!--end-request-body-post-certificatesign-publicKey-->

* `duration`: *number, integer, min(0), max(), required*

  <!--begin-request-body-post-certificatesign-duration-->
  Time interval in milliseconds
  until the certificate will expire,
  up to a maximum of 24 hours.
  <!--end-request-body-post-certificatesign-duration-->

##### Error responses

Failing requests may be caused
by the following errors
(this is not an exhaustive list):

* `code: 400, errno: 104`:
  Unverified account

* `code: 400, errno: 108`:
  Missing parameter in request body


### Sms

#### POST /sms

:lock: HAWK-authenticated with session token
<!--begin-route-post-sms-->
Sends an SMS message.
<!--end-route-post-sms-->

##### Request body

* `phoneNumber`: *string, regex(validators.E164_NUMBER), required*

  <!--begin-request-body-post-sms-phoneNumber-->
  The phone number to send the message to, in E.164 format.
  <!--end-request-body-post-sms-phoneNumber-->

* `messageId`: *number, positive, required*

  <!--begin-request-body-post-sms-messageId-->
  The id of the message to send.
  <!--end-request-body-post-sms-messageId-->

* `metricsContext`: *metricsContext.schema*

  <!--begin-request-body-post-sms-metricsContext-->
  
  <!--end-request-body-post-sms-metricsContext-->

##### Error responses

Failing requests may be caused
by the following errors
(this is not an exhaustive list):

* `code: 400, errno: 129`:
  Invalid phone number

* `code: 400, errno: 130`:
  Invalid region


#### GET /sms/status

:lock: HAWK-authenticated with session token
<!--begin-route-get-smsstatus-->
Returns SMS status for the current user.
<!--end-route-get-smsstatus-->

##### Query parameters

* `country`: *string, regex(/^[A-Z][A-Z]$/), optional*

  <!--begin-query-param-get-smsstatus-country-->
  Skip geo-lookup
  and act as if the user
  is in the specified country.
  <!--end-query-param-get-smsstatus-country-->

##### Error responses

Failing requests may be caused
by the following errors
(this is not an exhaustive list):

* `code: 500, errno: 999`:
  Unspecified error


### Util

#### POST /get_random_bytes
<!--begin-route-post-get_random_bytes-->
Get 32 bytes of random data.
This should be combined with locally-sourced entropy
when creating salts, etc.
<!--end-route-post-get_random_bytes-->


#### GET /verify_email
<!--begin-route-get-verify_email-->

<!--end-route-get-verify_email-->

##### Query parameters

* `code`: *string, max(32), regex(HEX_STRING), required*

  <!--begin-query-param-get-verify_email-code-->
  
  <!--end-query-param-get-verify_email-code-->

* `uid`: *string, max(32), regex(HEX_STRING), required*

  <!--begin-query-param-get-verify_email-uid-->
  
  <!--end-query-param-get-verify_email-uid-->

* `service`: *string, max(16), alphanum, optional*

  <!--begin-query-param-get-verify_email-service-->
  
  <!--end-query-param-get-verify_email-service-->

* `redirectTo`: *validators.redirectTo(redirectDomain).optional*

  <!--begin-query-param-get-verify_email-redirectTo-->
  
  <!--end-query-param-get-verify_email-redirectTo-->


#### GET /complete_reset_password
<!--begin-route-get-complete_reset_password-->

<!--end-route-get-complete_reset_password-->

##### Query parameters

* `email`: *validators.email.required*

  <!--begin-query-param-get-complete_reset_password-email-->
  
  <!--end-query-param-get-complete_reset_password-email-->

* `code`: *string, max(32), regex(HEX_STRING), required*

  <!--begin-query-param-get-complete_reset_password-code-->
  
  <!--end-query-param-get-complete_reset_password-code-->

* `token`: *string, max(64), regex(HEX_STRING), required*

  <!--begin-query-param-get-complete_reset_password-token-->
  
  <!--end-query-param-get-complete_reset_password-token-->

* `service`: *string, max(16), alphanum, optional*

  <!--begin-query-param-get-complete_reset_password-service-->
  
  <!--end-query-param-get-complete_reset_password-service-->

* `redirectTo`: *validators.redirectTo(redirectDomain).optional*

  <!--begin-query-param-get-complete_reset_password-redirectTo-->
  
  <!--end-query-param-get-complete_reset_password-redirectTo-->


## Back-off protocol
<!--begin-back-off-protocol-->
During periods of heavy load,
the server may request that clients enter a "back-off" state,
in which they avoid making further requests.

At such times,
it will return a `503 Service Unavailable` response
with a `Retry-After` header denoting the number of seconds to wait
before issuing any further requests.
It will also include `errno: 201`
and a `retryAfter` field
matching the value of the `Retry-After` header
in the body.

For example,
the following response indicates that the client
should suspend making further requests
for 30 seconds:

```
HTTP/1.1 503 Service Unavailable
Retry-After: 30
Content-Type: application/json

{
  "code": 503,
  "errno": 201,
  "error": "Service Unavailable",
  "message": "Service unavailable",
  "info": "https://github.com/mozilla/fxa-auth-server/blob/master/docs/api.md#response-format",
  "retryAfter": 30,
  "retryAfterLocalized": "in a few seconds"
}
```
<!--end-back-off-protocol-->

## This document
<!--begin-this-document-->
This document is automatically generated
by [a script](../scripts/write-api-docs.js)
that parses the source code
and the document itself.

All changes to this document will be lost
unless they are made inside
delimiting HTML comments of the form:
```html
<!--begin-foo-bar-->
YOUR CHANGE GOES HERE
<!--end-foo-bar->
```

`foo-bar` must be a tag
that, when camel-cased,
matches a property name in the data
for the [mustache template](../scripts/api-docs.mustache)
this document is generated from.

If you want to change
the structure of the document,
you must make your changes
to `scripts/api-docs.mustache`
rather than in this document directly.
<!--end-this-document-->
