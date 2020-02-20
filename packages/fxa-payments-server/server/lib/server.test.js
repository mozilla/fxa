const request = require('supertest');
const server = require('./server')();
const app = server.app;
const pkg = require('../../package.json');

function expectValueNotToBeUnknown(value) {
  expect(value).toBeTruthy();
  expect(value).not.toBe('unknown');
}

describe('Test simple server routes', () => {
  test('__version__ should have correct structure', () => {
    return new Promise(done => {
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
  });

  test('__lbheartbeat__ should return as expected', () => {
    return new Promise(done => {
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
});

describe('Test route dependencies', () => {
  test('server.js should pass the correct dependencies to routes', () => {
    const mockUAParser = () => {};
    const mockGeolocate = jest.fn();
    const mockStatsdInstance = {};
    const mockStatsd = function() {
      return mockStatsdInstance;
    };
    const mockRoutes = jest.fn().mockReturnValue([]);
    // I know this looks 100% wrong, but jest.mock want its variables prefixed
    // with 'mock'.  Currently jest does not offer a way to mock a return value
    // based on the received argument(s) of the mocked function.  Here the
    // actual config module is used when the argument is not 'statsd'.
    const mockConfig = jest.requireActual('../config');

    jest.mock('../config', () => ({
      get: key => {
        switch (key) {
          case 'statsd':
            return { enabled: true };
          default:
            return mockConfig.get(key);
        }
      },
    }));
    jest.mock('ua-parser-js', () => mockUAParser);
    jest.mock(
      '../../../fxa-shared/express/geo-locate.js',
      () => () => () => () => mockGeolocate
    );
    jest.mock('hot-shots', () => mockStatsd);
    jest.mock('./routes', () => mockRoutes);
    require('./server')();

    expect(mockRoutes).toHaveBeenCalledTimes(1);
    expect(mockRoutes).toHaveBeenLastCalledWith(
      mockGeolocate,
      mockUAParser,
      mockStatsdInstance
    );
  });
});
