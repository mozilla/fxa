# fxa-sendgrid-event-proxy

[![Build Status](https://travis-ci.org/mozilla/fxa-sendgrid-event-proxy.svg?branch=master)](https://travis-ci.org/mozilla/fxa-sendgrid-event-proxy)

This repo proxies events
from the [Sengrid Event Webhook](https://sendgrid.com/docs/API_Reference/Event_Webhook/event.html)
to our SES bounce, complaint and delivery queues.
In doing so,
it acts as a bridge
that enables our existing queue-processing logic
in [`fxa-email-service`](https://github.com/mozilla/fxa-email-service).
to handle notifications that originate from Sendgrid.
It runs in AWS Lambda,
using the name `fxa-sendgrid-event-proxy`.
