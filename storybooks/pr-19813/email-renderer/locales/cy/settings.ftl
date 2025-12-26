# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.


## Banner component

resend-code-success-banner-heading = Anfonwyd cod newydd i'ch e-bost.
resend-link-success-banner-heading = Anfonwyd dolen newydd i'ch e-bost.
# $accountsEmail is the Mozilla accounts sender email address (e.g. accounts@firefox.com)
resend-success-banner-description = Ychwanegu { $accountsEmail } i'ch cysylltiadau i sicrhau anfon llwyddiannus.

## Brand Messaging component
## Used to show in product messaging about upcoming brand changes

# This aria-label applies to the dismiss/close button of the banner
# This text is for screen-readers
brand-banner-dismiss-button-2 =
    .aria-label = Caewch y faner
# This message is displayed as the title element in the banner, prior to actually launching the new brand
brand-prelaunch-title = Bydd { -product-firefox-accounts } yn cael ei ailenwi yn { -product-mozilla-accounts } ar Dachwedd 1
# This message is displayed as sub title element in the banner, giving a it more context about the brand changes.
brand-prelaunch-subtitle = Byddwch yn dal i fewngofnodi gyda'r un enw defnyddiwr a chyfrinair, ac nid oes unrhyw newidiadau eraill i'r cynnyrch rydych chi'n eu defnyddio.
# This message is displayed as title element in the banner, after the brand changes take affect letting the user know that
# no action is required on their part
brand-postlaunch-title = Rydym wedi ailenwi { -product-firefox-accounts } i { -product-mozilla-accounts }. Byddwch yn dal i fewngofnodi gyda'r un enw defnyddiwr a chyfrinair, ac nid oes unrhyw newidiadau eraill i'r cynnyrch rydych chi'n eu defnyddio.
# This is an extra link element, that directs users to a page where they can learn more about the branding changes.
brand-learn-more = Dysgu rhagor
# Alt text for close banner image
brand-close-banner =
    .alt = Caewch y Faner
# Alt text for 'm' logo in banner header
brand-m-logo =
    .alt = Logo m { -brand-mozilla }

## ButtonBack component
## Allows users to click a back arrow to navigate to the previous page

button-back-aria-label = Nôl
button-back-title = Nôl

## ButtonDownloadRecoveryKeyPDF
## Clicking on this button downloads a PDF file that contains the user's account recovery key
## The account recovery key can be used to recover data when users forget their account password

# Button to download the account recovery key as a PDF file and navigate to the next step
# The next (and final) step is an optional prompt to save a storage hint
# .title will displayed as a tooltip on the button
recovery-key-download-button-v3 = Llwytho i lawr a pharhau
    .title = Llwytho i lawr a pharhau
recovery-key-pdf-heading = Allwedd Adfer Cyfrif
# Date when the account recovery key was created and this file was downloaded
# { $date }: formatted date with 'medium' dateStyle format (e.g., for 'en': Jul 31, 2023)
recovery-key-pdf-download-date = Cynhyrchwyd: { $date }
# Shown directly above recovery key value and preceeded by a key icon
recovery-key-pdf-key-legend = Allwedd Adfer Cyfrif
# Instructions in the text file to prompt the user to keep this information in a secure, easy to remember location.
# Password resets without this account recovery key can result in data loss.
# "key" here refers to "account recovery key"
recovery-key-pdf-instructions = Mae'r allwedd hon yn caniatáu ichi adfer data eich porwr wedi'i amgryptio (gan gynnwys cyfrineiriau, nodau tudalen, a hanes) os byddwch yn anghofio eich cyfrinair. Cadwch ef mewn man y byddwch yn ei gofio.
# This heading is shown above a list of options for storing the account recovery key
# "key" here refers to "account recovery key"
recovery-key-pdf-storage-ideas-heading = Lleoedd i gadw'ch allwedd
# Followed by a link (https://mzl.la/3bNrM1I) to get more information and support
recovery-key-pdf-support = Dysgwch fwy am allwedd adfer eich cyfrif
# Error message displayed in an alert bar if the PDF download failed.
recovery-key-pdf-download-error = Mae'n ddrwg gennym, roedd problem wrth lwytho allwedd adfer eich cyfrif.

## ChooseNewsletters component
## Checklist of newsletters that the user can choose to sign up to

# Prompt above a checklist of newsletters
choose-newsletters-prompt-2 = Cael mwy gan { -brand-mozilla }:
# Newsletter checklist item
choose-newsletters-option-latest-news =
    .label = Cael ein newyddion diweddaraf a diweddariadau cynnyrch
# Newsletter checklist item
choose-newsletters-option-test-pilot =
    .label = Mynediad cynnar i brofi cynnyrch newydd
# Newsletter checklist item. This for a Mozilla Foundation newsletters,
# "Action alerts" can be interpreted as "Calls to action"
choose-newsletters-option-reclaim-the-internet =
    .label = Rhybuddion gweithredu i adennill y rhyngrwyd

## Tooltip notifications for actions performed on account recovery keys or one-time use codes

datablock-download =
    .message = Wedi eu llwytho i lawr
datablock-copy =
    .message = Copïwyd
datablock-print =
    .message = Argraffwyd

## Success banners for datablock actions.
## $count – number of codes

datablock-copy-success =
    { $count ->
        [zero] Codau wedi eu copïo
        [one] Cod wedi'i gopïo
        [two] God wedi'u copïo
        [few] Chod wedi'u copïo
        [many] Chod wedi'u copïo
       *[other] Cod wedi'u copïo
    }
datablock-download-success =
    { $count ->
        [zero] Codau wedi'u llwytho i lawr
        [one] Cod wedi'i lwytho i lawr
        [two] God wedi'u llwytho i lawr
        [few] Chod wedi'u llwytho i lawr
        [many] Chod wedi'u llwytho i lawr
       *[other] Cod wedi'u llwytho i lawr
    }
datablock-print-success =
    { $count ->
        [zero] Codau wedi'u hargraffu
        [one] Cod wedi'i argraffu
        [two] God wedi'u hargraffu
        [few] Chod wedi'u hargraffu
        [many] Chod wedi'u hargraffu
       *[other] Cod wedi'u hargraffu
    }

##

# Tooltip notification when an account recovery key or one-time use code is copied.
datablock-inline-copy =
    .message = Copïwyd

## DeviceInfoBlock component
## The strings here are used to display information about the origin of activity happening on a user's account
## For example, when connecting another device to the user's account

# Variables { $city }, { $region }, { $country } represent the estimated location of the user's device
# For example, 'Vancouver, British Columbia, Canada (estimated)'
device-info-block-location-city-region-country = { $city }, { $region }, { $country } (amcan)
# Variables { $region }, { $country } represent the estimated location of the user's device
# For example, 'British Columbia, Canada (estimated)'
device-info-block-location-region-country = { $region }, { $country } (amcan)
# Variables { $city }, { $country } represent the estimated location of the user's device
# For example, 'Vancouver, Canada (estimated)'
device-info-block-location-city-country = { $city }, { $country } (amcan)
# Variable { $country } represent the estimated location of the user's device
# For example, 'Canada (estimated)'
device-info-block-location-country = { $country } (amcan)
# When an approximate location for the user's device could not be determined
device-info-block-location-unknown = Lleoliad anhysbys
# Variable { $browserName } is the browser that created the request (e.g., Firefox)
# Variable { $genericOSName } is the name of the operating system that created the request (e.g., MacOS, Windows, iOS)
device-info-browser-os = { $browserName } ar { $genericOSName }
# Variable { $ipAddress } represents the IP address where the request originated
# The IP address is a string of numbers separated by periods (e.g., 192.158.1.38)
device-info-ip-address = Cyfeiriad IP: { $ipAddress }

## FormPasswordInlineCriteria

form-password-with-inline-criteria-signup-new-password-label =
    .label = Cyfrinair
form-password-with-inline-criteria-signup-confirm-password-label =
    .label = Ailadrodd y cyfrinair
form-password-with-inline-criteria-signup-submit-button = Creu cyfrif
form-password-with-inline-criteria-reset-new-password =
    .label = Cyfrinair newydd
form-password-with-inline-criteria-confirm-password =
    .label = Cadarnhau'r cyfrinair
form-password-with-inline-criteria-reset-submit-button = Creu cyfrinair newydd
form-password-with-inline-criteria-set-password-new-password-label =
    .label = Cyfrinair
form-password-with-inline-criteria-set-password-confirm-password-label =
    .label = Ailadrodd y cyfrinair
form-password-with-inline-criteria-set-password-submit-button = Cychwyn cydweddu
form-password-with-inline-criteria-match-error = Nid yw'r cyfrineiriau'n cydweddu
form-password-with-inline-criteria-sr-too-short-message = Rhaid i'r cyfrinair gynnwys o leiaf 8 nod.
form-password-with-inline-criteria-sr-not-email-message = Peidiwch â chynnwys eich cyfeiriad e-bost yn eich cyfrinair.
form-password-with-inline-criteria-sr-not-common-message = Peidiwch â defnyddio cyfrinair cyffredin
form-password-with-inline-criteria-sr-requirements-met = Mae'r cyfrinair a gofnodwyd yn parchu'r holl ofynion cyfrinair.
form-password-with-inline-criteria-sr-passwords-match = Mae'r cyfrineiriau a roddwyd yn cydweddu.

## FormVerifyCode

# Fallback default localized error message for empty input field
form-verify-code-default-error = Mae angen llanw'r maes hwn

## FormVerifyTotp component
## Form to enter a time-based one-time-passcode (e.g., 6-digit numeric code or 8-digit alphanumeric code)

# Information explaining why button is disabled, also read to screen readers
# Submit button is disabled unless a valid code format is entered
# Used when the code may only contain numbers
# $codeLength : number of digits in a valid code
form-verify-totp-disabled-button-title-numeric = Rhowch cod { $codeLength }-digid i barhau
# Information explaining why button is disabled, also read to screen readers
# Submit button is disabled unless a valid code format is entered
# Used when the code may contain numbers and/or letters
# $codeLength : number of characters in a valid code
form-verify-totp-disabled-button-title-alphanumeric = Rhowch cod { $codeLength }-nod i barhau

# GetDataTrio component, part of Account Recovery Key flow

get-data-trio-title-firefox = { -brand-firefox }
get-data-trio-title-firefox-recovery-key = Allwedd adfer cyfrif { -brand-firefox }
get-data-trio-title-backup-verification-codes = Codau dilysu wrth gefn
get-data-trio-download-2 =
    .title = Llwytho i Lawr
    .aria-label = Llwytho i Lawr
get-data-trio-copy-2 =
    .title = Copïo
    .aria-label = Copïo
get-data-trio-print-2 =
    .title = Argraffu
    .aria-label = Argraffu

## Images - these are all aria labels used for illustrations
## Aria labels are used as alternate text that can be read aloud by screen readers.

# Aria-label option for an alert symbol
alert-icon-aria-label =
    .aria-label = Rhybudd
# Aria-label option for an alert symbol
icon-attention-aria-label =
    .aria-label = Sylw
# Aria-label option for an alert symbol
icon-warning-aria-label =
    .aria-label = Rhybudd
authenticator-app-aria-label =
    .aria-label = Cais Dilysydd
backup-codes-icon-aria-label-v2 =
    .aria-label = Codau dilysu wrth gefn wedi'u galluogi
backup-codes-disabled-icon-aria-label-v2 =
    .aria-label = Analluogwyd y codau dilysu wrth gefn
# An icon of phone with text message. A back recovery phone number
backup-recovery-sms-icon-aria-label =
    .aria-label = SMS adfer wedi'i alluogi
# Disabled version of backup-recovery-sms-icon-aria-label
backup-recovery-sms-disabled-icon-aria-label =
    .aria-label = SMS adfer wedi'i analluogi
# Used to select Canada as country code for phone number
canadian-flag-icon-aria-label =
    .aria-label = Baner Canada
# Used to  indicate a general checkmark, as in something checked off in a list!
checkmark-icon-aria-label =
    .aria-label = Gwiro
# Used to  indicate a check mark for a successful state/action
checkmark-success-icon-aria-label =
    .aria-label = Llwyddiant
# Used to indicate a check mark for an enabled state/option
checkmark-enabled-icon-aria-label =
    .aria-label = Galluogwyd
# Used on X icon to dismiss a message such as an alert or banner
close-icon-aria-label =
    .aria-label = Cau neges
# Used to decorate a code you enter for verification purposes
code-icon-aria-label =
    .aria-label = Cod
error-icon-aria-label =
    .aria-label = Gwall
# Used as information icon for informative messaging
info-icon-aria-label =
    .aria-label = Manylion
# Used to select United States as a country code for phone number
usa-flag-icon-aria-label =
    .aria-label = Baner yr Unol Daleithiau

## Images - these are all aria labels used for illustrations
## Aria labels are used as alternate text that can be read aloud by screen readers.

hearts-broken-image-aria-label =
    .aria-label = Cyfrifiadur a ffôn symudol a delwedd o galon wedi torri ar bob un
hearts-verified-image-aria-label =
    .aria-label = Cyfrifiadur a ffôn symudol a thabled gyda chalon yn curo ar bob un
signin-recovery-code-image-description =
    .aria-label = Dogfen sy'n cynnwys testun cudd.
signin-totp-code-image-label =
    .aria-label = Dyfais gyda chod 6 digid cudd.
confirm-signup-aria-label =
    .aria-label = Amlen yn cynnwys dolen
# Used for an image of a key on a shield surrounded by 5 other icons representing information that can be recovered with the account recovery key.
# Other icons and their meaning: Gear (settings), star (favorites), clock (history), magnifying glass (search) and lock (passwords).
security-shield-aria-label =
    .aria-label = Darlun i gynrychioli allwedd adfer cyfrif.
# Used for an image of a single key.
recovery-key-image-aria-label =
    .aria-label = Darlun i gynrychioli allwedd adfer cyfrif.
password-image-aria-label =
    .aria-label = Darlun i gynrychioli teipio cyfrinair.
lightbulb-aria-label =
    .aria-label = Darlun i gynrychioli creu awgrym storio.
email-code-image-aria-label =
    .aria-label = Darlun i gynrychioli e-bost sy'n cynnwys cod.
recovery-phone-image-description =
    .aria-label = Dyfais symudol sy'n derbyn cod trwy neges destun.
recovery-phone-code-image-description =
    .aria-label = Cod wedi'i dderbyn ar ddyfais symudol.
backup-recovery-phone-image-aria-label =
    .aria-label = Dyfais symudol gyda galluoedd neges destun SMS
backup-authentication-codes-image-aria-label =
    .aria-label = Sgrin dyfais gyda chodau
sync-clouds-image-aria-label =
    .aria-label = Cymylau gydag eicon cydweddu
confetti-falling-image-aria-label =
    .aria-label = Animeiddiad conffeti'n disgyn

## InlineRecoveryKeySetupCreate component
## Users see this view when we prompt them to generate an account recovery key
## after signing in.

inline-recovery-key-setup-signed-in-firefox-2 = Rydych wedi mewngofnodi i { -brand-firefox }
inline-recovery-key-setup-create-header = Diogelwch eich cyfrif
# This is a subheader asking users to create an account recovery key, indicating it will only take a moment to complete.
inline-recovery-key-setup-create-subheader = Oes gennych chi funud i ddiogelu eich data?
inline-recovery-key-setup-info = Crëwch allwedd adfer cyfrif fel y gallwch adfer eich data cydweddu pori os byddwch byth yn anghofio eich cyfrinair.
inline-recovery-key-setup-start-button = Crëwch allwedd adfer cyfrif
inline-recovery-key-setup-later-button = Ei wneud yn nes ymlaen

## Input Password

# Tooltip displayed on a password input visibility toggle. Expresses the toggle action, where clicking on the toggle will hide the password.
input-password-hide = Cuddio cyfrinair
# Tooltip displayed on a password input visibility toggle. Expresses the toggle action, where clicking on the toggle will show the password.
input-password-show = Dangos cyfrinair
# Message read by screen readers when focus is on a password input visibility toggle. Expresses current (visible) state of the textbox content.
input-password-hide-aria-2 = Mae'ch cyfrinair i'w weld ar y sgrin ar hyn o bryd.
# Message read by screen readers when focus is on a password input visibility toggle. Expresses current (hidden) state of the textbox content.
input-password-show-aria-2 = Mae'ch cyfrinair wedi'i guddio ar hyn o bryd.
# Message read by screen readers after clicking on a password input visibility toggle to show the password. Expresses the new (visible) state of the textbox content.
input-password-sr-only-now-visible = Mae'ch cyfrinair nawr yn weladwy ar y sgrin.
# Message read by screen readers after clicking on a password input visibility toggle to hide the password. Expresses the new (hidden) state of the textbox content.
input-password-sr-only-now-hidden = Mae eich cyfrinair nawr wedi'i guddio.

## Phone number component

# This is an aria-label available to screen readers for a selection list that includes country flags, country name and country code
input-phone-number-country-list-aria-label = Dewis gwlad
input-phone-number-enter-number = Rhowch rif ffôn
input-phone-number-country-united-states = Yr Unol Daleithiau
input-phone-number-country-canada = Canada
# Back button on legal/terms or legal/privacy that takes users to the previous page
legal-back-button = Nôl

## LinkDamaged component

# The user followed a password reset link that was received by email
# but the link is damaged (for example mistyped or broken by the email client)
reset-pwd-link-damaged-header = Mae dolen ailosod y cyfrinair wedi ei difrodi
# The user followed a link to signin that was received by email
# but the link was damaged (for example mistyped or broken by the email client).
signin-link-damaged-header = Mae'r ddolen cadarnhad wedi'i difrodi
# The user followed a link to report an invalid signin attempt that was received by email
# but the link was damaged (for example mistyped or broken by the email client).
report-signin-link-damaged-header = Mae'r ddolen wedi ei difrodi
# The user followed a link received by email, but the link was damaged.
reset-pwd-link-damaged-message = Mae nodau ar goll yn y ddolen rydych newydd ei chlicio ac efallai wedi ei dorri gan eich rhaglen e-bost. Copïwch y cyfeiriad yn ofalus a cheisiwch eto.

## LinkExpired component

# Button to request a new link if the previous link that was emailed to the user is expired
link-expired-new-link-button = Derbyn dolen newydd

## LinkRememberPassword component

# immediately before remember-password-signin-link
remember-password-text = Yn cofio eich cyfrinair?
# link navigates to the sign in page
remember-password-signin-link = Mewngofnodi

## LinkUsed component

# The user followed a primary email confirmation link, but that link is has been used and is no longer valid
primary-email-confirmation-link-reused = Mae'r prif e-bost wedi ei ddilysu eisoes
# The user followed a sign-in confirmation link, but that link has been used and is no longer valid
signin-confirmation-link-reused = Mae'r mewngofnod eisoes wedi ei gadarnhau
confirmation-link-reused-message = Mae'r ddolen cadarnhau honno wedi ei defnyddio eisoes a dim ond unwaith mae modd ie defnyddio.

## Locale Toggle Component

locale-toggle-select-label = Dewiswch iaith
locale-toggle-browser-default = Rhagosodiad y porwr
# Users will see this heading when the URL or network request is malformed, e.g. a query parameter is required and is invalid
error-bad-request = Cais Gwael

## PasswordInfoBalloon
## Balloon displayed next to password input field

password-info-balloon-why-password-info = Mae angen y cyfrinair hwn arnoch i gael mynediad at unrhyw ddata wedi'i amgryptio rydych yn ei storio gyda ni.
password-info-balloon-reset-risk-info = Mae ailosod yn golygu o bosibl golli data fel cyfrineiriau a nodau tudalen.

## PasswordStrengthInline component
## These strings are conditions that need to be met to qualify as a strong password

password-strength-long-instruction = Dewiswch gyfrinair cryf nad ydych wedi'i ddefnyddio ar wefannau eraill. Gwnewch yn siŵr ei fod yn bodloni'r gofynion diogelwch:
password-strength-short-instruction = Dewiswch gyfrinair cryf:
password-strength-inline-min-length = O leiaf 8 nod
password-strength-inline-not-email = Nid eich cyfeiriad e-bost
password-strength-inline-not-common = Nid cyfrinair sy'n cael ei ddefnyddio'n gyffredin
password-strength-inline-confirmed-must-match = Cadarnhad ei fod yn cydweddu â'r cyfrinair newydd
password-strength-inline-passwords-match = Mae'r cyfrineiriau'n cyfateb

## Notification Promo Banner component

account-recovery-notification-cta = Crëwch
account-recovery-notification-header-value = Peidiwch â cholli'ch data os byddwch yn anghofio eich cyfrinair
account-recovery-notification-header-description = Crëwch allwedd adfer cyfrif fel y gallwch adfer eich data cydweddu pori os byddwch byth yn anghofio eich cyfrinair.
recovery-phone-promo-cta = Ychwanegu ffôn adfer
recovery-phone-promo-heading = Ychwanegwch amddiffyniad ychwanegol i'ch cyfrif gyda ffôn adfer
recovery-phone-promo-description = Nawr gallwch chi fewngofnodi gyda chyfrinair un-tro trwy SMS os na allwch ddefnyddio'ch ap dilysu dau gam.
recovery-phone-promo-info-link = Dysgwch fwy am adfer a risg o gyfnewid SIM
promo-banner-dismiss-button =
    .aria-label = Cau'r faner

## Ready component

ready-complete-set-up-instruction = Cwblhewch y gosod drwy roi eich cyfrinair ar eich dyfeisiau { -brand-firefox } eraill.
manage-your-account-button = Rheoli eich cyfrif
# This is a string that tells the user they can use whatever service prompted them to reset their password or to verify their email
# Variables:
# { $serviceName } represents a product name (e.g., Mozilla VPN) that will be passed in as a variable
ready-use-service = Rydych nawr yn barod i ddefnyddio { $serviceName }
# The user successfully accomplished a task (password reset, confirm email) that lets them use their account
ready-use-service-default = Rydych chi nawr yn barod i ddefnyddio gosodiadau cyfrif
# Message shown when the account is ready but the user is not signed in
ready-account-ready = Mae eich cyfrif yn barod!
ready-continue = Parhau
sign-in-complete-header = Mewngofnodi wedi ei gadarnhau
sign-up-complete-header = Cyfrif wedi'i gadarnhau
primary-email-verified-header = Prif e-bost wedi'i gadarnhau

## Users see this view when they are generating a new account recovery key
## This screen displays the generated key and allows users to download or copy the key

# This heading is shown above a list of options for storing the account recovery key
# "key" here refers to "account recovery key"
flow-recovery-key-download-storage-ideas-heading-v2 = Lleoedd i gadw'ch allwedd:
flow-recovery-key-download-storage-ideas-folder-v2 = Ffolder ar ddyfais ddiogel
flow-recovery-key-download-storage-ideas-cloud = Storfa cwmwl dibynadwy
flow-recovery-key-download-storage-ideas-print-v2 = Copi ffisegol wedi'i argraffu
flow-recovery-key-download-storage-ideas-pwd-manager = Rheolwr cyfrineiriau

## RecoveryKeySetupHint
## This is the final step in the account recovery key creation flow after a Sync signin or in account settings
## Prompts the user to save an (optional) storage hint about the location of their account recovery key.

# The header of the last step in the account recovery key creation flow
# "key" here refers to the "account recovery key"
flow-recovery-key-hint-header-v2 = Ychwanegwch awgrym i'ch helpu i ddod o hyd i'ch allwedd
# This message explains why saving a storage hint can be helpful. The account recovery key could be "stored" in a physical (e.g., printed) or virtual location (e.g., in a device folder or in the cloud).
# "it" here refers to the storage hint, NOT the "account recovery key"
flow-recovery-key-hint-message-v3 = Dylai'r awgrym hwn eich helpu i gofio ble rydych wedi storio allwedd adfer eich cyfrif. Gallwn ei ddangos i chi yn ystod ailosod y cyfrinair i adennill eich data.
# The label for the text input where the user types in the storage hint they want to save.
# The storage hint is optional, and users can leave this blank.
flow-recovery-key-hint-input-v2 =
    .label = Rhowch awgrym (dewisol)
# The text of the "submit" button. Clicking on this button will save the hint (if provided) and exit the account recovery key creation flow.
# "Finish" refers to "Finish the account recovery key creation process"
flow-recovery-key-hint-cta-text = Gorffen
# Error displayed in a tooltip if the hint entered by the user exceeds the character limit.
# "Hint" refers to "storage hint"
flow-recovery-key-hint-char-limit-error = Rhaid i'r awgrym gynnwys llai na 255 nod.
# Error displayed in a tooltip if the user included unsafe unicode characters in their hint.
# "Hint" refers to "storage hint"
flow-recovery-key-hint-unsafe-char-error = Ni all yr awgrym gynnwys nodau unicode anniogel. Dim ond llythrennau, rhifau, atalnodau a symbolau a ganiateir.

## ResetPasswordWarning component
## Warning shown to sync users that reset their password without using an account recovery key

password-reset-warning-icon = Rhybudd
password-reset-chevron-expanded = Cau'r rhybudd
password-reset-chevron-collapsed = Ehangu'r rhybudd
password-reset-data-may-not-be-recovered = Mae'n bosibl na fydd data eich porwr yn cael ei adfer
password-reset-previously-signed-in-device-2 = Oes gennych chi unrhyw ddyfais lle rydych wedi mewngofnodi o'r blaen?
password-reset-data-may-be-saved-locally-2 = Mae'n bosibl fod data eich porwr wedi'i gadw ar y ddyfais honno. Ailosodwch eich cyfrinair, yna mewngofnodwch yno i adfer a chydweddu eich data.
password-reset-no-old-device-2 = Oes gennych chi ddyfais newydd ond heb fynediad i unrhyw un o'ch rhai blaenorol?
password-reset-encrypted-data-cannot-be-recovered-2 = Ymddiheuriadau, ond nid oes modd adfer data eich porwr sydd wedi'i amgryptio ar weinyddion { -brand-firefox }.
password-reset-warning-have-key = Oes gennych chi allwedd adfer cyfrif?
password-reset-warning-use-key-link = Defnyddiwch ef nawr i ailosod eich cyfrinair a chadw'ch data

## Alert Bar

alert-bar-close-message = Cau neges

## User's avatar

avatar-your-avatar =
    .alt = Eich afatar
avatar-default-avatar =
    .alt = Afatar rhagosodedig

##


# BentoMenu component

bento-menu-title-3 = Cynnyrch { -brand-mozilla }
bento-menu-tagline = Rhagor o gynnyrch { -brand-mozilla } sy'n diogelu'ch preifatrwydd
bento-menu-vpn-2 = { -product-mozilla-vpn }
bento-menu-monitor-3 = { -product-mozilla-monitor }
bento-menu-firefox-relay-2 = { -product-firefox-relay }
bento-menu-firefox-desktop = Porwr { -brand-firefox } ar gyfer y Bwrdd Gwaith
bento-menu-firefox-mobile = Porwr { -brand-firefox } ar gyfer Symudol
bento-menu-made-by-mozilla = Gwnaed gan { -brand-mozilla }

## Connect another device promo

connect-another-fx-mobile = Cael { -brand-firefox } ar ffôn symudol neu dabled
connect-another-find-fx-mobile-2 = Dewch o hyd i { -brand-firefox } yn { -google-play } a'r { -app-store }.
# Alt text for Google Play and Apple App store images that will be shown if the image can't be loaded.
# These images are used to encourage users to download Firefox on their mobile devices.
connect-another-play-store-image-2 =
    .alt = Llwytho { -brand-firefox } i lawr ar { -google-play }
connect-another-app-store-image-3 =
    .alt = Llwytho { -brand-firefox } i lawr ar yr { -app-store }

## Connected services section

cs-heading = Gwasanaethau Cysylltiedig
cs-description = Popeth rydych chi'n ei ddefnyddio ac wedi mewngofnodi iddo.
cs-cannot-refresh = Ymddiheuriadau, bu anhawster wrth adnewyddu'r rhestr o wasanaethau cysylltiedig.
cs-cannot-disconnect = Cleient heb ei ddarganfod, yn methu â datgysylltu
# This string is used in a notification message near the top of the page.
# Variables:
#   $service (String) - the name of a device or service that uses Mozilla accounts
#                       (for example: "Firefox Lockwise")
cs-logged-out-2 = Wedi allgofnodi o { $service }.
cs-refresh-button =
    .title = Adnewyddu gwasanaethau cysylltiedig
# Link text to a support page on missing or duplicate devices
cs-missing-device-help = Eitemau coll neu ddyblyg?
cs-disconnect-sync-heading = Datgysylltu o Sync

## This string is used in a modal dialog when the user starts the disconnect from
## Sync process.
## Variables:
##   $device (String) - the name of a device using Mozilla accounts
##                      (for example: "Firefox Nightly on Google Pixel 4a")

cs-disconnect-sync-content-3 =
    Bydd eich data pori yn aros ar <span>{ $device }</span>,
    ond ni fydd yn cydweddu â'ch cyfrif bellach.
cs-disconnect-sync-reason-3 = Beth yw'r prif reswm dros ddatgysylltu <span>{ $device }</span>?

## The following are the options for selecting a reason for disconnecting the
## device

cs-disconnect-sync-opt-prefix = Y ddyfais yw:
cs-disconnect-sync-opt-suspicious = Amheus
cs-disconnect-sync-opt-lost = Wedi'i Cholli neu'i Dwyn
cs-disconnect-sync-opt-old = Yn Hen neu wedi'i Disodli
cs-disconnect-sync-opt-duplicate = Dyblyg
cs-disconnect-sync-opt-not-say = Gwell peidio dweud

##

cs-disconnect-advice-confirm = Iawn
cs-disconnect-lost-advice-heading = Dyfais coll neu wedi'i dwyn wedi'i datgysylltu
cs-disconnect-lost-advice-content-3 = Ers i'ch dyfais gael ei cholli neu ei dwyn, er mwyn cadw'ch manylion yn ddiogel, dylech newid eich cyfrinair { -product-mozilla-account } yng ngosodiadau eich cyfrif. Dylech hefyd edrych am wybodaeth gan wneuthurwr eich dyfais ynglŷn â dileu eich data o bell.
cs-disconnect-suspicious-advice-heading = Dyfais amheus wedi'i datgysylltu
cs-disconnect-suspicious-advice-content-2 = Os yw'r ddyfais sydd wedi'i datgysylltu yn wir amheus, i gadw'ch manylion yn ddiogel, dylech newid cyfrinair eich cyfrif { -product-mozilla-account } yng ngosodiadau eich cyfrif. Dylech hefyd newid unrhyw gyfrineiriau eraill a gadwyd gennych yn { -brand-firefox } trwy deipio about:logins yn y bar cyfeiriad.
cs-sign-out-button = Allgofnodi

## Data collection section

dc-heading = Casglu a'r Defnydd o Ddata
dc-subheader-moz-accounts = { -product-mozilla-accounts }
dc-subheader-ff-browser = Porwr { -brand-firefox }
dc-subheader-content-2 = Caniatáu i { -product-mozilla-accounts } anfon data technegol a rhyngweithio i { -brand-mozilla }.
dc-subheader-ff-content = I adolygu neu ddiweddaru gosodiadau data technegol a rhyngweithio eich porwr { -brand-firefox }, agorwch osodiadau { -brand-firefox } a llywio i Preifatrwydd a Diogelwch.
dc-opt-out-success-2 = Rydych wedi dewis peidio cael eich cynnwys yn llwyddiannus. Ni fydd { -product-mozilla-accounts } yn anfon data technegol na data rhyngweithio i { -brand-mozilla }.
dc-opt-in-success-2 = Diolch! Mae rhannu'r data hwn yn ein helpu i wella { -product-mozilla-accounts }.
dc-opt-in-out-error-2 = Ymddiheuriadau, bu anhawster wrth newid eich dewisiadau casglu data.
dc-learn-more = Dysgu rhagor

# DropDownAvatarMenu component

drop-down-menu-title-2 = Dewislen cyfrif { -product-mozilla-account }
# This is displayed in the Settings menu after user's click on their profile icon.
# Following this string on a new line will be their display name (user's name or email)
drop-down-menu-signed-in-as-v2 = Mewngofnodwyd fel
drop-down-menu-sign-out = Allgofnodi
drop-down-menu-sign-out-error-2 = Ymddiheuriadau, bu anhawster wrth i chi allgofnodi.

## Flow Container

flow-container-back = Nôl

## FlowRecoveryKeyConfirmPwd - Second view in the PageRecoveryKeyCreate flow
## Users see this view when they are generating a new account recovery key
## This screen asks the user to confirm their password before generating a new key

flow-recovery-key-confirm-pwd-heading-v2 = Rhowch eich cyfrinair eto er eich diogelwch
flow-recovery-key-confirm-pwd-input-label = Rhowch eich cyfrinair
# Clicking on this button will check the password and create an account recovery key
flow-recovery-key-confirm-pwd-submit-button = Crëwch allwedd adfer cyfrif
# For users with an existing account recovery key, clicking on this button will
# check the password, delete the existing key and create a new account recovery key
flow-recovery-key-confirm-pwd-submit-button-change-key = Crëuwch allwedd adfer newydd

## FlowRecoveryKeyDownload - Third view in the PageRecoveryKeyCreate flow
## Users see this view when they are generating a new account recovery key
## This screen displays the generated key and allows users to download or copy the key

flow-recovery-key-download-heading-v2 = Crewyd allwedd adfer cyfrif - llwythwch ef i lawr a'i gadw ef nawr
# The "key" here refers to the term "account recovery key"
flow-recovery-key-download-info-v2 = Mae'r allwedd hon yn eich galluogi i adennill eich data os byddwch yn anghofio eich cyfrinair. Llwythwch ef i lawr nawr a'i gadw'n rhywle y byddwch chi'n ei gofio - fyddwch chi ddim yn gallu dychwelyd i'r dudalen hon yn nes ymlaen.
# This link allows user to proceed to the next step without clicking the download button
flow-recovery-key-download-next-link-v2 = Parhewch heb ei lwytho i lawr

## FlowRecoveryKeyHint
## This is the fourth and final step in the account recovery key creation flow in account settings
## Prompts the user to save an (optional) storage hint about the location of their account recovery key.

# Success message displayed in alert bar after the user has finished creating an account recovery key.
flow-recovery-key-success-alert = Crëwyd yr allwedd adfer cyfrif.

## FlowRecoveryKeyInfo - First view in the PageRecoveryKeyCreate flow

# The header of the first view in the Recovery Key Create flow
flow-recovery-key-info-header = Crëwch allwedd adfer cyfrif rhag ofn i chi anghofio eich cyfrinair
# The header of the first view in the Recovery Key Create flow when replacing an existing recovery key
flow-recovery-key-info-header-change-key = Newidiwch allwedd adfer eich cyfrif
# In the first view of the PageRecoveryKeyCreate flow, this is the first of two bullet points explaining why the user should create an account recovery key
flow-recovery-key-info-shield-bullet-point-v2 = Rydym yn amgryptio data pori –– cyfrineiriau, nodau tudalen, a mwy. Mae'n wych ar gyfer preifatrwydd, ond efallai y byddwch yn colli eich data os byddwch yn anghofio eich cyfrinair.
# In the first view of the PageRecoveryKeyCreate flow, this is the second of two bullet points explaining why the user should create an account recovery key
flow-recovery-key-info-key-bullet-point-v2 = Dyna pam mae creu allwedd adfer cyfrif mor bwysig -- gallwch ei ddefnyddio i adfer eich data.
# The text of the "submit" button to start creating (or changing) an account recovery key
flow-recovery-key-info-cta-text-v3 = Cychwyn arni
# Link to cancel account recovery key change and return to settings
flow-recovery-key-info-cancel-link = Diddymu

## FlowSetup2faApp

flow-setup-2fa-qr-heading = Cysylltwch i'ch ap dilysu
# DEV NOTE: "2a" in the id should be "2fa". This typo is kept intentionally to
# avoid losing existing translations; fix it when creating a new version of
# this string.
flow-setup-2a-qr-instruction = <strong>Cam 1:</strong> Sganiwch y cod QR hwn gan ddefnyddio unrhyw ap dilysu, fel Duo neu Google Authenticator.
# Alt text for the QR-code image shown during two-step authentication setup.
# “setup secret key” refers to the long code you can copy instead of scanning.
# Not to be confused with the 6-digit codes generated by the authenticator app.
flow-setup-2fa-qr-alt-text =
    .alt = Cod QR ar gyfer gosod dilysu dau gam. Sganiwch ef, neu ddewis “Ddim yn gallu sganio cod QR?” i gael allwedd gyfrinachol gosod yn lle hynny.
flow-setup-2fa-cant-scan-qr-button = Ddim yn gallu sganio cod QR?
flow-setup-2fa-manual-key-heading = Rhowch y cod â llaw
flow-setup-2fa-manual-key-instruction = <strong>Cam 1:</strong> Rhowch y cod hwn yn eich ap dilysu chi.
flow-setup-2fa-scan-qr-instead-button = Sganio cod QR yn lle hynny?
# links to https://support.mozilla.org/kb/secure-firefox-account-two-step-authentication#w_step-one
flow-setup-2fa-more-info-link = Dysgwch fwy am apiau dilysu
flow-setup-2fa-button = Parhau
flow-setup-2fa-step-2-instruction = <strong>Cam 2:</strong>Rhowch y cod o'ch ap dilysu.
flow-setup-2fa-input-label = Rhowch y cod 6 digid
flow-setup-2fa-code-error = Cod annilys neu wedi dod i ben. Gwiriwch eich ap dilysu a rhowch gynnig arall arni.

## The step to choose the two step authentication method in the two step
## authentication setup flow.

flow-setup-2fa-backup-choice-heading = Dewiswch ddull adfer
flow-setup-2fa-backup-choice-description = Mae hyn yn caniatáu ichi fewngofnodi os nad ydych yn gallu cael mynediad i'ch dyfais symudol neu ap dilysu.
flow-setup-2fa-backup-choice-phone-title = Ffôn adfer
flow-setup-2fa-backup-choice-phone-badge = Hawsaf
flow-setup-2fa-backup-choice-phone-info = Cael cod adfer trwy neges destun. Ar gael ar hyn o bryd yn yr UDA a Chanada.
flow-setup-2fa-backup-choice-code-title = Codau dilysu wrth gefn
flow-setup-2fa-backup-choice-code-badge = Mwyaf diogel
flow-setup-2fa-backup-choice-code-info = Creu a chadw codau dilysu un-tro.
# This link points to https://support.mozilla.org/kb/secure-mozilla-account-two-step-authentication
flow-setup-2fa-backup-choice-learn-more-link = Dysgwch am adfer a'r risg o gyfnewid SIM

## The backup code confirm step of the setup 2 factor authentication flow,
## where the user confirm that they have saved their backup authentication codes
## by entering one of them.

flow-setup-2fa-backup-code-confirm-heading = Rhowch y cod dilysu wrth gefn
# codes here refers to backup authentication codes
flow-setup-2fa-backup-code-confirm-confirm-saved = Cadarnhewch eich bod wedi cadw'ch codau trwy roi un. Heb y codau hyn, efallai fyddwch chi ddim yn gallu mewngofnodi os nad oes gennych eich ap dilysu.
flow-setup-2fa-backup-code-confirm-code-input = Rhowch god 10 nod
# Clicking on this button finishes the whole flow upon success.
flow-setup-2fa-backup-code-confirm-button-finish = Gorffen

## The backup codes download step of the setup 2 factor authentication flow

flow-setup-2fa-backup-code-dl-heading = Cadwch eich codau dilysu wrth gefn
flow-setup-2fa-backup-code-dl-save-these-codes = Cadwch rhain mewn lle byddwch yn ei gofio. Os nad oes gennych chi fynediad i'ch ap dilysu bydd angen i chi roi un i fewngofnodi.
flow-setup-2fa-backup-code-dl-button-continue = Parhau

##

flow-setup-2fa-inline-complete-success-banner = Mae dilysu dau gam wedi ei alluogi
flow-setup-2fa-inline-complete-success-banner-description = Er mwyn diogelu eich holl ddyfeisiau cysylltiedig, dylech allgofnodi ym mhob man rydych chi'n defnyddio'r cyfrif hwn, ac yna mewngofnodi eto gan ddefnyddio'ch dilysiad dau gam newydd.
flow-setup-2fa-inline-complete-backup-code = Codau dilysu wrth gefn
flow-setup-2fa-inline-complete-backup-phone = Ffôn adfer
# $count (Number) - an integer representing the number of backup
# authentication codes remaining
flow-setup-2fa-inline-complete-backup-code-info =
    { $count ->
        [one] { $count } codau'n weddill
        [zero] { $count } cod yn weddill
        [two] { $count } god yn weddill
        [few] { $count } cod yn weddill
        [many] { $count } chod yn weddill
       *[other] { $count } cod yn weddill
    }
flow-setup-2fa-inline-complete-backup-code-description = Dyma'r dull adfer mwyaf diogel os nad ydych yn gallu mewngofnodi gyda'ch dyfais symudol neu ap dilysu.
flow-setup-2fa-inline-complete-backup-phone-description = Dyma'r dull adfer mwyaf diogel os nad ydych yn gallu mewngofnodi gyda'ch ap dilysu.
flow-setup-2fa-inline-complete-learn-more-link = Sut mae hyn yn diogelu eich cyfrif
# $serviceName (String) - the name of the product that the user will be
# redirected to.
flow-setup-2fa-inline-complete-continue-button = Parhau i { $serviceName }
flow-setup-2fa-prompt-heading = Gosod dilysu dau gam
# Variable { $serviceName } is the name of the product (e.g. Firefox Add-ons)
# that requests two-step authentication setup.
flow-setup-2fa-prompt-description = Mae { $serviceName } yn gofyn i chi osod dilysiad dau gam i gadw'ch cyfrif yn ddiogel.
# "these authenticator apps" links to https://support.mozilla.org/kb/secure-firefox-account-two-step-authentication
flow-setup-2fa-prompt-use-authenticator-apps = Gallwch ddefnyddio unrhyw un o'r <authenticationAppsLink>apiau dilysu hyn</authenticationAppsLink> i barhau.
flow-setup-2fa-prompt-continue-button = Parhau

## FlowSetupPhoneConfirmCode

# verification code refers to a code sent by text message to confirm phone number ownership
# and complete setup
flow-setup-phone-confirm-code-heading = Rhowch y cod dilysu
# $phoneNumber is a partially obfuscated phone number with only the last 4 digits showing (e.g., *** *** 1234)
# span element applies formatting to ensure the number is always displayed left-to-right
flow-setup-phone-confirm-code-instruction = Anfonwyd cod chwe digid at <span>{ $phoneNumber }</span> trwy neges destun. Daw'r cod hwn i ben ar ôl 5 munud.
flow-setup-phone-confirm-code-input-label = Rhowch y cod 6 digid
flow-setup-phone-confirm-code-button = Cadarnhau
# button to resend a code by text message to the user's phone
# followed by a button to resend a code
flow-setup-phone-confirm-code-expired = Cod wedi dod i ben?
flow-setup-phone-confirm-code-resend-code-button = Ail-anfon y cod
flow-setup-phone-confirm-code-resend-code-success = Anfonwyd y cod
flow-setup-phone-confirm-code-success-message-v2 = Ffôn adfer wedi'i ychwanegu
flow-change-phone-confirm-code-success-message = Ffôn adfer wedi'i newid

## FlowSetupPhoneConfirmCode

flow-setup-phone-submit-number-heading = Gwiriwch eich rhif ffôn
# The code is a 6-digit code send by text message/SMS
flow-setup-phone-verify-number-instruction = Byddwch yn cael neges destun gan { -brand-mozilla } gyda chod i ddilysu'ch rhif. Peidiwch â rhannu'r cod hwn gydag unrhyw un.
# The initial rollout of the recovery phone is only available to users with US and Canada mobile phone numbers.
# Voice over Internet Protocol (VoIP), is a technology that uses a broadband Internet connection instead of a regular (or analog) phone line to make calls.
# Phone mask services (for example Relay) provide a temporary virtual number to avoid providing a real phone number.
# Both VoIP and phone masks can be unreliable for one-time-passcode (OTP) verification
flow-setup-phone-submit-number-info-message-v2 = Dim ond yn yr Unol Daleithiau a Chanada y mae ffôn adfer ar gael. Nid yw rhifau VoIP a rhifau ffôn cudd yn cael eu hargymell.
flow-setup-phone-submit-number-legal = Trwy ddarparu eich rhif, rydych yn cytuno i ni ei gadw fel y gallwn anfon neges destun atoch dim ond er mwyn dilysu'r cyfrif. Gall cyfraddau neges a data fod yn berthnasol.
# cliking on the button sends a code by text message to the phone number typed in by the user
flow-setup-phone-submit-number-button = Anfon y cod

## HeaderLockup component, the header in account settings

header-menu-open = Cau'r ddewislen
header-menu-closed = Dewislen llywio'r wefan
header-back-to-top-link =
    .title = Nôl i'r brig
header-back-to-settings-link =
    .title = Nôl i osodiadau { -product-mozilla-account }
header-title-2 = { -product-mozilla-account }
header-help = Cymorth

## Linked Accounts section

la-heading = Cyfrifon Cysylltiedig
la-description = Rydych wedi awdurdodi mynediad i'r cyfrifon canlynol.
la-unlink-button = Datgysylltu
la-unlink-account-button = Datgysylltu
la-set-password-button = Gosod Cyfrinair
la-unlink-heading = Datgysylltu o gyfrif trydydd parti
la-unlink-content-3 = Ydych chi'n siŵr eich bod am ddatgysylltu eich cyfrif? Nid yw datgysylltu'ch cyfrif yn eich allgofnodi'n awtomatig o'r gwasanaethau hynny. I wneud hynny bydd angen i chi allgofnodi â llaw o'r adran Gwasanaethau Cysylltiedig.
la-unlink-content-4 = Cyn datgysylltu'ch cyfrif, rhaid i chi osod cyfrinair. Heb gyfrinair, nid oes unrhyw ffordd i chi fewngofnodi ar ôl datgysylltu'ch cyfrif.
nav-linked-accounts = { la-heading }

## Modal - Default values for a message directed at the user where the user can typically Confirm or Cancel.

modal-close-title = Cau
modal-cancel-button = Diddymu
modal-default-confirm-button = Cadarnhau

## ModalMfaProtected

modal-mfa-protected-title = Rhowch y cod dilysu
modal-mfa-protected-subtitle = Helpwch ni i sicrhau mai chi sy'n newid manylion eich cyfrif
# This string is used to show a notification to the user for them to enter
# email confirmation code to update their multi-factor-authentication-protected
# account settings
# Variables:
#   email (String) - the user's email
#   expirationTime (Number) - the expiration time in minutes
modal-mfa-protected-instruction =
    { $expirationTime ->
        [one] Rhowch y cod anfonwyd i <email>{ $email }</email> o fewn { $expirationTime } munud.
        [zero] Rhowch y cod anfonwyd at <email>{ $email }</email> o fewn { $expirationTime } munud.
        [two] Rhowch y cod anfonwyd at <email>{ $email }</email> o fewn { $expirationTime } munud.
        [few] Rhowch y cod anfonwyd at <email>{ $email }</email> o fewn { $expirationTime } munud.
        [many] Rhowch y cod anfonwyd at <email>{ $email }</email> o fewn { $expirationTime } munud.
       *[other] Rhowch y cod anfonwyd at <email>{ $email }</email> o fewn { $expirationTime } munud.
    }
modal-mfa-protected-input-label = Rhowch y cod 6 nod
modal-mfa-protected-cancel-button = Diddymu
modal-mfa-protected-confirm-button = Cadarnhau
modal-mfa-protected-code-expired = Cod wedi dod i ben?
# Link to resend a new code to the user's email.
modal-mfa-protected-resend-code-link = E-bostiwch cod newydd.

## Modal Verify Session

mvs-verify-your-email-2 = Cadarnhewch eich e-bost
mvs-enter-verification-code-2 = Rhowch eich cod cadarnhau
# This string is used to show a notification to the user for them to enter confirmation code to confirm their email.
# Variables:
#   email (String) - the user's email
mvs-enter-verification-code-desc-2 = Rhowch y cod cadarnhau a anfonwyd at <email>{ $email }</email> o fewn 5 munud.
msv-cancel-button = Diddymu
msv-submit-button-2 = Cadarnhau

## Settings Nav

nav-settings = Gosodiadau
nav-profile = Proffil
nav-security = Diogelwch
nav-connected-services = Gwasanaethau Cysylltiedig
nav-data-collection = Casglu a'r Defnydd o Ddata
nav-paid-subs = Tanysgrifiadau Taledig
nav-email-comm = Cyfathrebu Trwy E-bost

## Page2faChange

page-2fa-change-title = Newid dilysu dau gam
page-2fa-change-success = Mae dilysu dau gam wedi'i ddiweddaru
page-2fa-change-success-additional-message = Er mwyn diogelu eich holl ddyfeisiau cysylltiedig, dylech allgofnodi ym mhob man rydych chi'n defnyddio'r cyfrif hwn, ac yna mewngofnodi eto gan ddefnyddio'ch dilysiad dau gam newydd.
page-2fa-change-totpinfo-error = Bu gwall wrth amnewid eich ap dilysu dau gam. Ceisiwch eto yn nes ymlaen.
page-2fa-change-qr-instruction = <strong>Cam 1:</strong> Sganiwch y cod QR hwn gan ddefnyddio unrhyw ap dilysu, fel Duo neu Google Authenticator. Mae hyn yn creu cysylltiad newydd, bydd unrhyw hen gysylltiadau ddim yn gweithio mwyach.

## Two Step Authentication - replace backup authentication code

# Page title
tfa-backup-codes-page-title = Codau dilysu wrth gefn
# Error shown when API call fails while replacing existing backup codes
tfa-replace-code-error-3 = Bu anhawster wrth amnewid eich codau dilysu wrth gefn
# Error shown when API call fails while creating new backup codes (user had none)
tfa-create-code-error = Bu anhawster wrth greu eich codau dilysu wrth gefn
# Success message shown in alert bar after successfully replacing existing backup codes
tfa-replace-code-success-alert-4 = Codau dilysu wrth gefn wedi'u diweddaru
# Success message shown after creating backup codes for the first time
tfa-create-code-success-alert = Codau dilysu wrth gefn wedi'u creu
# Custom messaging for users replacing existing backup codes - Download step (1 of 2)
# On this step, the codes are not yet replaced in the database - the old codes are still valid until step 2 is completed.
tfa-replace-code-download-description = Cadwch rhain lle fyddwch yn ei gofio. Bydd eich hen godau yn cael eu disodli ar ôl i chi orffen y cam nesaf.
# Custom messaging for users replacing existing backup codes - Confirm step (2 of 2)
# Until this confirmation step is successfully completed, the old codes are still active and the new codes are not saved in the database.
tfa-replace-code-confirm-description = Cadarnhewch eich bod wedi cadw'ch codau trwy nodi un. Bydd eich hen godau dilysu wrth gefn yn cael eu hanalluogi unwaith y bydd y cam hwn wedi'i gwblhau.
# Error shown when the entered backup code does not match any of the generated codes
tfa-incorrect-recovery-code-1 = Cod dilysu wrth gefn anghywir

## Page2faSetup

page-2fa-setup-title = Dilysu dau gam
page-2fa-setup-totpinfo-error = Bu gwall wrth osod dilysiad dau gam. Ceisiwch eto yn nes ymlaen.
# code here refers to "backup authentication code"
page-2fa-setup-incorrect-backup-code-error = Nid yw'r cod hwnnw'n gywir. Ceisiwch eto.
page-2fa-setup-success = Mae dilysu dau gam wedi'i alluogi
page-2fa-setup-success-additional-message = Er mwyn diogelu eich holl ddyfeisiau cysylltiedig, dylech allgofnodi ym mhobman rydych chi'n defnyddio'r cyfrif hwn, ac yna mewngofnodi eto gan ddefnyddio dilysiad dau gam.

## Avatar change page

avatar-page-title =
    .title = Llun Proffil
avatar-page-add-photo = Ychwanegu Llun
avatar-page-add-photo-button =
    .title = { avatar-page-add-photo }
avatar-page-take-photo = Tynnwch Lun
avatar-page-take-photo-button =
    .title = { avatar-page-take-photo }
avatar-page-remove-photo = Dileu'r Llun
avatar-page-remove-photo-button =
    .title = { avatar-page-remove-photo }
avatar-page-retake-photo = Tynnwch Lun Eto
avatar-page-cancel-button = Diddymu
avatar-page-save-button = Cadw
avatar-page-saving-button = Yn cadw…
avatar-page-zoom-out-button =
    .title = Chwyddo Allan
avatar-page-zoom-in-button =
    .title = Chwyddo Mewn
avatar-page-rotate-button =
    .title = Troi
avatar-page-camera-error = Methu cychwyn y camera
avatar-page-new-avatar =
    .alt = llun proffil newydd
avatar-page-file-upload-error-3 = Bu anhawster wrth lwytho'ch llun proffil i fyny
avatar-page-delete-error-3 = Bu anhawster wrth ddileu'ch llun proffil.
avatar-page-image-too-large-error-2 = Mae'r ffeil delwedd yn rhy fawr i'w llwytho.

## Password change page

pw-change-header =
    .title = Newid Cyfrinair
pw-8-chars = O leiaf 8 nod
pw-not-email = Nid eich cyfeiriad e-bost
pw-change-must-match = Mae cyfrinair newydd yn cyd-fynd â'r cadarnhad
pw-commonly-used = Nid cyfrinair sy'n cael ei ddefnyddio'n arferol
# linkExternal is a link to a mozilla.org support article on password strength
pw-tips = Cadwch yn ddiogel - peidiwch ag ailddefnyddio cyfrineiriau. Dyma ragor o awgrymiadau i <linkExternal>greu cyfrineiriau cryf</linkExternal>.
pw-change-cancel-button = Diddymu
pw-change-save-button = Cadw
pw-change-forgot-password-link = Wedi anghofio'r cyfrinair?
pw-change-current-password =
    .label = Rhowch eich cyfrinair cyfredol
pw-change-new-password =
    .label = Rhowch gyfrinair newydd
pw-change-confirm-password =
    .label = Cadarnhau'r cyfrinair newydd
pw-change-success-alert-2 = Diweddarwyd y cyfrinair

## Password create page

pw-create-header =
    .title = Crëwch gyfrinair
pw-create-success-alert-2 = Gosodwyd y cyfrinair
pw-create-error-2 = Ymddiheuriadau, bu anhawster wrth osod eich cyfrinair.

## Delete account page

delete-account-header =
    .title = Dileu Cyfrif
delete-account-step-1-2 = Cam 1 o 2
delete-account-step-2-2 = Cam 2 o 2
delete-account-confirm-title-4 = Mae'n bosibl eich bod wedi cysylltu eich cyfrif { -product-mozilla-account } ag un neu fwy o'r cynnyrch neu'r gwasanaethau { -brand-mozilla } canlynol sy'n eich cadw'n ddiogel a chynhyrchiol ar y we:
delete-account-product-mozilla-account = { -product-mozilla-account }
delete-account-product-mozilla-vpn = { -product-mozilla-vpn }
delete-account-product-mdn-plus = { -product-mdn-plus }
delete-account-product-mozilla-hubs = { -product-mozilla-hubs }
delete-account-product-mozilla-monitor = { -product-mozilla-monitor }
delete-account-product-firefox-relay = { -product-firefox-relay }
delete-account-product-firefox-sync = Wrthi'n cydweddu data { -brand-firefox }
delete-account-product-firefox-addons = Ychwanegion { -brand-firefox }
delete-account-acknowledge = Cydnabyddwch hynny trwy ddileu eich cyfrif:
delete-account-chk-box-1-v4 =
    .label = Bydd unrhyw danysgrifiadau taledig sydd gennych yn cael eu diddymu
delete-account-chk-box-2 =
    .label = Efallai y byddwch yn colli manylion a nodweddion sydd wedi'u cadw o fewn cynnyrch { -brand-mozilla }
delete-account-chk-box-3 =
    .label = Efallai na fydd ail gychwyn gyda'r e-bost hwn yn adfer eich manylion a gadwyd
delete-account-chk-box-4 =
    .label = Bydd unrhyw estyniadau a themâu rydych wedi'u cyhoeddi yn addons.mozilla.org yn cael eu dileu
delete-account-continue-button = Parhau
delete-account-password-input =
    .label = Rhowch gyfrinair
delete-account-cancel-button = Diddymu
delete-account-delete-button-2 = Dileu

## Display name page

display-name-page-title =
    .title = Enw dangos
display-name-input =
    .label = Rhowch enw dangos
submit-display-name = Cadw
cancel-display-name = Diddymu
display-name-update-error-2 = Bu anhawster wrth ddiweddaru eich enw dangos
display-name-success-alert-2 = Diweddarwyd yr enw dangos

## Recent account activity
## All strings except title indicate an event that occurred from the user's account
## These are displayed as a list with the date when the event occured

recent-activity-title = Gweithgaredd Cyfrif Diweddar
recent-activity-account-create-v2 = Cyfrif wedi'i greu
recent-activity-account-disable-v2 = Analluogwyd y cyfrif
recent-activity-account-enable-v2 = Galluogwyd y cyfrif
recent-activity-account-login-v2 = Mewngofnodi cyfrif wedi'i gychwyn
recent-activity-account-reset-v2 = Dechreuwyd ailosod cyfrinair
# This string appears under recent account activity when there were email bounces associated with the account, but those were recently cleared (i.e. removed/deleted).
# An email bounce is when an email is sent to an email address and fails/receives a non-delivery receipt from the recipient's mail server.
recent-activity-emails-clearBounces-v2 = Clirio bownsio e-byst
recent-activity-account-login-failure = Methodd ymgais i fewngofnodi i'r cyfrif
recent-activity-account-two-factor-added = Mae dilysu dau gam wedi ei alluogi
recent-activity-account-two-factor-requested = Gofynnwyd am ddilysiad dau gam
recent-activity-account-two-factor-failure = Methodd dilysu dau gam
recent-activity-account-two-factor-success = Dilysu dau gam yn llwyddiannus
recent-activity-account-two-factor-removed = Mae dilysu dau gam wedi ei dynnu
recent-activity-account-password-reset-requested = Ailosodwyd cyfrinair y cyfrif y gofynnwyd amdano
recent-activity-account-password-reset-success = Ailosodwyd cyfrinair cyfrif yn llwyddiannus
recent-activity-account-recovery-key-added = Allwedd adfer cyfrif wedi'i galluogi
recent-activity-account-recovery-key-verification-failure = Methodd dilysu allwedd adfer y cyfrif
recent-activity-account-recovery-key-verification-success = Gwiriwyd allwedd adfer cyfrif yn llwyddiannus
recent-activity-account-recovery-key-removed = Tynnwyd  allwedd adfer cyfrif
recent-activity-account-password-added = Ychwanegwyd cyfrinair newydd
recent-activity-account-password-changed = Newidiwyd y cyfrinair
recent-activity-account-secondary-email-added = Ail gyfeiriad e-bost wedi'i ychwanegu
recent-activity-account-secondary-email-removed = Ail gyfeiriad e-bost wedi'i dynnu
recent-activity-account-emails-swapped = E-byst cyntaf ac ail wedi'u cyfnewid
recent-activity-session-destroy = Wedi allgofnodi o'r sesiwn
recent-activity-account-recovery-phone-send-code = Anfonwyd cod ffôn adfer
recent-activity-account-recovery-phone-setup-complete = Gosod ffôn adfer wedi'i gwblhau
recent-activity-account-recovery-phone-signin-complete = Mewngofnodi gyda ffôn adfer wedi'i gwblhau
recent-activity-account-recovery-phone-signin-failed = Methodd mewngofnodi gyda ffôn adfer
recent-activity-account-recovery-phone-removed = Ffôn adfer wedi'i dynnu
recent-activity-account-recovery-codes-replaced = Codau adfer wedi'u hamnewid
recent-activity-account-recovery-codes-created = Codau adfer wedi'u creu
recent-activity-account-recovery-codes-signin-complete = Cwblhawyd y mewngofnodi gyda chodau adfer
recent-activity-password-reset-otp-sent = Ailosod y cod cadarnhau cyfrinair a anfonwyd
recent-activity-password-reset-otp-verified = Ailosod y cod cadarnhau cyfrinair wedi'i wirio
recent-activity-must-reset-password = Mae angen ailosod cyfrinair
# Security event was recorded, but the activity details are unknown or not shown to user
recent-activity-unknown = Gweithgarwch cyfrif arall

## PageRecoveryKeyCreate

# The page title displayed at the top of the flow container
recovery-key-create-page-title = Allwedd Adfer Cyfrif
# Tooltip text and aria label for back arrow that takes users out of the account recovery key generation flow
# and back to account settings
recovery-key-create-back-button-title = Nôl i'r gosodiadau

## PageRecoveryPhoneRemove
## Users reach this page from account settings when they want to remove a backup phone number.

recovery-phone-remove-header = Dileu'r rhif ffôn adfer
# Variables:
#   $formattedFullPhoneNumber (String) - the user's full phone number
settings-recovery-phone-remove-info = Bydd hyn yn dileu <strong>{ $formattedFullPhoneNumber }</strong> fel eich ffôn adfer.
settings-recovery-phone-remove-recommend = Rydym yn argymell eich bod yn cadw'r dull hwn oherwydd ei fod yn haws na chadw codau dilysu wrth gefn.
# "Saved backup authentication codes" refers to previously saved backup authentication codes
settings-recovery-phone-remove-recovery-methods = Os byddwch chi'n ei ddileu, gwnewch yn siŵr bod gennych chi y codau dilysu wrth gefn sydd wedi'u cadw, o hyd. <linkExternal>Cymharu dulliau adfer</linkExternal>
settings-recovery-phone-remove-button = Dileu rhif ffôn
settings-recovery-phone-remove-cancel = Diddymu
settings-recovery-phone-remove-success = Ffôn adfer wedi'i dynnu

## PageSetupRecoveryPhone

page-setup-recovery-phone-heading = Ychwanegu ffôn adfer
page-change-recovery-phone = Newid y ffôn adfer
page-setup-recovery-phone-back-button-title = Nôl i'r gosodiadau
# Back arrow to return to step 1 of recovery phone setup flow
page-setup-recovery-phone-step2-back-button-title = Newid rhif ffôn

## Add secondary email page

add-secondary-email-step-1 = Cam 1 o 2
add-secondary-email-error-2 = Bu anhawster wrth greu'r e-bost hwn.
add-secondary-email-page-title =
    .title = Ail e-bost
add-secondary-email-enter-address =
    .label = Rhowch gyfeiriad e-bost
add-secondary-email-cancel-button = Diddymu
add-secondary-email-save-button = Cadw
# This message is shown when a user tries to add a secondary email that is a
# Firefox Relay email mask (generated email address that can be used in place of
# your real email address)
add-secondary-email-mask = Nid oes modd defnyddio arallenwau e-bost fel ail e-bost

## Verify secondary email page

add-secondary-email-step-2 = Cam 2 o 2
verify-secondary-email-page-title =
    .title = Ail e-bost
verify-secondary-email-verification-code-2 =
    .label = Rhowch eich cod cadarnhau
verify-secondary-email-cancel-button = Diddymu
verify-secondary-email-verify-button-2 = Cadarnhau
# This string is an instruction in a form.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
verify-secondary-email-please-enter-code-2 = Rhowch y cod cadarnhau a anfonwyd at <strong>{ $email }</strong> o fewn 5 munud.
# This string is a confirmation message shown after verifying an email.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
verify-secondary-email-success-alert-2 = Ychwanegwyd { $email } yn llwyddiannus.
verify-secondary-email-resend-code-button = Ail-anfon y cod cadarnhau

##

# Link to delete account on main Settings page
delete-account-link = Dileu Cyfrif
# Success message displayed in alert bar after the user has successfully confirmed their account is not inactive.
inactive-update-status-success-alert = Wedi mewngofnodi'n llwyddiannus. Bydd eich cyfrif { -product-mozilla-account } a data yn aros yn weithredol.

## Product promotion

product-promo-monitor =
    .alt = { -product-mozilla-monitor }
product-promo-monitor-description-v2 = Dewch o hyd i ble mae'ch manylion preifat wedi'i ddatgelu a chymryd rheolaeth o'r sefyllfa
# Links out to the Monitor site
product-promo-monitor-cta = Cael sgan am ddim

## Profile section

profile-heading = Proffil
profile-picture =
    .header = Llun
profile-display-name =
    .header = Enw dangos
profile-primary-email =
    .header = Prif e-bost

## Progress bar

# This is the aria-label text for the progress bar. The progress bar is meant to visually show the user how much progress they have made through the steps of a given flow.
# Variables:
#   $currentStep (number) - the step which the user is currently on
#   $numberOfSteps (number) - the total number of steps in a given flow
progress-bar-aria-label-v2 = Cam { $currentStep } o { $numberOfSteps }.

## Security section of Setting

security-heading = Diogelwch
security-password =
    .header = Cyfrinair
# This is a string that shows when the user's password was created.
# Variables:
#   $date (String) - a localized date and time string
security-password-created-date = Crëwyd: { $date }
security-not-set = Heb ei Osod
security-action-create = Creu
security-set-password = Gosodwch gyfrinair i gydweddu a defnyddio rhai nodweddion diogelwch cyfrif.
# Link opens a list of recent account activity (e.g., login attempts, password changes, etc.)
security-recent-activity-link = Gweld gweithgaredd diweddar cyfrif
signout-sync-header = Sesiwn wedi Dod i Ben
signout-sync-session-expired = Ymddiheuriadau, aeth rhywbeth o'i le. Allgofnodwch o ddewislen y porwr a cheisiwch eto.

## SubRow component

tfa-row-backup-codes-title = Codau dilysu wrth gefn
# Only shown for users that have 2FA enabled and verified, but all backup authentication codes have been consumed
# Users that have not enabled or verified 2FA will not see this
tfa-row-backup-codes-not-available = Dim codau ar gael
# $numCodesRemaining - the number of backup authentication codes that have not yet been used (generally between 1 to 5)
# A different message is shown when no codes are available
tfa-row-backup-codes-available-v2 =
    { $numCodesAvailable ->
        [zero] { $numCodesAvailable } codau'n weddill
        [one] { $numCodesAvailable } cod yn weddill
        [two] { $numCodesAvailable } god yn weddill
        [few] { $numCodesAvailable } cod yn weddill
        [many] { $numCodesAvailable } cod yn weddill
       *[other] { $numCodesAvailable } cod yn weddill
    }
# Shown to users who have backup authentication codes - this will allow them to generate new codes to replace the previous ones
tfa-row-backup-codes-get-new-cta-v2 = Creu codau newydd
# Shown to users who have no backup authentication codes
# Button to add backup authentication codes when none are configured
tfa-row-backup-codes-add-cta = Ychwanegu
# 'This' refers to 'backup authentication codes', used as a recovery method for two-step authentication
tfa-row-backup-codes-description-2 = Dyma’r dull adfer mwyaf diogel os na allwch ddefnyddio’ch dyfais symudol neu ap dilysu.
# Recovery phone is a recovery method for two-step authentication
# A recovery code can be sent to the user's phone
tfa-row-backup-phone-title-v2 = Ffôn adfer
# Shown with an alert icon to indicate that no recovery phone is configured
tfa-row-backup-phone-not-available-v2 = Dim rhif ffôn wedi'i ychwanegu
# button to change the configured recovery phone
tfa-row-backup-phone-change-cta = Newid
# button to add/configure a recovery phone
tfa-row-backup-phone-add-cta = Ychwanegu
# Button to remove a recovery phone from the user's account
tfa-row-backup-phone-delete-button = Tynnu
# Shown in tooltip on delete button or delete icon
tfa-row-backup-phone-delete-title-v2 = Dileu'r ffôn adfer
tfa-row-backup-phone-delete-restriction-v2 = Os ydych chi am ddileu eich ffôn adfer, ychwanegwch godau dilysu wrth gefn neu analluogu dilysiad dau gam yn gyntaf er mwyn osgoi cael eich cloi allan o'ch cyfrif.
# "this" refers to recovery phone
tfa-row-backup-phone-description-v2 = Dyma'r dull adfer hawsaf os na allwch ddefnyddio'ch ap dilysu.
# A SIM swap attack is a type of identity theft where an attacker tricks or bribes a mobile carrier
# into transferring a victim's phone number to their own SIM card, enabling access to accounts secured
# with SMS-based two-factor authentication.
tfa-row-backup-phone-sim-swap-risk-link = Gwybodaeth am risg cyfnewid SIM

## Switch component

# Used as "title" attribute when the switch is "on" and interaction turns the switch to "off"
switch-turn-off = Diffodd
# Used as "title" attribute when the switch is "off" and interaction turns the switch to "on"
switch-turn-on = Cychwyn
# Used as "title" attribute when switch has been interacted with and form is submitting
switch-submitting = Yn cyflwyno…
switch-is-on = ymlaen
switch-is-off = i ffwrdd

## Sub-section row Defaults

row-defaults-action-add = Ychwanegu
row-defaults-action-change = Newid
row-defaults-action-disable = Analluogi
row-defaults-status = Dim

## Account recovery key sub-section on main Settings page

rk-header-1 = Allwedd adfer cyfrif
rk-enabled = Galluogwyd
rk-not-set = Heb ei Osod
rk-action-create = Creu
# Button to delete the existing account recovery key and create a new one
rk-action-change-button = Newid
rk-action-remove = Tynnu
rk-key-removed-2 = Tynnwyd yr allwedd adfer cyfrif
rk-cannot-remove-key = Nid oedd modd dileu allwedd adfer eich cyfrif.
rk-refresh-key-1 = Adnewyddu'r allwedd adfer cyfrif
rk-content-explain = Adfer eich manylion pan fyddwch yn anghofio'ch cyfrinair.
rk-cannot-verify-session-4 = Ymddiheuriadau, bu anhawster wrth gadarnhau eich sesiwn
rk-remove-modal-heading-1 = Tynnu allwedd adfer cyfrif?
rk-remove-modal-content-1 =
    Os byddwch yn ailosod eich cyfrinair, ni fydd modd i chi
    defnyddio'ch allwedd adfer cyfrif i gael mynediad i'ch data. Nid oes modd i chi ddadwneud y weithred hon.
rk-remove-error-2 = Nid oedd modd dileu allwedd adfer eich cyfrif.
# Icon button to delete user's account recovery key. Text appears in tooltip on hover and as alt text for screen readers.
unit-row-recovery-key-delete-icon-button-title = Dileu allwedd adfer cyfrif

## Secondary email sub-section on main Settings page

se-heading = Ail e-bost
    .header = Ail E-bost
se-cannot-refresh-email = Ymddiheuriadau, bu anhawster wrth adnewyddu'r e-bost hwnnw.
se-cannot-resend-code-3 = Ymddiheuriadau, bu anhawster wrth ail anfon y cod cadarnhau.
# This string is used in a notification message near the top of the page.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
se-set-primary-successful-2 = { $email } yw eich prif e-bost nawr.
se-set-primary-error-2 = Ymddiheuriadau, bu anhawster wrth newid eich prif e-bost.
# This string is used in a notification message near the top of the page.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
se-delete-email-successful-2 = Dilëwyd { $email } yn llwyddiannus.
se-delete-email-error-2 = Ymddiheuriadau, bu anhawster wrth ddileu'r e-bost hwn
se-verify-session-3 = Bydd angen i chi gadarnhau eich sesiwn gyfredol i gyflawni'r weithred hon.
se-verify-session-error-3 = Ymddiheuriadau, bu anhawster wrth gadarnhau eich sesiwn
# Button to remove the secondary email
se-remove-email =
    .title = Tynnu e-bost
# Button to refresh secondary email status
se-refresh-email =
    .title = Adnewyddu e-bost
se-unverified-2 = heb ei gadarnhau
se-resend-code-2 =
    Mae angen cadarnhau. <button>Ail anfonwch y cod cadarnhau</button>
    os nad yw yn eich blwch derbyn neu'ch ffolder sbam.
# Button to make secondary email the primary
se-make-primary = Gwneud yn brif gyfrif
se-default-content = Cael mynediad i'ch cyfrif os na allwch fewngofnodi i'ch prif e-bost.
se-content-note-1 = Sylwch: Fydd eich ail e-bost ddim yn adfer eich manylion — byddwch angen <a>allwedd adfer cyfrif</a> ar gyfer hynny.
# Default value for the secondary email
se-secondary-email-none = Dim

## Two Step Auth sub-section on Settings main page

tfa-row-header = Dilysu dau gam
tfa-row-enabled = Galluogwyd
tfa-row-disabled-status = Analluogwyd
tfa-row-action-add = Ychwanegu
tfa-row-action-disable = Analluogi
tfa-row-action-change = Newid
tfa-row-button-refresh =
    .title = Adnewyddu dilysu dau gam
tfa-row-cannot-refresh = Ymddiheuriadau, bu anhawster wrth adnewyddu'r dilysu dau gam.
tfa-row-enabled-description = Mae eich cyfrif wedi'i ddiogelu gan ddilysiad dau gam. Bydd angen i chi roi cod pas un-amser o'ch ap dilysu wrth fewngofnodi i'ch { -product-mozilla-account }.
# "this" refers to two-step authentication
# Link goes to https://support.mozilla.org/kb/secure-mozilla-account-two-step-authentication
tfa-row-enabled-info-link = Sut mae hyn yn diogelu eich cyfrif
tfa-row-disabled-description-v2 = Helpwch i ddiogelu'ch cyfrif trwy ddefnyddio ap dilysu trydydd parti fel ail gam i fewngofnodi.
tfa-row-cannot-verify-session-4 = Ymddiheuriadau, bu anhawster wrth gadarnhau eich sesiwn
tfa-row-disable-modal-heading = Analluogi dilysu dau ffactor?
tfa-row-disable-modal-confirm = Analluogi
tfa-row-disable-modal-explain-1 =
    Fyddwch chi ddim yn gallu dadwneud y weithred hon.
    Mae gennych hefyd y dewis o <linkExternal>greu codau adfer wrth gefn newydd</linkExternal>.
# Shown in an alert bar after two-step authentication is disabled
tfa-row-disabled-2 = Mae dilysu dau gam wedi ei analluogi
tfa-row-cannot-disable-2 = Nid oedd modd analluogi dilysu dau gam.
tfa-row-verify-session-info = Mae angen i chi gadarnhau eich sesiwn gyfredol i osod dilysiad dau gam

## TermsPrivacyAgreement
## These terms are used in signin and signup for Firefox account

# This message is followed by a bulleted list
terms-privacy-agreement-intro-2 = Drwy barhau, rydych yn cytuno i:
# link to Monitor's Terms of Service and Privacy Notice, part of a bulleted list
terms-privacy-agreement-monitor-3 = { -brand-mozilla } Gwasanaethau Tanysgrifio <mozSubscriptionTosLink>Telerau Gwasanaeth</mozSubscriptionTosLink> a <mozSubscriptionPrivacyLink>Hysbysiad Preifatrwydd</mozSubscriptionPrivacyLink>
# links to Mozilla Accounts Terms of Service and Privacy Notice, part of a bulleted list
terms-privacy-agreement-mozilla = { -product-mozilla-accounts(cyfalafu: "mawr") } <mozillaAccountsTos>Amodau Gwasanaeth</mozillaAccountsTos> a <mozillaAccountsPrivacy>Hysbysiad Preifatrwydd</mozillaAccountsPrivacy>
# links to Mozilla Account's Terms of Service and Privacy Notice
terms-privacy-agreement-default-2 = Drwy barhau, rydych yn cytuno i <mozillaAccountsTos>Amodau Gwasanaeth</mozillaAccountsTos> a <mozillaAccountsPrivacy>Hysbysiad Preifatrwydd</mozillaAccountsPrivacy>.

## ThirdPartyAuth component
## This is a component that is used to display a list of third party providers (Apple, Google, etc.)

# This appears when a user has the option to authenticate via third party accounts in addition to their Firefox account.
# Firefox account login appears on top, and third party options appear on bottom.
# This string appears as a separation between the two, in the following order: "Enter your password" "Or"(this string) (continue-with-google-button with aria equivalent text) / (continue-with-apple-button with aria equivalent text)
third-party-auth-options-or = Neu
# For the sign-in page, when 3rd-party auth is the only option, this string appears with a divider line between the user's avatar on top and 3rd-party authentication buttons (continue-with-google continue-with-apple buttons) on bottom.
# This could also be translated as "Sign in with the following" or "Sign in with the below".
third-party-auth-options-sign-in-with = Mewngofnodwch gyda
continue-with-google-button = Parhau gyda { -brand-google }
continue-with-apple-button = Parhau gyda { -brand-apple }

## Auth-server based errors that originate from backend service

auth-error-102 = Cyfrif anhysbys
auth-error-103 = Cyfrinair anghywir
auth-error-105-2 = Cod cadarnhau annilys
auth-error-110 = Tocyn annilys
# Error shown to users when they have attempted a request (e.g., requesting a password reset) too many times
# and their requests have been throttled, but the specific amount of time before they can retry is unknown.
auth-error-114-generic = Rydych chi wedi ceisio gormod o weithiau. Ceisiwch eto yn nes ymlaen.
# This string is the amount of time required before a user can attempt another request.
# Variables:
#   $retryAfter (String) - Time required before retrying a request. The variable is localized by our
#                          formatting library (momentjs) as a "time from now" and automatically includes
#                          the prefix as required by the current locale (for example, "in 15 minutes", "dans 15 minutes").
auth-error-114 = Rydych wedi ceisio gormod o weithiau. Ceisiwch eto'n hwyrach { $retryAfter }.
auth-error-125 = Cafodd y cais ei rwystro am resymau diogelwch
auth-error-129-2 = Rydych wedi rhoi rhif ffôn annilys. Gwiriwch ef a rhowch gynnig arall arni.
auth-error-138-2 = Sesiwn heb ei gadarnhau
auth-error-139 = Rhaid i'r ail e-bost fod yn wahanol i'ch cyfeiriad e-bost
# (Email) address has been added as a secondary email for another account and cannot be used to register a new account.
# The reservation may be temporary. If the reservation is not confirmed before the reservation expires (~10 min), the email will become available again.
auth-error-144 = Mae'r e-bost hwn ar gadw i gyfrif arall. Ceisiwch eto yn nes ymlaen neu defnyddiwch gyfeiriad e-bost gwahanol.
auth-error-155 = Heb ganfod tocyn TOTP
# Error shown when the user submits an invalid backup authentication code
auth-error-156 = Heb ganfod cod dilysu wrth gefn
auth-error-159 = Allwedd adfer cyfrif annilys
auth-error-183-2 = Cod cadarnhau annilys neu wedi dod i ben
auth-error-202 = Nid yw'r nodwedd wedi ei alluogi
auth-error-203 = Nid yw'r system ar gael, ceisiwch eto cyn bo hir.
auth-error-206 = Methu creu cyfrinair, cyfrinair wedi'i osod yn barod
auth-error-214 = Mae rhif ffôn adfer eisoes yn bodoli
auth-error-215 = Nid yw'r rhif ffôn adfer yn bodoli
auth-error-216 = Wedi cyrraedd terfyn neges destun
auth-error-218 = Methu tynnu ffôn adfer, codau dilysu wrth gefn ar goll.
auth-error-219 = Mae'r rhif ffôn hwn wedi'i gofrestru gyda gormod o gyfrifon. Rhowch gynnig ar rif gwahanol.
auth-error-999 = Gwall anhysbys
auth-error-1001 = Diddymwyd yr ymgais i fewngofnodi
auth-error-1002 = Daeth y sesiwn i ben. Mewngofnodwch i barhau.
auth-error-1003 = Mae storfa leol neu gwcis wedi'u hanalluogi o hyd
auth-error-1008 = Rhaid i'ch cyfrinair newydd fod yn wahanol
auth-error-1010 = Rhaid darparu cyfrinair dilys
auth-error-1011 = Mae angen e-bost dilys
auth-error-1018 = Dychwelwyd eich e-bost cadarnhau. E-bost wedi'i gamdeipio?
auth-error-1020 = E-bost wedi'i gamdeipio? Nid yw firefox.com yn wasanaeth e-bost dilys
auth-error-1031 = Mae'n rhaid i chi roi eich oed er mwyn cofrestru
auth-error-1032 = Rhaid rhoi oed dilys er mwyn cofrestru
auth-error-1054 = Cod dilysu dau gam annilys
auth-error-1056 = Cod dilysu wrth gefn annilys
auth-error-1062 = Ailgyfeirio annilys
# Shown when a user tries to sign up with an email address with a domain that doesn't receive emails
auth-error-1064 = E-bost wedi'i gamdeipio? Nid yw { $domain } yn wasanaeth e-bost dilys
auth-error-1066 = Nid oes modd defnyddio arallenwau e-bost i greu cyfrifon.
auth-error-1067 = Camdeipio'r e-bost?
# Displayed when we want to reference a user's previously set up recovery phone
# number, but they are not completely signed in yet. We'll only show the last 4 digits.
# Variables:
#  $lastFourPhoneNumber (Number) - The last 4 digits of the user's recovery phone number
recovery-phone-number-ending-digits = Rhif sy'n gorffen gyda { $lastFourPhoneNumber }
oauth-error-1000 = Aeth rhywbeth o'i le. Caewch y tab hwn a cheisio eto.

## Connect Another Device page

# A user will only see this header if they are signed in. The header will be preceded by a green checkmark (rtl/ltr sensitive)
connect-another-device-signed-in-header = Rydych wedi mewngofnodi i { -brand-firefox }
# A "success" message visible to users who verified via email
connect-another-device-email-confirmed-banner = E-bost wedi'i gadarnhau
# A "success" message visible to users who verified via sign-in
connect-another-device-signin-confirmed-banner = Mewngofnodi wedi ei gadarnhau
# A message prompts the user to sign in to this instance of the Firefox browser so as to complete device sync. This is followed by a link labeled "Sign in"
connect-another-device-signin-to-complete-message = Mewngofnodwch i'r { -brand-firefox } hwn i gwblhau'r gosod
# A link for the user to sign in to the current Firefox browser, preceded by a message prompting the user to sign in so as to complete the device sync setup
connect-another-device-signin-link = Mewngofnodi
# A message prompting the user to sign in via a different device than the current one so as to complete the device-syncing process
connect-another-device-still-adding-devices-message = Yn dal i ychwanegu dyfeisiau? Mewngofnodwch i { -brand-firefox } ar ddyfais arall i orffen y gosod
# A message prompting the user to sign in via a different device than the current one so as to complete the device-syncing process
connect-another-device-signin-another-device-to-complete-message = Mewngofnodwch i { -brand-firefox } ar ddyfais arall i orffen y gosod
# This message is a value-proposition prompting the user to sync another device so as to get tabs, bookmarks, and passwords shared between devices
connect-another-device-get-data-on-another-device-message = Eisiau cael eich tabiau, nodau tudalen, a chyfrineiriau ar ddyfais arall?
# This link leads the user back to the `/pair` page so as to connect another device
connect-another-device-cad-link = Cysylltu dyfais arall
# This link cancels the process of connecting another device, and takes the user back to Account Settings
connect-another-device-not-now-link = Nid nawr
# This is a message for Firefox Android users, prompting them to complete the process of connecting another device by signing into Firefox for Android
connect-another-device-android-complete-setup-message = Mewngofnodwch i { -brand-firefox } Android i orffen y gosod
# This is a message for Firefox iOS users, prompting them to complete the process of connecting another device by signing into Firefox for iOS
connect-another-device-ios-complete-setup-message = Mewngofnodwch i { -brand-firefox } iOS i orffen y gosod

## Cookies disabled page
## Users will see this page if they have local storage or cookies disabled.

cookies-disabled-header = Mae angen storfa leol a chwcis
cookies-disabled-enable-prompt-2 = Galluogwch cwcis a storfa leol yn eich porwr i gael mynediad i'ch cyfrif { -product-mozilla-account }. Bydd gwneud hynny yn galluogi swyddogaethau fel eich cofio rhwng sesiynau.
# A button users may click to check if cookies and local storage are enabled and be directed to the previous page if so.
cookies-disabled-button-try-again = Ceisiwch eto
# An external link going to: https://support.mozilla.org/kb/cookies-information-websites-store-on-your-computer
cookies-disabled-learn-more = Dysgu rhagor

## Index / home page

index-header = Rhowch eich e-bost
index-sync-header = Ymlaen i'ch { -product-mozilla-account }
index-sync-subheader = Cydweddwch eich cyfrineiriau, tabiau a nodau tudalen ym mhob man rydych yn defnyddio { -brand-firefox }.
index-relay-header = Crëwch arallenw e-bost
index-relay-subheader = Rhowch y cyfeiriad e-bost lle yr hoffech anfon e-byst ymlaen o'ch e-bost ag arallenw.
# $serviceName - the service (e.g., Pontoon) that the user is signing into with a Mozilla account
index-subheader-with-servicename = Ymlaen i { $serviceName }
index-subheader-default = Ymlaen i osodiadau'r cyfrif
index-cta = Cofrestrwch neu fewngofnodwch
index-account-info = Mae { -product-mozilla-account } hefyd yn datgloi mynediad i fwy o gynnyrch sy'n diogelu preifatrwydd gan { -brand-mozilla }.
index-email-input =
    .label = Rhowch eich e-bost
# When users delete their Mozilla account inside account Settings, they are redirected to this page with a success message
index-account-delete-success = Cyfrif wedi ei ddileu'n llwyddiannus
# Displayed when users try to sign up for an account and their confirmation code email bounces
index-email-bounced = Dychwelwyd eich e-bost cadarnhau. E-bost wedi'i gamdeipio?

## InlineRecoveryKeySetup page component

inline-recovery-key-setup-create-error = Wps! Nid oedd modd i ni greu allwedd adfer eich cyfrif. Ceisiwch eto yn nes ymlaen.
inline-recovery-key-setup-recovery-created = Crëwyd yr allwedd adfer cyfrif.
inline-recovery-key-setup-download-header = Diogelwch eich cyfrif
inline-recovery-key-setup-download-subheader = Llwythwch ef i lawr a'i gadw
inline-recovery-key-setup-download-info = Cadwch yr allwedd hon yn rhywle y byddwch chi'n ei gofio - fyddwch chi ddim yn gallu dychwelyd i'r dudalen hon yn nes ymlaen.
inline-recovery-key-setup-hint-header = Argymhelliad diogelwch

## InlineTotpSetup page
## TOTP (time-based one-time password) is a form of two-factor authentication (2FA).

inline-totp-setup-cancel-setup-button = Diddymu'r gosodiad
inline-totp-setup-continue-button = Parhau
# <authenticationAppsLink> links to a list of security apps
inline-totp-setup-add-security-link = Ychwanegwch haen o ddiogelwch i'ch cyfrif drwy ofyn am godau dilysu o un o'r <authenticationAppsLink>apiau dilysu hyn</authenticationAppsLink>.
#  The <enable2StepDefaultSpan> elements are just visual separation here
inline-totp-setup-enable-two-step-authentication-default-header-2 = Galluogwch ddilysu dau gam <span>i fynd i osodiadau'r cyfrif</span>
# { $serviceName } is the name of the service which the user wants to authenticate to. The <enable2StepCustomServiceSpan> elements are just visual separation
inline-totp-setup-enable-two-step-authentication-custom-header-2 = Galluogwch ddilysu dau-gam <span>i fynd i { $serviceName }</span>
inline-totp-setup-ready-button = Yn barod
# The authentication code a user is scanning is a QR code.
# { $serviceName } is the name of the service which the user wants to authenticate to. The <scanAuthCodeHeaderSpan> elements are just visual separation
inline-totp-setup-show-qr-custom-service-header-2 = Sganiwch y cod dilysu <span>i fynd i { $serviceName }</span>
# { $serviceName } is the name of the service which the user wants to authenticate to. The <enterCodeManuallyHeaderSpan> elements are just visual separation
inline-totp-setup-no-qr-custom-service-header-2 = Rhowch y cod â llaw <span>i fynd i { $serviceName }</span>
# The authentication code a user is scanning is a QR code.
# The <scanAuthHeaderSpan> elements are just visual separation
inline-totp-setup-show-qr-default-service-header-2 = Sganiwch y cod dilysu <span>i fynd i osodiadau'r cyfrif</span>
# The <enterCodeManuallyHeaderSpan> elements are just visual separation
inline-totp-setup-no-qr-default-service-header-2 = Rhowch y cod â llaw <span>i fynd i osodiadau'r cyfrif</span>
# The <toggleToQRButton> allows the user to use a QR code instead of manually entering a secret key
inline-totp-setup-enter-key-or-use-qr-instructions = Teipiwch yr allwedd gyfrinachol hon yn eich ap dilysu. <toggleToQRButton>Sganio cod QR yn lle hynny?</toggleToQRButton>
# The <toggleToManualModeButton> allows the user to manually enter a secret key instead of scanning a QR code
inline-totp-setup-use-qr-or-enter-key-instructions = Sganiwch y cod QR yn eich ap dilysu ac yna rhowch y cod dilysu y mae'n ei ddarparu. <toggleToManualModeButton>Methu sganio'r cod?</toggleToManualModeButton>
# The "authentication code" here refers to the code provided by an authentication app.
inline-totp-setup-on-completion-description = Unwaith y bydd wedi'i gwblhau, bydd yn dechrau cynhyrchu codau dilysu i chi eu rhoi.
# The "authentication code" here refers to the code provided by an authentication app.
inline-totp-setup-security-code-placeholder = Cod dilysu
# The "authentication code" here refers to the code provided by an authentication app.
inline-totp-setup-code-required-error = Mae angen cod dilysu
tfa-qr-code-alt = Defnyddiwch y cod { $code } i osod dilysiad dau gam mewn rhaglenni sy'n ei gefnogi.
inline-totp-setup-page-title = Dilysu dau gam

## Legal page. This page contains simply a header and links to pages that display
## content from https://github.com/mozilla/legal-docs

legal-header = Cyfreithiol
# Links to our internal "Firefox Cloud" /legal/terms page
legal-terms-of-service-link = Amodau Gwasanaeth
# Links to our internal "Firefox Cloud" /legal/terms page
legal-privacy-link = Hysbysiad Preifatrwydd

## Legal privacy notice page. Most content comes from https://github.com/mozilla/legal-docs

legal-privacy-heading = Hysbysiad Preifatrwydd

## Legal terms of service page. Most content comes from https://github.com/mozilla/legal-docs

legal-terms-heading = Amodau Gwasanaeth

## AuthAllow page - Part of the device pairing flow

pair-auth-allow-heading-text = A ydych chi newydd fewngofnodi i { -product-firefox }?
# Submit button to confirm that the user initiated the device pairing
# and that they approve of the new device being added to their account
pair-auth-allow-confirm-button = Iawn, yn cymeradwyo'r ddyfais
# "If this wasn't you" means "If it wasn't you that just signed in to Firefox"
# The text with the <link> tags links to a `reset password` page
pair-auth-allow-refuse-device-link = Os nad chi oedd hwn, <link>newidiwch eich cyfrinair</link>

## PairAuthComplete page - part of the device pairing flow

# Heading to confirm the successful pairing of a new device with the user's account
# Device here is non specific (could be a laptop, tablet, phone, etc.)
pair-auth-complete-heading = Dyfais wedi'i gysylltu
# Variable { $deviceFamily } is generally a browser name, for example "Firefox"
# Variable { $deviceOS } is an operating system short name, for example "iOS", "Android"
pair-auth-complete-now-syncing-device-text = Rydych nawr yn cydweddu â: { $deviceFamily } ar { $deviceOS }
pair-auth-complete-sync-benefits-text = Nawr gallwch chi gael mynediad i'ch tabiau agored, cyfrineiriau a nodau tudalen ar eich holl ddyfeisiau.
pair-auth-complete-see-tabs-button = Gweld tabiau o ddyfeisiau wedi'u cydweddu
pair-auth-complete-manage-devices-link = Rheoli dyfeisiau

## AuthTotp page
## TOTP (time-based one-time password) is a form of two-factor authentication (2FA).
## Users that have set up two-factor authentication land on this page during device pairing.

# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "to continue to account settings" can stand alone as "Continue to account settings"
auth-totp-heading-w-default-service = Rhowch y cod dilysu <span>i barhau i osodiadau cyfrif</span>
# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "to continue to { $serviceName }" can stand alone as "Continue to { $serviceName }"
# { $serviceName } represents a product name (e.g., Mozilla VPN) that will be passed in as a variable
auth-totp-heading-w-custom-service = Rhowch god dilysu <span>i barhau i { $serviceName }</span>
auth-totp-instruction = Agorwch eich ap dilysu a rhowch y cod dilysu y mae'n ei gynnig.
auth-totp-input-label = Rhowch y cod 6 digid
# Form button to confirm if the authentication code entered by the user is valid
auth-totp-confirm-button = Cadarnhau
# Error displayed in a tooltip when the form is submitted without a code
auth-totp-code-required-error = Mae angen cod dilysu

## WaitForSupp page - Part of the devide pairing flow
## Users see this page when they have started to pair a second (or more) device to their account
## The pairing must be approved from both devices to succeed

# The "other device" is non-specific and could be a desktop computer, laptop, tablet, mobile phone, etc.
# Strings within the <span> elements appear as a subheading.
pair-wait-for-supp-heading-text = Mae angen cymeradwyaeth nawr <span>o'ch dyfais arall</span>

## PairFailure - a view which displays on failure of the device pairing process

pair-failure-header = Paru'n aflwyddiannus
pair-failure-message = Cafodd y broses osod ei derfynu.

## Pair index page

pair-sync-header = Cydweddwch { -brand-firefox } ar eich ffôn neu dabled
pair-cad-header = Cysylltwch { -brand-firefox } ar ddyfais arall
pair-already-have-firefox-paragraph = Oes gennych chi { -brand-firefox } ar ffôn neu dabled yn barod?
# Clicking this button initiates the pairing process, usually by directing the user to the `about:preferences` page in Firefox
pair-sync-your-device-button = Cydweddwch eich dyfais
# This is a heading element immediately preceded by "Sync your device" and followed by a link and QR code to download Firefox
pair-or-download-subheader = Neu lwytho i lawr
# Directs user to scan a QR code to download Firefox. <linkExternal> is an anchor tag that directs the user to where they can download the { -brand-firefox } app
pair-scan-to-download-message = Sganiwch i lwytho i lawr { -brand-firefox } ar gyfer ffôn symudol, neu anfonwch <linkExternal>dolen llwytho i lawr</linkExternal> i chi'ch hun.
# This allows the user to exit the sync/pair flow, and redirects them back to Settings
pair-not-now-button = Nid nawr
pair-take-your-data-message = Ewch â'ch tabiau, nodau tudalen, a chyfrineiriau i le bynnag rydych chi'n defnyddio { -brand-firefox }.
# This initiates the pairing process, usually by directing the user to the `about:preferences` page in Firefox
pair-get-started-button = Cychwyn arni
# This is the aria label on the QR code image
pair-qr-code-aria-label = Cod QR

## PairSuccess - a view which displays  on successful completion of the device pairing process

pair-success-header-2 = Dyfais wedi'i gysylltu
pair-success-message-2 = Roedd y paru'n llwyddiant.

## SuppAllow page - Part of the device pairing flow
## Users see this page when they have started to pair a second (or more) device to their account
## The pairing must be confirmed from both devices to succeed

# Strings within the <span> elements appear as a subheading.
# Variable $email is the user's email address
pair-supp-allow-heading-text = Cadarnhau paru <span>{ $email }</span>
pair-supp-allow-confirm-button = Cadarnhau paru
pair-supp-allow-cancel-link = Diddymu

## WaitForAuth page - Part of the devide pairing flow
## Users see this page when they have started to pair a second (or more) device to their account
## The pairing must be approved from both devices to succeed

# The "other device" is non-specific and could be a desktop computer, laptop, tablet, mobile phone, etc.
# Strings within the <span> elements appear as a subheading.
pair-wait-for-auth-heading-text = Mae angen cymeradwyaeth nawr <span>o'ch dyfais arall</span>

## PairUnsupported - a view which is shown when the user tries to scan the pairing QR code any way other than through a Firefox app

pair-unsupported-header = Paru gan ddefnyddio ap
pair-unsupported-message = Oeddech chi'n defnyddio camera'r system? Rhaid i chi baru o fewn ap { -brand-firefox }.

## SetPassword page
## Third party auth users that do not have a password set yet are prompted for a


# password to complete their sign-in when they want to login to a service requiring it.

set-password-heading-v2 = Creu cyfrinair i gydweddu
# "This" refers to the heading, "Create password to sync"
set-password-info-v2 = Mae hyn yn amgryptio eich data. Mae angen iddo fod yn wahanol i gyfrinair eich cyfrif { -brand-google } neu { -brand-apple }.

## ThirdPartyAuthCallback Page
## This page is called after a user completes the third party authentication flow from Google or Apple.

third-party-auth-callback-message = Arhoswch, rydych chi'n cael eich ailgyfeirio i'r rhaglen awdurdodedig.

## AccountRecoveryConfirmKey page

account-recovery-confirm-key-heading = Rhowch allwedd adfer eich cyfrif
account-recovery-confirm-key-instruction = Mae'r allwedd hon yn adennill eich data pori wedi'i amgryptio, fel cyfrineiriau a nodau tudalen, o weinyddion { -brand-firefox }.
# Prompts the user to enter their account recovery key
# Account recovery key contains a mix of letters and numbers, no special characters
account-recovery-confirm-key-input-label =
    .label = Rhowch allwedd adfer eich cyfrif 32 nod
# When setting up an account recovery key, users have the option of storing an account recovery key hint that is shown during password reset
account-recovery-confirm-key-hint = Eich awgrym cadw yw:
# Clicking this button checks if the recovery key provided by the user is correct and associated with their account
account-recovery-confirm-key-button-2 = Parhau
# Link that leads to the password reset page (without recovery code)
account-recovery-lost-recovery-key-link-2 = Methu â dod o hyd i allwedd adfer eich cyfrif?

## CompleteResetPassword component
## User followed a password reset link and is now prompted to create a new password

complete-reset-pw-header-v2 = Creu cyfrinair newydd
# A new password was successfully set for the user's account
# Displayed in an alert bar
complete-reset-password-success-alert = Wedi gosod y cyfrinair
# An error occurred while attempting to set a new password (password reset flow)
# Displayed in an alert bar
complete-reset-password-error-alert = Ymddiheuriadau, bu anhawster wrth osod eich cyfrinair.
# Link to go back and use an account recovery key before resetting the password
complete-reset-pw-recovery-key-link = Defnyddiwch allwedd adfer cyfrif
# A message informing the user that the password reset was successful and reminding them to create another recovery key
# Displayed on the sign in page
reset-password-complete-banner-heading = Mae eich cyfrinair wedi cael ei ail osod.
reset-password-complete-banner-message = Peidiwch ag anghofio cynhyrchu allwedd adfer cyfrif newydd o'ch gosodiadau { -product-mozilla-account } i atal problemau mewngofnodi yn y dyfodol.
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
complete-reset-password-desktop-relay = Bydd { -brand-firefox } yn ceisio eich anfon yn ôl i ddefnyddio e-bost arallenw ar ôl i chi fewngofnodi.

# ConfirmBackupCodeResetPassword page

confirm-backup-code-reset-password-input-label = Rhowch y cod 10 nod
confirm-backup-code-reset-password-confirm-button = Cadarnhau
confirm-backup-code-reset-password-subheader = Rhowch y cod dilysu wrth gefn
confirm-backup-code-reset-password-instruction = Rhowch un o'r codau untro y gwnaethoch chi eu cadw pan wnaethoch chi osod dilysiad dau gam.
# Link out to support article: https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication
confirm-backup-code-reset-password-locked-out-link = Ydych chi wedi'ch cloi allan?

## Confirm Reset Password With Code

confirm-reset-password-with-code-heading = Gwiriwch eich e-bost
# Text within span appears in bold
# $email - email address for which a password reset was requested
confirm-reset-password-with-code-instruction = Anfonwyd cod cadarnhau i <span>{ $email }</span>.
# Shown above a group of 8 single-digit input boxes
# Only numbers allowed
confirm-reset-password-code-input-group-label = Rhowch god 8 digid o fewn 10 munud
# Clicking the button submits and verifies the code
# If succesful, continues to the next step of the password reset
confirm-reset-password-otp-submit-button = Parhau
# Button to request a new reset password confirmation code
confirm-reset-password-otp-resend-code-button = Ail-anfon y cod
# Link to cancel the password reset and sign in with a different account
confirm-reset-password-otp-different-account-link = Defnyddiwch gyfrif gwahanol

## PasswordResetConfirmTotp Page

confirm-totp-reset-password-header = Ailosod eich cyfrinair
confirm-totp-reset-password-subheader-v2 = Rhowch god dilysu dau gam
confirm-totp-reset-password-instruction-v2 = Gwiriwch eich <strong>ap dilysu</strong> i ailosod eich cyfrinair.
confirm-totp-reset-password-trouble-code = Trafferth cyflwyno'r cod?
confirm-totp-reset-password-confirm-button = Cadarnhau
confirm-totp-reset-password-input-label-v2 = Rhowch y cod 6 digid
confirm-totp-reset-password-use-different-account = Defnyddiwch gyfrif gwahanol

## ResetPassword start page

password-reset-flow-heading = Ailosod eich cyfrinair
password-reset-body-2 = Byddwn yn gofyn am ychydig o bethau dim ond chi sy'n eu gwybod yn i gadw'ch cyfrif yn ddiogel.
password-reset-email-input =
    .label = Rhowch eich e-bost
password-reset-submit-button-2 = Parhau

## ResetPasswordConfirmed

reset-password-complete-header = Mae eich cyfrinair wedi ei ailosod
# $serviceName is a product name such as Monitor, Relay
reset-password-confirmed-cta = Parhau i { $serviceName }

## Reset password recovery method page
## This page is shown to users when they are having trouble resetting their


# password, and they previously had set up an account recovery method.

password-reset-recovery-method-header = Ailosod eich cyfrinair
password-reset-recovery-method-subheader = Dewiswch ddull adfer
# This is displayed to the user when they are choosing an alternative method to authenticate themself in the password reset process when they do not have access to their two-factor authenticator application
password-reset-recovery-method-details = Gadewch i ni wneud yn siŵr mai chi sy'n defnyddio'ch dulliau adfer.
password-reset-recovery-method-phone = Ffôn adfer
password-reset-recovery-method-code = Codau dilysu wrth gefn
# Variable: $numBackupCodes (String) - The number of backup authentication codes the user has left, e.g., 4
password-reset-recovery-method-code-info =
    { $numBackupCodes ->
        [zero] { $numBackupCodes } codau'n weddill
        [one] { $numBackupCodes } cod yn weddill
        [two] { $numBackupCodes } god yn weddill
        [few] { $numBackupCodes } cod yn weddill
        [many] { $numBackupCodes } chod yn weddill
       *[other] { $numBackupCodes } cod yn weddill
    }
# Shown when a backend service fails and a code cannot be sent to the user's recovery phone.
password-reset-recovery-method-send-code-error-heading = Bu anhawster wrth anfon cod i'ch ffôn adfer
password-reset-recovery-method-send-code-error-description = Ceisiwch eto yn nes ymlaen neu defnyddio eich codau dilysu wrth gefn.

## ResetPasswordRecoveryPhone page

reset-password-recovery-phone-flow-heading = Ailosod eich cyfrinair
# A recovery code in context of this page is a one time code sent to the user's phone
reset-password-recovery-phone-heading = Rhowch y cod adfer
# Text that explains the user should check their phone for a recovery code
# $maskedPhoneNumber - The users masked phone number
reset-password-recovery-phone-instruction-v3 = Anfonwyd cod 6 digid i'r rhif ffôn sy'n gorffen gyda <span>{ $lastFourPhoneDigits }</span> drwy neges destun. Daw'r cod hwn i ben ar ôl 5 munud. Peidiwch â rhannu’r cod hwn ag unrhyw un.
reset-password-recovery-phone-input-label = Rhowch y cod 6 digid
reset-password-recovery-phone-code-submit-button = Cadarnhau
reset-password-recovery-phone-resend-code-button = Ail-anfon y cod
reset-password-recovery-phone-resend-success = Anfonwyd y cod
# links to https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication
reset-password-recovery-phone-locked-out-link = Ydych chi wedi'ch cloi allan?
reset-password-recovery-phone-send-code-error-heading = Bu anhawster wrth anfon cod
reset-password-recovery-phone-code-verification-error-heading = Bu anhawster wrth wirio'ch cod
# Follows the error message (e.g, "There was a problem sending a code")
reset-password-recovery-phone-general-error-description = Ceisiwch eto'n ddiweddarach.
reset-password-recovery-phone-invalid-code-error-description = Mae'r cod yn annilys neu wedi dod i ben.
reset-password-recovery-phone-invalid-code-error-link = Defnyddio codau dilysu wrth gefn yn lle hynny?
reset-password-with-recovery-key-verified-page-title = Mae'r cyfrinair wedi ei ailosod yn llwyddiannus
reset-password-complete-new-password-saved = Cyfrinair newydd wedi'i gadw!
reset-password-complete-recovery-key-created = Mae allwedd adfer cyfrif newydd wedi'i chreu. Llwythwch hi i lawr a'i chadw nawr.
reset-password-complete-recovery-key-download-info = Mae'r allwedd hon yn hanfodol ar gyfer adfer data os byddwch yn anghofio eich cyfrinair. <b>Llwythwch hi i lawr a'i chadw'n ddiogel nawr, gan na fydd modd i chi allu cyrchu'r dudalen hon eto yn nes ymlaen.</b>

## CompleteSignin component

# This is a label that precedes any error which could arise from trying to validate the user's signin
error-label = Gwall:
# This is a message that is shown to users along with a "Loading" spinner while the site tries to check their signin
validating-signin = Wrthi'n dilysu mewngofnod…
# Shown above an error banner (e.g., invalid confirmation code, unexpected error)
complete-signin-error-header = Gwall cadarnhau
# The user followed a signin confirmation link, but that link is expired and no longer valid
signin-link-expired-header = Mae'r ddolen dilysu wedi dod i ben
signin-link-expired-message-2 = Mae'r ddolen a gliciwyd gennych wedi dod i ben neu eisoes wedi'i defnyddio.

## Signin page

# Strings within the <span> elements appear as a subheading.
signin-password-needed-header-2 = Rhowch eich cyfrinair <span>ar gyfer eich cyfrif { -product-mozilla-account }</span>
# $serviceName - the name of the service which the user authenticating for
# For languages structured like English, the phrase can read "to continue to { $serviceName }"
signin-subheader-without-logo-with-servicename = Parhau i { $serviceName }
signin-subheader-without-logo-default = Parhau i osodiadau cyfrif
signin-button = Mewngofnodi
signin-header = Mewngofnodi
signin-use-a-different-account-link = Defnyddiwch gyfrif gwahanol
signin-forgot-password-link = Wedi anghofio'r cyfrinair?
signin-password-button-label = Cyfrinair
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-desktop-relay = Bydd { -brand-firefox } yn ceisio eich anfon yn ôl i ddefnyddio e-bost arallenw ar ôl i chi fewngofnodi.
signin-code-expired-error = Cod wedi dod i ben. Mewngofnodwch eto.
signin-account-locked-banner-heading = Ailosodwch eich cyfrinair
signin-account-locked-banner-description = Rydym wedi cloi eich cyfrif i'w gadw'n ddiogel rhag gweithgarwch amheus.
# This link points to https://accounts.firefox.com/reset_password
signin-account-locked-banner-link = Ailosodwch eich cyfrinair i fewngofnodi

## ReportSignin Page
## When users receive an "Is this you signing in?" email with an unblock code,
## they can click "report it to us" if they did not attempt to sign in.
## This will be the page shown to users to block the sign in and report it.

report-signin-link-damaged-body = Mae nodau ar goll yn y ddolen rydych newydd ei chlicio ac efallai wedi ei dorri gan eich rhaglen e-bost. Copïwch y cyfeiriad yn ofalus a cheisiwch eto.
report-signin-header = Adrodd ar fewngofnodi heb ganiatâd?
report-signin-body = Rydych wedi derbyn e-bost am ymgais i gael mynediad at eich cyfrif. Hoffech chi adrodd am hyn fel digwyddiad amheus?
report-signin-submit-button = Adroddiad gweithgaredd
report-signin-support-link = Pam mae hyn yn digwydd?
report-signin-error = Ymddiheuriadau, bu anhawster wrth gyflwyno'r adroddiad.
signin-bounced-header = Ymddiheuriadau. Rydym wedi cloi eich  cyfrif.
# $email (string) - The user's email.
signin-bounced-message = Cafodd yr e-bost cadarnhau roeddem wedi ei anfon i { $email } ei ddychwelyd ac rydym wedi cloi eich cyfrif er mwyn diogelu eich data { -brand-firefox }.
# linkExternal is button which logs the user's action and navigates them to mozilla support
signin-bounced-help = Os yw hwn yn gyfrif e-bost dilys, <linkExternal>gadewch i ni wybod</linkExternal> a byddwn yn gallu helpu i ddatgloi eich cyfrif.
signin-bounced-create-new-account = Ddim yn berchen ar yr e-bost hwn? Crëwch gyfrif newydd
back = Nôl

## SigninPushCode page
## This page is used to send a push notification to the user's device for two-factor authentication (2FA).

signin-push-code-heading-w-default-service = Dilyswch y mewngofnodi hwn <span>i barhau i'r gosodiadau cyfrif</span>
signin-push-code-heading-w-custom-service = Dilyswch y mewngofnodiad hwn <span>i barhau i { $serviceName }</span>
signin-push-code-instruction = Gwiriwch eich dyfeisiau eraill a chymeradwywch y mewngofnodi hwn o'ch porwr { -brand-firefox }.
signin-push-code-did-not-recieve = Heb dderbyn yr hysbysiad?
signin-push-code-send-email-link = Cod e-bost

## SigninPushCodeConfirmPage

signin-push-code-confirm-instruction = Cadarnhewch eich mewngofnodi
signin-push-code-confirm-description = Rydym wedi canfod ymgais mewngofnodi o'r ddyfais ganlynol. Os mai chi oedd hwn, cymeradwywch y mewngofnodi
signin-push-code-confirm-verifying = Dilysu
signin-push-code-confirm-login = Cadarnhau mewngofnodi
signin-push-code-confirm-wasnt-me = Nid fi oedd hwn, newidiwch y cyfrinair.
signin-push-code-confirm-login-approved = Mae eich mewngofnodi wedi'i gymeradwyo. Caewch y ffenestr hon.
signin-push-code-confirm-link-error = Dolen wedi'i difrodi. Ceisiwch eto.

## Signin recovery method page
## This page is shown to users when they are having trouble signing in with
## their password, and they previously had set up an account recovery method.

signin-recovery-method-header = Mewngofnodi
signin-recovery-method-subheader = Dewiswch ddull adfer
signin-recovery-method-details = Gadewch i ni sicrhau mai chi sy'n defnyddio'ch dulliau adfer.
signin-recovery-method-phone = Ffôn adfer
signin-recovery-method-code-v2 = Codau dilysu wrth gefn
# Variable: $numBackupCodes (String) - The number of backup authentication codes the user has left, e.g., 4
signin-recovery-method-code-info-v2 =
    { $numBackupCodes ->
        [zero] { $numBackupCodes } codau'n weddill
        [one] { $numBackupCodes } cod yn weddill
        [two] { $numBackupCodes } god yn weddill
        [few] { $numBackupCodes } cod yn weddill
        [many] { $numBackupCodes } cod yn weddill
       *[other] { $numBackupCodes } cod yn weddill
    }
# Shown when a backend service fails and a code cannot be sent to the user's recovery phone.
signin-recovery-method-send-code-error-heading = Bu problem wrth anfon cod i'ch ffôn adfer
signin-recovery-method-send-code-error-description = Ceisiwch eto yn nes ymlaen neu defnyddiwch eich codau dilysu wrth gefn.

## SigninRecoveryCode page
## Users are prompted to enter a backup authentication code
## (provided to the user when they first set up two-step authentication)
## when they are unable to sign in with two-step authentication (e.g., Authy, Duo, etc.)

signin-recovery-code-heading = Mewngofnodi
signin-recovery-code-sub-heading = Rhowch god dilysu wrth gefn
# codes here refers to backup authentication codes
signin-recovery-code-instruction-v3 = Rhowch un o'r codau un-tro y gwnaethoch chi eu cadw pan wnaethoch chi osod dilysiad dau gam.
# code here refers to backup authentication code
signin-recovery-code-input-label-v2 = Rhowch god 10 nod
# Form button to confirm if the backup authentication code entered by the user is valid
signin-recovery-code-confirm-button = Cadarnhau
# Link to go to the page to use recovery phone instead
signin-recovery-code-phone-link = Defnyddiwch ffôn adfer
# External link for support if the user can't use two-step autentication or a backup authentication code
# https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication
signin-recovery-code-support-link = Ydych chi wedi'ch cloi allan?
# Error displayed in a tooltip when form is submitted witout a code
signin-recovery-code-required-error = Mae angen cod dilysu wrth gefn
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-recovery-code-use-phone-failure = Bu problem wrth anfon cod i'ch ffôn adfer
signin-recovery-code-use-phone-failure-description = Ceisiwch eto'n ddiweddarach.

## SigninRecoveryPhone page

signin-recovery-phone-flow-heading = Mewngofnodi
# A recovery code in context of this page is a one time code sent to the user's phone
signin-recovery-phone-heading = Rhowch y cod adfer
# Text that explains the user should check their phone for a recovery code
# $maskedPhoneNumber - The users masked phone number
signin-recovery-phone-instruction-v3 = Anfonwyd cod chwe digid i'r rhif ffôn sy'n gorffen â <span>{ $lastFourPhoneDigits }</span> drwy neges destun. Daw'r cod hwn i ben ar ôl 5 munud. Peidiwch â rhannu’r cod hwn ag unrhyw un.
signin-recovery-phone-input-label = Rhowch y cod 6 digid
signin-recovery-phone-code-submit-button = Cadarnhau
signin-recovery-phone-resend-code-button = Ail-anfon y cod
signin-recovery-phone-resend-success = Anfonwyd y cod
# links to https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication
signin-recovery-phone-locked-out-link = Ydych chi wedi'ch cloi allan?
signin-recovery-phone-send-code-error-heading = Bu problem wrth anfon cod
signin-recovery-phone-code-verification-error-heading = Bu problem wrth wirio'ch cod
# Follows the error message (e.g, "There was a problem sending a code")
signin-recovery-phone-general-error-description = Ceisiwch eto'n ddiweddarach.
signin-recovery-phone-invalid-code-error-description = Mae'r cod yn annilys neu wedi dod i ben.
signin-recovery-phone-invalid-code-error-link = Defnyddio codau dilysu wrth gefn yn lle hynny?
# "Limits" refers to potential restrictions on how often a recovery phone number can be used for signing in within a given time period.
# If limits are reached, users may have to use an alternate two-step authentication method or wait until the restriction period is over.
signin-recovery-phone-success-message = Wedi mewngofnodi yn llwyddiannus. Gall terfynau fod yn berthnasol os byddwch yn defnyddio'ch ffôn adfer eto.

## Signin reported page: this page is shown when a user receives an email notifying them of a new account signin, and the user clicks a button indicating that the signin was not them so that we know it was someone trying to break into their account.

signin-reported-header = Diolch am eich gwyliadwriaeth
signin-reported-message = Mae ein tîm wedi eu hysbysu. Mae adroddiadau fel hyn y ein cynorthwyo i gadw ymyrraeth allanol draw.

## SigninTokenCode page
## Users see this page during the signin process. In this instance, the confirmation code is
## a 6-digit code that is sent to the user's email address.

# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "for your { -product-mozilla-account }"
# can stand alone as "{ -product-mozilla-account }"
signin-token-code-heading-2 = Rhowch y cod cadarnhau <span> ar gyfer eich cyfrif { -product-mozilla-account }</span>
# { $email } represents the email that the user entered to sign in
signin-token-code-instruction-v2 = Rhowch y cod anfonwyd at <email>{ $email }</email> o fewn 5 munud.
signin-token-code-input-label-v2 = Rhowch y cod 6 digid
# Form button to confirm if the confirmation code entered by the user is valid
signin-token-code-confirm-button = Cadarnhau
signin-token-code-code-expired = Cod wedi dod i ben?
# Link to resend a new code to the user's email.
signin-token-code-resend-code-link = E-bostiwch cod newydd.
# Error displayed in a tooltip when the form is submitted without a code
signin-token-code-required-error = Mae angen codi dilys
signin-token-code-resend-error = Aeth rhywbeth o'i le. Nid oedd modd anfon cod newydd.
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-token-code-instruction-desktop-relay = Bydd { -brand-firefox } yn ceisio eich anfon yn ôl i ddefnyddio e-bost arallenw ar ôl i chi fewngofnodi.

## SigninTOTPCode page
## TOTP (time-based one-time password) is a form of two-factor authentication (2FA).
## Users that have set up two-factor authentication land on this page during sign-in.

signin-totp-code-header = Mewngofnodi
signin-totp-code-subheader-v2 = Rhowch god dilysu dau gam
signin-totp-code-instruction-v4 = Gwiriwch eich <strong>ap dilysu</strong> i gadarnhau eich mewngofnodi.
signin-totp-code-input-label-v4 = Rhowch y cod 6 digid
# Shown to users when they need to re-enter their authentication code, for their current device
signin-totp-code-aal-banner-header = Pam mae angen i chi ddilysu?
signin-totp-code-aal-banner-content = Rydych chi wedi gosod dilysiad dau gam ar eich cyfrif, ond heb fewngofnodi gyda chod ar y ddyfais hon eto.
signin-totp-code-aal-sign-out = Allgofnodwch ar y ddyfais hon
signin-totp-code-aal-sign-out-error = Ymddiheuriadau, bu anhawster wrth i chi allgofnodi.
# Form button to confirm if the authentication code entered by the user is valid
signin-totp-code-confirm-button = Cadarnhau
signin-totp-code-other-account-link = Defnyddiwch gyfrif gwahanol
signin-totp-code-recovery-code-link = Trafferth cyflwyno cod?
# Error displayed in a tooltip when the form is submitted without a code
signin-totp-code-required-error = Mae angen cod dilysu
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-totp-code-desktop-relay = Bydd { -brand-firefox } yn ceisio eich anfon yn ôl i ddefnyddio e-bost arallenw ar ôl i chi fewngofnodi.

## Signin Unblock Page
## Page shown when signin has been blocked by rate limiting (too many requests)

signin-unblock-header = Awdurdodi'r mewngofnod hwn
# Where $email is the email address entered for the sign-in attempt
signin-unblock-body = Gwiriwch eich e-bost am y cod awdurdodi anfonwyd at { $email }.
signin-unblock-code-input = Rhowch y cod awdurdodi
signin-unblock-submit-button = Parhau
# Shown when the user attempts to submit the form without including a code
signin-unblock-code-required-error = Mae angen cod awdurdodi
signin-unblock-code-incorrect-length = Rhaid i'r cod awdurdodi gynnwys 8 nod
signin-unblock-code-incorrect-format-2 = Dim ond llythrennau a/neu rifau y gall cod awdurdodi eu cynnwys
signin-unblock-resend-code-button = Ddim yn y blwch derbyn na'r sbam? Ail-anfon
signin-unblock-support-link = Pam mae hyn yn digwydd?
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-unblock-desktop-relay = Bydd { -brand-firefox } yn ceisio eich anfon yn ôl i ddefnyddio e-bost arallenw ar ôl i chi fewngofnodi.

## ConfirmSignupCode page
## Users see this page after they have initiated account sign up,


# and a confirmation code has been sent to their email address.

# Page title show in browser title bar or page tab
confirm-signup-code-page-title = Rhowch y cod dilysu
# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "for your { -product-mozilla-account }"
# can stand alone as "{ -product-mozilla-account }"
confirm-signup-code-heading-2 = Rhowch god cadarnhau <span>ar gyfer eich cyfrif { -product-mozilla-account }</span>
# { $email } represents the email that the user entered to sign in
confirm-signup-code-instruction-v2 = Rhowch y cod anfonwyd at <email>{ $email }</email> o fewn 5 munud.
confirm-signup-code-input-label = Rhowch y cod 6 digid
# Form button to confirm if the confirmation code entered by the user is valid
confirm-signup-code-confirm-button = Cadarnhau
confirm-signup-code-sync-button = Cychwyn cydweddu
confirm-signup-code-code-expired = Cod wedi dod i ben?
# Link to resend a new code to the user's email.
confirm-signup-code-resend-code-link = E-bostiwch god newydd.
confirm-signup-code-success-alert = Cyfrif wedi'i gadarnhau'n llwyddiannus
# Error displayed in tooltip.
confirm-signup-code-is-required-error = Mae angen cod cadarnhad
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
confirm-signup-code-desktop-relay = Bydd { -brand-firefox } yn ceisio eich anfon yn ôl i ddefnyddio e-bost arallenw ar ôl i chi fewngofnodi.

## Account Signup page
## This is the second page of the sign up flow, users have already entered their email

signup-heading-v2 = Crëwch gyfrinair
signup-relay-info = Mae angen cyfrinair i reoli'ch e-byst ag arallenw yn ddiogel a chael mynediad at offer diogelwch { -brand-mozilla }.
signup-sync-info = Cydweddwch eich cyfrineiriau a nodau tudalen a rhagor ym mhob man rydych yn defnyddio { -brand-firefox }.
signup-sync-info-with-payment = Cydweddwch eich cyfrineiriau, dulliau talu a nodau tudalen, a rhagor ym mhob man rydych yn defnyddio { -brand-firefox }.
# Clicking on this link returns the user to the beginning of the flow so they can enter a new email address
signup-change-email-link = Newid e-bost

## SignupConfirmedSync page
## Shown to users when they finish confirming their account through Sync

signup-confirmed-sync-header = Mae cydweddu wedi'i droi ymlaen
signup-confirmed-sync-success-banner = Cyfrif { -product-mozilla-account } wedi'i gadarnhau
signup-confirmed-sync-button = Cychwyn pori
# Shown when payment methods are also synced
signup-confirmed-sync-description-with-payment-v2 = Gall eich cyfrineiriau, dulliau talu, cyfeiriadau, nodau tudalen, hanes, a mwy gydweddu ym mhobman y byddwch yn defnyddio { -brand-firefox }.
signup-confirmed-sync-description-v2 = Gall eich cyfrineiriau, cyfeiriadau, nodau tudalen, hanes, a mwy gydweddu ym mhobman y byddwch yn defnyddio { -brand-firefox }.
signup-confirmed-sync-add-device-link = Ychwanegu dyfais arall
signup-confirmed-sync-manage-sync-button = Rheoli cydweddu
signup-confirmed-sync-set-password-success-banner = Cyfrinair cydweddu wedi'i greu
