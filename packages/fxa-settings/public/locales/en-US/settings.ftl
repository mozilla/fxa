# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

# Globally reused strings

# Note: the company name, Mozilla, is not translated.
-mozilla = Mozilla
# Note: the product name, Firefox Accounts, is not translated.
-firefox-accounts = Firefox Accounts
-firefox-account = Firefox account

# Frequently reused button text. The translations should be short enough to fit in a small button.
fxa-save-button = Save
fxa-close-button = Close
fxa-cancel-button = Cancel
fxa-continue-button = Continue

# Application

app-default-title = { -firefox-accounts }
app-page-title = { $title } | { -firefox-account }

# Application-wide footer

app-footer-mozilla-logo-label = { -mozilla } logo
app-footer-privacy-notice = Website Privacy Notice
app-footer-terms-of-service = Terms of Service

# Avatar component

avatar-your-avatar =
  .alt = Your avatar
avatar-default-avatar =
  .alt = Default avatar

## Connect another device promo

connect-another-fx-mobile = Get Firefox on mobile or tablet
connect-another-find-fx-mobile = Find Firefox in the Google Play and App Store
  or <br /><linkExternal>send a download link to your device.</linkExternal>

## Connected services section

cs-heading = Connected Services
cs-description = Everything you are using and signed into.
cs-cannot-refresh = Sorry, there was a problem refreshing the list of connected
  services.
cs-cannot-disconnect = Client not found, unable to disconnect
cs-logged-out = Logged out of { $service }.

cs-refresh-button =
  .title = Refresh connected services

# Link text to a support page on missing or duplicate devices
cs-missing-device-help = Missing or duplicate items?

cs-disconnect-sync-heading = Disconnect from Sync
# $device is the name of the device being disconnected
cs-disconnect-sync-content = Your browsing data will remain on your
  device ({ $device }), but it will no longer sync with your account.
cs-disconnect-sync-reason = What's the main reason for disconnecting this
  device?

## The following are the options for selecting a reason for disconnecting the
## device
cs-disconnect-sync-opt-prefix = The device is:
cs-disconnect-sync-opt-suspicious = Suspicious
cs-disconnect-sync-opt-lost = Lost or Stolen
cs-disconnect-sync-opt-old = Old or Replaced
cs-disconnect-sync-opt-duplicate = Duplicate
cs-disconnect-sync-opt-not-say = Rather not say

cs-disconnect-advice-confirm = Okay, got it
cs-disconnect-lost-advice-heading = Lost or stolen device disconnected
cs-disconnect-lost-advice-content = Since your device was lost or stolen, to
  keep your information safe, you should change your Firefox account password
  in your account settings. You should also look for information from your
  device manufacturer about erasing your data remotely.
cs-disconnect-suspicious-advice-heading = Suspicious device disconnected
cs-disconnect-suspicious-advice-content = If the disconnected device is indeed
  suspicious, to keep your information safe, you should change your Firefox
  account password in your account settings. You should also change any other
  passwords you saved in Firefox by typing about:logins into the address bar.

cs-sign-out-button = Sign out

# GetDataTrio component, part of Recovery Key flow

get-data-trio-title = Recovery Codes
get-data-trio-download =
  .title = Download
get-data-trio-copy =
  .title = Copy
get-data-trio-print =
  .title = Print

# HeaderLockup component

header-menu-open = Close menu
header-menu-closed = Site navigation menu
header-back-to-top-link =
  .title = Back to top
header-title = { -firefox-account }
header-switch-title = Switch to classic design
  .title = classic design link
header-help = Help

## Settings Nav

nav-settings = Settings
nav-profile = Profile
nav-security = Security
nav-connected-services = Connected Services
nav-paid-subs = Paid Subscriptions
nav-email-comm = Email Communications

# Avatar change page

avatar-page-title =
  .title = Avatar
avatar-page-add-photo = Add Photo
avatar-page-add-photo-button =
  .title = { avatar-page-add-photo }
avatar-page-take-photo = Take Photo
avatar-page-take-photo-button =
  .title = { avatar-page-take-photo }
avatar-page-remove-photo-button =
  .title = Remove photo
avatar-page-retake-photo = Retake Photo
avatar-page-close-button = Close
avatar-page-save-button = Save
avatar-page-camera-error = Could not initialize camera
avatar-page-new-avatar =
  .alt = new avatar

## Password change page
pw-change-header =
  .title = Change Password

pw-change-stay-safe = Stay safe — don’t reuse passwords. Your password:
pw-change-least-8-chars = Must be at least 8 characters
pw-change-not-contain-email = Must not be your email address
pw-change-must-match = New password matches confirmation
# linkExternal is a link to a mozilla.org support article on password strength
pw-change-common-passwords = Must not match this <linkExternal>list of common
  passwords</linkExternal>
pw-change-cancel-button = { fxa-cancel-button }
pw-change-save-button = { fxa-save-button }
pw-change-forgot-password-link = Forgot password?

pw-change-current-password =
  .label = Enter current password
pw-change-new-password =
  .label = Enter new password
pw-change-confirm-password =
  .label = Confirm new password

## Delete account page
delete-account-header =
 .title = Delete Account

delete-account-step-1-2 = Step 1 of 2
delete-account-step-2-2 = Step 2 of 2

delete-account-confirm-title = You've connected your { -firefox-account } to { -mozilla } products that keep you secure and productive on the web:

# Note: don't translate this product name.
mozilla-vpn = Mozilla VPN
# Note: don't translate this product name.
firefox-lockwise = Firefox Lockwise
# Note: don't translate this product name.
firefox-monitor = Firefox Monitor

delete-account-acknowledge = Please acknowledge that by deleting your account:

delete-account-chk-box-1 =
 .label = Any paid subscriptions you have will be cancelled
delete-account-chk-box-2 =
 .label = Any may lose saved information and features within { -mozilla } products
delete-account-chk-box-3 =
 .label = Reactivating with this email may not restore your saved information
delete-account-chk-box-4 =
 .label = Any extensions and themes that you published to addons.mozilla.org will be deleted

delete-account-close-button = { fxa-close-button }
delete-account-continue-button = { fxa-continue-button }

delete-account-password-input =
 .label = Enter password

delete-account-cancel-button = { fxa-cancel-button }
delete-account-delete-button = Delete Account

## Display name page
display-name-input =
 .label = Enter display name
submit-display-name = { fxa-save-button }
cancel-display-name = { fxa-cancel-button }

# Recovery key setup page

recovery-key-cancel-button = Cancel
recovery-key-close-button = Close
recovery-key-continue-button = Continue
recovery-key-created = Your recovery key has been created. Be sure to save the key in a safe place that you can easily find later — you'll need the key to regain access to your data if you forget your password.
recovery-key-enter-password =
  .label = Enter password
recovery-key-page-title =
  .title = Recovery key
recovery-key-step-1 = Step 1 of 2
recovery-key-step-2 = Step 2 of 2

# Add secondary email page

add-secondary-email-error = There was a problem creating this email.
add-secondary-email-page-title
  .title = Secondary email
add-secondary-email-enter-address =
  .label = Enter email address
add-secondary-email-cancel-button = { fxa-cancel-button }
add-secondary-email-save-button = { fxa-save-button }

# Verify secondary email page

verify-secondary-email-error = There was a problem sending the verification code.
verify-secondary-email-page-title =
  .title = Secondary email
verify-secondary-email-verification-code =
  .label = Enter your verification code
verify-secondary-email-cancel-button = { fxa-cancel-button }
verify-secondary-email-verify-button = Verify
# Note: include the placeholder '{email}' without translation. It will be replaced with the user's email address.
verify-secondary-email-please-enter-code = Please enter the verification code that was sent to {email} within 5 minutes.

# Link to delete account on main Settings page
delete-account-link = Delete Account

## Two Step Authentication

tfa-title = Two Step Authentication

tfa-step-1-3 = Step 1 of 3
tfa-step-2-3 = Step 2 of 3
tfa-step-3-3 = Step 3 of 3

tfa-button-continue = { fxa-continue-button }
tfa-button-cancel = { fxa-cancel-button }
tfa-button-finish = Finish

tfa-incorrect-totp = Incorrect two-step authentication code
tfa-cannot-retrieve-code = There was a problem retrieving your code.
tfa-cannot-verify-code = There was a problem verifiying your recovery code.
tfa-incorrect-recovery-code = Incorrect recovery code
tfa-enabled = Two-step authentication enabled

tfa-scan-this-code = Scan this QR code using one of <linkExternal>these
  authentication apps</linkExternal>.

# Image alt text on QR code. $secret is a long alphanumeric string.
tfa-qa-code-alt = Use the code { $secret } to set up two-step authentication in
  supported applications.
tfa-button-cant-scan-qr = Can’t scan code?

# When the user cannot use a QR code.
tfa-enter-secret-key = Enter this secret key into your authenticator app:

tfa-enter-totp = Now enter the security code from the authentication app.
tfa-input-enter-totp =
 .label = Enter security code
tfa-save-these-codes = Save these one-time use codes in a safe place for when
  you don’t have your mobile device.

tfa-enter-code-to-confirm = Please enter one of your recovery codes now to
  confirm you’ve saved it. You’ll need a code if you lose your device and want
  to access your account.
tfa-enter-recovery-code =
 .label = Enter a recovery code

## Profile section

porfile-heading = Profile
profile-display-name =
  .header = Display name
profile-password =
  .header = Password
profile-password-created-date = Created { $date }
profile-primary-email =
  .header = Primary email

## Security section of Setting

security-heading = Security

## Sub-section row Defaults

row-defaults-action-add = Add
row-defaults-action-change = Change
row-defaults-action-disable = Disable
row-defaults-status = None

## Recovery key sub-section on main Settings page

rk-enabld = Enabled
rk-not-set = Not Set
rk-action-create = Create
rk-action-remove = Remove
rk-cannot-refresh = Sorry, there was a problem refreshing the recovery key.
rk-key-removed = Account recovery key removed.
rk-cannot-remove-key = Your account recovery key could not be removed.
rk-refresh-key = Refresh recovery key
rk-content-explain = Restores your information when you forget your password.
rk-content-reset-data = Why does resetting my password reset my data?
rk-cannot-verify-session = Sorry, there was a problem verifying your session
rk-remove-modal-heading = Remove recovery key?
rk-remove-modal-content = In the event you reset your password, you won't be
  able to use your recovery key to access your data. You can't undo this action.

## Secondary email sub-section on main Settings page

se-heading = Secondary email
  .header = Secondary Email
se-cannot-refresh-email = Sorry, there was a problem refreshing that email.
se-cannot-resend-code = Sorry, there was a problem re-sending the verification code.
se-set-primary-successful = { $email } is now your primary email.
se-set-primary-error = Sorry, there was a problem changing your primary email.
se-delete-email-successful = { $email } email successfully deleted.
se-delete-email-error = Sorry, there was a problem deleting this email.
se-verify-session = You'll need to verify your current session to perform this action.
se-verify-session-error = Sorry, there was a problem verifying your session.
# Button to remove the secondary email
se-remove-email =
  .title = Remove email
# Button to refresh secondary email status
se-refresh-email =
  .title = Refresh email
se-unverified = unverified
se-resend-code = Verification needed. <button>Resend verification code</button>
  if it's not in your email or spam.
# Button to make secondary email the primary
se-make-primary = Make primary
se-default-content = Access your account if you can't log in to your primary email.
se-content-note = Note: a secondary email won't restore your information—you'll
  need a <a>recovery key</a> for that.

## Two Step Auth sub-section on Settings main page

tfa-row-heading =
  .header = Two-step authentication
tfa-row-disabled = Two-step authentication disabled.
tfa-row-enabled = Enabled
tfa-row-not-set = Not Set
tfa-row-action-add = Add
tfa-row-action-disable = Disable

tfa-row-button-refresh =
  .title = Refresh two-step authentication
tfa-row-cannot-refresh = Sorry, there was a problem refreshing two-step
  authentication.
tfa-row-content-explain = Prevent someone else from logging in by requiring a
  unique code only you have access to.
tfa-row-cannot-verify-session = Sorry, there was a problem verifying your session

tfa-row-disable-modal-heading = Disable two-step authentication?
tfa-row-disable-modal-confirm = Disable
tfa-row-disable-modal-explain = You won't be able to undo this action. You also
  have the option of <linkExternal>replacing your recovery codes</linkExternal>.
tfa-row-cannot-disable = Two-step authentication could not be disabled.

tfa-row-change-modal-heading = Change recovery codes?
tfa-row-change-modal-confirm = Change
tfa-row-change-modal-explain = You won't be able to undo this action.

## Avatar sub-section on main Settings page

avatar-heading = Picture
avatar-add-link = Add
avatar-change-link = Change

## Backend failure based errors
auth-error-998 = System unavailable, try again soon
auth-error-999 = Unexpected error

## Auth-server based errors that originate from backend service
auth-error-101 = Account already exists
auth-error-102 = Unknown account
auth-error-120 = Incorrect email case
auth-error-103 = Incorrect password
auth-error-104 = Unverified account
auth-error-105 = Invalid verification code
auth-error-106 = Invalid JSON in request body
auth-error-109 = Invalid request signature
auth-error-110 = Invalid token
auth-error-111 = Invalid timestamp in request signature
auth-error-112 = Missing content-length header
auth-error-113 = Request body too large
auth-error-114 = You’ve tried too many times. Try again later.
auth-error-115 = Invalid nonce in request signature
auth-error-125 = The request was blocked for security reasons
auth-error-126 = Your account has been locked for security reasons
auth-error-127 = Invalid authorization code
auth-error-129 = Invalid phone number
auth-error-130 = Cannot send to this country
auth-error-131 = SMS ID invalid
auth-error-132 = Could not send a message to this number
auth-error-133 = Your email was just returned
auth-error-134 = Your email was just returned. Mistyped email?
auth-error-135 = Unable to deliver email
auth-error-136 = This email was already verified by another user
auth-error-138 = Unverified session
auth-error-139 = Secondary email must be different than your account email
auth-error-140 = Account already exists
auth-error-141 = Account already exists
auth-error-142 = Primary account email required for sign-in
auth-error-144 = Address in use by another account
auth-error-145 = Primary account email required for reset
auth-error-146 = Invalid signin code
auth-error-147 = Can not change primary email to an unverified email
auth-error-148 = Can not change primary email to an email that does not belong to this account
auth-error-149 = This email can not currently be used to login
auth-error-150 = Can not change primary email to an email that does not belong to this account
auth-error-151 = Failed to send email
auth-error-152 = Valid code required
auth-error-153 = This verification code has expired
auth-error-154 = A TOTP token already exists for this account
auth-error-155 = TOTP token not found
auth-error-156 = Recovery code not found
auth-error-157 = Unavailable device command
auth-error-158 = Recovery key not found
auth-error-159 = Invalid recovery key
auth-error-160 = This request requires two step authentication enabled on your account.
auth-error-165 = Failed due to a conflicting request, please try again.
auth-error-170 = This request requires two step authentication enabled on your account.
auth-error-176 = Unknown customer for subscription.
auth-error-177 = Unknown subscription.
auth-error-178 = Unknown plan for subscription.
auth-error-179 = Invalid payment token for subscription.
auth-error-180 = Subscription has already been cancelled
auth-error-181 = Update was rejected, please try again
auth-error-183 = Invalid or expired verification code
auth-error-188 = You have reached the maximum allowed secondary emails
auth-error-189 = This email already exists on your account
auth-error-190 = Could not update Ecosystem Anon ID because precondition failed.
auth-error-201 = Server busy, try again soon
auth-error-202 = Feature not enabled
auth-error-203 = System unavailable, try again soon
auth-error-204 = System unavailable, try again soon
auth-error-116 = This endpoint is no longer supported

# Auth based errors surfaced to users, ie through settings UI
auth-error-1001 = Login attempt cancelled
auth-error-1002 = Session expired. Sign in to continue.
auth-error-1003 = Cookies are still disabled
auth-error-1004 = Passwords do not match
auth-error-1005 = Working…
auth-error-1006 = Could not get Privacy Notice
auth-error-1007 = Could not get Terms of Service
auth-error-1008 = Your new password must be different
auth-error-1009 = Must be at least 8 characters
auth-error-1010 = Valid password required
auth-error-1011 = Valid email required
auth-error-1013 = A usable image was not found
auth-error-1014 = Could not initialize camera
auth-error-1015 = Valid URL required
auth-error-1017 = Unexpected error
auth-error-1018 = Your verification email was just returned. Mistyped email?
auth-error-1019 = Valid email required
auth-error-1020 = Enter a valid email address. firefox.com does not offer email.
auth-error-1021 = Unexpected error
auth-error-1022 = Firefox Accounts can only be placed into an IFRAME on approved sites
auth-error-1023 = Valid email required
auth-error-1025 = The link you clicked to verify your email is expired.
auth-error-1026 = Verification link damaged
auth-error-1027 = Unexpected error
auth-error-1028 = The image dimensions must be at least 100x100px
auth-error-1029 = Signup is coming soon to Firefox for iOS
auth-error-1031 = You must enter your age to sign up
auth-error-1032 = You must enter a valid age to sign up
auth-error-1033 = Unexpected error
auth-error-1034 = Account no longer exists.
auth-error-1039 = Server busy, try again soon
auth-error-1040 = The link you clicked to verify your email is expired.
auth-error-1041 = That confirmation link was already used, and can only be used once.
auth-error-1042 = This is a required field
auth-error-1043 = Authorization code required
auth-error-1044 = Invalid authorization code
auth-error-1045 = Link damaged
auth-error-1050 = Account has no uid
auth-error-1051 = Browser not configured to accept WebChannel messages from this domain
auth-error-1052 = That confirmation link was already used, and can only be used once.
auth-error-1053 = Two-step authentication code required
auth-error-1054 = Invalid two-step authentication code
auth-error-1055 = Recovery code required
auth-error-1056 = Invalid recovery code
auth-error-1057 = Password must not be your email address
auth-error-1058 = Password is too common
auth-error-1059 = Recovery key required
auth-error-1060 = Please enter verification code
auth-error-1062 = Invalid redirect
auth-error-1065 = The image file size is too large to be uploaded.

