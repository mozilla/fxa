import sentryMetrics from 'fxa-shared/lib/sentry';

interface FlowEventParams {
  device_id?: string;
  flow_id?: string;
  flow_begin_time?: number;
}

interface FlowEventData {
  deviceId: string;
  flowBeginTime: number;
  flowId: string;
}

let initialized = false;
let flowEventData: FlowEventData;

function shouldSend() {
  return initialized && window.navigator.sendBeacon;
}

function postMetrics(eventData: object) {
  // This is not an Action insofar that it has no bearing on the app state.
  window.navigator.sendBeacon('/metrics', JSON.stringify(eventData));
}

export function init(eventData: FlowEventParams) {
  if (!initialized) {
    if (eventData.device_id && eventData.flow_begin_time && eventData.flow_id) {
      flowEventData = {
        deviceId: eventData.device_id,
        flowBeginTime: eventData.flow_begin_time,
        flowId: eventData.flow_id,
      };
      initialized = true;
    } else {
      let redirectPath = window.location.pathname;
      if (window.location.search) {
        redirectPath += window.location.search;
      }

      return window.location.replace(
        `${window.location.origin}/get_flow?redirect_to=${encodeURIComponent(
          redirectPath
        )}`
      );
    }
  }
}

export function logAmplitudeEvent(
  groupName: string,
  eventName: string,
  eventProperties: object
) {
  if (!shouldSend()) {
    return;
  }

  try {
    const now = Date.now();

    // TODO: The following are the parameters required
    // for the content server to receive a metrics report.
    // They still need to be cleaned up and properly set.
    const eventData = {
      broker: 'web',
      context: 'web',
      duration: 1234,
      experiments: [],
      marketing: [],
      isSampledUser: false,
      lang: 'unknown',
      referrer: 'none',
      service: 'none',
      startTime: 1234,
      uid: 'none',
      uniqueUserId: 'none',
      utm_campaign: 'none',
      utm_content: 'none',
      utm_medium: 'none',
      utm_source: 'none',
      utm_term: 'none',
      screen: {
        clientHeight: 0,
        clientWidth: 0,
        devicePixelRatio: 0,
        height: 0,
        width: 0,
      },
      events: [
        {
          offset: now - flowEventData.flowBeginTime || 0,
          type: `amplitude.${groupName}.${eventName}`,
        },
      ],
      flushTime: now,
      ...flowEventData,
      ...eventProperties,
    };

    postMetrics(eventData);
  } catch (e) {
    console.error('AppError', e);
    sentryMetrics.captureException(e);
  }
}

export default {
  init,
  logAmplitudeEvent,
};
