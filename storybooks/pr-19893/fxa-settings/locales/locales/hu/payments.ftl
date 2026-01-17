# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.


## Component - AppLayout

settings-home = Fiók kezdőlapja
settings-project-header-title = { -product-mozilla-account }

## Component - CouponForm

# Title of container showing discount coupon code applied to a subscription.
coupon-promo-code-applied = Promóciós kód alkalmazva
coupon-submit = Alkalmaz
coupon-remove = Eltávolítás
coupon-error = A megadott kód érvénytelen vagy lejárt.
coupon-error-generic = Hiba történt a kód feldolgozása során. Próbálja újra.
coupon-error-expired = A megadott kód lejárt.
coupon-error-limit-reached = A megadott kód elérte a korlátját.
coupon-error-invalid = A megadott kód érvénytelen.
# $couponDurationDate (Date) - The date at which the coupon is no longer valid, and the subscription is billed the list price.
coupon-enter-code =
    .placeholder = Adja meg a kódot

## Component - Fields

default-input-error = Ez a mező kötelező
input-error-is-required = { $label } szükséges

## Component - Header

brand-name-mozilla-logo = { -brand-mozilla } logó

## Component - NewUserEmailForm

new-user-sign-in-link-2 = Már van { -product-mozilla-account }ja? <a>Jelentkezzen be</a>
# "Required" to indicate that the user must use the checkbox below this text to
# agree to a payment method's terms of service and privacy notice in order to
# continue.
new-user-enter-email =
    .label = Adja meg az e-mail-címét
new-user-confirm-email =
    .label = Erősítse meg az e-mail-címét
new-user-subscribe-product-updates-mozilla = Szeretnék termékhíreket és újdonságokat kapni a { -brand-mozilla(ending: "accented") }tól
new-user-subscribe-product-updates-snp = Szeretnék biztonsági és adatvédelmi híreket kapni a { -brand-mozilla(ending: "accented") }tól
new-user-subscribe-product-updates-hubs = Szeretnék termékhíreket és frissítéseket kapni a { -product-mozilla-hubs }-tól és a { -brand-mozilla(ending: "accented") }tól
new-user-subscribe-product-updates-mdnplus = Szeretnék termékhíreket és frissítéseket kapni az { -product-mdn-plus }-tól és a { -brand-mozilla(ending: "accented") }tól
new-user-subscribe-product-assurance = Csak a fiókja létrehozásához használjuk az e-mail-címét. Sosem adjuk el harmadik félnek.
new-user-email-validate = Az e-mail-cím érvénytelen
new-user-email-validate-confirm = Az e-mail-címek nem egyeznek
new-user-already-has-account-sign-in = Már van felhasználói fiókja. <a>Jelentkezzen be</a>
# $domain (String) - the email domain provided by the user during sign up
new-user-invalid-email-domain = Elírta az e-mail-címet? A(z) { $domain } nem nyújt e-mail szolgáltatást.

## Component - PaymentConfirmation

payment-confirmation-thanks-heading = Köszönjük!
payment-confirmation-thanks-heading-account-exists = Köszönjük, most pedig nézze meg az e-mailjeit!
# $email (string) - The user's email.
# $productName (String) - The name of the subscribed product.
payment-confirmation-thanks-subheading = Egy megerősítő e-mailt küldtünk a(z) { $email } címre, amely részletesen ismerteti a { $product_name } használatának elkezdését.
# $email (string) - The user's email.
payment-confirmation-thanks-subheading-account-exists = Egy levelet fog kapni a(z) { $email } címre a fiókbeállítási utasításokkal és a fizetés részleteiről.
payment-confirmation-order-heading = Megrendelés részletei
payment-confirmation-invoice-number = Számla #{ $invoiceNumber }
# $invoiceDate (Date) - Start date of the latest invoice
payment-confirmation-invoice-date = { $invoiceDate }
payment-confirmation-details-heading-2 = Fizetési információk
payment-confirmation-amount = { $amount } / { $interval }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in days.
payment-confirmation-amount-day =
    { $intervalCount ->
        [one] { $amount } naponta
       *[other] { $amount } { $intervalCount } naponta
    }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in weeks.
payment-confirmation-amount-week =
    { $intervalCount ->
        [one] { $amount } hetente
       *[other] { $amount } { $intervalCount } hetente
    }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in months.
payment-confirmation-amount-month =
    { $intervalCount ->
        [one] { $amount } havonta
       *[other] { $amount } { $intervalCount } havonta
    }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in years.
payment-confirmation-amount-year =
    { $intervalCount ->
        [one] { $amount } évente
       *[other] { $amount } { $intervalCount } évente
    }
payment-confirmation-download-button = Tovább a letöltéshez

## Component - PaymentConsentCheckbox

payment-confirm-with-legal-links-static-3 = Felhatalmazom a { -brand-mozilla(ending: "accented") }t, hogy terhelje meg a megjelenített összeget az én fizetési módommal az <termsOfServiceLink>Szolgáltatási feltételek</termsOfServiceLink> és az <privacyNoticeLink>Adatvédelmi nyilatkozat</privacyNoticeLink> szerint, amíg le nem mondom az előfizetést.
payment-confirm-checkbox-error = Ezt be kell fejeznie, mielőtt továbblép

## Component - PaymentErrorView

payment-error-retry-button = Próbálja újra
payment-error-manage-subscription-button = Saját feliratkozások kezelése

## Component - PaymentErrorView - IAP upgrade errors

# $productName (String) - The name of the subscribed product.
iap-upgrade-already-subscribed-2 = Már van { $productName } előfizetése a { -brand-google } vagy az { -brand-apple } alkalmazásboltján keresztül.
iap-upgrade-no-bundle-support = Jelenleg nem támogatjuk a frissítést ezekről az előfizetésekről, de hamarosan fogjuk.
iap-upgrade-contact-support = Továbbra is beszerezheti ezt a terméket – lépjen kapcsolatba a támogatással, hogy segíthessünk.
iap-upgrade-get-help-button = Segítség kérése

## Component - PaymentForm

payment-name =
    .placeholder = Teljes név
    .label = A kártyán szereplő név
payment-cc =
    .label = Az Ön kártyája
payment-cancel-btn = Mégse
payment-update-btn = Frissítés
payment-pay-btn = Fizetés most
payment-pay-with-paypal-btn-2 = Fizetés { -brand-paypal }lal
payment-validate-name-error = Adja meg a nevét

## Component - PaymentLegalBlurb

payment-legal-copy-stripe-and-paypal-3 = A { -brand-mozilla } a { -brand-name-stripe }-ot és a { -brand-paypal }t használja a biztonságos fizetésfeldolgozáshoz.
payment-legal-link-stripe-paypal-2 = <stripePrivacyLink>A { -brand-name-stripe } adatvédelmi irányelvei</stripePrivacyLink> &nbsp; <paypalPrivacyLink>A { -brand-paypal } atomvédelmi irányelvei</paypalPrivacyLink>.
payment-legal-copy-paypal-2 = A { -brand-mozilla } a { -brand-paypal }t használja a biztonságos fizetésfeldolgozáshoz.
payment-legal-link-paypal-3 = <paypalPrivacyLink>A { -brand-paypal } adatvédelmi irányelvei</paypalPrivacyLink>.
payment-legal-copy-stripe-3 = A { -brand-mozilla } a { -brand-name-stripe }-ot használja a biztonságos fizetésfeldolgozáshoz.
payment-legal-link-stripe-3 = <stripePrivacyLink>A { -brand-name-stripe } adatvédelmi irányelvei</stripePrivacyLink>.

## Component - PaymentMethodHeader

payment-method-header = Válassza ki a fizetési módot
# This message is used to indicate the second step in a multi step process.
payment-method-header-second-step = 2. { payment-method-header }
payment-method-first-approve = Először jóvá kell hagynia az előfizetését

## Component - PaymentProcessing

payment-processing-message = Várjon, amíg feldolgozzuk a fizetését…

## Component - PaymentProviderDetails

payment-confirmation-cc-card-ending-in = { $last4 } végződésű kártya

## Component - PayPalButton

pay-with-heading-paypal-2 = Fizetés { -brand-paypal }lal

## Component - PlanDetails

plan-details-header = Termék részletei
plan-details-list-price = Listaár
plan-details-show-button = Részletek megjelenítése
plan-details-hide-button = Részletek elrejtése
plan-details-total-label = Összesen
plan-details-tax = Adók és díjak

## Component - PlanErrorDialog

product-no-such-plan = Nincs ilyen előfizetés ehhez a termékhez.

## Price details including tax
## $priceAmount (Number) - The amount billed. It will be formatted as currency.
## $taxAmount (Number) - The tax added on, not included in amount. It will be formatted as currency.

price-details-no-tax = { $priceAmount }
price-details-tax = { $priceAmount } + { $taxAmount } adó
# $intervalCount (Number) - The interval between payments, in days.
price-details-no-tax-day =
    { $intervalCount ->
        [one] { $priceAmount } naponta
       *[other] { $priceAmount } minden { $intervalCount }. napon
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } naponta
           *[other] { $priceAmount } minden { $intervalCount }. napon
        }
# $intervalCount (Number) - The interval between payments, in weeks.
price-details-no-tax-week =
    { $intervalCount ->
        [one] { $priceAmount } hetente
       *[other] { $priceAmount } minden { $intervalCount }. héten
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } hetente
           *[other] { $priceAmount } minden { $intervalCount }. héten
        }
# $intervalCount (Number) - The interval between payments, in months.
price-details-no-tax-month =
    { $intervalCount ->
        [one] { $priceAmount } havonta
       *[other] { $priceAmount } minden { $intervalCount }. hónapban
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } havonta
           *[other] { $priceAmount } minden { $intervalCount }. hónapban
        }
# $intervalCount (Number) - The interval between payments, in years.
price-details-no-tax-year =
    { $intervalCount ->
        [one] { $priceAmount } évente
       *[other] { $priceAmount } minden { $intervalCount }. évben
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } évente
           *[other] { $priceAmount } minden { $intervalCount }. évben
        }
# $intervalCount (Number) - The interval between payments, in days.
price-details-tax-day =
    { $intervalCount ->
        [one] { $priceAmount } + { $taxAmount } adó naponta
       *[other] { $priceAmount } + { $taxAmount } adó minden { $intervalCount }. napon
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + { $taxAmount } adó naponta
           *[other] { $priceAmount } + { $taxAmount } adó minden { $intervalCount }. napon
        }
# $intervalCount (Number) - The interval between payments, in weeks.
price-details-tax-week =
    { $intervalCount ->
        [one] { $priceAmount } + { $taxAmount } adó hetente
       *[other] { $priceAmount } + { $taxAmount } adó minden { $intervalCount }. hetente
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + { $taxAmount } adó hetente
           *[other] { $priceAmount } + { $taxAmount } adó minden { $intervalCount }. hetente
        }
# $intervalCount (Number) - The interval between payments, in months.
price-details-tax-month =
    { $intervalCount ->
        [one] { $priceAmount } + { $taxAmount } adó havonta
       *[other] { $priceAmount } + { $taxAmount } adó minden { $intervalCount }. hónapban
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + { $taxAmount } adó havonta
           *[other] { $priceAmount } + { $taxAmount } adó minden { $intervalCount }. hónapban
        }
# $intervalCount (Number) - The interval between payments, in years.
price-details-tax-year =
    { $intervalCount ->
        [one] { $priceAmount } + { $taxAmount } adó évente
       *[other] { $priceAmount } + { $taxAmount } adó minden { $intervalCount }. évben
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + { $taxAmount } adó évente
           *[other] { $priceAmount } + { $taxAmount } adó minden { $intervalCount }. évben
        }

## Component - SubscriptionTitle

subscription-create-title = Állítsa be a feliratkozását
subscription-success-title = Feliratkozás megerősítése
subscription-processing-title = Feliratkozás megerősítése…
subscription-error-title = Hiba a feliratkozás megerősítésekor…
subscription-noplanchange-title = Az előfizetési csomag ezen módosítása nem támogatott
subscription-iapsubscribed-title = Már előfizető
sub-guarantee = 30 napos pénzvisszafizetési garancia

## Component - TermsAndPrivacy

# "Mozilla Accounts" is capitalized in this instance for title case in English
# This heading is followed by links to Terms of Service and Privacy Notice
subplat-mozilla-accounts-legal-heading = { -product-mozilla-accounts }
terms = A szolgáltatás feltételei
privacy = Adatvédelmi nyilatkozat
terms-download = Letöltési feltételek

## App-level string(s) and messages shared by multiple components or routes

document =
    .title = Firefox-fiókok
# General aria-label for closing modals
close-aria =
    .aria-label = Felugró ablak bezárása
settings-subscriptions-title = Előfizetések
# Title of container where a user can input a coupon code to get a discount on a subscription.
coupon-promo-code = Promóciós kód

## Subscription upgrade plan details - shared by multiple components, including plan details and payment form
## $amount (Number) - The amount billed. It will be formatted as currency.

# $intervalCount (Number) - The interval between payments, in days.
plan-price-interval-day =
    { $intervalCount ->
        [one] { $amount } naponta
       *[other] { $amount } minden { $intervalCount }. napon
    }
    .title =
        { $intervalCount ->
            [one] { $amount } naponta
           *[other] { $amount } minden { $intervalCount }. napon
        }
# $intervalCount (Number) - The interval between payments, in weeks.
plan-price-interval-week =
    { $intervalCount ->
        [one] { $amount } hetente
       *[other] { $amount } minden { $intervalCount }. héten
    }
    .title =
        { $intervalCount ->
            [one] { $amount } hetente
           *[other] { $amount } minden { $intervalCount }. héten
        }
# $intervalCount (Number) - The interval between payments, in months.
plan-price-interval-month =
    { $intervalCount ->
        [one] { $amount } havonta
       *[other] { $amount } minden { $intervalCount }. hónapban
    }
    .title =
        { $intervalCount ->
            [one] { $amount } havonta
           *[other] { $amount } minden { $intervalCount }. hónapban
        }
# $intervalCount (Number) - The interval between payments, in years.
plan-price-interval-year =
    { $intervalCount ->
        [one] { $amount } évente
       *[other] { $amount } minden { $intervalCount }. évben
    }
    .title =
        { $intervalCount ->
            [one] { $amount } évente
           *[other] { $amount } minden { $intervalCount }. évben
        }

## Error messages

# App error dialog
general-error-heading = Általános alkalmazáshiba
basic-error-message = Hiba történt, próbálja újra később.
payment-error-1 = Hmm. Hiba történt a fizetés jóváhagyásakor. Próbálkozzon újra, vagy vegye fel a kapcsolatot a kártyakibocsátóval.
payment-error-2 = Hmm. Hiba történt a fizetés jóváhagyásakor. Vegye fel a kapcsolatot a kártyakibocsátóval.
payment-error-3b = Váratlan hiba történt a fizetése feldolgozása során, próbálja újra.
expired-card-error = Úgy tűnik, hogy a bankkártya lejárt. Próbálkozzon egy másik kártyával.
insufficient-funds-error = Úgy tűnik, hogy a bankkártyáján kevés a fedezet. Próbálkozzon egy másik kártyával.
withdrawal-count-limit-exceeded-error = Úgy tűnik, hogy ez a tranzakció túllép a hitelkeretén. Próbálkozzon egy másik kártyával.
charge-exceeds-source-limit = Úgy tűnik, hogy ez a tranzakció túllép a napi hitelkeretén. Próbálkozzon egy másik kártyával vagy 24 óra múlva.
instant-payouts-unsupported = Úgy tűnik, hogy a bankkártyája nincs beállítva azonnali fizetésekhez. Próbálkozzon egy másik kártyával.
duplicate-transaction = Hmm. Úgy tűnik, hogy egy azonos tranzakció lett elküldve. Ellenőrizze a fizetési előzményeket.
coupon-expired = Úgy tűnik, hogy a promóciós kód lejárt.
card-error = A tranzakció nem dolgozható fel. Ellenőrizze a bankkártyaadatait, és próbálja újra.
country-currency-mismatch = Az előfizetés pénzneme nem érvényes a fizetéséhez társított országban.
currency-currency-mismatch = Sajnáljuk. Nem válthat a pénznemek között.
location-unsupported = A jelenlegi tartózkodási helye a Szolgáltatási feltételeink szerint nem támogatott.
no-subscription-change = Sajnáljuk. Nem módosíthatja az előfizetési csomagot.
# $mobileAppStore (String) - "Google Play Store" or "App Store", localized when the translation is available.
iap-already-subscribed = Már előfizetett a(z) { $mobileAppStore } oldalon.
# $productName (String) - The name of the subscribed product.
fxa-account-signup-error-2 = Rendszerhiba miatt a(z) { $productName } regisztrációja sikertelen volt. A fizetési módja nem lett megterhelve. Próbálja újra.
fxa-post-passwordless-sub-error = Az előfizetés megerősítve, de a megerősítő oldal betöltése nem sikerült. Ellenőrizze az e-mail-címét a fiók beállításához.
newsletter-signup-error = Nem regisztrált a termékhíreket tartalmazó e-mailekre. Megpróbálhatja újra a fiókbeállításokban.
product-plan-error =
    .title = Probléma az előfizetések betöltésekor
product-profile-error =
    .title = Probléma a profil betöltésekor
product-customer-error =
    .title = Probléma az ügyfél betöltésekor
product-plan-not-found = Az előfizetés nem található
product-location-unsupported-error = A hely nem támogatott

## Hooks - coupons

coupon-success = A csomag automatikusan megújul a listaáron.
# $couponDurationDate (Date) - The date at which the coupon is no longer valid, and the subscription is billed the list price.
coupon-success-repeating = A csomag { $couponDurationDate } után automatikusan megújul listaáron.

## Routes - Checkout - New user

new-user-step-1-2 = 1. Hozzon létre egy { -product-mozilla-account }ot
new-user-card-title = Adja meg a kártyaadatait
new-user-submit = Előfizetés most

## Routes - Product and Subscriptions

sub-update-payment-title = Fizetési információk

## Routes - Product/AcceptedCards
## Used in both Routes - Checkout and Product/SubscriptionCreate

pay-with-heading-card-only = Fizessen kártyával
product-invoice-preview-error-title = Probléma a számla előnézetének betöltésekor
product-invoice-preview-error-text = Nem sikerült betölteni a számla előnézetét

## Routes - Product - IapRoadblock

subscription-iaperrorupgrade-title = Jelenleg nem tudjuk frissíteni

# The following are not terms because they are not used directly in messages,
# but rather looked up in code and passed into the message as variables.

brand-name-google-play-2 = { -google-play } Áruház
brand-name-apple-app-store-2 = { -app-store }

## Routes - Product - Subscription upgrade

product-plan-change-heading = Módosítás áttekintése
sub-change-failed = Az előfizetés módosítása sikertelen
sub-update-acknowledgment =
    A csomagja azonnal megváltozik, és a mai napon arányos összeget
    fog fizetni a számlázási időszak hátralévő részéből. A következő dátumtól
    kezdve a teljes összeg levonásra kerül: { $startingDate }.
sub-change-submit = Módosítás megerősítése
sub-update-current-plan-label = Jelenlegi előfizetés
sub-update-new-plan-label = Új előfizetés
sub-update-total-label = Új összeg
sub-update-prorated-upgrade = Időarányos csomagfrissítés

## Checkout line item for subscription plan change listing the product name and frequency of payment
## For example, a Mozilla VPN subscription charged monthly would appear as: Mozilla VPN (Monthly)
## Variables:
##   $productName (String) - Name of the upgraded product (e.g. Mozilla VPN)

sub-update-new-plan-daily = { $productName } (napi)
sub-update-new-plan-weekly = { $productName } (heti)
sub-update-new-plan-monthly = { $productName } (havi)
sub-update-new-plan-yearly = { $productName } (évi)
sub-update-prorated-upgrade-credit = A megjelenített negatív egyenleg jóváírásként jelenik meg, és a jövőbeni számlákra lesz használva.

## Routes - Subscriptions - Cancel

sub-item-cancel-sub = Előfizetés lemondása
sub-item-stay-sub = Előfizetés megtartása

## $name (String) - The name of the subscribed product.
## $period (Date) - The last day of product access

sub-item-cancel-msg =
    A számlázási periódusa utolsó napja ({ $period }) után
    nem fogja tudni használni a(z) { $name } szolgáltatást.
sub-item-cancel-confirm =
    A(z) { $name } szolgáltatás hozzáférésének lemondása,
    és az abban mentett adatok törlése ekkor: { $period }
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
sub-promo-coupon-applied = { $promotion_name } kupon felhasználva: <priceDetails></priceDetails>
subscription-management-account-credit-balance = Ez az előfizetés jóváírást eredményezett a számlaegyenlegén: <priceDetails></priceDetails>

## Routes - Subscription

sub-route-idx-reactivating = Az előfizetés újraaktiválása sikertelen
sub-route-idx-cancel-failed = Az előfizetés lemondása sikertelen
sub-route-idx-contact = Kapcsolatfelvétel az ügyfélszolgálattal
sub-route-idx-cancel-msg-title = Sajnáljuk, hogy távozik
# $name (String) - The name of the subscribed product.
# $date (Date) - Last day of product access
sub-route-idx-cancel-msg =
    A(z) { $name }-előfizetése lemondva.
          <br />
          { $date }-ig továbbra is el fogja érni a(z) { $name } szolgáltatást.
sub-route-idx-cancel-aside-2 = Kérdése van? Keresse fel a <a>{ -brand-mozilla } Támogatást</a>.

## Routes - Subscriptions - Errors

sub-customer-error =
    .title = Probléma az ügyfél betöltésekor
sub-invoice-error =
    .title = Probléma a számlák betöltésekor
sub-billing-update-success = A számlázási adatai sikeresen frissítettve
sub-invoice-previews-error-title = Probléma a számlák előnézetének betöltésekor
sub-invoice-previews-error-text = Nem sikerült betölteni a számlák előnézetét

## Routes - Subscription - ActionButton

pay-update-change-btn = Módosítás
pay-update-manage-btn = Kezelés

## Routes - Subscriptions - Cancel and IapItem
## $priceAmount (Number) - The amount billed. It will be formatted as currency.
## $taxAmount (Number) - The tax added on, not included in amount. It will be formatted as currency.
## $date (Date) - The date for the next time a charge will occur.

sub-next-bill = Következő számlázás: { $date }
sub-next-bill-due-date = A következő számla esedékessége: { $date }
sub-expires-on = Lejár: { $date }

## Routes - Subscription - PaymentUpdate


# $expirationDate (Date) - The payment card's expiration date.

pay-update-card-exp = Lejárat: { $expirationDate }
sub-route-idx-updating = Számlázási információk frissítése…
sub-route-payment-modal-heading = Érvénytelen számlázási információk
sub-route-payment-modal-message-2 = Úgy tűnik, hogy hiba történt a(z) { -brand-paypal }-fiókjával kapcsolatban, meg kell tennie a szükséges lépéseket a fizetési probléma megoldásához.
sub-route-missing-billing-agreement-payment-alert = Érvénytelen fizetési információk; hiba van a fiókjában. <div>Kezelés</div>
sub-route-funding-source-payment-alert = Érvénytelen fizetési információk; hiba van a fiókjában. Az értesítés törlése eltarthat egy ideig az adatok sikeres frissítése után. <div>Kezelés</div>

## Routes - Subscription - SubscriptionItem

sub-item-no-such-plan = Nincs ilyen csomag ennél az előfizetésnél.
invoice-not-found = Későbbi számla nem található
sub-item-no-such-subsequent-invoice = Későbbi számlák nem találhatók ehhez az előfizetéshez.
sub-invoice-preview-error-title = A számla előnézete nem található
sub-invoice-preview-error-text = A számla előnézete nem található ehhez az előfizetéshez

## Routes - Subscriptions - Reactivate
## $name (String) - The name of the subscribed product.

reactivate-confirm-dialog-header = Továbbra is szeretné ezt használni: { $name }?
# $amount (Number) - The amount billed. It will be formatted as currency.
# $last (String) - The last 4 digits of the card that will be charged
# $endDate (Date) - Last day of product access
reactivate-confirm-copy =
    A(z) { $name } hozzáférése folytatódni fog, a számlázási és
    fizetési időszaka is változatlan marad. A(z) { $last } végű kártya
    következő terhelése { $amount } lesz, ekkor: { $endDate }.
# Alternate copy used when a payment method is not available, e.g. for free trials
# $amount (Number) - The amount billed. It will be formatted as currency.
# $endDate (Date) - Last day of product access
reactivate-confirm-without-payment-method-copy =
    A(z) { $name } hozzáférése folytatódni fog, a számlázási és
    fizetési időszaka is változatlan marad. A következő
    terhelése { $amount } lesz, ekkor: { $endDate }.
reactivate-confirm-button = Előfizetés újra

## $date (Date) - Last day of product access

reactivate-panel-copy = El fogja veszíteni a hozzáférését a(z) { $name } termékhez, ekkor: <strong>{ $date }</strong>.
reactivate-success-copy = Köszönjük! Minden készen állsz.
reactivate-success-button = Bezárás

## Routes - Subscriptions - Subscription iap item

sub-iap-item-google-purchase-2 = { -brand-google }: Alkalmazáson belüli vásárlás
sub-iap-item-apple-purchase-2 = { -brand-apple }: Alkalmazáson belüli vásárlás
sub-iap-item-manage-button = Kezelés
