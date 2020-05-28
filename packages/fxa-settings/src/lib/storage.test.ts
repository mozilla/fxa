/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import NullStorage from './null-storage';
import Storage, { StorageError } from './storage';

let storage: Storage;
let nullStorage: NullStorage;

beforeEach(() => {
  nullStorage = new NullStorage();
  storage = new Storage(nullStorage);
});

afterEach(() => {
  storage.clear();
});

function generateAccessDenied() {
  const lsError = new Error('access denied');
  lsError.name = 'NS_ERROR_FILE_ACCESS_DENIED';

  throw lsError;
}

describe('get/set', () => {
  it('can take a key value pair', () => {
    storage.set('key', 'value');
    expect(storage.get('key')).toStrictEqual('value');
  });

  it('can take object values', () => {
    storage.set('key', { foo: 'bar' });
    expect(storage.get('key').foo).toStrictEqual('bar');
  });

  it('can take null values', () => {
    storage.set('key', null);
    expect(storage.get('key')).toBeNull();
  });

  it('can take falsey values', () => {
    storage.set('key', '');
    expect(storage.get('key')).toStrictEqual('');
  });

  it('returns undefined if the backend/parsing fails', () => {
    storage.set('key', 'value');
    jest.spyOn(nullStorage, 'getItem').mockReturnValue('not stringified JSON');
    expect(storage.get('key')).toBeUndefined();
    expect(nullStorage.getItem).toHaveBeenCalled();
  });
});

describe('remove', () => {
  it('with a key clears item', () => {
    storage.set('key', 'value');
    storage.remove('key');

    expect(storage.get('key')).toBeUndefined();
  });
});

describe('clear', () => {
  it('clears all items', () => {
    storage.set('key', 'value');
    storage.clear();

    expect(storage.get('key')).toBeUndefined();
  });
});

describe('testLocalStorage', () => {
  describe('if localStorage cannot be accessed', () => {
    let err: StorageError;

    beforeEach(() => {
      jest
        .spyOn(window.localStorage.__proto__, 'setItem')
        .mockImplementationOnce(generateAccessDenied);

      try {
        Storage.testLocalStorage(globalThis.window);
      } catch (e) {
        err = e;
      }
    });

    it('throws a normalized error', () => {
      expect(err.context).toStrictEqual('storage');
      expect(err.errno).toStrictEqual('NS_ERROR_FILE_ACCESS_DENIED');
      expect(err.namespace).toStrictEqual('localStorage');
    });
  });

  describe('if localStorage access is allowed', () => {
    it('succeeds', () => {
      Storage.testLocalStorage(globalThis.window);
    });
  });
});

describe('testSessionStorage', () => {
  describe('if sessionStorage cannot be accessed', () => {
    let err: StorageError;

    beforeEach(() => {
      jest
        .spyOn(window.localStorage.__proto__, 'setItem')
        .mockImplementationOnce(generateAccessDenied);

      try {
        Storage.testSessionStorage(globalThis.window);
      } catch (e) {
        err = e;
      }
    });

    it('throws a normalized error', () => {
      expect(err.context).toStrictEqual('storage');
      expect(err.errno).toStrictEqual('NS_ERROR_FILE_ACCESS_DENIED');
      expect(err.namespace).toStrictEqual('sessionStorage');
    });
  });

  describe('if sessionStorage access is allowed', () => {
    it('succeeds', () => {
      Storage.testSessionStorage(globalThis.window);
    });
  });
});

describe('factory', () => {
  it('creates localStorage instance', () => {
    jest.spyOn(window.localStorage.__proto__, 'setItem');

    const store = Storage.factory('localStorage', globalThis.window);
    store.set('foo', 'bar');
    expect(window.localStorage.setItem).toHaveBeenCalled();
  });

  it('creates sessionStorage instance', () => {
    jest.spyOn(window.localStorage.__proto__, 'setItem');

    const store = Storage.factory('sessionStorage', globalThis.window);
    store.set('foo', 'bar');
    expect(window.localStorage.setItem).toHaveBeenCalled();
  });

  it('creates null storage instance otherwise', () => {
    const store = Storage.factory(null, globalThis.window);
    store.set('foo', 'bar');

    expect(store.get('foo')).toStrictEqual('bar');
  });
});
