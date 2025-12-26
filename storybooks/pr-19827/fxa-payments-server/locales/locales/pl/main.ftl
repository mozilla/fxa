



-brand-mozilla =
    { $case ->
        [gen] Mozilli
        [dat] Mozilli
        [acc] Mozillę
        [ins] Mozillą
        [loc] Mozilli
       *[nom] Mozilla
    }
-brand-firefox =
    { $case ->
        [gen] Firefoksa
        [dat] Firefoksowi
        [acc] Firefoksa
        [ins] Firefoksem
        [loc] Firefoksie
       *[nom] Firefox
    }
-product-firefox-accounts =
    { $case ->
        [gen]
            { $capitalization ->
                [lower] kont Firefoksa
               *[upper] Kont Firefoksa
            }
        [dat]
            { $capitalization ->
                [lower] kontom Firefoksa
               *[upper] Kontom Firefoksa
            }
        [acc]
            { $capitalization ->
                [lower] konta Firefoksa
               *[upper] Konta Firefoksa
            }
        [ins]
            { $capitalization ->
                [lower] kontami Firefoksa
               *[upper] Kontami Firefoksa
            }
        [loc]
            { $capitalization ->
                [lower] kontach Firefoksa
               *[upper] Kontach Firefoksa
            }
       *[nom]
            { $capitalization ->
                [lower] konta Firefoksa
               *[upper] Konta Firefoksa
            }
    }
-product-mozilla-account =
    { $case ->
        [gen]
            { $capitalization ->
                [lower] konta Mozilli
               *[upper] Konta Mozilli
            }
        [dat]
            { $capitalization ->
                [lower] kontu Mozilli
               *[upper] Kontu Mozilli
            }
        [acc]
            { $capitalization ->
                [lower] konto Mozilli
               *[upper] Konto Mozilli
            }
        [ins]
            { $capitalization ->
                [lower] kontem Mozilli
               *[upper] Kontem Mozilli
            }
        [loc]
            { $capitalization ->
                [lower] koncie Mozilli
               *[upper] Koncie Mozilli
            }
       *[nom]
            { $capitalization ->
                [lower] konto Mozilli
               *[upper] Konto Mozilli
            }
    }
-product-mozilla-accounts =
    { $case ->
        [gen]
            { $capitalization ->
                [lower] kont Mozilli
               *[upper] Kont Mozilli
            }
        [dat]
            { $capitalization ->
                [lower] kontom Mozilli
               *[upper] Kontom Mozilli
            }
        [acc]
            { $capitalization ->
                [lower] konta Mozilli
               *[upper] Konta Mozilli
            }
        [ins]
            { $capitalization ->
                [lower] kontami Mozilli
               *[upper] Kontami Mozilli
            }
        [loc]
            { $capitalization ->
                [lower] kontach Mozilli
               *[upper] Kontach Mozilli
            }
       *[nom]
            { $capitalization ->
                [lower] konta Mozilli
               *[upper] Konta Mozilli
            }
    }
-product-firefox-account =
    { $case ->
        [gen]
            { $capitalization ->
                [lower] konta Firefoksa
               *[upper] Konta Firefoksa
            }
        [dat]
            { $capitalization ->
                [lower] kontu Firefoksa
               *[upper] Kontu Firefoksa
            }
        [acc]
            { $capitalization ->
                [lower] konto Firefoksa
               *[upper] Konto Firefoksa
            }
        [ins]
            { $capitalization ->
                [lower] kontem Firefoksa
               *[upper] Kontem Firefoksa
            }
        [loc]
            { $capitalization ->
                [lower] koncie Firefoksa
               *[upper] Koncie Firefoksa
            }
       *[nom]
            { $capitalization ->
                [lower] konto Firefoksa
               *[upper] Konto Firefoksa
            }
    }
-product-mozilla-vpn = Mozilla VPN
-product-mozilla-vpn-short = VPN
-product-mozilla-hubs = Mozilla Hubs
-product-mdn = MDN
-product-mdn-plus = MDN Plus
-product-firefox-cloud = Firefox Cloud
-product-mozilla-monitor = Mozilla Monitor
-product-mozilla-monitor-short = Monitor
-product-firefox-relay = Firefox Relay
-product-firefox-relay-short = Relay
-brand-apple =
    { $case ->
        [gen] Apple’a
        [dat] Apple’owi
        [acc] Apple’a
        [ins] Apple’em
        [loc] Apple’u
       *[nom] Apple
    }
-brand-apple-pay = Apple Pay
-brand-google = Google
-brand-google-pay = Google Pay
-brand-paypal = PayPal
-brand-name-stripe = Stripe
-brand-amex = American Express
-brand-diners = Diners Club
-brand-discover = Discover
-brand-jcb = JCB
-brand-link = Link
-brand-mastercard = Mastercard
-brand-unionpay = UnionPay
-brand-visa = Visa
-app-store = App Store
-google-play = Google Play

app-general-err-heading = Ogólny błąd aplikacji
app-general-err-message = Coś się nie powiodło. Proszę spróbować ponownie później.
app-query-parameter-err-heading = Błędne żądanie: nieprawidłowe parametry zapytania


app-footer-mozilla-logo-label = Logo { -brand-mozilla(case: "gen") }
app-footer-privacy-notice = Zasady ochrony prywatności
app-footer-terms-of-service = Regulamin usługi


app-default-title-2 = { -product-mozilla-accounts }
app-page-title-2 = { $title } | { -product-mozilla-accounts }


link-sr-new-window = Otwiera w nowym oknie


app-loading-spinner-aria-label-loading = Wczytywanie…


app-logo-alt-3 =
    .alt = Logo „m” { -brand-mozilla(case: "gen") }



settings-home = Strona główna konta
settings-project-header-title = { -product-mozilla-account(case: "nom", capitalization: "upper") }


coupon-promo-code-applied = Zastosowano kod promocyjny
coupon-submit = Zastosuj
coupon-remove = Usuń
coupon-error = Wpisany kod jest nieprawidłowy lub wygasł.
coupon-error-generic = Wystąpił błąd podczas przetwarzania kodu. Proszę spróbować ponownie.
coupon-error-expired = Wpisany kod wygasł.
coupon-error-limit-reached = Wpisany kod osiągnął swoje ograniczenie.
coupon-error-invalid = Wpisany kod jest nieprawidłowy.
coupon-enter-code =
    .placeholder = Wpisz kod


default-input-error = To pole jest wymagane
input-error-is-required = Pole „{ $label }” jest wymagane


brand-name-mozilla-logo = Logo { -brand-mozilla(case: "gen") }


new-user-sign-in-link-2 = Masz już { -product-mozilla-account(case: "acc", capitalization: "lower") }? <a>Zaloguj się</a>
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
new-user-invalid-email-domain = Błąd w adresie e-mail? { $domain } nie oferuje usług pocztowych.


payment-confirmation-thanks-heading = Dziękujemy!
payment-confirmation-thanks-heading-account-exists = Dzięki, teraz sprawdź pocztę!
payment-confirmation-thanks-subheading = Na adres { $email } wysłano wiadomość z potwierdzeniem i informacjami, jak zacząć używać { $product_name }.
payment-confirmation-thanks-subheading-account-exists = Otrzymasz wiadomość na adres { $email } z instrukcjami konfiguracji konta, a także informacjami o płatności.
payment-confirmation-order-heading = Informacje o zamówieniu
payment-confirmation-invoice-number = Faktura #{ $invoiceNumber }
payment-confirmation-invoice-date = { $invoiceDate }
payment-confirmation-details-heading-2 = Informacje o płatności
payment-confirmation-amount = { $amount } co { $interval }
payment-confirmation-amount-day =
    { $intervalCount ->
        [one] { $amount } dziennie
        [few] { $amount } co { $intervalCount } dni
       *[many] { $amount } co { $intervalCount } dni
    }
payment-confirmation-amount-week =
    { $intervalCount ->
        [one] { $amount } tygodniowo
        [few] { $amount } co { $intervalCount } tygodnie
       *[many] { $amount } co { $intervalCount } tygodni
    }
payment-confirmation-amount-month =
    { $intervalCount ->
        [one] { $amount } miesięcznie
        [few] { $amount } co { $intervalCount } miesiące
       *[many] { $amount } co { $intervalCount } miesięcy
    }
payment-confirmation-amount-year =
    { $intervalCount ->
        [one] { $amount } rocznie
        [few] { $amount } co { $intervalCount } lata
       *[many] { $amount } co { $intervalCount } lat
    }
payment-confirmation-download-button = Kontynuuj, aby pobrać


payment-confirm-with-legal-links-static-3 = Upoważniam { -brand-mozilla(case: "acc") } do pobierania wymienionej opłaty zgodnie z <termsOfServiceLink>regulaminem usługi</termsOfServiceLink> i <privacyNoticeLink>zasadami ochrony prywatności</privacyNoticeLink> oraz za pomocą wybranej przeze mnie metody płatności, dopóki nie anuluję swojej subskrypcji.
payment-confirm-checkbox-error = Należy to wypełnić, aby móc przejść dalej


payment-error-retry-button = Spróbuj ponownie
payment-error-manage-subscription-button = Zarządzaj moją subskrypcją


iap-upgrade-already-subscribed-2 = Masz już subskrypcję { $productName } w sklepie z aplikacjami { -brand-google } lub { -brand-apple }.
iap-upgrade-no-bundle-support = Nie obsługujemy przełączania z tych subskrypcji, ale wkrótce się to zmieni.
iap-upgrade-contact-support = Nadal możesz otrzymać ten produkt — prosimy o kontakt z zespołem wsparcia, abyśmy mogli Ci pomóc.
iap-upgrade-get-help-button = Wsparcie


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


payment-legal-copy-stripe-and-paypal-3 = { -brand-mozilla } korzysta z serwisów { -brand-name-stripe } i { -brand-paypal } do bezpiecznego przetwarzania płatności.
payment-legal-link-stripe-paypal-2 = <stripePrivacyLink>Zasady ochrony prywatności firmy { -brand-name-stripe }</stripePrivacyLink> &nbsp; <paypalPrivacyLink>Zasady ochrony prywatności firmy { -brand-paypal }</paypalPrivacyLink>.
payment-legal-copy-paypal-2 = { -brand-mozilla } korzysta z serwisu { -brand-paypal } do bezpiecznego przetwarzania płatności.
payment-legal-link-paypal-3 = <paypalPrivacyLink>Zasady ochrony prywatności firmy { -brand-paypal }</paypalPrivacyLink>.
payment-legal-copy-stripe-3 = { -brand-mozilla } korzysta z serwisu { -brand-name-stripe } do bezpiecznego przetwarzania płatności.
payment-legal-link-stripe-3 = <stripePrivacyLink>Zasady ochrony prywatności firmy { -brand-name-stripe }</stripePrivacyLink>.


payment-method-header = Wybierz metodę płatności
payment-method-header-second-step = 2. { payment-method-header }
payment-method-first-approve = Najpierw musisz zatwierdzić subskrypcję


payment-processing-message = Prosimy czekać na przetworzenie płatności…


payment-confirmation-cc-card-ending-in = Karta kończąca się na { $last4 }


pay-with-heading-paypal-2 = Zapłać za pomocą serwisu { -brand-paypal }


plan-details-header = Informacje o produkcie
plan-details-list-price = Cena katalogowa
plan-details-show-button = Wyświetl informacje
plan-details-hide-button = Ukryj informacje
plan-details-total-label = Razem
plan-details-tax = Podatki i opłaty


product-no-such-plan = Nie ma takiego planu dla tego produktu.


price-details-no-tax = { $priceAmount }
price-details-tax = { $priceAmount } + { $taxAmount } podatku
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


subscription-create-title = Skonfiguruj swoją subskrypcję
subscription-success-title = Potwierdzenie subskrypcji
subscription-processing-title = Potwierdzanie subskrypcji…
subscription-error-title = Błąd podczas potwierdzania subskrypcji…
subscription-noplanchange-title = Ta zmiana planu subskrypcji nie jest obsługiwana
subscription-iapsubscribed-title = Już subskrybowane
sub-guarantee = 30-dniowa gwarancja zwrotu pieniędzy


subplat-mozilla-accounts-legal-heading = { -product-mozilla-accounts(case: "nom", capitalization: "upper") }
terms = Regulamin usługi
privacy = Zasady ochrony prywatności
terms-download = Warunki pobierania


document =
    .title = Konta Firefoksa
close-aria =
    .aria-label = Zamknij okno
settings-subscriptions-title = Subskrypcje
coupon-promo-code = Kod promocyjny


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
iap-already-subscribed = Masz już subskrypcję przez { $mobileAppStore }.
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


coupon-success = Twój plan będzie automatycznie odnawiany po cenie katalogowej.
coupon-success-repeating = Po { $couponDurationDate } Twój plan będzie automatycznie odnawiany po cenie katalogowej.


new-user-step-1-2 = 1. Utwórz { -product-mozilla-account(case: "acc", capitalization: "lower") }
new-user-card-title = Podaj informacje o karcie
new-user-submit = Subskrybuj


sub-update-payment-title = Informacje o płatności


pay-with-heading-card-only = Zapłać kartą
product-invoice-preview-error-title = Problem podczas wczytywania podglądu faktury
product-invoice-preview-error-text = Nie można wczytać podglądu faktury


subscription-iaperrorupgrade-title = Jeszcze nie możemy Cię przełączyć


brand-name-google-play-2 = Sklep { -google-play }
brand-name-apple-app-store-2 = { -app-store }


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


sub-update-new-plan-daily = { $productName } (dziennie)
sub-update-new-plan-weekly = { $productName } (tygodniowo)
sub-update-new-plan-monthly = { $productName } (miesięcznie)
sub-update-new-plan-yearly = { $productName } (rocznie)
sub-update-prorated-upgrade-credit = Widoczne ujemne saldo zostanie zastosowane jako środki na koncie, które zostaną użyte na poczet przyszłych faktur.


sub-item-cancel-sub = Anuluj subskrypcję
sub-item-stay-sub = Nie rezygnuj z subskrypcji


sub-item-cancel-msg =
    Po { $period }, ostatnim dniu okresu rozliczeniowego,
    nie będzie już można używać { $name }.
sub-item-cancel-confirm =
    Anuluj mój dostęp i moje zachowane informacje
    w { $name } w dniu { $period }
sub-promo-coupon-applied = Dodano rabat „{ $promotion_name }”: <priceDetails></priceDetails>
subscription-management-account-credit-balance = Ta płatność za subskrypcję spowodowała dodanie środków na koncie: <priceDetails></priceDetails>


sub-route-idx-reactivating = Ponowna aktywacja subskrypcji się nie powiodła
sub-route-idx-cancel-failed = Anulowanie subskrypcji się nie powiodło
sub-route-idx-contact = Skontaktuj się z pomocą
sub-route-idx-cancel-msg-title = Przykro nam, że chcesz się z nami pożegnać
sub-route-idx-cancel-msg =
    Subskrypcja { $name } została anulowana.
          <br />
          Będziesz mieć dostęp do { $name } do dnia { $date }.
sub-route-idx-cancel-aside-2 = Masz pytania? Odwiedź <a>pomoc { -brand-mozilla(case: "gen") }</a>.


sub-customer-error =
    .title = Problem podczas wczytywania klienta
sub-invoice-error =
    .title = Problem podczas wczytywania faktur
sub-billing-update-success = Pomyślnie zaktualizowano dane płatnicze
sub-invoice-previews-error-title = Problem podczas wczytywania podglądu faktur
sub-invoice-previews-error-text = Nie można wczytać podglądu faktur


pay-update-change-btn = Zmień
pay-update-manage-btn = Zarządzaj


sub-next-bill = Następna płatność: { $date }
sub-next-bill-due-date = Termin następnej płatności: { $date }
sub-expires-on = Wygasa: { $date }




pay-update-card-exp = Wygasa { $expirationDate }
sub-route-idx-updating = Aktualizowanie danych płatniczych…
sub-route-payment-modal-heading = Nieprawidłowe dane płatnicze
sub-route-payment-modal-message-2 = Wygląda na to, że wystąpił błąd na Twoim koncie { -brand-paypal }. Musisz podjąć niezbędne kroki, aby rozwiązać ten problem z płatnością.
sub-route-missing-billing-agreement-payment-alert = Nieprawidłowe informacje o płatności — wystąpił błąd na Twoim koncie. <div>Zarządzaj</div>
sub-route-funding-source-payment-alert = Nieprawidłowe informacje o płatności — wystąpił błąd na Twoim koncie. To powiadomienie może być widoczne jeszcze przez jakiś czas po pomyślnej aktualizacji informacji. <div>Zarządzaj</div>


sub-item-no-such-plan = Nie ma takiego planu dla tej subskrypcji.
invoice-not-found = Nie odnaleziono kolejnej faktury
sub-item-no-such-subsequent-invoice = Nie odnaleziono kolejnej faktury za tę subskrypcję.
sub-invoice-preview-error-title = Nie odnaleziono podglądu faktury
sub-invoice-preview-error-text = Nie odnaleziono podglądu faktury dla tej subskrypcji


reactivate-confirm-dialog-header = Czy chcesz nadal używać { $name }?
reactivate-confirm-copy =
    Twój dostęp do { $name } będzie kontynuowany, a okres rozliczeniowy
    i płatności pozostaną takie same. Następna opłata będzie wynosiła { $amount }
    na kartę kończącą się na { $last } w dniu { $endDate }.
reactivate-confirm-without-payment-method-copy =
    Twój dostęp do { $name } będzie kontynuowany, a okres rozliczeniowy
    i płatności pozostaną takie same. Następna opłata będzie wynosiła { $amount } w dniu { $endDate }.
reactivate-confirm-button = Subskrybuj ponownie


reactivate-panel-copy = Utracisz dostęp do { $name } w dniu <strong>{ $date }</strong>.
reactivate-success-copy = Dzięki! Wszystko gotowe.
reactivate-success-button = Zamknij


sub-iap-item-google-purchase-2 = { -brand-google }: zakup w aplikacji
sub-iap-item-apple-purchase-2 = { -brand-apple }: zakup w aplikacji
sub-iap-item-manage-button = Zarządzaj
