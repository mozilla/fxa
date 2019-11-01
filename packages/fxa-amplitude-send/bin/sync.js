/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

const aws = require('aws-sdk')
const Promise = require('bluebird')

const { SQS_QUEUE_URL: QUEUE_URL } = process.env
const IMPL_PATTERN = /^(?:events|summary)$/

const [ IMPL, PATH ] = parseArgs(process.argv)

const impl = require(`../sync-${IMPL}`)

run()

function parseArgs (argv) {
  const argc = argv.length

  if (argc < 3 || argc > 4 || ! IMPL_PATTERN.test(argv[2])) {
    console.error(`Usage: ${argv[1]} events|summary [path]`)
    console.error('Specify either `events` or `summary` to indicate which Sync import job you wish to run.')
    console.error('[path] may be on the file system or S3. S3 paths must be prefixed with `s3://`.')
    console.error('Omit [path] to process messages from SQS.')
    process.exit(1)
  }

  [ 'FXA_AMPLITUDE_API_KEY', 'SYNC_INSERTID_HMAC_KEY' ].forEach(key => {
    if (! process.env[key]) {
      console.error(`Error: You must set the ${key} environment variable`)
      process.exit(1)
    }
  })

  if (argc === 3 && ! QUEUE_URL) {
    console.error('Error: You must set the SQS_QUEUE_URL environment variable')
    process.exit(1)
  }

  return [ argv[2], argv[3] ]
}

async function run () {
  try {
    let paths

    if (PATH) {
      paths = [ PATH ]
    } else {
      paths = await processQueue()
    }

    paths.forEach(path => impl.run(path))
  } catch (error) {
    console.error(error.stack)
    process.exit(1)
  }
}

async function processQueue () {
  console.log(`Fetching message from ${QUEUE_URL}`)

  const sqs = new aws.SQS({})
  const { Messages: messages } = await sqs.receiveMessage({
    MaxNumberOfMessages: 10,
    QueueUrl: QUEUE_URL,
    WaitTimeSeconds: 20
  }).promise()

  if (! messages) {
    console.log('Empty queue')
    return []
  }

  return Promise.all(messages.reduce((paths, message) => {
    const { records } = JSON.parse(message.Body)

    if (records) {
      records.forEach(record => {
        const { s3 } = record

        if (s3) {
          paths.push(`s3://${s3.bucket.name}/${s3.object.key}`)
        }
      })
    }

    sqs.deleteMessage({
      QueueUrl: QUEUE_URL,
      ReceiptHandle: message.ReceiptHandle
    })

    return paths
  }, []))
}
