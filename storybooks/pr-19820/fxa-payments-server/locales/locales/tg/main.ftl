



-brand-mozilla = Mozilla
-brand-firefox = Firefox
-product-firefox-accounts = Ҳисобҳои «Firefox»
-product-mozilla-account = Ҳисоби «Mozilla»
-product-mozilla-accounts =
    { $capitalization ->
        [uppercase] Ҳисобҳои «Mozilla»
       *[lowercase] Ҳисобҳои «Mozilla»
    }
-product-firefox-account = Ҳисоби «Firefox»
-product-mozilla-vpn = Mozilla VPN
-product-mozilla-vpn-short = VPN
-product-mozilla-hubs = Маҳфилҳои «Mozilla»
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
-brand-mastercard = MasterCard
-brand-unionpay = UnionPay
-brand-visa = Visa
-app-store = App Store
-google-play = Google Play

app-general-err-heading = Хатои умумии барнома
app-general-err-message = Чизе нодуруст иҷро шуд. Лутфан, баъдтар аз нав кӯшиш кунед.
app-query-parameter-err-heading = Дархости нодуруст: Хусусиятҳои дархост нодуруст мебошанд


app-footer-mozilla-logo-label = Тамғаи «{ -brand-mozilla }»
app-footer-privacy-notice = Огоҳномаи махфияти сомона
app-footer-terms-of-service = Шартҳои хизматрасонӣ


app-default-title-2 = { -product-mozilla-accounts }
app-page-title-2 = { $title } | { -product-mozilla-accounts }


link-sr-new-window = Дар равзанаи нав кушода мешавад


app-loading-spinner-aria-label-loading = Бор шуда истодааст…


app-logo-alt-3 =
    .alt = Тамғаи «m - { -brand-mozilla }»



settings-home = Саҳифаи асосии ҳисоб
settings-project-header-title = { -product-mozilla-account }


coupon-promo-code-applied = Рамзи таблиғотӣ татбиқ карда шуд
coupon-submit = Татбиқ кардан
coupon-remove = Тоза кардан
coupon-error = Рамзе, ки шумо ворид кардед, нодуруст аст ё аз муҳлаташ гузашт.
coupon-error-generic = Ҳангоми коркарди рамз хато ба миён омад. Лутфан, аз нав кӯшиш кунед.
coupon-error-expired = Рамзе, ки шумо ворид кардед, аз муҳлаташ гузашт.
coupon-error-limit-reached = Рамзе, ки шумо ворид кардед, аз меъёраш зиёд истифода шуд.
coupon-error-invalid = Рамзе, ки шумо ворид кардед, нодуруст аст.
coupon-enter-code =
    .placeholder = Рамзро ворид кунед


default-input-error = Ин майдон ҳатмӣ аст.
input-error-is-required = { $label } ҳатмӣ аст


brand-name-mozilla-logo = Тамғаи «{ -brand-mozilla }»


new-user-sign-in-link-2 = Аллакай «{ -product-mozilla-account }» доред? <a>Ворид шавед</a>
new-user-enter-email =
    .label = Почтаи электронии худро ворид кунед
new-user-confirm-email =
    .label = Почтаи электронии худро тасдиқ кунед
new-user-subscribe-product-updates-mozilla = Ман мехоҳам, ки аз «{ -brand-mozilla }» дар бораи маҳсулот хабарҳо ва навигариҳоро қабул кунам
new-user-subscribe-product-updates-snp = Ман мехоҳам, ки аз «{ -brand-mozilla }» дар бораи амният ва махфият хабарҳо ва навигариҳоро қабул кунам
new-user-subscribe-product-updates-hubs = Ман мехоҳам, ки аз «{ -product-mozilla-hubs }» ва «{ -brand-mozilla }» дар бораи маҳсулот хабарҳо ва навигариҳоро қабул кунам
new-user-subscribe-product-updates-mdnplus = Ман мехоҳам, ки аз «{ -product-mdn-plus }» ва «{ -brand-mozilla }» дар бораи маҳсулот хабарҳо ва навигариҳоро қабул кунам
new-user-email-validate = Нишонии почтаи электронӣ эътибор надорад
new-user-email-validate-confirm = Нишониҳои почтаи электронӣ мувофиқат намекунанд
new-user-already-has-account-sign-in = Шумо аллакай ҳисоб доред. <a>Ворид шавед</a>


payment-confirmation-thanks-heading = Ташаккур!
payment-confirmation-thanks-heading-account-exists = Ташаккур, акнун почтаи электронии худро тафтиш кунед!
payment-confirmation-order-heading = Тафсилоти фармоиш
payment-confirmation-invoice-number = Санади дархости пардохт №{ $invoiceNumber }
payment-confirmation-invoice-date = { $invoiceDate }
payment-confirmation-details-heading-2 = Маълумоти пардохт
payment-confirmation-amount = { $amount } барои ҳар { $interval }
payment-confirmation-amount-day =
    { $intervalCount ->
        [one] { $amount } барои ҳар рӯз
       *[other] { $amount } барои ҳар { $intervalCount } рӯз
    }
payment-confirmation-amount-week =
    { $intervalCount ->
        [one] { $amount } барои ҳар ҳафта
       *[other] { $amount } барои ҳар { $intervalCount } ҳафта
    }
payment-confirmation-amount-month =
    { $intervalCount ->
        [one] { $amount } барои ҳар моҳ
       *[other] { $amount } барои ҳар { $intervalCount } моҳ
    }
payment-confirmation-amount-year =
    { $intervalCount ->
        [one] { $amount } барои ҳар сол
       *[other] { $amount } барои ҳар { $intervalCount } сол
    }
payment-confirmation-download-button = Идома додани боргирӣ




payment-error-retry-button = Аз нав кӯшиш кардан
payment-error-manage-subscription-button = Идоракунии обунаи ман


iap-upgrade-get-help-button = Гирифтани кумак


payment-name =
    .placeholder = Номи пурра
    .label = Номе, ки дар корти шумо чоп шудааст
payment-cc =
    .label = Корти шумо
payment-cancel-btn = Бекор кардан
payment-update-btn = Навсозӣ кардан
payment-pay-btn = Ҳозир пардохт кунед
payment-pay-with-paypal-btn-2 = Бо «{ -brand-paypal }» пардохт кунед
payment-validate-name-error = Лутфан, номи худро ворид намоед


payment-legal-link-paypal-3 = <paypalPrivacyLink>Сиёсати махфияти «{ -brand-paypal }»</paypalPrivacyLink>
payment-legal-link-stripe-3 = <stripePrivacyLink>Сиёсати махфияти «{ -brand-name-stripe }»</stripePrivacyLink>


payment-method-header = Тарзи пардохти худро интихоб кунед
payment-method-header-second-step = 2. { payment-method-header }
payment-method-first-approve = Аввал шумо бояд обунаи худро тасдиқ кунед




payment-confirmation-cc-card-ending-in = Корте, ки бо { $last4 } анҷом меёбад


pay-with-heading-paypal-2 = Бо «{ -brand-paypal }» пардохт кунед


plan-details-header = Тафсилоти маҳсул
plan-details-list-price = Нархнома
plan-details-show-button = Намоиш додани тафсилот
plan-details-hide-button = Пинҳон кардани тафсилот
plan-details-total-label = Ҳамагӣ
plan-details-tax = Андозҳо ва ҳаққи хизматрасонӣ


product-no-such-plan = Барои ин маҳсул чунин нақша вуҷуд надорад.


price-details-no-tax = { $priceAmount }
price-details-tax = { $priceAmount } + { $taxAmount } андоз
price-details-no-tax-day =
    { $intervalCount ->
        [one] { $priceAmount } барои ҳар рӯз
       *[other] { $priceAmount } барои ҳар { $intervalCount } рӯз
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } барои ҳар рӯз
           *[other] { $priceAmount } барои ҳар { $intervalCount } рӯз
        }
price-details-no-tax-week =
    { $intervalCount ->
        [one] { $priceAmount } барои ҳар ҳафта
       *[other] { $priceAmount } барои ҳар { $intervalCount } ҳафта
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } барои ҳар ҳафта
           *[other] { $priceAmount } барои ҳар { $intervalCount } ҳафта
        }
price-details-no-tax-month =
    { $intervalCount ->
        [one] { $priceAmount } барои ҳар моҳ
       *[other] { $priceAmount } барои ҳар { $intervalCount } моҳ
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } барои ҳар моҳ
           *[other] { $priceAmount } барои ҳар { $intervalCount } моҳ
        }
price-details-no-tax-year =
    { $intervalCount ->
        [one] { $priceAmount } барои ҳар сол
       *[other] { $priceAmount } барои ҳар { $intervalCount } сол
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } барои ҳар сол
           *[other] { $priceAmount } барои ҳар { $intervalCount } сол
        }
price-details-tax-day =
    { $intervalCount ->
        [one] { $priceAmount } + { $taxAmount } андоз барои ҳар як рӯз
       *[other] { $priceAmount } + { $taxAmount } андоз барои ҳар { $intervalCount } рӯз
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + { $taxAmount } андоз барои ҳар як рӯз
           *[other] { $priceAmount } + { $taxAmount } андоз барои ҳар { $intervalCount } рӯз
        }
price-details-tax-week =
    { $intervalCount ->
        [one] { $priceAmount } + { $taxAmount } андоз барои ҳар як ҳафта
       *[other] { $priceAmount } + { $taxAmount } андоз барои ҳар { $intervalCount } ҳафта
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + { $taxAmount } андоз барои ҳар як ҳафта
           *[other] { $priceAmount } + { $taxAmount } андоз барои ҳар { $intervalCount } ҳафта
        }
price-details-tax-month =
    { $intervalCount ->
        [one] { $priceAmount } + { $taxAmount } андоз барои ҳар як моҳ
       *[other] { $priceAmount } + { $taxAmount } андоз барои ҳар { $intervalCount } моҳ
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + { $taxAmount } андоз барои ҳар як моҳ
           *[other] { $priceAmount } + { $taxAmount } андоз барои ҳар { $intervalCount } моҳ
        }
price-details-tax-year =
    { $intervalCount ->
        [one] { $priceAmount } + { $taxAmount } андоз барои ҳар як сол
       *[other] { $priceAmount } + { $taxAmount } андоз барои ҳар { $intervalCount } сол
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + { $taxAmount } андоз барои ҳар як сол
           *[other] { $priceAmount } + { $taxAmount } андоз барои ҳар { $intervalCount } сол
        }


subscription-create-title = Обунаи худро танзим кунед
subscription-success-title = Тасдиқи обуна
subscription-processing-title = Дар ҳоли тасдиқи обуна…
subscription-error-title = Хатои тасдиқи обуна…
subscription-noplanchange-title = Ин тағйироти нақшаи обуна дастгирӣ намешавад
subscription-iapsubscribed-title = Аллакай обуна шудааст
sub-guarantee = Кафолати 30-рӯза барои бозпардохти маблағи шумо


subplat-mozilla-accounts-legal-heading = { -product-mozilla-accounts(capitalization: "uppercase") }
terms = Шартҳои хизматрасонӣ
privacy = Огоҳномаи махфият
terms-download = Шартҳои боргирӣ


document =
    .title = Ҳисобҳои «Firefox»
close-aria =
    .aria-label = Пӯшидани равзанаи зоҳирӣ
settings-subscriptions-title = Обунаҳо
coupon-promo-code = Рамзи таблиғотӣ


plan-price-interval-day =
    { $intervalCount ->
        [one] { $amount } барои ҳар рӯз
       *[other] { $amount } барои ҳар { $intervalCount } рӯз
    }
    .title =
        { $intervalCount ->
            [one] { $amount } барои ҳар рӯз
           *[other] { $amount } барои ҳар { $intervalCount } рӯз
        }
plan-price-interval-week =
    { $intervalCount ->
        [one] { $amount } барои ҳар ҳафта
       *[other] { $amount } барои ҳар { $intervalCount } ҳафта
    }
    .title =
        { $intervalCount ->
            [one] { $amount } барои ҳар ҳафта
           *[other] { $amount } барои ҳар { $intervalCount } ҳафта
        }
plan-price-interval-month =
    { $intervalCount ->
        [one] { $amount } барои ҳар моҳ
       *[other] { $amount } барои ҳар { $intervalCount } моҳ
    }
    .title =
        { $intervalCount ->
            [one] { $amount } барои ҳар моҳ
           *[other] { $amount } барои ҳар { $intervalCount } моҳ
        }
plan-price-interval-year =
    { $intervalCount ->
        [one] { $amount } барои ҳар сол
       *[other] { $amount } барои ҳар { $intervalCount } сол
    }
    .title =
        { $intervalCount ->
            [one] { $amount } барои ҳар сол
           *[other] { $amount } барои ҳар { $intervalCount } сол
        }


general-error-heading = Хатои умумии барнома
basic-error-message = Чизе нодуруст иҷро шуд. Лутфан, баъдтар аз нав кӯшиш кунед.
expired-card-error = Чунин ба назар мерасад, ки муҳлати эътибории корти бонкии шумо ба охир расидааст. Корти дигареро кӯшиш кунед.
insufficient-funds-error = Чунин ба назар мерасад, ки корти бонкии шумо маблағи кофӣ надорад. Корти дигареро кӯшиш кунед.
coupon-expired = Чунин ба назар мерасад, ки муҳлати рамзи таблиғотӣ ба анҷом расид.
product-plan-error =
    .title = Мушкилии боркунии нақшаҳо
product-profile-error =
    .title = Мушкилии боркунии профил
product-customer-error =
    .title = Мушкилии боркунии муштарӣ
product-plan-not-found = Нақша ёфт нашуд
product-location-unsupported-error = Ҷойгиршавӣ дастгирӣ намешавад




new-user-step-1-2 = 1. «{ -product-mozilla-account }»-ро эҷод кунед
new-user-card-title = Маълумоти корти худро ворид кунед
new-user-submit = Ҳозир обуна шавед


sub-update-payment-title = Маълумоти пардохт


pay-with-heading-card-only = Бо корт пардохт кунед
product-invoice-preview-error-title = Мушкилии боркунии пешнамоиши санади дархости пардохт
product-invoice-preview-error-text = Пешнамоиши санади дархости пардохт бор карда нашуд


subscription-iaperrorupgrade-title = Айни ҳол мо ҳисоби шуморо такмил дода наметавонем


brand-name-google-play-2 = Дукони «{ -google-play }»
brand-name-apple-app-store-2 = { -app-store }


product-plan-change-heading = Тағйироти худро аз назар гузаронед
sub-change-failed = Ивази нақша иҷро нашуд
sub-change-submit = Тағйиротро тасдиқ кунед
sub-update-current-plan-label = Нақшаи ҷорӣ
sub-update-new-plan-label = Нақшаи нав


sub-update-new-plan-daily = { $productName } (Барои ҳар рӯз)
sub-update-new-plan-weekly = { $productName } (Барои ҳар ҳафта)
sub-update-new-plan-monthly = { $productName } (Барои ҳар моҳ)
sub-update-new-plan-yearly = { $productName } (Барои ҳар сол)


sub-item-cancel-sub = Бекор кардани обуна




sub-route-idx-contact = Дастаи дастгирии корбарон


sub-invoice-error =
    .title = Мушкилии боркунии санадҳои дархости пардохт
sub-invoice-previews-error-title = Мушкилии боркунии пешнамоиши санадҳои дархости пардохт
sub-invoice-previews-error-text = Пешнамоиши санадҳои дархости пардохт бор карда нашуд


pay-update-change-btn = Тағйир додан
pay-update-manage-btn = Идора кардан


sub-expires-on = Анҷоми муҳлат дар { $date }




pay-update-card-exp = Муҳлаташ дар { $expirationDate } ба анҷом мерасад
sub-route-idx-updating = Дар ҳоли навсозии маълумоти санади ҳисоббарорӣ…
sub-route-payment-modal-heading = Маълумоти санади ҳисоббарорӣ беэътибор аст


sub-item-no-such-plan = Барои ин обуна чунин нақша вуҷуд надорад.


reactivate-confirm-button = Аз нав обуна шавед


reactivate-success-copy = Ташаккур! Шумо ҳамаи қадамҳоро иҷро кардед.
reactivate-success-button = Пӯшидан


sub-iap-item-google-purchase-2 = { -brand-google }: Харид дар дохили барнома
sub-iap-item-apple-purchase-2 = { -brand-apple }: Харид дар дохили барнома
sub-iap-item-manage-button = Идора кардан
