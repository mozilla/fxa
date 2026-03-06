



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



resend-code-success-banner-heading = Nowy kod został wysłany na Twój adres e-mail.
resend-link-success-banner-heading = Nowy odnośnik został wysłany na Twój adres e-mail.
resend-success-banner-description = Dodaj { $accountsEmail } do kontaktów, aby zapewnić odbiór wiadomości.


brand-banner-dismiss-button-2 =
    .aria-label = Zamknij komunikat
brand-prelaunch-title = 1 listopada nazwa „{ -product-firefox-accounts(case: "nom", capitalization: "lower") }” zostanie zmieniona na „{ -product-mozilla-accounts(case: "nom", capitalization: "lower") }”
brand-prelaunch-subtitle = Nadal będziesz się logować przy użyciu tej samej nazwy użytkownika i hasła i nie będzie żadnych innych zmian w produktach, z których korzystasz.
brand-postlaunch-title = Zmieniliśmy nazwę „{ -product-firefox-accounts(case: "nom", capitalization: "lower") }” na „{ -product-mozilla-accounts(case: "nom", capitalization: "lower") }”. Nadal będziesz się logować przy użyciu tej samej nazwy użytkownika i hasła i nie będzie żadnych innych zmian w produktach, z których korzystasz.
brand-learn-more = Więcej informacji
brand-close-banner =
    .alt = Zamknij komunikat
brand-m-logo =
    .alt = Logo „m” { -brand-mozilla(case: "gen") }


button-back-aria-label = Wstecz
button-back-title = Wstecz


recovery-key-download-button-v3 = Pobierz i kontynuuj
    .title = Pobierz i kontynuuj
recovery-key-pdf-heading = Klucz odzyskiwania konta
recovery-key-pdf-download-date = Utworzono: { $date }
recovery-key-pdf-key-legend = Klucz odzyskiwania konta
recovery-key-pdf-instructions = Ten klucz umożliwia odzyskanie zaszyfrowanych danych przeglądarki (w tym haseł, zakładek i historii), jeśli zapomnisz hasła. Przechowuj go w miejscu, które zapamiętasz.
recovery-key-pdf-storage-ideas-heading = Miejsca, w których można zachować klucz
recovery-key-pdf-support = Więcej informacji o kluczu odzyskiwania konta
recovery-key-pdf-download-error = Przepraszamy, wystąpił problem podczas pobierania klucza odzyskiwania konta.


choose-newsletters-prompt-2 = Więcej od { -brand-mozilla(case: "gen") }:
choose-newsletters-option-latest-news =
    .label = Najnowsze aktualności i informacje o produktach
choose-newsletters-option-test-pilot =
    .label = Wczesny dostęp do testowania nowych produktów
choose-newsletters-option-reclaim-the-internet =
    .label = Wezwania do działań mających na celu odzyskanie Internetu


datablock-download =
    .message = Pobrano
datablock-copy =
    .message = Skopiowano
datablock-print =
    .message = Wydrukowano


datablock-copy-success =
    { $count ->
        [one] Skopiowano kod
       *[other] Skopiowano kody
    }
datablock-download-success =
    { $count ->
        [one] Pobrano kod
       *[other] Pobrano kody
    }
datablock-print-success =
    { $count ->
        [one] Wydrukowano kod
       *[other] Wydrukowano kody
    }


datablock-inline-copy =
    .message = Skopiowano


device-info-block-location-city-region-country = { $city }, { $region }, { $country } (przybliżone)
device-info-block-location-region-country = { $region }, { $country } (przybliżone)
device-info-block-location-city-country = { $city }, { $country } (przybliżone)
device-info-block-location-country = { $country } (przybliżone)
device-info-block-location-unknown = Nieznane położenie
device-info-browser-os = { $browserName } w systemie { $genericOSName }
device-info-ip-address = Adres IP: { $ipAddress }


form-password-with-inline-criteria-signup-new-password-label =
    .label = Hasło
form-password-with-inline-criteria-signup-confirm-password-label =
    .label = Powtórz hasło
form-password-with-inline-criteria-signup-submit-button = Utwórz konto
form-password-with-inline-criteria-reset-new-password =
    .label = Nowe hasło
form-password-with-inline-criteria-confirm-password =
    .label = Potwierdź hasło
form-password-with-inline-criteria-reset-submit-button = Utwórz nowe hasło
form-password-with-inline-criteria-set-password-new-password-label =
    .label = Hasło
form-password-with-inline-criteria-set-password-confirm-password-label =
    .label = Powtórz hasło
form-password-with-inline-criteria-set-password-submit-button = Zacznij synchronizować
form-password-with-inline-criteria-match-error = Hasła są niezgodne
form-password-with-inline-criteria-sr-too-short-message = Hasło musi mieć co najmniej 8 znaków.
form-password-with-inline-criteria-sr-not-email-message = Hasło nie może zawierać Twojego adresu e-mail.
form-password-with-inline-criteria-sr-not-common-message = Hasło nie może być często używanym hasłem.
form-password-with-inline-criteria-sr-requirements-met = Wpisane hasło spełnia wszystkie wymagania.
form-password-with-inline-criteria-sr-passwords-match = Wpisane hasła są zgodne.


form-verify-code-default-error = To pole jest wymagane


form-verify-totp-disabled-button-title-numeric = Wpisz { $codeLength }-cyfrowy kod, aby kontynuować
form-verify-totp-disabled-button-title-alphanumeric = Wpisz { $codeLength }-znakowy kod, aby kontynuować


get-data-trio-title-firefox = { -brand-firefox }
get-data-trio-title-firefox-recovery-key = Klucz odzyskiwania konta { -brand-firefox(case: "gen") }
get-data-trio-title-backup-verification-codes = Zapasowe kody uwierzytelniania
get-data-trio-download-2 =
    .title = Pobierz
    .aria-label = Pobierz
get-data-trio-copy-2 =
    .title = Kopiuj
    .aria-label = Kopiuj
get-data-trio-print-2 =
    .title = Drukuj
    .aria-label = Drukuj


alert-icon-aria-label =
    .aria-label = Powiadomienie
icon-attention-aria-label =
    .aria-label = Uwaga
icon-warning-aria-label =
    .aria-label = Ostrzeżenie
authenticator-app-aria-label =
    .aria-label = Aplikacja uwierzytelniająca
backup-codes-icon-aria-label-v2 =
    .aria-label = Włączono zapasowe kody uwierzytelniania
backup-codes-disabled-icon-aria-label-v2 =
    .aria-label = Wyłączono zapasowe kody uwierzytelniania
backup-recovery-sms-icon-aria-label =
    .aria-label = Włączono SMS-y odzyskiwania
backup-recovery-sms-disabled-icon-aria-label =
    .aria-label = Wyłączono SMS-y odzyskiwania
canadian-flag-icon-aria-label =
    .aria-label = Flaga kanadyjska
checkmark-icon-aria-label =
    .aria-label = Zaznaczone
checkmark-success-icon-aria-label =
    .aria-label = Powodzenie
checkmark-enabled-icon-aria-label =
    .aria-label = Włączone
close-icon-aria-label =
    .aria-label = Zamknij komunikat
code-icon-aria-label =
    .aria-label = Kod
error-icon-aria-label =
    .aria-label = Błąd
info-icon-aria-label =
    .aria-label = Informacje
usa-flag-icon-aria-label =
    .aria-label = Flaga USA
icon-loading-arrow-aria-label =
    .aria-label = Wczytywanie


hearts-broken-image-aria-label =
    .aria-label = Komputer i telefon komórkowy ze złamanymi serduszkami
hearts-verified-image-aria-label =
    .aria-label = Komputer i telefon komórkowy z bijącymi serduszkami
signin-recovery-code-image-description =
    .aria-label = Dokument zawierający ukryty tekst.
signin-totp-code-image-label =
    .aria-label = Urządzenie z ukrytym sześciocyfrowym kodem.
confirm-signup-aria-label =
    .aria-label = Koperta zawierająca odnośnik
security-shield-aria-label =
    .aria-label = Rysunek przedstawiający klucz odzyskiwania konta.
recovery-key-image-aria-label =
    .aria-label = Rysunek przedstawiający klucz odzyskiwania konta.
password-image-aria-label =
    .aria-label = Ilustracja przedstawiająca wpisywanie hasła.
lightbulb-aria-label =
    .aria-label = Rysunek przedstawiający tworzenie wskazówki o miejscu przechowywania.
email-code-image-aria-label =
    .aria-label = Rysunek przedstawiający wiadomość e-mail zawierającą kod.
recovery-phone-image-description =
    .aria-label = Telefon odbierający kod SMS-em.
recovery-phone-code-image-description =
    .aria-label = Kod odebrany na telefonie.
backup-recovery-phone-image-aria-label =
    .aria-label = Telefon z możliwością wysyłania i odbierania wiadomości SMS
backup-authentication-codes-image-aria-label =
    .aria-label = Ekran urządzenia z kodami
sync-clouds-image-aria-label =
    .aria-label = Chmury z ikoną synchronizacji
confetti-falling-image-aria-label =
    .aria-label = Animowane spadające konfetti


inline-recovery-key-setup-signed-in-firefox-2 = Zalogowano do { -brand-firefox(case: "gen") }.
inline-recovery-key-setup-create-header = Zabezpiecz swoje konto
inline-recovery-key-setup-create-subheader = Masz chwilę, aby zabezpieczyć swoje dane?
inline-recovery-key-setup-info = Utwórz klucz odzyskiwania konta, dzięki któremu będzie możliwość odzyskania synchronizowanych danych przeglądania, jeśli kiedykolwiek zapomnisz hasła.
inline-recovery-key-setup-start-button = Utwórz klucz odzyskiwania konta
inline-recovery-key-setup-later-button = Zrób to później


input-password-hide = Ukryj hasło
input-password-show = Pokaż hasło
input-password-hide-aria-2 = Twoje hasło jest obecnie widoczne na ekranie.
input-password-show-aria-2 = Twoje hasło jest obecnie ukryte.
input-password-sr-only-now-visible = Twoje hasło jest teraz widoczne na ekranie.
input-password-sr-only-now-hidden = Twoje hasło jest teraz ukryte.


input-phone-number-country-list-aria-label = Wybierz kraj
input-phone-number-enter-number = Wpisz numer telefonu
input-phone-number-country-united-states = Stany Zjednoczone
input-phone-number-country-canada = Kanada
legal-back-button = Wstecz


reset-pwd-link-damaged-header = Odnośnik do zmiany hasła jest uszkodzony
signin-link-damaged-header = Odnośnik potwierdzenia jest uszkodzony
report-signin-link-damaged-header = Uszkodzony odnośnik
reset-pwd-link-damaged-message = W klikniętym odnośniku brakuje znaków. Mógł on zostać uszkodzony przez klienta poczty. Starannie skopiuj adres i spróbuj ponownie.


link-expired-new-link-button = Wyślij nowy odnośnik


remember-password-text = Pamiętasz hasło?
remember-password-signin-link = Zaloguj się


primary-email-confirmation-link-reused = Główny adres e-mail został już potwierdzony
signin-confirmation-link-reused = Już potwierdzono logowanie
confirmation-link-reused-message = Ten odnośnik potwierdzenia został już użyty, a może być używany tylko raz.


locale-toggle-select-label = Wybierz język
locale-toggle-browser-default = Domyślny język przeglądarki
error-bad-request = Błędne żądanie


password-info-balloon-why-password-info = To hasło jest potrzebne, aby uzyskać dostęp do wszystkich zaszyfrowanych danych przechowywanych u nas.
password-info-balloon-reset-risk-info = Zmiana hasła oznacza, że możliwa jest utrata danych, takich jak hasła i zakładki.


password-strength-long-instruction = Wybierz silne hasło, którego wcześniej nie używano na innych witrynach. Upewnij się, że spełnia ono wymagania bezpieczeństwa:
password-strength-short-instruction = Wybierz silne hasło:
password-strength-inline-min-length = Musi mieć co najmniej 8 znaków
password-strength-inline-not-email = Nie może być Twoim adresem e-mail
password-strength-inline-not-common = Nie może być często używanym hasłem
password-strength-inline-confirmed-must-match = Potwierdzenie zgadza się z nowym hasłem
password-strength-inline-passwords-match = Hasła są zgodne


account-recovery-notification-cta = Utwórz
account-recovery-notification-header-value = Nie strać swoich danych, jeśli zapomnisz hasła
account-recovery-notification-header-description = Utwórz klucz odzyskiwania konta, aby odzyskać synchronizowane dane przeglądania, jeśli kiedykolwiek zapomnisz hasła.
recovery-phone-promo-cta = Dodaj telefon odzyskiwania
recovery-phone-promo-heading = Dodaj dodatkową ochronę do swojego konta za pomocą telefonu odzyskiwania
recovery-phone-promo-description = Teraz możesz logować się za pomocą jednorazowego hasła otrzymanego SMS-em, jeśli nie możesz skorzystać z aplikacji uwierzytelniania dwuetapowego.
recovery-phone-promo-info-link = Więcej informacji o odzyskiwania i ryzyku podmiany karty SIM
promo-banner-dismiss-button =
    .aria-label = Zamknij komunikat


ready-complete-set-up-instruction = Dokończ konfigurację wprowadzając nowe hasło na pozostałych urządzeniach z { -brand-firefox(case: "ins") }.
manage-your-account-button = Zarządzaj kontem
ready-use-service = Można teraz używać usługi { $serviceName }
ready-use-service-default = Można teraz używać ustawień konta
ready-account-ready = Konto jest gotowe!
ready-continue = Kontynuuj
sign-in-complete-header = Potwierdzono logowanie
sign-up-complete-header = Potwierdzono konto
primary-email-verified-header = Potwierdzono główny adres e-mail


flow-recovery-key-download-storage-ideas-heading-v2 = Miejsca, w których można zachować klucz:
flow-recovery-key-download-storage-ideas-folder-v2 = Folder na zabezpieczonym urządzeniu
flow-recovery-key-download-storage-ideas-cloud = Zaufany serwis do przechowywania plików
flow-recovery-key-download-storage-ideas-print-v2 = Wydrukowana kartka
flow-recovery-key-download-storage-ideas-pwd-manager = Menedżer haseł


flow-recovery-key-hint-header-v2 = Dodaj wskazówkę, która pomoże Ci znaleźć klucz
flow-recovery-key-hint-message-v3 = Ta wskazówka powinna być pomocna przy szukaniu klucza odzyskiwania konta. Możemy pokazać Ci ją podczas zmiany hasła, aby odzyskać Twoje dane.
flow-recovery-key-hint-input-v2 =
    .label = Wpisz wskazówkę (opcjonalnie)
flow-recovery-key-hint-cta-text = Dokończ
flow-recovery-key-hint-char-limit-error = Wskazówka nie może mieć więcej niż 254 znaki.
flow-recovery-key-hint-unsafe-char-error = Wskazówka nie może zawierać niebezpiecznych znaków Unicode. Dozwolone są tylko litery, cyfry, znaki interpunkcyjne i symbole.


password-reset-warning-icon = Ostrzeżenie
password-reset-chevron-expanded = Ukryj ostrzeżenie
password-reset-chevron-collapsed = Pokaż ostrzeżenie
password-reset-data-may-not-be-recovered = Dane Twojej przeglądarki mogą nie zostać odzyskane
password-reset-previously-signed-in-device-2 = Masz jakieś urządzenie, na którym wcześniej się logowano?
password-reset-data-may-be-saved-locally-2 = Dane Twojej przeglądarki mogą być zachowane na tym urządzeniu. Zmień hasło, a następnie zaloguj się na nim, aby odzyskać i zsynchronizować dane.
password-reset-no-old-device-2 = Masz nowe urządzenie, ale nie masz dostępu do żadnego z poprzednich?
password-reset-encrypted-data-cannot-be-recovered-2 = Przepraszamy, ale nie można odzyskać zaszyfrowanych danych Twojej przeglądarki znajdujących się na serwerach { -brand-firefox(case: "gen") }.
password-reset-warning-have-key = Masz klucz odzyskiwania konta?
password-reset-warning-use-key-link = Użyj go teraz, aby zmienić hasło i zachować swoje dane


alert-bar-close-message = Zamknij komunikat


avatar-your-avatar =
    .alt = Twój awatar
avatar-default-avatar =
    .alt = Domyślny awatar




bento-menu-title-3 = Produkty { -brand-mozilla(case: "gen") }
bento-menu-tagline = Więcej produktów od { -brand-mozilla(case: "gen") }, które chronią Twoją prywatność
bento-menu-vpn-2 = { -product-mozilla-vpn }
bento-menu-monitor-3 = { -product-mozilla-monitor }
bento-menu-firefox-relay-2 = { -product-firefox-relay }
bento-menu-firefox-desktop = Przeglądarka { -brand-firefox } na komputery
bento-menu-firefox-mobile = Przeglądarka { -brand-firefox } na telefon
bento-menu-made-by-mozilla = Tworzone przez { -brand-mozilla(case: "acc") }


connect-another-fx-mobile = Pobierz { -brand-firefox(case: "acc") } na telefon lub tablet
connect-another-find-fx-mobile-2 = Znajdź { -brand-firefox(case: "acc") } w { -google-play } lub { -app-store }.
connect-another-play-store-image-2 =
    .alt = Pobierz { -brand-firefox(case: "acc") } z { -google-play }
connect-another-app-store-image-3 =
    .alt = Pobierz { -brand-firefox(case: "acc") } na { -app-store }


cs-heading = Połączone usługi
cs-description = Wszystko, czego używasz i do czego zalogowano.
cs-cannot-refresh =
    Przepraszamy, wystąpił problem podczas odświeżania
    listy połączonych usług.
cs-cannot-disconnect = Nie odnaleziono klienta, nie można rozłączyć
cs-logged-out-2 = Wylogowano z usługi { $service }
cs-refresh-button =
    .title = Odśwież połączone usługi
cs-missing-device-help = Brak elementu lub jakieś są podwójne?
cs-disconnect-sync-heading = Rozłącz synchronizację


cs-disconnect-sync-content-3 =
    Dane przeglądania pozostaną na urządzeniu <span>{ $device }</span>,
    ale nie będzie ono już synchronizowane z tym kontem.
cs-disconnect-sync-reason-3 = Jaki jest główny powód rozłączenia urządzenia <span>{ $device }</span>?


cs-disconnect-sync-opt-prefix = Urządzenie jest:
cs-disconnect-sync-opt-suspicious = Podejrzane
cs-disconnect-sync-opt-lost = Zgubione lub skradzione
cs-disconnect-sync-opt-old = Stare lub wymienione
cs-disconnect-sync-opt-duplicate = Podwójne
cs-disconnect-sync-opt-not-say = Nie chcę powiedzieć


cs-disconnect-advice-confirm = OK
cs-disconnect-lost-advice-heading = Rozłączono zgubione lub skradzione urządzenie
cs-disconnect-lost-advice-content-3 = Ponieważ urządzenie zostało zgubione lub skradzione, w celu zachowania bezpieczeństwa swoich danych należy zmienić hasło { -product-mozilla-account(case: "gen", capitalization: "lower") } w ustawieniach konta. Należy także poszukać informacji o możliwości zdalnego usunięcia danych u producenta urządzenia.
cs-disconnect-suspicious-advice-heading = Rozłączono podejrzane urządzenie
cs-disconnect-suspicious-advice-content-2 = Jeśli rozłączane urządzenie jest rzeczywiście podejrzane, należy zmienić hasło { -product-mozilla-account(case: "acc", capitalization: "lower") } w ustawieniach konta, aby zapewnić bezpieczeństwo swoich danych. Należy także zmienić wszystkie inne hasła zachowane w { -brand-firefox(case: "loc") }, wpisując about:logins na pasku adresu.
cs-sign-out-button = Wyloguj się


dc-heading = Zbieranie i wykorzystywanie danych
dc-subheader-moz-accounts = { -product-mozilla-accounts }
dc-subheader-ff-browser = Przeglądarka { -brand-firefox }
dc-subheader-content-2 = Pozwól { -product-mozilla-accounts(case: "dat", capitalization: "lower") } wysyłać dane techniczne i o interakcjach do { -brand-mozilla(case: "gen") }.
dc-subheader-ff-content = Aby przejrzeć lub zaktualizować ustawienia danych technicznych i o interakcjach przeglądarki { -brand-firefox }, otwórz ustawienia { -brand-firefox(case: "gen") } i przejdź do sekcji „Prywatność i bezpieczeństwo”.
dc-opt-out-success-2 = Pomyślnie zrezygnowano. { -product-mozilla-accounts } nie będą wysyłać danych technicznych i o interakcjach do { -brand-mozilla(case: "gen") }.
dc-opt-in-success-2 = Dzięki! Dzielenie się tymi danymi pomaga nam ulepszać { -product-mozilla-accounts(case: "acc", capitalization: "lower") }.
dc-opt-in-out-error-2 = Przepraszamy, wystąpił problem podczas zmieniania preferencji zbierania danych
dc-learn-more = Więcej informacji


drop-down-menu-title-2 = Menu { -product-mozilla-account(case: "gen", capitalization: "lower") }
drop-down-menu-signed-in-as-v2 = Zalogowano jako
drop-down-menu-sign-out = Wyloguj się
drop-down-menu-sign-out-error-2 = Przepraszamy, wystąpił problem z wylogowaniem


flow-container-back = Wstecz


flow-recovery-key-confirm-pwd-heading-v2 = Wpisz hasło ponownie w celach bezpieczeństwa
flow-recovery-key-confirm-pwd-input-label = Wpisz hasło
flow-recovery-key-confirm-pwd-submit-button = Utwórz klucz odzyskiwania konta
flow-recovery-key-confirm-pwd-submit-button-change-key = Utwórz nowy klucz odzyskiwania konta


flow-recovery-key-download-heading-v2 = Utworzono klucz odzyskiwania konta — teraz pobierz go i zachowaj
flow-recovery-key-download-info-v2 = Ten klucz umożliwia odzyskanie danych, jeśli zapomnisz hasła. Pobierz go teraz i zachowaj w miejscu, które zapamiętasz — nie będzie można później wrócić do tej strony.
flow-recovery-key-download-next-link-v2 = Kontynuuj bez pobierania


flow-recovery-key-success-alert = Utworzono klucz odzyskiwania konta


flow-recovery-key-info-header = Utwórz klucz odzyskiwania konta na wypadek zapomnienia hasła
flow-recovery-key-info-header-change-key = Zmień klucz odzyskiwania konta
flow-recovery-key-info-shield-bullet-point-v2 = Szyfrujemy dane przeglądania — hasła, zakładki i nie tylko. To świetne rozwiązanie w zakresie prywatności, ale oznacza też, że możesz stracić swoje dane, jeśli zapomnisz hasła.
flow-recovery-key-info-key-bullet-point-v2 = Dlatego tak ważne jest utworzenie klucza odzyskiwania konta — możesz go użyć, aby odzyskać swoje dane.
flow-recovery-key-info-cta-text-v3 = Zacznij teraz
flow-recovery-key-info-cancel-link = Anuluj


flow-setup-2fa-qr-heading = Połącz się ze swoją aplikacją uwierzytelniającą
flow-setup-2a-qr-instruction = <strong>1. krok:</strong> zeskanuj ten kod QR za pomocą dowolnej aplikacji uwierzytelniającej, takiej jak Duo lub Google Authenticator.
flow-setup-2fa-qr-alt-text =
    .alt = Kod QR do konfiguracji uwierzytelniania dwuetapowego. Zeskanuj go lub wybierz „Nie możesz zeskanować kodu QR?”, aby zamiast tego uzyskać tajny klucz do konfiguracji.
flow-setup-2fa-cant-scan-qr-button = Nie możesz zeskanować kodu QR?
flow-setup-2fa-manual-key-heading = Wpisz kod ręcznie
flow-setup-2fa-manual-key-instruction = <strong>1. krok:</strong> wpisz ten kod w wybranej aplikacji uwierzytelniającej.
flow-setup-2fa-scan-qr-instead-button = Czy zamiast tego zeskanować kod QR?
flow-setup-2fa-more-info-link = Więcej informacji o aplikacjach uwierzytelniających
flow-setup-2fa-button = Kontynuuj
flow-setup-2fa-step-2-instruction = <strong>2. krok:</strong> wpisz kod ze swojej aplikacji uwierzytelniającej.
flow-setup-2fa-input-label = Wpisz sześciocyfrowy kod
flow-setup-2fa-code-error = Nieprawidłowy lub wygasły kod. Sprawdź aplikację uwierzytelniającą i spróbuj ponownie.


flow-setup-2fa-backup-choice-heading = Wybierz metodę odzyskiwania
flow-setup-2fa-backup-choice-description = Umożliwia to zalogowanie, jeśli nie masz dostępu do telefonu lub aplikacji uwierzytelniającej.
flow-setup-2fa-backup-choice-phone-title = Telefon odzyskiwania
flow-setup-2fa-backup-choice-phone-badge = Najłatwiejsza
flow-setup-2fa-backup-choice-phone-info = Otrzymaj kod odzyskiwania SMS-em. Obecnie dostępne w USA i Kanadzie.
flow-setup-2fa-backup-choice-code-title = Zapasowe kody uwierzytelniania
flow-setup-2fa-backup-choice-code-badge = Najbezpieczniejsza
flow-setup-2fa-backup-choice-code-info = Utwórz i zapisz jednorazowe kody uwierzytelniania.
flow-setup-2fa-backup-choice-learn-more-link = Więcej informacji o odzyskiwania i ryzyku podmiany karty SIM


flow-setup-2fa-backup-code-confirm-heading = Wpisz zapasowy kod uwierzytelniania
flow-setup-2fa-backup-code-confirm-confirm-saved = Potwierdź zapisanie kodów, wpisując jeden z nich. Bez nich możesz nie być w stanie się zalogować, jeśli nie masz aplikacji uwierzytelniającej.
flow-setup-2fa-backup-code-confirm-code-input = Wpisz 10-znakowy kod
flow-setup-2fa-backup-code-confirm-button-finish = Dokończ


flow-setup-2fa-backup-code-dl-heading = Zapisz zapasowe kody uwierzytelniania
flow-setup-2fa-backup-code-dl-save-these-codes = Przechowuj je w miejscu, którego nie zapomnisz. Musisz wpisać jeden z nich, jeśli nie masz dostępu do aplikacji uwierzytelniającej.
flow-setup-2fa-backup-code-dl-button-continue = Kontynuuj


flow-setup-2fa-inline-complete-success-banner = Włączono uwierzytelnianie dwuetapowe
flow-setup-2fa-inline-complete-success-banner-description = Aby chronić wszystkie podłączone urządzenia, należy wylogować się ze wszystkiego, co korzysta z tego konta, a następnie zalogować się ponownie, używając nowego uwierzytelniania dwuetapowego.
flow-setup-2fa-inline-complete-backup-code = Zapasowe kody uwierzytelniania
flow-setup-2fa-inline-complete-backup-phone = Telefon odzyskiwania
flow-setup-2fa-inline-complete-backup-code-info =
    { $count ->
        [one] Pozostał { $count } kod
        [few] Pozostały { $count } kody
       *[many] Pozostało { $count } kodów
    }
flow-setup-2fa-inline-complete-backup-code-description = To najbezpieczniejsza metoda odzyskiwania, jeśli nie możesz zalogować się za pomocą telefonu lub aplikacji uwierzytelniającej.
flow-setup-2fa-inline-complete-backup-phone-description = To najłatwiejsza metoda odzyskiwania, jeśli nie możesz zalogować się za pomocą aplikacji uwierzytelniającej.
flow-setup-2fa-inline-complete-learn-more-link = W jaki sposób chroni to Twoje konto
flow-setup-2fa-inline-complete-continue-button = Przejdź do usługi { $serviceName }
flow-setup-2fa-prompt-heading = Skonfiguruj uwierzytelnianie dwuetapowe
flow-setup-2fa-prompt-description = { $serviceName } wymaga skonfigurowania uwierzytelniania dwuetapowego, aby zapewnić bezpieczeństwo konta.
flow-setup-2fa-prompt-use-authenticator-apps = Aby kontynuować, możesz użyć jednej z <authenticationAppsLink>tych aplikacji uwierzytelniających</authenticationAppsLink>.
flow-setup-2fa-prompt-continue-button = Kontynuuj


flow-setup-phone-confirm-code-heading = Wpisz kod weryfikacyjny
flow-setup-phone-confirm-code-instruction = Sześciocyfrowy kod został wysłany na numer <span>{ $phoneNumber }</span> za pomocą wiadomości SMS. Ten kod wygasa po 5 minutach.
flow-setup-phone-confirm-code-input-label = Wpisz sześciocyfrowy kod
flow-setup-phone-confirm-code-button = Potwierdź
flow-setup-phone-confirm-code-expired = Kod wygasł?
flow-setup-phone-confirm-code-resend-code-button = Wyślij ponownie kod
flow-setup-phone-confirm-code-resend-code-success = Wysłano kod
flow-setup-phone-confirm-code-success-message-v2 = Dodano telefon odzyskiwania
flow-change-phone-confirm-code-success-message = Zmieniono telefon odzyskiwania


flow-setup-phone-submit-number-heading = Zweryfikuj numer telefonu
flow-setup-phone-verify-number-instruction = Otrzymasz wiadomość SMS od { -brand-mozilla(case: "gen") } z kodem weryfikującym numer telefonu. Nie udostępniaj tego kodu nikomu.
flow-setup-phone-submit-number-info-message-v2 = Telefon odzyskiwania jest dostępny tylko w Stanach Zjednoczonych i Kanadzie. Numery VoIP i maski telefoniczne nie są zalecane.
flow-setup-phone-submit-number-legal = Podając swój numer, zgadzasz się na jego przechowywanie, abyśmy mogli wysłać Ci wiadomość SMS wyłącznie w celu weryfikacji konta. Mogą obowiązywać opłaty za wiadomości i dane komórkowe.
flow-setup-phone-submit-number-button = Wyślij kod


header-menu-open = Zamknij menu
header-menu-closed = Menu nawigacji witryny
header-back-to-top-link =
    .title = Wróć na górę
header-back-to-settings-link =
    .title = Wróć do ustawień { -product-mozilla-account(case: "gen", capitalization: "lower") }
header-title-2 = { -product-mozilla-account }
header-help = Pomoc


la-heading = Powiązane konta
la-description = Upoważniono dostęp do poniższych kont.
la-unlink-button = Odwiąż
la-unlink-account-button = Odwiąż
la-set-password-button = Ustaw hasło
la-unlink-heading = Odwiąż od konta innej firmy
la-unlink-content-3 = Czy na pewno odwiązać konto? Nie spowoduje to automatycznego wylogowania z połączonych usług. Aby to zrobić, musisz ręcznie wylogować się w sekcji „Połączone usługi”.
la-unlink-content-4 = Przed odwiązaniem konta musisz ustawić hasło. Bez hasła nie będzie możliwości zalogowania się po odwiązaniu konta.
nav-linked-accounts = { la-heading }


modal-close-title = Zamknij
modal-cancel-button = Anuluj
modal-default-confirm-button = Potwierdź


modal-mfa-protected-title = Wpisz kod potwierdzenia
modal-mfa-protected-subtitle = Pomóż nam upewnić się, że to Ty zmieniasz dane swojego konta
modal-mfa-protected-instruction =
    { $expirationTime ->
        [one] Wpisz kod potwierdzenia wysłany na adres <email>{ $email }</email> w ciągu { $expirationTime } minuty.
        [few] Wpisz kod potwierdzenia wysłany na adres <email>{ $email }</email> w ciągu { $expirationTime } minut.
       *[many] Wpisz kod potwierdzenia wysłany na adres <email>{ $email }</email> w ciągu { $expirationTime } minut.
    }
modal-mfa-protected-input-label = Wpisz sześciocyfrowy kod
modal-mfa-protected-cancel-button = Anuluj
modal-mfa-protected-confirm-button = Potwierdź
modal-mfa-protected-code-expired = Kod wygasł?
modal-mfa-protected-resend-code-link = Wyślij nowy.


mvs-verify-your-email-2 = Potwierdź adres e-mail
mvs-enter-verification-code-2 = Wpisz kod potwierdzenia
mvs-enter-verification-code-desc-2 = Proszę wpisać kod potwierdzenia wysłany na adres <email>{ $email }</email> w ciągu 5 minut.
msv-cancel-button = Anuluj
msv-submit-button-2 = Potwierdź


nav-settings = Ustawienia
nav-profile = Profil
nav-security = Bezpieczeństwo
nav-connected-services = Połączone usługi
nav-data-collection = Zbieranie i wykorzystywanie danych
nav-paid-subs = Płatne subskrypcje
nav-email-comm = Ustawienia poczty


page-2fa-change-title = Zmień uwierzytelnianie dwuetapowe
page-2fa-change-success = Uwierzytelnianie dwuetapowe zostało zaktualizowane
page-2fa-change-success-additional-message = Aby chronić wszystkie podłączone urządzenia, należy wylogować się ze wszystkiego, co korzysta z tego konta, a następnie zalogować się ponownie, używając nowego uwierzytelniania dwuetapowego.
page-2fa-change-totpinfo-error = Wystąpił błąd podczas zmiany aplikacji do uwierzytelniania dwuetapowego. Spróbuj ponownie później.
page-2fa-change-qr-instruction = <strong>1. krok:</strong> zeskanuj ten kod QR za pomocą dowolnej aplikacji uwierzytelniającej, takiej jak Duo lub Google Authenticator. Utworzy to nowe połączenie, a wszystkie poprzednie połączenia przestaną działać.


tfa-backup-codes-page-title = Zapasowe kody uwierzytelniania
tfa-replace-code-error-3 = Wystąpił problem podczas zastępowania zapasowych kodów uwierzytelniania
tfa-create-code-error = Wystąpił problem podczas tworzenia zapasowych kodów uwierzytelniania
tfa-replace-code-success-alert-4 = Zaktualizowano zapasowe kody uwierzytelniania
tfa-create-code-success-alert = Utworzono zapasowe kody uwierzytelniania
tfa-replace-code-download-description = Zachowaj je w miejscu, które będziesz pamiętać. Stare kody zostaną zastąpione po wykonaniu następnego kroku.
tfa-replace-code-confirm-description = Potwierdź zapisanie kodów, wprowadzając jeden. Twoje stare zapasowe kody uwierzytelniania zostaną wyłączone po wykonaniu tego kroku.
tfa-incorrect-recovery-code-1 = Niepoprawny zapasowy kod uwierzytelniania


page-2fa-setup-title = Uwierzytelnianie dwuetapowe
page-2fa-setup-totpinfo-error = Wystąpił błąd podczas konfigurowania uwierzytelniania dwuetapowego. Spróbuj ponownie później.
page-2fa-setup-incorrect-backup-code-error = Ten kod jest niepoprawny. Spróbuj ponownie.
page-2fa-setup-success = Uwierzytelnianie dwuetapowe zostało włączone
page-2fa-setup-success-additional-message = Aby chronić wszystkie podłączone urządzenia, należy wylogować się ze wszystkiego, co korzysta z tego konta, a następnie zalogować się ponownie, używając uwierzytelniania dwuetapowego.


avatar-page-title =
    .title = Zdjęcie profilowe
avatar-page-add-photo = Dodaj zdjęcie
avatar-page-add-photo-button =
    .title = { avatar-page-add-photo }
avatar-page-take-photo = Zrób zdjęcie
avatar-page-take-photo-button =
    .title = { avatar-page-take-photo }
avatar-page-remove-photo = Usuń zdjęcie
avatar-page-remove-photo-button =
    .title = { avatar-page-remove-photo }
avatar-page-retake-photo = Zrób zdjęcie jeszcze raz
avatar-page-cancel-button = Anuluj
avatar-page-save-button = Zachowaj
avatar-page-saving-button = Zachowywanie…
avatar-page-zoom-out-button =
    .title = Pomniejsz
avatar-page-zoom-in-button =
    .title = Powiększ
avatar-page-rotate-button =
    .title = Obróć
avatar-page-camera-error = Nie można zainicjować aparatu
avatar-page-new-avatar =
    .alt = nowe zdjęcie profilowe
avatar-page-file-upload-error-3 = Wystąpił problem podczas przesyłania zdjęcia profilowego
avatar-page-delete-error-3 = Wystąpił problem podczas usuwania zdjęcia profilowego
avatar-page-image-too-large-error-2 = Rozmiar pliku obrazu jest za duży, aby można go było wysłać


pw-change-header =
    .title = Zmień hasło
pw-8-chars = Musi mieć co najmniej 8 znaków
pw-not-email = Nie może być Twoim adresem e-mail
pw-change-must-match = Nowe hasło zgadza się z potwierdzeniem
pw-commonly-used = Nie może być często używanym hasłem
pw-tips = Zachowaj bezpieczeństwo — każdego hasła używaj tylko w jednym miejscu. Przeczytaj o <linkExternal>tworzeniu silnych haseł</linkExternal>.
pw-change-cancel-button = Anuluj
pw-change-save-button = Zachowaj
pw-change-forgot-password-link = Nie pamiętasz hasła?
pw-change-current-password =
    .label = Wpisz obecne hasło
pw-change-new-password =
    .label = Wpisz nowe hasło
pw-change-confirm-password =
    .label = Potwierdź nowe hasło
pw-change-success-alert-2 = Zaktualizowano hasło


pw-create-header =
    .title = Utwórz hasło
pw-create-success-alert-2 = Ustawiono hasło
pw-create-error-2 = Przepraszamy, wystąpił problem z ustawieniem hasła


delete-account-header =
    .title = Usuń konto
delete-account-step-1-2 = 1. krok z 2
delete-account-step-2-2 = 2. krok z 2
delete-account-confirm-title-4 = { -product-mozilla-account } mogło zostać połączone z co najmniej jednym produktem lub usługą { -brand-mozilla(case: "gen") }, która zapewnia bezpieczeństwo i produktywność w Internecie:
delete-account-product-mozilla-account = { -product-mozilla-account }
delete-account-product-mozilla-vpn = { -product-mozilla-vpn }
delete-account-product-mdn-plus = { -product-mdn-plus }
delete-account-product-mozilla-hubs = { -product-mozilla-hubs }
delete-account-product-mozilla-monitor = { -product-mozilla-monitor }
delete-account-product-firefox-relay = { -product-firefox-relay }
delete-account-product-firefox-sync = Synchronizowanie danych { -brand-firefox(case: "gen") }
delete-account-product-firefox-addons = Dodatki do { -brand-firefox(case: "gen") }
delete-account-acknowledge = Proszę potwierdzić, że usuwając konto:
delete-account-chk-box-1-v4 =
    .label = Wszystkie płatne subskrypcje zostaną anulowane
delete-account-chk-box-2 =
    .label = Zachowane informacje i funkcje w produktach { -brand-mozilla(case: "gen") } mogą zostać utracone
delete-account-chk-box-3 =
    .label = Ponowna aktywacja za pomocą tego adresu e-mail może nie przywrócić zachowanych informacji
delete-account-chk-box-4 =
    .label = Wszystkie rozszerzenia i motywy opublikowane przez Ciebie w serwisie addons.mozilla.org zostaną usunięte
delete-account-continue-button = Kontynuuj
delete-account-password-input =
    .label = Wpisz hasło
delete-account-cancel-button = Anuluj
delete-account-delete-button-2 = Usuń


display-name-page-title =
    .title = Wyświetlana nazwa
display-name-input =
    .label = Wpisz wyświetlaną nazwę
submit-display-name = Zachowaj
cancel-display-name = Anuluj
display-name-update-error-2 = Wystąpił problem podczas aktualizacji wyświetlanej nazwy
display-name-success-alert-2 = Zaktualizowano wyświetlaną nazwę


recent-activity-title = Ostatnie działania na koncie
recent-activity-account-create-v2 = Utworzono konto
recent-activity-account-disable-v2 = Wyłączono konto
recent-activity-account-enable-v2 = Włączono konto
recent-activity-account-login-v2 = Rozpoczęto logowanie do konta
recent-activity-account-reset-v2 = Rozpoczęto zmianę hasła
recent-activity-emails-clearBounces-v2 = Wyczyszczono odrzucone wiadomości
recent-activity-account-login-failure = Próba zalogowania się na konto się nie powiodła
recent-activity-account-two-factor-added = Włączono uwierzytelnianie dwuetapowe
recent-activity-account-two-factor-requested = Zażądano uwierzytelniania dwuetapowego
recent-activity-account-two-factor-failure = Uwierzytelnienie dwuetapowe się nie powiodło
recent-activity-account-two-factor-success = Pomyślnie uwierzytelniono dwuetapowo
recent-activity-account-two-factor-removed = Usunięto uwierzytelnianie dwuetapowe
recent-activity-account-password-reset-requested = Konto zażądało zmianę hasła
recent-activity-account-password-reset-success = Pomyślnie zmieniono hasło konta
recent-activity-account-recovery-key-added = Włączono klucz odzyskiwania konta
recent-activity-account-recovery-key-verification-failure = Weryfikacja klucza odzyskiwania konta się nie powiodła
recent-activity-account-recovery-key-verification-success = Pomyślnie zweryfikowano klucz odzyskiwania konta
recent-activity-account-recovery-key-removed = Usunięto klucz odzyskiwania konta
recent-activity-account-password-added = Dodano nowe hasło
recent-activity-account-password-changed = Zmieniono hasło
recent-activity-account-secondary-email-added = Dodano dodatkowy adres e-mail
recent-activity-account-secondary-email-removed = Usunięto dodatkowy adres e-mail
recent-activity-account-emails-swapped = Zamieniono główny i dodatkowy adres e-mail
recent-activity-session-destroy = Wylogowano z sesji
recent-activity-account-recovery-phone-send-code = Wysłano kod na telefon odzyskiwania
recent-activity-account-recovery-phone-setup-complete = Ukończono konfigurację telefonu odzyskiwania
recent-activity-account-recovery-phone-signin-complete = Ukończono logowanie za pomocą telefonu odzyskiwania
recent-activity-account-recovery-phone-signin-failed = Logowanie za pomocą telefonu odzyskiwania się nie powiodło
recent-activity-account-recovery-phone-removed = Usunięto telefon odzyskiwania
recent-activity-account-recovery-codes-replaced = Zastąpiono kody odzyskiwania
recent-activity-account-recovery-codes-created = Utworzono kody odzyskiwania
recent-activity-account-recovery-codes-signin-complete = Ukończono logowanie za pomocą kodów odzyskiwania
recent-activity-password-reset-otp-sent = Wysłano kod potwierdzenia zmiany hasła
recent-activity-password-reset-otp-verified = Zweryfikowano kod potwierdzenia zmiany hasła
recent-activity-must-reset-password = Wymagana jest zmiana hasła
recent-activity-unknown = Inne działanie na koncie


recovery-key-create-page-title = Klucz odzyskiwania konta
recovery-key-create-back-button-title = Wróć do ustawień


recovery-phone-remove-header = Usuń numer telefonu odzyskiwania
settings-recovery-phone-remove-info = Spowoduje to usunięcie numeru <strong>{ $formattedFullPhoneNumber }</strong> z listy telefonów odzyskiwania.
settings-recovery-phone-remove-recommend = Zalecamy dalsze korzystanie z tej metody, ponieważ jest łatwiejsza niż zachowywanie zapasowych kodów uwierzytelniania.
settings-recovery-phone-remove-recovery-methods = Jeśli go usuniesz, upewnij się, że nadal masz zachowane zapasowe kody uwierzytelniania. <linkExternal>Porównaj metody odzyskiwania</linkExternal>
settings-recovery-phone-remove-button = Usuń numer telefonu
settings-recovery-phone-remove-cancel = Anuluj
settings-recovery-phone-remove-success = Usunięto telefon odzyskiwania


page-setup-recovery-phone-heading = Dodaj telefon odzyskiwania
page-change-recovery-phone = Zmień telefon odzyskiwania
page-setup-recovery-phone-back-button-title = Wróć do ustawień
page-setup-recovery-phone-step2-back-button-title = Zmień numer telefonu


add-secondary-email-step-1 = 1. krok z 2
add-secondary-email-error-2 = Wystąpił problem podczas tworzenia tego adresu e-mail
add-secondary-email-page-title =
    .title = Dodatkowy adres e-mail
add-secondary-email-enter-address =
    .label = Wpisz adres e-mail
add-secondary-email-cancel-button = Anuluj
add-secondary-email-save-button = Zachowaj
add-secondary-email-mask = Maski dla adresu e-mail nie mogą być używane jako dodatkowe adresy e-mail


add-secondary-email-step-2 = 2. krok z 2
verify-secondary-email-page-title =
    .title = Dodatkowy adres e-mail
verify-secondary-email-verification-code-2 =
    .label = Wpisz kod potwierdzenia
verify-secondary-email-cancel-button = Anuluj
verify-secondary-email-verify-button-2 = Potwierdź
verify-secondary-email-please-enter-code-2 = Proszę wpisać kod potwierdzenia wysłany na adres <strong>{ $email }</strong> w ciągu 5 minut.
verify-secondary-email-success-alert-2 = Pomyślnie dodano adres { $email }
verify-secondary-email-resend-code-button = Wyślij ponownie kod potwierdzenia


delete-account-link = Usuń konto
inactive-update-status-success-alert = Pomyślnie zalogowano. Twoje { -product-mozilla-account(case: "nom", capitalization: "lower") } i dane pozostaną aktywne.


product-promo-monitor =
    .alt = { -product-mozilla-monitor }
product-promo-monitor-description-v2 = Dowiedz się, gdzie wyciekły Twoje dane osobowe i je odzyskaj
product-promo-monitor-cta = Przeszukaj bezpłatnie


profile-heading = Profil
profile-picture =
    .header = Zdjęcie
profile-display-name =
    .header = Wyświetlana nazwa
profile-primary-email =
    .header = Główny adres e-mail


progress-bar-aria-label-v2 = { $currentStep }. krok z { $numberOfSteps }.


security-heading = Bezpieczeństwo
security-password =
    .header = Hasło
security-password-created-date = Utworzono { $date }
security-not-set = Nie ustawiono
security-action-create = Utwórz
security-set-password = Ustaw hasło, aby synchronizować i korzystać z części funkcji bezpieczeństwa konta.
security-recent-activity-link = Ostatnie działania na koncie
signout-sync-header = Sesja wygasła
signout-sync-session-expired = Coś się nie powiodło. Proszę wylogować się z menu przeglądarki i spróbować ponownie.


tfa-row-backup-codes-title = Zapasowe kody uwierzytelniania
tfa-row-backup-codes-not-available = Brak dostępnych kodów
tfa-row-backup-codes-available-v2 =
    { $numCodesAvailable ->
        [one] Został { $numCodesAvailable } kod
        [few] Zostały { $numCodesAvailable } kody
       *[many] Zostało { $numCodesAvailable } kodów
    }
tfa-row-backup-codes-get-new-cta-v2 = Utwórz nowe kody
tfa-row-backup-codes-add-cta = Dodaj
tfa-row-backup-codes-description-2 = To najbezpieczniejsza metoda odzyskiwania, jeśli nie możesz użyć telefonu lub aplikacji uwierzytelniającej.
tfa-row-backup-phone-title-v2 = Telefon odzyskiwania
tfa-row-backup-phone-not-available-v2 = Nie dodano numeru telefonu
tfa-row-backup-phone-change-cta = Zmień
tfa-row-backup-phone-add-cta = Dodaj
tfa-row-backup-phone-delete-button = Usuń
tfa-row-backup-phone-delete-title-v2 = Usuń telefon odzyskiwania
tfa-row-backup-phone-delete-restriction-v2 = Jeśli chcesz usunąć telefon odzyskiwania, najpierw dodaj zapasowe kody uwierzytelniania lub wyłącz uwierzytelnianie dwuetapowe, aby uniknąć zablokowania konta.
tfa-row-backup-phone-description-v2 = To najłatwiejsza metoda odzyskiwania, jeśli nie możesz użyć aplikacji uwierzytelniającej.
tfa-row-backup-phone-sim-swap-risk-link = Więcej informacji o ryzyku zamiany karty SIM
passkey-sub-row-created-date = Utworzono: { $createdDate }
passkey-sub-row-last-used-date = Ostatnio użyto: { $lastUsedDate }
passkey-delete-modal-cancel-button = Anuluj


switch-turn-off = Wyłącz
switch-turn-on = Włącz
switch-submitting = Wysyłanie…
switch-is-on = włączone
switch-is-off = wyłączone


row-defaults-action-add = Dodaj
row-defaults-action-change = Zmień
row-defaults-action-disable = Wyłącz
row-defaults-status = Brak


passkey-row-info-link = W jaki sposób chroni to Twoje konto


rk-header-1 = Klucz odzyskiwania konta
rk-enabled = Włączony
rk-not-set = Nieustawiony
rk-action-create = Utwórz
rk-action-change-button = Zmień
rk-action-remove = Usuń
rk-key-removed-2 = Usunięto klucz odzyskiwania konta
rk-cannot-remove-key = Nie można usunąć klucza odzyskiwania konta.
rk-refresh-key-1 = Odśwież klucz odzyskiwania konta
rk-content-explain = Przywróć swoje dane, gdy zapomnisz hasła.
rk-cannot-verify-session-4 = Przepraszamy, wystąpił problem podczas potwierdzania sesji
rk-remove-modal-heading-1 = Usunąć klucz odzyskiwania konta?
rk-remove-modal-content-1 =
    W przypadku zmiany hasła nie będzie można użyć klucza odzyskiwania konta
    do uzyskania dostępu do swoich danych. Tego działania nie można cofnąć.
rk-remove-error-2 = Nie można usunąć klucza odzyskiwania konta
unit-row-recovery-key-delete-icon-button-title = Usuń klucz odzyskiwania konta


se-heading = Dodatkowy adres e-mail
    .header = Dodatkowy adres e-mail
se-cannot-refresh-email = Przepraszamy, wystąpił problem podczas odświeżania tego adresu e-mail.
se-cannot-resend-code-3 = Przepraszamy, wystąpił problem podczas ponownego wysyłania kodu potwierdzenia
se-set-primary-successful-2 = { $email } jest teraz głównym adresem e-mail
se-set-primary-error-2 = Przepraszamy, wystąpił problem podczas zmieniania głównego adresu e-mail
se-delete-email-successful-2 = Pomyślnie usunięto adres { $email }
se-delete-email-error-2 = Przepraszamy, wystąpił problem podczas usuwania tego adresu e-mail
se-verify-session-3 = Musisz potwierdzić obecną sesję, aby wykonać to działanie
se-verify-session-error-3 = Przepraszamy, wystąpił problem podczas potwierdzania sesji
se-remove-email =
    .title = Usuń adres e-mail
se-refresh-email =
    .title = Odśwież adres e-mail
se-unverified-2 = niepotwierdzony
se-resend-code-2 =
    Wymagane jest potwierdzenie. <button>Wyślij kod potwierdzenia jeszcze raz</button>,
    jeśli nie ma go w Odebranych ani w Niechcianych.
se-make-primary = Ustaw jako główny
se-default-content = Uzyskaj dostęp do konta, jeśli nie możesz zalogować się na główny adres e-mail.
se-content-note-1 =
    Uwaga: dodatkowy adres e-mail nie przywróci danych — do tego
    potrzebny będzie <a>klucz odzyskiwania konta</a>.
se-secondary-email-none = Brak


tfa-row-header = Uwierzytelnianie dwuetapowe
tfa-row-enabled = Włączone
tfa-row-disabled-status = Wyłączone
tfa-row-action-add = Dodaj
tfa-row-action-disable = Wyłącz
tfa-row-action-change = Zmień
tfa-row-button-refresh =
    .title = Odśwież uwierzytelnianie dwuetapowe
tfa-row-cannot-refresh =
    Przepraszamy, wystąpił problem podczas odświeżania
    uwierzytelniania dwuetapowego.
tfa-row-enabled-description = Twoje konto jest chronione uwierzytelnianiem dwuetapowym. Podczas logowania do { -product-mozilla-account(case: "gen", capitalization: "lower") } będzie trzeba wpisać jednorazowy kod z aplikacji uwierzytelniającej.
tfa-row-enabled-info-link = W jaki sposób chroni to Twoje konto
tfa-row-disabled-description-v2 = Zabezpiecz swoje konto, używając aplikacji uwierzytelniającej innej firmy jako drugiego kroku logowania.
tfa-row-cannot-verify-session-4 = Przepraszamy, wystąpił problem podczas potwierdzania sesji
tfa-row-disable-modal-heading = Wyłączyć uwierzytelnianie dwuetapowe?
tfa-row-disable-modal-confirm = Wyłącz
tfa-row-disable-modal-explain-1 =
    Tego działania nie będzie można cofnąć. Można zamiast tego
    <linkExternal>zastąpić zapasowe kody uwierzytelniania</linkExternal>.
tfa-row-disabled-2 = Uwierzytelnianie dwuetapowe jest wyłączone
tfa-row-cannot-disable-2 = Nie można wyłączyć uwierzytelniania dwuetapowego
tfa-row-verify-session-info = Musisz potwierdzić obecną sesję, aby skonfigurować uwierzytelnianie dwuetapowe


terms-privacy-agreement-intro-3 = Kontynuując, wyrażasz zgodę na:
terms-privacy-agreement-customized-terms = { $serviceName }: <termsLink>warunki korzystania</termsLink> i <privacyLink>zasady ochrony prywatności</privacyLink>
terms-privacy-agreement-mozilla-2 = { -product-mozilla-accounts(capitalization: "uppercase") }: <mozillaAccountsTos>regulamin usługi</mozillaAccountsTos> i <mozillaAccountsPrivacy>zasady ochrony prywatności</mozillaAccountsPrivacy>
terms-privacy-agreement-default-2 = Kontynuując, wyrażasz zgodę na <mozillaAccountsTos>regulamin usługi</mozillaAccountsTos> i <mozillaAccountsPrivacy>zasady ochrony prywatności</mozillaAccountsPrivacy>.


third-party-auth-options-or = Lub
third-party-auth-options-sign-in-with = Zaloguj się za pomocą
continue-with-google-button = Kontynuuj za pomocą konta { -brand-google }
continue-with-apple-button = Kontynuuj za pomocą konta { -brand-apple }


auth-error-102 = Nieznane konto
auth-error-103 = Niepoprawne hasło
auth-error-105-2 = Nieprawidłowy kod potwierdzenia
auth-error-110 = Nieprawidłowy token
auth-error-114-generic = Próbowano za wiele razy. Proszę spróbować ponownie później.
auth-error-114 = Próbowano za wiele razy. Proszę spróbować ponownie { $retryAfter }.
auth-error-125 = Żądanie zostało zablokowane z powodów bezpieczeństwa
auth-error-129-2 = Wprowadzono nieprawidłowy numer telefonu. Sprawdź go i spróbuj ponownie.
auth-error-138-2 = Niepotwierdzona sesja
auth-error-139 = Dodatkowy adres e-mail musi być inny niż adres e-mail konta
auth-error-144 = Ten adres e-mail jest zarezerwowany przez inne konto. Spróbuj ponownie później lub użyj innego adresu e-mail.
auth-error-155 = Nie odnaleziono tokena TOTP
auth-error-156 = Nie odnaleziono zapasowego kodu uwierzytelniania
auth-error-159 = Nieprawidłowy klucz odzyskiwania konta
auth-error-183-2 = Kod potwierdzenia jest nieprawidłowy lub wygasł
auth-error-202 = Funkcja jest wyłączona
auth-error-203 = System jest niedostępny, spróbuj ponownie później
auth-error-206 = Nie można utworzyć hasła, hasło jest już ustawione
auth-error-214 = Numer telefonu odzyskiwania już istnieje
auth-error-215 = Numer telefonu odzyskiwania nie istnieje
auth-error-216 = Osiągnięto ograniczenie liczby wiadomości SMS
auth-error-218 = Nie można usunąć telefonu odzyskiwania, brakuje zapasowych kodów uwierzytelniania.
auth-error-219 = Ten numer telefonu został zarejestrowany na zbyt wielu kontach. Spróbuj innego numeru.
auth-error-999 = Nieznany błąd
auth-error-1001 = Anulowano próbę logowania
auth-error-1002 = Sesja wygasła. Zaloguj się, aby kontynuować.
auth-error-1003 = Obsługa lokalnego przechowywania danych lub ciasteczek jest nadal wyłączona
auth-error-1008 = Nowe hasło musi być inne niż poprzednie
auth-error-1010 = Wymagane jest prawidłowe hasło
auth-error-1011 = Wymagany jest prawidłowy adres e-mail
auth-error-1018 = Wiadomość z potwierdzeniem została zwrócona. Błąd w adresie e-mail?
auth-error-1020 = Błędnie wpisany adres e-mail? „firefox.com” nie jest prawdziwym serwisem pocztowym
auth-error-1031 = Należy podać swój wiek przed zarejestrowaniem
auth-error-1032 = Należy podać prawidłowy wiek przed zarejestrowaniem
auth-error-1054 = Nieprawidłowy kod uwierzytelniania dwuetapowego
auth-error-1056 = Nieprawidłowy zapasowy kod uwierzytelniania
auth-error-1062 = Nieprawidłowe przekierowanie
auth-error-1064 = Błędnie wpisany adres e-mail? „{ $domain }” nie jest prawdziwym serwisem pocztowym
auth-error-1066 = Do utworzenia konta nie można używać masek dla adresu e-mail.
auth-error-1067 = Błąd w adresie e-mail?
recovery-phone-number-ending-digits = Numer kończący się na { $lastFourPhoneNumber }
oauth-error-1000 = Coś się nie powiodło. Proszę zamknąć tę kartę i spróbować ponownie.


connect-another-device-signed-in-header = Zalogowano do { -brand-firefox(case: "gen") }
connect-another-device-email-confirmed-banner = Potwierdzono adres e-mail
connect-another-device-signin-confirmed-banner = Potwierdzono logowanie
connect-another-device-signin-to-complete-message = Zaloguj się do tego { -brand-firefox(case: "gen") }, aby dokończyć konfigurację
connect-another-device-signin-link = Zaloguj się
connect-another-device-still-adding-devices-message = Jeszcze dodajesz urządzenia? Zaloguj się do { -brand-firefox(case: "gen") } na innym urządzeniu, aby dokończyć konfigurację
connect-another-device-signin-another-device-to-complete-message = Zaloguj się do { -brand-firefox(case: "gen") } na innym urządzeniu, aby dokończyć konfigurację
connect-another-device-get-data-on-another-device-message = Chcesz korzystać z kart, zakładek i haseł na innym urządzeniu?
connect-another-device-cad-link = Połącz inne urządzenie
connect-another-device-not-now-link = Nie teraz
connect-another-device-android-complete-setup-message = Zaloguj się do { -brand-firefox(case: "gen") } na Androida, aby dokończyć konfigurację
connect-another-device-ios-complete-setup-message = Zaloguj się do { -brand-firefox(case: "gen") } na iOS, aby dokończyć konfigurację


cookies-disabled-header = Obsługa lokalnego przechowywania danych i ciasteczek jest wymagana
cookies-disabled-enable-prompt-2 = Proszę włączyć obsługę ciasteczek i lokalnego przechowywania danych w przeglądarce, aby uzyskać dostęp do { -product-mozilla-account(case: "gen", capitalization: "lower") }. Dzięki temu włączona zostanie funkcja zapamiętywania użytkownika między sesjami.
cookies-disabled-button-try-again = Spróbuj ponownie
cookies-disabled-learn-more = Więcej informacji


index-header = Wpisz adres e-mail
index-sync-header = Przejdź do { -product-mozilla-account(case: "gen", capitalization: "lower") }
index-sync-subheader = Synchronizuj hasła, karty i zakładki wszędzie tam, gdzie używasz { -brand-firefox(case: "acc") }.
index-relay-header = Utwórz maskę dla adresu e-mail
index-relay-subheader = Podaj adres e-mail, na który przekazywać wiadomości z zamaskowanego adresu.
index-subheader-with-servicename = Przejdź do usługi { $serviceName }
index-subheader-default = Przejdź do ustawień konta
index-cta = Zarejestruj się lub zaloguj
index-account-info = { -product-mozilla-account } odblokowuje również dostęp do innych produktów { -brand-mozilla(case: "gen") } chroniących prywatność.
index-email-input =
    .label = Wpisz adres e-mail
index-account-delete-success = Pomyślnie usunięto konto
index-email-bounced = Wiadomość z potwierdzeniem została zwrócona. Błąd w adresie e-mail?


inline-recovery-key-setup-create-error = Ups! Nie można utworzyć klucza odzyskiwania konta. Proszę spróbować ponownie później.
inline-recovery-key-setup-recovery-created = Utworzono klucz odzyskiwania konta
inline-recovery-key-setup-download-header = Zabezpiecz swoje konto
inline-recovery-key-setup-download-subheader = Pobierz go teraz i zachowaj
inline-recovery-key-setup-download-info = Zachowaj ten klucz w miejscu, które zapamiętasz — nie będzie można później wrócić do tej strony.
inline-recovery-key-setup-hint-header = Zalecenie dotyczące bezpieczeństwa


inline-totp-setup-cancel-setup-button = Anuluj konfigurację
inline-totp-setup-continue-button = Kontynuuj
inline-totp-setup-add-security-link = Dodaj warstwę zabezpieczeń do swojego konta — kody uwierzytelniania z jednej z <authenticationAppsLink>tych aplikacji uwierzytelniających</authenticationAppsLink>.
inline-totp-setup-enable-two-step-authentication-default-header-2 = Włącz uwierzytelnianie dwuetapowe, <span>aby przejść do ustawień konta</span>
inline-totp-setup-enable-two-step-authentication-custom-header-2 = Włącz uwierzytelnianie dwuetapowe, <span>aby przejść do usługi { $serviceName }</span>
inline-totp-setup-ready-button = Gotowe
inline-totp-setup-show-qr-custom-service-header-2 = Zeskanuj kod uwierzytelniania, <span>aby przejść do usługi { $serviceName }</span>
inline-totp-setup-no-qr-custom-service-header-2 = Wpisz kod ręcznie, <span>aby przejść do usługi { $serviceName }</span>
inline-totp-setup-show-qr-default-service-header-2 = Zeskanuj kod uwierzytelniania, <span>aby przejść do ustawień konta</span>
inline-totp-setup-no-qr-default-service-header-2 = Wpisz kod ręcznie, <span>aby przejść do ustawień konta</span>
inline-totp-setup-enter-key-or-use-qr-instructions = Wpisz ten tajny klucz w aplikacji uwierzytelniającej. <toggleToQRButton>Czy zamiast tego zeskanować kod QR?</toggleToQRButton>
inline-totp-setup-use-qr-or-enter-key-instructions = Zeskanuj kod QR w aplikacji uwierzytelniającej, a następnie wpisz podany przez nią kod uwierzytelniania. <toggleToManualModeButton>Nie możesz zeskanować kodu?</toggleToManualModeButton>
inline-totp-setup-on-completion-description = Po ukończeniu zacznie tworzyć kody uwierzytelniania, które należy podać.
inline-totp-setup-security-code-placeholder = Kod uwierzytelniania
inline-totp-setup-code-required-error = Wymagany jest kod uwierzytelniania
tfa-qr-code-alt = Użyj kodu { $code }, aby skonfigurować uwierzytelnianie dwuetapowe w obsługiwanych aplikacjach.
inline-totp-setup-page-title = Uwierzytelnianie dwuetapowe


legal-header = Podstawa prawna
legal-terms-of-service-link = Regulamin usługi
legal-privacy-link = Zasady ochrony prywatności


legal-privacy-heading = Zasady ochrony prywatności


legal-terms-heading = Regulamin usługi


pair-auth-allow-heading-text = Czy właśnie zalogowano się do { -product-firefox(case: "gen") }?
pair-auth-allow-confirm-button = Tak, zatwierdź urządzenie
pair-auth-allow-refuse-device-link = Jeśli to nie Ty, <link>zmień hasło</link>


pair-auth-complete-heading = Połączono urządzenie
pair-auth-complete-now-syncing-device-text = { $deviceFamily } w systemie { $deviceOS } będzie teraz synchronizowany
pair-auth-complete-sync-benefits-text = Masz teraz dostęp do otwartych kart, haseł i zakładek na wszystkich urządzeniach.
pair-auth-complete-see-tabs-button = Wyświetl karty z synchronizowanych urządzeń
pair-auth-complete-manage-devices-link = Zarządzaj urządzeniami


auth-totp-heading-w-default-service = Wpisz kod uwierzytelniania, <span>aby przejść do ustawień konta</span>
auth-totp-heading-w-custom-service = Wpisz kod uwierzytelniania, <span>aby przejść do usługi { $serviceName }</span>
auth-totp-instruction = Otwórz aplikację uwierzytelniającą i wpisz podany przez nią kod uwierzytelniania.
auth-totp-input-label = Wpisz sześciocyfrowy kod
auth-totp-confirm-button = Potwierdź
auth-totp-code-required-error = Wymagany jest kod uwierzytelniania


pair-wait-for-supp-heading-text = Teraz wymagane jest zatwierdzenie <span>z innego używanego urządzenia</span>


pair-failure-header = Powiązanie się nie powiodło
pair-failure-message = Proces konfiguracji został przerwany.


pair-sync-header = Synchronizuj { -brand-firefox(case: "acc") } na telefonie lub tablecie
pair-cad-header = Połącz { -brand-firefox(case: "acc") } na innym urządzeniu
pair-already-have-firefox-paragraph = Masz już { -brand-firefox(case: "acc") } na telefonie lub tablecie?
pair-sync-your-device-button = Synchronizuj swoje urządzenie
pair-or-download-subheader = Lub pobierz
pair-scan-to-download-message = Zeskanuj, aby pobrać { -brand-firefox(case: "acc") } na telefon, albo wyślij sobie <linkExternal>odnośnik do pobrania</linkExternal>.
pair-not-now-button = Nie teraz
pair-take-your-data-message = Korzystaj ze swoich kart, zakładek i haseł wszędzie, gdzie używasz { -brand-firefox(case: "acc") }.
pair-get-started-button = Zacznij teraz
pair-qr-code-aria-label = Kod QR


pair-success-header-2 = Połączono urządzenie
pair-success-message-2 = Pomyślnie powiązano.


pair-supp-allow-heading-text = Potwierdź powiązanie <span>dla adresu { $email }</span>
pair-supp-allow-confirm-button = Potwierdź powiązanie
pair-supp-allow-cancel-link = Anuluj


pair-wait-for-auth-heading-text = Teraz wymagane jest zatwierdzenie <span>z innego używanego urządzenia</span>


pair-unsupported-header = Powiąż za pomocą aplikacji
pair-unsupported-message = Czy użyto aparatu systemowego? Należy powiązać z poziomu aplikacji { -brand-firefox }.




set-password-heading-v2 = Utwórz hasło, aby synchronizować
set-password-info-v2 = To hasło szyfruje Twoje dane. Musi być inne niż Twoje hasło do konta { -brand-google } lub { -brand-apple }.


third-party-auth-callback-message = Proszę czekać, następuje przekierowanie do upoważnionej aplikacji.


account-recovery-confirm-key-heading = Wpisz klucz odzyskiwania konta
account-recovery-confirm-key-instruction = Ten klucz umożliwia odzyskanie zaszyfrowanych danych przeglądania, takich jak hasła i zakładki, z serwerów { -brand-firefox(case: "gen") }.
account-recovery-confirm-key-input-label =
    .label = Wpisz 32-znakowy klucz odzyskiwania konta
account-recovery-confirm-key-hint = Wskazówka o miejscu przechowywania:
account-recovery-confirm-key-button-2 = Kontynuuj
account-recovery-lost-recovery-key-link-2 = Nie możesz znaleźć klucza odzyskiwania konta?


complete-reset-pw-header-v2 = Utwórz nowe hasło
complete-reset-password-success-alert = Ustawiono hasło
complete-reset-password-error-alert = Przepraszamy, wystąpił problem z ustawieniem hasła
complete-reset-pw-recovery-key-link = Użyj klucza odzyskiwania konta
reset-password-complete-banner-heading = Zmieniono hasło.
reset-password-complete-banner-message = Nie zapomnij utworzyć nowego klucza odzyskiwania konta w ustawieniach { -product-mozilla-account(case: "gen", capitalization: "lower") }, aby zapobiec przyszłym problemom z logowaniem.
complete-reset-password-desktop-relay = { -brand-firefox } po zalogowaniu spróbuje odesłać Cię do użycia maski dla adresu e-mail.


confirm-backup-code-reset-password-input-label = Wpisz 10-znakowy kod
confirm-backup-code-reset-password-confirm-button = Potwierdź
confirm-backup-code-reset-password-subheader = Wpisz zapasowy kod uwierzytelniania
confirm-backup-code-reset-password-instruction = Wpisz jeden z jednorazowych kodów zachowanych podczas konfigurowania uwierzytelniania dwuetapowego.
confirm-backup-code-reset-password-locked-out-link = Nie możesz się zalogować?


confirm-reset-password-with-code-heading = Sprawdź pocztę
confirm-reset-password-with-code-instruction = Wysłano kod potwierdzenia na adres <span>{ $email }</span>.
confirm-reset-password-code-input-group-label = Wpisz 8-cyfrowy kod w ciągu 10 minut
confirm-reset-password-otp-submit-button = Kontynuuj
confirm-reset-password-otp-resend-code-button = Wyślij ponownie kod
confirm-reset-password-otp-different-account-link = Użyj innego konta


confirm-totp-reset-password-header = Zmień hasło
confirm-totp-reset-password-subheader-v2 = Wpisz kod uwierzytelniania dwuetapowego
confirm-totp-reset-password-instruction-v2 = Sprawdź <strong>aplikację uwierzytelniającą</strong>, aby zmienić hasło.
confirm-totp-reset-password-trouble-code = Masz problem z wpisywaniem kodu?
confirm-totp-reset-password-confirm-button = Potwierdź
confirm-totp-reset-password-input-label-v2 = Wpisz sześciocyfrowy kod
confirm-totp-reset-password-use-different-account = Użyj innego konta


password-reset-flow-heading = Zmień hasło
password-reset-body-2 = Zapytamy Cię o kilka rzeczy znanych tylko Tobie, aby zapewnić bezpieczeństwo Twojego konta.
password-reset-email-input =
    .label = Wpisz adres e-mail
password-reset-submit-button-2 = Kontynuuj


reset-password-complete-header = Zmieniono hasło
reset-password-confirmed-cta = Przejdź do usługi { $serviceName }




password-reset-recovery-method-header = Zmień hasło
password-reset-recovery-method-subheader = Wybierz metodę odzyskiwania
password-reset-recovery-method-details = Upewnijmy się, że to Ty korzystasz ze swoich metod odzyskiwania.
password-reset-recovery-method-phone = Telefon odzyskiwania
password-reset-recovery-method-code = Zapasowe kody uwierzytelniania
password-reset-recovery-method-code-info =
    { $numBackupCodes ->
        [one] Został { $numBackupCodes } kod
        [few] Zostały { $numBackupCodes } kody
       *[many] Zostało { $numBackupCodes } kodów
    }
password-reset-recovery-method-send-code-error-heading = Wystąpił problem podczas wysyłania kodu do telefonu odzyskiwania
password-reset-recovery-method-send-code-error-description = Proszę spróbować ponownie później lub użyć zapasowych kodów uwierzytelniania.


reset-password-recovery-phone-flow-heading = Zmień hasło
reset-password-recovery-phone-heading = Wpisz kod odzyskiwania
reset-password-recovery-phone-instruction-v3 = Sześciocyfrowy kod został wysłany na numer telefony kończący się na <span>{ $lastFourPhoneDigits }</span> wiadomością SMS. Ten kod wygasa w ciągu 5 minut. Nie udostępniaj go nikomu.
reset-password-recovery-phone-input-label = Wpisz sześciocyfrowy kod
reset-password-recovery-phone-code-submit-button = Potwierdź
reset-password-recovery-phone-resend-code-button = Wyślij ponownie kod
reset-password-recovery-phone-resend-success = Wysłano kod
reset-password-recovery-phone-locked-out-link = Nie możesz się zalogować?
reset-password-recovery-phone-send-code-error-heading = Wystąpił problem podczas wysyłania kodu
reset-password-recovery-phone-code-verification-error-heading = Wystąpił problem podczas weryfikowania kodu
reset-password-recovery-phone-general-error-description = Proszę spróbować ponownie później.
reset-password-recovery-phone-invalid-code-error-description = Kod jest nieprawidłowy lub wygasł.
reset-password-recovery-phone-invalid-code-error-link = Czy zamiast tego użyć zapasowych kodów uwierzytelniania?
reset-password-with-recovery-key-verified-page-title = Pomyślnie zmieniono hasło
reset-password-complete-new-password-saved = Zachowano nowe hasło
reset-password-complete-recovery-key-created = Utworzono nowy klucz odzyskiwania konta. Teraz pobierz go i zachowaj.
reset-password-complete-recovery-key-download-info =
    Ten klucz jest niezbędny do odzyskania danych, jeśli zapomnisz hasła.
    <b>Pobierz go teraz i zachowaj w bezpiecznym miejscu, ponieważ później
    nie będziesz mieć dostępu do tej strony.</b>


error-label = Błąd:
validating-signin = Weryfikowanie logowania…
complete-signin-error-header = Błąd potwierdzenia
signin-link-expired-header = Odnośnik potwierdzenia wygasł
signin-link-expired-message-2 = Kliknięty odnośnik wygasł lub został już wykorzystany.


signin-password-needed-header-2 = Wpisz hasło <span>do { -product-mozilla-account(case: "gen", capitalization: "lower") }</span>
signin-subheader-without-logo-with-servicename = Przejdź do usługi { $serviceName }
signin-subheader-without-logo-default = Przejdź do ustawień konta
signin-button = Zaloguj się
signin-header = Zaloguj się
signin-use-a-different-account-link = Użyj innego konta
signin-forgot-password-link = Nie pamiętasz hasła?
signin-password-button-label = Hasło
signin-desktop-relay = { -brand-firefox } po zalogowaniu spróbuje odesłać Cię do użycia maski dla adresu e-mail.
signin-code-expired-error = Kod wygasł. Zaloguj się ponownie.
signin-recovery-error = Coś się nie powiodło. Zaloguj się ponownie.
signin-account-locked-banner-heading = Zmień hasło
signin-account-locked-banner-description = Zablokowaliśmy Twoje konto, aby chronić je przed podejrzaną aktywnością.
signin-account-locked-banner-link = Zmień hasło, aby się zalogować


report-signin-link-damaged-body = W klikniętym odnośniku brakuje znaków. Mógł on zostać uszkodzony przez klienta poczty. Starannie skopiuj adres i spróbuj ponownie.
report-signin-header = Zgłosić nieupoważnione logowanie?
report-signin-body = To wiadomość o próbie dostępu do konta. Czy zgłosić ją jako podejrzaną?
report-signin-submit-button = Zgłoś działanie
report-signin-support-link = Dlaczego to się stało?
report-signin-error = Podczas przesyłania zgłoszenia wystąpił błąd.
signin-bounced-header = Konto zostało zablokowane.
signin-bounced-message = Wiadomość z potwierdzeniem wysłana na adres { $email } została zwrócona, więc konto zostało zablokowane, aby chronić dane użytkownika { -brand-firefox(case: "gen") }.
signin-bounced-help = Jeśli to prawidłowy adres e-mail, to <linkExternal>daj nam znać</linkExternal>, a pomożemy w odblokowaniu konta.
signin-bounced-create-new-account = Ten adres e-mail zmienił właściciela? Utwórz nowe konto
back = Wstecz


signin-passkey-fallback-password-label = Hasło
signin-passkey-fallback-go-to-settings = Przejdź do ustawień
signin-passkey-fallback-continue = Kontynuuj


signin-push-code-heading-w-default-service = Zweryfikuj to logowanie, <span>aby przejść do ustawień konta</span>
signin-push-code-heading-w-custom-service = Zweryfikuj to logowanie, <span>aby przejść do usługi { $serviceName }</span>
signin-push-code-instruction = Sprawdź inne swoje urządzenia i zatwierdź to logowanie w przeglądarce { -brand-firefox }.
signin-push-code-did-not-recieve = Powiadomienie nie doszło?
signin-push-code-send-email-link = Wyślij kod na e-mail


signin-push-code-confirm-instruction = Potwierdź logowanie
signin-push-code-confirm-description = Wykryliśmy próbę logowania z poniższego urządzenia. Jeśli to Ty, zatwierdź logowanie
signin-push-code-confirm-verifying = Weryfikowanie
signin-push-code-confirm-login = Potwierdź logowanie
signin-push-code-confirm-wasnt-me = To nie ja, zmień hasło.
signin-push-code-confirm-login-approved = Logowanie zostało zatwierdzone. Zamknij to okno.
signin-push-code-confirm-link-error = Odnośnik jest uszkodzony. Proszę spróbować ponownie.


signin-recovery-method-header = Zaloguj się
signin-recovery-method-subheader = Wybierz metodę odzyskiwania
signin-recovery-method-details = Upewnijmy się, że to Ty korzystasz ze swoich metod odzyskiwania.
signin-recovery-method-phone = Telefon odzyskiwania
signin-recovery-method-code-v2 = Zapasowe kody uwierzytelniania
signin-recovery-method-code-info-v2 =
    { $numBackupCodes ->
        [one] Został { $numBackupCodes } kod
        [few] Zostały { $numBackupCodes } kody
       *[many] Zostało { $numBackupCodes } kodów
    }
signin-recovery-method-send-code-error-heading = Wystąpił problem podczas wysyłania kodu do telefonu odzyskiwania
signin-recovery-method-send-code-error-description = Proszę spróbować ponownie później lub użyć zapasowych kodów uwierzytelniania.


signin-recovery-code-heading = Zaloguj się
signin-recovery-code-sub-heading = Wpisz zapasowy kod uwierzytelniania
signin-recovery-code-instruction-v3 = Wpisz jeden z jednorazowych kodów zachowanych podczas konfigurowania uwierzytelniania dwuetapowego.
signin-recovery-code-input-label-v2 = Wpisz 10-znakowy kod
signin-recovery-code-confirm-button = Potwierdź
signin-recovery-code-phone-link = Użyj telefonu odzyskiwania
signin-recovery-code-support-link = Nie możesz się zalogować?
signin-recovery-code-required-error = Wymagany jest zapasowy kod uwierzytelniania
signin-recovery-code-use-phone-failure = Wystąpił problem podczas wysyłania kodu do telefonu odzyskiwania
signin-recovery-code-use-phone-failure-description = Proszę spróbować ponownie później.


signin-recovery-phone-flow-heading = Zaloguj się
signin-recovery-phone-heading = Wpisz kod odzyskiwania
signin-recovery-phone-instruction-v3 = Sześciocyfrowy kod został wysłany na numer telefony kończący się na <span>{ $lastFourPhoneDigits }</span> wiadomością SMS. Ten kod wygasa w ciągu 5 minut. Nie udostępniaj go nikomu.
signin-recovery-phone-input-label = Wpisz sześciocyfrowy kod
signin-recovery-phone-code-submit-button = Potwierdź
signin-recovery-phone-resend-code-button = Wyślij ponownie kod
signin-recovery-phone-resend-success = Wysłano kod
signin-recovery-phone-locked-out-link = Nie możesz się zalogować?
signin-recovery-phone-send-code-error-heading = Wystąpił problem podczas wysyłania kodu
signin-recovery-phone-code-verification-error-heading = Wystąpił problem podczas weryfikowania kodu
signin-recovery-phone-general-error-description = Proszę spróbować ponownie później.
signin-recovery-phone-invalid-code-error-description = Kod jest nieprawidłowy lub wygasł.
signin-recovery-phone-invalid-code-error-link = Czy zamiast tego użyć zapasowych kodów uwierzytelniania?
signin-recovery-phone-success-message = Pomyślnie zalogowano. Mogą obowiązywać ograniczenia, jeśli ponownie użyjesz telefonu odzyskiwania.


signin-reported-header = Dziękujemy za czujność
signin-reported-message = Nasz zespół został powiadomiony. Zgłoszenia pomagają nam odpędzać intruzów.


signin-token-code-heading-2 = Wpisz kod potwierdzenia <span>do { -product-mozilla-account(case: "gen", capitalization: "lower") }</span>
signin-token-code-instruction-v2 = Wpisz kod potwierdzenia wysłany na adres <email>{ $email }</email> w ciągu 5 minut.
signin-token-code-input-label-v2 = Wpisz sześciocyfrowy kod
signin-token-code-confirm-button = Potwierdź
signin-token-code-code-expired = Kod wygasł?
signin-token-code-resend-code-link = Wyślij nowy.
signin-token-code-required-error = Wymagany jest kod potwierdzenia
signin-token-code-resend-error = Coś się nie powiodło. Nie można wysłać nowego kodu.
signin-token-code-instruction-desktop-relay = { -brand-firefox } po zalogowaniu spróbuje odesłać Cię do użycia maski dla adresu e-mail.


signin-totp-code-header = Zaloguj się
signin-totp-code-subheader-v2 = Wpisz kod uwierzytelniania dwuetapowego
signin-totp-code-instruction-v4 = Sprawdź <strong>aplikację uwierzytelniającą</strong>, aby potwierdzić logowanie.
signin-totp-code-input-label-v4 = Wpisz sześciocyfrowy kod
signin-totp-code-aal-banner-header = Dlaczego musisz się uwierzytelnić?
signin-totp-code-aal-banner-content = Skonfigurowałeś uwierzytelnianie dwuetapowe na swoim koncie, ale jeszcze nie zalogowałeś się za pomocą kodu na tym urządzeniu.
signin-totp-code-aal-sign-out = Wyloguj się na tym urządzeniu
signin-totp-code-aal-sign-out-error = Przepraszamy, wystąpił problem z wylogowaniem
signin-totp-code-confirm-button = Potwierdź
signin-totp-code-other-account-link = Użyj innego konta
signin-totp-code-recovery-code-link = Masz problem z wpisywaniem kodu?
signin-totp-code-required-error = Wymagany jest kod uwierzytelniania
signin-totp-code-desktop-relay = { -brand-firefox } po zalogowaniu spróbuje odesłać Cię do użycia maski dla adresu e-mail.


signin-unblock-header = Upoważnij to logowanie
signin-unblock-body = Sprawdź, czy na koncie { $email } jest kod upoważnienia.
signin-unblock-code-input = Wpisz kod upoważnienia
signin-unblock-submit-button = Kontynuuj
signin-unblock-code-required-error = Wymagany jest kod upoważnienia
signin-unblock-code-incorrect-length = Kod upoważnienia musi mieć 8 znaków
signin-unblock-code-incorrect-format-2 = Kod upoważnienia może zawierać tylko litery i cyfry
signin-unblock-resend-code-button = Nie ma nic w Odebranych ani w Niechcianych? Wyślij jeszcze raz
signin-unblock-support-link = Dlaczego to się stało?
signin-unblock-desktop-relay = { -brand-firefox } po zalogowaniu spróbuje odesłać Cię do użycia maski dla adresu e-mail.




confirm-signup-code-page-title = Wpisz kod potwierdzenia
confirm-signup-code-heading-2 = Wpisz kod potwierdzenia <span>do { -product-mozilla-account(case: "gen", capitalization: "lower") }</span>
confirm-signup-code-instruction-v2 = Wpisz kod potwierdzenia wysłany na adres <email>{ $email }</email> w ciągu 5 minut.
confirm-signup-code-input-label = Wpisz sześciocyfrowy kod
confirm-signup-code-confirm-button = Potwierdź
confirm-signup-code-sync-button = Zacznij synchronizować
confirm-signup-code-code-expired = Kod wygasł?
confirm-signup-code-resend-code-link = Wyślij nowy.
confirm-signup-code-success-alert = Pomyślnie potwierdzono konto
confirm-signup-code-is-required-error = Wymagany jest kod potwierdzenia
confirm-signup-code-desktop-relay = { -brand-firefox } po zalogowaniu spróbuje odesłać Cię do użycia maski dla adresu e-mail.


signup-heading-v2 = Utwórz hasło
signup-relay-info = Hasło jest potrzebne do bezpiecznego zarządzania zamaskowanymi adresami e-mail i do dostępu do narzędzi bezpieczeństwa { -brand-mozilla(case: "gen") }.
signup-sync-info = Synchronizuj hasła, zakładki i inne dane wszędzie tam, gdzie używasz { -brand-firefox(case: "acc") }.
signup-sync-info-with-payment = Synchronizuj hasła, metody płatności, zakładki i inne dane wszędzie tam, gdzie używasz { -brand-firefox(case: "acc") }.
signup-change-email-link = Zmień adres e-mail


signup-confirmed-sync-header = Synchronizacja jest włączona
signup-confirmed-sync-success-banner = Potwierdzono { -product-mozilla-account(case: "acc", capitalization: "lower") }
signup-confirmed-sync-button = Zacznij przeglądać Internet
signup-confirmed-sync-description-with-payment-v2 = Twoje hasła, metody płatności, adresy, zakładki, historia i inne dane mogą być synchronizowane wszędzie tam, gdzie używasz { -brand-firefox(case: "acc") }.
signup-confirmed-sync-description-v2 = Twoje hasła, adresy, zakładki, historia i inne dane mogą być synchronizowane wszędzie tam, gdzie używasz { -brand-firefox(case: "acc") }.
signup-confirmed-sync-add-device-link = Dodaj następne urządzenie
signup-confirmed-sync-manage-sync-button = Zarządzaj synchronizacją
signup-confirmed-sync-set-password-success-banner = Utworzono hasło synchronizacji
