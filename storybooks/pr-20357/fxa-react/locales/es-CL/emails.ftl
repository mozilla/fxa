## Email content
## Emails do not contain buttons, only links. Emails have a rich HTML version and a plaintext
## version. The strings are usually identical but sometimes they differ slightly.

fxa-header-mozilla-logo = <img data-l10n-name="mozilla-logo" alt="{ -brand-mozilla } logo">
fxa-header-sync-devices-image = <img data-l10n-name="sync-devices-image" alt="Sincronizar dispositivos">
body-devices-image = <img data-l10n-name="devices-image" alt="Dispositivos">
fxa-privacy-url = Política de privacidad de { -brand-mozilla }
moz-accounts-privacy-url-2 = Política de privacidad de { -product-mozilla-accounts(capitalization: "uppercase") }
moz-accounts-terms-url = Términos del servicio de { -product-mozilla-accounts(capitalization: "uppercase") }
account-deletion-info-block-communications = Si se elimina tu cuenta, seguirás recibiendo correos electrónicos de Mozilla Corporation y Mozilla Foundation, a menos que <a data-l10n-name="unsubscribeLink">solicites cancelar la suscripción</a>.
account-deletion-info-block-support = Si tienes preguntas o necesitas ayuda, siéntete libre de ponerte en contacto con nuestro <a data-l10n-name="supportLink">equipo de soporte</a>.
account-deletion-info-block-communications-plaintext = Si se elimina tu cuenta, seguirás recibiendo correos electrónicos de Mozilla Corporation y Mozilla Foundation, a menos que solicites cancelar la suscripción:
account-deletion-info-block-support-plaintext = Si tienes alguna pregunta o necesitas ayuda, siéntete libre de ponerte en contacto con nuestro equipo de soporte:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
body-android-badge = <img data-l10n-name="google-play-badge" alt="Descargar { $productName } en { -google-play }">
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
body-ios-badge = <img data-l10n-name="apple-app-badge" alt="Descargar { $productName } en { -app-store }">
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-desktop-device-2 = Instalar { $productName } en <a data-l10n-name="anotherDeviceLink">otro dispositivo de escritorio</a>.
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-device-2 = Instalar { $productName } en <a data-l10n-name="anotherDeviceLink">otro dispositivo</a>.
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
android-download-plaintext = Obtén { $productName } en Google Play:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
ios-download-plaintext = Descarga { $productName } en la App Store:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-device-plaintext = Instala { $productName } en otro dispositivo:
automated-email-change-2 = Si no realizaste esta acción, <a data-l10n-name="passwordChangeLink">cambia tu contraseña</a> de inmediato.
automated-email-support = Para obtener más información, visita el <a data-l10n-name="supportLink">Soporte de { -brand-mozilla }</a>.
# After the colon, there's a link to https://accounts.firefox.com/settings/change_password
automated-email-change-plaintext-2 = Si no realizaste esta acción, cambia tu contraseña de inmediato:
#  After the colon, there's a link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
automated-email-support-plaintext = Para obtener más información, visita el Soporte de { -brand-mozilla }:
automated-email-inactive-account = Este es un correo electrónico automático. Lo recibes porque tienes una { -product-mozilla-account } y han pasado 2 años desde tu última conexión.
# supportLink - https://support.mozilla.org/kb/im-having-problems-my-firefox-account
automated-email-no-action = { automated-email-no-action-plaintext } Para más información, visita el <a data-l10n-name="supportLink">Soporte de { -brand-mozilla }</a>.
automated-email-no-action-plaintext = Este es un correo electrónico automatizado. Si lo recibiste por error, no necesitas hacer nada.
#  After the colon, there's a link to https://accounts.firefox.com/settings/change_password
automated-email-not-authorized-plaintext = Este es un correo automático; si no autorizaste esta acción, por favor cambia tu contraseña:
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
# - $uaOS: the user agent's operating system (e.g, MacOS)
# - $uaOSVersion - the user agent's operating system version
automatedEmailRecoveryKey-origin-device-all = Esta solicitud provino de { $uaBrowser } en { $uaOS } { $uaOSVersion }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
# - $uaOS: the user agent's operating system (e.g, MacOS)
automatedEmailRecoveryKey-origin-device-browser-os = Esta solicitud provino de { $uaBrowser } en { $uaOS }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
automatedEmailRecoveryKey-origin-device-browser-only = Esta solicitud provino de { $uaBrowser }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaOS: the user agent's operating system (e.g, MacOS)
# - $uaOSVersion - the user agent's operating system version
automatedEmailRecoveryKey-origin-device-OS-version-only = Esta solicitud provino de { $uaOS } { $uaOSVersion }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaOS: the user agent's operating system (e.g, MacOS)
automatedEmailRecoveryKey-origin-device-OS-only = Esta solicitud provino de { $uaOS }.
automatedEmailRecoveryKey-delete-key-change-pwd = Si no fuiste tu, <a data-l10n-name="revokeAccountRecoveryLink">elimina la nueva clave</a> y <a data-l10n-name="passwordChangeLink">cambia tu contraseña</a>
automatedEmailRecoveryKey-change-pwd-only = Si no fuiste tu, <a data-l10n-name="passwordChangeLink">cambia tu contraseña</a>.
automatedEmailRecoveryKey-more-info = Para obtener más información, visita el <a data-l10n-name="supportLink">Soporte de { -brand-mozilla }</a>.
# Colon is followed by user device info on a separate line (e.g., "Firefox Nightly on Mac OSX 10.11")
automatedEmailRecoveryKey-origin-plaintext = Esta solicitud provino de:
# Colon is followed by a URL to the account recovery key section of account settings
automatedEmailRecoveryKey-notyou-delete-key-plaintext = Si no fuiste tu, elimina la nueva clave:
# Colon is followed by a URL to the change password section of account settings
automatedEmailRecoveryKey-notyou-change-pwd-only-plaintext = Si no fuiste tu, cambia tu contraseña:
# This string is shown on its own line, after automatedEmailRecoveryKey-notyou-delete-key-plaintext and its URL
# Colon is followed by a URL to the change password section of account settings
automatedEmailRecoveryKey-notyou-change-pwd-plaintext = y cambia tu contraseña:
# Colon is followed by a URL to Mozilla Support's "I'm having problems with my account" page
automatedEmailRecoveryKey-more-info-plaintext = Para obtener más información, visita el Soporte de { -brand-mozilla }:
automated-email-reset =
    Este es un correo automático; si no autorizaste esta acción, entonces <a data-l10n-name="resetLink">por favor restablece tu contraseña</a>.
    Para más información, por favor visita <a data-l10n-name="supportLink">el soporte de { -brand-mozilla }</a>.
# Variables:
#  $resetLink (String) - Link to https://accounts.firefox.com/reset_password
automated-email-reset-plaintext-v2 = Si no autorizaste esta acción, por favor restablece tu contraseña ahora en { $resetLink }
# This message is used by multiple automated emails that notify users of security events on their account
# "this action" is meant to be a generic term, and could, for example, refer to using a backup authentication code to confirm a password reset
automated-email-reset-pwd-two-factor =
    Si no realizaste esta acción, <a data-l10n-name="resetLink">restablece tu contraseña</a> y <a data-l10n-name="twoFactorSettingsLink">la autenticación en dos pasos</a> inmediatamente.
    Para obtener más información, visita el soporte de <a data-l10n-name="supportLink">{ -brand-mozilla }</a>.
# Followed by link to https://accounts.firefox.com/reset_password
automated-email-reset-pwd-plaintext-v3 = Si no realizaste esta acción, restablece tu contraseña de inmediato en:
# Followed by link to https://accounts.firefox.com/settings#two-step-authentication
automated-email-reset-two-factor-plaintext = Además, restablece la autenticación en dos pasos en:
brand-banner-message = ¿Sabías que cambiamos nuestro nombre de { -product-firefox-accounts } a { -product-mozilla-accounts }? <a data-l10n-name="learnMore">Aprender más</a>
change-password-plaintext = Si sospechas que alguien está intentando ganar acceso a tu cuenta, por favor cambia tu contraseña.
manage-account = Administrar cuenta
manage-account-plaintext = { manage-account }:
# Variables:
#  $supportUrl (String) - Link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
support-message-3 = Para obtener más información, visita el <a data-l10n-name="supportLink">Soporte de { -brand-mozilla }</a>.
# Variables:
#  $supportUrl (String) - Link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
support-message-plaintext = Para más información, visita el Soporte de { -brand-mozilla }: { $supportUrl }.
# Variables:
#  $uaBrowser (String) - User's browser, e.g. Firefox
#  $uaOS (String) - User's OS, e.g. Mac OSX
#  $uaOSVersion (String) - User's OS version, e.g. 10.11
device-all = { $uaBrowser } en { $uaOS } { $uaOSVersion }
# Variables:
#  $uaBrowser (String) - User's browser, e.g. Firefox
#  $uaOS (String) - User's OS, e.g. Mac OSX
device-browser-os = { $uaBrowser } en { $uaOS }
# Variables:
#  $city (String) - User's city
#  $stateCode (String) - User's state
#  $country (String) - User's country
location-all = { $city }, { $stateCode }, { $country } (estimado)
# Variables:
#  $city (String) - User's city
#  $country (String) - User's country
location-city-country = { $city }, { $country } (estimado)
# Variables:
#  $stateCode (String) - User's state
#  $country (String) - User's country
location-state-country = { $stateCode }, { $country } (estimado)
# Variables:
#  $country (stateCode) - User's country
location-country = { $country } (estimado)
cadReminderFirst-subject-1 = ¡No lo olvides! A sincronizar { -brand-firefox }
cadReminderFirst-action = Sincronizar otro dispositivo
cadReminderFirst-action-plaintext = { cadReminderFirst-action }:
# In the title of the email, "It takes two to sync", "two" refers to syncing two devices
cadReminderFirst-title-1 = Se requieren dos para sincronizar
cadReminderFirst-description-v2 = Lleva tus pestañas a todos tus dispositivos. Obtén tus marcadores, contraseñas y otros datos en todos los lugares donde utilices { -brand-firefox }.
cadReminderSecond-subject-2 = ¡No te lo pierdas! Terminemos de configurar la sincronización
cadReminderSecond-action = Sincronizar otro dispositivo
cadReminderSecond-title-2 = ¡No olvides sincronizar!
cadReminderSecond-description-sync = Sincroniza tus marcadores, contraseñas, pestañas abiertas y más — en todas partes donde uses { -brand-firefox }.
cadReminderSecond-description-plus = Además, tus datos siempre están encriptados. Solo tú y los dispositivos que apruebes pueden verlos.
inactiveAccountFinalWarning-subject = Última oportunidad para conservar tu { -product-mozilla-account }
inactiveAccountFinalWarning-title = Tu cuenta de { -brand-mozilla } y datos serán eliminados
inactiveAccountFinalWarning-preview = Conéctate para mantener tu cuenta
inactiveAccountFinalWarning-account-description = Tu { -product-mozilla-account } es utilizada para acceder a productos gratuitos de privacidad y navegación como { -brand-firefox } sync, { -product-mozilla-monitor }, { -product-firefox-relay } y { -product-mdn }.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
# This date will already be formatted with moment.js into Thursday, Jan 9, 2025 format
inactiveAccountFinalWarning-impact = El <strong>{ $deletionDate }</strong>, tu cuenta y datos personales se eliminarán de forma permanente a menos que te conectes.
inactiveAccountFinalWarning-action = Conéctate para mantener tu cuenta
# followed by link to sign in
inactiveAccountFinalWarning-action-plaintext = Conéctate para mantener tu cuenta:
inactiveAccountFirstWarning-subject = No pierdas tu cuenta
inactiveAccountFirstWarning-title = ¿Quieres conservar tu cuenta de { -brand-mozilla } y datos?
inactiveAccountFirstWarning-account-description-v2 = Tu { -product-mozilla-account } es utilizada para acceder a productos gratuitos de privacidad y navegación como { -brand-firefox } sync, { -product-mozilla-monitor }, { -product-firefox-relay } y { -product-mdn }.
inactiveAccountFirstWarning-inactive-status = Notamos que no te has conectado durante 2 años.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
# This date will already be formatted with moment.js into Thursday, Jan 9, 2025 format
inactiveAccountFirstWarning-impact = Tu cuenta y datos personales se eliminarán de forma permanente el <strong>{ $deletionDate }</strong> porque no has estado activo.
inactiveAccountFirstWarning-action = Conéctate para mantener tu cuenta
inactiveAccountFirstWarning-preview = Conéctate para mantener tu cuenta
# followed by link to sign in
inactiveAccountFirstWarning-action-plaintext = Conéctate para mantener tu cuenta:
inactiveAccountSecondWarning-subject = Acción requerida: Eliminación de la cuenta en 7 días
inactiveAccountSecondWarning-title = Tu cuenta de { -brand-mozilla } y datos serán eliminados en 7 días
inactiveAccountSecondWarning-account-description-v2 = Tu { -product-mozilla-account } es utilizada para acceder a productos gratuitos de privacidad y navegación como { -brand-firefox } sync, { -product-mozilla-monitor }, { -product-firefox-relay } y { -product-mdn }.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
inactiveAccountSecondWarning-impact = Tu cuenta y datos personales se eliminarán de forma permanente el <strong>{ $deletionDate }</strong> porque no has estado activo.
inactiveAccountSecondWarning-action = Conéctate para mantener tu cuenta
inactiveAccountSecondWarning-preview = Conéctate para mantener tu cuenta
# followed by link to sign in
inactiveAccountSecondWarning-action-plaintext = Conéctate para mantener tu cuenta:
# The user has a low number of valid recovery codes remaining for use
codes-reminder-title-zero = ¡Te has quedado sin códigos de autenticación de respaldo!
codes-reminder-title-one = Estás en tu último código de autenticación de respaldo
codes-reminder-title-two = Es momento de crear más códigos de autenticación de respaldo
codes-reminder-description-part-one = Los códigos de autenticación de respaldo te ayudan a restaurar tu información cuando olvidas tu contraseña.
codes-reminder-description-part-two = Crea nuevos códigos ahora para que en un futuro no pierdas tus datos.
codes-reminder-description-two-left = Solo te quedan dos códigos.
codes-reminder-description-create-codes = Crea nuevos códigos de autenticación de respaldo para ayudarte a recuperar tu cuenta si pierdes el acceso.
lowRecoveryCodes-action-2 = Crear códigos
codes-create-plaintext = { lowRecoveryCodes-action-2 }:
lowRecoveryCodes-subject-2 =
    { $numberRemaining ->
        [0] ¡No quedan códigos de autenticación de respaldo!
        [one] ¡Solo queda 1 código de autenticación de respaldo!
       *[other] ¡Solo quedan { $numberRemaining } códigos de autenticación de respaldo!
    }
# Variables:
# $clientName (String) - A client the user hasn't signed into before (e.g. Firefox, Sync)
newDeviceLogin-subject = Nueva conexión de { $clientName }
newDeviceLogin-subjectForMozillaAccount = Nueva conexión a tu { -product-mozilla-account }
newDeviceLogin-title-3 = Tu { -product-mozilla-account } fue usada para conectarse
# The "Not you?" question is asking whether the recipient of the email is the
# person who performed the action that triggered the email.
newDeviceLogin-change-password = ¿No fuiste tú? <a data-l10n-name="passwordChangeLink">Cambia tu contraseña</a>.
# The "Not you?" question is asking whether the recipient of the email is the
# person who performed the action that triggered the email.
newDeviceLogin-change-password-plain = ¿No fuiste tú? Cambia tu contraseña:
newDeviceLogin-action = Administrar cuenta
passwordChangeRequired-subject = Actividad sospechosa detectada
passwordChangeRequired-preview = Cambia tu contraseña inmediatamente
passwordChangeRequired-title-2 = Restablecer tu contraseña
passwordChangeRequired-suspicious-activity-3 = Bloqueamos tu cuenta para protegerla de actividades sospechosas. Se ha cerrado la sesión de todos tus dispositivos y se han eliminado todos los datos sincronizados como medida de precaución.
passwordChangeRequired-sign-in-3 = Para volver a conectarte a tu cuenta, todo lo que necesitas hacer es restablecer tu contraseña.
passwordChangeRequired-different-password-2 = <b>Importante:</b> Elige una contraseña segura que sea diferente a las que hayas usado en el pasado.
passwordChangeRequired-different-password-plaintext-2 = Importante: Elige una contraseña segura que sea diferente a las que hayas usado en el pasado.
passwordChangeRequired-action = Restablecer contraseña
passwordChangeRequired-action-plaintext = { passwordChangeRequired-action }:
passwordChanged-subject = Contraseña actualizada
passwordChanged-title = Contraseña cambiada exitosamente
passwordChanged-description-2 = La contraseña de tu { -product-mozilla-account } fue cambiada exitosamente desde el siguiente dispositivo:
# Variables:
#  $code (String) - The confirmation code for sign-in
password-forgot-otp-subject-2 = Utiliza { $code } para cambiar tu contraseña
password-forgot-otp-preview = Este código expira en 10 minutos
password-forgot-otp-title = ¿Olvidaste tu contraseña?
password-forgot-otp-request = Recibimos una solicitud de cambio de contraseña en tu { -product-mozilla-account } desde:
password-forgot-otp-code-2 = Si fuiste tu, aquí está tu código de confirmación para continuar:
password-forgot-otp-expiry-notice = Este código expira en 10 minutos.
passwordReset-subject-2 = Tu contraseña ha sido restablecida
passwordReset-title-2 = Tu contraseña ha sido restablecida
# This sentence is followed by information about the device and time of the password reset
passwordReset-description-2 = Restableciste tu contraseña de { -product-mozilla-account } en:
passwordResetAccountRecovery-subject-2 = Tu contraseña ha sido restablecida
passwordResetAccountRecovery-title-3 = Tu contraseña ha sido restablecida
# Followed by details on the device, location, and date/time of the password reset.
passwordResetAccountRecovery-description-3 = Usaste la clave de recuperación de tu cuenta para restablecer tu contraseña { -product-mozilla-account } en:
passwordResetAccountRecovery-information = Hemos cerrado tu sesión en todos tus dispositivos sincronizados. Hemos creado una nueva clave de recuperación de cuenta para reemplazar la que usaste. Puedes cambiarla en la configuración de tu cuenta.
# After the colon there is a link to account settings
passwordResetAccountRecovery-information-txt = Hemos cerrado tu sesión en todos tus dispositivos sincronizados. Hemos creado una nueva clave de recuperación de cuenta para reemplazar la que usaste. Puedes cambiarla en la configuración de tu cuenta:
passwordResetAccountRecovery-action-4 = Administrar cuenta
passwordResetRecoveryPhone-subject = Teléfono de recuperación usado
passwordResetRecoveryPhone-preview = Revisa para asegurarte de que fuiste tú
passwordResetRecoveryPhone-title = Tu teléfono de recuperación fue utilizado para confirmar un restablecimiento de contraseña
passwordResetRecoveryPhone-device = Teléfono de recuperación usado desde:
passwordResetRecoveryPhone-action = Administrar cuenta
passwordResetWithRecoveryKeyPrompt-subject = Tu contraseña ha sido restablecida
passwordResetWithRecoveryKeyPrompt-title = Tu contraseña ha sido restablecida
# Details of the device and date/time where the password was reset
passwordResetWithRecoveryKeyPrompt-description = Restableciste tu contraseña de { -product-mozilla-account } en:
# Text for button action to create a new account recovery key
passwordResetWithRecoveryKeyPrompt-action = Crear una clave de recuperación de cuenta
# colon is followed by a link to create an account recovery key from the account settings page
passwordResetWithRecoveryKeyPrompt-action-txt = Crear una clave de recuperación de cuenta:
passwordResetWithRecoveryKeyPrompt-cta-description = Deberás volver a conectarte en todos los dispositivos sincronizados. Mantén tus datos seguros la próxima vez con una clave de recuperación de cuenta. Esto te permite recuperar tus datos si olvidas tu contraseña.
postAddAccountRecovery-subject-3 = Nueva clave de recuperación de cuenta creada
postAddAccountRecovery-title2 = Has creado una nueva clave de recuperación de cuenta
# Key here refers to account recovery key
postAddAccountRecovery-body-part1 = Guarda esta  clave en un lugar seguro; la necesitarás para restaurar tus datos de navegación cifrados si olvidas tu contraseña.
# Key here refers to account recovery key
postAddAccountRecovery-body-part2 = Esta clave sólo  puede ser utilizada una vez. Después de usarla, crearemos una nueva automáticamente para ti. O puedes crear una nueva en cualquier momento desde los ajustes de tu cuenta.
postAddAccountRecovery-action = Administrar cuenta
postAddLinkedAccount-subject-2 = Nueva cuenta vinculada a tu { -product-mozilla-account }
#  Variables:
#  $providerName (String) - The name of the provider, e.g. Apple, Google
postAddLinkedAccount-title-2 = Tu cuenta de { $providerName } ha sido vinculada a tu { -product-mozilla-account }
postAddLinkedAccount-action = Administrar cuenta
postAddRecoveryPhone-subject = Teléfono de recuperación añadido
postAddRecoveryPhone-preview = Cuenta protegida mediante autenticación de dos pasos
postAddRecoveryPhone-title-v2 = Añadiste un número de teléfono de recuperación
# Variables:
#  $maskedLastFourPhoneNumber (String) - A bullet point mask with the last four digits of the user's phone number, e.g. ••••••1234
postAddRecoveryPhone-description-v2 = Añadiste { $maskedLastFourPhoneNumber } como tu número de teléfono de recuperación
# Links out to a support article about two factor authentication
postAddRecoveryPhone-how-protect = Cómo esto protege tu cuenta
postAddRecoveryPhone-how-protect-plaintext = Cómo esto protege tu cuenta:
postAddRecoveryPhone-enabled-device = Lo activaste desde:
postAddRecoveryPhone-action = Administrar cuenta
postAddTwoStepAuthentication-preview = Tu cuenta está protegida
postAddTwoStepAuthentication-subject-v3 = La autenticación en dos pasos está activada
postAddTwoStepAuthentication-title-2 = Activaste la autenticación en dos pasos
# After the colon, there is a description of the device that the user used to enable two-step authentication
postAddTwoStepAuthentication-from-device-v2 = Solicitaste este formulario:
postAddTwoStepAuthentication-action = Administrar cuenta
postAddTwoStepAuthentication-code-required-v4 = Los códigos de seguridad de tu aplicación de autenticación ahora son requeridos cada vez que te conectas.
postAddTwoStepAuthentication-recovery-method-codes = También añadiste códigos de autenticación de respaldo como método de recuperación.
# Variables:
#  $maskedPhoneNumber (String) - A bullet point mask with the last four digits of the user's phone number, e.g. ••••••1234
postAddTwoStepAuthentication-recovery-method-phone = También añadiste { $maskedPhoneNumber } como tu número de teléfono de recuperación.
postAddTwoStepAuthentication-how-protects-link = Cómo esto protege tu cuenta
postAddTwoStepAuthentication-how-protects-plaintext = Cómo esto protege tu cuenta:
postAddTwoStepAuthentication-device-sign-out-message = Para proteger todos tus dispositivos conectados, debes cerrar la sesión en todos los lugares donde utilices esta cuenta y luego volver a conectarte mediante la autenticación de dos pasos.
postChangeAccountRecovery-subject = Clave de recuperación de cuenta cambiada
postChangeAccountRecovery-title = Cambiaste tu clave de recuperación de cuenta
postChangeAccountRecovery-body-part1 = Ahora tienes una nueva clave de recuperación de cuenta. Tu clave anterior fue eliminada.
postChangeAccountRecovery-body-part2 = Guarda esta nueva clave en un lugar seguro; la necesitarás para restaurar tus datos de navegación cifrados si olvidas tu contraseña.
postChangeAccountRecovery-action = Administrar cuenta
postChangePrimary-subject = Correo primario actualizado
postChangePrimary-title = Nuevo correo primario
# Variables:
#  $email (String) - A user's email address
postChangePrimary-description-2 = Has cambiado exitosamente tu correo primario a { $email }. Este correo es ahora tu nombre de usuario para conectarte a tu { -product-mozilla-account }, así como para recibir notificaciones de seguridad y
postChangePrimary-action = Administrar cuenta
postChangeRecoveryPhone-subject = Teléfono de recuperación actualizado
postChangeRecoveryPhone-preview = Cuenta protegida mediante autenticación de dos pasos
postChangeRecoveryPhone-title = Cambiaste tu teléfono de recuperación
postChangeRecoveryPhone-description = Ahora tienes un nuevo teléfono de recuperación. Se eliminó tu número de teléfono anterior.
postChangeRecoveryPhone-requested-device = Lo solicitaste desde:
postChangeTwoStepAuthentication-preview = Tu cuenta está protegida
postChangeTwoStepAuthentication-subject = Autenticación en dos pasos actualizada
postChangeTwoStepAuthentication-title = La autenticación en dos pasos ha sido actualizada
postChangeTwoStepAuthentication-use-new-account = Ahora debes usar la nueva entrada de { -product-mozilla-account } en tu aplicación de autenticación. La anterior ya no funcionará y puedes eliminarla.
# After the colon, there is a description of the device that the user used to enable two-step authentication
postChangeTwoStepAuthentication-from-device = Solicitaste este formulario:
postChangeTwoStepAuthentication-action = Administrar cuenta
postChangeTwoStepAuthentication-how-protects-link = Cómo esto protege tu cuenta
postChangeTwoStepAuthentication-how-protects-plaintext = Cómo esto protege tu cuenta:
postChangeTwoStepAuthentication-device-sign-out-message = Para proteger todos tus dispositivos conectados, debes cerrar la sesión en todos los lugares donde utilices esta cuenta y luego volver a conectarte mediante tu nueva autenticación de dos pasos.
postConsumeRecoveryCode-title-3 = Tu código de autenticación de respaldo fue utilizado para confirmar un restablecimiento de contraseña
# After the colon, there is description of the device that the backup authentication code was used on
# E.g., Firefox Nightly on Mac OSX, Thursday Sept 2, 2024
postConsumeRecoveryCode-description-3 = Código utilizado desde:
postConsumeRecoveryCode-action = Administrar cuenta
postConsumeRecoveryCode-subject-v3 = Código de autenticación de respaldo usado
postConsumeRecoveryCode-preview = Revisa para asegurarte de que fuiste tú
postNewRecoveryCodes-subject-2 = Nuevos códigos de autenticación de respaldo creados
postNewRecoveryCodes-title-2 = Haz creado nuevos códigos de autenticación de respaldo
# After the colon, there is information about the device that the authentication codes were created on
postNewRecoveryCodes-description-2 = Fueron creados en:
postNewRecoveryCodes-action = Administrar cuenta
postRemoveAccountRecovery-subject-2 = Clave de recuperación de cuenta eliminada
postRemoveAccountRecovery-title-3 = Has eliminado tu clave de recuperación de cuenta
postRemoveAccountRecovery-body-part1 = Se requiere la clave de recuperación de tu cuenta para restaurar tus datos de navegación cifrados si olvidas tu contraseña.
postRemoveAccountRecovery-body-part2 = Si aún no lo has hecho, crea una nueva clave de recuperación de cuenta en los ajustes de tu cuenta para evitar perder tus contraseñas guardadas, marcadores, historial de navegación y más.
postRemoveAccountRecovery-action = Administrar cuenta
postRemoveRecoveryPhone-subject = Teléfono de recuperación eliminado
postRemoveRecoveryPhone-preview = Cuenta protegida mediante autenticación de dos pasos
postRemoveRecoveryPhone-title = Teléfono de recuperación eliminado
postRemoveRecoveryPhone-description-v2 = Tu teléfono de recuperación ha sido eliminado de tu configuración de autenticación de dos pasos.
postRemoveRecoveryPhone-description-extra = Todavía puedes usar tus códigos de autenticación de respaldo para conectarte si no puedes usar tu aplicación de autenticación.
postRemoveRecoveryPhone-requested-device = Lo solicitaste desde:
postRemoveSecondary-subject = Correo secundario eliminado
postRemoveSecondary-title = Correo secundario eliminado
# Variables:
#  $secondaryEmail (String) - A user's email address
postRemoveSecondary-description-2 = Has eliminado exitosamente { $secondaryEmail } como correo secundario de tu { -product-mozilla-account }. Las notificaciones de seguridad y confirmaciones de conexión ya no serán enviadas a esta dirección.
postRemoveSecondary-action = Administrar cuenta
postRemoveTwoStepAuthentication-subject-line-2 = Autenticación en dos pasos desactivada
postRemoveTwoStepAuthentication-title-2 = Desactivaste la autenticación en dos pasos
# After the colon is a description of the device the user used to disable two-step authentication
postRemoveTwoStepAuthentication-from-device = Lo desactivaste desde:
postRemoveTwoStepAuthentication-action = Administrar cuenta
postRemoveTwoStepAuthentication-not-required-2 = Ya no necesitarás los códigos de seguridad de tu aplicación de autenticación cuando te conectes.
postSigninRecoveryCode-subject = Código de autenticación de respaldo fue utilizado para conectarse
postSigninRecoveryCode-preview = Confirmar actividad de la cuenta
postSigninRecoveryCode-title = Tu código de autenticación de respaldo fue utilizado para conectarse
postSigninRecoveryCode-description = Si no lo hiciste tu, debes cambiar tu contraseña inmediatamente para mantener tu cuenta segura.
postSigninRecoveryCode-device = Te conectaste desde:
postSigninRecoveryCode-action = Administrar cuenta
postSigninRecoveryPhone-subject = Teléfono de recuperación utilizado para conectarse
postSigninRecoveryPhone-preview = Confirmar actividad de la cuenta
postSigninRecoveryPhone-title = Tu teléfono de recuperación fue utilizado para conectarse
postSigninRecoveryPhone-description = Si no lo hiciste tu, debes cambiar tu contraseña inmediatamente para mantener tu cuenta segura.
postSigninRecoveryPhone-device = Te conectaste desde:
postSigninRecoveryPhone-action = Administrar cuenta
postVerify-sub-title-3 = ¡Estamos encantados de verte!
postVerify-title-2 = ¿Quieres ver la misma pestaña en dos dispositivos?
postVerify-description-2 = ¡Es fácil! Simplemente instala { -brand-firefox } en otro dispositivo y conéctate para sincronizar. ¡Es como por arte de magia!
postVerify-sub-description = (Psst… También significa que puedes tener tus marcadores, contraseñas y otros datos de { -brand-firefox } en cualquier lugar en que te hayas conectado).
postVerify-subject-4 = ¡Te damos la bienvenida a { -brand-mozilla }!
postVerify-setup-2 = Conectar otro dispositivo:
postVerify-action-2 = Conectar otro dispositivo
postVerifySecondary-subject = Correo secundario añadido
postVerifySecondary-title = Correo secundario añadido
# Variables:
#  $secondaryEmail (String) - A user's secondary email address
postVerifySecondary-content-3 = Has confirmado exitosamente { $secondaryEmail } como correo secundario para tu { -product-mozilla-account }. Las notificaciones de seguridad y confirmaciones de conexión ahora serán enviadas a ambas direcciones de correo.
postVerifySecondary-action = Administrar cuenta
recovery-subject = Restablecer tu contraseña
recovery-title-2 = ¿Olvidaste tu contraseña?
# Information on the device, location, and date and time of the request that triggered the email follows.
recovery-request-origin-2 = Recibimos una solicitud de cambio de contraseña en tu { -product-mozilla-account } desde:
recovery-new-password-button = Crea una nueva contraseña haciendo clic en el botón de abajo. Este enlace caducará dentro de la próxima hora.
recovery-copy-paste = Crea una nueva contraseña copiando y pegando la URL de a continuación en tu navegador. Este enlace caducará dentro de la próxima hora.
recovery-action = Crear nueva contraseña
# Variables:
#  $unblockCode (String) - The authorization code for sign-in
unblockCode-subject-2 = Utiliza { $unblockCode } para conectarte
unblockCode-preview = Este código expira en una hora
unblockCode-title = ¿Eres tu quien se está conectando?
unblockCode-prompt = De ser así, este es el código de autorización que necesitas:
# Variables:
#  $unblockCode (String) - An alphanumeric code
unblockCode-prompt-plaintext = De ser así, este es el código de autorización que necesitas: { $unblockCode }
unblockCode-report = En caso contrario, ayudanos a alejar a los intrusos <a data-l10n-name="reportSignInLink">reportándolo</a>.
unblockCode-report-plaintext = En caso contrario, ayudanos a alejar a los intrusis reportándolo.
verificationReminderFinal-subject = Último recordatorio para confirmar tu cuenta
verificationReminderFinal-description-2 = Hace un par de semanas, se creó una { -product-mozilla-account }, pero nunca fue confirmada. Por tu seguridad, eliminaremos la cuenta si no es verificada dentro de las próximas 24 horas.
confirm-account = Confirmar cuenta
confirm-account-plaintext = { confirm-account }:
verificationReminderFirst-subject-2 = Recuerda confirmar tu cuenta
verificationReminderFirst-title-3 = ¡Te damos la bienvenida a { -brand-mozilla }!
verificationReminderFirst-description-3 = Hace unos días creaste una { -product-mozilla-account }, pero nunca la confirmaste. Confirma tu cuenta dentro de los próximos 15 días o será eliminada automáticamente.
verificationReminderFirst-sub-description-3 = No te pierdas el navegador que te pone a ti y a tu privacidad en primer lugar.
confirm-email-2 = Confirmar cuenta
confirm-email-plaintext-2 = { confirm-email-2 }:
verificationReminderFirst-action-2 = Confirmar cuenta
verificationReminderSecond-subject-2 = Recuerda confirmar tu cuenta
verificationReminderSecond-title-3 = ¡No te pierdas { -brand-mozilla }!
verificationReminderSecond-description-4 = Hace unos días creaste una { -product-mozilla-account }, pero nunca la confirmaste. Confirma tu cuenta dentro de los próximos 10 días o será eliminada automáticamente.
verificationReminderSecond-second-description-3 = Tu { -product-mozilla-account } te permite sincronizar tu experiencia { -brand-firefox } en todos los dispositivos y desbloquea el acceso a más productos que protegen la privacidad de { -brand-mozilla }.
verificationReminderSecond-sub-description-2 = Sé parte de nuestra misión de transformar Internet en un lugar abierto para todos.
verificationReminderSecond-action-2 = Confirmar cuenta
verify-title-3 = Abre Internet con { -brand-mozilla }
verify-description-2 = Confirma tu cuenta y sácale el máximo provecho a { -brand-mozilla } donde sea que te conectes empezando por:
verify-subject = Termina de crear tu cuenta
verify-action-2 = Confirmar cuenta
# Variables:
# $code (String) - The verification code
verifyAccountChange-subject = Utiliza { $code } para cambiar tu cuenta
# Variables:
# $expirationTime (Number) - Represents the expiration time in minutes
verifyAccountChange-preview =
    { $expirationTime ->
        [one] Este código expira en { $expirationTime } minuto.
       *[other] Este código expira en { $expirationTime } minutos.
    }
verifyAccountChange-title = ¿Estás cambiando la información de tu cuenta?
# After the colon is a description of the device used to sign in to the service
verifyAccountChange-safe = Ayúdanos a mantener tu cuenta segura aprobando este cambio en:
verifyAccountChange-prompt = Si es así, aquí está el código de autenticación:
# Variables:
# $expirationTime (Number) - Represents the expiration time in minutes
verifyAccountChange-expiry-notice =
    { $expirationTime ->
        [one] Expira en { $expirationTime } minuto.
       *[other] Expira en { $expirationTime } minutos.
    }
# Variables:
#  $clientName (String) - A client the user hasn't signed into before (e.g. Firefox, Sync)
verifyLogin-title-2 = ¿Te conectaste en { $clientName }?
verifyLogin-description-2 = Ayúdanos a mantener tu cuenta segura confirmando que te conectaste en:
verifyLogin-subject-2 = Confirmar conexión
verifyLogin-action = Confirmar conexión
# Variables:
#  $code (String) - The confirmation code for sign-in
verifyLoginCode-subject-line-3 = Utiliza { $code } para conectarte
verifyLoginCode-preview = Este código expira en 5 minutos.
# Variables:
#  $serviceName (String) - A service the user hasn't signed into before (e.g. Firefox)
verifyLoginCode-title-2 = ¿Te conectaste en { $serviceName }?
# After the colon is a description of the device used to sign in to the service
verifyLoginCode-safe = Ayúdanos a mantener tu cuenta segura aprobando tu conexión en:
verifyLoginCode-prompt-3 = Si es así, aquí está el código de autenticación:
verifyLoginCode-expiry-notice = Expira en 5 minutos.
verifyPrimary-title-2 = Confirmar correo primario
verifyPrimary-description = Una solicitud para realizar un cambio de cuenta fue realizada desde el siguiente dispositivo:
verifyPrimary-subject = Confirmar correo primario
verifyPrimary-action-2 = Confirmar correo
verifyPrimary-action-plaintext-2 = { verifyPrimary-action-2 }:
verifyPrimary-post-verify-2 = Una vez confirmado, cambios a la cuenta como añadir un correo secundario serán posibles desde este dispositivo.
# Variables:
#  $code (String) - The confirmation code for secondary email
verifySecondaryCode-subject-2 = Utiliza { $code } para confirmar tu correo secundario
verifySecondaryCode-preview = Este código expira en 5 minutos.
verifySecondaryCode-title-2 = Confirmar correo secundario
verifySecondaryCode-action-2 = Confirmar correo
# Variables:
#  $email (string) A user's unverified secondary email address
verifySecondaryCode-explainer-2 = Una solicitud para usar { $email } como una dirección de correo secundaria ha sido hecha desde la siguiente { -product-mozilla-account }:
verifySecondaryCode-prompt-2 = Usar este código de confirmación:
verifySecondaryCode-expiry-notice-2 = Expira en 5 minutos. Una vez confirmada, esta dirección empezará a recibir notificaciones de seguridad.y confirmaciones.
# Variables:
#  $code (String) - comfirmation code for the account
verifyShortCode-subject-4 = Utiliza { $code } para confirmar tu cuenta
verifyShortCode-preview-2 = Este código expira en 5 minutos
verifyShortCode-title-3 = Abre Internet con { -brand-mozilla }
# Information on the browser and device triggering this confirmation email follows below this string.
verifyShortCode-title-subtext-2 = Confirma tu cuenta y sácale el máximo provecho a { -brand-mozilla } donde sea que te conectes empezando por:
verifyShortCode-prompt-3 = Usar este código de confirmación:
verifyShortCode-expiry-notice = Expira en 5 minutos.
