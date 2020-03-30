# Firefox Accounts OAuth Server API

## Overview

### URL Structure

```
https://<server-url>/v1/<api-endpoint>
```

Note that:

- All API access must be over HTTPS.
- The URL embeds a version identifier "v1"; future revisions of this API may introduce new version numbers.
- The base URL of the server may be configured on a per-client basis.

### Errors

Invalid requests will return 4XX responses. Internal failures will return 5XX. Both will include JSON responses describing the error.

**Example error:**

```js
{
  "code": 400, // matches the HTTP status code
  "errno": 101, // stable application-level error number
  "error": "Bad Request", // string description of error type
  "message": "Unknown client"
}
```

The currently-defined error responses are:

| status code | errno | description                                   |
| :---------: | :---: | --------------------------------------------- |
|     400     |  101  | unknown client id                             |
|     400     |  102  | incorrect client secret                       |
|     400     |  103  | `redirect_uri` doesn't match registered value |
|     401     |  104  | invalid fxa assertion                         |
|     400     |  105  | unknown code                                  |
|     400     |  106  | incorrect code                                |
|     400     |  107  | expired code                                  |
|     400     |  108  | invalid token                                 |
|     400     |  109  | invalid request parameter                     |
|     400     |  110  | invalid response_type                         |
|     401     |  111  | unauthorized                                  |
|     403     |  112  | forbidden                                     |
|     415     |  113  | invalid content type                          |
|     400     |  114  | invalid scopes                                |
|     400     |  115  | expired token                                 |
|     400     |  116  | not a public client                           |
|     400     |  117  | incorrect code_challenge                      |
|     400     |  118  | pkce parameters missing                       |
|     400     |  119  | stale authentication timestamp                |
|     400     |  120  | mismatch acr value                            |
|     400     |  121  | invalid grant_type                            |
|     500     |  999  | internal server error                         |

## API Endpoints

- [GET /v1/authorization][redirect]
- [GET /v1/jwks][jwks]
- [POST /v1/authorization][authorization]
- [POST /v1/token][token]
- [POST /v1/destroy][delete]
- Clients
  - [GET /v1/client/:id][client]
  - [GET /v1/clients][clients]
  - [POST /v1/client][register]
  - [POST /v1/client/:id][client-update]
  - [DELETE /v1/client/:id][client-delete]
- Developers
  - [POST /v1/developer/activate][developer-activate]
- [POST /v1/verify][verify]
- [POST /v1/key-data][key-data]
- [POST /v1/authorized-clients][authorized-clients]
- [POST /v1/authorized-clients/destroy][authorized-clients-destroy]
- [POST /v1/introspect][introspect]
- (**DEPRECATED**) [GET /v1/client-tokens][client-tokens]
- (**DEPRECATED**) [DELETE /v1/client-tokens/:id][client-tokens-delete]

### GET /v1/client/:id

This endpoint is for the fxa-content-server to retrieve information
about a client to show in its user interface.

#### Request Parameters

- `id`: The `client_id` of a client asking for permission.

**Example:**

```sh
curl -v "https://oauth.accounts.firefox.com/v1/client/5901bd09376fadaa"
```

#### Response

A valid 200 response will be a JSON blob with the following properties:

- `name`: A string name of the client.
- `image_uri`: A url to a logo or image that represents the client.
- `redirect_uri`: The url registered to redirect to after successful oauth.
- `trusted`: Whether the client is a trusted internal application.

**Example:**

```json
{
  "name": "Where's My Fox",
  "image_uri": "https://mozilla.org/firefox.png",
  "redirect_uri": "https://wheres.my.firefox.com/oauth",
  "trusted": true
}
```

### GET /v1/clients

Get a list of all registered clients.

**Required scope:** `oauth`

#### Request

**Example:**

```sh
curl -v \
-H "Authorization: Bearer 558f9980ad5a9c279beb52123653967342f702e84d3ab34c7f80427a6a37e2c0" \
"https://oauth.accounts.firefox.com/v1/clients"
```

#### Response

A valid 200 response will be a JSON object with a property of `clients`,
which contains an array of client objects.

**Example:**

```json
{
  "clients": [
    {
      "id": "5901bd09376fadaa",
      "name": "Example",
      "redirect_uri": "https://ex.am.ple/path",
      "image_uri": "https://ex.am.ple/logo.png",
      "can_grant": false,
      "trusted": false
    }
  ]
}
```

### POST /v1/client

Register a new client (FxA relier).

**Required scope:** `oauth`

#### Request Parameters

- `name`: The name of the client.
- `redirect_uri`: The URI to redirect to after logging in.
- `image_uri`: A URI to an image to show to a user when logging in.
- `trusted`: Whether the client is a trusted internal application.
- `can_grant`: A client needs permission to get implicit grants.

**Example:**

```sh
curl -v \
-X POST \
-H "Content-Type: application/json" \
-H "Authorization: Bearer 558f9980ad5a9c279beb52123653967342f702e84d3ab34c7f80427a6a37e2c0" \
"https://oauth.accounts.firefox.com/v1/client" \
-d '{
  "name": "Example",
  "redirect_uri": "https://ex.am.ple/path",
  "image_uri": "https://ex.am.ple/logo.png",
  "trusted": false,
  "can_grant": false
}'
```

#### Response

A valid 201 response will be a JSON blob with the following properties:

- `client_id`: The generated id for this client.
- `client_secret`: The generated secret for this client. _NOTE: This is
  the only time you can get the secret, because we only keep a hashed
  version._
- `name`: A string name of the client.
- `image_uri`: A url to a logo or image that represents the client.
- `redirect_uri`: The url registered to redirect to after successful oauth.
- `can_grant`: If the client can get implicit grants.
- `trusted`: Whether the client is a trusted internal application.

**Example:**

```json
{
  "client_id": "5901bd09376fadaa",
  "client_secret": "4ab433e31ef3a7cf7c20590f047987922b5c9ceb1faff56f0f8164df053dd94c",
  "name": "Example",
  "redirect_uri": "https://ex.am.ple/path",
  "image_uri": "https://ex.am.ple/logo.png",
  "can_grant": false,
  "trusted": false
}
```

### POST /v1/client/:id

Update the details of a client. Any parameter not included in the
request will stay unchanged.

**Required scope:** `oauth`

#### Request Parameters

- `name`: The name of the client.
- `redirect_uri`: The URI to redirect to after logging in.
- `image_uri`: A URI to an image to show to a user when logging in.
- `trusted`: Whether the client is a trusted internal application.
- `can_grant`: A client needs permission to get implicit grants.

**Example:**

```sh
curl -v \
-X POST \
-H "Content-Type: application/json" \
-H "Authorization: Bearer 558f9980ad5a9c279beb52123653967342f702e84d3ab34c7f80427a6a37e2c0" \
"https://oauth.accounts.firefox.com/v1/client/5901bd09376fadaa" \
-d '{
  "name": "Example2",
  "redirect_uri": "https://ex.am.ple/path/2",
  "image_uri": "https://ex.am.ple/logo2.png",
}'
```

#### Response

A valid response will have a 200 status code and empty object `{}`.

### DELETE /v1/client/:id

Delete a client. It will be no more. Zilch. Nada. Nuked from orbit.

**Required scope:** `oauth`

#### Request Parameters

**Example:**

```sh
curl -v \
-X DELETE \
-H "Authorization: Bearer 558f9980ad5a9c279beb52123653967342f702e84d3ab34c7f80427a6a37e2c0" \
"https://oauth.accounts.firefox.com/v1/client/5901bd09376fadaa"
```

#### Response

A valid response will have a 204 response code and an empty body.

### POST /v1/developer/activate

Register an oauth developer.

**Required scope:** `oauth`

#### Request Parameters

- None

#### Response

A valid response will have a 200 status code and a developer object:

```
{"developerId":"f5b176ab5be5928d01d4bb0a6c182994","email":"d91c30a8@mozilla.com","createdAt":"2015-03-23T01:22:59.000Z"}
```

### GET /v1/authorization

This endpoint starts the OAuth flow. A client redirects the user agent
to this url. This endpoint will then redirect to the appropriate
content-server page.

#### Request Parameters

- `client_id`: The id returned from client registration.
- `state`: A value that will be returned to the client as-is upon redirection, so that clients can verify the redirect is authentic.
- `redirect_uri`: Optional. If supplied, a string URL of where to redirect afterwards. Must match URL from registration.
- `scope`: Optional. A space-separated list of scopes that the user has authorized. This could be pruned by the user at the confirmation dialog. If this includes the scope `openid`, this will be an OpenID Connect authentication request.
- `access_type`: Optional. If provided, should be `online` or `offline`. `offline` will result in a refresh_token being provided, so that the access_token can be refreshed after it expires.
- `action`: Optional. If provided, should be `email`, `signup`, `signin`, or `force_auth`. Send to improve the user experience.
  - If unspecified then Firefox Accounts will try choose intelligently between `signin` and `signup` based on the user's browser state.
  - `email` triggers the email-first flow, which uses the email address to determine whether to display signup or signin. This is becoming the **preferred** action and is slowly replacing `signin` and `signup`.
  - `signin` triggers the signin flow. (will become deprecated and replaced by `email`)
  - `signup` triggers the signup flow. (will become deprecated and replaced by `email`)
  - `force_auth` requires the user to sign in using the address specified in `email`.
- `email`: Optional if `action` is `email`, `signup` or `signin`. Required if `action`
  is `force_auth` or `prompt=none`.
  - if `action` is `email`, the email address will be used to determine whether to display the signup or signin form, but the user is free to change it.
  - If `action` is `signup` or `signin`, the email address will be pre-filled into the account form, but the user is free to change it.
  - If `action` is `signin`, the literal string `blank` will force the user to enter an email address and the last signed in email address will be ignored.
  - If `action` is `signin` and no email address is specified, the last
    signed in email address will be used as the default.
  - If `action` is `force_auth`, the user is unable to modify the email
    address and is unable to sign up if the address is not registered.
- `login_hint`: An alias to `email`
- `prompt`: Specifies whether the Authorization Server prompts the End-User for reauthentication and consent.
  - `consent`: The Authorization Server SHOULD prompt the End-User for consent before returning information to the Client.
  - `none`: The Authorization Server MUST NOT display any authentication or consent user interface pages. See the [prompt=none doc][prompt-none] for more info.

**Example:**

```sh
curl -v "https://oauth.accounts.firefox.com/v1/authorization?client_id=5901bd09376fadaa&state=1234&scope=profile:email&action=signup"
```

### POST /v1/authorization

This endpoint should be used by the fxa-content-server, requesting that
we supply a short-lived code (currently 15 minutes) that will be sent
back to the client. This code will be traded for a token at the
[token][] endpoint.

#### Request Parameters

- `client_id`: The id returned from client registration.
- `assertion`: A FxA assertion for the signed-in user.
- `state`: A value that will be returned to the client as-is upon redirection, so that clients can verify the redirect is authentic.
- `access_type`: Optional. A value of `offline` will generate a refresh token along with the access token.
- `acr_values`: Optional. A string-separated list of acr values that the token should have a claim for. Specifying `AAL2` will require the token to have an authentication assurance level >= 2 which corresponds to requiring 2FA.
- `code_challenge_method`: Required if using [PKCE](pkce.md). Must be `S256`, no other value is accepted.
- `code_challenge`: Required if using [PKCE](pkce.md). A minimum length of 43 characters and a maximum length of 128 characters string, encoded as `BASE64URL`.
- `keys_jwe`: Optional. A JWE bundle to be returned to the client when it redeems the authorization code.
- `redirect_uri`: Optional. If supplied, a string URL of where to redirect afterwards. Must match URL from registration.
- `resource`: Optional if `response_type=token`, forbidden if `response_type=code`. Indicates the target service or resource at which access is being requested. Its value must be an absolute URI, and may include a query component but must not include a fragment component. Added to the `aud` claim of JWT access tokens.
- `response_type`: Optional. If supplied, must be either `code` or `token`. `code` is the default. `token` means the implicit grant is desired, and requires that the client have special permission to do so.
  - **Note: new implementations should not use `response_type=token`; instead use `grant_type=fxa-credentials` at the [token][] endpoint.**
- `scope`: Optional. A string-separated list of scopes that the user has authorized. This could be pruned by the user at the confirmation dialog.
- `ttl`: Optional if `response_type=token`, forbidden if `response_type=code`. Indicates the requested lifespan in seconds for the implicit grant token. The value is subject to an internal maximum limit, so clients must check the `expires_in` result property for the actual TTL.

**Example:**

```sh
curl -v \
-X POST \
-H "Content-Type: application/json" \
"https://oauth.accounts.firefox.com/v1/authorization" \
-d '{
  "client_id": "5901bd09376fadaa",
  "assertion": "<assertion>",
  "state": "1234",
  "scope": "profile:email"
}'
```

#### Response

A valid request will return a 200 response, with JSON containing the `redirect` to follow. It will include the following query parameters:

- `code`: A string that the client will trade with the [token][] endpoint. Codes have a configurable expiration value, default is 15 minutes. Codes are single use only.
- `state`: The same value as was passed as a request parameter.

**Example:**

```json
{
  "redirect": "https://example.domain/path?foo=bar&code=4ab433e31ef3a7cf7c20590f047987922b5c9ceb1faff56f0f8164df053dd94c&state=1234"
}
```

##### Implicit Grant

If requesting an implicit grant (token), the response will match the
[/v1/token][token] response.

### POST /v1/token

After receiving an authorization grant from the user, clients exercise that grant
at this endpoint to obtain tokens that can be used to access attached services
for a particular user.

The following types of grant are possible:

- `authorization_code`: a single-use code as produced by the [authorization][] endpoint,
  obtained through a redirect-based authorization flow.
- `refresh_token`: a token previously obtained from this endpoint when using
  `access_type=offline`.
- `fxa-credentials`: an FxA identity assertion, obtained by directly authenticating
  the user's account.

#### Request Parameters

- `ppid_seed`: (optional) Seed used in `sub` claim generation of
  JWT access tokens/ID tokens for clients with [Pseudonymous Pairwise
  Identifiers (PPID)](https://github.com/mozilla/fxa/blob/master/packages/fxa-auth-server/fxa-oauth-server/docs/pairwise-pseudonymous-identifiers.md)
  enabled. Used to forcibly rotate the `sub` claim. Must be an integer in the range 0-1024.
  Defaults to 0.
- `resource`: (optional) Indicates the target service or resource at which access is being
  requested. Its value must be an absolute URI, and may include a query component but
  must not include a fragment component. Added to the `aud` claim of JWT access tokens.
- `ttl`: (optional) Seconds that the access_token should be valid.
  If unspecified this will default to the maximum value allowed by the
  server, which is a configurable option but would typically be measured
  in minutes or hours.
- `grant_type`: Either `authorization_code`, `refresh_token`, or `fxa-credentials`.
  - If `authorization_code`:
    - `client_id`: The id returned from client registration.
    - `client_secret`: The secret returned from client registration.
      Forbidden for public clients, required otherwise.
    - `code`: A string that was received from the [authorization][] endpoint.
    - `code_verifier`: The [PKCE](pkce.md) code verifier.
      Required for public clients, forbidden otherwise.
  - If `refresh_token`:
    - `client_id`: The id returned from client registration.
    - `client_secret`: The secret returned from client registration.
      Forbidden for public (PKCE) clients, required otherwise.
    - `refresh_token`: A string that received from the [token][]
      endpoint specifically as a refresh token.
    - `scope`: (optional) A subset of scopes provided to this
      refresh_token originally, to receive an access_token with less
      permissions.
  - If `fxa-credentials`:
    - `client_id`: The id returned from client registration.
    - `assertion`: FxA identity assertion authenticating the user.
    - `scope`: (optional) A string-separated list of scopes to be authorized.
    - `access_type`: (optional) Determines whether to generate a `refresh_token` (if `offline`)
      or not (if `online`).

**Example:**

```sh
curl -v \
-X POST \
-H "Content-Type: application/json" \
"https://oauth.accounts.firefox.com/v1/token" \
-d '{
  "client_id": "5901bd09376fadaa",
  "client_secret": "20c6882ef864d75ad1587c38f9d733c80751d2cbc8614e30202dc3d1d25301ff",
  "ttl": 3600,
  "grant_type": "authorization_code",
  "code": "4ab433e31ef3a7cf7c20590f047987922b5c9ceb1faff56f0f8164df053dd94c"
}'
```

#### Response

A valid request will return a JSON response with these properties:

- `access_token`: A string that can be used for authorized requests to service providers.
- `scope`: A string of space-separated permissions that this token has.
- `expires_in`: **Seconds** until this access token will no longer be valid.
- `token_type`: A string representing the token type. Currently will always be "bearer".
- `auth_at`: An integer giving the time at which the user authenticated to the Firefox Accounts server when generating this token, as a UTC unix timestamp (i.e. **seconds since epoch**).
- `refresh_token`: (Optional) A refresh token to fetch a new access token when this one expires. Only present if:
  - `grant_type=authorization_code` and the original authorization request included `access_type=offline`.
  - `grant_type=fxa-credentials` and the request included `access_type=offline`.
- `id_token`: (Optional) If the authorization was requested with `openid` scope, then this property will contain the OpenID Connect ID Token.
- `keys_jwe`: (Optional) Returns the JWE bundle of key material for any scopes that have keys, if `grant_type=authorization_code`.

**Example:**

```json
{
  "access_token": "558f9980ad5a9c279beb52123653967342f702e84d3ab34c7f80427a6a37e2c0",
  "scope": "profile:email profile:avatar",
  "token_type": "bearer",
  "expires_in": 3600,
  "refresh_token": "58d59cc97c3ca183b3a87a65eec6f93d5be051415b53afbf8491cc4c45dbb0c6",
  "auth_at": 1422336613
}
```

### POST /v1/destroy

After a client is done using a token, the responsible thing to do is to
destroy the token afterwards. A client can use this route to do so.

#### Request Parameters

- `token|access_token|refresh_token|refresh_token_id`: The hex string access token. By default, `token` is assumed to be the access token.

**Example:**

```sh
curl -v \
-X POST \
-H "Content-Type: application/json" \
"https://oauth.accounts.firefox.com/v1/destroy" \
-d '{
  "token": "558f9980ad5a9c279beb52123653967342f702e84d3ab34c7f80427a6a37e2c0"
}'
```

#### Response

A valid request will return an empty response, with a 200 status code.

### POST /v1/verify

Attached services can post tokens to this endpoint to learn about which
user and scopes are permitted for the token.

#### Request Parameters

- `token`: A token string received from a client

**Example:**

```sh
curl -v \
-X POST \
-H "Content-Type: application/json" \
"https://oauth.accounts.firefox.com/v1/verify" \
-d '{
  "token": "558f9980ad5a9c279beb52123653967342f702e84d3ab34c7f80427a6a37e2c0"
}'
```

#### Response

A valid request will return JSON with these properties:

- `user`: The uid of the respective user.
- `client_id`: The client_id of the respective client.
- `scope`: An array of scopes allowed for this token.
- `email`: **REMOVED** The email of the respective user.

**Example:**

```json
{
  "user": "5901bd09376fadaa076afacef5251b6a",
  "client_id": "45defeda038a1c92",
  "scope": ["profile:email", "profile:avatar"],
  "email": "foo@example.com"
}
```

### GET /v1/jwks

This endpoint returns the [JWKs](https://tools.ietf.org/html/rfc7517)
that are used for signing OpenID Connect id tokens.

#### Request

```sh
curl -v "https://oauth.accounts.firefox.com/v1/jwks"
```

#### Response

A valid response will return JSON of the `keys`.

**Example:**

```json
{
  "keys": [
    "alg": "RS256",
    "use": "sig",
    "kty": "RSA",
    "kid": "2015.12.02-1",
    "n":"xaQHsKpu1KSK-YEMoLzZS7Xxciy3esGrhrrqW_JBrq3IRmeGLaqlE80zcpIVnStyp9tbet2niYTemt8ug591YWO5Y-S0EgQyFTxnGjzNOvAL6Cd2iGie9QeSehfFLNyRPdQiadYw07fw-h5gweMpVJs8nTgS-Bcorlw9JQM6Il1cUpbP0Lt-F_5qrzlaOiTEAAb4JGOusVh0n-MZfKt7w0mikauMH5KfhflwQDn4YTzRkWJzlldXr1Cs0ZkYzOwS4Hcoku7vd6lqCUO0GgZvkuvCFqdVKzpa4CGboNdfIjcGVF4f1CTQaQ0ao51cwLzq1pgi5aWYhVH7lJcm6O_BQw",
    "e":"AQAC"
  ]
}
```

### POST /v1/post-keydata

This endpoint returns the required scoped key metadata.

#### Request

```sh
curl -X POST \
  https://oauth.accounts.firefox.com/v1/key-data \
  -H 'cache-control: no-cache' \
  -H 'content-type: application/json' \
  -d '{
 "client_id": "aaa6b9b3a65a1871",
 "assertion": "eyJhbGciOiJSUzI1NiJ9.eyJwdWJsaWMta2V5Ijp7Imt0eSI6IlJTQSIsIm4iOiJvWmdsNkpwM0Iwcm5BVXppNThrdS1iT0RvR3ZuUGNnWU1UdXQ1WkpyQkJiazBCdWU4VUlRQ0dnYVdrYU5Xb29INkktMUZ6SXU0VFpZYnNqWGJ1c2JRRlQxOGREUkN6VVRubFlXdVZXUzhoSWhKc3lhZHJwSHJOVkI1VndmSlRKZVgwTjFpczBXcU1qdUdOc2VMLXluYnFjOVhueElncFJaai05QnZqY2ZKYXNOUTNZdHR3VHZVaFJOLVFGNWgxQkY1MnA2QmdOTVBvWmQ5MC1EU0xydlpseXp6MEh0Q2tFZnNsc013czVkR0ExTlZ1dEwtcGVDeU50VTFzOEtFaDlzcGxXeF9lQlFybTlYQU1kYXp5ZWR6VUpJU1UyMjZmQzhEUHh5c0ZreXpCbjlDQnFDQUpTNjQzTGFydUVDaS1rMGhKOWFmM2JXTmJnWmpSNVJ2NXF4THciLCJlIjoiQVFBQiJ9LCJwcmluY2lwYWwiOnsiZW1haWwiOiIwNjIxMzM0YzIwNjRjNmYzNmJlOGFkOWE0N2M1NTliY2FwaS5hY2NvdW50cy5maXJlZm94LmNvbSJ9LCJpYXQiOjE1MDY5Njk2OTU0MzksImV4cCI6MTUwNjk2OTY5NjQzOSwiZnhhLXZlcmlmaWVkRW1haWwiOiIzMjM2NzJiZUBtb3ppbGxhLmNvbSIsImlzcyI6ImFwaS5hY2NvdW50cy5maXJlZm94LmNvbSJ9.hFZd5zFheXOFrXKkJvw6Vpv2l7ctlxuBTvuh5f_jLPAjZoJ9ri-vaJjL_WYBFUvS2xHzfx3-ldxLddyTKwCDAJeB_NkOFL_WJSrMet9C7_Z1hH9HmydeXIT82xJmhrwzW-WOO4ibQvRbocEFiNujynKsg1gS8v0iiYjIX-0cXCrlkxkbVx_8EXJFKDDOGzK9v7Zq6D7gkhP-CHEaNYaTHMn65tLQtBS6snGdaXlxoGHMWmDL6STbnJzWa7sa4QwHf-AgT1rUkQQAUHNa_XLZ0FEzqiCPctMadlihiUZL2V6vxIDBS4mHUF4qj0FvIMJflivDnJVkRNijDuP-h-Lh_A~eyJhbGciOiJSUzI1NiJ9.eyJhdWQiOiJvYXV0aC5meGEiLCJleHAiOjE1MDY5Njk2OTY0MzksImlzcyI6ImFwaS5hY2NvdW50cy5maXJlZm94LmNvbSJ9.M5xyk3RffucgaavjbUm7Eqnt47hzeGbGa2VR3jnVEIlRHfz5S25Qf3ngejwee7XECvIywbaKWeijXFOwS-EkB-7qP1gl4oNJjPmbnCk7S1lgckLWvdMIU-HLGKjrN6Mw76__LzvAbsusSeGmsvTCIVuOJ49Xs3tC1fLyB_re0QNpCcS6AUnJ1KOxIMEM3Om7ysNO5F_AqcD3PwlEti5lbwSk8iP5TWL12C2Nkb_6Hxze_mA1NZNAHOips9bF2J7oy1hqGoMYj1XYZrsyjpPWEuZQATAPlKSjbh1hq-UtDeT7DlwEmIbIUd3JA8qh1MkHKGgavd4fIMap0IPmr9rs4A",
 "scope": "https://identity.mozilla.com/apps/sample-scope-can-scope-key"
}'
```

#### Response

A valid response will return JSON the scoped key information for every scope that has scoped keys:

**Example:**

```json
{
  "https://identity.mozilla.com/apps/sample-scope-can-scope-key": {
    "identifier": "https://identity.mozilla.com/apps/sample-scope-can-scope-key",
    "keyRotationSecret": "0000000000000000000000000000000000000000000000000000000000000000",
    "keyRotationTimestamp": 1506970363512
  }
}
```

### GET /v1/authorized-clients

This endpoint returns a list of all OAuth client instances connected to the user's account,
including the the scopes granted to each client instance
and the time at which it was last active, if available.
It must be authenticated with an identity assertion for the user's account.

#### Request Parameters

- `assertion`: A FxA assertion for the signed-in user.

**Example:**

```sh
curl -X POST \
  https://oauth.accounts.firefox.com/v1/authorized-clients \
  -H 'cache-control: no-cache' \
  -H 'content-type: application/json' \
  -d '{
 "assertion": "eyJhbGciOiJSUzI1NiJ9.eyJwdWJsaWMta2V5Ijp7Imt0eSI6IlJTQSIsIm4iOiJvWmdsNkpwM0Iwcm5BVXppNThrdS1iT0RvR3ZuUGNnWU1UdXQ1WkpyQkJiazBCdWU4VUlRQ0dnYVdrYU5Xb29INkktMUZ6SXU0VFpZYnNqWGJ1c2JRRlQxOGREUkN6VVRubFlXdVZXUzhoSWhKc3lhZHJwSHJOVkI1VndmSlRKZVgwTjFpczBXcU1qdUdOc2VMLXluYnFjOVhueElncFJaai05QnZqY2ZKYXNOUTNZdHR3VHZVaFJOLVFGNWgxQkY1MnA2QmdOTVBvWmQ5MC1EU0xydlpseXp6MEh0Q2tFZnNsc013czVkR0ExTlZ1dEwtcGVDeU50VTFzOEtFaDlzcGxXeF9lQlFybTlYQU1kYXp5ZWR6VUpJU1UyMjZmQzhEUHh5c0ZreXpCbjlDQnFDQUpTNjQzTGFydUVDaS1rMGhKOWFmM2JXTmJnWmpSNVJ2NXF4THciLCJlIjoiQVFBQiJ9LCJwcmluY2lwYWwiOnsiZW1haWwiOiIwNjIxMzM0YzIwNjRjNmYzNmJlOGFkOWE0N2M1NTliY2FwaS5hY2NvdW50cy5maXJlZm94LmNvbSJ9LCJpYXQiOjE1MDY5Njk2OTU0MzksImV4cCI6MTUwNjk2OTY5NjQzOSwiZnhhLXZlcmlmaWVkRW1haWwiOiIzMjM2NzJiZUBtb3ppbGxhLmNvbSIsImlzcyI6ImFwaS5hY2NvdW50cy5maXJlZm94LmNvbSJ9.hFZd5zFheXOFrXKkJvw6Vpv2l7ctlxuBTvuh5f_jLPAjZoJ9ri-vaJjL_WYBFUvS2xHzfx3-ldxLddyTKwCDAJeB_NkOFL_WJSrMet9C7_Z1hH9HmydeXIT82xJmhrwzW-WOO4ibQvRbocEFiNujynKsg1gS8v0iiYjIX-0cXCrlkxkbVx_8EXJFKDDOGzK9v7Zq6D7gkhP-CHEaNYaTHMn65tLQtBS6snGdaXlxoGHMWmDL6STbnJzWa7sa4QwHf-AgT1rUkQQAUHNa_XLZ0FEzqiCPctMadlihiUZL2V6vxIDBS4mHUF4qj0FvIMJflivDnJVkRNijDuP-h-Lh_A~eyJhbGciOiJSUzI1NiJ9.eyJhdWQiOiJvYXV0aC5meGEiLCJleHAiOjE1MDY5Njk2OTY0MzksImlzcyI6ImFwaS5hY2NvdW50cy5maXJlZm94LmNvbSJ9.M5xyk3RffucgaavjbUm7Eqnt47hzeGbGa2VR3jnVEIlRHfz5S25Qf3ngejwee7XECvIywbaKWeijXFOwS-EkB-7qP1gl4oNJjPmbnCk7S1lgckLWvdMIU-HLGKjrN6Mw76__LzvAbsusSeGmsvTCIVuOJ49Xs3tC1fLyB_re0QNpCcS6AUnJ1KOxIMEM3Om7ysNO5F_AqcD3PwlEti5lbwSk8iP5TWL12C2Nkb_6Hxze_mA1NZNAHOips9bF2J7oy1hqGoMYj1XYZrsyjpPWEuZQATAPlKSjbh1hq-UtDeT7DlwEmIbIUd3JA8qh1MkHKGgavd4fIMap0IPmr9rs4A",
}'
```

#### Response

A valid 200 response will be a JSON array
where each item has the following properties:

- `client_id`: The hex id of the client.
- `refresh_token_id`: (optional) The ID of the refresh token held the client instance
- `client_name`: The string name of the client.
- `created_time`: Integer time of token creation.
- `last_access_time`: Integer last-access time for the token.
- `scope`: Sorted list of all scopes granted to the client instance.

For clients that use refresh tokens, each refresh token is taken to represent
a separate instance of that client and is returned as a separate entry in the list,
with the `refresh_token_id` field distinguishing each.

For clients that only use access tokens, all active access tokens are combined
into a single entry in the list, and the `refresh_token_id` field will not be present.

**Example:**

```json
[
  {
    "client_id": "5901bd09376fadaa",
    "refresh_token_id": "6e8c38f6a9c27dc0e4df698dc3e3e8b101ad6d79e87842b1ca96ad9b3cd8ed28",
    "name": "Example Sync Client",
    "created_time": 1528334748000,
    "last_access_time": 1528334748000,
    "scope": ["profile", "https://identity.mozilla.com/apps/oldsync"]
  },
  {
    "client_id": "5901bd09376fadaa",
    "refresh_token_id": "eb5e17f246a6b0937356412118ea12b67a638232d6b376e2511cf38a0c4eecf9",
    "name": "Example Sync Client",
    "created_time": 1528334748000,
    "last_access_time": 1528334834000,
    "scope": ["profile", "https://identity.mozilla.com/apps/oldsync"]
  },
  {
    "client_id": "23d10a14f474ca41",
    "name": "Example Website",
    "created_time": 1328334748000,
    "last_access_time": 1476677854037,
    "scope": ["profile:email", "profile:uid"]
  }
]
```

### POST /v1/authorized-clients/destroy

This endpoint revokes tokens granted to a given client.
It must be authenticated with an identity assertion for the user's account.

#### Request Parameters

- `client_id`: The `client_id` of the client whose tokens should be deleted.
- `refresh_token_id`: (Optional) The specific `refresh_token_id` to be destroyed.
- `assertion`: A FxA assertion for the signed-in user.

**Example:**

```sh
curl -X POST \
  https://oauth.accounts.firefox.com/v1/authorized-clients/destroy \
  -H 'cache-control: no-cache' \
  -H 'content-type: application/json' \
  -d '{
 "client_id": "5901bd09376fadaa",
 "refresh_token_id": "6e8c38f6a9c27dc0e4df698dc3e3e8b101ad6d79e87842b1ca96ad9b3cd8ed28",
 "assertion": "eyJhbGciOiJSUzI1NiJ9.eyJwdWJsaWMta2V5Ijp7Imt0eSI6IlJTQSIsIm4iOiJvWmdsNkpwM0Iwcm5BVXppNThrdS1iT0RvR3ZuUGNnWU1UdXQ1WkpyQkJiazBCdWU4VUlRQ0dnYVdrYU5Xb29INkktMUZ6SXU0VFpZYnNqWGJ1c2JRRlQxOGREUkN6VVRubFlXdVZXUzhoSWhKc3lhZHJwSHJOVkI1VndmSlRKZVgwTjFpczBXcU1qdUdOc2VMLXluYnFjOVhueElncFJaai05QnZqY2ZKYXNOUTNZdHR3VHZVaFJOLVFGNWgxQkY1MnA2QmdOTVBvWmQ5MC1EU0xydlpseXp6MEh0Q2tFZnNsc013czVkR0ExTlZ1dEwtcGVDeU50VTFzOEtFaDlzcGxXeF9lQlFybTlYQU1kYXp5ZWR6VUpJU1UyMjZmQzhEUHh5c0ZreXpCbjlDQnFDQUpTNjQzTGFydUVDaS1rMGhKOWFmM2JXTmJnWmpSNVJ2NXF4THciLCJlIjoiQVFBQiJ9LCJwcmluY2lwYWwiOnsiZW1haWwiOiIwNjIxMzM0YzIwNjRjNmYzNmJlOGFkOWE0N2M1NTliY2FwaS5hY2NvdW50cy5maXJlZm94LmNvbSJ9LCJpYXQiOjE1MDY5Njk2OTU0MzksImV4cCI6MTUwNjk2OTY5NjQzOSwiZnhhLXZlcmlmaWVkRW1haWwiOiIzMjM2NzJiZUBtb3ppbGxhLmNvbSIsImlzcyI6ImFwaS5hY2NvdW50cy5maXJlZm94LmNvbSJ9.hFZd5zFheXOFrXKkJvw6Vpv2l7ctlxuBTvuh5f_jLPAjZoJ9ri-vaJjL_WYBFUvS2xHzfx3-ldxLddyTKwCDAJeB_NkOFL_WJSrMet9C7_Z1hH9HmydeXIT82xJmhrwzW-WOO4ibQvRbocEFiNujynKsg1gS8v0iiYjIX-0cXCrlkxkbVx_8EXJFKDDOGzK9v7Zq6D7gkhP-CHEaNYaTHMn65tLQtBS6snGdaXlxoGHMWmDL6STbnJzWa7sa4QwHf-AgT1rUkQQAUHNa_XLZ0FEzqiCPctMadlihiUZL2V6vxIDBS4mHUF4qj0FvIMJflivDnJVkRNijDuP-h-Lh_A~eyJhbGciOiJSUzI1NiJ9.eyJhdWQiOiJvYXV0aC5meGEiLCJleHAiOjE1MDY5Njk2OTY0MzksImlzcyI6ImFwaS5hY2NvdW50cy5maXJlZm94LmNvbSJ9.M5xyk3RffucgaavjbUm7Eqnt47hzeGbGa2VR3jnVEIlRHfz5S25Qf3ngejwee7XECvIywbaKWeijXFOwS-EkB-7qP1gl4oNJjPmbnCk7S1lgckLWvdMIU-HLGKjrN6Mw76__LzvAbsusSeGmsvTCIVuOJ49Xs3tC1fLyB_re0QNpCcS6AUnJ1KOxIMEM3Om7ysNO5F_AqcD3PwlEti5lbwSk8iP5TWL12C2Nkb_6Hxze_mA1NZNAHOips9bF2J7oy1hqGoMYj1XYZrsyjpPWEuZQATAPlKSjbh1hq-UtDeT7DlwEmIbIUd3JA8qh1MkHKGgavd4fIMap0IPmr9rs4A",
}'
```

#### Response

A valid 200 response will return an empty JSON object.

### POST /v1/introspect

This endpoint returns the status of the token and meta-information about this token.

#### Request Parameters

- `token`: An OAuth token for the user.
- `token_type_hint`: A literal string `"access_token"` or `"refresh_token"`

**Example:**

```sh
curl -X POST \
  -H "Content-Type: application/json" \
  "https://oauth.accounts.firefox.com/v1/introspect" \
  -d '{"token":"5e00491407a01507bdc4002fd7b675fb4e7d039045a7e6755e4aed0d3e287c69"}'
```

#### Response

A valid request will return a JSON response with these properties:

- `active`: Boolean indicator of weather the presented token is active.
- `scope`: Optional. A space-seperated list of scopes associated with this token.
- `client_id`: Optional. The hex id of the client whose token was passed.
- `token_type`: A string representing the token type. It will be `"access_token"` or `"refresh_token"`.
- `iat`: Optional. Integer time of token creation.
- `sub`: Optional. The hex id of the user.
- `jti`: Optional. The hex id of the token
- `exp`: Optional. Integer time of token expiration.
- `fxa-lastUsedAt`: Optional. Integer time when this token is last used.

**Example:**

```json
{
  "active": true,
  "scope": "profile https://identity.mozilla.com/account/subscriptions",
  "client_id": "59cceb6f8c32317c",
  "token_type": "access_token",
  "iat": 1566535888243,
  "sub": "913fe9395bb946b48c1521d7beb2cb24",
  "jti": "5ae05d8fe413a749e0f4eb3c495a1c526fb52c85ca5fde516df5dd77d41f7b5b",
  "exp": 1566537688243
}
```

### GET /v1/client-tokens

**DEPRECATED**: Please use [POST /v1/authorized-clients][authorized-clients] instead.

This endpoint returns a list of all clients with active OAuth tokens for the user,
including the the scopes granted to each client
and the last time each client was active.
It must be authenticated with an OAuth token bearing scope "clients:write".

#### Request

**Example:**

```sh
curl -X GET \
  https://oauth.accounts.firefox.com/v1/client-tokens \
  -H 'cache-control: no-cache' \
  -H "Authorization: Bearer 558f9980ad5a9c279beb52123653967342f702e84d3ab34c7f80427a6a37e2c0"
```

#### Response

A valid 200 response will be a JSON array
where each item has the following properties:

- `id`: The hex id of the client.
- `name`: The string name of the client.
- `lastAccessTime`: Integer last-access time for the client.
- `lastAccessTimeFormatted`: Localized string last-access time for the client.
- `scope`: Sorted list of all scopes granted to the client.

**Example:**

```json
[
  {
    "id": "5901bd09376fadaa",
    "name": "Example",
    "lastAccessTime": 1528334748000,
    "lastAccessTimeFormatted": "13 days ago",
    "scope": ["openid", "profile"]
  },
  {
    "id": "23d10a14f474ca41",
    "name": "Example Two",
    "lastAccessTime": 1476677854037,
    "lastAccessTimeFormatted": "2 years ago",
    "scope": ["profile:email", "profile:uid"]
  }
]
```

### DELETE /v1/client-tokens/:id

**DEPRECATED**: Please use [POST /v1/authorized-clients/destroy][authorized-clients-destroy] instead.

This endpoint deletes all tokens granted to a given client.
It must be authenticated with an OAuth token bearing scope "clients:write".

#### Request Parameters

- `id`: The `client_id` of the client whose tokens should be deleted.

**Example:**

```sh
curl -X DELETE
  https://oauth.accounts.firefox.com/v1/client-tokens/5901bd09376fadaa
  -H "Authorization: Bearer 558f9980ad5a9c279beb52123653967342f702e84d3ab34c7f80427a6a37e2c0"
```

#### Response

A valid 200 response will return an empty JSON object.

[client]: #get-v1clientid
[register]: #post-v1client
[clients]: #get-v1clients
[client-update]: #post-v1clientid
[client-delete]: #delete-v1clientid
[redirect]: #get-v1authorization
[authorization]: #post-v1authorization
[token]: #post-v1token
[delete]: #post-v1destroy
[verify]: #post-v1verify
[developer-activate]: #post-v1developeractivate
[jwks]: #get-v1jwks
[key-data]: #post-v1post-keydata
[authorized-clients]: #get-v1authorized-clients
[authorized-clients-destroy]: #post-v1authorized-clientsdestroy
[introspect]: #post-v1introspect
[client-tokens]: #get-v1client-tokens
[client-tokens-delete]: #delete-v1client-tokensid
[prompt-none]: https://github.com/mozilla/fxa/blob/master/packages/fxa-auth-server/fxa-oauth-server/docs/prompt-none.md
