# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.


## Component - AppLayout

settings-home = Tilin koti
settings-project-header-title = { -product-mozilla-account }

## Component - CouponForm

# Title of container showing discount coupon code applied to a subscription.
coupon-promo-code-applied = Tarjouskoodi sovellettu
coupon-submit = Käytä
coupon-remove = Poista
coupon-error = Antamasi koodi on virheellinen tai vanhentunut.
coupon-error-generic = Koodia käsiteltäessä tapahtui virhe. Yritä uudelleen.
coupon-error-expired = Antamasi koodi on vanhentunut.
coupon-error-limit-reached = Antamasi koodi on käytetty liian monta kertaa.
coupon-error-invalid = Antamasi koodi on virheellinen.
# $couponDurationDate (Date) - The date at which the coupon is no longer valid, and the subscription is billed the list price.
coupon-enter-code =
    .placeholder = Kirjoita koodi

## Component - Fields

default-input-error = Tämä kenttä on pakollinen
input-error-is-required = { $label } vaaditaan

## Component - Header

brand-name-mozilla-logo = { -brand-mozilla }n logo

## Component - NewUserEmailForm

new-user-sign-in-link-2 = Onko sinulla jo { -product-mozilla-account }? <a>Kirjaudu sisään</a>
# "Required" to indicate that the user must use the checkbox below this text to
# agree to a payment method's terms of service and privacy notice in order to
# continue.
new-user-enter-email =
    .label = Kirjoita sähköpostiosoitteesi
new-user-confirm-email =
    .label = Vahvista sähköposti
new-user-subscribe-product-updates-mozilla = Haluan saada tuoteuutisia ja päivityksiä { -brand-mozilla }lta
new-user-subscribe-product-updates-snp = Haluan saada turvallisuus- ja tietosuojauutisia sekä päivityksiä { -brand-mozilla }lta
new-user-subscribe-product-updates-hubs = Haluan saada tuoteuutisia ja päivityksiä { -product-mozilla-hubs }ilta ja { -brand-mozilla }lta
new-user-subscribe-product-updates-mdnplus = Haluan saada tuoteuutisia ja päivityksiä { -product-mdn-plus } -palvelusta ja { -brand-mozilla }lta
new-user-subscribe-product-assurance = Käytämme sähköpostiosoitettasi vain tilin luomiseen. Emme koskaan myy sitä kolmannelle osapuolelle.
new-user-email-validate = Sähköpostiosoite ei ole kelvollinen
new-user-email-validate-confirm = Sähköpostiosoitteet eivät täsmää
new-user-already-has-account-sign-in = Sinulla on jo tili. <a>Kirjaudu sisään</a>
# $domain (String) - the email domain provided by the user during sign up
new-user-invalid-email-domain = Kirjoititko sähköpostiosoitteen väärin? Verkkotunnus { $domain } ei tarjoa sähköpostipalveluja.

## Component - PaymentConfirmation

payment-confirmation-thanks-heading = Kiitos!
payment-confirmation-thanks-heading-account-exists = Kiitos, tarkista nyt sähköpostisi!
# $email (string) - The user's email.
# $productName (String) - The name of the subscribed product.
payment-confirmation-thanks-subheading = Vahvistusviesti on lähetetty osoitteeseen { $email }. Viesti sisältää tiedot, miten saat tuotteen { $product_name } käyttöösi.
# $email (string) - The user's email.
payment-confirmation-thanks-subheading-account-exists = Saat sähköpostin osoitteeseen { $email }. Viesti sisältää ohjeet tilin luomiseen ja maksutiedot.
payment-confirmation-order-heading = Tilauksen tiedot
payment-confirmation-invoice-number = Lasku #{ $invoiceNumber }
# $invoiceDate (Date) - Start date of the latest invoice
payment-confirmation-invoice-date = { $invoiceDate }
payment-confirmation-details-heading-2 = Maksun tiedot
payment-confirmation-amount = { $amount } per { $interval }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in days.
payment-confirmation-amount-day =
    { $intervalCount ->
        [one] { $amount } päivittäin
       *[other] { $amount } joka { $intervalCount }. päivä
    }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in weeks.
payment-confirmation-amount-week =
    { $intervalCount ->
        [one] { $amount } viikoittain
       *[other] { $amount } joka { $intervalCount }. viikko
    }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in months.
payment-confirmation-amount-month =
    { $intervalCount ->
        [one] { $amount } kuukausittain
       *[other] { $amount } joka { $intervalCount }. kuukausi
    }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in years.
payment-confirmation-amount-year =
    { $intervalCount ->
        [one] { $amount } vuosittain
       *[other] { $amount } joka { $intervalCount }. vuosi
    }
payment-confirmation-download-button = Jatka lataamiseen

## Component - PaymentConsentCheckbox

payment-confirm-with-legal-links-static-3 = Valtuutan { -brand-mozilla }n veloittaa maksutapaani näytetyn summan verran, <termsOfServiceLink>käyttöehtojen</termsOfServiceLink> ja <privacyNoticeLink>tietosuojakäytännön</privacyNoticeLink> mukaisesti, kunnes peruutan tilaukseni.
payment-confirm-checkbox-error = Sinun on suoritettava tämä vaihe, ennen kuin jatkat eteenpäin

## Component - PaymentErrorView

payment-error-retry-button = Yritä uudestaan
payment-error-manage-subscription-button = Hallitse tilausta

## Component - PaymentErrorView - IAP upgrade errors

# $productName (String) - The name of the subscribed product.
iap-upgrade-already-subscribed-2 = Sinulla on jo { $productName }-tilaus { -brand-google }n tai { -brand-apple }n sovelluskaupan kautta.
iap-upgrade-no-bundle-support = Emme tue päivityksiä näille tilauksille tällä hetkellä, mutta tuemme pian.
iap-upgrade-contact-support = Voit edelleen hankkia tämän tuotteen — ota yhteyttä tukeen, jotta voimme auttaa sinua.
iap-upgrade-get-help-button = Tuki

## Component - PaymentForm

payment-name =
    .placeholder = Koko nimi
    .label = Nimi kuten se lukee kortissasi
payment-cc =
    .label = Korttisi
payment-cancel-btn = Peruuta
payment-update-btn = Päivitä
payment-pay-btn = Maksa nyt
payment-pay-with-paypal-btn-2 = Maksa { -brand-paypal }illa
payment-validate-name-error = Kirjoita nimesi

## Component - PaymentLegalBlurb

payment-legal-copy-stripe-and-paypal-3 = { -brand-mozilla } käyttää { -brand-name-stripe }a ja { -brand-paypal }ia maksujen turvalliseen käsittelyyn.
payment-legal-link-stripe-paypal-2 = <stripePrivacyLink>{ -brand-name-stripe }n tietosuojakäytäntö</stripePrivacyLink> &nbsp; <paypalPrivacyLink>{ -brand-paypal }in tietosuojakäytäntö</paypalPrivacyLink>.
payment-legal-copy-paypal-2 = { -brand-mozilla } käyttää { -brand-paypal }ia turvalliseen maksunvälitykseen.
payment-legal-link-paypal-3 = <paypalPrivacyLink>{ -brand-paypal }in tietosuojakäytäntö</paypalPrivacyLink>
payment-legal-copy-stripe-3 = { -brand-mozilla } käyttää { -brand-name-stripe }a maksujen turvalliseen käsittelyyn.
payment-legal-link-stripe-3 = <stripePrivacyLink>{ -brand-name-stripe }n tietosuojakäytäntö</stripePrivacyLink>.

## Component - PaymentMethodHeader

payment-method-header = Valitse maksutapa
# This message is used to indicate the second step in a multi step process.
payment-method-header-second-step = 2. { payment-method-header }
payment-method-first-approve = Sinun on ensin hyväksyttävä tilauksesi

## Component - PaymentProcessing

payment-processing-message = Odota kun käsittelemme maksuasi…

## Component - PaymentProviderDetails

payment-confirmation-cc-card-ending-in = Kortti päättyen { $last4 }

## Component - PayPalButton

pay-with-heading-paypal-2 = Maksa { -brand-paypal }illa

## Component - PlanDetails

plan-details-header = Tuotteen tiedot
plan-details-list-price = Listahinta
plan-details-show-button = Näytä tiedot
plan-details-hide-button = Piilota tiedot
plan-details-total-label = Yhteensä
plan-details-tax = Verot ja maksut

## Component - PlanErrorDialog

product-no-such-plan = Tälle tuotteelle ei ole olemassa kyseistä tilaustyyppiä.

## Price details including tax
## $priceAmount (Number) - The amount billed. It will be formatted as currency.
## $taxAmount (Number) - The tax added on, not included in amount. It will be formatted as currency.

price-details-no-tax = { $priceAmount }
price-details-tax = { $priceAmount } + { $taxAmount } vero
# $intervalCount (Number) - The interval between payments, in days.
price-details-no-tax-day =
    { $intervalCount ->
        [one] { $priceAmount } päivittäin
       *[other] { $priceAmount } { $intervalCount } päivän välein
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } päivittäin
           *[other] { $priceAmount } { $intervalCount } päivän välein
        }
# $intervalCount (Number) - The interval between payments, in weeks.
price-details-no-tax-week =
    { $intervalCount ->
        [one] { $priceAmount } viikottain
       *[other] { $priceAmount } { $intervalCount } viikon välein
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } viikottain
           *[other] { $priceAmount } { $intervalCount } viikon välein
        }
# $intervalCount (Number) - The interval between payments, in months.
price-details-no-tax-month =
    { $intervalCount ->
        [one] { $priceAmount } kuukausittain
       *[other] { $priceAmount } { $intervalCount } kuukauden välein
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } kuukausittain
           *[other] { $priceAmount } { $intervalCount } kuukauden välein
        }
# $intervalCount (Number) - The interval between payments, in years.
price-details-no-tax-year =
    { $intervalCount ->
        [one] { $priceAmount } vuosittain
       *[other] { $priceAmount } { $intervalCount } vuoden välein
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } vuosittain
           *[other] { $priceAmount } { $intervalCount } vuoden välein
        }
# $intervalCount (Number) - The interval between payments, in days.
price-details-tax-day =
    { $intervalCount ->
        [one] { $priceAmount } + vero { $taxAmount } päivittäin
       *[other] { $priceAmount } + vero { $taxAmount } { $intervalCount } päivän välein
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + vero { $taxAmount } päivittäin
           *[other] { $priceAmount } + vero { $taxAmount } { $intervalCount } päivän välein
        }
# $intervalCount (Number) - The interval between payments, in weeks.
price-details-tax-week =
    { $intervalCount ->
        [one] { $priceAmount } + vero { $taxAmount } viikottain
       *[other] { $priceAmount } + vero { $taxAmount } { $intervalCount } viikon välein
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + vero { $taxAmount } viikottain
           *[other] { $priceAmount } + vero { $taxAmount } { $intervalCount } viikon välein
        }
# $intervalCount (Number) - The interval between payments, in months.
price-details-tax-month =
    { $intervalCount ->
        [one] { $priceAmount } + vero { $taxAmount } kuukausittain
       *[other] { $priceAmount } + vero { $taxAmount } { $intervalCount } kuukauden välein
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + vero { $taxAmount } kuukausittain
           *[other] { $priceAmount } + vero { $taxAmount } { $intervalCount } kuukauden välein
        }
# $intervalCount (Number) - The interval between payments, in years.
price-details-tax-year =
    { $intervalCount ->
        [one] { $priceAmount } + vero { $taxAmount } vuosittain
       *[other] { $priceAmount } + vero { $taxAmount } { $intervalCount } vuoden välein
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + vero { $taxAmount } vuosittain
           *[other] { $priceAmount } + vero { $taxAmount } { $intervalCount } vuoden välein
        }

## Component - SubscriptionTitle

subscription-create-title = Määritä tilaus
subscription-success-title = Tilauksen vahvistus
subscription-processing-title = Vahvistetaan tilausta…
subscription-error-title = Virhe tilausta vahvistaessa…
subscription-noplanchange-title = Tämä tilaustyypin vaihtaminen ei ole tuettu
subscription-iapsubscribed-title = Tilattu jo aiemmin
sub-guarantee = 30 päivän rahat takaisin -takuu

## Component - TermsAndPrivacy

# "Mozilla Accounts" is capitalized in this instance for title case in English
# This heading is followed by links to Terms of Service and Privacy Notice
subplat-mozilla-accounts-legal-heading = { -product-mozilla-accounts(capitalization: "uppercase") }
terms = Käyttöehdot
privacy = Tietosuojakäytäntö
terms-download = Latausehdot

## App-level string(s) and messages shared by multiple components or routes

document =
    .title = Firefox-tilit
# General aria-label for closing modals
close-aria =
    .aria-label = Sulje valintaikkuna
settings-subscriptions-title = Tilaukset
# Title of container where a user can input a coupon code to get a discount on a subscription.
coupon-promo-code = Tarjouskoodi

## Subscription upgrade plan details - shared by multiple components, including plan details and payment form
## $amount (Number) - The amount billed. It will be formatted as currency.

# $intervalCount (Number) - The interval between payments, in days.
plan-price-interval-day =
    { $intervalCount ->
        [one] { $amount } päivittäin
       *[other] { $amount } { $intervalCount } päivän välein
    }
    .title =
        { $intervalCount ->
            [one] { $amount } päivittäin
           *[other] { $amount } { $intervalCount } päivän välein
        }
# $intervalCount (Number) - The interval between payments, in weeks.
plan-price-interval-week =
    { $intervalCount ->
        [one] { $amount } viikottain
       *[other] { $amount } { $intervalCount } viikon välein
    }
    .title =
        { $intervalCount ->
            [one] { $amount } viikottain
           *[other] { $amount } { $intervalCount } viikon välein
        }
# $intervalCount (Number) - The interval between payments, in months.
plan-price-interval-month =
    { $intervalCount ->
        [one] { $amount } kuukausittain
       *[other] { $amount } { $intervalCount } kuukauden välein
    }
    .title =
        { $intervalCount ->
            [one] { $amount } kuukausittain
           *[other] { $amount } { $intervalCount } kuukauden välein
        }
# $intervalCount (Number) - The interval between payments, in years.
plan-price-interval-year =
    { $intervalCount ->
        [one] { $amount } vuosittain
       *[other] { $amount } { $intervalCount } vuoden välein
    }
    .title =
        { $intervalCount ->
            [one] { $amount } vuosittain
           *[other] { $amount } { $intervalCount } vuoden välein
        }

## Error messages

# App error dialog
general-error-heading = Yleinen sovellusvirhe
basic-error-message = Jokin meni pieleen. Yritä uudelleen myöhemmin.
payment-error-1 = Hmm. Maksun valtuuttamisessa ilmeni ongelma. Yritä uudestaan tai ole yhteydessä kortin myöntäjään.
payment-error-2 = Hmm. Maksun valtuuttamisessa ilmeni ongelma. Ole yhteydessä kortin myöntäjään.
payment-error-3b = Maksua käsitellessä tapahtui odottamaton virhe. Yritä uudestaan.
expired-card-error = Luottokorttisi vaikuttaa vanhentuneen. Kokeile toista korttia.
insufficient-funds-error = Vaikuttaa siltä, että kortilla ei ole riittävästi varoja. Kokeile toista korttia.
withdrawal-count-limit-exceeded-error = Vaikuttaa siltä, että tämä tapahtuma ylittää luottorajasi. Kokeile toista korttia.
charge-exceeds-source-limit = Vaikuttaa siltä, että tämä tapahtuma ylittää päivittäisen luottorajasi. Kokeile toista korttia tai yritä uudestaan päivän kuluttua.
instant-payouts-unsupported = Vaikuttaa siltä, että debit-kortissasi ei ole otettu käyttöön välittömiä maksuja. Kokeile toista debit- tai credit-korttia.
duplicate-transaction = Hmm. Vaikuttaa siltä, että sama tapahtuma lähetettiin juuri. Tarkista maksuhistoriasi.
coupon-expired = Vaikuttaa siltä, että tarjouskoodi on vanhentunut.
card-error = Tapahtuman käsittely epäonnistui. Tarkista kortin tiedot ja yritä uudestaan.
country-currency-mismatch = Tämän tilauksen valuutta ei ole voimassa maksun tapahtumamaassa.
currency-currency-mismatch = Pahoittelut, et voi vaihtaa valuuttojen välillä.
location-unsupported = Nykyistä sijaintiasi ei tueta käyttöehtojemme mukaisesti.
no-subscription-change = Valitettavasti et voi muuttaa tilaustyyppiäsi.
# $mobileAppStore (String) - "Google Play Store" or "App Store", localized when the translation is available.
iap-already-subscribed = Olet jo tilannut sovelluskaupan { $mobileAppStore } kautta.
# $productName (String) - The name of the subscribed product.
fxa-account-signup-error-2 = Järjestelmävirhe aiheutti { $productName } -rekisteröitymisen epäonnistumisen. Maksutapaasi ei ole veloitettu. Yritä uudelleen.
fxa-post-passwordless-sub-error = Tilaus on vahvistettu, mutta vahvistussivun lataaminen epäonnistui. Tarkista sähköpostistasi ohjeet, kuinka määrität tilin valmiiksi.
newsletter-signup-error = Et ole tilannut tuotepäivityksiin liittyviä sähköposteja. Voit yrittää uudelleen tilisi asetuksista.
product-plan-error =
    .title = Ongelma ladatessa tilaustyyppejä
product-profile-error =
    .title = Ongelma ladatessa profiilia
product-customer-error =
    .title = Ongelma ladatessa asiakasta
product-plan-not-found = Tilaustyyppiä ei löytynyt
product-location-unsupported-error = Sijainti ei ole tuettu

## Hooks - coupons

coupon-success = Tilauksesi uusitaan automaattisesti listahintaan.
# $couponDurationDate (Date) - The date at which the coupon is no longer valid, and the subscription is billed the list price.
coupon-success-repeating = Tilauksesi uusiutuu automaattisesti { $couponDurationDate } listahinnan mukaisesti.

## Routes - Checkout - New user

new-user-step-1-2 = 1. Luo { -product-mozilla-account }
new-user-card-title = Anna korttisi tiedot
new-user-submit = Tilaa nyt

## Routes - Product and Subscriptions

sub-update-payment-title = Maksun tiedot

## Routes - Product/AcceptedCards
## Used in both Routes - Checkout and Product/SubscriptionCreate

pay-with-heading-card-only = Maksa kortilla
product-invoice-preview-error-title = Ongelma ladattaessa laskun esikatselua
product-invoice-preview-error-text = Laskun esikatselua ei voitu ladata

## Routes - Product - IapRoadblock

subscription-iaperrorupgrade-title = Emme voi päivittää sinua vielä

# The following are not terms because they are not used directly in messages,
# but rather looked up in code and passed into the message as variables.

brand-name-apple-app-store-2 = { -app-store }

## Routes - Product - Subscription upgrade

product-plan-change-heading = Tarkista muutos
sub-change-failed = Tilaustyypin vaihtaminen epäonnistui
sub-change-submit = Vahvista muutos
sub-update-current-plan-label = Nykyinen tilaustyyppi
sub-update-new-plan-label = Uusi tilaustyyppi
sub-update-total-label = Uusi summa

## Checkout line item for subscription plan change listing the product name and frequency of payment
## For example, a Mozilla VPN subscription charged monthly would appear as: Mozilla VPN (Monthly)
## Variables:
##   $productName (String) - Name of the upgraded product (e.g. Mozilla VPN)

sub-update-new-plan-daily = { $productName } (päivittäin)
sub-update-new-plan-weekly = { $productName } (viikoittain)
sub-update-new-plan-monthly = { $productName } (kuukausittain)
sub-update-new-plan-yearly = { $productName } (vuosittain)

## Routes - Subscriptions - Cancel

sub-item-cancel-sub = Peruuta tilaus
sub-item-stay-sub = Jatka tilausta

## $name (String) - The name of the subscribed product.
## $period (Date) - The last day of product access

sub-item-cancel-msg =
    Käyttöoikeutesi tuotteeseen { $name } päättyy
    { $period }, joka on laskutusjakson viimeinen päivä.
sub-item-cancel-confirm =
    Peru käyttömahdollisuuteni ja pääsy tietoihini
    palvelussa { $name } { $period }
# $promotion_name (String) - The name of the promotion.
# The <priceDetails></priceDetails> component acts as a placeholder and could use one of the following IDs:
# price-details-tax-${interval},
# price-details-no-tax-${interval},
# price-details-tax,
# price-details-no-tax
# Examples:
# 20% OFF coupon applied: $11.20 + $0.35 tax monthly
# Holiday Offer 2023 coupon applied: $11.20 monthly
# Cybersecurity Awareness Month 2023 coupon applied: $11.20 + $0.35 tax
# Summer Promo VPN coupon applied: $11.20
sub-promo-coupon-applied = { $promotion_name } -kuponki käytetty: <priceDetails></priceDetails>

## Routes - Subscription

sub-route-idx-reactivating = Tilauksen aktivointi uudelleen epäonnistui
sub-route-idx-cancel-failed = Tilauksen peruuttaminen epäonnistui
sub-route-idx-contact = Ota yhteys tukeen
sub-route-idx-cancel-msg-title = Harmi että poistut
# $name (String) - The name of the subscribed product.
# $date (Date) - Last day of product access
sub-route-idx-cancel-msg =
    { $name }-tilauksesi on peruutettu.
          <br />
          Voit edelleen käyttää { $name }-tuotetta { $date } asti.
sub-route-idx-cancel-aside-2 = Kysymyksiä? Käy <a>{ -brand-mozilla }-tuessa</a>.

## Routes - Subscriptions - Errors

sub-customer-error =
    .title = Ongelma ladatessa asiakasta
sub-invoice-error =
    .title = Ongelma laskuja ladatessa
sub-billing-update-success = Laskutustietosi on päivitetty onnistuneesti
sub-invoice-previews-error-title = Ongelma ladattaessa laskun esikatseluita
sub-invoice-previews-error-text = Laskun esikatseluita ei voitu ladata

## Routes - Subscription - ActionButton

pay-update-change-btn = Muuta
pay-update-manage-btn = Hallitse

## Routes - Subscriptions - Cancel and IapItem
## $priceAmount (Number) - The amount billed. It will be formatted as currency.
## $taxAmount (Number) - The tax added on, not included in amount. It will be formatted as currency.
## $date (Date) - The date for the next time a charge will occur.

sub-next-bill = Seuraava laskutus { $date }
sub-next-bill-due-date = Seuraava maksu veloitetaan { $date }
sub-expires-on = Vanhenee { $date }

## Routes - Subscription - PaymentUpdate


# $expirationDate (Date) - The payment card's expiration date.

pay-update-card-exp = Vanhenee { $expirationDate }
sub-route-idx-updating = Päivitetään laskutustietoja…
sub-route-payment-modal-heading = Virheelliset laskutustiedot
sub-route-payment-modal-message-2 = { -brand-paypal }-tililläsi vaikuttaa olevan virhe. Sinun on tehtävä tarvittavat toimet tämän maksuongelman ratkaisemiseksi.
sub-route-missing-billing-agreement-payment-alert = Virheelliset maksutiedot. Tiliisi kohdistuu virhe. <div>Hallitse</div>
sub-route-funding-source-payment-alert = Virheelliset maksutiedot; tililläsi on virhe. Tämän hälytyksen poistaminen voi kestää jonkin aikaa, kun olet päivittänyt tietosi. <div>Hallinnoi</div>

## Routes - Subscription - SubscriptionItem

sub-item-no-such-plan = Tälle tilaukselle ei ole kyseistä tilaustyyppiä.
invoice-not-found = Seuraavaa laskua ei löydy
sub-item-no-such-subsequent-invoice = Seuraavaa laskua ei löydy tälle tilaukselle.
sub-invoice-preview-error-title = Laskun esikatselua ei löydy
sub-invoice-preview-error-text = Tälle tilaukselle ei löytynyt laskun esikatselua

## Routes - Subscriptions - Reactivate
## $name (String) - The name of the subscribed product.

reactivate-confirm-dialog-header = Haluatko jatkaa tuotteen { $name } käyttämistä?
# $amount (Number) - The amount billed. It will be formatted as currency.
# $last (String) - The last 4 digits of the card that will be charged
# $endDate (Date) - Last day of product access
reactivate-confirm-copy =
    Palvelun { $name } käyttö jatkuu, ja laskutusjakso
    sekä maksu pysyvät samoina kuin aiemmin. Seuraava veloitus
    tulee olemaan { $amount } kortilta, joka päättyy { $last }, { $endDate }.
# Alternate copy used when a payment method is not available, e.g. for free trials
# $amount (Number) - The amount billed. It will be formatted as currency.
# $endDate (Date) - Last day of product access
reactivate-confirm-without-payment-method-copy =
    Palvelun { $name } käyttö jatkuu, ja laskutusjakso
    sekä maksu pysyvät samoina kuin aiemmin. Seuraava veloitus
    tulee olemaan { $amount } { $endDate }.
reactivate-confirm-button = Tilaa uudelleen

## $date (Date) - Last day of product access

reactivate-panel-copy = Käyttöoikeutesi palveluun { $name } päättyy <strong>{ $date }</strong>.
reactivate-success-copy = Kiitos! Kaikki on nyt valmiina.
reactivate-success-button = Sulje

## Routes - Subscriptions - Subscription iap item

sub-iap-item-google-purchase-2 = { -brand-google }: Sovelluksen sisäinen osto
sub-iap-item-apple-purchase-2 = { -brand-apple }: Sovelluksen sisäinen osto
sub-iap-item-manage-button = Hallitse
