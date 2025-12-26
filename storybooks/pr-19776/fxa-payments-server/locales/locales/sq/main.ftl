



-brand-mozilla = Mozilla
-brand-firefox = Firefox
-product-firefox-accounts = Llogari Firefox
-product-mozilla-account = Llogari Mozilla
-product-mozilla-accounts =
    { $capitalization ->
        [uppercase] Llogari Mozilla
       *[lowercase] Llogari Mozilla
    }
-product-firefox-account = Llogari Firefox
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
-brand-link = Lidhje
-brand-mastercard = Mastercard
-brand-unionpay = UnionPay
-brand-visa = Visa
-app-store = App Store
-google-play = Google Play

app-general-err-heading = Gabim i përgjithshëm aplikacioni
app-general-err-message = Diç shkoi ters. Ju lutemi, riprovoni.
app-query-parameter-err-heading = Kërkesë e Gabuar: Parametra të Pavlefshëm Kërkese


app-footer-mozilla-logo-label = Stemë { -brand-mozilla }
app-footer-privacy-notice = Njoftim Privatësie Sajti
app-footer-terms-of-service = Kushte Shërbimi


app-default-title-2 = { -product-mozilla-accounts }
app-page-title-2 = { $title } | { -product-mozilla-accounts }


link-sr-new-window = Hapet në dritare të re


app-loading-spinner-aria-label-loading = Po ngarkohet…


app-logo-alt-3 =
    .alt = Stemë { -brand-mozilla } m



settings-home = Kreu i Llogarive
settings-project-header-title = { -product-mozilla-account }


coupon-promo-code-applied = U aplikua Kod Promocional
coupon-submit = Zbatoje
coupon-remove = Hiqe
coupon-error = Kodi që dhatë është i pavlefshëm, ose ka skaduar.
coupon-error-generic = Ndodhi një gabim me përpunimin e kodit. Ju lutemi, riprovoni.
coupon-error-expired = Kodi që dhatë ka skaduar.
coupon-error-limit-reached = Kodi që dhatë ka mbërritur në kufirin e vet.
coupon-error-invalid = Kodi që dhatë është i pavlefshëm.
coupon-enter-code =
    .placeholder = Jepni Kod


default-input-error = Kjo fushë është e domosdoshme
input-error-is-required = { $label } është i domosdoshëm


brand-name-mozilla-logo = Stemë { -brand-mozilla }


new-user-sign-in-link-2 = Keni tashmë një { -product-mozilla-account }? <a>Bëni hyrjen</a>
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
new-user-invalid-email-domain = Shkruat keq email-in? { $domain } nuk ofron email.


payment-confirmation-thanks-heading = Faleminderit!
payment-confirmation-thanks-heading-account-exists = Faleminderit, tani kontrolloni email-in tuaj!
payment-confirmation-thanks-subheading = A confirmation email has been sent Te { $email } u dërgua një email ripohimi me udhëzime se si t’ia fillohet me { $product_name }.
payment-confirmation-thanks-subheading-account-exists = Do të merrni një email te { $email }, me udhëzime për ujdisjen e llogarisë tuaj, si dhe me hollësitë e pagesës tuaj.
payment-confirmation-order-heading = Hollësi porosie
payment-confirmation-invoice-number = Fatura #{ $invoiceNumber }
payment-confirmation-invoice-date = { $invoiceDate }
payment-confirmation-details-heading-2 = Hollësi pagese
payment-confirmation-amount = { $amount } në { $interval }
payment-confirmation-amount-day =
    { $intervalCount ->
        [one] { $amount } në ditë
       *[other] { $amount } çdo { $intervalCount } ditë
    }
payment-confirmation-amount-week =
    { $intervalCount ->
        [one] { $amount } çdo  javë
       *[other] { $amount } çdo { $intervalCount } javë
    }
payment-confirmation-amount-month =
    { $intervalCount ->
        [one] { $amount } çdo  muaj
       *[other] { $amount } çdo { $intervalCount } muaj
    }
payment-confirmation-amount-year =
    { $intervalCount ->
        [one] { $amount } çdo vit
       *[other] { $amount } çdo { $intervalCount } vjet
    }
payment-confirmation-download-button = Vazhdoni te shkarkimi


payment-confirm-with-legal-links-static-3 = E autorizoj { -brand-mozilla } të faturojë metodën time të pagesave me vlerën e treguar, sipas <termsOfServiceLink>Kushteve të Shërbimit</termsOfServiceLink> dhe <privacyNoticeLink>Shënim Privatësie</privacyNoticeLink>, deri sa ta anuloj pajtimin tim.
payment-confirm-checkbox-error = Lypset të plotësoni këtë, para se ecni më tej


payment-error-retry-button = Riprovoni
payment-error-manage-subscription-button = Administroni pajtimet e mia


iap-upgrade-already-subscribed-2 = Keni tashmë një pajtim { $productName } përmes shitoreve të aplikacioneve { -brand-google } ose { -brand-apple }.
iap-upgrade-no-bundle-support = Nuk mbulojmë përmirësime për këto pajtime, por së shpejti do të mbulojmë.
iap-upgrade-contact-support = Mundeni prapë ta merrni këtë produkt — ju lutemi, lidhuni me asistencën, që të mund t’ju ndihmojmë.
iap-upgrade-get-help-button = Merrni ndihmë


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


payment-legal-copy-stripe-and-paypal-3 = { -brand-mozilla } përdor { -brand-name-stripe } dhe { -brand-paypal } për kryerje të siguruar të pagesave.
payment-legal-link-stripe-paypal-2 = <stripePrivacyLink>Rregulla privatësie { -brand-name-stripe }</stripePrivacyLink> &nbsp; <paypalPrivacyLink>Rregulla privatësie { -brand-paypal }</paypalPrivacyLink>
payment-legal-copy-paypal-2 = { -brand-mozilla } përdor { -brand-paypal } për kryerje të siguruar të pagesave.
payment-legal-link-paypal-3 = <paypalPrivacyLink>Rregulla privatësie { -brand-paypal }</paypalPrivacyLink>
payment-legal-copy-stripe-3 = { -brand-mozilla } përdor { -brand-name-stripe } për përpunim të sigurt të pagesave.
payment-legal-link-stripe-3 = <stripePrivacyLink>{ -brand-name-stripe } rregulla privatësie</stripePrivacyLink>


payment-method-header = Zgjidhni metodën tuaj të pagesës
payment-method-header-second-step = 2. { payment-method-header }
payment-method-first-approve = Së pari, do t’ju duhet të miratoni pajtimin tuaj


payment-processing-message = Ju lutemi, pritni, teksa përpunojmë pagesën tuaj…


payment-confirmation-cc-card-ending-in = Kartë që përfundon me { $last4 }


pay-with-heading-paypal-2 = Paguani me { -brand-paypal }


plan-details-header = Hollësi produkti
plan-details-list-price = Çmim Liste
plan-details-show-button = Shfaq hollësi
plan-details-hide-button = Fshihi hollësitë
plan-details-total-label = Gjithsej
plan-details-tax = Taksa dhe Tarifa


product-no-such-plan = S’ka plan të tillë për këtë produkt.


price-details-no-tax = { $priceAmount }
price-details-tax = { $priceAmount } + { $taxAmount } taksë
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


subscription-create-title = Ujdisje e pajtimit tim
subscription-success-title = Ripohim pajtimi
subscription-processing-title = Po ripohohet pajtimi…
subscription-error-title = Gabim në ripohim pajtimi…
subscription-noplanchange-title = Ky ndryshim plani pajtimi nuk mbulohet
subscription-iapsubscribed-title = I pajtuar tashmë
sub-guarantee = 30 ditë garanci kthimi parash


subplat-mozilla-accounts-legal-heading = { -product-mozilla-accounts(capitalization: "uppercase") }
terms = Kushte Shërbimi
privacy = Shënim Mbi Privatësinë
terms-download = Kushte Shkarkimi


document =
    .title = Llogari Firefox
close-aria =
    .aria-label = Mbylle dritaren modale
settings-subscriptions-title = Pajtime
coupon-promo-code = Kod Promocional


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
iap-already-subscribed = Jeni tashmë i pajtuar përmes { $mobileAppStore }.
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


coupon-success = Plani juaj do të rinovohet vetvetiu me çmimin e treguar te lista.
coupon-success-repeating = Plani juaj do të rinovohet vetvetiu pas { $couponDurationDate } sipas çmimit të rregullt.


new-user-step-1-2 = 1. Krijoni një { -product-mozilla-account }
new-user-card-title = Jepni hollësitë e kartës tuaj
new-user-submit = Pajtohuni Tani


sub-update-payment-title = Të dhëna pagese


pay-with-heading-card-only = Paguani me kartë
product-invoice-preview-error-title = Problem me ngarkim paraparjeje fature
product-invoice-preview-error-text = S’u ngarkua dot paraparje faturash


subscription-iaperrorupgrade-title = S’ju përmirësojmë dot ende


brand-name-google-play-2 = Shitore { -google-play }
brand-name-apple-app-store-2 = { -app-store }


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


sub-update-new-plan-daily = { $productName } (E përditshme)
sub-update-new-plan-weekly = { $productName } (E përjavshme)
sub-update-new-plan-monthly = { $productName } (E përmuajshme)
sub-update-new-plan-yearly = { $productName } (E përvitshme)
sub-update-prorated-upgrade-credit = Balanca negative e treguar do të aplikohet si kredit te llogaria juaj dhe përdoret për fatura të ardhshme.


sub-item-cancel-sub = Anulojeni Pajtimin
sub-item-stay-sub = Qëndroni i Pajtuar


sub-item-cancel-msg = Pas { $period }, dita e fundit e ciklit tuaj të faturimit, s’do të jeni në gjendje të përdorni { $name }.
sub-item-cancel-confirm = Më { $period }, anuloni hyrjen time dhe të dhëna të miat të ruajtura brenda { $name }
sub-promo-coupon-applied = Kuponi { $promotion_name } u aplikua: <priceDetails></priceDetails>
subscription-management-account-credit-balance = Kjo pagesë pajtimit dha një kredit te balanca e llogarisë tuaj: <priceDetails></priceDetails>


sub-route-idx-reactivating = Riaktivizimi i pajtimit dështoi
sub-route-idx-cancel-failed = Anulimi i pajtimit dështoi
sub-route-idx-contact = Lidhuni Me Asistencën
sub-route-idx-cancel-msg-title = Na vjen keq t’ju shohim të largoheni
sub-route-idx-cancel-msg =
    Pajtimi juaj në { $name } është anuluar.
          <br />
         Do të mund të përdorni ende { $name } deri më { $date }.
sub-route-idx-cancel-aside-2 = Keni pyetje? Vizitoni <a>Asistencën e { -brand-mozilla }-s</a>.


sub-customer-error =
    .title = Problem në ngarkim klienti
sub-invoice-error =
    .title = Problem në ngarkim faturash
sub-billing-update-success = Të dhënat tuaja të faturimit u përditësuan me sukses
sub-invoice-previews-error-title = Problem në ngarkim paraparjesh faturash
sub-invoice-previews-error-text = S’u ngarkuan dot paraparje faturash


pay-update-change-btn = Ndryshoje
pay-update-manage-btn = Administrojini


sub-next-bill = Faturimi i ardhshëm më { $date }
sub-next-bill-due-date = Faturimi i ardhshëm skadon më { $date }
sub-expires-on = Skadon më { $date }




pay-update-card-exp = Skadon më { $expirationDate }
sub-route-idx-updating = Po përditësohen të dhëna faturimi…
sub-route-payment-modal-heading = Të dhëna faturimi të pavlefshme
sub-route-payment-modal-message-2 = Duket të ketë një gabim me llogarinë tuaj { -brand-paypal }, lypset të ndërmerrni hapat e nevojshëm për të zgjidhur këtë problem pagese.
sub-route-missing-billing-agreement-payment-alert = Hollësi të pavlefshme pagese; ka një gabim me llogarinë tuaj. <div>Shiheni</div>
sub-route-funding-source-payment-alert = Hollësi të pavlefshme pagese; ka një gabim me llogarinë tuaj. Mund të duhet ca kohë që të hiqet ky sinjalizim, pasi të përditësoni me sukses hollësitë tuaja. <div>Shiheni</div>


sub-item-no-such-plan = S’ka plan të tillë për këtë pajtim.
invoice-not-found = S’u gjet fatura pasuese
sub-item-no-such-subsequent-invoice = S’u gjet fatura pasuese për këtë pajtim.
sub-invoice-preview-error-title = S’u gjet paraparje fature
sub-invoice-preview-error-text = S’u gjet paraparje fature për këtë pajtim


reactivate-confirm-dialog-header = Doni të vazhdoni të përdorni { $name }?
reactivate-confirm-copy =
    Përdorimi juaj i { $name } do të vazhdojë, dhe cikli juaj i faturimit dhe pagesa do të mbeten të njëjtët. Faturimi juaj pasues do të jetë
    { $amount } te karta që përfundon me { $last } më { $endDate }.
reactivate-confirm-without-payment-method-copy =
    Përdorimi juaj i { $name } do të vazhdojë, dhe cikli juaj i faturimit dhe pagesa do të mbeten të njëjtët. Faturimi juaj pasues do të jetë
    { $amount } më { $endDate }.
reactivate-confirm-button = Ripajtohuni


reactivate-panel-copy = Do të humbni mundësinë e përdorimit të { $name } më <strong>{ $date }</strong>.
reactivate-success-copy = Faleminderit! Gjithçka gati.
reactivate-success-button = Mbylle


sub-iap-item-google-purchase-2 = { -brand-google }: Blerje që nga aplikacioni
sub-iap-item-apple-purchase-2 = { -brand-apple }: Blerje që nga aplikacioni
sub-iap-item-manage-button = Administrojini
