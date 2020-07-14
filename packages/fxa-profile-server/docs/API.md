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
- 400, 102: Unsupported image provider
- 400, 125: The request was blocked for security reasons
- 412, 106: Attempted to update non-null Ecosystem Anon ID
- 429, 114: Client has sent too many requests
- 500, 103: Image processing error
- 503, 104: OAuth service unavailable
- 503, 105: Auth service unavailable
- 500, 999: internal server error

## API Endpoints

- [GET /v1/profile][profile]
- [GET /v1/email][email]
- [GET /v1/subscriptions][subscriptions]
- [GET /v1/uid][uid]
- [GET /v1/avatar][avatar]
- [POST /v1/avatar/upload][upload]
- [DELETE /v1/avatar/:id][delete]
- [GET /v1/display_name][display_name]
- [POST /v1/display_name][display_name-post]
- [GET /v1/ecosystem_anon_id][ecosystem_anon_id]
- [POST /v1/ecosystem_anon_id][ecosystem_anon_id-post]
- [DELETE /v1/cache/:uid][cache_delete]

### GET /v1/profile

- scope: `profile`

Retrieves all properties of a profile that the caller has permission to read.

#### Request

```sh
curl -v \
-H "Authorization: Bearer 558f9980ad5a9c279beb52123653967342f702e84d3ab34c7f80427a6a37e2c0" \
"https://profile.accounts.firefox.com/v1/profile"
```

#### Response

```js
{
  "uid": "6d940dd41e636cc156074109b8092f96",
  "ecosystemAnonId": "eyJhbGciOiJFQ0RILUVTIiwia2lkIjoiMFZFRTdmT0txbFdHVGZrY0taRUJ2WWl3dkpMYTRUUGlJVGxXMGJOcDdqVSIsImVwayI6eyJrdHkiOiJFQyIsImNydiI6IlAtMjU2IiwieCI6InY3Q1FlRWtVQjMwUGwxV0tPMUZUZ25OQlNQdlFyNlh0UnZxT2kzSWdzNHciLCJ5IjoiNDBKVEpaQlMwOXpWNHpxb0hHZDI5NGFDeHRqcGU5a09reGhELVctUEZsSSJ9LCJlbmMiOiJBMjU2R0NNIn0.A_wzJya943vlHKFH.yq0JhkGZiZd6UiZK6goTcEf6i4gbbBeXxvq8QV5_nC4.Knl_sYSBrrP-aa54z6B6gA",
  "email": "user@example.domain",
  "locale": "en-US",
  "amrValues": ["pwd", "otp"],
  "twoFactorAuthentication": true,
  "displayName": "Max Power",
  "avatar": "https://firefoxusercontent.com/a9bff302615cd015692a099f691205cc",
  "avatarDefault": false,
  "subscriptions": ["foo", "bar", "baz"]
}
```

#### OpenID Connect UserInfo Endpoint

Per the [OpenID Connect Core
spec](http://openid.net/specs/openid-connect-core-1_0.html#UserInfo),
this endpoint also acts as the "UserInfo" endpoint. Any requests with a
token that include the `openid` scope will include the `sub` claim, an
alias to the `uid`.

Additional scopes supported for OpenID Connect:

- `email`

### GET /v1/email

- scope: `profile:email`

Retrieves the user's email address.

#### Request

```sh
curl -v \
-H "Authorization: Bearer 558f9980ad5a9c279beb52123653967342f702e84d3ab34c7f80427a6a37e2c0" \
"https://profile.accounts.firefox.com/v1/email"
```

#### Response

```json
{
  "email": "user@example.domain"
}
```

### GET /v1/subscriptions

- scope: `profile:email`

Retrieves subscription capabilities for the user

#### Request

```sh
curl -v \
-H "Authorization: Bearer 558f9980ad5a9c279beb52123653967342f702e84d3ab34c7f80427a6a37e2c0" \
"https://profile.accounts.firefox.com/v1/subscriptions"
```

#### Response

```json
{
  "subscriptions": ["foo", "bar", "baz"]
}
```

### GET /v1/uid

- scope: `profile:uid`

Retrieves a consistent, unique ID for this user.

#### Request

```sh
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

### GET /v1/avatar

- scope: `profile:avatar`

Returns details of the current user avatar, or an empty object if none.

An avatar `id` is a 32-length hexstring.

All avatars hosted by Firefox Accounts (see 3rd-party provider docs for
their equivalent) can be accessed as multiple sizes. The default size is
200x200 pixels. There is are small (100x100) and large (600x600)
variants, which can accessed by adding the `_small` or `_large` suffix
to the avatar URL.

#### Request

```sh
curl -v \
-H "Authorization: Bearer 558f9980ad5a9c279beb52123653967342f702e84d3ab34c7f80427a6a37e2c0" \
"https://profile.accounts.firefox.com/v1/avatar"
```

#### Response

```json
{
  "id": "a9bff302615cd015692a099f691205cc",
  "avatarDefault": false,
  "avatar": "https://firefoxusercontent.com/a9bff302615cd015692a099f691205cc"
}
```

#### Response (no avatar set)

```json
{
  "id": "00000000000000000000000000000000",
  "avatarDefault": true,
  "avatar": "https://firefoxusercontent.com/00000000000000000000000000000000"
}
```

### POST /v1/avatar/upload

- scope: `profile:avatar:write`

Upload image data as an avatar for the user.

#### Request

The binary data of the image should make up the post body, and the
headers `Content-Length` and `Content-Type` are required.

```sh
curl -v \
-X POST \
-H "Content-Type: image/png" \
-H "Authorization: Bearer 558f9980ad5a9c279beb52123653967342f702e84d3ab34c7f80427a6a37e2c0" \
--data-binary @image.png \
"https://profile.accounts.firefox.com/v1/avatar/upload"
```

#### Response

```json
{
  "url": "https://a.p.firefoxusercontent.net/a/81625c14128d46c2b600e74a017fa4a8"
}
```

### DELETE /v1/avatar/:id

- scope: `profile:avatar:write`

Delete an avatar from the user's profile.

#### Request

The `id` of an avatar can be received from [GET /v1/avatar][avatar].

```sh
curl -v \
-X DELETE \
"https://profile.accounts.firefox.com/v1/avatar/81625c14128d46c2b600e74a017fa4a8"
```

### GET /v1/display_name

- scope: `profile:display_name`

Get the user's display name.

#### Request

```sh
curl -v \
-H "Authorization: Bearer 558f9980ad5a9c279beb52123653967342f702e84d3ab34c7f80427a6a37e2c0" \
"https://profile.accounts.firefox.com/v1/display_name"
```

#### Response

```json
{
  "displayName": "Joe Cool"
}
```

Returns a `204 No Content` if the display name is not for the user.

### POST /v1/display_name

- scope: `profile:display_name:write`

Update the user's display name.

#### Request

- `displayName` - A new display name

```sh
curl -v \
-X POST \
-H "Content-Type: application/json" \
-H "Authorization: Bearer 558f9980ad5a9c279beb52123653967342f702e84d3ab34c7f80427a6a37e2c0" \
"https://profile.accounts.firefox.com/v1/display_name" \
-d '{
  "displayName": "Snoopy"
}'
```

#### Response

```json
{}
```

### GET /v1/ecosystem_anon_id

- scope: `profile:ecosystem_anon_id`

Get the user's anonymized ecosystem account identifier.

#### Request

```sh
curl -v \
-H "Authorization: Bearer 558f9980ad5a9c279beb52123653967342f702e84d3ab34c7f80427a6a37e2c0" \
"https://profile.accounts.firefox.com/v1/ecosystem_anon_id"
```

#### Response

```json
{
  "ecosystemAnonId": "eyJhbGciOiJFQ0RILUVTIiwia2lkIjoiMFZFRTdmT0txbFdHVGZrY0taRUJ2WWl3dkpMYTRUUGlJVGxXMGJOcDdqVSIsImVwayI6eyJrdHkiOiJFQyIsImNydiI6IlAtMjU2IiwieCI6InY3Q1FlRWtVQjMwUGwxV0tPMUZUZ25OQlNQdlFyNlh0UnZxT2kzSWdzNHciLCJ5IjoiNDBKVEpaQlMwOXpWNHpxb0hHZDI5NGFDeHRqcGU5a09reGhELVctUEZsSSJ9LCJlbmMiOiJBMjU2R0NNIn0.A_wzJya943vlHKFH.yq0JhkGZiZd6UiZK6goTcEf6i4gbbBeXxvq8QV5_nC4.Knl_sYSBrrP-aa54z6B6gA"
}
```

Returns a `204 No Content` if there is no ecosystem_anon_id for the user.

### POST /v1/ecosystem_anon_id

- scope: `profile:ecosystem_anon_id:write`

Update the user's anonymized ecosystem account identifier.

#### Request

- `ecosystemAnonId` - A new anonymized ecosystem account identifier.

```sh
curl -v \
-X POST \
-H "Content-Type: application/json" \
-H "Authorization: Bearer 558f9980ad5a9c279beb52123653967342f702e84d3ab34c7f80427a6a37e2c0" \
"https://profile.accounts.firefox.com/v1/ecosystem_anon_id" \
-d '{
  "ecosystemAnonId": "eyJhbGciOiJFQ0RILUVTIiwia2lkIjoiMFZFRTdmT0txbFdHVGZrY0taRUJ2WWl3dkpMYTRUUGlJVGxXMGJOcDdqVSIsImVwayI6eyJrdHkiOiJFQyIsImNydiI6IlAtMjU2IiwieCI6InY3Q1FlRWtVQjMwUGwxV0tPMUZUZ25OQlNQdlFyNlh0UnZxT2kzSWdzNHciLCJ5IjoiNDBKVEpaQlMwOXpWNHpxb0hHZDI5NGFDeHRqcGU5a09reGhELVctUEZsSSJ9LCJlbmMiOiJBMjU2R0NNIn0.A_wzJya943vlHKFH.yq0JhkGZiZd6UiZK6goTcEf6i4gbbBeXxvq8QV5_nC4.Knl_sYSBrrP-aa54z6B6gA"
}'
```

#### Response

```json
{}
```

### DELETE /v1/cache/:uid

Delete cached profile data for user `:uid`

- Requires header `Authorization: Bearer {secretBearerToken}` where `secretBearerToken` is found from server config

#### Response

```json
[]
```

[profile]: #get-v1profile
[email]: #get-v1email
[uid]: #get-v1uid
[avatar]: #get-v1avatar
[avatar-post]: #post-v1avatar
[upload]: #post-v1avatarupload
[delete]: #delete-v1avatarid
[display_name]: #get-v1display_name
[display_name-post]: #post-v1display_name
[ecosystem_anon_id]: #get-v1ecosystem_anon_id
[ecosystem_anon_id-post]: #post-v1ecosystem_anon_id
[oauth]: https://github.com/mozilla/fxa-oauth-server
[cache_delete]: #delete-v1cache:uid
