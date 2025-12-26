



-brand-mozilla =
    { $case ->
        [gen] Mozilly
        [dat] Mozille
        [acc] Mozillu
        [voc] Mozillo
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
        [voc] Firefoxe
        [loc] Firefoxu
        [ins] Firefoxem
       *[nom] Firefox
    }
    .gender = masculine
-product-firefox-accounts =
    { $case ->
        [gen]
            { $capitalization ->
                [lower] účtu Firefoxu
               *[upper] Účtu Firefoxu
            }
        [dat]
            { $capitalization ->
                [lower] účtu Firefoxu
               *[upper] Účtu Firefoxu
            }
        [acc]
            { $capitalization ->
                [lower] účet Firefoxu
               *[upper] Účet Firefoxu
            }
        [voc]
            { $capitalization ->
                [lower] účte Firefoxu
               *[upper] Účte Firefoxu
            }
        [loc]
            { $capitalization ->
                [lower] účtu Firefoxu
               *[upper] Účtu Firefoxu
            }
        [ins]
            { $capitalization ->
                [lower] účtem Firefoxu
               *[upper] Účtem Firefoxu
            }
       *[nom]
            { $capitalization ->
                [lower] účet Firefoxu
               *[upper] Účet Firefoxu
            }
    }
-product-mozilla-account =
    { $case ->
        [gen]
            { $capitalization ->
                [lower] účtu Mozilla
                [upper] Účtu Mozilla
                [lowercase] účtu Mozilla
               *[uppercase] Účtu Mozilla
            }
        [dat]
            { $capitalization ->
                [lower] účtu Mozilla
                [upper] Účtu Mozilla
                [lowercase] účtu Mozilla
               *[uppercase] Účtu Mozilla
            }
        [acc]
            { $capitalization ->
                [lower] účet Mozilla
                [upper] Účet Mozilla
                [lowercase] účet Mozilla
               *[uppercase] Účet Mozilla
            }
        [voc]
            { $capitalization ->
                [lower] účte Mozilla
                [upper] Účte Mozilla
                [lowercase] účte Mozilla
               *[uppercase] Účte Mozilla
            }
        [loc]
            { $capitalization ->
                [lower] účtu Mozilla
                [upper] Účtu Mozilla
                [lowercase] účtu Mozilla
               *[uppercase] Účtu Mozilla
            }
        [ins]
            { $capitalization ->
                [lower] účtem Mozilla
                [upper] Účtem Mozilla
                [lowercase] účtem Mozilla
               *[uppercase] Účtem Mozilla
            }
       *[nom]
            { $capitalization ->
                [lower] účet Mozilla
                [upper] Účet Mozilla
                [lowercase] účet Mozilla
               *[uppercase] Účet Mozilla
            }
    }
-product-mozilla-accounts =
    { $case ->
        [gen]
            { $capitalization ->
                [lower] účtu Mozilla
                [upper] Účtu Mozilla
                [lowercase] účtu Mozilla
               *[uppercase] Účtu Mozilla
            }
        [dat]
            { $capitalization ->
                [lower] účtu Mozilla
                [upper] Účtu Mozilla
                [lowercase] účtu Mozilla
               *[uppercase] Účtu Mozilla
            }
        [acc]
            { $capitalization ->
                [lower] účet Mozilla
                [upper] Účet Mozilla
                [lowercase] účet Mozilla
               *[uppercase] Účet Mozilla
            }
        [voc]
            { $capitalization ->
                [lower] účte Mozilla
                [upper] Účte Mozilla
                [lowercase] účte Mozilla
               *[uppercase] Účte Mozilla
            }
        [loc]
            { $capitalization ->
                [lower] účtu Mozilla
                [upper] Účtu Mozilla
                [lowercase] účtu Mozilla
               *[uppercase] Účtu Mozilla
            }
        [ins]
            { $capitalization ->
                [lower] účtem Mozilla
                [upper] Účtem Mozilla
                [lowercase] účtem Mozilla
               *[uppercase] Účtem Mozilla
            }
       *[nom]
            { $capitalization ->
                [lower] účet Mozilla
                [upper] Účet Mozilla
                [lowercase] účet Mozilla
               *[uppercase] Účet Mozilla
            }
    }
-product-firefox-account =
    { $case ->
        [gen]
            { $capitalization ->
                [lower] účtu Firefoxu
               *[upper] Účtu Firefoxu
            }
        [dat]
            { $capitalization ->
                [lower] účtu Firefoxu
               *[upper] Účtu Firefoxu
            }
        [acc]
            { $capitalization ->
                [lower] účet Firefoxu
               *[upper] Účet Firefoxu
            }
        [voc]
            { $capitalization ->
                [lower] účte Firefoxu
               *[upper] Účte Firefoxu
            }
        [loc]
            { $capitalization ->
                [lower] účtu Firefoxu
               *[upper] Účtu Firefoxu
            }
        [ins]
            { $capitalization ->
                [lower] účtem Firefoxu
               *[upper] Účtem Firefoxu
            }
       *[nom]
            { $capitalization ->
                [lower] účet Firefoxu
               *[upper] Účet Firefoxu
            }
    }
-product-mozilla-vpn =
    { $case ->
        [gen] Mozilly VPN
        [dat] Mozille VPN
        [acc] Mozillu VPN
        [voc] Mozillo VPN
        [loc] Mozille VPN
        [ins] Mozillou VPN
       *[nom] Mozilla VPN
    }
    .gender = feminine
-product-mozilla-vpn-short = VPN
-product-mozilla-hubs = Mozilla Hubs
-product-mdn = MDN
-product-mdn-plus = MDN Plus
-product-firefox-cloud =
    { $case ->
        [gen] Firefox Cloudu
        [dat] Firefox Cloudu
        [acc] Firefox Cloud
        [voc] Firefox Cloude
        [loc] Firefox Cloudu
        [ins] Firefox Cloudem
       *[nom] Firefox Cloud
    }
    .gender = masculine
-product-mozilla-monitor = Mozilla Monitor
-product-mozilla-monitor-short =
    { $case ->
        [gen] Monitoru
        [dat] Monitoru
        [acc] Monitor
        [voc] Monitore
        [loc] Monitoru
        [ins] Monitorem
       *[nom] Monitor
    }
    .gender = masculine
-product-firefox-relay =
    { $case ->
        [gen] Firefoxu Relay
        [dat] Firefoxu Relay
        [acc] Firefox Relay
        [voc] Firefoxe Relay
        [loc] Firefoxu Relay
        [ins] Firefoxem Relay
       *[nom] Firefox Relay
    }
    .gender = masculine
-product-firefox-relay-short = Relay
-brand-apple =
    { $case ->
        [gen] Applu
        [dat] Applu
        [acc] Apple
        [voc] Apple
        [loc] Applu
        [ins] Applem
       *[nom] Apple
    }
    .gender = masculine
-brand-apple-pay = Apple Pay
-brand-google =
    { $case ->
        [gen] Googlu
        [dat] Googlu
        [acc] Google
        [voc] Google
        [loc] Googlu
        [ins] Googlem
       *[nom] Google
    }
    .gender = masculine
-brand-google-pay = Google Pay
-brand-paypal =
    { $case ->
        [gen] PayPalu
        [dat] PayPalu
        [acc] PayPal
        [voc] PayPale
        [loc] PayPalu
        [ins] PayPalem
       *[nom] PayPal
    }
    .gender = masculine
-brand-name-stripe =
    { $case ->
        [gen] Stripu
        [dat] Stripu
        [acc] Stripe
        [voc] Stripe
        [loc] Stripu
        [ins] Stripem
       *[nom] Stripe
    }
    .gender = masculine
-brand-amex = American Express
-brand-diners = Diners Club
-brand-discover = Discover
-brand-jcb = JCB
-brand-link = Link
-brand-mastercard = Mastercard
-brand-unionpay = UnionPay
-brand-visa = Visa
-app-store =
    { $case ->
        [gen] App Storu
        [dat] App Storu
        [acc] App Store
        [voc] App Store
        [loc] App Storu
        [ins] App Storem
       *[nom] App Store
    }
    .gender = masculine
-google-play = Google Play

app-general-err-heading = Obecná chyba aplikace
app-general-err-message = Něco se pokazilo. Zkuste to prosím znovu později.
app-query-parameter-err-heading = Špatný požadavek: neplatné parametry v dotazu


app-footer-mozilla-logo-label = logo { -brand-mozilla(case: "gen") }
app-footer-privacy-notice = Zásady ochrany osobních údajů
app-footer-terms-of-service = Podmínky služby


app-default-title-2 = { -product-mozilla-accounts }
app-page-title-2 = { $title } | { -product-mozilla-accounts }


link-sr-new-window = Otevře se v novém okně


app-loading-spinner-aria-label-loading = Načítání…


app-logo-alt-3 =
    .alt = Logo { -brand-mozilla } m



settings-home = Domovská stránka účtu
settings-project-header-title = { -product-mozilla-account }


coupon-promo-code-applied = Promo kód byl použit
coupon-submit = Použít
coupon-remove = Odebrat
coupon-error = Zadaný kód je neplatný nebo jeho platnost vypršela.
coupon-error-generic = Při zpracování kódu došlo k chybě. Zkuste to prosím znovu.
coupon-error-expired = Platnost zadaného kódu vypršela.
coupon-error-limit-reached = Limit kódu, který jste zadali, už byl vyčerpán.
coupon-error-invalid = Zadaný kód je neplatný.
coupon-enter-code =
    .placeholder = Vložte kód


default-input-error = Toto pole je povinné
input-error-is-required = Pole „{ $label }“ je povinné


brand-name-mozilla-logo = Logo { -brand-mozilla(case: "gen") }


new-user-sign-in-link-2 = Už máte { -product-mozilla-account(capitalization: "lower") }? <a>Přihlaste se</a>
new-user-enter-email =
    .label = Zadejte svou e-mailovou adresu
new-user-confirm-email =
    .label = Potvrďte svou e-mailovou adresu
new-user-subscribe-product-updates-mozilla = Chci dostávat produktové novinky o { -brand-mozilla(case: "loc") }
new-user-subscribe-product-updates-snp = Chci dostávat novinky a aktualizace týkající se zabezpečení a ochrany osobních údajů od { -brand-mozilla(case: "loc") }
new-user-subscribe-product-updates-hubs = Chci dostávat produktové novinky a aktualizace z { -product-mozilla-hubs(case: "loc") } a { -brand-mozilla(case: "loc") }
new-user-subscribe-product-updates-mdnplus = Chci dostávat produktové novinky a aktualizace od { -product-mdn-plus } a { -brand-mozilla(case: "loc") }
new-user-subscribe-product-assurance = Vaši e-mailovou adresu použijeme pouze k založení vašeho účtu. Nikdy ne neprodáme žádné třetí straně.
new-user-email-validate = E-mailová adresa je neplatná
new-user-email-validate-confirm = E-mailové adresy se neshodují
new-user-already-has-account-sign-in = Účet už máte, <a>přihlaste se</a>
new-user-invalid-email-domain = Neudělali jste překlep? Doména { $domain } nemá e-maily.


payment-confirmation-thanks-heading = Děkujeme!
payment-confirmation-thanks-heading-account-exists = Děkujeme. Nyní zkontrolujte svou e-mailovou schránku.
payment-confirmation-thanks-subheading = Na adresu { $email } jsme vám poslali e-mail v potvrzením a podrobnostmi jak začít náš produkt { $product_name } používat.
payment-confirmation-thanks-subheading-account-exists = Na adresu { $email } vám zasíláme e-mail s pokyny pro nastavení vašeho účtu a s informacemi k platbě.
payment-confirmation-order-heading = Detaily objednávky
payment-confirmation-invoice-number = Faktura č. { $invoiceNumber }
payment-confirmation-invoice-date = { $invoiceDate }
payment-confirmation-details-heading-2 = Platební informace
payment-confirmation-amount = { $amount } jednou za { $interval }
payment-confirmation-amount-day =
    { $intervalCount ->
        [one] { $amount } každý den
        [few] { $amount } každé { $intervalCount } dny
       *[other] { $amount } každých { $intervalCount } dní
    }
payment-confirmation-amount-week =
    { $intervalCount ->
        [one] { $amount } týdně
        [few] { $amount } každé { $intervalCount } týdny
       *[other] { $amount } každých { $intervalCount } týdnů
    }
payment-confirmation-amount-month =
    { $intervalCount ->
        [one] { $amount } měsíčně
        [few] { $amount } každé { $intervalCount } měsíce
       *[other] { $amount } každých { $intervalCount } měsíců
    }
payment-confirmation-amount-year =
    { $intervalCount ->
        [one] { $amount } ročně
        [few] { $amount } každé { $intervalCount } roky
       *[other] { $amount } každých { $intervalCount } let
    }
payment-confirmation-download-button = Pokračovat ke stažení


payment-confirm-with-legal-links-static-3 = Opravňuji organizaci { -brand-mozilla } účtovat uvedenou částku na vrub mého způsobu platby, a to v souladu s <termsOfServiceLink>podmínkami poskytování služby</termsOfServiceLink> a <privacyNoticeLink>zásadami ochrany osobních údajů</privacyNoticeLink>, dokud nezruším své předplatné.
payment-confirm-checkbox-error = Pro pokračování je třeba toto dokončit


payment-error-retry-button = Zkusit znovu
payment-error-manage-subscription-button = Správa předplatného


iap-upgrade-already-subscribed-2 = Předplatné produktu { $productName } už máte skrze obchod s aplikacemi { -brand-google } nebo { -brand-apple }.
iap-upgrade-no-bundle-support = V tuto chvílí změnu plánu těchto předplatných nepodporujeme, ale brzy budeme.
iap-upgrade-contact-support = Tento produkt můžete stále získat – abychom vám mohli pomoci, kontaktujte prosím podporu.
iap-upgrade-get-help-button = Získat pomoc


payment-name =
    .placeholder = Celé jméno
    .label = Jak je uvedeno na vaší kartě
payment-cc =
    .label = Vaše karta
payment-cancel-btn = Zrušit
payment-update-btn = Aktualizovat
payment-pay-btn = Zaplatit
payment-pay-with-paypal-btn-2 = Zaplatit přes { -brand-paypal }
payment-validate-name-error = Zadejte prosím své jméno


payment-legal-copy-stripe-and-paypal-3 = { -brand-mozilla } používá pro bezpečné zpracování plateb { -brand-name-stripe } a { -brand-paypal }.
payment-legal-link-stripe-paypal-2 = Zásady ochrany osobních údajů pro službu <stripePrivacyLink>{ -brand-name-stripe }</stripePrivacyLink> &nbsp; Zásady ochrany osobních údajů pro službu <paypalPrivacyLink>{ -brand-paypal }</paypalPrivacyLink>
payment-legal-copy-paypal-2 = { -brand-mozilla } používá pro bezpečné zpracování plateb { -brand-paypal(case: "acc") }.
payment-legal-link-paypal-3 = Zásady ochrany osobních údajů pro službu <paypalPrivacyLink>{ -brand-paypal }</paypalPrivacyLink>
payment-legal-copy-stripe-3 = { -brand-mozilla } používá pro bezpečné zpracování plateb { -brand-name-stripe(case: "acc") }.
payment-legal-link-stripe-3 = Zásady ochrany osobních údajů pro službu <stripePrivacyLink>{ -brand-name-stripe }</stripePrivacyLink>.


payment-method-header = Vyberte způsob platby
payment-method-header-second-step = 2. { payment-method-header }
payment-method-first-approve = Nejprve musíte schválit své předplatné


payment-processing-message = Počkejte prosím na zpracování vaší platby…


payment-confirmation-cc-card-ending-in = Karta končící na { $last4 }


pay-with-heading-paypal-2 = Zaplatit přes { -brand-paypal }


plan-details-header = Informace o produktu
plan-details-list-price = Ceník
plan-details-show-button = Zobrazit podrobnosti
plan-details-hide-button = Skrýt podrobnosti
plan-details-total-label = Celkem
plan-details-tax = Daně a poplatky


product-no-such-plan = Takové předplatné pro tento produkt neexistuje.


price-details-no-tax = { $priceAmount }
price-details-tax = { $priceAmount } + daň { $taxAmount }
price-details-no-tax-day =
    { $intervalCount ->
        [one] { $priceAmount } denně
        [few] { $priceAmount } každé { $intervalCount } dny
        [many] { $priceAmount } každých { $intervalCount } dní
       *[other] { $priceAmount } každých { $intervalCount } dní
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } denně
            [few] { $priceAmount } každé { $intervalCount } dny
            [many] { $priceAmount } každých { $intervalCount } dní
           *[other] { $priceAmount } každých { $intervalCount } dní
        }
price-details-no-tax-week =
    { $intervalCount ->
        [one] { $priceAmount } týdně
        [few] { $priceAmount } každé { $intervalCount } týdny
        [many] { $priceAmount } každých { $intervalCount } týdnů
       *[other] { $priceAmount } každých { $intervalCount } týdnů
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } týdně
            [few] { $priceAmount } každé { $intervalCount } týdny
            [many] { $priceAmount } každých { $intervalCount } týdnů
           *[other] { $priceAmount } každých { $intervalCount } týdnů
        }
price-details-no-tax-month =
    { $intervalCount ->
        [one] { $priceAmount } měsíčně
        [few] { $priceAmount } každé { $intervalCount } měsíce
        [many] { $priceAmount } každých { $intervalCount } měsíců
       *[other] { $priceAmount } každých { $intervalCount } měsíců
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } měsíčně
            [few] { $priceAmount } každé { $intervalCount } měsíce
            [many] { $priceAmount } každých { $intervalCount } měsíců
           *[other] { $priceAmount } každých { $intervalCount } měsíců
        }
price-details-no-tax-year =
    { $intervalCount ->
        [one] { $priceAmount } ročně
        [few] { $priceAmount } každé { $intervalCount } roky
        [many] { $priceAmount } každých { $intervalCount } let
       *[other] { $priceAmount } každých { $intervalCount } let
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } ročně
            [few] { $priceAmount } každé { $intervalCount } roky
            [many] { $priceAmount } každých { $intervalCount } let
           *[other] { $priceAmount } každých { $intervalCount } let
        }
price-details-tax-day =
    { $intervalCount ->
        [one] { $priceAmount } + daň { $taxAmount } denně
        [few] { $priceAmount } + daň { $taxAmount } každé { $intervalCount } dny
        [many] { $priceAmount } + daň { $taxAmount } každých { $intervalCount } dní
       *[other] { $priceAmount } + daň { $taxAmount } každých { $intervalCount } dní
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + daň { $taxAmount } denně
            [few] { $priceAmount } + daň { $taxAmount } každé { $intervalCount } dny
            [many] { $priceAmount } + daň { $taxAmount } každých { $intervalCount } dní
           *[other] { $priceAmount } + daň { $taxAmount } každých { $intervalCount } dní
        }
price-details-tax-week =
    { $intervalCount ->
        [one] { $priceAmount } + daň { $taxAmount } týdně
        [few] { $priceAmount } + daň { $taxAmount } každé { $intervalCount } týdny
        [many] { $priceAmount } + daň { $taxAmount } každých { $intervalCount } týdnů
       *[other] { $priceAmount } + daň { $taxAmount } každých { $intervalCount } týdnů
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + daň { $taxAmount } týdně
            [few] { $priceAmount } + daň { $taxAmount } každé { $intervalCount } týdny
            [many] { $priceAmount } + daň { $taxAmount } každých { $intervalCount } týdnů
           *[other] { $priceAmount } + daň { $taxAmount } každých { $intervalCount } týdnů
        }
price-details-tax-month =
    { $intervalCount ->
        [one] { $priceAmount } + daň { $taxAmount } měsíčně
        [few] { $priceAmount } + daň { $taxAmount } každé { $intervalCount } měsíce
        [many] { $priceAmount } + daň { $taxAmount } každých { $intervalCount } měsíců
       *[other] { $priceAmount } + daň { $taxAmount } každých { $intervalCount } měsíců
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + daň { $taxAmount } měsíčně
            [few] { $priceAmount } + daň { $taxAmount } každé { $intervalCount } měsíce
            [many] { $priceAmount } + daň { $taxAmount } každých { $intervalCount } měsíců
           *[other] { $priceAmount } + daň { $taxAmount } každých { $intervalCount } měsíců
        }
price-details-tax-year =
    { $intervalCount ->
        [one] { $priceAmount } + daň { $taxAmount } ročně
        [few] { $priceAmount } + daň { $taxAmount } každé { $intervalCount } roky
        [many] { $priceAmount } + daň { $taxAmount } každých { $intervalCount } let
       *[other] { $priceAmount } + daň { $taxAmount } každých { $intervalCount } let
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + daň { $taxAmount } ročně
            [few] { $priceAmount } + daň { $taxAmount } každé { $intervalCount } roky
            [many] { $priceAmount } + daň { $taxAmount } každých { $intervalCount } let
           *[other] { $priceAmount } + daň { $taxAmount } každých { $intervalCount } let
        }


subscription-create-title = Nastavení předplatného
subscription-success-title = Potvrzení předplatného
subscription-processing-title = Potvrzování předplatného…
subscription-error-title = Potvrzení předplatného se nezdařilo…
subscription-noplanchange-title = Tato změna předplatného není podporována
subscription-iapsubscribed-title = Už předplatné máte
sub-guarantee = 30denní záruka vrácení peněz


subplat-mozilla-accounts-legal-heading = { -product-mozilla-accounts(capitalization: "uppercase") }
terms = Podmínky služby
privacy = Zásady ochrany osobních údajů
terms-download = Stáhnout podmínky


document =
    .title = Účet Firefoxu
close-aria =
    .aria-label = Zavřít
settings-subscriptions-title = Předplatné
coupon-promo-code = Promo kód


plan-price-interval-day =
    { $intervalCount ->
        [one] { $amount } denně
        [few] { $amount } každé { $intervalCount } dny
        [many] { $amount } každých { $intervalCount } dní
       *[other] { $amount } každých { $intervalCount } dní
    }
    .title =
        { $intervalCount ->
            [one] { $amount } denně
            [few] { $amount } každé { $intervalCount } dny
            [many] { $amount } každých { $intervalCount } dní
           *[other] { $amount } každých { $intervalCount } dní
        }
plan-price-interval-week =
    { $intervalCount ->
        [one] { $amount } týdně
        [few] { $amount } každé { $intervalCount } týdny
        [many] { $amount } každých { $intervalCount } týdnů
       *[other] { $amount } každých { $intervalCount } týdnů
    }
    .title =
        { $intervalCount ->
            [one] { $amount } týdně
            [few] { $amount } každé { $intervalCount } týdny
            [many] { $amount } každých { $intervalCount } týdnů
           *[other] { $amount } každých { $intervalCount } týdnů
        }
plan-price-interval-month =
    { $intervalCount ->
        [one] { $amount } měsíčně
        [few] { $amount } každé { $intervalCount } měsíce
        [many] { $amount } každých { $intervalCount } měsíců
       *[other] { $amount } každých { $intervalCount } měsíců
    }
    .title =
        { $intervalCount ->
            [one] { $amount } měsíčně
            [few] { $amount } každé { $intervalCount } měsíce
            [many] { $amount } každých { $intervalCount } měsíců
           *[other] { $amount } každých { $intervalCount } měsíců
        }
plan-price-interval-year =
    { $intervalCount ->
        [one] { $amount } ročně
        [few] { $amount } každé { $intervalCount } roky
        [many] { $amount } každých { $intervalCount } let
       *[other] { $amount } každých { $intervalCount } let
    }
    .title =
        { $intervalCount ->
            [one] { $amount } ročně
            [few] { $amount } každé { $intervalCount } roky
            [many] { $amount } každých { $intervalCount } let
           *[other] { $amount } každých { $intervalCount } let
        }


general-error-heading = Obecná chyba aplikace
basic-error-message = Něco se pokazilo. Zkuste to prosím znovu později.
payment-error-1 = Autorizace vaší platby se nezdařila. Zkuste to prosím znovu nebo kontaktujte vydavatele vaší karty.
payment-error-2 = Autorizace vaší platby se nezdařila. Kontaktujte prosím vydavatele vaší karty.
payment-error-3b = Při zpracování platby došlo k neočekávané chybě, zkuste to prosím znovu.
expired-card-error = Vypadá to, že platnost vaší karty vypršela. Zkuste použít jinou.
insufficient-funds-error = Vypadá to, že na vaší kartě není dostatek proštředků. Zkuste použít jinou.
withdrawal-count-limit-exceeded-error = Vypadá to, že je vyčerpán limit vaší karty. Zkuste použít jinou.
charge-exceeds-source-limit = Vypadá to, že je vyčerpán denní limit vaší karty. Zkuste to znovu za 24 hodin, nebo použít jinou kartu.
instant-payouts-unsupported = Vypadá to, že vaše karta nemá povolené okamžité platby. Zkuste použít jinou.
duplicate-transaction = Vypadá to, že jsme před chvíli přijali zcela stejnou transakci. Zkontrolujte prosím historii svých plateb.
coupon-expired = Platnost tohoto promo kódu už nejspíše skončila.
card-error = Vaši transakci se nepodařilo zpracovat. Zkontrolujte prosím zadané údaje o své kartě a zkuste to znovu.
country-currency-mismatch = Měna použitá pro toto předplatné není platná pro zemi spojenou s vaší platbou.
currency-currency-mismatch = Změna měny bohužel není možná.
location-unsupported = Vaše aktuální poloha není podle našich podmínek služby podporována.
no-subscription-change = Promiňte. Svůj plán předplatného nemůžete změnit.
iap-already-subscribed = Předplatné už máte skrze obchod { $mobileAppStore }.
fxa-account-signup-error-2 = Chyba v systému zabránila registraci produktu { $productName }. Nebyla vám zaúčtována žádná platba. Zkuste to prosím znovu.
fxa-post-passwordless-sub-error = Předplatné je potvrzeno, ale nepodařilo se načíst stránku s potvrzením. Informace ohledně nastavení účtu najdete ve své e-mailové schránce.
newsletter-signup-error = Nejste přihlášeni k odběru e-mailů o produktových novinkách. Přihlásit se můžete v nastavení účtu.
product-plan-error =
    .title = Předplatné se nepodařilo načíst
product-profile-error =
    .title = Profil se nepodařilo načíst
product-customer-error =
    .title = Informace o zákazníkovi se nepodařilo načíst
product-plan-not-found = Předplatné nenalezeno
product-location-unsupported-error = Lokalita není podporována


coupon-success = Váš plán se automaticky obnoví za běžnou cenu podle ceníku.
coupon-success-repeating = Vaše předplatné se po { $couponDurationDate } automaticky obnoví za běžnou cenu dle ceníku.


new-user-step-1-2 = 1. Vytvoření { -product-mozilla-account(case: "gen", capitalization: "lower") }
new-user-card-title = Zadejte informace o platební kartě
new-user-submit = Předplatit


sub-update-payment-title = Platební informace


pay-with-heading-card-only = Zaplatit kartou
product-invoice-preview-error-title = Náhled faktury se nepodařilo načíst
product-invoice-preview-error-text = Náhled faktury nelze načíst


subscription-iaperrorupgrade-title = Vaše předplatné zatím nemůžeme povýšit


brand-name-google-play-2 = Obchod { -google-play }
brand-name-apple-app-store-2 = { -app-store }


product-plan-change-heading = Zkontrolujte změnu předplatného
sub-change-failed = Nepodařilo se změnit vaše předplatné
sub-update-acknowledgment = Vaše předplatné se změní okamžitě a bude vám naúčtována platba jako doplatek do konce stávajícího předplatného. Od { $startingDate } vám bude účtována plná částka.
sub-change-submit = Potvrdit změnu
sub-update-current-plan-label = Stávající předplatné
sub-update-new-plan-label = Nový plán
sub-update-total-label = Nová celková částka
sub-update-prorated-upgrade = Poměrná aktualizace


sub-update-new-plan-daily = { $productName } (denně)
sub-update-new-plan-weekly = { $productName } (týdně)
sub-update-new-plan-monthly = { $productName } (měsíčně)
sub-update-new-plan-yearly = { $productName } (ročně)
sub-update-prorated-upgrade-credit = Zobrazený záporný zůstatek bude připsán ve prospěch vašeho účtu a bude použit k úhradě budoucích faktur.


sub-item-cancel-sub = Zrušit předplatné
sub-item-stay-sub = Zachovat předplatné


sub-item-cancel-msg =
    Po skončení předplaceného období { $period }
    už nebudete mít ke službě { $name } přístup.
sub-item-cancel-confirm = Zrušit můj přístup a smazat má uložená data ve službě { $name } dne { $period }
sub-promo-coupon-applied = Kupón { $promotion_name } byl použit: <priceDetails></priceDetails>
subscription-management-account-credit-balance = Tato platba za předplatné způsobila, že se na vašem účtu připsal kredit: <priceDetails></priceDetails>


sub-route-idx-reactivating = Předplatné se nepodařilo opětovně aktivovat
sub-route-idx-cancel-failed = Předplatné se nepodařilo zrušit
sub-route-idx-contact = Kontaktujte podporu
sub-route-idx-cancel-msg-title = Je nám líto, že odcházíte
sub-route-idx-cancel-msg =
    Vaše předplatné služby { $name } bylo zrušeno.
          <br />
          Přístup ke službě { $name } vám zůstane do { $date }.
sub-route-idx-cancel-aside-2 = Máte otázky? Navštivte <a>podporu { -brand-mozilla(case: "gen") }</a>.


sub-customer-error =
    .title = Informace o zákazníkovi se nepodařilo načíst
sub-invoice-error =
    .title = Fakturu se nepodařilo načíst
sub-billing-update-success = Vaše platební údaje byly úspěšně aktualizovány
sub-invoice-previews-error-title = Náhledy faktur se nepodařilo načíst
sub-invoice-previews-error-text = Náhledy faktur nelze načíst


pay-update-change-btn = Změnit
pay-update-manage-btn = Správa


sub-next-bill = Další platba dne { $date }
sub-next-bill-due-date = Další platba je splatná dne { $date }
sub-expires-on = Datum konce platnosti: { $date }




pay-update-card-exp = Konec platnosti { $expirationDate }
sub-route-idx-updating = Probíhá aktualizace platebních údajů…
sub-route-payment-modal-heading = Neplatné platební údaje
sub-route-payment-modal-message-2 = U vašeho účtu { -brand-paypal } došlo k chybě. Je potřeba, abyste podnikli nezbytné kroky pro vyřešení problému s touto platbou.
sub-route-missing-billing-agreement-payment-alert = Neplatné platební údaje. U vašeho účtu došlo k chybě. <div>Spravovat</div>
sub-route-funding-source-payment-alert = Neplatné platební údaje. U vašeho účtu došlo k chybě. Tato chyba se může zobrazovat i nějaký čas poté, co své údaje aktualizujete. <div>Spravovat</div>


sub-item-no-such-plan = Takové předplatné pro neexistuje.
invoice-not-found = Následná faktura nebyla nalezena
sub-item-no-such-subsequent-invoice = Následná faktura pro toto předplatné nebyla nalezena.
sub-invoice-preview-error-title = Náhled faktury nenalezen
sub-invoice-preview-error-text = Náhled faktury pro toto předplatné nebyl nalezen


reactivate-confirm-dialog-header = Chcete i nadále používat { $name }?
reactivate-confirm-copy =
    Až do konce stávajícího platebního období zůstane váš přístup a platby
    za službu { $name } beze změny. Vaše další platba ve výši { $amount }
    bude stržena z karty s číslem končícím na { $last } dne { $endDate }.
reactivate-confirm-without-payment-method-copy =
    Až do konce stávajícího platebního období zůstane váš přístup a platby
    za službu { $name } beze změny. Vaše další platba ve výši { $amount }
    bude účtována dne { $endDate }.
reactivate-confirm-button = Obnovit předplatné


reactivate-panel-copy = Přístup ke službě { $name } ztratíte <strong>{ $date }</strong>.
reactivate-success-copy = Děkujeme. Vše je nastaveno.
reactivate-success-button = Zavřít


sub-iap-item-google-purchase-2 = { -brand-google }: Nákup v aplikaci
sub-iap-item-apple-purchase-2 = { -brand-apple }: Nákup v aplikaci
sub-iap-item-manage-button = Spravovat
