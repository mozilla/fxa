/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * A context is abstraction for key value store that can hold an arbitrary state.
 */
export interface ModelContext {
  getKeys(): Iterable<string>;
  get(key: string): unknown;
  set(key: string, val: unknown): void;

  // For some contexts it is inefficient to write directly to the underlying store. These
  // contexts require periodic synchronization via load and persist
  requiresSync(): boolean;
  load(): void;
  persist(): void;
}
