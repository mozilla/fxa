## Non-email strings

session-verify-send-push-title-2 = ¿Iniciando sesión en tu { -product-mozilla-account }?
session-verify-send-push-body-2 = Haz clic aquí para confirmar que eres tú
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to verify phone ownership when registering a recovery phone
recovery-phone-setup-sms-body = { $code } es tu código de verificación de { -brand-mozilla }. Caduca en 5 minutos.
subplat-header-mozilla-logo-2 = <img data-l10n-name="subplat-mozilla-logo" alt="{ -brand-mozilla } logo">
subplat-footer-mozilla-logo-2 = <img data-l10n-name="mozilla-logo-footer" alt="{ -brand-mozilla } logo">
subplat-automated-email = Este es un correo electrónico automático; si lo recibiste por error, no tienes que hacer nada.
subplat-privacy-notice = Aviso de privacidad
subplat-privacy-plaintext = Aviso de privacidad:
subplat-update-billing-plaintext = { subplat-update-billing }:
# Variables:
#  $email (String) - A user's primary email address
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subplat-explainer-specific-2 = Has recibido este correo electrónico porque { $email } tiene una cuenta de { -product-mozilla-account } y se registró para { $productName }.
# Variables:
#  $email (String) - A user's primary email address
subplat-explainer-reminder-form-2 = Estás recibiendo este correo electrónico porque { $email } tiene una { -product-mozilla-account }.
subplat-explainer-multiple-2 = Estás recibiendo este correo porque { $email } tiene una cuenta de { -product-mozilla-account } y te has registrado para múltiples productos.
subplat-explainer-was-deleted-2 = Estás recibiendo este correo porque { $email } fue registrado para una { -product-mozilla-account }.
subplat-manage-account-2 = Administra los ajustes de tu cuenta de { -product-mozilla-account } visitando tu <a data-l10n-name="subplat-account-page">página de la cuenta</a>.
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
subplat-privacy-policy = Política de Privacidad de { -brand-mozilla }
subplat-privacy-policy-2 = { -product-mozilla-accounts(capitalization: "uppercase") } Política de privacidad
subplat-privacy-policy-plaintext = { subplat-privacy-policy }:
subplat-privacy-policy-plaintext-2 = { subplat-privacy-policy-2 }:
subplat-moz-terms = { -product-mozilla-accounts(capitalization: "uppercase") } Términos del servicio
subplat-moz-terms-plaintext = { subplat-moz-terms }:
subplat-legal = Legal
subplat-legal-plaintext = { subplat-legal }:
subplat-privacy = Privacidad
subplat-privacy-website-plaintext = { subplat-privacy }:
cancellationSurvey = Ayúdanos a mejorar nuestros servicios respondiendo esta <a data-l10n-name="cancellationSurveyUrl">breve encuesta</a>.
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

## $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
## $invoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025

# $invoiceSubtotal (String) - The amount, before discount, of the subscription invoice, including currency, e.g. $10.00
subscriptionFirstInvoiceDiscount-content-subtotal = Subtotal: { $invoiceSubtotal }

## $invoiceDiscountAmount (String) - The amount of the discount of the subscription invoice, including currency, e.g. $2.00
## $discountDuration - The duration of the discount in number of months, e.g. "3" if the discount is 3-months

subscription-charges-credit-applied = Crédito aplicado
# $creditApplied (String) - The amount of credit applied to the subscription invoice, including currency, e.g. $2.00
subscription-charges-credit-applied-plaintext = Crédito aplicado: { $creditApplied }
subscription-charges-amount-paid = <b>Monto pagado</b>

##

subscriptionSupport = ¿Preguntas acerca de tu suscripción? Nuestro <a data-l10n-name="subscriptionSupportUrl">equipo de soporte</a> está aquí para ayudarte.
# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupport-plaintext = ¿Preguntas sobre tu suscripción? Nuestro equipo de asistencia está aquí para ayudarte:
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSupportContact = Gracias por suscribirte a { $productName }. Si tienes alguna pregunta sobre tu suscripción o necesitas más información sobre { $productName }, por favor <a data-l10n-name="subscriptionSupportUrl">contáctanos</a>.
# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupportContact-plaintext = Gracias por suscribirte a { $productName }. Si tienes alguna pregunta sobre tu suscripción o necesitas más información sobre { $productName }, por favor ponte en contacto con nosotros:
# After the colon, there's a link to https://payments.firefox.com/subscriptions
subscription-support-manage-your-subscription-plaintext = Administra tu suscripción:
subscriptionUpdateBillingEnsure = Puedes asegurar que tu método de pago y la información de tu cuenta están al estén actualizados <a data-l10n-name="updateBillingUrl">aquí</a>.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdateBillingEnsure-plaintext = Puedes asegurarte de que tu método de pago y la información de tu cuenta están actualizados aquí:
subscriptionUpdateBillingTry = Intentaremos realizar el pago nuevamente durante los próximos días, pero es posible que debas ayudarnos a solucionarlo <a data-l10n-name="updateBillingUrl">actualizando tu información de pago</a>.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdateBillingTry-plaintext = Intentaremos tu pago de nuevo en los próximos días, pero puede que necesites ayudarnos a solucionarlo actualizando tu información de pago:
subscriptionUpdatePayment = Para evitar cualquier interrupción en tu servicio,<a data-l10n-name="updateBillingUrl">actualiza tu información de pago</a> lo antes posible.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdatePayment-plaintext = Para evitar cualquier interrupción en tu servicio, actualizá tu información de pago lo antes posible:
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
downloadSubscription-content-2 = Comencemos usando todas las características incluidas en tu suscripción:
downloadSubscription-link-action-2 = Comenzar
fraudulentAccountDeletion-subject-2 = Tu cuenta { -product-mozilla-account } fue eliminada
fraudulentAccountDeletion-title = Tu cuenta fue eliminada
fraudulentAccountDeletion-content-part1-v2 = Recientemente, se creó una cuenta { -product-mozilla-account } y se cargó una suscripción utilizando esta dirección de correo electrónico. Como hacemos con todas las cuentas nuevas, te solicitamos que confirmes tu cuenta validando primero esta dirección de correo electrónico.
fraudulentAccountDeletion-content-part2-v2 = Actualmente, vemos que la cuenta nunca fue confirmada. Dado que este paso no se completó, no estamos seguros de si se trataba de una suscripción autorizada. Como resultado, la { -product-mozilla-account } registrada en esta dirección de correo electrónico fue eliminada y tu suscripción fue cancelada con todos los cargos reembolsados.
fraudulentAccountDeletion-contact = Si tienes preguntas, por favor contacta a nuestro <a data-l10n-name="mozillaSupportUrl">equipo de soporte</a>.
# Variables:
#  $mozillaSupportUrl (String) - Link to https://support.mozilla.org
fraudulentAccountDeletion-contact-plaintext = Si tienes preguntas, por favor contacta a nuestro equipo de soporte: { $mozillaSupportUrl }
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountDeletion-subject = Se ha cancelado tu suscripción a { $productName }.
subscriptionAccountDeletion-title = Lamentamos que te vayas
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $invoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
subscriptionAccountDeletion-content-cancelled-2 = Recientemente eliminaste tu { -product-mozilla-account }. Como resultado, cancelamos tu suscripción a { $productName }. Tu ultimo pago de { $invoiceTotal } se realizó el { $invoiceDateOnly }.
subscriptionAccountReminderFirst-subject = Recordatorio: termina de configurar tu cuenta
subscriptionAccountReminderFirst-title = Todavía no puedes acceder a tu suscripción
subscriptionAccountReminderFirst-content-info-3 = Hace unos días creaste una { -product-mozilla-account } pero nunca la confirmaste. Esperaremos a que termines de configurar tu cuenta para que puedas usar tu nueva suscripción.
subscriptionAccountReminderFirst-content-select-2 = Selecciona “Crear contraseña” para establecer una nueva contraseña y terminar de confirmar tu cuenta.
subscriptionAccountReminderFirst-action = Crear contraseña
subscriptionAccountReminderFirst-action-plaintext = { subscriptionAccountReminderFirst-action }:
subscriptionAccountReminderSecond-subject = Último recordatorio: Configura tu cuenta
subscriptionAccountReminderSecond-title-2 = ¡Bienvenido a { -brand-mozilla }!
subscriptionAccountReminderSecond-content-info-3 = Hace unos días creaste una { -product-mozilla-account } pero nunca la confirmaste. Esperaremos a que termines de configurar tu cuenta para que puedas usar tu nueva suscripción.
subscriptionAccountReminderSecond-content-select-2 = Selecciona “Crear contraseña” para establecer una nueva contraseña y terminar de confirmar tu cuenta.
subscriptionAccountReminderSecond-action = Crear contraseña
subscriptionAccountReminderSecond-action-plaintext = { subscriptionAccountReminderSecond-action }:
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionCancellation-subject = Se ha cancelado tu suscripción a { $productName }
subscriptionCancellation-title = Lamentamos que te vayas

## Variables
##   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
##   $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
##   $invoiceDateOnly (String) - The date of the invoice, e.g. 01/20/2016

subscriptionCancellation-content-2 = Hemos cancelado tu suscripción a { $productName }. Tu ultimo pago de { $invoiceTotal } se pagó el { $invoiceDateOnly }.
subscriptionCancellation-outstanding-content-2 = Hemos cancelado tu suscripción a { $productName }. Tu ultimo pago de { $invoiceTotal } se pagó el { $invoiceDateOnly }.
# Variables
#   $serviceLastActiveDateOnly (String) - The date of last active service, e.g. 01/20/2016
subscriptionCancellation-content-continue = Tu servicio continuará hasta el final de su período de facturación actual, que es el { $serviceLastActiveDateOnly }
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
subscriptionDowngrade-content-charge-info = A partir de tu próxima factura, tu cargo cambiará de { $paymentAmountOld } por { $productPaymentCycleOld } a { $paymentAmountNew } por { $productPaymentCycleNew }. En ese momento, también se te dará un crédito único de { $paymentProrated } para reflejar el cargo más bajo para el resto de este { $productPaymentCycleOld }.
# Variables:
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-content-install = Si hay un nuevo software que debes instalar para usar { $productName }, recibirás un correo electrónico por separado con instrucciones de descarga.
subscriptionDowngrade-content-auto-renew = Tu suscripción se renovará automáticamente en cada periodo de facturación a menos que quieras cancelar.
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFailedPaymentsCancellation-subject = Se ha cancelado tu suscripción a { $productName }
subscriptionFailedPaymentsCancellation-title = Se ha cancelado tu suscripción
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFailedPaymentsCancellation-content = Hemos cancelado tu suscripción a  { $productName } porque han fallado varios intentos de pago. Para obtener acceso de nuevo, inicia una nueva suscripción con un método de pago actualizado.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-subject = Pago confirmado para { $productName }
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-title = Gracias por suscribirte a { $productName }
subscriptionFirstInvoice-content-processing = Tu pago está siendo procesado y podría tardar hasta cuatro días hábiles en completarse.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-content-install-2 = Recibirás un correo aparte sobre cómo empezar a usar { $productName }
subscriptionFirstInvoice-content-auto-renew = Tu suscripción se renovará automáticamente cada período de facturación a menos que quieras cancelar.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-subject = Error en el pago de { $productName }
subscriptionPaymentFailed-title = Lo sentimos, estamos teniendo problemas con tu pago
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-content-problem = Tuvimos un problema con tu último pago para { $productName }.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentProviderCancelled-subject = Se requiere actualizar la información de pago para { $productName }
subscriptionPaymentProviderCancelled-title = Lo sentimos, tenemos problemas con tu método de pago.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentProviderCancelled-content-detect = Hemos detectado un problema con tu método de pago para { $productName }.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-subject = Suscripción a { $productName } reactivada
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-title = ¡Gracias por reactivar tu suscripción a { $productName }!
# Variables:
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. 2016/01/20
subscriptionReactivation-content = Tu ciclo de facturación y pago seguirá siendo el mismo. Tu próximo cargo será de { $invoiceTotal } el { $nextInvoiceDateOnly }. Tu suscripción se renovará automáticamente en cada período de facturación a menos que decidas cancelarla.
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-subject = Aviso de renovación automática de { $productName }
subscriptionRenewalReminder-title = Tu suscripción será renovada pronto
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-greeting = Estimado cliente de { $productName },
subscriptionRenewalReminder-content-closing = Atentamente,
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-signature = El equipo de { $productName }
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSubsequentInvoice-subject = Se recibió el pago de { $productName }
subscriptionSubsequentInvoice-title = ¡Gracias por suscribirte!
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSubsequentInvoice-content-received = Recibimos tu último pago para { $productName }.
# Variables:
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionUpgrade-subject = Has actualizado a { $productName }.
subscriptionUpgrade-title = ¡Gracias por la actualización!

## Variables:
## $paymentAmountOld (String) - The amount of the previous subscription payment, including currency, e.g. $10.00
## $paymentAmountNew (String) - The amount of the new subscription payment, including currency, e.g. $10.00
## $paymentTaxOld (String) - The tax amount of the previous subscription payment, including currency, e.g. $1.00
## $paymentTaxNew (String) - The tax amount of the new subscription payment, including currency, e.g. $1.00
## $productPaymentCycleNew (String) - The interval of time from the end of one payment statement date to the next payment statement date of the new subscription, e.g. month
## $productPaymentCycleOld (String) - The interval of time from the end of one payment statement date to the next payment statement date of the old subscription, e.g. month
## $invoiceAmountDue (String) - The total that the customer owes after all credits, discounts, and taxes have been applied
## $paymentProrated (String) - The one time fee to reflect the higher charge for the remainder of the payment cycle, including currency, e.g. $10.00

subscriptionUpgrade-auto-renew = Tu suscripción se renovará automáticamente en cada periodo de facturación a menos que quieras cancelar.
subscriptionsPaymentProviderCancelled-subject = Se requiere actualizar la información de pago para las suscripciones de { -brand-mozilla }
subscriptionsPaymentProviderCancelled-title = Lo sentimos, estamos teniendo problemas con tu método de pago
subscriptionsPaymentProviderCancelled-content-detected = Hemos detectado un problema con tu método de pago para las siguientes suscripciones.
