/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';
import { FirestoreAdapter } from './type-cachable-firestore-adapter';
import { Firestore } from '@google-cloud/firestore';

describe('FirestoreAdapter', () => {
  let firestoreAdapter: FirestoreAdapter;
  let getSpy: jest.Mock;
  let setSpy: jest.Mock;
  let deleteSpy: jest.Mock;

  beforeEach(() => {
    const store: Record<string, any> = {};
    getSpy = jest.fn().mockImplementation((docName) => {
      return {
        data: () => store[docName],
      };
    });
    setSpy = jest.fn().mockImplementation((docName, value) => {
      store[docName] = value;
    });
    deleteSpy = jest.fn().mockImplementation((docName) => {
      delete store[docName];
    });
    firestoreAdapter = new FirestoreAdapter(
      {
        collection: jest.fn().mockReturnThis(),
        doc: jest.fn().mockImplementation((docName) => {
          return {
            get: (...args: any[]) => getSpy(docName, ...args),
            set: (...args: any[]) => setSpy(docName, ...args),
            delete: (...args: any[]) => deleteSpy(docName, ...args),
          };
        }),
      } as unknown as Firestore,
      faker.string.uuid()
    );
  });

  it('should return undefined if the key does not exist', async () => {
    const key = faker.string.uuid();
    const result = await firestoreAdapter.get(key);

    expect(result).toBeUndefined();
  });

  it('should return the value if the key exists and has not expired', async () => {
    const key = faker.string.uuid();
    const value = faker.string.uuid();
    await firestoreAdapter.set(key, value);

    const result = await firestoreAdapter.get(key);

    expect(result).toEqual(value);
  });

  it('should return undefined if the key exists but has expired', async () => {
    const key = faker.string.uuid();
    const value = faker.string.uuid();
    await firestoreAdapter.set(key, value, -1);

    const result = await firestoreAdapter.get(key);

    expect(result).toBeUndefined();
  });

  it('should delete a key', async () => {
    const key = faker.string.uuid();
    const value = faker.string.uuid();
    await firestoreAdapter.set(key, value);

    await firestoreAdapter.del(key);

    const result = await firestoreAdapter.get(key);

    expect(result).toBeUndefined();
  });
});
