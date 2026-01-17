



-brand-mozilla = Mozilla
-brand-firefox = Firefox
-product-firefox-accounts = cunti di Firefox
-product-mozilla-account = cuntu Mozilla
-product-mozilla-accounts =
    { $capitalization ->
        [uppercase] Cunti Mozilla
       *[lowercase] cunti Mozilla
    }
-product-firefox-account = cuntu Firefox
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
-brand-google = Google
-brand-paypal = PayPal
-brand-name-stripe = Stripe
-brand-amex = American Express
-brand-diners = Diners Club
-brand-discover = Discover
-brand-jcb = JCB
-brand-mastercard = Mastercard
-brand-unionpay = UnionPay
-brand-visa = Visa
-app-store = App Store
-google-play = Google Play

app-general-err-heading = Erruri ginirali di l’applicazzioni
app-general-err-message = Cci fu un prubblema. Pi favuri torna a prova cchiù tardu.
app-query-parameter-err-heading = Dumanna nun vàlita: paràmitri dâ query nun vàliti


app-footer-mozilla-logo-label = Mercu di { -brand-mozilla }
app-footer-privacy-notice = Abbisu di privatizza dû situ
app-footer-terms-of-service = Tèrmini di sirbizzu


app-default-title-2 = { -product-mozilla-accounts }
app-page-title-2 = { $title } | { -product-mozilla-accounts(capitalization: "uppercase") }


link-sr-new-window = Si rapi nta na finestra nova


app-loading-spinner-aria-label-loading = Staju carricannu…


app-logo-alt-3 =
    .alt = Mercu di { -brand-mozilla } m



settings-home = Pàggina mastra dû cuntu
settings-project-header-title = { -product-mozilla-account(capitalization: "uppercase") }


coupon-promo-code-applied = Còdici prumuzziunali usatu
coupon-submit = Riggistra
coupon-remove = Leva
coupon-error = U còdici chi mittisti nun è vàlitu o scadìu.
coupon-error-generic = Cci fu un prubblema riggistrannu u còdici. Pi favuri torna a prova.
coupon-error-expired = U còdici chi mittisti scadìu.
coupon-error-limit-reached = U còdici chi mittisti passau u so lìmiti d’usu.
coupon-error-invalid = U còdici chi mittisti nun è vàlitu.
coupon-enter-code =
    .placeholder = Metti u còdici


default-input-error = Campu ubbligatoriu
input-error-is-required = { $label } è un campu ubbligatoriu


brand-name-mozilla-logo = Mercu di { -brand-mozilla }


new-user-sign-in-link-2 = Già ài un { -product-mozilla-account }? <a>Trasi</a>
new-user-enter-email =
    .label = Metti u to nnirizzu di posta elittrònica
new-user-confirm-email =
    .label = Cunferma u to nnirizzu di posta elittrònica
new-user-subscribe-product-updates-mozilla = Vogghiu aviri nutizzi e attualizzi ncapu ê prudutti di { -brand-mozilla }
new-user-subscribe-product-updates-snp = Vogghiu aviri nutizzi e attualizzi di sicurizza e privatizza di { -brand-mozilla }
new-user-subscribe-product-updates-hubs = Vogghiu aviri nutizzi e attualizzi ncapu ê prudutti di { -product-mozilla-hubs } e { -brand-mozilla }
new-user-subscribe-product-updates-mdnplus = Vogghiu aviri nutizzi e attualizzi ncapu ê prudutti di { -product-mdn-plus } e { -brand-mozilla }
new-user-subscribe-product-assurance = Usamu u to nnirizzu di posta elittrònica sulu pi crìari u to cuntu. Nun u vinnemu mai a nuḍḍu.
new-user-email-validate = U nnirizzu di posta elittrònica nun è vàlitu
new-user-email-validate-confirm = I nnirizzi di posta elittrònica nun appàttanu
new-user-already-has-account-sign-in = Già ài un cuntu. <a>Trasi</a>
new-user-invalid-email-domain = Sbagghiasti a scrìviri? { $domain } nun àvi un sirbizzu di posta elittrònica.


payment-confirmation-thanks-heading = Grazzi!
payment-confirmation-thanks-heading-account-exists = Grazzi! Ora cuntrolla a to posta elittrònica.
payment-confirmation-thanks-subheading = Na littra di cunferma fu mannata ô nnirizzu { $email } chî minutagghi pi principijari cu { $product_name }.
payment-confirmation-thanks-subheading-account-exists = Hâ ricìviri na littra ô nnirizzu { $email } cu l’istruzzioni pi cunfijurari u to cuntu, e chî to minutagghi di pagamentu.
payment-confirmation-order-heading = Minutagghi di l’ùrdini
payment-confirmation-invoice-number = Fattura #{ $invoiceNumber }
payment-confirmation-invoice-date = { $invoiceDate }
payment-confirmation-details-heading-2 = Nfurmazzioni di pagamentu
payment-confirmation-amount = { $amount } pi { $interval }
payment-confirmation-amount-day =
    { $intervalCount ->
        [one] { $amount } ô jornu
       *[other] { $amount } ogni { $intervalCount } jorna
    }
payment-confirmation-amount-week =
    { $intervalCount ->
        [one] { $amount } â simana
       *[other] { $amount } ogni { $intervalCount } simani
    }
payment-confirmation-amount-month =
    { $intervalCount ->
        [one] { $amount } ô misi
       *[other] { $amount } ogni { $intervalCount } misi
    }
payment-confirmation-amount-year =
    { $intervalCount ->
        [one] { $amount } ogni annu
       *[other] { $amount } ogni { $intervalCount } anni
    }
payment-confirmation-download-button = Cuntinua cû scarricamentu


payment-confirm-with-legal-links-static-3 = Auturizzu { -brand-mozilla } a pigghiàrisi u mportu mustratu dû me mètudu di pagamentu, sicunnu i <termsOfServiceLink>tèrmini di sirbizzu</termsOfServiceLink> e l’<privacyNoticeLink>abbisu di privatizza</privacyNoticeLink>, nzinu a quannu nun mi disiscrivu.
payment-confirm-checkbox-error = Hâ cumplitari stu passaggiu prima di jiri innanzi


payment-error-retry-button = Prova arrè
payment-error-manage-subscription-button = Manija u me abbunamentu


iap-upgrade-already-subscribed-2 = Già ài n’abbunamentu a { $productName } fattu nta l’app store di { -brand-google } o { -brand-apple }.
iap-upgrade-no-bundle-support = Pi st’abbunamenti nun suppurtamu l’attualizzi accamora, ma prestu i suppurtaremu.
iap-upgrade-contact-support = Po’ ancora aviri stu pruduttu — pi favuri cuntatta u supportu p’aviri ajutu.
iap-upgrade-get-help-button = Fatti ajutari


payment-name =
    .placeholder = Nomu cumpletu
    .label = U nomu pi comu affaccia nnâ to carta
payment-cc =
    .label = A to carta
payment-cancel-btn = Sfai
payment-update-btn = Attualizza
payment-pay-btn = Paga ora
payment-pay-with-paypal-btn-2 = Paga cu { -brand-paypal }
payment-validate-name-error = Pi favuri metti u to nomu


payment-legal-copy-stripe-and-paypal-3 = { -brand-mozilla } usa { -brand-name-stripe } e { -brand-paypal } pi prucissari i pagamenti di manera sicura.
payment-legal-link-stripe-paypal-2 = <stripePrivacyLink>Pulìtica di privatizza di { -brand-name-stripe }</stripePrivacyLink> &nbsp; <paypalPrivacyLink>Pulìtica di privatizza di { -brand-paypal }</paypalPrivacyLink>
payment-legal-copy-paypal-2 = { -brand-mozilla } usa { -brand-paypal } pi prucissari i pagamenti di manera sicura.
payment-legal-link-paypal-3 = <paypalPrivacyLink>Pulìtica di privatizza di { -brand-paypal }</paypalPrivacyLink>
payment-legal-copy-stripe-3 = { -brand-mozilla } usa { -brand-name-stripe } pi prucissari i pagamenti di manera sicura.
payment-legal-link-stripe-3 = <stripePrivacyLink>Pulìtica di privatizza di { -brand-name-stripe }</stripePrivacyLink>


payment-method-header = Scarta u to mètudu di pagamentu
payment-method-header-second-step = 2. { payment-method-header }
payment-method-first-approve = Pi prima cosa, hâ appruvari u to abbunamentu


payment-processing-message = Pi favuri aspetta mentri chi prucissamu u pagamentu…


payment-confirmation-cc-card-ending-in = Carta chi finisci pi { $last4 }


pay-with-heading-paypal-2 = Paga cu { -brand-paypal }


plan-details-header = Minutagghi dû pruduttu
plan-details-list-price = Prezzu currenti
plan-details-show-button = Mustra i minutagghi
plan-details-hide-button = Ammuccia i minutagghi
plan-details-total-label = Tutali
plan-details-tax = Tassi e cummissioni


product-no-such-plan = Nun cc’è nuḍḍu chianu di stu tipu pi stu pruduttu.


price-details-no-tax = { $priceAmount }
price-details-tax = { $priceAmount } + { $taxAmount } di tassi
price-details-no-tax-day =
    { $intervalCount ->
        [one] { $priceAmount } ô jornu
       *[other] { $priceAmount } ogni { $intervalCount } jorna
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } ô jornu
           *[other] { $priceAmount } ogni { $intervalCount } jorna
        }
price-details-no-tax-week =
    { $intervalCount ->
        [one] { $priceAmount } â simana
       *[other] { $priceAmount } ogni { $intervalCount } simani
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } â simana
           *[other] { $priceAmount } ogni { $intervalCount } simani
        }
price-details-no-tax-month =
    { $intervalCount ->
        [one] { $priceAmount } ô misi
       *[other] { $priceAmount } ogni { $intervalCount } misi
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } ô misi
           *[other] { $priceAmount } ogni { $intervalCount } misi
        }
price-details-no-tax-year =
    { $intervalCount ->
        [one] { $priceAmount } ogni annu
       *[other] { $priceAmount } ogni { $intervalCount } anni
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } ogni annu
           *[other] { $priceAmount } ogni { $intervalCount } anni
        }
price-details-tax-day =
    { $intervalCount ->
        [one] { $priceAmount } + { $taxAmount } di tassi ô jornu
       *[other] { $priceAmount } + { $taxAmount } di tassi ogni { $intervalCount } jorna
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + { $taxAmount } di tassi ô jornu
           *[other] { $priceAmount } + { $taxAmount } di tassi ogni { $intervalCount } jorna
        }
price-details-tax-week =
    { $intervalCount ->
        [one] { $priceAmount } + { $taxAmount } di tassi â simana
       *[other] { $priceAmount } + { $taxAmount } di tassi ogni { $intervalCount } simani
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + { $taxAmount } di tassi â simana
           *[other] { $priceAmount } + { $taxAmount } di tassi ogni { $intervalCount } simani
        }
price-details-tax-month =
    { $intervalCount ->
        [one] { $priceAmount } + { $taxAmount } di tassi ô misi
       *[other] { $priceAmount } + { $taxAmount } di tassi ogni { $intervalCount } misi
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + { $taxAmount } di tassi ô misi
           *[other] { $priceAmount } + { $taxAmount } di tassi ogni { $intervalCount } misi
        }
price-details-tax-year =
    { $intervalCount ->
        [one] { $priceAmount } + { $taxAmount } di tassi ogni annu
       *[other] { $priceAmount } + { $taxAmount } di tassi ogni { $intervalCount } anni
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + { $taxAmount } di tassi ogni annu
           *[other] { $priceAmount } + { $taxAmount } di tassi ogni { $intervalCount } anni
        }


subscription-create-title = Cunfijura u to abbunamentu
subscription-success-title = Cunferma di l’abbunamentu
subscription-processing-title = Staju cunfirmannu l’abbunamentu…
subscription-error-title = Cci fu un prubblema mentri chi cunfirmava l’abbunamentu…
subscription-noplanchange-title = Stu canciu ô chianu d’abbunamentu nun è suppurtatu
subscription-iapsubscribed-title = Già abbunatu
sub-guarantee = Priggiarìa di rifazzioni pi 30 jorna


subplat-mozilla-accounts-legal-heading = { -product-mozilla-accounts(capitalization: "uppercase") }
terms = Tèrmini di sirbizzu
privacy = Abbisu di privatizza
terms-download = Scàrrica i tèrmini


document =
    .title = Cunti di Firefox
close-aria =
    .aria-label = Chiuji a finestra
settings-subscriptions-title = Abbunamenti
coupon-promo-code = Còdici prumuzziunali


plan-price-interval-day =
    { $intervalCount ->
        [one] { $amount } ô jornu
       *[other] { $amount } ogni { $intervalCount } jorna
    }
    .title =
        { $intervalCount ->
            [one] { $amount } ô jornu
           *[other] { $amount } ogni { $intervalCount } jorna
        }
plan-price-interval-week =
    { $intervalCount ->
        [one] { $amount } â simana
       *[other] { $amount } ogni { $intervalCount } simani
    }
    .title =
        { $intervalCount ->
            [one] { $amount } â simana
           *[other] { $amount } ogni { $intervalCount } simani
        }
plan-price-interval-month =
    { $intervalCount ->
        [one] { $amount } ô misi
       *[other] { $amount } ogni { $intervalCount } misi
    }
    .title =
        { $intervalCount ->
            [one] { $amount } ô misi
           *[other] { $amount } ogni { $intervalCount } misi
        }
plan-price-interval-year =
    { $intervalCount ->
        [one] { $amount } ogni annu
       *[other] { $amount } ogni { $intervalCount } anni
    }
    .title =
        { $intervalCount ->
            [one] { $amount } ogni annu
           *[other] { $amount } ogni { $intervalCount } anni
        }


general-error-heading = Erruri ginirali di l’applicazzioni
basic-error-message = Cci fu un prubblema. Pi favuri torna a prova cchiù tardu.
payment-error-1 = Mmh. Cci fu un prubblema cu l’auturizzazzioni dû to pagamentu. Pi favuri torna a prova o cuntatta cu’ ti rilassau a carta.
payment-error-2 = Mmh. Cci fu un prubblema cu l’auturizzazzioni dû to pagamentu. Pi favuri cuntatta cu’ ti rilassau a carta.
payment-error-3b = Cci fu n’erruri mentri chi prucissàvamu u to pagamentu, pi favuri torna a prova.
expired-card-error = Parissi chi a to carta scadìu. Prova a usari n’autra carta.
insufficient-funds-error = Parissi chi a to carta nun àvi sordi bastanti. Prova a usari n’autra carta.
withdrawal-count-limit-exceeded-error = Parissi chi stu pagamentu ti facissi passari a finaita di spisa dâ to carta. Prova a usari n’autra carta.
charge-exceeds-source-limit = Parissi chi stu pagamentu ti facissi passari a finaita di spisa jurnalera dâ to carta. Prova a usari n’autra carta, o aspetta 24 uri.
instant-payouts-unsupported = Parissi chi a to carta di dèbbitu nun è cunfijurata pî pagamenti subbitànii. Pi favuri prova a usari n’autra carta di dèbbitu o di crèditu.
duplicate-transaction = Uhm… parissi chi fu fattu un pagamentu avali di picca. Cuntrolla a crunuluggìa dî pagamenti.
coupon-expired = U còdici prumuzzionali scadìu.
card-error = Nun pòttimu prucissari u to pagamentu. Pi favuri cuntrolla i nfurmazzioni dâ to carta di crèditu e torna a prova.
country-currency-mismatch = A valuta di st’abbunamentu nun è vàlita pû pajisi assuciatu cû to pagamentu.
currency-currency-mismatch = Ni dispiaci, ma nun po’ scanciari a valuta.
location-unsupported = A to pusizzioni attuali nun è suppurtata dî nostri Tèrmini di sirbizzu.
no-subscription-change = Ni dispiaci, nun po’ canciari u to chianu d’abbunamentu.
iap-already-subscribed = Già facisti l’abbunamentu pi tràmiti di { $mobileAppStore }.
fxa-account-signup-error-2 = Nu sbagghiu di sistema fici sfalliri u to abbunamentu a { $productName }. Nun fu addibbitatu nenti ô to mètudu di pagamentu. Pi favuri torna a prova.
fxa-post-passwordless-sub-error = Abbunamentu cunfirmatu, ma a pàggina di cunferma sfallìu di carricari. Pi favuri cuntrolla a to posta elittrònica pi cunfijurari u to cuntu.
newsletter-signup-error = Nun ti scrivisti pî nutìfichi nnâ posta elittrònica ncapu a l’attualizzi dî prudutti. Po’ pruvari arrè nnê mpustazzioni dû to cuntu.
product-plan-error =
    .title = Cci fu un prubblema mentri chi carricava i chiani
product-profile-error =
    .title = Cci fu un prubblema mentri chi carricava u prufilu
product-customer-error =
    .title = Cci fu un prubblema mentri chi carricava u clienti
product-plan-not-found = Chianu nun truvatu
product-location-unsupported-error = Pusizzioni nun suppurtata


coupon-success = U to chianu veni rinnuvatu di manera autumàtica ô prezzu currenti.
coupon-success-repeating = U to chianu veni rinnuvatu di manera autumàtica doppu { $couponDurationDate } ô prezzu currenti.


new-user-step-1-2 = 1. Crìa un { -product-mozilla-account }
new-user-card-title = Metti i nfurmazzioni dâ to carta
new-user-submit = Abbònati ora


sub-update-payment-title = Nfurmazzioni di pagamentu


pay-with-heading-card-only = Paga câ carta
product-invoice-preview-error-title = Cci fu un prubblema mentri chi carricava l’antiprima dâ fattura
product-invoice-preview-error-text = Nun potti carricari l’antiprima dâ fattura


subscription-iaperrorupgrade-title = Nun è pussìbbili fari l’attualizzu ancora


brand-name-google-play-2 = { -google-play } Store
brand-name-apple-app-store-2 = { -app-store }


product-plan-change-heading = Rividi u to canciu
sub-change-failed = U canciu di chianu sfallìu
sub-update-acknowledgment = U to chianu veni attualizzatu sùbbitu, e ti veni addibbitatu chiḍḍu chi ammanca, di manera prupurziunali, pû restu dû piriudu di fatturazzioni. Accuminciannu dû { $startingDate } ti veni addibbitata a còtima sana.
sub-change-submit = Cunferma canciu
sub-update-current-plan-label = Chianu attuali
sub-update-new-plan-label = Chianu novu
sub-update-total-label = Tutali novu
sub-update-prorated-upgrade = Attualizzu carculatu prupurziunali


sub-update-new-plan-daily = { $productName } (ô jornu)
sub-update-new-plan-weekly = { $productName } (â simana)
sub-update-new-plan-monthly = { $productName } (ô misi)
sub-update-new-plan-yearly = { $productName } (a l’annu)
sub-update-prorated-upgrade-credit = U balanzu nigativu chi vidi veni scanciatu cu crèditi pû to cuntu, chi po' usari pi fatturi futuri.


sub-item-cancel-sub = Scancella l’abbunamentu
sub-item-stay-sub = Arresta abbunatu


sub-item-cancel-msg = Nun po’ cchiù usari { $name } doppu dû { $period }, chi è l’ùrtimu jornu dû to ciclu di fatturazzioni.
sub-item-cancel-confirm = Sdisattiva u me cuntu e scancella i me nfurmazzioni pirsunali sarbati nne { $name } jornu { $period }
sub-promo-coupon-applied = Prumuzzioni { $promotion_name } appricata: <priceDetails></priceDetails>
subscription-management-account-credit-balance = U pagamentu di st'abbunamentu ginirau un crèditu nnô balanzu dû to cuntu: <priceDetails></priceDetails>


sub-route-idx-reactivating = Sfallìu a riattivazzioni di l’abbunamentu
sub-route-idx-cancel-failed = Sfallìu u sfacimentu di l’abbunamentu
sub-route-idx-contact = Cuntatta l’assistenza
sub-route-idx-cancel-msg-title = Ni dispiaci chi dicidisti di jiritinni
sub-route-idx-cancel-msg =
    U to abbunamentu a { $name } fu scancillatu.
          <br />
          Po’ ancora tràsiri a { $name } nzinu a jornu { $date }.
sub-route-idx-cancel-aside-2 = Ài dumanni? Vìsita l’<a>assistenza di { -brand-mozilla }</a>.


sub-customer-error =
    .title = Cci fu un prubblema mentri chi carricava u clienti
sub-invoice-error =
    .title = Cci fu un prubblema mentri chi carricava i fatturi
sub-billing-update-success = Attualizzasti i to nfurmazzioni di fatturazzioni
sub-invoice-previews-error-title = Cci fu un prubblema mentri chi carricava l’antiprimi dî fatturi
sub-invoice-previews-error-text = Nun potti carricari l’antiprimi dî fatturi


pay-update-change-btn = Cancia
pay-update-manage-btn = Manija


sub-next-bill = Pròssima fattura jornu { $date }
sub-expires-on = Scadi u { $date }




pay-update-card-exp = Scadi u { $expirationDate }
sub-route-idx-updating = Staju attualizzannu i nfurmazzioni di fatturazzioni…
sub-route-payment-modal-heading = Nfurmazzioni di fatturazzioni nun vàliti
sub-route-payment-modal-message-2 = Parissi chi cci fu n’erruri cû to cuntu { -brand-paypal }, serbi chi fai chiḍḍu chi serbi p’arrisòrbiri stu prubblema di pagamentu.
sub-route-missing-billing-agreement-payment-alert = Nfurmazzioni di pagamentu nun vàliti; cc’è n’erruri cû to cuntu. <div>Manija</div>
sub-route-funding-source-payment-alert = Nfurmazzioni di pagamentu nun vàliti, cc’è n’erruri cû to cuntu. Capaci ca serbi n’anticchia di tempu picchì st’abbisu sparisci doppu chi attualizzi i to nfurmazzioni. <div>Manija</div>


sub-item-no-such-plan = Nun cc’è nuḍḍu chianu di stu tipu pi st’abbunamentu.
invoice-not-found = Nun attruvai a fattura doppu
sub-item-no-such-subsequent-invoice = Nun attruvai a fattura doppu pi st’abbunamentu.
sub-invoice-preview-error-title = Nun attruvai l’antiprima dâ fattura
sub-invoice-preview-error-text = Nun attruvai l’antiprima dâ fattura pi st’abbunamentu


reactivate-confirm-dialog-header = Vo’ cuntinuari a usari { $name }?
reactivate-confirm-copy = Po’ cuntinuari a tràsiri nne { $name }, e u to ciclu di fatturazzioni arresta u stissu. L’addèbbitu pròssimu sarà di { $amount } ncapu â carta chi finisci pi { $last } jornu { $endDate }.
reactivate-confirm-without-payment-method-copy = Po’ cuntinuari a tràsiri nne { $name }, e u to ciclu di fatturazzioni arresta u stissu. L’addèbbitu pròssimu sarà di { $amount } jornu { $endDate }.
reactivate-confirm-button = Abbònati arrè


reactivate-panel-copy = Nun po’ tràsiri cchiù nne { $name } di jornu <strong>{ $date }</strong>.
reactivate-success-copy = Grazzi! Allistemu.
reactivate-success-button = Chiuji


sub-iap-item-google-purchase-2 = { -brand-google }: accàttiti di l’app
sub-iap-item-apple-purchase-2 = { -brand-apple }: accàttiti di l’app
sub-iap-item-manage-button = Manija
