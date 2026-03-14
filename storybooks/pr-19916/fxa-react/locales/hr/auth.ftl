## Non-email strings

session-verify-send-push-title-2 = Prijaviti se na tvoj { -product-mozilla-account }?
session-verify-send-push-body-2 = Pritisni ovdje da potvrdiš da si to ti
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to verify phone ownership when registering a recovery phone
recovery-phone-setup-sms-body = { $code } je tvoj { -brand-mozilla } verifikacijski kod. Vrijedi 5 minuta.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to verify phone ownership when registering a recovery phone
recovery-phone-setup-sms-short-body = { -brand-mozilla } verifikacijski kod: { $code }
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for two-step authentication
recovery-phone-signin-sms-body = { $code } je tvoj { -brand-mozilla } kod za obnavljanje. Vrijedi 5 minuta.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for two-step authentication
recovery-phone-signin-sms-short-body = { -brand-mozilla } kod: { $code }
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for account password reset
recovery-phone-reset-password-sms-body = { $code } je tvoj { -brand-mozilla } kod za obnavljanje. Vrijedi 5 minuta.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for account password reset
recovery-phone-reset-password-short-body = { -brand-mozilla } kod: { $code }
subplat-header-mozilla-logo-2 = <img data-l10n-name="subplat-mozilla-logo" alt="{ -brand-mozilla } logotip">
subplat-footer-mozilla-logo-2 = <img data-l10n-name="mozilla-logo-footer" alt="{ -brand-mozilla } logotip">
subplat-automated-email = Ovo je automatski e-mail; ako si ga dobio/la greškom, nije potrebna nikakva radnja.
subplat-privacy-notice = Napomene o privatnosti
subplat-privacy-plaintext = Napomene o privatnosti:
subplat-update-billing-plaintext = { subplat-update-billing }:
# Variables:
#  $email (String) - A user's primary email address
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subplat-explainer-specific-2 = Dobio/la si ovu e-mail poruku jer { $email } ima { -product-mozilla-account } i jer si se prijavio/la za { $productName }.
# Variables:
#  $email (String) - A user's primary email address
subplat-explainer-reminder-form-2 = Dobio/la si ovu e-mail poruku jer { $email } ima { -product-mozilla-account }.
subplat-explainer-multiple-2 = Dobio/la si ovu e-mail poruku jer { $email } ima { -product-mozilla-account } i jer si se pretplatio/la na više proizvoda.
subplat-explainer-was-deleted-2 = Dobio/la si ovu e-mail poruku jer je { $email } registriran za { -product-mozilla-account }.
subplat-manage-account-2 = Upravljaj svojim { -product-mozilla-account } postavkama na <a data-l10n-name="subplat-account-page">stranici tvog računa</a>.
# Variables:
#  $accountSettingsUrl (String) - URL to Account Settings
subplat-manage-account-plaintext-2 = Upravljaj svojim { -product-mozilla-account } postavkama na stranici tvog računa: { $accountSettingsUrl }
subplat-terms-policy = Uvjeti i politika otkazivanja
subplat-terms-policy-plaintext = { subplat-terms-policy }:
subplat-cancel = Otkaži pretplatu
subplat-cancel-plaintext = { subplat-cancel }:
subplat-reactivate = Ponovo aktiviraj pretplatu
subplat-reactivate-plaintext = { subplat-reactivate }:
subplat-update-billing = Aktualiziraj podatke naplate
subplat-privacy-policy = { -brand-mozilla } politika privatnosti
subplat-privacy-policy-2 = { -product-mozilla-accounts(capitalization: "uppercase") } napomene o privatnosti
subplat-privacy-policy-plaintext = { subplat-privacy-policy }:
subplat-privacy-policy-plaintext-2 = { subplat-privacy-policy-2 }:
subplat-moz-terms = Uvjeti usluge za { -product-mozilla-accounts(capitalization: "uppercase") }
subplat-moz-terms-plaintext = { subplat-moz-terms }:
subplat-legal = Pravno
subplat-legal-plaintext = { subplat-legal }:
subplat-privacy = Privatnost
subplat-privacy-website-plaintext = { subplat-privacy }:
cancellationSurvey = Pomogni nam poboljšati naše usluge ispunjavanjem ove <a data-l10n-name="cancellationSurveyUrl">kratke ankete</a>.
# After the colon, there's a link to https://survey.alchemer.com/s3/6534408/Privacy-Security-Product-Cancellation-of-Service-Q4-21
cancellationSurvey-plaintext = Pomogni nam u poboljšanju naših usluga ispunjavanjem ove kratke ankete:
payment-details = Podaci o plaćanju:
# Variables:
#  $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
payment-plan-invoice-number = Broj računa: { $invoiceNumber }
# Variables:
#  $invoiceDateOnly (String) - The date of the invoice, e.g. 01/20/2016
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
payment-plan-charged = Naplaćeno: { $invoiceTotal }, { $invoiceDateOnly }
# Variables
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
payment-plan-next-invoice = Sljedeći račun: { $nextInvoiceDateOnly }

## $paymentProviderName (String) - The brand name of the payment method, e.g. PayPal, Apple Pay, Google Pay, Link

payment-method-payment-provider = <b>Način plaćanja:</b> { $paymentProviderName }
payment-method-payment-provider-plaintext = Način plaćanja: { $paymentProviderName }

## This string displays when the type of credit card is known
## https://stripe.com/docs/payments/cards/supported-card-brands
## Variables:
##  $cardName (String) - The brand name of the credit card, e.g. American Express
##  $lastFour (String) - The last four digits of the credit card, e.g. 5309

payment-provider-card-name-ending-in-plaintext = Način plaćanja: { $cardName } kartica završava s { $lastFour }
payment-provider-card-ending-in-plaintext = Način plaćanja: Kartica završava s { $lastFour }
payment-provider-card-ending-in = <b>Način plaćanja:</b> Kartica završava s { $lastFour }
payment-provider-card-ending-in-card-name = <b>Način plaćanja:</b> { $cardName } kartica završava s { $lastFour }
subscription-charges-invoice-summary = Sažetak računa

# Variables:


## $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
## $invoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025

subscription-charges-invoice-number = <b>Broj računa:</b> { $invoiceNumber }
subscription-charges-invoice-number-plaintext = Broj računa: { $invoiceNumber }
subscription-charges-invoice-date = <b>Datum:</b> { $invoiceDateOnly }
subscription-charges-invoice-date-plaintext = Datum: { $invoiceDateOnly }
subscription-charges-prorated-price = Proporcionalni udio cijene
# $remainingAmountTotal (String) - The prorated amount of the subscription invoice, including currency, e.g. $4.00
subscription-charges-prorated-price-plaintext = Proporcionalni udio cijene: { $remainingAmountTotal }
subscription-charges-list-price = Cijena prema cjeniku
# $offeringPrice (String) - The list price of the subscription offering, including currency, e.g. $10.00
subscription-charges-list-price-plaintext = Cijena prema cjeniku: { $offeringPrice }
subscription-charges-subtotal = <b>Podzbroj</b>
# $invoiceSubtotal (String) - The amount, before discount, of the subscription invoice, including currency, e.g. $10.00
subscriptionFirstInvoiceDiscount-content-subtotal = Podzbroj: { $invoiceSubtotal }

## $invoiceDiscountAmount (String) - The amount of the discount of the subscription invoice, including currency, e.g. $2.00
## $discountDuration - The duration of the discount in number of months, e.g. "3" if the discount is 3-months

subscription-charges-one-time-discount = Jednokratni popust
subscription-charges-one-time-discount-plaintext = Jednokratni popust: { $invoiceDiscountAmount }
subscription-charges-repeating-discount =
    { $discountDuration ->
        [one] Popust za { $discountDuration } mjesec
        [few] Popust za { $discountDuration } mjeseca
       *[other] Popust za { $discountDuration } mjeseci
    }
subscription-charges-repeating-discount-plaintext =
    { $discountDuration ->
       *[other] Popust za { $discountDuration } mjeseca: { $invoiceDiscountAmount }
    }
subscription-charges-discount = Popust
subscription-charges-discount-plaintext = Popust: { $invoiceDiscountAmount }
subscription-charges-taxes = Porezi i naknade
# $invoiceTaxAmount (String) - The amount of the tax of the subscription invoice, including currency, e.g. $2.00
subscriptionCharges-content-tax-plaintext = Porezi i naknade: { $invoiceTaxAmount }
subscription-charges-total = <b>Ukupno</b>
# $invoiceTotal (String) - The total amount of the subscription invoice, including currency, e.g. $10.00
subscription-charges-total-plaintext = Ukupno: { $invoiceTotal }
subscription-charges-amount-paid = <b>Plaćeni iznos</b>
# $invoiceAmountDue (String) - The total that the customer owes after all credits, discounts, and taxes have been applied, including currency, e.g. $8.00
subscription-charges-amount-paid-plaintext = Plaćeni iznos: { $invoiceAmountDue }

##

subscriptionSupport = Imaš pitanja o tvojoj pretplati? Naš <a data-l10n-name="subscriptionSupportUrl">tim za podršku</a> ti može pomoći.
# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupport-plaintext = Pitanja o tvojoj pretplati? Naš tim za podršku spreman je pomoći:
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSupportContact = Hvala ti pretplati na { $productName }. Ako imaš pitanja o svojoj pretplati ili ako trebaš više informacija o { $productName }, <a data-l10n-name="subscriptionSupportUrl">kontaktiraj nas</a>.
# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupportContact-plaintext = Hvala ti pretplati na { $productName }. Ako imaš pitanja o svojoj pretplati ili ako trebaš više informacija o { $productName }, kontaktiraj nas:
subscription-support-manage-your-subscription = <a data-l10n-name="manageSubscriptionUrl">Upravljaj svojom pretplatom</a>
# After the colon, there's a link to https://payments.firefox.com/subscriptions
subscription-support-manage-your-subscription-plaintext = Upravljaj svojom pretplatom:
subscription-support-contact-support = <a data-l10n-name="subscriptionSupportUrl">Kontaktiraj podršku</a>
# After the colon, there's a link to https://support.mozilla.com/products
subscription-support-contact-support-plaintext = Kontaktiraj podršku:
subscriptionUpdateBillingEnsure = <a data-l10n-name="updateBillingUrl">Ovdje</a> možeš provjeriti jesu li tvoj način plaćanja i podaci o računu aktualni.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdateBillingEnsure-plaintext = Ovdje možeš provjeriti jesu li tvoj način plaćanja i podaci o računu aktualni:
subscriptionUpdateBillingTry = Tijekom sljedećih nekoliko dana ćemo ponovo pokušati izvršiti plaćanje, ali ćeš nam možda morati pomoći da to popravimo <a data-l10n-name="updateBillingUrl">aktualiziranjem tvojih podataka o plaćanju</a>.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdateBillingTry-plaintext = Tijekom sljedećih nekoliko dana ćemo ponovo pokušati izvršiti plaćanje, ali ćeš nam možda morati pomoći da to popravimo aktualiziranjem tvojih podataka o plaćanju:
subscriptionUpdatePayment = Za sprečavanje prekida korištenja usluge <a data-l10n-name="updateBillingUrl">aktualiziraj podatke o plaćanju</a> što je prije:
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdatePayment-plaintext = Za sprečavanje prekida korištenja usluge, aktualiziraj podatke naplate što je prije:
view-invoice-link-action = Prikaži račun
# Variables:
#  $invoiceLink (String) - The link to the invoice
# After the colon, there's a link to https://pay.stripe.com/
view-invoice-plaintext = Pogledaj račun: { $invoiceLink }
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-subject = Dobro došao, dobro došla u { $productName }
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-title = Dobro došao, dobro došla u { $productName }
downloadSubscription-content-2 = Započnimo korištenjem svih funkcija koje su uključene u tvoju pretplatu:
downloadSubscription-link-action-2 = Započni
fraudulentAccountDeletion-subject-2 = Tvoj { -product-mozilla-account } je izbrisan
fraudulentAccountDeletion-title = Tvoj račun je izbrisan
fraudulentAccountDeletion-content-part1-v2 = Nedavno je stvoren { -product-mozilla-account } i pretplata je naplaćena koristeći ovu e-mail adresu. Kao što radimo sa svim novim računima, zatražili smo da potvrdiš svoj račun potvrđivanjem ove e-mail adrese.
fraudulentAccountDeletion-content-part2-v2 = Trenutačno vidimo da račun nikada nije potvrđen. Budući da ovaj korak nije dovršen, nismo sigurni radi li se o autoriziranoj pretplati. Zbog toga je pod ovom e-mail adresom registrirani { -product-mozilla-account } izbrisan, a pretplata je otkazana uz puni povrat novca.
fraudulentAccountDeletion-contact = Ako imaš pitanja, kontaktiraj naš <a data-l10n-name="mozillaSupportUrl">tim za podršku</a>.
# Variables:
#  $mozillaSupportUrl (String) - Link to https://support.mozilla.org
fraudulentAccountDeletion-contact-plaintext = Ako imaš pitanja kontaktiraj naš tim za podršku: { $mozillaSupportUrl }
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountDeletion-subject = Tvoja pretplata na { $productName } je otkazana
subscriptionAccountDeletion-title = Žao nam je što odlaziš
subscriptionAccountReminderFirst-subject = Podsjetnik: dovrši postavljanje računa
subscriptionAccountReminderFirst-title = Još ne možeš pristupiti svojoj pretplati
subscriptionAccountReminderFirst-action = Stvori lozinku
subscriptionAccountReminderFirst-action-plaintext = { subscriptionAccountReminderFirst-action }:
subscriptionAccountReminderSecond-subject = Posljednji podsjetnik: postavi svoj račun
subscriptionAccountReminderSecond-title-2 = Dobro došao, dobro došla u { -brand-mozilla }!
subscriptionAccountReminderSecond-content-select-2 = Odaberi „Stvori lozinku” za postavljanje nove lozinke i dovršavanje potvrđivanja tvog računa.
subscriptionAccountReminderSecond-action = Stvori lozinku
subscriptionAccountReminderSecond-action-plaintext = { subscriptionAccountReminderSecond-action }:
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionCancellation-subject = Tvoja pretplata na { $productName } je otkazana
subscriptionCancellation-title = Žao nam je što odlaziš

## Variables
##   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
##   $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
##   $invoiceDateOnly (String) - The date of the invoice, e.g. 01/20/2016

subscriptionCancellation-content-2 = Prekinuli smo tvoju pretplatu na { $productName }. Tvoja zadnja uplata od { $invoiceTotal } je plaćena { $invoiceDateOnly }.
# Variables
#   $serviceLastActiveDateOnly (String) - The date of last active service, e.g. 01/20/2016
subscriptionCancellation-content-continue = Tvoja će usluga biti dostupna do kraja tekućeg obračunskog razdoblja, a to je { $serviceLastActiveDateOnly }.
# Variables:
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-subject = Prebacio/la si se na { $productName }
# Variables:
# $productNameOld (String) - The name of the previously subscribed product, e.g. Mozilla VPN
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-content-switch = Uspješno si se prebacio/la s { $productNameOld } na { $productName }.
# Variables:
# $paymentAmountOld (String) - The amount of the previous subscription payment, including currency, e.g. $10.00
# $paymentAmountNew (String) - The amount of the new subscription payment, including currency, e.g. $10.00
# $productPaymentCycleNew (String) - The interval of time from the end of one payment statement date to the next payment statement date of the new subscription, e.g. month
# $productPaymentCycleOld (String) - The interval of time from the end of one payment statement date to the next payment statement date of the old subscription, e.g. month
# $paymentProrated (String) - The one time fee to reflect the higher charge for the remainder of the payment cycle, including currency, e.g. $10.00
subscriptionDowngrade-content-charge-info = Od sljedećeg računa pa nadalje, tvoja će se naplata promijeniti od { $paymentAmountOld } na { $productPaymentCycleOld } u { $paymentAmountNew } na { $productPaymentCycleNew }. Tada ćeš dobiti i jednokratni bonus od { $paymentProrated } kako bi se odrazila niža naplata za ostatak ovog { $productPaymentCycleOld }.
subscriptionDowngrade-content-auto-renew = Tvoja će se pretplata automatski obnoviti svakog obračunskog razdoblja, ukoliko je ne otkažeš.
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFailedPaymentsCancellation-subject = Tvoja pretplata na { $productName } je otkazana
subscriptionFailedPaymentsCancellation-title = Tvoja pretplata je otkazana
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-subject = { $productName } plaćanje potvrđeno
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-title = Hvala ti na pretplati na { $productName }
subscriptionFirstInvoice-content-processing = Tvoje se plaćanje trenutačno obrađuje i može potrajati do četiri radna dana.
subscriptionFirstInvoice-content-auto-renew = Tvoja će se pretplata automatski obnoviti svakog obračunskog razdoblja, ukoliko je ne otkažeš.
subscriptionPaymentExpired-title-2 = Tvoj način plaćanja je istekao ili uskoro isteče
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-subject = { $productName } plaćanje nije uspjelo
subscriptionPaymentFailed-title = Žao nam je, imamo problem s tvojim plaćanjem
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-content-problem = Imali smo problema s tvojim zadnjim plaćanjem za { $productName }.
subscriptionPaymentProviderCancelled-title = Žao nam je, imamo problem s tvojim načinom plaćanja
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentProviderCancelled-content-detect = Otkrili smo problem s tvojim načinom plaćanja za { $productName }.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-subject = Pretplata na { $productName } je ponovo aktivirana
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-title = Hvala ti na ponovnom aktiviranju tvoje pretplate na { $productName }!
# Variables:
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. 2016/01/20
subscriptionReactivation-content = Ciklus naplate i plaćanje ostat će isti. Sljedeće terećenje iznosi { $invoiceTotal } na { $nextInvoiceDateOnly }. Tvoja će se pretplata automatski obnoviti za svako obračunsko razdoblje ukoliko je ne otkažeš.
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-subject = { $productName } obavijest o automatskoj obnovi
subscriptionRenewalReminder-title = Tvoja će se pretplata uskoro obnoviti
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-greeting = Poštovani { $productName } kupac,
subscriptionRenewalReminder-content-closing = S poštovanjem,
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-signature = { $productName } tim
subscriptionReplaced-subject = Tvoja je pretplata aktualizirana kao dio tvoje nadogradnje
subscriptionReplaced-title = Tvoja je pretplata aktualizirana
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSubsequentInvoice-subject = Uplata za { $productName } primljena
subscriptionSubsequentInvoice-title = Hvala ti na tvojoj pretplati!
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSubsequentInvoice-content-received = Primili smo tvoju zadnju uplatu za { $productName }.
# Variables:
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionUpgrade-subject = Nadogradio/la si na { $productName }
subscriptionUpgrade-title = Hvala na nadogradnji!

## Variables:
## $paymentAmountOld (String) - The amount of the previous subscription payment, including currency, e.g. $10.00
## $paymentAmountNew (String) - The amount of the new subscription payment, including currency, e.g. $10.00
## $paymentTaxOld (String) - The tax amount of the previous subscription payment, including currency, e.g. $1.00
## $paymentTaxNew (String) - The tax amount of the new subscription payment, including currency, e.g. $1.00
## $productPaymentCycleNew (String) - The interval of time from the end of one payment statement date to the next payment statement date of the new subscription, e.g. month
## $productPaymentCycleOld (String) - The interval of time from the end of one payment statement date to the next payment statement date of the old subscription, e.g. month
## $invoiceAmountDue (String) - The total that the customer owes after all credits, discounts, and taxes have been applied
## $paymentProrated (String) - The one time fee to reflect the higher charge for the remainder of the payment cycle, including currency, e.g. $10.00

subscriptionUpgrade-content-subscription-next-bill-change = Cijena tvoje pretplate će se promijeniti u sljedećem računu.
subscriptionUpgrade-content-old-price-day = Prethodna cijena je bila { $paymentAmountOld } na dan.
subscriptionUpgrade-content-old-price-week = Prethodna cijena je bila { $paymentAmountOld } na tjedan.
subscriptionUpgrade-content-old-price-month = Prethodna cijena je bila { $paymentAmountOld } na mjesec.
subscriptionUpgrade-content-old-price-halfyear = Prethodna cijena je bila { $paymentAmountOld } na šest mjeseci.
subscriptionUpgrade-content-old-price-year = Prethodna cijena je bila { $paymentAmountOld } na godinu.
subscriptionUpgrade-content-old-price-default = Prethodna cijena je bila { $paymentAmountOld } po obračunskom razdoblju.
subscriptionUpgrade-content-old-price-day-tax = Prethodna cijena je bila { $paymentAmountOld } + porez od { $paymentTaxOld } na dan.
subscriptionUpgrade-content-old-price-week-tax = Prethodna cijena je bila { $paymentAmountOld } + porez od { $paymentTaxOld } na tjedan.
subscriptionUpgrade-content-old-price-month-tax = Prethodna cijena je bila { $paymentAmountOld } + porez od { $paymentTaxOld } na mjesec.
subscriptionUpgrade-content-old-price-halfyear-tax = Prethodna cijena je bila { $paymentAmountOld } + porez od { $paymentTaxOld } na šest mjeseci.
subscriptionUpgrade-content-old-price-year-tax = Prethodna cijena je bila { $paymentAmountOld } + porez od { $paymentTaxOld } na godinu.
subscriptionUpgrade-content-old-price-default-tax = Prethodna cijena je bila { $paymentAmountOld } + porez od { $paymentTaxOld } po obračunskom razdoblju.
subscriptionUpgrade-auto-renew = Tvoja će se pretplata automatski obnoviti svakog obračunskog razdoblja, ukoliko je ne otkažeš.
subscriptionsPaymentProviderCancelled-title = Žao nam je, imamo problem s tvojim načinom plaćanja
subscriptionsPaymentProviderCancelled-content-detected = Otkrili smo problem s tvojim načinom plaćanja za sljedeće pretplate.
