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
    recoveryEmailUnverified: {
      status: 200,
      body: '{"verified": false}'
    },
    recoveryEmailVerified: {
      status: 200,
      body: '{"verified": true}'
    }
  };
});
