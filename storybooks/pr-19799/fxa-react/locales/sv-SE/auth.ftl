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

## Email content
## Emails do not contain buttons, only links. Emails have a rich HTML version and a plaintext
## version. The strings are usually identical but sometimes they differ slightly.

fxa-header-mozilla-logo = <img data-l10n-name="mozilla-logo" alt="{ -brand-mozilla } logotyp">
fxa-header-sync-devices-image = <img data-l10n-name="sync-devices-image" alt="Synkronisera enheter">
body-devices-image = <img data-l10n-name="devices-image" alt="Enheter">
fxa-privacy-url = { -brand-mozilla } sekretesspolicy
moz-accounts-privacy-url-2 = { -product-mozilla-accounts(capitalization: "uppercase") } sekretessmeddelande
moz-accounts-terms-url = { -product-mozilla-accounts(capitalization: "uppercase") } användarvillkor
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
account-deletion-info-block-communications = Om ditt konto raderas kommer du fortfarande att få e-postmeddelanden från Mozilla Corporation och Mozilla Foundation, såvida du inte <a data-l10n-name="unsubscribeLink">ber om att avregistrera dig</a>.
account-deletion-info-block-support = Om du har några frågor eller behöver hjälp är du välkommen att kontakta vårt <a data-l10n-name="supportLink">supportteam</a>.
account-deletion-info-block-communications-plaintext = Om ditt konto raderas kommer du fortfarande att få e-postmeddelanden från Mozilla Corporation och Mozilla Foundation, såvida du inte ber om att avregistrera dig:
account-deletion-info-block-support-plaintext = Om du har några frågor eller behöver hjälp är du välkommen att kontakta vårt supportteam:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
body-android-badge = <img data-l10n-name="google-play-badge" alt="Hämta { $productName } i { -google-play }">
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
body-ios-badge = <img data-l10n-name="apple-app-badge" alt="Hämta { $productName } i { -app-store }">
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-desktop-device-2 = Installera { $productName } på <a data-l10n-name="anotherDeviceLink">en annan stationär enhet</a>.
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-device-2 = Installera { $productName } på <a data-l10n-name="anotherDeviceLink">en annan enhet</a>.
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
android-download-plaintext = Skaffa { $productName } på Google Play:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
ios-download-plaintext = Ladda ner { $productName } i App Store:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-device-plaintext = Installera { $productName } på en annan enhet:
automated-email-change-2 = Om du inte vidtog den här åtgärden, <a data-l10n-name="passwordChangeLink">ändra ditt lösenord</a> direkt.
automated-email-support = För mer information, besök <a data-l10n-name="supportLink">{ -brand-mozilla } Support</a>.
# After the colon, there's a link to https://accounts.firefox.com/settings/change_password
automated-email-change-plaintext-2 = Om du inte vidtog den här åtgärden, ändra ditt lösenord direkt:
#  After the colon, there's a link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
automated-email-support-plaintext = För mer information, besök { -brand-mozilla } Support:
automated-email-inactive-account = Detta är ett automatiskt e-postmeddelande. Du får det för att du har ett { -product-mozilla-account } och det har gått 2 år sedan din senaste inloggning.
# supportLink - https://support.mozilla.org/kb/im-having-problems-my-firefox-account
automated-email-no-action = { automated-email-no-action-plaintext } För mer information, besök <a data-l10n-name="supportLink">{ -brand-mozilla } Support</a>.
automated-email-no-action-plaintext = Detta är ett automatiskt e-postmeddelande. Om du fick det av misstag behöver du inte göra någonting.
#  After the colon, there's a link to https://accounts.firefox.com/settings/change_password
automated-email-not-authorized-plaintext = Detta är ett automatiskt e-postmeddelande; om du inte godkände den här åtgärden, vänligen ändra ditt lösenord:
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
# - $uaOS: the user agent's operating system (e.g, MacOS)
# - $uaOSVersion - the user agent's operating system version
automatedEmailRecoveryKey-origin-device-all = Denna begäran kom från { $uaBrowser } på { $uaOS } { $uaOSVersion }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
# - $uaOS: the user agent's operating system (e.g, MacOS)
automatedEmailRecoveryKey-origin-device-browser-os = Denna begäran kom från { $uaBrowser } på { $uaOS }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
automatedEmailRecoveryKey-origin-device-browser-only = Denna begäran kom från { $uaBrowser }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaOS: the user agent's operating system (e.g, MacOS)
# - $uaOSVersion - the user agent's operating system version
automatedEmailRecoveryKey-origin-device-OS-version-only = Denna begäran kom från { $uaOS } { $uaOSVersion }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaOS: the user agent's operating system (e.g, MacOS)
automatedEmailRecoveryKey-origin-device-OS-only = Denna begäran kom från { $uaOS }.
automatedEmailRecoveryKey-delete-key-change-pwd = Om det inte var du <a data-l10n-name="revokeAccountRecoveryLink">ta bort den nya nyckeln</a> och <a data-l10n-name="passwordChangeLink">ändra ditt lösenord</a>.
automatedEmailRecoveryKey-change-pwd-only = Om det här inte var du <a data-l10n-name="passwordChangeLink">ändra ditt lösenord</a>.
automatedEmailRecoveryKey-more-info = För mer information besök <a data-l10n-name="supportLink">{ -brand-mozilla } Support</a>.
# Colon is followed by user device info on a separate line (e.g., "Firefox Nightly on Mac OSX 10.11")
automatedEmailRecoveryKey-origin-plaintext = Denna begäran kom från:
# Colon is followed by a URL to the account recovery key section of account settings
automatedEmailRecoveryKey-notyou-delete-key-plaintext = Om det här inte var du, ta bort den nya nyckeln:
# Colon is followed by a URL to the change password section of account settings
automatedEmailRecoveryKey-notyou-change-pwd-only-plaintext = Om det här inte var du, ändra ditt lösenord:
# This string is shown on its own line, after automatedEmailRecoveryKey-notyou-delete-key-plaintext and its URL
# Colon is followed by a URL to the change password section of account settings
automatedEmailRecoveryKey-notyou-change-pwd-plaintext = och ändra ditt lösenord:
# Colon is followed by a URL to Mozilla Support's "I'm having problems with my account" page
automatedEmailRecoveryKey-more-info-plaintext = För mer information, besök { -brand-mozilla } Support:
automated-email-reset =
    Detta är ett automatiskt e-postmeddelande; om du inte godkände den här åtgärden <a data-l10n-name="resetLink">vänligen återställ ditt lösenord</a>.
    För mer information, besök <a data-l10n-name="supportLink">{ -brand-mozilla } Support</a>.
# Variables:
#  $resetLink (String) - Link to https://accounts.firefox.com/reset_password
automated-email-reset-plaintext-v2 = Om du inte godkände den här åtgärden, vänligen återställ ditt lösenord nu på { $resetLink }
# This message is used by multiple automated emails that notify users of security events on their account
# "this action" is meant to be a generic term, and could, for example, refer to using a backup authentication code to confirm a password reset
automated-email-reset-pwd-two-factor =
    Om du inte vidtog den här åtgärden <a data-l10n-name="resetLink">återställ ditt lösenord</a> och <a data-l10n-name="twoFactorSettingsLink">återställ tvåstegsautentiseringen</a> direkt.
    För mer information besök <a data-l10n-name="supportLink">{ -brand-mozilla } Support</a>.
# Followed by link to https://accounts.firefox.com/reset_password
automated-email-reset-pwd-plaintext-v3 = Om du inte vidtog den här åtgärden, återställ ditt lösenord direkt på:
# Followed by link to https://accounts.firefox.com/settings#two-step-authentication
automated-email-reset-two-factor-plaintext = Återställ också tvåstegsautentisering på:
brand-banner-message = Visste du att vi ändrade vårt namn från { -product-firefox-accounts } till { -product-mozilla-accounts }? <a data-l10n-name="learnMore">Läs mer</a>
cancellationSurvey = Hjälp oss att förbättra våra tjänster genom att svara på denna <a data-l10n-name="cancellationSurveyUrl">korta undersökning</a>.
# After the colon, there's a link to https://survey.alchemer.com/s3/6534408/Privacy-Security-Product-Cancellation-of-Service-Q4-21
cancellationSurvey-plaintext = Hjälp oss att förbättra våra tjänster genom att ta göra en kort undersökning:
change-password-plaintext = Om du misstänker att någon försöker få åtkomst till ditt konto, ändra ditt lösenord.
manage-account = Hantera konto
manage-account-plaintext = { manage-account }:
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
# Variables:
#  $supportUrl (String) - Link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
support-message-3 = För mer information besök <a data-l10n-name="supportLink">{ -brand-mozilla } Support</a>.
# Variables:
#  $supportUrl (String) - Link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
support-message-plaintext = För mer information besök { -brand-mozilla } Support: { $supportUrl }.
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
location-all = { $city }, { $stateCode }, { $country } (uppskattad)
# Variables:
#  $city (String) - User's city
#  $country (String) - User's country
location-city-country = { $city }, { $country } (uppskattad)
# Variables:
#  $stateCode (String) - User's state
#  $country (String) - User's country
location-state-country = { $stateCode }, { $country } (uppskattad)
# Variables:
#  $country (stateCode) - User's country
location-country = { $country } (uppskattad)
view-invoice-link-action = Visa faktura
# Variables:
#  $invoiceLink (String) - The link to the invoice
# After the colon, there's a link to https://pay.stripe.com/
view-invoice-plaintext = Visa faktura: { $invoiceLink }
cadReminderFirst-subject-1 = Påminnelse! Låt oss synkronisera { -brand-firefox }
cadReminderFirst-action = Synkronisera en annan enhet
cadReminderFirst-action-plaintext = { cadReminderFirst-action }:
# In the title of the email, "It takes two to sync", "two" refers to syncing two devices
cadReminderFirst-title-1 = Det krävs två för att synkronisera
cadReminderFirst-description-v2 = Ta med dina flikar mellan alla dina enheter. Få dina bokmärken, lösenord och annan data överallt där du använder { -brand-firefox }.
cadReminderSecond-subject-2 = Missa inte! Låt oss avsluta din synkroniseringskonfiguration
cadReminderSecond-action = Synkronisera en annan enhet
cadReminderSecond-title-2 = Glöm inte att synkronisera!
cadReminderSecond-description-sync = Synkronisera dina bokmärken, lösenord, öppna flikar och mer — överallt där du använder { -brand-firefox }.
cadReminderSecond-description-plus = Dessutom är din data alltid krypterad. Endast du och enheter du godkänner kan se det.
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
inactiveAccountFinalWarning-subject = Sista chansen att behålla ditt { -product-mozilla-account }
inactiveAccountFinalWarning-title = Ditt { -brand-mozilla }-konto och data kommer att raderas
inactiveAccountFinalWarning-preview = Logga in för att behålla ditt konto
inactiveAccountFinalWarning-account-description = Ditt { -product-mozilla-account } används för att få tillgång till gratis sekretess- och surfprodukter som { -brand-firefox } sync, { -product-mozilla-monitor }, { -product-firefox-relay } och { -product-mdn }.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
# This date will already be formatted with moment.js into Thursday, Jan 9, 2025 format
inactiveAccountFinalWarning-impact = Den <strong>{ $deletionDate }</strong> raderas ditt konto och dina personuppgifter permanent om du inte loggar in.
inactiveAccountFinalWarning-action = Logga in för att behålla ditt konto
# followed by link to sign in
inactiveAccountFinalWarning-action-plaintext = Logga in för att behålla ditt konto:
inactiveAccountFirstWarning-subject = Förlora inte ditt konto
inactiveAccountFirstWarning-title = Vill du behålla ditt { -brand-mozilla }-konto och din data?
inactiveAccountFirstWarning-account-description-v2 = Ditt { -product-mozilla-account } används för att få tillgång till gratis sekretess- och surfprodukter som { -brand-firefox } sync, { -product-mozilla-monitor }, { -product-firefox-relay } och { -product-mdn }.
inactiveAccountFirstWarning-inactive-status = Vi har märkt att du inte har loggat in på 2 år.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
# This date will already be formatted with moment.js into Thursday, Jan 9, 2025 format
inactiveAccountFirstWarning-impact = Ditt konto och dina personuppgifter kommer att raderas permanent den <strong>{ $deletionDate }</strong> eftersom du inte har varit aktiv.
inactiveAccountFirstWarning-action = Logga in för att behålla ditt konto
inactiveAccountFirstWarning-preview = Logga in för att behålla ditt konto
# followed by link to sign in
inactiveAccountFirstWarning-action-plaintext = Logga in för att behålla ditt konto:
inactiveAccountSecondWarning-subject = Åtgärd krävs: Kontot raderas inom 7 dagar
inactiveAccountSecondWarning-title = Ditt { -brand-mozilla }-konto och data kommer att raderas inom 7 dagar
inactiveAccountSecondWarning-account-description-v2 = Ditt { -product-mozilla-account } används för att få tillgång till gratis sekretess- och surfprodukter som { -brand-firefox } sync, { -product-mozilla-monitor }, { -product-firefox-relay } och { -product-mdn }.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
inactiveAccountSecondWarning-impact = Ditt konto och dina personuppgifter kommer att raderas permanent den <strong>{ $deletionDate }</strong> eftersom du inte har varit aktiv.
inactiveAccountSecondWarning-action = Logga in för att behålla ditt konto
inactiveAccountSecondWarning-preview = Logga in för att behålla ditt konto
# followed by link to sign in
inactiveAccountSecondWarning-action-plaintext = Logga in för att behålla ditt konto:
# The user has a low number of valid recovery codes remaining for use
codes-reminder-title-zero = Du har slut på reservautentiseringskoder!
codes-reminder-title-one = Du är på din sista reservautentiseringskod
codes-reminder-title-two = Dags att skapa fler reservautentiseringskoder
codes-reminder-description-part-one = Reservautentiseringskoder hjälper dig att återställa din information när du glömmer ditt lösenord.
codes-reminder-description-part-two = Skapa nya koder nu så att du inte förlorar din data senare.
codes-reminder-description-two-left = Du har endast två koder kvar.
codes-reminder-description-create-codes = Skapa nya reservautentiseringskoder för att hjälpa dig komma tillbaka till ditt konto om du är utelåst.
lowRecoveryCodes-action-2 = Skapa koder
codes-create-plaintext = { lowRecoveryCodes-action-2 }:
lowRecoveryCodes-subject-2 =
    { $numberRemaining ->
        [0] Inga reservautentiseringskoder kvar
        [one] Endast 1 reservautentiseringskod kvar
       *[other] Endast { $numberRemaining } reservautentiseringskoder kvar!
    }
# Variables:
# $clientName (String) - A client the user hasn't signed into before (e.g. Firefox, Sync)
newDeviceLogin-subject = Ny inloggning till { $clientName }
newDeviceLogin-subjectForMozillaAccount = Ny inloggning på ditt { -product-mozilla-account }
newDeviceLogin-title-3 = Ditt { -product-mozilla-account } användes för att logga in
# The "Not you?" question is asking whether the recipient of the email is the
# person who performed the action that triggered the email.
newDeviceLogin-change-password = Inte du? <a data-l10n-name="passwordChangeLink">Ändra ditt lösenord</a>.
# The "Not you?" question is asking whether the recipient of the email is the
# person who performed the action that triggered the email.
newDeviceLogin-change-password-plain = Inte du? Ändra ditt lösenord:
newDeviceLogin-action = Hantera konto
passwordChanged-subject = Lösenord uppdaterat
passwordChanged-title = Lösenord har ändrats
passwordChanged-description-2 = Ditt lösenord för { -product-mozilla-account } har ändrats från följande enhet:
passwordChangeRequired-subject = Misstänkt aktivitet upptäckt
passwordChangeRequired-preview = Ändra ditt lösenord omedelbart
passwordChangeRequired-title-2 = Återställ lösenordet
passwordChangeRequired-suspicious-activity-3 = Vi låste ditt konto för att skydda det från misstänkt aktivitet. Du har loggats ut från alla dina enheter och all synkroniserad data har raderats som en försiktighetsåtgärd.
passwordChangeRequired-sign-in-3 = För att logga in på ditt konto behöver du bara återställa ditt lösenord.
passwordChangeRequired-different-password-2 = <b>Viktigt:</b> Välj ett starkt lösenord som skiljer sig från ett du har använt tidigare.
passwordChangeRequired-different-password-plaintext-2 = Viktigt: Välj ett starkt lösenord som skiljer sig från ett du har använt tidigare.
passwordChangeRequired-action = Återställ lösenord
passwordChangeRequired-action-plaintext = { passwordChangeRequired-action }:
# Variables:
#  $code (String) - The confirmation code for sign-in
password-forgot-otp-subject-2 = Använd { $code } för att ändra ditt lösenord
password-forgot-otp-preview = Denna kod upphör efter 10 minuter
password-forgot-otp-title = Glömt ditt lösenord?
password-forgot-otp-request = Vi fick en begäran om lösenordsändring på ditt { -product-mozilla-account } från:
password-forgot-otp-code-2 = Om det var du, här är din bekräftelsekod för att fortsätta:
password-forgot-otp-expiry-notice = Denna kod upphör efter 10 minuter.
passwordReset-subject-2 = Ditt lösenord har återställts
passwordReset-title-2 = Ditt lösenord har återställts
# This sentence is followed by information about the device and time of the password reset
passwordReset-description-2 = Du återställde ditt lösenord för { -product-mozilla-account } på:
passwordResetAccountRecovery-subject-2 = Ditt lösenord har återställts
passwordResetAccountRecovery-title-3 = Ditt lösenord har återställts
# Followed by details on the device, location, and date/time of the password reset.
passwordResetAccountRecovery-description-3 = Du använde din kontoåterställningsnyckel för att återställa ditt lösenord för { -product-mozilla-account } på:
passwordResetAccountRecovery-information = Vi loggade ut dig från alla dina synkroniserade enheter. Vi skapade en ny kontoåterställningsnyckel för att ersätta den du använde. Du kan ändra det i dina kontoinställningar.
# After the colon there is a link to account settings
passwordResetAccountRecovery-information-txt = Vi loggade ut dig från alla dina synkroniserade enheter. Vi skapade en ny kontoåterställningsnyckel för att ersätta den du använde. Du kan ändra det i dina kontoinställningar:
passwordResetAccountRecovery-action-4 = Hantera konto
passwordResetRecoveryPhone-subject = Återställningstelefon använd
passwordResetRecoveryPhone-preview = Kontrollera att det var du
passwordResetRecoveryPhone-title = Ditt återställningstelefon användes för att bekräfta en lösenordsåterställning
passwordResetRecoveryPhone-device = Återställningstelefon används från:
passwordResetRecoveryPhone-action = Hantera konto
passwordResetWithRecoveryKeyPrompt-subject = Ditt lösenord har återställts
passwordResetWithRecoveryKeyPrompt-title = Ditt lösenord har återställts
# Details of the device and date/time where the password was reset
passwordResetWithRecoveryKeyPrompt-description = Du återställde ditt lösenord för { -product-mozilla-account } på:
# Text for button action to create a new account recovery key
passwordResetWithRecoveryKeyPrompt-action = Skapa kontoåterställningsnyckel
# colon is followed by a link to create an account recovery key from the account settings page
passwordResetWithRecoveryKeyPrompt-action-txt = Skapa kontoåterställningsnyckel:
passwordResetWithRecoveryKeyPrompt-cta-description = Du måste logga in igen på alla dina synkroniserade enheter. Håll din data säker nästa gång med en kontoåterställningsnyckel. Detta gör att du kan återställa din data om du glömmer ditt lösenord.
postAddAccountRecovery-subject-3 = Ny nyckel för kontoåterställning skapad
postAddAccountRecovery-title2 = Du skapade en ny kontoåterställningsnyckel
# Key here refers to account recovery key
postAddAccountRecovery-body-part1 = Spara den här nyckeln på ett säkert ställe — du behöver den för att återställa dina krypterade webbläsardata om du glömmer ditt lösenord.
# Key here refers to account recovery key
postAddAccountRecovery-body-part2 = Denna nyckel kan endast användas en gång. När du har använt den skapar vi automatiskt en ny åt dig. Eller så kan du skapa en ny när som helst från dina kontoinställningar.
postAddAccountRecovery-action = Hantera konto
postAddLinkedAccount-subject-2 = Nytt konto länkat till ditt { -product-mozilla-account }
#  Variables:
#  $providerName (String) - The name of the provider, e.g. Apple, Google
postAddLinkedAccount-title-2 = Ditt { $providerName }-konto har länkats till ditt { -product-mozilla-account }
postAddLinkedAccount-action = Hantera konto
postAddRecoveryPhone-subject = Återställningstelefon tillagd
postAddRecoveryPhone-preview = Kontot skyddas av tvåstegsautentisering
postAddRecoveryPhone-title-v2 = Du har lagt till ett återställningstelefonnummer
# Variables:
#  $maskedLastFourPhoneNumber (String) - A bullet point mask with the last four digits of the user's phone number, e.g. ••••••1234
postAddRecoveryPhone-description-v2 = Du har lagt till { $maskedLastFourPhoneNumber } som ditt återställningstelefonnummer
# Links out to a support article about two factor authentication
postAddRecoveryPhone-how-protect = Hur detta skyddar ditt konto
postAddRecoveryPhone-how-protect-plaintext = Hur detta skyddar ditt konto:
postAddRecoveryPhone-enabled-device = Du aktiverade det från:
postAddRecoveryPhone-action = Hantera konto
postAddTwoStepAuthentication-preview = Ditt konto är skyddat
postAddTwoStepAuthentication-subject-v3 = Tvåstegsautentisering är på
postAddTwoStepAuthentication-title-2 = Du har aktiverat tvåstegsautentisering
# After the colon, there is a description of the device that the user used to enable two-step authentication
postAddTwoStepAuthentication-from-device-v2 = Du begärde detta från:
postAddTwoStepAuthentication-action = Hantera konto
postAddTwoStepAuthentication-code-required-v4 = Säkerhetskoder från din autentiseringsapp krävs nu varje gång du loggar in.
postAddTwoStepAuthentication-recovery-method-codes = Du har också lagt till reservautentiseringskoder som din återställningsmetod.
# Variables:
#  $maskedPhoneNumber (String) - A bullet point mask with the last four digits of the user's phone number, e.g. ••••••1234
postAddTwoStepAuthentication-recovery-method-phone = Du har också lagt till { $maskedPhoneNumber } som ditt återställningstelefonnummer.
postAddTwoStepAuthentication-how-protects-link = Hur skyddar detta ditt konto
postAddTwoStepAuthentication-how-protects-plaintext = Hur skyddar detta ditt konto:
postAddTwoStepAuthentication-device-sign-out-message = För att skydda alla dina anslutna enheter bör du logga ut överallt där du använder det här kontot och sedan logga in igen med tvåstegsautentisering.
postChangeAccountRecovery-subject = Nyckeln för kontoåterställning har ändrats
postChangeAccountRecovery-title = Du har ändrat din kontoåterställningsnyckel
postChangeAccountRecovery-body-part1 = Du har nu en ny kontoåterställningsnyckel. Din tidigare nyckel raderades.
postChangeAccountRecovery-body-part2 = Spara den här nya nyckeln på ett säkert ställe — du behöver den för att återställa dina krypterade webbläsardata om du glömmer ditt lösenord.
postChangeAccountRecovery-action = Hantera konto
postChangePrimary-subject = Primär e-post uppdaterad
postChangePrimary-title = Ny primär e-post
# Variables:
#  $email (String) - A user's email address
postChangePrimary-description-2 = Du har ändrat din primära e-postadress till { $email }. Den här adressen är nu ditt användarnamn för att logga in på ditt { -product-mozilla-account }, samt för att ta emot säkerhetsmeddelanden och inloggningsbekräftelser.
postChangePrimary-action = Hantera konto
postChangeRecoveryPhone-subject = Återställningstelefon uppdaterad
postChangeRecoveryPhone-preview = Kontot skyddas av tvåstegsautentisering
postChangeRecoveryPhone-title = Du har bytt återställningstelefon
postChangeRecoveryPhone-description = Du har nu en ny återställningstelefon. Ditt tidigare telefonnummer raderades.
postChangeRecoveryPhone-requested-device = Du har begärt det från:
postChangeTwoStepAuthentication-preview = Ditt konto är skyddat
postChangeTwoStepAuthentication-subject = Tvåstegsautentisering uppdaterad
postChangeTwoStepAuthentication-title = Tvåstegsautentisering har uppdaterats
postChangeTwoStepAuthentication-use-new-account = Du måste nu använda den nya posten { -product-mozilla-account } i din autentiseringsapp. Den äldre kommer inte längre att fungera och du kan ta bort den.
# After the colon, there is a description of the device that the user used to enable two-step authentication
postChangeTwoStepAuthentication-from-device = Du begärde detta från:
postChangeTwoStepAuthentication-action = Hantera konto
postChangeTwoStepAuthentication-how-protects-link = Hur detta skyddar ditt konto
postChangeTwoStepAuthentication-how-protects-plaintext = Hur detta skyddar ditt konto:
postChangeTwoStepAuthentication-device-sign-out-message = För att skydda alla dina anslutna enheter bör du logga ut överallt där du använder det här kontot och sedan logga in igen med din nya tvåstegsautentisering.
postConsumeRecoveryCode-title-3 = Din reservautentiseringskod användes för att bekräfta en lösenordsåterställning
# After the colon, there is description of the device that the backup authentication code was used on
# E.g., Firefox Nightly on Mac OSX, Thursday Sept 2, 2024
postConsumeRecoveryCode-description-3 = Kod som används från:
postConsumeRecoveryCode-action = Hantera konto
postConsumeRecoveryCode-subject-v3 = Reservautentiseringskod använd
postConsumeRecoveryCode-preview = Kontrollera att det var du
postNewRecoveryCodes-subject-2 = Nya reservautentiseringskoder har skapats
postNewRecoveryCodes-title-2 = Du skapade nya reservautentiseringskoder
# After the colon, there is information about the device that the authentication codes were created on
postNewRecoveryCodes-description-2 = De skapades på:
postNewRecoveryCodes-action = Hantera konto
postRemoveAccountRecovery-subject-2 = Nyckel för kontoåterställning har tagits bort
postRemoveAccountRecovery-title-3 = Du raderade din kontoåterställningsnyckel
postRemoveAccountRecovery-body-part1 = Din kontoåterställningsnyckel krävs för att återställa dina krypterade webbläsardata om du glömmer ditt lösenord.
postRemoveAccountRecovery-body-part2 = Om du inte redan har gjort det, skapa en ny kontoåterställningsnyckel i dina kontoinställningar för att förhindra att du förlorar dina sparade lösenord, bokmärken, webbhistorik och mer.
postRemoveAccountRecovery-action = Hantera konto
postRemoveRecoveryPhone-subject = Återställningstelefon borttagen
postRemoveRecoveryPhone-preview = Kontot skyddas av tvåstegsautentisering
postRemoveRecoveryPhone-title = Återställningstelefon borttagen
postRemoveRecoveryPhone-description-v2 = Din återställningstelefon har tagits bort från dina inställningar för tvåstegsautentisering.
postRemoveRecoveryPhone-description-extra = Du kan fortfarande använda dina reservautentiseringskoder för att logga in om du inte kan använda din autentiseringsapp.
postRemoveRecoveryPhone-requested-device = Du har begärt det från:
postRemoveSecondary-subject = Sekundär e-postadress borttagen
postRemoveSecondary-title = Sekundär e-postadress borttagen
# Variables:
#  $secondaryEmail (String) - A user's email address
postRemoveSecondary-description-2 = Du har tagit bort { $secondaryEmail } som en sekundär e-post från ditt { -product-mozilla-account }. Säkerhetsmeddelanden och inloggningsbekräftelser kommer inte längre att levereras till den här adressen.
postRemoveSecondary-action = Hantera konto
postRemoveTwoStepAuthentication-subject-line-2 = Tvåstegsautentisering avstängd
postRemoveTwoStepAuthentication-title-2 = Du stängde av tvåstegsautentisering
# After the colon is a description of the device the user used to disable two-step authentication
postRemoveTwoStepAuthentication-from-device = Du inaktiverade det från:
postRemoveTwoStepAuthentication-action = Hantera konto
postRemoveTwoStepAuthentication-not-required-2 = Du behöver inte längre säkerhetskoder från din autentiseringsapp när du loggar in.
postSigninRecoveryCode-subject = Reservautentiseringskod används för att logga in
postSigninRecoveryCode-preview = Bekräfta kontoaktivitet
postSigninRecoveryCode-title = Din reservautentiseringskod användes för att logga in
postSigninRecoveryCode-description = Om du inte gjorde det här bör du ändra ditt lösenord omedelbart för att skydda ditt konto.
postSigninRecoveryCode-device = Du loggade in från:
postSigninRecoveryCode-action = Hantera konto
postSigninRecoveryPhone-subject = Återställningstelefon som användes för att logga in
postSigninRecoveryPhone-preview = Bekräfta kontoaktivitet
postSigninRecoveryPhone-title = Ditt återställningstelefon användes för att logga in
postSigninRecoveryPhone-description = Om du inte gjorde det här bör du ändra ditt lösenord omedelbart för att skydda ditt konto.
postSigninRecoveryPhone-device = Du loggade in från:
postSigninRecoveryPhone-action = Hantera konto
postVerify-sub-title-3 = Vi är glada att se dig!
postVerify-title-2 = Vill du se samma flik på två enheter?
postVerify-description-2 = Det är lätt! Installera bara { -brand-firefox } på en annan enhet och logga in för att synkronisera. Det är som magi!
postVerify-sub-description = (Psst… Det betyder också att du kan få dina bokmärken, lösenord och annan { -brand-firefox }-data överallt där du är inloggad.)
postVerify-subject-4 = Välkommen till { -brand-mozilla }!
postVerify-setup-2 = Anslut en annan enhet:
postVerify-action-2 = Anslut en annan enhet
postVerifySecondary-subject = Sekundär e-post tillagd
postVerifySecondary-title = Sekundär e-post tillagd
# Variables:
#  $secondaryEmail (String) - A user's secondary email address
postVerifySecondary-content-3 = Du har framgångsrikt bekräftat { $secondaryEmail } som en sekundär e-post för ditt { -product-mozilla-account }. Säkerhetsmeddelanden och inloggningsbekräftelser kommer nu att levereras till båda e-postadresserna.
postVerifySecondary-action = Hantera konto
recovery-subject = Återställ lösenordet
recovery-title-2 = Glömt ditt lösenord?
# Information on the device, location, and date and time of the request that triggered the email follows.
recovery-request-origin-2 = Vi fick en begäran om lösenordsändring på ditt { -product-mozilla-account } från:
recovery-new-password-button = Skapa ett nytt lösenord genom att klicka på knappen nedan. Den här länken upphör att gälla inom den närmaste timmen.
recovery-copy-paste = Skapa ett nytt lösenord genom att kopiera och klistra in webbadressen nedan i din webbläsare. Den här länken upphör att gälla inom den närmaste timmen.
recovery-action = Skapa nytt lösenord
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountDeletion-subject = Din prenumeration på { $productName } har avslutats
subscriptionAccountDeletion-title = Ledsen att se dig sluta
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $invoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
subscriptionAccountDeletion-content-cancelled-2 = Du raderade nyligen ditt { -product-mozilla-account }. Som ett resultat av detta har vi avslutat din prenumeration på { $productName }. Din sista betalning på { $invoiceTotal } betalades den { $invoiceDateOnly }.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountFinishSetup-subject = Välkommen till { $productName }: Ange ditt lösenord.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountFinishSetup-title = Välkommen till { $productName }
subscriptionAccountFinishSetup-content-processing = Din betalning behandlas och kan ta upp till fyra arbetsdagar att slutföra. Ditt abonnemang förnyas automatiskt varje faktureringsperiod om du inte väljer att avbryta.
subscriptionAccountFinishSetup-content-create-3 = Därefter skapar du ett { -product-mozilla-account } lösenord för att börja använda din nya prenumeration.
subscriptionAccountFinishSetup-action-2 = Kom igång
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
#   $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#   $planIntervalCount (String) - The interval count of subscription plan, e.g. 2
#   $planInterval (String) - The interval of time of the subscription plan, e.g. week
#   $reminderLength (String) - The number of days until the current subscription is set to automatically renew, e.g. 14
subscriptionRenewalReminder-content-current = Din nuvarande prenumeration är inställd på att förnyas automatiskt om { $reminderLength } dagar. Vid den tidpunkten kommer { -brand-mozilla } att förnya din prenumeration på { $planIntervalCount } { $planInterval } och en avgift på { $invoiceTotal } kommer att debiteras på betalningsmetoden på ditt konto.
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
subscriptionsPaymentExpired-subject-2 = Betalningsmetoden för dina prenumerationer har upphört eller upphör att gälla snart
subscriptionsPaymentExpired-title-2 = Din betalningsmetod har upphört eller håller på att upphöra
subscriptionsPaymentExpired-content-2 = Den betalningsmetod du använder för att betala för följande prenumerationer har upphört eller håller på att upphöra.
subscriptionsPaymentProviderCancelled-subject = Uppdatering av betalningsinformation krävs för prenumerationer på { -brand-mozilla }
subscriptionsPaymentProviderCancelled-title = Tyvärr har vi problem med din betalning
subscriptionsPaymentProviderCancelled-content-detected = Vi har upptäckt ett problem med din betalningsmetod för följande prenumerationer.
subscriptionsPaymentProviderCancelled-content-payment-1 = Det kan vara så att din betalningsmetod har upphört att gälla eller att din nuvarande betalningsmetod är inaktuell.
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
# Variables:
#  $unblockCode (String) - The authorization code for sign-in
unblockCode-subject-2 = Använd { $unblockCode } för att logga in
unblockCode-preview = Denna kod upphör efter en timme
unblockCode-title = Är det du som loggar in?
unblockCode-prompt = Om ja, här behörighetskoden som du behöver:
# Variables:
#  $unblockCode (String) - An alphanumeric code
unblockCode-prompt-plaintext = Om ja, här är auktoriseringskoden du behöver: { $unblockCode }
unblockCode-report = Om nej, hjälp oss att avvärja inkräktare och <a data-l10n-name="reportSignInLink">rapportera det till oss</a>.
unblockCode-report-plaintext = Om nej, hjälp oss att avvärja inkräktare och rapportera detta till oss.
verificationReminderFinal-subject = Sista påminnelse om att bekräfta ditt konto
verificationReminderFinal-description-2 = För ett par veckor sedan skapade du ett { -product-mozilla-account }, men bekräftade det aldrig. För din säkerhet tar vi bort kontot om det inte verifieras inom de närmaste 24 timmarna.
confirm-account = Bekräfta konto
confirm-account-plaintext = { confirm-account }:
verificationReminderFirst-subject-2 = Kom ihåg att bekräfta ditt konto
verificationReminderFirst-title-3 = Välkommen till { -brand-mozilla }!
verificationReminderFirst-description-3 = För några dagar sedan skapade du ett { -product-mozilla-account }, men bekräftade det aldrig. Bekräfta ditt konto inom de närmaste 15 dagarna, annars kommer det att raderas automatiskt.
verificationReminderFirst-sub-description-3 = Missa inte webbläsaren som sätter dig och din integritet främst.
confirm-email-2 = Bekräfta konto
confirm-email-plaintext-2 = { confirm-email-2 }:
verificationReminderFirst-action-2 = Bekräfta konto
verificationReminderSecond-subject-2 = Kom ihåg att bekräfta ditt konto
verificationReminderSecond-title-3 = Missa inte { -brand-mozilla }!
verificationReminderSecond-description-4 = För några dagar sedan skapade du ett { -product-mozilla-account }, men bekräftade det aldrig. Bekräfta ditt konto inom de närmaste 10 dagarna, annars kommer det att raderas automatiskt.
verificationReminderSecond-second-description-3 = Ditt { -product-mozilla-account } låter dig synkronisera din { -brand-firefox }-upplevelse mellan enheter och låser upp åtkomst till mer integritetsskyddande produkter från { -brand-mozilla }.
verificationReminderSecond-sub-description-2 = Bli en del av vårt uppdrag att förvandla internet till en plats som är öppen för alla.
verificationReminderSecond-action-2 = Bekräfta konto
verify-title-3 = Öppna internet med { -brand-mozilla }
verify-description-2 = Bekräfta ditt konto och få ut det mesta av { -brand-mozilla } överallt där du loggar in, med början med:
verify-subject = Slutför skapande av ditt konto
verify-action-2 = Bekräfta konto
# Variables:
# $code (String) - The verification code
verifyAccountChange-subject = Använd { $code } för att ändra ditt konto
# Variables:
# $expirationTime (Number) - Represents the expiration time in minutes
verifyAccountChange-preview =
    { $expirationTime ->
        [one] Den här koden upphör om { $expirationTime } minut.
       *[other] Den här koden upphör om { $expirationTime } minuter.
    }
verifyAccountChange-title = Ändrar du din kontoinformation?
# After the colon is a description of the device used to sign in to the service
verifyAccountChange-safe = Hjälp oss att hålla ditt konto säkert genom att godkänna den här ändringen på:
verifyAccountChange-prompt = Om ja, här är din auktoriseringskod:
# Variables:
# $expirationTime (Number) - Represents the expiration time in minutes
verifyAccountChange-expiry-notice =
    { $expirationTime ->
        [one] Den upphör om { $expirationTime } minut.
       *[other] Den upphör om { $expirationTime } minuter.
    }
# Variables:
#  $clientName (String) - A client the user hasn't signed into before (e.g. Firefox, Sync)
verifyLogin-title-2 = Loggade du in på { $clientName }?
verifyLogin-description-2 = Hjälp oss att hålla ditt konto säkert genom att bekräfta att du har loggat in på:
verifyLogin-subject-2 = Bekräfta inloggning
verifyLogin-action = Bekräfta inloggning
# Variables:
#  $code (String) - The confirmation code for sign-in
verifyLoginCode-subject-line-3 = Använd { $code } för att logga in
verifyLoginCode-preview = Denna kod upphör efter 5 minuter.
# Variables:
#  $serviceName (String) - A service the user hasn't signed into before (e.g. Firefox)
verifyLoginCode-title-2 = Loggade du in på { $serviceName }
# After the colon is a description of the device used to sign in to the service
verifyLoginCode-safe = Hjälp oss att hålla ditt konto säkert genom att godkänna din inloggning på:
verifyLoginCode-prompt-3 = Om ja, här är din auktoriseringskod:
verifyLoginCode-expiry-notice = Den upphör om 5 minuter.
verifyPrimary-title-2 = Bekräfta primär e-postadress
verifyPrimary-description = En begäran om att göra en kontoändring har gjorts från följande enhet:
verifyPrimary-subject = Bekräfta primär e-postadress
verifyPrimary-action-2 = Bekräfta e-postadress
verifyPrimary-action-plaintext-2 = { verifyPrimary-action-2 }:
verifyPrimary-post-verify-2 = När du har bekräftat kommer kontoändringar som att lägga till en sekundär e-post att bli möjliga från den här enheten.
# Variables:
#  $code (String) - The confirmation code for secondary email
verifySecondaryCode-subject-2 = Använd { $code } för att bekräfta din sekundära e-postadress
verifySecondaryCode-preview = Denna kod upphör efter 5 minuter.
verifySecondaryCode-title-2 = Bekräfta sekundär e-postadress
verifySecondaryCode-action-2 = Bekräfta e-postadress
# Variables:
#  $email (string) A user's unverified secondary email address
verifySecondaryCode-explainer-2 = En begäran om att använda { $email } som en sekundär e-postadress har gjorts från följande { -product-mozilla-account }:
verifySecondaryCode-prompt-2 = Använd denna bekräftelsekod:
verifySecondaryCode-expiry-notice-2 = Den upphör efter 5 minuter. När adressen har bekräftats kommer den att börja ta emot säkerhetsmeddelanden och bekräftelser.
# Variables:
#  $code (String) - comfirmation code for the account
verifyShortCode-subject-4 = Använd { $code } för att bekräfta ditt konto
verifyShortCode-preview-2 = Denna kod upphör efter 5 minuter
verifyShortCode-title-3 = Öppna internet med { -brand-mozilla }
# Information on the browser and device triggering this confirmation email follows below this string.
verifyShortCode-title-subtext-2 = Bekräfta ditt konto och få ut det mesta av { -brand-mozilla } överallt där du loggar in, med början med:
verifyShortCode-prompt-3 = Använd denna bekräftelsekod:
verifyShortCode-expiry-notice = Den upphör om 5 minuter.
