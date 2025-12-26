## Non-email strings

session-verify-send-push-title-2 = ¿Iniciando sesión en tu { -product-mozilla-account }?
session-verify-send-push-body-2 = Clic acá para confirmar que sos vos.
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to verify phone ownership when registering a recovery phone
recovery-phone-setup-sms-body = { $code } es tu código de verificación de { -brand-mozilla }. Caduca en 5 minutos.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to verify phone ownership when registering a recovery phone
recovery-phone-setup-sms-short-body = Código de verificación de { -brand-mozilla }: { $code }
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for two-step authentication
recovery-phone-signin-sms-body = { $code } es tu código de recuperación de { -brand-mozilla }. Caduca en 5 minutos.
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

fxa-header-mozilla-logo = <img data-l10n-name="mozilla-logo" alt="Logo de { -brand-mozilla }">
fxa-header-sync-devices-image = <img data-l10n-name="sync-devices-image" alt="Dispositivos en Sync">
body-devices-image = <img data-l10n-name="devices-image" alt="Dispositivos">
fxa-privacy-url = Política de privacidad de { -brand-mozilla }
moz-accounts-privacy-url-2 = Nota de privacidad de { -product-mozilla-accounts(capitalization: "uppercase") }
moz-accounts-terms-url = Términos de servicio de la { -product-mozilla-accounts(capitalization: "uppercase") }
subplat-header-mozilla-logo-2 = <img data-l10n-name="subplat-mozilla-logo" alt="Logo de { -brand-mozilla }">
subplat-footer-mozilla-logo-2 = <img data-l10n-name="mozilla-logo-footer" alt="Logo de { -brand-mozilla }">
subplat-automated-email = Este es un correo electrónico automático; si lo recibiste por error, no debes hacer nada.
subplat-privacy-notice = Nota de privacidad
subplat-privacy-plaintext = Aviso de privacidad:
subplat-update-billing-plaintext = { subplat-update-billing }:
# Variables:
#  $email (String) - A user's primary email address
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subplat-explainer-specific-2 = Recibiste este correo electrónico porque { $email } tiene una { -product-mozilla-account } y te registraste para { $productName }.
# Variables:
#  $email (String) - A user's primary email address
subplat-explainer-reminder-form-2 = Estás recibiendo este correo electrónico porque { $email } tiene una { -product-mozilla-account }.
subplat-explainer-multiple-2 = Estás recibiendo este correo electrónico porque { $email } tiene una { -product-mozilla-account } y te registraste para múltiples productos.
subplat-explainer-was-deleted-2 = Estás recibiendo este correo electrónico porque { $email } fue registrado para una { -product-mozilla-account }.
subplat-manage-account-2 = Administrá los ajustes de tu cuenta de { -product-mozilla-account } visitando la <a data-l10n-name="subplat-account-page">página de la cuenta</a>.
# Variables:
#  $accountSettingsUrl (String) - URL to Account Settings
subplat-manage-account-plaintext-2 = Administrá la configuración de tu { -product-mozilla-account } visitando la página de la cuenta: { $accountSettingsUrl }
subplat-terms-policy = Términos y política de cancelación
subplat-terms-policy-plaintext = { subplat-terms-policy }:
subplat-cancel = Cancelar suscripción
subplat-cancel-plaintext = { subplat-cancel }:
subplat-reactivate = Reactivar suscripción
subplat-reactivate-plaintext = { subplat-reactivate }:
subplat-update-billing = Actualizar información de facturación
subplat-privacy-policy = Política de privacidad de { -brand-mozilla }
subplat-privacy-policy-2 = Nota de privacidad de { -product-mozilla-accounts(capitalization: "uppercase") }
subplat-privacy-policy-plaintext = { subplat-privacy-policy }:
subplat-privacy-policy-plaintext-2 = { subplat-privacy-policy-2 }:
subplat-moz-terms = Términos de servicio de la { -product-mozilla-accounts(capitalization: "uppercase") }
subplat-moz-terms-plaintext = { subplat-moz-terms }:
subplat-legal = Legal
subplat-legal-plaintext = { subplat-legal }:
subplat-privacy = Privacidad
subplat-privacy-website-plaintext = { subplat-privacy }:
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
brand-banner-message = ¿Sabías que cambiamos nuestro nombre de { -product-firefox-accounts } a { -product-mozilla-accounts }? <a data-l10n-name="learnMore">Conocer más</a>
cancellationSurvey = Ayudanos a mejorar nuestros servicios realizando esta <a data-l10n-name="cancellationSurveyUrl">breve encuesta</a>.
# After the colon, there's a link to https://survey.alchemer.com/s3/6534408/Privacy-Security-Product-Cancellation-of-Service-Q4-21
cancellationSurvey-plaintext = Ayudanos a mejorar nuestros servicios realizando esta breve encuesta:
change-password-plaintext = Si creés que alguien está intentando acceder a tu cuenta, por favor cambiá la contraseña.
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
payment-plan-next-invoice = Próxima factura: { $nextInvoiceDateOnly }

## $paymentProviderName (String) - The brand name of the payment method, e.g. PayPal, Apple Pay, Google Pay, Link

payment-method-payment-provider = <b>Método de pago:</b> { $paymentProviderName }
payment-method-payment-provider-plaintext = Método de pago: { $paymentProviderName }

## This string displays when the type of credit card is known
## https://stripe.com/docs/payments/cards/supported-card-brands
## Variables:
##  $cardName (String) - The brand name of the credit card, e.g. American Express
##  $lastFour (String) - The last four digits of the credit card, e.g. 5309

payment-provider-card-name-ending-in-plaintext = Método de pago: { $cardName } que termina en { $lastFour }
payment-provider-card-ending-in-plaintext = Método de pago: Tarjeta que termina en { $lastFour }
payment-provider-card-ending-in = <b>Método de pago:</b> Tarjeta que termina en { $lastFour }
payment-provider-card-ending-in-card-name = <b>Método de pago:</b> { $cardName } que termina en { $lastFour }
subscription-charges-invoice-summary = Resumen de factura

# Variables:


## $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
## $invoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025

subscription-charges-invoice-number = <b>Número de factura:</b> { $invoiceNumber }
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

subscription-charges-one-time-discount = Descuento por única vez
subscription-charges-one-time-discount-plaintext = Descuento por única vez: { $invoiceDiscountAmount }
subscription-charges-repeating-discount =
    { $discountDuration ->
        [one] { $discountDuration } mes de descuento
       *[other] { $discountDuration } meses de descuento
    }
subscription-charges-repeating-discount-plaintext =
    { $discountDuration ->
        [one] Descuento de { $discountDuration } mes: { $invoiceDiscountAmount }
       *[other] Descuento de { $discountDuration } meses: { $invoiceDiscountAmount }
    }
subscription-charges-discount = Descuento
subscription-charges-discount-plaintext = Descuento: { $invoiceDiscountAmount }
subscription-charges-taxes = Impuestos y tasas
# $invoiceTaxAmount (String) - The amount of the tax of the subscription invoice, including currency, e.g. $2.00
subscriptionCharges-content-tax-plaintext = Impuestos y tasas: { $invoiceTaxAmount }
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
subscription-charges-credit-received = Recibiste un crédito en cuenta de { $creditReceived }, que se aplicará a tus facturas futuras.

##

subscriptionSupport = ¿Tenés preguntas acerca de tu suscripción? Nuestro <a data-l10n-name="subscriptionSupportUrl">equipo de ayuda</a> está aquí para ayudarte.
# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupport-plaintext = ¿Preguntas acerca de la suscripción? Nuestro equipo de soporte está acá para ayudarte:
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSupportContact = Gracias por suscribirte a { $productName }. Si tenés alguna pregunta sobre la suscripción o necesitás más información sobre { $productName }, <a data-l10n-name="subscriptionSupportUrl">contactanos</a>.
# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupportContact-plaintext = Gracias por suscribirte a { $productName }. Si tenés alguna pregunta sobre la suscripción o necesitás más información sobre { $productName }, contactanos:
subscription-support-get-help = Obtené ayuda con tu suscripción
subscription-support-manage-your-subscription = <a data-l10n-name="manageSubscriptionUrl">Administrar tu suscripción</a>
# After the colon, there's a link to https://payments.firefox.com/subscriptions
subscription-support-manage-your-subscription-plaintext = Administrar tu suscripción:
subscription-support-contact-support = <a data-l10n-name="subscriptionSupportUrl">Contactar soporte</a>
# After the colon, there's a link to https://support.mozilla.com/products
subscription-support-contact-support-plaintext = Contactar soporte:
subscriptionUpdateBillingEnsure = Asegurate que tu método de pago e información de cuenta están actualizados <a data-l10n-name="updateBillingUrl">aquí</a>.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdateBillingEnsure-plaintext = Podés asegurarte que tu método de pago e información de cuenta están actualizados aquí:
subscriptionUpdateBillingTry = Intentaremos realizar el pago nuevamente en los próximos días, pero es posible que debás ayudarnos a solucionarlo <a data-l10n-name="updateBillingUrl">actualizando tu información de pago</a>.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdateBillingTry-plaintext = Intentaremos realizar el pago nuevamente durante los próximos días, pero es posible que deba ayudarnos a solucionarlo actualizando su información de pago:
subscriptionUpdatePayment = Para evitar cualquier interrupción de tu servicio,<a data-l10n-name="updateBillingUrl">actualizá tu información de pago</a> lo antes posible.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdatePayment-plaintext = Para evitar cualquier interrupción en tu servicio, actualizá tu información de pago lo antes posible:
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
view-invoice-link-action = Ver factura
# Variables:
#  $invoiceLink (String) - The link to the invoice
# After the colon, there's a link to https://pay.stripe.com/
view-invoice-plaintext = Ver factura: { $invoiceLink }
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
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-subject = Bienvenido a { $productName }
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-title = Bienvenido a { $productName }
downloadSubscription-content-2 = Empecemos a usar todas las funcionalidades incluídas en tu suscripción:
downloadSubscription-link-action-2 = Primeros pasos
fraudulentAccountDeletion-subject-2 = Se eliminó tu { -product-mozilla-account }
fraudulentAccountDeletion-title = Tu cuenta fue eliminada
fraudulentAccountDeletion-content-part1-v2 = Recientemente, se creó una { -product-mozilla-account } y se cobró una suscripción con esta dirección de correo electrónico. Como hacemos con todas las cuentas nuevas, pedimos que confirmés tu cuenta validando primero esta dirección de correo electrónico.
fraudulentAccountDeletion-content-part2-v2 = En la actualidad, vemos que la cuenta nunca fue confirmada. Dado que este paso no se completó, no estamos seguros si se trataba de una suscripción autorizada. Como resultado, la { -product-mozilla-account } registrada en esta dirección de correo electrónico se eliminó y la suscripción se canceló con todos los cargos reembolsados.
fraudulentAccountDeletion-contact = Si tenés alguna pregunta, contactá a nuestro <a data-l10n-name="mozillaSupportUrl">equipo de soporte</a>.
# Variables:
#  $mozillaSupportUrl (String) - Link to https://support.mozilla.org
fraudulentAccountDeletion-contact-plaintext = Si tenés alguna pregunta, contactá a nuestro equipo de soporte: { $mozillaSupportUrl }
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
passwordChanged-subject = Contraseña actualizada
passwordChanged-title = Contraseña cambiada exitosamente
passwordChanged-description-2 = Tu contraseña de { -product-mozilla-account } se cambió correctamente desde el siguiente dispositivo:
passwordChangeRequired-subject = Actividad sospechosa detectada
passwordChangeRequired-preview = Cambiá tu contraseña inmediatamente
passwordChangeRequired-title-2 = Restablecé tu contraseña
passwordChangeRequired-suspicious-activity-3 = Bloqueamos tu cuenta para mantenerla a salvo de actividad sospechosa. Se cerró la sesión en todos tus dispositivos y todos los datos sincronizados se eliminaron como precaución.
passwordChangeRequired-sign-in-3 = Para volver a iniciar sesión en tu cuenta, todo lo que tenés que hacer es restablecer tu contraseña.
passwordChangeRequired-different-password-2 = <b>Importante:</b> Elegí una contraseña segura que sea diferente a la que usaste en el pasado.
passwordChangeRequired-different-password-plaintext-2 = Importante: Elegí una contraseña segura que sea diferente a la que usaste en el pasado.
passwordChangeRequired-action = Restablecer contraseña
passwordChangeRequired-action-plaintext = { passwordChangeRequired-action }:
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
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountDeletion-subject = Se canceló tu suscripción de { $productName }
subscriptionAccountDeletion-title = Lamentamos que te vayas
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $invoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
subscriptionAccountDeletion-content-cancelled-2 = Recientemente eliminaste tu { -product-mozilla-account }. Como resultado, cancelamos tu suscripción de { $productName }. Tu pago final de { $invoiceTotal } se pagó el { $invoiceDateOnly }.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountFinishSetup-subject = Bienvenido a { $productName }: Configurá tu contraseña.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountFinishSetup-title = Bienvenido a { $productName }
subscriptionAccountFinishSetup-content-processing = El pago se está procesando y puede tomar hasta cuatro días hábiles en completarse. La suscripción se renovará automáticamente cada período de facturación a menos que elijás cancelar.
subscriptionAccountFinishSetup-content-create-3 = A continuación, tenés que crear una contraseña de { -product-mozilla-account } para comenzar a usar tu nueva suscripción.
subscriptionAccountFinishSetup-action-2 = Empecemos
subscriptionAccountReminderFirst-subject = Recordatorio: terminá de configurar tu cuenta
subscriptionAccountReminderFirst-title = Todavía no podés acceder a tu suscripción
subscriptionAccountReminderFirst-content-info-3 = Hace unos días creaste una { -product-mozilla-account } pero nunca la confirmaste. Esperamos que terminés de configurar tu cuenta así podés usar tu nueva suscripción.
subscriptionAccountReminderFirst-content-select-2 = Seleccioná “Crear contraseña” para establecer una nueva contraseña y terminar de confirmar tu cuenta.
subscriptionAccountReminderFirst-action = Crear contraseña
subscriptionAccountReminderFirst-action-plaintext = { subscriptionAccountReminderFirst-action }:
subscriptionAccountReminderSecond-subject = Recordatorio final: configurá tu cuenta
subscriptionAccountReminderSecond-title-2 = ¡Bienvenido a { -brand-mozilla }!
subscriptionAccountReminderSecond-content-info-3 = Hace unos días creaste una { -product-mozilla-account } pero nunca la confirmaste. Esperamos que terminés de configurar tu cuenta así podés usar tu nueva suscripción.
subscriptionAccountReminderSecond-content-select-2 = Seleccioná “Crear contraseña” para establecer una nueva contraseña y terminar de confirmar tu cuenta.
subscriptionAccountReminderSecond-action = Crear contraseña
subscriptionAccountReminderSecond-action-plaintext = { subscriptionAccountReminderSecond-action }:
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionCancellation-subject = Se canceló tu suscripción de { $productName }
subscriptionCancellation-title = Lamentamos que te vayas

## Variables
##   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
##   $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
##   $invoiceDateOnly (String) - The date of the invoice, e.g. 01/20/2016

subscriptionCancellation-content-2 = Cancelamos tu suscripción a { $productName }. Tu pago final de { $invoiceTotal } fue pagado el { $invoiceDateOnly }.
subscriptionCancellation-outstanding-content-2 = Cancelamos tu suscripción a { $productName }. Tu pago final de { $invoiceTotal } será pagado el { $invoiceDateOnly }.
# Variables
#   $serviceLastActiveDateOnly (String) - The date of last active service, e.g. 01/20/2016
subscriptionCancellation-content-continue = El servicio continuará hasta el fin del periodo actual facturación, que es { $serviceLastActiveDateOnly }.
# Variables:
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-subject = Cambiaste a { $productName }
# Variables:
# $productNameOld (String) - The name of the previously subscribed product, e.g. Mozilla VPN
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-content-switch = Cambiaste correctamente de { $productNameOld } a { $productName }.
# Variables:
# $paymentAmountOld (String) - The amount of the previous subscription payment, including currency, e.g. $10.00
# $paymentAmountNew (String) - The amount of the new subscription payment, including currency, e.g. $10.00
# $productPaymentCycleNew (String) - The interval of time from the end of one payment statement date to the next payment statement date of the new subscription, e.g. month
# $productPaymentCycleOld (String) - The interval of time from the end of one payment statement date to the next payment statement date of the old subscription, e.g. month
# $paymentProrated (String) - The one time fee to reflect the higher charge for the remainder of the payment cycle, including currency, e.g. $10.00
subscriptionDowngrade-content-charge-info = A partir de tu próxima factura, tu cargo cambiará de { $paymentAmountOld } por { $productPaymentCycleOld } a { $paymentAmountNew } por { $productPaymentCycleNew }. En ese momento, también se te va a otorgar un crédito único de { $paymentProrated } para reflejar el cargo más bajo por el resto de este { $productPaymentCycleOld }.
# Variables:
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-content-install = Si hay que instalar un programa nuevo  para utilizar { $productName }, vas a recibir un correo electrónico por separado con instrucciones para la descarga.
subscriptionDowngrade-content-auto-renew = Tu suscripción se renovará automáticamente cada período de facturación a menos que elijas cancelar.
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFailedPaymentsCancellation-subject = Se canceló tu suscripción de { $productName }
subscriptionFailedPaymentsCancellation-title = Se canceló tu suscripción
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFailedPaymentsCancellation-content = Cancelamos tu suscripción a { $productName } porque fallaron varios intentos de pago. Para obtener acceso de nuevo, iniciá una nueva suscripción con un método de pago actualizado.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-subject = Pago de { $productName } confirmado
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-title = Gracias por suscribirte a { $productName }
subscriptionFirstInvoice-content-processing = Tu pago se está procesando en este momento y puede demorar hasta cuatro días hábiles en completarse.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-content-install-2 = Recibirás un correo electrónico por separado sobre cómo empezar a usar { $productName }.
subscriptionFirstInvoice-content-auto-renew = Tu suscripción se renovará automáticamente cada período de facturación a menos que elijas cancelar.
# Variables:
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025
subscriptionFirstInvoice-content-your-next-invoice = La próxima factura se emitirá el { $nextInvoiceDateOnly }.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentExpired-subject-2 = El método de pago para { $productName } venció o vencerá pronto
subscriptionPaymentExpired-title-2 = Tu método de pago ya venció o está a punto de vencer
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentExpired-content-2 = El método de pago que estás usando para { $productName } ya venció o está a punto de vencer.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-subject = Error en el pago de { $productName }
subscriptionPaymentFailed-title = Disculpá, tenemos problemas con tu pago.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-content-problem = Tuvimos un problema con tu último pago de { $productName }.
subscriptionPaymentFailed-content-outdated-1 = Es posible que tu método de pago haya vencido o que tu método de pago actual esté desactualizado.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentProviderCancelled-subject = Actualización de la información de pago requerida para { $productName }
subscriptionPaymentProviderCancelled-title = Lo sentimos, tenemos problemas con el método de pago
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentProviderCancelled-content-detect = Detectamos un problema con tu método de pago para { $productName }.
subscriptionPaymentProviderCancelled-content-reason-1 = Es posible que tu método de pago haya vencido o que tu método de pago actual esté desactualizado.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-subject = Se reactivó la suscripción a { $productName }
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-title = ¡Gracias por reactivar tu suscripción a { $productName }!
# Variables:
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. 2016/01/20
subscriptionReactivation-content = Tu ciclo de facturación y pago seguirá siendo el mismo. Tu próximo cargo será de { $invoiceTotal } el { $nextInvoiceDateOnly }. Tu suscripción se renovará automáticamente en cada período de facturación a menos que elijas cancelarla.
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-subject = Nota de renovación automática de { $productName }
subscriptionRenewalReminder-title = La suscripción será renovada pronto
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-greeting = Estimado cliente de { $productName }:
# Variables
#   $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#   $planIntervalCount (String) - The interval count of subscription plan, e.g. 2
#   $planInterval (String) - The interval of time of the subscription plan, e.g. week
#   $reminderLength (String) - The number of days until the current subscription is set to automatically renew, e.g. 14
subscriptionRenewalReminder-content-current = La suscripción actual está configurada para renovarse automáticamente en { $reminderLength } días. En ese momento, { -brand-mozilla } renovará la suscripción de { $planIntervalCount } { $planInterval } y se aplicará un cargo de { $invoiceTotal } al método de pago en tu cuenta.
subscriptionRenewalReminder-content-closing = Atentamente,
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-signature = El equipo de { $productName }
subscriptionReplaced-subject = Tu suscripción se actualizó como parte de tu actualización
subscriptionReplaced-title = Tu suscripción ha sido actualizada
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReplaced-content-replaced = Tu suscripción individual de { $productName } fue reemplazada y ahora está incluida en tu nuevo paquete.
subscriptionReplaced-content-credit = Recibirás un crédito por el tiempo no utilizado de tu suscripción anterior. Este crédito se aplicará automáticamente a tu cuenta y se usará para cargos futuros.
subscriptionReplaced-content-no-action = No se requiere ninguna acción de tu parte.
subscriptionsPaymentExpired-subject-2 = El método de pago para tus suscripciones ya venció o vencerá pronto
subscriptionsPaymentExpired-title-2 = Tu método de pago ya venció o está a punto de vencer
subscriptionsPaymentExpired-content-2 = El método de pago que estás usando para realizar los pagos de las siguientes suscripciones ya venció o está a punto de vencer.
subscriptionsPaymentProviderCancelled-subject = Actualización de la información de pago requerida para las suscripciones de { -brand-mozilla }.
subscriptionsPaymentProviderCancelled-title = Lo sentimos, tenemos problemas con el método de pago
subscriptionsPaymentProviderCancelled-content-detected = Detectamos un problema con tu método de pago para las siguientes suscripciones.
subscriptionsPaymentProviderCancelled-content-payment-1 = Es posible que tu método de pago haya vencido o que tu método de pago actual esté desactualizado.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSubsequentInvoice-subject = Pago recibido de { $productName }
subscriptionSubsequentInvoice-title = ¡Gracias por suscribirte!
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSubsequentInvoice-content-received = Recibimos tu último pago por { $productName }.
# Variables:
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025
subscriptionSubsequentInvoice-content-your-next-invoice = La próxima factura se emitirá el { $nextInvoiceDateOnly }.
# Variables:
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionUpgrade-subject = Actualizaste a { $productName }
subscriptionUpgrade-title = ¡Gracias por actualizar!
# Variables:
# $productNameOld (String) - The name of the previously subscribed product, e.g. Mozilla VPN
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionUpgrade-upgrade-info-2 = Se actualizó exitosamente a { $productName }.

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
subscriptionUpgrade-content-charge-credit = Recibiste un crédito en cuenta por la cantidad de { $paymentProrated }.
subscriptionUpgrade-content-subscription-next-bill-change = A partir de tu próxima factura, el precio de tu suscripción cambiará.
subscriptionUpgrade-content-old-price-day = La tarifa anterior era de { $paymentAmountOld } por día.
subscriptionUpgrade-content-old-price-week = La tarifa anterior era de { $paymentAmountOld } por semana.
subscriptionUpgrade-content-old-price-month = La tarifa anterior era de { $paymentAmountOld } al mes.
subscriptionUpgrade-content-old-price-halfyear = La tarifa anterior era de { $paymentAmountOld } por semestre.
subscriptionUpgrade-content-old-price-year = La tarifa anterior era de { $paymentAmountOld } por año.
subscriptionUpgrade-content-old-price-default = La tarifa anterior era de { $paymentAmountOld } por intervalo de facturación.
subscriptionUpgrade-content-old-price-day-tax = La tarifa anterior era de { $paymentAmountOld } + { $paymentTaxOld } de impuestos por día.
subscriptionUpgrade-content-old-price-week-tax = La tarifa anterior era de { $paymentAmountOld } + { $paymentTaxOld } de impuestos por semana.
subscriptionUpgrade-content-old-price-month-tax = La tarifa anterior era de { $paymentAmountOld } + { $paymentTaxOld } de impuestos al mes.
subscriptionUpgrade-content-old-price-halfyear-tax = La tarifa anterior era de { $paymentAmountOld } + { $paymentTaxOld } de impuestos semestrales.
subscriptionUpgrade-content-old-price-year-tax = La tarifa anterior era de { $paymentAmountOld } + { $paymentTaxOld } de impuestos por año.
subscriptionUpgrade-content-old-price-default-tax = La tarifa anterior era de { $paymentAmountOld } + { $paymentTaxOld } de impuestos por intervalo de facturación.
subscriptionUpgrade-content-new-price-day = De ahora en adelante, se cobrarán { $paymentAmountNew } por día, sin incluir descuentos.
subscriptionUpgrade-content-new-price-week = De ahora en adelante, se cobrarán { $paymentAmountNew } por semana, sin incluir descuentos.
subscriptionUpgrade-content-new-price-month = De ahora en adelante, se cobrarán { $paymentAmountNew } por mes, sin incluir descuentos.
subscriptionUpgrade-content-new-price-halfyear = De ahora en adelante, se cobrarán { $paymentAmountNew } cada seis meses, sin incluir descuentos.
subscriptionUpgrade-content-new-price-year = De ahora en adelante, se cobrarán { $paymentAmountNew } por año, sin incluir descuentos.
subscriptionUpgrade-content-new-price-default = De ahora en adelante, se cobrarán { $paymentAmountNew } por intervalo de facturación, sin incluir descuentos.
subscriptionUpgrade-content-new-price-day-dtax = De ahora en adelante, se cobrarán { $paymentAmountNew } + { $paymentTaxNew } de impuestos por día, sin incluir descuentos.
subscriptionUpgrade-content-new-price-week-tax = De ahora en adelante, se cobrarán { $paymentAmountNew } + { $paymentTaxNew } de impuestos por semana, sin incluir descuentos.
subscriptionUpgrade-content-new-price-month-tax = De ahora en adelante, se cobrarán { $paymentAmountNew } + { $paymentTaxNew } de impuestos por mes, sin incluir descuentos.
subscriptionUpgrade-content-new-price-halfyear-tax = De ahora en adelante, se cobrarán { $paymentAmountNew } + { $paymentTaxNew } de impuestos cada seis meses, sin incluir descuentos.
subscriptionUpgrade-content-new-price-year-tax = De ahora en adelante, se cobrarán { $paymentAmountNew } + { $paymentTaxNew } de impuestos por año, sin incluir descuentos.
subscriptionUpgrade-content-new-price-default-tax = De ahora en adelante, se cobrarán { $paymentAmountNew } + { $paymentTaxNew } de impuestos por intervalo de facturación, sin incluir descuentos.
subscriptionUpgrade-existing = Si alguna de las suscripciones existentes se superpone con esta actualización, lo manejaremos y enviaremos un correo electrónico por separado con los detalles. Si el nuevo plan incluye productos que requieren instalación, enviaremos un correo electrónico por separado con instrucciones de configuración.
subscriptionUpgrade-auto-renew = Tu suscripción se renovará automáticamente cada período de facturación a menos que elijas cancelar.
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
