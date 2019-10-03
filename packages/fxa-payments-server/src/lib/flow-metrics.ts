import SpeedTrap from 'speed-trap';
import { Config } from './config';
let initialized: boolean;
const NOT_REPORTED_VALUE = 'none';

export function init() {
  if (!initialized) {
    SpeedTrap.init();
    initialized = true;
  }
}

export function logLoadedEvent(
  route: string,
  config: Config,
  getScreenInfo: Function
) {
  if (!initialized || !window.navigator.sendBeacon) {
    return;
  }

  const loadData = SpeedTrap.getLoad();
  const unloadData = SpeedTrap.getUnload();
  const flowData = config.flowMetricsData;
  const now = Date.now();
  const screenInfo = getScreenInfo();

  const metricsData = {
    ...loadData,
    ...unloadData,
    ...flowData,
    startTime: SpeedTrap.baseTime,
    flushTime: now,
    initialView: `payments.${route}`,
    events: [
      {
        offset: now - SpeedTrap.baseTime,
        type: 'loaded',
      },
    ],

    // default / static / empty values
    broker: NOT_REPORTED_VALUE,
    client_id: NOT_REPORTED_VALUE,
    context: 'web',
    deviceId: NOT_REPORTED_VALUE,
    entryPoint: NOT_REPORTED_VALUE,
    entrypoint: NOT_REPORTED_VALUE,
    experiments: [],
    isSampledUser: false,
    lang: config.lang,
    marketing: [],
    migration: NOT_REPORTED_VALUE,
    referrer: window.document.referrer || NOT_REPORTED_VALUE,
    screen: {
      ...screenInfo,
      height: screenInfo.screenHeight,
      width: screenInfo.screenWidth,
    },
    service: 'payments-server',
    uid: NOT_REPORTED_VALUE,
    uniqueUserId: NOT_REPORTED_VALUE,
    utm_campaign: NOT_REPORTED_VALUE,
    utm_content: NOT_REPORTED_VALUE,
    utm_medium: NOT_REPORTED_VALUE,
    utm_source: NOT_REPORTED_VALUE,
    utm_term: NOT_REPORTED_VALUE,
  };

  // This is not an Action insofar that it has no bearing on the app state.
  window.navigator.sendBeacon(
    `${config.servers.content.url}/metrics`,
    JSON.stringify(metricsData)
  );
}

export default {
  init,
  logLoadedEvent,
};
