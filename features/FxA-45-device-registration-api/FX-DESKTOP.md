Firefox Device Registration
===========================

This is a breakdown of the "device" related states that are possible
in Firefox.

See the [README.md](README.md) file for a list of requirements and user
stories.

## Possible device/FxA states

There are two steady states:

1. User is not signed in to FxA, device is not registered,
   no device information is stored locally.
1. User is signed in to FxA, device is registered, device and FxA
   agree on the device's name and ID.

### New profile

Users of a new Firefox profile who have never signed up/in to an FxA backed
service will have neither an FxA sessionToken nor an FxA device ID.

Firefox should take no action, this is a steady state.

### Existing profile, sessionToken is no longer valid

The user has previously signed in to Sync but the `sessionToken` is no
longer valid. This can occur if:

1. The user remotely disconnected the device.
1. The user reset the account password.
1. The user changed the account password.


XXX How are we going to know why the user has disconnected the device vs
user has reset or changed the account password? In the first, we should
not ask the user to re-authenticate. In the 2nd and 3rd, we should
ask the user to re-authenticate.

In the first, the local deviceID, FxA email address and sessionToken should be deleted.
In the 2nd and 3rd, the local FxA email address and deviceID need to be preserved and associated with a new sessionToken.

#### Remote disconnection

The user has remotely disconnected the device. All local FxA data should be
erased and the user should be disconnected from Sync. See the section
[Disconnecting a device](#disconnecting-a-device).

#### Password reset

In this case, the user's password has been reset through the password
reset flow. The user should be asked to re-authenticate with the
existing `email` and `deviceID`, if it exists. See the section
[Reauthentication](#reauthentication).

#### Change password

In this case, the user has changed their password. The user should be
asked to re-authenticate with the existing `email` and `deviceID`, if
exists. See the section [Reauthentication](#reauthentication).

### Existing profile, device not registered

The user has a valid FxA sessionToken, no FxA deviceID.

This is a user who has previously signed in to FxA to connect
to Sync. This user will have an FxA sessionToken, but may not yet
have an FxA deviceID.

The user facing goal is for the device to appear in the user's device
list without additional user action. To facilitate this, Firefox
should register the device on behalf of the user.

On startup, Firefox should attempt to register the device with the
FxA auth server using the name and type currently stored in the
user's Sync preferences.

See the section [Registering a device](#registering-a-device).

### Existing profile, device registered: device name mismatch

The user has both a valid FxA sessionToken and FxA deviceID,
deviceName on the browser and server do not match.

This is a user who has previously signed in to FxA to
connect to Sync and their device is already registered.

This device has already sent its initial name to the FxA
auth server, but the user may have remotely disconnected
the device, remotely reset the account password, remotely
changed the account password, or remotely renamed the
device. The FxA auth server is considered the canonical
source of truth for device state.

On startup, Firefox should fetch the current device list
from the FxA auth server and compare internal Firefox state
with the state returned from the auth server.

See the section [Reconciling browser/server state](#reconciling-deviceserver-state).

### Existing profile, device registered: device names match

The user has both an FxA sessionToken and FxA deviceID, deviceName on the
browser and server do not match.

On startup, Firefox should fetch the current device list
from the FxA auth server and compare internal Firefox state
with the state returned from the auth server.

If the deviceName and deviceID match, Firefox should take no
action. This is a steady state.

## Registering a device

Firefox will send the following information to the FxA auth server to
register the device:

* deviceName (from Sync preferences)
* deviceType (from Sync preferences)
* pushCallback (from Push preferences)
* pushPublicKey (from Push preferences)

### Registration success

The FxA auth server will respond with:

* deviceID
* deviceName
* deviceType
* pushCallback
* pushPublicKey

Firefox must then store the returned deviceID.

### Registration failure

If registration fails because of a network error, Firefox should re-attempt
to register after a TBD interval has elapsed.

If registration fails for other reasons - WHAT HERE?

## Reconciling a device/server name mismatch

### Device list fetch success

The FxA auth server will respond with an array of devices with the
following information:

* deviceID
* deviceName
* deviceType
* pushCallback
* pushPublicKey

If the user has remotely disconnected the device, Firefox
should disconnect the user from Sync (and wipe their FxA sessionToken?)

If the user has remotely changed or reset the account password,
Firefox should ask the user to re-authenticate with Firefox accounts.

If the user has remotely changed the current device's name, Firefox
should update Sync's `localName`.

### Device list fetch failure

If device list fails because of a network error, Firefox should re-attempt
to re-fetch the list after a TBD interval has elapsed.

## Disconnecting a device

All locally stored FxA information should be erased, including the `sessionToken`, `deviceID`, and `email` used to sign in to FxA. The `deviceName` is managed by Sync and should not be affected. If not already done, the browser should disconnect from Sync.

## Reauthentication

If a user must re-authenticate with FxA due to a password reset or changed
password, two actions should occur:

1. If the user is connected to Sync, they should be disconnected.
2. The current `deviceID` needs to be associated with the new `sessionToken`.

TODO - lots of questions below!!!!

One way of doing this is is to pass the existing `deviceID` and `deviceName`
to the content server, which will then pass the information to the auth
server whenever it authenticates. The auth-server will automatically update
the association. These items could be passed using URL query parameters, or
could be sent via a WebChannel message from Firefox to FxA as part of a
"device handshake".

Another possibility is to wait for the [`fxaccount:login`](#fxaccountslogin)
message and have Firefox make a separate call to the auth server to update
the association.

The former reduces potential timing problems. The second reduces communication
the amount of data that must be passed between Firefox and FxA.

## WebChannel messages to Firefox from FxA

### `fxaccounts:login`

A user has just authenticated with Firefox Accounts. The message payload
will contain:

```js
{
  customizeSync: (true|false),
  declinedSyncEngines [<array of declined sync engines>],
  email: <email>,
  keyFetchToken: <key fetch token>,
  sessionToken: <session token>,
  uid: <user id>,
  unwrapBKey: <unwrap b key>,
  verified: (true|false),
  verifiedCanLinkAccount: (true|false)
}
```

optional payload field:

`deviceID` - this can be sent if the content server registered the device as
part of the login process.

If no local `deviceID` exists and no `deviceID` is sent in the payload, Firefox should register the device. See the section titled [Registering a device](#registering-a-device).

If a local `deviceID` exists, the user has re-authenticated due to a
password reset or change password.

* If a `deviceID` is sent in the payload, then the device was re-registered as
part of the login process and Firefox should overwrite the existing local
`deviceID`.
* If no `deviceID` is sent in the payload, then XXX?

XXX Will the devices API automatically re-associate the old deviceID with the
new sessionToken when the user signs in? Is there any mechanism for the auth
server to do that automatically? Can the `FxAccountClient.updateDevice` be
called with the new `sessionToken` and existing `deviceID` and the auth
server take care of updating the association?

### `fxaccounts:logout`

The user has just signed out of Firefox Accounts by removing the current device from the device list. See the section [Disconnecting a device](#disconnecting-a-device).

## Data storage
The user's FxA sessionToken and uid are stored in the Firefox password manager
and managed by
[FxAccountsStorage.jsm](https://dxr.mozilla.org/mozilla-central/source/services/fxaccounts/FxAccountsStorage.jsm). The FxA `deviceID` should also be managed by FxAccountsStorage.jsm and could be stored as a [plaintext field](https://dxr.mozilla.org/mozilla-central/rev/6077f51254c69a1e14e1b61acba4af451bf1783e/services/fxaccounts/FxAccountsCommon.js#220). To avoid "cache coherency" problems, the device name will be managed by the Weave Service's [clientsEngine.localName](https://dxr.mozilla.org/mozilla-central/rev/6077f51254c69a1e14e1b61acba4af451bf1783e/services/sync/modules/engines/clients.js#116). Updating the `localName` has the advantage of causing a name propagation to all interested UI elements.

## Push notifications

Implementing push notification handling has been deferred to the second round.
