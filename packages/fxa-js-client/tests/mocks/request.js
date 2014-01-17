/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

 define([], function () {
  return {
    signUp: {
      status: 200,
      headers: {},
      body: '{ "uid": "0577e7a5fbf448e3bc60dacbff5dcd5c" }'
    },
    signIn: {
      status: 200,
      headers: {},
      body: '{"uid":"9c8e5cf6915949c1b063b88fa0c53d05","verified":true,"sessionToken":"6544062365c5ebee16e3c5e15448139851583b5f5f7b6bd6d4a37bac41665e8a"}'
    },
    signInFailurePassword: {
      status: 400,
      headers: {},
      body: '{"code":400,"message":"Incorrect password"}'
    },
    signInWithKeys: {
      status: 200,
      headers: {},
      body: '{"uid": "4c352927cd4f4a4aa03d7d1893d950b8", "sessionToken": "27cd4f4a4aa03d7d186a2ec81cbf19d5c8a604713362df9ee15c4f4a4aa03d7d","keyFetchToken": "7d1893d950b8cd69856a2ec81cbfd7d1893d950b3362df9e56a2ec81cbf19d5c","verified": true, "unwrapBKey": "deadbeef"}'
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
    resetMail: {
      status: 200,
      body: '[{"html":"Mocked code=9001"}, {"html":"Mocked code=9001"}]'
    },
    recoveryEmailUnverified: {
      status: 200,
      body: '{"verified": false}'
    },
    recoveryEmailVerified: {
      status: 200,
      body: '{"verified": true}'
    },
    passwordForgotSendCode: {
      status: 200,
      body: '{"passwordForgotToken":"e838790265a45f6ee1130070d57d67d9bb20953706f73af0e34b0d4d92f19103","ttl":900,"tries":3}'
    },
    passwordForgotVerifyCode: {
      status: 200,
      body: '{"accountResetToken":"50a2052498d538a5d3918847751c8d5077294fd637dbf20d27f2f5f854cbcf4f"}'
    },
    passwordChangeStart: {
      status: 200,
      body: '{ "keyFetchToken": "fa6c7b6536e8c0adff9ca426805e9479607b7c105050f1391dffed2a9826b8ad", "passwordChangeToken": "0208a48ca4f777688a1017e98cedcc1c36ba9c4595088d28dcde5af04ae2215b", "verified": true }'
    },
    passwordChangeFinish: {
      status: 200,
      body: '{}'
    },
    accountReset: {
      status: 200,
      body: '{}'
    },
    accountKeys: {
      status: 200,
      body: '{ "bundle": "d486e79c9f3214b0010fe31bfb50fa6c12e1d093f7770c81c6b1c19c7ee375a6558dd1ab38dbc5eba37bc3cfbd6ac040c0208a48ca4f777688a1017e98cedcc1c36ba9c4595088d28dcde5af04ae2215bce907aa6e74dd68481e3edc6315d47efa6c7b6536e8c0adff9ca426805e9479607b7c105050f1391dffed2a9826b8ad"}'
    }
  };
});
