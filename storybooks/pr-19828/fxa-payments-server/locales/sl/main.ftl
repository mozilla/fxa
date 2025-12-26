



-brand-mozilla =
    { $sklon ->
        [rodilnik] Mozille
        [dajalnik] Mozilli
        [tozilnik] Mozillo
        [mestnik] Mozilli
        [orodnik] Mozillo
       *[imenovalnik] Mozilla
    }
-brand-firefox =
    { $sklon ->
        [rodilnik] Firefoxa
        [dajalnik] Firefoxu
        [tozilnik] Firefox
        [mestnik] Firefoxu
        [orodnik] Firefoxom
       *[imenovalnik] Firefox
    }
-product-firefox-accounts =
    { $sklon ->
        [rodilnik] Firefox računov
        [dajalnik] Firefox računom
        [tozilnik] Firefox račune
        [mestnik] Firefox računih
        [orodnik] Firefox računi
       *[imenovalnik] Firefox računi
    }
-product-mozilla-account =
    { $sklon ->
        [rodilnik]
            { $zacetnica ->
                [velika] Računa Mozilla
               *[mala] računa Mozilla
            }
        [dajalnik]
            { $zacetnica ->
                [velika] Računu Mozilla
               *[mala] računu Mozilla
            }
        [tozilnik]
            { $zacetnica ->
                [velika] Račun Mozilla
               *[mala] račun Mozilla
            }
        [mestnik]
            { $zacetnica ->
                [velika] Računu Mozilla
               *[mala] računu Mozilla
            }
        [orodnik]
            { $zacetnica ->
                [velika] Računom Mozilla
               *[mala] računom Mozilla
            }
       *[imenovalnik]
            { $zacetnica ->
                [velika] Račun Mozilla
               *[mala] račun Mozilla
            }
    }
-product-mozilla-accounts =
    { $sklon ->
        [rodilnik]
            { $zacetnica ->
                [velika] Računov Mozilla
               *[mala] računov Mozilla
            }
        [dajalnik]
            { $zacetnica ->
                [velika] Računom Mozilla
               *[mala] računom Mozilla
            }
        [tozilnik]
            { $zacetnica ->
                [velika] Račune Mozilla
               *[mala] račune Mozilla
            }
        [mestnik]
            { $zacetnica ->
                [velika] Računih Mozilla
               *[mala] računih Mozilla
            }
        [orodnik]
            { $zacetnica ->
                [velika] Računi Mozilla
               *[mala] računi Mozilla
            }
       *[imenovalnik]
            { $zacetnica ->
                [velika] Računi Mozilla
               *[mala] računi Mozilla
            }
    }
-product-firefox-account =
    { $sklon ->
        [rodilnik] Firefox računa
        [dajalnik] Firefox računu
        [tozilnik] Firefox račun
        [mestnik] Firefox računu
        [orodnik] Firefox računom
       *[imenovalnik] Firefox račun
    }
-product-mozilla-vpn = Mozilla VPN
-product-mozilla-vpn-short = VPN
-product-mozilla-hubs = Mozilla Hubs
-product-mdn = MDN
-product-mdn-plus = MDN Plus
-product-firefox-cloud = Firefox Cloud
-product-mozilla-monitor =
    { $sklon ->
        [rodilnik] Mozilla Monitorja
        [dajalnik] Mozilla Monitorju
        [tozilnik] Mozilla Monitor
        [mestnik] Mozilla Monitorju
        [orodnik] Mozilla Monitorjem
       *[imenovalnik] Mozilla Monitor
    }
-product-mozilla-monitor-short = Monitor
-product-firefox-relay = Firefox Relay
-product-firefox-relay-short = Relay
-brand-apple =
    { $sklon ->
        [rodilnik] Appla
        [dajalnik] Applu
        [tozilnik] Apple
        [mestnik] Applu
        [orodnik] Applom
       *[imenovalnik] Apple
    }
-brand-apple-pay = Apple Pay
-brand-google =
    { $sklon ->
        [rodilnik] Googla
        [dajalnik] Googlu
        [tozilnik] Google
        [mestnik] Googlu
        [orodnik] Googlom
       *[imenovalnik] Google
    }
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

app-general-err-heading = Splošna napaka aplikacije
app-general-err-message = Prišlo je do napake. Poskusite znova pozneje.
app-query-parameter-err-heading = Nepravilna zahteva: neveljavni parametri poizvedbe


app-footer-mozilla-logo-label = Logotip { -brand-mozilla(sklon: "rodilnik") }
app-footer-privacy-notice = Obvestilo o zasebnosti spletnega mesta
app-footer-terms-of-service = Pogoji storitve


app-default-title-2 = { -product-mozilla-accounts(zacetnica: "velika") }
app-page-title-2 = { $title } | { -product-mozilla-accounts(zacetnica: "velika") }


link-sr-new-window = Odpre se v novem oknu


app-loading-spinner-aria-label-loading = Nalaganje …


app-logo-alt-3 =
    .alt = Logotip { -brand-mozilla(sklon: "rodilnik") } "m"



settings-home = Domača stran računa
settings-project-header-title = { -product-mozilla-account }


coupon-promo-code-applied = Promocijska koda uveljavljena
coupon-submit = Uveljavi
coupon-remove = Odstrani
coupon-error = Koda, ki ste jo vnesli, je neveljavna ali pretečena.
coupon-error-generic = Pri obdelavi kode je prišlo do napake. Poskusite znova.
coupon-error-expired = Kodi, ki ste jo vnesli, je potekla veljavnost.
coupon-error-limit-reached = Koda, ki ste jo vnesli, je dosegla svojo omejitev.
coupon-error-invalid = Koda, ki ste jo vnesli, je neveljavna.
coupon-enter-code =
    .placeholder = Vnesite kodo


default-input-error = To polje je obvezno
input-error-is-required = { $label } je zahtevan podatek


brand-name-mozilla-logo = Logotip { -brand-mozilla(sklon: "rodilnik") }


new-user-sign-in-link-2 = Že imate { -product-mozilla-account }? <a>Prijava</a>
new-user-enter-email =
    .label = Vnesite svoj e-poštni naslov
new-user-confirm-email =
    .label = Potrdite e-poštni naslov
new-user-subscribe-product-updates-mozilla = Želim prejemati novice in obvestila o izdelkih { -brand-mozilla(sklon: "rodilnik") }
new-user-subscribe-product-updates-snp = Želim prejemati novice in obvestila { -brand-mozilla(sklon: "rodilnik") } o varnosti in zasebnosti
new-user-subscribe-product-updates-hubs = Želim prejemati novice in obvestila { -product-mozilla-hubs } in { -brand-mozilla(sklon: "rodilnik") } o izdelkih
new-user-subscribe-product-updates-mdnplus = Želim prejemati novice in obvestila o izdelkih { -product-mdn-plus } in { -brand-mozilla }
new-user-subscribe-product-assurance = Vaš e-poštni naslov uporabimo samo za ustvarjanje vašega računa. Nikoli ga ne bomo prodali nikomur drugemu.
new-user-email-validate = E-poštni naslov ni veljaven
new-user-email-validate-confirm = E-poštna naslova se ne ujemata
new-user-already-has-account-sign-in = Račun že imate. <a>Prijava</a>
new-user-invalid-email-domain = Ste se zatipkali? { $domain } ne ponuja e-pošte.


payment-confirmation-thanks-heading = Hvala!
payment-confirmation-thanks-heading-account-exists = Hvala, sedaj preverite svojo e-pošto!
payment-confirmation-thanks-subheading = Na { $email } je bilo poslano potrditveno e-poštno sporočilo s podrobnimi navodili, kako začeti uporabljati { $product_name }.
payment-confirmation-thanks-subheading-account-exists = Na { $email } boste prejeli e-pošto z navodili za nastavitev računa in s podatki o plačilu.
payment-confirmation-order-heading = Podrobnosti naročila
payment-confirmation-invoice-number = Račun št. { $invoiceNumber }
payment-confirmation-invoice-date = { $invoiceDate }
payment-confirmation-details-heading-2 = Podatki o plačilu
payment-confirmation-amount = { $amount } na { $interval }
payment-confirmation-amount-day =
    { $intervalCount ->
        [one] { $amount } na dan
        [two] { $amount } vsaka { $intervalCount } dneva
        [few] { $amount } vsake { $intervalCount } dni
       *[other] { $amount } vsakih { $intervalCount } dni
    }
payment-confirmation-amount-week =
    { $intervalCount ->
        [one] { $amount } na teden
        [two] { $amount } vsaka { $intervalCount } tedna
        [few] { $amount } vsake { $intervalCount } tedne
       *[other] { $amount } vsakih { $intervalCount } tednov
    }
payment-confirmation-amount-month =
    { $intervalCount ->
        [one] { $amount } na mesec
        [two] { $amount } vsaka { $intervalCount } meseca
        [few] { $amount } vsake { $intervalCount } mesece
       *[other] { $amount } vsakih { $intervalCount } mesecev
    }
payment-confirmation-amount-year =
    { $intervalCount ->
        [one] { $amount } na leto
        [two] { $amount } vsaki { $intervalCount } leti
        [few] { $amount } vsaka { $intervalCount } leta
       *[other] { $amount } vsakih { $intervalCount } let
    }
payment-confirmation-download-button = Nadaljuj prenos


payment-confirm-with-legal-links-static-3 = Dovoljujem, da { -brand-mozilla } v skladu s <termsOfServiceLink>pogoji uporabe</termsOfServiceLink> in <privacyNoticeLink>obvestilom o zasebnosti</privacyNoticeLink> bremeni moje plačilno sredstvo za prikazani znesek, dokler ne prekličem naročnine.
payment-confirm-checkbox-error = To morate dokončati, preden nadaljujete


payment-error-retry-button = Poskusi znova
payment-error-manage-subscription-button = Upravljaj z naročnino


iap-upgrade-already-subscribed-2 = Že ste naročeni na { $productName } v trgovinah z aplikacijami { -brand-google } ali { -brand-apple }.
iap-upgrade-no-bundle-support = Za te naročnine ne podpiramo nadgradenj, vendar jih bomo kmalu.
iap-upgrade-contact-support = Ta izdelek je še vedno na voljo – obrnite se na podporo, da vam lahko pomagamo.
iap-upgrade-get-help-button = Poišči pomoč


payment-name =
    .placeholder = Polno ime
    .label = Ime, kot je napisano na osebni izkaznici
payment-cc =
    .label = Vaša kartica
payment-cancel-btn = Prekliči
payment-update-btn = Posodobi
payment-pay-btn = Plačaj zdaj
payment-pay-with-paypal-btn-2 = Plačaj s { -brand-paypal }om
payment-validate-name-error = Vnesite svoje ime


payment-legal-copy-stripe-and-paypal-3 = { -brand-mozilla } za varno obdelavo plačil uporablja storitvi { -brand-name-stripe } in { -brand-paypal }.
payment-legal-link-stripe-paypal-2 = <stripePrivacyLink>Politika zasebnosti za { -brand-name-stripe }</stripePrivacyLink> &nbsp; <paypalPrivacyLink>Politika zasebnosti za { -brand-paypal }</paypalPrivacyLink>
payment-legal-copy-paypal-2 = { -brand-mozilla } za varno obdelavo plačil uporablja storitev { -brand-paypal }.
payment-legal-link-paypal-3 = <paypalPrivacyLink>Pravilnik o zasebnosti za { -brand-paypal }</paypalPrivacyLink>
payment-legal-copy-stripe-3 = { -brand-mozilla } za varno obdelavo plačil uporablja storitev { -brand-name-stripe }.
payment-legal-link-stripe-3 = <stripePrivacyLink>Politika zasebnosti za { -brand-name-stripe }</stripePrivacyLink>


payment-method-header = Izberite način plačila
payment-method-header-second-step = 2. { payment-method-header }
payment-method-first-approve = Najprej morate odobriti svojo naročnino


payment-processing-message = Počakajte, da obdelamo vaše plačilo …


payment-confirmation-cc-card-ending-in = Kartica, ki se končuje s { $last4 }


pay-with-heading-paypal-2 = Plačaj s { -brand-paypal }om


plan-details-header = Podrobnosti izdelka
plan-details-list-price = Cenik
plan-details-show-button = Pokaži podrobnosti
plan-details-hide-button = Skrij podrobnosti
plan-details-total-label = Skupaj
plan-details-tax = Davki in pristojbine


product-no-such-plan = Za ta izdelek ni takšnega načrta.


price-details-no-tax = { $priceAmount }
price-details-tax = { $priceAmount } + { $taxAmount } davka
price-details-no-tax-day =
    { $intervalCount ->
        [one] { $priceAmount } na dan
        [two] { $priceAmount } vsaka { $intervalCount } dneva
        [few] { $priceAmount } vsake { $intervalCount } dni
       *[other] { $priceAmount } vsakih { $intervalCount } dni
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } na dan
            [two] { $priceAmount } vsaka { $intervalCount } dneva
            [few] { $priceAmount } vsake { $intervalCount } dni
           *[other] { $priceAmount } vsakih { $intervalCount } dni
        }
price-details-no-tax-week =
    { $intervalCount ->
        [one] { $priceAmount } na teden
        [two] { $priceAmount } vsaka { $intervalCount } tedna
        [few] { $priceAmount } vsake { $intervalCount } tedne
       *[other] { $priceAmount } vsakih { $intervalCount } tednov
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } na teden
            [two] { $priceAmount } vsaka { $intervalCount } tedna
            [few] { $priceAmount } vsake { $intervalCount } tedne
           *[other] { $priceAmount } vsakih { $intervalCount } tednov
        }
price-details-no-tax-month =
    { $intervalCount ->
        [one] { $priceAmount } na mesec
        [two] { $priceAmount } vsaka { $intervalCount } meseca
        [few] { $priceAmount } vsake { $intervalCount } mesece
       *[other] { $priceAmount } vsakih { $intervalCount } mesecev
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } na mesec
            [two] { $priceAmount } vsaka { $intervalCount } meseca
            [few] { $priceAmount } vsake { $intervalCount } mesece
           *[other] { $priceAmount } vsakih { $intervalCount } mesecev
        }
price-details-no-tax-year =
    { $intervalCount ->
        [one] { $priceAmount } na leto
        [two] { $priceAmount } na { $intervalCount } leti
        [few] { $priceAmount } na { $intervalCount } leta
       *[other] { $priceAmount } na { $intervalCount } let
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } na leto
            [two] { $priceAmount } na { $intervalCount } leti
            [few] { $priceAmount } na { $intervalCount } leta
           *[other] { $priceAmount } na { $intervalCount } let
        }
price-details-tax-day =
    { $intervalCount ->
        [one] { $priceAmount } + { $taxAmount } davka na dan
        [two] { $priceAmount } + { $taxAmount } davka vsaka { $intervalCount } dneva
        [few] { $priceAmount } + { $taxAmount } davka vsake { $intervalCount } dni
       *[other] { $priceAmount } + { $taxAmount } davka vsakih { $intervalCount } dni
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + { $taxAmount } davka na dan
            [two] { $priceAmount } + { $taxAmount } davka vsaka { $intervalCount } dneva
            [few] { $priceAmount } + { $taxAmount } davka vsake { $intervalCount } dni
           *[other] { $priceAmount } + { $taxAmount } davka vsakih { $intervalCount } dni
        }
price-details-tax-week =
    { $intervalCount ->
        [one] { $priceAmount } + { $taxAmount } davka na teden
        [two] { $priceAmount } + { $taxAmount } davka vsaka { $intervalCount } tedna
        [few] { $priceAmount } + { $taxAmount } davka vsake { $intervalCount } tedne
       *[other] { $priceAmount } + { $taxAmount } davka vsakih { $intervalCount } tednov
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + { $taxAmount } davka na teden
            [two] { $priceAmount } + { $taxAmount } davka vsaka { $intervalCount } tedna
            [few] { $priceAmount } + { $taxAmount } davka vsake { $intervalCount } tedne
           *[other] { $priceAmount } + { $taxAmount } davka vsakih { $intervalCount } tednov
        }
price-details-tax-month =
    { $intervalCount ->
        [one] { $priceAmount } + { $taxAmount } davka na mesec
        [two] { $priceAmount } + { $taxAmount } davka vsaka { $intervalCount } meseca
        [few] { $priceAmount } + { $taxAmount } davka vsake { $intervalCount } mesece
       *[other] { $priceAmount } + { $taxAmount } davka vsakih { $intervalCount } mesecev
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + { $taxAmount } davka na mesec
            [two] { $priceAmount } + { $taxAmount } davka vsaka { $intervalCount } meseca
            [few] { $priceAmount } + { $taxAmount } davka vsake { $intervalCount } mesece
           *[other] { $priceAmount } + { $taxAmount } davka vsakih { $intervalCount } mesecev
        }
price-details-tax-year =
    { $intervalCount ->
        [one] { $priceAmount } + { $taxAmount } davka na leto
        [two] { $priceAmount } + { $taxAmount } davka vsaki { $intervalCount } leti
        [few] { $priceAmount } + { $taxAmount } davka vsaka { $intervalCount } leta
       *[other] { $priceAmount } + { $taxAmount } davka vsakih { $intervalCount } let
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + { $taxAmount } davka na leto
            [two] { $priceAmount } + { $taxAmount } davka vsaki { $intervalCount } leti
            [few] { $priceAmount } + { $taxAmount } davka vsaka { $intervalCount } leta
           *[other] { $priceAmount } + { $taxAmount } davka vsakih { $intervalCount } let
        }


subscription-create-title = Nastavite svojo naročnino
subscription-success-title = Potrditev naročnine
subscription-processing-title = Potrjevanje naročnine …
subscription-error-title = Napaka pri potrjevanju naročnine …
subscription-noplanchange-title = Ta sprememba naročniškega načrta ni podprta
subscription-iapsubscribed-title = Že naročeno
sub-guarantee = 30-dnevno vračilo denarja


subplat-mozilla-accounts-legal-heading = { -product-mozilla-accounts(zacetnica: "velika") }
terms = Pogoji storitve
privacy = Obvestilo o zasebnosti
terms-download = Pogoji prenosa


document =
    .title = Firefox računi
close-aria =
    .aria-label = Zapri modalno okno
settings-subscriptions-title = Naročnine
coupon-promo-code = Promocijska koda


plan-price-interval-day =
    { $intervalCount ->
        [one] { $amount } na dan
        [two] { $amount } vsaka { $intervalCount } dneva
        [few] { $amount } vsake { $intervalCount } dni
       *[other] { $amount } vsakih { $intervalCount } dni
    }
    .title =
        { $intervalCount ->
            [one] { $amount } na dan
            [two] { $amount } vsaka { $intervalCount } dneva
            [few] { $amount } vsake { $intervalCount } dni
           *[other] { $amount } vsakih { $intervalCount } dni
        }
plan-price-interval-week =
    { $intervalCount ->
        [one] { $amount } na teden
        [two] { $amount } vsaka { $intervalCount } tedna
        [few] { $amount } vsake { $intervalCount } tedne
       *[other] { $amount } vsakih { $intervalCount } tednov
    }
    .title =
        { $intervalCount ->
            [one] { $amount } na teden
            [two] { $amount } vsaka { $intervalCount } tedna
            [few] { $amount } vsake { $intervalCount } tedne
           *[other] { $amount } vsakih { $intervalCount } tednov
        }
plan-price-interval-month =
    { $intervalCount ->
        [one] { $amount } na mesec
        [two] { $amount } vsaka { $intervalCount } meseca
        [few] { $amount } vsake { $intervalCount } mesece
       *[other] { $amount } vsakih { $intervalCount } mesecev
    }
    .title =
        { $intervalCount ->
            [one] { $amount } na mesec
            [two] { $amount } vsaka { $intervalCount } meseca
            [few] { $amount } vsake { $intervalCount } mesece
           *[other] { $amount } vsakih { $intervalCount } mesecev
        }
plan-price-interval-year =
    { $intervalCount ->
        [one] { $amount } na leto
        [two] { $amount } na { $intervalCount } leti
        [few] { $amount } na { $intervalCount } leta
       *[other] { $amount } na { $intervalCount } let
    }
    .title =
        { $intervalCount ->
            [one] { $amount } na leto
            [two] { $amount } na { $intervalCount } leti
            [few] { $amount } na { $intervalCount } leta
           *[other] { $amount } na { $intervalCount } let
        }


general-error-heading = Splošna napaka aplikacije
basic-error-message = Prišlo je do napake. Poskusite znova pozneje.
payment-error-1 = Hmm. Pri avtorizaciji vašega plačila je prišlo do težave. Poskusite znova ali se obrnite na izdajatelja kartice.
payment-error-2 = Hmm. Pri avtorizaciji vašega plačila je prišlo do težave. Obrnite se na izdajatelja kartice.
payment-error-3b = Med obdelavo vašega plačila je prišlo do nepričakovane napake, poskusite znova.
expired-card-error = Videti je, da se je vaši kreditni kartici iztekla veljavnost. Poskusite z drugo kartico.
insufficient-funds-error = Videti je, da na vaši kartici ni dovolj sredstev. Poskusite z drugo kartico.
withdrawal-count-limit-exceeded-error = Videti je, da bo ta transakcija presegla vaš kreditni limit. Poskusite z drugo kartico.
charge-exceeds-source-limit = Videti je, da bo ta transakcija presegla vaš dnevni kreditni limit. Poskusite z drugo kartico ali čez 24 ur.
instant-payouts-unsupported = Videti je, da vaša debetna kartica ni nastavljena za takojšnja plačila. Poskusite z drugo debetno ali kreditno kartico.
duplicate-transaction = Hmm. Videti je, da je bila identična transakcija pravkar opravljena. Preverite zgodovino plačil.
coupon-expired = Videti je, da je promocijska koda potekla.
card-error = Vaše transakcije ni bilo mogoče obdelati. Preverite podatke o svoji kreditni kartici in poskusite znova.
country-currency-mismatch = Valuta te naročnine ni veljavna za državo, povezano z vašim plačilom.
currency-currency-mismatch = Oprostite. Med valutami ne morete preklapljati.
location-unsupported = V skladu z našimi pogoji uporabe vaša trenutna lokacija ni podprta.
no-subscription-change = Oprostite. Naročniškega paketa ni mogoče spremeniti.
iap-already-subscribed = Že ste naročeni preko { $mobileAppStore }.
fxa-account-signup-error-2 = Vaša prijava v { $productName } je bila neuspešna zaradi sistemske napake. Vašega plačilnega sredstva nismo bremenili. Poskusite znova.
fxa-post-passwordless-sub-error = Naročnina je potrjena, vendar se stran za potrditev ni naložila. Preverite svojo e-pošto in nastavite račun.
newsletter-signup-error = Niste naročeni na e-poštna obvestila o posodobitvah izdelkov. Poskusite lahko znova v nastavitvah računa.
product-plan-error =
    .title = Napaka pri nalaganju načrtov
product-profile-error =
    .title = Napaka pri nalaganju profila
product-customer-error =
    .title = Napaka pri nalaganju stranke
product-plan-not-found = Načrta ni mogoče najti
product-location-unsupported-error = Lokacija ni podprta


coupon-success = Vaš paket se bo samodejno podaljšal po maloprodajni ceni.
coupon-success-repeating = Vaš paket se bo po { $couponDurationDate } samodejno obnovil po maloprodajni ceni.


new-user-step-1-2 = 1. Ustvarite { -product-mozilla-account }
new-user-card-title = Vnesite podatke o kartici
new-user-submit = Naroči se zdaj


sub-update-payment-title = Podatki o plačilu


pay-with-heading-card-only = Plačajte s kartico
product-invoice-preview-error-title = Težava pri nalaganju predogleda računa
product-invoice-preview-error-text = Ni bilo mogoče naložiti predogleda računa


subscription-iaperrorupgrade-title = Nadgradnje še ni mogoče izvesti


brand-name-google-play-2 = Trgovina { -google-play }
brand-name-apple-app-store-2 = Trgovina { -app-store }


product-plan-change-heading = Preglejte spremembo
sub-change-failed = Sprememba načrta ni uspela
sub-update-acknowledgment = Vaš paket se bo spremenil takoj in danes vam bomo zaračunali sorazmeren znesek za preostanek tega obračunskega obdobja. Od { $startingDate } naprej vam bomo zaračunavali celoten znesek.
sub-change-submit = Potrdite spremembo
sub-update-current-plan-label = Trenutni načrt
sub-update-new-plan-label = Nov načrt
sub-update-total-label = Nov znesek
sub-update-prorated-upgrade = Sorazmerna nadgradnja


sub-update-new-plan-daily = { $productName } (dnevno)
sub-update-new-plan-weekly = { $productName } (tedensko)
sub-update-new-plan-monthly = { $productName } (mesečno)
sub-update-new-plan-yearly = { $productName } (letno)
sub-update-prorated-upgrade-credit = Prikazano negativno stanje bo knjiženo v dobroimetje na vašem računu in uporabljeno za prihodnje račune.


sub-item-cancel-sub = Prekliči naročnino
sub-item-stay-sub = Ostanite naročnik


sub-item-cancel-msg = Od zadnjega dne vašega obračunskega obdobja naprej ({ $period }) ne boste mogli več uporabljati izdelka { $name }.
sub-item-cancel-confirm =
    Prekliči moj dostop in shranjene podatke v storitvi
    { $name } z dnem { $period }
sub-promo-coupon-applied = Unovčen kupon { $promotion_name }: <priceDetails></priceDetails>
subscription-management-account-credit-balance = To plačilo naročnine je povzročilo dobroimetje na vašem računu: <priceDetails></priceDetails>


sub-route-idx-reactivating = Obnovitev naročnine ni uspela
sub-route-idx-cancel-failed = Preklic naročnine ni uspel
sub-route-idx-contact = Obrnite se na podporo
sub-route-idx-cancel-msg-title = Žal nam je, da odhajate
sub-route-idx-cancel-msg =
    Vaša naročnina na { $name } je preklicana.
          <br />
          Do { $date } boste lahko še vedno uporabljali { $name }.
sub-route-idx-cancel-aside-2 = Imate vprašanja? Obiščite <a>podporo { -brand-mozilla }</a>.


sub-customer-error =
    .title = Napaka pri nalaganju stranke
sub-invoice-error =
    .title = Napaka pri nalaganju računov
sub-billing-update-success = Vaši podatki za obračun so bili uspešno posodobljeni
sub-invoice-previews-error-title = Težava pri nalaganju predogledov računov
sub-invoice-previews-error-text = Predogledov računov ni bilo mogoče naložiti


pay-update-change-btn = Spremeni
pay-update-manage-btn = Upravljaj


sub-next-bill = Naslednji obračun { $date }
sub-next-bill-due-date = Naslednji račun prihaja { $date }
sub-expires-on = Preteče { $date }




pay-update-card-exp = Poteče { $expirationDate }
sub-route-idx-updating = Posodabljanje podatkov za obračun …
sub-route-payment-modal-heading = Neveljavni podatki za obračun
sub-route-payment-modal-message-2 = Videti je, da je prišlo do napake v vašem računu { -brand-paypal }. Za razrešitev težave s plačilom po potrebi ukrepajte.
sub-route-missing-billing-agreement-payment-alert = Neveljavni podatki o plačilu; pri uporabi vašega računa je prišlo do napake. <div>Upravljaj</div>
sub-route-funding-source-payment-alert = Neveljavni podatki o plačilu; pri uporabi vašega računa je prišlo do napake. Po uspešni posodobitvi podatkov lahko traja nekaj časa, da se to opozorilo izbriše. <div>Upravljaj</div>


sub-item-no-such-plan = Za to naročnino ni takega načrta.
invoice-not-found = Naknadnega računa ni mogoče najti
sub-item-no-such-subsequent-invoice = Naknadnega računa za to naročnino ni mogoče najti.
sub-invoice-preview-error-title = Predogleda računa ni bilo mogoče najti
sub-invoice-preview-error-text = Predogleda računa za to naročnino ni bilo mogoče najti


reactivate-confirm-dialog-header = Želite še naprej uporabljati { $name }?
reactivate-confirm-copy = Vaš dostop do { $name } se bo nadaljeval, vaše obračunsko obdobje in plačilo pa bosta ostali nespremenjeni. Vaša naslednja bremenitev v vrednosti { $amount } bo opravljena dne { $endDate } na kartico, ki se konča s številkami { $last }.
reactivate-confirm-without-payment-method-copy = Vaš dostop do { $name } se bo nadaljeval, vaše obračunsko obdobje in plačilo pa bosta ostali nespremenjeni. Vaša naslednja bremenitev v vrednosti { $amount } bo opravljena dne { $endDate }.
reactivate-confirm-button = Obnovi naročnino


reactivate-panel-copy = Dne <strong>{ $date }</strong> boste izgubili dostop do { $name }.
reactivate-success-copy = Hvala! Pripravljeni ste.
reactivate-success-button = Zapri


sub-iap-item-google-purchase-2 = { -brand-google }: Nakup v aplikaciji
sub-iap-item-apple-purchase-2 = { -brand-apple }: Nakup v aplikaciji
sub-iap-item-manage-button = Upravljaj
