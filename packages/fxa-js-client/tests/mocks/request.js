/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

//jscs:disable maximumLineLength
define([
  'client/lib/errors',
  'tests/lib/push-constants'
], function (ERRORS, PushTestConstants) {

  var DEVICE_CALLBACK = PushTestConstants.DEVICE_CALLBACK;
  var DEVICE_ID = PushTestConstants.DEVICE_ID;
  var DEVICE_NAME = PushTestConstants.DEVICE_NAME;
  var DEVICE_NAME_2 = PushTestConstants.DEVICE_NAME_2;
  var DEVICE_PUBLIC_KEY = PushTestConstants.DEVICE_PUBLIC_KEY;
  var DEVICE_AUTH_KEY = PushTestConstants.DEVICE_AUTH_KEY;
  var DEVICE_TYPE = PushTestConstants.DEVICE_TYPE;

  return {
    signUp: {
      status: 200,
      headers: {},
      body: '{ "uid": "0577e7a5fbf448e3bc60dacbff5dcd5c", "sessionToken": "27cd4f4a4aa03d7d186a2ec81cbf19d5c8a604713362df9ee15c4f4a4aa03d7d"}'
    },
    signUpExistingDevice: {
      status: 200,
      headers: {},
      body: JSON.stringify({
        device:{
          id: DEVICE_ID,
          name: DEVICE_NAME,
          type: DEVICE_TYPE,
          pushCallback: DEVICE_CALLBACK,
          pushPublicKey: DEVICE_PUBLIC_KEY,
          pushAuthKey: DEVICE_AUTH_KEY
        },
        sessionToken:'6544062365c5ebee16e3c5e15448139851583b5f5f7b6bd6d4a37bac41665e8a',
        uid:'9c8e5cf6915949c1b063b88fa0c53d05',
        verified:true,
      })
    },
    signUpKeys: {
      status: 200,
      headers: {},
      body: '{ "uid": "0577e7a5fbf448e3bc60dacbff5dcd5c", "sessionToken": "27cd4f4a4aa03d7d186a2ec81cbf19d5c8a604713362df9ee15c4f4a4aa03d7d","keyFetchToken": "b1f4182d7e072567a1dbe682043a16932a84b7f4ca3b95e471a34806c87e4130"  }'
    },
    signUpNewDevice: {
      status: 200,
      headers: {},
      body: JSON.stringify({
        device:{
          id: DEVICE_ID,
          name: DEVICE_NAME,
          type: DEVICE_TYPE,
          pushCallback: DEVICE_CALLBACK,
          pushPublicKey: DEVICE_PUBLIC_KEY,
          pushAuthKey: DEVICE_AUTH_KEY
        },
        sessionToken:'6544062365c5ebee16e3c5e15448139851583b5f5f7b6bd6d4a37bac41665e8a',
        uid:'9c8e5cf6915949c1b063b88fa0c53d05',
        verified:true,
      })
    },
    signIn: {
      status: 200,
      headers: {},
      body: '{"uid":"9c8e5cf6915949c1b063b88fa0c53d05","verified":true,"sessionToken":"6544062365c5ebee16e3c5e15448139851583b5f5f7b6bd6d4a37bac41665e8a"}'
    },
    signInExistingDevice: {
      status: 200,
      headers: {},
      body: JSON.stringify({
        device:{
          id: DEVICE_ID,
          name: DEVICE_NAME,
          type: DEVICE_TYPE,
          pushCallback: DEVICE_CALLBACK,
          pushPublicKey: DEVICE_PUBLIC_KEY,
          pushAuthKey: DEVICE_AUTH_KEY
        },
        sessionToken:'6544062365c5ebee16e3c5e15448139851583b5f5f7b6bd6d4a37bac41665e8a',
        uid:'9c8e5cf6915949c1b063b88fa0c53d05',
        verified:true,
      })
    },
    signInFailurePassword: {
      status: 400,
      headers: {},
      body: '{"code":400,"message":"Incorrect password"}'
    },
    signInNewDevice: {
      status: 200,
      headers: {},
      body: JSON.stringify({
        device:{
          id: DEVICE_ID,
          name: DEVICE_NAME,
          type: DEVICE_TYPE,
          pushCallback: DEVICE_CALLBACK,
          pushPublicKey: DEVICE_PUBLIC_KEY,
          pushAuthKey: DEVICE_AUTH_KEY
        },
        sessionToken:'6544062365c5ebee16e3c5e15448139851583b5f5f7b6bd6d4a37bac41665e8a',
        uid:'9c8e5cf6915949c1b063b88fa0c53d05',
        verified:true,
      })
    },
    signInWithKeys: {
      status: 200,
      headers: {},
      body: '{"uid": "5d576e2cd3604981a8c05f6ea67fce5b", "sessionToken": "9c1fe2a0643ce23aa1b44afbe30e28d33e5726558cab215314980fc85875684f","keyFetchToken": "b1f4182d7e072567a1dbe682043a16932a84b7f4ca3b95e471a34806c87e4130","verified": true}'
    },
    heartbeat: {
      status: 200,
      body: '{}'
    },
    verifyCode: {
      status: 200,
      body: '{}'
    },
    mail: {
      status: 200,
      body: '[{"html":"Mocked code=9001"}]'
    },
    mailSignUpLang: {
      status: 200,
      body: '[{"html":"Mocked code=9001","headers": {"content-language": "zh-CN" }}]'
    },
    mailServiceAndRedirect: {
      status: 200,
      body: '[{"html":"Mocked code=9001 service=sync redirectTo=https resume=resumejwt"}]'
    },
    resetMail: {
      status: 200,
      body: '[{"html":"Mocked code=9001"}, {"html":"Mocked code=9001"}]'
    },
    resetMailUnlock: {
      status: 200,
      body: '[{"html":"Mocked code=9001"}, {"html":"Account Ready"}, {"html":"Mocked code=9001"}]'
    },
    resetMailWithServiceAndRedirectNoSignup: {
      status: 200,
      body: '[{"html":"Mocked code=9001"}, {"html":"Mocked code=9001 service=sync redirectTo=https resume=resumejwt"}]'
    },
    resetMailWithServiceAndRedirect: {
      status: 200,
      body: '[{"html":"Mocked code=9001"}, {"html":"Account Ready"}, {"html":"Mocked code=9001 service=sync redirectTo=https resume=resumejwt"}]'
    },
    resetMailResendWithServiceAndRedirect: {
      status: 200,
      body: '[{"html":"Mocked code=9001"}, {"html":"Account Ready"}, {"html":"Mocked code=9001 service=sync redirectTo=https"}, {"html":"Mocked code=9001 service=sync redirectTo=https resume=resumejwt"}]'
    },
    resetMailLang: {
      status: 200,
      body: '[{"html":"Mocked code=9001"}, {"html":"Mocked code=9001","headers": {"content-language": "zh-CN" }}]'
    },
    recoveryEmailUnverified: {
      status: 200,
      body: '{"verified": false}'
    },
    recoveryEmailVerified: {
      status: 200,
      body: '{"verified": true}'
    },
    recoveryEmailResendCode: {
      status: 200,
      body: '{}'
    },
    passwordForgotSendCode: {
      status: 200,
      body: '{"passwordForgotToken":"e838790265a45f6ee1130070d57d67d9bb20953706f73af0e34b0d4d92f19103","ttl":900,"tries":3}'
    },
    passwordForgotResendCode: {
      status: 200,
      body: '{"passwordForgotToken":"e838790265a45f6ee1130070d57d67d9bb20953706f73af0e34b0d4d92f19103","ttl":900,"tries":3}'
    },
    passwordForgotStatus: {
      status: 200,
      body: '{ "tries": 3, "ttl": 420 }'
    },
    passwordForgotVerifyCode: {
      status: 200,
      body: '{"accountResetToken":"50a2052498d538a5d3918847751c8d5077294fd637dbf20d27f2f5f854cbcf4f"}'
    },
    passwordChangeStart: {
      status: 200,
      body: '{ "keyFetchToken": "b1f4182d7e072567a1dbe682043a16932a84b7f4ca3b95e471a34806c87e4130", "passwordChangeToken": "0208a48ca4f777688a1017e98cedcc1c36ba9c4595088d28dcde5af04ae2215b", "verified": true }'
    },
    passwordChangeFinish: {
      status: 200,
      body: '{}'
    },
    accountReset: {
      status: 200,
      body: '{}'
    },
    sessionDestroy: {
      status: 200,
      body: '{}'
    },
    sessionStatus: {
      status: 200,
      body: '{}'
    },
    accountDestroy: {
      status: 200,
      body: '{}'
    },
    accountKeys: {
      status: 200,
      body: '{ "bundle": "7f1a9633560774251a2d317b4539e04bcb14a767ec92e3b3f4d438fdad984831f6d1e1b0d93c23d312bf0859270dc8c0e6ebcae4c499f3a604881fc57683459b01cdfd04757835b0334a80728ce40cf50dce32bb365d8a0ac868bb747bf8aca4"}'
    },
    accountStatus: {
      status: 200,
      body: '{ "exists": true }'
    },
    accountStatusFalse: {
      status: 200,
      body: '{ "exists": false }'
    },
    certificateSign: {
      status: 200,
      body: '{ "cert": "eyJhbGciOiJEUzI1NiJ9.eyJwdWJsaWMta2V5Ijp7ImFsZ29yaXRobSI6IlJTIiwibiI6IjU3NjE1NTUwOTM3NjU1NDk2MDk4MjAyMjM2MDYyOTA3Mzg5ODMyMzI0MjUyMDY2Mzc4OTA0ODUyNDgyMjUzODg1MTA3MzQzMTY5MzI2OTEyNDkxNjY5NjQxNTQ3NzQ1OTM3NzAxNzYzMTk1NzQ3NDI1NTEyNjU5NjM2MDgwMzYzNjE3MTc1MzMzNjY5MzEyNTA2OTk1MzMyNDMiLCJlIjoiNjU1MzcifSwicHJpbmNpcGFsIjp7ImVtYWlsIjoiZm9vQGV4YW1wbGUuY29tIn0sImlhdCI6MTM3MzM5MjE4OTA5MywiZXhwIjoxMzczMzkyMjM5MDkzLCJpc3MiOiIxMjcuMC4wLjE6OTAwMCJ9.l5I6WSjsDIwCKIz_9d3juwHGlzVcvI90T2lv2maDlr8bvtMglUKFFWlN_JEzNyPBcMDrvNmu5hnhyN7vtwLu3Q" }'
    },
    getRandomBytes: {
      status: 200,
      body: '{ "data": "ac55c0520f2edfb026761443da0ab27b1fa18c98912af6291714e9600aa34991" }'
    },
    invalidTimestamp: {
      status: 401,
      body: '{ "errno": ' + ERRORS.INVALID_TIMESTAMP + ', "error": "Invalid authentication timestamp", "serverTime": ' + new Date().getTime() + ' }'
    },
    accountLock: {
      status: 200,
      body: '{}'
    },
    accountUnlockResendCode: {
      status: 200,
      body: '{}'
    },
    accountUnlockVerifyCode: {
      status: 200,
      body: '{}'
    },
    deviceDestroy: {
      status: 200,
      body: '{}'
    },
    deviceList: {
      status: 200,
      body: JSON.stringify([
        {
          id: DEVICE_ID,
          name: DEVICE_NAME,
          type: DEVICE_TYPE,
          pushCallback: DEVICE_CALLBACK,
          pushPublicKey: DEVICE_PUBLIC_KEY,
          pushAuthKey: DEVICE_AUTH_KEY
        }
      ])
    },
    deviceRegister: {
      status: 200,
      body: JSON.stringify(
        {
          id: DEVICE_ID,
          name: DEVICE_NAME,
          type: DEVICE_TYPE,
          pushCallback: DEVICE_CALLBACK,
          pushPublicKey: DEVICE_PUBLIC_KEY,
          pushAuthKey: DEVICE_AUTH_KEY
        }
      )
    },
    deviceUpdate: {
      status: 200,
      body: JSON.stringify(
        {
          id: DEVICE_ID,
          name: DEVICE_NAME_2,
          type: DEVICE_TYPE,
          pushCallback: DEVICE_CALLBACK,
          pushPublicKey: DEVICE_PUBLIC_KEY,
          pushAuthKey: DEVICE_AUTH_KEY
        }
      )
    }
  };
});
