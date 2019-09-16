const request = require('supertest');
const server = require('./server')();
const app = server.app;
const pkg = require('../../package.json');

function expectValueNotToBeUnknown(value) {
  expect(value).toBeTruthy();
  expect(value).not.toBe('unknown');
}

describe('Test simple server routes', () => {
  test('__version__ should have correct structure', done => {
    request(app)
      .get('/__version__')
      .then(response => {
        expect(response.statusCode).toStrictEqual(200);
        expect(response.headers['content-type']).toStrictEqual(
          'application/json; charset=utf-8'
        );

        const body = response.body;
        expect(Object.keys(body).sort()).toStrictEqual([
          'commit',
          'source',
          'version',
        ]);

        expectValueNotToBeUnknown(body.commit);
        expectValueNotToBeUnknown(body.source);
        expectValueNotToBeUnknown(body.version);

        expect(body.version).toStrictEqual(pkg.version);
        // check that the commit value looks like a git SHA
        expect(body.commit).toMatch(/^[0-9a-f]{40}$/);

        done();
      });
  });

  test('__lbheartbeat__ should return as expected', done => {
    request(app)
      .get('/__lbheartbeat__')
      .then(response => {
        expect(response.statusCode).toStrictEqual(200);
        expect(response.headers['content-type']).toStrictEqual(
          'text/plain; charset=utf-8'
        );
        expect(response.text).toStrictEqual('Ok');

        done();
      });
  });
});
