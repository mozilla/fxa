# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.


## Banner component

resend-code-success-banner-heading = ਤੁਹਾਡੀ ਈਮੇਲ ਉੱਤੇ ਨਵਾਂ ਕੋਡ ਭੇਜਿਆ ਗਿਆ ਸੀ।
resend-link-success-banner-heading = ਤੁਹਾਡੀ ਈਮੇਲ ਉੱਤੇ ਨਵਾਂ ਲਿੰਕ ਭੇਜਿਆ ਗਿਆ ਸੀ।
# $accountsEmail is the Mozilla accounts sender email address (e.g. accounts@firefox.com)
resend-success-banner-description = ਸੁਚਾਰੂ ਡਿਲਵਰੀ ਯਕੀਨੀ ਬਣਾਉਣ ਵਾਸਤੇ { $accountsEmail } ਨੂੰ ਆਪਣੇ ਸੰਪਰਕਾਂ ਵਿੱਚ ਜੋੜੋ।

## Brand Messaging component
## Used to show in product messaging about upcoming brand changes

# This aria-label applies to the dismiss/close button of the banner
# This text is for screen-readers
brand-banner-dismiss-button-2 =
    .aria-label = ਬੈਨਰ ਬੰਦ ਕਰੋ
# This message is displayed as the title element in the banner, prior to actually launching the new brand
brand-prelaunch-title = 1 ਨਵੰਬਰ ਨੂੰ { -product-firefox-accounts } ਦਾ ਨਾਂ ਬਦਲ ਕੇ { -product-mozilla-accounts } ਕੀਤਾ ਜਾਵੇਗਾ
# This message is displayed as sub title element in the banner, giving a it more context about the brand changes.
brand-prelaunch-subtitle = ਤੁਸੀਂ ਹਾਲੇ ਵੀ ਉਸੇ ਵਰਤੋਂਕਾਰ-ਨਾਂ ਅਤੇ ਪਾਸਵਰਡ ਨੂੰ ਸਾਈਨ ਇਨ ਕਰਨ ਲਈ ਵਰਤੋਂਗੇ ਅਤੇ ਤੁਹਾਡੇ ਵਲੋਂ ਵਰਤੇ ਜਾਂਦੇ ਉਤਪਾਦਾਂ ਵਿੱਚ ਹੋਰ ਕੋਈ ਤਬਦੀਲੀ ਨਹੀਂ ਆਵੇਗੀ।
# This message is displayed as title element in the banner, after the brand changes take affect letting the user know that
# no action is required on their part
brand-postlaunch-title = { -product-firefox-accounts } ਖਾਤਿਆਂ ਦਾ ਨਾਂ ਬਦਲ ਕੇ { -product-mozilla-accounts } ਖਾਤੇ ਕਰ ਦਿੱਤਾ ਹੈ। ਤੁਸੀਂ ਹਾਲੇ ਵੀ ਉਸੇ ਵਰਤੋਂਕਾਰ-ਨਾਂ ਅਤੇ ਪਾਸਵਰਡ ਨੂੰ ਸਾਈਨ ਇਨ ਕਰਨ ਲਈ ਵਰਤੋਂਗੇ ਅਤੇ ਤੁਹਾਡੇ ਵਲੋਂ ਵਰਤੇ ਜਾਂਦੇ ਉਤਪਾਦਾਂ ਵਿੱਚ ਹੋਰ ਕੋਈ ਤਬਦੀਲੀ ਨਹੀਂ ਆਵੇਗੀ।
# This is an extra link element, that directs users to a page where they can learn more about the branding changes.
brand-learn-more = ਹੋਰ ਜਾਣੋ
# Alt text for close banner image
brand-close-banner =
    .alt = ਬੈਨਰ ਬੰਦ ਕਰੋ
# Alt text for 'm' logo in banner header
brand-m-logo =
    .alt = { -brand-mozilla } m ਲੋਗੋ

## ButtonBack component
## Allows users to click a back arrow to navigate to the previous page

button-back-aria-label = ਪਿੱਛੇ
button-back-title = ਪਿੱਛੇ

## ButtonDownloadRecoveryKeyPDF
## Clicking on this button downloads a PDF file that contains the user's account recovery key
## The account recovery key can be used to recover data when users forget their account password

# Button to download the account recovery key as a PDF file and navigate to the next step
# The next (and final) step is an optional prompt to save a storage hint
# .title will displayed as a tooltip on the button
recovery-key-download-button-v3 = ਡਾਊਨਲੋਡ ਅਤੇ ਜਾਰੀ ਰੱਖੋ
    .title = ਡਾਊਨਲੋਡ ਅਤੇ ਜਾਰੀ ਰੱਖੋ
recovery-key-pdf-heading = ਖਾਤਾ ਰਿਕਵਰੀ ਕੁੰਜੀ
# Date when the account recovery key was created and this file was downloaded
# { $date }: formatted date with 'medium' dateStyle format (e.g., for 'en': Jul 31, 2023)
recovery-key-pdf-download-date = ਤਿਆਰ ਕੀਤੀ: { $date }
# Shown directly above recovery key value and preceeded by a key icon
recovery-key-pdf-key-legend = ਖਾਤਾ ਰਿਕਵਰੀ ਕੁੰਜੀ
# This heading is shown above a list of options for storing the account recovery key
# "key" here refers to "account recovery key"
recovery-key-pdf-storage-ideas-heading = ਤੁਹਾਡੀ ਕੁੰਜੀ ਨੂੰ ਸੰਭਾਲਣ ਲਈ ਥਾਵਾਂ
# Followed by a link (https://mzl.la/3bNrM1I) to get more information and support
recovery-key-pdf-support = ਆਪਣੀ ਖਾਤਾ ਰਿਕਵਰੀ ਕੁੰਜੀ ਬਾਰੇ ਹੋਰ ਜਾਣੋ
# Error message displayed in an alert bar if the PDF download failed.
recovery-key-pdf-download-error = ਅਫ਼ਸੋਸ, ਤੁਹਾਡੀ ਖਾਤਾ ਰਿਕਵਰੀ ਕੁੰਜੀ ਡਾਊਨਲੋਡ ਕਰਨ ਦੌਰਾਨ ਸਮੱਸਿਆ ਆਈ ਸੀ।

## ChooseNewsletters component
## Checklist of newsletters that the user can choose to sign up to

# Prompt above a checklist of newsletters
choose-newsletters-prompt-2 = { -brand-mozilla } ਤੋਂ ਹੋਰ ਲਵੋ:
# Newsletter checklist item
choose-newsletters-option-latest-news =
    .label = ਸਾਡੀਆਂ ਨਵੀਆਂ ਖ਼ਬਰਾਂ ਅਤੇ ਉਤਪਾਦ ਅੱਪਡੇਟ ਲਵੋ
# Newsletter checklist item
choose-newsletters-option-test-pilot =
    .label = ਨਵੇਂ ਉਤਪਾਦਾਂ ਨੂੰ ਟੈਸਟ ਕਰਨ ਲਈ ਛੇਤੀ ਪਹੁੰਚ
# Newsletter checklist item. This for a Mozilla Foundation newsletters,
# "Action alerts" can be interpreted as "Calls to action"
choose-newsletters-option-reclaim-the-internet =
    .label = ਇੰਟਰਨੈੱਟ ਉੱਤੇ ਦਾਅਵਾ ਕਰਨ ਲਈ ਕਾਰਵਾਈ ਚੇਤਾਵਨੀਆਂ

## Tooltip notifications for actions performed on account recovery keys or one-time use codes

datablock-download =
    .message = ਡਾਊਨਲੋਡ ਕੀਤਾ
datablock-copy =
    .message = ਕਾਪੀ ਕੀਤਾ
datablock-print =
    .message = ਪਰਿੰਟ ਕੀਤਾ

## Success banners for datablock actions.
## $count – number of codes

datablock-copy-success =
    { $count ->
        [one] ਕੋਡ ਕਾਪੀ ਕੀਤਾ
       *[other] ਕੋਡ ਕਾਪੀ ਕੀਤੇ
    }
datablock-download-success =
    { $count ->
        [one] ਕੋਡ ਡਾਊਨਲੋਡ ਕੀਤਾ
       *[other] ਕੋਡ ਡਾਊਨਲੋਡ ਕੀਤੇ
    }
datablock-print-success =
    { $count ->
        [one] ਕੋਡ ਪਰਿੰਟ ਕੀਤਾ
       *[other] ਕੋਡ ਪਰਿੰਟ ਕੀਤੇ
    }

##

# Tooltip notification when an account recovery key or one-time use code is copied.
datablock-inline-copy =
    .message = ਕਾਪੀ ਕੀਤਾ

## DeviceInfoBlock component
## The strings here are used to display information about the origin of activity happening on a user's account
## For example, when connecting another device to the user's account

# Variables { $city }, { $region }, { $country } represent the estimated location of the user's device
# For example, 'Vancouver, British Columbia, Canada (estimated)'
device-info-block-location-city-region-country = { $city }, { $region }, { $country } (ਅੰਦਾਜ਼ਨ)
# Variables { $region }, { $country } represent the estimated location of the user's device
# For example, 'British Columbia, Canada (estimated)'
device-info-block-location-region-country = { $region }, { $country } (ਅੰਦਾਜ਼ਨ)
# Variables { $city }, { $country } represent the estimated location of the user's device
# For example, 'Vancouver, Canada (estimated)'
device-info-block-location-city-country = { $city }, { $country } (ਅੰਦਾਜ਼ਾਨ)
# Variable { $country } represent the estimated location of the user's device
# For example, 'Canada (estimated)'
device-info-block-location-country = { $country } (ਅੰਦਾਜ਼ਨ)
# When an approximate location for the user's device could not be determined
device-info-block-location-unknown = ਅਣਪਛਾਤਾ ਟਿਕਾਣਾ
# Variable { $browserName } is the browser that created the request (e.g., Firefox)
# Variable { $genericOSName } is the name of the operating system that created the request (e.g., MacOS, Windows, iOS)
device-info-browser-os = { $genericOSName } ਰਾਹੀਂ { $browserName }
# Variable { $ipAddress } represents the IP address where the request originated
# The IP address is a string of numbers separated by periods (e.g., 192.158.1.38)
device-info-ip-address = IP ਸਿਰਨਾਵਾਂ: { $ipAddress }

## FormPasswordInlineCriteria

form-password-with-inline-criteria-signup-new-password-label =
    .label = ਪਾਸਵਰਡ
form-password-with-inline-criteria-signup-confirm-password-label =
    .label = ਪਾਸਵਰਡ ਦੁਹਰਾਉ
form-password-with-inline-criteria-signup-submit-button = ਖਾਤਾ ਬਣਾਓ
form-password-with-inline-criteria-reset-new-password =
    .label = ਨਵਾਂ ਪਾਸਵਰਡ
form-password-with-inline-criteria-confirm-password =
    .label = ਪਾਸਵਰਡ ਨੂੰ ਤਸਦੀਕ ਕਰੋ
form-password-with-inline-criteria-reset-submit-button = ਨਵਾਂ ਪਾਸਵਰਡ ਬਣਾਓ
form-password-with-inline-criteria-set-password-new-password-label =
    .label = ਪਾਸਵਰਡ
form-password-with-inline-criteria-set-password-confirm-password-label =
    .label = ਪਾਸਵਰਡ ਦੁਹਰਾਓ
form-password-with-inline-criteria-set-password-submit-button = ਸਿੰਕ ਕਰਨਾ ਸ਼ੁਰੂ ਕਰੋ
form-password-with-inline-criteria-match-error = ਪਾਸਵਰਡ ਮਿਲਦੇ ਨਹੀਂ ਹਨ
form-password-with-inline-criteria-sr-too-short-message = ਪਾਸਵਰਡ ਘੱਟੋ-ਘੱਟ 8 ਅੱਖਰਾਂ ਦਾ ਹੋਣਾ ਚਾਹੀਦਾ ਹੈ।
form-password-with-inline-criteria-sr-not-email-message = ਪਾਸਵਰਡ ਤੁਹਾਡਾ ਈਮੇਲ ਸਿਰਨਾਵਾਂ ਨਹੀਂ ਰੱਖਦਾ ਹੋਣਾ ਚਾਹੀਦਾ ਹੈ।
form-password-with-inline-criteria-sr-not-common-message = ਪਾਸਵਰਡ ਆਮ ਤੌਰ ਉੱਤੇ ਵਰਤਿਆ ਪਾਸਵਰਡ ਨਹੀਂ ਹੋਣਾ ਚਾਹੀਦਾ ਹੈ।
form-password-with-inline-criteria-sr-requirements-met = ਦਿੱਤਾ ਪਾਸਵਰਡ ਸਾਰੀਆਂ ਪਾਸਵਰਡ ਸ਼ਰਤਾਂ ਨੂੰ ਪੂਰਾ ਕਰਦਾ ਹੈ।
form-password-with-inline-criteria-sr-passwords-match = ਦਿੱਤੇ ਗਏ ਪਾਸਵਰਡ ਮਿਲਦੇ ਹਨ।

## FormVerifyCode

# Fallback default localized error message for empty input field
form-verify-code-default-error = ਇਹ ਖੇਤਰ ਲੋੜੀਂਦਾ ਹੈ

## FormVerifyTotp component
## Form to enter a time-based one-time-passcode (e.g., 6-digit numeric code or 8-digit alphanumeric code)

# Information explaining why button is disabled, also read to screen readers
# Submit button is disabled unless a valid code format is entered
# Used when the code may only contain numbers
# $codeLength : number of digits in a valid code
form-verify-totp-disabled-button-title-numeric = ਜਾਰੀ ਰੱਖਣ ਲਈ { $codeLength }-ਅੰਕ ਦਿਓ
# Information explaining why button is disabled, also read to screen readers
# Submit button is disabled unless a valid code format is entered
# Used when the code may contain numbers and/or letters
# $codeLength : number of characters in a valid code
form-verify-totp-disabled-button-title-alphanumeric = ਜਾਰੀ ਰੱਖਣ ਲਈ { $codeLength }-ਅੱਖਰ ਦਿਓ

# GetDataTrio component, part of Account Recovery Key flow

get-data-trio-title-firefox = { -brand-firefox }
get-data-trio-title-firefox-recovery-key = { -brand-firefox } ਖਾਤਾ ਰਿਕਵਰੀ ਕੁੰਜੀ
get-data-trio-title-backup-verification-codes = ਬੈਕਅੱਪ ਪਰਮਾਣੀਕਰਨ ਕੋਡ
get-data-trio-download-2 =
    .title = ਡਾਊਨਲੋਡ
    .aria-label = ਡਾਊਨਲੋਡ ਕਰੋ
get-data-trio-copy-2 =
    .title = ਕਾਪੀ
    .aria-label = ਕਾਪੀ ਕਰੋ
get-data-trio-print-2 =
    .title = ਪਰਿੰਟ
    .aria-label = ਪਰਿੰਟ ਕਰੋ

## Images - these are all aria labels used for illustrations
## Aria labels are used as alternate text that can be read aloud by screen readers.

# Aria-label option for an alert symbol
alert-icon-aria-label =
    .aria-label = ਚੌਕਸੀ
# Aria-label option for an alert symbol
icon-attention-aria-label =
    .aria-label = ਸਾਵਧਾਨ
# Aria-label option for an alert symbol
icon-warning-aria-label =
    .aria-label = ਚੇਤਾਵਨੀ
authenticator-app-aria-label =
    .aria-label = ਪਰਮਾਣਿਕਰਤਾ ਐਪਲੀਕੇਸ਼ਨ
backup-codes-icon-aria-label-v2 =
    .aria-label = ਬੈਕਅੱਪ ਪਰਮਾਣੀਕਰਨ ਕੋਡ ਸਮਰੱਥ ਹੈ
backup-codes-disabled-icon-aria-label-v2 =
    .aria-label = ਬੈਕਅੱਪ ਪਰਮਾਣੀਕਰਨ ਕੋਡ ਅਸਮਰੱਥ ਹੈ
# An icon of phone with text message. A back recovery phone number
backup-recovery-sms-icon-aria-label =
    .aria-label = ਰਿਕਵਰੀ SMS ਸਮਰੱਥ ਹੈ
# Disabled version of backup-recovery-sms-icon-aria-label
backup-recovery-sms-disabled-icon-aria-label =
    .aria-label = ਰਿਕਵਰੀ SMS ਅਸਮਰੱਥ ਹੈ
# Used to select Canada as country code for phone number
canadian-flag-icon-aria-label =
    .aria-label = ਕੈਨੇਡੀਅਨ ਝੰਡਾ
# Used to  indicate a general checkmark, as in something checked off in a list!
checkmark-icon-aria-label =
    .aria-label = ਚੁਣੋ
# Used to  indicate a check mark for a successful state/action
checkmark-success-icon-aria-label =
    .aria-label = ਕਾਮਯਾਬ
# Used to indicate a check mark for an enabled state/option
checkmark-enabled-icon-aria-label =
    .aria-label = ਸਮਰੱਥ ਹੈ
# Used on X icon to dismiss a message such as an alert or banner
close-icon-aria-label =
    .aria-label = ਸੁਨੇਹਾ ਬੰਦ ਕਰੋ
# Used to decorate a code you enter for verification purposes
code-icon-aria-label =
    .aria-label = ਕੋਡ
error-icon-aria-label =
    .aria-label = ਗਲਤੀ
# Used as information icon for informative messaging
info-icon-aria-label =
    .aria-label = ਜਾਣਕਾਰੀ
# Used to select United States as a country code for phone number
usa-flag-icon-aria-label =
    .aria-label = ਸੰਯੁਕਤ ਰਾਜ ਅਮਰੀਕਾ ਦਾ ਝੰਡਾ

## Images - these are all aria labels used for illustrations
## Aria labels are used as alternate text that can be read aloud by screen readers.

hearts-broken-image-aria-label =
    .aria-label = ਕੰਪਿਊਟਰ ਤੇ ਮੋਬਾਈਲ ਫ਼ੋਨ ਅਤੇ ਦੋਵਾਂ ਉੱਤੇ ਟੁੱਟੇ ਹੋਏ ਦਿਲ ਦੀ ਤਸਵੀਰ
hearts-verified-image-aria-label =
    .aria-label = ਧੜਕਦੇ ਹੋਏ ਦਿਲ ਨਾਲ ਕੰਪਿਊਟਰ, ਮੋਬਾਈਲ ਫ਼ੋਨ ਤੇ ਟੈਬਲੇਟ
signin-recovery-code-image-description =
    .aria-label = ਦਸਤਾਵੇਜ਼, ਜਿਸ ਵਿੱਚ ਲੁਕਵੀ ਲਿਖਤ ਹੈ।
signin-totp-code-image-label =
    .aria-label = ਲੁਕੋਏ 6-ਅੰਕ ਕੋਡ ਨਾਲ ਡਿਵਾਈਸ
confirm-signup-aria-label =
    .aria-label = ਲਿੰਕ ਰੱਖਣ ਵਾਲਾ ਲਿਫ਼ਾਫ਼ਾ
# Used for an image of a key on a shield surrounded by 5 other icons representing information that can be recovered with the account recovery key.
# Other icons and their meaning: Gear (settings), star (favorites), clock (history), magnifying glass (search) and lock (passwords).
security-shield-aria-label =
    .aria-label = ਖਾਤਾ ਰਿਕਵਰੀ ਕੁੰਜੀ ਦਰਸਾਉਣ ਵਾਸਤੇ ਮਿਸਾਲ ਹੈ।
# Used for an image of a single key.
recovery-key-image-aria-label =
    .aria-label = ਖਾਤਾ ਰਿਕਵਰੀ ਕੁੰਜੀ ਦਰਸਾਉਣ ਵਾਸਤੇ ਮਿਸਾਲ ਹੈ।
password-image-aria-label =
    .aria-label = ਪਾਸਵਰਡ ਲਿਖਣ ਨੂੰ ਦਰਸਾਉਂਦੀ ਹੋਈ ਉਦਾਹਰਨ ਹੈ।
lightbulb-aria-label =
    .aria-label = ਸਟੋਰੇਜ਼ ਸੰਕੇਤ ਬਣਾਉਣ ਨੂੰ ਦਰਸਾਉਂਦੀ ਹੋਈ ਉਦਾਹਰਨ।
email-code-image-aria-label =
    .aria-label = ਕੋਡ ਰੱਖਣ ਵਾਲੀ ਈਮੇਲ ਨੂੰ ਦਰਸਾਉਂਦੀ ਹੋਈ ਉਦਾਹਰਨ।
recovery-phone-image-description =
    .aria-label = ਮੋਬਾਈਲ ਡਿਵਾਈਸ, ਜਿਸ ਉੱਤੇ ਟੈਕਸਟ ਸੁਨੇਹੇ ਰਾਹੀਂ ਕੋਡ ਪ੍ਰਾਪਤ ਕੀਤਾ।
recovery-phone-code-image-description =
    .aria-label = ਮੋਬਾਈਲ ਡਿਵਾਈਸ ਉੱਤੇ ਕੋਡ ਮਿਲਿਆ।
backup-recovery-phone-image-aria-label =
    .aria-label = SMS ਲਿਖਤ ਸੁਨੇਹੇ ਲੈਣ ਵਾਲਾ ਮੋਬਾਈਲ ਡਿਵਾਈਸ
backup-authentication-codes-image-aria-label =
    .aria-label = ਕੋਡਾਂ ਨਾਲ ਡਿਵਾਈਸ ਸਕਰੀਨ
sync-clouds-image-aria-label =
    .aria-label = ਸਿੰਕ ਆਈਕਾਨ ਨਾਲ ਕਲਾਉਡ

## InlineRecoveryKeySetupCreate component
## Users see this view when we prompt them to generate an account recovery key
## after signing in.

inline-recovery-key-setup-signed-in-firefox-2 = ਤੁਸੀਂ { -brand-firefox } ਵਿੱਚ ਸਾਈਨ ਇਨ ਕਰ ਚੁੱਕੇ ਹੋ।
inline-recovery-key-setup-create-header = ਆਪਣੇ ਖਾਤੇ ਨੂੰ ਸੁਰੱਖਿਅਤ ਕਰੋ
# This is a subheader asking users to create an account recovery key, indicating it will only take a moment to complete.
inline-recovery-key-setup-create-subheader = ਆਪਣੇ ਡਾਟੇ ਨੂੰ ਸੁਰੱਖਿਅਤ ਰੱਖਣ ਲਈ ਮਿੰਟ ਕੁ ਹੈ?
inline-recovery-key-setup-start-button = ਖਾਤਾ ਰਿਕਵਰੀ ਕੁੰਜੀ ਬਣਾਓ
inline-recovery-key-setup-later-button = ਇਸ ਨੂੰ ਬਾਅਦ 'ਚ ਕਰੋ

## Input Password

# Tooltip displayed on a password input visibility toggle. Expresses the toggle action, where clicking on the toggle will hide the password.
input-password-hide = ਪਾਸਵਰਡ ਲੁਕਾਓ
# Tooltip displayed on a password input visibility toggle. Expresses the toggle action, where clicking on the toggle will show the password.
input-password-show = ਪਾਸਵਰਡ ਵੇਖਾਓ
# Message read by screen readers when focus is on a password input visibility toggle. Expresses current (visible) state of the textbox content.
input-password-hide-aria-2 = ਤੁਹਾਡਾ ਪਾਸਵਰਡ ਇਸ ਵੇਲੇ ਸਕਰੀਨ ਉੱਤੇ ਦਿਖਾਈ ਦਿੰਦਾ ਹੈ।
# Message read by screen readers when focus is on a password input visibility toggle. Expresses current (hidden) state of the textbox content.
input-password-show-aria-2 = ਤੁਹਾਡਾ ਪਾਸਵਰਡ ਇਸ ਵੇਲੇ ਓਹਲੇ ਹੈ।
# Message read by screen readers after clicking on a password input visibility toggle to show the password. Expresses the new (visible) state of the textbox content.
input-password-sr-only-now-visible = ਤੁਹਾਡਾ ਪਾਸਵਰਡ ਇਸ ਵੇਲੇ ਸਕਰੀਨ ਉੱਤੇ ਦਿਖਾਈ ਦਿੰਦਾ ਹੈ।
# Message read by screen readers after clicking on a password input visibility toggle to hide the password. Expresses the new (hidden) state of the textbox content.
input-password-sr-only-now-hidden = ਤੁਹਾਡਾ ਪਾਸਵਰਡ ਹੁਣ ਲੁਕਵਾਂ ਹੈ।

## Phone number component

# This is an aria-label available to screen readers for a selection list that includes country flags, country name and country code
input-phone-number-country-list-aria-label = ਦੇਸ਼ ਚੁਣੋ
input-phone-number-enter-number = ਫ਼ੋਨ ਨੰਬਰ ਦਿਓ
input-phone-number-country-united-states = ਸੰਯਕੁਤ ਰਾਜ ਅਮਰੀਕਾ
input-phone-number-country-canada = ਕੈਨੇਡਾ
# Back button on legal/terms or legal/privacy that takes users to the previous page
legal-back-button = ਪਿੱਛੇ

## LinkDamaged component

# The user followed a password reset link that was received by email
# but the link is damaged (for example mistyped or broken by the email client)
reset-pwd-link-damaged-header = ਪਾਸਵਰਡ ਮੁੜ-ਸੈੱਟ ਲਿੰਕ ਖ਼ਰਾਬ ਹੋ ਗਿਆ
# The user followed a link to signin that was received by email
# but the link was damaged (for example mistyped or broken by the email client).
signin-link-damaged-header = ਤਸਦੀਕੀ ਲਿੰਕ ਖਰਾਬ ਸੀ
# The user followed a link to report an invalid signin attempt that was received by email
# but the link was damaged (for example mistyped or broken by the email client).
report-signin-link-damaged-header = ਨੁਕਸਾਨਿਆ ਲਿੰਕ
# The user followed a link received by email, but the link was damaged.
reset-pwd-link-damaged-message = ਤੁਹਾਡੇ ਵਲੋਂ ਕਲਿਕ ਕੀਤੇ ਗਏ ਲਿੰਕ ਵਿੱਚ ਅੱਖਰ ਗੁੰਮ ਹਨ ਅਤੇ ਤੁਹਾਡੇ ਈਮੇਲ ਕਲਾਇਟ ਵਲੋਂ ਖ਼ਰਾਬ ਕੀਤੇ ਗਏ ਹੋ ਸਕਦੇ ਹਨ। ਸਿਰਨਾਵਾਂ ਲਿੰਕ ਨੂੰ ਧਿਆਨ ਨਾਲ ਕਾਪੀ ਕਰੋ ਅਤੇ ਫੇਰ ਕੋਸ਼ਿਸ਼ ਕਰੋ।

## LinkExpired component

# Button to request a new link if the previous link that was emailed to the user is expired
link-expired-new-link-button = ਨਵਾਂ ਲਿੰਕ ਲਵੋ

## LinkRememberPassword component

# immediately before remember-password-signin-link
remember-password-text = ਤੁਹਾਡੇ ਪਾਸਵਰਡ ਨੂੰ ਯਾਦ ਰੱਖਣਾ ਹੈ?
# link navigates to the sign in page
remember-password-signin-link = ਸਾਈਨ ਇਨ

## LinkUsed component

# The user followed a primary email confirmation link, but that link is has been used and is no longer valid
primary-email-confirmation-link-reused = ਮੁੱਢਲਾ ਈਮੇਲ ਪਹਿਲਾਂ ਹੀ ਤਸਦੀਕ ਕੀਤਾ ਹੈ
# The user followed a sign-in confirmation link, but that link has been used and is no longer valid
signin-confirmation-link-reused = ਸਾਈਨ-ਇਨ ਨੂੰ ਪਹਿਲਾਂ ਹੀ ਤਸਦੀਕ ਕੀਤਾ ਹੈ
confirmation-link-reused-message = ਇਹ ਪੁਸ਼ਟੀ ਲਿੰਕ ਪਹਿਲਾਂ ਹੀ ਵਰਤਿਆ ਗਿਆ ਸੀ, ਅਤੇ ਸਿਰਫ਼ ਇੱਕ ਵਾਰ ਹੀ ਵਰਤਿਆ ਜਾ ਸਕਦਾ ਹੈ।

## Locale Toggle Component

locale-toggle-select-label = ਭਾਸ਼ਾ ਨੂੰ ਚੁਣੋ
# Users will see this heading when the URL or network request is malformed, e.g. a query parameter is required and is invalid
error-bad-request = ਖ਼ਰਾਬ ਬੇਨਤੀ

## PasswordInfoBalloon
## Balloon displayed next to password input field

password-info-balloon-why-password-info = ਸਾਡੇ ਕੋਲ ਸੰਭਾਲੇ ਹੋਏ ਤੁਹਾਡੇ ਕਿਸੇ ਵੀ ਇੰਕ੍ਰਿਪਟ ਹੋਏ ਡਾਟੇ ਨੂੰ ਵਰਤਣ ਲਈ ਤੁਹਾਨੂੰ ਇਹ ਪਾਸਵਰਡ ਚਾਹੀਦਾ ਹੈ।
password-info-balloon-reset-risk-info = ਮੁੜ-ਸੈੱਟ ਕਰਨ ਦਾ ਅਰਥ ਹੈ ਕਿ ਪਾਸਵਰਡ ਤੇ ਬੁੱਕਮਾਰਕਾਂ ਵਰਗੇ ਡੇਟੇ ਨੂੰ ਸੰਭਾਵਿਤ ਤੌਰ ਉੱਤੇ ਗੁਆ ਦੇਣਾ।

## PasswordStrengthInline component
## These strings are conditions that need to be met to qualify as a strong password

password-strength-short-instruction = ਕੋਈ ਮਜ਼ਬੂਤ ਪਾਸਵਰਡ ਚੁਣੋ:
password-strength-inline-min-length = ਘੱਟੋ-ਘੱਟ 8 ਅੱਖਰ
password-strength-inline-not-email = ਤੁਹਾਡਾ ਈਮੇਲ ਸਿਰਨਾਵਾਂ ਨਹੀਂ ਹੈ
password-strength-inline-not-common = ਕੋਈ ਆਮ ਵਰਤਿਆ ਪਾਸਵਰਡ ਨਹੀਂ ਹੈ
password-strength-inline-confirmed-must-match = ਨਵੇਂ ਪਾਸਵਰਡ ਮਿਲਦੇ ਹੋਣ ਦੀ ਤਸਦੀਕ
password-strength-inline-passwords-match = ਪਾਸਵਰਡ ਮਿਲਦੇ ਹਨ

## Notification Promo Banner component

account-recovery-notification-cta = ਬਣਾਓ
account-recovery-notification-header-value = ਜੇ ਤੁਸੀਂ ਆਪਣਾ ਪਾਸਵਰਡ ਭੁੱਲ ਜਾਓ ਤਾਂ ਆਪਣਾ ਡਾਟਾ ਨਾ ਗੁਆਓ
recovery-phone-promo-cta = ਰਿਕਵਰੀ ਫ਼ੋਨ ਨੂੰ ਜੋੜੋ
recovery-phone-promo-heading = ਰਿਕਵਰੀ ਫ਼ੋਨ ਨਾਲ ਆਪਣੇ ਖਾਤੇ ਵਿੱਚ ਵਾਧੂ ਸੁਰੱਖਿਆ ਜੋੜੋ
promo-banner-dismiss-button =
    .aria-label = ਬੈਨਰ ਨੂੰ ਖ਼ਾਰਜ ਕਰੋ

## Ready component

ready-complete-set-up-instruction = ਆਪਣੇ ਹੋਰ { -brand-firefox } ਡਿਵਾਈਸਾਂ ਉੱਤੇ ਆਪਣਾ ਨਵਾਂ ਪਾਸਵਰਡ ਭਰ ਕੇ ਸੈਟਅੱਪ ਪੂਰਾ ਕਰੋ।
manage-your-account-button = ਆਪਣੇ ਖਾਤੇ ਦਾ ਇੰਤਜ਼ਾਮ ਕਰੋ
# This is a string that tells the user they can use whatever service prompted them to reset their password or to verify their email
# Variables:
# { $serviceName } represents a product name (e.g., Mozilla VPN) that will be passed in as a variable
ready-use-service = ਤੁਸੀਂ ਹੁਣ { $serviceName } ਵਰਤਣ ਲਈ ਤਿਆਰ ਹੋ
# The user successfully accomplished a task (password reset, confirm email) that lets them use their account
ready-use-service-default = ਹੁਣ ਤੁਸੀਂ ਖਾਤਾ ਸੈਟਿੰਗਾਂ ਵਰਤਣ ਲਈ ਤਿਆਰ ਹੋ
# Message shown when the account is ready but the user is not signed in
ready-account-ready = ਤੁਹਾਡਾ ਖਾਤਾ ਤਿਆਰ ਹੈ!
ready-continue = ਜਾਰੀ ਰੱਖੋ
sign-in-complete-header = ਸਾਈਨ ਇਨ ਦੀ ਪੁਸ਼ਟੀ
sign-up-complete-header = ਖਾਤਾ ਤਸਦੀਕ ਕੀਤਾ
primary-email-verified-header = ਮੁੱਢਲੇ ਈਮੇਲ ਦੀ ਤਸਦੀਕ ਕੀਤੀ

## Users see this view when they are generating a new account recovery key
## This screen displays the generated key and allows users to download or copy the key

# This heading is shown above a list of options for storing the account recovery key
# "key" here refers to "account recovery key"
flow-recovery-key-download-storage-ideas-heading-v2 = ਤੁਹਾਡੀ ਕੁੰਜੀ ਨੂੰ ਸੰਭਾਲਣ ਲਈ ਥਾਵਾਂ:
flow-recovery-key-download-storage-ideas-folder-v2 = ਸੁਰੱਖਿਅਤ ਡਿਵਾਈਸ ਉੱਤੇ ਫੋਲਡਰ
flow-recovery-key-download-storage-ideas-cloud = ਭਰੋਸੇਯੋਗ ਕਲਾਉਡ ਸਟੋਰੇਜ਼
flow-recovery-key-download-storage-ideas-print-v2 = ਕਾਗਜ਼ ਉੱਤੇ ਪਰਿੰਟ ਕਰਕੇ ਰੱਖੋ
flow-recovery-key-download-storage-ideas-pwd-manager = ਪਾਸਵਰਡ ਮੈਨੇਜਰ

## RecoveryKeySetupHint
## This is the final step in the account recovery key creation flow after a Sync signin or in account settings
## Prompts the user to save an (optional) storage hint about the location of their account recovery key.

# The header of the last step in the account recovery key creation flow
# "key" here refers to the "account recovery key"
flow-recovery-key-hint-header-v2 = ਤੁਹਾਡੀ ਕੁੰਜੀ ਨੂੰ ਲੱਭਣ ਲਈ ਮਦਦ ਵਾਸਤੇ ਇਸ਼ਾਰਾ ਦਿਓ
# The label for the text input where the user types in the storage hint they want to save.
# The storage hint is optional, and users can leave this blank.
flow-recovery-key-hint-input-v2 =
    .label = ਇਸ਼ਾਰਾ ਦਿਓ (ਚੋਣਵਾਂ)
# The text of the "submit" button. Clicking on this button will save the hint (if provided) and exit the account recovery key creation flow.
# "Finish" refers to "Finish the account recovery key creation process"
flow-recovery-key-hint-cta-text = ਮੁਕੰਮਲ
# Error displayed in a tooltip if the hint entered by the user exceeds the character limit.
# "Hint" refers to "storage hint"
flow-recovery-key-hint-char-limit-error = ਇਸ਼ਾਰੇ ਵਿੱਚ 255 ਤੋਂ ਘੱਟ ਅੱਖਰ ਹੋਣੇ ਚਾਹੀਦੇ ਹਨ।

## ResetPasswordWarning component
## Warning shown to sync users that reset their password without using an account recovery key

password-reset-warning-icon = ਚੇਤਾਵਨੀ
password-reset-chevron-expanded = ਸਮੇਟਣ ਦੀ ਚੇਤਾਵਨੀ
password-reset-chevron-collapsed = ਫੈਲਾਓ ਦੀ ਚੇਤਾਵਨੀ
password-reset-data-may-not-be-recovered = ਸ਼ਾਇਦ ਤੁਹਾਡੇ ਬਰਾਊਜ਼ਰ ਡਾਟੇ ਨੂੰ ਰਿਕਵਰ ਨਹੀਂ ਕੀਤਾ ਜਾ ਸਕਦਾ
password-reset-previously-signed-in-device-2 = ਕੋਈ ਡਿਵਾਈਸ ਹੈ, ਜਿਸ ਉੱਤੇ ਤੁਸੀਂ ਪਹਿਲਾਂ ਸਾਈਨ ਇਨ ਕੀਤਾ ਸੀ?
password-reset-no-old-device-2 = ਨਵਾਂ ਡਿਵਾਈਸ ਤਾਂ ਹੈ, ਪਰ ਤੁਹਾਡੇ ਕੋਲ ਕਿਸੇ ਪੁਰਾਣੇ ਲਈ ਪਹੁੰਚ ਨਹੀਂ ਹੈ?
password-reset-encrypted-data-cannot-be-recovered-2 = ਸਾਨੂੰ ਅਫ਼ਸੋਸ ਹੈ, ਪਰ { -brand-firefox } ਸਰਵਰਾਂ ਉੱਤੇ ਤੁਹਾਡੇ ਇੰਕ੍ਰਿਪਟ ਹੋਏ ਬਰਾਊਜ਼ਰ ਡਾਟਾ ਨੂੰ ਬਹਾਲ ਨਹੀਂ ਕੀਤਾ ਜਾ ਸਕਦਾ ਹੈ।
password-reset-warning-have-key = ਖਾਤਾ ਰਿਕਵਰੀ ਕੁੰਜੀ ਹੈ?
password-reset-warning-use-key-link = ਇਸ ਨੂੰ ਹੁਣ ਆਪਣਾ ਪਾਸਵਰਡ ਮੁੜ-ਸੈੱਟ ਕਰਨ ਅਤੇ ਆਪਣਾ ਡਾਟਾ ਰੱਖਣ ਲਈ ਵਰਤੋਂ

## Alert Bar

alert-bar-close-message = ਸੁਨੇਹਾ ਬੰਦ ਕਰੋ

## User's avatar

avatar-your-avatar =
    .alt = ਤੁਹਾਡਾ ਰੂਪ
avatar-default-avatar =
    .alt = ਮੂਲ ਰੂਪ

##


# BentoMenu component

bento-menu-title-3 = { -brand-mozilla } ਉਤਪਾਦ
bento-menu-tagline = ਤੁਹਾਡੀ ਪਰਦੇਦਾਰੀ ਦੀ ਸੁਰੱਖਿਆ ਲਈ { -brand-mozilla } ਵਲੋਂ ਹੋਰ ਉਤਪਾਦ
bento-menu-vpn-2 = { -product-mozilla-vpn }
bento-menu-monitor-3 = { -product-mozilla-monitor }
bento-menu-firefox-relay-2 = { -product-firefox-relay }
bento-menu-firefox-desktop = { -brand-firefox } ਡੈਸਕਟਾਪ ਲਈ ਬਰਾਊਜ਼ਰ
bento-menu-firefox-mobile = { -brand-firefox } ਮੋਬਾਈਲ ਲਈ ਬਰਾਊਜ਼ਰ
bento-menu-made-by-mozilla = { -brand-mozilla } ਵਲੋਂ ਬਣਾਏ

## Connect another device promo

connect-another-fx-mobile = ਮੋਬਾਈਲ ਜਾਂ ਟੈਬਲੇਟ ਲਈ { -brand-firefox } ਲਵੋ
connect-another-find-fx-mobile-2 = { -google-play } ਅਤੇ { -app-store } ਵਿੱਚ { -brand-firefox } ਲੱਭੋ।
# Alt text for Google Play and Apple App store images that will be shown if the image can't be loaded.
# These images are used to encourage users to download Firefox on their mobile devices.
connect-another-play-store-image-2 =
    .alt = { -google-play } ਤੋਂ { -brand-firefox } ਨੂੰ ਡਾਊਨਲੋਡ ਕਰੋ
connect-another-app-store-image-3 =
    .alt = { -app-store } ਤੋਂ { -brand-firefox } ਨੂੰ ਡਾਊਨਲੋਡ ਕਰੋ

## Connected services section

cs-heading = ਕਨੈਕਟ ਹੋਈਆਂ ਸੇਵਾਵਾਂ
cs-description = ਹਰ ਚੀਜ਼ ਜੋ ਤੁਸੀਂ ਵਰਤ ਰਹੇ ਹੋ ਅਤੇ ਸਾਈਨ ਇਨ ਕੀਤਾ ਹੈ।
cs-cannot-refresh = ਅਫ਼ਸੋਸ ਹੈ ਕਿ ਕਨੈਕਟ ਹੋਈਆਂ ਸੇਵਾਵਾਂ ਦੀ ਸੂਚੀ ਨੂੰ ਤਾਜ਼ਾ ਕਰਨ ਲਈ ਸਮੱਸਿਆ ਆਈ ਸੀ।
cs-cannot-disconnect = ਕਲਾਈਂਟ ਨਹੀਂ ਲੱਭਿਆ, ਡਿਸਕਨੈਕਟ ਕਰਨ ਲਈ ਅਸਮਰੱਥ
# This string is used in a notification message near the top of the page.
# Variables:
#   $service (String) - the name of a device or service that uses Mozilla accounts
#                       (for example: "Firefox Lockwise")
cs-logged-out-2 = { $service } ਚੋਂ ਲਾਗ ਆਉਟ ਕੀਤਾ
cs-refresh-button =
    .title = ਕਨੈਕਟ ਹੋਈਆਂ ਸੇਵਾਵਾਂ ਨੂੰ ਤਾਜ਼ਾ ਕਰੋ
# Link text to a support page on missing or duplicate devices
cs-missing-device-help = ਗੁੰਮ ਜਾਂ ਡੁਪਲੀਕੇਟ ਚੀਜ਼ਾਂ ਹਨ?
cs-disconnect-sync-heading = ਸਿੰਕ ਤੋਂ ਡਿਸ-ਕਨੈਕਟ ਕਰੋ

## This string is used in a modal dialog when the user starts the disconnect from
## Sync process.
## Variables:
##   $device (String) - the name of a device using Mozilla accounts
##                      (for example: "Firefox Nightly on Google Pixel 4a")

cs-disconnect-sync-content-3 = ਤੁਹਾਡਾ ਬਰਾਊਜ਼ ਕਰਨ ਵਾਲਾ ਡਾਟਾ <span>{ $device }</span> ਉੱਤੇ ਰਹੇਗਾ, ਪਰ ਤੁਹਾਡੇ ਖਾਤੇ ਨਾਲ ਸਿੰਕ ਨਹੀਂ ਹੋਵੇਗਾ।
cs-disconnect-sync-reason-3 = <span>{ $device }</span> ਡਿਸ-ਕਨੈਕਟ ਕਰਨ ਦਾ ਮੁੱਖ ਕੀ ਕਾਰਨ ਹੈ?

## The following are the options for selecting a reason for disconnecting the
## device

cs-disconnect-sync-opt-prefix = ਇਹ ਡਿਵਾਈਸ ਹੈ:
cs-disconnect-sync-opt-suspicious = ਸ਼ੱਕੀ
cs-disconnect-sync-opt-lost = ਗੁਆਚਿਆ ਜਾਂ ਚੋਰੀ ਹੋਇਆ
cs-disconnect-sync-opt-old = ਪੁਰਾਣਾ ਜਾਂ ਬਦਲਿਆ
cs-disconnect-sync-opt-duplicate = ਡੁਪਲੀਕੇਟ
cs-disconnect-sync-opt-not-say = ਦੱਸਣਾ ਨਹੀਂ ਹੈ

##

cs-disconnect-advice-confirm = ਠੀਕ, ਸਮਝ ਗਏ
cs-disconnect-lost-advice-heading = ਗੁਆਚਿਆ ਜਾਂ ਚੋਰੀ ਹੋਇਆ ਡਿਵਾਈਸ ਡਿਸਕਨੈਕਟ ਕੀਤਾ
cs-disconnect-suspicious-advice-heading = ਸ਼ੱਕੀ ਡਿਵਾਈਸ ਡਿਸਕਨੈਕਟ ਕੀਤਾ
cs-sign-out-button = ਸਾਈਨ ਆਉਟ

## Data collection section

dc-heading = ਡਾਟਾ ਇਕੱਤਰਤਾ ਅਤੇ ਵਰਤੋਂ
dc-subheader-moz-accounts = { -product-mozilla-accounts }
dc-subheader-ff-browser = { -brand-firefox } ਬਰਾਊਜ਼ਰ
dc-subheader-content-2 = { -product-mozilla-accounts } ਨੂੰ { -brand-mozilla } ਵੱਲ ਤਕਨੀਕੀ ਅਤੇ ਤਾਲਮੇਲ ਡਾਟਾ ਭੇਜਣ ਦੀ ਇਜਾਜ਼ਤ ਦਿਓ।
dc-opt-in-success-2 = ਮੇਹਰਬਾਨੀ! ਇਹ ਡਾਟਾ ਸਾਂਝਾ ਕਰਨਾ { -product-mozilla-accounts } ਵਧੀਆ ਬਣਾਉਣ ਲਈ ਸਾਡੀ ਮਦਦ ਕਰਦਾ ਹੈ।
dc-opt-in-out-error-2 = ਅਫ਼਼ਸੋਸ, ਤੁਹਾਡੀ ਡਾਟਾ ਇਕੱਤਰ ਕਰਨ ਦੀ ਪਸੰਦ ਬਦਲਣ ਦੌਰਾਨ ਸਮੱਸਿਆ ਸੀ
dc-learn-more = ਹੋਰ ਜਾਣੋ

# DropDownAvatarMenu component

drop-down-menu-title-2 = { -product-mozilla-account } ਮੇਨੂ
# This is displayed in the Settings menu after user's click on their profile icon.
# Following this string on a new line will be their display name (user's name or email)
drop-down-menu-signed-in-as-v2 = ਇਸ ਵਜੋਂ ਸਾਈਨ-ਇਨ ਕੀਤਾ
drop-down-menu-sign-out = ਸਾਈਨ ਆਉਟ
drop-down-menu-sign-out-error-2 = ਅਫ਼ਸੋਸ ਹੈ ਕਿ ਤੁਹਾਨੂੰ ਸਾਈਨ ਆਉਟ ਕਰਨ ਦੌਰਾਨ ਸਮੱਸਿਆ ਆਈ ਸੀ

## Flow Container

flow-container-back = ਪਿੱਛੇ

## FlowRecoveryKeyConfirmPwd - Second view in the PageRecoveryKeyCreate flow
## Users see this view when they are generating a new account recovery key
## This screen asks the user to confirm their password before generating a new key

flow-recovery-key-confirm-pwd-heading-v2 = ਸੁਰੱਖਿਆ ਲਈ ਆਪਣਾ ਪਾਸਵਰਡ ਫੇਰ ਭਰੋ
flow-recovery-key-confirm-pwd-input-label = ਆਪਣਾ ਪਾਸਵਰਡ ਦਿਓ
# Clicking on this button will check the password and create an account recovery key
flow-recovery-key-confirm-pwd-submit-button = ਖਾਤਾ ਰਿਕਵਰੀ ਕੁੰਜੀ ਬਣਾਓ
# For users with an existing account recovery key, clicking on this button will
# check the password, delete the existing key and create a new account recovery key
flow-recovery-key-confirm-pwd-submit-button-change-key = ਆਪਣੀ ਨਵੀਂ ਖਾਤਾ ਰਿਕਵਰੀ ਕੁੰਜੀ ਬਣਾਓ

## FlowRecoveryKeyDownload - Third view in the PageRecoveryKeyCreate flow
## Users see this view when they are generating a new account recovery key
## This screen displays the generated key and allows users to download or copy the key

flow-recovery-key-download-heading-v2 = ਖਾਤਾ ਰਿਕਵਰੀ ਕੁੰਜੀ ਬਣਾਈ ਗਈ — ਇਸ ਨੂੰ ਹੁਣ ਡਾਊਨਲੋਡ ਕਰਕੇ ਸੰਭਾਲੋ
# This link allows user to proceed to the next step without clicking the download button
flow-recovery-key-download-next-link-v2 = ਬਿਨਾਂ ਡਾਊਨਲੋਡ ਕੀਤੇ ਹੀ ਜਾਰੀ ਰੱਖੋ

## FlowRecoveryKeyHint
## This is the fourth and final step in the account recovery key creation flow in account settings
## Prompts the user to save an (optional) storage hint about the location of their account recovery key.

# Success message displayed in alert bar after the user has finished creating an account recovery key.
flow-recovery-key-success-alert = ਖਾਤਾ ਰਿਕਵਰੀ ਕੁੰਜੀ ਬਣਾਈ ਗਈ

## FlowRecoveryKeyInfo - First view in the PageRecoveryKeyCreate flow

# The header of the first view in the Recovery Key Create flow
flow-recovery-key-info-header = ਜੇ ਤੁਸੀਂ ਆਪਣਾ ਪਾਸਵਰਡ ਭੁੱਲ ਜਾਂਦੇ ਹੋ ਤਾਂ ਵਰਤਣ ਲਈ ਖਾਤਾ ਰਿਕਵਰੀ ਕੁੰਜੀ ਬਣਾਓ
# The header of the first view in the Recovery Key Create flow when replacing an existing recovery key
flow-recovery-key-info-header-change-key = ਆਪਣੀ ਖਾਤਾ ਰਿਕਵਰੀ ਕੁੰਜੀ ਬਦਲੋ
# In the first view of the PageRecoveryKeyCreate flow, this is the first of two bullet points explaining why the user should create an account recovery key
flow-recovery-key-info-shield-bullet-point-v2 = ਅਸੀਂ ਤੁਹਾਡੇ ਬਰਾਊਜ਼ ਕਰਨ ਵਾਲੇ ਡਾਟੇ –– ਪਾਸਵਰਡਾਂ, ਬੁੱਕਮਾਰਕਾਂ ਤੇ ਹੋਰ ਚੀਜ਼ਾਂ ਨੂੰ ਇੰਕ੍ਰਿਪਟ ਕਰਦੇ ਹਾਂ। ਇਹ ਪਰਦੇਦਾਰੀ ਲਈ ਤਾਂ ਬਹੁਤ ਵਧੀਆ ਹੈ, ਪਰ ਜੇ ਤੁਸੀਂ ਆਪਣਾ ਪਾਸਵਰਡ ਭੁੱਲ ਗਏ ਤਾਂ ਅਸੀਂ ਤੁਹਾਡੇ ਡਾਟੇ ਨੂੰ ਬਹਾਲ ਨਹੀਂ ਕਰ ਸਕਾਂਗੇ।
# In the first view of the PageRecoveryKeyCreate flow, this is the second of two bullet points explaining why the user should create an account recovery key
flow-recovery-key-info-key-bullet-point-v2 = ਇਸ ਕਰਕੇ ਖਾਤਾ ਰਿਕਵਰੀ ਕੁੰਜੀ ਬਣਾਉਣ ਬਹੁਤ ਜ਼ਰੂਰੀ ਹੈ –– ਤੁਸੀਂ ਇਸ ਨੂੰ ਆਪਣਾ ਡਾਟਾ ਵਾਪਸ ਹਾਸਲ ਕਰਨ ਲਈ ਵਰਤ ਸਕਦੇ ਹੋ।
# The text of the "submit" button to start creating (or changing) an account recovery key
flow-recovery-key-info-cta-text-v3 = ਸ਼ੁਰੂ ਕਰੀਏ
# Link to cancel account recovery key change and return to settings
flow-recovery-key-info-cancel-link = ਰੱਦ ਕਰੋ

## FlowSetup2faApp

flow-setup-2fa-qr-heading = ਆਪਣੀ ਪਰਮਾਣੀਕਰਨ ਐਪ ਨਾਲ ਕਨੈਕਟ ਕਰੋ
# DEV NOTE: "2a" in the id should be "2fa". This typo is kept intentionally to
# avoid losing existing translations; fix it when creating a new version of
# this string.
flow-setup-2a-qr-instruction = <strong>ਪੜਾਅ 1:</strong> ਕਿਸੇ ਵੀ ਪਰਮਾਣੀਕਰਨ ਐਪ ਜਿਵੇਂ Duo ਜਾਂ Google Authenticator ਆਦਿ ਨਾਲ ਇਹ QR ਕੋਡ ਸਕੈਨ ਕਰੋ।
flow-setup-2fa-cant-scan-qr-button = QR ਕੋਡ ਸਕੈਨ ਨਹੀਂ ਕਰ ਸਕਦੇ?
flow-setup-2fa-manual-key-heading = ਖੁਦ ਕੋਡ ਭਰੋ
flow-setup-2fa-manual-key-instruction = <strong> ਪੜਾਅ 1:</strong> ਇਹ ਕੋਡ ਨੂੰ ਆਪਣੀ ਪਸੰਦੀਦਾ ਪਰਮਾਣੀਕਰਨ ਐਪ ਵਿੱਚ ਭਰੋ।
flow-setup-2fa-scan-qr-instead-button = ਇਸ ਬਜਾਏ QR ਕੋਡ ਸਕੈਨ ਕਰਨਾ ਹੈ?
# links to https://support.mozilla.org/kb/secure-firefox-account-two-step-authentication#w_step-one
flow-setup-2fa-more-info-link = ਪਰਮਾਣੀਕਰਨ ਐਪਾਂ ਬਾਰੇ ਹੋਰ ਜਾਣੋ
flow-setup-2fa-button = ਜਾਰੀ ਰੱਖੋ
flow-setup-2fa-step-2-instruction = <strong>ਪੜਾਅ 2:</strong> ਆਪਣੀ ਪਰਮਾਣੀਕਰਨ ਐਪ ਤੋਂ ਕੋਡ ਦਿਓ।
flow-setup-2fa-input-label = 6-ਅੰਕ ਦਾ ਕੋਡ ਦਿਓ
flow-setup-2fa-code-error = ਗ਼ੈਰ-ਵਾਜਬ ਜਾਂ ਮਿਆਦ ਪੁੱਗੀ ਵਾਲਾ ਕੋਡ ਹੈ। ਆਪਣੀ ਪਰਮਾਣੀਕਰਨ ਐਪ ਦੀ ਜਾਂਚ ਕਰਕੇ ਫੇਰ ਕੋਸ਼ਿਸ਼ ਕਰੋ।

## The step to choose the two step authentication method in the two step
## authentication setup flow.

flow-setup-2fa-backup-choice-heading = ਕਿਸੇ ਰਿਕਵਰੀ ਢੰਗ ਨੂੰ ਚੁਣੋ
flow-setup-2fa-backup-choice-phone-title = ਰਿਕਵਰੀ ਫ਼ੋਨ
flow-setup-2fa-backup-choice-phone-badge = ਸਭ ਤੋਂ ਸੌਖਾ
flow-setup-2fa-backup-choice-code-title = ਬੈਕਅੱਪ ਪਰਮਾਣੀਕਰਨ ਕੋਡ
flow-setup-2fa-backup-choice-code-badge = ਸਭ ਤੋਂ ਸੁਰੱਖਿਅਤ

## The backup code confirm step of the setup 2 factor authentication flow,
## where the user confirm that they have saved their backup authentication codes
## by entering one of them.

flow-setup-2fa-backup-code-confirm-heading = ਬੈਕਅੱਪ ਪਰਮਾਣੀਕਰਨ ਕੋਡ ਦਿਓ
flow-setup-2fa-backup-code-confirm-code-input = 10-ਅੰਕ ਦਾ ਕੋਡ ਦਿਓ
# Clicking on this button finishes the whole flow upon success.
flow-setup-2fa-backup-code-confirm-button-finish = ਮੁਕੰਮਲ

## The backup codes download step of the setup 2 factor authentication flow

flow-setup-2fa-backup-code-dl-heading = ਬੈਕਅੱਪ ਪਰਮਾਣੀਕਰਨ ਕੋਡ ਨੂੰ ਸੰਭਾਲੋ
flow-setup-2fa-backup-code-dl-button-continue = ਜਾਰੀ ਰੱਖੋ

##

flow-setup-2fa-inline-complete-success-banner = ਦੋ-ਪੜਾਵੀਂ ਪਰਮਾਣਕਿਤਾ ਸਮਰੱਥ ਹੈ
flow-setup-2fa-inline-complete-backup-code = ਬੈਕਅੱਪ ਪਰਮਾਣੀਕਰਨ ਕੋਡ
flow-setup-2fa-inline-complete-backup-phone = ਰਿਕਵਰੀ ਫ਼ੋਨ
# $count (Number) - an integer representing the number of backup
# authentication codes remaining
flow-setup-2fa-inline-complete-backup-code-info =
    { $count ->
        [one] { $count } ਕੋਡ ਬਾਕੀ ਹੈ
       *[other] { $count } ਕੋਡ ਬਾਕੀ ਹਨ
    }
flow-setup-2fa-inline-complete-backup-code-description = ਜੇ ਤੁਸੀਂ ਆਪਣੇ ਮੋਬਾਈਲ ਡਿਵਾਈਸ ਜਾਂ ਪਰਮਾਣੀਕਰਨ ਐਪ ਨਾਲ ਸਾਈਨ ਇਨ ਨਹੀਂ ਕਰ ਸਕਦੇ ਤਾਂ ਇਹ ਸਭ ਤੋਂ ਸੁਰੱਖਿਅਤ ਢੰਗ ਹੈ।
flow-setup-2fa-inline-complete-backup-phone-description = ਜੇ ਤੁਸੀਂ ਆਪਣੀ ਪਰਮਾਣੀਕਰਨ ਐਪ ਨਾਲ ਸਾਈਨ ਇਨ ਨਹੀਂ ਕਰ ਸਕਦੇ ਤਾਂ ਇਹ ਸਭ ਤੋਂ ਸੌਖਾ ਰਿਕਵਰੀ ਢੰਗ ਹੈ।
flow-setup-2fa-inline-complete-learn-more-link = ਇਹ ਤੁਹਾਡੇ ਖਾਤੇ ਨੂੰ ਸੁਰੱਖਿਅਤ ਕਿਵੇਂ ਕਰਦਾ ਹੈ
# $serviceName (String) - the name of the product that the user will be
# redirected to.
flow-setup-2fa-inline-complete-continue-button = { $serviceName } ਨਾਲ ਜਾਰੀ ਰੱਖੋ
flow-setup-2fa-prompt-heading = ਦੋ-ਪੜਾਵੀ ਪਰਮਾਣੀਕਰਨ ਨੂੰ ਸੈਟ ਅੱਪ ਕਰੋ
# Variable { $serviceName } is the name of the product (e.g. Firefox Add-ons)
# that requests two-step authentication setup.
flow-setup-2fa-prompt-description = ਤੁਹਾਡੇ ਖਾਤੇ ਨੂੰ ਸੁਰੱਖਿਅਤ ਰੱਖਣ ਵਾਸਤੇ { $serviceName } ਵਲੋਂ ਤੁਹਾਨੂੰ ਦੋ-ਪੜਾਵੀਂ ਪਰਮਾਣੀਕਰਨ ਸੈਟਅੱਪ ਕਰਨਾ ਲਾਜ਼ਮੀ ਕੀਤਾ ਹੈ।
flow-setup-2fa-prompt-continue-button = ਜਾਰੀ ਰੱਖੋ

## FlowSetupPhoneConfirmCode

# verification code refers to a code sent by text message to confirm phone number ownership
# and complete setup
flow-setup-phone-confirm-code-heading = ਤਸਦੀਕੀ ਕੋਡ ਦਿਓ
# $phoneNumber is a partially obfuscated phone number with only the last 4 digits showing (e.g., *** *** 1234)
# span element applies formatting to ensure the number is always displayed left-to-right
flow-setup-phone-confirm-code-instruction = ਛੇ ਅੱਖਰਾਂ ਦਾ ਕੋਡ <span>{ $phoneNumber }</span> ਉੱਤੇ ਟੈਕਸਟ ਸੁਨੇਹਾ ਭੇਜਿਆ ਗਿਆ ਸੀ। ਇਹ ਕੋਡ ਦੀ ਮਿਆਦ 5 ਮਿੰਟ ਹੈ।
flow-setup-phone-confirm-code-input-label = 6-ਅੰਕ ਦਾ ਕੋਡ ਦਿਓ
flow-setup-phone-confirm-code-button = ਤਸਦੀਕ
# button to resend a code by text message to the user's phone
# followed by a button to resend a code
flow-setup-phone-confirm-code-expired = ਕੋਡ ਦੀ ਮਿਆਦ ਪੁੱਗੀ?
flow-setup-phone-confirm-code-resend-code-button = ਕੋਡ ਮੁੜ ਕੇ ਭੇਜੋ
flow-setup-phone-confirm-code-resend-code-success = ਕੋਡ ਭੇਜਿਆ
flow-setup-phone-confirm-code-success-message-v2 = ਰਿਕਵਰੀ ਫ਼ੋਨ ਜੋੜਿਆ ਗਿਆ
flow-change-phone-confirm-code-success-message = ਰਿਕਵਰੀ ਫ਼ੋਨ ਨੂੰ ਬਦਲਿਆ ਗਿਆ ਹੈ

## FlowSetupPhoneConfirmCode

flow-setup-phone-submit-number-heading = ਆਪਣੇ ਫ਼ੋਨ ਨੰਬਰ ਦੀ ਜਾਂਚ ਕਰੋ
# The initial rollout of the recovery phone is only available to users with US and Canada mobile phone numbers.
# Voice over Internet Protocol (VoIP), is a technology that uses a broadband Internet connection instead of a regular (or analog) phone line to make calls.
# Phone mask services (for example Relay) provide a temporary virtual number to avoid providing a real phone number.
# Both VoIP and phone masks can be unreliable for one-time-passcode (OTP) verification
flow-setup-phone-submit-number-info-message-v2 = ਰਿਕਵਰੀ ਫ਼ੋਨ ਸਿਰਫ਼ ਸੰਯੁਕਤ ਰਾਜ ਅਮਰੀਕਾ ਅਤੇ ਕੈਨੇਡਾ ਵਿੱਚ ਹੀ ਮੌਜੂਦ ਹੈ। voIP ਨੰਬਰ ਅਤੇ ਫ਼ੋਨ ਮਾਸਕਾਂ ਦੀ ਸਿਫ਼ਾਰਸ਼ ਨਹੀਂ ਕੀਤੀ ਜਾਂਦੀ ਹੈ।
flow-setup-phone-submit-number-legal = ਆਪਣਾ ਨੰਬਰ ਦੇ ਕੇ ਤੁਸੀਂ ਸਾਨੂੰ ਇਹ ਸੰਭਾਲਣ ਲਈ ਸਹਿਮਤ ਹੋ ਤਾਂ ਕਿ ਅਸੀਂ ਤੁਹਾਨੂੰ ਸਿਰਫ਼ ਖਾਤੇ ਨੂੰੀ ਤਸਦੀਕ ਕਰਨ ਵਾਸਤੇ ਸੁਨੇਹਾ ਭੇਜ ਸਕੀਏ। ਸੁਨੇਹਾ ਅਤੇ ਡਾਟਾ ਖ਼ਰਚੇ ਲਾਗੂ ਹੋ ਸਕਦੇ ਹਨ।
# cliking on the button sends a code by text message to the phone number typed in by the user
flow-setup-phone-submit-number-button = ਕੋਡ ਭੇਜੋ

## HeaderLockup component, the header in account settings

header-menu-open = ਮੇਨੂ ਬੰਦ ਕਰੋ
header-menu-closed = ਸਾਈਟ ਨੇਵੀਗੇਸ਼ਨ ਮੇਨੂ
header-back-to-top-link =
    .title = ਸਿਖਰ ਉੱਤੇ ਜਾਓ
header-back-to-settings-link =
    .title = { -product-mozilla-account } ਸੈਟਿੰਗਾਂ ਉੱਤੇ ਵਾਪਸ ਜਾਓ
header-title-2 = { -product-mozilla-account }
header-help = ਮਦਦ

## Linked Accounts section

la-heading = ਲਿੰਕ ਕੀਤੇ ਖਾਤੇ
la-description = ਤੁਹਾਡੇ ਕੋਲ ਇਹਨਾਂ ਖਾਤਿਆਂ ਲਈ ਅਧਿਕਾਰਿਤ ਪਹੁੰਚ ਹੈ।
la-unlink-button = ਅਣ-ਲਿੰਕ ਕਰੋ
la-unlink-account-button = ਅਣ-ਲਿੰਕ ਕਰੋ
la-set-password-button = ਪਾਸਵਰਡ ਲਾਓ
la-unlink-heading = ਤੀਜੀ ਧਿਰ ਦੇ ਖਾਤੇ ਤੋਂ ਅਣ-ਲਿੰਕ ਕਰੋ
nav-linked-accounts = { la-heading }

## Modal - Default values for a message directed at the user where the user can typically Confirm or Cancel.

modal-close-title = ਬੰਦ ਕਰੋ
modal-cancel-button = ਰੱਦ ਕਰੋ
modal-default-confirm-button = ਤਸਦੀਕ

## ModalMfaProtected

modal-mfa-protected-title = ਤਸਦੀਕੀ ਕੋਡ ਦਿਓ
modal-mfa-protected-input-label = 6-ਅੰਕ ਦਾ ਕੋਡ ਦਿਓ
modal-mfa-protected-cancel-button = ਰੱਦ ਕਰੋ
modal-mfa-protected-confirm-button = ਤਸਦੀਕ
modal-mfa-protected-code-expired = ਕੋਡ ਦੀ ਮਿਆਦ ਪੁੱਗੀ?
# Link to resend a new code to the user's email.
modal-mfa-protected-resend-code-link = ਨਵਾਂ ਕੋਡ ਈਮੇਲ ਕਰੋ।

## Modal Verify Session

mvs-verify-your-email-2 = ਆਪਣੇ ਈਮੇਲ ਦੀ ਤਸਦੀਕ ਕਰੋ
mvs-enter-verification-code-2 = ਆਪਣਾ ਤਸਦੀਕੀ ਕੋਡ ਦਿਓ
# This string is used to show a notification to the user for them to enter confirmation code to confirm their email.
# Variables:
#   email (String) - the user's email
mvs-enter-verification-code-desc-2 = <email>{ $email }</email> ਉੱਤੇ ਭੇਜੇ ਗਏ ਤਸਦੀਕੀਕਰਨ ਕੋਡ ਨੂੰ 5 ਮਿੰਟ ਦੇ ਵਿੱਚ ਵਿੱਚ ਭਰੋ।
msv-cancel-button = ਰੱਦ ਕਰੋ
msv-submit-button-2 = ਤਸਦੀਕ

## Settings Nav

nav-settings = ਸੈਟਿੰਗਾਂ
nav-profile = ਪਰੋਫਾਇਲ
nav-security = ਸੁਰੱਖਿਆ
nav-connected-services = ਕਨੈਕਟ ਹੋਈਆਂ ਸੇਵਾਵਾਂ
nav-data-collection = ਡਾਟਾ ਇਕੱਤਰਤਾ ਅਤੇ ਵਰਤੋਂ
nav-paid-subs = ਭੁਗਤਾਨ ਕੀਤੀਆਂ ਮੈਂਬਰੀਆਂ
nav-email-comm = ਈਮੇਲ ਪੱਤਰ-ਵਿਹਾਰ

## Page2faChange

page-2fa-change-title = ਦੋ-ਪੜਾਵੀਂ ਪਰਮਾਣੀਕਰਨ ਨੂੰ ਬਦਲੋ
page-2fa-change-success = ਦੋ-ਪੜਾਵੀਂ ਪਰਮਾਣਕਿਤਾ ਨੂੰ ਅੱਪਡੇਟ ਕੀਤਾ ਗਿਆ ਹੈ

## Two Step Authentication - replace backup authentication code

# Page title
tfa-backup-codes-page-title = ਬੈਕਅੱਪ ਪਰਮਾਣੀਕਰਨ ਕੋਡ
# Error shown when API call fails while replacing existing backup codes
tfa-replace-code-error-3 = ਤੁਹਾਡੇ ਬੈਕਅੱਪ ਪਰਮਾਣੀਕਰਨ ਕੋਡ ਬਦਲਣ ਦੌਰਾਨ ਸਮੱਸਿਆ ਆਈ ਸੀ
# Error shown when API call fails while creating new backup codes (user had none)
tfa-create-code-error = ਤੁਹਾਡੇ ਬੈਕਅੱਪ ਪਰਮਾਣੀਕਰਨ ਕੋਡ ਬਣਾਉਣ ਦੌਰਾਨ ਸਮੱਸਿਆ ਆਈ ਸੀ
# Success message shown in alert bar after successfully replacing existing backup codes
tfa-replace-code-success-alert-4 = ਬੈਕਅੱਪ ਪਰਮਾਣੀਕਰਨ ਕੋਡ ਅੱਪਡੇਟ ਕੀਤੇ ਗਏ

## Avatar change page

avatar-page-title =
    .title = ਪਰੋਫਾਈਲ ਤਸਵੀਰ
avatar-page-add-photo = ਫੋਟੋ ਜੋੜੋ
avatar-page-add-photo-button =
    .title = { avatar-page-add-photo }
avatar-page-take-photo = ਫੋਟੋ ਲਵੋ
avatar-page-take-photo-button =
    .title = { avatar-page-take-photo }
avatar-page-remove-photo = ਫੋਟੋ ਨੂੰ ਹਟਾਓ
avatar-page-remove-photo-button =
    .title = { avatar-page-remove-photo }
avatar-page-retake-photo = ਫੋਟੋ ਮੁੜ ਲਵੋ
avatar-page-cancel-button = ਰੱਦ ਕਰੋ
avatar-page-save-button = ਸੰਭਾਲੋ
avatar-page-saving-button = …ਸੰਭਾਲਿਆ ਜਾ ਰਿਹਾ ਹੈ
avatar-page-zoom-out-button =
    .title = ਜ਼ੂਮ ਆਉਟ
avatar-page-zoom-in-button =
    .title = ਜ਼ੂਮ ਇਨ
avatar-page-rotate-button =
    .title = ਘੁੰਮਾਓ
avatar-page-camera-error = ਕੈਮਰਾ ਚਾਲੂ ਨਹੀਂ ਕੀਤਾ ਜਾ ਸਕਿਆ
avatar-page-new-avatar =
    .alt = ਨਵੀਂ ਪਰੋਫਾਈਲ ਤਸਵੀਰ
avatar-page-file-upload-error-3 = ਤੁਹਾਡੀ ਪਰੋਫਾਈਲ ਤਸਵੀਰ ਅੱਪਲੋਡ ਕਰਨ ਦੌਰਾਨ ਸਮੱਸਿਆ ਸੀ।
avatar-page-delete-error-3 = ਤੁਹਾਡੀ ਪਰੋਫਾਈਲ ਤਸਵੀਰ ਹਟਾਉਣ ਦੌਰਾਨ ਸਮੱਸਿਆ ਸੀ
avatar-page-image-too-large-error-2 = ਅੱਪਲੋਡ ਕਰਨ ਲਈ ਚਿੱਤਰ ਤਸਵੀਰ ਬਹੁਤ ਵੱਡੀ ਹੈ

## Password change page

pw-change-header =
    .title = ਪਾਸਵਰਡ ਬਦਲੋ
pw-8-chars = ਘੱਟੋ-ਘੱਟ 8 ਅੱਖਰ
pw-not-email = ਤੁਹਾਡਾ ਈਮੇਲ ਸਿਰਨਾਵਾਂ ਨਹੀਂ ਹੈ
pw-change-must-match = ਨਵੇਂ ਪਾਸਵਰਡ ਮਿਲਦੇ ਹੋਣ ਦੀ ਤਸਦੀਕ ਕਰੋ
pw-commonly-used = ਕੋਈ ਆਮ ਵਰਤਿਆ ਪਾਸਵਰਡ ਨਹੀਂ ਹੈ
# linkExternal is a link to a mozilla.org support article on password strength
pw-tips = ਸੁਰੱਖਿਅਤ ਰਹੋ — ਪਾਸਵਰਡ ਫ਼ੇਰ ਨਾ ਵਰਤੋਂ। <linkExternal>ਮਜ਼ਬੂਤ ਪਾਸਵਰਡ ਬਣਾਓ</linkExternal> ਨੂੰ ਹੋਰ ਸੁਝਾਆਵਾਂ ਵਾਸਤੇ ਵੇਖੋ।
pw-change-cancel-button = ਰੱਦ ਕਰੋ
pw-change-save-button = ਸੰਭਾਲੋ
pw-change-forgot-password-link = ਪਾਸਵਰਡ ਭੁੱਲ ਗਏ ਹੋ?
pw-change-current-password =
    .label = ਮੌਜੂਦਾ ਪਾਸਵਰਡ ਦਿਓ
pw-change-new-password =
    .label = ਨਵਾਂ ਪਾਸਵਰਡ ਦਿਓ
pw-change-confirm-password =
    .label = ਨਵੇਂ ਪਾਸਵਰਡ ਨੂੰ ਤਸਦੀਕ ਕਰੋ
pw-change-success-alert-2 = ਪਾਸਵਰਡ ਅੱਪਡੇਟ ਕੀਤਾ ਗਿਆ

## Password create page

pw-create-header =
    .title = ਪਾਸਵਰਡ ਬਣਾਓ
pw-create-success-alert-2 = ਪਾਸਵਰਡ ਸੈਟ ਕਰੋ
pw-create-error-2 = ਅਫ਼ਸੋਸ, ਤੁਹਾਡੇ ਪਾਸਵਰਡ ਸੈਟ ਕਰਨ ਦੌਰਾਨ ਸਮੱਸਿਆ ਆਈ ਸੀ

## Delete account page

delete-account-header =
    .title = ਖਾਤਾ ਹਟਾਓ
delete-account-step-1-2 = 2 ਚੋਂ 1 ਪੜਾਅ
delete-account-step-2-2 = 2 ਚੋਂ 2 ਪੜਾਅ
delete-account-product-mozilla-account = { -product-mozilla-account }
delete-account-product-mozilla-vpn = { -product-mozilla-vpn }
delete-account-product-mdn-plus = { -product-mdn-plus }
delete-account-product-mozilla-hubs = { -product-mozilla-hubs }
delete-account-product-mozilla-monitor = { -product-mozilla-monitor }
delete-account-product-firefox-relay = { -product-firefox-relay }
delete-account-product-firefox-sync = { -brand-firefox } ਡਾਟਾ ਸਿੰਕ ਕੀਤਾ ਜਾ ਰਿਹਾ ਹੈ
delete-account-product-firefox-addons = { -brand-firefox } ਐਡ-ਆਨ
delete-account-acknowledge = ਕਿਰਪਾ ਕਰਕੇ ਆਪਣੇ ਖਾਤੇ ਨੂੰ ਹਟਾਉਣ ਦੀ ਤਸਦੀਕ ਕਰੋ:
delete-account-continue-button = ਜਾਰੀ ਰੱਖੋ
delete-account-password-input =
    .label = ਪਾਸਵਰਡ ਭਰੋ
delete-account-cancel-button = ਰੱਦ ਕਰੋ
delete-account-delete-button-2 = ਹਟਾਓ

## Display name page

display-name-page-title =
    .title = ਦਿਖਾਉਣ ਵਾਲਾ ਨਾਂ
display-name-input =
    .label = ਦਿਖਾਉਣ ਵਾਲਾ ਨਾਂ
submit-display-name = ਸੰਭਾਲੋ
cancel-display-name = ਰੱਦ ਕਰੋ
display-name-update-error-2 = ਤੁਹਾਡੇ ਦਿਸਣ ਵਾਲੇ ਨਾਂ ਨੂੰ ਅੱਪਡੇਟ ਕਰਨ ਦੌਰਾਨ ਸਮੱਸਿਆ ਸੀ
display-name-success-alert-2 = ਦਿਖਾਉਣ ਵਾਲਾ ਨਾਂ ਅੱਪਡੇਟ ਕੀਤਾ

## Recent account activity
## All strings except title indicate an event that occurred from the user's account
## These are displayed as a list with the date when the event occured

recent-activity-title = ਸੱਜੀ ਖਾਤਾ ਸਰਗਰਮੀ
recent-activity-account-create-v2 = ਖਾਤਾ ਬਣਾਇਆ
recent-activity-account-disable-v2 = ਖਾਤਾ ਅਸਮਰੱਥ ਕੀਤਾ
recent-activity-account-enable-v2 = ਖਾਤਾ ਸਮਰੱਥ ਕੀਤਾ
recent-activity-account-login-v2 = ਖਾਤਾ ਲਾਗਇਨ ਸ਼ੁਰੂ ਕੀਤਾ
recent-activity-account-reset-v2 = ਪਾਸਵਰਡ ਮੁੜ-ਸੈੱਟ ਕਰਨਾ ਸ਼ੁਰੂ ਕੀਤਾ
recent-activity-account-login-failure = ਖਾਤਾ ਲਾਗਇਨ ਦੀ ਕੋਸ਼ਿਸ਼ ਅਸਫ਼ਲ ਹੋਈ
recent-activity-account-two-factor-added = ਦੋ-ਪੜਾਵੀਂ ਪਰਮਾਣਕਿਤਾ ਸਮਰੱਥ ਹੈ
recent-activity-account-two-factor-requested = ਦੋ-ਪੜਾਵੀਂ ਪਰਮਾਣਕਿਤਾ ਦੀ ਮੰਗ ਕੀਤੀ ਗਈ ਹੈ
recent-activity-account-two-factor-failure = ਦੋ-ਪੜਾਵੀਂ ਪਰਮਾਣਕਿਤਾ ਅਸਫ਼ਲ ਹੈ
recent-activity-account-two-factor-success = ਦੋ-ਪੜਾਵੀਂ ਪਰਮਾਣਕਿਤਾ ਕਾਮਯਾਬ ਹੈ
recent-activity-account-two-factor-removed = ਦੋ-ਪੜਾਵੀਂ ਪਰਮਾਣਕਿਤਾ ਹਟਾਈ ਗਈ ਹੈ
recent-activity-account-password-reset-requested = ਖਾਤਾ ਤੋਂ ਪਾਸਵਰਡ ਮੁੜ-ਸੈੱਟ ਕਰਨ ਦੀ ਬੇਨਤੀ ਕੀਤੀ ਗਈ
recent-activity-account-password-reset-success = ਖਾਤਾ ਪਾਸਵਰਡ ਕਾਮਯਾਬੀ ਨਾਲ ਮੁੜ-ਸੈੱਟ ਕੀਤਾ ਗਿਆ
recent-activity-account-recovery-key-added = ਖਾਤਾ ਰਿਕਵਰੀ ਕੁੰਜੀ ਸਮਰੱਥ ਹੈ
recent-activity-account-recovery-key-verification-failure = ਖਾਤਾ ਰਿਕਵਰੀ ਕੁੰਜੀ ਤਸਦੀਕ ਅਸਫ਼ਲ ਹੈ
recent-activity-account-recovery-key-verification-success = ਖਾਤਾ ਰਿਕਵਰੀ ਕੁੰਜੀ ਤਸਦੀਕ ਕਾਮਯਾਬ ਹੈ
recent-activity-account-recovery-key-removed = ਖਾਤਾ ਰਿਕਵਰੀ ਕੁੰਜੀ ਹਟਾਈ ਗਈ
recent-activity-account-password-added = ਨਵਾਂ ਪਾਸਵਰਡ ਜੋੜਿਆ ਗਿਆ
recent-activity-account-password-changed = ਪਾਸਵਰਡ ਬਦਲਿਆ
recent-activity-account-secondary-email-added = ਸਹਾਇਕ ਈਮੇਲ ਸਿਰਨਾਵਾਂ ਜੋੜਿਆ ਗਿਆ
recent-activity-account-secondary-email-removed = ਸਹਾਇਕ ਈਮੇਲ ਸਿਰਨਾਵਾਂ ਹਟਾਇਆ ਗਿਆ
recent-activity-account-emails-swapped = ਮੂਲ ਅਤੇ ਸਹਾਇਕ ਈਮੇਲ ਆਪਸ ਵਿੱਚ ਬਦਲੇ ਗਏ
recent-activity-session-destroy = ਸ਼ੈਸ਼ਨ ਤੋਂ ਲਾਗ ਆਉਟ ਕੀਤਾ
recent-activity-account-recovery-phone-send-code = ਰਿਕਵਰੀ ਫ਼ੋਨ ਕੋਡ ਭੇਜਿਆ
recent-activity-account-recovery-phone-setup-complete = ਰਿਕਵਰੀ ਫ਼ੋਨ ਸੈਟਅੱਪ ਪੂਰਾ ਕੀਤਾ
recent-activity-account-recovery-phone-signin-complete = ਰਿਕਵਰੀ ਫ਼ੋਨ ਨਾਲ ਸਾਈਨ ਇਨ ਕਰਨਾ ਪੂਰਾ ਹੋਇਆ
recent-activity-account-recovery-phone-signin-failed = ਰਿਕਵਰੀ ਫ਼ੋਨ ਨਾਲ ਸਾਈਨ ਇਨ ਕਰਨਾ ਫ਼ੇਲ੍ਹ ਹੈ
recent-activity-account-recovery-phone-removed = ਰਿਕਵਰੀ ਫ਼ੋਨ ਨੂੰ ਹਟਾਇਆ ਗਿਆ
recent-activity-account-recovery-codes-replaced = ਰਿਕਵਰੀ ਕੋਡਾਂ ਨੂੰ ਬਦਲਿਆ ਗਿਆ
recent-activity-account-recovery-codes-created = ਰਿਕਵਰੀ ਕੋਡ ਬਣਾਏ ਗਏ
recent-activity-account-recovery-codes-signin-complete = ਰਿਕਵਰੀ ਕੋਡਾਂ ਨਾਲ ਸਾਈਨ ਇਨ ਕਰਨਾ ਪੂਰਾ ਹੋਇਆ
recent-activity-must-reset-password = ਪਾਸਵਰਡ ਮੁੜ-ਸੈੱਟ ਕਰਨ ਦੀ ਲੋੜ ਹੈ
# Security event was recorded, but the activity details are unknown or not shown to user
recent-activity-unknown = ਹੋਰ ਖਾਤਾ ਸਰਗਰਮੀ

## PageRecoveryKeyCreate

# The page title displayed at the top of the flow container
recovery-key-create-page-title = ਖਾਤਾ ਰਿਕਵਰੀ ਕੁੰਜੀ
# Tooltip text and aria label for back arrow that takes users out of the account recovery key generation flow
# and back to account settings
recovery-key-create-back-button-title = ਸੈਟਿੰਗਾਂ ‘ਤੇ ਵਾਪਸ ਜਾਓ

## PageRecoveryPhoneRemove
## Users reach this page from account settings when they want to remove a backup phone number.

recovery-phone-remove-header = ਰਿਕਵਰੀ ਫ਼ੋਨ ਨੰਬਰ ਨੂੰ ਹਟਾਓ
settings-recovery-phone-remove-button = ਫ਼ੋਨ ਨੰਬਰ ਨੂੰ ਹਟਾਓ
settings-recovery-phone-remove-cancel = ਰੱਦ ਕਰੋ
settings-recovery-phone-remove-success = ਰਿਕਵਰੀ ਫ਼ੋਨ ਨੂੰ ਹਟਾਇਆ ਗਿਆ

## PageSetupRecoveryPhone

page-setup-recovery-phone-heading = ਰਿਕਵਰੀ ਫ਼ੋਨ ਜੋੜੋ
page-change-recovery-phone = ਰਿਕਵਰੀ ਫ਼ੋਨ ਨੂੰ ਬਦਲੋ
page-setup-recovery-phone-back-button-title = ਸੈਟਿੰਗਾਂ ‘ਤੇ ਵਾਪਸ ਜਾਓ
# Back arrow to return to step 1 of recovery phone setup flow
page-setup-recovery-phone-step2-back-button-title = ਫ਼ੋਨ ਨੰਬਰ ਨੂੰ ਬਦਲੋ

## Add secondary email page

add-secondary-email-step-1 = 2 ਚੋਂ 1 ਪੜਾਅ
add-secondary-email-error-2 = ਇਹ ਈਮੇਲ ਬਣਾਉਣ ਦੌਰਾਨ ਸਮੱਸਿਆ ਆਈ ਸੀ
add-secondary-email-page-title =
    .title = ਸੈਕੰਡਰੀ ਈਮੇਲ
add-secondary-email-enter-address =
    .label = ਈਮੇਲ ਸਿਰਨਾਵਾਂ ਦਿਓ
add-secondary-email-cancel-button = ਰੱਦ ਕਰੋ
add-secondary-email-save-button = ਸੰਭਾਲੋ
# This message is shown when a user tries to add a secondary email that is a
# Firefox Relay email mask (generated email address that can be used in place of
# your real email address)
add-secondary-email-mask = ਈਮੇਲ ਮਾਸਕਾਂ ਨੂੰ ਸੈਕੰਡਰੀ ਈਮੇਲ ਵਜੋਂ ਨਹੀਂ ਵਰਤਿਆ ਜਾ ਸਕਦਾ ਹੈ

## Verify secondary email page

add-secondary-email-step-2 = 2 ਚੋਂ 2 ਪੜਾਅ
verify-secondary-email-page-title =
    .title = ਸੈਕੰਡਰੀ ਈਮੇਲ
verify-secondary-email-verification-code-2 =
    .label = ਆਪਣਾ ਤਸਦੀਕੀ ਕੋਡ ਦਿਓ
verify-secondary-email-cancel-button = ਰੱਦ ਕਰੋ
verify-secondary-email-verify-button-2 = ਤਸਦੀਕ
# This string is an instruction in a form.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
verify-secondary-email-please-enter-code-2 = <strong>{ $email }</strong> ਉੱਤੇ ਭੇਜੇ ਗਏ ਤਸਦੀਕੀਕਰਨ ਕੋਡ ਨੂੰ 5 ਮਿੰਟ ਵਿੱਚ ਭਰੋ।
# This string is a confirmation message shown after verifying an email.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
verify-secondary-email-success-alert-2 = { $email } ਨੂੰ ਕਾਮਯਾਬੀ ਨਾਲ ਜੋੜਿਆ

##

# Link to delete account on main Settings page
delete-account-link = ਖਾਤਾ ਹਟਾਓ
# Success message displayed in alert bar after the user has successfully confirmed their account is not inactive.
inactive-update-status-success-alert = ਕਾਮਯਾਬੀ ਨਾਲ ਸਾਈਨ ਇਨ ਕੀਤਾ। ਤੁਹਾਡਾ { -product-mozilla-account } ਅਤੇ ਡਾਟਾ ਦੋਵੇਂ ਸਰਗਰਮ ਰਹਿਣਗੇ।

## Product promotion

product-promo-monitor =
    .alt = { -product-mozilla-monitor }
product-promo-monitor-description-v2 = ਪਤਾ ਕਰੋ ਕਿ ਤੁਹਾਡੀ ਨਿੱਜੀ ਜਾਣਕਾਰੀ ਕਿੱਥੇ ਦਿਸਦੀ ਹੈ, ਉਸ ਨੂੰ ਆਪਣੇ ਹੱਥ ਹੇਠ ਕਰੋ
# Links out to the Monitor site
product-promo-monitor-cta = ਮੁਫ਼ਤ ਸਕੈਨ ਲਵੋ

## Profile section

profile-heading = ਪਰੋਫਾਇਲ
profile-picture =
    .header = ਤਸਵੀਰ
profile-display-name =
    .header = ਦਿਖਾਉਣ ਵਾਲਾ ਨਾਂ
profile-primary-email =
    .header = ਮੁੱਢਲਾ ਈਮੇਲ

## Progress bar

# This is the aria-label text for the progress bar. The progress bar is meant to visually show the user how much progress they have made through the steps of a given flow.
# Variables:
#   $currentStep (number) - the step which the user is currently on
#   $numberOfSteps (number) - the total number of steps in a given flow
progress-bar-aria-label-v2 = { $numberOfSteps } ਵਿੱਚੋਂ { $currentStep } ਪੜਾਅ।

## Security section of Setting

security-heading = ਸੁਰੱਖਿਆ
security-password =
    .header = ਪਾਸਵਰਡ
# This is a string that shows when the user's password was created.
# Variables:
#   $date (String) - a localized date and time string
security-password-created-date = { $date } ਨੂੰ ਬਣਾਇਆ
security-not-set = ਸੈੱਟ ਨਹੀਂ
security-action-create = ਬਣਾਓ
security-set-password = ਸਿੰਕ ਕਰਨ ਤੇ ਕੁਝ ਖਾਤਾ ਸੁਰੱਖਿਆ ਫ਼ੀਚਰ ਵਰਤਣ ਲਈ ਪਾਸਵਰਡ ਸੈੱਟ ਕਰੋ।
# Link opens a list of recent account activity (e.g., login attempts, password changes, etc.)
security-recent-activity-link = ਸੱਜਰੀ ਖਾਤਾ ਸਰਗਰਮੀ ਵੇਖੋ
signout-sync-header = ਸ਼ੈਸ਼ਨ ਦੀ ਮਿਆਦ ਪੁੱਗੀ
signout-sync-session-expired = ਅਫਸੋਸ, ਕੁਝ ਗਲਤ ਵਾਪਰਿਆ। ਬਰਾਊਜ਼ਰ ਮੇਨੂ ਤੋਂ ਸਾਈਨ ਆਉਟ ਕਰਕੇ ਫੇਰ ਕੋਸ਼ਿਸ਼ ਕਰੋ।

## SubRow component

tfa-row-backup-codes-title = ਬੈਕਅੱਪ ਪਰਮਾਣੀਕਰਨ ਕੋਡ
# Only shown for users that have 2FA enabled and verified, but all backup authentication codes have been consumed
# Users that have not enabled or verified 2FA will not see this
tfa-row-backup-codes-not-available = ਕੋਈ ਕੋਡ ਉਪਲੱਬਧ ਨਹੀਂ
# $numCodesRemaining - the number of backup authentication codes that have not yet been used (generally between 1 to 5)
# A different message is shown when no codes are available
tfa-row-backup-codes-available-v2 =
    { $numCodesAvailable ->
        [one] { $numCodesAvailable } ਕੋਡ ਬਾਕੀ ਰਹਿ ਗਿਆ ਹੈ
       *[other] { $numCodesAvailable } ਕੋਡ ਬਾਕੀ ਰਹਿ ਗਏ ਹਨ
    }
# Shown to users who have backup authentication codes - this will allow them to generate new codes to replace the previous ones
tfa-row-backup-codes-get-new-cta-v2 = ਨਵੇਂ ਕੋਡ ਬਣਾਓ
# Shown to users who have no backup authentication codes
# Button to add backup authentication codes when none are configured
tfa-row-backup-codes-add-cta = ਜੋੜੋ
# 'This' refers to 'backup authentication codes', used as a recovery method for two-step authentication
tfa-row-backup-codes-description-2 = ਜੇ ਤੁਸੀਂ ਆਪਣੇ ਮੋਬਾਈਲ ਡਿਵਾਈਸ ਜਾਂ ਪਰਮਾਣੀਕਰਨ ਐਪ ਨੂੰ ਵਰਤ ਨਹੀਂ ਸਕਦੇ ਹੋ ਤਾਂ ਇਹ ਰਿਕਵਰੀ ਦਾ ਸੁਰੱਖਿਅਤ ਢੰਗ ਹੈ।
# Recovery phone is a recovery method for two-step authentication
# A recovery code can be sent to the user's phone
tfa-row-backup-phone-title-v2 = ਰਿਕਵਰੀ ਫ਼ੋਨ
# Shown with an alert icon to indicate that no recovery phone is configured
tfa-row-backup-phone-not-available-v2 = ਕੋਈ ਫ਼ੋਨ ਨੰਬਰ ਨਹੀਂ ਜੋੜਿਆ ਗਿਆ
# button to change the configured recovery phone
tfa-row-backup-phone-change-cta = ਬਦਲੋ
# button to add/configure a recovery phone
tfa-row-backup-phone-add-cta = ਜੋੜੋ
# Button to remove a recovery phone from the user's account
tfa-row-backup-phone-delete-button = ਹਟਾਓ
# Shown in tooltip on delete button or delete icon
tfa-row-backup-phone-delete-title-v2 = ਰਿਕਵਰੀ ਫ਼ੋਨ ਨੂੰ ਹਟਾਓ
# A SIM swap attack is a type of identity theft where an attacker tricks or bribes a mobile carrier
# into transferring a victim's phone number to their own SIM card, enabling access to accounts secured
# with SMS-based two-factor authentication.
tfa-row-backup-phone-sim-swap-risk-link = ਸਿਮ ਬਦਲਣ ਦੇ ਖ਼ਤਰੇ ਬਾਰੇ ਹੋਰ ਜਾਣੋ

## Switch component

# Used as "title" attribute when the switch is "on" and interaction turns the switch to "off"
switch-turn-off = ਬੰਦ ਕਰੋ
# Used as "title" attribute when the switch is "off" and interaction turns the switch to "on"
switch-turn-on = ਚਾਲੂ ਕਰੋ
# Used as "title" attribute when switch has been interacted with and form is submitting
switch-submitting = ਭੇਜਿਆ ਜਾ ਰਿਹਾ ਹੈ…
switch-is-on = ਚਾਲੂ
switch-is-off = ਬੰਦ

## Sub-section row Defaults

row-defaults-action-add = ਜੋੜੋ
row-defaults-action-change = ਬਦਲੋ
row-defaults-action-disable = ਅਸਮਰੱਥ ਕਰੋ
row-defaults-status = ਕੋਈ ਨਹੀਂ

## Account recovery key sub-section on main Settings page

rk-header-1 = ਖਾਤਾ ਰਿਕਵਰੀ ਕੁੰਜੀ
rk-enabled = ਸਮਰੱਥ ਹੈ
rk-not-set = ਸੈੱਟ ਨਹੀਂ
rk-action-create = ਬਣਾਓ
# Button to delete the existing account recovery key and create a new one
rk-action-change-button = ਬਦਲੋ
rk-action-remove = ਹਟਾਓ
rk-key-removed-2 = ਖਾਤਾ ਰਿਕਵਰੀ ਕੁੰਜੀ ਹਟਾਈ ਗਈ
rk-cannot-remove-key = ਤੁਹਾਡੀ ਖਾਤਾ ਰਿਕਵਰੀ ਕੁੰਜੀ ਨੂੰ ਹਟਾਇਆ ਨਹੀਂ ਜਾ ਸਕਿਆ ਹੈ।
rk-refresh-key-1 = ਖਾਤਾ ਰਿਕਵਰੀ ਕੁੰਜੀ ਤਾਜ਼ਾ ਕਰੋ
rk-content-explain = ਜਦੋਂ ਤੁਸੀਂ ਆਪਣਾ ਪਾਸਵਰਡ ਭੁੱਲ ਜਾਵੋ ਤਾਂ ਆਪਣੀ ਜਾਣਕਾਰੀ ਬਹਾਲ ਕਰੋ।
rk-cannot-verify-session-4 = ਅਫ਼ਸੋਸ ਹੈ ਕਿ ਤੁਹਾਡੇ ਸ਼ੈਸ਼ਨ ਨੂੰ ਤਸਦੀਕ ਕਰਨ ਦੌਰਾਨ ਸਮੱਸਿਆ ਆਈ ਸੀ
rk-remove-modal-heading-1 = ਖਾਤਾ ਰਿਕਵਰੀ ਕੁੰਜੀ ਹਟਾਉਣੀ ਹੈ?
rk-remove-error-2 = ਤੁਹਾਡੀ ਖਾਤਾ ਰਿਕਵਰੀ ਕੁੰਜੀ ਨੂੰ ਹਟਾਇਆ ਨਹੀਂ ਜਾ ਸਕਿਆ ਹੈ
# Icon button to delete user's account recovery key. Text appears in tooltip on hover and as alt text for screen readers.
unit-row-recovery-key-delete-icon-button-title = ਖਾਤਾ ਰਿਕਵਰੀ ਕੁੰਜੀ ਹਟਾਓ

## Secondary email sub-section on main Settings page

se-heading = ਸੈਕੰਡਰੀ ਈਮੇਲ
    .header = ਸੈਕੰਡਰੀ ਈਮੇਲ
se-cannot-refresh-email = ਅਫ਼ਸੋਸ ਹੈ ਕਿ ਇਹ ਈਮੇਲ ਤਾਜ਼ਾ ਕਰਨ ਦੌਰਾਨ ਸਮੱਸਿਆ ਆਈ ਸੀ।
se-cannot-resend-code-3 = ਅਫ਼ਸੋਸ ਹੈ ਕਿ ਤਸਦੀਕੀਕਰਨ ਕੋਡ ਮੁੜ-ਭੇਜਣ ਦੌਰਾਨ ਗੜਬੜ ਹੋਈ।
# This string is used in a notification message near the top of the page.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
se-set-primary-successful-2 = { $email } ਹੁਣ ਤੁਹਾਡਾ ਮੁੱਢਲੀ ਈਮੇਲ ਹੈ
se-set-primary-error-2 = ਅਫ਼਼ਸੋਸ ਹੈ ਕਿ ਤੁਹਾਡੀ ਮੁੱਢਲੀ ਈਮੇਲ ਬਦਲਣ ਦੌਰਾਨ ਸਮੱਸਿਆ ਆਈ ਸੀ
# This string is used in a notification message near the top of the page.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
se-delete-email-successful-2 = { $email } ਨੂੰ ਕਾਮਯਾਬੀ ਨਾਲ ਹਟਾਇਆ
se-delete-email-error-2 = ਅਫ਼ਸੋਸ ਹੈ ਕਿ ਇਹ ਈਮੇਲ ਹਟਾਉਣ ਦੌਰਾਨ ਦੌਰਾਨ ਸਮੱਸਿਆ ਆਈ ਸੀ
se-verify-session-3 = ਇਹ ਕਾਰਵਾਈ ਕਰਨ ਵਾਸਤੇ ਤੁਹਾਨੂ ਆਪਣੇ ਮੌਜੂਦਾ ਸ਼ੈਸ਼ਨ ਦੀ ਤਸਦੀਕ ਕਰਨੀ ਪਵੇਗੀ
se-verify-session-error-3 = ਅਫ਼ਸੋਸ ਹੈ ਕਿ ਤੁਹਾਡੇ ਸ਼ੈਸ਼ਨ ਨੂੰ ਤਸਦੀਕ ਕਰਨ ਦੌਰਾਨ ਸਮੱਸਿਆ ਆਈ ਸੀ
# Button to remove the secondary email
se-remove-email =
    .title = ਈਮੇਲ ਹਟਾਓ
# Button to refresh secondary email status
se-refresh-email =
    .title = ਈਮੇਲ ਤਾਜ਼ਾ ਕਰੋ
se-unverified-2 = ਤਸਦੀਕ ਨਹੀਂ
# Button to make secondary email the primary
se-make-primary = ਮੁੱਢਲਾ ਬਣਾਓ
se-default-content = ਤੁਹਾਡੇ ਖਾਤੇ ਲਈ ਪਹੁੰਚ, ਜੇ ਤੁਸੀਂ ਆਪਣੇ ਮੁੱਢਲੇ ਈਮੇਲ ਨੂੰ ਵਰਤ ਨਹੀਂ ਸਕਦੇ ਹੋ।
se-content-note-1 = ਯਾਦ ਰੱਖੋ: ਸੈਕੰਡਰੀ ਈਮੇਲ ਤੁਹਾਡੀ ਜਾਣਕਾਰੀ ਬਹਾਲ ਨਹੀਂ ਕਰੇਗੀ — ਉਸ ਵਾਸਤੇ ਤੁਹਾਨੂੰ <a>ਖਾਤਾ ਰਿਕਵਰੀ ਕੁੰਜੀ</a> ਚਾਹੀਦੀ ਹੈ।
# Default value for the secondary email
se-secondary-email-none = ਕੋਈ ਨਹੀਂ

## Two Step Auth sub-section on Settings main page

tfa-row-header = ਦੋ-ਪੜ੍ਹਾਵੀਂ ਪਰਮਾਣੀਕਰਨ
tfa-row-enabled = ਸਮਰੱਥ ਹੈ
tfa-row-disabled-status = ਅਸਮਰੱਥ ਹੈ
tfa-row-action-add = ਜੋੜੋ
tfa-row-action-disable = ਅਸਮਰੱਥ ਕਰੋ
tfa-row-action-change = ਬਦਲੋ
tfa-row-button-refresh =
    .title = ਦੋ-ਪੜ੍ਹਾਵੀਂ ਪਰਮਾਣੀਕਰਨ ਤਾਜ਼ਾ ਕਰੋ
# "this" refers to two-step authentication
# Link goes to https://support.mozilla.org/kb/secure-mozilla-account-two-step-authentication
tfa-row-enabled-info-link = ਇਹ ਤੁਹਾਡੇ ਖਾਤੇ ਨੂੰ ਸੁਰੱਖਿਅਤ ਕਿਵੇਂ ਕਰਦਾ ਹੈ
tfa-row-cannot-verify-session-4 = ਅਫ਼ਸੋਸ ਹੈ ਕਿ ਤੁਹਾਡੇ ਸ਼ੈਸ਼ਨ ਨੂੰ ਤਸਦੀਕ ਕਰਨ ਦੌਰਾਨ ਸਮੱਸਿਆ ਆਈ ਸੀ
tfa-row-disable-modal-heading = ਦੋ-ਪੜ੍ਹਾਵੀਂ ਪਰਮਾਣੀਕਰਨ ਅਸਮਰੱਥ ਕਰਨਾ ਹੈ?
tfa-row-disable-modal-confirm = ਅਸਮਰੱਥ ਕਰੋ
# Shown in an alert bar after two-step authentication is disabled
tfa-row-disabled-2 = ਦੋ-ਪੜਾਵੀਂ ਪਰਮਾਣੀਕਰਨ ਅਸਮਰੱਥ ਹੈ
tfa-row-cannot-disable-2 = ਦੋ-ਪੜਾਵੀਂ ਪਰਮਾਣਕਿਤਾ ਅਸਮਰੱਥ ਨਹੀਂ ਕੀਤੀ ਜਾ ਸਕੀ

## TermsPrivacyAgreement
## These terms are used in signin and signup for Firefox account

# This message is followed by a bulleted list
terms-privacy-agreement-intro-2 = ਜਾਰੀ ਰੱਖਣ ਕੇ ਤੁਸੀਂ ਸਹਿਮਤ ਇਹਨਾਂ ਨਾਲ ਹੁੰਦੇ ਹੋ:
# links to Mozilla Accounts Terms of Service and Privacy Notice, part of a bulleted list
terms-privacy-agreement-mozilla = { -product-mozilla-accounts(capitalization: "uppercase") } <mozillaAccountsTos>ਸੇਵਾ ਦੀਆਂ ਸ਼ਰਤਾਂ</mozillaAccountsTos> ਅਤੇ <mozillaAccountsPrivacy>ਪਰਦੇਦਾਰੀ ਸੂਚਨਾ</mozillaAccountsPrivacy>
# links to Mozilla Account's Terms of Service and Privacy Notice
terms-privacy-agreement-default-2 = ਜਾਰੀ ਰੱਖ ਕੇ ਤੁਸੀਂ <mozillaAccountsTos>ਸੇਵਾ ਦੀਆਂ ਸ਼ਰਤਾਂ</mozillaAccountsTos> ਅਤੇ <mozillaAccountsPrivacy>ਪਰਦੇਦਾਰੀ ਸੂਚਨਾ</mozillaAccountsPrivacy> ਨਾਲ ਸਹਿਮਤ ਹੁੰਦੇ ਹੋ।

## ThirdPartyAuth component
## This is a component that is used to display a list of third party providers (Apple, Google, etc.)

# This appears when a user has the option to authenticate via third party accounts in addition to their Firefox account.
# Firefox account login appears on top, and third party options appear on bottom.
# This string appears as a separation between the two, in the following order: "Enter your password" "Or"(this string) (continue-with-google-button with aria equivalent text) / (continue-with-apple-button with aria equivalent text)
third-party-auth-options-or = ਜਾਂ
continue-with-google-button = { -brand-google } ਨਾਲ ਜਾਰੀ ਰੱਖੋ
continue-with-apple-button = { -brand-apple } ਨਾਲ ਜਾਰੀ ਰੱਖੋ

## Auth-server based errors that originate from backend service

auth-error-102 = ਅਣਪਛਾਤਾ ਖਾਤਾ
auth-error-103 = ਗਲਤ ਪਾਸਵਰਡ
auth-error-105-2 = ਗਲਤ ਤਸਦੀਕੀ ਕੋਡ
auth-error-110 = ਗਲਤ ਟੋਕਨ
# Error shown to users when they have attempted a request (e.g., requesting a password reset) too many times
# and their requests have been throttled, but the specific amount of time before they can retry is unknown.
auth-error-114-generic = ਤੁਸੀਂ ਕਾਫੀ ਵਾਰ ਕੋਸ਼ਿਸ਼ ਕੀਤੀ ਹੈ। ਬਾਅਦ ਵਿੱਚ ਫੇਰ ਕੋਸ਼ਿਸ਼ ਕਰਿਓ।
# This string is the amount of time required before a user can attempt another request.
# Variables:
#   $retryAfter (String) - Time required before retrying a request. The variable is localized by our
#                          formatting library (momentjs) as a "time from now" and automatically includes
#                          the prefix as required by the current locale (for example, "in 15 minutes", "dans 15 minutes").
auth-error-114 = ਤੁਸੀਂ ਬਹੁਤ ਵਾਰ ਕੋਸ਼ਿਸ਼ ਕਰ ਚੁੱਕੇ ਹੋ। { $retryAfter } ਫੇਰ ਕੋਸ਼ਿਸ਼ ਕਰਿਓ।
auth-error-125 = ਸੁਰੱਖਿਆ ਕਾਰਨਾਂ ਕਰਕੇ ਬੇਨਤੀ ਉੱਤੇ ਪਾਬੰਦੀ ਲਾਈ ਗਈ ਸੀ
auth-error-138-2 = ਨਾ-ਤਸਦੀਕ ਕੀਤਾ ਸ਼ੈਸ਼ਨ
auth-error-139 = ਸੈਕੰਡਰੀ ਈਮੇਲ ਤੁਹਾਡੇ ਖਾਤੇ ਦੀ ਈਮੇਲ ਤੋਂ ਵੱਖਰੀ ਹੋਣੀ ਚਾਹੀਦੀ ਹੈ
auth-error-155 = TOTP ਟੋਕ ਨਹੀਂ ਲੱਭਿਆ
# Error shown when the user submits an invalid backup authentication code
auth-error-156 = ਬੈਕਅੱਪ ਪਰਮਾਣਿਕਤਾ ਕੋਡ ਨਹੀ ਲੱਭਿਆ
auth-error-159 = ਗਲਤ ਖਾਤਾ ਰਿਕਵਰੀ ਕੁੰਜੀ
auth-error-183-2 = ਤਸਦੀਕੀ ਕੋਡ ਗਲਤ ਹੈ ਜਾਂ ਮਿਆਦ ਪੁੱਗੀ
auth-error-202 = ਫ਼ੀਚਰ ਸਮਰੱਥ ਨਹੀਂ ਹੈ
auth-error-203 = ਸਿਸਟਮ ਉਪਲੱਬਧ ਨਹੀਂ, ਛੇਤੀ ਹੀ ਫੇਰ ਕੋਸ਼ਿਸ਼ ਕਰੋ
auth-error-206 = ਪਾਸਵਰਡ ਬਣਾਇਆ ਨਹੀਂ ਜਾ ਸਕਦਾ ਹੈ, ਪਾਸਵਰਡ ਪਹਿਲਾਂ ਹੀ ਸੈੱਟ ਹੈ
auth-error-214 = ਰਿਕਵਰੀ ਫ਼ੋਨ ਨੰਬਰ ਪਹਿਲਾਂ ਹੀ ਮੌਜੂਦ ਹੈ
auth-error-215 = ਰਿਕਵਰੀ ਫ਼ੋਨ ਨੰਬਰ ਮੌਜੂਦ ਨਹੀਂ ਹੈ
auth-error-216 = ਟੈਕਸਟ ਸੁਨੇਹੇ ਦੀ ਹੱਦ ਅੱਪੜੀ
auth-error-218 = ਬੈਕਅੱਪ ਪਰਮਾਣੀਕਰਨ ਕੋਡ ਮੌਜੂਦ ਨਾ ਹੋਣ ਕਰਕੇ ਰਿਕਵਰੀ ਫ਼ੋਨ ਨੂੰ ਹਟਾਉਣ ਲਈ ਅਸਮੱਥ ਹੈ।
auth-error-999 = ਅਣਜਾਣ ਗਲਤੀ
auth-error-1001 = ਲਾਗਇਨ ਦੀ ਕੋਸ਼ਿਸ਼ ਰੱਦ ਕੀਤੀ
auth-error-1002 = ਸ਼ੈਸ਼ਨ ਦੀ ਮਿਆਦ ਪੁੱਗੀ। ਜਾਰੀ ਰੱਖਣ ਲਈ ਸਾਇਨ ਇਨ ਕਰੋ।
auth-error-1003 = ਲੋਕਲ ਸਟੋਰੇਜ਼ ਅਤੇ ਕੂਕੀਜ਼ ਹਾਲੇ ਵੀ ਅਸਮਰੱਥ ਹਨ
auth-error-1008 = ਤੁਹਾਡਾ ਨਵਾਂ ਪਾਸਵਰਡ ਵੱਖਰਾ ਹੋਣਾ ਚਾਹੀਦਾ ਹੈ
auth-error-1010 = ਠੀਕ ਪਾਸਵਰਡ ਚਾਹੀਦਾ ਹੈ
auth-error-1011 = ਢੁੱਕਵੀਂ ਈਮੇਲ ਚਾਹੀਦੀ ਹੈ
auth-error-1031 = ਸਾਈਨ ਅੱਪ ਲਈ ਤੁਹਾਨੂੰ ਆਪਣੀ ਉਮਰ ਦੇਣੀ ਪਵੇਗੀ
auth-error-1032 = ਸਾਇਨ ਇਨ ਕਰਨ ਲਈ ਤੁਹਾਨੂੰ ਢੁੱਕਵੀਂ ਉਮਰ ਦੇਣੀ ਚਾਹੀਦੀ ਹੈ
auth-error-1054 = ਗ਼ਲਤ ਦੋ-ਪੜ੍ਹਾਵੀ ਪਰਮਾਣੀਕਰਨ ਕੋਡ
auth-error-1056 = ਗਲਤ ਬੈਕਅੱਪ ਪਰਮਾਣੀਕਰਨ ਕੋਡ
auth-error-1062 = ਅਢੁੱਕਵਾਂ ਰੀ-ਡਿਰੈਕਟ
auth-error-1066 = ਈਮੇਲ ਮਾਸਕ ਨੂੰ ਖਾਤਾ ਬਣਾਉਣ ਲਈ ਨਹੀਂ ਵਰਤਿਆ ਜਾ ਸਕਦਾ ਹੈ।
auth-error-1067 = ਈਮੇਲ ਗਲਤ ਲਿਖੀ?
oauth-error-1000 = ਕੁਝ ਗਲਤ ਹੋ ਗਿਆ ਹੈ। ਇਹ ਟੈਬ ਬੰਦ ਕਰੋ ਅਤੇ ਮੁੜ ਕੋਸ਼ਿਸ਼ ਕਰੋ।

## Connect Another Device page

# A user will only see this header if they are signed in. The header will be preceded by a green checkmark (rtl/ltr sensitive)
connect-another-device-signed-in-header = ਤੁਸੀਂ { -brand-firefox } ਵਿੱਚ ਸਾਈਨ ਇਨ ਕੀਤਾ
# A "success" message visible to users who verified via email
connect-another-device-email-confirmed-banner = ਈਮੇਲ ਤਸਦੀਕ ਕੀਤੀ
# A "success" message visible to users who verified via sign-in
connect-another-device-signin-confirmed-banner = ਸਾਈਨ ਇਨ ਦੀ ਪੁਸ਼ਟੀ
# A message prompts the user to sign in to this instance of the Firefox browser so as to complete device sync. This is followed by a link labeled "Sign in"
connect-another-device-signin-to-complete-message = ਸੈਟਅੱਪ ਪੂਰਾ ਕਰਨ ਲਈ ਇਸ { -brand-firefox } ਵਿੱਚ ਸਾਈਨ ਇਨ ਕਰੋ
# A link for the user to sign in to the current Firefox browser, preceded by a message prompting the user to sign in so as to complete the device sync setup
connect-another-device-signin-link = ਸਾਈਨ ਇਨ
# A message prompting the user to sign in via a different device than the current one so as to complete the device-syncing process
connect-another-device-still-adding-devices-message = ਹਾਲੇ ਵੀ ਡਿਵਾਈਸ ਜੋੜ ਰਹੇ ਹੋ? ਸੈਟਅੱਪ ਪੂਰਾ ਕਰਨ ਲਈ ਹੋਰ ਡਿਵਾਈਸ ਉੱਤੇ { -brand-firefox } ਵਿੱਚ ਸਾਈਨ ਇਨ ਕਰੋ
# A message prompting the user to sign in via a different device than the current one so as to complete the device-syncing process
connect-another-device-signin-another-device-to-complete-message = ਸੈਟਅੱਪ ਨੂੰ ਪੂਰਾ ਕਰਨ ਲਈ ਹੋਰ ਡਿਵਾਈਸ ਉੱਤੇ { -brand-firefox } ਵਿੱਚ ਸਾਈਨ-ਇਨ ਕਰੋ
# This message is a value-proposition prompting the user to sync another device so as to get tabs, bookmarks, and passwords shared between devices
connect-another-device-get-data-on-another-device-message = ਆਪਣੀਆਂ ਟੈਬਾਂ, ਬੁੱਕਮਾਰਕਾਂ ਅਤੇ ਪਾਸਵਰਡਾਂ ਨੂੰ ਹੋਰ ਡਿਵਾਈਸ ਉੱਤੇ ਵੀ ਚਾਹੁੰਦੇ ਹੋ?
# This link leads the user back to the `/pair` page so as to connect another device
connect-another-device-cad-link = ਹੋਰ ਡਿਵਾਈਸ ਨਾਲ ਕਨੈਕਟ ਕਰੋ
# This link cancels the process of connecting another device, and takes the user back to Account Settings
connect-another-device-not-now-link = ਹੁਣੇ ਨਹੀਂ
# This is a message for Firefox Android users, prompting them to complete the process of connecting another device by signing into Firefox for Android
connect-another-device-android-complete-setup-message = ਸੈੱਟਅੱਪ ਨੂੰ ਪੂਰਾ ਕਰਨ ਲਈ ਐਂਡਰਾਇਡ ਲਈ { -brand-firefox } ਉੱਤੇ ਸਾਈਨ ਇਨ ਕਰੋ
# This is a message for Firefox iOS users, prompting them to complete the process of connecting another device by signing into Firefox for iOS
connect-another-device-ios-complete-setup-message = ਸੈੱਟਅੱਪ ਨੂੰ ਪੂਰਾ ਕਰਨ ਲਈ iOS ਲਈ { -brand-firefox } ਉੱਤੇ ਸਾਈਨ ਇਨ ਕਰੋ

## Cookies disabled page
## Users will see this page if they have local storage or cookies disabled.

cookies-disabled-header = ਲੋਕਲ ਸਟੋਰੇਜ਼ ਅਤੇ ਕੂਕੀਜ਼ ਚਾਹੀਦੇ ਹਨ
cookies-disabled-enable-prompt-2 = ਤੁਹਾਡੇ { -product-mozilla-account } ਤੱਕ ਪਹੁੰਚ ਕਰਨ ਲਈ ਆਪਣੇ ਬਰਾਊਜ਼ਰ ਵਿੱਚ ਕੁਕੀਜ਼ ਅਤੇ ਲੋਕਲ ਸਟੋਰੇਜ ਸਮਰੱਥ ਕਰੋ। ਅਜਿਹਾ ਕਰਨਾ ਕਾਰਜ-ਸਮਰੱਥਾ ਨੂੰ ਸਮਰੱਥ ਬਣਾ ਦੇਵੇਗਾ ਜਿਵੇਂ ਕਿ ਸੈਸ਼ਨਾਂ ਵਿੱਚ ਤੁਹਾਨੂੰ ਯਾਦ ਰੱਖਣਾ।
# A button users may click to check if cookies and local storage are enabled and be directed to the previous page if so.
cookies-disabled-button-try-again = ਫੇਰ ਕੋਸ਼ਿਸ਼ ਕਰੋ
# An external link going to: https://support.mozilla.org/kb/cookies-information-websites-store-on-your-computer
cookies-disabled-learn-more = ਹੋਰ ਜਾਣੋ

## Index / home page

index-header = ਆਪਣਾ ਈਮੇਲ ਦਿਓ
index-sync-header = ਆਪਣੇ { -product-mozilla-account } ਨਾਲ ਜਾਰੀ ਰੱਖੋ
index-sync-subheader = ਜਿੱਥੇ ਵੀ ਤੁਸੀਂ { -brand-firefox } ਵਰਤੋਂ, ਆਪਣੇ ਪਾਸਵਰਡ, ਟੈਬਾਂ ਤੇ ਬੁੱਕਮਾਰਕਾਂ ਨੂੰ ਸਿੰਕ ਕਰੋ।
index-relay-header = ਈਮੇਲ ਮਾਸਕ ਬਣਾਓ
index-relay-subheader = ਆਪਣੀ ਮਾਸਕ ਕੀਤੀ ਈਮੇਲ ਤੋਂ ਜਿੱਥੇ ਤੁਸੀਂ ਈਮੇਲ ਅੱਗੇ ਭੇਜਣੀਆਂ ਚਾਹੁੰਦੇ ਹੋ, ਉਹ ਈਮੇਲ ਸਿਰਨਾਵਾਂ ਦਿਓ।
# $serviceName - the service (e.g., Pontoon) that the user is signing into with a Mozilla account
index-subheader-with-servicename = { $serviceName } ਨਾਲ ਜਾਰੀ ਰੱਖੋ
index-subheader-default = ਖਾਤਾ ਸੈਟਿੰਗਾਂ ਨਾਲ ਜਾਰੀ ਰੱਖੋ
index-cta = ਸਾਈਨ ਅੱਪ ਜਾਂ ਸਾਈਨ ਇਨ ਕਰੋ
index-account-info = { -product-mozilla-account } ਖਾਤਾ { -brand-mozilla } ਵਲੋਂ ਹੋਰ ਪਰਦੇਦਾਰੀ-ਸੁਰੱਖਿਅਤ ਖਾਤਿਆਂ ਲਈ ਪਹੁੰਚ ਵੀ ਦਿੰਦਾ ਹੈ।
index-email-input =
    .label = ਆਪਣਾ ਈਮੇਲ ਦਿਓ
# When users delete their Mozilla account inside account Settings, they are redirected to this page with a success message
index-account-delete-success = ਖਾਤੇ ਨੂੰ ਠੀਕ ਤਰ੍ਹਾਂ ਹਟਾਇਆ ਗਿਆ
# Displayed when users try to sign up for an account and their confirmation code email bounces
index-email-bounced = ਤੁਹਾਡੀ ਤਸਦੀਕ ਈਮੇਲ ਵਾਪਿਸ ਪਰਤ ਆਈ ਹੈ। ਕੀ ਈਮੇਲ ਗਲਤ ਲਿਖਿਆ ਸੀ?

## InlineRecoveryKeySetup page component

inline-recovery-key-setup-create-error = ਓਹ ਹੋ! ਅਸੀਂ ਤੁਹਾਡੀ ਨਵੀਂ ਖਾਤਾ ਰਿਕਵਰੀ ਕੁੰਜੀ ਨਹੀਂ ਬਣਾ ਸਕਦੇ ਹਾਂ। ਕਿਰਪਾ ਕਰਕੇ ਬਾਅਦ ਵਿੱਚ ਕੋਸ਼ਿਸ਼ ਕਰੋ।
inline-recovery-key-setup-recovery-created = ਖਾਤਾ ਰਿਕਵਰੀ ਕੁੰਜੀ ਬਣਾਈ ਗਈ
inline-recovery-key-setup-download-header = ਆਪਣੇ ਖਾਤੇ ਨੂੰ ਸੁਰੱਖਿਅਤ ਕਰੋ
inline-recovery-key-setup-download-subheader = ਇਸ ਨੂੰ ਹੁਣੇ ਡਾਊਨਲੋਡ ਕਰਕੇ ਸੰਭਾਲੋ
inline-recovery-key-setup-hint-header = ਸੁਰੱਖਿਆ ਸਿਫਾਰਸ਼

## InlineTotpSetup page
## TOTP (time-based one-time password) is a form of two-factor authentication (2FA).

inline-totp-setup-cancel-setup-button = ਸੈੱਟ ਅੱਪ ਰੱਦ ਕਰੋ
inline-totp-setup-continue-button = ਜਾਰੀ ਰੱਖੋ
#  The <enable2StepDefaultSpan> elements are just visual separation here
inline-totp-setup-enable-two-step-authentication-default-header-2 = <span>ਖਾਤਾ ਸੈਟਿੰਗਾਂ ਨਾਲ ਜਾਰੀ ਰੱਖਣ</span> ਲਈ ਦੋ-ਪੜ੍ਹਾਵੀਂ ਪਰਮਾਣਿਕਤਾ ਸਮਰੱਥ ਕਰੋ
# { $serviceName } is the name of the service which the user wants to authenticate to. The <enable2StepCustomServiceSpan> elements are just visual separation
inline-totp-setup-enable-two-step-authentication-custom-header-2 = <span>{ $serviceName } ਨਾਲ ਜਾਰੀ</span> ਰੱਖਣ ਲਈ ਦੋ-ਪੜਾਵੀ ਪਰਮਾਣੀਕਰਨ ਸਮਰੱਥ ਕਰੋ
inline-totp-setup-ready-button = ਤਿਆਰ
# The authentication code a user is scanning is a QR code.
# { $serviceName } is the name of the service which the user wants to authenticate to. The <scanAuthCodeHeaderSpan> elements are just visual separation
inline-totp-setup-show-qr-custom-service-header-2 = <span>{ $serviceName } ਨਾਲ ਜਾਰੀ ਰੱਖਣ</span> ਲਈ ਪਰਮਾਣੀਕਰਨ ਕੋਡ ਸਕੈਨ ਕਰੋ
# { $serviceName } is the name of the service which the user wants to authenticate to. The <enterCodeManuallyHeaderSpan> elements are just visual separation
inline-totp-setup-no-qr-custom-service-header-2 = <span>{ $serviceName } ਨਾਲ ਜਾਰੀ ਰੱਖਣ ਲਈ</span> ਕੋਡ ਖੁਦ ਭਰੋ
# The authentication code a user is scanning is a QR code.
# The <scanAuthHeaderSpan> elements are just visual separation
inline-totp-setup-show-qr-default-service-header-2 = <span>ਖਾਤਾ ਸੈਟਿੰਗਾਂ ਨਾਲ ਜਾਰੀ ਰੱਖਣ</span> ਲਈ ਪਰਮਾਣੀਕਰਨ ਕੋਡ ਸਕੈਨ ਕਰੋ
# The <enterCodeManuallyHeaderSpan> elements are just visual separation
inline-totp-setup-no-qr-default-service-header-2 = ਖਾਤਾ ਸੈਟਿੰਗਾਂ ਨਾਲ ਜਾਰੀ ਰੱਖਣ ਲਈ <span>ਕੋਡ ਖੁਦ ਭਰੋ</span>
# The <toggleToQRButton> allows the user to use a QR code instead of manually entering a secret key
inline-totp-setup-enter-key-or-use-qr-instructions = ਇਹ ਗੁਪਤ ਕੁੰਜੀ ਨੂੰ ਆਪਣੇ ਪਰਮਾਣੀਕਰਨ ਐਪ ਵਿੱਚ ਲਿਖੋ। <toggleToQRButton>ਇਸ ਦੀ ਜਬਾਏ QR ਕੋਡ ਸਕੈਨ ਕਰਨਾ ਹੈ?</toggleToQRButton>
# The "authentication code" here refers to the code provided by an authentication app.
inline-totp-setup-on-completion-description = ਇੱਕ ਵਾਰ ਪੂਰਾ ਹੋਣ ਉੱਤੇ ਇਹ ਤੁਹਾਡੇ ਵਲੋਂ ਭਰਨ ਵਾਲੇ ਪਰਮਾਣੀਕਰਨ ਕੋਡ ਬਣਾਉਣਾ ਸ਼ੁਰੂ ਕਰੇਗਾ।
# The "authentication code" here refers to the code provided by an authentication app.
inline-totp-setup-security-code-placeholder = ਪਰਮਾਣੀਕਰਨ ਕੋਡ
# The "authentication code" here refers to the code provided by an authentication app.
inline-totp-setup-code-required-error = ਪਰਮਾਣੀਕਰਨ ਕੋਡ ਚਾਹੀਦਾ ਹੈ
tfa-qr-code-alt = ਸਹਾਇਕ ਐਪਲੀਕੇਸ਼ਨਾਂ ਵਿੱਚ ਦੋ-ਪੜਾਵੀਂ ਪਰਮਾਣਿਕਤਾ ਨੂੰ ਸੈੱਟਅੱਪ ਕਰਨ ਲਈ { $code } ਕੋਡ ਦੀ ਵਰਤੋਂ ਕਰੋ।
inline-totp-setup-page-title = ਦੋ-ਪੜ੍ਹਾਵੀਂ ਪਰਮਾਣੀਕਰਨ

## Legal page. This page contains simply a header and links to pages that display
## content from https://github.com/mozilla/legal-docs

legal-header = ਕਨੂੰਨੀ
# Links to our internal "Firefox Cloud" /legal/terms page
legal-terms-of-service-link = ਸੇਵਾ ਦੀਆਂ ਸ਼ਰਤਾਂ
# Links to our internal "Firefox Cloud" /legal/terms page
legal-privacy-link = ਪਰਦੇਦਾਰੀ ਸੂਚਨਾ

## Legal privacy notice page. Most content comes from https://github.com/mozilla/legal-docs

legal-privacy-heading = ਪਰਦੇਦਾਰੀ ਸੂਚਨਾ

## Legal terms of service page. Most content comes from https://github.com/mozilla/legal-docs

legal-terms-heading = ਸੇਵਾ ਦੀਆਂ ਸ਼ਰਤਾਂ

## AuthAllow page - Part of the device pairing flow

pair-auth-allow-heading-text = ਕੀ ਤੁਸੀਂ ਹੁਣੇ ਹੀ { -product-firefox } ਵਿੱਚ ਸਾਈਨ ਇਨ ਕੀਤਾ ਸੀ?
# Submit button to confirm that the user initiated the device pairing
# and that they approve of the new device being added to their account
pair-auth-allow-confirm-button = ਹਾਂ, ਡਿਵਾਈਸ ਮਨਜ਼ੂਰ ਹੈ
# "If this wasn't you" means "If it wasn't you that just signed in to Firefox"
# The text with the <link> tags links to a `reset password` page
pair-auth-allow-refuse-device-link = ਜੇ ਇਹ ਤੁਸੀਂ ਨਹੀਂ ਸੀ ਤਾਂ <link>ਆਪਣਾ ਪਾਸਵਰਡ ਬਦਲੋ</link>

## PairAuthComplete page - part of the device pairing flow

# Heading to confirm the successful pairing of a new device with the user's account
# Device here is non specific (could be a laptop, tablet, phone, etc.)
pair-auth-complete-heading = ਡਿਵਾਈਸ ਕਨੈਕਟ ਹੈ
# Variable { $deviceFamily } is generally a browser name, for example "Firefox"
# Variable { $deviceOS } is an operating system short name, for example "iOS", "Android"
pair-auth-complete-now-syncing-device-text = ਤੁਸੀਂ ਹੁਣ ਸਿੰਕ ਕਰ ਰਹੇ ਹੋ: { $deviceOS } ਉੱਤੇ { $deviceFamily }
pair-auth-complete-sync-benefits-text = ਤੁਸੀਂ ਆਪਣੀਆਂ ਖੋਲ੍ਹੀਆਂ ਤੈਬਾਂ, ਪਾਸਵਰਡ ਅਤੇ ਬੁੱਕਮਾਰਕਾਂ ਨੂੰ ਆਪਣੇ ਸਾਰੇ ਡਿਵਾਈਸਾਂ ਉੱਤੇ ਵਰਤ ਸਕਦੇ ਹੋ।
pair-auth-complete-see-tabs-button = ਸਿੰਕ ਕੀਤੇ ਡਿਵਾਈਸਾਂ ਤੋਂ ਟੈਬਾਂ ਵੇਖੋ
pair-auth-complete-manage-devices-link = ਡਿਵਾਈਸਾਂ ਦਾ ਬੰਦੋਬਸਤ ਕਰੋ

## AuthTotp page
## TOTP (time-based one-time password) is a form of two-factor authentication (2FA).
## Users that have set up two-factor authentication land on this page during device pairing.

# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "to continue to account settings" can stand alone as "Continue to account settings"
auth-totp-heading-w-default-service = <span>ਖਾਤਾ ਸੈਟਿੰਗਾਂ ਨਾਲ ਜਾਰੀ ਰੱਖਣ</span> ਲਈ ਪਰਮਾਣੀਕਰਨ ਕੋਡ ਦਿਓ
# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "to continue to { $serviceName }" can stand alone as "Continue to { $serviceName }"
# { $serviceName } represents a product name (e.g., Mozilla VPN) that will be passed in as a variable
auth-totp-heading-w-custom-service = <span>{ $serviceName } ਨਾਲ ਜਾਰੀ ਰੱਖਣ</span> ਲਈ ਪਰਮਾਣੀਕਰਨ ਕੋਡ ਦਿਓ
auth-totp-instruction = ਆਪਣੀ ਪਰਮਾਣੀਕਰਨ ਐਪ ਖੋਲ੍ਹੋ ਅਤੇ ਉਸ ਵਲੋਂ ਦਿੱਤਾ ਪਰਮਾਣੀਕਰਨ ਕੋਡ ਦਿਓ।
auth-totp-input-label = 6-ਅੰਕ ਦਾ ਕੋਡ ਦਿਓ
# Form button to confirm if the authentication code entered by the user is valid
auth-totp-confirm-button = ਤਸਦੀਕ
# Error displayed in a tooltip when the form is submitted without a code
auth-totp-code-required-error = ਪਰਮਾਣੀਕਰਨ ਕੋਡ ਚਾਹੀਦਾ ਹੈ

## WaitForSupp page - Part of the devide pairing flow
## Users see this page when they have started to pair a second (or more) device to their account
## The pairing must be approved from both devices to succeed

# The "other device" is non-specific and could be a desktop computer, laptop, tablet, mobile phone, etc.
# Strings within the <span> elements appear as a subheading.
pair-wait-for-supp-heading-text = ਹੁਣ <span>ਤੁਹਾਡੇ ਹੋਰ ਡਿਵਾਈਸ</span> ਤੋਂ ਮਨਜ਼ੂਰ ਚਾਹੀਦੀ ਹੈ

## PairFailure - a view which displays on failure of the device pairing process

pair-failure-header = ਪੇਅਰ ਕਰਨਾ ਕਾਮਯਾਬ ਨਹੀਂ ਹੈ
pair-failure-message = ਸੈਟਅਪ ਕਾਰਵਾਈ ਨੂੰ ਸਮਾਪਤ ਕੀਤਾ ਗਿਆ।

## Pair index page

pair-sync-header = ਆਪਣੇ ਫ਼ੋ ਜਾਂ ਟੇਬਲੇਟ ਉੱਤੇ { -brand-firefox } ਸਿੰਕ ਕਰੋ
pair-cad-header = ਹੋਰ ਡਿਵਾਈਸ ਉੱਤੇ { -brand-firefox } ਕਨੈਕਟ ਕਰੋ
pair-already-have-firefox-paragraph = ਫ਼ੋਨ ਜਾਂ ਟੇਬਲੇਟ ਉੱਤੇ { -brand-firefox } ਪਹਿਲਾਂ ਹੀ ਹੈ?
# Clicking this button initiates the pairing process, usually by directing the user to the `about:preferences` page in Firefox
pair-sync-your-device-button = ਆਪਣੇ ਡਿਵਾਈਸਾਂ ਨੂੰ ਸਿੰਕ ਕਰੋ
# This is a heading element immediately preceded by "Sync your device" and followed by a link and QR code to download Firefox
pair-or-download-subheader = ਜਾਂ ਡਾਊਨਲੋਡ ਕਰੋ
# This allows the user to exit the sync/pair flow, and redirects them back to Settings
pair-not-now-button = ਹੁਣੇ ਨਹੀਂ
pair-take-your-data-message = ਜਿੱਥੇ ਵੀ ਤੁਸੀਂ { -brand-firefox } ਵਰਤੋਂ, ਆਪਣੀਆਂ ਟੈਬਾਂ, ਬੁੱਕਮਾਰਕ ਤੇ ਪਾਸਵਰਡ ਆਪਣੇ ਨਾਲ ਰੱਖੋ।
# This initiates the pairing process, usually by directing the user to the `about:preferences` page in Firefox
pair-get-started-button = ਸ਼ੁਰੂ ਕਰੀਏ
# This is the aria label on the QR code image
pair-qr-code-aria-label = QR ਕੋਡ

## PairSuccess - a view which displays  on successful completion of the device pairing process

pair-success-header-2 = ਡਿਵਾਈਸ ਕਨੈਕਟ ਹੈ
pair-success-message-2 = ਪੇਅਰ ਕਰਨਾ ਕਾਮਯਾਬ ਹੈ।

## SuppAllow page - Part of the device pairing flow
## Users see this page when they have started to pair a second (or more) device to their account
## The pairing must be confirmed from both devices to succeed

# Strings within the <span> elements appear as a subheading.
# Variable $email is the user's email address
pair-supp-allow-heading-text = <span>{ $email } ਲਈ</span> ਪੇਅਰ ਕਰਨ ਨੂੰ ਤਸਦੀਕ ਕਰੋ
pair-supp-allow-confirm-button = ਪੇਅਰ ਕਰਨ ਦੀ ਤਸਦੀਕ ਕਰੋ
pair-supp-allow-cancel-link = ਰੱਦ ਕਰੋ

## WaitForAuth page - Part of the devide pairing flow
## Users see this page when they have started to pair a second (or more) device to their account
## The pairing must be approved from both devices to succeed

# The "other device" is non-specific and could be a desktop computer, laptop, tablet, mobile phone, etc.
# Strings within the <span> elements appear as a subheading.
pair-wait-for-auth-heading-text = ਹੁਣ <span>ਤੁਹਾਡੇ ਹੋਰ ਡਿਵਾਈਸ</span> ਤੋਂ ਮਨਜ਼ੂਰ ਚਾਹੀਦੀ ਹੈ

## PairUnsupported - a view which is shown when the user tries to scan the pairing QR code any way other than through a Firefox app

pair-unsupported-header = ਐਪ ਵਰਤ ਕੇ ਪੇਅਰ ਕਰੋ
pair-unsupported-message = ਕੀ ਤੁਸੀਂ ਸਿਸਟਮ ਕੈਮਰਾ ਵਰਤਿਆ ਸੀ? ਤੁਹਾਨੂੰ { -brand-firefox } ਐਪ ਤੋਂ ਪੇਅਰ ਕਰਨਾ ਪਵੇਗਾ।

## SetPassword page
## Third party auth users that do not have a password set yet are prompted for a


# password to complete their sign-in when they want to login to a service requiring it.

set-password-heading-v2 = ਸਿੰਕ ਕਰਨ ਲਈ ਪਾਸਵਰਡ ਬਣਾਓ

## ThirdPartyAuthCallback Page
## This page is called after a user completes the third party authentication flow from Google or Apple.

third-party-auth-callback-message = ਕਿਰਪਾ ਕਰਕੇ ਉਡੀਕੋ, ਤੁਹਾਨੂੰ ਪਰਮਾਣ ਕੀਤੀ ਐਪਲੀਕੇਸ਼ਨ ਲਈ ਭੇਜਿਆ ਜਾਵੇਗਾ।

## AccountRecoveryConfirmKey page

account-recovery-confirm-key-heading = ਆਪਣੀ ਖਾਤਾ ਰਿਕਵਰੀ ਕੁੰਜੀ ਦਿਓ
# Prompts the user to enter their account recovery key
# Account recovery key contains a mix of letters and numbers, no special characters
account-recovery-confirm-key-input-label =
    .label = ਆਪਣੀ 32-ਅੱਖਰਾਂ ਦੀ ਖਾਤਾ ਰਿਕਵਰੀ ਕੁੰਜੀ ਦਿਓ
# When setting up an account recovery key, users have the option of storing an account recovery key hint that is shown during password reset
account-recovery-confirm-key-hint = ਤੁਹਾਡਾ ਸਟੋਰੇਜ਼ ਇਸ਼ਾਰਾ ਹੈ:
# Clicking this button checks if the recovery key provided by the user is correct and associated with their account
account-recovery-confirm-key-button-2 = ਜਾਰੀ ਰੱਖੋ
# Link that leads to the password reset page (without recovery code)
account-recovery-lost-recovery-key-link-2 = ਤੁਹਾਡੀ ਖਾਤਾ ਰਿਕਵਰੀ ਕੁੰਜੀ ਨਹੀਂ ਲੱਭੀ?

## CompleteResetPassword component
## User followed a password reset link and is now prompted to create a new password

complete-reset-pw-header-v2 = ਨਵਾਂ ਪਾਸਵਰਡ ਬਣਾਓ
# A new password was successfully set for the user's account
# Displayed in an alert bar
complete-reset-password-success-alert = ਪਾਸਵਰਡ ਸੈਟ ਕਰੋ
# An error occurred while attempting to set a new password (password reset flow)
# Displayed in an alert bar
complete-reset-password-error-alert = ਅਫ਼ਸੋਸ, ਤੁਹਾਡੇ ਪਾਸਵਰਡ ਸੈਟ ਕਰਨ ਦੌਰਾਨ ਸਮੱਸਿਆ ਆਈ ਸੀ
# Link to go back and use an account recovery key before resetting the password
complete-reset-pw-recovery-key-link = ਖਾਤਾ ਰਿਕਵਰੀ ਕੁੰਜੀ ਨੂੰ ਵਰਤੋਂ
# A message informing the user that the password reset was successful and reminding them to create another recovery key
# Displayed on the sign in page
reset-password-complete-banner-heading = ਤੁਹਾਡੇ ਪਾਸਵਰਡ ਨੂੰ ਮੁੜ ਸੈੱਟ ਕੀਤਾ ਗਿਆ ਹੈ।

# ConfirmBackupCodeResetPassword page

confirm-backup-code-reset-password-input-label = 10-ਅੰਕ ਦਾ ਕੋਡ ਦਿਓ
confirm-backup-code-reset-password-confirm-button = ਤਸਦੀਕ
confirm-backup-code-reset-password-subheader = ਬੈਕਅੱਪ ਪਰਮਾਣੀਕਰਨ ਕੋਡ ਦਿਓ
# Link out to support article: https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication
confirm-backup-code-reset-password-locked-out-link = ਕੀ ਤੁਸੀਂ ਲਾਕ-ਆਉਟ ਹੋ ਚੁੱਕੇ ਹੋ?

## Confirm Reset Password With Code

confirm-reset-password-with-code-heading = ਆਪਣੀ ਈਮੇਲ ਦੀ ਜਾਂਚ ਕਰੋ
# Text within span appears in bold
# $email - email address for which a password reset was requested
confirm-reset-password-with-code-instruction = ਅਸੀਂ <span>{ $email }</span> ਨੂੰ ਤਸਦੀਕੀਕਰਨ ਕੋਡ ਭੇਜਿਆ ਹੈ।
# Shown above a group of 8 single-digit input boxes
# Only numbers allowed
confirm-reset-password-code-input-group-label = 10 ਮਿੰਟਾਂ ਦੇ ਵਿੱਚ ਵਿੱਚ 8 ਅੰਕਾਂ ਦਾ ਕੋਡ ਦਿਓ
# Clicking the button submits and verifies the code
# If succesful, continues to the next step of the password reset
confirm-reset-password-otp-submit-button = ਜਾਰੀ ਰੱਖੋ
# Button to request a new reset password confirmation code
confirm-reset-password-otp-resend-code-button = ਕੋਡ ਫੇਰ ਭੇਜੋ
# Link to cancel the password reset and sign in with a different account
confirm-reset-password-otp-different-account-link = ਵੱਖਰੇ ਖਾਤੇ ਨੂੰ ਵਰਤੋਂ

## PasswordResetConfirmTotp Page

confirm-totp-reset-password-header = ਆਪਣਾ ਪਾਸਵਰਡ ਮੁੜ-ਸੈੱਟ ਕਰੋ
confirm-totp-reset-password-subheader-v2 = ਦੋ-ਪੜ੍ਹਾਵੀ ਪਰਮਾਣੀਕਰਨ ਕੋਡ ਦਿਓ
confirm-totp-reset-password-instruction-v2 = ਆਪਣੇ ਪਾਸਵਰਡ ਨੂੰ ਮੁੜ-ਸੈੱਟ ਕਰਨ ਲਈ ਆਪਣੀ <strong>ਪਰਮਾਣੀਕਰਨ ਐਪ</strong> ਦੀ ਜਾਂਚ ਕਰੋ।
confirm-totp-reset-password-trouble-code = ਕੋਡ ਦਰਜ ਕਰਨ ਲਈ ਸਮੱਸਿਆ ਹੈ?
confirm-totp-reset-password-confirm-button = ਤਸਦੀਕ
confirm-totp-reset-password-input-label-v2 = 6-ਅੰਕ ਦਾ ਕੋਡ ਦਿਓ
confirm-totp-reset-password-use-different-account = ਵੱਖਰੇ ਖਾਤੇ ਨੂੰ ਵਰਤੋਂ

## ResetPassword start page

password-reset-flow-heading = ਆਪਣਾ ਪਾਸਵਰਡ ਬਦਲੋ
password-reset-body-2 = ਤੁਹਾਡੇ ਖਾਤੇ ਨੂੰ ਸੁਰੱਖਿਅਤ ਰੱਖਣ ਲਈ ਅਸੀਂ ਕੁਝ ਸਵਾਲ ਪੁੱਛਾਂਗੇ, ਜਿਸੇ ਬਾਰੇ ਸਿਰਫ਼ ਤੁਹਾਨੂੰ ਪਤਾ ਹੈ।
password-reset-email-input =
    .label = ਆਪਣਾ ਈਮੇਲ ਦਿਓ
password-reset-submit-button-2 = ਜਾਰੀ ਰੱਖੋ

## ResetPasswordConfirmed

reset-password-complete-header = ਤੁਹਾਡੇ ਪਾਸਵਰਡ ਨੂੰ ਮੁੜ ਸੈੱਟ ਕੀਤਾ ਗਿਆ ਹੈ
# $serviceName is a product name such as Monitor, Relay
reset-password-confirmed-cta = { $serviceName } ਨਾਲ ਜਾਰੀ ਰੱਖੋ

## Reset password recovery method page
## This page is shown to users when they are having trouble resetting their


# password, and they previously had set up an account recovery method.

password-reset-recovery-method-header = ਆਪਣੇ ਪਾਸਵਰਡ ਨੂੰ ਮੁੜ-ਸੈੱਟ ਕਰੋ
password-reset-recovery-method-subheader = ਕਿਸੇ ਰਿਕਵਰੀ ਢੰਗ ਨੂੰ ਚੁਣੋ
# This is displayed to the user when they are choosing an alternative method to authenticate themself in the password reset process when they do not have access to their two-factor authenticator application
password-reset-recovery-method-details = ਆਓ ਇਹ ਪੱਕਾ ਕਰੀਏ ਇਹ ਤੁਸੀਂ ਹੀ ਹੋ, ਜੋ ਆਪਣੇ ਰਿਕਵਰੀ ਢੰਗ ਵਰਤ ਰਹੇ ਹੋ।
password-reset-recovery-method-phone = ਰਿਕਵਰੀ ਫ਼ੋਨ
password-reset-recovery-method-code = ਬੈਕਅੱਪ ਪਰਮਾਣੀਕਰਨ ਕੋਡ

## ResetPasswordRecoveryPhone page

reset-password-recovery-phone-flow-heading = ਆਪਣੇ ਪਾਸਵਰਡ ਨੂੰ ਮੁੜ-ਸੈੱਟ ਕਰੋ
# A recovery code in context of this page is a one time code sent to the user's phone
reset-password-recovery-phone-heading = ਰਿਕਵਰੀ ਕੋਡ ਭਰੋ
reset-password-recovery-phone-input-label = 6-ਅੰਕ ਦਾ ਕੋਡ ਦਿਓ
reset-password-recovery-phone-code-submit-button = ਤਸਦੀਕ
reset-password-recovery-phone-resend-code-button = ਕੋਡ ਮੁੜ ਕੇ ਭੇਜੋ
reset-password-recovery-phone-resend-success = ਕੋਡ ਭੇਜਿਆ
# links to https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication
reset-password-recovery-phone-locked-out-link = ਕੀ ਤੁਸੀਂ ਲਾਕ-ਆਉਟ ਹੋ ਚੁੱਕੇ ਹੋ?
reset-password-recovery-phone-send-code-error-heading = ਕੋਡ ਭੇਜਣ ਦੌਰਾਨ ਸਮੱਸਿਆ ਆਈ ਸੀ
reset-password-recovery-phone-code-verification-error-heading = ਤੁਹਾਡੇ ਕੋਡ ਨੂੰ ਤਸਦੀਕ ਕਰਨ ਦੌਰਾਨ ਸਮੱਸਿਆ ਆਈ ਸੀ
# Follows the error message (e.g, "There was a problem sending a code")
reset-password-recovery-phone-general-error-description = ਬਾਅਦ ਵਿੱਚ ਕੋਸ਼ਿਸ ਕਰੋ ਜੀ।
reset-password-recovery-phone-invalid-code-error-description = ਕੋਡ ਗਲਤ ਹੈ ਜਾਂ ਮਿਆਦ ਪੁੱਗੀ ਹੈ।
reset-password-with-recovery-key-verified-page-title = ਪਾਸਵਰਡ ਮੁੜ-ਸੈਟ ਕਰਨਾ ਕਾਮਯਾਬੀ ਰਿਹਾ
reset-password-complete-new-password-saved = ਨਵਾਂ ਪਾਸਵਰਡ ਸੰਭਾਲਿਆ!
reset-password-complete-recovery-key-created = ਨਵੀਂ ਖਾਤਾ ਰਿਕਵਰੀ ਕੁੰਜੀ ਬਣਾਈ ਗਈ। ਇਸ ਨੂੰ ਹੁਣੇ ਡਾਊਨਲੋਡ ਕਰਕੇ ਸੰਭਾਲੋ।

## CompleteSignin component

# This is a label that precedes any error which could arise from trying to validate the user's signin
error-label = ਗਲਤੀ:
# This is a message that is shown to users along with a "Loading" spinner while the site tries to check their signin
validating-signin = …ਸਾਈਨ-ਇਨ ਨੂੰ ਪਰਮਾਣਿਤ ਕੀਤਾ ਜਾ ਰਿਹਾ ਹੈ
# Shown above an error banner (e.g., invalid confirmation code, unexpected error)
complete-signin-error-header = ਤਸਦੀਕ ਲਈ ਗਲਤੀ
# The user followed a signin confirmation link, but that link is expired and no longer valid
signin-link-expired-header = ਤਸਦੀਕੀ ਲਿੰਕ ਦੀ ਮਿਆਦ ਪੁੱਗੀ
signin-link-expired-message-2 = ਤੁਹਾਡੇ ਵਲੋਂ ਕਲਿੱਕ ਕੀਤੇ ਲਿੰਕ ਦੀ ਮਿਆਦ ਪੁੱਗ ਗਈ ਸੀ ਜਾਂ ਪਹਿਲਾਂ ਹੀ ਵਰਤਿਆ ਜਾ ਚੁੱਕਾ ਹੈ।

## Signin page

# Strings within the <span> elements appear as a subheading.
signin-password-needed-header-2 = <span>ਆਪਣੇ { -product-mozilla-account }</span> ਲਈ ਆਪਣਾ ਪਾਸਵਰਡ ਦਿਓ
# $serviceName - the name of the service which the user authenticating for
# For languages structured like English, the phrase can read "to continue to { $serviceName }"
signin-subheader-without-logo-with-servicename = { $serviceName } ਨਾਲ ਜਾਰੀ ਰੱਖੋ
signin-subheader-without-logo-default = ਖਾਤਾ ਸੈਟਿੰਗਾਂ ਨਾਲ ਜਾਰੀ ਰੱਖੋ
signin-button = ਸਾਈਨ ਇਨ
signin-header = ਸਾਈਨ ਇਨ
signin-use-a-different-account-link = ਵੱਖਰੇ ਖਾਤੇ ਨੂੰ ਵਰਤੋਂ
signin-forgot-password-link = ਪਾਸਵਰਡ ਭੁੱਲ ਗਏ ਹੋ?
signin-password-button-label = ਪਾਸਵਰਡ
signin-code-expired-error = ਕੋਡ ਦੀ ਮਿਆਦ ਪੁੱਗੀ। ਫੇਰ ਸਾਈਨ ਇਨ ਕਰੋ।
signin-account-locked-banner-heading = ਆਪਣੇ ਪਾਸਵਰਡ ਨੂੰ ਮੁੜ-ਸੈੱਟ ਕਰੋ
signin-account-locked-banner-description = ਤੁਹਾਡੇ ਖਾਤੇ ਨੂੰ ਸ਼ੱਕੀ ਸਰਗਰਮੀ ਤੋਂ ਸੁਰੱਖਿਅਤ ਰੱਖਣ ਵਾਸਤੇ ਅਸੀਂ ਇਸ ਨੂੰ ਲਾਕ ਕਰ ਦਿੱਤਾ ਹੈ।
# This link points to https://accounts.firefox.com/reset_password
signin-account-locked-banner-link = ਸਾਈਨ ਇਨ ਕਰਨ ਲਈ ਆਪਣੇ ਪਾਸਵਰਡ ਨੂੰ ਮੁੜ-ਸੈੱਟ ਕਰੋ

## ReportSignin Page
## When users receive an "Is this you signing in?" email with an unblock code,
## they can click "report it to us" if they did not attempt to sign in.
## This will be the page shown to users to block the sign in and report it.

report-signin-link-damaged-body = ਤੁਹਾਡੇ ਵਲੋਂ ਕਲਿਕ ਕੀਤੇ ਗਏ ਲਿੰਕ ਵਿੱਚ ਅੱਖਰ ਗੁੰਮ ਹਨ ਅਤੇ ਤੁਹਾਡੇ ਈਮੇਲ ਕਲਾਇਟ ਵਲੋਂ ਖ਼ਰਾਬ ਕੀਤੇ ਗਏ ਹੋ ਸਕਦੇ ਹਨ। ਸਿਰਨਾਵਾਂ ਲਿੰਕ ਨੂੰ ਧਿਆਨ ਨਾਲ ਕਾਪੀ ਕਰੋ ਅਤੇ ਫੇਰ ਕੋਸ਼ਿਸ਼ ਕਰੋ।
report-signin-header = ਅਣ-ਅਧਿਕਾਰਤ ਸਾਈਨ-ਇਨ ਦੀ ਰਿਪੋਰਟ ਕਰਨੀ ਨੈ?
report-signin-body = ਤੁਹਾਨੂੰ ਆਪਣੇ ਖਾਤੇ ਦੀ ਪਹੁੰਚ ਦੀ ਕੋਸ਼ਿਸ਼ ਬਾਰੇ ਈਮੇਲ ਮਿਲੀ ਹੈ। ਕੀ ਤੁਸੀਂ ਇਸ ਸਰਗਰਮੀ ਨੂੰ ਸ਼ੱਕੀ ਵਜੋਂ ਰਿਪੋਰਟ ਕਰਨਾ ਚਾਹੁੰਦੇ ਹੋ?
report-signin-submit-button = ਸਰਗਰਮੀ ਦੀ ਜਾਣਕਾਰੀ ਦਿਓ
report-signin-support-link = ਇਹ ਕਿਓ ਵਾਪਰਿਆ ਹੈ?
report-signin-error = ਅਫ਼ਸੋਸ, ਰਿਪੋਰਟ ਭੇਜਣ ਦੌਰਾਨ ਸਮੱਸਿਆ ਸੀ।
signin-bounced-header = ਅਫ਼ਸੋਸ। ਅਸੀਂ ਤੁਹਾਡੇ ਖਾਤੇ ਨੂੰ ਜ਼ਬਤ ਕੀਤਾ ਹੈ।
# $email (string) - The user's email.
signin-bounced-message = ਸਾਡੇ ਵਲੋਂ { $email } ਨੂੰ ਭੇਜੀ ਤਸਦੀਕੀ ਈਮੇਲ ਬੇਰੰਗ ਪਰਤ ਆਈ ਅਤੇ ਤੁਹਾਡੇ { -brand-firefox } ਖਾਤੇ ਨੂੰ ਸੁਰੱਖਿਅਤ ਕਰਨ ਲਈ ਅਸੀਂ ਤੁਹਾਡੇ ਖਾਤੇ ਨੂੰ ਜ਼ਬਤ ਕਰ ਲਿਆ ਹੈ।
# linkExternal is button which logs the user's action and navigates them to mozilla support
signin-bounced-help = ਜੇ ਇਹ ਵਾਜਬ ਈਮੇਲ ਸਿਰਨਾਵਾਂ ਹੈ ਤਾਂ <linkExternal>ਸਾਨੂੰ ਦੱਸੋ</linkExternal> ਅਤੇ ਅਸੀਂ ਤੁਹਾਡੇ ਖਾਤੇ ਨੂੰ ਬਹਾਲ ਕਰਨ ਲਈ ਮਦਦ ਕਰ ਸਕਦੇ ਹਾਂ।
signin-bounced-create-new-account = ਉਹ ਈਮੇਲ ਹੁਣ ਤੁਹਾਡਾ ਨਹੀਂ ਹੈ? ਨਵਾਂ ਖਾਤਾ ਬਣਾਓ
back = ਪਿੱਛੇ

## SigninPushCode page
## This page is used to send a push notification to the user's device for two-factor authentication (2FA).

signin-push-code-heading-w-default-service = ਖਾਤਾ ਸੈਟਿੰਗਾਂ ਨਾਲ ਜਾਰੀ ਰੱਖਣ ਲਈ<span>ਇਹ ਲਾਗਇਨ ਨੂੰ ਤਸਦੀਕ ਕਰੋ</span>
signin-push-code-heading-w-custom-service = ਇਸ { $serviceName } ਨਾਲ ਜਾਰੀ ਰੱਖਣ <span>ਇਸ ਲਾਗਇਨ ਨੂੰ ਤਸਦੀਕ ਕਰੋ</span>
signin-push-code-did-not-recieve = ਨੋਟੀਫਿਕੇਸ਼ਨ ਨਹੀਂ ਮਿਲਿਆ?
signin-push-code-send-email-link = ਈਮੇਲ ਕੋਡ

## SigninPushCodeConfirmPage

signin-push-code-confirm-instruction = ਆਪਣੇ ਲਾਗਇਨ ਨੂੰ ਤਸਦੀਕ ਕਰੋ
signin-push-code-confirm-description = ਸਾਨੂੰ ਅੱਗੇ ਦਿੱਤੇ ਡਿਵਾਈਸ ਤੋਂ ਲਾਗਇਨ ਦੀ ਕੋਸ਼ਿਸ ਬਾਰੇ ਪਤਾ ਲੱਗਾ ਹੈ। ਜੇ ਇਹ ਤੁਸੀਂ ਸੀ ਤਾਂ ਲਾਗਇਨ ਨੂੰ ਮਨਜ਼ੂਰ ਕਰੋ।
signin-push-code-confirm-verifying = ਜਾਂਚ ਜਾਰੀ ਹੈ
signin-push-code-confirm-login = ਲਾਗਇਨ ਦੀ ਤਸਦੀਕ
signin-push-code-confirm-wasnt-me = ਇਹ ਮੈਂ ਨਹੀਂ ਸੀ, ਪਾਸਵਰਡ ਨੂੰ ਬਦਲੋ।
signin-push-code-confirm-login-approved = ਤੁਹਾਡੇ ਲਾਗਇਨ ਨੂੰ ਮਨਜ਼ੂਰ ਕੀਤਾ ਗਿਆ ਹੈ। ਇਸ ਵਿੰਡੋ ਨੂੰ ਬੰਦ ਕਰੋ।
signin-push-code-confirm-link-error = ਲਿੰਕ ਨੁਕਾਸਿਆ ਗਿਆ। ਫੇਰ ਕੋਸ਼ਿਸ਼ ਕਰੋ ਜੀ।

## Signin recovery method page
## This page is shown to users when they are having trouble signing in with
## their password, and they previously had set up an account recovery method.

signin-recovery-method-header = ਸਾਈਨ ਇਨ
signin-recovery-method-subheader = ਰਿਕਵਰੀ ਢੰਗ ਚੁਣੋ
signin-recovery-method-details = ਆਓ ਇਹ ਪੱਕਾ ਕਰੀਏ ਇਹ ਤੁਸੀਂ ਹੀ ਹੋ, ਜੋ ਆਪਣੇ ਰਿਕਵਰੀ ਢੰਗ ਵਰਤ ਰਹੇ ਹੋ।
signin-recovery-method-phone = ਰਿਕਵਰੀ ਫ਼ੋਨ
signin-recovery-method-code-v2 = ਬੈਕਅੱਪ ਪਰਮਾਣੀਕਰਨ ਕੋਡ
# Variable: $numBackupCodes (String) - The number of backup authentication codes the user has left, e.g., 4
signin-recovery-method-code-info-v2 =
    { $numBackupCodes ->
        [one] { $numBackupCodes } ਕੋਡ ਬਾਕੀ ਹੈ
       *[other] { $numBackupCodes } ਕੋਡ ਬਾਕੀ ਹਨ
    }

## SigninRecoveryCode page
## Users are prompted to enter a backup authentication code
## (provided to the user when they first set up two-step authentication)
## when they are unable to sign in with two-step authentication (e.g., Authy, Duo, etc.)

signin-recovery-code-heading = ਸਾਈਨ ਇਨ
signin-recovery-code-sub-heading = ਬੈਕਅੱਪ ਪਰਮਾਣੀਕਰਨ ਕੋਡ ਦਿਓ
# code here refers to backup authentication code
signin-recovery-code-input-label-v2 = 10-ਅੰਕ ਦਾ ਕੋਡ ਦਿਓ
# Form button to confirm if the backup authentication code entered by the user is valid
signin-recovery-code-confirm-button = ਤਸਦੀਕ
# Link to go to the page to use recovery phone instead
signin-recovery-code-phone-link = ਰਿਕਵਰੀ ਫ਼ੋਨ ਨੂੰ ਵਰਤੋ
# External link for support if the user can't use two-step autentication or a backup authentication code
# https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication
signin-recovery-code-support-link = ਕੀ ਤੁਸੀਂ ਲਾਕ-ਆਉਟ ਹੋ ਚੁੱਕੇ ਹੋ?
# Error displayed in a tooltip when form is submitted witout a code
signin-recovery-code-required-error = ਬੈਕਅੱਪ ਪਰਮਾਣੀਕਰਨ ਕੋਡ ਚਾਹੀਦਾ ਹੈ
signin-recovery-code-use-phone-failure-description = ਬਾਅਦ ਵਿੱਚ ਕੋਸ਼ਿਸ ਕਰੋ ਜੀ।

## SigninRecoveryPhone page

signin-recovery-phone-flow-heading = ਸਾਈਨ ਇਨ
# A recovery code in context of this page is a one time code sent to the user's phone
signin-recovery-phone-heading = ਰਿਕਵਰੀ ਕੋਡ ਭਰੋ
signin-recovery-phone-input-label = 6-ਅੰਕ ਦਾ ਕੋਡ ਦਿਓ
signin-recovery-phone-code-submit-button = ਤਸਦੀਕ
signin-recovery-phone-resend-code-button = ਕੋਡ ਮੁੜ ਕੇ ਭੇਜੋ
signin-recovery-phone-resend-success = ਕੋਡ ਭੇਜਿਆ
# links to https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication
signin-recovery-phone-locked-out-link = ਕੀ ਤੁਸੀਂ ਲਾਕ-ਆਉਟ ਹੋ ਚੁੱਕੇ ਹੋ?
signin-recovery-phone-send-code-error-heading = ਕੋਡ ਭੇਜਣ ਦੌਰਾਨ ਸਮੱਸਿਆ ਆਈ ਸੀ
signin-recovery-phone-code-verification-error-heading = ਤੁਹਾਡੇ ਕੋਡ ਨੂੰ ਤਸਦੀਕ ਕਰਨ ਦੌਰਾਨ ਸਮੱਸਿਆ ਆਈ ਸੀ
# Follows the error message (e.g, "There was a problem sending a code")
signin-recovery-phone-general-error-description = ਬਾਅਦ ਵਿੱਚ ਕੋਸ਼ਿਸ ਕਰੋ ਜੀ।
signin-recovery-phone-invalid-code-error-description = ਕੋਡ ਗਲਤ ਹੈ ਜਾਂ ਮਿਆਦ ਪੁੱਗੀ ਹੈ।
signin-recovery-phone-invalid-code-error-link = ਇਸ ਦੀ ਬਜਾਏ ਬੈਕਅੱਪ ਪਰਮਾਣੀਕਰਨ ਕੋਡ ਨੂੰ ਵਰਤਣਾ ਹੈ?

## Signin reported page: this page is shown when a user receives an email notifying them of a new account signin, and the user clicks a button indicating that the signin was not them so that we know it was someone trying to break into their account.

signin-reported-header = ਤੁਹਾਡੀ ਸਾਵਧਾਨੀ ਲਈ ਤੁਹਾਡਾ ਧੰਨਵਾਦ ਹੈ
signin-reported-message = ਸਾਡੀ ਟੀਮ ਨੂੰ ਜਾਣਕਾਰੀ ਦਿੱਤੀ ਜਾ ਚੁੱਕੀ ਹੈ। ਇਸ ਵਰਗੀਆਂ ਰਿਪੋਰਟਾਂ ਸਾਨੂੰ ਘੁਸਪੈਠੀਆਂ ਤੋਂ ਬਚਾਉਣ ਲਈ ਮਦਦ ਕਰਦੀਆਂ ਹਨ।

## SigninTokenCode page
## Users see this page during the signin process. In this instance, the confirmation code is
## a 6-digit code that is sent to the user's email address.

# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "for your { -product-mozilla-account }"
# can stand alone as "{ -product-mozilla-account }"
signin-token-code-heading-2 = <span>ਆਪਣੇ { -product-mozilla-account }</span> ਲਈ ਤਸਦੀਕੀਕਰਨ ਕੋਡ ਦਿਓ
signin-token-code-input-label-v2 = 6-ਅੰਕ ਦਾ ਕੋਡ ਦਿਓ
# Form button to confirm if the confirmation code entered by the user is valid
signin-token-code-confirm-button = ਤਸਦੀਕ
signin-token-code-code-expired = ਕੋਡ ਦੀ ਮਿਆਦ ਪੁੱਗੀ?
# Link to resend a new code to the user's email.
signin-token-code-resend-code-link = ਨਵਾਂ ਕੋਡ ਈਮੇਲ ਕਰੋ।
# Error displayed in a tooltip when the form is submitted without a code
signin-token-code-required-error = ਤਸਦੀਕੀ ਕੋਡ ਚਾਹੀਦਾ ਹੈ
signin-token-code-resend-error = ਕੁਝ ਗਲਤ ਵਾਪਰਿਆ ਹੈ। ਨਵਾਂ ਕੋਡ ਭੇਜਿਆ ਨਹੀਂ ਜਾ ਸਕਿਆ।

## SigninTOTPCode page
## TOTP (time-based one-time password) is a form of two-factor authentication (2FA).
## Users that have set up two-factor authentication land on this page during sign-in.

signin-totp-code-header = ਸਾਈਨ ਇਨ
signin-totp-code-subheader-v2 = ਦੋ-ਪੜ੍ਹਾਵੀ ਪਰਮਾਣੀਕਰਨ ਕੋਡ ਦਿਓ
signin-totp-code-instruction-v4 = ਆਪਣੇ ਸਾਈਨ-ਇਨ ਦੀ ਤਸਦੀਕ ਕਰਨ ਵਾਸਤੇ ਆਪਣੀ <strong>ਪਰਮਾਣੀਕਰਨ ਐਪ</strong> ਨੂੰ ਵੇਖੋ।
signin-totp-code-input-label-v4 = 6-ਅੰਕ ਦਾ ਕੋਡ ਦਿਓ
# Form button to confirm if the authentication code entered by the user is valid
signin-totp-code-confirm-button = ਤਸਦੀਕ
signin-totp-code-other-account-link = ਵੱਖਰੇ ਖਾਤੇ ਨੂੰ ਵਰਤੋਂ
signin-totp-code-recovery-code-link = ਕੋਡ ਦਰਜ ਕਰਨ ਲਈ ਸਮੱਸਿਆ ਹੈ?
# Error displayed in a tooltip when the form is submitted without a code
signin-totp-code-required-error = ਪਰਮਾਣੀਕਰਨ ਕੋਡ ਚਾਹੀਦਾ ਹੈ

## Signin Unblock Page
## Page shown when signin has been blocked by rate limiting (too many requests)

signin-unblock-header = ਇਸ ਸਾਇਨ ਇਨ ਨੂੰ ਪਰਮਾਣਿਤ ਕਰੋ
# Where $email is the email address entered for the sign-in attempt
signin-unblock-body = { $email } ਨੂੰ ਭੇਜੇ ਗਏ ਪਰਮਾਣੀਕਰਨ ਕੋਡ ਲਈ ਆਪਣੀ ਈਮੇਲ ਦੀ ਜਾਂਚ ਕਰੋ।
signin-unblock-code-input = ਪਰਮਾਣੀਕਰਨ ਕੋਡ ਦਿਓ
signin-unblock-submit-button = ਜਾਰੀ ਰੱਖੋ
# Shown when the user attempts to submit the form without including a code
signin-unblock-code-required-error = ਪਰਮਾਣੀਕਰਨ ਕੋਡ ਚਾਹੀਦਾ ਹੈ
signin-unblock-code-incorrect-length = ਪਰਮਾਣੀਕਰਨ ਕੋਡ 8 ਅੱਖਰਾਂ ਦਾ ਹੋਣਾ ਚਾਹੀਦਾ ਹੈ
signin-unblock-code-incorrect-format-2 = ਪਰਮਾਣੀਕਰਨ ਕੋਡ ਵਿੱਚ ਸਿਰਫ਼ ਅੱਖਰ ਅਤੇ/ਜਾਂ ਅੰਕ ਹੀ ਹੋ ਸਕਦੇ ਹਨ
signin-unblock-resend-code-button = ਇਨਬਾਕਸ ਜਾਂ ਸਪੈਮ ਫੋਲਡਰ ਵਿੱਚ ਨਹੀਂ? ਮੁੜ ਭੇਜੋ
signin-unblock-support-link = ਇਹ ਕਿਓ ਵਾਪਰਿਆ ਹੈ?

## ConfirmSignupCode page
## Users see this page after they have initiated account sign up,


# and a confirmation code has been sent to their email address.

# Page title show in browser title bar or page tab
confirm-signup-code-page-title = ਤਸਦੀਕੀਕਰਨ ਕੋਡ ਦਿਓ
# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "for your { -product-mozilla-account }"
# can stand alone as "{ -product-mozilla-account }"
confirm-signup-code-heading-2 = <span>ਆਪਣੇ { -product-mozilla-account }</span> ਲਈ ਤਸਦੀਕੀਕਰਨ ਕੋਡ ਦਿਓ
confirm-signup-code-input-label = 6-ਅੰਕ ਦਾ ਕੋਡ ਦਿਓ
# Form button to confirm if the confirmation code entered by the user is valid
confirm-signup-code-confirm-button = ਤਸਦੀਕ
confirm-signup-code-sync-button = ਸਿੰਕ ਕਰਨਾ ਸ਼ੁਰੂ
confirm-signup-code-code-expired = ਕੋਡ ਦੀ ਮਿਆਦ ਪੁੱਗੀ?
# Link to resend a new code to the user's email.
confirm-signup-code-resend-code-link = ਨਵਾਂ ਕੋਡ ਈਮੇਲ ਕਰੋ।
confirm-signup-code-success-alert = ਖਾਤਾ ਕਾਮਯਾਬੀ ਨਾਲ ਤਸਦੀਕ ਕੀਤਾ ਗਿਆ
# Error displayed in tooltip.
confirm-signup-code-is-required-error = ਤਸਦੀਕੀਕਰਨ ਕੋਡ ਚਾਹੀਦਾ ਹੈ

## Account Signup page
## This is the second page of the sign up flow, users have already entered their email

signup-heading-v2 = ਪਾਸਵਰਡ ਬਣਾਓ
# Clicking on this link returns the user to the beginning of the flow so they can enter a new email address
signup-change-email-link = ਈਮੇਲ ਬਦਲੋ

## SignupConfirmedSync page
## Shown to users when they finish confirming their account through Sync

signup-confirmed-sync-header = ਸਿੰਕ ਕਰਨਾ ਚਾਲੂ ਹੈ
signup-confirmed-sync-success-banner = { -product-mozilla-account } ਤਸਦੀਕ ਕੀਤਾ
signup-confirmed-sync-button = ਬਰਾਊਜ਼ ਕਰਨਾ ਸ਼ੁਰੂ ਕਰੋ
signup-confirmed-sync-add-device-link = ਹੋਰ ਡਿਵਾਈਸ ਨੂੰ ਜੋੜੋ
signup-confirmed-sync-manage-sync-button = ਸਿੰਕ ਦਾ ਇੰਤਜ਼ਾਮ
signup-confirmed-sync-set-password-success-banner = ਸਿੰਕ ਕਰਨ ਵਾਲਾ ਪਾਸਵਰਡ ਬਣਾਇਆ
