/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Middleware to take care of CSP. CSP headers are not sent unless config
// option 'csp.enabled' is set (default true).

import helmet from 'helmet';
import { Request, Response, NextFunction } from 'express';
import htmlOnly from './html-middleware';

export default function csp(config: { [key: string]: any }): Function {
  const cspMiddleware = helmet.contentSecurityPolicy(config.rules);

  return htmlOnly((req: Request, res: Response, next: NextFunction) => {
    cspMiddleware(req, res, next);
  });
}
