# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.


## Banner component

resend-code-success-banner-heading = កូដថ្មីត្រូវបានផ្ញើទៅអុីមែលរបស់អ្នក។
resend-link-success-banner-heading = បញ្ជាប់ថ្មីមួយត្រូវបានផ្ញើទៅកាន់អុីមែលរបស់អ្នក។
# $accountsEmail is the Mozilla accounts sender email address (e.g. accounts@firefox.com)
resend-success-banner-description = បន្ថែម { $accountsEmail } ទៅក្នុងទំនាក់ទំនងរបស់អ្នក ដើម្បីធានាបាននូវការបញ្ជូនដ៏រលូន។

## Brand Messaging component
## Used to show in product messaging about upcoming brand changes

# This message is displayed as the title element in the banner, prior to actually launching the new brand
brand-prelaunch-title = { -product-firefox-accounts } នឹងអាចប្ដូរឈ្មោះ { -product-mozilla-accounts } នៅថ្ងៃទី ១ ខែវិច្ឆិកា

## ButtonPasskeySignin

button-passkey-signin = បញ្ជាប់ចូលជាមួយសោសម្ងាត់

## ChooseNewsletters component
## Checklist of newsletters that the user can choose to sign up to

# Newsletter checklist item
choose-newsletters-option-test-pilot =
    .label = អាក់សេសមុនគេ ដើម្បីសាកល្បងផលិតផលថ្មី

## Firefox Promo Banner component
## Shown at the top of settings to promote installing Firefox on mobile (when
## the user is on Firefox) or switching to Firefox (on other browsers).

firefox-promo-banner-switch-cta = ប្ដូរទៅ { -brand-firefox }

## FormPasswordInlineCriteria

form-password-with-inline-criteria-signup-new-password-label =
    .label = ពាក្យ​សម្ងាត់
form-password-with-inline-criteria-signup-confirm-password-label =
    .label = ពាក្យសម្ងាត់ម្ដងទៀត
form-password-with-inline-criteria-signup-submit-button = បង្កើតគណនី
form-password-with-inline-criteria-reset-new-password =
    .label = ពាក្យសម្ងាត់ថ្មី
form-password-with-inline-criteria-confirm-password =
    .label = អះអាង​ពាក្យសម្ងាត់
form-password-with-inline-criteria-reset-submit-button = បង្កើតពាក្យសម្ងាត់ថ្មី
form-password-with-inline-criteria-set-password-new-password-label =
    .label = ពាក្យ​សម្ងាត់
form-password-with-inline-criteria-match-error = ពាក្យសម្ងាត់មិនត្រូវគ្នាទេ
form-password-with-inline-criteria-sr-too-short-message = ពាក្យសម្ងាត់ត្រូវតែមានយ៉ាងហោចណាស់ 8 តួអក្សរ។
form-password-with-inline-criteria-sr-not-email-message = ពាក្យសម្ងាត់មិនត្រូវមានអាសយដ្ឋានអ៊ីមែលរបស់អ្នកទេ។
form-password-with-inline-criteria-sr-not-common-message = ពាក្យសម្ងាត់មិនគួរជាពាក្យសម្ងាត់ដែលប្រើជាទូទៅទេ។
form-password-with-inline-criteria-sr-requirements-met = ពាក្យសម្ងាត់ដែលបានបញ្ចូលគោរពទៅតាមតម្រូវការពាក្យសម្ងាត់ទាំងអស់។
form-password-with-inline-criteria-sr-passwords-match = ពាក្យសម្ងាត់ដែលបានបញ្ចូលត្រូវគ្នា។

## FormVerifyCode

# Fallback default localized error message for empty input field
form-verify-code-default-error = ចន្លោះនេះត្រូវបានទាមទារ

## FormVerifyTotp component
## Form to enter a time-based one-time-passcode (e.g., 6-digit numeric code or 8-digit alphanumeric code)

# Information explaining why button is disabled, also read to screen readers
# Submit button is disabled unless a valid code format is entered
# Used when the code may only contain numbers
# $codeLength : number of digits in a valid code
form-verify-totp-disabled-button-title-numeric = បញ្ចូលកូដ { $codeLength }-ខ្ទង់ ដើម្បីបន្ត
# Information explaining why button is disabled, also read to screen readers
# Submit button is disabled unless a valid code format is entered
# Used when the code may contain numbers and/or letters
# $codeLength : number of characters in a valid code
form-verify-totp-disabled-button-title-alphanumeric = បញ្ចូលកូដ { $codeLength }-តួ ដើម្បីបន្ត

# GetDataTrio component, part of Account Recovery Key flow

get-data-trio-title-firefox = { -brand-firefox }
get-data-trio-title-firefox-recovery-key = សោសង្គ្រោះគណនី { -brand-firefox }
get-data-trio-title-backup-verification-codes = កូដយថាភូតកម្មសំណៅចម្លងបម្រុងទុក
get-data-trio-download-2 =
    .title = ទាញយក
    .aria-label = ទាញយក
get-data-trio-copy-2 =
    .title = ចម្លង
    .aria-label = ចម្លង
get-data-trio-print-2 =
    .title = បោះពុម្ព
    .aria-label = បោះពុម្ព

## Images - these are all aria labels used for illustrations
## Aria labels are used as alternate text that can be read aloud by screen readers.

# Aria-label option for an alert symbol
alert-icon-aria-label =
    .aria-label = សញ្ញាដាស់តឿន
# Aria-label option for an alert symbol
icon-attention-aria-label =
    .aria-label = ប្រុងប្រយ័ត្ន
# Aria-label option for an alert symbol
icon-warning-aria-label =
    .aria-label = ការ​ព្រមាន
authenticator-app-aria-label =
    .aria-label = កម្មវិធីយថាភូតកម្ម
backup-codes-icon-aria-label-v2 =
    .aria-label = កូដយថាភូតកម្មសំណៅចម្លងបម្រុងទុកត្រូវបានភ្ជាប់
backup-codes-disabled-icon-aria-label-v2 =
    .aria-label = កូដយថាភូតកម្មសំណៅចម្លងបម្រុងទុកត្រូវបានផ្ដាច់
# An icon of phone with text message. A back recovery phone number
backup-recovery-sms-icon-aria-label =
    .aria-label = សេវាសារខ្លីសង្គ្រោះត្រូវបានបើក
# Disabled version of backup-recovery-sms-icon-aria-label
backup-recovery-sms-disabled-icon-aria-label =
    .aria-label = សេវាសារខ្លីសង្គ្រោះត្រូវបានបិទ
# Used to select Canada as country code for phone number
canadian-flag-icon-aria-label =
    .aria-label = ទង់ជាតិកាណាដា
# Used to  indicate a general checkmark, as in something checked off in a list!
checkmark-icon-aria-label =
    .aria-label = ធីក
# Used to  indicate a check mark for a successful state/action
checkmark-success-icon-aria-label =
    .aria-label = ជោគជ័យ
# Used to indicate a check mark for an enabled state/option
checkmark-enabled-icon-aria-label =
    .aria-label = បាន​បើក
# Used to indicate that an action will navigate forward or open a detail view
chevron-right-icon-aria-label =
    .aria-label = សញ្ញាព្រួញឯស្ដាំ
# Used on X icon to dismiss a message such as an alert or banner
close-icon-aria-label =
    .aria-label = បិទសារ
# Used to decorate a code you enter for verification purposes
code-icon-aria-label =
    .aria-label = កូដ
error-icon-aria-label =
    .aria-label = កំហុស​
# Used as information icon for informative messaging
info-icon-aria-label =
    .aria-label = ព័ត៌មាន
# Used to select United States as a country code for phone number
usa-flag-icon-aria-label =
    .aria-label = ទង់ជាតិសហរដ្ឋអាម៉េរិក
# Used for loading arrow icon
icon-loading-arrow-aria-label =
    .aria-label = កំពុង​ផ្ទុក
# Used for passkey icon
icon-passkey-aria-label =
    .aria-label = សោសម្ងាត់

## PasswordStrengthInline component
## These strings are conditions that need to be met to qualify as a strong password

password-strength-inline-passwords-match = ពាក្យសម្ងាត់ត្រូវគ្នា

## Users see this view when they are generating a new account recovery key
## This screen displays the generated key and allows users to download or copy the key

flow-recovery-key-download-storage-ideas-pwd-manager = កម្មវិធីគ្រប់គ្រងពាក្យសម្ងាត់

## Alert Bar

alert-bar-close-message = បិទសារ

## User's avatar

avatar-your-avatar =
    .alt = រូបតំណាងរបស់អ្នក

##


# BentoMenu component

bento-menu-firefox-desktop = { -brand-firefox } កម្មវិធីរុករកសម្រាប់កុំព្យូទ័រ
bento-menu-firefox-mobile = កម្មវិធីរុករកតាមអ៊ីនធឺណិតសម្រាប់ទូរសព្ទចល័ត { -brand-firefox }
bento-menu-made-by-mozilla = ផលិតដោយ { -brand-mozilla }

## Connect another device promo

connect-another-fx-mobile = ទាញយក { -brand-firefox } នៅលើទូរសព្ទ ឬថេប្លេត

##

cs-disconnect-advice-confirm = យល់​ហើយ ទទួលបាន

## FlowRecoveryKeyInfo - First view in the PageRecoveryKeyCreate flow

# Link to cancel account recovery key change and return to settings
flow-recovery-key-info-cancel-link = បោះបង់

## Linked Accounts section

la-set-password-button = កំណត់ពាក្យសម្ងាត់

## Modal - Default values for a message directed at the user where the user can typically Confirm or Cancel.

modal-cancel-button = បោះបង់

## ModalMfaProtected

modal-mfa-protected-cancel-button = បោះបង់

## Modal Verify Session

msv-cancel-button = បោះបង់

## Settings Nav

nav-profile = ប្រវត្តិរូប

## Avatar change page

avatar-page-title =
    .title = រូបភាពប្រវត្តិរូប
avatar-page-cancel-button = បោះបង់

## Password change page

pw-change-cancel-button = បោះបង់
pw-change-success-alert-2 = ពាក្យសម្ងាត់ត្រូវបានធ្វើបច្ចុប្បន្នភាព

## Password create page

pw-create-success-alert-2 = កំណត់ពាក្យសម្ងាត់

## Delete account page

delete-account-header =
    .title = លុបគណនី
delete-account-chk-box-4 =
    .label = ផ្នែកបន្ថែម និងរចនាប័ទ្មណាមួយដែលអ្នកបានបោះពុម្ពផ្សាយទៅ addons.mozilla.org នឹងត្រូវបានលុប
delete-account-cancel-button = បោះបង់
delete-account-delete-button-2 = លុប

## Display name page

cancel-display-name = បោះបង់

## Recent account activity
## All strings except title indicate an event that occurred from the user's account
## These are displayed as a list with the date when the event occured

recent-activity-account-password-changed = បានផ្លាស់ប្តូរពាក្យសម្ងាត់
recent-activity-must-reset-password = តម្រូវ​ឱ្យ​កំណត់​ពាក្យ​សម្ងាត់​ឡើង​វិញ

## PageRecoveryPhoneRemove
## Users reach this page from account settings when they want to remove a backup phone number.

# "Saved backup authentication codes" refers to previously saved backup authentication codes
settings-recovery-phone-remove-recovery-methods = ប្រសិនបើអ្នកលុបវាចោល ត្រូវប្រាកដថាអ្នកនៅតែមានលេខកូដផ្ទៀងផ្ទាត់បម្រុងទុក ដែលអ្នកបានរក្សាទុក។ <linkExternal>ប្រៀបធៀបវិធីសាស្ត្រសង្គ្រោះ</linkExternal>
settings-recovery-phone-remove-cancel = បោះបង់

## Add secondary email page

add-secondary-email-cancel-button = បោះបង់

## Verify secondary email page

verify-secondary-email-cancel-button = បោះបង់

##

# Link to delete account on main Settings page
delete-account-link = លុបគណនី

## Profile section

profile-heading = ប្រវត្តិរូប

## Security section of Setting

security-password =
    .header = ពាក្យ​សម្ងាត់

## Account recovery key sub-section on main Settings page

# Icon button to delete user's account recovery key. Text appears in tooltip on hover and as alt text for screen readers.
unit-row-recovery-key-delete-icon-button-title = លុបសោសង្គ្រោះគណនី

## Secondary email sub-section on main Settings page

# This string is used in a notification message near the top of the page.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
se-delete-email-successful-2 = បានលុប { $email } ដោយជោគជ័យ

## Connect Another Device page

# This link cancels the process of connecting another device, and takes the user back to Account Settings
connect-another-device-not-now-link = មិន​មែន​ឥឡូវ

## Index / home page

# When users delete their Mozilla account inside account Settings, they are redirected to this page with a success message
index-account-delete-success = បាន​លុប​គណនី​ដោយ​ជោគជ័យ

## InlineTotpSetup page
## TOTP (time-based one-time password) is a form of two-factor authentication (2FA).

inline-totp-setup-cancel-setup-button = បោះបង់ការដំឡើង

## AuthAllow page - Part of the device pairing flow

# Submit button to confirm that the user initiated the device pairing
# and that they approve of the new device being added to their account
pair-auth-allow-confirm-button = បាទ/ចាស៎ យល់ព្រមលើឧបករណ៍

## Pair index page

# This allows the user to exit the sync/pair flow, and redirects them back to Settings
pair-not-now-button = មិន​មែន​ឥឡូវ

## SuppAllow page - Part of the device pairing flow
## Users see this page when they have started to pair a second (or more) device to their account
## The pairing must be confirmed from both devices to succeed

pair-supp-allow-cancel-link = បោះបង់

## CompleteResetPassword component
## User followed a password reset link and is now prompted to create a new password

# A new password was successfully set for the user's account
# Displayed in an alert bar
complete-reset-password-success-alert = កំណត់ពាក្យសម្ងាត់

# ConfirmBackupCodeResetPassword page


## ResetPasswordRecoveryPhone page

reset-password-with-recovery-key-verified-page-title = កំណត់ពាក្យសម្ងាត់ឡើងវិញដោយជោគជ័យ
reset-password-complete-new-password-saved = ពាក្យសម្ងាត់ថ្មីត្រូវបានរក្សាទុក!

## Signin page

signin-password-button-label = ពាក្យ​សម្ងាត់
