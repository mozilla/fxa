# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.


## Brand Messaging component
## Used to show in product messaging about upcoming brand changes

# This is an extra link element, that directs users to a page where they can learn more about the branding changes.
brand-learn-more = Իմանալ ավելին

## ButtonDownloadRecoveryKeyPDF
## Clicking on this button downloads a PDF file that contains the user's account recovery key
## The account recovery key can be used to recover data when users forget their account password

# Shown directly above recovery key value and preceeded by a key icon
recovery-key-pdf-key-legend = Հաշվի վերականգնման բանալի

## Tooltip notifications for actions performed on account recovery keys or one-time use codes

datablock-download =
    .message = Ներբեռնված
datablock-copy =
    .message = Պատճենված
datablock-print =
    .message = Տպվեց

## DeviceInfoBlock component
## The strings here are used to display information about the origin of activity happening on a user's account
## For example, when connecting another device to the user's account

# Variables { $city }, { $region }, { $country } represent the estimated location of the user's device
# For example, 'Vancouver, British Columbia, Canada (estimated)'
device-info-block-location-city-region-country = { $city }, { $region }, { $country } (մոտավոր)
# Variables { $region }, { $country } represent the estimated location of the user's device
# For example, 'British Columbia, Canada (estimated)'
device-info-block-location-region-country = { $region }, { $country } (մոտավոր)
# Variables { $city }, { $country } represent the estimated location of the user's device
# For example, 'Vancouver, Canada (estimated)'
device-info-block-location-city-country = { $city }, { $country } (մոտավոր)
# Variable { $country } represent the estimated location of the user's device
# For example, 'Canada (estimated)'
device-info-block-location-country = { $country } (մոտավոր)
# When an approximate location for the user's device could not be determined
device-info-block-location-unknown = Անհայտ վայր
# Variable { $browserName } is the browser that created the request (e.g., Firefox)
# Variable { $genericOSName } is the name of the operating system that created the request (e.g., MacOS, Windows, iOS)
device-info-browser-os = { $browserName } { $genericOSName }-ում
# Variable { $ipAddress } represents the IP address where the request originated
# The IP address is a string of numbers separated by periods (e.g., 192.158.1.38)
device-info-ip-address = IP հասցե՝ { $ipAddress }

## FormVerifyTotp component
## Form to enter a time-based one-time-passcode (e.g., 6-digit numeric code or 8-digit alphanumeric code)


# GetDataTrio component, part of Account Recovery Key flow

get-data-trio-title-firefox = { -brand-firefox }
get-data-trio-title-firefox-recovery-key = { -brand-firefox } հաշվի վերականգնման բանալի
get-data-trio-title-backup-verification-codes = Երկրորդական նույնականացման ծածկագիր
get-data-trio-download-2 =
    .title = Ներբեռնել
    .aria-label = Ներբեռնել
get-data-trio-copy-2 =
    .title = Պատճենել
    .aria-label = Պատճենել
get-data-trio-print-2 =
    .title = Տպել
    .aria-label = Տպել

## Input Password

# Tooltip displayed on a password input visibility toggle. Expresses the toggle action, where clicking on the toggle will hide the password.
input-password-hide = Թաքցնել գաղտնաբառը
# Tooltip displayed on a password input visibility toggle. Expresses the toggle action, where clicking on the toggle will show the password.
input-password-show = Ցուցադրել գաղտնաբառը

## Phone number component

# Back button on legal/terms or legal/privacy that takes users to the previous page
legal-back-button = Ետ

## LinkDamaged component

# The user followed a password reset link that was received by email
# but the link is damaged (for example mistyped or broken by the email client)
reset-pwd-link-damaged-header = Վերականգնված գաղտնաբառի հղումը վնասված է

## Ready component

ready-continue = Շարունակել
sign-in-complete-header = Մուտք գործումը հաստատվեց
sign-up-complete-header = Հաշիվը հաստատվեց
primary-email-verified-header = Հիմնական էլ. փոստը հաստատվեց

## Alert Bar

alert-bar-close-message = Փակել նամակը

## User's avatar

avatar-your-avatar =
    .alt = Ձեր ավատարը
avatar-default-avatar =
    .alt = Սկզբնադիր ավատար

##


# BentoMenu component

bento-menu-title-3 = { -brand-mozilla } արտադրանքներ

##

cs-disconnect-advice-confirm = Լավ, ստացվեց
