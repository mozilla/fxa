# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.


## Component - AppLayout

settings-home = Mba’ete Ñepyrũgua
settings-project-header-title = { -product-mozilla-account }

## Component - CouponForm

# Title of container showing discount coupon code applied to a subscription.
coupon-promo-code-applied = Ayvu ñemoherakuãgua japopyre
coupon-submit = Jejapopy
coupon-remove = Mboguete
coupon-error = Pe ayvu emoĩva ndoikói térã hi’arapaháma.
coupon-error-generic = Oiko jejavy emomba’apóvo ayvu. Ikatúiko eha’ã jey ag̃ave.
coupon-error-expired = Pe ayvu emoingéva ndoikovéima.
coupon-error-limit-reached = Pe ayvu emoingéva og̃uahẽma hu’ãme.
coupon-error-invalid = Pe ayvu emoingéva ndoikovéima.
# $couponDurationDate (Date) - The date at which the coupon is no longer valid, and the subscription is billed the list price.
coupon-enter-code =
    .placeholder = Emoinge ayvu

## Component - Fields

default-input-error = Ko korápe ahaiva’erã
input-error-is-required = Oñeikotevẽ { $label }

## Component - Header

brand-name-mozilla-logo = { -brand-mozilla } ra’ãnga’i

## Component - NewUserEmailForm

new-user-sign-in-link-2 = Erekómapa { -product-mozilla-account }? <a>Eñepyrũ tembiapo</a>
# "Required" to indicate that the user must use the checkbox below this text to
# agree to a payment method's terms of service and privacy notice in order to
# continue.
new-user-enter-email =
    .label = Ehai ne ñanduti veve
new-user-confirm-email =
    .label = Emoneĩjey ne ñanduti veve
new-user-subscribe-product-updates-mozilla = Hi’ã og̃uahẽ marandu ha ñembohekopyahu { -brand-mozilla } apopyre rehegua
new-user-subscribe-product-updates-snp = Hi’ã og̃uahẽ marandu ha ñembohekopyahu { -brand-mozilla } guive tekorosã rehegua
new-user-subscribe-product-updates-hubs = Hi’ã og̃uahẽ marandu ha ñembohekopyahu { -product-mozilla-hubs } ha { -brand-mozilla } apopyre rehegua
new-user-subscribe-product-updates-mdnplus = Hi’ã og̃uahẽ marandu ha ñembohekopyahu { -product-mdn-plus } ha { -brand-mozilla } apopyre rehegua
new-user-subscribe-product-assurance = Roiporu ne ñanduti veve romoheñói hag̃ua mba’ete añónte. Araka’eve norome’ẽmo’ãi ambuépe.
new-user-email-validate = Ne ñanduti veve ndoikói
new-user-email-validate-confirm = Ñanduti vevekuéra ndojokupytýi
new-user-already-has-account-sign-in = Erekóma ne mba’ete. <a>Eñepyrũ tembiapo</a>
# $domain (String) - the email domain provided by the user during sign up
new-user-invalid-email-domain = ¿Ñandutiveve ojehaivai? { $domain } noikuave’ẽi ñanduti veve.

## Component - PaymentConfirmation

payment-confirmation-thanks-heading = ¡Aguyje!
payment-confirmation-thanks-heading-account-exists = ¡Aguyje, ko’ág̃a ehecha ne ñanduti veve!
# $email (string) - The user's email.
# $productName (String) - The name of the subscribed product.
payment-confirmation-thanks-subheading = Oñemondo ñanduti veve ñemoneĩ rehegua { $email }-pe oje’ehápe mba’éichapa ojeporúta { $product_name }.
# $email (string) - The user's email.
payment-confirmation-thanks-subheading-account-exists = Og̃uahẽta ndéve ñandutiveve { $email } rupive embohekokuaahápe ne mba’ete, avei mba’eichaitépa ehepyme’ẽta.
payment-confirmation-order-heading = Mba’emimi jerurepyre
payment-confirmation-invoice-number = Kuatiañemungue papapy { $invoiceNumber }
# $invoiceDate (Date) - Start date of the latest invoice
payment-confirmation-invoice-date = { $invoiceDate }
payment-confirmation-details-heading-2 = Jehepyme’ẽrã marandu
payment-confirmation-amount = { $amount } { $interval } rehe
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in days.
payment-confirmation-amount-day =
    { $intervalCount ->
        [one] { $amount } aragua
       *[other] { $amount } peteĩ { $intervalCount } aragua
    }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in weeks.
payment-confirmation-amount-week =
    { $intervalCount ->
        [one] { $amount } arapokõindygua
       *[other] { $amount } peteĩ { $intervalCount } arapokõindygua
    }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in months.
payment-confirmation-amount-month =
    { $intervalCount ->
        [one] { $amount } jasygua
       *[other] { $amount } peteĩ { $intervalCount } jasygua
    }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in years.
payment-confirmation-amount-year =
    { $intervalCount ->
        [one] { $amount } arygua
       *[other] { $amount } peteĩ { $intervalCount } arygua
    }
payment-confirmation-download-button = Emboguejy ehóvo

## Component - PaymentConsentCheckbox

payment-confirm-with-legal-links-static-3 = Amoneĩ { -brand-mozilla }-pe, tomyanyhẽ ahepyme’ẽhápe he’iháicha <termsOfServiceLink>mba’epytyvõrã ñemboguata</termsOfServiceLink> ha <privacyNoticeLink>Ñemigua marandu’i</privacyNoticeLink>, aheja peve che ñemboheraguapy.
payment-confirm-checkbox-error = Emyanyhẽraẽ kóva eku’ejey mboyve

## Component - PaymentErrorView

payment-error-retry-button = Eha’ã jey
payment-error-manage-subscription-button = Ñemboheraguapy jeipota

## Component - PaymentErrorView - IAP upgrade errors

# $productName (String) - The name of the subscribed product.
iap-upgrade-already-subscribed-2 = Eñemboheraguapýma { $productName } tembiporu’i ñemuha rupive { -brand-google } térã { -brand-apple }.
iap-upgrade-no-bundle-support = Noromoneĩri ñembohekopyahu ko’ã ñemoheraguapýpe, hákatu vokóinte rojapóta.
iap-upgrade-contact-support = Erekokuaa gueteri ko apopyre — eñe’ẽmi pytyvõha aty ndive roipytyvõkuaa hag̃ua.
iap-upgrade-get-help-button = Eipota pytyvõ

## Component - PaymentForm

payment-name =
    .placeholder = Téra ha terajuapy
    .label = Nde réra oĩháicha nde kuatia’atãme
payment-cc =
    .label = Nde kuatia’atã
payment-cancel-btn = Heja
payment-update-btn = Mbohekopyahu
payment-pay-btn = Ehepyme’ẽ ko’ág̃a
payment-pay-with-paypal-btn-2 = Ehepyme’ẽ { -brand-paypal } ndive
payment-validate-name-error = Emoinge nde réra

## Component - PaymentLegalBlurb

payment-legal-copy-stripe-and-paypal-3 = { -brand-mozilla } oiporu { -brand-name-stripe } ha { -brand-paypal } ojehepyme’ẽ hag̃ua tekorosãme.
payment-legal-link-stripe-paypal-2 = <stripePrivacyLink>{ -brand-name-stripe } Ñemigua porureko</stripePrivacyLink> &nbsp; <paypalPrivacyLink>{ -brand-paypal } ñemigua porureko</paypalPrivacyLink>
payment-legal-copy-paypal-2 = { -brand-mozilla } oiporu { -brand-paypal } ojehepyme’ẽ hag̃ua tekorosãme.
payment-legal-link-paypal-3 = <paypalPrivacyLink>{ -brand-paypal } ñemigua porureko</paypalPrivacyLink>
payment-legal-copy-stripe-3 = { -brand-mozilla } oiporu { -brand-name-stripe } ojehepyme’ẽ hag̃ua tekorosãme.
payment-legal-link-stripe-3 = <stripePrivacyLink>{ -brand-name-stripe } ñemigua porureko</stripePrivacyLink>.

## Component - PaymentMethodHeader

payment-method-header = Eiporavo mba’éichapa ehepyme’ẽta
# This message is used to indicate the second step in a multi step process.
payment-method-header-second-step = 2. { payment-method-header }
payment-method-first-approve = Emoneĩraẽva’erã ne ñemboheraguapy

## Component - PaymentProcessing

payment-processing-message = Ikatúiko eha’ãrõ romongu’e aja ne jehepyme’ẽ…

## Component - PaymentProviderDetails

payment-confirmation-cc-card-ending-in = Kuatia’atã opáva { $last4 }-pe

## Component - PayPalButton

pay-with-heading-paypal-2 = Ehepyme’ẽ { -brand-paypal } ndive

## Component - PlanDetails

plan-details-header = Apopyre mba’emimi
plan-details-list-price = Tysýi repy
plan-details-show-button = Mba’emimi jehechauka
plan-details-hide-button = Mba’emimi mokañy
plan-details-total-label = Opavavete
plan-details-tax = Impuesto ha tása

## Component - PlanErrorDialog

product-no-such-plan = Ndaipóri tembiaporã ko apopyrépe g̃uarã

## Price details including tax
## $priceAmount (Number) - The amount billed. It will be formatted as currency.
## $taxAmount (Number) - The tax added on, not included in amount. It will be formatted as currency.

price-details-no-tax = { $priceAmount }
price-details-tax = { $priceAmount } + jehepyme’ẽ { $taxAmount }
# $intervalCount (Number) - The interval between payments, in days.
price-details-no-tax-day =
    { $intervalCount ->
        [one] { $priceAmount } peteĩ árape
       *[other] { $priceAmount } opa { $intervalCount } árape
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } peteĩ árape
           *[other] { $priceAmount } opa { $intervalCount } árape
        }
# $intervalCount (Number) - The interval between payments, in weeks.
price-details-no-tax-week =
    { $intervalCount ->
        [one] { $priceAmount } arapokõindýpe
       *[other] { $priceAmount } opa { $intervalCount } arapokõindýpe
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } arapokõindýpe
           *[other] { $priceAmount } opa { $intervalCount } arapokõindýpe
        }
# $intervalCount (Number) - The interval between payments, in months.
price-details-no-tax-month =
    { $intervalCount ->
        [one] { $priceAmount } jasýpe
       *[other] { $priceAmount } opa { $intervalCount } jasýpe
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } jasýpe
           *[other] { $priceAmount } opa { $intervalCount } jasýpe
        }
# $intervalCount (Number) - The interval between payments, in years.
price-details-no-tax-year =
    { $intervalCount ->
        [one] { $priceAmount } arýpe
       *[other] { $priceAmount } opa { $intervalCount } arýpe
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } arýpe
           *[other] { $priceAmount } opa { $intervalCount } arýpe
        }
# $intervalCount (Number) - The interval between payments, in days.
price-details-tax-day =
    { $intervalCount ->
        [one] { $priceAmount } + { $taxAmount } jehepyme’ẽ aragua
       *[other] { $priceAmount } + { $taxAmount }  jehepyme’ẽ aragua { $intervalCount } árape
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + { $taxAmount } jehepyme’ẽ aragua
           *[other] { $priceAmount } + { $taxAmount }  jehepyme’ẽ aragua { $intervalCount } árape
        }
# $intervalCount (Number) - The interval between payments, in weeks.
price-details-tax-week =
    { $intervalCount ->
        [one] { $priceAmount } + { $taxAmount } jejepyme’ẽ arapokindygua
       *[other] { $priceAmount } + { $taxAmount } ñavo jejepyme’ẽ { $intervalCount } arapokõindýpe
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + { $taxAmount } jejepyme’ẽ arapokindygua
           *[other] { $priceAmount } + { $taxAmount } ñavo jejepyme’ẽ { $intervalCount } arapokõindýpe
        }
# $intervalCount (Number) - The interval between payments, in months.
price-details-tax-month =
    { $intervalCount ->
        [one] { $priceAmount } + { $taxAmount } jehepyme’ẽ jasygua
       *[other] { $priceAmount } + { $taxAmount } ñavo jehepyme’ẽ { $intervalCount } jasýpe
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + { $taxAmount } jehepyme’ẽ jasygua
           *[other] { $priceAmount } + { $taxAmount } ñavo jehepyme’ẽ { $intervalCount } jasýpe
        }
# $intervalCount (Number) - The interval between payments, in years.
price-details-tax-year =
    { $intervalCount ->
        [one] { $priceAmount } + { $taxAmount } jehepyme’ẽ arygua
       *[other] { $priceAmount } + { $taxAmount } ñavo jehepyme’ẽ { $intervalCount } arýpe
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + { $taxAmount } jehepyme’ẽ arygua
           *[other] { $priceAmount } + { $taxAmount } ñavo jehepyme’ẽ { $intervalCount } arýpe
        }

## Component - SubscriptionTitle

subscription-create-title = Ñemboheraguapy ñemboheko
subscription-success-title = Ñemboheraguapy ñemoneĩ
subscription-processing-title = Ñemboheraguapy oñemoneĩhína…
subscription-error-title = Ojavy oñemoneĩvo ñemboheraguapy…
subscription-noplanchange-title = Ko ñemoambue rape ñemboheraguapygua noñepytyvõi
subscription-iapsubscribed-title = Eñemboheraguapýma
sub-guarantee = 30 ára haguépe ome’ẽkuaajey viru

## Component - TermsAndPrivacy

# "Mozilla Accounts" is capitalized in this instance for title case in English
# This heading is followed by links to Terms of Service and Privacy Notice
subplat-mozilla-accounts-legal-heading = { -product-mozilla-accounts(capitalization: "uppercase") }
terms = Mba’epytyvõrã ñemboguata
privacy = Marandu’i ñemiguáva
terms-download = Emboguejy ñemboguatarã

## App-level string(s) and messages shared by multiple components or routes

document =
    .title = Firefox Accounts
# General aria-label for closing modals
close-aria =
    .aria-label = Emboty modal
settings-subscriptions-title = Mboheraguapy
# Title of container where a user can input a coupon code to get a discount on a subscription.
coupon-promo-code = Ayvu ñemoherakuãgua

## Subscription upgrade plan details - shared by multiple components, including plan details and payment form
## $amount (Number) - The amount billed. It will be formatted as currency.

# $intervalCount (Number) - The interval between payments, in days.
plan-price-interval-day =
    { $intervalCount ->
        [one] { $amount } aragua
       *[other] { $amount } opa { $intervalCount } árape
    }
    .title =
        { $intervalCount ->
            [one] { $amount } aragua
           *[other] { $amount } opa { $intervalCount } árape
        }
# $intervalCount (Number) - The interval between payments, in weeks.
plan-price-interval-week =
    { $intervalCount ->
        [one] { $amount } arapokõindýpe
       *[other] { $amount } opa { $intervalCount } arapokõindy
    }
    .title =
        { $intervalCount ->
            [one] { $amount } arapokõindýpe
           *[other] { $amount } opa { $intervalCount } arapokõindy
        }
# $intervalCount (Number) - The interval between payments, in months.
plan-price-interval-month =
    { $intervalCount ->
        [one] { $amount } jasygua
       *[other] { $amount } opa { $intervalCount } jasýpe
    }
    .title =
        { $intervalCount ->
            [one] { $amount } jasygua
           *[other] { $amount } opa { $intervalCount } jasýpe
        }
# $intervalCount (Number) - The interval between payments, in years.
plan-price-interval-year =
    { $intervalCount ->
        [one] { $amount } arygua
       *[other] { $amount } opa { $intervalCount } ary
    }
    .title =
        { $intervalCount ->
            [one] { $amount } arygua
           *[other] { $amount } opa { $intervalCount } ary
        }

## Error messages

# App error dialog
general-error-heading = Tembiporu’i jejavypaite
basic-error-message = Oĩ osẽvaíva. Ikatúpiko eha’ã jey ag̃amieve.
payment-error-1 = Épa. Oĩ apañuái ehepyme’ẽnguévo. Eha’ã jey térã eñe’ẽ pya’eterei nde kuatia’atã me’ẽha ndive.
payment-error-2 = Épa. Oĩ apañuái ehepyme’ẽnguévo. Eñe’ẽ pya’éke nde kuatia’atã meẽha ndive.
payment-error-3b = Oiko peteĩ jejavy eha’ãrõ’ỹva ehepyme’ẽnguévo. Eha’ã jey uperire.
expired-card-error = Nde kuatia’atã ñemurã ndoikovéima. Eiporu ambue kuatia’atã.
insufficient-funds-error = Nde kuatia’atã ñemurã ndaiviruvéima. Eiporu ambue kuatia’atã.
withdrawal-count-limit-exceeded-error = Ko ne ñemungue ohasáma pe viru eguerekóvape. Eiporu ambue kuatia’atã.
charge-exceeds-source-limit = Ko ne ñemungue ohasáma pe viru peteĩ aragua eguerekóvape. Eiporu ambue kuatia’atã térã ohasa rire 24 aravo.
instant-payouts-unsupported = Nde kuatia’atã viruñongatuha ndahekói jehepyme’ẽrãicha. Eiporu kuatia’atã viruñongatuha térã ñemurãva.
duplicate-transaction = Épa. Oñemondoramoite peteĩ mba’e ojueheguaitéva. Ehecha ne ñehepyme’ẽ rembiasakue.
coupon-expired = Pe ayvu jekuaaukarã ndoikovéima.
card-error = Pe jejogua noñemoneĩjepéi. Ehechajey pe marandu kuatia’atã ñemurã rehegua ha eha’ã jey uperire.
country-currency-mismatch = Pe viru ko ñemboheraguapy pegua ndoikói pe tetã ehepyme’ẽseha peguápe.
currency-currency-mismatch = Rombyasy. Ndakatúi emoambue virukuéra pa’ũme.
location-unsupported = Ne rendatee ag̃agua noñemoneĩri he’iháicha ore Remiñemi Porureko.
no-subscription-change = Rombyasy. Neremoambuekuaái ñemboheraguapy rape.
# $mobileAppStore (String) - "Google Play Store" or "App Store", localized when the translation is available.
iap-already-subscribed = Eñemboheraguapýma { $mobileAppStore } rupive.
# $productName (String) - The name of the subscribed product.
fxa-account-signup-error-2 = Peteĩ apopyvusu ndoikóiva ojavyka { $productName } jehaipy. Mba’éichapa ehepyme’ẽta nahenyhẽiramo gueteri. Eha’ã ag̃ave.
fxa-post-passwordless-sub-error = Mboheraguapy moneĩmbyre, hákatu kuatiarogue ñemoneĩ nahenyhẽkuaái. Ehecha ne ñanduti veve emboheko hag̃ua ne mba’ete.
newsletter-signup-error = Nereiméi ñanduti veve apopyre ñembohekopyahúpe g̃uarã. Eha’ã jey ag̃ave ne mba’ete ñembohekópe.
product-plan-error =
    .title = Apañuái emyanyhẽvo tembiaporã
product-profile-error =
    .title = Apañuái emyanyhẽvo mba’etee
product-customer-error =
    .title = Apañuái emyanyhẽvo ñemuhára
product-plan-not-found = Ndojejuhúi tembiaporã
product-location-unsupported-error = Tendatee oñepytyvõ’ỹva

## Hooks - coupons

coupon-success = Ne rembiaporã ipyahúta ijehegui tysýi repýpe.
# $couponDurationDate (Date) - The date at which the coupon is no longer valid, and the subscription is billed the list price.
coupon-success-repeating = Nde porupy hekopyahúta ijehegui { $couponDurationDate } rire tepy tysyiguávape.

## Routes - Checkout - New user

new-user-step-1-2 = 1. Emoheñói { -product-mozilla-account }
new-user-card-title = Emoinge marandu kuatia’atã rehegua
new-user-submit = Eñemboheraguapy Ko’ág̃a

## Routes - Product and Subscriptions

sub-update-payment-title = Jehepyme’ẽ marandu

## Routes - Product/AcceptedCards
## Used in both Routes - Checkout and Product/SubscriptionCreate

pay-with-heading-card-only = Ehepyme’ẽ kuatia’atãme
product-invoice-preview-error-title = Apañuái emyanyhẽvo kuatiañemure jehecha ypy
product-invoice-preview-error-text = Ndaikatúi oñemyanyhẽ kuatiañemure jehecha ypy

## Routes - Product - IapRoadblock

subscription-iaperrorupgrade-title = Norombohekopyahukuaái gueteri

# The following are not terms because they are not used directly in messages,
# but rather looked up in code and passed into the message as variables.

brand-name-google-play-2 = { -google-play } Store
brand-name-apple-app-store-2 = { -app-store }

## Routes - Product - Subscription upgrade

product-plan-change-heading = Ehecha ne moambuekue
sub-change-failed = Ojavy ne moambue raperã
sub-update-acknowledgment =
    Pe tembiaporape iñambuéta ha ojehepyme’ẽta ndahetái
    ojokupytýva umi jehepyme’ẽ oútava rehe. { $startingDate }
    guive ojehepyme’ẽmbaitéta hepytaháicha tenondeve gotyo.
sub-change-submit = Emoneĩ moambue
sub-update-current-plan-label = Ag̃agua tembiaporã
sub-update-new-plan-label = Tembiaporã pyahu
sub-update-total-label = Ipyahupaite
sub-update-prorated-upgrade = Mbohekopyahu mboja’opyre

## Checkout line item for subscription plan change listing the product name and frequency of payment
## For example, a Mozilla VPN subscription charged monthly would appear as: Mozilla VPN (Monthly)
## Variables:
##   $productName (String) - Name of the upgraded product (e.g. Mozilla VPN)

sub-update-new-plan-daily = { $productName } (Aragua)
sub-update-new-plan-weekly = { $productName } (Arapokõindygua)
sub-update-new-plan-monthly = { $productName } (Jasygua)
sub-update-new-plan-yearly = { $productName } (Arygua)
sub-update-prorated-upgrade-credit = Oimeraẽ mba’e vai oikóva ojehúta crédito-ramo ne mba’etépe ha ojeporúta kuatia ñemure og̃uahẽtavape.

## Routes - Subscriptions - Cancel

sub-item-cancel-sub = Mboheraguapy jeheja
sub-item-stay-sub = Mboheraguapy guereko

## $name (String) - The name of the subscribed product.
## $period (Date) - The last day of product access

sub-item-cancel-msg =
    Ndojeporukuaamo’ãi { $name } pe
    { $period } rire, pe ára paha iñemuhakuatia hag̃ua.
sub-item-cancel-confirm =
    Ehejarei che jeikeha ha che marandu ñongatupyre
    { $name } pegua { $period }-pe
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
sub-promo-coupon-applied = Kupõ { $promotion_name } porupy: <priceDetails></priceDetails>
subscription-management-account-credit-balance = Ko ñemboheraguapy jehepyme’ẽgua osẽ peteĩ crédito ne mba’eteguágui: <priceDetails></priceDetails>

## Routes - Subscription

sub-route-idx-reactivating = Ojavy pe mboheraguapy myandyjey
sub-route-idx-cancel-failed = Ojavy pe mboheraguapy jehejarei
sub-route-idx-contact = Eñe’ẽ pytyvõhándi
sub-route-idx-cancel-msg-title = Rombyasy eho haguére
# $name (String) - The name of the subscribed product.
# $date (Date) - Last day of product access
sub-route-idx-cancel-msg =
    Pe mboheraguapy { $name } pegua ojejokóma.
          <br />
          Eikekuaa { $name }-pe { $date } peve.
sub-route-idx-cancel-aside-2 = Eporandusépa. Eike <a>{ -brand-mozilla } Pytyvõha</a>.

## Routes - Subscriptions - Errors

sub-customer-error =
    .title = Apañuái emyanyhẽvo ñemuhára
sub-invoice-error =
    .title = Apañuái emyanyhẽvo kuatiañemure
sub-billing-update-success = Marandu ñenuhakuatia rehegua oñembohekopyahúma
sub-invoice-previews-error-title = Apañuái emyanyhẽvo kuatiañemure
sub-invoice-previews-error-text = Ndaikatúi oñemyanyhẽ kuatiañemure jehecha’ypy

## Routes - Subscription - ActionButton

pay-update-change-btn = Moambue
pay-update-manage-btn = Ñangareko

## Routes - Subscriptions - Cancel and IapItem
## $priceAmount (Number) - The amount billed. It will be formatted as currency.
## $taxAmount (Number) - The tax added on, not included in amount. It will be formatted as currency.
## $date (Date) - The date for the next time a charge will occur.

sub-next-bill = Ñemuhakuatia oĩjeýta ág̃a { $date }
sub-next-bill-due-date = Ñemuhakuatia oútava hu’ãta { $date }
sub-expires-on = Opáta { $date }

## Routes - Subscription - PaymentUpdate


# $expirationDate (Date) - The payment card's expiration date.

pay-update-card-exp = Hu’ãta { $expirationDate }
sub-route-idx-updating = Hekopyahuhína ñemuhakuatia marandu…
sub-route-payment-modal-heading = Marandu kuatiañemure oiko’ỹva
sub-route-payment-modal-message-2 = Oĩvaicha jejavy { -brand-paypal } mba’ete ndive, roikotevẽ emboguata mba’eichaitépa emoĩporãta ko apañuái jehepyme’ẽ rehegua.
sub-route-missing-billing-agreement-payment-alert = Marandu jehepyme’ẽ rehegua oiko’ỹva; oĩ jejavy mba’ete ndive. <div>Ñangareko</div>
sub-route-funding-source-payment-alert = Marandu jehepyme’ẽ rehegua oiko’ỹva; oĩ jejavy mba’ete ndive. Ko jyhyjerã ndohopya’emo’ãi embohehekopyahu rire pe marandu hekopete. <div>Ñangareko</div>

## Routes - Subscription - SubscriptionItem

sub-item-no-such-plan = Ndaipóri tembiaporã ko mboheraguapýpe g̃uarã.
invoice-not-found = Ndojejuhúi kuatiañemure
sub-item-no-such-subsequent-invoice = Ndojejuhúi kuatiañemure ko ñemboheraguapýpe g̃uarã.
sub-invoice-preview-error-title = Kuatiañemure jehecha’ypy jejuhu’ỹva
sub-invoice-preview-error-text = Kuatiañemungue jehecha ypy ndojejuhúi ko ñemboheraguapyrã

## Routes - Subscriptions - Reactivate
## $name (String) - The name of the subscribed product.

reactivate-confirm-dialog-header = ¿Eiporuse gueteri { $name }?
# $amount (Number) - The amount billed. It will be formatted as currency.
# $last (String) - The last 4 digits of the card that will be charged
# $endDate (Date) - Last day of product access
reactivate-confirm-copy =
    { $name } jeike oku’ejeýta ha pe ñemuhakuatia rape
    ha jehepyme’ẽ naiñambuemo’ãi. Pe jehepyme’ẽ oútava
    { $amount } kuatia’atãme opáta { $last }-pe { $endDate } og̃uahẽvo.
# Alternate copy used when a payment method is not available, e.g. for free trials
# $amount (Number) - The amount billed. It will be formatted as currency.
# $endDate (Date) - Last day of product access
reactivate-confirm-without-payment-method-copy =
    { $name } jeike oku’ejeýta ha pe ñemuhakuatia rape
    ha jehepyme’ẽ naiñambuemo’ãi. Pe jehepyme’ẽ oútava
    { $amount } mba’e { $endDate } og̃uahẽvo.
reactivate-confirm-button = Mboheraguapy

## $date (Date) - Last day of product access

reactivate-panel-copy = Ndaikatuma’ãi eike { $name }-pe <strong>{ $date }</strong>.
reactivate-success-copy = ¡Aguyje! Oĩmbáma.
reactivate-success-button = Mboty

## Routes - Subscriptions - Subscription iap item

sub-iap-item-google-purchase-2 = { -brand-google }: ejogua tembiporu’ípe
sub-iap-item-apple-purchase-2 = { -brand-apple }: ejogua tembiporu’ípe
sub-iap-item-manage-button = Ñangareko
