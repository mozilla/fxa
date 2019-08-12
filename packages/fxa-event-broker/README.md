# fxa-event-broker

The Firefox Accounts Event Broker (fxa-event-broker) is a webhook event delivery
system for events in Firefox Accounts. These events are currently consumed from an
internal priviledged queue that FxA services publish to, screened to determine what
Relying Parties (RPs) should receive them, then distributed via webhooks using the
[Security Event Token (SET)][set] format.

This event broker also stores event metadata, tracking which RPs a user has logged
into to screen event delivery to relevant RPs.

## Event Format

A relying party will get webhook calls for events. These events are encoded in
SETs with the following formats. See the [SET RFC][set] for definitions and other
examples.

### Subscription State Change

Sent when a user's subscription state has changed to RPs that provide the changed
subscription capability.

**NOTE**: There are strict requirements about subscription state change handling
based on the `changeTime` as documented below.

- Event Identifier
  - `https://schemas.accounts.firefox.com/event/subscription-state-change`
- Event Payload
  - [Subscription Event Identifier]
    - capabilities
      - List of subscription capabilities
    - isActive
      - Boolean indicating if the subscription should be considered active or not
        for the subscription capabilities provided.
    - changeTime
      - Time in seconds when the state change occured in the payment system.
        This value MUST be tracked by the receiving system, and events with a
        changeTime older than the last tracked time MUST be discarded.

### Example Subscription State Change Event

    {
     "iss": "https://accounts.firefox.com/",
     "sub": "FXA_USER_ID",
     "aud": "REMOTE_SYSTEM",
     "iat": 1565720808,
     "jti": "e19ed6c5-4816-4171-aa43-56ffe80dbda1",
     "events": {
       "https://schemas.accounts.firefox.com/event/subscription-state-change": {
           "capabilities": ["capability_1", "capability_2"],
           "isActive": true,
           "changeTime": 1565721242227
       }
     }

### Delete User

Sent when a user has been deleted from Firefox Accounts. RPs MUST delete all user
records for the given user when receiving this event.

- Event Identifier
  - `https://schemas.accounts.firefox.com/event/delete-user`
- Event Payload
  - [Delete Event Identifier]
    - `{}`

### Example Delete Event

    {
     "iss": "https://accounts.firefox.com/",
     "sub": "FXA_USER_ID",
     "aud": "REMOTE_SYSTEM",
     "iat": 1565720810,
     "jti": "1b3d623a-300a-4ab8-9241-855c35586809",
     "events": {
       "https://schemas.accounts.firefox.com/event/delete-user": {}
     }

## Deployment

### Testing a Webhook URL

To verify that a webhookUrl can process a payload correctly, the simulator can
be used to generate a simulated JWT signed payload. The relying party can verify
this worked correctly before a full deployment occurs.

Command Syntax:

    node dist/bin/simulate-webhook-call.js CLIENTID WEBHOOKURL CAPABILITIES

Where `CAPABILITIES` is a comma-seperated string of capabilities to include.

#### Usage

    $ npm run build
    $ export LOG_FORMAT=pretty
    $ node dist/bin/simulate-webhook-call.js a9238ba https://example.com/webhook capability_1
    fxa-event-broker.simulateWebhookCall.INFO: webhookCall {"statusCode":200,"body":"ok\n"}
    $

[set]: https://tools.ietf.org/html/rfc8417
