



-brand-mozilla =
    { $case ->
        [gen] Mozilly
        [dat] Mozille
        [acc] Mozillu
        [loc] Mozille
        [ins] Mozillou
       *[nom] Mozilla
    }
    .gender = feminine
-brand-firefox =
    { $case ->
        [gen] Firefoxu
        [dat] Firefoxu
        [acc] Firefox
        [loc] Firefoxe
        [ins] Firefoxom
       *[nom] Firefox
    }
    .gender = masculine
-product-firefox-accounts =
    { $case ->
        [gen]
            { $capitalization ->
                [lower] účtov Firefox
               *[upper] Účtov Firefox
            }
        [dat]
            { $capitalization ->
                [lower] účtom Firefox
               *[upper] Účtom Firefox
            }
        [acc]
            { $capitalization ->
                [lower] účty Firefox
               *[upper] Účty Firefox
            }
        [loc]
            { $capitalization ->
                [lower] účtoch Firefox
               *[upper] Účtoch Firefox
            }
        [ins]
            { $capitalization ->
                [lower] účtami Firefox
               *[upper] Účtami Firefox
            }
       *[nom]
            { $capitalization ->
                [lower] účty Firefox
               *[upper] Účty Firefox
            }
    }
-product-mozilla-account =
    { $case ->
        [gen]
            { $capitalization ->
                [lower] účtu Mozilla
               *[upper] Účtu Mozilla
            }
        [dat]
            { $capitalization ->
                [lower] účtu Mozilla
               *[upper] Účtu Mozilla
            }
        [acc]
            { $capitalization ->
                [lower] účet Mozilla
               *[upper] Účet Mozilla
            }
        [loc]
            { $capitalization ->
                [lower] účte Mozilla
               *[upper] Účte Mozilla
            }
        [ins]
            { $capitalization ->
                [lower] účtom Mozilla
               *[upper] Účtom Mozilla
            }
       *[nom]
            { $capitalization ->
                [lower] účet Mozilla
               *[upper] Účet Mozilla
            }
    }
-product-mozilla-accounts =
    { $case ->
        [gen]
            { $capitalization ->
                [lower] účtov Mozilla
               *[upper] Účtov Mozilla
            }
        [dat]
            { $capitalization ->
                [lower] účtom Mozilla
               *[upper] Účtom Mozilla
            }
        [acc]
            { $capitalization ->
                [lower] účty Mozilla
               *[upper] Účty Mozilla
            }
        [loc]
            { $capitalization ->
                [lower] účtoch Mozilla
               *[upper] Účtoch Mozilla
            }
        [ins]
            { $capitalization ->
                [lower] účtami Mozilla
               *[upper] Účtami Mozilla
            }
       *[nom]
            { $capitalization ->
                [lower] účty Mozilla
               *[upper] Účty Mozilla
            }
    }
-product-firefox-account =
    { $case ->
        [gen]
            { $capitalization ->
                [lower] účtu Firefox
               *[upper] Účtu Firefox
            }
        [dat]
            { $capitalization ->
                [lower] účtu Firefox
               *[upper] Účtu Firefox
            }
        [acc]
            { $capitalization ->
                [lower] účet Firefox
               *[upper] Účet Firefox
            }
        [loc]
            { $capitalization ->
                [lower] účte Firefox
               *[upper] Účte Firefox
            }
        [ins]
            { $capitalization ->
                [lower] účtom Firefox
               *[upper] Účtom Firefox
            }
       *[nom]
            { $capitalization ->
                [lower] účet Firefox
               *[upper] Účet Firefox
            }
    }
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

app-general-err-heading = Všeobecná chyba aplikácie
app-general-err-message = Niečo sa pokazilo. Skúste to znova neskôr.
app-query-parameter-err-heading = Nesprávna požiadavka: neplatné parametre dopytu


app-footer-mozilla-logo-label = Logo { -brand-mozilla(case: "gen") }
app-footer-privacy-notice = Vyhlásenie o ochrane osobných údajov webovej stránky
app-footer-terms-of-service = Podmienky používania služby


app-default-title-2 = { -product-mozilla-accounts }
app-page-title-2 = { $title } | { -product-mozilla-accounts }


link-sr-new-window = Otvorí sa v novom okne


app-loading-spinner-aria-label-loading = Načítava sa…


app-logo-alt-3 =
    .alt = Logo { -brand-mozilla } m



resend-code-success-banner-heading = Na váš e‑mail bol odoslaný nový kód.
resend-link-success-banner-heading = Na váš e‑mail bol odoslaný nový odkaz.
resend-success-banner-description = Pridajte si do svojich kontaktov adresu { $accountsEmail }. Zabezpečíte tým bezproblémové doručenie.


brand-banner-dismiss-button-2 =
    .aria-label = Zavrieť oznámenie
brand-prelaunch-title = { -product-firefox-accounts } sa 1. novembra premenujú na { -product-mozilla-accounts }
brand-prelaunch-subtitle = Naďalej sa budete prihlasovať pomocou rovnakého používateľského mena a hesla a v produktoch, ktoré používate, nenastanú žiadne ďalšie zmeny.
brand-postlaunch-title = { -product-firefox-accounts } sme premenovali na { -product-mozilla-accounts }. Naďalej sa budete prihlasovať pomocou rovnakého používateľského mena a hesla a v produktoch, ktoré používate, nenastanú žiadne ďalšie zmeny.
brand-learn-more = Ďalšie informácie
brand-close-banner =
    .alt = Zavrieť oznámenie
brand-m-logo =
    .alt = Logo { -brand-mozilla } m


button-back-aria-label = Naspäť
button-back-title = Naspäť


recovery-key-download-button-v3 = Stiahnuť a pokračovať
    .title = Stiahnuť a pokračovať
recovery-key-pdf-heading = Kľúč na obnovenie účtu
recovery-key-pdf-download-date = Vygenerovaný: { $date }
recovery-key-pdf-key-legend = Kľúč na obnovenie účtu
recovery-key-pdf-instructions = Tento kľúč vám umožňuje obnoviť zašifrované údaje prehliadača (vrátane hesiel, záložiek a histórie), ak zabudnete heslo. Uložte ho na mieste, ktoré si zapamätáte.
recovery-key-pdf-storage-ideas-heading = Miesta na uloženie kľúča
recovery-key-pdf-support = Ďalšie informácie o kľúči na obnovenie účtu
recovery-key-pdf-download-error = Ľutujeme, pri sťahovaní kľúča na obnovenie účtu sa vyskytol problém.


choose-newsletters-prompt-2 = Získajte viac od { -brand-mozilla(case: "gen") }:
choose-newsletters-option-latest-news =
    .label = Získajte naše najnovšie správy a aktualizácie produktov
choose-newsletters-option-test-pilot =
    .label = Prístup k ranému testovaniu nových produktov
choose-newsletters-option-reclaim-the-internet =
    .label = Výzvy na opätovné získanie internetu


datablock-download =
    .message = Stiahnuté
datablock-copy =
    .message = Skopírovaný
datablock-print =
    .message = Vytlačený


datablock-copy-success =
    { $count ->
        [one] Kód skopírovaný
        [few] Kódy skopírované
        [many] Kódy skopírované
       *[other] Kódy skopírované
    }
datablock-download-success =
    { $count ->
        [one] Kód stiahnutý
        [few] Kódy stiahnuté
        [many] Kódy stiahnuté
       *[other] Kódy stiahnuté
    }
datablock-print-success =
    { $count ->
        [one] Kód vytlačený
        [few] Kódy vytlačené
        [many] Kódy vytlačené
       *[other] Kódy vytlačené
    }


datablock-inline-copy =
    .message = Skopírovaný


device-info-block-location-city-region-country = { $city }, { $region }, { $country } (odhadnuté)
device-info-block-location-region-country = { $region }, { $country } (odhadnuté)
device-info-block-location-city-country = { $city }, { $country } (odhadnuté)
device-info-block-location-country = { $country } (odhadnuté)
device-info-block-location-unknown = Neznáma poloha
device-info-browser-os = { $browserName } na { $genericOSName }
device-info-ip-address = IP adresa: { $ipAddress }


form-password-with-inline-criteria-signup-new-password-label =
    .label = Heslo
form-password-with-inline-criteria-signup-confirm-password-label =
    .label = Zopakujte heslo
form-password-with-inline-criteria-signup-submit-button = Vytvoriť účet
form-password-with-inline-criteria-reset-new-password =
    .label = Nové heslo
form-password-with-inline-criteria-confirm-password =
    .label = Potvrďte heslo
form-password-with-inline-criteria-reset-submit-button = Vytvoriť nové heslo
form-password-with-inline-criteria-set-password-new-password-label =
    .label = Heslo
form-password-with-inline-criteria-set-password-confirm-password-label =
    .label = Zopakujte heslo
form-password-with-inline-criteria-set-password-submit-button = Spustiť synchronizáciu
form-password-with-inline-criteria-match-error = Heslá sa nezhodujú
form-password-with-inline-criteria-sr-too-short-message = Heslo musí obsahovať aspoň 8 znakov.
form-password-with-inline-criteria-sr-not-email-message = Heslo nesmie obsahovať vašu e‑mailovú adresu.
form-password-with-inline-criteria-sr-not-common-message = Heslo nesmie byť bežne používané heslo.
form-password-with-inline-criteria-sr-requirements-met = Zadané heslo rešpektuje všetky požiadavky na heslo.
form-password-with-inline-criteria-sr-passwords-match = Zadané heslá sa zhodujú.


form-verify-code-default-error = Toto pole je povinné


form-verify-totp-disabled-button-title-numeric = Ak chcete pokračovať, zadajte { $codeLength }-miestny číselný kód
form-verify-totp-disabled-button-title-alphanumeric = Ak chcete pokračovať, zadajte { $codeLength }-miestny kód


get-data-trio-title-firefox = { -brand-firefox }
get-data-trio-title-firefox-recovery-key = Kľúč na obnovenie účtu { -brand-firefox }
get-data-trio-title-backup-verification-codes = Záložné overovacie kódy
get-data-trio-download-2 =
    .title = Stiahnuť
    .aria-label = Stiahnuť
get-data-trio-copy-2 =
    .title = Kopírovať
    .aria-label = Kopírovať
get-data-trio-print-2 =
    .title = Tlačiť
    .aria-label = Tlačiť


alert-icon-aria-label =
    .aria-label = Upozornenie
icon-attention-aria-label =
    .aria-label = Pozor
icon-warning-aria-label =
    .aria-label = Upozornenie
authenticator-app-aria-label =
    .aria-label = Overovacia aplikácia
backup-codes-icon-aria-label-v2 =
    .aria-label = Záložné overovacie kódy sú povolené
backup-codes-disabled-icon-aria-label-v2 =
    .aria-label = Záložné overovacie kódy sú vypnuté
backup-recovery-sms-icon-aria-label =
    .aria-label = SMS na obnovenie sú povolené
backup-recovery-sms-disabled-icon-aria-label =
    .aria-label = SMS na obnovenie sú vypnuté
canadian-flag-icon-aria-label =
    .aria-label = Kanadská vlajka
checkmark-icon-aria-label =
    .aria-label = Znak označenia
checkmark-success-icon-aria-label =
    .aria-label = Úspech
checkmark-enabled-icon-aria-label =
    .aria-label = Povolené
close-icon-aria-label =
    .aria-label = Zavrieť správu
code-icon-aria-label =
    .aria-label = Kód
error-icon-aria-label =
    .aria-label = Chyba
info-icon-aria-label =
    .aria-label = Informácia
usa-flag-icon-aria-label =
    .aria-label = Vlajka Spojených štátov amerických


hearts-broken-image-aria-label =
    .aria-label = Počítač a mobilný telefón a na každom obrázok zlomeného srdca
hearts-verified-image-aria-label =
    .aria-label = Počítač, mobilný telefón a tablet a na každom pulzujúce srdiečko
signin-recovery-code-image-description =
    .aria-label = Dokument, ktorý obsahuje skrytý text.
signin-totp-code-image-label =
    .aria-label = Zariadenie so skrytým šesťmiestnym kódom.
confirm-signup-aria-label =
    .aria-label = Obálka s odkazom
security-shield-aria-label =
    .aria-label = Obrázok predstavujúci kľúč na obnovenie účtu.
recovery-key-image-aria-label =
    .aria-label = Obrázok predstavujúci kľúč na obnovenie účtu.
password-image-aria-label =
    .aria-label = Ilustrácia znázorňujúca zadávanie hesla.
lightbulb-aria-label =
    .aria-label = Ilustrácia znázorňujúca vytváranie tipu na uloženie.
email-code-image-aria-label =
    .aria-label = Ilustrácia znázorňujúca e‑mail obsahujúci kód.
recovery-phone-image-description =
    .aria-label = Mobilné zariadenie, ktoré prijíma kód prostredníctvom textovej správy.
recovery-phone-code-image-description =
    .aria-label = Kód prijatý na mobilné zariadenie.
backup-recovery-phone-image-aria-label =
    .aria-label = Mobilné zariadenie s možnosťou textových správ SMS
backup-authentication-codes-image-aria-label =
    .aria-label = Obrazovka zariadenia s kódmi
sync-clouds-image-aria-label =
    .aria-label = Oblaky s ikonou synchronizácie
confetti-falling-image-aria-label =
    .aria-label = Animované padajúce konfety


inline-recovery-key-setup-signed-in-firefox-2 = Ste prihlásený/-á do { -brand-firefox(case: "gen") }.
inline-recovery-key-setup-create-header = Zabezpečte svoj účet
inline-recovery-key-setup-create-subheader = Máte minútu na ochránenie svojich údajov?
inline-recovery-key-setup-info = Vytvorte si kľúč na obnovenie účtu, aby ste si mohli obnoviť synchronizované údaje prehliadania, ak niekedy zabudnete svoje heslo.
inline-recovery-key-setup-start-button = Vytvoriť kľúč na obnovenie účtu
inline-recovery-key-setup-later-button = Urobím to neskôr


input-password-hide = Skryť heslo
input-password-show = Zobraziť heslo
input-password-hide-aria-2 = Vaše heslo je momentálne viditeľné na obrazovke.
input-password-show-aria-2 = Vaše heslo je momentálne skryté.
input-password-sr-only-now-visible = Vaše heslo je teraz viditeľné na obrazovke.
input-password-sr-only-now-hidden = Vaše heslo je teraz skryté.


input-phone-number-country-list-aria-label = Zvoľte krajinu
input-phone-number-enter-number = Zadajte telefónne číslo
input-phone-number-country-united-states = Spojené štáty americké
input-phone-number-country-canada = Kanada
legal-back-button = Naspäť


reset-pwd-link-damaged-header = Odkaz na zmenu hesla je poškodený
signin-link-damaged-header = Potvrdzovací odkaz je poškodený
report-signin-link-damaged-header = Odkaz je poškodený
reset-pwd-link-damaged-message = Odkaz, na ktorý ste klikli, neobsahuje všetky potrebné znaky. Je možné, že nebol korektne spracovaný vašim e‑mailovým klientom. Skopírujte adresu do prehliadača a skúste to znova.


link-expired-new-link-button = Získať nový odkaz


remember-password-text = Pamätáte si svoje heslo?
remember-password-signin-link = Prihlásiť sa


primary-email-confirmation-link-reused = Hlavná e‑mailová adresa už bola overená
signin-confirmation-link-reused = Prihlásenie je už potvrdené
confirmation-link-reused-message = Tento potvrdzovací odkaz bol už použitý (dá sa použiť len raz).


locale-toggle-select-label = Zvoľte jazyk
locale-toggle-browser-default = Predvolený jazyk prehliadača
error-bad-request = Nesprávna požiadavka


password-info-balloon-why-password-info = Toto heslo potrebujete na prístup ku všetkým zašifrovaným údajom, ktoré u nás ukladáte.
password-info-balloon-reset-risk-info = Zmena hesla môže znamenať stratu údajov, ako sú heslá a záložky.


password-strength-long-instruction = Zvoľte si silné heslo, ktoré ste ešte nepoužívali na iných stránkach. Uistite sa, že spĺňa bezpečnostné požiadavky:
password-strength-short-instruction = Zvoľte si silné heslo:
password-strength-inline-min-length = Minimálne 8 znakov
password-strength-inline-not-email = Nie je to vaša e‑mailová adresa
password-strength-inline-not-common = Nie je to bežne používané heslo
password-strength-inline-confirmed-must-match = Potvrdenie sa zhoduje s novým heslom
password-strength-inline-passwords-match = Heslá sa zhodujú


account-recovery-notification-cta = Vytvoriť
account-recovery-notification-header-value = Ak zabudnete heslo, neprídete o svoje údaje
account-recovery-notification-header-description = Vytvorte si kľúč na obnovenie účtu na obnovenie synchronizovaných údajov prehliadania, ak niekedy zabudnete svoje heslo.
recovery-phone-promo-cta = Pridajte obnovenie pomocou telefónu
recovery-phone-promo-heading = Pridajte svojmu účtu dodatočnú ochranu vďaka obnoveniu pomocou telefónu
recovery-phone-promo-description = Ak nemôžete použiť aplikáciu na dvojstupňové overenie, teraz sa môžete prihlásiť jednorazovým heslom zaslaným prostredníctvom SMS.
recovery-phone-promo-info-link = Ďalšie informácie o obnovení a rizikách pri výmene SIM karty
promo-banner-dismiss-button =
    .aria-label = Zavrieť banner


ready-complete-set-up-instruction = Dokončite nastavenie zadaním nového hesla na ostatných zariadeniach s { -brand-firefox(case: "ins") }.
manage-your-account-button = Spravovať účet
ready-use-service = Odteraz môžete využívať službu { $serviceName }
ready-use-service-default = Teraz ste pripravení použiť nastavenia účtu
ready-account-ready = Váš účet je pripravený.
ready-continue = Pokračovať
sign-in-complete-header = Prihlásenie potvrdené
sign-up-complete-header = Účet bol potvrdený
primary-email-verified-header = Hlavná e‑mailová adresa bola potvrdená


flow-recovery-key-download-storage-ideas-heading-v2 = Miesta na uloženie kľúča:
flow-recovery-key-download-storage-ideas-folder-v2 = Priečinok na zabezpečenom zariadení
flow-recovery-key-download-storage-ideas-cloud = Dôveryhodné cloudové úložisko
flow-recovery-key-download-storage-ideas-print-v2 = Vytlačená fyzická kópia
flow-recovery-key-download-storage-ideas-pwd-manager = Správca hesiel


flow-recovery-key-hint-header-v2 = Pridajte si pomôcku, ktorá vám pomôže nájsť kľúč
flow-recovery-key-hint-message-v3 = Táto pomôcka by vám mala pomôcť zapamätať si, kde ste uložili kľúč na obnovenie účtu. Zobrazíme vám ju počas procesu zmeny hesla a vašich údajov.
flow-recovery-key-hint-input-v2 =
    .label = Zadajte pomôcku (voliteľné)
flow-recovery-key-hint-cta-text = Dokončiť
flow-recovery-key-hint-char-limit-error = Pomôcka musí obsahovať menej ako 255 znakov.
flow-recovery-key-hint-unsafe-char-error = Pomôcka nemôže obsahovať nebezpečné znaky Unicode. Povolené sú iba písmená, čísla, interpunkčné znamienka a symboly.


password-reset-warning-icon = Upozornenie
password-reset-chevron-expanded = Zbaliť upozornenie
password-reset-chevron-collapsed = Rozbaliť upozornenie
password-reset-data-may-not-be-recovered = Údaje vášho prehliadača nemusia byť obnovené
password-reset-previously-signed-in-device-2 = Máte nejaké zariadenie, na ktorom ste sa predtým prihlásili?
password-reset-data-may-be-saved-locally-2 = Údaje vášho prehliadača môžu byť uložené v danom zariadení. Zmeňte svoje heslo a potom sa prihláste, aby ste obnovili a synchronizovali svoje údaje.
password-reset-no-old-device-2 = Máte nové zariadenie, ale nemáte prístup k žiadnemu zo svojich predchádzajúcich?
password-reset-encrypted-data-cannot-be-recovered-2 = Je nám ľúto, ale vaše šifrované údaje prehliadača na serveroch { -brand-firefox(case: "gen") } nie je možné obnoviť.
password-reset-warning-have-key = Máte kľúč na obnovenie účtu?
password-reset-warning-use-key-link = Použite ho teraz na zmenu hesla a uchovanie údajov


alert-bar-close-message = Zavrieť správu


avatar-your-avatar =
    .alt = Váš avatar
avatar-default-avatar =
    .alt = Predvolený avatar




bento-menu-title-3 = Produkty { -brand-mozilla }
bento-menu-tagline = Ďalšie produkty od { -brand-mozilla(case: "gen") }, ktoré chránia vaše súkromie
bento-menu-vpn-2 = { -product-mozilla-vpn }
bento-menu-monitor-3 = { -product-mozilla-monitor }
bento-menu-firefox-relay-2 = { -product-firefox-relay }
bento-menu-firefox-desktop = Prehliadač { -brand-firefox } pre počítač
bento-menu-firefox-mobile = Prehliadač { -brand-firefox } pre mobilné zariadenia
bento-menu-made-by-mozilla = Od spoločnosti { -brand-mozilla }


connect-another-fx-mobile = Získajte { -brand-firefox } pre mobilné zariadenia
connect-another-find-fx-mobile-2 = Nájdite { -brand-firefox } v { -google-play } a { -app-store }.
connect-another-play-store-image-2 =
    .alt = Stiahnite si { -brand-firefox } na { -google-play }
connect-another-app-store-image-3 =
    .alt = Stiahnite si { -brand-firefox } z { -app-store }


cs-heading = Pripojené služby
cs-description = Všetko, čo používate a k čomu ste sa prihlásili.
cs-cannot-refresh =
    Ľutujeme, pri obnovení zoznamu pripojených služieb sa vyskytol
    problém.
cs-cannot-disconnect = Klient sa nenašiel, nedá sa odpojiť
cs-logged-out-2 = Odhlásené zo služby { $service }
cs-refresh-button =
    .title = Obnoviť pripojené služby
cs-missing-device-help = Chýbajúce alebo duplicitné položky?
cs-disconnect-sync-heading = Odpojiť zo služby Sync


cs-disconnect-sync-content-3 = Údaje vášho prehliadania zostanú aj naďalej na zariadení <span>{ $device }</span>, ale nebudú sa synchronizovať s vaším účtom.
cs-disconnect-sync-reason-3 = Aký je hlavný dôvod odpojenia zariadenia <span>{ $device }</span>?


cs-disconnect-sync-opt-prefix = Zariadenie je:
cs-disconnect-sync-opt-suspicious = podozrivé
cs-disconnect-sync-opt-lost = stratené alebo ukradnuté
cs-disconnect-sync-opt-old = staré alebo nahradené
cs-disconnect-sync-opt-duplicate = duplicitné
cs-disconnect-sync-opt-not-say = neželám si odpovedať


cs-disconnect-advice-confirm = Ok, rozumiem
cs-disconnect-lost-advice-heading = Stratené alebo odcudzené zariadenie bolo odpojené
cs-disconnect-lost-advice-content-3 = Keďže vaše zariadenie bolo stratené alebo odcudzené, mali by ste si v nastaveniach účtu zmeniť heslo pre { -product-mozilla-account(case: "acc", capitalization: "lower") }, aby ste udržali svoje informácie v bezpečí. Mali by ste tiež vyhľadať informácie od výrobcu zariadenia o vzdialenom vymazaní údajov.
cs-disconnect-suspicious-advice-heading = Podozrivé zariadenie je odpojené
cs-disconnect-suspicious-advice-content-2 = Ak je odpojené zariadenie skutočne podozrivé, mali by ste si v nastaveniach účtu zmeniť heslo pre { -product-mozilla-account(case: "acc", capitalization: "lower") }, aby boli vaše informácie v bezpečí. Mali by ste tiež zmeniť všetky ostatné heslá, ktoré ste uložili v prehliadači { -brand-firefox }, zadaním about:logins do panela s adresou.
cs-sign-out-button = Odhlásiť sa


dc-heading = Zhromažďovanie a používanie údajov
dc-subheader-moz-accounts = { -product-mozilla-accounts }
dc-subheader-ff-browser = Prehliadač { -brand-firefox }
dc-subheader-content-2 = Povoliť { -product-mozilla-accounts(capitalization: "lower", case: "dat") } odosielať technické údaje a údaje o interakciách spoločnosti { -brand-mozilla }.
dc-subheader-ff-content = Ak chcete skontrolovať alebo aktualizovať nastavenia prehliadača { -brand-firefox } týkajúce sa údajov, otvorte nastavenia prehliadača { -brand-firefox } a prejdite na Súkromie a bezpečnosť.
dc-opt-out-success-2 = Odhlásenie bolo úspešné. { -product-mozilla-accounts } nebudú posielať technické údaje ani údaje o interakciách spoločnosti { -brand-mozilla }.
dc-opt-in-success-2 = Vďaka! Zdieľanie týchto údajov nám pomáha zlepšovať { -product-mozilla-accounts(capitalization: "lower", case: "acc") }.
dc-opt-in-out-error-2 = Ľutujeme, pri zmene predvoľby zhromažďovania údajov sa vyskytol problém
dc-learn-more = Ďalšie informácie


drop-down-menu-title-2 = Ponuka { -product-mozilla-account(case: "gen", capitalization: "lower") }
drop-down-menu-signed-in-as-v2 = Prihlásený ako
drop-down-menu-sign-out = Odhlásiť sa
drop-down-menu-sign-out-error-2 = Ľutujeme, vyskytol sa problém s odhlásením


flow-container-back = Naspäť


flow-recovery-key-confirm-pwd-heading-v2 = Kvôli bezpečnosti znova zadajte svoje heslo
flow-recovery-key-confirm-pwd-input-label = Zadajte svoje heslo
flow-recovery-key-confirm-pwd-submit-button = Vytvoriť kľúč na obnovenie účtu
flow-recovery-key-confirm-pwd-submit-button-change-key = Vytvoriť nový kľúč na obnovenie účtu


flow-recovery-key-download-heading-v2 = Kľúč na obnovenie účtu bol vytvorený – stiahnite si ho a uložte
flow-recovery-key-download-info-v2 = Tento kľúč vám umožňuje obnoviť údaje, ak zabudnete heslo. Stiahnite si ho a uložte na miesto, ktoré si zapamätáte – neskôr sa na túto stránku už nebudete môcť vrátiť.
flow-recovery-key-download-next-link-v2 = Pokračovať bez stiahnutia


flow-recovery-key-success-alert = Kľúč na obnovenie účtu bol vytvorený


flow-recovery-key-info-header = Vytvorte si kľúč na obnovenie účtu pre prípad, že zabudnete heslo
flow-recovery-key-info-header-change-key = Zmeňte si kľúč na obnovenie účtu
flow-recovery-key-info-shield-bullet-point-v2 = Šifrujeme údaje prehliadania – heslá, záložky a ďalšie. Je to skvelé pre súkromie, ale ak zabudnete heslo, môžete prísť o svoje údaje.
flow-recovery-key-info-key-bullet-point-v2 = Preto je vytvorenie kľúča na obnovenie účtu také dôležité – môžete ho použiť na obnovenie údajov.
flow-recovery-key-info-cta-text-v3 = Začíname
flow-recovery-key-info-cancel-link = Zrušiť


flow-setup-2fa-qr-heading = Pripojte sa k svojej overovacej aplikácii
flow-setup-2a-qr-instruction = <strong>Krok 1:</strong> Naskenujte tento QR kód pomocou ľubovoľnej overovacej aplikácie, ako je Duo alebo Google Authenticator.
flow-setup-2fa-qr-alt-text =
    .alt = QR kód na nastavenie dvojstupňového overenia. Naskenujte ho alebo vyberte možnosť „Nedá sa naskenovať QR kód?“ a namiesto toho získajte tajný kľúč nastavenia.
flow-setup-2fa-cant-scan-qr-button = Nedá sa naskenovať QR kód?
flow-setup-2fa-manual-key-heading = Zadajte kód ručne
flow-setup-2fa-manual-key-instruction = <strong>Krok 1:</strong> Zadajte tento kód do svojej preferovanej overovacej aplikácie.
flow-setup-2fa-scan-qr-instead-button = Chcete radšej naskenovať QR kód?
flow-setup-2fa-more-info-link = Ďalšie informácie o overovacích aplikáciách
flow-setup-2fa-button = Pokračovať
flow-setup-2fa-step-2-instruction = <strong>Krok 2:</strong> Zadajte kód z overovacej aplikácie.
flow-setup-2fa-input-label = Zadajte šesťmiestny kód
flow-setup-2fa-code-error = Neplatný alebo vypršaný kód. Skontrolujte si overovaciu aplikáciu a skúste to znova.


flow-setup-2fa-backup-choice-heading = Vyberte spôsob obnovy
flow-setup-2fa-backup-choice-description = To vám umožní prihlásiť sa, ak nemáte prístup k mobilnému zariadeniu alebo overovacej aplikácii.
flow-setup-2fa-backup-choice-phone-title = Obnovenie pomocou telefónu
flow-setup-2fa-backup-choice-phone-badge = Najjednoduchšie
flow-setup-2fa-backup-choice-phone-info = Získajte kód na obnovenie prostredníctvom textovej správy. Momentálne k dispozícii v USA a Kanade.
flow-setup-2fa-backup-choice-code-title = Záložné overovacie kódy
flow-setup-2fa-backup-choice-code-badge = Najbezpečnejšie
flow-setup-2fa-backup-choice-code-info = Vytvorte a uložte si jednorazové overovacie kódy.
flow-setup-2fa-backup-choice-learn-more-link = Informácie o obnovení a rizikách pri výmene SIM karty


flow-setup-2fa-backup-code-confirm-heading = Zadajte záložný overovací kód
flow-setup-2fa-backup-code-confirm-confirm-saved = Zadaním kódu potvrďte, že ste kódy uložili. Bez týchto kódov sa možno nebudete môcť prihlásiť, ak nemáte aplikáciu na overenie totožnosti.
flow-setup-2fa-backup-code-confirm-code-input = Zadajte 10‑miestny kód
flow-setup-2fa-backup-code-confirm-button-finish = Dokončiť


flow-setup-2fa-backup-code-dl-heading = Uložte si záložné overovacie kódy
flow-setup-2fa-backup-code-dl-save-these-codes = Uschovajte si ich na mieste, na ktoré si nezabudnete. Ak nemáte prístup k aplikácii na overenie totožnosti, budete jeden z nich musieť zadať pri prihlásení.
flow-setup-2fa-backup-code-dl-button-continue = Pokračovať


flow-setup-2fa-inline-complete-success-banner = Dvojstupňové overenie bolo povolené
flow-setup-2fa-inline-complete-success-banner-description = Ak chcete chrániť všetky pripojené zariadenia, mali by ste sa odhlásiť všade, kde používate tento účet, a potom sa znova prihlásiť pomocou nového dvojstupňového overenia.
flow-setup-2fa-inline-complete-backup-code = Záložné overovacie kódy
flow-setup-2fa-inline-complete-backup-phone = Obnovenie pomocou telefónu
flow-setup-2fa-inline-complete-backup-code-info =
    { $count ->
        [one] { $count } zostávajúci kód
        [few] { $count } zostávajúce kódy
        [many] { $count } zostávajúcich kódov
       *[other] { $count } zostávajúcich kódov
    }
flow-setup-2fa-inline-complete-backup-code-description = Toto je najbezpečnejšia metóda obnovenia, ak sa nemôžete prihlásiť pomocou mobilného zariadenia alebo overovacej aplikácie.
flow-setup-2fa-inline-complete-backup-phone-description = Toto je najjednoduchšia metóda obnovenia, ak sa nemôžete prihlásiť pomocou aplikácie na overenie totožnosti.
flow-setup-2fa-inline-complete-learn-more-link = Ako to chráni váš účet
flow-setup-2fa-inline-complete-continue-button = A pokračovať do služby { $serviceName }
flow-setup-2fa-prompt-heading = Nastavenie dvojstupňového overenia
flow-setup-2fa-prompt-description = { $serviceName } vyžaduje nastavenie dvojstupňového overenia, aby bol váš účet v bezpečí.
flow-setup-2fa-prompt-use-authenticator-apps = Na pokračovanie môžete použiť ktorúkoľvek z <authenticationAppsLink>týchto overovacích aplikácií</authenticationAppsLink>.
flow-setup-2fa-prompt-continue-button = Pokračovať


flow-setup-phone-confirm-code-heading = Zadajte overovací kód
flow-setup-phone-confirm-code-instruction = Na číslo <span>{ $phoneNumber }</span> bol prostredníctvom textovej správy odoslaný šesťmiestny kód. Platnosť tohto kódu vyprší po 5 minútach.
flow-setup-phone-confirm-code-input-label = Zadajte šesťmiestny kód
flow-setup-phone-confirm-code-button = Potvrdiť
flow-setup-phone-confirm-code-expired = Platnosť kódu vypršala?
flow-setup-phone-confirm-code-resend-code-button = Znova odoslať kód
flow-setup-phone-confirm-code-resend-code-success = Kód bol odoslaný
flow-setup-phone-confirm-code-success-message-v2 = Obnovenie pomocou telefónu bolo pridané
flow-change-phone-confirm-code-success-message = Obnovenie pomocou telefónu bolo zmenené


flow-setup-phone-submit-number-heading = Overte svoje telefónne číslo
flow-setup-phone-verify-number-instruction = Dostanete textovú správy od { -brand-mozilla(case: "gen") } s kódom na overenie vášho čísla. S nikým tento kód nezdieľajte.
flow-setup-phone-submit-number-info-message-v2 = Obnovenie pomocou telefónu je k dispozícii iba v Spojených štátoch a Kanade. VoIP čísla a telefónne masky sa neodporúčajú.
flow-setup-phone-submit-number-legal = Poskytnutím svojho čísla súhlasíte s jeho uložením, aby sme vám mohli posielať textové správy na overenie účtu. Môžu sa účtovať poplatky za správy a dáta.
flow-setup-phone-submit-number-button = Odoslať kód


header-menu-open = Zavrieť ponuku
header-menu-closed = Navigačná ponuka stránok
header-back-to-top-link =
    .title = Návrat hore
header-back-to-settings-link =
    .title = Späť na nastavenia { -product-mozilla-account(case: "gen", capitalization: "lower") }
header-title-2 = { -product-mozilla-account }
header-help = Pomocník


la-heading = Prepojené účty
la-description = Máte autorizovaný prístup k nasledujúcim účtom.
la-unlink-button = Zrušiť prepojenie
la-unlink-account-button = Zrušiť prepojenie
la-set-password-button = Nastaviť heslo
la-unlink-heading = Zrušenie prepojenia s účtom tretej strany
la-unlink-content-3 = Naozaj chcete odpojiť svoj účet? Odpojením vášho účtu sa automaticky neodhlásite z pripojených služieb. Ak to chcete urobiť, budete sa musieť manuálne odhlásiť v sekcii Pripojené služby.
la-unlink-content-4 = Pred odpojením účtu musíte nastaviť heslo. Bez hesla sa po odpojení účtu nemôžete prihlásiť.
nav-linked-accounts = { la-heading }


modal-close-title = Zavrieť
modal-cancel-button = Zrušiť
modal-default-confirm-button = Potvrdiť


modal-mfa-protected-title = Zadajte potvrdzovací kód
modal-mfa-protected-subtitle = Pomôžte nám uistiť sa, že ste to vy, kto mení informácie o vašom účte
modal-mfa-protected-instruction =
    { $expirationTime ->
        [one] V priebehu { $expirationTime } minúty zadajte kód, ktorý bol odoslaný na e‑mailovú adresu <email>{ $email }</email>.
        [few] V priebehu { $expirationTime } minút zadajte kód, ktorý bol odoslaný na e‑mailovú adresu <email>{ $email }</email>.
        [many] V priebehu { $expirationTime } minút zadajte kód, ktorý bol odoslaný na e‑mailovú adresu <email>{ $email }</email>.
       *[other] V priebehu { $expirationTime } minút zadajte kód, ktorý bol odoslaný na e‑mailovú adresu <email>{ $email }</email>.
    }
modal-mfa-protected-input-label = Zadajte šesťmiestny kód
modal-mfa-protected-cancel-button = Zrušiť
modal-mfa-protected-confirm-button = Potvrdiť
modal-mfa-protected-code-expired = Platnosť kódu vypršala?
modal-mfa-protected-resend-code-link = Odoslať e‑mailom nový kód.


mvs-verify-your-email-2 = Potvrďte vašu e‑mailovú adresu
mvs-enter-verification-code-2 = Zadajte svoj potvrdzovací kód
mvs-enter-verification-code-desc-2 = V priebehu 5 minút zadajte potvrdzovací kód, ktorý bol odoslaný na e‑mailovú adresu <email>{ $email }</email>.
msv-cancel-button = Zrušiť
msv-submit-button-2 = Potvrdiť


nav-settings = Nastavenia
nav-profile = Profil
nav-security = Bezpečnosť
nav-connected-services = Pripojené služby
nav-data-collection = Zhromažďovanie a používanie údajov
nav-paid-subs = Predplatné
nav-email-comm = E‑mailová komunikácia


page-2fa-change-title = Zmena dvojstupňového overenia
page-2fa-change-success = Dvojstupňové overenie bolo aktualizované
page-2fa-change-success-additional-message = Ak chcete chrániť všetky pripojené zariadenia, mali by ste sa odhlásiť všade, kde používate tento účet, a potom sa znova prihlásiť pomocou nového dvojstupňového overenia.
page-2fa-change-totpinfo-error = Pri zmene aplikácie na dvojstupňové overenie sa vyskytla chyba. Skúste to znova neskôr.
page-2fa-change-qr-instruction = <strong>Krok 1:</strong> Naskenujte tento QR kód pomocou ľubovoľnej overovacej aplikácie, ako je Duo alebo Google Authenticator. Týmto sa vytvorí nové pripojenie, všetky staré pripojenia už nebudú fungovať.


tfa-backup-codes-page-title = Záložné overovacie kódy
tfa-replace-code-error-3 = Pri výmene záložných overovacích kódov sa vyskytol problém
tfa-create-code-error = Pri vytváraní záložných overovacích kódov sa vyskytol problém
tfa-replace-code-success-alert-4 = Záložné overovacie kódy boli aktualizované
tfa-create-code-success-alert = Záložné overovacie kódy boli vytvorené
tfa-replace-code-download-description = Uschovajte si ich na mieste, ktoré si zapamätáte. Vaše staré kódy budú nahradené po dokončení ďalšieho kroku.
tfa-replace-code-confirm-description = Potvrďte uloženie kódov zadaním jedného z nich. Vaše staré záložné overovacie kódy budú po dokončení tohto kroku deaktivované.
tfa-incorrect-recovery-code-1 = Nesprávny záložný overovací kód


page-2fa-setup-title = Dvojstupňové overenie
page-2fa-setup-totpinfo-error = Pri nastavovaní dvojstupňového overenia sa vyskytla chyba. Skúste to znova neskôr.
page-2fa-setup-incorrect-backup-code-error = Tento kód nie je správny. Skúste to znova.
page-2fa-setup-success = Dvojstupňové overenie bolo povolené
page-2fa-setup-success-additional-message = Ak chcete chrániť všetky pripojené zariadenia, mali by ste sa odhlásiť všade, kde používate tento účet, a potom sa znova prihlásiť pomocou dvojstupňového overenia.


avatar-page-title =
    .title = Profilová fotografia
avatar-page-add-photo = Nahrať fotografiu
avatar-page-add-photo-button =
    .title = { avatar-page-add-photo }
avatar-page-take-photo = Urobiť fotografiu
avatar-page-take-photo-button =
    .title = { avatar-page-take-photo }
avatar-page-remove-photo = Odstrániť fotografiu
avatar-page-remove-photo-button =
    .title = { avatar-page-remove-photo }
avatar-page-retake-photo = Znovu urobiť fotografiu
avatar-page-cancel-button = Zrušiť
avatar-page-save-button = Uložiť
avatar-page-saving-button = Ukladá sa…
avatar-page-zoom-out-button =
    .title = Oddialiť
avatar-page-zoom-in-button =
    .title = Priblížiť
avatar-page-rotate-button =
    .title = Otočiť
avatar-page-camera-error = Nepodarilo sa aktivovať fotoaparát
avatar-page-new-avatar =
    .alt = nová profilová fotografia
avatar-page-file-upload-error-3 = Pri nahrávaní profilovej fotografie sa vyskytol problém
avatar-page-delete-error-3 = Pri odstraňovaní vašej profilovej fotky sa vyskytol problém
avatar-page-image-too-large-error-2 = Nie je možné nahrať obrázok, pretože je príliš veľký


pw-change-header =
    .title = Zmena hesla
pw-8-chars = Minimálne 8 znakov
pw-not-email = Nepoužívajte vašu e‑mailovú adresu
pw-change-must-match = nové heslo sa musí zhodovať s potvrdzujúcim
pw-commonly-used = Nezadávajte bežne používané heslo
pw-tips = Zostaňte v bezpečí – nepoužívajte heslá znova. Pozrite si ďalšie tipy na <linkExternal>vytvorenie silných hesiel</linkExternal>.
pw-change-cancel-button = Zrušiť
pw-change-save-button = Uložiť
pw-change-forgot-password-link = Zabudli ste heslo?
pw-change-current-password =
    .label = Zadajte súčasné heslo
pw-change-new-password =
    .label = Zadajte nové heslo
pw-change-confirm-password =
    .label = Potvrďte nové heslo
pw-change-success-alert-2 = Heslo bolo aktualizované


pw-create-header =
    .title = Vytvorenie hesla
pw-create-success-alert-2 = Heslo bolo nastavené
pw-create-error-2 = Ľutujeme, pri nastavovaní hesla sa vyskytol problém


delete-account-header =
    .title = Odstrániť účet
delete-account-step-1-2 = Krok 1 z 2
delete-account-step-2-2 = Krok 2 z 2
delete-account-confirm-title-4 = Možno ste svoj { -product-mozilla-account(case: "acc", capitalization: "lower") } pripojili k jednému alebo viacerým z nasledujúcich produktov alebo služieb od { -brand-mozilla(case: "gen") }, ktoré vám zabezpečujú bezpečnosť a produktivitu na webe:
delete-account-product-mozilla-account = { -product-mozilla-account }
delete-account-product-mozilla-vpn = { -product-mozilla-vpn }
delete-account-product-mdn-plus = { -product-mdn-plus }
delete-account-product-mozilla-hubs = { -product-mozilla-hubs }
delete-account-product-mozilla-monitor = { -product-mozilla-monitor }
delete-account-product-firefox-relay = { -product-firefox-relay }
delete-account-product-firefox-sync = Synchronizujú sa údaje { -brand-firefox(case: "gen") }
delete-account-product-firefox-addons = Doplnky pre { -brand-firefox }
delete-account-acknowledge = Potvrďte, že odstránením svojho účtu:
delete-account-chk-box-1-v4 =
    .label = Všetky platené predplatné, ktoré máte, budú zrušené
delete-account-chk-box-2 =
    .label = môžete prísť o uložené informácie a niektoré funkcie produktov { -brand-mozilla(case: "gen") }
delete-account-chk-box-3 =
    .label = opätovná aktivácia pomocou tejto e‑mailovej adresy nemusí obnoviť vaše uložené informácie
delete-account-chk-box-4 =
    .label = všetky rozšírenia a témy vzhľadu, ktoré ste zverejnili na addons.mozilla.org, budú odstránené
delete-account-continue-button = Pokračovať
delete-account-password-input =
    .label = Zadajte heslo
delete-account-cancel-button = Zrušiť
delete-account-delete-button-2 = Odstrániť


display-name-page-title =
    .title = Zobrazované meno
display-name-input =
    .label = Zadajte zobrazované meno
submit-display-name = Uložiť
cancel-display-name = Zrušiť
display-name-update-error-2 = Pri aktualizácii vášho zobrazovaného mena sa vyskytol problém
display-name-success-alert-2 = Zobrazované meno aktualizované


recent-activity-title = Nedávna aktivita účtu
recent-activity-account-create-v2 = Účet bol vytvorený
recent-activity-account-disable-v2 = Účet bol deaktivovaný
recent-activity-account-enable-v2 = Účet je povolený
recent-activity-account-login-v2 = Bolo spustené prihlásenie pomocou účtu
recent-activity-account-reset-v2 = Bol spustený proces zmeny hesla
recent-activity-emails-clearBounces-v2 = E‑maily o nedoručení vymazané
recent-activity-account-login-failure = Pokus o prihlásenie do účtu zlyhal
recent-activity-account-two-factor-added = Dvojstupňové overenie bolo povolené
recent-activity-account-two-factor-requested = Vyžaduje sa dvojstupňové overenie
recent-activity-account-two-factor-failure = Dvojstupňové overenie zlyhalo
recent-activity-account-two-factor-success = Dvojstupňové overenie bolo úspešné
recent-activity-account-two-factor-removed = Dvojstupňové overenie bolo odstránené
recent-activity-account-password-reset-requested = Účet si vyžiadal zmenu hesla
recent-activity-account-password-reset-success = Zmena hesla účtu bola úspešná
recent-activity-account-recovery-key-added = Kľúč na obnovenie účtu je povolený
recent-activity-account-recovery-key-verification-failure = Overenie kľúča na obnovenie účtu zlyhalo
recent-activity-account-recovery-key-verification-success = Overenie kľúča na obnovenie účtu bolo úspešné
recent-activity-account-recovery-key-removed = Kľúč na obnovenie účtu bol odstránený
recent-activity-account-password-added = Bolo pridané nové heslo
recent-activity-account-password-changed = Heslo bolo zmenené
recent-activity-account-secondary-email-added = Bola pridaná alternatívna e‑mailová adresa
recent-activity-account-secondary-email-removed = Alternatívna e‑mailová adresa bola odstránená
recent-activity-account-emails-swapped = Hlavná a alternatívna e‑mailová adresa boli vzájomne vymenené
recent-activity-session-destroy = Odhlásený z relácie
recent-activity-account-recovery-phone-send-code = Kód na obnovenie bol odoslaný na telefónne číslo
recent-activity-account-recovery-phone-setup-complete = Obnovenie pomocou telefónu bolo nastavené
recent-activity-account-recovery-phone-signin-complete = Prihlásenie pomocou telefónu na obnovenie bolo dokončené
recent-activity-account-recovery-phone-signin-failed = Prihlásenie pomocou telefónu na obnovenie zlyhalo
recent-activity-account-recovery-phone-removed = Obnovenie pomocou telefónu bolo zrušené
recent-activity-account-recovery-codes-replaced = Obnovovacie kódy boli vymenené
recent-activity-account-recovery-codes-created = Boli vytvorené obnovovacie kódy
recent-activity-account-recovery-codes-signin-complete = Prihláste sa pomocou obnovovacích kódov
recent-activity-password-reset-otp-sent = Potvrdzovací kód pre zmenu hesla bol odoslaný
recent-activity-password-reset-otp-verified = Potvrdzovací kód pre zmenu hesla bol overený
recent-activity-must-reset-password = Vyžaduje sa zmena hesla
recent-activity-unknown = Iná aktivita účtu


recovery-key-create-page-title = Kľúč na obnovenie účtu
recovery-key-create-back-button-title = Späť na nastavenia


recovery-phone-remove-header = Odstránenie možnosti obnovy pomocou telefónu
settings-recovery-phone-remove-info = Týmto odstránite číslo <strong>{ $formattedFullPhoneNumber }</strong> ako telefónne číslo na obnovenie účtu.
settings-recovery-phone-remove-recommend = Odporúčame vám ponechať si túto metódu, pretože je jednoduchšia ako ukladanie záložných overovacích kódov.
settings-recovery-phone-remove-recovery-methods = Ak ho vymažete, uistite sa, že máte stále uložené záložné overovacie kódy. <linkExternal>Porovnať metódy obnovenia</linkExternal>
settings-recovery-phone-remove-button = Odstrániť telefónne číslo
settings-recovery-phone-remove-cancel = Zrušiť
settings-recovery-phone-remove-success = Obnovenie pomocou telefónu bolo zrušené


page-setup-recovery-phone-heading = Pridajte obnovenie pomocou telefónu
page-change-recovery-phone = Zmeniť telefón na obnovenie účtu
page-setup-recovery-phone-back-button-title = Späť na nastavenia
page-setup-recovery-phone-step2-back-button-title = Zmeniť telefónne číslo


add-secondary-email-step-1 = Krok 1 z 2
add-secondary-email-error-2 = Pri vytváraní tohto e‑mailu sa vyskytol problém
add-secondary-email-page-title =
    .title = Alternatívna e‑mailová adresa
add-secondary-email-enter-address =
    .label = Zadajte e‑mailovú adresu
add-secondary-email-cancel-button = Zrušiť
add-secondary-email-save-button = Uložiť
add-secondary-email-mask = E‑mailové masky nie je možné použiť ako alternatívny e‑mail.


add-secondary-email-step-2 = Krok 2 z 2
verify-secondary-email-page-title =
    .title = Alternatívna e‑mailová adresa
verify-secondary-email-verification-code-2 =
    .label = Zadajte svoj potvrdzovací kód
verify-secondary-email-cancel-button = Zrušiť
verify-secondary-email-verify-button-2 = Potvrdiť
verify-secondary-email-please-enter-code-2 = Do 5 minút zadajte potvrdzovací kód, ktorý bol odoslaný na e‑mailovú adresu <strong>{ $email }</strong>.
verify-secondary-email-success-alert-2 = Adresa { $email } bola úspešne pridaná
verify-secondary-email-resend-code-button = Znovu odoslať potvrdzovací kód


delete-account-link = Odstrániť účet
inactive-update-status-success-alert = Úspešne ste sa prihlásili. Váš { -product-mozilla-account(capitalization: "lower") } a údaje zostanú aktívne.


product-promo-monitor =
    .alt = { -product-mozilla-monitor }
product-promo-monitor-description-v2 = Zistite, kde sú vaše súkromné informácie zverejnené, a prevezmite nad nimi kontrolu
product-promo-monitor-cta = Skontrolovať


profile-heading = Profil
profile-picture =
    .header = Obrázok
profile-display-name =
    .header = Zobrazované meno
profile-primary-email =
    .header = Hlavná e‑mailová adresa


progress-bar-aria-label-v2 = Krok { $currentStep } z { $numberOfSteps }.


security-heading = Bezpečnosť
security-password =
    .header = Heslo
security-password-created-date = Vytvorené { $date }
security-not-set = Nie je nastavené
security-action-create = Vytvoriť
security-set-password = Nastavte si heslo na synchronizáciu a používanie určitých funkcií zabezpečenia účtu.
security-recent-activity-link = Zobraziť nedávnu aktivitu účtu
signout-sync-header = Relácia vypršala
signout-sync-session-expired = Prepáčte, niečo sa pokazilo. Odhláste sa v ponuke prehliadača a skúste to znova.


tfa-row-backup-codes-title = Záložné overovacie kódy
tfa-row-backup-codes-not-available = Nie sú k dispozícii žiadne kódy
tfa-row-backup-codes-available-v2 =
    { $numCodesAvailable ->
        [one] Zostáva { $numCodesAvailable } kód
        [few] Zostávajú { $numCodesAvailable } kódy
        [many] Zostáva { $numCodesAvailable } kódov
       *[other] Zostáva { $numCodesAvailable } kódov
    }
tfa-row-backup-codes-get-new-cta-v2 = Vytvoriť nové kódy
tfa-row-backup-codes-add-cta = Pridať
tfa-row-backup-codes-description-2 = Toto je najbezpečnejšia metóda obnovy, ak nemôžete použiť svoje mobilné zariadenie alebo aplikáciu na overovanie.
tfa-row-backup-phone-title-v2 = Obnovenie pomocou telefónu
tfa-row-backup-phone-not-available-v2 = Nebolo pridané žiadne telefónne číslo
tfa-row-backup-phone-change-cta = Zmeniť
tfa-row-backup-phone-add-cta = Pridať
tfa-row-backup-phone-delete-button = Odstrániť
tfa-row-backup-phone-delete-title-v2 = Odstráni možnosť obnovy pomocou telefónu
tfa-row-backup-phone-delete-restriction-v2 = Ak chcete odstrániť možnosť obnovy pomocou telefónu, pridajte záložné overovacie kódy alebo najskôr zakážte dvojstupňové overenie, aby ste sa vyhli zablokovaniu vášho účtu.
tfa-row-backup-phone-description-v2 = Toto je najjednoduchší spôsob obnovenia, ak nemôžete použiť aplikáciu na overenie totožnosti.
tfa-row-backup-phone-sim-swap-risk-link = Prečítajte si o riziku pri výmene SIM karty


switch-turn-off = Vypnúť
switch-turn-on = Zapnúť
switch-submitting = Odosiela sa…
switch-is-on = zapnuté
switch-is-off = vypnuté


row-defaults-action-add = Pridať
row-defaults-action-change = Zmeniť
row-defaults-action-disable = Vypnúť
row-defaults-status = Žiadne


rk-header-1 = Kľúč na obnovenie účtu
rk-enabled = Povolený
rk-not-set = Nie je nastavený
rk-action-create = Vytvoriť
rk-action-change-button = Zmeniť
rk-action-remove = Odstrániť
rk-key-removed-2 = Obnovovací kľúč k účtu bol odstránený
rk-cannot-remove-key = Kľúč na obnovenie účtu nebolo možné odstrániť.
rk-refresh-key-1 = Obnoviť kľúč na obnovenie účtu
rk-content-explain = Získajte prístup k svojim údajom v prípade, že zabudnete heslo.
rk-cannot-verify-session-4 = Ľutujeme, pri potvrdení vašej relácie sa vyskytol problém
rk-remove-modal-heading-1 = Chcete odstrániť kľúč na obnovenie účtu?
rk-remove-modal-content-1 =
    V prípade, že si zmeníte heslo, nebudete už môcť
    použiť kľúč na obnovenie účtu na prístup k vašim údajom.
    Túto akciu nie je možné vrátiť späť.
rk-remove-error-2 = Kľúč na obnovenie účtu nebolo možné odstrániť
unit-row-recovery-key-delete-icon-button-title = Odstrániť kľúč na obnovenie účtu


se-heading = Alternatívna e‑mailová adresa
    .header = Alternatívna e‑mailová adresa
se-cannot-refresh-email = Ľutujeme, ale pri obnovení tohto e‑mailu sa vyskytol problém.
se-cannot-resend-code-3 = Ľutujeme, pri opätovnom odosielaní potvrdzovacieho kódu sa vyskytol problém
se-set-primary-successful-2 = Adresa { $email } je teraz vašou hlavnou e‑mailovou adresou
se-set-primary-error-2 = Ľutujeme, ale pri zmene vašej hlavnej e‑mailovej adresy sa vyskytol problém
se-delete-email-successful-2 = Adresa { $email } bola úspešne odstránená
se-delete-email-error-2 = Ľutujeme, ale pri odstraňovaní tejto e‑mailovej adresy sa vyskytol problém
se-verify-session-3 = Ak chcete vykonať túto akciu, budete musieť potvrdiť svoju aktuálnu reláciu
se-verify-session-error-3 = Ľutujeme, pri potvrdení vašej relácie sa vyskytol problém
se-remove-email =
    .title = Odstrániť e‑mailovú adresu
se-refresh-email =
    .title = Obnoviť e‑mailovú adresu
se-unverified-2 = nepotvrdený
se-resend-code-2 =
    Vyžaduje sa potvrdenie. <button>Opäť si pošlite potvrdzovací kód</button>,
    ak sa tento nenachádza vo vašej doručenej pošte alebo priečinku so spamom.
se-make-primary = Nastaviť ako hlavnú adresu
se-default-content = Získajte prístup k svojmu účtu, ak sa vám nepodarí prihlásiť pomocou svojej hlavnej e‑mailovej adresy.
se-content-note-1 = Poznámka: alternatívna e‑mailová adresa neumožní obnoviť vaše informácie – na to budete potrebovať <a>kľúč na obnovenie účtu</a>.
se-secondary-email-none = žiadna


tfa-row-header = Dvojstupňové overenie
tfa-row-enabled = Povolené
tfa-row-disabled-status = Zakázané
tfa-row-action-add = Pridať
tfa-row-action-disable = Zakázať
tfa-row-action-change = Zmeniť
tfa-row-button-refresh =
    .title = Obnoviť dvojstupňové overenie
tfa-row-cannot-refresh = Je nám ľúto, ale pri obnovovaní dvojstupňového overenia sa vyskytol problém.
tfa-row-enabled-description = Váš účet je chránený dvojstupňovou autentifikáciou. Pri prihlasovaní do svojho { -product-mozilla-account(case: "gen", capitalization: "lower") } budete musieť zadať jednorazový prístupový kód z overovacej aplikácie.
tfa-row-enabled-info-link = Ako toto chráni váš účet
tfa-row-disabled-description-v2 = Pomôžte zabezpečiť svoj účet pomocou aplikácie na overenie totožnosti tretej strany ako druhého kroku prihlásenia.
tfa-row-cannot-verify-session-4 = Ľutujeme, pri potvrdení vašej relácie sa vyskytol problém
tfa-row-disable-modal-heading = Zakázať dvojstupňové overenie?
tfa-row-disable-modal-confirm = Zakázať
tfa-row-disable-modal-explain-1 =
    Túto akciu nebudete môcť vrátiť späť. Máte tiež
    možnosť <linkExternal>nahradiť svoje záložné overovacie kódy</linkExternal>.
tfa-row-disabled-2 = Dvojstupňové overenie bolo zakázané
tfa-row-cannot-disable-2 = Dvojstupňové overenie sa nepodarilo zakázať
tfa-row-verify-session-info = Na nastavenie dvojstupňového overenia musíte potvrdiť svoju aktuálnu reláciu.


terms-privacy-agreement-intro-3 = Pokračovaním súhlasíte s nasledujúcim:
terms-privacy-agreement-customized-terms = { $serviceName }: <termsLink>Podmienky používania služby</termsLink> a <privacyLink>Vyhlásenie o ochrane osobných údajov</privacyLink>
terms-privacy-agreement-mozilla-2 = { -product-mozilla-accounts(capitalization: "uppercase") }: <mozillaAccountsTos>Podmienky používania služby</mozillaAccountsTos> a <mozillaAccountsPrivacy>Vyhlásenie o ochrane osobných údajov</mozillaAccountsPrivacy>
terms-privacy-agreement-default-2 = Pokračovaním vyjadrujete súhlas s <mozillaAccountsTos>Podmienkami používania služby</mozillaAccountsTos> a <mozillaAccountsPrivacy>Vyhlásením o ochrane osobných údajov</mozillaAccountsPrivacy>.


third-party-auth-options-or = alebo
third-party-auth-options-sign-in-with = Prihlásiť sa pomocou
continue-with-google-button = Pokračovať pomocou { -brand-google }
continue-with-apple-button = Pokračovať pomocou { -brand-apple }


auth-error-102 = Neznámy účet
auth-error-103 = Nesprávne heslo
auth-error-105-2 = Neplatný potvrdzovací kód
auth-error-110 = Neplatný token
auth-error-114-generic = Vykonali ste príliš veľa pokusov. Skúste to znova neskôr.
auth-error-114 = Vykonali ste príliš veľa pokusov. Skúste to znova { $retryAfter }.
auth-error-125 = Z bezpečnostných dôvodov bola požiadavka zablokovaná
auth-error-129-2 = Zadali ste neplatné telefónne číslo. Skontrolujte ho a skúste to znova.
auth-error-138-2 = Nepotvrdená relácia
auth-error-139 = Alternatívna e‑mailová adresa musí byť iná ako adresa účtu
auth-error-144 = Tento e‑mail je rezervovaný pre iný účet. Skúste to znova neskôr alebo použite inú e‑mailovú adresu.
auth-error-155 = Token TOTP sa nenašiel
auth-error-156 = Záložný overovací kód sa nenašiel
auth-error-159 = Neplatný kľúč na obnovenie účtu
auth-error-183-2 = Neplatný potvrdzovací kód alebo kód s vypršanou platnosťou
auth-error-202 = Funkcia nie je povolená
auth-error-203 = Systém nie je dostupný, skúste to znova neskôr.
auth-error-206 = Nie je možné vytvoriť heslo, heslo je už nastavené
auth-error-214 = Telefónne číslo na obnovenie už existuje
auth-error-215 = Telefónne číslo na obnovenie neexistuje
auth-error-216 = Bol dosiahnutý limit textových správ
auth-error-218 = Obnovenie pomocou telefónu nie je možné odstrániť, chýbajú záložné overovacie kódy.
auth-error-219 = Toto telefónne číslo bolo zaregistrované s príliš veľkým počtom účtov. Skúste iné číslo.
auth-error-999 = Neočakávaná chyba
auth-error-1001 = Pokus o prihlásenie bol zrušený
auth-error-1002 = Platnosť relácie vypršala. Ak chcete pokračovať, prihláste sa.
auth-error-1003 = Miestne úložisko alebo súbory cookie sú stále zakázané
auth-error-1008 = Staré a nové heslo sa musia líšiť
auth-error-1010 = Vyžaduje sa zadanie platného hesla
auth-error-1011 = Vyžaduje sa platná e‑mailová adresa
auth-error-1018 = Váš potvrdzujúci e‑mail sa práve vrátil. Nesprávne zadaný e‑mail?
auth-error-1020 = Nesprávne zadaný e‑mail? firefox.com nie je platná e‑mailová služba
auth-error-1031 = Ak sa chcete prihlásiť, musíte zadať svoj vek
auth-error-1032 = Ak sa chcete prihlásiť, musíte zadať platný vek
auth-error-1054 = Neplatný dvojstupňový overovací kód
auth-error-1056 = Neplatný záložný overovací kód
auth-error-1062 = Neplatné presmerovanie
auth-error-1064 = Nesprávne zadaný e‑mail? { $domain } nie je platná e‑mailová služba
auth-error-1066 = Na vytvorenie účtu nie je možné použiť e‑mailovú masku.
auth-error-1067 = Nesprávna e-mailová adresa?
recovery-phone-number-ending-digits = Číslo končiace na { $lastFourPhoneNumber }
oauth-error-1000 = Niečo sa pokazilo. Prosím, zatvorte túto kartu a skúste to znova.


connect-another-device-signed-in-header = Ste prihlásený/-á do { -brand-firefox(case: "gen") }
connect-another-device-email-confirmed-banner = E‑mail potvrdený
connect-another-device-signin-confirmed-banner = Prihlásenie potvrdené
connect-another-device-signin-to-complete-message = Pre dokončenie nastavení sa prihláste do { -brand-firefox(case: "gen") }
connect-another-device-signin-link = Prihlásiť sa
connect-another-device-still-adding-devices-message = Stále pridávate ďalšie zariadenia? Prihláste sa do { -brand-firefox(case: "gen") } na inom zariadení a dokončite nastavenie
connect-another-device-signin-another-device-to-complete-message = Prihláste sa do { -brand-firefox(case: "gen") } na inom zariadení a dokončite nastavenie
connect-another-device-get-data-on-another-device-message = Chcete získať svoje karty, záložky a heslá na inom zariadení?
connect-another-device-cad-link = Pripojiť ďalšie zariadenie
connect-another-device-not-now-link = Teraz nie
connect-another-device-android-complete-setup-message = Prihláste sa do { -brand-firefox(case: "gen") } pre Android a dokončite nastavenie
connect-another-device-ios-complete-setup-message = Prihláste sa do { -brand-firefox(case: "gen") } pre iOS a dokončite nastavenie


cookies-disabled-header = Vyžaduje sa miestne úložisko a súbory cookie
cookies-disabled-enable-prompt-2 = Aby ste mohli používať váš { -product-mozilla-account(case: "acc", capitalization: "lower") }, povoľte prosím cookies a lokálne úložisko. Vďaka tomu si vás budeme môcť zapamätať medzi jednotlivými reláciami.
cookies-disabled-button-try-again = Skúsiť znova
cookies-disabled-learn-more = Ďalšie informácie


index-header = Zadajte e‑mailovú adresu
index-sync-header = Pokračovať do vášho { -product-mozilla-account(case: "gen", capitalization: "lower") }
index-sync-subheader = Synchronizujte svoje heslá, karty a záložky všade, kde používate { -brand-firefox }.
index-relay-header = Vytvorenie e‑mailovej masky
index-relay-subheader = Zadajte e‑mailovú adresu, na ktorú chcete posielať e‑maily zo svojho maskovaného e‑mailu.
index-subheader-with-servicename = A pokračovať do služby { $serviceName }
index-subheader-default = A pokračovať do nastavení účtu
index-cta = Zaregistrujte sa alebo sa prihláste
index-account-info = { -product-mozilla-account } tiež odomkne prístup k ďalším produktom chrániacim súkromie od { -brand-mozilla(case: "gen") }.
index-email-input =
    .label = Zadajte e‑mailovú adresu
index-account-delete-success = Účet bol úspešne odstránený
index-email-bounced = Váš potvrdzujúci e‑mail sa práve vrátil. Nesprávne zadaný e‑mail?


inline-recovery-key-setup-create-error = Ojoj! Nepodarilo sa nám vytvoriť kľúč na obnovenie účtu. Skúste to znova neskôr.
inline-recovery-key-setup-recovery-created = Bol vytvorený kľúč na obnovenie účtu
inline-recovery-key-setup-download-header = Zabezpečte svoj účet
inline-recovery-key-setup-download-subheader = Stiahnuť a uložiť
inline-recovery-key-setup-download-info = Uložte si tento kľúč niekde, kde si ho zapamätáte – neskôr sa na túto stránku už nebudete môcť vrátiť.
inline-recovery-key-setup-hint-header = Bezpečnostné odporúčanie


inline-totp-setup-cancel-setup-button = Zrušiť nastavenie
inline-totp-setup-continue-button = Pokračovať
inline-totp-setup-add-security-link = Zvýšte zabezpečenie svojho účtu pridaním povinného zadávania overovacích kódov vygenerovaných jednou z <authenticationAppsLink>týchto overovacích aplikácií</authenticationAppsLink>.
inline-totp-setup-enable-two-step-authentication-default-header-2 = Povoľte dvojstupňové overenie <span>a pokračujte na nastavenia účtu</span>
inline-totp-setup-enable-two-step-authentication-custom-header-2 = Povoľte dvojstupňové overenie <span>a pokračujte do služby { $serviceName }</span>
inline-totp-setup-ready-button = Hotovo
inline-totp-setup-show-qr-custom-service-header-2 = Naskenujte overovací kód <span>a pokračujte do služby { $serviceName }</span>
inline-totp-setup-no-qr-custom-service-header-2 = Zadajte kód manuálne <span>a pokračujte do služby { $serviceName }</span>
inline-totp-setup-show-qr-default-service-header-2 = Naskenujte overovací kód <span>a pokračujte do nastavení účtu</span>
inline-totp-setup-no-qr-default-service-header-2 = Zadajte kód manuálne <span>a pokračujte do nastavení účtu</span>
inline-totp-setup-enter-key-or-use-qr-instructions = Zadajte tento tajný kľúč do overovacej aplikácie. <toggleToQRButton>Naskenovať radšej QR kód?</toggleToQRButton>
inline-totp-setup-use-qr-or-enter-key-instructions = Naskenujte QR kód vo svojej overovacej aplikácii a potom zadajte overovací kód, ktorý vám poskytne. <toggleToManualModeButton>Nemôžete naskenovať kód?</toggleToManualModeButton>
inline-totp-setup-on-completion-description = Po dokončení začne generovať overovacie kódy, ktoré môžete zadať.
inline-totp-setup-security-code-placeholder = Overovací kód
inline-totp-setup-code-required-error = Vyžaduje sa overovací kód
tfa-qr-code-alt = Pomocou kódu { $code } nastavte dvojstupňové overenie v podporovaných aplikáciách.
inline-totp-setup-page-title = Dvojstupňové overenie


legal-header = Právne informácie
legal-terms-of-service-link = Podmienky používania služby
legal-privacy-link = Vyhlásenie o ochrane osobných údajov


legal-privacy-heading = Vyhlásenie o ochrane osobných údajov


legal-terms-heading = Podmienky používania služby


pair-auth-allow-heading-text = Prihlásili ste sa do { -product-firefox(case: "gen") }?
pair-auth-allow-confirm-button = Áno, schváliť zariadenie
pair-auth-allow-refuse-device-link = Ak ste to neboli vy, <link>zmeňte si heslo</link>


pair-auth-complete-heading = Zariadenie bolo pripojené
pair-auth-complete-now-syncing-device-text = Teraz synchronizujete: { $deviceFamily } ({ $deviceOS })
pair-auth-complete-sync-benefits-text = Teraz máte prístup k otvoreným kartám, heslám a záložkám na všetkých svojich zariadeniach.
pair-auth-complete-see-tabs-button = Pozrite si karty zo synchronizovaných zariadení
pair-auth-complete-manage-devices-link = Spravovať zariadenia


auth-totp-heading-w-default-service = Zadajte overovací kód <span>a pokračujte do nastavení účtu</span>
auth-totp-heading-w-custom-service = Zadajte overovací kód <span>a pokračujte do služby { $serviceName }</span>
auth-totp-instruction = Otvorte svoju overovaciu aplikáciu a opíšte z nej overovací kód.
auth-totp-input-label = Zadajte šesťmiestny kód
auth-totp-confirm-button = Potvrdiť
auth-totp-code-required-error = Vyžaduje sa overovací kód


pair-wait-for-supp-heading-text = Vyžaduje sa schválenie <span>z vášho ďalšieho zariadenia</span>


pair-failure-header = Párovanie nebolo úspešné
pair-failure-message = Proces nastavenia bol ukončený.


pair-sync-header = Synchronizujte { -brand-firefox } na svojom telefóne alebo tablete
pair-cad-header = Pripojte { -brand-firefox } na inom zariadení
pair-already-have-firefox-paragraph = Máte už { -brand-firefox } na telefóne alebo tablete?
pair-sync-your-device-button = Synchronizujte svoje zariadenie
pair-or-download-subheader = Alebo si stiahnite
pair-scan-to-download-message = Naskenujte QA kód a stiahnite si { -brand-firefox } pre mobilné zariadenia alebo si pošlite <linkExternal>odkaz na stiahnutie</linkExternal>.
pair-not-now-button = Teraz nie
pair-take-your-data-message = Vezmite si svoje karty, záložky a heslá všade, kde používate { -brand-firefox }.
pair-get-started-button = Začíname
pair-qr-code-aria-label = QR kód


pair-success-header-2 = Zariadenie bolo pripojené
pair-success-message-2 = Párovanie bolo úspešné.


pair-supp-allow-heading-text = Potvrďte párovanie <span>pre { $email }</span>
pair-supp-allow-confirm-button = Potvrdiť párovanie
pair-supp-allow-cancel-link = Zrušiť


pair-wait-for-auth-heading-text = Vyžaduje sa schválenie <span>z vášho ďalšieho zariadenia</span>


pair-unsupported-header = Spárovať pomocou aplikácie
pair-unsupported-message = Použili ste fotoaparát systému? Párovanie je potrebné zahájiť z prehliadača { -brand-firefox }.




set-password-heading-v2 = Pre potreby synchronizácie si vytvorte heslo
set-password-info-v2 = Toto šifruje vaše údaje. Musí sa líšiť od hesla vášho účtu { -brand-google } alebo { -brand-apple }.


third-party-auth-callback-message = Počkajte, prosím, budete presmerovaní na autorizovanú aplikáciu.


account-recovery-confirm-key-heading = Zadajte kľúč na obnovenie účtu
account-recovery-confirm-key-instruction = Tento kľúč obnoví vaše zašifrované údaje prehliadania, ako sú heslá a záložky, zo serverov { -brand-firefox(case: "gen") }.
account-recovery-confirm-key-input-label =
    .label = Zadajte 32‑miestny kľúč na obnovenie účtu
account-recovery-confirm-key-hint = Tip, kam ste ho uložili:
account-recovery-confirm-key-button-2 = Pokračovať
account-recovery-lost-recovery-key-link-2 = Nemôžete nájsť kľúč na obnovenie účtu?


complete-reset-pw-header-v2 = Vytvorte si nové heslo
complete-reset-password-success-alert = Heslo bolo nastavené
complete-reset-password-error-alert = Ľutujeme, pri nastavovaní hesla sa vyskytol problém
complete-reset-pw-recovery-key-link = Použiť kľúč na obnovenie účtu
reset-password-complete-banner-heading = Vaše heslo bolo zmenené.
reset-password-complete-banner-message = Nezabudnite si vygenerovať nový kľúč na obnovenie účtu v nastaveniach { -product-mozilla-account(case: "gen", capitalization: "lower") }, aby ste predišli budúcim problémom s prihlásením.
complete-reset-password-desktop-relay = { -brand-firefox } sa vás po prihlásení pokúsi poslať späť, aby ste mohli použiť e‑mailovú masku.


confirm-backup-code-reset-password-input-label = Zadajte 10‑miestny kód
confirm-backup-code-reset-password-confirm-button = Potvrdiť
confirm-backup-code-reset-password-subheader = Zadajte záložný overovací kód
confirm-backup-code-reset-password-instruction = Zadajte jeden z kódov na jednorazové použitie, ktoré ste si uložili pri nastavovaní dvojstupňového overenia.
confirm-backup-code-reset-password-locked-out-link = Stratili ste prístup?


confirm-reset-password-with-code-heading = Skontrolujte svoju e‑mailovú schránku
confirm-reset-password-with-code-instruction = Potvrdzovací kód sme odoslali na adresu <span>{ $email }</span>.
confirm-reset-password-code-input-group-label = Do 10 minút zadajte 8-miestny kód
confirm-reset-password-otp-submit-button = Pokračovať
confirm-reset-password-otp-resend-code-button = Znova odoslať kód
confirm-reset-password-otp-different-account-link = Použiť iný účet


confirm-totp-reset-password-header = Zmena hesla
confirm-totp-reset-password-subheader-v2 = Zadajte kód pre dvojstupňové overenie
confirm-totp-reset-password-instruction-v2 = Ak chcete zmeniť heslo, skontrolujte <strong>overovaciu aplikáciu</strong>.
confirm-totp-reset-password-trouble-code = Máte problémy so zadaním kódu?
confirm-totp-reset-password-confirm-button = Potvrdiť
confirm-totp-reset-password-input-label-v2 = Zadajte šesťmiestny kód
confirm-totp-reset-password-use-different-account = Použiť iný účet


password-reset-flow-heading = Zmena hesla
password-reset-body-2 = Požiadame vás o niekoľko vecí, ktoré viete iba vy, aby ste si ponechali svoj účet v bezpečí.
password-reset-email-input =
    .label = Zadajte svoju e‑mailovú adresu
password-reset-submit-button-2 = Pokračovať


reset-password-complete-header = Vaše heslo bolo zmenené
reset-password-confirmed-cta = A pokračovať do služby { $serviceName }




password-reset-recovery-method-header = Zmena hesla
password-reset-recovery-method-subheader = Vyberte spôsob obnovy
password-reset-recovery-method-details = Poďme sa, že ste to vy, čo používate svoje metódy obnovy.
password-reset-recovery-method-phone = Obnovenie pomocou telefónu
password-reset-recovery-method-code = Záložné overovacie kódy
password-reset-recovery-method-code-info =
    { $numBackupCodes ->
        [one] Zostáva { $numBackupCodes } kód
        [few] Zostávajú { $numBackupCodes } kódy
        [many] Zostáva { $numBackupCodes } kódov
       *[other] Zostáva { $numBackupCodes } kódov
    }
password-reset-recovery-method-send-code-error-heading = Pri odosielaní kódu na váš telefón na obnovenie sa vyskytol problém
password-reset-recovery-method-send-code-error-description = Skúste to znova neskôr alebo použite záložné overovacie kódy.


reset-password-recovery-phone-flow-heading = Zmeniť heslo
reset-password-recovery-phone-heading = Zadajte obnovovací kód
reset-password-recovery-phone-instruction-v3 = Na telefónne číslo končiace číslicami <span>{ $lastFourPhoneDigits }</span> bol prostredníctvom textovej správy odoslaný šesťmiestny kód. Platnosť tohto kódu vyprší po 5 minútach. Nezdieľajte tento kód s nikým.
reset-password-recovery-phone-input-label = Zadajte šesťmiestny kód
reset-password-recovery-phone-code-submit-button = Potvrdiť
reset-password-recovery-phone-resend-code-button = Znova odoslať kód
reset-password-recovery-phone-resend-success = Kód bol odoslaný
reset-password-recovery-phone-locked-out-link = Stratili ste prístup?
reset-password-recovery-phone-send-code-error-heading = Pri odosielaní kódu sa vyskytol problém
reset-password-recovery-phone-code-verification-error-heading = Pri overovaní vášho kódu sa vyskytol problém
reset-password-recovery-phone-general-error-description = Skúste to znova neskôr.
reset-password-recovery-phone-invalid-code-error-description = Kód je neplatný alebo jeho platnosť vypršala.
reset-password-recovery-phone-invalid-code-error-link = Chcete namiesto toho použiť záložné overovacie kódy?
reset-password-with-recovery-key-verified-page-title = Zmena hesla bolo úspešná
reset-password-complete-new-password-saved = Nové heslo bolo uložené!
reset-password-complete-recovery-key-created = Bol vytvorený nový kľúč na obnovenie účtu. Stiahnite si ho a uložte teraz.
reset-password-complete-recovery-key-download-info =
    Tento kľúč je nevyhnutný pre
    obnovu dát v prípade zabudnutia hesla. <b>Stiahnite ho a bezpečne uložte, pretože neskôr už nebudete mať prístup k tejto stránke.</b>


error-label = Chyba:
validating-signin = Overuje sa prihlásenie…
complete-signin-error-header = Chyba potvrdenia
signin-link-expired-header = Platnosť potvrdzovacieho odkazu vypršala
signin-link-expired-message-2 = Platnosť odkazu, na ktorý ste klikli, vypršala alebo už bol použitý.


signin-password-needed-header-2 = Zadajte heslo<span> pre svoj { -product-mozilla-account(case: "acc", capitalization: "lower") }</span>
signin-subheader-without-logo-with-servicename = A pokračovať do služby { $serviceName }
signin-subheader-without-logo-default = A pokračovať do nastavení účtu
signin-button = Prihlásiť sa
signin-header = Prihlásiť sa
signin-use-a-different-account-link = Použiť iný účet
signin-forgot-password-link = Zabudli ste heslo?
signin-password-button-label = Heslo
signin-desktop-relay = { -brand-firefox } sa vás po prihlásení pokúsi poslať späť, aby ste mohli použiť e‑mailovú masku.
signin-code-expired-error = Platnosť kódu vypršala. Prihláste sa znova.
signin-account-locked-banner-heading = Zmena hesla
signin-account-locked-banner-description = Váš účet sme zablokovali, aby sme ho ochránili pred podozrivou aktivitou.
signin-account-locked-banner-link = Zmeňte si heslo a prihláste sa


report-signin-link-damaged-body = Odkaz, na ktorý ste klikli, neobsahuje všetky potrebné znaky. Je možné, že nebol korektne spracovaný vašim e‑mailovým klientom. Skopírujte adresu do prehliadača a skúste to znova.
report-signin-header = Nahlásiť neoprávnené prihlásenie?
report-signin-body = Dostali ste e‑mail o pokuse o prihlásenie sa k vášmu účtu. Chcete túto aktivitu nahlásiť ako podozrivú?
report-signin-submit-button = Nahlásiť aktivitu
report-signin-support-link = Prečo sa to stalo?
report-signin-error = Ľutujeme, pri odosielaní hlásenia sa vyskytol problém.
signin-bounced-header = Mrzí nás to, no váš účet bol uzamknutý.
signin-bounced-message = Potvrdzovací e‑mail, ktorý sme poslali na adresu { $email }, nebol doručený. Aby sme ochránili vaše údaje { -brand-firefox(case: "gen") }, váš účet sme uzamkli.
signin-bounced-help = Ak ide o platnú e‑mailovú adresu, <linkExternal>dajte nám vedieť</linkExternal> a my vám pomôžeme odomknúť váš účet.
signin-bounced-create-new-account = Už tento účet nevlastníte? Vytvorte si nový účet
back = Naspäť


signin-push-code-heading-w-default-service = Overte toto prihlásenie <span>a pokračujte do nastavení účtu</span>
signin-push-code-heading-w-custom-service = Overte toto prihlásenie <span>a pokračujte do služby { $serviceName }</span>
signin-push-code-instruction = Skontrolujte svoje ostatné zariadenia a schváľte toto prihlásenie zo svojho prehliadača { -brand-firefox }.
signin-push-code-did-not-recieve = Nedostali ste notifikáciu?
signin-push-code-send-email-link = Odoslať kód na e‑mail


signin-push-code-confirm-instruction = Potvrďte svoje prihlásenie
signin-push-code-confirm-description = Zistili sme pokus o prihlásenie z nasledujúceho zariadenia. Ak ste to boli vy, potvrďte prihlásenie
signin-push-code-confirm-verifying = Overuje sa
signin-push-code-confirm-login = Potvrdiť prihlásenie
signin-push-code-confirm-wasnt-me = Toto som nebol ja, zmeniť heslo.
signin-push-code-confirm-login-approved = Vaše prihlásenie bolo schválené. Zatvorte toto okno.
signin-push-code-confirm-link-error = Odkaz je poškodený. Skúste to znova.


signin-recovery-method-header = Prihlásenie
signin-recovery-method-subheader = Vyberte spôsob obnovy
signin-recovery-method-details = Poďme sa, že ste to vy, čo používate svoje metódy obnovy.
signin-recovery-method-phone = Obnovenie pomocou telefónu
signin-recovery-method-code-v2 = Záložné overovacie kódy
signin-recovery-method-code-info-v2 =
    { $numBackupCodes ->
        [one] Zostáva { $numBackupCodes } kód
        [few] Zostávajú { $numBackupCodes } kódy
        [many] Zostáva { $numBackupCodes } kódov
       *[other] Zostáva { $numBackupCodes } kódov
    }
signin-recovery-method-send-code-error-heading = Pri odosielaní kódu na váš telefón na obnovenie sa vyskytol problém
signin-recovery-method-send-code-error-description = Skúste to znova neskôr alebo použite záložné overovacie kódy.


signin-recovery-code-heading = Prihlásenie
signin-recovery-code-sub-heading = Zadajte záložný overovací kód
signin-recovery-code-instruction-v3 = Zadajte jeden z kódov na jednorazové použitie, ktoré ste si uložili pri nastavovaní dvojstupňového overenia.
signin-recovery-code-input-label-v2 = Zadajte 10‑miestny kód
signin-recovery-code-confirm-button = Potvrdiť
signin-recovery-code-phone-link = Použiť obnovenie pomocou telefónu
signin-recovery-code-support-link = Stratili ste prístup?
signin-recovery-code-required-error = Vyžaduje sa záložný overovací kód
signin-recovery-code-use-phone-failure = Pri odosielaní kódu na váš telefón na obnovenie sa vyskytol problém
signin-recovery-code-use-phone-failure-description = Skúste to znova neskôr.


signin-recovery-phone-flow-heading = Prihlásenie
signin-recovery-phone-heading = Zadajte obnovovací kód
signin-recovery-phone-instruction-v3 = Na telefónne číslo končiace číslicami <span>{ $lastFourPhoneDigits }</span> bol prostredníctvom textovej správy odoslaný šesťmiestny kód. Platnosť tohto kódu vyprší po 5 minútach. Nezdieľajte tento kód s nikým.
signin-recovery-phone-input-label = Zadajte šesťmiestny kód
signin-recovery-phone-code-submit-button = Potvrdiť
signin-recovery-phone-resend-code-button = Znova odoslať kód
signin-recovery-phone-resend-success = Kód bol odoslaný
signin-recovery-phone-locked-out-link = Stratili ste prístup?
signin-recovery-phone-send-code-error-heading = Pri odosielaní kódu sa vyskytol problém
signin-recovery-phone-code-verification-error-heading = Pri overovaní vášho kódu sa vyskytol problém
signin-recovery-phone-general-error-description = Skúste to znova neskôr.
signin-recovery-phone-invalid-code-error-description = Kód je neplatný alebo jeho platnosť vypršala.
signin-recovery-phone-invalid-code-error-link = Chcete namiesto toho použiť záložné overovacie kódy?
signin-recovery-phone-success-message = Úspešne ste sa prihlásili. Ak znova použijete telefón na obnovenie, môžu platiť limity.


signin-reported-header = Ďakujeme za vašu ostražitosť
signin-reported-message = Náš tím bol informovaný. Podobné hlásenia nám pomáhajú odrážať narušiteľov.


signin-token-code-heading-2 = Zadajte potvrdzovací kód<span> pre svoj { -product-mozilla-account(case: "acc", capitalization: "lower") }</span>
signin-token-code-instruction-v2 = V priebehu 5 minút zadajte kód, ktorý bol odoslaný na e‑mailovú adresu <email>{ $email }</email>.
signin-token-code-input-label-v2 = Zadajte šesťmiestny kód
signin-token-code-confirm-button = Potvrdiť
signin-token-code-code-expired = Platnosť kódu vypršala?
signin-token-code-resend-code-link = Odoslať e‑mailom nový kód.
signin-token-code-resend-code-countdown =
    { $seconds ->
        [one] Odoslať nový kód e‑mailom o { $seconds } sekundu
        [few] Odoslať nový kód e‑mailom o { $seconds } sekundy
        [many] Odoslať nový kód e‑mailom o { $seconds } sekúnd
       *[other] Odoslať nový kód e‑mailom o { $seconds } sekúnd
    }
signin-token-code-required-error = Vyžaduje sa potvrdzovací kód
signin-token-code-resend-error = Niečo sa pokazilo. Nový kód sa nepodarilo odoslať.
signin-token-code-instruction-desktop-relay = { -brand-firefox } sa vás po prihlásení pokúsi poslať späť, aby ste mohli použiť e‑mailovú masku.


signin-totp-code-header = Prihlásenie
signin-totp-code-subheader-v2 = Zadajte kód pre dvojstupňové overenie
signin-totp-code-instruction-v4 = Skontrolujte svoju <strong>overovaciu aplikáciu</strong> a potvrďte svoje prihlásenie.
signin-totp-code-input-label-v4 = Zadajte šesťmiestny kód
signin-totp-code-aal-banner-header = Prečo sa od vás žiada o overenie totožnosti?
signin-totp-code-aal-banner-content = Nastavili ste si dvojstupňové overenie vo svojom účte, ale ešte ste sa na tomto zariadení neprihlásili pomocou kódu.
signin-totp-code-aal-sign-out = Odhlásiť sa na tomto zariadení
signin-totp-code-aal-sign-out-error = Ľutujeme, vyskytol sa problém s odhlásením
signin-totp-code-confirm-button = Potvrdiť
signin-totp-code-other-account-link = Použiť iný účet
signin-totp-code-recovery-code-link = Máte problémy so zadaním kódu?
signin-totp-code-required-error = Vyžaduje sa overovací kód
signin-totp-code-desktop-relay = { -brand-firefox } sa vás po prihlásení pokúsi poslať späť, aby ste mohli použiť e‑mailovú masku.


signin-unblock-header = Autorizovať toto prihlásenie
signin-unblock-body = Na e‑mailovú adresu { $email } sme poslali autorizačný kód.
signin-unblock-code-input = Zadajte autorizačný kód
signin-unblock-submit-button = Pokračovať
signin-unblock-code-required-error = Vyžaduje sa autorizačný kód
signin-unblock-code-incorrect-length = Autorizačný kód musí obsahovať 8 znakov
signin-unblock-code-incorrect-format-2 = Autorizačný kód môže obsahovať iba písmená a/alebo čísla
signin-unblock-resend-code-button = Nemáte nič v schránke ani v priečinku so spamom? Chcete, aby sme vám e‑mail odoslali znova?
signin-unblock-support-link = Prečo sa to stalo?
signin-unblock-desktop-relay = { -brand-firefox } sa vás po prihlásení pokúsi poslať späť, aby ste mohli použiť e‑mailovú masku.




confirm-signup-code-page-title = Zadajte potvrdzovací kód
confirm-signup-code-heading-2 = Zadajte potvrdzovací kód <span>pre svoj { -product-mozilla-account(case: "acc", capitalization: "lower") }</span>
confirm-signup-code-instruction-v2 = V priebehu 5 minút zadajte kód, ktorý bol odoslaný na e‑mailovú adresu <email>{ $email }</email>.
confirm-signup-code-input-label = Zadajte šesťmiestny kód
confirm-signup-code-confirm-button = Potvrdiť
confirm-signup-code-sync-button = Spustiť synchronizáciu
confirm-signup-code-code-expired = Platnosť kódu vypršala?
confirm-signup-code-resend-code-link = Odoslať e‑mailom nový kód.
confirm-signup-code-resend-code-countdown =
    { $seconds ->
        [one] Odoslať nový kód e‑mailom o { $seconds } sekundu
        [few] Odoslať nový kód e‑mailom o { $seconds } sekundy
        [many] Odoslať nový kód e‑mailom o { $seconds } sekúnd
       *[other] Odoslať nový kód e‑mailom o { $seconds } sekúnd
    }
confirm-signup-code-success-alert = Účet bol úspešne potvrdený
confirm-signup-code-is-required-error = Vyžaduje sa potvrdzovací kód
confirm-signup-code-desktop-relay = { -brand-firefox } sa vás po prihlásení pokúsi poslať späť, aby ste mohli použiť e‑mailovú masku.


signup-heading-v2 = Vytvoriť heslo
signup-relay-info = Heslo je potrebné na bezpečnú správu vašich maskovaných e‑mailov a prístup k bezpečnostným nástrojom od { -brand-mozilla(case: "gen") }.
signup-sync-info = Synchronizujte svoje heslá, záložky a ďalšie údaje všade, kde používate { -brand-firefox }.
signup-sync-info-with-payment = Synchronizujte svoje heslá, spôsoby platby, záložky a ďalšie údaje všade, kde používate { -brand-firefox }.
signup-change-email-link = Zmeniť e‑mailovú adresu


signup-confirmed-sync-header = Synchronizácia je zapnutá
signup-confirmed-sync-success-banner = { -product-mozilla-account } potvrdený
signup-confirmed-sync-button = Začať prehliadanie
signup-confirmed-sync-description-with-payment-v2 = Vaše heslá, spôsoby platby, adresy, záložky, história a ďalšie sa môžu synchronizovať všade, kde používate { -brand-firefox }.
signup-confirmed-sync-description-v2 = Vaše heslá, adresy, záložky, história a ďalšie sa môžu synchronizovať všade, kde používate { -brand-firefox }.
signup-confirmed-sync-add-device-link = Pridať ďalšie zariadenie
signup-confirmed-sync-manage-sync-button = Spravovať synchronizáciu
signup-confirmed-sync-set-password-success-banner = Synchronizačné heslo vytvorené
