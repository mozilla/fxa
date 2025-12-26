



-brand-mozilla = Mozilla
-brand-firefox = Firefox
-product-firefox-accounts = Firefoxeko kontuak
-product-mozilla-account = Mozilla kontua
-product-mozilla-accounts =
    { $capitalization ->
        [uppercase] Mozilla kontuak
       *[lowercase] Mozilla kontuak
    }
-product-firefox-account = Firefox kontua
-product-mozilla-vpn = Mozilla VPN
-product-mozilla-hubs = Mozilla Hubs
-product-mdn = MDN
-product-mdn-plus = MDN Plus
-product-firefox-cloud = Firefox Cloud
-product-mozilla-monitor = Mozilla Monitor
-product-firefox-relay = Firefox Relay
-brand-apple = Apple
-brand-google = Google
-brand-paypal = PayPal
-brand-name-stripe = Stripe
-app-store = App Store
-google-play = Google Play

app-general-err-heading = Aplikazioaren errore orokorra
app-general-err-message = Zerbait oker joan da. Mesedez, berriro saiatu beranduago.
app-query-parameter-err-heading = Eskaera okerra: kontsulta-parametro baliogabeak


app-footer-mozilla-logo-label = { -brand-mozilla } logoa
app-footer-privacy-notice = Webgunearen pribatutasun-oharra
app-footer-terms-of-service = Zerbitzuaren baldintzak


app-default-title-2 = { -product-mozilla-accounts }
app-page-title-2 = { $title } | { -product-mozilla-accounts }


link-sr-new-window = Ireki leiho berrian


app-loading-spinner-aria-label-loading = Kargatzen…


app-logo-alt-3 =
    .alt = { -brand-mozilla } logoa



settings-home = Kontuaren hasiera-orria
settings-project-header-title = { -product-mozilla-account }


coupon-promo-code-applied = Promozio kodea aplikatuta
coupon-submit = Aplikatu
coupon-remove = Kendu
coupon-error = Sartu duzun kodea iraungita dago edo baliogabea da.
coupon-error-generic = Errore bat gertatu da kodea prozesatzen. Mesedez, saiatu berriro.
coupon-error-expired = Sartu duzun kodea iraungi egin da.
coupon-error-limit-reached = Sartu duzun kodea bere mugara iritsi da.
coupon-error-invalid = Sartu duzun kodea baliogabea da.
coupon-enter-code =
    .placeholder = Sartu kodea


default-input-error = Eremu hau beharrezkoa da
input-error-is-required = { $label } beharrezkoa da


brand-name-mozilla-logo = { -brand-mozilla } logoa


new-user-sign-in-link-2 = Jada badaukazu { -product-mozilla-account }? <a>Hasi saioa</a>
new-user-enter-email =
    .label = Idatzi zure helbide elektronikoa
new-user-confirm-email =
    .label = Berretsi helbide elektronikoa
new-user-subscribe-product-updates-mozilla = { -brand-mozilla } produktuen berri eta eguneraketak jaso nahi ditut.
new-user-subscribe-product-updates-snp = { -brand-mozilla } segurtasun eta pribatutasun albisteak eta eguneraketak jaso nahi ditut.
new-user-subscribe-product-updates-hubs = { -product-mozilla-hubs } eta { -brand-mozilla } produktuen berri eta eguneraketak jaso nahi ditut.
new-user-subscribe-product-updates-mdnplus = { -product-mdn-plus } eta { -brand-mozilla } produktuen berri eta eguneraketak jaso nahi ditut
new-user-subscribe-product-assurance = Zure posta elektronikoa zure kontua sortzeko soilik erabiltzen dugu. Ez diogu inoiz hirugarren bati salduko.
new-user-email-validate = Posta elektronikoa ez da baliozkoa
new-user-email-validate-confirm = Postak ez datoz bat.
new-user-already-has-account-sign-in = Dagoeneko kontu bat duzu. <a>Hasi saioa</a>
new-user-invalid-email-domain = Helbidea gaizki idatzi duzu? { $domain } domeinuak ez du posta elektroniko zerbitzurik.


payment-confirmation-thanks-heading = Eskerrik asko!
payment-confirmation-thanks-heading-account-exists = Eskerri asko, begiratu zure posta elektronikoa
payment-confirmation-thanks-subheading = Berrespen-mezu bat bidali da { $email } helbidera, { $product_name } erabiltzen hasteko xehetasunekin.
payment-confirmation-thanks-subheading-account-exists = { $email } helbidean mezu elektroniko bat jasoko duzu zure kontua konfiguratzeko argibideekin, baita zure ordainketa xehetasunekin ere.
payment-confirmation-order-heading = Eskaeraren xehetasunak
payment-confirmation-invoice-number = Faktura #{ $invoiceNumber }
payment-confirmation-invoice-date = { $invoiceDate }
payment-confirmation-details-heading-2 = Ordainketa informazioa
payment-confirmation-amount = { $amount } { $interval }-(e)ro
payment-confirmation-amount-day =
    { $intervalCount ->
        [one] { $amount } egunero
       *[other] { $amount } { $intervalCount } egunetik behin
    }
payment-confirmation-amount-week =
    { $intervalCount ->
        [one] { $amount } astero
       *[other] { $amount } { $intervalCount } astetik behin
    }
payment-confirmation-amount-month =
    { $intervalCount ->
        [one] { $amount } hilero
       *[other] { $amount } { $intervalCount } hiletik behin
    }
payment-confirmation-amount-year =
    { $intervalCount ->
        [one] { $amount } urtero
       *[other] { $amount } { $intervalCount } urtetik behin
    }
payment-confirmation-download-button = Jarraitu deskargara


payment-confirm-with-legal-links-static-3 = Baimena ematen diot { -brand-mozilla }-ri nire ordainketa-metodoari kobratzeko erakutsitako zenbatekoa, <termsOfServiceLink>Zerbitzu-baldintzen arabera</termsOfServiceLink> eta <privacyNoticeLink>Pribatutasun-oharra</privacyNoticeLink>, nire harpidetza bertan behera utzi arte.
payment-confirm-checkbox-error = Hau osatu behar duzu aurrera egin aurretik


payment-error-retry-button = Saiatu berriro
payment-error-manage-subscription-button = Kudeatu nire harpidetza


iap-upgrade-already-subscribed-2 = Dagoeneko { $productName } harpidetza duzu { -brand-google } edo { -brand-apple } aplikazio denden bidez.
iap-upgrade-no-bundle-support = Ez dugu harpidetza hauetarako bertsio berritzea onartzen, baina laster egingo dugu.
iap-upgrade-contact-support = Produktu hau eskura dezakezu oraindik. Jarri laguntza-zerbitzuarekin laguntza lortzeko.
iap-upgrade-get-help-button = Lortu laguntza


payment-name =
    .placeholder = Izen osoa
    .label = Zure txartelean agertzen den izena
payment-cc =
    .label = Zure txartela
payment-cancel-btn = Utzi
payment-update-btn = Eguneratu
payment-pay-btn = Ordaindu orain
payment-pay-with-paypal-btn-2 = Ordaindu { -brand-paypal } erabiliz
payment-validate-name-error = Idatzi zure izena


payment-legal-copy-stripe-and-paypal-3 = { -brand-mozilla }-k { -brand-name-stripe } eta { -brand-paypal } erabiltzen ditu ordainketa seguruak izateko.
payment-legal-link-stripe-paypal-2 = <stripePrivacyLink>{ -brand-name-stripe }  pribatutasun politika </stripePrivacyLink> &nbsp; <paypalPrivacyLink>{ -brand-paypal } pribatutasun politika</paypalPrivacyLink>
payment-legal-copy-paypal-2 = { -brand-mozilla }-k { -brand-paypal } darabil ordainketa seguruak izateko.
payment-legal-link-paypal-3 = <paypalPrivacyLink>{ -brand-paypal } pribatutasun politika</paypalPrivacyLink>
payment-legal-copy-stripe-3 = { -brand-mozilla }-k { -brand-name-stripe } darabil ordainketa seguruak izateko.
payment-legal-link-stripe-3 = <stripePrivacyLink>{ -brand-name-stripe } pribatutasun politika</stripePrivacyLink>


payment-method-header = Hautatu zure ordaiketa metodoa
payment-method-header-second-step = 2. { payment-method-header }
payment-method-first-approve = Lehenik eta behin zure harpidetza onartu beharko duzu


payment-processing-message = Mesedez, itxaron ordainketa prozesatzen dugun bitartean…


payment-confirmation-cc-card-ending-in = { $last4 }-z amaitzen den txartela


pay-with-heading-paypal-2 = Ordaindu { -brand-paypal } erabiliz


plan-details-header = Produktuaren xehetasuna
plan-details-list-price = Prezio zerrenda
plan-details-show-button = Erakutsi xehetasunak
plan-details-hide-button = Ezkutatu xehetasunak
plan-details-total-label = Guztira
plan-details-tax = Zergak eta Tasak


product-no-such-plan = Ez dago horrelako planik produktu honetarako.


price-details-no-tax = { $priceAmount }
price-details-tax = { $priceAmount } + { $taxAmount } zerga
price-details-no-tax-day =
    { $intervalCount ->
        [one] { $priceAmount } egunero
       *[other] { $priceAmount } { $intervalCount } egunetik behin
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } egunero
           *[other] { $priceAmount } { $intervalCount } egunetik behin
        }
price-details-no-tax-week =
    { $intervalCount ->
        [one] { $priceAmount } astero
       *[other] { $priceAmount } { $intervalCount } astetik behin
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } astero
           *[other] { $priceAmount } { $intervalCount } astetik behin
        }
price-details-no-tax-month =
    { $intervalCount ->
        [one] { $priceAmount } hilero
       *[other] { $priceAmount } { $intervalCount } hiletik behin
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } hilero
           *[other] { $priceAmount } { $intervalCount } hiletik behin
        }
price-details-no-tax-year =
    { $intervalCount ->
        [one] { $priceAmount } urtero
       *[other] { $priceAmount } { $intervalCount } urtetik behin
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } urtero
           *[other] { $priceAmount } { $intervalCount } urtetik behin
        }
price-details-tax-day =
    { $intervalCount ->
        [one] { $priceAmount } + { $taxAmount } zerga egunero
       *[other] { $priceAmount } + { $taxAmount } zerga { $intervalCount } egunetik behin
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + { $taxAmount } zerga egunero
           *[other] { $priceAmount } + { $taxAmount } zerga { $intervalCount } egunetik behin
        }
price-details-tax-week =
    { $intervalCount ->
        [one] { $priceAmount } + { $taxAmount } zerga astero
       *[other] { $priceAmount } + { $taxAmount } zerga { $intervalCount } astetik bahin
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + { $taxAmount } zerga astero
           *[other] { $priceAmount } + { $taxAmount } zerga { $intervalCount } astetik bahin
        }
price-details-tax-month =
    { $intervalCount ->
        [one] { $priceAmount } + { $taxAmount } zerga hilero
       *[other] { $priceAmount } + { $taxAmount } zerga { $intervalCount } hiletik behin
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + { $taxAmount } zerga hilero
           *[other] { $priceAmount } + { $taxAmount } zerga { $intervalCount } hiletik behin
        }
price-details-tax-year =
    { $intervalCount ->
        [one] { $priceAmount } + { $taxAmount } zerga urtero
       *[other] { $priceAmount } + { $taxAmount } zerga { $intervalCount } urtetik behin
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + { $taxAmount } zerga urtero
           *[other] { $priceAmount } + { $taxAmount } zerga { $intervalCount } urtetik behin
        }


subscription-create-title = Zure harpidetzaren ezarpenak
subscription-success-title = Harpidetza baieztapena
subscription-processing-title = Harpidetza baieztatzen…
subscription-error-title = Errorea harpidetza baieztatzen…
subscription-noplanchange-title = Harpidetza-planaren aldaketa ez da onartzen
subscription-iapsubscribed-title = Bazadude harpidetua
sub-guarantee = 30 eguneko dirua itzultzeko bermea


subplat-mozilla-accounts-legal-heading = { -product-mozilla-accounts(capitalization: "uppercase") }
terms = Zerbitzuaren baldintzak
privacy = Pribatutasun-oharra
terms-download = Deskargatu baldintzak


document =
    .title = Firefoxeko kontuak
close-aria =
    .aria-label = Itxi leiho modala
settings-subscriptions-title = Harpidetzak
coupon-promo-code = Sustapen kodea


plan-price-interval-day =
    { $intervalCount ->
        [one] { $amount } egunero
       *[other] { $amount } { $intervalCount } egunetik behin
    }
    .title =
        { $intervalCount ->
            [one] { $amount } egunero
           *[other] { $amount } { $intervalCount } egunetik behin
        }
plan-price-interval-week =
    { $intervalCount ->
        [one] { $amount } astero
       *[other] { $amount } { $intervalCount } astetik behin
    }
    .title =
        { $intervalCount ->
            [one] { $amount } astero
           *[other] { $amount } { $intervalCount } astetik behin
        }
plan-price-interval-month =
    { $intervalCount ->
        [one] { $amount } hilero
       *[other] { $amount } { $intervalCount } hiletik behin
    }
    .title =
        { $intervalCount ->
            [one] { $amount } hilero
           *[other] { $amount } { $intervalCount } hiletik behin
        }
plan-price-interval-year =
    { $intervalCount ->
        [one] { $amount } urtero
       *[other] { $amount } { $intervalCount } urtetik behin
    }
    .title =
        { $intervalCount ->
            [one] { $amount } urtero
           *[other] { $amount } { $intervalCount } urtetik behin
        }


general-error-heading = Aplikazioaren errore orokorra
basic-error-message = Zerbait oker joan da. Mesedez, berriro saiatu beranduago.
payment-error-1 = Hmm. Arazo bat izan da zure ordainketa baimentzean. Saiatu berriro edo jarri harremanetan txartelaren jaulkitzailearekin.
payment-error-2 = Hmm. Arazo bat izan da zure ordainketa baimentzean. Jarri harremanetan zure txartelaren jaulkitzailearekin.
payment-error-3b = Ustekabeko errore bat gertatu da ordainketa prozesatzen ari zaren bitartean. Saiatu berriro.
expired-card-error = Zure kreditu-txartela iraungi dela dirudi. Probatu beste txartel bat.
insufficient-funds-error = Zure txartelak funts nahikorik ez duela dirudi. Probatu beste txartel bat.
withdrawal-count-limit-exceeded-error = Badirudi transakzio honek zure kreditu-muga gaindituko duela. Probatu beste txartel bat.
charge-exceeds-source-limit = Badirudi transakzio honek zure eguneroko kreditu-muga gaindituko duela. Probatu beste txartel bat edo 24 ordu barru.
instant-payouts-unsupported = Badirudi zordunketa-txartela ez dagoela berehalako ordainketak egiteko konfiguratuta. Probatu beste zordunketa edo kreditu txartel bat.
duplicate-transaction = Hmm. Transakzio berdina bidali berri dela dirudi. Egiaztatu zure ordainketa-historia.
coupon-expired = Sustapen-kode hori iraungi dela dirudi.
card-error = Ezin izan da prozesatu zure transakzioa. Egiaztatu kreditu txartelaren informazioa eta saiatu berriro.
country-currency-mismatch = Harpidetza honen dibisak ez du balio ordainketarekin lotutako herrialderako.
currency-currency-mismatch = Barkatu. Ezin duzu txanpon/dibisa batetik bestera aldatu.
location-unsupported = Zure uneko kokapena ez da onartzen gure Zerbitzu-baldintzen arabera.
no-subscription-change = Barkatu. Ezin duzu zure harpidetza-plana aldatu.
iap-already-subscribed = Dagoeneko { $mobileAppStore } bidez harpidetuta zaude.
fxa-account-signup-error-2 = Sistemaren errore batek zure { $productName } erregistratzea huts egin du. Zure ordainketa-metodoa ez da kobratu. Mesedez, saiatu berriro.
fxa-post-passwordless-sub-error = Harpidetza berretsi da, baina berrespen orria ezin izan da kargatu. Mesedez, egiaztatu zure posta elektronikoa zure kontua konfiguratzeko.
newsletter-signup-error = Ez zaude erregistratuta produktuen eguneratze-mezu elektronikoetarako. Berriro saia zaitezke zure kontuaren ezarpenetan.
product-plan-error =
    .title = Arazoa planak kargatzerakoan
product-profile-error =
    .title = Arazoa profila kargatzerakoan
product-customer-error =
    .title = Arazoa bezeroa kargatzerakoan
product-plan-not-found = Ez da plana aurkitu
product-location-unsupported-error = Kokapen ez onartua


coupon-success = Zure plana automatikoki berrituko da zerrendako prezioan.
coupon-success-repeating = Zure plana automatikoki berrituko da { $couponDurationDate } ondoren zerrendako prezioan.


new-user-step-1-2 = 1. sortu { -product-mozilla-account }
new-user-card-title = Sartu zure txartelaren informazioa
new-user-submit = Harpidetu orain


sub-update-payment-title = Ordainketa informazioa


pay-with-heading-card-only = Ordaindu txartelaz
product-invoice-preview-error-title = Arazoa faktura aurrebista kargatzerakoan
product-invoice-preview-error-text = Ezin da faktura aurrebista kargatu


subscription-iaperrorupgrade-title = Ezin zaitugu oraindik berritu


brand-name-google-play-2 = { -google-play } Store
brand-name-apple-app-store-2 = { -app-store }


product-plan-change-heading = Berrikusi zure aldaketa
sub-change-failed = Plan aldaketak huts egin du
sub-update-acknowledgment =
    Zure plana berehala aldatuko da, eta proportzioan kobratuko dizugu
    zenbatekoa. gaurtik fakturazio-ziklo honen gainerako.  { $startingDate }
    hasita kopuru osoa kobratuko dizute.
sub-change-submit = Berretsi aldaketa
sub-update-current-plan-label = Uneko plana
sub-update-new-plan-label = Plan berria
sub-update-total-label = Guztira berria
sub-update-prorated-upgrade = Bertsio proportzionala


sub-update-new-plan-daily = { $productName } (egunero)
sub-update-new-plan-weekly = { $productName } (astero)
sub-update-new-plan-monthly = { $productName } (hilero)
sub-update-new-plan-yearly = { $productName } (urtero)


sub-item-cancel-sub = Utzi harpidetza
sub-item-stay-sub = Jarraitu harpidetua


sub-item-cancel-msg =
    Aurrerantzean ezin izango duzu { $name } erabili
    { $period }, fakturazio-zikloaren azken eguna.
sub-item-cancel-confirm =
    Bertan behera utzi dudan sarbidea eta gordetako informazioa
    { $name } { $period } egunean
sub-promo-coupon-applied = { $promotion_name } kupoia erabilita: <priceDetails></priceDetails>


sub-route-idx-reactivating = Harpidetza beraktibatzeak huts egin du
sub-route-idx-cancel-failed = Harpidetza bertan behera uzteak huts egin du
sub-route-idx-contact = Laguntza kontaktua
sub-route-idx-cancel-msg-title = Sentitzen dugu zu joaten ikusteak
sub-route-idx-cancel-msg =
    Zure { $name } harpidetza bertan behera utzi da.
          <br />
          { $name } sarbidea izango duzu oraindik { $date } arte.
sub-route-idx-cancel-aside-2 = Galderarik baduzu? Joan <a>{ -brand-mozilla } Laguntzara</a>.


sub-customer-error =
    .title = Arazoa bezeroa kargatzerakoan
sub-invoice-error =
    .title = Arazoa faktura kargatzerakoan
sub-billing-update-success = Zure fakturazio-informazioa behar bezala eguneratu da
sub-invoice-previews-error-title = Arazoa faktura aurrebistak kargatzerakoan
sub-invoice-previews-error-text = Ezin da faktura aurrebistak kargatu


pay-update-change-btn = Aldatu
pay-update-manage-btn = Kudeatu


sub-next-bill = Hurrengo fakturazioa { $date }
sub-expires-on = Iraungitze data: { $date }




pay-update-card-exp = Iraungitzea { $expirationDate }
sub-route-idx-updating = Fakturazio-informazioa eguneratzen…
sub-route-payment-modal-heading = Fakturazio-informazio baliogabea
sub-route-payment-modal-message-2 = Errore bat dagoela dirudi zure { -brand-paypal } kontuarekin, ordainketa-arazo hau konpontzeko beharrezko urratsak eman behar dituzu.
sub-route-missing-billing-agreement-payment-alert = Ordainketa-informazio baliogabea; errore bat dago zure kontuarekin. <div>Kudeatu</div>
sub-route-funding-source-payment-alert = Ordainketa-informazio baliogabea; errore bat dago zure kontuarekin. Baliteke alerta hau denbora pixka bat behar izatea garbitzeko zure informazioa behar bezala eguneratu ondoren. <div>Kudeatu</div>


sub-item-no-such-plan = Ez dago horrelako planik harpidetza honetarako.
invoice-not-found = Ez da ondorengo faktura aurkitu
sub-item-no-such-subsequent-invoice = Ez da aurkitu harpidetza honen ondorengo faktura.
sub-invoice-preview-error-title = Ez da fakturen aurrebista aurkitu
sub-invoice-preview-error-text = Ez da aurkitu harpidetza honetarako fakturen aurrebista


reactivate-confirm-dialog-header = { $name } erabiltzen jarraitu nahi duzu?
reactivate-confirm-copy =
    { $name }-rako sarbidea jarraituko du eta fakturazio-zikloa 
    eta ordainketa berdin jarraituko du. Zure hurrengo kargua  { $amount } izango da
    { $last }-z amaitzen den txartelean { $endDate } datan.
reactivate-confirm-without-payment-method-copy =
    { $name }-rako sarbidea jarraituko du eta fakturazio-zikloa 
    eta ordainketa berdin jarraituko du. Zure hurrengo kargua 
    { $amount } izango da { $endDate } datan.
reactivate-confirm-button = Harpidetza berritu


reactivate-panel-copy = { $name }rako sarbidea galduko duzu <strong>{ $date }</strong> egunean.
reactivate-success-copy = Eskerrik asko! Dena prest daukazu.
reactivate-success-button = Itxi


sub-iap-item-google-purchase-2 = { -brand-google }: aplikazioko erosketa
sub-iap-item-apple-purchase-2 = { -brand-apple }: aplikazioko erosketa
sub-iap-item-manage-button = Kudeatu
