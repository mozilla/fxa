/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const TestServer = require('../test_server');
const Client = require('../client')();
const P = require('../../lib/promise');
const hawk = require('hawk');
const request = P.promisify(require('request'), { multiArgs: true });

const config = require('../../config').getProperties();

describe('remote misc', function() {
  this.timeout(15000);
  let server;
  before(() => {
    return TestServer.start(config).then(s => {
      server = s;
    });
  });

  function testVersionRoute(route) {
    return () => {
      return request(config.publicUrl + route).spread((res, body) => {
        const json = JSON.parse(body);
        assert.deepEqual(Object.keys(json), ['version', 'commit', 'source']);
        assert.equal(
          json.version,
          require('../../package.json').version,
          'package version'
        );
        assert.ok(
          json.source && json.source !== 'unknown',
          'source repository'
        );

        // check that the git hash just looks like a hash
        assert.ok(
          json.commit.match(/^[0-9a-f]{40}$/),
          'The git hash actually looks like one'
        );
      });
    };
  }

  function testCORSHeader(withAllowedOrigin) {
    const randomAllowedOrigin =
      config.corsOrigin[Math.floor(Math.random() * config.corsOrigin.length)];
    const expectedOrigin = withAllowedOrigin ? randomAllowedOrigin : undefined;

    return () => {
      const options = {
        url: `${config.publicUrl}/`,
      };
      if (withAllowedOrigin !== undefined) {
        options.headers = {
          Origin: withAllowedOrigin ? randomAllowedOrigin : 'http://notallowed',
        };
      }
      return request(options).spread((res, body) => {
        assert.equal(
          res.headers['access-control-allow-origin'],
          expectedOrigin,
          'Access-Control-Allow-Origin header was set correctly'
        );
      });
    };
  }

  it('unsupported api version', () => {
    return request(`${config.publicUrl}/v0/account/create`).spread(res => {
      assert.equal(res.statusCode, 410, 'http gone');
    });
  });

  it('/__heartbeat__ returns a 200 OK', () => {
    return request(`${config.publicUrl}/__heartbeat__`).spread(res => {
      assert.equal(res.statusCode, 200, 'http ok');
    });
  });

  it('/__lbheartbeat__ returns a 200 OK', () => {
    return request(`${config.publicUrl}/__lbheartbeat__`).spread(res => {
      assert.equal(res.statusCode, 200, 'http ok');
    });
  });

  it('/ returns version, git hash and source repo', testVersionRoute('/'));

  it(
    '/__version__ returns version, git hash and source repo',
    testVersionRoute('/__version__')
  );

  it(
    'returns no Access-Control-Allow-Origin with no Origin set',
    testCORSHeader(undefined)
  );

  it(
    'returns correct Access-Control-Allow-Origin with whitelisted Origin',
    testCORSHeader(true)
  );

  it(
    'returns no Access-Control-Allow-Origin with not whitelisted Origin',
    testCORSHeader(false)
  );

  it('/verify_email redirects', () => {
    const path = '/v1/verify_email?code=0000&uid=0000';
    return request({
      url: config.publicUrl + path,
      followRedirect: false,
    }).spread((res, body) => {
      assert.equal(res.statusCode, 302, 'redirected');
      //assert.equal(res.headers.location, config.contentServer.url + path)
    });
  });

  it('/complete_reset_password redirects', () => {
    const path = '/v1/complete_reset_password?code=0000&email=a@b.c&token=0000';
    return request({
      url: config.publicUrl + path,
      followRedirect: false,
    }).spread((res, body) => {
      assert.equal(res.statusCode, 302, 'redirected');
      //assert.equal(res.headers.location, config.contentServer.url + path)
    });
  });

  it('timestamp header', () => {
    const email = server.uniqueEmail();
    const password = 'allyourbasearebelongtous';
    let url = null;
    let client = null;
    return Client.createAndVerify(
      config.publicUrl,
      email,
      password,
      server.mailbox
    )
      .then(c => {
        client = c;
        return client.login();
      })
      .then(() => {
        url = `${client.api.baseURL}/account/keys`;
        return client.api.Token.KeyFetchToken.fromHex(client.keyFetchToken);
      })
      .then(token => {
        const method = 'GET';
        const verify = {
          credentials: token,
          timestamp: Math.floor(Date.now() / 1000),
        };
        const headers = {
          Authorization: hawk.client.header(url, method, verify).header,
        };
        return request({
          method: method,
          url: url,
          headers: headers,
          json: true,
        }).spread((res, body) => {
          const now = +new Date() / 1000;
          assert.ok(res.headers.timestamp > now - 60, 'has timestamp header');
          assert.ok(res.headers.timestamp < now + 60, 'has timestamp header');
        });
      });
  });

  it('Strict-Transport-Security header', () => {
    return request({
      url: `${config.publicUrl}/`,
    }).spread((res, body) => {
      assert.equal(
        res.headers['strict-transport-security'],
        'max-age=31536000; includeSubDomains'
      );
    });
  });

  it('oversized payload', () => {
    const client = new Client(config.publicUrl);
    return client.api
      .doRequest(
        'POST',
        `${client.api.baseURL}/get_random_bytes`,
        null,
        // See payload.maxBytes in ../../server/server.js
        { big: Buffer.alloc(8192).toString('hex') }
      )
      .then(
        body => {
          assert(false, 'request should have failed');
        },
        err => {
          if (err.errno) {
            assert.equal(err.errno, 113, 'payload too large');
          } else {
            // nginx returns an html response
            assert.ok(
              /413 Request Entity Too Large/.test(err),
              'payload too large'
            );
          }
        }
      );
  });

  it('random bytes', () => {
    const client = new Client(config.publicUrl);
    return client.api.getRandomBytes().then(x => {
      assert.equal(x.data.length, 64);
    });
  });

  it('fetch /.well-known/browserid support document', () => {
    const client = new Client(config.publicUrl);
    function fetch(url) {
      return client.api.doRequest('GET', config.publicUrl + url);
    }
    return fetch('/.well-known/browserid').then(doc => {
      assert.ok(doc.hasOwnProperty('public-key'), 'doc has public key');
      assert.ok(/^[0-9]+$/.test(doc['public-key'].n), 'n is base 10');
      assert.ok(/^[0-9]+$/.test(doc['public-key'].e), 'e is base 10');
      assert.ok(doc.hasOwnProperty('authentication'), 'doc has auth page');
      assert.ok(
        doc.hasOwnProperty('provisioning'),
        'doc has provisioning page'
      );
      assert.equal(doc.keys.length, 1);
      return doc;
    });
  });

  it('fail on hawk payload mismatch', () => {
    const email = server.uniqueEmail();
    const password = 'allyourbasearebelongtous';
    let url = null;
    let client = null;
    return Client.createAndVerify(
      config.publicUrl,
      email,
      password,
      server.mailbox
    )
      .then(c => {
        client = c;
        return client.api.Token.SessionToken.fromHex(client.sessionToken);
      })
      .then(token => {
        url = `${client.api.baseURL}/account/device`;
        const method = 'POST';
        const payload = {
          name: 'my cool device',
          type: 'desktop',
        };
        const verify = {
          credentials: token,
          payload: JSON.stringify(payload),
          timestamp: Math.floor(Date.now() / 1000),
        };
        const headers = {
          Authorization: hawk.client.header(url, method, verify).header,
        };
        payload.name = 'my stealthily-changed device name';
        return request({
          method: method,
          url: url,
          headers: headers,
          body: JSON.stringify(payload),
        }).spread(res => {
          const body = JSON.parse(res.body);
          assert.equal(res.statusCode, 401, 'the request was rejected');
          assert.equal(
            body.errno,
            109,
            'the errno indicates an invalid signature'
          );
        });
      });
  });

  after(() => {
    return TestServer.stop(server);
  });
});
