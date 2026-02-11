/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import bodyParser from 'body-parser';
import { AppModule } from '../src/app.module';
import { allowlistGqlQueries } from 'fxa-shared/nestjs/gql/gql-allowlist';
import Config from '../src/config';

describe('#integration - AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    const appConfig = Config.getProperties();
    app.use(bodyParser.json());
    app.use(allowlistGqlQueries(appConfig.gql));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/__version__ (GET)', () => {
    return request(app.getHttpServer())
      .get('/__lbheartbeat__')
      .expect(200)
      .expect('{}');
  });

  it('/graphql (GET)', () => {
    return request(app.getHttpServer())
      .post('/graphql')
      .send({
        operationName: 'getEmails',
        variables: { search: 'moz' },
        query:
          'query getEmails($search: String!) {\n  getEmailsLike(search: $search) {\n    email\n  }\n}\n',
      })
      .expect(200);
  });

  it('/graphql (GET) - with invalid query', () => {
    return request(app.getHttpServer())
      .post('/graphql')
      .send({
        operationName: null,
        variables: {},
        query: `query test { __typename @a@a }`,
      })
      .expect(403);
  });
});
