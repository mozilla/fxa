/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const ScopeSet = require('fxa-shared').oauth.scopes;

const TOKEN =
  'df6dcfe7bf6b54a65db5742cbcdce5c0a84a5da81a0bb6bdf5fc793eef041fc6';

function joiRequired(err: any, param: string) {
  expect(err.isJoi).toBe(true);
  expect(err.name).toBe('ValidationError');
  expect(err.details[0].message).toBe(`"${param}" is required`);
}

describe('/verify POST', () => {
  let mocks: any;
  let route: any;

  beforeAll(() => {
    mocks = {
      log: {
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
      },
      token: {
        verify: jest.fn(async () => ({
          client_id: 'foo',
          scope: ScopeSet.fromArray(['bar:foo', 'clients:write']),
          user: 'bar',
        })),
      },
      glean: {
        oauth: { tokenChecked: jest.fn() },
      },
    };

    jest.resetModules();
    jest.doMock('../../oauth/token', () => mocks.token);
    route = require('./verify')({ log: mocks.log, glean: mocks.glean });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validation', () => {
    function validate(req: any, context = {}) {
      const validationSchema = route.config.validate.payload;
      const result = validationSchema.validate(req, {
        context,
      });
      return result.error;
    }

    it('fails with no token', () => {
      const err = validate({
        token: undefined,
      });
      joiRequired(err, 'token');
    });

    it('no validation errors', () => {
      const err = validate({
        token: TOKEN,
      });
      expect(err).toBeUndefined();
    });
  });

  describe('handler', () => {
    let req: any;
    let resp: any;

    beforeEach(async () => {
      req = {
        payload: {
          token: TOKEN,
        },
        emitMetricsEvent: jest.fn(),
      };
      resp = await route.config.handler(req);
    });

    it('returns the expected response', () => {
      expect(resp.client_id).toBe('foo');
      expect(resp.user).toBe('bar');
      expect(resp.scope).toEqual(['bar:foo', 'clients:write']);
    });

    it('verifies the token', () => {
      expect(mocks.token.verify).toHaveBeenCalledWith(TOKEN);
    });

    it('logs an amplitude event', () => {
      expect(req.emitMetricsEvent).toHaveBeenCalledWith('verify.success', {
        service: 'foo',
        uid: 'bar',
      });
    });

    it('logs a Glean event', () => {
      expect(mocks.glean.oauth.tokenChecked).toHaveBeenCalledTimes(1);
      expect(mocks.glean.oauth.tokenChecked).toHaveBeenCalledWith(req, {
        uid: 'bar',
        oauthClientId: 'foo',
        scopes: ['bar:foo', 'clients:write'],
      });
    });
  });
});
