# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.


## ButtonDownloadRecoveryKeyPDF
## Clicking on this button downloads a PDF file that contains the user's account recovery key
## The account recovery key can be used to recover data when users forget their account password

# Button to download the account recovery key as a PDF file and navigate to the next step
# The next (and final) step is an optional prompt to save a storage hint
# .title will displayed as a tooltip on the button
recovery-key-download-button-v3 = Laadi alla ja jätka
    .title = Laadi alla ja jätka
recovery-key-pdf-heading = Konto taastevõti
# Shown directly above recovery key value and preceeded by a key icon
recovery-key-pdf-key-legend = Konto taastevõti
# Instructions in the text file to prompt the user to keep this information in a secure, easy to remember location.
# Password resets without this account recovery key can result in data loss.
# "key" here refers to "account recovery key"
recovery-key-pdf-instructions = See võti võimaldab sul parooli unustamisel taastada krüptitud brauseriandmed (sh paroolid, järjehoidjad ja ajaloo). Hoia seda kohas, mida mäletad.
# This heading is shown above a list of options for storing the account recovery key
# "key" here refers to "account recovery key"
recovery-key-pdf-storage-ideas-heading = Kohad võtme hoidmiseks
# Followed by a link (https://mzl.la/3bNrM1I) to get more information and support
recovery-key-pdf-support = Rohkem teavet konto taastevõtmest

## Tooltip notifications for actions performed on account recovery keys or one-time use codes

datablock-download =
    .message = Alla laaditud
datablock-copy =
    .message = Kopeeritud
datablock-print =
    .message = Prinditud

## InlineRecoveryKeySetupCreate component
## Users see this view when we prompt them to generate an account recovery key
## after signing in.

inline-recovery-key-setup-info = Loo konto taastevõti, et saaksid sünkroonitud sirvimisandmed taastada, kui peaksid parooli unustama.
inline-recovery-key-setup-start-button = Loo konto taastevõti

## Input Password

# Tooltip displayed on a password input visibility toggle. Expresses the toggle action, where clicking on the toggle will hide the password.
input-password-hide = Peida parool
# Tooltip displayed on a password input visibility toggle. Expresses the toggle action, where clicking on the toggle will show the password.
input-password-show = Kuva parooli

## Notification Promo Banner component

account-recovery-notification-cta = Loo
account-recovery-notification-header-value = Ära kaota oma andmeid, kui unustad parooli

## Users see this view when they are generating a new account recovery key
## This screen displays the generated key and allows users to download or copy the key

# This heading is shown above a list of options for storing the account recovery key
# "key" here refers to "account recovery key"
flow-recovery-key-download-storage-ideas-heading-v2 = Kohad võtme hoidmiseks:
flow-recovery-key-download-storage-ideas-folder-v2 = Kaust turvalises seadmes
flow-recovery-key-download-storage-ideas-cloud = Usaldusväärne pilveteenus
flow-recovery-key-download-storage-ideas-print-v2 = Trükitud füüsiline koopia
flow-recovery-key-download-storage-ideas-pwd-manager = Paroolihaldur

## RecoveryKeySetupHint
## This is the final step in the account recovery key creation flow after a Sync signin or in account settings
## Prompts the user to save an (optional) storage hint about the location of their account recovery key.

# The header of the last step in the account recovery key creation flow
# "key" here refers to the "account recovery key"
flow-recovery-key-hint-header-v2 = Lisa vihje võtme leidmiseks
# This message explains why saving a storage hint can be helpful. The account recovery key could be "stored" in a physical (e.g., printed) or virtual location (e.g., in a device folder or in the cloud).
# "it" here refers to the storage hint, NOT the "account recovery key"
flow-recovery-key-hint-message-v3 = Vihje peaks aitama sul meeles pidada, kuhu konto taastevõtme salvestasid. Saame seda sulle parooli lähtestamise ajal näidata, et sinu andmed taastada.

## Alert Bar

alert-bar-close-message = Sulge teade

## User's avatar

avatar-your-avatar =
    .alt = Sinu avatar
avatar-default-avatar =
    .alt = Vaikimisi avatar

##


# BentoMenu component

bento-menu-firefox-desktop = { -brand-firefox }i brauser töölauale
bento-menu-firefox-mobile = { -brand-firefox }i brauser mobiilile
bento-menu-made-by-mozilla = Loodud { -brand-mozilla } poolt

## Connect another device promo

connect-another-fx-mobile = Hangi { -brand-firefox } mobiilile või tahvlile

## Connected services section

cs-heading = Ühendatud teenused
cs-description = Kõik, mida kasutad ja kuhu oled sisse loginud.
cs-cannot-refresh =
    Vabandust, ühendatud seadmete nimekirja värskendamisel
    esines probleem.
cs-cannot-disconnect = Klienti ei leitud, polnud võimalik ühendust katkestada
# This string is used in a notification message near the top of the page.
# Variables:
#   $service (String) - the name of a device or service that uses Mozilla accounts
#                       (for example: "Firefox Lockwise")
cs-logged-out-2 = Välja logitud teenusest { $service }
cs-refresh-button =
    .title = Uuenda ühendatud seadmete nimekirja
# Link text to a support page on missing or duplicate devices
cs-missing-device-help = Puuduvad või topeltkirjed?
cs-disconnect-sync-heading = Ühenda Syncist lahti

## The following are the options for selecting a reason for disconnecting the
## device

cs-disconnect-sync-opt-prefix = Seade on:
cs-disconnect-sync-opt-suspicious = kahtlane
cs-disconnect-sync-opt-lost = kadunud või varastatud
cs-disconnect-sync-opt-old = vana või asendatud
cs-disconnect-sync-opt-duplicate = korduv
cs-disconnect-sync-opt-not-say = ei soovi öelda

##

cs-disconnect-advice-confirm = Olgu, sain aru
cs-disconnect-lost-advice-heading = Kaotatud või varastatud seade on lahti ühendatud
cs-disconnect-suspicious-advice-heading = Kahtlane seade on lahti ühendatud
cs-sign-out-button = Logi välja

## Data collection section

dc-heading = Andmete kogumine ja kasutamine
dc-subheader-ff-browser = { -brand-firefox }i veebilehitseja
dc-subheader-content-2 = Teenusel { -product-mozilla-accounts } lubatakse saata tehnilisi ja interaktsiooniandmeid { -brand-mozilla }le.
dc-subheader-ff-content = { -brand-firefox }i veebilehitseja tehniliste ja interaktsiooniandmete sätete ülevaatamiseks või värskendamiseks ava { -brand-firefox }I seaded ja liigu Privaatsus ja turvalisus juurde.
dc-opt-out-success-2 = Loobumine õnnestus. Teenus { -product-mozilla-accounts }ei saada enam tehnilisi ja interaktsiooniandmeid { -brand-mozilla }le.
dc-opt-in-success-2 = Täname! Nende andmete jagamine aitab meil teenust { -product-mozilla-accounts } paremaks teha.
dc-opt-in-out-error-2 = Vabandust, kahjuks esines andmete kogumise eelistuste muutmisel probleem
dc-learn-more = Rohkem teavet

# DropDownAvatarMenu component

# This is displayed in the Settings menu after user's click on their profile icon.
# Following this string on a new line will be their display name (user's name or email)
drop-down-menu-signed-in-as-v2 = Sisse logitud kasutajana
drop-down-menu-sign-out = Logi välja
drop-down-menu-sign-out-error-2 = Vabandust, väljalogimisel esines probleem

## Flow Container

flow-container-back = Tagasi

## FlowRecoveryKeyConfirmPwd - Second view in the PageRecoveryKeyCreate flow
## Users see this view when they are generating a new account recovery key
## This screen asks the user to confirm their password before generating a new key

flow-recovery-key-confirm-pwd-heading-v2 = Turvalisuse huvides sisesta parool uuesti
flow-recovery-key-confirm-pwd-input-label = Sisesta parool
# Clicking on this button will check the password and create an account recovery key
flow-recovery-key-confirm-pwd-submit-button = Loo konto taastevõti

## FlowRecoveryKeyDownload - Third view in the PageRecoveryKeyCreate flow
## Users see this view when they are generating a new account recovery key
## This screen displays the generated key and allows users to download or copy the key

# The "key" here refers to the term "account recovery key"
flow-recovery-key-download-info-v2 = See võti võimaldab sul parooli unustamisel taastada krüptitud brauseriandmed (sh paroolid, järjehoidjad ja ajaloo). Hoia seda kohas, mida mäletad — sa ei saa sellele lehele hiljem naasta.
# This link allows user to proceed to the next step without clicking the download button
flow-recovery-key-download-next-link-v2 = Jätka allalaadimiseta

## FlowRecoveryKeyInfo - First view in the PageRecoveryKeyCreate flow

# The header of the first view in the Recovery Key Create flow
flow-recovery-key-info-header = Loo konto taastevõti juhuks, kui parooli unustad
# The header of the first view in the Recovery Key Create flow when replacing an existing recovery key
flow-recovery-key-info-header-change-key = Konto taastevõtme muutmine
# In the first view of the PageRecoveryKeyCreate flow, this is the first of two bullet points explaining why the user should create an account recovery key
flow-recovery-key-info-shield-bullet-point-v2 = Krüpteerime sirvimisandmeid – paroole, järjehoidjaid ja muud. See on suurepäraselt privaatne, kuid parooli unustamisel võid oma andmed kaotada.
# In the first view of the PageRecoveryKeyCreate flow, this is the second of two bullet points explaining why the user should create an account recovery key
flow-recovery-key-info-key-bullet-point-v2 = Seetõttu on konto taastevõtme loomine ülioluline – saad seda kasutada andmete taastamiseks.
# The text of the "submit" button to start creating (or changing) an account recovery key
flow-recovery-key-info-cta-text-v3 = Alusta
# Link to cancel account recovery key change and return to settings
flow-recovery-key-info-cancel-link = Loobu

## HeaderLockup component, the header in account settings

header-menu-open = Sulge menüü
header-menu-closed = Saidi navigeerimismenüü
header-back-to-top-link =
    .title = Tagasi üles
header-help = Abi

## Linked Accounts section

la-heading = Lingitud kontod
la-description = Sa oled lubanud ligipääsu järgmistele kontodele.
la-unlink-button = Katkesta ühendus
la-unlink-account-button = Katkesta ühendus
la-unlink-heading = Katkesta ühendus kolmanda osapoole kontoga
la-unlink-content-3 = Kas oled kindel, et soovid kontoga ühenduse katkestada? Konto lahti ühendamine ei logi sind automaatselt ühendatud teenustest välja.Välja logimiseks pead sa seda tegema ühendatud teenuste sektsioonis käsitsi.
nav-linked-accounts = { la-heading }

## Modal - Default values for a message directed at the user where the user can typically Confirm or Cancel.

modal-close-title = Sulge
modal-cancel-button = Loobu

## Modal Verify Session

msv-cancel-button = Loobu

## Settings Nav

nav-settings = Sätted
nav-profile = Profiil
nav-security = Turvalisus
nav-connected-services = Ühendatud teenused
nav-data-collection = Andmete kogumine ja kasutamine
nav-paid-subs = Tasulised tellimused
nav-email-comm = E-kirjavahetus

## Avatar change page

avatar-page-title =
    .title = Profiilipilt
avatar-page-add-photo = Lisa foto
avatar-page-add-photo-button =
    .title = { avatar-page-add-photo }
avatar-page-take-photo = Tee pilt
avatar-page-take-photo-button =
    .title = { avatar-page-take-photo }
avatar-page-remove-photo = Eemalda foto
avatar-page-remove-photo-button =
    .title = { avatar-page-remove-photo }
avatar-page-retake-photo = Tee uus pilt
avatar-page-cancel-button = Loobu
avatar-page-save-button = Salvesta
avatar-page-saving-button = Salvestamine…
avatar-page-zoom-out-button =
    .title = Vähenda
avatar-page-zoom-in-button =
    .title = Suurenda
avatar-page-rotate-button =
    .title = Pööra
avatar-page-camera-error = Kaamera kasutamine polnud võimalik
avatar-page-new-avatar =
    .alt = uus profiilipilt
avatar-page-file-upload-error-3 = Profiilipildi üleslaadimisel esines probleem
avatar-page-delete-error-3 = Profiilipildi kustutamisel esines probleem
avatar-page-image-too-large-error-2 = Pildifaili suurus on üleslaadimiseks liiga suur

## Password change page

pw-change-header =
    .title = Parooli muutmine
pw-8-chars = Vähemalt 8 tähemärki
pw-not-email = Pole sinu e-posti aadress
pw-change-must-match = Uus parool ja selle kinnitus ühtivad
pw-commonly-used = Pole sageli kasutatav parool
# linkExternal is a link to a mozilla.org support article on password strength
pw-tips = Ole turvaline — ära taaskasuta paroole. Vaata rohkem näpunäiteid <linkExternal>tugeva parooli loomise kohta</linkExternal>.
pw-change-cancel-button = Loobu
pw-change-save-button = Salvesta
pw-change-forgot-password-link = Unustasid parooli?
pw-change-current-password =
    .label = Sisesta praegune parool
pw-change-new-password =
    .label = Sisesta uus parool
pw-change-confirm-password =
    .label = Kinnita parool
pw-change-success-alert-2 = Parool uuendatud

## Password create page

pw-create-header =
    .title = Parooli määramine
pw-create-success-alert-2 = Parool on muudetud
pw-create-error-2 = Vabandust, parooli määramisel esines probleem

## Delete account page

delete-account-header =
    .title = Kustuta konto
delete-account-step-1-2 = Samm 1 2st
delete-account-step-2-2 = Samm 2 2st
delete-account-acknowledge = Kinnita, et oma konto kustutamisega:
delete-account-chk-box-2 =
    .label = Võid kaotada salvestatud andmed ja funktsionaalsuse { -brand-mozilla } teenustes
delete-account-chk-box-3 =
    .label = Taasaktiveerimine selle e-posti aadressiga ei pruugi taastada sinu salvestatud andmeid
delete-account-chk-box-4 =
    .label = Kõik sinu poolt saidil addons.mozilla.org avalikustatud laiendused ja teemad kustutatakse
delete-account-continue-button = Jätka
delete-account-password-input =
    .label = Sisesta parool
delete-account-cancel-button = Loobu
delete-account-delete-button-2 = Kustuta

## Display name page

display-name-page-title =
    .title = Kuvatav nimi
display-name-input =
    .label = Sisesta kuvatav nimi
submit-display-name = Salvesta
cancel-display-name = Loobu
display-name-update-error-2 = Kuvatava nime uuendamisel esines probleem
display-name-success-alert-2 = Kuvatav nimi on uuendatud

## Recent account activity
## All strings except title indicate an event that occurred from the user's account
## These are displayed as a list with the date when the event occured

recent-activity-title = Hiljutised kontotegevused

## PageRecoveryKeyCreate

# The page title displayed at the top of the flow container
recovery-key-create-page-title = Konto taastevõti

## PageRecoveryPhoneRemove
## Users reach this page from account settings when they want to remove a backup phone number.

settings-recovery-phone-remove-cancel = Loobu

## Add secondary email page

add-secondary-email-step-1 = Samm 1 2st
add-secondary-email-error-2 = Selle e-posti aadressi loomisel esines probleem
add-secondary-email-page-title =
    .title = Teine e-posti aadress
add-secondary-email-enter-address =
    .label = Sisesta e-posti aadress
add-secondary-email-cancel-button = Loobu
add-secondary-email-save-button = Salvesta

## Verify secondary email page

add-secondary-email-step-2 = Samm 2 2st
verify-secondary-email-page-title =
    .title = Teine e-posti aadress
verify-secondary-email-cancel-button = Loobu
# This string is a confirmation message shown after verifying an email.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
verify-secondary-email-success-alert-2 = { $email } edukalt lisatud

##

# Link to delete account on main Settings page
delete-account-link = Kustuta konto

## Profile section

profile-heading = Profiil
profile-picture =
    .header = Pilt
profile-display-name =
    .header = Kuvatav nimi
profile-primary-email =
    .header = Peamine e-posti aadress

## Security section of Setting

security-heading = Turvalisus
security-password =
    .header = Parool
# This is a string that shows when the user's password was created.
# Variables:
#   $date (String) - a localized date and time string
security-password-created-date = Loodud { $date }
security-not-set = Pole määratud
security-action-create = Loo
security-set-password = Sünkroniseerimiseks ja teatud konto turvafunktsioonide kasutamiseks määra parool.
# Link opens a list of recent account activity (e.g., login attempts, password changes, etc.)
security-recent-activity-link = Vaata hiljutisi kontotegevusi

## SubRow component

# button to change the configured recovery phone
tfa-row-backup-phone-change-cta = Muuda

## Switch component

# Used as "title" attribute when the switch is "on" and interaction turns the switch to "off"
switch-turn-off = Lülita välja
# Used as "title" attribute when the switch is "off" and interaction turns the switch to "on"
switch-turn-on = Lülita sisse
# Used as "title" attribute when switch has been interacted with and form is submitting
switch-submitting = Saatmine…
switch-is-on = sees
switch-is-off = väljas

## Sub-section row Defaults

row-defaults-action-add = Lisa
row-defaults-action-change = Muuda
row-defaults-action-disable = Keela
row-defaults-status = Puudub

## Account recovery key sub-section on main Settings page

rk-header-1 = Konto taastevõti
rk-enabled = Lubatud
rk-not-set = Pole määratud
rk-action-create = Loo
# Button to delete the existing account recovery key and create a new one
rk-action-change-button = Muuda
rk-action-remove = Eemalda
rk-key-removed-2 = Konto taastamisvõti eemaldati
rk-cannot-remove-key = Konto taastevõtit polnud võimalik eemaldada.
rk-content-explain = Taasta oma andmed, kui oled oma parooli unustanud.
rk-remove-error-2 = Konto taastevõtit polnud võimalik eemaldada

## Secondary email sub-section on main Settings page

se-heading = Teine e-posti aadress
    .header = Teine e-posti aadress
se-cannot-refresh-email = Vabandust, selle e-posti aadressi uuendamisel esines probleem.
# This string is used in a notification message near the top of the page.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
se-set-primary-successful-2 = { $email } on nüüd sinu peamine e-posti aadress
se-set-primary-error-2 = Vabandust, peamise e-posti aadressi uuendamisel esines probleem
# This string is used in a notification message near the top of the page.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
se-delete-email-successful-2 = { $email } on edukalt kustutatud
se-delete-email-error-2 = Vabandust, selle e-posti aadressi kustutamisel esines probleem
# Button to remove the secondary email
se-remove-email =
    .title = Eemalda e-posti aadress
# Button to refresh secondary email status
se-refresh-email =
    .title = Uuenda e-posti aadressi
# Button to make secondary email the primary
se-make-primary = Määra peamiseks
se-default-content = Pääse ligi oma kontole, kui sa ei saa kasutada oma peamist e-posti aadressi.
se-content-note-1 = Märkus: teist e-posti aadressi pole võimalik kasutada andmete taastamiseks — selleks vajad<a>konto taastevõtit</a>.
# Default value for the secondary email
se-secondary-email-none = Puudub

## Two Step Auth sub-section on Settings main page

tfa-row-header = Kaheastmeline autentimine
tfa-row-enabled = Lubatud
tfa-row-disabled-status = Keelatud
tfa-row-action-add = Lisa
tfa-row-action-disable = Keela
tfa-row-button-refresh =
    .title = Uuenda kaheastmelist autentmist
tfa-row-cannot-refresh =
    Vabandust, kaheastmelise autentimise uuendamisel
    esines probleem.
tfa-row-disabled-description-v2 = Aita kontot turvalisena hoida, kasutades sisselogimise teise sammuna kolmanda osapoole autentimisrakendust.
tfa-row-disable-modal-heading = Kas keelata kaheastmeline autentimine?
tfa-row-disable-modal-confirm = Keela
# Shown in an alert bar after two-step authentication is disabled
tfa-row-disabled-2 = Kaheastmeline autentimine keelati
tfa-row-cannot-disable-2 = Kaheastmelist autentimist polnud võimalik keelata

## Auth-server based errors that originate from backend service

auth-error-102 = Tundmatu konto
auth-error-103 = Vigane parool
auth-error-110 = Vigane turvatõend
# This string is the amount of time required before a user can attempt another request.
# Variables:
#   $retryAfter (String) - Time required before retrying a request. The variable is localized by our
#                          formatting library (momentjs) as a "time from now" and automatically includes
#                          the prefix as required by the current locale (for example, "in 15 minutes", "dans 15 minutes").
auth-error-114 = Proovisid liiga palju. Proovi uuesti { $retryAfter }.
auth-error-139 = Teine e-posti aadress peab erinema konto peamisest e-posti aadressist.
auth-error-155 = TOTP-turvatõendit ei leitud
auth-error-1008 = Vana ja uus parool peavad erinema

## Index / home page

# When users delete their Mozilla account inside account Settings, they are redirected to this page with a success message
index-account-delete-success = Konto kustutati edukalt

## Pair index page

# This initiates the pairing process, usually by directing the user to the `about:preferences` page in Firefox
pair-get-started-button = Alusta

## SuppAllow page - Part of the device pairing flow
## Users see this page when they have started to pair a second (or more) device to their account
## The pairing must be confirmed from both devices to succeed

pair-supp-allow-cancel-link = Loobu

## ResetPasswordRecoveryPhone page

reset-password-complete-recovery-key-created = Uus konto taastevõti on loodud. Laadi see kohe alla ja salvesta.
