## Non-email strings

session-verify-send-push-title-2 = ¿Conectándote a tu { -product-mozilla-account }?
session-verify-send-push-body-2 = Haz clic aquí para confirmar que eres tú
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to verify phone ownership when registering a recovery phone
recovery-phone-setup-sms-body = { $code } es tu código de verificación de { -brand-mozilla }. Expira en 5 minutos.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to verify phone ownership when registering a recovery phone
recovery-phone-setup-sms-short-body = Código de verificación de { -brand-mozilla }: { $code }
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for two-step authentication
recovery-phone-signin-sms-body = { $code } es tu código de recuperación de { -brand-mozilla }. Expira en 5 minutos.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for two-step authentication
recovery-phone-signin-sms-short-body = Código de { -brand-mozilla }: { $code }
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for account password reset
recovery-phone-reset-password-sms-body = { $code } es tu código de recuperación de { -brand-mozilla }. Expira en 5 minutos.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for account password reset
recovery-phone-reset-password-short-body = Código de { -brand-mozilla }: { $code }

## Email content
## Emails do not contain buttons, only links. Emails have a rich HTML version and a plaintext
## version. The strings are usually identical but sometimes they differ slightly.

fxa-header-mozilla-logo = <img data-l10n-name="mozilla-logo" alt="{ -brand-mozilla } logo">
fxa-header-sync-devices-image = <img data-l10n-name="sync-devices-image" alt="Sincronizar dispositivos">
body-devices-image = <img data-l10n-name="devices-image" alt="Dispositivos">
fxa-privacy-url = Política de privacidad de { -brand-mozilla }
moz-accounts-privacy-url-2 = Política de privacidad de { -product-mozilla-accounts(capitalization: "uppercase") }
moz-accounts-terms-url = Términos del servicio de { -product-mozilla-accounts(capitalization: "uppercase") }
subplat-header-mozilla-logo-2 = <img data-l10n-name="subplat-mozilla-logo" alt="{ -brand-mozilla } logo">
subplat-footer-mozilla-logo-2 = <img data-l10n-name="mozilla-logo-footer" alt="{ -brand-mozilla } logo">
subplat-automated-email = Este es un email automático. Si lo recibiste por error, no necesitas hacer nada.
subplat-privacy-notice = Política de privacidad
subplat-privacy-plaintext = Aviso de privacidad:
subplat-update-billing-plaintext = { subplat-update-billing }:
# Variables:
#  $email (String) - A user's primary email address
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subplat-explainer-specific-2 = Estás recibiendo este correo porque { $email } tiene una cuenta de { -product-mozilla-account } y te has registrado para { $productName }.
# Variables:
#  $email (String) - A user's primary email address
subplat-explainer-reminder-form-2 = Estás recibiendo este correo porque { $email } cuenta con una { -product-mozilla-account }
subplat-explainer-multiple-2 = Estás recibiendo este correo porque { $email } tiene una cuenta de { -product-mozilla-account } y te has registrado para múltiples productos.
subplat-explainer-was-deleted-2 = Estás recibiendo este correo porque { $email } fue registrado para una { -product-mozilla-account }
subplat-manage-account-2 = Gestiona los ajustes de tu cuenta de { -product-mozilla-account } visitando nuestra <a data-l10n-name="subplat-account-page">página de la cuenta</a>.
# Variables:
#  $accountSettingsUrl (String) - URL to Account Settings
subplat-manage-account-plaintext-2 = Gestiona tus ajustes de { -product-mozilla-account } visitando la página de tu cuenta: { $accountSettingsUrl }
subplat-terms-policy = Términos y política de cancelación
subplat-terms-policy-plaintext = { subplat-terms-policy }:
subplat-cancel = Cancelar suscripción
subplat-cancel-plaintext = { subplat-cancel }:
subplat-reactivate = Reactivar suscripción
subplat-reactivate-plaintext = { subplat-reactivate }:
subplat-update-billing = Actualizar información de pagos
subplat-privacy-policy = Política de privacidad de { -brand-mozilla }
subplat-privacy-policy-2 = Política de privacidad de { -product-mozilla-accounts(capitalization: "uppercase") }
subplat-privacy-policy-plaintext = { subplat-privacy-policy }:
subplat-privacy-policy-plaintext-2 = { subplat-privacy-policy-2 }:
subplat-moz-terms = Términos del servicio de { -product-mozilla-accounts(capitalization: "uppercase") }
subplat-moz-terms-plaintext = { subplat-moz-terms }:
subplat-legal = Legal
subplat-legal-plaintext = { subplat-legal }:
subplat-privacy = Privacidad
subplat-privacy-website-plaintext = { subplat-privacy }:
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
cancellationSurvey = Por favor, ayúdanos a mejorar nuestros servicios contestando esta <a data-l10n-name="cancellationSurveyUrl">breve encuesta</a>.
# After the colon, there's a link to https://survey.alchemer.com/s3/6534408/Privacy-Security-Product-Cancellation-of-Service-Q4-21
cancellationSurvey-plaintext = Por favor, ayúdanos a mejorar nuestros servicios contestando esta breve encuesta:
change-password-plaintext = Si sospechas que alguien está intentando ganar acceso a tu cuenta, por favor cambia tu contraseña.
manage-account = Administrar cuenta
manage-account-plaintext = { manage-account }:
payment-details = Detalles del pago:
# Variables:
#  $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
payment-plan-invoice-number = Número de factura: { $invoiceNumber }
# Variables:
#  $invoiceDateOnly (String) - The date of the invoice, e.g. 01/20/2016
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
payment-plan-charged = Cobrado: { $invoiceTotal } el { $invoiceDateOnly }
# Variables
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
payment-plan-next-invoice = Próxima facturación: { $nextInvoiceDateOnly }

## $paymentProviderName (String) - The brand name of the payment method, e.g. PayPal, Apple Pay, Google Pay, Link

payment-method-payment-provider = <b>Método de pago:</b> { $paymentProviderName }
payment-method-payment-provider-plaintext = Método de pago: { $paymentProviderName }

## This string displays when the type of credit card is known
## https://stripe.com/docs/payments/cards/supported-card-brands
## Variables:
##  $cardName (String) - The brand name of the credit card, e.g. American Express
##  $lastFour (String) - The last four digits of the credit card, e.g. 5309

payment-provider-card-name-ending-in-plaintext = Método de pago: { $cardName } terminada en { $lastFour }
payment-provider-card-ending-in-plaintext = Método de pago: Tarjeta terminada en { $lastFour }
payment-provider-card-ending-in = <b>Método de pago:</b> Tarjeta terminada en { $lastFour }
payment-provider-card-ending-in-card-name = <b>Método de pago:</b> { $cardName } terminada en { $lastFour }
subscription-charges-invoice-summary = Resumen de la factura

# Variables:


## $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
## $invoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025

subscription-charges-invoice-number = <b>Número de factura</b>: { $invoiceNumber }
subscription-charges-invoice-number-plaintext = Número de factura: { $invoiceNumber }
subscription-charges-invoice-date = <b>Fecha:</b> { $invoiceDateOnly }
subscription-charges-invoice-date-plaintext = Fecha: { $invoiceDateOnly }
subscription-charges-prorated-price = Precio prorrateado
# $remainingAmountTotal (String) - The prorated amount of the subscription invoice, including currency, e.g. $4.00
subscription-charges-prorated-price-plaintext = Precio prorrateado: { $remainingAmountTotal }
subscription-charges-list-price = Precio de lista
# $offeringPrice (String) - The list price of the subscription offering, including currency, e.g. $10.00
subscription-charges-list-price-plaintext = Precio de lista: { $offeringPrice }
subscription-charges-credit-from-unused-time = Crédito por tiempo no utilizado
# $unusedAmountTotal (String) - The credit amount from unused time of the subscription invoice, including currency, e.g. $2.00
subscription-charges-credit-from-unused-time-plaintext = Crédito por tiempo no utilizado: { $unusedAmountTotal }
subscription-charges-subtotal = <b>Subtotal</b>
# $invoiceSubtotal (String) - The amount, before discount, of the subscription invoice, including currency, e.g. $10.00
subscriptionFirstInvoiceDiscount-content-subtotal = Subtotal: { $invoiceSubtotal }

## $invoiceDiscountAmount (String) - The amount of the discount of the subscription invoice, including currency, e.g. $2.00
## $discountDuration - The duration of the discount in number of months, e.g. "3" if the discount is 3-months

subscription-charges-one-time-discount = Descuento de un solo uso
subscription-charges-one-time-discount-plaintext = Descuento de un solo uso: { $invoiceDiscountAmount }
subscription-charges-repeating-discount =
    { $discountDuration ->
        [one] Descuento de { $discountDuration } mes
       *[other] Descuento de { $discountDuration } meses
    }
subscription-charges-repeating-discount-plaintext =
    { $discountDuration ->
        [one] Descuento de { $discountDuration } mes: { $invoiceDiscountAmount }
       *[other] Descuento de { $discountDuration } meses: { $invoiceDiscountAmount }
    }
subscription-charges-discount = Descuento
subscription-charges-discount-plaintext = Descuento: { $invoiceDiscountAmount }
subscription-charges-taxes = Impuestos y cargos
# $invoiceTaxAmount (String) - The amount of the tax of the subscription invoice, including currency, e.g. $2.00
subscriptionCharges-content-tax-plaintext = Impuestos y cargos: { $invoiceTaxAmount }
subscription-charges-total = <b>Total</b>
# $invoiceTotal (String) - The total amount of the subscription invoice, including currency, e.g. $10.00
subscription-charges-total-plaintext = Total: { $invoiceTotal }
subscription-charges-credit-applied = Crédito aplicado
# $creditApplied (String) - The amount of credit applied to the subscription invoice, including currency, e.g. $2.00
subscription-charges-credit-applied-plaintext = Crédito aplicado: { $creditApplied }
subscription-charges-amount-paid = <b>Monto pagado</b>
# $invoiceAmountDue (String) - The total that the customer owes after all credits, discounts, and taxes have been applied, including currency, e.g. $8.00
subscription-charges-amount-paid-plaintext = Monto pagado: { $invoiceAmountDue }
# $creditReceived (String) - The amount, after discount, of the subscription invoice, including currency, e.g. $8.00
subscription-charges-credit-received = Haz recibido un crédito en tu cuenta de { $creditReceived }, que se aplicará a tus futuras facturas.

##

subscriptionSupport = ¿Preguntas acerca de tu suscripción? Nuestro <a data-l10n-name="subscriptionSupportUrl">equipo de soporte</a> está aquí para ayudarte.
# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupport-plaintext = ¿Preguntas sobre tu suscripción? Nuestro equipo de soporte está aquí para ayudarte:
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSupportContact = Gracias por suscribirte a { $productName }. Si tienes alguna pregunta sobre tu suscripción o necesitas más información sobre { $productName }, por favor <a data-l10n-name="subscriptionSupportUrl">contáctanos</a>.
# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupportContact-plaintext = Gracias por suscribirte a { $productName }. Si tienes alguna pregunta sobre tu suscripción o necesitas más información sobre { $productName }, por favor contáctanos:
subscription-support-get-help = Obtén ayuda con tu suscripción
subscription-support-manage-your-subscription = <a data-l10n-name="manageSubscriptionUrl">Administra tu suscripción</a>
# After the colon, there's a link to https://payments.firefox.com/subscriptions
subscription-support-manage-your-subscription-plaintext = Administra tu suscripción:
subscription-support-contact-support = <a data-l10n-name="subscriptionSupportUrl">Contacta con el soporte técnico</a>
# After the colon, there's a link to https://support.mozilla.com/products
subscription-support-contact-support-plaintext = Contactar al soporte
subscriptionUpdateBillingEnsure = Puedes asegurarte de que tu método de pago y la información de tu cuenta están actualizados <a data-l10n-name="updateBillingUrl">aquí</a>.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdateBillingEnsure-plaintext = Puedes asegurarte de que tu método de pago y la información de tu cuenta están actualizados aquí:
subscriptionUpdateBillingTry = Volveremos a intentar tu pago dentro de un par de días, pero podría ser que tenga que ayudarnos a solucionarlo <a data-l10n-name="updateBillingUrl">actualizando tu información de pago</a>.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdateBillingTry-plaintext = Volveremos a intentar tu pago dentro de un par de días, pero podría ser que tenga que ayudarnos a solucionarlo actualizando tu información de pago:
subscriptionUpdatePayment = Para evitar cualquier interrupción en tu servicio,<a data-l10n-name="updateBillingUrl">actualiza tu información de pago</a> lo antes posible.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdatePayment-plaintext = Para evitar cualquier interrupción en tu servicio, actualiza tu información de pago lo antes posible:
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
view-invoice-link-action = Ver factura
# Variables:
#  $invoiceLink (String) - The link to the invoice
# After the colon, there's a link to https://pay.stripe.com/
view-invoice-plaintext = Ver factura: { $invoiceLink }
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
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-subject = Bienvenido a { $productName }.
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-title = Bienvenido a { $productName }.
downloadSubscription-content-2 = Empecemos a usar todas las funciones incluidas en tu suscripción:
downloadSubscription-link-action-2 = Empezar
fraudulentAccountDeletion-subject-2 = Tu { -product-mozilla-account } fue eliminada
fraudulentAccountDeletion-title = Tu cuenta fue eliminada
fraudulentAccountDeletion-content-part1-v2 = Recientemente, usando esta dirección de correo se creó una { -product-mozilla-account } y cursó un cobro de suscripción. Como hacemos con todas las cuentas nuevas, te pedimos que confirmes tu cuenta validando primero esta dirección de correo electrónico.
fraudulentAccountDeletion-content-part2-v2 = Actualmente, vemos que la cuenta nunca fue confirmada. Dado que este paso no se completó, no estamos seguros de si se trataba de una suscripción autorizada. Como resultado, la { -product-mozilla-account } registrada con esta dirección de correo electrónico fue eliminada y tu suscripción cancelada con todos los cargos reembolsados.
fraudulentAccountDeletion-contact = Si tienes preguntas, por favor contacta a nuestro <a data-l10n-name="mozillaSupportUrl">equipo de soporte</a>.
# Variables:
#  $mozillaSupportUrl (String) - Link to https://support.mozilla.org
fraudulentAccountDeletion-contact-plaintext = Si tienes preguntas, por favor contacta a nuestro equipo de soporte: { $mozillaSupportUrl }
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
passwordChanged-subject = Contraseña actualizada
passwordChanged-title = Contraseña cambiada exitosamente
passwordChanged-description-2 = La contraseña de tu { -product-mozilla-account } fue cambiada exitosamente desde el siguiente dispositivo:
passwordChangeRequired-subject = Actividad sospechosa detectada
passwordChangeRequired-preview = Cambia tu contraseña inmediatamente
passwordChangeRequired-title-2 = Restablecer tu contraseña
passwordChangeRequired-suspicious-activity-3 = Bloqueamos tu cuenta para protegerla de actividades sospechosas. Se ha cerrado la sesión de todos tus dispositivos y se han eliminado todos los datos sincronizados como medida de precaución.
passwordChangeRequired-sign-in-3 = Para volver a conectarte a tu cuenta, todo lo que necesitas hacer es restablecer tu contraseña.
passwordChangeRequired-different-password-2 = <b>Importante:</b> Elige una contraseña segura que sea diferente a las que hayas usado en el pasado.
passwordChangeRequired-different-password-plaintext-2 = Importante: Elige una contraseña segura que sea diferente a las que hayas usado en el pasado.
passwordChangeRequired-action = Restablecer contraseña
passwordChangeRequired-action-plaintext = { passwordChangeRequired-action }:
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
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountDeletion-subject = Tu suscripción a { $productName } ha sido cancelada
subscriptionAccountDeletion-title = Lamentamos que te vayas
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $invoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
subscriptionAccountDeletion-content-cancelled-2 = Eliminaste recientemente tu cuenta de { -product-mozilla-account }. Como resultado, hemos cancelado tu suscripción de { $productName }. Tu último pago por { $invoiceTotal } fue realizado el { $invoiceDateOnly }.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountFinishSetup-subject = Te damos la bienvenida a { $productName }: Por favor, establece tu contraseña.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountFinishSetup-title = Bienvenido a { $productName }.
subscriptionAccountFinishSetup-content-processing = Tu pago se está procesando y puede demorar hasta cuatro días hábiles en completarse. Tu suscripción se renovará automáticamente cada período de facturación a menos que elijas cancelar.
subscriptionAccountFinishSetup-content-create-3 = A continuación, crearás una contraseña de { -product-mozilla-account } para comenzar a usar tu nueva suscripción.
subscriptionAccountFinishSetup-action-2 = Empezar
subscriptionAccountReminderFirst-subject = Recordatorio: Termina de configurar tu cuenta
subscriptionAccountReminderFirst-title = Todavía no puedes acceder a tu suscripción
subscriptionAccountReminderFirst-content-info-3 = Hace unos días creaste una { -product-mozilla-account } pero nunca la confirmaste. Esperaremos a que termines de configurar tu cuenta para que puedas usar tu nueva suscripción.
subscriptionAccountReminderFirst-content-select-2 = Selecciona "Crear contraseña" para configurar una nueva contraseña y terminar de confirmar tu cuenta.
subscriptionAccountReminderFirst-action = Crear contraseña
subscriptionAccountReminderFirst-action-plaintext = { subscriptionAccountReminderFirst-action }:
subscriptionAccountReminderSecond-subject = Último recordatorio: Configura tu cuenta
subscriptionAccountReminderSecond-title-2 = ¡Te damos la bienvenida a { -brand-mozilla }!
subscriptionAccountReminderSecond-content-info-3 = Hace unos días creaste una { -product-mozilla-account } pero nunca la confirmaste. Esperaremos a que termines de configurar tu cuenta para que puedas usar tu nueva suscripción.
subscriptionAccountReminderSecond-content-select-2 = Selecciona "Crear contraseña" para configurar una nueva contraseña y terminar de confirmar tu cuenta.
subscriptionAccountReminderSecond-action = Crear contraseña
subscriptionAccountReminderSecond-action-plaintext = { subscriptionAccountReminderSecond-action }:
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionCancellation-subject = Tu suscripción a { $productName } ha sido cancelada
subscriptionCancellation-title = Lamentamos que te vayas

## Variables
##   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
##   $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
##   $invoiceDateOnly (String) - The date of the invoice, e.g. 01/20/2016

subscriptionCancellation-content-2 = Hemos cancelado tu suscripción a { $productName }. Tu pago final de { $invoiceTotal } fue realizado el { $invoiceDateOnly }.
subscriptionCancellation-outstanding-content-2 = Hemos cancelado tu suscripción a { $productName }. Tu pago final de { $invoiceTotal } será realizado el { $invoiceDateOnly }.
# Variables
#   $serviceLastActiveDateOnly (String) - The date of last active service, e.g. 01/20/2016
subscriptionCancellation-content-continue = Tu servicio continuará hasta el final del período de facturación actual, que es hasta el { $serviceLastActiveDateOnly }.
# Variables:
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-subject = Te has cambiado a { $productName }
# Variables:
# $productNameOld (String) - The name of the previously subscribed product, e.g. Mozilla VPN
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-content-switch = Has cambiado exitosamente de { $productNameOld } a { $productName }.
# Variables:
# $paymentAmountOld (String) - The amount of the previous subscription payment, including currency, e.g. $10.00
# $paymentAmountNew (String) - The amount of the new subscription payment, including currency, e.g. $10.00
# $productPaymentCycleNew (String) - The interval of time from the end of one payment statement date to the next payment statement date of the new subscription, e.g. month
# $productPaymentCycleOld (String) - The interval of time from the end of one payment statement date to the next payment statement date of the old subscription, e.g. month
# $paymentProrated (String) - The one time fee to reflect the higher charge for the remainder of the payment cycle, including currency, e.g. $10.00
subscriptionDowngrade-content-charge-info = A partir de tu próxima factura, tu cargo cambiará de { $paymentAmountOld } cada { $productPaymentCycleOld } a { $paymentAmountNew } por { $productPaymentCycleNew }. En ese momento, también se te va a entregar un crédito único de { $paymentProrated } para reflejar el cobro menor producto de la diferencia de este { $productPaymentCycleOld }.
# Variables:
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-content-install = Si hay nuevos programas que tienes que instalar para usar { $productName }, recibirás un correo por separado con instrucciones de descarga.
subscriptionDowngrade-content-auto-renew = Tu suscripción se renovará automáticamente en cada periodo de facturación salvo que elijas cancelarlo.
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFailedPaymentsCancellation-subject = Tu suscripción a { $productName } ha sido cancelada
subscriptionFailedPaymentsCancellation-title = Tu suscripción ha sido cancelada
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFailedPaymentsCancellation-content = Hemos cancelado tu suscripción a { $productName } porque varios intentos de pago fueron fallidos. Para obtener acceso de nuevo, inicia una nueva suscripción con un método de pago actualizado.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-subject = Pago confirmado para { $productName }
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-title = Gracias por suscribirte a { $productName }
subscriptionFirstInvoice-content-processing = Tu pago actualmente está siendo procesado y podría tardar hasta cuatro días hábiles en completarse.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-content-install-2 = Recibirás un correo por separado sobre cómo empezar a usar { $productName }.
subscriptionFirstInvoice-content-auto-renew = Tu suscripción se renovará automáticamente en cada periodo de facturación salvo que elijas cancelarlo.
# Variables:
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025
subscriptionFirstInvoice-content-your-next-invoice = Tu próxima factura se emitirá el { $nextInvoiceDateOnly }.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentExpired-subject-2 = Método de pago para { $productName } vencido o próximo a vencer
subscriptionPaymentExpired-title-2 = Tu método de pago está vencido o próximo a vencer
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentExpired-content-2 = El método de pago que estás utilizando para { $productName } ha vencido o está a próximo a vencer.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-subject = Falló el pago para { $productName }
subscriptionPaymentFailed-title = Lo sentimos, estamos teniendo problemas con tu pago
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-content-problem = Tuvimos un problema con tu pago más reciente para { $productName }.
subscriptionPaymentFailed-content-outdated-1 = Es posible que tu método de pago esté vencido o que tu método de pago actual no esté actualizado.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentProviderCancelled-subject = Se requiere una actualización de la información de pago para { $productName }
subscriptionPaymentProviderCancelled-title = Lo sentimos, estamos teniendo problemas con tu método de pago
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentProviderCancelled-content-detect = Hemos detectado un problema con tu método de pago para { $productName }.
subscriptionPaymentProviderCancelled-content-reason-1 = Es posible que tu método de pago esté vencido o que tu método de pago actual no esté actualizado.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-subject = Suscripción a { $productName } reactivada
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-title = ¡Gracias por reactivar tu suscripción a { $productName }!
# Variables:
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. 2016/01/20
subscriptionReactivation-content = Tu ciclo de facturación y pago seguirá siendo el mismo. Tu próximo cargo será de { $invoiceTotal } el { $nextInvoiceDateOnly }. Tu suscripción se renovará automáticamente en cada período de facturación a menos que elija cancelarla.
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-subject = Aviso de renovación automática de { $productName }
subscriptionRenewalReminder-title = Tu suscripción será renovada pronto
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-greeting = Estimado cliente de { $productName }
# Variables
#   $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#   $planIntervalCount (String) - The interval count of subscription plan, e.g. 2
#   $planInterval (String) - The interval of time of the subscription plan, e.g. week
#   $reminderLength (String) - The number of days until the current subscription is set to automatically renew, e.g. 14
subscriptionRenewalReminder-content-current = Tu suscripción actual está configurada para renovarse automáticamente en { $reminderLength } días. En ese momento, { -brand-mozilla } renovará tu suscripción de { $planIntervalCount } { $planInterval }  y se aplicará un cargo de { $invoiceTotal } al método de pago asociado a tu cuenta.
subscriptionRenewalReminder-content-closing = Atentamente,
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-signature = El equipo de { $productName }
subscriptionReplaced-subject = Tu suscripción se ha actualizado como parte de tu actualización
subscriptionReplaced-title = Tu suscripción ha sido actualizada
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReplaced-content-replaced = Tu suscripción individual de { $productName } ha sido reemplazada y ahora está incluida en tu nuevo paquete.
subscriptionReplaced-content-credit = Recibirás un crédito por el tiempo no utilizado de tu suscripción anterior. Este crédito se aplicará automáticamente a tu cuenta y se utilizará para futuros cargos.
subscriptionReplaced-content-no-action = No se requiere ninguna acción de parte tuya.
subscriptionsPaymentExpired-subject-2 = El método de pago para tus suscripciones está vencido o próximo a vencer
subscriptionsPaymentExpired-title-2 = Tu método de pago está vencido o próximo a vencer
subscriptionsPaymentExpired-content-2 = El método de pago que estás utilizando para realizar pagos para la siguiente suscripción está vencido o próximo a vencer.
subscriptionsPaymentProviderCancelled-subject = Se requiere una actualización de la información de pago para las suscripciones de { -brand-mozilla }
subscriptionsPaymentProviderCancelled-title = Lo sentimos, estamos teniendo problemas con tu método de pago
subscriptionsPaymentProviderCancelled-content-detected = Hemos detectado un problema con tu método de pago para las siguientes suscripciones.
subscriptionsPaymentProviderCancelled-content-payment-1 = Es posible que tu método de pago esté vencido o que tu método de pago actual no esté actualizado.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSubsequentInvoice-subject = Recibido el pago para { $productName }
subscriptionSubsequentInvoice-title = ¡Gracias por suscribirte!
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSubsequentInvoice-content-received = Hemos recibido tu pago más reciente para { $productName }.
# Variables:
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025
subscriptionSubsequentInvoice-content-your-next-invoice = Tu próxima factura se emitirá el { $nextInvoiceDateOnly }.
# Variables:
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionUpgrade-subject = Te has actualizado a { $productName }
subscriptionUpgrade-title = ¡Gracias por la actualización!
# Variables:
# $productNameOld (String) - The name of the previously subscribed product, e.g. Mozilla VPN
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionUpgrade-upgrade-info-2 = Te haz actualizado exitosamente a { $productName }.

## Variables:
## $paymentAmountOld (String) - The amount of the previous subscription payment, including currency, e.g. $10.00
## $paymentAmountNew (String) - The amount of the new subscription payment, including currency, e.g. $10.00
## $paymentTaxOld (String) - The tax amount of the previous subscription payment, including currency, e.g. $1.00
## $paymentTaxNew (String) - The tax amount of the new subscription payment, including currency, e.g. $1.00
## $productPaymentCycleNew (String) - The interval of time from the end of one payment statement date to the next payment statement date of the new subscription, e.g. month
## $productPaymentCycleOld (String) - The interval of time from the end of one payment statement date to the next payment statement date of the old subscription, e.g. month
## $invoiceAmountDue (String) - The total that the customer owes after all credits, discounts, and taxes have been applied
## $paymentProrated (String) - The one time fee to reflect the higher charge for the remainder of the payment cycle, including currency, e.g. $10.00

subscriptionUpgrade-content-charge-prorated-1 = Se te cobró una tarifa única de { $invoiceAmountDue } para reflejar el precio más alto de tu suscripción por el resto de este período de facturación ({ $productPaymentCycleOld }).
subscriptionUpgrade-content-charge-credit = Recibiste un crédito en la cuenta por la cantidad de { $paymentProrated }.
subscriptionUpgrade-content-subscription-next-bill-change = A partir de tu próxima factura, el precio de tu suscripción cambiará.
subscriptionUpgrade-content-old-price-day = La tarifa anterior era de { $paymentAmountOld } por día.
subscriptionUpgrade-content-old-price-week = La tarifa anterior era de { $paymentAmountOld } por semana.
subscriptionUpgrade-content-old-price-month = La tarifa anterior era de { $paymentAmountOld } por mes.
subscriptionUpgrade-content-old-price-halfyear = La tarifa anterior era de { $paymentAmountOld } por semestre.
subscriptionUpgrade-content-old-price-year = La tarifa anterior era de { $paymentAmountOld } por año.
subscriptionUpgrade-content-old-price-default = La tarifa anterior era de { $paymentAmountOld } por intervalo de pago.
subscriptionUpgrade-content-old-price-day-tax = La tasa anterior era de { $paymentAmountOld } + { $paymentTaxOld } de impuestos por día.
subscriptionUpgrade-content-old-price-week-tax = La tasa anterior era de { $paymentAmountOld } + { $paymentTaxOld } de impuestos por semana.
subscriptionUpgrade-content-old-price-month-tax = La tasa anterior era de { $paymentAmountOld } + { $paymentTaxOld } de impuestos por mes.
subscriptionUpgrade-content-old-price-halfyear-tax = La tasa anterior era de { $paymentAmountOld } + { $paymentTaxOld } de impuestos por semestre.
subscriptionUpgrade-content-old-price-year-tax = La tasa anterior era de { $paymentAmountOld } + { $paymentTaxOld } de impuestos por año.
subscriptionUpgrade-content-old-price-default-tax = La tasa anterior era de { $paymentAmountOld } + { $paymentTaxOld } de impuestos por intervalo de pago.
subscriptionUpgrade-content-new-price-day = De ahora en adelante, se te cobrará { $paymentAmountNew } por día, excluyendo descuentos.
subscriptionUpgrade-content-new-price-week = De ahora en adelante, se te cobrará { $paymentAmountNew } por semana, excluyendo descuentos.
subscriptionUpgrade-content-new-price-month = De ahora en adelante, se te cobrará { $paymentAmountNew } por mes, excluyendo descuentos.
subscriptionUpgrade-content-new-price-halfyear = De ahora en adelante, se te cobrará { $paymentAmountNew } por semestre, excluyendo descuentos.
subscriptionUpgrade-content-new-price-year = De ahora en adelante, se te cobrará { $paymentAmountNew } por año, excluyendo descuentos.
subscriptionUpgrade-content-new-price-default = De ahora en adelante, se te cobrará { $paymentAmountNew } por intervalo de pago, excluyendo descuentos.
subscriptionUpgrade-content-new-price-day-dtax = De ahora en adelante, se te cobrará { $paymentAmountNew } + { $paymentTaxNew } de impuestos por día, excluyendo descuentos.
subscriptionUpgrade-content-new-price-week-tax = De ahora en adelante, se te cobrará { $paymentAmountNew } + { $paymentTaxNew } de impuestos por semana, excluyendo descuentos.
subscriptionUpgrade-content-new-price-month-tax = De ahora en adelante, se te cobrará { $paymentAmountNew } + { $paymentTaxNew } de impuestos por mes, excluyendo descuentos.
subscriptionUpgrade-content-new-price-halfyear-tax = De ahora en adelante, se te cobrará { $paymentAmountNew } + { $paymentTaxNew } de impuestos por semestre, excluyendo descuentos.
subscriptionUpgrade-content-new-price-year-tax = De ahora en adelante, se te cobrará { $paymentAmountNew } + { $paymentTaxNew } de impuestos por año, excluyendo descuentos.
subscriptionUpgrade-content-new-price-default-tax = De ahora en adelante, se te cobrará { $paymentAmountNew } + { $paymentTaxNew } de impuestos por periodo de impuesto, excluyendo descuentos.
subscriptionUpgrade-existing = Si alguna de tus suscripciones actuales se superpone con esta actualización, nos encargaremos de ello y te enviaremos un correo electrónico aparte con los detalles. Si tu nuevo plan incluye productos que requieren instalación, te enviaremos un correo electrónico aparte con las instrucciones de configuración.
subscriptionUpgrade-auto-renew = Tu suscripción se renovará automáticamente en cada periodo de facturación salvo que elijas cancelarlo.
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
