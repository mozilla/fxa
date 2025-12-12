loyalty-discount-terms-heading = Podmínky a omezení
loyalty-discount-terms-support = Kontaktovat podporu
# $productName (String) - The name of the product to create subscription, e.g. Mozilla VPN
loyalty-discount-terms-contact-support-product-aria = Kontaktujte podporu pro { $productName }
not-found-page-title-terms = Stránka nenalezena
not-found-page-description-terms = Stránka, kterou hledáte, neexistuje.
not-found-page-button-terms-manage-subscriptions = Spravovat odebírání

## Page

checkout-signin-or-create = 1. Přihlaste se nebo si vytvořte { -product-mozilla-account(capitalization: "lower") }
# This string appears as a separation between the two sign-in options, "Enter your email"(signin-form-email-input) "or"(this string) "Continue with Google"(continue-signin-with-google-button) / "Continue with Apple"(continue-signin-with-apple-button)
checkout-signin-options-or = nebo
continue-signin-with-google-button = Pokračovat pomocí { -brand-google }
continue-signin-with-apple-button = Pokračovat pomocí { -brand-apple }
next-payment-method-header = Vyberte způsob platby
# This message is used to indicate the second step in a multi step process.
payment-method-header-second-step-next = 2. { next-payment-method-header }
next-payment-method-first-approve = Nejprve musíte schválit své předplatné
# $productName (String) - The name of the product to create subscription, e.g. Mozilla VPN
location-header = Vyberte svou zemi a zadejte poštovní směrovací číslo, <p>abyste pokračovali v nákupu produktu { $productName }</p>
location-banner-info = Nepodařilo se nám automaticky zjistit vaši polohu
location-required-disclaimer = Tyto informace používáme pouze pro výpočet daní a měny.
location-banner-currency-change = Změna měny není podporována. Pro pokračování zvolte zemi, která odpovídá vaší aktuální měně fakturace.

## Page - Upgrade page

upgrade-page-payment-information = Informace o platbě
# $nextInvoiceDate (number) - The date of the next invoice
upgrade-page-acknowledgment = Váš tarif se okamžitě změní a po zbytek tohoto zúčtovacího období vám bude účtována poměrná částka. Od { $nextInvoiceDate } vám bude účtována plná částka.

## Authentication Error page

auth-error-page-title = Přihlášení se nezdařilo
checkout-error-boundary-retry-button = Zkusit znovu
checkout-error-boundary-basic-error-message = Něco se pokazilo. Zkuste to znovu nebo <contactSupportLink>kontaktujte podporu</contactSupportLink>.
amex-logo-alt-text = Logo { -brand-amex }
diners-logo-alt-text = Logo { -brand-diner }
discover-logo-alt-text = Logo { -brand-discover }
jcb-logo-alt-text = Logo { -brand-jcb }
mastercard-logo-alt-text = Logo { -brand-mastercard }
paypal-logo-alt-text = Logo { -brand-paypal }
unionpay-logo-alt-text = Logo { -brand-unionpay }
visa-logo-alt-text = Logo { -brand-visa }
# Alt text for generic payment card logo
unbranded-logo-alt-text = Nebrandové logo
link-logo-alt-text = Logo { -brand-link }
apple-pay-logo-alt-text = Logo { -brand-apple-pay }
google-pay-logo-alt-text = Logo { -brand-google-pay }

## Error pages - /checkout and /upgrade
## Common strings used in multiple pages

next-payment-error-manage-subscription-button = Správa předplatného
next-iap-blocked-contact-support = Vaše předplatné v mobilní aplikaci je v konfliktu s tímto produktem — kontaktujte prosím podporu, abychom vám mohli pomoci.
next-payment-error-retry-button = Zkusit znovu
next-basic-error-message = Něco se pokazilo. Zkuste to prosím znovu později.
checkout-error-contact-support-button = Kontaktovat podporu
checkout-error-not-eligible = Na předplatné tohoto produktu nemáte nárok - kontaktujte prosím podporu, abychom vám mohli pomoci.
checkout-error-already-subscribed = Již jste se přihlásili k odběru tohoto produktu.
checkout-error-contact-support = Kontaktujte prosím podporu, abychom vám mohli pomoci.
cart-error-currency-not-determined = Měnu tohoto nákupu se nám nepodařilo určit, zkuste to prosím znovu.
checkout-processing-general-error = Při zpracování vaší platby došlo k neočekávané chybě, zkuste to prosím znovu.
cart-total-mismatch-error = Fakturovaná částka se změnila. Zkuste to prosím znovu.

## Error pages - Payment method failure messages

intent-card-error = Vaši transakci se nepodařilo zpracovat. Zkontrolujte prosím zadané údaje o své kartě a zkuste to znovu.
intent-expired-card-error = Vypadá to, že platnost vaší karty vypršela. Zkuste použít jinou.
intent-payment-error-try-again = Autorizace vaší platby se nezdařila. Zkuste to prosím znovu nebo kontaktujte vydavatele vaší karty.
intent-payment-error-get-in-touch = Autorizace vaší platby se nezdařila. Kontaktujte prosím vydavatele vaší karty.
intent-payment-error-generic = Při zpracování platby došlo k neočekávané chybě, zkuste to prosím znovu.
intent-payment-error-insufficient-funds = Vypadá to, že na vaší kartě není dostatek prostředků. Zkuste použít jinou.
general-paypal-error = Při zpracování platby došlo k neočekávané chybě, zkuste to prosím znovu.
paypal-active-subscription-no-billing-agreement-error = Vypadá to, že došlo k problému s účtováním vašeho účtu { -brand-paypal }. Znovu prosím povolte automatické platby za předplatné.

## Processing page and Needs Input page - /checkout and /upgrade
## Common strings used in multiple pages

next-payment-processing-message = Počkejte prosím na zpracování vaší platby…

## Success page - /checkout and /upgrade
## Common strings used in multiple checkout pages

next-payment-confirmation-thanks-heading-account-exists = Děkujeme. Nyní zkontrolujte svou e-mailovou schránku.
# $email (String) - The user's email.
payment-confirmation-thanks-subheading-account-exists-2 = Na adresu { $email } obdržíte e-mail s pokyny k předplatnému a informacemi k platbě.
next-payment-confirmation-order-heading = Detaily objednávky
# $invoiceNumber (String) - Invoice number of the successful payment
next-payment-confirmation-invoice-number = Faktura č. { $invoiceNumber }
# $invoiceDate (Date) - Start date of the latest invoice
next-payment-confirmation-invoice-date = { $invoiceDate }
next-payment-confirmation-details-heading-2 = Platební informace

## Success pages (/checkout and /upgrade)
## Common strings used in multiple checkout pages

next-payment-confirmation-download-button = Pokračovat ke stažení

## Success pages (/checkout and /upgrade), Start page (/upgrade)
## Common strings used in multiple checkout pages

# $last4 (Number) - Last four numbers of credit card
next-payment-confirmation-cc-card-ending-in = Karta končící na { $last4 }

## Not found page

not-found-title-subscriptions = Předplatné nebylo nalezeno
not-found-description-subscriptions = Vaše předplatné se nepodařilo najít. Zkuste to znovu nebo kontaktujte podporu.
not-found-button-back-to-subscriptions = Zpět na předplatné

## Page - Subscription Management

subscription-management-page-banner-warning-title-no-payment-method = Nebyla přidána žádná platební metoda
subscription-management-page-banner-warning-link-no-payment-method = Přidat platební metodu
subscription-management-subscriptions-heading = Předplatné
# Heading for mobile only quick links menu
subscription-management-jump-to-heading = Přejít na
subscription-management-nav-payment-details = Detaily platby
subscription-management-nav-active-subscriptions = Aktivní předplatná
subscription-management-payment-details-heading = Detaily platby
subscription-management-email-label = E-mail
subscription-management-credit-balance-label = Zůstatek kreditu
subscription-management-credit-balance-message = Kredit bude automaticky použit na budoucí faktury
subscription-management-payment-method-label = Způsob platby
subscription-management-button-add-payment-method-aria = Přidat platební metodu
subscription-management-button-add-payment-method = Přidat
subscription-management-page-warning-message-no-payment-method = Přidejte prosím platební metodu, aby nedošlo k přerušení vašich předplatných.
subscription-management-button-manage-payment-method-aria = Správa platební metody
subscription-management-button-manage-payment-method = Správa
# $last4 (String) - Last four numbers of credit card
subscription-management-card-ending-in = Karta končící na { $last4 }
# $expirationDate (Date) - Payment card's expiration date
subscription-management-card-expires-date = Konec platnosti { $expirationDate }
subscription-management-active-subscriptions-heading = Aktivní předplatná
subscription-management-you-have-no-active-subscriptions = Nemáte žádná aktivní předplatná
subscription-management-new-subs-will-appear-here = Zde se zobrazí nová předplatná.
subscription-management-your-active-subscriptions-aria = Vaše aktivní předplatná
subscription-management-button-support = Získat pomoc
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscription-management-button-support-aria = Získat pomoc pro { $productName }
subscription-management-your-apple-iap-subscriptions-aria = Vaše předplatná v aplikaci { -brand-apple }
subscription-management-apple-in-app-purchase-2 = Nákup v aplikaci { -brand-apple }
subscription-management-your-google-iap-subscriptions-aria = Vaše předplatná v aplikaci { -brand-google }
subscription-management-google-in-app-purchase-2 = Nákup v aplikaci { -brand-google }
# $date (String) - Date of next bill
subscription-management-iap-sub-expires-on-expiry-date = Vyprší dne { $date }
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscription-management-button-manage-subscription-aria = Spravovat předplatné pro { $productName }
subscription-management-button-manage-subscription-1 = Spravovat předplatné
error-payment-method-banner-title-expired-card = Platnost karty skončila
error-payment-method-banner-message-add-new-card = Abyste se vyhnuli přerušení svých předplatných, přidejte novou kartu nebo platební metodu.
error-payment-method-banner-label-update-payment-method = Aktualizovat platební metodu
error-payment-method-expired-card = Platnost vaší karty vypršela. Aby se předešlo přerušení vašich předplatných, přidejte prosím novou kartu nebo platební metodu.
error-payment-method-banner-title-invalid-payment-information = Neplatné platební údaje
error-payment-method-banner-message-account-issue = U vašeho účtu se vyskytl problém.
subscription-management-button-manage-payment-method-1 = Správa platební metody
subscription-management-error-apple-pay = U vašeho účtu { -brand-apple-pay } se vyskytl problém. Chcete-li zachovat vaše aktivní předplatná, vyřešte prosím problém.
subscription-management-error-google-pay = U vašeho účtu { -brand-google-pay } se vyskytl problém. Chcete-li zachovat vaše aktivní předplatná, vyřešte prosím problém.
subscription-management-error-link = U vašeho účtu { -brand-link } se vyskytl problém. Chcete-li zachovat vaše aktivní předplatná, vyřešte prosím problém.
subscription-management-error-paypal-billing-agreement = U vašeho účtu { -brand-paypal } se vyskytl problém. Chcete-li zachovat vaše aktivní předplatná, vyřešte prosím problém.
subscription-management-error-payment-method = Vyskytl se problém s vaší platební metodou. Chcete-li zachovat vaše aktivní předplatná, vyřešte prosím problém.
manage-payment-methods-heading = Spravovat platební metody
paypal-payment-management-page-invalid-header = Neplatné platební údaje
paypal-payment-management-page-invalid-description = Zdá se, že ve vašem účtu { -brand-paypal } došlo k chybě. Je potřeba, abyste podnikli nezbytné kroky k vyřešení tohoto problému s platbou.
# Page - Not Found
page-not-found-title = Stránka nenalezena
page-not-found-description = Požadovaná stránka nebyla nalezena. Byli jsme upozorněni a všechny odkazy, které mohou být nefunkční, opravíme.
page-not-found-back-button = Zpátky
alert-dialog-title = Dialog upozornění

## Navigation breadcrumbs

# Link title - Account settings
subscription-management-breadcrumb-account-home = Domovská stránka účtu
# Link title - Subscriptions management
subscription-management-breadcrumb-subscriptions = Předplatné
# Link title - Payment method management
subscription-management-breadcrumb-payment-2 = Správa platebních metod
# $page refers to page titles used in the breadcrumb menu (e.g. Account Home, Subscriptions, Payment Methods)
subscription-management-breadcrumb-back-aria = Přejít zpět na { $page }

## CancelSubscription

subscription-cancellation-dialog-title = Je nám líto, že odcházíte
# $name (String) - The name of the subscribed product.
# $date (Date) - Last day of product access
subscription-cancellation-dialog-msg = Vaše předplatné { $name } bylo zrušeno. Stále vám zůstane přístup k { $name } do { $date }.
subscription-cancellation-dialog-aside = Máte otázky? Navštivte <LinkExternal>podporu { -brand-mozilla }</LinkExternal>.
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
cancel-subscription-heading = Zrušit předplatné { $productName }

## $currentPeriodEnd (Date) - The end date of the subscription's current billing period (e.g., September, 8, 2025)
## $productName (String) - The name of the subscribed product, e.g. Mozilla VPN

subscription-content-no-longer-use-message = Po { $currentPeriodEnd }, posledním dni vašeho fakturačního období, nebudete moci { $productName } používat.
subscription-content-cancel-access-message = Zrušit můj přístup a ukládání mých informací v průběhu { $productName } dne { $currentPeriodEnd }

## $productName (String) - The name of the subscribed product, e.g. Mozilla VPN

cancel-subscription-button-cancel-subscription = Zrušit předplatné
    .aria-label = Zrušení předplatného { $productName }
cancel-subscription-button-stay-subscribed = Zůstaňte odebíráni
    .aria-label = Předplaťte si { $productName }

## Component - Payment Consent Checkbox

next-payment-confirm-with-legal-links-static-3 = Opravňuji organizaci { -brand-mozilla } účtovat uvedenou částku na vrub mého způsobu platby, a to v souladu s <termsOfServiceLink>podmínkami poskytování služby</termsOfServiceLink> a <privacyNoticeLink>zásadami ochrany osobních údajů</privacyNoticeLink>, dokud nezruším své předplatné.
next-payment-confirm-checkbox-error = Pro pokračování je třeba toto dokončit

## Checkout Form

next-new-user-submit = Předplatit
next-payment-validate-name-error = Zadejte prosím své jméno
next-pay-with-heading-paypal = Zaplatit přes { -brand-paypal }
# Label for the Full Name input
payment-name-label = Jméno, jak je uvedeno na vaší kartě
payment-name-placeholder = Celé jméno

## Component - CouponForm

next-coupon-enter-code =
    .placeholder = Vložte kód
# Title of container where a user can input a coupon code to get a discount on a subscription.
next-coupon-promo-code = Promo kód
# Title of container showing discount coupon code applied to a subscription.
next-coupon-promo-code-applied = Promo kód byl použit
next-coupon-remove = Odebrat
next-coupon-submit = Použít

# Component - Header

payments-header-help =
    .title = Nápověda
    .aria-label = Nápověda
    .alt = Nápověda
payments-header-bento =
    .title = Produkty { -brand-mozilla }
    .aria-label = Produkty { -brand-mozilla }
    .alt = Logo { -brand-mozilla }
payments-header-bento-close =
    .alt = Zavřít
payments-header-bento-tagline = Další produkty od { -brand-mozilla(case: "gen") }, které chrání vaše soukromí
payments-header-bento-firefox-desktop = Prohlížeč { -brand-firefox } pro počítač
payments-header-bento-firefox-mobile = Prohlížeč { -brand-firefox } pro mobily
payments-header-bento-monitor = { -product-mozilla-monitor }
payments-header-bento-firefox-relay = { -product-firefox-relay }
payments-header-bento-vpn = { -product-mozilla-vpn }
payments-header-bento-made-by-mozilla = Od { -brand-mozilla(case: "gen") }
payments-header-avatar =
    .title = Nabídka { -product-mozilla-account(case: "gen", capitalization: "lower") }
payments-header-avatar-icon =
    .alt = Profilový obrázek účtu
payments-header-avatar-expanded-signed-in-as = Přihlášen(a) jako
payments-header-avatar-expanded-sign-out = Odhlásit se
payments-client-loading-spinner =
    .aria-label = Načítání…
    .alt = Načítání…

## Payment method management page - Stripe

# Save button for changing which payment method will be used
payment-method-management-save-default = Nastaveno jako výchozí způsob platby
# Save button for saving a new payment method
payment-method-management-save-method = Uložit způsob platby
manage-stripe-payments-title = Spravovat platební metody

## Payment Section

next-new-user-card-title = Zadejte informace o platební kartě

## Component - PurchaseDetails

next-plan-details-header = Informace o produktu
next-plan-details-list-price = Ceník
# $productName (String) - The name of the product, e.g. Mozilla VPN
plan-details-product-prorated-price = Poměrná cena za { $productName }
next-plan-details-tax = Daně a poplatky
next-plan-details-total-label = Celkem
# "Unused time" refers to the remaining value of the current subscription that hasn't been used yet
purchase-details-unused-time-label = Kredit z nevyužitého času
purchase-details-subtotal-label = Mezisoučet
# "Credit applied" refers to account credit used to reduce the amount due on the invoice
purchase-details-credit-applied-label = Použitý kredit
# "Total due" is the total that the customer owes after all credits, discounts, and taxes have been applied
purchase-details-total-due-label = Celková splatná částka
next-plan-details-hide-button = Skrýt podrobnosti
next-plan-details-show-button = Zobrazit podrobnosti
next-coupon-success = Váš plán se automaticky obnoví za běžnou cenu podle ceníku.
# $couponDurationDate (Date) - The date at which the coupon is no longer valid, and the subscription is billed the list price.
next-coupon-success-repeating = Vaše předplatné se po { $couponDurationDate } automaticky obnoví za běžnou cenu dle ceníku.

## Select Tax Location

select-tax-location-title = Umístění
select-tax-location-edit-button = Upravit
select-tax-location-save-button = Uložit
select-tax-location-continue-to-checkout-button = Pokračovat k pokladně
select-tax-location-country-code-label = Země
select-tax-location-country-code-placeholder = Vyberte svou zemi
select-tax-location-error-missing-country-code = Vyberte prosím svou zemi
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN
select-tax-location-product-not-available = { $productName } není v této lokalitě k dispozici.
select-tax-location-postal-code-label = PSČ
select-tax-location-postal-code =
    .placeholder = Zadejte své poštovní směrovací číslo
select-tax-location-error-missing-postal-code = Zadejte prosím své poštovní směrovací číslo
select-tax-location-error-invalid-postal-code = Zadejte prosím platné poštovní směrovací číslo
select-tax-location-successfully-updated = Vaše poloha byla aktualizována.
select-tax-location-error-location-not-updated = Vaši polohu nelze aktualizovat. Zkuste to prosím znovu.
#  $currencyDisplayName (String) - The display name of a currency code, e.g. US Dollar
select-tax-location-invalid-currency-change = Platby pro váš účet jsou v jazyce { $currencyDisplayName }. Vyberte zemi, která používá { $currencyDisplayName }.
select-tax-location-invalid-currency-change-default = Zvolte zemi, která odpovídá měně vašich aktivních předplatných.
select-tax-location-new-tax-rate-info = Aktualizací adresy se nová sazba daně použije na všechna aktivní předplatná ve vašem účtu, počínaje příštím fakturačním obdobím.
signin-form-continue-button = Pokračovat
signin-form-email-input = Zadejte svoji e-mailovou adresu
signin-form-email-input-missing = Zadejte prosím svou e-mailovou adresu
signin-form-email-input-invalid = Zadejte prosím platný e-mail
next-new-user-subscribe-product-updates-mdnplus = Chci dostávat produktové novinky a aktualizace od { -product-mdn-plus } a { -brand-mozilla(case: "loc") }
next-new-user-subscribe-product-updates-mozilla = Chci dostávat produktové novinky o { -brand-mozilla(case: "loc") }
next-new-user-subscribe-product-updates-snp = Chci dostávat novinky a aktualizace týkající se zabezpečení a ochrany osobních údajů od { -brand-mozilla(case: "loc") }
next-new-user-subscribe-product-assurance = Vaši e-mailovou adresu použijeme pouze k založení vašeho účtu. Nikdy ne neprodáme žádné třetí straně.

## $productName (String) - The name of the subscribed product.

resubscribe-dialog-title = Chcete i nadále používat { $productName }?
stay-subscribed-access-will-continue = Váš přístup k produktu { $productName } bude pokračovat a váš fakturační cyklus a platba zůstanou beze změny.
subscription-content-button-resubscribe = Obnovit předplatné
    .aria-label = Obnovit předplatné { $productName }
resubscribe-success-dialog-title = Děkujeme! Vše máte nastaveno.

## $nextInvoiceTotal (String) - The total amount of the next invoice, formatted according to the user's locale and currency.
## $taxDue (String) - The tax amount of the next invoice, formatted according to the user's locale and currency.
## $last4 (String) - The last four digits of the default payment method card.
## $currentPeriodEnd (Date) - The date of the next charge.

stay-subscribed-next-charge-with-tax = Vaše další platba bude { $nextInvoiceTotal } + { $taxDue } daň dne { $currentPeriodEnd }.
stay-subscribed-next-charge-no-tax = Příští platba { $nextInvoiceTotal } vám bude účtována dne { $currentPeriodEnd }.

## $billOnDate (Date) - The billing date of the current invoice (e.g., September 8, 2025)
## $creditApplied (Number) - The amount from account credit balance used to reduce the amount due on the invoice
## $currentPeriodEnd (Date) - The end date of the subscription's current billing period (e.g., September, 8, 2025)
## $invoiceTotal (Number) - The amount billed (excluding tax if tax does not exist). It will be formatted as currency.
## $nextBillDate (Date) - The date for the next time a charge will occur (e.g., September 8, 2025)
## $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
## $promotionName (String) - The name of the promotion.
## $taxDue (Number) - The tax added on, not included in amount. It will be formatted as currency.

subscription-content-coupon-will-be-applied = Bude uplatněna sleva { $promotionName }
# • is acting as a separator between "Last bill" and the billing date.
subscription-content-last-bill = Poslední faktura • { $billedOnDate }
subscription-content-last-bill-with-tax = { $invoiceTotal } + { $taxDue } daň
subscription-content-last-bill-no-tax = { $invoiceTotal }
subscription-content-view-invoice = Zobrazit fakturu
subscription-management-link-view-invoice-aria = Zobrazit fakturu za { $productName }
subscription-content-expires-on-expiry-date = Vyprší dne { $date }
# • is acting as a separator between "Next bill" and the next billing date.
subscription-content-next-bill = Další faktura • { $billedOnDate }
subscription-content-next-bill-with-tax-1 = { $nextInvoiceTotal } + { $taxDue } daň
subscription-content-next-bill-no-tax-1 = { $nextInvoiceTotal }
subscription-content-button-stay-subscribed = Zachovat předplatné
    .aria-label = Zachovejte si předplatné produktu { $productName }
subscription-content-button-cancel-subscription = Zrušit předplatné
    .aria-label = Zrušení předplatného { $productName }

##

dialog-close = Zavřít dialog
button-back-to-subscriptions = Zpět na předplatné
subscription-content-cancel-action-error = Došlo k neočekávané chybě. Zkuste to prosím znovu.

## PriceInterval - shared by multiple components, including Details and PurchaseDetails
## $amount (Number) - The amount billed. It will be formatted as currency.

plan-price-interval-daily = { $amount } denně
plan-price-interval-weekly = { $amount } týdně
plan-price-interval-monthly = { $amount } měsíčně
plan-price-interval-halfyearly = { $amount } každých 6 měsíců
plan-price-interval-yearly = { $amount } ročně

## Component - SubscriptionTitle

next-subscription-create-title = Nastavení předplatného
next-subscription-success-title = Potvrzení předplatného
next-subscription-processing-title = Potvrzování předplatného…
next-subscription-error-title = Potvrzení předplatného se nezdařilo…
subscription-title-sub-exists = Již jste se přihlásili k odběru
subscription-title-plan-change-heading = Zkontrolujte změnu předplatného
subscription-title-not-supported = Tato změna předplatného není podporována
next-sub-guarantee = 30denní záruka vrácení peněz

## Component - TermsAndPrivacy

# "Mozilla Accounts" is capitalized in this instance for title case in English
# This heading is followed by links to Terms of Service and Privacy Notice
next-subplat-mozilla-accounts-legal-heading = { -product-mozilla-accounts(capitalization: "uppercase") }
next-terms = Podmínky služby
next-privacy = Zásady ochrany osobních údajů
next-terms-download = Stáhnout podmínky
terms-and-privacy-stripe-label = { -brand-mozilla } používá pro bezpečné zpracování plateb službu { -brand-name-stripe }.
terms-and-privacy-stripe-link = Zásady ochrany osobních údajů služby { -brand-name-stripe }
terms-and-privacy-paypal-label = { -brand-mozilla } používá pro bezpečné zpracování plateb { -brand-paypal }.
terms-and-privacy-paypal-link = Zásady ochrany osobních údajů pro službu { -brand-paypal }
terms-and-privacy-stripe-and-paypal-label = { -brand-mozilla } používá pro bezpečné zpracování plateb { -brand-name-stripe } a { -brand-paypal }.

## Component - UpdatedPurchaseDetails

upgrade-purchase-details-current-plan-label = Stávající předplatné
upgrade-purchase-details-new-plan-label = Nový plán
upgrade-purchase-details-promo-code = Promo kód
upgrade-purchase-details-tax-label = Daně a poplatky
# "Credit issued to account" refers to credit that will be added to the account balance that will be used toward future invoices
upgrade-purchase-details-credit-to-account = Peníze připsány na účet
upgrade-purchase-details-credit-will-be-applied = Kredit bude připsán k vašemu účtu a použit k úhradě budoucích faktur.

## $productName (String) - Name of the upgraded product (e.g. Mozilla VPN)
## Daily/Weekly/Monthly/Yearly refers to the subscription interval/amount of time between billing occurrences

upgrade-purchase-details-new-plan-daily = { $productName } (denně)
upgrade-purchase-details-new-plan-weekly = { $productName } (týdně)
upgrade-purchase-details-new-plan-monthly = { $productName } (měsíčně)
upgrade-purchase-details-new-plan-halfyearly = { $productName } (6 měsíců)
upgrade-purchase-details-new-plan-yearly = { $productName } (ročně)

## Page Metadata Information
## $productTitle (String) - The name of the product to create subscription, e.g. Mozilla VPN

# Checkout start
metadata-title-checkout-start = Pokladna | { $productTitle }
metadata-description-checkout-start = Pro dokončení nákupu zadejte své platební údaje.
# Checkout processing
metadata-title-checkout-processing = Probíhá zpracování | { $productTitle }
metadata-description-checkout-processing = Počkejte prosím na dokončení vaší platby.
# Checkout error
metadata-title-checkout-error = Chyba | { $productTitle }
metadata-description-checkout-error = Při zpracování vašeho předplatného nastala chyba. Pokud problém přetrvává, kontaktujte podporu.
# Checkout success
metadata-title-checkout-success = Úspěch | { $productTitle }
metadata-description-checkout-success = Gratulujeme! Úspěšně jste dokončili svůj nákup.
# Checkout needs_input
metadata-title-checkout-needs-input = Je vyžadována akce | { $productTitle }
metadata-description-checkout-needs-input = Pro provedení platby vyplňte požadovanou akci.
# Upgrade start
metadata-title-upgrade-start = Aktualizace | { $productTitle }
metadata-description-upgrade-start = Pro dokončení aktualizace zadejte své platební údaje.
# Upgrade processing
metadata-title-upgrade-processing = Probíhá zpracování | { $productTitle }
metadata-description-upgrade-processing = Počkejte prosím na dokončení vaší platby.
# Upgrade error
metadata-title-upgrade-error = Chyba | { $productTitle }
metadata-description-upgrade-error = Při zpracování aktualizace nastala chyba. Pokud problém přetrvává, kontaktujte podporu.
# Upgrade success
metadata-title-upgrade-success = Úspěch | { $productTitle }
metadata-description-upgrade-success = Gratulujeme! Úspěšně jste dokončili aktualizaci.
# Upgrade needs_input
metadata-title-upgrade-needs-input = Je vyžadována akce | { $productTitle }
metadata-description-upgrade-needs-input = Pokud chcete pokračovat v platbě, vykonejte požadované kroky.
# Default
metadata-title-default = Stránka nebyla nalezena | { $productTitle }
metadata-description-default = Požadovaná stránka nebyla nalezena.

## Coupon Error Messages

next-coupon-error-cannot-redeem = Zadaný kód nelze uplatnit — váš účet má dříve předplacenou některou z našich služeb.
next-coupon-error-expired = Platnost zadaného kódu vypršela.
next-coupon-error-generic = Při zpracování kódu došlo k chybě. Zkuste to prosím znovu.
next-coupon-error-invalid = Zadaný kód je neplatný.
# "Limit" refers to the maximum number of times a coupon can be redeemed.
next-coupon-error-limit-reached = Limit kódu, který jste zadali, už byl vyčerpán.

## Stay Subscribed Error Messages

stay-subscribed-error-expired = Platnost této nabídky vypršela.
stay-subscribed-error-discount-used = Slevový kód byl již uplatněn.
# $productTitle (String) - The name of the product
stay-subscribed-error-not-current-subscriber = Tato sleva je dostupná pouze pro stávající předplatitele produktu { $productTitle }.
stay-subscribed-error-still-active = Vaše předplatné produktu { $productTitle } je stále aktivní.
stay-subscribed-error-general = Při obnovení vašeho předplatného došlo k chybě.
