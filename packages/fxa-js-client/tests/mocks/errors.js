module.exports = {
  // status code 400, errno 101: attempt to create an account that already exists
  accountExists: {
    status: 400,
    headers: {},
    body: '{"code":400, "errno": 101}',
  },
  // status code 400, errno 102: attempt to access an account that does not exist
  accountDoesNotExist: {
    status: 400,
    headers: {},
    body: '{"code":400, "errno": 102}',
  },
  // status code 400, errno 103: incorrect password
  accountIncorrectPassword: {
    status: 400,
    headers: {},
    body: '{"code":400, "errno": 103, "message":"Incorrect password"}',
  },
  // status code 400, errno 104: attempt to operate on an unverified account
  accountUnverified: {
    status: 400,
    headers: {},
    body: '{"code":400, "errno": 104}',
  },
  // status code 400, errno 105: invalid verification code
  invalidVerification: {
    status: 400,
    headers: {},
    body: '{"code":400, "errno": 105}',
  },
  // status code 400, errno 106: request body was not valid json
  invalidJson: {
    status: 400,
    headers: {},
    body: '{"code":400, "errno": 106}',
  },
  // status code 400, errno 107: request body contains invalid parameters
  requestInvalidParams: {
    status: 400,
    headers: {},
    body: '{"code":400, "errno": 107}',
  },
  // status code 400, errno 107: request body contains invalid parameters
  requestMissingParams: {
    status: 400,
    headers: {},
    body: '{"code":400, "errno": 108}',
  },
  // status code 401, errno 109: invalid request signature
  invalidRequestSignature: {
    status: 401,
    headers: {},
    body: '{"code":401, "errno": 109}',
  },
  // status code 401, errno 110: invalid authentication token
  invalidAuthToken: {
    status: 401,
    headers: {},
    body: '{"code":401, "errno": 110}',
  },
  // status code 401, errno 111: invalid authentication timestamp
  invalidAuthTimestamp: {
    status: 401,
    headers: {},
    body: '{"code":401, "errno": 111}',
  },
  // status code 411, errno 112: content-length header was not provided
  missingContentLength: {
    status: 411,
    headers: {},
    body: '{"code":411, "errno": 112}',
  },
  // status code 413, errno 113: request body too large
  requestTooLarge: {
    status: 413,
    headers: {},
    body: '{"code":413, "errno": 113}',
  },
  // status code 429, errno 114: client has sent too many requests (see backoff protocol)
  sentTooManyRequests: {
    status: 429,
    headers: {},
    body: '{"code":429, "errno": 114}',
  },
  // status code 429, errno 115: invalid authentication nonce
  invalidAuthNonce: {
    status: 401,
    headers: {},
    body: '{"code":401, "errno": 115}',
  },
  // status code 410, errno 116: endpoint is no longer supported
  endpointNotSupported: {
    status: 410,
    headers: {},
    body: '{"code":410, "errno": 116}',
  },
  // status code 400, errno 117: incorrect login method for this account
  incorrectLoginMethod: {
    status: 400,
    headers: {},
    body: '{"code":400, "errno": 117}',
  },
  // status code 400, errno 118: incorrect key retrieval method for this account
  incorrectKeyMethod: {
    status: 400,
    headers: {},
    body: '{"code":400, "errno": 118}',
  },
  // status code 400, errno 119: incorrect API version for this account
  incorrectAPIVersion: {
    status: 400,
    headers: {},
    body: '{"code":400, "errno": 119}',
  },
  // status code 400, errno 120: incorrect email case
  incorrectEmailCase: {
    status: 400,
    headers: {},
    body: '{"code":400, "errno": 120, "email": "a@b.com"}',
  },
  // status code 503, errno 201: service temporarily unavailable to due high load (see backoff protocol)
  temporarilyUnavailable: {
    status: 503,
    headers: {},
    body: '{"code":503, "errno": 201}',
  },
  // any status code, errno 999: unknown error
  unknownError: {
    status: 400,
    headers: {},
    body: '{"code":400, "errno": 999}',
  },
  timeout: {
    status: 400,
    headers: {},
    body: '',
  },
  badResponseFormat: {
    status: 404,
    headers: {},
    body: '<html><body>Something is wrong.</body></html>',
  },
  signInBlocked: {
    status: 429,
    headers: {},
    body: JSON.stringify({
      code: 429,
      errno: 125,
      verificationMethod: 'email-captcha',
      verificationReason: 'login',
    }),
  },
  signInInvalidUnblockCode: {
    status: 400,
    body: '{"code":400, "errno": 127}',
  },
};
