# Client side metrics

## Top level

### context
The context will be `fx_desktop_v1` if the user is signing up for sync, `web` otherwise.

### duration
How long the user was at Firefox Account

### entrypoint
If the user is signing in from the Firefox browser, the entrypoint is where the user came from. Set to `none` if not signing into a Firefox browser service.

### events
The event stream, see [Event Stream](#event_stream)

### migration
If the user is migrating from an "old sync", this is the version the user is migrating from. Set to `none` if not migrating.

### lang
The locale shown to the user.

### campaign
If the user is shown a Firefox Accounts promotion in Firefox browser chrome, the link to FxA will contain a `campaign` field. Set to `none` if not reported.

### marketingType
The marketing campaign currently being shown on the `signup_complete` screen. Set to `none` if the user is not shown the material.

### marketingLink
The call to action link in the marketing material. set to `none` if the user is not shown the material.

### marketingClicked
Set to `true` if the user clicked the call to action link, `false` otw.

### navigationTiming
Performance information from window.performance.timing.

Contains:
* navigationStart
* unloadEventStart
* unloadEventEnd
* redirectStart
* redirectEnd
* fetchStart
* domainLookupStart
* domainLookupEnd
* connectStart
* connectEnd
* secureConnectionStart
* requestStart
* responseStart
* responseEnd
* domLoading
* domInteractive
* domContentLoadedEventStart
* domContentLoadedEventEnd
* domComplete
* loadEventStart
* loadEventEnd

See https://developer.mozilla.org/docs/Navigation_timing for more information.

### referrer
Where the user came from. Not set if the `referrer` header cannot be read.

### screen
Screen information

Contains:
* clientHeight: viewport height as reported by window.documentElement.clientHeight. `none` if not supported.
* clientWidth: viewport height as reported by window.documentElement.clientWidth. `none` if not supported.
* devicePixelRatio: device pixel ratio as reported by window.devicePixelRatio. `none` if not supported.
* height: screen height as reported by window.screen.height. `none` if not supported.
* width: screen width as reported by window.screen.width. `none` if not supported.

### service
Service using FxA to authenticate. If Sync, this will be `sync`. If
an OAuth relier, this will be the relier's `client_id`. Set to `none` if the user browsed directly to the https://accounts.firefox.com without going through a relier.

## Event stream

The event stream is a log of events and the time they occurred while the user is interacting with Firefox Accounts. The event stream includes which screens are displayed, any success or error messages displayed, any JavaScript errors that occurr, as well as any other information the developers or metrics team feel is important.

### Events per screen

#### Generic events
* tooltip.generic-dismissed - a dismissable tooltip is dismissed
* error.<unexpected_origin>.auth.1027 - a postMessage message was received from an unexpected origin.

#### account_unlock_complete
#### cannot_create_account
#### change_password
* error.change-password.auth.121 - account locked
* change-password.unlock-email.send - user attempted to send unlock email
* change-password.unlock-email.send.success - unlock email successfully sent

#### complete_account_unlock
* error.complete_account_unlock.auth.1025 - User clicked on an expired verification link.
* error.complete_account_unlock.auth.1026 - User clicked on a damaged verification link.
* complete_account_unlock.verification.success - successful verification

#### complete_reset_password
* complete_reset_password.verification.success - email successfully verified.
* complete_reset_password.resend - A verification email was resent after an expired link was opened.
* error.complete_reset_password.auth.1025 - User clicked on an expired verification link.
* error.complete_reset_password.auth.1026 - User clicked on a damaged verification link.
#### complete_sign_up
* complete_sign_up.verification.success - email successfully verified.
* complete_sign_up.resend - A verification email was resent after an expired link was opened.
* error.complete_sign_up.auth.1025 - User clicked on an expired verification link.
* error.complete_sign_up.auth.1026 - User clicked on a damaged verification link.
#### confirm
#### confirm_account_unlock
* confirm-account-unlock.verification.success - account unlock verification occurred in another tab
* confirm-account-unlock.resend - attempt to resend unlock email
* confirm-account-unlock.resend.success - resend email successfully sent
* error.confirm-account-unlock.auth.122 - account not locked

#### confirm_reset_password
#### cookies_disabled
#### delete_account
* error.delete-account.auth.121 - account locked
* delete-account.unlock-email.send - user attempted to send unlock email
* delete-account.unlock-email.send.success - unlock email successfully sent

#### force_auth
#### illegal_iframe
#### legal
#### pp
#### ready
#### reset_password
#### settings
#### settings/avatar
#### settings/avatar/camera
#### settings/avatar/change
#### settings/avatar/crop
#### settings/avatar/gravatar
#### signin
* error.signin.auth.121 - account locked
* signin.unlock-email.send - user attempted to send unlock email
* signin.unlock-email.send.success - unlock email successfully sent

#### signup
* tooltip.mailcheck-suggested - an email address correction was suggested
* tooltip.mailcheck-used - an email address correction was chosen by the user
* tooltip.mailcheck-dismissed - an email address correction tooltip was dismissed without the selection being made.
#### tos
#### unexpected_error
