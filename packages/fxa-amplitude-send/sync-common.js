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

const PARQUET_BATCH_SIZE = 16384
const AWS_ACCESS_KEY = process.env.FXA_AWS_ACCESS_KEY
const AWS_SECRET_KEY = process.env.FXA_AWS_SECRET_KEY
const MAX_EVENTS_PER_BATCH = 10
const API_KEY = process.env.FXA_AMPLITUDE_API_KEY
const S3_PATH = /^s3:\/\/([\w.-]+)\/(.+)$/
const AMPLITUDE_BACKOFF = 30000
const AMPLITUDE_RETRY_LIMIT = 3

module.exports = { run, hash, getOs }

function run (dataPath, impl) {
  const { createEventCounts, createEvent } = impl

  assertFunction(createEventCounts)
  assertFunction(createEvent)

  return Promise.resolve()
    .then(() => {
      const parts = S3_PATH.exec(dataPath)
      if (parts && parts.length === 3) {
        return processDataFromS3(parts[1], parts[2])
      }

      // HACK: Use a made-up submissionDate for local testing
      const submissionDate = new Date()
        .toJSON()
        .split('T')[0]
      return processData(readLocalData(dataPath), submissionDate)
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

    return rows.reduce(async (promise, row) => {
      await promise

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
    }, Promise.resolve())
      .then(() => {
        if (batch.length > 0) {
          return sendBatch(batch)
        }
      })
      .then(() => processData({ count, reader, schema, eventCounts, index: index + PARQUET_BATCH_SIZE }))
  }

  async function sendBatch (batch, iteration = 0) {
    try {
      return await request('https://api.amplitude.com/httpapi', {
        simple: true,
        method: 'POST',
        formData: {
          api_key: API_KEY,
          event: JSON.stringify(batch)
        }
      }).promise()
    } catch (error) {
      iteration += 1
      if (iteration === AMPLITUDE_RETRY_LIMIT) {
        throw error
      }

      if (error.statusCode === 429) {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            sendBatch(batch, iteration)
              .then(resolve, reject)
          }, AMPLITUDE_BACKOFF)
        })
      }

      return sendBatch(batch, iteration)
    }
  }

  async function processDataFromS3 (bucket, key) {
    const submissionDate = formatDate(key.split('=')[1].substr(0, 8))
    const fileName = await downloadFileFromS3(bucket, key)
    const data = readLocalData(fileName)
    const [ eventCounts ] = await Promise.all([ processData(data, submissionDate), fs.unlinkAsync(fileName) ])
    return eventCounts
  }

  function downloadFileFromS3 (bucket, key) {
    return new Promise((resolve, reject) => {
      const fileName = path.resolve(`${key.split('=')[1].replace('/', '-')}`)
      const client = s3.createClient({
        s3Options: {
          accessKeyId: AWS_ACCESS_KEY,
          secretKey: AWS_SECRET_KEY,
        }
      })
      const emitter = client.downloadFile({
        localFile: fileName,
        s3Params: {
          Bucket: bucket,
          Key: key,
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
