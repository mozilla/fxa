/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

module.exports = {
  marshall: function(data) {
    return {
      deviceId: data.deviceId,
      entrypoint: data.entrypoint,
      entrypointExperiment: data.entrypointExperiment,
      entrypointVariation: data.entrypointVariation,
      flowId: data.flowId,
      flowBeginTime: data.flowBeginTime,
      utmCampaign: data.utmCampaign,
      utmContent: data.utmContent,
      utmMedium: data.utmMedium,
      utmSource: data.utmSource,
      utmTerm: data.utmTerm,
    };
  },
};
