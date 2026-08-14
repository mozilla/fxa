# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.


## Component - AppLayout

settings-home = Domovská stránka účtu
settings-project-header-title = { -product-mozilla-account }

## Component - CouponForm

# Title of container showing discount coupon code applied to a subscription.
coupon-promo-code-applied = Promo kód byl použit
coupon-submit = Použít
coupon-remove = Odebrat
coupon-error = Zadaný kód je neplatný nebo jeho platnost vypršela.
coupon-error-generic = Při zpracování kódu došlo k chybě. Zkuste to prosím znovu.
coupon-error-expired = Platnost zadaného kódu vypršela.
coupon-error-limit-reached = Limit kódu, který jste zadali, už byl vyčerpán.
coupon-error-invalid = Zadaný kód je neplatný.
# $couponDurationDate (Date) - The date at which the coupon is no longer valid, and the subscription is billed the list price.
coupon-enter-code =
    .placeholder = Vložte kód

## Component - Fields

default-input-error = Toto pole je povinné
input-error-is-required = Pole „{ $label }“ je povinné

## Component - Header

brand-name-mozilla-logo = Logo { -brand-mozilla(case: "gen") }

## Component - NewUserEmailForm

new-user-sign-in-link-2 = Už máte { -product-mozilla-account(capitalization: "lower") }? <a>Přihlaste se</a>
# "Required" to indicate that the user must use the checkbox below this text to
# agree to a payment method's terms of service and privacy notice in order to
# continue.
new-user-enter-email =
    .label = Zadejte svou e-mailovou adresu
new-user-confirm-email =
    .label = Potvrďte svou e-mailovou adresu
new-user-subscribe-product-updates-mozilla = Chci dostávat produktové novinky o { -brand-mozilla(case: "loc") }
new-user-subscribe-product-updates-snp = Chci dostávat novinky a aktualizace týkající se zabezpečení a ochrany osobních údajů od { -brand-mozilla(case: "loc") }
new-user-subscribe-product-updates-hubs = Chci dostávat produktové novinky a aktualizace z { -product-mozilla-hubs(case: "loc") } a { -brand-mozilla(case: "loc") }
new-user-subscribe-product-updates-mdnplus = Chci dostávat produktové novinky a aktualizace od { -product-mdn-plus } a { -brand-mozilla(case: "loc") }
new-user-subscribe-product-assurance = Vaši e-mailovou adresu použijeme pouze k založení vašeho účtu. Nikdy ne neprodáme žádné třetí straně.
new-user-email-validate = E-mailová adresa je neplatná
new-user-email-validate-confirm = E-mailové adresy se neshodují
new-user-already-has-account-sign-in = Účet už máte, <a>přihlaste se</a>
# $domain (String) - the email domain provided by the user during sign up
new-user-invalid-email-domain = Neudělali jste překlep? Doména { $domain } nemá e-maily.

## Component - PaymentConfirmation

payment-confirmation-thanks-heading = Děkujeme!
payment-confirmation-thanks-heading-account-exists = Děkujeme. Nyní zkontrolujte svou e-mailovou schránku.
# $email (string) - The user's email.
# $productName (String) - The name of the subscribed product.
payment-confirmation-thanks-subheading = Na adresu { $email } jsme vám poslali e-mail v potvrzením a podrobnostmi jak začít náš produkt { $product_name } používat.
# $email (string) - The user's email.
payment-confirmation-thanks-subheading-account-exists = Na adresu { $email } vám zasíláme e-mail s pokyny pro nastavení vašeho účtu a s informacemi k platbě.
payment-confirmation-order-heading = Detaily objednávky
payment-confirmation-invoice-number = Faktura č. { $invoiceNumber }
# $invoiceDate (Date) - Start date of the latest invoice
payment-confirmation-invoice-date = { $invoiceDate }
payment-confirmation-details-heading-2 = Platební informace
payment-confirmation-amount = { $amount } jednou za { $interval }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in days.
payment-confirmation-amount-day =
    { $intervalCount ->
        [one] { $amount } každý den
        [few] { $amount } každé { $intervalCount } dny
       *[other] { $amount } každých { $intervalCount } dní
    }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in weeks.
payment-confirmation-amount-week =
    { $intervalCount ->
        [one] { $amount } týdně
        [few] { $amount } každé { $intervalCount } týdny
       *[other] { $amount } každých { $intervalCount } týdnů
    }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in months.
payment-confirmation-amount-month =
    { $intervalCount ->
        [one] { $amount } měsíčně
        [few] { $amount } každé { $intervalCount } měsíce
       *[other] { $amount } každých { $intervalCount } měsíců
    }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in years.
payment-confirmation-amount-year =
    { $intervalCount ->
        [one] { $amount } ročně
        [few] { $amount } každé { $intervalCount } roky
       *[other] { $amount } každých { $intervalCount } let
    }
payment-confirmation-download-button = Pokračovat ke stažení

## Component - PaymentConsentCheckbox

payment-confirm-with-legal-links-static-3 = Opravňuji organizaci { -brand-mozilla } účtovat uvedenou částku na vrub mého způsobu platby, a to v souladu s <termsOfServiceLink>podmínkami poskytování služby</termsOfServiceLink> a <privacyNoticeLink>zásadami ochrany osobních údajů</privacyNoticeLink>, dokud nezruším své předplatné.
payment-confirm-checkbox-error = Pro pokračování je třeba toto dokončit

## Component - PaymentErrorView

payment-error-retry-button = Zkusit znovu
payment-error-manage-subscription-button = Správa předplatného

## Component - PaymentErrorView - IAP upgrade errors

# $productName (String) - The name of the subscribed product.
iap-upgrade-already-subscribed-2 = Předplatné produktu { $productName } už máte skrze obchod s aplikacemi { -brand-google } nebo { -brand-apple }.
iap-upgrade-no-bundle-support = V tuto chvílí změnu plánu těchto předplatných nepodporujeme, ale brzy budeme.
iap-upgrade-contact-support = Tento produkt můžete stále získat – abychom vám mohli pomoci, kontaktujte prosím podporu.
iap-upgrade-get-help-button = Získat pomoc

## Component - PaymentForm

payment-name =
    .placeholder = Celé jméno
    .label = Jak je uvedeno na vaší kartě
payment-cc =
    .label = Vaše karta
payment-cancel-btn = Zrušit
payment-update-btn = Aktualizovat
payment-pay-btn = Zaplatit
payment-pay-with-paypal-btn-2 = Zaplatit přes { -brand-paypal }
payment-validate-name-error = Zadejte prosím své jméno

## Component - PaymentLegalBlurb

payment-legal-copy-stripe-and-paypal-3 = { -brand-mozilla } používá pro bezpečné zpracování plateb { -brand-name-stripe } a { -brand-paypal }.
payment-legal-link-stripe-paypal-2 = Zásady ochrany osobních údajů pro službu <stripePrivacyLink>{ -brand-name-stripe }</stripePrivacyLink> &nbsp; Zásady ochrany osobních údajů pro službu <paypalPrivacyLink>{ -brand-paypal }</paypalPrivacyLink>
payment-legal-copy-paypal-2 = { -brand-mozilla } používá pro bezpečné zpracování plateb { -brand-paypal(case: "acc") }.
payment-legal-link-paypal-3 = Zásady ochrany osobních údajů pro službu <paypalPrivacyLink>{ -brand-paypal }</paypalPrivacyLink>
payment-legal-copy-stripe-3 = { -brand-mozilla } používá pro bezpečné zpracování plateb { -brand-name-stripe(case: "acc") }.
payment-legal-link-stripe-3 = Zásady ochrany osobních údajů pro službu <stripePrivacyLink>{ -brand-name-stripe }</stripePrivacyLink>.

## Component - PaymentMethodHeader

payment-method-header = Vyberte způsob platby
# This message is used to indicate the second step in a multi step process.
payment-method-header-second-step = 2. { payment-method-header }
payment-method-first-approve = Nejprve musíte schválit své předplatné

## Component - PaymentProcessing

payment-processing-message = Počkejte prosím na zpracování vaší platby…

## Component - PaymentProviderDetails

payment-confirmation-cc-card-ending-in = Karta končící na { $last4 }

## Component - PayPalButton

pay-with-heading-paypal-2 = Zaplatit přes { -brand-paypal }

## Component - PlanDetails

plan-details-header = Informace o produktu
plan-details-list-price = Ceník
plan-details-show-button = Zobrazit podrobnosti
plan-details-hide-button = Skrýt podrobnosti
plan-details-total-label = Celkem
plan-details-tax = Daně a poplatky

## Component - PlanErrorDialog

product-no-such-plan = Takové předplatné pro tento produkt neexistuje.

## Price details including tax
## $priceAmount (Number) - The amount billed. It will be formatted as currency.
## $taxAmount (Number) - The tax added on, not included in amount. It will be formatted as currency.

price-details-no-tax = { $priceAmount }
price-details-tax = { $priceAmount } + daň { $taxAmount }
# $intervalCount (Number) - The interval between payments, in days.
price-details-no-tax-day =
    { $intervalCount ->
        [one] { $priceAmount } denně
        [few] { $priceAmount } každé { $intervalCount } dny
        [many] { $priceAmount } každých { $intervalCount } dní
       *[other] { $priceAmount } každých { $intervalCount } dní
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } denně
            [few] { $priceAmount } každé { $intervalCount } dny
            [many] { $priceAmount } každých { $intervalCount } dní
           *[other] { $priceAmount } každých { $intervalCount } dní
        }
# $intervalCount (Number) - The interval between payments, in weeks.
price-details-no-tax-week =
    { $intervalCount ->
        [one] { $priceAmount } týdně
        [few] { $priceAmount } každé { $intervalCount } týdny
        [many] { $priceAmount } každých { $intervalCount } týdnů
       *[other] { $priceAmount } každých { $intervalCount } týdnů
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } týdně
            [few] { $priceAmount } každé { $intervalCount } týdny
            [many] { $priceAmount } každých { $intervalCount } týdnů
           *[other] { $priceAmount } každých { $intervalCount } týdnů
        }
# $intervalCount (Number) - The interval between payments, in months.
price-details-no-tax-month =
    { $intervalCount ->
        [one] { $priceAmount } měsíčně
        [few] { $priceAmount } každé { $intervalCount } měsíce
        [many] { $priceAmount } každých { $intervalCount } měsíců
       *[other] { $priceAmount } každých { $intervalCount } měsíců
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } měsíčně
            [few] { $priceAmount } každé { $intervalCount } měsíce
            [many] { $priceAmount } každých { $intervalCount } měsíců
           *[other] { $priceAmount } každých { $intervalCount } měsíců
        }
# $intervalCount (Number) - The interval between payments, in years.
price-details-no-tax-year =
    { $intervalCount ->
        [one] { $priceAmount } ročně
        [few] { $priceAmount } každé { $intervalCount } roky
        [many] { $priceAmount } každých { $intervalCount } let
       *[other] { $priceAmount } každých { $intervalCount } let
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } ročně
            [few] { $priceAmount } každé { $intervalCount } roky
            [many] { $priceAmount } každých { $intervalCount } let
           *[other] { $priceAmount } každých { $intervalCount } let
        }
# $intervalCount (Number) - The interval between payments, in days.
price-details-tax-day =
    { $intervalCount ->
        [one] { $priceAmount } + daň { $taxAmount } denně
        [few] { $priceAmount } + daň { $taxAmount } každé { $intervalCount } dny
        [many] { $priceAmount } + daň { $taxAmount } každých { $intervalCount } dní
       *[other] { $priceAmount } + daň { $taxAmount } každých { $intervalCount } dní
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + daň { $taxAmount } denně
            [few] { $priceAmount } + daň { $taxAmount } každé { $intervalCount } dny
            [many] { $priceAmount } + daň { $taxAmount } každých { $intervalCount } dní
           *[other] { $priceAmount } + daň { $taxAmount } každých { $intervalCount } dní
        }
# $intervalCount (Number) - The interval between payments, in weeks.
price-details-tax-week =
    { $intervalCount ->
        [one] { $priceAmount } + daň { $taxAmount } týdně
        [few] { $priceAmount } + daň { $taxAmount } každé { $intervalCount } týdny
        [many] { $priceAmount } + daň { $taxAmount } každých { $intervalCount } týdnů
       *[other] { $priceAmount } + daň { $taxAmount } každých { $intervalCount } týdnů
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + daň { $taxAmount } týdně
            [few] { $priceAmount } + daň { $taxAmount } každé { $intervalCount } týdny
            [many] { $priceAmount } + daň { $taxAmount } každých { $intervalCount } týdnů
           *[other] { $priceAmount } + daň { $taxAmount } každých { $intervalCount } týdnů
        }
# $intervalCount (Number) - The interval between payments, in months.
price-details-tax-month =
    { $intervalCount ->
        [one] { $priceAmount } + daň { $taxAmount } měsíčně
        [few] { $priceAmount } + daň { $taxAmount } každé { $intervalCount } měsíce
        [many] { $priceAmount } + daň { $taxAmount } každých { $intervalCount } měsíců
       *[other] { $priceAmount } + daň { $taxAmount } každých { $intervalCount } měsíců
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + daň { $taxAmount } měsíčně
            [few] { $priceAmount } + daň { $taxAmount } každé { $intervalCount } měsíce
            [many] { $priceAmount } + daň { $taxAmount } každých { $intervalCount } měsíců
           *[other] { $priceAmount } + daň { $taxAmount } každých { $intervalCount } měsíců
        }
# $intervalCount (Number) - The interval between payments, in years.
price-details-tax-year =
    { $intervalCount ->
        [one] { $priceAmount } + daň { $taxAmount } ročně
        [few] { $priceAmount } + daň { $taxAmount } každé { $intervalCount } roky
        [many] { $priceAmount } + daň { $taxAmount } každých { $intervalCount } let
       *[other] { $priceAmount } + daň { $taxAmount } každých { $intervalCount } let
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + daň { $taxAmount } ročně
            [few] { $priceAmount } + daň { $taxAmount } každé { $intervalCount } roky
            [many] { $priceAmount } + daň { $taxAmount } každých { $intervalCount } let
           *[other] { $priceAmount } + daň { $taxAmount } každých { $intervalCount } let
        }

## Component - SubscriptionTitle

subscription-create-title = Nastavení předplatného
subscription-success-title = Potvrzení předplatného
subscription-processing-title = Potvrzování předplatného…
subscription-error-title = Potvrzení předplatného se nezdařilo…
subscription-noplanchange-title = Tato změna předplatného není podporována
subscription-iapsubscribed-title = Už předplatné máte
sub-guarantee = 30denní záruka vrácení peněz

## Component - TermsAndPrivacy

# "Mozilla Accounts" is capitalized in this instance for title case in English
# This heading is followed by links to Terms of Service and Privacy Notice
subplat-mozilla-accounts-legal-heading = { -product-mozilla-accounts(capitalization: "uppercase") }
terms = Podmínky služby
privacy = Zásady ochrany osobních údajů
terms-download = Stáhnout podmínky

## App-level string(s) and messages shared by multiple components or routes

document =
    .title = Účet Firefoxu
# General aria-label for closing modals
close-aria =
    .aria-label = Zavřít
settings-subscriptions-title = Předplatné
# Title of container where a user can input a coupon code to get a discount on a subscription.
coupon-promo-code = Promo kód

## Subscription upgrade plan details - shared by multiple components, including plan details and payment form
## $amount (Number) - The amount billed. It will be formatted as currency.

# $intervalCount (Number) - The interval between payments, in days.
plan-price-interval-day =
    { $intervalCount ->
        [one] { $amount } denně
        [few] { $amount } každé { $intervalCount } dny
        [many] { $amount } každých { $intervalCount } dní
       *[other] { $amount } každých { $intervalCount } dní
    }
    .title =
        { $intervalCount ->
            [one] { $amount } denně
            [few] { $amount } každé { $intervalCount } dny
            [many] { $amount } každých { $intervalCount } dní
           *[other] { $amount } každých { $intervalCount } dní
        }
# $intervalCount (Number) - The interval between payments, in weeks.
plan-price-interval-week =
    { $intervalCount ->
        [one] { $amount } týdně
        [few] { $amount } každé { $intervalCount } týdny
        [many] { $amount } každých { $intervalCount } týdnů
       *[other] { $amount } každých { $intervalCount } týdnů
    }
    .title =
        { $intervalCount ->
            [one] { $amount } týdně
            [few] { $amount } každé { $intervalCount } týdny
            [many] { $amount } každých { $intervalCount } týdnů
           *[other] { $amount } každých { $intervalCount } týdnů
        }
# $intervalCount (Number) - The interval between payments, in months.
plan-price-interval-month =
    { $intervalCount ->
        [one] { $amount } měsíčně
        [few] { $amount } každé { $intervalCount } měsíce
        [many] { $amount } každých { $intervalCount } měsíců
       *[other] { $amount } každých { $intervalCount } měsíců
    }
    .title =
        { $intervalCount ->
            [one] { $amount } měsíčně
            [few] { $amount } každé { $intervalCount } měsíce
            [many] { $amount } každých { $intervalCount } měsíců
           *[other] { $amount } každých { $intervalCount } měsíců
        }
# $intervalCount (Number) - The interval between payments, in years.
plan-price-interval-year =
    { $intervalCount ->
        [one] { $amount } ročně
        [few] { $amount } každé { $intervalCount } roky
        [many] { $amount } každých { $intervalCount } let
       *[other] { $amount } každých { $intervalCount } let
    }
    .title =
        { $intervalCount ->
            [one] { $amount } ročně
            [few] { $amount } každé { $intervalCount } roky
            [many] { $amount } každých { $intervalCount } let
           *[other] { $amount } každých { $intervalCount } let
        }

## Error messages

# App error dialog
general-error-heading = Obecná chyba aplikace
basic-error-message = Něco se pokazilo. Zkuste to prosím znovu později.
payment-error-1 = Autorizace vaší platby se nezdařila. Zkuste to prosím znovu nebo kontaktujte vydavatele vaší karty.
payment-error-2 = Autorizace vaší platby se nezdařila. Kontaktujte prosím vydavatele vaší karty.
payment-error-3b = Při zpracování platby došlo k neočekávané chybě, zkuste to prosím znovu.
expired-card-error = Vypadá to, že platnost vaší karty vypršela. Zkuste použít jinou.
insufficient-funds-error = Vypadá to, že na vaší kartě není dostatek proštředků. Zkuste použít jinou.
withdrawal-count-limit-exceeded-error = Vypadá to, že je vyčerpán limit vaší karty. Zkuste použít jinou.
charge-exceeds-source-limit = Vypadá to, že je vyčerpán denní limit vaší karty. Zkuste to znovu za 24 hodin, nebo použít jinou kartu.
instant-payouts-unsupported = Vypadá to, že vaše karta nemá povolené okamžité platby. Zkuste použít jinou.
duplicate-transaction = Vypadá to, že jsme před chvíli přijali zcela stejnou transakci. Zkontrolujte prosím historii svých plateb.
coupon-expired = Platnost tohoto promo kódu už nejspíše skončila.
card-error = Vaši transakci se nepodařilo zpracovat. Zkontrolujte prosím zadané údaje o své kartě a zkuste to znovu.
country-currency-mismatch = Měna použitá pro toto předplatné není platná pro zemi spojenou s vaší platbou.
currency-currency-mismatch = Změna měny bohužel není možná.
location-unsupported = Vaše aktuální poloha není podle našich podmínek služby podporována.
no-subscription-change = Promiňte. Svůj plán předplatného nemůžete změnit.
# $mobileAppStore (String) - "Google Play Store" or "App Store", localized when the translation is available.
iap-already-subscribed = Předplatné už máte skrze obchod { $mobileAppStore }.
# $productName (String) - The name of the subscribed product.
fxa-account-signup-error-2 = Chyba v systému zabránila registraci produktu { $productName }. Nebyla vám zaúčtována žádná platba. Zkuste to prosím znovu.
fxa-post-passwordless-sub-error = Předplatné je potvrzeno, ale nepodařilo se načíst stránku s potvrzením. Informace ohledně nastavení účtu najdete ve své e-mailové schránce.
newsletter-signup-error = Nejste přihlášeni k odběru e-mailů o produktových novinkách. Přihlásit se můžete v nastavení účtu.
product-plan-error =
    .title = Předplatné se nepodařilo načíst
product-profile-error =
    .title = Profil se nepodařilo načíst
product-customer-error =
    .title = Informace o zákazníkovi se nepodařilo načíst
product-plan-not-found = Předplatné nenalezeno
product-location-unsupported-error = Lokalita není podporována

## Hooks - coupons

coupon-success = Váš plán se automaticky obnoví za běžnou cenu podle ceníku.
# $couponDurationDate (Date) - The date at which the coupon is no longer valid, and the subscription is billed the list price.
coupon-success-repeating = Vaše předplatné se po { $couponDurationDate } automaticky obnoví za běžnou cenu dle ceníku.

## Routes - Checkout - New user

new-user-step-1-2 = 1. Vytvoření { -product-mozilla-account(case: "gen", capitalization: "lower") }
new-user-card-title = Zadejte informace o platební kartě
new-user-submit = Předplatit

## Routes - Product and Subscriptions

sub-update-payment-title = Platební informace

## Routes - Product/AcceptedCards
## Used in both Routes - Checkout and Product/SubscriptionCreate

pay-with-heading-card-only = Zaplatit kartou
product-invoice-preview-error-title = Náhled faktury se nepodařilo načíst
product-invoice-preview-error-text = Náhled faktury nelze načíst

## Routes - Product - IapRoadblock

subscription-iaperrorupgrade-title = Vaše předplatné zatím nemůžeme povýšit

# The following are not terms because they are not used directly in messages,
# but rather looked up in code and passed into the message as variables.

brand-name-google-play-2 = Obchod { -google-play }
brand-name-apple-app-store-2 = { -app-store }

## Routes - Product - Subscription upgrade

product-plan-change-heading = Zkontrolujte změnu předplatného
sub-change-failed = Nepodařilo se změnit vaše předplatné
sub-update-acknowledgment = Vaše předplatné se změní okamžitě a bude vám naúčtována platba jako doplatek do konce stávajícího předplatného. Od { $startingDate } vám bude účtována plná částka.
sub-change-submit = Potvrdit změnu
sub-update-current-plan-label = Stávající předplatné
sub-update-new-plan-label = Nový plán
sub-update-total-label = Nová celková částka
sub-update-prorated-upgrade = Poměrná aktualizace

## Checkout line item for subscription plan change listing the product name and frequency of payment
## For example, a Mozilla VPN subscription charged monthly would appear as: Mozilla VPN (Monthly)
## Variables:
##   $productName (String) - Name of the upgraded product (e.g. Mozilla VPN)

sub-update-new-plan-daily = { $productName } (denně)
sub-update-new-plan-weekly = { $productName } (týdně)
sub-update-new-plan-monthly = { $productName } (měsíčně)
sub-update-new-plan-yearly = { $productName } (ročně)
sub-update-prorated-upgrade-credit = Zobrazený záporný zůstatek bude připsán ve prospěch vašeho účtu a bude použit k úhradě budoucích faktur.

## Routes - Subscriptions - Cancel

sub-item-cancel-sub = Zrušit předplatné
sub-item-stay-sub = Zachovat předplatné

## $name (String) - The name of the subscribed product.
## $period (Date) - The last day of product access

sub-item-cancel-msg =
    Po skončení předplaceného období { $period }
    už nebudete mít ke službě { $name } přístup.
sub-item-cancel-confirm = Zrušit můj přístup a smazat má uložená data ve službě { $name } dne { $period }
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
sub-promo-coupon-applied = Kupón { $promotion_name } byl použit: <priceDetails></priceDetails>
subscription-management-account-credit-balance = Tato platba za předplatné způsobila, že se na vašem účtu připsal kredit: <priceDetails></priceDetails>

## Routes - Subscription

sub-route-idx-reactivating = Předplatné se nepodařilo opětovně aktivovat
sub-route-idx-cancel-failed = Předplatné se nepodařilo zrušit
sub-route-idx-contact = Kontaktujte podporu
sub-route-idx-cancel-msg-title = Je nám líto, že odcházíte
# $name (String) - The name of the subscribed product.
# $date (Date) - Last day of product access
sub-route-idx-cancel-msg =
    Vaše předplatné služby { $name } bylo zrušeno.
          <br />
          Přístup ke službě { $name } vám zůstane do { $date }.
sub-route-idx-cancel-aside-2 = Máte otázky? Navštivte <a>podporu { -brand-mozilla(case: "gen") }</a>.

## Routes - Subscriptions - Errors

sub-customer-error =
    .title = Informace o zákazníkovi se nepodařilo načíst
sub-invoice-error =
    .title = Fakturu se nepodařilo načíst
sub-billing-update-success = Vaše platební údaje byly úspěšně aktualizovány
sub-invoice-previews-error-title = Náhledy faktur se nepodařilo načíst
sub-invoice-previews-error-text = Náhledy faktur nelze načíst

## Routes - Subscription - ActionButton

pay-update-change-btn = Změnit
pay-update-manage-btn = Správa

## Routes - Subscriptions - Cancel and IapItem
## $priceAmount (Number) - The amount billed. It will be formatted as currency.
## $taxAmount (Number) - The tax added on, not included in amount. It will be formatted as currency.
## $date (Date) - The date for the next time a charge will occur.

sub-next-bill = Další platba dne { $date }
sub-next-bill-due-date = Další platba je splatná dne { $date }
sub-expires-on = Datum konce platnosti: { $date }

## Routes - Subscription - PaymentUpdate


# $expirationDate (Date) - The payment card's expiration date.

pay-update-card-exp = Konec platnosti { $expirationDate }
sub-route-idx-updating = Probíhá aktualizace platebních údajů…
sub-route-payment-modal-heading = Neplatné platební údaje
sub-route-payment-modal-message-2 = U vašeho účtu { -brand-paypal } došlo k chybě. Je potřeba, abyste podnikli nezbytné kroky pro vyřešení problému s touto platbou.
sub-route-missing-billing-agreement-payment-alert = Neplatné platební údaje. U vašeho účtu došlo k chybě. <div>Spravovat</div>
sub-route-funding-source-payment-alert = Neplatné platební údaje. U vašeho účtu došlo k chybě. Tato chyba se může zobrazovat i nějaký čas poté, co své údaje aktualizujete. <div>Spravovat</div>

## Routes - Subscription - SubscriptionItem

sub-item-no-such-plan = Takové předplatné pro neexistuje.
invoice-not-found = Následná faktura nebyla nalezena
sub-item-no-such-subsequent-invoice = Následná faktura pro toto předplatné nebyla nalezena.
sub-invoice-preview-error-title = Náhled faktury nenalezen
sub-invoice-preview-error-text = Náhled faktury pro toto předplatné nebyl nalezen

## Routes - Subscriptions - Reactivate
## $name (String) - The name of the subscribed product.

reactivate-confirm-dialog-header = Chcete i nadále používat { $name }?
# $amount (Number) - The amount billed. It will be formatted as currency.
# $last (String) - The last 4 digits of the card that will be charged
# $endDate (Date) - Last day of product access
reactivate-confirm-copy =
    Až do konce stávajícího platebního období zůstane váš přístup a platby
    za službu { $name } beze změny. Vaše další platba ve výši { $amount }
    bude stržena z karty s číslem končícím na { $last } dne { $endDate }.
# Alternate copy used when a payment method is not available, e.g. for free trials
# $amount (Number) - The amount billed. It will be formatted as currency.
# $endDate (Date) - Last day of product access
reactivate-confirm-without-payment-method-copy =
    Až do konce stávajícího platebního období zůstane váš přístup a platby
    za službu { $name } beze změny. Vaše další platba ve výši { $amount }
    bude účtována dne { $endDate }.
reactivate-confirm-button = Obnovit předplatné

## $date (Date) - Last day of product access

reactivate-panel-copy = Přístup ke službě { $name } ztratíte <strong>{ $date }</strong>.
reactivate-success-copy = Děkujeme. Vše je nastaveno.
reactivate-success-button = Zavřít

## Routes - Subscriptions - Subscription iap item

sub-iap-item-google-purchase-2 = { -brand-google }: Nákup v aplikaci
sub-iap-item-apple-purchase-2 = { -brand-apple }: Nákup v aplikaci
sub-iap-item-manage-button = Spravovat
