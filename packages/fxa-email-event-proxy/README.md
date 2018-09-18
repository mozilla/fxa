# fxa-email-event-proxy

[![Build Status](https://travis-ci.org/mozilla/fxa-email-event-proxy.svg?branch=master)](https://travis-ci.org/mozilla/fxa-email-event-proxy)

This repo proxies events
from the [Sengrid Event Webhook](https://sendgrid.com/docs/API_Reference/Event_Webhook/event.html)
and the [SocketLabs Notification API](https://www.socketlabs.com/api-reference/notification-api/)
to our SES bounce, complaint and delivery queues.
In doing so,
it acts as a bridge
that enables our existing queue-processing logic
in [`fxa-email-service`](https://github.com/mozilla/fxa-email-service)
to handle notifications that originate from Sendgrid and SocketLabs.
It runs in AWS Lambda,
behind an API Gateway trigger.

Note that events from
only one of either Sendgrid or SocketLabs
can be processed by any single instance
of this code.
If you want to process both,
you'll need to configure
two separate instances.

## Dev environment

The code runs in node.js
version 8 or later.
Assuming that you have
node and npm
set up already,
you can install the dependencies locally
like so:

```
npm i
```

You can run the tests
like so:

```
npm t
```

## Setting up Lambda

1. Zip up the source directory,
   including `node_modules`.

2. Create a new Lambda function.
   Upload the zip.

3. Assign it roles to access CloudWatch Logs
   and SQS bounce, complaint and delivery queues..

4. Set environment variables:

   * `AUTH`:
     Random authentication string
     used to block requests.
     By including the same string
     in your requests from Sendgrid/SocketLabs
     as the value of an `?auth=` query parameter,
     you can ensure that only valid traffic
     is able to send events successfully.

   * `PROVIDER`:
     Name of the provider
     this instance will handle requests from.
     Valid values are `sendgrid` and `socketlabs`.

   * `SQS_SUFFIX`:
     The suffix for queue names,
     e.g. `dev` or `stage`.
     This setting assumes that our queues
     are always named like
     `fxa-email-bounce-${SQS_SUFFIX}`.
     If that's not the case,
     we'll need to change the code.

   You can also set explicit values
   for `SQS_ACCESS_KEY`, `SQS_SECRET_KEY` and `SQS_REGION`
   if necessary.

5. If it's for SocketLabs,
   also set these environment variables
   based on settings available
   in the SocketLabs control panel:

   * `SOCKETLABS_SECRET_KEY`

   * `SOCKETLABS_VALIDATION_KEY`

6. Create an API Gateway trigger.
   Then configure Sendgrid or SocketLabs
   to use that URL for the webhook.

Config should look something like this at the end:

<img width="1281" alt="Screenshot showing AWS Lambda config to set up fxa-email-event-proxy for Sendgrid" src="https://user-images.githubusercontent.com/64367/43510256-fd421898-956c-11e8-9e19-a9066152d8c2.png" />

You can see working example Lambda functions
in the dev IAM:

* Sendgrid:
  https://console.aws.amazon.com/lambda/home?region=us-east-1#/functions/fxa-sendgrid-event-proxy?tab=graph

* SocketLabs:
  https://console.aws.amazon.com/lambda/home?region=us-east-1#/functions/fxa-socketlabs-event-proxy?tab=graph
