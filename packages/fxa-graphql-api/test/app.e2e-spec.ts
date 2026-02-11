import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import bodyParser from 'body-parser';
import Config from '../src/config';
import { allowlistGqlQueries } from 'fxa-shared/nestjs/gql/gql-allowlist';

const appConfig = Config.getProperties();

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(bodyParser.json());
    app.use(allowlistGqlQueries(appConfig.gql));
    await app.init();
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
        operationName: null,
        variables: {},
        query:
          'query GetTotpStatus {\n  account {\n    totp {\n      exists\n      verified\n    }\n  }\n}\n',
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
