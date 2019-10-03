import * as Sentry from '@sentry/browser';
import SpeedTrap from 'speed-trap';

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
let optEventData: FlowEventData;

function shouldSend() {
  return initialized && window.navigator.sendBeacon;
}

function postMetrics(eventData: object) {
  // This is not an Action insofar that it has no bearing on the app state.
  window.navigator.sendBeacon('/metrics', JSON.stringify(eventData));
}

export function init(eventData: FlowEventParams) {
  if (
    !initialized &&
    eventData.device_id &&
    eventData.flow_begin_time &&
    eventData.flow_id
  ) {
    optEventData = {
      deviceId: eventData.device_id,
      flowBeginTime: eventData.flow_begin_time,
      flowId: eventData.flow_id,
    };
    initialized = true;
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
    const eventData = {
      events: [
        {
          offset: Date.now() - optEventData.flowBeginTime || 0,
          type: `amplitude.${groupName}.${eventName}`,
        },
      ],
      data: {
        ...optEventData,
        ...eventProperties,
      },
    };

    postMetrics(eventData);
  } catch (e) {
    console.error('AppError', e);
    Sentry.captureException(e);
  }
}

export function logPerformanceEvent(view: string, perfStartTime: number) {
  if (!shouldSend()) {
    return;
  }

  try {
    const loadData = SpeedTrap.getLoad();
    const now = Date.now();

    const eventData = {
      events: [
        {
          offset: now - SpeedTrap.baseTime,
          type: 'loaded',
        },
      ],
      data: {
        view,
        perfStartTime, // start time from the server
        startTime: SpeedTrap.baseTime,
        flushTime: now,
        navigationTiming: loadData.navigationTiming,
        ...optEventData,
      },
    };

    postMetrics(eventData);
  } catch (e) {
    console.error('AppError', e);
    Sentry.captureException(e);
  }
}

export default {
  init,
  logAmplitudeEvent,
  logPerformanceEvent,
};
