# Pairing flow tests: running the automated E2E tests

Self-contained guide for an agent to set up, run, and debug the cross-device
pairing E2E tests in this directory. Everything needed is here.
(`docs/pairing/README.md` covers
the same ground framed for developers doing manual, by-hand device testing.)

## What these tests do

Pairing connects a signed-in desktop Firefox (the **authority**) to a mobile
Firefox (the **supplicant**) over a short-lived channel. The specs drive both
sides: a Marionette-controlled desktop Firefox as the authority, and a real
mobile app as the supplicant.

- `pairingFlowAndroid.spec.ts` + `lib/android-supplicant.ts` (adb-driven Fenix).
- `pairingFlowiOS.spec.ts` (Simulator + XCUITest-driven Firefox iOS).

Both are gated behind env flags (`ANDROID_PAIRING_ENABLED` /
`IOS_PAIRING_ENABLED`) and skip by default, including in CI. The web-only specs
(`pairingFlow.spec.ts`, `pairChoice.spec.ts`, the Backbone/negative variants)
need no mobile device and are unaffected.

The channel server is separate from the FxA stack and defaults to production
(`wss://channelserver.services.mozilla.com`) even locally, so both sides need
outbound network to it. The OAuth/account side can be the local stack via the
mobile app's FxA-server override.

## Prerequisites

- **FxA stack running:** `yarn install` once, then `yarn start` (or `yarn start
mza` for a faster core subset). Needs Docker; `yarn start infrastructure` if it
  isn't up. Provides content-server :3030, auth-server :9000; Fenix/iOS client
  ids are registered in `packages/fxa-auth-server/config/dev.json`.
- **Playwright's Firefox** (the authority): pulled by `yarn install` in
  `packages/functional-tests`; if missing, `npx playwright install firefox`.
  Override the binary with `FIREFOX_BINARY`.
- **Android:** a booted emulator/device (`adb devices` lists it) with a Fenix
  debug build that has the Sync Debug pairing hook (`org.mozilla.fenix.debug`;
  hook landed in Bug 2053454, so a current debug build already has it). Build +
  install from a `mozilla-firefox/firefox` checkout:
  ```bash
  ./mach --no-interactive bootstrap --application-choice mobile_android_artifact_mode
  ./mach build && ./mach gradle :fenix:installDebug
  ```
  For `--project=local` only: run `yarn adb-reverse`, and apply the
  webchannel-localhost patch (see below).
- **iOS:** a booted Simulator and a firefox-ios checkout built for testing
  (`xcodebuild build-for-testing -scheme Fennec -testPlan SyncIntegrationTestPlan
-destination '<dest>'`); point at it with `FIREFOX_IOS_PROJECT_DIR`.

## Running

Android:

```bash
yarn adb-reverse                       # local only: bridge FxA ports to the device
cd packages/functional-tests
ANDROID_PAIRING_ENABLED=1 npx playwright test pairingFlowAndroid --project=local
```

iOS:

```bash
cd packages/functional-tests
IOS_PAIRING_ENABLED=1 \
  FIREFOX_IOS_PROJECT_DIR=<firefox-ios checkout> \
  IOS_DESTINATION='platform=iOS Simulator,name=iPhone 16,OS=18.0' \
  npx playwright test pairingFlowiOS.spec.ts --project=local
```

Extra flags: `ANDROID_PAIRING_DEBUG=1` / `PAIRING_DEBUG=1` (verbose logs),
`ANDROID_SERIAL` (target one of several attached devices).

## Targets: local, stage, prod

`--project=local|stage|production` sets `target.contentServerUrl`; the
supplicant's FxA-server override is pointed at it, so the same spec runs against
all three.

- **local:** `http://localhost:3030`. Android needs `yarn adb-reverse` plus the
  webchannel-localhost manifest patch; iOS needs neither (the Simulator shares
  the host network).
- **stage:** stage hosts are already in the webchannel allowlist, so no patch.
  The supplicant loads pages in its own web view and can't inject the `fxa-ci`
  WAF-bypass header, so confirm stage allows the pairing/oauth endpoints. Never
  commit the WAF token.
- **production:** creates real accounts via `testAccountTracker`; a real side
  effect, use sparingly (e.g. a smoke check).

## webchannel localhost (local only)

Against `--project=local`, the supplicant's final "signed in" handoff runs over
the FxA WebChannel, and the built-in `fxawebchannel` extension's
`content_scripts.matches` allowlist does not include `localhost`. Without it,
`fxawebchannel.js` never injects on `http://localhost:3030`, the `oauth_login`
message is dropped, and the device never registers (so the device-registration
assertion fails). Add `localhost` to the template and rebuild:

```
.../feature/accounts/src/main/assets/extensions/fxawebchannel/manifest.template.json
```

Edit the **template** (the `.json` is generated from it at build time):

```json
"matches": [
  "https://accounts.firefox.com/*", "...",
  "http://localhost/*",
  "http://127.0.0.1/*"
]
```

Not in-tree yet (tracked separately). Stage/prod are unaffected: their hosts are
already in the stock allowlist.

## Expected success

The run reports `1 passed`. With `ANDROID_PAIRING_DEBUG=1` the account device
list shows the paired mobile device as `type=mobile, commands=2`, i.e. it
registered on the account. The authority reaching `/pair/auth/complete` (not
`/pair/failure`) is the authoritative signal both sides completed the handshake.

## How the Android driver works (and its gotchas)

`AndroidSupplicant` (`lib/android-supplicant.ts`) drives Fenix over adb: it sets
the FxA-server override, injects the pairing URL into the Sync Debug hook,
deep-links to Settings, taps Begin pairing, and taps Confirm in the GeckoView
custom tab. Authority-side logic is shared via `lib/pairing-helpers.ts`
(`signInAuthorityViaMarionette`, `startPairingFlow`, `buildAuthorityOAuthUrl`,
`extractChannelId`) and `lib/pairing-constants.ts` (`SELECTORS`,
`PAIRING_CLIENT_ID`); the `marionetteAuthority` fixture is in
`lib/fixtures/pairing.ts`. Reuse these rather than duplicating flow logic.

- Navigate via the `fenix-dev://settings` deep link, not the home menu (its
  "More options" buttons collide with text matching).
- `adb shell` re-tokenizes argv, so device commands with spaces/redirects are
  sent as one quoted string, and pref writes use base64 over stdin.
- uiautomator can read GeckoView web content, but its a11y tree populates
  lazily; the Confirm tap polls and nudges with a tiny scroll.
- Both sides must confirm, and the supplicant must connect to the short-lived
  channel soon after the authority mints the URL, so `ensureReady` runs before
  `startPairingFlow`.

## Debugging a failing run

Run with `ANDROID_PAIRING_DEBUG=1` (or `PAIRING_DEBUG=1` for iOS) for verbose
logs; on failure the Android spec also attaches a screenshot and logcat.

Inspect the supplicant directly:

- **Android app / Kotlin logs:** `adb logcat` (filter
  `--pid=$(adb shell pidof org.mozilla.fenix.debug)`). Pairing logs appear under
  `FirefoxAccountStateMachine` and `mozac-fxawebchannel`.
- **Android web content** (the pairing pages run in GeckoView): enable "Remote
  debugging via USB" in Fenix, then on desktop Firefox open `about:debugging` →
  This Firefox → connect the device → Inspect the pairing tab for full DevTools
  (Console, Network, breakpoints).
- **iOS:** app logs and Swift breakpoints via Xcode; web content via Safari Web
  Inspector (Safari → Develop → <device/simulator> → the pairing WKWebView).

Common failure modes:

- **Device never registers / test times out on `local`:** the webchannel-localhost
  patch is missing. logcat shows `[Firefox WebChannel] fxa_status timed out` and
  the state machine stalls at `Authenticating` instead of reaching `Connected`.
  Apply the patch above and rebuild.
- **Supplicant page shows `Invalid pairing configuration`:** `channel_id` /
  `channel_key` dropped out of the URL fragment. Inspect the loaded URL's fragment
  in the remote DevTools/Web Inspector, then the app's URL handling.
- **Flaky handshake (channel vs approval timing):** expected variance; the spec
  uses `retries: 2`. A long-running emulator degrades (binder/ANR), so relaunch it
  fresh.
- **Fenix crash-loops on launch (`MOZ_CRASH(JNI exception)`):** artifact-mode
  native/Java version skew. Run `./mach artifact clear-cache`, rebuild, reinstall.
- **`stage` supplicant requests blocked:** the supplicant can't inject the WAF
  bypass header (see Targets); use a WAF-exempt stage.
