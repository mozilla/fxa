# Client side metrics

## Top level

### context
The context will be `fx_desktop_v1` if the user is signing up for sync, `iframe` if the user is signing up in an iframe, `web` otherwise.

### broker
The broker used to coordinate behavior between FxA and the relier.

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

### marketing
A log of marketing links shown to the user on `signup_complete`. An array of entries, each entry contains the following fields:
* campaignId - The marketing campaign identifier.
* clicked - Whether the user clicked the link.
* url - the URL displayed.

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
* error.&lt;resource&gt;.require-on-demand.999 - resource dependency fetch had an unexpected error.
* error.&lt;resource&gt;.require-on-demand.1000 - resource dependency fetch has timed out.
* error.&lt;resource&gt;.require-on-demand.1001 - resource dependency does not have a define.
* error.&lt;resource&gt;.require-on-demand.1002 - resource dependency had a script error.
* error.&lt;unexpected_origin&gt;.auth.1027 - a postMessage message was received from an unexpected origin.
* error.&lt;image_url&gt;.profile.997 - a profile image could not load.
* &lt;screen_name&gt;.submit - A submit event has occurred and all of the form's input elements are valid.
* &lt;screen_name&gt;.refresh - The aforementioned screen was refreshed.

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

* confirm.resend - attempt to resend verification email

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
* delete-account.deleted - user successfully deleted an account

#### force_auth
#### illegal_iframe
#### legal
#### pp
#### ready
#### reset_password
* error.reset_password.auth.1011 - user did not enter an email address
* error.reset_password.auth.1023 - user entered an email address that was invalid

#### settings
* settings.signout.submit - user clicked signout
* settings.signout.success - user successfully signed out
* settings.signout.error - user signed out but with an error
* settings.communication-prefs-link.visible.true - communication preferences link is visible
* settings.communication-prefs-link.visible.false - communication preferences link is not visible

#### settings/avatar

#### settings/avatar/camera

* fxa.content.settings.avatar.camera.submit.change - user submit the camera avatar and had an avatar set before
* fxa.content.settings.avatar.camera.submit.new - user submit the camera avatar and had an avatar set before

#### settings/avatar/change

#### settings/avatar/crop

* settings.avatar.crop.rotate.cw - user rotated the image clockwise using the rotate button
* settings.avatar.crop.translate - user translated the image using a drag operation
* settings.avatar.crop.zoom.in - user zoomed into the image using the magnify button
* settings.avatar.crop.zoom.out - user zoomed out from the image using the magnify button
* settings.avatar.crop.zomm.range - user zoomed in or out the image using the input range control
* settings.avatar.crop.submit.change - user submit the cropper and had an avatar set before
* settings.avatar.crop.submit.new - user submit the cropper avatar


#### settings/avatar/gravatar

* settings.avatar.gravatar.submit - user submit the gravatar avatar view
* settings.avatar.gravatar.submit.change - user submit the gravatar and had an avatar set before
* settings.avatar.gravatar.submit.new - user submit the gravatar and had no avatar set
* error.settings.avatar.gravatar.auth.1032 - No gravatar found

#### settings/avatar/gravatar_permissions

* settings.avatar.gravatar-permissions.accepted - user accepted permission prompt
* settings.avatar.gravatar-permissions.alreadly-accepted - user accepted permission prompt
* settings.avatar.gravatar-permissions.submit - user accepted permission prompt

#### settings/communication_preferences

* settings.communication-preferences.newsletter.optin.true - user is opted in to newsletter when opening screen.
* settings.communication-preferences.newsletter.optin.false - user is not opted in to newsletter when opening screen.
* settings.communication-preferences.checkbox.change.marketing-email-optin.unchecked - user has opted in to the marketing email
* settings.communication-preferences.checkbox.change.marketing-email-optin.checked - user has opted out of the marketing email
* settings.communication-preferences.optIn - user is attempting to opt in to email marketing.
* settings.communication-preferences.optIn.success - user has successfully opted in to email marketing.
* settings.communication-preferences.optOut - user is attempting to opt out of email marketing.
* settings.communication-preferences.optOut.success - user has successfully opted out of email marketing.

#### signin
* error.oauth.signin.auth.1011 - user did not enter an email address
* error.oauth.signin.auth.1023 - user entered an email address that was invalid
* error.signin.auth.121 - account locked
* error.signin.auth.1011 - user did not enter an email address
* error.signin.auth.1023 - user entered an email address that was invalid
* signin.ask-password.skipped - skipped asking for password thanks to existing session token
* signin.ask-password.shown.account-unknown - asked for password due to missing account data
* signin.ask-password.shown.email-mismatch - asked for password due to using a different email
* signin.ask-password.shown.keys-required - asked for password because the relier wanted keys
* signin.ask-password.shown.session-from-web - asked for password because session was created via web content
* signin.ask-password.shown.session-expired - asked for password due to expired session token
* signin.use-different-account - user clicked link to use different account
* signin.unlock-email.send - user attempted to send unlock email
* signin.unlock-email.send.success - unlock email successfully sent


#### signin_permissions
* signin-permissions.accept - user accepts and grants the requested permissions
* signin-permissions.success - sign in successfully occurred

#### signup
* error.oauth.signup.auth.1011 - user did not enter an email address
* error.oauth.signup.auth.1023 - user entered an email address that was invalid
* error.signup.auth.1011 - user did not enter an email address
* error.signup.auth.1011 - user did not enter an email address
* error.signup.auth.1012 - user did not enter year of birth
* error.signup.auth.1016 - user did not enter their birthday
* error.signup.auth.1018 - user's verification email bounced
* error.signup.auth.1019 - user re-submitted bounced email address
* error.signup.auth.1020 - user entered an @firefox.com address
* error.signup.auth.1023 - user entered an email address that was invalid
* error.signup.auth.1029 - signup is disabled on Fx for iOS v1
* error.signup.auth.1030 - signup has been force disabled by a Sync based relier.
* signup.checkbox.change.customize-sync.checked - user checked the "Choose what to sync" checkbox.
* signup.checkbox.change.customize-sync.unchecked - user unchecked the "Choose what to sync" checkbox.
* signup.checkbox.change.marketing-email-optin.checked - user checked the email opt-in
* signup.checkbox.change.marketing-email-optin.unchecked - user unchecked the email opt-in
* signup.checkbox.change.show-password.checked - password is shown
* signup.checkbox.change.show-password.unchecked - password is hidden
* signup.email-optin.visible.false - email opt-in is not visible
* signup.email-optin.visible.true - email opt-in is visible
* signup.experiment.pw_strength.all_letters_or_numbers - password contains all numbers or letters and is &lt; 12 characters in length
* signup.experiment.pw_strength.bloomfilter_hit - password was found in bloomfilter
* signup.experiment.pw_strength.bloomfilter_miss - password was checked against the bloomfilter but no found
* signup.experiment.pw_strength.bloomfilter_used - bloomfilter was used
* signup.experiment.pw_strength.enabled - user was opted in to password strength check
* signup.experiment.pw_strength.long_enough - password is &gte; 12 characters
* signup.experiment.pw_strength.missing_password - no password supplied
* signup.experiment.pw_strength.too_short - password was &lt; 8 characters
* signup.password.hidden - password is hidden
* signup.password.visible - password is shown
* tooltip.mailcheck-suggested - an email address correction was suggested
* tooltip.mailcheck-used - an email address correction was chosen by the user in the tooltip
* tooltip.mailcheck-dismissed - an email address correction tooltip was dismissed without the selection being made.
* signup.mailcheck-useful - an email address correction was used by the user during sign up form submit. This is tracked because some users might not use the tooltip to correct the email.

#### signup_permissions
* signup-permissions.accept - user accepts and grants the requested permissions

#### tos

#### unexpected_error

## Experiment Metrics

mailcheck

* experiment.mailcheck.treatment.enrolled
* experiment.mailcheck.treatment.triggered 
* experiment.mailcheck.treatment.closed
* experiment.mailcheck.treatment.clicked
* experiment.mailcheck.treatment.corrected
* experiment. mailcheck.control.enrolled
* experiment.mailcheck.control.triggered
* experiment.mailcheck.control.corrected
* experiment.mailcheck.treatment.verified
* experiment.mailcheck.treatment.triggered.verified
* experiment.mailcheck.treatment.corrected.verified
* experiment.mailcheck.control.verified
* experiment.mailcheck.control.triggered.verified
* experiment.mailcheck.control.corrected.verified

coppaView

* experiment.coppaView.treatment.enrolled
* experiment.coppaView.treatment.tooyoung
* experiment.coppaView.treatment.triggered
* experiment.coppaView.treatment.clicked
* experiment.coppaView.control.enrolled
* experiment.coppaView.control.tooyoung
* experiment.coppaView.control.triggered
* experiment.coppaView.treatment.verified
* experiment.coppaView.treatment.triggered.verified
* experiment.coppaView.treatment.clicked.verified
* experiment.coppaView.control.verified
* experiment.coppaView.control.triggered.verified

openGmail 

* experiment.openGmail.treatment.enrolled
* experiment.openGmail.treatment.triggered
* experiment.openGmail.treatment.clicked
* experiment.openGmail.control.enrolled
* experiment.openGmail.control.triggered
* experiment.openGmail.treatment.verified
* experiment.openGmail.treatment.triggered.verified
* experiment.openGmail.treatment.clicked.verified
* experiment.openGmail.control.verified
* experiment.openGmail.control.triggered.verified

syncCheckbox

* experiment.syncCheckbox.treatment.enrolled
* experiment.syncCheckbox.treatment.triggered
* experiment.syncCheckbox.treatment.clicked
* experiment.syncCheckbox.control.enrolled
* experiment.syncCheckbox.control.triggered
* experiment.syncCheckbox.control.clicked
* experiment.syncCheckbox.treatment.verified
* experiment.syncCheckbox.treatment.triggered.verified
* experiment.syncCheckbox.treatment.clicked.verified
* experiment.syncCheckbox.control.verified
* experiment.syncCheckbox.control.triggered.verified
* experiment.syncCheckbox.control.clicked.verified