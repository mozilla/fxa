## Non-email strings

session-verify-send-push-title-2 = Logger du ind på din { -product-mozilla-account }?
session-verify-send-push-body-2 = Klik her for at bekræfte, at det er dig
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to verify phone ownership when registering a recovery phone
recovery-phone-setup-sms-body = { $code } er din { -brand-mozilla }-bekræftelseskode. Den udløber om fem minutter.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to verify phone ownership when registering a recovery phone
recovery-phone-setup-sms-short-body = { -brand-mozilla }-bekræftelseskode: { $code }
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for two-step authentication
recovery-phone-signin-sms-body = { $code } er din { -brand-mozilla }-genoprettelseskode. Den udløber om fem minutter.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for two-step authentication
recovery-phone-signin-sms-short-body = { -brand-mozilla }-kode: { $code }
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for account password reset
recovery-phone-reset-password-sms-body = { $code } er din { -brand-mozilla }-genoprettelseskode. Den udløber om fem minutter.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for account password reset
recovery-phone-reset-password-short-body = { -brand-mozilla }-kode: { $code }
subplat-header-mozilla-logo-2 = <img data-l10n-name="subplat-mozilla-logo" alt="{ -brand-mozilla }-logo">
subplat-footer-mozilla-logo-2 = <img data-l10n-name="mozilla-logo-footer" alt="{ -brand-mozilla }-logo">
subplat-automated-email = Denne mail er sendt automatisk; hvis du har modtaget denne mail ved en fejl, behøver du ikke foretage dig noget.
subplat-privacy-notice = Privatlivserklæring
subplat-privacy-plaintext = Privatlivserklæring:
subplat-update-billing-plaintext = { subplat-update-billing }:
# Variables:
#  $email (String) - A user's primary email address
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subplat-explainer-specific-2 = Du modtager denne mail, fordi { $email } har en { -product-mozilla-account }, og du har tilmeldt dig { $productName }.
# Variables:
#  $email (String) - A user's primary email address
subplat-explainer-reminder-form-2 = Du modtager denne mail, fordi { $email } har en { -product-mozilla-account }.
subplat-explainer-multiple-2 = Du modtager denne mail, fordi { $email } har en { -product-mozilla-account }, og du har abonneret på flere produkter.
subplat-explainer-was-deleted-2 = Du modtager denne mail, fordi { $email } blev brugt til at registrere en { -product-mozilla-account }.
subplat-manage-account-2 = Håndter indstillingerne for din { -product-mozilla-account } ved at besøge din <a data-l10n-name="subplat-account-page">kontoside</a>.
# Variables:
#  $accountSettingsUrl (String) - URL to Account Settings
subplat-manage-account-plaintext-2 = Håndter indstillingerne for din { -product-mozilla-account } ved at besøge din kontoside: { $accountSettingsUrl }
subplat-terms-policy = Betingelser og regler for annullering
subplat-terms-policy-plaintext = { subplat-terms-policy }:
subplat-cancel = Opsig abonnement
subplat-cancel-plaintext = { subplat-cancel }:
subplat-reactivate = Forny abonnement
subplat-reactivate-plaintext = { subplat-reactivate }:
subplat-update-billing = Opdater faktureringsoplysninger
subplat-privacy-policy = { -brand-mozilla }s privatlivspolitik
subplat-privacy-policy-2 = Privatlivserklæring for { -product-mozilla-accounts(capitalization: "uppercase") }
subplat-privacy-policy-plaintext = { subplat-privacy-policy }:
subplat-privacy-policy-plaintext-2 = { subplat-privacy-policy-2 }:
subplat-moz-terms = Tjenestevilkår for { -product-mozilla-accounts(capitalization: "uppercase") }
subplat-moz-terms-plaintext = { subplat-moz-terms }:
subplat-legal = Juridisk
subplat-legal-plaintext = { subplat-legal }:
subplat-privacy = Privatliv
subplat-privacy-website-plaintext = { subplat-privacy }:
cancellationSurvey = Hjælp os med at forbedre vores tjenester ved at deltage i denne <a data-l10n-name="cancellationSurveyUrl">korte undersøgelse</a>.
# After the colon, there's a link to https://survey.alchemer.com/s3/6534408/Privacy-Security-Product-Cancellation-of-Service-Q4-21
cancellationSurvey-plaintext = Hjælp os med at forbedre vores tjenester ved at deltage i denne korte undersøgelse:
payment-details = Betalingsoplysninger:
# Variables:
#  $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
payment-plan-invoice-number = Fakturanummer: { $invoiceNumber }
# Variables:
#  $invoiceDateOnly (String) - The date of the invoice, e.g. 01/20/2016
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
payment-plan-charged = Opkrævet: { $invoiceTotal } den { $invoiceDateOnly }
# Variables
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
payment-plan-next-invoice = Næste faktura: { $nextInvoiceDateOnly }

## $paymentProviderName (String) - The brand name of the payment method, e.g. PayPal, Apple Pay, Google Pay, Link

payment-method-payment-provider = <b>Betalingsmetode:</b> { $paymentProviderName }
payment-method-payment-provider-plaintext = Betalingsmetode: { $paymentProviderName }

## This string displays when the type of credit card is known
## https://stripe.com/docs/payments/cards/supported-card-brands
## Variables:
##  $cardName (String) - The brand name of the credit card, e.g. American Express
##  $lastFour (String) - The last four digits of the credit card, e.g. 5309

payment-provider-card-name-ending-in-plaintext = Betalingsmetode: { $cardName }, der ender på { $lastFour }
payment-provider-card-ending-in-plaintext = Betalingsmetode: Kort, der ender på { $lastFour }
payment-provider-card-ending-in = <b>Betalingsmetode:</b> Kort, der ender på { $lastFour }
payment-provider-card-ending-in-card-name = <b>Betalingsmetode:</b> { $cardName }, der ender på { $lastFour }
subscription-charges-invoice-summary = Fakturaoversigt

# Variables:


## $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
## $invoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025

subscription-charges-invoice-number = <b>Fakturanummer:</b> { $invoiceNumber }
subscription-charges-invoice-number-plaintext = Fakturanummer: { $invoiceNumber }
subscription-charges-invoice-date = <b>Dato:</b> { $invoiceDateOnly }
subscription-charges-invoice-date-plaintext = Dato: { $invoiceDateOnly }
subscription-charges-prorated-price = Forholdsmæssig pris
# $remainingAmountTotal (String) - The prorated amount of the subscription invoice, including currency, e.g. $4.00
subscription-charges-prorated-price-plaintext = Forholdsmæssig pris: { $remainingAmountTotal }
subscription-charges-list-price = Listepris
# $offeringPrice (String) - The list price of the subscription offering, including currency, e.g. $10.00
subscription-charges-list-price-plaintext = Listepris: { $offeringPrice }
subscription-charges-credit-from-unused-time = Tilgodehavende fra ubrugt tid
# $unusedAmountTotal (String) - The credit amount from unused time of the subscription invoice, including currency, e.g. $2.00
subscription-charges-credit-from-unused-time-plaintext = Tilgodehavende fra ubrugt tid:{ $unusedAmountTotal }
subscription-charges-subtotal = <b>Subtotal</b>
# $invoiceSubtotal (String) - The amount, before discount, of the subscription invoice, including currency, e.g. $10.00
subscriptionFirstInvoiceDiscount-content-subtotal = Subtotal: { $invoiceSubtotal }

## $invoiceDiscountAmount (String) - The amount of the discount of the subscription invoice, including currency, e.g. $2.00
## $discountDuration - The duration of the discount in number of months, e.g. "3" if the discount is 3-months

subscription-charges-one-time-discount = Engangsrabat
subscription-charges-one-time-discount-plaintext = Engangsrabat: { $invoiceDiscountAmount }
subscription-charges-repeating-discount =
    { $discountDuration ->
        [one] { $discountDuration }-måneds rabat
       *[other] { $discountDuration }-måneders rabat
    }
subscription-charges-repeating-discount-plaintext =
    { $discountDuration ->
        [one] { $discountDuration }-måneds rabat: { $invoiceDiscountAmount }
       *[other] { $discountDuration }-måneders rabat: { $invoiceDiscountAmount }
    }
subscription-charges-discount = Rabat
subscription-charges-discount-plaintext = Rabat: { $invoiceDiscountAmount }
subscription-charges-taxes = Afgifter og gebyrer
# $invoiceTaxAmount (String) - The amount of the tax of the subscription invoice, including currency, e.g. $2.00
subscriptionCharges-content-tax-plaintext = Afgifter og gebyrer: { $invoiceTaxAmount }
subscription-charges-total = <b>I alt</b>
# $invoiceTotal (String) - The total amount of the subscription invoice, including currency, e.g. $10.00
subscription-charges-total-plaintext = I alt: { $invoiceTotal }
subscription-charges-credit-applied = Tilgodehavende anvendt
# $creditApplied (String) - The amount of credit applied to the subscription invoice, including currency, e.g. $2.00
subscription-charges-credit-applied-plaintext = Tilgodehavende anvendt: { $creditApplied }
subscription-charges-amount-paid = <b>Beløb betalt</b>
# $invoiceAmountDue (String) - The total that the customer owes after all credits, discounts, and taxes have been applied, including currency, e.g. $8.00
subscription-charges-amount-paid-plaintext = Beløb betalt: { $invoiceAmountDue }
# $creditReceived (String) - The amount, after discount, of the subscription invoice, including currency, e.g. $8.00
subscription-charges-credit-received = Du er blevet godskrevet { $creditReceived }, som vil blive anvendt på dine fremtidige fakturaer.

##

subscriptionSupport = Har du spørgsmål til dit abonnement? Vores <a data-l10n-name="subscriptionSupportUrl">supportteam</a> står klar til at hjælpe dig.
# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupport-plaintext = Har du spørgsmål om dit abonnement? Vores supportteam står klar til at hjælpe dig:
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSupportContact = Tak fordi du abonnerer på { $productName }. Hvis du har nogle spørgsmål om dit abonnement eller brug for mere information om { $productName }, så <a data-l10n-name="subscriptionSupportUrl">kontakt os</a>.
# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupportContact-plaintext = Tak fordi du abonnerer på { $productName }. Hvis du har nogle spørgsmål om dit abonnement eller har brug for mere information om { $productName }, så kontakt os:
subscription-support-get-help = Få hjælp med dit abonnement
subscription-support-manage-your-subscription = <a data-l10n-name="manageSubscriptionUrl">Håndter dit abonnement</a>
# After the colon, there's a link to https://payments.firefox.com/subscriptions
subscription-support-manage-your-subscription-plaintext = Håndter dit abonnement:
subscription-support-contact-support = <a data-l10n-name="subscriptionSupportUrl">Kontakt support</a>
# After the colon, there's a link to https://support.mozilla.com/products
subscription-support-contact-support-plaintext = Kontakt support:
subscriptionUpdateBillingEnsure = Du kan sikre dig, at din betalingsmetode og dine kontooplysninger er opdaterede <a data-l10n-name="updateBillingUrl">her</a>.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdateBillingEnsure-plaintext = Du kan sikre dig, at din betalingsmetode og dine kontooplysninger er opdaterede her:
subscriptionUpdateBillingTry = Vi prøver at gennemføre din betaling igen i løbet af de næste par dage. Det kan være, at du bliver nødt til at hjælpe os med at løse betalingsproblemet ved at <a data-l10n-name="updateBillingUrl">opdatere dine betalingsinformationer</a>.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdateBillingTry-plaintext = Vi prøver at gennemføre din betaling igen i løbet af de næste par dage. Det kan være, at du bliver nødt til at hjælpe os med at løse betalingsproblemet ved at opdatere dine betalingsinformationer:
subscriptionUpdatePayment = <a data-l10n-name="updateBillingUrl">Opdater dine betalingsinformationer</a> så hurtigt som muligt for at undgå afbrydelse af din tjeneste.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdatePayment-plaintext = Opdater dine betalingsinformationer så hurtigt som muligt for at undgå afbrydelse af din tjeneste:
view-invoice-link-action = Se faktura
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
downloadSubscription-content-2 = Lad os komme i gang med at bruge alle funktionerne i dit abonnement:
downloadSubscription-link-action-2 = Kom i gang
fraudulentAccountDeletion-subject-2 = Din { -product-mozilla-account } blev slettet
fraudulentAccountDeletion-title = Din konto blev slettet
fraudulentAccountDeletion-content-part1-v2 = For nylig blev en { -product-mozilla-account } oprettet ved hjælp af denne mailadresse, ligesom der blev opkrævet betaling for et abonnement. Som vi gør med alle nye konti, bad vi dig bekræfte din konto ved først at validere denne mailadresse.
fraudulentAccountDeletion-content-part2-v2 = På nuværende tidspunkt kan vi se, at kontoen aldrig blev bekræftet. Da dette trin ikke er blevet fuldført, er vi ikke sikre på, om oprettelsen af abonnementet var autoriseret. Vi har derfor slettet den { -product-mozilla-account }, der er registreret med denne mailadresse, ligesom abonnementet blev annulleret og alle opkrævninger blev refunderet.
fraudulentAccountDeletion-contact = Hvis du har spørgsmål, så kontakt vores <a data-l10n-name="mozillaSupportUrl">support-team</a>.
# Variables:
#  $mozillaSupportUrl (String) - Link to https://support.mozilla.org
fraudulentAccountDeletion-contact-plaintext = Hvis du har spørgsmål, så kontakt vores support-team: { $mozillaSupportUrl }
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountDeletion-subject = Dit abonnement på { $productName } er blevet annulleret
subscriptionAccountDeletion-title = Vi er kede af, at du opsiger dit abonnement
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $invoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
subscriptionAccountDeletion-content-cancelled-2 = Du har for nylig slettet din { -product-mozilla-account }. Vi har derfor annulleret dit abonnement på { $productName }. Din sidste betaling på { $invoiceTotal } blev betalt den { $invoiceDateOnly }.
subscriptionAccountReminderFirst-subject = Påmindelse: Færdiggør opsætningen af din konto
subscriptionAccountReminderFirst-title = Du kan ikke få adgang til dit abonnement endnu
subscriptionAccountReminderFirst-content-info-3 = For et par dage siden oprettede du en { -product-mozilla-account }, men bekræftede den aldrig. Vi håber, at du vil færdiggøre opsætningen af din konto, så du kan bruge dit nye abonnement.
subscriptionAccountReminderFirst-content-select-2 = Vælg "Opret adgangskode" for at opsætte en ny adgangskode og færdiggøre bekræftelsen af din konto.
subscriptionAccountReminderFirst-action = Opret adgangskode
subscriptionAccountReminderFirst-action-plaintext = { subscriptionAccountReminderFirst-action }:
subscriptionAccountReminderSecond-subject = Sidste påmindelse: Opsæt din konto
subscriptionAccountReminderSecond-title-2 = Velkommen til { -brand-mozilla }!
subscriptionAccountReminderSecond-content-info-3 = For et par dage siden oprettede du en { -product-mozilla-account }, men bekræftede den aldrig. Vi håber, at du vil færdiggøre opsætningen af din konto, så du kan bruge dit nye abonnement.
subscriptionAccountReminderSecond-content-select-2 = Vælg "Opret adgangskode" for at opsætte en ny adgangskode og færdiggøre bekræftelsen af din konto.
subscriptionAccountReminderSecond-action = Opret adgangskode
subscriptionAccountReminderSecond-action-plaintext = { subscriptionAccountReminderSecond-action }:
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionCancellation-subject = Dit abonnement på { $productName } er blevet annulleret
subscriptionCancellation-title = Vi er kede af, at du opsiger dit abonnement

## Variables
##   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
##   $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
##   $invoiceDateOnly (String) - The date of the invoice, e.g. 01/20/2016

subscriptionCancellation-content-2 = Vi har annulleret dit abonnement på { $productName }. Din sidste betaling på { $invoiceTotal } blev betalt den { $invoiceDateOnly }.
subscriptionCancellation-outstanding-content-2 = Vi har annulleret dit abonnement på { $productName }. Din sidste betaling på { $invoiceTotal } bliver betalt den { $invoiceDateOnly }.
# Variables
#   $serviceLastActiveDateOnly (String) - The date of last active service, e.g. 01/20/2016
subscriptionCancellation-content-continue = Din tjeneste fortsætter indtil udgangen af din nuværende faktureringsperiode, som er { $serviceLastActiveDateOnly }.
# Variables:
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-subject = Du har skiftet til { $productName }
# Variables:
# $productNameOld (String) - The name of the previously subscribed product, e.g. Mozilla VPN
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-content-switch = Du har skiftet fra { $productNameOld } til { $productName }.
# Variables:
# $paymentAmountOld (String) - The amount of the previous subscription payment, including currency, e.g. $10.00
# $paymentAmountNew (String) - The amount of the new subscription payment, including currency, e.g. $10.00
# $productPaymentCycleNew (String) - The interval of time from the end of one payment statement date to the next payment statement date of the new subscription, e.g. month
# $productPaymentCycleOld (String) - The interval of time from the end of one payment statement date to the next payment statement date of the old subscription, e.g. month
# $paymentProrated (String) - The one time fee to reflect the higher charge for the remainder of the payment cycle, including currency, e.g. $10.00
subscriptionDowngrade-content-charge-info = Fra og med din næste regning vil din opkrævning blive ændret fra { $paymentAmountOld } pr. { $productPaymentCycleOld } til { $paymentAmountNew } pr. { $productPaymentCycleNew }. På det tidspunkt vil du også få godskrevet et engangsbeløb på { $paymentProrated } for at afspejle den lavere opkrævning for resten af dette { $productPaymentCycleOld }.
# Variables:
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-content-install = Hvis du skal installere ny software for at bruge { $productName }, vil du modtage en separat mail med vejledning i, hvordan du henter det.
subscriptionDowngrade-content-auto-renew = Dit abonnement fornys automatisk hver faktureringsperiode, medmindre du vælger at annullere.
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionEndingReminder-subject = Dit abonnement på { $productName } udløber snart
subscriptionEndingReminder-title = Dit abonnement på { $productName } udløber snart
# Variables:
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
#   $serviceLastActiveDateOnly (String) - The date of last active service, e.g. 01/20/2016
subscriptionEndingReminder-content-line1 = Din adgang til { $productName } ophører den <strong>{ $serviceLastActiveDateOnly }</strong>.
subscriptionEndingReminder-content-line2 = Hvis du vil fortsætte med at bruge { $productName }, kan du genaktivere dit abonnement under <a data-l10n-name="subscriptionEndingReminder-account-settings">Kontoindstillinger</a>, inden den <strong>{ $serviceLastActiveDateOnly }</strong>. Hvis du har brug for hjælp, så <a data-l10n-name="subscriptionEndingReminder-contact-support">kontakt vores supportteam</a>.
subscriptionEndingReminder-content-line1-plaintext = Din adgang til { $productName } ophører den { $serviceLastActiveDateOnly }.
subscriptionEndingReminder-content-line2-plaintext = Hvis du vil fortsætte med at bruge { $productName }, kan du genaktivere dit abonnement under Kontoindstillinger, inden den { $serviceLastActiveDateOnly }. Hvis du har brug for hjælp, så kontakt vores supportteam.
subscriptionEndingReminder-content-closing = Tak fordi du er abonnent!
subscriptionEndingReminder-churn-title = Vil du beholde adgangen?
subscriptionEndingReminder-churn-terms = <a data-l10n-name="subscriptionEndingReminder-churn-terms">Begrænsede vilkår og restriktioner gælder</a>
# Variables:
#  $churnTermsUrlWithUtm (String) - URL to the terms and restrictions page applied to this promotion
subscriptionEndingReminder-churn-terms-plaintext = Begrænsede vilkår og restriktioner gælder: { $churnTermsUrlWithUtm }
# Variables:
#  $subscriptionSupportUrlWithUtm (String) - URL to the subscription products support page
subscriptionEndingReminder-content-support-plaintext = Kontakt vores supportteam: { $subscriptionSupportUrlWithUtm }
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFailedPaymentsCancellation-subject = Dit abonnement på { $productName } er blevet annulleret
subscriptionFailedPaymentsCancellation-title = Dit abonnement er blevet annulleret
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFailedPaymentsCancellation-content = Vi har annulleret dit abonnement på { $productName }, fordi flere betalingsforsøg mislykkedes. For at få adgang igen skal du starte et nyt abonnement med en opdateret betalingsmetode.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-subject = Betaling for { $productName } bekræftet
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-title = Tak fordi du abonnerer på { $productName }
subscriptionFirstInvoice-content-processing = Din betaling behandles i øjeblikket og kan tage op til fire arbejdsdage at fuldføre.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-content-install-2 = Du vil modtage en separat mail om, hvordan du begynder at bruge { $productName }.
subscriptionFirstInvoice-content-auto-renew = Dit abonnement fornys automatisk hver faktureringsperiode, medmindre du vælger at annullere.
# Variables:
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025
subscriptionFirstInvoice-content-your-next-invoice = Din næste faktura udstedes den { $nextInvoiceDateOnly }.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentExpired-subject-2 = Betalingsmetode for { $productName } er udløbet eller udløber snart
subscriptionPaymentExpired-title-2 = Din betalingsmetode er udløbet eller udløber snart
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentExpired-content-2 = Betalingsmetoden, du bruger til { $productName }, er udløbet eller udløber snart.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-subject = Betaling for{ $productName } mislykkedes
subscriptionPaymentFailed-title = Vi beklager, men vi har problemer med din betaling
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-content-problem = Vi havde et problem med din seneste betaling for { $productName }.
subscriptionPaymentFailed-content-outdated-1 = Det kan være, at din betalingsmetode er udløbet, eller at din nuværende betalingsmetode er forældet.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentProviderCancelled-subject = Du skal opdatere dine betalingsinformationer for { $productName }
subscriptionPaymentProviderCancelled-title = Vi har desværre problemer med din betalingsmetode
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentProviderCancelled-content-detect = Vi har registreret et problem med din betalingsmetode for { $productName }.
subscriptionPaymentProviderCancelled-content-reason-1 = Det kan være, at dit betalingsmetode er udløbet, eller at din nuværende betalingsmetode er forældet.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-subject = Fornyelse af abonnement på { $productName }
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-title = Tak fordi du har fornyet dit abonnement på { $productName }!
# Variables:
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. 2016/01/20
subscriptionReactivation-content = Frekvensen af faktureringer og dine betalinger ændrer sig ikke. Din næste opkrævning er på { $invoiceTotal } og vil blive trukket { $nextInvoiceDateOnly }. Dit abonnement er fortløbende og bliver automatisk fornyet, hvis du ikke annullerer det.
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-subject = Meddelelse om automatisk fornyelse af { $productName }
subscriptionRenewalReminder-title = Dit abonnement vil snart blive fornyet
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-greeting = Kære { $productName }-kunde
# Variables
#   $reminderLength (String) - The number of days until the current subscription is set to automatically renew, e.g. 14
subscriptionRenewalReminder-content-intro = Dit nuværende abonnement er indstillet til automatisk fornyelse om { $reminderLength } dage.
subscriptionRenewalReminder-content-discount-change = Din næste faktura afspejler en prisændring, da en tidligere rabat er udløbet, og en ny rabat er blevet anvendt.
subscriptionRenewalReminder-content-discount-ending = Da en tidligere rabat er udløbet, fornyes dit abonnement til standardprisen.
subscriptionRenewalReminder-content-closing = Med venlig hilsen
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-signature = Holdet bag { $productName }
subscriptionReplaced-subject = Dit abonnement er blevet opdateret som en del af din opgradering
subscriptionReplaced-title = Dit abonnement er blevet opdateret
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReplaced-content-replaced = Dit individuelle abonnement på { $productName } er blevet erstattet og er nu inkluderet i din nye pakke.
subscriptionReplaced-content-credit = Du vil blive godskrevet et beløb for ubrugt tid fra dit tidligere abonnement. Dette beløb vil automatisk blive anvendt på din konto og brugt til at dække fremtidige betalinger.
subscriptionReplaced-content-no-action = Du behøver ikke at foretage dig noget.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSubsequentInvoice-subject = Betaling for { $productName } modtaget
subscriptionSubsequentInvoice-title = Tak fordi du er abonnent!
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSubsequentInvoice-content-received = Vi modtog din seneste betaling for { $productName }.
# Variables:
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025
subscriptionSubsequentInvoice-content-your-next-invoice = Din næste faktura udstedes den { $nextInvoiceDateOnly }.
# Variables:
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionUpgrade-subject = Du har opgraderet til { $productName }
subscriptionUpgrade-title = Tak fordi du opgraderer!
# Variables:
# $productNameOld (String) - The name of the previously subscribed product, e.g. Mozilla VPN
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionUpgrade-upgrade-info-2 = Du har opgraderet til { $productName }.

## Variables:
## $paymentAmountOld (String) - The amount of the previous subscription payment, including currency, e.g. $10.00
## $paymentAmountNew (String) - The amount of the new subscription payment, including currency, e.g. $10.00
## $paymentTaxOld (String) - The tax amount of the previous subscription payment, including currency, e.g. $1.00
## $paymentTaxNew (String) - The tax amount of the new subscription payment, including currency, e.g. $1.00
## $productPaymentCycleNew (String) - The interval of time from the end of one payment statement date to the next payment statement date of the new subscription, e.g. month
## $productPaymentCycleOld (String) - The interval of time from the end of one payment statement date to the next payment statement date of the old subscription, e.g. month
## $invoiceAmountDue (String) - The total that the customer owes after all credits, discounts, and taxes have been applied
## $paymentProrated (String) - The one time fee to reflect the higher charge for the remainder of the payment cycle, including currency, e.g. $10.00

subscriptionUpgrade-content-charge-prorated-1 = Du er blevet opkrævet et engangsgebyr på { $invoiceAmountDue } for at afspejle dit abonnements højere pris for resten af denne faktureringsperiode ({ $productPaymentCycleOld }).
subscriptionUpgrade-content-charge-credit = Du er blevet godskrevet et beløb på { $paymentProrated }.
subscriptionUpgrade-content-subscription-next-bill-change = Fra og med din næste regning vil prisen på dit abonnement ændre sig.
subscriptionUpgrade-content-old-price-day = Den tidligere pris var { $paymentAmountOld } per dag.
subscriptionUpgrade-content-old-price-week = Den tidligere pris var { $paymentAmountOld } per uge.
subscriptionUpgrade-content-old-price-month = Den tidligere pris var { $paymentAmountOld } per måned.
subscriptionUpgrade-content-old-price-halfyear = Den tidligere pris var { $paymentAmountOld } per halvår.
subscriptionUpgrade-content-old-price-year = Den tidligere pris var { $paymentAmountOld } per år.
subscriptionUpgrade-content-old-price-default = Den tidligere pris var { $paymentAmountOld } per faktureringsperiode.
subscriptionUpgrade-content-old-price-day-tax = Den tidligere pris var { $paymentAmountOld } + { $paymentTaxOld } afgift per dag.
subscriptionUpgrade-content-old-price-week-tax = Den tidligere pris var { $paymentAmountOld } + { $paymentTaxOld } afgift per uge.
subscriptionUpgrade-content-old-price-month-tax = Den tidligere pris var { $paymentAmountOld } + { $paymentTaxOld } afgift per måned.
subscriptionUpgrade-content-old-price-halfyear-tax = Den tidligere pris var { $paymentAmountOld } + { $paymentTaxOld } afgift per halvår.
subscriptionUpgrade-content-old-price-year-tax = Den tidligere pris var { $paymentAmountOld } + { $paymentTaxOld } afgift per år.
subscriptionUpgrade-content-old-price-default-tax = Den tidligere pris var { $paymentAmountOld } + { $paymentTaxOld } afgift per faktureringsperiode.
subscriptionUpgrade-content-new-price-day = Fremover vil du blive opkrævet { $paymentAmountNew } per dag, eksklusive rabatter.
subscriptionUpgrade-content-new-price-week = Fremover vil du blive opkrævet { $paymentAmountNew } per uge, eksklusive rabatter.
subscriptionUpgrade-content-new-price-month = Fremover vil du blive opkrævet { $paymentAmountNew } per måned, eksklusive rabatter.
subscriptionUpgrade-content-new-price-halfyear = Fremover vil du blive opkrævet { $paymentAmountNew } per halvår, eksklusive rabatter.
subscriptionUpgrade-content-new-price-year = Fremover vil du blive opkrævet { $paymentAmountNew } per år, eksklusive rabatter.
subscriptionUpgrade-content-new-price-default = Fremover vil du blive opkrævet { $paymentAmountNew } per faktureringsperiode, eksklusive rabatter.
subscriptionUpgrade-content-new-price-day-dtax = Fremover vil du blive opkrævet { $paymentAmountNew } + { $paymentTaxNew } afgift per dag, eksklusive rabatter.
subscriptionUpgrade-content-new-price-week-tax = Fremover vil du blive opkrævet { $paymentAmountNew } + { $paymentTaxNew } afgift per uge, eksklusive rabatter.
subscriptionUpgrade-content-new-price-month-tax = Fremover vil du blive opkrævet { $paymentAmountNew } + { $paymentTaxNew } afgift per måned, eksklusive rabatter.
subscriptionUpgrade-content-new-price-halfyear-tax = Fremover vil du blive opkrævet { $paymentAmountNew } + { $paymentTaxNew } afgift per halvår, eksklusive rabatter.
subscriptionUpgrade-content-new-price-year-tax = Fremover vil du blive opkrævet { $paymentAmountNew } + { $paymentTaxNew } afgift per år, eksklusive rabatter.
subscriptionUpgrade-content-new-price-default-tax = Fremover vil du blive opkrævet { $paymentAmountNew } + { $paymentTaxNew } afgift per faktureringsperiode, eksklusive rabatter.
subscriptionUpgrade-existing = Hvis nogle af dine eksisterende abonnementer overlapper med denne opgradering, tager vi højde for det og sender dig en separat mail med detaljerne. Hvis din nye plan inkluderer produkter, der kræver installation, sender vi dig en separat mail med en opsætningsvejledning.
subscriptionUpgrade-auto-renew = Dit abonnement fornys automatisk hver faktureringsperiode, medmindre du vælger at annullere.
subscriptionsPaymentExpired-subject-2 = Betalingsmetoden for dine abonnementer er udløbet eller udløber snart
subscriptionsPaymentExpired-title-2 = Din betalingsmetode er udløbet eller udløber snart
subscriptionsPaymentExpired-content-2 = Betalingsmetoden, du bruger til at betale for følgende abonnementer, er udløbet eller udløber snart.
subscriptionsPaymentProviderCancelled-subject = Du skal opdatere dine betalingsinformationer for { -brand-mozilla }-abonnementer
subscriptionsPaymentProviderCancelled-title = Vi har desværre problemer med din betalingsmetode
subscriptionsPaymentProviderCancelled-content-detected = Vi har registreret et problem med din betalingsmetode for følgende abonnementer.
subscriptionsPaymentProviderCancelled-content-payment-1 = Det kan være, at din betalingsmetode er udløbet, eller at din nuværende betalingsmetode er forældet.
