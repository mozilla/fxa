/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Config from '../config';
import { Request, Response, Router } from 'express';

import { version } from './version';

export type HealthExtras = {
  [key: string]: string | number | boolean | HealthExtras;
};

export function loadBalancerRoutes(healthExtras?: () => Promise<HealthExtras>): Router {
  const router = Router();

  router.get('/__version__', (_: Request, res: Response) => {
    res.json(version).status(200);
  });

  router.get('/__lbheartbeat__', (_: Request, res: Response) => {
    res.json({}).status(200);
  });

  router.get('/__heartbeat__', async (_: Request, res: Response) => {
    let healthExtra: HealthExtras;
    let status = 200;
    try {
      healthExtra = (await healthExtras?.()) ?? {};
    } catch (err) {
      status = 500;
      healthExtra = typeof err.healthExtra === 'object' ? err.healthExtra : {};
    }
    res.json({ status: status === 200 ? 'ok' : 'error', ...healthExtra }).status(status);
  });

  return router;
}

export function strictTransportSecurity(_: Request, res: Response, next: () => void) {
  if (Config.get('hstsEnabled')) {
    res.header(
      'Strict-Transport-Security',
      `max-age=${Config.get('hstsMaxAge')}; includeSubDomains`
    );
  }

  next();
}
