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
cancellationSurvey = Auta parantamaan palveluitamme <a data-l10n-name="cancellationSurveyUrl">vastaamalla kyselyyn</a>.
# After the colon, there's a link to https://survey.alchemer.com/s3/6534408/Privacy-Security-Product-Cancellation-of-Service-Q4-21
cancellationSurvey-plaintext = Auta meitä parantamaan palveluitamme täyttämällä lyhyt kysely:
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
view-invoice-link-action = Näytä lasku
# Variables:
#  $invoiceLink (String) - The link to the invoice
# After the colon, there's a link to https://pay.stripe.com/
view-invoice-plaintext = Näytä lasku: { $invoiceLink }
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
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountDeletion-subject = { $productName } -tilauksesi on peruttu
subscriptionAccountDeletion-title = Ikävä nähdä sinun lähtevän
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $invoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
subscriptionAccountDeletion-content-cancelled-2 = Poistit äskettäin { -product-mozilla-account }si. Sen seurauksena olemme peruneet { $productName } -tilauksen. Viimeisin maksu, jonka summa on { $invoiceTotal }, veloitettiin { $invoiceDateOnly }.
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
subscriptionRenewalReminder-content-closing = Terveisin
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-signature = { $productName } -tiimi
subscriptionReplaced-title = Tilauksesi on päivitetty
subscriptionReplaced-content-no-action = Sinulta ei vaadita toimenpiteitä.
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
subscriptionsPaymentExpired-subject-2 = Tilaustesi maksutapa on vanhentunut tai vanhenee pian
subscriptionsPaymentExpired-title-2 = Maksutapasi on vanhentunut tai vanhenemassa
subscriptionsPaymentProviderCancelled-subject = Maksutietojen päivitys vaaditaan { -brand-mozilla }-tilauksiin
subscriptionsPaymentProviderCancelled-title = Valitettavasti valitsemasi maksutavan kanssa ilmeni ongelmia
subscriptionsPaymentProviderCancelled-content-detected = Havaitsimme ongelman seuraavien tilausten maksutavan kohdalla.
