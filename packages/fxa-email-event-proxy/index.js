// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, you can obtain one at https://mozilla.org/MPL/2.0/.

'use strict';

const crypto = require('crypto');
const qs = require('qs');
const Promise = require('bluebird');
const AWS = require('aws-sdk');
const P = require('bluebird');

AWS.config.setPromisesDependency(P);

const {
  AUTH,
  PROVIDER,
  SQS_REGION,
  BOUNCE_QUEUE_URL,
  COMPLAINT_QUEUE_URL,
  DELIVERY_QUEUE_URL,
} = process.env;

const region = SQS_REGION || 'us-east-1';

if (
  ! AUTH ||
  ! PROVIDER ||
  ! BOUNCE_QUEUE_URL ||
  ! COMPLAINT_QUEUE_URL ||
  ! DELIVERY_QUEUE_URL
) {
  throw new Error('Missing config');
}

const ACCEPTED_PROVIDERS = ['sendgrid', 'socketlabs'];

if (! ACCEPTED_PROVIDERS.includes(PROVIDER)) {
  throw new Error(
    `Only the following providers are supported: ${ACCEPTED_PROVIDERS.join(
      ', '
    )}`
  );
}

const provider = require(`./${PROVIDER}`);

const AUTH_HASH = createHash(AUTH).split('');

const QUEUES = {
  Bounce: BOUNCE_QUEUE_URL,
  Complaint: COMPLAINT_QUEUE_URL,
  Delivery: DELIVERY_QUEUE_URL,
};

const SQS = new AWS.SQS({ region });

module.exports = { main };

async function main(data) {
  // If there's a body, it's a request from the API gateway
  if (data.body) {
    // Requests from the API gateway must be authenticated
    if (
      ! data.queryStringParameters ||
      ! authenticate(data.queryStringParameters.auth)
    ) {
      const errorResponse = {
        error: 'Unauthorized',
        errno: 999,
        code: 401,
        message: 'Request must provide a valid auth query param.',
      };
      return {
        statusCode: 401,
        body: JSON.stringify(errorResponse),
        isBase64Encoded: false,
      };
    }

    if (
      data.headers &&
      data.headers['Content-Type'] === 'application/x-www-form-urlencoded'
    ) {
      data = qs.parse(data.body);
    } else {
      data = JSON.parse(data.body);
    }
  }

  if (! Array.isArray(data)) {
    data = [data];
  }

  if (PROVIDER === 'socketlabs' && provider.shouldValidate(data[0])) {
    return provider.validationResponse();
  }

  const results = await processEvents(data);
  let response = {
    result: `Processed ${results.length} events`,
  };

  response = provider.annotate(response);

  return {
    statusCode: 200,
    body: JSON.stringify(response),
    isBase64Encoded: false,
  };
}

function authenticate(auth) {
  const authHash = createHash(auth);
  return AUTH_HASH.reduce(
    (equal, char, index) => equal && char === authHash[index],
    true
  );
}

function createHash(value) {
  const hash = crypto.createHash('sha256');
  hash.update(value);
  return hash.digest('base64');
}

async function processEvents(events) {
  return Promise.all(
    events
      .map(provider.marshallEvent)
      .filter(event => !! event)
      .map(sendEvent)
  );
}

function sendEvent(event) {
  // The message we send to SQS has to have this structure to
  // mimic exactly the message SNS sends to it in the SES -> SNS -> SQS flow.
  // See documentation: https://docs.aws.amazon.com/sns/latest/dg/SendMessageToSQS.html
  const message = {
    Message: JSON.stringify(event),
    Type: 'Notification',
    Timestamp:
      event.mail && event.mail.timestamp
        ? event.mail.timestamp
        : new Date().toISOString(),
  };
  const queueUrl = QUEUES[event.notificationType];
  const params = {
    QueueUrl: queueUrl,
    MessageBody: JSON.stringify(message),
  };

  return SQS.sendMessage(params)
    .promise()
    .then(() => console.log('Sent:', event.notificationType))
    .catch(error => {
      console.error('Failed to send event:', event);
      console.error(error && error.stack);
      throw error;
    });
}
