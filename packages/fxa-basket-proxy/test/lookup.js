/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var request = require('supertest');

var app = require('../lib/app')();

var mocks = require('./lib/mocks');


var UID = 'abcdef123456';


describe('the route /lookup-user', function () {

  it('forwards properly-authenticated requests through to basket', function (done) {
    var EMAIL = 'test@example.com';
    var TOKEN = 'abcdef123456';
    var NEWSLETTERS = 'a,b,c';
    mocks.mockOAuthResponse().reply(200, {
      user: UID,
      email: EMAIL,
      scope: 'basket:write'
    });
    mocks.mockBasketResponse().get('/lookup-user/').query({email: EMAIL}).reply(200, {
      status: 'ok',
      email: EMAIL,
      token: TOKEN,
      newsletters: NEWSLETTERS
    });
    request(app)
      .get('/lookup-user')
      .set('authorization', 'Bearer TOKEN')
      .expect(200, {
        status: 'ok',
        email: EMAIL,
        token: TOKEN,
        newsletters: NEWSLETTERS
      })
      .end(done);
  });

  it('returns an error if the basket server request errors out', function (done) {
    var EMAIL = 'test@example.com';
    mocks.mockOAuthResponse().reply(200, {
      user: UID,
      email: EMAIL,
      scope: 'basket:write'
    });
    mocks.mockBasketResponse().get('/lookup-user/').query({email: EMAIL})
      .replyWithError('ruh-roh!');
    request(app)
      .get('/lookup-user')
      .set('authorization', 'Bearer TOKEN')
      .expect('Content-Type', /json/)
      .expect(500, {
        status: 'error',
        code: 99,
        desc: 'Error: ruh-roh!'
      })
      .end(done);
  });

  it('returns an error if no credentials are provided', function (done) {
    request(app)
      .get('/lookup-user')
      .expect('Content-Type', /json/)
      .expect(400, {
        status: 'error',
        code: 5,
        desc: 'missing authorization header'
      })
      .end(done);
  });

  it('returns an error if invalid authn type is specified', function (done) {
    request(app)
      .get('/lookup-user')
      .set('authorization', 'Basic username:password')
      .expect('Content-Type', /json/)
      .expect(400, {
        status: 'error',
        code: 5,
        desc: 'invalid authorization header'
      })
      .end(done);
  });

  it('returns an error if the oauth token is invalid', function (done) {
    mocks.mockOAuthResponse().reply(401, {
      message: 'invalid assertion',
    });
    request(app)
      .get('/lookup-user')
      .set('authorization', 'Bearer TOKEN')
      .expect('Content-Type', /json/)
      .expect(401, {
        status: 'error',
        code: 7,
        desc: 'unauthorized'
      })
      .end(done);
  });

  it('returns an error if the oauth token has no associated email', function (done) {
    mocks.mockOAuthResponse().reply(200, {
      user: UID,
    });
    request(app)
      .get('/lookup-user')
      .set('authorization', 'Bearer TOKEN')
      .expect('Content-Type', /json/)
      .expect(400, {
        status: 'error',
        code: 7,
        desc: 'missing email'
      })
      .end(done);
  });

  it('returns an error if the oauth token has incorrect scope', function (done) {
    var EMAIL = 'test@example.com';
    mocks.mockOAuthResponse().reply(200, {
      user: UID,
      email: EMAIL,
      scope: 'profile'
    });
    request(app)
      .get('/lookup-user')
      .set('authorization', 'Bearer TOKEN')
      .expect('Content-Type', /json/)
      .expect(400, {
        status: 'error',
        code: 7,
        desc: 'invalid scope'
      })
      .end(done);
  });

  it('returns an error if the oauth server request errors out', function (done) {
    mocks.mockOAuthResponse().replyWithError('ruh-roh!');
    request(app)
      .get('/lookup-user')
      .set('authorization', 'Bearer TOKEN')
      .expect('Content-Type', /json/)
      .expect(500, {
        status: 'error',
        code: 99,
        desc: 'Error: ruh-roh!'
      })
      .end(done);
  });

});

