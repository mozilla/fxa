const request = require('supertest');
const server = require('../server')();
const app = server.app;

const validBody = {
  data: {
    deviceId: '016de98b32a54747b18ccbeaab2a6075',
    flowBeginTime: '1571195527850',
    flowId: '641530e2645e0e8d96ea7e409ebeebabfc3fb2fc9204fec999d9d8baa2ebb0da',
    planId: '123doneProMonthly',
    productId: '123doneProProduct',
  },
  events: [
    {
      offset: 100,
      type: 'amplitude.subPaySetup.view',
    },
  ],
};

const invalidBody = {
  data: {
    deviceId: '016de98b32a54747b18ccbeaab2a6075',
    flowBeginTime: '1571195527850',
    flowId: '641530e2645e0e8d96ea7e409ebeebabfc3fb2fc9204fec999d9d8baa2ebb0da',
    planId: '123doneProMonthly',
    productId: '123doneProProduct',
  },
  // 'events' is required and is missing
};

describe('post-metrics route', () => {
  // eslint-disable-next-line jest/expect-expect
  test('POST valid input should return 200', () => {
    return new Promise((resolve, reject) => {
      request(app)
        .post('/metrics')
        .send(validBody)
        .set('Accept', 'application/json')
        .expect(200)
        .end((err, res) => {
          if (err) {
            return reject(err);
          }
          resolve();
        });
    });
  });

  // eslint-disable-next-line jest/expect-expect
  test('POST invalid input should return 400', () => {
    return new Promise((resolve, reject) => {
      request(app)
        .post('/metrics')
        .send(invalidBody)
        .set('Accept', 'application/json')
        .expect(400)
        .end((err, res) => {
          if (err) {
            return reject(err);
          }
          resolve();
        });
    });
  });
});
