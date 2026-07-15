# Testing and debugging pairing flows on a device

This is the hands-on guide: how to run the FxA device-pairing (QR sign-in) flow
yourself on an Android emulator or a real phone, point it at a local FxA stack,
and see what's happening (console, network, breakpoints). iOS is covered at the
end.

For the automated cross-device E2E tests, see the specs in
`packages/functional-tests/tests/pairing/`.

## The pairing model

Pairing connects an already-signed-in Firefox (the _authority_) to a new device
(the _supplicant_):

1. The authority (a signed-in desktop Firefox) opens its pairing page and shows a
   QR code encoding `.../pair#channel_id=...&channel_key=...`.
2. The supplicant (mobile Firefox) scans or opens that URL, connects to the
   pairing channel server over a WebSocket, and loads `/pair/supp`.
3. Both sides confirm, the supplicant finishes OAuth, and its device registers on
   the account.

So testing end to end means two browsers: a signed-in desktop Firefox as the
authority and a mobile Firefox as the supplicant, both pointed at the same stack.
The channel server defaults to production even locally, so the device still needs
to reach the internet.

## Setup

You need the FxA stack running and a Fenix debug build to install.

Start the stack from the repo root: `yarn install` once, then `yarn start` (or
`yarn start mza` for a faster core subset, or `yarn start infrastructure` if
Docker isn't up). That gives you content-server on :3030 and auth-server on
:9000. The Fenix client id is already in `packages/fxa-auth-server/config/dev.json`.

Build the Fenix debug app from a
[`mozilla-firefox/firefox`](https://github.com/mozilla-firefox/firefox) checkout; it
has the Sync Debug pairing hook. Clone it and run the one-time Android bootstrap:

```bash
git clone https://github.com/mozilla-firefox/firefox
cd firefox
./mach --no-interactive bootstrap --application-choice mobile_android_artifact_mode
./mach build && ./mach gradle :fenix:installDebug
```

To update an existing checkout later, `git pull` and re-run the last line.

See the [Firefox source docs (Android)](https://firefox-source-docs.mozilla.org/mobile/android/),
the [contributor quick-ref](https://firefox-source-docs.mozilla.org/contributing/contribution_quickref.html),
and [FxA ecosystem Android debugging](https://mozilla.github.io/ecosystem-platform/reference/mobile-specifics#android-debugging).
For the iOS notes below you'll also want a
[firefox-ios](https://github.com/mozilla-mobile/firefox-ios/blob/main/README.md)
checkout.

---

## Android

### Using an emulator (Android Studio)

Create an AVD in Android Studio's Device Manager, or launch one from the SDK:
`emulator -avd <name> -dns-server 8.8.8.8`. Install the debug app with
`./mach gradle :fenix:installDebug` (or `adb install -r <apk>`). If you don't have
`adb`, install the platform tools first (`brew install --cask android-platform-tools`);
you can also drag-and-drop an APK onto a running emulator to install it.

Stock Firefox for Android builds are on
[archive.mozilla.org](https://archive.mozilla.org/pub/fenix/releases/) (match the
emulator's CPU architecture), but they don't include the Sync Debug pairing hook, so
for pairing you need the debug build you built above.

GeckoView debug APKs are big (~170 MB), so if the install dies with
`INSUFFICIENT_STORAGE`, relaunch the AVD with `-wipe-data -partition-size 8192`.

An emulator has no camera, so you can't scan a QR. Trigger pairing through the
Sync Debug hook instead (see "Trigger a pairing").

### Using a real device

On the phone, turn on Developer options (tap Build number seven times) and USB
debugging. Plug in over USB, accept the RSA prompt, and check it shows up in
`adb devices`. Install the APK with `adb install -r <path-to>/fenix-arm64-v8a-debug.apk`.
A real phone has a camera, so you can scan the authority's QR code directly.

### Point Fenix at your local stack

Out of the box the app talks to production. Two things point it at your local
stack.

First, bridge the ports so the device's `localhost` reaches your machine:
`yarn adb-reverse` (works over USB and on the emulator). Then override the FxA
server: in Fenix, Settings → Sync Debug → "Custom Mozilla account server", set to
`http://localhost:3030`. Writing the `pref_key_override_fxa_server` pref directly
and cold-starting is more reliable than the on-screen field, which tends not to
stick. To write it directly, force-stop the app
(`adb shell am force-stop org.mozilla.fenix.debug`), edit its
`shared_prefs/fenix_preferences.xml` from inside the app sandbox
(`adb shell run-as org.mozilla.fenix.debug`) to add
`<string name="pref_key_override_fxa_server">http://localhost:3030</string>`, then
cold-start. It's an Android SharedPreferences entry, not a Gecko pref, so
`about:config` can't set it.

There's one more catch for local runs. The built-in `fxawebchannel` extension
only allowlists the production/stage/dev FxA hosts in its `content_scripts.matches`,
not `localhost`, so on `http://localhost:3030` the final "you're signed in"
webchannel message is dropped and the device never registers. Patch the template
and rebuild:
`.../feature/accounts/src/main/assets/extensions/fxawebchannel/manifest.template.json`
(edit the template, not the generated `.json`), adding `"http://localhost/*"` and
`"http://127.0.0.1/*"` to `matches`. This isn't in-tree yet (tracked separately);
stage and prod hosts are already allowlisted.

### Trigger a pairing

1. In a signed-in desktop Firefox (the authority), open the Sync "connect another
   device" flow (Settings → Sync) to display the pairing QR code.
2. On the device, either scan the QR with the camera (real device) or paste the
   pairing URL into Settings → Sync Debug → "Pairing (debug)" → Begin pairing
   (emulator).
3. Approve on the desktop and confirm on the device. The device registers on the
   account.

### Enable USB / remote debugging

USB debugging is the Developer options toggle above; that's what lets `adb` talk
to the device.

To inspect the pairing web pages (they run in GeckoView), use Firefox remote
debugging. Turn it on once in Fenix (Settings → "Remote debugging via USB"), then
on desktop Firefox open `about:debugging` → This Firefox / Setup, connect to the
device, and Inspect the pairing tab. That gives you the full Firefox DevTools
against the live on-device page, which is where the console, network, and
breakpoint tools below live.

Alongside the pairing tab, that same `about:debugging` device page lists a
"Multiprocess Toolbox" at the bottom. Inspecting it shows Firefox's own logs and
network requests, handy for sanity-checking the other calls the browser makes to the
FxA APIs or to Sync.

### See console logs

For app and Kotlin logs, use `adb logcat` (filter with
`--pid=$(adb shell pidof org.mozilla.fenix.debug)`); the pairing logs show up
under `FirefoxAccountStateMachine` and `mozac-fxawebchannel`. For the web pages'
console, use the Console tab of the remote DevTools session from `about:debugging`.

### See network requests

In that same remote DevTools session, the Network tab shows the pairing page's
calls to the channel server and the FxA endpoints.

### Set breakpoints

For Kotlin and app code, open the Fenix project in Android Studio and attach the
debugger to `org.mozilla.fenix.debug`. For the web code, set breakpoints in the
Debugger tab of the remote DevTools session.

---

## iOS

The iOS supplicant is Firefox iOS, on a Simulator or a registered device. Same
ideas as Android, different tools: Xcode and Safari Web Inspector.

> Heads up: the iOS steps below haven't been re-run end to end (Android is the path
> that was exercised end to end), so treat them as the documented procedure and
> verify as you go.

### Using a simulator (Xcode)

Boot one with `xcrun simctl boot "iPhone 16"` (or from Xcode → Devices &
Simulators), then build and run Firefox iOS (Fennec scheme) from a firefox-ios
checkout. The Simulator shares your Mac's network, so `http://localhost:3030`
reaches the local stack directly, with no port bridging and no webchannel patch.
There's no camera, so trigger pairing through the debug "Launch pairing from URL"
setting rather than a scan.

### Using a real device

Register the device in Xcode (Devices & Simulators) and pick it as the run
destination; you'll need a development signing profile. Its `localhost` is the
phone, not your Mac, so point the FxA server override at the Mac's LAN IP or a
tunnel, e.g. `http://<mac-lan-ip>:3030`. The local stack's OAuth redirect URIs are
set up for `localhost:3030`, so a LAN or tunnel URL can need extra stack config; a
simulator (or stage/prod) sidesteps that.

### Point Firefox iOS at your local stack

Set it by hand: Settings → reveal the debug settings (tap the app-version row five
times) → Advanced Account Settings → turn on "Use custom FxA content server" and
enter the URL. That writes the `KeyUseCustomFxAContentServer` and
`KeyCustomFxAContentServer` prefs the account manager reads at launch.

### Enable USB / remote (Web Inspector) debugging

The pairing pages run in a WKWebView, so you inspect them with Safari Web
Inspector. To set it up:

1. On the Mac, turn on the Develop menu: Safari → Settings → Advanced → "Show
   features for web developers".
2. For a real device, enable Settings → Safari → Advanced → Web Inspector, then
   connect it over USB and tap Trust when prompted. A simulator needs no toggle.
3. Launch Firefox iOS and get the pairing WKWebView on screen, then in Safari
   open Develop → your device/simulator and pick the pairing view. Web Inspector
   opens against the live page.

### Console logs, network, breakpoints (iOS)

Once Web Inspector is open, the web console, network, and breakpoints are in its
Console, Network, and Sources tabs against the pairing WKWebView. For app and
Swift logs and breakpoints, run from Xcode and use its console and debugger.
