## Page

checkout-signin-or-create = 1. Bëni hyrjen, ose krijoni një { -product-mozilla-account }
# This string appears as a separation between the two sign-in options, "Enter your email"(signin-form-email-input) "or"(this string) "Continue with Google"(continue-signin-with-google-button) / "Continue with Apple"(continue-signin-with-apple-button)
checkout-signin-options-or = ose
continue-signin-with-google-button = Vazhdoni me { -brand-google }
continue-signin-with-apple-button = Vazhdoni me { -brand-apple }
next-payment-method-header = Zgjidhni metodën tuaj të pagesës
# This message is used to indicate the second step in a multi step process.
payment-method-header-second-step-next = 2. { next-payment-method-header }
next-payment-method-first-approve = Së pari, do t’ju duhet të miratoni pajtimin tuaj
# $productName (String) - The name of the product to create subscription, e.g. Mozilla VPN
location-header = Përzgjidhni vendin tuaj dhe jepni kodin tuaj postar <p>që të kalohet te përfundimi i blerjes për { $productName }</p>
location-banner-info = S’qemë në gjendje të pikasim automatikisht vendndodhjen tuaj
location-required-disclaimer = Këto hollësi i përdorim vetëm për të llogaritur taksa dhe monedhë.
location-banner-currency-change = Ndryshim monedhe i pambuluar. Që të vazhdohet, përzgjidhni një vend që përkon me monedhën e faturimit tuaj aktual.

## Page - Upgrade page

upgrade-page-payment-information = Hollësi Pagese
# $nextInvoiceDate (number) - The date of the next invoice
upgrade-page-acknowledgment =
    Plani juaj do të ndryshojë menjëherë dhe do t’ju faturohet sot vlera e
    cila i takon pjesës së mbetur e këtij cikli faturimi. Duke filluar nga
    { $nextInvoiceDate } do t’ju faturohet vlera e plotë.

## Authentication Error page

auth-error-page-title = S’bënë Dot Futjen Tuaj Në Llogari
checkout-error-boundary-retry-button = Riprovoni
checkout-error-boundary-basic-error-message = Diç shkoi ters. Ju lutemi, riprovoni, ose <contactSupportLink>lidhuni me asistencën.</contactSupportLink>
amex-logo-alt-text = Stemë { -brand-amex }-i
diners-logo-alt-text = Stemë { -brand-diner }-i
discover-logo-alt-text = Stemë { -brand-discover }-i
jcb-logo-alt-text = Stemë { -brand-jcb }-je
mastercard-logo-alt-text = Stemë { -brand-mastercard }-i
paypal-logo-alt-text = Stemë { -brand-paypal }-i
unionpay-logo-alt-text = Stemë { -brand-unionpay }-i
visa-logo-alt-text = Stemë { -brand-visa }
# Alt text for generic payment card logo
unbranded-logo-alt-text = Stemë pa markë
link-logo-alt-text = Stemë { -brand-link }
apple-pay-logo-alt-text = Stemë { -brand-apple-pay }
google-pay-logo-alt-text = Stemë { -brand-google-pay }

## Error pages - /checkout and /upgrade
## Common strings used in multiple pages

next-payment-error-manage-subscription-button = Administroni pajtimet e mia
next-iap-blocked-contact-support = Keni një pajtim “in-app” celulari që përplaset me këtë produkt — ju lutemi, lidhuni me asistencën, që të mund t’ju ndihmojmë.
next-payment-error-retry-button = Riprovoni
next-basic-error-message = Diç shkoi ters. Ju lutemi, riprovoni.
checkout-error-contact-support-button = Lidhuni Me Asistencën
checkout-error-not-eligible = S’mund të pajtoheni te ky produkt — ju lutemi, lidhuni me asistencën, që të mund t’ju ndihmojmë.
checkout-error-already-subscribed = Jeni tashmë i pajtuar te ky produkt.
checkout-error-contact-support = Ju lutemi, lidhuni me asistencën, që të mund t’ju ndihmojmë.
cart-error-currency-not-determined = S’qemë në gjendje të përcaktojmë monedhën për këtë blerje, ju lutemi, riprovoni.
checkout-processing-general-error = Ndodhi një gabim i papritur teksa përpunohej pagesa juaj, ju lutemi, riprovoni.
cart-total-mismatch-error = Vlera e faturës ka ndryshuar. Ju lutemi, riprovoni.

## Error pages - Payment method failure messages

intent-card-error = Transaksioni juaj s’u krye dot. Ju lutemi, verifikoni të dhënat e kartës tuaj të kreditit dhe riprovoni.
intent-expired-card-error = Duket sikur karta juaj e kreditit të ketë skaduar. Provoni një kartë tjetër.
intent-payment-error-try-again = Hëm. Pati një problem me autorizimin e pagesës tuaj. Riprovoni ose lidhuni me emetuesin e kartës tuaj.
intent-payment-error-get-in-touch = Hëm. Pati një problem me autorizimin e pagesës tuaj. Lidhuni me emetuesin e kartës tuaj.
intent-payment-error-generic = Ndodhi një gabim i papritur teksa përpunohej pagesa juaj, ju lutemi, riprovoni.
intent-payment-error-insufficient-funds = Duket sikur karta juaj e kreditit ka kredit të pamjaftueshëm. Provoni një kartë tjetër.
general-paypal-error = Ndodhi një gabim i papritur teksa përpunohej pagesa juaj, ju lutemi, riprovoni.
paypal-active-subscription-no-billing-agreement-error = Duket se pati një problem me faturimin e llogarisë suaj { -brand-paypal }. Ju lutemi, riaktivizoni pagesa të automatizuara për pajtimin tuaj.

## Processing page and Needs Input page - /checkout and /upgrade
## Common strings used in multiple pages

next-payment-processing-message = Ju lutemi, pritni, teksa përpunojmë pagesën tuaj…

## Success page - /checkout and /upgrade
## Common strings used in multiple checkout pages

next-payment-confirmation-thanks-heading-account-exists = Faleminderit, tani kontrolloni email-in tuaj!
# $email (String) - The user's email.
payment-confirmation-thanks-subheading-account-exists-2 = Do të merrni një email te { $email }, me udhëzime rreth pajtimit tuaj, si dhe me hollësitë e pagesës tuaj.
next-payment-confirmation-order-heading = Hollësi porosie
# $invoiceNumber (String) - Invoice number of the successful payment
next-payment-confirmation-invoice-number = Fatura #{ $invoiceNumber }
# $invoiceDate (Date) - Start date of the latest invoice
next-payment-confirmation-invoice-date = { $invoiceDate }
next-payment-confirmation-details-heading-2 = Hollësi pagese

## Success pages (/checkout and /upgrade)
## Common strings used in multiple checkout pages

next-payment-confirmation-download-button = Vazhdoni te shkarkimi

## Success pages (/checkout and /upgrade), Start page (/upgrade)
## Common strings used in multiple checkout pages

# $last4 (Number) - Last four numbers of credit card
next-payment-confirmation-cc-card-ending-in = Kartë që përfundon me { $last4 }

## Page - Subscription Management

subscription-management-page-banner-warning-title-no-payment-method = S’u shtua metodë pagesash
subscription-management-page-banner-warning-link-no-payment-method = Shtoni një metodë pagese
subscription-management-subscriptions-heading = Pajtime
# Heading for mobile only quick links menu
subscription-management-jump-to-heading = Kaloni te
subscription-management-nav-payment-details = Hollësi pagese
subscription-management-nav-active-subscriptions = Pajtime Aktive
subscription-management-payment-details-heading = Hollësi pagese
subscription-management-email-label = Email
subscription-management-credit-balance-label = Balancë krediti
subscription-management-credit-balance-message = Krediti do të aplikohet automatikisht në faturat e ardhme
subscription-management-payment-method-label = Metodë pagesash
subscription-management-button-add-payment-method-aria = Shtoni metodë pagese
subscription-management-button-add-payment-method = Shto
subscription-management-page-warning-message-no-payment-method = Ju lutemi, shtoni një metodë pagesash, që të shmanget ndërprerje te pajtimet tuaja.
subscription-management-button-manage-payment-method-aria = Administroni metodë pagesash
subscription-management-button-manage-payment-method = Administrojini
# $last4 (String) - Last four numbers of credit card
subscription-management-card-ending-in = Kartë që përfundon me { $last4 }
# $expirationDate (Date) - Payment card's expiration date
subscription-management-card-expires-date = Skadon më { $expirationDate }
subscription-management-active-subscriptions-heading = Pajtime Aktive
subscription-management-you-have-no-active-subscriptions = S’keni pajtime aktive
subscription-management-new-subs-will-appear-here = Pajtimet e reja do të duken këtu.
subscription-management-your-active-subscriptions-aria = Pajtimet tuaja aktive
subscription-management-button-support = Merrni ndihmë
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscription-management-button-support-aria = Merrni ndihmë për { $productName }
subscription-management-your-apple-iap-subscriptions-aria = Pajtimet Tuaja { -brand-apple } In-App
subscription-management-apple-in-app-purchase-2 = Blerje që nga aplikacioni { -brand-apple }
subscription-management-your-google-iap-subscriptions-aria = Pajtimet Tuaja { -brand-google } In-App
subscription-management-google-in-app-purchase-2 = Blerje që nga aplikacioni { -brand-google }
# $date (String) - Date of next bill
subscription-management-iap-sub-expires-on-expiry-date = Skadon më { $date }
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscription-management-button-manage-subscription-aria = Administroni pajtim për { $productName }
subscription-management-button-manage-subscription-1 = Administroni pajtim
error-payment-method-banner-title-expired-card = Kartë e skaduar
error-payment-method-banner-message-add-new-card = Shtoni një kartë të re, ose metodë pagesash të re, që të shmangni ndërprerje të pajtimeve tuaja.
error-payment-method-banner-label-update-payment-method = Përditësoni metodë pagesash
error-payment-method-expired-card = Karta juaj ka skaduar. Shtoni një kartë të re, ose metodë pagesash të re, që të shmangni ndërprerje të pajtimeve tuaja.
error-payment-method-banner-title-invalid-payment-information = Informacion i pavlefshëm pagese
error-payment-method-banner-message-account-issue = Ka një problem me llogarinë tuaj.
subscription-management-button-manage-payment-method-1 = Administroni metodë pagesash
subscription-management-error-apple-pay = Ka një problem me llogarinë tuaj { -brand-apple-pay }. Ju lutemi, zgjidhni problemin, që të mbahen pajtimet tuaja aktive.
subscription-management-error-google-pay = Ka një problem me llogarinë tuaj { -brand-google-pay }. Ju lutemi, zgjidhni problemin, që të mbahen pajtimet tuaja aktive.
subscription-management-error-link = Ka një problem me llogarinë tuaj { -brand-link }. Ju lutemi, zgjidhni problemin, që të mbahen pajtimet tuaja aktive.
subscription-management-error-paypal-billing-agreement = Ka një problem me llogarinë tuaj { -brand-paypal }. Ju lutemi, zgjidhni problemin, që të mbahen pajtimet tuaja aktive.
subscription-management-error-payment-method = Ka një problem me metodën tuaj të pagesave. Ju lutemi, zgjidhni problemin, që të mbahen pajtimet tuaja aktive.
manage-payment-methods-heading = Administroni metoda pagesash
paypal-payment-management-page-invalid-header = Hollësi faturimi të pavlefshme
paypal-payment-management-page-invalid-description = Duket të ketë një gabim me llogarinë tuaj { -brand-paypal }. Duam që të ndërmerrni hapat e nevojshëm për të zgjidhur këtë problem pagese.
# Page - Not Found
page-not-found-title = S’u gjet faqe
page-not-found-description = Faqja që kërkuat nuk u gjet. E kemi mbajtur shënim dhe do të ndreqim çfarëdo lidhje që mund të jetë e dëmtuar.
page-not-found-back-button = Kthehu Mbrapsht
alert-dialog-title = Dialog sinjalizimi

## Navigation breadcrumbs

# Link title - Account settings
subscription-management-breadcrumb-account-home = Kreu i Llogarive
# Link title - Subscriptions management
subscription-management-breadcrumb-subscriptions = Pajtime
# Link title - Payment method management
subscription-management-breadcrumb-payment-2 = Administroni Metoda Pagesash
# $page refers to page titles used in the breadcrumb menu (e.g. Account Home, Subscriptions, Payment Methods)
subscription-management-breadcrumb-back-aria = Shkoni mbrapsht te { $page }

## CancelSubscription

subscription-cancellation-dialog-title = Na vjen keq t’ju shohim të largoheni
# $name (String) - The name of the subscribed product.
# $date (Date) - Last day of product access
subscription-cancellation-dialog-msg = Pajtimi juaj në { $name } është anuluar. Do të mund të përdorni ende { $name } deri më { $date }.
subscription-cancellation-dialog-aside = Keni pyetje? Vizitoni <LinkExternal>{ -brand-mozilla } Asistencën</LinkExternal>.

## $currentPeriodEnd (Date) - The end date of the subscription's current billing period (e.g., September, 8, 2025)
## $productName (String) - The name of the subscribed product, e.g. Mozilla VPN

subscription-content-no-longer-use-message = Pas { $currentPeriodEnd }, dita e fundit e ciklit tuaj të faturimit, s’do të jeni në gjendje të përdorni { $productName }.
subscription-content-cancel-access-message = Më { $currentPeriodEnd }, anuloni hyrjen time dhe të dhëna të miat të ruajtura brenda { $productName }

## Component - Payment Consent Checkbox

next-payment-confirm-with-legal-links-static-3 = E autorizoj { -brand-mozilla } të faturojë metodën time të pagesave me vlerën e treguar, sipas <termsOfServiceLink>Kushteve të Shërbimit</termsOfServiceLink> dhe <privacyNoticeLink>Shënim Privatësie</privacyNoticeLink>, deri sa ta anuloj pajtimin tim.
next-payment-confirm-checkbox-error = Lypset të plotësoni këtë, para se ecni më tej

## Checkout Form

next-new-user-submit = Pajtohuni Tani
next-payment-validate-name-error = Ju lutemi, jepni emrin tuaj
next-pay-with-heading-paypal = Paguani me { -brand-paypal }
# Label for the Full Name input
payment-name-label = Emër, siç duket te karta juaj
payment-name-placeholder = Emër i Plotë

## Component - CouponForm

next-coupon-enter-code =
    .placeholder = Jepni Kod
# Title of container where a user can input a coupon code to get a discount on a subscription.
next-coupon-promo-code = Kod Promocional
# Title of container showing discount coupon code applied to a subscription.
next-coupon-promo-code-applied = U aplikua Kod Promocional
next-coupon-remove = Hiqe
next-coupon-submit = Zbatoje

# Component - Header

payments-header-help =
    .title = Ndihmë
    .aria-label = Ndihmë
    .alt = Ndihmë
payments-header-bento =
    .title = Produkte { -brand-mozilla }
    .aria-label = Produkte { -brand-mozilla }
    .alt = Stemë { -brand-mozilla }
payments-header-bento-close =
    .alt = Mbylle
payments-header-bento-tagline = Më tepër produkte nga { -brand-mozilla } që mbrojnë privatësinë tuaj
payments-header-bento-firefox-desktop = Shfletuesi { -brand-firefox } për Desktop
payments-header-bento-firefox-mobile = Shfletuesi { -brand-firefox } për Celular
payments-header-bento-monitor = { -product-mozilla-monitor }
payments-header-bento-firefox-relay = { -product-firefox-relay }
payments-header-bento-vpn = { -product-mozilla-vpn }
payments-header-bento-made-by-mozilla = Krijuar nga { -brand-mozilla }
payments-header-avatar =
    .title = Menu { -product-mozilla-account }
payments-header-avatar-icon =
    .alt = Foto profili llogarie
payments-header-avatar-expanded-signed-in-as = Futur si
payments-header-avatar-expanded-sign-out = Dilni
payments-client-loading-spinner =
    .aria-label = Po ngarkohet…
    .alt = Po ngarkohet…

## Payment method management page - Stripe

# Save button for changing which payment method will be used
payment-method-management-save-default = Vëre si metodë parazgjedhje pagesash
# Save button for saving a new payment method
payment-method-management-save-method = Ruaje metodën e pagesave
manage-stripe-payments-title = Administroni metoda pagesash

## Payment Section

next-new-user-card-title = Jepni hollësitë e kartës tuaj

## Component - PurchaseDetails

next-plan-details-header = Hollësi produkti
next-plan-details-list-price = Çmim Liste
next-plan-details-tax = Taksa dhe Tarifa
next-plan-details-total-label = Gjithsej
# "Unused time" refers to the remaining value of the current subscription that hasn't been used yet
purchase-details-unused-time-label = Kredit nga kohë e papërdorur
purchase-details-subtotal-label = Nënshumë
# "Credit applied" refers to account credit used to reduce the amount due on the invoice
purchase-details-credit-applied-label = Krediti u aplikua
# "Total due" is the total that the customer owes after all credits, discounts, and taxes have been applied
purchase-details-total-due-label = Detyrim gjithsej
next-plan-details-hide-button = Fshihi hollësitë
next-plan-details-show-button = Shfaq hollësi
next-coupon-success = Plani juaj do të rinovohet vetvetiu me çmimin e treguar te lista.
# $couponDurationDate (Date) - The date at which the coupon is no longer valid, and the subscription is billed the list price.
next-coupon-success-repeating = Plani juaj do të rinovohet vetvetiu pas { $couponDurationDate } sipas çmimit të rregullt.

## Select Tax Location

select-tax-location-title = Vendndodhje
select-tax-location-edit-button = Përpunoni
select-tax-location-save-button = Ruaje
select-tax-location-continue-to-checkout-button = Vazhdoni te përfundimi i blerjes
select-tax-location-country-code-label = Vend
select-tax-location-country-code-placeholder = Përzgjidhni vendin tuaj
select-tax-location-error-missing-country-code = Ju lutemi, përzgjidhni vendin tuaj
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN
select-tax-location-product-not-available = { $productName } s’është i passhëm në këtë vendndodhje.
select-tax-location-postal-code-label = Kod Postar
select-tax-location-postal-code =
    .placeholder = Jepni kodin tuaj postar
select-tax-location-error-missing-postal-code = Ju lutemi, jepni kodin tuaj postar
select-tax-location-error-invalid-postal-code = Ju lutemi, jepni një kod postar të vlefshëm
select-tax-location-successfully-updated = Vendndodhja juaj u përditësua!
select-tax-location-error-location-not-updated = Vendndodhja juaj s’u përditësua dot. Ju lutemi, riprovoni.
#  $currencyDisplayName (String) - The display name of a currency code, e.g. US Dollar
select-tax-location-invalid-currency-change = Llogaria juaj është krijuar në { $currencyDisplayName }. Përzgjidhni një vend që përdor { $currencyDisplayName }.
select-tax-location-invalid-currency-change-default = Përzgjidhni një vend që përkon me monedhën e pajtimeve tuaja aktive.
select-tax-location-new-tax-rate-info = Ndryshimi i vendndodhjes tuaj do të aplikojë tarifë të re tatimi mbi krejt pajtimet aktive në llogarinë tuaj, duke filluar me ciklin tuaj pasues të faturimit.
signin-form-continue-button = Vazhdo
signin-form-email-input = Jepni email-in tuaj
signin-form-email-input-missing = Ju lutemi, jepni email-in tuaj
signin-form-email-input-invalid = Ju lutemi, jepni një email të vlefshëm
next-new-user-subscribe-product-updates-mdnplus = Do të doja të merrja lajme dhe përditësime nga { -product-mdn-plus } dhe { -brand-mozilla }
next-new-user-subscribe-product-updates-mozilla = Do të doja të merrja nga { -brand-mozilla } lajme dhe përditësime produktesh
next-new-user-subscribe-product-updates-snp = Do të doja të merrja nga { -brand-mozilla } lajme mbi sigurinë dhe privatësinë
next-new-user-subscribe-product-assurance = Email-in tuaj e përdorim vetëm për të krijuar llogarinë tuaj. S’do t’ia shesim kurrë një pale të tretë.

## $productName (String) - The name of the subscribed product.

resubscribe-dialog-title = Doni të vazhdoni të përdorni { $productName }?
subscription-content-button-resubscribe = Ripajtohuni
    .aria-label = Ripajtohuni te { $productName }
resubscribe-success-dialog-title = Faleminderit! Gjithçka gati.

## $billOnDate (Date) - The billing date of the current invoice (e.g., September 8, 2025)
## $creditApplied (Number) - The amount from account credit balance used to reduce the amount due on the invoice
## $currentPeriodEnd (Date) - The end date of the subscription's current billing period (e.g., September, 8, 2025)
## $invoiceTotal (Number) - The amount billed (excluding tax if tax does not exist). It will be formatted as currency.
## $nextBillDate (Date) - The date for the next time a charge will occur (e.g., September 8, 2025)
## $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
## $promotionName (String) - The name of the promotion.
## $taxDue (Number) - The tax added on, not included in amount. It will be formatted as currency.

subscription-content-coupon-will-be-applied = Do të aplikohet zbritja { $promotionName }
# • is acting as a separator between "Last bill" and the billing date.
subscription-content-last-bill = Fatura e fundit më • { $billedOnDate }
subscription-content-last-bill-with-tax = { $invoiceTotal } + { $taxDue } taksë
subscription-content-last-bill-no-tax = { $invoiceTotal }
subscription-content-view-invoice = Shihni faturën
subscription-management-link-view-invoice-aria = Shihni faturën për { $productName }
subscription-content-expires-on-expiry-date = Skadon më { $date }
# • is acting as a separator between "Next bill" and the next billing date.
subscription-content-next-bill = Fatura pasuese më • { $billedOnDate }
subscription-content-next-bill-with-tax-1 = { $nextInvoiceTotal } + { $taxDue } taksë
subscription-content-next-bill-no-tax-1 = { $nextInvoiceTotal }
subscription-content-button-stay-subscribed = Qëndroni i Pajtuar
    .aria-label = Qëndroni i pajtuar te { $productName }
subscription-content-button-cancel-subscription = Anulojeni Pajtimin
    .aria-label = Anuloni pajtimin tuaj te { $productName }

##

dialog-close = Mbylle dialogun
subscription-content-cancel-action-error = Ndodhi një gabim i papritur. Ju lutemi, riprovoni.

## PriceInterval - shared by multiple components, including Details and PurchaseDetails
## $amount (Number) - The amount billed. It will be formatted as currency.

plan-price-interval-daily = { $amount } në ditë
plan-price-interval-weekly = { $amount } në javë
plan-price-interval-monthly = { $amount } në muaj
plan-price-interval-halfyearly = { $amount } çdo 6 muaj
plan-price-interval-yearly = { $amount } në vit

## Component - SubscriptionTitle

next-subscription-create-title = Ujdisje e pajtimit tim
next-subscription-success-title = Ripohim pajtimi
next-subscription-processing-title = Po ripohohet pajtimi…
next-subscription-error-title = Gabim në ripohim pajtimi…
subscription-title-sub-exists = Jeni pajtuar tashmë
subscription-title-plan-change-heading = Shqyrtoni ndryshimin tuaj
subscription-title-not-supported = Ky ndryshim plani pajtimi nuk mbulohet
next-sub-guarantee = 30 ditë garanci kthimi parash

## Component - TermsAndPrivacy

# "Mozilla Accounts" is capitalized in this instance for title case in English
# This heading is followed by links to Terms of Service and Privacy Notice
next-subplat-mozilla-accounts-legal-heading = { -product-mozilla-accounts(capitalization: "uppercase") }
next-terms = Kushte Shërbimi
next-privacy = Shënim Mbi Privatësinë
next-terms-download = Kushte Shkarkimi
terms-and-privacy-stripe-label = { -brand-mozilla } përdor { -brand-name-stripe } për përpunim të sigurt të pagesave.
terms-and-privacy-stripe-link = Rregulla privatësie të { -brand-name-stripe }-it
terms-and-privacy-paypal-label = { -brand-mozilla } përdor { -brand-paypal } për kryerje të siguruar të pagesave.
terms-and-privacy-paypal-link = Rregulla Privatësie të { -brand-paypal }-it
terms-and-privacy-stripe-and-paypal-label = { -brand-mozilla } përdor { -brand-name-stripe } dhe { -brand-paypal } për kryerje të siguruar të pagesave.

## Component - UpdatedPurchaseDetails

upgrade-purchase-details-current-plan-label = Plani i tanishëm
upgrade-purchase-details-new-plan-label = Plan i ri
upgrade-purchase-details-promo-code = Kod Promocional
upgrade-purchase-details-tax-label = Taksa dhe Tarifa
# "Credit issued to account" refers to credit that will be added to the account balance that will be used toward future invoices
upgrade-purchase-details-credit-to-account = Krediti u aplikua në llogari
upgrade-purchase-details-credit-will-be-applied = Krediti do të aplikohet te llogaria juaj dhe do të përdoret në fatura të ardhshme.

## $productName (String) - Name of the upgraded product (e.g. Mozilla VPN)
## Daily/Weekly/Monthly/Yearly refers to the subscription interval/amount of time between billing occurrences

upgrade-purchase-details-new-plan-daily = { $productName } (E përditshme)
upgrade-purchase-details-new-plan-weekly = { $productName } (E përjavshme)
upgrade-purchase-details-new-plan-monthly = { $productName } (E përmuajshme)
upgrade-purchase-details-new-plan-halfyearly = { $productName } (6-muaj)
upgrade-purchase-details-new-plan-yearly = { $productName } (E përvitshme)

## Page Metadata Information
## $productTitle (String) - The name of the product to create subscription, e.g. Mozilla VPN

# Checkout start
metadata-title-checkout-start = Përfundim blerjeje | { $productTitle }
metadata-description-checkout-start = Që të plotësoni blerjen tuaj, jepni hollësitë tuaja për pagesën.
# Checkout processing
metadata-title-checkout-processing = Po përpunohet | { $productTitle }
metadata-description-checkout-processing = Ju lutemi, pritni, teksa përfundojmë përpunimin e pagesës tuaj.
# Checkout error
metadata-title-checkout-error = Gabim | { $productTitle }
metadata-description-checkout-error = Pati një gabim gjatë përpunimit të pajtimit tuaj. Nëse ky problem vazhdon, ju lutemi, lidhuni me asistencën.
# Checkout success
metadata-title-checkout-success = Sukses | { $productTitle }
metadata-description-checkout-success = Përgëzime! E plotësuat me sukses blerjen tuaj.
# Checkout needs_input
metadata-title-checkout-needs-input = Lypset veprim | { $productTitle }
metadata-description-checkout-needs-input = Ju lutemi, që të ecet më tej me pagesën tuaj, plotësoni veprimin e domosdoshëm.
# Upgrade start
metadata-title-upgrade-start = Përmirësim | { $productTitle }
metadata-description-upgrade-start = Që të plotësohet përmirësimi për ju, jepni hollësitë tuaja për pagesën.
# Upgrade processing
metadata-title-upgrade-processing = Po përpunohet | { $productTitle }
metadata-description-upgrade-processing = Ju lutemi, pritni, teksa përfundojmë përpunimin e pagesës tuaj.
# Upgrade error
metadata-title-upgrade-error = Gabim | { $productTitle }
metadata-description-upgrade-error = Pati një gabim gjatë përpunimit të përmirësimit për ju. Nëse ky problem vazhdon, ju lutemi, lidhuni me asistencën.
# Upgrade success
metadata-title-upgrade-success = Sukses | { $productTitle }
metadata-description-upgrade-success = Përgëzime! E plotësuat me sukses përmirësimin tuaj.
# Upgrade needs_input
metadata-title-upgrade-needs-input = Lypset veprim | { $productTitle }
metadata-description-upgrade-needs-input = Ju lutemi, që të ecet më tej me pagesën tuaj, plotësoni veprimin e domosdoshëm.
# Default
metadata-title-default = Faqe që s’gjendet | { $productTitle }
metadata-description-default = Faqja që kërkuat s’u gjet.

## Coupon Error Messages

next-coupon-error-cannot-redeem = Kodi që dhatë s’mund të përdoret — llogaria juaj ka një pajtim të mëparshëm në një nga shërbimet tona.
next-coupon-error-expired = Kodi që dhatë ka skaduar.
next-coupon-error-generic = Ndodhi një gabim me përpunimin e kodit. Ju lutemi, riprovoni.
next-coupon-error-invalid = Kodi që dhatë është i pavlefshëm.
# "Limit" refers to the maximum number of times a coupon can be redeemed.
next-coupon-error-limit-reached = Kodi që dhatë ka mbërritur në kufirin e vet.
