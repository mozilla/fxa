/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ModelDataStore, RawData } from '../model-data-store';

/**
 * A simple generic data store. Good for testing or simple state management.
 * Stores state in record object.
 */
export class GenericData extends ModelDataStore {
  constructor(protected readonly state: Record<string, RawData>) {
    super();
    this.checkDataStore();
  }

  public getKeys(): Iterable<string> {
    return Object.keys(this.state);
  }

  public get(key: string): RawData {
    return this.state[key];
  }

  public set(key: string, value: RawData): void {
    this.state[key] = value;
  }
}

export function queryStringToGenericData(query: string) {
  const urlParams = new URLSearchParams(query);

  const map: Record<string, string> = {};
  for (const val of urlParams.entries()) {
    map[val[0]] = val[1];
  }

  return new GenericData(map);
}
