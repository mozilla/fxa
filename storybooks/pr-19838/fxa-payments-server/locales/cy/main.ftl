



-brand-mozilla = Mozilla
-brand-firefox = Firefox
-product-firefox-accounts = Cyfrifon Firefox
-product-mozilla-account = Cyfrif Mozilla
-product-mozilla-accounts = Cyfrifon Mozilla
-product-firefox-account = Cyfrif Firefox
-product-mozilla-vpn = Mozilla VPN
-product-mozilla-vpn-short = VPN
-product-mozilla-hubs = Mozilla Hubs
-product-mdn = MDN
-product-mdn-plus = MDN Plus
-product-firefox-cloud = Firefox Cloud
-product-mozilla-monitor = Mozilla Monitor
-product-mozilla-monitor-short = Monitor
-product-firefox-relay = Firefox Relay
-product-firefox-relay-short = Relay
-brand-apple = Apple
-brand-apple-pay = Apple Pay
-brand-google = Google
-brand-google-pay = Google Pay
-brand-paypal = PayPal
-brand-name-stripe = Stripe
-brand-amex = American Express
-brand-diners = Diners Club
-brand-discover = Discover
-brand-jcb = JCB
-brand-link = Link
-brand-mastercard = Mastercard
-brand-unionpay = UnionPay
-brand-visa = Visa
-app-store = App Store
-google-play = Google Play

app-general-err-heading = Gwall cyffredinol rhaglen
app-general-err-message = Aeth rhywbeth o'i le. Ceisiwch eto.
app-query-parameter-err-heading = Cais Gwael: Paramedrau Ymholiad Annilys


app-footer-mozilla-logo-label = Logo { -brand-mozilla }
app-footer-privacy-notice = Hysbysiad Preifatrwydd Gwefan
app-footer-terms-of-service = Amodau Gwasanaeth


app-default-title-2 = { -product-mozilla-accounts }
app-page-title-2 = { $title } | { -product-mozilla-accounts }


link-sr-new-window = Yn agor mewn ffenestr newydd


app-loading-spinner-aria-label-loading = Llwytho…


app-logo-alt-3 =
    .alt = Logo m { -brand-mozilla }



settings-home = Cartref Cyfrif
settings-project-header-title = { -product-mozilla-account }


coupon-promo-code-applied = Cod Hyrwyddo wedi'i Osod
coupon-submit = Gosod
coupon-remove = Tynnu
coupon-error = Mae'r cod a roesoch yn annilys neu wedi dod i ben.
coupon-error-generic = Bu gwall wrth brosesu'r cod. Ceisiwch eto, os gwelwch yn dda.
coupon-error-expired = Mae'r cod a roesoch wedi dod i ben.
coupon-error-limit-reached = Mae'r cod a roesoch wedi cyrraedd ei derfyn.
coupon-error-invalid = Mae'r cod a roesoch yn annilys.
coupon-enter-code =
    .placeholder = Rhowch y Cod


default-input-error = Mae angen llanw'r maes hwn
input-error-is-required = Mae angen { $label }


brand-name-mozilla-logo = Logo { -brand-mozilla }


new-user-sign-in-link-2 = Oes gennych chi gyfrif { -product-mozilla-account } yn barod? <a>Mewngofnodi</a>
new-user-enter-email =
    .label = Rhowch eich e-bost
new-user-confirm-email =
    .label = Cadarnhewch eich e-bost
new-user-subscribe-product-updates-mozilla = Hoffwn dderbyn newyddion cynnyrch a diweddariadau gan { -brand-mozilla }
new-user-subscribe-product-updates-snp = Hoffwn dderbyn newyddion a diweddariadau diogelwch a phreifatrwydd gan { -brand-mozilla }
new-user-subscribe-product-updates-hubs = Hoffwn dderbyn newyddion cynnyrch a diweddariadau gan { -product-mozilla-hubs } a { -brand-mozilla }
new-user-subscribe-product-updates-mdnplus = Hoffwn dderbyn newyddion cynnyrch a diweddariadau gan { -product-mdn-plus } a { -brand-mozilla }
new-user-subscribe-product-assurance = Dim ond i greu eich cyfrif rydym yn defnyddio'ch e-bost. Fyddwn ni byth yn ei werthu i drydydd parti.
new-user-email-validate = Nid yw'r e-bost yn ddilys
new-user-email-validate-confirm = Nid yw'r e-byst yn cyfateb
new-user-already-has-account-sign-in = Mae gennych gyfrif eisoes. <a>Mewngofnodi</a>
new-user-invalid-email-domain = Wedi cam deipio'r e-bost? Dyw { $domain } ddim yn cynnig e-bost.


payment-confirmation-thanks-heading = Diolch yn fawr!
payment-confirmation-thanks-heading-account-exists = Diolch, nawr edrychwch ar eich e-bost!
payment-confirmation-thanks-subheading = Mae e-bost cadarnhau wedi'i anfon at { $email } gyda manylion ar sut i ddechrau gyda { $product_name }.
payment-confirmation-thanks-subheading-account-exists = Byddwch yn derbyn e-bost o { $email } gyda chyfarwyddiadau ar gyfer creu eich cyfrif, yn ogystal â'ch manylion talu.
payment-confirmation-order-heading = Manylion yr archeb
payment-confirmation-invoice-number = Anfoneb # { $invoiceNumber }
payment-confirmation-invoice-date = { $invoiceDate }
payment-confirmation-details-heading-2 = Manylion talu
payment-confirmation-amount = { $amount } fesul { $interval }
payment-confirmation-amount-day =
    { $intervalCount ->
        [zero] { $amount } bob { $intervalCount } diwrnod
        [one] { $amount } yn ddyddiol
        [two] { $amount } bob { $intervalCount } ddiwrnod
        [few] { $amount } bob { $intervalCount } diwrnod
        [many] { $amount } bob { $intervalCount } niwrnod
       *[other] { $amount } bob { $intervalCount } diwrnod
    }
payment-confirmation-amount-week =
    { $intervalCount ->
        [zero] { $amount } bob { $intervalCount } wythnos
        [one] { $amount } yn wythnosol
        [two] { $amount } bob { $intervalCount } wythnos
        [few] { $amount } bob { $intervalCount } wythnos
        [many] { $amount } bob { $intervalCount } wythnos
       *[other] { $amount } bob { $intervalCount } wythnos
    }
payment-confirmation-amount-month =
    { $intervalCount ->
        [zero] { $amount } bob { $intervalCount } mis
        [one] { $amount } yn fisol
        [two] { $amount } bob { $intervalCount } mis
        [few] { $amount } bob { $intervalCount } mis
        [many] { $amount } bob { $intervalCount } mis
       *[other] { $amount } bob { $intervalCount } mis
    }
payment-confirmation-amount-year =
    { $intervalCount ->
        [zero] { $amount } bob { $intervalCount } blwyddyn
        [one] { $amount } yn flynyddol
        [two] { $amount } bob { $intervalCount } flynedd
        [few] { $amount } bob { $intervalCount } blynedd
        [many] { $amount } bob { $intervalCount } mlynedd
       *[other] { $amount } bob { $intervalCount } blynedd
    }
payment-confirmation-download-button = Parhau i lwytho i lawr


payment-confirm-with-legal-links-static-3 = Rwy'n awdurdodi { -brand-mozilla } i godi tâl ar fy null talu am y swm sy'n cael ei ddangos, yn unol â <termsOfServiceLink>Thelerau Gwasanaeth</termsOfServiceLink> a'r <privacyNoticeLink>Hysbysiad Preifatrwydd</privacyNoticeLink>, nes i mi ddiddymu fy nhanysgrifiad.
payment-confirm-checkbox-error = Mae angen i chi gwblhau hyn cyn symud ymlaen


payment-error-retry-button = Ceisiwch eto
payment-error-manage-subscription-button = Rheoli fy nhanysgrifiad


iap-upgrade-already-subscribed-2 = Mae gennych danysgrifiad { $productName } yn barod trwy'r siop apiau { -brand-google } neu { -brand-apple }.
iap-upgrade-no-bundle-support = Nid ydym yn cefnogi uwchraddio'r tanysgrifiadau hyn ar hyn o bryd, ond byddwn yn gwneud hynny'n fuan.
iap-upgrade-contact-support = Gallwch gael y cynnyrch hwn o hyd - cysylltwch â chymorth fel y gallwn ni eich helpu.
iap-upgrade-get-help-button = Cael cymorth


payment-name =
    .placeholder = Enw Llawn
    .label = Enw fel mae'n ymddangos ar eich cerdyn
payment-cc =
    .label = Eich cerdyn
payment-cancel-btn = Diddymu
payment-update-btn = Diweddaru
payment-pay-btn = Talu nawr
payment-pay-with-paypal-btn-2 = Talu gyda { -brand-paypal }
payment-validate-name-error = Rhowch eich enw


payment-legal-copy-stripe-and-paypal-3 = Mae { -brand-mozilla } yn defnyddio { -brand-name-stripe } a { -brand-paypal } ar gyfer prosesu taliadau'n ddiogel.
payment-legal-link-stripe-paypal-2 = <stripePrivacyLink>Polisi preifatrwydd { -brand-name-stripe }</stripePrivacyLink> &nbsp; <paypalPrivacyLink>polisi preifatrwydd { -brand-paypal }</paypalPrivacyLink>
payment-legal-copy-paypal-2 = Mae { -brand-mozilla } yn defnyddio { -brand-paypal } ar gyfer prosesu taliadau'n ddiogel.
payment-legal-link-paypal-3 = <paypalPrivacyLink>Polisi preifatrwydd { -brand-paypal } </paypalPrivacyLink>
payment-legal-copy-stripe-3 = Mae { -brand-mozilla } yn defnyddio { -brand-name-stripe } ar gyfer prosesu taliadau'n ddiogel.
payment-legal-link-stripe-3 = <stripePrivacyLink>Polisi preifatrwydd { -brand-name-stripe }</stripePrivacyLink>.


payment-method-header = Dewiswch eich dull talu
payment-method-header-second-step = 2. { payment-method-header }
payment-method-first-approve = Yn gyntaf bydd angen i chi gymeradwyo'ch tanysgrifiad


payment-processing-message = Arhoswch tra'n bod ni'n prosesu'ch taliad…


payment-confirmation-cc-card-ending-in = Cerdyn yn gorffen gyda { $last4 }


pay-with-heading-paypal-2 = Talu gyda { -brand-paypal }


plan-details-header = Manylion cynnyrch
plan-details-list-price = Rhestr Prisiau
plan-details-show-button = Dangos manylion
plan-details-hide-button = Cuddio manylion
plan-details-total-label = Cyfanswm
plan-details-tax = Trethi a Ffioedd


product-no-such-plan = Dim cynllun o'r fath ar gyfer y cynnyrch hwn.


price-details-no-tax = { $priceAmount }
price-details-tax = { $priceAmount } + { $taxAmount } treth
price-details-no-tax-day =
    { $intervalCount ->
        [zero] { $priceAmount } bob { $intervalCount } ddiwrnod
        [one] { $priceAmount } bob diwrnod
        [two] { $priceAmount } bob { $intervalCount } ddiwrnod
        [few] { $priceAmount } bob { $intervalCount } diwrnod
        [many] { $priceAmount } bob { $intervalCount } niwrnod
       *[other] { $priceAmount } bob { $intervalCount } diwrnod
    }
    .title =
        { $intervalCount ->
            [zero] { $priceAmount } bob { $intervalCount } ddiwrnod
            [one] { $priceAmount } bob diwrnod
            [two] { $priceAmount } bob { $intervalCount } ddiwrnod
            [few] { $priceAmount } bob { $intervalCount } diwrnod
            [many] { $priceAmount } bob { $intervalCount } niwrnod
           *[other] { $priceAmount } bob { $intervalCount } diwrnod
        }
price-details-no-tax-week =
    { $intervalCount ->
        [zero] { $priceAmount } bob { $intervalCount } wythnos
        [one] { $priceAmount } bob wythnos
        [two] { $priceAmount } bob pythefnos
        [few] { $priceAmount } bob { $intervalCount } wythnos
        [many] { $priceAmount } bob { $intervalCount } wythnos
       *[other] { $priceAmount } bob { $intervalCount } wythnos
    }
    .title =
        { $intervalCount ->
            [zero] { $priceAmount } bob { $intervalCount } wythnos
            [one] { $priceAmount } bob wythnos
            [two] { $priceAmount } bob pythefnos
            [few] { $priceAmount } bob { $intervalCount } wythnos
            [many] { $priceAmount } bob { $intervalCount } wythnos
           *[other] { $priceAmount } bob { $intervalCount } wythnos
        }
price-details-no-tax-month =
    { $intervalCount ->
        [zero] { $priceAmount } bob { $intervalCount } mis
        [one] { $priceAmount } bob mis
        [two] { $priceAmount } bob { $intervalCount } fis
        [few] { $priceAmount } bob { $intervalCount } mis
        [many] { $priceAmount } bob { $intervalCount } mis
       *[other] { $priceAmount } bob { $intervalCount } mis
    }
    .title =
        { $intervalCount ->
            [zero] { $priceAmount } bob { $intervalCount } mis
            [one] { $priceAmount } bob mis
            [two] { $priceAmount } bob { $intervalCount } fis
            [few] { $priceAmount } bob { $intervalCount } mis
            [many] { $priceAmount } bob { $intervalCount } mis
           *[other] { $priceAmount } bob { $intervalCount } mis
        }
price-details-no-tax-year =
    { $intervalCount ->
        [zero] { $priceAmount } bob { $intervalCount } blynedd
        [one] { $priceAmount } bob blwyddyn
        [two] { $priceAmount } bob { $intervalCount } flynedd
        [few] { $priceAmount } bob { $intervalCount } blynedd
        [many] { $priceAmount } bob { $intervalCount } mlynedd
       *[other] { $priceAmount } bob { $intervalCount } blynedd
    }
    .title =
        { $intervalCount ->
            [zero] { $priceAmount } bob { $intervalCount } blynedd
            [one] { $priceAmount } bob blwyddyn
            [two] { $priceAmount } bob { $intervalCount } flynedd
            [few] { $priceAmount } bob { $intervalCount } blynedd
            [many] { $priceAmount } bob { $intervalCount } mlynedd
           *[other] { $priceAmount } bob { $intervalCount } blynedd
        }
price-details-tax-day =
    { $intervalCount ->
        [zero] { $priceAmount } a { $taxAmount } o dreth bob { $intervalCount } ddiwrnod
        [one] { $priceAmount } a { $taxAmount } o dreth bob diwrnod
        [two] { $priceAmount } a { $taxAmount } o dreth bob { $intervalCount } ddiwrnod
        [few] { $priceAmount } a { $taxAmount } o dreth bob { $intervalCount } diwrnod
        [many] { $priceAmount } a { $taxAmount } o dreth bob { $intervalCount } niwrnod
       *[other] { $priceAmount } a { $taxAmount } o dreth bob { $intervalCount } diwrnod
    }
    .title =
        { $intervalCount ->
            [zero] { $priceAmount } a { $taxAmount } o dreth bob { $intervalCount } ddiwrnod
            [one] { $priceAmount } a { $taxAmount } o dreth bob diwrnod
            [two] { $priceAmount } a { $taxAmount } o dreth bob { $intervalCount } ddiwrnod
            [few] { $priceAmount } a { $taxAmount } o dreth bob { $intervalCount } diwrnod
            [many] { $priceAmount } a { $taxAmount } o dreth bob { $intervalCount } niwrnod
           *[other] { $priceAmount } a { $taxAmount } o dreth bob { $intervalCount } diwrnod
        }
price-details-tax-week =
    { $intervalCount ->
        [zero] { $priceAmount } a { $taxAmount } treth bob { $intervalCount } wythnos
        [one] { $priceAmount } a { $taxAmount } treth bob wythnos
        [two] { $priceAmount } a { $taxAmount } treth bob pythefnos
        [few] { $priceAmount } a { $taxAmount } treth bob { $intervalCount } wythnos
        [many] { $priceAmount } a { $taxAmount } treth bob { $intervalCount } wythnos
       *[other] { $priceAmount } a { $taxAmount } treth bob { $intervalCount } wythnos
    }
    .title =
        { $intervalCount ->
            [zero] { $priceAmount } a { $taxAmount } treth bob { $intervalCount } wythnos
            [one] { $priceAmount } a { $taxAmount } treth bob wythnos
            [two] { $priceAmount } a { $taxAmount } treth bob pythefnos
            [few] { $priceAmount } a { $taxAmount } treth bob { $intervalCount } wythnos
            [many] { $priceAmount } a { $taxAmount } treth bob { $intervalCount } wythnos
           *[other] { $priceAmount } a { $taxAmount } treth bob { $intervalCount } wythnos
        }
price-details-tax-month =
    { $intervalCount ->
        [zero] { $priceAmount } a { $taxAmount } treth bob { $intervalCount } mis
        [one] { $priceAmount } a { $taxAmount } treth bob mis
        [two] { $priceAmount } a { $taxAmount } treth bob { $intervalCount } fis
        [few] { $priceAmount } a { $taxAmount } treth bob { $intervalCount } mis
        [many] { $priceAmount } a { $taxAmount } treth bob { $intervalCount } mis
       *[other] { $priceAmount } a { $taxAmount } treth bob { $intervalCount } mis
    }
    .title =
        { $intervalCount ->
            [zero] { $priceAmount } a { $taxAmount } treth bob { $intervalCount } mis
            [one] { $priceAmount } a { $taxAmount } treth bob mis
            [two] { $priceAmount } a { $taxAmount } treth bob { $intervalCount } fis
            [few] { $priceAmount } a { $taxAmount } treth bob { $intervalCount } mis
            [many] { $priceAmount } a { $taxAmount } treth bob { $intervalCount } mis
           *[other] { $priceAmount } a { $taxAmount } treth bob { $intervalCount } mis
        }
price-details-tax-year =
    { $intervalCount ->
        [zero] { $priceAmount } a { $taxAmount } treth bob { $intervalCount } blynedd
        [one] { $priceAmount } a { $taxAmount } treth bob blwyddyn
        [two] { $priceAmount } a { $taxAmount } treth bob { $intervalCount } flynedd
        [few] { $priceAmount } a { $taxAmount } treth bob { $intervalCount } blynedd
        [many] { $priceAmount } a { $taxAmount } treth bob { $intervalCount } mlynedd
       *[other] { $priceAmount } a { $taxAmount } treth bob { $intervalCount } blynedd
    }
    .title =
        { $intervalCount ->
            [zero] { $priceAmount } a { $taxAmount } treth bob { $intervalCount } blynedd
            [one] { $priceAmount } a { $taxAmount } treth bob blwyddyn
            [two] { $priceAmount } a { $taxAmount } treth bob { $intervalCount } flynedd
            [few] { $priceAmount } a { $taxAmount } treth bob { $intervalCount } blynedd
            [many] { $priceAmount } a { $taxAmount } treth bob { $intervalCount } mlynedd
           *[other] { $priceAmount } a { $taxAmount } treth bob { $intervalCount } blynedd
        }


subscription-create-title = Gosod eich tanysgrifiad
subscription-success-title = Cadarnhad o'ch tanysgrifiad
subscription-processing-title = Yn cadarnhau eich tanysgrifiad…
subscription-error-title = Gwall wrth gadarnhau eich tanysgrifiad…
subscription-noplanchange-title = Nid yw newid cynllun tanysgrifio yn cael ei gynnal
subscription-iapsubscribed-title = Eisoes wedi tanysgrifio
sub-guarantee = Gwarant arian-yn-ôl 30 diwrnod


subplat-mozilla-accounts-legal-heading = { -product-mozilla-accounts(capitalization: "uppercase") }
terms = Amodau Gwasanaeth
privacy = Hysbysiad Preifatrwydd
terms-download = Amodau Llwytho i Lawr


document =
    .title = Cyfrifon Firefox
close-aria =
    .aria-label = Cau'r moddol
settings-subscriptions-title = Tanysgrifiadau
coupon-promo-code = Cod Hyrwyddo


plan-price-interval-day =
    { $intervalCount ->
        [zero] { $amount } bob { $intervalCount } ddiwrnod
        [one] { $amount } bob diwrnod
        [two] { $amount } bob { $intervalCount } ddiwrnod
        [few] { $amount } bob { $intervalCount } diwrnod
        [many] { $amount } bob { $intervalCount } niwrnod
       *[other] { $amount } bob { $intervalCount } diwrnod
    }
    .title =
        { $intervalCount ->
            [zero] { $amount } bob { $intervalCount } ddiwrnod
            [one] { $amount } bob diwrnod
            [two] { $amount } bob { $intervalCount } ddiwrnod
            [few] { $amount } bob { $intervalCount } diwrnod
            [many] { $amount } bob { $intervalCount } niwrnod
           *[other] { $amount } bob { $intervalCount } diwrnod
        }
plan-price-interval-week =
    { $intervalCount ->
        [zero] { $amount } bob { $intervalCount } wythnos
        [one] { $amount } bob wythnos
        [two] { $amount } bob pythefnos
        [few] { $amount } bob { $intervalCount } wythnos
        [many] { $amount } bob { $intervalCount } wythnos
       *[other] { $amount } bob { $intervalCount } wythnos
    }
    .title =
        { $intervalCount ->
            [zero] { $amount } bob { $intervalCount } wythnos
            [one] { $amount } bob wythnos
            [two] { $amount } bob pythefnos
            [few] { $amount } bob { $intervalCount } wythnos
            [many] { $amount } bob { $intervalCount } wythnos
           *[other] { $amount } bob { $intervalCount } wythnos
        }
plan-price-interval-month =
    { $intervalCount ->
        [zero] { $amount } bob { $intervalCount } mis
        [one] { $amount } bob mis
        [two] { $amount } bob { $intervalCount } fis
        [few] { $amount } bob { $intervalCount } mis
        [many] { $amount } bob { $intervalCount } mis
       *[other] { $amount } bob { $intervalCount } mis
    }
    .title =
        { $intervalCount ->
            [zero] { $amount } bob { $intervalCount } mis
            [one] { $amount } bob mis
            [two] { $amount } bob { $intervalCount } fis
            [few] { $amount } bob { $intervalCount } mis
            [many] { $amount } bob { $intervalCount } mis
           *[other] { $amount } bob { $intervalCount } mis
        }
plan-price-interval-year =
    { $intervalCount ->
        [zero] { $amount } bob { $intervalCount } blynedd
        [one] { $amount } bob blwyddyn
        [two] { $amount } bob { $intervalCount } flynedd
        [few] { $amount } bob { $intervalCount } blynedd
        [many] { $amount } bob { $intervalCount } mlynedd
       *[other] { $amount } bob { $intervalCount } blynedd
    }
    .title =
        { $intervalCount ->
            [zero] { $amount } bob { $intervalCount } blynedd
            [one] { $amount } bob blwyddyn
            [two] { $amount } bob { $intervalCount } flynedd
            [few] { $amount } bob { $intervalCount } blynedd
            [many] { $amount } bob { $intervalCount } mlynedd
           *[other] { $amount } bob { $intervalCount } blynedd
        }


general-error-heading = Gwall rhaglen cyffredinol
basic-error-message = Aeth rhywbeth o'i le. Ceisiwch eto.
payment-error-1 = Hmm. Bu anhawster wrth  awdurdodi'ch taliad. Rhowch gynnig arall arni neu cysylltwch â chyhoeddwr eich cerdyn.
payment-error-2 = Hmm. Bu anhawster wrth  awdurdodi'ch taliad. Cysylltwch â chyhoeddwr eich cerdyn.
payment-error-3b = Mae gwall annisgwyl wedi digwydd wrth brosesu'ch taliad, ceisiwch eto.
expired-card-error = Mae'n edrych fel bod eich cerdyn credyd wedi dod i ben. Rhowch gynnig ar gerdyn arall.
insufficient-funds-error = Mae'n edrych fel nad oes gan eich cerdyn ddigon o arian wrth gefn. Rhowch gynnig ar gerdyn arall.
withdrawal-count-limit-exceeded-error = Mae'n ymddangos y bydd y trafodyn hwn yn eich cymryd dros eich terfyn credyd. Rhowch gynnig ar gerdyn arall.
charge-exceeds-source-limit = Mae'n ymddangos y bydd y trafodyn hwn yn eich cymryd dros eich terfyn credyd dyddiol. Rhowch gynnig ar gerdyn arall neu eto wedi 24 awr.
instant-payouts-unsupported = Mae'n edrych fel nad yw'ch cerdyn debyd wedi'i osod ar gyfer taliadau ar unwaith. Rhowch gynnig ar gerdyn debyd neu gredyd arall.
duplicate-transaction = Hmm. Yn edrych fel bod trafodyn tebyg wedi'i anfon. Gwiriwch eich hanes talu.
coupon-expired = Mae'n edrych fel bod y cod hyrwyddo wedi dod i ben.
card-error = Nid oedd modd prosesu eich trafodyn. Gwiriwch fanylion eich cerdyn credyd a rhoi cynnig arall arni.
country-currency-mismatch = Nid yw arian cyfred y tanysgrifiad hwn yn ddilys ar gyfer y wlad sy'n gysylltiedig â'ch taliad.
currency-currency-mismatch = Ymddiheuriadau. Nid oes modd i chi newid rhwng arian cyfred.
location-unsupported = Nid yw eich lleoliad presennol yn cael ei gefnogi yn unol â'n Amodau Gwasanaeth.
no-subscription-change = Ymddiheuriadau. Nid oes modd i chi newid eich cynllun tanysgrifio.
iap-already-subscribed = Rydych eisoes wedi tanysgrifio trwy'r { $mobileAppStore }
fxa-account-signup-error-2 = Achosodd gwall system i'ch mewngofnodi i { $productName } fethu. Nid oes taliad wedi ei godi ar eich dull talu. Ceisiwch eto.
fxa-post-passwordless-sub-error = Cadarnhawyd eich tanysgrifiad, ond methodd y dudalen gadarnhau â llwytho. Gwiriwch eich e-bost i greu eich cyfrif.
newsletter-signup-error = Nid ydych wedi cofrestru ar gyfer e-byst newyddion am ein cynnyrch. Gallwch geisio eto yn eich gosodiadau cyfrif.
product-plan-error =
    .title = Anhawster llwytho cynlluniau
product-profile-error =
    .title = Anhawster llwytho proffiliau
product-customer-error =
    .title = Anhawster llwytho cwsmer
product-plan-not-found = Heb ganfod y cynllun
product-location-unsupported-error = Nid yw eich lleoliad yn cael ei gefnogi


coupon-success = Bydd eich cynllun yn adnewyddu'n awtomatig am y pris ar y rhestr.
coupon-success-repeating = Bydd eich cynllun yn adnewyddu'n awtomatig ar ôl { $couponDurationDate } am y pris ar y rhestr.


new-user-step-1-2 = 1. Creu cyfrif { -product-mozilla-account }
new-user-card-title = Rhowch fanylion eich cerdyn
new-user-submit = Tanysgrifiwch Nawr


sub-update-payment-title = Manylion talu


pay-with-heading-card-only = Talu gyda cherdyn
product-invoice-preview-error-title = Anhawster wrth lwytho rhagolwg anfoneb
product-invoice-preview-error-text = Methu llwytho rhagolwg anfoneb


subscription-iaperrorupgrade-title = Nid ydym yn gallu eich uwchraddio eto


brand-name-google-play-2 = Siop { -google-play }
brand-name-apple-app-store-2 = { -app-store }


product-plan-change-heading = Gwiriwch eich newid
sub-change-failed = Methodd newid y cynllun
sub-update-acknowledgment = Bydd eich cynllun yn newid ar unwaith, a byddwn yn codi swm pro rata arnoch heddiw am weddill y cylch bilio hwn. Gan ddechrau ar { $startingDate } byddwn yn codi'r swm llawn arnoch.
sub-change-submit = Cadarnhau'r newid
sub-update-current-plan-label = Cynllun cyfredol
sub-update-new-plan-label = Cynllun newydd
sub-update-total-label = Cyfanswm newydd
sub-update-prorated-upgrade = Uwchraddio yn Ôl y Raddfa


sub-update-new-plan-daily = { $productName } ( Dyddiol )
sub-update-new-plan-weekly = { $productName } ( Wythnosol )
sub-update-new-plan-monthly = { $productName } ( Misol)
sub-update-new-plan-yearly = { $productName } (Blynyddol)
sub-update-prorated-upgrade-credit = Bydd y balans negyddol sy'n cael ei ddangos yn cael ei osod fel credydau i'ch cyfrif a'i ddefnyddio tuag at anfonebau yn y dyfodol.


sub-item-cancel-sub = Diddymu'r Tanysgrifiad
sub-item-stay-sub = Para Wedi Tanysgrifio


sub-item-cancel-msg =
    Ni fydd modd i chi ddefnyddio { $name } mwyach ar ôl
    { $period }, diwrnod olaf eich cylch bilio.
sub-item-cancel-confirm =
    Diddymwch fy mynediad a'm manylion sydd wedi'u
    cadw o fewn { $name } ar { $period }
sub-promo-coupon-applied = Cwpon { $promotion_name } wedi'i osod: <priceDetails></priceDetails>
subscription-management-account-credit-balance = Mae'r taliad tanysgrifiad hwn yn dangos credyd i falans eich cyfrif: <priceDetails></priceDetails>


sub-route-idx-reactivating = Methodd ail agor tanysgrifiad
sub-route-idx-cancel-failed = Methodd diddymu'r tanysgrifiad
sub-route-idx-contact = Cysylltu â Chefnogaeth
sub-route-idx-cancel-msg-title = Mae'n flin gennym eich gweld chi'n gadael
sub-route-idx-cancel-msg =
    Mae eich tanysgrifiad { $name } wedi'i ddiddymu.
          <br />
          Bydd gennych fynediad o hyd i { $name } tan { $date }.
sub-route-idx-cancel-aside-2 = Oes gennych chi gwestiynau? Ewch i <a>{ -brand-mozilla } Cefnogaeth</a>.


sub-customer-error =
    .title = Anhawster llwytho cwsmer
sub-invoice-error =
    .title = Anhawster llwytho anfonebau
sub-billing-update-success = Diweddarwyd eich manylion bilio'n llwyddiannus
sub-invoice-previews-error-title = Anhawster wrth lwytho rhagolwg anfoneb
sub-invoice-previews-error-text = Methu llwytho rhagolygon anfoneb


pay-update-change-btn = Newid
pay-update-manage-btn = Rheoli


sub-next-bill = Bydd y taliad nesaf ar { $date }
sub-next-bill-due-date = Mae'r bil nesaf yn ddyledus ar { $date }
sub-expires-on = Yn dod i ben ar: { $date }




pay-update-card-exp = Daw i ben { $expirationDate }
sub-route-idx-updating = Diweddaru'r manylion bilio…
sub-route-payment-modal-heading = Manylion bilio annilys
sub-route-payment-modal-message-2 = Mae'n ymddangos bod gwall gyda'ch cyfrif { -brand-paypal } , mae angen i chi gymryd y camau angenrheidiol i ddatrys y mater talu hwn.
sub-route-missing-billing-agreement-payment-alert = Manylion talu annilys; mae gwall gyda'ch cyfrif. <div>Rheoli</div>
sub-route-funding-source-payment-alert = Manylion talu annilys; mae gwall gyda'ch cyfrif. Efallai y bydd y rhybudd hwn yn cymryd peth amser i'w glirio ar ôl i chi ddiweddaru'ch manylion yn llwyddiannus. <div> Rheoli </div>


sub-item-no-such-plan = Dim cynllun o'r fath ar gyfer y tanysgrifiad hwn.
invoice-not-found = Heb ganfod yr anfoneb ddilynol
sub-item-no-such-subsequent-invoice = Heb ganfod anfoneb ddilynol y tanysgrifiad hwn.
sub-invoice-preview-error-title = Heb ganfod rhagolwg anfoneb
sub-invoice-preview-error-text = Heb ganfod rhagolwg anfoneb y tanysgrifiad hwn


reactivate-confirm-dialog-header = Am barhau i ddefnyddio { $name }?
reactivate-confirm-copy =
    Bydd eich mynediad i { $name } yn parhau, a bydd eich cylch
    bilio a thalu yn aros yr un peth. Eich tâl nesaf fydd
     { $amount } i'r cerdyn sy'n gorffen { $last } ar { $endDate }.
reactivate-confirm-without-payment-method-copy =
    Bydd eich mynediad i { $name } yn parhau, a bydd eich cylch
    bilio a thalu yn aros yr un peth. Eich tâl nesaf fydd
     { $amount } ar { $endDate }.
reactivate-confirm-button = Ail-danysgrifio


reactivate-panel-copy = Byddwch yn colli mynediad i { $name } ar <strong>{ $date }</strong>.
reactivate-success-copy = Diolch! Rydych nawr yn barod.
reactivate-success-button = Cau


sub-iap-item-google-purchase-2 = { -brand-google } : Prynu o fewn yr ap
sub-iap-item-apple-purchase-2 = { -brand-apple } : Prynu o fewn yr ap
sub-iap-item-manage-button = Rheoli
