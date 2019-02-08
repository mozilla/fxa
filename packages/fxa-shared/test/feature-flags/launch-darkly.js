/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const proxyquire = require('proxyquire').noCallThru();
const sinon = require('sinon');

describe('feature-flags/launch-darkly:', () => {
  let response, request, initialise, origSetTimeout;

  beforeEach(() => {
    origSetTimeout = setTimeout;
    // eslint-disable-next-line no-global-assign
    setTimeout = sinon.spy();
    request = sinon.spy(() => {
      if (response.isError) {
        return Promise.reject(response);
      }
      return Promise.resolve(response);
    });
    initialise = proxyquire('../../feature-flags/launch-darkly', {
      'request-promise': request
    });
  });

  afterEach(() => {
    // eslint-disable-next-line no-global-assign
    setTimeout = origSetTimeout;
  });

  it('returned the expected interface', () => {
    assert.isFunction(initialise);
    assert.lengthOf(initialise, 1);
  });

  it('does not throw if config is valid', () => {
    assert.doesNotThrow(() => initialise({
      accessToken: 'foo',
      projectKey: 'bar',
      redis: {
        enabled: true,
        host: '127.0.0.1',
        port: 6379,
        prefix: 'featureFlags:'
      }
    }));
  });

  it('throws if config is missing', () => {
    assert.throws(() => initialise());
  });

  it('throws if redis settings aren\'t set', () => {
    assert.throws(() => initialise({
      accessToken: 'foo',
      projectKey: 'bar'
    }));
  });

  describe('initialise:', () => {
    let launchDarkly;

    beforeEach(() => {
      launchDarkly = initialise({
        accessToken: 'foo',
        projectKey: 'bar',
        redis: {
          enabled: true,
          host: '127.0.0.1',
          port: 6379,
          prefix: 'featureFlags:'
        }
      });
    });

    it('returned the expected interface', () => {
      assert.isObject(launchDarkly);
      assert.isFunction(launchDarkly.get);
      assert.lengthOf(launchDarkly.get, 0);
    });

    it('did not call request', () => {
      assert.equal(request.callCount, 0);
    });

    describe('get with successful request:', () => {
      let result;

      beforeEach(async () => {
        response = JSON.stringify({
          items: [
            {
              environments: {
                [process.env.NODE_ENV]: {
                  on: true
                }
              },
              key: 'foo',
              variations: [
                { value: true },
                { value: false }
              ]
            },
            {
              environments: {
                [process.env.NODE_ENV]: {
                  on: false
                }
              },
              key: 'bar',
              variations: [
                { value: '{"wibble":"blee"}' },
                { value: '{"blee":"wibble"}' }
              ]
            }
          ]
        });
        result = await launchDarkly.get();
      });

      it('returned the response body', () => {
        assert.deepEqual(result, {
          foo: true,
          bar: {
            blee: 'wibble'
          }
        });
      });

      it('called request correctly', () => {
        assert.equal(request.callCount, 1);
        const args = request.args[0];
        assert.lengthOf(args, 2);
        assert.equal(args[0], `https://app.launchdarkly.com/api/v2/flags/bar?env=${process.env.NODE_ENV}`);
        assert.deepEqual(args[1], {
          simple: true,
          method: 'GET',
          headers: {
            authorization: 'foo'
          }
        });
      });
    });

    [ 400, 401, 409 ].forEach(statusCode => {
      describe(`get with ${statusCode} response:`, () => {
        let error;

        beforeEach(() => {
          response = {
            isError: true,
            statusCode,
            headers: {
              'retry-after': 10,
              'x-ratelimit-reset': Date.now() + 2000
            }
          };
          return launchDarkly.get().then(() => {}, e => error = e);
        });

        it('rejected', () => {
          assert.equal(error, response);
        });

        it('called request', () => {
          assert.equal(request.callCount, 1);
        });

        it('did not call setTimeout', () => {
          assert.equal(setTimeout.callCount, 0);
        });
      });
    });

    describe('get with 429 response and Retry-After header:', () => {
      let completed, result, error;

      beforeEach(done => {
        response = {
          isError: true,
          statusCode: 429,
          headers: {
            'retry-after': 10,
            'x-ratelimit-reset': Date.now() + 2000
          }
        };
        completed = false;
        launchDarkly.get().then(r => {
          completed = true;
          result = r;
        }, e => {
          completed = true;
          error = e;
        });
        setImmediate(done);
      });

      it('did not complete', () => {
        assert.isFalse(completed);
      });

      it('called request', () => {
        assert.equal(request.callCount, 1);
      });

      it('called setTimeout correctly', () => {
        assert.equal(setTimeout.callCount, 1);
        const args = setTimeout.args[0];
        assert.lengthOf(args, 2);
        assert.isFunction(args[0]);
        assert.equal(args[1], 10000);
      });

      describe('retry successfully:', () => {
        beforeEach(done => {
          response = JSON.stringify({
            items: [
              {
                environments: {
                  [process.env.NODE_ENV]: {
                    on: false
                  }
                },
                key: 'foo',
                variations: [
                  { value: true },
                  { value: false }
                ]
              }
            ]
          });
          setTimeout.args[0][0]();
          setImmediate(done);
        });

        it('resolved', () => {
          assert.isTrue(completed);
          assert.deepEqual(result, {
            foo: false
          });
        });

        it('called request', () => {
          assert.equal(request.callCount, 2);
        });

        it('did not call setTimeout', () => {
          assert.equal(setTimeout.callCount, 1);
        });
      });

      describe('retry unsuccessfully:', () => {
        beforeEach(done => {
          setTimeout.args[0][0]();
          setImmediate(done);
        });

        it('did not complete', () => {
          assert.isFalse(completed);
        });

        it('called request', () => {
          assert.equal(request.callCount, 2);
        });

        it('called setTimeout', () => {
          assert.equal(setTimeout.callCount, 2);
        });

        describe('retry unsuccessfully:', () => {
          beforeEach(done => {
            setTimeout.args[1][0]();
            setImmediate(done);
          });

          it('did not complete', () => {
            assert.isFalse(completed);
          });

          it('called request', () => {
            assert.equal(request.callCount, 3);
          });

          it('called setTimeout', () => {
            assert.equal(setTimeout.callCount, 3);
          });

          describe('retry unsuccessfully:', () => {
            beforeEach(done => {
              setTimeout.args[2][0]();
              setImmediate(done);
            });

            it('rejected', () => {
              assert.isTrue(completed);
              assert.equal(error, response);
            });

            it('called request', () => {
              assert.equal(request.callCount, 4);
            });

            it('did not call setTimeout', () => {
              assert.equal(setTimeout.callCount, 3);
            });
          });
        });
      });
    });

    describe('get with 429 response and X-Ratelimit-Reset header:', () => {
      let completed;

      beforeEach(done => {
        response = {
          isError: true,
          statusCode: 429,
          headers: {
            'x-ratelimit-reset': Date.now() + 2000
          }
        };
        completed = false;
        launchDarkly.get().then(() => completed = true, () => completed = true);
        setImmediate(done);
      });

      it('did not complete', () => {
        assert.isFalse(completed);
      });

      it('called request', () => {
        assert.equal(request.callCount, 1);
      });

      it('called setTimeout correctly', () => {
        assert.equal(setTimeout.callCount, 1);
        const args = setTimeout.args[0];
        assert.lengthOf(args, 2);
        assert.isFunction(args[0]);
        assert.isAbove(args[1], 1000);
        assert.isAtMost(args[1], 2000);
      });
    });

    describe('get with 500 response:', () => {
      let error;

      beforeEach(() => {
        response = {
          isError: true,
          statusCode: 500,
          headers: {
            'retry-after': 10,
            'x-ratelimit-reset': Date.now() + 2000
          }
        };
        return launchDarkly.get().then(() => {}, e => error = e);
      });

      it('rejected', () => {
        assert.equal(error, response);
      });

      it('called request four times', () => {
        assert.equal(request.callCount, 4);
      });

      it('did not call setTimeout', () => {
        assert.equal(setTimeout.callCount, 0);
      });
    });
  });
});
