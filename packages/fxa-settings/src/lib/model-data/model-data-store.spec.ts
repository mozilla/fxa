/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import {
  ModelDataStore,
  RawData,
  convertToDataStore,
} from './model-data-store';

class TestModelData extends ModelDataStore {
  getKeys(): Iterable<string> {
    return Object.keys(this.dataStore);
  }
  get(key: string): RawData {
    return this.dataStore[key];
  }
  set(key: string, val: RawData): void {
    this.dataStore[key] = val;
  }

  constructor(public readonly dataStore: Record<string, RawData> = {}) {
    super();
  }
}

describe('model-data', function () {
  let model: TestModelData;

  beforeEach(() => {
    model = new TestModelData();
  });

  it('creates', () => {
    expect(model).toBeDefined();
  });

  it('is empty by default', () => {
    expect(model.getKeys()).toEqual([]);
  });

  it('sets ands gets', () => {
    model.set('foo', 'bar');
    expect(model.get('foo')).toEqual('bar');
    expect(model.getKeys()).toEqual(['foo']);
  });

  it('converts to json', () => {
    model.set('foo', 'bar');
    expect(model.toJSON()).toEqual('{"foo":"bar"}');
  });

  it('loads from json', () => {
    model.fromJSON('{"foo":"bar"}');
    expect(model.get('foo')).toEqual('bar');
    expect(model.getKeys()).toEqual(['foo']);
  });

  it('converts to data store', () => {
    const data = convertToDataStore({ foo: { bar: 'baz' } });
    expect(data.foo).toEqual('{"bar":"baz"}');
  });
});
