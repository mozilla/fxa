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

## Email content
## Emails do not contain buttons, only links. Emails have a rich HTML version and a plaintext
## version. The strings are usually identical but sometimes they differ slightly.

fxa-header-mozilla-logo = <img data-l10n-name="mozilla-logo" alt="{ -brand-mozilla }-logo">
fxa-header-sync-devices-image = <img data-l10n-name="sync-devices-image" alt="Synkroniser einingar">3
body-devices-image = <img data-l10n-name="devices-image" alt="Einingar">
fxa-privacy-url = { -brand-mozilla } personvernpraksis
moz-accounts-privacy-url-2 = { -product-mozilla-accounts(capitalization: "uppercase") } personvernfråsegn
moz-accounts-terms-url = Tenestevilkår for { -product-mozilla-accounts(capitalization: "uppercase") }
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
account-deletion-info-block-communications = Dersom kontoen din vert sletta, vil du framleis få e-postar frå Mozilla Corporation og Mozilla Foundation, med mindre du <a data-l10n-name="unsubscribeLink">ber om å avslutte abonnementet</a>.
account-deletion-info-block-support = Dersom du har spørsmål eller treng hjelp, kan du gjerne kontakte <a data-l10n-name="supportLink">støtteteamet</a> vårt.
account-deletion-info-block-communications-plaintext = Dersom kontoen din vert sletta, vil du framleis få e-postar frå Mozilla Corporation og Mozilla Foundation, med mindre du ber om å avslutte abonnementet:
account-deletion-info-block-support-plaintext = Om du har spørsmål, eller treng hjelp, er det berre å kontakte brukarstøtteteamet vårt:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
body-android-badge = <img data-l10n-name="google-play-badge" alt="Last ned { $productName } i { -google-play }">
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
body-ios-badge = <img data-l10n-name="apple-app-badge" alt="Last ned { $productName }  i { -app-store }">
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-desktop-device-2 = Installer { $productName } på <a data-l10n-name="anotherDeviceLink">ei anna datamaskin</a>.
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-device-2 = Installer { $productName } på <a data-l10n-name="anotherDeviceLink">ei anna eining</a>.
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
android-download-plaintext = Last ned { $productName } frå Google Play:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
ios-download-plaintext = Last ned { $productName } frå App Store:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-device-plaintext = Installer { $productName } på ei anna eining:
automated-email-change-2 = Om du ikkje gjorde denne handlinga, <a data-l10n-name="passwordChangeLink">endre passordet ditt</a> med ein gong.
automated-email-support = Gå til <a data-l10n-name="supportLink">{ -brand-mozilla } brukarstøtte</a> for meir informasjon.
# After the colon, there's a link to https://accounts.firefox.com/settings/change_password
automated-email-change-plaintext-2 = Om du ikkje gjorde denne handlinga, endre passordet ditt med ein gong:
#  After the colon, there's a link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
automated-email-support-plaintext = Gå til { -brand-mozilla } brukarstøtte for meir informasjon:
automated-email-inactive-account = Dette er ein automatisert e-post. Du får han fordi du har ein { -product-mozilla-account } og det har gått 2 år sidan sist pålogging.
# supportLink - https://support.mozilla.org/kb/im-having-problems-my-firefox-account
automated-email-no-action = { automated-email-no-action-plaintext } Gå til <a data-l10n-name="supportLink">{ -brand-mozilla } brukarstøtte</a> for meir informasjon.
automated-email-no-action-plaintext = Denne e-posten vart sendt automatisk. Om du fekk den ved ein feil, treng du ikkje gjere noko.
#  After the colon, there's a link to https://accounts.firefox.com/settings/change_password
automated-email-not-authorized-plaintext = Denne e-posten vart sendt automatisk; om du ikkje godkjende denne handlinga, må du endre passordet ditt:
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
# - $uaOS: the user agent's operating system (e.g, MacOS)
# - $uaOSVersion - the user agent's operating system version
automatedEmailRecoveryKey-origin-device-all = Denne førespurnaden kom frå { $uaBrowser } på { $uaOS } { $uaOSVersion }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
# - $uaOS: the user agent's operating system (e.g, MacOS)
automatedEmailRecoveryKey-origin-device-browser-os = Denne førespurnaden kom frå { $uaBrowser } på { $uaOS }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
automatedEmailRecoveryKey-origin-device-browser-only = Denne førespurnaden kom frå { $uaBrowser }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaOS: the user agent's operating system (e.g, MacOS)
# - $uaOSVersion - the user agent's operating system version
automatedEmailRecoveryKey-origin-device-OS-version-only = Denne førespurnaden kom frå { $uaOS } { $uaOSVersion }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaOS: the user agent's operating system (e.g, MacOS)
automatedEmailRecoveryKey-origin-device-OS-only = Denne førespurnaden kom frå { $uaOS }.
automatedEmailRecoveryKey-delete-key-change-pwd = Viss dette ikkje var deg, <a data-l10n-name="revokeAccountRecoveryLink">slett den nye nøkkelen</a> og <a data-l10n-name="passwordChangeLink">endre passordet ditt</a>.
automatedEmailRecoveryKey-change-pwd-only = Viss dette ikkje var deg, <a data-l10n-name="passwordChangeLink">endre passordet ditt</a>.
automatedEmailRecoveryKey-more-info = Gå til <a data-l10n-name="supportLink">{ -brand-mozilla } brukarstøtte</a> for meir informasjon.
# Colon is followed by user device info on a separate line (e.g., "Firefox Nightly on Mac OSX 10.11")
automatedEmailRecoveryKey-origin-plaintext = Denne førspurnaden kom frå:
# Colon is followed by a URL to the account recovery key section of account settings
automatedEmailRecoveryKey-notyou-delete-key-plaintext = Viss dette ikkje var deg, slett den nye nøkkelen:
# Colon is followed by a URL to the change password section of account settings
automatedEmailRecoveryKey-notyou-change-pwd-only-plaintext = Viss dette ikkje var deg, endre passordet ditt:
# This string is shown on its own line, after automatedEmailRecoveryKey-notyou-delete-key-plaintext and its URL
# Colon is followed by a URL to the change password section of account settings
automatedEmailRecoveryKey-notyou-change-pwd-plaintext = og endre passordet ditt:
# Colon is followed by a URL to Mozilla Support's "I'm having problems with my account" page
automatedEmailRecoveryKey-more-info-plaintext = Gå til { -brand-mozilla } brukarstøtte for meir informasjon:
automated-email-reset =
    Denne e-posten vart sendt automatisk; om du ikkje godkjende denne handlinga, <a data-l10n-name="resetLink">må du tilbakestille passordet ditt</a>.
    Gå til <a data-l10n-name="supportLink">{ -brand-mozilla } brukarstøtte</a> for meir informasjon.
# Variables:
#  $resetLink (String) - Link to https://accounts.firefox.com/reset_password
automated-email-reset-plaintext-v2 = Om du ikkje godkjende denne handlinga, må du stille tilbake passordet ditt no på { $resetLink }
# This message is used by multiple automated emails that notify users of security events on their account
# "this action" is meant to be a generic term, and could, for example, refer to using a backup authentication code to confirm a password reset
automated-email-reset-pwd-two-factor =
    Om du ikkje utførte dette, må du <a data-l10n-name="resetLink">tilbakestille passordet ditt</a> og <a data-l10n-name="twoFactorSettingsLink">tilbakestille tostegs-autentisering</a> med ein gong.
    
    For meir informasjon, besøk <a data-l10n-name="supportLink">{ -brand-mozilla } brukarstøtte</a>.
# Followed by link to https://accounts.firefox.com/reset_password
automated-email-reset-pwd-plaintext-v3 = Om du ikkje utførte dette, kan du tilbakestille passordet ditt med ein gong på:
# Followed by link to https://accounts.firefox.com/settings#two-step-authentication
automated-email-reset-two-factor-plaintext = Tilbakestill også tostegs-autentisering på:
brand-banner-message = Visste du at vi endra namnet vårt frå { -product-firefox-accounts } til { -product-mozilla-accounts }? <a data-l10n-name="learnMore">Les meir</a>
cancellationSurvey = Hjelp oss med å forbetre tenestene våre ved å vere med i denne <a data-l10n-name="cancellationSurveyUrl">korte undersøkinga</a>.
# After the colon, there's a link to https://survey.alchemer.com/s3/6534408/Privacy-Security-Product-Cancellation-of-Service-Q4-21
cancellationSurvey-plaintext = Hjelp oss med å forbetre tenestene våre ved å vere med i denne korte undersøkinga:
change-password-plaintext = Om du mistenkjer at nokon prøver å få tilgang til kontoen din, må du endre passordet ditt.
manage-account = Handsam kontoen
manage-account-plaintext = { manage-account }:
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
# Variables:
#  $supportUrl (String) - Link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
support-message-3 = Gå til <a data-l10n-name="supportLink">{ -brand-mozilla } brukarstøtte</a> for meir informasjon.
# Variables:
#  $supportUrl (String) - Link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
support-message-plaintext = For meir informasjon, gå til { -brand-mozilla } brukarstøtte: { $supportUrl }.
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
location-all = { $city }, { $stateCode }, { $country } (estimert)
# Variables:
#  $city (String) - User's city
#  $country (String) - User's country
location-city-country = { $city }, { $country } (estimert)
# Variables:
#  $stateCode (String) - User's state
#  $country (String) - User's country
location-state-country = { $stateCode }, { $country } (estimert)
# Variables:
#  $country (stateCode) - User's country
location-country = { $country } (estimert)
view-invoice-link-action = Vis faktura
# Variables:
#  $invoiceLink (String) - The link to the invoice
# After the colon, there's a link to https://pay.stripe.com/
view-invoice-plaintext = Sjå faktura: { $invoiceLink }
cadReminderFirst-subject-1 = Påminning! Byrje å synkronisere { -brand-firefox }
cadReminderFirst-action = Synkroniser ei anna eining
cadReminderFirst-action-plaintext = { cadReminderFirst-action }:
# In the title of the email, "It takes two to sync", "two" refers to syncing two devices
cadReminderFirst-title-1 = Det må to til for å synkronisere
cadReminderFirst-description-v2 = Sjå fanene dine på alle einingane dine. Få tilgang til bokmerka, passorda og andre data overalt der du brukar { -brand-firefox }.
cadReminderSecond-subject-2 = Ikkje gå glipp av det! La oss fullføre synkroniseringsoppsettet
cadReminderSecond-action = Synkroniser ei anna eining
cadReminderSecond-title-2 = Ikkje gløym å synkronisere!
cadReminderSecond-description-sync = Synkroniser bokmerka dine, passord, opene faner og meir — overalt der du brukar { -brand-firefox }.
cadReminderSecond-description-plus = I tillegg er dataa dine alltid krypterte. Berre du og eininga du godkjenner kan sjå dei.
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
inactiveAccountFinalWarning-subject = Siste sjansje til å behalde { -product-mozilla-account }en din
inactiveAccountFinalWarning-title = { -brand-mozilla }-kontoen din og data vil bli sletta
inactiveAccountFinalWarning-preview = Logg inn for å behalde kontoen din
inactiveAccountFinalWarning-account-description = { -product-mozilla-account }en din vert brukt til å få tilgang til gratis personvern- og surfeprodukt som { -brand-firefox } sync, { -product-mozilla-monitor }, { -product-firefox-relay } og { -product-mdn }.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
# This date will already be formatted with moment.js into Thursday, Jan 9, 2025 format
inactiveAccountFinalWarning-impact = På <strong>{ $deletionDate }</strong> vil kontoen din og dei personlege dataa dsine bli sletta permanent med mindre du loggar inn.
inactiveAccountFinalWarning-action = Logg inn for å behalde kontoen din
# followed by link to sign in
inactiveAccountFinalWarning-action-plaintext = Logg inn for å behalde kontoen din:
inactiveAccountFirstWarning-subject = Ikkje mist kontoen din
inactiveAccountFirstWarning-title = Vil du behalde { -brand-mozilla }-kontoen og dataa dine?
inactiveAccountFirstWarning-account-description-v2 = { -product-mozilla-account }en din vert brukt til å få tilgang til gratis personvern- og surfeprodukt som { -brand-firefox } sync, { -product-mozilla-monitor }, { -product-firefox-relay } og { -product-mdn }.
inactiveAccountFirstWarning-inactive-status = Vi la merke til at du ikkje har logga på på 2 år.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
# This date will already be formatted with moment.js into Thursday, Jan 9, 2025 format
inactiveAccountFirstWarning-impact = Kontoen din og dei personlege dataa dine blir permanent sletta <strong>{ $deletionDate }</strong> fordi du ikkje har vore aktiv.
inactiveAccountFirstWarning-action = Logg inn for å behalde kontoen din
inactiveAccountFirstWarning-preview = Logg inn for å behalde kontoen din
# followed by link to sign in
inactiveAccountFirstWarning-action-plaintext = Logg inn for å behalde kontoen din:
inactiveAccountSecondWarning-subject = Handling påkravd: Sletting av kontoen om 7 dagar
inactiveAccountSecondWarning-title = { -brand-mozilla }-kontoen din og data vil bli sletta om 7 dagar
inactiveAccountSecondWarning-account-description-v2 = { -product-mozilla-account }en din vert brukt til å få tilgang til gratis personvern- og surfeprodukt som { -brand-firefox } sync, { -product-mozilla-monitor }, { -product-firefox-relay } og { -product-mdn }.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
inactiveAccountSecondWarning-impact = Kontoen din og dei personlege dataa dine blir permanent sletta <strong>{ $deletionDate }</strong> fordi du ikkje har vore aktiv.
inactiveAccountSecondWarning-action = Logg inn for å behalde kontoen din
inactiveAccountSecondWarning-preview = Logg inn for å behalde kontoen din
# followed by link to sign in
inactiveAccountSecondWarning-action-plaintext = Logg inn for å behalde kontoen din:
# The user has a low number of valid recovery codes remaining for use
codes-reminder-title-zero = Du er tom for reserve-autentiseringskodar!
codes-reminder-title-one = Du har kun éin reserve-autentiseringskode att
codes-reminder-title-two = På tide å lage fleire reserve-autentiseringskodar
codes-reminder-description-part-one = Reserve-autentiseringskodar hjelper deg med å gjenopprette informasjonen din når du gløymer passordet ditt.
codes-reminder-description-part-two = Opprett nye kodar no, slik at du ikkje mistar dataa dine seinare.
codes-reminder-description-two-left = Du har berre to kodar att.
codes-reminder-description-create-codes = Opprett nye reserve-autentiseringskodar for å hjelpe deg med å få tilgang til kontoen din dersom du vert låst ute.
lowRecoveryCodes-action-2 = Lag kodar
codes-create-plaintext = { lowRecoveryCodes-action-2 }:
lowRecoveryCodes-subject-2 =
    { $numberRemaining ->
        [0] Ingen reserve-autentiseringskodar att
        [one] Berre 1 reserve-autentiseringskode att
       *[other] Berre { $numberRemaining } reserve-autentiseringskodar att!
    }
# Variables:
# $clientName (String) - A client the user hasn't signed into before (e.g. Firefox, Sync)
newDeviceLogin-subject = Ny inloggning på { $clientName }
newDeviceLogin-subjectForMozillaAccount = Ny innlogging på { -product-mozilla-account }-en din.
newDeviceLogin-title-3 = { -product-mozilla-account }en din vart brukt til å logge inn
# The "Not you?" question is asking whether the recipient of the email is the
# person who performed the action that triggered the email.
newDeviceLogin-change-password = Ikkje deg? <a data-l10n-name="passwordChangeLink">Endre passordet ditt</a>.
# The "Not you?" question is asking whether the recipient of the email is the
# person who performed the action that triggered the email.
newDeviceLogin-change-password-plain = Ikkje deg? Endre passordet ditt:
newDeviceLogin-action = Handsam kontoen
passwordChanged-subject = Passord oppdatert
passwordChanged-title = Passordet er endra
passwordChanged-description-2 = Passordet til { -product-mozilla-account }-en din vart endra frå følgjande eining:
passwordChangeRequired-subject = Mistenkt aktivitet oppdaga
passwordChangeRequired-preview = Endre passordet ditt med ein gong
passwordChangeRequired-title-2 = Tilbakestill passordet ditt
passwordChangeRequired-suspicious-activity-3 = Vi låste kontoen din for å verne han mot mistenkeleg aktivitet. Du er logga av alle einingane dine, og alle synkroniserte data er sletta som ein forholdsregel.
passwordChangeRequired-sign-in-3 = For å logge på kontoen din igjen, treng du berre å tilbakestille passordet ditt.
passwordChangeRequired-different-password-2 = <b>Viktig:</b> Vel eit sterkt passord som er ulikt frå eit du har brukt tidlegare.
passwordChangeRequired-different-password-plaintext-2 = Viktig: Vel eit sterkt passord som er ulikt frå eit du har brukt tidlegare.
passwordChangeRequired-action = Tilbakestill passordet
passwordChangeRequired-action-plaintext = { passwordChangeRequired-action }:
# Variables:
#  $code (String) - The confirmation code for sign-in
password-forgot-otp-subject-2 = Bruk { $code } for å endre passordet ditt
password-forgot-otp-preview = Denne koden går ut om 10 minutt
password-forgot-otp-title = Gløymt passordet ditt?
password-forgot-otp-request = Vi fekk ein førespurnad om passordendring på { -product-mozilla-account }en din frå:
password-forgot-otp-code-2 = Viss dette var deg, her er stadfestingskoden for å halde fram:
password-forgot-otp-expiry-notice = Denne koden går ut om 10 minutt.
passwordReset-subject-2 = Passordet ditt er tilbakestilt
passwordReset-title-2 = Passordet ditt er tilbakestilt
# This sentence is followed by information about the device and time of the password reset
passwordReset-description-2 = Du tilbakestiller passordet for { -product-mozilla-account } på:
passwordResetAccountRecovery-subject-2 = Passordet ditt er tilbakestilt
passwordResetAccountRecovery-title-3 = Passordet ditt er tilbakestilt
# Followed by details on the device, location, and date/time of the password reset.
passwordResetAccountRecovery-description-3 = Du brukte nøkkelen for kontogjenoppretting til å tilbakestille passordet for { -product-mozilla-account } på:
passwordResetAccountRecovery-information = Vi logga deg ut frå alle dei synkroniserte einingane dine. Vi oppretta ein ny kontogjenopprettingsnøkkel for å erstatte den du brukte. Du kan endre det i kontoinnstillingane.
# After the colon there is a link to account settings
passwordResetAccountRecovery-information-txt = Vi logga deg ut frå alle synkroniserte einingar. Vi oppretta ein ny kontogjenopprettingsnøkkel for å erstatte den du brukte. Du kan endre det i kontoinnstillingane dine:
passwordResetAccountRecovery-action-4 = Handsam kontoen
passwordResetRecoveryPhone-subject = Gjenopprettingstelefon brukt
passwordResetRecoveryPhone-preview = Kontroller at dette var deg
passwordResetRecoveryPhone-title = Telefonnummeret ditt for gjenopprettingvart brukt til å stadfeste tilbakestilling av passord
passwordResetRecoveryPhone-device = Gjenopprettingstelefon brukt frå:
passwordResetRecoveryPhone-action = Handsam kontoen
passwordResetWithRecoveryKeyPrompt-subject = Passordet ditt er tilbakestilt
passwordResetWithRecoveryKeyPrompt-title = Passordet ditt er tilbakestilt
# Details of the device and date/time where the password was reset
passwordResetWithRecoveryKeyPrompt-description = Du tilbakestiller passordet for { -product-mozilla-account } på:
# Text for button action to create a new account recovery key
passwordResetWithRecoveryKeyPrompt-action = Opprett kontogjenopprettingsnøkkel
# colon is followed by a link to create an account recovery key from the account settings page
passwordResetWithRecoveryKeyPrompt-action-txt = Opprett kontogjenopprettingsnøkkel:
passwordResetWithRecoveryKeyPrompt-cta-description = Du må logge inn igjen på alle dei synkroniserte einingane dine. Hald dataa dine trygge neste gong med ein kontogjenopprettingsnøkkel . Dette gjer at du kan stille tilbake dataa dine om du gløymer eit passord.
postAddAccountRecovery-subject-3 = Ny kontogjenopprettingsnøkkel oppretta
postAddAccountRecovery-title2 = Du oppretta ein ny kontogjenopprettingsnøkkel
# Key here refers to account recovery key
postAddAccountRecovery-body-part1 = Lagre denne nøkkelen på ein trygg stad — du treng han for å gjenopprette dei krypterte nettlesardataa dine viss du gløymer passordet ditt.
# Key here refers to account recovery key
postAddAccountRecovery-body-part2 = Denne nøkkelen kan berre brukast éin gong. Etter at du har brukt han, opprettar vi automatisk ein ny for deg. Eller du kan opprette ein ny når som helst frå kontoinnstillingane dine.
postAddAccountRecovery-action = Handsam kontoen
postAddLinkedAccount-subject-2 = Ny konto knytt til { -product-mozilla-account }
#  Variables:
#  $providerName (String) - The name of the provider, e.g. Apple, Google
postAddLinkedAccount-title-2 = { $providerName }-kontoen din er kopla til { -product-mozilla-account }-en din
postAddLinkedAccount-action = Handsam kontoen
postAddRecoveryPhone-subject = Gjenopprettingstelefon lagt til
postAddRecoveryPhone-preview = Kontoen er verna av tostegs-autentisering
postAddRecoveryPhone-title-v2 = Du la til eit gjenoprettingstelefonnummer
# Variables:
#  $maskedLastFourPhoneNumber (String) - A bullet point mask with the last four digits of the user's phone number, e.g. ••••••1234
postAddRecoveryPhone-description-v2 = Du la til { $maskedLastFourPhoneNumber } som gjenopprettingstelefonnummer
# Links out to a support article about two factor authentication
postAddRecoveryPhone-how-protect = Korleis dette vernar kontoen din
postAddRecoveryPhone-how-protect-plaintext = Korleis dette vernar kontoen din:
postAddRecoveryPhone-enabled-device = Du har aktivert det frå:
postAddRecoveryPhone-action = Handsam kontoen
postAddTwoStepAuthentication-preview = Kontoen din er beskytta
postAddTwoStepAuthentication-subject-v3 = Tostegs-autentisering er på
postAddTwoStepAuthentication-title-2 = Du slo på tostegs-autentisering
# After the colon, there is a description of the device that the user used to enable two-step authentication
postAddTwoStepAuthentication-from-device-v2 = Du ba om dette frå:
postAddTwoStepAuthentication-action = Handsam kontoen
postAddTwoStepAuthentication-code-required-v4 = Tryggingskodar frå autentiseringsappen din er påkravd no kvar gong du loggar på.
postAddTwoStepAuthentication-recovery-method-codes = Du har òg lagt til reserve-autentiseringskode som gjenopprettingsmetode.
# Variables:
#  $maskedPhoneNumber (String) - A bullet point mask with the last four digits of the user's phone number, e.g. ••••••1234
postAddTwoStepAuthentication-recovery-method-phone = Du la òg til { $maskedPhoneNumber } som telefonnummer for gjenoppretting.
postAddTwoStepAuthentication-how-protects-link = Korleis dette vernar kontoen din
postAddTwoStepAuthentication-how-protects-plaintext = Korleis dette vernar kontoen din:
postAddTwoStepAuthentication-device-sign-out-message = For å verne alle tilkopla einingar bør du logge ut overalt der du brukar denne kontoen, og deretter logge inn igjen med tostegs-autentisering.
postChangeAccountRecovery-subject = Kontogjenopprettingsnøkkel endra
postChangeAccountRecovery-title = Du endra kontogjenopprettingsnøkkelen
postChangeAccountRecovery-body-part1 = Du har no ein ny kontogjenopprettingsnøkkel. Den førre nøkkelen din vart sletta.
postChangeAccountRecovery-body-part2 = Lagre denne nye nøkkelen på ein trygg stad — du treng han for å gjenopprette dei krypterte nettlesardataa dine viss du gløymer passordet ditt.
postChangeAccountRecovery-action = Handsam kontoen
postChangePrimary-subject = Primær e-postadresse oppdatert
postChangePrimary-title = Ny primær e-postadresse
# Variables:
#  $email (String) - A user's email address
postChangePrimary-description-2 = Du har endra den primære e-postadressa di til { $email }. Denne adressa nyttar du som brukarnamn for å logge inn på { -product-mozilla-account }-en din, i tillegg til å ta imot sikkerheitsvarsel og stadfestingar på innloggingar.
postChangePrimary-action = Handsam kontoen
postChangeRecoveryPhone-subject = Gjenopprettingstelefon oppdatert
postChangeRecoveryPhone-preview = Kontoen er verna av tostegs-autentisering
postChangeRecoveryPhone-title = Du endra gjenopprettingstelefon
postChangeRecoveryPhone-description = Du har no ein ny gjenopprettingstelefon. Det førre telefon-nummeret ditt vart sletta.
postChangeRecoveryPhone-requested-device = Du ba om det frå:
postChangeTwoStepAuthentication-preview = Kontoen din er beskytta
postChangeTwoStepAuthentication-subject = Tostegs-autentisering, oppdatert
postChangeTwoStepAuthentication-title = Tostegs-autentisering er oppdatert
postChangeTwoStepAuthentication-use-new-account = Du må nå bruke den nye { -product-mozilla-account }-oppføringa i autentiseringsappen din. Den eldre vil ikkje lenger fungere, og du kan fjerne han.
# After the colon, there is a description of the device that the user used to enable two-step authentication
postChangeTwoStepAuthentication-from-device = Du ba om dette frå:
postChangeTwoStepAuthentication-action = Handsam kontoen
postChangeTwoStepAuthentication-how-protects-link = Korleis dette vernar kontoen din
postChangeTwoStepAuthentication-how-protects-plaintext = Korleis dette vernar kontoen din:
postChangeTwoStepAuthentication-device-sign-out-message = For å verne alle tilkopla einingar bør du logge ut overalt der du brukar denne kontoen, og deretter logge inn igjen med den nye tostegs-autentiseringa di.
postConsumeRecoveryCode-title-3 = Reserve-autentiseringskoden din vart brukt til å stadfeste tilbakestilling av passord
# After the colon, there is description of the device that the backup authentication code was used on
# E.g., Firefox Nightly on Mac OSX, Thursday Sept 2, 2024
postConsumeRecoveryCode-description-3 = Kode brukt frå:
postConsumeRecoveryCode-action = Handsam kontoen
postConsumeRecoveryCode-subject-v3 = Reserve-autentiseringskode brukt
postConsumeRecoveryCode-preview = Kontroller at dette var deg
postNewRecoveryCodes-subject-2 = Nye reserve-autentiseringskodar oppretta
postNewRecoveryCodes-title-2 = Du oppretta nye reserve-autentiseringskodar
# After the colon, there is information about the device that the authentication codes were created on
postNewRecoveryCodes-description-2 = Dei vart oppretta på:
postNewRecoveryCodes-action = Handsam kontoen
postRemoveAccountRecovery-subject-2 = Konto-gjenopprettingsnøkkel sletta
postRemoveAccountRecovery-title-3 = Du sletta kontogjenopprettingsnøkkelen din
postRemoveAccountRecovery-body-part1 = Kontogjenopprettingsnøkkelen din er påkravd for å gjenopprette dei krypterte nettlesardataa dine viss du gløymer passordet ditt.
postRemoveAccountRecovery-body-part2 = Viss du ikkje allereie har gjort det, kan du opprette ein ny kontogjenopprettingsnøkkel i kontoinnstillingane dine for å hindre at du mistar lagra passord, bokmerke, nettlesarhistorikk, og meir.
postRemoveAccountRecovery-action = Handsam kontoen
postRemoveRecoveryPhone-subject = Gjenopprettingstelefon fjerna
postRemoveRecoveryPhone-preview = Kontoen er verna av tostegs-autentisering
postRemoveRecoveryPhone-title = Gjenopprettingstelefon fjerna
postRemoveRecoveryPhone-description-v2 = Gjenopprettingstelefonen din er fjerna frå innstillingane dine for tostegs-autentisering.
postRemoveRecoveryPhone-description-extra = Du kan framleis bruke reserve-autentiseringskodar for å logge inn om du ikkje kan bruke autentiseringsappen din.
postRemoveRecoveryPhone-requested-device = Du ba om det frå:
postRemoveSecondary-subject = Sekundær e-postadesse fjerna
postRemoveSecondary-title = Sekundær e-postadesse fjerna
# Variables:
#  $secondaryEmail (String) - A user's email address
postRemoveSecondary-description-2 = Du har sletta { $secondaryEmail } som ei sekundær e-postadresse frå { -product-mozilla-account }en din. Tryggingsmeldingar og innloggingsstadfestingar vil ikkje lenger bli leverte til denne adressa.
postRemoveSecondary-action = Handsam kontoen
postRemoveTwoStepAuthentication-subject-line-2 = Tostegs-autentisering er slått av
postRemoveTwoStepAuthentication-title-2 = Du har slått av tostegs-autentisering
# After the colon is a description of the device the user used to disable two-step authentication
postRemoveTwoStepAuthentication-from-device = Du har slått det av frå:
postRemoveTwoStepAuthentication-action = Handsam kontoen
postRemoveTwoStepAuthentication-not-required-2 = Du treng ikkje lenger sikkerheitskodar frå autentiseringsappen når du loggar inn.
postSigninRecoveryCode-subject = Reserve-autentiseringskode brukt for å logge inn
postSigninRecoveryCode-preview = Stadfest kontoaktivitet
postSigninRecoveryCode-title = Reserve-autentiseringskoden din vart brukt for å logge inn
postSigninRecoveryCode-description = Viss du ikkje gjorde dette, bør du endre passordet ditt omgåande for å halde kontoen din trygg.
postSigninRecoveryCode-device = Du logga inn frå:
postSigninRecoveryCode-action = Handsam kontoen
postSigninRecoveryPhone-subject = Gjenopprettingstelefon brukt for å logge inn
postSigninRecoveryPhone-preview = Stadfest kontoaktivitet
postSigninRecoveryPhone-title = Gjenopprettingstelefonen din vart brukt for å logge inn
postSigninRecoveryPhone-description = Viss du ikkje gjorde dette, bør du endre passordet ditt omgåande for å halde kontoen din trygg.
postSigninRecoveryPhone-device = Du logga inn frå:
postSigninRecoveryPhone-action = Handsam kontoen
postVerify-sub-title-3 = Vi er glade for å sjå deg!
postVerify-title-2 = Vil du sjå den same fana på to einingar?
postVerify-description-2 = Det er lett! Installer berre { -brand-firefox } på ei anna eining og logg på for å synkronisere. Det er som magi!
postVerify-sub-description = (Psst… Det betyr også at du kan få bokmerke, passord og andre { -brand-firefox }-data overalt der du er logga inn.)
postVerify-subject-4 = Velkomen til { -brand-mozilla }!
postVerify-setup-2 = Kople til ei anna eining:
postVerify-action-2 = Kople til ei anna eining
postVerifySecondary-subject = Sekundær e-post lagt til
postVerifySecondary-title = Sekundær e-post lagt til
# Variables:
#  $secondaryEmail (String) - A user's secondary email address
postVerifySecondary-content-3 = Du har bstadfesta { $secondaryEmail } som ei sekundær e-postadresse for { -product-mozilla-account }en din. Tyggingsmeldingar og innlogging-stadfestingar vil no bli leverte til begge e-postadressene.
postVerifySecondary-action = Handsam kontoen
recovery-subject = Tilbakestill passord
recovery-title-2 = Gløymt passordet ditt?
# Information on the device, location, and date and time of the request that triggered the email follows.
recovery-request-origin-2 = Vi fekk ein førespurnad om passordendring på { -product-mozilla-account }en din frå:
recovery-new-password-button = Opprett eit nytt passord ved å klikke på knappen nedanfor. Denne lenka vil gå ut innan den neste timen.
recovery-copy-paste = Opprett eit nytt passord ved å kopiere og lime inn nettadressa nedanfor i nettlesaren din. Denne lenka vil gåp ut innan den neste timen.
recovery-action = Lag nytt passord
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountDeletion-subject = Abonnentet ditt på { $productName } her avslutta
subscriptionAccountDeletion-title = Det er synd at du seier opp abonnementet ditt
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $invoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
subscriptionAccountDeletion-content-cancelled-2 = Du har nyleg sletta { -product-mozilla-account }-en din. Som eit resultat har vi avslutta abonnement ditt på { $productName }. Den endelege betalinga på { $invoiceTotal } vart betalt den { $invoiceDateOnly }.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountFinishSetup-subject = Velkommen til { $productName }: Vel eit passord.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountFinishSetup-title = Velkomen til { $productName }
subscriptionAccountFinishSetup-content-processing = Betalinga din vert behandla og kan ta opptil fire yrkedagar å fullføre. Abonnementet ditt vert fornya automatisk kvar faktureringsperiode, dersom du ikkje vel å avslutte.
subscriptionAccountFinishSetup-content-create-3 = Deretter opprettar du eit { -product-mozilla-account }-passord for å begynne å bruke det nye abonnementet ditt.
subscriptionAccountFinishSetup-action-2 = Kom i gang
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
#   $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#   $planIntervalCount (String) - The interval count of subscription plan, e.g. 2
#   $planInterval (String) - The interval of time of the subscription plan, e.g. week
#   $reminderLength (String) - The number of days until the current subscription is set to automatically renew, e.g. 14
subscriptionRenewalReminder-content-current = Abonnement ditt er sett til å fornyast automatisk om { $reminderLength } dagar. På det tidspunktet vil { -brand-mozilla } fornye abonnementet på { $planIntervalCount } { $planInterval }, og ein kostnad på { $invoiceTotal } vert belasta betalingsmåten på kontoen din.
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
subscriptionsPaymentExpired-subject-2 = Betalingsmåten for abonnementa dine er utgått eller går snart ut
subscriptionsPaymentExpired-title-2 = Betalingsmetoden din har gått ut eller i ferd med å gå ut
subscriptionsPaymentExpired-content-2 = Betalingsmåten du brukar for å utføre betalingar for følgjande abonnement, er utgått eller går snart ut.
subscriptionsPaymentProviderCancelled-subject = Oppdatering av betalingsinformasjon er påkravd for { -brand-mozilla }-abonnementa
subscriptionsPaymentProviderCancelled-title = Beklagar, vi har problem med betalingsmetoden din
subscriptionsPaymentProviderCancelled-content-detected = Vi har oppdaga eit problem med betalingsmåten din for følgjande abonnement.
subscriptionsPaymentProviderCancelled-content-payment-1 = Det kan vere at betalingsmåten din er utgått, eller at den noverande betalingsmåten din er utdatert.
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
# Variables:
#  $unblockCode (String) - The authorization code for sign-in
unblockCode-subject-2 = Bruk { $unblockCode } for å logge inn
unblockCode-preview = Denne koden går ut om éin time
unblockCode-title = Er det du som loggar inn?
unblockCode-prompt = Dersom ja, her er godkjenningskoden du treng:
# Variables:
#  $unblockCode (String) - An alphanumeric code
unblockCode-prompt-plaintext = Om ja, her er godkjenningskoden du treng: { $unblockCode }
unblockCode-report = Om ikkje, hjelp oss med å avverje inntrengarar og <a data-l10n-name="reportSignInLink">rapporter dette til oss</a>.
unblockCode-report-plaintext = Dersom nei, hjelp oss med å avverje inntrengarar og raporter dette til oss.
verificationReminderFinal-subject = Siste påminning om å stadfeste kontoen din.
verificationReminderFinal-description-2 = For eit par veker sidan oppretta du ein { -product-mozilla-account }, men stadfesta han aldri. For di sikkerheit vil vi slette kontoen om han ikkje vert stadfesta i løpet av dei neste 24 timane.
confirm-account = Stadfest kontoen
confirm-account-plaintext = { confirm-account }:
verificationReminderFirst-subject-2 = Hugs å stadfeste kontoen din
verificationReminderFirst-title-3 = Velkomen til { -brand-mozilla }!
verificationReminderFirst-description-3 = For nokre dagar sidan oppretta du ein { -product-mozilla-account }, men stadfesta han aldri. Stadfest kontoen din i løpet av dei neste 15 dagane, elles vert han automatisk sletta.
verificationReminderFirst-sub-description-3 = Gå ikkje glipp av nettlesaren som set deg og ditt privatliv fremst.
confirm-email-2 = Stadfest kontoen
confirm-email-plaintext-2 = { confirm-email-2 }:
verificationReminderFirst-action-2 = Stadfest kontoen
verificationReminderSecond-subject-2 = Hugs å stadfeste kontoen din
verificationReminderSecond-title-3 = Ikkje gå glipp av { -brand-mozilla }!
verificationReminderSecond-description-4 = For nokre dagar sidan oppretta du ein { -product-mozilla-account }, men stadfesta han aldri. Stadfest kontoen din i løpet av dei neste 10 dagane, elles vert han automatisk sletta.
verificationReminderSecond-second-description-3 = { -product-mozilla-account }en din lèt deg synkronisere { -brand-firefox }-opplevinga di på tvers av einingar og låser opp tilgang til fleire personvernbeskyttande produkt frå { -brand-mozilla }.
verificationReminderSecond-sub-description-2 = Bli ein del av oppdraget vårt med å omforme internett til ein plass som er open for alle.
verificationReminderSecond-action-2 = Stadfest kontoen
verify-title-3 = Opne internett med { -brand-mozilla }
verify-description-2 = Stadfest kontoen din og få mest mogleg ut av { -brand-mozilla }, overalt der du loggar inn:
verify-subject = Fullfør opprettinga av kontoen din
verify-action-2 = Stadfest kontoen
# Variables:
# $code (String) - The verification code
verifyAccountChange-subject = Bruk { $code } for å endre kontoen din
# Variables:
# $expirationTime (Number) - Represents the expiration time in minutes
verifyAccountChange-preview =
    { $expirationTime ->
        [one] Denne koden går ut om { $expirationTime } minutt.
       *[other] Denne koden går ut om { $expirationTime } minutt.
    }
verifyAccountChange-title = Endrar du kontoinformasjonen din?
# After the colon is a description of the device used to sign in to the service
verifyAccountChange-safe = Hjelp oss med å halde kontoen din trygg ved å godkjenne denne endringa på:
verifyAccountChange-prompt = Om ja, her er godkjenningskoden din:
# Variables:
# $expirationTime (Number) - Represents the expiration time in minutes
verifyAccountChange-expiry-notice =
    { $expirationTime ->
        [one] Han går ut om { $expirationTime } minutt.
       *[other] Han går ut om { $expirationTime } minutt.
    }
# Variables:
#  $clientName (String) - A client the user hasn't signed into before (e.g. Firefox, Sync)
verifyLogin-title-2 = Logga du inn på { $clientName }?
verifyLogin-description-2 = Hjelp oss med å halde kontoen din trygg ved å stadfeste att du har logga inn på:
verifyLogin-subject-2 = Stadfest innlogging
verifyLogin-action = Stadfest innlogging
# Variables:
#  $code (String) - The confirmation code for sign-in
verifyLoginCode-subject-line-3 = Bruk { $code } for å logge inn
verifyLoginCode-preview = Denne koden går ut om 5 minutt
# Variables:
#  $serviceName (String) - A service the user hasn't signed into before (e.g. Firefox)
verifyLoginCode-title-2 = Logga du inn på { $serviceName }
# After the colon is a description of the device used to sign in to the service
verifyLoginCode-safe = Hjelp oss med å halde kontoen din trygg ved å godkjenne innlogginga di på:
verifyLoginCode-prompt-3 = Om ja, her er godkjenningskoden din:
verifyLoginCode-expiry-notice = Den går ut om 5 minutt.
verifyPrimary-title-2 = Stadfest primær e-postadresse
verifyPrimary-description = Ein førespurnad om å utføre ei kontoendring er gjort frå følgjande eining:
verifyPrimary-subject = Stadfest primær e-postadresse
verifyPrimary-action-2 = Stadfest e-postadressa
verifyPrimary-action-plaintext-2 = { verifyPrimary-action-2 }:
verifyPrimary-post-verify-2 = Når stadfesta, vil endringar i kontoen, som å leggje til ein sekundær e-post, verte mogleg frå denne eininga.
# Variables:
#  $code (String) - The confirmation code for secondary email
verifySecondaryCode-subject-2 = Bruk { $code } for å stadfeste den sekundære e-postadressa di
verifySecondaryCode-preview = Denne koden går ut om 5 minutt
verifySecondaryCode-title-2 = Stadfest sekundær e-postadresse
verifySecondaryCode-action-2 = Stadfest e-postadressa
# Variables:
#  $email (string) A user's unverified secondary email address
verifySecondaryCode-explainer-2 = Ein førespurnad om å bruke { $email } som ei sekundær e-postadresse er gjort frå følgjande { -product-mozilla-account }:
verifySecondaryCode-prompt-2 = Bruk denne stadfestingskoden:
verifySecondaryCode-expiry-notice-2 = Den går ut om 5 minutt. Når den er bekrefta, vil denne adressa få tryggingsvarsel og stadfestingar.
# Variables:
#  $code (String) - comfirmation code for the account
verifyShortCode-subject-4 = Bruk { $code } for å stadfeste kontoen din
verifyShortCode-preview-2 = Denne koden går ut om 5 minutt
verifyShortCode-title-3 =
    Opne internett med
     { -brand-mozilla }
# Information on the browser and device triggering this confirmation email follows below this string.
verifyShortCode-title-subtext-2 = Stadfest kontoen din og få mest mogleg ut av { -brand-mozilla }, overalt der du loggar inn:
verifyShortCode-prompt-3 = Bruk denne stadfestingskoden
verifyShortCode-expiry-notice = Den går ut om 5 minutt.
