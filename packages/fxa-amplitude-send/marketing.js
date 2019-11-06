'use strict'

const async = require('async')
const AutoDetectDecoderStream = require('autodetect-decoder-stream')
const crypto = require('crypto')
const csv = require('csv-parser')
const { lookup } = require('lookup-dns-cache')
const moment = require('moment-timezone')
const Promise = require('bluebird')
const request = require('request-promise')

const EVENT = /^mktg-([a-z]+-[a-z]+)$/

const MAX_EVENTS_PER_BATCH = 10
const HMAC_KEY = process.env.FXA_AMPLITUDE_HMAC_KEY
const API_KEY = process.env.FXA_AMPLITUDE_API_KEY
const WORKERS = process.env.FXA_AMPLITUDE_WORKERS || 8

if (! HMAC_KEY || ! API_KEY) {
  console.error('Error: You must set FXA_AMPLITUDE_HMAC_KEY and FXA_AMPLITUDE_API_KEY environment variables')
  process.exit(1)
}

module.exports.processStream = function processStream (stream) {
  let eventCount = 0

  const cargo = async.cargo(async tasks => await send(tasks), MAX_EVENTS_PER_BATCH)
  cargo.concurrency = WORKERS

  return new Promise(resolve => {
    cargo.drain = () => {
      resolve(eventCount)
    }

    stream
      .pipe(new AutoDetectDecoderStream())
      .pipe(csv())
      .on('data', async (row) => {
        const event = createEvent(row)
        if (! event) {
          return
        }

        cargo.push(event)
      })
  })

  async function send (localBatch) {
    const body = await sendBatch(localBatch)

    if (body === 'success') {
      eventCount += localBatch.length
    } else {
      console.log(body)
    }
  }
}

function createEvent (row) {
  const eventType = getEventType(row)
  if (! eventType) {
    return
  }

  const time = getTime(row)
  if (! time || time < 0) {
    return
  }

  const user_id = row.FXA_ID
  const email_id = row.EmailName

  return {
    event_type: `mktg - ${eventType}`,
    time,
    user_id: hash(user_id),
    session_id: -1,
    insert_id: hash(user_id, eventType, time, email_id),
    event_properties: getEventProperties(row)
  }
}

function getEventType (row) {
  const eventParts = EVENT.exec(row.Event)

  if (eventParts && eventParts.length === 2) {
    return eventParts[1].replace(/-/g, '_')
  }
}

function getTime (row) {
  const time = moment.tz(row.EventDate, 'MMM D YYYY  H:mmA', 'America/Los_Angeles')
  if (time.isValid()) {
    return time.unix()
  }
}

function hash (...properties) {
  const hmac = crypto.createHmac('sha256', HMAC_KEY)

  properties.forEach(property => hmac.update(`${property}`))

  return hmac.digest('hex')
}

// Event properties are parsed from the EmailName column, which has
// a somewhat arcane format defined here:
//
// https://docs.google.com/spreadsheets/d/11rvrVdF4fj5GaKOvlnLcNjnWB7U7yKV_MHmlBwRE-WA/edit#gid=1626564614
//
// You can see how this regex breaks it down, using the examples from
// that spreadsheet, here:
//
// https://regex101.com/r/Ih5SL4/3/
const EVENT_PROPERTIES = /^([A-Za-z]+)_([A-Z]+)_[A-Z]*_[0-9]{4}_[A-Z]+_([A-Z]+|DESK[_ ][A-Z]+)_(.+?)_(ALL|[A-Z]{2})_([A-Z]{2,4})_([A-Z-]+)(?:_[A-Za-z0-9]*)?$/

function getEventProperties (row) {
  const properties = EVENT_PROPERTIES.exec(row.EmailName)
  if (properties && properties.length === 8) {
    return {
      email_sender: properties[1],
      email_region: properties[2],
      email_format: properties[3],
      email_id: properties[4],
      email_country: properties[5],
      email_language: properties[6],
      email_channel: properties[7]
    }
  }
}

function sendBatch (batch) {
  return request('https://api.amplitude.com/httpapi', {
    method: 'POST',
    lookup,
    formData: {
      api_key: API_KEY,
      event: JSON.stringify(batch)
    }
  })
}
