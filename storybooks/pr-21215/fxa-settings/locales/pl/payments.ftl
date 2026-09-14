# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.


## Component - AppLayout

settings-home = Strona główna konta
settings-project-header-title = { -product-mozilla-account(case: "nom", capitalization: "upper") }

## Component - CouponForm

# Title of container showing discount coupon code applied to a subscription.
coupon-promo-code-applied = Zastosowano kod promocyjny
coupon-submit = Zastosuj
coupon-remove = Usuń
coupon-error = Wpisany kod jest nieprawidłowy lub wygasł.
coupon-error-generic = Wystąpił błąd podczas przetwarzania kodu. Proszę spróbować ponownie.
coupon-error-expired = Wpisany kod wygasł.
coupon-error-limit-reached = Wpisany kod osiągnął swoje ograniczenie.
coupon-error-invalid = Wpisany kod jest nieprawidłowy.
# $couponDurationDate (Date) - The date at which the coupon is no longer valid, and the subscription is billed the list price.
coupon-enter-code =
    .placeholder = Wpisz kod

## Component - Fields

default-input-error = To pole jest wymagane
input-error-is-required = Pole „{ $label }” jest wymagane

## Component - Header

brand-name-mozilla-logo = Logo { -brand-mozilla(case: "gen") }

## Component - NewUserEmailForm

new-user-sign-in-link-2 = Masz już { -product-mozilla-account(case: "acc", capitalization: "lower") }? <a>Zaloguj się</a>
# "Required" to indicate that the user must use the checkbox below this text to
# agree to a payment method's terms of service and privacy notice in order to
# continue.
new-user-enter-email =
    .label = Wpisz adres e-mail
new-user-confirm-email =
    .label = Potwierdź adres e-mail
new-user-subscribe-product-updates-mozilla = Chcę otrzymywać aktualności i aktualizacje o produktach od { -brand-mozilla(case: "gen") }
new-user-subscribe-product-updates-snp = Chcę otrzymywać aktualności i aktualizacje na temat bezpieczeństwa i prywatności od { -brand-mozilla(case: "gen") }
new-user-subscribe-product-updates-hubs = Chcę otrzymywać aktualności i aktualizacje o produktach od { -product-mozilla-hubs } i { -brand-mozilla(case: "gen") }
new-user-subscribe-product-updates-mdnplus = Chcę otrzymywać aktualności i aktualizacje o produktach od { -product-mdn-plus } i { -brand-mozilla(case: "gen") }
new-user-subscribe-product-assurance = Używamy Twojego adresu e-mail wyłącznie do utworzenia konta. Nigdy nie sprzedamy go komuś innemu.
new-user-email-validate = Adres e-mail jest nieprawidłowy
new-user-email-validate-confirm = Adresy e-mail się nie zgadzają
new-user-already-has-account-sign-in = Masz już konto. <a>Zaloguj się</a>
# $domain (String) - the email domain provided by the user during sign up
new-user-invalid-email-domain = Błąd w adresie e-mail? { $domain } nie oferuje usług pocztowych.

## Component - PaymentConfirmation

payment-confirmation-thanks-heading = Dziękujemy!
payment-confirmation-thanks-heading-account-exists = Dzięki, teraz sprawdź pocztę!
# $email (string) - The user's email.
# $productName (String) - The name of the subscribed product.
payment-confirmation-thanks-subheading = Na adres { $email } wysłano wiadomość z potwierdzeniem i informacjami, jak zacząć używać { $product_name }.
# $email (string) - The user's email.
payment-confirmation-thanks-subheading-account-exists = Otrzymasz wiadomość na adres { $email } z instrukcjami konfiguracji konta, a także informacjami o płatności.
payment-confirmation-order-heading = Informacje o zamówieniu
payment-confirmation-invoice-number = Faktura #{ $invoiceNumber }
# $invoiceDate (Date) - Start date of the latest invoice
payment-confirmation-invoice-date = { $invoiceDate }
payment-confirmation-details-heading-2 = Informacje o płatności
payment-confirmation-amount = { $amount } co { $interval }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in days.
payment-confirmation-amount-day =
    { $intervalCount ->
        [one] { $amount } dziennie
        [few] { $amount } co { $intervalCount } dni
       *[many] { $amount } co { $intervalCount } dni
    }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in weeks.
payment-confirmation-amount-week =
    { $intervalCount ->
        [one] { $amount } tygodniowo
        [few] { $amount } co { $intervalCount } tygodnie
       *[many] { $amount } co { $intervalCount } tygodni
    }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in months.
payment-confirmation-amount-month =
    { $intervalCount ->
        [one] { $amount } miesięcznie
        [few] { $amount } co { $intervalCount } miesiące
       *[many] { $amount } co { $intervalCount } miesięcy
    }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in years.
payment-confirmation-amount-year =
    { $intervalCount ->
        [one] { $amount } rocznie
        [few] { $amount } co { $intervalCount } lata
       *[many] { $amount } co { $intervalCount } lat
    }
payment-confirmation-download-button = Kontynuuj, aby pobrać

## Component - PaymentConsentCheckbox

payment-confirm-with-legal-links-static-3 = Upoważniam { -brand-mozilla(case: "acc") } do pobierania wymienionej opłaty zgodnie z <termsOfServiceLink>regulaminem usługi</termsOfServiceLink> i <privacyNoticeLink>zasadami ochrony prywatności</privacyNoticeLink> oraz za pomocą wybranej przeze mnie metody płatności, dopóki nie anuluję swojej subskrypcji.
payment-confirm-checkbox-error = Należy to wypełnić, aby móc przejść dalej

## Component - PaymentErrorView

payment-error-retry-button = Spróbuj ponownie
payment-error-manage-subscription-button = Zarządzaj moją subskrypcją

## Component - PaymentErrorView - IAP upgrade errors

# $productName (String) - The name of the subscribed product.
iap-upgrade-already-subscribed-2 = Masz już subskrypcję { $productName } w sklepie z aplikacjami { -brand-google } lub { -brand-apple }.
iap-upgrade-no-bundle-support = Nie obsługujemy przełączania z tych subskrypcji, ale wkrótce się to zmieni.
iap-upgrade-contact-support = Nadal możesz otrzymać ten produkt — prosimy o kontakt z zespołem wsparcia, abyśmy mogli Ci pomóc.
iap-upgrade-get-help-button = Wsparcie

## Component - PaymentForm

payment-name =
    .placeholder = Imię i nazwisko
    .label = Imię i nazwisko, tak jak jest wydrukowane na karcie
payment-cc =
    .label = Twoja karta
payment-cancel-btn = Anuluj
payment-update-btn = Aktualizuj
payment-pay-btn = Zapłać teraz
payment-pay-with-paypal-btn-2 = Zapłać za pomocą serwisu { -brand-paypal }
payment-validate-name-error = Proszę podać swoje imię i nazwisko

## Component - PaymentLegalBlurb

payment-legal-copy-stripe-and-paypal-3 = { -brand-mozilla } korzysta z serwisów { -brand-name-stripe } i { -brand-paypal } do bezpiecznego przetwarzania płatności.
payment-legal-link-stripe-paypal-2 = <stripePrivacyLink>Zasady ochrony prywatności firmy { -brand-name-stripe }</stripePrivacyLink> &nbsp; <paypalPrivacyLink>Zasady ochrony prywatności firmy { -brand-paypal }</paypalPrivacyLink>.
payment-legal-copy-paypal-2 = { -brand-mozilla } korzysta z serwisu { -brand-paypal } do bezpiecznego przetwarzania płatności.
payment-legal-link-paypal-3 = <paypalPrivacyLink>Zasady ochrony prywatności firmy { -brand-paypal }</paypalPrivacyLink>.
payment-legal-copy-stripe-3 = { -brand-mozilla } korzysta z serwisu { -brand-name-stripe } do bezpiecznego przetwarzania płatności.
payment-legal-link-stripe-3 = <stripePrivacyLink>Zasady ochrony prywatności firmy { -brand-name-stripe }</stripePrivacyLink>.

## Component - PaymentMethodHeader

payment-method-header = Wybierz metodę płatności
# This message is used to indicate the second step in a multi step process.
payment-method-header-second-step = 2. { payment-method-header }
payment-method-first-approve = Najpierw musisz zatwierdzić subskrypcję

## Component - PaymentProcessing

payment-processing-message = Prosimy czekać na przetworzenie płatności…

## Component - PaymentProviderDetails

payment-confirmation-cc-card-ending-in = Karta kończąca się na { $last4 }

## Component - PayPalButton

pay-with-heading-paypal-2 = Zapłać za pomocą serwisu { -brand-paypal }

## Component - PlanDetails

plan-details-header = Informacje o produkcie
plan-details-list-price = Cena katalogowa
plan-details-show-button = Wyświetl informacje
plan-details-hide-button = Ukryj informacje
plan-details-total-label = Razem
plan-details-tax = Podatki i opłaty

## Component - PlanErrorDialog

product-no-such-plan = Nie ma takiego planu dla tego produktu.

## Price details including tax
## $priceAmount (Number) - The amount billed. It will be formatted as currency.
## $taxAmount (Number) - The tax added on, not included in amount. It will be formatted as currency.

price-details-no-tax = { $priceAmount }
price-details-tax = { $priceAmount } + { $taxAmount } podatku
# $intervalCount (Number) - The interval between payments, in days.
price-details-no-tax-day =
    { $intervalCount ->
        [one] { $priceAmount } dziennie
        [few] { $priceAmount } co { $intervalCount } dni
       *[many] { $priceAmount } co { $intervalCount } dni
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } dziennie
            [few] { $priceAmount } co { $intervalCount } dni
           *[many] { $priceAmount } co { $intervalCount } dni
        }
# $intervalCount (Number) - The interval between payments, in weeks.
price-details-no-tax-week =
    { $intervalCount ->
        [one] { $priceAmount } tygodniowo
        [few] { $priceAmount } co { $intervalCount } tygodnie
       *[many] { $priceAmount } co { $intervalCount } tygodni
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } tygodniowo
            [few] { $priceAmount } co { $intervalCount } tygodnie
           *[many] { $priceAmount } co { $intervalCount } tygodni
        }
# $intervalCount (Number) - The interval between payments, in months.
price-details-no-tax-month =
    { $intervalCount ->
        [one] { $priceAmount } miesięcznie
        [few] { $priceAmount } co { $intervalCount } miesiące
       *[many] { $priceAmount } co { $intervalCount } miesięcy
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } miesięcznie
            [few] { $priceAmount } co { $intervalCount } miesiące
           *[many] { $priceAmount } co { $intervalCount } miesięcy
        }
# $intervalCount (Number) - The interval between payments, in years.
price-details-no-tax-year =
    { $intervalCount ->
        [one] { $priceAmount } rocznie
        [few] { $priceAmount } co { $intervalCount } lata
       *[many] { $priceAmount } co { $intervalCount } lat
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } rocznie
            [few] { $priceAmount } co { $intervalCount } lata
           *[many] { $priceAmount } co { $intervalCount } lat
        }
# $intervalCount (Number) - The interval between payments, in days.
price-details-tax-day =
    { $intervalCount ->
        [one] { $priceAmount } + { $taxAmount } podatku dziennie
        [few] { $priceAmount } + { $taxAmount } podatku co { $intervalCount } dni
       *[many] { $priceAmount } + { $taxAmount } podatku co { $intervalCount } dni
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + { $taxAmount } podatku dziennie
            [few] { $priceAmount } + { $taxAmount } podatku co { $intervalCount } dni
           *[many] { $priceAmount } + { $taxAmount } podatku co { $intervalCount } dni
        }
# $intervalCount (Number) - The interval between payments, in weeks.
price-details-tax-week =
    { $intervalCount ->
        [one] { $priceAmount } + { $taxAmount } podatku tygodniowo
        [few] { $priceAmount } + { $taxAmount } podatku co { $intervalCount } tygodnie
       *[many] { $priceAmount } + { $taxAmount } podatku co { $intervalCount } tygodni
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + { $taxAmount } podatku tygodniowo
            [few] { $priceAmount } + { $taxAmount } podatku co { $intervalCount } tygodnie
           *[many] { $priceAmount } + { $taxAmount } podatku co { $intervalCount } tygodni
        }
# $intervalCount (Number) - The interval between payments, in months.
price-details-tax-month =
    { $intervalCount ->
        [one] { $priceAmount } + { $taxAmount } podatku miesięcznie
        [few] { $priceAmount } + { $taxAmount } podatku co { $intervalCount } miesiące
       *[many] { $priceAmount } + { $taxAmount } podatku co { $intervalCount } miesięcy
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + { $taxAmount } podatku miesięcznie
            [few] { $priceAmount } + { $taxAmount } podatku co { $intervalCount } miesiące
           *[many] { $priceAmount } + { $taxAmount } podatku co { $intervalCount } miesięcy
        }
# $intervalCount (Number) - The interval between payments, in years.
price-details-tax-year =
    { $intervalCount ->
        [one] { $priceAmount } + { $taxAmount } podatku rocznie
        [few] { $priceAmount } + { $taxAmount } podatku co { $intervalCount } lata
       *[many] { $priceAmount } + { $taxAmount } podatku co { $intervalCount } lat
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + { $taxAmount } podatku rocznie
            [few] { $priceAmount } + { $taxAmount } podatku co { $intervalCount } lata
           *[many] { $priceAmount } + { $taxAmount } podatku co { $intervalCount } lat
        }

## Component - SubscriptionTitle

subscription-create-title = Skonfiguruj swoją subskrypcję
subscription-success-title = Potwierdzenie subskrypcji
subscription-processing-title = Potwierdzanie subskrypcji…
subscription-error-title = Błąd podczas potwierdzania subskrypcji…
subscription-noplanchange-title = Ta zmiana planu subskrypcji nie jest obsługiwana
subscription-iapsubscribed-title = Już subskrybowane
sub-guarantee = 30-dniowa gwarancja zwrotu pieniędzy

## Component - TermsAndPrivacy

# "Mozilla Accounts" is capitalized in this instance for title case in English
# This heading is followed by links to Terms of Service and Privacy Notice
subplat-mozilla-accounts-legal-heading = { -product-mozilla-accounts(case: "nom", capitalization: "upper") }
terms = Regulamin usługi
privacy = Zasady ochrony prywatności
terms-download = Warunki pobierania

## App-level string(s) and messages shared by multiple components or routes

document =
    .title = Konta Firefoksa
# General aria-label for closing modals
close-aria =
    .aria-label = Zamknij okno
settings-subscriptions-title = Subskrypcje
# Title of container where a user can input a coupon code to get a discount on a subscription.
coupon-promo-code = Kod promocyjny

## Subscription upgrade plan details - shared by multiple components, including plan details and payment form
## $amount (Number) - The amount billed. It will be formatted as currency.

# $intervalCount (Number) - The interval between payments, in days.
plan-price-interval-day =
    { $intervalCount ->
        [one] { $amount } dziennie
        [few] { $amount } co { $intervalCount } dni
       *[many] { $amount } co { $intervalCount } dni
    }
    .title =
        { $intervalCount ->
            [one] { $amount } dziennie
            [few] { $amount } co { $intervalCount } dni
           *[many] { $amount } co { $intervalCount } dni
        }
# $intervalCount (Number) - The interval between payments, in weeks.
plan-price-interval-week =
    { $intervalCount ->
        [one] { $amount } tygodniowo
        [few] { $amount } co { $intervalCount } tygodnie
       *[many] { $amount } co { $intervalCount } tygodni
    }
    .title =
        { $intervalCount ->
            [one] { $amount } tygodniowo
            [few] { $amount } co { $intervalCount } tygodnie
           *[many] { $amount } co { $intervalCount } tygodni
        }
# $intervalCount (Number) - The interval between payments, in months.
plan-price-interval-month =
    { $intervalCount ->
        [one] { $amount } miesięcznie
        [few] { $amount } co { $intervalCount } miesiące
       *[many] { $amount } co { $intervalCount } mięsięcy
    }
    .title =
        { $intervalCount ->
            [one] { $amount } miesięcznie
            [few] { $amount } co { $intervalCount } miesiące
           *[many] { $amount } co { $intervalCount } mięsięcy
        }
# $intervalCount (Number) - The interval between payments, in years.
plan-price-interval-year =
    { $intervalCount ->
        [one] { $amount } rocznie
        [few] { $amount } co { $intervalCount } lata
       *[many] { $amount } co { $intervalCount } lat
    }
    .title =
        { $intervalCount ->
            [one] { $amount } rocznie
            [few] { $amount } co { $intervalCount } lata
           *[many] { $amount } co { $intervalCount } lat
        }

## Error messages

# App error dialog
general-error-heading = Ogólny błąd aplikacji
basic-error-message = Coś się nie powiodło. Proszę spróbować ponownie później.
payment-error-1 = Wystąpił problem z upoważnieniem płatności. Spróbuj ponownie lub skontaktuj się z wystawcą karty.
payment-error-2 = Wystąpił problem z upoważnieniem płatności. Skontaktuj się z wystawcą karty.
payment-error-3b = Wystąpił nieoczekiwany błąd podczas przetwarzania płatności, proszę spróbować ponownie.
expired-card-error = Wygląda na to, że karta płatnicza wygasła. Spróbuj użyć innej karty.
insufficient-funds-error = Wygląda na to, że karta ma niewystarczające środki. Spróbuj użyć innej karty.
withdrawal-count-limit-exceeded-error = Wygląda na to, że ta transakcja spowoduje przekroczenie limitu kredytowego. Spróbuj użyć innej karty.
charge-exceeds-source-limit = Wygląda na to, że ta transakcja spowoduje przekroczenie dziennego limitu kredytowego. Spróbuj użyć innej karty lub tej samej za 24 godziny.
instant-payouts-unsupported = Wygląda na to, że karta debetowa nie jest skonfigurowana do obsługi natychmiastowych płatności. Spróbuj użyć innej karty debetowej lub płatniczej.
duplicate-transaction = Wygląda na to, że właśnie wysłano identyczną transakcję. Sprawdź swoją historię płatności.
coupon-expired = Wygląda na to, że ten kod promocyjny wygasł.
card-error = Nie można przetworzyć transakcji. Sprawdź poprawność informacji z karty płatniczej i spróbuj ponownie.
country-currency-mismatch = Waluta tej subskrypcji nie jest prawidłowa w kraju powiązanym z płatnością.
currency-currency-mismatch = Przepraszamy. Nie można zmieniać waluty.
location-unsupported = Twoje obecne położenie jest nieobsługiwane zgodnie z naszym regulaminem usługi.
no-subscription-change = Przepraszamy. Nie można zmieniać planu subskrypcji.
# $mobileAppStore (String) - "Google Play Store" or "App Store", localized when the translation is available.
iap-already-subscribed = Masz już subskrypcję przez { $mobileAppStore }.
# $productName (String) - The name of the subscribed product.
fxa-account-signup-error-2 = Błąd systemu spowodował, że rejestracja { $productName } się nie powiodła. Metoda płatności nie została obciążona. Proszę spróbować ponownie.
fxa-post-passwordless-sub-error = Subskrypcja została potwierdzona, ale wczytanie strony potwierdzenia się nie powiodło. Sprawdź pocztę, aby skonfigurować konto.
newsletter-signup-error = Nie zapisano na wiadomości o produktach. Można spróbować ponownie w ustawieniach konta.
product-plan-error =
    .title = Problem podczas wczytywania planów
product-profile-error =
    .title = Problem podczas wczytywania profilu
product-customer-error =
    .title = Problem podczas wczytywania klienta
product-plan-not-found = Nie odnaleziono planu
product-location-unsupported-error = Nieobsługiwane położenie

## Hooks - coupons

coupon-success = Twój plan będzie automatycznie odnawiany po cenie katalogowej.
# $couponDurationDate (Date) - The date at which the coupon is no longer valid, and the subscription is billed the list price.
coupon-success-repeating = Po { $couponDurationDate } Twój plan będzie automatycznie odnawiany po cenie katalogowej.

## Routes - Checkout - New user

new-user-step-1-2 = 1. Utwórz { -product-mozilla-account(case: "acc", capitalization: "lower") }
new-user-card-title = Podaj informacje o karcie
new-user-submit = Subskrybuj

## Routes - Product and Subscriptions

sub-update-payment-title = Informacje o płatności

## Routes - Product/AcceptedCards
## Used in both Routes - Checkout and Product/SubscriptionCreate

pay-with-heading-card-only = Zapłać kartą
product-invoice-preview-error-title = Problem podczas wczytywania podglądu faktury
product-invoice-preview-error-text = Nie można wczytać podglądu faktury

## Routes - Product - IapRoadblock

subscription-iaperrorupgrade-title = Jeszcze nie możemy Cię przełączyć

# The following are not terms because they are not used directly in messages,
# but rather looked up in code and passed into the message as variables.

brand-name-google-play-2 = Sklep { -google-play }
brand-name-apple-app-store-2 = { -app-store }

## Routes - Product - Subscription upgrade

product-plan-change-heading = Sprawdź zmianę
sub-change-failed = Zmiana planu się nie powiodła
sub-update-acknowledgment =
    Twój plan zmieni się natychmiast, a dzisiejsza opłata zostanie podzielona proporcjonalnie
    za pozostały czas tego okresu rozliczeniowego. Począwszy od { $startingDate }
    opłata będzie wynosiła pełną kwotę.
sub-change-submit = Potwierdź zmianę
sub-update-current-plan-label = Obecny plan
sub-update-new-plan-label = Nowy plan
sub-update-total-label = Nowa suma
sub-update-prorated-upgrade = Przełączenie podzielone proporcjonalnie

## Checkout line item for subscription plan change listing the product name and frequency of payment
## For example, a Mozilla VPN subscription charged monthly would appear as: Mozilla VPN (Monthly)
## Variables:
##   $productName (String) - Name of the upgraded product (e.g. Mozilla VPN)

sub-update-new-plan-daily = { $productName } (dziennie)
sub-update-new-plan-weekly = { $productName } (tygodniowo)
sub-update-new-plan-monthly = { $productName } (miesięcznie)
sub-update-new-plan-yearly = { $productName } (rocznie)
sub-update-prorated-upgrade-credit = Widoczne ujemne saldo zostanie zastosowane jako środki na koncie, które zostaną użyte na poczet przyszłych faktur.

## Routes - Subscriptions - Cancel

sub-item-cancel-sub = Anuluj subskrypcję
sub-item-stay-sub = Nie rezygnuj z subskrypcji

## $name (String) - The name of the subscribed product.
## $period (Date) - The last day of product access

sub-item-cancel-msg =
    Po { $period }, ostatnim dniu okresu rozliczeniowego,
    nie będzie już można używać { $name }.
sub-item-cancel-confirm =
    Anuluj mój dostęp i moje zachowane informacje
    w { $name } w dniu { $period }
# $promotion_name (String) - The name of the promotion.
# The <priceDetails></priceDetails> component acts as a placeholder and could use one of the following IDs:
# price-details-tax-${interval},
# price-details-no-tax-${interval},
# price-details-tax,
# price-details-no-tax
# Examples:
# 20% OFF coupon applied: $11.20 + $0.35 tax monthly
# Holiday Offer 2023 coupon applied: $11.20 monthly
# Cybersecurity Awareness Month 2023 coupon applied: $11.20 + $0.35 tax
# Summer Promo VPN coupon applied: $11.20
sub-promo-coupon-applied = Dodano rabat „{ $promotion_name }”: <priceDetails></priceDetails>
subscription-management-account-credit-balance = Ta płatność za subskrypcję spowodowała dodanie środków na koncie: <priceDetails></priceDetails>

## Routes - Subscription

sub-route-idx-reactivating = Ponowna aktywacja subskrypcji się nie powiodła
sub-route-idx-cancel-failed = Anulowanie subskrypcji się nie powiodło
sub-route-idx-contact = Skontaktuj się z pomocą
sub-route-idx-cancel-msg-title = Przykro nam, że chcesz się z nami pożegnać
# $name (String) - The name of the subscribed product.
# $date (Date) - Last day of product access
sub-route-idx-cancel-msg =
    Subskrypcja { $name } została anulowana.
          <br />
          Będziesz mieć dostęp do { $name } do dnia { $date }.
sub-route-idx-cancel-aside-2 = Masz pytania? Odwiedź <a>pomoc { -brand-mozilla(case: "gen") }</a>.

## Routes - Subscriptions - Errors

sub-customer-error =
    .title = Problem podczas wczytywania klienta
sub-invoice-error =
    .title = Problem podczas wczytywania faktur
sub-billing-update-success = Pomyślnie zaktualizowano dane płatnicze
sub-invoice-previews-error-title = Problem podczas wczytywania podglądu faktur
sub-invoice-previews-error-text = Nie można wczytać podglądu faktur

## Routes - Subscription - ActionButton

pay-update-change-btn = Zmień
pay-update-manage-btn = Zarządzaj

## Routes - Subscriptions - Cancel and IapItem
## $priceAmount (Number) - The amount billed. It will be formatted as currency.
## $taxAmount (Number) - The tax added on, not included in amount. It will be formatted as currency.
## $date (Date) - The date for the next time a charge will occur.

sub-next-bill = Następna płatność: { $date }
sub-next-bill-due-date = Termin następnej płatności: { $date }
sub-expires-on = Wygasa: { $date }

## Routes - Subscription - PaymentUpdate


# $expirationDate (Date) - The payment card's expiration date.

pay-update-card-exp = Wygasa { $expirationDate }
sub-route-idx-updating = Aktualizowanie danych płatniczych…
sub-route-payment-modal-heading = Nieprawidłowe dane płatnicze
sub-route-payment-modal-message-2 = Wygląda na to, że wystąpił błąd na Twoim koncie { -brand-paypal }. Musisz podjąć niezbędne kroki, aby rozwiązać ten problem z płatnością.
sub-route-missing-billing-agreement-payment-alert = Nieprawidłowe informacje o płatności — wystąpił błąd na Twoim koncie. <div>Zarządzaj</div>
sub-route-funding-source-payment-alert = Nieprawidłowe informacje o płatności — wystąpił błąd na Twoim koncie. To powiadomienie może być widoczne jeszcze przez jakiś czas po pomyślnej aktualizacji informacji. <div>Zarządzaj</div>

## Routes - Subscription - SubscriptionItem

sub-item-no-such-plan = Nie ma takiego planu dla tej subskrypcji.
invoice-not-found = Nie odnaleziono kolejnej faktury
sub-item-no-such-subsequent-invoice = Nie odnaleziono kolejnej faktury za tę subskrypcję.
sub-invoice-preview-error-title = Nie odnaleziono podglądu faktury
sub-invoice-preview-error-text = Nie odnaleziono podglądu faktury dla tej subskrypcji

## Routes - Subscriptions - Reactivate
## $name (String) - The name of the subscribed product.

reactivate-confirm-dialog-header = Czy chcesz nadal używać { $name }?
# $amount (Number) - The amount billed. It will be formatted as currency.
# $last (String) - The last 4 digits of the card that will be charged
# $endDate (Date) - Last day of product access
reactivate-confirm-copy =
    Twój dostęp do { $name } będzie kontynuowany, a okres rozliczeniowy
    i płatności pozostaną takie same. Następna opłata będzie wynosiła { $amount }
    na kartę kończącą się na { $last } w dniu { $endDate }.
# Alternate copy used when a payment method is not available, e.g. for free trials
# $amount (Number) - The amount billed. It will be formatted as currency.
# $endDate (Date) - Last day of product access
reactivate-confirm-without-payment-method-copy =
    Twój dostęp do { $name } będzie kontynuowany, a okres rozliczeniowy
    i płatności pozostaną takie same. Następna opłata będzie wynosiła { $amount } w dniu { $endDate }.
reactivate-confirm-button = Subskrybuj ponownie

## $date (Date) - Last day of product access

reactivate-panel-copy = Utracisz dostęp do { $name } w dniu <strong>{ $date }</strong>.
reactivate-success-copy = Dzięki! Wszystko gotowe.
reactivate-success-button = Zamknij

## Routes - Subscriptions - Subscription iap item

sub-iap-item-google-purchase-2 = { -brand-google }: zakup w aplikacji
sub-iap-item-apple-purchase-2 = { -brand-apple }: zakup w aplikacji
sub-iap-item-manage-button = Zarządzaj
