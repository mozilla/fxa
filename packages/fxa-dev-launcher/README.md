# fxa-dev-launcher

### Firefox Accounts custom profiles for Firefox

This package starts Firefox with a profile that points at an FxA stack.

## Entry points

Both entry points run `bin/fxa-dev-launcher.mjs`. Only the debugger default is different.

- `yarn firefox` from the repo root. The root script sets `FIREFOX_DEBUGGER=true`, so this always opens the [Browser Toolbox](https://firefox-source-docs.mozilla.org/devtools-user/browser_toolbox/).
- `yarn start` in `packages/fxa-dev-launcher`. The toolbox stays closed unless you set `FIREFOX_DEBUGGER` yourself.

Set the options as environment variables:

```sh
FXA_ENV=stage DISABLE_E10S=true yarn firefox
```

## `FXA_ENV`

Selects the stack. The default is `local`.

| Value           | Stack                                                                                 |
| --------------- | ------------------------------------------------------------------------------------- |
| `local`         | Your local stack. Start it first with the repo-root `yarn start` or `yarn start mza`. |
| `latest`        | `latest.dev.lcip.org`                                                                 |
| `stable`        | `stable.dev.lcip.org`                                                                 |
| `start-remote`  | `fxaci.dev.lcip.org` servers with a local content server                              |
| `stage`         | `accounts.stage.mozaws.net`                                                           |
| `prod`          | `accounts.firefox.com`                                                                |
| any other value | `https://<value>.dev.lcip.org/`, which is the fxa-dev box convention                  |

Warning: `prod` signs you in to real accounts. The profile allows plain http, turns off extension signature checks, and accepts a remote debugger without a prompt. Use a throwaway account.

## `FXA_DESKTOP_CONTEXT`

Sets `context=<value>` on the content server URLs. The default is `oauth_webchannel_v1`.

Firefox 134 made OAuth the default (Bug 1903658). Firefox 147 chains the legacy `fx_desktop_v3` context into an OAuth re-auth to derive the Sync keys (Bug 1997102). It asks for the password and a token code a second time. Use ESR 140 or older for the un-chained flow:

```sh
FXA_DESKTOP_CONTEXT=fx_desktop_v3 yarn firefox
```

## Local stack origins

These apply to the `local` env. Override them to reach a stack on a different host, such as a Tailscale address. Use this to pair with a real phone. The URLs must use the origin the phone is configured against.

- `FXA_LOCAL_HOST` sets the host for the local stack. The default is `localhost`.
- `FXA_CONTENT_ORIGIN` defaults to `http://<FXA_LOCAL_HOST>:3030`.
- `FXA_AUTH_ORIGIN` defaults to `http://<FXA_LOCAL_HOST>:9000`.
- `FXA_PROFILE_ORIGIN` defaults to `http://<FXA_LOCAL_HOST>:1111`.

For a content origin that is not `https`, `localhost`, or `127.0.0.1`, the launcher adds the hostname to the secure context allowlist. Firefox refuses the FxA WebChannel without it.

## `FXA_PAIRING_VERSION`

Set it to `2` to opt in to the pairing v2 flow. The browser and the server must both advertise version 2, so set `PAIRING_VERSION=2` on the stack as well. Leave it unset for v1.

The stack can also decide on its own from the Firefox version: with `PAIRING_V2_MIN_VERSION_DESKTOP=<major>` set alongside `PAIRING_VERSION=2`, any desktop Firefox at or above that major takes the v2 flow whatever the browser pref says (`0` means every version). `PAIRING_V2_MIN_VERSION_ANDROID` and `PAIRING_V2_MIN_VERSION_IOS` do the same for the mobile apps.

## `FIREFOX_BIN`

Selects the Firefox binary:

```sh
# macOS
FIREFOX_BIN="/Applications/Firefox Nightly.app/Contents/MacOS/firefox" yarn firefox
# Linux
FIREFOX_BIN=/usr/bin/firefox-nightly yarn firefox
# Windows, from Git Bash
FIREFOX_BIN="/c/Program Files/Firefox Nightly/firefox.exe" yarn firefox
```

Note: quote a path that contains spaces, and keep each assignment before the command. Without the quotes, the shell sets `FIREFOX_BIN` to the first word. It then tries to run the rest of the path as the command, and the launcher never starts.

## Flags

- `FIREFOX_DEBUGGER` opens the Browser Toolbox. Any non-empty value opens it, so `FIREFOX_DEBUGGER=false` opens it too. Unset the variable to keep it closed.
- `DISABLE_E10S` turns off E10S. The value must be exactly `true`. E10S stays on for any other value.

## Which Firefox

- Use a stable release for the default `oauth_webchannel_v1` flow.
- Use [Nightly](https://www.firefox.com/en-US/channel/desktop/) for pairing v2. Only Nightly has the v2 chrome commands.
- Use Nightly or Beta for the newest WebChannel behavior.
- Use [ESR 140](https://www.firefox.com/en-US/download/all/) or an [older build](https://archive.mozilla.org/pub/firefox/releases/) for the un-chained `fx_desktop_v3` flow.

The launcher detects Nightly with a regex for `Nightly` in `FIREFOX_BIN`, and it then sets the Nightly prefs. A renamed binary or path does not match.

Without `FIREFOX_BIN`, foxfire finds the default install for your OS. Each run gets a fresh temporary profile. To keep a profile between runs, set foxfire's own `PROFILE_NAME` or `CREATE_PROFILE`, and foxfire logs where it put the profile.

## Testing

This package does not currently have a test suite.
