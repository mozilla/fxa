/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseService } from 'fxa-admin-server/src/database/database.service';
import { uuidTransformer } from 'fxa-shared/db/transformers';
import { MozLoggerService } from 'fxa-shared/nestjs/logger/logger.service';
import { RelyingParty } from '../../graphql';
import { RelyingPartyResolver } from './relying-party.resolver';

const MOCK_RP_ID = 'fced6b5e3f4c66b9';

function mockRpFromDb() {
  return {
    id: uuidTransformer.to(MOCK_RP_ID),
    name: 'Firefox Send local-dev',
    redirectUri: 'http://localhost:1337/oauth',
    canGrant: true,
    publicClient: true,
    createdAt: 1583259953,
    trusted: true,
    imageUri:
      'https://mozorg.cdn.mozilla.net/media/img/firefox/new/header-firefox.png',
    allowedScopes: 'https://identity.mozilla.com/apps/send',
  };
}
const MOCK_RP_FROM_DB = mockRpFromDb();
const MOCK_RP = {
  ...MOCK_RP_FROM_DB,
  id: MOCK_RP_ID,
} as RelyingParty;

describe('RelyingPartyResolver', () => {
  let resolver: RelyingPartyResolver;
  let logger: any;
  const db = {
    async relyingParties() {
      return [MOCK_RP_FROM_DB];
    },
  };

  beforeEach(async () => {
    logger = { debug: jest.fn(), error: jest.fn(), info: jest.fn() };
    const MockMozLogger: Provider = {
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
        MockMozLogger,
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
    expect(result).toEqual([MOCK_RP]);
  });
});
