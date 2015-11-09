Firefox Device Registration
===========================

This is a breakdown of the "device" related states that are possible
in Firefox.

See [README.md](README.md) file for a list of requirements and user
stories.

## Possible device/FxA states

### Determining device state

The user's FxA state must be determined on Firefox startup. The profile's
stored `sessionToken` and `deviceID` are compared with information stored
by the FxA auth server.

If the user has a stored `sessionToken` it will be used to fetch the
user's device list.

* XXX - Does the `sessionToken` need to be checked for validity before
      the devices list is fetched?
* XXX - is this done before, after, or while Weave is initialized?
* XXX - What race conditions are possible between Weave and the device
      list check?
* XXX - Does the startup process change with push notifications?

### Steady states

There are two steady states:

1. User is not signed in to FxA, device is not registered,
   no device information is stored locally.
1. User is signed in to FxA, device is registered, device and FxA
   agree on the device's name and ID.

### New profile

If a user has not signed in to FxA backed service with the current Firefox
profile, they will have neither an FxA `sessionToken` nor an FxA `deviceID`.

Firefox must not take any action, this is a steady state.

### Existing profile, sessionToken is no longer valid

The user has previously signed in to Sync and the `sessionToken` is no
longer valid. This can occur if:

1. The user remotely disconnected the device.
1. The user reset the account password.
1. The user changed the account password.

* XXX - How do we determine why the sessionToken is no longer valid - ie,
      whether the user has disconnected the device vs user has reset or
      changed the account password? For a disconnect, the user should not
      be asked to re-authenticate. Reset and change password both require
      re-authentication.
* XXX - Is determining why a sessionToken is no longer valid only possible
      with push notifications? With push notifications, will the notification
      be received on startup if the user was offline/browser shut down when the
      notification was initially sent?

#### Remote disconnection

The user has remotely disconnected the device. All local FxA data must be
erased and the user should be disconnected from Sync. See
[Disconnecting a device](#disconnecting-a-device).

#### Password reset

The user's password has been reset through the password reset flow.
The user must be asked to re-authenticate with the existing `email`
and `deviceID`, if it exists. See [Reauthentication](#reauthentication).

#### Change password

The user has changed their password. The must should be asked to
re-authenticate with the existing `email` and `deviceID`, if
it exists. See [Reauthentication](#reauthentication).

### Existing profile, device not registered

The user has a valid FxA `sessionToken`, no FxA `deviceID`. This user has
previously signed in to Sync.

The user facing goal is for the device to appear in the user's device
list without additional user action. To facilitate this, Firefox
must register the device on behalf of the user.

Firefox should attempt to register the device with the FxA auth server
using the device name and type managed by Weave.  See
[Registering a device](#registering-a-device).

### Existing profile, device registered: device name mismatch

The user has a valid FxA `sessionToken` and FxA `deviceID`.
The `deviceName` on the browser and server do not match.

This user has previously signed in Sync and their device is already
registered. The user has remotely renamed the device.

See [Reconciling browser/server state](#reconciling-deviceserver-state).

### Existing profile, device registered: device names match

The user has both an FxA `sessionToken` and FxA `deviceID`.

Firefox should take no action. This is a steady state.

## Registering a device

Firefox must send the following information to the FxA auth server to
register the device:

* `deviceName` (from Sync preferences)
* `deviceType` (from Sync preferences)
* `pushCallback` (from Push preferences)
* `pushPublicKey` (from Push preferences)

### Registration success

The FxA auth server will respond with:

* `deviceID`
* `deviceName`
* `deviceType`
* `pushCallback`
* `pushPublicKey`

Firefox must store the returned `deviceID`.

### Registration failure

#### Network error

Firefox should re-attempt to register after a TBD interval has elapsed.

#### Invalid sessionToken

Firefox must ask the user to re-authenticate using the existing `email`.
See [Reauthentication](#reauthentication).

#### XXX - other errors.

## Reconciling a device/server name mismatch

### Device list fetch success

The FxA auth server will respond with an array of devices with the
following information:

* `deviceID`
* `deviceName`
* `deviceType`
* `pushCallback`
* `pushPublicKey`

If the user has remotely disconnected the device, Firefox must
disconnect the user from Sync. See
[Disconnecting a device](#disconnecting-a-device).

If the user has remotely changed or reset the account password,
Firefox must ask the user to re-authenticate with Firefox accounts.

If the user has remotely changed the current device's name, Firefox
should update Sync's `localName`.

### Device list fetch failure

#### Network error

Firefox should re-attempt to fetch the device list after a TBD
interval has elapsed.

#### Invalid sessionToken



## Disconnecting a device

All locally stored FxA information must be erased, including the `sessionToken`, `deviceID`, and `email` used to sign in to FxA. The `deviceName` is managed by Sync and must not be modified. The user must be disconnected from Sync if this has not already been done.

## Reauthentication

If a user must re-authenticate with FxA due to a password reset or changed
password, two actions should occur:

1. Users still connected to Sync must be disconnected.
1. The current `deviceID` must be associated with the new `sessionToken`.

XXX - Who will be responsible for associating the `deviceName`, `deviceID`
        with the `sessionToken`?
* The content server - pass the existing `deviceID` and `deviceName`
to the content server, which will then pass the information to the auth
server when it authenticates. The auth-server will automatically update
the association.
  * Sent using URL query parameters.
  * Sent via a WebChannel message from Firefox to FxA as part of a
"device handshake".
* The browser - wait for the [`fxaccount:login`](#fxaccountslogin)
message and have Firefox make a separate call to the auth server to update
the association.
* The former reduces potential timing problems. The second reduces the
amount of data that must be passed between Firefox and FxA and is a similar
case similar to [Registering a device](#registering-a-device).

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

Optional payload field:

`deviceID` - Only sent if the content server registered the device as
part of the login process.

#### No local `deviceID` exists

This occurs if the device has never been registered.

* If no `deviceID` is sent in the payload, Firefox must register the device.
  See [Registering a device](#registering-a-device).
* If a `deviceID` is sent in the payload, the device was registered as part
  of the login process. The `deviceID` should be stored.

#### A local `deviceID` exists

This occurs when the device has already been registered and the user must
re-authenticate for some reason, possibly due to a password reset or change
password.

* If no `deviceID` is sent in the payload, then Firefox must associate
  the `deviceID` with the new `sessionToken`.
  *  XXX Will this ever happen if the current `deviceID` is sent as part of
      the [Reauthentication](#reauthentication) process?
* If a `deviceID` is sent in the payload, the `deviceID` and new `sessionToken`
  the device was re-registered as part of the login process and Firefox
  should overwrite the existing local `deviceID`.

### `fxaccounts:logout`

The user has just signed out of Firefox Accounts, possibly by removing the current device from the device list. See [Disconnecting a device](#disconnecting-a-device).

## Data storage
The user's FxA sessionToken and uid are stored in the Firefox password manager
and managed by
[FxAccountsStorage.jsm](https://dxr.mozilla.org/mozilla-central/source/services/fxaccounts/FxAccountsStorage.jsm). The FxA `deviceID` should also be managed by FxAccountsStorage.jsm and could be stored as a [plaintext field](https://dxr.mozilla.org/mozilla-central/rev/6077f51254c69a1e14e1b61acba4af451bf1783e/services/fxaccounts/FxAccountsCommon.js#220). To avoid "cache coherency" problems, the device name will be managed by the Weave Service's [clientsEngine.localName](https://dxr.mozilla.org/mozilla-central/rev/6077f51254c69a1e14e1b61acba4af451bf1783e/services/sync/modules/engines/clients.js#116). Updating the `localName` has the advantage of causing a name propagation to all interested UI elements.

## Push notifications

Implementing push notification handling has been deferred to the second round.
