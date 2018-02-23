#!/usr/bin/env node

'use strict'

const fs = require('fs')
const path = require('path')
const zlib = require('zlib')

const TIME_FORMAT = /(201[78])-([0-9]{2})-([0-9]{2})-([0-9]{2})-([0-9]{2})/
const CATEGORY_FORMAT = /logging\.s3\.fxa\.([a-z]+)_server/
const VERBOSE = false

const args = process.argv.slice(2)
const fileNames = args.map(dir => fs.readdirSync(dir).map((file) => path.join(dir, file)))
  .reduce((result, fileName) => result.concat(fileName), [])

const missingUserAndDeviceAndSessionIds = createStat()
const missingUserAndDeviceIds = createStat()
const missingUserAndSessionIds = createStat()
const missingDeviceAndSessionIds = createStat()
const missingUserIds = createStat()
const missingDeviceIds = createStat()
const missingSessionIds = createStat()
const futureSessionIds = createStat()
const futureTimes = createStat()

const users = new Map()
const devices = new Map()

const events = fileNames.reduce((previousEvents, fileName) => {
  let time = TIME_FORMAT.exec(fileName)
  if (! time) {
    return
  }

  time = time.slice(1)

  let category = CATEGORY_FORMAT.exec(fileName)
  if (! category) {
    return
  }

  category = category[1]
  if (! previousEvents[category]) {
    return
  }

  const target = timestamp(time)
  const isContentServerEvent = category === 'content'

  const fileBuffer = fs.readFileSync(fileName)
  let text
  if (fileBuffer[0] === 0x1f && fileBuffer[1] === 0x8b && fileBuffer[2] === 0x8) {
    text = zlib.gunzipSync(fileBuffer).toString('utf8')
  } else {
    text = fileBuffer.toString('utf8')
  }

  const lines = text.split('\n')
  const data = lines
    .filter(line => line.indexOf('amplitudeEvent') !== -1)
    .map((line, index) => {
      let event
      try {
        event = JSON.parse(line)
        if (event.Fields) {
          event = event.Fields
        }
      } catch (_) {
        event = {}
      }

      const datum = {
        file: fileName,
        line: index + 1,
        event
      }

      const uid = event.user_id
      const deviceId = event.device_id
      const sessionId = event.session_id

      if (! uid) {
        if (! deviceId) {
          if (sessionId) {
            missingUserAndDeviceIds[category].push(datum)
          } else {
            missingUserAndDeviceAndSessionIds[category].push(datum)
          }
        } else if (sessionId) {
          missingUserIds[category].push(datum)
        } else {
          missingUserAndSessionIds[category].push(datum)
        }
      } else if (! deviceId) {
        if (sessionId) {
          missingDeviceIds[category].push(datum)
        } else {
          missingDeviceAndSessionIds[category].push(datum)
        }
      } else if (! sessionId) {
        missingSessionIds[category].push(datum)
      }

      if (sessionId > target) {
        futureSessionIds[category].push(datum)
      }

      if (event.time > target) {
        futureTimes[category].push(datum)
      }

      if (isContentServerEvent && uid && deviceId && sessionId) {
        const user = getUser(uid)

        multiMapSet(user.deviceSessions, deviceId, sessionId)
        multiMapSet(user.sessionDevices, sessionId, deviceId)

        users.set(uid, user)

        const device = getDevice(deviceId)

        multiMapSet(device.sessionUsers, sessionId, uid)

        devices.set(deviceId, device)
      }

      return datum
    })

  previousEvents[category] = previousEvents[category].concat(data)
  return previousEvents
}, createStat())

displayStat(events, 'EVENTS')
displayStatVerbose(missingUserAndDeviceAndSessionIds, 'MISSING user_id AND device_id AND session_id')
displayStatVerbose(missingUserAndDeviceIds, 'MISSING user_id AND device_id')
displayStatVerbose(missingUserAndSessionIds, 'MISSING user_id AND session_id')
displayStatVerbose(missingDeviceAndSessionIds, 'MISSING device_id AND session_id')
displayStatVerbose(missingUserIds, 'MISSING user_id')
displayStatVerbose(missingDeviceIds, 'MISSING device_id')
displayStatVerbose(missingSessionIds, 'MISSING session_id')
displayStatVerbose(futureSessionIds, 'FUTURE session_id')
displayStatVerbose(futureTimes, 'FUTURE time')

const conflictingUserIds = []
const conflictingDeviceIds = []
const conflictingSessionIds = []

events.auth.forEach(datum => {
  const event = datum.event
  const uid = event.user_id
  const deviceId = event.device_id
  const sessionId = event.session_id

  const user = getUser(uid)
  const device = getDevice(deviceId)

  optionallySetConflict(conflictingSessionIds, datum, user.deviceSessions, deviceId, sessionId)
  optionallySetConflict(conflictingDeviceIds, datum, user.sessionDevices, sessionId, deviceId)
  optionallySetConflict(conflictingUserIds, datum, device.sessionUsers, sessionId, uid)
})

displayConflict('user_id', conflictingUserIds)
displayConflict('device_id', conflictingDeviceIds)
displayConflict('session_id', conflictingSessionIds)

function createStat () {
  return {
    content: [],
    auth: []
  }
}

function timestamp (time) {
  return Date.parse(`${time[0]}-${time[1]}-${time[2]}T${time[3]}:${time[4]}:59.999`)
}

function getUser (uid) {
  return users.get(uid) || {
    deviceSessions: new Map(),
    sessionDevices: new Map()
  }
}

function getDevice (deviceId) {
  return devices.get(deviceId) || {
    sessionUsers: new Map()
  }
}

function multiMapSet (map, key, value) {
  const set = map.get(key) || new Set()
  set.add(value)
  map.set(key, set)
}

function displayStat (stat, description) {
  const categories = Object.keys(stat).map(key => ({
    category: key,
    count: stat[key].length,
    percentage: Math.round(stat[key].length / events[key].length * 100)
  }))

  const count = categories.reduce((sum, item) => sum + item.count, 0)
  const eventCount = Object.keys(events).reduce((sum, key) => sum + events[key].length, 0)
  const percentage = Math.round(count / eventCount * 100)

  console.log(`${description}: ${count} (${percentage}%)`)
  categories.forEach(item => console.log(`  ${item.category}: ${item.count} (${item.percentage}%)`))
}

function displayStatVerbose (stat, description) {
  displayStat(stat, description)

  if (VERBOSE) {
    Object.keys(stat).forEach(key => stat[key].forEach(datum => console.log(datum)))
  }
}

function optionallySetConflict (conflicts, datum, map, key, value) {
  const set = map.get(key)
  if (set && ! set.has(value)) {
    conflicts.push(datum)
  }
}

function displayConflict (property, conflicts) {
  const count = conflicts.length
  const percentage = Math.round(count / events.auth.length * 100)

  console.log(`CONFLICTING ${property}: ${count} (${percentage}%)`)
  if (VERBOSE) {
    conflicts.forEach(datum => console.log(datum))
  }
}

