/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var assert = require('assert');
var request = require('supertest');

var config = require('../lib/config');
var app = require('../lib/app')();

var mocks = require('./lib/mocks');

var UID = 'abcdef123456';
var DEFAULT_SOURCE_URL = config.get('basket.source_url');

describe('the /subscribe route', function() {
  it('forwards properly-authenticated requests through to basket', function(done) {
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
      .post('/subscribe/', function(body) {
        /*eslint-disable camelcase */
        assert.deepEqual(body, {
          email: EMAIL,
          newsletters: NEWSLETTERS,
          source_url: DEFAULT_SOURCE_URL,
        });
        return true;
      })
      .reply(200, {
        status: 'ok',
      });
    request(app)
      .post('/subscribe')
      .set('authorization', 'Bearer TOKEN')
      .send({ newsletters: NEWSLETTERS })
      .expect(200, {
        status: 'ok',
      })
      .end(done);
  });

  it('accepts form-encoded request bodies', function(done) {
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
      .post('/subscribe/', function(body) {
        /*eslint-disable camelcase */
        assert.deepEqual(body, {
          email: EMAIL,
          newsletters: NEWSLETTERS,
          source_url: DEFAULT_SOURCE_URL,
        });
        return true;
      })
      .reply(200, {
        status: 'ok',
      });
    request(app)
      .post('/subscribe')
      .set('authorization', 'Bearer TOKEN')
      .type('form')
      .send({ newsletters: NEWSLETTERS })
      .expect(200, {
        status: 'ok',
      })
      .end(done);
  });

  it('accepts a trailing slash on the path', function(done) {
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
      .post('/subscribe/', function(body) {
        /*eslint-disable camelcase */
        assert.deepEqual(body, {
          email: EMAIL,
          newsletters: NEWSLETTERS,
          source_url: DEFAULT_SOURCE_URL,
        });
        return true;
      })
      .reply(200, {
        status: 'ok',
      });
    request(app)
      .post('/subscribe/')
      .set('authorization', 'Bearer TOKEN')
      .send({ newsletters: NEWSLETTERS })
      .expect(200, {
        status: 'ok',
      })
      .end(done);
  });

  it('passes through all params from body, except email', function(done) {
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
      .post('/subscribe/', function(body) {
        /*eslint-disable camelcase */
        assert.deepEqual(body, {
          email: EMAIL,
          newsletters: NEWSLETTERS,
          source_url: DEFAULT_SOURCE_URL,
          sync: 'Y',
        });
        return true;
      })
      .reply(200, {
        status: 'ok',
      });
    request(app)
      .post('/subscribe')
      .set('authorization', 'Bearer TOKEN')
      .send({
        email: 'someone-else@example.com',
        newsletters: NEWSLETTERS,
        sync: 'Y',
      })
      .expect(200, {
        status: 'ok',
      })
      .end(done);
  });

  it('returns an error if no credentials are provided', function(done) {
    request(app)
      .post('/subscribe')
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
      .post('/subscribe/', function(body) {
        /*eslint-disable camelcase */
        assert.deepEqual(body, {
          email: EMAIL,
          newsletters: NEWSLETTERS,
          source_url: DEFAULT_SOURCE_URL,
        });
        return true;
      })
      .replyWithError('ruh-roh!');
    request(app)
      .post('/subscribe')
      .set('authorization', 'Bearer TOKEN')
      .send({ newsletters: NEWSLETTERS })
      .expect(500, {
        status: 'error',
        code: 99,
        desc: 'Error: ruh-roh!',
      })
      .end(done);
  });

  it('forwards the accept-language header if present', function(done) {
    var EMAIL = 'test@example.com';
    var NEWSLETTERS = 'a,b,c';
    var ACCEPT_LANG = 'Accept-Language: de; q=1.0, en; q=0.5';
    mocks.mockOAuthResponse().reply(200, {
      user: UID,
      scope: ['basket'],
    });
    mocks.mockProfileResponse().reply(200, {
      email: EMAIL,
    });
    mocks
      .mockBasketResponse()
      .post('/subscribe/', function(body) {
        /*eslint-disable camelcase */
        assert.deepEqual(body, {
          email: EMAIL,
          newsletters: NEWSLETTERS,
          source_url: DEFAULT_SOURCE_URL,
          accept_lang: ACCEPT_LANG,
        });
        return true;
      })
      .reply(200, {
        status: 'ok',
      });
    request(app)
      .post('/subscribe')
      .set('authorization', 'Bearer TOKEN')
      .set('accept-language', ACCEPT_LANG)
      .send({ newsletters: NEWSLETTERS })
      .expect(200, {
        status: 'ok',
      })
      .end(done);
  });

  it('passes through the source_url param if provided', function(done) {
    var EMAIL = 'test@example.com';
    var NEWSLETTERS = 'a,b,c';
    var SOURCE_URL = 'https://secure.example.com';
    mocks.mockOAuthResponse().reply(200, {
      user: UID,
      scope: ['basket'],
    });
    mocks.mockProfileResponse().reply(200, {
      email: EMAIL,
    });
    mocks
      .mockBasketResponse()
      .post('/subscribe/', function(body) {
        /*eslint-disable camelcase */
        assert.deepEqual(body, {
          email: EMAIL,
          newsletters: NEWSLETTERS,
          source_url: SOURCE_URL,
        });
        return true;
      })
      .reply(200, {
        status: 'ok',
      });
    request(app)
      .post('/subscribe')
      .set('authorization', 'Bearer TOKEN')
      /*eslint-disable camelcase */
      .send({
        newsletters: NEWSLETTERS,
        source_url: SOURCE_URL,
      })
      .expect(200, {
        status: 'ok',
      })
      .end(done);
  });
});
