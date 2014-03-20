# Firefox Accounts OAuth Server API

## Overview

### URL Structure

```
https://<server-url>/v1/<api-endpoint>
```

Note that:

- All API access must be over HTTPS
- The URL embeds a version identifier "v1"; future revisions of this API may introduce new version numbers.
- The base URL of the server may be configured on a per-client basis

### Errors

Invalid requests will return 4XX responses. Internal failures will return 5XX. Both will include JSON responses describing the error.

Example error:

```js
{
  "code": 400, // matches the HTTP status code
  "errno": 101, // stable application-level error number
  "error": "Bad Request", // string description of error type
  "message": "Unknown client"
}
```

The currently-defined error responses are:

- status code, errno: description
- 400, 101: unknown client id
- 400, 102: incorrect client secret
- 400, 103: redirect_uri doesn't match registered value
- 400, 104: invalid fxa assertion 
- 400, 105: unknown code
- 400, 106: incorrect code
- 400, 107: expired code
- 400, 108: invalid request parameter
- 500, 999: internal server error

## API Endpoints

- [POST /v1/authorization][authorization]
- [POST /v1/token][token]

### POST /v1/authorization

This endpoint should be used by the fxa-content-server, requesting that
we supply a short-lived code (currently 15 minutes) that will be sent
back to the client. This code will be traded for a token at the
[token][] endpoint.

#### Request Parameters

- `client_id`: The id returned from client registration.
- `assertion`: A FxA assertion for the signed-in user.
- `state`: A value that will be returned to the client as-is upon redirection, so that clients can verify the redirect is authentic.
- `redirect_uri`: Optional. If supplied, a string URL of where to redirect afterwards. Must match URL from registration.
- `scope`: Optional. A string-separated list of scopes that the user has authorized. This could be pruned by the user at the confirmation dialog.

#### Response

A valid request will cause a 302 redirect to the `redirect_uri`, with the following query parameters included:

- `code`: A string that the client will trade with the [token][] endpoint. Codes have a configurable expiration value, default is 15 minutes.
- `state`: The same value as was passed as a request parameter.

Example:

```
https://example.domain/path?foo=bar&code=asdfqwerty&state=zxcvasdf
```

### POST /v1/token

After having received a [code][], the client sends that code (most
likely a server-side request) to this endpoint, to receive a
longer-lived token that can be used to access attached services for a
particular user.

#### Request Parameters

- `client_id`: The id returned from client registration.
- `client_secret`: The secret returned from client registration.
- `code`: A string that was received from the [authorization][] endpoint.

#### Response

A valid request will return a JSON response with these properties:

- `access_token`: A string that can be used for authorized requests to service providers.
- `scope`: A string of space-separated permissions that this token has. May differ from requested scopes, since user can deny permissions.
- `token_type`: A string representing the token type. Currently will always be "bearer".

Example:

```js
{
  "access_token": "558f9980ad5a9c279beb52123653967342f702e84d3ab34c7f80427a6a37e2c0",
  "scopes": [],
  "token_type": "bearer"
}
```

[authorization]: #post-v1authorization
[token]: #post-v1token
