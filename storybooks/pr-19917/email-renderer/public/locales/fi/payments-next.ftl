## Page

checkout-signin-or-create = 1. Kirjaudu sisään tai luo { -product-mozilla-account }
# This string appears as a separation between the two sign-in options, "Enter your email"(signin-form-email-input) "or"(this string) "Continue with Google"(continue-signin-with-google-button) / "Continue with Apple"(continue-signin-with-apple-button)
checkout-signin-options-or = tai
continue-signin-with-google-button = Jatka käyttämällä { -brand-google }a
continue-signin-with-apple-button = Jatka käyttämällä { -brand-apple }a
next-payment-method-header = Valitse maksutapa
# This message is used to indicate the second step in a multi step process.
payment-method-header-second-step-next = 2. { next-payment-method-header }
next-payment-method-first-approve = Sinun on ensin hyväksyttävä tilauksesi
# $productName (String) - The name of the product to create subscription, e.g. Mozilla VPN
location-header = Valitse maasi ja anna postinumerosi <p>jatkaaksesi tuotteen { $productName } kanssa kassalle</p>
location-banner-info = Emme pystyneet tunnistamaan sijaintiasi automaattisesti
location-required-disclaimer = Käytämme tätä tietoa vain verojen ja valuutan laskemiseen.
location-banner-currency-change = Valuutanvaihtoa ei tueta. Jatka valitsemalla maa, joka vastaa nykyistä laskutusvaluuttaasi.

## Page - Upgrade page

upgrade-page-payment-information = Maksun tiedot

## Authentication Error page

auth-error-page-title = Emme voineet kirjata sinua sisään
checkout-error-boundary-retry-button = Yritä uudelleen
checkout-error-boundary-basic-error-message = Jotain meni pieleen. Yritä uudelleen tai <contactSupportLink>ota yhteyttä tukeen.</contactSupportLink>
amex-logo-alt-text = { -brand-amex }-logo
diners-logo-alt-text = { -brand-diner }-logo
discover-logo-alt-text = { -brand-discover }-logo
jcb-logo-alt-text = { -brand-jcb }-logo
mastercard-logo-alt-text = { -brand-mastercard }-logo
paypal-logo-alt-text = { -brand-paypal }-logo
unionpay-logo-alt-text = { -brand-unionpay }-logo
visa-logo-alt-text = { -brand-visa }-logo
link-logo-alt-text = { -brand-link }-logo
apple-pay-logo-alt-text = { -brand-apple-pay } -logo
google-pay-logo-alt-text = { -brand-google-pay } -logo

## Error pages - /checkout and /upgrade
## Common strings used in multiple pages

next-payment-error-manage-subscription-button = Hallitse tilausta
next-iap-blocked-contact-support = Sinulla on mobiilisovelluksen sisäinen tilaus, joka on ristiriidassa tämän tuotteen kanssa. Ota yhteys tukeen, niin voimme auttaa sinua.
next-payment-error-retry-button = Yritä uudestaan
next-basic-error-message = Jokin meni pieleen. Yritä uudelleen myöhemmin.
checkout-error-contact-support-button = Ota yhteys tukeen
checkout-error-not-eligible = Et voi tilata tätä tuotetta - ota yhteys tukeemme, jotta voimme auttaa sinua.
checkout-error-already-subscribed = Olet jo tilannut tämän tuotteen.
checkout-error-contact-support = Ota yhteys tukeen, jotta voimme auttaa sinua.
cart-error-currency-not-determined = Emme pystyneet määrittämään tämän ostoksen valuuttaa. Yritä uudelleen.
checkout-processing-general-error = Maksua käsitellessä tapahtui odottamaton virhe. Yritä uudestaan.
cart-total-mismatch-error = Laskun summa on muuttunut. Yritä uudelleen.

## Error pages - Payment method failure messages

intent-card-error = Tapahtuman käsittely epäonnistui. Tarkista kortin tiedot ja yritä uudestaan.
intent-expired-card-error = Luottokorttisi vaikuttaa vanhentuneen. Kokeile toista korttia.
intent-payment-error-try-again = Hmm. Maksun valtuuttamisessa ilmeni ongelma. Yritä uudestaan tai ole yhteydessä kortin myöntäjään.
intent-payment-error-get-in-touch = Hmm. Maksun valtuuttamisessa ilmeni ongelma. Ole yhteydessä kortin myöntäjään.
intent-payment-error-generic = Maksua käsitellessä tapahtui odottamaton virhe. Yritä uudestaan.
intent-payment-error-insufficient-funds = Vaikuttaa siltä, että kortilla ei ole riittävästi varoja. Kokeile toista korttia.
general-paypal-error = Maksua käsitellessä tapahtui odottamaton virhe. Yritä uudestaan.
paypal-active-subscription-no-billing-agreement-error = Vaikuttaa siltä, että { -brand-paypal }-tilisi laskutuksessa oli ongelma. Ota automaattiset maksut uudelleen käyttöön tilauksessasi.

## Processing page and Needs Input page - /checkout and /upgrade
## Common strings used in multiple pages

next-payment-processing-message = Odota kun käsittelemme maksuasi…

## Success page - /checkout and /upgrade
## Common strings used in multiple checkout pages

next-payment-confirmation-thanks-heading-account-exists = Kiitos, tarkista nyt sähköpostisi!
# $email (String) - The user's email.
payment-confirmation-thanks-subheading-account-exists-2 = Saat sähköpostin osoitteeseen { $email }, jossa on tilaustasi koskevat ohjeet sekä maksutietosi.
next-payment-confirmation-order-heading = Tilauksen tiedot
# $invoiceNumber (String) - Invoice number of the successful payment
next-payment-confirmation-invoice-number = Lasku #{ $invoiceNumber }
# $invoiceDate (Date) - Start date of the latest invoice
next-payment-confirmation-invoice-date = { $invoiceDate }
next-payment-confirmation-details-heading-2 = Maksun tiedot

## Success pages (/checkout and /upgrade)
## Common strings used in multiple checkout pages

next-payment-confirmation-download-button = Jatka lataamiseen

## Success pages (/checkout and /upgrade), Start page (/upgrade)
## Common strings used in multiple checkout pages

# $last4 (Number) - Last four numbers of credit card
next-payment-confirmation-cc-card-ending-in = Kortti päättyen { $last4 }

## Page - Subscription Management

subscription-management-page-banner-warning-title-no-payment-method = Maksutapaa ei lisätty
subscription-management-page-banner-warning-link-no-payment-method = Lisää maksutapa
subscription-management-subscriptions-heading = Tilaukset
subscription-management-nav-payment-details = Maksun tiedot
subscription-management-nav-active-subscriptions = Aktiiviset tilaukset
subscription-management-payment-details-heading = Maksun tiedot
subscription-management-email-label = Sähköposti
subscription-management-payment-method-label = Maksutapa
subscription-management-button-add-payment-method-aria = Lisää maksutapa
subscription-management-button-add-payment-method = Lisää
subscription-management-page-warning-message-no-payment-method = Lisää maksutapa, jotta tilauksesi eivät keskeydy.
subscription-management-button-manage-payment-method-aria = Hallinnoi maksutapaa
subscription-management-button-manage-payment-method = Hallitse
# $last4 (String) - Last four numbers of credit card
subscription-management-card-ending-in = Kortti päättyen { $last4 }
# $expirationDate (Date) - Payment card's expiration date
subscription-management-card-expires-date = Vanhenee { $expirationDate }
subscription-management-active-subscriptions-heading = Aktiiviset tilaukset
subscription-management-you-have-no-active-subscriptions = Sinulla ei ole aktiivisia tilauksia
subscription-management-new-subs-will-appear-here = Uudet tilaukset näkyvät täällä.
subscription-management-your-active-subscriptions-aria = Aktiiviset tilauksesi
subscription-management-button-support = Tuki
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscription-management-button-support-aria = { $productName } -tuotetuki
subscription-management-your-apple-iap-subscriptions-aria = Sovelluksen sisäiset { -brand-apple }-ostoksesi
subscription-management-your-google-iap-subscriptions-aria = Sovelluksen sisäiset { -brand-google }-ostoksesi
# $date (String) - Date of next bill
subscription-management-iap-sub-expires-on-expiry-date = Vanhenee { $date }
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscription-management-button-manage-subscription-aria = Hallinnoi { $productName } -tilausta
subscription-management-button-manage-subscription-1 = Hallinnoi tilausta
error-payment-method-banner-title-expired-card = Vanhentunut kortti
error-payment-method-banner-label-update-payment-method = Päivitä maksutapa
error-payment-method-banner-message-account-issue = Tililläsi on ongelma.
subscription-management-button-manage-payment-method-1 = Hallinnoi maksutapaa
manage-payment-methods-heading = Hallinnoi maksutapoja
paypal-payment-management-page-invalid-header = Virheelliset laskutustiedot
# Page - Not Found
page-not-found-title = Sivua ei löydy
page-not-found-description = Pyytämääsi sivua ei löytynyt. Olemme saaneet tästä tiedon ja tulemme korjaamaan rikkinäiset linkit.
page-not-found-back-button = Palaa takaisin

## Navigation breadcrumbs

# Link title - Account settings
subscription-management-breadcrumb-account-home = Tilin koti
# Link title - Subscriptions management
subscription-management-breadcrumb-subscriptions = Tilaukset
# Link title - Payment method management
subscription-management-breadcrumb-payment-2 = Hallitse maksutapoja
# $page refers to page titles used in the breadcrumb menu (e.g. Account Home, Subscriptions, Payment Methods)
subscription-management-breadcrumb-back-aria = Siirry takaisin sivulle { $page }

## CancelSubscription

subscription-cancellation-dialog-title = Jäämme kaipaamaan sinua
subscription-cancellation-dialog-aside = Onko sinulla kysyttävää? Käy <LinkExternal>{ -brand-mozilla }-tuessa</LinkExternal>.

## Component - Payment Consent Checkbox

next-payment-confirm-with-legal-links-static-3 = Valtuutan { -brand-mozilla }n veloittaa maksutapaani näytetyn summan verran, <termsOfServiceLink>käyttöehtojen</termsOfServiceLink> ja <privacyNoticeLink>tietosuojakäytännön</privacyNoticeLink> mukaisesti, kunnes peruutan tilaukseni.
next-payment-confirm-checkbox-error = Sinun on suoritettava tämä vaihe, ennen kuin jatkat eteenpäin

## Checkout Form

next-new-user-submit = Tilaa nyt
next-pay-with-heading-paypal = Maksa { -brand-paypal }illa

## Component - CouponForm

next-coupon-enter-code =
    .placeholder = Kirjoita koodi
# Title of container where a user can input a coupon code to get a discount on a subscription.
next-coupon-promo-code = Tarjouskoodi
# Title of container showing discount coupon code applied to a subscription.
next-coupon-promo-code-applied = Tarjouskoodi sovellettu
next-coupon-remove = Poista
next-coupon-submit = Käytä

# Component - Header

payments-header-help =
    .title = Tuki
    .aria-label = Tuki
    .alt = Tuki
payments-header-bento =
    .title = { -brand-mozilla }-tuotteet
    .aria-label = { -brand-mozilla }-tuotteet
    .alt = { -brand-mozilla }n logo
payments-header-bento-close =
    .alt = Sulje
payments-header-bento-tagline = Lisää yksityisyyttäsi suojaavia tuotteita { -brand-mozilla }lta
payments-header-bento-firefox-desktop = { -brand-firefox }-selain työpöydälle
payments-header-bento-firefox-mobile = { -brand-firefox }-selain mobiililaitteille
payments-header-bento-monitor = { -product-mozilla-monitor }
payments-header-bento-firefox-relay = { -product-firefox-relay }
payments-header-bento-vpn = { -product-mozilla-vpn }
payments-header-bento-made-by-mozilla = { -brand-mozilla }lta
payments-header-avatar =
    .title = { -product-mozilla-account }en valikko
payments-header-avatar-icon =
    .alt = Tilin profiilikuva
payments-header-avatar-expanded-signed-in-as = Kirjautuneena tilillä
payments-header-avatar-expanded-sign-out = Kirjaudu ulos
payments-client-loading-spinner =
    .aria-label = Ladataan…
    .alt = Ladataan…

## Payment method management page - Stripe

# Save button for changing which payment method will be used
payment-method-management-save-default = Aseta oletusmaksutavaksi
# Save button for saving a new payment method
payment-method-management-save-method = Tallenna maksutapa
manage-stripe-payments-title = Hallitse maksutapoja

## Component - PurchaseDetails

next-plan-details-header = Tuotteen tiedot
next-plan-details-list-price = Listahinta
next-plan-details-tax = Verot ja maksut
next-plan-details-total-label = Yhteensä
# "Unused time" refers to the remaining value of the current subscription that hasn't been used yet
purchase-details-unused-time-label = Hyvitys käyttämättömästä ajasta
purchase-details-subtotal-label = Välisumma
# "Credit applied" refers to account credit used to reduce the amount due on the invoice
purchase-details-credit-applied-label = Hyvitys käytetty
# "Total due" is the total that the customer owes after all credits, discounts, and taxes have been applied
purchase-details-total-due-label = Maksettavaa
next-plan-details-hide-button = Piilota tiedot
next-plan-details-show-button = Näytä tiedot
next-coupon-success = Tilauksesi uusitaan automaattisesti listahintaan.
# $couponDurationDate (Date) - The date at which the coupon is no longer valid, and the subscription is billed the list price.
next-coupon-success-repeating = Tilauksesi uusiutuu automaattisesti { $couponDurationDate } listahinnan mukaisesti.

## Select Tax Location

select-tax-location-title = Sijainti
select-tax-location-edit-button = Muokkaa
select-tax-location-save-button = Tallenna
select-tax-location-continue-to-checkout-button = Jatka kassalle
select-tax-location-country-code-label = Maa
select-tax-location-country-code-placeholder = Valitse maa
select-tax-location-error-missing-country-code = Valitse maa
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN
select-tax-location-product-not-available = { $productName } ei ole saatavilla tässä sijainnissa.
select-tax-location-postal-code-label = Postinumero
select-tax-location-postal-code =
    .placeholder = Kirjoita postinumerosi
select-tax-location-error-missing-postal-code = Kirjoita postinumerosi
select-tax-location-error-invalid-postal-code = Kirjoita kelvollinen postinumero
select-tax-location-successfully-updated = Sijaintisi on päivitetty.
select-tax-location-error-location-not-updated = Sijaintiasi ei voitu päivittää. Yritä uudelleen.
#  $currencyDisplayName (String) - The display name of a currency code, e.g. US Dollar
select-tax-location-invalid-currency-change = Tilisi laskutus tapahtuu valuutassa { $currencyDisplayName }. Valitse maa, joka käyttää valuuttaa { $currencyDisplayName }.
signin-form-continue-button = Jatka
signin-form-email-input = Kirjoita sähköpostiosoitteesi
signin-form-email-input-missing = Kirjoita sähköpostiosoitteesi
signin-form-email-input-invalid = Kirjoita kelvollinen sähköpostiosoite
next-new-user-subscribe-product-updates-mdnplus = Haluan saada tuoteuutisia ja päivityksiä { -product-mdn-plus } -palvelusta ja { -brand-mozilla }lta
next-new-user-subscribe-product-updates-mozilla = Haluan saada tuoteuutisia ja päivityksiä { -brand-mozilla }lta
next-new-user-subscribe-product-updates-snp = Haluan saada turvallisuus- ja tietosuojauutisia sekä päivityksiä { -brand-mozilla }lta
next-new-user-subscribe-product-assurance = Käytämme sähköpostiosoitettasi vain tilin luomiseen. Emme koskaan myy sitä kolmannelle osapuolelle.

## $productName (String) - The name of the subscribed product.

resubscribe-dialog-title = Haluatko jatkaa tuotteen { $productName } käyttämistä?
subscription-content-button-resubscribe = Tilaa uudelleen
    .aria-label = Tilaa { $productName } uudelleen
resubscribe-success-dialog-title = Kiitos! Kaikki on nyt valmiina.

## $billOnDate (Date) - The billing date of the current invoice (e.g., September 8, 2025)
## $creditApplied (Number) - The amount from account credit balance used to reduce the amount due on the invoice
## $currentPeriodEnd (Date) - The end date of the subscription's current billing period (e.g., September, 8, 2025)
## $invoiceTotal (Number) - The amount billed (excluding tax if tax does not exist). It will be formatted as currency.
## $nextBillDate (Date) - The date for the next time a charge will occur (e.g., September 8, 2025)
## $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
## $promotionName (String) - The name of the promotion.
## $taxDue (Number) - The tax added on, not included in amount. It will be formatted as currency.

# • is acting as a separator between "Last bill" and the billing date.
subscription-content-last-bill = Viimeisin lasku • { $billedOnDate }
subscription-content-last-bill-with-tax = { $invoiceTotal } + { $taxDue } vero
subscription-content-last-bill-no-tax = { $invoiceTotal }
subscription-content-view-invoice = Näytä lasku
subscription-content-expires-on-expiry-date = Vanhenee { $date }
# • is acting as a separator between "Next bill" and the next billing date.
subscription-content-next-bill = Seuraava lasku • { $billedOnDate }
subscription-content-next-bill-with-tax-1 = { $nextInvoiceTotal } + { $taxDue } vero
subscription-content-next-bill-no-tax-1 = { $nextInvoiceTotal }
subscription-content-button-stay-subscribed = Jatka tilausta
    .aria-label = Jatka tuotteen { $productName } tilausta
subscription-content-button-cancel-subscription = Peruuta tilaus
    .aria-label = Peruuta tuotteen { $productName } tilaus

##

subscription-content-cancel-action-error = Tapahtui odottamaton virhe. Yritä uudelleen.

## PriceInterval - shared by multiple components, including Details and PurchaseDetails
## $amount (Number) - The amount billed. It will be formatted as currency.

plan-price-interval-daily = { $amount } päivittäin
plan-price-interval-weekly = { $amount } viikottain
plan-price-interval-monthly = { $amount } kuukausittain
plan-price-interval-halfyearly = { $amount } puolivuosittain
plan-price-interval-yearly = { $amount } vuosittain

## Component - SubscriptionTitle

next-subscription-create-title = Määritä tilaus
next-subscription-success-title = Tilauksen vahvistus
next-subscription-processing-title = Vahvistetaan tilausta…
next-subscription-error-title = Virhe tilausta vahvistaessa…
subscription-title-sub-exists = Olet jo tilannut
subscription-title-plan-change-heading = Tarkista muutos
subscription-title-not-supported = Tämä tilaustyypin vaihtaminen ei ole tuettu
next-sub-guarantee = 30 päivän rahat takaisin -takuu

## Component - TermsAndPrivacy

# "Mozilla Accounts" is capitalized in this instance for title case in English
# This heading is followed by links to Terms of Service and Privacy Notice
next-subplat-mozilla-accounts-legal-heading = { -product-mozilla-accounts(capitalization: "uppercase") }
next-terms = Käyttöehdot
next-privacy = Tietosuojakäytäntö
next-terms-download = Latausehdot
terms-and-privacy-stripe-label = { -brand-mozilla } käyttää { -brand-name-stripe }a turvalliseen maksunvälitykseen.
terms-and-privacy-stripe-link = { -brand-name-stripe }n tietosuojakäytäntö
terms-and-privacy-paypal-label = { -brand-mozilla } käyttää { -brand-paypal }ia turvalliseen maksunvälitykseen.
terms-and-privacy-paypal-link = { -brand-paypal }in tietosuojakäytäntö
terms-and-privacy-stripe-and-paypal-label = { -brand-mozilla } käyttää { -brand-name-stripe }a ja { -brand-paypal }ia turvalliseen maksunvälitykseen.

## Component - UpdatedPurchaseDetails

upgrade-purchase-details-current-plan-label = Nykyinen tilaustyyppi
upgrade-purchase-details-new-plan-label = Uusi tilaustyyppi
upgrade-purchase-details-promo-code = Tarjouskoodi
upgrade-purchase-details-tax-label = Verot ja maksut
# "Credit issued to account" refers to credit that will be added to the account balance that will be used toward future invoices
upgrade-purchase-details-credit-to-account = Tilille myönnetty hyvitys
upgrade-purchase-details-credit-will-be-applied = Hyvitys lisätään tilillesi ja sitä käytetään tulevien laskujen maksamiseen.

## $productName (String) - Name of the upgraded product (e.g. Mozilla VPN)
## Daily/Weekly/Monthly/Yearly refers to the subscription interval/amount of time between billing occurrences

upgrade-purchase-details-new-plan-daily = { $productName } (päivittäin)
upgrade-purchase-details-new-plan-weekly = { $productName } (viikoittain)
upgrade-purchase-details-new-plan-monthly = { $productName } (kuukausittain)
upgrade-purchase-details-new-plan-halfyearly = { $productName } (6 kuukautta)
upgrade-purchase-details-new-plan-yearly = { $productName } (vuosittain)

## Page Metadata Information
## $productTitle (String) - The name of the product to create subscription, e.g. Mozilla VPN

# Checkout start
metadata-title-checkout-start = Kassa | { $productTitle }
metadata-description-checkout-start = Kirjoita maksutietosi ostoksen suorittamiseksi loppuun.
# Checkout processing
metadata-title-checkout-processing = Käsitellään | { $productTitle }
metadata-description-checkout-processing = Odota, kun käsittelemme maksuasi.
# Checkout error
metadata-title-checkout-error = Virhe | { $productTitle }
metadata-description-checkout-error = Tilauksesi käsittelyssä tapahtui virhe. Jos ongelma jatkuu, ota yhteys tukeen.
# Checkout success
metadata-title-checkout-success = Onnistui | { $productTitle }
metadata-description-checkout-success = Onnittelut! Olet suorittanut ostoksen onnistuneesti.
# Checkout needs_input
metadata-title-checkout-needs-input = Toimenpiteitä vaaditaan | { $productTitle }
# Upgrade processing
metadata-title-upgrade-processing = Käsitellään | { $productTitle }
metadata-description-upgrade-processing = Odota, kun käsittelemme maksuasi.
# Upgrade error
metadata-title-upgrade-error = Virhe | { $productTitle }
# Upgrade success
metadata-title-upgrade-success = Onnistui | { $productTitle }
# Upgrade needs_input
metadata-title-upgrade-needs-input = Toimenpiteitä vaaditaan | { $productTitle }
# Default
metadata-title-default = Sivua ei löytynyt | { $productTitle }
metadata-description-default = Pyytämääsi sivua ei löytynyt.

## Coupon Error Messages

next-coupon-error-cannot-redeem = Antamaasi koodia ei voi lunastaa — tililläsi on aiempi tilaus johonkin palveluistamme.
next-coupon-error-expired = Antamasi koodi on vanhentunut.
next-coupon-error-generic = Koodia käsiteltäessä tapahtui virhe. Yritä uudelleen.
next-coupon-error-invalid = Antamasi koodi on virheellinen.
# "Limit" refers to the maximum number of times a coupon can be redeemed.
next-coupon-error-limit-reached = Antamasi koodi on käytetty liian monta kertaa.

## Stay Subscribed Error Messages

stay-subscribed-error-expired = Tämä tarjous on päättynyt.
stay-subscribed-error-discount-used = Alennuskoodi on jo käytetty.
stay-subscribed-error-general = Tilauksesi uusimisessa oli ongelma.
