## Non-email strings

session-verify-send-push-title-2 = Oletko kirjautumassa { -product-mozilla-account }-tilillesi?
session-verify-send-push-body-2 = Napsauta tästä vahvistaaksesi, että se olet sinä
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to verify phone ownership when registering a recovery phone
recovery-phone-setup-sms-body = { $code } on { -brand-mozilla }-vahvistuskoodisi. Vanhenee viidessä minuutissa.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to verify phone ownership when registering a recovery phone
recovery-phone-setup-sms-short-body = { -brand-mozilla }-vahvistuskoodi: { $code }
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for two-step authentication
recovery-phone-signin-sms-body = { $code } on { -brand-mozilla }-palautuskoodisi. Vanhenee viidessä minuutissa.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for two-step authentication
recovery-phone-signin-sms-short-body = { -brand-mozilla }-koodi: { $code }
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for account password reset
recovery-phone-reset-password-sms-body = { $code } on { -brand-mozilla }-palautuskoodisi. Vanhenee viidessä minuutissa.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for account password reset
recovery-phone-reset-password-short-body = { -brand-mozilla }-koodi: { $code }

## Email content
## Emails do not contain buttons, only links. Emails have a rich HTML version and a plaintext
## version. The strings are usually identical but sometimes they differ slightly.

fxa-header-mozilla-logo = <img data-l10n-name="mozilla-logo" alt="{ -brand-mozilla }n logo">
fxa-header-sync-devices-image = <img data-l10n-name="sync-devices-image" alt="Synkronoi laitteet">
body-devices-image = <img data-l10n-name="devices-image" alt="Laitteet">
fxa-privacy-url = { -brand-mozilla }n tietosuojakäytäntö
moz-accounts-privacy-url-2 = { -product-mozilla-accounts(capitalization: "uppercase") } - tietosuojakäytäntö
moz-accounts-terms-url = { -product-mozilla-accounts(capitalization: "uppercase") } -käyttöehdot
subplat-header-mozilla-logo-2 = <img data-l10n-name="subplat-mozilla-logo" alt="{ -brand-mozilla }n logo">
subplat-footer-mozilla-logo-2 = <img data-l10n-name="mozilla-logo-footer" alt="{ -brand-mozilla }n logo">
subplat-automated-email = Tämä on automaattisesti lähetetty viesti. Jos sait sen vahingossa, sinun ei tarvitse tehdä mitään.
subplat-privacy-notice = Tietosuojakäytäntö
subplat-privacy-plaintext = Tietosuojaseloste:
subplat-update-billing-plaintext = { subplat-update-billing }:
# Variables:
#  $email (String) - A user's primary email address
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subplat-explainer-specific-2 = Saat tämän viestin, koska sähköpostiosoitteella { $email } on { -product-mozilla-account } ja olet rekisteröitynyt palveluun { $productName }.
# Variables:
#  $email (String) - A user's primary email address
subplat-explainer-reminder-form-2 = Saat tämän viestin, koska sähköpostiosoitteella { $email } on { -product-mozilla-account }.
subplat-explainer-multiple-2 = Saat tämän viestin, koska sähköpostiosoitteella { $email } on { -product-mozilla-account } ja sinulla on useiden tuotteiden tilauksia.
subplat-explainer-was-deleted-2 = Saat tämän viestin, koska sähköpostiosoitteella { $email } rekisteröitiin { -product-mozilla-account }.
subplat-manage-account-2 = Hallinnoi { -product-mozilla-account }n asetuksia <a data-l10n-name="subplat-account-page">tilisivullasi</a>.
# Variables:
#  $accountSettingsUrl (String) - URL to Account Settings
subplat-manage-account-plaintext-2 = Hallinnoi { -product-mozilla-account }n asetuksia käymällä tilisivullasi: { $accountSettingsUrl }
subplat-terms-policy = Käyttöehdot ja peruutuskäytäntö
subplat-terms-policy-plaintext = { subplat-terms-policy }:
subplat-cancel = Peru tilaus
subplat-cancel-plaintext = { subplat-cancel }:
subplat-reactivate = Aktivoi tilaus uudelleen
subplat-reactivate-plaintext = { subplat-reactivate }:
subplat-update-billing = Päivitä laskutustiedot
subplat-privacy-policy = { -brand-mozilla }n tietosuojakäytäntö
subplat-privacy-policy-2 = { -product-mozilla-accounts(capitalization: "uppercase") } - tietosuojakäytäntö
subplat-privacy-policy-plaintext = { subplat-privacy-policy }:
subplat-privacy-policy-plaintext-2 = { subplat-privacy-policy-2 }:
subplat-moz-terms = { -product-mozilla-accounts(capitalization: "uppercase") } -käyttöehdot
subplat-moz-terms-plaintext = { subplat-moz-terms }:
subplat-legal = Lakiasiat
subplat-legal-plaintext = { subplat-legal }:
subplat-privacy = Tietosuoja
subplat-privacy-website-plaintext = { subplat-privacy }:
account-deletion-info-block-communications = Jos tilisi poistetaan, saat edelleen sähköposteja Mozilla Corporationilta ja Mozilla Foundationilta, ellet <a data-l10n-name="unsubscribeLink">pyydä tilauksen peruuttamista</a>.
account-deletion-info-block-support = Jos sinulla on kysyttävää tai tarvitset apua, ota rohkeasti yhteyttä <a data-l10n-name="supportLink">tukitiimiimme</a>.
account-deletion-info-block-communications-plaintext = Jos tilisi poistetaan, saat edelleen sähköposteja Mozilla Corporationilta ja Mozilla Foundationilta, ellet pyydä tilauksen peruuttamista:
account-deletion-info-block-support-plaintext = Jos sinulla on kysyttävää tai tarvitset apua, ota rohkeasti yhteyttä tukitiimiimme:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
body-android-badge = <img data-l10n-name="google-play-badge" alt="Lataa { $productName } { -google-play }sta">
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
body-ios-badge = <img data-l10n-name="apple-app-badge" alt="Lataa { $productName } { -app-store }sta">
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-desktop-device-2 = Asenna { $productName } <a data-l10n-name="anotherDeviceLink">toiselle työpöytälaitteelle</a>.
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-device-2 = Asenna { $productName } <a data-l10n-name="anotherDeviceLink">toiselle laitteelle</a>.
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
android-download-plaintext = Hanki { $productName } Google Playsta:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
ios-download-plaintext = Lataa { $productName } App Storesta:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-device-plaintext = Asenna { $productName } toiselle laitteelle:
automated-email-change-2 = Jos et tehnyt tätä, <a data-l10n-name="passwordChangeLink">vaihda salasanasi</a> heti.
automated-email-support = Lisätietoja saat <a data-l10n-name="supportLink">{ -brand-mozilla }-tuesta</a>.
# After the colon, there's a link to https://accounts.firefox.com/settings/change_password
automated-email-change-plaintext-2 = Jos et tehnyt tätä, vaihda salasanasi heti:
#  After the colon, there's a link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
automated-email-support-plaintext = Lisätietoja saat { -brand-mozilla }-tuesta:
automated-email-inactive-account = Tämä on automaattinen sähköposti. Saat sen, koska sinulla on { -product-mozilla-account } ja edellisestä kirjautumisestasi on kulunut kaksi vuotta.
# supportLink - https://support.mozilla.org/kb/im-having-problems-my-firefox-account
automated-email-no-action = { automated-email-no-action-plaintext } Lisätietoja saat <a data-l10n-name="supportLink">{ -brand-mozilla }-tuesta</a>.
automated-email-no-action-plaintext = Tämä on automaattinen sähköposti. Jos sait sen vahingossa, sinun ei tarvitse tehdä mitään.
#  After the colon, there's a link to https://accounts.firefox.com/settings/change_password
automated-email-not-authorized-plaintext = Tämä on automaattinen sähköpostiviesti; Jos et valtuuttanut tätä toimintoa, vaihda salasanasi:
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
# - $uaOS: the user agent's operating system (e.g, MacOS)
# - $uaOSVersion - the user agent's operating system version
automatedEmailRecoveryKey-origin-device-all = Pyyntö lähetettiin selaimella { $uaBrowser } käyttöjärjestelmästä { $uaOS } { $uaOSVersion }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
# - $uaOS: the user agent's operating system (e.g, MacOS)
automatedEmailRecoveryKey-origin-device-browser-os = Pyyntö lähetettiin selaimesta { $uaBrowser } käyttöjärjestelmällä { $uaOS }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
automatedEmailRecoveryKey-origin-device-browser-only = Pyyntö lähetettiin selaimesta { $uaBrowser }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaOS: the user agent's operating system (e.g, MacOS)
# - $uaOSVersion - the user agent's operating system version
automatedEmailRecoveryKey-origin-device-OS-version-only = Pyyntö lähetettiin käyttöjärjestelmästä { $uaOS } { $uaOSVersion }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaOS: the user agent's operating system (e.g, MacOS)
automatedEmailRecoveryKey-origin-device-OS-only = Pyyntö lähetettiin käyttöjärjestelmästä { $uaOS }.
automatedEmailRecoveryKey-delete-key-change-pwd = Jos et ollut sinä, <a data-l10n-name="revokeAccountRecoveryLink">poista uusi avain</a> ja <a data-l10n-name="passwordChangeLink">vaihda salasanasi</a>.
automatedEmailRecoveryKey-change-pwd-only = Jos et ollut sinä, <a data-l10n-name="passwordChangeLink">vaihda salasanasi</a>.
automatedEmailRecoveryKey-more-info = Lisätietoja saat <a data-l10n-name="supportLink">{ -brand-mozilla }-tuesta</a>.
# Colon is followed by user device info on a separate line (e.g., "Firefox Nightly on Mac OSX 10.11")
automatedEmailRecoveryKey-origin-plaintext = Pyynnön lähde:
# Colon is followed by a URL to the account recovery key section of account settings
automatedEmailRecoveryKey-notyou-delete-key-plaintext = Jos et ollut sinä, poista uusi avain:
# Colon is followed by a URL to the change password section of account settings
automatedEmailRecoveryKey-notyou-change-pwd-only-plaintext = Jos et ollut sinä, vaihda salasanasi:
# This string is shown on its own line, after automatedEmailRecoveryKey-notyou-delete-key-plaintext and its URL
# Colon is followed by a URL to the change password section of account settings
automatedEmailRecoveryKey-notyou-change-pwd-plaintext = ja vaihda salasanasi:
# Colon is followed by a URL to Mozilla Support's "I'm having problems with my account" page
automatedEmailRecoveryKey-more-info-plaintext = Lisätietoja saat { -brand-mozilla }-tuesta:
automated-email-reset =
    Tämä on automaattisesti lähetetty viesti. Jos et valtuuttanut tätä toimintoa, <a data-l10n-name="resetLink">vaihda salasanasi</a>.
    Lisätietoja saat <a data-l10n-name="supportLink">{ -brand-mozilla }n tuesta</a>.
# Variables:
#  $resetLink (String) - Link to https://accounts.firefox.com/reset_password
automated-email-reset-plaintext-v2 = Jos et valtuuttanut tätä toimintoa, vaihda salasanasi nyt osoitteessa { $resetLink }
brand-banner-message = Tiesitkö, että { -product-firefox-accounts } nimettiin uudelleen, ja uusi nimi on { -product-mozilla-accounts }? <a data-l10n-name="learnMore">Lisätietoja</a>
cancellationSurvey = Auta parantamaan palveluitamme <a data-l10n-name="cancellationSurveyUrl">vastaamalla kyselyyn</a>.
# After the colon, there's a link to https://survey.alchemer.com/s3/6534408/Privacy-Security-Product-Cancellation-of-Service-Q4-21
cancellationSurvey-plaintext = Auta meitä parantamaan palveluitamme täyttämällä lyhyt kysely:
change-password-plaintext = Jos epäilet, että joku yrittää murtautua tilillesi, vaihda salasanasi.
manage-account = Hallinnoi tiliä
manage-account-plaintext = { manage-account }:
payment-details = Maksun tiedot:
# Variables:
#  $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
payment-plan-invoice-number = Laskun numero: { $invoiceNumber }
# Variables:
#  $invoiceDateOnly (String) - The date of the invoice, e.g. 01/20/2016
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
payment-plan-charged = Veloitettu: { $invoiceTotal } { $invoiceDateOnly }
# Variables
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
payment-plan-next-invoice = Seuraava lasku: { $nextInvoiceDateOnly }

## $paymentProviderName (String) - The brand name of the payment method, e.g. PayPal, Apple Pay, Google Pay, Link

payment-method-payment-provider = <b>Maksutapa:</b> { $paymentProviderName }
payment-method-payment-provider-plaintext = Maksutapa: { $paymentProviderName }

## This string displays when the type of credit card is known
## https://stripe.com/docs/payments/cards/supported-card-brands
## Variables:
##  $cardName (String) - The brand name of the credit card, e.g. American Express
##  $lastFour (String) - The last four digits of the credit card, e.g. 5309

payment-provider-card-name-ending-in-plaintext = Maksutapa: { $cardName } päättyy numeroihin { $lastFour }
payment-provider-card-ending-in-plaintext = Maksutapa: Kortti, joka päättyy numeroihin { $lastFour }
payment-provider-card-ending-in = <b>Maksutapa:</b> Kortti, joka päättyy numeroihin { $lastFour }
payment-provider-card-ending-in-card-name = <b>Maksutapa:</b> { $cardName } päättyen numeroihin { $lastFour }
subscription-charges-invoice-summary = Laskun yhteenveto

# Variables:


## $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
## $invoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025

subscription-charges-invoice-number = <b>Laskun numero:</b> { $invoiceNumber }
subscription-charges-invoice-number-plaintext = Laskun numero: { $invoiceNumber }
subscription-charges-invoice-date = <b>Päivämäärä:</b> { $invoiceDateOnly }
subscription-charges-invoice-date-plaintext = Päivämäärä: { $invoiceDateOnly }
subscription-charges-list-price = Listahinta
# $offeringPrice (String) - The list price of the subscription offering, including currency, e.g. $10.00
subscription-charges-list-price-plaintext = Listahinta: { $offeringPrice }
subscription-charges-credit-from-unused-time = Hyvitys käyttämättömästä ajasta
# $unusedAmountTotal (String) - The credit amount from unused time of the subscription invoice, including currency, e.g. $2.00
subscription-charges-credit-from-unused-time-plaintext = Hyvitys käyttämättömästä ajasta: { $unusedAmountTotal }
subscription-charges-subtotal = <b>Välisumma</b>
# $invoiceSubtotal (String) - The amount, before discount, of the subscription invoice, including currency, e.g. $10.00
subscriptionFirstInvoiceDiscount-content-subtotal = Välisumma: { $invoiceSubtotal }

## $invoiceDiscountAmount (String) - The amount of the discount of the subscription invoice, including currency, e.g. $2.00
## $discountDuration - The duration of the discount in number of months, e.g. "3" if the discount is 3-months

subscription-charges-one-time-discount = Kertaluonteinen alennus
subscription-charges-one-time-discount-plaintext = Kertaluonteinen alennus: { $invoiceDiscountAmount }
subscription-charges-discount = Alennus
subscription-charges-discount-plaintext = Alennus: { $invoiceDiscountAmount }
subscription-charges-taxes = Verot ja maksut
# $invoiceTaxAmount (String) - The amount of the tax of the subscription invoice, including currency, e.g. $2.00
subscriptionCharges-content-tax-plaintext = Verot ja maksut: { $invoiceTaxAmount }
subscription-charges-total = <b>Yhteensä</b>
# $invoiceTotal (String) - The total amount of the subscription invoice, including currency, e.g. $10.00
subscription-charges-total-plaintext = Yhteensä: { $invoiceTotal }
subscription-charges-credit-applied = Hyvitys käytetty
# $creditApplied (String) - The amount of credit applied to the subscription invoice, including currency, e.g. $2.00
subscription-charges-credit-applied-plaintext = Hyvitys käytetty: { $creditApplied }
subscription-charges-amount-paid = <b>Maksettu summa</b>
# $invoiceAmountDue (String) - The total that the customer owes after all credits, discounts, and taxes have been applied, including currency, e.g. $8.00
subscription-charges-amount-paid-plaintext = Maksettu summa: { $invoiceAmountDue }

##

subscriptionSupport = Kysymyksiä tilaukseesi liittyen? <a data-l10n-name="subscriptionSupportUrl">Tukitiimimme</a> auttaa sinua.
# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupport-plaintext = Kysymyksiä tilaukseesi liittyen? Tukitiimimme auttaa sinua:
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSupportContact = Kiitos, että tilasit { $productName }:n. Jos sinulla on kysymyksiä tilaukseen liittyen tai tarvitset lisätietoja { $productName }:stä, <a data-l10n-name="subscriptionSupportUrl">ota yhteys meihin</a>.
# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupportContact-plaintext = Kiitos, että tilasit { $productName }:n. Jos sinulla on kysymyksiä tilaukseen liittyen tai tarvitset lisätietoja { $productName }:stä, ota yhteys meihin:
subscription-support-manage-your-subscription = <a data-l10n-name="manageSubscriptionUrl">Hallitse tilaustasi</a>
# After the colon, there's a link to https://payments.firefox.com/subscriptions
subscription-support-manage-your-subscription-plaintext = Hallitse tilaustasi:
subscription-support-contact-support = <a data-l10n-name="subscriptionSupportUrl">Ota yhteys tukeen</a>
# After the colon, there's a link to https://support.mozilla.com/products
subscription-support-contact-support-plaintext = Ota yhteys tukeen:
subscriptionUpdateBillingEnsure = Voit varmistaa, että maksutapasi ja tilitietosi ovat ajan tasalla <a data-l10n-name="updateBillingUrl">täällä</a>.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdateBillingEnsure-plaintext = Voit varmistaa, että maksutapa- ja tilitiedot ovat ajan tasalla:
subscriptionUpdateBillingTry = Kokeilemme suorittaa veloituksen uudelleen tulevien päivien aikana, mutta sinun on mahdollisesti autettava meitä korjaamaan ongelma <a data-l10n-name="updateBillingUrl">päivittämällä maksutietosi</a>.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdateBillingTry-plaintext = Kokeilemme suorittaa veloituksen uudelleen tulevien päivien aikana, mutta sinun on mahdollisesti autettava meitä korjaamaan ongelma päivittämällä maksutietosi:
subscriptionUpdatePayment = Estääksesi palvelun käytön häiriintymisen, <a data-l10n-name="updateBillingUrl">päivitä maksutietosi</a> mahdollisimman pian.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdatePayment-plaintext = Päivitä maksutietosi mahdollisimman pian, jotta palvelusi ei keskeydy:
# Variables:
#  $uaBrowser (String) - User's browser, e.g. Firefox
#  $uaOS (String) - User's OS, e.g. Mac OSX
#  $uaOSVersion (String) - User's OS version, e.g. 10.11
device-all = Selain { $uaBrowser } käyttöjärjestelmällä { $uaOS } { $uaOSVersion }
# Variables:
#  $uaBrowser (String) - User's browser, e.g. Firefox
#  $uaOS (String) - User's OS, e.g. Mac OSX
device-browser-os = Selain { $uaBrowser } käyttöjärjestelmällä { $uaOS }
# Variables:
#  $city (String) - User's city
#  $stateCode (String) - User's state
#  $country (String) - User's country
location-all = { $city }, { $stateCode }, { $country } (arvio)
# Variables:
#  $city (String) - User's city
#  $country (String) - User's country
location-city-country = { $city }, { $country } (arvio)
# Variables:
#  $stateCode (String) - User's state
#  $country (String) - User's country
location-state-country = { $stateCode }, { $country } (arvio)
# Variables:
#  $country (stateCode) - User's country
location-country = { $country } (arvio)
view-invoice-link-action = Näytä lasku
# Variables:
#  $invoiceLink (String) - The link to the invoice
# After the colon, there's a link to https://pay.stripe.com/
view-invoice-plaintext = Näytä lasku: { $invoiceLink }
cadReminderFirst-subject-1 = Muistutus! Synkronoidaan { -brand-firefox }
cadReminderFirst-action = Synkronoi toinen laite
cadReminderFirst-action-plaintext = { cadReminderFirst-action }:
# In the title of the email, "It takes two to sync", "two" refers to syncing two devices
cadReminderFirst-title-1 = Synkronointi vaatii kaksi
cadReminderFirst-description-v2 = Käytä välilehtiäsi kaikilla laitteillasi. Varmista pääsy kirjanmerkkeihin, salasanoihin ja muihin tietoihin kaikkialla, missä käytät { -brand-firefox }ia.
cadReminderSecond-subject-2 = Viimeistellään synkronoinnin määritys
cadReminderSecond-action = Synkronoi toinen laite
cadReminderSecond-title-2 = Älä unohda synkronoida!
cadReminderSecond-description-sync = Synkronoi kirjanmerkit, salasanat, avoimet välilehdet ja paljon muuta — missä tahansa käytät { -brand-firefox }ia.
cadReminderSecond-description-plus = Lisäksi tietosi ovat aina salattuja. Vain sinä ja hyväksymäsi laitteet näkevät tietosi.
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-subject = Tervetuloa, käytössäsi on { $productName }
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-title = Tervetuloa, käytössäsi on { $productName }
downloadSubscription-content-2 = Aloitetaan kaikkien tilauksesi ominaisuuksien käyttö:
downloadSubscription-link-action-2 = Aloitetaan
fraudulentAccountDeletion-subject-2 = { -product-mozilla-account }si poistettiin
fraudulentAccountDeletion-title = Tilisi poistettiin
fraudulentAccountDeletion-content-part1-v2 = Äskettäin { -product-mozilla-account } luotiin ja siihen liittyvä tilaus veloitettiin tällä sähköpostiosoitteella. Kuten kaikkien uusien tilien kohdalla, pyysimme sinua vahvistamaan tilisi vahvistamalla ensin tämän sähköpostiosoitteen.
fraudulentAccountDeletion-content-part2-v2 = Tällä hetkellä näemme, että tiliä ei koskaan vahvistettu. Koska tätä vaihetta ei suoritettu loppuun, emme ole varmoja, oliko tämä valtuutettu tilaus. Tämän seurauksena tähän sähköpostiosoitteeseen rekisteröity { -product-mozilla-account } poistettiin, tilauksesi peruttiin ja kaikki kulut palautettiin.
fraudulentAccountDeletion-contact = Jos sinulla on kysyttävää, ota yhteys <a data-l10n-name="mozillaSupportUrl">tukitiimiimme</a>.
# Variables:
#  $mozillaSupportUrl (String) - Link to https://support.mozilla.org
fraudulentAccountDeletion-contact-plaintext = Jos sinulla on kysyttävää, ota yhteys tukitiimiimme: { $mozillaSupportUrl }
inactiveAccountFinalWarning-subject = Viimeinen mahdollisuus säilyttää { -product-mozilla-account }
inactiveAccountFinalWarning-title = { -brand-mozilla }-tilisi ja tietosi poistetaan
inactiveAccountFinalWarning-preview = Kirjaudu sisään säilyttääksesi tilisi
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
# This date will already be formatted with moment.js into Thursday, Jan 9, 2025 format
inactiveAccountFinalWarning-impact = <strong>{ $deletionDate }</strong> tilisi ja henkilökohtaiset tietosi poistetaan pysyvästi, ellet kirjaudu sisään.
inactiveAccountFinalWarning-action = Kirjaudu sisään säilyttääksesi tilisi
# followed by link to sign in
inactiveAccountFinalWarning-action-plaintext = Kirjaudu sisään säilyttääksesi tilisi:
inactiveAccountFirstWarning-subject = Älä menetä tiliäsi
inactiveAccountFirstWarning-title = Haluatko säilyttää { -brand-mozilla }-tilisi ja tietosi?
inactiveAccountFirstWarning-inactive-status = Huomasimme, että et ole kirjautunut sisään kahteen vuoteen.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
# This date will already be formatted with moment.js into Thursday, Jan 9, 2025 format
inactiveAccountFirstWarning-impact = Tilisi ja henkilökohtaiset tietosi poistetaan pysyvästi <strong>{ $deletionDate }</strong>, koska et ole ollut aktiivinen.
inactiveAccountFirstWarning-action = Kirjaudu sisään säilyttääksesi tilisi
inactiveAccountFirstWarning-preview = Kirjaudu sisään säilyttääksesi tilisi
# followed by link to sign in
inactiveAccountFirstWarning-action-plaintext = Kirjaudu sisään säilyttääksesi tilisi:
inactiveAccountSecondWarning-subject = Toimenpiteitä vaaditaan: Tilin poistoon 7 päivää
inactiveAccountSecondWarning-title = { -brand-mozilla }-tilisi ja sen tiedot poistetaan 7 päivän kuluessa
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
inactiveAccountSecondWarning-impact = Tilisi ja henkilökohtaiset tietosi poistetaan pysyvästi <strong>{ $deletionDate }</strong>, koska et ole ollut aktiivinen.
inactiveAccountSecondWarning-action = Kirjaudu sisään säilyttääksesi tilisi
inactiveAccountSecondWarning-preview = Kirjaudu sisään säilyttääksesi tilisi
# followed by link to sign in
inactiveAccountSecondWarning-action-plaintext = Kirjaudu sisään säilyttääksesi tilisi:
# The user has a low number of valid recovery codes remaining for use
codes-reminder-title-zero = Varatodennuskoodit ovat loppuneet!
codes-reminder-title-one = Käytät viimeistä varatodennuskoodiasi
codes-reminder-title-two = Aika luoda lisää varatodennuskoodeja
codes-reminder-description-part-one = Varatodennuskoodien avulla voit palauttaa tietosi, kun unohdat salasanasi.
codes-reminder-description-part-two = Luo uudet koodit nyt, jotta et menetä tietojasi myöhemmin.
codes-reminder-description-two-left = Sinulla on vain kaksi koodia jäljellä.
codes-reminder-description-create-codes = Luo uudet varatodennuskoodit, joiden avulla pääset takaisin tilillesi, jos se on lukittu tai salasana unohtunut.
lowRecoveryCodes-action-2 = Luo koodeja
codes-create-plaintext = { lowRecoveryCodes-action-2 }:
lowRecoveryCodes-subject-2 =
    { $numberRemaining ->
        [0] Varatodennuskoodeja ei ole jäljellä
        [one] Vain 1 varatodennuskoodi jäljellä
       *[other] Vain { $numberRemaining } varatodennuskoodia jäljellä!
    }
# Variables:
# $clientName (String) - A client the user hasn't signed into before (e.g. Firefox, Sync)
newDeviceLogin-subject = Uusi kirjautuminen: { $clientName }
newDeviceLogin-subjectForMozillaAccount = Uusi kirjautuminen { -product-mozilla-account }llesi
newDeviceLogin-title-3 = { -product-mozilla-account }äsi käytettiin sisäänkirjautumiseen
# The "Not you?" question is asking whether the recipient of the email is the
# person who performed the action that triggered the email.
newDeviceLogin-change-password = Etkö se ollut sinä? <a data-l10n-name="passwordChangeLink">Vaihda salasanasi</a>.
# The "Not you?" question is asking whether the recipient of the email is the
# person who performed the action that triggered the email.
newDeviceLogin-change-password-plain = Etkö se ollut sinä? Vaihda salasanasi:
newDeviceLogin-action = Hallinnoi tiliä
passwordChanged-subject = Salasana päivitetty
passwordChanged-title = Salasanan vaihtaminen onnistui
passwordChanged-description-2 = { -product-mozilla-account }si salasanasi vaihdettiin onnistuneesti seuraavalta laitteelta:
passwordChangeRequired-subject = Epäilyttävää toimintaa havaittu
passwordChangeRequired-preview = Vaihda salasanasi välittömästi
passwordChangeRequired-action = Nollaa salasana
passwordChangeRequired-action-plaintext = { passwordChangeRequired-action }:
password-forgot-otp-preview = Tämä koodi vanhenee 10 minuutissa
password-forgot-otp-title = Unohditko salasanasi?
password-forgot-otp-request = Saimme { -product-mozilla-account }n salasanan vaihtopyynnön lähteestä:
password-forgot-otp-code-2 = Jos se olit sinä, tässä on vahvistuskoodi jatkaaksesi:
password-forgot-otp-expiry-notice = Tämä koodi vanhenee 10 minuutissa.
passwordReset-subject-2 = Salasanasi on nollattu
passwordReset-title-2 = Salasanasi on nollattu
# This sentence is followed by information about the device and time of the password reset
passwordReset-description-2 = Nollasit { -product-mozilla-account }-salasanasi:
passwordResetAccountRecovery-subject-2 = Salasanasi on nollattu
passwordResetAccountRecovery-title-3 = Salasanasi on nollattu
# Followed by details on the device, location, and date/time of the password reset.
passwordResetAccountRecovery-description-3 = Käytit tilin palautusavainta { -product-mozilla-account }-salasanan nollaamiseen:
passwordResetAccountRecovery-information = Kirjasimme sinut ulos kaikista synkronoiduista laitteistasi. Loimme uuden tilin palautusavaimen korvaamaan käyttämäsi. Voit vaihtaa sen tilisi asetuksista.
# After the colon there is a link to account settings
passwordResetAccountRecovery-information-txt = Kirjasimme sinut ulos kaikista synkronoiduista laitteistasi. Loimme uuden tilin palautusavaimen korvaamaan käyttämäsi. Voit vaihtaa sen tilisi asetuksista:
passwordResetAccountRecovery-action-4 = Hallinnoi tiliä
passwordResetRecoveryPhone-action = Hallinnoi tiliä
passwordResetWithRecoveryKeyPrompt-subject = Salasanasi on nollattu
passwordResetWithRecoveryKeyPrompt-title = Salasanasi on nollattu
# Details of the device and date/time where the password was reset
passwordResetWithRecoveryKeyPrompt-description = Nollasit { -product-mozilla-account }-salasanasi:
# Text for button action to create a new account recovery key
passwordResetWithRecoveryKeyPrompt-action = Luo tilin palautusavain
# colon is followed by a link to create an account recovery key from the account settings page
passwordResetWithRecoveryKeyPrompt-action-txt = Luo tilin palautusavain:
passwordResetWithRecoveryKeyPrompt-cta-description = Sinun on kirjauduttava uudelleen sisään kaikilla synkronoiduilla laitteillasi. Pidä tietosi turvassa seuraavan kerran tilin palautusavaimella. Sen avulla voit palauttaa tietosi, jos unohdat salasanasi.
postAddAccountRecovery-subject-3 = Uusi tilin palautusavain luotu
postAddAccountRecovery-title2 = Loit uuden tilin palautusavaimen
# Key here refers to account recovery key
postAddAccountRecovery-body-part1 = Tallenna tämä avain turvalliseen paikkaan – tarvitset sitä salattujen selaustietojesi palauttamiseen, jos unohdat salasanasi.
# Key here refers to account recovery key
postAddAccountRecovery-body-part2 = Tätä avainta on mahdollista käyttää vain kerran. Kun olet käyttänyt sen, luomme sinulle automaattisesti uuden avaimen. Tai voit luoda uuden avaimen milloin tahansa tilisi asetuksista.
postAddAccountRecovery-action = Hallinnoi tiliä
postAddLinkedAccount-subject-2 = Uusi tili yhdistetty { -product-mozilla-account }isi
#  Variables:
#  $providerName (String) - The name of the provider, e.g. Apple, Google
postAddLinkedAccount-title-2 = { $providerName }-tilisi on linkitetty { -product-mozilla-account }in
postAddLinkedAccount-action = Hallinnoi tiliä
postAddRecoveryPhone-subject = Palauttamisen puhelinnumero lisätty
postAddRecoveryPhone-preview = Tili suojattu kaksivaiheisella todennuksella
postAddRecoveryPhone-title-v2 = Lisäsit palauttamisen puhelinnumeron
postAddRecoveryPhone-action = Hallinnoi tiliä
postAddTwoStepAuthentication-preview = Tilisi on suojattu
postAddTwoStepAuthentication-subject-v3 = Kaksivaiheinen todennus on käytössä
postAddTwoStepAuthentication-title-2 = Otit kaksivaiheisen todennuksen käyttöön
postAddTwoStepAuthentication-action = Hallinnoi tiliä
postChangeAccountRecovery-subject = Tilin palautusavain vaihdettu
postChangeAccountRecovery-title = Vaihdoit tilisi palautusavaimen
postChangeAccountRecovery-body-part1 = Sinulla on nyt uusi tilin palautusavain. Edellinen avaimesi poistettiin.
postChangeAccountRecovery-body-part2 = Tallenna tämä uusi avain turvalliseen paikkaan – tarvitset sitä salattujen selaustietojesi palauttamiseen, jos unohdat salasanasi.
postChangeAccountRecovery-action = Hallitse tiliä
postChangePrimary-subject = Ensisijainen sähköpostiosoite päivitetty
postChangePrimary-title = Uusi ensisijainen sähköposti
# Variables:
#  $email (String) - A user's email address
postChangePrimary-description-2 = Olet vaihtanut ensisijaiseksi sähköpostiosoitteeksi { $email }. Tämä osoite on nyt käyttäjätunnuksesi { -product-mozilla-account }lle kirjautuessasi sekä osoite, johon tietoturvailmoitukset ja kirjautumisvahvistukset lähetetään.
postChangePrimary-action = Hallinnoi tiliä
postChangeRecoveryPhone-subject = Palauttamisen puhelinnumero päivitetty
postChangeRecoveryPhone-preview = Tili suojattu kaksivaiheisella todennuksella
postChangeRecoveryPhone-title = Vaihdoit palauttamisen puhelinnumerosi
postChangeRecoveryPhone-description = Sinulla on nyt uusi palautuspuhelinnumero. Edellinen puhelinnumerosi on poistettu.
postChangeTwoStepAuthentication-preview = Tilisi on suojattu
postChangeTwoStepAuthentication-subject = Kaksivaiheinen todennus päivitetty
postChangeTwoStepAuthentication-title = Kaksivaiheinen todennus on päivitetty
postChangeTwoStepAuthentication-action = Hallinnoi tiliä
postConsumeRecoveryCode-action = Hallinnoi tiliä
postNewRecoveryCodes-subject-2 = Uudet varatodennuskoodit luotu
postNewRecoveryCodes-title-2 = Loit uudet varatodennuskoodit
# After the colon, there is information about the device that the authentication codes were created on
postNewRecoveryCodes-description-2 = Ne luotiin käyttäen:
postNewRecoveryCodes-action = Hallinnoi tiliä
postRemoveAccountRecovery-subject-2 = Tilin palautusavain poistettu
postRemoveAccountRecovery-title-3 = Poistit tilisi palautusavaimen
postRemoveAccountRecovery-body-part1 = Tilisi palautusavainta tarvitaan salattujen selaustietojesi palauttamiseen, jos unohdat salasanasi.
postRemoveAccountRecovery-body-part2 = Jos et vielä ole, niin luo uusi tilin palautusavain tilisi asetuksissa, jotta et menetä tallennettuja salasanojasi, kirjanmerkkejäsi, selaushistoriaasi ja paljon muuta.
postRemoveAccountRecovery-action = Hallinnoi tiliä
postRemoveRecoveryPhone-subject = Palauttamisen puhelinnumero poistettu
postRemoveRecoveryPhone-preview = Tili suojattu kaksivaiheisella todennuksella
postRemoveRecoveryPhone-title = Palauttamisen puhelinnumero poistettu
postRemoveSecondary-subject = Toissijainen sähköposti poistettiin
postRemoveSecondary-title = Toissijainen sähköposti poistettiin
# Variables:
#  $secondaryEmail (String) - A user's email address
postRemoveSecondary-description-2 = Olet poistanut toissijaisen sähköpostiosoitteen { $secondaryEmail } { -product-mozilla-account }ltäsi. Tietoturvailmoituksia ja kirjautumisvahvistuksia ei enää lähetetä tähän osoitteeseen.
postRemoveSecondary-action = Hallinnoi tiliä
postRemoveTwoStepAuthentication-subject-line-2 = Kaksivaiheinen todennus poistettu käytöstä
postRemoveTwoStepAuthentication-title-2 = Poistit kaksivaiheisen todennuksen käytöstä
# After the colon is a description of the device the user used to disable two-step authentication
postRemoveTwoStepAuthentication-from-device = Poistit sen käytöstä käyttäen:
postRemoveTwoStepAuthentication-action = Hallinnoi tiliä
postRemoveTwoStepAuthentication-not-required-2 = Et tarvitse enää kertakäyttökoodeja todennussovelluksestasi kirjautuessasi sisään.
postSigninRecoveryCode-preview = Vahvista tilin toiminta
postSigninRecoveryCode-title = Varatodennuskoodiasi käytettiin kirjautumiseen
postSigninRecoveryCode-description = Jos se et ollut sinä, sinun tulee vaihtaa salasanasi välittömästi, jotta tilisi pysyy turvassa.
postSigninRecoveryCode-action = Hallinnoi tiliä
postSigninRecoveryPhone-preview = Vahvista tilin toiminta
postSigninRecoveryPhone-description = Jos se et ollut sinä, sinun tulee vaihtaa salasanasi välittömästi, jotta tilisi pysyy turvassa.
postSigninRecoveryPhone-action = Hallinnoi tiliä
postVerify-sub-title-3 = Mukava nähdä sinua!
postVerify-title-2 = Haluatko nähdä saman välilehden kahdessa laitteessa?
postVerify-description-2 = Se on helppoa! Asenna { -brand-firefox } toiseen laitteeseen ja kirjaudu sisään synkronointia varten. Se on kuin taikuutta!
postVerify-sub-description = (Psst… Se tarkoittaa myös, että saat kirjanmerkkisi, salasanasi ja muut { -brand-firefox }in tiedot kaikkialle, mihin olet kirjautunut sisään.)
postVerify-subject-4 = Tervetuloa { -brand-mozilla }an!
postVerify-setup-2 = Yhdistä toinen laite:
postVerify-action-2 = Yhdistä toinen laite
postVerifySecondary-subject = Toissijainen sähköpostiosoite lisätty
postVerifySecondary-title = Toissijainen sähköpostiosoite lisätty
# Variables:
#  $secondaryEmail (String) - A user's secondary email address
postVerifySecondary-content-3 = Olet vahvistanut osoitteen { $secondaryEmail } toissijaiseksi sähköpostiosoitteeksi { -product-mozilla-account }llesi. Tietoturvailmoitukset ja kirjautumisvahvistukset lähetetään nyt molempiin sähköpostiosoitteisiin.
postVerifySecondary-action = Hallinnoi tiliä
recovery-subject = Nollaa salasanasi
recovery-title-2 = Unohditko salasanasi?
# Information on the device, location, and date and time of the request that triggered the email follows.
recovery-request-origin-2 = Saimme { -product-mozilla-account }n salasanan vaihtopyynnön lähteestä:
recovery-new-password-button = Luo uusi salasana napsauttamalla alla olevaa painiketta. Tämä linkki vanhenee seuraavan tunnin sisällä.
recovery-copy-paste = Luo uusi salasana kopioimalla ja liittämällä alla oleva URL-osoite selaimeesi. Tämä linkki vanhenee seuraavan tunnin sisällä.
recovery-action = Luo uusi salasana
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountDeletion-subject = { $productName } -tilauksesi on peruttu
subscriptionAccountDeletion-title = Ikävä nähdä sinun lähtevän
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $invoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
subscriptionAccountDeletion-content-cancelled-2 = Poistit äskettäin { -product-mozilla-account }si. Sen seurauksena olemme peruneet { $productName } -tilauksen. Viimeisin maksu, jonka summa on { $invoiceTotal }, veloitettiin { $invoiceDateOnly }.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountFinishSetup-subject = Tervetuloa, tämä on { $productName }: Aseta salasanasi.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountFinishSetup-title = Tervetuloa, käytössäsi on { $productName }
subscriptionAccountFinishSetup-content-processing = Maksuasi käsitellään, ja sen suorittaminen voi kestää neljä arkipäivää. Tilauksesi uusiutuu automaattisesti joka laskutusjakso, ellet peru sitä.
subscriptionAccountFinishSetup-content-create-3 = Luo seuraavaksi { -product-mozilla-account }n salasana aloittaaksesi uuden tilauksesi käytön.
subscriptionAccountFinishSetup-action-2 = Aloitetaan
subscriptionAccountReminderFirst-subject = Muistutus: viimeistele tilisi määrittäminen
subscriptionAccountReminderFirst-title = Et voi käyttää tilaustasi vielä
subscriptionAccountReminderFirst-content-info-3 = Muutama päivä sitten loit { -product-mozilla-account }n, mutta et vahvistanut sitä. Toivomme, että saat tilisi määrityksen valmiiksi, jotta voit käyttää uutta tilaustasi.
subscriptionAccountReminderFirst-content-select-2 = Valitse "Luo salasana" asettaaksesi uuden salasanan ja viimeistelläksesi tilisi vahvistamisen.
subscriptionAccountReminderFirst-action = Luo salasana
subscriptionAccountReminderFirst-action-plaintext = { subscriptionAccountReminderFirst-action }:
subscriptionAccountReminderSecond-subject = Viimeinen muistutus: määritä tilisi
subscriptionAccountReminderSecond-title-2 = Tervetuloa { -brand-mozilla }an!
subscriptionAccountReminderSecond-content-info-3 = Muutama päivä sitten loit { -product-mozilla-account }n, mutta et vahvistanut sitä. Toivomme, että saat tilisi määrityksen valmiiksi, jotta voit käyttää uutta tilaustasi.
subscriptionAccountReminderSecond-content-select-2 = Valitse "Luo salasana" asettaaksesi uuden salasanan ja viimeistelläksesi tilisi vahvistamisen.
subscriptionAccountReminderSecond-action = Luo salasana
subscriptionAccountReminderSecond-action-plaintext = { subscriptionAccountReminderSecond-action }:
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionCancellation-subject = { $productName } -tilauksesi on peruttu
subscriptionCancellation-title = Ikävä nähdä sinun lähtevän

## Variables
##   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
##   $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
##   $invoiceDateOnly (String) - The date of the invoice, e.g. 01/20/2016

subscriptionCancellation-content-2 = Olemme peruuttaneet { $productName } -tilauksesi. Viimeinen maksusi { $invoiceTotal } maksettiin { $invoiceDateOnly }.
subscriptionCancellation-outstanding-content-2 = Olemme peruuttaneet { $productName } -tilauksesi. Viimeinen maksusi { $invoiceTotal } maksetaan { $invoiceDateOnly }.
# Variables
#   $serviceLastActiveDateOnly (String) - The date of last active service, e.g. 01/20/2016
subscriptionCancellation-content-continue = Palvelu jatkuu nykyisen laskutuskauden loppuun, joka on { $serviceLastActiveDateOnly }.
# Variables:
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-subject = Vaihdoit tuotteeseen { $productName }
# Variables:
# $productNameOld (String) - The name of the previously subscribed product, e.g. Mozilla VPN
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-content-switch = Vaihdoit onnistuneesti tuotteesta { $productNameOld } tuotteeseen { $productName }.
# Variables:
# $paymentAmountOld (String) - The amount of the previous subscription payment, including currency, e.g. $10.00
# $paymentAmountNew (String) - The amount of the new subscription payment, including currency, e.g. $10.00
# $productPaymentCycleNew (String) - The interval of time from the end of one payment statement date to the next payment statement date of the new subscription, e.g. month
# $productPaymentCycleOld (String) - The interval of time from the end of one payment statement date to the next payment statement date of the old subscription, e.g. month
# $paymentProrated (String) - The one time fee to reflect the higher charge for the remainder of the payment cycle, including currency, e.g. $10.00
subscriptionDowngrade-content-charge-info = Seuraavasta laskustasi alkaen veloitus muuttuu nykyisestä hinnasta { $paymentAmountOld } per { $productPaymentCycleOld } hintaan { $paymentAmountNew } per { $productPaymentCycleNew }. Tuolloin sinulle annetaan myös kertaluonteinen hyvitys, suuruudeltaan { $paymentProrated }, mikä korvaa tämän { $productPaymentCycleOld } jakson loppuosan alhaisempaa veloitusta.
# Variables:
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-content-install = Jos { $productName }:n käyttämistä varten on asennettavissa uusi ohjelmisto, saat erillisen sähköpostiviestin, joka sisältää latausohjeet.
subscriptionDowngrade-content-auto-renew = Tilaus uusiutuu automaattisesti joka laskutuskauden päätteeksi, ellet peru tilausta.
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFailedPaymentsCancellation-subject = { $productName } -tilauksesi on peruttu
subscriptionFailedPaymentsCancellation-title = Tilauksesi on peruttu
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFailedPaymentsCancellation-content = Olemme peruneet { $productName } -tilauksesi, koska useat maksuyritykset epäonnistuivat. Saat käyttöoikeuden uudelleen aloittamalla uuden tilauksen päivitetyllä maksutavalla.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-subject = { $productName } -maksu vahvistettu
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-title = Kiitos, että tilasit { $productName } -palvelun
subscriptionFirstInvoice-content-processing = Maksuasi käsitellään parhaillaan, ja sen suorittaminen voi kestää jopa neljä arkipäivää.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-content-install-2 = Saat erillisen sähköpostin { $productName } -palvelun käytön aloittamisesta.
subscriptionFirstInvoice-content-auto-renew = Tilaus uusiutuu automaattisesti joka laskutuskauden päätteeksi, ellet peru tilausta.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentExpired-subject-2 = Maksutapa tuotteelle { $productName } on vanhentunut tai vanhenee pian
subscriptionPaymentExpired-title-2 = Maksutapasi on vanhentunut tai vanhenemassa
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-subject = { $productName } -maksu epäonnistui
subscriptionPaymentFailed-title = Valitettavasti maksusi kanssa ilmeni ongelmia
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-content-problem = Havaitsimme ongelman { $productName }:n viimeisimmän maksun kanssa.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentProviderCancelled-subject = { $productName } vaatii maksutietojen päivittämisen
subscriptionPaymentProviderCancelled-title = Valitettavasti valitsemasi maksutavan kanssa ilmeni ongelmia
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentProviderCancelled-content-detect = Havaitsimme ongelman { $productName }:n kanssa käyttämäsi maksutavan kohdalla.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-subject = { $productName } -tilaus aktivoitu uudelleen
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-title = Kiitos että aktivoit { $productName } -tilauksen uudelleen!
# Variables:
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. 2016/01/20
subscriptionReactivation-content = Laskutusjakso ja maksu pysyvät ennallaan. Seuraava maksu, suuruudeltaan { $invoiceTotal }, veloitetaan { $nextInvoiceDateOnly }. Tilauksesi uusitaan automaattisesti jokaisen laskutusjakson päättyessä, ellet päätä peruuttaa tilaustasi.
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-subject = { $productName } - automaattisen uusimisen ilmoitus
subscriptionRenewalReminder-title = Tilauksesi uusitaan pian
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-greeting = Arvoisa { $productName } -asiakas
# Variables
#   $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#   $planIntervalCount (String) - The interval count of subscription plan, e.g. 2
#   $planInterval (String) - The interval of time of the subscription plan, e.g. week
#   $reminderLength (String) - The number of days until the current subscription is set to automatically renew, e.g. 14
subscriptionRenewalReminder-content-current = Nykyinen tilauksesi on asetettu uusiutumaan automaattisesti { $reminderLength } päivän kuluttua. { -brand-mozilla } uusii { $planIntervalCount } { $planInterval } -tilauksesi ja veloittaa { $invoiceTotal } tililläsi määritetyltä maksutavalta.
subscriptionRenewalReminder-content-closing = Terveisin
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-signature = { $productName } -tiimi
subscriptionReplaced-title = Tilauksesi on päivitetty
subscriptionReplaced-content-no-action = Sinulta ei vaadita toimenpiteitä.
subscriptionsPaymentExpired-subject-2 = Tilaustesi maksutapa on vanhentunut tai vanhenee pian
subscriptionsPaymentExpired-title-2 = Maksutapasi on vanhentunut tai vanhenemassa
subscriptionsPaymentProviderCancelled-subject = Maksutietojen päivitys vaaditaan { -brand-mozilla }-tilauksiin
subscriptionsPaymentProviderCancelled-title = Valitettavasti valitsemasi maksutavan kanssa ilmeni ongelmia
subscriptionsPaymentProviderCancelled-content-detected = Havaitsimme ongelman seuraavien tilausten maksutavan kohdalla.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSubsequentInvoice-subject = { $productName } -maksu vastaanotettu
subscriptionSubsequentInvoice-title = Kiitos siitä, että olet tilaaja!
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSubsequentInvoice-content-received = Vastaanotimme viimeisimmän maksusi { $productName }:stä.
# Variables:
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionUpgrade-subject = Olet päivittänyt tuotteeseen { $productName }
subscriptionUpgrade-title = Kiitos, että päivitit!

## Variables:
## $paymentAmountOld (String) - The amount of the previous subscription payment, including currency, e.g. $10.00
## $paymentAmountNew (String) - The amount of the new subscription payment, including currency, e.g. $10.00
## $paymentTaxOld (String) - The tax amount of the previous subscription payment, including currency, e.g. $1.00
## $paymentTaxNew (String) - The tax amount of the new subscription payment, including currency, e.g. $1.00
## $productPaymentCycleNew (String) - The interval of time from the end of one payment statement date to the next payment statement date of the new subscription, e.g. month
## $productPaymentCycleOld (String) - The interval of time from the end of one payment statement date to the next payment statement date of the old subscription, e.g. month
## $invoiceAmountDue (String) - The total that the customer owes after all credits, discounts, and taxes have been applied
## $paymentProrated (String) - The one time fee to reflect the higher charge for the remainder of the payment cycle, including currency, e.g. $10.00

subscriptionUpgrade-auto-renew = Tilaus uusiutuu automaattisesti joka laskutuskauden päätteeksi, ellet peru tilausta.
unblockCode-preview = Tämä koodi vanhenee tunnin kuluttua
unblockCode-title = Kirjaudutko sinä sisään?
unblockCode-prompt = Jos kirjaudut, tässä on tarvitsemasi valtuuskoodi:
# Variables:
#  $unblockCode (String) - An alphanumeric code
unblockCode-prompt-plaintext = Jos kyllä, tässä on tarvitsemasi valtuuskoodi: { $unblockCode }
unblockCode-report = Jos et, auta meitä torjumaan tunkeutujia ja <a data-l10n-name="reportSignInLink">ilmoita asiasta meille</a>.
unblockCode-report-plaintext = Jos et, auta meitä torjumaan tunkeutujia ja ilmoita asiasta meille.
verificationReminderFinal-subject = Viimeinen muistutus tilisi vahvistamisesta
verificationReminderFinal-description-2 = Loit pari viikkoa sitten { -product-mozilla-account }n, mutta et vahvistanut sitä. Turvallisuutesi vuoksi poistamme tilin, jos et vahvista sitä seuraavan 24 tunnin kuluessa.
confirm-account = Vahvista tili
confirm-account-plaintext = { confirm-account }:
verificationReminderFirst-subject-2 = Muista vahvistaa tilisi
verificationReminderFirst-title-3 = Tervetuloa { -brand-mozilla }an!
verificationReminderFirst-description-3 = Loit muutama päivä sitten { -product-mozilla-account }n, mutta et vahvistanut sitä. Vahvista tilisi seuraavan 15 päivän kuluessa tai se poistetaan automaattisesti.
verificationReminderFirst-sub-description-3 = Älä jää paitsi selaimesta, joka asettaa sinut ja yksityisyytesi etusijalle.
confirm-email-2 = Vahvista tili
confirm-email-plaintext-2 = { confirm-email-2 }:
verificationReminderFirst-action-2 = Vahvista tili
verificationReminderSecond-subject-2 = Muista vahvistaa tilisi
verificationReminderSecond-title-3 = Älä jää paitsi { -brand-mozilla }sta!
verificationReminderSecond-description-4 = Loit muutama päivä sitten { -product-mozilla-account }n, mutta et vahvistanut sitä. Vahvista tilisi seuraavan 10 päivän kuluessa tai se poistetaan automaattisesti.
verificationReminderSecond-second-description-3 = { -product-mozilla-account }si avulla voit synkronoida { -brand-firefox }-kokemuksesi eri laitteiden välillä. Lisäksi se avaa pääsyn muihin yksityisyyttä suojaaviin { -brand-mozilla }-tuotteisiin.
verificationReminderSecond-sub-description-2 = Ole osa tehtäväämme muuttaa internet kaikille avoimeksi paikaksi.
verificationReminderSecond-action-2 = Vahvista tili
verify-title-3 = Avaa Internet { -brand-mozilla }lla
verify-description-2 = Vahvista tilisi ja ota kaikki hyöty irti { -brand-mozilla }sta kaikkialla missä kirjaudut sisään, aloittaen tästä:
verify-subject = Viimeistele tilisi luominen
verify-action-2 = Vahvista tili
# Variables:
# $expirationTime (Number) - Represents the expiration time in minutes
verifyAccountChange-preview =
    { $expirationTime ->
        [one] Tämä koodi vanhenee { $expirationTime } minuutin kuluttua.
       *[other] Tämä koodi vanhenee { $expirationTime } minuutin kuluttua.
    }
verifyAccountChange-title = Oletko muuttamassa tilitietojasi?
# After the colon is a description of the device used to sign in to the service
verifyAccountChange-safe = Auta meitä pitämään tilisi turvassa hyväksymällä tämä muutos:
verifyAccountChange-prompt = Jos kyllä, tässä on valtuutuskoodisi:
# Variables:
# $expirationTime (Number) - Represents the expiration time in minutes
verifyAccountChange-expiry-notice =
    { $expirationTime ->
        [one] Se vanhenee { $expirationTime } minuutin kuluttua.
       *[other] Se vanhenee { $expirationTime } minuutin kuluttua.
    }
# Variables:
#  $clientName (String) - A client the user hasn't signed into before (e.g. Firefox, Sync)
verifyLogin-title-2 = Kirjauduitko { $clientName }iin?
verifyLogin-description-2 = Auta meitä pitämään tilisi turvassa vahvistamalla, että kirjauduit sisään:
verifyLogin-subject-2 = Vahvista sisäänkirjautuminen
verifyLogin-action = Vahvista kirjautuminen
verifyLoginCode-preview = Tämä koodi vanhenee viidessä minuutissa.
# Variables:
#  $serviceName (String) - A service the user hasn't signed into before (e.g. Firefox)
verifyLoginCode-title-2 = Kirjauduitko palveluun { $serviceName }?
# After the colon is a description of the device used to sign in to the service
verifyLoginCode-safe = Auta meitä pitämään tilisi turvassa vahvistamalla, että kirjauduit sisään:
verifyLoginCode-prompt-3 = Jos kyllä, tässä on valtuutuskoodisi:
verifyLoginCode-expiry-notice = Se vanhenee viidessä minuutissa.
verifyPrimary-title-2 = Vahvista ensisijainen sähköpostiosoite
verifyPrimary-description = Tilin muutospyyntö on tehty laitteella:
verifyPrimary-subject = Vahvista ensisijainen sähköpostiosoite
verifyPrimary-action-2 = Vahvista sähköposti
verifyPrimary-action-plaintext-2 = { verifyPrimary-action-2 }:
verifyPrimary-post-verify-2 = Vahvistuksen jälkeen tilimuutokset, kuten toissijaisen sähköpostiosoitteen lisääminen, ovat mahdollisia tällä laitteella.
verifySecondaryCode-preview = Tämä koodi vanhenee viidessä minuutissa.
verifySecondaryCode-title-2 = Vahvista toissijainen sähköpostiosoite
verifySecondaryCode-action-2 = Vahvista sähköposti
# Variables:
#  $email (string) A user's unverified secondary email address
verifySecondaryCode-explainer-2 = Pyyntö käyttää osoitetta { $email } toissijaisena sähköpostina on tehty seuraavalta { -product-mozilla-account }ltä:
verifySecondaryCode-prompt-2 = Käytä tätä vahvistuskoodia:
verifySecondaryCode-expiry-notice-2 = Se vanhenee 5 minuutissa. Vahvistamisen jälkeen tämä osoite alkaa vastaanottamaan turvallisuusilmoituksia ja -vahvistuksia.
verifyShortCode-preview-2 = Tämä koodi vanhenee viidessä minuutissa
verifyShortCode-title-3 = Avaa Internet { -brand-mozilla }lla
# Information on the browser and device triggering this confirmation email follows below this string.
verifyShortCode-title-subtext-2 = Vahvista tilisi ja ota kaikki hyöty irti { -brand-mozilla }sta kaikkialla missä kirjaudut sisään, aloittaen tästä:
verifyShortCode-prompt-3 = Käytä tätä vahvistuskoodia:
verifyShortCode-expiry-notice = Se vanhenee viidessä minuutissa.
