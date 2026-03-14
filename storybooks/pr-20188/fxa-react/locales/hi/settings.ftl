# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.


## Tooltip notifications for actions performed on account recovery keys or one-time use codes

datablock-download =
    .message = डाउनलोड की गई
datablock-copy =
    .message = कॉपी की गई

## FormVerifyTotp component
## Form to enter a time-based one-time-passcode (e.g., 6-digit numeric code or 8-digit alphanumeric code)


# GetDataTrio component, part of Account Recovery Key flow

get-data-trio-title-firefox = { -brand-firefox }

## Input Password

# Tooltip displayed on a password input visibility toggle. Expresses the toggle action, where clicking on the toggle will hide the password.
input-password-hide = पासवर्ड छिपाएं
# Tooltip displayed on a password input visibility toggle. Expresses the toggle action, where clicking on the toggle will show the password.
input-password-show = पासवर्ड दिखाएं

## Phone number component

# This is an aria-label available to screen readers for a selection list that includes country flags, country name and country code
input-phone-number-country-list-aria-label = देश चुनें
input-phone-number-enter-number = फ़ोन नंबर दर्ज करें
input-phone-number-country-united-states = संयुक्त राज्य अमेरिका
input-phone-number-country-canada = कनाडा

## User's avatar

avatar-your-avatar =
    .alt = आपका अवतार

##


# BentoMenu component

bento-menu-vpn-2 = { -product-mozilla-vpn }
bento-menu-monitor-3 = { -product-mozilla-monitor }
bento-menu-firefox-relay-2 = { -product-firefox-relay }
bento-menu-firefox-desktop = डेस्कटॉप के लिए { -brand-firefox } ब्राउज़र
bento-menu-firefox-mobile = मोबाइल के लिए { -brand-firefox } ब्राउज़र
bento-menu-made-by-mozilla = { -brand-mozilla } द्वारा निर्मित

##

cs-sign-out-button = साइन आउट करें

## Data collection section

dc-subheader-moz-accounts = { -product-mozilla-accounts }
dc-subheader-ff-browser = { -brand-firefox } ब्राउज़र
dc-learn-more = अधिक जानें

# DropDownAvatarMenu component

drop-down-menu-title-2 = { -product-mozilla-account } मेन्यू

## HeaderLockup component, the header in account settings

header-menu-open = मेन्यू बंद करें
header-title-2 = { -product-mozilla-account }

## Linked Accounts section

nav-linked-accounts = { la-heading }

## Modal - Default values for a message directed at the user where the user can typically Confirm or Cancel.

modal-close-title = बंद करें
modal-cancel-button = रद्द करें

## Modal Verify Session

msv-cancel-button = रद्द करें

## Settings Nav

nav-settings = सेटिंग
nav-profile = प्रोफाइल

## Avatar change page

avatar-page-add-photo-button =
    .title = { avatar-page-add-photo }
avatar-page-take-photo-button =
    .title = { avatar-page-take-photo }
avatar-page-remove-photo-button =
    .title = { avatar-page-remove-photo }
avatar-page-cancel-button = रद्द करें
avatar-page-save-button = सहेजें

## Password change page

pw-change-header =
    .title = पासवर्ड बदलें
pw-change-cancel-button = रद्द करें
pw-change-save-button = सहेजें
pw-change-forgot-password-link = पासवर्ड भूल गए?
pw-change-current-password =
    .label = वर्तमान पासवर्ड दर्ज करें
pw-change-new-password =
    .label = नया पासवर्ड दर्ज करें
pw-change-confirm-password =
    .label = नए पासवर्ड की पुष्टि करें

## Delete account page

delete-account-product-mozilla-account = { -product-mozilla-account }
delete-account-product-mozilla-vpn = { -product-mozilla-vpn }
delete-account-product-mdn-plus = { -product-mdn-plus }
delete-account-product-mozilla-monitor = { -product-mozilla-monitor }
delete-account-product-firefox-relay = { -product-firefox-relay }
delete-account-continue-button = जारी रखें
delete-account-password-input =
    .label = पासवर्ड दर्ज करें
delete-account-cancel-button = रद्द करें
delete-account-delete-button-2 = मिटाएं

## Display name page

display-name-page-title =
    .title = प्रदर्शित होने वाला नाम
display-name-input =
    .label = प्रदर्शित होने वाला नाम दर्ज करें
submit-display-name = सहेजें
cancel-display-name = रद्द करें

## Add secondary email page

add-secondary-email-enter-address =
    .label = ईमेल पता दर्ज करें
add-secondary-email-cancel-button = रद्द करें
add-secondary-email-save-button = सहेजें

## Verify secondary email page

verify-secondary-email-cancel-button = रद्द करें

## Product promotion

product-promo-monitor =
    .alt = { -product-mozilla-monitor }

## Profile section

profile-heading = प्रोफाइल
profile-display-name =
    .header = प्रदर्शित होने वाला नाम

## Sub-section row Defaults

row-defaults-action-add = जोड़ें
row-defaults-action-change = बदलें

## Secondary email sub-section on main Settings page

# Button to remove the secondary email
se-remove-email =
    .title = ईमेल हटाएं

## Two Step Auth sub-section on Settings main page

tfa-row-action-add = जोड़ें

## ThirdPartyAuth component
## This is a component that is used to display a list of third party providers (Apple, Google, etc.)

# This appears when a user has the option to authenticate via third party accounts in addition to their Firefox account.
# Firefox account login appears on top, and third party options appear on bottom.
# This string appears as a separation between the two, in the following order: "Enter your password" "Or"(this string) (continue-with-google-button with aria equivalent text) / (continue-with-apple-button with aria equivalent text)
third-party-auth-options-or = या

## Auth-server based errors that originate from backend service

auth-error-102 = अज्ञात खाता
auth-error-103 = गलत पासवर्ड
auth-error-110 = अमान्य टोकन

## Index / home page

index-email-input =
    .label = अपना ईमेल दर्ज करें

## Pair index page

# This allows the user to exit the sync/pair flow, and redirects them back to Settings
pair-not-now-button = अभी नहीं
# This is the aria label on the QR code image
pair-qr-code-aria-label = QR कोड

## SuppAllow page - Part of the device pairing flow
## Users see this page when they have started to pair a second (or more) device to their account
## The pairing must be confirmed from both devices to succeed

pair-supp-allow-cancel-link = रद्द करें
