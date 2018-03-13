/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

const assert = require('assert')
const crypto = require('crypto')
const fs = require('fs')
const { ParquetReader } = require('node-parquet')
const path = require('path')
const Promise = require('bluebird')
const request = require('request-promise')
const s3 = require('s3')

fs.unlinkAsync = Promise.promisify(fs.unlink)

const DATE = /^(20[1-9][0-9])-([01][0-9])-([0-3][0-9])$/
const PARQUET_FILE = /\.parquet$/i
const PARQUET_BATCH_SIZE = 16384
const AWS_ACCESS_KEY = process.env.FXA_AWS_ACCESS_KEY
const AWS_SECRET_KEY = process.env.FXA_AWS_SECRET_KEY
const AWS_S3_BUCKET = 'telemetry-parquet'
const MAX_EVENTS_PER_BATCH = 10
const API_KEY = process.env.FXA_AMPLITUDE_API_KEY

module.exports = { run, hash, getOs }

function run (markerPath, s3Prefix, impl) {
  const { createEventCounts, createEvent } = impl

  assertFunction(createEventCounts)
  assertFunction(createEvent)

  const { dateParts, localPath, reportOnly } = parseCommandLine(process.argv, markerPath)

  return Promise.resolve()
    .then(() => {
      if (localPath) {
        // HACK: Use a made-up submissionDate for local testing
        const submissionDate = new Date()
          .toJSON()
          .split('T')[0]
        return processData(readLocalData(localPath), submissionDate)
      }

      return processDataFromS3(`${dateParts[1]}${dateParts[2]}${dateParts[3]}`)
        .then(({ dates, eventCounts }) => {
          console.log('days:', dates.length, dates)
          fs.writeFileSync(markerPath, dates[0])
          return eventCounts
        })
    })
    .then(eventCounts => {
      let sum = 0
      Object.entries(eventCounts).forEach(entry => {
        const [ key, eventCount ] = entry
        console.log(`${key}: ${eventCount}`)
        sum += eventCount
      })
      console.log('sum:', sum)
    })
    .catch(error => {
      console.error(error)
      process.exit(1)
    })

  function readLocalData (fileName) {
    const reader = new ParquetReader(fileName)
    const metadata = reader.info()
    const schema = parseSchema(metadata.spark_schema)
    return { count: metadata.rows, reader, schema }
  }

  function parseSchema (source, shift = 0) {
    return Object.keys(source).reduce((target, key, index) => {
      const column = source[key]
      // HACK: I'm ignoring list types for now because so far they're always
      //       at the end of the schema and there's no data in them we want
      if (! column.list && ! column.type) {
        const nestedKeys = getInterestingKeys(column)
        target[key] = nestedKeys.reduce((parentColumn, nestedKey, nestedIndex) => {
          const nestedColumn = column[nestedKey]
          if (nestedColumn.type) {
            // This branch parses sync_summary's failure_reason and status columns
            parentColumn[nestedKey] = index + shift
            if (nestedIndex < nestedKeys.length - 1) {
              shift += 1
            }
          } else {
            // This branch parses sync_event's `event_map_values` key/value columns
            Object.assign(parentColumn, parseSchema(nestedColumn, index + shift))
            shift += getInterestingKeys(nestedColumn).length - 1
          }
          return parentColumn
        }, {})
      } else {
        target[key] = index + shift
      }
      return target
    }, {})
  }

  function getInterestingKeys (column) {
    return Object.keys(column).filter(key => key !== 'optional')
  }

  function processData ({
    count,
    reader,
    schema,
    eventCounts = createEventCounts(),
    index = 0
  }, submissionDate) {
    if (index >= count) {
      reader.close()
      return Promise.resolve(eventCounts)
    }

    const rows = reader.rows(PARQUET_BATCH_SIZE)
    let batch = []

    return Promise.all(rows.map(row => {
      const event = createEvent(schema, row, submissionDate)
      if (! event) {
        eventCounts.skipped += 1
        return
      }

      eventCounts[event.event_type.split(' ')[2]] += 1

      batch.push(event)
      if (batch.length < MAX_EVENTS_PER_BATCH) {
        return
      }

      const localBatch = batch.slice()
      batch = []
      return sendBatch(localBatch)
    }))
      .then(() => {
        if (batch.length > 0) {
          return sendBatch(batch)
        }
      })
      .then(() => processData({ count, reader, schema, eventCounts, index: index + PARQUET_BATCH_SIZE }))
  }

  function sendBatch (batch) {
    if (! reportOnly) {
      return request('https://api.amplitude.com/httpapi', {
        method: 'POST',
        formData: {
          api_key: API_KEY,
          event: JSON.stringify(batch)
        }
      })
    }
  }

  function processDataFromS3 (fromDate) {
    const client = s3.createClient({
      s3Options: {
        accessKeyId: AWS_ACCESS_KEY,
        secretKey: AWS_SECRET_KEY,
      }
    })

    return getKeysFromS3(client, fromDate)
      .then(keys => processKeyFromS3(client, keys, 0))
  }

  function getKeysFromS3 (client, fromDate) {
    return new Promise((resolve, reject) => {
      const keys = []
      const emitter = client.listObjects({
        s3Params: {
          Bucket: AWS_S3_BUCKET,
          Marker: `${s3Prefix}submission_date_s3=${fromDate}`,
          Prefix: s3Prefix
        }
      })
      emitter.on('error', error => reject(error))
      emitter.on('data', data => data.Contents.forEach(datum => {
        const key = datum.Key
        if (PARQUET_FILE.test(key)) {
          keys.push(key)
        }
      }))
      emitter.on('end', () => resolve(keys))
    })
  }

  function processKeyFromS3 (client, keys, index) {
    if (index === keys.length) {
      return Promise.resolve({ eventCounts: createEventCounts(), dates: [] })
    }

    const submissionDate = formatDate(keys[index].split('=')[1].substr(0, 8))

    return downloadFileFromS3(client, keys, index)
      .then(fileName => {
        const data = readLocalData(fileName)
        return Promise.all([ processData(data, submissionDate), fs.unlinkAsync(fileName) ])
      })
      .spread(eventCounts =>
        processKeyFromS3(client, keys, index + 1)
          .then(result => ({
            eventCounts: Object.entries(eventCounts).reduce((sums, entry) => {
              const [ key, eventCount ] = entry
              sums[key] = eventCount + result.eventCounts[key]
              return sums
            }, createEventCounts()),
            dates: result.dates.concat(submissionDate)
          }))
      )
  }

  function downloadFileFromS3 (client, keys, index) {
    return new Promise((resolve, reject) => {
      const key = keys[index]
      const fileName = path.resolve(`${key.split('=')[1].replace('/', '-')}`)
      const emitter = client.downloadFile({
        localFile: fileName,
        s3Params: {
          Bucket: AWS_S3_BUCKET,
          Key: keys[index]
        }
      })
      emitter.on('error', error => reject(error))
      emitter.on('end', () => resolve(fileName))
    })
  }
}

function assertFunction (argument) {
  assert.equal(typeof argument, 'function', 'Invalid argument `createEvent`')
}

function parseCommandLine (argv, markerPath) {
  const argc = argv.length
  if (! (argc >= 2 && argc <= 4)) {
    console.error(`Usage: ${argv[1]} [YYYY-MM-DD | LOCAL PATH] [--report-only]`)
    console.error('If specifying YYYY-MM-DD as the arg, note that the script will try to send events')
    console.error('for all dates from YYYY-MM-DD to the most recent available in S3. If any dates in')
    console.error('that range are missing, they will be skipped without failing the process.')
    process.exit(1)
  }

  const reportOnly = argv[argc - 1] === '--report-only'
  if (! reportOnly && ! API_KEY) {
    console.error('Error: You must set the FXA_AMPLITUDE_API_KEY environment variable')
    process.exit(1)
  }

  let localPath
  const dateParts = getDateParts(argc, argv, reportOnly, markerPath)
  if (dateParts && dateParts.length === 4) {
    if (! AWS_ACCESS_KEY || ! AWS_SECRET_KEY) {
      console.error('Error: You must set AWS_ACCESS_KEY and AWS_SECRET_KEY environment variables')
      process.exit(1)
    }
  } else {
    localPath = argv[2]
  }

  return { dateParts, localPath, reportOnly }
}

function getDateParts (argc, argv, reportOnly, markerPath) {
  if (argc === 2 || (argc === 3 && reportOnly)) {
    return DATE.exec(fs.readFileSync(markerPath, 'utf8').trim())
  }

  return DATE.exec(argv[2])
}

function formatDate (date) {
  return `${date.substr(0, 4)}-${date.substr(4, 2)}-${date.substr(6)}`
}

function hash (key, ...properties) {
  const hmac = crypto.createHmac('sha256', key)

  properties.forEach(property => hmac.update(`${property}`))

  return hmac.digest('hex')
}

function getOs (deviceOsName, deviceOsVersion) {
  if (! deviceOsName) {
    return
  }

  switch (deviceOsName) {
    case 'Windows_NT':
    case 'WINNT':
      return {
        os_name: 'Windows',
        os_version: deviceOsVersion
      }

    case 'Darwin':
      return {
        os_name: 'Mac OS X',
        os_version: getMacOsVersion(deviceOsVersion)
      }

    default:
      return {
        os_name: deviceOsName,
        os_version: deviceOsVersion
      }
  }
}

function getMacOsVersion (deviceOsVersion) {
  const parts = deviceOsVersion.split('.')
  if (parts.length < 2) {
    return
  }

  const major = parseInt(parts[0])
  const minor = parseInt(parts[1])

  if (major >= 5 && minor >= 0) {
    // https://en.wikipedia.org/wiki/Darwin_(operating_system)#Release_history
    return `10.${major - 4}.${minor}`
  }
}
