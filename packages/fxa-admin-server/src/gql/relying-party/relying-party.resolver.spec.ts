/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { MozLoggerService } from '@fxa/shared/mozlog';
import { DatabaseService } from 'fxa-admin-server/src/database/database.service';
import { AuditLogInterceptor } from '../../auth/audit-log.interceptor';
import { RelyingParty } from 'fxa-shared/db/models/auth';
import { testDatabaseSetup } from 'fxa-shared/test/db/helpers';
import { Knex } from 'knex';
import { RelyingPartyResolver } from './relying-party.resolver';

const MOCK_RP_ID = 'fced6b5e3f4c66b9';

const MOCK_RP = {
  id: MOCK_RP_ID,
  name: 'Firefox Send local-dev',
  redirectUri: 'http://localhost:1337/oauth',
  canGrant: true,
  publicClient: true,
  createdAt: new Date('2022-01-01T00:00:00.000Z'),
  trusted: true,
  imageUri:
    'https://mozorg.cdn.mozilla.net/media/img/firefox/new/header-firefox.png',
  allowedScopes: 'https://identity.mozilla.com/apps/send',
  notes: '',
};

describe('#integration - RelyingPartyResolver', () => {
  let knex: Knex;
  let db = {
    relyingParty: RelyingParty,
  };
  let resolver: RelyingPartyResolver;

  beforeAll(async () => {
    knex = await testDatabaseSetup();
    db.relyingParty = RelyingParty.bindKnex(knex);
    await db.relyingParty.query().insert(MOCK_RP as any);

    const logger = { debug: jest.fn(), error: jest.fn(), info: jest.fn() };
    const MockMozLoggerService: Provider = {
      provide: MozLoggerService,
      useValue: logger,
    };

    const MockConfig: Provider = {
      provide: ConfigService,
      useValue: {
        get: jest.fn().mockReturnValue({ authHeader: 'test' }),
      },
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RelyingPartyResolver,
        AuditLogInterceptor,
        MockMozLoggerService,
        MockConfig,
        { provide: DatabaseService, useValue: db },
      ],
    }).compile();

    resolver = module.get<RelyingPartyResolver>(RelyingPartyResolver);
  });

  afterAll(async () => {
    await db.relyingParty.query().delete();
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  it('should return relying parties with transformed ID', async () => {
    const result = await resolver.relyingParties();

    expect(result.length).toEqual(1);
    expect(result).toEqual([
      {
        ...MOCK_RP,
        hasSecret: false,
        hasPreviousSecret: false,
      },
    ]);
  });

  it('should create relying party', async () => {
    const payload = {
      name: 'foo',
      imageUri: 'https://mozilla.com/foo/logo.png',
      redirectUri: 'https://mozilla.com/foo/signin',
      canGrant: false,
      publicClient: false,
      createdAt: new Date(),
      trusted: true,
      allowedScopes: MOCK_RP.allowedScopes,
      notes: 'test',
    };

    const result = await resolver.createRelyingParty(payload);

    expect(result).toBeDefined();
    expect(result.id).toBeDefined();
    expect(result.secret).toBeDefined();
    expect(
      (await resolver.relyingParties()).some((x) => x.id === result.id)
    ).toBeTruthy();
  });

  it('should update relying party', async () => {
    const payload = {
      name: 'foo',
      imageUri: 'https://mozilla.com/foo/logo.png',
      redirectUri: 'https://mozilla.com/foo/signin',
      canGrant: false,
      publicClient: false,
      createdAt: new Date('2025-10-14T00:47:42.000Z'),
      trusted: true,
      allowedScopes: MOCK_RP.allowedScopes,
      notes: 'test',
    };
    const result = await resolver.createRelyingParty(payload);

    const payload2 = {
      name: 'foo123',
      imageUri: 'https://mozilla.com/foo123/logo.png',
      redirectUri: 'https://mozilla.com/foo123/signin',
      canGrant: !MOCK_RP.canGrant,
      publicClient: !MOCK_RP.publicClient,
      trusted: !MOCK_RP.trusted,
      allowedScopes: '',
      notes: 'test updated',
    };
    const result2 = await resolver.updateRelyingParty(result.id, payload2);
    const updatedState = (await resolver.relyingParties()).find(
      (x) => x.id === result.id
    );
    expect(result).toBeDefined();
    expect(result2).toBeTruthy();
    expect(updatedState).toBeDefined();
    expect(updatedState?.name).toEqual(payload2.name);
    expect(updatedState?.imageUri).toEqual(payload2.imageUri);
    expect(updatedState?.redirectUri).toEqual(payload2.redirectUri);
    expect(updatedState?.canGrant).toEqual(payload2.canGrant);
    expect(updatedState?.publicClient).toEqual(payload2.publicClient);
    expect(updatedState?.trusted).toEqual(payload2.trusted);
    expect(updatedState?.allowedScopes).toEqual(payload2.allowedScopes);
    expect(updatedState?.notes).toEqual(payload2.notes);
  });

  it('should delete relying party', async () => {
    const result = await resolver.deleteRelyingParty(MOCK_RP.id);

    expect(result).toBeTruthy();
    expect(
      (await resolver.relyingParties()).some((x) => x.id === MOCK_RP.id)
    ).toBeFalsy();
  });

  it('should rotate relying party secret', async () => {
    const payload = {
      name: 'foo-rotate',
      imageUri: 'https://mozilla.com/foo/logo.png',
      redirectUri: 'https://mozilla.com/foo/signin',
      canGrant: false,
      publicClient: false,
      createdAt: new Date('2025-10-14T00:47:42.000Z'),
      trusted: true,
      allowedScopes: MOCK_RP.allowedScopes,
      notes: 'test',
    };
    const rp = await resolver.createRelyingParty(payload);

    const rpStateBefore = (await resolver.relyingParties()).find(
      (x) => x.id === rp.id
    );

    // Rotate the secret
    const result = await resolver.rotateRelyingPartySecret(rp.id);
    const rpStateAfterRotate = (await resolver.relyingParties()).find(
      (x) => x.id === rp.id
    );

    // Revoke previous secret
    await resolver.deletePreviousRelyingPartySecret(rp.id);
    const rpStateAfterRevoke = (await resolver.relyingParties()).find(
      (x) => x.id === rp.id
    );

    expect(rp).toBeDefined();
    expect(result).toBeDefined();
    expect(result.secret).toMatch(/^[0-9a-f]{64}$/);
    expect(rpStateBefore?.hasSecret).toBeTruthy();
    expect(rpStateBefore?.hasPreviousSecret).toBeFalsy();
    expect(rpStateAfterRotate?.hasSecret).toBeTruthy();
    expect(rpStateAfterRotate?.hasPreviousSecret).toBeTruthy();
    expect(rpStateAfterRevoke?.hasSecret).toBeTruthy();
    expect(rpStateAfterRevoke?.hasPreviousSecret).toBeFalsy();
  });
});
