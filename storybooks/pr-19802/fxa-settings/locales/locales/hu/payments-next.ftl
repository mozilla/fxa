loyalty-discount-terms-heading = Feltételek és korlátozások
loyalty-discount-terms-support = Kapcsolatfelvétel az ügyfélszolgálattal
# $productName (String) - The name of the product to create subscription, e.g. Mozilla VPN
loyalty-discount-terms-contact-support-product-aria = Lépjen kapcsolatba az ügyfélszolgálattal – { $productName }
not-found-page-title-terms = Az oldal nem található
not-found-page-description-terms = A keresett oldal nem létezik.
not-found-page-button-terms-manage-subscriptions = Feliratkozások kezelése

## Page

checkout-signin-or-create = 1. Jelentkezzen be vagy hozzon létre egy { -product-mozilla-account }ot
# This string appears as a separation between the two sign-in options, "Enter your email"(signin-form-email-input) "or"(this string) "Continue with Google"(continue-signin-with-google-button) / "Continue with Apple"(continue-signin-with-apple-button)
checkout-signin-options-or = vagy
continue-signin-with-google-button = Folytatás a { -brand-google }-lel
continue-signin-with-apple-button = Folytatás az { -brand-apple }-lel
next-payment-method-header = Válassza ki a fizetési módot
# This message is used to indicate the second step in a multi step process.
payment-method-header-second-step-next = 2. { next-payment-method-header }
next-payment-method-first-approve = Először jóvá kell hagynia az előfizetését
# $productName (String) - The name of the product to create subscription, e.g. Mozilla VPN
location-header = Válassza ki az országot, és adja meg az irányítószámát, <p> hogy folytassa a(z) { $productName } kifizetését</p>
location-banner-info = Nem tudtuk automatikusan észlelni a tartózkodási helyét.
location-required-disclaimer = Ezeket az információkat csak az adók és a pénznem kiszámításához használjuk.
location-banner-currency-change = A pénznem módosítása nem támogatott. A folytatáshoz válasszon egy országot, amely megegyezik a jelenlegi számlázási pénznemével.

## Page - Upgrade page

upgrade-page-payment-information = Fizetési információk
# $nextInvoiceDate (number) - The date of the next invoice
upgrade-page-acknowledgment =
    A csomagja azonnal megváltozik, és a mai napon arányos összeget fog fizetni a számlázási időszak hátralévő részéből. A következő dátumtól
    kezdve a teljes összeg levonásra kerül: { $nextInvoiceDate }.

## Authentication Error page

auth-error-page-title = Nem tudtuk bejelentkeztetni
checkout-error-boundary-retry-button = Próbálja újra
checkout-error-boundary-basic-error-message = Hiba történt. Próbálja újra, vagy <contactSupportLink>lépjen kapcsolatba a támogatással.</contactSupportLink>
amex-logo-alt-text = { -brand-amex } logó
diners-logo-alt-text = { -brand-diner } logó
discover-logo-alt-text = { -brand-discover } logó
jcb-logo-alt-text = { -brand-jcb } logó
mastercard-logo-alt-text = { -brand-mastercard } logó
paypal-logo-alt-text = { -brand-paypal } logó
unionpay-logo-alt-text = { -brand-unionpay } logó
visa-logo-alt-text = { -brand-visa } logó
# Alt text for generic payment card logo
unbranded-logo-alt-text = Márka nélküli logó
link-logo-alt-text = { -brand-link } logó
apple-pay-logo-alt-text = { -brand-apple-pay } logó
google-pay-logo-alt-text = { -brand-google-pay } logó

## Error pages - /checkout and /upgrade
## Common strings used in multiple pages

next-payment-error-manage-subscription-button = Saját feliratkozások kezelése
next-iap-blocked-contact-support = Van egy mobil alkalmazáson belüli előfizetése, amely ütközik ezzel a termékkel – lépjen kapcsolatba az ügyfélszolgálattal, hogy segíthessünk.
next-payment-error-retry-button = Próbálja újra
next-basic-error-message = Hiba történt, próbálja újra később.
checkout-error-contact-support-button = Kapcsolatfelvétel az ügyfélszolgálattal
checkout-error-not-eligible = Nem jogosult arra, hogy előfizessen erre a termékre – lépjen kapcsolatba az ügyfélszolgálattal, hogy segíthessünk.
checkout-error-already-subscribed = Már előfizet erre a termékre.
checkout-error-contact-support = Lépjen kapcsolatba az ügyfélszolgálattal, hogy segíthessünk.
cart-error-currency-not-determined = Nem sikerült meghatározni a vásárlás pénznemét, próbálja újra.
checkout-processing-general-error = Váratlan hiba történt a fizetése feldolgozása során, próbálja újra.
cart-total-mismatch-error = A számla összege megváltozott. Próbálja meg újra.

## Error pages - Payment method failure messages

intent-card-error = A tranzakció nem dolgozható fel. Ellenőrizze a bankkártyaadatait, és próbálja újra.
intent-expired-card-error = Úgy tűnik, hogy a bankkártya lejárt. Próbálkozzon egy másik kártyával.
intent-payment-error-try-again = Hmm. Hiba történt a fizetés jóváhagyásakor. Próbálkozzon újra, vagy vegye fel a kapcsolatot a kártyakibocsátóval.
intent-payment-error-get-in-touch = Hmm. Hiba történt a fizetés jóváhagyásakor. Vegye fel a kapcsolatot a kártyakibocsátóval.
intent-payment-error-generic = Váratlan hiba történt a fizetése feldolgozása során, próbálja újra.
intent-payment-error-insufficient-funds = Úgy tűnik, hogy a bankkártyán kevés a fedezet. Próbálkozzon egy másik kártyával.
general-paypal-error = Váratlan hiba történt a fizetése feldolgozása során, próbálja újra.
paypal-active-subscription-no-billing-agreement-error = Úgy tűnik, probléma merült fel a { -brand-paypal } fiókja számlázásakor. Engedélyezze újra az automatikus fizetést az előfizetésénél.

## Processing page and Needs Input page - /checkout and /upgrade
## Common strings used in multiple pages

next-payment-processing-message = Várjon, amíg feldolgozzuk a fizetését…

## Success page - /checkout and /upgrade
## Common strings used in multiple checkout pages

next-payment-confirmation-thanks-heading-account-exists = Köszönjük, most pedig nézze meg az e-mailjeit!
# $email (String) - The user's email.
payment-confirmation-thanks-subheading-account-exists-2 = Az előfizetéssel és a fizetés részleteivel kapcsolatos tudnivalókat tartalmazó e-mailt kapni fog a(z) { $email } címre.
next-payment-confirmation-order-heading = Megrendelés részletei
# $invoiceNumber (String) - Invoice number of the successful payment
next-payment-confirmation-invoice-number = Számla #{ $invoiceNumber }
# $invoiceDate (Date) - Start date of the latest invoice
next-payment-confirmation-invoice-date = { $invoiceDate }
next-payment-confirmation-details-heading-2 = Fizetési információk

## Success pages (/checkout and /upgrade)
## Common strings used in multiple checkout pages

next-payment-confirmation-download-button = Tovább a letöltéshez

## Success pages (/checkout and /upgrade), Start page (/upgrade)
## Common strings used in multiple checkout pages

# $last4 (Number) - Last four numbers of credit card
next-payment-confirmation-cc-card-ending-in = { $last4 } végződésű kártya

## Not found page

not-found-title-subscriptions = Az előfizetés nem található
not-found-description-subscriptions = Nem találtuk az előfizetését. Próbálja újra, vagy lépjen kapcsolatba az ügyfélszolgálattal.
not-found-button-back-to-subscriptions = Vissza az előfizetésekhez

## Page - Subscription Management

subscription-management-page-banner-warning-title-no-payment-method = Nincs fizetési mód hozzáadva
subscription-management-page-banner-warning-link-no-payment-method = Fizetési mód hozzáadása
subscription-management-subscriptions-heading = Előfizetések
# Heading for mobile only quick links menu
subscription-management-jump-to-heading = Ugrás ide:
subscription-management-nav-payment-details = Fizetési részletek
subscription-management-nav-active-subscriptions = Aktív előfizetések
subscription-management-payment-details-heading = Fizetési részletek
subscription-management-email-label = E-mail
subscription-management-credit-balance-label = Egyenleg
subscription-management-credit-balance-message = A jóváírás automatikusan a jövőbeli számlákra lesz alkalmazva
subscription-management-payment-method-label = Fizetési mód
subscription-management-button-add-payment-method-aria = Fizetési mód hozzáadása
subscription-management-button-add-payment-method = Hozzáadás
subscription-management-page-warning-message-no-payment-method = Adjon meg egy fizetési módot, hogy elkerülje az előfizetések megszakadásait.
subscription-management-button-manage-payment-method-aria = Fizetési mód kezelése
subscription-management-button-manage-payment-method = Kezelés
# $last4 (String) - Last four numbers of credit card
subscription-management-card-ending-in = { $last4 } végződésű kártya
# $expirationDate (Date) - Payment card's expiration date
subscription-management-card-expires-date = Lejárat: { $expirationDate }
subscription-management-active-subscriptions-heading = Aktív előfizetések
subscription-management-you-have-no-active-subscriptions = Nincs aktív előfizetése
subscription-management-new-subs-will-appear-here = Az új előfizetések itt fognak megjelenni.
subscription-management-your-active-subscriptions-aria = Az aktív előfizetései
subscription-management-button-support = Segítség kérése
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscription-management-button-support-aria = Segítség ehhez: { $productName }
subscription-management-your-apple-iap-subscriptions-aria = { -brand-apple } alkalmazásbeli előfizetései
subscription-management-apple-in-app-purchase-2 = { -brand-apple } alkalmazáson belüli vásárlás
subscription-management-your-google-iap-subscriptions-aria = { -brand-google } alkalmazásbeli előfizetései
subscription-management-google-in-app-purchase-2 = { -brand-google } alkalmazáson belüli vásárlás
# $date (String) - Date of next bill
subscription-management-iap-sub-expires-on-expiry-date = Lejár: { $date }
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscription-management-button-manage-subscription-aria = { $productName } előfizetés kezelése
subscription-management-button-manage-subscription-1 = Előfizetés kezelése
error-payment-method-banner-title-expired-card = Lejárt kártya
error-payment-method-banner-message-add-new-card = Adjon hozzá új kártyát vagy fizetési módot, hogy elkerülje az előfizetések megszakadását.
error-payment-method-banner-label-update-payment-method = Fizetési mód frissítése
error-payment-method-expired-card = A kártyája lejárt. Adjon hozzá új kártyát vagy fizetési módot, hogy elkerülje az előfizetések megszakadását.
error-payment-method-banner-title-invalid-payment-information = Érvénytelen fizetési információk
error-payment-method-banner-message-account-issue = Probléma van a fiókjával.
subscription-management-button-manage-payment-method-1 = Fizetési mód kezelése
subscription-management-error-apple-pay = Probléma van az { -brand-apple-pay } fiókjával. Oldja meg a problémát, hogy megtartsa az aktív előfizetéseit.
subscription-management-error-google-pay = Probléma van a { -brand-google-pay } fiókjával. Oldja meg a problémát, hogy megtartsa az aktív előfizetéseit.
subscription-management-error-link = Probléma van a { -brand-link } fiókjával. Oldja meg a problémát, hogy megtartsa az aktív előfizetéseit.
subscription-management-error-paypal-billing-agreement = Probléma van a(z) { -brand-paypal } fiókjával. Oldja meg a problémát, hogy megtartsa az aktív előfizetéseit.
subscription-management-error-payment-method = Probléma lépett fel a fizetési módjával. Oldja meg a problémát, hogy megtartsa az aktív előfizetéseit.
manage-payment-methods-heading = Fizetési módok kezelése
paypal-payment-management-page-invalid-header = Érvénytelen számlázási információk
paypal-payment-management-page-invalid-description = Úgy tűnik, hogy hiba történt a(z) { -brand-paypal }-fiókjával kapcsolatban. Meg kell tennie a szükséges lépéseket a fizetési probléma megoldásához.
# Page - Not Found
page-not-found-title = Az oldal nem található
page-not-found-description = A kért oldal nem található. Értesítést kaptunk, és kijavítunk minden, esetleg hibás hivatkozást.
page-not-found-back-button = Ugrás vissza
alert-dialog-title = Figyelmeztető párbeszédablak

## Navigation breadcrumbs

# Link title - Account settings
subscription-management-breadcrumb-account-home = Fiók kezdőlapja
# Link title - Subscriptions management
subscription-management-breadcrumb-subscriptions = Előfizetések
# Link title - Payment method management
subscription-management-breadcrumb-payment-2 = Fizetési módok kezelése
# $page refers to page titles used in the breadcrumb menu (e.g. Account Home, Subscriptions, Payment Methods)
subscription-management-breadcrumb-back-aria = Vissza ehhez: { $page }

## CancelSubscription

subscription-cancellation-dialog-title = Sajnáljuk, hogy távozik
# $name (String) - The name of the subscribed product.
# $date (Date) - Last day of product access
subscription-cancellation-dialog-msg = Lemondta a(z) { $name }-előfizetését. { $date }-ig továbbra is el fogja érni a(z) { $name } szolgáltatást.
subscription-cancellation-dialog-aside = Kérdése van? Keresse fel a <LinkExternal>{ -brand-mozilla } támogatást</LinkExternal>.
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
cancel-subscription-heading = { $productName } előfizetés megszüntetése

## $currentPeriodEnd (Date) - The end date of the subscription's current billing period (e.g., September, 8, 2025)
## $productName (String) - The name of the subscribed product, e.g. Mozilla VPN

subscription-content-no-longer-use-message = Az utolsó számlázási periódusa után ({ $currentPeriodEnd }) nem fogja tudni használni a(z) { $productName } szolgáltatást,
subscription-content-cancel-access-message = A(z) { $productName } hozzáférésének lemondása, és az abban mentett adatok törlése ekkor: { $currentPeriodEnd }

## $productName (String) - The name of the subscribed product, e.g. Mozilla VPN

cancel-subscription-button-cancel-subscription = Előfizetés lemondása
    .aria-label = A(z) { $productName } előfizetésének megszüntetése
cancel-subscription-button-stay-subscribed = Előfizetés megtartása
    .aria-label = { $productName } előfizetés megtartása

## Component - Payment Consent Checkbox

next-payment-confirm-with-legal-links-static-3 = Felhatalmazom a { -brand-mozilla(ending: "accented") }t, hogy terhelje meg a megjelenített összeget az én fizetési módommal az <termsOfServiceLink>Szolgáltatási feltételek</termsOfServiceLink> és az <privacyNoticeLink>Adatvédelmi nyilatkozat</privacyNoticeLink> szerint, amíg le nem mondom az előfizetést.
next-payment-confirm-checkbox-error = Ezt be kell fejeznie, mielőtt továbblép

## Checkout Form

next-new-user-submit = Előfizetés most
next-pay-with-heading-paypal = Fizetés { -brand-paypal }lal

## Component - CouponForm

next-coupon-enter-code =
    .placeholder = Adja meg a kódot
# Title of container where a user can input a coupon code to get a discount on a subscription.
next-coupon-promo-code = Promóciós kód
# Title of container showing discount coupon code applied to a subscription.
next-coupon-promo-code-applied = Promóciós kód alkalmazva
next-coupon-remove = Eltávolítás
next-coupon-submit = Alkalmaz

# Component - Header

payments-header-help =
    .title = Súgó
    .aria-label = Súgó
    .alt = Súgó
payments-header-bento =
    .title = { -brand-mozilla } termékek
    .aria-label = { -brand-mozilla } termékek
    .alt = { -brand-mozilla } logó
payments-header-bento-close =
    .alt = Bezárás
payments-header-bento-tagline = A { -brand-mozilla } további termékei, amelyek védik a magánszféráját
payments-header-bento-firefox-desktop = { -brand-firefox } asztali böngésző
payments-header-bento-firefox-mobile = { -brand-firefox } mobilböngésző
payments-header-bento-monitor = { -product-mozilla-monitor }
payments-header-bento-firefox-relay = { -product-firefox-relay }
payments-header-bento-vpn = { -product-mozilla-vpn }
payments-header-bento-made-by-mozilla = A { -brand-mozilla } készítette
payments-header-avatar =
    .title = { -product-mozilla-account } menü
payments-header-avatar-icon =
    .alt = Fiók profilképe
payments-header-avatar-expanded-signed-in-as = Bejelentkezve mint
payments-header-avatar-expanded-sign-out = Kijelentkezés
payments-client-loading-spinner =
    .aria-label = Betöltés…
    .alt = Betöltés…

## Payment method management page - Stripe

# Save button for changing which payment method will be used
payment-method-management-save-default = Beállítás alapértelmezett fizetési módként
# Save button for saving a new payment method
payment-method-management-save-method = Fizetési mód mentése
manage-stripe-payments-title = Fizetési módok kezelése

## Component - PurchaseDetails

next-plan-details-header = Termék részletei
next-plan-details-list-price = Listaár
# $productName (String) - The name of the product, e.g. Mozilla VPN
plan-details-product-prorated-price = A(z) { $productName } arányos ára
next-plan-details-tax = Adók és díjak
next-plan-details-total-label = Összesen
# "Unused time" refers to the remaining value of the current subscription that hasn't been used yet
purchase-details-unused-time-label = Jóváírás a fel nem használt időből
purchase-details-subtotal-label = Részösszeg
# "Credit applied" refers to account credit used to reduce the amount due on the invoice
purchase-details-credit-applied-label = Jóváírás alkalmazva
# "Total due" is the total that the customer owes after all credits, discounts, and taxes have been applied
purchase-details-total-due-label = Teljes esedékesség
next-plan-details-hide-button = Részletek elrejtése
next-plan-details-show-button = Részletek megjelenítése
next-coupon-success = A csomag automatikusan megújul a listaáron.
# $couponDurationDate (Date) - The date at which the coupon is no longer valid, and the subscription is billed the list price.
next-coupon-success-repeating = A csomag { $couponDurationDate } után automatikusan megújul listaáron.

## Select Tax Location

select-tax-location-title = Hely
select-tax-location-edit-button = Szerkesztés
select-tax-location-save-button = Mentés
select-tax-location-continue-to-checkout-button = Tovább a fizetéshez
select-tax-location-country-code-label = Ország
select-tax-location-country-code-placeholder = Válassza ki az országot
select-tax-location-error-missing-country-code = Válassza ki az országot
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN
select-tax-location-product-not-available = A(z) { $productName } nem érhető el ezen a helyen.
select-tax-location-postal-code-label = Irányítószám
select-tax-location-postal-code =
    .placeholder = Adja meg az irányítószámát
select-tax-location-error-missing-postal-code = Adja meg az irányítószámát
select-tax-location-error-invalid-postal-code = Írjon be egy érvényes irányítószámot
select-tax-location-successfully-updated = A tartózkodási helye frissítve lett.
select-tax-location-error-location-not-updated = A hely nem frissíthető. Próbálja meg újra.
#  $currencyDisplayName (String) - The display name of a currency code, e.g. US Dollar
select-tax-location-invalid-currency-change = A fiókja számlázása { $currencyDisplayName } pénznemben történik. Válasszon egy országot, melynek pénzneme { $currencyDisplayName }.
select-tax-location-invalid-currency-change-default = Válasszon olyan országot, amely pénzneme megegyezik az aktív előfizetései pénznemével.
select-tax-location-new-tax-rate-info = A tartózkodási helyének frissítése alkalmazni fogja az új adókulcsot a fiókjában lévő összes aktív előfizetésre, a következő számlázási ciklussal kezdve.
signin-form-continue-button = Folytatás
signin-form-email-input = Adja meg az e-mail-címét
signin-form-email-input-missing = Adja meg az e-mail-címét
signin-form-email-input-invalid = Adjon meg egy érvényes e-mail-címet
next-new-user-subscribe-product-updates-mdnplus = Szeretnék termékhíreket és frissítéseket kapni az { -product-mdn-plus }-tól és a { -brand-mozilla(ending: "accented") }tól
next-new-user-subscribe-product-updates-mozilla = Szeretnék termékhíreket és újdonságokat kapni a { -brand-mozilla(ending: "accented") }tól
next-new-user-subscribe-product-updates-snp = Szeretnék biztonsági és adatvédelmi híreket kapni a { -brand-mozilla(ending: "accented") }tól
next-new-user-subscribe-product-assurance = Csak a fiókja létrehozásához használjuk az e-mail-címét. Sosem adjuk el harmadik félnek.

## $productName (String) - The name of the subscribed product.

resubscribe-dialog-title = Továbbra is szeretné ezt használni: { $productName }?
stay-subscribed-access-will-continue = A(z) { $productName } hozzáférése megmarad, a számlázási és fizetési ciklusa is változatlan marad.
subscription-content-button-resubscribe = Újbóli előfizetés
    .aria-label = Újbóli előfizetés erre: { $productName }
resubscribe-success-dialog-title = Köszönjük! Minden készen áll.

## $nextInvoiceTotal (String) - The total amount of the next invoice, formatted according to the user's locale and currency.
## $taxDue (String) - The tax amount of the next invoice, formatted according to the user's locale and currency.
## $last4 (String) - The last four digits of the default payment method card.
## $currentPeriodEnd (Date) - The date of the next charge.

stay-subscribed-next-charge-with-tax = A következő terhelés { $nextInvoiceTotal } + { $taxDue } adó lesz ekkor: { $currentPeriodEnd }.
stay-subscribed-next-charge-no-tax = A következő terhelés { $nextInvoiceTotal } lesz ekkor: { $currentPeriodEnd }.

## $billOnDate (Date) - The billing date of the current invoice (e.g., September 8, 2025)
## $creditApplied (Number) - The amount from account credit balance used to reduce the amount due on the invoice
## $currentPeriodEnd (Date) - The end date of the subscription's current billing period (e.g., September, 8, 2025)
## $invoiceTotal (Number) - The amount billed (excluding tax if tax does not exist). It will be formatted as currency.
## $nextBillDate (Date) - The date for the next time a charge will occur (e.g., September 8, 2025)
## $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
## $promotionName (String) - The name of the promotion.
## $taxDue (Number) - The tax added on, not included in amount. It will be formatted as currency.

subscription-content-coupon-will-be-applied = { $promotionName } kedvezmény lesz alkalmazva
# • is acting as a separator between "Last bill" and the billing date.
subscription-content-last-bill = Utolsó számla • { $billedOnDate }
subscription-content-last-bill-with-tax = { $invoiceTotal } + { $taxDue } adó
subscription-content-last-bill-no-tax = { $invoiceTotal }
subscription-content-view-invoice = Számla megtekintése
subscription-management-link-view-invoice-aria = { $productName } számla megtekintése
subscription-content-expires-on-expiry-date = Lejár: { $date }
# • is acting as a separator between "Next bill" and the next billing date.
subscription-content-next-bill = Következő számla • { $billedOnDate }
subscription-content-next-bill-with-tax-1 = { $nextInvoiceTotal } + { $taxDue } adó
subscription-content-next-bill-no-tax-1 = { $nextInvoiceTotal }
subscription-content-button-stay-subscribed = Előfizetés megtartása
    .aria-label = { $productName } előfizetés megtartása
subscription-content-button-cancel-subscription = Előfizetés lemondása
    .aria-label = { $productName } előfizetés megszüntetése

##

dialog-close = Párbeszédablak bezárása
button-back-to-subscriptions = Vissza az előfizetésekhez
subscription-content-cancel-action-error = Váratlan hiba történt. Próbálja meg újra.

## PriceInterval - shared by multiple components, including Details and PurchaseDetails
## $amount (Number) - The amount billed. It will be formatted as currency.

plan-price-interval-daily = { $amount } naponta
plan-price-interval-weekly = { $amount } hetente
plan-price-interval-monthly = { $amount } havonta
plan-price-interval-halfyearly = { $amount } 6 havonta
plan-price-interval-yearly = { $amount } évente

## Component - SubscriptionTitle

next-subscription-create-title = Állítsa be a feliratkozását
next-subscription-success-title = Feliratkozás megerősítése
next-subscription-processing-title = Feliratkozás megerősítése…
next-subscription-error-title = Hiba a feliratkozás megerősítésekor…
subscription-title-sub-exists = Már előfizető
subscription-title-plan-change-heading = A változtatás áttekintése
subscription-title-not-supported = Az előfizetési csomag ezen módosítása nem támogatott
next-sub-guarantee = 30 napos pénzvisszafizetési garancia

## Component - TermsAndPrivacy

# "Mozilla Accounts" is capitalized in this instance for title case in English
# This heading is followed by links to Terms of Service and Privacy Notice
next-subplat-mozilla-accounts-legal-heading = { -product-mozilla-accounts }
next-terms = A szolgáltatás feltételei
next-privacy = Adatvédelmi nyilatkozat
next-terms-download = Letöltési feltételek
terms-and-privacy-stripe-label = A { -brand-mozilla } a { -brand-name-stripe }-ot használja a biztonságos fizetésfeldolgozáshoz.
terms-and-privacy-stripe-link = A { -brand-name-stripe } adatvédelmi irányelvei
terms-and-privacy-paypal-label = A { -brand-mozilla } a { -brand-paypal }t használja a biztonságos fizetésfeldolgozáshoz.
terms-and-privacy-paypal-link = A { -brand-paypal } adatvédelmi irányelvei
terms-and-privacy-stripe-and-paypal-label = A { -brand-mozilla } a { -brand-name-stripe }-ot és a { -brand-paypal }t használja a biztonságos fizetésfeldolgozáshoz.

## Component - UpdatedPurchaseDetails

upgrade-purchase-details-current-plan-label = Jelenlegi előfizetés
upgrade-purchase-details-new-plan-label = Új előfizetés
upgrade-purchase-details-promo-code = Promóciós kód
upgrade-purchase-details-tax-label = Adók és díjak
# "Credit issued to account" refers to credit that will be added to the account balance that will be used toward future invoices
upgrade-purchase-details-credit-to-account = Jóváírás a számlán
upgrade-purchase-details-credit-will-be-applied = A jóváírás a fiókjába kerül, és a jövőbeli számlák kifizetésére lesz felhasználva.

## $productName (String) - Name of the upgraded product (e.g. Mozilla VPN)
## Daily/Weekly/Monthly/Yearly refers to the subscription interval/amount of time between billing occurrences

upgrade-purchase-details-new-plan-daily = { $productName } (napi)
upgrade-purchase-details-new-plan-weekly = { $productName } (heti)
upgrade-purchase-details-new-plan-monthly = { $productName } (havi)
upgrade-purchase-details-new-plan-halfyearly = { $productName } (6 hónapos)
upgrade-purchase-details-new-plan-yearly = { $productName } (évi)

## Page Metadata Information
## $productTitle (String) - The name of the product to create subscription, e.g. Mozilla VPN

# Checkout start
metadata-title-checkout-start = Kijelentkezés | { $productTitle }
metadata-description-checkout-start = A vásárlás befejezéséhez adja meg a fizetési adatait.
# Checkout processing
metadata-title-checkout-processing = Feldolgozás | { $productTitle }
metadata-description-checkout-processing = Várjon, amíg befejezzük a fizetés feldolgozását.
# Checkout error
metadata-title-checkout-error = Hiba | { $productTitle }
metadata-description-checkout-error = Hiba történt az előfizetés feldolgozása közben. Ha a probléma továbbra is fennáll, forduljon a támogatáshoz.
# Checkout success
metadata-title-checkout-success = Sikeres | { $productTitle }
metadata-description-checkout-success = Gratulálunk! Sikeresen befejezte a vásárlást.
# Checkout needs_input
metadata-title-checkout-needs-input = Művelet szükséges | { $productTitle }
metadata-description-checkout-needs-input = Végezze el a szükséges műveletet a fizetés folytatásához.
# Upgrade start
metadata-title-upgrade-start = Csomagváltás | { $productTitle }
metadata-description-upgrade-start = Adja meg a fizetési adatait a csomagváltás befejezéséhez.
# Upgrade processing
metadata-title-upgrade-processing = Feldolgozás | { $productTitle }
metadata-description-upgrade-processing = Várjon, amíg befejezzük a fizetés feldolgozását.
# Upgrade error
metadata-title-upgrade-error = Hiba | { $productTitle }
metadata-description-upgrade-error = Hiba történt a csomagváltás feldolgozása közben. Ha a probléma továbbra is fennáll, forduljon a támogatáshoz.
# Upgrade success
metadata-title-upgrade-success = Sikeres | { $productTitle }
metadata-description-upgrade-success = Gratulálunk! Sikeresen befejezte a csomagváltást.
# Upgrade needs_input
metadata-title-upgrade-needs-input = Művelet szükséges | { $productTitle }
metadata-description-upgrade-needs-input = Végezze el a szükséges műveletet a fizetés folytatásához.
# Default
metadata-title-default = Az oldal nem található | { $productTitle }
metadata-description-default = A kért oldal nem található.

## Coupon Error Messages

next-coupon-error-cannot-redeem = A megadott kód nem váltható be – a fiókjával korábban előfizetett az egyik szolgáltatásunkra.
next-coupon-error-expired = A megadott kód lejárt.
next-coupon-error-generic = Hiba történt a kód feldolgozása során. Próbálja újra.
next-coupon-error-invalid = A megadott kód érvénytelen.
# "Limit" refers to the maximum number of times a coupon can be redeemed.
next-coupon-error-limit-reached = A megadott kód elérte a korlátját.

## Stay Subscribed Error Messages

stay-subscribed-error-expired = Ez az ajánlat lejárt.
stay-subscribed-error-discount-used = A kedvezménykód már alkalmazva van.
# $productTitle (String) - The name of the product
stay-subscribed-error-not-current-subscriber = Ez a kedvezmény csak a jelenlegi { $productTitle } előfizetők számára érhető el.
stay-subscribed-error-still-active = A(z) { $productTitle } előfizetése még aktív.
stay-subscribed-error-general = Hiba történt az előfizetés megújításakor.
