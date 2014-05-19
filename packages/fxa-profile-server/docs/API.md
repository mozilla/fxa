# Firefox Accounts Profile Server API

## Overview

### URL Structure

```
https://<server-url>/v1/<api-endpoint>
```

Note that:

- All API access must be over HTTPS
- The URL embeds a version identifier "v1"; future revisions of this API may introduce new version numbers.
- The base URL of the server may be configured on a per-client basis

### Authorization

Most endpoints that return user data require authorization from the [OAuth][] server. After a bearer token is received for the user, you can pass it to these endpoints as a header:

```
Authorization: Bearer 558f9980ad5a9c279beb52123653967342f702e84d3ab34c7f80427a6a37e2c0
```

Some endpoints may require certain scopes as well; these will be listed in each endpoint. The general scope `profile` automatically has all scopes for this server.

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
- 403, 100: Unauthorized
- 400, 101: Invalid request parameter
- 500, 999: internal server error

## API Endpoints


- [GET /v1/profile][profile]
- [GET /v1/email][email]
- [GET /v1/uid][uid]

### GET /v1/profile

- scope: `profile`

Retrieves all properties of a profile.

#### Request

```
curl -v \
-H "Authorization: Bearer 558f9980ad5a9c279beb52123653967342f702e84d3ab34c7f80427a6a37e2c0" \
"https://profile.accounts.firefox.com/v1/profile"
```

#### Response

```js
{
  "uid": "6d940dd41e636cc156074109b8092f96",
  "email": "user@example.domain"
}
```

### GET /v1/email

- scope: `profile:email`

Retrieves the user's email address.

#### Request

```
curl -v \
-H "Authorization: Bearer 558f9980ad5a9c279beb52123653967342f702e84d3ab34c7f80427a6a37e2c0" \
"https://profile.accounts.firefox.com/v1/email"
```

#### Response

```js
{
  "email": "user@example.domain"
}
```

### GET /v1/uid

- scope: `profile:uid`

Retrieves a consistent, unique ID for this user.

#### Request

```
curl -v \
-H "Authorization: Bearer 558f9980ad5a9c279beb52123653967342f702e84d3ab34c7f80427a6a37e2c0" \
"https://profile.accounts.firefox.com/v1/uid"
```

#### Response

```js
{
  "uid": "6d940dd41e636cc156074109b8092f96"
}
```

[profile]: #get-v1profile
[email]: #get-v1email
[uid]: #get-v1uid

[OAuth]: https://github.com/mozilla/fxa-oauth-server
