



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
