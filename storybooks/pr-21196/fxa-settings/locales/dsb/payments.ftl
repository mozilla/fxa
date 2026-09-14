# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.


## Component - AppLayout

settings-home = Startowy bok konta
settings-project-header-title = { -product-mozilla-account }

## Component - CouponForm

# Title of container showing discount coupon code applied to a subscription.
coupon-promo-code-applied = Akciski kod nałoženy
coupon-submit = Nałožyś
coupon-remove = Wótwónoźeś
coupon-error = Kod, kótaryž sćo zapódał, jo njepłaśiwy abo spadnuł.
coupon-error-generic = Pśi pśeźěłowanju koda jo zmólka nastała. Pšosym wopytajśo hyšći raz.
coupon-error-expired = Zapódany kod jo spadnuł.
coupon-error-limit-reached = Zapódany kod jo dostał swój limit.
coupon-error-invalid = Zapódany kod jo njepłaśiwy.
# $couponDurationDate (Date) - The date at which the coupon is no longer valid, and the subscription is billed the list price.
coupon-enter-code =
    .placeholder = Kod zapódaś

## Component - Fields

default-input-error = Toś to pólo jo trjebne
input-error-is-required = { $label } jo trjebne

## Component - Header

brand-name-mozilla-logo = Logo { -brand-mozilla }

## Component - NewUserEmailForm

new-user-sign-in-link-2 = Maśo južo { -product-mozilla-account(case: "acc", capitalization: "lower") }? <a>Pśizjawiś</a>
# "Required" to indicate that the user must use the checkbox below this text to
# agree to a payment method's terms of service and privacy notice in order to
# continue.
new-user-enter-email =
    .label = Zapódajśo swóju e-mailowu adresu
new-user-confirm-email =
    .label = Wašu e-mailowu adresu wobkšuśiś
new-user-subscribe-product-updates-mozilla = Ja by rady dostał produktowe nowosći a aktualizacije wót { -brand-mozilla }
new-user-subscribe-product-updates-snp = Ja by rady dostał nowosći wó wěstośe a priwatnosći a aktualizacije wót { -brand-mozilla }
new-user-subscribe-product-updates-hubs = Ja by rady dostał produktowe nowosći a aktualizacije wót { -product-mozilla-hubs } a { -brand-mozilla }
new-user-subscribe-product-updates-mdnplus = Ja by rady dostał produktowe nowosći a aktualizacije wót { -product-mdn-plus } a { -brand-mozilla }
new-user-subscribe-product-assurance = Wužywamy jano wašu e-mailowu adresu, aby my waše konto załožyli. Tśeśemu póbitowarjeju ju nigda njepśedajomy.
new-user-email-validate = E-mailowa adresa njejo płaśiwa
new-user-email-validate-confirm = E-mailowej adresy njejstej jadnakej.
new-user-already-has-account-sign-in = Maśo južo konto. <a>Pśizjawiś</a>
# $domain (String) - the email domain provided by the user during sign up
new-user-invalid-email-domain = E-mailowa adresa jo wopaki napisana? { $domain } e-mailowe adrese njepóbitujo.

## Component - PaymentConfirmation

payment-confirmation-thanks-heading = Wjeliki źěk!
payment-confirmation-thanks-heading-account-exists = Wjeliki źěk, pśeglědajśo něnto swóju e-mail!
# $email (string) - The user's email.
# $productName (String) - The name of the subscribed product.
payment-confirmation-thanks-subheading = Wobkšuśeńska mejlka jo se pósłała z drobnostkami wó tom, kak móžośo z { $product_name } zapchopiś, na { $email }.
# $email (string) - The user's email.
payment-confirmation-thanks-subheading-account-exists = Dostanjośo mejlku na { $email } z instrukcijami za konfigurěrowanje wašogo konta ako teke waše płaśeńske drobnostki.
payment-confirmation-order-heading = Skazańske drobnostki
payment-confirmation-invoice-number = Zliceńka #{ $invoiceNumber }
# $invoiceDate (Date) - Start date of the latest invoice
payment-confirmation-invoice-date = { $invoiceDate }
payment-confirmation-details-heading-2 = Płaśeńske informacije
payment-confirmation-amount = { $amount } na { $interval }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in days.
payment-confirmation-amount-day =
    { $intervalCount ->
        [one] { $amount } kuždy źeń
        [two] { $amount } kuždej { $intervalCount } dnja
        [few] { $amount } kužde { $intervalCount } dny
       *[other] { $amount } kužde { $intervalCount } dnjow
    }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in weeks.
payment-confirmation-amount-week =
    { $intervalCount ->
        [one] { $amount } kuždy tyźeń
        [two] { $amount } kuždej { $intervalCount } tyźenja
        [few] { $amount } kužde { $intervalCount } tyźenje
       *[other] { $amount } kužde { $intervalCount } tyźenjow
    }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in months.
payment-confirmation-amount-month =
    { $intervalCount ->
        [one] { $amount } kuždy mjasec
        [two] { $amount } kuždej { $intervalCount } mjaseca
        [few] { $amount } kužde { $intervalCount } mjasece
       *[other] { $amount } kužde { $intervalCount } mjasecow
    }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in years.
payment-confirmation-amount-year =
    { $intervalCount ->
        [one] { $amount } kužde lěto
        [two] { $amount } kuždej { $intervalCount } lěśe
        [few] { $amount } kužde { $intervalCount } lěta
       *[other] { $amount } kužde { $intervalCount } lět
    }
payment-confirmation-download-button = Dalej k ześěgnjenjeju

## Component - PaymentConsentCheckbox

payment-confirm-with-legal-links-static-3 = Awtorizěrujom { -brand-mozilla } pó <termsOfServiceLink>płaśeńskich wuměnjenjach</termsOfServiceLink> a <privacyNoticeLink>wuzjawjenju wó šćiśe datow</privacyNoticeLink> swóju płaśeńsku metodu wobśěžyś, daniž swój abonement njewupowěźejom.
payment-confirm-checkbox-error = Musyśo to dokóncyś, nježli až móžośo pókšacowaś

## Component - PaymentErrorView

payment-error-retry-button = Hyšći raz wopytaś
payment-error-manage-subscription-button = Abonement zastojaś

## Component - PaymentErrorView - IAP upgrade errors

# $productName (String) - The name of the subscribed product.
iap-upgrade-already-subscribed-2 = Maśo južo abonement { $productName } pśez app-wobchoda { -brand-google } abo { -brand-apple }.
iap-upgrade-no-bundle-support = Njepódpěramy aktualizacije za toś te abonementy, ale buźomy to skóro cyniś.
iap-upgrade-contact-support = Móžośo toś ten produkt hyšći dostaś – stajśo se z teamom pomocy do zwiska, aby mógli wam pomagaś.
iap-upgrade-get-help-button = Pomoc se wobstaraś

## Component - PaymentForm

payment-name =
    .placeholder = Dopołne mě
    .label = Mě, kótarež se na wašej kórśe pokazujo
payment-cc =
    .label = Waša kórta
payment-cancel-btn = Pśetergnuś
payment-update-btn = Aktualizěrowaś
payment-pay-btn = Něnto płaśiś
payment-pay-with-paypal-btn-2 = Z { -brand-paypal } płaśiś
payment-validate-name-error = Pšosym zapódajśo swójo mě

## Component - PaymentLegalBlurb

payment-legal-copy-stripe-and-paypal-3 = { -brand-mozilla } { -brand-name-stripe } a { -brand-paypal } za wěste pśeźěłowanje płaśenjow wužywa.
payment-legal-link-stripe-paypal-2 = <stripePrivacyLink>Pšawidła priwatnosći { -brand-name-stripe }</stripePrivacyLink> &nbsp; <paypalPrivacyLink>pšawidła priwatnosći { -brand-paypal }</paypalPrivacyLink>.
payment-legal-copy-paypal-2 = { -brand-mozilla } { -brand-paypal }l za wěste pśeźěłowanje płaśenjow wužywa.
payment-legal-link-paypal-3 = <paypalPrivacyLink>{ -brand-paypal } Pšawidła priwatnosći</paypalPrivacyLink>.
payment-legal-copy-stripe-3 = { -brand-mozilla } { -brand-name-stripe } za wěste pśeźěłowanje płaśenjow wužywa.
payment-legal-link-stripe-3 = <stripePrivacyLink>Pšawidła priwatnosći { -brand-name-stripe }</stripePrivacyLink>.

## Component - PaymentMethodHeader

payment-method-header = Wubjeŕśo swóju płaśeńsku metodu
# This message is used to indicate the second step in a multi step process.
payment-method-header-second-step = 2. { payment-method-header }
payment-method-first-approve = Nejpjerwjej musyśo swój abonement wobkšuśiś

## Component - PaymentProcessing

payment-processing-message = Pšosym cakajśo, mjaztym až wašo płaśenje pśeźěłujomy…

## Component - PaymentProviderDetails

payment-confirmation-cc-card-ending-in = Kórta, kótaraž se na { $last4 } kóńcy

## Component - PayPalButton

pay-with-heading-paypal-2 = Z { -brand-paypal } płaśiś

## Component - PlanDetails

plan-details-header = Produktowe drobnostki
plan-details-list-price = Lisćinowa płaśizna
plan-details-show-button = Drobnostki pokazaś
plan-details-hide-button = Drobnostki schowaś
plan-details-total-label = Dogromady
plan-details-tax = Danki a płaśonki

## Component - PlanErrorDialog

product-no-such-plan = Žeden plan za toś ten produkt.

## Price details including tax
## $priceAmount (Number) - The amount billed. It will be formatted as currency.
## $taxAmount (Number) - The tax added on, not included in amount. It will be formatted as currency.

price-details-no-tax = { $priceAmount }
price-details-tax = { $priceAmount } + { $taxAmount } dank
# $intervalCount (Number) - The interval between payments, in days.
price-details-no-tax-day =
    { $intervalCount ->
        [one] { $priceAmount } kuždy źeń
        [two] { $priceAmount } kuždej { $intervalCount } dnja
        [few] { $priceAmount } kužde { $intervalCount } dny
       *[other] { $priceAmount } kužde { $intervalCount } dnjow
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } kuždy źeń
            [two] { $priceAmount } kuždej { $intervalCount } dnja
            [few] { $priceAmount } kužde { $intervalCount } dny
           *[other] { $priceAmount } kužde { $intervalCount } dnjow
        }
# $intervalCount (Number) - The interval between payments, in weeks.
price-details-no-tax-week =
    { $intervalCount ->
        [one] { $priceAmount } kuždy tyźeń
        [two] { $priceAmount } kuždej { $intervalCount } tyźenja
        [few] { $priceAmount } kužde { $intervalCount } tyźenje
       *[other] { $priceAmount } kužde { $intervalCount } tyźenjow
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } kuždy tyźeń
            [two] { $priceAmount } kuždej { $intervalCount } tyźenja
            [few] { $priceAmount } kužde { $intervalCount } tyźenje
           *[other] { $priceAmount } kužde { $intervalCount } tyźenjow
        }
# $intervalCount (Number) - The interval between payments, in months.
price-details-no-tax-month =
    { $intervalCount ->
        [one] { $priceAmount } kuždy mjasec
        [two] { $priceAmount } kuždej { $intervalCount } mjaseca
        [few] { $priceAmount } kužde { $intervalCount } mjasece
       *[other] { $priceAmount } kužde { $intervalCount } mjasecow
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } kuždy mjasec
            [two] { $priceAmount } kuždej { $intervalCount } mjaseca
            [few] { $priceAmount } kužde { $intervalCount } mjasece
           *[other] { $priceAmount } kužde { $intervalCount } mjasecow
        }
# $intervalCount (Number) - The interval between payments, in years.
price-details-no-tax-year =
    { $intervalCount ->
        [one] { $priceAmount } kužde lěto
        [two] { $priceAmount } kuždej { $intervalCount } lěśe
        [few] { $priceAmount } kužde { $intervalCount } lěta
       *[other] { $priceAmount } kužde { $intervalCount } lět
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } kužde lěto
            [two] { $priceAmount } kuždej { $intervalCount } lěśe
            [few] { $priceAmount } kužde { $intervalCount } lěta
           *[other] { $priceAmount } kužde { $intervalCount } lět
        }
# $intervalCount (Number) - The interval between payments, in days.
price-details-tax-day =
    { $intervalCount ->
        [one] { $priceAmount } + dank { $taxAmount } kuždy źeń
        [two] { $priceAmount } + dank { $taxAmount } kuždej { $intervalCount } dnja
        [few] { $priceAmount } + dank { $taxAmount } kužde { $intervalCount } dny
       *[other] { $priceAmount } + dank { $taxAmount } kužde { $intervalCount } dnjow
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + dank { $taxAmount } kuždy źeń
            [two] { $priceAmount } + dank { $taxAmount } kuždej { $intervalCount } dnja
            [few] { $priceAmount } + dank { $taxAmount } kužde { $intervalCount } dny
           *[other] { $priceAmount } + dank { $taxAmount } kužde { $intervalCount } dnjow
        }
# $intervalCount (Number) - The interval between payments, in weeks.
price-details-tax-week =
    { $intervalCount ->
        [one] { $priceAmount } + dank { $taxAmount } kuždy tyźeń
        [two] { $priceAmount } + dank { $taxAmount } kuždej { $intervalCount } tyźenja
        [few] { $priceAmount } + dank { $taxAmount } kužde { $intervalCount } tyźenje
       *[other] { $priceAmount } + dank { $taxAmount } kužde { $intervalCount } tyźenjow
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + dank { $taxAmount } kuždy tyźeń
            [two] { $priceAmount } + dank { $taxAmount } kuždej { $intervalCount } tyźenja
            [few] { $priceAmount } + dank { $taxAmount } kužde { $intervalCount } tyźenje
           *[other] { $priceAmount } + dank { $taxAmount } kužde { $intervalCount } tyźenjow
        }
# $intervalCount (Number) - The interval between payments, in months.
price-details-tax-month =
    { $intervalCount ->
        [one] { $priceAmount } + dank { $taxAmount } kuždy mjasec
        [two] { $priceAmount } + dank { $taxAmount } kuždej { $intervalCount } mjaseca
        [few] { $priceAmount } + dank { $taxAmount } kužde { $intervalCount } mjasece
       *[other] { $priceAmount } + dank { $taxAmount } kužde { $intervalCount } mjasecow
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + dank { $taxAmount } kuždy mjasec
            [two] { $priceAmount } + dank { $taxAmount } kuždej { $intervalCount } mjaseca
            [few] { $priceAmount } + dank { $taxAmount } kužde { $intervalCount } mjasece
           *[other] { $priceAmount } + dank { $taxAmount } kužde { $intervalCount } mjasecow
        }
# $intervalCount (Number) - The interval between payments, in years.
price-details-tax-year =
    { $intervalCount ->
        [one] { $priceAmount } + dank { $taxAmount } kužde lěto
        [two] { $priceAmount } + dank { $taxAmount } kuždej { $intervalCount } lěśe
        [few] { $priceAmount } + dank { $taxAmount } kužde { $intervalCount } lěta
       *[other] { $priceAmount } + dank { $taxAmount } kužde { $intervalCount } lět
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + dank { $taxAmount } kužde lěto
            [two] { $priceAmount } + dank { $taxAmount } kuždej { $intervalCount } lěśe
            [few] { $priceAmount } + dank { $taxAmount } kužde { $intervalCount } lěta
           *[other] { $priceAmount } + dank { $taxAmount } kužde { $intervalCount } lět
        }

## Component - SubscriptionTitle

subscription-create-title = Waš abonement konfigurěrowaś
subscription-success-title = Wobkšuśenje abonementa
subscription-processing-title = Abonement se wobkšuśijo…
subscription-error-title = Zmólka pśi wobkšuśenju abonementa…
subscription-noplanchange-title = Toś ta změna abonementowego plana se njepódpěra
subscription-iapsubscribed-title = Južo aboněrowany
sub-guarantee = 30-dnjowna garantija slědkdaśa pjenjez

## Component - TermsAndPrivacy

# "Mozilla Accounts" is capitalized in this instance for title case in English
# This heading is followed by links to Terms of Service and Privacy Notice
subplat-mozilla-accounts-legal-heading = { -product-mozilla-accounts(case: "gen", capitalization: "lowercase") }
terms = Wužywańske wuměnjenja
privacy = Powěźeńka priwatnosći
terms-download = Ześěgnjeńske wuměnjenja

## App-level string(s) and messages shared by multiple components or routes

document =
    .title = Firefox Accounts
# General aria-label for closing modals
close-aria =
    .aria-label = Modalnje zacyniś
settings-subscriptions-title = Abonementy
# Title of container where a user can input a coupon code to get a discount on a subscription.
coupon-promo-code = Akciski kod

## Subscription upgrade plan details - shared by multiple components, including plan details and payment form
## $amount (Number) - The amount billed. It will be formatted as currency.

# $intervalCount (Number) - The interval between payments, in days.
plan-price-interval-day =
    { $intervalCount ->
        [one] { $amount } kuždy źeń
        [two] { $amount } kuždej { $intervalCount } dnja
        [few] { $amount } kužde { $intervalCount } dny
       *[other] { $amount } kužde { $intervalCount } dnjow
    }
    .title =
        { $intervalCount ->
            [one] { $amount } kuždy źeń
            [two] { $amount } kuždej { $intervalCount } dnja
            [few] { $amount } kužde { $intervalCount } dny
           *[other] { $amount } kužde { $intervalCount } dnjow
        }
# $intervalCount (Number) - The interval between payments, in weeks.
plan-price-interval-week =
    { $intervalCount ->
        [one] { $amount } kuždy tyźeń
        [two] { $amount } kuždej { $intervalCount } tyźenja
        [few] { $amount } kužde { $intervalCount } tyźenje
       *[other] { $amount } kužde { $intervalCount } tyźenjow
    }
    .title =
        { $intervalCount ->
            [one] { $amount } kuždy tyźeń
            [two] { $amount } kuždej { $intervalCount } tyźenja
            [few] { $amount } kužde { $intervalCount } tyźenje
           *[other] { $amount } kužde { $intervalCount } tyźenjow
        }
# $intervalCount (Number) - The interval between payments, in months.
plan-price-interval-month =
    { $intervalCount ->
        [one] { $amount } kuždy mjasec
        [two] { $amount } kuždej { $intervalCount } mjaseca
        [few] { $amount } kužde { $intervalCount } mjasece
       *[other] { $amount } kužde { $intervalCount } mjasecow
    }
    .title =
        { $intervalCount ->
            [one] { $amount } kuždy mjasec
            [two] { $amount } kuždej { $intervalCount } mjaseca
            [few] { $amount } kužde { $intervalCount } mjasece
           *[other] { $amount } kužde { $intervalCount } mjasecow
        }
# $intervalCount (Number) - The interval between payments, in years.
plan-price-interval-year =
    { $intervalCount ->
        [one] { $amount } kužde lěto
        [two] { $amount } kuždej { $intervalCount } lěśe
        [few] { $amount } kužde { $intervalCount } lěta
       *[other] { $amount } kužde { $intervalCount } lět
    }
    .title =
        { $intervalCount ->
            [one] { $amount } kužde lěto
            [two] { $amount } kuždej { $intervalCount } lěśe
            [few] { $amount } kužde { $intervalCount } lěta
           *[other] { $amount } kužde { $intervalCount } lět
        }

## Error messages

# App error dialog
general-error-heading = Powšykna nałožeńska zmólka
basic-error-message = Něco jo se mimo kuliło. Pšosym wopytajśo pózdźej hyšći raz.
payment-error-1 = Hmm. Pśi awtorizěrowanju wašogo płaśenja jo problem nastał. Wopytajśo hyšći raz abo stajśo se z wudawarjom swójeje kórty do zwiska.
payment-error-2 = Hmm. Pśi awtorizěrowanju wašogo płaśenja jo problem nastał. Stajśo se z wudawarjom swójeje kórty do zwiska.
payment-error-3b = Pśi pśeźěłowanju wašogo płaśenja jo njewótcakana zmólka nastała, pšosym wopytajśo hyšći raz.
expired-card-error = Zda se, ako by waša kreditna kórta spadnuła. Wopytajśo drugu kórrtu.
insufficient-funds-error = Zda se, ako by waša kórta njedosegajucy kontowy plus měła. Wopytajśo drugu kórtu.
withdrawal-count-limit-exceeded-error = Zda se, ako by wy z toś teju transakciju swój kórtowy limit pśekšocył. Wopytajśo drugu kórtu.
charge-exceeds-source-limit = Zda se, ako by wy z toś teju transakciju swój kórtowy wšedny limit pśekšocył. Wopytajśo drugu kórtu abo za 24 góźinow.
instant-payouts-unsupported = Zda se, ako njeby waša debitna kórta za płaśenja ned konfigurěrowana była. Wopytajśo drugu debitnu abo kreditnu kórtu.
duplicate-transaction = Hmm. Zda se, ako by se identiska transakcija rowno pósłała. Pśeglědujśo swóju historiju płaśenjow.
coupon-expired = Zda se, ako by promokod spadnuł.
card-error = Waša transakcija njedajo se pśeźěłowaś. Pśeglědujśo pšosym informacije swójeje kreditoweje kórty a wopytajśo hyšći raz.
country-currency-mismatch = Pjenjeze toś togo abonementa njejsu płaśiwe za kraj, kótaryž jo z wašym płaśenim zwězany.
currency-currency-mismatch = Bóžko njamóžośo pjenjeze pśeměniś.
location-unsupported = Wašo aktualne městno se pó našych wužywańskich wuměnjenjach njepódpěra.
no-subscription-change = Bóžko njamóžośo swój abonementowy plan změniś.
# $mobileAppStore (String) - "Google Play Store" or "App Store", localized when the translation is available.
iap-already-subscribed = Sćo južo aboněrował pśez { $mobileAppStore }.
# $productName (String) - The name of the subscribed product.
fxa-account-signup-error-2 = Systemowa zmólka jo zawinowała, až wašo registrěrowanje za { $productName } njejo raźiło. Waša płaśeńska metoda njejo se wobśěžyła. Wopytajśo pšosym hyšći raz.
fxa-post-passwordless-sub-error = Abonement jo wobkšuśony, ale wobkšuśeński bok njedajo se zacytaś. Pšosym pśeglědujśo swóje mejlki, aby swójo konto konfigurěrował.
newsletter-signup-error = Njejsćo se registrěrował za mejlki wó produktowych aktualizacijach . Móžośo to w swójich kontowych nastajenjach hyšći raz wopytaś.
product-plan-error =
    .title = Zmólka pśi cytanju planow
product-profile-error =
    .title = Zmólka pśi cytanju profila
product-customer-error =
    .title = Zmólka pśi cytanju kupca
product-plan-not-found = Plan njejo se namakał
product-location-unsupported-error = Městno se njepódpěra

## Hooks - coupons

coupon-success = Waš plan se awtomatiski za lisćinowu płaśiznu wótnowja.
# $couponDurationDate (Date) - The date at which the coupon is no longer valid, and the subscription is billed the list price.
coupon-success-repeating = Waš plan se pó { $couponDurationDate } za lisćinowu płaśiznu awtomatiski pódlejšyjo.

## Routes - Checkout - New user

new-user-step-1-2 = 1. Załožćo { -product-mozilla-account(case: "acc", capitalization: "lower") }
new-user-card-title = Zapodajśo swóje kórtowe informacije
new-user-submit = Něnto aboněrowaś

## Routes - Product and Subscriptions

sub-update-payment-title = Płaśeńske informacije

## Routes - Product/AcceptedCards
## Used in both Routes - Checkout and Product/SubscriptionCreate

pay-with-heading-card-only = Z kórtu płaśiś
product-invoice-preview-error-title = Problem pśi cytanju pśeglěda zliceńki
product-invoice-preview-error-text = Pśeglěd zliceńki njedajo se zacytaś

## Routes - Product - IapRoadblock

subscription-iaperrorupgrade-title = Hyšći njamóžomy was aktualizěrowaś

# The following are not terms because they are not used directly in messages,
# but rather looked up in code and passed into the message as variables.

brand-name-google-play-2 = Wobchod { -google-play }
brand-name-apple-app-store-2 = { -app-store }

## Routes - Product - Subscription upgrade

product-plan-change-heading = Pśeglědujśo swóju změnu
sub-change-failed = Njejo se raźiło, plan změniś
sub-update-acknowledgment =
    Waš plan se ned změnijo, a za zbytk toś teje wótliceńskeje periody se wam źinsa
    późělna suma woblicujo. Zachopinajucy z { $startingDate }
    se połna suma woblicujo.
sub-change-submit = Změnu wobkšuśiś
sub-update-current-plan-label = Aktualny plan
sub-update-new-plan-label = Nowy plan
sub-update-total-label = Nowa suma
sub-update-prorated-upgrade = Późělna aktualizacija

## Checkout line item for subscription plan change listing the product name and frequency of payment
## For example, a Mozilla VPN subscription charged monthly would appear as: Mozilla VPN (Monthly)
## Variables:
##   $productName (String) - Name of the upgraded product (e.g. Mozilla VPN)

sub-update-new-plan-daily = { $productName } (kuždy źeń)
sub-update-new-plan-weekly = { $productName } (kuždy tyźeń)
sub-update-new-plan-monthly = { $productName } (kuždy mjasec)
sub-update-new-plan-yearly = { $productName } (kužde lěto)
sub-update-prorated-upgrade-credit = Pokazany kontowy staw se wašomu kontu pśidawa a za pśiduce zliceńki wužywa.

## Routes - Subscriptions - Cancel

sub-item-cancel-sub = Abonement wupowěźeś
sub-item-stay-sub = Dalej aboněrowaś

## $name (String) - The name of the subscribed product.
## $period (Date) - The last day of product access

sub-item-cancel-msg =
    Pó { $period }, slědnem dnju swójogo wótliceńskeje periody,
    wěcej njamóžośo { $name } wužywaś.
sub-item-cancel-confirm =
    { $period } mój pśistup a móje w { $name }
    skłaźone informacije wótwónoźeś
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
sub-promo-coupon-applied = Bon { $promotion_name } nałožony: <priceDetails></priceDetails>
subscription-management-account-credit-balance = Toś to abonementne płaśenje jo wjadło ku kontowemu plusoju na wašom konśe: <priceDetails></priceDetails>

## Routes - Subscription

sub-route-idx-reactivating = Zasejaktiwěrowanje abonementa jo se mimo kuliło
sub-route-idx-cancel-failed = Wupowěźenje abonementa jo se mimo kuliło
sub-route-idx-contact = Pomoc kontaktěrowaś
sub-route-idx-cancel-msg-title = Jo nam luto, až nas spušćaśo
# $name (String) - The name of the subscribed product.
# $date (Date) - Last day of product access
sub-route-idx-cancel-msg =
    Waš abonement za { $name } jo se wupowěźeł.
          <br />
          Maśo hyšći pśistup k { $name } až do { $date }.
sub-route-idx-cancel-aside-2 = Maśo pšašanja? Woglědajśo se k <a>Pomocy { -brand-mozilla }</a>.

## Routes - Subscriptions - Errors

sub-customer-error =
    .title = Zmólka pśi cytanju kupca
sub-invoice-error =
    .title = Problem pśi cytanju zliceńkow
sub-billing-update-success = Waše płaśeńske informacije su se wuspěšnje zaktualizěrowali
sub-invoice-previews-error-title = Problem pśi cytanju pśeglědow zliceńkow
sub-invoice-previews-error-text = Pśeglědy zliceńkow njedaju se zacytaś

## Routes - Subscription - ActionButton

pay-update-change-btn = Změniś
pay-update-manage-btn = Zastojaś

## Routes - Subscriptions - Cancel and IapItem
## $priceAmount (Number) - The amount billed. It will be formatted as currency.
## $taxAmount (Number) - The tax added on, not included in amount. It will be formatted as currency.
## $date (Date) - The date for the next time a charge will occur.

sub-next-bill = Pśiduca zliceńka: { $date }
sub-next-bill-due-date = Pśiduca zliceńka musy se płaśiś: { $date }
sub-expires-on = Spadnjo { $date }

## Routes - Subscription - PaymentUpdate


# $expirationDate (Date) - The payment card's expiration date.

pay-update-card-exp = Spadnjo { $expirationDate }
sub-route-idx-updating = Wótliceńske informacije se aktualizěruju…
sub-route-payment-modal-heading = Njepłaśiwe płaśeńske informacije
sub-route-payment-modal-message-2 = Zda se, až dajo zmólka z wašym kontom { -brand-paypal }, musymy trjebne kšace pśewjasć, aby toś ten płaśeński problem rozwězali.
sub-route-missing-billing-agreement-payment-alert = Njepłaśiwe płaśeńske informacije; jo zmólka z wašym kontom. <div>Zastojaś</div>
sub-route-funding-source-payment-alert = Njepłaśiwe płaśeńske informacije; dajo zmólku z wašym kontom. Toś to warnowanje pitśu casa trjeba, aby se zgubiło, za tym až sćo wuspěšnje zaktualizěrował swóje informacije. <div>Zastojaś</div>

## Routes - Subscription - SubscriptionItem

sub-item-no-such-plan = Žeden plan za toś ten abonement.
invoice-not-found = Naslědna zliceńka njejo se namakała
sub-item-no-such-subsequent-invoice = Naslědna zliceńka njejo se namakała za toś ten abonement.
sub-invoice-preview-error-title = Pśeglěd zliceńki njejo se namakał
sub-invoice-preview-error-text = Pśeglěd zliceńki njejo se namakał za toś ten abonement

## Routes - Subscriptions - Reactivate
## $name (String) - The name of the subscribed product.

reactivate-confirm-dialog-header = Cośo { $name } dalej wužywaś?
# $amount (Number) - The amount billed. It will be formatted as currency.
# $last (String) - The last 4 digits of the card that will be charged
# $endDate (Date) - Last day of product access
reactivate-confirm-copy =
    Waš pśistup k { $name } dalej wobstoj. a waša wótliceńska perioda
    a wašo płaśenje te samskej wóstanjotej. Wašo pśiduce wótpisanje
    { $endDate } { $amount } wucynijo, za kórtu, kótaraž se na { $last } kóńcy.
# Alternate copy used when a payment method is not available, e.g. for free trials
# $amount (Number) - The amount billed. It will be formatted as currency.
# $endDate (Date) - Last day of product access
reactivate-confirm-without-payment-method-copy =
    Waš pśistup k { $name } dalej wobstoj. a waša wótliceńska perioda
    a wašo płaśenje te samskej wóstanjotej. Wašo pśiduce wótpisanje
    buźo { $endDate } { $amount }.
reactivate-confirm-button = Abonement wótnowiś

## $date (Date) - Last day of product access

reactivate-panel-copy = Zgubijośo <strong>{ $date }</strong> pśistup k { $name }.
reactivate-success-copy = Wjeliki źěk! Sćo gótowy za start.
reactivate-success-button = Zacyniś

## Routes - Subscriptions - Subscription iap item

sub-iap-item-google-purchase-2 = { -brand-google }: Kup w nałoženju
sub-iap-item-apple-purchase-2 = { -brand-apple }: Kup w nałoženju
sub-iap-item-manage-button = Zastojaś
