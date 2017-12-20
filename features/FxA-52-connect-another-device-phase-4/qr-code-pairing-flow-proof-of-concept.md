# QR code base pairing flow P.O.C.

The idea is to pair a mobile device to a desktop device by scanning
a QR code, no typing needed.

## How it works

At the highest level, the basic idea is for a mobile device to
start syncing by populating all necessary info based on info
already held by a desktop device.

At a more detailed level, the minimum info necessary for a device
to start syncing without typing a password is a uid, sessionToken,
kA, and kB.

If one device already has these items, a 2nd device can use them
to start syncing itself.

What is needed:

1. A way to get a uid, sessionToken, kA, and kB out of device A.
2. A secure way of transmitting this info from device A to device B.
3. A way for device B to use this info to start syncing.

## Getting a uid, sessionToken, kA, and kB out of device A

On Firefox Desktop, a web channel message (fxaccounts:keys) is used
to request the required info from the browser. A new command is
used instead of overridding an existing command so that the browser
could choose to implement some UI asking the user for permission
to extract the keys. The browser responds to the request
with a JSON response that contains the uid, sessionToken, kA, and kB.

## Securely transmitting info from device A to device B.

Once the browser responds to the fxaccounts:keys request,
the bundle is encrypted using a symmetric cipher using a locally
generated random keypair. A request is made to the auth-server
to send an SMS and store the encrypted bundle with the SMS's signinCode.
The signinCode is returned to the content-server.

A URL is generated to the content-server's pairing page. The URL's hash
portion contains both the signinCode and the key used to encrypt
the bundle. Because the key is stored in a hash variable, neither Mozilla
nor any other server learn the key needed to decrypt the bundle.
A QR code is generated from the URL and displayed to the user.

The user then opens the QR code scanner from the URL bar in Fennec
and scans the generated QR code.

The content server looks at the hash parameters to learn the
signinCode and encrytion key. It consumes the signinCode from
the auth-server and uses the encryption key to decrypt the bundle.
Again, the bundle contains a uid, sessionToken, kA, and kB.

## Device B uses this info to start syncing.

Device B then requests a new sessionToken using the sessionToken
from the bundle so that each device has its own sessionToken and a
new device record is created for device B.

The content-server sends an `fxaccounts:login` message with
the newly generated sessionToken, uid, kA, and kB to the browser.

The browser accepts this info, and instead of doing the existing flow
where it uses unwrapBKey and a keyFetchToken to fetch kA and kB,
it uses the passed in kA and kB directly. The browser now has everything
it needs to start syncing.

## P.O.C. Code

Code for Firefox desktop and Android is at:

https://gist.github.com/shane-tomlinson/4cd89cdecde9a12499e45f24f59bd004

Code for fxa-content-server is at:

https://github.com/shane-tomlinson/fxa-content-server/tree/qr-code-pair-flow

Code for fxa-auth-server is at:

https://github.com/shane-tomlinson/fxa-auth-server/tree/signin-codes

Code for fxa-auth-db-mysql is at:

https://github.com/shane-tomlinson/fxa-auth-db-mysql/tree/signin-codes

## Running the P.O.C. in Firefox Desktop and Android

1. Update fxa-local-dev to use the QR code branches:
   1. Check out the content-server, auth-server, and auth-db-mysql branches referred to above. After checking out the branches, run `npm install` in each server subdirectory.
   2. In fxa-local-dev, update servers.json to point at the branches in step 1.1.
   3. In fxa-local-dev, restart the servers using `pm2 kill && npm run start-android`. Note the server URLs.
2. Update mozilla-central with the patch from https://gist.github.com/shane-tomlinson/4cd89cdecde9a12499e45f24f59bd004
3. Set up and build Firefox Desktop
   1. Run ./mach bootstrap, set up a "Desktop Artifact build"
   2. Run ./mach build
   3. Run ./mach run
   4. Open about:config, update the appropriate fxaccounts config values to point to the servers from steps 1.3.
4. Set up and build Firefox for Android
   1. See https://developer.mozilla.org/en-US/docs/Mozilla/Developer_guide/Build_Instructions/Simple_Firefox_for_Android_build as a reference.
   2. Run ./mach boostrap, set up an "Android Artifact build"
   3. Run ./mach build
   4. Connect an Android device with USB debugging enabled to the desktop machine.
   5. Run ./mach package && ./mach install && ./mach run
   6. Open about:config, update the appropriate fxaccounts config values to point to the servers from steps 1.3.
5. Play with the UI!
   1. In Firefox Desktop, sign up for a new Firefox Account via about:preferences#sync.
   2. Open the verification link in the same browser as 5.1. Fill out a valid phone number, click submit.
   3. A QR code should appear. On your Android device, open the Fennec process started by step 4.5.
   4. Open the QR code scanner from the URL bar.
   5. Scan the QR code - FxA should open and you should be signed in to Sync.

## Fx for iOS

A P.O.C. has not yet been written for Firefox for iOS. Firefox for iOS
uses a different communication mechanism than Firefox for Android.
In Fx for iOS, the browser only listens for messages from FxA from within
the browser's "settings" panel. This has the effect that login messages sent
from FxA when opened from a QR code are ignored.

To get a P.O.C. running on Fx for iOS, one of two things is needed:

1. Fx for iOS must listen to messages from arbitrary tabs.
2. Fx for iOS must open the link from the QR code within the FxA panel in settings.

The first intuitively feels like more work but may serve us better in
the long run since similar functionality is needed
[for other features](https://github.com/mozilla/fxa-content-server/issues/5434).

## Limitations/deficiencies of the P.O.C.

1. No encryption occurs when storing the bundle on the auth-server. All the
hooks are in place to encrypt/decrypt the bundle, but time limitations
made me defer this.
2. The sessionToken passed to device B is not cloned, instead it is used
directly, causing device A to eventually log out. The auth-server does
not yet [have an endpoint to clone a session](https://github.com/mozilla/fxa-auth-server/issues/2236).
3. Fx for iOS does not work (see above). Once the messaging has been
figured out, it should be straight forward to update the Fx for iOS state
machine in a similar manner to the Fx for Android state machine, and may
be easier because the new state needed in Fx for Android already exists.
4. It is not possible to pair a desktop device with another desktop device.




