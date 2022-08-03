/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import dedent from 'dedent';

export const AUTH_SERVER_API_DESCRIPTION = {
  description: dedent`
    This document provides protocol-level details of the Firefox Accounts auth server API. For a prose description of the client/server protocol and details on how each parameter is derived, see the [API design document](https://wiki.mozilla.org/Identity/AttachedServices/KeyServerProtocol). For a reference client implementation, see [fxa-auth-client](https://github.com/mozilla/fxa/tree/main/packages/fxa-auth-client).

    ## URL Structure for Auth Server
    All requests use URLs of the form:

    > \`https://<base-URI>/v1/<endpoint-path>\`

    Note that:

    - All API access must be over a properly-validated HTTPS connection.
    - The URL embeds a version identifier \`v1\`.
      Future revisions of this API may introduce new version numbers.
    - The base URI of the server may be configured on a per-client basis:
      - The canonical URL for Mozilla's hosted Firefox Accounts server
        is \`https://api.accounts.firefox.com/v1\`.

    ## Request Format
    All POST requests must have a content-type of \`application/json\` with a UTF8-encoded JSON body and must specify the content-length header. Keys and other binary data are included in the JSON as hexadecimal strings.

    The following request headers may be specified to influence the behavior of the server:

    - \`Accept-Language\` may be used to localize emails and SMS messages.

    ## Response format
    All requests receive a JSON response body with a \`Content-Type: application/json\` header and appropriate \`Content-Length\` set. The body structure depends on the endpoint returning it.

    Successful responses will have an HTTP status code of 200 and a \`Timestamp\` header that contains the current server time in seconds since the epoch.

    Error responses caused by invalid client behavior will have an HTTP status code in the 4xx range. Error responses caused by server-side problems will have an HTTP status code in the 5xx range. Failures due to invalid behavior from the client.

    To simplify error handling for the client, the type of error is indicated by both
    a defined HTTP status code and an application-specific \`errno\` in the body.

    For example:

    \`\`\`js
        {
          "code": 400,  // Matches the HTTP status code
          "errno": 107, // Stable application-level error number
          "error": "Bad Request", // String description of the error type
          "message": "Invalid parameter in request body", // Specific error message
          "info": "https://docs.dev.lcip.og/errors/1234"  // Link to more information
        }
    \`\`\`

    Responses for some errors may include additional parameters.


    ### Defined errors

    The currently-defined values for \`code\` and \`errno\` are:

    | status code | errno | description                                                                   |
    |-------------|-------|-------------------------------------------------------------------------------|
    | 400         | 100   | Incorrect Database Patch Level                                                |
    | 400         | 101   | Account already exists                                                        |
    | 400         | 102   | Unknown account                                                               |
    | 400         | 103   | Incorrect password                                                            |
    | 400         | 104   | Unverified account                                                            |
    | 400         | 105   | Invalid verification code                                                     |
    | 400         | 106   | Invalid JSON in request body                                                  |
    | 400         | 107   | Invalid parameter in request body                                             |
    | 400         | 108   | Missing parameter in request body                                             |
    | 401         | 109   | Invalid request signature                                                     |
    | 401         | 110   | Invalid authentication token in request signature                             |
    | 401         | 111   | Invalid timestamp in request signature                                        |
    | 411         | 112   | Missing content-length header                                                 |
    | 413         | 113   | Request body too large                                                        |
    | 429         | 114   | Client has sent too many requests                                             |
    | 401         | 115   | Invalid nonce in request signature                                            |
    | 410         | 116   | This endpoint is no longer supported                                          |
    | 400         | 120   | Incorrect email case                                                          |
    | 400         | 123   | Unknown device                                                                |
    | 400         | 124   | Session already registered by another device                                  |
    | 400         | 125   | The request was blocked for security reasons                                  |
    | 400         | 126   | Account must be reset                                                         |
    | 400         | 127   | Invalid unblock code                                                          |
    | 400         | 129   | Invalid phone number                                                          |
    | 400         | 130   | Invalid region                                                                |
    | 400         | 131   | Invalid message id                                                            |
    | 500         | 132   | Message rejected                                                              |
    | 400         | 133   | Email account sent complaint                                                  |
    | 400         | 134   | Email account hard bounced                                                    |
    | 400         | 135   | Email account soft bounced                                                    |
    | 400         | 136   | Email already exists                                                          |
    | 400         | 137   | Can not delete primary email                                                  |
    | 400         | 138   | Unverified session                                                            |
    | 400         | 139   | Can not add secondary email that is same as your primary                      |
    | 400         | 140   | Email already exists                                                          |
    | 400         | 141   | Email already exists                                                          |
    | 400         | 142   | Sign in with this email type is not currently supported                       |
    | 400         | 143   | Unknown email                                                                 |
    | 400         | 144   | Email already exists                                                          |
    | 400         | 145   | Reset password with this email type is not currently supported                |
    | 400         | 146   | Invalid signin code                                                           |
    | 400         | 147   | Can not change primary email to an unverified email                           |
    | 400         | 148   | Can not change primary email to an email that does not belong to this account |
    | 400         | 149   | This email can not currently be used to login                                 |
    | 400         | 150   | Can not resend email code to an email that does not belong to this account    |
    | 500         | 151   | Failed to send email                                                          |
    | 422         | 151   | Failed to send email                                                          |
    | 400         | 152   | Invalid token verification code                                               |
    | 400         | 153   | Expired token verification code                                               |
    | 400         | 154   | TOTP token already exists for this account.                                   |
    | 400         | 155   | TOTP token not found.                                                         |
    | 400         | 156   | Recovery code not found.                                                      |
    | 400         | 157   | Unavailable device command.                                                   |
    | 400         | 158   | Recovery key not found.                                                       |
    | 400         | 159   | Recovery key is not valid.                                                    |
    | 400         | 160   | This request requires two step authentication enabled on your account.        |
    | 400         | 161   | Recovery key already exists.                                                  |
    | 400         | 162   | Unknown client_id                                                             |
    | 400         | 164   | Stale auth timestamp                                                          |
    | 409         | 165   | Redis WATCH detected a conflicting update                                     |
    | 400         | 166   | Not a public client                                                           |
    | 400         | 167   | Incorrect redirect URI                                                        |
    | 400         | 168   | Invalid response_type                                                         |
    | 400         | 169   | Requested scopes are not allowed                                              |
    | 400         | 170   | Public clients require PKCE OAuth parameters                                  |
    | 400         | 171   | Required Authentication Context Reference values could not be satisfied       |
    | 404         | 176   | Unknown subscription                                                          |
    | 400         | 177   | Unknown subscription plan                                                     |
    | 400         | 178   | Subscription payment token rejected                                           |
    | 503         | 201   | Service unavailable                                                           |
    | 503         | 202   | Feature not enabled                                                           |
    | 500         | 203   | A backend service request failed.                                             |
    | 500         | 998   | An internal validation check failed.                                          |

    The following errors include additional response properties:

    | errno | description                                                             |
    |-------|-------------------------------------------------------------------------|
    | 100   | level, levelRequired                                                    |
    | 101   | email                                                                   |
    | 102   | email                                                                   |
    | 103   | email                                                                   |
    | 105   |                                                                         |
    | 107   | validation                                                              |
    | 108   | param                                                                   |
    | 111   | serverTime                                                              |
    | 114   | retryAfter, retryAfterLocalized, verificationMethod, verificationReason |
    | 120   | email                                                                   |
    | 124   | deviceId                                                                |
    | 125   | verificationMethod, verificationReason                                  |
    | 126   | email                                                                   |
    | 130   | region                                                                  |
    | 132   | reason, reasonCode                                                      |
    | 133   | bouncedAt                                                               |
    | 134   | bouncedAt                                                               |
    | 135   | bouncedAt                                                               |
    | 152   |                                                                         |
    | 153   |                                                                         |
    | 162   | clientId                                                                |
    | 164   | authAt                                                                  |
    | 167   | redirectUri                                                             |
    | 169   | invalidScopes                                                           |
    | 171   | foundValue                                                              |
    | 201   | retryAfter                                                              |
    | 202   | retryAfter                                                              |
    | 203   | service, operation                                                      |
    | 998   | op, data                                                                |


    ### Responses from intermediary servers

    As with any HTTP-based API, clients must handle standard errors that may be returned by proxies, load-balancers or other intermediary servers. These non-application responses can be identified by the absence of a correctly-formatted JSON response body.

    Common examples include:

    - \`413 Request Entity Too Large\`: may be returned by an upstream proxy server.
    - \`502 Gateway Timeout\`: may be returned if a load-balancer can't connect to application servers.

    ## Validation
    In the documentation that follows, some properties of requests and responses are validated by common code that has been refactored and extracted. For reference, those common validations are defined here.


    ### lib/routes/validators

    - \`HEX_STRING\`: \`/^(?:[a-fA-F0-9]{2})+$/\`
    - \`BASE_36\`: \`/^[a-zA-Z0-9]*$/\`
    - \`URL_SAFE_BASE_64\`: \`/^[A-Za-z0-9_-]+$/\`
    - \`PKCE_CODE_VERIFIER\`: \`/^[A-Za-z0-9-\._~]{43,128}$/\`
    - \`DISPLAY_SAFE_UNICODE\`: \`/^(?:[^\u0000-\u001F\u007F\u0080-\u009F\u2028-\u2029\uD800-\uDFFF\uE000-\uF8FF\uFFF9-\uFFFF])*$/\`
    - \`DISPLAY_SAFE_UNICODE_WITH_NON_BMP\`: \`/^(?:[^\u0000-\u001F\u007F\u0080-\u009F\u2028-\u2029\uE000-\uF8FF\uFFF9-\uFFFF])*$/\`
    - \`BEARER_AUTH_REGEX\`: \`/^Bearer\s+([a-z0-9+\/]+)$/i\`
    - \`service\`: \`string, max(16), regex(/^[a-zA-Z0-9\-]*$/)\`
    - \`hexString\`: \`string, regex(/^(?:[a-fA-F0-9]{2})+$/)\`
    - \`clientId\`: \`module.exports.hexString.length(16)\`
    - \`clientSecret\`: \`module.exports.hexString\`
    - \`accessToken\`: \`module.exports.hexString.length(64)\`
    - \`refreshToken\`: \`module.exports.hexString.length(64)\`
    - \`authorizationCode\`: \`module.exports.hexString.length(64)\`
    - \`scope\`: \`string, max(256), regex(/^[a-zA-Z0-9 _\/.:-]*$/), allow('')\`
    - \`assertion\`: \`string, min(50), max(10240), regex(/^[a-zA-Z0-9_\-\.~=]+$/)\`
    - \`pkceCodeChallengeMethod\`: \`string, valid('S256')\`
    - \`pkceCodeChallenge\`: \`string, length(43), regex(module, exports.URL_SAFE_BASE_64)\`
    - \`pkceCodeVerifier\`: \`string, length(43), regex(module, exports.PKCE_CODE_VERIFIER)\`
    - \`jwe\`: \`string, max(1024), regex(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/)\`
    - \`verificationMethod\`: \`string, valid()\`
    - \`authPW\`: \`string, length(64), regex(HEX_STRING), required\`
    - \`wrapKb\`: \`string, length(64), regex(/^(?:[a-fA-F0-9]{2})+$/)\`
    - \`recoveryKeyId\`: \`string, regex(HEX_STRING), max(32)\`
    - \`recoveryData\`: \`string, regex(/[a-zA-Z0-9.]/), max(1024), required\`
    - \`E164_NUMBER\`: \`/^\+[1-9]\d{1,14}$/\`
    - \`DIGITS\`: \`/^[0-9]+$/\`
    - \`DEVICE_COMMAND_NAME\`: \`/^[a-zA-Z0-9._\/\-:]{1,100}$/\`
    - \`IP_ADDRESS\`: \`string, ip\`


    ### lib/metrics/context

    - \`SCHEMA\`: object({
      - \`deviceId\`: string, length(32), regex(HEX_STRING), optional
      - \`entrypoint\`: ENTRYPOINT_SCHEMA.optional
      - \`entrypointExperiment\`: ENTRYPOINT_SCHEMA.optional
      - \`entrypointVariation\`: ENTRYPOINT_SCHEMA.optional
      - \`flowId\`: string, length(64), regex(HEX_STRING), optional
      - \`flowBeginTime\`: number, integer, positive, optional
      - \`utmCampaign\`: UTM_CAMPAIGN_SCHEMA.optional
      - \`utmContent\`: UTM_SCHEMA.optional
      - \`utmMedium\`: UTM_SCHEMA.optional
      - \`utmSource\`: UTM_SCHEMA.optional
      - \`utmTerm\`: UTM_SCHEMA.optional
        }), unknown(false), and('flowId', 'flowBeginTime')
    - \`schema\`: SCHEMA.optional
    - \`requiredSchema\`: SCHEMA.required


    ### lib/features

    - \`schema\`: array, items(string), optional


    ### lib/devices

    - \`schema\`: {

      - \`id\`: isA.string.length(32).regex(HEX_STRING)
      - \`location\`: isA.object({
        - \`city\`: isA.string.optional.allow(null)
        - \`country\`: isA.string.optional.allow(null)
        - \`state\`: isA.string.optional.allow(null)
        - \`stateCode\`: isA.string.optional.allow(null)
        - })
      - \`name\`: isA.string.max(255).regex(DISPLAY_SAFE_UNICODE_WITH_NON_BMP)
      - \`nameResponse\`: isA.string.max(255).allow('')
      - \`type\`: isA.string.max(16)
      - \`pushCallback\`: validators.pushCallbackUrl({ scheme: 'https' }).regex(PUSH_SERVER_REGEX).max(255).allow('')
      - \`pushPublicKey\`: isA.string.max(88).regex(URL_SAFE_BASE_64).allow('')
      - \`pushAuthKey\`: isA.string.max(24).regex(URL_SAFE_BASE_64).allow('')
      - \`pushEndpointExpired\`: isA.boolean.strict
      - \`availableCommands\`: isA.object.pattern(validators.DEVICE_COMMAND_NAME
      - \`isA.string.max(2048))

      }

    ## Back-off protocol

    During periods of heavy load, the server may request that clients enter a "back-off" state,
    in which they avoid making further requests.

    At such times,
    it will return a \`503 Service Unavailable\` response
    with a \`Retry-After\` header denoting the number of seconds to wait
    before issuing any further requests.
    It will also include \`errno: 201\`
    and a \`retryAfter\` field
    matching the value of the \`Retry-After\` header
    in the body.

    For example,
    the following response indicates that the client
    should suspend making further requests
    for 30 seconds:

    \`\`\`js
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
  \`\`\`
  `,
};
