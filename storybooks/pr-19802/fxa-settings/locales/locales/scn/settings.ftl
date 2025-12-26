# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.


## Banner component

resend-code-success-banner-heading = Mannammu un còdici novu ô to nnirizzu di posta elittrònica.
resend-link-success-banner-heading = Mannammu na lijami nova ô to nnirizzu di posta elittrònica.
# $accountsEmail is the Mozilla accounts sender email address (e.g. accounts@firefox.com)
resend-success-banner-description = Junci { $accountsEmail } ê to cuntatti pi nun aviri prubblemi câ cunzigna.

## Brand Messaging component
## Used to show in product messaging about upcoming brand changes

# This aria-label applies to the dismiss/close button of the banner
# This text is for screen-readers
brand-banner-dismiss-button-2 =
    .aria-label = Chiuji bannera
# This message is displayed as the title element in the banner, prior to actually launching the new brand
brand-prelaunch-title = I { -product-firefox-accounts } addivèntanu { -product-mozilla-accounts } dû 1ᵘ di nuvèmmiru
# This message is displayed as sub title element in the banner, giving a it more context about the brand changes.
brand-prelaunch-subtitle = Trasi sempri cû stissu nomu utenti e a stissa chiavi, e nun cc’è nuḍḍu autru canciamentu nnî prudutti chi usi.
# This message is displayed as title element in the banner, after the brand changes take affect letting the user know that
# no action is required on their part
brand-postlaunch-title = Canciamu u nomu dî { -product-firefox-accounts } a { -product-mozilla-accounts }. Trasi sempri cû stissu nomu utenti e a stissa chiavi, e nun cc’è nuḍḍu autru canciamentu nnî prudutti chi usi.
# This is an extra link element, that directs users to a page where they can learn more about the branding changes.
brand-learn-more = Cchiù nfurmazzioni
# Alt text for close banner image
brand-close-banner =
    .alt = Chiuji bannera
# Alt text for 'm' logo in banner header
brand-m-logo =
    .alt = Mercu di { -brand-mozilla } m

## ButtonBack component
## Allows users to click a back arrow to navigate to the previous page

button-back-aria-label = Nn’arrè
button-back-title = Nn’arrè

## ButtonDownloadRecoveryKeyPDF
## Clicking on this button downloads a PDF file that contains the user's account recovery key
## The account recovery key can be used to recover data when users forget their account password

# Button to download the account recovery key as a PDF file and navigate to the next step
# The next (and final) step is an optional prompt to save a storage hint
# .title will displayed as a tooltip on the button
recovery-key-download-button-v3 = Scàrrica e cuntinua
    .title = Scàrrica e cuntinua
recovery-key-pdf-heading = Chiavi di ricùpiru dû cuntu
# Date when the account recovery key was created and this file was downloaded
# { $date }: formatted date with 'medium' dateStyle format (e.g., for 'en': Jul 31, 2023)
recovery-key-pdf-download-date = Ginirata: { $date }
# Shown directly above recovery key value and preceeded by a key icon
recovery-key-pdf-key-legend = Chiavi di ricùpiru dû cuntu
# Instructions in the text file to prompt the user to keep this information in a secure, easy to remember location.
# Password resets without this account recovery key can result in data loss.
# "key" here refers to "account recovery key"
recovery-key-pdf-instructions = Sta chiavi ti pirmetti di ricupigghiari i dati crittati dû navicaturi (chiavi, nzingalibbra e crunuluggìa) si ti scordi a chiavi dû cuntu. Sàrbala nnôn postu chi t’arricordi.
# This heading is shown above a list of options for storing the account recovery key
# "key" here refers to "account recovery key"
recovery-key-pdf-storage-ideas-heading = Unni sarbari sta chiavi
# Followed by a link (https://mzl.la/3bNrM1I) to get more information and support
recovery-key-pdf-support = Cchiù nfurmazzioni ncapu a chiavi di ricùpiru dû cuntu
# Error message displayed in an alert bar if the PDF download failed.
recovery-key-pdf-download-error = Ni dispiaci, cci fu un prubblema nnô scarricamentu dâ to chiavi di ricùpiru dû cuntu.

## ChooseNewsletters component
## Checklist of newsletters that the user can choose to sign up to

# Prompt above a checklist of newsletters
choose-newsletters-prompt-2 = Ricivi cchiù assai di { -brand-mozilla }:
# Newsletter checklist item
choose-newsletters-option-latest-news =
    .label = Ricivi l’ùrtimi nutizzi e attualizzi ncapu ê prudutti
# Newsletter checklist item
choose-newsletters-option-test-pilot =
    .label = Accessu ’n antiprima pi pruvari i prudutti novi
# Newsletter checklist item. This for a Mozilla Foundation newsletters,
# "Action alerts" can be interpreted as "Calls to action"
choose-newsletters-option-reclaim-the-internet =
    .label = Abbisi di azzioni pi pigghiàriti arrè u cuntrollu dâ riti

## Tooltip notifications for actions performed on account recovery keys or one-time use codes

datablock-download =
    .message = Scarricatu
datablock-copy =
    .message = Cupiatu
datablock-print =
    .message = Stampatu

##

# Tooltip notification when an account recovery key or one-time use code is copied.
datablock-inline-copy =
    .message = Cupiatu

## DeviceInfoBlock component
## The strings here are used to display information about the origin of activity happening on a user's account
## For example, when connecting another device to the user's account

# Variables { $city }, { $region }, { $country } represent the estimated location of the user's device
# For example, 'Vancouver, British Columbia, Canada (estimated)'
device-info-block-location-city-region-country = { $city }, { $region }, { $country } (stimatu)
# Variables { $region }, { $country } represent the estimated location of the user's device
# For example, 'British Columbia, Canada (estimated)'
device-info-block-location-region-country = { $region }, { $country } (stimatu)
# Variables { $city }, { $country } represent the estimated location of the user's device
# For example, 'Vancouver, Canada (estimated)'
device-info-block-location-city-country = { $city }, { $country } (stimatu)
# Variable { $country } represent the estimated location of the user's device
# For example, 'Canada (estimated)'
device-info-block-location-country = { $country } (stimatu)
# When an approximate location for the user's device could not be determined
device-info-block-location-unknown = Pusizzioni scanusciuta
# Variable { $browserName } is the browser that created the request (e.g., Firefox)
# Variable { $genericOSName } is the name of the operating system that created the request (e.g., MacOS, Windows, iOS)
device-info-browser-os = { $browserName } di { $genericOSName }
# Variable { $ipAddress } represents the IP address where the request originated
# The IP address is a string of numbers separated by periods (e.g., 192.158.1.38)
device-info-ip-address = Nnirizzu IP: { $ipAddress }

## FormPasswordInlineCriteria

form-password-with-inline-criteria-signup-new-password-label =
    .label = Chiavi
form-password-with-inline-criteria-signup-confirm-password-label =
    .label = Ripeti a chiavi
form-password-with-inline-criteria-signup-submit-button = Crìa un cuntu
form-password-with-inline-criteria-reset-new-password =
    .label = Chiavi nova
form-password-with-inline-criteria-confirm-password =
    .label = Cunferma a chiavi
form-password-with-inline-criteria-reset-submit-button = Crìa na chiavi nova
form-password-with-inline-criteria-match-error = I chiavi chi mittisti nun appàttanu
form-password-with-inline-criteria-sr-too-short-message = A chiavi àv’a èssiri di armenu 8 caràttari.
form-password-with-inline-criteria-sr-not-email-message = Nnâ chiavi nun cci àv’a èssiri u to nnirizzu di posta elittrònica.
form-password-with-inline-criteria-sr-not-common-message = A chiavi nun àv’a èssiri una di chiḍḍi usati cumuni.
form-password-with-inline-criteria-sr-requirements-met = A chiavi chi mittisti rispetta tutti i riquisiti pî chiavi.
form-password-with-inline-criteria-sr-passwords-match = I chiavi chi mittisti appàttanu.

## FormVerifyCode

# Fallback default localized error message for empty input field
form-verify-code-default-error = Campu ubbligatoriu

## FormVerifyTotp component
## Form to enter a time-based one-time-passcode (e.g., 6-digit numeric code or 8-digit alphanumeric code)

# Information explaining why button is disabled, also read to screen readers
# Submit button is disabled unless a valid code format is entered
# Used when the code may only contain numbers
# $codeLength : number of digits in a valid code
form-verify-totp-disabled-button-title-numeric = Metti u còdici di { $codeLength } cifri pi cuntinuari
# Information explaining why button is disabled, also read to screen readers
# Submit button is disabled unless a valid code format is entered
# Used when the code may contain numbers and/or letters
# $codeLength : number of characters in a valid code
form-verify-totp-disabled-button-title-alphanumeric = Metti u còdici di { $codeLength } caràttari pi cuntinuari

# GetDataTrio component, part of Account Recovery Key flow

get-data-trio-title-firefox = { -brand-firefox }
get-data-trio-title-firefox-recovery-key = Chiavi di ricùpiru dû cuntu { -brand-firefox }
get-data-trio-title-backup-verification-codes = Còdici d’autinticazzioni di sicurizza
get-data-trio-download-2 =
    .title = Scàrrica
    .aria-label = Scàrrica
get-data-trio-copy-2 =
    .title = Copia
    .aria-label = Copia
get-data-trio-print-2 =
    .title = Stampa
    .aria-label = Stampa

## Images - these are all aria labels used for illustrations
## Aria labels are used as alternate text that can be read aloud by screen readers.

# Aria-label option for an alert symbol
alert-icon-aria-label =
    .aria-label = Abbisu
# Aria-label option for an alert symbol
icon-attention-aria-label =
    .aria-label = Accura
# Aria-label option for an alert symbol
icon-warning-aria-label =
    .aria-label = Accura
authenticator-app-aria-label =
    .aria-label = App d’autinticazzioni
backup-codes-icon-aria-label-v2 =
    .aria-label = Còdici d’autinticazzioni di sicurizza abbilitati
backup-codes-disabled-icon-aria-label-v2 =
    .aria-label = Còdici d’autinticazzioni di sicurizza sdisabbilitati
# An icon of phone with text message. A back recovery phone number
backup-recovery-sms-icon-aria-label =
    .aria-label = SMS di ricùpiru abbilitatu
# Disabled version of backup-recovery-sms-icon-aria-label
backup-recovery-sms-disabled-icon-aria-label =
    .aria-label = SMS di ricùpiru sdisabbilitatu
# Used to select Canada as country code for phone number
canadian-flag-icon-aria-label =
    .aria-label = Bannera dû Cànada
# Used to  indicate a general checkmark, as in something checked off in a list!
checkmark-icon-aria-label =
    .aria-label = Cuntrolla
# Used to  indicate a check mark for a successful state/action
checkmark-success-icon-aria-label =
    .aria-label = Fattu
# Used to indicate a check mark for an enabled state/option
checkmark-enabled-icon-aria-label =
    .aria-label = Abbilitata
# Used on X icon to dismiss a message such as an alert or banner
close-icon-aria-label =
    .aria-label = Chiuji missaggiu
# Used to decorate a code you enter for verification purposes
code-icon-aria-label =
    .aria-label = Còdici
error-icon-aria-label =
    .aria-label = Erruri
# Used as information icon for informative messaging
info-icon-aria-label =
    .aria-label = Nfurmazzioni
# Used to select United States as a country code for phone number
usa-flag-icon-aria-label =
    .aria-label = Bannera dî Stati Junciuti dâ Mèrica

## Images - these are all aria labels used for illustrations
## Aria labels are used as alternate text that can be read aloud by screen readers.

hearts-broken-image-aria-label =
    .aria-label = Un computer e un tilèfunu e na mmàggini d’un cori ciaccatu ncapu a iḍḍi
hearts-verified-image-aria-label =
    .aria-label = Un computer e un tilèfunu e na tavuliḍḍa c’un cori chi batti ncapu a iḍḍi
signin-recovery-code-image-description =
    .aria-label = Ducumentu chi àvi testu ammucciatu
signin-totp-code-image-label =
    .aria-label = Un dispusitivu c’un còdici a 6 cifri ammucciatu
confirm-signup-aria-label =
    .aria-label = Na busta cu na lijami
# Used for an image of a key on a shield surrounded by 5 other icons representing information that can be recovered with the account recovery key.
# Other icons and their meaning: Gear (settings), star (favorites), clock (history), magnifying glass (search) and lock (passwords).
security-shield-aria-label =
    .aria-label = Mmàggini chi riprisenta na chiavi di ricùpiru dû cuntu.
# Used for an image of a single key.
recovery-key-image-aria-label =
    .aria-label = Mmàggini chi riprisenta na chiavi di ricùpiru dû cuntu.
password-image-aria-label =
    .aria-label = Mmàggini chi riprisenta u nzirimentu di na chiavi.
lightbulb-aria-label =
    .aria-label = Mmàggini chi riprisenta a criazzioni d’un suggirimentu pi l’archiviu.
email-code-image-aria-label =
    .aria-label = Mmàggini chi riprisenta n’email chi àvi un còdici.
recovery-phone-image-description =
    .aria-label = Dispusitivu mòbbili chi ricivi un còdici pi SMS.
recovery-phone-code-image-description =
    .aria-label = Còdici ricivutu d’un dispusitivu mòbbili.
backup-recovery-phone-image-aria-label =
    .aria-label = Dispusitivu mòbbili chi po mannari SMS
backup-authentication-codes-image-aria-label =
    .aria-label = Schirmu dû dispusitivu cu còdici
sync-clouds-image-aria-label =
    .aria-label = Nèvuli cu na cona di sincrunizzazzioni

## InlineRecoveryKeySetupCreate component
## Users see this view when we prompt them to generate an account recovery key
## after signing in.

inline-recovery-key-setup-signed-in-firefox-2 = Trasisti nne { -brand-firefox }.
inline-recovery-key-setup-create-header = Pruteggi u to cuntu
# This is a subheader asking users to create an account recovery key, indicating it will only take a moment to complete.
inline-recovery-key-setup-create-subheader = Ài un minutu pi prutèggiri i to dati?
inline-recovery-key-setup-info = Crìa na chiavi di ricùpiru dû cuntu accussì po’ ricupigghiari i dati sincrunizzati dû navicaturi si ti scordi a chiavi.
inline-recovery-key-setup-start-button = Crìa na chiavi di ricùpiru dû cuntu
inline-recovery-key-setup-later-button = Cchiù tardu

## Input Password

# Tooltip displayed on a password input visibility toggle. Expresses the toggle action, where clicking on the toggle will hide the password.
input-password-hide = Ammuccia chiavi
# Tooltip displayed on a password input visibility toggle. Expresses the toggle action, where clicking on the toggle will show the password.
input-password-show = Mustra chiavi
# Message read by screen readers when focus is on a password input visibility toggle. Expresses current (visible) state of the textbox content.
input-password-hide-aria-2 = A to chiavi è visìbbili nnô schirmu.
# Message read by screen readers when focus is on a password input visibility toggle. Expresses current (hidden) state of the textbox content.
input-password-show-aria-2 = A to chiavi è ammucciata.
# Message read by screen readers after clicking on a password input visibility toggle to show the password. Expresses the new (visible) state of the textbox content.
input-password-sr-only-now-visible = A to chiavi è visìbbili nnô schirmu.
# Message read by screen readers after clicking on a password input visibility toggle to hide the password. Expresses the new (hidden) state of the textbox content.
input-password-sr-only-now-hidden = A to chiavi è ammucciata.

## Phone number component

# This is an aria-label available to screen readers for a selection list that includes country flags, country name and country code
input-phone-number-country-list-aria-label = Scarta u pajisi
input-phone-number-enter-number = Metti u nùmmaru di tilèfunu
input-phone-number-country-united-states = Stati Junciuti
input-phone-number-country-canada = Cànada
# Back button on legal/terms or legal/privacy that takes users to the previous page
legal-back-button = Nn’arrè

## LinkDamaged component

# The user followed a password reset link that was received by email
# but the link is damaged (for example mistyped or broken by the email client)
reset-pwd-link-damaged-header = A lijami pi risittari a chiavi è rutta
# The user followed a link to signin that was received by email
# but the link was damaged (for example mistyped or broken by the email client).
signin-link-damaged-header = A lijami di cunferma è rutta
# The user followed a link to report an invalid signin attempt that was received by email
# but the link was damaged (for example mistyped or broken by the email client).
report-signin-link-damaged-header = Lijami rutta
# The user followed a link received by email, but the link was damaged.
reset-pwd-link-damaged-message = Â lijami chi ammaccasti ci ammancàvanu caràttari, e capaci chi fu rumputa dû to prugramma di posta elittròncia. Copia u nnirizzu stannu accura, e torna a prova.

## LinkExpired component

# Button to request a new link if the previous link that was emailed to the user is expired
link-expired-new-link-button = Ricivi na lijami nova

## LinkRememberPassword component

# immediately before remember-password-signin-link
remember-password-text = Ti ricordi a to chiavi?
# link navigates to the sign in page
remember-password-signin-link = Trasi

## LinkUsed component

# The user followed a primary email confirmation link, but that link is has been used and is no longer valid
primary-email-confirmation-link-reused = U nnirizzu di posta elittrònica primariu già fu cunfirmatu
# The user followed a sign-in confirmation link, but that link has been used and is no longer valid
signin-confirmation-link-reused = A trasuta già fu cunfirmata
confirmation-link-reused-message = Sta lijami di cunferma fu già usata, e po èssiri usata na vota sula.

## Locale Toggle Component

# Users will see this heading when the URL or network request is malformed, e.g. a query parameter is required and is invalid
error-bad-request = Dumanna nun vàlita

## PasswordInfoBalloon
## Balloon displayed next to password input field

password-info-balloon-why-password-info = Ti serbi sta chiavi pi accèdiri a tutti i dati crittati chi sarbi cu nuiautri.
password-info-balloon-reset-risk-info = Risittari u cuntu veni a diri chi putissi pèrdiri dati a tipu chiavi e nzingalibbra.

## PasswordStrengthInline component
## These strings are conditions that need to be met to qualify as a strong password

password-strength-inline-min-length = Armenu 8 caràttari
password-strength-inline-not-email = Nun cci àv’a èssiri u to nnirizzu di posta elittrònica
password-strength-inline-not-common = Nun àv’a èssiri na chiavi cumuni
password-strength-inline-confirmed-must-match = A cunferma appatta câ chiavi nova

## Notification Promo Banner component

account-recovery-notification-cta = Crìa
account-recovery-notification-header-value = Nun pèrdiri i to dati si ti scordi a chiavi
account-recovery-notification-header-description = Crìa na chiavi di ricùpiru dû cuntu pi ricupigghiari i dati sincrunizzati dû navicaturi si ti scordi a chiavi.
recovery-phone-promo-cta = Junci u nùmmaru di tilèfunu di ricùpiru
recovery-phone-promo-heading = Junci na prutizzioni superchiu ô to cuntu c’un nùmmaru di tilèfunu di ricùpiru
recovery-phone-promo-description = Ora po’ tràsiri c’un missaggiu SMS cu na chiavi a usu sìngulu si nun po’ usari l’applicazzioni pi l’autinticazzioni a du’ fattura.
recovery-phone-promo-info-link = Autri nfurmazzioni ncapu ô ricùpiru e u rìsicu dû scanciu di SIM
promo-banner-dismiss-button =
    .aria-label = Chiuji a bannera

## Ready component

ready-complete-set-up-instruction = Cumpleta a cunfijurazzioni mittennu a to chiavi nova nni l’autri dispusitivi { -brand-firefox }.
manage-your-account-button = Manija u to cuntu
# This is a string that tells the user they can use whatever service prompted them to reset their password or to verify their email
# Variables:
# { $serviceName } represents a product name (e.g., Mozilla VPN) that will be passed in as a variable
ready-use-service = Ora po’ usari { $serviceName }
# The user successfully accomplished a task (password reset, confirm email) that lets them use their account
ready-use-service-default = Ora po’ usari i mpustazzioni dû cuntu
# Message shown when the account is ready but the user is not signed in
ready-account-ready = U to cuntu è lestu!
ready-continue = Cuntinua
sign-in-complete-header = Trasuta cunfirmata
sign-up-complete-header = Cuntu cunfirmatu
primary-email-verified-header = Nnirizzu di posta elittrònica primariu cunfirmatu

## Users see this view when they are generating a new account recovery key
## This screen displays the generated key and allows users to download or copy the key

# This heading is shown above a list of options for storing the account recovery key
# "key" here refers to "account recovery key"
flow-recovery-key-download-storage-ideas-heading-v2 = Unni sarbari a to chiavi:
flow-recovery-key-download-storage-ideas-folder-v2 = Carpetta nnôn dispusitivu sicuru
flow-recovery-key-download-storage-ideas-cloud = Spazziu affidàbbili nnâ nèvula
flow-recovery-key-download-storage-ideas-print-v2 = Copia fìsica stampata
flow-recovery-key-download-storage-ideas-pwd-manager = Manijaturi di chiavi

## RecoveryKeySetupHint
## This is the final step in the account recovery key creation flow after a Sync signin or in account settings
## Prompts the user to save an (optional) storage hint about the location of their account recovery key.

# The header of the last step in the account recovery key creation flow
# "key" here refers to the "account recovery key"
flow-recovery-key-hint-header-v2 = Junci un suggirimentu p’arricurdàriti a chiavi
# This message explains why saving a storage hint can be helpful. The account recovery key could be "stored" in a physical (e.g., printed) or virtual location (e.g., in a device folder or in the cloud).
# "it" here refers to the storage hint, NOT the "account recovery key"
flow-recovery-key-hint-message-v3 = Stu suggirimentu t’avissi a ’jutari unni sarbasti a to chiavi di ricùpiru dû cuntu. Tû putemu mustrari mentri chi risetti a chiavi pi ricupigghiari i to dati.
# The label for the text input where the user types in the storage hint they want to save.
# The storage hint is optional, and users can leave this blank.
flow-recovery-key-hint-input-v2 =
    .label = Metti un suggirimentu (upziunali)
# The text of the "submit" button. Clicking on this button will save the hint (if provided) and exit the account recovery key creation flow.
# "Finish" refers to "Finish the account recovery key creation process"
flow-recovery-key-hint-cta-text = Cumpleta
# Error displayed in a tooltip if the hint entered by the user exceeds the character limit.
# "Hint" refers to "storage hint"
flow-recovery-key-hint-char-limit-error = U suggirimentu àv’a èssiri cchiù curtu di 255 caràttari.
# Error displayed in a tooltip if the user included unsafe unicode characters in their hint.
# "Hint" refers to "storage hint"
flow-recovery-key-hint-unsafe-char-error = U suggirimentu nun po’ aviri caràttari Unicode nun sicuri. Sunnu pirmisi sulu littri, nùmmari, signi di puntijatura e sìmmuli.

## ResetPasswordWarning component
## Warning shown to sync users that reset their password without using an account recovery key

password-reset-warning-icon = Accura
password-reset-chevron-expanded = Chiuji abbisu
password-reset-chevron-collapsed = Allarga abbisu
password-reset-data-may-not-be-recovered = Putissi èssiri ca nun si ponnu ricupigghiari i dati dû navicaturi
password-reset-previously-signed-in-device-2 = Ài autri dispusitivi unni già trasisti?
password-reset-data-may-be-saved-locally-2 = Capaci ca i dati dû navicaturi sunnu sarbati nna ḍḍu dispusitivu. Risetta a to chiavi e trasi ḍḍocu pi ricupigghiari e sincrunizzari i to dati.
password-reset-no-old-device-2 = Ài un dispusitivu novu ma nun ài accessu a nuḍḍu di l’autri to dispusitivi?
password-reset-encrypted-data-cannot-be-recovered-2 = Ni dispiaci, ma nun è pussìbbili ricupigghiari i dati crittati dû to navicaturi dî sirbura { -brand-firefox }.
password-reset-warning-have-key = Ài na chiavi di ricùpiru dû cuntu?
password-reset-warning-use-key-link = Ùsala pi risittari a to chiavi e sarbari i to dati

## Alert Bar

alert-bar-close-message = Chiuji missaggiu

## User's avatar

avatar-your-avatar =
    .alt = U to àvatar
avatar-default-avatar =
    .alt = Àvatar pridifinutu

##


# BentoMenu component

bento-menu-title-3 = Prudutti { -brand-mozilla }
bento-menu-tagline = Autri prudutti { -brand-mozilla } chi prutègginu a to privatizza
bento-menu-vpn-2 = { -product-mozilla-vpn }
bento-menu-monitor-3 = { -product-mozilla-monitor }
bento-menu-firefox-relay-2 = { -product-firefox-relay }
bento-menu-firefox-desktop = { -brand-firefox } pû Scagnu
bento-menu-firefox-mobile = { -brand-firefox } pû Tilèfunu
bento-menu-made-by-mozilla = Fattu di { -brand-mozilla }

## Connect another device promo

connect-another-fx-mobile = Pìgghiari { -brand-firefox } nnô tilèfunu o nnâ tavuliḍḍa
connect-another-find-fx-mobile-2 = Riscedi a { -brand-firefox } nne { -google-play } e { -app-store }.

## Connected services section

cs-heading = Sirbizza cunnessi
cs-description = Tuttu chiḍḍu ca usi e unni trasisti.
cs-cannot-refresh = Ni dispiaci, cci fu un prubblema mentri chi carricava a lista dî sirbizza cunnessi.
cs-cannot-disconnect = Nun attruvai u client, nun u pozzu scullijari
# This string is used in a notification message near the top of the page.
# Variables:
#   $service (String) - the name of a device or service that uses Mozilla accounts
#                       (for example: "Firefox Lockwise")
cs-logged-out-2 = Niscisti di { $service }
cs-refresh-button =
    .title = Attualizza i sirbizza cullijati
# Link text to a support page on missing or duplicate devices
cs-missing-device-help = Elimenti duppi o chi ammàncanu?
cs-disconnect-sync-heading = Scullèjati di Sync

## This string is used in a modal dialog when the user starts the disconnect from
## Sync process.
## Variables:
##   $device (String) - the name of a device using Mozilla accounts
##                      (for example: "Firefox Nightly on Google Pixel 4a")

cs-disconnect-sync-content-3 = I to dati di navicazzioni arrèstanu nnô dispusitivu <span>{ $device }</span>, ma nun sunnu cchiù sincrunizzati cû to cuntu.
cs-disconnect-sync-reason-3 = Picchì stai scullijannu <span>{ $device }</span>?

## The following are the options for selecting a reason for disconnecting the
## device

cs-disconnect-sync-opt-prefix = U dispusitivu è:
cs-disconnect-sync-opt-suspicious = Suspettu
cs-disconnect-sync-opt-lost = Persu o arrubbatu
cs-disconnect-sync-opt-old = Vecchiu o canciatu
cs-disconnect-sync-opt-duplicate = Duppricatu
cs-disconnect-sync-opt-not-say = Nun u vogghiu diri

##

cs-disconnect-advice-confirm = D’accordu
cs-disconnect-lost-advice-heading = U dispusitivu persu o arrubbatu fu scullijatu
cs-disconnect-lost-advice-content-3 = Siccomu pirdisti u to dispusitivu, o ti fu arrubbatu, ti cunzigghiamu di canciari a chiavi dû to { -product-mozilla-account } nnê mpustazzioni dû cuntu. Avissi a fari macari na risciduta cû prudutturi dû to dispusitivu ncapu a comu scancillari i to dati di rimotu.
cs-disconnect-suspicious-advice-heading = U dispusitivu suspettu fu scullijatu
cs-disconnect-suspicious-advice-content-2 = Si u dispusitivu scullijatu è veru suspettu, pi tèniri i tu nfurmazzioni ô sicuru avissi a canciari a chiavi dû { -product-mozilla-account } nnê mpustazzioni dû cuntu. Avissi a canciari macari l’autri chiavi chi avìi sarbati nne { -brand-firefox } scrivennu about:logins nnâ barra dî nnirizzi.
cs-sign-out-button = Nesci

## Data collection section

dc-heading = Ricugghiuta e usu dî dati
dc-subheader-moz-accounts = { -product-mozilla-accounts(capitalization: "uppercase") }
dc-subheader-ff-browser = Navicaturi { -brand-firefox }
dc-subheader-content-2 = Pirmèttici ê { -product-mozilla-accounts } di mannàrici a { -brand-mozilla } i dati tècnici e di ntirazzioni.
dc-subheader-ff-content = Pi virificari o attualizzari i paràmitri tècnici e i mpustazzioni dî dati di ntirazzioni di { -brand-firefox }, grapi i mpustazzioni di { -brand-firefox } e vai nne Privatizza e Sicurizza.
dc-opt-out-success-2 = Sdisattivatu. { -product-mozilla-accounts } nun manna cchiù dati tècnici o di ntirazzioni a { -brand-mozilla }.
dc-opt-in-success-2 = Grazzi! Spàrtiri sti dati n’ajuta a fari megghiu { -product-mozilla-accounts }.
dc-opt-in-out-error-2 = Ni dispiaci, cci fu un prubblema mentri chi canciava i to prifirenzi ncapu â ricota dî dati.
dc-learn-more = Cchiù nfurmazzioni

# DropDownAvatarMenu component

drop-down-menu-title-2 = Minù di { -product-mozilla-account }
# This is displayed in the Settings menu after user's click on their profile icon.
# Following this string on a new line will be their display name (user's name or email)
drop-down-menu-signed-in-as-v2 = Trasisti comu
drop-down-menu-sign-out = Nesci
drop-down-menu-sign-out-error-2 = Ni dispiaci, mmattìu un prubblema mentri chi ti scullijavi

## Flow Container

flow-container-back = Nn’arrè

## FlowRecoveryKeyConfirmPwd - Second view in the PageRecoveryKeyCreate flow
## Users see this view when they are generating a new account recovery key
## This screen asks the user to confirm their password before generating a new key

flow-recovery-key-confirm-pwd-heading-v2 = Torna a metti a to chiavi pi sicurizza
flow-recovery-key-confirm-pwd-input-label = Metti a to chiavi
# Clicking on this button will check the password and create an account recovery key
flow-recovery-key-confirm-pwd-submit-button = Crìa na chiavi di ricùpiru dû cuntu
# For users with an existing account recovery key, clicking on this button will
# check the password, delete the existing key and create a new account recovery key
flow-recovery-key-confirm-pwd-submit-button-change-key = Crìa na chiavi di ricùpiru dû cuntu nova

## FlowRecoveryKeyDownload - Third view in the PageRecoveryKeyCreate flow
## Users see this view when they are generating a new account recovery key
## This screen displays the generated key and allows users to download or copy the key

flow-recovery-key-download-heading-v2 = Criasti na chiavi di ricùpiru dû cuntu — scàrricala e sàrbala sùbbitu
# The "key" here refers to the term "account recovery key"
flow-recovery-key-download-info-v2 = Sta chiavi ti pirmetti di ricupigghiari i to dati si ti scordi a chiavi. Scàrricala ora e sàrbala unni t’arricordi — nun è pussìbbili turnari arrè a sta pàggina doppu.
# This link allows user to proceed to the next step without clicking the download button
flow-recovery-key-download-next-link-v2 = Cuntinua senza scarricari

## FlowRecoveryKeyHint
## This is the fourth and final step in the account recovery key creation flow in account settings
## Prompts the user to save an (optional) storage hint about the location of their account recovery key.

# Success message displayed in alert bar after the user has finished creating an account recovery key.
flow-recovery-key-success-alert = Criasti na chiavi di ricùpiru dû cuntu

## FlowRecoveryKeyInfo - First view in the PageRecoveryKeyCreate flow

# The header of the first view in the Recovery Key Create flow
flow-recovery-key-info-header = Crìa na chiavi di ricùpiru dû cuntu siḍḍu ti scordi a chiavi
# The header of the first view in the Recovery Key Create flow when replacing an existing recovery key
flow-recovery-key-info-header-change-key = Cancia a to chiavi di ricùpiru dû cuntu
# In the first view of the PageRecoveryKeyCreate flow, this is the first of two bullet points explaining why the user should create an account recovery key
flow-recovery-key-info-shield-bullet-point-v2 = Crittamu i dati di navicazzioni –– chiavi, nzingalibbra e autri cosi. È assai bonu pâ privatizza, ma si ti scordi a chiavi perdi tutti i to dati.
# In the first view of the PageRecoveryKeyCreate flow, this is the second of two bullet points explaining why the user should create an account recovery key
flow-recovery-key-info-key-bullet-point-v2 = Chista è a scaciuni picchì criari na chiavi di ricùpiru dû cuntu è accussì mpurtanti –– a po’ usari pi ricupigghiari i to dati.
# The text of the "submit" button to start creating (or changing) an account recovery key
flow-recovery-key-info-cta-text-v3 = Accumincia
# Link to cancel account recovery key change and return to settings
flow-recovery-key-info-cancel-link = Sfai

## FlowSetup2faApp

flow-setup-2fa-qr-heading = Cullèjati all'app d'autinticazzioni
# DEV NOTE: "2a" in the id should be "2fa". This typo is kept intentionally to
# avoid losing existing translations; fix it when creating a new version of
# this string.
flow-setup-2a-qr-instruction = <strong>Passu 1:</strong> scanziuna stu còdici QR cu n'app d'autinticazzioni a qual'è-è, a tipu Duo o Google Authenticator.
# Alt text for the QR-code image shown during two-step authentication setup.
# “setup secret key” refers to the long code you can copy instead of scanning.
# Not to be confused with the 6-digit codes generated by the authenticator app.
flow-setup-2fa-qr-alt-text =
    .alt = Còdici QR pi cunfijurari l'autinticazzioni a du' fattura. Scanziùnalu, o scarta “Nun arrinesci a scanziunari u còdici QR?” pi ricìviri na chiavi sicrita pâ cunfijurazzioni.
flow-setup-2fa-cant-scan-qr-button = Nun arrinesci a scanziunari u còdici QR?
flow-setup-2fa-manual-key-heading = Metti u còdici a manu
flow-setup-2fa-manual-key-instruction = <strong>Passu 1:</strong> metti stu còdici nta l'app d'autinticazzioni chi prifirisci.
flow-setup-2fa-scan-qr-instead-button = Vo' scanziunari u còdici QR?
# links to https://support.mozilla.org/kb/secure-firefox-account-two-step-authentication#w_step-one
flow-setup-2fa-more-info-link = Cchiù nfurmazzioni ncapu a l'app d'autinticazzioni
flow-setup-2fa-button = Cuntinua
flow-setup-2fa-step-2-instruction = <strong>Passu 2:</strong> metti u còdici dâ to app d'autinticazzioni
flow-setup-2fa-input-label = Metti u còdici di 6 cifri

## The step to choose the two step authentication method in the two step
## authentication setup flow.

flow-setup-2fa-backup-choice-heading = Scarta un mètudu di ricùpiru
flow-setup-2fa-backup-choice-description = Chistu ti pirmetti di tràsiri si nun ài accessu ô to dispusitivu mòbbili o a l'app d'autinticazzioni.
flow-setup-2fa-backup-choice-phone-title = Nùmmaru di tilèfunu di ricùpiru
flow-setup-2fa-backup-choice-phone-badge = Cchiù fàcili
flow-setup-2fa-backup-choice-phone-info = Ricivi un còdici di ricùpiru c'un missaggiu di testu. Accamora è dispunibbili sulu nnê Stati Junciuti e nnô Cànada.
flow-setup-2fa-backup-choice-code-title = Còdici d’autinticazzioni di sicurizza
flow-setup-2fa-backup-choice-code-badge = Cchiù sicuru
flow-setup-2fa-backup-choice-code-info = Crìa e sarba còdici d'autinticazzioni chi po' usari na vota sula.
# This link points to https://support.mozilla.org/kb/secure-mozilla-account-two-step-authentication
flow-setup-2fa-backup-choice-learn-more-link = Nfurmazzioni ncapu ô ricùpiru e u rìsicu dû scanciu di SIM

## The backup code confirm step of the setup 2 factor authentication flow,
## where the user confirm that they have saved their backup authentication codes
## by entering one of them.

flow-setup-2fa-backup-code-confirm-heading = Metti u còdici d’autinticazzioni di sicurizza
# codes here refers to backup authentication codes
flow-setup-2fa-backup-code-confirm-confirm-saved = Cunferma chi sarbasti i to còdici mittènnunni unu. Senza di sti còdici, nun po’ tràsiri nnô to cuntu senza l’app d’autinticazzioni.
flow-setup-2fa-backup-code-confirm-code-input = Metti u còdici di 10 caràttari
# Clicking on this button finishes the whole flow upon success.
flow-setup-2fa-backup-code-confirm-button-finish = Cumpleta

## The backup codes download step of the setup 2 factor authentication flow

flow-setup-2fa-backup-code-dl-heading = Sarba i còdici d’autinticazzioni di sicurizza
flow-setup-2fa-backup-code-dl-save-these-codes = Sàrbali nnôn postu unni ti ricordi. Si nun ài accessu â to app d'autinticazzioni, ti serbi unu di chisti pi tràsiri.
flow-setup-2fa-backup-code-dl-button-continue = Cuntinua

## FlowSetupPhoneConfirmCode

# verification code refers to a code sent by text message to confirm phone number ownership
# and complete setup
flow-setup-phone-confirm-code-heading = Metti u còdici di virìfica
# $phoneNumber is a partially obfuscated phone number with only the last 4 digits showing (e.g., *** *** 1234)
# span element applies formatting to ensure the number is always displayed left-to-right
flow-setup-phone-confirm-code-instruction = Mannammu un còdici di 6 cifri a <span>{ $phoneNumber }</span>. Stu còdici scadi doppu 5 minuti.
flow-setup-phone-confirm-code-input-label = Metti u còdici di 6 cifri
flow-setup-phone-confirm-code-button = Cunferma
# button to resend a code by text message to the user's phone
# followed by a button to resend a code
flow-setup-phone-confirm-code-expired = Còdici scadutu?
flow-setup-phone-confirm-code-resend-code-button = Manna arrè
flow-setup-phone-confirm-code-resend-code-success = Còdici mannatu
flow-setup-phone-confirm-code-success-message-v2 = Juncisti u nùmmaru di tilèfunu di ricùpiru
flow-change-phone-confirm-code-success-message = Canciasti u nùmmaru di tilèfunu di ricùpiru

## FlowSetupPhoneConfirmCode

flow-setup-phone-submit-number-heading = Virìfica u to nùmmaru di tilèfunu
# The code is a 6-digit code send by text message/SMS
flow-setup-phone-verify-number-instruction = T’arriva un missaggiu di testu di { -brand-mozilla } c’un còdici pi virificari u to nùmmaru. Nun spàrtiri stu còdici cu nuḍḍu.
# The initial rollout of the recovery phone is only available to users with US and Canada mobile phone numbers.
# Voice over Internet Protocol (VoIP), is a technology that uses a broadband Internet connection instead of a regular (or analog) phone line to make calls.
# Phone mask services (for example Relay) provide a temporary virtual number to avoid providing a real phone number.
# Both VoIP and phone masks can be unreliable for one-time-passcode (OTP) verification
flow-setup-phone-submit-number-info-message-v2 = U nùmmaru di tilèfunu di ricùpiru dû cuntu è dispunìbbili sulu nnê Stati Junciuti e nnô Cànada. Nun cunzigghiamu di usari nùmmari VoIP e i nùmmari mascarati.
flow-setup-phone-submit-number-legal = Dànnuni u to nùmmaru di tilèfunu, sì d’accordu chi u sarbamu pi mannàriti missaggi pi virificari u cuntu. Cci putìssiru èssiri cosi di pagari pi missaggi o tràficu dati.
# cliking on the button sends a code by text message to the phone number typed in by the user
flow-setup-phone-submit-number-button = Manna u còdici

## HeaderLockup component, the header in account settings

header-menu-open = Chiuji u minù
header-menu-closed = Minù di navicazzioni dû situ
header-back-to-top-link =
    .title = Torna supra
header-title-2 = { -product-mozilla-account(capitalization: "uppercase") }
header-help = Ajutu

## Linked Accounts section

la-heading = Cunti lijati
la-description = Auturizzasti l’accessu ê cunti appressu.
la-unlink-button = Slija
la-unlink-account-button = Slija
la-set-password-button = Mpusta chiavi
la-unlink-heading = Slija d’un cuntu terzu
la-unlink-content-3 = Vo’ scullijari u to cuntu? Scullijari u cuntu nun ti fa nèsciri di manera autumàtica di tutti i Sirbizza cunnessi. Pi fallu, hâ nèsciri a manu dâ sizzioni Sirbizza cunnessi.
la-unlink-content-4 = Prima di scullijari u to cuntu, hâ mpustari na chiavi. Senza nuḍḍa chiavi, nun cc’è nuḍḍa manera di tràsiri nnô cuntu doppu chi u scullijasti.
nav-linked-accounts = { la-heading }

## Modal - Default values for a message directed at the user where the user can typically Confirm or Cancel.

modal-close-title = Chiuji
modal-cancel-button = Sfai
modal-default-confirm-button = Cunferma

## Modal Verify Session

mvs-verify-your-email-2 = Cunferma u to nnirizzu di posta elittrònica
mvs-enter-verification-code-2 = Metti u còdici di cunferma
# This string is used to show a notification to the user for them to enter confirmation code to confirm their email.
# Variables:
#   email (String) - the user's email
mvs-enter-verification-code-desc-2 = Pi favuri metti prima di 5 minuti u còdici di cunferma chi mannammu a <email>{ $email }</email>.
msv-cancel-button = Sfai
msv-submit-button-2 = Cunferma

## Settings Nav

nav-settings = Mpustazzioni
nav-profile = Prufilu
nav-security = Sicurizza
nav-connected-services = Sirbizza cunnessi
nav-data-collection = Ricugghiuta e usu dî dati
nav-paid-subs = Abbunamenti a pagamentu
nav-email-comm = Cumunicazzioni pi posta elittrònica

## Two Step Authentication - replace backup authentication code

# Error shown when API call fails while replacing existing backup codes
tfa-replace-code-error-3 = Cci fu un prubblema mentri chi canciava i còdici d’autinticazzioni di sicurizza
# Error shown when API call fails while creating new backup codes (user had none)
tfa-create-code-error = Cci fu un prubblema mentri chi criava i còdici d’autinticazzioni di sicurizza
# Success message shown in alert bar after successfully replacing existing backup codes
tfa-replace-code-success-alert-4 = Còdici d’autinticazzioni di sicurizza attualizzati

## Avatar change page

avatar-page-title =
    .title = Mmàggini dû prufilu
avatar-page-add-photo = Junci fotu
avatar-page-add-photo-button =
    .title = { avatar-page-add-photo }
avatar-page-take-photo = Scatta na fotu
avatar-page-take-photo-button =
    .title = { avatar-page-take-photo }
avatar-page-remove-photo = Leva fotu
avatar-page-remove-photo-button =
    .title = { avatar-page-remove-photo }
avatar-page-retake-photo = Scatta na fotu nova
avatar-page-cancel-button = Sfai
avatar-page-save-button = Sarba
avatar-page-saving-button = Staju sarbannu…
avatar-page-zoom-out-button =
    .title = Cchiù nicu
avatar-page-zoom-in-button =
    .title = Cchiù granni
avatar-page-rotate-button =
    .title = Gira
avatar-page-camera-error = Mpussìbbili inizializzari a fotucàmmira
avatar-page-new-avatar =
    .alt = mmàggini dû prufilu nova
avatar-page-file-upload-error-3 = Cci fu un prubblema mentri chi carricava a to mmàggini dû prufilu
avatar-page-delete-error-3 = Cci fu un prubblema mentri chi scancillava a to mmàggini dû prufilu
avatar-page-image-too-large-error-2 = U pricu è troppu assai grossu pû carricamentu

## Password change page

pw-change-header =
    .title = Cancia a chiavi
pw-8-chars = Armenu 8 caràttari
pw-not-email = Nun cci àv’a èssiri u to nnirizzu di posta elittrònica
pw-change-must-match = A chiavi nova appatta câ cunferma
pw-commonly-used = Nun àv’a èssiri na chiavi cumuni
# linkExternal is a link to a mozilla.org support article on password strength
pw-tips = Arresta ô sicuru — nun usare i chiavi nna cchiù assai d’un locu. Vidi i nostri cunzigghi ncapu a comu <linkExternal>criari chiavi forti</linkExternal>.
pw-change-cancel-button = Sfai
pw-change-save-button = Sarba
pw-change-forgot-password-link = Ti scurdasti a chiavi?
pw-change-current-password =
    .label = Metti a chiavi attuali
pw-change-new-password =
    .label = Metti a chiavi nova
pw-change-confirm-password =
    .label = Cunferma a chiavi nova
pw-change-success-alert-2 = Chiavi attualizzata

## Password create page

pw-create-header =
    .title = Crìa na chiavi
pw-create-success-alert-2 = Chiavi mpustata
pw-create-error-2 = Ni dispiaci, cci fu un prubblema mentri chi mpustava a to chiavi

## Delete account page

delete-account-header =
    .title = Scancella cuntu
delete-account-step-1-2 = Passu 1 di 2
delete-account-step-2-2 = Passu 2 di 2
delete-account-confirm-title-4 = Capaci chi cullijasti u to { -product-mozilla-account } a unu o cchiù assai di sti prudutti o sirbizza { -brand-mozilla } chi ti garantìscinu na spirienza di riti sicura e pruduttiva:
delete-account-product-mozilla-account = { -product-mozilla-account(capitalization: "uppercase") }
delete-account-product-mozilla-vpn = { -product-mozilla-vpn }
delete-account-product-mdn-plus = { -product-mdn-plus }
delete-account-product-mozilla-hubs = { -product-mozilla-hubs }
delete-account-product-mozilla-monitor = { -product-mozilla-monitor }
delete-account-product-firefox-relay = { -product-firefox-relay }
delete-account-product-firefox-sync = Staju sincrunizzannu i dati di { -brand-firefox }
delete-account-product-firefox-addons = Juncitini di { -brand-firefox }
delete-account-acknowledge = Teni ’n cuntu chi, scancillannu u to cuntu:
delete-account-chk-box-2 =
    .label = Putissi pèrdiri i nfurmazzioni e i funziunalità dî prudutti { -brand-mozilla }
delete-account-chk-box-3 =
    .label = Puru siḍḍu attivi arrè u cuntu cu stu nnirizzu di posta elittrònica, nun è pussìbbili ricupigghiari i nfurmazzioni sarbati
delete-account-chk-box-4 =
    .label = Tutti i stinneri e i temi chi pubblicasti nne addons.mozilla.org vennu scancillati
delete-account-continue-button = Cuntinua
delete-account-password-input =
    .label = Metti a chiavi
delete-account-cancel-button = Sfai
delete-account-delete-button-2 = Scancella

## Display name page

display-name-page-title =
    .title = Nomu mustratu
display-name-input =
    .label = Metti u nomu mustratu
submit-display-name = Sarba
cancel-display-name = Sfai
display-name-update-error-2 = Cci fu un prubblema mentri chi canciava u nomu mustratu
display-name-success-alert-2 = Canciasti u nomu mustratu

## Recent account activity
## All strings except title indicate an event that occurred from the user's account
## These are displayed as a list with the date when the event occured

recent-activity-title = Attività ricenti dû cuntu
recent-activity-account-create-v2 = Cuntu criatu
recent-activity-account-disable-v2 = Cuntu sdisabbilitatu
recent-activity-account-enable-v2 = Cuntu abbilitatu
recent-activity-account-login-v2 = Fu principiata na trasuta nnô cuntu
recent-activity-account-reset-v2 = Fu principiata na rimpustazzioni dâ chiavi
# This string appears under recent account activity when there were email bounces associated with the account, but those were recently cleared (i.e. removed/deleted).
# An email bounce is when an email is sent to an email address and fails/receives a non-delivery receipt from the recipient's mail server.
recent-activity-emails-clearBounces-v2 = Foru scancillati i nutìfichi dî ricàpiti sfalluti dâ posta elittrònica
recent-activity-account-login-failure = Sfallìu na trasuta nnô cuntu
recent-activity-account-two-factor-added = Abbilitasti l’autinticazzioni a du’ fattura
recent-activity-account-two-factor-requested = Fu addumannata l’autinticazzioni a du’ fattura
recent-activity-account-two-factor-failure = Sfallìu l’autinticazzioni a du’ fattura
recent-activity-account-two-factor-success = L’autinticazzioni a du’ fattura jìu bonu
recent-activity-account-two-factor-removed = Fu livata l’autinticazzioni a du’ fattura
recent-activity-account-password-reset-requested = Fu addumannata na rimpustazzioni dâ chiavi
recent-activity-account-password-reset-success = A rimpustazzioni dâ chiavi jìu bonu
recent-activity-account-recovery-key-added = Abbilitasti a chiavi di ricùpiru dû cuntu
recent-activity-account-recovery-key-verification-failure = Sfallìu a virìfica dâ chiavi di ricùpiru dû cuntu
recent-activity-account-recovery-key-verification-success = A virìfica dâ chiavi di ricùpiru dû cuntu jìu bonu
recent-activity-account-recovery-key-removed = Livasti a chiavi di ricùpiru dû cuntu
recent-activity-account-password-added = Fu junciuta na chiavi nova
recent-activity-account-password-changed = Chiavi canciata
recent-activity-account-secondary-email-added = Fu junciutu nu nnirizzu di posta elittrònica sicunnariu
recent-activity-account-secondary-email-removed = Fu livatu u nnirizzu di posta elittrònica sicunnariu
recent-activity-account-emails-swapped = Foru scanciati i nnirizzi di posta elittrònica primariu e sicunnariu
recent-activity-session-destroy = Scullijatu dâ sissioni
recent-activity-account-recovery-phone-send-code = Fu mannatu u còdici di ricùpiru dû cuntu ô tilèfunu
recent-activity-account-recovery-phone-setup-complete = Cumplitasti a cunfijurazzioni dû nùmmaru di tilèfunu pi ricupigghiari u cuntu
recent-activity-account-recovery-phone-signin-complete = Fu cumplitata na trasuta cû nùmmaru di tilèfunu di ricùpiru
recent-activity-account-recovery-phone-signin-failed = Sfallìu na trasuta cû nùmmaru di tilèfunu di ricùpiru
recent-activity-account-recovery-phone-removed = Nùmmaru di tilèfunu di ricùpiru scancillatu
recent-activity-account-recovery-codes-replaced = I còdici di ricùpiru foru canciati
recent-activity-account-recovery-codes-created = I còdici di ricùpiru foru criati
recent-activity-account-recovery-codes-signin-complete = Fu cumplitata na trasuta chî còdici di ricùpiru
recent-activity-password-reset-otp-sent = Fu mannatu un còdici di cunferma di rimpustazzioni dâ chiavi
recent-activity-password-reset-otp-verified = Fu virificatu un còdici di cunferma di rimpustazzioni dâ chiavi
recent-activity-must-reset-password = Fu addumannata na rimpustazzioni dâ chiavi
# Security event was recorded, but the activity details are unknown or not shown to user
recent-activity-unknown = Autri attività dû cuntu

## PageRecoveryKeyCreate

# The page title displayed at the top of the flow container
recovery-key-create-page-title = Chiavi di ricùpiru dû cuntu
# Tooltip text and aria label for back arrow that takes users out of the account recovery key generation flow
# and back to account settings
recovery-key-create-back-button-title = Torna ê mpustazzioni

## PageRecoveryPhoneRemove
## Users reach this page from account settings when they want to remove a backup phone number.

recovery-phone-remove-header = Scancella u nùmmaru di tilèfunu di ricùpiru
# Variables:
#   $formattedFullPhoneNumber (String) - the user's full phone number
settings-recovery-phone-remove-info = Chistu scancella <strong>{ $formattedFullPhoneNumber }</strong> comu nùmmaru di tilèfunu di ricùpiru.
settings-recovery-phone-remove-recommend = Ti cunzigghiamu di mantiniri stu mètudu picchì è cchiù fàcili di sarbari i còdici d’autinticazzioni di sicurizza.
# "Saved backup authentication codes" refers to previously saved backup authentication codes
settings-recovery-phone-remove-recovery-methods = Si u scancelli, cuntrolla chi ài sarbati i to còdici d’autinticazzioni di sicurizza. <linkExternal>Apparaggia i mètudi di ricùpiru</linkExternal>
settings-recovery-phone-remove-button = Leva u nùmmaru di tilèfunu
settings-recovery-phone-remove-cancel = Sfai
settings-recovery-phone-remove-success = Nùmmaru di tilèfunu di ricùpiru scancillatu

## PageSetupRecoveryPhone

page-setup-recovery-phone-heading = Junci u nùmmaru di tilèfunu di ricùpiru dû cuntu
page-change-recovery-phone = Cancia u nùmmaru di tilèfunu di ricùpiru
page-setup-recovery-phone-back-button-title = Torna ê mpustazzioni
# Back arrow to return to step 1 of recovery phone setup flow
page-setup-recovery-phone-step2-back-button-title = Cancia u nùmmaru di tilèfunu

## Add secondary email page

add-secondary-email-step-1 = Passu 1 di 2
add-secondary-email-error-2 = Cci fu un prubblema mentri chi criava stu nnirizzu di posta elittrònica
add-secondary-email-page-title =
    .title = Nnirizzu di posta elittrònica sicunnariu
add-secondary-email-enter-address =
    .label = Metti u nnirizzu di posta elittrònica
add-secondary-email-cancel-button = Sfai
add-secondary-email-save-button = Sarba
# This message is shown when a user tries to add a secondary email that is a
# Firefox Relay email mask (generated email address that can be used in place of
# your real email address)
add-secondary-email-mask = I nnirizzi di posta elittrònica mascarati nun ponnu èssiri usati comu nnirizzi sicunnari

## Verify secondary email page

add-secondary-email-step-2 = Passu 2 di 2
verify-secondary-email-page-title =
    .title = Nnirizzu di posta elittrònica sicunnariu
verify-secondary-email-verification-code-2 =
    .label = Metti u còdici di cunferma
verify-secondary-email-cancel-button = Sfai
verify-secondary-email-verify-button-2 = Cunferma
# This string is an instruction in a form.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
verify-secondary-email-please-enter-code-2 = Pi favuri metti prima di 5 minuti u còdici di cunferma chi mannammu a <strong>{ $email }</strong>.
# This string is a confirmation message shown after verifying an email.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
verify-secondary-email-success-alert-2 = U nnirizzu { $email } fu junciutu

##

# Link to delete account on main Settings page
delete-account-link = Scancella cuntu
# Success message displayed in alert bar after the user has successfully confirmed their account is not inactive.
inactive-update-status-success-alert = Trasisti. U to { -product-mozilla-account } e i to dati arrèstanu attivi.

## Product promotion

product-promo-monitor =
    .alt = { -product-mozilla-monitor }
# Links out to the Monitor site
product-promo-monitor-cta = Fai na risciduta a francu

## Profile section

profile-heading = Prufilu
profile-picture =
    .header = Mmàggini
profile-display-name =
    .header = Nomu mustratu
profile-primary-email =
    .header = Nnirizzu di posta elittrònica primariu

## Progress bar

# This is the aria-label text for the progress bar. The progress bar is meant to visually show the user how much progress they have made through the steps of a given flow.
# Variables:
#   $currentStep (number) - the step which the user is currently on
#   $numberOfSteps (number) - the total number of steps in a given flow
progress-bar-aria-label-v2 = Passu { $currentStep } di { $numberOfSteps }.

## Security section of Setting

security-heading = Sicurizza
security-password =
    .header = Chiavi
# This is a string that shows when the user's password was created.
# Variables:
#   $date (String) - a localized date and time string
security-password-created-date = Criata jornu { $date }
security-not-set = Nun fu mpustata
security-action-create = Crìa
security-set-password = Mposta na chiavi pi sincrunizzari e usari certi carattarìstichi di sicurizza dû cuntu.
# Link opens a list of recent account activity (e.g., login attempts, password changes, etc.)
security-recent-activity-link = Vidi l’attività ricenti dû cuntu
signout-sync-header = Sissioni scaduta
signout-sync-session-expired = Ni dispiaci, quarchi cosa sfallìu. Pi favuri nesci dû minù dû navicaturi e torna a prova.

## SubRow component

tfa-row-backup-codes-title = Còdici d’autinticazzioni di sicurizza
# Only shown for users that have 2FA enabled and verified, but all backup authentication codes have been consumed
# Users that have not enabled or verified 2FA will not see this
tfa-row-backup-codes-not-available = Nun cci sunnu còdici dispunìbbili
# $numCodesRemaining - the number of backup authentication codes that have not yet been used (generally between 1 to 5)
# A different message is shown when no codes are available
tfa-row-backup-codes-available-v2 =
    { $numCodesAvailable ->
        [one] Arresta { $numCodesAvailable } còdici
       *[other] Arrèstanu { $numCodesAvailable } còdici
    }
# Shown to users who have backup authentication codes - this will allow them to generate new codes to replace the previous ones
tfa-row-backup-codes-get-new-cta-v2 = Crìa còdici novi
# Shown to users who have no backup authentication codes
# Button to add backup authentication codes when none are configured
tfa-row-backup-codes-add-cta = Junci
# 'This' refers to 'backup authentication codes', used as a recovery method for two-step authentication
tfa-row-backup-codes-description-2 = Chistu è u mètudu di ricùpiru cchiù sicuru si nun po’ usari u to dispusitivu mòbbili o l’app d’autinticazzioni.
# Recovery phone is a recovery method for two-step authentication
# A recovery code can be sent to the user's phone
tfa-row-backup-phone-title-v2 = Nùmmaru di tilèfunu di ricùpiru
# Shown with an alert icon to indicate that no recovery phone is configured
tfa-row-backup-phone-not-available-v2 = Nun juncisti nuḍḍu nùmmaru di tilèfunu
# button to change the configured recovery phone
tfa-row-backup-phone-change-cta = Cancia
# button to add/configure a recovery phone
tfa-row-backup-phone-add-cta = Junci
# Button to remove a recovery phone from the user's account
tfa-row-backup-phone-delete-button = Leva
# Shown in tooltip on delete button or delete icon
tfa-row-backup-phone-delete-title-v2 = Nùmmaru di tilèfunu di ricùpiru
tfa-row-backup-phone-delete-restriction-v2 = Si vo’ livari u to nùmmaru di tilèfunu dû ricùpiru, junci i còdici d’autinticazzioni di sicurizza o prima sdisabbìlita l’autinticazzioni a du’ fattura pi scanzàriti di bluccàriti fora dû to cuntu.
# "this" refers to recovery phone
tfa-row-backup-phone-description-v2 = Chista è u mètudu di ricùpiru cchiù fàcili si nun po’ usari l’app d’autinticazzioni.
# A SIM swap attack is a type of identity theft where an attacker tricks or bribes a mobile carrier
# into transferring a victim's phone number to their own SIM card, enabling access to accounts secured
# with SMS-based two-factor authentication.
tfa-row-backup-phone-sim-swap-risk-link = Cchiù nfurmazzioni ncapu ô rìsicu di scanciu dî schedi SIM

## Switch component

# Used as "title" attribute when the switch is "on" and interaction turns the switch to "off"
switch-turn-off = Sdisattiva
# Used as "title" attribute when the switch is "off" and interaction turns the switch to "on"
switch-turn-on = Attiva
# Used as "title" attribute when switch has been interacted with and form is submitting
switch-submitting = Staju mannannu…
switch-is-on = attivu
switch-is-off = sdisattivu

## Sub-section row Defaults

row-defaults-action-add = Junci
row-defaults-action-change = Cancia
row-defaults-action-disable = Sdisabbìlita
row-defaults-status = Nuḍḍu

## Account recovery key sub-section on main Settings page

rk-header-1 = Chiavi di ricùpiru dû cuntu
rk-enabled = Abbilitata
rk-not-set = Nun fu mpustata
rk-action-create = Crìa
# Button to delete the existing account recovery key and create a new one
rk-action-change-button = Cancia
rk-action-remove = Leva
rk-key-removed-2 = Livasti a chiavi di ricùpiru dû cuntu
rk-cannot-remove-key = Nun potti livari a to chiavi di ricùpiru dû cuntu.
rk-refresh-key-1 = Attualizza a chiavi di ricùpiru dû cuntu
rk-content-explain = Ricupigghia i to nfurmazzioni quannu ti scordi a chiavi.
rk-cannot-verify-session-4 = Ni dispiaci, cci fu un prubblema mentri chi cunfirmava a to sissioni
rk-remove-modal-heading-1 = Vo’ livari a chiavi di ricùpiru dû cuntu?
rk-remove-modal-content-1 = Siḍḍu dicidi di risittari a chiavi, nun è pussìbbili usari a chiavi di ricùpiru dû cuntu pi aviri i to dati. Nun po’ sfari st’azzioni.
rk-remove-error-2 = Nun potti livari a to chiavi di ricùpiru dû cuntu
# Icon button to delete user's account recovery key. Text appears in tooltip on hover and as alt text for screen readers.
unit-row-recovery-key-delete-icon-button-title = Scancella a chiavi di ricùpiru dû cuntu

## Secondary email sub-section on main Settings page

se-heading = Nnirizzu di posta elittrònica sicunnariu
    .header = Nnirizzu di posta elittrònica sicunnariu
se-cannot-refresh-email = Ni dispiaci, cci fu un prubblema mentri chi attualizzava stu nnirizzu di posta elittrònica
se-cannot-resend-code-3 = Ni dispiaci, cci fu un prubblema mentri chi mannava arrè u còdici di cunferma
# This string is used in a notification message near the top of the page.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
se-set-primary-successful-2 = { $email } ora è u to nnirizzu di posta elittrònica primariu
se-set-primary-error-2 = Ni dispiaci, cci fu un prubblema mentri chi canciava u to nnirizzu di posta elittrònica primariu
# This string is used in a notification message near the top of the page.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
se-delete-email-successful-2 = Scancillasti u nnirizzu { $email }
se-delete-email-error-2 = Ni dispiaci, cci fu un prubblema mentri chi scancillava stu nnirizzu di posta elittrònica
se-verify-session-3 = Serbi chi cunfermi a sissioni attuali pi fari st’azzioni
se-verify-session-error-3 = Ni dispiaci, cci fu un prubblema mentri chi cunfirmava a to sissioni
# Button to remove the secondary email
se-remove-email =
    .title = Leva nnirizzu di posta elittrònica
# Button to refresh secondary email status
se-refresh-email =
    .title = Attualizza nnirizzu di posta elittrònica
se-unverified-2 = nun cunfirmatu
se-resend-code-2 =
    Abbisugnamu di na cunferma. <button>Manna arrè u còdici di cunferma</button>
    si nun agghicau nnâ to posta 'n arrivu o nnâ carpetta spam.
# Button to make secondary email the primary
se-make-primary = Fallu primariu
se-default-content = Trasi nnô to cuntu si nun arrinesci a tràsiri nnâ to posta elittrònica primaria.
se-content-note-1 = Abbisu: nu nnirizzu di posta elittrònica sicunnariu nun ricùpira i to nfurmazzioni — ti serbi na <a>chiavi di ricùpiru dû cuntu</a> pi chiḍḍu.
# Default value for the secondary email
se-secondary-email-none = Nuḍḍu

## Two Step Auth sub-section on Settings main page

tfa-row-header = Autinticazzioni a du’ fattura
tfa-row-enabled = Abbilitata
tfa-row-disabled-status = Sdisabbilitata
tfa-row-action-add = Junci
tfa-row-action-disable = Sdisabbìlita
tfa-row-button-refresh =
    .title = Attualizza l’autinticazzioni a du’ fattura
tfa-row-cannot-refresh = Ni dispiaci, cci fu un prubblema mentri chi attualizzava l’autinticazzioni a du’ fattura.
tfa-row-enabled-description = U to cuntu è prutettu cu l'autinticazzioni a du' fattura. Hâ mèttiri un còdici a usu sìngulu pigghiatu dâ to app pi l'autinticazzioni quannu trasi nnô to { -product-mozilla-account }.
# "this" refers to two-step authentication
# Link goes to https://support.mozilla.org/kb/secure-mozilla-account-two-step-authentication
tfa-row-enabled-info-link = Comu pruteggi u to cuntu
tfa-row-disabled-description-v2 = Ajùtani a tèniri u to cuntu ô sicuru usannu n'app d'autinticazzioni comu sicunnu passaggiu pi tràsiri.
tfa-row-cannot-verify-session-4 = Ni dispiaci, cci fu un prubblema mentri chi cunfirmava a to sissioni
tfa-row-disable-modal-heading = Vo’ sdisabbilitari l’autinticazzioni a du’ fattura?
tfa-row-disable-modal-confirm = Sdisabbìlita
tfa-row-disable-modal-explain-1 = Nun po’ sfari st’azzioni. Ài macari a pussibbilità di <linkExternal>scanciari i to còdici d’autinticazzioni di sicurizza</linkExternal>.
# Shown in an alert bar after two-step authentication is disabled
tfa-row-disabled-2 = Sdisabbilitasti l’autinticazzioni a du’ fattura
tfa-row-cannot-disable-2 = Nun potti sdisabbilitari l’autinticazzioni a du’ fattura

## TermsPrivacyAgreement
## These terms are used in signin and signup for Firefox account

# This message is followed by a bulleted list
terms-privacy-agreement-intro-2 = Cuntinuannu, accetti i:

## ThirdPartyAuth component
## This is a component that is used to display a list of third party providers (Apple, Google, etc.)

# This appears when a user has the option to authenticate via third party accounts in addition to their Firefox account.
# Firefox account login appears on top, and third party options appear on bottom.
# This string appears as a separation between the two, in the following order: "Enter your password" "Or"(this string) (continue-with-google-button with aria equivalent text) / (continue-with-apple-button with aria equivalent text)
third-party-auth-options-or = o puru
continue-with-google-button = Cuntinua cu { -brand-google }
continue-with-apple-button = Cuntinua cu { -brand-apple }

## Auth-server based errors that originate from backend service

auth-error-102 = Cuntu scanusciutu
auth-error-103 = Chiavi sbagghiata
auth-error-105-2 = Còdici di cunferma nun vàlitu
auth-error-110 = Tistimoni nun vàlitu
# Error shown to users when they have attempted a request (e.g., requesting a password reset) too many times
# and their requests have been throttled, but the specific amount of time before they can retry is unknown.
auth-error-114-generic = Pruvasti troppu assai voti. Torna a prova cchiù tardu.
# This string is the amount of time required before a user can attempt another request.
# Variables:
#   $retryAfter (String) - Time required before retrying a request. The variable is localized by our
#                          formatting library (momentjs) as a "time from now" and automatically includes
#                          the prefix as required by the current locale (for example, "in 15 minutes", "dans 15 minutes").
auth-error-114 = Pruvasti troppu assai voti. Torna a prova { $retryAfter }.
auth-error-125 = A dumanna fu bluccata pi scaciuni di sicurizza
auth-error-129-2 = Mittisti un nùmmaru di tilèfunu chi nun è vàlitu. Pi favuri cuntròllalu e torna a prova.
auth-error-138-2 = Sissioni nun cunfirmata
auth-error-139 = U nnirizzu di posta elittrònica sicunnariu àv’a siri diversu dû to nnirizzu primariu
auth-error-155 = Nun attruvai u tistimoni TOTP
# Error shown when the user submits an invalid backup authentication code
auth-error-156 = Nun attruvai u còdici d’autinticazzioni di sicurizza
auth-error-159 = A chiavi di ricùpiru dû cuntu nun è vàlita
auth-error-183-2 = U còdici di cunferma nun è vàlitu o scadìu
auth-error-202 = Sta carattarìstica nun è attiva
auth-error-203 = U sistema nun è dispunìbbili, torna a prova ntra picca
auth-error-206 = Nun potti criari a chiavi, fu già mpustata
auth-error-214 = U nùmmaru di tilèfunu di ricùpiru esisti già
auth-error-215 = U nùmmaru di tilèfunu di ricùpiru nun esisti
auth-error-216 = Agghicasti ô nùmmaru màssimu dî missaggi di testu
auth-error-218 = Nun fu pussìbbili livari u nùmmaru di tilèfunu di ricùpiru, màncanu i còdici d’autinticazzioni di sicurizza.
auth-error-219 = Stu nùmmaru di tilèfunu fu riggistratu nna troppu assai cunti. Pi favuri prova n’autru nùmmaru.
auth-error-999 = Erruri nun privistu
auth-error-1001 = U tintativu di trasuta sfallìu
auth-error-1002 = A sissioni scadìu. Trasi pi cuntinuari.
auth-error-1003 = L’archiviu lucali o i viscotta sunnu ancora sdisabbilitati
auth-error-1008 = A to chiavi nova àv’a siri diversa
auth-error-1010 = È nicissaria na chiavi vàlita
auth-error-1011 = È nicissariu nu nnirizzu di posta elittrònica vàlitu
auth-error-1018 = L’e-mail di cunferma turnau nn’arrè. Sbagghiasti a scrìviri u nnirizzu?
auth-error-1020 = Sbagghiasti a scrìviri u nnirizzu? firefox.com nun è un sirbizzu di posta elittrònica vàlitu
auth-error-1031 = Pi cumplitari a riggistrazzioni hâ mèttiri a to età
auth-error-1032 = Pi cumplitari a riggistrazzioni hâ mèttiri n’età vàlita
auth-error-1054 = U còdici d’autinticazzioni a du’ fattura nun è vàlitu
auth-error-1056 = U còdici d’autinticazzioni di sicurizza nun è vàlitu
auth-error-1062 = U rinnirizzu nun è vàlitu
# Shown when a user tries to sign up with an email address with a domain that doesn't receive emails
auth-error-1064 = Sbagghiasti a scrìviri u nnirizzu? { $domain } nun è un sirbizzu di posta elittrònica vàlitu
auth-error-1066 = Nun po' usari nu nnirizzu di posta mascaratu pi criari un cuntu.
auth-error-1067 = Sbagghiasti a scrìviri u nnirizzu di posta elittrònica?
# Displayed when we want to reference a user's previously set up recovery phone
# number, but they are not completely signed in yet. We'll only show the last 4 digits.
# Variables:
#  $lastFourPhoneNumber (Number) - The last 4 digits of the user's recovery phone number
recovery-phone-number-ending-digits = Nùmmaru chi finisci pi { $lastFourPhoneNumber }
oauth-error-1000 = Quarchi cosa sfarsijau. Pi favuri chiuji sta scheda e torna a prova.

## Connect Another Device page

# A user will only see this header if they are signed in. The header will be preceded by a green checkmark (rtl/ltr sensitive)
connect-another-device-signed-in-header = Trasisti nne { -brand-firefox }
# A "success" message visible to users who verified via email
connect-another-device-email-confirmed-banner = U nnirizzu di posta elittrònica fu cunfirmatu
# A "success" message visible to users who verified via sign-in
connect-another-device-signin-confirmed-banner = Trasuta cunfirmata
# A message prompts the user to sign in to this instance of the Firefox browser so as to complete device sync. This is followed by a link labeled "Sign in"
connect-another-device-signin-to-complete-message = Trasi nna stu { -brand-firefox } pi cumplitari a cunfijurazzioni
# A link for the user to sign in to the current Firefox browser, preceded by a message prompting the user to sign in so as to complete the device sync setup
connect-another-device-signin-link = Trasi
# A message prompting the user to sign in via a different device than the current one so as to complete the device-syncing process
connect-another-device-still-adding-devices-message = Vo’ jùnciri autri dispusitivi? Trasi nne { -brand-firefox } nta n’autru dispusitivu pi cumplitari a cunfijurazzioni
# A message prompting the user to sign in via a different device than the current one so as to complete the device-syncing process
connect-another-device-signin-another-device-to-complete-message = Trasi nne { -brand-firefox } nta n’autru dispusitivu pi cumplitari a cunfijurazzioni
# This message is a value-proposition prompting the user to sync another device so as to get tabs, bookmarks, and passwords shared between devices
connect-another-device-get-data-on-another-device-message = Vo’ ricupigghiari i to schedi, i nzingalibbra e i chiavi nta n’autru dispusitivu?
# This link leads the user back to the `/pair` page so as to connect another device
connect-another-device-cad-link = Cunnetti n’autru dispusitivu
# This link cancels the process of connecting another device, and takes the user back to Account Settings
connect-another-device-not-now-link = Ora no
# This is a message for Firefox Android users, prompting them to complete the process of connecting another device by signing into Firefox for Android
connect-another-device-android-complete-setup-message = Trasi nne { -brand-firefox } pi Android pi cumplitari a cunfijurazzioni
# This is a message for Firefox iOS users, prompting them to complete the process of connecting another device by signing into Firefox for iOS
connect-another-device-ios-complete-setup-message = Trasi nne { -brand-firefox } pi iOS pi cumplitari a cunfijurazzioni

## Cookies disabled page
## Users will see this page if they have local storage or cookies disabled.

cookies-disabled-header = È nicissariu attivari l’archiviu lucali e i viscotta
cookies-disabled-enable-prompt-2 = Pi favuri abbìlita i viscotta e l’archiviu lucali nnô to navicaturi pi tràsiri nnô to { -product-mozilla-account }. Facènnulu abbìliti carattarìstichi a tipu ricurdari l’utenti ntra na sissioni e n’autra.
# A button users may click to check if cookies and local storage are enabled and be directed to the previous page if so.
cookies-disabled-button-try-again = Prova arrè
# An external link going to: https://support.mozilla.org/kb/cookies-information-websites-store-on-your-computer
cookies-disabled-learn-more = Cchiù nfurmazzioni

## Index / home page

index-header = Metti u to nnirizzu di posta elittrònica
index-sync-header = Cuntinua cû to { -product-mozilla-account }
index-sync-subheader = Sincrunizza i to chiavi, i schedi e i nzingalibbra unn’è-è ca usi { -brand-firefox }.
index-relay-header = Crìa nu nnirizzu di posta mascaratu
index-relay-subheader = Pi favuri metti u nnirizzu di posta elittrònica unni âm’a mannari l’e-mail ricivuti dû nnirizzu mascaratu.
# $serviceName - the service (e.g., Pontoon) that the user is signing into with a Mozilla account
index-subheader-with-servicename = Cuntinua nne { $serviceName }
index-subheader-default = Cuntinua ê mpustazzioni dû cuntu
index-cta = Riggìstrati o trasi
index-account-info = Un { -product-mozilla-account } ti duna l’accessu a autri prudutti di { -brand-mozilla } chi prutègginu a to privatizza.
index-email-input =
    .label = Metti u to nnirizzu di posta elittrònica
# When users delete their Mozilla account inside account Settings, they are redirected to this page with a success message
index-account-delete-success = Scancillasti u to cuntu
# Displayed when users try to sign up for an account and their confirmation code email bounces
index-email-bounced = L’e-mail di cunferma turnau nn’arrè. Sbagghiasti a scrìviri u nnirizzu?

## InlineRecoveryKeySetup page component

inline-recovery-key-setup-create-error = Ah! Nun pòttimu criari a to chiavi di ricùpiru dû cuntu. Pi favuri torna a prova cchiù tardu.
inline-recovery-key-setup-recovery-created = Criasti na chiavi di ricùpiru dû cuntu
inline-recovery-key-setup-download-header = Pruteggi u to cuntu
inline-recovery-key-setup-download-subheader = Scàrricala e sàrbala ora
inline-recovery-key-setup-hint-header = Cunzigghiu di sicurizza

## InlineTotpSetup page
## TOTP (time-based one-time password) is a form of two-factor authentication (2FA).

# The "authentication code" here refers to the code provided by an authentication app.
inline-totp-setup-on-completion-description = Na vota chi cumplitasti, accumincia a ginirari còdici d’autinticazzioni chi doppu po’ usari.
# The "authentication code" here refers to the code provided by an authentication app.
inline-totp-setup-security-code-placeholder = Còdici d’autinticazzioni
# The "authentication code" here refers to the code provided by an authentication app.
inline-totp-setup-code-required-error = È nicissariu un còdici d’autinticazzioni
tfa-qr-code-alt = Usa u còdici { $code } pi cunfijurari l’autinticazzioni a du’ fattura nni l’applicazzioni suppurtati.

## Legal page. This page contains simply a header and links to pages that display
## content from https://github.com/mozilla/legal-docs

legal-header = Noti ligali
# Links to our internal "Firefox Cloud" /legal/terms page
legal-terms-of-service-link = Tèrmini di sirbizzu
# Links to our internal "Firefox Cloud" /legal/terms page
legal-privacy-link = Abbisu di privatizza

## Legal privacy notice page. Most content comes from https://github.com/mozilla/legal-docs

legal-privacy-heading = Abbisu di privatizza

## Legal terms of service page. Most content comes from https://github.com/mozilla/legal-docs

legal-terms-heading = Tèrmini di sirbizzu

## AuthAllow page - Part of the device pairing flow

pair-auth-allow-heading-text = Trasisti ora nne { -product-firefox }?
# Submit button to confirm that the user initiated the device pairing
# and that they approve of the new device being added to their account
pair-auth-allow-confirm-button = Se, appruva u dispusitivu
# "If this wasn't you" means "If it wasn't you that just signed in to Firefox"
# The text with the <link> tags links to a `reset password` page
pair-auth-allow-refuse-device-link = Si nun fusti tu, <link>cancia a to chiavi</link>

## PairAuthComplete page - part of the device pairing flow

# Heading to confirm the successful pairing of a new device with the user's account
# Device here is non specific (could be a laptop, tablet, phone, etc.)
pair-auth-complete-heading = Dispusitivu cullijatu
# Variable { $deviceFamily } is generally a browser name, for example "Firefox"
# Variable { $deviceOS } is an operating system short name, for example "iOS", "Android"
pair-auth-complete-now-syncing-device-text = Ora stai sincrunizzannu cu: { $deviceFamily } nne { $deviceOS }
pair-auth-complete-sync-benefits-text = Ora po’ accèdiri ê to schedi graputi, chiavi e nzingalibbra ncapu a tutti i to dispusitivi.
pair-auth-complete-see-tabs-button = Vidi i schedi dî dispusitivi sincrunizzati
pair-auth-complete-manage-devices-link = Manija i dispusitivi

## AuthTotp page
## TOTP (time-based one-time password) is a form of two-factor authentication (2FA).
## Users that have set up two-factor authentication land on this page during device pairing.

# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "to continue to account settings" can stand alone as "Continue to account settings"
auth-totp-heading-w-default-service = Metti u còdici d’autinticazzioni <span>pi cuntinuari chî mpustazzioni dû cuntu</span>
# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "to continue to { $serviceName }" can stand alone as "Continue to { $serviceName }"
# { $serviceName } represents a product name (e.g., Mozilla VPN) that will be passed in as a variable
auth-totp-heading-w-custom-service = Metti u còdici d’autinticazzioni <span>pi cuntinuari cu { $serviceName }</span>
auth-totp-instruction = Grapi a to app d’autinticazzioni e metti u còdici d’autinticazzioni chi ti duna.
auth-totp-input-label = Metti u còdici di 6 cifri
# Form button to confirm if the authentication code entered by the user is valid
auth-totp-confirm-button = Cunferma
# Error displayed in a tooltip when the form is submitted without a code
auth-totp-code-required-error = È nicissariu un còdici d’autinticazzioni

## WaitForSupp page - Part of the devide pairing flow
## Users see this page when they have started to pair a second (or more) device to their account
## The pairing must be approved from both devices to succeed

# The "other device" is non-specific and could be a desktop computer, laptop, tablet, mobile phone, etc.
# Strings within the <span> elements appear as a subheading.
pair-wait-for-supp-heading-text = È nicissariu chi approvi <span>di l’autru dispusitivu</span>

## PairFailure - a view which displays on failure of the device pairing process

pair-failure-header = L’accucchiamentu nun arriniscìu
pair-failure-message = U prucessu di cunfijurazzioni sfallìu.

## Pair index page

pair-sync-header = Sincrunizza { -brand-firefox } nnô to tilèfunu o a to tavuliḍḍa
pair-cad-header = Culleja { -brand-firefox } nta n’autru dispusitivu
pair-already-have-firefox-paragraph = Ài già { -brand-firefox } nnô tilèfunu o nnâ tavuliḍḍa?
# Clicking this button initiates the pairing process, usually by directing the user to the `about:preferences` page in Firefox
pair-sync-your-device-button = Sincrunizza u to dispusitivu
# This is a heading element immediately preceded by "Sync your device" and followed by a link and QR code to download Firefox
pair-or-download-subheader = o scàrricalu
# Directs user to scan a QR code to download Firefox. <linkExternal> is an anchor tag that directs the user to where they can download the { -brand-firefox } app
pair-scan-to-download-message = Scanziuna pi scarricari { -brand-firefox } pî dispusitivi mòbbili, o mànnati na <linkExternal>lijami pû scarricamentu</linkExternal>.
# This allows the user to exit the sync/pair flow, and redirects them back to Settings
pair-not-now-button = Ora no
pair-take-your-data-message = Pòrtati i schedi, i nzingalibbra e i chiavi unn’è-è ca usi { -brand-firefox }.
# This initiates the pairing process, usually by directing the user to the `about:preferences` page in Firefox
pair-get-started-button = Accumincia
# This is the aria label on the QR code image
pair-qr-code-aria-label = Còdici QR

## PairSuccess - a view which displays  on successful completion of the device pairing process

pair-success-header-2 = Dispusitivu cullijatu
pair-success-message-2 = L’accucchiamentu arriniscìu.

## SuppAllow page - Part of the device pairing flow
## Users see this page when they have started to pair a second (or more) device to their account
## The pairing must be confirmed from both devices to succeed

# Strings within the <span> elements appear as a subheading.
# Variable $email is the user's email address
pair-supp-allow-heading-text = Cunferma l’accucchiamentu <span>pi { $email }</span>
pair-supp-allow-confirm-button = Cunferma l’accucchiamentu
pair-supp-allow-cancel-link = Sfai

## WaitForAuth page - Part of the devide pairing flow
## Users see this page when they have started to pair a second (or more) device to their account
## The pairing must be approved from both devices to succeed

# The "other device" is non-specific and could be a desktop computer, laptop, tablet, mobile phone, etc.
# Strings within the <span> elements appear as a subheading.
pair-wait-for-auth-heading-text = È nicissariu chi approvi <span>di l’autru dispusitivu</span>

## PairUnsupported - a view which is shown when the user tries to scan the pairing QR code any way other than through a Firefox app

pair-unsupported-header = Accucchia usannu n’app
pair-unsupported-message = Usasti a fotucàmmira di sistema? Hâ fari l’accucchiamentu di n’app { -brand-firefox }.

## ThirdPartyAuthCallback Page
## This page is called after a user completes the third party authentication flow from Google or Apple.

third-party-auth-callback-message = Pi favuri aspetta, ti stamu rinnirizzannu a l’applicazzioni auturizzata.

## AccountRecoveryConfirmKey page

account-recovery-confirm-key-heading = Metti a to chiavi di ricùpiru dû cuntu
account-recovery-confirm-key-instruction = Sta chiavi ricupigghia i to dati crittati di navicazzioni, a tipu chiavi e nzingalibbra, dî sirbura { -brand-firefox }.
# Prompts the user to enter their account recovery key
# Account recovery key contains a mix of letters and numbers, no special characters
account-recovery-confirm-key-input-label =
    .label = Metti a to chiavi di ricùpiru dû cuntu di 32 caràttari.
# When setting up an account recovery key, users have the option of storing an account recovery key hint that is shown during password reset
account-recovery-confirm-key-hint = U to suggirimentu pi l’archiviu è:
# Clicking this button checks if the recovery key provided by the user is correct and associated with their account
account-recovery-confirm-key-button-2 = Cuntinua
# Link that leads to the password reset page (without recovery code)
account-recovery-lost-recovery-key-link-2 = Nun po’ attruvari a chiavi di ricùpiru dû cuntu?

## CompleteResetPassword component
## User followed a password reset link and is now prompted to create a new password

complete-reset-pw-header-v2 = Crìa na chiavi nova
# A new password was successfully set for the user's account
# Displayed in an alert bar
complete-reset-password-success-alert = Chiavi mpustata
# An error occurred while attempting to set a new password (password reset flow)
# Displayed in an alert bar
complete-reset-password-error-alert = Ni dispiaci, cci fu un prubblema mentri chi mpustava a to chiavi
# Link to go back and use an account recovery key before resetting the password
complete-reset-pw-recovery-key-link = Usa na chiavi di ricùpiru dû cuntu
# A message informing the user that the password reset was successful and reminding them to create another recovery key
# Displayed on the sign in page
reset-password-complete-banner-heading = Risittasti a to chiavi.
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
complete-reset-password-desktop-relay = Doppu chi trasisti, { -brand-firefox } prova a mannàriti arrè â pàggina p’usari nu nnirizzu di posta elittrònica mascaratu.

# ConfirmBackupCodeResetPassword page

confirm-backup-code-reset-password-input-label = Metti u còdici di 10 caràttari

## Confirm Reset Password With Code

confirm-reset-password-with-code-heading = Cuntrolla a to posta elittrònica
# Text within span appears in bold
# $email - email address for which a password reset was requested
confirm-reset-password-with-code-instruction = Mannammu un còdici di cunferma a <span>{ $email }</span>.
# Shown above a group of 8 single-digit input boxes
# Only numbers allowed
confirm-reset-password-code-input-group-label = Metti un còdici di 8 cifri prima di 10 minuti
# Clicking the button submits and verifies the code
# If succesful, continues to the next step of the password reset
confirm-reset-password-otp-submit-button = Cuntinua
# Button to request a new reset password confirmation code
confirm-reset-password-otp-resend-code-button = Manna arrè u còdici
# Link to cancel the password reset and sign in with a different account
confirm-reset-password-otp-different-account-link = Usa n’autru cuntu

## PasswordResetConfirmTotp Page

confirm-totp-reset-password-header = Risetta a to chiavi
confirm-totp-reset-password-subheader-v2 = Metti u còdici d’autinticazzioni a du’ fattura
confirm-totp-reset-password-instruction-v2 = Cuntrolla a to <strong>app d’autinticazzioni</strong> pi risittari a to chiavi.
confirm-totp-reset-password-trouble-code = Ài prubblemi a mèttiri u còdici?
confirm-totp-reset-password-confirm-button = Cunferma
confirm-totp-reset-password-input-label-v2 = Metti u còdici di 6 cifri
confirm-totp-reset-password-use-different-account = Usa n’autru cuntu

## ResetPassword start page

password-reset-flow-heading = Risetta a to chiavi
password-reset-body-2 = T’addumannamu na para di cosi chi sai sulu tu pi prutèggiri u to cuntu.
password-reset-email-input =
    .label = Metti u to nnirizzu di posta elittrònica
password-reset-submit-button-2 = Cuntinua

## ResetPasswordConfirmed

reset-password-complete-header = A chiavi fu risittata
# $serviceName is a product name such as Monitor, Relay
reset-password-confirmed-cta = Cuntinua nne { $serviceName }

## ResetPasswordRecoveryPhone page

reset-password-with-recovery-key-verified-page-title = U risettu dâ chiavi jìu bonu
reset-password-complete-new-password-saved = A chiavi nova fu sarbata!
reset-password-complete-recovery-key-created = Criasti na chiavi di ricùpiru dû cuntu. Scàrricala e sàrbala sùbbitu.
reset-password-complete-recovery-key-download-info = Sta chiavi è essinziali pi ricupigghiari i to dati si ti scordi a chiavi. <b>Scàrricala e sàrbala sùbbitu, picchì nun è pussìbbili turnari arrè a sta pàggina</b>.

## CompleteSignin component

# This is a label that precedes any error which could arise from trying to validate the user's signin
error-label = Erruri:
# This is a message that is shown to users along with a "Loading" spinner while the site tries to check their signin
validating-signin = Staju cunfirmannu a trasuta…
# Shown above an error banner (e.g., invalid confirmation code, unexpected error)
complete-signin-error-header = Erruri di cunferma
# The user followed a signin confirmation link, but that link is expired and no longer valid
signin-link-expired-header = A lijami di cunferma scadìu
signin-link-expired-message-2 = A lijami chi ammaccasti scadìu o già fu usata.

## Signin page

# Strings within the <span> elements appear as a subheading.
signin-password-needed-header-2 = Metti a chiavi <span>pû to { -product-mozilla-account }</span>
# $serviceName - the name of the service which the user authenticating for
# For languages structured like English, the phrase can read "to continue to { $serviceName }"
signin-subheader-without-logo-with-servicename = Cuntinua nne { $serviceName }
signin-subheader-without-logo-default = Cuntinua ê mpustazzioni dû cuntu
signin-button = Trasi
signin-header = Trasi
signin-use-a-different-account-link = Usa n’autru cuntu
signin-forgot-password-link = Ti scurdasti a chiavi?
signin-password-button-label = Chiavi
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-desktop-relay = Doppu chi trasisti, { -brand-firefox } prova a mannàriti arrè â pàggina p’usari nu nnirizzu di posta elittrònica mascaratu.

## ReportSignin Page
## When users receive an "Is this you signing in?" email with an unblock code,
## they can click "report it to us" if they did not attempt to sign in.
## This will be the page shown to users to block the sign in and report it.

report-signin-link-damaged-body = Â lijami chi ammaccasti ci ammancàvanu caràttari, e capaci chi fu rumputa dû to prugramma di posta elittròncia. Copia u nnirizzu stannu accura, e torna a prova.
report-signin-header = Vo’ signalijari na trasuta nun auturizzata?
report-signin-body = Ricivisti n’e-mail supra ôn tintativu di tràsiri nnô to cuntu. Vo’ signalijari st’attività comu suspetta?
report-signin-submit-button = Signalija attività
report-signin-support-link = Chi sta mmattennu?
report-signin-error = Ni dispiaci, cci fu un prubblema mentri chi mannava a signalijazzioni.
signin-bounced-header = Ni dispiaci. Bluccammu u to cuntu.
# $email (string) - The user's email.
signin-bounced-message = L’e-mail di cunferma chi mannammu a { $email } turnau nn’arrè e bluccammu u to cuntu pi prutèggiri i to dati di { -brand-firefox }.
# linkExternal is button which logs the user's action and navigates them to mozilla support
signin-bounced-help = Si chistu è nu nnirizzu di posta elittrònica vàlitu, <linkExternal>fannillu sapiri</linkExternal> e t’ajutamu a sbluccari u to cuntu.
signin-bounced-create-new-account = Nun ài cchiù accessu a stu nnirizzu di posta elittrònica? Crìa un cuntu novu

## ConfirmSignupCode page
## Users see this page after they have initiated account sign up,


# and a confirmation code has been sent to their email address.

confirm-signup-code-success-alert = Cunfirmasti u cuntu
