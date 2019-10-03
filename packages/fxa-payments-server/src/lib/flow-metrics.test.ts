import FlowMetrics from './flow-metrics';

import SpeedTrap from 'speed-trap';
jest.mock('speed-trap');

import { config } from './config';
import { setupMockConfig, mockConfig } from './test-utils';
setupMockConfig(mockConfig);

const route = 'testo';

it('does not send metrics when uninitialized', () => {
  // `sendBeacon` is undefined in this context
  window.navigator.sendBeacon = jest.fn();
  FlowMetrics.logLoadedEvent(route, config, () => {});
  expect(window.navigator.sendBeacon).not.toHaveBeenCalled();
});

it('initializes once', () => {
  FlowMetrics.init();
  FlowMetrics.init();
  expect(SpeedTrap.init).toBeCalledTimes(1);
});

it('sends the correct metrics payload', () => {
  const screenInfo = {
    clientHeight: 600,
    clientWidth: 800,
    devicePixelRatio: 1.5,
    screenHeight: 600,
    screenWidth: 800,
  };
  const getScreenInfo = () => screenInfo;
  FlowMetrics.logLoadedEvent(route, config, getScreenInfo);
  const [metricsReqUrl, payload] = (window.navigator
    .sendBeacon as jest.Mock).mock.calls[0];
  expect(metricsReqUrl).toEqual(`${config.servers.content.url}/metrics`);
  expect(JSON.parse(payload)).toMatchObject({
    broker: 'none',
    client_id: 'none',
    context: 'web',
    deviceId: 'none',
    entryPoint: 'none',
    entrypoint: 'none',
    events: [
      {
        offset: null,
        type: 'loaded',
      },
    ],
    experiments: [],
    flowBeginTime: null,
    flowId: null,
    flushTime: expect.any(Number),
    initialView: 'payments.testo',
    isSampledUser: false,
    lang: 'gd',
    marketing: [],
    migration: 'none',
    referrer: 'none',
    screen: {
      ...screenInfo,
      height: screenInfo.screenHeight,
      width: screenInfo.screenWidth,
    },
    service: 'payments-server',
    uid: 'none',
    uniqueUserId: 'none',
    utm_campaign: 'none',
    utm_content: 'none',
    utm_medium: 'none',
    utm_source: 'none',
    utm_term: 'none',
  });
});
