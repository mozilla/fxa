## Page

checkout-signin-or-create = 1. Zaloguj się lub utwórz { -product-mozilla-account(case: "acc", capitalization: "lower") }
# This string appears as a separation between the two sign-in options, "Enter your email"(signin-form-email-input) "or"(this string) "Continue with Google"(continue-signin-with-google-button) / "Continue with Apple"(continue-signin-with-apple-button)
checkout-signin-options-or = lub
continue-signin-with-google-button = Kontynuuj za pomocą konta { -brand-google }
continue-signin-with-apple-button = Kontynuuj za pomocą konta { -brand-apple }
next-payment-method-header = Wybierz metodę płatności
# This message is used to indicate the second step in a multi step process.
payment-method-header-second-step-next = 2. { next-payment-method-header }
next-payment-method-first-approve = Najpierw musisz zatwierdzić subskrypcję
# $productName (String) - The name of the product to create subscription, e.g. Mozilla VPN
location-header = Wybierz swój kraj i wprowadź kod pocztowy, <p>aby przejść do zapłaty za { $productName }</p>
location-banner-info = Nie udało nam się automatycznie wykryć Twojej lokalizacji
location-required-disclaimer = Używamy tych informacji wyłącznie w celu wyliczenia podatków i walut.
location-banner-currency-change = Wymiana waluty nie jest obsługiwana. Aby kontynuować, wybierz kraj odpowiadający obecnej walucie rozliczeniowej.

## Page - Upgrade page

upgrade-page-payment-information = Informacje o płatnościach
# $nextInvoiceDate (number) - The date of the next invoice
upgrade-page-acknowledgment = Twój plan zmieni się natychmiast, a dzisiejsza opłata zostanie podzielona proporcjonalnie za pozostały czas tego okresu rozliczeniowego. Począwszy od { $nextInvoiceDate } opłata będzie wynosiła pełną kwotę.

## Authentication Error page

auth-error-page-title = Nie można się zalogować
checkout-error-boundary-retry-button = Spróbuj ponownie
checkout-error-boundary-basic-error-message = Coś się nie powiodło. Proszę spróbować ponownie lub <contactSupportLink>skontaktować się z zespołem wsparcia</contactSupportLink>.
amex-logo-alt-text = Logo { -brand-amex }
diners-logo-alt-text = Logo { -brand-diner }
discover-logo-alt-text = Logo { -brand-discover }
jcb-logo-alt-text = Logo { -brand-jcb }
mastercard-logo-alt-text = Logo { -brand-mastercard }
paypal-logo-alt-text = Logo { -brand-paypal }
unionpay-logo-alt-text = Logo { -brand-unionpay }
visa-logo-alt-text = Logo { -brand-visa }
# Alt text for generic payment card logo
unbranded-logo-alt-text = Logo bez marki
link-logo-alt-text = Logo { -brand-link }
apple-pay-logo-alt-text = Logo { -brand-apple-pay }
google-pay-logo-alt-text = Logo { -brand-google-pay }

## Error pages - /checkout and /upgrade
## Common strings used in multiple pages

next-payment-error-manage-subscription-button = Zarządzaj moją subskrypcją
next-iap-blocked-contact-support = Masz subskrypcję w aplikacji na telefon, która koliduje z tym produktem — prosimy o kontakt z zespołem wsparcia, abyśmy mogli Ci pomóc.
next-payment-error-retry-button = Spróbuj ponownie
next-basic-error-message = Coś się nie powiodło. Proszę spróbować ponownie później.
checkout-error-contact-support-button = Skontaktuj się z pomocą
checkout-error-not-eligible = Nie kwalifikujesz się do subskrypcji tego produktu — prosimy o kontakt z zespołem wsparcia, abyśmy mogli Ci pomóc.
checkout-error-already-subscribed = Już subskrybujesz ten produkt.
checkout-error-contact-support = Prosimy o kontakt z zespołem wsparcia, abyśmy mogli Ci pomóc.
cart-error-currency-not-determined = Nie możemy ustalić waluty dla tego zakupu. Spróbuj ponownie.
checkout-processing-general-error = Wystąpił nieoczekiwany błąd podczas przetwarzania płatności, proszę spróbować ponownie.
cart-total-mismatch-error = Kwota faktury uległa zmianie. Proszę spróbować ponownie.

## Error pages - Payment method failure messages

intent-card-error = Nie można przetworzyć transakcji. Proszę sprawdzić poprawność informacji z karty płatniczej i spróbować ponownie.
intent-expired-card-error = Wygląda na to, że karta płatnicza wygasła. Spróbuj użyć innej karty.
intent-payment-error-try-again = Wystąpił problem z upoważnieniem płatności. Spróbuj ponownie lub skontaktuj się z wystawcą karty.
intent-payment-error-get-in-touch = Wystąpił problem z upoważnieniem płatności. Skontaktuj się z wystawcą karty.
intent-payment-error-generic = Wystąpił nieoczekiwany błąd podczas przetwarzania płatności, proszę spróbować ponownie.
intent-payment-error-insufficient-funds = Wygląda na to, że na karcie są niewystarczające środki. Spróbuj użyć innej karty.
general-paypal-error = Wystąpił nieoczekiwany błąd podczas przetwarzania płatności, proszę spróbować ponownie.
paypal-active-subscription-no-billing-agreement-error = Wygląda na to, że wystąpił problem z obciążeniem Twojego konta { -brand-paypal }. Włącz ponownie automatyczne płatności za subskrypcję.

## Processing page and Needs Input page - /checkout and /upgrade
## Common strings used in multiple pages

next-payment-processing-message = Prosimy czekać na przetworzenie płatności…

## Success page - /checkout and /upgrade
## Common strings used in multiple checkout pages

next-payment-confirmation-thanks-heading-account-exists = Dzięki, teraz sprawdź pocztę!
# $email (String) - The user's email.
payment-confirmation-thanks-subheading-account-exists-2 = Otrzymasz wiadomość na adres { $email } z instrukcjami na temat subskrypcji, a także informacjami o płatności.
next-payment-confirmation-order-heading = Informacje o zamówieniu
# $invoiceNumber (String) - Invoice number of the successful payment
next-payment-confirmation-invoice-number = Faktura #{ $invoiceNumber }
# $invoiceDate (Date) - Start date of the latest invoice
next-payment-confirmation-invoice-date = { $invoiceDate }
next-payment-confirmation-details-heading-2 = Informacje o płatności

## Success pages (/checkout and /upgrade)
## Common strings used in multiple checkout pages

next-payment-confirmation-download-button = Kontynuuj, aby pobrać

## Success pages (/checkout and /upgrade), Start page (/upgrade)
## Common strings used in multiple checkout pages

# $last4 (Number) - Last four numbers of credit card
next-payment-confirmation-cc-card-ending-in = Karta kończąca się na { $last4 }

## Page - Subscription Management

subscription-management-subscriptions-heading = Subskrypcje
subscription-management-button-add-payment-method-aria = Dodaj metodę płatności
subscription-management-button-add-payment-method = Dodaj
subscription-management-button-manage-payment-method-aria = Zarządzaj metodą płatności
subscription-management-button-manage-payment-method = Zarządzaj
# $last4 (String) - Last four numbers of credit card
subscription-management-card-ending-in = Karta kończąca się na { $last4 }
# $expirationDate (Date) - Payment card's expiration date
subscription-management-card-expires-date = Wygasa { $expirationDate }
subscription-management-button-support = Pomoc
subscription-management-your-apple-iap-subscriptions-aria = Twoje subskrypcje w aplikacji { -brand-apple }
subscription-management-your-google-iap-subscriptions-aria = Twoje subskrypcje w aplikacji { -brand-google }
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscription-management-button-manage-subscription-aria = Zarządzaj subskrypcją { $productName }
paypal-payment-management-page-invalid-header = Nieprawidłowe dane płatnicze
# Page - Not Found
page-not-found-title = Nie odnaleziono strony
page-not-found-description = Nie odnaleziono żądanej strony. Powiadomiono administratora, który naprawi błędne odnośniki.
page-not-found-back-button = Wróć do poprzedniej strony

## Navigation breadcrumbs

# Link title - Account settings
subscription-management-breadcrumb-account-home = Strona główna konta
# Link title - Subscriptions management
subscription-management-breadcrumb-subscriptions = Subskrypcje

## CancelSubscription

subscription-cancellation-dialog-title = Przykro nam, że chcesz się z nami pożegnać
# $name (String) - The name of the subscribed product.
# $date (Date) - Last day of product access
subscription-cancellation-dialog-msg = Subskrypcja { $name } została anulowana. Będziesz mieć dostęp do { $name } do dnia { $date }.
subscription-cancellation-dialog-aside = Masz pytania? Odwiedź <LinkExternal>pomoc { -brand-mozilla(case: "gen") }</LinkExternal>.

## $currentPeriodEnd (Date) - The end date of the subscription's current billing period (e.g., September, 8, 2025)
## $productName (String) - The name of the subscribed product, e.g. Mozilla VPN

subscription-content-no-longer-use-message =
    Po { $currentPeriodEnd }, ostatnim dniu okresu rozliczeniowego,
    nie będzie już można używać { $productName }.
subscription-content-cancel-access-message = Anuluj mój dostęp i moje zachowane informacje w { $productName } w dniu { $currentPeriodEnd }

## Component - Payment Consent Checkbox

next-payment-confirm-with-legal-links-static-3 = Upoważniam { -brand-mozilla(case: "acc") } do pobierania wymienionej opłaty zgodnie z <termsOfServiceLink>regulaminem usługi</termsOfServiceLink> i <privacyNoticeLink>zasadami ochrony prywatności</privacyNoticeLink> oraz za pomocą wybranej przeze mnie metody płatności, dopóki nie anuluję swojej subskrypcji.
next-payment-confirm-checkbox-error = Należy to wypełnić, aby móc przejść dalej

## Checkout Form

next-new-user-submit = Subskrybuj
next-pay-with-heading-paypal = Zapłać za pomocą serwisu { -brand-paypal }

## Component - CouponForm

next-coupon-enter-code =
    .placeholder = Wpisz kod
# Title of container where a user can input a coupon code to get a discount on a subscription.
next-coupon-promo-code = Kod promocyjny
# Title of container showing discount coupon code applied to a subscription.
next-coupon-promo-code-applied = Zastosowano kod promocyjny
next-coupon-remove = Usuń
next-coupon-submit = Zastosuj

# Component - Header

payments-header-help =
    .title = Pomoc
    .aria-label = Pomoc
    .alt = Pomoc
payments-header-bento =
    .title = Produkty { -brand-mozilla(case: "gen") }
    .aria-label = Produkty { -brand-mozilla(case: "gen") }
    .alt = Logo { -brand-mozilla(case: "gen") }
payments-header-bento-close =
    .alt = Zamknij
payments-header-bento-tagline = Więcej produktów od { -brand-mozilla(case: "gen") }, które chronią Twoją prywatność
payments-header-bento-firefox-desktop = Przeglądarka { -brand-firefox } na komputery
payments-header-bento-firefox-mobile = Przeglądarka { -brand-firefox } na telefon
payments-header-bento-monitor = { -product-mozilla-monitor }
payments-header-bento-firefox-relay = { -product-firefox-relay }
payments-header-bento-vpn = { -product-mozilla-vpn }
payments-header-bento-made-by-mozilla = Tworzone przez { -brand-mozilla(case: "acc") }
payments-header-avatar =
    .title = Menu { -product-mozilla-account(case: "gen", capitalization: "lower") }
payments-header-avatar-icon =
    .alt = Zdjęcie profilowe konta
payments-header-avatar-expanded-signed-in-as = Zalogowano jako
payments-header-avatar-expanded-sign-out = Wyloguj się
payments-client-loading-spinner =
    .aria-label = Wczytywanie…
    .alt = Wczytywanie…

## Payment method management page - Stripe

# Save button for changing which payment method will be used
payment-method-management-save-default = Ustaw jako domyślną metodę płatności
# Save button for saving a new payment method
payment-method-management-save-method = Zachowaj metodę płatności
manage-stripe-payments-title = Zarządzaj metodami płatności

## Component - PurchaseDetails

next-plan-details-header = Informacje o produkcie
next-plan-details-list-price = Cena katalogowa
# $productName (String) - The name of the product, e.g. Mozilla VPN
plan-details-product-prorated-price = Cena podzielona proporcjonalnie za { $productName }
next-plan-details-tax = Podatki i opłaty
next-plan-details-total-label = Razem
# "Unused time" refers to the remaining value of the current subscription that hasn't been used yet
purchase-details-unused-time-label = Środki za niewykorzystany czas
purchase-details-subtotal-label = Suma częściowa
# "Credit applied" refers to account credit used to reduce the amount due on the invoice
purchase-details-credit-applied-label = Zastosowano środki
# "Total due" is the total that the customer owes after all credits, discounts, and taxes have been applied
purchase-details-total-due-label = Całkowita kwota do zapłaty
next-plan-details-hide-button = Ukryj informacje
next-plan-details-show-button = Wyświetl informacje
next-coupon-success = Twój plan będzie automatycznie odnawiany po cenie katalogowej.
# $couponDurationDate (Date) - The date at which the coupon is no longer valid, and the subscription is billed the list price.
next-coupon-success-repeating = Po { $couponDurationDate } Twój plan będzie automatycznie odnawiany po cenie katalogowej.

## Select Tax Location

select-tax-location-title = Położenie
select-tax-location-edit-button = Edytuj
select-tax-location-save-button = Zachowaj
select-tax-location-continue-to-checkout-button = Przejdź do kasy
select-tax-location-country-code-label = Kraj
select-tax-location-country-code-placeholder = Wybierz kraj
select-tax-location-error-missing-country-code = Proszę wybrać kraj
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN
select-tax-location-product-not-available = { $productName } nie jest dostępne w tym położeniu.
select-tax-location-postal-code-label = Kod pocztowy
select-tax-location-postal-code =
    .placeholder = Wpisz kod pocztowy
select-tax-location-error-missing-postal-code = Proszę wpisać kod pocztowy
select-tax-location-error-invalid-postal-code = Proszę wpisać prawidłowy kod pocztowy
select-tax-location-successfully-updated = Położenie zostało zaktualizowane.
select-tax-location-error-location-not-updated = Nie można zaktualizować położenia. Proszę spróbować ponownie.
#  $currencyDisplayName (String) - The display name of a currency code, e.g. US Dollar
select-tax-location-invalid-currency-change = Twoje konto jest rozliczane w walucie „{ $currencyDisplayName }”. Wybierz kraj, który używa tej waluty.
select-tax-location-invalid-currency-change-default = Wybierz kraj zgodny z walutą aktywnych subskrypcji.
select-tax-location-new-tax-rate-info = Po zmianie położenia nowa stawka podatku zostanie zastosowana do wszystkich aktywnych subskrypcji na koncie, zaczynając od kolejnego cyklu rozliczeniowego.
signin-form-continue-button = Kontynuuj
signin-form-email-input = Wpisz adres e-mail
signin-form-email-input-missing = Proszę wpisać adres e-mail
signin-form-email-input-invalid = Proszę podać prawidłowy adres e-mail
next-new-user-subscribe-product-updates-mdnplus = Chcę otrzymywać aktualności i aktualizacje o produktach od { -product-mdn-plus } i { -brand-mozilla(case: "gen") }
next-new-user-subscribe-product-updates-mozilla = Chcę otrzymywać aktualności i aktualizacje o produktach od { -brand-mozilla(case: "gen") }
next-new-user-subscribe-product-updates-snp = Chcę otrzymywać aktualności i aktualizacje na temat bezpieczeństwa i prywatności od { -brand-mozilla(case: "gen") }
next-new-user-subscribe-product-assurance = Używamy Twojego adresu e-mail wyłącznie do utworzenia konta. Nigdy nie sprzedamy go komuś innemu.

## $productName (String) - The name of the subscribed product.

resubscribe-success-dialog-title = Dzięki! Wszystko gotowe.

## $billOnDate (Date) - The billing date of the current invoice (e.g., September 8, 2025)
## $creditApplied (Number) - The amount from account credit balance used to reduce the amount due on the invoice
## $currentPeriodEnd (Date) - The end date of the subscription's current billing period (e.g., September, 8, 2025)
## $invoiceTotal (Number) - The amount billed (excluding tax if tax does not exist). It will be formatted as currency.
## $nextBillDate (Date) - The date for the next time a charge will occur (e.g., September 8, 2025)
## $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
## $promotionName (String) - The name of the promotion.
## $taxDue (Number) - The tax added on, not included in amount. It will be formatted as currency.

subscription-content-button-stay-subscribed = Nie rezygnuj z subskrypcji
    .aria-label = Nie rezygnuj z subskrypcji { $productName }
subscription-content-button-cancel-subscription = Anuluj subskrypcję
    .aria-label = Anuluj subskrypcję { $productName }

##

subscription-content-cancel-action-error = Wystąpił nieoczekiwany błąd. Spróbuj ponownie.

## PriceInterval - shared by multiple components, including Details and PurchaseDetails
## $amount (Number) - The amount billed. It will be formatted as currency.

plan-price-interval-daily = { $amount } dziennie
plan-price-interval-weekly = { $amount } tygodniowo
plan-price-interval-monthly = { $amount } miesięcznie
plan-price-interval-halfyearly = { $amount } co 6 miesięcy
plan-price-interval-yearly = { $amount } rocznie

## Component - SubscriptionTitle

next-subscription-create-title = Skonfiguruj swoją subskrypcję
next-subscription-success-title = Potwierdzenie subskrypcji
next-subscription-processing-title = Potwierdzanie subskrypcji…
next-subscription-error-title = Błąd podczas potwierdzania subskrypcji…
subscription-title-sub-exists = Już subskrybujesz
subscription-title-plan-change-heading = Sprawdź zmianę
subscription-title-not-supported = Ta zmiana planu subskrypcji nie jest obsługiwana
next-sub-guarantee = 30-dniowa gwarancja zwrotu pieniędzy

## Component - TermsAndPrivacy

# "Mozilla Accounts" is capitalized in this instance for title case in English
# This heading is followed by links to Terms of Service and Privacy Notice
next-subplat-mozilla-accounts-legal-heading = { -product-mozilla-accounts(case: "nom", capitalization: "upper") }
next-terms = Regulamin usługi
next-privacy = Zasady ochrony prywatności
next-terms-download = Warunki pobierania
terms-and-privacy-stripe-label = { -brand-mozilla } korzysta z serwisu { -brand-name-stripe } do bezpiecznego przetwarzania płatności.
terms-and-privacy-stripe-link = Zasady ochrony prywatności serwisu { -brand-name-stripe }
terms-and-privacy-paypal-label = { -brand-mozilla } korzysta z serwisu { -brand-paypal } do bezpiecznego przetwarzania płatności.
terms-and-privacy-paypal-link = Zasady ochrony prywatności serwisu { -brand-paypal }
terms-and-privacy-stripe-and-paypal-label = { -brand-mozilla } korzysta z serwisów { -brand-name-stripe } i { -brand-paypal } do bezpiecznego przetwarzania płatności.

## Component - UpdatedPurchaseDetails

upgrade-purchase-details-current-plan-label = Obecny plan
upgrade-purchase-details-new-plan-label = Nowy plan
upgrade-purchase-details-promo-code = Kod promocyjny
upgrade-purchase-details-tax-label = Podatki i opłaty
# "Credit issued to account" refers to credit that will be added to the account balance that will be used toward future invoices
upgrade-purchase-details-credit-to-account = Środki wystawione na konto
upgrade-purchase-details-credit-will-be-applied = Środki zostaną zastosowane na koncie i użyte na poczet przyszłych faktur.

## $productName (String) - Name of the upgraded product (e.g. Mozilla VPN)
## Daily/Weekly/Monthly/Yearly refers to the subscription interval/amount of time between billing occurrences

upgrade-purchase-details-new-plan-daily = { $productName } (dziennie)
upgrade-purchase-details-new-plan-weekly = { $productName } (tygodniowo)
upgrade-purchase-details-new-plan-monthly = { $productName } (miesięcznie)
upgrade-purchase-details-new-plan-halfyearly = { $productName } (co 6 miesięcy)
upgrade-purchase-details-new-plan-yearly = { $productName } (rocznie)

## Page Metadata Information
## $productTitle (String) - The name of the product to create subscription, e.g. Mozilla VPN

# Checkout start
metadata-title-checkout-start = Kasa | { $productTitle }
metadata-description-checkout-start = Wprowadź dane płatności, aby dokończyć zakup.
# Checkout processing
metadata-title-checkout-processing = Przetwarzanie | { $productTitle }
metadata-description-checkout-processing = Prosimy czekać na ukończenie przetwarzania płatności.
# Checkout error
metadata-title-checkout-error = Błąd | { $productTitle }
metadata-description-checkout-error = Wystąpił błąd podczas przetwarzania subskrypcji. Jeśli ten problem będzie się powtarzał, skontaktuj się z zespołem wsparcia.
# Checkout success
metadata-title-checkout-success = Powodzenie | { $productTitle }
metadata-description-checkout-success = Gratulacje! Pomyślnie dokonano zakupu.
# Checkout needs_input
metadata-title-checkout-needs-input = Wymagane jest działanie | { $productTitle }
metadata-description-checkout-needs-input = Aby dokonać płatności, wykonaj wymagane czynności.
# Upgrade start
metadata-title-upgrade-start = Przełączenie subskrypcji | { $productTitle }
metadata-description-upgrade-start = Wprowadź dane płatności, aby dokończyć przełączenie subskrypcji.
# Upgrade processing
metadata-title-upgrade-processing = Przetwarzanie | { $productTitle }
metadata-description-upgrade-processing = Prosimy czekać na ukończenie przetwarzania płatności.
# Upgrade error
metadata-title-upgrade-error = Błąd | { $productTitle }
metadata-description-upgrade-error = Wystąpił błąd podczas przetwarzania przełączenia subskrypcji. Jeśli ten problem będzie się powtarzał, skontaktuj się z zespołem wsparcia.
# Upgrade success
metadata-title-upgrade-success = Powodzenie | { $productTitle }
metadata-description-upgrade-success = Gratulacje! Subskrypcja została pomyślnie przełączona.
# Upgrade needs_input
metadata-title-upgrade-needs-input = Wymagane jest działanie | { $productTitle }
metadata-description-upgrade-needs-input = Aby dokonać płatności, wykonaj wymagane czynności.
# Default
metadata-title-default = Nie odnaleziono strony | { $productTitle }
metadata-description-default = Otwierana strona nie została odnaleziona.

## Coupon Error Messages

next-coupon-error-cannot-redeem = Wprowadzonego kodu nie można wykorzystać — na Twoim koncie jest już wcześniejsza subskrypcja jednej z naszych usług.
next-coupon-error-expired = Wpisany kod wygasł.
next-coupon-error-generic = Wystąpił błąd podczas przetwarzania kodu. Proszę spróbować ponownie.
next-coupon-error-invalid = Wpisany kod jest nieprawidłowy.
# "Limit" refers to the maximum number of times a coupon can be redeemed.
next-coupon-error-limit-reached = Wpisany kod osiągnął swoje ograniczenie.
