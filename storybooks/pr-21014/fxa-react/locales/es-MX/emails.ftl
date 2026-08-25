## Email content
## Emails do not contain buttons, only links. Emails have a rich HTML version and a plaintext
## version. The strings are usually identical but sometimes they differ slightly.

fxa-header-mozilla-logo = <img data-l10n-name="mozilla-logo" alt="Logo de { -brand-mozilla }">
fxa-header-sync-devices-image = <img data-l10n-name="sync-devices-image" alt="Sync devices">
body-devices-image = <img data-l10n-name="devices-image" alt="Devices">
fxa-privacy-url = Política de Privacidad de { -brand-mozilla }
moz-accounts-privacy-url-2 = Aviso de privacidad de { -product-mozilla-accounts(capitalization: "uppercase") }
moz-accounts-terms-url = Términos del servicio de { -product-mozilla-accounts(capitalization: "uppercase") }
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
body-android-badge = <img data-l10n-name="google-play-badge" alt="Descargar { $productName } en { -google-play }">
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
body-ios-badge = <img data-l10n-name="apple-app-badge" alt="Descargar { $productName } en la { -app-store }">
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-desktop-device-2 = Instalar { $productName } en <a data-l10n-name="anotherDeviceLink">otro dispositivo</a>.
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-device-2 = Instalar { $productName } en <a data-l10n-name="anotherDeviceLink">otro dispositivo</a>.
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
android-download-plaintext = Consigue { $productName } en Google Play:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
ios-download-plaintext = Descarga { $productName } en la App Store:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-device-plaintext = Instala { $productName } en otro dispositivo:
automated-email-change-2 = Si no realizaste esta acción, <a data-l10n-name="passwordChangeLink">cambia tu contraseña</a> de inmediato.
automated-email-support = Para obtener más información, visita <a data-l10n-name="supportLink">{ -brand-mozilla } Soporte</a>.
# After the colon, there's a link to https://accounts.firefox.com/settings/change_password
automated-email-change-plaintext-2 = Si no realizaste esta acción, cambia tu contraseña de inmediato:
#  After the colon, there's a link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
automated-email-support-plaintext = Para obtener más información, visita { -brand-mozilla } Soporte:
automated-email-inactive-account = Este es un correo electrónico automático. Lo recibes porque tienes una cuenta { -product-mozilla-account } y han pasado 2 años desde tu último inicio de sesión.
# supportLink - https://support.mozilla.org/kb/im-having-problems-my-firefox-account
automated-email-no-action = { automated-email-no-action-plaintext } Para más información, visita <a data-l10n-name="supportLink">Ayuda de { -brand-mozilla }</a>.
automated-email-no-action-plaintext = Este es un correo automático. Si lo estás recibiendo por error, no necesitas hacer nada.
#  After the colon, there's a link to https://accounts.firefox.com/settings/change_password
automated-email-not-authorized-plaintext = Este es un correo electrónico automatizado; si no autorizaste esta acción, cambia tu contraseña:
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
automatedEmailRecoveryKey-delete-key-change-pwd = Si no eres tú, <a data-l10n-name="revokeAccountRecoveryLink">elimina la nueva clave</a> y <a data-l10n-name="passwordChangeLink">cambia tu contraseña</a>.
automatedEmailRecoveryKey-change-pwd-only = Si no eres tú, <a data-l10n-name="passwordChangeLink">Cambia tu contraseña</a>.
automatedEmailRecoveryKey-more-info = Para obtener más información, visita <a data-l10n-name="supportLink">{ -brand-mozilla } Soporte</a>.
# Colon is followed by user device info on a separate line (e.g., "Firefox Nightly on Mac OSX 10.11")
automatedEmailRecoveryKey-origin-plaintext = Esta solicitud vino de:
# Colon is followed by a URL to the account recovery key section of account settings
automatedEmailRecoveryKey-notyou-delete-key-plaintext = Si no eres tú, elimina la nueva clave:
# Colon is followed by a URL to the change password section of account settings
automatedEmailRecoveryKey-notyou-change-pwd-only-plaintext = Si no eres tú, cambia tu contraseña:
# This string is shown on its own line, after automatedEmailRecoveryKey-notyou-delete-key-plaintext and its URL
# Colon is followed by a URL to the change password section of account settings
automatedEmailRecoveryKey-notyou-change-pwd-plaintext = y cambia tu contraseña:
# Colon is followed by a URL to Mozilla Support's "I'm having problems with my account" page
automatedEmailRecoveryKey-more-info-plaintext = Para obtener más información, visita { -brand-mozilla } Soporte:
automated-email-reset =
    Este es un correo automático; si no autorizaste esta acción, entonces <a data-l10n-name="resetLink">por favor restablece tu contraseña</a>.
    Para más información, por favor visita <a data-l10n-name="supportLink">el soporte de { -brand-mozilla }</a>.
# Variables:
#  $resetLink (String) - Link to https://accounts.firefox.com/reset_password
automated-email-reset-plaintext-v2 = Si no autorizó esta acción, restablezca su contraseña ahora en { $resetLink }
change-password-plaintext = Si sospechas que alguien está tratando de acceder a tu cuenta, por favor, cambia tu contraseña.
manage-account = Administrar cuenta
manage-account-plaintext = { manage-account }:
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
#  $country (String) - User's country
location-city-country = { $city }, { $country } (estimado)
# Variables:
#  $stateCode (String) - User's state
#  $country (String) - User's country
location-state-country = { $stateCode }, { $country } (estimado)
# Variables:
#  $country (stateCode) - User's country
location-country = { $country } (estimado)
cadReminderFirst-subject-1 = ¡No lo olvides! Sincronicemos { -brand-firefox }
cadReminderFirst-action = Sincronizar otro dispositivo
cadReminderFirst-action-plaintext = { cadReminderFirst-action }:
# In the title of the email, "It takes two to sync", "two" refers to syncing two devices
cadReminderFirst-title-1 = Se requieren dos para sincronizar
cadReminderFirst-description-v2 = Lleva tus pestañas a todos tus dispositivos. Obtén tus marcadores, contraseñas y otros datos dondequiera que uses { -brand-firefox }.
cadReminderSecond-subject-2 = ¡No abandones! Terminemos la configuración de la sincronización
cadReminderSecond-action = Sincronizar otro dispositivo
cadReminderSecond-title-2 = ¡No olvides sincronizar!
cadReminderSecond-description-sync =
    Sincroniza tus marcadores, contraseñas, pestañas abiertas y más —
    donde sea que uses { -brand-firefox }.
cadReminderSecond-description-plus = Además, tus datos siempre estarán cifrados. Solo tú y tus dispositivos aprobados pueden verlos.
inactiveAccountFinalWarning-subject = Última oportunidad para conservar tu { -product-mozilla-account }
inactiveAccountFinalWarning-title = Tu cuenta y tus datos de { -brand-mozilla } serán eliminados
inactiveAccountFinalWarning-preview = Inicia sesión para mantener tu cuenta
inactiveAccountFinalWarning-account-description = Su { -product-mozilla-account } se utiliza para acceder a productos gratuitos de privacidad y navegación como { -brand-firefox } sync, { -product-mozilla-monitor }, { -product-firefox-relay } y { -product-mdn }.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
# This date will already be formatted with moment.js into Thursday, Jan 9, 2025 format
inactiveAccountFinalWarning-impact = El <strong>{ $deletionDate }</strong>, su cuenta y sus datos personales se eliminarán de forma permanente a menos que inicie sesión.
inactiveAccountFinalWarning-action = Inicia sesión para mantener tu cuenta
# followed by link to sign in
inactiveAccountFinalWarning-action-plaintext = Inicie sesión para mantener su cuenta:
inactiveAccountFirstWarning-subject = No pierdas tu cuenta
inactiveAccountFirstWarning-title = ¿Quieres conservar tu cuenta y tus datos de { -brand-mozilla }?
inactiveAccountFirstWarning-account-description-v2 = Tu { -product-mozilla-account } se utiliza para acceder a productos gratuitos de privacidad y navegación como { -brand-firefox } sync, { -product-mozilla-monitor }, { -product-firefox-relay } y { -product-mdn }.
inactiveAccountFirstWarning-inactive-status = Notamos que no has iniciado sesión durante 2 años.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
# This date will already be formatted with moment.js into Thursday, Jan 9, 2025 format
inactiveAccountFirstWarning-impact = Tu cuenta y tus datos personales se eliminarán de forma permanente el <strong>{ $deletionDate }</strong> porque no has estado activo.
inactiveAccountFirstWarning-action = Inicia sesión para mantener tu cuenta
inactiveAccountFirstWarning-preview = Inicia sesión para mantener tu cuenta
# followed by link to sign in
inactiveAccountFirstWarning-action-plaintext = Inicia sesión para mantener tu cuenta:
inactiveAccountSecondWarning-subject = Acción requerida: Eliminación de la cuenta en 7 días
inactiveAccountSecondWarning-title = Tu cuenta y tus datos de { -brand-mozilla } se eliminarán en 7 días
inactiveAccountSecondWarning-account-description-v2 = Tu { -product-mozilla-account } se utiliza para acceder a productos gratuitos de privacidad y navegación como { -brand-firefox } sync, { -product-mozilla-monitor }, { -product-firefox-relay } y { -product-mdn }.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
inactiveAccountSecondWarning-impact = Tu cuenta y tus datos personales se eliminarán de forma permanente el <strong>{ $deletionDate }</strong> porque no has estado activo.
inactiveAccountSecondWarning-action = Inicia sesión para mantener tu cuenta
inactiveAccountSecondWarning-preview = Inicia sesión para mantener tu cuenta
# followed by link to sign in
inactiveAccountSecondWarning-action-plaintext = Inicia sesión para mantener tu cuenta
# The user has a low number of valid recovery codes remaining for use
codes-reminder-title-zero = ¡Te has quedado sin códigos de autenticación de respaldo!
codes-reminder-title-one = Estás en tu último código de autenticación de respaldo
codes-reminder-title-two = Es hora de crear más códigos de autenticación de respaldo
codes-reminder-description-part-one = Los códigos de autenticación de respaldo te ayudan a restaurar tu información cuando olvidas tu contraseña.
codes-reminder-description-part-two = Crea nuevos códigos ahora para no perder tus datos más adelante.
codes-reminder-description-two-left = Solo te quedan dos códigos.
codes-reminder-description-create-codes = Crea nuevos códigos de autenticación de respaldo para ayudarte a volver a ingresar a tu cuenta si está bloqueada.
lowRecoveryCodes-action-2 = Crear códigos
codes-create-plaintext = { lowRecoveryCodes-action-2 }:
lowRecoveryCodes-subject-2 =
    { $numberRemaining ->
        [0] No quedan códigos de autenticación de respaldo
        [one] Solo queda 1 código de autenticación de respaldo
       *[other] ¡Solo quedan { $numberRemaining } códigos de autenticación de respaldo!
    }
# Variables:
# $clientName (String) - A client the user hasn't signed into before (e.g. Firefox, Sync)
newDeviceLogin-subject = Nuevo inicio de sesión en { $clientName }
newDeviceLogin-subjectForMozillaAccount = Nuevo inicio de sesión en su { -product-mozilla-account }
newDeviceLogin-title-3 = Su { -product-mozilla-account } se utilizó para iniciar sesión
# The "Not you?" question is asking whether the recipient of the email is the
# person who performed the action that triggered the email.
newDeviceLogin-change-password = ¿No eres tú? <a data-l10n-name="passwordChangeLink">Cambia tu contraseña</a>.
# The "Not you?" question is asking whether the recipient of the email is the
# person who performed the action that triggered the email.
newDeviceLogin-change-password-plain = ¿No eres tú? Cambia tu contraseña:
newDeviceLogin-action = Administrar cuenta
passwordChangeRequired-subject = Actividad sospechosa detectada
passwordChangeRequired-preview = Cambia tu contraseña inmediatamente
passwordChangeRequired-title-2 = Restablecer tu contraseña
passwordChangeRequired-suspicious-activity-3 = Bloqueamos tu cuenta para protegerla de actividades sospechosas. Se ha cerrado la sesión de todos tus dispositivos y se han eliminado todos los datos sincronizados como medida de precaución.
passwordChangeRequired-sign-in-3 = Para volver a iniciar sesión en tu cuenta, todo lo que necesita hacer es restablecer tu contraseña.
passwordChangeRequired-different-password-2 = <b>Importante:</b> Elige una contraseña segura que sea diferente a las que hayas usado en el pasado.
passwordChangeRequired-different-password-plaintext-2 = Importante: elige una contraseña segura que sea diferente a las que hayas usado en el pasado.
passwordChangeRequired-action = Restablecer contraseña
passwordChangeRequired-action-plaintext = { passwordChangeRequired-action }:
passwordChanged-subject = Contraseña actualizada
passwordChanged-title = Contraseña cambiada exitosamente
passwordChanged-description-2 = La contraseña de tu { -product-mozilla-account } fue cambiada correctamente desde el siguiente dispositivo:
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
passwordResetAccountRecovery-description-3 = Utilizaste tu clave de recuperación de cuenta para restablecer tu contraseña { -product-mozilla-account } en:
passwordResetAccountRecovery-information = Hemos cerrado tu sesión en todos tus dispositivos sincronizados. Hemos creado una nueva clave de recuperación de cuenta para reemplazar la que usaste. Puedes cambiarla en los ajustes de tu cuenta.
# After the colon there is a link to account settings
passwordResetAccountRecovery-information-txt = Hemos cerrado tu sesión en todos tus dispositivos sincronizados. Hemos creado una nueva clave de recuperación de cuenta para reemplazar la que usaste. Puedes cambiarla en los ajustes de tu cuenta:
passwordResetAccountRecovery-action-4 = Administrar cuenta
passwordResetRecoveryPhone-subject = Teléfono de recuperación usado
passwordResetRecoveryPhone-preview = Comprueba que eras tú
passwordResetRecoveryPhone-title = Tu teléfono de recuperación se utilizó para confirmar un restablecimiento de contraseña
passwordResetRecoveryPhone-device = Teléfono de recuperación utilizado desde:
passwordResetRecoveryPhone-action = Administrar cuenta
passwordResetWithRecoveryKeyPrompt-subject = Tu contraseña ha sido restablecida
passwordResetWithRecoveryKeyPrompt-title = Tu contraseña ha sido restablecida
# Details of the device and date/time where the password was reset
passwordResetWithRecoveryKeyPrompt-description = Restableciste tu contraseña de { -product-mozilla-account } en:
# Text for button action to create a new account recovery key
passwordResetWithRecoveryKeyPrompt-action = Crear clave de recuperación de cuenta
# colon is followed by a link to create an account recovery key from the account settings page
passwordResetWithRecoveryKeyPrompt-action-txt = Crear clave de recuperación de cuenta
passwordResetWithRecoveryKeyPrompt-cta-description = Tendrás que volver a iniciar sesión en todos tus dispositivos sincronizados. Protege tus datos la próxima vez con una clave de recuperación de cuenta. Esto te permite recuperar tus datos si olvidas tu contraseña.
postAddAccountRecovery-subject-3 = Nueva clave de recuperación de cuenta creada
postAddAccountRecovery-title2 = Creaste una nueva clave de recuperación de la cuenta
# Key here refers to account recovery key
postAddAccountRecovery-body-part1 = Guarda esta clave en un lugar seguro— la necesitarás para restaurar tus datos de navegación cifrados si olvidas tu contraseña.
# Key here refers to account recovery key
postAddAccountRecovery-body-part2 = Esta clave solo se puede usar una vez. Después de usarla, automáticamente crearemos una nueva para ti. O tu puedes crear una nueva en cualquier momento desde la configuración de tu cuenta.
postAddAccountRecovery-action = Administrar cuenta
postAddLinkedAccount-subject-2 = Nueva cuenta vinculada a tu { -product-mozilla-account }
#  Variables:
#  $providerName (String) - The name of the provider, e.g. Apple, Google
postAddLinkedAccount-title-2 = Tu cuenta de { $providerName } fue vinculada con tu { -product-mozilla-account }
postAddLinkedAccount-action = Administrar cuenta
postAddRecoveryPhone-subject = Teléfono de recuperación agregado
postAddRecoveryPhone-preview = Cuenta protegida mediante autenticación de dos pasos
postAddRecoveryPhone-title-v2 = Agregaste un número de teléfono de recuperación
# Variables:
#  $maskedLastFourPhoneNumber (String) - A bullet point mask with the last four digits of the user's phone number, e.g. ••••••1234
postAddRecoveryPhone-description-v2 = Agregaste { $maskedLastFourPhoneNumber } como tu número de teléfono de recuperación
# Links out to a support article about two factor authentication
postAddRecoveryPhone-how-protect = ¿Cómo esto protege tu cuenta?
postAddRecoveryPhone-how-protect-plaintext = Cómo protege esto tu cuenta:
postAddRecoveryPhone-enabled-device = Lo activaste desde:
postAddRecoveryPhone-action = Administrar cuenta
postAddTwoStepAuthentication-preview = Tu cuenta está protegida
postAddTwoStepAuthentication-subject-v3 = La autenticación de dos pasos está activada
postAddTwoStepAuthentication-title-2 = Activaste la autenticación en dos pasos
# After the colon, there is a description of the device that the user used to enable two-step authentication
postAddTwoStepAuthentication-from-device-v2 = Solicitaste esto a:
postAddTwoStepAuthentication-action = Administrar cuenta
postAddTwoStepAuthentication-code-required-v4 = Los códigos de seguridad de tu aplicación de autenticación ahora se requieren cada vez que inicies sesión.
postAddTwoStepAuthentication-recovery-method-codes = También agregaste códigos de autenticación de respaldo como método de recuperación.
# Variables:
#  $maskedPhoneNumber (String) - A bullet point mask with the last four digits of the user's phone number, e.g. ••••••1234
postAddTwoStepAuthentication-recovery-method-phone = También agregaste { $maskedPhoneNumber } como tu número de teléfono de recuperación.
postAddTwoStepAuthentication-how-protects-link = Cómo esto protege tu cuenta
postAddTwoStepAuthentication-how-protects-plaintext = Cómo protege esto tu cuenta:
postAddTwoStepAuthentication-device-sign-out-message = Para proteger todos tus dispositivos conectados, debes cerrar la sesión en todos los lugares donde utilizas esta cuenta y luego volver a iniciarla mediante la autenticación de dos pasos.
postChangeAccountRecovery-subject = Se modificó la clave de recuperación de cuenta
postChangeAccountRecovery-title = Has cambiado tu clave de recuperación de cuenta
postChangeAccountRecovery-body-part1 = Ahora tienes una nueva clave de recuperación de cuenta. La clave anterior se eliminó.
postChangeAccountRecovery-body-part2 = Guarda esta nueva clave en un lugar seguro: la necesitarás para restaurar tus datos de navegación cifrados si olvidas tu contraseña.
postChangeAccountRecovery-action = Administrar cuenta
postChangePrimary-subject = Correo principal actualizado
postChangePrimary-title = Nuevo correo electrónico principal
# Variables:
#  $email (String) - A user's email address
postChangePrimary-description-2 = Has cambiado correctamente tu dirección de correo electrónico principal a { $email }. Esta dirección es ahora tu nombre de usuario para iniciar sesión en tu { -product-mozilla-account }, así como para recibir notificaciones de seguridad y confirmaciones de inicio de sesión.
postChangePrimary-action = Administrar cuenta
postChangeRecoveryPhone-subject = Teléfono de recuperación actualizado
postChangeRecoveryPhone-preview = Cuenta protegida mediante autenticación de dos pasos
postChangeRecoveryPhone-title = Cambiaste tu teléfono de recuperación
postChangeRecoveryPhone-description = Ahora tienes un nuevo teléfono de recuperación. Se eliminó tu número de teléfono anterior.
postChangeRecoveryPhone-requested-device = Lo solicitaste a:
postChangeTwoStepAuthentication-preview = Tu cuenta está protegida
postChangeTwoStepAuthentication-subject = Autenticación de dos pasos actualizada
postChangeTwoStepAuthentication-title = Se ha actualizado la autenticación de dos pasos
postConsumeRecoveryCode-title-3 = Tu código de autenticación de respaldo se utilizó para confirmar un restablecimiento de contraseña
# After the colon, there is description of the device that the backup authentication code was used on
# E.g., Firefox Nightly on Mac OSX, Thursday Sept 2, 2024
postConsumeRecoveryCode-description-3 = Código utilizado de:
postConsumeRecoveryCode-action = Administrar cuenta
postConsumeRecoveryCode-subject-v3 = Código de autenticación de respaldo utilizado
postConsumeRecoveryCode-preview = Comprueba que eras tú
postNewRecoveryCodes-subject-2 = Nuevos códigos de autenticación de respaldo creados
postNewRecoveryCodes-title-2 = Has creado nuevos códigos de autenticación de respaldo
# After the colon, there is information about the device that the authentication codes were created on
postNewRecoveryCodes-description-2 = Fueron creados en:
postNewRecoveryCodes-action = Administrar cuenta
postRemoveAccountRecovery-subject-2 = Clave de recuperación de cuenta eliminada
postRemoveAccountRecovery-title-3 = Has eliminado tu clave de recuperación de cuenta
postRemoveAccountRecovery-body-part1 = Tu clave de recuperación de cuenta es necesaria para restaurar tus datos de navegación cifrados si olvidas tu contraseña.
postRemoveAccountRecovery-body-part2 = Si aún no lo has hecho, crea una nueva clave de recuperación de cuenta en ajustes de tu cuenta para evitar perder tus contraseñas guardadas, marcadores, historial de navegación y más.
postRemoveAccountRecovery-action = Administrar cuenta
postRemoveRecoveryPhone-subject = Teléfono de recuperación eliminado
postRemoveRecoveryPhone-preview = Cuenta protegida mediante autenticación de dos pasos
postRemoveRecoveryPhone-title = Teléfono de recuperación eliminado
postRemoveRecoveryPhone-requested-device = Lo solicitaste a:
postRemoveSecondary-subject = Correo secundario eliminado
postRemoveSecondary-title = Correo secundario eliminado
# Variables:
#  $secondaryEmail (String) - A user's email address
postRemoveSecondary-description-2 = Has eliminado correctamente { $secondaryEmail } como correo electrónico secundario de tu { -product-mozilla-account }. Las notificaciones de seguridad y las confirmaciones de inicio de sesión ya no se enviarán a esta dirección.
postRemoveSecondary-action = Administrar cuenta
postRemoveTwoStepAuthentication-subject-line-2 = Autenticación en dos pasos desactivada
postRemoveTwoStepAuthentication-title-2 = Se desactivo la autenticación en dos pasos
# After the colon is a description of the device the user used to disable two-step authentication
postRemoveTwoStepAuthentication-from-device = Lo deshabilitaste desde:
postRemoveTwoStepAuthentication-action = Administrar cuenta
postRemoveTwoStepAuthentication-not-required-2 = Ya no necesitas los códigos de seguridad de tu aplicación de autenticación cuando inicies sesión.
postSigninRecoveryCode-subject = Código de autenticación de respaldo utilizado para iniciar sesión
postSigninRecoveryCode-preview = Confirmar la actividad de la cuenta
postSigninRecoveryCode-title = Tu código de autenticación de respaldo se utilizó para iniciar sesión
postSigninRecoveryCode-description = Si no fuiste tu, debes cambiar tu contraseña inmediatamente para mantener tu cuenta segura.
postSigninRecoveryCode-device = Has iniciado sesión desde:
postSigninRecoveryCode-action = Administrar cuenta
postSigninRecoveryPhone-subject = Teléfono de recuperación utilizado para iniciar sesión
postSigninRecoveryPhone-preview = Confirmar la actividad de la cuenta
postSigninRecoveryPhone-title = Tu teléfono de recuperación se utilizó para iniciar sesión
postSigninRecoveryPhone-description = Si no fuiste tu, debes cambiar tu contraseña inmediatamente para mantener tu cuenta segura.
postSigninRecoveryPhone-device = Has iniciado sesión desde:
postSigninRecoveryPhone-action = Administrar cuenta
postVerify-sub-title-3 = ¡Estamos felices de verte!
postVerify-title-2 = ¿Quieres ver la misma pestaña en dos dispositivos?
postVerify-description-2 = ¡Es fácil! Solo instala { -brand-firefox } en otro dispositivo e inicia sesión para sincronizar. ¡Es como magia!
postVerify-sub-description = (Psst… eso también significa que puedes tener tus marcadores, contraseñas y otros datos de { -brand-firefox } donde sea que inicies sesión.)
postVerify-subject-4 = ¡Te damos la bienvenida a { -brand-mozilla }!
postVerify-setup-2 = Conectar otro dispositivo:
postVerify-action-2 = Conectar otro dispositivo
postVerifySecondary-subject = Correo electrónico secundario agregado
postVerifySecondary-title = Correo electrónico secundario agregado
# Variables:
#  $secondaryEmail (String) - A user's secondary email address
postVerifySecondary-content-3 = Has confirmado correctamente { $secondaryEmail } como correo electrónico secundario para tu { -product-mozilla-account }. Las notificaciones de seguridad y las confirmaciones de inicio de sesión se enviarán ahora a ambas direcciones de correo electrónico.
postVerifySecondary-action = Administrar cuenta
recovery-subject = Restablecer tu contraseña
recovery-title-2 = ¿Olvidaste tu contraseña?
# Information on the device, location, and date and time of the request that triggered the email follows.
recovery-request-origin-2 = Recibimos una solicitud de cambio de contraseña en tu { -product-mozilla-account } de:
recovery-new-password-button = Crea una nueva contraseña al hacer clic en el botón de abajo. Este enlace caducará en la siguiente hora.
recovery-copy-paste = Crea una nueva contraseña al copiar y pegar la URL de abajo en tu navegador. Este enlace caducará en la siguiente hora.
recovery-action = Crear nueva contraseña
unblockCode-title = ¿Eres tú iniciando sesión?
unblockCode-prompt = Si es así, aquí está el código de autorización que necesitas:
# Variables:
#  $unblockCode (String) - An alphanumeric code
unblockCode-prompt-plaintext = De ser así, este es el código de autorización que necesitas: { $unblockCode }
unblockCode-report = En caso contrario, ayúdanos a alejar a los intrusos <a data-l10n-name="reportSignInLink">reportándolo</a>.
unblockCode-report-plaintext = Si no es así, ayúdanos a mantener a raya a los intrusos e infórmanos.
verificationReminderFinal-subject = Recordatorio final para confirmar tu cuenta
verificationReminderFinal-description-2 = Hace un par de semanas, se creó una { -product-mozilla-account }, pero nunca fue confirmada. Por tu seguridad, eliminaremos la cuenta si no es verificada dentro de las próximas 24 horas.
confirm-account = Confirmar cuenta
confirm-account-plaintext = { confirm-account }:
verificationReminderFirst-subject-2 = Recuerda confirmar tu cuenta
verificationReminderFirst-title-3 = ¡Bienvenido a { -brand-mozilla }!
verificationReminderFirst-description-3 = Hace unos días creaste una { -product-mozilla-account }, pero nunca la confirmaste. Por favor confirma tu cuenta en los siguientes 15 días o será eliminada automáticamente.
verificationReminderFirst-sub-description-3 = No te pierdas el navegador que pone a tu privacidad y a ti en primer lugar.
confirm-email-2 = Confirmar cuenta
confirm-email-plaintext-2 = { confirm-email-2 }:
verificationReminderFirst-action-2 = Confirmar cuenta
verificationReminderSecond-subject-2 = Recuerda confirmar tu cuenta
verificationReminderSecond-title-3 = ¡No te pierdas { -brand-mozilla }!
verificationReminderSecond-description-4 = Hace un par de días creaste una { -product-mozilla-account }, pero nunca la confirmaste. Por favor confirma tu cuenta en los siguientes 10 días o será eliminada automáticamente.
verificationReminderSecond-sub-description-2 = Se parte de nuestra misión para transformar el internet en un lugar que sea libre para todos.
verificationReminderSecond-action-2 = Confirmar cuenta
verify-title-3 = Abre internet con { -brand-mozilla }
verify-description-2 = Confirma tu cuenta y saca el máximo provecho de tu { -brand-mozilla } donde quiera que inicies sesión con:
verify-subject = Terminar de crear tu cuenta
verify-action-2 = Confirmar cuenta
# Variables:
#  $clientName (String) - A client the user hasn't signed into before (e.g. Firefox, Sync)
verifyLogin-title-2 = ¿Iniciaste sesión en { $clientName }?
verifyLogin-description-2 = Ayúdanos a mantener tu cuenta segura confirmando que iniciaste sesión en:
verifyLogin-subject-2 = Confirmar inicio de sesión
verifyLogin-action = Confirmar inicio de sesión
# Variables:
#  $serviceName (String) - A service the user hasn't signed into before (e.g. Firefox)
verifyLoginCode-title-2 = ¿Iniciaste sesión en { $serviceName }?
# After the colon is a description of the device used to sign in to the service
verifyLoginCode-safe = Ayúdanos a mantener tu cuenta segura autorizando tu inicio de sesión en:
verifyLoginCode-prompt-3 = Si es así, aquí está tu código de autorización:
verifyLoginCode-expiry-notice = Expira en 5 minutos.
verifyPrimary-title-2 = Confirmar correo principal
verifyPrimary-description = Hubo una petición de realizar un cambio de cuenta desde el siguiente dispositivo:
verifyPrimary-subject = Confirmar correo principal
verifyPrimary-action-2 = Confirmar correo electrónico
verifyPrimary-action-plaintext-2 = { verifyPrimary-action-2 }:
verifyPrimary-post-verify-2 = Una vez confirmado, los cambios de cuenta, como agregar un correo electrónico secundario, serán posibles desde este dispositivo.
verifySecondaryCode-title-2 = Confirmar correo secundario
verifySecondaryCode-action-2 = Confirmar correo electrónico
# Variables:
#  $email (string) A user's unverified secondary email address
verifySecondaryCode-explainer-2 = Se ha realizado una solicitud para utilizar { $email } como dirección de correo electrónico secundario desde la siguiente { -product-mozilla-account }:
verifySecondaryCode-prompt-2 = Usar este código de confirmación:
verifySecondaryCode-expiry-notice-2 = Caduca en 5 minutos. Una vez confirmada, esta dirección comenzará a recibir notificaciones y confirmaciones de seguridad.
verifyShortCode-title-3 = Abre Internet con { -brand-mozilla }
# Information on the browser and device triggering this confirmation email follows below this string.
verifyShortCode-title-subtext-2 = Confirma tu cuenta y sácale el máximo provecho a { -brand-mozilla } donde sea que te conectes empezando por:
verifyShortCode-prompt-3 = Usar este código de confirmación:
verifyShortCode-expiry-notice = Caduca en 5 minutos.
