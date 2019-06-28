# Firefox Accounts Device Registration

When using Firefox Accounts
to connect a device to Firefox Sync,
it is possible to annotate
the device's authentication token
with additional metadata
to improve the user experience.
Through the Device Registration API,
a device can:

- Customize the way it appears
  in the list of connected devices,
  by providing a display name
  and device type.
- Subscribe to push notification events
  by providing a webpush subscription endpoint.
- Provide functionality to its peers
  in an extensible manner
  by allowing other devices to send it commands,
  and by sending commands to other devices in turn.

A device may access the user's Sync data
using either a sessionToken
or an appropriately-scoped OAuth token,
so device registration requests may be authenticated
using either a sessionToken
or an OAuth refresh token
with scope **"https://identity.mozilla.com/apps/oldsync"**.

(The refresh token is used rather than an access token,
because the device is operating on its own data
that is held by the authorization server,
rather than exercising its delegated authority
to access the user's data on a separate resource server.)

## Basic Registration

Devices can manage their details
by POSTing a registration record
to `/v1/account/device`, like so:

```
POST /v1/account/device HTTP/1.1
Authorization: < sessionToken HAWK header | refreshToken Bearer header >
{
  "name": "my custom name",
  "type": "desktop"
}
------
HTTP/1.1 200 OK
{
  "id": "d3fc82acca7fc8c50acc06d21babbc00",
  "name": "my custom name",
  "type": "desktop"
}
```

The server allocates a unique ID for each device,
which can be provided
to update an existing device registration:

```
POST /v1/account/device HTTP/1.1
Authorization: < sessionToken HAWK header | refreshToken Bearer header >
{
  "id": "d3fc82acca7fc8c50acc06d21babbc00",
  "name": "my new name"
}
------
HTTP/1.1 200 OK
{
  "id": "d3fc82acca7fc8c50acc06d21babbc00",
  "name": "my new name",
  "type": "desktop"
}
```

Supported device type values
include "desktop", "mobile" and "tablet".

## Push Notifications

Devices can receive timely updates
on account lifecycle events
by providing a [push subscription](https://www.w3.org/TR/push-api/#push-subscription)
to which to server can publish notifications.

The push subscription consists of three fields:
a public key and authentication secret
that can be used to encrypt the notification,
and a callback URL to which it should be sent.
These can be provided in the device record
either during initial registration,
or as an update like so::

```
POST /v1/account/device HTTP/1.1
Authorization: < sessionToken HAWK header | refreshToken Bearer header >
{
  "id": "d3fc82acca7fc8c50acc06d21babbc00",
  "pushCallback": "https://updates.push.services.mozilla.com/ggYxFjPEjSM/Cg9Et44JFpg",
  "pushPublicKey": "jXPJHE7-n3cNZGyYBd0yz1BA0V1uLOn-QnOg4kOS1r-oHHep5lQc8KHySevTwVPmcS0oTs_MICMjoYCgA6979Hg",
  "pushAuthKey": "Wj18qUd0YS2-9vob79WdWg"
}
------
HTTP/1.1 200 OK
{
  "id": "d3fc82acca7fc8c50acc06d21babbc00",
  "name": "my custom name",
  "type": "desktop",
  "pushCallback": "https://updates.push.services.mozilla.com/ggYxFjPEjSM/Cg9Et44JFpg",
  "pushPublicKey": "jXPJHE7-n3cNZGyYBd0yz1BA0V1uLOn-QnOg4kOS1r-oHHep5lQc8KHySevTwVPmcS0oTs_MICMjoYCgA6979Hg",
  "pushAuthKey": "Wj18qUd0YS2-9vob79WdWg"
}
```

Once a webpush subscription is registered,
the device will receive push notifications
that match the JSON schema defined in [`pushpayloads.schema.json`](pushpayloads.schema.json).
For legacy reasons,
FxA may send an empty push notification
to indicate that an account has become verified.
All other notifications will have a "command" field
indicating the type of event,
and a "data" field containing an object
with additional event-specific data.

The currently supported notifications are:

- An empty notification.
  This indicates that the user's account
  has become verified
  and the device can start syncing data.
- `fxaccounts:device_connected`:
  A new device has been connected to the account.
  The device may wish to update
  any cached list of other connected devices.
- `fxaccounts:device_disconnected`:
  A device has been disconnected from the account.
  The `data` field will have an `id` attribute
  identifying the disconnected device.
  If this matches the device's own id
  then it should immediately discard
  any cached authentication tokens.
- `fxaccounts:profile_updated`:
  The user's profile information has changed,
  such as display name or email address.
- `fxaccounts:password_changed`:
  The user's password has changed.
  The device should discard any cached authentication tokens
  and prompt the user to re-enter their password.
- `fxaccounts:password_reset`:
  The user's password has changed.
  The device should discard any cached authentication tokens
  and prompt the user to re-enter their password.
- `fxaccounts:account_destroyed`:
  The user has deleted their account.
  The device should discard any cached authentication tokens
  and sign the user out.
- `fxaccounts:command_received`:
  Another device has invoked
  one of this device's advertised commands.
  See the next section for more details.

## Device Commands

Connected devices may be able to
offer functionality to one another
on a peer-to-peer basis,
such as the ability to send a tab
from one device to another.
To support this in a flexible and extensible manner,
FxA allows devices to advertize
their support for arbitrary "commands"
that can be invoked by other devices.
The FxA server will forward command invocations
from one device to another
without attempting to define or enforce
any particular semantics on them.

By way of example,
here is how two devices
could use the commands functionality
to implement the "send tab to device" feature
of Firefox Sync.

### Example: receiving a tab

First, the devices must agree
on a well-known name to identify the command.
It's useful to use a URI for this purpose
in order to avoid naming conflicts,
such as "https://identity.mozilla.com/cmd/open-uri"

A device wishing to receive tabs
sent from other devices
would first generate an ECDH keypair
that can be used to encrypt the tab data
while it's in transit.
It would encrypt the public key component
using a symmetric encryption key
that is shared by all connected devices,
such as the sync master key.
It would then advertize its support for this command
by including the "availableCommands" field
in its device registration record, like this:

```
POST /v1/account/device HTTP/1.1
Authorization: < sessionToken HAWK header | refreshToken Bearer header >
{
  "name": My Firefox",
  "type": "desktop",
  "pushCallback": "https://updates.push.services.mozilla.com/ggYxFjPEjSM/Cg9Et44JFpg",
  "pushPublicKey": "jXPJHE7-n3cNZGyYBd0yz1BA0V1uLOn-QnOg4kOS1r-oHHep5lQc8KHySevTwVPmcS0oTs_MICMjoYCgA6979Hg",
  "pushAuthKey": "Wj18qUd0YS2-9vob79WdWg"
  "availableCommands": {
    "https://identity.mozilla.com/cmd/open-uri": "...encrypted public key..."
  }
}
```

When another device invokes this command,
FxA will send a `command_received` push notification
to the receiving device
with a payload like:

```
{
  version: 1,
  command: "fxaccounts:command_received",
  data: {
    "command": "https://identity.mozilla.com/cmd/open-uri",
    "sender": "0a4abb5e6f2e378f3aadda7f97482e99",
    "url": "https://api.accounts.firefox.com/v1/device/commands?index=42&limit=1"
  }
}
```

Since push notifications can only contain
a limited amount of data,
the notification includes a URL
at which to fetch the full command payload,
which the device would load like so:

```
GET https://api.accounts.firefox.com/v1/device/commands?index=42&limit=1
Authorization: < sessionToken HAWK header | refreshToken Bearer header >
------
HTTP/1.1 200 OK
{
  index: 42,
  last: true,
  messages: [
    {
      index: 42,
      data: {
        command: "https://identity.mozilla.com/cmd/open-uri",
        sender: "0a4abb5e6f2e378f3aadda7f97482e99",
        payload: "...encrypted tab data payload..."
      }
    }
  ]
}
```

Finally, the device would
validate and decrypt the command payload
using its private key
and display the requested page.

The `/v1/account/device/commands` endpoint
allows fetching multiple messages,
and paging through the available messages,
using the [pushbox API](https://docs.google.com/document/d/1YT6gh125Tu03eM42Vb_LKjvgxc4qrGGZsty1_ajf2YM/edit?ts=5aefb8ad#heading=h.42fonoxbbyaz).
The "index" field acts as a pointer
into the message stream,
while the "last" field
indicates whether any more messages remain.
A client wishing to fetch all available commands
could page through the results like this:

```
let prev_index = <last seen index value>
all_commands = []
{ messages, index, last } = get(`/v1/account/device/commands?index=${prev_index}&limit=10`)
all_commands.push(...messages)
while not last:
  prev_index = index
  { messages, index, last } = get(`/v1/account/device/commands?index=${prev_index}&limit=10`)
  all_commands.push(...messages)
```

However, clients are encouraged
not to poll for commands in this manner
unless they believe that
they may have missed a push notification,
such as if their push subscription was invalidated.

### Example: sending a tab

When a device wants to send a tab,
it can use the device registration API
to find other connected devices
and their available commands:

```
GET /v1/account/devices HTTP/1.1
Authorization: < sessionToken HAWK header | refreshToken Bearer header >
------
HTTP/1.1 200 OK
[
  {
    "id": "d3fc82acca7fc8c50acc06d21babbc00",
    "name": My Firefox",
    "type": "desktop",
    "pushCallback": "https://updates.push.services.mozilla.com/ggYxFjPEjSM/Cg9Et44JFpg",
    "pushPublicKey": "jXPJHE7-n3cNZGyYBd0yz1BA0V1uLOn-QnOg4kOS1r-oHHep5lQc8KHySevTwVPmcS0oTs_MICMjoYCgA6979Hg",
    "pushAuthKey": "Wj18qUd0YS2-9vob79WdWg"
    "availableCommands": {
      "https://identity.mozilla.com/cmd/open-uri": "...encrypted public key..."
    }
  },
  {
    "id": "0a4abb5e6f2e378f3aadda7f97482e99",
    "name": My Fennec",
    "type": "mobile",
    "pushCallback": "https://updates.push.services.mozilla.com/ggYxFjPEjSM/Cg9Et44JFpg",
    "pushPublicKey": "jXPJHE7-n3cNZGyYBd0yz1BA0V1uLOn-QnOg4kOS1r-oHHep5lQc8KHySevTwVPmcS0oTs_MICMjoYCgA6979Hg",
    "pushAuthKey": "Wj18qUd0YS2-9vob79WdWg"
    "availableCommands": {}
  }
]
```

It can identify possible target devices
by looking in the "availableCommands" field.
When a target is selected,
it can decrypt the associated command metadata bundle
to obtain the device's public key,
and use that to construct
an encrypted payload of tab data.

It can then invoke the target device's "open-uri" command
like so:

```
POST /v1/account/devices/invoke_command HTTP/1.1
Authorization: < sessionToken HAWK header | refreshToken Bearer header >
{
  "target": "d3fc82acca7fc8c50acc06d21babbc00",
  "command": "https://identity.mozilla.com/cmd/open-uri",
  "payload": "...encrypted tab data payload..."
}
```

The FxA server will store this command
into the command queue for the target device,
and send it a `fxaccounts:command_received` push notification,
causing it to fetch the command
via the procedure outlined above.
