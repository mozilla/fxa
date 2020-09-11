/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Firestore } from '@google-cloud/firestore';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { v4 as uuid4 } from 'uuid';

import { ClientWebhooks } from '../client-webhooks/client-webhooks.interface';
import { FirestoreService } from './firestore.service';

// Set the env var to use the emulator
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:9090';

describe('FirestoreService', () => {
  let fs: Firestore;
  let service: FirestoreService;
  let uid1: string;
  let uid2: string;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          load: [
            () => ({
              env: 'development',
              firestore: {
                prefix: 'fxatest-',
              },
            }),
          ],
        }),
      ],
      providers: [FirestoreService],
    }).compile();

    service = module.get<FirestoreService>(FirestoreService);
    fs = (service as any).db;
    uid1 = 'uid_' + uuid4();
    uid2 = 'uid_' + uuid4();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('stores a new login', async () => {
    await service.storeLogin(uid1, 'fx_send');
    const result = await service.fetchClientIds(uid1);
    expect(result).toStrictEqual(['fx_send']);
  });

  it('ignores a duplicate login', async () => {
    const result = await service.storeLogin(uid1, 'fx_send');
    expect(result).toBeTruthy;
    const result2 = await service.storeLogin(uid1, 'fx_send');
    expect(result2).toBeFalsy;
  });

  it('stores multiple user logins', async () => {
    await service.storeLogin(uid1, 'fx_send');
    await service.storeLogin(uid2, 'fx_screenshot');
    let result = await service.fetchClientIds(uid1);
    expect(result).toStrictEqual(['fx_send']);
    result = await service.fetchClientIds(uid2);
    expect(result).toStrictEqual(['fx_screenshot']);
  });

  it('stores multiple client ids', async () => {
    await service.storeLogin(uid1, 'fx_send');
    await service.storeLogin(uid1, 'fx_screenshot');
    const result = await service.fetchClientIds(uid1);
    expect(result).toStrictEqual(['fx_send', 'fx_screenshot']);
  });

  it('returns empty clientIds for non-existent login', async () => {
    const result = await service.fetchClientIds(uid1);
    expect(result).toStrictEqual([]);
  });

  it('uses a collection prefix', async () => {
    await service.storeLogin(uid1, 'fx_send');
    const doc = await fs.doc('fxatest-users/' + uid1).get();
    const data = doc.data();
    expect(data).toStrictEqual({ oauth_clients: { fx_send: true } });
  });

  it('fetches client id webhooks', async () => {
    const result = await service.fetchClientIdWebhooks();
    expect(result).toStrictEqual({});
    const document = fs.doc('fxatest-clients/test');
    await document.set({ webhookUrl: 'testUrl' });
    const result2 = await service.fetchClientIdWebhooks();
    expect(result2).toStrictEqual({ test: 'testUrl' });
    await document.delete();
  });

  it('gets updated when the database changes', async () => {
    const data: ClientWebhooks = {};
    const change = new Promise<() => void>((resolve, reject) => {
      const done = service.listenForClientIdWebhooks(
        (changed, removed) => {
          Object.assign(data, changed);
          for (const key of Object.keys(removed)) {
            delete data[key];
          }
          resolve(done);
        },
        (err) => {
          reject(err);
        }
      );
    });
    // Manually insert into the db
    const document = fs.doc('fxatest-clients/test');
    await document.set({ webhookUrl: 'testUrl' });
    const stop = await change;
    expect(data).toStrictEqual({ test: 'testUrl' });

    // Manually delete from the db
    await document.delete();
    expect(data).toStrictEqual({});
    stop();
  });
});
