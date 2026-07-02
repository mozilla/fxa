



-brand-mozilla = Mozilla
-brand-firefox = Firefox
-product-firefox-accounts =
    { $case ->
        [nominative_uppercase] Аккаунты Firefox
        [genitive] аккаунтов Firefox
        [dative] аккаунтам Firefox
        [accusative] аккаунты Firefox
        [instrumental] аккаунтами Firefox
        [prepositional] аккаунтах Firefox
       *[nominative] аккаунты Firefox
    }
-product-mozilla-account =
    { $case ->
        [nominative_uppercase] Аккаунт Mozilla
        [genitive] аккаунта Mozilla
        [dative] аккаунту Mozilla
        [accusative] аккаунт Mozilla
        [instrumental] аккаунтом Mozilla
        [prepositional] аккаунте Mozilla
       *[nominative] аккаунт Mozilla
    }
-product-mozilla-accounts =
    { $case ->
        [nominative_uppercase] Аккаунты Mozilla
        [genitive] аккаунтов Mozilla
        [dative] аккаунтам Mozilla
        [accusative] аккаунты Mozilla
        [instrumental] аккаунтами Mozilla
        [prepositional] аккаунтах Mozilla
       *[nominative] аккаунты Mozilla
    }
-product-firefox-account =
    { $case ->
        [nominative_uppercase] Аккаунт Firefox
        [genitive] аккаунта Firefox
        [dative] аккаунту Firefox
        [accusative] аккаунт Firefox
        [instrumental] аккаунтом Firefox
        [prepositional] аккаунте Firefox
       *[nominative] аккаунт Firefox
    }
-product-mozilla-vpn = Mozilla VPN
-product-mozilla-vpn-short = VPN
-product-mozilla-hubs = Клубы Mozilla
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

app-general-err-heading = Общая ошибка приложения
app-general-err-message = Что-то пошло не так. Пожалуйста, попробуйте позже.
app-query-parameter-err-heading = Неверный запрос: недопустимые параметры


app-footer-mozilla-logo-label = Логотип { -brand-mozilla }
app-footer-privacy-notice = Уведомление о конфиденциальности веб-сайта
app-footer-terms-of-service = Условия использования


app-default-title-2 = { -product-mozilla-accounts(case: "nominative_uppercase") }
app-page-title-2 = { $title } | { -product-mozilla-accounts(case: "nominative_uppercase") }


link-sr-new-window = Открывается в новом окне


app-loading-spinner-aria-label-loading = Загрузка…


app-logo-alt-3 =
    .alt = Логотип { -brand-mozilla }
