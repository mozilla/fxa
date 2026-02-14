## Non-email strings

session-verify-send-push-title-2 = ¿Iniciando sesión en tu { -product-mozilla-account }?
session-verify-send-push-body-2 = Haz clic aquí para confirmar que eres tú
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
recovery-phone-reset-password-sms-body = { $code } es tu código de recuperación de { -brand-mozilla }. Caduca en 5 minutos.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for account password reset
recovery-phone-reset-password-short-body = Código de { -brand-mozilla }: { $code }
subplat-header-mozilla-logo-2 = <img data-l10n-name="subplat-mozilla-logo" alt="Logo { -brand-mozilla }">
subplat-footer-mozilla-logo-2 = <img data-l10n-name="mozilla-logo-footer" alt="Logo de { -brand-mozilla }">
subplat-automated-email = Éste es un correo automático; si lo recibiste por error, no tienes que hacer nada.
subplat-privacy-notice = Aviso de privacidad
subplat-privacy-plaintext = Aviso de privacidad:
subplat-update-billing-plaintext = { subplat-update-billing }:
# Variables:
#  $email (String) - A user's primary email address
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subplat-explainer-specific-2 = Has recibido este correo electrónico porque { $email } tiene una cuenta de { -product-mozilla-account } y se registró para { $productName }.
# Variables:
#  $email (String) - A user's primary email address
subplat-explainer-reminder-form-2 = Estás recibiendo este correo porque { $email } tiene una { -product-mozilla-account }.
subplat-explainer-multiple-2 = Has recibido este correo electrónico porque { $email } tiene una cuenta de { -product-mozilla-account } y te has suscrito a múltiples productos.
subplat-explainer-was-deleted-2 = Has recibido este correo electrónico porque { $email } se registró para una { -product-mozilla-account }.
subplat-manage-account-2 = Administra los ajustes de tu { -product-mozilla-account } visitando tu <a data-l10n-name="subplat-account-page">página de la cuenta</a>.
# Variables:
#  $accountSettingsUrl (String) - URL to Account Settings
subplat-manage-account-plaintext-2 = Administra la configuración de tu { -product-mozilla-account } visitando la página de la cuenta: { $accountSettingsUrl }
subplat-terms-policy = Términos y política de cancelación
subplat-terms-policy-plaintext = { subplat-terms-policy }:
subplat-cancel = Cancelar suscripción
subplat-cancel-plaintext = { subplat-cancel }:
subplat-reactivate = Reactivar suscripción
subplat-reactivate-plaintext = { subplat-reactivate }:
subplat-update-billing = Actualizar información de facturación
subplat-privacy-policy = Política de privacidad de { -brand-mozilla }
subplat-privacy-policy-2 = Aviso de privacidad de { -product-mozilla-accounts(capitalization: "uppercase") }
subplat-privacy-policy-plaintext = { subplat-privacy-policy }:
subplat-privacy-policy-plaintext-2 = { subplat-privacy-policy-2 }:
subplat-moz-terms = Términos de servicio de { -product-mozilla-accounts(capitalization: "uppercase") }
subplat-moz-terms-plaintext = { subplat-moz-terms }:
subplat-legal = Nota legal
subplat-legal-plaintext = { subplat-legal }:
subplat-privacy = Privacidad
subplat-privacy-website-plaintext = { subplat-privacy }:
cancellationSurvey = Por favor, ayúdanos a mejorar nuestros servicios contestando esta <a data-l10n-name="cancellationSurveyUrl">breve encuesta</a>.
# After the colon, there's a link to https://survey.alchemer.com/s3/6534408/Privacy-Security-Product-Cancellation-of-Service-Q4-21
cancellationSurvey-plaintext = Por favor, ayúdanos a mejorar nuestros servicios contestando esta breve encuesta:
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
subscription-charges-invoice-summary = Resumen de la factura

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

subscription-charges-one-time-discount = Descuento de un solo uso
subscription-charges-one-time-discount-plaintext = Descuento de un solo uso: { $invoiceDiscountAmount }
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
subscription-charges-taxes = Impuestos y cargos
# $invoiceTaxAmount (String) - The amount of the tax of the subscription invoice, including currency, e.g. $2.00
subscriptionCharges-content-tax-plaintext = Impuestos y cargos: { $invoiceTaxAmount }
subscription-charges-total = <b>Total</b>
# $invoiceTotal (String) - The total amount of the subscription invoice, including currency, e.g. $10.00
subscription-charges-total-plaintext = Total: { $invoiceTotal }
subscription-charges-credit-applied = Crédito aplicado
# $creditApplied (String) - The amount of credit applied to the subscription invoice, including currency, e.g. $2.00
subscription-charges-credit-applied-plaintext = Crédito aplicado: { $creditApplied }
subscription-charges-amount-paid = <b>Importe pagado</b>
# $invoiceAmountDue (String) - The total that the customer owes after all credits, discounts, and taxes have been applied, including currency, e.g. $8.00
subscription-charges-amount-paid-plaintext = Importe pagado: { $invoiceAmountDue }
# $creditReceived (String) - The amount, after discount, of the subscription invoice, including currency, e.g. $8.00
subscription-charges-credit-received = Has recibido un crédito en tu cuenta de { $creditReceived }, que se aplicará a tus facturas futuras.

##

subscriptionSupport = ¿Preguntas sobre tu suscripción? Nuestro <a data-l10n-name="subscriptionSupportUrl">equipo de asistencia</a> está aquí para ayudarte.
# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupport-plaintext = ¿Preguntas sobre tu suscripción? Nuestro equipo de asistencia está aquí para ayudarte:
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSupportContact = Gracias por suscribirte a { $productName }. Si tienes alguna pregunta sobre tu suscripción o necesitas más información sobre { $productName }, por favor <a data-l10n-name="subscriptionSupportUrl">ponte en contacto con nosotros</a>.
# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupportContact-plaintext = Gracias por suscribirte a { $productName }. Si tienes alguna pregunta sobre tu suscripción o necesitas más información sobre { $productName }, por favor ponte en contacto con nosotros:
subscription-support-get-help = Obtén ayuda con tu suscripción
subscription-support-manage-your-subscription = <a data-l10n-name="manageSubscriptionUrl">Administra tu suscripción</a>
# After the colon, there's a link to https://payments.firefox.com/subscriptions
subscription-support-manage-your-subscription-plaintext = Administra tu suscripción:
subscription-support-contact-support = <a data-l10n-name="subscriptionSupportUrl">Contacta con el soporte técnico</a>
# After the colon, there's a link to https://support.mozilla.com/products
subscription-support-contact-support-plaintext = Contactar con la asistencia:
subscriptionUpdateBillingEnsure = Puedes asegurarte de que tu método de pago y la información de tu cuenta están actualizados <a data-l10n-name="updateBillingUrl">aquí</a>.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdateBillingEnsure-plaintext = Puedes asegurarte de que tu método de pago y la información de tu cuenta están actualizados aquí:
subscriptionUpdateBillingTry = Volveremos a intentar tu pago de nuevo en los próximos días, pero puede que tengas que ayudarnos a solucionarlo <a data-l10n-name="updateBillingUrl">actualizando tu información de pago</a>.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdateBillingTry-plaintext = Probaremos tu pago de nuevo en los próximos días, pero puede que necesites ayudarnos a solucionarlo actualizando tu información de pago:
subscriptionUpdatePayment = Para evitar cualquier interrupción en tu servicio, por favor <a data-l10n-name="updateBillingUrl">actualiza tu información de pago</a> lo antes posible.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdatePayment-plaintext = Para evitar cualquier interrupción en tu servicio, por favor actualiza tu información de pago lo antes posible:
view-invoice-link-action = Ver factura
# Variables:
#  $invoiceLink (String) - The link to the invoice
# After the colon, there's a link to https://pay.stripe.com/
view-invoice-plaintext = Ver factura: { $invoiceLink }
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-subject = Bienvenido a { $productName }
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-title = Bienvenido a { $productName }
downloadSubscription-content-2 = Comienza a usar todas las funciones incluidas en tu suscripción:
downloadSubscription-link-action-2 = Comenzar
fraudulentAccountDeletion-subject-2 = Tu { -product-mozilla-account } fue eliminada
fraudulentAccountDeletion-title = Tu cuenta fue eliminada
fraudulentAccountDeletion-content-part1-v2 = Recientemente, se creó una { -product-mozilla-account } y se cobró una suscripción con esta dirección de correo electrónico. Como hacemos con todas las cuentas nuevas, te pedimos que confirmes tu cuenta validando primero esta dirección de correo electrónico.
fraudulentAccountDeletion-content-part2-v2 = Actualmente, vemos que la cuenta nunca fue confirmada. Dado que este paso no se completó, no estamos seguros de si se trataba de una suscripción autorizada. Como resultado, la { -product-mozilla-account } registrada con esta dirección de correo electrónico fue eliminada y tu suscripción cancelada con todos los cargos reembolsados.
fraudulentAccountDeletion-contact = Si tienes alguna pregunta, por favor contacta con nuestro <a data-l10n-name="mozillaSupportUrl">equipo de soporte</a>.
# Variables:
#  $mozillaSupportUrl (String) - Link to https://support.mozilla.org
fraudulentAccountDeletion-contact-plaintext = Si tienes alguna pregunta, por favor contacta con nuestro equipo de soporte: { $mozillaSupportUrl }
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountDeletion-subject = Tu suscripción a { $productName } ha sido cancelada
subscriptionAccountDeletion-title = Lamentamos que te vayas
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $invoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
subscriptionAccountDeletion-content-cancelled-2 = Has eliminado recientemente tu { -product-mozilla-account }. Como resultado, hemos cancelado tu suscripción a { $productName }. Tu último pago por { $invoiceTotal } fue realizado el { $invoiceDateOnly }.
subscriptionAccountReminderFirst-subject = Recordatorio: termina de configurar tu cuenta
subscriptionAccountReminderFirst-title = Todavía no puedes acceder a tu suscripción
subscriptionAccountReminderFirst-content-info-3 = Hace unos días creaste una { -product-mozilla-account } pero nunca la confirmaste. Esperamos que termines de configurar tu cuenta para que puedas usar tu nueva suscripción.
subscriptionAccountReminderFirst-content-select-2 = Selecciona “Crear contraseña” para configurar una nueva contraseña y terminar de confirmar tu cuenta.
subscriptionAccountReminderFirst-action = Crear contraseña
subscriptionAccountReminderFirst-action-plaintext = { subscriptionAccountReminderFirst-action }:
subscriptionAccountReminderSecond-subject = Último recordatorio: configura tu cuenta
subscriptionAccountReminderSecond-title-2 = ¡Te damos la bienvenida a { -brand-mozilla }!
subscriptionAccountReminderSecond-content-info-3 = Hace unos días creaste una { -product-mozilla-account } pero nunca la confirmaste. Esperamos que termines de configurar tu cuenta para que puedas usar tu nueva suscripción.
subscriptionAccountReminderSecond-content-select-2 = Selecciona “Crear contraseña” para configurar una nueva contraseña y terminar de confirmar tu cuenta.
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
subscriptionDowngrade-subject = Has cambiado a { $productName }
# Variables:
# $productNameOld (String) - The name of the previously subscribed product, e.g. Mozilla VPN
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-content-switch = Has cambiado correctamente de { $productNameOld } a { $productName }.
# Variables:
# $paymentAmountOld (String) - The amount of the previous subscription payment, including currency, e.g. $10.00
# $paymentAmountNew (String) - The amount of the new subscription payment, including currency, e.g. $10.00
# $productPaymentCycleNew (String) - The interval of time from the end of one payment statement date to the next payment statement date of the new subscription, e.g. month
# $productPaymentCycleOld (String) - The interval of time from the end of one payment statement date to the next payment statement date of the old subscription, e.g. month
# $paymentProrated (String) - The one time fee to reflect the higher charge for the remainder of the payment cycle, including currency, e.g. $10.00
subscriptionDowngrade-content-charge-info = A partir de tu próxima factura, tu cargo cambiará de { $paymentAmountOld } por { $productPaymentCycleOld } a { $paymentAmountNew } por { $productPaymentCycleNew }. En ese momento, también se te va a otorgar un crédito único de { $paymentProrated } para reflejar el cargo más bajo por el resto de este { $productPaymentCycleOld }.
# Variables:
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-content-install = Si hay que instalar un programa nuevo para utilizar { $productName }, recibirás un correo electrónico por separado con instrucciones para la descarga.
subscriptionDowngrade-content-auto-renew = Tu suscripción se renovará automáticamente en cada periodo de facturación salvo que elijas cancelarlo.
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionEndingReminder-subject = Tu suscripción a { $productName } expirará pronto
subscriptionEndingReminder-title = Tu suscripción a { $productName } expirará pronto
# Variables:
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
#   $serviceLastActiveDateOnly (String) - The date of last active service, e.g. 01/20/2016
subscriptionEndingReminder-content-line1 = Tu acceso a { $productName } finalizará el <strong>{ $serviceLastActiveDateOnly }</strong>.
subscriptionEndingReminder-content-line2 = Si quieres seguir usando { $productName }, puedes reactivar tu suscripción en <a data-l10n-name="subscriptionEndingReminder-account-settings">Ajustes de la cuenta</a> antes del <strong>{ $serviceLastActiveDateOnly }</strong>. Si necesitas ayuda, <a data-l10n-name="subscriptionEndingReminder-contact-support">contacta con nuestro equipo de asistencia</a>.
subscriptionEndingReminder-content-line1-plaintext = Tu acceso a { $productName } finalizará el { $serviceLastActiveDateOnly }.
subscriptionEndingReminder-content-line2-plaintext = Si quieres seguir usando { $productName }, puedes reactivar tu suscripción en la configuración de la cuenta antes del { $serviceLastActiveDateOnly }. Si necesitas ayuda, contacta con nuestro equipo de asistencia.
subscriptionEndingReminder-content-closing = ¡Gracias por ser un valioso suscriptor!
subscriptionEndingReminder-churn-title = ¿Quieres mantener el acceso?
subscriptionEndingReminder-churn-terms = <a data-l10n-name="subscriptionEndingReminder-churn-terms">Se aplican términos y restricciones limitados</a>
# Variables:
#  $churnTermsUrlWithUtm (String) - URL to the terms and restrictions page applied to this promotion
subscriptionEndingReminder-churn-terms-plaintext = Se aplican términos y restricciones limitados: { $churnTermsUrlWithUtm }
# Variables:
#  $subscriptionSupportUrlWithUtm (String) - URL to the subscription products support page
subscriptionEndingReminder-content-support-plaintext = Contacta a nuestro equipo de asistencia: { $subscriptionSupportUrlWithUtm }
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFailedPaymentsCancellation-subject = Tu suscripción a { $productName } ha sido cancelada
subscriptionFailedPaymentsCancellation-title = Se ha cancelado tu suscripción
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFailedPaymentsCancellation-content = Hemos cancelado tu suscripción a { $productName } porque han fallado varios intentos de pago. Para obtener acceso de nuevo, inicia una nueva suscripción con un método de pago actualizado.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-subject = Pago confirmado para { $productName }
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-title = Gracias por suscribirte a { $productName }
subscriptionFirstInvoice-content-processing = Tu pago está siendo procesado y podría tardar hasta cuatro días hábiles en completarse.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-content-install-2 = Recibirás un correo electrónico por separado sobre cómo comenzar a usar { $productName }.
subscriptionFirstInvoice-content-auto-renew = Tu suscripción se renovará automáticamente cada periodo de facturación salvo que elijas cancelarla.
# Variables:
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025
subscriptionFirstInvoice-content-your-next-invoice = Tu próxima factura se emitirá el { $nextInvoiceDateOnly }.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentExpired-subject-2 = El método de pago para { $productName } ha caducado o caducará pronto
subscriptionPaymentExpired-title-2 = Tu método de pago ha caducado o está a punto de caducar
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentExpired-content-2 = El método de pago que estás usando para { $productName } ha caducado o está a punto de caducar.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-subject = Ha fallado el pago de { $productName }
subscriptionPaymentFailed-title = Lo sentimos, estamos teniendo problemas con tu pago
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-content-problem = Hemos tenido un problema con tu último pago de { $productName }.
subscriptionPaymentFailed-content-outdated-1 = Es posible que tu método de pago haya caducado o que tu método de pago actual no esté actualizado.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentProviderCancelled-subject = Se requiere actualizar la información de pago para { $productName }
subscriptionPaymentProviderCancelled-title = Lo sentimos, estamos teniendo problemas con tu método de pago
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentProviderCancelled-content-detect = Hemos tenido un problema con tu método de pago para { $productName }.
subscriptionPaymentProviderCancelled-content-reason-1 = Es posible que tu método de pago haya caducado o que tu método de pago actual no esté actualizado.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-subject = Suscripción a { $productName } reactivada
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-title = ¡Gracias por reactivar tu suscripción a { $productName }!
# Variables:
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. 2016/01/20
subscriptionReactivation-content = Tu ciclo de facturación y pago seguirá siendo el mismo. Tu próximo cargo será de { $invoiceTotal } el { $nextInvoiceDateOnly }. Tu suscripción se renovará automáticamente en cada período de facturación a menos que elijas cancelarla.
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-subject = Aviso de renovación automática de { $productName }
subscriptionRenewalReminder-title = Tu suscripción se renovará pronto
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-greeting = Estimado cliente de { $productName },
# Variables
#   $reminderLength (String) - The number of days until the current subscription is set to automatically renew, e.g. 14
subscriptionRenewalReminder-content-intro = Tu suscripción actual está configurada para renovarse automáticamente en { $reminderLength } días.
subscriptionRenewalReminder-content-discount-change = Tu próxima factura refleja un cambio en el precio, ya que ha finalizado un descuento anterior y se ha aplicado un nuevo descuento.
subscriptionRenewalReminder-content-discount-ending = Debido a que ha finalizado un descuento anterior, tu suscripción se renovará al precio estándar.
# Variables
#   $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#   $planIntervalCount (String) - The interval count of subscription plan, e.g. 2
#   $planInterval (String) - The interval of time of the subscription plan, e.g. week
# Tells the customer that their subscription price will change at the end of the current billing cycle
subscriptionRenewalReminder-content-charge = En ese momento, { -brand-mozilla } renovará tu suscripción de { $planIntervalCount } { $planInterval } y se aplicará un cargo de { $invoiceTotal } al método de pago de tu cuenta.
subscriptionRenewalReminder-content-closing = Atentamente,
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-signature = El equipo de { $productName }
subscriptionReplaced-subject = Tu suscripción se ha actualizado como parte de tu actualización
subscriptionReplaced-title = Tu suscripción ha sido actualizada
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReplaced-content-replaced = Tu suscripción individual de { $productName } fue reemplazada y ahora está incluida en tu nuevo paquete.
subscriptionReplaced-content-credit = Recibirás un crédito por el tiempo no utilizado de tu suscripción anterior. Este crédito se aplicará automáticamente a tu cuenta y se usará para cargos futuros.
subscriptionReplaced-content-no-action = No se requiere ninguna acción de tu parte.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSubsequentInvoice-subject = Pago recibido para { $productName }
subscriptionSubsequentInvoice-title = ¡Gracias por suscribirte!
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSubsequentInvoice-content-received = Hemos recibido tu último pago por { $productName }.
# Variables:
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionUpgrade-subject = Te has actualizado a { $productName }
subscriptionUpgrade-title = ¡Gracias por la actualización!
# Variables:
# $productNameOld (String) - The name of the previously subscribed product, e.g. Mozilla VPN
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionUpgrade-upgrade-info-2 = La actualización a { $productName } se ha realizado con éxito.

## Variables:
## $paymentAmountOld (String) - The amount of the previous subscription payment, including currency, e.g. $10.00
## $paymentAmountNew (String) - The amount of the new subscription payment, including currency, e.g. $10.00
## $paymentTaxOld (String) - The tax amount of the previous subscription payment, including currency, e.g. $1.00
## $paymentTaxNew (String) - The tax amount of the new subscription payment, including currency, e.g. $1.00
## $productPaymentCycleNew (String) - The interval of time from the end of one payment statement date to the next payment statement date of the new subscription, e.g. month
## $productPaymentCycleOld (String) - The interval of time from the end of one payment statement date to the next payment statement date of the old subscription, e.g. month
## $invoiceAmountDue (String) - The total that the customer owes after all credits, discounts, and taxes have been applied
## $paymentProrated (String) - The one time fee to reflect the higher charge for the remainder of the payment cycle, including currency, e.g. $10.00

subscriptionUpgrade-content-charge-prorated-1 = Se te ha cobrado una tarifa única de { $invoiceAmountDue } para reflejar el precio más alto de tu suscripción por el resto de este período de facturación ({ $productPaymentCycleOld }).
subscriptionUpgrade-content-charge-credit = Recibiste un crédito en la cuenta por la cantidad de { $paymentProrated }.
subscriptionUpgrade-content-subscription-next-bill-change = A partir de tu próxima factura, el precio de tu suscripción cambiará.
subscriptionUpgrade-content-old-price-day = La tarifa anterior era de { $paymentAmountOld } por día.
subscriptionUpgrade-content-old-price-week = La tarifa anterior era de { $paymentAmountOld } por semana.
subscriptionUpgrade-content-old-price-month = La tarifa anterior era de { $paymentAmountOld } por mes.
subscriptionUpgrade-content-old-price-halfyear = La tarifa anterior era de { $paymentAmountOld } por semestre.
subscriptionUpgrade-content-old-price-year = La tarifa anterior era de { $paymentAmountOld } por año.
subscriptionUpgrade-content-old-price-default = La tarifa anterior era de { $paymentAmountOld } por intervalo de pago.
subscriptionUpgrade-content-old-price-day-tax = La tarifa anterior era de { $paymentAmountOld } + { $paymentTaxOld } de impuestos por día.
subscriptionUpgrade-content-old-price-week-tax = La tarifa anterior era de { $paymentAmountOld } + { $paymentTaxOld } de impuestos por semana.
subscriptionUpgrade-content-old-price-month-tax = La tarifa anterior era de { $paymentAmountOld } + { $paymentTaxOld } de impuestos por mes.
subscriptionUpgrade-content-old-price-halfyear-tax = La tarifa anterior era de { $paymentAmountOld } + { $paymentTaxOld } de impuestos por semestre.
subscriptionUpgrade-content-old-price-year-tax = La tarifa anterior era de { $paymentAmountOld } + { $paymentTaxOld } de impuestos por año.
subscriptionUpgrade-content-old-price-default-tax = La tarifa anterior era de { $paymentAmountOld } + { $paymentTaxOld } de impuestos por intervalo de facturación.
subscriptionUpgrade-content-new-price-day = De ahora en adelante, se cobrarán { $paymentAmountNew } por día, sin incluir descuentos.
subscriptionUpgrade-content-new-price-week = De ahora en adelante, se cobrarán { $paymentAmountNew } por semana, sin incluir descuentos.
subscriptionUpgrade-existing = Si alguna de tus suscripciones actuales se solapa con esta actualización, nos encargaremos de ello y te enviaremos un correo electrónico separado con los detalles. Si tu nuevo plan incluye productos que requieren instalación, te enviaremos un correo electrónico separado con las instrucciones de configuración.
subscriptionUpgrade-auto-renew = Tu suscripción se renovará automáticamente en cada periodo de facturación salvo que elijas cancelarlo.
subscriptionsPaymentExpired-subject-2 = El método de pago para tus suscripciones está caducado o próximo a caducar
subscriptionsPaymentExpired-title-2 = Tu método de pago ha caducado o está a punto de caducar
subscriptionsPaymentExpired-content-2 = El método de pago que estás utilizando para realizar pagos para la siguiente suscripción ha caducado o está a punto de caducar.
subscriptionsPaymentProviderCancelled-subject = Se requiere actualizar la información de pago para las suscripciones de { -brand-mozilla }
subscriptionsPaymentProviderCancelled-title = Lo sentimos, estamos teniendo problemas con tu método de pago
subscriptionsPaymentProviderCancelled-content-detected = Hemos detectado un problema con tu método de pago para las siguientes suscripciones.
subscriptionsPaymentProviderCancelled-content-payment-1 = Es posible que tu método de pago haya caducado o que tu método de pago actual no esté actualizado.
