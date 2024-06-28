/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { v4 as uuidv4 } from 'uuid';
import { searchParams } from './utilities';

export type MetricsFlow = {
  flowId: string;
  flowBeginTime: string | number;
  deviceId?: undefined | string;
};

let metricsFlow: MetricsFlow | null = null;

function isMetricsFlow(data: any): data is MetricsFlow {
  return (
    data?.flowId &&
    data?.flowBeginTime &&
    typeof data.flowId === 'string' &&
    ((typeof data.flowBeginTime === 'string' &&
      /\d+/.test(data.flowBeginTime)) ||
      typeof data.flowBeginTime === 'number')
  );
}

/**
 * Initialize the metricsFlow data model.  The order of precedence:
 *  1. flowData parameter
 *  2. URL query parameters
 *  3. body tag data attributes
 */
export function init(flowData?: any) {
  const initWithX = (x: any) => {
    if (isMetricsFlow(x)) {
      metricsFlow = {
        flowId: x.flowId,
        flowBeginTime: x.flowBeginTime,
        ...(x.deviceId && { deviceId: x.deviceId }),
      };
      return true;
    }
    return false;
  };
  const initWithArg = () => initWithX(flowData);
  const initWithQueryParams = () => {
    const queryParamsMap = searchParams(window.location.search);
    return initWithX(queryParamsMap);
  };
  const initWithDataAttributes = () => initWithX(document.body.dataset);

  initWithArg() || initWithQueryParams() || initWithDataAttributes();
  maybeSetDeviceId();
  return getMetricsFlow();
}

// The "deviceId" was created for Amplitude. It was never persisted. We can
// generate it here if there isn't one.
function maybeSetDeviceId() {
  if (metricsFlow && !metricsFlow?.deviceId) {
    metricsFlow.deviceId = uuidv4().replace(/-/g, '');
  }
}

export function getMetricsFlow() {
  return metricsFlow;
}
