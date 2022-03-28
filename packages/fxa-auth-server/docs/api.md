# Firefox Accounts authentication server API

**WARNING:**
Some of this information is wrong,
use it at your own risk.
It may be worth verifying things in the source code
before acting on anything you read here.

<!--begin-abstract-->

This document provides protocol-level details
of the Firefox Accounts auth server API.
For a prose description of the client/server protocol
and details on how each parameter is derived,
see the [API design document](https://wiki.mozilla.org/Identity/AttachedServices/KeyServerProtocol).
For a reference client implementation,
see [`fxa-auth-client`](https://github.com/mozilla/fxa/tree/main/packages/fxa-auth-client).

<!--end-abstract-->

- [Overview](#overview)
  - [URL structure](#url-structure)
  - [Request format](#request-format)
  - [Response format](#response-format)
    - [Defined errors](#defined-errors)
    - [Responses from intermediary servers](#responses-from-intermediary-servers)
  - [Validation](#validation)
- [Back-off protocol](#back-off-protocol)

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
use [Hawk](https://github.com/hapijs/hawk) request signatures.
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
  Missing parameter in request body
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
  Requested scopes are not allowed
- `code: 400, errno: 170`:
  Public clients require PKCE OAuth parameters
- `code: 400, errno: 171`:
  Required Authentication Context Reference values could not be satisfied
- `code: 404, errno: 176`:
  Unknown subscription
- `code: 400, errno: 177`:
  Unknown subscription plan
- `code: 400, errno: 178`:
  Subscription payment token rejected
- `code: 503, errno: 201`:
  Service unavailable
- `code: 503, errno: 202`:
  Feature not enabled
- `code: 500, errno: 203`:
  A backend service request failed.
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
- `errno: 164`: authAt
- `errno: 167`: redirectUri
- `errno: 169`: invalidScopes
- `errno: 171`: foundValue
- `errno: 201`: retryAfter
- `errno: 202`: retryAfter
- `errno: 203`: service, operation
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
- `accessToken`: `module.exports.hexString.length(64)`
- `refreshToken`: `module.exports.hexString.length(64)`
- `authorizationCode`: `module.exports.hexString.length(64)`
- `scope`: `string, max(256), regex(/^[a-zA-Z0-9 _\/.:-]*$/), allow('')`
- `assertion`: `string, min(50), max(10240), regex(/^[a-zA-Z0-9_\-\.~=]+$/)`
- `pkceCodeChallengeMethod`: `string, valid('S256')`
- `pkceCodeChallenge`: `string, length(43), regex(module, exports.URL_SAFE_BASE_64)`
- `pkceCodeVerifier`: `string, length(43), regex(module, exports.PKCE_CODE_VERIFIER)`
- `jwe`: `string, max(1024), regex(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/)`
- `verificationMethod`: `string, valid()`
- `authPW`: `string, length(64), regex(HEX_STRING), required`
- `wrapKb`: `string, length(64), regex(/^(?:[a-fA-F0-9]{2})+$/)`
- `recoveryKeyId`: `string, regex(HEX_STRING), max(32)`
- `recoveryData`: `string, regex(/[a-zA-Z0-9.]/), max(1024), required`
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
  "info": "https://github.com/mozilla/fxa/blob/main/packages/fxa-auth-server/docs/api.md#response-format",
  "retryAfter": 30,
  "retryAfterLocalized": "in a few seconds"
}
```

<!--end-back-off-protocol-->
