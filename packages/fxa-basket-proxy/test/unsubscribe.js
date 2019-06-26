/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var assert = require('assert');
var request = require('supertest');

var app = require('../lib/app')();

var mocks = require('./lib/mocks');

var UID = 'abcdef123456';

describe('the /unsubscribe route', function() {
  it('looks up token, forwards authenticated requests through to basket', function(done) {
    var EMAIL = 'test@example.com';
    var TOKEN = 'abcdef123456';
    var NEWSLETTERS = 'a';
    mocks.mockOAuthResponse().reply(200, {
      user: UID,
      scope: ['basket'],
    });
    mocks.mockProfileResponse().reply(200, {
      email: EMAIL,
    });
    mocks
      .mockBasketResponse()
      .get('/lookup-user/')
      .query({ email: EMAIL })
      .reply(200, {
        status: 'ok',
        token: TOKEN,
      });
    mocks
      .mockBasketResponse()
      .post('/unsubscribe/' + TOKEN + '/', function(body) {
        assert.deepEqual(body, {
          email: EMAIL,
          newsletters: NEWSLETTERS,
        });
        return true;
      })
      .reply(200, {
        status: 'ok',
      });
    request(app)
      .post('/unsubscribe')
      .set('authorization', 'Bearer TOKEN')
      .send({ newsletters: NEWSLETTERS })
      .expect(200, {
        status: 'ok',
      })
      .end(done);
  });

  it('passes through all params from body, except email', function(done) {
    var EMAIL = 'test@example.com';
    var TOKEN = 'abcdef123456';
    var NEWSLETTERS = 'b';
    mocks.mockOAuthResponse().reply(200, {
      user: UID,
      scope: ['basket'],
    });
    mocks.mockProfileResponse().reply(200, {
      email: EMAIL,
    });
    mocks
      .mockBasketResponse()
      .get('/lookup-user/')
      .query({ email: EMAIL })
      .reply(200, {
        status: 'ok',
        token: TOKEN,
      });
    mocks
      .mockBasketResponse()
      .post('/unsubscribe/' + TOKEN + '/', function(body) {
        assert.deepEqual(body, {
          email: EMAIL,
          newsletters: NEWSLETTERS,
          optout: 'Y',
        });
        return true;
      })
      .reply(200, {
        status: 'ok',
      });
    request(app)
      .post('/unsubscribe')
      .set('authorization', 'Bearer TOKEN')
      .send({
        email: 'someone-else@example.com',
        newsletters: NEWSLETTERS,
        optout: 'Y',
      })
      .expect(200, {
        status: 'ok',
      })
      .end(done);
  });

  it('guards aginst errors from looking up the token', function(done) {
    var EMAIL = 'test@example.com';
    var NEWSLETTERS = 'c,d';
    mocks.mockOAuthResponse().reply(200, {
      user: UID,
      scope: ['basket'],
    });
    mocks.mockProfileResponse().reply(200, {
      email: EMAIL,
    });
    mocks
      .mockBasketResponse()
      .get('/lookup-user/')
      .query({ email: EMAIL })
      .reply(404, {
        status: 'error',
        desc: 'not found',
      });
    request(app)
      .post('/unsubscribe')
      .set('authorization', 'Bearer TOKEN')
      .send({
        email: EMAIL,
        newsletters: NEWSLETTERS,
      })
      .expect(404, {
        status: 'error',
        desc: 'not found',
      })
      .end(done);
  });

  it('returns an error if no credentials are provided', function(done) {
    request(app)
      .post('/unsubscribe')
      .expect('Content-Type', /json/)
      .expect(400, {
        status: 'error',
        code: 5,
        desc: 'missing authorization header',
      })
      .end(done);
  });

  it('returns an error if the basket server request errors out', function(done) {
    var EMAIL = 'test@example.com';
    var TOKEN = 'abcdef123456';
    var NEWSLETTERS = 'b';
    mocks.mockOAuthResponse().reply(200, {
      user: UID,
      scope: ['basket'],
    });
    mocks.mockProfileResponse().reply(200, {
      email: EMAIL,
    });
    mocks
      .mockBasketResponse()
      .get('/lookup-user/')
      .query({ email: EMAIL })
      .reply(200, {
        status: 'ok',
        token: TOKEN,
      });
    mocks
      .mockBasketResponse()
      .post('/unsubscribe/' + TOKEN + '/', function(body) {
        assert.deepEqual(body, {
          email: EMAIL,
          newsletters: NEWSLETTERS,
        });
        return true;
      })
      .replyWithError('ruh-roh!');
    request(app)
      .post('/unsubscribe')
      .set('authorization', 'Bearer TOKEN')
      .send({ newsletters: NEWSLETTERS })
      .expect(500, {
        status: 'error',
        code: 99,
        desc: 'Error: ruh-roh!',
      })
      .end(done);
  });

  it('returns an error if the basket server returns an error', function(done) {
    var EMAIL = 'test@example.com';
    var TOKEN = 'abcdef123456';
    var NEWSLETTERS = 'b';
    mocks.mockOAuthResponse().reply(200, {
      user: UID,
      scope: ['basket'],
    });
    mocks.mockProfileResponse().reply(200, {
      email: EMAIL,
    });
    mocks
      .mockBasketResponse()
      .get('/lookup-user/')
      .query({ email: EMAIL })
      .reply(200, {
        status: 'ok',
        token: TOKEN,
      });
    mocks
      .mockBasketResponse()
      .post('/unsubscribe/' + TOKEN + '/', function(body) {
        assert.deepEqual(body, {
          email: EMAIL,
          newsletters: NEWSLETTERS,
        });
        return true;
      })
      .reply(403, {
        status: 'error',
        desc: 'some random error',
      });
    request(app)
      .post('/unsubscribe')
      .set('authorization', 'Bearer TOKEN')
      .send({ newsletters: NEWSLETTERS })
      .expect(403, {
        status: 'error',
        desc: 'some random error',
      })
      .end(done);
  });

  it('returns an error if the token lookup request errors out', function(done) {
    var EMAIL = 'test@example.com';
    var NEWSLETTERS = 'a,b,c';
    mocks.mockOAuthResponse().reply(200, {
      user: UID,
      scope: ['basket'],
    });
    mocks.mockProfileResponse().reply(200, {
      email: EMAIL,
    });
    mocks
      .mockBasketResponse()
      .get('/lookup-user/')
      .query({ email: EMAIL })
      .replyWithError('ruh-roh!');
    request(app)
      .post('/unsubscribe')
      .set('authorization', 'Bearer TOKEN')
      .send({ newsletters: NEWSLETTERS })
      .expect(400, {
        status: 'error',
        code: 99,
        desc: 'Error: ruh-roh!',
      })
      .end(done);
  });

  it('returns an error if the token lookup request returns invalid JSON', function(done) {
    var EMAIL = 'test@example.com';
    var NEWSLETTERS = 'a,b,c';
    var desc;
    try {
      JSON.parse('<');
    } catch (ex) {
      desc = String(ex);
    }
    mocks.mockOAuthResponse().reply(200, {
      user: UID,
      scope: ['basket'],
    });
    mocks.mockProfileResponse().reply(200, {
      email: EMAIL,
    });
    mocks
      .mockBasketResponse()
      .get('/lookup-user/')
      .query({ email: EMAIL })
      .reply(200, '<html>eh?</html>');
    request(app)
      .post('/unsubscribe')
      .set('authorization', 'Bearer TOKEN')
      .send({ newsletters: NEWSLETTERS })
      .expect(400, {
        status: 'error',
        code: 99,
        desc: desc,
      })
      .end(done);
  });
});
