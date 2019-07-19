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

- [Overview](#overview)
  - [URL structure](#url-structure)
  - [Request format](#request-format)
  - [Response format](#response-format)
    - [Defined errors](#defined-errors)
    - [Responses from intermediary servers](#responses-from-intermediary-servers)
  - [Validation](#validation)
- [API endpoints](#api-endpoints)
  - [Account](#account)
    - [POST /account/create](#post-accountcreate)
    - [POST /account/login](#post-accountlogin)
    - [GET /account/status (:lock::unlock: sessionToken)](#get-accountstatus)
    - [POST /account/status](#post-accountstatus)
    - [GET /account/profile (:lock: sessionToken, oauthToken)](#get-accountprofile)
    - [GET /account/keys (:lock: keyFetchToken)](#get-accountkeys)
    - [POST /account/unlock/resend_code](#post-accountunlockresend_code)
    - [POST /account/unlock/verify_code](#post-accountunlockverify_code)
    - [POST /account/reset (:lock: accountResetToken)](#post-accountreset)
    - [POST /account/destroy (:lock::unlock: sessionToken)](#post-accountdestroy)
    - [GET /account (:lock: sessionToken)](#get-account)
  - [Attached clients](#attached-clients)
    - [GET /account/attached_clients (:lock: sessionToken)](#get-accountattached_clients)
    - [POST /account/attached_client/destroy (:lock: sessionToken)](#post-accountattached_clientdestroy)
  - [Devices and sessions](#devices-and-sessions)
    - [POST /account/device (:lock: sessionToken, refreshToken)](#post-accountdevice)
    - [GET /account/device/commands (:lock: sessionToken, refreshToken)](#get-accountdevicecommands)
    - [POST /account/devices/invoke_command (:lock: sessionToken, refreshToken)](#post-accountdevicesinvoke_command)
    - [POST /account/devices/notify (:lock: sessionToken, refreshToken)](#post-accountdevicesnotify)
    - [GET /account/devices (:lock: sessionToken, refreshToken)](#get-accountdevices)
    - [GET /account/sessions (:lock: sessionToken)](#get-accountsessions)
    - [POST /account/device/destroy (:lock: sessionToken, refreshToken)](#post-accountdevicedestroy)
  - [Emails](#emails)
    - [GET /recovery_email/status (:lock: sessionToken)](#get-recovery_emailstatus)
    - [POST /recovery_email/resend_code (:lock: sessionToken)](#post-recovery_emailresend_code)
    - [POST /recovery_email/verify_code](#post-recovery_emailverify_code)
    - [GET /recovery_emails (:lock: sessionToken)](#get-recovery_emails)
    - [POST /recovery_email (:lock: sessionToken)](#post-recovery_email)
    - [POST /recovery_email/destroy (:lock: sessionToken)](#post-recovery_emaildestroy)
    - [POST /recovery_email/set_primary (:lock: sessionToken)](#post-recovery_emailset_primary)
  - [Oauth](#oauth)
    - [GET /oauth/client/{client_id}](#get-oauthclientclient_id)
    - [POST /account/scoped-key-data (:lock: sessionToken)](#post-accountscoped-key-data)
    - [POST /oauth/authorization (:lock: sessionToken)](#post-oauthauthorization)
    - [POST /oauth/token (:lock::unlock: sessionToken)](#post-oauthtoken)
  - [Password](#password)
    - [POST /password/change/start](#post-passwordchangestart)
    - [POST /password/change/finish (:lock: passwordChangeToken)](#post-passwordchangefinish)
    - [POST /password/forgot/send_code](#post-passwordforgotsend_code)
    - [POST /password/forgot/resend_code (:lock: passwordForgotToken)](#post-passwordforgotresend_code)
    - [POST /password/forgot/verify_code (:lock: passwordForgotToken)](#post-passwordforgotverify_code)
    - [GET /password/forgot/status (:lock: passwordForgotToken)](#get-passwordforgotstatus)
  - [Recovery codes](#recovery-codes)
    - [GET /recoveryCodes (:lock: sessionToken)](#get-recoverycodes)
    - [POST /session/verify/recoveryCode (:lock: sessionToken)](#post-sessionverifyrecoverycode)
  - [Recovery key](#recovery-key)
    - [POST /recoveryKey (:lock: sessionToken)](#post-recoverykey)
    - [GET /recoveryKey/{recoveryKeyId} (:lock: accountResetToken)](#get-recoverykeyrecoverykeyid)
    - [POST /recoveryKey/exists (:lock::unlock: sessionToken)](#post-recoverykeyexists)
    - [DELETE /recoveryKey (:lock: sessionToken)](#delete-recoverykey)
  - [Security events](#security-events)
    - [GET /securityEvents (:lock: sessionToken)](#get-securityevents)
    - [DELETE /securityEvents (:lock: sessionToken)](#delete-securityevents)
  - [Session](#session)
    - [POST /session/destroy (:lock: sessionToken)](#post-sessiondestroy)
    - [POST /session/reauth (:lock: sessionToken)](#post-sessionreauth)
    - [GET /session/status (:lock: sessionToken)](#get-sessionstatus)
    - [POST /session/duplicate (:lock: sessionToken)](#post-sessionduplicate)
  - [Sign](#sign)
    - [POST /certificate/sign (:lock: sessionToken)](#post-certificatesign)
  - [Signin codes](#signin-codes)
    - [POST /signinCodes/consume](#post-signincodesconsume)
  - [Sms](#sms)
    - [POST /sms (:lock: sessionToken)](#post-sms)
    - [GET /sms/status (:lock: sessionToken)](#get-smsstatus)
  - [Subscriptions](#subscriptions)
    - [GET /oauth/subscriptions/clients (:lock: subscriptionsSecret)](#get-oauthsubscriptionsclients)
    - [GET /oauth/subscriptions/plans (:lock: oauthToken)](#get-oauthsubscriptionsplans)
    - [GET /oauth/subscriptions/active (:lock: oauthToken)](#get-oauthsubscriptionsactive)
    - [POST /oauth/subscriptions/active (:lock: oauthToken)](#post-oauthsubscriptionsactive)
    - [POST /oauth/subscriptions/updatePayment (:lock: oauthToken)](#post-oauthsubscriptionsupdatepayment)
    - [GET /oauth/subscriptions/customer (:lock: oauthToken)](#get-oauthsubscriptionscustomer)
    - [DELETE /oauth/subscriptions/active/{subscriptionId} (:lock: oauthToken)](#delete-oauthsubscriptionsactivesubscriptionid)
    - [POST /oauth/subscriptions/reactivate (:lock: oauthToken)](#post-oauthsubscriptionsreactivate)
  - [Support](#support)
    - [POST /support/ticket (:lock: oauthToken)](#post-supportticket)
  - [Token codes](#token-codes)
    - [POST /session/verify/token (:lock: sessionToken)](#post-sessionverifytoken)
  - [Totp](#totp)
    - [POST /totp/create (:lock: sessionToken)](#post-totpcreate)
    - [POST /totp/destroy (:lock: sessionToken)](#post-totpdestroy)
    - [GET /totp/exists (:lock: sessionToken)](#get-totpexists)
    - [POST /session/verify/totp (:lock: sessionToken)](#post-sessionverifytotp)
  - [Unblock codes](#unblock-codes)
    - [POST /account/login/send_unblock_code](#post-accountloginsend_unblock_code)
    - [POST /account/login/reject_unblock_code](#post-accountloginreject_unblock_code)
  - [Util](#util)
    - [POST /get_random_bytes](#post-get_random_bytes)
    - [GET /verify_email](#get-verify_email)
    - [GET /complete_reset_password](#get-complete_reset_password)
- [Example flows](#example-flows)
- [Back-off protocol](#back-off-protocol)
- [This document](#this-document)

## Overview

### URL structure

<!--begin-url-structure-->

All requests use URLs of the form:

```
https://<base-URI>/v1/<endpoint-path>
```

Note that:

- All API access must be over a properly-validated HTTPS connection.
- The URL embeds a version identifier `v1`.
  Future revisions of this API may introduce new version numbers.
- The base URI of the server may be configured on a per-client basis:
  - For a list of development servers
    see [Firefox Accounts deployments on MDN](https://developer.mozilla.org/en-US/Firefox_Accounts#Firefox_Accounts_deployments).
  - The canonical URL for Mozilla's hosted Firefox Accounts server
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

- `Accept-Language`
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

- `code: 400, errno: 100`:
  Incorrect Database Patch Level
- `code: 400, errno: 101`:
  Account already exists
- `code: 400, errno: 102`:
  Unknown account
- `code: 400, errno: 103`:
  Incorrect password
- `code: 400, errno: 104`:
  Unverified account
- `code: 400, errno: 105`:
  Invalid verification code
- `code: 400, errno: 106`:
  Invalid JSON in request body
- `code: 400, errno: 107`:
  Invalid parameter in request body
- `code: 400, errno: 108`:
  Unspecified error
- `code: 401, errno: 109`:
  Invalid request signature
- `code: 401, errno: 110`:
  Invalid authentication token in request signature
- `code: 401, errno: 111`:
  Invalid timestamp in request signature
- `code: 411, errno: 112`:
  Missing content-length header
- `code: 413, errno: 113`:
  Request body too large
- `code: 429, errno: 114`:
  Client has sent too many requests
- `code: 401, errno: 115`:
  Invalid nonce in request signature
- `code: 410, errno: 116`:
  This endpoint is no longer supported
- `code: 400, errno: 120`:
  Incorrect email case
- `code: 400, errno: 123`:
  Unknown device
- `code: 400, errno: 124`:
  Session already registered by another device
- `code: 400, errno: 125`:
  The request was blocked for security reasons
- `code: 400, errno: 126`:
  Account must be reset
- `code: 400, errno: 127`:
  Invalid unblock code
- `code: 400, errno: 129`:
  Invalid phone number
- `code: 400, errno: 130`:
  Invalid region
- `code: 400, errno: 131`:
  Invalid message id
- `code: 500, errno: 132`:
  Message rejected
- `code: 400, errno: 133`:
  Email account sent complaint
- `code: 400, errno: 134`:
  Email account hard bounced
- `code: 400, errno: 135`:
  Email account soft bounced
- `code: 400, errno: 136`:
  Email already exists
- `code: 400, errno: 137`:
  Can not delete primary email
- `code: 400, errno: 138`:
  Unverified session
- `code: 400, errno: 139`:
  Can not add secondary email that is same as your primary
- `code: 400, errno: 140`:
  Email already exists
- `code: 400, errno: 141`:
  Email already exists
- `code: 400, errno: 142`:
  Sign in with this email type is not currently supported
- `code: 400, errno: 143`:
  Unknown email
- `code: 400, errno: 144`:
  Email already exists
- `code: 400, errno: 145`:
  Reset password with this email type is not currently supported
- `code: 400, errno: 146`:
  Invalid signin code
- `code: 400, errno: 147`:
  Can not change primary email to an unverified email
- `code: 400, errno: 148`:
  Can not change primary email to an email that does not belong to this account
- `code: 400, errno: 149`:
  This email can not currently be used to login
- `code: 400, errno: 150`:
  Can not resend email code to an email that does not belong to this account
- `code: 500, errno: 151`:
  Failed to send email
- `code: 422, errno: 151`:
  Failed to send email
- `code: 400, errno: 152`:
  Invalid token verification code
- `code: 400, errno: 153`:
  Expired token verification code
- `code: 400, errno: 154`:
  TOTP token already exists for this account.
- `code: 400, errno: 155`:
  TOTP token not found.
- `code: 400, errno: 156`:
  Recovery code not found.
- `code: 400, errno: 157`:
  Unavailable device command.
- `code: 400, errno: 158`:
  Recovery key not found.
- `code: 400, errno: 159`:
  Recovery key is not valid.
- `code: 400, errno: 160`:
  This request requires two step authentication enabled on your account.
- `code: 400, errno: 161`:
  Recovery key already exists.
- `code: 400, errno: 162`:
  Unknown client_id
- `code: 400, errno: 163`:
  Requested scopes are not allowed
- `code: 400, errno: 164`:
  Stale auth timestamp
- `code: 409, errno: 165`:
  Redis WATCH detected a conflicting update
- `code: 400, errno: 166`:
  Not a public client
- `code: 400, errno: 167`:
  Incorrect redirect URI
- `code: 400, errno: 168`:
  Invalid response_type
- `code: 400, errno: 169`:
  Public clients require PKCE OAuth parameters
- `code: 400, errno: 170`:
  Required Authentication Context Reference values could not be satisfied
- `code: 400, errno: 171`:
  Incorrect client_secret
- `code: 400, errno: 172`:
  Unknown authorization code
- `code: 400, errno: 173`:
  Mismatched authorization code
- `code: 400, errno: 174`:
  Expired authorization code
- `code: 400, errno: 175`:
  Public clients require PKCE OAuth parameters
- `code: 404, errno: 176`:
  Unknown customer
- `code: 404, errno: 177`:
  Unknown subscription
- `code: 400, errno: 178`:
  Unknown subscription plan
- `code: 400, errno: 179`:
  message
- `code: 400, errno: 180`:
  Subscription has already been cancelled
- `code: 400, errno: 181`:
  message
- `code: 400, errno: 182`:
  Unknown refresh token
- `code: 503, errno: 201`:
  Service unavailable
- `code: 503, errno: 202`:
  Feature not enabled
- `code: 500, errno: 203`:
  A backend service request failed.
- `code: 503, errno: 204`:
  This client has been temporarily disabled
- `code: 500, errno: 998`:
  An internal validation check failed.

The following errors
include additional response properties:

- `errno: 100`: level, levelRequired
- `errno: 101`: email
- `errno: 102`: email
- `errno: 103`: email
- `errno: 105`
- `errno: 107`: validation
- `errno: 108`: param
- `errno: 111`: serverTime
- `errno: 114`: retryAfter, retryAfterLocalized, verificationMethod, verificationReason
- `errno: 120`: email
- `errno: 124`: deviceId
- `errno: 125`: verificationMethod, verificationReason
- `errno: 126`: email
- `errno: 130`: region
- `errno: 132`: reason, reasonCode
- `errno: 133`: bouncedAt
- `errno: 134`: bouncedAt
- `errno: 135`: bouncedAt
- `errno: 152`
- `errno: 153`
- `errno: 162`: clientId
- `errno: 163`: invalidScopes
- `errno: 164`: authAt
- `errno: 167`: redirectUri
- `errno: 170`: foundValue
- `errno: 171`: clientId
- `errno: 172`: code
- `errno: 173`: code, clientId
- `errno: 174`: code, expiredAt
- `errno: 175`: pkceHashValue
- `errno: 176`: uid
- `errno: 177`: subscriptionId
- `errno: 178`: planId
- `errno: 179`
- `errno: 181`
- `errno: 201`: retryAfter
- `errno: 202`: retryAfter
- `errno: 203`: service, operation
- `errno: 204`: clientId, retryAfter
- `errno: 998`: op, data

#### Responses from intermediary servers

<!--begin-responses-from-intermediary-servers-->

As with any HTTP-based API,
clients must handle standard errors that may be returned
by proxies, load-balancers or other intermediary servers.
These non-application responses can be identified
by the absence of a correctly-formatted JSON response body.

Common examples include:

- `413 Request Entity Too Large`:
  may be returned by an upstream proxy server.
- `502 Gateway Timeout`:
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

- `HEX_STRING`: `/^(?:[a-fA-F0-9]{2})+$/`
- `BASE_36`: `/^[a-zA-Z0-9]*$/`
- `URL_SAFE_BASE_64`: `/^[A-Za-z0-9_-]+$/`
- `PKCE_CODE_VERIFIER`: `/^[A-Za-z0-9-\._~]{43,128}$/`
- `DISPLAY_SAFE_UNICODE`: `/^(?:[^\u0000-\u001F\u007F\u0080-\u009F\u2028-\u2029\uD800-\uDFFF\uE000-\uF8FF\uFFF9-\uFFFF])*$/`
- `DISPLAY_SAFE_UNICODE_WITH_NON_BMP`: `/^(?:[^\u0000-\u001F\u007F\u0080-\u009F\u2028-\u2029\uE000-\uF8FF\uFFF9-\uFFFF])*$/`
- `BEARER_AUTH_REGEX`: `/^Bearer\s+([a-z0-9+\/]+)$/i`
- `service`: `string, max(16), regex(/^[a-zA-Z0-9\-]*$/)`
- `hexString`: `string, regex(/^(?:[a-fA-F0-9]{2})+$/)`
- `clientId`: `module.exports.hexString.length(16)`
- `clientSecret`: `module.exports.hexString`
- `refreshToken`: `module.exports.hexString.length(64)`
- `authorizationCode`: `module.exports.hexString.length(64)`
- `scope`: `string, max(256), regex(/^[a-zA-Z0-9 _\/.:-]*$/), allow('')`
- `assertion`: `string, min(50), max(10240), regex(/^[a-zA-Z0-9_\-\.~=]+$/)`
- `pkceCodeChallengeMethod`: `string, valid('S256')`
- `pkceCodeChallenge`: `string, length(43), regex(module, exports.URL_SAFE_BASE_64)`
- `pkceCodeVerifier`: `string, min(43), max(128), regex(module, exports.PKCE_CODE_VERIFIER)`
- `jwe`: `string, max(1024), regex(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/)`
- `jwt`: `string, max(1024), regex(/^([a-zA-Z0-9\-_]+)\.([a-zA-Z0-9\-_]+)\.([a-zA-Z0-9\-_]+)$/)`
- `accessToken`: `alternatives, try()`
- `verificationMethod`: `string, valid()`
- `authPW`: `string, length(64), regex(HEX_STRING), required`
- `wrapKb`: `string, length(64), regex(/^(?:[a-fA-F0-9]{2})+$/)`
- `recoveryKeyId`: `string, regex(HEX_STRING), max(32)`
- `recoveryData`: `string, regex(/[a-zA-Z0-9.]/), max(1024), required`
- `subscriptionsSubscriptionId`: `string, max(255)`
- `subscriptionsPlanId`: `string, max(255)`
- `subscriptionsProductId`: `string, max(255)`
- `subscriptionsProductName`: `string, max(255)`
- `subscriptionsPaymentToken`: `string, max(255)`
- `activeSubscriptionValidator`: `object({ uid: string, required, subscriptionId: module, exports, subscriptionsSubscriptionId, required, productName: module, exports, subscriptionsProductId, required, createdAt: number, required, cancelledAt: alternatives(number, any, allow(null)) })`
- `subscriptionsSubscriptionValidator`: `object({ current_period_end: number, required, current_period_start: number, required, cancel_at_period_end: boolean, required, end_at: alternatives(number, any, allow(null)), failure_code: string, optional, failure_message: string, optional, plan_name: string, required, plan_id: module, exports, subscriptionsPlanId, required, status: string, required, subscription_id: module, exports, subscriptionsSubscriptionId, required })`
- `subscriptionsSubscriptionListValidator`: `object({ subscriptions: array, items(module, exports, subscriptionsSubscriptionValidator) })`
- `subscriptionsPlanValidator`: `object({ plan_id: module, exports, subscriptionsPlanId, required, plan_name: string, required, product_id: module, exports, subscriptionsProductId, required, product_name: string, required, interval: string, required, amount: number, required, currency: string, required })`
- `subscriptionsCustomerValidator`: `object({ exp_month: number, required, exp_year: number, required, last4: string, required, payment_type: string, required, subscriptions: array, items(module, exports, subscriptionsSubscriptionValidator), optional })`
- `ppidSeed`: `number, integer, min(0), max(1024)`
- `E164_NUMBER`: `/^\+[1-9]\d{1,14}$/`
- `DIGITS`: `/^[0-9]+$/`
- `DEVICE_COMMAND_NAME`: `/^[a-zA-Z0-9._\/\-:]{1,100}$/`
- `IP_ADDRESS`: `string, ip`

#### lib/metrics/context

- `SCHEMA`: object({

  - `deviceId`: string, length(32), regex(HEX_STRING), optional
  - `entrypoint`: ENTRYPOINT_SCHEMA.optional
  - `entrypointExperiment`: ENTRYPOINT_SCHEMA.optional
  - `entrypointVariation`: ENTRYPOINT_SCHEMA.optional
  - `flowId`: string, length(64), regex(HEX_STRING), optional
  - `flowBeginTime`: number, integer, positive, optional
  - `utmCampaign`: UTM_CAMPAIGN_SCHEMA.optional
  - `utmContent`: UTM_SCHEMA.optional
  - `utmMedium`: UTM_SCHEMA.optional
  - `utmSource`: UTM_SCHEMA.optional
  - `utmTerm`: UTM_SCHEMA.optional

  }), unknown(false), and('flowId', 'flowBeginTime')

- `schema`: SCHEMA.optional
- `requiredSchema`: SCHEMA.required

#### lib/features

- `schema`: array, items(string), optional

#### lib/devices

- `schema`: {

  - `id`: isA.string.length(32).regex(HEX_STRING)
  - `location`: isA.object({
    - `city`: isA.string.optional.allow(null)
    - `country`: isA.string.optional.allow(null)
    - `state`: isA.string.optional.allow(null)
    - `stateCode`: isA.string.optional.allow(null)
    - })
  - `name`: isA.string.max(255).regex(DISPLAY_SAFE_UNICODE_WITH_NON_BMP)
  - `nameResponse`: isA.string.max(255).allow('')
  - `type`: isA.string.max(16)
  - `pushCallback`: validators.pushCallbackUrl({ scheme: 'https' }).regex(PUSH_SERVER_REGEX).max(255).allow('')
  - `pushPublicKey`: isA.string.max(88).regex(URL_SAFE_BASE_64).allow('')
  - `pushAuthKey`: isA.string.max(24).regex(URL_SAFE_BASE_64).allow('')
  - `pushEndpointExpired`: isA.boolean.strict
  - `availableCommands`: isA.object.pattern(validators.DEVICE_COMMAND_NAME
  - `isA.string.max(2048))

  }

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

- `keys`: _boolean, optional_

  <!--begin-query-param-post-accountcreate-keys-->

  Indicates whether a key-fetch token should be returned in the success response.

  <!--end-query-param-post-accountcreate-keys-->

- `service`: _validators.service_

  <!--begin-query-param-post-accountcreate-service-->

  Opaque alphanumeric token to be included in verification links.

  <!--end-query-param-post-accountcreate-service-->

##### Request body

- `email`: _validators.email.required_

  <!--begin-request-body-post-accountcreate-email-->

  The primary email for this account.

  <!--end-request-body-post-accountcreate-email-->

- `authPW`: _validators.authPW_

  <!--begin-request-body-post-accountcreate-authPW-->

  The PBKDF2/HKDF-stretched password as a hex string.

  <!--end-request-body-post-accountcreate-authPW-->

- `preVerified`: _boolean_

  <!--begin-request-body-post-accountcreate-preVerified-->

  <!--end-request-body-post-accountcreate-preVerified-->

- `service`: _validators.service_

  <!--begin-request-body-post-accountcreate-service-->

  Opaque alphanumeric token to be included in verification links.

  <!--end-request-body-post-accountcreate-service-->

- `redirectTo`: _validators.redirectTo(config.smtp.redirectDomain).optional_

  <!--begin-request-body-post-accountcreate-redirectTo-->

  URL that the client should be redirected to after handling the request.

  <!--end-request-body-post-accountcreate-redirectTo-->

- `resume`: _string, max(2048), optional_

  <!--begin-request-body-post-accountcreate-resume-->

  Opaque URL-encoded string to be included in the verification link as a query parameter.

  <!--end-request-body-post-accountcreate-resume-->

- `metricsContext`: _metricsContext.schema_

  <!--begin-request-body-post-accountcreate-metricsContext-->

  <!--end-request-body-post-accountcreate-metricsContext-->

- `style`: _string, allow(), optional_

  <!--begin-request-body-post-accountcreate-style-->

  <!--end-request-body-post-accountcreate-style-->

##### Response body

- `uid`: _string, regex(HEX_STRING), required_

  <!--begin-response-body-post-accountcreate-uid-->

  <!--end-response-body-post-accountcreate-uid-->

- `sessionToken`: _string, regex(HEX_STRING), required_

  <!--begin-response-body-post-accountcreate-sessionToken-->

  <!--end-response-body-post-accountcreate-sessionToken-->

- `keyFetchToken`: _string, regex(HEX_STRING), optional_

  <!--begin-response-body-post-accountcreate-keyFetchToken-->

  <!--end-response-body-post-accountcreate-keyFetchToken-->

- `authAt`: _number, integer_

  <!--begin-response-body-post-accountcreate-authAt-->

  Authentication time for the session (seconds since epoch).

  <!--end-response-body-post-accountcreate-authAt-->

##### Error responses

Failing requests may be caused
by the following errors
(this is not an exhaustive list):

- `code: 400, errno: 101`:
  Account already exists
- `code: 400, errno: 144`:
  Email already exists
- `code: 503, errno: 204`:
  This client has been temporarily disabled

#### POST /account/login

<!--begin-route-post-accountlogin-->

Obtain a `sessionToken` and, optionally, a `keyFetchToken` if `keys=true`.

<!--end-route-post-accountlogin-->

##### Query parameters

- `keys`: _boolean, optional_

  <!--begin-query-param-post-accountlogin-keys-->

  Indicates whether a key-fetch token should be returned in the success response.

  <!--end-query-param-post-accountlogin-keys-->

- `service`: _validators.service_

  <!--begin-query-param-post-accountlogin-service-->

  Opaque alphanumeric token to be included in verification links.

  <!--end-query-param-post-accountlogin-service-->

- `verificationMethod`: _validators.verificationMethod.optional_

  <!--begin-query-param-post-accountlogin-verificationMethod-->

  If this param is specified, it forces the login to be verified using the
  specified method.

  Currently supported methods:

  - `email`
    - Sends an email with a confirmation link.
  - `email-2fa`
    - Sends an email with a confirmation code.
  - `email-captcha`
    - Sends an email with an unblock code.

  <!--end-query-param-post-accountlogin-verificationMethod-->

##### Request body

- `email`: _validators.email.required_

  <!--begin-request-body-post-accountlogin-email-->

  The primary email for this account.

  <!--end-request-body-post-accountlogin-email-->

- `authPW`: _validators.authPW_

  <!--begin-request-body-post-accountlogin-authPW-->

  The PBKDF2/HKDF stretched password as a hex string.

  <!--end-request-body-post-accountlogin-authPW-->

- `service`: _validators.service_

  <!--begin-request-body-post-accountlogin-service-->

  Opaque alphanumeric token to be included in verification links.

  <!--end-request-body-post-accountlogin-service-->

- `redirectTo`: _validators.redirectTo(config.smtp.redirectDomain).optional_

  <!--begin-request-body-post-accountlogin-redirectTo-->

  <!--end-request-body-post-accountlogin-redirectTo-->

- `resume`: _string, optional_

  <!--begin-request-body-post-accountlogin-resume-->

  Opaque URL-encoded string to be included in the verification link as a query parameter.

  <!--end-request-body-post-accountlogin-resume-->

- `reason`: _string, max(16), optional_

  <!--begin-request-body-post-accountlogin-reason-->

  Alphanumeric string indicating the reason for establishing a new session; may be "login" (the default) or "reconnect".

  <!--end-request-body-post-accountlogin-reason-->

- `unblockCode`: _signinUtils.validators.UNBLOCK_CODE_

  <!--begin-request-body-post-accountlogin-unblockCode-->

  Alphanumeric code used to unblock certain rate-limitings.

  <!--end-request-body-post-accountlogin-unblockCode-->

- `metricsContext`: _metricsContext.schema_

  <!--begin-request-body-post-accountlogin-metricsContext-->

  <!--end-request-body-post-accountlogin-metricsContext-->

- `originalLoginEmail`: _validators.email.optional_

  <!--begin-request-body-post-accountlogin-originalLoginEmail-->

  This parameter is the original email used to login with. Typically, it is specified after a user logins with a different email case, or changed their primary email address.

  <!--end-request-body-post-accountlogin-originalLoginEmail-->

- `verificationMethod`: _validators.verificationMethod.optional_

  <!--begin-request-body-post-accountlogin-verificationMethod-->

  If this param is specified, it forces the login to be verified using the
  specified method.

  Currently supported methods:

  - `email`
    - Sends an email with a confirmation link.
  - `email-2fa`
    - Sends an email with a confirmation code.
  - `email-captcha`
    - Sends an email with an unblock code.

  <!--end-request-body-post-accountlogin-verificationMethod-->

##### Response body

- `uid`: _string, regex(HEX_STRING), required_

  <!--begin-response-body-post-accountlogin-uid-->

  <!--end-response-body-post-accountlogin-uid-->

- `sessionToken`: _string, regex(HEX_STRING), required_

  <!--begin-response-body-post-accountlogin-sessionToken-->

  <!--end-response-body-post-accountlogin-sessionToken-->

- `keyFetchToken`: _string, regex(HEX_STRING), optional_

  <!--begin-response-body-post-accountlogin-keyFetchToken-->

  <!--end-response-body-post-accountlogin-keyFetchToken-->

- `verificationMethod`: _string, optional_

  <!--begin-response-body-post-accountlogin-verificationMethod-->

  The medium for how the user can verify.

  <!--end-response-body-post-accountlogin-verificationMethod-->

- `verificationReason`: _string, optional_

  <!--begin-response-body-post-accountlogin-verificationReason-->

  The authentication method that required additional verification.

  <!--end-response-body-post-accountlogin-verificationReason-->

- `verified`: _boolean, required_

  <!--begin-response-body-post-accountlogin-verified-->

  <!--end-response-body-post-accountlogin-verified-->

- `authAt`: _number, integer_

  <!--begin-response-body-post-accountlogin-authAt-->

  Authentication time for the session (seconds since epoch).

  <!--end-response-body-post-accountlogin-authAt-->

##### Error responses

Failing requests may be caused
by the following errors
(this is not an exhaustive list):

- `code: 400, errno: 102`:
  Unknown account
- `code: 400, errno: 103`:
  Incorrect password
- `code: 400, errno: 125`:
  The request was blocked for security reasons
- `code: 400, errno: 127`:
  Invalid unblock code
- `code: 400, errno: 142`:
  Sign in with this email type is not currently supported
- `code: 400, errno: 149`:
  This email can not currently be used to login
- `code: 400, errno: 160`:
  This request requires two step authentication enabled on your account.
- `code: 422, errno: 151`:
  Failed to send email
- `code: 503, errno: 204`:
  This client has been temporarily disabled

#### GET /account/status

:lock::unlock: Optionally HAWK-authenticated with session token

<!--begin-route-get-accountstatus-->

Gets the status of an account.

<!--end-route-get-accountstatus-->

##### Query parameters

- `uid`: _string, min(32), max(32), regex(validators.HEX_STRING)_

  <!--begin-query-param-get-accountstatus-uid-->

  <!--end-query-param-get-accountstatus-uid-->

##### Error responses

Failing requests may be caused
by the following errors
(this is not an exhaustive list):

- `code: 400, errno: 108`:
  Unspecified error

#### POST /account/status

<!--begin-route-post-accountstatus-->

Gets the status of an account
without exposing user data
through query params.
This endpoint is rate limited
by [fxa-customs-server](https://github.com/mozilla/fxa-customs-server).

<!--end-route-post-accountstatus-->

##### Request body

- `email`: _validators.email.required_

  <!--begin-request-body-post-accountstatus-email-->

  <!--end-request-body-post-accountstatus-email-->

##### Response body

- `exists`: _boolean, required_

  <!--begin-response-body-post-accountstatus-exists-->

  <!--end-response-body-post-accountstatus-exists-->

#### GET /account/profile

:lock: authenticated with OAuth bearer token or HAWK-authenticated with session token

<!--begin-route-get-accountprofile-->

Get the email and locale of a user.

If an OAuth bearer token is used,
the values returned depend on
the scopes that the token is authorized for:

- `email` requires `profile:email` scope.

- `locale` requires `profile:locale` scope.

- `authenticationMethods` and `authenticatorAssuranceLevel` require `profile:amr` scope.

The `profile` scope includes all the above sub-scopes.

<!--end-route-get-accountprofile-->

##### Response body

- `email`: _string, optional_

  <!--begin-response-body-get-accountprofile-email-->

  <!--end-response-body-get-accountprofile-email-->

- `locale`: _string, optional, allow(null)_

  <!--begin-response-body-get-accountprofile-locale-->

  <!--end-response-body-get-accountprofile-locale-->

- `authenticationMethods`: _array, items(string, required), optional_

  <!--begin-response-body-get-accountprofile-authenticationMethods-->

  <!--end-response-body-get-accountprofile-authenticationMethods-->

- `authenticatorAssuranceLevel`: _number, min(0)_

  <!--begin-response-body-get-accountprofile-authenticatorAssuranceLevel-->

  <!--end-response-body-get-accountprofile-authenticatorAssuranceLevel-->

- `subscriptions`: _array, items(string, required), optional_

  <!--begin-response-body-get-accountprofile-subscriptions-->

  <!--end-response-body-get-accountprofile-subscriptions-->

- `profileChangedAt`: _number, min(0)_

  <!--begin-response-body-get-accountprofile-profileChangedAt-->

  <!--end-response-body-get-accountprofile-profileChangedAt-->

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

- `bundle`: _string, regex(validators.HEX_STRING)_

  <!--begin-response-body-get-accountkeys-bundle-->

  See [decrypting the bundle](https://wiki.mozilla.org/Identity/AttachedServices/KeyServerProtocol#Decrypting_the_getToken2_Response)
  for information on how to extract `kA|wrapKb`
  from the bundle.

  <!--end-response-body-get-accountkeys-bundle-->

##### Error responses

Failing requests may be caused
by the following errors
(this is not an exhaustive list):

- `code: 400, errno: 104`:
  Unverified account

#### POST /account/unlock/resend_code

<!--begin-route-post-accountunlockresend_code-->

This endpoint is deprecated.

<!--end-route-post-accountunlockresend_code-->

##### Error responses

Failing requests may be caused
by the following errors
(this is not an exhaustive list):

- `code: 410, errno: 116`:
  This endpoint is no longer supported

#### POST /account/unlock/verify_code

<!--begin-route-post-accountunlockverify_code-->

This endpoint is deprecated.

<!--end-route-post-accountunlockverify_code-->

##### Error responses

Failing requests may be caused
by the following errors
(this is not an exhaustive list):

- `code: 410, errno: 116`:
  This endpoint is no longer supported

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

- `keys`: _boolean, optional_

  <!--begin-query-param-post-accountreset-keys-->

  Indicates whether a new `keyFetchToken` is required, default to `false`.

  <!--end-query-param-post-accountreset-keys-->

##### Request body

- `authPW`: _validators.authPW_

  <!--begin-request-body-post-accountreset-authPW-->

  The PBKDF2/HKDF-stretched password as a hex string.

  <!--end-request-body-post-accountreset-authPW-->

- `wrapKb`: _validators.wrapKb.optional_

  <!--begin-request-body-post-accountreset-wrapKb-->

  <!--end-request-body-post-accountreset-wrapKb-->

- `recoveryKeyId`: _validators.recoveryKeyId.optional_

  <!--begin-request-body-post-accountreset-recoveryKeyId-->

  <!--end-request-body-post-accountreset-recoveryKeyId-->

- `sessionToken`: _boolean, optional_

  <!--begin-request-body-post-accountreset-sessionToken-->

  Indicates whether a new `sessionToken` is required, default to `false`.

  <!--end-request-body-post-accountreset-sessionToken-->

##### Error responses

Failing requests may be caused
by the following errors
(this is not an exhaustive list):

- `code: 400, errno: 108`:
  Unspecified error

#### POST /account/destroy

:lock::unlock: Optionally HAWK-authenticated with session token

<!--begin-route-post-accountdestroy-->

Deletes an account.
All stored data is erased.
The client should seek user confirmation first.
The client should erase data
stored on any attached services
before deleting the user's account data.

<!--end-route-post-accountdestroy-->

##### Request body

- `email`: _validators.email.required_

  <!--begin-request-body-post-accountdestroy-email-->

  Primary email address of the account.

  <!--end-request-body-post-accountdestroy-email-->

- `authPW`: _validators.authPW_

  <!--begin-request-body-post-accountdestroy-authPW-->

  The PBKDF2/HKDF-stretched password as a hex string.

  <!--end-request-body-post-accountdestroy-authPW-->

##### Error responses

Failing requests may be caused
by the following errors
(this is not an exhaustive list):

- `code: 400, errno: 103`:
  Incorrect password
- `code: 400, errno: 138`:
  Unverified session

#### GET /account

:lock: HAWK-authenticated with session token

<!--begin-route-get-account-->

<!--end-route-get-account-->

##### Response body

- `subscriptions`: _array, items(validators, subscriptionsSubscriptionValidator)_

  <!--begin-response-body-get-account-subscriptions-->

  <!--end-response-body-get-account-subscriptions-->

### Attached clients

#### GET /account/attached_clients

:lock: HAWK-authenticated with session token

<!--begin-route-get-accountattached_clients-->

<!--end-route-get-accountattached_clients-->

##### Response body

- `clientId`: _string, regex(HEX_STRING), allow(null), required_

  <!--begin-response-body-get-accountattached_clients-clientId-->

  <!--end-response-body-get-accountattached_clients-clientId-->

- `deviceId`: _DEVICES_SCHEMA.id.allow(null).required_

  <!--begin-response-body-get-accountattached_clients-deviceId-->

  <!--end-response-body-get-accountattached_clients-deviceId-->

- `sessionTokenId`: _string, regex(HEX_STRING), allow(null), required_

  <!--begin-response-body-get-accountattached_clients-sessionTokenId-->

  <!--end-response-body-get-accountattached_clients-sessionTokenId-->

- `refreshTokenId`: _string, regex(HEX_STRING), allow(null), required_

  <!--begin-response-body-get-accountattached_clients-refreshTokenId-->

  <!--end-response-body-get-accountattached_clients-refreshTokenId-->

- `isCurrentSession`: _boolean, required_

  <!--begin-response-body-get-accountattached_clients-isCurrentSession-->

  <!--end-response-body-get-accountattached_clients-isCurrentSession-->

- `deviceType`: _DEVICES_SCHEMA.type.allow(null).required_

  <!--begin-response-body-get-accountattached_clients-deviceType-->

  <!--end-response-body-get-accountattached_clients-deviceType-->

- `name`: _DEVICES_SCHEMA.nameResponse.allow('').allow(null).required_

  <!--begin-response-body-get-accountattached_clients-name-->

  <!--end-response-body-get-accountattached_clients-name-->

- `createdTime`: _number, min(0), required, allow(null)_

  <!--begin-response-body-get-accountattached_clients-createdTime-->

  <!--end-response-body-get-accountattached_clients-createdTime-->

- `createdTimeFormatted`: _string, optional, allow('')_

  <!--begin-response-body-get-accountattached_clients-createdTimeFormatted-->

  <!--end-response-body-get-accountattached_clients-createdTimeFormatted-->

- `lastAccessTime`: _number, min(0), required, allow(null)_

  <!--begin-response-body-get-accountattached_clients-lastAccessTime-->

  <!--end-response-body-get-accountattached_clients-lastAccessTime-->

- `lastAccessTimeFormatted`: _string, optional, allow('')_

  <!--begin-response-body-get-accountattached_clients-lastAccessTimeFormatted-->

  <!--end-response-body-get-accountattached_clients-lastAccessTimeFormatted-->

- `approximateLastAccessTime`: _number, min(0), optional_

  <!--begin-response-body-get-accountattached_clients-approximateLastAccessTime-->

  <!--end-response-body-get-accountattached_clients-approximateLastAccessTime-->

- `approximateLastAccessTimeFormatted`: _string, optional, allow('')_

  <!--begin-response-body-get-accountattached_clients-approximateLastAccessTimeFormatted-->

  <!--end-response-body-get-accountattached_clients-approximateLastAccessTimeFormatted-->

- `scope`: _array, items(validators, scope), required, allow(null)_

  <!--begin-response-body-get-accountattached_clients-scope-->

  <!--end-response-body-get-accountattached_clients-scope-->

- `location`: _DEVICES_SCHEMA.location_

  <!--begin-response-body-get-accountattached_clients-location-->

  <!--end-response-body-get-accountattached_clients-location-->

- `userAgent`: _string, max(255), required, allow('')_

  <!--begin-response-body-get-accountattached_clients-userAgent-->

  <!--end-response-body-get-accountattached_clients-userAgent-->

- `os`: _string, max(255), allow(''), allow(null)_

  <!--begin-response-body-get-accountattached_clients-os-->

  <!--end-response-body-get-accountattached_clients-os-->

#### POST /account/attached_client/destroy

:lock: HAWK-authenticated with session token

<!--begin-route-post-accountattached_clientdestroy-->

<!--end-route-post-accountattached_clientdestroy-->

##### Error responses

Failing requests may be caused
by the following errors
(this is not an exhaustive list):

- `code: 400, errno: 107`:
  Invalid parameter in request body

### Devices and sessions

#### POST /account/device

:lock: HAWK-authenticated with session token or authenticated with OAuth refresh token

<!--begin-route-post-accountdevice-->

Creates or updates the [device registration](device_registration.md) record
associated with the auth token used for this request.
At least one of `name`, `type`, `pushCallback`
or the tuple `{ pushCallback, pushPublicKey, pushAuthKey }`
must be present.
Beware that if you provide `pushCallback`
without the pair `{ pushPublicKey, pushAuthKey }`,
both of those keys will be reset
to the empty string.

`pushEndpointExpired` will be reset to false on update if the tuple
`{ pushCallback, pushPublicKey, pushAuthKey }` is specified.

Devices should register with this endpoint
before attempting to access the user's sync data,
so that an appropriate device name
can be made available to other connected devices.

<!--end-route-post-accountdevice-->

##### Request body

- `id`: _DEVICES_SCHEMA.id.optional_

  <!--begin-request-body-post-accountdevice-id-->

  <!--end-request-body-post-accountdevice-id-->

- `name`: _DEVICES_SCHEMA.name.optional_

  <!--begin-request-body-post-accountdevice-name-->

  <!--end-request-body-post-accountdevice-name-->

- `type`: _DEVICES_SCHEMA.type.optional_

  <!--begin-request-body-post-accountdevice-type-->

  <!--end-request-body-post-accountdevice-type-->

- `pushCallback`: _DEVICES_SCHEMA.pushCallback.optional_

  <!--begin-request-body-post-accountdevice-pushCallback-->

  <!--end-request-body-post-accountdevice-pushCallback-->

- `pushPublicKey`: _DEVICES_SCHEMA.pushPublicKey.optional_

  <!--begin-request-body-post-accountdevice-pushPublicKey-->

  <!--end-request-body-post-accountdevice-pushPublicKey-->

- `pushAuthKey`: _DEVICES_SCHEMA.pushAuthKey.optional_

  <!--begin-request-body-post-accountdevice-pushAuthKey-->

  <!--end-request-body-post-accountdevice-pushAuthKey-->

- `availableCommands`: _DEVICES_SCHEMA.availableCommands.optional_

  <!--begin-request-body-post-accountdevice-availableCommands-->

  <!--end-request-body-post-accountdevice-availableCommands-->

- `capabilities`: _array, length(0), optional_

  <!--begin-request-body-post-accountdevice-capabilities-->

  <!--end-request-body-post-accountdevice-capabilities-->

##### Response body

- `id`: _DEVICES_SCHEMA.id.required_

  <!--begin-response-body-post-accountdevice-id-->

  <!--end-response-body-post-accountdevice-id-->

- `createdAt`: _number, positive, optional_

  <!--begin-response-body-post-accountdevice-createdAt-->

  <!--end-response-body-post-accountdevice-createdAt-->

- `name`: _DEVICES_SCHEMA.nameResponse.optional_

  <!--begin-response-body-post-accountdevice-name-->

  <!--end-response-body-post-accountdevice-name-->

- `type`: _DEVICES_SCHEMA.type.optional_

  <!--begin-response-body-post-accountdevice-type-->

  <!--end-response-body-post-accountdevice-type-->

- `pushCallback`: _DEVICES_SCHEMA.pushCallback.optional_

  <!--begin-response-body-post-accountdevice-pushCallback-->

  <!--end-response-body-post-accountdevice-pushCallback-->

- `pushPublicKey`: _DEVICES_SCHEMA.pushPublicKey.optional_

  <!--begin-response-body-post-accountdevice-pushPublicKey-->

  <!--end-response-body-post-accountdevice-pushPublicKey-->

- `pushAuthKey`: _DEVICES_SCHEMA.pushAuthKey.optional_

  <!--begin-response-body-post-accountdevice-pushAuthKey-->

  <!--end-response-body-post-accountdevice-pushAuthKey-->

- `pushEndpointExpired`: _DEVICES_SCHEMA.pushEndpointExpired.optional_

  <!--begin-response-body-post-accountdevice-pushEndpointExpired-->

  <!--end-response-body-post-accountdevice-pushEndpointExpired-->

- `availableCommands`: _DEVICES_SCHEMA.availableCommands.optional_

  <!--begin-response-body-post-accountdevice-availableCommands-->

  <!--end-response-body-post-accountdevice-availableCommands-->

##### Error responses

Failing requests may be caused
by the following errors
(this is not an exhaustive list):

- `code: 400, errno: 107`:
  Invalid parameter in request body
- `code: 503, errno: 202`:
  Feature not enabled

#### GET /account/device/commands

:lock: HAWK-authenticated with session token or authenticated with OAuth refresh token

<!--begin-route-get-accountdevicecommands-->

Fetches commands enqueued for the current device
by prior calls to `/account/devices/invoke_command`.
The device can page through the enqueued commands
by using the `index` and `limit` parameters.

For more details,
see the [device registration](device_registration.md) docs.

<!--end-route-get-accountdevicecommands-->

##### Query parameters

- `index`: _number, optional_

  <!--begin-query-param-get-accountdevicecommands-index-->

  The index of the most recently seen command item.
  Only commands enqueued after the given index will be returned.

  <!--end-query-param-get-accountdevicecommands-index-->

- `limit`: _number, optional, min(0), max(100), default(100)_

  <!--begin-query-param-get-accountdevicecommands-limit-->

  The maximum number of commands to return.
  The default and maximum value for `limit` is 100.

  <!--end-query-param-get-accountdevicecommands-limit-->

##### Response body

- `index`: _number, required_

  <!--begin-response-body-get-accountdevicecommands-index-->

  The largest index of the commands returned in this response.
  This value can be passed as the `index` parameter
  in subsequent calls in order to page through all the items.

  <!--end-response-body-get-accountdevicecommands-index-->

- `last`: _boolean, optional_

  <!--begin-response-body-get-accountdevicecommands-last-->

  Indicates whether more commands and enqueued than could
  be returned within the specific limit.

  <!--end-response-body-get-accountdevicecommands-last-->

- `messages`: _array, items(object({ index: number, required, data: object({ command: string, max(255), required, payload: object, required, sender: DEVICES_SCHEMA.id, optional }), required })), optional_

  <!--begin-response-body-get-accountdevicecommands-messages-->

  An array of individual commands for the device to process.

  <!--end-response-body-get-accountdevicecommands-messages-->

#### POST /account/devices/invoke_command

:lock: HAWK-authenticated with session token or authenticated with OAuth refresh token

<!--begin-route-post-accountdevicesinvoke_command-->

Enqueues a command to be invoked on a target device.

For more details,
see the [device registration](device_registration.md) docs.

<!--end-route-post-accountdevicesinvoke_command-->

##### Request body

- `target`: _DEVICES_SCHEMA.id.required_

  <!--begin-request-body-post-accountdevicesinvoke_command-target-->

  The id of the device on which to invoke the command.

  <!--end-request-body-post-accountdevicesinvoke_command-target-->

- `command`: _string, required_

  <!--begin-request-body-post-accountdevicesinvoke_command-command-->

  The id of the command to be invoked,
  as found in the device's `availableCommands` set.

  <!--end-request-body-post-accountdevicesinvoke_command-command-->

- `payload`: _object, required_

  <!--begin-request-body-post-accountdevicesinvoke_command-payload-->

  Opaque payload to be forwarded to the device.

  <!--end-request-body-post-accountdevicesinvoke_command-payload-->

- `ttl`: _number, integer, min(0), max(10000000), optional_

  <!--begin-request-body-post-accountdevicesinvoke_command-ttl-->

  The time in milliseconds after which the command should expire,
  if not processed by the device.

  <!--end-request-body-post-accountdevicesinvoke_command-ttl-->

##### Error responses

Failing requests may be caused
by the following errors
(this is not an exhaustive list):

- `code: 400, errno: 157`:
  Unavailable device command.

#### POST /account/devices/notify

:lock: HAWK-authenticated with session token or authenticated with OAuth refresh token

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

- `to`: _string, valid('all'), required_;<br />or _array, items(string, length(32), regex(HEX_STRING)), required_

  <!--begin-request-body-post-accountdevicesnotify-to-->

  Devices to notify.
  May be the string `'all'`
  or an array
  containing the relevant device ids.

  <!--end-request-body-post-accountdevicesnotify-to-->

- `_endpointAction`: _string, valid('accountVerify'), optional_

  <!--begin-request-body-post-accountdevicesnotify-_endpointAction-->

  <!--end-request-body-post-accountdevicesnotify-_endpointAction-->

- `excluded`: _array, items(string, length(32), regex(HEX_STRING)), optional_

  <!--begin-request-body-post-accountdevicesnotify-excluded-->

  Array of device ids
  to exclude from the notification.
  Ignored unless `to:"all"` is specified.

  <!--end-request-body-post-accountdevicesnotify-excluded-->

- `payload`: _object, when('\_endpointAction', { is: 'accountVerify', then: required, otherwise: required })_

  <!--begin-request-body-post-accountdevicesnotify-payload-->

  Push payload,
  validated against [`pushpayloads.schema.json`](pushpayloads.schema.json).

  <!--end-request-body-post-accountdevicesnotify-payload-->

- `TTL`: _number, integer, min(0), optional_

  <!--begin-request-body-post-accountdevicesnotify-TTL-->

  Push notification TTL,
  defaults to `0`.

  <!--end-request-body-post-accountdevicesnotify-TTL-->

##### Error responses

Failing requests may be caused
by the following errors
(this is not an exhaustive list):

- `code: 400, errno: 107`:
  Invalid parameter in request body
- `code: 503, errno: 202`:
  Feature not enabled

#### GET /account/devices

:lock: HAWK-authenticated with session token or authenticated with OAuth refresh token

<!--begin-route-get-accountdevices-->

Returns an array
of registered device objects
for the authenticated user.

<!--end-route-get-accountdevices-->

##### Response body

- `id`: _DEVICES_SCHEMA.id.required_

  <!--begin-response-body-get-accountdevices-id-->

  <!--end-response-body-get-accountdevices-id-->

- `isCurrentDevice`: _boolean, required_

  <!--begin-response-body-get-accountdevices-isCurrentDevice-->

  <!--end-response-body-get-accountdevices-isCurrentDevice-->

- `lastAccessTime`: _number, min(0), required, allow(null)_

  <!--begin-response-body-get-accountdevices-lastAccessTime-->

  <!--end-response-body-get-accountdevices-lastAccessTime-->

- `lastAccessTimeFormatted`: _string, optional, allow('')_

  <!--begin-response-body-get-accountdevices-lastAccessTimeFormatted-->

  <!--end-response-body-get-accountdevices-lastAccessTimeFormatted-->

- `approximateLastAccessTime`: _number, min(0), optional_

  <!--begin-response-body-get-accountdevices-approximateLastAccessTime-->

  <!--end-response-body-get-accountdevices-approximateLastAccessTime-->

- `approximateLastAccessTimeFormatted`: _string, optional, allow('')_

  <!--begin-response-body-get-accountdevices-approximateLastAccessTimeFormatted-->

  <!--end-response-body-get-accountdevices-approximateLastAccessTimeFormatted-->

- `location`: _DEVICES_SCHEMA.location_

  <!--begin-response-body-get-accountdevices-location-->

  <!--end-response-body-get-accountdevices-location-->

- `name`: _DEVICES_SCHEMA.nameResponse.allow('').required_

  <!--begin-response-body-get-accountdevices-name-->

  <!--end-response-body-get-accountdevices-name-->

- `type`: _DEVICES_SCHEMA.type.required_

  <!--begin-response-body-get-accountdevices-type-->

  <!--end-response-body-get-accountdevices-type-->

- `pushCallback`: _DEVICES_SCHEMA.pushCallback.allow(null).optional_

  <!--begin-response-body-get-accountdevices-pushCallback-->

  <!--end-response-body-get-accountdevices-pushCallback-->

- `pushPublicKey`: _DEVICES_SCHEMA.pushPublicKey.allow(null).optional_

  <!--begin-response-body-get-accountdevices-pushPublicKey-->

  <!--end-response-body-get-accountdevices-pushPublicKey-->

- `pushAuthKey`: _DEVICES_SCHEMA.pushAuthKey.allow(null).optional_

  <!--begin-response-body-get-accountdevices-pushAuthKey-->

  <!--end-response-body-get-accountdevices-pushAuthKey-->

- `pushEndpointExpired`: _DEVICES_SCHEMA.pushEndpointExpired.optional_

  <!--begin-response-body-get-accountdevices-pushEndpointExpired-->

  <!--end-response-body-get-accountdevices-pushEndpointExpired-->

- `availableCommands`: _DEVICES_SCHEMA.availableCommands.optional_

  <!--begin-response-body-get-accountdevices-availableCommands-->

  <!--end-response-body-get-accountdevices-availableCommands-->

#### GET /account/sessions

:lock: HAWK-authenticated with session token

<!--begin-route-get-accountsessions-->

Returns an array
of session objects
for the authenticated user.

<!--end-route-get-accountsessions-->

##### Response body

- `id`: _string, regex(HEX_STRING), required_

  <!--begin-response-body-get-accountsessions-id-->

  <!--end-response-body-get-accountsessions-id-->

- `lastAccessTime`: _number, min(0), required, allow(null)_

  <!--begin-response-body-get-accountsessions-lastAccessTime-->

  <!--end-response-body-get-accountsessions-lastAccessTime-->

- `lastAccessTimeFormatted`: _string, optional, allow('')_

  <!--begin-response-body-get-accountsessions-lastAccessTimeFormatted-->

  <!--end-response-body-get-accountsessions-lastAccessTimeFormatted-->

- `approximateLastAccessTime`: _number, min(0), optional_

  <!--begin-response-body-get-accountsessions-approximateLastAccessTime-->

  <!--end-response-body-get-accountsessions-approximateLastAccessTime-->

- `approximateLastAccessTimeFormatted`: _string, optional, allow('')_

  <!--begin-response-body-get-accountsessions-approximateLastAccessTimeFormatted-->

  <!--end-response-body-get-accountsessions-approximateLastAccessTimeFormatted-->

- `createdTime`: _number, min(0), required, allow(null)_

  <!--begin-response-body-get-accountsessions-createdTime-->

  <!--end-response-body-get-accountsessions-createdTime-->

- `createdTimeFormatted`: _string, optional, allow('')_

  <!--begin-response-body-get-accountsessions-createdTimeFormatted-->

  <!--end-response-body-get-accountsessions-createdTimeFormatted-->

- `location`: _DEVICES_SCHEMA.location_

  <!--begin-response-body-get-accountsessions-location-->

  Object containing the client's state and country

  <!--end-response-body-get-accountsessions-location-->

- `userAgent`: _string, max(255), required, allow('')_

  <!--begin-response-body-get-accountsessions-userAgent-->

  <!--end-response-body-get-accountsessions-userAgent-->

- `os`: _string, max(255), allow(''), allow(null)_

  <!--begin-response-body-get-accountsessions-os-->

  <!--end-response-body-get-accountsessions-os-->

- `deviceId`: _DEVICES_SCHEMA.id.allow(null).required_

  <!--begin-response-body-get-accountsessions-deviceId-->

  <!--end-response-body-get-accountsessions-deviceId-->

- `deviceName`: _DEVICES_SCHEMA.nameResponse.allow('').allow(null).required_

  <!--begin-response-body-get-accountsessions-deviceName-->

  <!--end-response-body-get-accountsessions-deviceName-->

- `deviceAvailableCommands`: _DEVICES_SCHEMA.availableCommands.allow(null).required_

  <!--begin-response-body-get-accountsessions-deviceAvailableCommands-->

  <!--end-response-body-get-accountsessions-deviceAvailableCommands-->

- `deviceType`: _DEVICES_SCHEMA.type.allow(null).required_

  <!--begin-response-body-get-accountsessions-deviceType-->

  <!--end-response-body-get-accountsessions-deviceType-->

- `deviceCallbackURL`: _DEVICES_SCHEMA.pushCallback.allow(null).required_

  <!--begin-response-body-get-accountsessions-deviceCallbackURL-->

  <!--end-response-body-get-accountsessions-deviceCallbackURL-->

- `deviceCallbackPublicKey`: _DEVICES_SCHEMA.pushPublicKey.allow(null).required_

  <!--begin-response-body-get-accountsessions-deviceCallbackPublicKey-->

  <!--end-response-body-get-accountsessions-deviceCallbackPublicKey-->

- `deviceCallbackAuthKey`: _DEVICES_SCHEMA.pushAuthKey.allow(null).required_

  <!--begin-response-body-get-accountsessions-deviceCallbackAuthKey-->

  <!--end-response-body-get-accountsessions-deviceCallbackAuthKey-->

- `deviceCallbackIsExpired`: _DEVICES_SCHEMA.pushEndpointExpired.allow(null).required_

  <!--begin-response-body-get-accountsessions-deviceCallbackIsExpired-->

  <!--end-response-body-get-accountsessions-deviceCallbackIsExpired-->

- `isDevice`: _boolean, required_

  <!--begin-response-body-get-accountsessions-isDevice-->

  <!--end-response-body-get-accountsessions-isDevice-->

- `isCurrentDevice`: _boolean, required_

  <!--begin-response-body-get-accountsessions-isCurrentDevice-->

  <!--end-response-body-get-accountsessions-isCurrentDevice-->

#### POST /account/device/destroy

:lock: HAWK-authenticated with session token or authenticated with OAuth refresh token

<!--begin-route-post-accountdevicedestroy-->

Destroys a device record
and the associated `sessionToken`
for the authenticated user.
The identified device must sign in again
to use the API after this request has succeeded.

<!--end-route-post-accountdevicedestroy-->

##### Request body

- `id`: _DEVICES_SCHEMA.id.required_

  <!--begin-request-body-post-accountdevicedestroy-id-->

  <!--end-request-body-post-accountdevicedestroy-id-->

### Emails

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

- `reason`: _string, max(16), optional_

  <!--begin-query-param-get-recovery_emailstatus-reason-->

  <!--end-query-param-get-recovery_emailstatus-reason-->

##### Response body

- `email`: _string, required_

  <!--begin-response-body-get-recovery_emailstatus-email-->

  <!--end-response-body-get-recovery_emailstatus-email-->

- `verified`: _boolean, required_

  <!--begin-response-body-get-recovery_emailstatus-verified-->

  <!--end-response-body-get-recovery_emailstatus-verified-->

- `sessionVerified`: _boolean, optional_

  <!--begin-response-body-get-recovery_emailstatus-sessionVerified-->

  <!--end-response-body-get-recovery_emailstatus-sessionVerified-->

- `emailVerified`: _boolean, optional_

  <!--begin-response-body-get-recovery_emailstatus-emailVerified-->

  <!--end-response-body-get-recovery_emailstatus-emailVerified-->

##### Error responses

Failing requests may be caused
by the following errors
(this is not an exhaustive list):

- `code: 401, errno: 110`:
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

- `service`: _validators.service_

  <!--begin-query-param-post-recovery_emailresend_code-service-->

  Opaque alphanumeric token to be included in verification links.

  <!--end-query-param-post-recovery_emailresend_code-service-->

- `type`: _string, max(32), alphanum, allow(), optional_

  <!--begin-query-param-post-recovery_emailresend_code-type-->

  <!--end-query-param-post-recovery_emailresend_code-type-->

##### Request body

- `email`: _validators.email.optional_

  <!--begin-request-body-post-recovery_emailresend_code-email-->

  <!--end-request-body-post-recovery_emailresend_code-email-->

- `service`: _validators.service_

  <!--begin-request-body-post-recovery_emailresend_code-service-->

  Opaque alphanumeric token to be included in verification links.

  <!--end-request-body-post-recovery_emailresend_code-service-->

- `redirectTo`: _validators.redirectTo(config.smtp.redirectDomain).optional_

  <!--begin-request-body-post-recovery_emailresend_code-redirectTo-->

  <!--end-request-body-post-recovery_emailresend_code-redirectTo-->

- `resume`: _string, max(2048), optional_

  <!--begin-request-body-post-recovery_emailresend_code-resume-->

  Opaque URL-encoded string to be included in the verification link as a query parameter.

  <!--end-request-body-post-recovery_emailresend_code-resume-->

- `style`: _string, allow(), optional_

  <!--begin-request-body-post-recovery_emailresend_code-style-->

  <!--end-request-body-post-recovery_emailresend_code-style-->

- `type`: _string, max(32), alphanum, allow(), optional_

  <!--begin-request-body-post-recovery_emailresend_code-type-->

  <!--end-request-body-post-recovery_emailresend_code-type-->

##### Error responses

Failing requests may be caused
by the following errors
(this is not an exhaustive list):

- `code: 400, errno: 150`:
  Can not resend email code to an email that does not belong to this account

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

##### Request body

- `uid`: _string, max(32), regex(HEX_STRING), required_

  <!--begin-request-body-post-recovery_emailverify_code-uid-->

  <!--end-request-body-post-recovery_emailverify_code-uid-->

- `code`: _string, min(32), max(32), regex(HEX_STRING), required_

  <!--begin-request-body-post-recovery_emailverify_code-code-->

  <!--end-request-body-post-recovery_emailverify_code-code-->

- `service`: _validators.service_

  <!--begin-request-body-post-recovery_emailverify_code-service-->

  Opaque alphanumeric token to be included in verification links.

  <!--end-request-body-post-recovery_emailverify_code-service-->

- `reminder`: _string, regex(REMINDER_PATTERN), optional_

  <!--begin-request-body-post-recovery_emailverify_code-reminder-->

  Indicates that verification originates from a reminder email.

  <!--end-request-body-post-recovery_emailverify_code-reminder-->

- `type`: _string, max(32), alphanum, optional_

  <!--begin-request-body-post-recovery_emailverify_code-type-->

  The type of code being verified.

  <!--end-request-body-post-recovery_emailverify_code-type-->

- `style`: _string, allow(), optional_

  <!--begin-request-body-post-recovery_emailverify_code-style-->

  <!--end-request-body-post-recovery_emailverify_code-style-->

- `marketingOptIn`: _boolean_

  <!--begin-request-body-post-recovery_emailverify_code-marketingOptIn-->

  Set to true if the user has opted-in to our marketing. When verified,
  the auth-server will notify Basket.

  <!--end-request-body-post-recovery_emailverify_code-marketingOptIn-->

- `newsletters`: _array, items(string, valid('firefox-accounts-journey', 'knowledge-is-power', 'take-action-for-the-internet', 'test-pilot')), default(), optional_

  <!--begin-request-body-post-recovery_emailverify_code-newsletters-->

  <!--end-request-body-post-recovery_emailverify_code-newsletters-->

##### Error responses

Failing requests may be caused
by the following errors
(this is not an exhaustive list):

- `code: 400, errno: 105`:
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

- `verified`: _boolean, required_

  <!--begin-response-body-get-recovery_emails-verified-->

  <!--end-response-body-get-recovery_emails-verified-->

- `isPrimary`: _boolean, required_

  <!--begin-response-body-get-recovery_emails-isPrimary-->

  <!--end-response-body-get-recovery_emails-isPrimary-->

- `email`: _validators.email.required_

  <!--begin-response-body-get-recovery_emails-email-->

  <!--end-response-body-get-recovery_emails-email-->

#### POST /recovery_email

:lock: HAWK-authenticated with session token

<!--begin-route-post-recovery_email-->

Add a secondary email address
to the logged-in account.
The created address will be unverified
and will not replace the primary email address.

<!--end-route-post-recovery_email-->

##### Request body

- `email`: _validators.email.required_

  <!--begin-request-body-post-recovery_email-email-->

  The email address to add to the account.

  <!--end-request-body-post-recovery_email-email-->

##### Error responses

Failing requests may be caused
by the following errors
(this is not an exhaustive list):

- `code: 400, errno: 104`:
  Unverified account
- `code: 400, errno: 138`:
  Unverified session
- `code: 400, errno: 139`:
  Can not add secondary email that is same as your primary
- `code: 400, errno: 140`:
  Email already exists
- `code: 400, errno: 141`:
  Email already exists

#### POST /recovery_email/destroy

:lock: HAWK-authenticated with session token

<!--begin-route-post-recovery_emaildestroy-->

Delete an email address
associated with the logged-in user.

<!--end-route-post-recovery_emaildestroy-->

##### Request body

- `email`: _validators.email.required_

  <!--begin-request-body-post-recovery_emaildestroy-email-->

  The email address to delete.

  <!--end-request-body-post-recovery_emaildestroy-email-->

##### Error responses

Failing requests may be caused
by the following errors
(this is not an exhaustive list):

- `code: 400, errno: 138`:
  Unverified session

#### POST /recovery_email/set_primary

:lock: HAWK-authenticated with session token

<!--begin-route-post-recovery_emailset_primary-->

This endpoint changes a user's primary email address. This email address must
belong to the user and be verified.

<!--end-route-post-recovery_emailset_primary-->

##### Request body

- `email`: _validators.email.required_

  <!--begin-request-body-post-recovery_emailset_primary-email-->

  The new primary email address of the user.

  <!--end-request-body-post-recovery_emailset_primary-email-->

##### Error responses

Failing requests may be caused
by the following errors
(this is not an exhaustive list):

- `code: 400, errno: 138`:
  Unverified session
- `code: 400, errno: 147`:
  Can not change primary email to an unverified email
- `code: 400, errno: 148`:
  Can not change primary email to an email that does not belong to this account

### Oauth

#### GET /oauth/client/{client_id}

<!--begin-route-get-oauthclientclient_id-->

Retrieve metadata about the specified OAuth client,
such as its display-name and redirect URI.

<!--end-route-get-oauthclientclient_id-->

#### POST /account/scoped-key-data

:lock: HAWK-authenticated with session token

<!--begin-route-post-accountscoped-key-data-->

Query for the information required
to derive scoped encryption keys
requested by the specified OAuth client.

<!--end-route-post-accountscoped-key-data-->

#### POST /oauth/authorization

:lock: HAWK-authenticated with session token

<!--begin-route-post-oauthauthorization-->

Authorize a new OAuth client connection to the user's account,
returning a short-lived authentication code that the client can
exchange for access tokens at the OAuth token endpoint.

This route behaves like the (oauth-server /authorization endpoint)[../fxa-oauth-server/docs/api.md#post-v1authorization]
except that it is authenticated directly with a sessionToken
rather than with a BrowserID assertion.

##### Request body

- `client_id`: _validators.clientId.required_
  The OAuth client identifier provided by the connecting client application.
- `state`: _string, max(256), required_
  An opaque string provided by the connecting client application, which will be
  returned unmodified alongside the authorization code. This can be used by
  the connecting client to guard against certain classes of attack in the
  redirect-based OAuth flow.
- `response_type`: _string, valid('code'), optional_
  Determines the format of the response. Since we only support the authorization-code grant flow,
  the only permitted value is 'code'.
- `redirect_uri`: _string, URI, optional_
  The URI at which the connecting client expects to receive the authorization code.
  If supplied this _must_ match the value provided during OAuth client registration.
- `scope`: _string, optional_
  A space-separated list of scope values that the connecting client will be granted.
  The requested scope will be provided by the connecting client as part of its authorization request,
  but may be pruned by the user in a confirmation dialog before being sent to this endpoint.
- `access_type`: _string, valid(online, offline), optional_
  If specified, a value of `offline` will cause the connecting client to be granted a refresh token
  alongside its access token.
- `code_challenge_method`: _string, valid(S256), optional_
  Required for public OAuth clients, who must authenticate their authorization code use via [PKCE](../fxa-oauth-server/docs/pkce.md).
  The only support method is 'S256'.
- `code_challenge`: _string, length(43), regex(URL_SAFE_BASE_64), optional_
  Required for public OAuth clients, who must authenticate their authorization code use via [PKCE](../fxa-oauth-server/docs/pkce.md).
- `keys_jwe`: _string, validators.jwe, optional_
  An encrypted bundle of key material, to be returned to the client when it redeems the authorization code.
- `acr_values`: _string, optional_
  A space-separated list of ACR values specifying acceptable levels of user authentication.
  Specifying `AAL2` will ensure that the user has been authenticated with 2FA before authorizing
  the requested grant.

<!--end-route-post-oauthauthorization-->

#### POST /oauth/token

:lock::unlock: Optionally HAWK-authenticated with session token

<!--begin-route-post-oauthtoken-->

Grant new OAuth tokens for use by a connected client, using one of the following
grant types:

- `grant_type=authorization_code`: A single-use code obtained via OAuth redirect flow.
- `grant_type=refresh_token`: A refresh token issued by a previous call to this endpoint.
- `grant_type=fxa-credentials`: Directly grant tokens using an FxA sessionToken.

This is the "token endpoint" as defined in RFC6749, ande behaves like the
(oauth-server /token endpoint)[../fxa-oauth-server/docs/api.md#post-v1token]
except that the `fxa-credentials` grant can be authenticated directly with a sessionToken
rather than with a BrowserID assertion.

##### Request body

- `client_id`: _validators.clientId, required_
  The OAuth client identifier for the requesting client application.
- `client_secret`: _validators.hexString, optional_
  The OAuth client secret for the requesting client application. Required for confidential clients,
  forbidden for public clients.
- `ppid_seed`: _integer.min(0).max(1024), optional_ Seed used in `sub` claim generation of
  JWT access tokens/ID tokens for clients with [Pseudonymous Pairwise
  Identifiers (PPID)](https://github.com/mozilla/fxa/blob/master/packages/fxa-auth-server/fxa-oauth-server/docs/pairwise-pseudonymous-identifiers.md)
  enabled. Used to forcibly rotate the `sub` claim. If not specified, it will default to `0`.
- `ttl`: _number.integer.min(0), optional_
  The desired lifetime of the issued access token, in seconds.
  The actual lifetime may be smaller than requested depending on server configuration,
  and will be returned in the `expired_in` property of the response.
- `grant_type`: _string.allow('authorization_code', 'refresh_token', 'fxa-credentials'), optional_
  The type of grant flow being used. If not specified, it will default to `fxa-credentials` unless a `code`
  parameter is provided, in which case it will default to `authorization_code`.
  The value of this parameter determines which other parameters will be expected in the request body,
  as follows:
  - When `grant_type=authorization_code`:
    - `code`: _validators.authorizationCode, required_
      The authorization code previously obtained through a redirect-based OAuth flow.
    - `code_verifier`: _validators.pkceCodeVerifier, optional_
      The [PKCE](../fxa-oauth-server/docs/pkce.md) code verifier used when obtaining `code`.
      This is required for public OAuth clients, who must authenticate their authorization code use via PKCE.
    - `redirect_uri`: _string, URI, optional_
      The URI at which the client received the authorization code.
      If supplied this _must_ match the value provided during OAuth client registration.
  - When `grant_type=refresh_token`:
    - `refresh_token`: _validators.refreshToken, required_
      A refresh token, as issued by a previous call to this endpoint.
    - `scope`: _string, optional_
      A space-separated list of scope values that will be held by the generated token.
      These must be a subset of the scopes originally granted when the refresh token was generated.
  - When `grant_type=fxa-credentials`:
    - `scope`: _string, optional_
      A space-separated list of scope values that will be held by the generated tokens.
    - `access_type`: _string, valid(online, offline), optional_
      If specified, a value of `offline` will cause the client to be granted a refresh token
      alongside its access token.
    - In addition, the request must be authenticated with a sessionToken.

##### Response body

- `access_token`: _validators.accessToken, required_
  An OAuth access token that the client can use to access data associated with the user's account.
- `refresh_token`: _validators.refreshToken, optional_
  A token that can be used to grant a new access token when the current one expires,
  via `grant_type=refresh_token` on this endpoint.
- `id_token`: _validators.assertion, optional_
  Open OpenID Connect identity token, provisioned if the `openid` scope was requested.
- `scope`: _string, required_
  The scope values held by the granted access token.
- `auth_at`: _number, optional_
  Where available, the timestamp at which the user last authenticated to FxA,
  in seconds since the epoch.
- `token_type`: _string.allow('bearer'), required_
  The type of token, which determins how the client should use it in subsequent requests.
  Currently only Bearer tokens are supported.
- `expires_in`: _number.integer.min(0), required_
  The number of seconds until the access token will expire.

<!--end-route-post-oauthtoken-->

##### Error responses

Failing requests may be caused
by the following errors
(this is not an exhaustive list):

- `code: 401, errno: 110`:
  Invalid authentication token in request signature
- `code: 500, errno: 998`:
  An internal validation check failed.

### Password

#### POST /password/change/start

<!--begin-route-post-passwordchangestart-->

Begin the "change password" process.
Returns a single-use `passwordChangeToken`,
to be sent to `POST /password/change/finish`.
Also returns a single-use `keyFetchToken`.

<!--end-route-post-passwordchangestart-->

##### Request body

- `email`: _validators.email.required_

  <!--begin-request-body-post-passwordchangestart-email-->

  Primary email address of the account.

  <!--end-request-body-post-passwordchangestart-email-->

- `oldAuthPW`: _validators.authPW_

  <!--begin-request-body-post-passwordchangestart-oldAuthPW-->

  The PBKDF2/HKDF-stretched password as a hex string.

  <!--end-request-body-post-passwordchangestart-oldAuthPW-->

##### Error responses

Failing requests may be caused
by the following errors
(this is not an exhaustive list):

- `code: 400, errno: 103`:
  Incorrect password

#### POST /password/change/finish

:lock: HAWK-authenticated with password change token

<!--begin-route-post-passwordchangefinish-->

Change the password and update `wrapKb`.
Optionally returns `sessionToken` and `keyFetchToken`.

<!--end-route-post-passwordchangefinish-->

##### Query parameters

- `keys`: _boolean, optional_

  <!--begin-query-param-post-passwordchangefinish-keys-->

  Indicates whether a new `keyFetchToken` is required, default to `false`.

  <!--end-query-param-post-passwordchangefinish-keys-->

##### Request body

- `authPW`: _validators.authPW_

  <!--begin-request-body-post-passwordchangefinish-authPW-->

  The PBKDF2/HKDF-stretched password as a hex string.

  <!--end-request-body-post-passwordchangefinish-authPW-->

- `wrapKb`: _validators.wrapKb_

  <!--begin-request-body-post-passwordchangefinish-wrapKb-->

  The new `wrapKb` value as a hex string.

  <!--end-request-body-post-passwordchangefinish-wrapKb-->

- `sessionToken`: _string, min(64), max(64), regex(HEX_STRING), optional_

  <!--begin-request-body-post-passwordchangefinish-sessionToken-->

  Indicates whether a new `sessionToken` is required, default to `false`.

  <!--end-request-body-post-passwordchangefinish-sessionToken-->

##### Error responses

Failing requests may be caused
by the following errors
(this is not an exhaustive list):

- `code: 400, errno: 138`:
  Unverified session

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

- `service`: _validators.service_

  <!--begin-query-param-post-passwordforgotsend_code-service-->

  Identifies the relying service
  the user was interacting with
  that triggered the password reset.

  <!--end-query-param-post-passwordforgotsend_code-service-->

- `keys`: _boolean, optional_

  <!--begin-query-param-post-passwordforgotsend_code-keys-->

  <!--end-query-param-post-passwordforgotsend_code-keys-->

##### Request body

- `email`: _validators.email.required_

  <!--begin-request-body-post-passwordforgotsend_code-email-->

  Recovery email for the account.

  <!--end-request-body-post-passwordforgotsend_code-email-->

- `service`: _validators.service_

  <!--begin-request-body-post-passwordforgotsend_code-service-->

  Identifies the relying service
  the user was interacting with
  that triggered the password reset.

  <!--end-request-body-post-passwordforgotsend_code-service-->

- `redirectTo`: _validators.redirectTo(redirectDomain).optional_

  <!--begin-request-body-post-passwordforgotsend_code-redirectTo-->

  URL that the client should be redirected to
  after handling the request.

  <!--end-request-body-post-passwordforgotsend_code-redirectTo-->

- `resume`: _string, max(2048), optional_

  <!--begin-request-body-post-passwordforgotsend_code-resume-->

  Opaque URL-encoded string to be included in the verification link as a query parameter.

  <!--end-request-body-post-passwordforgotsend_code-resume-->

- `metricsContext`: _metricsContext.schema_

  <!--begin-request-body-post-passwordforgotsend_code-metricsContext-->

  <!--end-request-body-post-passwordforgotsend_code-metricsContext-->

##### Response body

- `passwordForgotToken`: _string_

  <!--begin-response-body-post-passwordforgotsend_code-passwordForgotToken-->

  <!--end-response-body-post-passwordforgotsend_code-passwordForgotToken-->

- `ttl`: _number_

  <!--begin-response-body-post-passwordforgotsend_code-ttl-->

  <!--end-response-body-post-passwordforgotsend_code-ttl-->

- `codeLength`: _number_

  <!--begin-response-body-post-passwordforgotsend_code-codeLength-->

  <!--end-response-body-post-passwordforgotsend_code-codeLength-->

- `tries`: _number_

  <!--begin-response-body-post-passwordforgotsend_code-tries-->

  <!--end-response-body-post-passwordforgotsend_code-tries-->

##### Error responses

Failing requests may be caused
by the following errors
(this is not an exhaustive list):

- `code: 400, errno: 145`:
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

- `service`: _validators.service_

  <!--begin-query-param-post-passwordforgotresend_code-service-->

  Identifies the relying service
  the user was interacting with
  that triggered the password reset.

  <!--end-query-param-post-passwordforgotresend_code-service-->

##### Request body

- `email`: _validators.email.required_

  <!--begin-request-body-post-passwordforgotresend_code-email-->

  Recovery email for the account.

  <!--end-request-body-post-passwordforgotresend_code-email-->

- `service`: _validators.service_

  <!--begin-request-body-post-passwordforgotresend_code-service-->

  Identifies the relying service
  the user was interacting with
  that triggered the password reset.

  <!--end-request-body-post-passwordforgotresend_code-service-->

- `redirectTo`: _validators.redirectTo(redirectDomain).optional_

  <!--begin-request-body-post-passwordforgotresend_code-redirectTo-->

  URL that the client should be redirected to
  after handling the request.

  <!--end-request-body-post-passwordforgotresend_code-redirectTo-->

- `resume`: _string, max(2048), optional_

  <!--begin-request-body-post-passwordforgotresend_code-resume-->

  Opaque URL-encoded string to be included in the verification link as a query parameter.

  <!--end-request-body-post-passwordforgotresend_code-resume-->

##### Response body

- `passwordForgotToken`: _string_

  <!--begin-response-body-post-passwordforgotresend_code-passwordForgotToken-->

  <!--end-response-body-post-passwordforgotresend_code-passwordForgotToken-->

- `ttl`: _number_

  <!--begin-response-body-post-passwordforgotresend_code-ttl-->

  <!--end-response-body-post-passwordforgotresend_code-ttl-->

- `codeLength`: _number_

  <!--begin-response-body-post-passwordforgotresend_code-codeLength-->

  <!--end-response-body-post-passwordforgotresend_code-codeLength-->

- `tries`: _number_

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

- `code`: _string, min(32), max(32), regex(HEX_STRING), required_

  <!--begin-request-body-post-passwordforgotverify_code-code-->

  The code sent to the user's recovery email.

  <!--end-request-body-post-passwordforgotverify_code-code-->

- `accountResetWithRecoveryKey`: _boolean, optional_

  <!--begin-request-body-post-passwordforgotverify_code-accountResetWithRecoveryKey-->

  <!--end-request-body-post-passwordforgotverify_code-accountResetWithRecoveryKey-->

##### Response body

- `accountResetToken`: _string_

  <!--begin-response-body-post-passwordforgotverify_code-accountResetToken-->

  <!--end-response-body-post-passwordforgotverify_code-accountResetToken-->

##### Error responses

Failing requests may be caused
by the following errors
(this is not an exhaustive list):

- `code: 400, errno: 105`:
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

- `tries`: _number_

  <!--begin-response-body-get-passwordforgotstatus-tries-->

  <!--end-response-body-get-passwordforgotstatus-tries-->

- `ttl`: _number_

  <!--begin-response-body-get-passwordforgotstatus-ttl-->

  <!--end-response-body-get-passwordforgotstatus-ttl-->

### Recovery codes

#### GET /recoveryCodes

:lock: HAWK-authenticated with session token

<!--begin-route-get-recoverycodes-->

Return new recovery codes while removing old ones.

<!--end-route-get-recoverycodes-->

##### Response body

- `recoveryCodes`: _array, items(string)_

  <!--begin-response-body-get-recoverycodes-recoveryCodes-->

  <!--end-response-body-get-recoverycodes-recoveryCodes-->

#### POST /session/verify/recoveryCode

:lock: HAWK-authenticated with session token

<!--begin-route-post-sessionverifyrecoverycode-->

Verify a session using a recovery code.

<!--end-route-post-sessionverifyrecoverycode-->

##### Request body

- `code`: _string, max(RECOVERY_CODE_SANE_MAX_LENGTH), regex(BASE_36), required_

  <!--begin-request-body-post-sessionverifyrecoverycode-code-->

  <!--end-request-body-post-sessionverifyrecoverycode-code-->

##### Response body

- `remaining`: _number_

  <!--begin-response-body-post-sessionverifyrecoverycode-remaining-->

  <!--end-response-body-post-sessionverifyrecoverycode-remaining-->

### Recovery key

#### POST /recoveryKey

:lock: HAWK-authenticated with session token

<!--begin-route-post-recoverykey-->

Creates a new recovery key for a user.

Recovery keys are one-time-use tokens
that can be used to recover the user's kB
if they forget their password.
For more details, see the
[recovery keys](recovery_keys.md) docs.

<!--end-route-post-recoverykey-->

##### Request body

- `recoveryKeyId`: _validators.recoveryKeyId_

  <!--begin-request-body-post-recoverykey-recoveryKeyId-->

  A unique identifier for this recovery key, derived from the key via HKDF.

  <!--end-request-body-post-recoverykey-recoveryKeyId-->

- `recoveryData`: _validators.recoveryData_

  <!--begin-request-body-post-recoverykey-recoveryData-->

  An encrypted bundle containing the user's kB.

  <!--end-request-body-post-recoverykey-recoveryData-->

#### GET /recoveryKey/{recoveryKeyId}

:lock: HAWK-authenticated with account reset token

<!--begin-route-get-recoverykeyrecoverykeyid-->

Retrieve the account recovery data associated with the given recovery key.

<!--end-route-get-recoverykeyrecoverykeyid-->

#### POST /recoveryKey/exists

:lock::unlock: Optionally HAWK-authenticated with session token

<!--begin-route-post-recoverykeyexists-->

This route checks to see if given user has setup an account recovery key.
When used during the password reset flow, an email can be provided (instead
of a sessionToken) to check for the status. However, when
using an email, the request is rate limited.

<!--end-route-post-recoverykeyexists-->

##### Request body

- `email`: _validators.email.optional_

  <!--begin-request-body-post-recoverykeyexists-email-->

  <!--end-request-body-post-recoverykeyexists-email-->

##### Response body

- `exists`: _boolean, required_

  <!--begin-response-body-post-recoverykeyexists-exists-->

  <!--end-response-body-post-recoverykeyexists-exists-->

#### DELETE /recoveryKey

:lock: HAWK-authenticated with session token

<!--begin-route-delete-recoverykey-->

This route remove an account's recovery key. When the key is
removed, it can no longer be used to restore an account's kB.

<!--end-route-delete-recoverykey-->

### Security events

#### GET /securityEvents

:lock: HAWK-authenticated with session token

<!--begin-route-get-securityevents-->

<!--end-route-get-securityevents-->

#### DELETE /securityEvents

:lock: HAWK-authenticated with session token

<!--begin-route-delete-securityevents-->

<!--end-route-delete-securityevents-->

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

- `customSessionToken`: _string, min(64), max(64), regex(HEX_STRING), optional_

  <!--begin-request-body-post-sessiondestroy-customSessionToken-->

  Custom session token id to destroy.

  <!--end-request-body-post-sessiondestroy-customSessionToken-->

##### Error responses

Failing requests may be caused
by the following errors
(this is not an exhaustive list):

- `code: 401, errno: 110`:
  Invalid authentication token in request signature

#### POST /session/reauth

:lock: HAWK-authenticated with session token

<!--begin-route-post-sessionreauth-->

Re-authenticate an existing session token.
This is equivalent to calling `/account/login`,
but it re-uses an existing session token
rather than generating a new one,
allowing the caller to maintain session state
such as verification and device registration.

<!--end-route-post-sessionreauth-->

##### Query parameters

- `keys`: _boolean, optional_

  <!--begin-query-param-post-sessionreauth-keys-->

  <!--end-query-param-post-sessionreauth-keys-->

- `service`: _validators.service_

  <!--begin-query-param-post-sessionreauth-service-->

  <!--end-query-param-post-sessionreauth-service-->

- `verificationMethod`: _validators.verificationMethod.optional_

  <!--begin-query-param-post-sessionreauth-verificationMethod-->

  <!--end-query-param-post-sessionreauth-verificationMethod-->

##### Request body

- `email`: _validators.email.required_

  <!--begin-request-body-post-sessionreauth-email-->

  <!--end-request-body-post-sessionreauth-email-->

- `authPW`: _validators.authPW_

  <!--begin-request-body-post-sessionreauth-authPW-->

  <!--end-request-body-post-sessionreauth-authPW-->

- `service`: _validators.service_

  <!--begin-request-body-post-sessionreauth-service-->

  <!--end-request-body-post-sessionreauth-service-->

- `redirectTo`: _validators.redirectTo(config.smtp.redirectDomain).optional_

  <!--begin-request-body-post-sessionreauth-redirectTo-->

  <!--end-request-body-post-sessionreauth-redirectTo-->

- `resume`: _string, optional_

  <!--begin-request-body-post-sessionreauth-resume-->

  <!--end-request-body-post-sessionreauth-resume-->

- `reason`: _string, max(16), optional_

  <!--begin-request-body-post-sessionreauth-reason-->

  <!--end-request-body-post-sessionreauth-reason-->

- `unblockCode`: _signinUtils.validators.UNBLOCK_CODE_

  <!--begin-request-body-post-sessionreauth-unblockCode-->

  <!--end-request-body-post-sessionreauth-unblockCode-->

- `metricsContext`: _metricsContext.schema_

  <!--begin-request-body-post-sessionreauth-metricsContext-->

  <!--end-request-body-post-sessionreauth-metricsContext-->

- `originalLoginEmail`: _validators.email.optional_

  <!--begin-request-body-post-sessionreauth-originalLoginEmail-->

  <!--end-request-body-post-sessionreauth-originalLoginEmail-->

- `verificationMethod`: _validators.verificationMethod.optional_

  <!--begin-request-body-post-sessionreauth-verificationMethod-->

  <!--end-request-body-post-sessionreauth-verificationMethod-->

##### Response body

- `uid`: _string, regex(HEX_STRING), required_

  <!--begin-response-body-post-sessionreauth-uid-->

  <!--end-response-body-post-sessionreauth-uid-->

- `keyFetchToken`: _string, regex(HEX_STRING), optional_

  <!--begin-response-body-post-sessionreauth-keyFetchToken-->

  <!--end-response-body-post-sessionreauth-keyFetchToken-->

- `verificationMethod`: _string, optional_

  <!--begin-response-body-post-sessionreauth-verificationMethod-->

  <!--end-response-body-post-sessionreauth-verificationMethod-->

- `verificationReason`: _string, optional_

  <!--begin-response-body-post-sessionreauth-verificationReason-->

  <!--end-response-body-post-sessionreauth-verificationReason-->

- `verified`: _boolean, required_

  <!--begin-response-body-post-sessionreauth-verified-->

  <!--end-response-body-post-sessionreauth-verified-->

- `authAt`: _number, integer_

  <!--begin-response-body-post-sessionreauth-authAt-->

  <!--end-response-body-post-sessionreauth-authAt-->

##### Error responses

Failing requests may be caused
by the following errors
(this is not an exhaustive list):

- `code: 400, errno: 102`:
  Unknown account
- `code: 400, errno: 103`:
  Incorrect password
- `code: 400, errno: 125`:
  The request was blocked for security reasons
- `code: 400, errno: 127`:
  Invalid unblock code
- `code: 400, errno: 142`:
  Sign in with this email type is not currently supported
- `code: 400, errno: 149`:
  This email can not currently be used to login
- `code: 400, errno: 160`:
  This request requires two step authentication enabled on your account.
- `code: 503, errno: 204`:
  This client has been temporarily disabled

#### GET /session/status

:lock: HAWK-authenticated with session token

<!--begin-route-get-sessionstatus-->

Returns a success response
if the session token is valid.

<!--end-route-get-sessionstatus-->

##### Response body

- `state`: _string, required_

  <!--begin-response-body-get-sessionstatus-state-->

  <!--end-response-body-get-sessionstatus-state-->

- `uid`: _string, regex(HEX_STRING), required_

  <!--begin-response-body-get-sessionstatus-uid-->

  <!--end-response-body-get-sessionstatus-uid-->

#### POST /session/duplicate

:lock: HAWK-authenticated with session token

<!--begin-route-post-sessionduplicate-->

Create a new sessionToken
that duplicates the current session.
It will have the same verification status
as the current session,
but will have a distinct verification code.

<!--end-route-post-sessionduplicate-->

##### Request body

- `reason`: _string, max(16), optional_

  <!--begin-request-body-post-sessionduplicate-reason-->

  <!--end-request-body-post-sessionduplicate-reason-->

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

- `fxa-generation`:
  A number that increases
  each time the user's password is changed.

- `fxa-lastAuthAt`:
  Authentication time for this session,
  in seconds since epoch.

- `fxa-verifiedEmail`:
  The user's verified recovery email address.

<!--end-route-post-certificatesign-->

##### Query parameters

- `service`: _validators.service_

  <!--begin-query-param-post-certificatesign-service-->

  <!--end-query-param-post-certificatesign-service-->

##### Request body

- `publicKey`: _object({ algorithm: string, valid('RS', 'DS'), required, n: string, e: string, y: string, p: string, q: string, g: string, version: string }), required_

  <!--begin-request-body-post-certificatesign-publicKey-->

  The key to sign
  (run `bin/generate-keypair`
  from [browserid-crypto](https://github.com/mozilla/browserid-crypto)).

  <!--end-request-body-post-certificatesign-publicKey-->

- `duration`: _number, integer, min(0), max(), required_

  <!--begin-request-body-post-certificatesign-duration-->

  Time interval in milliseconds
  until the certificate will expire,
  up to a maximum of 24 hours.

  <!--end-request-body-post-certificatesign-duration-->

##### Error responses

Failing requests may be caused
by the following errors
(this is not an exhaustive list):

- `code: 400, errno: 104`:
  Unverified account
- `code: 400, errno: 108`:
  Unspecified error
- `code: 400, errno: 138`:
  Unverified session

### Signin codes

#### POST /signinCodes/consume

<!--begin-route-post-signincodesconsume-->

Exchange a single-use signin code
for an email address.

<!--end-route-post-signincodesconsume-->

##### Request body

- `code`: _string, regex(validators.URL_SAFE_BASE_64), required_

  <!--begin-request-body-post-signincodesconsume-code-->

  The signin code.

  <!--end-request-body-post-signincodesconsume-code-->

- `metricsContext`: _metricsContext.requiredSchema_

  <!--begin-request-body-post-signincodesconsume-metricsContext-->

  Metrics context data for the new flow.

  <!--end-request-body-post-signincodesconsume-metricsContext-->

##### Response body

- `email`: _validators.email.required_

  <!--begin-response-body-post-signincodesconsume-email-->

  The email address associated with the signin code.

  <!--end-response-body-post-signincodesconsume-email-->

### Sms

#### POST /sms

:lock: HAWK-authenticated with session token

<!--begin-route-post-sms-->

Sends an SMS message.

<!--end-route-post-sms-->

##### Request body

- `phoneNumber`: _string, regex(validators.E164_NUMBER), required_

  <!--begin-request-body-post-sms-phoneNumber-->

  The phone number to send the message to, in E.164 format.

  <!--end-request-body-post-sms-phoneNumber-->

- `messageId`: _number, positive, required_

  <!--begin-request-body-post-sms-messageId-->

  The id of the message to send.

  <!--end-request-body-post-sms-messageId-->

- `metricsContext`: _metricsContext.schema_

  <!--begin-request-body-post-sms-metricsContext-->

  Metrics context data for the request.

  <!--end-request-body-post-sms-metricsContext-->

- `features`: _features.schema_

  <!--begin-request-body-post-sms-features-->

  Enabled features for the request.

  <!--end-request-body-post-sms-features-->

##### Error responses

Failing requests may be caused
by the following errors
(this is not an exhaustive list):

- `code: 400, errno: 129`:
  Invalid phone number
- `code: 400, errno: 130`:
  Invalid region

#### GET /sms/status

:lock: HAWK-authenticated with session token

<!--begin-route-get-smsstatus-->

Returns SMS status for the current user.

<!--end-route-get-smsstatus-->

##### Query parameters

- `country`: _string, regex(/^[A-Z][a-z]\$/), optional_

  <!--begin-query-param-get-smsstatus-country-->

  Skip geo-lookup
  and act as if the user
  is in the specified country.

  <!--end-query-param-get-smsstatus-country-->

### Subscriptions

#### GET /oauth/subscriptions/clients

:lock: HAWK-authenticated with subscriptions secret

<!--begin-route-get-oauthsubscriptionsclients-->

<!--end-route-get-oauthsubscriptionsclients-->

#### GET /oauth/subscriptions/plans

:lock: authenticated with OAuth bearer token

<!--begin-route-get-oauthsubscriptionsplans-->

<!--end-route-get-oauthsubscriptionsplans-->

#### GET /oauth/subscriptions/active

:lock: authenticated with OAuth bearer token

<!--begin-route-get-oauthsubscriptionsactive-->

<!--end-route-get-oauthsubscriptionsactive-->

#### POST /oauth/subscriptions/active

:lock: authenticated with OAuth bearer token

<!--begin-route-post-oauthsubscriptionsactive-->

<!--end-route-post-oauthsubscriptionsactive-->

##### Request body

- `planId`: _validators.subscriptionsPlanId.required_

  <!--begin-request-body-post-oauthsubscriptionsactive-planId-->

  <!--end-request-body-post-oauthsubscriptionsactive-planId-->

- `paymentToken`: _validators.subscriptionsPaymentToken.required_

  <!--begin-request-body-post-oauthsubscriptionsactive-paymentToken-->

  <!--end-request-body-post-oauthsubscriptionsactive-paymentToken-->

- `displayName`: _string, required_

  <!--begin-request-body-post-oauthsubscriptionsactive-displayName-->

  <!--end-request-body-post-oauthsubscriptionsactive-displayName-->

##### Error responses

Failing requests may be caused
by the following errors
(this is not an exhaustive list):

- `code: 400, errno: 178`:
  Unknown subscription plan

#### POST /oauth/subscriptions/updatePayment

:lock: authenticated with OAuth bearer token

<!--begin-route-post-oauthsubscriptionsupdatepayment-->

<!--end-route-post-oauthsubscriptionsupdatepayment-->

##### Request body

- `paymentToken`: _validators.subscriptionsPaymentToken.required_

  <!--begin-request-body-post-oauthsubscriptionsupdatepayment-paymentToken-->

  <!--end-request-body-post-oauthsubscriptionsupdatepayment-paymentToken-->

#### GET /oauth/subscriptions/customer

:lock: authenticated with OAuth bearer token

<!--begin-route-get-oauthsubscriptionscustomer-->

<!--end-route-get-oauthsubscriptionscustomer-->

#### DELETE /oauth/subscriptions/active/{subscriptionId}

:lock: authenticated with OAuth bearer token

<!--begin-route-delete-oauthsubscriptionsactivesubscriptionid-->

<!--end-route-delete-oauthsubscriptionsactivesubscriptionid-->

##### Error responses

Failing requests may be caused
by the following errors
(this is not an exhaustive list):

- `code: 400, errno: 180`:
  Subscription has already been cancelled
- `code: 404, errno: 177`:
  Unknown subscription

#### POST /oauth/subscriptions/reactivate

:lock: authenticated with OAuth bearer token

<!--begin-route-post-oauthsubscriptionsreactivate-->

<!--end-route-post-oauthsubscriptionsreactivate-->

##### Request body

- `subscriptionId`: _validators.subscriptionsSubscriptionId.required_

  <!--begin-request-body-post-oauthsubscriptionsreactivate-subscriptionId-->

  <!--end-request-body-post-oauthsubscriptionsreactivate-subscriptionId-->

##### Error responses

Failing requests may be caused
by the following errors
(this is not an exhaustive list):

- `code: 404, errno: 177`:
  Unknown subscription

### Support

#### POST /support/ticket

:lock: authenticated with OAuth bearer token

<!--begin-route-post-supportticket-->

<!--end-route-post-supportticket-->

### Token codes

#### POST /session/verify/token

:lock: HAWK-authenticated with session token

<!--begin-route-post-sessionverifytoken-->

Verify a session using a token code.

<!--end-route-post-sessionverifytoken-->

##### Request body

- `code`: _string, min(TOKEN_CODE_LENGTH), max(TOKEN_CODE_LENGTH), regex(DIGITS), required_

  <!--begin-request-body-post-sessionverifytoken-code-->

  The code

  <!--end-request-body-post-sessionverifytoken-code-->

- `uid`: _string, max(32), regex(HEX_STRING), optional_

  <!--begin-request-body-post-sessionverifytoken-uid-->

  The uid associated with the token code

  <!--end-request-body-post-sessionverifytoken-uid-->

### Totp

#### POST /totp/create

:lock: HAWK-authenticated with session token

<!--begin-route-post-totpcreate-->

Create a new randomly generated TOTP token for a user if they do
not currently have one.

<!--end-route-post-totpcreate-->

##### Request body

- `metricsContext`: _metricsContext.schema_

  <!--begin-request-body-post-totpcreate-metricsContext-->

  <!--end-request-body-post-totpcreate-metricsContext-->

#### POST /totp/destroy

:lock: HAWK-authenticated with session token

<!--begin-route-post-totpdestroy-->

Deletes the current TOTP token for the user.

<!--end-route-post-totpdestroy-->

#### GET /totp/exists

:lock: HAWK-authenticated with session token

<!--begin-route-get-totpexists-->

Checks to see if the user has a TOTP token.

<!--end-route-get-totpexists-->

#### POST /session/verify/totp

:lock: HAWK-authenticated with session token

<!--begin-route-post-sessionverifytotp-->

Verifies the current session if the passed TOTP code is valid.

<!--end-route-post-sessionverifytotp-->

##### Request body

- `code`: _string, max(32), regex(validators.DIGITS), required_

  <!--begin-request-body-post-sessionverifytotp-code-->

  The TOTP code to check

  <!--end-request-body-post-sessionverifytotp-code-->

- `service`: _validators.service_

  <!--begin-request-body-post-sessionverifytotp-service-->

  <!--end-request-body-post-sessionverifytotp-service-->

##### Response body

- `success`: _boolean, required_

  <!--begin-response-body-post-sessionverifytotp-success-->

  <!--end-response-body-post-sessionverifytotp-success-->

- `recoveryCodes`: _array, items(string), optional_

  <!--begin-response-body-post-sessionverifytotp-recoveryCodes-->

  <!--end-response-body-post-sessionverifytotp-recoveryCodes-->

### Unblock codes

#### POST /account/login/send_unblock_code

<!--begin-route-post-accountloginsend_unblock_code-->

Send an unblock code via email
to reset rate-limiting for an account.

<!--end-route-post-accountloginsend_unblock_code-->

##### Request body

- `email`: _validators.email.required_

  <!--begin-request-body-post-accountloginsend_unblock_code-email-->

  Primary email for the account.

  <!--end-request-body-post-accountloginsend_unblock_code-email-->

- `metricsContext`: _metricsContext.schema_

  <!--begin-request-body-post-accountloginsend_unblock_code-metricsContext-->

  <!--end-request-body-post-accountloginsend_unblock_code-metricsContext-->

#### POST /account/login/reject_unblock_code

<!--begin-route-post-accountloginreject_unblock_code-->

Used to reject and report
unblock codes that were not requested by the user.

<!--end-route-post-accountloginreject_unblock_code-->

##### Request body

- `uid`: _string, max(32), regex(HEX_STRING), required_

  <!--begin-request-body-post-accountloginreject_unblock_code-uid-->

  The user id.

  <!--end-request-body-post-accountloginreject_unblock_code-uid-->

- `unblockCode`: _string, regex(BASE_36), length(unblockCodeLen), required_

  <!--begin-request-body-post-accountloginreject_unblock_code-unblockCode-->

  The unblock code.

  <!--end-request-body-post-accountloginreject_unblock_code-unblockCode-->

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

- `code`: _string, max(32), regex(HEX_STRING), required_

  <!--begin-query-param-get-verify_email-code-->

  <!--end-query-param-get-verify_email-code-->

- `uid`: _string, max(32), regex(HEX_STRING), required_

  <!--begin-query-param-get-verify_email-uid-->

  <!--end-query-param-get-verify_email-uid-->

- `service`: _string, max(16), alphanum, optional_

  <!--begin-query-param-get-verify_email-service-->

  <!--end-query-param-get-verify_email-service-->

- `redirectTo`: _validators.redirectTo(redirectDomain).optional_

  <!--begin-query-param-get-verify_email-redirectTo-->

  <!--end-query-param-get-verify_email-redirectTo-->

#### GET /complete_reset_password

<!--begin-route-get-complete_reset_password-->

<!--end-route-get-complete_reset_password-->

##### Query parameters

- `email`: _validators.email.required_

  <!--begin-query-param-get-complete_reset_password-email-->

  <!--end-query-param-get-complete_reset_password-email-->

- `code`: _string, max(32), regex(HEX_STRING), required_

  <!--begin-query-param-get-complete_reset_password-code-->

  <!--end-query-param-get-complete_reset_password-code-->

- `token`: _string, max(64), regex(HEX_STRING), required_

  <!--begin-query-param-get-complete_reset_password-token-->

  <!--end-query-param-get-complete_reset_password-token-->

- `service`: _string, max(16), alphanum, optional_

  <!--begin-query-param-get-complete_reset_password-service-->

  <!--end-query-param-get-complete_reset_password-service-->

- `redirectTo`: _validators.redirectTo(redirectDomain).optional_

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
when the script is run,
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
