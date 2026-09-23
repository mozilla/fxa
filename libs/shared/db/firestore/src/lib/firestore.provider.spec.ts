/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Firestore } from '@google-cloud/firestore';

import { createFirestore } from './firestore.provider';

jest.mock('@google-cloud/firestore', () => ({
  Firestore: jest.fn(),
}));

describe('createFirestore', () => {
  const originalEmulatorHost = process.env['FIRESTORE_EMULATOR_HOST'];

  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env['FIRESTORE_EMULATOR_HOST'];
  });

  afterAll(() => {
    if (originalEmulatorHost !== undefined) {
      process.env['FIRESTORE_EMULATOR_HOST'] = originalEmulatorHost;
    }
  });

  it('passes databaseId and mapped credentials to Firestore', () => {
    createFirestore({
      projectId: 'project',
      databaseId: 'entitlements',
      credentials: { clientEmail: 'sa@example.com', privateKey: 'key' },
    });

    expect(Firestore).toHaveBeenCalledWith({
      projectId: 'project',
      databaseId: 'entitlements',
      credentials: { client_email: 'sa@example.com', private_key: 'key' },
    });
  });

  it('prefers keyFilename over credentials', () => {
    createFirestore({
      databaseId: 'entitlements',
      keyFilename: '/path/key.json',
      credentials: { clientEmail: 'sa@example.com', privateKey: 'key' },
    });

    expect(Firestore).toHaveBeenCalledWith({
      databaseId: 'entitlements',
      keyFilename: '/path/key.json',
    });
  });

  it('connects to the emulator default database when no credentials are configured', () => {
    createFirestore({ databaseId: 'entitlements' });

    const [settings] = (Firestore as unknown as jest.Mock).mock.calls[0];
    expect(settings.projectId).toBe('demo-fxa');
    expect(settings.databaseId).toBeUndefined();
  });
});
