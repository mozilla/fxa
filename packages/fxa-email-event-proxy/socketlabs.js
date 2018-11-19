// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, you can obtain one at https://mozilla.org/MPL/2.0/.

// SocketLabs specific variables
const {
  SOCKETLABS_VALIDATION_KEY: VALIDATION_KEY,
  SOCKETLABS_SECRET_KEY: SECRET_KEY
} = process.env

if (! VALIDATION_KEY || ! SECRET_KEY) {
  throw new Error('Missing SocketLabs config')
}

const EVENTS = {
  VALIDATION: 'Validation',
  COMPLAINT: 'Complaint',
  FAILED: 'Failed',
  DELIVERED: 'Delivered'
}

function shouldValidate (event) {
  if (event.Type !== 'Validation') {
    return false
  }

  if (event.SecretKey !== SECRET_KEY) {
    throw new Error('Invalid Secret Key')
  }

  return true
}

function validationResponse () {
  const response = {
    statusCode: 200,
    body: JSON.stringify({ ValidationKey: VALIDATION_KEY }),
    isBase64Encoded: false
  }

  return response
}

// Socketlabs API wants the response to always include the ValidationKey.
// https://notify.docs.socketlabs.com/v1/example-post-events/failure-notification-example
function annotate (response) {
  if (! response.ValidationKey) {
    response.ValidationKey = VALIDATION_KEY
  }

  return response
}

function marshallEvent (event) {
  if (! event || ! event.Address || ! event.DateTime || ! event.Type || ! event.MessageId || event.SecretKey !== SECRET_KEY) {
    return
  }

  const timestamp = new Date(event.DateTime).toISOString()
  const mail = marshallMailObject(event, timestamp)

  switch (event.Type) {
    case EVENTS.FAILED:
      return { mail, ...marshallBounceEvent(event, timestamp) }

    case EVENTS.DELIVERED:
      return { mail, ...marshallDeliveryEvent(event, timestamp) }

    case EVENTS.COMPLAINT:
      return { mail, ...marshallComplaintEvent(event, timestamp) }
  }
}

function marshallMailObject (event, timestamp) {
  return {
    timestamp,
    messageId: event.MessageId
  }
}

function marshallBounceEvent (event, timestamp) {
  let [ bounceType, bounceSubType ] = mapFailureCodeToBounceTypes(event.FailureCode)

  return {
    notificationType: 'Bounce',
    bounce: {
      bounceType: bounceType,
      bounceSubType: bounceSubType,
      bouncedRecipients: [
        { emailAddress: event.Address }
      ],
      timestamp,
      feedbackId: event.MessageId
    }
  }
}

function mapFailureCodeToBounceTypes (failureCode) {
  // SocketLabs failure codes: https://support.socketlabs.com/index.php/Knowledgebase/Article/View/123
  // SNS bounce types: https://docs.aws.amazon.com/ses/latest/DeveloperGuide/notification-contents.html#bounce-types
  switch (failureCode) {
    case 1002:
    case 1003:
      return [ 'Permanent', 'Supressed' ]
    case 1004:
      return [ 'Transient', 'ContentRejected' ]
    case 1007:
      return [ 'Transient', 'AttachmentRejected' ]
    case 2001:
    case 2002:
    case 2003:
    case 2004:
    case 2999:
      return [ 'Permanent', 'NoEmail' ]
    case 3001:
      return [ 'Transient', 'MailboxFull' ]
    case 9999:
      return [ 'Undetermined', 'Undetermined' ]
    default:
      return [ 'Transient', 'General' ]
  }
}

function marshallDeliveryEvent (event, timestamp) {
  return {
    notificationType: 'Delivery',
    delivery: {
      timestamp,
      recipients: [ event.Address ],
      smtpResponse: event.Response
    }
  }
}

function marshallComplaintEvent (event, timestamp) {
  return {
    notificationType: 'Complaint',
    complaint: {
      complainedRecipients: [
        { emailAddress: event.Address }
      ],
      timestamp,
      feedbackId: event.MessageId
    }
  }
}

exports = module.exports = {
  annotate,
  shouldValidate,
  validationResponse,
  marshallEvent
}
