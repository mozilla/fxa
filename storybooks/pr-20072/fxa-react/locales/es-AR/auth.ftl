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
cancellationSurvey = Ayudanos a mejorar nuestros servicios realizando esta <a data-l10n-name="cancellationSurveyUrl">breve encuesta</a>.
# After the colon, there's a link to https://survey.alchemer.com/s3/6534408/Privacy-Security-Product-Cancellation-of-Service-Q4-21
cancellationSurvey-plaintext = Ayudanos a mejorar nuestros servicios realizando esta breve encuesta:
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
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountDeletion-subject = Se canceló tu suscripción de { $productName }
subscriptionAccountDeletion-title = Lamentamos que te vayas
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $invoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
subscriptionAccountDeletion-content-cancelled-2 = Recientemente eliminaste tu { -product-mozilla-account }. Como resultado, cancelamos tu suscripción de { $productName }. Tu pago final de { $invoiceTotal } se pagó el { $invoiceDateOnly }.
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
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionEndingReminder-subject = Tu suscripción a { $productName } expirará pronto
subscriptionEndingReminder-title = Tu suscripción a { $productName } expirará pronto
# Variables:
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
#   $serviceLastActiveDateOnly (String) - The date of last active service, e.g. 01/20/2016
subscriptionEndingReminder-content-line1 = Tu acceso a { $productName } terminará el <strong>{ $serviceLastActiveDateOnly }</strong>.
subscriptionEndingReminder-content-line2 = Si querés continuar usando { $productName }, podés reactivar tu suscripción en <a data-l10n-name="subscriptionEndingReminder-account-settings">Configuración de cuenta</a> antes del <strong>{ $serviceLastActiveDateOnly }</strong >. Si necesitás ayuda, <a data-l10n-name="subscriptionEndingReminder-contact-support">contactate con nuestro equipo de soporte</a>.
subscriptionEndingReminder-content-line1-plaintext = Tu acceso a { $productName } terminará el { $serviceLastActiveDateOnly }.
subscriptionEndingReminder-content-line2-plaintext = Si querés continuar usando { $productName }, podés reactivar tu suscripción en Configuración de la cuenta antes del { $serviceLastActiveDateOnly }. Si necesitás ayuda, contactá a nuestro equipo de soporte.
subscriptionEndingReminder-content-closing = ¡Gracias por ser un valioso suscriptor!
subscriptionEndingReminder-churn-title = ¿Querés mantener el acceso?
subscriptionEndingReminder-churn-terms = <a data-l10n-name="subscriptionEndingReminder-churn-terms">Aplican términos y restricciones limitados</a>
# Variables:
#  $churnTermsUrlWithUtm (String) - URL to the terms and restrictions page applied to this promotion
subscriptionEndingReminder-churn-terms-plaintext = Aplican términos y restricciones limitados: { $churnTermsUrlWithUtm }
# Variables:
#  $subscriptionSupportUrlWithUtm (String) - URL to the subscription products support page
subscriptionEndingReminder-content-support-plaintext = Contactá a nuestro equipo de soporte: { $subscriptionSupportUrlWithUtm }
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
#   $reminderLength (String) - The number of days until the current subscription is set to automatically renew, e.g. 14
subscriptionRenewalReminder-content-intro = Tu suscripción actual está configurada para renovarse automáticamente en { $reminderLength } días.
subscriptionRenewalReminder-content-discount-change = Tu próxima factura refleja un cambio en el precio, ya que finalizó un descuento anterior y se aplicó uno nuevo.
subscriptionRenewalReminder-content-discount-ending = Debido a que finalizó un descuento anterior, tu suscripción se renovará al precio estándar.
# Variables
#   $invoiceTotalExcludingTax (String) - The amount of the subscription invoice before tax, including currency, e.g. $10.00
#   $invoiceTax (String) - The tax amount of the subscription invoice, including currency, e.g. $1.29
subscriptionRenewalReminder-content-charge-with-tax-day = En ese momento, { -brand-mozilla } renovará tu suscripción diaria y se aplicará un cargo de { $invoiceTotalExcludingTax } + { $invoiceTax } impuestos al método de pago de tu cuenta.
subscriptionRenewalReminder-content-charge-with-tax-week = En ese momento, { -brand-mozilla } renovará tu suscripción semanal y se aplicará un cargo de { $invoiceTotalExcludingTax } + { $invoiceTax } impuestos al método de pago de tu cuenta.
subscriptionRenewalReminder-content-charge-with-tax-month = En ese momento, { -brand-mozilla } renovará tu suscripción mensual y se aplicará un cargo de { $invoiceTotalExcludingTax } + { $invoiceTax } impuestos al método de pago de tu cuenta.
subscriptionRenewalReminder-content-charge-with-tax-halfyear = En ese momento, { -brand-mozilla } renovará tu suscripción de seis meses y se aplicará un cargo de { $invoiceTotalExcludingTax } + { $invoiceTax } impuestos al método de pago de tu cuenta.
subscriptionRenewalReminder-content-charge-with-tax-year = En ese momento, { -brand-mozilla } renovará tu suscripción anual y se aplicará un cargo de { $invoiceTotalExcludingTax } + { $invoiceTax } impuestos al método de pago de tu cuenta.
subscriptionRenewalReminder-content-charge-with-tax-default = En ese momento, { -brand-mozilla } renovará tu suscripción y se aplicará un cargo de { $invoiceTotalExcludingTax } + { $invoiceTax } impuestos al método de pago en tu cuenta.
# Variables
#   $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
subscriptionRenewalReminder-content-charge-invoice-total-day = En ese momento, { -brand-mozilla } renovará tu suscripción diaria y se aplicará un cargo de { $invoiceTotal } al método de pago en tu cuenta.
subscriptionRenewalReminder-content-charge-invoice-total-week = En ese momento, { -brand-mozilla } renovará tu suscripción semanal y se aplicará un cargo de { $invoiceTotal } al método de pago en tu cuenta.
subscriptionRenewalReminder-content-charge-invoice-total-month = En ese momento, { -brand-mozilla } renovará tu suscripción mensual y se aplicará un cargo de { $invoiceTotal } al método de pago en tu cuenta.
subscriptionRenewalReminder-content-charge-invoice-total-halfyear = En ese momento, { -brand-mozilla } renovará tu suscripción de seis meses y se aplicará un cargo de { $invoiceTotal } al método de pago en tu cuenta.
subscriptionRenewalReminder-content-charge-invoice-total-year = En ese momento, { -brand-mozilla } renovará tu suscripción anual y se aplicará un cargo de { $invoiceTotal } al método de pago en tu cuenta.
subscriptionRenewalReminder-content-charge-invoice-total-default = En ese momento, { -brand-mozilla } renovará tu suscripción y se aplicará un cargo de { $invoiceTotal } al método de pago en tu cuenta.
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
subscriptionsPaymentExpired-subject-2 = El método de pago para tus suscripciones ya venció o vencerá pronto
subscriptionsPaymentExpired-title-2 = Tu método de pago ya venció o está a punto de vencer
subscriptionsPaymentExpired-content-2 = El método de pago que estás usando para realizar los pagos de las siguientes suscripciones ya venció o está a punto de vencer.
subscriptionsPaymentProviderCancelled-subject = Actualización de la información de pago requerida para las suscripciones de { -brand-mozilla }.
subscriptionsPaymentProviderCancelled-title = Lo sentimos, tenemos problemas con el método de pago
subscriptionsPaymentProviderCancelled-content-detected = Detectamos un problema con tu método de pago para las siguientes suscripciones.
subscriptionsPaymentProviderCancelled-content-payment-1 = Es posible que tu método de pago haya vencido o que tu método de pago actual esté desactualizado.
