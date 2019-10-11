import * as Sentry from '@sentry/browser';

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
  if (!initialized || !window.navigator.sendBeacon) {
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

    // This is not an Action insofar that it has no bearing on the app state.
    window.navigator.sendBeacon('/metrics', JSON.stringify(eventData));
  } catch (e) {
    console.error('AppError', e);
    Sentry.captureException(e);
  }
}

export default {
  init,
  logAmplitudeEvent,
};
