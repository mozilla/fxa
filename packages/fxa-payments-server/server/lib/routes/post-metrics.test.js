const request = require('supertest');
const server = require('../server')();
const app = server.app;
jest.mock('../flow-performance', () => () => {});

const mocks = require('../test-mocks').amplitude;

describe('post-metrics route', () => {
  const validBody = {
    data: mocks.data,
    events: [mocks.event],
  };
  test('POST valid input should return 200', done => {
    request(app)
      .post('/metrics')
      .send(validBody)
      .set('Accept', 'application/json')
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        done();
      });
  });

  test('POST invalid input should return 400', done => {
    const invalidBody = Object.assign({}, validBody);
    delete invalidBody.events;
    request(app)
      .post('/metrics')
      .send(invalidBody)
      .set('Accept', 'application/json')
      .expect(400)
      .end((err, res) => {
        if (err) return done(err);
        done();
      });
  });
});
