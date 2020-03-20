/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const mockStatsd = { timing: jest.fn() };
const mockResponse = { status: jest.fn().mockReturnValue({ end: () => {} }) };
const navTimingRoute = require('./navigation-timing');
const buildRoute = (statsd = mockStatsd) => navTimingRoute(statsd);
const route = buildRoute();
const validRequestBody = {
  domainLookupStart: 0,
  domComplete: 1111,
  domInteractive: 1000,
  loadEventEnd: 1111,
  loadEventStart: 1111,
  name: 'https://testo.example.io/a/b/c',
  redirectStart: 0,
  requestStart: 22,
  responseEnd: 898,
  responseStart: 222,
};
const invalidRequestBody = { ...validRequestBody, domInteractive: 897 };

describe('navigation-timing route', () => {
  describe('http method', () => {
    test('should be post', () => {
      expect(route.method).toEqual('post');
    });
  });
  describe('path', () => {
    test('should be /navigation-timing', () => {
      expect(route.path).toEqual('/navigation-timing');
    });
  });
  describe('request body validation', () => {
    test('should pass when given a validate request body', () => {
      const result = route.validate.body.validate(validRequestBody);
      expect(result.error).toBeNull();
    });
    test('should fail when given an invalidate request body', () => {
      const result = route.validate.body.validate(invalidRequestBody);
      expect(result.error).not.toBeNull();
    });
  });
  describe('handler', () => {
    beforeEach(() => {
      mockStatsd.timing.mockClear();
      mockResponse.status.mockClear();
    });
    test('should log timings with statsd', () => {
      const request = {
        body: validRequestBody,
        headers: {
          'user-agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:75.0) Gecko/20100101 Firefox/75.0',
        },
      };
      route.process(request, mockResponse);
      const expectedTags = { path: 'a_b_c' };
      expect(mockStatsd.timing).toHaveBeenCalledTimes(6);
      expect(mockStatsd.timing).toHaveBeenNthCalledWith(
        1,
        'nt.network',
        validRequestBody.responseStart - validRequestBody.domainLookupStart,
        expectedTags
      );
      expect(mockStatsd.timing).toHaveBeenNthCalledWith(
        2,
        'nt.request',
        validRequestBody.responseStart - validRequestBody.requestStart,
        expectedTags
      );
      expect(mockStatsd.timing).toHaveBeenNthCalledWith(
        3,
        'nt.response',
        validRequestBody.responseEnd - validRequestBody.responseStart,
        expectedTags
      );
      expect(mockStatsd.timing).toHaveBeenNthCalledWith(
        4,
        'nt.dom',
        validRequestBody.domComplete - validRequestBody.domInteractive,
        expectedTags
      );
      expect(mockStatsd.timing).toHaveBeenNthCalledWith(
        5,
        'nt.load',
        validRequestBody.loadEventEnd - validRequestBody.loadEventStart,
        expectedTags
      );
      expect(mockStatsd.timing).toHaveBeenNthCalledWith(
        6,
        'nt.total',
        validRequestBody.loadEventEnd - validRequestBody.redirectStart,
        expectedTags
      );
      expect(mockResponse.status).toHaveBeenLastCalledWith(200);
    });
    test('should not log timings on error', () => {
      const request = {
        body: { ...validRequestBody, name: 'invalid/url/here' },
        headers: {
          'user-agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:75.0) Gecko/20100101 Firefox/75.0',
        },
      };

      buildRoute().process(request, mockResponse);
      expect(mockStatsd.timing).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenLastCalledWith(200);
    });
  });
});
