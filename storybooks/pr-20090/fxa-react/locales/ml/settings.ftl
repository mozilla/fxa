# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.


## Banner component

resend-code-success-banner-heading = താങ്ങളുടെ ഇതപാലിലേക്കൊരു പുതിയ സൂചിക അയച്ചിട്ടുണ്ടു്
resend-link-success-banner-heading = താങ്ങളുടെ ഇതപാലിലേക്കൊരു പുതിയ കണ്ണി അയച്ചിട്ടുണ്ടു്
# $accountsEmail is the Mozilla accounts sender email address (e.g. accounts@firefox.com)
resend-success-banner-description = തടസ്സമില്ലാത്ത വിതരണത്തിനു് { $accountsEmail }-നെ താങ്ങളുടെ വിളിപ്പട്ടികയിലോട്ടു് ചേൎക്കുക

## Brand Messaging component
## Used to show in product messaging about upcoming brand changes

# This aria-label applies to the dismiss/close button of the banner
# This text is for screen-readers
brand-banner-dismiss-button-2 =
    .aria-label = പടക്കൊടി അടയ്ക്കുക
# This message is displayed as the title element in the banner, prior to actually launching the new brand
brand-prelaunch-title = നവമ്പർ ഒന്നാംതീയതിക്കു് { -product-firefox-accounts }-ന്റെ പേരു് { -product-mozilla-accounts }-ആയി തീരും.
# This message is displayed as sub title element in the banner, giving a it more context about the brand changes.
brand-prelaunch-subtitle = താങ്ങൾ അതേ ഒളിവാക്കും ഉപയോക്തൃപ്പേരുകൊണ്ടു് പ്രവേശിക്കും, താങ്ങളൾ ഉപയോഗിക്കുന്ന ഉൽപ്പന്നങ്ങളിൽ ഒരു മാറ്റാവുമുണ്ടാവത്തില്ല.
# This is an extra link element, that directs users to a page where they can learn more about the branding changes.
brand-learn-more = കൂടുതല്‍ അറിയുക
# Alt text for close banner image
brand-close-banner =
    .alt = പടക്കൊടി അടയ്ക്കുക
# Alt text for 'm' logo in banner header
brand-m-logo =
    .alt = { -brand-mozilla } m അടയാളം

## ButtonBack component
## Allows users to click a back arrow to navigate to the previous page

button-back-aria-label = പുറകോട്ടു്
button-back-title = പുറകോട്ടു്

## ButtonDownloadRecoveryKeyPDF
## Clicking on this button downloads a PDF file that contains the user's account recovery key
## The account recovery key can be used to recover data when users forget their account password

# Button to download the account recovery key as a PDF file and navigate to the next step
# The next (and final) step is an optional prompt to save a storage hint
# .title will displayed as a tooltip on the button
recovery-key-download-button-v3 = കരുതിവച്ചിട്ടു് തുടരുക
    .title = കരുതിവച്ചിട്ടു് തുടരുക
recovery-key-pdf-heading = അക്കൌണ്ടു് വീണ്ടെടുപ്പു് സങ്കേതം
# Date when the account recovery key was created and this file was downloaded
# { $date }: formatted date with 'medium' dateStyle format (e.g., for 'en': Jul 31, 2023)
recovery-key-pdf-download-date = ഉണ്ടാക്കിയതു്: { $date }
# Shown directly above recovery key value and preceeded by a key icon
recovery-key-pdf-key-legend = അക്കൌണ്ടു് വീണ്ടെടുപ്പു് സങ്കേതം
# This heading is shown above a list of options for storing the account recovery key
# "key" here refers to "account recovery key"
recovery-key-pdf-storage-ideas-heading = താക്കോൽ സൂക്ഷിച്ചു് വയ്ക്കാനാവുന്ന ഇടങ്ങൾ
# Followed by a link (https://mzl.la/3bNrM1I) to get more information and support
recovery-key-pdf-support = അക്കൌണ്ടു് വീണ്ടെടുപ്പു് സങ്കേതം പറ്റി കൂടുതൽ അറിയുക
# Error message displayed in an alert bar if the PDF download failed.
recovery-key-pdf-download-error = അക്കൌണ്ടു് വീണ്ടെടുപ്പു് സങ്കേതം ഇറക്കിവയ്ക്കുന്നതിലു് എന്തോ കുഴപ്പമുണ്ടായി.

## ChooseNewsletters component
## Checklist of newsletters that the user can choose to sign up to

# Prompt above a checklist of newsletters
choose-newsletters-prompt-2 = { -brand-mozilla }-ൽ നിന്നു് ഇനിയും നേടുക

## Tooltip notifications for actions performed on account recovery keys or one-time use codes

datablock-download =
    .message = ഇറക്കിവച്ചു
datablock-copy =
    .message = പകൎത്തി!
datablock-print =
    .message = അച്ചടിച്ചു

## DeviceInfoBlock component
## The strings here are used to display information about the origin of activity happening on a user's account
## For example, when connecting another device to the user's account

# Variables { $city }, { $region }, { $country } represent the estimated location of the user's device
# For example, 'Vancouver, British Columbia, Canada (estimated)'
device-info-block-location-city-region-country = { $city }, { $region }, { $country } (മിക്കവാറും)
# Variables { $region }, { $country } represent the estimated location of the user's device
# For example, 'British Columbia, Canada (estimated)'
device-info-block-location-region-country = { $region }, { $country } (മിക്കവാറും)
# Variables { $city }, { $country } represent the estimated location of the user's device
# For example, 'Vancouver, Canada (estimated)'
device-info-block-location-city-country = { $city }, { $country } (മിക്കവാറും)
# Variable { $country } represent the estimated location of the user's device
# For example, 'Canada (estimated)'
device-info-block-location-country = { $country } (മിക്കവാറും)
# When an approximate location for the user's device could not be determined
device-info-block-location-unknown = സ്ഥലം കണ്ടെത്താൻ കഴിഞ്ഞില്ല
# Variable { $browserName } is the browser that created the request (e.g., Firefox)
# Variable { $genericOSName } is the name of the operating system that created the request (e.g., MacOS, Windows, iOS)
device-info-browser-os = { $genericOSName }-ൽ { $browserName }
# Variable { $ipAddress } represents the IP address where the request originated
# The IP address is a string of numbers separated by periods (e.g., 192.158.1.38)
device-info-ip-address = ഐപി വിലാസം: { $ipAddress }

## FormPasswordInlineCriteria

form-password-with-inline-criteria-signup-new-password-label =
    .label = ഒളിവാക്കു്
form-password-with-inline-criteria-signup-confirm-password-label =
    .label = ഒളിവാക്കു് വീണ്ടും എഴുതുക
form-password-with-inline-criteria-signup-submit-button = അക്കൗണ്ടു് ഉണ്ടാക്കുക
form-password-with-inline-criteria-reset-new-password =
    .label = പുതിയ ഒളിവാക്കു്
form-password-with-inline-criteria-confirm-password =
    .label = ഒളിവാക്കു് ഉറപ്പിക്കുക
form-password-with-inline-criteria-reset-submit-button = പുതിയ ഒളിവാക്കു് ഉണ്ടാക്കുക
form-password-with-inline-criteria-match-error = ഒളിവാക്കുകൾ പൊരുത്തപ്പെടുന്നില്ല
form-password-with-inline-criteria-sr-too-short-message = ഒളിവാക്കിൽ 8 പ്രതീകങ്ങളെങ്കിലും ഉണ്ടാവണം.
form-password-with-inline-criteria-sr-not-email-message = ഒളിവാക്കിൽ താങ്ങളുടെ ഇതപാൽവിലാസം ഉൾപ്പെടരുതു്
form-password-with-inline-criteria-sr-not-common-message = ഒളിവാക്കു് ഒരു സാധാരണമായി ഉപയോഗിക്കപ്പെട്ട ഒളിവാക്കു് ആവരുതു്
form-password-with-inline-criteria-sr-requirements-met = നല്കിയ ഒളിവാക്കു് എല്ലാ ആവശ്യങ്ങളെയും പൂൎതീകരിക്കുന്നു.
form-password-with-inline-criteria-sr-passwords-match = നല്കിയ ഒളിവാക്കുകൾ പൊരുത്തപ്പെടുന്നു

## FormVerifyCode

# Fallback default localized error message for empty input field
form-verify-code-default-error = ഈ തലം പൂരിപ്പിക്കേണ്ടതാണു്

## FormVerifyTotp component
## Form to enter a time-based one-time-passcode (e.g., 6-digit numeric code or 8-digit alphanumeric code)

# Information explaining why button is disabled, also read to screen readers
# Submit button is disabled unless a valid code format is entered
# Used when the code may only contain numbers
# $codeLength : number of digits in a valid code
form-verify-totp-disabled-button-title-numeric = തുടരാൻ വേണ്ടി { $codeLength }-അക്കം നീള കോഡു് നല്കുക
# Information explaining why button is disabled, also read to screen readers
# Submit button is disabled unless a valid code format is entered
# Used when the code may contain numbers and/or letters
# $codeLength : number of characters in a valid code
form-verify-totp-disabled-button-title-alphanumeric = തുടരാൻ വേണ്ടി { $codeLength }-പ്രതീകം നീള കോഡു് നല്കുക

# GetDataTrio component, part of Account Recovery Key flow

get-data-trio-title-firefox = { -brand-firefox }
get-data-trio-title-firefox-recovery-key = { -brand-firefox } അക്കൌണ്ടു് വീണ്ടെടുപ്പു് സങ്കേതം
get-data-trio-title-backup-verification-codes = കരുതൽ പകർപ്പു് ആധികാരികമാക്കൽ-സങ്കേതങ്ങൾ
get-data-trio-download-2 =
    .title = ഇറക്കിവയ്ക്കുക
    .aria-label = ഇറക്കിവയ്ക്കുക
get-data-trio-copy-2 =
    .title = പകൎത്തുക
    .aria-label = പകൎത്തുക
get-data-trio-print-2 =
    .title = അച്ചടിപ്പിക്കുക
    .aria-label = അച്ചടിപ്പിക്കുക

## Images - these are all aria labels used for illustrations
## Aria labels are used as alternate text that can be read aloud by screen readers.

# Aria-label option for an alert symbol
alert-icon-aria-label =
    .aria-label = അറിയിപ്പു്
# Aria-label option for an alert symbol
icon-attention-aria-label =
    .aria-label = ശ്രദ്ധിക്കുക
# Aria-label option for an alert symbol
icon-warning-aria-label =
    .aria-label = മുന്നറിയിപ്പു്
authenticator-app-aria-label =
    .aria-label = അധികാരിക്കൽ പ്രയോഗം
backup-codes-icon-aria-label-v2 =
    .aria-label = കരുതൽ പകർപ്പു് ആധികാരികമാക്കൽ-സങ്കേതം പ്രവൎത്തനക്ഷമമാക്കി
backup-codes-disabled-icon-aria-label-v2 =
    .aria-label = കരുതൽ പകൎപ്പു് ആധികാരികമാക്കൽ-സങ്കേതങ്ങൾ പ്രവൎത്തനരഹിതമാക്കി
# Used to select Canada as country code for phone number
canadian-flag-icon-aria-label =
    .aria-label = കനേടിയൻ കൊടി
# Used to  indicate a general checkmark, as in something checked off in a list!
checkmark-icon-aria-label =
    .aria-label = ചെയ്തു
# Used to  indicate a check mark for a successful state/action
checkmark-success-icon-aria-label =
    .aria-label = വിജയം
# Used to indicate a check mark for an enabled state/option
checkmark-enabled-icon-aria-label =
    .aria-label = സജ്ജമാണു്
# Used on X icon to dismiss a message such as an alert or banner
close-icon-aria-label =
    .aria-label = സന്ദേശം അടയ്ക്കുക
# Used to decorate a code you enter for verification purposes
code-icon-aria-label =
    .aria-label = കോഡ്
error-icon-aria-label =
    .aria-label = പിശകു്
# Used as information icon for informative messaging
info-icon-aria-label =
    .aria-label = വിവരം

## Images - these are all aria labels used for illustrations
## Aria labels are used as alternate text that can be read aloud by screen readers.

signin-recovery-code-image-description =
    .aria-label = മറഞ്ഞിരിക്കുന്ന വാചകം ഉൾക്കൊള്ളുന്ന പ്രമാണം.
signin-totp-code-image-label =
    .aria-label = മറഞ്ഞിരിക്കുന്ന 6 അക്ക സങ്കേതമുള്ള ഒരു ഉപകരണം.

## InlineRecoveryKeySetupCreate component
## Users see this view when we prompt them to generate an account recovery key
## after signing in.

inline-recovery-key-setup-signed-in-firefox-2 = { -brand-firefox }-ലേക്കു് താങ്ങൾ പ്രവേശിച്ചിരിക്കുന്നു
inline-recovery-key-setup-create-header = അക്കൌണ്ടിനെ സുരക്ഷിതമാക്കുക
# This is a subheader asking users to create an account recovery key, indicating it will only take a moment to complete.
inline-recovery-key-setup-create-subheader = ഡാറ്റയെ സംരക്ഷിക്കാൻ വേണ്ടി ഒരു മിനിറ്റു് നേരമുണ്ടോ?
inline-recovery-key-setup-start-button = അക്കൌണ്ടു് വീണ്ടെടുപ്പു് സങ്കേതം ഉണ്ടാക്കുക
inline-recovery-key-setup-later-button = പിന്നീടു് ചെയ്യുക

## Input Password

# Tooltip displayed on a password input visibility toggle. Expresses the toggle action, where clicking on the toggle will hide the password.
input-password-hide = ഒളിവാക്കു് മറയ്ക്കുക
# Tooltip displayed on a password input visibility toggle. Expresses the toggle action, where clicking on the toggle will show the password.
input-password-show = ഒളിവാക്കു് കാണിയ്ക്കുക
# Message read by screen readers when focus is on a password input visibility toggle. Expresses current (visible) state of the textbox content.
input-password-hide-aria-2 = താങ്ങളുടെ ഒളിവാക്കു് പ്രതലത്തിൽ നിലവിൽ കാണാം.
# Message read by screen readers when focus is on a password input visibility toggle. Expresses current (hidden) state of the textbox content.
input-password-show-aria-2 = താങ്ങളുടെ ഒളിവാക്കു് നിലവിൽ മറച്ചിരിക്കുന്നു.
# Message read by screen readers after clicking on a password input visibility toggle to show the password. Expresses the new (visible) state of the textbox content.
input-password-sr-only-now-visible = താങ്ങളുടെ ഒളിവാക്കു് പ്രതലത്തിൽ ഇപ്പോൾ കാണാം.
# Message read by screen readers after clicking on a password input visibility toggle to hide the password. Expresses the new (hidden) state of the textbox content.
input-password-sr-only-now-hidden = താങ്ങളുടെ ഒളിവാക്കു് ഇപ്പോൾ മറച്ചിരിക്കുന്നു

## Phone number component

# This is an aria-label available to screen readers for a selection list that includes country flags, country name and country code
input-phone-number-country-list-aria-label = രാജ്യം തിരഞ്ഞെടുക്കുക
input-phone-number-enter-number = ഫോൺ അക്കം നല്കുക
input-phone-number-country-united-states = യുണൈറ്റഡ്‌ സ്റ്റേറ്റ്‌സ്‌
input-phone-number-country-canada = കാനട
# Back button on legal/terms or legal/privacy that takes users to the previous page
legal-back-button = പുറകോട്ടു്

## LinkDamaged component

# The user followed a password reset link that was received by email
# but the link is damaged (for example mistyped or broken by the email client)
reset-pwd-link-damaged-header = ഒളിവാക്ക് പുനസജ്ജീകരണ കണ്ണി കേടായി
# The user followed a link to signin that was received by email
# but the link was damaged (for example mistyped or broken by the email client).
signin-link-damaged-header = ഉറപ്പിക്കൽകണ്ണി കേടായി
# The user followed a link to report an invalid signin attempt that was received by email
# but the link was damaged (for example mistyped or broken by the email client).
report-signin-link-damaged-header = കണ്ണി കേടായി

## LinkExpired component

# Button to request a new link if the previous link that was emailed to the user is expired
link-expired-new-link-button = പുതിയ കണ്ണിക്കായി ചോദിക്കുക

## LinkRememberPassword component

# immediately before remember-password-signin-link
remember-password-text = ഒളിവാക്കു് ഓൎമ്മയുണ്ടോ?
# link navigates to the sign in page
remember-password-signin-link = പ്രവേശിക്കുക

## LinkUsed component

# The user followed a primary email confirmation link, but that link is has been used and is no longer valid
primary-email-confirmation-link-reused = പ്രാഥമിക ഇതപാൽ മുൻപേ ഉറപ്പിച്ചതാണു്
# The user followed a sign-in confirmation link, but that link has been used and is no longer valid
signin-confirmation-link-reused = പ്രവേശനം ഉറപ്പിച്ചു

## Locale Toggle Component

# Users will see this heading when the URL or network request is malformed, e.g. a query parameter is required and is invalid
error-bad-request = കേടായ അഭ്യൎത്ഥനം

## PasswordStrengthInline component
## These strings are conditions that need to be met to qualify as a strong password

password-strength-inline-min-length = 8 പ്രതീകങ്ങളെങ്കിലും
password-strength-inline-not-email = താങ്ങളുടെ ഇതപാൽ വിലാസമല്ല
password-strength-inline-not-common = സാധാരണമുപയോഗപ്പെട്ട ഒളിവാക്കല്ല

## Notification Promo Banner component

account-recovery-notification-cta = നിര്‍മ്മിക്കുക

## Ready component

manage-your-account-button = താങ്ങളുടെ അക്കൗണ്ടിനെ കൈകാര്യം ചെയ്യുക
# Message shown when the account is ready but the user is not signed in
ready-account-ready = താങ്ങളുടെ അക്കൗണ്ടു് ഒരുക്കി!
ready-continue = തുടരുക
sign-in-complete-header = പ്രവേശിക്കൽ ഉറപ്പിച്ചു
sign-up-complete-header = അക്കൗണ്ടു് തീൎച്ചപ്പെടുത്തു

## Users see this view when they are generating a new account recovery key
## This screen displays the generated key and allows users to download or copy the key

flow-recovery-key-download-storage-ideas-folder-v2 = സുരക്ഷിത ഉപരണത്തിലായ അറ

## RecoveryKeySetupHint
## This is the final step in the account recovery key creation flow after a Sync signin or in account settings
## Prompts the user to save an (optional) storage hint about the location of their account recovery key.

# The text of the "submit" button. Clicking on this button will save the hint (if provided) and exit the account recovery key creation flow.
# "Finish" refers to "Finish the account recovery key creation process"
flow-recovery-key-hint-cta-text = തീൎക്കുക

## ResetPasswordWarning component
## Warning shown to sync users that reset their password without using an account recovery key

password-reset-warning-icon = മുന്നറിയിപ്പു്

## Alert Bar

alert-bar-close-message = സന്ദേശം അടയ്ക്കുക

##


# BentoMenu component

bento-menu-vpn-2 = { -product-mozilla-vpn }
bento-menu-monitor-3 = { -product-mozilla-monitor }
bento-menu-firefox-relay-2 = { -product-firefox-relay }

##

cs-sign-out-button = പുറത്തുകടക്കുക

## Data collection section

dc-learn-more = കൂടുതല്‍ അറിയുക

# DropDownAvatarMenu component

drop-down-menu-title-2 = { -product-mozilla-account } കുറിപ്പടി
# This is displayed in the Settings menu after user's click on their profile icon.
# Following this string on a new line will be their display name (user's name or email)
drop-down-menu-signed-in-as-v2 = ആയി പ്രവേശിച്ചിരിയ്ക്കുന്നു
drop-down-menu-sign-out = പുറത്തുകടക്കുക

## Flow Container

flow-container-back = പുറകോട്ടു്

## FlowRecoveryKeyDownload - Third view in the PageRecoveryKeyCreate flow
## Users see this view when they are generating a new account recovery key
## This screen displays the generated key and allows users to download or copy the key

# This link allows user to proceed to the next step without clicking the download button
flow-recovery-key-download-next-link-v2 = ഇറക്കിവയ്ക്കാതെ തുടരുക

## FlowRecoveryKeyInfo - First view in the PageRecoveryKeyCreate flow

# The text of the "submit" button to start creating (or changing) an account recovery key
flow-recovery-key-info-cta-text-v3 = ഉപയോഗിക്കാൻ തുടങ്ങുക
# Link to cancel account recovery key change and return to settings
flow-recovery-key-info-cancel-link = റദ്ദാക്കുക

## FlowSetupPhoneConfirmCode

flow-setup-phone-confirm-code-input-label = 6 അക്ക കോഡ് നൽകുക
flow-setup-phone-confirm-code-button = ഉറപ്പിക്കുക
# button to resend a code by text message to the user's phone
# followed by a button to resend a code
flow-setup-phone-confirm-code-expired = കോഡ് കാലഹരണപ്പെട്ടോ?
flow-setup-phone-confirm-code-resend-code-button = കോഡ് വീണ്ടും അയയ്ക്കുക

## HeaderLockup component, the header in account settings

header-menu-open = കുറിപ്പടി അടയ്ക്കുക
header-menu-closed = വെബ്സ്ഥാനവഴിക്കാട്ടൽവ്യവസ്ഥക്കുറിപ്പടി
header-back-to-top-link =
    .title = മേൽപോട്ടു് തിരികെ പോവുക
header-title-2 = { -product-mozilla-account }
header-help = പിന്തുണ

## Linked Accounts section

la-heading = ഇണച്ച അക്കൗണ്ടുകൾ
la-set-password-button = ഒളിവാക്കു് വയ്ക്കുക
nav-linked-accounts = { la-heading }

## Modal - Default values for a message directed at the user where the user can typically Confirm or Cancel.

modal-close-title = അടയ്ക്കുക
modal-cancel-button = റദ്ദാക്കുക
modal-default-confirm-button = തീര്‍ച്ചപ്പെടുത്തുക

## Modal Verify Session

mvs-verify-your-email-2 = ഇ-തപാൽ തീൎച്ചപ്പെടുത്തുക
mvs-enter-verification-code-2 = ഉറപ്പിക്കൽ-സങ്കേതം നല്കുക
msv-cancel-button = റദ്ദാക്കുക
msv-submit-button-2 = തീര്‍ച്ചപ്പെടുത്തുക

## Settings Nav

nav-settings = ക്രമീകരണങ്ങൾ
nav-profile = രൂപരേഖ
nav-security = സുരക്ഷ
nav-connected-services = ബന്ധിപ്പിച്ച സേവനങ്ങൾ
nav-data-collection = ദത്ത പിരിവും ഉപയോഗവും
nav-email-comm = ഇതപാൽ ആശയവിനിമയങ്ങൾ

## Avatar change page

avatar-page-title =
    .title = രൂപരേഖച്ചിത്രം
avatar-page-add-photo = ചിത്രം ചേൎക്കുക
avatar-page-add-photo-button =
    .title = { avatar-page-add-photo }
avatar-page-take-photo = ചിത്രം എടുക്കുക
avatar-page-take-photo-button =
    .title = { avatar-page-take-photo }
avatar-page-remove-photo = ചിത്രം മാറ്റുക
avatar-page-remove-photo-button =
    .title = { avatar-page-remove-photo }
avatar-page-retake-photo = ചിത്രം വീണ്ടും എടുക്കുക
avatar-page-cancel-button = റദ്ദാക്കുക
avatar-page-save-button = കരുതിവയ്ക്കുക
avatar-page-saving-button = കരുതിവയ്ക്കുന്നു…
avatar-page-zoom-out-button =
    .title = ചെറുതാക്കുക
avatar-page-zoom-in-button =
    .title = വലുതാക്കുക
avatar-page-rotate-button =
    .title = കറക്കുക
avatar-page-camera-error = ക്യാമറ ആരംഭിക്കാനായില്ല
avatar-page-new-avatar =
    .alt = പുതിയ രൂപരേഖച്ചിത്രം

## Password change page

pw-change-header =
    .title = ഒളിവാക്കു് മാറ്റുക
pw-not-email = താങ്ങളുടെ ഇതപാൽ വിലാസമല്ല
pw-commonly-used = സാധാരണമുപയോഗപ്പെട്ട ഒളിവാക്കല്ല
pw-change-cancel-button = റദ്ദാക്കുക
pw-change-save-button = കരുതിവയ്ക്കുക
pw-change-forgot-password-link = താങ്ങളുടെ ഒളിവാക്കു് മറന്നോ?
pw-change-current-password =
    .label = നിലവിലുള്ള ഒളിവാക്കു് നല്കുക
pw-change-new-password =
    .label = പുതിയ ഒളിവാക്കു് നല്കുക
pw-change-confirm-password =
    .label = പുതിയ ഒളിവാക്കു് ഉറപ്പിക്കുക
pw-change-success-alert-2 = ഒളിവാക്കു് പുതുച്ചു

## Password create page

pw-create-header =
    .title = ഒളിവാക്കു് ഉണ്ടാക്കുക
pw-create-success-alert-2 = ഒളിവാക്കു് സജ്ജം

## Delete account page

delete-account-header =
    .title = അക്കൗണ്ടു് മായ്ക്കുക
delete-account-step-1-2 = പടി 1/2
delete-account-step-2-2 = പടി 2/2
delete-account-product-mozilla-account = { -product-mozilla-account }
delete-account-product-mozilla-vpn = { -product-mozilla-vpn }
delete-account-product-mdn-plus = { -product-mdn-plus }
delete-account-product-mozilla-hubs = { -product-mozilla-hubs }
delete-account-product-mozilla-monitor = { -product-mozilla-monitor }
delete-account-product-firefox-relay = { -product-firefox-relay }
delete-account-product-firefox-sync = { -brand-firefox } ദത്ത സമന്വയിപ്പിക്കുന്നു
delete-account-product-firefox-addons = { -brand-firefox } ആഡ് ഓണുകൾ
delete-account-continue-button = തുടരുക
delete-account-password-input =
    .label = ഒളിവാക്ക് നല്‍കുക
delete-account-cancel-button = റദ്ദാക്കുക
delete-account-delete-button-2 = മായ്ക്കുക

## Display name page

display-name-page-title =
    .title = പ്രദര്‍ശനപ്പേരു്
display-name-input =
    .label = പ്രദൎശനപ്പേരു് നല്കുക
submit-display-name = കരുതിവയ്ക്കുക
cancel-display-name = റദ്ദാക്കുക
display-name-update-error-2 = പ്രദൎശനപ്പേരു് പുതുക്കുന്നതിലൊരു കുഴപ്പമുണ്ടായി
display-name-success-alert-2 = പ്രദർശനപ്പേരു് പുതുക്കി

## Recent account activity
## All strings except title indicate an event that occurred from the user's account
## These are displayed as a list with the date when the event occured

recent-activity-account-create-v2 = അക്കൗണ്ടു് ഉണ്ടാക്കി
recent-activity-account-disable-v2 = അക്കൗണ്ടു് പ്രവൎത്തനരഹിതമാക്കി
recent-activity-account-enable-v2 = അക്കൗണ്ടു് പ്രവൎത്തനക്ഷമമാക്കി
recent-activity-account-login-v2 = അക്കൗണ്ടു് പ്രവേശനം തുടങ്ങി
recent-activity-account-two-factor-added = രണ്ടുപ്പടി അധിക്കാരികപ്പെടുത്തൽ പ്രവൎത്തനക്ഷമമാക്കി
recent-activity-account-two-factor-requested = രണ്ടുപ്പടി അധിക്കാരികപ്പെടുത്തൽ അഭ്യൎത്ഥിച്ചു
recent-activity-account-two-factor-failure = രണ്ടുപ്പടി അധിക്കാരികപ്പെടുത്തൽ തോറ്റുപോയി
recent-activity-account-two-factor-success = രണ്ടുപ്പടി അധിക്കാരികപ്പെടുത്തൽ നടന്നു
recent-activity-account-two-factor-removed = രണ്ടുപ്പടി അധിക്കാരികപ്പെടുത്തൽ മാറ്റി
recent-activity-account-password-changed = ഒളിവാക്കു് മാറ്റി

## PageRecoveryPhoneRemove
## Users reach this page from account settings when they want to remove a backup phone number.

settings-recovery-phone-remove-cancel = റദ്ദാക്കുക

## Add secondary email page

add-secondary-email-step-1 = പടി 1/2
add-secondary-email-enter-address =
    .label = ഇതപാൽ വിലാസം നല്കുക
add-secondary-email-cancel-button = റദ്ദാക്കുക
add-secondary-email-save-button = കരുതിവയ്ക്കുക

## Verify secondary email page

add-secondary-email-step-2 = പടി 2/2
verify-secondary-email-page-title =
    .title = രണ്ടാമത്തെ ഇതപാൽ
verify-secondary-email-verification-code-2 =
    .label = ഉറപ്പിക്കൽ-സങ്കേതം നല്കുക
verify-secondary-email-cancel-button = റദ്ദാക്കുക
verify-secondary-email-verify-button-2 = ഉറപ്പിക്കുക

##

# Link to delete account on main Settings page
delete-account-link = അക്കൗണ്ട് മായ്ക്കുക

## Profile section

profile-heading = രൂപരേഖ
profile-picture =
    .header = ചിത്രം
profile-display-name =
    .header = പ്രദര്‍ശനപ്പേരു്
profile-primary-email =
    .header = പ്രാഥമിക ഇതപാൽ

## Security section of Setting

security-heading = സുരക്ഷ
security-password =
    .header = ഒളിവാക്കു്
# This is a string that shows when the user's password was created.
# Variables:
#   $date (String) - a localized date and time string
security-password-created-date = ഉണ്ടാക്കിയതു്: { $date }
security-action-create = നിര്‍മ്മിക്കുക

## SubRow component

# Shown to users who have no backup authentication codes
# Button to add backup authentication codes when none are configured
tfa-row-backup-codes-add-cta = ചേർക്കുക
# button to change the configured recovery phone
tfa-row-backup-phone-change-cta = മാറ്റുക
# button to add/configure a recovery phone
tfa-row-backup-phone-add-cta = ചേർക്കുക
# Button to remove a recovery phone from the user's account
tfa-row-backup-phone-delete-button = മാറ്റുക
# Shown in tooltip on delete button or delete icon
tfa-row-backup-phone-delete-title-v2 = വീണ്ടെടുപ്പു് ഫോൺ മായ്ക്കുക

## Switch component

# Used as "title" attribute when the switch is "on" and interaction turns the switch to "off"
switch-turn-off = അണച്ചുവയ്ക്കുക
# Used as "title" attribute when the switch is "off" and interaction turns the switch to "on"
switch-turn-on = തുടങ്ങിവയ്ക്കുക
# Used as "title" attribute when switch has been interacted with and form is submitting
switch-submitting = സമർപ്പിക്കുന്നു…
switch-is-on = തുടങ്ങിയതു്
switch-is-off = അണച്ചതു്

## Sub-section row Defaults

row-defaults-action-add = ചേര്‍ക്കുക
row-defaults-action-change = മാറ്റുക
row-defaults-action-disable = പ്രവൎത്തനരഹിതമാക്കുക

## Account recovery key sub-section on main Settings page

rk-enabled = പ്രവർത്തനക്ഷമമാക്കിയതു്
rk-action-create = ഉണ്ടാക്കുക
# Button to delete the existing account recovery key and create a new one
rk-action-change-button = മാറ്റുക
rk-action-remove = മായ്ക്കുക
rk-key-removed-2 = അക്കൗണ്ടു് വീണ്ടെടുപ്പുക്കട്ടയെ മായച്ചു

## Two Step Auth sub-section on Settings main page

tfa-row-action-add = ചേൎക്കുക

## ThirdPartyAuth component
## This is a component that is used to display a list of third party providers (Apple, Google, etc.)

# This appears when a user has the option to authenticate via third party accounts in addition to their Firefox account.
# Firefox account login appears on top, and third party options appear on bottom.
# This string appears as a separation between the two, in the following order: "Enter your password" "Or"(this string) (continue-with-google-button with aria equivalent text) / (continue-with-apple-button with aria equivalent text)
third-party-auth-options-or = അല്ലെങ്കിൽ

## Auth-server based errors that originate from backend service

auth-error-102 = അറിയാത്ത അക്കൗണ്ടു്
auth-error-103 = തെറ്റായ ഒളിവാക്കു്
# Error shown to users when they have attempted a request (e.g., requesting a password reset) too many times
# and their requests have been throttled, but the specific amount of time before they can retry is unknown.
auth-error-114-generic = താങ്ങൾ ഒരുപാടു് വട്ടം ശ്രമിച്ചിരിക്കുന്നു. പിന്നീട് വീണ്ടും ശ്രമിക്കുക.
# This string is the amount of time required before a user can attempt another request.
# Variables:
#   $retryAfter (String) - Time required before retrying a request. The variable is localized by our
#                          formatting library (momentjs) as a "time from now" and automatically includes
#                          the prefix as required by the current locale (for example, "in 15 minutes", "dans 15 minutes").
auth-error-114 = താങ്ങൾ ഒരുപാടു് വട്ടം ശ്രമിച്ചിരിക്കുന്നു. വീണ്ടും ശ്രമിക്കുക { $retryAfter }.
auth-error-203 = വ്യവസ്ഥ ലഭ്യമല്ല, പിന്നീടു് വീണ്ടും ശ്രമിക്കുക
auth-error-1001 = പ്രവേശന ശ്രമം റദ്ദാക്കി
oauth-error-1000 = എന്തോ പന്തികേട് സംഭവിച്ചിരിക്കുന്നു. ഈ ടാബ് അടച്ച് വീണ്ടും ശ്രമിക്കുക.

## Connect Another Device page

# A "success" message visible to users who verified via sign-in
connect-another-device-signin-confirmed-banner = പ്രവേശനം തീൎച്ചപ്പെടുത്തി
# A link for the user to sign in to the current Firefox browser, preceded by a message prompting the user to sign in so as to complete the device sync setup
connect-another-device-signin-link = പ്രവേശിക്കുക
# This link cancels the process of connecting another device, and takes the user back to Account Settings
connect-another-device-not-now-link = ഇപ്പോഴല്ല

## Cookies disabled page
## Users will see this page if they have local storage or cookies disabled.

# A button users may click to check if cookies and local storage are enabled and be directed to the previous page if so.
cookies-disabled-button-try-again = വീണ്ടും ശ്രമിയ്ക്കുക

## Pair index page

# Clicking this button initiates the pairing process, usually by directing the user to the `about:preferences` page in Firefox
pair-sync-your-device-button = താങ്ങളുടെ ഉപകരണത്തിനെ സമന്വയിപ്പിക്കുക
# This allows the user to exit the sync/pair flow, and redirects them back to Settings
pair-not-now-button = ഇപ്പോഴല്ല
# This initiates the pairing process, usually by directing the user to the `about:preferences` page in Firefox
pair-get-started-button = ഉപയോഗിക്കാൻ തുടങ്ങുക

## PairSuccess - a view which displays  on successful completion of the device pairing process

pair-success-header-2 = ഉപകരണം ബന്ധിപ്പിച്ചു

## Confirm Reset Password With Code

confirm-reset-password-with-code-heading = താങ്ങളുടെ ഇതപാൽ പരിശോധിക്കുക
# Text within span appears in bold
# $email - email address for which a password reset was requested
confirm-reset-password-with-code-instruction = <span>{ $email }</span>-ലേക്കു് ഞങ്ങളൊരു ഉറപ്പിക്കൽ-സങ്കേതം അയച്ചിട്ടുണ്ടു്
# Shown above a group of 8 single-digit input boxes
# Only numbers allowed
confirm-reset-password-code-input-group-label = 10 മിനിറ്റിലുള്ളിൽ 8 അക്ക സങ്കേതം നല്കുക
# Clicking the button submits and verifies the code
# If succesful, continues to the next step of the password reset
confirm-reset-password-otp-submit-button = തുടരുക
# Button to request a new reset password confirmation code
confirm-reset-password-otp-resend-code-button = സങ്കേതം വീണ്ടും അയയ്ക്കുക
# Link to cancel the password reset and sign in with a different account
confirm-reset-password-otp-different-account-link = മറ്റൊരു അക്കൗണ്ട് ഉപയോഗിക്കുക

## PasswordResetConfirmTotp Page

confirm-totp-reset-password-trouble-code = സങ്കേതം ഇടുന്നതിൽ കുഴപ്പമുണ്ടാവന്നോ?
confirm-totp-reset-password-confirm-button = തീൎച്ചപെടുത്തുക
confirm-totp-reset-password-input-label-v2 = 6 അക്ക സങ്കേതം നൽകുക
confirm-totp-reset-password-use-different-account = മറ്റൊരു അക്കൗണ്ട് ഉപയോഗിക്കുക

## ResetPassword start page

password-reset-email-input =
    .label = ഇ-തപാൽ നൽകുക
password-reset-submit-button-2 = തുടരുക

## ResetPasswordConfirmed

reset-password-complete-header = താങ്കളുടെ ഒളിവാക്കു് പുനഃസജ്ജമാക്കി
# $serviceName is a product name such as Monitor, Relay
reset-password-confirmed-cta = { $serviceName }-ലോട്ടു് തുടരുക

## CompleteSignin component

# This is a label that precedes any error which could arise from trying to validate the user's signin
error-label = പിഴവു്:
# This is a message that is shown to users along with a "Loading" spinner while the site tries to check their signin
validating-signin = പ്രവേശനം തീൎച്ചപ്പെടുത്തുന്നു…

## Signin page

signin-button = പ്രവേശിക്കുക
signin-header = പ്രവേശിക്കുക
signin-use-a-different-account-link = മറ്റൊരു അക്കൗണ്ട് ഉപയോഗിക്കുക
signin-forgot-password-link = ഒളിവാക്കു് മറന്നോ?
signin-password-button-label = ഒളിവാക്കു്

## ReportSignin Page
## When users receive an "Is this you signing in?" email with an unblock code,
## they can click "report it to us" if they did not attempt to sign in.
## This will be the page shown to users to block the sign in and report it.

report-signin-header = അംഗീകൃതമല്ലാത്ത പ്രവേശനം റിപ്പോർട്ട് ചെയ്യണോ?
back = തിരികെ

## SigninPushCodeConfirmPage

signin-push-code-confirm-instruction = പ്രവേശനം ഉറപ്പിക്കുക
signin-push-code-confirm-verifying = ഉറപ്പിക്കുന്നു
signin-push-code-confirm-login = പ്രവേശനം തീൎച്ചപ്പെടുത്തുക
signin-push-code-confirm-link-error = കണ്ണി കേടായി. ദയവായി വീണ്ടും ശ്രമിക്കുക

## Signin recovery method page
## This page is shown to users when they are having trouble signing in with
## their password, and they previously had set up an account recovery method.

signin-recovery-method-header = പ്രവേശിക്കുക
signin-recovery-method-subheader = വീണ്ടെടുക്കൽപരി തിരഞ്ഞെടുക്കുക
signin-recovery-method-code-v2 = കരുതൽ പകൎപ്പു് ആധികാരികമാക്കൽ-സങ്കേതങ്ങൾ

## SigninRecoveryCode page
## Users are prompted to enter a backup authentication code
## (provided to the user when they first set up two-step authentication)
## when they are unable to sign in with two-step authentication (e.g., Authy, Duo, etc.)

signin-recovery-code-heading = പ്രവേശിക്കുക
signin-recovery-code-sub-heading = കരുതൽ പകർപ്പു് ആധികാരികമാക്കൽ-സങ്കേതം നല്കുക
# Form button to confirm if the backup authentication code entered by the user is valid
signin-recovery-code-confirm-button = തീൎച്ചപെടുത്തുക
signin-recovery-code-use-phone-failure-description = ദയവായി പിന്നീട് വീണ്ടും ശ്രമിക്കുക

## SigninRecoveryPhone page

signin-recovery-phone-flow-heading = പ്രവേശിക്കുക
# Follows the error message (e.g, "There was a problem sending a code")
signin-recovery-phone-general-error-description = ദയവായി പിന്നീട് വീണ്ടും ശ്രമിക്കുക

## SigninTokenCode page
## Users see this page during the signin process. In this instance, the confirmation code is
## a 6-digit code that is sent to the user's email address.

signin-token-code-input-label-v2 = 6 അക്ക സങ്കേതം നൽകുക
# Form button to confirm if the confirmation code entered by the user is valid
signin-token-code-confirm-button = തീൎച്ചപെടുത്തുക

## SigninTOTPCode page
## TOTP (time-based one-time password) is a form of two-factor authentication (2FA).
## Users that have set up two-factor authentication land on this page during sign-in.

signin-totp-code-header = പ്രവേശിക്കുക
signin-totp-code-subheader-v2 = രണ്ടുപടി ആധികാരികമാക്കൽ-സങ്കേതം നല്കുക
# Form button to confirm if the authentication code entered by the user is valid
signin-totp-code-confirm-button = തീൎച്ചപ്പെടുത്തുക
signin-totp-code-other-account-link = മറ്റൊരു അക്കൗണ്ട് ഉപയോഗിക്കുക
signin-totp-code-recovery-code-link = സങ്കേതം ഇടുന്നതിൽ കുഴപ്പമുണ്ടാവന്നോ?

## Signin Unblock Page
## Page shown when signin has been blocked by rate limiting (too many requests)

signin-unblock-header = ഈ പ്രവേശനം അംഗീകരിക്കുക
signin-unblock-submit-button = തുടരുക

## Account Signup page
## This is the second page of the sign up flow, users have already entered their email

# Clicking on this link returns the user to the beginning of the flow so they can enter a new email address
signup-change-email-link = ഇതപാൽ മാറ്റുക
