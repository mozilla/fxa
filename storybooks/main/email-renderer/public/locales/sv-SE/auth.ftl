## Non-email strings

session-verify-send-push-title-2 = Logga in på ditt { -product-mozilla-account }?
session-verify-send-push-body-2 = Klicka här för att bekräfta att det är du
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to verify phone ownership when registering a recovery phone
recovery-phone-setup-sms-body = { $code } är din verifieringskod för { -brand-mozilla }. Upphör om 5 minuter.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to verify phone ownership when registering a recovery phone
recovery-phone-setup-sms-short-body = { -brand-mozilla } verifieringskod: { $code }
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for two-step authentication
recovery-phone-signin-sms-body = { $code } är din återställningskod för { -brand-mozilla }. Upphör om 5 minuter.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for two-step authentication
recovery-phone-signin-sms-short-body = { -brand-mozilla } kod: { $code }
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for account password reset
recovery-phone-reset-password-sms-body = { $code } är din återställningskod för { -brand-mozilla }. Upphör om 5 minuter.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for account password reset
recovery-phone-reset-password-short-body = { -brand-mozilla } kod: { $code }
subplat-header-mozilla-logo-2 = <img data-l10n-name="subplat-mozilla-logo" alt="{ -brand-mozilla } logotyp">
subplat-footer-mozilla-logo-2 = <img data-l10n-name="mozilla-logo-footer" alt="{ -brand-mozilla } logotyp">
subplat-automated-email = Det här är ett automatiskt e-postmeddelande; om du felaktigt har fått det behöver du inte göra något.
subplat-privacy-notice = Sekretessmeddelande
subplat-privacy-plaintext = Sekretessmeddelande:
subplat-update-billing-plaintext = { subplat-update-billing }:
# Variables:
#  $email (String) - A user's primary email address
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subplat-explainer-specific-2 = Du får det här e-postmeddelandet eftersom { $email } har ett { -product-mozilla-account } och du registrerade dig för { $productName }.
# Variables:
#  $email (String) - A user's primary email address
subplat-explainer-reminder-form-2 = Du får det här e-postmeddelandet eftersom { $email } har ett { -product-mozilla-account }.
subplat-explainer-multiple-2 = Du får det här e-postmeddelandet eftersom { $email } har ett { -product-mozilla-account } och du har prenumererat på flera produkter.
subplat-explainer-was-deleted-2 = Du får det här e-postmeddelandet eftersom { $email } har registrerats för ett { -product-mozilla-account }.
subplat-manage-account-2 = Hantera dina inställningar för { -product-mozilla-account } genom att besöka din <a data-l10n-name="subplat-account-page">kontosida</a>.
# Variables:
#  $accountSettingsUrl (String) - URL to Account Settings
subplat-manage-account-plaintext-2 = Hantera dina inställningar för { -product-mozilla-account } genom att besöka din kontosida: { $accountSettingsUrl }
subplat-terms-policy = Villkor och avbokningsregler
subplat-terms-policy-plaintext = { subplat-terms-policy }:
subplat-cancel = Avbryt prenumeration
subplat-cancel-plaintext = { subplat-cancel }:
subplat-reactivate = Återaktivera prenumerationen
subplat-reactivate-plaintext = { subplat-reactivate }:
subplat-update-billing = Uppdatera faktureringsinformation
subplat-privacy-policy = Sekretesspolicy för { -brand-mozilla }
subplat-privacy-policy-2 = { -product-mozilla-accounts(capitalization: "uppercase") } sekretessmeddelande
subplat-privacy-policy-plaintext = { subplat-privacy-policy }:
subplat-privacy-policy-plaintext-2 = { subplat-privacy-policy-2 }:
subplat-moz-terms = { -product-mozilla-accounts(capitalization: "uppercase") } användarvillkor
subplat-moz-terms-plaintext = { subplat-moz-terms }:
subplat-legal = Juridisk information
subplat-legal-plaintext = { subplat-legal }:
subplat-privacy = Sekretess
subplat-privacy-website-plaintext = { subplat-privacy }:
cancellationSurvey = Hjälp oss att förbättra våra tjänster genom att svara på denna <a data-l10n-name="cancellationSurveyUrl">korta undersökning</a>.
# After the colon, there's a link to https://survey.alchemer.com/s3/6534408/Privacy-Security-Product-Cancellation-of-Service-Q4-21
cancellationSurvey-plaintext = Hjälp oss att förbättra våra tjänster genom att ta göra en kort undersökning:
payment-details = Betalningsinformation:
# Variables:
#  $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
payment-plan-invoice-number = Fakturanummer: { $invoiceNumber }
# Variables:
#  $invoiceDateOnly (String) - The date of the invoice, e.g. 01/20/2016
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
payment-plan-charged = Debiterad: { $invoiceTotal } den { $invoiceDateOnly }
# Variables
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
payment-plan-next-invoice = Nästa faktura: { $nextInvoiceDateOnly }

## $paymentProviderName (String) - The brand name of the payment method, e.g. PayPal, Apple Pay, Google Pay, Link

payment-method-payment-provider = <b>Betalningsmetod:</b> { $paymentProviderName }
payment-method-payment-provider-plaintext = Betalningsmetod: { $paymentProviderName }

## This string displays when the type of credit card is known
## https://stripe.com/docs/payments/cards/supported-card-brands
## Variables:
##  $cardName (String) - The brand name of the credit card, e.g. American Express
##  $lastFour (String) - The last four digits of the credit card, e.g. 5309

payment-provider-card-name-ending-in-plaintext = Betalningsmetod: { $cardName } slutar på { $lastFour }
payment-provider-card-ending-in-plaintext = Betalningsmetod: Kort som slutar på { $lastFour }
payment-provider-card-ending-in = <b>Betalningsmetod:</b> Kort som slutar på { $lastFour }
payment-provider-card-ending-in-card-name = <b>Betalningsmetod:</b> { $cardName } slutar på { $lastFour }
subscription-charges-invoice-summary = Fakturasammanfattning

# Variables:


## $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
## $invoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025

subscription-charges-invoice-number = <b>Fakturanummer:</b> { $invoiceNumber }
subscription-charges-invoice-number-plaintext = Fakturanummer: { $invoiceNumber }
subscription-charges-invoice-date = <b>Datum:</b> { $invoiceDateOnly }
subscription-charges-invoice-date-plaintext = Datum: { $invoiceDateOnly }
subscription-charges-prorated-price = Proportionellt pris
# $remainingAmountTotal (String) - The prorated amount of the subscription invoice, including currency, e.g. $4.00
subscription-charges-prorated-price-plaintext = Proportionellt pris: { $remainingAmountTotal }
subscription-charges-list-price = Listpris
# $offeringPrice (String) - The list price of the subscription offering, including currency, e.g. $10.00
subscription-charges-list-price-plaintext = Listpris: { $offeringPrice }
subscription-charges-credit-from-unused-time = Kredit från oanvänd tid
# $unusedAmountTotal (String) - The credit amount from unused time of the subscription invoice, including currency, e.g. $2.00
subscription-charges-credit-from-unused-time-plaintext = Kredit från oanvänd tid: { $unusedAmountTotal }
subscription-charges-subtotal = <b>Delsumma</b>
# $invoiceSubtotal (String) - The amount, before discount, of the subscription invoice, including currency, e.g. $10.00
subscriptionFirstInvoiceDiscount-content-subtotal = Delsumma: { $invoiceSubtotal }

## $invoiceDiscountAmount (String) - The amount of the discount of the subscription invoice, including currency, e.g. $2.00
## $discountDuration - The duration of the discount in number of months, e.g. "3" if the discount is 3-months

subscription-charges-one-time-discount = Engångsrabatt
subscription-charges-one-time-discount-plaintext = Engångsrabatt: { $invoiceDiscountAmount }
subscription-charges-repeating-discount =
    { $discountDuration ->
        [one] { $discountDuration }-månads rabatt
       *[other] { $discountDuration }-månaders rabatt
    }
subscription-charges-repeating-discount-plaintext =
    { $discountDuration ->
        [one] { $discountDuration }-månads rabatt: { $invoiceDiscountAmount }
       *[other] { $discountDuration }-månaders rabatt: { $invoiceDiscountAmount }
    }
subscription-charges-discount = Rabatt
subscription-charges-discount-plaintext = Rabatt: { $invoiceDiscountAmount }
subscription-charges-taxes = Skatter och avgifter
# $invoiceTaxAmount (String) - The amount of the tax of the subscription invoice, including currency, e.g. $2.00
subscriptionCharges-content-tax-plaintext = Skatter och avgifter: { $invoiceTaxAmount }
subscription-charges-total = <b>Totalt</b>
# $invoiceTotal (String) - The total amount of the subscription invoice, including currency, e.g. $10.00
subscription-charges-total-plaintext = Totalt: { $invoiceTotal }
subscription-charges-credit-applied = Kredit tillämpad
# $creditApplied (String) - The amount of credit applied to the subscription invoice, including currency, e.g. $2.00
subscription-charges-credit-applied-plaintext = Kredit tillämpad: { $creditApplied }
subscription-charges-amount-paid = <b> Betalt belopp</b>
# $invoiceAmountDue (String) - The total that the customer owes after all credits, discounts, and taxes have been applied, including currency, e.g. $8.00
subscription-charges-amount-paid-plaintext = Betalt belopp: { $invoiceAmountDue }
# $creditReceived (String) - The amount, after discount, of the subscription invoice, including currency, e.g. $8.00
subscription-charges-credit-received = Du har fått en kredit på { $creditReceived }, som kommer att appliceras på dina framtida fakturor.

##

subscriptionSupport = Frågor om ditt abonnemang? Vårt <a data-l10n-name="subscriptionSupportUrl">supportteam</a> är här för att hjälpa dig.
# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupport-plaintext = Frågor om din prenumeration? Vårt supportteam är här för att hjälpa dig:
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSupportContact = Tack för att du prenumererar på { $productName }. Om du har några frågor om din prenumeration eller behöver mer information om { $productName }, vänligen <a data-l10n-name="subscriptionSupportUrl">kontakta oss</a>.
# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupportContact-plaintext = Tack för att du prenumererar på { $productName }. Om du har några frågor om din prenumeration eller behöver mer information om { $productName }, vänligen kontakta oss:
subscription-support-get-help = Få hjälp med din prenumeration
subscription-support-manage-your-subscription = <a data-l10n-name="manageSubscriptionUrl">Hantera din prenumeration</a>
# After the colon, there's a link to https://payments.firefox.com/subscriptions
subscription-support-manage-your-subscription-plaintext = Hantera din prenumeration:
subscription-support-contact-support = <a data-l10n-name="subscriptionSupportUrl">Kontakta supporten</a>
# After the colon, there's a link to https://support.mozilla.com/products
subscription-support-contact-support-plaintext = Kontakta support:
subscriptionUpdateBillingEnsure = Du kan se till att din betalningsmetod och kontoinformation är uppdaterad <a data-l10n-name="updateBillingUrl">här</a>.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdateBillingEnsure-plaintext = Du kan se till att din betalningsmetod och kontoinformation är uppdaterad här:
subscriptionUpdateBillingTry = Vi kommer att försöka genomföra din betalning igen under de närmaste dagarna, men du kan behöva hjälpa oss att åtgärda den genom att <a data-l10n-name="updateBillingUrl">uppdatera din betalningsinformation</a>.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdateBillingTry-plaintext = Vi kommer försöka genomföra din betalning igen inom de närmaste dagarna, men du behöver kanske hjälpa oss att lösa problemet genom att uppdatera din betalningsinformation:
subscriptionUpdatePayment = För att förhindra eventuella avbrott i din tjänst, vänligen <a data-l10n-name="updateBillingUrl">uppdatera din betalningsinformation</a> så snart som möjligt.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdatePayment-plaintext = För att förhindra avbrott i din tjänst, uppdatera din betalningsinformation så snart som möjligt:
view-invoice-link-action = Visa faktura
# Variables:
#  $invoiceLink (String) - The link to the invoice
# After the colon, there's a link to https://pay.stripe.com/
view-invoice-plaintext = Visa faktura: { $invoiceLink }
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-subject = Välkommen till { $productName }
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-title = Välkommen till { $productName }
downloadSubscription-content-2 = Låt oss komma igång med alla funktioner som ingår i ditt abonnemang:
downloadSubscription-link-action-2 = Kom igång
fraudulentAccountDeletion-subject-2 = Ditt { -product-mozilla-account } raderades
fraudulentAccountDeletion-title = Ditt konto har raderats
fraudulentAccountDeletion-content-part1-v2 = Nyligen skapades ett { -product-mozilla-account } och en prenumeration debiterades med den här e-postadressen. Precis som vi gör med alla nya konton bad vi dig att bekräfta ditt konto genom att först validera den här e-postadressen.
fraudulentAccountDeletion-content-part2-v2 = I dagsläget ser vi att kontot aldrig blev bekräftat. Eftersom det här steget inte slutfördes är vi inte säkra på om detta var en auktoriserad prenumeration. Som ett resultat av detta raderades { -product-mozilla-account } som registrerats på den här e-postadressen och din prenumeration avbröts med alla avgifter återbetalda.
fraudulentAccountDeletion-contact = Om du har några frågor, kontakta vårt <a data-l10n-name="mozillaSupportUrl">supportteam</a>.
# Variables:
#  $mozillaSupportUrl (String) - Link to https://support.mozilla.org
fraudulentAccountDeletion-contact-plaintext = Om du har några frågor, vänligen kontakta vårt supportteam: { $mozillaSupportUrl }
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountDeletion-subject = Din prenumeration på { $productName } har avslutats
subscriptionAccountDeletion-title = Ledsen att se dig sluta
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $invoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
subscriptionAccountDeletion-content-cancelled-2 = Du raderade nyligen ditt { -product-mozilla-account }. Som ett resultat av detta har vi avslutat din prenumeration på { $productName }. Din sista betalning på { $invoiceTotal } betalades den { $invoiceDateOnly }.
subscriptionAccountReminderFirst-subject = Påminnelse: Slutför konfigureringen av ditt konto
subscriptionAccountReminderFirst-title = Du kan inte komma åt din prenumeration ännu
subscriptionAccountReminderFirst-content-info-3 = För några dagar sedan skapade du ett { -product-mozilla-account } men bekräftade det aldrig. Vi hoppas att du slutför konfigureringen av ditt konto så att du kan använda din nya prenumeration.
subscriptionAccountReminderFirst-content-select-2 = Välj "Skapa lösenord" för att skapa ett nytt lösenord och för att slutföra bekräftandet av ditt konto.
subscriptionAccountReminderFirst-action = Skapa lösenord
subscriptionAccountReminderFirst-action-plaintext = { subscriptionAccountReminderFirst-action }:
subscriptionAccountReminderSecond-subject = Sista påminnelse: Konfigurera ditt konto
subscriptionAccountReminderSecond-title-2 = Välkommen till { -brand-mozilla }!
subscriptionAccountReminderSecond-content-info-3 = För några dagar sedan skapade du ett { -product-mozilla-account } men bekräftade det aldrig. Vi hoppas att du slutför konfigureringen av ditt konto så att du kan använda din nya prenumeration.
subscriptionAccountReminderSecond-content-select-2 = Välj "Skapa lösenord" för att skapa ett nytt lösenord och slutföra bekräftandet av ditt konto.
subscriptionAccountReminderSecond-action = Skapa lösenord
subscriptionAccountReminderSecond-action-plaintext = { subscriptionAccountReminderSecond-action }:
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionCancellation-subject = Din prenumeration på { $productName } har avslutats
subscriptionCancellation-title = Ledsen att se dig sluta

## Variables
##   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
##   $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
##   $invoiceDateOnly (String) - The date of the invoice, e.g. 01/20/2016

subscriptionCancellation-content-2 = Vi har sagt upp din prenumeration på { $productName }. Din sista betalning på { $invoiceTotal } betalades den { $invoiceDateOnly }.
subscriptionCancellation-outstanding-content-2 = Vi har sagt upp din prenumeration på { $productName }. Din slutbetalning på { $invoiceTotal } kommer att betalas den { $invoiceDateOnly }.
# Variables
#   $serviceLastActiveDateOnly (String) - The date of last active service, e.g. 01/20/2016
subscriptionCancellation-content-continue = Din tjänst kommer att fortsätta till slutet av din nuvarande faktureringsperiod, som är { $serviceLastActiveDateOnly }.
# Variables:
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-subject = Du har bytt till { $productName }
# Variables:
# $productNameOld (String) - The name of the previously subscribed product, e.g. Mozilla VPN
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-content-switch = Du har bytt från { $productNameOld } till { $productName }.
# Variables:
# $paymentAmountOld (String) - The amount of the previous subscription payment, including currency, e.g. $10.00
# $paymentAmountNew (String) - The amount of the new subscription payment, including currency, e.g. $10.00
# $productPaymentCycleNew (String) - The interval of time from the end of one payment statement date to the next payment statement date of the new subscription, e.g. month
# $productPaymentCycleOld (String) - The interval of time from the end of one payment statement date to the next payment statement date of the old subscription, e.g. month
# $paymentProrated (String) - The one time fee to reflect the higher charge for the remainder of the payment cycle, including currency, e.g. $10.00
subscriptionDowngrade-content-charge-info = Från och med din nästa faktura kommer din debitering att ändras från { $paymentAmountOld } per { $productPaymentCycleOld } till { $paymentAmountNew } per { $productPaymentCycleNew }. Då kommer du också att få en engångskredit på { $paymentProrated } för att återspegla den lägre avgiften för resten av denna { $productPaymentCycleOld }.
# Variables:
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-content-install = Om det finns ny programvara för dig att installera för att använda { $productName } kommer du att få ett separat e-postmeddelande med nedladdningsinstruktioner.
subscriptionDowngrade-content-auto-renew = Din prenumeration förnyas automatiskt varje faktureringsperiod om du inte väljer att avbryta.
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionEndingReminder-subject = Din prenumeration på { $productName } upphör snart
subscriptionEndingReminder-title = Din prenumeration på { $productName } upphör snart
# Variables:
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
#   $serviceLastActiveDateOnly (String) - The date of last active service, e.g. 01/20/2016
subscriptionEndingReminder-content-line1 = Din åtkomst till { $productName } upphör den <strong>{ $serviceLastActiveDateOnly }</strong>.
subscriptionEndingReminder-content-line2 = Om du vill fortsätta använda { $productName } kan du återaktivera din prenumeration i <a data-l10n-name="subscriptionEndingReminder-account-settings">kontoinställningar</a> före <strong>{ $serviceLastActiveDateOnly }</strong>. Om du behöver hjälp, <a data-l10n-name="subscriptionEndingReminder-contact-support">kontakta vårt supportteam</a>.
subscriptionEndingReminder-content-line1-plaintext = Din åtkomst till { $productName } upphör { $serviceLastActiveDateOnly }.
subscriptionEndingReminder-content-line2-plaintext = Om du vill fortsätta använda { $productName } kan du återaktivera din prenumeration i kontoinställningar före { $serviceLastActiveDateOnly }. Om du behöver hjälp, kontakta vårt supportteam.
subscriptionEndingReminder-content-closing = Tack för att du är en värdefull prenumerant!
subscriptionEndingReminder-churn-title = Vill du behålla åtkomst?
subscriptionEndingReminder-churn-terms = <a data-l10n-name="subscriptionEndingReminder-churn-terms">Begränsade villkor och begränsningar gäller</a>
# Variables:
#  $churnTermsUrlWithUtm (String) - URL to the terms and restrictions page applied to this promotion
subscriptionEndingReminder-churn-terms-plaintext = Begränsade villkor och begränsningar gäller: { $churnTermsUrlWithUtm }
# Variables:
#  $subscriptionSupportUrlWithUtm (String) - URL to the subscription products support page
subscriptionEndingReminder-content-support-plaintext = Kontakta vårt supportteam: { $subscriptionSupportUrlWithUtm }
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFailedPaymentsCancellation-subject = Din prenumeration på { $productName } har avslutats
subscriptionFailedPaymentsCancellation-title = Din prenumeration har avslutats
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFailedPaymentsCancellation-content = Vi har avslutat din prenumeration på { $productName } eftersom flera betalningsförsök misslyckades. För att få åtkomst igen, starta en ny prenumeration med en uppdaterad betalningsmetod.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-subject = { $productName } betalning bekräftad
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-title = Tack för att du prenumererar på { $productName }
subscriptionFirstInvoice-content-processing = Din betalning behandlas för närvarande och kan ta upp till fyra arbetsdagar att slutföra.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-content-install-2 = Du kommer att få ett separat e-postmeddelande om hur du börjar använda { $productName }.
subscriptionFirstInvoice-content-auto-renew = Ditt abonnemang förnyas automatiskt varje faktureringsperiod om du inte väljer att avbryta.
# Variables:
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025
subscriptionFirstInvoice-content-your-next-invoice = Din nästa faktura kommer att utfärdas den { $nextInvoiceDateOnly }.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentExpired-subject-2 = Betalningsmetoden för { $productName } upphörde eller upphör snart
subscriptionPaymentExpired-title-2 = Din betalningsmetod har upphört eller håller på att upphöra
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentExpired-content-2 = Betalningsmetoden du använder för { $productName } har upphört eller håller på att upphöra.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-subject = Betalningen av { $productName } misslyckades
subscriptionPaymentFailed-title = Tyvärr, vi har problem med din betalning
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-content-problem = Vi hade ett problem med din senaste betalning för { $productName }.
subscriptionPaymentFailed-content-outdated-1 = Det kan vara så att din betalningsmetod har upphört att gälla eller att din nuvarande betalningsmetod är inaktuell.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentProviderCancelled-subject = Uppdatering av betalningsinformation krävs för { $productName }
subscriptionPaymentProviderCancelled-title = Tyvärr, vi har problem med din betalningsmetod
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentProviderCancelled-content-detect = Vi har upptäckt ett problem med din betalningsmetod för { $productName }.
subscriptionPaymentProviderCancelled-content-reason-1 = Det kan vara så att din betalningsmetod har upphört att gälla eller att din nuvarande betalningsmetod är inaktuell.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-subject = Prenumerationen på { $productName } har återaktiverats
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-title = Tack för att du återaktiverade din prenumeration på { $productName }!
# Variables:
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. 2016/01/20
subscriptionReactivation-content = Din faktureringscykel och betalning förblir desamma. Din nästa debitering blir { $invoiceTotal } den { $nextInvoiceDateOnly }. Ditt abonnemang förnyas automatiskt varje faktureringsperiod om du inte väljer att avbryta.
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-subject = Meddelande om automatisk förnyelse av { $productName }
subscriptionRenewalReminder-title = Din prenumeration förnyas snart
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-greeting = Bästa { $productName }-kund,
# Variables
#   $reminderLength (String) - The number of days until the current subscription is set to automatically renew, e.g. 14
subscriptionRenewalReminder-content-intro = Din nuvarande prenumeration är inställd på att förnyas automatiskt om { $reminderLength } dagar.
subscriptionRenewalReminder-content-discount-change = Din nästa faktura återspeglar en ändrad prissättning, eftersom en tidigare rabatt har upphört och en ny rabatt har tillämpats.
subscriptionRenewalReminder-content-discount-ending = Eftersom en tidigare rabatt har upphört förnyas din prenumeration till ordinarie pris.
# Variables
#   $invoiceTotalExcludingTax (String) - The amount of the subscription invoice before tax, including currency, e.g. $10.00
#   $invoiceTax (String) - The tax amount of the subscription invoice, including currency, e.g. $1.29
subscriptionRenewalReminder-content-charge-with-tax-day = Vid den tidpunkten förnyar { -brand-mozilla } din dagliga prenumeration och en debitering på { $invoiceTotalExcludingTax } + { $invoiceTax } skatt debiteras betalningsmetoden på ditt konto.
subscriptionRenewalReminder-content-charge-with-tax-week = Vid den tidpunkten kommer { -brand-mozilla } att förnya ditt veckoabonnemang och en debitering på { $invoiceTotalExcludingTax } + { $invoiceTax } skatt debiteras betalningsmetoden på ditt konto.
subscriptionRenewalReminder-content-charge-with-tax-month = Vid den tidpunkten kommer { -brand-mozilla } att förnya ditt månadsabonnemang och en debitering på { $invoiceTotalExcludingTax } + { $invoiceTax } skatt debiteras betalningsmetoden på ditt konto.
subscriptionRenewalReminder-content-charge-with-tax-halfyear = Vid den tidpunkten förnyar { -brand-mozilla } din sexmånadersprenumeration och en debitering på { $invoiceTotalExcludingTax } + { $invoiceTax } skatt debiteras betalningsmetoden på ditt konto.
subscriptionRenewalReminder-content-charge-with-tax-year = Vid den tidpunkten kommer { -brand-mozilla } att förnya din årsprenumeration och en debitering på { $invoiceTotalExcludingTax } + { $invoiceTax } skatt kommer att tillämpas på betalningsmetoden på ditt konto.
subscriptionRenewalReminder-content-charge-with-tax-default = Vid den tidpunkten förnyar { -brand-mozilla } din prenumeration och en debitering på { $invoiceTotalExcludingTax } + { $invoiceTax } skatt debiteras betalningsmetoden på ditt konto.
# Variables
#   $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
subscriptionRenewalReminder-content-charge-invoice-total-day = Vid den tidpunkten kommer { -brand-mozilla } att förnya din dagliga prenumeration och en debitering på { $invoiceTotal } kommer att tillämpas på betalningsmetoden på ditt konto.
subscriptionRenewalReminder-content-charge-invoice-total-week = Vid den tidpunkten kommer { -brand-mozilla } att förnya ditt veckoabonnemang och en debitering på { $invoiceTotal } kommer att tillämpas på betalningsmetoden på ditt konto.
subscriptionRenewalReminder-content-charge-invoice-total-month = Vid den tidpunkten kommer { -brand-mozilla } att förnya ditt månadsabonnemang och en debitering på { $invoiceTotal } kommer att debiteras på betalningsmetoden på ditt konto.
subscriptionRenewalReminder-content-charge-invoice-total-halfyear = Vid den tidpunkten förnyar { -brand-mozilla } din sexmånadersprenumeration och en debitering på { $invoiceTotal } kommer att debiteras på betalningsmetoden på ditt konto.
subscriptionRenewalReminder-content-charge-invoice-total-year = Vid den tidpunkten kommer { -brand-mozilla } att förnya din årsprenumeration och en debitering på { $invoiceTotal } kommer att tillämpas på betalningsmetoden på ditt konto.
subscriptionRenewalReminder-content-charge-invoice-total-default = Vid den tidpunkten kommer { -brand-mozilla } att förnya din prenumeration och en debitering på { $invoiceTotal } kommer att tillämpas på betalningsmetoden på ditt konto.
subscriptionRenewalReminder-content-closing = Vänliga hälsningar,
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-signature = Teamet bakom { $productName }
subscriptionReplaced-subject = Din prenumeration har uppdaterats som en del av din uppgradering
subscriptionReplaced-title = Din prenumeration har uppdaterats
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReplaced-content-replaced = Din individuella prenumeration på { $productName } har ersatts och ingår nu i ditt nya paket.
subscriptionReplaced-content-credit = Du får en kredit för all oanvänd tid från din tidigare prenumeration. Krediten sätts automatiskt in på ditt konto och används för framtida debiteringar.
subscriptionReplaced-content-no-action = Ingen åtgärd krävs från din sida.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSubsequentInvoice-subject = Betalning mottagen för { $productName }
subscriptionSubsequentInvoice-title = Tack för att du prenumererar!
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSubsequentInvoice-content-received = Vi har tagit emot din senaste betalning för { $productName }.
# Variables:
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025
subscriptionSubsequentInvoice-content-your-next-invoice = Din nästa faktura kommer att utfärdas den { $nextInvoiceDateOnly }.
# Variables:
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionUpgrade-subject = Du har uppgraderat till { $productName }
subscriptionUpgrade-title = Tack för att du har uppgraderat!
# Variables:
# $productNameOld (String) - The name of the previously subscribed product, e.g. Mozilla VPN
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionUpgrade-upgrade-info-2 = Du har uppgraderat till { $productName }.

## Variables:
## $paymentAmountOld (String) - The amount of the previous subscription payment, including currency, e.g. $10.00
## $paymentAmountNew (String) - The amount of the new subscription payment, including currency, e.g. $10.00
## $paymentTaxOld (String) - The tax amount of the previous subscription payment, including currency, e.g. $1.00
## $paymentTaxNew (String) - The tax amount of the new subscription payment, including currency, e.g. $1.00
## $productPaymentCycleNew (String) - The interval of time from the end of one payment statement date to the next payment statement date of the new subscription, e.g. month
## $productPaymentCycleOld (String) - The interval of time from the end of one payment statement date to the next payment statement date of the old subscription, e.g. month
## $invoiceAmountDue (String) - The total that the customer owes after all credits, discounts, and taxes have been applied
## $paymentProrated (String) - The one time fee to reflect the higher charge for the remainder of the payment cycle, including currency, e.g. $10.00

subscriptionUpgrade-content-charge-prorated-1 = Du har debiterats en engångsavgift på { $invoiceAmountDue } för att återspegla ditt abonnemangs högre pris för resten av denna faktureringsperiod ({ $productPaymentCycleOld }).
subscriptionUpgrade-content-charge-credit = Du har fått en kredit på beloppet { $paymentProrated }.
subscriptionUpgrade-content-subscription-next-bill-change = Från och med din nästa faktura kommer priset på din prenumeration att ändras.
subscriptionUpgrade-content-old-price-day = Den tidigare avgiften var { $paymentAmountOld } per dag.
subscriptionUpgrade-content-old-price-week = Den tidigare avgiften var { $paymentAmountOld } per vecka.
subscriptionUpgrade-content-old-price-month = Den tidigare avgiften var { $paymentAmountOld } per månad.
subscriptionUpgrade-content-old-price-halfyear = Den tidigare avgiften var { $paymentAmountOld } per halvår.
subscriptionUpgrade-content-old-price-year = Den tidigare avgiften var { $paymentAmountOld } per år.
subscriptionUpgrade-content-old-price-default = Den tidigare avgiften var { $paymentAmountOld } per faktureringsintervall.
subscriptionUpgrade-content-old-price-day-tax = Den tidigare avgiften var { $paymentAmountOld } + { $paymentTaxOld } moms per dag.
subscriptionUpgrade-content-old-price-week-tax = Den tidigare avgiften var { $paymentAmountOld } + { $paymentTaxOld } moms per vecka.
subscriptionUpgrade-content-old-price-month-tax = Den tidigare avgiften var { $paymentAmountOld } + { $paymentTaxOld } moms per månad.
subscriptionUpgrade-content-old-price-halfyear-tax = Den tidigare avgiften var { $paymentAmountOld } + { $paymentTaxOld } moms per halvår.
subscriptionUpgrade-content-old-price-year-tax = Den tidigare avgiften var { $paymentAmountOld } + { $paymentTaxOld } moms per år.
subscriptionUpgrade-content-old-price-default-tax = Den tidigare avgiften var { $paymentAmountOld } + { $paymentTaxOld } moms per faktureringsintervall.
subscriptionUpgrade-content-new-price-day = Från och med nu kommer du att debiteras { $paymentAmountNew } per dag, exklusive rabatter.
subscriptionUpgrade-content-new-price-week = Från och med nu kommer du att debiteras { $paymentAmountNew } per vecka, exklusive rabatter.
subscriptionUpgrade-content-new-price-month = Från och med nu kommer du att debiteras { $paymentAmountNew } per månad, exklusive rabatter.
subscriptionUpgrade-content-new-price-halfyear = Från och med nu kommer du att debiteras { $paymentAmountNew } per halvår, exklusive rabatter.
subscriptionUpgrade-content-new-price-year = Från och med nu kommer du att debiteras { $paymentAmountNew } per år, exklusive rabatter.
subscriptionUpgrade-content-new-price-default = Från och med nu kommer du att debiteras { $paymentAmountNew } per faktureringsintervall, exklusive rabatter.
subscriptionUpgrade-content-new-price-day-dtax = Från och med nu kommer du att debiteras { $paymentAmountNew } + { $paymentTaxNew } moms per dag, exklusive rabatter.
subscriptionUpgrade-content-new-price-week-tax = Från och med nu kommer du att debiteras { $paymentAmountNew } + { $paymentTaxNew } moms per vecka, exklusive rabatter.
subscriptionUpgrade-content-new-price-month-tax = Från och med nu kommer du att debiteras { $paymentAmountNew } + { $paymentTaxNew } moms per månad, exklusive rabatter.
subscriptionUpgrade-content-new-price-halfyear-tax = Från och med nu kommer du att debiteras { $paymentAmountNew } + { $paymentTaxNew } moms per halvår, exklusive rabatter.
subscriptionUpgrade-content-new-price-year-tax = Från och med nu kommer du att debiteras { $paymentAmountNew } + { $paymentTaxNew } moms per år, exklusive rabatter.
subscriptionUpgrade-content-new-price-default-tax = Från och med nu kommer du att debiteras { $paymentAmountNew } + { $paymentTaxNew } moms per faktureringsintervall, exklusive rabatter.
subscriptionUpgrade-existing = Om några av dina befintliga prenumerationer överlappar denna uppgradering, hanterar vi dem och skickar ett separat mejl med detaljerna. Om din nya plan innehåller produkter som kräver installation, skickar vi ett separat e-postmeddelande med installationsinstruktioner.
subscriptionUpgrade-auto-renew = Din prenumeration förnyas automatiskt varje faktureringsperiod om du inte väljer att avbryta.
subscriptionsPaymentExpired-subject-2 = Betalningsmetoden för dina prenumerationer har upphört eller upphör att gälla snart
subscriptionsPaymentExpired-title-2 = Din betalningsmetod har upphört eller håller på att upphöra
subscriptionsPaymentExpired-content-2 = Den betalningsmetod du använder för att betala för följande prenumerationer har upphört eller håller på att upphöra.
subscriptionsPaymentProviderCancelled-subject = Uppdatering av betalningsinformation krävs för prenumerationer på { -brand-mozilla }
subscriptionsPaymentProviderCancelled-title = Tyvärr har vi problem med din betalning
subscriptionsPaymentProviderCancelled-content-detected = Vi har upptäckt ett problem med din betalningsmetod för följande prenumerationer.
subscriptionsPaymentProviderCancelled-content-payment-1 = Det kan vara så att din betalningsmetod har upphört att gälla eller att din nuvarande betalningsmetod är inaktuell.
