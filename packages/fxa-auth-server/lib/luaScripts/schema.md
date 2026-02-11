# Schema for data stored in Redis

We currently store three different types of data in redis:

- high-churn sessionToken metadata
- short-lived OAuth access tokens
- high-churn refreshToken metadata

Each type of data is stored under a different (and configurable) key prefix
to avoid collisions.

## Session Token Metadata

Most sessionToken data is stored in MySQL and is updated rarely, but a small
number of fields may change much more often. Writes to these fields are sent
to redis because it's better able to cope with the write load, and there are
no significant consequences to losing the data.

The data is stored as a single record per user, using their `uid` as the key.
The value is a JSON object whose keys are the ids of session tokens belonging
to that user, and whose corresponding values are the metadata for that token.
The metadata is a JSON **_list_** where each item corresponds to a particular
field of the session token.

For example, if a user has a single session token with the following metadata:

- `id`: "000111222333444555666777888999"
- `lastAccessTime`: 1583392038878
- `location`:
  - city: undefined,
  - state: undefined
  - stateCode: undefined,
  - country: "Australia"
  - countryCode: "AU"
- uaBrowser: undefined,
- uaBrowserVersion: undefined,
- uaOS: "Windows",
- uaOSVersion: 10,
- uaDeviceType: undefined,
- uaFormFactor: undefined

Then this would be stored in redis as a string value as follows:

- Key: `000111222333444555666777888999`
- Value: `[1583392038878,[,,,"Australia","AU"],,,"Windows",10,,]`

This scheme is designed to minimize storage space by not encoding field names,
but leads to some complexity when encoding and decoding.

There is also a legacy format where the value is a straightforward JSON object
with named fields.

## OAuth Access Tokens

OAuth access tokens are created frequently and are short-lived, making them
suitable for storage in redis.

The data for each access token is stored as an individual record with a TTL,
using the `tokenId` as the key and a JSON serialization of the token data
as the value.

In order to allow easy enumeration of the access tokens belonging to a given
user, we also maintain a separate record for each user. This record is a redis
set type whose key is the `uid` and whose members as the `tokenId`s of all
acesss tokens belonging to that user.

For example, if a user has a single access token with the following metadata:

- `tokenId`: "000111222333444555666777888999"
- `clientId`: "ABCDEF123456"
- `clientName`: "Example Client"
- `clientCanGrant`: false
- `publicClient`: false
- `userId`: "AAABBBCCCDDDEEEFFF999888777666"
- `email`: "user@example.com"
- `scope`: "profile",
- `createdAt`: 1583392038878
- `profileChangedAt`: 0,
- `expiresAt`: 1583392056878

Then there would be two records in redis as follows:

- Key: `000111222333444555666777888999`
- Value:
  ```
  {
    "tokenId": "000111222333444555666777888999"
    "clientId": "ABCDEF123456"
    "name": "Example Client"
    "canGrant": false
    "publicClient": false
    "userId": "AAABBBCCCDDDEEEFFF999888777666"
    "email": "user@example.com"
    "scope": "profile",
    "createdAt": 1583392038878
    "profileChangedAt": 0,
    "expiresAt": 1583392056878
  }
  ```
- Key: `AAABBBCCCDDDEEEFFF999888777666`
- Set Members: `[000111222333444555666777888999]`

## Refresh Token Metadata

Most refreshToken data is stored in MySQL and is updated rarely, but the `lastUsedAt`
field may change much more frequently. Writes to this field are sent to redis
because it's better able to cope with the write load, and there are no significant
consequences to losing the data.

The data is stored as a single record per user, using their `uid` as the key.
The record is a redis hash type whose fields are the `tokenId`s of refresh tokens
held by that user, and whose corresponding values are JSON objects with metadata
for that token.

These records are short lived and intended for high frequency updates. For longer
duration data prefer MySQL. For example `lastUsedAt` is written to MySQL once
per day but updated in redis on every access. This provides high precision
for active tokens and more efficiency as tokens get older.

For example, if a user has a single refresh token with the following metadata:

- `tokenId`: "000111222333444555666777888999"
- `userId`: "AAABBBCCCDDDEEEFFF999888777666"
- `lastUsedAt`: 1583392038878

Then this would be stored in redis as a hash record with one field as follows:

- Key: `AAABBBCCCDDDEEEFFF999888777666`
- Hash Fields:
  - Field: `000111222333444555666777888999`
  - Value: `{"lastUsedAt": 1583392038878}`
