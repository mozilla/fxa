# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.


## Tooltip notifications for actions performed on account recovery keys or one-time use codes

datablock-download =
    .message = దింపుకున్నవి
datablock-copy =
    .message = నకలు చేయబడినది
datablock-print =
    .message = ముద్రించబడింది

## FormVerifyTotp component
## Form to enter a time-based one-time-passcode (e.g., 6-digit numeric code or 8-digit alphanumeric code)


# GetDataTrio component, part of Account Recovery Key flow

get-data-trio-title-firefox = { -brand-firefox }
get-data-trio-title-firefox-recovery-key = { -brand-firefox } ఖాతా రికవరీ కీ

## Input Password

# Tooltip displayed on a password input visibility toggle. Expresses the toggle action, where clicking on the toggle will hide the password.
input-password-hide = సంకేతపదాన్ని దాచు
# Tooltip displayed on a password input visibility toggle. Expresses the toggle action, where clicking on the toggle will show the password.
input-password-show = సంకేతపదాన్ని చూపించు

## Ready component

# This is a string that tells the user they can use whatever service prompted them to reset their password or to verify their email
# Variables:
# { $serviceName } represents a product name (e.g., Mozilla VPN) that will be passed in as a variable
ready-use-service = మీరు ఇప్పుడు { $serviceName } ఉపయోగించడానికి సిద్ధంగా ఉన్నారు
# Message shown when the account is ready but the user is not signed in
ready-account-ready = మీ ఖాతా సిద్ధంగా ఉంది!
ready-continue = కొనసాగించు
sign-in-complete-header = సైన్ ఇన్ ధ్రువీకరించబడింది

## Alert Bar

alert-bar-close-message = సందేశాన్ని మూసివేయి

## User's avatar

avatar-your-avatar =
    .alt = మీ అవతారం

##


# BentoMenu component

bento-menu-made-by-mozilla = { -brand-mozilla } ద్వారా తయారు చేయబడింది

## Connect another device promo

connect-another-fx-mobile = మొబైల్ లేదా టాబ్లెట్‌లో { -brand-firefox } ని పొందండి

## Connected services section

cs-heading = సంధానిత సేవలు
cs-description = మీరు ఉపయోగిస్తున్న మరియు సైన్ ఇన్ చేసిన ప్రతిదీ.
# This string is used in a notification message near the top of the page.
# Variables:
#   $service (String) - the name of a device or service that uses Mozilla accounts
#                       (for example: "Firefox Lockwise")
cs-logged-out-2 = { $service } నుండి లాగ్ అవుట్ చేయబడింది
# Link text to a support page on missing or duplicate devices
cs-missing-device-help = తప్పినవి లేదా నకిలీ అంశాలు?

## The following are the options for selecting a reason for disconnecting the
## device

cs-disconnect-sync-opt-prefix = పరికరం:
cs-disconnect-sync-opt-suspicious = అనుమానాస్పదమైనది
cs-disconnect-sync-opt-lost = పోయింది లేదా దొంగిలించబడింది
cs-disconnect-sync-opt-old = పాతది లేదా భర్తీ చేయబడింది
cs-disconnect-sync-opt-duplicate = నకిలీ
cs-disconnect-sync-opt-not-say = చెప్పకూడదని అనుకుంటున్నాను

##

cs-disconnect-advice-confirm = సరే, అర్థమయ్యింది
cs-disconnect-lost-advice-heading = పోయిన లేదా దొంగిలించబడిన పరికరం డిస్‌కనెక్ట్ చేయబడింది
cs-disconnect-suspicious-advice-heading = అనుమానాస్పద పరికరం డిస్‌కనెక్ట్ చేయబడింది
cs-sign-out-button = సైన్ అవుట్ చేయండి

## Data collection section

dc-heading = డేటా సేకరణ మరియు ఉపయోగం
dc-learn-more = ఇంకా తెలుసుకోండి

# DropDownAvatarMenu component

drop-down-menu-sign-out = నిష్క్రమించు
drop-down-menu-sign-out-error-2 = క్షమించండి, మిమ్మల్ని సైన్ అవుట్ చేయడంలో సమస్య ఉంది

## Flow Container

flow-container-back = వెనుకకు

## HeaderLockup component, the header in account settings

header-menu-open = మెనుని మూసివేయండి
header-back-to-top-link =
    .title = తిరిగి పైకి
header-help = సహాయం

## Linked Accounts section

la-description = మీరు క్రింది ఖాతాలకు ప్రామాణీకరించిన ప్రాప్యతను కలిగి ఉన్నారు.
nav-linked-accounts = { la-heading }

## Modal - Default values for a message directed at the user where the user can typically Confirm or Cancel.

modal-close-title = మూసివేయి
modal-cancel-button = రద్దుచేయి

## Modal Verify Session

mvs-enter-verification-code-2 = మీ నిర్ధారణ కోడ్‌ని నమోదు చేయండి
msv-cancel-button = రద్దుచేయి
msv-submit-button-2 = నిర్థారించు

## Settings Nav

nav-settings = అమరికలు
nav-profile = ప్రొఫైలు
nav-security = భద్రత
nav-connected-services = సంధానిత సేవలు
nav-data-collection = డేటా సేకరణ మరియు ఉపయోగం

## Avatar change page

avatar-page-title =
    .title = ప్రొఫైల్ చిత్రం
avatar-page-add-photo = ఫోటోను జోడించండి
avatar-page-add-photo-button =
    .title = { avatar-page-add-photo }
avatar-page-take-photo = ఫోటో తీసుకో
avatar-page-take-photo-button =
    .title = { avatar-page-take-photo }
avatar-page-remove-photo = ఫోటోను తీసివేయండి
avatar-page-remove-photo-button =
    .title = { avatar-page-remove-photo }
avatar-page-cancel-button = రద్దుచేయి
avatar-page-save-button = భద్రపరుచు
avatar-page-saving-button = భద్రపరుస్తోంది…
avatar-page-zoom-in-button =
    .title = పెద్దదిగా చూపు
avatar-page-rotate-button =
    .title = తిప్పు
avatar-page-camera-error = కెమెరా ప్రారంభించడం సాధ్యం కాలేదు
avatar-page-new-avatar =
    .alt = కొత్త ప్రొఫైల్ చిత్రం

## Password change page

pw-change-header =
    .title = సంకేతపదాన్ని మార్చు
pw-8-chars = కనీసం 8 అక్షరాలు
pw-not-email = మీ ఇమెయిల్ చిరునామా కాదు
pw-change-must-match = కొత్త సంకేతపదం నిర్ధారణతో సరిపోలుతుంది
pw-commonly-used = సాధారణంగా ఉపయోగించే సంకేతపదం కాదు
pw-change-cancel-button = రద్దుచేయి
pw-change-save-button = భద్రపరుచు
pw-change-forgot-password-link = సంకేతపదం మరిచిపోయారా?
pw-change-current-password =
    .label = ప్రస్తుత సంకేతపదం నమోదు చేయండి
pw-change-new-password =
    .label = కొత్త సంకేతపదం ఇవ్వండి
pw-change-confirm-password =
    .label = కొత్త సంకేతపదంను నిర్ధారించండి
pw-change-success-alert-2 = సంకేతపదం నవీకరించబడింది

## Password create page

pw-create-header =
    .title = సంకేతపదం సృష్టించు
pw-create-success-alert-2 = సంకేతపదం అమరింది

## Delete account page

delete-account-header =
    .title = ఖాతాను తొలగించండి
delete-account-step-1-2 = 2లో 1వ దశ
delete-account-step-2-2 = 2లో 2వ దశ
delete-account-continue-button = కొనసాగించు
delete-account-password-input =
    .label = సంకేతపదం తెలపండి
delete-account-cancel-button = రద్దుచేయి
delete-account-delete-button-2 = తొలగించు

## Display name page

display-name-page-title =
    .title = చూపించే పేరు
submit-display-name = భద్రపరుచు
cancel-display-name = రద్దుచేయి

## Add secondary email page

add-secondary-email-step-1 = 2లో 1వ దశ
add-secondary-email-error-2 = ఈ ఇమెయిల్‌ని సృష్టించడంలో సమస్య ఏర్పడింది
add-secondary-email-page-title =
    .title = రెండవ ఇమెయిల్
add-secondary-email-enter-address =
    .label = ఇమెయిల్ చిరునామా ఇవ్వండి
add-secondary-email-cancel-button = రద్దుచేయి
add-secondary-email-save-button = భద్రపరుచు

## Verify secondary email page

add-secondary-email-step-2 = 2లో 2వ దశ
verify-secondary-email-page-title =
    .title = రెండవ ఇమెయిల్
verify-secondary-email-verification-code-2 =
    .label = మీ నిర్ధారణ కోడ్‌ని నమోదు చేయండి
verify-secondary-email-cancel-button = రద్దుచేయి
verify-secondary-email-verify-button-2 = నిర్ధారించు
# This string is an instruction in a form.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
verify-secondary-email-please-enter-code-2 = దయచేసి 5 నిమిషాల్లో <strong>{ $email }</strong>కి పంపబడిన నిర్ధారణ కోడ్‌ని నమోదు చేయండి.
# This string is a confirmation message shown after verifying an email.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
verify-secondary-email-success-alert-2 = { $email } విజయవంతంగా జోడించబడింది

##

# Link to delete account on main Settings page
delete-account-link = ఖాతాను తొలగించండి

## Profile section

profile-heading = ప్రొఫైలు
profile-picture =
    .header = చిత్రం
profile-display-name =
    .header = చూపించే పేరు
profile-primary-email =
    .header = ప్రాథమిక ఇమెయిల్

## Security section of Setting

security-heading = భద్రత
security-password =
    .header = సంకేతపదం
# This is a string that shows when the user's password was created.
# Variables:
#   $date (String) - a localized date and time string
security-password-created-date = సృష్టించినది { $date }
security-action-create = సృష్టించు

## Switch component

# Used as "title" attribute when the switch is "on" and interaction turns the switch to "off"
switch-turn-off = ఆపివేయి
# Used as "title" attribute when the switch is "off" and interaction turns the switch to "on"
switch-turn-on = ఆరంభించండి
# Used as "title" attribute when switch has been interacted with and form is submitting
switch-submitting = సమర్పిస్తోంది…

## Sub-section row Defaults

row-defaults-action-add = చేర్చు
row-defaults-action-change = మార్చు
row-defaults-action-disable = అచేతనం
row-defaults-status = ఏదీకాదు

## Account recovery key sub-section on main Settings page

rk-header-1 = ఖాతా పునరుద్ధరణ కీ
rk-enabled = చేతనం
rk-action-create = సృష్టించు
rk-action-remove = తీసివేయి
rk-key-removed-2 = ఖాతా పునరుద్ధరణ కీ తీసివేయబడింది
rk-cannot-remove-key = మీ ఖాతా పునరుద్ధరణ కీ తీసివేయబడలేదు.
rk-refresh-key-1 = ఖాతా పునరుద్ధరణ కీని రిఫ్రెష్ చేయండి
rk-content-explain = మీరు మీ పాస్‌వర్డ్‌ను మరచిపోయినప్పుడు మీ సమాచారాన్ని పునరుద్ధరించండి.

## Secondary email sub-section on main Settings page

# Button to remove the secondary email
se-remove-email =
    .title = ఇమెయిల్‌ని తీసివేయండి
# Button to refresh secondary email status
se-refresh-email =
    .title = ఇమెయిల్‌ని రిఫ్రెష్ చేయండి
se-unverified-2 = ధృవీకరించబడలేదు
# Default value for the secondary email
se-secondary-email-none = ఏదీకాదు

## Two Step Auth sub-section on Settings main page

tfa-row-header = రెండు-దశల ప్రమాణీకరణ
tfa-row-enabled = చేతనం
tfa-row-action-disable = అచేతనం
tfa-row-button-refresh =
    .title = రెండు-దశల ప్రమాణీకరణను రిఫ్రెష్ చేయండి
tfa-row-cannot-refresh =
    క్షమించండి, రెండు-దశల ప్రమాణీకరణను రిఫ్రెష్ చేయడంలో సమస్య ఉంది
    ప్రమాణీకరణ.
tfa-row-disable-modal-confirm = అచేతనం
# Shown in an alert bar after two-step authentication is disabled
tfa-row-disabled-2 = రెండు-దశల ప్రమాణీకరణ అచేతనమైనది

## Auth-server based errors that originate from backend service

auth-error-102 = గుర్తుతెలియని ఖాతా
auth-error-103 = సంకేతపదం తప్పు
auth-error-1008 = మీ కొత్త సంకేతపదం వేరుగా ఉండాలి

## ResetPasswordConfirmed

reset-password-complete-header = మీ సంకేతపదము మార్చబడినది.
