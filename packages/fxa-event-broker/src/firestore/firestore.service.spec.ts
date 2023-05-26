/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Firestore } from '@google-cloud/firestore';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { v4 as uuid4 } from 'uuid';

import { FirestoreService } from './firestore.service';
import { WebhookUrlDocumentMap } from './schemas.interface';

const TEST_TIMEOUT = 1000 * 30;

// Set the env var to use the emulator
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:9090';

describe('#integration - FirestoreService', () => {
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

  it(
    'stores a new login',
    async () => {
      await service.storeLogin(uid1, 'fx_send');
      const result = await service.fetchClientIds(uid1);
      expect(result).toStrictEqual(['fx_send']);
    },
    TEST_TIMEOUT
  );

  it(
    'ignores a duplicate login',
    async () => {
      const result = await service.storeLogin(uid1, 'fx_send');
      expect(result).toBeTruthy();
      const result2 = await service.storeLogin(uid1, 'fx_send');
      expect(result2).toBeFalsy();
    },
    TEST_TIMEOUT
  );

  it(
    'stores multiple user logins',
    async () => {
      await service.storeLogin(uid1, 'fx_send');
      await service.storeLogin(uid2, 'fx_screenshot');
      let result = await service.fetchClientIds(uid1);
      expect(result).toStrictEqual(['fx_send']);
      result = await service.fetchClientIds(uid2);
      expect(result).toStrictEqual(['fx_screenshot']);
    },
    TEST_TIMEOUT
  );

  it(
    'stores multiple client ids',
    async () => {
      await service.storeLogin(uid1, 'fx_send');
      await service.storeLogin(uid1, 'fx_screenshot');
      const result = await service.fetchClientIds(uid1);
      expect(result).toStrictEqual(['fx_send', 'fx_screenshot']);
    },
    TEST_TIMEOUT
  );

  it(
    'returns empty clientIds for non-existent login',
    async () => {
      const result = await service.fetchClientIds(uid1);
      expect(result).toStrictEqual([]);
    },
    TEST_TIMEOUT
  );

  it(
    'uses a collection prefix',
    async () => {
      await service.storeLogin(uid1, 'fx_send');
      const doc = await fs.doc('fxatest-users/' + uid1).get();
      const data = doc.data();
      expect(data).toStrictEqual({ oauth_clients: { fx_send: true } });
    },
    TEST_TIMEOUT
  );

  it(
    'fetches client id webhooks',
    async () => {
      const document = fs.doc('fxatest-clients/test');
      const document2 = fs.doc('fxatest-clients/test2');
      try {
        const result = await service.fetchClientIdWebhookDocs();
        expect(result).toStrictEqual({});
        await Promise.all([
          document.set({ webhookUrl: 'testUrl' }),
          document2.set({ webhookUrl: 'testUrl2', isResourceServer: true }),
        ]);
        const result2 = await service.fetchClientIdWebhookDocs();
        expect(result2).toStrictEqual({
          test: { webhookUrl: 'testUrl' },
          test2: { webhookUrl: 'testUrl2', isResourceServer: true },
        });
      } finally {
        await document.delete();
        await document2.delete();
      }
    },
    TEST_TIMEOUT
  );

  it(
    'gets updated when the database changes',
    async () => {
      const data: WebhookUrlDocumentMap = {};
      const stop = service.listenForClientIdWebhooks(
        (changed, deleted) => {
          Object.assign(data, changed);
          for (const clientId of Object.keys(deleted)) {
            delete data[clientId];
          }
        },
        (err) => {}
      );

      // Manually insert into the db
      const document = fs.doc('fxatest-clients/test');
      const document2 = fs.doc('fxatest-clients/test2');
      await document.set({ webhookUrl: 'testUrl' });
      await document2.set({ webhookUrl: 'testUrl2', isResourceServer: true });

      // Wait until the data matches expectations, up to TEST_TIMEOUT
      const now = Date.now();
      while (Object.keys(data).length !== 2) {
        const timeSpentInSeconds = (Date.now() - now) / 1000 - 1;
        if (timeSpentInSeconds > TEST_TIMEOUT) {
          stop();
          await document.delete();
          await document2.delete();
          throw new Error('Timeout waiting for data to match expectations');
        }
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      try {
        expect(data).toStrictEqual({
          test: { webhookUrl: 'testUrl' },
          test2: { webhookUrl: 'testUrl2', isResourceServer: true },
        });
      } finally {
        // Manually delete from the db
        await document.delete();
        await document2.delete();
        stop();
      }
      expect(data).toStrictEqual({});
    },
    TEST_TIMEOUT
  );
});
