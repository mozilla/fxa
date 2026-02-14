## Non-email strings

session-verify-send-push-title-2 = Loggar du inn på { -product-mozilla-account }-en din?
session-verify-send-push-body-2 = Klikk her for å stadfeste at det er du
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to verify phone ownership when registering a recovery phone
recovery-phone-setup-sms-body = { $code } er stadfestingskoden din for { -brand-mozilla }. Går ut om 5 minutt.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to verify phone ownership when registering a recovery phone
recovery-phone-setup-sms-short-body = { -brand-mozilla }-stadfestingskode: { $code }
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for two-step authentication
recovery-phone-signin-sms-body = { $code } er gjenopprettingskoden din for { -brand-mozilla }. Går ut om 5 minutt.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for two-step authentication
recovery-phone-signin-sms-short-body = { -brand-mozilla }-kode: { $code }
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for account password reset
recovery-phone-reset-password-sms-body = { $code } er gjenopprettingskoden din for { -brand-mozilla }. Går ut om 5 minutt.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for account password reset
recovery-phone-reset-password-short-body = { -brand-mozilla }-kode: { $code }
subplat-header-mozilla-logo-2 = <img data-l10n-name="subplat-mozilla-logo" alt="{ -brand-mozilla } logo">
subplat-footer-mozilla-logo-2 = <img data-l10n-name="mozilla-logo-footer" alt="{ -brand-mozilla } logo">
subplat-automated-email = Dette er ei automatisk e-postmelding: Dersom du har motteke denne e-posten ved en feil, treng du ikkje å gjera noko.
subplat-privacy-notice = Personvernfråsegn
subplat-privacy-plaintext = Personvernfråsegn:
subplat-update-billing-plaintext = { subplat-update-billing }:
# Variables:
#  $email (String) - A user's primary email address
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subplat-explainer-specific-2 = Du får denne e-posten fordi { $email } har ein { -product-mozilla-account } og du har meldt deg på { $productName }.
# Variables:
#  $email (String) - A user's primary email address
subplat-explainer-reminder-form-2 = Du får denne e-posten fordi { $email } har ein { -product-mozilla-account }.
subplat-explainer-multiple-2 = Du får denne e-postmeldinga fordi { $email } har ein { -product-mozilla-account } og du har abonnert på fleire produkt.
subplat-explainer-was-deleted-2 = Du får denne e-postmeldinga fordi { $email } vart brukt til å registrere ein { -product-mozilla-account }.
subplat-manage-account-2 = Handsam innstillingane for { -product-mozilla-account } ved å gå til <a data-l10n-name="subplat-account-page">kontosida</a>.
# Variables:
#  $accountSettingsUrl (String) - URL to Account Settings
subplat-manage-account-plaintext-2 = Handsam innstillingane for { -product-mozilla-account } ved å gå til kontosida di: { $accountSettingsUrl }
subplat-terms-policy = Vilkår og avbestillingsreglar
subplat-terms-policy-plaintext = { subplat-terms-policy }:
subplat-cancel = Avbryt abonnement
subplat-cancel-plaintext = { subplat-cancel }:
subplat-reactivate = Reaktiver abonnement
subplat-reactivate-plaintext = { subplat-reactivate }:
subplat-update-billing = Oppdater faktureringsinformasjon
subplat-privacy-policy = { -brand-mozilla }s personvernpraksis
subplat-privacy-policy-2 = { -product-mozilla-accounts(capitalization: "uppercase") } personvernfråsegn
subplat-privacy-policy-plaintext = { subplat-privacy-policy }:
subplat-privacy-policy-plaintext-2 = { subplat-privacy-policy-2 }:
subplat-moz-terms = Tenestevilkår for { -product-mozilla-accounts(capitalization: "uppercase") }
subplat-moz-terms-plaintext = { subplat-moz-terms }:
subplat-legal = Juridisk
subplat-legal-plaintext = { subplat-legal }:
subplat-privacy = Personvern
subplat-privacy-website-plaintext = { subplat-privacy }:
cancellationSurvey = Hjelp oss med å forbetre tenestene våre ved å vere med i denne <a data-l10n-name="cancellationSurveyUrl">korte undersøkinga</a>.
# After the colon, there's a link to https://survey.alchemer.com/s3/6534408/Privacy-Security-Product-Cancellation-of-Service-Q4-21
cancellationSurvey-plaintext = Hjelp oss med å forbetre tenestene våre ved å vere med i denne korte undersøkinga:
payment-details = Betalningsinformasjon:
# Variables:
#  $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
payment-plan-invoice-number = Fakturanummer: { $invoiceNumber }
# Variables:
#  $invoiceDateOnly (String) - The date of the invoice, e.g. 01/20/2016
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
payment-plan-charged = Belasta: { $invoiceTotal } den { $invoiceDateOnly }
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

payment-provider-card-name-ending-in-plaintext = Betalingsmåte: { $cardName } som sluttar på { $lastFour }
payment-provider-card-ending-in-plaintext = Betalingsmåte: Kort som sluttar på { $lastFour }
payment-provider-card-ending-in = <b>Betalingsmåte:</b> Kort som sluttar på { $lastFour }
payment-provider-card-ending-in-card-name = <b>Betalingsmåte:</b> { $cardName } som sluttar på { $lastFour }
subscription-charges-invoice-summary = Fakturasamandrag

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
subscription-charges-credit-from-unused-time = Kreditt frå ubrukt tid
# $unusedAmountTotal (String) - The credit amount from unused time of the subscription invoice, including currency, e.g. $2.00
subscription-charges-credit-from-unused-time-plaintext = Kreditt frå ubrukt tid: { $unusedAmountTotal }
subscription-charges-subtotal = <b>Delsum</b>
# $invoiceSubtotal (String) - The amount, before discount, of the subscription invoice, including currency, e.g. $10.00
subscriptionFirstInvoiceDiscount-content-subtotal = Delsum: { $invoiceSubtotal }

## $invoiceDiscountAmount (String) - The amount of the discount of the subscription invoice, including currency, e.g. $2.00
## $discountDuration - The duration of the discount in number of months, e.g. "3" if the discount is 3-months

subscription-charges-one-time-discount = Eingongsrabatt
subscription-charges-one-time-discount-plaintext = Eingongsrabatt: { $invoiceDiscountAmount }
subscription-charges-repeating-discount =
    { $discountDuration ->
        [one] { $discountDuration }-månads rabatt
       *[other] { $discountDuration }-månadars rabatt
    }
subscription-charges-repeating-discount-plaintext =
    { $discountDuration ->
        [one] { $discountDuration }-månads rabatt: { $invoiceDiscountAmount }
       *[other] { $discountDuration }-månadars rabatt: { $invoiceDiscountAmount }
    }
subscription-charges-discount = Rabatt
subscription-charges-discount-plaintext = Rabatt: { $invoiceDiscountAmount }
subscription-charges-taxes = Skattar og avgifter
# $invoiceTaxAmount (String) - The amount of the tax of the subscription invoice, including currency, e.g. $2.00
subscriptionCharges-content-tax-plaintext = Skattar og avgifter: { $invoiceTaxAmount }
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
subscription-charges-credit-received = Du har fått ein kontokreditt på { $creditReceived }, som vil bli brukt på dei framtidige fakturaene dine.

##

subscriptionSupport = Har du spørsmål om abonnementet ditt? <a data-l10n-name="subscriptionSupportUrl">Supportteamet</a> vårt står klar for å hjelpe deg.
# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupport-plaintext = Har du spørsmål om abonnementet ditt? Supportteamet vårt står klar til å hjelpe deg:
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSupportContact = Takk for at du abonnerer på { $productName }. Dersom du har spørsmål om abonnementet ditt eller treng meir informasjon om { $productName }, kan du <a data-l10n-name="subscriptionSupportUrl">kontakte oss</a>.
# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupportContact-plaintext = Takk for at du abonnerer på { $productName }. Dersom du har spørsmål om abonnementet ditt eller treng meir informasjon om { $productName }, kan du kontakte oss:
subscription-support-get-help = Få hjelp med abonnementet ditt
subscription-support-manage-your-subscription = <a data-l10n-name="manageSubscriptionUrl">Handsam abonnement ditt</a>
# After the colon, there's a link to https://payments.firefox.com/subscriptions
subscription-support-manage-your-subscription-plaintext = Handsam abonnementet ditt
subscription-support-contact-support = <a data-l10n-name="subscriptionSupportUrl">Kontakt kundestøtte</a>
# After the colon, there's a link to https://support.mozilla.com/products
subscription-support-contact-support-plaintext = Kontakt kundestøtte:
subscriptionUpdateBillingEnsure = Du kan sørge for at betalingsmåten og kontoinformasjonen din er oppdatert <a data-l10n-name="updateBillingUrl">her</a>.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdateBillingEnsure-plaintext = Du kan sørge for at betalingsmåten og kontoinformasjonen din er oppdatert her:
subscriptionUpdateBillingTry = Vi prøver å gjennomføre betalinga di igjen i løpet av dei neste dagane, men du må kanskje hjelpe oss med å fikse det ved å <a data-l10n-name="updateBillingUrl">oppdatere betalingsinformasjonen din</a>.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdateBillingTry-plaintext = Vi prøver å gjennomføre betalinga di igjen i løpet av dei neste dagane, men du må kanskje hjelpe oss med å fikse det ved å oppdatere betalingsinformasjonen din:
subscriptionUpdatePayment = <a data-l10n-name="updateBillingUrl">Oppdater betalingsinformasjonen din</a> så snart som muleg for å unngå avbrot i tenestene dine.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdatePayment-plaintext = Oppdater betalingsinformasjonen din snarast råd for å unngå avbrot i tenesta di:
view-invoice-link-action = Vis faktura
# Variables:
#  $invoiceLink (String) - The link to the invoice
# After the colon, there's a link to https://pay.stripe.com/
view-invoice-plaintext = Sjå faktura: { $invoiceLink }
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-subject = Velkomen til { $productName }
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-title = Velkomen til { $productName }
downloadSubscription-content-2 = La oss kome i gang med å bruke alle funksjonane i abonementet ditt.
downloadSubscription-link-action-2 = Kom i gang
fraudulentAccountDeletion-subject-2 = { -product-mozilla-account }-en din vart sletta
fraudulentAccountDeletion-title = Kontoen din vart sletta
fraudulentAccountDeletion-content-part1-v2 = Nyleg vart ein { -product-mozilla-account } oppretta og eit abonnement vart belasta med denne e-postadressa. Som vi gjer med alle nye kontoar, ba vi deg stadfeste kontoen din ved først å validere denne e-postadressa.
fraudulentAccountDeletion-content-part2-v2 = Førebels ser vi at kontoen aldri vart stadfesta. Sidan dette steget ikkje vart fullført, er vi ikkje sikre på om dette var eit autorisert abonnement. Som eit resultat vart { -product-mozilla-account } registrert på denne e-postadressa sletta og abonnementet ditt vart avslutta med alle kostnadar refunderte.
fraudulentAccountDeletion-contact = Viss du har spørsmål, kontakt <a data-l10n-name="mozillaSupportUrl">support-teamet</a> vårt.
# Variables:
#  $mozillaSupportUrl (String) - Link to https://support.mozilla.org
fraudulentAccountDeletion-contact-plaintext = Viss du har spørsmål, kontakt support-teamet vårt: { $mozillaSupportUrl }
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountDeletion-subject = Abonnentet ditt på { $productName } her avslutta
subscriptionAccountDeletion-title = Det er synd at du seier opp abonnementet ditt
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $invoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
subscriptionAccountDeletion-content-cancelled-2 = Du har nyleg sletta { -product-mozilla-account }-en din. Som eit resultat har vi avslutta abonnement ditt på { $productName }. Den endelege betalinga på { $invoiceTotal } vart betalt den { $invoiceDateOnly }.
subscriptionAccountReminderFirst-subject = Påminning: Fullfør oppretting av kontoen din
subscriptionAccountReminderFirst-title = Du har ikkje tilgang til abonnementet ditt enno
subscriptionAccountReminderFirst-content-info-3 = For nokre dager sidan oppretta du ein { -product-mozilla-account }, men stadfesta han aldri. Vi håpar du fullfører konfigureringa av kontoen din, slik at du kan bruke det nye abonnementet ditt.
subscriptionAccountReminderFirst-content-select-2 = Vel «Opprett passord» for å setje opp eit nytt passord og fullfør stadfestinga av kontoen din.
subscriptionAccountReminderFirst-action = Opprett passord
subscriptionAccountReminderFirst-action-plaintext = { subscriptionAccountReminderFirst-action }:
subscriptionAccountReminderSecond-subject = Siste påminning: Konfigurer kontoen din
subscriptionAccountReminderSecond-title-2 = Velkomen til { -brand-mozilla }!
subscriptionAccountReminderSecond-content-info-3 = For nokre dager sidan oppretta du ein { -product-mozilla-account }, men stadfesta han aldri. Vi håpar du fullfører konfigureringa av kontoen din, slik at du kan bruke det nye abonnementet ditt.
subscriptionAccountReminderSecond-content-select-2 = Vel «Opprett passord» for å setje opp eit nytt passord og fullfør stadfestinga av kontoen din.
subscriptionAccountReminderSecond-action = Opprett passord
subscriptionAccountReminderSecond-action-plaintext = { subscriptionAccountReminderSecond-action }:
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionCancellation-subject = Abonnementet ditt på { $productName } er avslutta
subscriptionCancellation-title = Det er synd at du seier opp abonnementet ditt

## Variables
##   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
##   $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
##   $invoiceDateOnly (String) - The date of the invoice, e.g. 01/20/2016

subscriptionCancellation-content-2 = Vi har avslutta { $productName }-abonnementet ditt. Den endelege betalinga på { $invoiceTotal } vart betalt { $invoiceDateOnly }.
subscriptionCancellation-outstanding-content-2 = Vi har avslutta { $productName }-abonnementet ditt. Den endelege betalinga di på { $invoiceTotal } vert betalt { $invoiceDateOnly }.
# Variables
#   $serviceLastActiveDateOnly (String) - The date of last active service, e.g. 01/20/2016
subscriptionCancellation-content-continue = Tenesta di vil halde fram til slutten av gjeldande faktureringsperiode, som er { $serviceLastActiveDateOnly }.
# Variables:
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-subject = Du har bytt til { $productName }
# Variables:
# $productNameOld (String) - The name of the previously subscribed product, e.g. Mozilla VPN
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-content-switch = Du har bytt frå { $productNameOld } til { $productName }.
# Variables:
# $paymentAmountOld (String) - The amount of the previous subscription payment, including currency, e.g. $10.00
# $paymentAmountNew (String) - The amount of the new subscription payment, including currency, e.g. $10.00
# $productPaymentCycleNew (String) - The interval of time from the end of one payment statement date to the next payment statement date of the new subscription, e.g. month
# $productPaymentCycleOld (String) - The interval of time from the end of one payment statement date to the next payment statement date of the old subscription, e.g. month
# $paymentProrated (String) - The one time fee to reflect the higher charge for the remainder of the payment cycle, including currency, e.g. $10.00
subscriptionDowngrade-content-charge-info = Fra og med den neste rekninga di, vil kostnaden endrast frå { $paymentAmountOld } per { $productPaymentCycleOld } til { $paymentAmountNew } per { $productPaymentCycleNew }. På det tidspunktet vil du òg få godskrive eit eingongsbeløp på { $paymentProrated } for å reflektere den lågare kostnaden for resten av denne { $productPaymentCycleOld }.
# Variables:
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-content-install = Om det finst ny programvare for deg å installere for å bruke { $productName }, vil du få ei eiga e-postmelding med nedlastingsinstruksjonar.
subscriptionDowngrade-content-auto-renew = Abonnementet ditt vert automatisk fornya kvar faktureringsperiode med mindre du vel å avbryte.
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionEndingReminder-subject = Abonnementet ditt på { $productName } går snart ut
subscriptionEndingReminder-title = Abonnementet ditt på { $productName } går snart ut
# Variables:
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
#   $serviceLastActiveDateOnly (String) - The date of last active service, e.g. 01/20/2016
subscriptionEndingReminder-content-line1 = Tilgangen din til { $productName } vert avslutta <strong>{ $serviceLastActiveDateOnly }</strong>.
subscriptionEndingReminder-content-line2 = Om du ønskjer å halde fram med å bruke { $productName }, kan du reaktivere abonnementet ditt i <a data-l10n-name="subscriptionEndingReminder-account-settings">kontoinnstillingane</a> før <strong>{ $serviceLastActiveDateOnly }</strong>. Om du treng hjelp, kan du <a data-l10n-name="subscriptionEndingReminder-contact-support">kontakte kundestøtteteamet vårt</a>.
subscriptionEndingReminder-content-line1-plaintext = Tilgangen din til { $productName } vert avslutta { $serviceLastActiveDateOnly }.
subscriptionEndingReminder-content-line2-plaintext = Om du ønskjer å halde fram med å bruke { $productName }, kan du reaktivere abonnementet ditt i kontoinnstillingane før { $serviceLastActiveDateOnly }. Om du treng hjelp, kan du kontakte kundestøtteteamet vårt.
subscriptionEndingReminder-content-closing = Takk for at du er ein verdsett abonnent!
subscriptionEndingReminder-churn-title = Vil du behalde tilgangen?
subscriptionEndingReminder-churn-terms = <a data-l10n-name="subscriptionEndingReminder-churn-terms">Avgrensa vilkår og restriksjonar gjeld</a>
# Variables:
#  $churnTermsUrlWithUtm (String) - URL to the terms and restrictions page applied to this promotion
subscriptionEndingReminder-churn-terms-plaintext = Avgrensa vilkår og restriksjonar gjeld: { $churnTermsUrlWithUtm }
# Variables:
#  $subscriptionSupportUrlWithUtm (String) - URL to the subscription products support page
subscriptionEndingReminder-content-support-plaintext = Kontakt kundestøtteteamet vårt: { $subscriptionSupportUrlWithUtm }
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFailedPaymentsCancellation-subject = { $productName }-abonnentet ditt er annulert
subscriptionFailedPaymentsCancellation-title = Abonnentet ditt er avslutta
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFailedPaymentsCancellation-content = Vi har avslutta { $productName }-abonnementet ditt fordi fleire betalingsforsøk var mislykka. For å få tilgang igjen, start eit nytt abonnement med ein oppdatert betalingsmåte.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-subject = Betaling for { $productName } stadfesta
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-title = Takk for at du abonnerer på { $productName }
subscriptionFirstInvoice-content-processing = Betalinga vert no behandla og det kan ta opptil fire arbeidsdagar å fullføre.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-content-install-2 = Du vil få ein separat e-post om korleis du begynner å bruke { $productName }.
subscriptionFirstInvoice-content-auto-renew = Abonnementet ditt vert fornya automatisk kvar faktureringsperiode, med mindre du vel å avslutte.
# Variables:
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025
subscriptionFirstInvoice-content-your-next-invoice = Den neste fakturaen din blir skriven ut den { $nextInvoiceDateOnly }.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentExpired-subject-2 = Betalingsmåten for { $productName } har gått ut eller går snart ut
subscriptionPaymentExpired-title-2 = Betalingsmetoden din har gått ut eller i ferd med å gå ut
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentExpired-content-2 = Betalingsmetoden du brukar for { $productName }, har gåttt ut eller er i ferd med å gå ut.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-subject = Betalinga for { $productName } var mislykka
subscriptionPaymentFailed-title = Beklagar, vi har problem med betalinga di
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-content-problem = Vi hadde eit problem med den siste betalinga din for { $productName }.
subscriptionPaymentFailed-content-outdated-1 = Det kan vere at betalingsmåten din er utgått, eller at den noverande betalingsmåten din er utdatert.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentProviderCancelled-subject = Oppdatering av betalingsinformasjon er påkravd for { $productName }
subscriptionPaymentProviderCancelled-title = Beklagar, vi har problem med betalingsmetoden din
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentProviderCancelled-content-detect = Vi har oppdaga eit problem med betalingsmåten din for { $productName }.
subscriptionPaymentProviderCancelled-content-reason-1 = Det kan vere at betalingsmåten din er utgått, eller at den noverande betalingsmåten din er utdatert.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-subject = Abonnementet på { $productName } er aktivert på nytt
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-title = Takk for at du reaktiverte abonnementet på { $productName }!
# Variables:
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. 2016/01/20
subscriptionReactivation-content = Faktureringssyklusen og betalinga di vil vere den same. Den neste betalinga di vil vere på { $invoiceTotal } den { $nextInvoiceDateOnly }. Abonnementet ditt vert fornya automatisk kvar faktureringsperiode med mindre du vel å seie det opp.
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-subject = { $productName } automatisk fornyingsmerknad
subscriptionRenewalReminder-title = Abonnentet ditt vil snart verte fornya
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-greeting = KJære { $productName }-kunde,
# Variables
#   $reminderLength (String) - The number of days until the current subscription is set to automatically renew, e.g. 14
subscriptionRenewalReminder-content-intro = Det noverande abonnementet ditt er sett til å bli fornya automatisk om { $reminderLength } dagar.
subscriptionRenewalReminder-content-discount-change = Den neste fakturaen din viser ei prisendring, ettersom ein tidlegare rabatt er gått ut og ein ny rabatt er brukt.
subscriptionRenewalReminder-content-discount-ending = Fordi ein tidlegare rabatt er utgått, vil abonnementet ditt fornyast til standardprisen.
# Variables
#   $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#   $planIntervalCount (String) - The interval count of subscription plan, e.g. 2
#   $planInterval (String) - The interval of time of the subscription plan, e.g. week
# Tells the customer that their subscription price will change at the end of the current billing cycle
subscriptionRenewalReminder-content-charge = På dette tidspunktet vil { -brand-mozilla } fornye { $planIntervalCount } { $planInterval }-abonnementet ditt, og beløpet { $invoiceTotal } vil bli belasta betalingsmåten på kontoen din.
subscriptionRenewalReminder-content-closing = Vennleg helsing,
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-signature = Teamet bak { $productName }
subscriptionReplaced-subject = Abonnentet ditt er oppdatert som ein del av oppgraderinga di
subscriptionReplaced-title = Abonnentet ditt er oppdatert
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReplaced-content-replaced = Det individuelle { $productName }-abonnementet ditt er erstatta og er no inkludert i den nye pakken din..
subscriptionReplaced-content-credit = Du vil motta ein kreditt for ubrukt tid frå det førre abonnement ditt. Denne kreditten vil automatisk bli lagt til kontoen din og brukast til å dekkje framtidige betalingar.
subscriptionReplaced-content-no-action = Du treng ikkje å gjere noko.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSubsequentInvoice-subject = Betaling motteken for { $productName }
subscriptionSubsequentInvoice-title = Takk for at du abonnerer!
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSubsequentInvoice-content-received = Vi har fått den siste betalinga di for { $productName }.
# Variables:
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025
subscriptionSubsequentInvoice-content-your-next-invoice = Den neste fakturaen din blir skriven ut den { $nextInvoiceDateOnly }.
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

subscriptionUpgrade-content-charge-prorated-1 = Du har vorte belasta med eit eingongsgebyr på { $invoiceAmountDue } for å spegle den høgare prisen for abonnementet for resten av denne faktureringsperioden ({ $productPaymentCycleOld }).
subscriptionUpgrade-content-charge-credit = Du har fått ein kontokreditt på beløpet { $paymentProrated }.
subscriptionUpgrade-content-subscription-next-bill-change = Frå og med neste rekning vil prisen på abonnementet ditt endrast.
subscriptionUpgrade-content-old-price-day = Den tidlegare prisen var { $paymentAmountOld } per dag.
subscriptionUpgrade-content-old-price-week = Den tidlegare prisen var { $paymentAmountOld } per veke.
subscriptionUpgrade-content-old-price-month = Den tidlegare prisen var { $paymentAmountOld } per månad.
subscriptionUpgrade-content-old-price-halfyear = Den tidlegare prisen var { $paymentAmountOld } per seks månadar.
subscriptionUpgrade-content-old-price-year = Den tidlegare prisen var { $paymentAmountOld } per år.
subscriptionUpgrade-content-old-price-default = Den tidlegare prisen var { $paymentAmountOld } per faktureringsintervall.
subscriptionUpgrade-content-old-price-day-tax = Den tidlegare prisen var { $paymentAmountOld } + { $paymentTaxOld } moms per dag.
subscriptionUpgrade-content-old-price-week-tax = Den tidlegare prisen var { $paymentAmountOld } + { $paymentTaxOld } moms per veke.
subscriptionUpgrade-content-old-price-month-tax = Den tidlegare prisen var { $paymentAmountOld } + { $paymentTaxOld } moms per månad.
subscriptionUpgrade-content-old-price-halfyear-tax = Den tidlegare prisen var { $paymentAmountOld } + { $paymentTaxOld } moms per seks månadar.
subscriptionUpgrade-content-old-price-year-tax = Den tidlegare prisen var { $paymentAmountOld } + { $paymentTaxOld } moms per år.
subscriptionUpgrade-content-old-price-default-tax = Den tidlegare prisen var { $paymentAmountOld } + { $paymentTaxOld } moms per faktureringsintervall.
subscriptionUpgrade-content-new-price-day = Framover vil du bli belasta { $paymentAmountNew } per dag, eksklusive rabattar.
subscriptionUpgrade-content-new-price-week = Framover vil du bli belasta { $paymentAmountNew } per veke, eksklusive rabattar.
subscriptionUpgrade-content-new-price-month = Framover vil du bli belasta { $paymentAmountNew } per månad, eksklusive rabattar.
subscriptionUpgrade-content-new-price-halfyear = Framover vil du bli belasta { $paymentAmountNew } per seks månadar, eksklusive rabatter.
subscriptionUpgrade-content-new-price-year = Framover vil du bli belasta { $paymentAmountNew } per år, eksklusive rabattar.
subscriptionUpgrade-content-new-price-default = Framover vil du bli belasta { $paymentAmountNew } per faktureringsintervall, eksklusive rabattar.
subscriptionUpgrade-content-new-price-day-dtax = Framover vil du bli belasta { $paymentAmountNew } + { $paymentTaxNew } moms per dag, eksklusive rabattar.
subscriptionUpgrade-content-new-price-week-tax = Framover vil du bli belasta { $paymentAmountNew } + { $paymentTaxNew } moms per veke, eksklusive rabattar.
subscriptionUpgrade-content-new-price-month-tax = Framover vil du bli belasta { $paymentAmountNew } + { $paymentTaxNew } moms per månad, eksklusive rabattar.
subscriptionUpgrade-content-new-price-halfyear-tax = Framover vil du bli belasta { $paymentAmountNew } + { $paymentTaxNew } moms per seks månadar, eksklusive rabattar.
subscriptionUpgrade-content-new-price-year-tax = Framover vil du bli belasta { $paymentAmountNew } + { $paymentTaxNew } moms per år, eksklusive rabattar.
subscriptionUpgrade-content-new-price-default-tax = Framover vil du bli belasta { $paymentAmountNew } + { $paymentTaxNew } moms per faktureringsintervall, eksklusive rabattar.
subscriptionUpgrade-existing = Viss nokon av dei eksisterande abonnementa dine overlappar med denne oppgraderinga, handsamar vi dei og sender deg ein eigen e-post med detaljane. Dersom den nye planen din inkluderer produkt som krev installasjon, sender vi deg ein eigen e-post med konfigurasjonsinstruksjonar.
subscriptionUpgrade-auto-renew = Abonnementet ditt vert automatisk fornya kvar faktureringsperiode med mindre du vel å avbryte.
subscriptionsPaymentExpired-subject-2 = Betalingsmåten for abonnementa dine er utgått eller går snart ut
subscriptionsPaymentExpired-title-2 = Betalingsmetoden din har gått ut eller i ferd med å gå ut
subscriptionsPaymentExpired-content-2 = Betalingsmåten du brukar for å utføre betalingar for følgjande abonnement, er utgått eller går snart ut.
subscriptionsPaymentProviderCancelled-subject = Oppdatering av betalingsinformasjon er påkravd for { -brand-mozilla }-abonnementa
subscriptionsPaymentProviderCancelled-title = Beklagar, vi har problem med betalingsmetoden din
subscriptionsPaymentProviderCancelled-content-detected = Vi har oppdaga eit problem med betalingsmåten din for følgjande abonnement.
subscriptionsPaymentProviderCancelled-content-payment-1 = Det kan vere at betalingsmåten din er utgått, eller at den noverande betalingsmåten din er utdatert.
