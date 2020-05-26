/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import onHeaders from 'on-headers';
import { Request, Response, NextFunction } from 'express';
const noOp = () => {};

export default function (middleware: Function): Function {
  return (req: Request, res: Response, next: NextFunction) => {
    onHeaders(res, () => {
      const contentType = res.getHeader('content-type') || 'html';
      if (typeof contentType === 'string' && /html/.test(contentType)) {
        // noOp is used as the "next" middleware since next
        // has already been called.
        middleware(req, res, noOp);
      }
    });
    // call next immediately so that rendering occurs
    // and the content-type set
    next();
  };
}
