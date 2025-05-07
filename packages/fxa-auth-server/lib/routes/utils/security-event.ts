/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { AccountEventsManager } from '../../account-events';
import { Container } from 'typedi';

export function recordSecurityEvent(name: any, opts: any) {
  const mgr = Container.get(AccountEventsManager);
  if (mgr == null || typeof mgr.recordSecurityEvent !== 'function') {
    return;
  }

  mgr.recordSecurityEvent(opts.db, {
    name,
    uid: opts?.account?.uid || opts?.request?.auth?.credentials?.uid,
    ipAddr: opts?.request?.app?.clientAddress,
    tokenId: opts?.request?.auth?.credentials?.id,
    additionalInfo: {
      userAgent: opts?.request.headers['user-agent'],
      location: opts?.request.app.geo.location,
    },
  });
}
