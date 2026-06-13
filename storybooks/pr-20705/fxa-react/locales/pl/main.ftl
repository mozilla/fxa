



-brand-mozilla =
    { $case ->
        [gen] Mozilli
        [dat] Mozilli
        [acc] Mozillę
        [ins] Mozillą
        [loc] Mozilli
       *[nom] Mozilla
    }
-brand-firefox =
    { $case ->
        [gen] Firefoksa
        [dat] Firefoksowi
        [acc] Firefoksa
        [ins] Firefoksem
        [loc] Firefoksie
       *[nom] Firefox
    }
-product-firefox-accounts =
    { $case ->
        [gen]
            { $capitalization ->
                [lower] kont Firefoksa
               *[upper] Kont Firefoksa
            }
        [dat]
            { $capitalization ->
                [lower] kontom Firefoksa
               *[upper] Kontom Firefoksa
            }
        [acc]
            { $capitalization ->
                [lower] konta Firefoksa
               *[upper] Konta Firefoksa
            }
        [ins]
            { $capitalization ->
                [lower] kontami Firefoksa
               *[upper] Kontami Firefoksa
            }
        [loc]
            { $capitalization ->
                [lower] kontach Firefoksa
               *[upper] Kontach Firefoksa
            }
       *[nom]
            { $capitalization ->
                [lower] konta Firefoksa
               *[upper] Konta Firefoksa
            }
    }
-product-mozilla-account =
    { $case ->
        [gen]
            { $capitalization ->
                [lower] konta Mozilli
               *[upper] Konta Mozilli
            }
        [dat]
            { $capitalization ->
                [lower] kontu Mozilli
               *[upper] Kontu Mozilli
            }
        [acc]
            { $capitalization ->
                [lower] konto Mozilli
               *[upper] Konto Mozilli
            }
        [ins]
            { $capitalization ->
                [lower] kontem Mozilli
               *[upper] Kontem Mozilli
            }
        [loc]
            { $capitalization ->
                [lower] koncie Mozilli
               *[upper] Koncie Mozilli
            }
       *[nom]
            { $capitalization ->
                [lower] konto Mozilli
               *[upper] Konto Mozilli
            }
    }
-product-mozilla-accounts =
    { $case ->
        [gen]
            { $capitalization ->
                [lower] kont Mozilli
               *[upper] Kont Mozilli
            }
        [dat]
            { $capitalization ->
                [lower] kontom Mozilli
               *[upper] Kontom Mozilli
            }
        [acc]
            { $capitalization ->
                [lower] konta Mozilli
               *[upper] Konta Mozilli
            }
        [ins]
            { $capitalization ->
                [lower] kontami Mozilli
               *[upper] Kontami Mozilli
            }
        [loc]
            { $capitalization ->
                [lower] kontach Mozilli
               *[upper] Kontach Mozilli
            }
       *[nom]
            { $capitalization ->
                [lower] konta Mozilli
               *[upper] Konta Mozilli
            }
    }
-product-firefox-account =
    { $case ->
        [gen]
            { $capitalization ->
                [lower] konta Firefoksa
               *[upper] Konta Firefoksa
            }
        [dat]
            { $capitalization ->
                [lower] kontu Firefoksa
               *[upper] Kontu Firefoksa
            }
        [acc]
            { $capitalization ->
                [lower] konto Firefoksa
               *[upper] Konto Firefoksa
            }
        [ins]
            { $capitalization ->
                [lower] kontem Firefoksa
               *[upper] Kontem Firefoksa
            }
        [loc]
            { $capitalization ->
                [lower] koncie Firefoksa
               *[upper] Koncie Firefoksa
            }
       *[nom]
            { $capitalization ->
                [lower] konto Firefoksa
               *[upper] Konto Firefoksa
            }
    }
-product-mozilla-vpn = Mozilla VPN
-product-mozilla-vpn-short = VPN
-product-mozilla-hubs = Mozilla Hubs
-product-mdn = MDN
-product-mdn-plus = MDN Plus
-product-firefox-cloud = Firefox Cloud
-product-mozilla-monitor = Mozilla Monitor
-product-mozilla-monitor-short = Monitor
-product-firefox-relay = Firefox Relay
-product-firefox-relay-short = Relay
-brand-apple =
    { $case ->
        [gen] Apple’a
        [dat] Apple’owi
        [acc] Apple’a
        [ins] Apple’em
        [loc] Apple’u
       *[nom] Apple
    }
-brand-apple-pay = Apple Pay
-brand-google = Google
-brand-google-pay = Google Pay
-brand-paypal = PayPal
-brand-name-stripe = Stripe
-brand-amex = American Express
-brand-diners = Diners Club
-brand-discover = Discover
-brand-jcb = JCB
-brand-link = Link
-brand-mastercard = Mastercard
-brand-unionpay = UnionPay
-brand-visa = Visa
-app-store = App Store
-google-play = Google Play

app-general-err-heading = Ogólny błąd aplikacji
app-general-err-message = Coś się nie powiodło. Proszę spróbować ponownie później.
app-query-parameter-err-heading = Błędne żądanie: nieprawidłowe parametry zapytania


app-footer-mozilla-logo-label = Logo { -brand-mozilla(case: "gen") }
app-footer-privacy-notice = Zasady ochrony prywatności
app-footer-terms-of-service = Regulamin usługi


app-default-title-2 = { -product-mozilla-accounts }
app-page-title-2 = { $title } | { -product-mozilla-accounts }


link-sr-new-window = Otwiera w nowym oknie


app-loading-spinner-aria-label-loading = Wczytywanie…


app-logo-alt-3 =
    .alt = Logo „m” { -brand-mozilla(case: "gen") }
