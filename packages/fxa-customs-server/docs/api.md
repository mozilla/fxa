# Firefox Accounts Customs Server API

# Overview

## Request Format

None of the requests are authenticated. The customs server is an
internal service that is running on the same machine as the service
that uses it (currently only the auth server) and is listening on
localhost.

## Response Format

All successful requests will produce a response with HTTP status code
of "200" and content-type of "application/json". The structure of the
response body will depend on the endpoint in question.

Failures due to invalid behavior from the client will produce a
response with HTTP status code of "400" and content-type of
"application/json". Failures due to an unexpected situation on the
server will produce a response with HTTP status code of "500" and
content-type of "application/json".

# API Endpoints

- [POST /blockEmail](#post-blockemail)
- [POST /blockIp](#post-blockip)
- [POST /check](#post-check)
- [POST /checkAuthenticated](#post-checkauthenticated)
- [POST /checkIpOnly](#post-checkiponly)
- [POST /failedLoginAttempt](#post-failedloginattempt)
- [POST /passwordReset](#post-passwordreset)

## POST /blockEmail

_Not currently used by anyone._

Used by internal services to temporarily ban requests associated with a given email address. These bans last for `config.limits.blockIntervalSeconds` (default: 24 hours).

**_Parameters_**

- email - the email address associated with the account to ban

### Request

```sh
curl -v \
-H "Content-Type: application/json" \
"http://localhost:7000/blockEmail" \
-d '{
  "email": "me@example.com"
}'
```

### Response

Successful requests will produce a "200 OK" response with an empty JSON object as the body.

```json
{}
```

Failing requests may be due to the following errors:

- status code 400, code MissingParameters: email is required

## POST /blockIp

_Not currently used by anyone._

Used by internal services to temporarily ban requests associated with a given IP address. These bans last for `config.limits.blockIntervalSeconds` (default: 24 hours).

**_Parameters_**

- ip - the IP address to ban

### Request

```sh
curl -v \
-H "Content-Type: application/json" \
"http://localhost:7000/blockIp" \
-d '{
  "ip": "192.0.2.1"
}'
```

### Response

Successful requests will produce a "200 OK" response with an empty JSON object as the body.

```json
{}
```

Failing requests may be due to the following errors:

- status code 400, code MissingParameters: ip is required

## POST /check

Called by the auth server before performing an action on its end to
check whether or not the action should be blocked. The endpoint is
capable of rate-limiting and blocking requests that involve a variety
of [actions](https://github.com/mozilla/fxa-customs-server/blob/master/lib/actions.js).

**_Parameters_**

- email - the email address associated with the account
- ip - the IP address where the request originates
- action - the name of the action under consideration
- headers - the forwarded headers of the original request
- payload - the payload of the original request
- phoneNumber - optional phone number of request

### Request

```sh
curl -v \
-H "Content-Type: application/json" \
"http://localhost:7000/check" \
-d '{
  "email": "me@example.com",
  "ip": "192.0.2.1",
  "action": "accountCreate"
}'
```

### Response

Successful requests will produce a "200 OK" response with the blocking
advice in the JSON body:

```json
{
  "block": true,
  "retryAfter": 86396
}
```

`block` indicates whether or not the action should be blocked and
`retryAfter` tells the client how long it should wait (in seconds)
before attempting this action again.

Failing requests may be due to the following errors:

- status code 400, code MissingParameters: email, ip and action are all required

## POST /checkIpOnly

Like [/check](#post-check), called by the auth server before
performing an action on its end to check whether or not the action
should be blocked based only on the request IP.

**_Parameters_**

- ip - the IP address where the request originates
- action - the name of the action under consideration

### Request

```sh
curl -v \
-H "Content-Type: application/json" \
"http://localhost:7000/checkIpOnly" \
-d '{
  "ip": "192.0.2.1",
  "action": "accountCreate"
}'
```

### Response

Successful requests will produce a "200 OK" response with the blocking advice in the JSON body:

```json
{
  "block": true,
  "retryAfter": 86396
}
```

`block` indicates whether or not the action should be blocked and
`retryAfter` tells the client how long it should wait (in seconds)
before attempting this action again.

Failing requests may be due to the following errors:

- status code 400, code MissingParameters: ip and action are both required

## POST /checkAuthenticated

Called by the auth server before performing an authenticated action to
check whether or not the action should be blocked.

**_Parameters_**

- action - the name of the action under consideration
- ip - the IP address where the request originates
- uid - account identifier

### Request

```sh
curl -v \
-H "Content-Type: application/json" \
"http://localhost:7000/checkAuthenticated" \
-d '{
  "action": "devicesNotify"
  "ip": "192.0.2.1",
  "uid": "0b65dd742b5a415487f2108cca597044",
}'
```

### Response

Successful requests will produce a "200 OK" response with the blocking
advice in the JSON body:

```json
{
  "block": true,
  "retryAfter": 86396
}
```

`block` indicates whether or not the action should be blocked and
`retryAfter` tells the client how long it should wait (in seconds)
before attempting this action again.

Failing requests may be due to the following errors:

- status code 400, code MissingParameters: action, ip and uid are all required

## POST /failedLoginAttempt

Called by the auth server to signal to the customs server that a
failed login attempt has occured.

This information is stored by the customs server to enforce some of
its policies.

**_Parameters_**

- email - the email address associated with the account
- ip - the IP address where the request originates

### Request

```sh
curl -v \
-H "Content-Type: application/json" \
"http://localhost:7000/failedLoginAttempt" \
-d '{
  "email": "me@example.com",
  "ip": "192.0.2.1"
}'
```

### Response

Successful requests will produce a "200 OK" response:

```json
{}
```

`lockout` indicates whether or not the account should be locked out.

Failing requests may be due to the following errors:

- status code 400, code MissingParameters: email and ip are both required

## POST /passwordReset

Called by the auth server to signal to the customs server that the
password on the account has been successfully reset.

The customs server uses this information to update its state (expiring
bad logins for example).

**_Parameters_**

- email - the email address associated with the account

### Request

```sh
curl -v \
-H "Content-Type: application/json" \
"http://localhost:7000/passwordReset" \
-d '{
  "email": "me@example.com"
}'
```

### Response

Successful requests will produce a "200 OK" response with an empty JSON object as the body.

```json
{}
```

Failing requests may be due to the following errors:

- status code 400, code MissingParameters: email is required
