## Non-email strings

session-verify-send-push-title-2 = Accesso a tu { -product-mozilla-account }?
session-verify-send-push-body-2 = Clicca hic pro confirmar que es tu
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to verify phone ownership when registering a recovery phone
recovery-phone-setup-sms-body = { $code } es tu codice de verification de { -brand-mozilla }. Illo expira in 5 minutas.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to verify phone ownership when registering a recovery phone
recovery-phone-setup-sms-short-body = Codice de verification de { -brand-mozilla }: { $code }
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for two-step authentication
recovery-phone-signin-sms-body = { $code } es tu codice de recuperation de { -brand-mozilla }. Illo expira in 5 minutas.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for two-step authentication
recovery-phone-signin-sms-short-body = { -brand-mozilla } codice: { $code }
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for account password reset
recovery-phone-reset-password-sms-body = { $code } es tu codice de recuperation de { -brand-mozilla }. Illo expira in 5 minutas.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for account password reset
recovery-phone-reset-password-short-body = { -brand-mozilla } codice: { $code }
subplat-header-mozilla-logo-2 = <img data-l10n-name="subplat-mozilla-logo" alt="Logo { -brand-mozilla }">
subplat-footer-mozilla-logo-2 = <img data-l10n-name="mozilla-logo-footer" alt="Logo { -brand-mozilla }">
subplat-automated-email = Iste message ha essite inviate automaticamente. Si tu lo ha recipite in error, nulle action es necessari.
subplat-privacy-notice = Aviso de confidentialitate
subplat-privacy-plaintext = Aviso de confidentialitate:
subplat-update-billing-plaintext = { subplat-update-billing }:
# Variables:
#  $email (String) - A user's primary email address
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subplat-explainer-specific-2 = Tu recipe iste e-mail perque { $email } tu ha un { -product-mozilla-account } e tu te inscribeva a { $productName }.
# Variables:
#  $email (String) - A user's primary email address
subplat-explainer-reminder-form-2 = Tu recipe iste e-mail perque { $email } ha un { -product-mozilla-account }.
subplat-explainer-multiple-2 = Tu recipe iste e-mail perque { $email } ha un { -product-mozilla-account } e tu es abonate a plure productos.
subplat-explainer-was-deleted-2 = Tu recipe iste email perque { $email } es registrate pro un { -product-mozilla-account }.
subplat-manage-account-2 = Gere tu parametros del { -product-mozilla-account } visitante tu <a data-l10n-name="subplat-account-page">pagina de conto</a>.
# Variables:
#  $accountSettingsUrl (String) - URL to Account Settings
subplat-manage-account-plaintext-2 = Gere tu parametros de { -product-mozilla-account } visitante le pagina de tu conto: { $accountSettingsUrl }
subplat-terms-policy = Terminos e politica de cancellation
subplat-terms-policy-plaintext = { subplat-terms-policy }:
subplat-cancel = Cancellar subscription
subplat-cancel-plaintext = { subplat-cancel }:
subplat-reactivate = Reactivar subscription
subplat-reactivate-plaintext = { subplat-reactivate }:
subplat-update-billing = Actualisar le informationes de factura
subplat-privacy-policy = Politica de confidentialitate de { -brand-mozilla }
subplat-privacy-policy-2 = Aviso re le confidentialitate de { -product-mozilla-accounts(capitalization: "uppercase") }
subplat-privacy-policy-plaintext = { subplat-privacy-policy }:
subplat-privacy-policy-plaintext-2 = { subplat-privacy-policy-2 }:
subplat-moz-terms = Conditiones de uso del servicio de { -product-mozilla-accounts(capitalization: "lowercase") }
subplat-moz-terms-plaintext = { subplat-moz-terms }:
subplat-legal = Legal
subplat-legal-plaintext = { subplat-legal }:
subplat-privacy = Confidentialitate
subplat-privacy-website-plaintext = { subplat-privacy }:
cancellationSurvey = Per favor adjuta nos a meliorar nostre servicios redigente iste <a data-l10n-name="cancellationSurveyUrl">breve questionario</a>.
# After the colon, there's a link to https://survey.alchemer.com/s3/6534408/Privacy-Security-Product-Cancellation-of-Service-Q4-21
cancellationSurvey-plaintext = Per favor adjuta nos a meliorar nostre servicios redigente iste breve questionario:
payment-details = Detalios del pagamento:
# Variables:
#  $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
payment-plan-invoice-number = Numero de factura : { $invoiceNumber }
# Variables:
#  $invoiceDateOnly (String) - The date of the invoice, e.g. 01/20/2016
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
payment-plan-charged = { $invoiceTotal } facturate le { $invoiceDateOnly }
# Variables
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
payment-plan-next-invoice = Proxime factura: { $nextInvoiceDateOnly }

## $paymentProviderName (String) - The brand name of the payment method, e.g. PayPal, Apple Pay, Google Pay, Link

payment-method-payment-provider = <b>Methodo de pagamento:</b> { $paymentProviderName }
payment-method-payment-provider-plaintext = Methodo de pagamento: { $paymentProviderName }

## This string displays when the type of credit card is known
## https://stripe.com/docs/payments/cards/supported-card-brands
## Variables:
##  $cardName (String) - The brand name of the credit card, e.g. American Express
##  $lastFour (String) - The last four digits of the credit card, e.g. 5309

payment-provider-card-name-ending-in-plaintext = Methodo de pagamento: { $cardName } finiente in { $lastFour }
payment-provider-card-ending-in-plaintext = Methodo de pagamento: carta finiente per { $lastFour }
payment-provider-card-ending-in = <b>Methodo de pagamento:</b> carta finiente per  { $lastFour }
payment-provider-card-ending-in-card-name = <b>Methodo de pagamento:</b> { $cardName } carta finiente per { $lastFour }
subscription-charges-invoice-summary = Summario del factura

# Variables:


## $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
## $invoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025

subscription-charges-invoice-number = <b>Numero de factura:</b> { $invoiceNumber }
subscription-charges-invoice-number-plaintext = Numero de factura: { $invoiceNumber }
subscription-charges-invoice-date = <b>Data:</b> { $invoiceDateOnly }
subscription-charges-invoice-date-plaintext = Data: { $invoiceDateOnly }
subscription-charges-prorated-price = Precio dividite pro rata
# $remainingAmountTotal (String) - The prorated amount of the subscription invoice, including currency, e.g. $4.00
subscription-charges-prorated-price-plaintext = Precio dividite pro rata: { $remainingAmountTotal }
subscription-charges-list-price = Precio de lista
# $offeringPrice (String) - The list price of the subscription offering, including currency, e.g. $10.00
subscription-charges-list-price-plaintext = Precio de lista: { $offeringPrice }
subscription-charges-credit-from-unused-time = Credito de tempore inutilisate
# $unusedAmountTotal (String) - The credit amount from unused time of the subscription invoice, including currency, e.g. $2.00
subscription-charges-credit-from-unused-time-plaintext = Credito ab tempore non usate: { $unusedAmountTotal }
subscription-charges-subtotal = <b>Subtotal</b>
# $invoiceSubtotal (String) - The amount, before discount, of the subscription invoice, including currency, e.g. $10.00
subscriptionFirstInvoiceDiscount-content-subtotal = Subtotal: { $invoiceSubtotal }

## $invoiceDiscountAmount (String) - The amount of the discount of the subscription invoice, including currency, e.g. $2.00
## $discountDuration - The duration of the discount in number of months, e.g. "3" if the discount is 3-months

subscription-charges-one-time-discount = Disconto una tantum
subscription-charges-one-time-discount-plaintext = Disconto una tantum: { $invoiceDiscountAmount }
subscription-charges-repeating-discount =
    { $discountDuration ->
        [one] Disconto de { $discountDuration }-mense
       *[other] Disconto de { $discountDuration }-menses
    }
subscription-charges-repeating-discount-plaintext =
    { $discountDuration ->
        [one] Disconto de { $discountDuration }-mense: { $invoiceDiscountAmount }
       *[other] Disconto de { $discountDuration }-menses: { $invoiceDiscountAmount }
    }
subscription-charges-discount = Disconto
subscription-charges-discount-plaintext = Disconto: { $invoiceDiscountAmount }
subscription-charges-taxes = Taxas e oneres
# $invoiceTaxAmount (String) - The amount of the tax of the subscription invoice, including currency, e.g. $2.00
subscriptionCharges-content-tax-plaintext = Taxas e oneres: { $invoiceTaxAmount }
subscription-charges-total = <b>Total</b>
# $invoiceTotal (String) - The total amount of the subscription invoice, including currency, e.g. $10.00
subscription-charges-total-plaintext = Total: { $invoiceTotal }
subscription-charges-credit-applied = Credito applicate
# $creditApplied (String) - The amount of credit applied to the subscription invoice, including currency, e.g. $2.00
subscription-charges-credit-applied-plaintext = Credito applicate: { $creditApplied }
subscription-charges-amount-paid = <b>Amonta pagate</b>
# $invoiceAmountDue (String) - The total that the customer owes after all credits, discounts, and taxes have been applied, including currency, e.g. $8.00
subscription-charges-amount-paid-plaintext = Amonta pagate: { $invoiceAmountDue }
# $creditReceived (String) - The amount, after discount, of the subscription invoice, including currency, e.g. $8.00
subscription-charges-credit-received = Tu ha recipite un accreditation de conto de { $creditReceived }, que sera applicate a tu futur facturas.

##

subscriptionSupport = Questiones re tu subscription? Nostre <a data-l10n-name="subscriptionSupportUrl">equipa de assistentia</a> es hic pro adjutar te.
# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupport-plaintext = Questiones re tu subscription? Nostre equipa de supporto es ci pro te adjutar:
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSupportContact = Gratias pro tu abonamento a { $productName }. Si tu ha questiones sur tu abonamento o tu require altere informationes sur { $productName }, <a data-l10n-name="subscriptionSupportUrl">contacta nos</a>.
# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupportContact-plaintext = Gratias pro tu abonamento a { $productName }. Si tu ha questiones re tu abonamento o tu require altere informationes sur { $productName }, contacta nos:
subscription-support-get-help = Recipe auxilio con tu abonamento
subscription-support-manage-your-subscription = <a data-l10n-name="manageSubscriptionUrl">Gere tu abonamento</a>
# After the colon, there's a link to https://payments.firefox.com/subscriptions
subscription-support-manage-your-subscription-plaintext = Gere tu abonamento:
subscription-support-contact-support = <a data-l10n-name="subscriptionSupportUrl">Contactar assistentia</a>
# After the colon, there's a link to https://support.mozilla.com/products
subscription-support-contact-support-plaintext = Contactar assistentia:
subscriptionUpdateBillingEnsure = Tu pote assecurar te que tu methodo de pagamento e le informationes de tu conto es actualisate <a data-l10n-name="updateBillingUrl">hic</a>.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdateBillingEnsure-plaintext = Tu pote assecurar te que tu methodo de pagamento e le informationes de tu conto es al currente hic:
subscriptionUpdateBillingTry = Nos tentara tu pagamento de novo le proxime poc dies, ma tu pote deber adjutar nos a corriger lo <a data-l10n-name="updateBillingUrl">actualisante tu informationes de pagamento</a>.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdateBillingTry-plaintext = Nos provara tu pagamento de novo in le proxime poc dies, ma tu pote deber adjutar nos a corriger lo actualisante tu informationes de pagamento:
subscriptionUpdatePayment = Pro impedir ulle interruption a tu servicio, per favor <a data-l10n-name="updateBillingUrl">actualisa tu informationes de pagamento</a> al plus tosto possibile.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdatePayment-plaintext = Pro impedir ulle interruption a tu servicio, actualisa tu informationes de pagamento le plus tosto possibile:
view-invoice-link-action = Vider le factura
# Variables:
#  $invoiceLink (String) - The link to the invoice
# After the colon, there's a link to https://pay.stripe.com/
view-invoice-plaintext = Vide factura: { $invoiceLink }
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-subject = Benvenite a { $productName }.
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-title = Benvenite a { $productName }.
downloadSubscription-content-2 = Comencia a usar tote le functiones includite in tu abonamento:
downloadSubscription-link-action-2 = Comenciar
fraudulentAccountDeletion-subject-2 = Tu { -product-mozilla-account } ha essite delite
fraudulentAccountDeletion-title = Tu conto ha essite delite
fraudulentAccountDeletion-content-part1-v2 = Recentemente, un { -product-mozilla-account } ha essite create e un abonamento cargate per iste adresse email. Como nos face con tote le nove contos, nos demanda que tu confirma tu conto per le prime validation de iste adresse email.
fraudulentAccountDeletion-content-part2-v2 = Actualmente, nos vide que le conto non ha jammais essite confirmate. Pois que iste passo non ha essite completate, nos non es secur si isto es un abonamento autorisate. In consequentia, le { -product-mozilla-account } registrate con iste adresse de e-mail ha essite delite e tu abonamento ha essite cancellate con reimbursamento de tote le costos.
fraudulentAccountDeletion-contact = Si tu ha questiones, contacta nostre <a data-l10n-name="mozillaSupportUrl">equipa de assistentia</a>.
# Variables:
#  $mozillaSupportUrl (String) - Link to https://support.mozilla.org
fraudulentAccountDeletion-contact-plaintext = Si tu ha questiones, contacta nostre equipa de assistentia: { $mozillaSupportUrl }
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountDeletion-subject = Tu abonamento a { $productName } ha essite cancellate
subscriptionAccountDeletion-title = Nos displace que tu vade
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $invoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
subscriptionAccountDeletion-content-cancelled-2 = Tu ha delite recentemente tu conto { -product-mozilla-account }. In consequentia, nos ha cancellate tu subscription a { $productName }. Tu pagamento final de { $invoiceTotal } ha essite pagate le { $invoiceDateOnly }.
subscriptionAccountReminderFirst-subject = Memento: fini le preparation de tu conto
subscriptionAccountReminderFirst-title = Tu non pote ancora acceder a tu subscription
subscriptionAccountReminderFirst-content-info-3 = Alcun dies retro tu ha create un { -product-mozilla-account }, ma tu non lo ha ancora confirmate. Nos spera que tu finira le configuration de tu conto, assi que tu pote usar tu nove abonamento.
subscriptionAccountReminderFirst-content-select-2 = Elige “Crear contrasigno” pro configurar un nove contrasigno e finir de confirmar tu conto.
subscriptionAccountReminderFirst-action = Crear contrasigno
subscriptionAccountReminderFirst-action-plaintext = { subscriptionAccountReminderFirst-action }:
subscriptionAccountReminderSecond-subject = Memento final: configura tu conto
subscriptionAccountReminderSecond-title-2 = Benvenite a { -brand-mozilla }!
subscriptionAccountReminderSecond-content-info-3 = Alcun dies retro tu ha create un { -product-mozilla-account }, ma tu non lo ha ancora confirmate. Nos spera que tu finira le configuration de tu conto, assi que tu pote usar tu nove abonamento.
subscriptionAccountReminderSecond-content-select-2 = Elige “Crear contrasigno” pro configurar un nove contrasigno e finir de confirmar tu conto.
subscriptionAccountReminderSecond-action = Crear contrasigno
subscriptionAccountReminderSecond-action-plaintext = { subscriptionAccountReminderSecond-action }:
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionCancellation-subject = Tu abonamento a { $productName } ha essite cancellate
subscriptionCancellation-title = Nos displace que tu vade

## Variables
##   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
##   $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
##   $invoiceDateOnly (String) - The date of the invoice, e.g. 01/20/2016

subscriptionCancellation-content-2 = Nos ha cancellate tu abonamento a { $productName }. Tu pagamento final de { $invoiceTotal } era pagate le { $invoiceDateOnly }.
subscriptionCancellation-outstanding-content-2 = Nos ha cancellate tu abonamento a { $productName }. Tu pagamento final de { $invoiceTotal } sera pagate le { $invoiceDateOnly }.
# Variables
#   $serviceLastActiveDateOnly (String) - The date of last active service, e.g. 01/20/2016
subscriptionCancellation-content-continue = Tu servicio continuara usque le fin de tu periodo de facturation currente, que es { $serviceLastActiveDateOnly }.
# Variables:
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-subject = Tu ha passate a { $productName }
# Variables:
# $productNameOld (String) - The name of the previously subscribed product, e.g. Mozilla VPN
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-content-switch = Tu ha passate con successo ab { $productNameOld } a { $productName }.
# Variables:
# $paymentAmountOld (String) - The amount of the previous subscription payment, including currency, e.g. $10.00
# $paymentAmountNew (String) - The amount of the new subscription payment, including currency, e.g. $10.00
# $productPaymentCycleNew (String) - The interval of time from the end of one payment statement date to the next payment statement date of the new subscription, e.g. month
# $productPaymentCycleOld (String) - The interval of time from the end of one payment statement date to the next payment statement date of the old subscription, e.g. month
# $paymentProrated (String) - The one time fee to reflect the higher charge for the remainder of the payment cycle, including currency, e.g. $10.00
subscriptionDowngrade-content-charge-info = A comenciar con tu proxime factura, tu amonta cambiara de { $paymentAmountOld } per { $productPaymentCycleOld } a { $paymentAmountNew } per { $productPaymentCycleNew }. In ille tempore te sera date un credito una tantum de { $paymentProrated } pro reflecter le inferior amonta pro le resto de iste { $productPaymentCycleOld }.
# Variables:
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-content-install = Si il habera nove software pro te a installar pro usar { $productName }, tu recipera un email separate con instructiones pro discargamentos.
subscriptionDowngrade-content-auto-renew = Tu subscription sera renovate automaticamente cata termino de facturation usque tu non seligera de cancellar lo.
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionEndingReminder-subject = Tu abonamento a { $productName } expirara tosto
subscriptionEndingReminder-title = Tu abonamento a { $productName } expirara tosto
# Variables:
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
#   $serviceLastActiveDateOnly (String) - The date of last active service, e.g. 01/20/2016
subscriptionEndingReminder-content-line1 = Tu accesso a { $productName } finira le <strong>{ $serviceLastActiveDateOnly }</strong>.
subscriptionEndingReminder-content-line2 = Si te placerea continuar usar { $productName }, tu poterea reactivar tu abonamento in <a data-l10n-name="subscriptionEndingReminder-account-settings">parametros del conto</a> ante le <strong>{ $serviceLastActiveDateOnly }</strong>. Si tu besonia assistantia, <a data-l10n-name="subscriptionEndingReminder-contact-support">contacta nostre equipa de supporto</a>.
subscriptionEndingReminder-content-line1-plaintext = Tu accesso a { $productName } finira le { $serviceLastActiveDateOnly }.
subscriptionEndingReminder-content-line2-plaintext = Si te placerea continuar usar { $productName }, tu potera reactivar tu abonamento in parametros de conto ante { $serviceLastActiveDateOnly }. Si tu besonia assistentia, contacta tu equipa de supporto.
subscriptionEndingReminder-content-closing = Gratias pro esser un abonato! valorose!
subscriptionEndingReminder-churn-title = Vole tu mantener le accesso?
subscriptionEndingReminder-churn-terms = <a data-l10n-name="subscriptionEndingReminder-churn-terms">Conditiones e restrictiones limitate applicate</a>
# Variables:
#  $churnTermsUrlWithUtm (String) - URL to the terms and restrictions page applied to this promotion
subscriptionEndingReminder-churn-terms-plaintext = Conditiones e restrictiones limitate applicate: { $churnTermsUrlWithUtm }
# Variables:
#  $subscriptionSupportUrlWithUtm (String) - URL to the subscription products support page
subscriptionEndingReminder-content-support-plaintext = Contacta nostre equipa de supporto: { $subscriptionSupportUrlWithUtm }
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFailedPaymentsCancellation-subject = Tu abonamento a { $productName } ha essite cancellate
subscriptionFailedPaymentsCancellation-title = Tu abonamento ha essite cancellate
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFailedPaymentsCancellation-content = Nos ha cancellate tu subscription a { $productName } per plure tentativas de pagamento fallite. Pro de novo obtener accesso, initia un nove subscription con un methodo de pagamento actualisate.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-subject = Pagamento de { $productName } confirmate
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-title = Gratias pro tu subscription a { $productName } !
subscriptionFirstInvoice-content-processing = Tu pagamento es actualmente in processo e pote prender usque quatro dies de negotios pro completar.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-content-install-2 = Tu recipera un separate email re como initiar a usar { $productName }
subscriptionFirstInvoice-content-auto-renew = Tu subscription sera renovate automaticamente cata termino de facturation usque tu non seligera de cancellar lo.
# Variables:
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025
subscriptionFirstInvoice-content-your-next-invoice = Tu proxime factura sera emittite le { $nextInvoiceDateOnly }.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentExpired-subject-2 = Le methodo de pagamento pro { $productName } expirava o tosto va expirar
subscriptionPaymentExpired-title-2 = Tu methodo de pagamento expirava o va expirar
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentExpired-content-2 = Le methodo de pagamento que tu usa pro facer pagamentos pro { $productName } expirava o tosto va expirar.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-subject = Pagamento de { $productName } fallite
subscriptionPaymentFailed-title = Desolate, nos ha problemas con tu pagamento
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-content-problem = Nos ha habite problemas con tu ultime pagamento pro { $productName }.
subscriptionPaymentFailed-content-outdated-1 = Forsan tu methodo de pagamento ha expirate o tu actual methodo de pagamento non es actualisate.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentProviderCancelled-subject = Actualisation obligatori del informationes de pagamento pro { $productName }
subscriptionPaymentProviderCancelled-title = Desolate, nos ha problemas con tu methodo de pagamento
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentProviderCancelled-content-detect = Nos ha revelate un problemas con tu methodo de pagamento pro { $productName }.
subscriptionPaymentProviderCancelled-content-reason-1 = Forsan tu methodo de pagamento ha expirate o tu actual methodo de pagamento non es actualisate.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-subject = Subscription a { $productName } reactivate
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-title = Gratias pro le reactivation de tu subscription a { $productName }!
# Variables:
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. 2016/01/20
subscriptionReactivation-content = Tu cyclo de facturation e pagamento remanera identic. Le { $nextInvoiceDateOnly } tu carga successive sera de { $invoiceTotal }. Tu abonamento sera renovate automaticamente cata termino de facturation usque tu non seligera de cancellar lo.
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-subject = Aviso de renovation automatic de { $productName }
subscriptionRenewalReminder-title = Tu abonamento sera renovate tosto
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-greeting = Car cliente de { $productName },
# Variables
#   $reminderLength (String) - The number of days until the current subscription is set to automatically renew, e.g. 14
subscriptionRenewalReminder-content-intro = Tu abonamento currente es configurate pro automaticamente renovar se in { $reminderLength } dies.
subscriptionRenewalReminder-content-discount-change = Tu factura successive reflectera un modification del precio, pois que un disconto existente ha finite e un nove disconto ha essite applicate.
subscriptionRenewalReminder-content-discount-ending = Pois que un previe disconto ha finite, tu abonamento se renovara al precio standard.
subscriptionRenewalReminder-content-closing = Sincermente,
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-signature = Le equipa de { $productName }
subscriptionReplaced-subject = Tu abonamento ha essite actualisate como parte de tu promotion
subscriptionReplaced-title = Tu abonamento ha essite actualisate
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReplaced-content-replaced = Tu abonamento individual a { $productName } ha essite substituite e ora es includite in tu nove pacchetto.
subscriptionReplaced-content-credit = Tu recipera un credito pro ulle periodo non usate de tu previe abonamento. Iste credito sera automaticamente applicate a tu conto e usate pro debitos futur.
subscriptionReplaced-content-no-action = Nulle action es necessari de parte tue.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSubsequentInvoice-subject = Pagamento de { $productName } recepite
subscriptionSubsequentInvoice-title = Gratias pro esser un abonato!
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSubsequentInvoice-content-received = Le ultime pagamento pro { $productName } ha essite recipite.
# Variables:
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025
subscriptionSubsequentInvoice-content-your-next-invoice = Tu proxime factura sera emittite le { $nextInvoiceDateOnly }.
# Variables:
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionUpgrade-subject = Tu ha promovite a { $productName }.
subscriptionUpgrade-title = Gratias pro tu promotion!
# Variables:
# $productNameOld (String) - The name of the previously subscribed product, e.g. Mozilla VPN
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionUpgrade-upgrade-info-2 = Tu era con successo promovite a { $productName }.

## Variables:
## $paymentAmountOld (String) - The amount of the previous subscription payment, including currency, e.g. $10.00
## $paymentAmountNew (String) - The amount of the new subscription payment, including currency, e.g. $10.00
## $paymentTaxOld (String) - The tax amount of the previous subscription payment, including currency, e.g. $1.00
## $paymentTaxNew (String) - The tax amount of the new subscription payment, including currency, e.g. $1.00
## $productPaymentCycleNew (String) - The interval of time from the end of one payment statement date to the next payment statement date of the new subscription, e.g. month
## $productPaymentCycleOld (String) - The interval of time from the end of one payment statement date to the next payment statement date of the old subscription, e.g. month
## $invoiceAmountDue (String) - The total that the customer owes after all credits, discounts, and taxes have been applied
## $paymentProrated (String) - The one time fee to reflect the higher charge for the remainder of the payment cycle, including currency, e.g. $10.00

subscriptionUpgrade-content-charge-prorated-1 = Te ha essite cargate un onere de un-vice de { $invoiceAmountDue } pro reflecter tu precio de abonamento superior pro le resto de iste termino de facturation ({ $productPaymentCycleOld }).
subscriptionUpgrade-content-charge-credit = Tu ha recipite un accreditation de conto in le amonta de { $paymentProrated }.
subscriptionUpgrade-content-subscription-next-bill-change = Comenciante con tu proxime factura, le precio de tu abonamento cambiara.
subscriptionUpgrade-content-old-price-day = Le previe rata era { $paymentAmountOld } per die.
subscriptionUpgrade-content-old-price-week = Le previe rata era { $paymentAmountOld } per septimana.
subscriptionUpgrade-content-old-price-month = Le previe rata era { $paymentAmountOld } per mense.
subscriptionUpgrade-content-old-price-halfyear = Le previe rata era { $paymentAmountOld } per sex menses.
subscriptionUpgrade-content-old-price-year = Le previe rata era { $paymentAmountOld } per anno.
subscriptionUpgrade-content-old-price-default = Le previe rata era { $paymentAmountOld } per intervallo de facturation.
subscriptionUpgrade-content-old-price-day-tax = Le previe rata era { $paymentAmountOld } + taxa de { $paymentTaxOld } per die.
subscriptionUpgrade-content-old-price-week-tax = Le previe rata era { $paymentAmountOld } + taxa de { $paymentTaxOld } per septimana.
subscriptionUpgrade-content-old-price-month-tax = Le previe rata era { $paymentAmountOld } + taxa de { $paymentTaxOld } per mense.
subscriptionUpgrade-content-old-price-halfyear-tax = Le previe rata era { $paymentAmountOld } + taxa de { $paymentTaxOld } per sex menses.
subscriptionUpgrade-content-old-price-year-tax = Le previe rata era { $paymentAmountOld } + taxa de { $paymentTaxOld } per anno.
subscriptionUpgrade-content-old-price-default-tax = Le previe rata era { $paymentAmountOld } + taxa de { $paymentTaxOld } per intervallo de facturation.
subscriptionUpgrade-content-new-price-day = Desde ora, tu sera cargate { $paymentAmountNew } per die, salvo discontos.
subscriptionUpgrade-content-new-price-week = Desde ora, tu sera cargate { $paymentAmountNew } per septimana, salvo discontos.
subscriptionUpgrade-content-new-price-month = Desde ora, tu sera cargate { $paymentAmountNew } per mense, salvo discontos.
subscriptionUpgrade-content-new-price-halfyear = Desde ora, tu sera cargate { $paymentAmountNew } per sex menses, salvo discontos.
subscriptionUpgrade-content-new-price-year = Desde ora, tu sera cargate { $paymentAmountNew } per anno, salvo discontos.
subscriptionUpgrade-content-new-price-default = Desde ora, tu sera cargate { $paymentAmountNew } per intervallo de facturation, salvo discontos.
subscriptionUpgrade-content-new-price-day-dtax = Desde ora, tu sera cargate { $paymentAmountNew } + taxa de { $paymentTaxNew } per die, salvo discontos.
subscriptionUpgrade-content-new-price-week-tax = Desde ora, tu sera cargate { $paymentAmountNew } + taxa de { $paymentTaxNew } per septimana, salvo discontos.
subscriptionUpgrade-content-new-price-month-tax = Desde ora, tu sera cargate { $paymentAmountNew } + taxa de { $paymentTaxNew } per per mense, salvo discontos.
subscriptionUpgrade-content-new-price-halfyear-tax = Desde ora, tu sera cargate { $paymentAmountNew } + taxa de { $paymentTaxNew } per per sex menses, salvo discontos.
subscriptionUpgrade-content-new-price-year-tax = Desde ora, tu sera cargate { $paymentAmountNew } + taxa de { $paymentTaxNew } per anno, salvo discontos.
subscriptionUpgrade-content-new-price-default-tax = Desde ora, tu sera cargate { $paymentAmountNew } + taxa de { $paymentTaxNew } per intervallo de facturation, salvo discontos.
subscriptionUpgrade-existing = Si il ha alcun imbrication de tu abonamentos existente con iste promotion, nos los tractara e te inviara un email separate con le detalios. Si tu nove plano include productos que require installation, nos te inviara un email separate con le instructiones de installation.
subscriptionUpgrade-auto-renew = Tu subscription sera renovate automaticamente cata termino de facturation usque tu non seligera de cancellar lo.
subscriptionsPaymentExpired-subject-2 = Le methodo de pagamento pro tu abonamentos expirava o tosto va expirar
subscriptionsPaymentExpired-title-2 = Tu methodo de pagamento expirava o va expirar
subscriptionsPaymentExpired-content-2 = Le methodo de pagamento que tu usa pro facer pagamentos pro le sequente abonamentos expirava o va tosto expirar.
subscriptionsPaymentProviderCancelled-subject = Actualisation obligatori del informationes de pagamento pro le subscriptiones de { -brand-mozilla }
subscriptionsPaymentProviderCancelled-title = Desolate, nos ha problemas con tu methodo de pagamento
subscriptionsPaymentProviderCancelled-content-detected = Nos ha revelate un problemas con tu methodo de pagamento pro le sequente subscriptiones.
subscriptionsPaymentProviderCancelled-content-payment-1 = Forsan tu methodo de pagamento ha expirate o tu actual methodo de pagamento non es actualisate.
