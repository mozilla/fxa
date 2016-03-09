/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

var isA = require('joi')
var HEX = require('../routes/validators').HEX_STRING

module.exports = {
  schema: isA.object({
    flowId: isA.string().length(64).regex(HEX).optional(),
    flowBeginTime: isA.number().integer().positive().optional(),
    context: isA.string().optional(),
    entrypoint: isA.string().optional(),
    migration: isA.string().optional(),
    service: isA.string().optional(),
    utmCampaign: isA.string().optional(),
    utmContent: isA.string().optional(),
    utmMedium: isA.string().optional(),
    utmSource: isA.string().optional(),
    utmTerm: isA.string().optional()
  }).and('flowId', 'flowBeginTime').optional(),

  add: function (data, metadata, doNotTrack) {
    if (metadata) {
      data.time = Date.now()
      data.flow_id = metadata.flowId
      data.flow_time = calculateFlowTime(data.time, metadata.flowBeginTime)
      data.context = metadata.context
      data.entrypoint = metadata.entrypoint
      data.migration = metadata.migration
      data.service = metadata.service

      if (! doNotTrack) {
        data.utm_campaign = metadata.utmCampaign
        data.utm_content = metadata.utmContent
        data.utm_medium = metadata.utmMedium
        data.utm_source = metadata.utmSource
        data.utm_term = metadata.utmTerm
      }
    }

    return data
  }
}

function calculateFlowTime (time, flowBeginTime) {
  if (time <= flowBeginTime) {
    return 0
  }

  return time - flowBeginTime
}

