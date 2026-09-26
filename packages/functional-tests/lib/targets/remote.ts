/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { BaseTarget } from './base';

export abstract class RemoteTarget extends BaseTarget {
  async clearRateLimits() {
    // no-op: We can't clear customs for smoke tests.
  }
}
