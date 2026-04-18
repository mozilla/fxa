## Email content
## Emails do not contain buttons, only links. Emails have a rich HTML version and a plaintext
## version. The strings are usually identical but sometimes they differ slightly.

fxa-header-mozilla-logo = <img data-l10n-name="mozilla-logo" alt="Logo de { -brand-mozilla }">
fxa-header-sync-devices-image = <img data-l10n-name="sync-devices-image" alt="Dispositivos en Sync">
body-devices-image = <img data-l10n-name="devices-image" alt="Dispositivos">
fxa-privacy-url = Política de privacidad de { -brand-mozilla }
moz-accounts-privacy-url-2 = Nota de privacidad de { -product-mozilla-accounts(capitalization: "uppercase") }
moz-accounts-terms-url = Términos de servicio de la { -product-mozilla-accounts(capitalization: "uppercase") }
account-deletion-info-block-communications = Si se borra tu cuenta, seguirás recibiendo correos electrónicos de Mozilla Corporation y Mozilla Foundation, a menos que <a data-l10n-name="unsubscribeLink">pidás cancelar la suscripción</a>.
account-deletion-info-block-support = Si tenés alguna pregunta o necesitás asistencia, no dudés en comunicarte con nuestro <a data-l10n-name="supportLink">equipo de soporte</a>.
account-deletion-info-block-communications-plaintext = Si se borra tu cuenta, seguirás recibiendo correos electrónicos de Mozilla Corporation y Mozilla Foundation, a menos que pidás cancelar la suscripción.
account-deletion-info-block-support-plaintext = Si tenés alguna pregunta o necesitás asistencia, no dudés en comunicarte con nuestro equipo de soporte:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
body-android-badge = <img data-l10n-name="google-play-badge" alt="Descarga { $productName } en { -google-play }">
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
body-ios-badge = <img data-l10n-name="apple-app-badge" alt="Descarga { $productName } en la { -app-store }">
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-desktop-device-2 = Instalá { $productName } en <a data-l10n-name="anotherDeviceLink">otro dispositivo de escritorio</a>.
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-device-2 = Instalá { $productName } en <a data-l10n-name="anotherDeviceLink">otro dispositivo</a>.
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
android-download-plaintext = Obtené { $productName } en Google Play:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
ios-download-plaintext = Descargá { $productName } de la App Store:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-device-plaintext = Instalá { $productName } en otro dispositivo:
automated-email-change-2 = Si no hiciste esta acción, <a data-l10n-name="passwordChangeLink">cambiá tu contraseña</a> de inmediato.
automated-email-support = Para obtener más información, visitá <a data-l10n-name="supportLink">Soporte de { -brand-mozilla }</a>.
# After the colon, there's a link to https://accounts.firefox.com/settings/change_password
automated-email-change-plaintext-2 = Si no hiciste esta acción, cambiá tu contraseña de inmediato:
#  After the colon, there's a link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
automated-email-support-plaintext = Para más información, visitá Soporte de { -brand-mozilla }:
automated-email-inactive-account = Este es un correo electrónico automático. Lo recibiste porque tenés una { -product-mozilla-account } y han pasado 2 años desde la última vez que iniciaste sesión.
# supportLink - https://support.mozilla.org/kb/im-having-problems-my-firefox-account
automated-email-no-action = { automated-email-no-action-plaintext } Para más información, visitá <a data-l10n-name="supportLink">Soporte de { -brand-mozilla }</a>.
automated-email-no-action-plaintext = Este es un correo electrónico automatizado. Si lo recibiste por error, no necesitás hacer nada.
#  After the colon, there's a link to https://accounts.firefox.com/settings/change_password
automated-email-not-authorized-plaintext = Este es un correo electrónico automatizado; Si no autorizaste esta acción, cambiá tu contraseña:
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
# - $uaOS: the user agent's operating system (e.g, MacOS)
# - $uaOSVersion - the user agent's operating system version
automatedEmailRecoveryKey-origin-device-all = Este pedido vino de { $uaBrowser } en { $uaOS } { $uaOSVersion }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
# - $uaOS: the user agent's operating system (e.g, MacOS)
automatedEmailRecoveryKey-origin-device-browser-os = Este pedido vino de { $uaBrowser } en { $uaOS }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
automatedEmailRecoveryKey-origin-device-browser-only = Este pedido vino de { $uaBrowser }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaOS: the user agent's operating system (e.g, MacOS)
# - $uaOSVersion - the user agent's operating system version
automatedEmailRecoveryKey-origin-device-OS-version-only = Este pedido vino de { $uaOS } { $uaOSVersion }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaOS: the user agent's operating system (e.g, MacOS)
automatedEmailRecoveryKey-origin-device-OS-only = Este pedido vino de { $uaOS }.
automatedEmailRecoveryKey-delete-key-change-pwd = Si no fuiste vos, <a data-l10n-name="revokeAccountRecoveryLink">borrá la nueva clave</a> y <a data-l10n-name="passwordChangeLink">cambiá tu contraseña</a>.
automatedEmailRecoveryKey-change-pwd-only = Si no fuiste vos, <a data-l10n-name="passwordChangeLink">cambiá tu contraseña</a>.
automatedEmailRecoveryKey-more-info = Para obtener más información, visitá <a data-l10n-name="supportLink">Soporte de { -brand-mozilla }</a>.
# Colon is followed by user device info on a separate line (e.g., "Firefox Nightly on Mac OSX 10.11")
automatedEmailRecoveryKey-origin-plaintext = Este pedido vino de:
# Colon is followed by a URL to the account recovery key section of account settings
automatedEmailRecoveryKey-notyou-delete-key-plaintext = Si no fuiste vos, borrá la nueva clave:
# Colon is followed by a URL to the change password section of account settings
automatedEmailRecoveryKey-notyou-change-pwd-only-plaintext = Si no fuiste vos, cambiá tu contraseña:
# This string is shown on its own line, after automatedEmailRecoveryKey-notyou-delete-key-plaintext and its URL
# Colon is followed by a URL to the change password section of account settings
automatedEmailRecoveryKey-notyou-change-pwd-plaintext = y cambiá tu contraseña:
# Colon is followed by a URL to Mozilla Support's "I'm having problems with my account" page
automatedEmailRecoveryKey-more-info-plaintext = Para más información, visitá Soporte de { -brand-mozilla }:
automated-email-reset =
    Este es un correo electrónico automático; si no autorizaste esta acción, entonces <a data-l10n-name="resetLink">cambiá tu contraseña</a>.
    Para más información, visitá <a data-l10n-name="supportLink">la ayuda de { -brand-mozilla }</a>.
# Variables:
#  $resetLink (String) - Link to https://accounts.firefox.com/reset_password
automated-email-reset-plaintext-v2 = Si no la autorizaste está acción, restablecé tu contraseña ahora mismo en { $resetLink }
# This message is used by multiple automated emails that notify users of security events on their account
# "this action" is meant to be a generic term, and could, for example, refer to using a backup authentication code to confirm a password reset
automated-email-reset-pwd-two-factor = Si no hiciste esta acción, entonces <a data-l10n-name="resetLink">restablecé tu contraseña</a> y <a data-l10n-name="twoFactorSettingsLink">restablecé la autenticación de dos pasos</a> ahora mismo. Para más información, visitá <a data-l10n-name="supportLink">Soporte de { -brand-mozilla }</a>.
# Followed by link to https://accounts.firefox.com/reset_password
automated-email-reset-pwd-plaintext-v3 = Si no hiciste esta acción, restablecé tu contraseña ahora mismo en:
# Followed by link to https://accounts.firefox.com/settings#two-step-authentication
automated-email-reset-two-factor-plaintext = Además, restablecé la autenticación de dos pasos en:
automated-email-sign-in = Este es un correo electrónico automático; si no autorizaste esta acción, <a data-l10n-name="securitySettingsLink">revisá la configuración de seguridad de tu cuenta</a>. Para obtener más información, visite <a data-l10n-name="supportLink">Soporte de { -brand-mozilla } </a>.
automated-email-sign-in-plaintext = Si no autorizaste esta acción, revisá la configuración de seguridad de tu cuenta en:
brand-banner-message = ¿Sabías que cambiamos nuestro nombre de { -product-firefox-accounts } a { -product-mozilla-accounts }? <a data-l10n-name="learnMore">Conocer más</a>
change-password-plaintext = Si creés que alguien está intentando acceder a tu cuenta, por favor cambiá la contraseña.
manage-account = Administrar cuenta
manage-account-plaintext = { manage-account }:
# Variables:
#  $supportUrl (String) - Link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
support-message-3 = Para obtener más información, visitá <a data-l10n-name="supportLink">Soporte de { -brand-mozilla }</a>.
# Variables:
#  $supportUrl (String) - Link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
support-message-plaintext = Para más información visitá Soporte de { -brand-mozilla }: { $supportUrl }.
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
cadReminderFirst-subject-1 = ¡Recordatorio! Sincronicemos { -brand-firefox }
cadReminderFirst-action = Sincronizar otro dispositivo
cadReminderFirst-action-plaintext = { cadReminderFirst-action }:
# In the title of the email, "It takes two to sync", "two" refers to syncing two devices
cadReminderFirst-title-1 = Se necesitan dos para sincronizar
cadReminderFirst-description-v2 = Llevá tus pestañas a través de todos tus dispositivos. Llevá tus marcadores, contraseñas y otros datos dondequiera que usés { -brand-firefox }.
cadReminderSecond-subject-2 = ¡No te lo perdás! Terminemos la configuración de tu sincronización
cadReminderSecond-action = Sincronizar otro dispositivo
cadReminderSecond-title-2 = ¡No te olvidés de sincronizar!
cadReminderSecond-description-sync = Sincronizá tus marcadores, contraseñas, pestañas abiertas y mucho más, donde sea que usés { -brand-firefox }.
cadReminderSecond-description-plus = Además, tus datos siempre están encriptados. Solo vos y los dispositivos aprobados pueden verlos.
inactiveAccountFinalWarning-subject = Última oportunidad de mantener tu { -product-mozilla-account }
inactiveAccountFinalWarning-title = Tu cuenta de { -brand-mozilla } y sus datos se borrarán
inactiveAccountFinalWarning-preview = Iniciá sesión para mantener tu cuenta
inactiveAccountFinalWarning-account-description = Tu { -product-mozilla-account } se usa para acceder a productos gratuitos de privacidad y navegación como { -brand-firefox } sync, { -product-mozilla-monitor }, { -product-firefox-relay } y { -product-mdn }.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
# This date will already be formatted with moment.js into Thursday, Jan 9, 2025 format
inactiveAccountFinalWarning-impact = El <strong>{ $deletionDate }</strong>, tu cuenta y tus datos personales se eliminarán permanentemente a menos que iniciés sesión.
inactiveAccountFinalWarning-action = Iniciá sesión para mantener tu cuenta
# followed by link to sign in
inactiveAccountFinalWarning-action-plaintext = Iniciá sesión para mantener tu cuenta:
inactiveAccountFirstWarning-subject = No perdás tu cuenta
inactiveAccountFirstWarning-title = ¿Querés mantener tu cuenta de { -brand-mozilla } y sus datos?
inactiveAccountFirstWarning-account-description-v2 = Tu { -product-mozilla-account } se usa para acceder a productos gratuitos de privacidad y navegación como { -brand-firefox } sync, { -product-mozilla-monitor }, { -product-firefox-relay } y { -product-mdn }.
inactiveAccountFirstWarning-inactive-status = Hemos detectado que no has iniciado sesión en 2 años.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
# This date will already be formatted with moment.js into Thursday, Jan 9, 2025 format
inactiveAccountFirstWarning-impact = Tu cuenta y tus datos personales se eliminarán permanentemente <strong>el { $deletionDate }</strong>porque no estuviste activo.
inactiveAccountFirstWarning-action = Iniciá sesión para mantener tu cuenta
inactiveAccountFirstWarning-preview = Iniciá sesión para mantener tu cuenta
# followed by link to sign in
inactiveAccountFirstWarning-action-plaintext = Iniciá sesión para mantener tu cuenta:
inactiveAccountSecondWarning-subject = Acción requerida: eliminación de la cuenta en 7 días
inactiveAccountSecondWarning-title = Tu cuenta de { -brand-mozilla } y sus datos se borrarán en 7 días
inactiveAccountSecondWarning-account-description-v2 = Tu { -product-mozilla-account } se usa para acceder a productos gratuitos de privacidad y navegación como { -brand-firefox } sync, { -product-mozilla-monitor }, { -product-firefox-relay } y { -product-mdn }.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
inactiveAccountSecondWarning-impact = Tu cuenta y tus datos personales se eliminarán permanentemente el <strong>{ $deletionDate }</strong> porque no estuviste activo.
inactiveAccountSecondWarning-action = Iniciá sesión para mantener tu cuenta
inactiveAccountSecondWarning-preview = Iniciá sesión para mantener tu cuenta
# followed by link to sign in
inactiveAccountSecondWarning-action-plaintext = Iniciá sesión para mantener tu cuenta:
# The user has a low number of valid recovery codes remaining for use
codes-reminder-title-zero = ¡Ya no tenés códigos de autenticación de respaldo!
codes-reminder-title-one = Estás en el último código de autenticación de respaldo
codes-reminder-title-two = Es hora de crear más códigos de autenticación de respaldo
codes-reminder-description-part-one = Los códigos de autenticación de respaldo te ayudan a restaurar tu información cuando olvidás tu contraseña.
codes-reminder-description-part-two = Creá nuevos códigos ahora para no perder tus datos más adelante.
codes-reminder-description-two-left = Solo te quedan dos códigos.
codes-reminder-description-create-codes = Creá nuevos códigos de autenticación de respaldo para ayudarte a volver a ingresar a tu cuenta si estás bloqueado.
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
newDeviceLogin-subjectForMozillaAccount = Nuevo inicio de sesión en tu { -product-mozilla-account }
newDeviceLogin-title-3 = Se usó tu { -product-mozilla-account } para iniciar sesión
# The "Not you?" question is asking whether the recipient of the email is the
# person who performed the action that triggered the email.
newDeviceLogin-change-password = ¿No fuiste vos? <a data-l10n-name="passwordChangeLink">Cambiá tu contraseña</a>.
# The "Not you?" question is asking whether the recipient of the email is the
# person who performed the action that triggered the email.
newDeviceLogin-change-password-plain = ¿No fuiste vos? Cambiá tu contraseña:
newDeviceLogin-action = Administrar cuenta
passwordChangeRequired-subject = Actividad sospechosa detectada
passwordChangeRequired-preview = Cambiá tu contraseña inmediatamente
passwordChangeRequired-title-2 = Restablecé tu contraseña
passwordChangeRequired-suspicious-activity-3 = Bloqueamos tu cuenta para mantenerla a salvo de actividad sospechosa. Se cerró la sesión en todos tus dispositivos y todos los datos sincronizados se eliminaron como precaución.
passwordChangeRequired-sign-in-3 = Para volver a iniciar sesión en tu cuenta, todo lo que tenés que hacer es restablecer tu contraseña.
passwordChangeRequired-different-password-2 = <b>Importante:</b> Elegí una contraseña segura que sea diferente a la que usaste en el pasado.
passwordChangeRequired-different-password-plaintext-2 = Importante: Elegí una contraseña segura que sea diferente a la que usaste en el pasado.
passwordChangeRequired-action = Restablecer contraseña
passwordChangeRequired-action-plaintext = { passwordChangeRequired-action }:
passwordChanged-subject = Contraseña actualizada
passwordChanged-title = Contraseña cambiada exitosamente
passwordChanged-description-2 = Tu contraseña de { -product-mozilla-account } se cambió correctamente desde el siguiente dispositivo:
# Variables:
#  $code (String) - The confirmation code for sign-in
password-forgot-otp-subject-2 = Usá { $code } para cambiar tu contraseña
password-forgot-otp-preview = Este código caduca en 10 minutos
password-forgot-otp-title = ¿Te olvidaste la contraseña?
password-forgot-otp-request = Recibimos una solicitud de cambio de contraseña en tu { -product-mozilla-account } de:
password-forgot-otp-code-2 = Si fuiste vos, este es tu código de confirmación para continuar:
password-forgot-otp-expiry-notice = Este código caduca en 10 minutos.
passwordReset-subject-2 = Tu contraseña fue restablecida
passwordReset-title-2 = Tu contraseña fue restablecida
# This sentence is followed by information about the device and time of the password reset
passwordReset-description-2 = Restableciste tu contraseña de { -product-mozilla-account } en:
passwordResetAccountRecovery-subject-2 = Tu contraseña fue restablecida
passwordResetAccountRecovery-title-3 = Tu contraseña fue restablecida
# Followed by details on the device, location, and date/time of the password reset.
passwordResetAccountRecovery-description-3 = Usaste la clave de recuperación de cuenta para restablecer tu contraseña de { -product-mozilla-account } en:
passwordResetAccountRecovery-information = Cerramos la sesión en todos tus dispositivos sincronizados. Creamos una nueva clave de recuperación de cuenta para reemplazar la que usaste. Podés cambiarla en la configuración de tu cuenta.
# After the colon there is a link to account settings
passwordResetAccountRecovery-information-txt = Cerramos la sesión en todos tus dispositivos sincronizados. Creamos una nueva clave de recuperación de cuenta para reemplazar la que usaste. Podés cambiarla en la configuración de tu cuenta:
passwordResetAccountRecovery-action-4 = Administrar cuenta
passwordResetRecoveryPhone-subject = Teléfono de recuperación usado
passwordResetRecoveryPhone-preview = Verificá para asegurarte de que fuiste vos
passwordResetRecoveryPhone-title = Tu teléfono de recuperación fue usado para confirmar un restablecimiento de contraseña
passwordResetRecoveryPhone-device = Teléfono de recuperación usado desde:
passwordResetRecoveryPhone-action = Administrar cuenta
passwordResetWithRecoveryKeyPrompt-subject = Tu contraseña fue restablecida
passwordResetWithRecoveryKeyPrompt-title = Tu contraseña fue restablecida
# Details of the device and date/time where the password was reset
passwordResetWithRecoveryKeyPrompt-description = Restableciste tu contraseña de { -product-mozilla-account } en:
# Text for button action to create a new account recovery key
passwordResetWithRecoveryKeyPrompt-action = Crear clave de recuperación de cuenta
# colon is followed by a link to create an account recovery key from the account settings page
passwordResetWithRecoveryKeyPrompt-action-txt = Crear clave de recuperación de cuenta:
passwordResetWithRecoveryKeyPrompt-cta-description = Tendrás que volver a iniciar sesión en todos tus dispositivos sincronizados. Mantené tus datos seguros la próxima vez con una clave de recuperación de cuenta. Esto te permite recuperar tus datos si olvidás tu contraseña.
postAddAccountRecovery-subject-3 = Se creó una nueva clave de recuperación de cuenta
postAddAccountRecovery-title2 = Creaste una nueva clave de recuperación de cuenta
# Key here refers to account recovery key
postAddAccountRecovery-body-part1 = Guardá esta clave en un lugar seguro; la necesitarás para restaurar tus datos de navegación cifrados si olvidás la contraseña.
# Key here refers to account recovery key
postAddAccountRecovery-body-part2 = Esta clave solo se puede usar una vez. Después de usarla, crearemos una nueva automáticamente. O podés crear una nueva en cualquier momento desde la configuración de tu cuenta.
postAddAccountRecovery-action = Administrar cuenta
postAddLinkedAccount-subject-2 = Nueva cuenta vinculada a tu { -product-mozilla-account }
#  Variables:
#  $providerName (String) - The name of the provider, e.g. Apple, Google
postAddLinkedAccount-title-2 = Tu cuenta de { $providerName } se ha vinculado a tu { -product-mozilla-account }
postAddLinkedAccount-action = Administrar cuenta
postAddPasskey-subject = Clave de acceso creada
postAddPasskey-preview = Ahora podés usar tu dispositivo para iniciar sesión
postAddPasskey-title = Creó una clave de acceso
postAddPasskey-description = Ahora podés usarlo para iniciar sesión en todos tus servicios de { -product-mozilla-account }.
postAddPasskey-sync-note = Tené en cuenta que tu contraseña seguirá siendo necesaria para acceder a tus datos sincronizados de { -brand-firefox }.
# Links out to a support article about passkeys and { -brand-firefox } sync
postAddPasskey-learn-more = Conocer más
postAddPasskey-requested-from = Pediste esto a:
postAddPasskey-action = Administrar cuenta
postAddRecoveryPhone-subject = Teléfono de recuperación agregado
postAddRecoveryPhone-preview = Cuenta protegida por autenticación de dos pasos
postAddRecoveryPhone-title-v2 = Agregaste un número de teléfono de recuperación
# Variables:
#  $maskedLastFourPhoneNumber (String) - A bullet point mask with the last four digits of the user's phone number, e.g. ••••••1234
postAddRecoveryPhone-description-v2 = Agregaste { $maskedLastFourPhoneNumber } como tu número de teléfono de recuperación
# Links out to a support article about two factor authentication
postAddRecoveryPhone-how-protect = Cómo esto protege tu cuenta
postAddRecoveryPhone-how-protect-plaintext = Cómo esto protege tu cuenta:
postAddRecoveryPhone-enabled-device = Lo habilitaste desde:
postAddRecoveryPhone-action = Administrar cuenta
postAddTwoStepAuthentication-preview = Tu cuenta está protegida
postAddTwoStepAuthentication-subject-v3 = La autenticación de dos pasos está activada
postAddTwoStepAuthentication-title-2 = Activaste la autenticación en dos pasos
# After the colon, there is a description of the device that the user used to enable two-step authentication
postAddTwoStepAuthentication-from-device-v2 = Pediste esto a:
postAddTwoStepAuthentication-action = Administrar cuenta
postAddTwoStepAuthentication-code-required-v4 = Los códigos de seguridad de tu aplicación de autenticación ahora son requeridos cada vez que iniciés sesión.
postAddTwoStepAuthentication-recovery-method-codes = También agregaste códigos de autenticación de respaldo como tu método de recuperación.
# Variables:
#  $maskedPhoneNumber (String) - A bullet point mask with the last four digits of the user's phone number, e.g. ••••••1234
postAddTwoStepAuthentication-recovery-method-phone = También agregaste { $maskedPhoneNumber } como tu número de teléfono de recuperación.
postAddTwoStepAuthentication-how-protects-link = Cómo esto protege tu cuenta
postAddTwoStepAuthentication-how-protects-plaintext = Cómo esto protege tu cuenta:
postAddTwoStepAuthentication-device-sign-out-message = Para proteger todos los dispositivos conectados, tenés que cerrar sesión en todos los lugares donde se esté usando esta cuenta y luego volver a iniciar sesión usando la autenticación de dos pasos.
postChangeAccountRecovery-subject = Se cambió la clave de recuperación de la cuenta
postChangeAccountRecovery-title = Cambiaste la clave de recuperación de la cuenta
postChangeAccountRecovery-body-part1 = Ahora tenés una nueva clave de recuperación de cuenta. Se eliminó tu clave anterior.
postChangeAccountRecovery-body-part2 = Guardá esta nueva clave en un lugar seguro; la necesitarás para restaurar tus datos de navegación cifrados si olvidás la contraseña.
postChangeAccountRecovery-action = Administrar cuenta
postChangePrimary-subject = Correo electrónico principal actualizado
postChangePrimary-title = Nuevo correo electrónico principal
# Variables:
#  $email (String) - A user's email address
postChangePrimary-description-2 = Cambiaste correctamente tu correo principal a { $email }. Este correo es ahora tu nombre de usuario para iniciar sesión en tu { -product-mozilla-account }, así como para recibir notificaciones de seguridad y confirmaciones de inicio de sesión.
postChangePrimary-action = Administrar cuenta
postChangeRecoveryPhone-subject = Teléfono de recuperación actualizado
postChangeRecoveryPhone-preview = Cuenta protegida por autenticación de dos pasos
postChangeRecoveryPhone-title = Cambiaste tu teléfono de recuperación
postChangeRecoveryPhone-description = Ahora tenés un nuevo teléfono de recuperación. Se eliminó tu número de teléfono anterior.
postChangeRecoveryPhone-requested-device = Lo pediste a:
postChangeTwoStepAuthentication-preview = Tu cuenta está protegida
postChangeTwoStepAuthentication-subject = Se actualizó la autenticación de dos pasos
postChangeTwoStepAuthentication-title = Se actualizó la autenticación de dos pasos
postChangeTwoStepAuthentication-use-new-account = Ahora necesitás usar la nueva entrada { -product-mozilla-account } en tu aplicación de autenticación. La antigua ya no funcionará y podrás eliminarla.
# After the colon, there is a description of the device that the user used to enable two-step authentication
postChangeTwoStepAuthentication-from-device = Pediste esto a:
postChangeTwoStepAuthentication-action = Administrar cuenta
postChangeTwoStepAuthentication-how-protects-link = Cómo esto protege tu cuenta
postChangeTwoStepAuthentication-how-protects-plaintext = Cómo esto protege tu cuenta:
postChangeTwoStepAuthentication-device-sign-out-message = Para proteger todos los dispositivos conectados, tenés que cerrar sesión en todos los lugares donde se esté usando esta cuenta y luego volver a iniciar sesión con la nueva autenticación de dos pasos.
postConsumeRecoveryCode-title-3 = Tu código de autenticación de respaldo fue usado para confirmar un restablecimiento de contraseña
# After the colon, there is description of the device that the backup authentication code was used on
# E.g., Firefox Nightly on Mac OSX, Thursday Sept 2, 2024
postConsumeRecoveryCode-description-3 = Código usado desde:
postConsumeRecoveryCode-action = Administrar cuenta
postConsumeRecoveryCode-subject-v3 = Código de autenticación de respaldo usado
postConsumeRecoveryCode-preview = Verificá para asegurarte de que fuiste vos
postNewRecoveryCodes-subject-2 = Nuevos códigos de autenticación de respaldo creados
postNewRecoveryCodes-title-2 = Creaste nuevos códigos de autenticación de respaldo
# After the colon, there is information about the device that the authentication codes were created on
postNewRecoveryCodes-description-2 = Fueron creados en:
postNewRecoveryCodes-action = Administrar cuenta
postRemoveAccountRecovery-subject-2 = Clave de recuperación de cuenta borrada
postRemoveAccountRecovery-title-3 = Borraste la clave de recuperación de la cuenta
postRemoveAccountRecovery-body-part1 = Se requiere la clave de recuperación de la cuenta para restaurar los datos de navegación cifrados si olvidás la contraseña.
postRemoveAccountRecovery-body-part2 = Si todavía no lo hiciste, creá una nueva clave de recuperación de cuenta en la configuración de tu cuenta para evitar perder tus contraseñas guardadas, marcadores, historial de navegación y más.
postRemoveAccountRecovery-action = Administrar cuenta
postRemovePasskey-subject = Clave de acceso eliminada
postRemovePasskey-preview = Se eliminó una clave de acceso de su cuenta
postRemovePasskey-title = Borraste tu clave de acceso
postRemovePasskey-description = Tendrás que usar otro método para iniciar sesión.
postRemovePasskey-requested-from = Pediste esto a:
postRemovePasskey-action = Administrar cuenta
postRemoveRecoveryPhone-subject = Teléfono de recuperación eliminado
postRemoveRecoveryPhone-preview = Cuenta protegida por autenticación de dos pasos
postRemoveRecoveryPhone-title = Teléfono de recuperación eliminado
postRemoveRecoveryPhone-description-v2 = Tu teléfono de recuperación se eliminó de la configuración de autenticación en dos pasos.
postRemoveRecoveryPhone-description-extra = Todavía podés usar tus códigos de autenticación de respaldo para iniciar sesión si no podés usar tu aplicación de autenticación.
postRemoveRecoveryPhone-requested-device = Lo solicitaste a:
postRemoveSecondary-subject = Correo electrónico secundario eliminado
postRemoveSecondary-title = Correo electrónico secundario eliminado
# Variables:
#  $secondaryEmail (String) - A user's email address
postRemoveSecondary-description-2 = Eliminaste correctamente { $secondaryEmail } como correo electrónico secundario de tu { -product-mozilla-account }. Las notificaciones de seguridad y confirmaciones de inicio de sesión ya no se enviarán a esta dirección.
postRemoveSecondary-action = Administrar cuenta
postRemoveTwoStepAuthentication-subject-line-2 = La autenticación de dos pasos está activada
postRemoveTwoStepAuthentication-title-2 = Se desactivó la autenticación de dos pasos
# After the colon is a description of the device the user used to disable two-step authentication
postRemoveTwoStepAuthentication-from-device = Se deshabilitó desde:
postRemoveTwoStepAuthentication-action = Administrar cuenta
postRemoveTwoStepAuthentication-not-required-2 = Ya no se necesitan los códigos de seguridad de la aplicación de autenticación al iniciar sesión.
postSigninRecoveryCode-subject = Código de autenticación de respaldo usado para iniciar sesión
postSigninRecoveryCode-preview = Confirmar actividad de cuenta
postSigninRecoveryCode-title = Tu código de autenticación de respaldo se usó para iniciar sesión
postSigninRecoveryCode-description = Si no hiciste esto, debés cambiar tu contraseña inmediatamente para mantener tu cuenta segura.
postSigninRecoveryCode-device = Iniciaste sesión desde:
postSigninRecoveryCode-action = Administrar cuenta
postSigninRecoveryPhone-subject = Teléfono de recuperación usado para iniciar sesión
postSigninRecoveryPhone-preview = Confirmar actividad de cuenta
postSigninRecoveryPhone-title = Se usó tu teléfono de recuperación para iniciar sesión
postSigninRecoveryPhone-description = Si no hiciste esto, debés cambiar tu contraseña inmediatamente para mantener tu cuenta segura.
postSigninRecoveryPhone-device = Iniciaste sesión desde:
postSigninRecoveryPhone-action = Administrar cuenta
postVerify-sub-title-3 = ¡Estamos encantados de verte!
postVerify-title-2 = ¿Querés ver la misma pestaña en dos dispositivos?
postVerify-description-2 = ¡Es fácil! Instalá{ -brand-firefox } en otro dispositivo e inicia sesión para sincronizar. ¡Parece magia!
postVerify-sub-description = (Psst… también significa que podés tener tus marcadores, contraseñas y otros datos de { -brand-firefox } dondequiera que hayas iniciado sesión).
postVerify-subject-4 = ¡Bienvenido a { -brand-mozilla }!
postVerify-setup-2 = Conectar otro dispositivo:
postVerify-action-2 = Conectar otro dispositivo
postVerifySecondary-subject = Correo electrónico secundario añadido
postVerifySecondary-title = Correo electrónico secundario añadido
# Variables:
#  $secondaryEmail (String) - A user's secondary email address
postVerifySecondary-content-3 = Confirmaste correctamente { $secondaryEmail } como correo electrónico secundario para tu { -product-mozilla-account }. Las notificaciones de seguridad y confirmaciones de inicio de sesión ahora se enviarán a ambas direcciones de correo electrónico.
postVerifySecondary-action = Administrar cuenta
recovery-subject = Restablecé tu contraseña
recovery-title-2 = ¿Te olvidaste la contraseña?
# Information on the device, location, and date and time of the request that triggered the email follows.
recovery-request-origin-2 = Recibimos una solicitud de cambio de contraseña en tu { -product-mozilla-account } de:
recovery-new-password-button = Creá una nueva contraseña haciendo clic en el siguiente botón. Este enlace expirará en una hora.
recovery-copy-paste = Creá una nueva contraseña copiando y pegando la siguiente URL en un navegador. Este enlace expirará en una hora.
recovery-action = Crear nueva contraseña
# Variables:
#  $unblockCode (String) - The authorization code for sign-in
unblockCode-subject-2 = Usá { $unblockCode } para iniciar sesión
unblockCode-preview = Este código caduca en una hora
unblockCode-title = ¿Sos vos iniciando una sesión?
unblockCode-prompt = Si es así, acá está el código de autorización necesario:
# Variables:
#  $unblockCode (String) - An alphanumeric code
unblockCode-prompt-plaintext = Si es así, este es el código de autorización que necesitás: { $unblockCode }
unblockCode-report = Si no, ayudanos a alejar a los intrusos <a data-l10n-name="reportSignInLink">informándonos</a>.
unblockCode-report-plaintext = Si no es así, ayudanos a defendernos de los intrusos e informarnos.
verificationReminderFinal-subject = Último recordatorio para confirmar tu cuenta
verificationReminderFinal-description-2 = Hace un par de semanas creaste una { -product-mozilla-account }, pero nunca la confirmaste. Para tu seguridad, borraremos la cuenta si no es verificada en las próximas 24 horas.
confirm-account = Confirmar cuenta
confirm-account-plaintext = { confirm-account }:
verificationReminderFirst-subject-2 = Acordate de confirmar tu cuenta
verificationReminderFirst-title-3 = ¡Bienvenido a { -brand-mozilla }!
verificationReminderFirst-description-3 = Hace unos días creaste una { -product-mozilla-account }, pero nunca la confirmaste. Confirmá tu cuenta en los próximos 15 días o será borrada automáticamente.
verificationReminderFirst-sub-description-3 = No te perdás el navegador que te pone a vos y a tu privacidad en primer lugar.
confirm-email-2 = Confirmar cuenta
confirm-email-plaintext-2 = { confirm-email-2 }:
verificationReminderFirst-action-2 = Confirmar cuenta
verificationReminderSecond-subject-2 = Acordate de confirmar tu cuenta
verificationReminderSecond-title-3 = ¡No te pierdas { -brand-mozilla }!
verificationReminderSecond-description-4 = Hace unos días creaste una { -product-mozilla-account }, pero nunca la confirmaste. Confirmá tu cuenta en los próximos 10 días o será borrada automáticamente.
verificationReminderSecond-second-description-3 = Tu { -product-mozilla-account } te permite sincronizar tu experiencia de { -brand-firefox } en todos tus dispositivos y desbloquea el acceso a más productos de { -brand-mozilla } que protegen la privacidad.
verificationReminderSecond-sub-description-2 = Sé parte de nuestra misión de transformar Internet en un lugar abierto para todos.
verificationReminderSecond-action-2 = Confirmar cuenta
verify-title-3 = Abrí Internet con { -brand-mozilla }
verify-description-2 = Confirmá tu cuenta y aprovechá { -brand-mozilla } al máximo cada vez que iniciás una sesión con:
verify-subject = Terminar de crear la cuenta
verify-action-2 = Confirmar cuenta
# Variables:
# $code (String) - The verification code
verifyAccountChange-subject = Usá { $code } para cambiar tu cuenta
# Variables:
# $expirationTime (Number) - Represents the expiration time in minutes
verifyAccountChange-preview =
    { $expirationTime ->
        [one] Este código expira en { $expirationTime } minuto.
       *[other] Este código expira en { $expirationTime } minutos.
    }
verifyAccountChange-title = ¿Estás cambiando la información de tu cuenta?
# After the colon is a description of the device used to sign in to the service
verifyAccountChange-safe = Ayudanos a mantener tu cuenta segura aprobando este cambio en:
verifyAccountChange-prompt = Si es así, usá este código de autorización:
# Variables:
# $expirationTime (Number) - Represents the expiration time in minutes
verifyAccountChange-expiry-notice =
    { $expirationTime ->
        [one] Expira en { $expirationTime } minuto.
       *[other] Expira en { $expirationTime } minutos.
    }
# Variables:
#  $clientName (String) - A client the user hasn't signed into before (e.g. Firefox, Sync)
verifyLogin-title-2 = ¿Iniciaste sesión en { $clientName }?
verifyLogin-description-2 = Ayudanos a mantener tu cuenta segura confirmando que iniciaste sesión en:
verifyLogin-subject-2 = Confirmar inicio de sesión
verifyLogin-action = Confirmar inicio de sesión
# Variables:
#  $code (String) - The confirmation code for sign-in
verifyLoginCode-subject-line-3 = Usá { $code } para iniciar sesión
verifyLoginCode-preview = Este código caduca en 5 minutos.
# Variables:
#  $serviceName (String) - A service the user hasn't signed into before (e.g. Firefox)
verifyLoginCode-title-2 = ¿Iniciaste sesión en { $serviceName }?
# After the colon is a description of the device used to sign in to the service
verifyLoginCode-safe = Ayudanos a mantener tu cuenta segura aprobando el inicio de sesión en:
verifyLoginCode-prompt-3 = Si es así, usá este código de autorización:
verifyLoginCode-expiry-notice = Caduca en 5 minutos.
verifyPrimary-title-2 = Confirmar correo electrónico principal
verifyPrimary-description = Se hizo un pedido para ejecutar un cambio de cuenta desde el siguiente dispositivo:
verifyPrimary-subject = Confirmar correo electrónico principal
verifyPrimary-action-2 = Confirmar correo electrónico
verifyPrimary-action-plaintext-2 = { verifyPrimary-action-2 }:
verifyPrimary-post-verify-2 = Cuando se confirme, los cambios de cuenta como agregar un correo electrónico secundario serán posibles desde este dispositivo.
# Variables:
#  $code (String) - The confirmation code for secondary email
verifySecondaryCode-subject-2 = Usá { $code } para confirmar tu correo electrónico secundario
verifySecondaryCode-preview = Este código caduca en 5 minutos.
verifySecondaryCode-title-2 = Confirmar correo electrónico secundario
verifySecondaryCode-action-2 = Confirmar correo electrónico
# Variables:
#  $email (string) A user's unverified secondary email address
verifySecondaryCode-explainer-2 = Se recibió una solicitud para utilizar { $email } como cuenta secundaria de correo electrónico desde la siguiente { -product-mozilla-account }:
verifySecondaryCode-prompt-2 = Usá este código de confirmación:
verifySecondaryCode-expiry-notice-2 = Caduca en 5 minutos. Una vez confirmada, esta dirección a a empezar a recibir notificaciones de seguridad y confirmaciones.
# Variables:
#  $code (String) - comfirmation code for the account
verifyShortCode-subject-4 = Usá { $code } para confirmar tu cuenta
verifyShortCode-preview-2 = Este código caduca en 5 minutos
verifyShortCode-title-3 = Abrí Internet con { -brand-mozilla }
# Information on the browser and device triggering this confirmation email follows below this string.
verifyShortCode-title-subtext-2 = Confirmá tu cuenta y aprovechá { -brand-mozilla } al máximo cada vez que iniciás una sesión con:
verifyShortCode-prompt-3 = Usá este código de confirmación:
verifyShortCode-expiry-notice = Caduca en 5 minutos.
