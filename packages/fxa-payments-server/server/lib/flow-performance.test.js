const logFlowPerf = require('./flow-performance');
const log = require('./logging/log')();
jest.spyOn(log, 'info').mockImplementation(() => {});
jest.mock('../config', () => ({
  ...jest.requireActual('../config'),
  get: key => {
    switch (key) {
      case 'geodb':
        return { enabled: true };
      case 'clientAddressDepth':
        return 3;
      case 'flow_id_expiry':
        return 999999;
    }
  },
}));
jest.mock(
  '../../../fxa-shared/express/geo-locate.js',
  () => () => () => () => () => ({
    country: 'Heapolandia',
    state: 'Byte',
  })
);
const os = require('os');
const HOSTNAME = os.hostname();

const event = { type: 'loaded', offset: 100 };
const request = {
  headers: { 'user-agent': 'testo-client 0.1.0' },
  locale: 'gd',
};
const data = {
  view: 'quux',
  perfStartTime: 9001,
  flowBeginTime: 8888,
  flowId: 'whatistime',
  requestReceivedTime: 11000,
  flushTime: 9002,
  navigationTiming: {
    connectEnd: 97,
    connectStart: 96,
    domainLookupEnd: 96,
    domainLookupStart: 95,
    domComplete: 1634,
    domLoading: 115,
    loadEventEnd: null,
    loadEventStart: 1634,
    redirectEnd: null,
    redirectStart: null,
    requestStart: 96,
    responseEnd: 104,
    responseStart: 102,
  },
};

describe('flow-performance lib', () => {
  test('does not log when any required payload data is missing', done => {
    logFlowPerf(event, request, { ...data, view: null });
    logFlowPerf(event, request, { ...data, perfStartTime: null });
    logFlowPerf(event, request, { ...data, flowBeginTime: null });
    logFlowPerf(event, request, { ...data, flowId: null });
    logFlowPerf(event, request, { ...data, navigationTiming: null });
    expect(log.info).not.toHaveBeenCalled();
    done();
  });

  test('logs correct perf events', done => {
    logFlowPerf(event, request, data);
    expect(log.info).toHaveBeenCalledTimes(4);
    expect(log.info.mock.calls[0][0]).toMatchObject({
      country: 'Heapolandia',
      event: 'flow.performance.payments.quux',
      flow_id: 'whatistime',
      flow_time: 2098,
      hostname: HOSTNAME,
      locale: 'gd',
      op: 'flowEvent',
      pid: expect.any(Number),
      region: 'Byte',
      time: '1970-01-01T00:00:11.099Z',
      userAgent: 'testo-client 0.1.0',
      v: 1,
    });
    expect(log.info.mock.calls[1][0]).toMatchObject({
      country: 'Heapolandia',
      event: 'flow.performance.payments.quux.network',
      flow_id: 'whatistime',
      flow_time: 4,
      hostname: HOSTNAME,
      locale: 'gd',
      op: 'flowEvent',
      pid: expect.any(Number),
      region: 'Byte',
      time: '1970-01-01T00:00:09.005Z',
      userAgent: 'testo-client 0.1.0',
      v: 1,
    });
    expect(log.info.mock.calls[2][0]).toMatchObject({
      country: 'Heapolandia',
      event: 'flow.performance.payments.quux.server',
      flow_id: 'whatistime',
      flow_time: 6,
      hostname: HOSTNAME,
      locale: 'gd',
      op: 'flowEvent',
      pid: expect.any(Number),
      region: 'Byte',
      time: '1970-01-01T00:00:09.007Z',
      userAgent: 'testo-client 0.1.0',
      v: 1,
    });
    expect(log.info.mock.calls[3][0]).toMatchObject({
      country: 'Heapolandia',
      event: 'flow.performance.payments.quux.client',
      flow_id: 'whatistime',
      flow_time: 1519,
      hostname: HOSTNAME,
      locale: 'gd',
      op: 'flowEvent',
      pid: expect.any(Number),
      region: 'Byte',
      time: '1970-01-01T00:00:10.520Z',
      userAgent: 'testo-client 0.1.0',
      v: 1,
    });
    done();
  });
});
