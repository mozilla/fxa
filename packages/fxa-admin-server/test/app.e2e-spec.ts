import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
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
        query: '{accountByEmail(email:"test@test.com"){uid}}',
      })
      .expect(200);
  });
});
