const amplitude = require('./amplitude');
const log = require('./logging/log')();
jest.spyOn(log, 'info').mockImplementation(() => {});

jest.mock('../config', () => ({
  ...jest.requireActual('../config'),
  get: key => {
    switch (key) {
      case 'amplitude':
        return { enabled: true };
    }
  },
}));

const mocks = require('./test-mocks').amplitude;

describe('lib/amplitude', () => {
  beforeEach(() => {
    log.info.mockClear();
  });
  it('logs a correctly formatted message', done => {
    amplitude(
      mocks.event,
      mocks.request,
      mocks.data,
      mocks.requestReceivedTime
    );
    expect(log.info).toHaveBeenCalled();
    expect(log.info.mock.calls[0][0]).toMatch('amplitudeEvent');
    expect(log.info.mock.calls[0][1]).toMatchObject(mocks.expectedOutput);
    done();
  });

  describe('validates inputs', () => {
    it('returns if `event` is missing', () => {
      amplitude(
        undefined,
        mocks.request,
        mocks.data,
        mocks.requestReceivedTime
      );
      expect(log.info).not.toHaveBeenCalled();
    });
    it('returns if `request` is missing', () => {
      amplitude(mocks.event, undefined, mocks.data, mocks.requestReceivedTime);
      expect(log.info).not.toHaveBeenCalled();
    });
    it('returns if `data` is missing', () => {
      amplitude(
        mocks.event,
        mocks.request,
        undefined,
        mocks.requestReceivedTime
      );
      expect(log.info).not.toHaveBeenCalled();
    });
    it('returns if the message format does not match `amplitude.str.str`', () => {
      const invalidEvent = Object.assign({}, mocks.event);
      // This is an invalid type because it doesn't start with 'amplitude'.
      invalidEvent.type = 'foo.bar.baz';
      amplitude(
        invalidEvent,
        mocks.request,
        mocks.data,
        mocks.requestReceivedTime
      );
      expect(log.info).not.toHaveBeenCalled();
    });
  });
});
