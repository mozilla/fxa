



-brand-mozilla = Mozilla
-brand-firefox = Firefox
-product-firefox-accounts =
    { $case ->
        [gen]
            { $capitalization ->
                [lower] облікових записів Firefox
               *[upper] Облікових записів Firefox
            }
        [dat]
            { $capitalization ->
                [lower] обліковим записам Firefox
               *[upper] Обліковим записам Firefox
            }
        [acc]
            { $capitalization ->
                [lower] облікові записи Firefox
               *[upper] Облікові записи Firefox
            }
        [abl]
            { $capitalization ->
                [lower] обліковими записами Firefox
               *[upper] Обліковими записами Firefox
            }
        [loc]
            { $capitalization ->
                [lower] облікових записах Firefox
               *[upper] Облікових записах Firefox
            }
       *[nom]
            { $capitalization ->
                [lower] облікові записи Firefox
               *[upper] Облікові записи Firefox
            }
    }
-product-mozilla-account =
    { $case ->
        [gen]
            { $capitalization ->
                [upper] Облікового запису Mozilla
               *[lower] облікового запису Mozilla
            }
        [dat]
            { $capitalization ->
                [upper] Обліковому запису Mozilla
               *[lower] обліковому запису Mozilla
            }
        [acc]
            { $capitalization ->
                [upper] Обліковий запис Mozilla
               *[lower] обліковий запис Mozilla
            }
        [abl]
            { $capitalization ->
                [upper] Обліковим записом Mozilla
               *[lower] обліковим записом Mozilla
            }
        [loc]
            { $capitalization ->
                [upper] Обліковому записі Mozilla
               *[lower] обліковому записі Mozilla
            }
       *[nom]
            { $capitalization ->
                [upper] Обліковий запис Mozilla
               *[lower] обліковий запис Mozilla
            }
    }
-product-mozilla-accounts =
    { $case ->
        [gen]
            { $capitalization ->
                [upper] Облікових записів Mozilla
               *[lower] облікових записів Mozilla
            }
        [dat]
            { $capitalization ->
                [upper] Обліковим записам Mozilla
               *[lower] обліковим записам Mozilla
            }
        [acc]
            { $capitalization ->
                [upper] Облікові записи Mozilla
               *[lower] облікові записи Mozilla
            }
        [abl]
            { $capitalization ->
                [upper] Обліковими записами Mozilla
               *[lower] обліковими записами Mozilla
            }
        [loc]
            { $capitalization ->
                [upper] Облікових записах Mozilla
               *[lower] облікових записах Mozilla
            }
       *[nom]
            { $capitalization ->
                [upper] Облікові записи Mozilla
               *[lower] облікові записи Mozilla
            }
    }
-product-firefox-account =
    { $case ->
        [gen]
            { $capitalization ->
                [lower] облікового запису Firefox
               *[upper] Облікового запису Firefox
            }
        [dat]
            { $capitalization ->
                [lower] обліковому запису Firefox
               *[upper] Обліковому запису Firefox
            }
        [acc]
            { $capitalization ->
                [lower] обліковий запис Firefox
               *[upper] Обліковий запис Firefox
            }
        [abl]
            { $capitalization ->
                [lower] обліковим записом Firefox
               *[upper] Обліковим записом Firefox
            }
        [loc]
            { $capitalization ->
                [lower] обліковому записі Firefox
               *[upper] Обліковому записі Firefox
            }
       *[nom]
            { $capitalization ->
                [lower] обліковий запис Firefox
               *[upper] Обліковий запис Firefox
            }
    }
-product-mozilla-vpn = Mozilla VPN
-product-mozilla-hubs = Mozilla Hubs
-product-mdn = MDN
-product-mdn-plus = MDN Plus
-product-firefox-cloud = Firefox Cloud
-product-mozilla-monitor = Mozilla Monitor
-product-firefox-relay = Firefox Relay
-brand-apple = Apple
-brand-google = Google
-brand-paypal = PayPal
-brand-name-stripe = Stripe
-app-store = App Store
-google-play = Google Play

app-general-err-heading = Загальна помилка програми
app-general-err-message = Щось пішло не так. Будь ласка, спробуйте знову пізніше.
app-query-parameter-err-heading = Неправильний запит: недійсні параметри


app-footer-mozilla-logo-label = Логотип { -brand-mozilla }
app-footer-privacy-notice = Положення про приватність вебсайту
app-footer-terms-of-service = Умови надання послуг


app-default-title-2 = { -product-mozilla-accounts(capitalization: "upper") }
app-page-title-2 = { $title } | { -product-mozilla-accounts(capitalization: "upper") }


link-sr-new-window = Відкриється в новому вікні


app-loading-spinner-aria-label-loading = Завантаження…


app-logo-alt-3 =
    .alt = Логотип m { -brand-mozilla }



settings-home = Головна сторінка облікового запису
settings-project-header-title = { -product-mozilla-account(capitalization: "upper") }


coupon-promo-code-applied = Промокод застосовано
coupon-submit = Застосувати
coupon-remove = Вилучити
coupon-error = Введений код недійсний або прострочений.
coupon-error-generic = Під час обробки коду сталася помилка. Спробуйте ще раз.
coupon-error-expired = Термін дії введеного коду закінчився.
coupon-error-limit-reached = Введений вами код вичерпав свій ліміт.
coupon-error-invalid = Введений вами код недійсний.
coupon-enter-code =
    .placeholder = Ввести код


default-input-error = Це поле обов'язкове
input-error-is-required = { $label } обов'язково


brand-name-mozilla-logo = Логотип { -brand-mozilla }


new-user-sign-in-link-2 = Вже маєте { -product-mozilla-account }? <a>Увійти</a>
new-user-enter-email =
    .label = Введіть адресу е-пошти
new-user-confirm-email =
    .label = Підтвердьте електронну адресу
new-user-subscribe-product-updates-mozilla = Я хочу отримувати новини та оновлення продуктів від { -brand-mozilla }
new-user-subscribe-product-updates-snp = Я хочу отримувати новини та оновлення щодо безпеки та приватності від { -brand-mozilla }
new-user-subscribe-product-updates-hubs = Я хочу отримувати новини про продукти й оновлення від { -product-mozilla-hubs } і { -brand-mozilla }
new-user-subscribe-product-updates-mdnplus = Я хочу отримувати новини про продукти й оновлення від { -product-mdn-plus } і { -brand-mozilla }
new-user-subscribe-product-assurance = Ми застосовуємо вашу електронну адресу лише для створення вашого облікового запису. Ми ніколи не продаватимемо її стороннім.
new-user-email-validate = Ваша адреса е-пошти недійсна
new-user-email-validate-confirm = Адреси е-пошти відрізняються
new-user-already-has-account-sign-in = У вас вже є обліковий запис. <a>Увійти</a>
new-user-invalid-email-domain = Помилка введення адреси електронної пошти? { $domain } не пропонує електронну пошту.


payment-confirmation-thanks-heading = Дякуємо!
payment-confirmation-thanks-heading-account-exists = Дякуємо! Тепер перевірте свою електронну пошту!
payment-confirmation-thanks-subheading = На адресу { $email } надіслано електронний лист із підтвердженням та настановами про початок роботи з { $product_name }.
payment-confirmation-thanks-subheading-account-exists = Ви отримаєте лист на адресу { $email } з інструкціями для налаштування свого облікового запису, а також подробицями платежу.
payment-confirmation-order-heading = Подробиці замовлення
payment-confirmation-invoice-number = Рахунок-фактура #{ $invoiceNumber }
payment-confirmation-invoice-date = { $invoiceDate }
payment-confirmation-details-heading-2 = Платіжні дані
payment-confirmation-amount = { $amount } на { $interval }
payment-confirmation-amount-day =
    { $intervalCount ->
        [one] { $amount } щодня
        [few] { $amount } кожні { $intervalCount } дні
       *[many] { $amount } кожні { $intervalCount } днів
    }
payment-confirmation-amount-week =
    { $intervalCount ->
        [one] { $amount } щотижня
        [few] { $amount } кожні { $intervalCount } тижні
       *[many] { $amount } кожні { $intervalCount } тижнів
    }
payment-confirmation-amount-month =
    { $intervalCount ->
        [one] { $amount } щомісяця
        [few] { $amount } кожні { $intervalCount } місяці
       *[many] { $amount } кожні { $intervalCount } місяців
    }
payment-confirmation-amount-year =
    { $intervalCount ->
        [one] { $amount } щороку
        [few] { $amount } кожні { $intervalCount } роки
       *[many] { $amount } кожні { $intervalCount } років
    }
payment-confirmation-download-button = Продовжити завантаження


payment-confirm-with-legal-links-static-3 = Я дозволяю { -brand-mozilla } стягувати зазначену суму з використанням мого способу оплати, відповідно до <termsOfServiceLink>Умов надання послуг</termsOfServiceLink> і <privacyNoticeLink>Положення про приватність</privacyNoticeLink>, доки я не скасую передплату.
payment-confirm-checkbox-error = Необхідно завершити це, перш ніж переходити далі


payment-error-retry-button = Спробувати знову
payment-error-manage-subscription-button = Керувати передплатою


iap-upgrade-already-subscribed-2 = У вас вже є передплата { $productName } через магазин { -brand-google } або { -brand-apple }.
iap-upgrade-no-bundle-support = Наразі не підтримується підвищення рівня для цих передплат, але невдовзі буде така можливість.
iap-upgrade-contact-support = Ви все одно можете отримати цей продукт — зверніться до служби підтримки по допомогу.
iap-upgrade-get-help-button = Отримати допомогу


payment-name =
    .placeholder = Повне ім'я
    .label = Ім'я, зазначене на вашій картці
payment-cc =
    .label = Ваша картка
payment-cancel-btn = Скасувати
payment-update-btn = Оновити
payment-pay-btn = Сплатити зараз
payment-pay-with-paypal-btn-2 = Сплатити через { -brand-paypal }
payment-validate-name-error = Будь ласка, введіть своє ім’я


payment-legal-copy-stripe-and-paypal-3 = { -brand-mozilla } використовує { -brand-name-stripe } і { -brand-paypal } для безпечної обробки платежів.
payment-legal-link-stripe-paypal-2 = <stripePrivacyLink>Політика приватності { -brand-name-stripe }</stripePrivacyLink> &nbsp; <paypalPrivacyLink>Політика приватності { -brand-paypal }</paypalPrivacyLink>.
payment-legal-copy-paypal-2 = { -brand-mozilla } використовує { -brand-paypal } для безпечної обробки платежів.
payment-legal-link-paypal-3 = <paypalPrivacyLink>Політика приватності { -brand-paypal }</paypalPrivacyLink>
payment-legal-copy-stripe-3 = { -brand-mozilla } використовує { -brand-name-stripe } для безпечної обробки платежів.
payment-legal-link-stripe-3 = <stripePrivacyLink>політика приватності { -brand-name-stripe }</stripePrivacyLink>.


payment-method-header = Оберіть спосіб оплати
payment-method-header-second-step = 2. { payment-method-header }
payment-method-first-approve = Спочатку ви маєте підтвердити передплату


payment-processing-message = Зачекайте, поки ми обробимо ваш платіж…


payment-confirmation-cc-card-ending-in = Картка, номер якої закінчується на { $last4 }


pay-with-heading-paypal-2 = Сплатити через { -brand-paypal }


plan-details-header = Докладніше про продукт
plan-details-list-price = Базова ціна
plan-details-show-button = Докладніше
plan-details-hide-button = Сховати подробиці
plan-details-total-label = Всього
plan-details-tax = Податки та збори


product-no-such-plan = Такого тарифного плану для цього продукту не існує.


price-details-no-tax = { $priceAmount }
price-details-tax = { $priceAmount } + податок { $taxAmount }
price-details-no-tax-day =
    { $intervalCount ->
        [one] { $priceAmount } щодня
        [few] { $priceAmount } кожні { $intervalCount } дні
       *[many] { $priceAmount } кожні { $intervalCount } днів
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } щодня
            [few] { $priceAmount } кожні { $intervalCount } дні
           *[many] { $priceAmount } кожні { $intervalCount } днів
        }
price-details-no-tax-week =
    { $intervalCount ->
        [one] { $priceAmount } щотижня
        [few] { $priceAmount } кожні { $intervalCount } тижні
       *[many] { $priceAmount } кожні { $intervalCount } тижнів
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } щотижня
            [few] { $priceAmount } кожні { $intervalCount } тижні
           *[many] { $priceAmount } кожні { $intervalCount } тижнів
        }
price-details-no-tax-month =
    { $intervalCount ->
        [one] { $priceAmount } щомісяця
        [few] { $priceAmount } кожні { $intervalCount } місяці
       *[many] { $priceAmount } кожні { $intervalCount } місяців
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } *щомісяця
            [few] { $priceAmount } кожні { $intervalCount } місяці
           *[many] { $priceAmount } кожні { $intervalCount } місяців
        }
price-details-no-tax-year =
    { $intervalCount ->
        [one] { $priceAmount } щороку
        [few] { $priceAmount } кожні { $intervalCount } роки
       *[many] { $priceAmount } кожні { $intervalCount } років
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } щороку
            [few] { $priceAmount } кожні { $intervalCount } роки
           *[many] { $priceAmount } кожні { $intervalCount } років
        }
price-details-tax-day =
    { $intervalCount ->
        [one] { $priceAmount } + { $taxAmount } податок щодня
        [few] { $priceAmount } + податок { $taxAmount } кожні { $intervalCount } дні
       *[many] { $priceAmount } + податок { $taxAmount } кожні { $intervalCount } днів
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + податок { $taxAmount } щодня
            [few] { $priceAmount } + податок { $taxAmount } кожні { $intervalCount } дні
           *[many] { $priceAmount } + податок { $taxAmount } кожні { $intervalCount } днів
        }
price-details-tax-week =
    { $intervalCount ->
        [one] { $priceAmount } + податок { $taxAmount } щотижня
        [few] { $priceAmount } + податок { $taxAmount } кожні { $intervalCount } тижні
       *[many] { $priceAmount } + податок { $taxAmount } кожні { $intervalCount } тижнів
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + податок { $taxAmount } щотижня
            [few] { $priceAmount } + податок { $taxAmount } кожні { $intervalCount } тижні
           *[many] { $priceAmount } + податок { $taxAmount } кожні { $intervalCount } тижнів
        }
price-details-tax-month =
    { $intervalCount ->
        [one] { $priceAmount } + податок { $taxAmount } щомісяця
        [few] { $priceAmount } + податок { $taxAmount } кожні { $intervalCount } місяці
       *[many] { $priceAmount } + податок { $taxAmount } кожні { $intervalCount } місяців
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + податок { $taxAmount } щомісяця
            [few] { $priceAmount } + податок { $taxAmount } кожні { $intervalCount } місяці
           *[many] { $priceAmount } + податок { $taxAmount } кожні { $intervalCount } місяців
        }
price-details-tax-year =
    { $intervalCount ->
        [one] { $priceAmount } + податок { $taxAmount } щороку
        [few] { $priceAmount } + податок { $taxAmount } кожні { $intervalCount } роки
       *[many] { $priceAmount } + податок { $taxAmount } кожні { $intervalCount } років
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + податок { $taxAmount } щороку
            [few] { $priceAmount } + податок { $taxAmount } кожні { $intervalCount } роки
           *[many] { $priceAmount } + податок { $taxAmount } кожні { $intervalCount } років
        }


subscription-create-title = Налаштуйте передплату
subscription-success-title = Підтвердження передплати
subscription-processing-title = Підтвердження передплати…
subscription-error-title = Помилка підтвердження передплати…
subscription-noplanchange-title = Ця зміна тарифного плану не підтримується
subscription-iapsubscribed-title = Уже передплачено
sub-guarantee = Гарантоване повернення коштів упродовж 30 днів


subplat-mozilla-accounts-legal-heading = { -product-mozilla-accounts(capitalization: "uppercase") }
terms = Умови надання послуг
privacy = Положення про приватність
terms-download = Завантажити умови


document =
    .title = Облікові записи Firefox
close-aria =
    .aria-label = Закрити вікно
settings-subscriptions-title = Передплати
coupon-promo-code = Промокод


plan-price-interval-day =
    { $intervalCount ->
        [one] { $amount } щодня
        [few] { $amount } кожні { $intervalCount } дні
       *[many] { $amount } кожні { $intervalCount } днів
    }
    .title =
        { $intervalCount ->
            [one] { $amount } щодня
            [few] { $amount } кожні { $intervalCount } дні
           *[many] { $amount } кожні { $intervalCount } днів
        }
plan-price-interval-week =
    { $intervalCount ->
        [one] { $amount } щотижня
        [few] { $amount } кожні { $intervalCount } тижні
       *[many] { $amount } кожні { $intervalCount } тижнів
    }
    .title =
        { $intervalCount ->
            [one] { $amount } щотижня
            [few] { $amount } кожні { $intervalCount } тижні
           *[many] { $amount } кожні { $intervalCount } тижнів
        }
plan-price-interval-month =
    { $intervalCount ->
        [one] { $amount } щомісяця
        [few] { $amount } кожні { $intervalCount } місяці
       *[many] { $amount } кожні { $intervalCount } місяців
    }
    .title =
        { $intervalCount ->
            [one] { $amount } щомісяця
            [few] { $amount } кожні { $intervalCount } місяці
           *[many] { $amount } кожні { $intervalCount } місяців
        }
plan-price-interval-year =
    { $intervalCount ->
        [one] { $amount } щороку
        [few] { $amount } кожні { $intervalCount } роки
       *[many] { $amount } кожні { $intervalCount } років
    }
    .title =
        { $intervalCount ->
            [one] { $amount } щороку
            [few] { $amount } кожні { $intervalCount } роки
           *[many] { $amount } кожні { $intervalCount } років
        }


general-error-heading = Загальна помилка програми
basic-error-message = Щось пішло не так. Будь ласка, спробуйте знову пізніше.
payment-error-1 = Гм. Не вдалося перевірити платіж. Спробуйте ще раз або зв’яжіться з емітентом вашої картки.
payment-error-2 = Гм. Не вдалося підтвердити платіж. Зв’яжіться з емітентом вашої картки.
payment-error-3b = Під час обробки вашого платежу сталася неочікувана помилка. Будь ласка, повторіть спробу.
expired-card-error = Схоже, строк дії вашої кредитної картки закінчився. Спробуйте скористатись іншою карткою.
insufficient-funds-error = Схоже, на вашій картці недостатньо коштів. Спробуйте скористатись іншою карткою.
withdrawal-count-limit-exceeded-error = Схоже, що після здійснення платежу буде перевищено кредитний ліміт. Спробуйте скористатись іншою карткою.
charge-exceeds-source-limit = Схоже, що після здійснення платежу буде перевищено ваш денний кредитний ліміт. Спробуйте скористатись іншою карткою або повторіть спробу за 24 години.
instant-payouts-unsupported = Схоже, вашу дебетову картку не налаштовано для миттєвих платежів. Спробуйте скористатись іншою дебетовою чи кредитною карткою.
duplicate-transaction = Гм. Схоже, що ідентичний платіж щойно було здійснено. Перевірте історію своїх платежів.
coupon-expired = Схоже, термін дії промо-коду минув.
card-error = Ваш платіж не вдалося обробити. Підтвердьте дані своєї кредитної картки та повторіть спробу.
country-currency-mismatch = Валюта цієї передплати недійсна для країни, пов’язаної з вашим платежем.
currency-currency-mismatch = Перепрошуємо. Ви не можете перемикатися між валютами.
location-unsupported = Згідно з нашими Умовами надання послуг ваше поточне розташування не підтримується.
no-subscription-change = Перепрошуємо, але ви не можете змінити свій тарифний план.
iap-already-subscribed = Ви вже оформили передплату через { $mobileAppStore }.
fxa-account-signup-error-2 = Системна помилка призвела до збою реєстрації в { $productName }. Платіж за вказаним способом оплати не було проведено. Будь ласка, спробуйте знову.
fxa-post-passwordless-sub-error = Передплату підтверджено, але не вдалося завантажити сторінку підтвердження. Перевірте свою електронну пошту для завершення налаштування облікового запису.
newsletter-signup-error = Ви не підписалися на сповіщення про оновлення продукту. Ви можете спробувати знову зробити це в налаштуваннях облікового запису.
product-plan-error =
    .title = Не вдалося завантажити сторінку з тарифними планами
product-profile-error =
    .title = Не вдалося завантажити сторінку профілю
product-customer-error =
    .title = Не вдалося завантажити сторінку клієнта
product-plan-not-found = Тарифний план не знайдено
product-location-unsupported-error = Розташування не підтримується


coupon-success = Вашу передплату буде автоматично поновлено за базовою ціною.
coupon-success-repeating = Ваш тарифний план буде автоматично поновлено після { $couponDurationDate } за роздрібною ціною.


new-user-step-1-2 = 1. Створіть { -product-mozilla-account }
new-user-card-title = Введіть дані своєї картки
new-user-submit = Передплатити


sub-update-payment-title = Платіжні дані


pay-with-heading-card-only = Сплатити карткою
product-invoice-preview-error-title = Проблема із завантаженням попереднього перегляду рахунка-фактури
product-invoice-preview-error-text = Не вдається завантажити попередній перегляд рахунка-фактури


subscription-iaperrorupgrade-title = Поки що ми не можемо підвищити рівень вашої передплати


brand-name-google-play-2 = Магазин { -google-play }
brand-name-apple-app-store-2 = { -app-store }


product-plan-change-heading = Перегляньте свої зміни
sub-change-failed = Помилка зміни тарифного плану
sub-update-acknowledgment =
    Ваш тарифний план зміниться негайно і сьогодні з вас буде стягнуто пропорційну
    суму за решту циклу передплати. Починаючи з { $startingDate }
    з вас стягуватиметься повна сума.
sub-change-submit = Підтвердити зміни
sub-update-current-plan-label = Поточний тарифний план
sub-update-new-plan-label = Новий тарифний план
sub-update-total-label = Нова сума
sub-update-prorated-upgrade = Пропорційне оновлення


sub-update-new-plan-daily = { $productName } (щодня)
sub-update-new-plan-weekly = { $productName } (щотижня)
sub-update-new-plan-monthly = { $productName } (щомісяця)
sub-update-new-plan-yearly = { $productName } (щороку)
sub-update-prorated-upgrade-credit = Зазначений негативний баланс буде зараховано на ваш обліковий запис у вигляді кредитів, які буде використано для оплати майбутніх рахунків.


sub-item-cancel-sub = Скасувати передплату
sub-item-stay-sub = Залишити передплату чинною


sub-item-cancel-msg =
    Ви більше не зможете користуватися { $name } після
    { $period }, останній день вашого платіжного циклу.
sub-item-cancel-confirm = Скасувати мій доступ до { $name } разом зі збереженими даними { $period }
sub-promo-coupon-applied = Застосовано купон { $promotion_name }: <priceDetails></priceDetails>
subscription-management-account-credit-balance = Цей платіж за передплату призвів до утворення кредитів на балансі вашого облікового запису: <priceDetails></priceDetails>


sub-route-idx-reactivating = Не вдалося поновити передплату
sub-route-idx-cancel-failed = Не вдалося скасувати передплату
sub-route-idx-contact = Звернутися до служби підтримки
sub-route-idx-cancel-msg-title = Нам шкода, що ви йдете
sub-route-idx-cancel-msg =
    Вашу передплату { $name } було скасовано.
          <br />
          Ви все одно матимете доступ до { $name } до { $date }.
sub-route-idx-cancel-aside-2 = Маєте запитання? Відвідайте <a>Підтримку { -brand-mozilla }</a>.


sub-customer-error =
    .title = Не вдалося завантажити сторінку клієнта
sub-invoice-error =
    .title = Проблема із завантаженням рахунків-фактур
sub-billing-update-success = Ваші платіжні дані успішно оновлено
sub-invoice-previews-error-title = Проблема із завантаженням попереднього перегляду рахунків-фактур
sub-invoice-previews-error-text = Не вдається завантажити попередній перегляд рахунків-фактур


pay-update-change-btn = Змінити
pay-update-manage-btn = Керувати


sub-next-bill = Наступна оплата { $date }
sub-expires-on = Чинний до { $date }




pay-update-card-exp = Термін дії закінчується { $expirationDate }
sub-route-idx-updating = Оновлення платіжних даних…
sub-route-payment-modal-heading = Недійсна платіжна інформація
sub-route-payment-modal-message-2 = Схоже, виникла помилка з вашим обліковим записом { -brand-paypal }. Вам необхідно виконати певні кроки для розв'язання проблеми з оплатою.
sub-route-missing-billing-agreement-payment-alert = Недійсні платіжні дані. Виникла помилка з вашим обліковим записом. <div>Керувати</div>
sub-route-funding-source-payment-alert = Недійсні платіжні дані; сталася помилка з вашим обліковим записом. Це попередження зникне невдовзі після успішного оновлення даних. <div>Керувати</div>


sub-item-no-such-plan = Такого тарифного плану для цієї передплати не існує.
invoice-not-found = Наступний рахунок-фактуру не знайдено
sub-item-no-such-subsequent-invoice = Наступний рахунок-фактуру для цієї передплати не знайдено.
sub-invoice-preview-error-title = Попередній перегляд рахунка-фактури не знайдено
sub-invoice-preview-error-text = Не знайдено попередній перегляд рахунка-фактури для цієї передплати


reactivate-confirm-dialog-header = Хочете продовжувати використовувати { $name }?
reactivate-confirm-copy =
    Ваш доступ до { $name } буде продовжено, а ваші платіжний цикл та
    оплата залишаться незмінними. Наступну оплату розміром
    { $amount } буде здійснено { $endDate } з картки, останні цифри номеру якої { $last }.
reactivate-confirm-without-payment-method-copy =
    Ваш доступ до { $name } буде продовжено, а ваші платіжний цикл та
    оплата залишаться незмінними. Наступну оплату розміром
    { $amount } буде здійснено { $endDate }.
reactivate-confirm-button = Поновити передплату


reactivate-panel-copy = Ви втратите доступ до { $name } <strong>{ $date }</strong>.
reactivate-success-copy = Дякуємо! Ви все налаштували.
reactivate-success-button = Закрити


sub-iap-item-google-purchase-2 = { -brand-google }: покупка в програмі
sub-iap-item-apple-purchase-2 = { -brand-apple }: покупка в програмі
sub-iap-item-manage-button = Керувати
