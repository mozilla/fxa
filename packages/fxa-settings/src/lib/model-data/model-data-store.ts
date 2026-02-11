/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/** Type of data allowed in store */
export type RawData = string | undefined;

/** Holds data in valid format */
export type DataStore = Record<string, RawData>;

/**
 * Ensures that data is in correct format. Records must be of type Record<string, RawData>, however, it's possible
 * this eludes type checking. This function ensures that the data is in the correct format.
 * @param data
 */
export function convertToDataStore(data: Record<string, any>): DataStore {
  const clone = JSON.parse(JSON.stringify(data));
  for (const k in clone) {
    if (typeof clone[k] === 'object') {
      clone[k] = JSON.stringify(data[k]);
    } else {
      clone[k] = clone[k].toString();
    }
  }
  return clone;
}

/**
 * Abstract base class for model data store classes
 */
export abstract class ModelDataStore {
  abstract getKeys(): Iterable<string>;
  abstract get(key: string): RawData;
  abstract set(key: string, val: RawData): void;

  requiresSync(): boolean {
    return false;
  }

  load() {
    // no-op
  }

  persist() {
    // no-op
  }

  toJSON() {
    const temp: Record<string, unknown> = {};
    for (const key of this.getKeys()) {
      temp[key] = this.get(key);
    }
    return JSON.stringify(temp);
  }

  fromJSON(json: string) {
    const parsed = JSON.parse(json);
    Object.keys(parsed).forEach((key) => {
      this.set(key, parsed[key]);
    });
  }

  getDataStore(): DataStore {
    const dataStore: DataStore = {};
    for (const key of this.getKeys()) {
      dataStore[key] = this.get(key);
    }
    return dataStore;
  }

  async synchronized() {
    // no-op - used for data stores that have async setters
  }

  checkDataStore() {
    for (const key of this.getKeys()) {
      const value = this.get(key);
      if (value !== undefined && typeof value !== 'string') {
        throw new Error(
          'GenericData must of type Record<string, RawData>. Try calling convertToDataStore() on your data before passing it to GenericData.'
        );
      }
    }
  }
}
