# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.


## Banner component

resend-code-success-banner-heading = Se ha enviado un nuevo código a tu correo electrónico.
resend-link-success-banner-heading = Se ha enviado un nuevo enlace a tu correo electrónico.
# $accountsEmail is the Mozilla accounts sender email address (e.g. accounts@firefox.com)
resend-success-banner-description = Añade { $accountsEmail } a tus contactos para asegurar una entrega sin problemas.

## Brand Messaging component
## Used to show in product messaging about upcoming brand changes

# This aria-label applies to the dismiss/close button of the banner
# This text is for screen-readers
brand-banner-dismiss-button-2 =
    .aria-label = Cerrar aviso
# This message is displayed as the title element in the banner, prior to actually launching the new brand
brand-prelaunch-title = { -product-firefox-accounts } pasará a llamarse { -product-mozilla-accounts } el 1 de noviembre
# This message is displayed as sub title element in the banner, giving a it more context about the brand changes.
brand-prelaunch-subtitle = Seguirás conectándote con el mismo nombre de usuario y contraseña, y no hay otros cambios en los productos que usas.
# This message is displayed as title element in the banner, after the brand changes take affect letting the user know that
# no action is required on their part
brand-postlaunch-title = Cambiamos el nombre de { -product-firefox-accounts } a { -product-mozilla-accounts }. Seguirás conectándote con el mismo nombre de usuario y contraseña, y no hay otros cambios en los productos que usas.
# This is an extra link element, that directs users to a page where they can learn more about the branding changes.
brand-learn-more = Saber más
# Alt text for close banner image
brand-close-banner =
    .alt = Cerrar aviso
# Alt text for 'm' logo in banner header
brand-m-logo =
    .alt = Logo con la m de { -brand-mozilla }

## ButtonBack component
## Allows users to click a back arrow to navigate to the previous page

button-back-aria-label = Atrás
button-back-title = Atrás

## ButtonDownloadRecoveryKeyPDF
## Clicking on this button downloads a PDF file that contains the user's account recovery key
## The account recovery key can be used to recover data when users forget their account password

# Button to download the account recovery key as a PDF file and navigate to the next step
# The next (and final) step is an optional prompt to save a storage hint
# .title will displayed as a tooltip on the button
recovery-key-download-button-v3 = Descargar y continuar
    .title = Descargar y continuar
recovery-key-pdf-heading = Clave de recuperación de cuenta
# Date when the account recovery key was created and this file was downloaded
# { $date }: formatted date with 'medium' dateStyle format (e.g., for 'en': Jul 31, 2023)
recovery-key-pdf-download-date = Generada: { $date }
# Shown directly above recovery key value and preceeded by a key icon
recovery-key-pdf-key-legend = Clave de recuperación de cuenta
# Instructions in the text file to prompt the user to keep this information in a secure, easy to remember location.
# Password resets without this account recovery key can result in data loss.
# "key" here refers to "account recovery key"
recovery-key-pdf-instructions = Esta clave te permite recuperar los datos cifrados de tu navegador (incluidas las contraseñas, los marcadores y el historial) en caso de que olvides tu contraseña. Guárdala en un lugar que recordarás.
# This heading is shown above a list of options for storing the account recovery key
# "key" here refers to "account recovery key"
recovery-key-pdf-storage-ideas-heading = Lugares para guardar la clave
# Followed by a link (https://mzl.la/3bNrM1I) to get more information and support
recovery-key-pdf-support = Saber más acerca de tu clave de recuperación de cuenta
# Error message displayed in an alert bar if the PDF download failed.
recovery-key-pdf-download-error = Lo sentimos, ha surgido un problema al descargar la clave de recuperación de cuenta.

## ChooseNewsletters component
## Checklist of newsletters that the user can choose to sign up to

# Prompt above a checklist of newsletters
choose-newsletters-prompt-2 = Obtener más de { -brand-mozilla }:
# Newsletter checklist item
choose-newsletters-option-latest-news =
    .label = Recibe nuestras últimas noticias y actualizaciones de productos
# Newsletter checklist item
choose-newsletters-option-test-pilot =
    .label = Acceso anticipado para probar nuevos productos
# Newsletter checklist item. This for a Mozilla Foundation newsletters,
# "Action alerts" can be interpreted as "Calls to action"
choose-newsletters-option-reclaim-the-internet =
    .label = Llamadas a la acción para recuperar Internet

## Tooltip notifications for actions performed on account recovery keys or one-time use codes

datablock-download =
    .message = Descargado
datablock-copy =
    .message = Copiado
datablock-print =
    .message = Imprimido

## Success banners for datablock actions.
## $count – number of codes

datablock-copy-success =
    { $count ->
        [one] Código copiado
       *[other] Códigos copiados
    }
datablock-download-success =
    { $count ->
        [one] Código descargado
       *[other] Códigos descargados
    }

##

# Tooltip notification when an account recovery key or one-time use code is copied.
datablock-inline-copy =
    .message = Copiado

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
device-info-block-location-unknown = Ubicación desconocida
# Variable { $browserName } is the browser that created the request (e.g., Firefox)
# Variable { $genericOSName } is the name of the operating system that created the request (e.g., MacOS, Windows, iOS)
device-info-browser-os = { $browserName } en { $genericOSName }
# Variable { $ipAddress } represents the IP address where the request originated
# The IP address is a string of numbers separated by periods (e.g., 192.158.1.38)
device-info-ip-address = Dirección IP: { $ipAddress }

## FormPasswordInlineCriteria

form-password-with-inline-criteria-signup-new-password-label =
    .label = Contraseña
form-password-with-inline-criteria-signup-confirm-password-label =
    .label = Repetir contraseña
form-password-with-inline-criteria-signup-submit-button = Crear cuenta
form-password-with-inline-criteria-reset-new-password =
    .label = Nueva contraseña
form-password-with-inline-criteria-confirm-password =
    .label = Confirmar contraseña
form-password-with-inline-criteria-reset-submit-button = Crear nueva contraseña
form-password-with-inline-criteria-set-password-new-password-label =
    .label = Contraseña
form-password-with-inline-criteria-set-password-confirm-password-label =
    .label = Repetir contraseña
form-password-with-inline-criteria-set-password-submit-button = Empezar a sincronizar
form-password-with-inline-criteria-match-error = Las contraseñas no coinciden
form-password-with-inline-criteria-sr-too-short-message = La contraseña debe contener al menos 8 caracteres.
form-password-with-inline-criteria-sr-not-email-message = La contraseña no debe contener tu dirección de correo electrónico.
form-password-with-inline-criteria-sr-not-common-message = La contraseña no debe ser una contraseña de uso común.
form-password-with-inline-criteria-sr-requirements-met = La contraseña introducida respeta todos los requisitos de contraseña.
form-password-with-inline-criteria-sr-passwords-match = Las contraseñas introducidas coinciden.

## FormVerifyCode

# Fallback default localized error message for empty input field
form-verify-code-default-error = Este campo es obligatorio

## FormVerifyTotp component
## Form to enter a time-based one-time-passcode (e.g., 6-digit numeric code or 8-digit alphanumeric code)

# Information explaining why button is disabled, also read to screen readers
# Submit button is disabled unless a valid code format is entered
# Used when the code may only contain numbers
# $codeLength : number of digits in a valid code
form-verify-totp-disabled-button-title-numeric = Introduce un código de { $codeLength } dígitos para continuar
# Information explaining why button is disabled, also read to screen readers
# Submit button is disabled unless a valid code format is entered
# Used when the code may contain numbers and/or letters
# $codeLength : number of characters in a valid code
form-verify-totp-disabled-button-title-alphanumeric = Introduce un código de { $codeLength } caracteres para continuar

# GetDataTrio component, part of Account Recovery Key flow

get-data-trio-title-firefox = { -brand-firefox }
get-data-trio-title-firefox-recovery-key = Clave de recuperación de cuenta de { -brand-firefox }
get-data-trio-title-backup-verification-codes = Códigos de autenticación de respaldo
get-data-trio-download-2 =
    .title = Descargar
    .aria-label = Descargar
get-data-trio-copy-2 =
    .title = Copiar
    .aria-label = Copiar
get-data-trio-print-2 =
    .title = Imprimir
    .aria-label = Imprimir

## Images - these are all aria labels used for illustrations
## Aria labels are used as alternate text that can be read aloud by screen readers.

# Aria-label option for an alert symbol
alert-icon-aria-label =
    .aria-label = Alerta
# Aria-label option for an alert symbol
icon-attention-aria-label =
    .aria-label = Atención
# Aria-label option for an alert symbol
icon-warning-aria-label =
    .aria-label = Advertencia
authenticator-app-aria-label =
    .aria-label = Aplicación de autenticación
backup-codes-icon-aria-label-v2 =
    .aria-label = Códigos de autenticación de respaldo activados
backup-codes-disabled-icon-aria-label-v2 =
    .aria-label = Códigos de autenticación de respaldo desactivados
# An icon of phone with text message. A back recovery phone number
backup-recovery-sms-icon-aria-label =
    .aria-label = SMS de recuperación habilitado
# Disabled version of backup-recovery-sms-icon-aria-label
backup-recovery-sms-disabled-icon-aria-label =
    .aria-label = SMS de recuperación deshabilitado
# Used to select Canada as country code for phone number
canadian-flag-icon-aria-label =
    .aria-label = Bandera canadiense
# Used to  indicate a general checkmark, as in something checked off in a list!
checkmark-icon-aria-label =
    .aria-label = Marcar
# Used to  indicate a check mark for a successful state/action
checkmark-success-icon-aria-label =
    .aria-label = Todo correcto
# Used to indicate a check mark for an enabled state/option
checkmark-enabled-icon-aria-label =
    .aria-label = Activado
# Used on X icon to dismiss a message such as an alert or banner
close-icon-aria-label =
    .aria-label = Cerrar mensaje
# Used to decorate a code you enter for verification purposes
code-icon-aria-label =
    .aria-label = Código
error-icon-aria-label =
    .aria-label = Error
# Used as information icon for informative messaging
info-icon-aria-label =
    .aria-label = Información
# Used to select United States as a country code for phone number
usa-flag-icon-aria-label =
    .aria-label = Bandera de Estados Unidos

## Images - these are all aria labels used for illustrations
## Aria labels are used as alternate text that can be read aloud by screen readers.

hearts-broken-image-aria-label =
    .aria-label = Un ordenador, un teléfono móvil y la imagen de un corazón roto en cada uno.
hearts-verified-image-aria-label =
    .aria-label = Un ordenador, un teléfono móvil y una tablet con un corazón palpitante en cada uno.
signin-recovery-code-image-description =
    .aria-label = Documento que contiene texto oculto.
signin-totp-code-image-label =
    .aria-label = Un dispositivo con un código oculto de 6 dígitos.
confirm-signup-aria-label =
    .aria-label = Un sobre que contiene un enlace
# Used for an image of a key on a shield surrounded by 5 other icons representing information that can be recovered with the account recovery key.
# Other icons and their meaning: Gear (settings), star (favorites), clock (history), magnifying glass (search) and lock (passwords).
security-shield-aria-label =
    .aria-label = Ilustración para representar una clave de recuperación de cuenta.
# Used for an image of a single key.
recovery-key-image-aria-label =
    .aria-label = Ilustración para representar una clave de recuperación de cuenta.
password-image-aria-label =
    .aria-label = Una ilustración para representar la introducción de una contraseña.
lightbulb-aria-label =
    .aria-label = Ilustración para representar la creación de una sugerencia de almacenamiento.
email-code-image-aria-label =
    .aria-label = Ilustración para representar un correo electrónico que contiene un código.
recovery-phone-image-description =
    .aria-label = Dispositivo móvil que recibe un código por mensaje de texto.
recovery-phone-code-image-description =
    .aria-label = Código recibido en un dispositivo móvil.
backup-recovery-phone-image-aria-label =
    .aria-label = Dispositivo móvil con capacidad para enviar mensajes de texto SMS
backup-authentication-codes-image-aria-label =
    .aria-label = Pantalla de dispositivo con códigos

## InlineRecoveryKeySetupCreate component
## Users see this view when we prompt them to generate an account recovery key
## after signing in.

inline-recovery-key-setup-signed-in-firefox-2 = Has iniciado sesión en { -brand-firefox }.
inline-recovery-key-setup-create-header = Asegura tu cuenta
# This is a subheader asking users to create an account recovery key, indicating it will only take a moment to complete.
inline-recovery-key-setup-create-subheader = ¿Tienes un minuto para proteger tus datos?
inline-recovery-key-setup-info = Crea una clave de recuperación de tu cuenta para que puedas restaurar tus datos de navegación sincronizada si alguna vez olvidas tu contraseña.
inline-recovery-key-setup-start-button = Crear una clave de recuperación de cuenta
inline-recovery-key-setup-later-button = Más tarde

## Input Password

# Tooltip displayed on a password input visibility toggle. Expresses the toggle action, where clicking on the toggle will hide the password.
input-password-hide = Ocultar contraseña
# Tooltip displayed on a password input visibility toggle. Expresses the toggle action, where clicking on the toggle will show the password.
input-password-show = Mostrar contraseña
# Message read by screen readers when focus is on a password input visibility toggle. Expresses current (visible) state of the textbox content.
input-password-hide-aria-2 = Tu contraseña está actualmente visible en la pantalla.
# Message read by screen readers when focus is on a password input visibility toggle. Expresses current (hidden) state of the textbox content.
input-password-show-aria-2 = Tu contraseña está actualmente oculta.
# Message read by screen readers after clicking on a password input visibility toggle to show the password. Expresses the new (visible) state of the textbox content.
input-password-sr-only-now-visible = Tu contraseña ahora está visible en la pantalla.
# Message read by screen readers after clicking on a password input visibility toggle to hide the password. Expresses the new (hidden) state of the textbox content.
input-password-sr-only-now-hidden = Tu contraseña ahora está oculta.

## Phone number component

# This is an aria-label available to screen readers for a selection list that includes country flags, country name and country code
input-phone-number-country-list-aria-label = Elige un país
input-phone-number-enter-number = Introduce el número de teléfono
input-phone-number-country-united-states = Estados Unidos
input-phone-number-country-canada = Canadá
# Back button on legal/terms or legal/privacy that takes users to the previous page
legal-back-button = Atrás

## LinkDamaged component

# The user followed a password reset link that was received by email
# but the link is damaged (for example mistyped or broken by the email client)
reset-pwd-link-damaged-header = El enlace para restablecer la contraseña está dañado
# The user followed a link to signin that was received by email
# but the link was damaged (for example mistyped or broken by the email client).
signin-link-damaged-header = Enlace de confirmación dañado
# The user followed a link to report an invalid signin attempt that was received by email
# but the link was damaged (for example mistyped or broken by the email client).
report-signin-link-damaged-header = Enlace dañado
# The user followed a link received by email, but the link was damaged.
reset-pwd-link-damaged-message = Al enlace que seleccionaste le faltan caracteres y puede que tu cliente de correo lo haya roto. Copia la dirección con cuidado y vuelve a intentarlo.

## LinkExpired component

# Button to request a new link if the previous link that was emailed to the user is expired
link-expired-new-link-button = Recibir nuevo enlace

## LinkRememberPassword component

# immediately before remember-password-signin-link
remember-password-text = ¿Recuerdas tu contraseña?
# link navigates to the sign in page
remember-password-signin-link = Iniciar sesión

## LinkUsed component

# The user followed a primary email confirmation link, but that link is has been used and is no longer valid
primary-email-confirmation-link-reused = El correo electrónico principal ya fue confirmado
# The user followed a sign-in confirmation link, but that link has been used and is no longer valid
signin-confirmation-link-reused = Inicio de sesión ya confirmado
confirmation-link-reused-message = Ese enlace de confirmación ya ha sido usado y solo puede usarse una vez.

## Locale Toggle Component

locale-toggle-select-label = Selecciona un idioma
# Users will see this heading when the URL or network request is malformed, e.g. a query parameter is required and is invalid
error-bad-request = Solicitud incorrecta

## PasswordInfoBalloon
## Balloon displayed next to password input field

password-info-balloon-why-password-info = Necesitas esta contraseña para acceder a los datos cifrados que almacenas con nosotros.
password-info-balloon-reset-risk-info = Un reinicio podría ocasionar la pérdida de datos como contraseñas y marcadores.

## PasswordStrengthInline component
## These strings are conditions that need to be met to qualify as a strong password

password-strength-long-instruction = Elige una contraseña segura que no hayas usado en otros sitios. Asegúrate de que cumpla con los requisitos de seguridad:
password-strength-short-instruction = Elige una contraseña segura:
password-strength-inline-min-length = Al menos 8 caracteres
password-strength-inline-not-email = Diferente a tu dirección de correo electrónico
password-strength-inline-not-common = Que no sea una contraseña de uso común
password-strength-inline-confirmed-must-match = La confirmación coincide con la nueva contraseña

## Notification Promo Banner component

account-recovery-notification-cta = Crear
account-recovery-notification-header-value = No pierdas tus datos si olvidas tu contraseña
account-recovery-notification-header-description = Crea una clave de recuperación de cuenta para restaurar tus datos de navegación sincronizados si alguna vez olvidas tu contraseña.
recovery-phone-promo-cta = Añadir teléfono de recuperación
recovery-phone-promo-heading = Añade una protección adicional a tu cuenta con un teléfono de recuperación
recovery-phone-promo-description = Ahora puedes iniciar sesión con una contraseña de un solo uso a través de SMS si no puedes usar tu aplicación de autenticación de dos pasos.
recovery-phone-promo-info-link = Saber más sobre la recuperación y el riesgo de intercambio de SIM
promo-banner-dismiss-button =
    .aria-label = Descartar aviso

## Ready component

ready-complete-set-up-instruction = Completa la configuración introduciendo tu nueva contraseña en el resto de tus dispositivos { -brand-firefox }.
manage-your-account-button = Administra tu cuenta
# This is a string that tells the user they can use whatever service prompted them to reset their password or to verify their email
# Variables:
# { $serviceName } represents a product name (e.g., Mozilla VPN) that will be passed in as a variable
ready-use-service = Ya tienes todo listo para usar { $serviceName }
# The user successfully accomplished a task (password reset, confirm email) that lets them use their account
ready-use-service-default = Ahora estás listo para utilizar los ajustes de la cuenta
# Message shown when the account is ready but the user is not signed in
ready-account-ready = ¡Tu cuenta está lista!
ready-continue = Continuar
sign-in-complete-header = Inicio de sesión confirmado
sign-up-complete-header = Cuenta confirmada
primary-email-verified-header = Correo electrónico principal confirmado

## Users see this view when they are generating a new account recovery key
## This screen displays the generated key and allows users to download or copy the key

# This heading is shown above a list of options for storing the account recovery key
# "key" here refers to "account recovery key"
flow-recovery-key-download-storage-ideas-heading-v2 = Lugares para guardar la clave:
flow-recovery-key-download-storage-ideas-folder-v2 = Carpeta en un dispositivo seguro
flow-recovery-key-download-storage-ideas-cloud = Almacenamiento de confianza en la nube
flow-recovery-key-download-storage-ideas-print-v2 = Copia física impresa
flow-recovery-key-download-storage-ideas-pwd-manager = Administrador de contraseñas

## RecoveryKeySetupHint
## This is the final step in the account recovery key creation flow after a Sync signin or in account settings
## Prompts the user to save an (optional) storage hint about the location of their account recovery key.

# The header of the last step in the account recovery key creation flow
# "key" here refers to the "account recovery key"
flow-recovery-key-hint-header-v2 = Añade una pista para ayudarte a encontrar tu clave
# This message explains why saving a storage hint can be helpful. The account recovery key could be "stored" in a physical (e.g., printed) or virtual location (e.g., in a device folder or in the cloud).
# "it" here refers to the storage hint, NOT the "account recovery key"
flow-recovery-key-hint-message-v3 = Esta pista debería ayudarte a recordar dónde guardaste tu clave de recuperación de cuenta. Podemos mostrártela durante el restablecimiento de contraseña para recuperar tus datos.
# The label for the text input where the user types in the storage hint they want to save.
# The storage hint is optional, and users can leave this blank.
flow-recovery-key-hint-input-v2 =
    .label = Introduce una pista (opcional)
# The text of the "submit" button. Clicking on this button will save the hint (if provided) and exit the account recovery key creation flow.
# "Finish" refers to "Finish the account recovery key creation process"
flow-recovery-key-hint-cta-text = Finalizar
# Error displayed in a tooltip if the hint entered by the user exceeds the character limit.
# "Hint" refers to "storage hint"
flow-recovery-key-hint-char-limit-error = La pista debe contener menos de 255 caracteres.
# Error displayed in a tooltip if the user included unsafe unicode characters in their hint.
# "Hint" refers to "storage hint"
flow-recovery-key-hint-unsafe-char-error = La pista no puede contener caracteres Unicode inseguros. Solo se permiten letras, números, signos de puntuación y símbolos.

## ResetPasswordWarning component
## Warning shown to sync users that reset their password without using an account recovery key

password-reset-warning-icon = Advertencia
password-reset-chevron-expanded = Contraer advertencia
password-reset-chevron-collapsed = Expandir advertencia
password-reset-data-may-not-be-recovered = Tal vez no puedan recuperar los datos de tu navegador
password-reset-previously-signed-in-device-2 = ¿Tienes algún dispositivo desde el cual te hayas conectado anteriormente?
password-reset-data-may-be-saved-locally-2 = Es posible que los datos de tu navegador estén guardados en ese dispositivo. Restablece tu contraseña y luego conéctate desde allí para restaurar y sincronizar tus datos.
password-reset-no-old-device-2 = ¿Tienes un dispositivo nuevo pero no tienes acceso a ninguno de los anteriores?
password-reset-encrypted-data-cannot-be-recovered-2 = Lo sentimos, pero los datos de tu navegador que se encuentran cifrados en los servidores de { -brand-firefox } no se pueden recuperar.
password-reset-warning-have-key = ¿Tienes una clave de recuperación de cuenta?
password-reset-warning-use-key-link = Úsala ahora para restablecer tu contraseña y conservar tus datos.

## Alert Bar

alert-bar-close-message = Cerrar mensaje

## User's avatar

avatar-your-avatar =
    .alt = Tu avatar
avatar-default-avatar =
    .alt = Avatar predeterminado

##


# BentoMenu component

bento-menu-title-3 = productos { -brand-mozilla }
bento-menu-tagline = Más productos de { -brand-mozilla } que protegen tu privacidad
bento-menu-vpn-2 = { -product-mozilla-vpn }
bento-menu-monitor-3 = { -product-mozilla-monitor }
bento-menu-firefox-relay-2 = { -product-firefox-relay }
bento-menu-firefox-desktop = Navegador { -brand-firefox } para escritorio
bento-menu-firefox-mobile = Navegador { -brand-firefox } para dispositivos móviles
bento-menu-made-by-mozilla = Creado por { -brand-mozilla }

## Connect another device promo

connect-another-fx-mobile = Obtén { -brand-firefox } en un dispositivo móvil o tableta
connect-another-find-fx-mobile-2 = Busca { -brand-firefox } en { -google-play } y { -app-store }.
# Alt text for Google Play and Apple App store images that will be shown if the image can't be loaded.
# These images are used to encourage users to download Firefox on their mobile devices.
connect-another-play-store-image-2 =
    .alt = Descarga { -brand-firefox } en { -google-play }
connect-another-app-store-image-3 =
    .alt = Descargar { -brand-firefox } en { -app-store }

## Connected services section

cs-heading = Servicios conectados
cs-description = Todo lo que estás usando y en lo que has iniciado sesión.
cs-cannot-refresh =
    Lo sentimos, hubo un problema al actualizar la lista de servicios
    conectados.
cs-cannot-disconnect = Cliente no encontrado, no se ha podido desconectar
# This string is used in a notification message near the top of the page.
# Variables:
#   $service (String) - the name of a device or service that uses Mozilla accounts
#                       (for example: "Firefox Lockwise")
cs-logged-out-2 = Desconectado de { $service }
cs-refresh-button =
    .title = Actualizar servicios conectados
# Link text to a support page on missing or duplicate devices
cs-missing-device-help = ¿Faltan elementos o están duplicados?
cs-disconnect-sync-heading = Desconectar de Sync

## This string is used in a modal dialog when the user starts the disconnect from
## Sync process.
## Variables:
##   $device (String) - the name of a device using Mozilla accounts
##                      (for example: "Firefox Nightly on Google Pixel 4a")

cs-disconnect-sync-content-3 =
    Tus datos de navegación permanecerán en <span>{ $device }</span>, 
    pero ya no se sincronizarán con tu cuenta.
cs-disconnect-sync-reason-3 = ¿Cuál es el motivo principal para desconectar <span>{ $device }</span>?

## The following are the options for selecting a reason for disconnecting the
## device

cs-disconnect-sync-opt-prefix = El dispositivo es:
cs-disconnect-sync-opt-suspicious = Sospechoso
cs-disconnect-sync-opt-lost = Perdido o robado
cs-disconnect-sync-opt-old = Antiguo o reemplazado
cs-disconnect-sync-opt-duplicate = Duplicado
cs-disconnect-sync-opt-not-say = Prefiero no decirlo

##

cs-disconnect-advice-confirm = De acuerdo, entendido
cs-disconnect-lost-advice-heading = El dispositivo perdido o robado ha sido desconectado
cs-disconnect-lost-advice-content-3 =
    Ya que tu dispositivo fue extraviado o robado, para
    mantener tu información segura, deberías cambiar tu contraseña de { -product-mozilla-account } en la configuración de tu cuenta. También deberías buscar la información del fabricante del dispositivo sobre cómo borrar tus datos de forma remota.
cs-disconnect-suspicious-advice-heading = El dispositivo sospechoso ha sido desconectado
cs-disconnect-suspicious-advice-content-2 = Si el dispositivo desconectado es realmente sospechoso, para mantener tu información segura, deberías cambiar la contraseña de { -product-mozilla-account } en la configuración de tu cuenta. También deberías cambiar cualquier otra contraseña que guardaste en { -brand-firefox } escribiendo about:logins en la barra de direcciones.
cs-sign-out-button = Cerrar sesión

## Data collection section

dc-heading = Recopilación y uso de datos
dc-subheader-moz-accounts = { -product-mozilla-accounts }
dc-subheader-ff-browser = Navegador { -brand-firefox }
dc-subheader-content-2 = Permitir que { -product-mozilla-accounts } envíe datos técnicos y de interacción a { -brand-mozilla }.
dc-subheader-ff-content = Para revisar o actualizar la configuración de datos de interacción y técnicos de tu navegador { -brand-firefox }, abre los ajustes de { -brand-firefox } y navega a Privacidad y seguridad.
dc-opt-out-success-2 = Desactivación correcta. { -product-mozilla-accounts } no enviará datos técnicos o de interacción a { -brand-mozilla }.
dc-opt-in-success-2 = ¡Gracias! Compartir estos datos nos ayuda a mejorar { -product-mozilla-accounts }.
dc-opt-in-out-error-2 = Lo sentimos, ha surgido un problema al cambiar tu preferencia de recolección de datos
dc-learn-more = Saber más

# DropDownAvatarMenu component

drop-down-menu-title-2 = menú { -product-mozilla-account }
# This is displayed in the Settings menu after user's click on their profile icon.
# Following this string on a new line will be their display name (user's name or email)
drop-down-menu-signed-in-as-v2 = Sesión iniciada como
drop-down-menu-sign-out = Cerrar sesión
drop-down-menu-sign-out-error-2 = Lo sentimos, ha surgido un problema al cerrar tu sesión

## Flow Container

flow-container-back = Atrás

## FlowRecoveryKeyConfirmPwd - Second view in the PageRecoveryKeyCreate flow
## Users see this view when they are generating a new account recovery key
## This screen asks the user to confirm their password before generating a new key

flow-recovery-key-confirm-pwd-heading-v2 = Introduce de nuevo tu contraseña por seguridad
flow-recovery-key-confirm-pwd-input-label = Introduce tu contraseña
# Clicking on this button will check the password and create an account recovery key
flow-recovery-key-confirm-pwd-submit-button = Crear una clave de recuperación de cuenta
# For users with an existing account recovery key, clicking on this button will
# check the password, delete the existing key and create a new account recovery key
flow-recovery-key-confirm-pwd-submit-button-change-key = Crear una nueva clave de recuperación de cuenta

## FlowRecoveryKeyDownload - Third view in the PageRecoveryKeyCreate flow
## Users see this view when they are generating a new account recovery key
## This screen displays the generated key and allows users to download or copy the key

flow-recovery-key-download-heading-v2 = Clave de recuperación de cuenta creada — Descárgala y guárdala ahora
# The "key" here refers to the term "account recovery key"
flow-recovery-key-download-info-v2 = Esta clave te permite recuperar tus datos si olvidas tu contraseña. Descárgala ahora y guárdala en algún lugar que recuerdes — no podrás regresar a esta página más tarde.
# This link allows user to proceed to the next step without clicking the download button
flow-recovery-key-download-next-link-v2 = Continuar sin descargar

## FlowRecoveryKeyHint
## This is the fourth and final step in the account recovery key creation flow in account settings
## Prompts the user to save an (optional) storage hint about the location of their account recovery key.

# Success message displayed in alert bar after the user has finished creating an account recovery key.
flow-recovery-key-success-alert = Clave de recuperación de cuenta creada

## FlowRecoveryKeyInfo - First view in the PageRecoveryKeyCreate flow

# The header of the first view in the Recovery Key Create flow
flow-recovery-key-info-header = Crea una clave de recuperación de cuenta en caso de que olvides tu contraseña
# The header of the first view in the Recovery Key Create flow when replacing an existing recovery key
flow-recovery-key-info-header-change-key = Cambiar tu clave de recuperación de cuenta
# In the first view of the PageRecoveryKeyCreate flow, this is the first of two bullet points explaining why the user should create an account recovery key
flow-recovery-key-info-shield-bullet-point-v2 = Ciframos los datos de navegación: contraseñas, marcadores y más. Es lo mejor para la privacidad, pero podrías perder tus datos si olvidas tu contraseña.
# In the first view of the PageRecoveryKeyCreate flow, this is the second of two bullet points explaining why the user should create an account recovery key
flow-recovery-key-info-key-bullet-point-v2 = Por eso es tan importante crear una clave de recuperación de cuenta: puedes usarla para restaurar tus datos
# The text of the "submit" button to start creating (or changing) an account recovery key
flow-recovery-key-info-cta-text-v3 = Comenzar
# Link to cancel account recovery key change and return to settings
flow-recovery-key-info-cancel-link = Cancelar

## FlowSetup2faApp

flow-setup-2fa-qr-heading = Conéctate a tu aplicación de autenticación
# DEV NOTE: "2a" in the id should be "2fa". This typo is kept intentionally to
# avoid losing existing translations; fix it when creating a new version of
# this string.
flow-setup-2a-qr-instruction = <strong>Paso 1:</strong> Escanea este código QR usando cualquier aplicación de autenticación, como Duo o Google Authenticator.
# Alt text for the QR-code image shown during two-step authentication setup.
# “setup secret key” refers to the long code you can copy instead of scanning.
# Not to be confused with the 6-digit codes generated by the authenticator app.
flow-setup-2fa-qr-alt-text =
    .alt = Código QR para configurar la autenticación en dos pasos. Escanéalo o selecciona "¿No puedes escanear el código QR?" para obtener una clave secreta de configuración.
flow-setup-2fa-cant-scan-qr-button = ¿No puedes escanear el código QR?
flow-setup-2fa-manual-key-heading = Introduce el código manualmente
flow-setup-2fa-manual-key-instruction = <strong>Paso 1:</strong> Introduce este código en tu aplicación de autenticación preferida.
flow-setup-2fa-scan-qr-instead-button = ¿Escanear código QR como alternativa?
# links to https://support.mozilla.org/kb/secure-firefox-account-two-step-authentication#w_step-one
flow-setup-2fa-more-info-link = Saber más sobre las aplicaciones de autenticación
flow-setup-2fa-button = Continuar
flow-setup-2fa-step-2-instruction = <strong>Paso 2:</strong> Introduce el código de tu aplicación de autenticación.
flow-setup-2fa-input-label = Introduce el código de 6 dígitos

## The step to choose the two step authentication method in the two step
## authentication setup flow.

flow-setup-2fa-backup-choice-heading = Elige un método de recuperación
flow-setup-2fa-backup-choice-description = Esto te permite iniciar sesión si no puedes acceder a tu dispositivo móvil o a la aplicación de autenticación.
flow-setup-2fa-backup-choice-phone-title = Teléfono de recuperación
flow-setup-2fa-backup-choice-phone-badge = Lo más fácil
flow-setup-2fa-backup-choice-phone-info = Obtén un código de recuperación por SMS. Disponible actualmente en Estados Unidos y Canadá.
flow-setup-2fa-backup-choice-code-title = Códigos de autenticación de respaldo
flow-setup-2fa-backup-choice-code-badge = Lo más seguro
flow-setup-2fa-backup-choice-code-info = Crea y guarda códigos de autenticación de un solo uso.
# This link points to https://support.mozilla.org/kb/secure-mozilla-account-two-step-authentication
flow-setup-2fa-backup-choice-learn-more-link = Saber más sobre la recuperación y el riesgo de intercambio de SIM

## The backup code confirm step of the setup 2 factor authentication flow,
## where the user confirm that they have saved their backup authentication codes
## by entering one of them.

flow-setup-2fa-backup-code-confirm-heading = Introduce el código de autenticación de respaldo
# codes here refers to backup authentication codes
flow-setup-2fa-backup-code-confirm-confirm-saved = Confirma que has guardado tus códigos introduciendo uno. Sin estos códigos, es posible que no puedas iniciar sesión si no tienes tu aplicación de autenticación.
flow-setup-2fa-backup-code-confirm-code-input = Introduce el código de 10 caracteres
# Clicking on this button finishes the whole flow upon success.
flow-setup-2fa-backup-code-confirm-button-finish = Finalizar

## The backup codes download step of the setup 2 factor authentication flow

flow-setup-2fa-backup-code-dl-heading = Guardar códigos de autenticación de respaldo
flow-setup-2fa-backup-code-dl-save-these-codes = Guárdalos en un lugar que puedas recordar. Si no tienes acceso a tu aplicación de autenticación, necesitarás uno para conectarte.
flow-setup-2fa-backup-code-dl-button-continue = Continuar

##

flow-setup-2fa-inline-complete-success-banner = Autenticación en dos pasos activada
flow-setup-2fa-inline-complete-success-banner-description = Para proteger todos tus dispositivos conectados, debes cerrar sesión en todos los lugares donde uses esta cuenta y luego volver a iniciar sesión usando la nueva autenticación en dos pasos.
flow-setup-2fa-inline-complete-backup-code = Códigos de autenticación de respaldo
flow-setup-2fa-inline-complete-backup-phone = Teléfono de recuperación
# $count (Number) - an integer representing the number of backup
# authentication codes remaining
flow-setup-2fa-inline-complete-backup-code-info =
    { $count ->
        [one] { $count } código restante
       *[other] { $count } códigos restantes
    }
flow-setup-2fa-inline-complete-backup-code-description = Este es el método de recuperación más seguro si no puedes iniciar sesión con tu dispositivo móvil o la aplicación de autenticación.
flow-setup-2fa-inline-complete-backup-phone-description = Este es el método de recuperación más sencillo si no puedes iniciar sesión con tu aplicación de autenticación.
flow-setup-2fa-inline-complete-learn-more-link = Cómo protege tu cuenta
# $serviceName (String) - the name of the product that the user will be
# redirected to.
flow-setup-2fa-inline-complete-continue-button = Continuar a { $serviceName }
flow-setup-2fa-prompt-heading = Configurar la autenticación en dos pasos
# Variable { $serviceName } is the name of the product (e.g. Firefox Add-ons)
# that requests two-step authentication setup.
flow-setup-2fa-prompt-description = { $serviceName } requiere que configures la autenticación en dos pasos para mantener tu cuenta segura.
# "these authenticator apps" links to https://support.mozilla.org/kb/secure-firefox-account-two-step-authentication
flow-setup-2fa-prompt-use-authenticator-apps = Puedes usar cualquiera de estas <authenticationAppsLink>aplicaciones de autenticación</authenticationAppsLink> para continuar.

## FlowSetupPhoneConfirmCode

# verification code refers to a code sent by text message to confirm phone number ownership
# and complete setup
flow-setup-phone-confirm-code-heading = Introduce el código de verificación
# $phoneNumber is a partially obfuscated phone number with only the last 4 digits showing (e.g., *** *** 1234)
# span element applies formatting to ensure the number is always displayed left-to-right
flow-setup-phone-confirm-code-instruction = Se envió un código de 6 dígitos a <span>{ $phoneNumber }</span> por SMS. Este código caduca en 5 minutos.
flow-setup-phone-confirm-code-input-label = Introduce el código de 6 dígitos
flow-setup-phone-confirm-code-button = Confirmar
# button to resend a code by text message to the user's phone
# followed by a button to resend a code
flow-setup-phone-confirm-code-expired = ¿Código expirado?
flow-setup-phone-confirm-code-resend-code-button = Reenviar código
flow-setup-phone-confirm-code-resend-code-success = Código enviado
flow-setup-phone-confirm-code-success-message-v2 = Teléfono de recuperación añadido
flow-change-phone-confirm-code-success-message = Teléfono de recuperación cambiado

## FlowSetupPhoneConfirmCode

flow-setup-phone-submit-number-heading = Verifica tu número de teléfono
# The code is a 6-digit code send by text message/SMS
flow-setup-phone-verify-number-instruction = Recibirás un mensaje de texto de { -brand-mozilla } con un código para verificar tu número. No compartas este código con nadie.
# The initial rollout of the recovery phone is only available to users with US and Canada mobile phone numbers.
# Voice over Internet Protocol (VoIP), is a technology that uses a broadband Internet connection instead of a regular (or analog) phone line to make calls.
# Phone mask services (for example Relay) provide a temporary virtual number to avoid providing a real phone number.
# Both VoIP and phone masks can be unreliable for one-time-passcode (OTP) verification
flow-setup-phone-submit-number-info-message-v2 = El teléfono de recuperación sólo está disponible en Estados Unidos y Canadá. No se recomiendan los números VoIP ni las máscaras telefónicas.
flow-setup-phone-submit-number-legal = Al proporcionar tu número, aceptas que lo almacenemos para poder enviarte mensajes de texto únicamente para verificar tu cuenta. Pueden aplicarse tarifas por mensajes y datos.
# cliking on the button sends a code by text message to the phone number typed in by the user
flow-setup-phone-submit-number-button = Enviar código

## HeaderLockup component, the header in account settings

header-menu-open = Cerrar menú
header-menu-closed = Menú de navegación del sitio
header-back-to-top-link =
    .title = Volver arriba
header-title-2 = { -product-mozilla-account }
header-help = Ayuda

## Linked Accounts section

la-heading = Cuentas vinculadas
la-description = Has autorizado el acceso a las siguientes cuentas.
la-unlink-button = Desvincular
la-unlink-account-button = Desvincular
la-set-password-button = Establecer contraseña
la-unlink-heading = Desvincular de cuenta de terceros
la-unlink-content-3 = ¿Seguro que quieres desvincular tu cuenta? Desvincular tu cuenta no te desconecta automáticamente de tus Servicios conectados. Para hacerlo, deberás cerrar sesión manualmente en la sección Servicios conectados.
la-unlink-content-4 = Antes de desvincular tu cuenta, debes establecer una contraseña. Sin una contraseña, no hay forma de que te conectes después de desvincular tu cuenta.
nav-linked-accounts = { la-heading }

## Modal - Default values for a message directed at the user where the user can typically Confirm or Cancel.

modal-close-title = Cerrar
modal-cancel-button = Cancelar
modal-default-confirm-button = Confirmar

## Modal Verify Session

mvs-verify-your-email-2 = Confirma tu correo electrónico
mvs-enter-verification-code-2 = Introduce tu código de confirmación
# This string is used to show a notification to the user for them to enter confirmation code to confirm their email.
# Variables:
#   email (String) - the user's email
mvs-enter-verification-code-desc-2 = Por favor introduce en los 5 minutos siguientes el código de confirmación que se ha enviado a <email>{ $email }</email>.
msv-cancel-button = Cancelar
msv-submit-button-2 = Confirmar

## Settings Nav

nav-settings = Ajustes
nav-profile = Perfil
nav-security = Seguridad
nav-connected-services = Servicios conectados
nav-data-collection = Recopilación y uso de datos
nav-paid-subs = Suscripciones de pago
nav-email-comm = Comunicaciones por correo electrónico

## Two Step Authentication - replace backup authentication code

# Error shown when API call fails while replacing existing backup codes
tfa-replace-code-error-3 = Ha habido un problema al reemplazar tus códigos de autenticación de respaldo
# Error shown when API call fails while creating new backup codes (user had none)
tfa-create-code-error = Ha habido un problema al crear tus códigos de autenticación de respaldo
# Success message shown in alert bar after successfully replacing existing backup codes
tfa-replace-code-success-alert-4 = Códigos de autenticación de respaldo actualizados

## Avatar change page

avatar-page-title =
    .title = Foto de perfil
avatar-page-add-photo = Añadir foto
avatar-page-add-photo-button =
    .title = { avatar-page-add-photo }
avatar-page-take-photo = Tomar foto
avatar-page-take-photo-button =
    .title = { avatar-page-take-photo }
avatar-page-remove-photo = Eliminar foto
avatar-page-remove-photo-button =
    .title = { avatar-page-remove-photo }
avatar-page-retake-photo = Volver a tomar foto
avatar-page-cancel-button = Cancelar
avatar-page-save-button = Guardar
avatar-page-saving-button = Guardando…
avatar-page-zoom-out-button =
    .title = Reducir
avatar-page-zoom-in-button =
    .title = Ampliar
avatar-page-rotate-button =
    .title = Rotar
avatar-page-camera-error = No se puede inicializar la cámara
avatar-page-new-avatar =
    .alt = nueva foto de perfil
avatar-page-file-upload-error-3 = Ha surgido un problema al subir tu foto de perfil
avatar-page-delete-error-3 = Ha surgido un problema borrando tu foto de perfil
avatar-page-image-too-large-error-2 = El tamaño del archivo de imagen es demasiado grande para cargarlo

## Password change page

pw-change-header =
    .title = Cambiar contraseña
pw-8-chars = Al menos 8 caracteres
pw-not-email = Diferente a tu dirección de correo electrónico
pw-change-must-match = La nueva contraseña coincide con la confirmación
pw-commonly-used = No es una contraseña de uso común
# linkExternal is a link to a mozilla.org support article on password strength
pw-tips = Mantente seguro — no reutilices las contraseñas. Descubre más consejos para <linkExternal>crear contraseñas seguras</linkExternal>.
pw-change-cancel-button = Cancelar
pw-change-save-button = Guardar
pw-change-forgot-password-link = ¿Olvidaste tu contraseña?
pw-change-current-password =
    .label = Introduce la contraseña actual
pw-change-new-password =
    .label = Introduce la nueva contraseña
pw-change-confirm-password =
    .label = Confirmar nueva contraseña
pw-change-success-alert-2 = Contraseña actualizada

## Password create page

pw-create-header =
    .title = Crear contraseña
pw-create-success-alert-2 = Contraseña establecida
pw-create-error-2 = Lo sentimos, ha surgido un problema al establecer tu contraseña

## Delete account page

delete-account-header =
    .title = Eliminar cuenta
delete-account-step-1-2 = Paso 1 de 2
delete-account-step-2-2 = Paso 2 de 2
delete-account-confirm-title-4 = Puede que hayas conectado tu { -product-mozilla-account } a uno o más de los siguientes productos o servicios de { -brand-mozilla } lo que te mantiene seguro y productivo en la web:
delete-account-product-mozilla-account = { -product-mozilla-account }
delete-account-product-mozilla-vpn = { -product-mozilla-vpn }
delete-account-product-mdn-plus = { -product-mdn-plus }
delete-account-product-mozilla-hubs = { -product-mozilla-hubs }
delete-account-product-mozilla-monitor = { -product-mozilla-monitor }
delete-account-product-firefox-relay = { -product-firefox-relay }
delete-account-product-firefox-sync = Sincronizando datos de { -brand-firefox }
delete-account-product-firefox-addons = Complementos de { -brand-firefox }
delete-account-acknowledge = Recuerda que si eliminas tu cuenta:
delete-account-chk-box-2 =
    .label = Puede que pierdas información y funciones guardadas en los productos de { -brand-mozilla }
delete-account-chk-box-3 =
    .label = La reactivación de este correo no implica recuperar la información guardada
delete-account-chk-box-4 =
    .label = Cualquier extensión y tema que hayas publicado en addons.mozilla.org se eliminará
delete-account-continue-button = Continuar
delete-account-password-input =
    .label = Introducir contraseña
delete-account-cancel-button = Cancelar
delete-account-delete-button-2 = Eliminar

## Display name page

display-name-page-title =
    .title = Nombre para mostrar
display-name-input =
    .label = Introduce el nombre para mostrar
submit-display-name = Guardar
cancel-display-name = Cancelar
display-name-update-error-2 = Ha surgido un problema al actualizar tu nombre para mostrar
display-name-success-alert-2 = Nombre visible actualizado

## Recent account activity
## All strings except title indicate an event that occurred from the user's account
## These are displayed as a list with the date when the event occured

recent-activity-title = Actividad reciente de la cuenta
recent-activity-account-create-v2 = Cuenta creada
recent-activity-account-disable-v2 = Cuenta desactivada
recent-activity-account-enable-v2 = Cuenta activada
recent-activity-account-login-v2 = Sesión de cuenta iniciada
recent-activity-account-reset-v2 = Se ha iniciado el restablecimiento de la contraseña
# This string appears under recent account activity when there were email bounces associated with the account, but those were recently cleared (i.e. removed/deleted).
# An email bounce is when an email is sent to an email address and fails/receives a non-delivery receipt from the recipient's mail server.
recent-activity-emails-clearBounces-v2 = Correos rebotados eliminados
recent-activity-account-login-failure = Intento fallido de acceso a la cuenta
recent-activity-account-two-factor-added = Autenticación en dos pasos activada
recent-activity-account-two-factor-requested = Autenticación en dos pasos solicitada
recent-activity-account-two-factor-failure = Autenticación en dos pasos fallida
recent-activity-account-two-factor-success = Autenticación en dos pasos completada con éxito
recent-activity-account-two-factor-removed = Autenticación en dos pasos eliminada
recent-activity-account-password-reset-requested = Se ha solicitado un restablecimiento de contraseña
recent-activity-account-password-reset-success = Contraseña de cuenta restablecida correctamente
recent-activity-account-recovery-key-added = Clave de recuperación de cuenta activada
recent-activity-account-recovery-key-verification-failure = Verificación de clave de recuperación de cuenta fallida
recent-activity-account-recovery-key-verification-success = Verificación de clave de recuperación de cuenta completada con éxito
recent-activity-account-recovery-key-removed = Clave de recuperación de cuenta eliminada
recent-activity-account-password-added = Nueva contraseña añadida
recent-activity-account-password-changed = Contraseña cambiada
recent-activity-account-secondary-email-added = Dirección de correo secundario añadida
recent-activity-account-secondary-email-removed = Dirección de correo secundario eliminada
recent-activity-account-emails-swapped = Correos electrónicos primario y secundario intercambiados
recent-activity-session-destroy = Desconectado de la sesión
recent-activity-account-recovery-phone-send-code = Código de recuperación del teléfono enviado
recent-activity-account-recovery-phone-setup-complete = Se ha completado la configuración del teléfono de recuperación
recent-activity-account-recovery-phone-signin-complete = Se ha completado el inicio de sesión con el teléfono de recuperación
recent-activity-account-recovery-phone-signin-failed = Error al iniciar sesión con el teléfono de recuperación
recent-activity-account-recovery-phone-removed = Teléfono de recuperación eliminado
recent-activity-account-recovery-codes-replaced = Códigos de recuperación reemplazados
recent-activity-account-recovery-codes-created = Códigos de recuperación creados
recent-activity-account-recovery-codes-signin-complete = Se ha completado el inicio de sesión mediante códigos de recuperación
recent-activity-password-reset-otp-sent = Se ha enviado el código de confirmación para restablecer la contraseña
recent-activity-password-reset-otp-verified = Se ha verificado el código de confirmación para restablecer la contraseña
recent-activity-must-reset-password = Se requiere restablecer la contraseña
# Security event was recorded, but the activity details are unknown or not shown to user
recent-activity-unknown = Otra actividad de la cuenta

## PageRecoveryKeyCreate

# The page title displayed at the top of the flow container
recovery-key-create-page-title = Clave de recuperación de cuenta
# Tooltip text and aria label for back arrow that takes users out of the account recovery key generation flow
# and back to account settings
recovery-key-create-back-button-title = Volver a los ajustes

## PageRecoveryPhoneRemove
## Users reach this page from account settings when they want to remove a backup phone number.

recovery-phone-remove-header = Eliminar el número de teléfono de recuperación
# Variables:
#   $formattedFullPhoneNumber (String) - the user's full phone number
settings-recovery-phone-remove-info = Esto eliminará <strong>{ $formattedFullPhoneNumber }</strong> como tu teléfono de recuperación.
settings-recovery-phone-remove-recommend = Te recomendamos que mantengas este método porque es más fácil que guardar códigos de autenticación de respaldo.
# "Saved backup authentication codes" refers to previously saved backup authentication codes
settings-recovery-phone-remove-recovery-methods = Si lo eliminas, asegúrate de que aún tengas guardados los códigos de autenticación de respaldo. <linkExternal>Comparar métodos de recuperación</linkExternal>
settings-recovery-phone-remove-button = Eliminar número de teléfono
settings-recovery-phone-remove-cancel = Cancelar
settings-recovery-phone-remove-success = Teléfono de recuperación eliminado

## PageSetupRecoveryPhone

page-setup-recovery-phone-heading = Añadir teléfono de recuperación
page-change-recovery-phone = Cambiar teléfono de recuperación
page-setup-recovery-phone-back-button-title = Volver a los ajustes
# Back arrow to return to step 1 of recovery phone setup flow
page-setup-recovery-phone-step2-back-button-title = Cambiar número de teléfono

## Add secondary email page

add-secondary-email-step-1 = Paso 1 de 2
add-secondary-email-error-2 = Ha surgido un problema al crear este correo electrónico
add-secondary-email-page-title =
    .title = Correo electrónico secundario
add-secondary-email-enter-address =
    .label = Escribe tu dirección de correo
add-secondary-email-cancel-button = Cancelar
add-secondary-email-save-button = Guardar
# This message is shown when a user tries to add a secondary email that is a
# Firefox Relay email mask (generated email address that can be used in place of
# your real email address)
add-secondary-email-mask = Las máscaras de correo electrónico no se pueden usar como correo electrónico secundario

## Verify secondary email page

add-secondary-email-step-2 = Paso 2 de 2
verify-secondary-email-page-title =
    .title = Correo electrónico secundario
verify-secondary-email-verification-code-2 =
    .label = Introduce tu código de confirmación
verify-secondary-email-cancel-button = Cancelar
verify-secondary-email-verify-button-2 = Confirmar
# This string is an instruction in a form.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
verify-secondary-email-please-enter-code-2 = Por favor, escribe antes de 5 minutos el código de confirmacion que ha sido enviado a <strong>{ $email }</strong>.
# This string is a confirmation message shown after verifying an email.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
verify-secondary-email-success-alert-2 = { $email } añadido correctamente

##

# Link to delete account on main Settings page
delete-account-link = Eliminar cuenta
# Success message displayed in alert bar after the user has successfully confirmed their account is not inactive.
inactive-update-status-success-alert = Has iniciado sesión correctamente. Tu { -product-mozilla-account } y tus datos permanecerán activos.

## Product promotion

product-promo-monitor =
    .alt = { -product-mozilla-monitor }
# Links out to the Monitor site
product-promo-monitor-cta = Hacer un escaneo gratuito

## Profile section

profile-heading = Perfil
profile-picture =
    .header = Imagen
profile-display-name =
    .header = Nombre para mostrar
profile-primary-email =
    .header = Correo electrónico principal

## Progress bar

# This is the aria-label text for the progress bar. The progress bar is meant to visually show the user how much progress they have made through the steps of a given flow.
# Variables:
#   $currentStep (number) - the step which the user is currently on
#   $numberOfSteps (number) - the total number of steps in a given flow
progress-bar-aria-label-v2 = Paso { $currentStep } de { $numberOfSteps }.

## Security section of Setting

security-heading = Seguridad
security-password =
    .header = Contraseña
# This is a string that shows when the user's password was created.
# Variables:
#   $date (String) - a localized date and time string
security-password-created-date = Creado { $date }
security-not-set = No establecido
security-action-create = Crear
security-set-password = Establecer una contraseña para sincronizar y usar ciertas funciones de seguridad de la cuenta.
# Link opens a list of recent account activity (e.g., login attempts, password changes, etc.)
security-recent-activity-link = Ver actividad reciente de la cuenta
signout-sync-header = Sesión expirada
signout-sync-session-expired = Lo sentimos, algo ha salido mal. Cierra la sesión en el menú del navegador y vuelve a intentarlo.

## SubRow component

tfa-row-backup-codes-title = Códigos de autenticación de respaldo
# Only shown for users that have 2FA enabled and verified, but all backup authentication codes have been consumed
# Users that have not enabled or verified 2FA will not see this
tfa-row-backup-codes-not-available = No hay códigos disponibles
# $numCodesRemaining - the number of backup authentication codes that have not yet been used (generally between 1 to 5)
# A different message is shown when no codes are available
tfa-row-backup-codes-available-v2 =
    { $numCodesAvailable ->
        [one] { $numCodesAvailable } código restante
       *[other] { $numCodesAvailable } códigos restantes
    }
# Shown to users who have backup authentication codes - this will allow them to generate new codes to replace the previous ones
tfa-row-backup-codes-get-new-cta-v2 = Crear nuevos códigos
# Shown to users who have no backup authentication codes
# Button to add backup authentication codes when none are configured
tfa-row-backup-codes-add-cta = Añadir
# 'This' refers to 'backup authentication codes', used as a recovery method for two-step authentication
tfa-row-backup-codes-description-2 = Este es el método de recuperación más seguro si no puedes utilizar tu dispositivo móvil o la aplicación de autenticación.
# Recovery phone is a recovery method for two-step authentication
# A recovery code can be sent to the user's phone
tfa-row-backup-phone-title-v2 = Teléfono de recuperación
# Shown with an alert icon to indicate that no recovery phone is configured
tfa-row-backup-phone-not-available-v2 = No se ha añadido ningún número de teléfono
# button to change the configured recovery phone
tfa-row-backup-phone-change-cta = Cambiar
# button to add/configure a recovery phone
tfa-row-backup-phone-add-cta = Añadir
# Button to remove a recovery phone from the user's account
tfa-row-backup-phone-delete-button = Eliminar
# Shown in tooltip on delete button or delete icon
tfa-row-backup-phone-delete-title-v2 = Eliminar teléfono de recuperación
tfa-row-backup-phone-delete-restriction-v2 = Si quieres eliminar tu teléfono de recuperación, primero añade códigos de autenticación de respaldo o desactiva la autenticación de dos pasos para evitar el bloqueo de tu cuenta.
# "this" refers to recovery phone
tfa-row-backup-phone-description-v2 = Este es el método de recuperación más sencillo si no puedes utilizar tu aplicación de autenticación.
# A SIM swap attack is a type of identity theft where an attacker tricks or bribes a mobile carrier
# into transferring a victim's phone number to their own SIM card, enabling access to accounts secured
# with SMS-based two-factor authentication.
tfa-row-backup-phone-sim-swap-risk-link = Saber más sobre el riesgo de intercambio de SIM

## Switch component

# Used as "title" attribute when the switch is "on" and interaction turns the switch to "off"
switch-turn-off = Desactivar
# Used as "title" attribute when the switch is "off" and interaction turns the switch to "on"
switch-turn-on = Activar
# Used as "title" attribute when switch has been interacted with and form is submitting
switch-submitting = Enviando…
switch-is-on = activado
switch-is-off = desactivado

## Sub-section row Defaults

row-defaults-action-add = Añadir
row-defaults-action-change = Cambiar
row-defaults-action-disable = Desactivar
row-defaults-status = Ninguno

## Account recovery key sub-section on main Settings page

rk-header-1 = Clave de recuperación de cuenta
rk-enabled = Activado
rk-not-set = No establecido
rk-action-create = Crear
# Button to delete the existing account recovery key and create a new one
rk-action-change-button = Cambiar
rk-action-remove = Eliminar
rk-key-removed-2 = Clave de recuperación de cuenta eliminada
rk-cannot-remove-key = No se ha podido eliminar la clave de recuperación de tu cuenta.
rk-refresh-key-1 = Actualizar clave de recuperación de cuenta
rk-content-explain = Restaura tu información cuando olvides tu contraseña.
rk-cannot-verify-session-4 = Lo sentimos, ha surgido un problema al confirmar tu sesión
rk-remove-modal-heading-1 = ¿Eliminar clave de recuperación de cuenta?
rk-remove-modal-content-1 =
    En caso de que restablezcas tu contraseña, no podrás
    usar tu clave de recuperación de cuenta para acceder a tus datos. No puedes deshacer esta acción.
rk-remove-error-2 = No se ha podido eliminar la clave de recuperación de tu cuenta
# Icon button to delete user's account recovery key. Text appears in tooltip on hover and as alt text for screen readers.
unit-row-recovery-key-delete-icon-button-title = Eliminar clave de recuperación de cuenta

## Secondary email sub-section on main Settings page

se-heading = Correo electrónico secundario
    .header = Correo electrónico secundario
se-cannot-refresh-email = Lo sentimos, ha surgido un problema al actualizar ese correo.
se-cannot-resend-code-3 = Lo sentimos, ha surgido un problema al enviar el código de confirmación
# This string is used in a notification message near the top of the page.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
se-set-primary-successful-2 = { $email } es ahora tu correo principal
se-set-primary-error-2 = Lo sentimos, ha surgido un problema al cambiar tu correo principal
# This string is used in a notification message near the top of the page.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
se-delete-email-successful-2 = { $email } eliminado correctamente
se-delete-email-error-2 = Lo sentimos, ha surgido un problema al eliminar este correo
se-verify-session-3 = Deberás confirmar tu sesión actual para realizar esta acción
se-verify-session-error-3 = Lo sentimos, ha surgido un problema al confirmar tu sesión
# Button to remove the secondary email
se-remove-email =
    .title = Eliminar correo electrónico
# Button to refresh secondary email status
se-refresh-email =
    .title = Actualizar correo electrónico
se-unverified-2 = sin confirmar
se-resend-code-2 =
    Se requiere confirmación. <button>Reenviar código de confirmación</button>,
    en caso de que no esté en tu bandeja de entrada o carpeta de spam.
# Button to make secondary email the primary
se-make-primary = Hacer principal
se-default-content = Accede a tu cuenta si no puedes conectarte a tu correo principal.
se-content-note-1 =
    Nota: un correo electrónico secundario no restaurará tu información — 
    necesitarás una <a>clave de recuperación de cuenta</a> para eso.
# Default value for the secondary email
se-secondary-email-none = Ninguno

## Two Step Auth sub-section on Settings main page

tfa-row-header = Autenticación en dos pasos
tfa-row-enabled = Activado
tfa-row-disabled-status = Desactivado
tfa-row-action-add = Añadir
tfa-row-action-disable = Desactivar
tfa-row-action-change = Cambiar
tfa-row-button-refresh =
    .title = Actualizar autenticación en dos pasos
tfa-row-cannot-refresh = Lo sentimos, ha surgido un problema al actualizar la autenticación en dos pasos.
tfa-row-enabled-description = Tu cuenta está protegida con la verificación en dos pasos. Tendrás que meter un código que se usa una sola vez de tu app de autenticación cuando entres en tu { -product-mozilla-account }.
# "this" refers to two-step authentication
# Link goes to https://support.mozilla.org/kb/secure-mozilla-account-two-step-authentication
tfa-row-enabled-info-link = Cómo protege tu cuenta
tfa-row-disabled-description-v2 = Ayuda a proteger tu cuenta utilizando una aplicación de autenticación de terceros como segundo paso para iniciar sesión.
tfa-row-cannot-verify-session-4 = Lo sentimos, ha surgido un problema al confirmar tu sesión
tfa-row-disable-modal-heading = ¿Desactivar la autenticación en dos pasos?
tfa-row-disable-modal-confirm = Desactivar
tfa-row-disable-modal-explain-1 =
    No podrás deshacer esta acción. También
    tienes la opción de <linkExternal>reemplazar tus códigos de autenticación de respaldo</linkExternal>.
# Shown in an alert bar after two-step authentication is disabled
tfa-row-disabled-2 = Autenticación en dos pasos desactivada
tfa-row-cannot-disable-2 = La autenticación en dos pasos no ha podido ser desactivada

## TermsPrivacyAgreement
## These terms are used in signin and signup for Firefox account

# This message is followed by a bulleted list
terms-privacy-agreement-intro-2 = Al continuar, aceptas:
# link to Monitor's Terms of Service and Privacy Notice, part of a bulleted list
terms-privacy-agreement-monitor-3 = <mozSubscriptionTosLink>Términos del servicio</mozSubscriptionTosLink> y <mozSubscriptionPrivacyLink>Aviso de privacidad</mozSubscriptionPrivacyLink> de los Servicios de suscripción de { -brand-mozilla }
# links to Mozilla Accounts Terms of Service and Privacy Notice, part of a bulleted list
terms-privacy-agreement-mozilla = <mozillaAccountsTos>Términos de servicio</mozillaAccountsTos> y <mozillaAccountsPrivacy>Aviso de privacidad</mozillaAccountsPrivacy> de { -product-mozilla-accounts(capitalization: "uppercase") }
# links to Mozilla Account's Terms of Service and Privacy Notice
terms-privacy-agreement-default-2 = Al continuar, aceptas los <mozillaAccountsTos>Términos de servicio</mozillaAccountsTos> y <mozillaAccountsPrivacy>Aviso de privacidad</mozillaAccountsPrivacy>

## ThirdPartyAuth component
## This is a component that is used to display a list of third party providers (Apple, Google, etc.)

# This appears when a user has the option to authenticate via third party accounts in addition to their Firefox account.
# Firefox account login appears on top, and third party options appear on bottom.
# This string appears as a separation between the two, in the following order: "Enter your password" "Or"(this string) (continue-with-google-button with aria equivalent text) / (continue-with-apple-button with aria equivalent text)
third-party-auth-options-or = O
continue-with-google-button = Continuar con { -brand-google }
continue-with-apple-button = Continuar con { -brand-apple }

## Auth-server based errors that originate from backend service

auth-error-102 = Cuenta desconocida
auth-error-103 = Contraseña incorrecta
auth-error-105-2 = Código de confirmación no válido
auth-error-110 = Token no válido
# Error shown to users when they have attempted a request (e.g., requesting a password reset) too many times
# and their requests have been throttled, but the specific amount of time before they can retry is unknown.
auth-error-114-generic = Has probado demasiadas veces. Inténtalo más tarde.
# This string is the amount of time required before a user can attempt another request.
# Variables:
#   $retryAfter (String) - Time required before retrying a request. The variable is localized by our
#                          formatting library (momentjs) as a "time from now" and automatically includes
#                          the prefix as required by the current locale (for example, "in 15 minutes", "dans 15 minutes").
auth-error-114 = Has probado demasiadas veces. Vuelve a intentarlo { $retryAfter }.
auth-error-125 = Se bloqueó la solicitud por motivos de seguridad
auth-error-129-2 = Has escrito un número de teléfono no válido. Verifícalo y prueba de nuevo.
auth-error-138-2 = Sesión no confirmada
auth-error-139 = El correo electrónico secundario debe ser diferente del correo electrónico de tu cuenta
auth-error-155 = Token TOTP no encontrado
# Error shown when the user submits an invalid backup authentication code
auth-error-156 = Código de autenticación de respaldo no encontrado
auth-error-159 = Clave de recuperación de cuenta no válida
auth-error-183-2 = Código de confirmación no válido o caducado
auth-error-202 = Función no activada
auth-error-203 = Sistema no disponible, vuelve a intentarlo más tarde
auth-error-206 = No se puede crear la contraseña, la contraseña ya está establecida
auth-error-214 = El número de teléfono de recuperación ya existe
auth-error-215 = El número de teléfono de recuperación no existe
auth-error-216 = Se alcanzó el límite de mensajes de texto
auth-error-218 = No se puede eliminar el teléfono de recuperación, faltan los códigos de autenticación de respaldo.
auth-error-219 = Este número de teléfono está registrado con demasiadas cuentas. Prueba con otro número.
auth-error-999 = Error inesperado
auth-error-1001 = Se ha cancelado el inicio de sesión
auth-error-1002 = La sesión expiró. Inicia sesión para continuar.
auth-error-1003 = El almacenamiento local o las cookies siguen desactivados
auth-error-1008 = La nueva contraseña debe ser diferente
auth-error-1010 = Introduce una contraseña válida
auth-error-1011 = Se requiere un correo válido
auth-error-1018 = Se ha devuelto el correo de confirmación. ¿Estaba mal escrito?
auth-error-1020 = ¿Escribiste mal tu correo electrónico? firefox.com no es un servicio de correo electrónico válido
auth-error-1031 = Debes introducir la edad para registrarte
auth-error-1032 = Debes introducir una edad válida para registrarte
auth-error-1054 = Código de autenticación en dos pasos incorrecto
auth-error-1056 = Código de autenticación de respaldo no válido
auth-error-1062 = Redirección no válida
# Shown when a user tries to sign up with an email address with a domain that doesn't receive emails
auth-error-1064 = ¿Escribiste mal tu correo electrónico? { $domain } no es un servicio de correo electrónico válido.
auth-error-1066 = Las máscaras de correo electrónico no pueden utilizarse para crear una cuenta.
auth-error-1067 = ¿Correo electrónico mal escrito?
# Displayed when we want to reference a user's previously set up recovery phone
# number, but they are not completely signed in yet. We'll only show the last 4 digits.
# Variables:
#  $lastFourPhoneNumber (Number) - The last 4 digits of the user's recovery phone number
recovery-phone-number-ending-digits = Número que termina en { $lastFourPhoneNumber }
oauth-error-1000 = Algo ha salido mal. Cierra la pestaña y vuelve a intentarlo.

## Connect Another Device page

# A user will only see this header if they are signed in. The header will be preceded by a green checkmark (rtl/ltr sensitive)
connect-another-device-signed-in-header = Has iniciado sesión en { -brand-firefox }
# A "success" message visible to users who verified via email
connect-another-device-email-confirmed-banner = Correo electrónico confirmado
# A "success" message visible to users who verified via sign-in
connect-another-device-signin-confirmed-banner = Inicio de sesión confirmado
# A message prompts the user to sign in to this instance of the Firefox browser so as to complete device sync. This is followed by a link labeled "Sign in"
connect-another-device-signin-to-complete-message = Inicia sesión en este { -brand-firefox } para completar la configuración
# A link for the user to sign in to the current Firefox browser, preceded by a message prompting the user to sign in so as to complete the device sync setup
connect-another-device-signin-link = Iniciar sesión
# A message prompting the user to sign in via a different device than the current one so as to complete the device-syncing process
connect-another-device-still-adding-devices-message = ¿Aún añadiendo dispositivos? Inicia sesión con { -brand-firefox } en otro dispositivo para completar la configuración.
# A message prompting the user to sign in via a different device than the current one so as to complete the device-syncing process
connect-another-device-signin-another-device-to-complete-message = Inicia sesión con { -brand-firefox } en otro dispositivo para completar la configuración.
# This message is a value-proposition prompting the user to sync another device so as to get tabs, bookmarks, and passwords shared between devices
connect-another-device-get-data-on-another-device-message = ¿Quieres tener tus pestañas, marcadores y contraseñas en otro dispositivo?
# This link leads the user back to the `/pair` page so as to connect another device
connect-another-device-cad-link = Conectar otro dispositivo
# This link cancels the process of connecting another device, and takes the user back to Account Settings
connect-another-device-not-now-link = Ahora no
# This is a message for Firefox Android users, prompting them to complete the process of connecting another device by signing into Firefox for Android
connect-another-device-android-complete-setup-message = Inicia sesión en { -brand-firefox } para Android para completar la configuración.
# This is a message for Firefox iOS users, prompting them to complete the process of connecting another device by signing into Firefox for iOS
connect-another-device-ios-complete-setup-message = Inicia sesión en { -brand-firefox } para iOS para completar la configuración.

## Cookies disabled page
## Users will see this page if they have local storage or cookies disabled.

cookies-disabled-header = Se requiere almacenamiento local y cookies
cookies-disabled-enable-prompt-2 = Por favor, activa las cookies y el almacenamiento local en tu navegador para acceder a { -product-mozilla-account }. Si lo haces, se activarán funcionalidades como recordar tus datos entre sesiones.
# A button users may click to check if cookies and local storage are enabled and be directed to the previous page if so.
cookies-disabled-button-try-again = Reintentar
# An external link going to: https://support.mozilla.org/kb/cookies-information-websites-store-on-your-computer
cookies-disabled-learn-more = Saber más

## Index / home page

index-header = Escribe tu correo electrónico
index-sync-header = Continuar a tu { -product-mozilla-account }
index-sync-subheader = Sincroniza tus contraseñas, pestañas y marcadores donde sea que uses { -brand-firefox }.
index-relay-header = Crear una máscara de correo electrónico
index-relay-subheader = Por favor, proporciona la dirección de correo electrónico a la que deseas reenviar correos electrónicos desde tu correo enmascarado.
# $serviceName - the service (e.g., Pontoon) that the user is signing into with a Mozilla account
index-subheader-with-servicename = Continuar a { $serviceName }
index-subheader-default = Continuar a configuración de cuenta
index-cta = Regístrate o inicia sesión
index-account-info = Una { -product-mozilla-account } también desbloquea el acceso a más productos de protección de privacidad de { -brand-mozilla }.
index-email-input =
    .label = Escribe tu correo electrónico
# When users delete their Mozilla account inside account Settings, they are redirected to this page with a success message
index-account-delete-success = Cuenta eliminada correctamente
# Displayed when users try to sign up for an account and their confirmation code email bounces
index-email-bounced = Tu correo de confirmación acaba de ser devuelto. ¿Has escrito bien tu dirección?

## InlineRecoveryKeySetup page component

inline-recovery-key-setup-create-error = ¡Vaya! No hemos podido crear tu clave de recuperación de cuenta. Prueba de nuevo más tarde.
inline-recovery-key-setup-recovery-created = Clave de recuperación de cuenta creada
inline-recovery-key-setup-download-header = Asegura tu cuenta
inline-recovery-key-setup-download-subheader = Descárgala y guárdala ahora
inline-recovery-key-setup-download-info = Guarda esta clave en algún lugar que puedas recordar — no podrás volver a esta página más tarde.
inline-recovery-key-setup-hint-header = Recomendación de seguridad

## InlineTotpSetup page
## TOTP (time-based one-time password) is a form of two-factor authentication (2FA).

inline-totp-setup-cancel-setup-button = Cancelar configuración
inline-totp-setup-continue-button = Continuar
# <authenticationAppsLink> links to a list of security apps
inline-totp-setup-add-security-link = Añade una capa de seguridad a tu cuenta requiriendo códigos de autenticación de una de <authenticationAppsLink>estas aplicaciones de autenticación</authenticationAppsLink>.
#  The <enable2StepDefaultSpan> elements are just visual separation here
inline-totp-setup-enable-two-step-authentication-default-header-2 = Activa la autenticación en dos pasos <span>para continuar con la configuración de la cuenta</span>
# { $serviceName } is the name of the service which the user wants to authenticate to. The <enable2StepCustomServiceSpan> elements are just visual separation
inline-totp-setup-enable-two-step-authentication-custom-header-2 = Activa la autenticación en dos pasos <span>para continuar con { $serviceName }</span>
inline-totp-setup-ready-button = Listo
# The authentication code a user is scanning is a QR code.
# { $serviceName } is the name of the service which the user wants to authenticate to. The <scanAuthCodeHeaderSpan> elements are just visual separation
inline-totp-setup-show-qr-custom-service-header-2 = Escanea el código de autenticación <span> para continuar con { $serviceName }</span>
# { $serviceName } is the name of the service which the user wants to authenticate to. The <enterCodeManuallyHeaderSpan> elements are just visual separation
inline-totp-setup-no-qr-custom-service-header-2 = Introduce el código manualmente <span>para continuar con { $serviceName }</span>
# The authentication code a user is scanning is a QR code.
# The <scanAuthHeaderSpan> elements are just visual separation
inline-totp-setup-show-qr-default-service-header-2 = Escanea el código de autenticación <span>para continuar con la configuración de la cuenta</span>
# The <enterCodeManuallyHeaderSpan> elements are just visual separation
inline-totp-setup-no-qr-default-service-header-2 = Introduce el código manualmente <span>para continuar con la configuración de la cuenta</span>
# The <toggleToQRButton> allows the user to use a QR code instead of manually entering a secret key
inline-totp-setup-enter-key-or-use-qr-instructions = Escribe esta clave secreta en tu aplicación de autenticación. <toggleToQRButton>¿Prefieres escanear el código QR?</toggleToQRButton>
# The <toggleToManualModeButton> allows the user to manually enter a secret key instead of scanning a QR code
inline-totp-setup-use-qr-or-enter-key-instructions = Escanea el código QR en tu aplicación de autenticación y luego introduce el código de autenticación que te proporciona. <toggleToManualModeButton>¿No puedes escanear el código?</toggleToManualModeButton>
# The "authentication code" here refers to the code provided by an authentication app.
inline-totp-setup-on-completion-description = Una vez completado, comenzará a generar códigos de seguridad para ti
# The "authentication code" here refers to the code provided by an authentication app.
inline-totp-setup-security-code-placeholder = Código de autenticación
# The "authentication code" here refers to the code provided by an authentication app.
inline-totp-setup-code-required-error = Código de autenticación requerido
tfa-qr-code-alt = Usa el código { $code } para configurar la autenticación en dos pasos en las aplicaciones admitidas.
inline-totp-setup-page-title = Autenticación en dos pasos

## Legal page. This page contains simply a header and links to pages that display
## content from https://github.com/mozilla/legal-docs

legal-header = Legal
# Links to our internal "Firefox Cloud" /legal/terms page
legal-terms-of-service-link = Términos del servicio
# Links to our internal "Firefox Cloud" /legal/terms page
legal-privacy-link = Aviso de privacidad

## Legal privacy notice page. Most content comes from https://github.com/mozilla/legal-docs

legal-privacy-heading = Aviso de privacidad

## Legal terms of service page. Most content comes from https://github.com/mozilla/legal-docs

legal-terms-heading = Términos del servicio

## AuthAllow page - Part of the device pairing flow

pair-auth-allow-heading-text = ¿Acabas de iniciar sesión en { -product-firefox }?
# Submit button to confirm that the user initiated the device pairing
# and that they approve of the new device being added to their account
pair-auth-allow-confirm-button = Sí, aprobar dispositivo
# "If this wasn't you" means "If it wasn't you that just signed in to Firefox"
# The text with the <link> tags links to a `reset password` page
pair-auth-allow-refuse-device-link = Si no fuiste tú, <link>cambia tu contraseña</link>.

## PairAuthComplete page - part of the device pairing flow

# Heading to confirm the successful pairing of a new device with the user's account
# Device here is non specific (could be a laptop, tablet, phone, etc.)
pair-auth-complete-heading = Dispositivo conectado
# Variable { $deviceFamily } is generally a browser name, for example "Firefox"
# Variable { $deviceOS } is an operating system short name, for example "iOS", "Android"
pair-auth-complete-now-syncing-device-text = Ahora estás sincronizando con: { $deviceFamily } en { $deviceOS }
pair-auth-complete-sync-benefits-text = Ahora puedes acceder a tus pestañas abiertas, contraseñas y marcadores en todos tus dispositivos.
pair-auth-complete-see-tabs-button = Ver pestañas de dispositivos sincronizados
pair-auth-complete-manage-devices-link = Administrar dispositivos

## AuthTotp page
## TOTP (time-based one-time password) is a form of two-factor authentication (2FA).
## Users that have set up two-factor authentication land on this page during device pairing.

# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "to continue to account settings" can stand alone as "Continue to account settings"
auth-totp-heading-w-default-service = Introduce el código de autenticación <span>para continuar con la configuración de la cuenta</span>
# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "to continue to { $serviceName }" can stand alone as "Continue to { $serviceName }"
# { $serviceName } represents a product name (e.g., Mozilla VPN) that will be passed in as a variable
auth-totp-heading-w-custom-service = Introduce el código de autenticación <span>para continuar en { $serviceName }</span>
auth-totp-instruction = Abre tu aplicación de autenticación e introduce el código de autenticación que te proporciona.
auth-totp-input-label = Introduce el código de 6 dígitos
# Form button to confirm if the authentication code entered by the user is valid
auth-totp-confirm-button = Confirmar
# Error displayed in a tooltip when the form is submitted without a code
auth-totp-code-required-error = Código de autenticación requerido

## WaitForSupp page - Part of the devide pairing flow
## Users see this page when they have started to pair a second (or more) device to their account
## The pairing must be approved from both devices to succeed

# The "other device" is non-specific and could be a desktop computer, laptop, tablet, mobile phone, etc.
# Strings within the <span> elements appear as a subheading.
pair-wait-for-supp-heading-text = Se requiere aprobación <span>desde tu otro dispositivo</span>

## PairFailure - a view which displays on failure of the device pairing process

pair-failure-header = Ha fallado el emparejamiento
pair-failure-message = Proceso de configuración interrumpido.

## Pair index page

pair-sync-header = Sincronizar { -brand-firefox } en tu teléfono o tableta
pair-cad-header = Conectar { -brand-firefox } en otro dispositivo
pair-already-have-firefox-paragraph = ¿Ya tienes { -brand-firefox } en un teléfono o tableta?
# Clicking this button initiates the pairing process, usually by directing the user to the `about:preferences` page in Firefox
pair-sync-your-device-button = Sincroniza tu dispositivo
# This is a heading element immediately preceded by "Sync your device" and followed by a link and QR code to download Firefox
pair-or-download-subheader = O descargar
# Directs user to scan a QR code to download Firefox. <linkExternal> is an anchor tag that directs the user to where they can download the { -brand-firefox } app
pair-scan-to-download-message = Escanea para descargar { -brand-firefox } para dispositivos móviles o envíate un <linkExternal>enlace de descarga</linkExternal>.
# This allows the user to exit the sync/pair flow, and redirects them back to Settings
pair-not-now-button = Ahora no
pair-take-your-data-message = Lleva tus pestañas, marcadores y contraseñas a cualquier lugar donde uses { -brand-firefox }.
# This initiates the pairing process, usually by directing the user to the `about:preferences` page in Firefox
pair-get-started-button = Comenzar
# This is the aria label on the QR code image
pair-qr-code-aria-label = Código QR

## PairSuccess - a view which displays  on successful completion of the device pairing process

pair-success-header-2 = Dispositivo conectado
pair-success-message-2 = Emparejamiento correcto.

## SuppAllow page - Part of the device pairing flow
## Users see this page when they have started to pair a second (or more) device to their account
## The pairing must be confirmed from both devices to succeed

# Strings within the <span> elements appear as a subheading.
# Variable $email is the user's email address
pair-supp-allow-heading-text = Confirmar emparejamiento <span>para { $email }</span>
pair-supp-allow-confirm-button = Confirmar emparejamiento
pair-supp-allow-cancel-link = Cancelar

## WaitForAuth page - Part of the devide pairing flow
## Users see this page when they have started to pair a second (or more) device to their account
## The pairing must be approved from both devices to succeed

# The "other device" is non-specific and could be a desktop computer, laptop, tablet, mobile phone, etc.
# Strings within the <span> elements appear as a subheading.
pair-wait-for-auth-heading-text = Se requiere aprobación <span>desde tu otro dispositivo</span>

## PairUnsupported - a view which is shown when the user tries to scan the pairing QR code any way other than through a Firefox app

pair-unsupported-header = Conectarse mediante una aplicación
pair-unsupported-message = ¿Has usado la cámara del sistema? Tienes que conectarla desde una aplicación de { -brand-firefox }.

## SetPassword page
## Third party auth users that do not have a password set yet are prompted for a


# password to complete their sign-in when they want to login to a service requiring it.

set-password-heading-v2 = Crea una contraseña para sincronizar

## ThirdPartyAuthCallback Page
## This page is called after a user completes the third party authentication flow from Google or Apple.

third-party-auth-callback-message = Espera, estás siendo redirigido a la aplicación autorizada.

## AccountRecoveryConfirmKey page

account-recovery-confirm-key-heading = Introduce tu clave de recuperación de cuenta
account-recovery-confirm-key-instruction = Esta clave recupera tus datos de navegación cifrados, como contraseñas y marcadores, desde los servidores de { -brand-firefox }.
# Prompts the user to enter their account recovery key
# Account recovery key contains a mix of letters and numbers, no special characters
account-recovery-confirm-key-input-label =
    .label = Escribe tu clave de recuperación de cuenta de 32 caracteres
# When setting up an account recovery key, users have the option of storing an account recovery key hint that is shown during password reset
account-recovery-confirm-key-hint = Tu sugerencia de almacenamiento es:
# Clicking this button checks if the recovery key provided by the user is correct and associated with their account
account-recovery-confirm-key-button-2 = Continuar
# Link that leads to the password reset page (without recovery code)
account-recovery-lost-recovery-key-link-2 = ¿No puedes encontrar tu clave de recuperación de cuenta?

## CompleteResetPassword component
## User followed a password reset link and is now prompted to create a new password

complete-reset-pw-header-v2 = Crear una nueva contraseña
# A new password was successfully set for the user's account
# Displayed in an alert bar
complete-reset-password-success-alert = Contraseña establecida
# An error occurred while attempting to set a new password (password reset flow)
# Displayed in an alert bar
complete-reset-password-error-alert = Lo sentimos, ha surgido un problema al establecer tu contraseña
# Link to go back and use an account recovery key before resetting the password
complete-reset-pw-recovery-key-link = Usar la clave de recuperación de la cuenta
# A message informing the user that the password reset was successful and reminding them to create another recovery key
# Displayed on the sign in page
reset-password-complete-banner-heading = Se ha restablecido tu contraseña maestra.
reset-password-complete-banner-message = No olvides generar una nueva clave de recuperación de cuenta desde la configuración de { -product-mozilla-account } para evitar futuros problemas de conexión.
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
complete-reset-password-desktop-relay = { -brand-firefox } intentará enviarte nuevamente donde estabas para que uses una máscara de correo electrónico después de iniciar sesión.

# ConfirmBackupCodeResetPassword page

confirm-backup-code-reset-password-input-label = Introduce el código de 10 caracteres
confirm-backup-code-reset-password-confirm-button = Confirmar
confirm-backup-code-reset-password-subheader = Introduce el código de autenticación de respaldo
confirm-backup-code-reset-password-instruction = Introduce uno de los códigos de un solo uso que guardaste al configurar la autenticación en dos pasos.
# Link out to support article: https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication
confirm-backup-code-reset-password-locked-out-link = ¿Estás bloqueado?

## Confirm Reset Password With Code

confirm-reset-password-with-code-heading = Comprueba tu correo
# Text within span appears in bold
# $email - email address for which a password reset was requested
confirm-reset-password-with-code-instruction = Hemos enviado un código de confirmación a <span>{ $email }</span>.
# Shown above a group of 8 single-digit input boxes
# Only numbers allowed
confirm-reset-password-code-input-group-label = Introduce el código de 8 dígitos dentro de los próximos 10 minutos
# Clicking the button submits and verifies the code
# If succesful, continues to the next step of the password reset
confirm-reset-password-otp-submit-button = Continuar
# Button to request a new reset password confirmation code
confirm-reset-password-otp-resend-code-button = Reenviar código
# Link to cancel the password reset and sign in with a different account
confirm-reset-password-otp-different-account-link = Usar una cuenta diferente

## PasswordResetConfirmTotp Page

confirm-totp-reset-password-header = Restablecer tu contraseña
confirm-totp-reset-password-subheader-v2 = Escribir el código de autenticación en dos pasos
confirm-totp-reset-password-instruction-v2 = Comprueba tu <strong>aplicación de autenticación</strong> para restablecer tu contraseña.
confirm-totp-reset-password-trouble-code = ¿Problemas para introducir el código?
confirm-totp-reset-password-confirm-button = Confirmar
confirm-totp-reset-password-input-label-v2 = Introduce el código de 6 dígitos
confirm-totp-reset-password-use-different-account = Usar una cuenta diferente

## ResetPassword start page

password-reset-flow-heading = Restablecer tu contraseña
password-reset-body-2 =
    Te pediremos un par de cosas que solo tú sabes para mantener tu cuenta
    segura.
password-reset-email-input =
    .label = Escribe tu correo electrónico
password-reset-submit-button-2 = Continuar

## ResetPasswordConfirmed

reset-password-complete-header = Se ha restablecido tu contraseña
# $serviceName is a product name such as Monitor, Relay
reset-password-confirmed-cta = Continuar a { $serviceName }

## Reset password recovery method page
## This page is shown to users when they are having trouble resetting their


# password, and they previously had set up an account recovery method.

password-reset-recovery-method-header = Restablecer tu contraseña
password-reset-recovery-method-subheader = Elige un método de recuperación
# This is displayed to the user when they are choosing an alternative method to authenticate themself in the password reset process when they do not have access to their two-factor authenticator application
password-reset-recovery-method-details = Asegurémonos de que seas tú quien utiliza tus métodos de recuperación.
password-reset-recovery-method-phone = Teléfono de recuperación
password-reset-recovery-method-code = Códigos de autenticación de respaldo
# Variable: $numBackupCodes (String) - The number of backup authentication codes the user has left, e.g., 4
password-reset-recovery-method-code-info =
    { $numBackupCodes ->
        [one] { $numBackupCodes } código restante
       *[other] { $numBackupCodes } códigos restantes
    }
# Shown when a backend service fails and a code cannot be sent to the user's recovery phone.
password-reset-recovery-method-send-code-error-heading = Se ha producido un problema al enviar un código a tu teléfono de recuperación
password-reset-recovery-method-send-code-error-description = Por favor, vuelve a intentarlo más tarde o utiliza tus códigos de autenticación de respaldo.

## ResetPasswordRecoveryPhone page

reset-password-recovery-phone-flow-heading = Restablecer tu contraseña
# A recovery code in context of this page is a one time code sent to the user's phone
reset-password-recovery-phone-heading = Introducir código de recuperación
# Text that explains the user should check their phone for a recovery code
# $maskedPhoneNumber - The users masked phone number
reset-password-recovery-phone-instruction-v3 = Se ha enviado un código de 6 dígitos al número de teléfono terminado en <span>{ $lastFourPhoneDigits }</span> por mensaje de texto. Este código caduca en 5 minutos. No compartas este código con nadie.
reset-password-recovery-phone-input-label = Introduce el código de 6 dígitos
reset-password-recovery-phone-code-submit-button = Confirmar
reset-password-recovery-phone-resend-code-button = Reenviar código
reset-password-recovery-phone-resend-success = Código enviado
# links to https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication
reset-password-recovery-phone-locked-out-link = ¿Estás bloqueado?
reset-password-recovery-phone-send-code-error-heading = Se ha producido un problema al enviar un código.
reset-password-recovery-phone-code-verification-error-heading = Se ha producido un problema al verificar tu código.
# Follows the error message (e.g, "There was a problem sending a code")
reset-password-recovery-phone-general-error-description = Por favor, vuelve a intentarlo más tarde.
reset-password-recovery-phone-invalid-code-error-description = El código no es válido o ha expirado.
reset-password-recovery-phone-invalid-code-error-link = ¿Utilizar códigos de autenticación de respaldo en su lugar?
reset-password-with-recovery-key-verified-page-title = Contraseña restablecida correctamente
reset-password-complete-new-password-saved = ¡Nueva contraseña guardada!
reset-password-complete-recovery-key-created = Se ha creado una nueva clave de recuperación de cuenta. Descárgala y guárdala ahora.
reset-password-complete-recovery-key-download-info =
    Esta clave es esencial para
    la recuperación de datos si olvidas tu contraseña. <b>Descárgala y guárdala de manera segura
    ahora mismo, ya que no podrás volver a esta página más tarde.</b>

## CompleteSignin component

# This is a label that precedes any error which could arise from trying to validate the user's signin
error-label = Error:
# This is a message that is shown to users along with a "Loading" spinner while the site tries to check their signin
validating-signin = Validando inicio de sesión…
# Shown above an error banner (e.g., invalid confirmation code, unexpected error)
complete-signin-error-header = Error de confirmación
# The user followed a signin confirmation link, but that link is expired and no longer valid
signin-link-expired-header = Enlace de confirmación expirado
signin-link-expired-message-2 = El enlace en el que hiciste clic ha caducado o ya ha sido utilizado.

## Signin page

# Strings within the <span> elements appear as a subheading.
signin-password-needed-header-2 = Introduce tu contraseña <span>para tu { -product-mozilla-account }</span>
# $serviceName - the name of the service which the user authenticating for
# For languages structured like English, the phrase can read "to continue to { $serviceName }"
signin-subheader-without-logo-with-servicename = Continuar a { $serviceName }
signin-subheader-without-logo-default = Continuar a configuración de cuenta
signin-button = Iniciar sesión
signin-header = Iniciar sesión
signin-use-a-different-account-link = Usar una cuenta diferente
signin-forgot-password-link = ¿Olvidaste tu contraseña?
signin-password-button-label = Contraseña
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-desktop-relay = { -brand-firefox } intentará enviarte nuevamente donde estabas para que uses una máscara de correo electrónico después de iniciar sesión.
signin-code-expired-error = El código ha caducado. Por favor, inicia sesión de nuevo.
signin-account-locked-banner-heading = Restablecer tu contraseña
signin-account-locked-banner-description = Hemos bloqueado tu cuenta para protegerla de actividades sospechosas.
# This link points to https://accounts.firefox.com/reset_password
signin-account-locked-banner-link = Restablece tu contraseña para iniciar sesión

## ReportSignin Page
## When users receive an "Is this you signing in?" email with an unblock code,
## they can click "report it to us" if they did not attempt to sign in.
## This will be the page shown to users to block the sign in and report it.

report-signin-link-damaged-body = Al enlace que has pulsado le faltan caracteres y puede que tu cliente de correo lo haya roto. Copia la dirección con cuidado y vuelve a intentarlo.
report-signin-header = ¿Informar de un inicio de sesión no autorizado?
report-signin-body = Has recibido un correo electrónico sobre un intento de acceso a tu cuenta. ¿Quieres informar de esta actividad como sospechosa?
report-signin-submit-button = Informar de actividad
report-signin-support-link = ¿Por qué sucede esto?
report-signin-error = Lo sentimos, ha habido un problema al enviar el informe.
signin-bounced-header = Lo sentimos. Hemos bloqueado tu cuenta.
# $email (string) - The user's email.
signin-bounced-message = El correo electrónico de confirmación enviado a { $email } fue devuelto y hemos bloqueado tu cuenta para proteger tus datos de { -brand-firefox }.
# linkExternal is button which logs the user's action and navigates them to mozilla support
signin-bounced-help = Si esta es una dirección de correo válida, <linkExternal>háznoslo saber</linkExternal> y podremos ayudarte a desbloquear tu cuenta.
signin-bounced-create-new-account = ¿Ese correo electrónico ya no es tuyo? Crea una cuenta nueva
back = Atrás

## SigninPushCode page
## This page is used to send a push notification to the user's device for two-factor authentication (2FA).

signin-push-code-heading-w-default-service = Verifica este inicio de sesión <span>para continuar con la configuración de la cuenta</span>
signin-push-code-heading-w-custom-service = Verifica este inicio de sesión <span>para continuar a { $serviceName }</span>
signin-push-code-instruction = Por favor, verifica tus otros dispositivos y aprueba esta conexión desde tu navegador { -brand-firefox }.
signin-push-code-did-not-recieve = ¿No has recibido la notificación?
signin-push-code-send-email-link = Enviar código por correo electrónico

## SigninPushCodeConfirmPage

signin-push-code-confirm-instruction = Confirma tu inicio de sesión
signin-push-code-confirm-description = Hemos detectado un intento de inicio de sesión desde el siguiente dispositivo. Si has sido tú, por favor, aprueba el inicio de sesión
signin-push-code-confirm-verifying = Verificando
signin-push-code-confirm-login = Confirmar inicio de sesión
signin-push-code-confirm-wasnt-me = No he sido yo, cambiar la contraseña.
signin-push-code-confirm-login-approved = Se ha aprobado tu inicio de sesión. Puedes cerrar esta ventana.
signin-push-code-confirm-link-error = El enlace está dañado. Prueba de nuevo.

## Signin recovery method page
## This page is shown to users when they are having trouble signing in with
## their password, and they previously had set up an account recovery method.

signin-recovery-method-header = Iniciar sesión
signin-recovery-method-subheader = Elige un método de recuperación
signin-recovery-method-details = Asegurémonos de que seas tú quien utiliza tus métodos de recuperación.
signin-recovery-method-phone = Teléfono de recuperación
signin-recovery-method-code-v2 = Códigos de autenticación de respaldo
# Variable: $numBackupCodes (String) - The number of backup authentication codes the user has left, e.g., 4
signin-recovery-method-code-info-v2 =
    { $numBackupCodes ->
        [one] { $numBackupCodes } código restante
       *[other] { $numBackupCodes } códigos restantes
    }
# Shown when a backend service fails and a code cannot be sent to the user's recovery phone.
signin-recovery-method-send-code-error-heading = Ha habido un problema al enviar un código a tu teléfono de recuperación
signin-recovery-method-send-code-error-description = Por favor, vuelve a intentarlo más tarde o utiliza tus códigos de autenticación de respaldo.

## SigninRecoveryCode page
## Users are prompted to enter a backup authentication code
## (provided to the user when they first set up two-step authentication)
## when they are unable to sign in with two-step authentication (e.g., Authy, Duo, etc.)

signin-recovery-code-heading = Iniciar sesión
signin-recovery-code-sub-heading = Introduce el código de autenticación de respaldo
# codes here refers to backup authentication codes
signin-recovery-code-instruction-v3 = Introduce uno de los códigos de un solo uso que guardaste al configurar la autenticación en dos pasos.
# code here refers to backup authentication code
signin-recovery-code-input-label-v2 = Introduce el código de 10 caracteres
# Form button to confirm if the backup authentication code entered by the user is valid
signin-recovery-code-confirm-button = Confirmar
# Link to go to the page to use recovery phone instead
signin-recovery-code-phone-link = Usar teléfono de recuperación
# External link for support if the user can't use two-step autentication or a backup authentication code
# https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication
signin-recovery-code-support-link = ¿Estás bloqueado?
# Error displayed in a tooltip when form is submitted witout a code
signin-recovery-code-required-error = Se requiere un código de autenticación de respaldo
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-recovery-code-use-phone-failure = Se ha producido un problema al enviar un código a tu teléfono de recuperación
signin-recovery-code-use-phone-failure-description = Por favor, vuelve a intentarlo más tarde.

## SigninRecoveryPhone page

signin-recovery-phone-flow-heading = Iniciar sesión
# A recovery code in context of this page is a one time code sent to the user's phone
signin-recovery-phone-heading = Introducir código de recuperación
# Text that explains the user should check their phone for a recovery code
# $maskedPhoneNumber - The users masked phone number
signin-recovery-phone-instruction-v3 = Se ha enviado un código de 6 dígitos por SMS al número de teléfono que termina en <span>{ $lastFourPhoneDigits }</span>. Este código caduca en 5 minutos. No lo compartas con nadie.
signin-recovery-phone-input-label = Introduce el código de 6 dígitos
signin-recovery-phone-code-submit-button = Confirmar
signin-recovery-phone-resend-code-button = Reenviar código
signin-recovery-phone-resend-success = Código enviado
# links to https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication
signin-recovery-phone-locked-out-link = ¿Estás bloqueado?
signin-recovery-phone-send-code-error-heading = Se ha producido un problema al enviar un código.
signin-recovery-phone-code-verification-error-heading = Se ha producido un problema al verificar tu código.
# Follows the error message (e.g, "There was a problem sending a code")
signin-recovery-phone-general-error-description = Por favor, vuelve a intentarlo más tarde.
signin-recovery-phone-invalid-code-error-description = El código no es válido o ha expirado.
signin-recovery-phone-invalid-code-error-link = ¿Utilizar códigos de autenticación de respaldo en su lugar?
# "Limits" refers to potential restrictions on how often a recovery phone number can be used for signing in within a given time period.
# If limits are reached, users may have to use an alternate two-step authentication method or wait until the restriction period is over.
signin-recovery-phone-success-message = Se ha iniciado sesión correctamente. Se pueden aplicar límites si vuelves a usar tu teléfono de recuperación.

## Signin reported page: this page is shown when a user receives an email notifying them of a new account signin, and the user clicks a button indicating that the signin was not them so that we know it was someone trying to break into their account.

signin-reported-header = Gracias por tu vigilancia
signin-reported-message = Se ha notificado a nuestro equipo. Informes como éste nos permiten mantener a raya a los intrusos.

## SigninTokenCode page
## Users see this page during the signin process. In this instance, the confirmation code is
## a 6-digit code that is sent to the user's email address.

# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "for your { -product-mozilla-account }"
# can stand alone as "{ -product-mozilla-account }"
signin-token-code-heading-2 = Introduce el código de confirmación <span> para tu { -product-mozilla-account }</span>
# { $email } represents the email that the user entered to sign in
signin-token-code-instruction-v2 = Introduce en un plazo de 5 minutos el código de verificación que se envió a <email>{ $email }</email>.
signin-token-code-input-label-v2 = Introduce el código de 6 dígitos
# Form button to confirm if the confirmation code entered by the user is valid
signin-token-code-confirm-button = Confirmar
signin-token-code-code-expired = ¿Código caducado?
# Link to resend a new code to the user's email.
signin-token-code-resend-code-link = Enviar código nuevo por correo electrónico.
# Error displayed in a tooltip when the form is submitted without a code
signin-token-code-required-error = Código de confirmación requerido
signin-token-code-resend-error = Ha habido un problema. No se ha podido enviar un nuevo código.
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-token-code-instruction-desktop-relay = { -brand-firefox } intentará enviarte nuevamente donde estabas para que uses una máscara de correo electrónico después de iniciar sesión.

## SigninTOTPCode page
## TOTP (time-based one-time password) is a form of two-factor authentication (2FA).
## Users that have set up two-factor authentication land on this page during sign-in.

signin-totp-code-header = Iniciar sesión
signin-totp-code-subheader-v2 = Escribir el código de autenticación en dos pasos
signin-totp-code-instruction-v4 = Comprueba tu <strong>aplicación de autenticación</strong> para confirmar tu inicio de sesión.
signin-totp-code-input-label-v4 = Introduce el código de 6 dígitos
# Form button to confirm if the authentication code entered by the user is valid
signin-totp-code-confirm-button = Confirmar
signin-totp-code-other-account-link = Usar una cuenta diferente
signin-totp-code-recovery-code-link = ¿Problemas para introducir el código?
# Error displayed in a tooltip when the form is submitted without a code
signin-totp-code-required-error = Código de autenticación requerido
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-totp-code-desktop-relay = { -brand-firefox } intentará enviarte nuevamente donde estabas para que uses una máscara de correo electrónico después de iniciar sesión.

## Signin Unblock Page
## Page shown when signin has been blocked by rate limiting (too many requests)

signin-unblock-header = Autorizar este inicio de sesión
# Where $email is the email address entered for the sign-in attempt
signin-unblock-body = Revisa tu correo por el código de verificación enviado a { $email }.
signin-unblock-code-input = Introducir el código de autorización
signin-unblock-submit-button = Continuar
# Shown when the user attempts to submit the form without including a code
signin-unblock-code-required-error = Se requiere un código de autorización
signin-unblock-code-incorrect-length = El código de autorización debe tener 8 caracteres
signin-unblock-code-incorrect-format-2 = El código de autorización solo puede contener letras y/o números
signin-unblock-resend-code-button = ¿No está en la bandeja de entrada o en la carpeta de spam? Reenviar
signin-unblock-support-link = ¿Por qué sucede esto?
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-unblock-desktop-relay = { -brand-firefox } intentará enviarte nuevamente donde estabas para que uses una máscara de correo electrónico después de iniciar sesión.

## ConfirmSignupCode page
## Users see this page after they have initiated account sign up,


# and a confirmation code has been sent to their email address.

# Page title show in browser title bar or page tab
confirm-signup-code-page-title = Introduce el código de confirmación
# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "for your { -product-mozilla-account }"
# can stand alone as "{ -product-mozilla-account }"
confirm-signup-code-heading-2 = Introduce el código de confirmación <span>para tu { -product-mozilla-account }</span>
# { $email } represents the email that the user entered to sign in
confirm-signup-code-instruction-v2 = Introduce en un plazo de 5 minutos el código de verificación que se envió a <email>{ $email }</email>.
confirm-signup-code-input-label = Introduce el código de 6 dígitos
# Form button to confirm if the confirmation code entered by the user is valid
confirm-signup-code-confirm-button = Confirmar
confirm-signup-code-sync-button = Empezar a sincronizar
confirm-signup-code-code-expired = ¿Código caducado?
# Link to resend a new code to the user's email.
confirm-signup-code-resend-code-link = Enviar código nuevo por correo electrónico.
confirm-signup-code-success-alert = Cuenta confirmada correctamente
# Error displayed in tooltip.
confirm-signup-code-is-required-error = Código de confirmación requerido
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
confirm-signup-code-desktop-relay = { -brand-firefox } intentará enviarte nuevamente donde estabas para que uses una máscara de correo electrónico después de iniciar sesión.

## Account Signup page
## This is the second page of the sign up flow, users have already entered their email

signup-heading-v2 = Crear una contraseña
signup-relay-info = Se necesita una contraseña para administrar de forma segura tus correos electrónicos enmascarados y acceder a las herramientas de seguridad de { -brand-mozilla }.
# Clicking on this link returns the user to the beginning of the flow so they can enter a new email address
signup-change-email-link = Cambiar correo

## SignupConfirmedSync page
## Shown to users when they finish confirming their account through Sync

signup-confirmed-sync-header = La sincronización está activada
signup-confirmed-sync-button = Comienza a navegar
signup-confirmed-sync-add-device-link = Añadir otro dispositivo
signup-confirmed-sync-manage-sync-button = Administrar sincronización
signup-confirmed-sync-set-password-success-banner = Contraseña de sincronización creada
