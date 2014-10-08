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

| status code | errno | description |
|:-----------:|:-----:|-------------|
| 400 | 101 | unknown client id |
| 400 | 102 | incorrect client secret |
| 400 | 103 | `redirect_uri` doesn't match registered value |
| 400 | 104 | invalid fxa assertion |
| 400 | 105 | unknown code |
| 400 | 106 | incorrect code |
| 400 | 107 | expired code |
| 400 | 108 | invalid token |
| 400 | 109 | invalid request parameter |
| 400 | 110 | invalid response_type |
| 500 | 999 | internal server error |

## API Endpoints


- [GET /v1/authorization][redirect]
- [POST /v1/authorization][authorization]
- [POST /v1/token][token]
- [POST /v1/destroy][delete]
- [GET /v1/client/:id][client]
- [POST /v1/verify][verify]

### GET /v1/client/:id

This endpoint is for the fxa-content-server to retreive information
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

**Example:**

```json
{
  "name": "Where's My Fox",
  "image_uri": "https://mozilla.org/firefox.png",
  "redirect_uri": "https://wheres.my.firefox.com/oauth"
}
```

### GET /v1/authorization

This endpoint starts the OAuth flow. A client redirects the user agent
to this url. This endpoint will then redirect to the appropriate
content-server page.

#### Request Parameters

- `client_id`: The id returned from client registration.
- `state`: A value that will be returned to the client as-is upon redirection, so that clients can verify the redirect is authentic.
- `redirect_uri`: Optional. If supplied, a string URL of where to redirect afterwards. Must match URL from registration.
- `scope`: Optional. A space-separated list of scopes that the user has authorized. This could be pruned by the user at the confirmation dialog.
- `action`: Optional. If provided, should be either `signup` or `signin`. Send to improve user experience, based on whether they clicked on a Sign In or Sign Up button.
- `email`: Optional. If provided, this email address will be pre-filled into the account form, but the user is free to change it.

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
- `response_type`: Optional. If supplied, must be either `code` or `token`. `code` is the default. `token` means the implicit grant is desired, and requires that the client have special permission to do so.
- `redirect_uri`: Optional. If supplied, a string URL of where to redirect afterwards. Must match URL from registration.
- `scope`: Optional. A string-separated list of scopes that the user has authorized. This could be pruned by the user at the confirmation dialog.

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

- `code`: A string that the client will trade with the [token][] endpoint. Codes have a configurable expiration value, default is 15 minutes.
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

After having received a [code][authorization], the client sends that code (most
likely a server-side request) to this endpoint, to receive a
longer-lived token that can be used to access attached services for a
particular user.

#### Request Parameters

- `client_id`: The id returned from client registration.
- `client_secret`: The secret returned from client registration.
- `code`: A string that was received from the [authorization][] endpoint.

**Example:**

```sh
curl -v \
-X POST \
-H "Content-Type: application/json" \
"https://oauth.accounts.firefox.com/v1/token" \
-d '{
  "client_id": "5901bd09376fadaa",
  "client_secret": "20c6882ef864d75ad1587c38f9d733c80751d2cbc8614e30202dc3d1d25301ff",
  "code": "4ab433e31ef3a7cf7c20590f047987922b5c9ceb1faff56f0f8164df053dd94c"
}'
```

#### Response

A valid request will return a JSON response with these properties:

- `access_token`: A string that can be used for authorized requests to service providers.
- `scope`: A string of space-separated permissions that this token has. May differ from requested scopes, since user can deny permissions.
- `token_type`: A string representing the token type. Currently will always be "bearer".

**Example:**

```json
{
  "access_token": "558f9980ad5a9c279beb52123653967342f702e84d3ab34c7f80427a6a37e2c0",
  "scope": "profile:email profile:avatar",
  "token_type": "bearer"
}
```

### POST /v1/destroy

After a client is done using a token, the responsible thing to do is to
destroy the token afterwards. A client can use this route to do so.

#### Request Parameters

- `token` - The hex string token.
- `client_secret` - The client secret used to get the token originally.

**Example:**

```sh
curl -v \
-X POST \
-H "Content-Type: application/json" \
"https://oauth.accounts.firefox.com/v1/destroy" \
-d '{
  "token": "558f9980ad5a9c279beb52123653967342f702e84d3ab34c7f80427a6a37e2c0",
  "client_secret": "20c6882ef864d75ad1587c38f9d733c80751d2cbc8614e30202dc3d1d25301ff"
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
- `scopes`: An array of scopes allowed for this token.

**Example:**

```json
{
  "user": "5901bd09376fadaa076afacef5251b6a",
  "scopes": ["profile:email", "profile:avatar"]
}
```

[client]: #get-v1clientid
[redirect]: #get-v1authorization
[authorization]: #post-v1authorization
[token]: #post-v1token
[delete]: #delete-v1destroy
[verify]: #post-v1verify
