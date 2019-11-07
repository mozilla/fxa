import FlowEvent from './flow-event';
import SpeedTrap from 'speed-trap';

const eventGroup = 'testo';
const eventType = 'quuz';

const mockNow = 1002003004005;
const dateNow = jest.spyOn(Date, 'now').mockImplementation(() => mockNow);
const perfStartTime = mockNow - 100; // started in the past, before "now"

beforeEach(() => {
  // `sendBeacon` is undefined in this context
  window.navigator.sendBeacon = jest.fn();
});

it('does not send metrics when uninitialized', () => {
  FlowEvent.logAmplitudeEvent(eventGroup, eventType, perfStartTime, {});
  expect(window.navigator.sendBeacon).not.toHaveBeenCalled();
});

it('remains uninitialized when any flow param is empty', () => {
  FlowEvent.init({});
  FlowEvent.logAmplitudeEvent(eventGroup, eventType, perfStartTime, {});

  FlowEvent.init({ device_id: 'moz9000', flow_begin_time: 9001 });
  FlowEvent.logAmplitudeEvent(eventGroup, eventType, perfStartTime, {});

  FlowEvent.init({ device_id: 'moz9000', flow_id: 'ipsoandfacto' });
  FlowEvent.logAmplitudeEvent(eventGroup, eventType, perfStartTime, {});

  FlowEvent.init({ flow_begin_time: 9001, flow_id: 'ipsoandfacto' });
  FlowEvent.logAmplitudeEvent(eventGroup, eventType, perfStartTime, {});

  expect(window.navigator.sendBeacon).not.toHaveBeenCalled();
});

it('initializes when given all flow params', () => {
  FlowEvent.init({
    device_id: 'moz9000',
    flow_begin_time: 9001,
    flow_id: 'ipsoandfacto',
  });
  FlowEvent.logAmplitudeEvent(eventGroup, eventType, mockNow - 9001, {});

  expect(window.navigator.sendBeacon).toHaveBeenCalled();
});

it('sends the correct Amplitude metric payload', () => {
  FlowEvent.logAmplitudeEvent(eventGroup, eventType, perfStartTime, {
    quuz: 'quux',
  });
  const [metricsPath, payload] = (window.navigator
    .sendBeacon as jest.Mock).mock.calls[0];
  expect(metricsPath).toEqual(`/metrics`);
  expect(JSON.parse(payload)).toMatchObject({
    events: [
      {
        offset: expect.any(Number),
        type: `amplitude.${eventGroup}.${eventType}`,
      },
    ],
    data: {
      flowId: 'ipsoandfacto',
      flowBeginTime: expect.any(Number),
      deviceId: 'moz9000',
    },
  });
});

it('sends the correct performance metric payload', () => {
  SpeedTrap.init();
  jest.spyOn(SpeedTrap, 'getLoad').mockReturnValue({
    navigationTiming: {
      connectEnd: 96,
      connectStart: 96,
      domainLookupEnd: 95,
      domainLookupStart: 95,
      domComplete: 1634,
      domContentLoadedEventEnd: 697,
      domContentLoadedEventStart: 667,
      domInteractive: 659,
      domLoading: 115,
      fetchStart: 1,
      loadEventEnd: null,
      loadEventStart: 1634,
      navigationStart: 0,
      redirectEnd: null,
      redirectStart: null,
      requestStart: 96,
      responseEnd: 102,
      responseStart: 102,
      secureConnectionStart: null,
      unloadEventEnd: null,
      unloadEventStart: null,
    },
  });
  FlowEvent.logPerformanceEvent('quux', 9999);
  const [metricsPath, payload] = (window.navigator
    .sendBeacon as jest.Mock).mock.calls[0];
  expect(metricsPath).toEqual(`/metrics`);
  expect(JSON.parse(payload)).toMatchObject({
    events: [
      {
        offset: expect.any(Number),
        type: 'loaded',
      },
    ],
    data: {
      flowId: 'ipsoandfacto',
      flowBeginTime: expect.any(Number),
      deviceId: 'moz9000',
      view: 'quux',
      perfStartTime: 9999,
      startTime: SpeedTrap.baseTime,
      flushTime: expect.any(Number),
      navigationTiming: expect.any(Object),
    },
  });
});
