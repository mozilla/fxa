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

## Email content
## Emails do not contain buttons, only links. Emails have a rich HTML version and a plaintext
## version. The strings are usually identical but sometimes they differ slightly.

fxa-header-mozilla-logo = <img data-l10n-name="mozilla-logo" alt="{ -brand-mozilla }-logo">
fxa-header-sync-devices-image = <img data-l10n-name="sync-devices-image" alt="Apparaten synchroniseren">
body-devices-image = <img data-l10n-name="devices-image" alt="Apparaten">
fxa-privacy-url = { -brand-mozilla }-privacybeleid
moz-accounts-privacy-url-2 = { -product-mozilla-accounts(capitalization: "uppercase") }-privacyverklaring
moz-accounts-terms-url = { -product-mozilla-accounts(capitalization: "uppercase") }-Servicevoorwaarden
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
account-deletion-info-block-communications = Als uw account is verwijderd, ontvangt u nog steeds e-mailberichten van Mozilla Corporation en Mozilla Foundation, tenzij u <a data-l10n-name="unsubscribeLink">vraagt om af te melden</a>.
account-deletion-info-block-support = Als u vragen hebt of hulp nodig hebt, neem dan gerust contact op met ons <a data-l10n-name="supportLink">ondersteuningsteam</a>.
account-deletion-info-block-communications-plaintext = Als uw account is verwijderd, ontvangt u nog steeds e-mailberichten van Mozilla Corporation en Mozilla Foundation, tenzij u vraagt om af te melden:
account-deletion-info-block-support-plaintext = Als u vragen hebt of hulp nodig hebt, neem dan gerust contact op met ons ondersteuningsteam:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
body-android-badge = <img data-l10n-name="google-play-badge" alt="{ $productName } downloaden op { -google-play }">
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
body-ios-badge = <img data-l10n-name="apple-app-badge" alt="{ $productName } downloaden in de { -app-store }">
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-desktop-device-2 = { $productName } installeren op <a data-l10n-name="anotherDeviceLink">een ander desktopapparaat</a>.
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-device-2 = { $productName } installeren op <a data-l10n-name="anotherDeviceLink">een ander apparaat</a>.
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
android-download-plaintext = { $productName } downloaden via Google Play:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
ios-download-plaintext = { $productName } downloaden via de App Store:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-device-plaintext = { $productName } installeren op een ander apparaat:
automated-email-change-2 = Als u deze actie niet hebt uitgevoerd, <a data-l10n-name="passwordChangeLink">wijzig dan direct uw wachtwoord</a>.
automated-email-support = Bezoek voor meer info <a data-l10n-name="supportLink">{ -brand-mozilla } Support</a>.
# After the colon, there's a link to https://accounts.firefox.com/settings/change_password
automated-email-change-plaintext-2 = Als u deze actie niet hebt uitgevoerd, wijzig dan direct uw wachtwoord:
#  After the colon, there's a link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
automated-email-support-plaintext = Bezoek voor meer info { -brand-mozilla } Support:
automated-email-inactive-account = Dit is een geautomatiseerd e-mailbericht. U ontvangt dit omdat u een { -product-mozilla-account } hebt en het twee jaar geleden is sinds uw laatste aanmelding.
# supportLink - https://support.mozilla.org/kb/im-having-problems-my-firefox-account
automated-email-no-action = { automated-email-no-action-plaintext } Ga voor meer informatie naar <a data-l10n-name="supportLink">{ -brand-mozilla } Support</a>.
automated-email-no-action-plaintext = Dit is een geautomatiseerd bericht. Als u het per ongeluk hebt ontvangen, hoeft u niets te doen.
#  After the colon, there's a link to https://accounts.firefox.com/settings/change_password
automated-email-not-authorized-plaintext = Dit is een geautomatiseerd e-mailbericht; als u deze actie niet hebt geautoriseerd, wijzig dan uw wachtwoord:
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
# - $uaOS: the user agent's operating system (e.g, MacOS)
# - $uaOSVersion - the user agent's operating system version
automatedEmailRecoveryKey-origin-device-all = Deze aanvraag is afkomstig van { $uaBrowser } op { $uaOS } { $uaOSVersion }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
# - $uaOS: the user agent's operating system (e.g, MacOS)
automatedEmailRecoveryKey-origin-device-browser-os = Deze aanvraag is afkomstig van { $uaBrowser } op { $uaOS }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
automatedEmailRecoveryKey-origin-device-browser-only = Deze aanvraag is afkomstig van { $uaBrowser }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaOS: the user agent's operating system (e.g, MacOS)
# - $uaOSVersion - the user agent's operating system version
automatedEmailRecoveryKey-origin-device-OS-version-only = Deze aanvraag is afkomstig van { $uaOS } { $uaOSVersion }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaOS: the user agent's operating system (e.g, MacOS)
automatedEmailRecoveryKey-origin-device-OS-only = Dit verzoek is afkomstig van { $uaOS }.
automatedEmailRecoveryKey-delete-key-change-pwd = Als u dit niet was, <a data-l10n-name="revokeAccountRecoveryLink">verwijder dan de nieuwe sleutel</a> en <a data-l10n-name="passwordChangeLink">wijzig uw wachtwoord</a>
automatedEmailRecoveryKey-change-pwd-only = Als u dit niet was, <a data-l10n-name="passwordChangeLink">wijzig dan uw wachtwoord</a>.
automatedEmailRecoveryKey-more-info = Bezoek voor meer info <a data-l10n-name="supportLink">{ -brand-mozilla } Support</a>.
# Colon is followed by user device info on a separate line (e.g., "Firefox Nightly on Mac OSX 10.11")
automatedEmailRecoveryKey-origin-plaintext = Deze aanvraag is afkomstig van:
# Colon is followed by a URL to the account recovery key section of account settings
automatedEmailRecoveryKey-notyou-delete-key-plaintext = Als u dit niet was, verwijder dan de nieuwe sleutel:
# Colon is followed by a URL to the change password section of account settings
automatedEmailRecoveryKey-notyou-change-pwd-only-plaintext = Als u dit niet was, wijzig dan uw wachtwoord:
# This string is shown on its own line, after automatedEmailRecoveryKey-notyou-delete-key-plaintext and its URL
# Colon is followed by a URL to the change password section of account settings
automatedEmailRecoveryKey-notyou-change-pwd-plaintext = en wijzig uw wachtwoord:
# Colon is followed by a URL to Mozilla Support's "I'm having problems with my account" page
automatedEmailRecoveryKey-more-info-plaintext = Bezoek voor meer info { -brand-mozilla } Support:
automated-email-reset =
    Dit is een geautomatiseerd e-mailbericht; als u deze actie niet hebt geautoriseerd, <a data-l10n-name="resetLink">herinitialiseer dan uw wachtwoord</a>.
    Ga voor meer informatie naar <a data-l10n-name="supportLink">{ -brand-mozilla } Support</a>.
# Variables:
#  $resetLink (String) - Link to https://accounts.firefox.com/reset_password
automated-email-reset-plaintext-v2 = Als u deze actie niet hebt geautoriseerd, herinitialiseer dan nu uw wachtwoord via { $resetLink }
# This message is used by multiple automated emails that notify users of security events on their account
# "this action" is meant to be a generic term, and could, for example, refer to using a backup authentication code to confirm a password reset
automated-email-reset-pwd-two-factor =
    Als u deze actie niet hebt uitgevoerd, stel dan direct <a data-l10n-name="resetLink">uw wachtwoord</a> en <a data-l10n-name="twoFactorSettingsLink">authenticatie in twee stappen</a> opnieuw in.
    Bezoek <a data-l10n-name="supportLink">{ -brand-mozilla } Support</a> voor meer informatie.
# Followed by link to https://accounts.firefox.com/reset_password
automated-email-reset-pwd-plaintext-v3 = Als u deze actie niet hebt uitgevoerd, stel dan direct uw wachtwoord opnieuw in op:
# Followed by link to https://accounts.firefox.com/settings#two-step-authentication
automated-email-reset-two-factor-plaintext = Stel ook authenticatie in twee stappen opnieuw in op:
brand-banner-message = Wist u dat we onze naam hebben gewijzigd van { -product-firefox-accounts } naar { -product-mozilla-accounts }? <a data-l10n-name="learnMore">Meer info</a>
cancellationSurvey = Help ons onze dienstverlening te verbeteren door deze <a data-l10n-name="cancellationSurveyUrl">korte enquête</a> in te vullen.
# After the colon, there's a link to https://survey.alchemer.com/s3/6534408/Privacy-Security-Product-Cancellation-of-Service-Q4-21
cancellationSurvey-plaintext = Help ons onze dienstverlening te verbeteren door deze korte enquête in te vullen:
change-password-plaintext = Als u vermoedt dat iemand toegang tot uw account probeert te verkrijgen, wijzig dan uw wachtwoord.
manage-account = Account beheren
manage-account-plaintext = { manage-account }:
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
# Variables:
#  $supportUrl (String) - Link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
support-message-3 = Bezoek voor meer info <a data-l10n-name="supportLink">{ -brand-mozilla } Support</a>.
# Variables:
#  $supportUrl (String) - Link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
support-message-plaintext = Ga voor meer informatie naar { -brand-mozilla } Support: { $supportUrl }.
# Variables:
#  $uaBrowser (String) - User's browser, e.g. Firefox
#  $uaOS (String) - User's OS, e.g. Mac OSX
#  $uaOSVersion (String) - User's OS version, e.g. 10.11
device-all = { $uaBrowser } op { $uaOS } { $uaOSVersion }
# Variables:
#  $uaBrowser (String) - User's browser, e.g. Firefox
#  $uaOS (String) - User's OS, e.g. Mac OSX
device-browser-os = { $uaBrowser } op { $uaOS }
# Variables:
#  $city (String) - User's city
#  $stateCode (String) - User's state
#  $country (String) - User's country
location-all = { $city }, { $stateCode }, { $country } (geschat)
# Variables:
#  $city (String) - User's city
#  $country (String) - User's country
location-city-country = { $city }, { $country } (geschat)
# Variables:
#  $stateCode (String) - User's state
#  $country (String) - User's country
location-state-country = { $stateCode }, { $country } (geschat)
# Variables:
#  $country (stateCode) - User's country
location-country = { $country } (geschat)
view-invoice-link-action = Factuur bekijken
# Variables:
#  $invoiceLink (String) - The link to the invoice
# After the colon, there's a link to https://pay.stripe.com/
view-invoice-plaintext = Factuur bekijken: { $invoiceLink }
cadReminderFirst-subject-1 = Herinnering! Laten we { -brand-firefox } synchroniseren
cadReminderFirst-action = Nog een apparaat synchroniseren
cadReminderFirst-action-plaintext = { cadReminderFirst-action }:
# In the title of the email, "It takes two to sync", "two" refers to syncing two devices
cadReminderFirst-title-1 = Er zijn er twee nodig om te synchroniseren
cadReminderFirst-description-v2 = Neem uw tabbladen mee naar al uw apparaten. Ontvang uw bladwijzers, wachtwoorden en andere gegevens overal waar u { -brand-firefox } gebruikt.
cadReminderSecond-subject-2 = Mis het niet! Laten we uw synchronisatieconfiguratie voltooien
cadReminderSecond-action = Nog een apparaat synchroniseren
cadReminderSecond-title-2 = Vergeet niet te synchroniseren!
cadReminderSecond-description-sync = Synchroniseer uw bladwijzers, wachtwoorden, open tabbladen en meer – overal waar u { -brand-firefox } gebruikt.
cadReminderSecond-description-plus = Bovendien zijn uw gegevens altijd versleuteld. Alleen u en apparaten die u goedkeurt kunnen deze zien.
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
inactiveAccountFinalWarning-subject = Laatste kans om uw { -product-mozilla-account } te behouden
inactiveAccountFinalWarning-title = Uw { -brand-mozilla }-account en -gegevens zullen worden verwijderd
inactiveAccountFinalWarning-preview = Meld u aan om uw account te behouden
inactiveAccountFinalWarning-account-description = Uw { -product-mozilla-account } wordt gebruikt voor toegang tot gratis privacy- en navigatieproducten zoals { -brand-firefox } synchronisatie, { -product-mozilla-monitor }, { -product-firefox-relay } en { -product-mdn }.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
# This date will already be formatted with moment.js into Thursday, Jan 9, 2025 format
inactiveAccountFinalWarning-impact = Op <strong>{ $deletionDate }</strong> worden uw account en uw persoonlijke gegevens permanent verwijderd, tenzij u zich aanmeldt.
inactiveAccountFinalWarning-action = Meld u aan om uw account te behouden
# followed by link to sign in
inactiveAccountFinalWarning-action-plaintext = Meld u aan om uw account te behouden:
inactiveAccountFirstWarning-subject = Verlies uw account niet
inactiveAccountFirstWarning-title = Wilt u uw { -brand-mozilla }-account en -gegevens behouden?
inactiveAccountFirstWarning-account-description-v2 = Uw { -product-mozilla-account } wordt gebruikt voor toegang tot gratis privacy- en navigatieproducten zoals { -brand-firefox } synchronisatie, { -product-mozilla-monitor }, { -product-firefox-relay } en { -product-mdn }.
inactiveAccountFirstWarning-inactive-status = We hebben opgemerkt dat u zich al 2 jaar niet hebt aangemeld.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
# This date will already be formatted with moment.js into Thursday, Jan 9, 2025 format
inactiveAccountFirstWarning-impact = Uw account en uw persoonlijke gegevens worden op <strong>{ $deletionDate }</strong> permanent verwijderd, omdat u niet actief bent geweest.
inactiveAccountFirstWarning-action = Meld u aan om uw account te behouden
inactiveAccountFirstWarning-preview = Meld u aan om uw account te behouden
# followed by link to sign in
inactiveAccountFirstWarning-action-plaintext = Meld u aan om uw account te behouden:
inactiveAccountSecondWarning-subject = Actie vereist: accountverwijdering over 7 dagen
inactiveAccountSecondWarning-title = Uw { -brand-mozilla }-account en -gegevens worden over 7 dagen verwijderd
inactiveAccountSecondWarning-account-description-v2 = Uw { -product-mozilla-account } wordt gebruikt voor toegang tot gratis privacy- en navigatieproducten zoals { -brand-firefox } synchronisatie, { -product-mozilla-monitor }, { -product-firefox-relay } en { -product-mdn }.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
inactiveAccountSecondWarning-impact = Uw account en uw persoonlijke gegevens worden op <strong>{ $deletionDate }</strong> permanent verwijderd, omdat u niet actief bent geweest.
inactiveAccountSecondWarning-action = Meld u aan om uw account te behouden
inactiveAccountSecondWarning-preview = Meld u aan om uw account te behouden
# followed by link to sign in
inactiveAccountSecondWarning-action-plaintext = Meld u aan om uw account te behouden:
# The user has a low number of valid recovery codes remaining for use
codes-reminder-title-zero = U hebt geen reserve-authenticatiecodes meer!
codes-reminder-title-one = U bent toe aan uw laatste reserve-authenticatiecode
codes-reminder-title-two = Tijd om meer reserve-authenticatiecodes aan te maken
codes-reminder-description-part-one = Reserve-authenticatiecodes helpen u uw gegevens te herstellen als u uw wachtwoord vergeet.
codes-reminder-description-part-two = Maak nu nieuwe codes aan, zodat u later uw gegevens niet kwijtraakt.
codes-reminder-description-two-left = U hebt nog maar twee codes over.
codes-reminder-description-create-codes = Maak nieuwe reserve-authenticatiecodes aan om u te helpen weer toegang te krijgen tot uw account als u bent buitengesloten.
lowRecoveryCodes-action-2 = Codes aanmaken
codes-create-plaintext = { lowRecoveryCodes-action-2 }:
lowRecoveryCodes-subject-2 =
    { $numberRemaining ->
        [0] Geen reserve-authenticatiecodes over
        [one] Slechts 1 reserve-authenticatiecode over
       *[other] Slechts { $numberRemaining } reserve-authenticatiecodes over!
    }
# Variables:
# $clientName (String) - A client the user hasn't signed into before (e.g. Firefox, Sync)
newDeviceLogin-subject = Nieuwe aanmelding bij { $clientName }
newDeviceLogin-subjectForMozillaAccount = Nieuwe aanmelding bij uw { -product-mozilla-account }
newDeviceLogin-title-3 = Uw { -product-mozilla-account } is gebruikt om aan te melden
# The "Not you?" question is asking whether the recipient of the email is the
# person who performed the action that triggered the email.
newDeviceLogin-change-password = Was u dit niet? <a data-l10n-name="passwordChangeLink">Wijzig uw wachtwoord</a>.
# The "Not you?" question is asking whether the recipient of the email is the
# person who performed the action that triggered the email.
newDeviceLogin-change-password-plain = Was u dit niet? Wijzig uw wachtwoord:
newDeviceLogin-action = Account beheren
passwordChanged-subject = Wachtwoord bijgewerkt
passwordChanged-title = Wachtwoord met succes gewijzigd
passwordChanged-description-2 = Uw { -product-mozilla-account }-wachtwoord is met succes op het volgende apparaat gewijzigd:
passwordChangeRequired-subject = Verdachte activiteit gedetecteerd
passwordChangeRequired-preview = Wijzig direct uw wachtwoord
passwordChangeRequired-title-2 = Uw wachtwoord opnieuw instellen
passwordChangeRequired-suspicious-activity-3 = We hebben uw account vergrendeld om deze te beschermen tegen verdachte activiteit. U bent afgemeld bij al uw apparaten en alle gesynchroniseerde gegevens zijn uit voorzorg verwijderd.
passwordChangeRequired-sign-in-3 = Om u weer bij uw account aan te melden, hoeft u alleen maar uw wachtwoord opnieuw in te stellen.
passwordChangeRequired-different-password-2 = <b>Belangrijk:</b> kies een sterk wachtwoord dat anders is dan een wachtwoord dat u in het verleden hebt gebruikt.
passwordChangeRequired-different-password-plaintext-2 = Belangrijk: kies een sterk wachtwoord dat anders is dan een wachtwoord dat u in het verleden hebt gebruikt.
passwordChangeRequired-action = Wachtwoord opnieuw instellen
passwordChangeRequired-action-plaintext = { passwordChangeRequired-action }:
# Variables:
#  $code (String) - The confirmation code for sign-in
password-forgot-otp-subject-2 = Gebruik { $code } om uw wachtwoord te wijzigen
password-forgot-otp-preview = Deze code verloopt over 10 minuten
password-forgot-otp-title = Uw wachtwoord vergeten?
password-forgot-otp-request = We hebben een verzoek ontvangen voor een wachtwoordwijziging op uw { -product-mozilla-account } van:
password-forgot-otp-code-2 = Als u dit was, dan is dit uw bevestigingscode om verder te gaan:
password-forgot-otp-expiry-notice = Deze code verloopt over 10 minuten.
passwordReset-subject-2 = Uw wachtwoord is opnieuw ingesteld
passwordReset-title-2 = Uw wachtwoord is opnieuw ingesteld
# This sentence is followed by information about the device and time of the password reset
passwordReset-description-2 = U hebt uw { -product-mozilla-account }-wachtwoord opnieuw ingesteld op:
passwordResetAccountRecovery-subject-2 = Uw wachtwoord is opnieuw ingesteld
passwordResetAccountRecovery-title-3 = Uw wachtwoord is opnieuw ingesteld
# Followed by details on the device, location, and date/time of the password reset.
passwordResetAccountRecovery-description-3 = U hebt uw accountherstelsleutel gebruikt om uw { -product-mozilla-account }-wachtwoord opnieuw in te stellen op:
passwordResetAccountRecovery-information = We hebben u op al uw gesynchroniseerde apparaten afgemeld. We hebben een nieuwe accountherstelsleutel aangemaakt om de gebruikte sleutel te vervangen. U kunt dit wijzigen in uw accountinstellingen.
# After the colon there is a link to account settings
passwordResetAccountRecovery-information-txt = We hebben u op al uw gesynchroniseerde apparaten afgemeld. We hebben een nieuwe accountherstelsleutel aangemaakt om de gebruikte sleutel te vervangen. U kunt dit wijzigen in uw accountinstellingen:
passwordResetAccountRecovery-action-4 = Account beheren
passwordResetRecoveryPhone-subject = Hersteltelefoonnummer gebruikt
passwordResetRecoveryPhone-preview = Controleer of u dit inderdaad hebt gedaan
passwordResetRecoveryPhone-title = Uw hersteltelefoonnummer is gebruikt om een wachtwoordherinitialisatie te bevestigen
passwordResetRecoveryPhone-device = Hersteltelefoonnummer gebruikt vanaf:
passwordResetRecoveryPhone-action = Account beheren
passwordResetWithRecoveryKeyPrompt-subject = Uw wachtwoord is opnieuw ingesteld
passwordResetWithRecoveryKeyPrompt-title = Uw wachtwoord is opnieuw ingesteld
# Details of the device and date/time where the password was reset
passwordResetWithRecoveryKeyPrompt-description = U hebt uw { -product-mozilla-account }-wachtwoord opnieuw ingesteld op:
# Text for button action to create a new account recovery key
passwordResetWithRecoveryKeyPrompt-action = Accountherstelsleutel aanmaken
# colon is followed by a link to create an account recovery key from the account settings page
passwordResetWithRecoveryKeyPrompt-action-txt = Accountherstelsleutel aanmaken:
passwordResetWithRecoveryKeyPrompt-cta-description = U dient zich opnieuw aan te melden op al uw gesynchroniseerde apparaten. Houd uw gegevens de volgende keer veilig met een accountherstelsleutel. Hierdoor kunt u uw gegevens herstellen als u uw wachtwoord bent vergeten.
postAddAccountRecovery-subject-3 = Nieuwe accountherstelsleutel aangemaakt
postAddAccountRecovery-title2 = U hebt een nieuwe sleutel voor accountherstel aangemaakt
# Key here refers to account recovery key
postAddAccountRecovery-body-part1 = Bewaar deze sleutel op een veilige plek – u hebt hem nodig om uw versleutelde navigatiegegevens te herstellen als u uw wachtwoord vergeet.
# Key here refers to account recovery key
postAddAccountRecovery-body-part2 = Deze sleutel kan maar één keer worden gebruikt. Nadat u deze hebt gebruikt, maken we automatisch een nieuwe voor u aan. Of u kunt op elk gewenst moment een nieuwe aanmaken vanuit uw accountinstellingen.
postAddAccountRecovery-action = Account beheren
postAddLinkedAccount-subject-2 = Nieuwe account gekoppeld aan uw { -product-mozilla-account }
#  Variables:
#  $providerName (String) - The name of the provider, e.g. Apple, Google
postAddLinkedAccount-title-2 = Uw { $providerName }-account is gekoppeld aan uw { -product-mozilla-account }
postAddLinkedAccount-action = Account beheren
postAddRecoveryPhone-subject = Hersteltelefoonnummer toegevoegd
postAddRecoveryPhone-preview = Account beschermd door authenticatie in twee stappen
postAddRecoveryPhone-title-v2 = U hebt een hersteltelefoonnummer toegevoegd
# Variables:
#  $maskedLastFourPhoneNumber (String) - A bullet point mask with the last four digits of the user's phone number, e.g. ••••••1234
postAddRecoveryPhone-description-v2 = U hebt { $maskedLastFourPhoneNumber } toegevoegd als uw hersteltelefoonnummer
# Links out to a support article about two factor authentication
postAddRecoveryPhone-how-protect = Hoe dit uw account beschermt
postAddRecoveryPhone-how-protect-plaintext = Hoe dit uw account beschermt:
postAddRecoveryPhone-enabled-device = U hebt het ingeschakeld vanaf:
postAddRecoveryPhone-action = Account beheren
postAddTwoStepAuthentication-preview = Uw account is beschermd
postAddTwoStepAuthentication-subject-v3 = Authenticatie in twee stappen is ingeschakeld
postAddTwoStepAuthentication-title-2 = U hebt authenticatie in twee stappen ingeschakeld
# After the colon, there is a description of the device that the user used to enable two-step authentication
postAddTwoStepAuthentication-from-device-v2 = U hebt dit opgevraagd van:
postAddTwoStepAuthentication-action = Account beheren
postAddTwoStepAuthentication-code-required-v4 = Telkens als u zich aanmeldt zijn nu beveiligingscodes vanaf uw authenticator-app vereist.
postAddTwoStepAuthentication-recovery-method-codes = U hebt ook reserve-authenticatiecodes toegevoegd als uw herstelmethode.
# Variables:
#  $maskedPhoneNumber (String) - A bullet point mask with the last four digits of the user's phone number, e.g. ••••••1234
postAddTwoStepAuthentication-recovery-method-phone = U hebt ook { $maskedPhoneNumber } toegevoegd als uw hersteltelefoonnummer.
postAddTwoStepAuthentication-how-protects-link = Hoe dit uw account beschermt
postAddTwoStepAuthentication-how-protects-plaintext = Hoe dit uw account beschermt:
postAddTwoStepAuthentication-device-sign-out-message = Om al uw verbonden apparaten te beschermen, dient u zich overal waar u deze account gebruikt af te melden en vervolgens weer aan te melden met authenticatie in twee stappen.
postChangeAccountRecovery-subject = Accountherstelsleutel gewijzigd
postChangeAccountRecovery-title = U hebt uw accountherstelsleutel gewijzigd
postChangeAccountRecovery-body-part1 = U hebt nu een nieuwe accountherstelsleutel. Uw vorige sleutel is verwijderd.
postChangeAccountRecovery-body-part2 = Bewaar deze nieuwe sleutel op een veilige plek – u hebt hem nodig om uw versleutelde navigatiegegevens te herstellen als u uw wachtwoord vergeet.
postChangeAccountRecovery-action = Account beheren
postChangePrimary-subject = Primair e-mailadres bijgewerkt
postChangePrimary-title = Nieuw primair e-mailadres
# Variables:
#  $email (String) - A user's email address
postChangePrimary-description-2 = U hebt uw primaire e-mailadres met succes naar { $email } gewijzigd. Dit adres is nu uw gebruikersnaam voor het aanmelden bij uw { -product-mozilla-account }, evenals voor het ontvangen van beveiligingsmeldingen
postChangePrimary-action = Account beheren
postChangeRecoveryPhone-subject = Hersteltelefoonnummer bijgewerkt
postChangeRecoveryPhone-preview = Account beschermd door authenticatie in twee stappen
postChangeRecoveryPhone-title = U hebt uw hersteltelefoonnummer gewijzigd
postChangeRecoveryPhone-description = U hebt nu een nieuw hersteltelefoonnummer. Uw vorige telefoonnummer is verwijderd.
postChangeRecoveryPhone-requested-device = U hebt het opgevraagd vanaf:
postChangeTwoStepAuthentication-preview = Uw account is beschermd
postChangeTwoStepAuthentication-subject = Authenticatie in twee stappen bijgewerkt
postChangeTwoStepAuthentication-title = Authenticatie in twee stappen is bijgewerkt
postChangeTwoStepAuthentication-use-new-account = U dient nu de nieuwe vermelding voor { -product-mozilla-account } in uw authenticator-app te gebruiken. De oudere zal niet meer werken en u kunt hem verwijderen.
# After the colon, there is a description of the device that the user used to enable two-step authentication
postChangeTwoStepAuthentication-from-device = U hebt dit opgevraagd van:
postChangeTwoStepAuthentication-action = Account beheren
postChangeTwoStepAuthentication-how-protects-link = Hoe dit uw account beschermt
postChangeTwoStepAuthentication-how-protects-plaintext = Hoe dit uw account beschermt:
postChangeTwoStepAuthentication-device-sign-out-message = Om al uw verbonden apparaten te beschermen, dient u zich overal waar u deze account gebruikt af te melden en vervolgens weer aan te melden met uw nieuwe authenticatie in twee stappen.
postConsumeRecoveryCode-title-3 = Uw reserve-authenticatiecode is gebruikt om een wachtwoordherinitialisatie te bevestigen
# After the colon, there is description of the device that the backup authentication code was used on
# E.g., Firefox Nightly on Mac OSX, Thursday Sept 2, 2024
postConsumeRecoveryCode-description-3 = Code gebruikt van:
postConsumeRecoveryCode-action = Account beheren
postConsumeRecoveryCode-subject-v3 = Reserve-authenticatiecode gebruikt
postConsumeRecoveryCode-preview = Controleer of u dit inderdaad hebt gedaan
postNewRecoveryCodes-subject-2 = Nieuwe reserve-authenticatiecodes aangemaakt
postNewRecoveryCodes-title-2 = U hebt nieuwe reserve-authenticatiecodes aangemaakt
# After the colon, there is information about the device that the authentication codes were created on
postNewRecoveryCodes-description-2 = Ze zijn aangemaakt op:
postNewRecoveryCodes-action = Account beheren
postRemoveAccountRecovery-subject-2 = Sleutel voor accountherstel verwijderd
postRemoveAccountRecovery-title-3 = U hebt uw accountherstelsleutel verwijderd
postRemoveAccountRecovery-body-part1 = Uw accountherstelsleutel is vereist om uw versleutelde navigatiegegevens te herstellen als u uw wachtwoord vergeet.
postRemoveAccountRecovery-body-part2 = Maak, als u dat nog niet hebt gedaan, een nieuwe accountherstelsleutel aan in uw accountinstellingen om te voorkomen dat u uw opgeslagen wachtwoorden, bladwijzers, navigatiegeschiedenis en meer kwijtraakt.
postRemoveAccountRecovery-action = Account beheren
postRemoveRecoveryPhone-subject = Hersteltelefoonnummer verwijderd
postRemoveRecoveryPhone-preview = Account beschermd door authenticatie in twee stappen
postRemoveRecoveryPhone-title = Hersteltelefoonnummer verwijderd
postRemoveRecoveryPhone-description-v2 = Uw hersteltelefoonnummer is verwijderd uit uw instellingen voor authenticatie in twee stappen.
postRemoveRecoveryPhone-description-extra = U kunt nog steeds uw reserve-authenticatiecodes gebruiken om u aan te melden als u uw authenticator-app niet kunt gebruiken.
postRemoveRecoveryPhone-requested-device = U hebt het opgevraagd vanaf:
postRemoveSecondary-subject = Secundair e-mailadres verwijderd
postRemoveSecondary-title = Secundair e-mailadres verwijderd
# Variables:
#  $secondaryEmail (String) - A user's email address
postRemoveSecondary-description-2 = U hebt { $secondaryEmail } met succes als secundair e-mailadres van uw { -product-mozilla-account } verwijderd. Beveiligingsmeldingen en aanmeldingsbevestigingen worden niet meer op dit adres afgeleverd.
postRemoveSecondary-action = Account beheren
postRemoveTwoStepAuthentication-subject-line-2 = Authenticatie in twee stappen is uitgeschakeld
postRemoveTwoStepAuthentication-title-2 = U hebt authenticatie in twee stappen uitgeschakeld
# After the colon is a description of the device the user used to disable two-step authentication
postRemoveTwoStepAuthentication-from-device = U hebt het uitgeschakeld vanaf:
postRemoveTwoStepAuthentication-action = Account beheren
postRemoveTwoStepAuthentication-not-required-2 = U hebt geen beveiligingscodes van uw authenticatie-app meer nodig wanneer u zich aanmeldt.
postSigninRecoveryCode-subject = Reserve-authenticatiecode gebruikt om aan te melden
postSigninRecoveryCode-preview = Accountactiviteit bevestigen
postSigninRecoveryCode-title = Uw reserve-authenticatiecode is gebruikt om aan te melden
postSigninRecoveryCode-description = Als u dit niet hebt gedaan, dient u onmiddellijk uw wachtwoord te wijzigen om uw account veilig te houden.
postSigninRecoveryCode-device = U bent aangemeld vanaf:
postSigninRecoveryCode-action = Account beheren
postSigninRecoveryPhone-subject = Hersteltelefoonnummer gebruikt voor aanmelding
postSigninRecoveryPhone-preview = Accountactiviteit bevestigen
postSigninRecoveryPhone-title = Uw hersteltelefoonnummer is gebruikt om aan te melden
postSigninRecoveryPhone-description = Als u dit niet hebt gedaan, dient u onmiddellijk uw wachtwoord te wijzigen om uw account veilig te houden.
postSigninRecoveryPhone-device = U bent aangemeld vanaf:
postSigninRecoveryPhone-action = Account beheren
postVerify-sub-title-3 = We zijn verheugd u te zien!
postVerify-title-2 = Wilt u hetzelfde tabblad op twee apparaten zien?
postVerify-description-2 = Dat is makkelijk! Installeer gewoon { -brand-firefox } op een ander apparaat en meld u aan om te synchroniseren. Het is magisch!
postVerify-sub-description = (Psst… Het betekent ook dat u overal waar u bent aangemeld toegang hebt tot uw bladwijzers, wachtwoorden en andere { -brand-firefox }-gegevens.)
postVerify-subject-4 = Welkom bij { -brand-mozilla }!
postVerify-setup-2 = Nog een apparaat koppelen:
postVerify-action-2 = Een ander apparaat verbinden
postVerifySecondary-subject = Secundair e-mailadres toegevoegd
postVerifySecondary-title = Secundair e-mailadres toegevoegd
# Variables:
#  $secondaryEmail (String) - A user's secondary email address
postVerifySecondary-content-3 = U hebt { $secondaryEmail } met succes als secundair e-mailadres voor uw { -product-mozilla-account } bevestigd. Beveiligingsmeldingen en aanmeldingsbevestigingen worden nu op beide e-mailadressen afgeleverd.
postVerifySecondary-action = Account beheren
recovery-subject = Herinitialiseer uw wachtwoord
recovery-title-2 = Uw wachtwoord vergeten?
# Information on the device, location, and date and time of the request that triggered the email follows.
recovery-request-origin-2 = We hebben een verzoek ontvangen voor een wachtwoordwijziging op uw { -product-mozilla-account } van:
recovery-new-password-button = Maak een nieuw wachtwoord aan door op onderstaande knop te klikken. Deze koppeling verloopt binnen een uur.
recovery-copy-paste = Maak een nieuw wachtwoord aan door de onderstaande URL te kopiëren en in uw browser te plakken. Deze koppeling verloopt binnen een uur.
recovery-action = Nieuw wachtwoord aanmaken
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountDeletion-subject = Uw abonnement op { $productName } is opgezegd
subscriptionAccountDeletion-title = Jammer dat u vertrekt
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $invoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
subscriptionAccountDeletion-content-cancelled-2 = U heeft onlangs uw { -product-mozilla-account } verwijderd. Als gevolg hiervan hebben we uw { $productName }-abonnement opgezegd. Uw laatste betaling van { $invoiceTotal } is betaald op { $invoiceDateOnly }.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountFinishSetup-subject = Welkom bij { $productName }: stel uw wachtwoord in.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountFinishSetup-title = Welkom bij { $productName }
subscriptionAccountFinishSetup-content-processing = Uw betaling wordt verwerkt en wordt binnen vier werkdagen voltooid. Uw abonnement wordt elke factureringsperiode automatisch verlengd, tenzij u opzegt.
subscriptionAccountFinishSetup-content-create-3 = Hierna maakt u een { -product-mozilla-account }-wachtwoord aan om uw nieuwe abonnement te gaan gebruiken.
subscriptionAccountFinishSetup-action-2 = Beginnen
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
#   $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#   $planIntervalCount (String) - The interval count of subscription plan, e.g. 2
#   $planInterval (String) - The interval of time of the subscription plan, e.g. week
#   $reminderLength (String) - The number of days until the current subscription is set to automatically renew, e.g. 14
subscriptionRenewalReminder-content-current = Uw huidige abonnement wordt over { $reminderLength } dagen automatisch verlengd. Op dat moment verlengt { -brand-mozilla } uw { $planIntervalCount } { $planInterval }-abonnement en wordt { $invoiceTotal } in rekening gebracht op de betaalmethode op uw account.
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
subscriptionsPaymentExpired-subject-2 = De betalingsmethode voor uw abonnementen is verlopen of verloopt binnenkort
subscriptionsPaymentExpired-title-2 = Uw betalingsmethode is verlopen of verloopt binnenkort
subscriptionsPaymentExpired-content-2 = De betalingsmethode die u gebruikt voor betalingen voor de volgende abonnementen is verlopen of verloopt binnenkort.
subscriptionsPaymentProviderCancelled-subject = Bijwerken van betalingsgegevens vereist voor { -brand-mozilla }-abonnementen
subscriptionsPaymentProviderCancelled-title = Sorry, we hebben problemen met uw betalingsmethode
subscriptionsPaymentProviderCancelled-content-detected = We hebben een probleem met uw betalingsmethode voor de volgende abonnementen vastgesteld.
subscriptionsPaymentProviderCancelled-content-payment-1 = Mogelijk is uw betalingsmethode verlopen, of is uw huidige betalingsmethode verouderd.
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
# Variables:
#  $unblockCode (String) - The authorization code for sign-in
unblockCode-subject-2 = Gebruik { $unblockCode } om u aan te melden
unblockCode-preview = Deze code verloopt over een uur
unblockCode-title = Bent u dit die zich aanmeldt?
unblockCode-prompt = Zo ja, dan is hier de benodigde autorisatiecode:
# Variables:
#  $unblockCode (String) - An alphanumeric code
unblockCode-prompt-plaintext = Zo ja, dan is hier de benodigde autorisatiecode: { $unblockCode }
unblockCode-report = Zo nee, help ons dan indringers tegen te houden en <a data-l10n-name="reportSignInLink">meld het aan ons</a>.
unblockCode-report-plaintext = Zo nee, help ons dan indringers tegen te houden en meld het aan ons.
verificationReminderFinal-subject = Laatste herinnering om uw account te bevestigen
verificationReminderFinal-description-2 = U hebt een paar weken geleden een { -product-mozilla-account } aangemaakt, maar deze nooit bevestigd. Voor uw veiligheid zullen we de account verwijderen als deze niet binnen 24 uur is geverifieerd.
confirm-account = Account bevestigen
confirm-account-plaintext = { confirm-account }:
verificationReminderFirst-subject-2 = Vergeet niet om uw account te bevestigen
verificationReminderFirst-title-3 = Welkom bij { -brand-mozilla }!
verificationReminderFirst-description-3 = U hebt een paar dagen geleden een { -product-mozilla-account } aangemaakt, maar deze nooit bevestigd. Bevestig uw account binnen de komende 15 dagen, anders wordt deze automatisch verwijderd.
verificationReminderFirst-sub-description-3 = Mis de browser die u en uw privacy op de eerste plaats zet niet.
confirm-email-2 = Account bevestigen
confirm-email-plaintext-2 = { confirm-email-2 }:
verificationReminderFirst-action-2 = Account bevestigen
verificationReminderSecond-subject-2 = Vergeet niet om uw account te bevestigen
verificationReminderSecond-title-3 = Mis niets van { -brand-mozilla }!
verificationReminderSecond-description-4 = U hebt een paar dagen geleden een { -product-mozilla-account } aangemaakt, maar deze nooit bevestigd. Bevestig uw account binnen de komende 10 dagen, anders wordt deze automatisch verwijderd.
verificationReminderSecond-second-description-3 = Met uw { -product-mozilla-account } kunt u uw { -brand-firefox }-ervaring tussen apparaten synchroniseren en krijgt u toegang tot meer privacybeschermende producten van { -brand-mozilla }.
verificationReminderSecond-sub-description-2 = Maak deel uit van onze missie om het internet om te vormen tot een plek die openstaat voor iedereen.
verificationReminderSecond-action-2 = Account bevestigen
verify-title-3 = Open het internet met { -brand-mozilla }
verify-description-2 = Bevestig uw account en haal overal waar u zich aanmeldt het meeste uit { -brand-mozilla }, te beginnen met:
verify-subject = Aanmaken van uw account voltooien
verify-action-2 = Account bevestigen
# Variables:
# $code (String) - The verification code
verifyAccountChange-subject = Gebruik { $code } om uw account te wijzigen
# Variables:
# $expirationTime (Number) - Represents the expiration time in minutes
verifyAccountChange-preview =
    { $expirationTime ->
        [one] Deze code verloopt over { $expirationTime } minuut.
       *[other] Deze code verloopt over { $expirationTime } minuten.
    }
verifyAccountChange-title = Wijzigt u uw accountgegevens?
# After the colon is a description of the device used to sign in to the service
verifyAccountChange-safe = Help ons uw account veilig te houden door deze wijziging goed te keuren op:
verifyAccountChange-prompt = Zo ja, dan is dit uw autorisatiecode:
# Variables:
# $expirationTime (Number) - Represents the expiration time in minutes
verifyAccountChange-expiry-notice =
    { $expirationTime ->
        [one] Deze verloopt over { $expirationTime } minuut.
       *[other] Deze verloopt over { $expirationTime } minuten.
    }
# Variables:
#  $clientName (String) - A client the user hasn't signed into before (e.g. Firefox, Sync)
verifyLogin-title-2 = Hebt u zich aangemeld bij { $clientName }?
verifyLogin-description-2 = Help ons uw account veilig te houden door te bevestigen dat u bent aangemeld op:
verifyLogin-subject-2 = Aanmelding bevestigen
verifyLogin-action = Aanmelding bevestigen
# Variables:
#  $code (String) - The confirmation code for sign-in
verifyLoginCode-subject-line-3 = Gebruik { $code } om u aan te melden
verifyLoginCode-preview = Deze code verloopt over 5 minuten.
# Variables:
#  $serviceName (String) - A service the user hasn't signed into before (e.g. Firefox)
verifyLoginCode-title-2 = Hebt u zich aangemeld bij { $serviceName }?
# After the colon is a description of the device used to sign in to the service
verifyLoginCode-safe = Help ons uw account veilig te houden door uw aanmelding goed te keuren op:
verifyLoginCode-prompt-3 = Zo ja, dan is dit uw autorisatiecode:
verifyLoginCode-expiry-notice = Deze verloopt over vijf minuten.
verifyPrimary-title-2 = Primair e-mailadres bevestigen
verifyPrimary-description = Er is een aanvraag voor het uitvoeren van een accountwijziging gedaan vanaf het volgende apparaat:
verifyPrimary-subject = Primair e-mailadres bevestigen
verifyPrimary-action-2 = E-mailadres bevestigen
verifyPrimary-action-plaintext-2 = { verifyPrimary-action-2 }:
verifyPrimary-post-verify-2 = Na bevestiging worden accountwijzigingen zoals het toevoegen van een secundair e-mailadres mogelijk vanaf dit apparaat.
# Variables:
#  $code (String) - The confirmation code for secondary email
verifySecondaryCode-subject-2 = Gebruik { $code } om uw secundaire e-mailadres te bevestigen
verifySecondaryCode-preview = Deze code verloopt over 5 minuten.
verifySecondaryCode-title-2 = Secundair e-mailadres bevestigen
verifySecondaryCode-action-2 = E-mailadres bevestigen
# Variables:
#  $email (string) A user's unverified secondary email address
verifySecondaryCode-explainer-2 = Er is een aanvraag voor het gebruik van { $email } als tweede e-mailadres gedaan vanaf de volgende { -product-mozilla-account }:
verifySecondaryCode-prompt-2 = Gebruik deze bevestigingscode:
verifySecondaryCode-expiry-notice-2 = Deze verloopt over 5 minuten. Na bevestiging ontvangt dit adres beveiligingsmeldingen en bevestigingen.
# Variables:
#  $code (String) - comfirmation code for the account
verifyShortCode-subject-4 = Gebruik { $code } om uw account te bevestigen
verifyShortCode-preview-2 = Deze code verloopt over 5 minuten
verifyShortCode-title-3 = Open het internet met { -brand-mozilla }
# Information on the browser and device triggering this confirmation email follows below this string.
verifyShortCode-title-subtext-2 = Bevestig uw account en haal overal waar u zich aanmeldt het meeste uit { -brand-mozilla }, te beginnen met:
verifyShortCode-prompt-3 = Gebruik deze bevestigingscode:
verifyShortCode-expiry-notice = Deze verloopt over vijf minuten.
