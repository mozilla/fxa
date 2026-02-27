



-brand-mozilla =
    { $case ->
        [accusative] Mozillát
        [instrumental] Mozillával
       *[nominative] Mozilla
    }
-brand-firefox =
    { $case ->
        [accusative] Firefoxot
        [dative] Firefoxnak
        [genitive] Firefoxé
        [instrumental] Firefoxszal
        [causal] Firefoxért
        [translative] Firefoxszá
        [terminative] Firefoxig
        [illative] Firefoxba
        [adessive] Firefoxnál
        [ablative] Firefoxtól
        [elative] Firefoxból
        [sublative] Firefoxra
        [inessive] Firefoxban
        [superessive] Firefoxon
        [delative] Firefoxról
       *[nominative] Firefox
    }
-product-firefox-accounts = Firefox-fiókok
-product-mozilla-account = Mozilla-fiók
-product-mozilla-accounts = Mozilla-fiókok
-product-firefox-account = Firefox-fiók
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
-app-store =
    { $case ->
        [accusative] App Store-t
        [inessive] App Store-ban
        [instrumental] App Store-ral
        [elative] App Store-ból
       *[nominative] App Store
    }
-google-play =
    { $case ->
        [accusative] Google Playt
        [inessive] Google Playben
        [instrumental] Google Playjel
        [elative] Google Playből
       *[nominative] Google Play
    }

app-general-err-heading = Általános alkalmazáshiba
app-general-err-message = Hiba történt, próbálja újra később.
app-query-parameter-err-heading = Hibás kérés: érvénytelen lekérdezési paraméterek


app-footer-mozilla-logo-label = { -brand-mozilla } logó
app-footer-privacy-notice = Webhely adatvédelmi nyilatkozata
app-footer-terms-of-service = A szolgáltatás feltételei


app-default-title-2 = { -product-mozilla-accounts }
app-page-title-2 = { $title } | { -product-mozilla-accounts }


link-sr-new-window = Új ablakban nyílik meg


app-loading-spinner-aria-label-loading = Betöltés…


app-logo-alt-3 =
    .alt = { -brand-mozilla } m logó
