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

## Email content
## Emails do not contain buttons, only links. Emails have a rich HTML version and a plaintext
## version. The strings are usually identical but sometimes they differ slightly.

fxa-header-mozilla-logo = <img data-l10n-name="mozilla-logo" alt="{ -brand-mozilla }-logo">
fxa-header-sync-devices-image = <img data-l10n-name="sync-devices-image" alt="Synkroniser enheter">
body-devices-image = <img data-l10n-name="devices-image" alt="Enheter">
fxa-privacy-url = { -brand-mozilla } personvernpraksis
moz-accounts-privacy-url-2 = { -product-mozilla-accounts(capitalization: "uppercase") } personvernerklæring
moz-accounts-terms-url = { -product-mozilla-accounts(capitalization: "uppercase") } bruksvilkår
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
account-deletion-info-block-communications = Hvis kontoen din slettes, vil du fortsatt motta e-poster fra Mozilla Corporation og Mozilla Foundation, med mindre du <a data-l10n-name="unsubscribeLink">ber om å avslutte abonnementet</a>.
account-deletion-info-block-support = Hvis du har spørsmål eller trenger hjelp, kan du gjerne kontakte <a data-l10n-name="supportLink">støtteteamet</a> vårt.
account-deletion-info-block-communications-plaintext = Hvis kontoen din slettes, vil du fortsatt motta e-poster fra Mozilla Corporation og Mozilla Foundation, med mindre du ber om å avslutte abonnementet:
account-deletion-info-block-support-plaintext = Hvis du har spørsmål eller trenger hjelp, kan du gjerne kontakte brukerstøtte-teamet vårt:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
body-android-badge = <img data-l10n-name="google-play-badge" alt="Last ned { $productName } i { -google-play }">
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
body-ios-badge = <img data-l10n-name="apple-app-badge" alt="Last ned { $productName }  i { -app-store }">
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-desktop-device-2 = Installer { $productName } på <a data-l10n-name="anotherDeviceLink">en annen stasjonær enhet</a>.
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-device-2 = Installer { $productName } på <a data-l10n-name="anotherDeviceLink">en annen enhet</a>.
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
android-download-plaintext = Last ned { $productName } på Google Play:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
ios-download-plaintext = Last ned { $productName } på App Store:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-device-plaintext = Installer { $productName } på en annen enhet:
automated-email-change-2 = Hvis du ikke gjorde denne handlingen, <a data-l10n-name="passwordChangeLink">endre passordet ditt</a> med en gang.
automated-email-support = For mer informasjon, besøk <a data-l10n-name="supportLink">{ -brand-mozilla } brukerstøtte</a>.
# After the colon, there's a link to https://accounts.firefox.com/settings/change_password
automated-email-change-plaintext-2 = Hvis du ikke gjorde denne handlingen, endre passordet ditt med en gang:
#  After the colon, there's a link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
automated-email-support-plaintext = For mer informasjon, besøk { -brand-mozilla } Support:
automated-email-inactive-account = Dette er en automatisert e-post. Du mottar den fordi du har en { -product-mozilla-account } og det har gått 2 år siden sist pålogging.
# supportLink - https://support.mozilla.org/kb/im-having-problems-my-firefox-account
automated-email-no-action = { automated-email-no-action-plaintext } For mer informasjon, besøk <a data-l10n-name="supportLink">{ -brand-mozilla } brukerstøtte</a>.
automated-email-no-action-plaintext = Dette er en automatisert e-post. Hvis du mottok den ved en feil, trenger du ikke gjøre noe.
#  After the colon, there's a link to https://accounts.firefox.com/settings/change_password
automated-email-not-authorized-plaintext = Dette er en automatisert e-post; hvis du ikke autoriserte denne handlingen, endre passordet ditt:
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
# - $uaOS: the user agent's operating system (e.g, MacOS)
# - $uaOSVersion - the user agent's operating system version
automatedEmailRecoveryKey-origin-device-all = Denne forespørselen kom fra { $uaBrowser } på { $uaOS } { $uaOSVersion }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
# - $uaOS: the user agent's operating system (e.g, MacOS)
automatedEmailRecoveryKey-origin-device-browser-os = Denne forespørselen kom fra { $uaBrowser } på { $uaOS }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
automatedEmailRecoveryKey-origin-device-browser-only = Denne forespørselen kom fra { $uaBrowser }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaOS: the user agent's operating system (e.g, MacOS)
# - $uaOSVersion - the user agent's operating system version
automatedEmailRecoveryKey-origin-device-OS-version-only = Denne forespørselen kom fra { $uaOS } { $uaOSVersion }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaOS: the user agent's operating system (e.g, MacOS)
automatedEmailRecoveryKey-origin-device-OS-only = Denne forespørselen kom fra { $uaOS }.
automatedEmailRecoveryKey-delete-key-change-pwd = Hvis dette ikke var deg, <a data-l10n-name="revokeAccountRecoveryLink">slett den nye nøkkelen</a> og <a data-l10n-name="passwordChangeLink">endre passordet ditt</a>.
automatedEmailRecoveryKey-change-pwd-only = Hvis dette ikke var deg, <a data-l10n-name="passwordChangeLink">endre passordet ditt</a>.
automatedEmailRecoveryKey-more-info = For mer informasjon, besøk <a data-l10n-name="supportLink">{ -brand-mozilla } brukerstøtte</a>.
# Colon is followed by user device info on a separate line (e.g., "Firefox Nightly on Mac OSX 10.11")
automatedEmailRecoveryKey-origin-plaintext = Denne forespørselen kom fra:
# Colon is followed by a URL to the account recovery key section of account settings
automatedEmailRecoveryKey-notyou-delete-key-plaintext = Hvis dette ikke var deg, slett den nye nøkkelen:
# Colon is followed by a URL to the change password section of account settings
automatedEmailRecoveryKey-notyou-change-pwd-only-plaintext = Hvis dette ikke var deg, endre passordet ditt:
# This string is shown on its own line, after automatedEmailRecoveryKey-notyou-delete-key-plaintext and its URL
# Colon is followed by a URL to the change password section of account settings
automatedEmailRecoveryKey-notyou-change-pwd-plaintext = og endre passordet ditt:
# Colon is followed by a URL to Mozilla Support's "I'm having problems with my account" page
automatedEmailRecoveryKey-more-info-plaintext = For mer informasjon, besøk { -brand-mozilla } Support:
automated-email-reset =
    Dette er en automatisert e-post; hvis du ikke autoriserte denne handlingen, <a data-l10n-name="resetLink">tilbakestill passordet ditt</a>.
    For mer informasjon, besøk <a data-l10n-name="supportLink">{ -brand-mozilla } brukerstøtte</a>.
# Variables:
#  $resetLink (String) - Link to https://accounts.firefox.com/reset_password
automated-email-reset-plaintext-v2 = Hvis du ikke autoriserte denne handlingen, kan du tilbakestille passordet ditt nå på { $resetLink }
# This message is used by multiple automated emails that notify users of security events on their account
# "this action" is meant to be a generic term, and could, for example, refer to using a backup authentication code to confirm a password reset
automated-email-reset-pwd-two-factor =
    Hvis du ikke utførte dette, må du <a data-l10n-name="resetLink">tilbakestille passordet ditt</a> og <a data-l10n-name="twoFactorSettingsLink">tilbakestille totrinnsautentisering</a> med en gang.
    
    For mer informasjon, besøk <a data-l10n-name="supportLink">{ -brand-mozilla } brukerstøtte</a>.
# Followed by link to https://accounts.firefox.com/reset_password
automated-email-reset-pwd-plaintext-v3 = Hvis du ikke utførte dette, kan du tilbakestille passordet ditt med en gang på:
# Followed by link to https://accounts.firefox.com/settings#two-step-authentication
automated-email-reset-two-factor-plaintext = Tilbakestill også totrinns-autentisering på:
brand-banner-message = Visste du at vi endret navnet vårt fra { -product-firefox-accounts } til { -product-mozilla-accounts }? <a data-l10n-name="learnMore">Les mer</a>
cancellationSurvey = Hjelp oss med å forbedre tjenestene våre ved å være med i denne <a data-l10n-name="cancellationSurveyUrl">korte undersøkelsen</a>.
# After the colon, there's a link to https://survey.alchemer.com/s3/6534408/Privacy-Security-Product-Cancellation-of-Service-Q4-21
cancellationSurvey-plaintext = Hjelp oss med å forbedre tjenestene våre ved å ta denne korte undersøkelsen:
change-password-plaintext = Hvis du mistenker at noen prøver å få tilgang til kontoen din, må du endre passordet ditt.
manage-account = Behandle konto
manage-account-plaintext = { manage-account }:
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
# Variables:
#  $supportUrl (String) - Link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
support-message-3 = For mer informasjon, besøk <a data-l10n-name="supportLink">{ -brand-mozilla } brukerstøtte</a>.
# Variables:
#  $supportUrl (String) - Link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
support-message-plaintext = For mer informasjon, besøk { -brand-mozilla } brukerstøtte: { $supportUrl }.
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
view-invoice-plaintext = Se faktura: { $invoiceLink }
cadReminderFirst-subject-1 = Påminnelse! Begynn å synkronisere { -brand-firefox }
cadReminderFirst-action = Synkroniser en annen enhet
cadReminderFirst-action-plaintext = { cadReminderFirst-action }:
# In the title of the email, "It takes two to sync", "two" refers to syncing two devices
cadReminderFirst-title-1 = Det skal to til for å synkronisere
cadReminderFirst-description-v2 = Se fanene dine på alle enhetene dine. Få tilgang til bokmerkene, passordene og andre data overalt hvor du bruker { -brand-firefox }.
cadReminderSecond-subject-2 = Ikke gå glipp av det! La oss fullføre synkroniseringsoppsettet
cadReminderSecond-action = Synkroniser en annen enhet
cadReminderSecond-title-2 = Ikke glem å synkronisere!
cadReminderSecond-description-sync = Synkroniser dine bokmerker, passord, åpene faner og mer — overalt hvor du bruker { -brand-firefox }.
cadReminderSecond-description-plus = I tillegg er dine data alltid kryptert. Bare du og enheter du godkjenner kan se den.
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
inactiveAccountFinalWarning-subject = Siste sjanse til å beholde din { -product-mozilla-account }
inactiveAccountFinalWarning-title = Din { -brand-mozilla }-konto og data vil bli slettet
inactiveAccountFinalWarning-preview = Logg inn for å beholde kontoen din
inactiveAccountFinalWarning-account-description = Din { -product-mozilla-account } brukes til å få tilgang til gratis personvern- og surfeprodukter som { -brand-firefox } sync, { -product-mozilla-monitor }, { -product-firefox-relay } og { -product-mdn }.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
# This date will already be formatted with moment.js into Thursday, Jan 9, 2025 format
inactiveAccountFinalWarning-impact = På <strong>{ $deletionDate }</strong> vil kontoen din og dine personlige data bli slettet permanent med mindre du logger inn.
inactiveAccountFinalWarning-action = Logg inn for å beholde kontoen din
# followed by link to sign in
inactiveAccountFinalWarning-action-plaintext = Logg inn for å beholde kontoen din:
inactiveAccountFirstWarning-subject = Mist ikke kontoen din
inactiveAccountFirstWarning-title = Vil du beholde { -brand-mozilla }-kontoen og dine data?
inactiveAccountFirstWarning-account-description-v2 = Din { -product-mozilla-account } brukes til å få tilgang til gratis personvern- og surfeprodukter som { -brand-firefox } sync, { -product-mozilla-monitor }, { -product-firefox-relay } og { -product-mdn }.
inactiveAccountFirstWarning-inactive-status = Vi la merke til at du ikke har logget inn på 2 år.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
# This date will already be formatted with moment.js into Thursday, Jan 9, 2025 format
inactiveAccountFirstWarning-impact = Kontoen din og dine personlige data blir permanent slettet <strong>{ $deletionDate }</strong> fordi du ikke har vært aktiv.
inactiveAccountFirstWarning-action = Logg inn for å beholde kontoen din
inactiveAccountFirstWarning-preview = Logg inn for å beholde kontoen din
# followed by link to sign in
inactiveAccountFirstWarning-action-plaintext = Logg inn for å beholde kontoen din:
inactiveAccountSecondWarning-subject = Handling kreves: Sletting av kontoen om 7 dager
inactiveAccountSecondWarning-title = Din { -brand-mozilla }-konto og data vil bli slettet om 7 dager
inactiveAccountSecondWarning-account-description-v2 = Din { -product-mozilla-account } brukes til å få tilgang til gratis personvern- og surfeprodukter som { -brand-firefox } sync, { -product-mozilla-monitor }, { -product-firefox-relay } og { -product-mdn }.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
inactiveAccountSecondWarning-impact = Kontoen din og dine personlige data blir permanent slettet <strong>{ $deletionDate }</strong> fordi du ikke har vært aktiv.
inactiveAccountSecondWarning-action = Logg inn for å beholde kontoen din
inactiveAccountSecondWarning-preview = Logg inn for å beholde kontoen din
# followed by link to sign in
inactiveAccountSecondWarning-action-plaintext = Logg inn for å beholde kontoen din:
# The user has a low number of valid recovery codes remaining for use
codes-reminder-title-zero = Du er tom for reserve-autentiseringskoder!
codes-reminder-title-one = Du har kun én reserve-autentiseringskode igjen
codes-reminder-title-two = På tide å lage flere reserve-autentiseringskoder
codes-reminder-description-part-one = Reserve-autentiseringskoder hjelper deg med å gjenopprette informasjonen din når du glemmer passordet ditt.
codes-reminder-description-part-two = Opprett nye koder nå, slik at du ikke mister dine data senere.
codes-reminder-description-two-left = Du har bare to koder igjen.
codes-reminder-description-create-codes = Opprett nye reserve-autentiseringskoder for å hjelpe deg med å få tilgang til kontoen din hvis du blir låst ute.
lowRecoveryCodes-action-2 = Opprett koder
codes-create-plaintext = { lowRecoveryCodes-action-2 }:
lowRecoveryCodes-subject-2 =
    { $numberRemaining ->
        [0] Ingen reserve-autentiseringskoder igjen
        [one] Bare 1 reserve-autentiseringskode igjen
       *[other] Bare { $numberRemaining } reserve-autentiseringskoder igjen!
    }
# Variables:
# $clientName (String) - A client the user hasn't signed into before (e.g. Firefox, Sync)
newDeviceLogin-subject = Ny innlogging på { $clientName }
newDeviceLogin-subjectForMozillaAccount = Ny innlogging på din { -product-mozilla-account }
newDeviceLogin-title-3 = Din { -product-mozilla-account } ble brukt til å logge på
# The "Not you?" question is asking whether the recipient of the email is the
# person who performed the action that triggered the email.
newDeviceLogin-change-password = Ikke deg? <a data-l10n-name="passwordChangeLink">Endre passordet ditt</a>.
# The "Not you?" question is asking whether the recipient of the email is the
# person who performed the action that triggered the email.
newDeviceLogin-change-password-plain = Ikke deg? Endre passordet ditt:
newDeviceLogin-action = Behandle konto
passwordChanged-subject = Passord oppdatert
passwordChanged-title = Passordet er endret
passwordChanged-description-2 = Passordet til din { -product-mozilla-account } ble endret fra følgende enhet:
passwordChangeRequired-subject = Mistenkt aktivitet oppdaget
passwordChangeRequired-preview = Endre passordet ditt umiddelbart
passwordChangeRequired-title-2 = Tilbakestill passordet ditt
passwordChangeRequired-suspicious-activity-3 = Vi låste kontoen din for å beskytte den mot mistenkelig aktivitet. Du er logget av alle enhetene dine, og alle synkroniserte data er slettet som en forholdsregel.
passwordChangeRequired-sign-in-3 = For å logge på kontoen din igjen, trenger du bare å tilbakestille passordet ditt.
passwordChangeRequired-different-password-2 = <b>Viktig:</b> Velg et sterkt passord som er forskjellig fra et du har brukt tidligere.
passwordChangeRequired-different-password-plaintext-2 = Viktig: Velg et sterkt passord som er forskjellig fra et du har brukt tidligere.
passwordChangeRequired-action = Tilbakestill passord
passwordChangeRequired-action-plaintext = { passwordChangeRequired-action }:
# Variables:
#  $code (String) - The confirmation code for sign-in
password-forgot-otp-subject-2 = Bruk { $code } for å endre passordet ditt
password-forgot-otp-preview = Denne koden utløper om 10 minutter
password-forgot-otp-title = Glemt passord ditt?
password-forgot-otp-request = Vi mottok en forespørsel om passordendring på din { -product-mozilla-account } fra:
password-forgot-otp-code-2 = Hvis dette var deg, her er bekreftelseskoden for å fortsette:
password-forgot-otp-expiry-notice = Denne koden utløper om 10 minutter.
passwordReset-subject-2 = Passordet ditt har blitt tilbakestilt
passwordReset-title-2 = Passordet ditt har blitt tilbakestilt
# This sentence is followed by information about the device and time of the password reset
passwordReset-description-2 = Du tilbakestilte { -product-mozilla-account }-passordet ditt den:
passwordResetAccountRecovery-subject-2 = Passordet ditt er tilbakestilt
passwordResetAccountRecovery-title-3 = Passordet ditt har blitt tilbakestilt
# Followed by details on the device, location, and date/time of the password reset.
passwordResetAccountRecovery-description-3 = Du brukte kontogjenopprettingsnøkkelen din til å tilbakestille passordet ditt for { -product-mozilla-account } den:
passwordResetAccountRecovery-information = Vi logget deg ut av alle dine synkroniserte enheter. Vi opprettet en ny kontogjenopprettingsnøkkel for å erstatte den du brukte. Du kan endre den i kontoinnstillingene dine.
# After the colon there is a link to account settings
passwordResetAccountRecovery-information-txt = Vi logget deg ut av alle dine synkroniserte enheter. Vi opprettet en ny kontogjenopprettingsnøkkel for å erstatte den du brukte. Du kan endre den i kontoinnstillingene dine:
passwordResetAccountRecovery-action-4 = Behandle konto
passwordResetRecoveryPhone-subject = Gjenopprettingstelefon brukt
passwordResetRecoveryPhone-preview = Kontroller at dette var deg
passwordResetRecoveryPhone-title = Telefonnummeret ditt for gjenoppretting ble brukt til å bekrefte tilbakestilling av passord
passwordResetRecoveryPhone-device = Gjenopprettingstelefon brukt fra:
passwordResetRecoveryPhone-action = Behandle konto
passwordResetWithRecoveryKeyPrompt-subject = Passordet ditt har blitt tilbakestilt
passwordResetWithRecoveryKeyPrompt-title = Passordet ditt har blitt tilbakestilt
# Details of the device and date/time where the password was reset
passwordResetWithRecoveryKeyPrompt-description = Du tilbakestilte { -product-mozilla-account }-passordet ditt den:
# Text for button action to create a new account recovery key
passwordResetWithRecoveryKeyPrompt-action = Opprett kontogjenopprettingsnøkkel
# colon is followed by a link to create an account recovery key from the account settings page
passwordResetWithRecoveryKeyPrompt-action-txt = Opprett kontogjenopprettingsnøkkel:
passwordResetWithRecoveryKeyPrompt-cta-description = Du må logge inn igjen på alle de synkroniserte enhetene dine. Hold dataene dine trygge neste gang med en kontogjenopprettingsnøkkel. Dette lar deg gjenopprette dataene dine hvis du glemmer passordet ditt.
postAddAccountRecovery-subject-3 = Ny kontogjenopprettingsnøkkel opprettet
postAddAccountRecovery-title2 = Du opprettet en ny kontogjenopprettingsnøkkel
# Key here refers to account recovery key
postAddAccountRecovery-body-part1 = Lagre denne nøkkelen på et trygt sted — du trenger den for å gjenopprette de krypterte nettleserdataene dine hvis du glemmer passordet ditt.
# Key here refers to account recovery key
postAddAccountRecovery-body-part2 = Denne nøkkelen kan bare brukes én gang. Etter at du har brukt den, oppretter vi automatisk en ny for deg. Eller du kan opprette en ny når som helst fra kontoinnstillingene dine.
postAddAccountRecovery-action = Behandle konto
postAddLinkedAccount-subject-2 = Ny konto knyttet til { -product-mozilla-account }
#  Variables:
#  $providerName (String) - The name of the provider, e.g. Apple, Google
postAddLinkedAccount-title-2 = { $providerName }-kontoen er koblet til { -product-mozilla-account }-en din
postAddLinkedAccount-action = Behandle konto
postAddRecoveryPhone-subject = Gjenopprettingstelefon lagt til
postAddRecoveryPhone-preview = Konto beskyttet av totrinns-autentisering
postAddRecoveryPhone-title-v2 = Du la til et telefonnummer for gjenoppretting
# Variables:
#  $maskedLastFourPhoneNumber (String) - A bullet point mask with the last four digits of the user's phone number, e.g. ••••••1234
postAddRecoveryPhone-description-v2 = Du la til { $maskedLastFourPhoneNumber } som telefonnummer for gjenoppretting
# Links out to a support article about two factor authentication
postAddRecoveryPhone-how-protect = Slik beskytter dette kontoen din
postAddRecoveryPhone-how-protect-plaintext = Slik beskytter dette kontoen din:
postAddRecoveryPhone-enabled-device = Du har slått det på fra:
postAddRecoveryPhone-action = Behandle konto
postAddTwoStepAuthentication-preview = Kontoen din er beskyttet
postAddTwoStepAuthentication-subject-v3 = Totrinns-autentisering er på
postAddTwoStepAuthentication-title-2 = Du har slått på totrinns-autentisering
# After the colon, there is a description of the device that the user used to enable two-step authentication
postAddTwoStepAuthentication-from-device-v2 = Du ba om dette fra:
postAddTwoStepAuthentication-action = Behandle konto
postAddTwoStepAuthentication-code-required-v4 = Sikkerhetskoder fra autentiseringsappen din kreves nå hver gang du logger inn.
postAddTwoStepAuthentication-recovery-method-codes = Du har også lagt til reserve-autentiseringskode som gjenopprettingsmetode.
# Variables:
#  $maskedPhoneNumber (String) - A bullet point mask with the last four digits of the user's phone number, e.g. ••••••1234
postAddTwoStepAuthentication-recovery-method-phone = Du la også til { $maskedPhoneNumber } som telefonnummer for gjenoppretting.
postAddTwoStepAuthentication-how-protects-link = Slik beskytter dette kontoen din
postAddTwoStepAuthentication-how-protects-plaintext = Slik beskytter dette kontoen din:
postAddTwoStepAuthentication-device-sign-out-message = For å beskytte alle tilkoblede enheter bør du logge ut overalt hvor du bruker denne kontoen, og deretter logge på igjen med totrinnsautentisering.
postChangeAccountRecovery-subject = Kontogjenopprettingsnøkkel endret
postChangeAccountRecovery-title = Du endret kontogjenopprettingsnøkkelen
postChangeAccountRecovery-body-part1 = Du har nå en ny kontogjenopprettingsnøkkel. Den forrige nøkkelen din ble slettet.
postChangeAccountRecovery-body-part2 = Lagre denne nye nøkkelen på et trygt sted — du trenger den for å gjenopprette de krypterte nettleserdataene dine hvis du glemmer passordet ditt.
postChangeAccountRecovery-action = Behandle konto
postChangePrimary-subject = Primær e-postadresse oppdatert
postChangePrimary-title = Ny primær e-post
# Variables:
#  $email (String) - A user's email address
postChangePrimary-description-2 = Du har endret den primære e-postadressen din til { $email }. Denne adressen benytter du som brukernavn for å logge inn på din { -product-mozilla-account }, samt for å ta imot sikkerhetsvarsler og bekreftelser på innlogginger.
postChangePrimary-action = Behandle konto
postChangeRecoveryPhone-subject = Gjenopprettingstelefon oppdatert
postChangeRecoveryPhone-preview = Konto beskyttet av totrinns-autentisering
postChangeRecoveryPhone-title = Du endret gjenopprettingstelefonen din
postChangeRecoveryPhone-description = Du har nå et nytt telefonnummer for gjenoppretting. Det forrige telefonnummeret ditt ble slettet.
postChangeRecoveryPhone-requested-device = Du ba om det fra:
postChangeTwoStepAuthentication-preview = Kontoen din er beskyttet
postChangeTwoStepAuthentication-subject = Totrinns-autentisering oppdatert
postChangeTwoStepAuthentication-title = Totrinns-autentisering er oppdatert
postChangeTwoStepAuthentication-use-new-account = Du må nå bruke den nye { -product-mozilla-account }-oppføringen i autentiseringsappen din. Den eldre vil ikke lenger fungere, og du kan fjerne den.
# After the colon, there is a description of the device that the user used to enable two-step authentication
postChangeTwoStepAuthentication-from-device = Du ba om dette fra:
postChangeTwoStepAuthentication-action = Behandle konto
postChangeTwoStepAuthentication-how-protects-link = Hvordan dette beskytter kontoen din
postChangeTwoStepAuthentication-how-protects-plaintext = Hvordan dette beskytter kontoen din
postChangeTwoStepAuthentication-device-sign-out-message = For å beskytte alle tilkoblede enheter bør du logge ut overalt hvor du bruker denne kontoen, og deretter logge på igjen med den nye totrinnsautentiseringen din.
postConsumeRecoveryCode-title-3 = Reserve-autentiseringskoden din ble brukt til å bekrefte tilbakestilling av passord
# After the colon, there is description of the device that the backup authentication code was used on
# E.g., Firefox Nightly on Mac OSX, Thursday Sept 2, 2024
postConsumeRecoveryCode-description-3 = Kode brukt fra:
postConsumeRecoveryCode-action = Behandle konto
postConsumeRecoveryCode-subject-v3 = Reserve-autentiseringskode brukt
postConsumeRecoveryCode-preview = Kontroller at dette var deg
postNewRecoveryCodes-subject-2 = Nye reserve-autentiseringskoder opprettet
postNewRecoveryCodes-title-2 = Du opprettet nye reserve-autentiseringskoder
# After the colon, there is information about the device that the authentication codes were created on
postNewRecoveryCodes-description-2 = De ble opprettet på:
postNewRecoveryCodes-action = Behandle konto
postRemoveAccountRecovery-subject-2 = Kontogjenopprettingsnøkkel slettet
postRemoveAccountRecovery-title-3 = Du slettet din kontogjenopprettingsnøkkel
postRemoveAccountRecovery-body-part1 = Kontogjenopprettingsnøkkelen din kreves for å gjenopprette de krypterte nettleserdataene dine hvis du glemmer passordet ditt.
postRemoveAccountRecovery-body-part2 = Hvis du ikke allerede har gjort det, kan du opprette en ny kontogjenopprettingsnøkkel i kontoinnstillingene dine for å forhindre at du mister lagrede passord, bokmerker, nettleserhistorikk og mer.
postRemoveAccountRecovery-action = Behandle konto
postRemoveRecoveryPhone-subject = Gjenopprettingstelefonen er fjernet
postRemoveRecoveryPhone-preview = Konto beskyttet av totrinns-autentisering
postRemoveRecoveryPhone-title = Gjenopprettingstelefonen er fjernet
postRemoveRecoveryPhone-description-v2 = Telefonnummeret ditt for gjenoppretting er fjernet fra innstillingene for totrinns-autentisering.
postRemoveRecoveryPhone-description-extra = Du kan fortsatt bruke reserve-autentiseringskodene dine til å logge på hvis du ikke kan bruke autentiseringsappen din.
postRemoveRecoveryPhone-requested-device = Du ba om det fra:
postRemoveSecondary-subject = Sekundær e-postadesse fjernet
postRemoveSecondary-title = Sekundær e-postadesse fjernet
# Variables:
#  $secondaryEmail (String) - A user's email address
postRemoveSecondary-description-2 = Du har slettet { $secondaryEmail } som en sekundær e-postadresse fra din { -product-mozilla-account }. Sikkerhetsmeldinger og innloggingsbekreftelser vil ikke lenger bli leverte til denne adressen.
postRemoveSecondary-action = Behandle konto
postRemoveTwoStepAuthentication-subject-line-2 = Totrinns-autentisering er slått av
postRemoveTwoStepAuthentication-title-2 = Du har slått av totrinns-autentisering
# After the colon is a description of the device the user used to disable two-step authentication
postRemoveTwoStepAuthentication-from-device = Du har slått det av fra:
postRemoveTwoStepAuthentication-action = Behandle konto
postRemoveTwoStepAuthentication-not-required-2 = Du trenger ikke lenger sikkerhetskoder fra autentiseringsappen når du logger inn.
postSigninRecoveryCode-subject = Reserve-autentiseringskode brukt for å logge inn
postSigninRecoveryCode-preview = Bekreft kontoaktivitet
postSigninRecoveryCode-title = Reserve-autentiseringskoden din ble brukt for å logge inn
postSigninRecoveryCode-description = Hvis du ikke gjorde dette, bør du endre passordet ditt umiddelbart for å holde kontoen din trygg.
postSigninRecoveryCode-device = Du logget inn fra:
postSigninRecoveryCode-action = Behandle konto
postSigninRecoveryPhone-subject = Gjenopprettingstelefon brukt for å logge inn
postSigninRecoveryPhone-preview = Bekreft kontoaktivitet
postSigninRecoveryPhone-title = Gjenopprettingstelefonen din ble brukt for å logge inn
postSigninRecoveryPhone-description = Hvis du ikke gjorde dette, bør du endre passordet ditt umiddelbart for å holde kontoen din trygg.
postSigninRecoveryPhone-device = Du logget inn fra:
postSigninRecoveryPhone-action = Behandle konto
postVerify-sub-title-3 = Vi er glade for å se deg!
postVerify-title-2 = Vil du se den samme fanen på to enheter?
postVerify-description-2 = Det er lett! Installer bare { -brand-firefox } på en annen enhet og logg på for å synkronisere. Det er som magi!
postVerify-sub-description = (Psst… Det betyr også at du kan få bokmerker, passord og andre { -brand-firefox }-data overalt hvor du er logget inn.)
postVerify-subject-4 = Velkommen til { -brand-mozilla }!
postVerify-setup-2 = Koble til en annen enhet:
postVerify-action-2 = Koble til en annen enhet
postVerifySecondary-subject = Sekundær e-postadresse lagt til
postVerifySecondary-title = Sekundær e-postadresse lagt til
# Variables:
#  $secondaryEmail (String) - A user's secondary email address
postVerifySecondary-content-3 = Du har bekreftet { $secondaryEmail } som en sekundær e-postadresse for din { -product-mozilla-account }. Sikkerhetsmeldinger og innloggingsbekreftelser vil nå bli leverte til begge e-postadressene.
postVerifySecondary-action = Behandle konto
recovery-subject = Tilbakestill passord
recovery-title-2 = Glemt passord ditt?
# Information on the device, location, and date and time of the request that triggered the email follows.
recovery-request-origin-2 = Vi mottok en forespørsel om passordendring på din { -product-mozilla-account } fra:
recovery-new-password-button = Opprett et nytt passord ved å klikke på knappen nedenfor. Denne lenken vil utløpe innen den neste timen.
recovery-copy-paste = Opprett et nytt passord ved å kopiere og lime inn nettadressen nedenfor i nettleseren din. Denne lenken vil utløpe innen den neste timen.
recovery-action = Lag nytt passord
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountDeletion-subject = Ditt abonnement på { $productName } har blit avsluttet
subscriptionAccountDeletion-title = Det er synd at du sier opp abonnementet ditt
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $invoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
subscriptionAccountDeletion-content-cancelled-2 = Du har nylig slettet { -product-mozilla-account }-en din. Som et resultat har vi avsluttet ditt abonnement på { $productName }. Den endelige betalingen på { $invoiceTotal } ble betalt den { $invoiceDateOnly }.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountFinishSetup-subject = Velkommen til { $productName }: Velg et passord.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountFinishSetup-title = Velkommen til { $productName }
subscriptionAccountFinishSetup-content-processing = Betalingen din behandles og kan ta opptil fire virkedager å fullføre. Abonnementet ditt fornyes automatisk hver faktureringsperiode med mindre du velger å avslutte.
subscriptionAccountFinishSetup-content-create-3 = Deretter oppretter du et { -product-mozilla-account }-passord for å begynne å bruke ditt nye abonnement.
subscriptionAccountFinishSetup-action-2 = Kom i gang
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
subscriptionPaymentExpired-title-2 = Betalingsmetoden din har utløpt eller i ferd med å utløpe
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentExpired-content-2 = Betalingsmetoden du bruker for { $productName }, har utløpt eller er i ferd med å utløpe.
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
#   $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#   $planIntervalCount (String) - The interval count of subscription plan, e.g. 2
#   $planInterval (String) - The interval of time of the subscription plan, e.g. week
#   $reminderLength (String) - The number of days until the current subscription is set to automatically renew, e.g. 14
subscriptionRenewalReminder-content-current = Ditt nåværende abonnement er satt til å fornyes automatisk om { $reminderLength } dager. På det tidspunktet vil { -brand-mozilla } fornye abonnementet på { $planIntervalCount } { $planInterval }, og en kostnad på { $invoiceTotal } vil bli belastet betalingsmåten på kontoen din.
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
subscriptionsPaymentExpired-subject-2 = Betalingsmåten for abonnementene dine er utløpt eller utløper snart
subscriptionsPaymentExpired-title-2 = Betalingsmetoden din har utløpt eller i ferd med å utløpe
subscriptionsPaymentExpired-content-2 = Betalingsmåten du bruker for å utføre betalinger for følgende abonnementer, er utløpt eller utløper snart.
subscriptionsPaymentProviderCancelled-subject = Oppdatering av betalingsinformasjon kreves for { -brand-mozilla }-abonnementer
subscriptionsPaymentProviderCancelled-title = Beklager, vi har problemer med betalingsmåten din
subscriptionsPaymentProviderCancelled-content-detected = Vi har oppdaget et problem med betalingsmåten din for følgende abonnementer.
subscriptionsPaymentProviderCancelled-content-payment-1 = Det kan være at betalingsmåten din er utløpt, eller at den nåværende betalingsmåten din er utdatert.
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
# Variables:
#  $unblockCode (String) - The authorization code for sign-in
unblockCode-subject-2 = Bruk { $unblockCode } for å logge inn
unblockCode-preview = Denne koden utløper om én time
unblockCode-title = Er det du som logger inn?
unblockCode-prompt = Hvis ja, her er godkjenningskoden du trenger:
# Variables:
#  $unblockCode (String) - An alphanumeric code
unblockCode-prompt-plaintext = Hvis ja, her er godkjenningskoden du trenger: { $unblockCode }
unblockCode-report = Hvis nei, hjelp oss med å avverge inntrengere og <a data-l10n-name="reportSignInLink">rapporter dette til oss</a>.
unblockCode-report-plaintext = Hvis nei, hjelp oss med å avverge inntrengere og rapporter dette til oss.
verificationReminderFinal-subject = Siste påminnelse om å bekrefte kontoen din
verificationReminderFinal-description-2 = For et par uker siden opprettet du en { -product-mozilla-account }, men bekreftet den aldri. For din sikkerhet vil vi slette kontoen hvis den ikke bekreftes i løpet av de neste 24 timene.
confirm-account = Bekreft konto
confirm-account-plaintext = { confirm-account }:
verificationReminderFirst-subject-2 = Husk å bekrefte kontoen din
verificationReminderFirst-title-3 = Velkommen til { -brand-mozilla }!
verificationReminderFirst-description-3 = For noen dager siden opprettet du en { -product-mozilla-account }, men bekreftet den aldri. Bekreft kontoen din i løpet av de neste 15 dagene, ellers blir den automatisk slettet.
verificationReminderFirst-sub-description-3 = Gå ikke glipp av nettleseren som setter deg og personvernet ditt først.
confirm-email-2 = Bekreft konto
confirm-email-plaintext-2 = { confirm-email-2 }:
verificationReminderFirst-action-2 = Bekreft konto
verificationReminderSecond-subject-2 = Husk å bekrefte kontoen din
verificationReminderSecond-title-3 = Ikke gå glipp av { -brand-mozilla }!
verificationReminderSecond-description-4 = For noen dager siden opprettet du en { -product-mozilla-account }, men bekreftet den aldri. Bekreft kontoen din i løpet av de neste 10 dagene, ellers blir den automatisk slettet.
verificationReminderSecond-second-description-3 = Din { -product-mozilla-account } lar deg synkronisere { -brand-firefox }-opplevelsen din på tvers av enheter og låser opp tilgang til mer personvernbeskyttende produkter fra { -brand-mozilla }.
verificationReminderSecond-sub-description-2 = Bli en del av vårt oppdrag om å forvandle internett til et sted som er åpent for alle.
verificationReminderSecond-action-2 = Bekreft konto
verify-title-3 = Åpne internett med { -brand-mozilla }
verify-description-2 = Bekreft kontoen din og få mest mulig ut av { -brand-mozilla } overalt hvor du logger deg på, og start med:
verify-subject = Fullfør oppretting av kontoen din
verify-action-2 = Bekreft konto
# Variables:
# $code (String) - The verification code
verifyAccountChange-subject = Bruk { $code } for å endre kontoen din
# Variables:
# $expirationTime (Number) - Represents the expiration time in minutes
verifyAccountChange-preview =
    { $expirationTime ->
        [one] Denne koden utløper om { $expirationTime } minutt.
       *[other] Denne koden utløper om { $expirationTime } minutter.
    }
verifyAccountChange-title = Endrer du kontoinformasjonen din?
# After the colon is a description of the device used to sign in to the service
verifyAccountChange-safe = Hjelp oss med å holde kontoen din trygg ved å godkjenne denne endringen på:
verifyAccountChange-prompt = Hvis ja, her er autorisasjonskoden din:
# Variables:
# $expirationTime (Number) - Represents the expiration time in minutes
verifyAccountChange-expiry-notice =
    { $expirationTime ->
        [one] Den utløper om { $expirationTime } minutt.
       *[other] Den utløper om { $expirationTime } minutter.
    }
# Variables:
#  $clientName (String) - A client the user hasn't signed into before (e.g. Firefox, Sync)
verifyLogin-title-2 = Logget du inn på { $clientName }?
verifyLogin-description-2 = Hjelp oss med å holde kontoen din trygg ved å bekrefte at du er logget inn på:
verifyLogin-subject-2 = Bekreft innlogging
verifyLogin-action = Bekreft innlogging
# Variables:
#  $code (String) - The confirmation code for sign-in
verifyLoginCode-subject-line-3 = Bruk { $code } for å logge inn
verifyLoginCode-preview = Denne koden utløper om 5 minutter.
# Variables:
#  $serviceName (String) - A service the user hasn't signed into before (e.g. Firefox)
verifyLoginCode-title-2 = Logget du inn på { $serviceName }?
# After the colon is a description of the device used to sign in to the service
verifyLoginCode-safe = Hjelp oss med å holde kontoen din trygg ved å godkjenne innloggingen din på:
verifyLoginCode-prompt-3 = Hvis ja, her er autorisasjonskoden din:
verifyLoginCode-expiry-notice = Den løper ut om 5 minutter.
verifyPrimary-title-2 = Bekreft primær e-postadresse
verifyPrimary-description = En forespørsel om å utføre en kontoendring er gjort fra følgende enhet:
verifyPrimary-subject = Bekreft primær e-postadresse
verifyPrimary-action-2 = Bekreft e-postadresse
verifyPrimary-action-plaintext-2 = { verifyPrimary-action-2 }:
verifyPrimary-post-verify-2 = Når bekreftet, vil endringer i kontoen som å legge til en sekundær e-post, bli mulig fra denne enheten.
# Variables:
#  $code (String) - The confirmation code for secondary email
verifySecondaryCode-subject-2 = Bruk { $code } for å bekrefte din sekundære e-postadresse
verifySecondaryCode-preview = Denne koden utløper om 5 minutter.
verifySecondaryCode-title-2 = Bekreft sekundær e-postadresse
verifySecondaryCode-action-2 = Bekreft e-postadressen
# Variables:
#  $email (string) A user's unverified secondary email address
verifySecondaryCode-explainer-2 = En forespørsel om å bruke { $email } som en sekundær e-postadresse er gjort fra følgende { -product-mozilla-account }:
verifySecondaryCode-prompt-2 = Bruk denne bekreftelseskoden:
verifySecondaryCode-expiry-notice-2 = Den utløper om 5 minutter. Når e-postadressen er bekreftet, vil den begynne å motta sikkerhetsvarsler og bekreftelser.
# Variables:
#  $code (String) - comfirmation code for the account
verifyShortCode-subject-4 = Bruk { $code } for å bekrefte kontoen din
verifyShortCode-preview-2 = Denne koden utløper om 5 minutter
verifyShortCode-title-3 = Åpne internett med { -brand-mozilla }
# Information on the browser and device triggering this confirmation email follows below this string.
verifyShortCode-title-subtext-2 = Bekreft kontoen din og få mest mulig ut av { -brand-mozilla } overalt hvor du logger deg på, og start med:
verifyShortCode-prompt-3 = Bruk denne bekreftelseskoden:
verifyShortCode-expiry-notice = Den løper ut om 5 minutter.
