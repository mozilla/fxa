# Key Server API

For details of the client/server server protocol and how each parameter is derived see the
[design](https://wiki.mozilla.org/Identity/AttachedServices/KeyServerProtocol).

Our [SRP](http://en.wikipedia.org/wiki/Secure_Remote_Password_protocol#Protocol)
protocol order is slightly different from the sample on wikipedia, but the variables
are the same.

[Hawk](https://github.com/hueniverse/hawk) is used to authenticate requests marked 🔒.

# Request Format

All POST requests require a content-type of `application/json` with a JSON
encoded body. All keys and binary data are base16 encoded strings.

### Error Responses

All error responses include a JSON body in addition to the HTTP status code.
For example:

```js
{
  status: 400,  // matches the HTTP status code
  errors: [
    {
      code: 1234,  // stable application level code
      message: "The value of salt is not allowed to be undefined", // dev message
      info: "https://dev.picl.org/errors/1234" // link to more info on the error
      // additional error specific properties allowed
    }
  ]
}
```

# Endpoints

* Account
    * [/account/create](#post-accountcreate)
    * [/account/devices 🔒](#get-accountdevices-)
    * [/account/keys 🔒](#get-accountkeys-)
    * [/account/recovery_methods 🔒](#get-accountrecovery_methods-)
    * [/account/recovery_methods/send_code 🔒](#post-accountrecovery_methodssend_code-)
    * [/account/recovery_methods/verify_code](#post-accountrecovery_methodsverify_code)
    * [/account/reset 🔒](#post-accountreset-)

* [/certificate/sign 🔒](#post-certificatesign-)

* [/get_random_bytes](#post-get_random_bytes)

* Password
    * [/password/change/auth/start 🔒](#post-passwordchangeauthstart-)
    * [/password/change/auth/finish](#post-passwordchangeauthfinish)
    * [/password/forgot/send_code](#post-passwordforgotsend_code)
    * [/password/forgot/verify_code](#post-passwordforgotverify_code)

* Session
    * [/session/auth/start](#post-sessionauthstart)
    * [/session/auth/finish](#post-sessionauthfinish)
    * [/session/status 🔒](#get-sessionstatus-)
    * [/session/destroy 🔒](#post-sessiondestroy-)

A development server is available at http://idp.profileinthecloud.net for testing.
All data stored there will be deleted periodically, and new code will be deployed
regularly.

***The API is accessible over HTTP on the development server only.***
***Production servers will be HTTPS only***

## POST /account/create

Creates a user account.

___Parameters___

* email - the primary email for this account
* verifier - the derived SRP verifier
* salt - SPR salt
* params
    * srp
        * alg - hash function for SRP (sha256)
        * N_bits - SPR group bits (2048)
    * stretch
        * rounds - number of rounds of password stretching

### Request
```sh
curl -v \
-X POST \
-H "Content-Type: application/json" \
http://idp.profileinthecloud.net/account/create \
-d '{
  "email": "me2@example.com",
  "verifier": "7597c55064c73bf1b2735878cb8711c289fc8f1cfb3d633a4593b36a8c51dbd68b27f649949de27d1dcccf7ece1e1a42c5c6bdc3d209cf13a3813d333bfcadd2641a9a3e2eb4289788ed8510cc8f2f1061789d58aef38b9d21b81831413f55473f9fae9253549b2428a403d6fa51e6fb43d2f8a302e132cf902ffade52c02e6a4e0bda74fcaa2347be4664f553d332df8166278c0e2f8663aa9238a2429631f7afd11622e193747b57975c51bbb69bb11f60c1a5ba449d3119e70d1ec580212151f79b26e73a57dba313376f0ba7a2afc232146a3b1d68b2d0afc35ebb8699cb10b3a3f8e0d51cefc7ac29212b238fb7a87f2f61edc9cbff103e386f778925fe",
  "salt": "f9fae9253549b2428a403d6fa51e6fb43d2f8a302e132cf902ffade52c02e6a4",
  "params": {
    "srp": {
      "alg": "sha256",
      "N_bits": 2048
    },
    "stretch": {
      "salt": "996bc6b1aa63cd69856a2ec81cbf19d5c8a604713362df9ee15c2bf07128efab",
      "rounds": 100000
    }
  }
}'
```

### Response

```json
{}
```

## GET /account/devices 🔒

Gets the collection of devices currently authenticated and syncing for the user.

___Headers___

The request must include a Hawk header that authenticates the request using a `sessionToken` received from `/session/auth/finish`.

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

## GET /account/keys 🔒

Get the base16 bundle of encrypted `kA|wrapKb`.

### Request

___Headers___

The request must include a Hawk header that authenticates the request using a `keyFetchToken` received from `/session/auth/finish` or `/password/change/auth/finish`.

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
for info on how to retrieve `kA|wrapKb` from the bundle.

## GET /account/recovery_methods 🔒

Gets the set of methods for recovery the user's password for the account (e.g., a set of email addresses).

### Request

___Headers___

The request must include a Hawk header that authenticates the request using a `sessionToken` received from `/session/auth/finish`.

```sh
curl -v \
-X GET \
-H "Host: idp.profileinthecloud.net" \
-H "Content-Type: application/json" \
-H 'Authorization: Hawk id="d4c5b1e3f5791ef83896c27519979b93a45e6d0da34c7509c5632ac35b28b48d", ts="1373391043", nonce="ohQjqb", hash="vBODPWhDhiRWM4tmI9qp+np+3aoqEFzdGuGk0h7bh9w=", mac="LAnpP3P2PXelC6hUoUaHP72nCqY5Iibaa3eeiGBqIIU="' \
http://idp.profileinthecloud.net/account/recovery_methods \
```

### Response

```json
{
  "recoveryMethods": [
    {
      "email": "me@example.com",
      "verified": true,
      "primary": true
    }
  ]
}
```

## POST /account/recovery_methods/send_code 🔒

Sends a verification code to the specified recovery method (e.g., email). Providing this code will mark the recovery method as "verified".

### Request

___Parameters___

* email - an email address associated with the user's account

___Headers___

The request must include a Hawk header that authenticates the request (including payload) using a `sessionToken` received from `/session/auth/finish`.

```sh
curl -v \
-X GET \
-H "Host: idp.profileinthecloud.net" \
-H "Content-Type: application/json" \
-H 'Authorization: Hawk id="d4c5b1e3f5791ef83896c27519979b93a45e6d0da34c7509c5632ac35b28b48d", ts="1373391043", nonce="ohQjqb", hash="vBODPWhDhiRWM4tmI9qp+np+3aoqEFzdGuGk0h7bh9w=", mac="LAnpP3P2PXelC6hUoUaHP72nCqY5Iibaa3eeiGBqIIU="' \
http://idp.profileinthecloud.net/account/recovery_methods/send_code \
-d '{
  "email": "me@example.com"
}'
```

### Response

```json
{}
```

## POST /account/recovery_methods/verify_code

Verifies a verification code that was sent to a user's recovery method (e.g., email). Providing this code will mark the recovery method as "verified".

### Request

___Parameters___

* email - email address
* code - a verification code

```sh
curl -v \
-X POST \
-H "Host: idp.profileinthecloud.net" \
-H "Content-Type: application/json" \
http://idp.profileinthecloud.net/account/recovery_methods/verify_code \
-d '{
  "email": "me@example.com",
  "code": "e3c5b0e3f5391e134596c27519979b93a45e6d0da34c7509c5632ac35b28b48d"
}'
```

### Response

```json
{}
```

## POST /account/reset 🔒

See [resetting the account](https://wiki.mozilla.org/Identity/AttachedServices/KeyServerProtocol#Resetting_the_Account)

### Request

___Parameters___

* bundle - a base16 string of encrypted `wrapKb|verifier`

___Headers___

The request must include a Hawk header that authenticates the request (including payload) using an `accountResetToken` received from `/password/change/auth/finish` or `/password/forgot/verify_code`.

```sh
curl -v \
-X POST \
-H "Host: idp.profileinthecloud.net" \
-H "Content-Type: application/json" \
-H 'Authorization: Hawk id="d4c5b1e3f5791ef83896c27519979b93a45e6d0da34c7509c5632ac35b28b48d", ts="1373391043", nonce="ohQjqb", hash="vBODPWhDhiRWM4tmI9qp+np+3aoqEFzdGuGk0h7bh9w=", mac="LAnpP3P2PXelC6hUoUaHP72nCqY5Iibaa3eeiGBqIIU="' \
http://idp.profileinthecloud.net/account/reset \
-d '{
  "bundle": "a586e79c9f3214b0010fe31bfb50fa6c12e1d093f7770c81c6b1c19c7ee375a6558dd1ab38dbc5eba37bc3cfbd6ac040c0208a48ca4f777688a1017e98cedcc1c36ba9c4595088d28dcde5af04ae2215bce907aa6e74dd68481e3edc6315d47efa6c7b6536e8c0adff9ca426805e9479607b7c105050f1391dffed2a98264bdc",
  "params": {
    "srp": {
      "alg": "sha256",
      "N_bits": 2048
    },
    "stretch": {
      "salt": "426bc6b1aa63cd69856a2ec81cbf19d5c8a60471cc62df9ee15c2bf07128ef00",
      "rounds": 100000
    }
  }
}'
```

### Response

```json
{}
```

## POST /certificate/sign 🔒

Sign a public key

___Parameters___

* publicKey - the key to sign (run `bin/generate-keypair` from [jwcrypto](https://github.com/mozilla/jwcrypto))
    * algorithm - "RS" or "DS"
    * n - RS only
    * e - RS only
    * y - DS only
    * p - DS only
    * q - DS only
    * g - DS only
* duration - time interval from now when the certificate will expire in milliseconds

___Headers___

The request must include a Hawk header that authenticates the request (including payload) using a `sessionToken` received from `/session/auth/finish`.

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

## POST /get_random_bytes

Get 32 bytes of random data

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

## POST /password/change/auth/start 🔒

Begin the "change password" process

___Headers___

The request must include a Hawk header that authenticates the request using a `sessionToken` received from `/session/auth/finish`.

### Request
```sh
curl -v \
-X POST \
-H "Content-Type: application/json" \
-H 'Authorization: Hawk id="d4c5b1e3f5791ef83896c27519979b93a45e6d0da34c7509c5632ac35b28b48d", ts="1373391043", nonce="ohQjqb", mac="LAnpP3P2PXelC6hUoUaHP72nCqY5Iibaa3eeiGBqIIU="' \
http://idp.profileinthecloud.net/password/change/auth/start
```

### Response

```json
{
  "srpToken": "b223b00e-5a10-46a9-983c-1c346c0d1907",
  "stretch": {
    "rounds": 100000,
    "salt": "9e1a5712b22ea7ec06eb74422be67040e030a9f041fe258d8ed633d027271704"
  },
  "srp":
  {
    "N_bits": 2048,
    "alg": "sha256",
    "s": "739e25a048cdc37353ebbfe6aca8f7e427f483fab73c01e91b23c4a77186c718",
    "B": "3cd467e3afd4cc2d7abd913e322d76c245c667e9dffc6e28a1108ac02c5af9eee1148a0c735f52ed786c33add4936dd5534326794e03d1b48b77b347c728740288adf488a9f4f11d75bb60e9bb1e975cccd128e28115178de01702fd2e8715e7c33b02c142569669bb52cf167092fa79c3c03c81affc5c8d97fd3cb8d12605e5dd59f75e21376cfdc6536125650ff8559f1c5319a9bfbb5191238c1570d41dc43e880d213fa06ff9d2f6ca7f31e05aef6236ae3657450250c06145a346151c54f227996532bbdc6e1531456174975eded5404baae081b3ce7b42646b98baec1029082823a041aaace4ffa362d5ed42a4e5088c496dda8ba2a35e804e89597313"
  }
}
```

## POST /password/change/auth/finish

Get a base16 bundle of encrypted `accountResetToken|keyFetchToken`.

___Parameters___

* srpToken - the srpToken received from `/startLogin`
* A - the derived SRP "A" value
* M - the derived SRP "M" value

### Request
```sh
curl -v \
-X POST \
-H "Content-Type: application/json" \
http://idp.profileinthecloud.net/password/change/auth/finish \
-d '{
  "changePasswordSrpToken": "4c352927-cd4f-4a4a-a03d-7d1893d950b8",
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
for info on how to retrieve `accountResetToken|keyFetchToken` from the bundle.

## POST /password/forgot/send_code

Request that "reset password" code be sent to one of the user's recovery methods (e.g., email).

___Parameters___

* email - the primary email for this account

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
  "forgotPasswordToken": "b223b00e-5a10-46a9-983c-1c346c0d1907"
}
```

## POST /password/forgot/verify_code

Verify a "reset password" code that was sent to one of the user's recovery methods (e.g., email). Returns a `accountResetToken`.

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
  "code": "123456",
  "forgotPasswordToken": "b223b00e-5a10-46a9-983c-1c346c0d1907"
}'
```

### Response

```json
{
  "accountResetToken": "cd24b20f-1b14-46a9-383c-0d344c0d1907"
}
```

## POST /session/auth/start

Begin the login process

___Parameters___

* email - user's email address

### Request
```sh
curl -v \
-X POST \
-H "Content-Type: application/json" \
http://idp.profileinthecloud.net/session/auth/start \
-d '{
  "email": "me@example.com"
}'
```

### Response

```json
{
  "srpToken": "b223b00e-5a10-46a9-983c-1c346c0d1907",
  "stretch": {
    "rounds": 100000,
    "salt": "9e1a5712b22ea7ec06eb74422be67040e030a9f041fe258d8ed633d027271704"
  },
  "srp":
  {
    "N_bits": 2048,
    "alg": "sha256",
    "s": "739e25a048cdc37353ebbfe6aca8f7e427f483fab73c01e91b23c4a77186c718",
    "B": "3cd467e3afd4cc2d7abd913e322d76c245c667e9dffc6e28a1108ac02c5af9eee1148a0c735f52ed786c33add4936dd5534326794e03d1b48b77b347c728740288adf488a9f4f11d75bb60e9bb1e975cccd128e28115178de01702fd2e8715e7c33b02c142569669bb52cf167092fa79c3c03c81affc5c8d97fd3cb8d12605e5dd59f75e21376cfdc6536125650ff8559f1c5319a9bfbb5191238c1570d41dc43e880d213fa06ff9d2f6ca7f31e05aef6236ae3657450250c06145a346151c54f227996532bbdc6e1531456174975eded5404baae081b3ce7b42646b98baec1029082823a041aaace4ffa362d5ed42a4e5088c496dda8ba2a35e804e89597313"
  }
}
```

How to derive the values for the next step are explained in the
[SRP Client Calculation](https://wiki.mozilla.org/Identity/AttachedServices/KeyServerProtocol#SRP_Client_Calculation)

## POST /session/auth/finish

Get a sessionToken, keyFetchToken

___Parameters___

* srpToken - the srpToken received from `/session/auth/start`
* A - the derived SRP "A" value
* M - the derived SRP "M" value

### Request
```sh
curl -v \
-X POST \
-H "Content-Type: application/json" \
http://idp.profileinthecloud.net/session/auth/finish \
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
for info on how to retrieve `sessionToken|keyFetchToken` from the bundle.

## GET /session/status 🔒

Check whether a session is still valid.

___Headers___

The request must include a Hawk header that authenticates the request using a `sessionToken` received from `/session/auth/finish`.

### Request
```sh
curl -v \
-X GET \
-H "Host: idp.profileinthecloud.net" \
-H "Content-Type: application/json" \
-H 'Authorization: Hawk id="d4c5b1e3f5791ef83896c27519979b93a45e6d0da34c7509c5632ac35b28b48d", ts="1373391043", nonce="ohQjqb", mac="LAnpP3P2PXelC6hUoUaHP72nCqY5Iibaa3eeiGBqIIU="' \
http://idp.profileinthecloud.net/session/status \
```

### Response

```json
{}
```

## POST /session/destroy 🔒

Destroys this session.

___Headers___

The request must include a Hawk header that authenticates the request using a `sessionToken` received from `/session/auth/finish`.

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

# Example flows

## Create account

* `POST /account/create`
* `POST /session/auth/start`
* `POST /session/auth/finish`
* `GET /account/recovery_methods`
* `GET /account/keys`
* `POST /certificate/sign`

## Attach a new device

* `POST /session/auth/start`
* `POST /session/auth/finish`
* `GET /account/keys`
* `POST /certificate/sign`

## Forgot password

* `POST /password/forgot/send_code`
* `POST /password/forgot/verify_code`
* `POST /account/reset`
* `POST /session/auth/start`
* `POST /session/auth/finish`
* `GET /account/keys`
* `POST /certificate/sign`

## Change password

* `POST /password/change/auth/start`
* `POST /password/change/auth/finish`
* `GET /account/keys`
* `POST /account/reset`
* `POST /session/auth/start`
* `POST /session/auth/finish`
* `GET /account/keys`
* `POST /certificate/sign`

# Reference Client

The [git repo](https://github.com/mozilla/picl-idp) contains a reference implementation
of the client side of the protocol in [/client/index.js](/client/index.js) with
sample usage in [/client/example.js](/client/example.js)
