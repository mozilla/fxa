/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// We don't want the admin panel to be indexed by search engines.

import htmlOnly from './html-middleware';
import { Request, Response, NextFunction } from 'express';

export const noRobots = htmlOnly(
  (req: Request, res: Response, next: NextFunction) => {
    res.setHeader('X-Robots-Tag', 'noindex,nofollow');
    next();
  }
);
