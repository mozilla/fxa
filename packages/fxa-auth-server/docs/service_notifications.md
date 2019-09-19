# Firefox Accounts Attached Service Notifications.

Mozilla-hosted services that integrate with Firefox Accounts
have certain additional data-handling requirements,
such as a requirement to delete user data
when a user deletes their Firefox Account.

To help services meet these requirements,
FxA publishes a stream of notification events to
[SQS](https://aws.amazon.com/documentation/sqs/).
If you would like to connect your service
as a consumer of this stream,
please email fxa-staff@mozilla.com for assistance.

Each notification event has a JSON body
with an "event" key naming the type of event,
and other keys that vary
depending on the type of the event.
The types of event, the additional data they contain,
and the actions that attached services should take in response
are described below.

Due to the details of how events are published to SQS,
the event body is double-JSON-encoded
inside a wrapper object with a "Message" key,
so an example event would look something like this:

```
{"Message": "{\\"event\\": \\"delete\\", \\"uid\\": \\"d755addd247aa18e700486da98778fe3\\"}"}
```

For an example of how
to process these events in practice,
you can take a look at
the event-handling code from
the [sync tokenserver (python)](https://github.com/mozilla-services/tokenserver/blob/810117d/tokenserver/scripts/process_account_events.py).
or the [FxA profile server (nodejs)](https://github.com/mozilla/fxa-profile-server/blob/ce7a4d7/lib/events.js).

### Common Event Properties

All notifications will include the following properties
in their JSON body object:

- `event`: A string identifier for the type of event that occurred.
- `iss`: The API server that issued the event ("api.accounts.firefox.com" in production environments)
- `ts`: Integer timestamp when the event occurred, in seconds.
- `timestamp`: Integer millisecond timestamp at which the event occurred.
- `metricsContext`: optional object containing metrics parameters such as
  `utm_campaign` and `utm_source`.

Since SQS does not guarantee order of delivery of events,
reciving services should use the `ts` field
to help handle events
that may have been received out-of-order.

### Account Verification Event

Message Properties:

- `event`: The string "verified".
- `service`: The name of the service that was logged in to.
- `clientId`: The client id of the service that was logged in to.
- `uid`: The userid of the account being that was created.
- `email`: The primary email address that was verified for the account.
- `locale`: The accept-language header supplies by the user at account creation.
- `marketingOptIn`: Optional, boolean, whether the user opted-in to marketing emails.

Receiving services should use this message to initialize any state
that needs to exist for _all_ Firefox Accounts.

It's currently consumed by the email marketing team,
and new services probably shouldn't use it,
and instead prefer initializing state on demand
when seeing a user for the first time.

### Account Login Event

Message Properties:

- `event`: The string "login".
- `service`: The name of the service that was logged in to.
- `clientId`: Optional, the client id of the service that was logged in to.
- `uid`: The userid of the account being that was used to log in.
- `email`: The primary email address of the account.
- `deviceCount`: The number of active sessions on the user's account.
- `userAgent`: The user-agent header sent by the user on their login request.

This event is currently consumed by the email marketing team
in order to manage sync-setup-related email campaigns.
New services probably shouldn't use it.

### Account Deletion Event

Message Properties:

- `event`: The string "delete"
- `uid`: The userid of the account being deleted

Services receiving this event
should delete any data
held on behalf of the user,
taking particular care to purge
any PII such as email address.

Since the `uid` is an opaque identifier with no PII,
services _may_ keep the account uid
after deleting the user's data
if that simplifies their internal implementation.

### Password Reset Event

Message Properties:

- `event`: The string "reset".
- `uid`: The userid of the account that was reset.
- `generation`: A monotonically increasing integer for de-duping events (ok ok, it's a timestamp).

Services receiving this event should
terminate user login sessions
that were established prior to the event.

For Sync, the Sync authentication flow
exposes the "generation" number directly to the service,
so it can deny access to any requests with a generation number
lower than the one received in this event.

For other services,
there is no way to know the generation number
associated with a previous login.
It's probably best to ignore `generation`
and instead terminate login sessions
established prior to the timestamp in `ts`.

### Password Change Event

Message Properties:

- `event`: The string "passwordChange".
- `uid`: The userid of the account that had its password changed.
- `generation`: A monotonically increasing integer for de-duping events (ok ok, it's a timestamp).

As with the "reset" event above,
services receiving this event should
terminate user login sessions
that were established prior to the event.

### Change of Primary Email Address Event

Message Properties:

- `event`: The string "primaryEmailChanged".
- `uid`: The userid of the account that was updated.
- `email`: The email address that is the new primary for the account.

Note that the message does _not_ include
the previous primary email address.
Receiving services should use the `uid`
to uniquely identify a user,
and should update their records
of that user's preferred email address.

### Change of Profile Data

Message Properties:

- `event`: The string "profileDataChange".
- `uid`: The userid of the account that was updated.

Receiving services should update any cached profile information
that they hold about the user,
such as their display name or 2FA status.

### Device Connection Event

Message Properties:

- `event`: The string "device:create".
- `uid`: The userid of the account to which a device was connected.
- `id`: The id of the device that was connected.
- `type`: The type of device, e.g. "desktop" or "mobile".
- `isPlaceholder`: Boolean indicating whether the device explicitly registered itself,
  or had a device record implicitly created by the server.

Services that know about connected devices should,
upon receiving this event,
make accommodations for any state
that may need to be stored for that device

Sync is the only service
that currently knows about connected devices,
so other services probably shouldn't use this.

### Device Disconnection Event

Message Properties:

- `event`: The string "device:delete".
- `uid`: The userid of the account from which a device was disconnected.
- `id`: The id of the device that was disconnected.

Services that know about connected devices should,
upon receiving this event,
discard any transient state stored for that device
and deny any future access requests
made on behalf of that device.

Sync is the only service
that currently knows about connected devices,
so other services probably shouldn't use this.

### Subscription update event

- `event`: The string "subscription:update".
- `eventCreatedAt`: Integer second timestamp when the event originated.
- `uid`: User id.
- `subscriptionId`: Subscription id.
- `isActive`: Boolean indicating whether the subscription is active.
- `productId`: Product id.
- `productCapabilities`: Array of product capabilities.
