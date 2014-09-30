# Firefox Accounts Customs Server API

# Overview

## Request Format

None of the requests are authenticated. The customs server is an
internal service that is running on the same machine as the service
that uses it (currently only the auth server) and is listening on
localhost.

## Response Format

All successful requests will produce a response with HTTP status code
of "200" and content-type of "application/json".  The structure of the
response body will depend on the endpoint in question.

Failures due to invalid behavior from the client will produce a
response with HTTP status code of "400" and content-type of
"application/json".  Failures due to an unexpected situation on the
server will produce a response with HTTP status code of "500" and
content-type of "application/json".

# API Endpoints

* [POST /blockEmail](#post-blockemail)
* [POST /blockIp](#post-blockip)
* [POST /check](#post-check)
* [POST /failedLoginAttempt](#post-failedloginattempt)
* [POST /passwordReset](#post-passwordreset)

## POST /blockEmail

*Not currently used by anyone.*

Used by internal services to temporarily ban requests associated with a given email address. These bans last for `config.limits.blockIntervalSeconds` (default: 24 hours).

___Parameters___

* email - the email address associated with the account to ban

### Request

```sh
curl -v \
-H "Content-Type: application/json" \
"http://127.0.0.1:7000/blockEmail" \
-d '{
  "email": "me@example.com"
}'
```

### Response

Successful requests will produce a "200 OK" response with an empty JSON object as the body.

```json
{
}
```

Failing requests may be due to the following errors:

* status code 400, code MissingParameters: email is required

## POST /blockIp

*Not currently used by anyone.*

Used by internal services to temporarily ban requests associated with a given IP address. These bans last for `config.limits.blockIntervalSeconds` (default: 24 hours).

___Parameters___

* ip - the IP address to ban

### Request

```sh
curl -v \
-H "Content-Type: application/json" \
"http://127.0.0.1:7000/blockIp" \
-d '{
  "ip": "192.0.2.1"
}'
```

### Response

Successful requests will produce a "200 OK" response with an empty JSON object as the body.

```json
{
}
```

Failing requests may be due to the following errors:

* status code 400, code MissingParameters: ip is required


## POST /check

Called by the auth server before performing an action on its end to
check whether or not the action should be blocked.

___Parameters___

* email - the email address associated with the account
* ip - the IP address where the request originates
* action - the name of the action under consideration

### Request

```sh
curl -v \
-H "Content-Type: application/json" \
"http://127.0.0.1:7000/check" \
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

* status code 400, code MissingParameters: email, ip and action are all required

## POST /failedLoginAttempt

Called by the auth server to signal to the customs server that a
failed login attempt has occured.

This information is stored by the customs server to enforce some of
its policies.

___Parameters___

* email - the email address associated with the account
* ip - the IP address where the request originates

### Request

```sh
curl -v \
-H "Content-Type: application/json" \
"http://127.0.0.1:7000/failedLoginAttempt" \
-d '{
  "email": "me@example.com",
  "ip": "192.0.2.1"
}'
```

### Response

Successful requests will produce a "200 OK" response with the lockout
advice in the JSON body:

```json
{
  "lockout": false
}
```

`lockout` indicates whether or not the account should be locked out.

Failing requests may be due to the following errors:

* status code 400, code MissingParameters: email and ip are both required

## POST /passwordReset

Called by the auth server to signal to the customs server that the
password on the account has been successfully reset.

The customs server uses this information to update its state (expiring
bad logins for example).

___Parameters___

* email - the email address associated with the account

### Request

```sh
curl -v \
-H "Content-Type: application/json" \
"http://127.0.0.1:7000/passwordReset" \
-d '{
  "email": "me@example.com"
}'
```

### Response

Successful requests will produce a "200 OK" response with an empty JSON object as the body.

```json
{
}
```

Failing requests may be due to the following errors:

* status code 400, code MissingParameters: email is required
