# Playwright setups in `packages/functional-tests`, and their gotchas

Read this before writing a throwaway spec. Every item comes from the fixtures and specs in the repo.

## Which browser and fixture

| Setup | Fixture | What it is |
|---|---|---|
| Plain page | `pages` | Playwright Firefox, no FxA prefs. Web-channel messages go nowhere unless you mock them. |
| Sync, desktop v3 | `syncBrowserPages` | A second Playwright Firefox launched with `getFirefoxUserPrefs(target, DEBUG, 'fx_desktop_v3')`. Firefox's own FxA integration answers `fxa_status` and processes `login`. |
| Sync, OAuth | `syncOAuthBrowserPages` | Same, with `'oauth_webchannel_v1'`, which sets `identity.fxaccounts.oauth.enabled`. Firefox drives the OAuth handshake and processes `oauth_login`. |
| Pairing | `marionetteAuthority`, `marionetteSupplicant` (`lib/fixtures/pairing`) | Real Firefox Nightly over Marionette. Needed only for pairing v2 chrome commands and for anything that must show browser chrome. |
| Chromium | project `local-chromium`, tag `#chromium` | Passkeys via the CDP virtual authenticator. Manual only, CI skips it. |

Why Sync gets a second browser: Firefox stores `identity.fxaccounts.lastSignedInUserHash` and shows a native confirm dialog on the next Sync sign-in, and Playwright cannot click browser UI. A fresh browser per test avoids it.

## Entering the Sync flow

- Use `gotoSyncSession(page, target)` from `lib/sync-helpers`, which opens `/pair`. Firefox answers `fxa_status`, the page starts the OAuth flow, and the sign-in form arrives with the right params. A hardcoded `?context=fx_desktop_v3&service=sync` URL no longer completes on Firefox 147 and later (`keys_optional`); older specs still use it, do not copy them.
- Signed-in signal: `await expect(page).toHaveURL(/pair/)` then `connectAnotherDevice.fxaConnected` visible. For proof that Firefox received the login, call `signin.listenToWebChannelMessages()` on the password page, then `signin.checkWebChannelMessage(FirefoxCommand.OAuthLogin)` (or `FirefoxCommand.Login` for desktop v3). The listener is a page script logging into `sessionStorage`, so install it after the last full navigation and before submit.
- No Sync browser but a Sync UI state is needed: `respondToWebChannelMessage` or `respondToWebChannelMessageAlways` on the plain `page` fakes the `fxa_status` and `oauth_flow_begin` answers. Good for screenshots of a state, useless as proof of a real sign-in.

## The 123done relier

- `relier.goto()` opens `http://localhost:8080`; `clickEmailFirst()` waits for the `123done` heading first. The relier needs `packages/123done/secrets.json` (gitignored) for the token exchange; without it the auth server rejects `/api/oauth` with a validation error on `client_secret`, the page returns to 123done, and `#loggedin` never appears. A fresh worktree has no copy, and you must not put one there. Run relier flows only from an owned clone that already has the file.
- The relier's default signup is **passwordless**: after the email step the next page is "Enter confirmation code", driven by `signinPasswordlessCode.codeInput` and `target.emailClient.getPasswordlessSignupCode(email)`, then the `Confirm` button. The existing specs see a password page only because they pass `relier.goto('force_passwordless=false')`.
- Passwordless accounts break the tracker's teardown: `destroyAllAccounts` fails with "Complete account setup, please reset password to continue" and marks the test failed after the flow already passed. For a recording, treat that as pass; the account stays in the local DB.
- Before trusting port 8080, run `lsof -nP -iTCP:8080 -sTCP:LISTEN`. A stale listener bound to `127.0.0.1` shadows 123done, which binds all interfaces, for every `localhost` request, including the OAuth redirect back. One orphaned `fxa-single-origin-proxy.mjs` from another worktree did exactly that.

## Accounts

- `testAccountTracker.signUp()` creates a verified account, no sign-in code.
- `testAccountTracker.signUpSync({ preVerified: 'true', service: 'sync' })` makes the sign-in ask for a code: `target.emailClient.getVerifyLoginCode(email)` then `signinTokenCode.fillOutCodeForm(code)`.
- TOTP: the `totp` page object, or `enableTotpOnAccount(target.authClient, sessionToken)` from `lib/pairing-helpers`, then `getTotpCode(secret)`.
- The tracker destroys its accounts and `target.clearRateLimits()` runs after each test. A browser you launch yourself is yours to close, in `finally`.

## Recording video

- `test.use({ video: 'on' })` covers only the default `page` and `context` fixtures. A Sync browser or any browser you launch needs `browser.newContext({ recordVideo: { dir, size } })`, and the WebM is only complete after `page.close()`, then `page.video().saveAs(path)`.
- The same applies to traces: the second browser's trace overwrites the first unless saved separately (see the package README).
- Video is the viewport only. No toolbar, no panels, no dialogs. When those matter, use Marionette and the frame recorder next to this skill.

## Context that a hand-built browser does not get

- The `storageState` fixture seeds `localStorage` with `__fxa_storage.experiment.generalizedReactApp` (not enrolled) and `__fxa_storage.disable_promo.account-recovery-do-it-later` (true) for the default context only. A context you build yourself shows the inline recovery key promo after Sync sign-in; set the item or click "Do it later".
- `addWafBypassHeader(page, target)` is applied by `newPages`; call it yourself on stage or production, with `CI_WAF_TOKEN` set.
- The user agent is overridden to `FxATester/1.0`, which turns off experiments and feature flags. A state gated by a flag may look different in a real Firefox.

## Environment

- Run from `packages/functional-tests` with `NODE_OPTIONS='--dns-result-order=ipv4first'` and `--project=local`. `--retries=0 --workers=1` for a recording.
- `DEBUG=1` runs headed with the debugger server; `PLAYWRIGHT_SLOWMO=<ms>` slows actions.
- The stack must run from the checkout under test: `pm2 jlist 2>/dev/null | sed -n '/^\[/,$p' | jq -r '.[] | select(.name=="settings-react" or .name=="auth") | "\(.name) \(.pm2_env.pm_cwd)"'`. Read an app service, not `.[0]`, which is `mysql` and reports whichever clone started infrastructure.
- A checkout with TypeScript errors makes the dev server inject `#webpack-dev-server-client-overlay` over every page. Symptoms: clicks time out, `error-context.md` snapshots contain "Compiled with problems", broken components never advance the form. Fix the code or run the stack from a clean checkout; removing the iframe only hides the first symptom.
- `packages/123done/secrets.json` is required for the relier at `:8080`; without it, relier flows fail and the file must never be copied into a worktree.
- Playwright's Firefox is installed per machine: `npx playwright install --dry-run firefox` shows whether a download is pending.
