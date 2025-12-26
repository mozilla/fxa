# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.


## Banner component

resend-code-success-banner-heading = A new code was sent to your email.
resend-link-success-banner-heading = A new link was sent to your email.
# $accountsEmail is the Mozilla accounts sender email address (e.g. accounts@firefox.com)
resend-success-banner-description = Add { $accountsEmail } to your contacts to ensure a smooth delivery.

## Brand Messaging component
## Used to show in product messaging about upcoming brand changes

# This aria-label applies to the dismiss/close button of the banner
# This text is for screen-readers
brand-banner-dismiss-button-2 =
    .aria-label = Close banner
# This message is displayed as the title element in the banner, prior to actually launching the new brand
brand-prelaunch-title = { -product-firefox-accounts } will be renamed { -product-mozilla-accounts } on Nov 1
# This message is displayed as sub title element in the banner, giving a it more context about the brand changes.
brand-prelaunch-subtitle = You’ll still sign in with the same username and password, and there are no other changes to the products that you use.
# This message is displayed as title element in the banner, after the brand changes take affect letting the user know that
# no action is required on their part
brand-postlaunch-title = We’ve renamed { -product-firefox-accounts } to { -product-mozilla-accounts }. You’ll still sign in with the same username and password, and there are no other changes to the products that you use.
# This is an extra link element, that directs users to a page where they can learn more about the branding changes.
brand-learn-more = Learn more
# Alt text for close banner image
brand-close-banner =
    .alt = Close Banner
# Alt text for 'm' logo in banner header
brand-m-logo =
    .alt = { -brand-mozilla } m logo

## ButtonBack component
## Allows users to click a back arrow to navigate to the previous page

button-back-aria-label = Back
button-back-title = Back

## ButtonDownloadRecoveryKeyPDF
## Clicking on this button downloads a PDF file that contains the user's account recovery key
## The account recovery key can be used to recover data when users forget their account password

# Button to download the account recovery key as a PDF file and navigate to the next step
# The next (and final) step is an optional prompt to save a storage hint
# .title will displayed as a tooltip on the button
recovery-key-download-button-v3 = Download and continue
    .title = Download and continue
recovery-key-pdf-heading = Account Recovery Key
# Date when the account recovery key was created and this file was downloaded
# { $date }: formatted date with 'medium' dateStyle format (e.g., for 'en': Jul 31, 2023)
recovery-key-pdf-download-date = Generated: { $date }
# Shown directly above recovery key value and preceeded by a key icon
recovery-key-pdf-key-legend = Account Recovery Key
# Instructions in the text file to prompt the user to keep this information in a secure, easy to remember location.
# Password resets without this account recovery key can result in data loss.
# "key" here refers to "account recovery key"
recovery-key-pdf-instructions = This key allows you to recover your encrypted browser data (including passwords, bookmarks, and history) if you forget your password. Store it in a place you’ll remember.
# This heading is shown above a list of options for storing the account recovery key
# "key" here refers to "account recovery key"
recovery-key-pdf-storage-ideas-heading = Places to store your key
# Followed by a link (https://mzl.la/3bNrM1I) to get more information and support
recovery-key-pdf-support = Learn more about your account recovery key
# Error message displayed in an alert bar if the PDF download failed.
recovery-key-pdf-download-error = Sorry, there was a problem downloading your account recovery key.

## ChooseNewsletters component
## Checklist of newsletters that the user can choose to sign up to

# Prompt above a checklist of newsletters
choose-newsletters-prompt-2 = Get more from { -brand-mozilla }:
# Newsletter checklist item
choose-newsletters-option-latest-news =
    .label = Get our latest news and product updates
# Newsletter checklist item
choose-newsletters-option-test-pilot =
    .label = Early access to test new products
# Newsletter checklist item. This for a Mozilla Foundation newsletters,
# "Action alerts" can be interpreted as "Calls to action"
choose-newsletters-option-reclaim-the-internet =
    .label = Action alerts to reclaim the internet

## Tooltip notifications for actions performed on account recovery keys or one-time use codes

datablock-download =
    .message = Downloaded
datablock-copy =
    .message = Copied
datablock-print =
    .message = Printed

## Success banners for datablock actions.
## $count – number of codes

datablock-copy-success =
    { $count ->
        [one] Code copied
       *[other] Codes copied
    }
datablock-download-success =
    { $count ->
        [one] Code downloaded
       *[other] Codes downloaded
    }
datablock-print-success =
    { $count ->
        [one] Code printed
       *[other] Codes printed
    }

##

# Tooltip notification when an account recovery key or one-time use code is copied.
datablock-inline-copy =
    .message = Copied

## DeviceInfoBlock component
## The strings here are used to display information about the origin of activity happening on a user's account
## For example, when connecting another device to the user's account

# Variables { $city }, { $region }, { $country } represent the estimated location of the user's device
# For example, 'Vancouver, British Columbia, Canada (estimated)'
device-info-block-location-city-region-country = { $city }, { $region }, { $country } (estimated)
# Variables { $region }, { $country } represent the estimated location of the user's device
# For example, 'British Columbia, Canada (estimated)'
device-info-block-location-region-country = { $region }, { $country } (estimated)
# Variables { $city }, { $country } represent the estimated location of the user's device
# For example, 'Vancouver, Canada (estimated)'
device-info-block-location-city-country = { $city }, { $country } (estimated)
# Variable { $country } represent the estimated location of the user's device
# For example, 'Canada (estimated)'
device-info-block-location-country = { $country } (estimated)
# When an approximate location for the user's device could not be determined
device-info-block-location-unknown = Location unknown
# Variable { $browserName } is the browser that created the request (e.g., Firefox)
# Variable { $genericOSName } is the name of the operating system that created the request (e.g., MacOS, Windows, iOS)
device-info-browser-os = { $browserName } on { $genericOSName }
# Variable { $ipAddress } represents the IP address where the request originated
# The IP address is a string of numbers separated by periods (e.g., 192.158.1.38)
device-info-ip-address = IP address: { $ipAddress }

## FormPasswordInlineCriteria

form-password-with-inline-criteria-signup-new-password-label =
    .label = Password
form-password-with-inline-criteria-signup-confirm-password-label =
    .label = Repeat password
form-password-with-inline-criteria-signup-submit-button = Create account
form-password-with-inline-criteria-reset-new-password =
    .label = New password
form-password-with-inline-criteria-confirm-password =
    .label = Confirm password
form-password-with-inline-criteria-reset-submit-button = Create new password
form-password-with-inline-criteria-set-password-new-password-label =
    .label = Password
form-password-with-inline-criteria-set-password-confirm-password-label =
    .label = Repeat password
form-password-with-inline-criteria-set-password-submit-button = Start synchronising
form-password-with-inline-criteria-match-error = Passwords do not match
form-password-with-inline-criteria-sr-too-short-message = Password must contain at least 8 characters.
form-password-with-inline-criteria-sr-not-email-message = Password must not contain your email address.
form-password-with-inline-criteria-sr-not-common-message = Password must not be a commonly used password.
form-password-with-inline-criteria-sr-requirements-met = The entered password respects all password requirements.
form-password-with-inline-criteria-sr-passwords-match = Entered passwords match.

## FormVerifyCode

# Fallback default localized error message for empty input field
form-verify-code-default-error = This field is required

## FormVerifyTotp component
## Form to enter a time-based one-time-passcode (e.g., 6-digit numeric code or 8-digit alphanumeric code)

# Information explaining why button is disabled, also read to screen readers
# Submit button is disabled unless a valid code format is entered
# Used when the code may only contain numbers
# $codeLength : number of digits in a valid code
form-verify-totp-disabled-button-title-numeric = Enter { $codeLength }-digit code to continue
# Information explaining why button is disabled, also read to screen readers
# Submit button is disabled unless a valid code format is entered
# Used when the code may contain numbers and/or letters
# $codeLength : number of characters in a valid code
form-verify-totp-disabled-button-title-alphanumeric = Enter { $codeLength }-character code to continue

# GetDataTrio component, part of Account Recovery Key flow

get-data-trio-title-firefox = { -brand-firefox }
get-data-trio-title-firefox-recovery-key = { -brand-firefox } account recovery key
get-data-trio-title-backup-verification-codes = Backup authentication codes
get-data-trio-download-2 =
    .title = Download
    .aria-label = Download
get-data-trio-copy-2 =
    .title = Copy
    .aria-label = Copy
get-data-trio-print-2 =
    .title = Print
    .aria-label = Print

## Images - these are all aria labels used for illustrations
## Aria labels are used as alternate text that can be read aloud by screen readers.

# Aria-label option for an alert symbol
alert-icon-aria-label =
    .aria-label = Alert
# Aria-label option for an alert symbol
icon-attention-aria-label =
    .aria-label = Attention
# Aria-label option for an alert symbol
icon-warning-aria-label =
    .aria-label = Warning
authenticator-app-aria-label =
    .aria-label = Authenticator Application
backup-codes-icon-aria-label-v2 =
    .aria-label = Backup authentication codes enabled
backup-codes-disabled-icon-aria-label-v2 =
    .aria-label = Backup authentication codes disabled
# An icon of phone with text message. A back recovery phone number
backup-recovery-sms-icon-aria-label =
    .aria-label = Recovery SMS enabled
# Disabled version of backup-recovery-sms-icon-aria-label
backup-recovery-sms-disabled-icon-aria-label =
    .aria-label = Recovery SMS disabled
# Used to select Canada as country code for phone number
canadian-flag-icon-aria-label =
    .aria-label = Canadian Flag
# Used to  indicate a general checkmark, as in something checked off in a list!
checkmark-icon-aria-label =
    .aria-label = Tick
# Used to  indicate a check mark for a successful state/action
checkmark-success-icon-aria-label =
    .aria-label = Success
# Used to indicate a check mark for an enabled state/option
checkmark-enabled-icon-aria-label =
    .aria-label = Enabled
# Used on X icon to dismiss a message such as an alert or banner
close-icon-aria-label =
    .aria-label = Close message
# Used to decorate a code you enter for verification purposes
code-icon-aria-label =
    .aria-label = Code
error-icon-aria-label =
    .aria-label = Error
# Used as information icon for informative messaging
info-icon-aria-label =
    .aria-label = Information
# Used to select United States as a country code for phone number
usa-flag-icon-aria-label =
    .aria-label = United States Flag

## Images - these are all aria labels used for illustrations
## Aria labels are used as alternate text that can be read aloud by screen readers.

hearts-broken-image-aria-label =
    .aria-label = A computer and a mobile phone and an image of a broken heart on each
hearts-verified-image-aria-label =
    .aria-label = A computer and a mobile phone and a tablet with a pulsing heart on each
signin-recovery-code-image-description =
    .aria-label = Document that contains hidden text.
signin-totp-code-image-label =
    .aria-label = A device with a hidden 6-digit code.
confirm-signup-aria-label =
    .aria-label = An envelope containing a link
# Used for an image of a key on a shield surrounded by 5 other icons representing information that can be recovered with the account recovery key.
# Other icons and their meaning: Gear (settings), star (favorites), clock (history), magnifying glass (search) and lock (passwords).
security-shield-aria-label =
    .aria-label = Illustration to represent an account recovery key.
# Used for an image of a single key.
recovery-key-image-aria-label =
    .aria-label = Illustration to represent an account recovery key.
password-image-aria-label =
    .aria-label = An illustration to represent typing in a password.
lightbulb-aria-label =
    .aria-label = Illustration to represent creating a storage hint.
email-code-image-aria-label =
    .aria-label = Illustration to represent an email containing a code.
recovery-phone-image-description =
    .aria-label = Mobile device that receives a code by text message.
recovery-phone-code-image-description =
    .aria-label = Code received on a mobile device.
backup-recovery-phone-image-aria-label =
    .aria-label = Mobile device with SMS text message capabilities
backup-authentication-codes-image-aria-label =
    .aria-label = Device screen with codes
sync-clouds-image-aria-label =
    .aria-label = Clouds with a synchronisation icon
confetti-falling-image-aria-label =
    .aria-label = Animated falling confetti

## InlineRecoveryKeySetupCreate component
## Users see this view when we prompt them to generate an account recovery key
## after signing in.

inline-recovery-key-setup-signed-in-firefox-2 = You’re signed in to { -brand-firefox }.
inline-recovery-key-setup-create-header = Secure your account
# This is a subheader asking users to create an account recovery key, indicating it will only take a moment to complete.
inline-recovery-key-setup-create-subheader = Got a minute to protect your data?
inline-recovery-key-setup-info = Create an account recovery key so you can restore your synchronised browsing data if you ever forget your password.
inline-recovery-key-setup-start-button = Create account recovery key
inline-recovery-key-setup-later-button = Do it later

## Input Password

# Tooltip displayed on a password input visibility toggle. Expresses the toggle action, where clicking on the toggle will hide the password.
input-password-hide = Hide password
# Tooltip displayed on a password input visibility toggle. Expresses the toggle action, where clicking on the toggle will show the password.
input-password-show = Show password
# Message read by screen readers when focus is on a password input visibility toggle. Expresses current (visible) state of the textbox content.
input-password-hide-aria-2 = Your password is currently visible on screen.
# Message read by screen readers when focus is on a password input visibility toggle. Expresses current (hidden) state of the textbox content.
input-password-show-aria-2 = Your password is currently hidden.
# Message read by screen readers after clicking on a password input visibility toggle to show the password. Expresses the new (visible) state of the textbox content.
input-password-sr-only-now-visible = Your password is now visible on screen.
# Message read by screen readers after clicking on a password input visibility toggle to hide the password. Expresses the new (hidden) state of the textbox content.
input-password-sr-only-now-hidden = Your password is now hidden.

## Phone number component

# This is an aria-label available to screen readers for a selection list that includes country flags, country name and country code
input-phone-number-country-list-aria-label = Select country
input-phone-number-enter-number = Enter phone number
input-phone-number-country-united-states = United States
input-phone-number-country-canada = Canada
# Back button on legal/terms or legal/privacy that takes users to the previous page
legal-back-button = Back

## LinkDamaged component

# The user followed a password reset link that was received by email
# but the link is damaged (for example mistyped or broken by the email client)
reset-pwd-link-damaged-header = Reset password link damaged
# The user followed a link to signin that was received by email
# but the link was damaged (for example mistyped or broken by the email client).
signin-link-damaged-header = Confirmation link damaged
# The user followed a link to report an invalid signin attempt that was received by email
# but the link was damaged (for example mistyped or broken by the email client).
report-signin-link-damaged-header = Link damaged
# The user followed a link received by email, but the link was damaged.
reset-pwd-link-damaged-message = The link you clicked was missing characters, and may have been broken by your email client. Copy the address carefully, and try again.

## LinkExpired component

# Button to request a new link if the previous link that was emailed to the user is expired
link-expired-new-link-button = Receive new link

## LinkRememberPassword component

# immediately before remember-password-signin-link
remember-password-text = Remember your password?
# link navigates to the sign in page
remember-password-signin-link = Sign in

## LinkUsed component

# The user followed a primary email confirmation link, but that link is has been used and is no longer valid
primary-email-confirmation-link-reused = Primary email already confirmed
# The user followed a sign-in confirmation link, but that link has been used and is no longer valid
signin-confirmation-link-reused = Sign-in already confirmed
confirmation-link-reused-message = That confirmation link was already used, and can only be used once.

## Locale Toggle Component

locale-toggle-select-label = Select language
locale-toggle-browser-default = Browser default
# Users will see this heading when the URL or network request is malformed, e.g. a query parameter is required and is invalid
error-bad-request = Bad Request

## PasswordInfoBalloon
## Balloon displayed next to password input field

password-info-balloon-why-password-info = You need this password to access any encrypted data you store with us.
password-info-balloon-reset-risk-info = A reset means potentially losing data like passwords and bookmarks.

## PasswordStrengthInline component
## These strings are conditions that need to be met to qualify as a strong password

password-strength-long-instruction = Pick a strong password you haven’t used on other sites. Ensure it meets the security requirements:
password-strength-short-instruction = Pick a strong password:
password-strength-inline-min-length = At least 8 characters
password-strength-inline-not-email = Not your email address
password-strength-inline-not-common = Not a commonly used password
password-strength-inline-confirmed-must-match = Confirmation matches the new password
password-strength-inline-passwords-match = Passwords match

## Notification Promo Banner component

account-recovery-notification-cta = Create
account-recovery-notification-header-value = Don’t lose your data if you forget your password
account-recovery-notification-header-description = Create an account recovery key to restore your synchronised browsing data if you ever forget your password.
recovery-phone-promo-cta = Add recovery phone
recovery-phone-promo-heading = Add extra protection to your account with a recovery phone
recovery-phone-promo-description = Now you can sign in with a one-time-password via SMS if you can’t use your two-step authenticator app.
recovery-phone-promo-info-link = Learn more about recovery and SIM swap risk
promo-banner-dismiss-button =
    .aria-label = Dismiss banner

## Ready component

ready-complete-set-up-instruction = Complete setup by entering your new password on your other { -brand-firefox } devices.
manage-your-account-button = Manage your account
# This is a string that tells the user they can use whatever service prompted them to reset their password or to verify their email
# Variables:
# { $serviceName } represents a product name (e.g., Mozilla VPN) that will be passed in as a variable
ready-use-service = You’re now ready to use { $serviceName }
# The user successfully accomplished a task (password reset, confirm email) that lets them use their account
ready-use-service-default = You’re now ready to use account settings
# Message shown when the account is ready but the user is not signed in
ready-account-ready = Your account is ready!
ready-continue = Continue
sign-in-complete-header = Sign-in confirmed
sign-up-complete-header = Account confirmed
primary-email-verified-header = Primary email confirmed

## Users see this view when they are generating a new account recovery key
## This screen displays the generated key and allows users to download or copy the key

# This heading is shown above a list of options for storing the account recovery key
# "key" here refers to "account recovery key"
flow-recovery-key-download-storage-ideas-heading-v2 = Places to store your key:
flow-recovery-key-download-storage-ideas-folder-v2 = Folder on secure device
flow-recovery-key-download-storage-ideas-cloud = Trusted cloud storage
flow-recovery-key-download-storage-ideas-print-v2 = Printed physical copy
flow-recovery-key-download-storage-ideas-pwd-manager = Password manager

## RecoveryKeySetupHint
## This is the final step in the account recovery key creation flow after a Sync signin or in account settings
## Prompts the user to save an (optional) storage hint about the location of their account recovery key.

# The header of the last step in the account recovery key creation flow
# "key" here refers to the "account recovery key"
flow-recovery-key-hint-header-v2 = Add a hint to help find your key
# This message explains why saving a storage hint can be helpful. The account recovery key could be "stored" in a physical (e.g., printed) or virtual location (e.g., in a device folder or in the cloud).
# "it" here refers to the storage hint, NOT the "account recovery key"
flow-recovery-key-hint-message-v3 = This hint should help you remember where you stored your account recovery key. We can show it to you during the password reset to recover your data.
# The label for the text input where the user types in the storage hint they want to save.
# The storage hint is optional, and users can leave this blank.
flow-recovery-key-hint-input-v2 =
    .label = Enter a hint (optional)
# The text of the "submit" button. Clicking on this button will save the hint (if provided) and exit the account recovery key creation flow.
# "Finish" refers to "Finish the account recovery key creation process"
flow-recovery-key-hint-cta-text = Finish
# Error displayed in a tooltip if the hint entered by the user exceeds the character limit.
# "Hint" refers to "storage hint"
flow-recovery-key-hint-char-limit-error = The hint must contain fewer than 255 characters.
# Error displayed in a tooltip if the user included unsafe unicode characters in their hint.
# "Hint" refers to "storage hint"
flow-recovery-key-hint-unsafe-char-error = The hint cannot contain unsafe unicode characters. Only letters, numbers, punctuation marks and symbols are allowed.

## ResetPasswordWarning component
## Warning shown to sync users that reset their password without using an account recovery key

password-reset-warning-icon = Warning
password-reset-chevron-expanded = Collapse warning
password-reset-chevron-collapsed = Expand warning
password-reset-data-may-not-be-recovered = Your browser data may not be recovered
password-reset-previously-signed-in-device-2 = Have any device where you previously signed in?
password-reset-data-may-be-saved-locally-2 = Your browser data might be saved on that device. Reset your password, then sign in there to restore and synchronise your data.
password-reset-no-old-device-2 = Have a new device but don’t have access to any of your previous ones?
password-reset-encrypted-data-cannot-be-recovered-2 = We’re sorry, but your encrypted browser data on { -brand-firefox } servers can’t be recovered.
password-reset-warning-have-key = Have an account recovery key?
password-reset-warning-use-key-link = Use it now to reset your password and keep your data

## Alert Bar

alert-bar-close-message = Close message

## User's avatar

avatar-your-avatar =
    .alt = Your avatar
avatar-default-avatar =
    .alt = Default avatar

##


# BentoMenu component

bento-menu-title-3 = { -brand-mozilla } products
bento-menu-tagline = More products from { -brand-mozilla } that protect your privacy
bento-menu-vpn-2 = { -product-mozilla-vpn }
bento-menu-monitor-3 = { -product-mozilla-monitor }
bento-menu-firefox-relay-2 = { -product-firefox-relay }
bento-menu-firefox-desktop = { -brand-firefox } Browser for Desktop
bento-menu-firefox-mobile = { -brand-firefox } Browser for Mobile
bento-menu-made-by-mozilla = Made by { -brand-mozilla }

## Connect another device promo

connect-another-fx-mobile = Get { -brand-firefox } on mobile or tablet
connect-another-find-fx-mobile-2 = Find { -brand-firefox } in the { -google-play } and { -app-store }.
# Alt text for Google Play and Apple App store images that will be shown if the image can't be loaded.
# These images are used to encourage users to download Firefox on their mobile devices.
connect-another-play-store-image-2 =
    .alt = Download { -brand-firefox } on { -google-play }
connect-another-app-store-image-3 =
    .alt = Download { -brand-firefox } on the { -app-store }

## Connected services section

cs-heading = Connected Services
cs-description = Everything you are using and signed into.
cs-cannot-refresh =
    Sorry, there was a problem refreshing the list of connected
    services.
cs-cannot-disconnect = Client not found, unable to disconnect
# This string is used in a notification message near the top of the page.
# Variables:
#   $service (String) - the name of a device or service that uses Mozilla accounts
#                       (for example: "Firefox Lockwise")
cs-logged-out-2 = Logged out of { $service }
cs-refresh-button =
    .title = Refresh connected services
# Link text to a support page on missing or duplicate devices
cs-missing-device-help = Missing or duplicate items?
cs-disconnect-sync-heading = Disconnect from Sync

## This string is used in a modal dialog when the user starts the disconnect from
## Sync process.
## Variables:
##   $device (String) - the name of a device using Mozilla accounts
##                      (for example: "Firefox Nightly on Google Pixel 4a")

cs-disconnect-sync-content-3 =
    Your browsing data will remain on <span>{ $device }</span>,
    but it will no longer synchronise with your account.
cs-disconnect-sync-reason-3 = What’s the main reason for disconnecting <span>{ $device }</span>?

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
cs-disconnect-lost-advice-content-3 = Since your device was lost or stolen, to keep your information safe, you should change your { -product-mozilla-account } password in your account settings. You should also look for information from your device manufacturer about erasing your data remotely.
cs-disconnect-suspicious-advice-heading = Suspicious device disconnected
cs-disconnect-suspicious-advice-content-2 = If the disconnected device is indeed suspicious, to keep your information safe, you should change your { -product-mozilla-account } password in your account settings. You should also change any other passwords you saved in { -brand-firefox } by typing about:logins into the address bar.
cs-sign-out-button = Sign out

## Data collection section

dc-heading = Data Collection and Use
dc-subheader-moz-accounts = { -product-mozilla-accounts }
dc-subheader-ff-browser = { -brand-firefox } browser
dc-subheader-content-2 = Allow { -product-mozilla-accounts } to send technical and interaction data to { -brand-mozilla }.
dc-subheader-ff-content = To review or update your { -brand-firefox } browser technical and interaction data settings, open { -brand-firefox } settings and navigate to Privacy and Security.
dc-opt-out-success-2 = Opt out successful. { -product-mozilla-accounts } won’t send technical or interaction data to { -brand-mozilla }.
dc-opt-in-success-2 = Thanks! Sharing this data helps us improve { -product-mozilla-accounts }.
dc-opt-in-out-error-2 = Sorry, there was a problem changing your data collection preference
dc-learn-more = Learn more

# DropDownAvatarMenu component

drop-down-menu-title-2 = { -product-mozilla-account } menu
# This is displayed in the Settings menu after user's click on their profile icon.
# Following this string on a new line will be their display name (user's name or email)
drop-down-menu-signed-in-as-v2 = Signed in as
drop-down-menu-sign-out = Sign out
drop-down-menu-sign-out-error-2 = Sorry, there was a problem signing you out

## Flow Container

flow-container-back = Back

## FlowRecoveryKeyConfirmPwd - Second view in the PageRecoveryKeyCreate flow
## Users see this view when they are generating a new account recovery key
## This screen asks the user to confirm their password before generating a new key

flow-recovery-key-confirm-pwd-heading-v2 = Re-enter your password for security
flow-recovery-key-confirm-pwd-input-label = Enter your password
# Clicking on this button will check the password and create an account recovery key
flow-recovery-key-confirm-pwd-submit-button = Create account recovery key
# For users with an existing account recovery key, clicking on this button will
# check the password, delete the existing key and create a new account recovery key
flow-recovery-key-confirm-pwd-submit-button-change-key = Create new account recovery key

## FlowRecoveryKeyDownload - Third view in the PageRecoveryKeyCreate flow
## Users see this view when they are generating a new account recovery key
## This screen displays the generated key and allows users to download or copy the key

flow-recovery-key-download-heading-v2 = Account recovery key created — Download and store it now
# The "key" here refers to the term "account recovery key"
flow-recovery-key-download-info-v2 = This key allows you to recover your data if you forget your password. Download it now and store it somewhere you’ll remember — you won’t be able to return to this page later.
# This link allows user to proceed to the next step without clicking the download button
flow-recovery-key-download-next-link-v2 = Continue without downloading

## FlowRecoveryKeyHint
## This is the fourth and final step in the account recovery key creation flow in account settings
## Prompts the user to save an (optional) storage hint about the location of their account recovery key.

# Success message displayed in alert bar after the user has finished creating an account recovery key.
flow-recovery-key-success-alert = Account recovery key created

## FlowRecoveryKeyInfo - First view in the PageRecoveryKeyCreate flow

# The header of the first view in the Recovery Key Create flow
flow-recovery-key-info-header = Create an account recovery key in case you forget your password
# The header of the first view in the Recovery Key Create flow when replacing an existing recovery key
flow-recovery-key-info-header-change-key = Change your account recovery key
# In the first view of the PageRecoveryKeyCreate flow, this is the first of two bullet points explaining why the user should create an account recovery key
flow-recovery-key-info-shield-bullet-point-v2 = We encrypt browsing data –– passwords, bookmarks, and more. It’s great for privacy, but you may lose your data if you forget your password.
# In the first view of the PageRecoveryKeyCreate flow, this is the second of two bullet points explaining why the user should create an account recovery key
flow-recovery-key-info-key-bullet-point-v2 = That’s why creating an account recovery key is so important –– you can use it to restore your data.
# The text of the "submit" button to start creating (or changing) an account recovery key
flow-recovery-key-info-cta-text-v3 = Get started
# Link to cancel account recovery key change and return to settings
flow-recovery-key-info-cancel-link = Cancel

## FlowSetup2faApp

flow-setup-2fa-qr-heading = Connect to your authenticator app
# DEV NOTE: "2a" in the id should be "2fa". This typo is kept intentionally to
# avoid losing existing translations; fix it when creating a new version of
# this string.
flow-setup-2a-qr-instruction = <strong>Step 1:</strong> Scan this QR code using any authenticator app, like Duo or Google Authenticator.
# Alt text for the QR-code image shown during two-step authentication setup.
# “setup secret key” refers to the long code you can copy instead of scanning.
# Not to be confused with the 6-digit codes generated by the authenticator app.
flow-setup-2fa-qr-alt-text =
    .alt = QR code for setting up two-step authentication. Scan it, or choose “Can’t scan QR code?” to get a setup secret key instead.
flow-setup-2fa-cant-scan-qr-button = Can’t scan QR code?
flow-setup-2fa-manual-key-heading = Enter code manually
flow-setup-2fa-manual-key-instruction = <strong>Step 1:</strong> Enter this code in your preferred authenticator app.
flow-setup-2fa-scan-qr-instead-button = Scan QR code instead?
# links to https://support.mozilla.org/kb/secure-firefox-account-two-step-authentication#w_step-one
flow-setup-2fa-more-info-link = Learn more about authenticator apps
flow-setup-2fa-button = Continue
flow-setup-2fa-step-2-instruction = <strong>Step 2:</strong> Enter the code from your authenticator app.
flow-setup-2fa-input-label = Enter 6-digit code
flow-setup-2fa-code-error = Invalid or expired code. Check your authenticator app and try again.

## The step to choose the two step authentication method in the two step
## authentication setup flow.

flow-setup-2fa-backup-choice-heading = Choose a recovery method
flow-setup-2fa-backup-choice-description = This allows you to sign in if you can’t access your mobile device or authenticator app.
flow-setup-2fa-backup-choice-phone-title = Recovery phone
flow-setup-2fa-backup-choice-phone-badge = Easiest
flow-setup-2fa-backup-choice-phone-info = Get a recovery code via text message. Currently available in the USA and Canada.
flow-setup-2fa-backup-choice-code-title = Backup authentication codes
flow-setup-2fa-backup-choice-code-badge = Safest
flow-setup-2fa-backup-choice-code-info = Create and save one-time-use authentication codes.
# This link points to https://support.mozilla.org/kb/secure-mozilla-account-two-step-authentication
flow-setup-2fa-backup-choice-learn-more-link = Learn about recovery and SIM swap risk

## The backup code confirm step of the setup 2 factor authentication flow,
## where the user confirm that they have saved their backup authentication codes
## by entering one of them.

flow-setup-2fa-backup-code-confirm-heading = Enter backup authentication code
# codes here refers to backup authentication codes
flow-setup-2fa-backup-code-confirm-confirm-saved = Confirm you saved your codes by entering one. Without these codes, you might not be able to sign in if you don’t have your authenticator app.
flow-setup-2fa-backup-code-confirm-code-input = Enter 10-character code
# Clicking on this button finishes the whole flow upon success.
flow-setup-2fa-backup-code-confirm-button-finish = Finish

## The backup codes download step of the setup 2 factor authentication flow

flow-setup-2fa-backup-code-dl-heading = Save backup authentication codes
flow-setup-2fa-backup-code-dl-save-these-codes = Keep these in a place you’ll remember. If you don’t have access to your authenticator app you’ll need to enter one to sign in.
flow-setup-2fa-backup-code-dl-button-continue = Continue

##

flow-setup-2fa-inline-complete-success-banner = Two-step authentication enabled
flow-setup-2fa-inline-complete-success-banner-description = To protect all your connected devices, you should sign out everywhere you’re using this account, and then sign back in using your new two-step authentication.
flow-setup-2fa-inline-complete-backup-code = Backup authentication codes
flow-setup-2fa-inline-complete-backup-phone = Recovery phone
# $count (Number) - an integer representing the number of backup
# authentication codes remaining
flow-setup-2fa-inline-complete-backup-code-info =
    { $count ->
        [one] { $count } code remaining
       *[other] { $count } codes remaining
    }
flow-setup-2fa-inline-complete-backup-code-description = This is the safest recovery method if you can’t sign in with your mobile device or authenticator app.
flow-setup-2fa-inline-complete-backup-phone-description = This is the easiest recovery method if you can’t sign in with your authenticator app.
flow-setup-2fa-inline-complete-learn-more-link = How this protects your account
# $serviceName (String) - the name of the product that the user will be
# redirected to.
flow-setup-2fa-inline-complete-continue-button = Continue to { $serviceName }
flow-setup-2fa-prompt-heading = Set up two-step authentication
# Variable { $serviceName } is the name of the product (e.g. Firefox Add-ons)
# that requests two-step authentication setup.
flow-setup-2fa-prompt-description = { $serviceName } requires you to set up two-step authentication to keep your account safe.
# "these authenticator apps" links to https://support.mozilla.org/kb/secure-firefox-account-two-step-authentication
flow-setup-2fa-prompt-use-authenticator-apps = You can use any of <authenticationAppsLink>these authenticator apps</authenticationAppsLink> to proceed.
flow-setup-2fa-prompt-continue-button = Continue

## FlowSetupPhoneConfirmCode

# verification code refers to a code sent by text message to confirm phone number ownership
# and complete setup
flow-setup-phone-confirm-code-heading = Enter verification code
# $phoneNumber is a partially obfuscated phone number with only the last 4 digits showing (e.g., *** *** 1234)
# span element applies formatting to ensure the number is always displayed left-to-right
flow-setup-phone-confirm-code-instruction = A 6-digit code was sent to <span>{ $phoneNumber }</span> by text message. This code expires after 5 minutes.
flow-setup-phone-confirm-code-input-label = Enter 6-digit code
flow-setup-phone-confirm-code-button = Confirm
# button to resend a code by text message to the user's phone
# followed by a button to resend a code
flow-setup-phone-confirm-code-expired = Code expired?
flow-setup-phone-confirm-code-resend-code-button = Resend code
flow-setup-phone-confirm-code-resend-code-success = Code sent
flow-setup-phone-confirm-code-success-message-v2 = Recovery phone added
flow-change-phone-confirm-code-success-message = Recovery phone changed

## FlowSetupPhoneConfirmCode

flow-setup-phone-submit-number-heading = Verify your phone number
# The code is a 6-digit code send by text message/SMS
flow-setup-phone-verify-number-instruction = You’ll get a text message from { -brand-mozilla } with a code to verify your number. Don’t share this code with anyone.
# The initial rollout of the recovery phone is only available to users with US and Canada mobile phone numbers.
# Voice over Internet Protocol (VoIP), is a technology that uses a broadband Internet connection instead of a regular (or analog) phone line to make calls.
# Phone mask services (for example Relay) provide a temporary virtual number to avoid providing a real phone number.
# Both VoIP and phone masks can be unreliable for one-time-passcode (OTP) verification
flow-setup-phone-submit-number-info-message-v2 = Recovery phone is only available in the United States and Canada. VoIP numbers and phone masks are not recommended.
flow-setup-phone-submit-number-legal = By providing your number, you agree to us storing it so we can text you for account verification only. Message and data rates may apply.
# cliking on the button sends a code by text message to the phone number typed in by the user
flow-setup-phone-submit-number-button = Send code

## HeaderLockup component, the header in account settings

header-menu-open = Close menu
header-menu-closed = Site navigation menu
header-back-to-top-link =
    .title = Back to top
header-back-to-settings-link =
    .title = Back to { -product-mozilla-account } settings
header-title-2 = { -product-mozilla-account }
header-help = Help

## Linked Accounts section

la-heading = Linked Accounts
la-description = You have authorised access to the following accounts.
la-unlink-button = Unlink
la-unlink-account-button = Unlink
la-set-password-button = Set Password
la-unlink-heading = Unlink from third party account
la-unlink-content-3 = Are you sure you want to unlink your account? Unlinking your account does not automatically sign you out of your Connected Services. To do that, you will need to manually sign out from the Connected Services section.
la-unlink-content-4 = Before unlinking your account, you must set a password. Without a password, there is no way for you to log in after unlinking your account.
nav-linked-accounts = { la-heading }

## Modal - Default values for a message directed at the user where the user can typically Confirm or Cancel.

modal-close-title = Close
modal-cancel-button = Cancel
modal-default-confirm-button = Confirm

## ModalMfaProtected

modal-mfa-protected-title = Enter confirmation code
modal-mfa-protected-subtitle = Help us make sure it’s you changing your account info
# This string is used to show a notification to the user for them to enter
# email confirmation code to update their multi-factor-authentication-protected
# account settings
# Variables:
#   email (String) - the user's email
#   expirationTime (Number) - the expiration time in minutes
modal-mfa-protected-instruction =
    { $expirationTime ->
        [one] Enter the code that was sent to <email>{ $email }</email> within { $expirationTime } minute.
       *[other] Enter the code that was sent to <email>{ $email }</email> within { $expirationTime } minutes.
    }
modal-mfa-protected-input-label = Enter 6-digit code
modal-mfa-protected-cancel-button = Cancel
modal-mfa-protected-confirm-button = Confirm
modal-mfa-protected-code-expired = Code expired?
# Link to resend a new code to the user's email.
modal-mfa-protected-resend-code-link = Email new code.

## Modal Verify Session

mvs-verify-your-email-2 = Confirm your email
mvs-enter-verification-code-2 = Enter your confirmation code
# This string is used to show a notification to the user for them to enter confirmation code to confirm their email.
# Variables:
#   email (String) - the user's email
mvs-enter-verification-code-desc-2 = Please enter the confirmation code that was sent to <email>{ $email }</email> within 5 minutes.
msv-cancel-button = Cancel
msv-submit-button-2 = Confirm

## Settings Nav

nav-settings = Settings
nav-profile = Profile
nav-security = Security
nav-connected-services = Connected Services
nav-data-collection = Data Collection and Use
nav-paid-subs = Paid Subscriptions
nav-email-comm = Email Communications

## Page2faChange

page-2fa-change-title = Change two-step authentication
page-2fa-change-success = Two-step authentication has been updated
page-2fa-change-success-additional-message = To protect all your connected devices, you should sign out everywhere you’re using this account, and then sign back in using your new two-step authentication.
page-2fa-change-totpinfo-error = There was an error replacing your two-step authentication app. Try again later.
page-2fa-change-qr-instruction = <strong>Step 1:</strong> Scan this QR code using any authenticator app, like Duo or Google Authenticator. This creates a new connection, any old connections won’t work anymore.

## Two Step Authentication - replace backup authentication code

# Page title
tfa-backup-codes-page-title = Backup authentication codes
# Error shown when API call fails while replacing existing backup codes
tfa-replace-code-error-3 = There was a problem replacing your backup authentication codes
# Error shown when API call fails while creating new backup codes (user had none)
tfa-create-code-error = There was a problem creating your backup authentication codes
# Success message shown in alert bar after successfully replacing existing backup codes
tfa-replace-code-success-alert-4 = Backup authentication codes updated
# Success message shown after creating backup codes for the first time
tfa-create-code-success-alert = Backup authentication codes created
# Custom messaging for users replacing existing backup codes - Download step (1 of 2)
# On this step, the codes are not yet replaced in the database - the old codes are still valid until step 2 is completed.
tfa-replace-code-download-description = Keep these in a place you’ll remember. Your old codes will be replaced after you finish the next step.
# Custom messaging for users replacing existing backup codes - Confirm step (2 of 2)
# Until this confirmation step is successfully completed, the old codes are still active and the new codes are not saved in the database.
tfa-replace-code-confirm-description = Confirm you saved your codes by entering one. Your old backup authentication codes will be disabled once this step is completed.
# Error shown when the entered backup code does not match any of the generated codes
tfa-incorrect-recovery-code-1 = Incorrect backup authentication code

## Page2faSetup

page-2fa-setup-title = Two-step authentication
page-2fa-setup-totpinfo-error = There was an error setting up two-step authentication. Try again later.
# code here refers to "backup authentication code"
page-2fa-setup-incorrect-backup-code-error = That code is not correct. Try again.
page-2fa-setup-success = Two-step authentication has been enabled
page-2fa-setup-success-additional-message = To protect all your connected devices, you should sign out everywhere you’re using this account, and then sign back in using two-step authentication.

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
avatar-page-cancel-button = Cancel
avatar-page-save-button = Save
avatar-page-saving-button = Saving…
avatar-page-zoom-out-button =
    .title = Zoom Out
avatar-page-zoom-in-button =
    .title = Zoom In
avatar-page-rotate-button =
    .title = Rotate
avatar-page-camera-error = Could not initialise camera
avatar-page-new-avatar =
    .alt = new profile picture
avatar-page-file-upload-error-3 = There was a problem uploading your profile picture
avatar-page-delete-error-3 = There was a problem deleting your profile picture
avatar-page-image-too-large-error-2 = The image file size is too large to be uploaded

## Password change page

pw-change-header =
    .title = Change Password
pw-8-chars = At least 8 characters
pw-not-email = Not your email address
pw-change-must-match = New password matches confirmation
pw-commonly-used = Not a commonly used password
# linkExternal is a link to a mozilla.org support article on password strength
pw-tips = Stay safe — don’t reuse passwords. See more tips to <linkExternal>create strong passwords</linkExternal>.
pw-change-cancel-button = Cancel
pw-change-save-button = Save
pw-change-forgot-password-link = Forgot password?
pw-change-current-password =
    .label = Enter current password
pw-change-new-password =
    .label = Enter new password
pw-change-confirm-password =
    .label = Confirm new password
pw-change-success-alert-2 = Password updated

## Password create page

pw-create-header =
    .title = Create password
pw-create-success-alert-2 = Password set
pw-create-error-2 = Sorry, there was a problem setting your password

## Delete account page

delete-account-header =
    .title = Delete Account
delete-account-step-1-2 = Step 1 of 2
delete-account-step-2-2 = Step 2 of 2
delete-account-confirm-title-4 = You may have connected your { -product-mozilla-account } to one or more of the following { -brand-mozilla } products or services that keep you secure and productive on the web:
delete-account-product-mozilla-account = { -product-mozilla-account }
delete-account-product-mozilla-vpn = { -product-mozilla-vpn }
delete-account-product-mdn-plus = { -product-mdn-plus }
delete-account-product-mozilla-hubs = { -product-mozilla-hubs }
delete-account-product-mozilla-monitor = { -product-mozilla-monitor }
delete-account-product-firefox-relay = { -product-firefox-relay }
delete-account-product-firefox-sync = Synchronising { -brand-firefox } data
delete-account-product-firefox-addons = { -brand-firefox } Add-ons
delete-account-acknowledge = Please acknowledge that by deleting your account:
delete-account-chk-box-1-v4 =
    .label = Any paid subscriptions you have will be cancelled
delete-account-chk-box-2 =
    .label = You may lose saved information and features within { -brand-mozilla } products
delete-account-chk-box-3 =
    .label = Reactivating with this email may not restore your saved information
delete-account-chk-box-4 =
    .label = Any extensions and themes that you published to addons.mozilla.org will be deleted
delete-account-continue-button = Continue
delete-account-password-input =
    .label = Enter password
delete-account-cancel-button = Cancel
delete-account-delete-button-2 = Delete

## Display name page

display-name-page-title =
    .title = Display name
display-name-input =
    .label = Enter display name
submit-display-name = Save
cancel-display-name = Cancel
display-name-update-error-2 = There was a problem updating your display name
display-name-success-alert-2 = Display name updated

## Recent account activity
## All strings except title indicate an event that occurred from the user's account
## These are displayed as a list with the date when the event occured

recent-activity-title = Recent account activity
recent-activity-account-create-v2 = Account created
recent-activity-account-disable-v2 = Account disabled
recent-activity-account-enable-v2 = Account enabled
recent-activity-account-login-v2 = Account login initiated
recent-activity-account-reset-v2 = Password reset initiated
# This string appears under recent account activity when there were email bounces associated with the account, but those were recently cleared (i.e. removed/deleted).
# An email bounce is when an email is sent to an email address and fails/receives a non-delivery receipt from the recipient's mail server.
recent-activity-emails-clearBounces-v2 = Email bounces cleared
recent-activity-account-login-failure = Account login attempt failed
recent-activity-account-two-factor-added = Two-step authentication enabled
recent-activity-account-two-factor-requested = Two-step authentication requested
recent-activity-account-two-factor-failure = Two-step authentication failed
recent-activity-account-two-factor-success = Two-step authentication successful
recent-activity-account-two-factor-removed = Two-step authentication removed
recent-activity-account-password-reset-requested = Account requested password reset
recent-activity-account-password-reset-success = Account password reset successful
recent-activity-account-recovery-key-added = Account recovery key enabled
recent-activity-account-recovery-key-verification-failure = Account recovery key verification failed
recent-activity-account-recovery-key-verification-success = Account recovery key verification successful
recent-activity-account-recovery-key-removed = Account recovery key removed
recent-activity-account-password-added = New password added
recent-activity-account-password-changed = Password changed
recent-activity-account-secondary-email-added = Secondary email address added
recent-activity-account-secondary-email-removed = Secondary email address removed
recent-activity-account-emails-swapped = Primary and secondary emails swapped
recent-activity-session-destroy = Logged out of session
recent-activity-account-recovery-phone-send-code = Recovery phone code sent
recent-activity-account-recovery-phone-setup-complete = Recovery phone setup completed
recent-activity-account-recovery-phone-signin-complete = Sign-in with recovery phone completed
recent-activity-account-recovery-phone-signin-failed = Sign-in with recovery phone failed
recent-activity-account-recovery-phone-removed = Recovery phone removed
recent-activity-account-recovery-codes-replaced = Recovery codes replaced
recent-activity-account-recovery-codes-created = Recovery codes created
recent-activity-account-recovery-codes-signin-complete = Sign-in with recovery codes completed
recent-activity-password-reset-otp-sent = Reset password confirmation code sent
recent-activity-password-reset-otp-verified = Reset password confirmation code verified
recent-activity-must-reset-password = Password reset required
# Security event was recorded, but the activity details are unknown or not shown to user
recent-activity-unknown = Other account activity

## PageRecoveryKeyCreate

# The page title displayed at the top of the flow container
recovery-key-create-page-title = Account Recovery Key
# Tooltip text and aria label for back arrow that takes users out of the account recovery key generation flow
# and back to account settings
recovery-key-create-back-button-title = Back to settings

## PageRecoveryPhoneRemove
## Users reach this page from account settings when they want to remove a backup phone number.

recovery-phone-remove-header = Remove recovery phone number
# Variables:
#   $formattedFullPhoneNumber (String) - the user's full phone number
settings-recovery-phone-remove-info = This will remove <strong>{ $formattedFullPhoneNumber }</strong> as your recovery phone.
settings-recovery-phone-remove-recommend = We recommend you keep this method because it’s easier than saving backup authentication codes.
# "Saved backup authentication codes" refers to previously saved backup authentication codes
settings-recovery-phone-remove-recovery-methods = If you delete it, make sure you still have your saved backup authentication codes. <linkExternal>Compare recovery methods</linkExternal>
settings-recovery-phone-remove-button = Remove phone number
settings-recovery-phone-remove-cancel = Cancel
settings-recovery-phone-remove-success = Recovery phone removed

## PageSetupRecoveryPhone

page-setup-recovery-phone-heading = Add recovery phone
page-change-recovery-phone = Change recovery phone
page-setup-recovery-phone-back-button-title = Back to settings
# Back arrow to return to step 1 of recovery phone setup flow
page-setup-recovery-phone-step2-back-button-title = Change phone number

## Add secondary email page

add-secondary-email-step-1 = Step 1 of 2
add-secondary-email-error-2 = There was a problem creating this email
add-secondary-email-page-title =
    .title = Secondary email
add-secondary-email-enter-address =
    .label = Enter email address
add-secondary-email-cancel-button = Cancel
add-secondary-email-save-button = Save
# This message is shown when a user tries to add a secondary email that is a
# Firefox Relay email mask (generated email address that can be used in place of
# your real email address)
add-secondary-email-mask = Email masks can’t be used as a secondary email

## Verify secondary email page

add-secondary-email-step-2 = Step 2 of 2
verify-secondary-email-page-title =
    .title = Secondary email
verify-secondary-email-verification-code-2 =
    .label = Enter your confirmation code
verify-secondary-email-cancel-button = Cancel
verify-secondary-email-verify-button-2 = Confirm
# This string is an instruction in a form.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
verify-secondary-email-please-enter-code-2 = Please enter the confirmation code that was sent to <strong>{ $email }</strong> within 5 minutes.
# This string is a confirmation message shown after verifying an email.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
verify-secondary-email-success-alert-2 = { $email } successfully added
verify-secondary-email-resend-code-button = Resend confirmation code

##

# Link to delete account on main Settings page
delete-account-link = Delete Account
# Success message displayed in alert bar after the user has successfully confirmed their account is not inactive.
inactive-update-status-success-alert = Signed in successfully. Your { -product-mozilla-account } and data will stay active.

## Product promotion

product-promo-monitor =
    .alt = { -product-mozilla-monitor }
product-promo-monitor-description-v2 = Find where your private info is exposed and take control
# Links out to the Monitor site
product-promo-monitor-cta = Get free scan

## Profile section

profile-heading = Profile
profile-picture =
    .header = Picture
profile-display-name =
    .header = Display name
profile-primary-email =
    .header = Primary email

## Progress bar

# This is the aria-label text for the progress bar. The progress bar is meant to visually show the user how much progress they have made through the steps of a given flow.
# Variables:
#   $currentStep (number) - the step which the user is currently on
#   $numberOfSteps (number) - the total number of steps in a given flow
progress-bar-aria-label-v2 = Step { $currentStep } of { $numberOfSteps }.

## Security section of Setting

security-heading = Security
security-password =
    .header = Password
# This is a string that shows when the user's password was created.
# Variables:
#   $date (String) - a localized date and time string
security-password-created-date = Created { $date }
security-not-set = Not Set
security-action-create = Create
security-set-password = Set a password to synchronise and use certain account security features.
# Link opens a list of recent account activity (e.g., login attempts, password changes, etc.)
security-recent-activity-link = View recent account activity
signout-sync-header = Session Expired
signout-sync-session-expired = Sorry, something went wrong. Please sign out from the browser menu and try again.

## SubRow component

tfa-row-backup-codes-title = Backup authentication codes
# Only shown for users that have 2FA enabled and verified, but all backup authentication codes have been consumed
# Users that have not enabled or verified 2FA will not see this
tfa-row-backup-codes-not-available = No codes available
# $numCodesRemaining - the number of backup authentication codes that have not yet been used (generally between 1 to 5)
# A different message is shown when no codes are available
tfa-row-backup-codes-available-v2 =
    { $numCodesAvailable ->
        [one] { $numCodesAvailable } code remaining
       *[other] { $numCodesAvailable } codes remaining
    }
# Shown to users who have backup authentication codes - this will allow them to generate new codes to replace the previous ones
tfa-row-backup-codes-get-new-cta-v2 = Create new codes
# Shown to users who have no backup authentication codes
# Button to add backup authentication codes when none are configured
tfa-row-backup-codes-add-cta = Add
# 'This' refers to 'backup authentication codes', used as a recovery method for two-step authentication
tfa-row-backup-codes-description-2 = This is the safest recovery method if you canʼt use your mobile device or authenticator app.
# Recovery phone is a recovery method for two-step authentication
# A recovery code can be sent to the user's phone
tfa-row-backup-phone-title-v2 = Recovery phone
# Shown with an alert icon to indicate that no recovery phone is configured
tfa-row-backup-phone-not-available-v2 = No phone number added
# button to change the configured recovery phone
tfa-row-backup-phone-change-cta = Change
# button to add/configure a recovery phone
tfa-row-backup-phone-add-cta = Add
# Button to remove a recovery phone from the user's account
tfa-row-backup-phone-delete-button = Remove
# Shown in tooltip on delete button or delete icon
tfa-row-backup-phone-delete-title-v2 = Remove recovery phone
tfa-row-backup-phone-delete-restriction-v2 = If you want to remove your recovery phone, add backup authentication codes or disable two-step authentication first to avoid getting locked out of your account.
# "this" refers to recovery phone
tfa-row-backup-phone-description-v2 = This is the easiest recovery method if you can't use your authenticator app.
# A SIM swap attack is a type of identity theft where an attacker tricks or bribes a mobile carrier
# into transferring a victim's phone number to their own SIM card, enabling access to accounts secured
# with SMS-based two-factor authentication.
tfa-row-backup-phone-sim-swap-risk-link = Learn about SIM swap risk

## Switch component

# Used as "title" attribute when the switch is "on" and interaction turns the switch to "off"
switch-turn-off = Turn off
# Used as "title" attribute when the switch is "off" and interaction turns the switch to "on"
switch-turn-on = Turn on
# Used as "title" attribute when switch has been interacted with and form is submitting
switch-submitting = Submitting…
switch-is-on = on
switch-is-off = off

## Sub-section row Defaults

row-defaults-action-add = Add
row-defaults-action-change = Change
row-defaults-action-disable = Disable
row-defaults-status = None

## Account recovery key sub-section on main Settings page

rk-header-1 = Account recovery key
rk-enabled = Enabled
rk-not-set = Not Set
rk-action-create = Create
# Button to delete the existing account recovery key and create a new one
rk-action-change-button = Change
rk-action-remove = Remove
rk-key-removed-2 = Account recovery key removed
rk-cannot-remove-key = Your account recovery key could not be removed.
rk-refresh-key-1 = Refresh account recovery key
rk-content-explain = Restore your information when you forget your password.
rk-cannot-verify-session-4 = Sorry, there was a problem confirming your session
rk-remove-modal-heading-1 = Remove account recovery key?
rk-remove-modal-content-1 =
    In the event you reset your password, you won’t be
    able to use your account recovery key to access your data. You can’t undo this action.
rk-remove-error-2 = Your account recovery key could not be removed
# Icon button to delete user's account recovery key. Text appears in tooltip on hover and as alt text for screen readers.
unit-row-recovery-key-delete-icon-button-title = Delete account recovery key

## Secondary email sub-section on main Settings page

se-heading = Secondary email
    .header = Secondary Email
se-cannot-refresh-email = Sorry, there was a problem refreshing that email.
se-cannot-resend-code-3 = Sorry, there was a problem re-sending the confirmation code
# This string is used in a notification message near the top of the page.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
se-set-primary-successful-2 = { $email } is now your primary email
se-set-primary-error-2 = Sorry, there was a problem changing your primary email
# This string is used in a notification message near the top of the page.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
se-delete-email-successful-2 = { $email } successfully deleted
se-delete-email-error-2 = Sorry, there was a problem deleting this email
se-verify-session-3 = You’ll need to confirm your current session to perform this action
se-verify-session-error-3 = Sorry, there was a problem confirming your session
# Button to remove the secondary email
se-remove-email =
    .title = Remove email
# Button to refresh secondary email status
se-refresh-email =
    .title = Refresh email
se-unverified-2 = unconfirmed
se-resend-code-2 =
    Confirmation needed. <button>Resend confirmation code</button>
    if it’s not in your inbox or spam folder.
# Button to make secondary email the primary
se-make-primary = Make primary
se-default-content = Access your account if you can’t log in to your primary email.
se-content-note-1 =
    Note: a secondary email won’t restore your information — you’ll
    need an <a>account recovery key</a> for that.
# Default value for the secondary email
se-secondary-email-none = None

## Two Step Auth sub-section on Settings main page

tfa-row-header = Two-step authentication
tfa-row-enabled = Enabled
tfa-row-disabled-status = Disabled
tfa-row-action-add = Add
tfa-row-action-disable = Disable
tfa-row-action-change = Change
tfa-row-button-refresh =
    .title = Refresh two-step authentication
tfa-row-cannot-refresh =
    Sorry, there was a problem refreshing two-step
    authentication.
tfa-row-enabled-description = Your account is protected by two-step authentication. You will need to enter a one-time passcode from your authentication app when logging into your { -product-mozilla-account }.
# "this" refers to two-step authentication
# Link goes to https://support.mozilla.org/kb/secure-mozilla-account-two-step-authentication
tfa-row-enabled-info-link = How this protects your account
tfa-row-disabled-description-v2 = Help secure your account by using a third-party authenticator app as a second step to sign in.
tfa-row-cannot-verify-session-4 = Sorry, there was a problem confirming your session
tfa-row-disable-modal-heading = Disable two-step authentication?
tfa-row-disable-modal-confirm = Disable
tfa-row-disable-modal-explain-1 =
    You won’t be able to undo this action. You also
    have the option of <linkExternal>replacing your backup authentication codes</linkExternal>.
# Shown in an alert bar after two-step authentication is disabled
tfa-row-disabled-2 = Two-step authentication disabled
tfa-row-cannot-disable-2 = Two-step authentication could not be disabled
tfa-row-verify-session-info = You need to confirm your current session to set up two-step authentication

## TermsPrivacyAgreement
## These terms are used in signin and signup for Firefox account

# This message is followed by a bulleted list
terms-privacy-agreement-intro-2 = By proceeding, you agree to the:
# link to Monitor's Terms of Service and Privacy Notice, part of a bulleted list
terms-privacy-agreement-monitor-3 = { -brand-mozilla } Subscription Services <mozSubscriptionTosLink>Terms of Service</mozSubscriptionTosLink> and <mozSubscriptionPrivacyLink>Privacy Notice</mozSubscriptionPrivacyLink>
# links to Mozilla Accounts Terms of Service and Privacy Notice, part of a bulleted list
terms-privacy-agreement-mozilla = { -product-mozilla-accounts(capitalization: "uppercase") } <mozillaAccountsTos>Terms of Service</mozillaAccountsTos> and <mozillaAccountsPrivacy>Privacy Notice</mozillaAccountsPrivacy>
# links to Mozilla Account's Terms of Service and Privacy Notice
terms-privacy-agreement-default-2 = By proceeding, you agree to the <mozillaAccountsTos>Terms of Service</mozillaAccountsTos> and <mozillaAccountsPrivacy>Privacy Notice</mozillaAccountsPrivacy>.

## ThirdPartyAuth component
## This is a component that is used to display a list of third party providers (Apple, Google, etc.)

# This appears when a user has the option to authenticate via third party accounts in addition to their Firefox account.
# Firefox account login appears on top, and third party options appear on bottom.
# This string appears as a separation between the two, in the following order: "Enter your password" "Or"(this string) (continue-with-google-button with aria equivalent text) / (continue-with-apple-button with aria equivalent text)
third-party-auth-options-or = or
# For the sign-in page, when 3rd-party auth is the only option, this string appears with a divider line between the user's avatar on top and 3rd-party authentication buttons (continue-with-google continue-with-apple buttons) on bottom.
# This could also be translated as "Sign in with the following" or "Sign in with the below".
third-party-auth-options-sign-in-with = Sign in with
continue-with-google-button = Continue with { -brand-google }
continue-with-apple-button = Continue with { -brand-apple }

## Auth-server based errors that originate from backend service

auth-error-102 = Unknown account
auth-error-103 = Incorrect password
auth-error-105-2 = Invalid confirmation code
auth-error-110 = Invalid token
# Error shown to users when they have attempted a request (e.g., requesting a password reset) too many times
# and their requests have been throttled, but the specific amount of time before they can retry is unknown.
auth-error-114-generic = You’ve tried too many times. Please try again later.
# This string is the amount of time required before a user can attempt another request.
# Variables:
#   $retryAfter (String) - Time required before retrying a request. The variable is localized by our
#                          formatting library (momentjs) as a "time from now" and automatically includes
#                          the prefix as required by the current locale (for example, "in 15 minutes", "dans 15 minutes").
auth-error-114 = You've tried too many times. Please try again { $retryAfter }.
auth-error-125 = The request was blocked for security reasons
auth-error-129-2 = You entered an invalid phone number. Please check it and try again.
auth-error-138-2 = Unconfirmed session
auth-error-139 = Secondary email must be different than your account email
# (Email) address has been added as a secondary email for another account and cannot be used to register a new account.
# The reservation may be temporary. If the reservation is not confirmed before the reservation expires (~10 min), the email will become available again.
auth-error-144 = This email is reserved by another account. Try again later or use a different email address.
auth-error-155 = TOTP token not found
# Error shown when the user submits an invalid backup authentication code
auth-error-156 = Backup authentication code not found
auth-error-159 = Invalid account recovery key
auth-error-183-2 = Invalid or expired confirmation code
auth-error-202 = Feature not enabled
auth-error-203 = System unavailable, try again soon
auth-error-206 = Can not create password, password already set
auth-error-214 = Recovery phone number already exists
auth-error-215 = Recovery phone number does not exist
auth-error-216 = Text message limit reached
auth-error-218 = Unable to remove recovery phone, missing backup authentication codes.
auth-error-219 = This phone number has been registered with too many accounts. Please try a different number.
auth-error-999 = Unexpected error
auth-error-1001 = Login attempt cancelled
auth-error-1002 = Session expired. Sign in to continue.
auth-error-1003 = Local storage or cookies are still disabled
auth-error-1008 = Your new password must be different
auth-error-1010 = Valid password required
auth-error-1011 = Valid email required
auth-error-1018 = Your confirmation email was just returned. Mistyped email?
auth-error-1020 = Mistyped email? firefox.com isn’t a valid email service
auth-error-1031 = You must enter your age to sign up
auth-error-1032 = You must enter a valid age to sign up
auth-error-1054 = Invalid two-step authentication code
auth-error-1056 = Invalid backup authentication code
auth-error-1062 = Invalid redirect
# Shown when a user tries to sign up with an email address with a domain that doesn't receive emails
auth-error-1064 = Mistyped email? { $domain } isn’t a valid email service
auth-error-1066 = Email masks can’t be used to create an account.
auth-error-1067 = Mistyped email?
# Displayed when we want to reference a user's previously set up recovery phone
# number, but they are not completely signed in yet. We'll only show the last 4 digits.
# Variables:
#  $lastFourPhoneNumber (Number) - The last 4 digits of the user's recovery phone number
recovery-phone-number-ending-digits = Number ending in { $lastFourPhoneNumber }
oauth-error-1000 = Something went wrong. Please close this tab and try again.

## Connect Another Device page

# A user will only see this header if they are signed in. The header will be preceded by a green checkmark (rtl/ltr sensitive)
connect-another-device-signed-in-header = You’re signed into { -brand-firefox }
# A "success" message visible to users who verified via email
connect-another-device-email-confirmed-banner = Email confirmed
# A "success" message visible to users who verified via sign-in
connect-another-device-signin-confirmed-banner = Sign-in confirmed
# A message prompts the user to sign in to this instance of the Firefox browser so as to complete device sync. This is followed by a link labeled "Sign in"
connect-another-device-signin-to-complete-message = Sign in to this { -brand-firefox } to complete setup
# A link for the user to sign in to the current Firefox browser, preceded by a message prompting the user to sign in so as to complete the device sync setup
connect-another-device-signin-link = Sign in
# A message prompting the user to sign in via a different device than the current one so as to complete the device-syncing process
connect-another-device-still-adding-devices-message = Still adding devices? Sign in to { -brand-firefox } on another device to complete setup
# A message prompting the user to sign in via a different device than the current one so as to complete the device-syncing process
connect-another-device-signin-another-device-to-complete-message = Sign in to { -brand-firefox } on another device to complete setup
# This message is a value-proposition prompting the user to sync another device so as to get tabs, bookmarks, and passwords shared between devices
connect-another-device-get-data-on-another-device-message = Want to get your tabs, bookmarks, and passwords on another device?
# This link leads the user back to the `/pair` page so as to connect another device
connect-another-device-cad-link = Connect another device
# This link cancels the process of connecting another device, and takes the user back to Account Settings
connect-another-device-not-now-link = Not now
# This is a message for Firefox Android users, prompting them to complete the process of connecting another device by signing into Firefox for Android
connect-another-device-android-complete-setup-message = Sign in to { -brand-firefox } for Android to complete setup
# This is a message for Firefox iOS users, prompting them to complete the process of connecting another device by signing into Firefox for iOS
connect-another-device-ios-complete-setup-message = Sign in to { -brand-firefox } for iOS to complete setup

## Cookies disabled page
## Users will see this page if they have local storage or cookies disabled.

cookies-disabled-header = Local storage and cookies are required
cookies-disabled-enable-prompt-2 = Please enable cookies and local storage in your browser to access your { -product-mozilla-account }. Doing so will enable functionality such as remembering you between sessions.
# A button users may click to check if cookies and local storage are enabled and be directed to the previous page if so.
cookies-disabled-button-try-again = Try again
# An external link going to: https://support.mozilla.org/kb/cookies-information-websites-store-on-your-computer
cookies-disabled-learn-more = Learn more

## Index / home page

index-header = Enter your email
index-sync-header = Continue to your { -product-mozilla-account }
index-sync-subheader = Synchronise your passwords, tabs, and bookmarks everywhere you use { -brand-firefox }.
index-relay-header = Create an email mask
index-relay-subheader = Please provide the email address where you’d like to forward emails from your masked email.
# $serviceName - the service (e.g., Pontoon) that the user is signing into with a Mozilla account
index-subheader-with-servicename = Continue to { $serviceName }
index-subheader-default = Continue to account settings
index-cta = Sign up or sign in
index-account-info = A { -product-mozilla-account } also unlocks access to more privacy-protecting products from { -brand-mozilla }.
index-email-input =
    .label = Enter your email
# When users delete their Mozilla account inside account Settings, they are redirected to this page with a success message
index-account-delete-success = Account deleted successfully
# Displayed when users try to sign up for an account and their confirmation code email bounces
index-email-bounced = Your confirmation email was just returned. Mistyped email?

## InlineRecoveryKeySetup page component

inline-recovery-key-setup-create-error = Oops! We couldn’t create your account recovery key. Please try again later.
inline-recovery-key-setup-recovery-created = Account recovery key created
inline-recovery-key-setup-download-header = Secure your account
inline-recovery-key-setup-download-subheader = Download and store it now
inline-recovery-key-setup-download-info = Store this key somewhere you’ll remember — you won’t be able to get back to this page later.
inline-recovery-key-setup-hint-header = Security recommendation

## InlineTotpSetup page
## TOTP (time-based one-time password) is a form of two-factor authentication (2FA).

inline-totp-setup-cancel-setup-button = Cancel setup
inline-totp-setup-continue-button = Continue
# <authenticationAppsLink> links to a list of security apps
inline-totp-setup-add-security-link = Add a layer of security to your account by requiring authentication codes from one of <authenticationAppsLink>these authentication apps</authenticationAppsLink>.
#  The <enable2StepDefaultSpan> elements are just visual separation here
inline-totp-setup-enable-two-step-authentication-default-header-2 = Enable two-step authentication <span>to continue to account settings</span>
# { $serviceName } is the name of the service which the user wants to authenticate to. The <enable2StepCustomServiceSpan> elements are just visual separation
inline-totp-setup-enable-two-step-authentication-custom-header-2 = Enable two-step authentication <span>to continue to { $serviceName }</span>
inline-totp-setup-ready-button = Ready
# The authentication code a user is scanning is a QR code.
# { $serviceName } is the name of the service which the user wants to authenticate to. The <scanAuthCodeHeaderSpan> elements are just visual separation
inline-totp-setup-show-qr-custom-service-header-2 = Scan authentication code <span>to continue to { $serviceName }</span>
# { $serviceName } is the name of the service which the user wants to authenticate to. The <enterCodeManuallyHeaderSpan> elements are just visual separation
inline-totp-setup-no-qr-custom-service-header-2 = Enter code manually <span>to continue to { $serviceName }</span>
# The authentication code a user is scanning is a QR code.
# The <scanAuthHeaderSpan> elements are just visual separation
inline-totp-setup-show-qr-default-service-header-2 = Scan authentication code <span>to continue to account settings</span>
# The <enterCodeManuallyHeaderSpan> elements are just visual separation
inline-totp-setup-no-qr-default-service-header-2 = Enter code manually <span>to continue to account settings</span>
# The <toggleToQRButton> allows the user to use a QR code instead of manually entering a secret key
inline-totp-setup-enter-key-or-use-qr-instructions = Type this secret key into your authentication app. <toggleToQRButton>Scan QR code instead?</toggleToQRButton>
# The <toggleToManualModeButton> allows the user to manually enter a secret key instead of scanning a QR code
inline-totp-setup-use-qr-or-enter-key-instructions = Scan the QR code in your authentication app and then enter the authentication code it provides. <toggleToManualModeButton>Can’t scan code?</toggleToManualModeButton>
# The "authentication code" here refers to the code provided by an authentication app.
inline-totp-setup-on-completion-description = Once complete, it will begin generating authentication codes for you to enter.
# The "authentication code" here refers to the code provided by an authentication app.
inline-totp-setup-security-code-placeholder = Authentication code
# The "authentication code" here refers to the code provided by an authentication app.
inline-totp-setup-code-required-error = Authentication code required
tfa-qr-code-alt = Use the code { $code } to set up two-step authentication in supported applications.
inline-totp-setup-page-title = Two-step authentication

## Legal page. This page contains simply a header and links to pages that display
## content from https://github.com/mozilla/legal-docs

legal-header = Legal
# Links to our internal "Firefox Cloud" /legal/terms page
legal-terms-of-service-link = Terms of Service
# Links to our internal "Firefox Cloud" /legal/terms page
legal-privacy-link = Privacy Notice

## Legal privacy notice page. Most content comes from https://github.com/mozilla/legal-docs

legal-privacy-heading = Privacy Notice

## Legal terms of service page. Most content comes from https://github.com/mozilla/legal-docs

legal-terms-heading = Terms of Service

## AuthAllow page - Part of the device pairing flow

pair-auth-allow-heading-text = Did you just sign in to { -product-firefox }?
# Submit button to confirm that the user initiated the device pairing
# and that they approve of the new device being added to their account
pair-auth-allow-confirm-button = Yes, approve device
# "If this wasn't you" means "If it wasn't you that just signed in to Firefox"
# The text with the <link> tags links to a `reset password` page
pair-auth-allow-refuse-device-link = If this wasn’t you, <link>change your password</link>

## PairAuthComplete page - part of the device pairing flow

# Heading to confirm the successful pairing of a new device with the user's account
# Device here is non specific (could be a laptop, tablet, phone, etc.)
pair-auth-complete-heading = Device connected
# Variable { $deviceFamily } is generally a browser name, for example "Firefox"
# Variable { $deviceOS } is an operating system short name, for example "iOS", "Android"
pair-auth-complete-now-syncing-device-text = You are now synchronising with: { $deviceFamily } on { $deviceOS }
pair-auth-complete-sync-benefits-text = Now you can access your open tabs, passwords, and bookmarks on all your devices.
pair-auth-complete-see-tabs-button = See tabs from synchronised devices
pair-auth-complete-manage-devices-link = Manage devices

## AuthTotp page
## TOTP (time-based one-time password) is a form of two-factor authentication (2FA).
## Users that have set up two-factor authentication land on this page during device pairing.

# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "to continue to account settings" can stand alone as "Continue to account settings"
auth-totp-heading-w-default-service = Enter authentication code <span>to continue to account settings</span>
# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "to continue to { $serviceName }" can stand alone as "Continue to { $serviceName }"
# { $serviceName } represents a product name (e.g., Mozilla VPN) that will be passed in as a variable
auth-totp-heading-w-custom-service = Enter authentication code <span>to continue to { $serviceName }</span>
auth-totp-instruction = Open your authentication app and enter the authentication code it provides.
auth-totp-input-label = Enter 6-digit code
# Form button to confirm if the authentication code entered by the user is valid
auth-totp-confirm-button = Confirm
# Error displayed in a tooltip when the form is submitted without a code
auth-totp-code-required-error = Authentication code required

## WaitForSupp page - Part of the devide pairing flow
## Users see this page when they have started to pair a second (or more) device to their account
## The pairing must be approved from both devices to succeed

# The "other device" is non-specific and could be a desktop computer, laptop, tablet, mobile phone, etc.
# Strings within the <span> elements appear as a subheading.
pair-wait-for-supp-heading-text = Approval now required <span>from your other device</span>

## PairFailure - a view which displays on failure of the device pairing process

pair-failure-header = Pairing not successful
pair-failure-message = The setup process was terminated.

## Pair index page

pair-sync-header = Synchronise { -brand-firefox } on your phone or tablet
pair-cad-header = Connect { -brand-firefox } on another device
pair-already-have-firefox-paragraph = Already have { -brand-firefox } on a phone or tablet?
# Clicking this button initiates the pairing process, usually by directing the user to the `about:preferences` page in Firefox
pair-sync-your-device-button = Synchronise your device
# This is a heading element immediately preceded by "Sync your device" and followed by a link and QR code to download Firefox
pair-or-download-subheader = Or download
# Directs user to scan a QR code to download Firefox. <linkExternal> is an anchor tag that directs the user to where they can download the { -brand-firefox } app
pair-scan-to-download-message = Scan to download { -brand-firefox } for mobile, or send yourself a <linkExternal>download link</linkExternal>.
# This allows the user to exit the sync/pair flow, and redirects them back to Settings
pair-not-now-button = Not now
pair-take-your-data-message = Take your tabs, bookmarks, and passwords anywhere you use { -brand-firefox }.
# This initiates the pairing process, usually by directing the user to the `about:preferences` page in Firefox
pair-get-started-button = Get started
# This is the aria label on the QR code image
pair-qr-code-aria-label = QR code

## PairSuccess - a view which displays  on successful completion of the device pairing process

pair-success-header-2 = Device connected
pair-success-message-2 = Pairing was successful.

## SuppAllow page - Part of the device pairing flow
## Users see this page when they have started to pair a second (or more) device to their account
## The pairing must be confirmed from both devices to succeed

# Strings within the <span> elements appear as a subheading.
# Variable $email is the user's email address
pair-supp-allow-heading-text = Confirm pairing <span>for { $email }</span>
pair-supp-allow-confirm-button = Confirm pairing
pair-supp-allow-cancel-link = Cancel

## WaitForAuth page - Part of the devide pairing flow
## Users see this page when they have started to pair a second (or more) device to their account
## The pairing must be approved from both devices to succeed

# The "other device" is non-specific and could be a desktop computer, laptop, tablet, mobile phone, etc.
# Strings within the <span> elements appear as a subheading.
pair-wait-for-auth-heading-text = Approval now required <span>from your other device</span>

## PairUnsupported - a view which is shown when the user tries to scan the pairing QR code any way other than through a Firefox app

pair-unsupported-header = Pair using an app
pair-unsupported-message = Did you use the system camera? You must pair from within a { -brand-firefox } app.

## SetPassword page
## Third party auth users that do not have a password set yet are prompted for a


# password to complete their sign-in when they want to login to a service requiring it.

set-password-heading-v2 = Create password to synchronise
# "This" refers to the heading, "Create password to sync"
set-password-info-v2 = This encrypts your data. It needs to be different from your { -brand-google } or { -brand-apple } account password.

## ThirdPartyAuthCallback Page
## This page is called after a user completes the third party authentication flow from Google or Apple.

third-party-auth-callback-message = Please wait, you are being redirected to the authorised application.

## AccountRecoveryConfirmKey page

account-recovery-confirm-key-heading = Enter your account recovery key
account-recovery-confirm-key-instruction = This key recovers your encrypted browsing data, such as passwords and bookmarks, from { -brand-firefox } servers.
# Prompts the user to enter their account recovery key
# Account recovery key contains a mix of letters and numbers, no special characters
account-recovery-confirm-key-input-label =
    .label = Enter your 32-character account recovery key
# When setting up an account recovery key, users have the option of storing an account recovery key hint that is shown during password reset
account-recovery-confirm-key-hint = Your storage hint is:
# Clicking this button checks if the recovery key provided by the user is correct and associated with their account
account-recovery-confirm-key-button-2 = Continue
# Link that leads to the password reset page (without recovery code)
account-recovery-lost-recovery-key-link-2 = Can’t find your account recovery key?

## CompleteResetPassword component
## User followed a password reset link and is now prompted to create a new password

complete-reset-pw-header-v2 = Create a new password
# A new password was successfully set for the user's account
# Displayed in an alert bar
complete-reset-password-success-alert = Password set
# An error occurred while attempting to set a new password (password reset flow)
# Displayed in an alert bar
complete-reset-password-error-alert = Sorry, there was a problem setting your password
# Link to go back and use an account recovery key before resetting the password
complete-reset-pw-recovery-key-link = Use account recovery key
# A message informing the user that the password reset was successful and reminding them to create another recovery key
# Displayed on the sign in page
reset-password-complete-banner-heading = Your password has been reset.
reset-password-complete-banner-message = Don’t forget to generate a new account recovery key from your { -product-mozilla-account } settings to prevent future sign-in issues.
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
complete-reset-password-desktop-relay = { -brand-firefox } will try sending you back to use an email mask after you sign in.

# ConfirmBackupCodeResetPassword page

confirm-backup-code-reset-password-input-label = Enter 10-character code
confirm-backup-code-reset-password-confirm-button = Confirm
confirm-backup-code-reset-password-subheader = Enter backup authentication code
confirm-backup-code-reset-password-instruction = Enter one of the one-time-use codes you saved when you set up two-step authentication.
# Link out to support article: https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication
confirm-backup-code-reset-password-locked-out-link = Are you locked out?

## Confirm Reset Password With Code

confirm-reset-password-with-code-heading = Check your email
# Text within span appears in bold
# $email - email address for which a password reset was requested
confirm-reset-password-with-code-instruction = We sent a confirmation code to <span>{ $email }</span>.
# Shown above a group of 8 single-digit input boxes
# Only numbers allowed
confirm-reset-password-code-input-group-label = Enter 8-digit code within 10 minutes
# Clicking the button submits and verifies the code
# If succesful, continues to the next step of the password reset
confirm-reset-password-otp-submit-button = Continue
# Button to request a new reset password confirmation code
confirm-reset-password-otp-resend-code-button = Resend code
# Link to cancel the password reset and sign in with a different account
confirm-reset-password-otp-different-account-link = Use a different account

## PasswordResetConfirmTotp Page

confirm-totp-reset-password-header = Reset your password
confirm-totp-reset-password-subheader-v2 = Enter two-step authentication code
confirm-totp-reset-password-instruction-v2 = Check your <strong>authenticator app</strong> to reset your password.
confirm-totp-reset-password-trouble-code = Trouble entering code?
confirm-totp-reset-password-confirm-button = Confirm
confirm-totp-reset-password-input-label-v2 = Enter 6-digit code
confirm-totp-reset-password-use-different-account = Use a different account

## ResetPassword start page

password-reset-flow-heading = Reset your password
password-reset-body-2 =
    We’ll ask for a couple of things only you know to keep your account
    safe.
password-reset-email-input =
    .label = Enter your email
password-reset-submit-button-2 = Continue

## ResetPasswordConfirmed

reset-password-complete-header = Your password has been reset
# $serviceName is a product name such as Monitor, Relay
reset-password-confirmed-cta = Continue to { $serviceName }

## Reset password recovery method page
## This page is shown to users when they are having trouble resetting their


# password, and they previously had set up an account recovery method.

password-reset-recovery-method-header = Reset your password
password-reset-recovery-method-subheader = Choose a recovery method
# This is displayed to the user when they are choosing an alternative method to authenticate themself in the password reset process when they do not have access to their two-factor authenticator application
password-reset-recovery-method-details = Let’s make sure it’s you using your recovery methods.
password-reset-recovery-method-phone = Recovery phone
password-reset-recovery-method-code = Backup authentication codes
# Variable: $numBackupCodes (String) - The number of backup authentication codes the user has left, e.g., 4
password-reset-recovery-method-code-info =
    { $numBackupCodes ->
        [one] { $numBackupCodes } code remaining
       *[other] { $numBackupCodes } codes remaining
    }
# Shown when a backend service fails and a code cannot be sent to the user's recovery phone.
password-reset-recovery-method-send-code-error-heading = There was a problem sending a code to your recovery phone
password-reset-recovery-method-send-code-error-description = Please try again later or use your backup authentication codes.

## ResetPasswordRecoveryPhone page

reset-password-recovery-phone-flow-heading = Reset your password
# A recovery code in context of this page is a one time code sent to the user's phone
reset-password-recovery-phone-heading = Enter recovery code
# Text that explains the user should check their phone for a recovery code
# $maskedPhoneNumber - The users masked phone number
reset-password-recovery-phone-instruction-v3 = A 6-digit code was sent to the phone number ending in <span>{ $lastFourPhoneDigits }</span> by text message. This code expires after 5 minutes. Donʼt share this code with anyone.
reset-password-recovery-phone-input-label = Enter 6-digit code
reset-password-recovery-phone-code-submit-button = Confirm
reset-password-recovery-phone-resend-code-button = Resend code
reset-password-recovery-phone-resend-success = Code sent
# links to https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication
reset-password-recovery-phone-locked-out-link = Are you locked out?
reset-password-recovery-phone-send-code-error-heading = There was a problem sending a code
reset-password-recovery-phone-code-verification-error-heading = There was a problem verifying your code
# Follows the error message (e.g, "There was a problem sending a code")
reset-password-recovery-phone-general-error-description = Please try again later.
reset-password-recovery-phone-invalid-code-error-description = The code is invalid or expired.
reset-password-recovery-phone-invalid-code-error-link = Use backup authentication codes instead?
reset-password-with-recovery-key-verified-page-title = Password reset successful
reset-password-complete-new-password-saved = New password saved!
reset-password-complete-recovery-key-created = New account recovery key created. Download and store it now.
reset-password-complete-recovery-key-download-info =
    This key is essential for
    data recovery if you forget your password. <b>Download and store it securely
    now, as you won’t be able to access this page again later.</b>

## CompleteSignin component

# This is a label that precedes any error which could arise from trying to validate the user's signin
error-label = Error:
# This is a message that is shown to users along with a "Loading" spinner while the site tries to check their signin
validating-signin = Validating sign-in…
# Shown above an error banner (e.g., invalid confirmation code, unexpected error)
complete-signin-error-header = Confirmation error
# The user followed a signin confirmation link, but that link is expired and no longer valid
signin-link-expired-header = Confirmation link expired
signin-link-expired-message-2 = The link you clicked has expired or has already been used.

## Signin page

# Strings within the <span> elements appear as a subheading.
signin-password-needed-header-2 = Enter your password <span>for your { -product-mozilla-account }</span>
# $serviceName - the name of the service which the user authenticating for
# For languages structured like English, the phrase can read "to continue to { $serviceName }"
signin-subheader-without-logo-with-servicename = Continue to { $serviceName }
signin-subheader-without-logo-default = Continue to account settings
signin-button = Sign in
signin-header = Sign in
signin-use-a-different-account-link = Use a different account
signin-forgot-password-link = Forgot password?
signin-password-button-label = Password
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-desktop-relay = { -brand-firefox } will try sending you back to use an email mask after you sign in.
signin-code-expired-error = Code expired. Please sign in again.
signin-account-locked-banner-heading = Reset your password
signin-account-locked-banner-description = We locked your account to keep it safe from suspicious activity.
# This link points to https://accounts.firefox.com/reset_password
signin-account-locked-banner-link = Reset your password to sign in

## ReportSignin Page
## When users receive an "Is this you signing in?" email with an unblock code,
## they can click "report it to us" if they did not attempt to sign in.
## This will be the page shown to users to block the sign in and report it.

report-signin-link-damaged-body = The link you clicked was missing characters, and may have been broken by your email client. Copy the address carefully, and try again.
report-signin-header = Report unauthorised sign-in?
report-signin-body = You received an email about attempted access to your account. Would you like to report this activity as suspicious?
report-signin-submit-button = Report activity
report-signin-support-link = Why is this happening?
report-signin-error = Sorry, there was a problem submitting the report.
signin-bounced-header = Sorry. We’ve locked your account.
# $email (string) - The user's email.
signin-bounced-message = The confirmation email we sent to { $email } was returned and we’ve locked your account to protect your { -brand-firefox } data.
# linkExternal is button which logs the user's action and navigates them to mozilla support
signin-bounced-help = If this is a valid email address, <linkExternal>let us know</linkExternal> and we can help unlock your account.
signin-bounced-create-new-account = No longer own that email? Create a new account
back = Back

## SigninPushCode page
## This page is used to send a push notification to the user's device for two-factor authentication (2FA).

signin-push-code-heading-w-default-service = Verify this login <span>to continue to account settings</span>
signin-push-code-heading-w-custom-service = Verify this login <span>to continue to { $serviceName }</span>
signin-push-code-instruction = Please check your other devices and approve this login from your { -brand-firefox } browser.
signin-push-code-did-not-recieve = Didn’t receive the notification?
signin-push-code-send-email-link = Email code

## SigninPushCodeConfirmPage

signin-push-code-confirm-instruction = Confirm your login
signin-push-code-confirm-description = We detected a login attempt from the following device. If this was you, please approve the login
signin-push-code-confirm-verifying = Verifying
signin-push-code-confirm-login = Confirm login
signin-push-code-confirm-wasnt-me = This wasn’t me, change password.
signin-push-code-confirm-login-approved = Your login has been approved. Please close this window.
signin-push-code-confirm-link-error = Link is damaged. Please try again.

## Signin recovery method page
## This page is shown to users when they are having trouble signing in with
## their password, and they previously had set up an account recovery method.

signin-recovery-method-header = Sign in
signin-recovery-method-subheader = Choose a recovery method
signin-recovery-method-details = Let’s make sure it’s you using your recovery methods.
signin-recovery-method-phone = Recovery phone
signin-recovery-method-code-v2 = Backup authentication codes
# Variable: $numBackupCodes (String) - The number of backup authentication codes the user has left, e.g., 4
signin-recovery-method-code-info-v2 =
    { $numBackupCodes ->
        [one] { $numBackupCodes } code remaining
       *[other] { $numBackupCodes } codes remaining
    }
# Shown when a backend service fails and a code cannot be sent to the user's recovery phone.
signin-recovery-method-send-code-error-heading = There was a problem sending a code to your recovery phone
signin-recovery-method-send-code-error-description = Please try again later or use your backup authentication codes.

## SigninRecoveryCode page
## Users are prompted to enter a backup authentication code
## (provided to the user when they first set up two-step authentication)
## when they are unable to sign in with two-step authentication (e.g., Authy, Duo, etc.)

signin-recovery-code-heading = Sign in
signin-recovery-code-sub-heading = Enter backup authentication code
# codes here refers to backup authentication codes
signin-recovery-code-instruction-v3 = Enter one of the one-time-use codes you saved when you set up two-step authentication.
# code here refers to backup authentication code
signin-recovery-code-input-label-v2 = Enter 10-character code
# Form button to confirm if the backup authentication code entered by the user is valid
signin-recovery-code-confirm-button = Confirm
# Link to go to the page to use recovery phone instead
signin-recovery-code-phone-link = Use recovery phone
# External link for support if the user can't use two-step autentication or a backup authentication code
# https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication
signin-recovery-code-support-link = Are you locked out?
# Error displayed in a tooltip when form is submitted witout a code
signin-recovery-code-required-error = Backup authentication code required
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-recovery-code-use-phone-failure = There was a problem sending a code to your recovery phone
signin-recovery-code-use-phone-failure-description = Please try again later.

## SigninRecoveryPhone page

signin-recovery-phone-flow-heading = Sign in
# A recovery code in context of this page is a one time code sent to the user's phone
signin-recovery-phone-heading = Enter recovery code
# Text that explains the user should check their phone for a recovery code
# $maskedPhoneNumber - The users masked phone number
signin-recovery-phone-instruction-v3 = A 6-digit code was sent to the phone number ending in <span>{ $lastFourPhoneDigits }</span> by text message. This code expires after 5 minutes. Donʼt share this code with anyone.
signin-recovery-phone-input-label = Enter 6-digit code
signin-recovery-phone-code-submit-button = Confirm
signin-recovery-phone-resend-code-button = Resend code
signin-recovery-phone-resend-success = Code sent
# links to https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication
signin-recovery-phone-locked-out-link = Are you locked out?
signin-recovery-phone-send-code-error-heading = There was a problem sending a code
signin-recovery-phone-code-verification-error-heading = There was a problem verifying your code
# Follows the error message (e.g, "There was a problem sending a code")
signin-recovery-phone-general-error-description = Please try again later.
signin-recovery-phone-invalid-code-error-description = The code is invalid or expired.
signin-recovery-phone-invalid-code-error-link = Use backup authentication codes instead?
# "Limits" refers to potential restrictions on how often a recovery phone number can be used for signing in within a given time period.
# If limits are reached, users may have to use an alternate two-step authentication method or wait until the restriction period is over.
signin-recovery-phone-success-message = Signed in successfully. Limits may apply if you use your recovery phone again.

## Signin reported page: this page is shown when a user receives an email notifying them of a new account signin, and the user clicks a button indicating that the signin was not them so that we know it was someone trying to break into their account.

signin-reported-header = Thank you for your vigilance
signin-reported-message = Our team has been notified. Reports like this help us fend off intruders.

## SigninTokenCode page
## Users see this page during the signin process. In this instance, the confirmation code is
## a 6-digit code that is sent to the user's email address.

# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "for your { -product-mozilla-account }"
# can stand alone as "{ -product-mozilla-account }"
signin-token-code-heading-2 = Enter confirmation code<span> for your { -product-mozilla-account }</span>
# { $email } represents the email that the user entered to sign in
signin-token-code-instruction-v2 = Enter the code that was sent to <email>{ $email }</email> within 5 minutes.
signin-token-code-input-label-v2 = Enter 6-digit code
# Form button to confirm if the confirmation code entered by the user is valid
signin-token-code-confirm-button = Confirm
signin-token-code-code-expired = Code expired?
# Link to resend a new code to the user's email.
signin-token-code-resend-code-link = Email new code.
# Error displayed in a tooltip when the form is submitted without a code
signin-token-code-required-error = Confirmation code required
signin-token-code-resend-error = Something went wrong. A new code could not be sent.
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-token-code-instruction-desktop-relay = { -brand-firefox } will try sending you back to use an email mask after you sign in.

## SigninTOTPCode page
## TOTP (time-based one-time password) is a form of two-factor authentication (2FA).
## Users that have set up two-factor authentication land on this page during sign-in.

signin-totp-code-header = Sign in
signin-totp-code-subheader-v2 = Enter two-step authentication code
signin-totp-code-instruction-v4 = Check your <strong>authenticator app</strong> to confirm your sign-in.
signin-totp-code-input-label-v4 = Enter 6-digit code
# Shown to users when they need to re-enter their authentication code, for their current device
signin-totp-code-aal-banner-header = Why are you being asked to authenticate?
signin-totp-code-aal-banner-content = You set up two-step authentication on your account, but haven’t signed in with a code on this device yet.
signin-totp-code-aal-sign-out = Sign out on this device
signin-totp-code-aal-sign-out-error = Sorry, there was a problem signing you out
# Form button to confirm if the authentication code entered by the user is valid
signin-totp-code-confirm-button = Confirm
signin-totp-code-other-account-link = Use a different account
signin-totp-code-recovery-code-link = Trouble entering code?
# Error displayed in a tooltip when the form is submitted without a code
signin-totp-code-required-error = Authentication code required
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-totp-code-desktop-relay = { -brand-firefox } will try sending you back to use an email mask after you sign in.

## Signin Unblock Page
## Page shown when signin has been blocked by rate limiting (too many requests)

signin-unblock-header = Authorise this sign-in
# Where $email is the email address entered for the sign-in attempt
signin-unblock-body = Check your email for the authorisation code sent to { $email }.
signin-unblock-code-input = Enter authorisation code
signin-unblock-submit-button = Continue
# Shown when the user attempts to submit the form without including a code
signin-unblock-code-required-error = Authorisation code required
signin-unblock-code-incorrect-length = Authorisation code must contain 8 characters
signin-unblock-code-incorrect-format-2 = Authorisation code can only contain letters and/or numbers
signin-unblock-resend-code-button = Not in inbox or spam folder? Resend
signin-unblock-support-link = Why is this happening?
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-unblock-desktop-relay = { -brand-firefox } will try sending you back to use an email mask after you sign in.

## ConfirmSignupCode page
## Users see this page after they have initiated account sign up,


# and a confirmation code has been sent to their email address.

# Page title show in browser title bar or page tab
confirm-signup-code-page-title = Enter confirmation code
# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "for your { -product-mozilla-account }"
# can stand alone as "{ -product-mozilla-account }"
confirm-signup-code-heading-2 = Enter confirmation code <span>for your { -product-mozilla-account }</span>
# { $email } represents the email that the user entered to sign in
confirm-signup-code-instruction-v2 = Enter the code that was sent to <email>{ $email }</email> within 5 minutes.
confirm-signup-code-input-label = Enter 6-digit code
# Form button to confirm if the confirmation code entered by the user is valid
confirm-signup-code-confirm-button = Confirm
confirm-signup-code-sync-button = Start synchronising
confirm-signup-code-code-expired = Code expired?
# Link to resend a new code to the user's email.
confirm-signup-code-resend-code-link = Email new code.
confirm-signup-code-success-alert = Account confirmed successfully
# Error displayed in tooltip.
confirm-signup-code-is-required-error = Confirmation code is required
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
confirm-signup-code-desktop-relay = { -brand-firefox } will try sending you back to use an email mask after you sign in.

## Account Signup page
## This is the second page of the sign up flow, users have already entered their email

signup-heading-v2 = Create a password
signup-relay-info = A password is needed to securely manage your masked emails and access { -brand-mozilla }’s security tools.
signup-sync-info = Synchronise your passwords, bookmarks and more everywhere you use { -brand-firefox }.
signup-sync-info-with-payment = Synchronise your passwords, bookmarks and more everywhere you use { -brand-firefox }.
# Clicking on this link returns the user to the beginning of the flow so they can enter a new email address
signup-change-email-link = Change email

## SignupConfirmedSync page
## Shown to users when they finish confirming their account through Sync

signup-confirmed-sync-header = Synchronisation is turned on
signup-confirmed-sync-success-banner = { -product-mozilla-account } confirmed
signup-confirmed-sync-button = Start browsing
# Shown when payment methods are also synced
signup-confirmed-sync-description-with-payment-v2 = Your passwords, payment methods, addresses, bookmarks, history and more can synchronise everywhere you use { -brand-firefox }.
signup-confirmed-sync-description-v2 = Your passwords, addresses, bookmarks, history and more can synchronise everywhere you use { -brand-firefox }.
signup-confirmed-sync-add-device-link = Add another device
signup-confirmed-sync-manage-sync-button = Manage synchronisation
signup-confirmed-sync-set-password-success-banner = Synchronisation password created
