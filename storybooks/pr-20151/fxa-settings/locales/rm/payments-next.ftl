## Page

checkout-signin-or-create = 1. T’annunzia u creescha in { -product-mozilla-account }
continue-signin-with-google-button = Cuntinuar cun { -brand-google }
continue-signin-with-apple-button = Cuntinuar cun { -brand-apple }
next-payment-method-header = Tscherna tia metoda da pajament
# This message is used to indicate the second step in a multi step process.
payment-method-header-second-step-next = 2. { next-payment-method-header }
next-payment-method-first-approve = L'emprim stos ti approvar tes abunament
location-required-disclaimer = Nus utilisain mo questa infurmaziun per calcular taglias e la valuta.

## Page - Upgrade page

upgrade-page-payment-information = Infurmaziuns da pajament
# $nextInvoiceDate (number) - The date of the next invoice
upgrade-page-acknowledgment =
    Tes plan vegn immediat midà ed i vegn debità oz ina summa proporziunala
    per il rest da tes ciclus da facturaziun. A partir dals { $nextInvoiceDate }
    vegn debità l’entir import.

## Authentication Error page

checkout-error-boundary-retry-button = Empruvar anc ina giada
checkout-error-boundary-basic-error-message = Igl ha dà in problem. Emprova per plaschair anc ina giada u <contactSupportLink>contactescha l’agid</contactSupportLink>.

## Error pages - /checkout and /upgrade
## Common strings used in multiple pages

next-payment-error-manage-subscription-button = Administrar mes abunament
next-payment-error-retry-button = Reempruvar
next-basic-error-message = Insatge è ì mal. Emprova per plaschair pli tard anc ina giada.
checkout-error-contact-support-button = Contactar l’agid
checkout-error-not-eligible = Ti n’has betg il dretg dad abunar quest product – contactescha per plaschair l’agid per che nus possian ta gidar.
checkout-error-contact-support = Contactescha per plaschair l’agid per che nus possian ta gidar.

## Processing page and Needs Input page - /checkout and /upgrade
## Common strings used in multiple pages

next-payment-processing-message = Spetgar per plaschair fertant che nus elavurain il pajament…

## Success page - /checkout and /upgrade
## Common strings used in multiple checkout pages

next-payment-confirmation-thanks-heading-account-exists = Grazia, controllescha ussa tes e-mails!
# $email (String) - The user's email.
payment-confirmation-thanks-subheading-account-exists-2 = Ti retschaivas in e-mail adressà a { $email } cun instrucziuns en connex cun tes abunament, sco era tias datas da pajament.
next-payment-confirmation-order-heading = Detagls da l'empustaziun
# $invoiceNumber (String) - Invoice number of the successful payment
next-payment-confirmation-invoice-number = Quint nr. { $invoiceNumber }
# $invoiceDate (Date) - Start date of the latest invoice
next-payment-confirmation-invoice-date = { $invoiceDate }
next-payment-confirmation-details-heading-2 = Infurmaziuns da pajament

## Success pages (/checkout and /upgrade)
## Common strings used in multiple checkout pages

next-payment-confirmation-download-button = Vinavant a la telechargiada

## Success pages (/checkout and /upgrade), Start page (/upgrade)
## Common strings used in multiple checkout pages

# $last4 (Number) - Last four numbers of credit card
next-payment-confirmation-cc-card-ending-in = Carta che chala cun { $last4 }

## Component - Payment Consent Checkbox

next-payment-confirm-with-legal-links-static-3 = Jau permet a { -brand-mozilla } da debitar cun mia metoda da pajament l'import mussà, confurm a las <termsOfServiceLink>cundiziuns d'utilisaziun</termsOfServiceLink> e las <privacyNoticeLink>directivas per la protecziun da datas</privacyNoticeLink>, enfin che jau annullesch mes abunament.
next-payment-confirm-checkbox-error = Ti stos acceptar quai per pudair cuntinuar

## Checkout Form

next-new-user-submit = Abunar ussa
next-pay-with-heading-paypal = Pajar cun { -brand-paypal }

## Component - CouponForm

next-coupon-enter-code =
    .placeholder = Endatescha il code
# Title of container where a user can input a coupon code to get a discount on a subscription.
next-coupon-promo-code = Code da promoziun
# Title of container showing discount coupon code applied to a subscription.
next-coupon-promo-code-applied = Applitgà il code da promoziun
next-coupon-remove = Allontanar
next-coupon-submit = Applitgar

# Component - Header

payments-header-help =
    .title = Agid
    .aria-label = Agid
    .alt = Agid
payments-header-bento =
    .title = Products da { -brand-mozilla }
    .aria-label = Products da { -brand-mozilla }
    .alt = Logo da { -brand-mozilla }
payments-header-bento-close =
    .alt = Serrar
payments-header-bento-tagline = Ulteriurs products da { -brand-mozilla } che protegian tia sfera privata
payments-header-bento-firefox-desktop = Navigatur { -brand-firefox } per computers desktop
payments-header-bento-firefox-mobile = Navigatur { -brand-firefox } per apparats mobils
payments-header-bento-monitor = { -product-mozilla-monitor }
payments-header-bento-firefox-relay = { -product-firefox-relay }
payments-header-bento-vpn = { -product-mozilla-vpn }
payments-header-bento-made-by-mozilla = Realisà da { -brand-mozilla }
payments-header-avatar =
    .title = Menu { -product-mozilla-account }
payments-header-avatar-icon =
    .alt = Maletg da profil dal conto
payments-header-avatar-expanded-signed-in-as = Annunzià sco
payments-header-avatar-expanded-sign-out = Sortir
payments-client-loading-spinner =
    .aria-label = Chargiar…
    .alt = Chargiar…

## Component - PurchaseDetails

next-plan-details-header = Detagls dal product
next-plan-details-list-price = Pretsch da catalog
next-plan-details-tax = Taglias e taxas
next-plan-details-total-label = Total
next-plan-details-hide-button = Zuppentar ils detagls
next-plan-details-show-button = Mussar ils detagls
next-coupon-success = Tes plan vegn renovà automaticamain cun il pretsch da catalog.
# $couponDurationDate (Date) - The date at which the coupon is no longer valid, and the subscription is billed the list price.
next-coupon-success-repeating = Tes plan vegn renovà automaticamain suenter ils { $couponDurationDate } tenor il pretsch da catalog.

## Select Tax Location

select-tax-location-title = Posiziun
select-tax-location-edit-button = Modifitgar
select-tax-location-save-button = Memorisar
select-tax-location-country-code-label = Pajais
select-tax-location-country-code-placeholder = Tscherna tes pajais
select-tax-location-error-missing-country-code = Tscherna per plaschair tes pajais
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN
select-tax-location-product-not-available = { $productName } na stat betg a disposiziun en quest lieu.
select-tax-location-postal-code-label = Numer postal
select-tax-location-postal-code =
    .placeholder = Endatescha tes numer postal
select-tax-location-error-missing-postal-code = Endatescha per plaschair tes numer postal
select-tax-location-error-invalid-postal-code = Endatescha per plaschair in numer postal valid
select-tax-location-successfully-updated = Tia posiziun è vegnida actualisada.
select-tax-location-error-location-not-updated = I n’è betg reussì d’actualisar tia posiziun. Emprova per plaschair anc ina giada.
signin-form-continue-button = Cuntinuar
signin-form-email-input = Endatescha tia adressa dad e-mail
signin-form-email-input-missing = Endatescha per plaschair tia adressa dad e-mail
signin-form-email-input-invalid = Inditgescha per plaschair in’adressa dad e-mail valida
next-new-user-subscribe-product-updates-mdnplus = Jau vi retschaiver novitads davart products ed autras novas da { -product-mdn-plus } e { -brand-mozilla }
next-new-user-subscribe-product-updates-mozilla = Jau vi retschaiver novitads davart products ed autras novas da { -brand-mozilla }
next-new-user-subscribe-product-updates-snp = Jau vi retschaiver novitads davart segirezza e protecziun da datas ed autras novas da { -brand-mozilla }
next-new-user-subscribe-product-assurance = Nus duvrain tia adressa dad e-mail mo per crear tes conto. Nus na la vendain mai a terzas partidas.

## PriceInterval - shared by multiple components, including Details and PurchaseDetails
## $amount (Number) - The amount billed. It will be formatted as currency.

plan-price-interval-daily = { $amount } per di
plan-price-interval-weekly = { $amount } per emna
plan-price-interval-monthly = { $amount } per mais
plan-price-interval-halfyearly = { $amount } mintga 6 mais
plan-price-interval-yearly = { $amount } mintg’onn

## Component - SubscriptionTitle

next-subscription-create-title = Configurescha tes abunament
next-subscription-success-title = Conferma da l'abunament.
next-subscription-processing-title = Confermar l'abunament…
next-subscription-error-title = Errur cun confermar l'abunament…
subscription-title-plan-change-heading = Controllescha tia midada
next-sub-guarantee = Garanzia da restituziun da 30 dis

## Component - TermsAndPrivacy

# "Mozilla Accounts" is capitalized in this instance for title case in English
# This heading is followed by links to Terms of Service and Privacy Notice
next-subplat-mozilla-accounts-legal-heading = { -product-mozilla-accounts(capitalization: "uppercase") }
next-terms = Cundiziuns d'utilisaziun
next-privacy = Infurmaziuns davart la protecziun da datas
next-terms-download = Telechargiar las cundiziuns
terms-and-privacy-stripe-label = { -brand-mozilla } utilisescha { -brand-name-stripe } per l’elavuraziun segira da pajaments.
terms-and-privacy-stripe-link = Decleraziun davart la protecziun da datas da { -brand-name-stripe }
terms-and-privacy-paypal-label = { -brand-mozilla } utilisescha { -brand-paypal } per l’elavuraziun segira da pajaments.
terms-and-privacy-paypal-link = La decleraziun davart la protecziun da datas da { -brand-paypal }
terms-and-privacy-stripe-and-paypal-label = { -brand-mozilla } utilisescha { -brand-name-stripe } e { -brand-paypal } per l’elavuraziun segira da pajaments.

## Component - UpdatedPurchaseDetails

upgrade-purchase-details-current-plan-label = Plan actual
upgrade-purchase-details-new-plan-label = Nov plan
upgrade-purchase-details-promo-code = Code da promoziun
upgrade-purchase-details-tax-label = Taglias e taxas

## $productName (String) - Name of the upgraded product (e.g. Mozilla VPN)
## Daily/Weekly/Monthly/Yearly refers to the subscription interval/amount of time between billing occurrences

upgrade-purchase-details-new-plan-daily = { $productName } (mintga di)
upgrade-purchase-details-new-plan-weekly = { $productName } (emnil)
upgrade-purchase-details-new-plan-monthly = { $productName } (mensil)
upgrade-purchase-details-new-plan-halfyearly = { $productName } (mintga 6 mais)
upgrade-purchase-details-new-plan-yearly = { $productName } (annual)
