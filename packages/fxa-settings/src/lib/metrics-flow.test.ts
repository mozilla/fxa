/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { init } from './metrics-flow';

const flowArg = {
  flowId: '9999',
  flowBeginTime: `${Date.now()}`,
  deviceId: 'psx',
};
const flowQueryParam = { flowId: '8888', flowBeginTime: `${Date.now()}` };
const flowDataAttrParam = {
  flowId: '7777',
  flowBeginTime: `${Date.now()}`,
};

describe('MetricsFlow', () => {
  describe('init', () => {
    it('should initialize the metricsFlow model with body data attribues', () => {
      global.window.document.body.dataset.flowId = flowDataAttrParam.flowId;
      global.window.document.body.dataset.flowBeginTime =
        flowDataAttrParam.flowBeginTime;
      const flowData = init();
      expect(flowData?.flowId).toEqual(
        global.window.document.body.dataset.flowId
      );
      expect(flowData?.flowBeginTime).toEqual(
        global.window.document.body.dataset.flowBeginTime
      );
      expect(flowData?.deviceId).toBeDefined();
    });

    it('should initialize the metricsFlow model with URL query parameters', () => {
      global.window.history.pushState(
        {},
        '',
        `?flowId=${flowQueryParam.flowId}&flowBeginTime=${flowQueryParam.flowBeginTime}`
      );
      const flowData = init();
      expect(flowData?.flowId).toEqual(flowQueryParam.flowId);
      expect(flowData?.flowBeginTime).toEqual(flowQueryParam.flowBeginTime);
    });

    it('should initialize the metricsFlow model with the argument', () => {
      const flowData = init(flowArg);
      expect(flowData?.flowId).toEqual(flowArg.flowId);
      expect(flowData?.flowBeginTime).toEqual(flowArg.flowBeginTime);
      expect(flowData?.deviceId).toEqual(flowArg.deviceId);
    });
  });
});
