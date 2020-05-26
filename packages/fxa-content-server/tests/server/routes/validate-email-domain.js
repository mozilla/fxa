/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { registerSuite } = intern.getInterface('object');
const assert = intern.getPlugin('chai').assert;
const path = require('path');
const proxyquire = require('proxyquire');
const sinon = require('sinon');

const ERROR_CODES = {
  NODATA: 'ENODATA',
  NOTFOUND: 'ENOTFOUND',
  SERVFAIL: 'ESERVFAIL',
};

const proxyquireWithDns = (dns) =>
  proxyquire(
    path.join(
      process.cwd(),
      'server',
      'lib',
      'routes',
      'validate-email-domain'
    ),
    { dns }
  );

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
        const resolveMxStub = sinon.stub().resolves(['mx.abc.xyz']);
        const dns = {
          ...ERROR_CODES,
          promises: {
            Resolver: function () {
              this.resolveMx = resolveMxStub;
            },
          },
        };

        const validateEmailDomainRoute = proxyquireWithDns(dns);
        const req = { query: { domain: 'abc.xyz' } };
        const res = { json: sinon.stub() };
        const route = validateEmailDomainRoute();

        return route.process(req, res).then(() => {
          assert.isTrue(resolveMxStub.calledOnceWith('abc.xyz'));
          assert.isTrue(res.json.calledOnceWith({ result: 'MX' }));
        });
      },

      'responds with {result: "A"} when there is an A record': () => {
        const resolveMxStub = sinon.stub().resolves([]);
        const resolve4Stub = sinon.stub().resolves(['abc.xyz']);
        const dns = {
          ...ERROR_CODES,
          promises: {
            Resolver: function () {
              this.resolveMx = resolveMxStub;
              this.resolve4 = resolve4Stub;
            },
          },
        };

        const validateEmailDomainRoute = proxyquireWithDns(dns);
        const req = { query: { domain: 'abc.xyz' } };
        const res = { json: sinon.stub() };
        const route = validateEmailDomainRoute();

        return route.process(req, res).then(() => {
          assert.isTrue(resolveMxStub.calledOnceWith('abc.xyz'));
          assert.isTrue(resolve4Stub.calledOnceWith('abc.xyz'));
          assert.isTrue(res.json.calledOnceWith({ result: 'A' }));
        });
      },

      'responds with {result: "none"} when there are no DNS records': () => {
        const resolveMxStub = sinon.stub().resolves([]);
        const resolve4Stub = sinon.stub().resolves([]);
        const dns = {
          ...ERROR_CODES,
          promises: {
            Resolver: function () {
              this.resolveMx = resolveMxStub;
              this.resolve4 = resolve4Stub;
            },
          },
        };

        const validateEmailDomainRoute = proxyquireWithDns(dns);
        const req = { query: { domain: 'abc.xyz' } };
        const res = { json: sinon.stub() };
        const route = validateEmailDomainRoute();

        return route.process(req, res).then(() => {
          assert.isTrue(resolveMxStub.calledOnceWith('abc.xyz'));
          assert.isTrue(resolve4Stub.calledOnceWith('abc.xyz'));
          assert.isTrue(res.json.calledOnceWith({ result: 'none' }));
        });
      },

      'responds with {result: "none"} when resolve functions throw NODATA or NOTFOUND errors': () => {
        const resolveMxStub = sinon
          .stub()
          .rejects({ code: ERROR_CODES.NODATA });
        const resolve4Stub = sinon
          .stub()
          .rejects({ code: ERROR_CODES.NOTFOUND });
        const dns = {
          ...ERROR_CODES,
          promises: {
            Resolver: function () {
              this.resolveMx = resolveMxStub;
              this.resolve4 = resolve4Stub;
            },
          },
        };

        const validateEmailDomainRoute = proxyquireWithDns(dns);
        const req = { query: { domain: 'abc.xyz' } };
        const res = { json: sinon.stub() };
        const route = validateEmailDomainRoute();

        return route.process(req, res).then(() => {
          assert.isTrue(resolveMxStub.calledOnceWith('abc.xyz'));
          assert.isTrue(resolve4Stub.calledOnceWith('abc.xyz'));
          assert.isTrue(res.json.calledOnceWith({ result: 'none' }));
        });
      },

      'calls next() with an error when resolve functions throw a non- dns.* error ': () => {
        const error = { code: 'SOME_SERIOUS_ERROR!' };
        const resolveMxStub = sinon.stub().resolves([]);
        const resolve4Stub = sinon.stub().rejects(error);
        const dns = {
          ...ERROR_CODES,
          promises: {
            Resolver: function () {
              this.resolveMx = resolveMxStub;
              this.resolve4 = resolve4Stub;
            },
          },
        };

        const validateEmailDomainRoute = proxyquireWithDns(dns);
        const req = { query: { domain: 'abc.xyz' } };
        const res = { json: sinon.stub() };
        const next = sinon.stub();
        const route = validateEmailDomainRoute();

        return route.process(req, res, next).then(() => {
          assert.isTrue(resolveMxStub.calledOnceWith('abc.xyz'));
          assert.isTrue(resolve4Stub.calledOnceWith('abc.xyz'));
          assert.isTrue(next.calledOnceWith(error));
        });
      },

      'calls next() with a wrapped error on a dns.* error, excluding NODATA and NOTFOUND': () => {
        const error = { code: ERROR_CODES.SERVFAIL };
        const resolveMxStub = sinon.stub().resolves([]);
        const resolve4Stub = sinon.stub().rejects(error);
        const dns = {
          ...ERROR_CODES,
          promises: {
            Resolver: function () {
              this.resolveMx = resolveMxStub;
              this.resolve4 = resolve4Stub;
            },
          },
        };

        const validateEmailDomainRoute = proxyquireWithDns(dns);
        const req = { query: { domain: 'abc.xyz' } };
        const res = { json: sinon.stub() };
        const next = sinon.stub();
        const route = validateEmailDomainRoute();

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
