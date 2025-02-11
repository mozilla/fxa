/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseService } from 'fxa-admin-server/src/database/database.service';
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
  notes: null,
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

    const MockConfig: Provider = {
      provide: ConfigService,
      useValue: {
        get: jest.fn().mockReturnValue({ authHeader: 'test' }),
      },
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RelyingPartyResolver,
        MockConfig,
        { provide: DatabaseService, useValue: db },
      ],
    }).compile();

    resolver = module.get<RelyingPartyResolver>(RelyingPartyResolver);
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
        $intBoolFields: [],
        $uuidFields: ['id'],
      },
    ]);
  });

  it('should update notes relying parties with transformed ID', async () => {
    const result = await resolver.updateNotes(MOCK_RP_ID, 'notes 123');

    const mutated = await resolver.relyingParties();
    expect(result).toBeTruthy();
    expect(mutated.length).toBe(1);
    expect(mutated[0].notes).toBe('notes 123');
  });
});
