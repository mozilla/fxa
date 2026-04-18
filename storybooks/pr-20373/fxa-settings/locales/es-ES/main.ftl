



-brand-mozilla = Mozilla
-brand-firefox = Firefox
-product-firefox-accounts = Cuentas de Firefox
-product-mozilla-account = Cuenta de Mozilla
-product-mozilla-accounts =
    { $capitalization ->
        [uppercase] Cuentas de Mozilla
       *[lowercase] Cuentas de Mozilla
    }
-product-firefox-account = Cuenta de Firefox
-product-mozilla-vpn = Mozilla VPN
-product-mozilla-vpn-short = VPN
-product-mozilla-hubs = Mozilla Hubs
-product-mdn = MDN
-product-mdn-plus = MDN Plus
-product-firefox-cloud = Firefox Cloud
-product-mozilla-monitor = Mozilla Monitor
-product-mozilla-monitor-short = Monitor
-product-firefox-relay = Firefox Relay
-product-firefox-relay-short = Relay
-brand-apple = Apple
-brand-apple-pay = Apple Pay
-brand-google = Google
-brand-google-pay = Google Pay
-brand-paypal = PayPal
-brand-name-stripe = Stripe
-brand-amex = American Express
-brand-diners = Diners Club
-brand-discover = Discover
-brand-jcb = JCB
-brand-link = Link
-brand-mastercard = Mastercard
-brand-unionpay = UnionPay
-brand-visa = Visa
-app-store = App Store
-google-play = Google Play

app-general-err-heading = Error general de la aplicación
app-general-err-message = Algo ha salido mal. Por favor, inténtalo de nuevo más tarde.
app-query-parameter-err-heading = Solicitud incorrecta: parámetros de consulta no válidos


app-footer-mozilla-logo-label = Logo de { -brand-mozilla }
app-footer-privacy-notice = Aviso de privacidad del sitio web
app-footer-terms-of-service = Términos del servicio


app-default-title-2 = { -product-mozilla-accounts }
app-page-title-2 = { $title } | { -product-mozilla-accounts }


link-sr-new-window = Se abre en una ventana nueva


app-loading-spinner-aria-label-loading = Cargando…


app-logo-alt-3 =
    .alt = Logo con la m de { -brand-mozilla }



resend-code-success-banner-heading = Se ha enviado un nuevo código a tu correo electrónico.
resend-link-success-banner-heading = Se ha enviado un nuevo enlace a tu correo electrónico.
resend-success-banner-description = Añade { $accountsEmail } a tus contactos para asegurar una entrega sin problemas.


brand-banner-dismiss-button-2 =
    .aria-label = Cerrar aviso
brand-prelaunch-title = { -product-firefox-accounts } pasará a llamarse { -product-mozilla-accounts } el 1 de noviembre
brand-prelaunch-subtitle = Seguirás conectándote con el mismo nombre de usuario y contraseña, y no hay otros cambios en los productos que usas.
brand-postlaunch-title = Cambiamos el nombre de { -product-firefox-accounts } a { -product-mozilla-accounts }. Seguirás conectándote con el mismo nombre de usuario y contraseña, y no hay otros cambios en los productos que usas.
brand-learn-more = Saber más
brand-close-banner =
    .alt = Cerrar aviso
brand-m-logo =
    .alt = Logo con la m de { -brand-mozilla }


button-back-aria-label = Atrás
button-back-title = Atrás


recovery-key-download-button-v3 = Descargar y continuar
    .title = Descargar y continuar
recovery-key-pdf-heading = Clave de recuperación de cuenta
recovery-key-pdf-download-date = Generada: { $date }
recovery-key-pdf-key-legend = Clave de recuperación de cuenta
recovery-key-pdf-instructions = Esta clave te permite recuperar los datos cifrados de tu navegador (incluidas las contraseñas, los marcadores y el historial) en caso de que olvides tu contraseña. Guárdala en un lugar que recordarás.
recovery-key-pdf-storage-ideas-heading = Lugares para guardar la clave
recovery-key-pdf-support = Saber más acerca de tu clave de recuperación de cuenta
recovery-key-pdf-download-error = Lo sentimos, ha surgido un problema al descargar la clave de recuperación de cuenta.


choose-newsletters-prompt-2 = Obtener más de { -brand-mozilla }:
choose-newsletters-option-latest-news =
    .label = Recibe nuestras últimas noticias y actualizaciones de productos
choose-newsletters-option-test-pilot =
    .label = Acceso anticipado para probar nuevos productos
choose-newsletters-option-reclaim-the-internet =
    .label = Llamadas a la acción para recuperar Internet


datablock-download =
    .message = Descargado
datablock-copy =
    .message = Copiado
datablock-print =
    .message = Imprimido


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
datablock-print-success =
    { $count ->
        [one] Código impreso
       *[other] Códigos impresos
    }


datablock-inline-copy =
    .message = Copiado


device-info-block-location-city-region-country = { $city }, { $region }, { $country } (estimado)
device-info-block-location-region-country = { $region }, { $country } (estimado)
device-info-block-location-city-country = { $city }, { $country } (estimado)
device-info-block-location-country = { $country } (estimado)
device-info-block-location-unknown = Ubicación desconocida
device-info-browser-os = { $browserName } en { $genericOSName }
device-info-ip-address = Dirección IP: { $ipAddress }


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


form-verify-code-default-error = Este campo es obligatorio


form-verify-totp-disabled-button-title-numeric = Introduce un código de { $codeLength } dígitos para continuar
form-verify-totp-disabled-button-title-alphanumeric = Introduce un código de { $codeLength } caracteres para continuar


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


alert-icon-aria-label =
    .aria-label = Alerta
icon-attention-aria-label =
    .aria-label = Atención
icon-warning-aria-label =
    .aria-label = Advertencia
authenticator-app-aria-label =
    .aria-label = Aplicación de autenticación
backup-codes-icon-aria-label-v2 =
    .aria-label = Códigos de autenticación de respaldo activados
backup-codes-disabled-icon-aria-label-v2 =
    .aria-label = Códigos de autenticación de respaldo desactivados
backup-recovery-sms-icon-aria-label =
    .aria-label = SMS de recuperación habilitado
backup-recovery-sms-disabled-icon-aria-label =
    .aria-label = SMS de recuperación deshabilitado
canadian-flag-icon-aria-label =
    .aria-label = Bandera canadiense
checkmark-icon-aria-label =
    .aria-label = Marcar
checkmark-success-icon-aria-label =
    .aria-label = Todo correcto
checkmark-enabled-icon-aria-label =
    .aria-label = Activado
close-icon-aria-label =
    .aria-label = Cerrar mensaje
code-icon-aria-label =
    .aria-label = Código
error-icon-aria-label =
    .aria-label = Error
info-icon-aria-label =
    .aria-label = Información
usa-flag-icon-aria-label =
    .aria-label = Bandera de Estados Unidos


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
security-shield-aria-label =
    .aria-label = Ilustración para representar una clave de recuperación de cuenta.
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
sync-clouds-image-aria-label =
    .aria-label = Nubes con un icono de sincronización
confetti-falling-image-aria-label =
    .aria-label = Animación de confeti cayendo


inline-recovery-key-setup-signed-in-firefox-2 = Has iniciado sesión en { -brand-firefox }.
inline-recovery-key-setup-create-header = Asegura tu cuenta
inline-recovery-key-setup-create-subheader = ¿Tienes un minuto para proteger tus datos?
inline-recovery-key-setup-info = Crea una clave de recuperación de tu cuenta para que puedas restaurar tus datos de navegación sincronizada si alguna vez olvidas tu contraseña.
inline-recovery-key-setup-start-button = Crear una clave de recuperación de cuenta
inline-recovery-key-setup-later-button = Más tarde


input-password-hide = Ocultar contraseña
input-password-show = Mostrar contraseña
input-password-hide-aria-2 = Tu contraseña está actualmente visible en la pantalla.
input-password-show-aria-2 = Tu contraseña está actualmente oculta.
input-password-sr-only-now-visible = Tu contraseña ahora está visible en la pantalla.
input-password-sr-only-now-hidden = Tu contraseña ahora está oculta.


input-phone-number-country-list-aria-label = Elige un país
input-phone-number-enter-number = Introduce el número de teléfono
input-phone-number-country-united-states = Estados Unidos
input-phone-number-country-canada = Canadá
legal-back-button = Atrás


reset-pwd-link-damaged-header = El enlace para restablecer la contraseña está dañado
signin-link-damaged-header = Enlace de confirmación dañado
report-signin-link-damaged-header = Enlace dañado
reset-pwd-link-damaged-message = Al enlace que seleccionaste le faltan caracteres y puede que tu cliente de correo lo haya roto. Copia la dirección con cuidado y vuelve a intentarlo.


link-expired-new-link-button = Recibir nuevo enlace


remember-password-text = ¿Recuerdas tu contraseña?
remember-password-signin-link = Iniciar sesión


primary-email-confirmation-link-reused = El correo electrónico principal ya fue confirmado
signin-confirmation-link-reused = Inicio de sesión ya confirmado
confirmation-link-reused-message = Ese enlace de confirmación ya ha sido usado y solo puede usarse una vez.


locale-toggle-select-label = Selecciona un idioma
locale-toggle-browser-default = Predeterminado del navegador
error-bad-request = Solicitud incorrecta


password-info-balloon-why-password-info = Necesitas esta contraseña para acceder a los datos cifrados que almacenas con nosotros.
password-info-balloon-reset-risk-info = Un reinicio podría ocasionar la pérdida de datos como contraseñas y marcadores.


password-strength-long-instruction = Elige una contraseña segura que no hayas usado en otros sitios. Asegúrate de que cumpla con los requisitos de seguridad:
password-strength-short-instruction = Elige una contraseña segura:
password-strength-inline-min-length = Al menos 8 caracteres
password-strength-inline-not-email = Diferente a tu dirección de correo electrónico
password-strength-inline-not-common = Que no sea una contraseña de uso común
password-strength-inline-confirmed-must-match = La confirmación coincide con la nueva contraseña
password-strength-inline-passwords-match = Coincidencia de contraseñas


account-recovery-notification-cta = Crear
account-recovery-notification-header-value = No pierdas tus datos si olvidas tu contraseña
account-recovery-notification-header-description = Crea una clave de recuperación de cuenta para restaurar tus datos de navegación sincronizados si alguna vez olvidas tu contraseña.
recovery-phone-promo-cta = Añadir teléfono de recuperación
recovery-phone-promo-heading = Añade una protección adicional a tu cuenta con un teléfono de recuperación
recovery-phone-promo-description = Ahora puedes iniciar sesión con una contraseña de un solo uso a través de SMS si no puedes usar tu aplicación de autenticación de dos pasos.
recovery-phone-promo-info-link = Saber más sobre la recuperación y el riesgo de intercambio de SIM
promo-banner-dismiss-button =
    .aria-label = Descartar aviso


ready-complete-set-up-instruction = Completa la configuración introduciendo tu nueva contraseña en el resto de tus dispositivos { -brand-firefox }.
manage-your-account-button = Administra tu cuenta
ready-use-service = Ya tienes todo listo para usar { $serviceName }
ready-use-service-default = Ahora estás listo para utilizar los ajustes de la cuenta
ready-account-ready = ¡Tu cuenta está lista!
ready-continue = Continuar
sign-in-complete-header = Inicio de sesión confirmado
sign-up-complete-header = Cuenta confirmada
primary-email-verified-header = Correo electrónico principal confirmado


flow-recovery-key-download-storage-ideas-heading-v2 = Lugares para guardar la clave:
flow-recovery-key-download-storage-ideas-folder-v2 = Carpeta en un dispositivo seguro
flow-recovery-key-download-storage-ideas-cloud = Almacenamiento de confianza en la nube
flow-recovery-key-download-storage-ideas-print-v2 = Copia física impresa
flow-recovery-key-download-storage-ideas-pwd-manager = Administrador de contraseñas


flow-recovery-key-hint-header-v2 = Añade una pista para ayudarte a encontrar tu clave
flow-recovery-key-hint-message-v3 = Esta pista debería ayudarte a recordar dónde guardaste tu clave de recuperación de cuenta. Podemos mostrártela durante el restablecimiento de contraseña para recuperar tus datos.
flow-recovery-key-hint-input-v2 =
    .label = Introduce una pista (opcional)
flow-recovery-key-hint-cta-text = Finalizar
flow-recovery-key-hint-char-limit-error = La pista debe contener menos de 255 caracteres.
flow-recovery-key-hint-unsafe-char-error = La pista no puede contener caracteres Unicode inseguros. Solo se permiten letras, números, signos de puntuación y símbolos.


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


alert-bar-close-message = Cerrar mensaje


avatar-your-avatar =
    .alt = Tu avatar
avatar-default-avatar =
    .alt = Avatar predeterminado




bento-menu-title-3 = productos { -brand-mozilla }
bento-menu-tagline = Más productos de { -brand-mozilla } que protegen tu privacidad
bento-menu-vpn-2 = { -product-mozilla-vpn }
bento-menu-monitor-3 = { -product-mozilla-monitor }
bento-menu-firefox-relay-2 = { -product-firefox-relay }
bento-menu-firefox-desktop = Navegador { -brand-firefox } para escritorio
bento-menu-firefox-mobile = Navegador { -brand-firefox } para dispositivos móviles
bento-menu-made-by-mozilla = Creado por { -brand-mozilla }


connect-another-fx-mobile = Obtén { -brand-firefox } en un dispositivo móvil o tableta
connect-another-find-fx-mobile-2 = Busca { -brand-firefox } en { -google-play } y { -app-store }.
connect-another-play-store-image-2 =
    .alt = Descarga { -brand-firefox } en { -google-play }
connect-another-app-store-image-3 =
    .alt = Descargar { -brand-firefox } en { -app-store }


cs-heading = Servicios conectados
cs-description = Todo lo que estás usando y en lo que has iniciado sesión.
cs-cannot-refresh =
    Lo sentimos, hubo un problema al actualizar la lista de servicios
    conectados.
cs-cannot-disconnect = Cliente no encontrado, no se ha podido desconectar
cs-logged-out-2 = Desconectado de { $service }
cs-refresh-button =
    .title = Actualizar servicios conectados
cs-missing-device-help = ¿Faltan elementos o están duplicados?
cs-disconnect-sync-heading = Desconectar de Sync


cs-disconnect-sync-content-3 =
    Tus datos de navegación permanecerán en <span>{ $device }</span>, 
    pero ya no se sincronizarán con tu cuenta.
cs-disconnect-sync-reason-3 = ¿Cuál es el motivo principal para desconectar <span>{ $device }</span>?


cs-disconnect-sync-opt-prefix = El dispositivo es:
cs-disconnect-sync-opt-suspicious = Sospechoso
cs-disconnect-sync-opt-lost = Perdido o robado
cs-disconnect-sync-opt-old = Antiguo o reemplazado
cs-disconnect-sync-opt-duplicate = Duplicado
cs-disconnect-sync-opt-not-say = Prefiero no decirlo


cs-disconnect-advice-confirm = De acuerdo, entendido
cs-disconnect-lost-advice-heading = El dispositivo perdido o robado ha sido desconectado
cs-disconnect-lost-advice-content-3 =
    Ya que tu dispositivo fue extraviado o robado, para
    mantener tu información segura, deberías cambiar tu contraseña de { -product-mozilla-account } en la configuración de tu cuenta. También deberías buscar la información del fabricante del dispositivo sobre cómo borrar tus datos de forma remota.
cs-disconnect-suspicious-advice-heading = El dispositivo sospechoso ha sido desconectado
cs-disconnect-suspicious-advice-content-2 = Si el dispositivo desconectado es realmente sospechoso, para mantener tu información segura, deberías cambiar la contraseña de { -product-mozilla-account } en la configuración de tu cuenta. También deberías cambiar cualquier otra contraseña que guardaste en { -brand-firefox } escribiendo about:logins en la barra de direcciones.
cs-sign-out-button = Cerrar sesión


dc-heading = Recopilación y uso de datos
dc-subheader-moz-accounts = { -product-mozilla-accounts }
dc-subheader-ff-browser = Navegador { -brand-firefox }
dc-subheader-content-2 = Permitir que { -product-mozilla-accounts } envíe datos técnicos y de interacción a { -brand-mozilla }.
dc-subheader-ff-content = Para revisar o actualizar la configuración de datos de interacción y técnicos de tu navegador { -brand-firefox }, abre los ajustes de { -brand-firefox } y navega a Privacidad y seguridad.
dc-opt-out-success-2 = Desactivación correcta. { -product-mozilla-accounts } no enviará datos técnicos o de interacción a { -brand-mozilla }.
dc-opt-in-success-2 = ¡Gracias! Compartir estos datos nos ayuda a mejorar { -product-mozilla-accounts }.
dc-opt-in-out-error-2 = Lo sentimos, ha surgido un problema al cambiar tu preferencia de recolección de datos
dc-learn-more = Saber más


drop-down-menu-title-2 = menú { -product-mozilla-account }
drop-down-menu-signed-in-as-v2 = Sesión iniciada como
drop-down-menu-sign-out = Cerrar sesión
drop-down-menu-sign-out-error-2 = Lo sentimos, ha surgido un problema al cerrar tu sesión


flow-container-back = Atrás


flow-recovery-key-confirm-pwd-heading-v2 = Introduce de nuevo tu contraseña por seguridad
flow-recovery-key-confirm-pwd-input-label = Introduce tu contraseña
flow-recovery-key-confirm-pwd-submit-button = Crear una clave de recuperación de cuenta
flow-recovery-key-confirm-pwd-submit-button-change-key = Crear una nueva clave de recuperación de cuenta


flow-recovery-key-download-heading-v2 = Clave de recuperación de cuenta creada — Descárgala y guárdala ahora
flow-recovery-key-download-info-v2 = Esta clave te permite recuperar tus datos si olvidas tu contraseña. Descárgala ahora y guárdala en algún lugar que recuerdes — no podrás regresar a esta página más tarde.
flow-recovery-key-download-next-link-v2 = Continuar sin descargar


flow-recovery-key-success-alert = Clave de recuperación de cuenta creada


flow-recovery-key-info-header = Crea una clave de recuperación de cuenta en caso de que olvides tu contraseña
flow-recovery-key-info-header-change-key = Cambiar tu clave de recuperación de cuenta
flow-recovery-key-info-shield-bullet-point-v2 = Ciframos los datos de navegación: contraseñas, marcadores y más. Es lo mejor para la privacidad, pero podrías perder tus datos si olvidas tu contraseña.
flow-recovery-key-info-key-bullet-point-v2 = Por eso es tan importante crear una clave de recuperación de cuenta: puedes usarla para restaurar tus datos
flow-recovery-key-info-cta-text-v3 = Comenzar
flow-recovery-key-info-cancel-link = Cancelar


flow-setup-2fa-qr-heading = Conéctate a tu aplicación de autenticación
flow-setup-2a-qr-instruction = <strong>Paso 1:</strong> Escanea este código QR usando cualquier aplicación de autenticación, como Duo o Google Authenticator.
flow-setup-2fa-qr-alt-text =
    .alt = Código QR para configurar la autenticación en dos pasos. Escanéalo o selecciona "¿No puedes escanear el código QR?" para obtener una clave secreta de configuración.
flow-setup-2fa-cant-scan-qr-button = ¿No puedes escanear el código QR?
flow-setup-2fa-manual-key-heading = Introduce el código manualmente
flow-setup-2fa-manual-key-instruction = <strong>Paso 1:</strong> Introduce este código en tu aplicación de autenticación preferida.
flow-setup-2fa-scan-qr-instead-button = ¿Escanear código QR como alternativa?
flow-setup-2fa-more-info-link = Saber más sobre las aplicaciones de autenticación
flow-setup-2fa-button = Continuar
flow-setup-2fa-step-2-instruction = <strong>Paso 2:</strong> Introduce el código de tu aplicación de autenticación.
flow-setup-2fa-input-label = Introduce el código de 6 dígitos
flow-setup-2fa-code-error = Código inválido o caducado. Revisa tu aplicación de autenticación y vuelve a intentarlo.


flow-setup-2fa-backup-choice-heading = Elige un método de recuperación
flow-setup-2fa-backup-choice-description = Esto te permite iniciar sesión si no puedes acceder a tu dispositivo móvil o a la aplicación de autenticación.
flow-setup-2fa-backup-choice-phone-title = Teléfono de recuperación
flow-setup-2fa-backup-choice-phone-badge = Lo más fácil
flow-setup-2fa-backup-choice-phone-info = Obtén un código de recuperación por SMS. Disponible actualmente en Estados Unidos y Canadá.
flow-setup-2fa-backup-choice-code-title = Códigos de autenticación de respaldo
flow-setup-2fa-backup-choice-code-badge = Lo más seguro
flow-setup-2fa-backup-choice-code-info = Crea y guarda códigos de autenticación de un solo uso.
flow-setup-2fa-backup-choice-learn-more-link = Saber más sobre la recuperación y el riesgo de intercambio de SIM


flow-setup-2fa-backup-code-confirm-heading = Introduce el código de autenticación de respaldo
flow-setup-2fa-backup-code-confirm-confirm-saved = Confirma que has guardado tus códigos introduciendo uno. Sin estos códigos, es posible que no puedas iniciar sesión si no tienes tu aplicación de autenticación.
flow-setup-2fa-backup-code-confirm-code-input = Introduce el código de 10 caracteres
flow-setup-2fa-backup-code-confirm-button-finish = Finalizar


flow-setup-2fa-backup-code-dl-heading = Guardar códigos de autenticación de respaldo
flow-setup-2fa-backup-code-dl-save-these-codes = Guárdalos en un lugar que puedas recordar. Si no tienes acceso a tu aplicación de autenticación, necesitarás uno para conectarte.
flow-setup-2fa-backup-code-dl-button-continue = Continuar


flow-setup-2fa-inline-complete-success-banner = Autenticación en dos pasos activada
flow-setup-2fa-inline-complete-success-banner-description = Para proteger todos tus dispositivos conectados, debes cerrar sesión en todos los lugares donde uses esta cuenta y luego volver a iniciar sesión usando la nueva autenticación en dos pasos.
flow-setup-2fa-inline-complete-backup-code = Códigos de autenticación de respaldo
flow-setup-2fa-inline-complete-backup-phone = Teléfono de recuperación
flow-setup-2fa-inline-complete-backup-code-info =
    { $count ->
        [one] { $count } código restante
       *[other] { $count } códigos restantes
    }
flow-setup-2fa-inline-complete-backup-code-description = Este es el método de recuperación más seguro si no puedes iniciar sesión con tu dispositivo móvil o la aplicación de autenticación.
flow-setup-2fa-inline-complete-backup-phone-description = Este es el método de recuperación más sencillo si no puedes iniciar sesión con tu aplicación de autenticación.
flow-setup-2fa-inline-complete-learn-more-link = Cómo protege tu cuenta
flow-setup-2fa-inline-complete-continue-button = Continuar a { $serviceName }
flow-setup-2fa-prompt-heading = Configurar la autenticación en dos pasos
flow-setup-2fa-prompt-description = { $serviceName } requiere que configures la autenticación en dos pasos para mantener tu cuenta segura.
flow-setup-2fa-prompt-use-authenticator-apps = Puedes usar cualquiera de estas <authenticationAppsLink>aplicaciones de autenticación</authenticationAppsLink> para continuar.
flow-setup-2fa-prompt-continue-button = Continuar


flow-setup-phone-confirm-code-heading = Introduce el código de verificación
flow-setup-phone-confirm-code-instruction = Se envió un código de 6 dígitos a <span>{ $phoneNumber }</span> por SMS. Este código caduca en 5 minutos.
flow-setup-phone-confirm-code-input-label = Introduce el código de 6 dígitos
flow-setup-phone-confirm-code-button = Confirmar
flow-setup-phone-confirm-code-expired = ¿Código expirado?
flow-setup-phone-confirm-code-resend-code-button = Reenviar código
flow-setup-phone-confirm-code-resend-code-success = Código enviado
flow-setup-phone-confirm-code-success-message-v2 = Teléfono de recuperación añadido
flow-change-phone-confirm-code-success-message = Teléfono de recuperación cambiado


flow-setup-phone-submit-number-heading = Verifica tu número de teléfono
flow-setup-phone-verify-number-instruction = Recibirás un mensaje de texto de { -brand-mozilla } con un código para verificar tu número. No compartas este código con nadie.
flow-setup-phone-submit-number-info-message-v2 = El teléfono de recuperación sólo está disponible en Estados Unidos y Canadá. No se recomiendan los números VoIP ni las máscaras telefónicas.
flow-setup-phone-submit-number-legal = Al proporcionar tu número, aceptas que lo almacenemos para poder enviarte mensajes de texto únicamente para verificar tu cuenta. Pueden aplicarse tarifas por mensajes y datos.
flow-setup-phone-submit-number-button = Enviar código


header-menu-open = Cerrar menú
header-menu-closed = Menú de navegación del sitio
header-back-to-top-link =
    .title = Volver arriba
header-back-to-settings-link =
    .title = Volver a los ajustes de { -product-mozilla-account }
header-title-2 = { -product-mozilla-account }
header-help = Ayuda


la-heading = Cuentas vinculadas
la-description = Has autorizado el acceso a las siguientes cuentas.
la-unlink-button = Desvincular
la-unlink-account-button = Desvincular
la-set-password-button = Establecer contraseña
la-unlink-heading = Desvincular de cuenta de terceros
la-unlink-content-3 = ¿Seguro que quieres desvincular tu cuenta? Desvincular tu cuenta no te desconecta automáticamente de tus Servicios conectados. Para hacerlo, deberás cerrar sesión manualmente en la sección Servicios conectados.
la-unlink-content-4 = Antes de desvincular tu cuenta, debes establecer una contraseña. Sin una contraseña, no hay forma de que te conectes después de desvincular tu cuenta.
nav-linked-accounts = { la-heading }


modal-close-title = Cerrar
modal-cancel-button = Cancelar
modal-default-confirm-button = Confirmar


modal-mfa-protected-title = Introduce el código de confirmación
modal-mfa-protected-subtitle = Ayúdanos a asegurarnos de que seas tú quien cambia la información de tu cuenta.
modal-mfa-protected-instruction =
    { $expirationTime ->
        [one] Introduce el código que fue enviado a <email>{ $email }</email> dentro del próximo { $expirationTime } minuto.
       *[other] Introduce el código que fue enviado a <email>{ $email }</email> dentro de los próximos { $expirationTime } minutos.
    }
modal-mfa-protected-input-label = Introduce el código de 6 dígitos
modal-mfa-protected-cancel-button = Cancelar
modal-mfa-protected-confirm-button = Confirmar
modal-mfa-protected-code-expired = ¿Código caducado?
modal-mfa-protected-resend-code-link = Enviar código nuevo por correo electrónico.


mvs-verify-your-email-2 = Confirma tu correo electrónico
mvs-enter-verification-code-2 = Introduce tu código de confirmación
mvs-enter-verification-code-desc-2 = Por favor introduce en los 5 minutos siguientes el código de confirmación que se ha enviado a <email>{ $email }</email>.
msv-cancel-button = Cancelar
msv-submit-button-2 = Confirmar


nav-settings = Ajustes
nav-profile = Perfil
nav-security = Seguridad
nav-connected-services = Servicios conectados
nav-data-collection = Recopilación y uso de datos
nav-paid-subs = Suscripciones de pago
nav-email-comm = Comunicaciones por correo electrónico


page-2fa-change-title = Cambiar autenticación en dos pasos
page-2fa-change-success = Se ha actualizado la autenticación en dos pasos


tfa-replace-code-error-3 = Ha habido un problema al reemplazar tus códigos de autenticación de respaldo
tfa-create-code-error = Ha habido un problema al crear tus códigos de autenticación de respaldo
tfa-replace-code-success-alert-4 = Códigos de autenticación de respaldo actualizados


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


pw-change-header =
    .title = Cambiar contraseña
pw-8-chars = Al menos 8 caracteres
pw-not-email = Diferente a tu dirección de correo electrónico
pw-change-must-match = La nueva contraseña coincide con la confirmación
pw-commonly-used = No es una contraseña de uso común
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


pw-create-header =
    .title = Crear contraseña
pw-create-success-alert-2 = Contraseña establecida
pw-create-error-2 = Lo sentimos, ha surgido un problema al establecer tu contraseña


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


display-name-page-title =
    .title = Nombre para mostrar
display-name-input =
    .label = Introduce el nombre para mostrar
submit-display-name = Guardar
cancel-display-name = Cancelar
display-name-update-error-2 = Ha surgido un problema al actualizar tu nombre para mostrar
display-name-success-alert-2 = Nombre visible actualizado


recent-activity-title = Actividad reciente de la cuenta
recent-activity-account-create-v2 = Cuenta creada
recent-activity-account-disable-v2 = Cuenta desactivada
recent-activity-account-enable-v2 = Cuenta activada
recent-activity-account-login-v2 = Sesión de cuenta iniciada
recent-activity-account-reset-v2 = Se ha iniciado el restablecimiento de la contraseña
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
recent-activity-unknown = Otra actividad de la cuenta


recovery-key-create-page-title = Clave de recuperación de cuenta
recovery-key-create-back-button-title = Volver a los ajustes


recovery-phone-remove-header = Eliminar el número de teléfono de recuperación
settings-recovery-phone-remove-info = Esto eliminará <strong>{ $formattedFullPhoneNumber }</strong> como tu teléfono de recuperación.
settings-recovery-phone-remove-recommend = Te recomendamos que mantengas este método porque es más fácil que guardar códigos de autenticación de respaldo.
settings-recovery-phone-remove-recovery-methods = Si lo eliminas, asegúrate de que aún tengas guardados los códigos de autenticación de respaldo. <linkExternal>Comparar métodos de recuperación</linkExternal>
settings-recovery-phone-remove-button = Eliminar número de teléfono
settings-recovery-phone-remove-cancel = Cancelar
settings-recovery-phone-remove-success = Teléfono de recuperación eliminado


page-setup-recovery-phone-heading = Añadir teléfono de recuperación
page-change-recovery-phone = Cambiar teléfono de recuperación
page-setup-recovery-phone-back-button-title = Volver a los ajustes
page-setup-recovery-phone-step2-back-button-title = Cambiar número de teléfono


add-secondary-email-step-1 = Paso 1 de 2
add-secondary-email-error-2 = Ha surgido un problema al crear este correo electrónico
add-secondary-email-page-title =
    .title = Correo electrónico secundario
add-secondary-email-enter-address =
    .label = Escribe tu dirección de correo
add-secondary-email-cancel-button = Cancelar
add-secondary-email-save-button = Guardar
add-secondary-email-mask = Las máscaras de correo electrónico no se pueden usar como correo electrónico secundario


add-secondary-email-step-2 = Paso 2 de 2
verify-secondary-email-page-title =
    .title = Correo electrónico secundario
verify-secondary-email-verification-code-2 =
    .label = Introduce tu código de confirmación
verify-secondary-email-cancel-button = Cancelar
verify-secondary-email-verify-button-2 = Confirmar
verify-secondary-email-please-enter-code-2 = Por favor, escribe antes de 5 minutos el código de confirmacion que ha sido enviado a <strong>{ $email }</strong>.
verify-secondary-email-success-alert-2 = { $email } añadido correctamente


delete-account-link = Eliminar cuenta
inactive-update-status-success-alert = Has iniciado sesión correctamente. Tu { -product-mozilla-account } y tus datos permanecerán activos.


product-promo-monitor =
    .alt = { -product-mozilla-monitor }
product-promo-monitor-cta = Hacer un escaneo gratuito


profile-heading = Perfil
profile-picture =
    .header = Imagen
profile-display-name =
    .header = Nombre para mostrar
profile-primary-email =
    .header = Correo electrónico principal


progress-bar-aria-label-v2 = Paso { $currentStep } de { $numberOfSteps }.


security-heading = Seguridad
security-password =
    .header = Contraseña
security-password-created-date = Creado { $date }
security-not-set = No establecido
security-action-create = Crear
security-set-password = Establecer una contraseña para sincronizar y usar ciertas funciones de seguridad de la cuenta.
security-recent-activity-link = Ver actividad reciente de la cuenta
signout-sync-header = Sesión expirada
signout-sync-session-expired = Lo sentimos, algo ha salido mal. Cierra la sesión en el menú del navegador y vuelve a intentarlo.


tfa-row-backup-codes-title = Códigos de autenticación de respaldo
tfa-row-backup-codes-not-available = No hay códigos disponibles
tfa-row-backup-codes-available-v2 =
    { $numCodesAvailable ->
        [one] { $numCodesAvailable } código restante
       *[other] { $numCodesAvailable } códigos restantes
    }
tfa-row-backup-codes-get-new-cta-v2 = Crear nuevos códigos
tfa-row-backup-codes-add-cta = Añadir
tfa-row-backup-codes-description-2 = Este es el método de recuperación más seguro si no puedes utilizar tu dispositivo móvil o la aplicación de autenticación.
tfa-row-backup-phone-title-v2 = Teléfono de recuperación
tfa-row-backup-phone-not-available-v2 = No se ha añadido ningún número de teléfono
tfa-row-backup-phone-change-cta = Cambiar
tfa-row-backup-phone-add-cta = Añadir
tfa-row-backup-phone-delete-button = Eliminar
tfa-row-backup-phone-delete-title-v2 = Eliminar teléfono de recuperación
tfa-row-backup-phone-delete-restriction-v2 = Si quieres eliminar tu teléfono de recuperación, primero añade códigos de autenticación de respaldo o desactiva la autenticación de dos pasos para evitar el bloqueo de tu cuenta.
tfa-row-backup-phone-description-v2 = Este es el método de recuperación más sencillo si no puedes utilizar tu aplicación de autenticación.
tfa-row-backup-phone-sim-swap-risk-link = Saber más sobre el riesgo de intercambio de SIM


switch-turn-off = Desactivar
switch-turn-on = Activar
switch-submitting = Enviando…
switch-is-on = activado
switch-is-off = desactivado


row-defaults-action-add = Añadir
row-defaults-action-change = Cambiar
row-defaults-action-disable = Desactivar
row-defaults-status = Ninguno


rk-header-1 = Clave de recuperación de cuenta
rk-enabled = Activado
rk-not-set = No establecido
rk-action-create = Crear
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
unit-row-recovery-key-delete-icon-button-title = Eliminar clave de recuperación de cuenta


se-heading = Correo electrónico secundario
    .header = Correo electrónico secundario
se-cannot-refresh-email = Lo sentimos, ha surgido un problema al actualizar ese correo.
se-cannot-resend-code-3 = Lo sentimos, ha surgido un problema al enviar el código de confirmación
se-set-primary-successful-2 = { $email } es ahora tu correo principal
se-set-primary-error-2 = Lo sentimos, ha surgido un problema al cambiar tu correo principal
se-delete-email-successful-2 = { $email } eliminado correctamente
se-delete-email-error-2 = Lo sentimos, ha surgido un problema al eliminar este correo
se-verify-session-3 = Deberás confirmar tu sesión actual para realizar esta acción
se-verify-session-error-3 = Lo sentimos, ha surgido un problema al confirmar tu sesión
se-remove-email =
    .title = Eliminar correo electrónico
se-refresh-email =
    .title = Actualizar correo electrónico
se-unverified-2 = sin confirmar
se-resend-code-2 =
    Se requiere confirmación. <button>Reenviar código de confirmación</button>,
    en caso de que no esté en tu bandeja de entrada o carpeta de spam.
se-make-primary = Hacer principal
se-default-content = Accede a tu cuenta si no puedes conectarte a tu correo principal.
se-content-note-1 =
    Nota: un correo electrónico secundario no restaurará tu información — 
    necesitarás una <a>clave de recuperación de cuenta</a> para eso.
se-secondary-email-none = Ninguno


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
tfa-row-enabled-info-link = Cómo protege tu cuenta
tfa-row-disabled-description-v2 = Ayuda a proteger tu cuenta utilizando una aplicación de autenticación de terceros como segundo paso para iniciar sesión.
tfa-row-cannot-verify-session-4 = Lo sentimos, ha surgido un problema al confirmar tu sesión
tfa-row-disable-modal-heading = ¿Desactivar la autenticación en dos pasos?
tfa-row-disable-modal-confirm = Desactivar
tfa-row-disable-modal-explain-1 =
    No podrás deshacer esta acción. También
    tienes la opción de <linkExternal>reemplazar tus códigos de autenticación de respaldo</linkExternal>.
tfa-row-disabled-2 = Autenticación en dos pasos desactivada
tfa-row-cannot-disable-2 = La autenticación en dos pasos no ha podido ser desactivada


terms-privacy-agreement-default-2 = Al continuar, aceptas los <mozillaAccountsTos>Términos de servicio</mozillaAccountsTos> y <mozillaAccountsPrivacy>Aviso de privacidad</mozillaAccountsPrivacy>


third-party-auth-options-or = O
continue-with-google-button = Continuar con { -brand-google }
continue-with-apple-button = Continuar con { -brand-apple }


auth-error-102 = Cuenta desconocida
auth-error-103 = Contraseña incorrecta
auth-error-105-2 = Código de confirmación no válido
auth-error-110 = Token no válido
auth-error-114-generic = Has probado demasiadas veces. Inténtalo más tarde.
auth-error-114 = Has probado demasiadas veces. Vuelve a intentarlo { $retryAfter }.
auth-error-125 = Se bloqueó la solicitud por motivos de seguridad
auth-error-129-2 = Has escrito un número de teléfono no válido. Verifícalo y prueba de nuevo.
auth-error-138-2 = Sesión no confirmada
auth-error-139 = El correo electrónico secundario debe ser diferente del correo electrónico de tu cuenta
auth-error-155 = Token TOTP no encontrado
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
auth-error-1064 = ¿Escribiste mal tu correo electrónico? { $domain } no es un servicio de correo electrónico válido.
auth-error-1066 = Las máscaras de correo electrónico no pueden utilizarse para crear una cuenta.
auth-error-1067 = ¿Correo electrónico mal escrito?
recovery-phone-number-ending-digits = Número que termina en { $lastFourPhoneNumber }
oauth-error-1000 = Algo ha salido mal. Cierra la pestaña y vuelve a intentarlo.


connect-another-device-signed-in-header = Has iniciado sesión en { -brand-firefox }
connect-another-device-email-confirmed-banner = Correo electrónico confirmado
connect-another-device-signin-confirmed-banner = Inicio de sesión confirmado
connect-another-device-signin-to-complete-message = Inicia sesión en este { -brand-firefox } para completar la configuración
connect-another-device-signin-link = Iniciar sesión
connect-another-device-still-adding-devices-message = ¿Aún añadiendo dispositivos? Inicia sesión con { -brand-firefox } en otro dispositivo para completar la configuración.
connect-another-device-signin-another-device-to-complete-message = Inicia sesión con { -brand-firefox } en otro dispositivo para completar la configuración.
connect-another-device-get-data-on-another-device-message = ¿Quieres tener tus pestañas, marcadores y contraseñas en otro dispositivo?
connect-another-device-cad-link = Conectar otro dispositivo
connect-another-device-not-now-link = Ahora no
connect-another-device-android-complete-setup-message = Inicia sesión en { -brand-firefox } para Android para completar la configuración.
connect-another-device-ios-complete-setup-message = Inicia sesión en { -brand-firefox } para iOS para completar la configuración.


cookies-disabled-header = Se requiere almacenamiento local y cookies
cookies-disabled-enable-prompt-2 = Por favor, activa las cookies y el almacenamiento local en tu navegador para acceder a { -product-mozilla-account }. Si lo haces, se activarán funcionalidades como recordar tus datos entre sesiones.
cookies-disabled-button-try-again = Reintentar
cookies-disabled-learn-more = Saber más


index-header = Escribe tu correo electrónico
index-sync-header = Continuar a tu { -product-mozilla-account }
index-sync-subheader = Sincroniza tus contraseñas, pestañas y marcadores donde sea que uses { -brand-firefox }.
index-relay-header = Crear una máscara de correo electrónico
index-relay-subheader = Por favor, proporciona la dirección de correo electrónico a la que deseas reenviar correos electrónicos desde tu correo enmascarado.
index-subheader-with-servicename = Continuar a { $serviceName }
index-subheader-default = Continuar a configuración de cuenta
index-cta = Regístrate o inicia sesión
index-account-info = Una { -product-mozilla-account } también desbloquea el acceso a más productos de protección de privacidad de { -brand-mozilla }.
index-email-input =
    .label = Escribe tu correo electrónico
index-account-delete-success = Cuenta eliminada correctamente
index-email-bounced = Tu correo de confirmación acaba de ser devuelto. ¿Has escrito bien tu dirección?


inline-recovery-key-setup-create-error = ¡Vaya! No hemos podido crear tu clave de recuperación de cuenta. Prueba de nuevo más tarde.
inline-recovery-key-setup-recovery-created = Clave de recuperación de cuenta creada
inline-recovery-key-setup-download-header = Asegura tu cuenta
inline-recovery-key-setup-download-subheader = Descárgala y guárdala ahora
inline-recovery-key-setup-download-info = Guarda esta clave en algún lugar que puedas recordar — no podrás volver a esta página más tarde.
inline-recovery-key-setup-hint-header = Recomendación de seguridad


inline-totp-setup-cancel-setup-button = Cancelar configuración
inline-totp-setup-continue-button = Continuar
inline-totp-setup-add-security-link = Añade una capa de seguridad a tu cuenta requiriendo códigos de autenticación de una de <authenticationAppsLink>estas aplicaciones de autenticación</authenticationAppsLink>.
inline-totp-setup-enable-two-step-authentication-default-header-2 = Activa la autenticación en dos pasos <span>para continuar con la configuración de la cuenta</span>
inline-totp-setup-enable-two-step-authentication-custom-header-2 = Activa la autenticación en dos pasos <span>para continuar con { $serviceName }</span>
inline-totp-setup-ready-button = Listo
inline-totp-setup-show-qr-custom-service-header-2 = Escanea el código de autenticación <span> para continuar con { $serviceName }</span>
inline-totp-setup-no-qr-custom-service-header-2 = Introduce el código manualmente <span>para continuar con { $serviceName }</span>
inline-totp-setup-show-qr-default-service-header-2 = Escanea el código de autenticación <span>para continuar con la configuración de la cuenta</span>
inline-totp-setup-no-qr-default-service-header-2 = Introduce el código manualmente <span>para continuar con la configuración de la cuenta</span>
inline-totp-setup-enter-key-or-use-qr-instructions = Escribe esta clave secreta en tu aplicación de autenticación. <toggleToQRButton>¿Prefieres escanear el código QR?</toggleToQRButton>
inline-totp-setup-use-qr-or-enter-key-instructions = Escanea el código QR en tu aplicación de autenticación y luego introduce el código de autenticación que te proporciona. <toggleToManualModeButton>¿No puedes escanear el código?</toggleToManualModeButton>
inline-totp-setup-on-completion-description = Una vez completado, comenzará a generar códigos de seguridad para ti
inline-totp-setup-security-code-placeholder = Código de autenticación
inline-totp-setup-code-required-error = Código de autenticación requerido
tfa-qr-code-alt = Usa el código { $code } para configurar la autenticación en dos pasos en las aplicaciones admitidas.
inline-totp-setup-page-title = Autenticación en dos pasos


legal-header = Legal
legal-terms-of-service-link = Términos del servicio
legal-privacy-link = Aviso de privacidad


legal-privacy-heading = Aviso de privacidad


legal-terms-heading = Términos del servicio


pair-auth-allow-heading-text = ¿Acabas de iniciar sesión en { -product-firefox }?
pair-auth-allow-confirm-button = Sí, aprobar dispositivo
pair-auth-allow-refuse-device-link = Si no fuiste tú, <link>cambia tu contraseña</link>.


pair-auth-complete-heading = Dispositivo conectado
pair-auth-complete-now-syncing-device-text = Ahora estás sincronizando con: { $deviceFamily } en { $deviceOS }
pair-auth-complete-sync-benefits-text = Ahora puedes acceder a tus pestañas abiertas, contraseñas y marcadores en todos tus dispositivos.
pair-auth-complete-see-tabs-button = Ver pestañas de dispositivos sincronizados
pair-auth-complete-manage-devices-link = Administrar dispositivos


auth-totp-heading-w-default-service = Introduce el código de autenticación <span>para continuar con la configuración de la cuenta</span>
auth-totp-heading-w-custom-service = Introduce el código de autenticación <span>para continuar en { $serviceName }</span>
auth-totp-instruction = Abre tu aplicación de autenticación e introduce el código de autenticación que te proporciona.
auth-totp-input-label = Introduce el código de 6 dígitos
auth-totp-confirm-button = Confirmar
auth-totp-code-required-error = Código de autenticación requerido


pair-wait-for-supp-heading-text = Se requiere aprobación <span>desde tu otro dispositivo</span>


pair-failure-header = Ha fallado el emparejamiento
pair-failure-message = Proceso de configuración interrumpido.


pair-sync-header = Sincronizar { -brand-firefox } en tu teléfono o tableta
pair-cad-header = Conectar { -brand-firefox } en otro dispositivo
pair-already-have-firefox-paragraph = ¿Ya tienes { -brand-firefox } en un teléfono o tableta?
pair-sync-your-device-button = Sincroniza tu dispositivo
pair-or-download-subheader = O descargar
pair-scan-to-download-message = Escanea para descargar { -brand-firefox } para dispositivos móviles o envíate un <linkExternal>enlace de descarga</linkExternal>.
pair-not-now-button = Ahora no
pair-take-your-data-message = Lleva tus pestañas, marcadores y contraseñas a cualquier lugar donde uses { -brand-firefox }.
pair-get-started-button = Comenzar
pair-qr-code-aria-label = Código QR


pair-success-header-2 = Dispositivo conectado
pair-success-message-2 = Emparejamiento correcto.


pair-supp-allow-heading-text = Confirmar emparejamiento <span>para { $email }</span>
pair-supp-allow-confirm-button = Confirmar emparejamiento
pair-supp-allow-cancel-link = Cancelar


pair-wait-for-auth-heading-text = Se requiere aprobación <span>desde tu otro dispositivo</span>


pair-unsupported-header = Conectarse mediante una aplicación
pair-unsupported-message = ¿Has usado la cámara del sistema? Tienes que conectarla desde una aplicación de { -brand-firefox }.




set-password-heading-v2 = Crea una contraseña para sincronizar


third-party-auth-callback-message = Espera, estás siendo redirigido a la aplicación autorizada.


account-recovery-confirm-key-heading = Introduce tu clave de recuperación de cuenta
account-recovery-confirm-key-instruction = Esta clave recupera tus datos de navegación cifrados, como contraseñas y marcadores, desde los servidores de { -brand-firefox }.
account-recovery-confirm-key-input-label =
    .label = Escribe tu clave de recuperación de cuenta de 32 caracteres
account-recovery-confirm-key-hint = Tu sugerencia de almacenamiento es:
account-recovery-confirm-key-button-2 = Continuar
account-recovery-lost-recovery-key-link-2 = ¿No puedes encontrar tu clave de recuperación de cuenta?


complete-reset-pw-header-v2 = Crear una nueva contraseña
complete-reset-password-success-alert = Contraseña establecida
complete-reset-password-error-alert = Lo sentimos, ha surgido un problema al establecer tu contraseña
complete-reset-pw-recovery-key-link = Usar la clave de recuperación de la cuenta
reset-password-complete-banner-heading = Se ha restablecido tu contraseña maestra.
reset-password-complete-banner-message = No olvides generar una nueva clave de recuperación de cuenta desde la configuración de { -product-mozilla-account } para evitar futuros problemas de conexión.
complete-reset-password-desktop-relay = { -brand-firefox } intentará enviarte nuevamente donde estabas para que uses una máscara de correo electrónico después de iniciar sesión.


confirm-backup-code-reset-password-input-label = Introduce el código de 10 caracteres
confirm-backup-code-reset-password-confirm-button = Confirmar
confirm-backup-code-reset-password-subheader = Introduce el código de autenticación de respaldo
confirm-backup-code-reset-password-instruction = Introduce uno de los códigos de un solo uso que guardaste al configurar la autenticación en dos pasos.
confirm-backup-code-reset-password-locked-out-link = ¿Estás bloqueado?


confirm-reset-password-with-code-heading = Comprueba tu correo
confirm-reset-password-with-code-instruction = Hemos enviado un código de confirmación a <span>{ $email }</span>.
confirm-reset-password-code-input-group-label = Introduce el código de 8 dígitos dentro de los próximos 10 minutos
confirm-reset-password-otp-submit-button = Continuar
confirm-reset-password-otp-resend-code-button = Reenviar código
confirm-reset-password-otp-different-account-link = Usar una cuenta diferente


confirm-totp-reset-password-header = Restablecer tu contraseña
confirm-totp-reset-password-subheader-v2 = Escribir el código de autenticación en dos pasos
confirm-totp-reset-password-instruction-v2 = Comprueba tu <strong>aplicación de autenticación</strong> para restablecer tu contraseña.
confirm-totp-reset-password-trouble-code = ¿Problemas para introducir el código?
confirm-totp-reset-password-confirm-button = Confirmar
confirm-totp-reset-password-input-label-v2 = Introduce el código de 6 dígitos
confirm-totp-reset-password-use-different-account = Usar una cuenta diferente


password-reset-flow-heading = Restablecer tu contraseña
password-reset-body-2 =
    Te pediremos un par de cosas que solo tú sabes para mantener tu cuenta
    segura.
password-reset-email-input =
    .label = Escribe tu correo electrónico
password-reset-submit-button-2 = Continuar


reset-password-complete-header = Se ha restablecido tu contraseña
reset-password-confirmed-cta = Continuar a { $serviceName }




password-reset-recovery-method-header = Restablecer tu contraseña
password-reset-recovery-method-subheader = Elige un método de recuperación
password-reset-recovery-method-details = Asegurémonos de que seas tú quien utiliza tus métodos de recuperación.
password-reset-recovery-method-phone = Teléfono de recuperación
password-reset-recovery-method-code = Códigos de autenticación de respaldo
password-reset-recovery-method-code-info =
    { $numBackupCodes ->
        [one] { $numBackupCodes } código restante
       *[other] { $numBackupCodes } códigos restantes
    }
password-reset-recovery-method-send-code-error-heading = Se ha producido un problema al enviar un código a tu teléfono de recuperación
password-reset-recovery-method-send-code-error-description = Por favor, vuelve a intentarlo más tarde o utiliza tus códigos de autenticación de respaldo.


reset-password-recovery-phone-flow-heading = Restablecer tu contraseña
reset-password-recovery-phone-heading = Introducir código de recuperación
reset-password-recovery-phone-instruction-v3 = Se ha enviado un código de 6 dígitos al número de teléfono terminado en <span>{ $lastFourPhoneDigits }</span> por mensaje de texto. Este código caduca en 5 minutos. No compartas este código con nadie.
reset-password-recovery-phone-input-label = Introduce el código de 6 dígitos
reset-password-recovery-phone-code-submit-button = Confirmar
reset-password-recovery-phone-resend-code-button = Reenviar código
reset-password-recovery-phone-resend-success = Código enviado
reset-password-recovery-phone-locked-out-link = ¿Estás bloqueado?
reset-password-recovery-phone-send-code-error-heading = Se ha producido un problema al enviar un código.
reset-password-recovery-phone-code-verification-error-heading = Se ha producido un problema al verificar tu código.
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


error-label = Error:
validating-signin = Validando inicio de sesión…
complete-signin-error-header = Error de confirmación
signin-link-expired-header = Enlace de confirmación expirado
signin-link-expired-message-2 = El enlace en el que hiciste clic ha caducado o ya ha sido utilizado.


signin-password-needed-header-2 = Introduce tu contraseña <span>para tu { -product-mozilla-account }</span>
signin-subheader-without-logo-with-servicename = Continuar a { $serviceName }
signin-subheader-without-logo-default = Continuar a configuración de cuenta
signin-button = Iniciar sesión
signin-header = Iniciar sesión
signin-use-a-different-account-link = Usar una cuenta diferente
signin-forgot-password-link = ¿Olvidaste tu contraseña?
signin-password-button-label = Contraseña
signin-desktop-relay = { -brand-firefox } intentará enviarte nuevamente donde estabas para que uses una máscara de correo electrónico después de iniciar sesión.
signin-code-expired-error = El código ha caducado. Por favor, inicia sesión de nuevo.
signin-account-locked-banner-heading = Restablecer tu contraseña
signin-account-locked-banner-description = Hemos bloqueado tu cuenta para protegerla de actividades sospechosas.
signin-account-locked-banner-link = Restablece tu contraseña para iniciar sesión


report-signin-link-damaged-body = Al enlace que has pulsado le faltan caracteres y puede que tu cliente de correo lo haya roto. Copia la dirección con cuidado y vuelve a intentarlo.
report-signin-header = ¿Informar de un inicio de sesión no autorizado?
report-signin-body = Has recibido un correo electrónico sobre un intento de acceso a tu cuenta. ¿Quieres informar de esta actividad como sospechosa?
report-signin-submit-button = Informar de actividad
report-signin-support-link = ¿Por qué sucede esto?
report-signin-error = Lo sentimos, ha habido un problema al enviar el informe.
signin-bounced-header = Lo sentimos. Hemos bloqueado tu cuenta.
signin-bounced-message = El correo electrónico de confirmación enviado a { $email } fue devuelto y hemos bloqueado tu cuenta para proteger tus datos de { -brand-firefox }.
signin-bounced-help = Si esta es una dirección de correo válida, <linkExternal>háznoslo saber</linkExternal> y podremos ayudarte a desbloquear tu cuenta.
signin-bounced-create-new-account = ¿Ese correo electrónico ya no es tuyo? Crea una cuenta nueva
back = Atrás


signin-push-code-heading-w-default-service = Verifica este inicio de sesión <span>para continuar con la configuración de la cuenta</span>
signin-push-code-heading-w-custom-service = Verifica este inicio de sesión <span>para continuar a { $serviceName }</span>
signin-push-code-instruction = Por favor, verifica tus otros dispositivos y aprueba esta conexión desde tu navegador { -brand-firefox }.
signin-push-code-did-not-recieve = ¿No has recibido la notificación?
signin-push-code-send-email-link = Enviar código por correo electrónico


signin-push-code-confirm-instruction = Confirma tu inicio de sesión
signin-push-code-confirm-description = Hemos detectado un intento de inicio de sesión desde el siguiente dispositivo. Si has sido tú, por favor, aprueba el inicio de sesión
signin-push-code-confirm-verifying = Verificando
signin-push-code-confirm-login = Confirmar inicio de sesión
signin-push-code-confirm-wasnt-me = No he sido yo, cambiar la contraseña.
signin-push-code-confirm-login-approved = Se ha aprobado tu inicio de sesión. Puedes cerrar esta ventana.
signin-push-code-confirm-link-error = El enlace está dañado. Prueba de nuevo.


signin-recovery-method-header = Iniciar sesión
signin-recovery-method-subheader = Elige un método de recuperación
signin-recovery-method-details = Asegurémonos de que seas tú quien utiliza tus métodos de recuperación.
signin-recovery-method-phone = Teléfono de recuperación
signin-recovery-method-code-v2 = Códigos de autenticación de respaldo
signin-recovery-method-code-info-v2 =
    { $numBackupCodes ->
        [one] { $numBackupCodes } código restante
       *[other] { $numBackupCodes } códigos restantes
    }
signin-recovery-method-send-code-error-heading = Ha habido un problema al enviar un código a tu teléfono de recuperación
signin-recovery-method-send-code-error-description = Por favor, vuelve a intentarlo más tarde o utiliza tus códigos de autenticación de respaldo.


signin-recovery-code-heading = Iniciar sesión
signin-recovery-code-sub-heading = Introduce el código de autenticación de respaldo
signin-recovery-code-instruction-v3 = Introduce uno de los códigos de un solo uso que guardaste al configurar la autenticación en dos pasos.
signin-recovery-code-input-label-v2 = Introduce el código de 10 caracteres
signin-recovery-code-confirm-button = Confirmar
signin-recovery-code-phone-link = Usar teléfono de recuperación
signin-recovery-code-support-link = ¿Estás bloqueado?
signin-recovery-code-required-error = Se requiere un código de autenticación de respaldo
signin-recovery-code-use-phone-failure = Se ha producido un problema al enviar un código a tu teléfono de recuperación
signin-recovery-code-use-phone-failure-description = Por favor, vuelve a intentarlo más tarde.


signin-recovery-phone-flow-heading = Iniciar sesión
signin-recovery-phone-heading = Introducir código de recuperación
signin-recovery-phone-instruction-v3 = Se ha enviado un código de 6 dígitos por SMS al número de teléfono que termina en <span>{ $lastFourPhoneDigits }</span>. Este código caduca en 5 minutos. No lo compartas con nadie.
signin-recovery-phone-input-label = Introduce el código de 6 dígitos
signin-recovery-phone-code-submit-button = Confirmar
signin-recovery-phone-resend-code-button = Reenviar código
signin-recovery-phone-resend-success = Código enviado
signin-recovery-phone-locked-out-link = ¿Estás bloqueado?
signin-recovery-phone-send-code-error-heading = Se ha producido un problema al enviar un código.
signin-recovery-phone-code-verification-error-heading = Se ha producido un problema al verificar tu código.
signin-recovery-phone-general-error-description = Por favor, vuelve a intentarlo más tarde.
signin-recovery-phone-invalid-code-error-description = El código no es válido o ha expirado.
signin-recovery-phone-invalid-code-error-link = ¿Utilizar códigos de autenticación de respaldo en su lugar?
signin-recovery-phone-success-message = Se ha iniciado sesión correctamente. Se pueden aplicar límites si vuelves a usar tu teléfono de recuperación.


signin-reported-header = Gracias por tu vigilancia
signin-reported-message = Se ha notificado a nuestro equipo. Informes como éste nos permiten mantener a raya a los intrusos.


signin-token-code-heading-2 = Introduce el código de confirmación <span> para tu { -product-mozilla-account }</span>
signin-token-code-instruction-v2 = Introduce en un plazo de 5 minutos el código de verificación que se envió a <email>{ $email }</email>.
signin-token-code-input-label-v2 = Introduce el código de 6 dígitos
signin-token-code-confirm-button = Confirmar
signin-token-code-code-expired = ¿Código caducado?
signin-token-code-resend-code-link = Enviar código nuevo por correo electrónico.
signin-token-code-required-error = Código de confirmación requerido
signin-token-code-resend-error = Ha habido un problema. No se ha podido enviar un nuevo código.
signin-token-code-instruction-desktop-relay = { -brand-firefox } intentará enviarte nuevamente donde estabas para que uses una máscara de correo electrónico después de iniciar sesión.


signin-totp-code-header = Iniciar sesión
signin-totp-code-subheader-v2 = Escribir el código de autenticación en dos pasos
signin-totp-code-instruction-v4 = Comprueba tu <strong>aplicación de autenticación</strong> para confirmar tu inicio de sesión.
signin-totp-code-input-label-v4 = Introduce el código de 6 dígitos
signin-totp-code-confirm-button = Confirmar
signin-totp-code-other-account-link = Usar una cuenta diferente
signin-totp-code-recovery-code-link = ¿Problemas para introducir el código?
signin-totp-code-required-error = Código de autenticación requerido
signin-totp-code-desktop-relay = { -brand-firefox } intentará enviarte nuevamente donde estabas para que uses una máscara de correo electrónico después de iniciar sesión.


signin-unblock-header = Autorizar este inicio de sesión
signin-unblock-body = Revisa tu correo por el código de verificación enviado a { $email }.
signin-unblock-code-input = Introducir el código de autorización
signin-unblock-submit-button = Continuar
signin-unblock-code-required-error = Se requiere un código de autorización
signin-unblock-code-incorrect-length = El código de autorización debe tener 8 caracteres
signin-unblock-code-incorrect-format-2 = El código de autorización solo puede contener letras y/o números
signin-unblock-resend-code-button = ¿No está en la bandeja de entrada o en la carpeta de spam? Reenviar
signin-unblock-support-link = ¿Por qué sucede esto?
signin-unblock-desktop-relay = { -brand-firefox } intentará enviarte nuevamente donde estabas para que uses una máscara de correo electrónico después de iniciar sesión.




confirm-signup-code-page-title = Introduce el código de confirmación
confirm-signup-code-heading-2 = Introduce el código de confirmación <span>para tu { -product-mozilla-account }</span>
confirm-signup-code-instruction-v2 = Introduce en un plazo de 5 minutos el código de verificación que se envió a <email>{ $email }</email>.
confirm-signup-code-input-label = Introduce el código de 6 dígitos
confirm-signup-code-confirm-button = Confirmar
confirm-signup-code-sync-button = Empezar a sincronizar
confirm-signup-code-code-expired = ¿Código caducado?
confirm-signup-code-resend-code-link = Enviar código nuevo por correo electrónico.
confirm-signup-code-success-alert = Cuenta confirmada correctamente
confirm-signup-code-is-required-error = Código de confirmación requerido
confirm-signup-code-desktop-relay = { -brand-firefox } intentará enviarte nuevamente donde estabas para que uses una máscara de correo electrónico después de iniciar sesión.


signup-heading-v2 = Crear una contraseña
signup-relay-info = Se necesita una contraseña para administrar de forma segura tus correos electrónicos enmascarados y acceder a las herramientas de seguridad de { -brand-mozilla }.
signup-change-email-link = Cambiar correo


signup-confirmed-sync-header = La sincronización está activada
signup-confirmed-sync-button = Comienza a navegar
signup-confirmed-sync-add-device-link = Añadir otro dispositivo
signup-confirmed-sync-manage-sync-button = Administrar sincronización
signup-confirmed-sync-set-password-success-banner = Contraseña de sincronización creada
