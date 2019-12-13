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

const mocks = {
  event: {
    offset: 150,
    type: 'amplitude.subPaySetup.view',
  },
  invalidEventType: {
    offset: 150,
    type: 'foo.bar.baz',
  },
  data: {
    version: '148.8',
    deviceId: '0123456789abcdef0123456789abcdef',
    flowBeginTime: 1570000000000,
    flowId: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
    flushTime: 9002,
    requestReceivedTime: 11000,
    view: 'product',
  },
  request: {
    headers: {
      'user-agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.14; rv:72.0) Gecko/20100101 Firefox/72.0',
    },
  },
  requestReceivedTime: 1570000001000,
};

const expectedOutput = {
  app_version: '148.8',
  device_id: '0123456789abcdef0123456789abcdef',
  event_properties: {},
  event_type: 'fxa_pay_setup - view',
  op: 'amplitudeEvent',
  os_name: 'Mac OS X',
  os_version: '10.14',
  session_id: 1570000000000,
  user_properties: {
    flow_id: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
    ua_browser: 'Firefox',
    ua_version: '72.0',
  },
};

describe('lib/amplitude', () => {
  beforeEach(() => {
    log.info.mockClear();
  });
  it('logs a correctly formatted message', () => {
    amplitude(
      mocks.event,
      mocks.request,
      mocks.data,
      mocks.requestReceivedTime
    );
    expect(log.info).toHaveBeenCalled();
    expect(log.info.mock.calls[0][0]).toMatch('amplitudeEvent');
    expect(log.info.mock.calls[0][1]).toMatchObject(expectedOutput);
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
      amplitude(
        mocks.invalidEventType,
        mocks.request,
        mocks.data,
        mocks.requestReceivedTime
      );
      expect(log.info).not.toHaveBeenCalled();
    });
  });
});
