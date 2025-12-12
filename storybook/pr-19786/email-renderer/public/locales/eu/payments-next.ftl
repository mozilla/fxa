## Page

checkout-signin-or-create = 1. saioa hasi { -product-mozilla-account } kontuan
# This string appears as a separation between the two sign-in options, "Enter your email"(signin-form-email-input) "or"(this string) "Continue with Google"(continue-signin-with-google-button) / "Continue with Apple"(continue-signin-with-apple-button)
checkout-signin-options-or = edo
continue-signin-with-google-button = { -brand-google }ekin jarraitu
continue-signin-with-apple-button = { -brand-apple }(e)kin jarraitu
next-payment-method-header = Hautatu zure ordaiketa metodoa
# This message is used to indicate the second step in a multi step process.
payment-method-header-second-step-next = 2. { next-payment-method-header }
next-payment-method-first-approve = Lehenik eta behin zure harpidetza onartu beharko duzu
# $productName (String) - The name of the product to create subscription, e.g. Mozilla VPN
location-header = Hautatu zure herrialdea eta idatzi zure posta kodea <p>{ $productName } </p>-ren ordainketarekin jarraitzeko
location-banner-info = Ezin izan dugu zure kokapena automatikoki detektatu
location-required-disclaimer = Informazio hau zergak eta moneta-aldaketa kalkulatzeko bakarrik erabiltzen dugu.

## Page - Upgrade page

upgrade-page-payment-information = Ordainketa informazioa
# $nextInvoiceDate (number) - The date of the next invoice
upgrade-page-acknowledgment =
    Zure plana berehala aldatuko da, eta proportzioan kobratuko dizugu
    zenbatekoa. gaurtik fakturazio-ziklo honen gainerako. { $nextInvoiceDate }
    hasita kopuru osoa kobratuko dizute.

## Authentication Error page

checkout-error-boundary-retry-button = Saiatu berriro
checkout-error-boundary-basic-error-message = Zerbait gaizki joan da. Mesedez, saiatu berriro edo <contactSupportLink>jarri laguntzarekin harremanetan.</contactSupportLink>

## Error pages - /checkout and /upgrade
## Common strings used in multiple pages

next-payment-error-manage-subscription-button = Kudeatu nire harpidetza
next-payment-error-retry-button = Saiatu berriro
next-basic-error-message = Zerbait oker joan da. Mesedez, berriro saiatu beranduago.
checkout-error-contact-support-button = Laguntza kontaktua
checkout-error-not-eligible = Ez duzu produktu honetara harpidetzeko eskubidea. Jarri laguntza-zerbitzuarekin lagundu ahal izateko.
checkout-error-already-subscribed = Produktu honetara harpidetuta zaude dagoeneko.
checkout-error-contact-support = Mesedez, jarri harremanetan laguntzarekin lagundu ahal izateko.
cart-error-currency-not-determined = Ezin izan dugu erosketa honen moneta zehaztu, saiatu berriro mesedez.
checkout-processing-general-error = Ustekabeko errore bat gertatu da ordainketa prozesatzen ari zaren bitartean. Saiatu berriro.

## Processing page and Needs Input page - /checkout and /upgrade
## Common strings used in multiple pages

next-payment-processing-message = Mesedez, itxaron ordainketa prozesatzen dugun bitartean…

## Success page - /checkout and /upgrade
## Common strings used in multiple checkout pages

next-payment-confirmation-thanks-heading-account-exists = Eskerri asko, begiratu zure posta elektronikoa
# $email (String) - The user's email.
payment-confirmation-thanks-subheading-account-exists-2 = Mezu elektroniko bat jasoko duzu { $email } helbidean zure harpidetzari buruzko argibideekin, baita zure ordainketa xehetasunekin ere.
next-payment-confirmation-order-heading = Eskaeraren xehetasunak
# $invoiceNumber (String) - Invoice number of the successful payment
next-payment-confirmation-invoice-number = Faktura #{ $invoiceNumber }
# $invoiceDate (Date) - Start date of the latest invoice
next-payment-confirmation-invoice-date = { $invoiceDate }
next-payment-confirmation-details-heading-2 = Ordainketa informazioa

## Success pages (/checkout and /upgrade)
## Common strings used in multiple checkout pages

next-payment-confirmation-download-button = Jarraitu deskargara

## Success pages (/checkout and /upgrade), Start page (/upgrade)
## Common strings used in multiple checkout pages

# $last4 (Number) - Last four numbers of credit card
next-payment-confirmation-cc-card-ending-in = { $last4 }-z amaitzen den txartela

## Page - Subscription Management

# Page - Not Found
page-not-found-title = Ez da orria aurkitu
page-not-found-description = Eskatu duzun orria ez dago. Abisua jaso dugu eta hautsita egon daitezkeen estekak konponduko ditugu.
page-not-found-back-button = Joan atzera

## Component - Payment Consent Checkbox

next-payment-confirm-with-legal-links-static-3 = Baimena ematen diot { -brand-mozilla }-ri nire ordainketa-metodoari kobratzeko erakutsitako zenbatekoa, <termsOfServiceLink>Zerbitzu-baldintzen arabera</termsOfServiceLink> eta <privacyNoticeLink>Pribatutasun-oharra</privacyNoticeLink>, nire harpidetza bertan behera utzi arte.
next-payment-confirm-checkbox-error = Hau osatu behar duzu aurrera egin aurretik

## Checkout Form

next-new-user-submit = Harpidetu orain
next-payment-validate-name-error = Idatzi zure izena
next-pay-with-heading-paypal = Ordaindu { -brand-paypal } erabiliz
# Label for the Full Name input
payment-name-label = Izena zure txartelan agertzen den bezala
payment-name-placeholder = Izen osoa

## Component - CouponForm

next-coupon-enter-code =
    .placeholder = Sartu kodea
# Title of container where a user can input a coupon code to get a discount on a subscription.
next-coupon-promo-code = Sustapen kodea
# Title of container showing discount coupon code applied to a subscription.
next-coupon-promo-code-applied = Promozio kodea aplikatuta
next-coupon-remove = Kendu
next-coupon-submit = Aplikatu

# Component - Header

payments-header-help =
    .title = Laguntza
    .aria-label = Laguntza
    .alt = Laguntza
payments-header-bento =
    .title = { -brand-mozilla } produktuak
    .aria-label = { -brand-mozilla } produktuak
    .alt = { -brand-mozilla } logoa
payments-header-bento-close =
    .alt = Itxi
payments-header-bento-tagline = Zure pribatutasuna babesten duten { -brand-mozilla }ren produktu gehiago
payments-header-bento-firefox-desktop = Mahaigainerako { -brand-firefox } nabigatzailea
payments-header-bento-firefox-mobile = Mugikorrerako { -brand-firefox } nabigatzailea
payments-header-bento-monitor = { -product-mozilla-monitor }
payments-header-bento-firefox-relay = { -product-firefox-relay }
payments-header-bento-vpn = { -product-mozilla-vpn }
payments-header-bento-made-by-mozilla = { -brand-mozilla }(e)k egina
payments-header-avatar =
    .title = { -product-mozilla-account } menua
payments-header-avatar-icon =
    .alt = Kontuaren profileko irudia
payments-header-avatar-expanded-signed-in-as = Saioa hasita:
payments-header-avatar-expanded-sign-out = Amaitu saioa
payments-client-loading-spinner =
    .aria-label = Kargatzen…
    .alt = Kargatzen…

## Payment Section

next-new-user-card-title = Sartu zure txartelaren informazioa

## Component - PurchaseDetails

next-plan-details-header = Produktuaren xehetasuna
next-plan-details-list-price = Prezio zerrenda
next-plan-details-tax = Zergak eta Tasak
next-plan-details-total-label = Guztira
next-plan-details-hide-button = Ezkutatu xehetasunak
next-plan-details-show-button = Erakutsi xehetasunak
next-coupon-success = Zure plana automatikoki berrituko da zerrendako prezioan.
# $couponDurationDate (Date) - The date at which the coupon is no longer valid, and the subscription is billed the list price.
next-coupon-success-repeating = Zure plana automatikoki berrituko da { $couponDurationDate } ondoren zerrendako prezioan.

## Select Tax Location

select-tax-location-title = Kokalekua
select-tax-location-edit-button = Editatu
select-tax-location-save-button = Gorde
select-tax-location-continue-to-checkout-button = Jarraitu erosketaz
select-tax-location-country-code-label = Herrialdea
select-tax-location-country-code-placeholder = Hautatu zure herrialdea
select-tax-location-error-missing-country-code = Mesedez hautatu zure herrialdea
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN
select-tax-location-product-not-available = { $productName } ez dago eskuragarri kokapen honetan.
select-tax-location-postal-code-label = Posta-kodea
select-tax-location-postal-code =
    .placeholder = Sartu zure posta-kodea
select-tax-location-error-missing-postal-code = Mesedez sartu zure posta-kodea
select-tax-location-error-invalid-postal-code = Idatzi baliozko posta-kodea
select-tax-location-successfully-updated = Zure kokapena eguneratu da.
select-tax-location-error-location-not-updated = Ezin izan da zure kokapena eguneratu. Mesedez, saiatu berriro.
signin-form-continue-button = Jarraitu
signin-form-email-input = Idatzi zure helbide elektronikoa
signin-form-email-input-missing = Idatzi zure helbide elektronikoa mesedez
signin-form-email-input-invalid = Mesedez, eman baliozko posta elektroniko bat
next-new-user-subscribe-product-updates-mdnplus = { -product-mdn-plus } eta { -brand-mozilla } produktuen berri eta eguneraketak jaso nahi ditut
next-new-user-subscribe-product-updates-mozilla = { -brand-mozilla } produktuen berri eta eguneraketak jaso nahi ditut.
next-new-user-subscribe-product-updates-snp = { -brand-mozilla } segurtasun eta pribatutasun albisteak eta eguneraketak jaso nahi ditut.
next-new-user-subscribe-product-assurance = Zure posta elektronikoa zure kontua sortzeko soilik erabiltzen dugu. Ez diogu inoiz hirugarren bati salduko.

## PriceInterval - shared by multiple components, including Details and PurchaseDetails
## $amount (Number) - The amount billed. It will be formatted as currency.

plan-price-interval-daily = { $amount } egunero
plan-price-interval-weekly = { $amount } astero
plan-price-interval-monthly = { $amount } hilero
plan-price-interval-halfyearly = { $amount } sei hilero
plan-price-interval-yearly = { $amount } urtero

## Component - SubscriptionTitle

next-subscription-create-title = Zure harpidetzaren ezarpenak
next-subscription-success-title = Harpidetza baieztapena
next-subscription-processing-title = Harpidetza baieztatzen…
next-subscription-error-title = Errorea harpidetza baieztatzen…
subscription-title-sub-exists = Bazadude harpidetua
subscription-title-plan-change-heading = Berrikusi zure aldaketa
next-sub-guarantee = 30 eguneko dirua itzultzeko bermea

## Component - TermsAndPrivacy

# "Mozilla Accounts" is capitalized in this instance for title case in English
# This heading is followed by links to Terms of Service and Privacy Notice
next-subplat-mozilla-accounts-legal-heading = { -product-mozilla-accounts(capitalization: "uppercase") }
next-terms = Zerbitzuaren baldintzak
next-privacy = Pribatutasun-oharra
next-terms-download = Deskargatu baldintzak
terms-and-privacy-stripe-label = { -brand-mozilla }-k { -brand-name-stripe } darabil ordainketa seguruak izateko.
terms-and-privacy-stripe-link = { -brand-name-stripe }en pribatutasun-oharra
terms-and-privacy-paypal-label = { -brand-mozilla }-k { -brand-paypal } darabil ordainketa seguruak izateko.
terms-and-privacy-paypal-link = { -brand-paypal }en pribatutasun politika
terms-and-privacy-stripe-and-paypal-label = { -brand-mozilla }-k { -brand-name-stripe } eta { -brand-paypal } erabiltzen ditu ordainketa seguruak izateko.

## Component - UpdatedPurchaseDetails

upgrade-purchase-details-current-plan-label = Uneko plana
upgrade-purchase-details-new-plan-label = Plan berria
upgrade-purchase-details-promo-code = Sustapen kodea
upgrade-purchase-details-tax-label = Zergak eta Tasak

## $productName (String) - Name of the upgraded product (e.g. Mozilla VPN)
## Daily/Weekly/Monthly/Yearly refers to the subscription interval/amount of time between billing occurrences

upgrade-purchase-details-new-plan-daily = { $productName } (egunero)
upgrade-purchase-details-new-plan-weekly = { $productName } (astero)
upgrade-purchase-details-new-plan-monthly = { $productName } (hilero)
upgrade-purchase-details-new-plan-halfyearly = { $productName } (6-hilabete)
upgrade-purchase-details-new-plan-yearly = { $productName } (urtero)
