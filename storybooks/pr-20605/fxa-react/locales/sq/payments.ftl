# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.


## Component - AppLayout

settings-home = Kreu i Llogarive
settings-project-header-title = { -product-mozilla-account }

## Component - CouponForm

# Title of container showing discount coupon code applied to a subscription.
coupon-promo-code-applied = U aplikua Kod Promocional
coupon-submit = Zbatoje
coupon-remove = Hiqe
coupon-error = Kodi që dhatë është i pavlefshëm, ose ka skaduar.
coupon-error-generic = Ndodhi një gabim me përpunimin e kodit. Ju lutemi, riprovoni.
coupon-error-expired = Kodi që dhatë ka skaduar.
coupon-error-limit-reached = Kodi që dhatë ka mbërritur në kufirin e vet.
coupon-error-invalid = Kodi që dhatë është i pavlefshëm.
# $couponDurationDate (Date) - The date at which the coupon is no longer valid, and the subscription is billed the list price.
coupon-enter-code =
    .placeholder = Jepni Kod

## Component - Fields

default-input-error = Kjo fushë është e domosdoshme
input-error-is-required = { $label } është i domosdoshëm

## Component - Header

brand-name-mozilla-logo = Stemë { -brand-mozilla }

## Component - NewUserEmailForm

new-user-sign-in-link-2 = Keni tashmë një { -product-mozilla-account }? <a>Bëni hyrjen</a>
# "Required" to indicate that the user must use the checkbox below this text to
# agree to a payment method's terms of service and privacy notice in order to
# continue.
new-user-enter-email =
    .label = Jepni email-in tuaj
new-user-confirm-email =
    .label = Ripohoni email-in tuaj
new-user-subscribe-product-updates-mozilla = Do të doja të merrja nga { -brand-mozilla } lajme dhe përditësime produktesh
new-user-subscribe-product-updates-snp = Do të doja të merrja nga { -brand-mozilla } lajme mbi sigurinë dhe privatësinë
new-user-subscribe-product-updates-hubs = Do të doja të merrja lajme dhe përditësime produktesh nga { -product-mozilla-hubs } dhe { -brand-mozilla }
new-user-subscribe-product-updates-mdnplus = Do të doja të merrja lajme dhe përditësime nga { -product-mdn-plus } dhe { -brand-mozilla }
new-user-subscribe-product-assurance = Email-in tuaj e përdorim vetëm për të krijuar llogarinë tuaj. S’do t’ia shesim kurrë një pale të tretë.
new-user-email-validate = Email-i s’është i vlefshëm
new-user-email-validate-confirm = Email-et nuk përputhen
new-user-already-has-account-sign-in = Keni tashmë një llogar. <a>Hyni</a>
# $domain (String) - the email domain provided by the user during sign up
new-user-invalid-email-domain = Shkruat keq email-in? { $domain } nuk ofron email.

## Component - PaymentConfirmation

payment-confirmation-thanks-heading = Faleminderit!
payment-confirmation-thanks-heading-account-exists = Faleminderit, tani kontrolloni email-in tuaj!
# $email (string) - The user's email.
# $productName (String) - The name of the subscribed product.
payment-confirmation-thanks-subheading = A confirmation email has been sent Te { $email } u dërgua një email ripohimi me udhëzime se si t’ia fillohet me { $product_name }.
# $email (string) - The user's email.
payment-confirmation-thanks-subheading-account-exists = Do të merrni një email te { $email }, me udhëzime për ujdisjen e llogarisë tuaj, si dhe me hollësitë e pagesës tuaj.
payment-confirmation-order-heading = Hollësi porosie
payment-confirmation-invoice-number = Fatura #{ $invoiceNumber }
# $invoiceDate (Date) - Start date of the latest invoice
payment-confirmation-invoice-date = { $invoiceDate }
payment-confirmation-details-heading-2 = Hollësi pagese
payment-confirmation-amount = { $amount } në { $interval }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in days.
payment-confirmation-amount-day =
    { $intervalCount ->
        [one] { $amount } në ditë
       *[other] { $amount } çdo { $intervalCount } ditë
    }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in weeks.
payment-confirmation-amount-week =
    { $intervalCount ->
        [one] { $amount } çdo  javë
       *[other] { $amount } çdo { $intervalCount } javë
    }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in months.
payment-confirmation-amount-month =
    { $intervalCount ->
        [one] { $amount } çdo  muaj
       *[other] { $amount } çdo { $intervalCount } muaj
    }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in years.
payment-confirmation-amount-year =
    { $intervalCount ->
        [one] { $amount } çdo vit
       *[other] { $amount } çdo { $intervalCount } vjet
    }
payment-confirmation-download-button = Vazhdoni te shkarkimi

## Component - PaymentConsentCheckbox

payment-confirm-with-legal-links-static-3 = E autorizoj { -brand-mozilla } të faturojë metodën time të pagesave me vlerën e treguar, sipas <termsOfServiceLink>Kushteve të Shërbimit</termsOfServiceLink> dhe <privacyNoticeLink>Shënim Privatësie</privacyNoticeLink>, deri sa ta anuloj pajtimin tim.
payment-confirm-checkbox-error = Lypset të plotësoni këtë, para se ecni më tej

## Component - PaymentErrorView

payment-error-retry-button = Riprovoni
payment-error-manage-subscription-button = Administroni pajtimet e mia

## Component - PaymentErrorView - IAP upgrade errors

# $productName (String) - The name of the subscribed product.
iap-upgrade-already-subscribed-2 = Keni tashmë një pajtim { $productName } përmes shitoreve të aplikacioneve { -brand-google } ose { -brand-apple }.
iap-upgrade-no-bundle-support = Nuk mbulojmë përmirësime për këto pajtime, por së shpejti do të mbulojmë.
iap-upgrade-contact-support = Mundeni prapë ta merrni këtë produkt — ju lutemi, lidhuni me asistencën, që të mund t’ju ndihmojmë.
iap-upgrade-get-help-button = Merrni ndihmë

## Component - PaymentForm

payment-name =
    .placeholder = Emër i Plotë
    .label = Emri siç duket në kartën tuaj
payment-cc =
    .label = Karta juaj
payment-cancel-btn = Anuloje
payment-update-btn = Përditësoje
payment-pay-btn = Paguani tani
payment-pay-with-paypal-btn-2 = Paguani me { -brand-paypal }
payment-validate-name-error = Ju lutemi, jepni emrin tuaj

## Component - PaymentLegalBlurb

payment-legal-copy-stripe-and-paypal-3 = { -brand-mozilla } përdor { -brand-name-stripe } dhe { -brand-paypal } për kryerje të siguruar të pagesave.
payment-legal-link-stripe-paypal-2 = <stripePrivacyLink>Rregulla privatësie { -brand-name-stripe }</stripePrivacyLink> &nbsp; <paypalPrivacyLink>Rregulla privatësie { -brand-paypal }</paypalPrivacyLink>
payment-legal-copy-paypal-2 = { -brand-mozilla } përdor { -brand-paypal } për kryerje të siguruar të pagesave.
payment-legal-link-paypal-3 = <paypalPrivacyLink>Rregulla privatësie { -brand-paypal }</paypalPrivacyLink>
payment-legal-copy-stripe-3 = { -brand-mozilla } përdor { -brand-name-stripe } për përpunim të sigurt të pagesave.
payment-legal-link-stripe-3 = <stripePrivacyLink>{ -brand-name-stripe } rregulla privatësie</stripePrivacyLink>

## Component - PaymentMethodHeader

payment-method-header = Zgjidhni metodën tuaj të pagesës
# This message is used to indicate the second step in a multi step process.
payment-method-header-second-step = 2. { payment-method-header }
payment-method-first-approve = Së pari, do t’ju duhet të miratoni pajtimin tuaj

## Component - PaymentProcessing

payment-processing-message = Ju lutemi, pritni, teksa përpunojmë pagesën tuaj…

## Component - PaymentProviderDetails

payment-confirmation-cc-card-ending-in = Kartë që përfundon me { $last4 }

## Component - PayPalButton

pay-with-heading-paypal-2 = Paguani me { -brand-paypal }

## Component - PlanDetails

plan-details-header = Hollësi produkti
plan-details-list-price = Çmim Liste
plan-details-show-button = Shfaq hollësi
plan-details-hide-button = Fshihi hollësitë
plan-details-total-label = Gjithsej
plan-details-tax = Taksa dhe Tarifa

## Component - PlanErrorDialog

product-no-such-plan = S’ka plan të tillë për këtë produkt.

## Price details including tax
## $priceAmount (Number) - The amount billed. It will be formatted as currency.
## $taxAmount (Number) - The tax added on, not included in amount. It will be formatted as currency.

price-details-no-tax = { $priceAmount }
price-details-tax = { $priceAmount } + { $taxAmount } taksë
# $intervalCount (Number) - The interval between payments, in days.
price-details-no-tax-day =
    { $intervalCount ->
        [one] { $priceAmount } në ditë
       *[other] { $priceAmount } çdo { $intervalCount } ditë
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } në ditë
           *[other] { $priceAmount } çdo { $intervalCount } ditë
        }
# $intervalCount (Number) - The interval between payments, in weeks.
price-details-no-tax-week =
    { $intervalCount ->
        [one] { $priceAmount } në javë
       *[other] { $priceAmount } çdo { $intervalCount } javë
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } në javë
           *[other] { $priceAmount } çdo { $intervalCount } javë
        }
# $intervalCount (Number) - The interval between payments, in months.
price-details-no-tax-month =
    { $intervalCount ->
        [one] { $priceAmount } në muaj
       *[other] { $priceAmount } çdo { $intervalCount } muaj
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } muaj
           *[other] { $priceAmount } çdo { $intervalCount } muaj
        }
# $intervalCount (Number) - The interval between payments, in years.
price-details-no-tax-year =
    { $intervalCount ->
        [one] { $priceAmount } në vit
       *[other] { $priceAmount } çdo { $intervalCount } vjet
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } në vit
           *[other] { $priceAmount } çdo { $intervalCount } vjet
        }
# $intervalCount (Number) - The interval between payments, in days.
price-details-tax-day =
    { $intervalCount ->
        [one] { $priceAmount } + { $taxAmount } taksë ditore
       *[other] { $priceAmount } + { $taxAmount } taksë çdo { $intervalCount } ditë
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + { $taxAmount } taksë ditore
           *[other] { $priceAmount } + { $taxAmount } taksë çdo { $intervalCount } ditë
        }
# $intervalCount (Number) - The interval between payments, in weeks.
price-details-tax-week =
    { $intervalCount ->
        [one] { $priceAmount } + { $taxAmount } taksë javore
       *[other] { $priceAmount } + { $taxAmount } taksë çdo { $intervalCount } javë
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + { $taxAmount } taksë javore
           *[other] { $priceAmount } + { $taxAmount } taksë çdo { $intervalCount } javë
        }
# $intervalCount (Number) - The interval between payments, in months.
price-details-tax-month =
    { $intervalCount ->
        [one] { $priceAmount } + { $taxAmount } taksë mujore
       *[other] { $priceAmount } + { $taxAmount } taksë çdo { $intervalCount } muaj
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + { $taxAmount } taksë mujore
           *[other] { $priceAmount } + { $taxAmount } taksë çdo { $intervalCount } muaj
        }
# $intervalCount (Number) - The interval between payments, in years.
price-details-tax-year =
    { $intervalCount ->
        [one] { $priceAmount } + { $taxAmount } taksë vjetore
       *[other] { $priceAmount } + { $taxAmount } taksë çdo { $intervalCount } vjet
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + { $taxAmount } taksë vjetore
           *[other] { $priceAmount } + { $taxAmount } taksë çdo { $intervalCount } vjet
        }

## Component - SubscriptionTitle

subscription-create-title = Ujdisje e pajtimit tim
subscription-success-title = Ripohim pajtimi
subscription-processing-title = Po ripohohet pajtimi…
subscription-error-title = Gabim në ripohim pajtimi…
subscription-noplanchange-title = Ky ndryshim plani pajtimi nuk mbulohet
subscription-iapsubscribed-title = I pajtuar tashmë
sub-guarantee = 30 ditë garanci kthimi parash

## Component - TermsAndPrivacy

# "Mozilla Accounts" is capitalized in this instance for title case in English
# This heading is followed by links to Terms of Service and Privacy Notice
subplat-mozilla-accounts-legal-heading = { -product-mozilla-accounts(capitalization: "uppercase") }
terms = Kushte Shërbimi
privacy = Shënim Mbi Privatësinë
terms-download = Kushte Shkarkimi

## App-level string(s) and messages shared by multiple components or routes

document =
    .title = Llogari Firefox
# General aria-label for closing modals
close-aria =
    .aria-label = Mbylle dritaren modale
settings-subscriptions-title = Pajtime
# Title of container where a user can input a coupon code to get a discount on a subscription.
coupon-promo-code = Kod Promocional

## Subscription upgrade plan details - shared by multiple components, including plan details and payment form
## $amount (Number) - The amount billed. It will be formatted as currency.

# $intervalCount (Number) - The interval between payments, in days.
plan-price-interval-day =
    { $intervalCount ->
        [one] { $amount } në ditë
       *[other] { $amount } çdo { $intervalCount } ditë
    }
    .title =
        { $intervalCount ->
            [one] { $amount } në ditë
           *[other] { $amount } çdo { $intervalCount } ditë
        }
# $intervalCount (Number) - The interval between payments, in weeks.
plan-price-interval-week =
    { $intervalCount ->
        [one] { $amount } në javë
       *[other] { $amount } çdo { $intervalCount } javë
    }
    .title =
        { $intervalCount ->
            [one] { $amount } në javë
           *[other] { $amount } çdo { $intervalCount } javë
        }
# $intervalCount (Number) - The interval between payments, in months.
plan-price-interval-month =
    { $intervalCount ->
        [one] { $amount } në muaj
       *[other] { $amount } çdo { $intervalCount } muaj
    }
    .title =
        { $intervalCount ->
            [one] { $amount } monthly
           *[other] { $amount } çdo { $intervalCount } muaj
        }
# $intervalCount (Number) - The interval between payments, in years.
plan-price-interval-year =
    { $intervalCount ->
        [one] { $amount } në vit
       *[other] { $amount } çdo { $intervalCount } vjet
    }
    .title =
        { $intervalCount ->
            [one] { $amount } në vit
           *[other] { $amount } çdo { $intervalCount } vjet
        }

## Error messages

# App error dialog
general-error-heading = Gabim i përgjithshëm aplikacioni
basic-error-message = Diç shkoi ters. Ju lutemi, riprovoni.
payment-error-1 = Hëm. Pati një problem me autorizimin e pagesës tuaj. Riprovoni ose lidhuni me emetuesin e kartës tuaj.
payment-error-2 = Hëm. Pati një problem me autorizimin e pagesës tuaj. Lidhuni me emetuesin e kartës tuaj.
payment-error-3b = Ndodhi një gabim i papritur teksa përpunohej pagesa juaj, ju lutemi, riprovoni.
expired-card-error = Duket sikur karta juaj e kreditit të ketë skaduar. Provoni një kartë tjetër.
insufficient-funds-error = Duket sikur karta juaj e kreditit ka kredit të pamjaftueshëm. Provoni një kartë tjetër.
withdrawal-count-limit-exceeded-error = Duket sikur ky transaksion do t’ju kalojë tej kufirit tuaj për kredit. Provoni një kartë tjetër.
charge-exceeds-source-limit = Duket sikur ky transaksion do t’ju kalojë tej kufirit tuaj për kredit. Provoni një kartë tjetër ose riprovoni pas 24 orësh.
instant-payouts-unsupported = Duket sikur karta juaj e debitit s’është ujdisur për pagesa të atypëratyshme. Provoni një tjetër kartë debiti ose krediti.
duplicate-transaction = Hëm. Duket sikur sapo u dërgua një transaksion identik. Kontrolloni historikun tuaj të pagesave.
coupon-expired = Duket sikur ai kod promocional të ketë skaduar.
card-error = Transaksioni juaj s’u krye dot. Ju lutemi, verifikoni të dhënat e kartës tuaj të kreditit dhe riprovoni.
country-currency-mismatch = Monedha e këtij pajtimi s’është e vlefshme për vendin e përshoqëruar me pagesën tuaj.
currency-currency-mismatch = Na ndjeni. S’mund të kaloni nga një monedhë në tjetër.
location-unsupported = Sipas Kushteve tona të Shërbimit, vendndodhja juaj nuk mbulohet.
no-subscription-change = Na ndjeni. S’mund të ndryshoni planin tuaj të pajtimit.
# $mobileAppStore (String) - "Google Play Store" or "App Store", localized when the translation is available.
iap-already-subscribed = Jeni tashmë i pajtuar përmes { $mobileAppStore }.
# $productName (String) - The name of the subscribed product.
fxa-account-signup-error-2 = Një gabim sistemi shkaktoi dështimin e regjistrimit tuaj për { $productName }. Nuk ju është faturuar gjë. Ju lutemi, riprovoni.
fxa-post-passwordless-sub-error = Pajtimi u ripohua, por faqja e ripohimit s’arriti të ngarkohej. Që të ujdisni llogarinë tuaj, ju lutemi, shihni te email-et tuaj.
newsletter-signup-error = S’jeni pajtuar për email-e përditësimesh produktesh. Mund të riprovoni që nga rregullimet e llogarisë tuaj.
product-plan-error =
    .title = Problem në ngarkim planesh
product-profile-error =
    .title = Problem në ngarkim profili
product-customer-error =
    .title = Problem në ngarkim klienti
product-plan-not-found = S’u gjet plan
product-location-unsupported-error = Vendndodhje që s’mbulohet

## Hooks - coupons

coupon-success = Plani juaj do të rinovohet vetvetiu me çmimin e treguar te lista.
# $couponDurationDate (Date) - The date at which the coupon is no longer valid, and the subscription is billed the list price.
coupon-success-repeating = Plani juaj do të rinovohet vetvetiu pas { $couponDurationDate } sipas çmimit të rregullt.

## Routes - Checkout - New user

new-user-step-1-2 = 1. Krijoni një { -product-mozilla-account }
new-user-card-title = Jepni hollësitë e kartës tuaj
new-user-submit = Pajtohuni Tani

## Routes - Product and Subscriptions

sub-update-payment-title = Të dhëna pagese

## Routes - Product/AcceptedCards
## Used in both Routes - Checkout and Product/SubscriptionCreate

pay-with-heading-card-only = Paguani me kartë
product-invoice-preview-error-title = Problem me ngarkim paraparjeje fature
product-invoice-preview-error-text = S’u ngarkua dot paraparje faturash

## Routes - Product - IapRoadblock

subscription-iaperrorupgrade-title = S’ju përmirësojmë dot ende

# The following are not terms because they are not used directly in messages,
# but rather looked up in code and passed into the message as variables.

brand-name-google-play-2 = Shitore { -google-play }
brand-name-apple-app-store-2 = { -app-store }

## Routes - Product - Subscription upgrade

product-plan-change-heading = Shqyrtoni ndryshimin tuaj
sub-change-failed = Ndryshimi i planit dështoi
sub-update-acknowledgment =
    Plani juaj do të ndryshojë menjëherë dhe do t’ju faturohet sot vlera e
    cila i takon pjesës së mbetur e këtij cikli faturimi. Duke filluar nga
    { $startingDate } do t’ju faturohet vlera e plotë.
sub-change-submit = Ripohoni ndryshimin
sub-update-current-plan-label = Plani i tanishëm
sub-update-new-plan-label = Plan i ri
sub-update-total-label = Shumë e re

## Checkout line item for subscription plan change listing the product name and frequency of payment
## For example, a Mozilla VPN subscription charged monthly would appear as: Mozilla VPN (Monthly)
## Variables:
##   $productName (String) - Name of the upgraded product (e.g. Mozilla VPN)

sub-update-new-plan-daily = { $productName } (E përditshme)
sub-update-new-plan-weekly = { $productName } (E përjavshme)
sub-update-new-plan-monthly = { $productName } (E përmuajshme)
sub-update-new-plan-yearly = { $productName } (E përvitshme)
sub-update-prorated-upgrade-credit = Balanca negative e treguar do të aplikohet si kredit te llogaria juaj dhe përdoret për fatura të ardhshme.

## Routes - Subscriptions - Cancel

sub-item-cancel-sub = Anulojeni Pajtimin
sub-item-stay-sub = Qëndroni i Pajtuar

## $name (String) - The name of the subscribed product.
## $period (Date) - The last day of product access

sub-item-cancel-msg = Pas { $period }, dita e fundit e ciklit tuaj të faturimit, s’do të jeni në gjendje të përdorni { $name }.
sub-item-cancel-confirm = Më { $period }, anuloni hyrjen time dhe të dhëna të miat të ruajtura brenda { $name }
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
sub-promo-coupon-applied = Kuponi { $promotion_name } u aplikua: <priceDetails></priceDetails>
subscription-management-account-credit-balance = Kjo pagesë pajtimit dha një kredit te balanca e llogarisë tuaj: <priceDetails></priceDetails>

## Routes - Subscription

sub-route-idx-reactivating = Riaktivizimi i pajtimit dështoi
sub-route-idx-cancel-failed = Anulimi i pajtimit dështoi
sub-route-idx-contact = Lidhuni Me Asistencën
sub-route-idx-cancel-msg-title = Na vjen keq t’ju shohim të largoheni
# $name (String) - The name of the subscribed product.
# $date (Date) - Last day of product access
sub-route-idx-cancel-msg =
    Pajtimi juaj në { $name } është anuluar.
          <br />
         Do të mund të përdorni ende { $name } deri më { $date }.
sub-route-idx-cancel-aside-2 = Keni pyetje? Vizitoni <a>Asistencën e { -brand-mozilla }-s</a>.

## Routes - Subscriptions - Errors

sub-customer-error =
    .title = Problem në ngarkim klienti
sub-invoice-error =
    .title = Problem në ngarkim faturash
sub-billing-update-success = Të dhënat tuaja të faturimit u përditësuan me sukses
sub-invoice-previews-error-title = Problem në ngarkim paraparjesh faturash
sub-invoice-previews-error-text = S’u ngarkuan dot paraparje faturash

## Routes - Subscription - ActionButton

pay-update-change-btn = Ndryshoje
pay-update-manage-btn = Administrojini

## Routes - Subscriptions - Cancel and IapItem
## $priceAmount (Number) - The amount billed. It will be formatted as currency.
## $taxAmount (Number) - The tax added on, not included in amount. It will be formatted as currency.
## $date (Date) - The date for the next time a charge will occur.

sub-next-bill = Faturimi i ardhshëm më { $date }
sub-next-bill-due-date = Faturimi i ardhshëm skadon më { $date }
sub-expires-on = Skadon më { $date }

## Routes - Subscription - PaymentUpdate


# $expirationDate (Date) - The payment card's expiration date.

pay-update-card-exp = Skadon më { $expirationDate }
sub-route-idx-updating = Po përditësohen të dhëna faturimi…
sub-route-payment-modal-heading = Të dhëna faturimi të pavlefshme
sub-route-payment-modal-message-2 = Duket të ketë një gabim me llogarinë tuaj { -brand-paypal }, lypset të ndërmerrni hapat e nevojshëm për të zgjidhur këtë problem pagese.
sub-route-missing-billing-agreement-payment-alert = Hollësi të pavlefshme pagese; ka një gabim me llogarinë tuaj. <div>Shiheni</div>
sub-route-funding-source-payment-alert = Hollësi të pavlefshme pagese; ka një gabim me llogarinë tuaj. Mund të duhet ca kohë që të hiqet ky sinjalizim, pasi të përditësoni me sukses hollësitë tuaja. <div>Shiheni</div>

## Routes - Subscription - SubscriptionItem

sub-item-no-such-plan = S’ka plan të tillë për këtë pajtim.
invoice-not-found = S’u gjet fatura pasuese
sub-item-no-such-subsequent-invoice = S’u gjet fatura pasuese për këtë pajtim.
sub-invoice-preview-error-title = S’u gjet paraparje fature
sub-invoice-preview-error-text = S’u gjet paraparje fature për këtë pajtim

## Routes - Subscriptions - Reactivate
## $name (String) - The name of the subscribed product.

reactivate-confirm-dialog-header = Doni të vazhdoni të përdorni { $name }?
# $amount (Number) - The amount billed. It will be formatted as currency.
# $last (String) - The last 4 digits of the card that will be charged
# $endDate (Date) - Last day of product access
reactivate-confirm-copy =
    Përdorimi juaj i { $name } do të vazhdojë, dhe cikli juaj i faturimit dhe pagesa do të mbeten të njëjtët. Faturimi juaj pasues do të jetë
    { $amount } te karta që përfundon me { $last } më { $endDate }.
# Alternate copy used when a payment method is not available, e.g. for free trials
# $amount (Number) - The amount billed. It will be formatted as currency.
# $endDate (Date) - Last day of product access
reactivate-confirm-without-payment-method-copy =
    Përdorimi juaj i { $name } do të vazhdojë, dhe cikli juaj i faturimit dhe pagesa do të mbeten të njëjtët. Faturimi juaj pasues do të jetë
    { $amount } më { $endDate }.
reactivate-confirm-button = Ripajtohuni

## $date (Date) - Last day of product access

reactivate-panel-copy = Do të humbni mundësinë e përdorimit të { $name } më <strong>{ $date }</strong>.
reactivate-success-copy = Faleminderit! Gjithçka gati.
reactivate-success-button = Mbylle

## Routes - Subscriptions - Subscription iap item

sub-iap-item-google-purchase-2 = { -brand-google }: Blerje që nga aplikacioni
sub-iap-item-apple-purchase-2 = { -brand-apple }: Blerje që nga aplikacioni
sub-iap-item-manage-button = Administrojini
