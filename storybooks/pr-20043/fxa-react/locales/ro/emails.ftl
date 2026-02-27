## Non-email strings

session-verify-send-push-title-2 = Te conectezi la { -product-mozilla-account }?
session-verify-send-push-body-2 = Dă clic aici să confirmi că ești tu
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to verify phone ownership when registering a recovery phone
recovery-phone-setup-sms-body = { $code } este codul tău de verificare { -brand-mozilla }. Expiră în 5 minute.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to verify phone ownership when registering a recovery phone
recovery-phone-setup-sms-short-body = Cod de verificare { -brand-mozilla }: { $code }
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for two-step authentication
recovery-phone-signin-sms-body = { $code } este codul tău de recuperare { -brand-mozilla }. Expiră în 5 minute.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for two-step authentication
recovery-phone-signin-sms-short-body = Cod { -brand-mozilla }: { $code }
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for account password reset
recovery-phone-reset-password-sms-body = { $code } este codul tău de recuperare { -brand-mozilla }. Expiră în 5 minute.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for account password reset
recovery-phone-reset-password-short-body = Cod { -brand-mozilla }: { $code }
subplat-header-mozilla-logo-2 = <img data-l10n-name="subplat-mozilla-logo" alt="{ -brand-mozilla } logo">
subplat-footer-mozilla-logo-2 = <img data-l10n-name="mozilla-logo-footer" alt="{ -brand-mozilla } logo">
subplat-automated-email = Acesta este un mesaj automat pe e-mail; dacă l-ai primit din greșeală, nu trebuie să faci nimic.
subplat-privacy-notice = Notificare privind confidențialitatea
subplat-privacy-plaintext = Notificare privind confidențialitatea:
subplat-update-billing-plaintext = { subplat-update-billing }:
# Variables:
#  $email (String) - A user's primary email address
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subplat-explainer-specific-2 = Ai primit acest mesaj pe e-mail deoarece { $email } are un cont { -product-mozilla-account } și te-ai abonat la { $productName }.
# Variables:
#  $email (String) - A user's primary email address
subplat-explainer-reminder-form-2 = Ai primit acest mesaj pe e-mail deoarece { $email } are un cont { -product-mozilla-account }.
subplat-explainer-multiple-2 = Ai primit acest mesaj pe e-mail deoarece { $email } are un cont { -product-mozilla-account } și te-ai abonat la mai multe priduse.
subplat-explainer-was-deleted-2 = Ai primit acest mesaj pe e-mail deoarece { $email } a fost înregistrat pentru un { -product-mozilla-account }.
subplat-manage-account-2 = Gestionează-ți setările { -product-mozilla-account } intrând pe <a data-l10n-name="subplat-account-page">pagina contului</a>.
# Variables:
#  $accountSettingsUrl (String) - URL to Account Settings
subplat-manage-account-plaintext-2 = Gestionează-ți setările { -product-mozilla-account } intrând pe pagina contului tău: { $accountSettingsUrl }
subplat-terms-policy = Termeni și politica de anulare
subplat-terms-policy-plaintext = { subplat-terms-policy }:
subplat-cancel = Anulează abonamentul
subplat-cancel-plaintext = { subplat-cancel }:
subplat-reactivate = Reactivează abonamentul
subplat-reactivate-plaintext = { subplat-reactivate }:
subplat-update-billing = Actualizează informațiile de facturare
subplat-privacy-policy = Politica de confidențialitate { -brand-mozilla }
subplat-privacy-policy-2 = { -product-mozilla-accounts(capitalization: "uppercase") } Notificare privind confidențialitatea
subplat-privacy-policy-plaintext = { subplat-privacy-policy }:
subplat-privacy-policy-plaintext-2 = { subplat-privacy-policy-2 }:
subplat-moz-terms = Condiții de utilizare a serviciilor { -product-mozilla-accounts(capitalization: "uppercase") }
subplat-moz-terms-plaintext = { subplat-moz-terms }:
subplat-legal = Mențiuni legale
subplat-legal-plaintext = { subplat-legal }:
subplat-privacy = Confidențialitate
subplat-privacy-website-plaintext = { subplat-privacy }:
cancellationSurvey = Te rugăm să ne ajuți să ne îmbunătățim serviciile participând la acest <a data-l10n-name="cancellationSurveyUrl">scurt sondaj</a>.
# After the colon, there's a link to https://survey.alchemer.com/s3/6534408/Privacy-Security-Product-Cancellation-of-Service-Q4-21
cancellationSurvey-plaintext = Te rugăm să ne ajuți să ne îmbunătățim serviciile participând la acest scurt sondaj:
payment-details = Detalii de plată:
# Variables:
#  $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
payment-plan-invoice-number = Număr factură: { $invoiceNumber }
# Variables:
#  $invoiceDateOnly (String) - The date of the invoice, e.g. 01/20/2016
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
payment-plan-charged = Debitat: { $invoiceTotal } la data de { $invoiceDateOnly }
# Variables
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
payment-plan-next-invoice = Următoarea factură: { $nextInvoiceDateOnly }

## $paymentProviderName (String) - The brand name of the payment method, e.g. PayPal, Apple Pay, Google Pay, Link

payment-method-payment-provider = <b>Metodă de plată:</b> { $paymentProviderName }
payment-method-payment-provider-plaintext = Metodă de plată: { $paymentProviderName }

## This string displays when the type of credit card is known
## https://stripe.com/docs/payments/cards/supported-card-brands
## Variables:
##  $cardName (String) - The brand name of the credit card, e.g. American Express
##  $lastFour (String) - The last four digits of the credit card, e.g. 5309

payment-provider-card-name-ending-in-plaintext = Metodă de plată: { $cardName } care se termină în { $lastFour }
payment-provider-card-ending-in-plaintext = Metodă de plată: Card care se termină în { $lastFour }
payment-provider-card-ending-in = <b>Metodă de plată:</b> Card care se termină în { $lastFour }
payment-provider-card-ending-in-card-name = <b>Metodă de plată:</b> { $cardName } care se termină în { $lastFour }
subscription-charges-invoice-summary = Rezumatul facturii

# Variables:


## $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
## $invoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025

subscription-charges-invoice-number = <b>Număr factură:</b> { $invoiceNumber }
subscription-charges-invoice-number-plaintext = Număr factură: { $invoiceNumber }
subscription-charges-invoice-date = <b>Data:</b> { $invoiceDateOnly }
subscription-charges-invoice-date-plaintext = Data: { $invoiceDateOnly }
subscription-charges-prorated-price = Preț proporțional
# $remainingAmountTotal (String) - The prorated amount of the subscription invoice, including currency, e.g. $4.00
subscription-charges-prorated-price-plaintext = Preț proporțional: { $remainingAmountTotal }
subscription-charges-list-price = Preț de listă
# $offeringPrice (String) - The list price of the subscription offering, including currency, e.g. $10.00
subscription-charges-list-price-plaintext = Preț de listă: { $offeringPrice }
subscription-charges-credit-from-unused-time = Credit din timpul neutilizat
# $unusedAmountTotal (String) - The credit amount from unused time of the subscription invoice, including currency, e.g. $2.00
subscription-charges-credit-from-unused-time-plaintext = Credit din timpul neutilizat: { $unusedAmountTotal }
subscription-charges-subtotal = <b>Subtotal</b>
# $invoiceSubtotal (String) - The amount, before discount, of the subscription invoice, including currency, e.g. $10.00
subscriptionFirstInvoiceDiscount-content-subtotal = Subtotal: { $invoiceSubtotal }

## $invoiceDiscountAmount (String) - The amount of the discount of the subscription invoice, including currency, e.g. $2.00
## $discountDuration - The duration of the discount in number of months, e.g. "3" if the discount is 3-months

subscription-charges-one-time-discount = Reducere unică
subscription-charges-one-time-discount-plaintext = Reducere unică: -{ $invoiceDiscountAmount }
subscription-charges-repeating-discount =
    { $discountDuration ->
        [one] Reducere de { $discountDuration } lună
        [few] Reducere de { $discountDuration } luni
       *[other] Reducere de { $discountDuration } de luni
    }
subscription-charges-repeating-discount-plaintext =
    { $discountDuration ->
        [one] Reducere de { $discountDuration } lună: { $invoiceDiscountAmount }
        [few] Reducere de { $discountDuration } luni: { $invoiceDiscountAmount }
       *[other] Reducere de { $discountDuration } de luni: { $invoiceDiscountAmount }
    }
subscription-charges-discount = Reducere
subscription-charges-discount-plaintext = Reducere: { $invoiceDiscountAmount }
subscription-charges-taxes = Taxe și comisioane
# $invoiceTaxAmount (String) - The amount of the tax of the subscription invoice, including currency, e.g. $2.00
subscriptionCharges-content-tax-plaintext = Taxe și comisioane: { $invoiceTaxAmount }
subscription-charges-total = <b>Total</b>
# $invoiceTotal (String) - The total amount of the subscription invoice, including currency, e.g. $10.00
subscription-charges-total-plaintext = Total: { $invoiceTotal }
subscription-charges-credit-applied = Credit aplicat
# $creditApplied (String) - The amount of credit applied to the subscription invoice, including currency, e.g. $2.00
subscription-charges-credit-applied-plaintext = Credit aplicat: { $creditApplied }
subscription-charges-amount-paid = <b>Sumă achitată</b>
# $invoiceAmountDue (String) - The total that the customer owes after all credits, discounts, and taxes have been applied, including currency, e.g. $8.00
subscription-charges-amount-paid-plaintext = Sumă achitată: { $invoiceAmountDue }
# $creditReceived (String) - The amount, after discount, of the subscription invoice, including currency, e.g. $8.00
subscription-charges-credit-received = Ai primit un credit în cont de { $creditReceived }, care va fi aplicat facturilor viitoare.

##

subscriptionSupport = Ai întrebări despre abonament? <a data-l10n-name="subscriptionSupportUrl">Echipa de asistență</a> este aici ca să te ajute.
# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupport-plaintext = Întrebări despre abonament? Echipa noastră de asistență este aici pentru a te ajuta:
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSupportContact = Îți mulțumim că te-ai abonat la { $productName }. Dacă ai întrebări despre abonament sau vrei mai multe informații despre { $productName }, <a data-l10n-name="subscriptionSupportUrl">contactează-ne</a>.
# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupportContact-plaintext = Îți mulțumim că te-ai abonat la { $productName }. Dacă ai întrebări despre abonament sau vrei mai multe informații despre { $productName }, contactează-ne.
subscription-support-get-help = Obține ajutor pentru abonament
subscription-support-manage-your-subscription = <a data-l10n-name="manageSubscriptionUrl">Gestionează-ți abonamentul</a>
# After the colon, there's a link to https://payments.firefox.com/subscriptions
subscription-support-manage-your-subscription-plaintext = Gestionează-ți abonamentul:
subscription-support-contact-support = <a data-l10n-name="subscriptionSupportUrl">Contactează asistența</a>
# After the colon, there's a link to https://support.mozilla.com/products
subscription-support-contact-support-plaintext = Contactează serviciul de asistență:
subscriptionUpdateBillingEnsure = Te poți asigura că metoda de plată și informațiile contului sunt la zi <a data-l10n-name="updateBillingUrl">aici</a>.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdateBillingEnsure-plaintext = Te poți asigura că metoda de plată și informațiile contului sunt la zi aici:
subscriptionUpdateBillingTry = Vom încerca din nou plata în următoarele zile, dar este posibil să fie nevoie să ne ajuți să remediem problema <a data-l10n-name="updateBillingUrl">actualizând informațiile de plată</a>.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdateBillingTry-plaintext = Vom încerca din nou plata în următoarele zile, dar este posibil să fie nevoie să ne ajuți să remediem problema actualizând informațiile de plată.
subscriptionUpdatePayment = Pentru a preveni orice întrerupere a serviciului, <a data-l10n-name="updateBillingUrl">actualizează-ți informațiile de plată</a> cât mai curând posibil.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdatePayment-plaintext = Pentru a preveni orice întrerupere a serviciului, actualizează-ți informațiile de plată cât mai curând posibil:
view-invoice-link-action = Vezi factura
# Variables:
#  $invoiceLink (String) - The link to the invoice
# After the colon, there's a link to https://pay.stripe.com/
view-invoice-plaintext = Vezi factura: { $invoiceLink }
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-subject = Bine ai venit la { $productName }
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-title = Bine ai venit la { $productName }
downloadSubscription-content-2 = Hai să începem să folosim toate funcționalitățile incluse în abonamentul tău:
downloadSubscription-link-action-2 = Începe
fraudulentAccountDeletion-subject-2 = Contul tău { -product-mozilla-account } a fost șters
fraudulentAccountDeletion-title = Contul tău a fost șters
fraudulentAccountDeletion-content-part1-v2 = Recent, a fost creat un { -product-mozilla-account } și a fost facturat un abonament folosind această adresă de e-mail. Așa cum procedăm cu toate conturile noi, te-am rugat să îți confirmi contul validând mai întâi această adresă de e-mail.
fraudulentAccountDeletion-content-part2-v2 = Vedem acum că acel cont nu a fost niciodată confirmat. Cum nu a fost finalizat acest pas, nu suntem siguri dacă a fost un abonament autorizat. Drept urmare, { -product-mozilla-account } înregistrat cu această adresă de e-mail a fost șters, iar abonamentul a fost anulat, toate taxele fiind rambursate.
fraudulentAccountDeletion-contact = Pentru orice întrebări, contactează <a data-l10n-name="mozillaSupportUrl">echipa de asistență</a>.
# Variables:
#  $mozillaSupportUrl (String) - Link to https://support.mozilla.org
fraudulentAccountDeletion-contact-plaintext = Pentru orice întrebări, contactează echipa de asistență: { $mozillaSupportUrl }
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountDeletion-subject = Abonamentul { $productName } a fost anulat
subscriptionAccountDeletion-title = Ne pare rău că pleci
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $invoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
subscriptionAccountDeletion-content-cancelled-2 = Ți-ai șters recent { -product-mozilla-account }. Prin urmare, ți-am anulat abonamentul { $productName }. Factura finală { $invoiceTotal } a fost achitată la data de { $invoiceDateOnly }.
subscriptionAccountReminderFirst-subject = Memento: Finalizează configurarea contului
subscriptionAccountReminderFirst-title = Încă nu poți accesa abonamentul
subscriptionAccountReminderFirst-content-info-3 = Acum câteva zile ai creat un cont { -product-mozilla-account }, dar nu l-ai confirmat niciodată. Sperăm că vei termina configurarea contului, astfel încât să poți utiliza noul abonament.
subscriptionAccountReminderFirst-content-select-2 = Selectează „Creează parolă” pentru a configura o parolă nouă și ca să finalizezi confirmarea contului.
subscriptionAccountReminderFirst-action = Creează parola
subscriptionAccountReminderFirst-action-plaintext = { subscriptionAccountReminderFirst-action }:
subscriptionAccountReminderSecond-subject = Ultima reamintire: Configurează contul
subscriptionAccountReminderSecond-title-2 = Bine ai venit la { -brand-mozilla }!
subscriptionAccountReminderSecond-content-info-3 = Acum câteva zile ai creat un cont { -product-mozilla-account }, dar nu l-ai confirmat niciodată. Sperăm că vei termina configurarea contului, astfel încât să poți utiliza noul abonament.
subscriptionAccountReminderSecond-content-select-2 = Selectează „Creează parolă” pentru a configura o parolă nouă și ca să finalizezi confirmarea contului.
subscriptionAccountReminderSecond-action = Creează parola
subscriptionAccountReminderSecond-action-plaintext = { subscriptionAccountReminderSecond-action }:
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionCancellation-subject = Abonamentul la { $productName } a fost anulat
subscriptionCancellation-title = Ne pare rău că pleci

## Variables
##   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
##   $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
##   $invoiceDateOnly (String) - The date of the invoice, e.g. 01/20/2016

subscriptionCancellation-content-2 = Ți-am anulat abonamentul la { $productName }. Plata finală de { $invoiceTotal } a fost efectuată pe data de { $invoiceDateOnly }.
subscriptionCancellation-outstanding-content-2 = Ți-am anulat abonamentul la { $productName }. Plata finală de { $invoiceTotal } va fi efectuată pe data de { $invoiceDateOnly }.
# Variables
#   $serviceLastActiveDateOnly (String) - The date of last active service, e.g. 01/20/2016
subscriptionCancellation-content-continue = Serviciul va continua până la sfârșitul perioadei de facturare curente, care este { $serviceLastActiveDateOnly }.
# Variables:
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-subject = Ai trecut la { $productName }
# Variables:
# $productNameOld (String) - The name of the previously subscribed product, e.g. Mozilla VPN
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-content-switch = Ai trecut cu succes de la { $productNameOld } la { $productName }.
# Variables:
# $paymentAmountOld (String) - The amount of the previous subscription payment, including currency, e.g. $10.00
# $paymentAmountNew (String) - The amount of the new subscription payment, including currency, e.g. $10.00
# $productPaymentCycleNew (String) - The interval of time from the end of one payment statement date to the next payment statement date of the new subscription, e.g. month
# $productPaymentCycleOld (String) - The interval of time from the end of one payment statement date to the next payment statement date of the old subscription, e.g. month
# $paymentProrated (String) - The one time fee to reflect the higher charge for the remainder of the payment cycle, including currency, e.g. $10.00
subscriptionDowngrade-content-charge-info = Începând cu următoarea factură, tariful se va modifica din { $paymentAmountOld } pe{ $productPaymentCycleOld } în { $paymentAmountNew } pe { $productPaymentCycleNew }. Tot atunci vei primi un credit unic de { $paymentProrated } care să reflecte tariful mai mic pentru restul acestei{ $productPaymentCycleOld }.
# Variables:
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-content-install = Dacă trebuie să instalezi software nou ca să folosești { $productName }, vei primi un mesaj separat pe e-mail cu instrucțiunile de descărcare.
subscriptionDowngrade-content-auto-renew = Abonamentul se va reînnoi automat cu o perioadă de facturare, cu excepția cazului în care alegi să îl anulezi.
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionEndingReminder-subject = Abonamentul la { $productName } va expira în curând
subscriptionEndingReminder-title = Abonamentul la { $productName } va expira în curând
# Variables:
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
#   $serviceLastActiveDateOnly (String) - The date of last active service, e.g. 01/20/2016
subscriptionEndingReminder-content-line1 = Accesul la { $productName } se va încheia pe data de <strong>{ $serviceLastActiveDateOnly }</strong>.
subscriptionEndingReminder-content-line2 = Dacă vrei să folosești în continuare { $productName }, îți poți reactiva abonamentul în<a data-l10n-name="subscriptionEndingReminder-account-settings">Setările contului</a> până pe<strong>{ $serviceLastActiveDateOnly }</strong>. Dacă ai nevoie de asistență, <a data-l10n-name="subscriptionEndingReminder-contact-support">contactează Echipa noastră de asistență</a>.
subscriptionEndingReminder-content-line1-plaintext = Accesul la { $productName } se va încheia pe data de { $serviceLastActiveDateOnly }.
subscriptionEndingReminder-content-line2-plaintext = Dacă vrei să folosești în continuare { $productName }, îți poți reactiva abonamentul în Setările contului până pe { $serviceLastActiveDateOnly }. Dacă ai nevoie de asistență, contactează Echipa noastră de asistență.
subscriptionEndingReminder-content-closing = Îți mulțumim că ești un abonat valoros!
subscriptionEndingReminder-churn-title = Vrei să păstrezi accesul?
subscriptionEndingReminder-churn-terms = <a data-l10n-name="subscriptionEndingReminder-churn-terms">Se aplică condiții de limitare și restricții</a>
# Variables:
#  $churnTermsUrlWithUtm (String) - URL to the terms and restrictions page applied to this promotion
subscriptionEndingReminder-churn-terms-plaintext = Se aplică condiții de limitare și restricții: { $churnTermsUrlWithUtm }
# Variables:
#  $subscriptionSupportUrlWithUtm (String) - URL to the subscription products support page
subscriptionEndingReminder-content-support-plaintext = Ia legătura cu echipa noastră de asistență: { $subscriptionSupportUrlWithUtm }
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFailedPaymentsCancellation-subject = Abonamentul { $productName } a fost anulat
subscriptionFailedPaymentsCancellation-title = Abonamentul a fost anulat
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFailedPaymentsCancellation-content = Ți-am anulat abonamentul la { $productName } pentru că au eșuat mai multe încercări de plată. Pentru a obține iar accesul, fă-ți un abonament nou cu o metodă de plată actualizată.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-subject = Plată confirmată pentru { $productName }
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-title = Îți mulțumim că te-ai abonat la { $productName }
subscriptionFirstInvoice-content-processing = Plata efectuată este în procesare și poate dura până la patru zile lucrătoare.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-content-install-2 = Vei primi un mesaj nou pe e-mail despre cum să începi să utilizezi { $productName }.
subscriptionFirstInvoice-content-auto-renew = Abonamentul se va reînnoi automat cu o perioadă de facturare, cu excepția cazului în care alegi să îl anulezi.
# Variables:
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025
subscriptionFirstInvoice-content-your-next-invoice = Următoarea factură va fi emisă pe data de { $nextInvoiceDateOnly }.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentExpired-subject-2 = Metodă de plată pentru { $productName } expirată sau care expiră în curând
subscriptionPaymentExpired-title-2 = Metoda ta de plată a expirat sau va expira în curând
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentExpired-content-2 = Metoda de plată pe care o folosești pentru { $productName } este expirată sau va expira în curând.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-subject = Plata pentru { $productName } a eșuat
subscriptionPaymentFailed-title = Ne pare rău, întâmpinăm probleme cu plata ta
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-content-problem = Am întâmpinat o problemă cu ultima ta plată pentru { $productName }.
subscriptionPaymentFailed-content-outdated-1 = Este posibil să îți fi expirat metoda de plată sau ca metoda de plată actuală să nu mai fie de actualitate.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentProviderCancelled-subject = Este necesară actualizarea informațiilor de plată pentru { $productName }
subscriptionPaymentProviderCancelled-title = Ne pare rău, întâmpinăm probleme cu metoda ta de plată
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentProviderCancelled-content-detect = Am detectat o problemă cu metoda ta de plată pentru { $productName }.
subscriptionPaymentProviderCancelled-content-reason-1 = Este posibil să îți fi expirat metoda de plată sau ca metoda de plată actuală să nu mai fie de actualitate.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-subject = Abonamentul pentru { $productName } a fost reactivat
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-title = Îți mulțumim că ți-ai reactivat abonamentul pentru { $productName }!
# Variables:
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. 2016/01/20
subscriptionReactivation-content = Ciclul tău de facturare și plăți va rămâne același. Următoarea sumă percepută va fi de { $invoiceTotal } la data de { $nextInvoiceDateOnly }. Abonamentul tău se va reînnoi automat la fiecare perioadă de facturare dacă nu optezi pentru anularea lui.
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-subject = Notificare de reînnoire automată a abonamentului pentru { $productName }
subscriptionRenewalReminder-title = Abonamentul va fi reînnoit în curând
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-greeting = Dragă client { $productName },
# Variables
#   $reminderLength (String) - The number of days until the current subscription is set to automatically renew, e.g. 14
subscriptionRenewalReminder-content-intro = Abonamentul actual este setat cu reînnoire automată la { $reminderLength } (de) zile.
subscriptionRenewalReminder-content-discount-change = Următoarea factură reflectă o modificare a prețului, deoarece s-a încheiat o reducere anterioară și a fost aplicată o reducere nouă.
subscriptionRenewalReminder-content-discount-ending = Pentru că a expirat o reducere anterioară, abonamentul se va reînnoi la prețul standard.
# Variables
#   $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#   $planIntervalCount (String) - The interval count of subscription plan, e.g. 2
#   $planInterval (String) - The interval of time of the subscription plan, e.g. week
# Tells the customer that their subscription price will change at the end of the current billing cycle
subscriptionRenewalReminder-content-charge = Atunci, { -brand-mozilla } îți va reînnoi abonamentul { $planIntervalCount } { $planInterval } și se va aplica un tarif de { $invoiceTotal } la metoda de plată din contul tău.
subscriptionRenewalReminder-content-closing = Salutări,
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-signature = Echipa { $productName }
subscriptionReplaced-subject = Abonamentul a fost actualizat ca parte a trecerii la o versiune superioară
subscriptionReplaced-title = Abonamentul a fost actualizat
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReplaced-content-replaced = Abonamentul tău individual { $productName } a fost înlocuit și acum este inclus în noul pachet.
subscriptionReplaced-content-credit = Vei primi un credit pentru timpul neutilizat din abonamentul anterior. Acest credit va fi aplicat automat contului tău și utilizat pentru plăți viitoare.
subscriptionReplaced-content-no-action = Nu necesită nicio acțiune din partea ta.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSubsequentInvoice-subject = Plată primită pentru { $productName }
subscriptionSubsequentInvoice-title = Îți mulțumim că te-ai abonat!
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSubsequentInvoice-content-received = Am primit ultima plată pentru { $productName }.
# Variables:
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025
subscriptionSubsequentInvoice-content-your-next-invoice = Următoarea factură va fi emisă pe data de { $nextInvoiceDateOnly }.
# Variables:
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionUpgrade-subject = Ai trecut la o versiune superioară de { $productName }
subscriptionUpgrade-title = Îți mulțumim că ai trecut la noua versiune!
# Variables:
# $productNameOld (String) - The name of the previously subscribed product, e.g. Mozilla VPN
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionUpgrade-upgrade-info-2 = Ai trecut cu succes la versiunea superioară de { $productName }.

## Variables:
## $paymentAmountOld (String) - The amount of the previous subscription payment, including currency, e.g. $10.00
## $paymentAmountNew (String) - The amount of the new subscription payment, including currency, e.g. $10.00
## $paymentTaxOld (String) - The tax amount of the previous subscription payment, including currency, e.g. $1.00
## $paymentTaxNew (String) - The tax amount of the new subscription payment, including currency, e.g. $1.00
## $productPaymentCycleNew (String) - The interval of time from the end of one payment statement date to the next payment statement date of the new subscription, e.g. month
## $productPaymentCycleOld (String) - The interval of time from the end of one payment statement date to the next payment statement date of the old subscription, e.g. month
## $invoiceAmountDue (String) - The total that the customer owes after all credits, discounts, and taxes have been applied
## $paymentProrated (String) - The one time fee to reflect the higher charge for the remainder of the payment cycle, including currency, e.g. $10.00

subscriptionUpgrade-content-charge-prorated-1 = Ți s-a perceput o taxă unică de { $invoiceAmountDue } pentru a reflecta prețul mai mare al abonamentului pentru restul acestei perioade de facturare ({ $productPaymentCycleOld }).
subscriptionUpgrade-content-charge-credit = Ai primit un credit în cont în valoare de { $paymentProrated }.
subscriptionUpgrade-content-subscription-next-bill-change = Începând cu următoarea factură, prețul abonamentului se va schimba.
subscriptionUpgrade-content-old-price-day = Tariful anterior era de { $paymentAmountOld } pe zi.
subscriptionUpgrade-content-old-price-week = Tariful anterior era de { $paymentAmountOld } pe săptămână.
subscriptionUpgrade-content-old-price-month = Tariful anterior era de { $paymentAmountOld } pe lună.
subscriptionUpgrade-content-old-price-halfyear = Tariful anterior era de { $paymentAmountOld } pe șase luni.
subscriptionUpgrade-content-old-price-year = Tariful anterior era de { $paymentAmountOld } pe an.
subscriptionUpgrade-content-old-price-default = Tariful anterior era de { $paymentAmountOld } pe perioadă de facturare.
subscriptionUpgrade-content-old-price-day-tax = Tariful anterior era de { $paymentAmountOld } + { $paymentTaxOld } taxe pe zi.
subscriptionUpgrade-content-old-price-week-tax = Tariful anterior era de { $paymentAmountOld } + { $paymentTaxOld } taxe pe săptămână.
subscriptionUpgrade-content-old-price-month-tax = Tariful anterior era de { $paymentAmountOld } + { $paymentTaxOld } taxe pe lună.
subscriptionUpgrade-content-old-price-halfyear-tax = Tariful anterior era de { $paymentAmountOld } + { $paymentTaxOld } taxe pe șase luni.
subscriptionUpgrade-content-old-price-year-tax = Tariful anterior era de { $paymentAmountOld } + { $paymentTaxOld } taxe pe an.
subscriptionUpgrade-content-old-price-default-tax = Tariful anterior era de { $paymentAmountOld } + { $paymentTaxOld } taxe pe perioadă de facturare.
subscriptionUpgrade-content-new-price-day = De acum înainte, ți se va factura { $paymentAmountNew } pe zi, excluzând reducerile.
subscriptionUpgrade-content-new-price-week = De acum înainte, ți se va factura { $paymentAmountNew } pe săptămână, excluzând reducerile.
subscriptionUpgrade-content-new-price-month = De acum înainte, ți se va factura { $paymentAmountNew } pe lună, excluzând reducerile.
subscriptionUpgrade-content-new-price-halfyear = De acum înainte, ți se va factura { $paymentAmountNew } pe șase luni, excluzând reducerile.
subscriptionUpgrade-content-new-price-year = De acum înainte, ți se va factura { $paymentAmountNew } pe an, excluzând reducerile.
subscriptionUpgrade-content-new-price-default = De acum înainte, ți se va factura { $paymentAmountNew } pe perioadă de facturare, excluzând reducerile.
subscriptionUpgrade-content-new-price-day-dtax = De acum înainte, ți se va factura { $paymentAmountNew } + { $paymentTaxNew } taxe pe zi, excluzând reducerile.
subscriptionUpgrade-content-new-price-week-tax = De acum înainte, ți se va factura { $paymentAmountNew } + { $paymentTaxNew } taxe pe săptămână, excluzând reducerile.
subscriptionUpgrade-content-new-price-month-tax = De acum înainte, ți se va factura { $paymentAmountNew } + { $paymentTaxNew } taxe pe lună, excluzând reducerile.
subscriptionUpgrade-content-new-price-halfyear-tax = De acum înainte, ți se va factura { $paymentAmountNew } + { $paymentTaxNew } taxe pe șase luni, excluzând reducerile.
subscriptionUpgrade-content-new-price-year-tax = De acum înainte, ți se va factura { $paymentAmountNew } + { $paymentTaxNew } taxe pe an, excluzând reducerile.
subscriptionUpgrade-content-new-price-default-tax = De acum înainte, ți se va factura { $paymentAmountNew } + { $paymentTaxNew } taxe pe perioadă de facturare, excluzând reducerile.
subscriptionUpgrade-existing = Dacă oricare dintre abonamentele tale existente se suprapune cu această trecere la o versiune superioară, le vom gestiona și îți vom trimite un mesaj separat pe e-mail cu detaliile. Dacă noul tău plan include produse care necesită instalare, îți vom trimite un mesaj separat pe e-mail cu instrucțiuni de configurare.
subscriptionUpgrade-auto-renew = Abonamentul se va reînnoi automat cu o perioadă de facturare, cu excepția cazului în care alegi să îl anulezi.
subscriptionsPaymentExpired-subject-2 = Metoda de plată pentru abonamentele tale a expirat sau va expira în curând
subscriptionsPaymentExpired-title-2 = Metoda ta de plată a expirat sau va expira în curând
subscriptionsPaymentExpired-content-2 = Metoda de plată pe care o folosești pentru plățile pentru următoarele abonamente a expirat sau va expira în curând.
subscriptionsPaymentProviderCancelled-subject = Este necesară actualizarea informațiilor de plată pentru abonamentele { -brand-mozilla }
subscriptionsPaymentProviderCancelled-title = Ne pare rău, întâmpinăm probleme cu metoda ta de plată
subscriptionsPaymentProviderCancelled-content-detected = Am detectat o problemă cu metoda ta de plată pentru următoarele abonamente.
subscriptionsPaymentProviderCancelled-content-payment-1 = Este posibil să îți fi expirat metoda de plată sau ca metoda de plată actuală să nu mai fie de actualitate.
