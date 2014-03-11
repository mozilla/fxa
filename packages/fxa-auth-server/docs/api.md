# Firefox Accounts OAuth Server API

## Overview

### URL Structure

```
https://<server-url>/oauth/<api-endpoint>
```

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

- [GET /oauth/authorization][authorization]
- [POST /oauth/token][token]

### GET /oauth/authorization

#### Request Parameters

- `client_id`: The id returned from client registration.
- `assertion`: A FxA assertion for the signed-in user.
- `redirect_uri`: Optional. If supplied, a string URL of where to redirect afterwards. Must match URL from registration.
- `scope`: Optional. A string-separated list of scopes that the user has authorized. This could be pruned by the user at the confirmation dialog.
- `state`: Optional. If supplied, will be returned to the client as-is upon redirection, so that clients can verify the redirect is authentic.

#### Response

A valid request will cause a 302 redirect to the `redirect_uri`, with the following query parameters included:

- `code`: A string that the client will trade with the [token][] endpoint. Codes have a configurable expiration value, default is 15 minutes.
- `state`: Optional. If supplied above, will be the same value.

Example:

```
https://example.domain/path?foo=bar&code=asdfqwerty&state=zxcvasdf
```

### POST /oauth/token

#### Request Parameters

- `client_id`: The id returned from client registration.
- `client_secret`: The secret returned from client registration.
- `code`: A string that was received from the [authorization][] endpoint.

#### Response

A valid request will return a JSON response with these properties:

- `access_token`: A string that can be used for authorized requests to service providers.
- `scopes`: An array of scopes that this token has permission for. May differ from requested scopes, since user can deny permissions.
- `token_type`: A string representing the token type. Currently will always be "bearer".

Example:

```js
{
  "access_token": "558f9980ad5a9c279beb52123653967342f702e84d3ab34c7f80427a6a37e2c0",
  "scopes": [],
  "token_type": "bearer"
}
```

[authorization]: #get-oauthauthorization
[token]: #post-oauthtoken
