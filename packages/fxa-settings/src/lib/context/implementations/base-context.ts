/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ModelContext } from '..';

/**
 * Abstract base class for Context type classes
 */
export abstract class BaseContext implements ModelContext {
  abstract getKeys(): Iterable<string>;
  abstract get(key: string): unknown;
  abstract set(key: string, val: unknown): void;

  requiresSync(): boolean {
    return false;
  }

  load() {
    // no-op
  }

  persist() {
    // no-op
  }
}
