# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.


## Component - AppLayout

settings-home = Startowa strona konta
settings-project-header-title = { -product-mozilla-account }

## Component - CouponForm

# Title of container showing discount coupon code applied to a subscription.
coupon-promo-code-applied = Akciski kod nałoženy
coupon-submit = Nałožić
coupon-remove = Wotstronić
coupon-error = Kod, kotryž sće zapodał, je njepłaćiwy abo spadnył.
coupon-error-generic = Při předźěłowanju koda je zmylk nastał. Prošu spytajće hišće raz.
coupon-error-expired = Zapodaty kod je spadnył.
coupon-error-limit-reached = Zapodaty kod je swój limit docpěł.
coupon-error-invalid = Zapodaty kod je njepłaćiwy.
# $couponDurationDate (Date) - The date at which the coupon is no longer valid, and the subscription is billed the list price.
coupon-enter-code =
    .placeholder = Kod zapodać

## Component - Fields

default-input-error = Tute polo je trěbne
input-error-is-required = { $label } je trěbne

## Component - Header

brand-name-mozilla-logo = Logo { -brand-mozilla }

## Component - NewUserEmailForm

new-user-sign-in-link-2 = Maće hižo { -product-mozilla-account(case: "acc", capitalization: "lower") }? <a>Přizjewić</a>
# "Required" to indicate that the user must use the checkbox below this text to
# agree to a payment method's terms of service and privacy notice in order to
# continue.
new-user-enter-email =
    .label = Zapodajće swoju e-mejlowu adresu
new-user-confirm-email =
    .label = Wobkrućće swoju e-mejlowu adresu
new-user-subscribe-product-updates-mozilla = Bych rady produktowe nowinki a aktualizacije wot { -brand-mozilla } dóstał
new-user-subscribe-product-updates-snp = Bych rady produktowe nowinki wo wěstoće a priwatnosći a aktualizacije wot { -brand-mozilla } dóstał
new-user-subscribe-product-updates-hubs = Bych rady produktowe nowinki a aktualizacije wot { -product-mozilla-hubs } a { -brand-mozilla } dóstał
new-user-subscribe-product-updates-mdnplus = Bych rady produktowe nowinki a aktualizacije wot { -product-mdn-plus } a { -brand-mozilla } dóstał
new-user-subscribe-product-assurance = Wužiwamy jenož wašu e-mejlowu adresu, zo bychmy waše konto załožili. Třećemu poskićowarjej ju ženje njepředamy.
new-user-email-validate = E-mejlowa adresa płaćiwa njeje
new-user-email-validate-confirm = E-mejlowej adresy jenakej njejstej
new-user-already-has-account-sign-in = Maće hižo konto. <a>Přizjewić</a>
# $domain (String) - the email domain provided by the user during sign up
new-user-invalid-email-domain = E-mejlowa adresa je wopak napisana? { $domain } e-mejlowe adresy njeposkića.

## Component - PaymentConfirmation

payment-confirmation-thanks-heading = Wulki dźak!
payment-confirmation-thanks-heading-account-exists = Wulki dźak, přepruwujće nětko swoju e-mejl!
# $email (string) - The user's email.
# $productName (String) - The name of the subscribed product.
payment-confirmation-thanks-subheading = Wobkrućenska mejlka je so z podrobnosćemi wo tym, kak móžeće z { $product_name } započeć, na { $email } pósłała.
# $email (string) - The user's email.
payment-confirmation-thanks-subheading-account-exists = Dóstanjeće mejlku na { $email } z instrukcijemi za konfigurowanje wašeho konta kaž tež waše płaćenske podrobnosće.
payment-confirmation-order-heading = Skazanske podrobnosće
payment-confirmation-invoice-number = Zličbowanka #{ $invoiceNumber }
# $invoiceDate (Date) - Start date of the latest invoice
payment-confirmation-invoice-date = { $invoiceDate }
payment-confirmation-details-heading-2 = Płaćenske informacije
payment-confirmation-amount = { $amount } na { $interval }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in days.
payment-confirmation-amount-day =
    { $intervalCount ->
        [one] { $amount } kóždy dźeń
        [two] { $amount } kóždej { $intervalCount } dnjej
        [few] { $amount } kóžde { $intervalCount } dny
       *[other] { $amount } kóžde { $intervalCount } dnjow
    }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in weeks.
payment-confirmation-amount-week =
    { $intervalCount ->
        [one] { $amount } kóždy tydźeń
        [two] { $amount } kóždej { $intervalCount } njedźeli
        [few] { $amount } kóžde { $intervalCount } njedźele
       *[other] { $amount } kóžde { $intervalCount } njedźel
    }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in months.
payment-confirmation-amount-month =
    { $intervalCount ->
        [one] { $amount } kóždy měsac
        [two] { $amount } kóždej { $intervalCount } měsacaj
        [few] { $amount } kóžde { $intervalCount } měsacy
       *[other] { $amount } kóžde { $intervalCount } měsacow
    }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in years.
payment-confirmation-amount-year =
    { $intervalCount ->
        [one] { $amount } kóžde lěto
        [two] { $amount } kóždej { $intervalCount } lěće
        [few] { $amount } kóžde { $intervalCount } lěta
       *[other] { $amount } kóžde { $intervalCount } lět
    }
payment-confirmation-download-button = Dale k sćehnjenju

## Component - PaymentConsentCheckbox

payment-confirm-with-legal-links-static-3 = Awtorizuju { -brand-mozilla } po <termsOfServiceLink>płaćenskich wuměnjenjach</termsOfServiceLink> a <privacyNoticeLink>rozłoženju wo škiće datow</privacyNoticeLink> swoju płaćensku metodu za podatu sumu poćežić, doniž swój abonement njewupowědźu.
payment-confirm-checkbox-error = Dyrbiće to dokónčić, prjedy hač móžeće pokročować

## Component - PaymentErrorView

payment-error-retry-button = Hišće raz spytać
payment-error-manage-subscription-button = Abonement zrjadować

## Component - PaymentErrorView - IAP upgrade errors

# $productName (String) - The name of the subscribed product.
iap-upgrade-already-subscribed-2 = Maće hižo abonement { $productName } přez app-wobchodaj { -brand-google } abo { -brand-apple }.
iap-upgrade-no-bundle-support = Njepodpěrujemy aktualizacije za tute abonementy, ale budźemy to bórze činić.
iap-upgrade-contact-support = Móžeće tutón produkt hišće dóstać – stajće so z teamom pomocy do zwiska, zo bychu móhli wam pomhać.
iap-upgrade-get-help-button = Pomoc wobstarać

## Component - PaymentForm

payment-name =
    .placeholder = Dospołne mjeno
    .label = Mjeno, kotrež so na wašej karće jewi
payment-cc =
    .label = Waša karta
payment-cancel-btn = Přetorhnyć
payment-update-btn = Aktualizować
payment-pay-btn = Nětko płaćić
payment-pay-with-paypal-btn-2 = Z { -brand-paypal } płaćić
payment-validate-name-error = Prošu zapodajće swoje mjeno

## Component - PaymentLegalBlurb

payment-legal-copy-stripe-and-paypal-3 = { -brand-mozilla } { -brand-name-stripe } a { -brand-paypal } za wěste předźěłowanje płaćenjow wužiwa.
payment-legal-link-stripe-paypal-2 = <stripePrivacyLink>Prawidła priwatnosće { -brand-name-stripe }</stripePrivacyLink> &nbsp; <paypalPrivacyLink>prawidła priwatnosće { -brand-paypal }</paypalPrivacyLink>.
payment-legal-copy-paypal-2 = { -brand-mozilla } { -brand-paypal } za wěste předźěłowanje płaćenjow wužiwa.
payment-legal-link-paypal-3 = <paypalPrivacyLink>{ -brand-paypal } Prawidła priwatnosće</paypalPrivacyLink>.
payment-legal-copy-stripe-3 = { -brand-mozilla } { -brand-name-stripe } za wěste předźěłowanje płaćenjow wužiwa.
payment-legal-link-stripe-3 = <stripePrivacyLink>Prawidła priwatnosće { -brand-name-stripe }</stripePrivacyLink>.

## Component - PaymentMethodHeader

payment-method-header = Wubjerće swoju płaćensku metodu
# This message is used to indicate the second step in a multi step process.
payment-method-header-second-step = 2. { payment-method-header }
payment-method-first-approve = Najprjedy dyrbiće swój abonement wobkrućić

## Component - PaymentProcessing

payment-processing-message = Prošu čakajće, mjeztym zo waše płaćenje předźěłujemy…

## Component - PaymentProviderDetails

payment-confirmation-cc-card-ending-in = Karta, kotraž so na { $last4 } kónči

## Component - PayPalButton

pay-with-heading-paypal-2 = Z { -brand-paypal } płaćić

## Component - PlanDetails

plan-details-header = Produktowe podrobnosće
plan-details-list-price = Lisćinowa płaćizna
plan-details-show-button = Podrobnosće pokazać
plan-details-hide-button = Podrobnosće schować
plan-details-total-label = Dohromady
plan-details-tax = Dawki a popłatki

## Component - PlanErrorDialog

product-no-such-plan = Žadyn plan za tutón produkt.

## Price details including tax
## $priceAmount (Number) - The amount billed. It will be formatted as currency.
## $taxAmount (Number) - The tax added on, not included in amount. It will be formatted as currency.

price-details-no-tax = { $priceAmount }
price-details-tax = { $priceAmount } + { $taxAmount } dawk
# $intervalCount (Number) - The interval between payments, in days.
price-details-no-tax-day =
    { $intervalCount ->
        [one] { $priceAmount } kóždy dźeń
        [two] { $priceAmount } kóždej { $intervalCount } dnjej
        [few] { $priceAmount } kóžde { $intervalCount } dny
       *[other] { $priceAmount } kóžde { $intervalCount } dnjow
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } kóždy dźeń
            [two] { $priceAmount } kóždej { $intervalCount } dnjej
            [few] { $priceAmount } kóžde { $intervalCount } dny
           *[other] { $priceAmount } kóžde { $intervalCount } dnjow
        }
# $intervalCount (Number) - The interval between payments, in weeks.
price-details-no-tax-week =
    { $intervalCount ->
        [one] { $priceAmount } kóždy tydźeń
        [two] { $priceAmount } kóždej { $intervalCount } njedźeli
        [few] { $priceAmount } kóžde { $intervalCount } njedźele
       *[other] { $priceAmount } kóžde { $intervalCount } njedźel
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } kóždy tydźeń
            [two] { $priceAmount } kóždej { $intervalCount } njedźeli
            [few] { $priceAmount } kóžde { $intervalCount } njedźele
           *[other] { $priceAmount } kóžde { $intervalCount } njedźel
        }
# $intervalCount (Number) - The interval between payments, in months.
price-details-no-tax-month =
    { $intervalCount ->
        [one] { $priceAmount } kóždy měsac
        [two] { $priceAmount } kóždej { $intervalCount } měsacaj
        [few] { $priceAmount } kóžde { $intervalCount } měsacy
       *[other] { $priceAmount } kóžde { $intervalCount } měsacow
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } kóždy měsac
            [two] { $priceAmount } kóždej { $intervalCount } měsacaj
            [few] { $priceAmount } kóžde { $intervalCount } měsacy
           *[other] { $priceAmount } kóžde { $intervalCount } měsacow
        }
# $intervalCount (Number) - The interval between payments, in years.
price-details-no-tax-year =
    { $intervalCount ->
        [one] { $priceAmount } kóžde lěto
        [two] { $priceAmount } kóždej { $intervalCount } lěće
        [few] { $priceAmount } kóžde { $intervalCount } lěta
       *[other] { $priceAmount } kóžde { $intervalCount } lět
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } kóžde lěto
            [two] { $priceAmount } kóždej { $intervalCount } lěće
            [few] { $priceAmount } kóžde { $intervalCount } lěta
           *[other] { $priceAmount } kóžde { $intervalCount } lět
        }
# $intervalCount (Number) - The interval between payments, in days.
price-details-tax-day =
    { $intervalCount ->
        [one] { $priceAmount } + dawk { $taxAmount } kóždy dźeń
        [two] { $priceAmount } + dawk { $taxAmount } kóždej { $intervalCount } dnjej
        [few] { $priceAmount } + dawk { $taxAmount } kóžde { $intervalCount } dny
       *[other] { $priceAmount } + dawk { $taxAmount } kóžde { $intervalCount } dnjow
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + dawk { $taxAmount } kóžde dźeń
            [two] { $priceAmount } + dawk { $taxAmount } kóždej { $intervalCount } dnjej
            [few] { $priceAmount } + dawk { $taxAmount } kóžde { $intervalCount } dny
           *[other] { $priceAmount } + dawk { $taxAmount } kóžde { $intervalCount } dnjow
        }
# $intervalCount (Number) - The interval between payments, in weeks.
price-details-tax-week =
    { $intervalCount ->
        [one] { $priceAmount } + dawk { $taxAmount } kóždy tydźeń
        [two] { $priceAmount } + dawk { $taxAmount } kóždej { $intervalCount } njedźeli
        [few] { $priceAmount } + dawk { $taxAmount } kóžde { $intervalCount } njedźele
       *[other] { $priceAmount } + dawk { $taxAmount } kóžde { $intervalCount } njedźel
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + dawk { $taxAmount } kóždy tydźeń
            [two] { $priceAmount } + dawk { $taxAmount } kóždej { $intervalCount } njedźeli
            [few] { $priceAmount } + dawk { $taxAmount } kóžde { $intervalCount } njedźele
           *[other] { $priceAmount } + dawk { $taxAmount } kóžde { $intervalCount } njedźel
        }
# $intervalCount (Number) - The interval between payments, in months.
price-details-tax-month =
    { $intervalCount ->
        [one] { $priceAmount } + dawk { $taxAmount } kóždy měsac
        [two] { $priceAmount } + dawk { $taxAmount } kóždej { $intervalCount } měsacaj
        [few] { $priceAmount } + dawk { $taxAmount } kóžde { $intervalCount } měsacy
       *[other] { $priceAmount } + dawk { $taxAmount } kóžde { $intervalCount } měsacow
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + dawk { $taxAmount } kóždy měsac
            [two] { $priceAmount } + dawk { $taxAmount } kóždej { $intervalCount } měsacaj
            [few] { $priceAmount } + dawk { $taxAmount } kóžde { $intervalCount } měsacy
           *[other] { $priceAmount } + dawk { $taxAmount } kóžde { $intervalCount } měsacow
        }
# $intervalCount (Number) - The interval between payments, in years.
price-details-tax-year =
    { $intervalCount ->
        [one] { $priceAmount } + dawk { $taxAmount } kóžde lěto
        [two] { $priceAmount } + dawk { $taxAmount } kóždej { $intervalCount } lěće
        [few] { $priceAmount } + dawk { $taxAmount } kóžde { $intervalCount } lěta
       *[other] { $priceAmount } + dawk { $taxAmount } kóžde { $intervalCount } lět
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + dawk { $taxAmount } kóžde lěto
            [two] { $priceAmount } + dawk { $taxAmount } kóždej { $intervalCount } lěće{ $priceAmount }
            [few] { $priceAmount } + dawk { $taxAmount } kóžde { $intervalCount } lěta
           *[other] { $priceAmount } + dawk { $taxAmount } kóžde { $intervalCount } lět
        }

## Component - SubscriptionTitle

subscription-create-title = Waš abonement konfigurować
subscription-success-title = Wobkrućenje abonementa
subscription-processing-title = Abonement so wobkruća…
subscription-error-title = Zmylk při wobkrućenju abonementa…
subscription-noplanchange-title = Tuta změna abonementoweho plana so njepodpěruje
subscription-iapsubscribed-title = Hižo abonowany
sub-guarantee = 30-dnjowska garantija wróćenja pjenjez

## Component - TermsAndPrivacy

# "Mozilla Accounts" is capitalized in this instance for title case in English
# This heading is followed by links to Terms of Service and Privacy Notice
subplat-mozilla-accounts-legal-heading = { -product-mozilla-accounts(capitalization: "uppercase") }
terms = Wužiwanske wuměnjenja
privacy = Zdźělenka priwatnosće
terms-download = Sćehnjenske wuměnjenja

## App-level string(s) and messages shared by multiple components or routes

document =
    .title = Firefox Accounts
# General aria-label for closing modals
close-aria =
    .aria-label = Modalnje začinić
settings-subscriptions-title = Abonementy
# Title of container where a user can input a coupon code to get a discount on a subscription.
coupon-promo-code = Akciski kod

## Subscription upgrade plan details - shared by multiple components, including plan details and payment form
## $amount (Number) - The amount billed. It will be formatted as currency.

# $intervalCount (Number) - The interval between payments, in days.
plan-price-interval-day =
    { $intervalCount ->
        [one] { $amount } kóždy dźeń
        [two] { $amount } kóždej { $intervalCount } dnjej
        [few] { $amount } kóžde { $intervalCount } dny
       *[other] { $amount } kóžde { $intervalCount } dnjow
    }
    .title =
        { $intervalCount ->
            [one] { $amount } kóždy dźeń
            [two] { $amount } kóždej { $intervalCount } dnjej
            [few] { $amount } kóžde { $intervalCount } dny
           *[other] { $amount } kóžde { $intervalCount } dnjow
        }
# $intervalCount (Number) - The interval between payments, in weeks.
plan-price-interval-week =
    { $intervalCount ->
        [one] { $amount } kóždy tydźeń
        [two] { $amount } kóždej { $intervalCount } njedźeli
        [few] { $amount } kóžde { $intervalCount } njedźele
       *[other] { $amount } kóžde { $intervalCount } njedźel
    }
    .title =
        { $intervalCount ->
            [one] { $amount } kóždy dźeń
            [two] { $amount } kóždej { $intervalCount } njedźeli
            [few] { $amount } kóžde { $intervalCount } njedźele
           *[other] { $amount } kóžde { $intervalCount } njedźel
        }
# $intervalCount (Number) - The interval between payments, in months.
plan-price-interval-month =
    { $intervalCount ->
        [one] { $amount } kóždy měsac
        [two] { $amount } kóždej { $intervalCount } měsacaj
        [few] { $amount } kóžde { $intervalCount } měsacy
       *[other] { $amount } kóžde { $intervalCount } měsacow
    }
    .title =
        { $intervalCount ->
            [one] { $amount } kóždy měsac
            [two] { $amount } kóždej { $intervalCount } měsacaj
            [few] { $amount } kóžde { $intervalCount } měsacy
           *[other] { $amount } kóžde { $intervalCount } měsacow
        }
# $intervalCount (Number) - The interval between payments, in years.
plan-price-interval-year =
    { $intervalCount ->
        [one] { $amount } kóžde lěto
        [two] { $amount } kóždej { $intervalCount } lěće
        [few] { $amount } kóžde { $intervalCount } lěta
       *[other] { $amount } kóžde { $intervalCount } lět
    }
    .title =
        { $intervalCount ->
            [one] { $amount } kóžde lěto
            [two] { $amount } kóždej { $intervalCount } lěće
            [few] { $amount } kóžde { $intervalCount } lěta
           *[other] { $amount } kóžde { $intervalCount } lět
        }

## Error messages

# App error dialog
general-error-heading = Powšitkowny nałoženski zmylk
basic-error-message = Něšto je so nimokuliło. Prošu spytajće pozdźišo hišće raz.
payment-error-1 = Hmm. Při awtorizowanju wašeho płaćenja je problem nastał. Spytajće hišće raz abo stajće so z wudawaćelom swojeje karty do zwiska.
payment-error-2 = Hmm. Při awtorizowanju wašeho płaćenja je problem nastał. Stajće so z wudawaćelom swojeje karty do zwiska.
payment-error-3b = Při předźěłowanju wašeho płaćenja je njewočakowany zmylk nastał, prošu spytajće hišće raz.
expired-card-error = Zda so, kaž by waša kreditna karta spadnyła. Spytajće druhu kartu.
insufficient-funds-error = Zda so, kaž by waša karta njedosahace dobroměće měła. Spytajće druhu kartu.
withdrawal-count-limit-exceeded-error = Zda so, kaž byšće z tutej transakciju swój kartowy limit překročał. Spytajće druhu kartu.
charge-exceeds-source-limit = Zda so, kaž byšće z tutej transakciju swój wšědny kartowy limit překročał. Spytajće druhu kartu abo za 24 hodźin.
instant-payouts-unsupported = Zda so, kaž njeby waša debitna karta za hnydomne płaćenja konfigurowana była. Spytajće druhu debitnu abo kreditnu kartu.
duplicate-transaction = Hmm. Zda so, kaž by so identiska transakcija runje pósłała. Přepruwujće swoju historiju płaćenjow.
coupon-expired = Zda so, kaž by promokod spadnył.
card-error = Waša transakcija njeda so předźěłować. Přepruwujće prošu informacije swojeje kreditneje karty a spytajće hišće raz.
country-currency-mismatch = Měna tutoho abonementa za kraj, kotryž je z wašim płaćenjom zwjazany, płaćiwa njeje.
currency-currency-mismatch = Bohužel njemóžeće měny přeměnić.
location-unsupported = Waše aktualne městno so po našich wužiwanskich wuměnjenjach njepodpěruje.
no-subscription-change = Bohužel njemóžeće swój abonementowy plan změnić.
# $mobileAppStore (String) - "Google Play Store" or "App Store", localized when the translation is available.
iap-already-subscribed = Sće hižo přez { $mobileAppStore } abonował.
# $productName (String) - The name of the subscribed product.
fxa-account-signup-error-2 = Systemowy zmylk je zawinował, zo waše registrowanje za { $productName } njeje poradźiło. Waša płaćenska metoda njeje so wobćežiła. Spytajće prošu hišće raz.
fxa-post-passwordless-sub-error = Abonement je wobkrućeny, ale wobkrućenska strona njeda so začitać. Prošu přepruwujće swoje mejlki, zo byšće swoje konto konfigurował.
newsletter-signup-error = Njejsće so za e-mejle wo produktowych aktualizacijach registrował. Móžeće to w swojich kontowych nastajenjach hišće raz spytać.
product-plan-error =
    .title = Zmylk při čitanju planow
product-profile-error =
    .title = Zmylk při čitanju profila
product-customer-error =
    .title = Zmylk při čitanju kupca
product-plan-not-found = Plan njeje so namakał
product-location-unsupported-error = Městno so njepodpěruje

## Hooks - coupons

coupon-success = Waš plan so awtomatisce za lisćinowu płaćiznu wobnowja.
# $couponDurationDate (Date) - The date at which the coupon is no longer valid, and the subscription is billed the list price.
coupon-success-repeating = Waš plan so po { $couponDurationDate } za lisćinowu płaćiznu awtomatisce podlěši.

## Routes - Checkout - New user

new-user-step-1-2 = 1. Załožće { -product-mozilla-account(case: "acc", capitalization: "lower") }
new-user-card-title = Zapodajće swoje kartowe informacije
new-user-submit = Nětko abonować

## Routes - Product and Subscriptions

sub-update-payment-title = Płaćenske informacije

## Routes - Product/AcceptedCards
## Used in both Routes - Checkout and Product/SubscriptionCreate

pay-with-heading-card-only = Z kartu płaćić
product-invoice-preview-error-title = Problem při čitanju přehlada zličbowanki
product-invoice-preview-error-text = Přehlad zličbowanki njeda so začitać

## Routes - Product - IapRoadblock

subscription-iaperrorupgrade-title = Hišće njemóžemy was aktualizować

# The following are not terms because they are not used directly in messages,
# but rather looked up in code and passed into the message as variables.

brand-name-google-play-2 = Wobchod { -google-play }
brand-name-apple-app-store-2 = { -app-store }

## Routes - Product - Subscription upgrade

product-plan-change-heading = Přepruwujće swoju změnu
sub-change-failed = Njeje so poradźiło, plan změnić
sub-update-acknowledgment =
    Waš plan so hnydom změni, a za zbytk tuteje wotličenskeje periody so wam dźensa
    podźělna suma wobličuje. Započinajo z { $startingDate }
    so połna suma wobličuje.
sub-change-submit = Změnu wobkrućić
sub-update-current-plan-label = Aktualny plan
sub-update-new-plan-label = Nowy plan
sub-update-total-label = Nowa suma
sub-update-prorated-upgrade = Podźělna aktualizacija

## Checkout line item for subscription plan change listing the product name and frequency of payment
## For example, a Mozilla VPN subscription charged monthly would appear as: Mozilla VPN (Monthly)
## Variables:
##   $productName (String) - Name of the upgraded product (e.g. Mozilla VPN)

sub-update-new-plan-daily = { $productName } (kóždy dźeń)
sub-update-new-plan-weekly = { $productName } (kóždy tydźeń)
sub-update-new-plan-monthly = { $productName } (kóždy měsac)
sub-update-new-plan-yearly = { $productName } (kóžde lěto)
sub-update-prorated-upgrade-credit = Pokazany kontowy staw so wašemu kontu přidawa a za přichodne zličbowanki wužiwa.

## Routes - Subscriptions - Cancel

sub-item-cancel-sub = Abonement wupowědźić
sub-item-stay-sub = Dale abonować

## $name (String) - The name of the subscribed product.
## $period (Date) - The last day of product access

sub-item-cancel-msg =
    Po { $period }, poslednim dnju swojeho wotličenskeje periody,
    hižo njemóžeće { $name } wužiwać.
sub-item-cancel-confirm =
    { $period } mój přistup a moje w { $name }
    składowane informacije wotstronić
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
sub-promo-coupon-applied = Dobropis { $promotion_name } nałoženy: <priceDetails></priceDetails>
subscription-management-account-credit-balance = Tute abonementowe płaćenje je k derjeměću na wašim konće wjedło: <priceDetails></priceDetails>

## Routes - Subscription

sub-route-idx-reactivating = Zasoaktiwizowanje abonementa je so nimokuliło
sub-route-idx-cancel-failed = Wupowědźenje abonementa je so nimokuliło
sub-route-idx-contact = Pomoc kontaktować
sub-route-idx-cancel-msg-title = Je nam žel, zo nas wopušćeće
# $name (String) - The name of the subscribed product.
# $date (Date) - Last day of product access
sub-route-idx-cancel-msg =
    Waš abonement za { $name } je so wupowědźił.
          <br />
          Maće hišće přistup k { $name } hač do { $date }.
sub-route-idx-cancel-aside-2 = Maće prašenja? Wopytajće <a>Pomoc { -brand-mozilla }</a>.

## Routes - Subscriptions - Errors

sub-customer-error =
    .title = Zmylk při čitanju kupca
sub-invoice-error =
    .title = Problem při čitanju zličbowankow
sub-billing-update-success = Waše płaćenske informacije su so wuspěšnje zaktualizowali
sub-invoice-previews-error-title = Problem při čitanju přehladow zličbowankow
sub-invoice-previews-error-text = Přehlady zličbowankow njedadźa so začitać

## Routes - Subscription - ActionButton

pay-update-change-btn = Změnić
pay-update-manage-btn = Rjadować

## Routes - Subscriptions - Cancel and IapItem
## $priceAmount (Number) - The amount billed. It will be formatted as currency.
## $taxAmount (Number) - The tax added on, not included in amount. It will be formatted as currency.
## $date (Date) - The date for the next time a charge will occur.

sub-next-bill = Přichodna zličbowanka: { $date }
sub-next-bill-due-date = Přichodna zličbowanka je { $date } płaćomna
sub-expires-on = Spadnje { $date }

## Routes - Subscription - PaymentUpdate


# $expirationDate (Date) - The payment card's expiration date.

pay-update-card-exp = Spadnje { $expirationDate }
sub-route-idx-updating = Wotličenske informacije so aktualizuja…
sub-route-payment-modal-heading = Njepłaćiwe płaćenske informacije
sub-route-payment-modal-message-2 = Zda so, zo je zmylk z wašim kontom { -brand-paypal }, dyrbimy trěbne kroki přewjesć, zo bychmy tutón płaćenski problem rozrisali.
sub-route-missing-billing-agreement-payment-alert = Njepłaćiwe płaćenske informacije; je zmylk z wašim kontom. <div>Rjadować</div>
sub-route-funding-source-payment-alert = Njepłaciwe płaćenske informacije; je zmylk z wašim kontom. Tute warnowanje trochu časa trjeba, zo by so zhubiło, po tym zo sće wuspěšnje swóje informacije  zaktualizěrował. <div>Rjadować</div>

## Routes - Subscription - SubscriptionItem

sub-item-no-such-plan = Žadyn plan za tutón abonement.
invoice-not-found = Naslědna zličbowanka njeje so namakała
sub-item-no-such-subsequent-invoice = Naslědna zličbowanka njeje so za tutón abonement namakała.
sub-invoice-preview-error-title = Přehlad zličbowanki njeje so namakał
sub-invoice-preview-error-text = Přehlad zličbowanki njeje so za tutón abonement namakał

## Routes - Subscriptions - Reactivate
## $name (String) - The name of the subscribed product.

reactivate-confirm-dialog-header = Chceće { $name } dale wužiwać?
# $amount (Number) - The amount billed. It will be formatted as currency.
# $last (String) - The last 4 digits of the card that will be charged
# $endDate (Date) - Last day of product access
reactivate-confirm-copy =
    Waš přistup k { $name } dale wobsteji. a waša wotličenska perioda
    a waše płaćenje samsnej wostanjetej. Waše přichodne wotknihowanje
    { $endDate } { $amount } wučini, za kartu, kotraž so na { $last } kónči.
# Alternate copy used when a payment method is not available, e.g. for free trials
# $amount (Number) - The amount billed. It will be formatted as currency.
# $endDate (Date) - Last day of product access
reactivate-confirm-without-payment-method-copy =
    Waš přistup k { $name } dale wobsteji. a waš wotličenska perioda
    a waše płaćenje samsnej wostanjetej. Waše přichodne wotknihowanje
    budźe { $endDate } { $amount }.
reactivate-confirm-button = Abonement wobnowić

## $date (Date) - Last day of product access

reactivate-panel-copy = Zhubiće <strong>{ $date }</strong> přistup k { $name }.
reactivate-success-copy = Wulki dźak! Sće hotowy za start.
reactivate-success-button = Začinić

## Routes - Subscriptions - Subscription iap item

sub-iap-item-google-purchase-2 = { -brand-google }: Kup w nałoženju
sub-iap-item-apple-purchase-2 = { -brand-apple }: Kup w nałoženju
sub-iap-item-manage-button = Rjadować
