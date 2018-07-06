'use strict'

const AutoDetectDecoderStream = require('autodetect-decoder-stream')
const crypto = require('crypto')
const csv = require('csv-parser')
const fs = require('fs')
const Promise = require('bluebird')
const request = require('request-promise')
const s3 = require('s3')
const moment = require('moment-timezone')
const { lookup } = require('lookup-dns-cache')

fs.unlinkAsync = Promise.promisify(fs.unlink)

const TIMESTAMP = /^(20[1-9][0-9])-([01][0-9])-([0-3][1-9])-([0-2][0-9])-([0-5][0-9])$/
const EVENT = /^mktg-([a-z]+-[a-z]+)$/

const AWS_ACCESS_KEY = process.env.FXA_AWS_ACCESS_KEY
const AWS_SECRET_KEY = process.env.FXA_AWS_SECRET_KEY
const AWS_S3_BUCKET = '*** TODO ***'
const AWS_S3_PREFIX = '*** TODO ***'

const MAX_EVENTS_PER_BATCH = 10
const HMAC_KEY = process.env.FXA_AMPLITUDE_HMAC_KEY
const API_KEY = process.env.FXA_AMPLITUDE_API_KEY

if (process.argv.length !== 3) {
  console.error(`Usage: ${process.argv[1]} {YYYY-MM-DD-hh-mm | LOCAL PATH}`)
  console.error('If specifying YYYY-MM-DD-hh-mm as the arg, note that the script will try to send events')
  console.error('for all times from YYYY-MM-DD-hh-mm to the most recent available in S3. If any times in')
  console.error('that range are missing, they will be skipped without failing the process.')
  process.exit(1)
}

if (! HMAC_KEY || ! API_KEY) {
  console.error('Error: You must set FXA_AMPLITUDE_HMAC_KEY and FXA_AMPLITUDE_API_KEY environment variables')
  process.exit(1)
}

processData()
  .catch(error => {
    console.error(error.stack)
    process.exit(1)
  })

function processData () {
  const timeParts = TIMESTAMP.exec(process.argv[2])

  if (timeParts && timeParts.length === 6) {
    if (! AWS_ACCESS_KEY || ! AWS_SECRET_KEY) {
      console.error('Error: You must set AWS_ACCESS_KEY and AWS_SECRET_KEY environment variables')
      process.exit(1)
    }

    return processDataFromS3(timeParts.slice(1))
      .then(counts => counts.reduce((sum, count) => sum + count, 0))
  }

  return processStream(fs.createReadStream(process.argv[2]))
}

function processStream (stream) {
  let eventCount = 0, batch = [], error

  process.on('exit', () => {
    console.log(`Sent ${eventCount} events!`)
  })

  return new Promise((resolve, reject) => {
    stream
      .pipe(new AutoDetectDecoderStream())
      .pipe(csv())
      .on('data', row => {
        const event = createEvent(row)
        if (! event) {
          return
        }

        batch.push(event)

        if (batch.length < MAX_EVENTS_PER_BATCH) {
          return
        }

        const localBatch = batch.slice()
        batch = []
        send(localBatch).catch(reject)
      })
      .on('end', () => {
        if (error) {
          reject(error)
        } else if (batch.length === 0) {
          resolve(eventCount)
        } else {
          send(batch)
            .then(() => resolve(eventCount))
            .catch(reject)
        }
      })
  })

  function send (localBatch) {
    if (error) {
      return Promise.reject(error)
    }

    return sendBatch(localBatch)
      .then(() => eventCount += localBatch.length)
      .catch(e => {
        error = e
        throw error
      })
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

function processDataFromS3 (timeParts) {
  const client = s3.createClient({
    s3Options: {
      accessKeyId: AWS_ACCESS_KEY,
      secretKey: AWS_SECRET_KEY,
    }
  })

  return getKeysFromS3(client, timeParts)
    .then(keys => Promise.all(keys.map(key => processStream(client.downloadStream({
      Bucket: AWS_S3_BUCKET,
      Key: key
    })))))
}

function getKeysFromS3 (client, timeParts) {
  return new Promise((resolve, reject) => {
    const keys = []
    const emitter = client.listObjects({
      s3Params: {
        Bucket: AWS_S3_BUCKET,
        // TODO: change this to match the file names in S3
        Marker: `${AWS_S3_PREFIX}/${timeParts.join('-')}`,
        Prefix: AWS_S3_PREFIX
      }
    })
    emitter.on('error', error => reject(error))
    emitter.on('data', data => data.Contents.forEach(datum => keys.push(datum.key)))
    emitter.on('end', () => resolve(keys))
  })
}

