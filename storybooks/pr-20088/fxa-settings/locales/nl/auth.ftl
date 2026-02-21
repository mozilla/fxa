## Non-email strings

session-verify-send-push-title-2 = Aanmelden bij uw { -product-mozilla-account }?
session-verify-send-push-body-2 = Klik hier om te bevestigen dat u het bent
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to verify phone ownership when registering a recovery phone
recovery-phone-setup-sms-body = { $code } is uw { -brand-mozilla }-verificatiecode. Verloopt over 5 minuten.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to verify phone ownership when registering a recovery phone
recovery-phone-setup-sms-short-body = { -brand-mozilla }-verificatiecode: { $code }
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for two-step authentication
recovery-phone-signin-sms-body = { $code } is uw { -brand-mozilla }-herstelcode. Verloopt over 5 minuten.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for two-step authentication
recovery-phone-signin-sms-short-body = { -brand-mozilla }-code: { $code }
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for account password reset
recovery-phone-reset-password-sms-body = { $code } is uw { -brand-mozilla }-herstelcode. Verloopt over 5 minuten.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for account password reset
recovery-phone-reset-password-short-body = { -brand-mozilla }-code: { $code }
subplat-header-mozilla-logo-2 = <img data-l10n-name="subplat-mozilla-logo" alt="{ -brand-mozilla }-logo">
subplat-footer-mozilla-logo-2 = <img data-l10n-name="mozilla-logo-footer" alt="{ -brand-mozilla }-logo">
subplat-automated-email = Dit is een geautomatiseerd e-mailbericht; als u het per abuis hebt ontvangen, hoeft u niets te doen.
subplat-privacy-notice = Privacyverklaring
subplat-privacy-plaintext = Privacyverklaring:
subplat-update-billing-plaintext = { subplat-update-billing }:
# Variables:
#  $email (String) - A user's primary email address
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subplat-explainer-specific-2 = U ontvangt dit bericht omdat { $email } een { -product-mozilla-account } heeft en u bent ingeschreven voor { $productName }.
# Variables:
#  $email (String) - A user's primary email address
subplat-explainer-reminder-form-2 = U ontvangt dit e-mailbericht omdat { $email } een { -product-mozilla-account } heeft.
subplat-explainer-multiple-2 = U ontvangt dit bericht omdat { $email } een { -product-mozilla-account } heeft en u bent geabonneerd op meerdere producten.
subplat-explainer-was-deleted-2 = U ontvangt dit e-mailbericht omdat { $email } is geregistreerd voor een { -product-mozilla-account }.
subplat-manage-account-2 = Beheer uw { -product-mozilla-account }-instellingen door naar uw <a data-l10n-name="subplat-account-page">accountpagina</a> te gaan.
# Variables:
#  $accountSettingsUrl (String) - URL to Account Settings
subplat-manage-account-plaintext-2 = Beheer de instellingen van uw { -product-mozilla-account } door naar uw accountpagina te gaan: { $accountSettingsUrl }
subplat-terms-policy = Voorwaarden en opzeggingsbeleid
subplat-terms-policy-plaintext = { subplat-terms-policy }:
subplat-cancel = Abonnement opzeggen
subplat-cancel-plaintext = { subplat-cancel }:
subplat-reactivate = Abonnement opnieuw activeren
subplat-reactivate-plaintext = { subplat-reactivate }:
subplat-update-billing = Facturatiegegevens bijwerken
subplat-privacy-policy = { -brand-mozilla }-privacybeleid
subplat-privacy-policy-2 = { -product-mozilla-accounts(capitalization: "uppercase") }-privacyverklaring
subplat-privacy-policy-plaintext = { subplat-privacy-policy }:
subplat-privacy-policy-plaintext-2 = { subplat-privacy-policy-2 }:
subplat-moz-terms = { -product-mozilla-accounts(capitalization: "uppercase") }-Servicevoorwaarden
subplat-moz-terms-plaintext = { subplat-moz-terms }:
subplat-legal = Juridisch
subplat-legal-plaintext = { subplat-legal }:
subplat-privacy = Privacy
subplat-privacy-website-plaintext = { subplat-privacy }:
cancellationSurvey = Help ons onze dienstverlening te verbeteren door deze <a data-l10n-name="cancellationSurveyUrl">korte enquête</a> in te vullen.
# After the colon, there's a link to https://survey.alchemer.com/s3/6534408/Privacy-Security-Product-Cancellation-of-Service-Q4-21
cancellationSurvey-plaintext = Help ons onze dienstverlening te verbeteren door deze korte enquête in te vullen:
payment-details = Betalingsgegevens:
# Variables:
#  $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
payment-plan-invoice-number = Factuurnummer: { $invoiceNumber }
# Variables:
#  $invoiceDateOnly (String) - The date of the invoice, e.g. 01/20/2016
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
payment-plan-charged = { $invoiceTotal } in rekening gebracht op { $invoiceDateOnly }
# Variables
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
payment-plan-next-invoice = Volgende factuur: { $nextInvoiceDateOnly }

## $paymentProviderName (String) - The brand name of the payment method, e.g. PayPal, Apple Pay, Google Pay, Link

payment-method-payment-provider = <b>Betalingsmethode:</b> { $paymentProviderName }
payment-method-payment-provider-plaintext = Betalingsmethode: { $paymentProviderName }

## This string displays when the type of credit card is known
## https://stripe.com/docs/payments/cards/supported-card-brands
## Variables:
##  $cardName (String) - The brand name of the credit card, e.g. American Express
##  $lastFour (String) - The last four digits of the credit card, e.g. 5309

payment-provider-card-name-ending-in-plaintext = Betalingsmethode: { $cardName } eindigend op { $lastFour }
payment-provider-card-ending-in-plaintext = Betalingsmethode: kaart eindigend op { $lastFour }
payment-provider-card-ending-in = <b>Betalingsmethode:</b> kaart eindigend op { $lastFour }
payment-provider-card-ending-in-card-name = <b>Betalingsmethode:</b> { $cardName } eindigend op { $lastFour }
subscription-charges-invoice-summary = Factuursamenvatting

# Variables:


## $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
## $invoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025

subscription-charges-invoice-number = <b>Factuurnummer:</b> { $invoiceNumber }
subscription-charges-invoice-number-plaintext = Factuurnummer: { $invoiceNumber }
subscription-charges-invoice-date = <b>Datum:</b> { $invoiceDateOnly }
subscription-charges-invoice-date-plaintext = Datum: { $invoiceDateOnly }
subscription-charges-prorated-price = Naar rato prijs
# $remainingAmountTotal (String) - The prorated amount of the subscription invoice, including currency, e.g. $4.00
subscription-charges-prorated-price-plaintext = Naar rato prijs: { $remainingAmountTotal }
subscription-charges-list-price = Normale prijs
# $offeringPrice (String) - The list price of the subscription offering, including currency, e.g. $10.00
subscription-charges-list-price-plaintext = Normale prijs: { $offeringPrice }
subscription-charges-credit-from-unused-time = Tegoed van ongebruikte tijd
# $unusedAmountTotal (String) - The credit amount from unused time of the subscription invoice, including currency, e.g. $2.00
subscription-charges-credit-from-unused-time-plaintext = Tegoed van ongebruikte tijd: { $unusedAmountTotal }
subscription-charges-subtotal = <b>Subtotaal</b>
# $invoiceSubtotal (String) - The amount, before discount, of the subscription invoice, including currency, e.g. $10.00
subscriptionFirstInvoiceDiscount-content-subtotal = Subtotaal: { $invoiceSubtotal }

## $invoiceDiscountAmount (String) - The amount of the discount of the subscription invoice, including currency, e.g. $2.00
## $discountDuration - The duration of the discount in number of months, e.g. "3" if the discount is 3-months

subscription-charges-one-time-discount = Eenmalige korting
subscription-charges-one-time-discount-plaintext = Eenmalige korting: { $invoiceDiscountAmount }
subscription-charges-repeating-discount =
    { $discountDuration ->
        [one] { $discountDuration } maand korting
       *[other] { $discountDuration } maanden korting
    }
subscription-charges-repeating-discount-plaintext =
    { $discountDuration ->
        [one] { $discountDuration } maand korting: { $invoiceDiscountAmount }
       *[other] { $discountDuration } maanden korting: { $invoiceDiscountAmount }
    }
subscription-charges-discount = Korting
subscription-charges-discount-plaintext = Korting: { $invoiceDiscountAmount }
subscription-charges-taxes = Btw en toeslagen
# $invoiceTaxAmount (String) - The amount of the tax of the subscription invoice, including currency, e.g. $2.00
subscriptionCharges-content-tax-plaintext = Btw en toeslagen: { $invoiceTaxAmount }
subscription-charges-total = <b>Totaal</b>
# $invoiceTotal (String) - The total amount of the subscription invoice, including currency, e.g. $10.00
subscription-charges-total-plaintext = Totaal: { $invoiceTotal }
subscription-charges-credit-applied = Tegoed toegepast
# $creditApplied (String) - The amount of credit applied to the subscription invoice, including currency, e.g. $2.00
subscription-charges-credit-applied-plaintext = Tegoed toegepast: { $creditApplied }
subscription-charges-amount-paid = <b>Betaald bedrag</b>
# $invoiceAmountDue (String) - The total that the customer owes after all credits, discounts, and taxes have been applied, including currency, e.g. $8.00
subscription-charges-amount-paid-plaintext = Betaald bedrag: { $invoiceAmountDue }
# $creditReceived (String) - The amount, after discount, of the subscription invoice, including currency, e.g. $8.00
subscription-charges-credit-received = U hebt een accounttegoed van { $creditReceived } ontvangen. Dit tegoed wordt op uw toekomstige facturen toegepast.

##

subscriptionSupport = Vragen over uw abonnement? Ons <a data-l10n-name="subscriptionSupportUrl">ondersteuningsteam</a> is er om u te helpen.
# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupport-plaintext = Vragen over uw abonnement? Ons ondersteuningsteam is er om u te helpen:
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSupportContact = Bedankt voor uw abonnement op { $productName }. Als u vragen over uw abonnement hebt, of meer informatie over { $productName } wilt, <a data-l10n-name="subscriptionSupportUrl">neem dan contact op</a>.
# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupportContact-plaintext = Bedankt voor uw abonnement op { $productName }. Als u vragen over uw abonnement hebt, of meer informatie over { $productName } wilt, neem dan contact op:
subscription-support-get-help = Hulp bij uw abonnement verkrijgen
subscription-support-manage-your-subscription = <a data-l10n-name="manageSubscriptionUrl">Uw abonnement beheren</a>
# After the colon, there's a link to https://payments.firefox.com/subscriptions
subscription-support-manage-your-subscription-plaintext = Uw abonnement beheren:
subscription-support-contact-support = <a data-l10n-name="subscriptionSupportUrl">Contact opnemen</a>
# After the colon, there's a link to https://support.mozilla.com/products
subscription-support-contact-support-plaintext = Contact opnemen:
subscriptionUpdateBillingEnsure = U kunt <a data-l10n-name="updateBillingUrl">hier</a> ervoor zorgen dat uw betalingsmethode en accountgegevens actueel zijn.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdateBillingEnsure-plaintext = U kunt hier ervoor zorgen dat uw betalingsmethode en accountgegevens actueel zijn:
subscriptionUpdateBillingTry = We zullen de komende dagen uw betaling opnieuw proberen te innen, maar u moet ons wellicht helpen door <a data-l10n-name="updateBillingUrl">uw betalingsgegevens bij te werken</a>.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdateBillingTry-plaintext = We zullen de komende dagen uw betaling opnieuw proberen te innen, maar u moet ons wellicht helpen door uw betalingsgegevens bij te werken:
subscriptionUpdatePayment = Werk zo snel mogelijk <a data-l10n-name="updateBillingUrl">uw betalingsgegevens bij</a> om onderbreking van uw service te voorkomen.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdatePayment-plaintext = Werk zo snel mogelijk uw betalingsgegevens bij om onderbreking van uw service te voorkomen:
view-invoice-link-action = Factuur bekijken
# Variables:
#  $invoiceLink (String) - The link to the invoice
# After the colon, there's a link to https://pay.stripe.com/
view-invoice-plaintext = Factuur bekijken: { $invoiceLink }
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-subject = Welkom bij { $productName }.
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-title = Welkom bij { $productName }
downloadSubscription-content-2 = Laten we aan de slag gaan met alle functies die bij uw abonnement zijn inbegrepen:
downloadSubscription-link-action-2 = Aan de slag
fraudulentAccountDeletion-subject-2 = Uw { -product-mozilla-account } is verwijderd
fraudulentAccountDeletion-title = Uw account is verwijderd
fraudulentAccountDeletion-content-part1-v2 = Onlangs is er een { -product-mozilla-account } aangemaakt en is een abonnement in rekening gebracht via dit e-mailadres. Zoals we bij alle nieuwe accounts doen, hebben we u gevraagd uw account te bevestigen door eerst dit e-mailadres te valideren.
fraudulentAccountDeletion-content-part2-v2 = Op dit moment zien we dat de account nooit is bevestigd. Aangezien deze stap niet is voltooid, weten we niet zeker of dit een geautoriseerd abonnement was. Als gevolg hiervan is de { -product-mozilla-account } die is geregistreerd op dit e-mailadres verwijderd, is uw abonnement opgezegd en zijn alle kosten terugbetaald.
fraudulentAccountDeletion-contact = Neem bij vragen contact op met ons <a data-l10n-name="mozillaSupportUrl">ondersteuningsteam</a>.
# Variables:
#  $mozillaSupportUrl (String) - Link to https://support.mozilla.org
fraudulentAccountDeletion-contact-plaintext = Neem bij vragen contact op met ons ondersteuningsteam: { $mozillaSupportUrl }
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountDeletion-subject = Uw abonnement op { $productName } is opgezegd
subscriptionAccountDeletion-title = Jammer dat u vertrekt
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $invoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
subscriptionAccountDeletion-content-cancelled-2 = U heeft onlangs uw { -product-mozilla-account } verwijderd. Als gevolg hiervan hebben we uw { $productName }-abonnement opgezegd. Uw laatste betaling van { $invoiceTotal } is betaald op { $invoiceDateOnly }.
subscriptionAccountReminderFirst-subject = Herinnering: voltooi het instellen van uw account
subscriptionAccountReminderFirst-title = U hebt nog geen toegang tot uw abonnement
subscriptionAccountReminderFirst-content-info-3 = Een paar dagen geleden hebt u een { -product-mozilla-account } aangemaakt, maar deze nog niet bevestigd. We hopen dat u het instellen van uw account voltooit, zodat u uw nieuwe abonnement kunt gebruiken.
subscriptionAccountReminderFirst-content-select-2 = Selecteer ‘Wachtwoord aanmaken’ om een nieuw wachtwoord in te stellen en de bevestiging van uw account te voltooien.
subscriptionAccountReminderFirst-action = Wachtwoord aanmaken
subscriptionAccountReminderFirst-action-plaintext = { subscriptionAccountReminderFirst-action }:
subscriptionAccountReminderSecond-subject = Laatste herinnering: stel uw account in
subscriptionAccountReminderSecond-title-2 = Welkom bij { -brand-mozilla }!
subscriptionAccountReminderSecond-content-info-3 = Een paar dagen geleden hebt u een { -product-mozilla-account } aangemaakt, maar deze nog niet bevestigd. We hopen dat u het instellen van uw account voltooit, zodat u uw nieuwe abonnement kunt gebruiken.
subscriptionAccountReminderSecond-content-select-2 = Selecteer ‘Wachtwoord aanmaken’ om een nieuw wachtwoord in te stellen en de bevestiging van uw account te voltooien.
subscriptionAccountReminderSecond-action = Wachtwoord aanmaken
subscriptionAccountReminderSecond-action-plaintext = { subscriptionAccountReminderSecond-action }:
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionCancellation-subject = Uw abonnement op { $productName } is opgezegd
subscriptionCancellation-title = Jammer dat u vertrekt

## Variables
##   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
##   $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
##   $invoiceDateOnly (String) - The date of the invoice, e.g. 01/20/2016

subscriptionCancellation-content-2 = We hebben uw abonnement op { $productName } opgezegd. Uw laatste betaling van { $invoiceTotal } is betaald op { $invoiceDateOnly }.
subscriptionCancellation-outstanding-content-2 = We hebben uw abonnement op { $productName } opgezegd. Uw laatste betaling van { $invoiceTotal } wordt betaald op { $invoiceDateOnly }.
# Variables
#   $serviceLastActiveDateOnly (String) - The date of last active service, e.g. 01/20/2016
subscriptionCancellation-content-continue = Uw service loopt door tot het einde van uw huidige factureringsperiode, te weten { $serviceLastActiveDateOnly }.
# Variables:
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-subject = U bent overgeschakeld naar { $productName }
# Variables:
# $productNameOld (String) - The name of the previously subscribed product, e.g. Mozilla VPN
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-content-switch = U bent met succes overgeschakeld van { $productNameOld } naar { $productName }.
# Variables:
# $paymentAmountOld (String) - The amount of the previous subscription payment, including currency, e.g. $10.00
# $paymentAmountNew (String) - The amount of the new subscription payment, including currency, e.g. $10.00
# $productPaymentCycleNew (String) - The interval of time from the end of one payment statement date to the next payment statement date of the new subscription, e.g. month
# $productPaymentCycleOld (String) - The interval of time from the end of one payment statement date to the next payment statement date of the old subscription, e.g. month
# $paymentProrated (String) - The one time fee to reflect the higher charge for the remainder of the payment cycle, including currency, e.g. $10.00
subscriptionDowngrade-content-charge-info = Vanaf uw volgende factuur wijzigen uw kosten van { $paymentAmountOld } per { $productPaymentCycleOld } naar { $paymentAmountNew } per { $productPaymentCycleNew }. U ontvangt dan tevens een eenmalig krediet van { $paymentProrated } ten gevolge van de lagere kosten voor de rest van deze { $productPaymentCycleOld }.
# Variables:
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-content-install = Als u nieuwe software moet installeren om { $productName } te kunnen gebruiken, dan ontvangt u een afzonderlijk e-mailbericht met downloadinstructies.
subscriptionDowngrade-content-auto-renew = Uw abonnement wordt automatisch elke factureringsperiode verlengd, tenzij u ervoor kiest om op te zeggen.
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionEndingReminder-subject = Uw abonnement op { $productName } verloopt binnenkort
subscriptionEndingReminder-title = Uw abonnement op { $productName } verloopt binnenkort
# Variables:
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
#   $serviceLastActiveDateOnly (String) - The date of last active service, e.g. 01/20/2016
subscriptionEndingReminder-content-line1 = Uw toegang tot { $productName } eindigt op <strong>{ $serviceLastActiveDateOnly }</strong>.
subscriptionEndingReminder-content-line2 = Als u { $productName } wilt blijven gebruiken, kunt u vóór <strong>{ $serviceLastActiveDateOnly }</strong> uw abonnement opnieuw activeren in <a data-l10n-name="subscriptionEndingReminder-account-settings">Accountinstellingen</a>. Als u hulp nodig hebt, <a data-l10n-name="subscriptionEndingReminder-contact-support">neem dan contact op met ons ondersteuningsteam</a>.
subscriptionEndingReminder-content-line1-plaintext = Uw toegang tot { $productName } eindigt op { $serviceLastActiveDateOnly }.
subscriptionEndingReminder-content-line2-plaintext = Als u { $productName } wilt blijven gebruiken, kunt u uw abonnement vóór { $serviceLastActiveDateOnly } opnieuw activeren in Accountinstellingen. Neem contact op met ons ondersteuningsteam als u hulp nodig hebt.
subscriptionEndingReminder-content-closing = Bedankt dat u een gewaardeerde abonnee bent!
subscriptionEndingReminder-churn-title = Wilt u toegang behouden?
subscriptionEndingReminder-churn-terms = <a data-l10n-name="subscriptionEndingReminder-churn-terms">Beperkte voorwaarden en beperkingen zijn van toepassing</a>
# Variables:
#  $churnTermsUrlWithUtm (String) - URL to the terms and restrictions page applied to this promotion
subscriptionEndingReminder-churn-terms-plaintext = Beperkte voorwaarden en beperkingen zijn van toepassing: { $churnTermsUrlWithUtm }
# Variables:
#  $subscriptionSupportUrlWithUtm (String) - URL to the subscription products support page
subscriptionEndingReminder-content-support-plaintext = Neem contact op met ons ondersteuningsteam: { $subscriptionSupportUrlWithUtm }
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFailedPaymentsCancellation-subject = Uw abonnement op { $productName } is opgezegd
subscriptionFailedPaymentsCancellation-title = Uw abonnement is opgezegd
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFailedPaymentsCancellation-content = We hebben uw abonnement op { $productName } opgezegd, omdat meerdere betalingspogingen zijn mislukt. Start een nieuw abonnement met een bijgewerkte betalingsmethode om weer toegang te krijgen.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-subject = De betaling voor { $productName } is bevestigd
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-title = Bedankt voor uw abonnement op { $productName }
subscriptionFirstInvoice-content-processing = Uw betaling wordt momenteel verwerkt en het kan tot vier werkdagen duren voordat deze is voltooid.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-content-install-2 = U ontvangt een apart e-mailbericht over hoe u { $productName } kunt gaan gebruiken.
subscriptionFirstInvoice-content-auto-renew = Uw abonnement wordt automatisch elke factureringsperiode verlengd, tenzij u ervoor kiest om op te zeggen.
# Variables:
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025
subscriptionFirstInvoice-content-your-next-invoice = Uw volgende factuur wordt op { $nextInvoiceDateOnly } in rekening gebracht.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentExpired-subject-2 = Betalingsmethode voor { $productName } is verlopen of verloopt binnenkort
subscriptionPaymentExpired-title-2 = Uw betalingsmethode is verlopen of verloopt binnenkort
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentExpired-content-2 = De betalingsmethode die u voor { $productName } gebruikt, is verlopen of verloopt binnenkort.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-subject = De betaling voor { $productName } is mislukt
subscriptionPaymentFailed-title = Sorry, we hebben problemen met uw betaling
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-content-problem = We hebben een probleem gehad met uw laatste betaling voor { $productName }.
subscriptionPaymentFailed-content-outdated-1 = Mogelijk is uw betalingsmethode verlopen, of is uw huidige betalingsmethode verouderd.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentProviderCancelled-subject = Bijwerken van betalingsgegevens vereist voor { $productName }
subscriptionPaymentProviderCancelled-title = Sorry, we hebben problemen met uw betalingsmethode
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentProviderCancelled-content-detect = We hebben een probleem met uw betalingsmethode voor { $productName } vastgesteld.
subscriptionPaymentProviderCancelled-content-reason-1 = Mogelijk is uw betalingsmethode verlopen, of is uw huidige betalingsmethode verouderd.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-subject = Abonnement op { $productName } opnieuw geactiveerd
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-title = Bedankt voor het opnieuw activeren van uw abonnement op { $productName }!
# Variables:
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. 2016/01/20
subscriptionReactivation-content = Uw betalingscyclus en betaling blijven hetzelfde. Uw volgende afschrijving is { $invoiceTotal } op { $nextInvoiceDateOnly }. Uw abonnement wordt automatisch elke factureringsperiode verlengd, tenzij u ervoor kiest om op te zeggen.
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-subject = Automatische verlengingsmelding voor { $productName }
subscriptionRenewalReminder-title = Uw abonnement wordt binnenkort verlengd
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-greeting = Beste klant van { $productName },
# Variables
#   $reminderLength (String) - The number of days until the current subscription is set to automatically renew, e.g. 14
subscriptionRenewalReminder-content-intro = Uw huidige abonnement wordt over { $reminderLength } dagen automatisch verlengd.
subscriptionRenewalReminder-content-discount-change = Uw volgende factuur geeft een prijswijziging weer, aangezien een eerdere korting is komen te vervallen en een nieuwe korting is toegepast.
subscriptionRenewalReminder-content-discount-ending = Omdat een eerdere korting is komen te vervallen, wordt uw abonnement verlengd tegen de standaardprijs.
# Variables
#   $invoiceTotalExcludingTax (String) - The amount of the subscription invoice before tax, including currency, e.g. $10.00
#   $invoiceTax (String) - The tax amount of the subscription invoice, including currency, e.g. $1.29
subscriptionRenewalReminder-content-charge-with-tax-day = Op dat moment verlengt { -brand-mozilla } uw dagelijkse abonnement en wordt { $invoiceTotalExcludingTax } + { $invoiceTax } btw in rekening gebracht op de betalingsmethode van uw account.
subscriptionRenewalReminder-content-charge-with-tax-week = Op dat moment verlengt { -brand-mozilla } uw weekabonnement en wordt { $invoiceTotalExcludeTax } + { $invoiceTax } btw in rekening gebracht op de betalingsmethode van uw account.
subscriptionRenewalReminder-content-charge-with-tax-month = Op dat moment verlengt { -brand-mozilla } uw maandabonnement en wordt { $invoiceTotalExcludingTax } + { $invoiceTax } btw in rekening gebracht op de betalingsmethode van uw account.
subscriptionRenewalReminder-content-charge-with-tax-halfyear = Op dat moment verlengt { -brand-mozilla } uw halfjaarabonnement en wordt { $invoiceTotalExcludingTax } + { $invoiceTax } btw  in rekening gebracht op de betalingsmethode van uw account.
subscriptionRenewalReminder-content-charge-with-tax-year = Op dat moment verlengt { -brand-mozilla } uw jaarabonnement en wordt { $invoiceTotalExcludingTax } + { $invoiceTax } btw in rekening gebracht op de betalingsmethode van uw account.
subscriptionRenewalReminder-content-charge-with-tax-default = Op dat moment verlengt { -brand-mozilla } uw abonnement en wordt { $invoiceTotalExcludeTax } + { $invoiceTax } btw in rekening gebracht op de betalingsmethode van uw account.
# Variables
#   $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
subscriptionRenewalReminder-content-charge-invoice-total-day = Op dat moment verlengt { -brand-mozilla } uw dagabonnement en wordt { $invoiceTotal } in rekening gebracht op de betalingsmethode van uw account.
subscriptionRenewalReminder-content-charge-invoice-total-week = Op dat moment verlengt { -brand-mozilla } uw weekabonnement en wordt { $invoiceTotal } in rekening gebracht op de betalingsmethode van uw account.
subscriptionRenewalReminder-content-charge-invoice-total-month = Op dat moment verlengt { -brand-mozilla } uw maandabonnement en wordt { $invoiceTotal } in rekening gebracht op de betalingsmethode van uw account.
subscriptionRenewalReminder-content-charge-invoice-total-halfyear = Op dat moment verlengt { -brand-mozilla } uw halfjaarabonnement en wordt { $invoiceTotal } in rekening gebracht op de betalingsmethode van uw account.
subscriptionRenewalReminder-content-charge-invoice-total-year = Op dat moment verlengt { -brand-mozilla } uw jaarabonnement en wordt { $invoiceTotal } in rekening gebracht op de betalingsmethode van uw account.
subscriptionRenewalReminder-content-charge-invoice-total-default = Op dat moment verlengt { -brand-mozilla } uw abonnement en wordt { $invoiceTotal } in rekening gebracht op de betalingsmethode van uw account.
subscriptionRenewalReminder-content-closing = Hoogachtend,
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-signature = Het { $productName }-team
subscriptionReplaced-subject = Uw abonnement is bijgewerkt als onderdeel van uw upgrade
subscriptionReplaced-title = Uw abonnement is bijgewerkt
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReplaced-content-replaced = Uw individuele abonnement op { $productName } is vervangen en maakt nu deel uit van uw nieuwe bundel.
subscriptionReplaced-content-credit = U ontvangt een tegoed voor ongebruikte tijd vanuit uw vorige abonnement. Dit tegoed wordt automatisch aan uw account toegevoegd en gebruikt voor toekomstige kosten.
subscriptionReplaced-content-no-action = U hoeft niets te doen.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSubsequentInvoice-subject = De betaling voor { $productName } is ontvangen
subscriptionSubsequentInvoice-title = Bedankt dat u abonnee bent!
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSubsequentInvoice-content-received = We hebben uw laatste betaling voor { $productName } ontvangen.
# Variables:
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025
subscriptionSubsequentInvoice-content-your-next-invoice = Uw volgende factuur wordt op { $nextInvoiceDateOnly } in rekening gebracht.
# Variables:
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionUpgrade-subject = U hebt geüpgraded naar { $productName }
subscriptionUpgrade-title = Bedankt voor uw upgrade!
# Variables:
# $productNameOld (String) - The name of the previously subscribed product, e.g. Mozilla VPN
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionUpgrade-upgrade-info-2 = U bent met succes geüpgraded naar { $productName }.

## Variables:
## $paymentAmountOld (String) - The amount of the previous subscription payment, including currency, e.g. $10.00
## $paymentAmountNew (String) - The amount of the new subscription payment, including currency, e.g. $10.00
## $paymentTaxOld (String) - The tax amount of the previous subscription payment, including currency, e.g. $1.00
## $paymentTaxNew (String) - The tax amount of the new subscription payment, including currency, e.g. $1.00
## $productPaymentCycleNew (String) - The interval of time from the end of one payment statement date to the next payment statement date of the new subscription, e.g. month
## $productPaymentCycleOld (String) - The interval of time from the end of one payment statement date to the next payment statement date of the old subscription, e.g. month
## $invoiceAmountDue (String) - The total that the customer owes after all credits, discounts, and taxes have been applied
## $paymentProrated (String) - The one time fee to reflect the higher charge for the remainder of the payment cycle, including currency, e.g. $10.00

subscriptionUpgrade-content-charge-prorated-1 = Er is een eenmalige vergoeding van { $invoiceAmountDue } in rekening gebracht om de hogere prijs van uw abonnement voor de rest van deze factureringsperiode ({ $productPaymentCycleOld }) te weerspiegelen.
subscriptionUpgrade-content-charge-credit = U hebt een accounttegoed ontvangen voor een bedrag van { $paymentProrated }.
subscriptionUpgrade-content-subscription-next-bill-change = Vanaf uw volgende factuur wijzigt de prijs van uw abonnement.
subscriptionUpgrade-content-old-price-day = Het vorige tarief was { $paymentAmountOld } per dag.
subscriptionUpgrade-content-old-price-week = Het vorige tarief was { $paymentAmountOld } per week.
subscriptionUpgrade-content-old-price-month = Het vorige tarief was { $paymentAmountOld } per maand.
subscriptionUpgrade-content-old-price-halfyear = Het vorige tarief was { $paymentAmountOld } per zes maanden.
subscriptionUpgrade-content-old-price-year = Het vorige tarief was { $paymentAmountOld } per jaar.
subscriptionUpgrade-content-old-price-default = Het vorige tarief was { $paymentAmountOld } per factureringsinterval.
subscriptionUpgrade-content-old-price-day-tax = Het vorige tarief was { $paymentAmountOld } + { $paymentTaxOld } btw per dag.
subscriptionUpgrade-content-old-price-week-tax = Het vorige tarief was { $paymentAmountOld } + { $paymentTaxOld } btw per week.
subscriptionUpgrade-content-old-price-month-tax = Het vorige tarief was { $paymentAmountOld } + { $paymentTaxOld } btw per maand.
subscriptionUpgrade-content-old-price-halfyear-tax = Het vorige tarief was { $paymentAmountOld } + { $paymentTaxOld } btw per zes maanden.
subscriptionUpgrade-content-old-price-year-tax = Het vorige tarief was { $paymentAmountOld } + { $paymentTaxOld } btw per jaar.
subscriptionUpgrade-content-old-price-default-tax = Het vorige tarief was { $paymentAmountOld } + { $paymentTaxOld } btw per factureringsinterval.
subscriptionUpgrade-content-new-price-day = Vanaf nu wordt { $paymentAmountNew } per dag in rekening gebracht, exclusief kortingen.
subscriptionUpgrade-content-new-price-week = Vanaf nu wordt { $paymentAmountNew } per week in rekening gebracht, exclusief kortingen.
subscriptionUpgrade-content-new-price-month = Vanaf nu wordt { $paymentAmountNew } per maand in rekening gebracht, exclusief kortingen.
subscriptionUpgrade-content-new-price-halfyear = Vanaf nu wordt { $paymentAmountNew } per zes maanden in rekening gebracht, exclusief kortingen.
subscriptionUpgrade-content-new-price-year = Vanaf nu wordt { $paymentAmountNew } per jaar in rekening gebracht, exclusief kortingen.
subscriptionUpgrade-content-new-price-default = Vanaf nu wordt { $paymentAmountNew } per factureringsinterval in rekening gebracht, exclusief kortingen.
subscriptionUpgrade-content-new-price-day-dtax = Vanaf nu wordt { $paymentAmountNew } + { $paymentTaxNew } btw per dag in rekening gebracht, exclusief kortingen.
subscriptionUpgrade-content-new-price-week-tax = Vanaf nu wordt { $paymentAmountNew } + { $paymentTaxNew } btw per week in rekening gebracht, exclusief kortingen.
subscriptionUpgrade-content-new-price-month-tax = Vanaf nu wordt { $paymentAmountNew } + { $paymentTaxNew } btw per maand in rekening gebracht, exclusief kortingen.
subscriptionUpgrade-content-new-price-halfyear-tax = Vanaf nu wordt { $paymentAmountNew } + { $paymentTaxNew } btw per zes maanden in rekening gebracht, exclusief kortingen.
subscriptionUpgrade-content-new-price-year-tax = Vanaf nu wordt { $paymentAmountNew } + { $paymentTaxNew } btw per jaar in rekening gebracht, exclusief kortingen.
subscriptionUpgrade-content-new-price-default-tax = Vanaf nu wordt { $paymentAmountNew } + { $paymentTaxNew } btw per factureringsinterval in rekening gebracht, exclusief kortingen.
subscriptionUpgrade-existing = Als een van uw bestaande abonnementen deze upgrade overlapt, verwerken we deze en sturen we u een apart e-mailbericht met de details. Als uw nieuwe abonnement producten omvat die installatie vereisen, sturen we u een afzonderlijk e-mailbericht met installatie-instructies.
subscriptionUpgrade-auto-renew = Uw abonnement wordt automatisch elke factureringsperiode verlengd, tenzij u ervoor kiest om op te zeggen.
subscriptionsPaymentExpired-subject-2 = De betalingsmethode voor uw abonnementen is verlopen of verloopt binnenkort
subscriptionsPaymentExpired-title-2 = Uw betalingsmethode is verlopen of verloopt binnenkort
subscriptionsPaymentExpired-content-2 = De betalingsmethode die u gebruikt voor betalingen voor de volgende abonnementen is verlopen of verloopt binnenkort.
subscriptionsPaymentProviderCancelled-subject = Bijwerken van betalingsgegevens vereist voor { -brand-mozilla }-abonnementen
subscriptionsPaymentProviderCancelled-title = Sorry, we hebben problemen met uw betalingsmethode
subscriptionsPaymentProviderCancelled-content-detected = We hebben een probleem met uw betalingsmethode voor de volgende abonnementen vastgesteld.
subscriptionsPaymentProviderCancelled-content-payment-1 = Mogelijk is uw betalingsmethode verlopen, of is uw huidige betalingsmethode verouderd.
