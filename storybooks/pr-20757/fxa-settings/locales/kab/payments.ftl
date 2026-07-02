# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.


## Component - AppLayout

settings-home = Asebter agejdan n umiḍan
settings-project-header-title = { -product-mozilla-account }

## Component - CouponForm

coupon-submit = Snes
coupon-remove = Kkes
coupon-error = Tangalt i teskecmeḍ d tarameɣtut neɣ temmut.
coupon-error-generic = Tella-d tuccḍa lawan n usesfer n tengalt. Ma ulac aɣilif, εreḍ tikkelt-nniḍen.
coupon-error-expired = Tangalt i teskecmeḍ temmut.
coupon-error-limit-reached = Tangalt i teskecmeḍ tewweḍ ɣer talast.
coupon-error-invalid = Tangalt i teskecmeḍ d tarameɣtut.
# $couponDurationDate (Date) - The date at which the coupon is no longer valid, and the subscription is billed the list price.
coupon-enter-code =
    .placeholder = Sekcem tangalt

## Component - Fields

default-input-error = Urti-a yettwasra
input-error-is-required = { $label } ilaq

## Component - Header

brand-name-mozilla-logo = alugu { -brand-mozilla }

## Component - NewUserEmailForm

# "Required" to indicate that the user must use the checkbox below this text to
# agree to a payment method's terms of service and privacy notice in order to
# continue.
new-user-enter-email =
    .label = Sekcem imayl inek
new-user-confirm-email =
    .label = Sentem imayl-inek·inem
new-user-subscribe-product-updates-mozilla = Bɣiɣ ad d-remseɣ talɣut ɣef yifarisen d yileqman seg { -brand-mozilla }
new-user-subscribe-product-updates-hubs = Bɣiɣ ad d-remseɣ talɣut ɣef yifarisen d yileqman seg { -product-mozilla-hubs } akked { -brand-mozilla }
new-user-subscribe-product-updates-mdnplus = Bɣiɣ ad d-remseɣ talɣut ɣef yifarisen d yileqman seg { -product-mdn-plus } akked { -brand-mozilla }
new-user-subscribe-product-assurance = Nseqdac kan imayl-ik·im i wakken ad nernu amiḍan-ik·im. Urǧin ad t-nsenz i wis kraḍ.
new-user-email-validate = Imayl-a d arameɣtu
new-user-email-validate-confirm = Ur mṣadan ara yimaylen-a
new-user-already-has-account-sign-in = Tesɛiḍ yakan amiḍan. <a>Qqen</a>
# $domain (String) - the email domain provided by the user during sign up
new-user-invalid-email-domain = Imayl d arameɣtu? { $domain } ur d-yettak ara imayl.

## Component - PaymentConfirmation

payment-confirmation-thanks-heading = Tanemmirt!
payment-confirmation-thanks-heading-account-exists = Tanemmirt, senqed tura imayl-ik·im!
# $email (string) - The user's email.
# $productName (String) - The name of the subscribed product.
payment-confirmation-thanks-subheading = Imayl n usentem yettwazen-ak·am-n ɣer { $email } s telqayt ɣef wamek ara tebduḍ akked { $product_name }.
# $email (string) - The user's email.
payment-confirmation-thanks-subheading-account-exists = Ad tremseḍ imayl ɣer { $email } s yiwellihen ara tesbaduḍ amiḍan-ik·im, akked telɣut n lexlaṣ-ik·im.
payment-confirmation-order-heading = Talqayt n usuter
payment-confirmation-invoice-number = Tafaṭurt #{ $invoiceNumber }
# $invoiceDate (Date) - Start date of the latest invoice
payment-confirmation-invoice-date = { $invoiceDate }
payment-confirmation-details-heading-2 = Talɣut n lexlaṣ
payment-confirmation-amount = { $amount } s { $interval }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in days.
payment-confirmation-amount-day =
    { $intervalCount ->
        [one] { $amount } wass
       *[other] { $amount } n yal { $intervalCount } ass
    }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in weeks.
payment-confirmation-amount-week =
    { $intervalCount ->
        [one] { $amount } n dduṛt
       *[other] { $amount } yal { $intervalCount } dduṛt
    }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in months.
payment-confirmation-amount-month =
    { $intervalCount ->
        [one] { $amount } n wayyur
       *[other] { $amount } yal { $intervalCount } ayyur
    }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in years.
payment-confirmation-amount-year =
    { $intervalCount ->
        [one] { $amount } n useggas
       *[other] { $amount } yal { $intervalCount } aseggas
    }
payment-confirmation-download-button = Kemmel akken ad d-tsidreḍ

## Component - PaymentErrorView

payment-error-retry-button = Ɛreḍ tikkelt-nniḍen
payment-error-manage-subscription-button = Sefrek amulteɣ-inu

## Component - PaymentErrorView - IAP upgrade errors

iap-upgrade-get-help-button = Awi tallalt

## Component - PaymentForm

payment-name =
    .placeholder = Isem ummid
    .label = Isem akken yella deg tkarḍa-inek/inem
payment-cc =
    .label = Takarḍa-k•m
payment-cancel-btn = Sefsex
payment-update-btn = Leqqem
payment-pay-btn = Sellek tura
payment-pay-with-paypal-btn-2 = Xelleṣ { -brand-paypal }
payment-validate-name-error = Ma ulac aɣilif, sekcem-d isem-inek

## Component - PaymentLegalBlurb

payment-legal-copy-stripe-and-paypal-3 = { -brand-mozilla } isseqdac { -brand-name-stripe } akked { -brand-paypal } i usesfer aɣelsan n yiselliken.
payment-legal-link-stripe-paypal-2 = <stripePrivacyLink>{ -brand-name-stripe } tasertit n tbaḍnit</stripePrivacyLink> &nbsp; <paypalPrivacyLink>{ -brand-paypal } tasertit n tbaḍnit</paypalPrivacyLink>
payment-legal-copy-paypal-2 = { -brand-mozilla } isseqdac { -brand-paypal } i usesfer aɣelsan n yiselliken.
payment-legal-link-paypal-3 = <paypalPrivacyLink>{ -brand-paypal } tasertit n tbaḍnit</paypalPrivacyLink>
payment-legal-copy-stripe-3 = { -brand-mozilla } isseqdac { -brand-name-stripe } i usesfer aɣelsan n yiselliken.
payment-legal-link-stripe-3 = <stripePrivacyLink>{ -brand-name-stripe } tasertit n tbaḍnit</stripePrivacyLink>

## Component - PaymentMethodHeader

payment-method-header = Fren tarrayt-ik·im n lexlaṣ
# This message is used to indicate the second step in a multi step process.
payment-method-header-second-step = 2. { payment-method-header }

## Component - PaymentProcessing

payment-processing-message = Ttxil-k·m ṛǧu mi ara nsesfer asellek-inek·inem…

## Component - PaymentProviderDetails

payment-confirmation-cc-card-ending-in = Takarḍa ad tfakk deg { $last4 }

## Component - PayPalButton

pay-with-heading-paypal-2 = Xelleṣ { -brand-paypal }

## Component - PlanDetails

plan-details-header = Talqayt n ufaris
plan-details-list-price = Tabdart n leswam
plan-details-show-button = Sken talqayt
plan-details-hide-button = Ffer talqayt
plan-details-total-label = Asemday

## Component - PlanErrorDialog

product-no-such-plan = Ulac aɣawas s wanaw-a i ufaris-a.

## Price details including tax
## $priceAmount (Number) - The amount billed. It will be formatted as currency.
## $taxAmount (Number) - The tax added on, not included in amount. It will be formatted as currency.

price-details-no-tax = { $priceAmount }
price-details-tax = { $priceAmount } + { $taxAmount } tax

## Component - SubscriptionTitle

subscription-create-title = Sbadu amulteɣ-ik·im
subscription-success-title = Asentem n umulteɣ
subscription-processing-title = Asentem n umulteɣ…
subscription-error-title = Tuccḍa deg usentem n umulteɣ…
subscription-noplanchange-title = Asnifel n uɣawas n umulteɣ ur yettusefrak ara
subscription-iapsubscribed-title = I•Tmulteɣ yakan
sub-guarantee = Ṭṭmana n tiririt n yidrimen n 30 n wussan

## Component - TermsAndPrivacy

# "Mozilla Accounts" is capitalized in this instance for title case in English
# This heading is followed by links to Terms of Service and Privacy Notice
subplat-mozilla-accounts-legal-heading = { -product-mozilla-accounts(capitalization: "uppercase") }
terms = Tiwtilin n useqdec
privacy = Tasertit n tbaḍnit
terms-download = Tiwtilin n usader

## App-level string(s) and messages shared by multiple components or routes

document =
    .title = Imiḍanen Firefox
# General aria-label for closing modals
close-aria =
    .aria-label = Mdel
settings-subscriptions-title = Ajerred
# Title of container where a user can input a coupon code to get a discount on a subscription.
coupon-promo-code = Tangalt promo

## Error messages

# App error dialog
general-error-heading = Tuccda n usnas tamatut
basic-error-message = Yella wayen ur nteddu ara akken ilaq. Ma ulac aɣilif, εreḍ tikkelt-nniḍen.
payment-error-1 = Hmm. Yella wugur deg usireg n uxelleṣ-ik•im. Ɛreḍ tikkelt-nniḍen neɣ  nermes adabu amazan n tkarḍa-k•m n usmad.
payment-error-2 = Hmm. Yella wugur deg usireg n uxelleṣ-ik•im. Nermes adabu amazan n tkarḍa-k•m n usmad.
payment-error-3b = Tuccḍa ur netturaǧu ara teḍra-d deg usesfer lexlaṣ-ik·im, ɛreḍ tikkelt-nniḍen.
expired-card-error = Akka i d-yettban, takarḍan-inek/inem n usellek temmut. Ɛreḍ takarḍa-nniḍen.
insufficient-funds-error = Akka i d-yettban, takarḍa-inek/inem drus n yidrimen i d-mazal deg-s. Ɛreḍ takarḍa-nniḍen.
withdrawal-count-limit-exceeded-error = Ittban-d dakken tanigawt-a tɛedda i talast n usmad-ik•im. Ɛreḍ s takarḍa-nniḍen.
charge-exceeds-source-limit = Ittban-d dakken tanigawt-a tɛedda i talast n usmad-ik•im. Ɛreḍ s takarḍa-nniḍen neɣ deg 24 n yisragen.
instant-payouts-unsupported = Ittban-d dakken takarḍa-k•m n uktum ur tettuswel ara i uxelleṣ askudan. Ɛreḍ s takarḍa-nniḍen n uktum neɣ n usmad.
duplicate-transaction = Hmm. Ittban-d dakken tettwazen tanigawt am tin. Senqed azray n uxelleṣ-ik•im.
coupon-expired = Ittban-d dakken tangalt n udellel temmut.
card-error = Tanigawt-ik•im ur tezmir ara ad teddu. Ttxil senqed talɣut n tkarḍa-k•m n usmad tɛawdeḍ tikkelt-nniḍen.
country-currency-mismatch = Tadrimt n umulteɣ-a d arameɣtu i tmurt icudden ɣer lexlaṣ-ik·im.
currency-currency-mismatch = Nesḥassef. Ur tezmireḍ ara ad tnegzeḍ seg yibenk ɣer wayeḍ.
no-subscription-change = Nesḥassef. Ur tezmireḍ ara ad tbeddleḍ aɣawas n ujerred-inek·inem.
# $mobileAppStore (String) - "Google Play Store" or "App Store", localized when the translation is available.
iap-already-subscribed = Tmultɣeḍ yakan seg { $mobileAppStore }.
# $productName (String) - The name of the subscribed product.
fxa-account-signup-error-2 = Tuccḍa deg unagraw ad d-yeglu s uɣelluy n ujerrid-inek·inem ɣer { $productName }. Askar-ik·im n uxelleṣ ur yettwaεemmer ara. Ttxil-k·m εreḍ tikkelt-nniḍen.
fxa-post-passwordless-sub-error = Amulteɣ yettwasentem, maca asebter n usentem yegguma ad d-yali. Ma ulac aɣilif, senqed imayl-ik·im i usbadu n umiḍan-ik·im.
newsletter-signup-error = Ur tjerrdeḍ ara ɣer yilɣa n uleqqem n ufaris s yimayl. Tzemreḍ ad tεerḍeḍ tikkelt-nniḍen deg yiɣewwaren n umiḍan-ik·im.
product-plan-error =
    .title = Ugur deg usali n yiɣawasen
product-profile-error =
    .title = Ugur deg usali n umaɣnu
product-customer-error =
    .title = Ugur deg usali n umsaɣ
product-plan-not-found = Ur yettwaf ara uɣawas
product-location-unsupported-error = Adig ur yettwasefrak ara

## Hooks - coupons

coupon-success = Aɣawas-ik·im ad ttuεawed s wudem awurman ɣer ssuma yellan tura.
# $couponDurationDate (Date) - The date at which the coupon is no longer valid, and the subscription is billed the list price.
coupon-success-repeating = Aɣawas-ik·im ad yettuεawed s wudem awuran seld { $couponDurationDate } ɣer ssuma tamirant.

## Routes - Checkout - New user

new-user-step-1-2 = 1. Rnu { -product-mozilla-account }
new-user-card-title = Sekcem talɣut-ik·im n yimayl
new-user-submit = Multeɣ tura

## Routes - Product and Subscriptions

sub-update-payment-title = Talɣut n usellek

## Routes - Product/AcceptedCards
## Used in both Routes - Checkout and Product/SubscriptionCreate

pay-with-heading-card-only = Xelleṣ s tkarḍa
product-invoice-preview-error-title = Ugur deg usali n teskant n tfaṭurin

## Routes - Product - IapRoadblock


# The following are not terms because they are not used directly in messages,
# but rather looked up in code and passed into the message as variables.

brand-name-google-play-2 = { -google-play } Store
brand-name-apple-app-store-2 = { -app-store }

## Routes - Product - Subscription upgrade

product-plan-change-heading = Senqed asnifel-ik·im
sub-change-failed = Asnifel n uɣawas yecceḍ
sub-change-submit = Sentem abeddel
sub-update-current-plan-label = Aɣawas amiran
sub-update-new-plan-label = Aɣawas amaynut
sub-update-total-label = Asemday amaynut

## Checkout line item for subscription plan change listing the product name and frequency of payment
## For example, a Mozilla VPN subscription charged monthly would appear as: Mozilla VPN (Monthly)
## Variables:
##   $productName (String) - Name of the upgraded product (e.g. Mozilla VPN)

sub-update-new-plan-daily = { $productName } (yal ass)
sub-update-new-plan-weekly = { $productName } (i ddurt)
sub-update-new-plan-monthly = { $productName } (i wayyur)
sub-update-new-plan-yearly = { $productName } (i useggas)

## Routes - Subscriptions - Cancel

sub-item-cancel-sub = Sefsex ajerred
sub-item-stay-sub = Qqim kan tjerrdeḍ

## $name (String) - The name of the subscribed product.
## $period (Date) - The last day of product access

sub-item-cancel-msg =
    Dayen ur tzemmreḍ ara ad tesqedceḍ { $name } deffir n
    { $period }, ass aneggaru n wallus n ufetter-ik•im.
sub-item-cancel-confirm =
    Sefsex anekcum-inu d taɣult-inu yettwaskelsen deg
    { $name } deg { $period }

## Routes - Subscription

sub-route-idx-reactivating = Allus n urmad n ujerred ur yeddi ara
sub-route-idx-cancel-failed = Tuffɣa seg ujerred ur teddi ara
sub-route-idx-contact = Nermes tallalt
sub-route-idx-cancel-msg-title = Neḥzen imi truḥeḍ
# $name (String) - The name of the subscribed product.
# $date (Date) - Last day of product access
sub-route-idx-cancel-msg =
    Ajerred-inek { $name } yefsex.
           <br />
          Ad tizmireḍ ad tkecmeḍ ɣer { $name } seg { $date }.
sub-route-idx-cancel-aside-2 = Tesεiḍ asteqsi? Rzu ɣer <a>{ -brand-mozilla } tallalt</a>.

## Routes - Subscriptions - Errors

sub-customer-error =
    .title = Ugur deg usali n umsaɣ
sub-invoice-error =
    .title = Ugur deg usali n tfaṭurin
sub-billing-update-success = Talɣut-ik/im n ufter tettwaleqqem akken iwata
sub-invoice-previews-error-title = Ugur deg usali n teskanin n tfaṭurin

## Routes - Subscription - ActionButton

pay-update-change-btn = Snifel
pay-update-manage-btn = Sefrek

## Routes - Subscriptions - Cancel and IapItem
## $priceAmount (Number) - The amount billed. It will be formatted as currency.
## $taxAmount (Number) - The tax added on, not included in amount. It will be formatted as currency.
## $date (Date) - The date for the next time a charge will occur.

sub-next-bill = Afetter i d-itteddun deg { $date }
sub-expires-on = Ad yemmet deg { $date }

## Routes - Subscription - PaymentUpdate


# $expirationDate (Date) - The payment card's expiration date.

pay-update-card-exp = Ad yemmes { $expirationDate }
sub-route-idx-updating = Aleqqem n telɣut n ufter
sub-route-payment-modal-heading = Talɣut n ufter d tarameɣtut
sub-route-payment-modal-message-2 = Akka d-yettban tella tuccḍa aked umiḍan-ik·im { -brand-paypal }, ma ulac uɣilif xdem ayen i ilaqen i ferru n wugur-a n lexlaṣ.
sub-route-missing-billing-agreement-payment-alert = Talɣut n uxelleṣ d tarameɣtut; tella tuccḍa akked umiḍan-ik·im. <div>Sefrek</div>
sub-route-funding-source-payment-alert = Talɣut n uxelleṣ d tarameɣtut; tella tuccḍa deg umiḍan-ik·im. Alɣu-a yezmer ad yeṭṭef kra n wakud i wakken ad yekkes seld aleqqem n talɣut-ik·im. <div>Sefrek</div>

## Routes - Subscription - SubscriptionItem

sub-item-no-such-plan = Ulac aɣawas s wanaw-a i ujerred-a.
invoice-not-found = Tafaṭurt-a ulac-itt
sub-item-no-such-subsequent-invoice = Tafaṭurt-a ulac-itt i umultaɣ-a.

## Routes - Subscriptions - Reactivate
## $name (String) - The name of the subscribed product.

reactivate-confirm-dialog-header = Tebɣiḍ ad tkemmleḍ deg useqdec { $name }?
# $amount (Number) - The amount billed. It will be formatted as currency.
# $last (String) - The last 4 digits of the card that will be charged
# $endDate (Date) - Last day of product access
reactivate-confirm-copy =
    Anekcum-ik•im ɣer { $name } ad ikemmel, daɣen allus-ik•im n ufetter
    d uxelleṣ ad qqimen akken. Ssuma-k•m i d-itteddun ad tili 
    { $amount } ɣer taggara n tkarḍa deg{ $last } deg { $endDate }.
# Alternate copy used when a payment method is not available, e.g. for free trials
# $amount (Number) - The amount billed. It will be formatted as currency.
# $endDate (Date) - Last day of product access
reactivate-confirm-without-payment-method-copy =
    Anekcum-ik•im ɣer { $name } ad ikemmel, daɣen allus-ik•im n ufetter
    d uxelleṣ ad qqimen akken. Ssuma-k•m i d-itteddun ad tili { $amount } deg { $endDate }.
reactivate-confirm-button = Ales ajerred

## $date (Date) - Last day of product access

reactivate-panel-copy = Ad ak-iṛuh unekcum ɣer { $name } deg<strong>{ $date }</strong>.
reactivate-success-copy = Tanemmirt! Aql-ak/akem twejdeḍ.
reactivate-success-button = Mdel

## Routes - Subscriptions - Subscription iap item

sub-iap-item-google-purchase-2 = { -brand-google }: Tiɣin s usnas
sub-iap-item-apple-purchase-2 = { -brand-apple }: Tiɣin s usnas
sub-iap-item-manage-button = Sefrek
