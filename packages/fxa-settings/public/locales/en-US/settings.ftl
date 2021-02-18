# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

## Firefox and Mozilla Brand
##
## Firefox and Mozilla must be treated as a brand.
##
## They cannot be:
## - Transliterated.
## - Translated.
##
## Declension should be avoided where possible, leaving the original
## brand unaltered in prominent UI positions.
##
## For further details, consult:
## https://mozilla-l10n.github.io/styleguides/mozilla_general/#brands-copyright-and-trademark

-brand-mozilla = Mozilla
-brand-firefox = Firefox
-product-firefox-accounts = Firefox Accounts
# “Account” can be localized, “Firefox” must be treated as a brand.
# This is used to refer to a user's account, e.g. "update your Firefox account ..."
-firefox-account = Firefox account
product-mozilla-vpn = Mozilla VPN
product-firefox-monitor = Firefox Monitor

##

-google-play = Google Play
-app-store = App Store

##  Application page title and footer

app-default-title = { -product-firefox-accounts }
# This string is used as the title of the page.
# Variables:
#   $title (String) - the name of the current page
#                      (for example: "Two-Step Authentication")
app-page-title = { $title } | { -product-firefox-accounts }
app-footer-mozilla-logo-label = { -brand-mozilla } logo
app-footer-privacy-notice = Website Privacy Notice
app-footer-terms-of-service = Terms of Service

##

## User's avatar

avatar-your-avatar =
  .alt = Your avatar
avatar-default-avatar =
  .alt = Default avatar

##

## Connect another device promo

connect-another-fx-mobile = Get { -brand-firefox } on mobile or tablet
connect-another-find-fx-mobile = Find { -brand-firefox } in the { -google-play } and { -app-store } or
  <br /><linkExternal>send a download link to your device.</linkExternal>

##

## Connected services section

cs-heading = Connected Services
cs-description = Everything you are using and signed into.
cs-cannot-refresh = Sorry, there was a problem refreshing the list of connected
  services.
cs-cannot-disconnect = Client not found, unable to disconnect
# This string is used in a notification message near the top of the page.
# Variables:
#   $service (String) - the name of a device or service that uses Firefox Accounts
#                       (for example: "Firefox Lockwise")
cs-logged-out = Logged out of { $service }.

cs-refresh-button =
  .title = Refresh connected services

# Link text to a support page on missing or duplicate devices
cs-missing-device-help = Missing or duplicate items?

cs-disconnect-sync-heading = Disconnect from Sync
# This string is used in a modal dialog when the user starts the disconnect from
# Sync process.
# Variables:
#   $device (String) - the name of a device using Firefox Accounts
#                      (for example: "Firefox Nightly on Google Pixel 4a")
cs-disconnect-sync-content = Your browsing data will remain on your
  device ({ $device }), but it will no longer sync with your account.
cs-disconnect-sync-reason = What’s the main reason for disconnecting this
  device?

## The following are the options for selecting a reason for disconnecting the
## device

cs-disconnect-sync-opt-prefix = The device is:
cs-disconnect-sync-opt-suspicious = Suspicious
cs-disconnect-sync-opt-lost = Lost or Stolen
cs-disconnect-sync-opt-old = Old or Replaced
cs-disconnect-sync-opt-duplicate = Duplicate
cs-disconnect-sync-opt-not-say = Rather not say

##

cs-disconnect-advice-confirm = Okay, got it
cs-disconnect-lost-advice-heading = Lost or stolen device disconnected
cs-disconnect-lost-advice-content = Since your device was lost or stolen, to
  keep your information safe, you should change your { -product-firefox-account } password
  in your account settings. You should also look for information from your
  device manufacturer about erasing your data remotely.
cs-disconnect-suspicious-advice-heading = Suspicious device disconnected
cs-disconnect-suspicious-advice-content = If the disconnected device is indeed
  suspicious, to keep your information safe, you should change your { -firefox-account }
  password in your account settings. You should also change any other
  passwords you saved in { -brand-firefox } by typing about:logins into the address bar.

cs-sign-out-button = Sign out

##

## Tooltip notifications for actions performed on recovery keys or one-time use codes

datablock-download =
  .message = Downloaded
datablock-copy =
  .message = Copied
datablock-print =
  .message = Printed

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
header-title = { -product-firefox-accounts }
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

## Two Step Authentication - replace recovery code

tfa-replace-code-error = There was a problem replacing your recovery codes.
tfa-replace-code-success = New codes have been created. Save these one-time use
  codes in a safe place — you’ll need them to access your account if you don’t
  have your mobile device.

## Avatar change page

avatar-page-title =
  .title = Profile Picture
avatar-page-add-photo = Add Photo
avatar-page-add-photo-button =
  .title = { avatar-page-add-photo }
avatar-page-take-photo = Take Photo
avatar-page-take-photo-button =
  .title = { avatar-page-take-photo }
avatar-page-remove-photo = Remove Photo
avatar-page-remove-photo-button =
  .title = { avatar-page-remove-photo }
avatar-page-retake-photo = Retake Photo
avatar-page-close-button = Close
avatar-page-save-button = Save
avatar-page-zoom-out-button = Zoom Out
avatar-page-zoom-in-button = Zoom In
avatar-page-rotate-button = Rotate
avatar-page-camera-error = Could not initialize camera
avatar-page-new-avatar =
  .alt = new profile picture
avatar-page-file-upload-error = There was a problem uploading your profile picture
avatar-page-delete-error = There was a problem deleting your avatar
avatar-page-image-too-large-error = The image file size is too large to be uploaded.

##

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
pw-change-cancel-button = Cancel
pw-change-save-button = Save
pw-change-forgot-password-link = Forgot password?

pw-change-current-password =
  .label = Enter current password
pw-change-new-password =
  .label = Enter new password
pw-change-confirm-password =
  .label = Confirm new password

##

## Delete account page

delete-account-header =
 .title = Delete Account

delete-account-step-1-2 = Step 1 of 2
delete-account-step-2-2 = Step 2 of 2

delete-account-confirm-title = You’ve connected your { -product-firefox-account } to { -brand-mozilla } products that keep you secure and productive on the web:

delete-account-acknowledge = Please acknowledge that by deleting your account:

delete-account-chk-box-1 =
 .label = Any paid subscriptions you have will be canceled
delete-account-chk-box-2 =
 .label = You may lose saved information and features within { -brand-mozilla } products
delete-account-chk-box-3 =
 .label = Reactivating with this email may not restore your saved information
delete-account-chk-box-4 =
 .label = Any extensions and themes that you published to addons.mozilla.org will be deleted

delete-account-close-button = Close
delete-account-continue-button = Continue

delete-account-password-input =
 .label = Enter password

delete-account-cancel-button = Cancel
delete-account-delete-button = Delete Account

##

## Display name page

display-name-input =
 .label = Enter display name
submit-display-name = Save
cancel-display-name = Cancel

display-name-update-error = There was a problem updating your display name.

##

# Recovery key setup page

recovery-key-cancel-button = Cancel
recovery-key-close-button = Close
recovery-key-continue-button = Continue
recovery-key-created = Your recovery key has been created. Be sure to save the key in a safe place that you can easily find later — you’ll need the key to regain access to your data if you forget your password.
recovery-key-enter-password =
  .label = Enter password
recovery-key-page-title =
  .title = Recovery key
recovery-key-step-1 = Step 1 of 2
recovery-key-step-2 = Step 2 of 2

## Add secondary email page

add-secondary-email-error = There was a problem creating this email.
add-secondary-email-page-title =
  .title = Secondary email
add-secondary-email-enter-address =
  .label = Enter email address
add-secondary-email-cancel-button = Cancel
add-secondary-email-save-button = Save

##

## Verify secondary email page

verify-secondary-email-error = There was a problem sending the verification code.
verify-secondary-email-page-title =
  .title = Secondary email
verify-secondary-email-verification-code =
  .label = Enter your verification code
verify-secondary-email-cancel-button = Cancel
verify-secondary-email-verify-button = Verify
# This string is instruction in a form.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
verify-secondary-email-please-enter-code = Please enter the verification code that was sent to <strong>{$email}</strong> within 5 minutes.

##

# Link to delete account on main Settings page
delete-account-link = Delete Account

## Two Step Authentication

tfa-title = Two-Step Authentication

tfa-step-1-3 = Step 1 of 3
tfa-step-2-3 = Step 2 of 3
tfa-step-3-3 = Step 3 of 3

tfa-button-continue = Continue
tfa-button-cancel = Cancel
tfa-button-finish = Finish

tfa-incorrect-totp = Incorrect two-step authentication code
tfa-cannot-retrieve-code = There was a problem retrieving your code.
tfa-cannot-verify-code = There was a problem verifying your recovery code.
tfa-incorrect-recovery-code = Incorrect recovery code
tfa-enabled = Two-step authentication enabled

tfa-scan-this-code = Scan this QR code using one of <linkExternal>these
  authentication apps</linkExternal>.

# This is the image alt text for a QR code.
# Variables:
#   $secret (String) - a long alphanumeric string that does not require translation
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

##

## Profile section

porfile-heading = Profile
profile-display-name =
  .header = Display name
profile-password =
  .header = Password
# This is a string that shows when the user's password was created.
# Variables:
#   $date (String) - a localized date and time string
profile-password-created-date = Created { $date }
profile-primary-email =
  .header = Primary email

##

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
rk-content-explain = Restore your information when you forget your password.
rk-content-reset-data = Why does resetting my password reset my data?
rk-cannot-verify-session = Sorry, there was a problem verifying your session
rk-remove-modal-heading = Remove recovery key?
rk-remove-modal-content = In the event you reset your password, you won’t be
  able to use your recovery key to access your data. You can’t undo this action.

## Secondary email sub-section on main Settings page

se-heading = Secondary email
  .header = Secondary Email
se-cannot-refresh-email = Sorry, there was a problem refreshing that email.
se-cannot-resend-code = Sorry, there was a problem re-sending the verification code.
# This string is used in a notification message near the top of the page.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
se-set-primary-successful = { $email } is now your primary email.
se-set-primary-error = Sorry, there was a problem changing your primary email.
# This string is used in a notification message near the top of the page.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
se-delete-email-successful = { $email } successfully deleted.
se-delete-email-error = Sorry, there was a problem deleting this email.
se-verify-session = You’ll need to verify your current session to perform this action.
se-verify-session-error = Sorry, there was a problem verifying your session.
# Button to remove the secondary email
se-remove-email =
  .title = Remove email
# Button to refresh secondary email status
se-refresh-email =
  .title = Refresh email
se-unverified = unverified
se-resend-code = Verification needed. <button>Resend verification code</button>
  if it’s not in your inbox or spam folder.
# Button to make secondary email the primary
se-make-primary = Make primary
se-default-content = Access your account if you can’t log in to your primary email.
se-content-note = Note: a secondary email won’t restore your information — you’ll
  need a <a>recovery key</a> for that.

##

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
tfa-row-disable-modal-explain = You won’t be able to undo this action. You also
  have the option of <linkExternal>replacing your recovery codes</linkExternal>.
tfa-row-cannot-disable = Two-step authentication could not be disabled.

tfa-row-change-modal-heading = Change recovery codes?
tfa-row-change-modal-confirm = Change
tfa-row-change-modal-explain = You won’t be able to undo this action.

## Avatar sub-section on main Settings page

avatar-heading = Picture
avatar-add-link = Add
avatar-change-link = Change

## Auth-server based errors that originate from backend service

auth-error-102 = Unknown account
auth-error-103 = Incorrect password
auth-error-110 = Invalid token
auth-error-138 = Unverified session
auth-error-155 = TOTP token not found
auth-error-1008 = Your new password must be different
