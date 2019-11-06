/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

const common = require('./sync-common')

const HMAC_KEY = process.env.SYNC_INSERTID_HMAC_KEY

module.exports.run = path => common.run(path, { createEventCounts, createEvent })

function createEventCounts () {
  return {
    sync_complete: 0,
    skipped: 0
  }
}

function createEvent (schema, row, submissionDate) {
  const eventType = getEventType(schema, row)
  if (! eventType) {
    return
  }

  // submissionDate is not at all accurate as an event timing, but it's the best thing we have
  const time = getSubmissionTime(submissionDate)
  if (! time || time < 0) {
    return
  }

  const uid = row[schema.uid]
  const appVersion = row[schema.app_version]

  return Object.assign({
    event_type: `sync - ${eventType}`,
    time,
    // user_id is already hashed in Sync telemetry data
    user_id: uid,
    // TODO: include device_id when we have a plan for matching it to the other events
    session_id: -1,
    insert_id: common.hash(HMAC_KEY, uid, row[schema.device_id], time, row[schema.when], eventType),
    app_version: appVersion,
    language: row[schema.os_locale],
    event_properties: {
      ua_browser: row[schema.app_name],
      ua_version: appVersion
    }
  }, common.getOs(row[schema.os], row[schema.os_version]))
}

function getEventType (schema, row) {
  const status = {
    sync: row[schema.status.sync],
    service: row[schema.status.service]
  }

  if (! status.sync && ! status.service) {
    return 'sync_complete'
  }
}

function getSubmissionTime (submissionDate) {
  return Date.parse(`${submissionDate}T12:00`)
}

