# Push Notifications for Account Status Changes

https://mozilla.aha.io/features/FXA-54

## Stories

As a user signed in to an FxA connected device,
I want my device to update its UI in a timely manner
when I verify or delete my account from another device.

As a developer of client code for a connected device,
I want to easily receive notifications so that I can
respond to account status changes without resorting to
polling the server.

As a developer of Firefox Accounts,
I want to stop Firefox from polling for account verification
because this is the single biggest source
of system load in production.

## Success Criteria

This feature will be successful if
we successfully eliminate polling for account verification
from the browser code on Desktop.
Mobile browsers are not in scope
for the initial version of this feature.

As a concrete metric
we can measure the number of calls to `/recovery_email/status`
and check that it decreases as this feature rolls out.

## Details

When FxA-45 lands,
connected devices will be able to register a push API endpoint
to receive notifications from the FxA server.
We will make use of this facility
to notify the device of account status changes.

The WebPush specification allows messages to be sent
with or without a payload.
To keep things simple
we will use a message with no payload to indicate
that there has been a change
in the core account status information,
without communicating any more precise details
of what that change may have been.
This will give us an opportunity to gain experience
with using push notifications in production,
without having to commit to and build
all the details of a full notification/communication protocol.

A future feature will define the semantics
of push notifications with an encrypted payload.

The fxa-auth-server will send a push notification
with no payload
to all registered devices
in response to the following actions:

* User verifies their account
* User deletes their account
* User resets their password

When the fxa-auth-server receives a `400` level
error response from the Push server it should set all push related fields
in the user's devices to an empty string.
This will allow the device to register again with the fxa-auth-server.
(Note that they need to be set to the empty string rather null, because the
updateDevice stored procedure uses COALESCE on the inputs.)

When a connected device receives
a push notification on its registered endpoint,
and the notification has no payload,
the device should perform the following checks
to update its view of the account status:

* Use its sessionToken to call the `/recovery_email/status` endpoint.
  If this succeeds,
  update account email and verification status
  to match the result,
  and stop.
  If this fails with a 401, continue.
* Call the `/account/status?uid=` endpoint using the account uid.
  If this reports that the account does not exist,
  disconnect from sync.
  If this reports that the account does exist,
  enter the "needs to reauthenticate" state.

We are currently ignoring push notification TTLs.
TTLs could become important when we move to messages with payload, 
where we might want more reliable delivery. See [discussion](https://github.com/mozilla/fxa-auth-server/issues/1164).

## Open Questions

* Do we need some fallback polling mechanism if the notification stuff
  gets in a bad state?

* Is there something better we can do in the face of deleted accounts?
  Particularly if the user is still in the signup flow, the browser could
  try to message that there was a problem and allow the user to try again.
