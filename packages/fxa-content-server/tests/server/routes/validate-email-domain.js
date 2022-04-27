/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { registerSuite } = intern.getInterface('object');
const assert = intern.getPlugin('chai').assert;
const path = require('path');
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const validateEmail = require('fxa-shared/email/validateEmail');

const ERROR_CODES = {
  NODATA: 'ENODATA',
  NOTFOUND: 'ENOTFOUND',
  SERVFAIL: 'ESERVFAIL',
};

registerSuite('routes/validate-email-domain', {
  tests: {
    'route interface is correct': () => {
      const validateEmailDomainRoute = require('../../../server/lib/routes/validate-email-domain');
      const route = validateEmailDomainRoute();
      assert.equal(route.method, 'get');
      assert.equal(route.path, '/validate-email-domain');
    },

    'route.process': {
      'responds with {result: "MX"} when there is a MX record': () => {
        const resolveMxStub = sinon
          .stub(validateEmail, 'tryResolveMx')
          .resolves(true);
        const validateEmailDomainRoute = proxyquire(
          path.join(
            process.cwd(),
            'server',
            'lib',
            'routes',
            'validate-email-domain'
          ),
          { tryResolveMx: resolveMxStub }
        );

        const req = { query: { domain: 'abc.xyz' } };
        const res = { json: sinon.stub() };
        const route = validateEmailDomainRoute({
          get: sinon.stub().returns(true),
        });

        return route.process(req, res).then(() => {
          assert.isTrue(resolveMxStub.calledOnceWith('abc.xyz'));
          assert.isTrue(res.json.calledOnceWith({ result: 'MX' }));
        });
      },
      'responds with {result: skip} when there is a skip record': () => {
        const validateEmailDomainRoute = require('../../../server/lib/routes/validate-email-domain');
        const req = { query: { domain: 'skip.abc.xyz' } };
        const res = { json: sinon.stub() };
        const route = validateEmailDomainRoute({
          get: sinon.stub().returns(false),
        });
        return route.process(req, res).then(() => {
          assert.isTrue(res.json.calledOnceWith({ result: 'skip' }));
        });
      },
      'responds with {result: "A"} when there is an A record': () => {
        validateEmail.tryResolveMx.restore();
        const resolveMxStub = sinon
          .stub(validateEmail, 'tryResolveMx')
          .resolves(false);
        const resolve4Stub = sinon
          .stub(validateEmail, 'tryResolveIpv4')
          .resolves(true);
        const validateEmailDomainRoute = proxyquire(
          path.join(
            process.cwd(),
            'server',
            'lib',
            'routes',
            'validate-email-domain'
          ),
          { tryResolveMx: resolveMxStub, tryResolveIpv4: resolve4Stub }
        );

        const req = { query: { domain: 'abc.xyz' } };
        const res = { json: sinon.stub() };
        const route = validateEmailDomainRoute({
          get: sinon.stub().returns(true),
        });

        return route.process(req, res).then(() => {
          assert.isTrue(resolveMxStub.calledOnceWith('abc.xyz'));
          assert.isTrue(resolve4Stub.calledOnceWith('abc.xyz'));
          assert.isTrue(res.json.calledOnceWith({ result: 'A' }));
        });
      },

      'responds with {result: "none"} when there are no DNS records': () => {
        validateEmail.tryResolveMx.restore();
        validateEmail.tryResolveIpv4.restore();
        const resolveMxStub = sinon
          .stub(validateEmail, 'tryResolveMx')
          .resolves(false);
        const resolve4Stub = sinon
          .stub(validateEmail, 'tryResolveIpv4')
          .resolves(false);
        const validateEmailDomainRoute = proxyquire(
          path.join(
            process.cwd(),
            'server',
            'lib',
            'routes',
            'validate-email-domain'
          ),
          { tryResolveMx: resolveMxStub, tryResolveIpv4: resolve4Stub }
        );

        const req = { query: { domain: 'abc.xyz' } };
        const res = { json: sinon.stub() };
        const route = validateEmailDomainRoute({
          get: sinon.stub().returns(true),
        });

        return route.process(req, res).then(() => {
          assert.isTrue(resolveMxStub.calledOnceWith('abc.xyz'));
          assert.isTrue(resolve4Stub.calledOnceWith('abc.xyz'));
          assert.isTrue(res.json.calledOnceWith({ result: 'none' }));
        });
      },

      'responds with {result: "none"} when resolve functions throw NODATA or NOTFOUND errors':
        () => {
          const resolveMxStub = sinon
            .stub()
            .rejects({ code: ERROR_CODES.NODATA });
          const resolve4Stub = sinon
            .stub()
            .rejects({ code: ERROR_CODES.NOTFOUND });
          const dns = {
            promises: {
              Resolver: function () {
                this.resolveMx = resolveMxStub;
                this.resolve4 = resolve4Stub;
              },
            },
          };

          const validateEmailDomainRoute = proxyquire(
            path.join(
              process.cwd(),
              'server',
              'lib',
              'routes',
              'validate-email-domain'
            ),
            {
              'fxa-shared/email/validateEmail': proxyquire(
                'fxa-shared/email/validateEmail',
                {
                  dns,
                }
              ),
            }
          );

          const req = { query: { domain: 'abc.xyz' } };
          const res = { json: sinon.stub() };
          const route = validateEmailDomainRoute({
            get: sinon.stub().returns('true'),
          });

          return route.process(req, res).then(() => {
            assert.isTrue(resolveMxStub.calledOnceWith('abc.xyz'));
            assert.isTrue(resolve4Stub.calledOnceWith('abc.xyz'));
            assert.isTrue(res.json.calledOnceWith({ result: 'none' }));
          });
        },

      'calls next() with an error when resolve functions throw a non- dns.* error ':
        () => {
          const error = { code: 'SOME_SERIOUS_ERROR!' };
          const resolveMxStub = sinon.stub().resolves([]);
          const resolve4Stub = sinon.stub().rejects(error);
          const dns = {
            promises: {
              Resolver: function () {
                this.resolveMx = resolveMxStub;
                this.resolve4 = resolve4Stub;
              },
            },
          };

          const validateEmailDomainRoute = proxyquire(
            path.join(
              process.cwd(),
              'server',
              'lib',
              'routes',
              'validate-email-domain'
            ),
            {
              'fxa-shared/email/validateEmail': proxyquire(
                'fxa-shared/email/validateEmail',
                {
                  dns,
                }
              ),
            }
          );

          const req = { query: { domain: 'abc.xyz' } };
          const res = { json: sinon.stub() };
          const next = sinon.stub();
          const route = validateEmailDomainRoute({
            get: sinon.stub().returns(true),
          });

          return route.process(req, res, next).then(() => {
            assert.isTrue(resolveMxStub.calledOnceWith('abc.xyz'));
            assert.isTrue(resolve4Stub.calledOnceWith('abc.xyz'));
            assert.isTrue(next.calledOnceWith(error));
          });
        },

      'calls next() with a wrapped error on a dns.* error, excluding NODATA and NOTFOUND':
        () => {
          const error = { code: ERROR_CODES.SERVFAIL };
          const resolveMxStub = sinon.stub().resolves([]);
          const resolve4Stub = sinon.stub().rejects(error);
          const dns = {
            promises: {
              Resolver: function () {
                this.resolveMx = resolveMxStub;
                this.resolve4 = resolve4Stub;
              },
            },
          };

          const validateEmailDomainRoute = proxyquire(
            path.join(
              process.cwd(),
              'server',
              'lib',
              'routes',
              'validate-email-domain'
            ),
            {
              'fxa-shared/email/validateEmail': proxyquire(
                'fxa-shared/email/validateEmail',
                {
                  dns,
                }
              ),
            }
          );

          const req = { query: { domain: 'abc.xyz' } };
          const res = { json: sinon.stub() };
          const next = sinon.stub();
          const route = validateEmailDomainRoute({
            get: sinon.stub().returns(true),
          });

          return route.process(req, res, next).then(() => {
            assert.isFalse(next.calledWith(error));
            assert.isTrue(next.calledOnce);
            assert.equal(
              next.args[0][0].message,
              `DNS query error: ${ERROR_CODES.SERVFAIL}`
            );
          });
        },
    },
  },
});
