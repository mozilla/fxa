# fxa-event-broker

## Deployment

### Testing a Webhook URL

To verify that a webhookUrl can process a payload correctly, the simulator can
be used to generate a simulated JWT signed payload. The relying party can verify
this worked correctly before a full deployment occurs.

Command Syntax:

    node dist/bin/simulate-webhook-call.js CLIENTID WEBHOOKURL CAPABILITIES

Where `CAPABILITIES` is a comma-seperated string of capabilities to include.

#### Usage

    ```bash

    $ npm run build
    $ export LOG_FORMAT=pretty
    $ node dist/bin/simulate-webhook-call.js a9238ba https://example.com/webhook capability_1
    fxa-event-broker.simulateWebhookCall.INFO: webhookCall {"statusCode":200,"body":"ok\n"}
    $

    ```
