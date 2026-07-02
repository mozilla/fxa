loyalty-discount-terms-heading = Услови и ограничења
loyalty-discount-terms-support = Обратите се подршци
# $productName (String) - The name of the product to create subscription, e.g. Mozilla VPN
loyalty-discount-terms-contact-support-product-aria = Обратите се подршци за { $productName }
not-found-page-title-terms = Страница није пронађена
not-found-page-description-terms = Страница коју тражите не постоји.
not-found-page-button-terms-manage-subscriptions = Управљајте претплатама

## Page

checkout-signin-or-create = 1. Пријавите се или направите { -product-mozilla-account }
# This string appears as a separation between the two sign-in options, "Enter your email"(signin-form-email-input) "or"(this string) "Continue with Google"(continue-signin-with-google-button) / "Continue with Apple"(continue-signin-with-apple-button)
checkout-signin-options-or = или
continue-signin-with-google-button = Наставите са { -brand-google } налогом
continue-signin-with-apple-button = Наставите са { -brand-apple } налогом
next-payment-method-header = Изаберите начин плаћања
# This message is used to indicate the second step in a multi step process.
payment-method-header-second-step-next = 2. { next-payment-method-header }
next-payment-method-first-approve = Прво ћете морати да одобрите вашу претплату
# $productName (String) - The name of the product to create subscription, e.g. Mozilla VPN
location-header = Изаберите своју државу и унесите поштански број <p>да бисте наставили ка плаћању за { $productName }</p>
location-banner-info = Нисмо успели аутоматски да откријемо вашу локацију
location-required-disclaimer = Ове податке користимо само за израчунавање пореза и валуте.
location-banner-currency-change = Промена валуте није подржана. Да бисте наставили, изаберите државу која одговара вашој тренутној валути наплате.

## Page - Upgrade page

upgrade-page-payment-information = Подаци о плаћању
# $nextInvoiceDate (number) - The date of the next invoice
upgrade-page-acknowledgment = Ваш план ће се одмах променити и данас ће вам бити наплаћен сразмеран износ за остатак овог циклуса наплате. Почевши од { $nextInvoiceDate }, биће вам наплаћен пун износ.
upgrade-page-acknowledgment-from-trial = Надоградњом ће се ваш активни бесплатни пробни период одмах завршити и данас ће вам бити наплаћен нови план.

## Authentication Error page

auth-error-page-title = Нисмо успели да вас пријавимо
checkout-error-boundary-retry-button = Покушај поново
checkout-error-boundary-basic-error-message = Нешто није у реду. Покушајте поново или се <contactSupportLink>обратите подршци.</contactSupportLink>
amex-logo-alt-text = { -brand-amex } логотип
diners-logo-alt-text = { -brand-diner } логотип
discover-logo-alt-text = { -brand-discover } логотип
jcb-logo-alt-text = { -brand-jcb } логотип
mastercard-logo-alt-text = { -brand-mastercard } логотип
paypal-logo-alt-text = { -brand-paypal } логотип
unionpay-logo-alt-text = { -brand-unionpay } логотип
visa-logo-alt-text = { -brand-visa } логотип
# Alt text for generic payment card logo
unbranded-logo-alt-text = Небрендирани логотип
link-logo-alt-text = { -brand-link } логотип
apple-pay-logo-alt-text = { -brand-apple-pay } логотип
google-pay-logo-alt-text = { -brand-google-pay } логотип

## Error pages - /checkout and /upgrade
## Common strings used in multiple pages

next-payment-error-manage-subscription-button = Управљај претплатом
next-iap-blocked-contact-support = Имате мобилну претплату унутар апликације која је у сукобу са овим производом - обратите се подршци како бисмо вам помогли.
next-payment-error-retry-button = Покушај поново
next-basic-error-message = Нешто није у реду. Покушајте поново касније.
checkout-error-contact-support-button = Обратите се подршци
checkout-error-not-eligible = Немате право да се претплатите на овај производ - обратите се подршци како бисмо вам помогли.
checkout-error-already-subscribed = Већ сте претплаћени на овај производ.
checkout-error-contact-support = Обратите се подршци како бисмо вам помогли.
cart-error-currency-not-determined = Нисмо успели да утврдимо валуту за ову куповину, покушајте поново.
checkout-processing-general-error = Дошло је до неочекиване грешке приликом обраде ваше уплате, покушајте поново.
cart-total-mismatch-error = Износ рачуна је промењен. Покушајте поново.

## Error pages - Payment method failure messages

intent-card-error = Ваша трансакција није могла бити обрађена. Проверите податке о својој кредитној картици и покушајте поново.
intent-expired-card-error = Изгледа да је ваша кредитна картица истекла. Покушајте са другом картицом.
intent-payment-error-try-again = Хм. Дошло је до проблема приликом овлашћивања ваше уплате. Покушајте поново или се обратите издавачу своје картице.
intent-payment-error-get-in-touch = Хм. Дошло је до проблема приликом овлашћивања ваше уплате. Обратите се издавачу своје картице.
intent-payment-error-generic = Дошло је до неочекиване грешке приликом обраде ваше уплате, покушајте поново.
intent-payment-error-insufficient-funds = Изгледа да на вашој картици нема довољно средстава. Покушајте са другом картицом.
general-paypal-error = Дошло је до неочекиване грешке приликом обраде вашег плаћања, покушајте поново.
paypal-active-subscription-no-billing-agreement-error = Изгледа да је дошло до проблема са наплатом на вашем { -brand-paypal } налогу. Поново омогућите аутоматска плаћања за вашу претплату.

## Processing page and Needs Input page - /checkout and /upgrade
## Common strings used in multiple pages

next-payment-processing-message = Сачекајте док обрадимо вашу уплату…

## Success page - /checkout and /upgrade
## Common strings used in multiple checkout pages

next-payment-confirmation-thanks-heading-account-exists = Хвала, сада проверите вашу е-пошту!
# $email (String) - The user's email.
payment-confirmation-thanks-subheading-account-exists-2 = Примићете имејл на адресу { $email } са упутствима о вашој претплати, као и податке о плаћању.
next-payment-confirmation-order-heading = Детаљи поруџбине
# $invoiceNumber (String) - Invoice number of the successful payment
next-payment-confirmation-invoice-number = Рачун #{ $invoiceNumber }
# $invoiceDate (Date) - Start date of the latest invoice
next-payment-confirmation-invoice-date = { $invoiceDate }
next-payment-confirmation-details-heading-2 = Подаци о плаћању

## Success pages (/checkout and /upgrade)
## Common strings used in multiple checkout pages

next-payment-confirmation-download-button = Идите на преузимање

## Success pages (/checkout and /upgrade), Start page (/upgrade)
## Common strings used in multiple checkout pages

# $last4 (Number) - Last four numbers of credit card
next-payment-confirmation-cc-card-ending-in = Картица завршава са { $last4 }

## Not found page

not-found-title-subscriptions = Претплата није пронађена
not-found-description-subscriptions = Нисмо успели да пронађемо вашу претплату. Покушајте поново или контактирајте подршку.
not-found-button-back-to-subscriptions = Назад на претплате

## Error page - churn cancel flow

churn-cancel-flow-error-offer-expired-title = Ова понуда је истекла
churn-cancel-flow-error-offer-expired-message = Тренутно нема доступних попуста за ову претплату. Можете наставити са отказивањем ако желите.
churn-cancel-flow-error-button-continue-to-cancel = Настави са отказивањем
churn-cancel-flow-error-page-button-back-to-subscriptions = Назад на претплате

## Loyalty discount - Not found page

not-found-loyalty-discount-title = Страница није пронађена
not-found-loyalty-discount-description = Страница коју тражите не постоји.
not-found-loyalty-discount-button-back-to-subscriptions = Назад на претплате

## Error page

interstitial-offer-error-subscription-not-found-heading = Нисмо могли да пронађемо активну претплату
interstitial-offer-error-subscription-not-found-message = Изгледа да ова претплата више није активна.
interstitial-offer-error-customer-mismatch-heading = Ова претплата није повезана са вашим налогом
interstitial-offer-error-customer-mismatch-message = Проверите да ли сте пријављени са исправним налогом или контактирајте подршку ако вам је потребна помоћ.
interstitial-offer-error-general-heading = Понуда није доступна
interstitial-offer-error-general-message = Изгледа да ова понуда тренутно није доступна.
interstitial-offer-error-button-back-to-subscriptions = Назад на претплате
interstitial-offer-error-button-cancel-subscription = Настави са отказивањем
interstitial-offer-error-button-sign-in = Пријави се
interstitial-offer-error-button-contact-support = Обратите се подршци

## Page - Subscription Management

subscription-management-page-banner-warning-title-no-payment-method = Није додат начин плаћања
subscription-management-page-banner-warning-link-no-payment-method = Додајте начин плаћања
subscription-management-subscriptions-heading = Претплате
subscription-management-free-trial-heading = Бесплатни пробни периоди
subscription-management-your-free-trials-aria = Ваши бесплатни пробни периоди
# Heading for mobile only quick links menu
subscription-management-jump-to-heading = Скочи на
subscription-management-nav-free-trials = Бесплатни пробни периоди
subscription-management-nav-payment-details = Подаци о плаћању
subscription-management-nav-active-subscriptions = Активне претплате
subscription-management-payment-details-heading = Подаци о плаћању
subscription-management-email-label = Е-пошта
subscription-management-credit-balance-label = Стање кредита
subscription-management-credit-balance-message = Кредит ће аутоматски бити примењен на будуће рачуне
subscription-management-payment-method-label = Начин плаћања
subscription-management-button-add-payment-method-aria = Додај начин плаћања
subscription-management-button-add-payment-method = Додај
subscription-management-page-warning-message-no-payment-method = Додајте начин плаћања како бисте избегли прекид ваших претплата.
subscription-management-button-manage-payment-method-aria = Управљајте начином плаћања
subscription-management-button-manage-payment-method = Управљај
# $last4 (String) - Last four numbers of credit card
subscription-management-card-ending-in = Картица која се завршава на { $last4 }
# $expirationDate (Date) - Payment card's expiration date
subscription-management-card-expires-date = Истиче { $expirationDate }
subscription-management-active-subscriptions-heading = Активне претплате
subscription-management-you-have-no-active-subscriptions = Немате активних претплата
subscription-management-new-subs-will-appear-here = Нове претплате ће се појавити овде.
subscription-management-your-active-subscriptions-aria = Ваше активне претплате
subscription-management-button-support = Потражите помоћ
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscription-management-button-support-aria = Потражите помоћ за { $productName }
subscription-management-your-apple-iap-subscriptions-aria = Ваше { -brand-apple } претплате унутар апликације
subscription-management-apple-in-app-purchase-2 = { -brand-apple } куповина унутар апликације
subscription-management-your-google-iap-subscriptions-aria = Ваше { -brand-google } претплате унутар апликације
subscription-management-google-in-app-purchase-2 = { -brand-google } куповина унутар апликације
# $date (String) - Date of next bill
subscription-management-iap-sub-expires-on-expiry-date = Истиче { $date }
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscription-management-button-manage-subscription-aria = Управљајте претплатом за { $productName }
subscription-management-button-manage-subscription-1 = Управљај претплатом
error-payment-method-banner-title-expired-card = Истекла картица
error-payment-method-banner-message-add-new-card = Додајте нову картицу или начин плаћања да бисте избегли прекид ваших претплата.
error-payment-method-banner-label-update-payment-method = Ажурирај начин плаћања
error-payment-method-expired-card = Ваша картица је истекла. Додајте нову картицу или начин плаћања како бисте избегли прекид ваших претплата.
error-payment-method-banner-title-invalid-payment-information = Неисправни подаци о плаћању
error-payment-method-banner-message-account-issue = Постоји проблем са вашим налогом.
subscription-management-button-manage-payment-method-1 = Управљај начином плаћања
subscription-management-error-apple-pay = Постоји проблем са вашим { -brand-apple-pay } налогом. Решите проблем како бисте задржали своје активне претплате.
subscription-management-error-google-pay = Постоји проблем са вашим { -brand-google-pay } налогом. Решите проблем како бисте задржали своје активне претплате.
subscription-management-error-link = Постоји проблем са вашим { -brand-link } налогом. Решите проблем како бисте задржали своје активне претплате.
subscription-management-error-paypal-billing-agreement = Постоји проблем са вашим { -brand-paypal } налогом. Решите овај проблем како бисте задржали своје активне претплате.
subscription-management-error-payment-method = Постоји проблем са вашим начином плаћања. Решите проблем како бисте задржали своје активне претплате.
manage-payment-methods-heading = Управљај начинима плаћања
paypal-payment-management-page-invalid-header = Неисправни подаци о наплати
paypal-payment-management-page-invalid-description = Изгледа да постоји грешка са вашим { -brand-paypal } налогом. Потребно је да предузмете неопходне кораке како бисте решили овај проблем са плаћањем.
# Page - Not Found
page-not-found-title = Страница није пронађена
page-not-found-description = Тражена страница није пронађена. Обавештени смо о томе и исправићемо све везе које су можда неисправне.
page-not-found-back-button = Идите назад
alert-dialog-title = Дијалог упозорења

## Already Canceling

already-canceling-title = Ваша претплата ће се ускоро завршити
# $productName (String) - The name of the product to create subscription, e.g. Mozilla VPN
# $date (Date) - Last day of product access
already-canceling-message = И даље ћете имати приступ услузи { $productName } до { $date }.
already-canceling-turn-back-on = Своју претплату можете поново активирати било када пре него што се заврши.
already-canceling-button-back-to-subscriptions = Назад на претплате

## Navigation breadcrumbs

# Link title - Account settings
subscription-management-breadcrumb-account-home = Почетна страница налога
# Link title - Subscriptions management
subscription-management-breadcrumb-subscriptions = Претплате
# Link title - Payment method management
subscription-management-breadcrumb-payment-2 = Управљај начинима плаћања
# $page refers to page titles used in the breadcrumb menu (e.g. Account Home, Subscriptions, Payment Methods)
subscription-management-breadcrumb-back-aria = Вратите се на { $page }

## CancelSubscription

subscription-cancellation-dialog-title = Жао нам је што нас напуштате
# $name (String) - The name of the subscribed product.
# $date (Date) - Last day of product access
subscription-cancellation-dialog-msg = Ваша { $name } претплата је отказана. И даље ћете имати приступ услузи { $name } до { $date }.
subscription-cancellation-dialog-aside = Имате питања? Посетите <LinkExternal>{ -brand-mozilla } подршку</LinkExternal>.
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
cancel-subscription-heading = Откажи претплату на { $productName }

## $currentPeriodEnd (Date) - The end date of the subscription's current billing period (e.g., September, 8, 2025)
## $productName (String) - The name of the subscribed product, e.g. Mozilla VPN

subscription-content-no-longer-use-message = Више нећете моћи да користите { $productName } након { $currentPeriodEnd }, последњег дана вашег обрачунског циклуса.
subscription-content-cancel-access-message = Откажи мој приступ и моје сачуване податке унутар { $productName } дана { $currentPeriodEnd }

## $productName (String) - The name of the subscribed product, e.g. Mozilla VPN

cancel-subscription-button-cancel-subscription = Откажи претплату
    .aria-label = Откажите своју претплату на { $productName }
cancel-subscription-button-keep-subscription = Задржи претплату

## Component - Payment Consent Checkbox

next-payment-confirm-with-legal-links-static-3 = Овлашћујем { -brand-mozilla } да наплати приказани износ са мог начина плаћања, у складу са <termsOfServiceLink>Условима коришћења</termsOfServiceLink> и <privacyNoticeLink>Обавештењем о приватности</privacyNoticeLink>, све док не откажем претплату.

## $endDate (Date) - The end date of the free trial

checkbox-payment-required-no-charge = Начин плаћања је неопходан за почетак бесплатног пробног периода. Неће вам бити наплаћено ништа до { $endDate }.
checkbox-confirm-free-trial-with-legal-links = Овлашћујем { -brand-mozilla }-у да терети мој начин плаћања за приказани износ након што се бесплатни пробни период заврши { $endDate }, у складу са <termsOfServiceLink>Условима коришћења</termsOfServiceLink> и <privacyNoticeLink>Обавештењем о приватности</privacyNoticeLink>, све док не откажем своју претплату.
next-payment-confirm-checkbox-error = Прихватите ово да бисте наставили

## Checkout Form

next-new-user-submit = Претплати се
next-pay-with-heading-paypal = Платите помоћу { -brand-paypal } услуге

## Churn flow - cancel

churn-cancel-flow-success-title = И даље сте претплаћени
# $discountPercent (Number) - The discount amount between 1 and 100 as an integer (e.g, 'you’ll save 10% on your next bill', discountPercent = 10)
churn-cancel-flow-success-message = Ваша претплата ће се наставити и уштедећете { $discountPercent }% на следећем рачуну.
# $productName (String) - The name of the product to create subscription, e.g. Mozilla VPN
churn-cancel-flow-thanks-valued-subscriber = Хвала што користите { $productName }!
churn-cancel-flow-button-back-to-subscriptions = Назад на претплате
churn-cancel-flow-action-error = Дошло је до неочекиване грешке. Покушајте поново.
# $discountPercent (Number) - The discount amount between 1 and 100 as an integer (e.g, 'Stay subscribed and save 10%', discountPercent = 10)
churn-cancel-flow-button-stay-subscribed-and-save-discount = Останите претплаћени и уштедите { $discountPercent }%
churn-cancel-flow-button-stay-subscribed-and-save = Останите претплаћени и уштедите
churn-cancel-flow-button-cancel-subscription = Откажи претплату
churn-cancel-flow-link-terms-and-restrictions = Важе одређени услови и ограничења
churn-cancel-flow-discount-already-applied-title = Код за попуст је већ примењен
# $productName (String) - The name of the product to create subscription, e.g. Mozilla VPN
churn-cancel-flow-discount-already-applied-message = Овај попуст је примењен на { $productName } претплату за ваш налог. Ако вам је и даље потребна помоћ, контактирајте наш тим за подршку.
churn-cancel-flow-button-manage-subscriptions = Управљај претплатама
churn-cancel-flow-button-contact-support = Контактирајте подршку

## $productName (String) - The name of the product to create subscription, e.g. Mozilla VPN

churn-cancel-flow-subscription-active-title = Ваша { $productName } претплата је активна
churn-cancel-flow-button-go-to-product-page = Иди на { $productName }
# The sentence before this informs the customer that they will save a discount on their next bill (e.g. You will save 10% on your next charge of $12 to your PayPal payment method on March 6, 2026.)
churn-cancel-flow-after = Након тога, ваша претплата ће се аутоматски обновити по стандардној цени, осим ако је не откажете.
churn-cancel-flow-cancel-success-title = Жао нам је што нас напуштате
# $productName (String) - The name of the product to create subscription, e.g. Mozilla VPN
# $date (Date) - Last day of product access
churn-cancel-flow-cancel-success-dialog-msg = Ваша { $productName } претплата је отказана. И даље ћете имати приступ услузи { $productName } до { $date }.
churn-cancel-flow-cancel-turn-back-on = Своју претплату можете поново активирати било када пре него што истекне.
churn-cancel-flow-cancel-success-dialog-aside = Имате питања? Посетите <LinkExternal>{ -brand-mozilla } подршку</LinkExternal>.

## Churn flow - stay subscribed

churn-stay-subscribed-action-error = Дошло је до неочекиване грешке. Покушајте поново.
# $discountPercent (Number) - The discount amount between 1 and 100 as an integer (e.g, 'Stay subscribed and save 10%', discountPercent = 10)
churn-stay-subscribed-button-stay-subscribed-and-save-discount = Останите претплаћени и уштедите { $discountPercent }%
churn-stay-subscribed-button-stay-subscribed-and-save = Останите претплаћени и уштедите
churn-stay-subscribed-button-no-thanks = Не, хвала
    .aria-label = Назад на страницу са претплатама
churn-stay-subscribed-link-terms-and-restrictions = Важе одређени услови и ограничења
churn-stay-subscribed-title-offer-expired = Ова понуда је истекла

## $productName (String) - The name of the product associated with the subscription.

churn-stay-subscribed-subtitle-offer-expired = Желите ли да наставите са коришћењем услуге { $productName }?
churn-stay-subscribed-message-access-will-continue = Ваш приступ услузи { $productName } ће се наставити, а ваш циклус наплате и плаћање ће остати исти.
churn-stay-subscribed-title-subscription-renewed = Претплата је обновљена
churn-stay-subscribed-title-subscription-active = Ваша претплата на { $productName } је активна
churn-stay-subscribed-thanks-valued-subscriber = Хвала вам што сте наш цењени претплатник!
churn-stay-subscribed-button-go-to-product-page = Иди на { $productName }
churn-stay-subscribed-button-go-to-subscriptions = Иди на претплате
churn-stay-subscribed-button-stay-subscribed = Задржи претплату
# The sentence before this informs the customer that they will save a discount on their next bill (e.g. You will save 10% on your next charge of $12 to your PayPal payment method on March 6, 2026.)
churn-stay-subscribed-after = Након тога, ваша претплата ће се аутоматски обновити по стандардној цени, осим ако је не откажете.

## Component - CouponForm

next-coupon-enter-code =
    .placeholder = Унеси код
# Title of container where a user can input a coupon code to get a discount on a subscription.
next-coupon-promo-code = Промотивни код
# Title of container showing discount coupon code applied to a subscription.
next-coupon-promo-code-applied = Промотивни код је примењен
next-coupon-remove = Уклони
next-coupon-submit = Примени

## $amount (Number) - The charge amount excluding tax. It will be formatted as currency.
## $date (Date) - The date the free trial ends or expires (e.g., September 8, 2026)
## $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
## $tax (Number) - The tax amount. It will be formatted as currency.

free-trial-content-trial-expires = Ваш бесплатни пробни период истиче { $date }.
free-trial-content-trial-cancelled = Ваш бесплатни пробни период је отказан.

# Charge info strings - with tax, per interval

free-trial-content-charge-info-with-tax-day = Биће вам наплаћено { $amount } + { $tax } пореза дневно након што се бесплатни пробни период заврши { $date }.
free-trial-content-charge-info-with-tax-week = Биће вам наплаћено { $amount } + { $tax } пореза седмично након што се бесплатни пробни период заврши { $date }.
free-trial-content-charge-info-with-tax-month = Биће вам наплаћено { $amount } + { $tax } пореза месечно након што се бесплатни пробни период заврши { $date }.
free-trial-content-charge-info-with-tax-halfyear = Биће вам наплаћено { $amount } + { $tax } пореза сваких шест месеци након што се бесплатни пробни период заврши { $date }.
free-trial-content-charge-info-with-tax-year = Биће вам наплаћено { $amount } + { $tax } пореза годишње након што се бесплатни пробни период заврши { $date }.
free-trial-content-charge-info-with-tax-default = Биће вам наплаћено { $amount } + { $tax } пореза након што се бесплатни пробни период заврши { $date }.

# Charge info strings - no tax, per interval

free-trial-content-charge-info-no-tax-day = Биће вам наплаћено { $amount } дневно након што се бесплатни пробни период заврши { $date }.
free-trial-content-charge-info-no-tax-week = Биће вам наплаћено { $amount } седмично након што се бесплатни пробни период заврши { $date }.
free-trial-content-charge-info-no-tax-month = Биће вам наплаћено { $amount } месечно након што се бесплатни пробни период заврши { $date }.
free-trial-content-charge-info-no-tax-halfyear = Биће вам наплаћено { $amount } сваких шест месеци након што се бесплатни пробни период заврши { $date }.
free-trial-content-charge-info-no-tax-year = Биће вам наплаћено { $amount } годишње након што се бесплатни пробни период заврши { $date }.
free-trial-content-charge-info-no-tax-default = Биће вам наплаћено { $amount } након што се бесплатни пробни период заврши { $date }.
free-trial-content-trial-ends = Ваш бесплатни пробни период се завршава { $date }. Ажурирајте свој начин плаћања да бисте задржали приступ након бесплатног пробног периода.
free-trial-content-trial-active = Ваш бесплатни пробни период је активан.
free-trial-content-action-error = Дошло је до неочекиване грешке. Покушајте поново.
free-trial-content-button-resume-trial = Настави пробу
free-trial-content-button-resume-trial-aria = Настави пробу за { $productName }
free-trial-content-button-cancel-trial = Откажи пробу
free-trial-content-button-cancel-trial-aria = Откажи пробу за { $productName }

## $billedOnDate (Date) - The date of the last bill (e.g., July 20, 2025)
## $invoiceTotal (Number) - The invoice total amount excluding tax. It will be formatted as currency.
## $taxDue (Number) - The tax amount. It will be formatted as currency.

free-trial-content-last-bill = Последњи рачун • { $billedOnDate }
free-trial-content-last-bill-with-tax = { $invoiceTotal } + { $taxDue } пореза
free-trial-content-last-bill-no-tax = { $invoiceTotal }

##

free-trial-content-link-view-invoice = Погледај рачун
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
free-trial-content-link-view-invoice-aria = Погледај рачун за { $productName }
# $date (Date) - The date the free trial ended (e.g., January 16, 2026)
free-trial-content-payment-failed = Ваш бесплатни пробни период се завршио <bold>{ $date }</bold>. Нисмо успели да обрадимо вашу уплату за почетак претплате. Ажурирајте свој начин плаћања да бисте активирали претплату и повратили приступ својим услугама.
free-trial-content-payment-failed-no-date = Нисмо успели да обрадимо вашу уплату за почетак претплате. Ажурирајте свој начин плаћања да бисте активирали претплату и повратили приступ својим услугама.
free-trial-content-button-update-payment = Ажурирај начин плаћања

# Component - Header

payments-header-help =
    .title = Помоћ
    .aria-label = Помоћ
    .alt = Помоћ
payments-header-bento =
    .title = { -brand-mozilla } производи
    .aria-label = { -brand-mozilla } производи
    .alt = { -brand-mozilla } логотип
payments-header-bento-close =
    .alt = Затвори
payments-header-bento-tagline = Више производа из { -brand-mozilla } који штите вашу приватност
payments-header-bento-firefox-desktop = { -brand-firefox } прегледач за десктоп
payments-header-bento-firefox-mobile = { -brand-firefox } прегледач за мобилне уређаје
payments-header-bento-monitor = { -product-mozilla-monitor }
payments-header-bento-firefox-relay = { -product-firefox-relay }
payments-header-bento-vpn = { -product-mozilla-vpn }
payments-header-bento-made-by-mozilla = Направила { -brand-mozilla }
payments-header-avatar =
    .title = Мени { -product-mozilla-account }-а
payments-header-avatar-icon =
    .alt = Профилна слика налога
payments-header-avatar-expanded-signed-in-as = Пријављени сте као
payments-header-avatar-expanded-sign-out = Одјави се

## Interstitial Offer

interstitial-offer-success-cancel-title = Жао нам је што одлазите
# $productName (String) - The name of the product to create subscription, e.g. Mozilla VPN
# $date (Date) - Last day of product access
interstitial-offer-cancel-success-dialog-msg = Ваша { $productName } претплата је отказана. И даље ћете имати приступ услузи { $productName } до { $date }.
interstitial-offer-turn-back-on = Своју претплату можете поново активирати било када пре него што истекне.
interstitial-offer-cancel-success-dialog-aside = Имате питања? Посетите <LinkExternal>{ -brand-mozilla } подршку</LinkExternal>.
interstitial-offer-button-back-to-subscriptions = Назад на претплате
interstitial-offer-action-error = Дошло је до неочекиване грешке. Покушајте поново.
interstitial-offer-cancel-subscription-button = Откажи претплату

## Daily/Weekly/Monthly refers to the user's current subscription interval

interstitial-offer-button-keep-current-interval-daily = Задржи дневну претплату
interstitial-offer-button-keep-current-interval-weekly = Задржи недељну претплату
interstitial-offer-button-keep-current-interval-halfyearly = Задржи шестомесечну претплату
interstitial-offer-button-keep-current-interval-monthly = Задржи месечну претплату
interstitial-offer-button-keep-subscription = Задржи претплату

##

payments-client-loading-spinner =
    .aria-label = Учитавање…
    .alt = Учитавање…

## Payment method management page - Stripe

# Save button for changing which payment method will be used
payment-method-management-save-default = Постави као подразумевани начин плаћања
# Save button for saving a new payment method
payment-method-management-save-method = Сачувај начин плаћања
manage-stripe-payments-title = Управљај начинима плаћања

## Component - PurchaseDetails

next-plan-details-header = Детаљи производа
next-plan-details-list-price = Ценовник
# $productName (String) - The name of the product, e.g. Mozilla VPN
plan-details-product-prorated-price = Пропорционална цена за { $productName }
next-plan-details-tax = Порези и надокнаде
next-plan-details-total-label = Укупно
# "Unused time" refers to the remaining value of the current subscription that hasn't been used yet
purchase-details-unused-time-label = Заслуга од неискоришћеног времена
purchase-details-subtotal-label = Међузбир
# "Credit applied" refers to account credit used to reduce the amount due on the invoice
purchase-details-credit-applied-label = Заслуга је примењена
# "Total due" is the total that the customer owes after all credits, discounts, and taxes have been applied
purchase-details-total-due-label = Укупно за плаћање
next-plan-details-hide-button = Сакриј детаље
next-plan-details-show-button = Прикажи детаље

## $trialDayLength (Number) - The number of days in the free trial

free-trial-start-title =
    { $trialDayLength ->
        [one] Започните свој бесплатни пробни период од { $trialDayLength } дан
        [few] Започните свој бесплатни пробни период од { $trialDayLength } дана
       *[other] Започните свој бесплатни пробни период од { $trialDayLength } дана
    }
free-trial-success-title =
    { $trialDayLength ->
        [one] Ваш бесплатни пробни период од { $trialDayLength } дан је почео
        [few] Ваш бесплатни пробни период од { $trialDayLength } дана је почео
       *[other] Ваш бесплатни пробни период од { $trialDayLength } дана је почео
    }

## $firstPrice (String) - The total price of the first charge for the subscription after the free trial ends
## $endDate (String) - The date the free trial ends

free-trial-start-message-daily = Данас није потребна уплата. Биће вам наплаћено { $firstPrice } дневно након што се бесплатни пробни период заврши { $endDate }.
free-trial-start-message-weekly = Данас није потребна уплата. Биће вам наплаћено { $firstPrice } седмично након што се бесплатни пробни период заврши { $endDate }.
free-trial-start-message-monthly = Данас није потребна уплата. Биће вам наплаћено { $firstPrice } месечно након што се бесплатни пробни период заврши { $endDate }.
free-trial-start-message-halfyearly = Данас није потребно плаћање. Биће вам наплаћено { $firstPrice } на сваких 6 месеци након што се пробни период заврши { $endDate }.
free-trial-start-message-yearly = Данас није потребно плаћање. Биће вам наплаћено { $firstPrice } годишње након што се пробни период заврши { $endDate }.

##

# $endDate (String) - The date of the first charge after the free trial ends
free-trial-first-charge-title = Прва наплата: { $endDate }

## $firstPrice (String) - The total price of the first charge for the subscription after the free trial ends
## $endDate (String) - The date of the first charge after the free trial ends

free-trial-first-charge-message-daily = Биће вам наплаћено { $firstPrice } дана { $endDate }, а након тога свакодневно док не откажете.
free-trial-first-charge-message-weekly = Биће вам наплаћено { $firstPrice } дана { $endDate }, а након тога седмично док не откажете.
free-trial-first-charge-message-monthly = Биће вам наплаћено { $firstPrice } дана { $endDate }, а након тога месечно док не откажете.
free-trial-first-charge-message-halfyearly = Биће вам наплаћено { $firstPrice } дана { $endDate }, а након тога на сваких 6 месеци док не откажете.
free-trial-first-charge-message-yearly = Биће вам наплаћено { $firstPrice } дана { $endDate }, а након тога годишње док не откажете.

##

next-coupon-success = Ваш план ће се аутоматски обновити по основној цени.
# $couponDurationDate (Date) - The date at which the coupon is no longer valid, and the subscription is billed the list price.
next-coupon-success-repeating = Ваш план ће се аутоматски обновити после { $couponDurationDate } по основној цени.

## Select Tax Location

select-tax-location-title = Локација
select-tax-location-edit-button = Уреди
select-tax-location-save-button = Сачувај
select-tax-location-continue-to-checkout-button = Наставите на плаћање
select-tax-location-country-code-label = Држава
select-tax-location-country-code-placeholder = Изаберите вашу државу
select-tax-location-error-missing-country-code = Изаберите вашу државу
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN
select-tax-location-product-not-available = { $productName } није доступан на овој локацији.
select-tax-location-postal-code-label = Поштански број
select-tax-location-postal-code =
    .placeholder = Унесите ваш поштански број
select-tax-location-error-missing-postal-code = Унесите ваш поштански број
select-tax-location-error-invalid-postal-code = Унесите важећи поштански број
select-tax-location-successfully-updated = Ваша локација је ажурирана.
select-tax-location-error-location-not-updated = Ваша локација није могла бити ажурирана. Покушајте поново.
#  $currencyDisplayName (String) - The display name of a currency code, e.g. US Dollar
select-tax-location-invalid-currency-change = Ваш налог се наплаћује у валути { $currencyDisplayName }. Изаберите државу која користи { $currencyDisplayName }.
select-tax-location-invalid-currency-change-default = Изаберите државу која одговара валути ваших активних претплата.
select-tax-location-new-tax-rate-info = Ажурирање ваше локације ће применити нову пореску стопу на све активне претплате на вашем налогу, почевши од следећег циклуса наплате.
signin-form-continue-button = Настави
signin-form-email-input = Унесите своју е-пошту
signin-form-email-input-missing = Унесите своју е-пошту
signin-form-email-input-invalid = Унесите исправну адресу е-поште
next-new-user-subscribe-product-updates-mdnplus = Желим да примам вести и новости о производима од { -product-mdn-plus }-а и { -brand-mozilla }-е
next-new-user-subscribe-product-updates-mozilla = Желим да примам вести и новости о производима од { -brand-mozilla }-е
next-new-user-subscribe-product-updates-snp = Желим да примам вести и новости о безбедности и приватности од { -brand-mozilla }-е
next-new-user-subscribe-product-assurance = Користимо само вашу е-пошту да направимо ваш налог. Никада је нећемо продати трећој страни.

## $productName (String) - The name of the subscribed product.

resubscribe-dialog-title = Желите ли да наставите са коришћењем услуге { $productName }?
stay-subscribed-access-will-continue = Ваш приступ услузи { $productName } ће се наставити, а ваш циклус наплате и начин плаћања ће остати исти.
subscription-content-button-resubscribe = Поново се претплати
    .aria-label = Поново се претплати на { $productName }
resubscribe-success-dialog-title = Хвала! Све је спремно.

## $nextInvoiceTotal (String) - The total amount of the next invoice, formatted according to the user's locale and currency.
## $taxDue (String) - The tax amount of the next invoice, formatted according to the user's locale and currency.
## $last4 (String) - The last four digits of the default payment method card.
## $currentPeriodEnd (Date) - The date of the next charge.

stay-subscribed-next-charge-with-tax = Ваше следеће задужење ће бити { $nextInvoiceTotal } + { $taxDue } пореза дана { $currentPeriodEnd }.
stay-subscribed-next-charge-no-tax = Ваше следеће задужење ће бити { $nextInvoiceTotal } дана { $currentPeriodEnd }.

## $billOnDate (Date) - The billing date of the current invoice (e.g., September 8, 2025)
## $creditApplied (Number) - The amount from account credit balance used to reduce the amount due on the invoice
## $currentPeriodEnd (Date) - The end date of the subscription's current billing period (e.g., September, 8, 2025)
## $invoiceTotal (Number) - The amount billed (excluding tax if tax does not exist). It will be formatted as currency.
## $nextBillDate (Date) - The date for the next time a charge will occur (e.g., September 8, 2025)
## $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
## $promotionName (String) - The name of the promotion.
## $taxDue (Number) - The tax added on, not included in amount. It will be formatted as currency.

subscription-content-coupon-will-be-applied = { $promotionName } попуст ће бити примењен
# • is acting as a separator between "Last bill" and the billing date.
subscription-content-last-bill = Последњи рачун • { $billedOnDate }
subscription-content-last-bill-with-tax = { $invoiceTotal } + { $taxDue } пореза
subscription-content-last-bill-no-tax = { $invoiceTotal }
subscription-content-view-invoice = Погледај рачун
subscription-management-link-view-invoice-aria = Погледај рачун за { $productName }
subscription-content-expires-on-expiry-date = Истиче { $date }
# • is acting as a separator between "Next bill" and the next billing date.
subscription-content-next-bill = Следећи рачун • { $billedOnDate }
subscription-content-next-bill-with-tax-1 = { $nextInvoiceTotal } + { $taxDue } пореза
subscription-content-next-bill-no-tax-1 = { $nextInvoiceTotal }
subscription-content-button-stay-subscribed = Задржи претплату
    .aria-label = Останите претплаћени на { $productName }
subscription-content-button-cancel-subscription = Откажи претплату
    .aria-label = Откажите своју претплату на { $productName }
# Link to the terms and restrictions for a coupon offer.
subscription-content-link-churn-intervention-terms-apply = Услови се примењују
subscription-content-link-churn-intervention-terms-aria = Погледајте услове и ограничења купона

##

dialog-close = Затвори прозорче
button-back-to-subscriptions = Назад на претплате
subscription-content-cancel-action-error = Дошло је до неочекиване грешке. Покушајте поново.
paypal-unavailable-error = { -brand-paypal } је тренутно недоступан. Користите другу опцију плаћања или покушајте поново касније.

## Churn flow - Error page

churn-error-page-title-discount-already-applied = Код за попуст је већ примењен
# $productName (String) - The name of the product associated with the subscription.
churn-error-page-message-discount-already-applied = Овај попуст је већ примењен на { $productName } претплату за ваш налог. Ако вам је и даље потребна помоћ, контактирајте наш тим за подршку.
churn-error-page-button-manage-subscriptions = Управљај претплатама
churn-error-page-button-contact-support = Контактирајте подршку
churn-error-page-button-try-again = Покушајте поново
churn-error-page-title-customer-mismatch = Купон се не може искористити
churn-error-page-message-customer-mismatch = Овај купон је издат за другу претплату и може га искористити само првобитни прималац.
churn-error-page-button-sign-in = Пријавите се
churn-error-page-title-general-error = Дошло је до проблема са обнављањем ваше претплате
churn-error-page-message-general-error = Контактирајте подршку или покушајте поново.
# $productName (String) - The name of the product associated with the subscription.
churn-error-page-button-go-to-product-page = Идите на { $productName }
# $productName (String) - The name of the product associated with the subscription.
churn-error-page-title-subscription-not-active = Овај попуст је доступан само тренутним претплатницима на { $productName }
# $productName (String) - The name of the product associated with the subscription.
churn-error-page-title-subscription-still-active = Ваша претплата на { $productName } је и даље активна

## PriceInterval - shared by multiple components, including Details and PurchaseDetails
## $amount (Number) - The amount billed. It will be formatted as currency.

plan-price-interval-daily = { $amount } дневно
plan-price-interval-weekly = { $amount } недељно
plan-price-interval-monthly = { $amount } месечно
plan-price-interval-halfyearly = { $amount } сваких 6 месеци
plan-price-interval-yearly = { $amount } годишње

## Component - SubscriptionTitle

next-subscription-create-title = Подесите вашу претплату
next-subscription-success-title = Потврда претплате
next-subscription-processing-title = Потврђујемо претплату…
next-subscription-error-title = Грешка при потврди претплате…
subscription-title-sub-exists = Већ сте се претплатили
subscription-title-plan-change-heading = Прегледајте своју промену
subscription-title-not-supported = Ова промена плана претплате није подржана
next-sub-guarantee = 30-дневна гаранција поврата новца

## Component - TermsAndPrivacy

# "Mozilla Accounts" is capitalized in this instance for title case in English
# This heading is followed by links to Terms of Service and Privacy Notice
next-subplat-mozilla-accounts-legal-heading = { -product-mozilla-accounts(capitalization: "uppercase") }
next-terms = Услови коришћења
next-privacy = Обавештење о приватности
next-terms-download = Услови преузимања
terms-and-privacy-stripe-label = { -brand-mozilla } користи { -brand-name-stripe } за безбедну обраду плаћања.
terms-and-privacy-stripe-link = { -brand-name-stripe } политика приватности
terms-and-privacy-paypal-label = { -brand-mozilla } користи { -brand-paypal } за безбедну обраду плаћања.
terms-and-privacy-paypal-link = { -brand-paypal } политика приватности
terms-and-privacy-stripe-and-paypal-label = { -brand-mozilla } користи { -brand-name-stripe } и { -brand-paypal } за безбедну обраду плаћања.

## Component - UpdatedPurchaseDetails

upgrade-purchase-details-current-plan-label = Тренутни план
upgrade-purchase-details-new-plan-label = Нови план
upgrade-purchase-details-promo-code = Промотивни код
upgrade-purchase-details-tax-label = Порези и надокнаде
# "Credit issued to account" refers to credit that will be added to the account balance that will be used toward future invoices
upgrade-purchase-details-credit-to-account = Кредит је издат на налог
upgrade-purchase-details-credit-will-be-applied = Кредит ће бити примењен на ваш налог и коришћен за будуће рачуне.

## $productName (String) - Name of the upgraded product (e.g. Mozilla VPN)
## Daily/Weekly/Monthly/Yearly refers to the subscription interval/amount of time between billing occurrences

upgrade-purchase-details-new-plan-daily = { $productName } (дневно)
upgrade-purchase-details-new-plan-weekly = { $productName } (недељно)
upgrade-purchase-details-new-plan-monthly = { $productName } (месечно)
upgrade-purchase-details-new-plan-halfyearly = { $productName } (6 месеци)
upgrade-purchase-details-new-plan-yearly = { $productName } (годишње)

## Page Metadata Information
## $productTitle (String) - The name of the product to create subscription, e.g. Mozilla VPN

# Checkout start
metadata-title-checkout-start = Плаћање | { $productTitle }
metadata-description-checkout-start = Унесите податке о плаћању да бисте довршили куповину.
# Checkout processing
metadata-title-checkout-processing = Обрада | { $productTitle }
metadata-description-checkout-processing = Сачекајте док не завршимо обраду ваше уплате.
# Checkout error
metadata-title-checkout-error = Грешка | { $productTitle }
metadata-description-checkout-error = Дошло је до грешке приликом обраде ваше претплате. Ако се овај проблем настави, контактирајте подршку.
# Checkout success
metadata-title-checkout-success = Успех | { $productTitle }
metadata-description-checkout-success = Честитамо! Успешно сте обавили куповину.
# Checkout needs_input
metadata-title-checkout-needs-input = Потребна је радња | { $productTitle }
metadata-description-checkout-needs-input = Довршите потребну радњу да бисте наставили са плаћањем.
# Upgrade start
metadata-title-upgrade-start = Надоградња | { $productTitle }
metadata-description-upgrade-start = Унесите податке о плаћању да бисте довршили надоградњу.
# Upgrade processing
metadata-title-upgrade-processing = Обрада | { $productTitle }
metadata-description-upgrade-processing = Сачекајте док завршимо обраду ваше уплате.
# Upgrade error
metadata-title-upgrade-error = Грешка | { $productTitle }
metadata-description-upgrade-error = Дошло је до грешке приликом обраде ваше надоградње. Ако се овај проблем настави, контактирајте подршку.
# Upgrade success
metadata-title-upgrade-success = Успех | { $productTitle }
metadata-description-upgrade-success = Честитамо! Успешно сте завршили своју надоградњу.
# Upgrade needs_input
metadata-title-upgrade-needs-input = Потребна је радња | { $productTitle }
metadata-description-upgrade-needs-input = Довршите потребну радњу да бисте наставили са плаћањем.
# Default
metadata-title-default = Страница није пронађена | { $productTitle }
metadata-description-default = Тражена страница није пронађена.

## Coupon Error Messages

next-coupon-error-cannot-redeem = Код који сте унели не може се искористити - ваш налог већ има претходну претплату на неку од наших услуга.
next-coupon-error-expired = Код који сте унели је истекао.
next-coupon-error-generic = Дошло је до грешке приликом обраде кода. Покушајте поново.
next-coupon-error-invalid = Код који сте унели је неисправан.
# "Limit" refers to the maximum number of times a coupon can be redeemed.
next-coupon-error-limit-reached = Код који сте унели је достигао своје ограничење.

## Stay Subscribed Error Messages

stay-subscribed-error-expired = Ова понуда је истекла.
stay-subscribed-error-discount-used = Кôд за попуст је већ примењен.
# $productTitle (String) - The name of the product
stay-subscribed-error-not-current-subscriber = Овај попуст је доступан само тренутним претплатницима на { $productTitle }.
stay-subscribed-error-still-active = Ваша претплата на { $productTitle } је и даље активна.
stay-subscribed-error-general = Дошло је до проблема са обнављањем ваше претплате.

## Manage Payment Method Error Messages

manage-payment-method-intent-error-card-declined = Ваша трансакција није могла бити обрађена. Проверите податке о својој кредитној картици и покушајте поново.
manage-payment-method-intent-error-expired-card-error = Изгледа да је ваша кредитна картица истекла. Покушајте са другом картицом.
manage-payment-method-intent-error-try-again = Хм. Дошло је до проблема са овлашћивањем вашег плаћања. Покушајте поново или ступите у контакт са издаваоцем ваше картице.
manage-payment-method-intent-error-get-in-touch = Хм. Дошло је до проблема са овлашћивањем вашег плаћања. Ступите у контакт са издаваоцем ваше картице.
manage-payment-method-intent-error-insufficient-funds = Изгледа да на вашој картици нема довољно средстава. Покушајте са другом картицом.
manage-payment-method-intent-error-generic = Дошло је до неочекиване грешке приликом обраде ваше уплате. Покушајте поново.

## $currentPeriodEnd (Date) - The date of the next charge.
## $discountPercent (Number) - The discount amount between 1 and 100 as an integer (e.g. "You will save 10% on your next charge of $12.00 on December 25, 2025.", discountPercent = 10)
## $last4 (String) - The last four digits of the default payment method card.
## $nextInvoiceTotal (String) - The total amount of the next invoice, formatted according to the user's locale and currency.
## $paymentMethod (String) - The name of the default payment method - "Google Pay", "Apple Pay", "PayPal", "Link".
## $taxDue (String) - The tax amount of the next invoice, formatted according to the user's locale and currency.

next-charge-with-discount-and-tax-card = Уштедећете { $discountPercent }% приликом следеће наплате од { $nextInvoiceTotal } + { $taxDue } пореза на картици која се завршава на { $last4 } дана { $currentPeriodEnd }.
next-charge-with-discount-and-tax-payment-method = Уштедећете { $discountPercent }% приликом следеће наплате од { $nextInvoiceTotal } + { $taxDue } пореза на вашем начину плаћања { $paymentMethod } дана { $currentPeriodEnd }.
next-charge-next-charge-with-discount-and-tax = Уштедећете { $discountPercent }% приликом следеће наплате од { $nextInvoiceTotal } + { $taxDue } пореза дана { $currentPeriodEnd }.
next-charge-with-discount-no-tax-card = Уштедећете { $discountPercent }% приликом следеће наплате од { $nextInvoiceTotal } на картици која се завршава на { $last4 } дана { $currentPeriodEnd }.
next-charge-with-discount-no-tax-payment-method = Уштедећете { $discountPercent }% приликом следеће наплате од { $nextInvoiceTotal } на вашем начину плаћања { $paymentMethod } дана { $currentPeriodEnd }.
next-charge-with-discount-no-tax = Уштедећете { $discountPercent }% приликом следеће наплате од { $nextInvoiceTotal } дана { $currentPeriodEnd }.
next-charge-with-tax-card = Ваша следећа наплата ће бити { $nextInvoiceTotal } + { $taxDue } пореза на картици која се завршава на { $last4 } дана { $currentPeriodEnd }.
next-charge-with-tax-payment-method = Ваша следећа наплата ће бити { $nextInvoiceTotal } + { $taxDue } пореза на вашем начину плаћања { $paymentMethod } дана { $currentPeriodEnd }.
next-charge-with-tax = Ваша следећа наплата ће бити { $nextInvoiceTotal } + { $taxDue } пореза дана { $currentPeriodEnd }.
next-charge-no-tax-card = Ваша следећа наплата ће бити { $nextInvoiceTotal } на картици која се завршава на { $last4 } дана { $currentPeriodEnd }.
next-charge-no-tax-payment-method = Ваша следећа наплата ће бити { $nextInvoiceTotal } на вашем начину плаћања { $paymentMethod } дана { $currentPeriodEnd }.
next-charge-no-tax = Ваша следећа наплата ће бити { $nextInvoiceTotal } дана { $currentPeriodEnd }.
