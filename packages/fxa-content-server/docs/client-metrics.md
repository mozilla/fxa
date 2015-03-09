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

#### cannot_create_account
#### change_password
#### complete_reset_password
#### complete_sign_up
#### confirm
#### confirm_reset_password
#### cookies_disabled
#### delete_account
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
#### signup
* tooltip.mailcheck-suggested - an email address correction was suggested
* tooltip.mailcheck-used - an email address correction was chosen by the user
* tooltip.mailcheck-dismissed - an email address correction tooltip was dismissed without the selection being made.
#### tos
#### unexpected_error


