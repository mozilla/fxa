# Key Server API

For details of the client/server server protocol and how each parameter is derived see the
[design](https://wiki.mozilla.org/Identity/AttachedServices/KeyServerProtocol).

Our [SRP](http://en.wikipedia.org/wiki/Secure_Remote_Password_protocol#Protocol)
protocol order is slightly different from the sample on wikipedia, but the variables
are the same.

[Hawk](https://github.com/hueniverse/hawk) is used to authenticate requests marked :lock:.

# Request Format

All POST requests require a content-type of `application/json` with a JSON
encoded body. All keys and binary data are base16 encoded strings.

### Error Responses

All error responses include a JSON body in addition to the HTTP status code.
For example:

```js
{
  "code": 400, // matches the HTTP status code
  "error": 1234, // stable application level error type
  "message": "the value of salt is not allowed to be undefined",
  "info": "https://dev.picl.org/errors/1234" // link to more info on the error
}
```

# Endpoints

* Account
    * [POST /account/create](#post-accountcreate)
    * [GET  /account/devices :lock:(sessionToken)](#get-accountdevices)
    * [GET  /account/keys :lock:(keyFetchToken)](#get-accountkeys)
    * [POST /account/reset :lock:(accountResetToken)](#post-accountreset)
    * [POST /account/destroy :lock:(authToken)](#post-accountdestroy)

* Authentication
    * [POST /auth/start](#post-authstart)
    * [POST /auth/finish](#post-authfinsh)

* Session
    * [POST /session/create :lock:(authToken)](#post-sessioncreate)
    * [POST /session/destroy :lock:(sessionToken)](#post-sessiondestroy)

* Recovery Email
    * [GET  /recovery_email/status :lock:(sessionToken)](#get-recovery_emailstatus)
    * [POST /recovery_email/resend_code :lock:(sessionToken)](#post-recovery_emailresend_code)
    * [POST /recovery_email/verify_code](#post-recovery_emailverify_code)

* Certificate Signing
    * [POST /certificate/sign :lock:(sessionToken)](#post-certificatesign)

* Password
    * [POST /password/change/start :lock:(authToken)](#post-passwordchangestart)
    * [POST /password/forgot/send_code](#post-passwordforgotsend_code)
    * [POST /password/forgot/resend_code :lock:(forgotPasswordToken)](#post-passwordforgotresend_code)
    * [POST /password/forgot/verify_code :lock:(forgotPasswordToken)](#post-passwordforgotverify_code)

* Miscellaneous
    * [POST /get_random_bytes](#post-get_random_bytes)

A development server is available at http://idp.profileinthecloud.net for testing.
All data stored there will be deleted periodically, and new code will be deployed
regularly.

***The API is accessible over HTTP on the development server only.***
***Production servers will be HTTPS only***

## POST /account/create

Not HAWK authenticated.

Creates a user account. The client provides the email address with which this account will be labeled, the two salts, all the stretching parameters, and the resulting SRP verifier. Of these values, only the salts and the stretching parameters will be returned to the client when they next log in using `/auth/start`.

___Parameters___

* email - the primary email for this account
* mainKDFSalt - salt for main-KDF
* srpSalt - SRP salt
* srpVerifier - the derived SRP verifier
* params
    * srpParametersVersion: "1" (meaning SRP-6a, SHA256, with a specific 2048-bit group)
    * stretch
        * keyStretchingVersion: "1" (meaning PBKDF2/scrypt/PBKDF2)
        * PBKDF2_rounds_1: 20000
        * scrypt_N: 65536
        * scrypt_r: 8
        * scrypt_p: 1
        * PBKDF2_rounds_2: 20000

### Request
```sh
curl -v \
-X POST \
-H "Content-Type: application/json" \
http://idp.profileinthecloud.net/account/create \
-d '{
  "email": "me2@example.com",
  "mainKDFSalt: "996bc6b1aa63cd69856a2ec81cbf19d5c8a604713362df9ee15c2bf07128efab",
  "srpSalt: "f9fae9253549b2428a403d6fa51e6fb43d2f8a302e132cf902ffade52c02e6a4",
  "srpVerifier": "7597c55064c73bf1b2735878cb8711c289fc8f1cfb3d633a4593b36a8c51dbd68b27f649949de27d1dcccf7ece1e1a42c5c6bdc3d209cf13a3813d333bfcadd2641a9a3e2eb4289788ed8510cc8f2f1061789d58aef38b9d21b81831413f55473f9fae9253549b2428a403d6fa51e6fb43d2f8a302e132cf902ffade52c02e6a4e0bda74fcaa2347be4664f553d332df8166278c0e2f8663aa9238a2429631f7afd11622e193747b57975c51bbb69bb11f60c1a5ba449d3119e70d1ec580212151f79b26e73a57dba313376f0ba7a2afc232146a3b1d68b2d0afc35ebb8699cb10b3a3f8e0d51cefc7ac29212b238fb7a87f2f61edc9cbff103e386f778925fe",
  "params": {
    "srpParametersVersion": "1",
    "stretch": {
      "keyStretchingVersion": "1",
      "PBKDF2_rounds_1": 20000,
      "scrypt_N": 65536,
      "scrypt_r": 8,
      "scrypt_p": 1,
      "PBKDF2_rounds_2": 20000
    }
  }
}'
```

### Response

```json
{}
```

## GET /account/devices

:lock: HAWK-authenticated with sessionToken

Gets the collection of devices currently authenticated and syncing for the user.

This is intentionally vague for now, and will be figured out soon.

Devices describe themselves to the server with arguments to `/session/create`, which returns a distinct sessionToken for each one. This status API is expected to use that information.

___Headers___

The request must include a Hawk header that authenticates the request using a `sessionToken` received from `/session/create`.

### Request

```sh
curl -v \
-X GET \
-H "Host: idp.profileinthecloud.net" \
-H "Content-Type: application/json" \
-H 'Authorization: Hawk id="d4c5b1e3f5791ef83896c27519979b93a45e6d0da34c7509c5632ac35b28b48d", ts="1373391043", nonce="ohQjqb", mac="LAnpP3P2PXelC6hUoUaHP72nCqY5Iibaa3eeiGBqIIU="' \
http://idp.profileinthecloud.net/account/devices \
```

### Response

```json
{
  "devices": [
    {
      "id": "4c352927-cd4f-4a4a-a03d-7d1893d950b8",
      "type": "computer",
      "name": "Foxy's Macbook"
    }
  ]
}
```

## GET /account/keys

:lock: HAWK-authenticated with keyFetchToken

Get the base16 bundle of encrypted `kA|wrapKb`. The return value must be decrypted with a key derived from keyFetchToken, and then `wrapKb` must be further decrypted with a key derived from the user's password.

Since keyFetchToken is single-use, this can only be done once per session.

### Request

___Headers___

The request must include a HAWK header that authenticates the request using a `keyFetchToken` received from `/session/create`.

```sh
curl -v \
-X GET \
-H "Host: idp.profileinthecloud.net" \
-H "Content-Type: application/json" \
-H 'Authorization: Hawk id="d4c5b1e3f5791ef83896c27519979b93a45e6d0da34c7509c5632ac35b28b48d", ts="1373391043", nonce="ohQjqb", mac="LAnpP3P2PXelC6hUoUaHP72nCqY5Iibaa3eeiGBqIIU="' \
http://idp.profileinthecloud.net/account/keys \
```

### Response

```json
{
  "bundle": "d486e79c9f3214b0010fe31bfb50fa6c12e1d093f7770c81c6b1c19c7ee375a6558dd1ab38dbc5eba37bc3cfbd6ac040c0208a48ca4f777688a1017e98cedcc1c36ba9c4595088d28dcde5af04ae2215bce907aa6e74dd68481e3edc6315d47efa6c7b6536e8c0adff9ca426805e9479607b7c105050f1391dffed2a9826b8ad"
}
```

See [decrypting the bundle](https://wiki.mozilla.org/Identity/AttachedServices/KeyServerProtocol#Decrypting_the_getToken2_Response)
for info on how to extract `kA|wrapKb` from the bundle.

## POST /account/reset

:lock: HAWK-authenticated with accountResetToken

This resets the account password (by replacing the SRP verifier), and optionally resets the encrypted "wrap(kB)" value, both of which are delivered in an encrypted request body. It also updates several non-secret values: the SRP parameters, the two salts, and the key-stretching parameters.

See [resetting the account](https://wiki.mozilla.org/Identity/AttachedServices/KeyServerProtocol#Resetting_the_Account) for details of how the request body is encrypted.

### Request

___Parameters___

* bundle - a base16 string of encrypted (`wrapKb|verifier`)
* mainKDFSalt - main salt
* srpSalt - SRP salt
* params
    * srpParametersVersion: "1", meaning SRP-6a, SHA256, with a specific 2048-bit group
    * stretch
        * keyStretchingVersion: "1", meaning PBKDF2/scrypt/PBKDF2
        * PBKDF2_rounds_1: 20000
        * scrypt_N: 65536
        * scrypt_r: 8
        * scrypt_p: 1
        * PBKDF2_rounds_2: 20000


___Headers___

The request must include a HAWK header that authenticates the request (including payload) using a key derived from the `accountResetToken`, which is returned by `/password/change/start` or `/password/forgot/verify_code`.

```sh
curl -v \
-X POST \
-H "Host: idp.profileinthecloud.net" \
-H "Content-Type: application/json" \
-H 'Authorization: Hawk id="d4c5b1e3f5791ef83896c27519979b93a45e6d0da34c7509c5632ac35b28b48d", ts="1373391043", nonce="ohQjqb", hash="vBODPWhDhiRWM4tmI9qp+np+3aoqEFzdGuGk0h7bh9w=", mac="LAnpP3P2PXelC6hUoUaHP72nCqY5Iibaa3eeiGBqIIU="' \
http://idp.profileinthecloud.net/account/reset \
-d '{
  "bundle": "a586e79c9f3214b0010fe31bfb50fa6c12e1d093f7770c81c6b1c19c7ee375a6558dd1ab38dbc5eba37bc3cfbd6ac040c0208a48ca4f777688a1017e98cedcc1c36ba9c4595088d28dcde5af04ae2215bce907aa6e74dd68481e3edc6315d47efa6c7b6536e8c0adff9ca426805e9479607b7c105050f1391dffed2a98264bdc",
  "mainKDFSalt: "996bc6b1aa63cd69856a2ec81cbf19d5c8a604713362df9ee15c2bf07128efab",
  "srpSalt: "f9fae9253549b2428a403d6fa51e6fb43d2f8a302e132cf902ffade52c02e6a4",
  "params": {
    "srpParametersVersion": "1",
    "stretch": {
      "keyStretchingVersion": "1",
      "PBKDF2_rounds_1": 20000,
      "scrypt_N": 65536,
      "scrypt_r": 8,
      "scrypt_p": 1,
      "PBKDF2_rounds_2": 20000
    }
  }
}'
```

### Response

```json
{}
```

## POST /account/destroy

:lock: HAWK-authenticated with the authToken

This deletes the account completely. All stored data is erased. The client should seek user confirmation first. The client should also go to the storage servers and erase all stored data before deleting the account on the keyserver.

This request must be authenticated with the single-use authToken, to confirm that the password has been correctly entered recently.

### Request

___Parameters___

none

___Headers___

The request must include a HAWK header that authenticates the request (including payload) using the `authToken`, which is returned by `/auth/finish`.

```sh
curl -v \
-X POST \
-H "Host: idp.profileinthecloud.net" \
-H "Content-Type: application/json" \
-H 'Authorization: Hawk id="d4c5b1e3f5791ef83896c27519979b93a45e6d0da34c7509c5632ac35b28b48d", ts="1373391043", nonce="ohQjqb", hash="vBODPWhDhiRWM4tmI9qp+np+3aoqEFzdGuGk0h7bh9w=", mac="LAnpP3P2PXelC6hUoUaHP72nCqY5Iibaa3eeiGBqIIU="' \
http://idp.profileinthecloud.net/account/destroy \
-d ''
```

### Response

```json
{}
```

## POST /auth/start

Not HAWK authenticated.

Begin the login process. This is the first of two calls used to prove knowledge of the user's password. The two calls are tied together with the `srpToken`, which is returned from `/auth/start` and passed back to `/auth/finish`. This token is valid for a limited time (60 seconds).

The `start` call returns the salts and stretching parameters stored for the account. It also returns the SRP "B" message, which the client uses to compute its "A" response (which is submitted in `/auth/finish`).

___Parameters___

* email - user's email address

### Request
```sh
curl -v \
-X POST \
-H "Content-Type: application/json" \
http://idp.profileinthecloud.net/auth/start \
-d '{
  "email": "me@example.com"
}'
```

### Response

___Parameters___

* srpTokenLifetime: the srpToken will be valid for this many seconds
* main

```json
{
  "srpToken": "b223b00e-5a10-46a9-983c-1c346c0d1907",
  "srpTokenLifetime": 60,
  "mainKDFSalt": "996bc6b1aa63cd69856a2ec81cbf19d5c8a604713362df9ee15c2bf07128efab",
  "stretch": {
    "keyStretchingVersion": "1",
    "PBKDF2_rounds_1": 20000,
    "scrypt_N": 65536,
    "scrypt_r": 8,
    "scrypt_p": 1,
    "PBKDF2_rounds_2": 20000
  },
  "srpParametersVersion": "1",
  "srpSalt": "f9fae9253549b2428a403d6fa51e6fb43d2f8a302e132cf902ffade52c02e6a4",
  "srpB": "3cd467e3afd4cc2d7abd913e322d76c245c667e9dffc6e28a1108ac02c5af9eee1148a0c735f52ed786c33add4936dd5534326794e03d1b48b77b347c728740288adf488a9f4f11d75bb60e9bb1e975cccd128e28115178de01702fd2e8715e7c33b02c142569669bb52cf167092fa79c3c03c81affc5c8d97fd3cb8d12605e5dd59f75e21376cfdc6536125650ff8559f1c5319a9bfbb5191238c1570d41dc43e880d213fa06ff9d2f6ca7f31e05aef6236ae3657450250c06145a346151c54f227996532bbdc6e1531456174975eded5404baae081b3ce7b42646b98baec1029082823a041aaace4ffa362d5ed42a4e5088c496dda8ba2a35e804e89597313"
}
```

How to derive the values for the next step are explained in the
[SRP Client Calculation](https://wiki.mozilla.org/Identity/AttachedServices/KeyServerProtocol#SRP_Client_Calculation)

## POST /auth/finish

Not HAWK authenticated.

This completes the login process started in `/auth/start`. The client supplies its SRP "A" message and the SRP "M" verification message. If these are correct (indicating the user knew the account password), the server returns an encrypted bundle that will yield a single-use "authToken".

___Parameters___

* srpToken - the srpToken received from `/auth/start`
* A - the derived SRP "A" value
* M - the derived SRP "M" value

### Request
```sh
curl -v \
-X POST \
-H "Content-Type: application/json" \
http://idp.profileinthecloud.net/auth/finish \
-d '{
  "srpToken": "4c352927-cd4f-4a4a-a03d-7d1893d950b8",
  "A": "024ba1bb53d42918dc34131b41548843e1fa533bd5952be3ec8884fba4aa5c3542ac161fa0d5587d1e694248573be8a1b18f7b0c132f74ddde08ac2a230f4db4a1d831eb74ee772c83121ecba80e51b9293942681655dca4f98a766408fbaf5c13c09d21b9d6d3dabea8024fbb658ca67e20bc63cb349cb9bea54d7b1f4990cfe45fad7e492ca90a578d7b559143eb0987825b48aa6bfbb684b7973c75e6e98011ffc3ba724797ea575d440fa3c052be978590f828d3f850a4ccdecbe8e4d2c6d2b981e3c75ee26d5cf477cda9273a60000d6e942d4eb27e027a8ca16f668862260a4c9d3ab6cd3139decf4976633844684b8371a68a7419f6beffd2fc078327",
  "M": "396a46b1aa63cd69856a2ec81cbf19d5c8a60471cc62df9ee15c2bf07838efba"
}'
```

### Response

```json
{
  "bundle": "d486e79c9f3214b0010fe31bfb50fa6c12e1d093f7770c81c6b1c19c7ee375a6558dd1ab38dbc5eba37bc3cfbd6ac040c0208a48ca4f777688a1017e98cedcc1c36ba9c4595088d28dcde5af04ae2215bce907aa6e74dd68481e3edc6315d47efa6c7b6536e8c0adff9ca426805e9479607b7c105050f1391dffed2a9826b8ad"
}
```

See [decrypting the bundle](https://wiki.mozilla.org/Identity/AttachedServices/KeyServerProtocol#Decrypting_the_getToken2_Response)
for info on how to retrieve `authToken` from the bundle.


## POST /session/create

:lock: HAWK-authenticated with the authToken.

This is used when adding a new device, or when creating a new account (and then adding the first device). It consumes a single-use authToken, and returns a long-lived `sessionToken` and a single-use `keyFetchToken`.

### Request

```sh
curl -v \
-X POST \
-H "Host: idp.profileinthecloud.net" \
-H "Content-Type: application/json" \
-H 'Authorization: Hawk id="d4c5b1e3f5791ef83896c27519979b93a45e6d0da34c7509c5632ac35b28b48d", ts="1373391043", nonce="ohQjqb", mac="LAnpP3P2PXelC6hUoUaHP72nCqY5Iibaa3eeiGBqIIU="' \
http://idp.profileinthecloud.net/session/create \
```

### Response

```json
{
  "bundle": "d486e79c9f3214b0010fe31bfb50fa6c12e1d093f7770c81c6b1c19c7ee375a6558dd1ab38dbc5eba37bc3cfbd6ac040c0208a48ca4f777688a1017e98cedcc1c36ba9c4595088d28dcde5af04ae2215bce907aa6e74dd68481e3edc6315d47efa6c7b6536e8c0adff9ca426805e9479607b7c105050f1391dffed2a9826b8ad"
}
```

See [decrypting the bundle](https://wiki.mozilla.org/Identity/AttachedServices/KeyServerProtocol#???)
for info on how to retrieve `sessionToken` and `keyFetchToken` from the bundle.

## POST /session/destroy

:lock: HAWK-authenticated with the sessionToken.

Destroys this session, by invalidating the sessionToken. This is used when a device "signs-out", detaching itself from the PICL account. After calling this, the device must re-perform the `/auth/start` sequence to obtain a new sessionToken.

___Headers___

The request must include a Hawk header that authenticates the request using a `sessionToken` received from `/auth/finish`.

### Request
```sh
curl -v \
-X POST \
-H "Host: idp.profileinthecloud.net" \
-H "Content-Type: application/json" \
-H 'Authorization: Hawk id="d4c5b1e3f5791ef83896c27519979b93a45e6d0da34c7509c5632ac35b28b48d", ts="1373391043", nonce="ohQjqb", mac="LAnpP3P2PXelC6hUoUaHP72nCqY5Iibaa3eeiGBqIIU="' \
http://idp.profileinthecloud.net/session/destroy \
```

### Response

```json
{}
```


## GET /recovery_email/status

:lock: HAWK-authenticated with the sessionToken.

Returns the "verified" status for the account's recovery email address.

Currently, each account is associated with exactly one email address. This address must be "verified" before the account can be used (specifically, /certificate/sign and /account/keys will return errors until the address is verified). In the future, this may be expanded to include multiple addresses, and/or alternate types of recovery methods (e.g., SMS). A new API will be provided for this extra functionality.

This call is used to determine the current state (verified or unverified) of the recovery email address. During account creation, until the address is verified, the agent can poll this method to discover when it should proceed with /certificate/sign and /account/keys.

Rather than repeatedly polling, agents should use Server-Sent Events to effectively subscribe to hear about changes in this state. To use this, the GET request should include an `Accept: text/event-stream` header, which will trigger the server to provide an ongoing event stream instead of just a one-time response.

### Request

___Headers___

The request must include a Hawk header that authenticates the request using a `sessionToken` received from `/auth/finish`.

```sh
curl -v \
-X GET \
-H "Host: idp.profileinthecloud.net" \
-H "Content-Type: application/json" \
-H 'Authorization: Hawk id="d4c5b1e3f5791ef83896c27519979b93a45e6d0da34c7509c5632ac35b28b48d", ts="1373391043", nonce="ohQjqb", hash="vBODPWhDhiRWM4tmI9qp+np+3aoqEFzdGuGk0h7bh9w=", mac="LAnpP3P2PXelC6hUoUaHP72nCqY5Iibaa3eeiGBqIIU="' \
http://idp.profileinthecloud.net/recovery_email/status \
```

### Response

The response is a JSON body (with no newlines) that lists the email address and its verification status. When Server-Sent Events are used, the response is a series of lines, each of which contains the same JSON body as with the one-time GET.

```json
{ "email": "me@example.com", "verified": true }
```

## POST /recovery_email/resend_code

:lock: HAWK-authenticated with the sessionToken.

Re-sends a verification code to the account's recovery email address. The code is first sent when the account is created, but if the user thinks the message was lost or accidentally deleted, they can request a new message to be sent with this endpoint. The new message will contain the same code as the original message. When this code is provided to `/recovery_email/verify_code` (below), the email will be marked as "verified".

### Request

___Parameters___

none (an empty request body)

___Headers___

The request must include a Hawk header that authenticates the request (including payload) using a `sessionToken` received from `/auth/finish`.

```sh
curl -v \
-X POST \
-H "Host: idp.profileinthecloud.net" \
-H "Content-Type: application/json" \
-H 'Authorization: Hawk id="d4c5b1e3f5791ef83896c27519979b93a45e6d0da34c7509c5632ac35b28b48d", ts="1373391043", nonce="ohQjqb", hash="vBODPWhDhiRWM4tmI9qp+np+3aoqEFzdGuGk0h7bh9w=", mac="LAnpP3P2PXelC6hUoUaHP72nCqY5Iibaa3eeiGBqIIU="' \
http://idp.profileinthecloud.net/recovery_email/resend_code
```

### Response

```json
{}
```

## POST /recovery_email/verify_code

Not HAWK-authenticated.

Used to submit a verification code that was previously sent to a user's recovery email. If correct, the account's recovery email address will be marked as "verified".

The verification code will be a full-sized random token, delivered in the fragment portion of a URL sent to the user's email address. The URL will lead to a page that extracts the code from the URL fragment, and performs a POST to `/recovery_email/verify_code`. This endpoint should be CORS-enabled, to allow the linked page to be hosted on a different (static) domain. The link can be clicked from any browser, not just the one being attached to the PICL account.

### Request

___Parameters___

* uid - account identifier
* code - the verification code

```sh
curl -v \
-X POST \
-H "Host: idp.profileinthecloud.net" \
-H "Content-Type: application/json" \
http://idp.profileinthecloud.net/recovery_email/verify_code \
-d '{
  "uid": "4c352927-cd4f-4a4a-a03d-7d1893d950b8",
  "code": "e3c5b0e3f5391e134596c27519979b93a45e6d0da34c7509c5632ac35b28b48d"
}'
```

### Response

```json
{}
```

## POST /certificate/sign

:lock: HAWK-authenticated with the sessionToken.

Sign a BrowserID public key. The server is given a public key, and returns a signed certificate using the same JWT-like mechanism as a BrowserID primary IdP would (see the [browserid-certifier project](https://github.com/mozilla/browserid-certifier for details)). The signed certificate includes a `principal.email` property to indicate the PICL account's identifier (a uuid at a PICL-specific domain). The certificate is marked as being valid for a limited time period (TBD, but probably a few hours, maybe a day).

___Parameters___

* publicKey - the key to sign (run `bin/generate-keypair` from [jwcrypto](https://github.com/mozilla/jwcrypto))
    * algorithm - "RS" or "DS"
    * n - RS only
    * e - RS only
    * y - DS only
    * p - DS only
    * q - DS only
    * g - DS only
* duration - time interval from now when the certificate will expire in seconds

___Headers___

The request must include a Hawk header that authenticates the request (including payload) using a `sessionToken` received from `/session/create`.

### Request
```sh
curl -v \
-X POST \
-H "Host: idp.profileinthecloud.net" \
-H "Content-Type: application/json" \
-H 'Authorization: Hawk id="d4c5b1e3f5791ef83896c27519979b93a45e6d0da34c7509c5632ac35b28b48d", ts="1373391043", nonce="ohQjqb", hash="vBODPWhDhiRWM4tmI9qp+np+3aoqEFzdGuGk0h7bh9w=", mac="LAnpP3P2PXelC6hUoUaHP72nCqY5Iibaa3eeiGBqIIU="' \
http://idp.profileinthecloud.net/certificate/sign \
-d '{
  "publicKey": {
    "algorithm":"RS",
    "n":"4759385967235610503571494339196749614544606692567785790953934768202714280652973091341316862993582789079872007974809511698859885077002492642203267408776123",
    "e":"65537"
  },
  "duration": 86400000
}'
```

### Response

```json
{
  "cert": "eyJhbGciOiJEUzI1NiJ9.eyJwdWJsaWMta2V5Ijp7ImFsZ29yaXRobSI6IlJTIiwibiI6IjU3NjE1NTUwOTM3NjU1NDk2MDk4MjAyMjM2MDYyOTA3Mzg5ODMyMzI0MjUyMDY2Mzc4OTA0ODUyNDgyMjUzODg1MTA3MzQzMTY5MzI2OTEyNDkxNjY5NjQxNTQ3NzQ1OTM3NzAxNzYzMTk1NzQ3NDI1NTEyNjU5NjM2MDgwMzYzNjE3MTc1MzMzNjY5MzEyNTA2OTk1MzMyNDMiLCJlIjoiNjU1MzcifSwicHJpbmNpcGFsIjp7ImVtYWlsIjoiZm9vQGV4YW1wbGUuY29tIn0sImlhdCI6MTM3MzM5MjE4OTA5MywiZXhwIjoxMzczMzkyMjM5MDkzLCJpc3MiOiIxMjcuMC4wLjE6OTAwMCJ9.l5I6WSjsDIwCKIz_9d3juwHGlzVcvI90T2lv2maDlr8bvtMglUKFFWlN_JEzNyPBcMDrvNmu5hnhyN7vtwLu3Q"
}
```

## POST /password/change/start

:lock: HAWK-authenticated with the authToken.

Begin the "change password" process. This consumes a single-use `authToken`, which indicates that the user recently proved knowledge of the account password. It returns a single-use `accountResetToken`, which will be delivered to `/account/reset`. It also returns a single-use `keyFetchToken`.

The indirect "`authToken` -> `accountResetToken` -> reset" sequence is used because it lines up with the similar "`/password/forgot/send_code` -> `/password/forgot/verify_code` -> `accountResetToken` -> reset" sequence.

This API returns an encrypted bundle, from which `accountResetToken` and `keyFetchToken` can be extracted.


___Headers___

The request must include a HAWK header that authenticates the request using a `authToken` received from `/auth/finish`.

### Request
```sh
curl -v \
-X POST \
-H "Content-Type: application/json" \
-H 'Authorization: Hawk id="d4c5b1e3f5791ef83896c27519979b93a45e6d0da34c7509c5632ac35b28b48d", ts="1373391043", nonce="ohQjqb", mac="LAnpP3P2PXelC6hUoUaHP72nCqY5Iibaa3eeiGBqIIU="' \
http://idp.profileinthecloud.net/password/change/start
```

### Response

```json
{
  "bundle": "d486e79c9f3214b0010fe31bfb50fa6c12e1d093f7770c81c6b1c19c7ee375a6558dd1ab38dbc5eba37bc3cfbd6ac040c0208a48ca4f777688a1017e98cedcc1c36ba9c4595088d28dcde5af04ae2215bce907aa6e74dd68481e3edc6315d47efa6c7b6536e8c0adff9ca426805e9479607b7c105050f1391dffed2a9826b8ad"
}
```

See [decrypting the bundle](https://wiki.mozilla.org/Identity/AttachedServices/KeyServerProtocol#Decrypting_the_getToken2_Response)
for info on how to retrieve `accountResetToken` and `keyFetchToken` from the bundle.

## POST /password/forgot/send_code

Not HAWK-authenticated.

This requests a "reset password" code to be sent to the user's recovery email. The user should type this code into the agent, which will then submit it to `/password/forgot/verify_code` (described below). `verify_code` will then return a `passwordResetToken`, which can be used to reset the account password.

This code will be either 8 or 16 digits long, and the `send_code` response indicates the code length (so the UI can display a suitable input form). The email will either contain the code itself, or will contain a link to a web page which will display the code.

The `send_code` response includes a `forgotPasswordToken`, which must be submitted with the code to `/password/forgot/verify_code` later.

The response also specifies the lifetime of this token, and a limit on the number of times `verify_code` can be called with this token. By limiting the number of submission attempts, we also limit an attacker's ability to guess the code. After the token expires, or the maximum number of submissions have happened, the agent must use `send_code` again to generate a new code and token.

Each account can have at most one `forgotPasswordToken` valid at a time. Calling `send_code` causes any existing tokens to be cancelled and a new one created. Each token is associated with a specific code, so `send_code` also invalidates any existing codes.

___Parameters___

* email - the recovery email for this account

### Request
```sh
curl -v \
-X POST \
-H "Content-Type: application/json" \
http://idp.profileinthecloud.net/password/forgot/send_code \
-d '{
  "email": "me@example.com"
}'
```

### Response

```json
{
  "forgotPasswordToken": "b223b00e-5a10-46a9-983c-1c346c0d1907",
  "forgotPasswordTokenLifetime": 900,
  "codeLength": 8,
  "remainingAttempts": 3
}
```

## POST /password/forgot/resend_code

:lock: HAWK-authenticated with the forgotPasswordToken.

While the agent is waiting for the user to paste in the forgot-password code, if the user believes the email has been lost or accidentally deleted, the `/password/forgot/resend_code` API can be used to send a new copy of the same code.

This API requires the `forgotPasswordToken` returned by the original `send_code` call (only the original browser which started the process may request a replacement message). It will return the same response as `send_code` did, except with a shorter `forgotPasswordTokenLifetime` indicating the remaining validity period. If `verify_code` has been called some number of times with the same token, then `remainingAttempts` will be smaller too.

___Parameters___

* email - the recovery email for this account
* forgotPasswordToken - the token originally returned by `/password/forgot/send_code`

### Request
```sh
curl -v \
-X POST \
-H "Content-Type: application/json" \
http://idp.profileinthecloud.net/password/forgot/send_code \
-d '{
  "email": "me@example.com",
  "forgotPasswordToken": "b223b00e-5a10-46a9-983c-1c346c0d1907",
}'
```

### Response

```json
{
  "forgotPasswordToken": "b223b00e-5a10-46a9-983c-1c346c0d1907",
  "forgotPasswordTokenLifetime": 550,
  "codeLength": 8,
  "remainingAttempts": 2
}
```

## POST /password/forgot/verify_code

:lock: HAWK-authenticated with the forgotPasswordToken.

Once the code created by `/password/forgot/send_code` is emailed to the user, and they paste it into their browser, the browser agent should deliver it to this `/verify_code` endpoint (along with the `forgotPasswordToken`). This will cause the server to allocate and return an `accountResetToken`, which can be used to reset the account password (srpVerifier and wrap(kB)) with the `/account/reset` API (described above).

(a future version of this API may replace `/verify_code` with a pair of SRP `start` and `finish` methods, just like `/auth/start` and `/auth/finish`)

___Parameters___

* code - the code sent to the user's recovery method
* forgotPasswordToken - the `forgotPasswordToken` return by `/password/forgot/send_code`.

### Request
```sh
curl -v \
-X POST \
-H "Content-Type: application/json" \
http://idp.profileinthecloud.net/password/forgot/verify_code \
-d '{
  "code": "12345678",
  "forgotPasswordToken": "b223b00e-5a10-46a9-983c-1c346c0d1907"
}'
```

### Response

```json
{
  "accountResetToken": "cd24b20f-1b14-46a9-383c-0d344c0d1907"
}
```

## POST /get_random_bytes

Not HAWK-authenticated.

Get 32 bytes of random data. Useful to merge into locally-sourced entropy for creating salts and SRP messages.

### Request
```sh
curl -X POST -v http://idp.profileinthecloud.net/get_random_bytes
```

### Response

```json
{
  "data": "ac55c0520f2edfb026761443da0ab27b1fa18c98912af6291714e9600aa34991"
}
```

# Example flows

## Create account

* `POST /get_random_bytes`
* `POST /account/create`
* `POST /auth/start`
* `POST /auth/finish`
* `POST /session/create`
* `GET /recovery_email/status`
* `POST /recovery_email/verify_code`
* `GET /account/keys`
* `POST /certificate/sign`

## Attach a new device

* `POST /auth/start`
* `POST /auth/finish`
* `POST /session/create`
* `GET /account/keys`
* `POST /certificate/sign`

## Forgot password

* `POST /password/forgot/send_code`
* `POST /password/forgot/verify_code`
* `POST /account/reset`
* GOTO "Attach a new device"

## Change password

* start with active session (and keys)
* `POST /auth/start`
* `POST /auth/finish`
* `POST /password/change/start`
* `GET /account/keys`
* `POST /account/reset`
* GOTO "Attach a new device"

# Reference Client

The [git repo](https://github.com/mozilla/picl-idp) contains a reference implementation
of the client side of the protocol in [/client/index.js](/client/index.js) with
sample usage in [/client/example.js](/client/example.js)
