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
button-passkey-signin-loading = S'està iniciant la sessió de manera segura…

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

firefox-promo-banner-mobile-cta = Connecta un dispositiu
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
# Used to indicate a check mark for an enabled state/option
checkmark-enabled-icon-aria-label =
    .aria-label = Activat
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
inline-recovery-key-setup-later-button = Més tard

## Input Password

# Tooltip displayed on a password input visibility toggle. Expresses the toggle action, where clicking on the toggle will hide the password.
input-password-hide = Amaga la contrasenya
# Tooltip displayed on a password input visibility toggle. Expresses the toggle action, where clicking on the toggle will show the password.
input-password-show = Mostra la contrasenya

## Phone number component

# This is an aria-label available to screen readers for a selection list that includes country flags, country name and country code
input-phone-number-country-list-aria-label = Trieu el país
input-phone-number-country-united-states = Estats Units
input-phone-number-country-canada = Canadà

## LinkDamaged component

# The user followed a password reset link that was received by email
# but the link is damaged (for example mistyped or broken by the email client)
reset-pwd-link-damaged-header = L'enllaç per reiniciar la contrasenya està malmès
# The user followed a link to report an invalid signin attempt that was received by email
# but the link was damaged (for example mistyped or broken by the email client).
report-signin-link-damaged-header = L'enllaç no funciona

## LinkExpired component

# Button to request a new link if the previous link that was emailed to the user is expired
link-expired-new-link-button = Rebeu un enllaç nou

## LinkRememberPassword component

# link navigates to the sign in page
remember-password-signin-link = Inicia la sessió

## LinkUsed component

# The user followed a primary email confirmation link, but that link is has been used and is no longer valid
primary-email-confirmation-link-reused = Ja s’ha confirmat l’adreça electrònica principal

## Locale Toggle Component

locale-toggle-select-label = Trieu una llengua
locale-toggle-browser-default = Opció per defecte del navegador
# Users will see this heading when the URL or network request is malformed, e.g. a query parameter is required and is invalid
error-bad-request = Sol·licitud incorrecta
# Browser tab title for the page shown when the URL or network request is malformed, e.g. a required query parameter is invalid.
# Shown in the browser tab, followed by “– Mozilla accounts”. Keep it short, since tabs cut off long titles.
error-bad-request-page-title = Sol·licitud incorrecta

## PairUnsupportedHint - Part of the desktop-to-mobile pairing flow
## Users see this on their mobile device when they open the pairing link
## outside the Firefox app. It tells them how to finish pairing in Firefox.

# Shown first when the page is open inside another app, which the user must close
pair-unsupported-hint-step-close-page = Tanca aquesta pàgina
# <b> emphasises the name of the button the user taps in Firefox
pair-unsupported-hint-step-app-menu = Toca el <b>menú de l'aplicació</b>
# Opens a Mozilla support article about connecting a device without a QR code
pair-unsupported-hint-learn-more-link = Més informació

## PasswordStrengthInline component
## These strings are conditions that need to be met to qualify as a strong password

password-strength-inline-min-length = 8 caràcters com a mínim
password-strength-inline-not-email = No pot ser la vostra adreça electrònica
password-strength-inline-not-common = No pot ser una contrasenya d'ús comú
password-strength-inline-passwords-match = Les contrasenyes coincideixen

## Notification Promo Banner component

account-recovery-notification-cta = Crea
promo-banner-dismiss-button =
    .aria-label = Descarta el bàner

## Ready component

# Message shown when the account is ready but the user is not signed in
ready-account-ready = Ja teniu el compte a punt.
ready-continue = Continua
sign-in-complete-header = S'ha confirmat l'inici de sessió
sign-up-complete-header = Compte confirmat
# Browser tab title for the page confirming the user’s sign-in.
# Shown in the browser tab, followed by “– Mozilla accounts”. Keep it short, since tabs cut off long titles.
sign-in-complete-page-title = S'ha confirmat l'inici de sessió
# Browser tab title for the page confirming the user’s new account.
# Shown in the browser tab, followed by “– Mozilla accounts”. Keep it short, since tabs cut off long titles.
sign-up-complete-page-title = Compte confirmat

## RecoveryKeySetupHint
## This is the final step in the account recovery key creation flow after a Sync signin or in account settings
## Prompts the user to save an (optional) storage hint about the location of their account recovery key.

# The text of the "submit" button. Clicking on this button will save the hint (if provided) and exit the account recovery key creation flow.
# "Finish" refers to "Finish the account recovery key creation process"
flow-recovery-key-hint-cta-text = Finalitza

## ResetPasswordWarning component
## Warning shown to users resetting their password without an account recovery key,
## surfacing options to keep their browser data

password-reset-warning-icon = Avís

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
# Button under the "Connected services" header that starts the flow to pair
# another device to the user's account.
cs-connect-device-button = Connecta un dispositiu
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

## FlowRecoveryKeyConfirmPwd - Second view in the PageRecoveryKeyCreate flow
## Users see this view when they are generating a new account recovery key
## This screen asks the user to confirm their password before generating a new key

flow-recovery-key-confirm-pwd-input-label = Introduïu la vostra contrasenya

## FlowRecoveryKeyInfo - First view in the PageRecoveryKeyCreate flow

# The text of the "submit" button to start creating (or changing) an account recovery key
flow-recovery-key-info-cta-text-v3 = Primers passos
# Link to cancel account recovery key change and return to settings
flow-recovery-key-info-cancel-link = Cancel·la

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
flow-setup-2fa-prompt-continue-button = Continua

## FlowSetupPhoneConfirmCode

# verification code refers to a code sent by text message to confirm phone number ownership
# and complete setup
flow-setup-phone-confirm-code-heading = Introduïu el codi de verificació
flow-setup-phone-confirm-code-input-label = Introduïu el codi de 6 dígits
flow-setup-phone-confirm-code-button = Confirmació
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

## Page2faSetup

page-2fa-setup-title = Autenticació en dos passos

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
delete-account-product-mozilla-vpn = { -product-mozilla-vpn }
delete-account-product-mdn-plus = { -product-mdn-plus }
delete-account-product-mozilla-hubs = { -product-mozilla-hubs }
delete-account-product-mozilla-monitor = { -product-mozilla-monitor }
delete-account-product-firefox-relay = { -product-firefox-relay }
delete-account-acknowledge = Tingueu en compte que, en suprimir el vostre compte:
delete-account-chk-box-1-v4 =
    .label = Es cancel·laran totes les subscripcions de pagament
delete-account-chk-box-2 =
    .label = És possible que perdeu la informació desada i la funcionalitat dels productes de { -brand-mozilla }
delete-account-chk-box-3 =
    .label = Si reactiveu aquesta adreça electrònica, no recuperareu la vostra informació desada
delete-account-chk-box-4 =
    .label = S'esborraran totes les extensions i temes que hàgiu publicat a addons.mozilla.org
delete-account-continue-button = Continua
delete-account-delete-button-passwordless = Suprimeix el compte
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

## PagePasskeyAdd - Loading page shown during passkey creation

page-passkey-add-cancel = Cancel·la

## Recent account activity
## All strings except title indicate an event that occurred from the user's account
## These are displayed as a list with the date when the event occured

# Clicking this button reveals the older account activity that is hidden at first.
recent-activity-show-more-button = Mostra'n més
recent-activity-account-create-v2 = S'ha creat el compte
recent-activity-account-disable-v2 = Compte desactivat
recent-activity-account-two-factor-added = S’ha habilitat l‘autenticació en dos passos
recent-activity-account-two-factor-removed = S'ha eliminat l'autenticació en dos passos
recent-activity-account-recovery-key-removed = S’ha eliminat una clau de recuperació del compte
recent-activity-account-password-added = S'ha afegit una contrasenya nova
recent-activity-account-password-changed = S'ha canviat la contrasenya

## PageRecoveryPhoneRemove
## Users reach this page from account settings when they want to remove a backup phone number.

settings-recovery-phone-remove-cancel = Cancel·la

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

## Product promotion

product-promo-monitor =
    .alt = { -product-mozilla-monitor }
product-promo-vpn =
    .alt = { -product-mozilla-vpn }
product-promo-vpn-description = Descobriu una capa addicional de protecció i navegació anònima.

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
# Browser tab title for the page telling the user their session expired and they need to sign out from the browser menu.
# Shown in the browser tab, followed by “– Mozilla accounts”. Keep it short, since tabs cut off long titles.
signout-sync-page-title = La sessió ha caducat

## SubRow component

# Shown to users who have no backup authentication codes
# Button to add backup authentication codes when none are configured
tfa-row-backup-codes-add-cta = Afegeix
# button to change the configured recovery phone
tfa-row-backup-phone-change-cta = Canvia
# button to add/configure a recovery phone
tfa-row-backup-phone-add-cta = Afegeix
passkey-delete-modal-cancel-button = Cancel·la
passkey-delete-error = S'ha produït un problema en suprimir la clau d'accés. Torneu-ho a provar d'aquí a uns minuts.
passkey-rename-save-button = Desa
passkey-rename-cancel-button = Cancel·la

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

## UnitRowPasskey

passkey-row-header = Claus d'accés
passkey-row-enabled = Activada
passkey-row-action-create = Crea
# External link to a support article about passkeys.
passkey-row-info-link-2 = Més informació

## Account recovery key sub-section on main Settings page

rk-enabled = Activada
rk-not-set = No definida
rk-action-create = Crea
# Button to delete the existing account recovery key and create a new one
rk-action-change-button = Canvia
rk-action-remove = Elimina
rk-key-removed-2 = S’ha eliminat una clau de recuperació del compte
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
tfa-row-action-change = Canvia
tfa-row-button-refresh =
    .title = Actualitza l'autenticació en dos passos
tfa-row-cannot-refresh = S'ha produït un error en actualitzar la verificació en dos passos.
tfa-row-disable-modal-heading = Voleu desactivar l'autenticació en dos passos?
tfa-row-disable-modal-confirm = Desactiva
# Shown in an alert bar after two-step authentication is disabled
tfa-row-disabled-2 = S'ha inhabilitat l'autenticació en dos passos

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
# Error shown when the user submits an invalid backup authentication code
auth-error-156 = No s'ha trobat el codi d'autenticació de recuperació
auth-error-159 = La clau de recuperació del compte no és vàlida
auth-error-202 = La funció no està activada
auth-error-203 = El sistema no està disponible; torneu-ho a intentar més tard
auth-error-240 = Aquest compte s'ha desactivat
auth-error-999 = Error inesperat
auth-error-1001 = S'ha cancel·lat l'intent d'inici de sessió
auth-error-1002 = La sessió ha caducat. Inicieu la sessió per continuar.
auth-error-1008 = La contrasenya nova ha de ser diferent
auth-error-1010 = Cal una contrasenya vàlida
auth-error-1011 = Cal una adreça electrònica vàlida
auth-error-1031 = Heu d'introduir la vostra edat per registrar-vos
auth-error-1032 = Heu d'introduir una edat vàlida per registrar-vos
auth-error-1054 = El codi d'autenticació en dos passos no és vàlid
auth-error-1062 = Redirecció no vàlida
oauth-error-1000 = Hi ha hagut un problema. Tanqueu aquesta pestanya i torneu-ho a provar.

## Passkey error messages
## Surfaced when a WebAuthn ceremony (registration or sign-in) fails.

# Link label appended after passkey-registration-canceled-v2, opens a SUMO support article.
passkey-registration-canceled-link = Més informació
# Link label appended after passkey-registration-error-not-supported-v2, opens a SUMO support article.
passkey-registration-error-not-supported-link = Més informació
# Link label appended after passkey-registration-error-could-not-complete, opens a SUMO support article.
passkey-registration-error-could-not-complete-link = Més informació

## Connect Another Device page

# A "success" message visible to users who verified via sign-in
connect-another-device-signin-confirmed-banner = S'ha confirmat l'inici de sessió
# A link for the user to sign in to the current Firefox browser, preceded by a message prompting the user to sign in so as to complete the device sync setup
connect-another-device-signin-link = Inicia la sessió
# This link leads the user back to the `/pair` page so as to connect another device
connect-another-device-cad-link = Connecteu un altre dispositiu
# This link cancels the process of connecting another device, and takes the user back to Account Settings
connect-another-device-not-now-link = Ara no
# Browser tab title for the page that invites the user to connect another device.
# Shown in the browser tab, followed by “– Mozilla accounts”. Keep it short, since tabs cut off long titles.
connect-another-device-page-title = Connecteu un altre dispositiu

## Cookies disabled page
## Users will see this page if they have local storage or cookies disabled.

# A button users may click to check if cookies and local storage are enabled and be directed to the previous page if so.
cookies-disabled-button-try-again = Torna-ho a provar
# An external link going to: https://support.mozilla.org/kb/cookies-information-websites-store-on-your-computer
cookies-disabled-learn-more = Més informació

## Index / home page

index-header = Introduïu la vostra adreça electrònica
index-cta = Inici de sessió o registre
index-email-input =
    .label = Introduïu la vostra adreça electrònica
# When users delete their Mozilla account inside account Settings, they are redirected to this page with a success message
index-account-delete-success = El compte s'ha suprimit correctament

## Page offering to store a passkey so that later Firefox Sync sign-ins skip the password.

# Browser tab title.
inline-passwordless-sync-setup-page-title = Voleu ometre la contrasenya la pròxima vegada?
inline-passwordless-sync-setup-heading = Voleu ometre la contrasenya la pròxima vegada?
inline-passwordless-sync-setup-not-now-button = Ara no
inline-passwordless-sync-setup-error-cancelled-description = Confirmeu amb la vostra clau d'accés per a ometre la contrasenya la pròxima vegada.
# Error shown in the Settings alert bar when storing the passkey failed for password-free sign-in for sync. The user will be able to sign-in with the passkey but still need to enter their password to sync.
# "sync sign-in" refers to a sign-in with the additional ability to sync data without entering a password.
inline-passwordless-sync-setup-error-generic-v2 = No hem pogut activar aquesta clau d'accés per a iniciar la sessió i la sincronització. La pròxima vegada haureu d'introduir la contrasenya.

## InlineRecoveryKeySetup page component

# Browser tab title for the page where the user chooses a recovery method during two-step authentication setup.
# Shown in the browser tab, followed by “– Mozilla accounts”. Keep it short, since tabs cut off long titles.
inline-recovery-setup-choice-page-title = Trieu un mètode de recuperació

## InlineTotpSetup page
## TOTP (time-based one-time password) is a form of two-factor authentication (2FA).

inline-totp-setup-cancel-setup-button = Cancel·la la configuració
inline-totp-setup-continue-button = Continua
inline-totp-setup-ready-button = Preparat
# The "authentication code" here refers to the code provided by an authentication app.
inline-totp-setup-security-code-placeholder = Codi d'autenticació
inline-totp-setup-page-title = Autenticació en dos passos

## PageNotFound page
## Shown when the requested page does not exist

page-not-found-heading = No s'ha trobat la pàgina
page-not-found-home-button = Inici
# Browser tab title for the page shown when the requested page does not exist.
# Shown in the browser tab, followed by “– Mozilla accounts”. Keep it short, since tabs cut off long titles.
page-not-found-page-title = No s'ha trobat la pàgina

## PairAuthComplete page - part of the device pairing flow

pair-auth-complete-manage-devices-link = Gestiona els dispositius

## AuthTotp page
## TOTP (time-based one-time password) is a form of two-factor authentication (2FA).
## Users that have set up two-factor authentication land on this page during device pairing.

# Form button to confirm if the authentication code entered by the user is valid
auth-totp-confirm-button = Confirmació

## PairFailure - a view which displays on failure of the device pairing process

pair-failure-try-again-link = Torna-ho a provar

## Pair index page

pair-cad-header-v2 = Connecteu un altre dispositiu
# This allows the user to exit the sync/pair flow, and redirects them back to Settings
pair-not-now-button = Ara no
# This initiates the pairing process, usually by directing the user to the `about:preferences` page in Firefox
pair-get-started-button = Primers passos
# This is the aria label on the QR code image
pair-qr-code-aria-label = Codi QR

## Choice screen — "Do you have Firefox for mobile?"

# Continue button on choice screen (disabled until a radio option is selected)
pair-choice-continue-button = Continua

## Download screen — shown after selecting "I don’t have Firefox for mobile"

# Browser tab title for the page where the user chooses how to connect another device.
# Shown in the browser tab, followed by “– Mozilla accounts”. Keep it short, since tabs cut off long titles.
pair-choice-page-title = Connecteu un altre dispositiu

## PairSuccess - a view which displays  on successful completion of the device pairing process

pair-success-message-2 = S'ha aparellat correctament.

## SuppAllow page - Part of the device pairing flow
## Users see this page when they have started to pair a second (or more) device to their account
## The pairing must be confirmed from both devices to succeed

pair-supp-allow-cancel-link = Cancel·la

## PairUnsupported - a view which is shown when the user tries to scan the pairing QR code any way other than through a Firefox app

# v2: "Learn more" link below the mobile instructions; links to a Mozilla support article.
pair-unsupported-learn-more-link-v2 = Més informació
# Browser tab title for the page shown to a desktop { -brand-firefox } user when something went wrong and device pairing cannot continue.
# Shown in the browser tab, followed by “– Mozilla accounts”. Keep it short, since tabs cut off long titles.
pair-unsupported-desktop-firefox-fallback-page-title = Hi ha hagut un problema

## ContinueOnMobile page - Part of the desktop-to-mobile pairing flow
## Users see this on their computer after scanning the pairing QR code with
## their phone. It confirms the flow has moved to the mobile device and waits
## for the remaining steps to be completed there.

# Dismisses the pairing attempt
pair2-authority-continue-on-mobile-cancel-button = Cancel·la

## ScanQR page - Part of the desktop-to-mobile pairing flow
## Users see this on their computer. It shows a QR code that they scan with
## their phone or tablet to connect the two devices and start syncing.

# Button shown below the QR code card. Leaves the pairing flow and takes the user to their account settings.
pair2-authority-scan-qr-skip-button = Omet per ara

## SyncSuccess page - Part of the desktop-to-mobile pairing flow
## Users see this on their computer once the mobile device has been paired.
## It confirms that sync is on and links to sync settings.

# Opens the browser settings that control what is synced
pair2-authority-sync-success-sync-settings-button-v2 = Gestiona els paràmetres de sincronització

## TimeoutAndCancel page - Part of the desktop-to-mobile pairing flow
## Users see this on their computer when pairing stopped without succeeding,
## either because it timed out or because it was canceled. Both cases offer to
## start pairing over again.

# Restarts the pairing flow
pair2-authority-timeout-and-cancel-try-again-button = Torna-ho a provar
# Takes the user to their Sync settings. "Sync" names the Firefox feature here, not the action.
pair2-authority-timeout-and-cancel-sync-settings-button = Paràmetres de sincronització
# Browser tab title for the page shown on the computer when the device pairing attempt timed out.
# Shown in the browser tab, followed by “– Mozilla accounts”. Keep it short, since tabs cut off long titles.
pair2-authority-timeout-and-cancel-timeout-page-title = S'ha esgotat el temps d'espera de la connexió

## ApproveSignIn page - Part of the desktop-to-mobile pairing flow
## Users see this on their mobile device after scanning the pairing QR code
## shown on their computer. It waits for them to approve the sign-in on the
## computer, and shows that computer's details so they can verify the request.

# Dismisses the pairing attempt
pair2-supplicant-approve-sign-in-cancel-button = Cancel·la

## ConnectThisDevice page - Part of the desktop-to-mobile pairing flow
## Users see this on their mobile device after scanning the pairing QR code
## shown on their computer. It asks them to confirm connecting the mobile
## device to their account, and shows that computer's details so they can
## verify the request.

# Confirms the pairing attempt
pair2-supplicant-connect-this-device-connect-button = Connecta
# Dismisses the pairing attempt
pair2-supplicant-connect-this-device-cancel-button = Cancel·la

## DownloadFirefox page - Part of the desktop-to-mobile pairing flow
## Users see this on their mobile device when pairing reaches a browser that is
## not Firefox. It offers to open the Firefox app to finish pairing, and to
## install it first when the user does not have it yet.

# Opens a page explaining what sync does
pair2-supplicant-download-firefox-learn-more-link = Més informació

## ReadyToScan page - Part of the desktop-to-mobile pairing flow
## Users see this on their mobile device before pairing starts. It tells them
## to open firefox.com/pair on their computer, which is where the QR code they
## scan with the mobile device comes from.

# Opens a Mozilla support article about setting up sync
pair2-supplicant-ready-to-scan-learn-more-link = Més informació
# Browser tab title for the page shown on the mobile device before pairing starts, telling the user to open firefox.com/pair on their computer.
# Shown in the browser tab, followed by “– Mozilla accounts”. Keep it short, since tabs cut off long titles.
pair2-supplicant-ready-to-scan-page-title = Llest per escanejar

## TimeoutAndCancel page - Part of the desktop-to-mobile pairing flow
## Users see this on their mobile device when pairing ends without connecting,
## because the attempt timed out, was canceled, or the device is already signed
## in to an account. All states are informational and offer no on-screen action,
## so the copy points the user back to their computer to start again.

# Browser tab title for the page shown on the mobile device when the device pairing attempt timed out.
# Shown in the browser tab, followed by “– Mozilla accounts”. Keep it short, since tabs cut off long titles.
pair2-supplicant-timeout-and-cancel-timeout-page-title = S'ha esgotat el temps d'espera de la connexió

## Permissions page
## Users see this page during sign-in or sign-up when a relying party is not a
## trusted Mozilla application, or when it asks for consent explicitly.
## The page informs the user which profile information the relying party can
## read. It does not offer a choice.

permissions-label-email = Adreça electrònica
permissions-label-display-name = Nom a mostrar
permissions-label-avatar = Imatge del compte
permissions-continue-button = Continua
permissions-cancel-button = Cancel·la

## ForcePasswordChange page
## Users are sent here when suspicious activity on the account requires a new password before they can continue.

# Browser tab title for the page where the user must change their password because of suspicious activity on their account.
# Shown in the browser tab, followed by “– Mozilla accounts”. Keep it short, since tabs cut off long titles.
force-password-change-page-title = Canvieu la contrasenya

## ServiceWelcome page
## Shown to users after signup/signin for services like VPN

# Browser tab title for the page telling the user to turn on VPN as their next step after signing up or signing in. "VPN" is a VPN service built into the Firefox browser.
# Shown in the browser tab, followed by “– Mozilla accounts”. Keep it short, since tabs cut off long titles.
service-welcome-vpn-page-title = Activa la VPN

## AccountRecoveryConfirmKey page

# Clicking this button checks if the recovery key provided by the user is correct and associated with their account
account-recovery-confirm-key-button-2 = Continua

## CompleteResetPassword component
## User followed a password reset link and is now prompted to create a new password

# A new password was successfully set for the user's account
# Displayed in an alert bar
complete-reset-password-success-alert = S'ha definit la contrasenya
# An error occurred while attempting to set a new password (password reset flow)
# Displayed in an alert bar
complete-reset-password-error-alert = S'ha produït un problema en definir la contrasenya
# A message informing the user that the password reset was successful and reminding them to create another recovery key
# Displayed on the sign in page
reset-password-complete-banner-heading = S'ha reiniciat la vostra contrasenya.
confirm-backup-code-reset-password-confirm-button = Confirmació

## Confirm Reset Password With Code

confirm-reset-password-with-code-heading = Comproveu el correu electrònic
# Clicking the button submits and verifies the code
# If succesful, continues to the next step of the password reset
confirm-reset-password-otp-submit-button = Continua
# Link to cancel the password reset and sign in with a different account
confirm-reset-password-otp-different-account-link = Utilitza un altre compte

## PasswordResetConfirmTotp Page

confirm-totp-reset-password-header = Reinicia la contrasenya
confirm-totp-reset-password-confirm-button = Confirmació
confirm-totp-reset-password-use-different-account = Utilitza un altre compte

## ResetPassword start page

password-reset-flow-heading = Reinicia la contrasenya
password-reset-forgot-heading = Heu oblidat la contrasenya?
password-reset-email-input =
    .label = Introduïu la vostra adreça electrònica
password-reset-submit-button-2 = Continua
# Browser tab title for the page where the user starts a password reset by entering their email.
# Shown in the browser tab, followed by “– Mozilla accounts”. Keep it short, since tabs cut off long titles.
password-reset-flow-page-title = Reinicia la contrasenya

## ResetPasswordConfirmed

reset-password-complete-header = S'ha reiniciat la vostra contrasenya

## Reset password recovery method page
## This page is shown to users when they are having trouble resetting their

password-reset-recovery-method-header = Reinicia la contrasenya

## ResetPasswordRecoveryPhone page

reset-password-recovery-phone-flow-heading = Reinicia la contrasenya
# A recovery code in context of this page is a one time code sent to the user's phone
reset-password-recovery-phone-heading = Introduïu el codi de recuperació
reset-password-recovery-phone-code-submit-button = Confirmació
# Follows the error message (e.g, "There was a problem sending a code")
reset-password-recovery-phone-general-error-description = Torneu-ho a provar més tard.

## ServerError page
## Shown when the server fails to handle a request

server-error-heading = Error 500
server-error-home-button = Inici

## CompleteSignin component

# This is a label that precedes any error which could arise from trying to validate the user's signin
error-label = Error:

## Signin page

# Browser tab title for the page where the user enters their password to sign in.
# Shown in the browser tab, followed by “– Mozilla accounts”. Keep it short, since tabs cut off long titles.
signin-password-page-title = Introduïu la vostra contrasenya
# Browser tab title for the sign-in page shown when the user already has a saved session on this device.
# Shown in the browser tab, followed by “– Mozilla accounts”. Keep it short, since tabs cut off long titles.
signin-cached-page-title = Inicia la sessió
# Submit button label when the sign-in turns Sync on (user was sent here to set up Sync, e.g. from pairing)
signin-button-start-syncing = Inicia la sincronització
signin-button = Inicia la sessió
signin-header = Inicia la sessió
signin-use-a-different-account-link = Utilitza un altre compte
signin-forgot-password-link = Heu oblidat la contrasenya?
signin-password-button-label = Contrasenya
signin-account-locked-banner-heading = Reinicia la contrasenya

## ReportSignin Page
## When users receive an "Is this you signing in?" email with an unblock code,
## they can click "report it to us" if they did not attempt to sign in.
## This will be the page shown to users to block the sign in and report it.

back = Enrere

## SigninPasskeyFallback page
## Users who authenticate with a passkey to access Sync must also enter their password.

signin-passkey-fallback-password-label = Contrasenya
signin-passkey-fallback-continue = Continua
signin-passkey-fallback-forgot-password-link = Heu oblidat la contrasenya?
# Link in a banner explaining why a passkey couldn’t be used to sign in to sync. Opens a support article about troubleshooting passkeys.
signin-passkey-fallback-wrap-unusable-link = Més informació

## SigninPasswordlessCode page
## Users are prompted to enter a code sent to their email for passwordless authentication.

signin-passwordless-code-heading = Introduïu el codi de confirmació
signin-passwordless-code-confirm-button = Confirmació
signin-passwordless-code-other-account-link = Utilitza un altre compte

## Signin recovery method page
## This page is shown to users when they are having trouble signing in with
## their password, and they previously had set up an account recovery method.

signin-recovery-method-header = Inicia la sessió

## SigninRecoveryCode page
## Users are prompted to enter a backup authentication code
## (provided to the user when they first set up two-step authentication)
## when they are unable to sign in with two-step authentication (e.g., Authy, Duo, etc.)

signin-recovery-code-heading = Inicia la sessió
# Form button to confirm if the backup authentication code entered by the user is valid
signin-recovery-code-confirm-button = Confirmació
signin-recovery-code-use-phone-failure-description = Torneu-ho a provar més tard.

## SigninRecoveryPhone page

signin-recovery-phone-flow-heading = Inicia la sessió
# A recovery code in context of this page is a one time code sent to the user's phone
signin-recovery-phone-heading = Introduïu el codi de recuperació
signin-recovery-phone-code-submit-button = Confirmació
# Follows the error message (e.g, "There was a problem sending a code")
signin-recovery-phone-general-error-description = Torneu-ho a provar més tard.

## SigninTokenCode page
## Users see this page during the signin process. In this instance, the confirmation code is
## a 6-digit code that is sent to the user's email address.

# Form button to confirm if the confirmation code entered by the user is valid
signin-token-code-confirm-button = Confirmació

## SigninTOTPCode page
## TOTP (time-based one-time password) is a form of two-factor authentication (2FA).
## Users that have set up two-factor authentication land on this page during sign-in.

signin-totp-code-header = Inicia la sessió
# Form button to confirm if the authentication code entered by the user is valid
signin-totp-code-confirm-button = Confirmació
signin-totp-code-other-account-link = Utilitza un altre compte

## Signin Unblock Page
## Page shown when signin has been blocked by rate limiting (too many requests)

signin-unblock-code-input = Introdueix un codi d'autorització
signin-unblock-submit-button = Continua
# Shown when the user attempts to submit the form without including a code
signin-unblock-code-required-error = Cal un codi d'autorització
signin-unblock-resend-code-button = No és a la safata d'entrada o al correu brossa? Torna'l a enviar

## ConfirmSignupCode page
## Users see this page after they have initiated account sign up,

# Browser tab title for the page where the user enters the confirmation code emailed to them to finish signing up.
# Shown in the browser tab, followed by “– Mozilla accounts”. Keep it short, since tabs cut off long titles.
confirm-signup-code-page-title-2 = Confirmeu l'adreça electrònica
# Form button to confirm if the confirmation code entered by the user is valid
confirm-signup-code-confirm-button = Confirmació
confirm-signup-code-sync-button = Inicia la sincronització
confirm-signup-code-success-alert = El compte s'ha confirmat correctament

## Account Signup page
## This is the second page of the sign up flow, users have already entered their email

signup-heading-v2 = Creeu una contrasenya
# Browser tab title for the page where the user creates a password to sign up for an account.
# Shown in the browser tab, followed by “– Mozilla accounts”. Keep it short, since tabs cut off long titles.
signup-page-title = Crea un compte

## SignupConfirmedSync page
## Shown to users when they finish confirming their account through Sync

signup-confirmed-sync-header = La sincronització està activada
signup-confirmed-sync-button = Comença a navegar
signup-confirmed-sync-add-device-link = Afegeix un altre dispositiu
# Browser tab title for the page confirming that sync is turned on after the user confirmed their account.
# Shown in the browser tab, followed by “– Mozilla accounts”. Keep it short, since tabs cut off long titles.
signup-confirmed-sync-page-title = La sincronització està activada

## UpdateFirefox page
## Shown when the browser is too old to use a Mozilla account

update-firefox-download-button = Baixa l'última versió
