/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import express from 'express';
import 'mocha';
import request from 'supertest';

import { loadBalancerRoutes, strictTransportSecurity } from '../../lib/middleware';
import { version } from '../../lib/version';

describe('loadBalancerRoutes', () => {
  const app = express();
  app.use(loadBalancerRoutes());

  it('returns version', () => {
    return request(app)
      .get('/__version__')
      .expect('Content-Type', /json/)
      .expect(200, version);
  });

  it('returns lbheartbeat', () => {
    return request(app)
      .get('/__lbheartbeat__')
      .expect('Content-Type', /json/)
      .expect(200, {});
  });

  it('returns heartbeat', () => {
    return request(app)
      .get('/__heartbeat__')
      .expect('Content-Type', /json/)
      .expect(200, { status: 'ok' });
  });

  it('returns heartbeat with healthchecks', () => {
    const app2 = express();
    app2.use(loadBalancerRoutes(async () => ({ additional: true })));
    return request(app2)
      .get('/__heartbeat__')
      .expect('Content-Type', /json/)
      .expect(200, { status: 'ok', additional: true });
  });

  it('returns heartbeat with erroring healthcheck', () => {
    const app2 = express();
    app2.use(
      loadBalancerRoutes(async () => {
        throw new Error('boom');
      })
    );
    return request(app2)
      .get('/__heartbeat__')
      .expect('Content-Type', /json/)
      .expect(200, { status: 'error' });
  });
});

describe('strictTransportSecurity', () => {
  const app = express();
  app.use(strictTransportSecurity);

  it('sets Strict-Transport-Header', () => {
    return request(app)
      .get('/')
      .expect('Strict-Transport-Security', /max-age=\d*; includeSubDomains/);
  });
});
