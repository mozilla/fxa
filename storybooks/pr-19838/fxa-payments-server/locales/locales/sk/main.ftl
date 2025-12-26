



-brand-mozilla =
    { $case ->
        [gen] Mozilly
        [dat] Mozille
        [acc] Mozillu
        [loc] Mozille
        [ins] Mozillou
       *[nom] Mozilla
    }
    .gender = feminine
-brand-firefox =
    { $case ->
        [gen] Firefoxu
        [dat] Firefoxu
        [acc] Firefox
        [loc] Firefoxe
        [ins] Firefoxom
       *[nom] Firefox
    }
    .gender = masculine
-product-firefox-accounts =
    { $case ->
        [gen]
            { $capitalization ->
                [lower] účtov Firefox
               *[upper] Účtov Firefox
            }
        [dat]
            { $capitalization ->
                [lower] účtom Firefox
               *[upper] Účtom Firefox
            }
        [acc]
            { $capitalization ->
                [lower] účty Firefox
               *[upper] Účty Firefox
            }
        [loc]
            { $capitalization ->
                [lower] účtoch Firefox
               *[upper] Účtoch Firefox
            }
        [ins]
            { $capitalization ->
                [lower] účtami Firefox
               *[upper] Účtami Firefox
            }
       *[nom]
            { $capitalization ->
                [lower] účty Firefox
               *[upper] Účty Firefox
            }
    }
-product-mozilla-account =
    { $case ->
        [gen]
            { $capitalization ->
                [lower] účtu Mozilla
               *[upper] Účtu Mozilla
            }
        [dat]
            { $capitalization ->
                [lower] účtu Mozilla
               *[upper] Účtu Mozilla
            }
        [acc]
            { $capitalization ->
                [lower] účet Mozilla
               *[upper] Účet Mozilla
            }
        [loc]
            { $capitalization ->
                [lower] účte Mozilla
               *[upper] Účte Mozilla
            }
        [ins]
            { $capitalization ->
                [lower] účtom Mozilla
               *[upper] Účtom Mozilla
            }
       *[nom]
            { $capitalization ->
                [lower] účet Mozilla
               *[upper] Účet Mozilla
            }
    }
-product-mozilla-accounts =
    { $case ->
        [gen]
            { $capitalization ->
                [lower] účtov Mozilla
               *[upper] Účtov Mozilla
            }
        [dat]
            { $capitalization ->
                [lower] účtom Mozilla
               *[upper] Účtom Mozilla
            }
        [acc]
            { $capitalization ->
                [lower] účty Mozilla
               *[upper] Účty Mozilla
            }
        [loc]
            { $capitalization ->
                [lower] účtoch Mozilla
               *[upper] Účtoch Mozilla
            }
        [ins]
            { $capitalization ->
                [lower] účtami Mozilla
               *[upper] Účtami Mozilla
            }
       *[nom]
            { $capitalization ->
                [lower] účty Mozilla
               *[upper] Účty Mozilla
            }
    }
-product-firefox-account =
    { $case ->
        [gen]
            { $capitalization ->
                [lower] účtu Firefox
               *[upper] Účtu Firefox
            }
        [dat]
            { $capitalization ->
                [lower] účtu Firefox
               *[upper] Účtu Firefox
            }
        [acc]
            { $capitalization ->
                [lower] účet Firefox
               *[upper] Účet Firefox
            }
        [loc]
            { $capitalization ->
                [lower] účte Firefox
               *[upper] Účte Firefox
            }
        [ins]
            { $capitalization ->
                [lower] účtom Firefox
               *[upper] Účtom Firefox
            }
       *[nom]
            { $capitalization ->
                [lower] účet Firefox
               *[upper] Účet Firefox
            }
    }
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

app-general-err-heading = Všeobecná chyba aplikácie
app-general-err-message = Niečo sa pokazilo. Skúste to znova neskôr.
app-query-parameter-err-heading = Nesprávna požiadavka: neplatné parametre dopytu


app-footer-mozilla-logo-label = Logo { -brand-mozilla(case: "gen") }
app-footer-privacy-notice = Vyhlásenie o ochrane osobných údajov webovej stránky
app-footer-terms-of-service = Podmienky používania služby


app-default-title-2 = { -product-mozilla-accounts }
app-page-title-2 = { $title } | { -product-mozilla-accounts }


link-sr-new-window = Otvorí sa v novom okne


app-loading-spinner-aria-label-loading = Načítava sa…


app-logo-alt-3 =
    .alt = Logo { -brand-mozilla } m



settings-home = Domovská stránka účtu
settings-project-header-title = { -product-mozilla-account }


coupon-promo-code-applied = Promo kód bol použitý
coupon-submit = Použiť
coupon-remove = Odstrániť
coupon-error = Zadaný kód je neplatný alebo jeho platnosť vypršala.
coupon-error-generic = Pri spracovaní kódu sa vyskytla chyba. Prosím, skúste to znova.
coupon-error-expired = Platnosť zadaného kódu vypršala.
coupon-error-limit-reached = Zadaný kód dosiahol svoj limit.
coupon-error-invalid = Zadaný kód je neplatný.
coupon-enter-code =
    .placeholder = Zadajte kód


default-input-error = Toto pole je povinné
input-error-is-required = Pole "{ $label }" je povinné


brand-name-mozilla-logo = Logo { -brand-mozilla(case: "gen") }


new-user-sign-in-link-2 = Už máte { -product-mozilla-account(capitalization: "lower") }? <a>Prihláste sa</a>
new-user-enter-email =
    .label = Zadajte e‑mailovú adresu
new-user-confirm-email =
    .label = Potvrďte vašu e‑mailovú adresu
new-user-subscribe-product-updates-mozilla = Chcem dostávať novinky o produktoch { -brand-mozilla(case: "gen") }
new-user-subscribe-product-updates-snp = Chcem dostávať novinky { -brand-mozilla(case: "gen") } týkajúce sa bezpečnosti a ochrany osobných údajov
new-user-subscribe-product-updates-hubs = Chcem dostávať novinky o produktoch od { -product-mozilla-hubs } a { -brand-mozilla(case: "gen") }
new-user-subscribe-product-updates-mdnplus = Chcem dostávať novinky o produktoch od { -product-mdn-plus } a { -brand-mozilla(case: "gen") }
new-user-subscribe-product-assurance = Vašu e‑mailovú adresu použijeme iba na vytvorenie účtu. Nikdy ju nepredáme tretej strane.
new-user-email-validate = E‑mailová adresa nie je platná
new-user-email-validate-confirm = E‑mailové adresy sa nezhodujú
new-user-already-has-account-sign-in = Už máte účet. <a>Prihláste sa</a>
new-user-invalid-email-domain = Nesprávne zadaný e‑mail? Doména { $domain } neponúka e‑mailovú službu.


payment-confirmation-thanks-heading = Ďakujeme!
payment-confirmation-thanks-heading-account-exists = Ďakujeme, teraz skontrolujte svoj e‑mail!
payment-confirmation-thanks-subheading = Na adresu { $email } bol odoslaný potvrdzujúci e‑mail s podrobnosťami o tom, ako začať so službou { $product_name }.
payment-confirmation-thanks-subheading-account-exists = Na adresu { $email } dostanete e‑mail s pokynmi na nastavenie účtu, ako aj s podrobnosťami o platbe.
payment-confirmation-order-heading = Podrobnosti o objednávke
payment-confirmation-invoice-number = Faktúra č. { $invoiceNumber }
payment-confirmation-invoice-date = { $invoiceDate }
payment-confirmation-details-heading-2 = Informácie o platbe
payment-confirmation-amount = { $amount } za { $interval }
payment-confirmation-amount-day =
    { $intervalCount ->
        [one] { $amount } denne
        [few] { $amount } každé { $intervalCount } dni
       *[other] { $amount } každých { $intervalCount } dní
    }
payment-confirmation-amount-week =
    { $intervalCount ->
        [one] { $amount } týždenne
        [few] { $amount } každé { $intervalCount } týždne
       *[other] { $amount } každých { $intervalCount } týždňov
    }
payment-confirmation-amount-month =
    { $intervalCount ->
        [one] { $amount } mesačne
        [few] { $amount } každé { $intervalCount } mesiace
       *[other] { $amount } každých { $intervalCount } mesiacov
    }
payment-confirmation-amount-year =
    { $intervalCount ->
        [one] { $amount } ročne
        [few] { $amount } každé { $intervalCount } roky
       *[other] { $amount } každých { $intervalCount } rokov
    }
payment-confirmation-download-button = Pokračovať na stiahnutie


payment-confirm-with-legal-links-static-3 = Oprávňujem spoločnosť { -brand-mozilla } účtovať zobrazenú sumu na mnou určený spôsob platby v súlade s <termsOfServiceLink>Podmienkami používania služby</termsOfServiceLink> a <privacyNoticeLink>Vyhlásením o ochrane osobných údajov</privacyNoticeLink>, kým nezruším svoje predplatné.
payment-confirm-checkbox-error = Pred pokračovaním musíte dokončiť toto.


payment-error-retry-button = Skúsiť znova
payment-error-manage-subscription-button = Spravovať moje predplatné


iap-upgrade-already-subscribed-2 = Už máte predplatné produktu { $productName } prostredníctvom cez obchod s aplikáciami spoločnosti { -brand-google } alebo { -brand-apple }.
iap-upgrade-no-bundle-support = Inovácie týchto predplatných zatiaľ nepodporujeme, čoskoro však budeme.
iap-upgrade-contact-support = Tento produkt stále môžete získať – kontaktujte podporu, aby sme vám mohli pomôcť.
iap-upgrade-get-help-button = Získať pomoc


payment-name =
    .placeholder = Celé meno
    .label = Meno uvedené na karte
payment-cc =
    .label = Vaša karta
payment-cancel-btn = Zrušiť
payment-update-btn = Aktualizovať
payment-pay-btn = Zaplatiť teraz
payment-pay-with-paypal-btn-2 = Zaplatiť cez { -brand-paypal }
payment-validate-name-error = Prosím, zadajte svoje meno


payment-legal-copy-stripe-and-paypal-3 = { -brand-mozilla } používa pre bezpečné spracovanie platieb služby { -brand-name-stripe } a { -brand-paypal }
payment-legal-link-stripe-paypal-2 = <stripePrivacyLink>Zásady ochrany osobných údajov služby { -brand-name-stripe }</stripePrivacyLink> &nbsp; <paypalPrivacyLink>Zásady ochrany osobných údajov služby { -brand-paypal }</paypalPrivacyLink>
payment-legal-copy-paypal-2 = { -brand-mozilla } používa pre bezpečné spracovanie platieb službu { -brand-paypal }
payment-legal-link-paypal-3 = <paypalPrivacyLink>Zásady ochrany osobných údajov služby { -brand-paypal }</paypalPrivacyLink>
payment-legal-copy-stripe-3 = { -brand-mozilla } používa pre bezpečné spracovanie platieb službu { -brand-name-stripe }
payment-legal-link-stripe-3 = <stripePrivacyLink>Zásady ochrany osobných údajov služby { -brand-name-stripe }</stripePrivacyLink>


payment-method-header = Vyberte si spôsob platby
payment-method-header-second-step = 2. { payment-method-header }
payment-method-first-approve = Najprv musíte schváliť svoje predplatné


payment-processing-message = Prosím, počkajte kým spracujeme vašu platbu…


payment-confirmation-cc-card-ending-in = Karta končiaca číslicami { $last4 }


pay-with-heading-paypal-2 = Zaplatiť cez { -brand-paypal }


plan-details-header = Podrobnosti o produkte
plan-details-list-price = Cenníková cena
plan-details-show-button = Zobraziť podrobnosti
plan-details-hide-button = Skryť podrobnosti
plan-details-total-label = Celkom
plan-details-tax = Dane a poplatky


product-no-such-plan = Pre tento produkt takýto plán neexistuje.


price-details-no-tax = { $priceAmount }
price-details-tax = { $priceAmount } + daň { $taxAmount }
price-details-no-tax-day =
    { $intervalCount ->
        [one] { $priceAmount } každý deň
        [few] { $priceAmount } každé { $intervalCount } dni
       *[other] { $priceAmount } každých { $intervalCount } dní
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } každý deň
            [few] { $priceAmount } každé { $intervalCount } dni
           *[other] { $priceAmount } každých { $intervalCount } dní
        }
price-details-no-tax-week =
    { $intervalCount ->
        [one] { $priceAmount } každý týždeň
        [few] { $priceAmount } každé { $intervalCount } týždne
       *[other] { $priceAmount } každých { $intervalCount } týždňov
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } každý týždeň
            [few] { $priceAmount } každé { $intervalCount } týždne
           *[other] { $priceAmount } každých { $intervalCount } týždňov
        }
price-details-no-tax-month =
    { $intervalCount ->
        [one] { $priceAmount } každý mesiac
        [few] { $priceAmount } každé { $intervalCount } mesiace
       *[other] { $priceAmount } každých { $intervalCount } mesiacov
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } každý mesiac
            [few] { $priceAmount } každé { $intervalCount } mesiace
           *[other] { $priceAmount } každých { $intervalCount } mesiacov
        }
price-details-no-tax-year =
    { $intervalCount ->
        [one] { $priceAmount } ročne
        [few] { $priceAmount } každé { $intervalCount } roky
       *[other] { $priceAmount } každých { $intervalCount } rokov
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } ročne
            [few] { $priceAmount } každé { $intervalCount } roky
           *[other] { $priceAmount } každých { $intervalCount } rokov
        }
price-details-tax-day =
    { $intervalCount ->
        [one] { $priceAmount } + daň { $taxAmount } každý deň
        [few] { $priceAmount } + daň { $taxAmount } každé { $intervalCount } dni
       *[other] { $priceAmount } + daň { $taxAmount } každých { $intervalCount } dní
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + daň { $taxAmount } každý deň
            [few] { $priceAmount } + daň { $taxAmount } každé { $intervalCount } dni
           *[other] { $priceAmount } + daň { $taxAmount } každých { $intervalCount } dní
        }
price-details-tax-week =
    { $intervalCount ->
        [one] { $priceAmount } + daň { $taxAmount } každý týždeň
        [few] { $priceAmount } + daň { $taxAmount } každé { $intervalCount } týždne
       *[other] { $priceAmount } + daň { $taxAmount } každých { $intervalCount } týždňov
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + daň { $taxAmount } každý týždeň
            [few] { $priceAmount } + daň { $taxAmount } každé { $intervalCount } týždne
           *[other] { $priceAmount } + daň { $taxAmount } každých { $intervalCount } týždňov
        }
price-details-tax-month =
    { $intervalCount ->
        [one] { $priceAmount } + daň { $taxAmount } každý mesiac
        [few] { $priceAmount } + daň { $taxAmount } každé { $intervalCount } mesiace
       *[other] { $priceAmount } + daň { $taxAmount } každých { $intervalCount } mesiacov
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + daň { $taxAmount } každý mesiac
            [few] { $priceAmount } + daň { $taxAmount } každé { $intervalCount } mesiace
           *[other] { $priceAmount } + daň { $taxAmount } každých { $intervalCount } mesiacov
        }
price-details-tax-year =
    { $intervalCount ->
        [one] { $priceAmount } + daň { $taxAmount } každý rok
        [few] { $priceAmount } + daň { $taxAmount } každé { $intervalCount } roky
       *[other] { $priceAmount } + daň { $taxAmount } každých { $intervalCount } rokov
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + daň { $taxAmount } každý rok
            [few] { $priceAmount } + daň { $taxAmount } každé { $intervalCount } roky
           *[other] { $priceAmount } + daň { $taxAmount } každých { $intervalCount } rokov
        }


subscription-create-title = Nastavte si predplatné
subscription-success-title = Potvrdenie predplatného
subscription-processing-title = Potvrdzuje sa predplatné…
subscription-error-title = Chyba pri potvrdzovaní predplatného…
subscription-noplanchange-title = Táto zmena plánu predplatného nie je podporovaná
subscription-iapsubscribed-title = Už máte predplatné
sub-guarantee = 30-dňová záruka vrátenia peňazí


subplat-mozilla-accounts-legal-heading = { -product-mozilla-accounts(capitalization: "uppercase") }
terms = Podmienky používania služby
privacy = Vyhlásenie o ochrane osobných údajov
terms-download = Stiahnuť podmienky


document =
    .title = Účet Firefox
close-aria =
    .aria-label = Zavrieť
settings-subscriptions-title = Predplatné
coupon-promo-code = Promo kód


plan-price-interval-day =
    { $intervalCount ->
        [one] { $amount } každý deň
        [few] { $amount } každé { $intervalCount } dni
       *[other] { $amount } každých { $intervalCount } dní
    }
    .title =
        { $intervalCount ->
            [one] { $amount } každý deň
            [few] { $amount } každé { $intervalCount } dni
           *[other] { $amount } každých { $intervalCount } dní
        }
plan-price-interval-week =
    { $intervalCount ->
        [one] { $amount } každý týždeň
        [few] { $amount } každé { $intervalCount } týždne
       *[other] { $amount } každých { $intervalCount } týždňov
    }
    .title =
        { $intervalCount ->
            [one] { $amount } každý týždeň
            [few] { $amount } každé { $intervalCount } týždne
           *[other] { $amount } každých { $intervalCount } týždňov
        }
plan-price-interval-month =
    { $intervalCount ->
        [one] { $amount } každý mesiac
        [few] { $amount } každé { $intervalCount } mesiace
       *[other] { $amount } každých { $intervalCount } mesiacov
    }
    .title =
        { $intervalCount ->
            [one] { $amount } každý mesiac
            [few] { $amount } každé { $intervalCount } mesiace
           *[other] { $amount } každých { $intervalCount } mesiacov
        }
plan-price-interval-year =
    { $intervalCount ->
        [one] { $amount } ročne
        [few] { $amount } každé { $intervalCount } roky
       *[other] { $amount } každých { $intervalCount } rokov
    }
    .title =
        { $intervalCount ->
            [one] { $amount } ročne
            [few] { $amount } každé { $intervalCount } roky
           *[other] { $amount } každých { $intervalCount } rokov
        }


general-error-heading = Všeobecná chyba aplikácie
basic-error-message = Niečo sa pokazilo. Skúste to znova neskôr.
payment-error-1 = Hmm. Pri autorizácii vašej platby sa vyskytol problém. Skúste to znova alebo sa obráťte na vydavateľa karty.
payment-error-2 = Hmm. Pri autorizácii vašej platby sa vyskytol problém. Obráťte sa na vydavateľa karty.
payment-error-3b = Počas spracovania platby došlo k neočakávanej chybe, skúste to znova.
expired-card-error = Zdá sa, že platnosť vašej platobnej karty uplynula. Skúste inú kartu.
insufficient-funds-error = Zdá sa, že nemáte dostatok finančných prostriedkov. Skúste inú kartu.
withdrawal-count-limit-exceeded-error = Zdá sa, že táto transakcia vás dostane nad kreditný limit. Skúste inú kartu.
charge-exceeds-source-limit = Zdá sa, že touto transakciou prekročíte denný limit. Vyskúšajte inú kartu alebo to skúste o 24 hodín.
instant-payouts-unsupported = Zdá sa, že vaša karta nemá nastavené okamžité platby. Skúste použiť inú.
duplicate-transaction = Zdá sa, že sme pred chvíľou prijali rovnakú platbu. Skontrolujte, prosím, históriu svojich platieb.
coupon-expired = Zdá sa, že platnosť promo kódu skončila.
card-error = Vašu transakciu sa nepodarilo spracovať. Skontrolujte, prosím, zadané údaje o svojej karte a skúste to znova.
country-currency-mismatch = Mena tohto predplatného nie je platná pre krajinu spojenú s vašou platbou.
currency-currency-mismatch = Ľutujeme. Medzi menami nemôžete prepínať.
location-unsupported = Vaša aktuálna poloha nie je podľa našich Podmienok používania služby podporovaná.
no-subscription-change = Ľutujeme, váš plán predplatného nemôžete zmeniť.
iap-already-subscribed = Už máte predplatné cez { $mobileAppStore }.
fxa-account-signup-error-2 = Systémová chyba spôsobila zlyhanie vašej registrácie produktu { $productName }. Váš spôsob platby nebol zaúčtovaný. Prosím, skúste to znova.
fxa-post-passwordless-sub-error = Predplatné bolo potvrdené, ale nepodarilo sa načítať stránku s potvrdením. Skontrolujte svoj e‑mail a nastavte si účet.
newsletter-signup-error = Nie ste zaregistrovaný na odber e‑mailov s novinkami v produkte. Môžete to skúsiť znova v nastaveniach účtu.
product-plan-error =
    .title = Problém s načítaním plánov
product-profile-error =
    .title = Problém s načítaním profilu
product-customer-error =
    .title = Problém s načítaním zákazníka
product-plan-not-found = Plán nebol nájdený
product-location-unsupported-error = Lokalita nie je podporovaná


coupon-success = Váš plán sa automaticky obnoví za katalógovú cenu.
coupon-success-repeating = Váš plán sa automaticky obnoví po { $couponDurationDate } za katalógovú cenu.


new-user-step-1-2 = 1. Vytvorte si { -product-mozilla-account(case: "acc", capitalization: "lower") }
new-user-card-title = Zadajte informácie o svojej karte
new-user-submit = Predplatiť


sub-update-payment-title = Informácie o platbe


pay-with-heading-card-only = Zaplatiť kartou
product-invoice-preview-error-title = Problém s načítaním ukážky faktúry
product-invoice-preview-error-text = Nepodarilo sa načítať ukážku faktúry


subscription-iaperrorupgrade-title = Zatiaľ vás nemôžeme inovovať


brand-name-google-play-2 = Obchod { -google-play }
brand-name-apple-app-store-2 = { -app-store }


product-plan-change-heading = Skontrolujte požadovanú zmenu
sub-change-failed = Zmena plánu zlyhala
sub-update-acknowledgment = Váš plán sa okamžite zmení a dnes vám bude účtovaná pomerná suma za zvyšok tohto fakturačného cyklu. Od { $startingDate } vám bude účtovaná plná suma.
sub-change-submit = Potvrdiť zmenu
sub-update-current-plan-label = Súčasný plán
sub-update-new-plan-label = Nový plán
sub-update-total-label = Nová suma spolu
sub-update-prorated-upgrade = Pomerná inovácia


sub-update-new-plan-daily = { $productName } (denne)
sub-update-new-plan-weekly = { $productName } (týždenne)
sub-update-new-plan-monthly = { $productName } (mesačne)
sub-update-new-plan-yearly = { $productName } (ročne)
sub-update-prorated-upgrade-credit = Zobrazený záporný zostatok bude pripísaný na váš účet a použitý na budúce faktúry.


sub-item-cancel-sub = Zrušiť predplatné
sub-item-stay-sub = Ponechať predplatné


sub-item-cancel-msg = Po { $period }, poslednom dni vášho fakturačného cyklu, už produkt { $name } nebudete môcť používať.
sub-item-cancel-confirm = Zrušiť môj prístup k produktu { $name } a dáta v ňom uložené ku dňu { $period }
sub-promo-coupon-applied = Kupón { $promotion_name } bol použitý: <priceDetails></priceDetails>
subscription-management-account-credit-balance = Táto platba za predplatné viedla k pripísaniu sumy na váš účet: <priceDetails></priceDetails>


sub-route-idx-reactivating = Predplatné sa nepodarilo obnoviť
sub-route-idx-cancel-failed = Predplatné sa nepodarilo zrušiť
sub-route-idx-contact = Kontaktujte podporu
sub-route-idx-cancel-msg-title = Je nám veľmi ľúto, že odchádzate
sub-route-idx-cancel-msg =
    Vaše predplatné služby { $name } bolo zrušené.
          <br />
          K službe { $name } máte stále prístup do { $date }.
sub-route-idx-cancel-aside-2 = Máte otázky? Navštívte <a>podporu organizácie { -brand-mozilla }</a>.


sub-customer-error =
    .title = Problém pri načítaní zákazníka
sub-invoice-error =
    .title = Problém s načítaním faktúr
sub-billing-update-success = Vaše platobné údaje boli úspešne aktualizované
sub-invoice-previews-error-title = Problém s načítaním ukážok faktúr
sub-invoice-previews-error-text = Nepodarilo sa načítať ukážky faktúr


pay-update-change-btn = Zmeniť
pay-update-manage-btn = Spravovať


sub-next-bill = Ďalšia fakturácia dňa { $date }
sub-next-bill-due-date = Ďalšia faktúra je splatná dňa { $date }
sub-expires-on = Vyprší dňa { $date }




pay-update-card-exp = Vyprší { $expirationDate }
sub-route-idx-updating = Aktualizujem platobné údaje
sub-route-payment-modal-heading = Neplatné fakturačné údaje
sub-route-payment-modal-message-2 = Zdá sa, že sa vyskytla chyba vo vašom účte { -brand-paypal }. Potrebujeme, aby ste podnikli potrebné kroky na vyriešenie tohto problému s platbou.
sub-route-missing-billing-agreement-payment-alert = Neplatné informácie o platbe; vo vašom účte sa vyskytla chyba. <div>Spravovať</div>
sub-route-funding-source-payment-alert = Neplatné informácie o platbe; vo vašom účte sa vyskytla chyba. Po úspešnej aktualizácii informácií môže chvíľu trvať, kým sa toto upozornenie vymaže. <div>Spravovať</div>


sub-item-no-such-plan = Pre toto predplatné neexistuje takýto plán.
invoice-not-found = Následná faktúra sa nenašla
sub-item-no-such-subsequent-invoice = Následná faktúra za toto predplatné sa nenašla.
sub-invoice-preview-error-title = Ukážka faktúry sa nenašla
sub-invoice-preview-error-text = Pre toto predplatné sa nenašla ukážka faktúry


reactivate-confirm-dialog-header = Chcete aj naďalej používať { $name }?
reactivate-confirm-copy = Váš prístup k produktu { $name } bude zachovaný a váš fakturačný cyklus a platba zostanú rovnaké. Vaša ďalšia platba bude v hodnote { $amount } a bude stiahnutá z karty končiacej na { $last } dňa { $endDate }.
reactivate-confirm-without-payment-method-copy = Váš prístup k produktu { $name } bude zachovaný a váš fakturačný cyklus a platba zostanú rovnaké. Vaša ďalšia platba bude v hodnote { $amount } a bude stiahnutá dňa { $endDate }.
reactivate-confirm-button = Opätovne predplatiť


reactivate-panel-copy = Prístup k službe { $name } stratíte <strong>{ $date }</strong>.
reactivate-success-copy = Ďakujeme. Všetko je nastavené.
reactivate-success-button = Zavrieť


sub-iap-item-google-purchase-2 = { -brand-google }: Nákup v aplikácii
sub-iap-item-apple-purchase-2 = { -brand-apple }: Nákup v aplikácii
sub-iap-item-manage-button = Spravovať
