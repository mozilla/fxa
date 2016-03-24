/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// This module does the handling for the metrics context
// activity event metadata.

define([], function () {
  'use strict';

  var OPTIONS = {
    context: true,
    entrypoint: true,
    migration: true,
    service: true,
    utmCampaign: true,
    utmContent: true,
    utmMedium: true,
    utmSource: true,
    utmTerm: true
  };

  return {
    marshall: function (data) {
      var metricsContext = {
        flowId: data.flowId,
        flowBeginTime: data.flowBeginTime
      };

      for (var key in data) {
        if (data.hasOwnProperty(key) && data[key] && OPTIONS[key]) {
          metricsContext[key] = data[key];
        }
      }

      return metricsContext;
    }
  };
});
