# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.


## Brand Messaging component
## Used to show in product messaging about upcoming brand changes

# This aria-label applies to the dismiss/close button of the banner
# This text is for screen-readers
brand-banner-dismiss-button-2 =
    .aria-label = Pechar o cartel
# This message is displayed as the title element in the banner, prior to actually launching the new brand
brand-prelaunch-title = { -product-firefox-accounts } pasará a chamarse { -product-mozilla-accounts } o 1 de novembro.
# This message is displayed as sub title element in the banner, giving a it more context about the brand changes.
brand-prelaunch-subtitle = Seguirá iniciando sesión co mesmo nome de usuario e contrasinal, e non haberá outros cambios nos servizos que está a utilizar.
# This message is displayed as title element in the banner, after the brand changes take affect letting the user know that
# no action is required on their part
brand-postlaunch-title = Cambiamos o nome de { -product-firefox-accounts } a { -product-mozilla-accounts }. Seguirá iniciando sesión co mesmo nome de usuario e contrasinal e non haberá outros cambios nos servizos que está a utilizar.
# This is an extra link element, that directs users to a page where they can learn more about the branding changes.
brand-learn-more = Máis información.
# Alt text for close banner image
brand-close-banner =
    .alt = Pechar o cartel.
# Alt text for 'm' logo in banner header
brand-m-logo =
    .alt = Logotipo do m de { -brand-mozilla }

## ButtonDownloadRecoveryKeyPDF
## Clicking on this button downloads a PDF file that contains the user's account recovery key
## The account recovery key can be used to recover data when users forget their account password

# Button to download the account recovery key as a PDF file and navigate to the next step
# The next (and final) step is an optional prompt to save a storage hint
# .title will displayed as a tooltip on the button
recovery-key-download-button-v3 = Descargar e continuar
    .title = Descargar e continuar
recovery-key-pdf-heading = Clave de recuperación da conta
# Date when the account recovery key was created and this file was downloaded
# { $date }: formatted date with 'medium' dateStyle format (e.g., for 'en': Jul 31, 2023)
recovery-key-pdf-download-date = Xerada: { $date }
# Shown directly above recovery key value and preceeded by a key icon
recovery-key-pdf-key-legend = Clave de recuperación da conta
# Instructions in the text file to prompt the user to keep this information in a secure, easy to remember location.
# Password resets without this account recovery key can result in data loss.
# "key" here refers to "account recovery key"
recovery-key-pdf-instructions = Esta chave permítelle recuperar os datos cifrados do seu navegador (incluídos contrasinais, marcadores e historial) se esqueceu o contrasinal. Gárdea e non esqueza onde.
# This heading is shown above a list of options for storing the account recovery key
# "key" here refers to "account recovery key"
recovery-key-pdf-storage-ideas-heading = Lugares para gardar a clave
# Followed by a link (https://mzl.la/3bNrM1I) to get more information and support
recovery-key-pdf-support = Máis información sobre a clave de recuperación da conta
# Error message displayed in an alert bar if the PDF download failed.
recovery-key-pdf-download-error = Produciuse un problema ao descargar a chave de recuperación da súa conta.

## ChooseNewsletters component
## Checklist of newsletters that the user can choose to sign up to

# Prompt above a checklist of newsletters
choose-newsletters-prompt-2 = Obteña máis de { -brand-mozilla }:
# Newsletter checklist item
choose-newsletters-option-test-pilot =
    .label = Acceso anticipado para probar novos produtos
# Newsletter checklist item. This for a Mozilla Foundation newsletters,
# "Action alerts" can be interpreted as "Calls to action"
choose-newsletters-option-reclaim-the-internet =
    .label = Alertas de acción para recuperar Internet

## Tooltip notifications for actions performed on account recovery keys or one-time use codes

datablock-download =
    .message = Descargouse
datablock-copy =
    .message = Copiouse
datablock-print =
    .message = Imprimiuse

## DeviceInfoBlock component
## The strings here are used to display information about the origin of activity happening on a user's account
## For example, when connecting another device to the user's account

# Variables { $city }, { $region }, { $country } represent the estimated location of the user's device
# For example, 'Vancouver, British Columbia, Canada (estimated)'
device-info-block-location-city-region-country = { $city }, { $region }, { $country } (estimado)
# Variables { $region }, { $country } represent the estimated location of the user's device
# For example, 'British Columbia, Canada (estimated)'
device-info-block-location-region-country = { $region }, { $country } (estimado)
# Variables { $city }, { $country } represent the estimated location of the user's device
# For example, 'Vancouver, Canada (estimated)'
device-info-block-location-city-country = { $city }, { $country } (estimado)
# Variable { $country } represent the estimated location of the user's device
# For example, 'Canada (estimated)'
device-info-block-location-country = { $country } (estimado)
# When an approximate location for the user's device could not be determined
device-info-block-location-unknown = Localización descoñecida
# Variable { $browserName } is the browser that created the request (e.g., Firefox)
# Variable { $genericOSName } is the name of the operating system that created the request (e.g., MacOS, Windows, iOS)
device-info-browser-os = { $browserName } en { $genericOSName }
# Variable { $ipAddress } represents the IP address where the request originated
# The IP address is a string of numbers separated by periods (e.g., 192.158.1.38)
device-info-ip-address = Enderezo IP: { $ipAddress }

## FormVerifyCode

# Fallback default localized error message for empty input field
form-verify-code-default-error = Este campo é obrigatorio

## FormVerifyTotp component
## Form to enter a time-based one-time-passcode (e.g., 6-digit numeric code or 8-digit alphanumeric code)


# GetDataTrio component, part of Account Recovery Key flow

get-data-trio-title-firefox = { -brand-firefox }
get-data-trio-title-firefox-recovery-key = Chave de recuperación da conta de { -brand-firefox }
get-data-trio-title-backup-verification-codes = Copia de seguridade dos códigos de autenticación
get-data-trio-download-2 =
    .title = Descargar
    .aria-label = Descargar
get-data-trio-copy-2 =
    .title = Copiar
    .aria-label = Copiar
get-data-trio-print-2 =
    .title = Mostrar
    .aria-label = Mostrar

## Images - these are all aria labels used for illustrations
## Aria labels are used as alternate text that can be read aloud by screen readers.

hearts-broken-image-aria-label =
    .aria-label = Un ordenador, un teléfono móbil e unha imaxe dun corazón partido en cada un
hearts-verified-image-aria-label =
    .aria-label = Un ordenador, un teléfono móbil e unha tableta cun corazón palpitante en cada un
signin-recovery-code-image-description =
    .aria-label = Documento que contén texto oculto.
signin-totp-code-image-label =
    .aria-label = Un dispositivo cun código oculto de 6 díxitos.
confirm-signup-aria-label =
    .aria-label = Un sobre que contén unha ligazón
# Used for an image of a key on a shield surrounded by 5 other icons representing information that can be recovered with the account recovery key.
# Other icons and their meaning: Gear (settings), star (favorites), clock (history), magnifying glass (search) and lock (passwords).
security-shield-aria-label =
    .aria-label = Ilustración para representar unha clave de recuperación da conta.
# Used for an image of a single key.
recovery-key-image-aria-label =
    .aria-label = Ilustración para representar unha clave de recuperación da conta.
lightbulb-aria-label =
    .aria-label = Ilustración para representar a creación dunha pista de almacenamento.

## Input Password

# Tooltip displayed on a password input visibility toggle. Expresses the toggle action, where clicking on the toggle will hide the password.
input-password-hide = Agochar o contrasinal
# Tooltip displayed on a password input visibility toggle. Expresses the toggle action, where clicking on the toggle will show the password.
input-password-show = Amosar contrasinal
# Message read by screen readers when focus is on a password input visibility toggle. Expresses current (visible) state of the textbox content.
input-password-hide-aria-2 = O teu contrasinal está actualmente visible na pantalla.
# Message read by screen readers when focus is on a password input visibility toggle. Expresses current (hidden) state of the textbox content.
input-password-show-aria-2 = O teu contrasinal está oculto actualmente.
# Message read by screen readers after clicking on a password input visibility toggle to show the password. Expresses the new (visible) state of the textbox content.
input-password-sr-only-now-visible = O teu contrasinal está sendo visible na pantalla.
# Message read by screen readers after clicking on a password input visibility toggle to hide the password. Expresses the new (hidden) state of the textbox content.
input-password-sr-only-now-hidden = O teu contrasinal agora está oculto.

## Phone number component

# Back button on legal/terms or legal/privacy that takes users to the previous page
legal-back-button = Atrás

## LinkDamaged component

# The user followed a password reset link that was received by email
# but the link is damaged (for example mistyped or broken by the email client)
reset-pwd-link-damaged-header = Danouse a ligazón de restabelecer o contrasinal
# The user followed a link to signin that was received by email
# but the link was damaged (for example mistyped or broken by the email client).
signin-link-damaged-header = A ligazón de confirmación está danada
# The user followed a link to report an invalid signin attempt that was received by email
# but the link was damaged (for example mistyped or broken by the email client).
report-signin-link-damaged-header = A ligazón está danada
# The user followed a link received by email, but the link was damaged.
reset-pwd-link-damaged-message = Á ligazón que premeu faltábanlle caracteres, pode que o seu cliente de correo electrónico a rompese. Probe a copiar o enderezo de novo, con coidado.

## LinkUsed component

# The user followed a primary email confirmation link, but that link is has been used and is no longer valid
primary-email-confirmation-link-reused = O correo electrónico principal xa está confirmado
# The user followed a sign-in confirmation link, but that link has been used and is no longer valid
signin-confirmation-link-reused = Xa se confirmou o inicio de sesión
confirmation-link-reused-message = Esa ligazón de confirmación xa se usou e só pode usarse unha vez.

## Locale Toggle Component

# Users will see this heading when the URL or network request is malformed, e.g. a query parameter is required and is invalid
error-bad-request = Solicitude incorrecta

## PasswordInfoBalloon
## Balloon displayed next to password input field

password-info-balloon-why-password-info = Necesita este contrasinal para acceder aos datos cifrados que almacene connosco.

## User's avatar

avatar-your-avatar =
    .alt = O seu avatar
avatar-default-avatar =
    .alt = Avatar predeterminado

## Connect another device promo

connect-another-fx-mobile = Obter { -brand-firefox } para móbil ou tableta

## Connected services section

cs-heading = Servizos conectados
cs-description = Todo o que está a utilizar e para o que asinou.
cs-cannot-refresh = Desculpe, a recarga da lista de servizos conectados sufriu un problema.
cs-cannot-disconnect = Non se atopou o cliente, non foi posíbel desconectar.
cs-refresh-button =
    .title = Recargar os servizos conectados
# Link text to a support page on missing or duplicate devices
cs-missing-device-help = Elementos que faltan ou están duplicados?
cs-disconnect-sync-heading = Desconectar de Sync

## Avatar change page

avatar-page-file-upload-error-3 = Houbo un problema ao subir a túa foto de perfil.
avatar-page-delete-error-3 = Houbo un problema ao borrar a túa foto de perfil.
