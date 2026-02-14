## Non-email strings

session-verify-send-push-title-2 = Logger du inn på { -product-mozilla-account }-en din?
session-verify-send-push-body-2 = Klikk her for å bekrefte at det er deg
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to verify phone ownership when registering a recovery phone
recovery-phone-setup-sms-body = { $code } er din { -brand-mozilla }-bekreftelseskode. Utløper om 5 minutter.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to verify phone ownership when registering a recovery phone
recovery-phone-setup-sms-short-body = { -brand-mozilla }-bekreftelseskode: { $code }
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for two-step authentication
recovery-phone-signin-sms-body = { $code } er din { -brand-mozilla }-gjenopprettingskode. Utløper om 5 minutter.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for two-step authentication
recovery-phone-signin-sms-short-body = { -brand-mozilla }-kode: { $code }
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for account password reset
recovery-phone-reset-password-sms-body = { $code } er din { -brand-mozilla }-gjenopprettingskode. Utløper om 5 minutter.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for account password reset
recovery-phone-reset-password-short-body = { -brand-mozilla }-kode: { $code }
subplat-header-mozilla-logo-2 = <img data-l10n-name="subplat-mozilla-logo" alt="{ -brand-mozilla } logo">
subplat-footer-mozilla-logo-2 = <img data-l10n-name="mozilla-logo-footer" alt="{ -brand-mozilla } logo">
subplat-automated-email = Dette er en automatisert e-postmelding; hvis du har mottatt denne e-posten ved en feil,  trenger du ikke å gjøre noe.
subplat-privacy-notice = Personvernerklæring
subplat-privacy-plaintext = Personvernerklæring:
subplat-update-billing-plaintext = { subplat-update-billing }:
# Variables:
#  $email (String) - A user's primary email address
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subplat-explainer-specific-2 = Du mottar denne e-postmeldingen fordi { $email } har en { -product-mozilla-account } og du registrerte deg for { $productName }.
# Variables:
#  $email (String) - A user's primary email address
subplat-explainer-reminder-form-2 = Du mottar denne e-postmeldingen fordi { $email } har en { -product-mozilla-account }.
subplat-explainer-multiple-2 = Du mottar denne e-postmeldingen fordi { $email } har en { -product-mozilla-account } og du har abonnert på flere produkter.
subplat-explainer-was-deleted-2 = Du mottar denne e-postmeldingen fordi { $email } ble registrert for en { -product-mozilla-account }.
subplat-manage-account-2 = Behandle innstillingene for { -product-mozilla-account } ved å gå til <a data-l10n-name="subplat-account-page">kontosiden</a>.
# Variables:
#  $accountSettingsUrl (String) - URL to Account Settings
subplat-manage-account-plaintext-2 = Behandle innstillingene for { -product-mozilla-account } ved å gå til kontosiden din: { $accountSettingsUrl }
subplat-terms-policy = Vilkår og avbestillingsregler
subplat-terms-policy-plaintext = { subplat-terms-policy }:
subplat-cancel = Avbryt abonnement
subplat-cancel-plaintext = { subplat-cancel }:
subplat-reactivate = Reaktiver abonnement
subplat-reactivate-plaintext = { subplat-reactivate }:
subplat-update-billing = Oppdater faktureringsinformasjon
subplat-privacy-policy = { -brand-mozilla } personvernpraksis
subplat-privacy-policy-2 = { -product-mozilla-accounts(capitalization: "uppercase") } personvernerklæring
subplat-privacy-policy-plaintext = { subplat-privacy-policy }:
subplat-privacy-policy-plaintext-2 = { subplat-privacy-policy-2 }:
subplat-moz-terms = { -product-mozilla-accounts(capitalization: "uppercase") } bruksvilkår
subplat-moz-terms-plaintext = { subplat-moz-terms }:
subplat-legal = Juridisk
subplat-legal-plaintext = { subplat-legal }:
subplat-privacy = Personvern
subplat-privacy-website-plaintext = { subplat-privacy }:
cancellationSurvey = Hjelp oss med å forbedre tjenestene våre ved å være med i denne <a data-l10n-name="cancellationSurveyUrl">korte undersøkelsen</a>.
# After the colon, there's a link to https://survey.alchemer.com/s3/6534408/Privacy-Security-Product-Cancellation-of-Service-Q4-21
cancellationSurvey-plaintext = Hjelp oss med å forbedre tjenestene våre ved å ta denne korte undersøkelsen:
payment-details = Betalingsinformasjon:
# Variables:
#  $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
payment-plan-invoice-number = Fakturanummer: { $invoiceNumber }
# Variables:
#  $invoiceDateOnly (String) - The date of the invoice, e.g. 01/20/2016
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
payment-plan-charged = Belastet: { $invoiceTotal } den { $invoiceDateOnly }
# Variables
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
payment-plan-next-invoice = Neste faktura: { $nextInvoiceDateOnly }

## $paymentProviderName (String) - The brand name of the payment method, e.g. PayPal, Apple Pay, Google Pay, Link

payment-method-payment-provider = <b>Betalingsmåte:</b> { $paymentProviderName }
payment-method-payment-provider-plaintext = Betalingsmåte: { $paymentProviderName }

## This string displays when the type of credit card is known
## https://stripe.com/docs/payments/cards/supported-card-brands
## Variables:
##  $cardName (String) - The brand name of the credit card, e.g. American Express
##  $lastFour (String) - The last four digits of the credit card, e.g. 5309

payment-provider-card-name-ending-in-plaintext = Betalingsmåte: { $cardName } som slutter på { $lastFour }
payment-provider-card-ending-in-plaintext = Betalingsmåte: Kort som slutter på { $lastFour }
payment-provider-card-ending-in = <b>Betalingsmåte:</b> Kort som slutter på { $lastFour }
payment-provider-card-ending-in-card-name = <b>Betalingsmåte:</b> { $cardName } som slutter på { $lastFour }
subscription-charges-invoice-summary = Fakturasammendrag

# Variables:


## $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
## $invoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025

subscription-charges-invoice-number = <b>Fakturanummer:</b> { $invoiceNumber }
subscription-charges-invoice-number-plaintext = Fakturanummer: { $invoiceNumber }
subscription-charges-invoice-date = <b>Dato:</b> { $invoiceDateOnly }
subscription-charges-invoice-date-plaintext = Dato: { $invoiceDateOnly }
subscription-charges-prorated-price = Pris justert etter bruk
# $remainingAmountTotal (String) - The prorated amount of the subscription invoice, including currency, e.g. $4.00
subscription-charges-prorated-price-plaintext = Pris justert etter bruk: { $remainingAmountTotal }
subscription-charges-list-price = Listepris
# $offeringPrice (String) - The list price of the subscription offering, including currency, e.g. $10.00
subscription-charges-list-price-plaintext = Listepris: { $offeringPrice }
subscription-charges-credit-from-unused-time = Kreditt fra ubrukt tid
# $unusedAmountTotal (String) - The credit amount from unused time of the subscription invoice, including currency, e.g. $2.00
subscription-charges-credit-from-unused-time-plaintext = Kreditt fra ubrukt tid: { $unusedAmountTotal }
subscription-charges-subtotal = <b>Delsum</b>
# $invoiceSubtotal (String) - The amount, before discount, of the subscription invoice, including currency, e.g. $10.00
subscriptionFirstInvoiceDiscount-content-subtotal = Delsum: { $invoiceSubtotal }

## $invoiceDiscountAmount (String) - The amount of the discount of the subscription invoice, including currency, e.g. $2.00
## $discountDuration - The duration of the discount in number of months, e.g. "3" if the discount is 3-months

subscription-charges-one-time-discount = Engangsrabatt
subscription-charges-one-time-discount-plaintext = Engangsrabatt: { $invoiceDiscountAmount }
subscription-charges-repeating-discount =
    { $discountDuration ->
       *[other] { $discountDuration }-månedsrabatt
    }
subscription-charges-repeating-discount-plaintext =
    { $discountDuration ->
       *[other] { $discountDuration }-månedsrabatt: { $invoiceDiscountAmount }
    }
subscription-charges-discount = Rabatt
subscription-charges-discount-plaintext = Rabatt: { $invoiceDiscountAmount }
subscription-charges-taxes = Skatter og avgifter
# $invoiceTaxAmount (String) - The amount of the tax of the subscription invoice, including currency, e.g. $2.00
subscriptionCharges-content-tax-plaintext = Skatter og avgifter: { $invoiceTaxAmount }
subscription-charges-total = <b>Totalt</b>
# $invoiceTotal (String) - The total amount of the subscription invoice, including currency, e.g. $10.00
subscription-charges-total-plaintext = Totalt: { $invoiceTotal }
subscription-charges-credit-applied = Kreditt brukt
# $creditApplied (String) - The amount of credit applied to the subscription invoice, including currency, e.g. $2.00
subscription-charges-credit-applied-plaintext = Kreditt brukt: { $creditApplied }
subscription-charges-amount-paid = <b>Betalt beløp</b>
# $invoiceAmountDue (String) - The total that the customer owes after all credits, discounts, and taxes have been applied, including currency, e.g. $8.00
subscription-charges-amount-paid-plaintext = Betalt beløp: { $invoiceAmountDue }
# $creditReceived (String) - The amount, after discount, of the subscription invoice, including currency, e.g. $8.00
subscription-charges-credit-received = Du har mottatt en kontokreditt på { $creditReceived }, som vil bli brukt på dine fremtidige fakturaer.

##

subscriptionSupport = Har du spørsmål om ditt abonnement? Vårt <a data-l10n-name="subscriptionSupportUrl">supportteam</a> står klar til å hjelpe deg.
# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupport-plaintext = Har du spørsmål om ditt abonnement? Vårt supportteam står klar til å hjelpe deg:
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSupportContact = Takk for at du abonnerer på { $productName }. Hvis du har spørsmål om abonnementet ditt eller trenger mer informasjon om { $productName }, kan du <a data-l10n-name="subscriptionSupportUrl">kontakte oss</a>.
# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupportContact-plaintext = Takk for at du abonnerer på { $productName }. Hvis du har spørsmål om abonnementet ditt eller trenger mer informasjon om { $productName }, kan du kontakte oss:
subscription-support-get-help = Få hjelp med abonnementet ditt
subscription-support-manage-your-subscription = <a data-l10n-name="manageSubscriptionUrl">Behandle ditt abonnement</a>
# After the colon, there's a link to https://payments.firefox.com/subscriptions
subscription-support-manage-your-subscription-plaintext = Behandle ditt abonnement
subscription-support-contact-support = <a data-l10n-name="subscriptionSupportUrl">Kontakt kundestøtte</a>
# After the colon, there's a link to https://support.mozilla.com/products
subscription-support-contact-support-plaintext = Kontakt kundestøtte:
subscriptionUpdateBillingEnsure = Du kan sikre at betalingsmåten og kontoinformasjonen din er oppdatert <a data-l10n-name="updateBillingUrl">her</a>.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdateBillingEnsure-plaintext = Du kan sikre at betalingsmåten og kontoinformasjonen din er oppdatert her:
subscriptionUpdateBillingTry = Vi prøver å gjennomføre betalingen din igjen i løpet av de neste dagene, men du må kanskje hjelpe oss med å fikse det ved å <a data-l10n-name="updateBillingUrl">oppdatere betalingsinformasjonen din</a>.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdateBillingTry-plaintext = Vi prøver å gjennomføre betalingen din igjen i løpet av de neste dagene, men du må kanskje hjelpe oss med å fikse det ved å oppdatere betalingsinformasjonen din:
subscriptionUpdatePayment = <a data-l10n-name="updateBillingUrl">Oppdater betalingsinformasjonen din</a> så snart som mulig for å unngå avbrudd i din tjeneste.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdatePayment-plaintext = Oppdater betalingsinformasjonen din så snart som mulig for å unngå avbrudd i din tjeneste:
view-invoice-link-action = Vis faktura
# Variables:
#  $invoiceLink (String) - The link to the invoice
# After the colon, there's a link to https://pay.stripe.com/
view-invoice-plaintext = Se faktura: { $invoiceLink }
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-subject = Velkommen til { $productName }
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-title = Velkommen til { $productName }
downloadSubscription-content-2 = La oss komme i gang med å bruke alle funksjonene som er inkludert i abonnementet ditt:
downloadSubscription-link-action-2 = Kom i gang
fraudulentAccountDeletion-subject-2 = Din { -product-mozilla-account } ble slettet
fraudulentAccountDeletion-title = Kontoen din ble slettet
fraudulentAccountDeletion-content-part1-v2 = Nylig ble en { -product-mozilla-account } opprettet og et abonnement ble belastet med denne e-postadressen. Som vi gjør med alle nye kontoer, ba vi deg bekrefte kontoen din ved først å validere denne e-postadressen.
fraudulentAccountDeletion-content-part2-v2 = Foreløpig ser vi at kontoen aldri ble bekreftet. Siden dette trinnet ikke ble fullført, er vi ikke sikre på om dette var et autorisert abonnement. Som et resultat ble { -product-mozilla-account } registrert på denne e-postadressen slettet og abonnementet ditt ble avsluttet med alle kostnader refundert.
fraudulentAccountDeletion-contact = Hvis du har spørsmål, så kontakt <a data-l10n-name="mozillaSupportUrl">support-teamet</a> vårt.
# Variables:
#  $mozillaSupportUrl (String) - Link to https://support.mozilla.org
fraudulentAccountDeletion-contact-plaintext = Hvis du har spørsmål, så kontakt support-teamet vårt: { $mozillaSupportUrl }
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountDeletion-subject = Ditt abonnement på { $productName } har blit avsluttet
subscriptionAccountDeletion-title = Det er synd at du sier opp abonnementet ditt
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $invoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
subscriptionAccountDeletion-content-cancelled-2 = Du har nylig slettet { -product-mozilla-account }-en din. Som et resultat har vi avsluttet ditt abonnement på { $productName }. Den endelige betalingen på { $invoiceTotal } ble betalt den { $invoiceDateOnly }.
subscriptionAccountReminderFirst-subject = Påminnelse: Fullfør oppretting av kontoen din
subscriptionAccountReminderFirst-title = Du har ikke tilgang til abonnementet ditt ennå
subscriptionAccountReminderFirst-content-info-3 = For noen dager siden opprettet du en { -product-mozilla-account }, men bekreftet den aldri. Vi håper du fullfører konfigureringen av kontoen din, slik at du kan bruke ditt nye abonnement.
subscriptionAccountReminderFirst-content-select-2 = Velg «Opprett passord» for å sette opp et nytt passord og fullfør bekreftelsen av kontoen din.
subscriptionAccountReminderFirst-action = Opprett passord
subscriptionAccountReminderFirst-action-plaintext = { subscriptionAccountReminderFirst-action }:
subscriptionAccountReminderSecond-subject = Siste påminnelse: Konfigurer kontoen din
subscriptionAccountReminderSecond-title-2 = Velkommen til { -brand-mozilla }!
subscriptionAccountReminderSecond-content-info-3 = For noen dager siden opprettet du en { -product-mozilla-account }, men bekreftet den aldri. Vi håper du fullfører konfigureringen av kontoen din, slik at du kan bruke ditt nye abonnement.
subscriptionAccountReminderSecond-content-select-2 = Velg «Opprett passord» for å sette opp et nytt passord og fullfør bekreftelsen av kontoen din.
subscriptionAccountReminderSecond-action = Opprett passord
subscriptionAccountReminderSecond-action-plaintext = { subscriptionAccountReminderSecond-action }:
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionCancellation-subject = Ditt abonnement på { $productName } har blit avsluttet
subscriptionCancellation-title = Det er synd at du sier opp abonnementet ditt

## Variables
##   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
##   $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
##   $invoiceDateOnly (String) - The date of the invoice, e.g. 01/20/2016

subscriptionCancellation-content-2 = Vi har avsluttet { $productName }-abonnementet ditt. Den endelige betalingen på { $invoiceTotal } ble betalt { $invoiceDateOnly }.
subscriptionCancellation-outstanding-content-2 = Vi har avsluttet { $productName }-abonnementet ditt. Den endelige betalingen din på { $invoiceTotal } vil bli betalt { $invoiceDateOnly }.
# Variables
#   $serviceLastActiveDateOnly (String) - The date of last active service, e.g. 01/20/2016
subscriptionCancellation-content-continue = Tjenesten din vil fortsette til slutten av gjeldende faktureringsperiode, som er { $serviceLastActiveDateOnly }.
# Variables:
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-subject = Du har byttet til { $productName }
# Variables:
# $productNameOld (String) - The name of the previously subscribed product, e.g. Mozilla VPN
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-content-switch = Du har byttet fra { $productNameOld } til { $productName }.
# Variables:
# $paymentAmountOld (String) - The amount of the previous subscription payment, including currency, e.g. $10.00
# $paymentAmountNew (String) - The amount of the new subscription payment, including currency, e.g. $10.00
# $productPaymentCycleNew (String) - The interval of time from the end of one payment statement date to the next payment statement date of the new subscription, e.g. month
# $productPaymentCycleOld (String) - The interval of time from the end of one payment statement date to the next payment statement date of the old subscription, e.g. month
# $paymentProrated (String) - The one time fee to reflect the higher charge for the remainder of the payment cycle, including currency, e.g. $10.00
subscriptionDowngrade-content-charge-info = Fra og med din neste regning, vil kostnaden endres fra { $paymentAmountOld } per { $productPaymentCycleOld } til { $paymentAmountNew } per { $productPaymentCycleNew }. På det tidspunktet vil du også få godskrevet et engangsbeløp på { $paymentProrated } for å reflektere den lavere kostnaden for resten av denne { $productPaymentCycleOld }.
# Variables:
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-content-install = Om det finnes ny programvare for deg å installere for å bruke { $productName }, vil du motta en egen e-postmelding med nedlastingsinstruksjoner.
subscriptionDowngrade-content-auto-renew = Abonnementet ditt fornyes automatisk hver faktureringsperiode med mindre du velger å avslutte.
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionEndingReminder-subject = Abonnementet ditt på { $productName } utløper snart
subscriptionEndingReminder-title = Abonnementet ditt på { $productName } utløper snart
# Variables:
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
#   $serviceLastActiveDateOnly (String) - The date of last active service, e.g. 01/20/2016
subscriptionEndingReminder-content-line1 = Tilgangen din til { $productName } avsluttes <strong>{ $serviceLastActiveDateOnly }</strong>.
subscriptionEndingReminder-content-line2 = Hvis du ønsker å fortsette å bruke { $productName }, kan du reaktivere abonnementet ditt i <a data-l10n-name="subscriptionEndingReminder-account-settings">kontoinnstillingene</a> før <strong>{ $serviceLastActiveDateOnly }</strong>. Hvis du trenger hjelp, kan du <a data-l10n-name="subscriptionEndingReminder-contact-support">kontakte kundestøtteteamet vårt</a>.
subscriptionEndingReminder-content-line1-plaintext = Tilgangen din til { $productName } avsluttes { $serviceLastActiveDateOnly }.
subscriptionEndingReminder-content-line2-plaintext = Hvis du ønsker å fortsette å bruke { $productName }, kan du reaktivere abonnementet ditt i kontoinnstillingene før { $serviceLastActiveDateOnly }. Hvis du trenger hjelp, kan du kontakte kundestøtteteamet vårt.
subscriptionEndingReminder-content-closing = Takk for at du er en verdsatt abonnent!
subscriptionEndingReminder-churn-title = Vil du beholde tilgangen?
subscriptionEndingReminder-churn-terms = <a data-l10n-name="subscriptionEndingReminder-churn-terms">Begrensede vilkår og restriksjoner gjelder</a>
# Variables:
#  $churnTermsUrlWithUtm (String) - URL to the terms and restrictions page applied to this promotion
subscriptionEndingReminder-churn-terms-plaintext = Begrensede vilkår og restriksjoner gjelder: { $churnTermsUrlWithUtm }
# Variables:
#  $subscriptionSupportUrlWithUtm (String) - URL to the subscription products support page
subscriptionEndingReminder-content-support-plaintext = Kontakt kundestøtteteamet vårt: { $subscriptionSupportUrlWithUtm }
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFailedPaymentsCancellation-subject = Ditt abonnement på { $productName } har blit avsluttet
subscriptionFailedPaymentsCancellation-title = Abonnementet ditt er avsluttet
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFailedPaymentsCancellation-content = Vi har avsluttet { $productName }-abonnementet ditt fordi flere betalingsforsøk mislyktes. For å få tilgang igjen, start et nytt abonnement med en oppdatert betalingsmåte.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-subject = Betaling for { $productName } bekreftet
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-title = Takk for at du abonnerer på { $productName }
subscriptionFirstInvoice-content-processing = Betalingen din behandles for øyeblikket og det kan ta opptil fire virkedager å fullføre.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-content-install-2 = Du vil motta en separat e-post om hvordan du begynner å bruke { $productName }.
subscriptionFirstInvoice-content-auto-renew = Abonnementet ditt fornyes automatisk hver faktureringsperiode med mindre du velger å avslutte.
# Variables:
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025
subscriptionFirstInvoice-content-your-next-invoice = Din neste faktura utstedes den { $nextInvoiceDateOnly }.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentExpired-subject-2 = Betalingsmåten for { $productName } har utløpt eller utløper snart
subscriptionPaymentExpired-title-2 = Betalingsmåten din har utløpt eller i ferd med å utløpe
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentExpired-content-2 = Betalingsmåten du bruker for { $productName }, har utløpt eller er i ferd med å utløpe.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-subject = Betaling for { $productName } mislyktes
subscriptionPaymentFailed-title = Beklager, vi har problemer med betalingen din
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-content-problem = Vi hadde et problem med den siste betalingen din for { $productName }.
subscriptionPaymentFailed-content-outdated-1 = Det kan være at betalingsmåten din er utløpt, eller at den nåværende betalingsmåten din er utdatert.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentProviderCancelled-subject = Oppdatering av betalingsinformasjon kreves for { $productName }
subscriptionPaymentProviderCancelled-title = Beklager, vi har problemer med betalingsmåten din
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentProviderCancelled-content-detect = Vi har oppdaget et problem med betalingsmåten din for { $productName }.
subscriptionPaymentProviderCancelled-content-reason-1 = Det kan være at betalingsmåten din er utløpt, eller at den nåværende betalingsmåten din er utdatert.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-subject = { $productName }-abonnement reaktiveret
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-title = Takk for at du reaktiverte abonnementet på { $productName }!
# Variables:
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. 2016/01/20
subscriptionReactivation-content = Faktureringssyklusen og betalingen din vil forbli den samme. Din neste betaling vil være på { $invoiceTotal } den { $nextInvoiceDateOnly }. Abonnementet ditt fornyes automatisk hver faktureringsperiode med mindre du velger å kansellere.
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-subject = Varsel om automatisk fornyelse av { $productName }
subscriptionRenewalReminder-title = Abonnementet ditt fornyes snart
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-greeting = KJære { $productName }-kunde,
# Variables
#   $reminderLength (String) - The number of days until the current subscription is set to automatically renew, e.g. 14
subscriptionRenewalReminder-content-intro = Ditt nåværende abonnement er satt til å fornyes automatisk om { $reminderLength } dager.
subscriptionRenewalReminder-content-discount-change = Din neste faktura gjenspeiler en prisendring, ettersom en tidligere rabatt er utløpt og en ny rabatt er brukt.
subscriptionRenewalReminder-content-discount-ending = Fordi en tidligere rabatt er utløpt, vil abonnementet ditt fornyes til standardprisen.
# Variables
#   $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#   $planIntervalCount (String) - The interval count of subscription plan, e.g. 2
#   $planInterval (String) - The interval of time of the subscription plan, e.g. week
# Tells the customer that their subscription price will change at the end of the current billing cycle
subscriptionRenewalReminder-content-charge = På dette tidspunktet vil { -brand-mozilla } fornye { $planIntervalCount } { $planInterval }-abonnementet ditt, og beløpet { $invoiceTotal } vil bli belastet betalingsmåten på kontoen din.
subscriptionRenewalReminder-content-closing = Vennlig hilsen,
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-signature = { $productName }-teamet
subscriptionReplaced-subject = Abonnementet ditt har blitt oppdatert som en del av oppgraderingen
subscriptionReplaced-title = Abonnementet ditt er oppdatert
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReplaced-content-replaced = Ditt individuelle { $productName }-abonnement er erstattet og er nå inkludert i den nye pakken din.
subscriptionReplaced-content-credit = Du vil motta en kreditt for ubrukt tid fra ditt forrige abonnement. Denne kreditten vil automatisk bli lagt til kontoen din og brukes til fremtidige belastninger.
subscriptionReplaced-content-no-action = Du trenger ikke å gjøre noe.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSubsequentInvoice-subject = Betaling for { $productName } mottatt
subscriptionSubsequentInvoice-title = Takk for at du abonnerer!
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSubsequentInvoice-content-received = Vi har mottatt din seneste betaling for { $productName }.
# Variables:
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025
subscriptionSubsequentInvoice-content-your-next-invoice = Din neste faktura utstedes den { $nextInvoiceDateOnly }.
# Variables:
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionUpgrade-subject = Du har oppgradert til { $productName }
subscriptionUpgrade-title = Takk for at du oppgraderer!
# Variables:
# $productNameOld (String) - The name of the previously subscribed product, e.g. Mozilla VPN
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionUpgrade-upgrade-info-2 = Du har oppgradert til { $productName }.

## Variables:
## $paymentAmountOld (String) - The amount of the previous subscription payment, including currency, e.g. $10.00
## $paymentAmountNew (String) - The amount of the new subscription payment, including currency, e.g. $10.00
## $paymentTaxOld (String) - The tax amount of the previous subscription payment, including currency, e.g. $1.00
## $paymentTaxNew (String) - The tax amount of the new subscription payment, including currency, e.g. $1.00
## $productPaymentCycleNew (String) - The interval of time from the end of one payment statement date to the next payment statement date of the new subscription, e.g. month
## $productPaymentCycleOld (String) - The interval of time from the end of one payment statement date to the next payment statement date of the old subscription, e.g. month
## $invoiceAmountDue (String) - The total that the customer owes after all credits, discounts, and taxes have been applied
## $paymentProrated (String) - The one time fee to reflect the higher charge for the remainder of the payment cycle, including currency, e.g. $10.00

subscriptionUpgrade-content-charge-prorated-1 = Du har blitt belastet med et engangsgebyr på { $invoiceAmountDue } for å gjenspeile abonnementets høyere pris for resten av denne faktureringsperioden ({ $productPaymentCycleOld }).
subscriptionUpgrade-content-charge-credit = Du har mottatt en kontokreditt på beløpet { $paymentProrated }.
subscriptionUpgrade-content-subscription-next-bill-change = Fra og med neste regning vil prisen på abonnementet ditt endres.
subscriptionUpgrade-content-old-price-day = Den forrige prisen var { $paymentAmountOld } per dag.
subscriptionUpgrade-content-old-price-week = Den forrige prisen var { $paymentAmountOld } per uke.
subscriptionUpgrade-content-old-price-month = Den forrige prisen var { $paymentAmountOld } per måned.
subscriptionUpgrade-content-old-price-halfyear = Den forrige prisen var { $paymentAmountOld } per seks måneder.
subscriptionUpgrade-content-old-price-year = Den forrige prisen var { $paymentAmountOld } per år.
subscriptionUpgrade-content-old-price-default = Den forrige prisen var { $paymentAmountOld } per faktureringsintervall.
subscriptionUpgrade-content-old-price-day-tax = Den forrige prisen var { $paymentAmountOld } + { $paymentTaxOld } moms per dag.
subscriptionUpgrade-content-old-price-week-tax = Den forrige prisen var { $paymentAmountOld } + { $paymentTaxOld } moms per uke.
subscriptionUpgrade-content-old-price-month-tax = Den forrige prisen var { $paymentAmountOld } + { $paymentTaxOld } moms per måned.
subscriptionUpgrade-content-old-price-halfyear-tax = Den forrige prisen var { $paymentAmountOld } + { $paymentTaxOld } moms per seks måneder.
subscriptionUpgrade-content-old-price-year-tax = Den forrige prisen var { $paymentAmountOld } + { $paymentTaxOld } moms per år.
subscriptionUpgrade-content-old-price-default-tax = Den forrige prisen var { $paymentAmountOld } + { $paymentTaxOld } moms per faktureringsintervall.
subscriptionUpgrade-content-new-price-day = Fremover vil du bli belastet { $paymentAmountNew } per dag, eksklusive rabatter.
subscriptionUpgrade-content-new-price-week = Fremover vil du bli belastet { $paymentAmountNew } per uke, eksklusive rabatter.
subscriptionUpgrade-content-new-price-month = Fremover vil du bli belastet { $paymentAmountNew } per måned, eksklusive rabatter.
subscriptionUpgrade-content-new-price-halfyear = Fremover vil du bli belastet { $paymentAmountNew } per seks måneder, eksklusive rabatter.
subscriptionUpgrade-content-new-price-year = Fremover vil du bli belastet { $paymentAmountNew } per år, eksklusive rabatter.
subscriptionUpgrade-content-new-price-default = Fremover vil du bli belastet { $paymentAmountNew } per faktureringsintervall, eksklusive rabatter.
subscriptionUpgrade-content-new-price-day-dtax = Fremover vil du bli belastet { $paymentAmountNew } + { $paymentTaxNew } moms per dag, eksklusive rabatter.
subscriptionUpgrade-content-new-price-week-tax = Fremover vil du bli belastet { $paymentAmountNew } + { $paymentTaxNew } moms per uke, eksklusive rabatter.
subscriptionUpgrade-content-new-price-month-tax = Fremover vil du bli belastet { $paymentAmountNew } + { $paymentTaxNew } moms per måned, eksklusive rabatter.
subscriptionUpgrade-content-new-price-halfyear-tax = Fremover vil du bli belastet { $paymentAmountNew } + { $paymentTaxNew } moms per seks måneder, eksklusive rabatter.
subscriptionUpgrade-content-new-price-year-tax = Fremover vil du bli belastet { $paymentAmountNew } + { $paymentTaxNew } moms per år, eksklusive rabatter.
subscriptionUpgrade-content-new-price-default-tax = Fremover vil du bli belastet { $paymentAmountNew } + { $paymentTaxNew } moms per faktureringsintervall, eksklusive rabatter.
subscriptionUpgrade-existing = Hvis noen av dine eksisterende abonnementer overlapper med denne oppgraderingen, håndterer vi dem og sender deg en egen e-post med detaljene. Hvis den nye planen din inkluderer produkter som krever installasjon, sender vi deg en egen e-post med konfigurasjonsinstruksjoner.
subscriptionUpgrade-auto-renew = Abonnementet ditt fornyes automatisk hver faktureringsperiode med mindre du velger å avslutte.
subscriptionsPaymentExpired-subject-2 = Betalingsmåten for abonnementene dine er utløpt eller utløper snart
subscriptionsPaymentExpired-title-2 = Betalingsmåten din har utløpt eller i ferd med å utløpe
subscriptionsPaymentExpired-content-2 = Betalingsmåten du bruker for å utføre betalinger for følgende abonnementer, er utløpt eller utløper snart.
subscriptionsPaymentProviderCancelled-subject = Oppdatering av betalingsinformasjon kreves for { -brand-mozilla }-abonnementer
subscriptionsPaymentProviderCancelled-title = Beklager, vi har problemer med betalingsmåten din
subscriptionsPaymentProviderCancelled-content-detected = Vi har oppdaget et problem med betalingsmåten din for følgende abonnementer.
subscriptionsPaymentProviderCancelled-content-payment-1 = Det kan være at betalingsmåten din er utløpt, eller at den nåværende betalingsmåten din er utdatert.
