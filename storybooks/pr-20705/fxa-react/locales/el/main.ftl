



-brand-mozilla = Mozilla
-brand-firefox = Firefox
-product-firefox-accounts =
    { $case ->
        [gen]
            { $capitalization ->
                [lower] λογαριασμών Firefox
               *[upper] Λογαριασμών Firefox
            }
        [acc]
            { $capitalization ->
                [lower] λογαριασμούς Firefox
               *[upper] Λογαριασμούς Firefox
            }
       *[nom]
            { $capitalization ->
                [lower] λογαριασμοί Firefox
               *[upper] Λογαριασμοί Firefox
            }
    }
-product-mozilla-account =
    { $case ->
        [gen]
            { $capitalization ->
                [lower] λογαριασμού Mozilla
               *[upper] Λογαριασμού Mozilla
            }
        [acc]
            { $capitalization ->
                [lower] λογαριασμό Mozilla
               *[upper] Λογαριασμό Mozilla
            }
       *[nom]
            { $capitalization ->
                [lower] λογαριασμός Mozilla
               *[upper] Λογαριασμός Mozilla
            }
    }
-product-mozilla-accounts =
    { $case ->
        [gen]
            { $capitalization ->
                [lower] λογαριασμών Mozilla
               *[upper] Λογαριασμών Mozilla
            }
        [acc]
            { $capitalization ->
                [lower] λογαριασμούς Mozilla
               *[upper] Λογαριασμούς Mozilla
            }
       *[nom]
            { $capitalization ->
                [lower] λογαριασμοί Mozilla
               *[upper] Λογαριασμοί Mozilla
            }
    }
-product-firefox-account =
    { $case ->
        [gen]
            { $capitalization ->
                [lower] λογαριασμού Firefox
               *[upper] Λογαριασμού Firefox
            }
        [acc]
            { $capitalization ->
                [lower] λογαριασμό Firefox
               *[upper] Λογαριασμό Firefox
            }
       *[nom]
            { $capitalization ->
                [lower] λογαριασμός Firefox
               *[upper] Λογαριασμός Firefox
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

app-general-err-heading = Γενικό σφάλμα εφαρμογής
app-general-err-message = Κάτι πήγε στραβά. Δοκιμάστε ξανά αργότερα.
app-query-parameter-err-heading = Εσφαλμένο αίτημα: Μη έγκυρες παράμετροι ερωτήματος


app-footer-mozilla-logo-label = Λογότυπο { -brand-mozilla }
app-footer-privacy-notice = Σημείωση απορρήτου ιστοτόπου
app-footer-terms-of-service = Όροι υπηρεσίας


app-default-title-2 = { -product-mozilla-accounts(case: "nom", capitalization: "upper") }
app-page-title-2 = { $title } | { -product-mozilla-accounts(case: "nom", capitalization: "upper") }


link-sr-new-window = Ανοίγει σε νέο παράθυρο


app-loading-spinner-aria-label-loading = Φόρτωση…


app-logo-alt-3 =
    .alt = Λογότυπο «m» της { -brand-mozilla }
