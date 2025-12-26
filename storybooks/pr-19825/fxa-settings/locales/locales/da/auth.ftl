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

## Email content
## Emails do not contain buttons, only links. Emails have a rich HTML version and a plaintext
## version. The strings are usually identical but sometimes they differ slightly.

fxa-header-mozilla-logo = <img data-l10n-name="mozilla-logo" alt="{ -brand-mozilla }-logo">
fxa-header-sync-devices-image = <img data-l10n-name="sync-devices-image" alt="Synkroniser enheder">
body-devices-image = <img data-l10n-name="devices-image" alt="Enheder">
fxa-privacy-url = { -brand-mozilla }s privatlivspolitik
moz-accounts-privacy-url-2 = Privatlivserklæring for { -product-mozilla-accounts(capitalization: "uppercase") }
moz-accounts-terms-url = Tjenestevilkår for { -product-mozilla-accounts(capitalization: "uppercase") }
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
subplat-cancel = Annuller abonnement
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
account-deletion-info-block-communications = Hvis din konto slettes, vil du stadig modtage mails fra Mozilla Corporation og Mozilla Foundation, medmindre du <a data-l10n-name="unsubscribeLink">beder om at blive afmeldt</a>.
account-deletion-info-block-support = Hvis du har spørgsmål eller brug for hjælp, er du velkommen til at kontakte vores <a data-l10n-name="supportLink">supportteam</a>.
account-deletion-info-block-communications-plaintext = Hvis din konto slettes, vil du stadig modtage mails fra Mozilla Corporation og Mozilla Foundation, medmindre du beder om at blive afmeldt:
account-deletion-info-block-support-plaintext = Hvis du har spørgsmål eller brug for hjælp, er du velkommen til at kontakte vores supportteam:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
body-android-badge = <img data-l10n-name="google-play-badge" alt="Hent { $productName } på { -google-play }">
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
body-ios-badge = <img data-l10n-name="apple-app-badge" alt="Hent { $productName } i { -app-store }">
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-desktop-device-2 = Installer { $productName } på <a data-l10n-name="anotherDeviceLink">en anden computer</a>.
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-device-2 = Installer { $productName } på <a data-l10n-name="anotherDeviceLink"> en anden enhed</a>.
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
android-download-plaintext = Hent { $productName } på Google Play:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
ios-download-plaintext = Hent { $productName } på App Store:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-device-plaintext = Installer { $productName } på en anden enhed:
automated-email-change-2 = Hvis du ikke foretog denne handling, så <a data-l10n-name="passwordChangeLink">skift din adgangskode</a> med det samme.
automated-email-support = Besøg <a data-l10n-name="supportLink">{ -brand-mozilla } Support</a> for at få mere at vide.
# After the colon, there's a link to https://accounts.firefox.com/settings/change_password
automated-email-change-plaintext-2 = Hvis du ikke foretog denne handling, så skift din adgangskode med det samme:
#  After the colon, there's a link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
automated-email-support-plaintext = Besøg { -brand-mozilla } Support for at få mere at vide:
automated-email-inactive-account = Denne mail er sendt automatisk. Du modtager den, fordi du har en { -product-mozilla-account }, og det er to år siden, du sidst loggede ind.
# supportLink - https://support.mozilla.org/kb/im-having-problems-my-firefox-account
automated-email-no-action = { automated-email-no-action-plaintext } Besøg <a data-l10n-name="supportLink">{ -brand-mozilla } Support</a> for mere info.
automated-email-no-action-plaintext = Denne mail er sendt automatisk. Hvis du har modtaget den ved en fejl, behøver du ikke foretage dig noget.
#  After the colon, there's a link to https://accounts.firefox.com/settings/change_password
automated-email-not-authorized-plaintext = Denne mail er sendt automatisk. Hvis du ikke har godkendt denne handling, så skift din adgangskode:
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
# - $uaOS: the user agent's operating system (e.g, MacOS)
# - $uaOSVersion - the user agent's operating system version
automatedEmailRecoveryKey-origin-device-all = Denne anmodning kom fra { $uaBrowser }på { $uaOS } { $uaOSVersion }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
# - $uaOS: the user agent's operating system (e.g, MacOS)
automatedEmailRecoveryKey-origin-device-browser-os = Denne anmodning kom fra { $uaBrowser } på { $uaOS }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
automatedEmailRecoveryKey-origin-device-browser-only = Denne anmodning kom fra { $uaBrowser }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaOS: the user agent's operating system (e.g, MacOS)
# - $uaOSVersion - the user agent's operating system version
automatedEmailRecoveryKey-origin-device-OS-version-only = Denne anmodning kom fra { $uaOS } { $uaOSVersion }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaOS: the user agent's operating system (e.g, MacOS)
automatedEmailRecoveryKey-origin-device-OS-only = Denne anmodning kom fra { $uaOS }.
automatedEmailRecoveryKey-delete-key-change-pwd = Hvis det ikke var dig, så <a data-l10n-name="revokeAccountRecoveryLink">slet den nye nøgle</a> og <a data-l10n-name="passwordChangeLink">skift din adgangskode</a>.
automatedEmailRecoveryKey-change-pwd-only = Hvis det ikke var dig, så <a data-l10n-name="passwordChangeLink">skift din adgangskode</a>.
automatedEmailRecoveryKey-more-info = Besøg <a data-l10n-name="supportLink">{ -brand-mozilla } Support</a> for at få mere at vide.
# Colon is followed by user device info on a separate line (e.g., "Firefox Nightly on Mac OSX 10.11")
automatedEmailRecoveryKey-origin-plaintext = Denne anmodning kom fra:
# Colon is followed by a URL to the account recovery key section of account settings
automatedEmailRecoveryKey-notyou-delete-key-plaintext = Hvis det ikke var dig, så slet den nye nøgle:
# Colon is followed by a URL to the change password section of account settings
automatedEmailRecoveryKey-notyou-change-pwd-only-plaintext = Hvis det ikke var dig, så skift din adgangskode:
# This string is shown on its own line, after automatedEmailRecoveryKey-notyou-delete-key-plaintext and its URL
# Colon is followed by a URL to the change password section of account settings
automatedEmailRecoveryKey-notyou-change-pwd-plaintext = og skift din adgangskode:
# Colon is followed by a URL to Mozilla Support's "I'm having problems with my account" page
automatedEmailRecoveryKey-more-info-plaintext = Besøg { -brand-mozilla } Support for at få mere at vide:
automated-email-reset =
    Denne mail er sendt automatisk; hvis du ikke har godkendt denne handling, så <a data-l10n-name="resetLink">nulstil din adgangskode</a>.
    For mere information, besøg <a data-l10n-name="supportLink">{ -brand-mozilla } Support</a>.
# Variables:
#  $resetLink (String) - Link to https://accounts.firefox.com/reset_password
automated-email-reset-plaintext-v2 = Hvis du ikke har godkendt denne handling, så nulstil din adgangskode nu på { $resetLink }
# This message is used by multiple automated emails that notify users of security events on their account
# "this action" is meant to be a generic term, and could, for example, refer to using a backup authentication code to confirm a password reset
automated-email-reset-pwd-two-factor =
    Hvis du ikke foretog denne handling, så <a data-l10n-name="resetLink">nulstil din adgangskode</a> og <a data-l10n-name="twoFactorSettingsLink">nulstil totrinsgodkendelse</a> med det samme.
    For mere information, besøg <a data-l10n-name="supportLink">{ -brand-mozilla } Support</a>.
# Followed by link to https://accounts.firefox.com/reset_password
automated-email-reset-pwd-plaintext-v3 = Hvis du ikke foretog denne handling, så nulstil din adgangskode med det samme på:
# Followed by link to https://accounts.firefox.com/settings#two-step-authentication
automated-email-reset-two-factor-plaintext = Nulstil også totrinsgodkendelse på:
brand-banner-message = Vidste du, at vi har ændret vores navn fra { -product-firefox-accounts } til { -product-mozilla-accounts }? <a data-l10n-name="learnMore">Læs mere</a>
cancellationSurvey = Hjælp os med at forbedre vores tjenester ved at deltage i denne <a data-l10n-name="cancellationSurveyUrl">korte undersøgelse</a>.
# After the colon, there's a link to https://survey.alchemer.com/s3/6534408/Privacy-Security-Product-Cancellation-of-Service-Q4-21
cancellationSurvey-plaintext = Hjælp os med at forbedre vores tjenester ved at deltage i denne korte undersøgelse:
change-password-plaintext = Hvis du har mistanke om, at nogen forsøger at få adgang til din konto, så skift din adgangskode.
manage-account = Håndter konto
manage-account-plaintext = { manage-account }:
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
# Variables:
#  $supportUrl (String) - Link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
support-message-3 = Besøg <a data-l10n-name="supportLink">{ -brand-mozilla } Support</a> for at få mere at vide.
# Variables:
#  $supportUrl (String) - Link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
support-message-plaintext = Besøg { -brand-mozilla } Support på { $supportUrl } for at få mere at vide.
# Variables:
#  $uaBrowser (String) - User's browser, e.g. Firefox
#  $uaOS (String) - User's OS, e.g. Mac OSX
#  $uaOSVersion (String) - User's OS version, e.g. 10.11
device-all = { $uaBrowser } på { $uaOS } { $uaOSVersion }
# Variables:
#  $uaBrowser (String) - User's browser, e.g. Firefox
#  $uaOS (String) - User's OS, e.g. Mac OSX
device-browser-os = { $uaBrowser } på { $uaOS }
# Variables:
#  $city (String) - User's city
#  $stateCode (String) - User's state
#  $country (String) - User's country
location-all = { $city }, { $stateCode }, { $country } (anslået)
# Variables:
#  $city (String) - User's city
#  $country (String) - User's country
location-city-country = { $city }, { $country } (anslået)
# Variables:
#  $stateCode (String) - User's state
#  $country (String) - User's country
location-state-country = { $stateCode }, { $country } (anslået)
# Variables:
#  $country (stateCode) - User's country
location-country = { $country } (anslået)
view-invoice-link-action = Se faktura
# Variables:
#  $invoiceLink (String) - The link to the invoice
# After the colon, there's a link to https://pay.stripe.com/
view-invoice-plaintext = Se faktura: { $invoiceLink }
cadReminderFirst-subject-1 = Påmindelse! Begynd at synkronisere { -brand-firefox }
cadReminderFirst-action = Synkroniser en enhed til
cadReminderFirst-action-plaintext = { cadReminderFirst-action }:
# In the title of the email, "It takes two to sync", "two" refers to syncing two devices
cadReminderFirst-title-1 = Der skal to til at synkronisere
cadReminderFirst-description-v2 = Se dine faneblade på alle af dine enheder. Få adgang til dine bogmærker, adgangskoder og andre data overalt, hvor du bruger { -brand-firefox }.
cadReminderSecond-subject-2 = Gå ikke glip af noget! Lad os afslutte opsætningen af synkroniseringen
cadReminderSecond-action = Synkroniser en enhed til
cadReminderSecond-title-2 = Glem ikke at synkronisere!
cadReminderSecond-description-sync = Synkroniser dine bogmærker, adgangskoder, åbne faneblade og mere — overalt hvor du bruger { -brand-firefox }.
cadReminderSecond-description-plus = Derudover er dine data altid krypteret. Kun dig og enheder, du godkender, kan se dem.
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
inactiveAccountFinalWarning-subject = Sidste chance for at beholde din { -product-mozilla-account }
inactiveAccountFinalWarning-title = Din { -brand-mozilla }-konto og data tilknyttet kontoen vil blive slettet
inactiveAccountFinalWarning-preview = Log ind for at beholde din konto
inactiveAccountFinalWarning-account-description = Din { -product-mozilla-account } bruges til at få adgang til gratis privatlivs- og browsing-produkter som fx synkronisering af { -brand-firefox }, { -product-mozilla-monitor }, { -product-firefox-relay } og { -product-mdn }.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
# This date will already be formatted with moment.js into Thursday, Jan 9, 2025 format
inactiveAccountFinalWarning-impact = Den <strong>{ $deletionDate }</strong> vil din konto og dine personlige data blive slettet permanent, medmindre du logger ind.
inactiveAccountFinalWarning-action = Log ind for at beholde din konto
# followed by link to sign in
inactiveAccountFinalWarning-action-plaintext = Log ind for at beholde din konto:
inactiveAccountFirstWarning-subject = Mist ikke din konto
inactiveAccountFirstWarning-title = Vil du beholde din { -brand-mozilla }-konto og de tilknyttede data?
inactiveAccountFirstWarning-account-description-v2 = Din { -product-mozilla-account } bruges til at få adgang til gratis privatlivs- og browsing-produkter som fx synkronisering af { -brand-firefox }, { -product-mozilla-monitor }, { -product-firefox-relay } og { -product-mdn }.
inactiveAccountFirstWarning-inactive-status = Vi har bemærket, at du ikke har logget ind i to år.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
# This date will already be formatted with moment.js into Thursday, Jan 9, 2025 format
inactiveAccountFirstWarning-impact = Din konto og dine personlige data vil blive permanent slettet den <strong>{ $deletionDate }</strong>, fordi du ikke har været aktiv.
inactiveAccountFirstWarning-action = Log ind for at beholde din konto
inactiveAccountFirstWarning-preview = Log ind for at beholde din konto
# followed by link to sign in
inactiveAccountFirstWarning-action-plaintext = Log ind for at beholde din konto:
inactiveAccountSecondWarning-subject = Handling påkrævet: Sletning af konto om syv dage
inactiveAccountSecondWarning-title = Din { -brand-mozilla }-konto og tilknyttede data vil blive slettet om syv dage
inactiveAccountSecondWarning-account-description-v2 = Din { -product-mozilla-account } bruges til at få adgang til gratis privatlivs- og browsing-produkter som fx synkronisering af { -brand-firefox }, { -product-mozilla-monitor }, { -product-firefox-relay } og { -product-mdn }.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
inactiveAccountSecondWarning-impact = Din konto og dine personlige data vil blive permanent slettet den <strong>{ $deletionDate }</strong>, fordi du ikke har været aktiv.
inactiveAccountSecondWarning-action = Log ind for at beholde din konto
inactiveAccountSecondWarning-preview = Log ind for at beholde din konto
# followed by link to sign in
inactiveAccountSecondWarning-action-plaintext = Log ind for at beholde din konto:
# The user has a low number of valid recovery codes remaining for use
codes-reminder-title-zero = Du er løbet tør for reserve-godkendelseskoder!
codes-reminder-title-one = Du hr kun én reserve-godkendelseskode tilbage
codes-reminder-title-two = Det er tid til at oprette flere reserve-godkendelseskoder
codes-reminder-description-part-one = Reserve-godkendelseskoder hjælper dig med at gendanne dine informationer, når du har glemt din adgangskode.
codes-reminder-description-part-two = Opret nye koder nu, så du ikke mister dine data senere.
codes-reminder-description-two-left = Du har kun to koder tilbage.
codes-reminder-description-create-codes = Opret nye reserve-godkendelseskoder, så du kan få adgang til din konto igen, hvis du bliver låst ude.
lowRecoveryCodes-action-2 = Opret koder
codes-create-plaintext = { lowRecoveryCodes-action-2 }:
lowRecoveryCodes-subject-2 =
    { $numberRemaining ->
        [0] Ingen reserve-godkendelseskoder tilbage
        [one] Kun 1 reserve-godkendelseskode tilbage
       *[other] Kun { $numberRemaining } reserve-godkendelseskoder tilbage
    }
# Variables:
# $clientName (String) - A client the user hasn't signed into before (e.g. Firefox, Sync)
newDeviceLogin-subject = Nyt login på { $clientName }
newDeviceLogin-subjectForMozillaAccount = Nyt login på din { -product-mozilla-account }
newDeviceLogin-title-3 = Din { -product-mozilla-account } blev brugt til at logge ind
# The "Not you?" question is asking whether the recipient of the email is the
# person who performed the action that triggered the email.
newDeviceLogin-change-password = Var det ikke dig? <a data-l10n-name="passwordChangeLink">Skift din adgangskode</a>.
# The "Not you?" question is asking whether the recipient of the email is the
# person who performed the action that triggered the email.
newDeviceLogin-change-password-plain = Var det ikke dig? Skift din adgangskode:
newDeviceLogin-action = Håndter konto
passwordChanged-subject = Adgangskode opdateret
passwordChanged-title = Adgangskoden blev ændret
passwordChanged-description-2 = Adgangskoden til din { -product-mozilla-account } blev ændret fra følgende enhed:
passwordChangeRequired-subject = Mistænkelig aktivitet konstateret
passwordChangeRequired-preview = Skift din adgangskode med det samme
passwordChangeRequired-title-2 = Nulstil din adgangskode
passwordChangeRequired-suspicious-activity-3 = Vi har låst din konto for at beskytte den mod mistænkelig aktivitet. Du er blevet logget ud på alle dine enheder, og alle synkroniserede data er blevet slettet som en sikkerhedsforanstaltning.
passwordChangeRequired-sign-in-3 = For at logge ind på din konto igen skal du blot nulstille din adgangskode.
passwordChangeRequired-different-password-2 = <b>Vigtigt:</b> Vælg en stærk adgangskode, der er anderledes end adgangskoder, du har brugt tidligere.
passwordChangeRequired-different-password-plaintext-2 = Vigtigt: Vælg en stærk adgangskode, der er anderledes end adgangskoder, du har brugt tidligere.
passwordChangeRequired-action = Nulstil adgangskode
passwordChangeRequired-action-plaintext = { passwordChangeRequired-action }:
# Variables:
#  $code (String) - The confirmation code for sign-in
password-forgot-otp-subject-2 = Brug { $code } til at ændre din adgangskode
password-forgot-otp-preview = Denne kode udløber om ti minutter
password-forgot-otp-title = Glemt din adgangskode?
password-forgot-otp-request = Vi har modtaget en anmodning om at ændre adgangskoden til din { -product-mozilla-account } fra:
password-forgot-otp-code-2 = Hvis det var dig, så er din bekræftelseskode til at fortsætte her:
password-forgot-otp-expiry-notice = Denne kode udløber om ti minutter.
passwordReset-subject-2 = Din adgangskode er blevet nulstillet
passwordReset-title-2 = Din adgangskode er blevet nulstillet
# This sentence is followed by information about the device and time of the password reset
passwordReset-description-2 = Du nulstillede adgangskoden til din { -product-mozilla-account } på:
passwordResetAccountRecovery-subject-2 = Din adgangskode er blevet nulstillet
passwordResetAccountRecovery-title-3 = Din adgangskode er blevet nulstillet
# Followed by details on the device, location, and date/time of the password reset.
passwordResetAccountRecovery-description-3 = Du brugte din genoprettelsesnøgle til kontoen til at nulstille adgangskoden til din { -product-mozilla-account } på:
passwordResetAccountRecovery-information = Vi har logget dig ud af alle dine synkroniserede enheder. Vi har oprettet en ny genoprettelsesnøgle til kontoen til at erstatte den, du brugte. Du kan ændre den i dine kontoindstillinger.
# After the colon there is a link to account settings
passwordResetAccountRecovery-information-txt = Vi har logget dig ud af alle dine synkroniserede enheder. Vi har oprettet en ny genoprettelsesnøgle til kontoen til at erstatte den, du brugte. Du kan ændre den i dine kontoindstillinger:
passwordResetAccountRecovery-action-4 = Håndter konto
passwordResetRecoveryPhone-subject = Telefonnummer til genoprettelse brugt
passwordResetRecoveryPhone-preview = Kontroller at det var dig
passwordResetRecoveryPhone-title = Dit telefonnummer til genoprettelse blev brugt til at bekræfte nulstilling af adgangskode
passwordResetRecoveryPhone-device = Telefonnummer til genoprettelse brugt fra:
passwordResetRecoveryPhone-action = Håndter konto
passwordResetWithRecoveryKeyPrompt-subject = Din adgangskode er blevet nulstillet
passwordResetWithRecoveryKeyPrompt-title = Din adgangskode er blevet nulstillet
# Details of the device and date/time where the password was reset
passwordResetWithRecoveryKeyPrompt-description = Du nulstillede adgangskoden til din { -product-mozilla-account } på:
# Text for button action to create a new account recovery key
passwordResetWithRecoveryKeyPrompt-action = Opret genoprettelsesnøgle til kontoen
# colon is followed by a link to create an account recovery key from the account settings page
passwordResetWithRecoveryKeyPrompt-action-txt = Opret genoprettelsesnøgle til kontoen:
passwordResetWithRecoveryKeyPrompt-cta-description = Du skal logge ind igen på alle dine synkroniserede enheder. Hvis du fremover har brug for at nulstille din adgangskode, kan du med fordel benytte en genoprettelsesnøgle til kontoen for at sikre dig imod tab af data.
postAddAccountRecovery-subject-3 = Ny genoprettelsesnøgle til kontoen blev oprettet
postAddAccountRecovery-title2 = Du oprettede en ny genoprettelsesnøgle til kontoen
# Key here refers to account recovery key
postAddAccountRecovery-body-part1 = Gem denne nøgle et sikkert sted — du skal bruge den til at gendanne dine krypterede browserdata, hvis du glemmer din adgangskode.
# Key here refers to account recovery key
postAddAccountRecovery-body-part2 = Denne nøgle kan kun bruges én gang. Når du har brugt den, opretter vi automatisk en ny til dig. Du kan også til enhver tid oprette en ny fra dine kontoindstillinger.
postAddAccountRecovery-action = Håndter konto
postAddLinkedAccount-subject-2 = Ny konto knyttet til din { -product-mozilla-account }
#  Variables:
#  $providerName (String) - The name of the provider, e.g. Apple, Google
postAddLinkedAccount-title-2 = Din { $providerName }-konto er blevet knyttet til din { -product-mozilla-account }
postAddLinkedAccount-action = Håndter konto
postAddRecoveryPhone-subject = Telefonnummer til genoprettelse tilføjet
postAddRecoveryPhone-preview = Konto beskyttet af totrinsgodkendelse
postAddRecoveryPhone-title-v2 = Du tilføjede et telefonnummer til genoprettelse
# Variables:
#  $maskedLastFourPhoneNumber (String) - A bullet point mask with the last four digits of the user's phone number, e.g. ••••••1234
postAddRecoveryPhone-description-v2 = Du har tilføjet { $maskedLastFourPhoneNumber } som dit telefonnummer til genoprettelse
# Links out to a support article about two factor authentication
postAddRecoveryPhone-how-protect = Sådan beskytter det din konto
postAddRecoveryPhone-how-protect-plaintext = Sådan beskytter det din konto:
postAddRecoveryPhone-enabled-device = Du har aktiveret det fra:
postAddRecoveryPhone-action = Håndter konto
postAddTwoStepAuthentication-preview = Din konto er beskyttet
postAddTwoStepAuthentication-subject-v3 = Totrinsgodkendelse er slået til
postAddTwoStepAuthentication-title-2 = Du har slået totrinsgodkendelse til
# After the colon, there is a description of the device that the user used to enable two-step authentication
postAddTwoStepAuthentication-from-device-v2 = Du har bedt om dette fra:
postAddTwoStepAuthentication-action = Håndter konto
postAddTwoStepAuthentication-code-required-v4 = Sikkerhedskoder fra din godkendelsesapp vil nu være påkrævet, hver gang du logger ind.
postAddTwoStepAuthentication-recovery-method-codes = Du har også tilføjet reserve-godkendelseskoder som din genoprettelsesmetode.
# Variables:
#  $maskedPhoneNumber (String) - A bullet point mask with the last four digits of the user's phone number, e.g. ••••••1234
postAddTwoStepAuthentication-recovery-method-phone = Du har også tilføjet { $maskedPhoneNumber } som dit telefonnummer til genoprettelse.
postAddTwoStepAuthentication-how-protects-link = Sådan beskytter det din konto
postAddTwoStepAuthentication-how-protects-plaintext = Sådan beskytter det din konto:
postAddTwoStepAuthentication-device-sign-out-message = For at beskytte alle dine forbundne enheder, bør du logge ud overalt, hvor du bruger denne konto, og derefter logge ind igen ved hjælp af totrinsgodkendelse.
postChangeAccountRecovery-subject = Genoprettelsesnøgle til kontoen blev ændret
postChangeAccountRecovery-title = Du ændrede din genoprettelsesnøgle til kontoen
postChangeAccountRecovery-body-part1 = Du har nu en ny genoprettelsesnøgle til kontoen. Din tidligere nøgle blev slettet.
postChangeAccountRecovery-body-part2 = Gem denne nye nøgle et sikkert sted — du skal bruge den til at gendanne dine krypterede data, hvis du glemmer din adgangskode.
postChangeAccountRecovery-action = Håndter konto
postChangePrimary-subject = Primær mailadresse opdateret
postChangePrimary-title = Ny primær mailadresse
# Variables:
#  $email (String) - A user's email address
postChangePrimary-description-2 = Du har ændret din primære mailadresse til { $email }. Denne mailadresse fungerer nu som brugernavn, når du skal logge ind på din { -product-mozilla-account }. Vi bruger den også til at sende sikkerhedsmeddelelser og login-bekræftelser.
postChangePrimary-action = Håndter konto
postChangeRecoveryPhone-subject = Telefonnummer til genoprettelse opdateret
postChangeRecoveryPhone-preview = Konto beskyttet af totrinsgodkendelse
postChangeRecoveryPhone-title = Du ændrede dit telefonnummer til genoprettelse
postChangeRecoveryPhone-description = Du har nu et nyt telefonnummer til genoprettelse. Dit tidligere telefonnummer blev slettet.
postChangeRecoveryPhone-requested-device = Du har bedt om det fra:
postChangeTwoStepAuthentication-preview = Din konto er beskyttet
postChangeTwoStepAuthentication-subject = Totrinsgodkendelse opdateret
postChangeTwoStepAuthentication-title = Totrinsgodkendelse er blevet opdateret
postChangeTwoStepAuthentication-use-new-account = Du skal nu bruge den nye { -product-mozilla-account }-kode i din godkendelsesapp. Den gamle kode vil ikke længere virke, og du kan fjerne den.
# After the colon, there is a description of the device that the user used to enable two-step authentication
postChangeTwoStepAuthentication-from-device = Du har bedt om dette fra:
postChangeTwoStepAuthentication-action = Håndter konto
postChangeTwoStepAuthentication-how-protects-link = Sådan beskytter det din konto
postChangeTwoStepAuthentication-how-protects-plaintext = Sådan beskytter det din konto:
postChangeTwoStepAuthentication-device-sign-out-message = For at beskytte alle dine forbundne enheder, bør du logge ud overalt, hvor du bruger denne konto, og derefter logge ind igen ved hjælp af din nye totrinsgodkendelse.
postConsumeRecoveryCode-title-3 = Din reserve-godkendelseskode blev brugt til at bekræfte nulstilling af adgangskode
# After the colon, there is description of the device that the backup authentication code was used on
# E.g., Firefox Nightly on Mac OSX, Thursday Sept 2, 2024
postConsumeRecoveryCode-description-3 = Kode brugt fra:
postConsumeRecoveryCode-action = Håndter konto
postConsumeRecoveryCode-subject-v3 = Reserve-godkendelseskode brugt
postConsumeRecoveryCode-preview = Kontroller at det var dig
postNewRecoveryCodes-subject-2 = Nye reserve-godkendelseskoder oprettet
postNewRecoveryCodes-title-2 = Du oprettede nye reserve-godkendelseskoder
# After the colon, there is information about the device that the authentication codes were created on
postNewRecoveryCodes-description-2 = De blev oprettet på:
postNewRecoveryCodes-action = Håndter konto
postRemoveAccountRecovery-subject-2 = Genoprettelsesnøgle til kontoen blev slettet
postRemoveAccountRecovery-title-3 = Du slettede din genoprettelsesnøgle til kontoen
postRemoveAccountRecovery-body-part1 = Din genoprettelsesnøgle til kontoen er påkrævet for at gendanne dine krypterede browserdata, hvis du glemmer din adgangskode.
postRemoveAccountRecovery-body-part2 = Hvis du ikke allerede har gjort det, så opret en ny genoprettelsesnøgle til kontoen i dine kontoindstillinger for at forhindre, at du mister dine gemte adgangskoder, bogmærker, browserhistorik med mere.
postRemoveAccountRecovery-action = Håndter konto
postRemoveRecoveryPhone-subject = Telefonnummer til genoprettelse fjernet
postRemoveRecoveryPhone-preview = Konto beskyttet af totrinsgodkendelse
postRemoveRecoveryPhone-title = Telefonnummer til genoprettelse fjernet
postRemoveRecoveryPhone-description-v2 = Dit telefonnummer til genoprettelse er blevet fjernet fra dine indstillinger for totrinsgodkendelse.
postRemoveRecoveryPhone-description-extra = Du kan stadig bruge dine reserve-godkendelseskoder til at logge ind, hvis du ikke er i stand til at bruge din godkendelsesapp.
postRemoveRecoveryPhone-requested-device = Du har bedt om det fra:
postRemoveSecondary-subject = Sekundær mailadresse fjernet
postRemoveSecondary-title = Sekundær mailadresse fjernet
# Variables:
#  $secondaryEmail (String) - A user's email address
postRemoveSecondary-description-2 = Du har fjernet { $secondaryEmail } som sekundær mailadresse fra din { -product-mozilla-account }. Sikkerhedsmeddelelser og login-bekræftelser vil ikke længere blive sendt til denne mailadresse.
postRemoveSecondary-action = Håndter konto
postRemoveTwoStepAuthentication-subject-line-2 = Totrinsgodkendelse er slået fra
postRemoveTwoStepAuthentication-title-2 = Du har slået totrinsgodkendelse fra
# After the colon is a description of the device the user used to disable two-step authentication
postRemoveTwoStepAuthentication-from-device = Du har deaktiveret det fra:
postRemoveTwoStepAuthentication-action = Håndter konto
postRemoveTwoStepAuthentication-not-required-2 = Du behøver ikke længere sikkerhedskoder fra din godkendelsesapp, når du logger ind.
postSigninRecoveryCode-subject = Reserve-godkendelseskode brugt til at logge ind
postSigninRecoveryCode-preview = Bekræft kontoaktivitet
postSigninRecoveryCode-title = Din reserve-godkendelseskode blev brugt til at logge ind
postSigninRecoveryCode-description = Hvis det ikke var dig, der gjorde det, bør du skifte din adgangskode med det samme for at holde din konto sikker.
postSigninRecoveryCode-device = Du loggede ind fra:
postSigninRecoveryCode-action = Håndter konto
postSigninRecoveryPhone-subject = Telefonnummer til genoprettelse brugt til at logge ind
postSigninRecoveryPhone-preview = Bekræft kontoaktivitet
postSigninRecoveryPhone-title = Dit telefonnummer til genoprettelse blev brugt til at logge ind
postSigninRecoveryPhone-description = Hvis det ikke var dig, der gjorde det, bør du skift din adgangskode med det samme for at holde din konto sikker.
postSigninRecoveryPhone-device = Du loggede ind fra:
postSigninRecoveryPhone-action = Håndter konto
postVerify-sub-title-3 = Vi er glade for at se dig!
postVerify-title-2 = Vil du se det samme faneblad på to enheder?
postVerify-description-2 = Det er nemt! Du skal bare installere { -brand-firefox } på en anden enhed og logge ind for at synkronisere. Det er som magi!
postVerify-sub-description = (Psst… Det betyder også, at du kan få dine bogmærker, adgangskoder og andre { -brand-firefox }-data overalt, hvor du er logget ind).
postVerify-subject-4 = Velkommen til { -brand-mozilla }!
postVerify-setup-2 = Forbind en anden enhed:
postVerify-action-2 = Forbind andre enheder
postVerifySecondary-subject = Sekundær mailadresse tilføjet
postVerifySecondary-title = Sekundær mailadresse tilføjet
# Variables:
#  $secondaryEmail (String) - A user's secondary email address
postVerifySecondary-content-3 = Du har bekræftet { $secondaryEmail } som sekundær mailadresse til din { -product-mozilla-account }. Sikkerhedsmeddelelser og login-bekræftelser vil fremover blive sendt til begge mailadresser.
postVerifySecondary-action = Håndter konto
recovery-subject = Nulstil din adgangskode
recovery-title-2 = Glemt din adgangskode?
# Information on the device, location, and date and time of the request that triggered the email follows.
recovery-request-origin-2 = Vi har modtaget en anmodning om at ændre adgangskoden til din { -product-mozilla-account } fra:
recovery-new-password-button = Opret en ny adgangskode ved at klikke på knappen nedenfor. Dette link udløber inden for den næste time.
recovery-copy-paste = Opret en ny adgangskode ved at kopiere og indsætte URL'en nedenfor i din browser. Dette link udløber inden for den næste time.
recovery-action = Opret ny adgangskode
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountDeletion-subject = Dit abonnement på { $productName } er blevet annulleret
subscriptionAccountDeletion-title = Vi er kede af, at du opsiger dit abonnement
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $invoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
subscriptionAccountDeletion-content-cancelled-2 = Du har for nylig slettet din { -product-mozilla-account }. Vi har derfor annulleret dit abonnement på { $productName }. Din sidste betaling på { $invoiceTotal } blev betalt den { $invoiceDateOnly }.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountFinishSetup-subject = Velkommen til { $productName }: Angiv din adgangskode.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountFinishSetup-title = Velkommen til { $productName }
subscriptionAccountFinishSetup-content-processing = Din betaling behandles og kan tage op til fire arbejdsdage at gennemføre. Dit abonnement fornys automatisk hver faktureringsperiode, medmindre du vælger at annullere.
subscriptionAccountFinishSetup-content-create-3 = Opret herefter en adgangskode til { -product-mozilla-account } for at begynde at bruge dit nye abonnement.
subscriptionAccountFinishSetup-action-2 = Kom i gang
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
#   $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#   $planIntervalCount (String) - The interval count of subscription plan, e.g. 2
#   $planInterval (String) - The interval of time of the subscription plan, e.g. week
#   $reminderLength (String) - The number of days until the current subscription is set to automatically renew, e.g. 14
subscriptionRenewalReminder-content-current = Dit nuværende abonnement fornys automatisk om { $reminderLength } dage. På det tidspunkt vil { -brand-mozilla } forny dit { $planIntervalCount }-{ $planInterval }s abonnement og der vil blive trukket { $invoiceTotal } med den angivne betalingsmetode fra din konto.
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
subscriptionsPaymentExpired-subject-2 = Betalingsmetoden for dine abonnementer er udløbet eller udløber snart
subscriptionsPaymentExpired-title-2 = Din betalingsmetode er udløbet eller udløber snart
subscriptionsPaymentExpired-content-2 = Betalingsmetoden, du bruger til at betale for følgende abonnementer, er udløbet eller udløber snart.
subscriptionsPaymentProviderCancelled-subject = Du skal opdatere dine betalingsinformationer for { -brand-mozilla }-abonnementer
subscriptionsPaymentProviderCancelled-title = Vi har desværre problemer med din betalingsmetode
subscriptionsPaymentProviderCancelled-content-detected = Vi har registreret et problem med din betalingsmetode for følgende abonnementer.
subscriptionsPaymentProviderCancelled-content-payment-1 = Det kan være, at din betalingsmetode er udløbet, eller at din nuværende betalingsmetode er forældet.
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
# Variables:
#  $unblockCode (String) - The authorization code for sign-in
unblockCode-subject-2 = Brug { $unblockCode } til at logge ind
unblockCode-preview = Denne kode udløber om en time
unblockCode-title = Er det dig, der logger ind?
unblockCode-prompt = Hvis det er, skal du bruge denne godkendelseskode:
# Variables:
#  $unblockCode (String) - An alphanumeric code
unblockCode-prompt-plaintext = Hvis det er, skal du bruge denne godkendelseskode: { $unblockCode }
unblockCode-report = Hvis det ikke er, så hjælp os med at afværge ubudne gæster og <a data-l10n-name="reportSignInLink">rapportér det til os.</a>
unblockCode-report-plaintext = Hvis det ikke er, så hjælp os med at afværge ubudne gæster og rapportér det til os.
verificationReminderFinal-subject = Sidste påmindelse om at bekræfte din konto
verificationReminderFinal-description-2 = For et par uger siden oprettede du en { -product-mozilla-account }, men bekræftede den aldrig. Vi vil af sikkerhedsmæssige årsager slette kontoen, hvis den ikke bekræftes inden for 24 timer.
confirm-account = Bekræft konto
confirm-account-plaintext = { confirm-account }:
verificationReminderFirst-subject-2 = Husk at bekræfte din konto
verificationReminderFirst-title-3 = Velkommen til { -brand-mozilla }!
verificationReminderFirst-description-3 = For et par dage siden oprettede du en { -product-mozilla-account }, men bekræftede den aldrig. Bekræft din konto inden for de næste 15 dage, ellers bliver den slettet automatisk.
verificationReminderFirst-sub-description-3 = Gå ikke glip af browseren, der sætter dig og dit privatliv i første række.
confirm-email-2 = Bekræft konto
confirm-email-plaintext-2 = { confirm-email-2 }:
verificationReminderFirst-action-2 = Bekræft konto
verificationReminderSecond-subject-2 = Husk at bekræfte din konto
verificationReminderSecond-title-3 = Gå ikke glip af { -brand-mozilla }!
verificationReminderSecond-description-4 = For et par dage siden oprettede du en { -product-mozilla-account }, men bekræftede den aldrig. Bekræft din konto inden for de næste ti dage, ellers bliver den slettet automatisk.
verificationReminderSecond-second-description-3 = Din { -product-mozilla-account } giver dig mulighed for at synkronisere alt det, du bruger { -brand-firefox } til, på tværs af enheder - og adgang til flere produkter fra { -brand-mozilla }, der beskytter dit privatliv.
verificationReminderSecond-sub-description-2 = Vær en del af vores mission om at transformere internettet til et sted, der er åbent for alle.
verificationReminderSecond-action-2 = Bekræft konto
verify-title-3 = Åbn internettet med { -brand-mozilla }
verify-description-2 = Bekræft din konto og få mest muligt ud af { -brand-mozilla }, overalt hvor du logger ind:
verify-subject = Færdiggør oprettelsen af din konto
verify-action-2 = Bekræft konto
# Variables:
# $code (String) - The verification code
verifyAccountChange-subject = Brug { $code } til at ændre din konto
# Variables:
# $expirationTime (Number) - Represents the expiration time in minutes
verifyAccountChange-preview =
    { $expirationTime ->
        [one] Denne kode udløber om { $expirationTime } minut.
       *[other] Denne kode udløber om { $expirationTime } minutter.
    }
verifyAccountChange-title = Ændrer du dine kontooplysninger?
# After the colon is a description of the device used to sign in to the service
verifyAccountChange-safe = Hold din konto sikker ved at godkende denne ændring på:
verifyAccountChange-prompt = Hvis du gør det, så er din godkendelseskode her:
# Variables:
# $expirationTime (Number) - Represents the expiration time in minutes
verifyAccountChange-expiry-notice =
    { $expirationTime ->
        [one] Den udløber om { $expirationTime } minut.
       *[other] Den udløber om { $expirationTime } minutter.
    }
# Variables:
#  $clientName (String) - A client the user hasn't signed into before (e.g. Firefox, Sync)
verifyLogin-title-2 = Har du logget ind på { $clientName }?
verifyLogin-description-2 = Hold din konto sikker ved at bekræfte, at du loggede ind på:
verifyLogin-subject-2 = Bekræft login
verifyLogin-action = Bekræft login
# Variables:
#  $code (String) - The confirmation code for sign-in
verifyLoginCode-subject-line-3 = Brug { $code } til at logge ind
verifyLoginCode-preview = Denne kode udløber om fem minutter.
# Variables:
#  $serviceName (String) - A service the user hasn't signed into before (e.g. Firefox)
verifyLoginCode-title-2 = Har du logget ind på { $serviceName }?
# After the colon is a description of the device used to sign in to the service
verifyLoginCode-safe = Hold din konto sikker ved at bekræfte dit login på:
verifyLoginCode-prompt-3 = Hvis du har, så er din godkendelseskode her:
verifyLoginCode-expiry-notice = Den udløber om fem minutter.
verifyPrimary-title-2 = Bekræft primær mailadresse
verifyPrimary-description = Følgende enhed har anmodet om at foretage en ændring af kontoen:
verifyPrimary-subject = Bekræft primær mailadresse
verifyPrimary-action-2 = Bekræft mailadresse
verifyPrimary-action-plaintext-2 = { verifyPrimary-action-2 }:
verifyPrimary-post-verify-2 = Når denne mailadresse er blevet bekræftet, kan ændringer af kontoen som fx tilføjelse af en sekundær mailadresse foretages fra denne enhed.
# Variables:
#  $code (String) - The confirmation code for secondary email
verifySecondaryCode-subject-2 = Brug { $code } til at bekræfte din sekundære mailadresse
verifySecondaryCode-preview = Denne kode udløber om fem minutter.
verifySecondaryCode-title-2 = Bekræft sekundær mailadresse
verifySecondaryCode-action-2 = Bekræft mailadresse
# Variables:
#  $email (string) A user's unverified secondary email address
verifySecondaryCode-explainer-2 = Den følgende { -product-mozilla-account } har anmodet om at bruge { $email } som sekundær mailadresse:
verifySecondaryCode-prompt-2 = Brug denne bekræftelseskode:
verifySecondaryCode-expiry-notice-2 = Den udløber om fem minutter. Når denne mailadresse er blevet bekræftet, vil den begynde at modtage sikkerhedsmeddelelser og bekræftelser.
# Variables:
#  $code (String) - comfirmation code for the account
verifyShortCode-subject-4 = Brug { $code } til at bekræfte din konto
verifyShortCode-preview-2 = Denne kode udløber om fem minutter
verifyShortCode-title-3 = Åbn internettet med { -brand-mozilla }
# Information on the browser and device triggering this confirmation email follows below this string.
verifyShortCode-title-subtext-2 = Bekræft din konto og få mest muligt ud af { -brand-mozilla }, overalt hvor du logger ind:
verifyShortCode-prompt-3 = Brug denne bekræftelseskode:
verifyShortCode-expiry-notice = Den udløber om fem minutter.
