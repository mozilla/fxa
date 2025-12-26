# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.


## Component - AppLayout

settings-home = Account-startside
settings-project-header-title = { -product-mozilla-account }

## Component - CouponForm

# Title of container showing discount coupon code applied to a subscription.
coupon-promo-code-applied = Promoasjekoade tapast
coupon-submit = Tapasse
coupon-remove = Fuortsmite
coupon-error = De ynfierde koartingskoade is ûnjildich of ferrûn.
coupon-error-generic = Der is in flater bard by it ferwurkjen fan de koade. Probearje it opnij.
coupon-error-expired = De ynfierde koade is ferrûn.
coupon-error-limit-reached = De ynfierde koade hat syn limyt berikt.
coupon-error-invalid = De ynfierde koade is ûnjildich.
# $couponDurationDate (Date) - The date at which the coupon is no longer valid, and the subscription is billed the list price.
coupon-enter-code =
    .placeholder = Koade ynfiere

## Component - Fields

default-input-error = Dit fjild is ferplichte
input-error-is-required = { $label } is ferplicht

## Component - Header

brand-name-mozilla-logo = { -brand-mozilla }-logo

## Component - NewUserEmailForm

new-user-sign-in-link-2 = Hawwe jo al in { -product-mozilla-account }? <a>Oanmelde</a>
# "Required" to indicate that the user must use the checkbox below this text to
# agree to a payment method's terms of service and privacy notice in order to
# continue.
new-user-enter-email =
    .label = Fier jo e-mailadres yn
new-user-confirm-email =
    .label = Befêstigje jo e-mailadres
new-user-subscribe-product-updates-mozilla = Ik wol graach produktnijs en -updates fan { -brand-mozilla } ûntfange
new-user-subscribe-product-updates-snp = Ik wol graach befeiligings- en privacynijs en updates fan { -brand-mozilla } ûntfange
new-user-subscribe-product-updates-hubs = Ik wol graach produktnijs en -updates fan { -product-mozilla-hubs } en { -brand-mozilla } ûntfange
new-user-subscribe-product-updates-mdnplus = Ik wol graach produktnijs en -updates fan { -product-mdn-plus } en { -brand-mozilla } ûntfange
new-user-subscribe-product-assurance = Wy brûke jo e-mailadres allinnich om jo account oan te meitsjen. Wy sille it nea oan in tredde partij ferkeapje.
new-user-email-validate = E-mailadres is net jildich
new-user-email-validate-confirm = E-mailadressen komme net oerien
new-user-already-has-account-sign-in = Jo hawwe al in account. <a>Oanmelde</a>
# $domain (String) - the email domain provided by the user during sign up
new-user-invalid-email-domain = Hawwe jo it e-mailadres ferkeard ynfierd? { $domain } biedt gjin e-mail oan.

## Component - PaymentConfirmation

payment-confirmation-thanks-heading = Tige tank!
payment-confirmation-thanks-heading-account-exists = Tige tank, kontrolearje no jo e-mail!
# $email (string) - The user's email.
# $productName (String) - The name of the subscribed product.
payment-confirmation-thanks-subheading = Der is in befêstigingsberjocht ferstjoerd nei { $email } mei details oer hoe’t jo oan de slach kinne mei { $product_name }.
# $email (string) - The user's email.
payment-confirmation-thanks-subheading-account-exists = Jo ûntfange in e-mailberjocht op { $email } mei ynstruksjes oer it ynstellen fan jo account, krekt as jo betellingsgegevens.
payment-confirmation-order-heading = Bestelgegevens
payment-confirmation-invoice-number = Faktuernr. { $invoiceNumber }
# $invoiceDate (Date) - Start date of the latest invoice
payment-confirmation-invoice-date = { $invoiceDate }
payment-confirmation-details-heading-2 = Betellingsgegevens
payment-confirmation-amount = { $amount } per { $interval }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in days.
payment-confirmation-amount-day =
    { $intervalCount ->
        [one] deistich { $amount }
       *[other] elke { $intervalCount } dagen { $amount }
    }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in weeks.
payment-confirmation-amount-week =
    { $intervalCount ->
        [one] wykliks { $amount }
       *[other] elke { $intervalCount } wiken { $amount }
    }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in months.
payment-confirmation-amount-month =
    { $intervalCount ->
        [one] moanliks { $amount }
       *[other] elke { $intervalCount } moannen { $amount }
    }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in years.
payment-confirmation-amount-year =
    { $intervalCount ->
        [one] jierliks { $amount }
       *[other] elke { $intervalCount } jier { $amount }
    }
payment-confirmation-download-button = Trochgean mei download

## Component - PaymentConsentCheckbox

payment-confirm-with-legal-links-static-3 = Ik autorisearje { -brand-mozilla } om myn betelmetoade foar it toande bedrach te belêsten, yn oerienstimming mei de <termsOfServiceLink>Tsjinstbetingsten</termsOfServiceLink> en de <privacyNoticeLink>Privacyferklearring</privacyNoticeLink>, oant ik myn abonnemint beëinigje.
payment-confirm-checkbox-error = Jo moatte dit foltôgje eardat jo fierder gean

## Component - PaymentErrorView

payment-error-retry-button = Opnij probearje
payment-error-manage-subscription-button = Myn abonnemint beheare

## Component - PaymentErrorView - IAP upgrade errors

# $productName (String) - The name of the subscribed product.
iap-upgrade-already-subscribed-2 = Jo hawwe al in abonnemint op { $productName } fia de appstore { -brand-google } of { -brand-apple }.
iap-upgrade-no-bundle-support = Wy stypje gjin upwurdearringen foar dizze abonneminten, mar dat dogge wy ynkoarten wol.
iap-upgrade-contact-support = Jo kinne dit produkt noch hieltyd krije – nim kontakt op mei de stipeôfdieling, sadat wy jo helpe kinne.
iap-upgrade-get-help-button = Help krije

## Component - PaymentForm

payment-name =
    .placeholder = Folsleine namme
    .label = Namme lykas werjûn op jo kaart
payment-cc =
    .label = Jo kaart
payment-cancel-btn = Annulearje
payment-update-btn = Bywurkje
payment-pay-btn = No betelje
payment-pay-with-paypal-btn-2 = Betelje mei { -brand-paypal }
payment-validate-name-error = Fier jo namme yn

## Component - PaymentLegalBlurb

payment-legal-copy-stripe-and-paypal-3 = { -brand-mozilla } brûkt { -brand-name-stripe } en { -brand-paypal } foar feilich betellingsferkear.
payment-legal-link-stripe-paypal-2 = <stripePrivacyLink>{ -brand-name-stripe }-privacybelied</stripePrivacyLink> &nbsp; <paypalPrivacyLink>{ -brand-paypal }-privacybelied</paypalPrivacyLink>.
payment-legal-copy-paypal-2 = { -brand-mozilla } brûkt { -brand-paypal } foar feilich betellingsferkear.
payment-legal-link-paypal-3 = <paypalPrivacyLink>{ -brand-paypal }-privacybelied</paypalPrivacyLink>.
payment-legal-copy-stripe-3 = { -brand-mozilla } brûkt { -brand-name-stripe } foar feilich betellingsferkear.
payment-legal-link-stripe-3 = <stripePrivacyLink>{ -brand-name-stripe }-privacybelied</stripePrivacyLink>.

## Component - PaymentMethodHeader

payment-method-header = Kies jo betellingsmetoade
# This message is used to indicate the second step in a multi step process.
payment-method-header-second-step = 2. { payment-method-header }
payment-method-first-approve = Jo moatte earst jo abonnemint goedkarre

## Component - PaymentProcessing

payment-processing-message = In momint wylst wy jo betelling ferwurkje…

## Component - PaymentProviderDetails

payment-confirmation-cc-card-ending-in = Creditcard einigjend op { $last4 }

## Component - PayPalButton

pay-with-heading-paypal-2 = Betelje mei { -brand-paypal }

## Component - PlanDetails

plan-details-header = Produktdetails
plan-details-list-price = Normale priis
plan-details-show-button = Details toane
plan-details-hide-button = Details ferstopje
plan-details-total-label = Totaal
plan-details-tax = Belestingen en heffingen

## Component - PlanErrorDialog

product-no-such-plan = Soksoarte skema bestiet net foar dit produkt.

## Price details including tax
## $priceAmount (Number) - The amount billed. It will be formatted as currency.
## $taxAmount (Number) - The tax added on, not included in amount. It will be formatted as currency.

price-details-no-tax = { $priceAmount }
price-details-tax = { $priceAmount } + { $taxAmount } belesting
# $intervalCount (Number) - The interval between payments, in days.
price-details-no-tax-day =
    { $intervalCount ->
        [one] deistich { $priceAmount }
       *[other] elke { $intervalCount } dagen { $priceAmount }
    }
    .title =
        { $intervalCount ->
            [one] deistich { $priceAmount }
           *[other] elke { $intervalCount } dagen { $priceAmount }
        }
# $intervalCount (Number) - The interval between payments, in weeks.
price-details-no-tax-week =
    { $intervalCount ->
        [one] wykliks { $priceAmount }
       *[other] elke { $intervalCount } wiken { $priceAmount }
    }
    .title =
        { $intervalCount ->
            [one] wykliks { $priceAmount }
           *[other] elke { $intervalCount } wiken { $priceAmount }
        }
# $intervalCount (Number) - The interval between payments, in months.
price-details-no-tax-month =
    { $intervalCount ->
        [one] moanliks { $priceAmount }
       *[other] elke { $intervalCount } moannen { $priceAmount }
    }
    .title =
        { $intervalCount ->
            [one] moanliks { $priceAmount }
           *[other] elke { $intervalCount } moannen { $priceAmount }
        }
# $intervalCount (Number) - The interval between payments, in years.
price-details-no-tax-year =
    { $intervalCount ->
        [one] jierliks { $priceAmount }
       *[other] elke { $intervalCount } jier { $priceAmount }
    }
    .title =
        { $intervalCount ->
            [one] jierliks { $priceAmount }
           *[other] elke { $intervalCount } jier { $priceAmount }
        }
# $intervalCount (Number) - The interval between payments, in days.
price-details-tax-day =
    { $intervalCount ->
        [one] deistich { $priceAmount } + { $taxAmount } belesting
       *[other] elke { $intervalCount } dagen { $priceAmount } + { $taxAmount } belesting
    }
    .title =
        { $intervalCount ->
            [one] deistich { $priceAmount } + { $taxAmount } belesting
           *[other] elke { $intervalCount } dagen { $priceAmount } + { $taxAmount } belesting
        }
# $intervalCount (Number) - The interval between payments, in weeks.
price-details-tax-week =
    { $intervalCount ->
        [one] wykliks { $priceAmount } + { $taxAmount } belesting
       *[other] elke { $intervalCount } wiken { $priceAmount } + { $taxAmount } belesting
    }
    .title =
        { $intervalCount ->
            [one] wykliks { $priceAmount } + { $taxAmount } belesting
           *[other] elke { $intervalCount } wiken { $priceAmount } + { $taxAmount } belesting
        }
# $intervalCount (Number) - The interval between payments, in months.
price-details-tax-month =
    { $intervalCount ->
        [one] moanliks { $priceAmount } + { $taxAmount } belesting
       *[other] elke { $intervalCount } moannen { $priceAmount } + { $taxAmount } belesting
    }
    .title =
        { $intervalCount ->
            [one] moanliks { $priceAmount } + { $taxAmount } belesting
           *[other] elke { $intervalCount } moannen { $priceAmount } + { $taxAmount } belesting
        }
# $intervalCount (Number) - The interval between payments, in years.
price-details-tax-year =
    { $intervalCount ->
        [one] jierliks { $priceAmount } + { $taxAmount } belesting
       *[other] elke { $intervalCount } jier { $priceAmount } + { $taxAmount } belesting
    }
    .title =
        { $intervalCount ->
            [one] jierliks { $priceAmount } + { $taxAmount } belesting
           *[other] elke { $intervalCount } jier { $priceAmount } + { $taxAmount } belesting
        }

## Component - SubscriptionTitle

subscription-create-title = Jo abonnemint ynstelle
subscription-success-title = Abonnemintsbefêstiging
subscription-processing-title = Abonnemint befêstigje…
subscription-error-title = Flater by befêstigjen abonnemint…
subscription-noplanchange-title = Dizze abonnemintswiziging wurdt net stipe
subscription-iapsubscribed-title = Al abonnearre
sub-guarantee = 30-dagen-jildweromgarânsje

## Component - TermsAndPrivacy

# "Mozilla Accounts" is capitalized in this instance for title case in English
# This heading is followed by links to Terms of Service and Privacy Notice
subplat-mozilla-accounts-legal-heading = { -product-mozilla-accounts(capitalization: "uppercase") }
terms = Tsjinstbetingsten
privacy = Privacyferklearring
terms-download = Betingsten downloade

## App-level string(s) and messages shared by multiple components or routes

document =
    .title = Firefox Accounts
# General aria-label for closing modals
close-aria =
    .aria-label = Modal slute
settings-subscriptions-title = Abonneminten
# Title of container where a user can input a coupon code to get a discount on a subscription.
coupon-promo-code = Promoasjekoade

## Subscription upgrade plan details - shared by multiple components, including plan details and payment form
## $amount (Number) - The amount billed. It will be formatted as currency.

# $intervalCount (Number) - The interval between payments, in days.
plan-price-interval-day =
    { $intervalCount ->
        [one] deistich { $amount }
       *[other] elke { $intervalCount } dagen { $amount }
    }
    .title =
        { $intervalCount ->
            [one] deistich { $amount }
           *[other] elke { $intervalCount } dagen { $amount }
        }
# $intervalCount (Number) - The interval between payments, in weeks.
plan-price-interval-week =
    { $intervalCount ->
        [one] wykliks { $amount }
       *[other] elke { $intervalCount } wiken { $amount }
    }
    .title =
        { $intervalCount ->
            [one] wykliks { $amount }
           *[other] elke { $intervalCount } wiken { $amount }
        }
# $intervalCount (Number) - The interval between payments, in months.
plan-price-interval-month =
    { $intervalCount ->
        [one] moanliks { $amount }
       *[other] elke { $intervalCount } moannen { $amount }
    }
    .title =
        { $intervalCount ->
            [one] moanliks { $amount }
           *[other] elke { $intervalCount } moannen { $amount }
        }
# $intervalCount (Number) - The interval between payments, in years.
plan-price-interval-year =
    { $intervalCount ->
        [one] jierliks { $amount }
       *[other] elke { $intervalCount } jier { $amount }
    }
    .title =
        { $intervalCount ->
            [one] jierliks { $amount }
           *[other] elke { $intervalCount } jier { $amount }
        }

## Error messages

# App error dialog
general-error-heading = Algemiene tapassingsflater
basic-error-message = Der is wat misgien. Probearje it letter opnij.
payment-error-1 = Hmm. Der wie in probleem by it autorisearjen fan jo betelling. Probearje it opnij of nim kontakt mei jo kaartferstrekker.
payment-error-2 = Hmm. Der wie in probleem by it autorisearjen fan jo betelling. Nim kontakt mei jo kaartferstrekker.
payment-error-3b = Der is in ûnferwachte flater bard by it ferwurkjen fan jo betelling, probearje it opnij.
expired-card-error = It liket derop dat jo creditkaart ferrûn is. Probearje in oare kaart.
insufficient-funds-error = It liket derop dat jo kaart net genôch saldo hat. Probearje in oare kaart.
withdrawal-count-limit-exceeded-error = It liket derop dat jo mei dizze transaksje oer jo kredytlimyt gean. Probearje in oare kaart.
charge-exceeds-source-limit = It liket derop dat jo mei dizze transaksje oer jo deistige kredytlimyt gean. Probearje in oare kaart of wachtsje 24 oer.
instant-payouts-unsupported = It liket derop dat jo bankpas net ynsteld is foar direkte betellingen. Probearje in oare bankpas of creditkaart.
duplicate-transaction = Hmm. It liket derop dat sakrekt in identike transaksje ferstjoerd is. Kontrolearje jo betellingsskiednis.
coupon-expired = It liket derop dat dy promoasjekoade ferrûn is.
card-error = Jo transaksje koe net ferwurke wurde. Kontrolearje jo creditkaartgegevens en probearje it opnij.
country-currency-mismatch = De faluta fan dit abonnemint is net jildich foar it lân dat oan jo betelling keppele is.
currency-currency-mismatch = Sorry. Jo kinne net wikselje tusken faluta.
location-unsupported = Jo aktuele lokaasje wurdt net stipe neffens ús Tsjinstbetingsten.
no-subscription-change = Sorry. Jo kinne jo abonnemint net wizigje.
# $mobileAppStore (String) - "Google Play Store" or "App Store", localized when the translation is available.
iap-already-subscribed = Jo binne al abonnearre fia de { $mobileAppStore }.
# $productName (String) - The name of the subscribed product.
fxa-account-signup-error-2 = Troch in systeemflater is jo registraasje by { $productName } mislearre. Der binne gjin kosten yn rekkening brocht by jo betelmetoade. Probearje it opnij.
fxa-post-passwordless-sub-error = Abonnemint befêstige, mar de befêstigingsside kin net laden wurde. Kontrolearje jo e-mail om jo account yn te stellen.
newsletter-signup-error = Jo binne net ynskreaun foar e-mailberjochten oer produktupdates. Jo kinne it opnij probearje yn jo accountynstellingen.
product-plan-error =
    .title = Probleem by it laden fan de skema’s
product-profile-error =
    .title = Probleem by it laden fan it profyl
product-customer-error =
    .title = Probleem by it laden fan de klant
product-plan-not-found = Skema net fûn
product-location-unsupported-error = Lokaasje net stipe

## Hooks - coupons

coupon-success = Jo abonnemint wurdt automatysk ferlinge tsjin de normale priis.
# $couponDurationDate (Date) - The date at which the coupon is no longer valid, and the subscription is billed the list price.
coupon-success-repeating = Jo abonnemint wurdt nei { $couponDurationDate } automatysk ferlinge tsjin de standertpriis.

## Routes - Checkout - New user

new-user-step-1-2 = 1. Meitsje in { -product-mozilla-account } oan
new-user-card-title = Fier jo kaartgegevens yn
new-user-submit = No abonnearje

## Routes - Product and Subscriptions

sub-update-payment-title = Betellingsgegevens

## Routes - Product/AcceptedCards
## Used in both Routes - Checkout and Product/SubscriptionCreate

pay-with-heading-card-only = Betelje mei kaart
product-invoice-preview-error-title = Probleem by it laden fan faktuerfoarbyld
product-invoice-preview-error-text = Kin faktuerfoarbyld net lade

## Routes - Product - IapRoadblock

subscription-iaperrorupgrade-title = Wy kinne jo noch net opwurdearje

# The following are not terms because they are not used directly in messages,
# but rather looked up in code and passed into the message as variables.

brand-name-google-play-2 = { -google-play } Store
brand-name-apple-app-store-2 = { -app-store }

## Routes - Product - Subscription upgrade

product-plan-change-heading = Jo wiziging besjen
sub-change-failed = Abonnemintswiziging mislearre
sub-update-acknowledgment =
    Jo abonnemint wiziget daliks, en der wurdt in grut bedrach yn rekkening
    brocht foar it restant fan jo fakturaasjeperioade. Fan { $startingDate } ôf
    wurdt jo it folsleine bedrach yn rekkening brocht.
sub-change-submit = Wiziging befêstigje
sub-update-current-plan-label = Aktuele skema
sub-update-new-plan-label = Nij skema
sub-update-total-label = Nij totaalbedrach
sub-update-prorated-upgrade = Nei rato opwurdearje

## Checkout line item for subscription plan change listing the product name and frequency of payment
## For example, a Mozilla VPN subscription charged monthly would appear as: Mozilla VPN (Monthly)
## Variables:
##   $productName (String) - Name of the upgraded product (e.g. Mozilla VPN)

sub-update-new-plan-daily = { $productName } (deistich)
sub-update-new-plan-weekly = { $productName } (wykliks)
sub-update-new-plan-monthly = { $productName } (moanliks)
sub-update-new-plan-yearly = { $productName } (jierliks)
sub-update-prorated-upgrade-credit = It toande negative saldo wurdt as tegoed op jo account byskreaun en brûkt foar takomstige faktueren.

## Routes - Subscriptions - Cancel

sub-item-cancel-sub = Abonnemint opsizze
sub-item-stay-sub = Abonnemint behâlde

## $name (String) - The name of the subscribed product.
## $period (Date) - The last day of product access

sub-item-cancel-msg =
    Jo kinne { $name } net mear brûke nei
    { $period }, de lêste dei fan jo betellingssyklus.
sub-item-cancel-confirm =
    Myn tagong ta en bewarre gegevens yn { $name }
    op { $period } opsizze
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
sub-promo-coupon-applied = { $promotion_name }-weardebon tapast: <priceDetails></priceDetails>
subscription-management-account-credit-balance = Dizze abonnemintsbetelling resultearre yn in byskriuwing op jo accountsaldo: <priceDetails></priceDetails>

## Routes - Subscription

sub-route-idx-reactivating = Opnij aktivearjen fan abonnemint is mislearre
sub-route-idx-cancel-failed = Opsizzen fan abonnemint is mislearre
sub-route-idx-contact = Kontakt opnimme
sub-route-idx-cancel-msg-title = Wy fine it spitich dat jo ús ferlitte.
# $name (String) - The name of the subscribed product.
# $date (Date) - Last day of product access
sub-route-idx-cancel-msg =
    Jo abonnemint op { $name } is opsein.
          <br />
          Jo hawwe noch oant { $date } tagong ta { $name }.
sub-route-idx-cancel-aside-2 = Fragen? Besykje <a>{ -brand-mozilla } Support</a>.

## Routes - Subscriptions - Errors

sub-customer-error =
    .title = Probleem by it laden fan klant
sub-invoice-error =
    .title = Probleem by it laden fan faktueren
sub-billing-update-success = Jo betellingsgegevens binne mei sukses bywurke
sub-invoice-previews-error-title = Probleem by it laden fan faktuerfoarbylden
sub-invoice-previews-error-text = Kin faktuerfoarbylden net lade

## Routes - Subscription - ActionButton

pay-update-change-btn = Wizigje
pay-update-manage-btn = Beheare

## Routes - Subscriptions - Cancel and IapItem
## $priceAmount (Number) - The amount billed. It will be formatted as currency.
## $taxAmount (Number) - The tax added on, not included in amount. It will be formatted as currency.
## $date (Date) - The date for the next time a charge will occur.

sub-next-bill = Folgjende ynkasso op { $date }
sub-next-bill-due-date = De folgjende faktuer moat betelle wurde op { $date }
sub-expires-on = Ferrint op { $date }

## Routes - Subscription - PaymentUpdate


# $expirationDate (Date) - The payment card's expiration date.

pay-update-card-exp = Ferrint op { $expirationDate }
sub-route-idx-updating = Fakturaasjegegevens bywurkje…
sub-route-payment-modal-heading = Ungjildige fakturaasjegegevens
sub-route-payment-modal-message-2 = Der liket in flater te barren mei jo { -brand-paypal }-account, jo moatte de needsaaklike stappen nimme om dit betellingsprobleem op te lossen.
sub-route-missing-billing-agreement-payment-alert = Ungjidige betellingsgegevens; der is in flater bard mei jo account. <div>Beheare</div>
sub-route-funding-source-payment-alert = Ungjidige betellingsgegevens; der is in flater bard mei jo account. Dizze warskôging ferdwynt mooglik pas nei ferrin fan tiid neidat jo mei sukses jo gegevens bywurke hawwe. <div>Beheare</div>

## Routes - Subscription - SubscriptionItem

sub-item-no-such-plan = Abonnemintskema bestiet net.
invoice-not-found = Folgjende faktuer net fûn
sub-item-no-such-subsequent-invoice = Folgjende faktuer net fûn foar dit abonnemint.
sub-invoice-preview-error-title = Faktuerfoarbyld net fûn
sub-invoice-preview-error-text = Faktuerfoarbyld net fûn foar dit abonnemint

## Routes - Subscriptions - Reactivate
## $name (String) - The name of the subscribed product.

reactivate-confirm-dialog-header = Wolle jo { $name } brûke bliuwe?
# $amount (Number) - The amount billed. It will be formatted as currency.
# $last (String) - The last 4 digits of the card that will be charged
# $endDate (Date) - Last day of product access
reactivate-confirm-copy =
    Jo tagong ta { $name } bliuwt bestean, en jo betellingssyklus
    en betelling bliuwe itselde. Jo folgjende betelling wurdt
    { $amount } op { $endDate } op de kaart einigjend op { $last }.
# Alternate copy used when a payment method is not available, e.g. for free trials
# $amount (Number) - The amount billed. It will be formatted as currency.
# $endDate (Date) - Last day of product access
reactivate-confirm-without-payment-method-copy =
    Jo tagong ta { $name } bliuwt bestean, en jo betellingssyklus
    en betelling bliuwe itselde. Jo folgjende betelling wurdt
    { $amount } op { $endDate }.
reactivate-confirm-button = Opnij ynskriuwe

## $date (Date) - Last day of product access

reactivate-panel-copy = Jo ferlieze op <strong>{ $date }</strong> tagong ta { $name }.
reactivate-success-copy = Tank! Jo binne hielendal klear.
reactivate-success-button = Slute

## Routes - Subscriptions - Subscription iap item

sub-iap-item-google-purchase-2 = { -brand-google }: yn-app-oankeap
sub-iap-item-apple-purchase-2 = { -brand-apple }: yn-app-oankeap
sub-iap-item-manage-button = Beheare
