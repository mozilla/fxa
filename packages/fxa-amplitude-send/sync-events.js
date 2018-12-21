/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

const common = require('./sync-common')

const HMAC_KEY = process.env.SYNC_INSERTID_HMAC_KEY

module.exports.run = path => common.run(path, { createEventCounts, createEvent })

function createEventCounts () {
  return {
    tab_sent: 0,
    tab_received: 0,
    repair_triggered: 0,
    repair_success: 0,
    skipped: 0
  }
}

function createEvent (schema, row) {
  const eventType = getEventType(row[schema.event_method], row[schema.event_object])
  if (! eventType) {
    return
  }

  // serverTime is not at all accurate as an event timing, but it's the best thing we have
  const time = getServerTime(row[schema.event_map_values.key], row[schema.event_map_values.value])
  if (! time || time < 0) {
    return
  }

  const uid = row[schema.uid]
  const syncFlowId = row[schema.event_flow_id]
  const appName = row[schema.app_name]
  const appVersion = row[schema.app_version]

  return Object.assign({
    event_type: `sync - ${eventType}`,
    time,
    // user_id is already hashed in Sync telemetry data
    user_id: uid,
    // TODO: include device_id when we have a plan for matching it to the other events
    session_id: -1,
    insert_id: common.hash(HMAC_KEY, uid, row[schema.device_id], syncFlowId, time, row[schema.event_timestamp], eventType),
    app_version: appVersion,
    language: row[schema.device_os_locale],
    event_properties: {
      ua_browser: appName,
      ua_version: appVersion,
      flow_id: syncFlowId
    }
  }, common.getOs(row[schema.device_os_name], row[schema.device_os_version]))
}

function getEventType (method, object) {
  if (method === 'displayURI') {
    return getSendTabEventType(object)
  }

  if (object === 'repair') {
    return getRepairEventType(method)
  }
}

function getSendTabEventType (object) {
  switch (object) {
    case 'sendcommand':
      return 'tab_sent'

    case 'processcommand':
      return 'tab_received'
  }
}

function getRepairEventType (method) {
  switch (method) {
    case 'started':
      return 'repair_triggered'

    case 'finished':
      return 'repair_success'
  }
}

function getServerTime (keys, values) {
  let serverTimeIndex

  if (keys.some((key, index) => {
    if (key === 'serverTime') {
      serverTimeIndex = index
      return true
    }
  })) {
    return parseInt(values[serverTimeIndex] * 1000)
  }
}

