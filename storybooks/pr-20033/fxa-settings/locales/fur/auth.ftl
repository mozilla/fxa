## Non-email strings

session-verify-send-push-title-2 = Jentrâ tal to { -product-mozilla-account }?
session-verify-send-push-body-2 = Fâs clic achì par confermâ la tô identitât
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to verify phone ownership when registering a recovery phone
recovery-phone-setup-sms-body = { $code } al è il to codiç di verifiche par { -brand-mozilla }. Al scjât ca di 5 minûts.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to verify phone ownership when registering a recovery phone
recovery-phone-setup-sms-short-body = Codiç di verifiche { -brand-mozilla }: { $code }
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for two-step authentication
recovery-phone-signin-sms-body = { $code } al è il to codiç di recupar par { -brand-mozilla }. Al scjât ca di 5 minûts.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for two-step authentication
recovery-phone-signin-sms-short-body = Codiç { -brand-mozilla }: { $code }
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for account password reset
recovery-phone-reset-password-sms-body = { $code } al è il to codiç di recupar par { -brand-mozilla }. Al scjât ca di 5 minûts.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for account password reset
recovery-phone-reset-password-short-body = Codiç { -brand-mozilla }: { $code }
subplat-header-mozilla-logo-2 = <img data-l10n-name="subplat-mozilla-logo" alt="Logo { -brand-mozilla }">
subplat-footer-mozilla-logo-2 = <img data-l10n-name="mozilla-logo-footer" alt="Logo { -brand-mozilla }">
subplat-automated-email = Cheste e je une e-mail inviade di un servizi automatic; se tu le âs ricevude par erôr, nol covente fâ nuie.
subplat-privacy-notice = Informative su la riservatece
subplat-privacy-plaintext = Informative su la riservatece:
subplat-update-billing-plaintext = { subplat-update-billing }:
# Variables:
#  $email (String) - A user's primary email address
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subplat-explainer-specific-2 = Tu ricevis cheste e-mail parcè che la direzion { $email } e je associade a un { -product-mozilla-account } e tu âs fat la regjistrazion a { $productName }.
# Variables:
#  $email (String) - A user's primary email address
subplat-explainer-reminder-form-2 = Tu ricevis cheste e-mail parcè che la direzion { $email } e je associade a un { -product-mozilla-account }.
subplat-explainer-multiple-2 = Tu ricevis cheste e-mail parcè che la direzion { $email } e je associade a un { -product-mozilla-account } e tu âs fat la sotscrizion a plui prodots.
subplat-explainer-was-deleted-2 = Tu ricevis cheste e-mail parcè che la direzion { $email } e je stade doprade par regjistrâ un { -product-mozilla-account }
subplat-manage-account-2 = Gjestìs lis impostazions dal to { -product-mozilla-account } visitant la <a data-l10n-name="subplat-account-page">pagjine dal account</a>.
# Variables:
#  $accountSettingsUrl (String) - URL to Account Settings
subplat-manage-account-plaintext-2 = Gjestìs lis impostazions dal to { -product-mozilla-account } visitant la pagjine dal to account: { $accountSettingsUrl }
subplat-terms-policy = Tiermins e cundizions di cancelazion
subplat-terms-policy-plaintext = { subplat-terms-policy }:
subplat-cancel = Anule l'abonament
subplat-cancel-plaintext = { subplat-cancel }:
subplat-reactivate = Torne ative l'abonament
subplat-reactivate-plaintext = { subplat-reactivate }:
subplat-update-billing = Inzorne lis informazions pe fature
subplat-privacy-policy = Informative su la riservatece di { -brand-mozilla }
subplat-privacy-policy-2 = Informative su la riservatece dai { -product-mozilla-accounts }
subplat-privacy-policy-plaintext = { subplat-privacy-policy }:
subplat-privacy-policy-plaintext-2 = { subplat-privacy-policy-2 }:
subplat-moz-terms = Cundizions di utilizazion dal servizi dai { -product-mozilla-accounts }
subplat-moz-terms-plaintext = { subplat-moz-terms }:
subplat-legal = Notis legâls
subplat-legal-plaintext = { subplat-legal }:
subplat-privacy = Riservatece
subplat-privacy-website-plaintext = { subplat-privacy }:
cancellationSurvey = Judinus a miorâ i nestris servizis partecipant a chest <a data-l10n-name="cancellationSurveyUrl">curt sondaç</a>.
# After the colon, there's a link to https://survey.alchemer.com/s3/6534408/Privacy-Security-Product-Cancellation-of-Service-Q4-21
cancellationSurvey-plaintext = Judinus a miorâ i nestris servizis partecipant a chest curt sondaç:
payment-details = Detais dal paiament:
# Variables:
#  $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
payment-plan-invoice-number = Numar fature: { $invoiceNumber }
# Variables:
#  $invoiceDateOnly (String) - The date of the invoice, e.g. 01/20/2016
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
payment-plan-charged = Adebit: { $invoiceTotal } ai { $invoiceDateOnly }
# Variables
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
payment-plan-next-invoice = Prossime fature: { $nextInvoiceDateOnly }

## $paymentProviderName (String) - The brand name of the payment method, e.g. PayPal, Apple Pay, Google Pay, Link

payment-method-payment-provider = <b>Metodi di paiament:</b> { $paymentProviderName }
payment-method-payment-provider-plaintext = Metodi di paiament: { $paymentProviderName }

## This string displays when the type of credit card is known
## https://stripe.com/docs/payments/cards/supported-card-brands
## Variables:
##  $cardName (String) - The brand name of the credit card, e.g. American Express
##  $lastFour (String) - The last four digits of the credit card, e.g. 5309

payment-provider-card-name-ending-in-plaintext = Metodi di paiament: { $cardName } che e finìs cun { $lastFour }
payment-provider-card-ending-in-plaintext = Metodi di paiament: cjarte che e finìs cun { $lastFour }
payment-provider-card-ending-in = <b>Metodi di paiament:</b> cjarte che e finìs cun { $lastFour }
payment-provider-card-ending-in-card-name = <b>Metodi di paiament:</b> { $cardName } che e finìs cun { $lastFour }
subscription-charges-invoice-summary = Sintesi fature

# Variables:


## $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
## $invoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025

subscription-charges-invoice-number = <b>Numar fature:</b> { $invoiceNumber }
subscription-charges-invoice-number-plaintext = Numar fature: { $invoiceNumber }
subscription-charges-invoice-date = <b>Date:</b> { $invoiceDateOnly }
subscription-charges-invoice-date-plaintext = Date: { $invoiceDateOnly }
subscription-charges-prorated-price = Presit ripartît in mût proporzionâl
# $remainingAmountTotal (String) - The prorated amount of the subscription invoice, including currency, e.g. $4.00
subscription-charges-prorated-price-plaintext = Presit ripartît in mût proporzionâl: { $remainingAmountTotal }
subscription-charges-list-price = Presit di listin
# $offeringPrice (String) - The list price of the subscription offering, including currency, e.g. $10.00
subscription-charges-list-price-plaintext = Presit di listin: { $offeringPrice }
subscription-charges-credit-from-unused-time = Credit dal timp che no tu âs doprât
# $unusedAmountTotal (String) - The credit amount from unused time of the subscription invoice, including currency, e.g. $2.00
subscription-charges-credit-from-unused-time-plaintext = Credit dal timp che no tu âs doprât: { $unusedAmountTotal }
subscription-charges-subtotal = <b>Totâl parziâl</b>
# $invoiceSubtotal (String) - The amount, before discount, of the subscription invoice, including currency, e.g. $10.00
subscriptionFirstInvoiceDiscount-content-subtotal = Totâl parziâl: { $invoiceSubtotal }

## $invoiceDiscountAmount (String) - The amount of the discount of the subscription invoice, including currency, e.g. $2.00
## $discountDuration - The duration of the discount in number of months, e.g. "3" if the discount is 3-months

subscription-charges-one-time-discount = Scont una tantum
subscription-charges-one-time-discount-plaintext = Scont una tantum: { $invoiceDiscountAmount }
subscription-charges-repeating-discount =
    { $discountDuration ->
        [one] Scont di { $discountDuration } mês
       *[other] Scont di { $discountDuration } mês
    }
subscription-charges-repeating-discount-plaintext =
    { $discountDuration ->
        [one] Scont di { $discountDuration } mês: { $invoiceDiscountAmount }
       *[other] Scont di { $discountDuration } mês: { $invoiceDiscountAmount }
    }
subscription-charges-discount = Scont
subscription-charges-discount-plaintext = Scont: { $invoiceDiscountAmount }
subscription-charges-taxes = Tassis e comissions
# $invoiceTaxAmount (String) - The amount of the tax of the subscription invoice, including currency, e.g. $2.00
subscriptionCharges-content-tax-plaintext = Tassis e comissions: { $invoiceTaxAmount }
subscription-charges-total = <b>Totâl</b>
# $invoiceTotal (String) - The total amount of the subscription invoice, including currency, e.g. $10.00
subscription-charges-total-plaintext = Totâl: { $invoiceTotal }
subscription-charges-credit-applied = Credit aplicât
# $creditApplied (String) - The amount of credit applied to the subscription invoice, including currency, e.g. $2.00
subscription-charges-credit-applied-plaintext = Credit aplicât: { $creditApplied }
subscription-charges-amount-paid = <b>Impuart paiât</b>
# $invoiceAmountDue (String) - The total that the customer owes after all credits, discounts, and taxes have been applied, including currency, e.g. $8.00
subscription-charges-amount-paid-plaintext = Impuart paiât: { $invoiceAmountDue }
# $creditReceived (String) - The amount, after discount, of the subscription invoice, including currency, e.g. $8.00
subscription-charges-credit-received = Tu âs ricevût un credit di { $creditReceived } sul to account che al vignarà aplicât aes tôs faturis futuris.

##

subscriptionSupport = Domandis sul abonament? Il nestri <a data-l10n-name="subscriptionSupportUrl">grup di supuart</a> al è achì par judâti.
# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupport-plaintext = Domandis sul abonament? Il nestri grup di supuart al è achì par judâti:
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSupportContact = Graciis pal to abonament a { $productName }. Se tu âs domandis in merit o tu âs bisugne di vê plui informazions su { $productName }, <a data-l10n-name="subscriptionSupportUrl">contatinus</a>.
# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupportContact-plaintext = Graciis pal abonament a { $productName }. Se tu âs domandis sul abonament o tu âs bisugne di vê plui informazions su { $productName }, contatinus:
subscription-support-get-help = Oten jutori pal to abonament
subscription-support-manage-your-subscription = <a data-l10n-name="manageSubscriptionUrl">Gjestìs il to abonament</a>
# After the colon, there's a link to https://payments.firefox.com/subscriptions
subscription-support-manage-your-subscription-plaintext = Gjestìs il to abonament:
subscription-support-contact-support = <a data-l10n-name="subscriptionSupportUrl">Contate il supuart</a>
# After the colon, there's a link to https://support.mozilla.com/products
subscription-support-contact-support-plaintext = Contate il supuart:
subscriptionUpdateBillingEnsure = <a data-l10n-name="updateBillingUrl">Achì</a> tu puedis verificâ che il metodi di paiament e lis informazions sul account a sedin inzornâts.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdateBillingEnsure-plaintext = Tu puedis verificâ che il metodi di paiament e lis informazions sul account a sedin inzornâts achì:
subscriptionUpdateBillingTry = O cirarìn di fâ di gnûf il paiament in chescj prossims dîs, ma al è probabil che tu vedis di judânus a risolvi il probleme <a data-l10n-name="updateBillingUrl">inzornant lis informazions di paiament</a>.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdateBillingTry-plaintext = O cirarìn di fâ di gnûf il paiament in chescj prossims dîs, ma al è probabil che tu vedis di judânus a risolvi il probleme inzornant lis informazions di paiament:
subscriptionUpdatePayment = Par evitâ cualsisei interuzion dal servizi, <a data-l10n-name="updateBillingUrl">inzornâ lis informazions di paiament</a> a pene pussibil.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdatePayment-plaintext = Par evitâ cualsisei interuzion dal servizi, inzorne lis informazions di paiament a pene pussibil:
view-invoice-link-action = Visualize fature
# Variables:
#  $invoiceLink (String) - The link to the invoice
# After the colon, there's a link to https://pay.stripe.com/
view-invoice-plaintext = Visualize la fature: { $invoiceLink }
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-subject = Benvignûts in { $productName }
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-title = Benvignûts in { $productName }
downloadSubscription-content-2 = Scomence a doprâ dutis lis funzionalitâts includudis tal to abonament:
downloadSubscription-link-action-2 = Scomence
fraudulentAccountDeletion-subject-2 = Il to { -product-mozilla-account } al è stât eliminât
fraudulentAccountDeletion-title = Il to account al è stât eliminât
fraudulentAccountDeletion-content-part1-v2 = Di resint al è stât creât un { -product-mozilla-account } e al è stât regjistrât un abonament a paiament doprant cheste direzion e-mail. Come che o fasìn par ducj i gnûfs accounts, par prime robe o vin domandât di confermâ il to account convalidant cheste direzion e-mail.
fraudulentAccountDeletion-content-part2-v2 = Par cumò nus risulte che l’account nol è mai stât confermât. Viodût che chest passaç nol è stât completât, no podìn jessi sigûrs che al sedi un abonament autorizât. Duncje, l’{ -product-mozilla-account } regjistrât cun cheste direzion e-mail al è stât eliminât e l’abonament al è stât anulât cu la rifusion di ducj i adebitaments.
fraudulentAccountDeletion-contact = Par cualsisei domande contate il nestri <a data-l10n-name="mozillaSupportUrl">grup di supuart</a>.
# Variables:
#  $mozillaSupportUrl (String) - Link to https://support.mozilla.org
fraudulentAccountDeletion-contact-plaintext = Par cualsisei domande contate il nestri grup di supuart: { $mozillaSupportUrl }
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountDeletion-subject = Il to abonament a { $productName } al è stât cancelât
subscriptionAccountDeletion-title = Tu nus mancjarâs
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $invoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
subscriptionAccountDeletion-content-cancelled-2 = Di resint tu âs eliminât il to { -product-mozilla-account }. Alore o ven anulât il to abonament a { $productName }. Il paiament finâl di { $invoiceTotal } al è stât paiât ai { $invoiceDateOnly }.
subscriptionAccountReminderFirst-subject = Pro memoria: complete la configurazion dal to account
subscriptionAccountReminderFirst-title = No tu puedis ancjemò jentrâ tal to abonament
subscriptionAccountReminderFirst-content-info-3 = Cualchi dì indaûr tu âs creât un { -product-mozilla-account } ma no tu lu âs confermât. O sperìn che tu finissis di configurâ il to account, cussì che tu podedis doprâ il to gnûf abonament.
subscriptionAccountReminderFirst-content-select-2 = Selezione “ Cree password” par configurâ une gnove password e completâ la conferme dal to account.
subscriptionAccountReminderFirst-action = Cree password
subscriptionAccountReminderFirst-action-plaintext = { subscriptionAccountReminderFirst-action }:
subscriptionAccountReminderSecond-subject = Pro memoria finâl: configure il to account
subscriptionAccountReminderSecond-title-2 = Benvignûts in { -brand-mozilla }!
subscriptionAccountReminderSecond-content-info-3 = Cualchi dì indaûr tu âs creât un { -product-mozilla-account } ma no tu lu âs confermât. O sperìn che tu finissis di configurâ il to account, cussì che tu podedis doprâ il to gnûf abonament.
subscriptionAccountReminderSecond-content-select-2 = Selezione “ Cree password” par configurâ une gnove password e completâ la conferme dal to account.
subscriptionAccountReminderSecond-action = Cree password
subscriptionAccountReminderSecond-action-plaintext = { subscriptionAccountReminderSecond-action }:
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionCancellation-subject = Il to abonament a { $productName } al è stât cancelât
subscriptionCancellation-title = Tu nus mancjarâs

## Variables
##   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
##   $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
##   $invoiceDateOnly (String) - The date of the invoice, e.g. 01/20/2016

subscriptionCancellation-content-2 = O vin anulât il to abonament a { $productName }. Il paiament finâl di { $invoiceTotal } al è stât paiât ai { $invoiceDateOnly }.
subscriptionCancellation-outstanding-content-2 = O vin anulât il to abonament a { $productName }. Il paiament finâl di { $invoiceTotal } al vignarà paiât ai { $invoiceDateOnly }.
# Variables
#   $serviceLastActiveDateOnly (String) - The date of last active service, e.g. 01/20/2016
subscriptionCancellation-content-continue = Il servizi al continuarà fin ae fin dal periodi di faturazion, che al è ai { $serviceLastActiveDateOnly }.
# Variables:
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-subject = Tu âs fat il passaç a { $productName }
# Variables:
# $productNameOld (String) - The name of the previously subscribed product, e.g. Mozilla VPN
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-content-switch = Passaç di { $productNameOld } a { $productName } completât cun sucès.
# Variables:
# $paymentAmountOld (String) - The amount of the previous subscription payment, including currency, e.g. $10.00
# $paymentAmountNew (String) - The amount of the new subscription payment, including currency, e.g. $10.00
# $productPaymentCycleNew (String) - The interval of time from the end of one payment statement date to the next payment statement date of the new subscription, e.g. month
# $productPaymentCycleOld (String) - The interval of time from the end of one payment statement date to the next payment statement date of the old subscription, e.g. month
# $paymentProrated (String) - The one time fee to reflect the higher charge for the remainder of the payment cycle, including currency, e.g. $10.00
subscriptionDowngrade-content-charge-info = Tacant cu la tô prossime fature, il paiament al sarà modificât di { $paymentAmountOld } par { $productPaymentCycleOld } a { $paymentAmountNew } par { $productPaymentCycleNew }. Tal stes timp ti vignarà increditade ancje une sume una tantum di { $paymentProrated } par rifleti la tarife plui basse pal rest di chest { $productPaymentCycleOld }.
# Variables:
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-content-install = Tal câs che ti coventi instalâ altri software par podê doprâ { $productName }, tu ricevarâs intune altre e-mail lis istruzions par discjamâlu.
subscriptionDowngrade-content-auto-renew = Il to abonament si rinovarà in automatic a ogni periodi di faturazion, gjavant il câs che no tu decidis di anulâlu.
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFailedPaymentsCancellation-subject = Il to abonament a { $productName } al è stât cancelât
subscriptionFailedPaymentsCancellation-title = Il to abonament al è stât cancelât
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFailedPaymentsCancellation-content = O vin anulât il to abonament a { $productName } par vie dai tancj tentatîfs falîts di paiament. Par otignî di gnûf l'acès, sotscrîf un gnûf abonament cuntun metodi di paiament inzornât.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-subject = Il paiament par { $productName } al è stât confermât
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-title = Graciis par vê sotscrit un abonament a { $productName }
subscriptionFirstInvoice-content-processing = Il paiament al è in fase di elaborazion, la operazion e podarès puartâ vie fin a cuatri dîs lavoratîfs.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-content-install-2 = Tu ricevarâs une altre e-mail cu lis informazions su cemût scomençâ a doprâ { $productName }.
subscriptionFirstInvoice-content-auto-renew = Il to abonament si rinovarà in automatic a ogni periodi di faturazion, gjavant il câs che no tu decidis di anulâlu.
# Variables:
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025
subscriptionFirstInvoice-content-your-next-invoice = La prossime fature e vignarà emetude ai { $nextInvoiceDateOnly }.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentExpired-subject-2 = Il metodi di paiament par { $productName } al è scjadût o al sta par scjadê
subscriptionPaymentExpired-title-2 = Il metodi di paiament al è scjadût o al sta par scjadê
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentExpired-content-2 = Il metodi di paiament che tu dopris par { $productName } al è scjadût o al sta par scjadê.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-subject = Paiament par { $productName } falît
subscriptionPaymentFailed-title = Nus displâs, o vin fastidis cul to paiament
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-content-problem = O vin vût un probleme cul to ultin paiament par { $productName }.
subscriptionPaymentFailed-content-outdated-1 = Al è pussibil che il to metodi di paiament al sedi scjadût o che il to metodi di paiament corint nol sedi inzornât.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentProviderCancelled-subject = Inzornament des informazions di paiament necessari par { $productName }
subscriptionPaymentProviderCancelled-title = Nus displâs, o vin fastidis cul to metodi di paiament
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentProviderCancelled-content-detect = O vin rilevât un probleme cul to metodi di paiament par { $productName }.
subscriptionPaymentProviderCancelled-content-reason-1 = Al è pussibil che il to metodi di paiament al sedi scjadût o che il to metodi di paiament corint nol sedi inzornât.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-subject = Abonament a { $productName } riativât
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-title = Graciis di vê riativât il to abonament a { $productName }!
# Variables:
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. 2016/01/20
subscriptionReactivation-content = Il cicli di faturazion e l'impuart a restaran invariâts. Il to prossim adebit al sarà di { $invoiceTotal } ai { $nextInvoiceDateOnly }. Il to abonament si rinovarà in automatic a ogni scjadince di faturazion, gjavant il câs che no tu decidis di anulâlu.
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-subject = Avîs di rinovazion automatiche di { $productName }
subscriptionRenewalReminder-title = Il to abonament al vignarà rinovât chi di pôc
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-greeting = Zentîl client di { $productName },
subscriptionRenewalReminder-content-closing = Cun rispiet,
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-signature = Il grup di { $productName }
subscriptionReplaced-subject = Il to abonament al è stât inzornât tant che part dal to inzornament
subscriptionReplaced-title = Il to abonament al è stât inzornât
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReplaced-content-replaced = Il to abonament individuâl a { $productName } al è stât sostituît e cumò al è includût tal gnûf pachet.
subscriptionReplaced-content-credit = Tu ricevarâs un credit pe part che no tu âs doprât dal to vecjo abonament. Chest credit al vignarà aplicât in automatic al to account e al vignarà doprât pai adebits futûrs.
subscriptionReplaced-content-no-action = No je domandade nissune azion de bande tô.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSubsequentInvoice-subject = Il paiament par { $productName } al è stât ricevût
subscriptionSubsequentInvoice-title = Graciis pal to abonament!
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSubsequentInvoice-content-received = O vin ricevût il to ultin paiament par { $productName }.
# Variables:
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025
subscriptionSubsequentInvoice-content-your-next-invoice = La prossime fature e vignarà emetude ai { $nextInvoiceDateOnly }.
# Variables:
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionUpgrade-subject = Tu âs inzornât a { $productName }
subscriptionUpgrade-title = Graciis pal inzornament!
# Variables:
# $productNameOld (String) - The name of the previously subscribed product, e.g. Mozilla VPN
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionUpgrade-upgrade-info-2 = L'inzornament a { $productName } al è stât fat cun sucès.

## Variables:
## $paymentAmountOld (String) - The amount of the previous subscription payment, including currency, e.g. $10.00
## $paymentAmountNew (String) - The amount of the new subscription payment, including currency, e.g. $10.00
## $paymentTaxOld (String) - The tax amount of the previous subscription payment, including currency, e.g. $1.00
## $paymentTaxNew (String) - The tax amount of the new subscription payment, including currency, e.g. $1.00
## $productPaymentCycleNew (String) - The interval of time from the end of one payment statement date to the next payment statement date of the new subscription, e.g. month
## $productPaymentCycleOld (String) - The interval of time from the end of one payment statement date to the next payment statement date of the old subscription, e.g. month
## $invoiceAmountDue (String) - The total that the customer owes after all credits, discounts, and taxes have been applied
## $paymentProrated (String) - The one time fee to reflect the higher charge for the remainder of the payment cycle, including currency, e.g. $10.00

subscriptionUpgrade-content-charge-prorated-1 = Une tarife una tantum di { $invoiceAmountDue } e je stade contizade a ti par rifleti il presit plui alt dal to abonament pal rest di chest periodi di faturazion ({ $productPaymentCycleOld }).
subscriptionUpgrade-content-charge-credit = Tu âs ricevût un credit di { $paymentProrated } sul cont.
subscriptionUpgrade-content-subscription-next-bill-change = Tacant de prossime fature, il presit dal to abonament al cambiarà.
subscriptionUpgrade-content-old-price-day = La tarife di prime e jere di { $paymentAmountOld } al dì.
subscriptionUpgrade-content-old-price-week = La tarife di prime e jere di { $paymentAmountOld } ae setemane.
subscriptionUpgrade-content-old-price-month = La tarife di prime e jere di { $paymentAmountOld } al mês.
subscriptionUpgrade-content-old-price-halfyear = La tarife di prime e jere di { $paymentAmountOld } par sîs mês.
subscriptionUpgrade-content-old-price-year = La tarife di prime e jere di { $paymentAmountOld } al an.
subscriptionUpgrade-content-old-price-default = La tarife di prime e jere di { $paymentAmountOld } par dade di faturazion.
subscriptionUpgrade-content-old-price-day-tax = La tarife di prime e jere di { $paymentAmountOld } + { $paymentTaxOld } di tassis al dì.
subscriptionUpgrade-content-old-price-week-tax = La tarife di prime e jere di { $paymentAmountOld } + { $paymentTaxOld } di tassis a setemane.
subscriptionUpgrade-content-old-price-month-tax = La tarife di prime e jere di { $paymentAmountOld } + { $paymentTaxOld } di tassis al mês.
subscriptionUpgrade-content-old-price-halfyear-tax = La tarife di prime e jere di { $paymentAmountOld } + { $paymentTaxOld } di tassis par sîs mês.
subscriptionUpgrade-content-old-price-year-tax = La tarife di prime e jere di { $paymentAmountOld } + { $paymentTaxOld } di tassis al an.
subscriptionUpgrade-content-old-price-default-tax = La tarife di prime e jere di { $paymentAmountOld } + { $paymentTaxOld } di tassis par dade di faturazion.
subscriptionUpgrade-content-new-price-day = Di cumò indevant ti vignaran adebitâts { $paymentAmountNew } al dì, gjavâts i sconts.
subscriptionUpgrade-content-new-price-week = Di cumò indevant ti vignaran adebitâts { $paymentAmountNew } ae setemane, gjavâts i sconts.
subscriptionUpgrade-content-new-price-month = Di cumò indevant ti vignaran adebitâts { $paymentAmountNew } al mês, gjavâts i sconts.
subscriptionUpgrade-content-new-price-halfyear = Di cumò indevant ti vignaran adebitâts { $paymentAmountNew } par sîs mês, gjavâts i sconts.
subscriptionUpgrade-content-new-price-year = Di cumò indevant ti vignaran adebitâts { $paymentAmountNew } al an, gjavâts i sconts.
subscriptionUpgrade-content-new-price-default = Di cumò indevant ti vignaran adebitâts { $paymentAmountNew } par dade di faturazion, gjavâts i sconts.
subscriptionUpgrade-content-new-price-day-dtax = Di cumò indevant, ti vignaran adebitâts { $paymentAmountNew } + { $paymentTaxNew } di tassis al dì, gjavâts i sconts.
subscriptionUpgrade-content-new-price-week-tax = Di cumò indevant ti vignaran adebitâts { $paymentAmountNew } + { $paymentTaxNew } di tassis a setemane, gjavâts i sconts.
subscriptionUpgrade-content-new-price-month-tax = Di cumò indevant ti vignaran adebitâts { $paymentAmountNew } + { $paymentTaxNew } di tassis al mês, gjavâts i sconts.
subscriptionUpgrade-content-new-price-halfyear-tax = Di cumò indevant ti vignaran adebitâts { $paymentAmountNew } + { $paymentTaxNew } di tassis par sîs mês, gjavâts i sconts.
subscriptionUpgrade-content-new-price-year-tax = Di cumò indevant, ti vignaran adebitâts { $paymentAmountNew } + { $paymentTaxNew } di tassis al an, gjavâts i sconts.
subscriptionUpgrade-content-new-price-default-tax = Di cumò indevant ti vignaran adebitâts { $paymentAmountNew } + { $paymentTaxNew } di tassis par dade di faturazion, gjavâts i sconts.
subscriptionUpgrade-existing = Se un dai tiei abonaments esistents si sorepon cun chest inzornament, lu tratarìn e ti inviarìn une e-mail separade cui detais. Se il to gnûf plan al inclût prodots di instalâ, ti mandarìn une e-mail separade cu lis istruzions pe instalazion.
subscriptionUpgrade-auto-renew = Il to abonament si rinovarà in automatic a ogni periodi di faturazion, gjavant il câs che no tu decidis di anulâlu.
subscriptionsPaymentExpired-subject-2 = Il metodi di paiament pai tiei abonaments al è scjadût o al scjât ca di pôc
subscriptionsPaymentExpired-title-2 = Il metodi di paiament al è scjadût o al sta par scjadê
subscriptionsPaymentExpired-content-2 = Il metodi di paiament che tu stâs doprant par chescj abonaments al è scjadût o al sta par scjadê.
subscriptionsPaymentProviderCancelled-subject = Inzornament des informazions di paiament necessari pai abonaments di { -brand-mozilla }
subscriptionsPaymentProviderCancelled-title = Nus displâs, o vin fastidis cul to metodi di paiament
subscriptionsPaymentProviderCancelled-content-detected = O vin rilevât un probleme cul metodi di paiament sielt par chescj abonaments.
subscriptionsPaymentProviderCancelled-content-payment-1 = Al è pussibil che il to metodi di paiament al sedi scjadût o che il to metodi di paiament corint nol sedi inzornât.
