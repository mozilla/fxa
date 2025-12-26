



-brand-mozilla = Mozilla
-brand-firefox = Firefox
-product-firefox-accounts = Firefox налози
-product-mozilla-account = Mozilla налог
-product-mozilla-accounts =
    { $capitalization ->
        [uppercase] Mozilla налози
       *[lowercase] Mozilla налози
    }
-product-firefox-account = Firefox налог
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
-brand-google = Google
-brand-paypal = PayPal
-brand-name-stripe = Stripe
-brand-amex = American Express
-brand-diners = Diners Club
-brand-discover = Discover
-brand-jcb = JCB
-brand-mastercard = Mastercard
-brand-unionpay = UnionPay
-brand-visa = Visa
-app-store = App Store
-google-play = Google Play

app-general-err-heading = Општа грешка апликације
app-general-err-message = Нешто није у реду. Покушајте поново касније.
app-query-parameter-err-heading = Лош захтев: неважећи параметри претраге


app-footer-mozilla-logo-label = { -brand-mozilla } логотип
app-footer-privacy-notice = Обавештење о приватности странице
app-footer-terms-of-service = Услови коришћења


app-default-title-2 = { -product-mozilla-accounts }
app-page-title-2 = { $title } | { -product-mozilla-accounts }


link-sr-new-window = Отвара у новом прозору


app-loading-spinner-aria-label-loading = Учитавање…


app-logo-alt-3 =
    .alt = { -brand-mozilla } m лототип



settings-home = Почетна страница налога


coupon-promo-code-applied = Промотивни код је примењен
coupon-submit = Примени
coupon-remove = Уклони
coupon-error = Код који сте унели је неважећи или истекао.
coupon-error-generic = Дошло је до грешке при обради код. Покушајте поново касније.
coupon-error-expired = Код који сте унели је истекао.
coupon-error-limit-reached = Код који сте унели је достигао ограничење.
coupon-error-invalid = Код који сте унели је неважећи.
coupon-enter-code =
    .placeholder = Унеси код


default-input-error = Ово поље је обавезно
input-error-is-required = { $label } је обавезно




new-user-enter-email =
    .label = Унесите вашу е-адресу
new-user-confirm-email =
    .label = Потврди адресу е-поште
new-user-subscribe-product-assurance = Користимо само вашу е-пошту да направимо ваш налог. Никада је нећемо продати трећој страни.
new-user-email-validate = Е-пошта није важећа
new-user-email-validate-confirm = Е-поште се не подударају
new-user-already-has-account-sign-in = Већ имате налог. <a>Пријавите се</a>
new-user-invalid-email-domain = Нетачно унета адреса? { $domain } не нуди е-поште.


payment-confirmation-thanks-heading = Хвала!
payment-confirmation-thanks-heading-account-exists = Хвала, сада проверите вашу е-пошту!
payment-confirmation-thanks-subheading = Е-порука са потврдом је послана на { $email } са детаљима о томе како да почнете да користите { $product_name }.
payment-confirmation-thanks-subheading-account-exists = Добићете е-поруку на { $email } са упутствима за подешавање налога и детаљима о плаћању.
payment-confirmation-order-heading = Детаљи поруџбине
payment-confirmation-invoice-number = Рачун #{ $invoiceNumber }
payment-confirmation-invoice-date = { $invoiceDate }
payment-confirmation-details-heading-2 = Подаци о плаћању
payment-confirmation-amount = { $amount } по { $interval }
payment-confirmation-amount-day =
    { $intervalCount ->
        [one] { $amount } дневно
        [few] { $amount } свака { $intervalCount } дана
       *[other] { $amount } сваких { $intervalCount } дана
    }
payment-confirmation-amount-week =
    { $intervalCount ->
        [one] { $amount } недељно
        [few] { $amount } сваке { $intervalCount } недеље
       *[other] { $amount } сваких { $intervalCount } недеља
    }
payment-confirmation-amount-month =
    { $intervalCount ->
        [one] { $amount } месечно
        [few] { $amount } свака { $intervalCount } месеца
       *[other] { $amount } сваких { $intervalCount } месеци
    }
payment-confirmation-amount-year =
    { $intervalCount ->
        [one] { $amount } годишње
        [few] { $amount } сваке { $intervalCount } године
       *[other] { $amount } сваких { $intervalCount } година
    }
payment-confirmation-download-button = Идите на преузимање


payment-confirm-checkbox-error = Прихватите ово да бисте наставили


payment-error-retry-button = Покушај поново
payment-error-manage-subscription-button = Управљај претплатом


iap-upgrade-no-bundle-support = Сада нисмо у могућности да надоградимо на ове претплате, али радимо на томе.
iap-upgrade-contact-support = Овај производ вам је и даље доступан — контактирајте подршку да вам помогне.
iap-upgrade-get-help-button = Потражите помоћ


payment-name =
    .placeholder = Пуно име
    .label = Приказано име на картици
payment-cc =
    .label = Ваша картица
payment-cancel-btn = Откажи
payment-update-btn = Ажурирај
payment-pay-btn = Плати сад
payment-validate-name-error = Унесите ваше име


payment-legal-link-stripe-3 = <stripePrivacyLink>{ -brand-name-stripe } политика приватности</stripePrivacyLink>


payment-method-header = Изаберите начин плаћања
payment-method-header-second-step = 2. { payment-method-header }
payment-method-first-approve = Прво ћете морати да одобрите вашу претплату


payment-processing-message = Сачекајте док обрадимо вашу уплату…


payment-confirmation-cc-card-ending-in = Картица завршава са { $last4 }




plan-details-header = Детаљи производа
plan-details-list-price = Ценовник
plan-details-show-button = Прикажи детаље
plan-details-hide-button = Сакриј детаље
plan-details-total-label = Укупно
plan-details-tax = Порези и надокнаде


product-no-such-plan = Не постоји такав план за овај производ.


price-details-no-tax = { $priceAmount }
price-details-tax = { $priceAmount } + { $taxAmount } пореза
price-details-no-tax-day =
    { $intervalCount ->
        [one] { $priceAmount } сваки { $intervalCount } дан
        [few] { $priceAmount } свака { $intervalCount } дана
       *[other] { $priceAmount } сваких { $intervalCount } дана
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } сваки { $intervalCount } дан
            [few] { $priceAmount } свака { $intervalCount } дана
           *[other] { $priceAmount } сваких { $intervalCount } дана
        }
price-details-no-tax-week =
    { $intervalCount ->
        [one] { $priceAmount } сваку { $intervalCount } недељу
        [few] { $priceAmount } сваке { $intervalCount } недеље
       *[other] { $priceAmount } сваких { $intervalCount } недеља
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } сваку { $intervalCount } недељу
            [few] { $priceAmount } сваке { $intervalCount } недеље
           *[other] { $priceAmount } сваких { $intervalCount } недеља
        }
price-details-no-tax-month =
    { $intervalCount ->
        [one] { $priceAmount } сваки { $intervalCount } месец
        [few] { $priceAmount } свака { $intervalCount } месеца
       *[other] { $priceAmount } сваких { $intervalCount } месеци
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } сваки { $intervalCount } месец
            [few] { $priceAmount } свака { $intervalCount } месеца
           *[other] { $priceAmount } сваких { $intervalCount } месеци
        }
price-details-no-tax-year =
    { $intervalCount ->
        [one] { $priceAmount } сваку { $intervalCount } годину
        [few] { $priceAmount } сваке { $intervalCount } године
       *[other] { $priceAmount } сваких { $intervalCount } година
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } сваку { $intervalCount } годину
            [few] { $priceAmount } сваке { $intervalCount } године
           *[other] { $priceAmount } сваких { $intervalCount } година
        }
price-details-tax-day =
    { $intervalCount ->
        [one] { $priceAmount } + { $taxAmount } пореза сваки { $intervalCount } дан
        [few] { $priceAmount } + { $taxAmount } пореза свака { $intervalCount } дана
       *[other] { $priceAmount } + { $taxAmount } пореза сваких { $intervalCount } дана
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + { $taxAmount } пореза сваки { $intervalCount } дан
            [few] { $priceAmount } + { $taxAmount } пореза свака { $intervalCount } дана
           *[other] { $priceAmount } + { $taxAmount } пореза сваких { $intervalCount } дана
        }
price-details-tax-week =
    { $intervalCount ->
        [one] { $priceAmount } + { $taxAmount } пореза сваку { $intervalCount } недељу
        [few] { $priceAmount } + { $taxAmount } пореза сваке { $intervalCount } недеље
       *[other] { $priceAmount } + { $taxAmount } пореза сваких { $intervalCount } недеља
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + { $taxAmount } пореза сваку { $intervalCount } недељу
            [few] { $priceAmount } + { $taxAmount } пореза сваке { $intervalCount } недеље
           *[other] { $priceAmount } + { $taxAmount } пореза сваких { $intervalCount } недеља
        }
price-details-tax-month =
    { $intervalCount ->
        [one] { $priceAmount } + { $taxAmount } пореза сваки { $intervalCount } месец
        [few] { $priceAmount } + { $taxAmount } пореза свака { $intervalCount } месеца
       *[other] { $priceAmount } + { $taxAmount } пореза сваких { $intervalCount } месеци
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + { $taxAmount } пореза сваки { $intervalCount } месец
            [few] { $priceAmount } + { $taxAmount } пореза свака { $intervalCount } месеца
           *[other] { $priceAmount } + { $taxAmount } пореза сваких { $intervalCount } месеци
        }
price-details-tax-year =
    { $intervalCount ->
        [one] { $priceAmount } + { $taxAmount } пореза сваку { $intervalCount } годину
        [few] { $priceAmount } + { $taxAmount } пореза сваке { $intervalCount } године
       *[other] { $priceAmount } + { $taxAmount } пореза сваких { $intervalCount } година
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + { $taxAmount } пореза сваку { $intervalCount } годину
            [few] { $priceAmount } + { $taxAmount } пореза сваке { $intervalCount } године
           *[other] { $priceAmount } + { $taxAmount } пореза сваких { $intervalCount } година
        }


subscription-create-title = Подесите вашу претплату
subscription-success-title = Потврда претплате
subscription-processing-title = Потврђујемо претплату…
subscription-error-title = Грешка при потврди претплате…
subscription-noplanchange-title = Ова промена плана претплате није подржана
subscription-iapsubscribed-title = Већ сте претплаћени
sub-guarantee = 30-дневна гаранција поврата новца


terms = Услови коришћења
privacy = Обавештење о приватности
terms-download = Услови преузимања


document =
    .title = Firefox налози
close-aria =
    .aria-label = Затвори модал
settings-subscriptions-title = Претплате
coupon-promo-code = Промотивни код


plan-price-interval-day =
    { $intervalCount ->
        [one] { $amount } сваки { $intervalCount } дан
        [few] { $amount } свака { $intervalCount } дана
       *[other] { $amount } сваких { $intervalCount } дана
    }
    .title =
        { $intervalCount ->
            [one] { $amount } сваки { $intervalCount } дан
            [few] { $amount } свака { $intervalCount } дана
           *[other] { $amount } сваких { $intervalCount } дана
        }
plan-price-interval-week =
    { $intervalCount ->
        [one] { $amount } сваку { $intervalCount } недељу
        [few] { $amount } сваке { $intervalCount } недеље
       *[other] { $amount } сваких { $intervalCount } недеља
    }
    .title =
        { $intervalCount ->
            [one] { $amount } сваку { $intervalCount } недељу
            [few] { $amount } сваке { $intervalCount } недеље
           *[other] { $amount } сваких { $intervalCount } недеља
        }
plan-price-interval-month =
    { $intervalCount ->
        [one] { $amount } сваки { $intervalCount } месец
        [few] { $amount } свака { $intervalCount } месеца
       *[other] { $amount } сваких { $intervalCount } месеци
    }
    .title =
        { $intervalCount ->
            [one] { $amount } сваки { $intervalCount } месец
            [few] { $amount } свака { $intervalCount } месеца
           *[other] { $amount } сваких { $intervalCount } месеци
        }
plan-price-interval-year =
    { $intervalCount ->
        [one] { $amount } сваку { $intervalCount } годину
        [few] { $amount } сваке { $intervalCount } године
       *[other] { $amount } сваких { $intervalCount } година
    }
    .title =
        { $intervalCount ->
            [one] { $amount } сваку { $intervalCount } годину
            [few] { $amount } сваке { $intervalCount } године
           *[other] { $amount } сваких { $intervalCount } година
        }


general-error-heading = Општа грешка апликације
basic-error-message = Нешто није у реду. Покушајте поново касније.
payment-error-1 = Дошло је до проблема приликом одобравања плаћања. Покушајте поново или контактирајте издавача картице.
payment-error-2 = Дошло је до проблема приликом одобравања плаћања. Контактирајте издавача картице.
payment-error-3b = Дошло је до неочекиване грешке приликом обраде ваше уплате. Покушајте поново касније.
expired-card-error = Изгледа да је ваша кредитна картица истекла. Покушајте са другом.
insufficient-funds-error = Изгледа да је стање на вашој кредитној картици недовољно. Покушајте са другом.
withdrawal-count-limit-exceeded-error = Изгледа да ће ова трансакција премашити ограничење ваше картице. Покушајте са другом.
charge-exceeds-source-limit = Изгледа да ће ова трансакција премашити дневно ограничење ваше картице. Покушајте са другом или поново након 24 сата.
instant-payouts-unsupported = Изгледа да ваша дебитна картица није подешена за тренутна плаћања. Покушајте са другом или кредитном картицом.
duplicate-transaction = Изгледа да је идентична трансакција управо послана. Проверите вашу историју плаћања.
coupon-expired = Изгледа да је тај промотивни код истекао.
card-error = Ваша трансакција није могла бити обрађена. Проверите податке ваше кредитне картице и покушајте поново.
country-currency-mismatch = Валута ове претплате не вреди за земљу повезану са вашим плаћањем.
currency-currency-mismatch = Жао нам је. Не можете да мењате валуте.
no-subscription-change = Жао нам је. Не можете да мењате план претплате.
iap-already-subscribed = Већ сте претплаћени преко { $mobileAppStore }-а.
fxa-account-signup-error-2 = Пријава на { $productName } није успела због системске грешке. Ваш начин плаћања није наплаћен. Покушајте поново.
fxa-post-passwordless-sub-error = Претплата је потврђена, али страница за потврду се није учитала. Проверите вашу адресу е-поште да подесите налог.
newsletter-signup-error = Нисте претплаћени на е-поруке о ажурирању производа. Можете да покушате поново у подешавањима налога.
product-plan-error =
    .title = Проблем при учитавању планова
product-profile-error =
    .title = Проблем при учитавању профила
product-customer-error =
    .title = Проблем при учитавању купца
product-plan-not-found = План није пронађен


coupon-success = Ваш план ће се аутоматски обновити по основној цени.
coupon-success-repeating = Ваш план ће се аутоматски обновити после { $couponDurationDate } по основној цени.


new-user-card-title = Унесите податке са картице
new-user-submit = Претплати се


sub-update-payment-title = Подаци о плаћању


pay-with-heading-card-only = Платите картицом
product-invoice-preview-error-title = Проблем при учитавању прегледа рачуна
product-invoice-preview-error-text = Није могуће учитати преглед рачуна


subscription-iaperrorupgrade-title = Још не можемо да вас надоградимо




product-plan-change-heading = Прегледајте промену
sub-change-failed = Промена плана није успела
sub-change-submit = Потврди промене
sub-update-current-plan-label = Тренутни план
sub-update-new-plan-label = Нови план
sub-update-total-label = Нови укупни износ




sub-item-cancel-sub = Откажи претплату
sub-item-stay-sub = Задржи претплату


sub-item-cancel-msg =
    Више нећете моћи да користите { $name } након
    { $period }, последњег дана вашег обрачунског циклуса.
sub-item-cancel-confirm =
    Откажи мој приступ и сачуване податке на услузи
    { $name }, { $period }


sub-route-idx-reactivating = Поновно активирање претплате није успело
sub-route-idx-cancel-failed = Отказивање претплате није успело
sub-route-idx-contact = Контактирајте подршку
sub-route-idx-cancel-msg-title = Жао нам је што одлазите
sub-route-idx-cancel-msg =
    Ваша { $name } претплата је отказана.
          <br />
          Још увек имате приступ { $name } услузи до { $date }.


sub-customer-error =
    .title = Проблем при учитавању купца
sub-invoice-error =
    .title = Проблем при учитавању рачуна
sub-billing-update-success = Ваши подаци о плаћању су успешно ажурирани
sub-invoice-previews-error-title = Проблем при учитавању прегледа рачуна
sub-invoice-previews-error-text = Није могуће учитати прегледе рачуна


pay-update-change-btn = Промени
pay-update-manage-btn = Управљај


sub-next-bill = Следећи обрачун { $date }
sub-expires-on = Истиче { $date }




pay-update-card-exp = Истиче { $expirationDate }
sub-route-idx-updating = Ажурирам податке о плаћању…
sub-route-payment-modal-heading = Неваћежи подаци о плаћању
sub-route-missing-billing-agreement-payment-alert = Неважећи подаци о плаћању; дошло је до грешке са вашим налогом. <div>Управљај</div>
sub-route-funding-source-payment-alert = Неважећи подаци о плаћању; дошло је до грешке са вашим налогом. Ово упозорење се може задржати неко време након што сте успешно ажурирали своје податке. <div>Управљај</div>


sub-item-no-such-plan = Не постоји такав план за ову претплату.
invoice-not-found = Накнадни рачун није пронађен
sub-item-no-such-subsequent-invoice = Накнадни рачун није пронађен за ову претплату.
sub-invoice-preview-error-title = Преглед рачуна није пронађен
sub-invoice-preview-error-text = Преглед рачуна није пронађен за ову претплату


reactivate-confirm-dialog-header = Желите ли и даље да користите { $name }?
reactivate-confirm-copy =
    Приступ на { $name } ће се наставити и циклус наплате
    и плаћања ће остати исти. Ваше следећа наплата износиће
    { $amount } на картици која завршава са { $last } на { $endDate }.
reactivate-confirm-without-payment-method-copy =
    Приступ на { $name } ће се наставити и циклус наплате
    и плаћања ће остати исти. Ваша следећа наплата износиће
    { $amount } на { $endDate }.
reactivate-confirm-button = Поново се претплати


reactivate-panel-copy = Изгубићете приступ { $name }-у <strong>{ $date }</strong>.
reactivate-success-copy = Хвала! Све је спремно.
reactivate-success-button = Затвори


sub-iap-item-manage-button = Управљај
