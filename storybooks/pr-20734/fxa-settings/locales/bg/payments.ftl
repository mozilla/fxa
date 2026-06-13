# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.


## Component - CouponForm

# Title of container showing discount coupon code applied to a subscription.
coupon-promo-code-applied = Промо код - приложен
coupon-submit = Прилагане
coupon-remove = Премахване
coupon-error = Въведеният код е недопустим или е с изтекъл срок.
coupon-error-generic = Възникна грешка при обработване на кода. Моля, опитайте отново.
coupon-error-expired = Въведеният от вас код е с изтекла давност.
coupon-error-limit-reached = Въведеният код е достигнал ограничението си.
coupon-error-invalid = Въведеният от вас код е недопустим.
# $couponDurationDate (Date) - The date at which the coupon is no longer valid, and the subscription is billed the list price.
coupon-enter-code =
    .placeholder = Въведете кода

## Component - Fields

default-input-error = Това поле е задължително
input-error-is-required = Изисква се { $label }

## Component - NewUserEmailForm

# "Required" to indicate that the user must use the checkbox below this text to
# agree to a payment method's terms of service and privacy notice in order to
# continue.
new-user-enter-email =
    .label = Въведете своята ел. поща
new-user-confirm-email =
    .label = Потвърждаване на адреса
new-user-subscribe-product-updates-mozilla = Бих желал да получавам продуктови новини и обновления от { -brand-mozilla }
new-user-subscribe-product-updates-snp = Бих желал да получавам новини и обновления за сигурността и поверителността от { -brand-mozilla }
new-user-subscribe-product-updates-hubs = Бих желал да получавам новини за продукти от { -product-mozilla-hubs } и { -brand-mozilla }
new-user-subscribe-product-assurance = Използваме вашия имейл единствено за създаване на профил или вход в такъв. Никога няма да го продадем на трета страна.
new-user-email-validate = Адресът на електронната поща е недействителен.
new-user-email-validate-confirm = Адресите на ел. поща не съвпадат
new-user-already-has-account-sign-in = Вече имате профил. <a>Влизане</a>

## Component - PaymentConfirmation

payment-confirmation-thanks-heading = Благодарим ви!
# $email (string) - The user's email.
# $productName (String) - The name of the subscribed product.
payment-confirmation-thanks-subheading = Потвърждаващо писмо бе изпратено до { $email } с подробности как да започнете с { $product_name }.
payment-confirmation-invoice-number = Фактура № { $invoiceNumber }
payment-confirmation-details-heading-2 = Информация за плащането
payment-confirmation-download-button = Продължете към изтегляне

## Component - PaymentConsentCheckbox

payment-confirm-checkbox-error = Трябва да завършите това, преди да продължите

## Component - PaymentErrorView

payment-error-retry-button = Опитайте отново
payment-error-manage-subscription-button = Управление на абонамент

## Component - PaymentErrorView - IAP upgrade errors

iap-upgrade-no-bundle-support = Не поддържаме надстройки за тези абонаменти, но скоро ще го направим.
iap-upgrade-contact-support = Все още имате възможност да получите този продукт — моля, свържете се с отдела за поддръжка, за да можем да ви съдействаме.

## Component - PaymentForm

payment-name =
    .placeholder = Пълно име
    .label = Името, както е изписано върху вашата карта
payment-cc =
    .label = Карта
payment-cancel-btn = Отказ
payment-update-btn = Обновяване
payment-pay-btn = Плащане
payment-validate-name-error = Въведете вашето име

## Component - PaymentProviderDetails

payment-confirmation-cc-card-ending-in = Карта, завършваща на { $last4 }

## Component - PayPalButton

pay-with-heading-paypal-2 = Плащане с { -brand-paypal }

## Component - PlanDetails

plan-details-list-price = Каталожна цена
plan-details-show-button = Показване на детайли
plan-details-hide-button = Скриване на детайли
plan-details-total-label = Всичко
plan-details-tax = Данъци и такси

## Component - PlanErrorDialog

product-no-such-plan = Няма такъв план за този продукт.

## Component - SubscriptionTitle

subscription-create-title = Настройте своя абонамент
subscription-success-title = Потвърждение на абонамента
subscription-processing-title = Потвърждаване на абонамент…
subscription-noplanchange-title = Не се поддържа подобна промяна на абонаментен план
subscription-iapsubscribed-title = Вече сте абонирани
sub-guarantee = 30-дневна гаранция за връщане на парите

## Component - TermsAndPrivacy

terms = Условия за ползване
privacy = Политика на поверителност

## App-level string(s) and messages shared by multiple components or routes

document =
    .title = Firefox Accounts
settings-subscriptions-title = Абонаменти

## Error messages

# App error dialog
general-error-heading = Обща грешка в приложението
basic-error-message = Нещо се обърка. Опитайте отново.
payment-error-1 = Хм. Възникна проблем с плащането. Опитайте отново или се свържете с издателя на картата.
payment-error-2 = Хм. Има проблем с плащането. Свържете се с издателя на картата.
payment-error-3b = Възникна неочаквана грешка при обработката на плащането, опитайте отново.
expired-card-error = Изглежда, че банковата ви карта е изтекла. Опитайте с друга карта.
insufficient-funds-error = Изглежда, че на картата ви няма достатъчно средства. Опитайте с друга карта.
withdrawal-count-limit-exceeded-error = Изглежда, че трансакцията ще надхвърли кредитния ви лимит. Опитайте с друга карта.
charge-exceeds-source-limit = Изглежда, че трансакцията ще се надхвърли дневния ви кредитен лимит. Опитайте с друга карта или след 24 часа.
coupon-expired = Изглежда, че промоционалният код е изтекъл.
country-currency-mismatch = Валутата на този абонамент не е валидна за държавата, свързана с вашето плащане.
currency-currency-mismatch = Съжаляваме, но не можете да превключвате между валути.
no-subscription-change = Съжаляваме. Не можете да променяте абонаментния си план.
# $mobileAppStore (String) - "Google Play Store" or "App Store", localized when the translation is available.
iap-already-subscribed = Вече сте абонирани през { $mobileAppStore }.
product-plan-error =
    .title = Проблем при зареждане на плановете
product-profile-error =
    .title = Проблем при зареждане на профила
product-customer-error =
    .title = Проблем при зареждане на клиентите
product-plan-not-found = Планът не е намерен

## Routes - Product and Subscriptions

sub-update-payment-title = Информация за плащането

## Routes - Product/AcceptedCards
## Used in both Routes - Checkout and Product/SubscriptionCreate

pay-with-heading-card-only = Платете с карта

## Routes - Product - Subscription upgrade

sub-change-submit = Потвърдете промяната
sub-update-current-plan-label = Текущ план
sub-update-new-plan-label = Нов план

## Routes - Subscriptions - Cancel

sub-item-cancel-sub = Прекратяване на абонамент

## Routes - Subscription

sub-route-idx-contact = Свържете се с поддръжката
sub-route-idx-cancel-msg-title = Съжаляваме, че си тръгвате.

## Routes - Subscription - ActionButton

pay-update-change-btn = Промяна
pay-update-manage-btn = Управление

## Routes - Subscriptions - Cancel and IapItem
## $priceAmount (Number) - The amount billed. It will be formatted as currency.
## $taxAmount (Number) - The tax added on, not included in amount. It will be formatted as currency.
## $date (Date) - The date for the next time a charge will occur.

sub-expires-on = Изтича на { $date }

## Routes - Subscriptions - Reactivate
## $name (String) - The name of the subscribed product.

reactivate-confirm-button = Абонирайте се отново

## $date (Date) - Last day of product access

reactivate-success-copy = Благодарим! Всичко е готово.
reactivate-success-button = Затваряне

## Routes - Subscriptions - Subscription iap item

sub-iap-item-manage-button = Управление
