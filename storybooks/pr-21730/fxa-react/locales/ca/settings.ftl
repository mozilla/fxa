# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.


## Banner component

resend-code-success-banner-heading = S'ha enviat un codi nou al vostre correu electrònic.
resend-link-success-banner-heading = S'ha enviat un enllaç nou al vostre correu electrònic.
# $accountsEmail is the Mozilla accounts sender email address (e.g. accounts@firefox.com)
resend-success-banner-description = Afegiu { $accountsEmail } als vostres contactes per a garantir un lliurament sense problemes.

## Brand Messaging component
## Used to show in product messaging about upcoming brand changes

# This aria-label applies to the dismiss/close button of the banner
# This text is for screen-readers
brand-banner-dismiss-button-2 =
    .aria-label = Tanca el bàner
# This message is displayed as the title element in the banner, prior to actually launching the new brand
brand-prelaunch-title = Els { -product-firefox-accounts } canviaran el nom a { -product-mozilla-accounts } l'1 de novembre
# This is an extra link element, that directs users to a page where they can learn more about the branding changes.
brand-learn-more = Més informació
# Alt text for close banner image
brand-close-banner =
    .alt = Tanca el bàner
# Alt text for 'm' logo in banner header
brand-m-logo =
    .alt = Logotip m de { -brand-mozilla }

## ButtonBack component
## Allows users to click a back arrow to navigate to the previous page

button-back-aria-label = Enrere
button-back-title = Enrere

## ButtonDownloadRecoveryKey
## Clicking on this button downloads a plain text file that contains the user's account recovery key
## The account recovery key can be used to recover data when users forget their account password

# Button to download the account recovery key as a plain text file and navigate to the next step
# The next (and final) step is an optional prompt to save a storage hint
recovery-key-download-button-v4 = Baixa i continua

## ButtonPasskeySignin

# This is a loading state indicating that we are waiting for the user to
# interact with their authenticator to approve the sign-in. They should see a
# device prompt/pop-up with authentication options (or message indicating that
# no passkeys are available).
button-passkey-signin-loading = S'està iniciant la sessió de manera segura...

## ChooseNewsletters component
## Checklist of newsletters that the user can choose to sign up to

# Prompt above a checklist of newsletters
choose-newsletters-prompt-2 = Obteniu més de { -brand-mozilla }:

## Dark mode toggle

dark-mode-toggle-light = Clar
dark-mode-toggle-dark = Fosc
dark-mode-toggle-system = Sistema
dark-mode-toggle-label = Canvia el tema

## Tooltip notifications for actions performed on account recovery keys or one-time use codes

datablock-download =
    .message = S'ha baixat
datablock-copy =
    .message = S'ha copiat
datablock-print =
    .message = S'ha imprès

## Success banners for datablock actions.
## $count – number of codes

datablock-copy-success =
    { $count ->
        [one] S'ha copiat el codi
       *[other] S'han copiat els codis
    }
datablock-download-success =
    { $count ->
        [one] S'ha baixat el codi
       *[other] S'han baixat els codis
    }
datablock-print-success =
    { $count ->
        [one] S'ha imprés el codi
       *[other] S'han imprès els codis
    }

##

# Tooltip notification when an account recovery key or one-time use code is copied.
datablock-inline-copy =
    .message = S'ha copiat

## DeviceInfoBlock component
## The strings here are used to display information about the origin of activity happening on a user's account
## For example, when connecting another device to the user's account

# Variables { $city }, { $region }, { $country } represent the estimated location of the user's device
# For example, 'Vancouver, British Columbia, Canada (estimated)'
device-info-block-location-city-region-country = { $city }, { $region }, { $country } (estimació)
# Variables { $region }, { $country } represent the estimated location of the user's device
# For example, 'British Columbia, Canada (estimated)'
device-info-block-location-region-country = { $region }, { $country } (estimació)
# Variables { $city }, { $country } represent the estimated location of the user's device
# For example, 'Vancouver, Canada (estimated)'
device-info-block-location-city-country = { $city }, { $country } (estimació)
# Variable { $country } represent the estimated location of the user's device
# For example, 'Canada (estimated)'
device-info-block-location-country = { $country } (estimació)
# When an approximate location for the user's device could not be determined
device-info-block-location-unknown = Ubicació desconeguda
# Variable { $browserName } is the browser that created the request (e.g., Firefox)
# Variable { $genericOSName } is the name of the operating system that created the request (e.g., MacOS, Windows, iOS)
device-info-browser-os = { $browserName } en { $genericOSName }
# Variable { $browserName } is the browser that created the request (e.g., Firefox)
# Variable { $deviceName } is the user-chosen name of the device that created the request (e.g., Laurel's MacBook Pro)
device-info-browser-device = { $browserName } en { $deviceName }
# Variable { $ipAddress } represents the IP address where the request originated
# The IP address is a string of numbers separated by periods (e.g., 192.158.1.38)
device-info-ip-address = Adreça IP: { $ipAddress }

## Firefox Promo Banner component
## Shown at the top of settings to promote installing Firefox on mobile (when
## the user is on Firefox) or switching to Firefox (on other browsers).

firefox-promo-banner-switch-cta = Canvieu al { -brand-firefox }

## FormPasswordInlineCriteria

form-password-with-inline-criteria-signup-new-password-label =
    .label = Contrasenya
form-password-with-inline-criteria-signup-confirm-password-label =
    .label = Repetiu la contrasenya
form-password-with-inline-criteria-signup-submit-button = Crea un compte
form-password-with-inline-criteria-reset-new-password =
    .label = Contrasenya nova
form-password-with-inline-criteria-confirm-password =
    .label = Confirma la contrasenya
form-password-with-inline-criteria-reset-submit-button = Crea una contrasenya nova
form-password-with-inline-criteria-old-password-label =
    .label = Contrasenya antiga
form-password-with-inline-criteria-change-password-submit-button = Canvia la contrasenya
form-password-with-inline-criteria-set-password-new-password-label =
    .label = Contrasenya
form-password-with-inline-criteria-set-password-confirm-password-label =
    .label = Repetiu la contrasenya
form-password-with-inline-criteria-set-password-submit-button = Inicia la sincronització
form-password-with-inline-criteria-match-error = Les contrasenyes no coincideixen
form-password-with-inline-criteria-sr-too-short-message = La contrasenya ha de tenir almenys 8 caràcters.
form-password-with-inline-criteria-sr-not-email-message = La contrasenya no pot contenir la vostra adreça electrònica.
form-password-with-inline-criteria-sr-not-common-message = La contrasenya no pot ser una contrasenya d'ús comú.
form-password-with-inline-criteria-sr-requirements-met = La contrasenya introduïda respecta tots els requisits de contrasenya.
form-password-with-inline-criteria-sr-passwords-match = Les contrasenyes introduïdes coincideixen.

## FormVerifyCode

# Fallback default localized error message for empty input field
form-verify-code-default-error = Aquest camp és obligatori

## FormVerifyTotp component
## Form to enter a time-based one-time-passcode (e.g., 6-digit numeric code or 8-digit alphanumeric code)

# Information explaining why button is disabled, also read to screen readers
# Submit button is disabled unless a valid code format is entered
# Used when the code may only contain numbers
# $codeLength : number of digits in a valid code
form-verify-totp-disabled-button-title-numeric = Introduïu el codi de { $codeLength } dígits per a continuar
# Information explaining why button is disabled, also read to screen readers
# Submit button is disabled unless a valid code format is entered
# Used when the code may contain numbers and/or letters
# $codeLength : number of characters in a valid code
form-verify-totp-disabled-button-title-alphanumeric = Introduïu el codi de { $codeLength } caràcters per a continuar
get-data-trio-title-firefox = { -brand-firefox }
get-data-trio-title-firefox-recovery-key = Clau de recuperació del compte del { -brand-firefox }
get-data-trio-title-backup-verification-codes = Codis d'autenticació de recuperació
get-data-trio-download-2 =
    .aria-label = Baixa
    .title = Baixa
get-data-trio-copy-2 =
    .aria-label = Copia
    .title = Copia
get-data-trio-print-2 =
    .aria-label = Imprimeix
    .title = Imprimeix

## Images - these are all aria labels used for illustrations
## Aria labels are used as alternate text that can be read aloud by screen readers.

# Aria-label option for an alert symbol
alert-icon-aria-label =
    .aria-label = Alerta
# Aria-label option for an alert symbol
icon-attention-aria-label =
    .aria-label = Atenció
# Aria-label option for an alert symbol
icon-warning-aria-label =
    .aria-label = Avís
authenticator-app-aria-label =
    .aria-label = Aplicació d'autenticació
# An icon of phone with text message. A back recovery phone number
backup-recovery-sms-icon-aria-label =
    .aria-label = SMS de recuperació activat
# Disabled version of backup-recovery-sms-icon-aria-label
backup-recovery-sms-disabled-icon-aria-label =
    .aria-label = SMS de recuperació desactivat
# Used to select Canada as country code for phone number
canadian-flag-icon-aria-label =
    .aria-label = Bandera canadenca
# Used to  indicate a general checkmark, as in something checked off in a list!
checkmark-icon-aria-label =
    .aria-label = Marca
# Used to  indicate a check mark for a successful state/action
checkmark-success-icon-aria-label =
    .aria-label = Correcte
# Used on X icon to dismiss a message such as an alert or banner
close-icon-aria-label =
    .aria-label = Tanca el missatge
# Used to decorate a code you enter for verification purposes
code-icon-aria-label =
    .aria-label = Codi
# Used to decorate an edit or rename control
edit-icon-aria-label =
    .aria-label = Edita
error-icon-aria-label =
    .aria-label = Error
# Used as information icon for informative messaging
info-icon-aria-label =
    .aria-label = Informació
# Used to select United States as a country code for phone number
usa-flag-icon-aria-label =
    .aria-label = Bandera dels Estats Units
# Used for loading arrow icon
icon-loading-arrow-aria-label =
    .aria-label = S'està carregant
signin-recovery-code-image-description =
    .aria-label = Document que conté text ocult.
signin-totp-code-image-label =
    .aria-label = Un dispositiu amb un codi de 6 dígits ocult.
confirm-signup-aria-label =
    .aria-label = Un sobre que conté un enllaç
# Used for an image of a key on a shield surrounded by 5 other icons representing information that can be recovered with the account recovery key.
# Other icons and their meaning: Gear (settings), star (favorites), clock (history), magnifying glass (search) and lock (passwords).
security-shield-aria-label =
    .aria-label = Il·lustració per a representar una clau de recuperació del compte.
# Used for an image of a single key.
recovery-key-image-aria-label =
    .aria-label = Il·lustració per a representar una clau de recuperació del compte.
password-image-aria-label =
    .aria-label = Una il·lustració per a representar l'escriptura d'una contrasenya.
# Aria label for the Firefox logo and wordmark shown together as a brand lockup
firefox-wordmark-image-aria-label =
    .aria-label = Logotip del { -brand-firefox }

## InlineRecoveryKeySetupCreate component
## Users see this view when we prompt them to generate an account recovery key
## after signing in.

inline-recovery-key-setup-signed-in-firefox-2 = Heu iniciat la sessió al { -brand-firefox }.
inline-recovery-key-setup-create-header = Protegiu el vostre compte
# This is a subheader asking users to create an account recovery key, indicating it will only take a moment to complete.
inline-recovery-key-setup-create-subheader = Teniu un minut per a protegir les vostres dades?

## Input Password

# Tooltip displayed on a password input visibility toggle. Expresses the toggle action, where clicking on the toggle will hide the password.
input-password-hide = Amaga la contrasenya
# Tooltip displayed on a password input visibility toggle. Expresses the toggle action, where clicking on the toggle will show the password.
input-password-show = Mostra la contrasenya

## Locale Toggle Component

locale-toggle-select-label = Trieu una llengua
locale-toggle-browser-default = Opció per defecte del navegador
# Users will see this heading when the URL or network request is malformed, e.g. a query parameter is required and is invalid
error-bad-request = Sol·licitud incorrecta

## PairUnsupportedHint - Part of the desktop-to-mobile pairing flow
## Users see this on their mobile device when they open the pairing link
## outside the Firefox app. It tells them how to finish pairing in Firefox.

# Shown first when the page is open inside another app, which the user must close
pair-unsupported-hint-step-close-page = Tanca aquesta pàgina
# <b> emphasises the name of the button the user taps in Firefox
pair-unsupported-hint-step-app-menu = Toca el <b>menú de l'aplicació</b>
# Opens a Mozilla support article about connecting a device without a QR code
pair-unsupported-hint-learn-more-link = Més informació

## Alert Bar

alert-bar-close-message = Tanca el missatge

## User's avatar

avatar-your-avatar =
    .alt = El vostre avatar
avatar-default-avatar =
    .alt = Avatar per defecte

##

bento-menu-title-3 = Productes de { -brand-mozilla }
bento-menu-vpn-2 = { -product-mozilla-vpn }
bento-menu-monitor-3 = { -product-mozilla-monitor }
bento-menu-firefox-relay-2 = { -product-firefox-relay }
bento-menu-firefox-desktop = Navegador { -brand-firefox } per a l'escriptori
bento-menu-firefox-mobile = Navegador { -brand-firefox } per al mòbil
bento-menu-made-by-mozilla = Creat per { -brand-mozilla }

## Connect another device promo

connect-another-fx-mobile = Obteniu el { -brand-firefox } per a mòbils o tauletes

## Connected services section

cs-heading = Serveis connectats
cs-description = Tots els serveis que utilitzeu i en els quals heu iniciat la sessió.
cs-cannot-refresh = Hi ha hagut un problema en actualitzar la llista de serveis connectats.
cs-cannot-disconnect = No s'ha trobat el client; no s'ha pogut desconnectar
# This string is used in a notification message near the top of the page.
# Variables:
#   $service (String) - the name of a device or service that uses Mozilla accounts
#                       (for example: "Firefox Lockwise")
cs-logged-out-2 = S'ha tancat la sessió del { $service }
cs-refresh-button =
    .title = Actualitza els serveis connectats
# Link text to a support page on missing or duplicate devices
cs-missing-device-help = Hi ha elements duplicats o que falten?
cs-disconnect-sync-heading = Desconnecta del Sync

## The following are the options for selecting a reason for disconnecting the
## device

cs-disconnect-sync-opt-prefix = Aquest dispositiu és:
cs-disconnect-sync-opt-suspicious = Sospitós
cs-disconnect-sync-opt-lost = Perdut o robat
cs-disconnect-sync-opt-old = Antic o reemplaçat
cs-disconnect-sync-opt-duplicate = Duplicat
cs-disconnect-sync-opt-not-say = Prefereixo no respondre

##

cs-disconnect-advice-confirm = Entesos
cs-disconnect-lost-advice-heading = S'ha desconnectat el dispositiu perdut o robat
cs-disconnect-suspicious-advice-heading = S'ha desconnectat el dispositiu sospitós
cs-sign-out-button = Tanca la sessió

## Sub-rows shown beneath a connected browser entry to indicate which Mozilla
## services that browser is currently authorized to access via its refresh token.

# Shown as a read-only sub-row under a browser device entry to indicate that
# the device's refresh token is authorized for Firefox’s built-in VPN.
# In this context, "VPN" is a VPN service built into the Firefox browser, and
# generally isn’t localized differently than "VPN".
cs-scope-firefox-vpn = VPN integrada del { -brand-firefox }

## Data collection section

dc-heading = Ús i recollida de dades
dc-subheader-moz-accounts = { -product-mozilla-accounts(capitalization: "uppercase") }
dc-subheader-ff-browser = Navegador { -brand-firefox }
dc-learn-more = Més informació
drop-down-menu-sign-out = Tanca la sessió

## Flow Container

flow-container-back = Enrere

## FlowSetup2faApp

flow-setup-2fa-manual-key-instruction = <strong>Pas 1:</strong> Introduïu aquest codi a la vostra aplicació d'autenticació preferida.
# links to https://support.mozilla.org/kb/secure-firefox-account-two-step-authentication#w_step-one
flow-setup-2fa-more-info-link = Més informació sobre les aplicacions d'autenticació
flow-setup-2fa-button = Continua
flow-setup-2fa-step-2-instruction = <strong>Pas 2:</strong> Introduïu el codi des de l'aplicació d'autenticació.
flow-setup-2fa-input-label = Introduïu el codi de 6 dígits

## The step to choose the two step authentication method in the two step
## authentication setup flow.

flow-setup-2fa-backup-choice-heading = Trieu un mètode de recuperació
flow-setup-2fa-backup-choice-description = Això us permet iniciar la sessió si no podeu accedir al vostre dispositiu mòbil o a l'aplicació d'autenticació.
flow-setup-2fa-backup-choice-phone-title = Telèfon de recuperació
flow-setup-2fa-backup-choice-phone-badge = Més fàcil
flow-setup-2fa-backup-choice-code-title = Codis d'autenticació de recuperació
flow-setup-2fa-backup-choice-code-badge = Més segur
flow-setup-2fa-backup-choice-code-info = Creeu i deseu codis d'autenticació d'un sol ús.

## The backup code confirm step of the setup 2 factor authentication flow,
## where the user confirm that they have saved their backup authentication codes
## by entering one of them.

flow-setup-2fa-backup-code-confirm-heading = Introduïu el codi d'autenticació de recuperació
flow-setup-2fa-backup-code-confirm-code-input = Introduïu el codi de 10 caràcters
# Clicking on this button finishes the whole flow upon success.
flow-setup-2fa-backup-code-confirm-button-finish = Finalitza

## The backup codes download step of the setup 2 factor authentication flow

flow-setup-2fa-backup-code-dl-heading = Desa els codis d'autenticació de recuperació
flow-setup-2fa-backup-code-dl-button-continue = Continua

##

flow-setup-2fa-inline-complete-success-banner = S’ha habilitat l‘autenticació en dos passos
flow-setup-2fa-inline-complete-backup-code = Codis d'autenticació de recuperació
flow-setup-2fa-inline-complete-backup-phone = Telèfon de recuperació
# $count (Number) - an integer representing the number of backup
# authentication codes remaining
flow-setup-2fa-inline-complete-backup-code-info =
    { $count ->
        [one] { $count } codi restant
       *[other] { $count } codis restants
    }

## FlowSetupPhoneConfirmCode

# verification code refers to a code sent by text message to confirm phone number ownership
# and complete setup
flow-setup-phone-confirm-code-heading = Introduïu el codi de verificació
flow-setup-phone-confirm-code-input-label = Introduïu el codi de 6 dígits
# button to resend a code by text message to the user's phone
# followed by a button to resend a code
flow-setup-phone-confirm-code-expired = El codi ha caducat?
flow-setup-phone-confirm-code-resend-code-button = Torna a enviar el codi
flow-setup-phone-confirm-code-resend-code-success = S'ha enviat el codi
flow-setup-phone-confirm-code-success-message-v2 = S'ha afegit el telèfon de recuperació
flow-change-phone-confirm-code-success-message = S'ha canviat el telèfon de recuperació
flow-setup-phone-submit-number-heading = Verifiqueu el vostre número de telèfon
# The code is a 6-digit code send by text message/SMS
flow-setup-phone-verify-number-instruction = Rebreu un missatge de text de { -brand-mozilla } amb un codi per a verificar el vostre número. No compartiu aquest codi amb ningú.
# The initial rollout of the recovery phone is only available to users with US and Canada mobile phone numbers.
# Voice over Internet Protocol (VoIP), is a technology that uses a broadband Internet connection instead of a regular (or analog) phone line to make calls.
# Phone mask services (for example Relay) provide a temporary virtual number to avoid providing a real phone number.
# Both VoIP and phone masks can be unreliable for one-time-passcode (OTP) verification
flow-setup-phone-submit-number-info-message-v2 = El telèfon de recuperació només està disponible als Estats Units i Canadà. No es recomanen números de VoIP ni màscares de telèfon.
# cliking on the button sends a code by text message to the phone number typed in by the user
flow-setup-phone-submit-number-button = Envia el codi

## HeaderLockup component, the header in account settings

header-menu-open = Tanca el menú
header-menu-closed = Menú de navegació del lloc
header-back-to-top-link =
    .title = Torna a dalt
header-back-to-settings-link =
    .title = Torna a la configuració del { -product-mozilla-account }
header-title-2 = { -product-mozilla-account(capitalization: "uppercase") }
header-help = Ajuda

## Linked Accounts section

la-heading = Comptes enllaçats
la-description = Heu autoritzat l'accés als comptes següents.
la-unlink-button = Desenllaça
la-unlink-account-button = Desenllaça
la-set-password-button = Defineix una contrasenya
la-unlink-heading = Desenllaça d'un compte de tercers
la-unlink-content-3 = Esteu segur que voleu desenllaçar el compte? Si el desenllaceu, no se us tancaran les sessions dels serveis actualment connectats. Per fer-ho, caldrà que tanqueu la sessió manualment en la secció de Serveis connectats.
nav-linked-accounts = { la-heading }

## Modal - Default values for a message directed at the user where the user can typically Confirm or Cancel.

modal-close-title = Tanca
modal-cancel-button = Cancel·la
modal-default-confirm-button = Confirma

## ModalMfaProtected

modal-mfa-protected-title = Introduïu el codi de confirmació
modal-mfa-protected-input-label = Introduïu el codi de 6 dígits
modal-mfa-protected-cancel-button = Cancel·la
modal-mfa-protected-confirm-button = Confirma
modal-mfa-protected-code-expired = El codi ha caducat?
# Link to resend a new code to the user's email.
modal-mfa-protected-resend-code-link = Envia el codi nou per correu electrònic.

## Modal Verify Session

mvs-verify-your-email-2 = Confirmeu l'adreça electrònica
mvs-enter-verification-code-2 = Introduïu el codi de confirmació
# This string is used to show a notification to the user for them to enter confirmation code to confirm their email.
# Variables:
#   email (String) - the user's email
mvs-enter-verification-code-desc-2 = Introduïu el codi de confirmació que s'ha enviat a <email>{ $email }</email> en els pròxims 5 minuts.
msv-cancel-button = Cancel·la
msv-submit-button-2 = Confirma

## Settings Nav

nav-settings = Paràmetres
nav-profile = Perfil
nav-security = Seguretat
nav-connected-services = Serveis connectats
nav-data-collection = Ús i recollida de dades
nav-paid-subs = Subscripcions de pagament

## Page2faChange

page-2fa-change-title = Canvieu l'autenticació en dos passos
page-2fa-change-success = S'ha actualitzat l'autenticació en dos passos

## Two Step Authentication - replace backup authentication code

# Page title
tfa-backup-codes-page-title = Codis d'autenticació de recuperació

## Avatar change page

avatar-page-title =
    .title = Foto de perfil
avatar-page-add-photo = Afegeix una foto
avatar-page-add-photo-button =
    .title = { avatar-page-add-photo }
avatar-page-take-photo = Fes una foto
avatar-page-take-photo-button =
    .title = { avatar-page-take-photo }
avatar-page-remove-photo = Elimina la foto
avatar-page-remove-photo-button =
    .title = { avatar-page-remove-photo }
avatar-page-retake-photo = Torna a fer la foto
avatar-page-cancel-button = Cancel·la
avatar-page-save-button = Desa
avatar-page-saving-button = S'està desant…
avatar-page-zoom-out-button =
    .title = Redueix
avatar-page-zoom-in-button =
    .title = Amplia
avatar-page-rotate-button =
    .title = Gira
avatar-page-camera-error = No s'ha pogut inicialitzar la càmera
avatar-page-new-avatar =
    .alt = foto de perfil nova
avatar-page-file-upload-error-3 = S'ha produït un problema en pujar la vostra foto de perfil
avatar-page-delete-error-3 = S'ha produït un problema en suprimir la vostra foto de perfil
avatar-page-image-too-large-error-2 = La mida de la imatge és massa gran per pujar-la

## Password change page

pw-change-header =
    .title = Canvia la contrasenya
pw-8-chars = 8 caràcters com a mínim
pw-not-email = No pot ser la vostra adreça electrònica
pw-change-must-match = La contrasenya nova coincideix amb la confirmació
pw-commonly-used = No pot ser una contrasenya d'ús comú
# linkExternal is a link to a mozilla.org support article on password strength
pw-tips = Protegiu-vos: no reutilitzeu les contrasenyes. Vegeu més consells per a la <linkExternal>creació de contrasenyes segures</linkExternal>.
pw-change-cancel-button = Cancel·la
pw-change-save-button = Desa
pw-change-forgot-password-link = Heu oblidat la contrasenya?
pw-change-current-password =
    .label = Introduïu la contrasenya actual
pw-change-new-password =
    .label = Introduïu una contrasenya nova
pw-change-confirm-password =
    .label = Confirmeu la contrasenya nova
pw-change-success-alert-2 = S'ha actualitzat la contrasenya

## Password create page

pw-create-header =
    .title = Creeu una contrasenya
pw-create-success-alert-2 = S'ha definit la contrasenya
pw-create-error-2 = S'ha produït un problema en definir la contrasenya

## Delete account page

delete-account-header =
    .title = Suprimeix el compte
delete-account-step-1-2 = Pas 1 de 2
delete-account-step-2-2 = Pas 2 de 2
delete-account-acknowledge = Tingueu en compte que, en suprimir el vostre compte:
delete-account-chk-box-2 =
    .label = És possible que perdeu la informació desada i la funcionalitat dels productes de { -brand-mozilla }
delete-account-chk-box-3 =
    .label = Si reactiveu aquesta adreça electrònica, no recuperareu la vostra informació desada
delete-account-chk-box-4 =
    .label = S'esborraran totes les extensions i temes que hàgiu publicat a addons.mozilla.org
delete-account-continue-button = Continua
delete-account-password-input =
    .label = Introduïu la contrasenya
delete-account-cancel-button = Cancel·la
delete-account-delete-button-2 = Suprimeix

## Display name page

display-name-page-title =
    .title = Nom a mostrar
display-name-input =
    .label = Introduïu el nom a mostrar
submit-display-name = Desa
cancel-display-name = Cancel·la
display-name-update-error-2 = S'ha produït un problema en actualitzar el vostre nom a mostrar
display-name-success-alert-2 = S'ha actualitzat el nom a mostrar

## Add secondary email page

add-secondary-email-step-1 = Pas 1 de 2
add-secondary-email-error-2 = S'ha produït un problema en crear aquesta adreça electrònica
add-secondary-email-page-title =
    .title = Adreça electrònica secundària
add-secondary-email-enter-address =
    .label = Escriviu una adreça electrònica
add-secondary-email-cancel-button = Cancel·la
add-secondary-email-save-button = Desa

## Verify secondary email page

add-secondary-email-step-2 = Pas 2 de 2
verify-secondary-email-page-title =
    .title = Adreça electrònica secundària
verify-secondary-email-verification-code-2 =
    .label = Introduïu el codi de confirmació
verify-secondary-email-cancel-button = Cancel·la
verify-secondary-email-verify-button-2 = Confirma

##

# Link to delete account on main Settings page
delete-account-link = Suprimeix el compte

## Profile section

profile-heading = Perfil
profile-picture =
    .header = Imatge
profile-display-name =
    .header = Nom a mostrar
profile-primary-email =
    .header = Adreça electrònica principal

## Security section of Setting

security-heading = Seguretat
security-password =
    .header = Contrasenya
# This is a string that shows when the user's password was created.
# Variables:
#   $date (String) - a localized date and time string
security-password-created-date = Data de creació: { $date }
security-not-set = No s'ha definit
security-action-create = Crea

## SubRow component

passkey-delete-error = S'ha produït un problema en suprimir la clau d'accés. Torneu-ho a provar d'aquí a uns minuts.

## Switch component

# Used as "title" attribute when the switch is "on" and interaction turns the switch to "off"
switch-turn-off = Desactiva
# Used as "title" attribute when the switch is "off" and interaction turns the switch to "on"
switch-turn-on = Activa
# Used as "title" attribute when switch has been interacted with and form is submitting
switch-submitting = S'està enviant…
switch-is-on = activat
switch-is-off = desactivat

## Sub-section row Defaults

row-defaults-action-add = Afegeix
row-defaults-action-change = Canvia
row-defaults-action-disable = Desactiva
row-defaults-status = Cap

## Account recovery key sub-section on main Settings page

rk-enabled = Activada
rk-not-set = No definida
rk-action-create = Crea
rk-action-remove = Elimina
rk-cannot-remove-key = No s'ha pogut eliminar la clau de recuperació del compte.
rk-content-explain = Restaureu la vostra informació en cas que oblideu la contrasenya.

## Secondary email sub-section on main Settings page

se-heading = Adreça electrònica secundària
    .header = Adreça electrònica secundària
se-cannot-refresh-email = S'ha produït un error en actualitzar aquesta adreça electrònica.
# Button to remove the secondary email
se-remove-email =
    .title = Elimina l'adreça electrònica
# Button to refresh secondary email status
se-refresh-email =
    .title = Actualitza l'adreça electrònica
# Button to make secondary email the primary
se-make-primary = Converteix en principal
se-default-content = Accediu al compte si no podeu iniciar la sessió amb l'adreça electrònica principal.
# Default value for the secondary email
se-secondary-email-none = Cap

## Two Step Auth sub-section on Settings main page

tfa-row-header = Autenticació en dos passos
tfa-row-enabled = Activada
tfa-row-action-add = Afegeix
tfa-row-action-disable = Desactiva
tfa-row-button-refresh =
    .title = Actualitza l'autenticació en dos passos
tfa-row-cannot-refresh = S'ha produït un error en actualitzar la verificació en dos passos.
tfa-row-disable-modal-heading = Voleu desactivar l'autenticació en dos passos?
tfa-row-disable-modal-confirm = Desactiva

## Auth-server based errors that originate from backend service

auth-error-102 = El compte és desconegut
auth-error-103 = Contrasenya incorrecta
auth-error-110 = El testimoni no és vàlid
# Error shown to users when they have attempted a request (e.g., requesting a password reset) too many times
# and their requests have been throttled, but the specific amount of time before they can retry is unknown.
auth-error-114-generic = Heu fet massa intents. Torneu-ho a provar més tard.
# This string is the amount of time required before a user can attempt another request.
# Variables:
#   $retryAfter (String) - Time required before retrying a request. The variable is localized by our
#                          formatting library (momentjs) as a "time from now" and automatically includes
#                          the prefix as required by the current locale (for example, "in 15 minutes", "dans 15 minutes").
auth-error-114 = Heu fet massa intents. Torneu-ho a provar { $retryAfter }.
auth-error-125 = La sol·licitud s'ha blocat per raons de seguretat
auth-error-138-2 = Sessió no confirmada
auth-error-139 = L'adreça electrònica secundària ha de ser diferent de l'adreça electrònica del compte
auth-error-155 = No s'ha trobat el testimoni TOTP
auth-error-1008 = La contrasenya nova ha de ser diferent

## Connect Another Device page

# This link cancels the process of connecting another device, and takes the user back to Account Settings
connect-another-device-not-now-link = Ara no

## Page offering to store a passkey so that later Firefox Sync sign-ins skip the password.

# Browser tab title.
inline-passwordless-sync-setup-page-title = Voleu ometre la contrasenya la pròxima vegada?
inline-passwordless-sync-setup-heading = Voleu ometre la contrasenya la pròxima vegada?
inline-passwordless-sync-setup-error-cancelled-description = Confirmeu amb la vostra clau d'accés per a ometre la contrasenya la pròxima vegada.
# Error shown in the Settings alert bar when storing the passkey failed for password-free sign-in for sync. The user will be able to sign-in with the passkey but still need to enter their password to sync.
# "sync sign-in" refers to a sign-in with the additional ability to sync data without entering a password.
inline-passwordless-sync-setup-error-generic-v2 = No hem pogut activar aquesta clau d'accés per a iniciar la sessió i la sincronització. La pròxima vegada haureu d'introduir la contrasenya.

## Pair index page

# This allows the user to exit the sync/pair flow, and redirects them back to Settings
pair-not-now-button = Ara no
