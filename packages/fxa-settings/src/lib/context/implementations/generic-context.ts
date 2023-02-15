/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { BaseContext } from './base-context';

/**
 * A simple generic context implementation. Good for testing or simple state management.
 * Stores state in record object.
 */
export class GenericContext extends BaseContext {
  constructor(protected readonly state: Record<string, unknown>) {
    super();
  }

  public getKeys() {
    return Object.keys(this.state);
  }

  public get(key: string) {
    return this.state[key];
  }

  public set(key: string, value: unknown) {
    this.state[key] = value;
  }
}
