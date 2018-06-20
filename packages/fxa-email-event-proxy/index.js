// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, you can obtain one at https://mozilla.org/MPL/2.0/.

'use strict'

const Promise = require('bluebird')
const sqs = require('sqs')

const EVENTS = {
  BOUNCE: 'bounce',
  DELIVERED: 'delivered',
  DROPPED: 'dropped',
  SPAM: 'spamreport'
}

const { SQS_SUFFIX } = process.env

const QUEUES = {
  Bounce: `fxa-email-bounce-${SQS_SUFFIX}`,
  Complaint: `fxa-email-complaint-${SQS_SUFFIX}`,
  Delivery: `fxa-email-delivery-${SQS_SUFFIX}`
}

// env vars: SQS_ACCESS_KEY, SQS_SECRET_KEY, SQS_REGION
const SQS_CLIENT = sqs()
SQS_CLIENT.pushAsync = Promise.promisify(SQS_CLIENT.push)

module.exports = main

function main (data) {
  return Promise.resolve()
    .then(() => processEvents(JSON.parse(data)))
}

function processEvents (events) {
  return Promise.all(
    events.map(marshallEvent)
      .filter(event => !! event)
      .map(sendEvent)
  )
}

function marshallEvent (event) {
  const timestamp = mapTimestamp(event.timestamp)
  const mail = marshallMailObject(event, timestamp)

  switch (event.event) {
    case EVENTS.BOUNCE:
    case EVENTS.DROPPED:
      return { mail, ...marshallBounceEvent(event, timestamp) }

    case EVENTS.DELIVERED:
      return { mail, ...marshallDeliveryEvent(event, timestamp) }

    case EVENTS.SPAM:
      return { mail, ...marshallComplaintEvent(event, timestamp) }
  }
}

function mapTimestamp (timestamp) {
  return new Date(timestamp * 1000).toISOString()
}

function marshallMailObject (event, timestamp) {
  let messageId

  if (event.sg_message_id) {
    messageId = event.sg_message_id.split('.filter')[0]
  }

  return {
    timestamp,
    messageId
  }
}

function marshallBounceEvent (event, timestamp) {
  let bounceType, bounceSubType

  if (event.eventType === EVENTS.DROPPED) {
    bounceType = 'Permanent'
    bounceSubType = 'Suppressed'
  } else {
    // These status mappings aren't perfect but they're good enough. See
    // the RFCs and the IANA registry for all the gory detail on statuses:
    //
    //   * https://tools.ietf.org/html/rfc5248
    //   * https://tools.ietf.org/html/rfc3463
    //   * https://www.iana.org/assignments/smtp-enhanced-status-codes/smtp-enhanced-status-codes.xhtml
    const statusParts = event.status && event.status.split('.')
    if (statusParts && statusParts.length === 3) {
      if (statusParts[0] === '5') {
        bounceType = 'Permanent'
      }

      bounceSubType = mapStatusToBounceSubType(statusParts)
    }
  }

  return {
    notificationType: 'Bounce',
    bounce: {
      bounceType: bounceType || 'Transient',
      bounceSubType: bounceSubType || 'General',
      bouncedRecipients: [
        { emailAddress: event.email }
      ],
      timestamp,
      feedbackId: event.sg_event_id
    }
  }
}

function mapStatusToBounceSubType (statusParts) {
  switch (statusParts[1]) {
    case '1':
      return 'NoEmail'

    case '2':
      switch (statusParts[2]) {
        case '2':
          return 'MailboxFull'

        case '3':
          return 'MessageTooLarge'
      }
      break

    case '6':
      return 'ContentRejected'
  }
}

function marshallDeliveryEvent (event, timestamp) {
  return {
    notificationType: 'Delivery',
    delivery: {
      timestamp,
      recipients: [ event.email ],
      smtpResponse: event.response
    }
  }
}

function marshallComplaintEvent (event, timestamp) {
  return {
    notificationType: 'Complaint',
    complaint: {
      complainedRecipients: [
        { emailAddress: event.email }
      ],
      timestamp,
      feedbackId: event.sg_event_id
    }
  }
}

function sendEvent (event) {
  return SQS_CLIENT.pushAsync(QUEUES[event.notificationType], event)
    .then(() => console.log('Sent:', event.notificationType))
    .catch(error => {
      console.error('Failed to send event:', event)
      console.error(error.stack)
      throw error
    })
}
