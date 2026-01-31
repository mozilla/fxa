



-brand-mozilla =
    { $case ->
        [gen] Mozilly
        [dat] Mozille
        [acc] Mozillu
        [voc] Mozillo
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
        [voc] Firefoxe
        [loc] Firefoxu
        [ins] Firefoxem
       *[nom] Firefox
    }
    .gender = masculine
-product-firefox-accounts =
    { $case ->
        [gen]
            { $capitalization ->
                [lower] účtu Firefoxu
               *[upper] Účtu Firefoxu
            }
        [dat]
            { $capitalization ->
                [lower] účtu Firefoxu
               *[upper] Účtu Firefoxu
            }
        [acc]
            { $capitalization ->
                [lower] účet Firefoxu
               *[upper] Účet Firefoxu
            }
        [voc]
            { $capitalization ->
                [lower] účte Firefoxu
               *[upper] Účte Firefoxu
            }
        [loc]
            { $capitalization ->
                [lower] účtu Firefoxu
               *[upper] Účtu Firefoxu
            }
        [ins]
            { $capitalization ->
                [lower] účtem Firefoxu
               *[upper] Účtem Firefoxu
            }
       *[nom]
            { $capitalization ->
                [lower] účet Firefoxu
               *[upper] Účet Firefoxu
            }
    }
-product-mozilla-account =
    { $case ->
        [gen]
            { $capitalization ->
                [lower] účtu Mozilla
                [upper] Účtu Mozilla
                [lowercase] účtu Mozilla
               *[uppercase] Účtu Mozilla
            }
        [dat]
            { $capitalization ->
                [lower] účtu Mozilla
                [upper] Účtu Mozilla
                [lowercase] účtu Mozilla
               *[uppercase] Účtu Mozilla
            }
        [acc]
            { $capitalization ->
                [lower] účet Mozilla
                [upper] Účet Mozilla
                [lowercase] účet Mozilla
               *[uppercase] Účet Mozilla
            }
        [voc]
            { $capitalization ->
                [lower] účte Mozilla
                [upper] Účte Mozilla
                [lowercase] účte Mozilla
               *[uppercase] Účte Mozilla
            }
        [loc]
            { $capitalization ->
                [lower] účtu Mozilla
                [upper] Účtu Mozilla
                [lowercase] účtu Mozilla
               *[uppercase] Účtu Mozilla
            }
        [ins]
            { $capitalization ->
                [lower] účtem Mozilla
                [upper] Účtem Mozilla
                [lowercase] účtem Mozilla
               *[uppercase] Účtem Mozilla
            }
       *[nom]
            { $capitalization ->
                [lower] účet Mozilla
                [upper] Účet Mozilla
                [lowercase] účet Mozilla
               *[uppercase] Účet Mozilla
            }
    }
-product-mozilla-accounts =
    { $case ->
        [gen]
            { $capitalization ->
                [lower] účtu Mozilla
                [upper] Účtu Mozilla
                [lowercase] účtu Mozilla
               *[uppercase] Účtu Mozilla
            }
        [dat]
            { $capitalization ->
                [lower] účtu Mozilla
                [upper] Účtu Mozilla
                [lowercase] účtu Mozilla
               *[uppercase] Účtu Mozilla
            }
        [acc]
            { $capitalization ->
                [lower] účet Mozilla
                [upper] Účet Mozilla
                [lowercase] účet Mozilla
               *[uppercase] Účet Mozilla
            }
        [voc]
            { $capitalization ->
                [lower] účte Mozilla
                [upper] Účte Mozilla
                [lowercase] účte Mozilla
               *[uppercase] Účte Mozilla
            }
        [loc]
            { $capitalization ->
                [lower] účtu Mozilla
                [upper] Účtu Mozilla
                [lowercase] účtu Mozilla
               *[uppercase] Účtu Mozilla
            }
        [ins]
            { $capitalization ->
                [lower] účtem Mozilla
                [upper] Účtem Mozilla
                [lowercase] účtem Mozilla
               *[uppercase] Účtem Mozilla
            }
       *[nom]
            { $capitalization ->
                [lower] účet Mozilla
                [upper] Účet Mozilla
                [lowercase] účet Mozilla
               *[uppercase] Účet Mozilla
            }
    }
-product-firefox-account =
    { $case ->
        [gen]
            { $capitalization ->
                [lower] účtu Firefoxu
               *[upper] Účtu Firefoxu
            }
        [dat]
            { $capitalization ->
                [lower] účtu Firefoxu
               *[upper] Účtu Firefoxu
            }
        [acc]
            { $capitalization ->
                [lower] účet Firefoxu
               *[upper] Účet Firefoxu
            }
        [voc]
            { $capitalization ->
                [lower] účte Firefoxu
               *[upper] Účte Firefoxu
            }
        [loc]
            { $capitalization ->
                [lower] účtu Firefoxu
               *[upper] Účtu Firefoxu
            }
        [ins]
            { $capitalization ->
                [lower] účtem Firefoxu
               *[upper] Účtem Firefoxu
            }
       *[nom]
            { $capitalization ->
                [lower] účet Firefoxu
               *[upper] Účet Firefoxu
            }
    }
-product-mozilla-vpn =
    { $case ->
        [gen] Mozilly VPN
        [dat] Mozille VPN
        [acc] Mozillu VPN
        [voc] Mozillo VPN
        [loc] Mozille VPN
        [ins] Mozillou VPN
       *[nom] Mozilla VPN
    }
    .gender = feminine
-product-mozilla-vpn-short = VPN
-product-mozilla-hubs = Mozilla Hubs
-product-mdn = MDN
-product-mdn-plus = MDN Plus
-product-firefox-cloud =
    { $case ->
        [gen] Firefox Cloudu
        [dat] Firefox Cloudu
        [acc] Firefox Cloud
        [voc] Firefox Cloude
        [loc] Firefox Cloudu
        [ins] Firefox Cloudem
       *[nom] Firefox Cloud
    }
    .gender = masculine
-product-mozilla-monitor = Mozilla Monitor
-product-mozilla-monitor-short =
    { $case ->
        [gen] Monitoru
        [dat] Monitoru
        [acc] Monitor
        [voc] Monitore
        [loc] Monitoru
        [ins] Monitorem
       *[nom] Monitor
    }
    .gender = masculine
-product-firefox-relay =
    { $case ->
        [gen] Firefoxu Relay
        [dat] Firefoxu Relay
        [acc] Firefox Relay
        [voc] Firefoxe Relay
        [loc] Firefoxu Relay
        [ins] Firefoxem Relay
       *[nom] Firefox Relay
    }
    .gender = masculine
-product-firefox-relay-short = Relay
-brand-apple =
    { $case ->
        [gen] Applu
        [dat] Applu
        [acc] Apple
        [voc] Apple
        [loc] Applu
        [ins] Applem
       *[nom] Apple
    }
    .gender = masculine
-brand-apple-pay = Apple Pay
-brand-google =
    { $case ->
        [gen] Googlu
        [dat] Googlu
        [acc] Google
        [voc] Google
        [loc] Googlu
        [ins] Googlem
       *[nom] Google
    }
    .gender = masculine
-brand-google-pay = Google Pay
-brand-paypal =
    { $case ->
        [gen] PayPalu
        [dat] PayPalu
        [acc] PayPal
        [voc] PayPale
        [loc] PayPalu
        [ins] PayPalem
       *[nom] PayPal
    }
    .gender = masculine
-brand-name-stripe =
    { $case ->
        [gen] Stripu
        [dat] Stripu
        [acc] Stripe
        [voc] Stripe
        [loc] Stripu
        [ins] Stripem
       *[nom] Stripe
    }
    .gender = masculine
-brand-amex = American Express
-brand-diners = Diners Club
-brand-discover = Discover
-brand-jcb = JCB
-brand-link = Link
-brand-mastercard = Mastercard
-brand-unionpay = UnionPay
-brand-visa = Visa
-app-store =
    { $case ->
        [gen] App Storu
        [dat] App Storu
        [acc] App Store
        [voc] App Store
        [loc] App Storu
        [ins] App Storem
       *[nom] App Store
    }
    .gender = masculine
-google-play = Google Play

app-general-err-heading = Obecná chyba aplikace
app-general-err-message = Něco se pokazilo. Zkuste to prosím znovu později.
app-query-parameter-err-heading = Špatný požadavek: neplatné parametry v dotazu


app-footer-mozilla-logo-label = logo { -brand-mozilla(case: "gen") }
app-footer-privacy-notice = Zásady ochrany osobních údajů
app-footer-terms-of-service = Podmínky služby


app-default-title-2 = { -product-mozilla-accounts }
app-page-title-2 = { $title } | { -product-mozilla-accounts }


link-sr-new-window = Otevře se v novém okně


app-loading-spinner-aria-label-loading = Načítání…


app-logo-alt-3 =
    .alt = Logo { -brand-mozilla } m



resend-code-success-banner-heading = Na váš e-mail byl odeslán nový kód.
resend-link-success-banner-heading = Na váš e-mail byl odeslán nový odkaz.
resend-success-banner-description = Pro jistotu si přidejte adresu { $accountsEmail } do svých kontaktů.


brand-banner-dismiss-button-2 =
    .aria-label = Zavřít oznámení
brand-prelaunch-title = { -product-firefox-accounts } bude 1. listopadu přejmenován na { -product-mozilla-accounts }
brand-prelaunch-subtitle = Stále se budete přihlašovat stejným uživatelským jménem a heslem a nedojde k žádným dalším změnám v používaných produktech.
brand-postlaunch-title = Přejmenovali jsme { -product-firefox-accounts } na { -product-mozilla-accounts }. Stále se budete přihlašovat pod stejným uživatelským jménem a heslem a nedojde k žádným dalším změnám v používaných produktech.
brand-learn-more = Zjistit více
brand-close-banner =
    .alt = Zavřít oznámení
brand-m-logo =
    .alt = Logo { -brand-mozilla } m


button-back-aria-label = Zpět
button-back-title = Zpět


recovery-key-download-button-v3 = Stáhnout a pokračovat
    .title = Stáhnout a pokračovat
recovery-key-pdf-heading = Obnovovací klíč k účtu
recovery-key-pdf-download-date = Vytvořen: { $date }
recovery-key-pdf-key-legend = Obnovovací klíč k účtu
recovery-key-pdf-instructions = Tento klíč umožňuje obnovit zašifrovaná data prohlížeče (včetně hesel, záložek a historie), pokud zapomenete heslo. Uložte jej na místo, které si budete pamatovat.
recovery-key-pdf-storage-ideas-heading = Místa pro uložení vašeho klíče
recovery-key-pdf-support = Další informace o obnovovacím klíči k účtu
recovery-key-pdf-download-error = Je nám líto, ale při stahování klíče pro obnovení účtu došlo k problému.


choose-newsletters-prompt-2 = Získejte více od { -brand-mozilla(case: "gen") }:
choose-newsletters-option-latest-news =
    .label = Získejte naše nejnovější zprávy a aktualizace produktů
choose-newsletters-option-test-pilot =
    .label = Brzký přístup k testování nových produktů
choose-newsletters-option-reclaim-the-internet =
    .label = Výzvy na opětovné získání internetu


datablock-download =
    .message = Staženo
datablock-copy =
    .message = Zkopírováno
datablock-print =
    .message = Vytištěno


datablock-copy-success =
    { $count ->
        [one] Kód zkopírován
        [few] Kódy zkopírovány
       *[other] Kódy zkopírovány
    }
datablock-download-success =
    { $count ->
        [one] Kód byl stažen
        [few] Kódy staženy
       *[other] Kódy staženy
    }
datablock-print-success =
    { $count ->
        [one] Kód vytištěn
        [few] Kódy vytištěny
       *[other] Kódy vytištěny
    }


datablock-inline-copy =
    .message = Zkopírováno


device-info-block-location-city-region-country = { $city }, { $region }, { $country } (odhad)
device-info-block-location-region-country = { $region }, { $country } (odhad)
device-info-block-location-city-country = { $city }, { $country } (odhad)
device-info-block-location-country = { $country } (odhad)
device-info-block-location-unknown = Neznámá poloha
device-info-browser-os = { $browserName } na { $genericOSName }
device-info-ip-address = IP adresa: { $ipAddress }


form-password-with-inline-criteria-signup-new-password-label =
    .label = Heslo
form-password-with-inline-criteria-signup-confirm-password-label =
    .label = Zopakujte heslo
form-password-with-inline-criteria-signup-submit-button = Vytvořit účet
form-password-with-inline-criteria-reset-new-password =
    .label = Nové heslo
form-password-with-inline-criteria-confirm-password =
    .label = Potvrdit heslo
form-password-with-inline-criteria-reset-submit-button = Vytvořit nové heslo
form-password-with-inline-criteria-set-password-new-password-label =
    .label = Heslo
form-password-with-inline-criteria-set-password-confirm-password-label =
    .label = Zopakujte heslo
form-password-with-inline-criteria-set-password-submit-button = Spustit synchronizaci
form-password-with-inline-criteria-match-error = Hesla se neshodují
form-password-with-inline-criteria-sr-too-short-message = Heslo musí obsahovat alespoň 8 znaků.
form-password-with-inline-criteria-sr-not-email-message = Heslo nesmí obsahovat vaši e-mailovou adresu.
form-password-with-inline-criteria-sr-not-common-message = Heslo nesmí být běžně používaným heslem.
form-password-with-inline-criteria-sr-requirements-met = Zadané heslo respektuje všechny požadavky na heslo.
form-password-with-inline-criteria-sr-passwords-match = Zadaná hesla se shodují.


form-verify-code-default-error = Toto pole je povinné


form-verify-totp-disabled-button-title-numeric = Pro pokračování vložte { $codeLength }-místný číselný kód
form-verify-totp-disabled-button-title-alphanumeric = Pro pokračování vložte { $codeLength } znakový kód


get-data-trio-title-firefox = { -brand-firefox }
get-data-trio-title-firefox-recovery-key = Klíč k obnovení účtu { -brand-firefox }
get-data-trio-title-backup-verification-codes = Záložní ověřovací kódy
get-data-trio-download-2 =
    .title = Stáhnout
    .aria-label = Stáhnout
get-data-trio-copy-2 =
    .title = Kopírovat
    .aria-label = Kopírovat
get-data-trio-print-2 =
    .title = Vytisknout
    .aria-label = Vytisknout


alert-icon-aria-label =
    .aria-label = Upozornění
icon-attention-aria-label =
    .aria-label = Upozornění
icon-warning-aria-label =
    .aria-label = Varování
authenticator-app-aria-label =
    .aria-label = Ověřovací aplikace
backup-codes-icon-aria-label-v2 =
    .aria-label = Záložní ověřovací kódy povoleny
backup-codes-disabled-icon-aria-label-v2 =
    .aria-label = Záložní ověřovací kódy jsou zakázány
backup-recovery-sms-icon-aria-label =
    .aria-label = Obnovovací SMS povoleny
backup-recovery-sms-disabled-icon-aria-label =
    .aria-label = Obnovovací SMS jsou zakázány
canadian-flag-icon-aria-label =
    .aria-label = Kanadská vlajka
checkmark-icon-aria-label =
    .aria-label = Zaškrtnout
checkmark-success-icon-aria-label =
    .aria-label = Úspěch
checkmark-enabled-icon-aria-label =
    .aria-label = Povoleno
close-icon-aria-label =
    .aria-label = Zavřít zprávu
code-icon-aria-label =
    .aria-label = Kód
error-icon-aria-label =
    .aria-label = Chyba
info-icon-aria-label =
    .aria-label = Informace
usa-flag-icon-aria-label =
    .aria-label = Vlajka Spojených států amerických


hearts-broken-image-aria-label =
    .aria-label = Počítač a mobil a na každém obrázek zlomeného srdce
hearts-verified-image-aria-label =
    .aria-label = Počítač, mobilní telefon a tablet a na každém pulzující srdíčko
signin-recovery-code-image-description =
    .aria-label = Dokument, který obsahuje skrytý text.
signin-totp-code-image-label =
    .aria-label = Zařízení se skrytým 6místným kódem.
confirm-signup-aria-label =
    .aria-label = Obálka obsahující odkaz
security-shield-aria-label =
    .aria-label = Ilustrace představující klíč pro obnovení účtu.
recovery-key-image-aria-label =
    .aria-label = Ilustrace představující klíč pro obnovení účtu.
password-image-aria-label =
    .aria-label = Ilustrace při zadávání hesla.
lightbulb-aria-label =
    .aria-label = Ilustrace znázorňující vytvoření nápovědy k úložišti.
email-code-image-aria-label =
    .aria-label = Ilustrace znázorňující e-mail obsahující kód.
recovery-phone-image-description =
    .aria-label = Mobilní zařízení, které přijímá kód prostřednictvím textové zprávy.
recovery-phone-code-image-description =
    .aria-label = Kód byl přijat na mobilní zařízení.
backup-recovery-phone-image-aria-label =
    .aria-label = Mobilní zařízení s možností zasílání SMS zpráv
backup-authentication-codes-image-aria-label =
    .aria-label = Obrazovka zařízení s kódy
sync-clouds-image-aria-label =
    .aria-label = Mraky s ikonou synchronizace
confetti-falling-image-aria-label =
    .aria-label = Animované padající konfety


inline-recovery-key-setup-signed-in-firefox-2 = Jste přihlášeni do { -brand-firefox(case: "gen") }.
inline-recovery-key-setup-create-header = Zabezpečte svůj účet
inline-recovery-key-setup-create-subheader = Máte minutku na ochranu svých údajů?
inline-recovery-key-setup-info = Vytvořte si k účtu obnovovací klíč, abyste mohli obnovit synchronizovaná data o prohlížení v případě, že zapomenete své heslo.
inline-recovery-key-setup-start-button = Vytvořit obnovovací klíč k účtu
inline-recovery-key-setup-later-button = Udělám to později


input-password-hide = Skrýt heslo
input-password-show = Zobrazit heslo
input-password-hide-aria-2 = Vaše heslo je aktuálně viditelné na obrazovce.
input-password-show-aria-2 = Vaše heslo je aktuálně skryté.
input-password-sr-only-now-visible = Vaše heslo je nyní viditelné na obrazovce.
input-password-sr-only-now-hidden = Vaše heslo je nyní skryté.


input-phone-number-country-list-aria-label = Vyberte zemi
input-phone-number-enter-number = Zadejte telefonní číslo
input-phone-number-country-united-states = Spojené státy
input-phone-number-country-canada = Kanada
legal-back-button = Zpět


reset-pwd-link-damaged-header = Odkaz pro obnovení je poškozen
signin-link-damaged-header = Odkaz pro potvrzení je poškozen
report-signin-link-damaged-header = Odkaz je poškozen
reset-pwd-link-damaged-message = Adresa odkazu, na který jste klikli, nebyla kompletní, a mohla být poškozena například vaším e-mailovým klientem. Zkopírujte pečlivě celou adresu a zkuste to znovu.


link-expired-new-link-button = Získat nový odkaz


remember-password-text = Pamatujete si své heslo?
remember-password-signin-link = Přihlásit se


primary-email-confirmation-link-reused = Hlavní adresa už byla ověřena
signin-confirmation-link-reused = Přihlášení už bylo potvrzeno
confirmation-link-reused-message = Každý potvrzovací odkaz lze použít pouze jednou a tento už byl použit.


locale-toggle-select-label = Vyberte jazyk
locale-toggle-browser-default = Předvolený jazyk prohlížeče
error-bad-request = Špatný požadavek


password-info-balloon-why-password-info = Toto heslo potřebujete pro přístup ke všem zašifrovaným datům, která u nás ukládáte.
password-info-balloon-reset-risk-info = Reset znamená potenciální ztrátu dat, jako jsou hesla a záložky.


password-strength-long-instruction = Zvolte si silné heslo, které jste na jiných stránkách ještě nepoužívali. Ujistěte se, že splňuje bezpečnostní požadavky:
password-strength-short-instruction = Zvolte silné heslo:
password-strength-inline-min-length = Alespoň 8 znaků
password-strength-inline-not-email = Není vaše e-mailová adresa
password-strength-inline-not-common = Není běžně používané heslo
password-strength-inline-confirmed-must-match = Potvrzení odpovídá novému heslu
password-strength-inline-passwords-match = Hesla se shodují


account-recovery-notification-cta = Vytvořit
account-recovery-notification-header-value = Neztraťte svá data, pokud zapomenete své heslo
account-recovery-notification-header-description = Vytvořte si k účtu obnovovací klíč pro obnovení synchronizovaných dat v případě, že zapomenete své heslo.
recovery-phone-promo-cta = Přidat telefon pro obnovení
recovery-phone-promo-heading = Přidejte do svého účtu další ochranu pomocí telefonu pro obnovení
recovery-phone-promo-description = Nyní se můžete přihlásit pomocí jednorázového hesla přes SMS, pokud nemůžete použít svou aplikaci pro dvoufázové ověření.
recovery-phone-promo-info-link = Přečtěte si více o riziku pro obnovu a výměnu SIM
promo-banner-dismiss-button =
    .aria-label = Zavřít banner


ready-complete-set-up-instruction = Dokončete nastavení zadáním nového hesla na ostatní zařízeních s { -brand-firefox(case: "ins") }.
manage-your-account-button = Správa účtu
ready-use-service = Nyní můžete používat službu { $serviceName }
ready-use-service-default = Nyní jste připraveni použít nastavení účtu
ready-account-ready = Váš účet je dokončen!
ready-continue = Pokračovat
sign-in-complete-header = Přihlášení potvrzeno
sign-up-complete-header = Účet ověřen
primary-email-verified-header = Hlavní e-mailová adresa byla potvrzena


flow-recovery-key-download-storage-ideas-heading-v2 = Místa pro uložení vašeho klíče:
flow-recovery-key-download-storage-ideas-folder-v2 = Složka na zabezpečeném zařízení
flow-recovery-key-download-storage-ideas-cloud = Důvěryhodné cloudové úložiště
flow-recovery-key-download-storage-ideas-print-v2 = Tištěná fyzická kopie
flow-recovery-key-download-storage-ideas-pwd-manager = Správce hesel


flow-recovery-key-hint-header-v2 = Přidejte nápovědu, která vám pomůže najít klíč
flow-recovery-key-hint-message-v3 = Tato nápověda by vám měla pomoci zapamatovat si, kam jste si uložili obnovovací klíč k účtu. Můžeme vám ji zobrazit v průběhu obnovy hesla a pomoci vám tak obnovit vaše data.
flow-recovery-key-hint-input-v2 =
    .label = Zadejte nápovědu (volitelné)
flow-recovery-key-hint-cta-text = Dokončit
flow-recovery-key-hint-char-limit-error = Nápověda musí mít méně než 255 znaků.
flow-recovery-key-hint-unsafe-char-error = Nápověda nemůže obsahovat nebezpečné znaky Unicode. Povoleny jsou pouze písmena, číslice, interpunkční znaménka a symboly.


password-reset-warning-icon = Varování
password-reset-chevron-expanded = Skrýt varování
password-reset-chevron-collapsed = Rozbalit varování
password-reset-data-may-not-be-recovered = Data prohlížeče nemusí být možné obnovit
password-reset-previously-signed-in-device-2 = Máte nějaké zařízení, na kterém jste se dříve přihlásili?
password-reset-data-may-be-saved-locally-2 = Data o prohlížeči mohou být uložena na tomto zařízení. Obnovte své heslo a poté se přihlaste pro obnovu a synchronizaci svých dat.
password-reset-no-old-device-2 = Vlastníte nové zařízení, ale nemáte přístup k žádnému z předchozích?
password-reset-encrypted-data-cannot-be-recovered-2 = Je nám líto, ale vaše šifrovaná data uložená na serverech { -brand-firefox(case: "gen") } nelze obnovit.
password-reset-warning-have-key = Máte k účtu obnovovací klíč?
password-reset-warning-use-key-link = Použijte ho k obnovení svého hesla a uchování dat


alert-bar-close-message = Zavřít zprávu


avatar-your-avatar =
    .alt = Váš avatar
avatar-default-avatar =
    .alt = Výchozí avatar




bento-menu-title-3 = produkty { -brand-mozilla(case: "gen") }
bento-menu-tagline = Další produkty od { -brand-mozilla(case: "gen") }, které chrání vaše soukromí
bento-menu-vpn-2 = { -product-mozilla-vpn }
bento-menu-monitor-3 = { -product-mozilla-monitor }
bento-menu-firefox-relay-2 = { -product-firefox-relay }
bento-menu-firefox-desktop = Prohlížeč { -brand-firefox } pro počítač
bento-menu-firefox-mobile = Prohlížeč { -brand-firefox } pro mobily
bento-menu-made-by-mozilla = Od { -brand-mozilla(case: "gen") }


connect-another-fx-mobile = Získejte { -brand-firefox(case: "acc") } na mobil nebo tablet
connect-another-find-fx-mobile-2 = { -brand-firefox } najdete na { -google-play } a { -app-store }.
connect-another-play-store-image-2 =
    .alt = Stáhnout { -brand-firefox } z { -google-play }
connect-another-app-store-image-3 =
    .alt = Stáhnout { -brand-firefox } z { -app-store }


cs-heading = Propojené služby
cs-description = Co vše používáte a kde jste přihlášeni.
cs-cannot-refresh = Nepodařilo se obnovit seznam propojených služeb.
cs-cannot-disconnect = Klient nebyl nalezen, nelze se odpojit
cs-logged-out-2 = Byli jste odhlášeni ze služby { $service }
cs-refresh-button =
    .title = Aktualizovat propojené služby
cs-missing-device-help = Chybějící nebo duplicitní položky?
cs-disconnect-sync-heading = Odpojit od Syncu


cs-disconnect-sync-content-3 = Vaše data o prohlížení zůstanou v zařízení <span>{ $device }</span>, ale už nebudou synchronizována s vaším účtem.
cs-disconnect-sync-reason-3 = Jaký byl váš hlavní důvod pro odpojení zařízení <span>{ $device }</span>?


cs-disconnect-sync-opt-prefix = Zařízení je:
cs-disconnect-sync-opt-suspicious = podezřelé
cs-disconnect-sync-opt-lost = ztracené nebo ukradené
cs-disconnect-sync-opt-old = staré nebo nahrazené
cs-disconnect-sync-opt-duplicate = duplicitní
cs-disconnect-sync-opt-not-say = Raději neupřesňovat


cs-disconnect-advice-confirm = Ok, rozumím
cs-disconnect-lost-advice-heading = Ztracené nebo ukradené zařízení bylo odpojeno
cs-disconnect-lost-advice-content-3 =
    Pokud bylo vaše zařízení ztraceno nebo ukradeno,
    pro zabezpečení vašich dat byste si měli změnit heslo svého { -product-mozilla-account(case: "gen", capitalization: "lower") }.
    Doporučujeme také u výrobce svého zařízení zjistit možnosti pro jeho vzdálené vymazání.
cs-disconnect-suspicious-advice-heading = Podezřelé zařízení bylo odpojeno
cs-disconnect-suspicious-advice-content-2 =
    Pokud je odpojované zařízení skutečně podezřejmé,
    pro zabezpečení vašich dat byste si měli změnit heslo svého { -product-mozilla-account(case: "gen", capitalization: "lower") }.
    Doporučujeme také změnit všechna hesla uložená ve { -brand-firefox(case: "loc") }, která najdete po zadání about:logins do adresního řádku.
cs-sign-out-button = Odhlásit se


dc-heading = Sběr dat a jejich použití
dc-subheader-moz-accounts = { -product-mozilla-accounts }
dc-subheader-ff-browser = Prohlížeč { -brand-firefox }
dc-subheader-content-2 = Povolte { -product-mozilla-accounts(case: "dat", capitalization: "lower") } zasílat { -brand-mozilla(case: "dat") } technické údaje a údaje o interakcích
dc-subheader-ff-content = Pokud chcete zkontrolovat nebo aktualizovat nastavení odesílání technických údajů a údajů o interakcích prohlížečem { -brand-firefox }, otevřete nastavení { -brand-firefox } a přejděte do sekce Soukromí a zabezpečení.
dc-opt-out-success-2 = Sdílení dat bylo úspěšně zrušeno. { -product-mozilla-accounts } nebude { -brand-mozilla(case: "dat") } odesílat technické údaje a údaje o interakcích.
dc-opt-in-success-2 = Díky! Sdílení těchto dat nám pomáhá vylepšovat { -product-mozilla-accounts(case: "acc", capitalization: "lower") }.
dc-opt-in-out-error-2 = Při změně předvolby shromažďování dat došlo k problému
dc-learn-more = Zjistit více


drop-down-menu-title-2 = Nabídka { -product-mozilla-account(case: "gen", capitalization: "lower") }
drop-down-menu-signed-in-as-v2 = Přihlášen(a) jako
drop-down-menu-sign-out = Odhlásit se
drop-down-menu-sign-out-error-2 = Omlouváme se, odhlášení se nezdařilo


flow-container-back = Zpět


flow-recovery-key-confirm-pwd-heading-v2 = Z důvodu zabezpečení zadejte znovu své heslo
flow-recovery-key-confirm-pwd-input-label = Zadání hesla
flow-recovery-key-confirm-pwd-submit-button = Vytvořit obnovovací klíč k účtu
flow-recovery-key-confirm-pwd-submit-button-change-key = Vytvořit nový obnovovací klíč k účtu


flow-recovery-key-download-heading-v2 = Obnovovací klíč k účtu byl vytvořen — stáhněte si jej a uložte
flow-recovery-key-download-info-v2 = Tento klíč umožňuje obnovit data, pokud zapomenete heslo. Stáhněte si jej nyní a uložte na místo, které si budete pamatovat — později se na tuto stránku nebudete moci vrátit.
flow-recovery-key-download-next-link-v2 = Pokračovat bez stahování


flow-recovery-key-success-alert = Obnovovací klíč k účtu byl vytvořen


flow-recovery-key-info-header = Vytvořte si obnovovací klíč k účtu pro případ, když zapomenete své heslo
flow-recovery-key-info-header-change-key = Změna vašeho obnovovacího klíče k účtu
flow-recovery-key-info-shield-bullet-point-v2 = Šifrujeme data procházení – hesla, záložky a další věci. Je to skvělé pro ochranu soukromí, ale znamená to, že pokud zapomenete heslo, můžete ztratit svá data.
flow-recovery-key-info-key-bullet-point-v2 = Proto je vytvoření obnovovacího klíče k účtu tak důležité – svůj klíč můžete použít k obnovu svých dat.
flow-recovery-key-info-cta-text-v3 = Začít
flow-recovery-key-info-cancel-link = Zrušit


flow-setup-2fa-qr-heading = Připojte se ke své ověřovací aplikaci
flow-setup-2a-qr-instruction = <strong>Krok 1:</strong> Naskenujte tento QR kód pomocí libovolné ověřovací aplikace, např. Duo nebo Google Authenticator.
flow-setup-2fa-qr-alt-text =
    .alt = QR kód pro nastavení dvoufázového ověřování. Naskenujte ho, nebo zvolte „Nemůžete QR kód naskenovat?“
flow-setup-2fa-cant-scan-qr-button = Nemůžete QR kód naskenovat?
flow-setup-2fa-manual-key-heading = Zadejte kód ručně
flow-setup-2fa-manual-key-instruction = <strong>Krok 1:</strong> Zadejte tento kód do preferované ověřovací aplikace.
flow-setup-2fa-scan-qr-instead-button = Místo toho naskenovat QR kód?
flow-setup-2fa-more-info-link = Zjistit více o ověřovacích aplikacích
flow-setup-2fa-button = Pokračovat
flow-setup-2fa-step-2-instruction = <strong>Krok 2:</strong>Zadejte kód z vaší ověřovací aplikace.
flow-setup-2fa-input-label = Zadejte šestimístný kód
flow-setup-2fa-code-error = Neplatný nebo prošlý kód. Zkontrolujte údaj ve své ověřovací aplikaci a zkuste to znovu.


flow-setup-2fa-backup-choice-heading = Vyberte způsob obnovení
flow-setup-2fa-backup-choice-description = Díky tomu se můžete přihlásit, pokud nemáte přístup ke svému mobilnímu zařízení nebo své ověřovací aplikaci.
flow-setup-2fa-backup-choice-phone-title = Telefon pro obnovení
flow-setup-2fa-backup-choice-phone-badge = Nejjednodušší
flow-setup-2fa-backup-choice-phone-info = Získejte obnovovací kód prostřednictvím textové zprávy. Momentálně dostupné v USA a Kanadě.
flow-setup-2fa-backup-choice-code-title = Záložní ověřovací kódy
flow-setup-2fa-backup-choice-code-badge = Nejbezpečnější
flow-setup-2fa-backup-choice-code-info = Vytvářejte a ukládejte jednorázové ověřovací kódy.
flow-setup-2fa-backup-choice-learn-more-link = Další informace o riziku obnovení a výměně SIM


flow-setup-2fa-backup-code-confirm-heading = Zadejte záložní ověřovací kód
flow-setup-2fa-backup-code-confirm-confirm-saved = Potvrďte uložení kódů zadáním jednoho z nich. Bez těchto kódů se možná nebudete moci přihlásit, pokud nemáte ověřovací aplikaci.
flow-setup-2fa-backup-code-confirm-code-input = Zadejte 10místný kód
flow-setup-2fa-backup-code-confirm-button-finish = Dokončit


flow-setup-2fa-backup-code-dl-heading = Uložit záložní ověřovací kódy
flow-setup-2fa-backup-code-dl-save-these-codes = Uložte si je na místo, které si budete pamatovat. Pokud nemáte přístup ke své ověřovací aplikaci, budete muset při přihlašování jeden z nich zadat.
flow-setup-2fa-backup-code-dl-button-continue = Pokračovat


flow-setup-2fa-inline-complete-success-banner = Dvoufázové ověřování je zapnuto
flow-setup-2fa-inline-complete-success-banner-description = Pro ochranu všech vašich připojených zařízení byste se měli odhlásit všude, kde používáte tento účet, a poté se znovu přihlaste pomocí nového dvoufázového ověření.
flow-setup-2fa-inline-complete-backup-code = Záložní ověřovací kódy
flow-setup-2fa-inline-complete-backup-phone = Telefon pro obnovení
flow-setup-2fa-inline-complete-backup-code-info =
    { $count ->
        [one] Zbývá { $count } kód
        [few] Zbývají { $count } kódy
       *[other] Zbývá { $count } kódů
    }
flow-setup-2fa-inline-complete-backup-code-description = Toto je nejbezpečnější způsob obnovení, pokud se nemůžete přihlásit pomocí svého mobilního zařízení nebo své ověřovací aplikace.
flow-setup-2fa-inline-complete-backup-phone-description = Toto je nejjednodušší způsob obnovení, pokud se nemůžete přihlásit pomocí své ověřovací aplikace.
flow-setup-2fa-inline-complete-learn-more-link = Jak tato funkce chrání váš účet
flow-setup-2fa-inline-complete-continue-button = Pokračovat do služby { $serviceName }
flow-setup-2fa-prompt-heading = Nastavení dvoufázového ověřování
flow-setup-2fa-prompt-description = { $serviceName } vyžaduje, abyste si nastavili dvoufázové ověřování, aby byl váš účet v bezpečí.
flow-setup-2fa-prompt-use-authenticator-apps = Pro pokračování můžete použít kteroukoliv z <authenticationAppsLink>těchto ověřovacích aplikací</authenticationAppsLink>.
flow-setup-2fa-prompt-continue-button = Pokračovat


flow-setup-phone-confirm-code-heading = Zadejte ověřovací kód
flow-setup-phone-confirm-code-instruction = Na číslo <span>{ $phoneNumber }</span> byl odeslán šestimístný kód jako textová zpráva. Tento kód vyprší po 5 minutách.
flow-setup-phone-confirm-code-input-label = Zadejte šestimístný kód
flow-setup-phone-confirm-code-button = Potvrdit
flow-setup-phone-confirm-code-expired = Platnost kódu vypršela?
flow-setup-phone-confirm-code-resend-code-button = Znovu odeslat kód
flow-setup-phone-confirm-code-resend-code-success = Kód byl odeslán
flow-setup-phone-confirm-code-success-message-v2 = Telefon pro obnovení byl přidán
flow-change-phone-confirm-code-success-message = Telefon pro obnovení se změnil


flow-setup-phone-submit-number-heading = Ověřte své telefonní číslo
flow-setup-phone-verify-number-instruction = { -brand-mozilla } vám zašle textovou zprávu s kódem pro ověření vašeho čísla. Tento kód s nikým nesdílejte.
flow-setup-phone-submit-number-info-message-v2 = Telefon pro obnovení je k dispozici pouze ve Spojených státech a Kanadě. VoIP čísla a telefonní masky se nedoporučují.
flow-setup-phone-submit-number-legal = Poskytnutím vašeho telefonního čísla souhlasíte s jeho uložením, abychom vám mohli posílat textové zprávy pouze pro ověření účtu. Mohou být účtovány poplatky za zprávy a data.
flow-setup-phone-submit-number-button = Zaslat kód


header-menu-open = Zavřít nabídku
header-menu-closed = Nabídka navigace na webu
header-back-to-top-link =
    .title = Zpět nahoru
header-back-to-settings-link =
    .title = Zpět na nastavení { -product-mozilla-account }
header-title-2 = { -product-mozilla-account }
header-help = Nápověda


la-heading = Propojené účty
la-description = Máte autorizovaný přístup k následujícím účtům.
la-unlink-button = Odpojit
la-unlink-account-button = Odpojit
la-set-password-button = Nastavení hesla
la-unlink-heading = Odpojit od účtu třetí strany
la-unlink-content-3 = Opravdu chcete odpojit svůj účet? Jeho odpojení vás automaticky neodhlásí z vašich propojených služeb. K tomu je třeba se odhlásit ručně v sekci Propojené služby.
la-unlink-content-4 = Před odpojením účtu je nutné nastavit heslo. Bez hesla byste se po odpojení účtu neměli moci jak přihlásit.
nav-linked-accounts = { la-heading }


modal-close-title = Zavřít
modal-cancel-button = Zrušit
modal-default-confirm-button = Potvrdit


modal-mfa-protected-title = Zadejte potvrzovací kód
modal-mfa-protected-subtitle = Pomozte nám ujistit se, že jste to vy, kdo mění informace o vašem účtu.
modal-mfa-protected-instruction =
    { $expirationTime ->
        [one] Vložte kód, který vám byl během { $expirationTime } minuty zaslán na adresu <email>{ $email }</email>.
        [few] Vložte kód, který vám byl během { $expirationTime } minut zaslán na adresu <email>{ $email }</email>.
       *[other] Vložte kód, který vám byl během { $expirationTime } minut zaslán na adresu <email>{ $email }</email>.
    }
modal-mfa-protected-input-label = Zadejte šestimístný kód
modal-mfa-protected-cancel-button = Zrušit
modal-mfa-protected-confirm-button = Potvrdit
modal-mfa-protected-code-expired = Platnost kódu vypršela?
modal-mfa-protected-resend-code-link = Zaslat e-mailem nový kód.


mvs-verify-your-email-2 = Potvrďte svou e-mailovou adresu
mvs-enter-verification-code-2 = Zadejte potvrzovací kód
mvs-enter-verification-code-desc-2 = Vložte prosím během 5 minut potvrzovací kód, který vám byl zaslán na <email>{ $email }</email>.
msv-cancel-button = Zrušit
msv-submit-button-2 = Potvrdit


nav-settings = Nastavení
nav-profile = Profil
nav-security = Zabezpečení
nav-connected-services = Propojené služby
nav-data-collection = Sběr dat a jejich použití
nav-paid-subs = Předplatné
nav-email-comm = E-mailová sdělení


page-2fa-change-title = Změnit dvoufázové ověřování
page-2fa-change-success = Dvoufázové ověřování bylo aktualizováno
page-2fa-change-success-additional-message = Pro ochranu všech vašich připojených zařízení byste se měli odhlásit všude, kde používáte tento účet, a poté se znovu přihlaste pomocí nového dvoufázového ověření.
page-2fa-change-totpinfo-error = Při výměně vaší aplikace pro dvoufázové ověřování nastala chyba. Zkuste to znovu později.
page-2fa-change-qr-instruction = <strong>Krok 1:</strong> Naskenujte tento QR kód pomocí libovolné aplikace, jako je Duo nebo Google Authenticator. Tím se vytvoří nové připojení a všechna stará připojení přestanou fungovat.


tfa-backup-codes-page-title = Záložní ověřovací kódy
tfa-replace-code-error-3 = Při výměně záložních ověřovacích kódů se vyskytl problém
tfa-create-code-error = Při vytváření záložních ověřovacích kódů se vyskytl problém
tfa-replace-code-success-alert-4 = Záložní ověřovací kódy byly aktualizovány
tfa-create-code-success-alert = Záložní ověřovací kódy byly vytvořeny
tfa-replace-code-download-description = Uložte si je na místo, které si budete pamatovat. Vaše staré kódy budou nahrazeny po dokončení dalšího kroku.
tfa-replace-code-confirm-description = Potvrďte uložení kódů zadáním jednoho z nich. Vaše staré záložní ověřovací kódy budou po dokončení tohoto kroku deaktivovány.
tfa-incorrect-recovery-code-1 = Nesprávný záložní ověřovací kód


page-2fa-setup-title = Dvoufázové ověřování
page-2fa-setup-totpinfo-error = Při nastavování dvoufázového ověřování došlo k chybě. Zkuste to znovu později.
page-2fa-setup-incorrect-backup-code-error = Tento kód není správný. Zkuste to znovu.
page-2fa-setup-success = Bylo povoleno dvoufázové ověřování
page-2fa-setup-success-additional-message = Pro ochranu všech vašich připojených zařízení byste se měli odhlásit všude, kde používáte tento účet, a poté se znovu přihlaste pomocí dvoufázového ověření.


avatar-page-title =
    .title = Profilový obrázek
avatar-page-add-photo = Přidat fotografii
avatar-page-add-photo-button =
    .title = { avatar-page-add-photo }
avatar-page-take-photo = Pořídit fotografii
avatar-page-take-photo-button =
    .title = { avatar-page-take-photo }
avatar-page-remove-photo = Odstranit fotografii
avatar-page-remove-photo-button =
    .title = { avatar-page-remove-photo }
avatar-page-retake-photo = Znovu pořídit fotografii
avatar-page-cancel-button = Zrušit
avatar-page-save-button = Uložit
avatar-page-saving-button = Ukládání…
avatar-page-zoom-out-button =
    .title = Zmenšit
avatar-page-zoom-in-button =
    .title = Zvětšit
avatar-page-rotate-button =
    .title = Otočit
avatar-page-camera-error = Nepodařilo se inicializovat fotoaparát
avatar-page-new-avatar =
    .alt = nový profilový obrázek
avatar-page-file-upload-error-3 = Váš profilový obrázek se nepodařilo nahrát
avatar-page-delete-error-3 = Váš profilový obrázek se nepodařilo smazat
avatar-page-image-too-large-error-2 = Obrázek je pro nahrání příliš velký


pw-change-header =
    .title = Změna hesla
pw-8-chars = Alespoň 8 znaků
pw-not-email = Není vaše e-mailová adresa
pw-change-must-match = odpovídá potvrzení
pw-commonly-used = Není běžně používané heslo
pw-tips = Nepřepoužívejte stejné heslo a přečtěte si další tipy pro <linkExternal>vytváření silných hesel</linkExternal>.
pw-change-cancel-button = Zrušit
pw-change-save-button = Uložit
pw-change-forgot-password-link = Zapomněli jste heslo?
pw-change-current-password =
    .label = Zadejte stávající heslo
pw-change-new-password =
    .label = Zadejte nové heslo
pw-change-confirm-password =
    .label = Potvrďte nové heslo
pw-change-success-alert-2 = Heslo změněno


pw-create-header =
    .title = Vytvoření hesla
pw-create-success-alert-2 = Heslo nastaveno
pw-create-error-2 = Vaše heslo se nepodařilo nastavit


delete-account-header =
    .title = Smazat účet
delete-account-step-1-2 = Krok 1 ze 2
delete-account-step-2-2 = Krok 2 ze 2
delete-account-confirm-title-4 = Možná jste svůj { -product-mozilla-account(case: "acc", capitalization: "lower") }  připojili k jednomu nebo více z následujících produktů nebo služeb od { -brand-mozilla(case: "gen") }, které vám zajišťují bezpečnost a produktivitu na webu:
delete-account-product-mozilla-account = { -product-mozilla-account }
delete-account-product-mozilla-vpn = { -product-mozilla-vpn }
delete-account-product-mdn-plus = { -product-mdn-plus }
delete-account-product-mozilla-hubs = { -product-mozilla-hubs }
delete-account-product-mozilla-monitor = { -product-mozilla-monitor }
delete-account-product-firefox-relay = { -product-firefox-relay }
delete-account-product-firefox-sync = Synchronizují se údaje { -brand-firefox(case: "gen") }
delete-account-product-firefox-addons = Doplňky { -brand-firefox(case: "gen") }
delete-account-acknowledge = Potvrďte prosím, že berete na vědomí, že smazáním svého účtu:
delete-account-chk-box-1-v4 =
    .label = Veškeré placené předplatné, které máte, bude zrušeno.
delete-account-chk-box-2 =
    .label = V produktech { -brand-mozilla(case: "gen") } můžete přijít o uložené informace a funkce
delete-account-chk-box-3 =
    .label = Opětovná aktivace pomocí tohoto e-mailu nemusí obnovit vaše uložené informace
delete-account-chk-box-4 =
    .label = Všechna rozšíření a vzhledy vámi zveřejněná na serveru addons.mozilla.org budou smazána
delete-account-continue-button = Pokračovat
delete-account-password-input =
    .label = Zadejte heslo
delete-account-cancel-button = Zrušit
delete-account-delete-button-2 = Smazat


display-name-page-title =
    .title = Zobrazované jméno
display-name-input =
    .label = Zadejte zobrazované jméno
submit-display-name = Uložit
cancel-display-name = Zrušit
display-name-update-error-2 = Vaši zobrazované jméno se nepodařilo změnit
display-name-success-alert-2 = Zobrazované jméno aktualizováno


recent-activity-title = Nedávná aktivita účtu
recent-activity-account-create-v2 = Účet vytvořen
recent-activity-account-disable-v2 = Účet deaktivován
recent-activity-account-enable-v2 = Účet povolen
recent-activity-account-login-v2 = Přihlašování pomocí účtu
recent-activity-account-reset-v2 = Spuštěno obnovení hesla
recent-activity-emails-clearBounces-v2 = E-maily o nedoručení vymazány
recent-activity-account-login-failure = Pokus o přihlášení selhal
recent-activity-account-two-factor-added = Povoleno dvoufázové ověřování.
recent-activity-account-two-factor-requested = Vyžaduje se dvoufázové ověření
recent-activity-account-two-factor-failure = Dvoufázové ověření selhalo
recent-activity-account-two-factor-success = Dvoufázové ověření bylo úspěšné
recent-activity-account-two-factor-removed = Dvoufázové ověřování zrušeno
recent-activity-account-password-reset-requested = Vyžádáno obnovení hesla u účtu
recent-activity-account-password-reset-success = Obnovení hesla u účtu bylo úspěšné
recent-activity-account-recovery-key-added = Povolen obnovovací klíč k účtu
recent-activity-account-recovery-key-verification-failure = Ověření pomocí obnovovacího klíče selhalo
recent-activity-account-recovery-key-verification-success = Ověření obnovovacího klíče k účtu bylo úspěšné
recent-activity-account-recovery-key-removed = Odstraněn obnovovací klíč k účtu
recent-activity-account-password-added = Nastaveno nové heslo
recent-activity-account-password-changed = Heslo změněno
recent-activity-account-secondary-email-added = Přidán záložní e-mail
recent-activity-account-secondary-email-removed = Odebrán záložní e-mail
recent-activity-account-emails-swapped = Prohozen hlavní a záložní e-mail
recent-activity-session-destroy = Odhlášení z relace
recent-activity-account-recovery-phone-send-code = Obnovovací kód na telefonu byl odeslán
recent-activity-account-recovery-phone-setup-complete = Nastavení telefonu pro obnovení bylo dokončeno
recent-activity-account-recovery-phone-signin-complete = Přihlášení pomocí telefonního čísla pro obnovení bylo dokončeno
recent-activity-account-recovery-phone-signin-failed = Přihlášení pomocí telefonního čísla pro obnovení selhalo
recent-activity-account-recovery-phone-removed = Telefon pro obnovení byl odebrán
recent-activity-account-recovery-codes-replaced = Obnovovací kódy byly nahrazeny
recent-activity-account-recovery-codes-created = Obnovovací kódy byly vytvořeny
recent-activity-account-recovery-codes-signin-complete = Přihlášení pomocí obnovovacích kódů bylo dokončeno
recent-activity-password-reset-otp-sent = Potvrzovací kód pro obnovu hesla byl odeslán
recent-activity-password-reset-otp-verified = Potvrzovací kód pro obnovení hesla byl ověřen
recent-activity-must-reset-password = Je vyžadována obnova hesla
recent-activity-unknown = Jiná aktivita u účtu


recovery-key-create-page-title = Obnovovací klíč k účtu
recovery-key-create-back-button-title = Zpět do nastavení


recovery-phone-remove-header = Odebrat telefonní číslo pro obnovení
settings-recovery-phone-remove-info = Tímto odstraníte <strong>{ $formattedFullPhoneNumber }</strong> jako své telefonní číslo pro obnovení.
settings-recovery-phone-remove-recommend = Tuto metodu doporučujeme ponechat, protože je jednodušší než ukládání záložních ověřovacích kódů.
settings-recovery-phone-remove-recovery-methods = Pokud ji smažete, ujistěte se, že máte uložené záložní ověřovací kódy. <linkExternal>Porovnání metod obnovení</linkExternal>
settings-recovery-phone-remove-button = Odebrat telefonní číslo
settings-recovery-phone-remove-cancel = Zrušit
settings-recovery-phone-remove-success = Telefon pro obnovení byl odebrán


page-setup-recovery-phone-heading = Přidat telefon pro obnovení
page-change-recovery-phone = Změna telefonu pro obnovení
page-setup-recovery-phone-back-button-title = Zpět na nastavení
page-setup-recovery-phone-step2-back-button-title = Změna telefonního čísla


add-secondary-email-step-1 = Krok 1 ze 2
add-secondary-email-error-2 = Při vytvoření tohoto e-mailu došlo k chybě
add-secondary-email-page-title =
    .title = Záložní e-mailová adresa
add-secondary-email-enter-address =
    .label = Zadejte e-mailovou adresu
add-secondary-email-cancel-button = Zrušit
add-secondary-email-save-button = Uložit
add-secondary-email-mask = E-mailové masky nelze použít jako záložní e-mailovou adresu


add-secondary-email-step-2 = Krok 2 ze 2
verify-secondary-email-page-title =
    .title = Záložní e-mailová adresa
verify-secondary-email-verification-code-2 =
    .label = Zadejte potvrzovací kód
verify-secondary-email-cancel-button = Zrušit
verify-secondary-email-verify-button-2 = Potvrdit
verify-secondary-email-please-enter-code-2 = Zadejte prosím potvrzovací kód, který bude během 5 minut doručen na adresu <strong>{ $email }</strong>.
verify-secondary-email-success-alert-2 = Adresa { $email } úspěšně přidána
verify-secondary-email-resend-code-button = Znovu odeslat potvrzovací kód


delete-account-link = Smazat účet
inactive-update-status-success-alert = Přihlášení bylo úspěšné. Váš { -product-mozilla-account(capitalization: "lower") } a jeho údaje zůstanou aktivní.


product-promo-monitor =
    .alt = { -product-mozilla-monitor }
product-promo-monitor-description-v2 = Zjistěte, kde jsou vaše soukromé informace vystaveny, a převezměte kontrolu
product-promo-monitor-cta = Zkontrolovat


profile-heading = Profil
profile-picture =
    .header = Obrázek
profile-display-name =
    .header = Zobrazované jméno
profile-primary-email =
    .header = Hlavní e-mailová adresa


progress-bar-aria-label-v2 = Krok { $currentStep } z { $numberOfSteps }.


security-heading = Zabezpečení
security-password =
    .header = Heslo
security-password-created-date = Vytvořeno { $date }
security-not-set = Nenastaveno
security-action-create = Vytvořit
security-set-password = Pro synchronizaci a některé bezpečnostní funkce vašeho účtu si nastavte heslo.
security-recent-activity-link = Zobrazit nedávnou aktivitu u účtu
signout-sync-header = Relace vypršela
signout-sync-session-expired = Omlouváme se, něco se pokazilo. Odhlaste se prosím z nabídky prohlížeče a zkuste to znovu.


tfa-row-backup-codes-title = Záložní ověřovací kódy
tfa-row-backup-codes-not-available = Žádné kódy nejsou k dispozici
tfa-row-backup-codes-available-v2 =
    { $numCodesAvailable ->
        [one] Zbývá { $numCodesAvailable } kód
        [few] Zbývající kódy: { $numCodesAvailable }
       *[other] Zbývající kódy: { $numCodesAvailable }
    }
tfa-row-backup-codes-get-new-cta-v2 = Vytvořit nové kódy
tfa-row-backup-codes-add-cta = Přidat
tfa-row-backup-codes-description-2 = Pokud nemůžete použít mobilní zařízení nebo ověřovací aplikaci, je to nejbezpečnější způsob obnovy.
tfa-row-backup-phone-title-v2 = Telefon pro obnovení
tfa-row-backup-phone-not-available-v2 = Nebylo přidáno žádné telefonní číslo
tfa-row-backup-phone-change-cta = Změnit
tfa-row-backup-phone-add-cta = Přidat
tfa-row-backup-phone-delete-button = Odebrat
tfa-row-backup-phone-delete-title-v2 = Odebrat telefon pro obnovení
tfa-row-backup-phone-delete-restriction-v2 = Pokud chcete odebrat telefon pro obnovení, přidejte nejprve záložní ověřovací kódy nebo vypněte dvoufázové ověřování, abyste se vyhnuli zablokování účtu.
tfa-row-backup-phone-description-v2 = Jedná se o nejjednodušší způsob obnovení, pokud nemůžete použít ověřovací aplikaci.
tfa-row-backup-phone-sim-swap-risk-link = Další informace o riziku při výměně karty SIM


switch-turn-off = Vypnout
switch-turn-on = Zapnout
switch-submitting = Odesílá se…
switch-is-on = zapnuto
switch-is-off = vypnuto


row-defaults-action-add = Přidat
row-defaults-action-change = Změnit
row-defaults-action-disable = Zakázat
row-defaults-status = Žádné


rk-header-1 = Obnovovací klíč k účtu
rk-enabled = Povoleno
rk-not-set = Není nastaven
rk-action-create = Vytvořit
rk-action-change-button = Změnit
rk-action-remove = Odebrat
rk-key-removed-2 = Obnovovací klíč k účtu byl odstraněn
rk-cannot-remove-key = Obnovovací klíč k vašemu účtu se nepodařilo odebrat.
rk-refresh-key-1 = Aktualizovat obnovovací klíč k účtu
rk-content-explain = Získejte přístup ke svým datům, pokud zapomenete své heslo.
rk-cannot-verify-session-4 = Omlouváme se, nastal problém s potvrzením vaší relace
rk-remove-modal-heading-1 = Odebrat obnovovací klíč k účtu?
rk-remove-modal-content-1 = Pokud obnovíte své heslo, nebudete už moci pro přístup ke svým datům použít svůj obnovovací klíč k účtu. Tuto akci nelze vzít zpět.
rk-remove-error-2 = Obnovovací klíč k vašemu účtu se nepodařilo odebrat
unit-row-recovery-key-delete-icon-button-title = Smazat obnovovací klíč k účtu


se-heading = Záložní e-mailová adresa
    .header = Záložní e-mailová adresa
se-cannot-refresh-email = Obnovení tohoto e-mailu se nezdařilo.
se-cannot-resend-code-3 = Potvrzovací kód se nepodařilo znovu odeslat
se-set-primary-successful-2 = Adresa je { $email } nyní nastavena jako vaše hlavní
se-set-primary-error-2 = Nepodařilo se změnit vaši hlavní e-mailovou adresu
se-delete-email-successful-2 = Adresa { $email } byla odebrána
se-delete-email-error-2 = Tuto e-mailovou adresu se nepodařilo odebrat
se-verify-session-3 = Pro provedení této akce je potřeba potvrdit vaši stávající relaci
se-verify-session-error-3 = Omlouváme se, nastal problém s potvrzením vaší relace
se-remove-email =
    .title = Odebrat e-mail
se-refresh-email =
    .title = Obnovit e-mail
se-unverified-2 = nepotvrzeno
se-resend-code-2 =
    Je nutné potvrzení. Pokud jste potvrzovací kód nenašli v doručené ani nevyžádané
    poště, můžete ho nechat <button>znovu odeslat</button>.
se-make-primary = Nastavit jako hlavní
se-default-content = Získejte přístup ke svému účtu, pokud se vám nepodaří přihlásit svým hlavním e-mailem.
se-content-note-1 = Poznámka: záložní e-mailová adresa neumožní obnovit vaše informace — na to budete potřebovat <a>obnovovací klíč k účtu</a>.
se-secondary-email-none = Žádná


tfa-row-header = Dvoufázové ověřování
tfa-row-enabled = Povoleno
tfa-row-disabled-status = Zakázáno
tfa-row-action-add = Přidat
tfa-row-action-disable = Vypnout
tfa-row-action-change = Změnit
tfa-row-button-refresh =
    .title = Obnovit nastavení dvoufázového ověřování
tfa-row-cannot-refresh = Nepodařilo se obnovit nastavení dvoufázového ověřování.
tfa-row-enabled-description = Váš účet je chráněn dvoufázovým ověřováním. Při přihlašování k účtu { -product-mozilla-account } musíte zadat jednorázový přístupový kód z ověřovací aplikace.
tfa-row-enabled-info-link = Jak to chrání váš účet
tfa-row-disabled-description-v2 = Pomozte zabezpečit svůj účet pomocí ověřovací aplikace třetí strany jakožto druhého kroku přihlášení.
tfa-row-cannot-verify-session-4 = Omlouváme se, nastal problém s potvrzením vaší relace
tfa-row-disable-modal-heading = Vypnout dvoufázové ověřování?
tfa-row-disable-modal-confirm = Vypnout
tfa-row-disable-modal-explain-1 =
    Tuto akci nelze vzít zpět. Máte také možnost
    <linkExternal>své záložní ověřovací kódy vyměnit</linkExternal>.
tfa-row-disabled-2 = Dvoufázové ověřování je vypnuto
tfa-row-cannot-disable-2 = Dvoufázové ověřování se nepodařilo vypnout
tfa-row-verify-session-info = Pro nastavení dvoufázového ověřování je potřeba potvrdit svou aktuální relaci


terms-privacy-agreement-intro-3 = Pokračováním souhlasíte s následujícím:
terms-privacy-agreement-customized-terms = { $serviceName }: <termsLink>Podmínky poskytování služby</termsLink> a <privacyLink>Oznámení o ochraně osobních údajů</privacyLink>
terms-privacy-agreement-mozilla-2 = { -product-mozilla-accounts(capitalization: "uppercase") }: <mozillaAccountsTos>Podmínky poskytování služby</mozillaAccountsTos> a <mozillaAccountsPrivacy>Oznámení o ochraně osobních údajů</mozillaAccountsPrivacy>
terms-privacy-agreement-default-2 = Pokračováním vyjadřujete souhlas s <mozillaAccountsTos>Podmínkami poskytování služby</mozillaAccountsTos> a <mozillaAccountsPrivacy>Oznámením o ochraně osobních údajů</mozillaAccountsPrivacy>.


third-party-auth-options-or = Nebo
third-party-auth-options-sign-in-with = Přihlásit pomocí
continue-with-google-button = Pokračovat pomocí { -brand-google }
continue-with-apple-button = Pokračovat pomocí { -brand-apple }


auth-error-102 = Neznámý účet
auth-error-103 = Nesprávné heslo
auth-error-105-2 = Špatný potvrzovací kód
auth-error-110 = Neplatný token
auth-error-114-generic = Vyčerpali jste příliš mnoho pokusů. Prosím zkuste to znovu později.
auth-error-114 = Vyčerpali jste příliš mnoho pokusů. Zkuste to znovu { $retryAfter }.
auth-error-125 = Z bezpečnostních důvodů byl požadavek zablokován
auth-error-129-2 = Vložili jste neplatné telefonní číslo. Zkontrolujte ho a zkuste to znovu.
auth-error-138-2 = Nepotvrzená relace
auth-error-139 = Záložní e-mailová adresa musí být jiná než adresa účtu
auth-error-144 = Tento e-mail je rezervován jiným účtem. Zkuste to znovu později nebo použijte jinou e-mailovou adresu.
auth-error-155 = TOTP token nenalezen
auth-error-156 = Záložní ověřovací kód nebyl nalezen
auth-error-159 = Neplatný obnovovací klíč k účtu
auth-error-183-2 = Neplatný nebo starý potvrzovací kód
auth-error-202 = Funkce není povolena
auth-error-203 = Systém je nedostupný, zkuste to znovu později
auth-error-206 = Nepodařilo se vytvořit heslo, heslo je již nastaveno
auth-error-214 = Telefonní číslo pro obnovení už existuje
auth-error-215 = Telefonní číslo pro obnovení neexistuje
auth-error-216 = Dosažen limit textových zpráv
auth-error-218 = Telefon pro obnovení nelze odebrat. Chybí záložní ověřovací kódy.
auth-error-219 = K tomuto telefonnímu číslu je již zaregistrováno příliš mnoho účtů. Zkuste prosím jiné číslo.
auth-error-999 = Neočekávaná chyba
auth-error-1001 = Pokus o přihlášení zrušen
auth-error-1002 = Relace vypršela. Pro pokračování se přihlaste.
auth-error-1003 = Místní úložiště nebo cookies jsou stále zakázány
auth-error-1008 = Vaše staré a nové heslo nesmí být stejné
auth-error-1010 = Je požadováno platné heslo
auth-error-1011 = Je požadován platný e-mail
auth-error-1018 = Váš potvrzovací e-mail byl právě vrácen. Nesprávně zadaný e-mail?
auth-error-1020 = Chybně zadaný e-mail? firefox.com není platná e-mailová služba
auth-error-1031 = Pro registraci musíte zadat svůj věk
auth-error-1032 = Pro registraci musíte zadat platný věk
auth-error-1054 = Neplatný kód pro dvoufázové ověření
auth-error-1056 = Neplatný záložní ověřovací kód
auth-error-1062 = Neplatné přesměrování
auth-error-1064 = Chybně zadaný e-mail? { $domain } není platná e-mailová služba
auth-error-1066 = E-mailové masky nelze použít k vytvoření účtu.
auth-error-1067 = Chybně zadaný e-mail?
recovery-phone-number-ending-digits = Číslo končící na { $lastFourPhoneNumber }
oauth-error-1000 = Nastala nespecifikovaná chyba. Zavřete prosím tento panel a zkuste to znovu.


connect-another-device-signed-in-header = Jste přihlášen(a) do { -brand-firefox(case: "gen") }
connect-another-device-email-confirmed-banner = E-mail potvrzen
connect-another-device-signin-confirmed-banner = Přihlášení potvrzeno
connect-another-device-signin-to-complete-message = Pro dokončení nastavení se přihlaste do { -brand-firefox(case: "gen") }
connect-another-device-signin-link = Přihlásit se
connect-another-device-still-adding-devices-message = Potřebujete přidat zařízení? Pro dokončení nastavení se přihlaste k { -brand-firefox(case: "dat") } na jiném zařízení
connect-another-device-signin-another-device-to-complete-message = Pro dokončení nastavení se přihlaste k { -brand-firefox(case: "dat") } na jiném zařízení
connect-another-device-get-data-on-another-device-message = Chcete mít své panely, záložky a hesla na dalším zařízení?
connect-another-device-cad-link = Připojte další zařízení
connect-another-device-not-now-link = Teď ne
connect-another-device-android-complete-setup-message = Pro dokončení nastavení se přihlaste k { -brand-firefox(case: "dat") } pro Android
connect-another-device-ios-complete-setup-message = Pro dokončení nastavení se přihlaste k { -brand-firefox(case: "dat") } pro iOS


cookies-disabled-header = Je vyžadováno místní úložiště a cookies
cookies-disabled-enable-prompt-2 = Abyste mohli používat { -product-mozilla-account(case: "acc", capitalization: "lower") }, povolte prosím cookies a local storage. Díky tomu si vás budeme moci zapamatovat mezi jednotlivými relacemi.
cookies-disabled-button-try-again = Zkusit znovu
cookies-disabled-learn-more = Zjistit více


index-header = Zadejte svoji e-mailovou adresu
index-sync-header = Pokračovat do svého { -product-mozilla-account(case: "gen", capitalization: "lower") }
index-sync-subheader = Synchronizujte svá hesla, panely a záložky všude, kde používáte { -brand-firefox }.
index-relay-header = Vytvoření e-mailové masky
index-relay-subheader = Uveďte e-mailovou adresu, na kterou chcete přeposílat e-maily z maskovaného e-mailu.
index-subheader-with-servicename = Pokračovat do služby { $serviceName }
index-subheader-default = Pokračujte do nastavení účtu
index-cta = Přihlásit nebo registrovat
index-account-info = { -product-mozilla-account } odemyká přístup k dalším produktům { -brand-mozilla(case: "gen") }, které chrání soukromí.
index-email-input =
    .label = Zadejte svoji e-mailovou adresu
index-account-delete-success = Účet byl úspěšně smazán
index-email-bounced = Odeslaná potvrzující e-mailová zpráva se právě vrátila zpět. Nemáte překlep v e-mailové adrese?


inline-recovery-key-setup-create-error = Jejda! Obnovovací klíč se pro váš účet nepodařilo vytvořit. Zkuste to prosím znovu později.
inline-recovery-key-setup-recovery-created = Obnovovací klíč k účtu byl vytvořen
inline-recovery-key-setup-download-header = Zabezpečte svůj účet
inline-recovery-key-setup-download-subheader = Stáhněte a uložte jej
inline-recovery-key-setup-download-info = Uložte si tento klíč na místo, které si budete pamatovat — později se na tuto stránku nebudete moci vrátit.
inline-recovery-key-setup-hint-header = Bezpečnostní doporučení


inline-totp-setup-cancel-setup-button = Zrušit nastavení
inline-totp-setup-continue-button = Pokračovat
inline-totp-setup-add-security-link = Přidejte do svého účtu další úroveň zabezpečení tím, že budete vyžadovat ověřovací kódy z jedné z <authenticationAppsLink>těchto ověřovacích aplikací</authenticationAppsLink>.
inline-totp-setup-enable-two-step-authentication-default-header-2 = Povolte dvoufázové ověření <span>a pokračujte do nastavení účtu</span>
inline-totp-setup-enable-two-step-authentication-custom-header-2 = Povolte dvoufázové ověření <span>a pokračujte do služby { $serviceName }</span>
inline-totp-setup-ready-button = Připraveno
inline-totp-setup-show-qr-custom-service-header-2 = Naskenujte ověřovací kód <span>a pokračujte do služby { $serviceName }</span>
inline-totp-setup-no-qr-custom-service-header-2 = Ručně zadejte kód <span>a pokračujte do služby { $serviceName }</span>
inline-totp-setup-show-qr-default-service-header-2 = Naskenujte ověřovací kód a <span>pokračujte do nastavení účtu</span>
inline-totp-setup-no-qr-default-service-header-2 = Ručně zadejte kód a <span>pokračujte do nastavení účtu</span>
inline-totp-setup-enter-key-or-use-qr-instructions = Zadejte tento tajný klíč do aplikace pro ověřování. <toggleToQRButton>Naskenovat místo toho QR kód?</toggleToQRButton>
inline-totp-setup-use-qr-or-enter-key-instructions = Naskenujte QR kód ve své ověřovací aplikaci, a poté zadejte ověřovací kód, který poskytuje. <toggleToManualModeButton>Nemůžete naskenovat kód?</toggleToManualModeButton>
inline-totp-setup-on-completion-description = Po dokončení začne generovat ověřovací kódy, které můžete zadat.
inline-totp-setup-security-code-placeholder = Ověřovací kód
inline-totp-setup-code-required-error = Je vyžadován ověřovací kód
tfa-qr-code-alt = Pro nastavení dvoufázového ověřování v podporovaných aplikacích použijte kód { $code }.
inline-totp-setup-page-title = Dvoufázové ověřování


legal-header = Právní informace
legal-terms-of-service-link = Podmínky služby
legal-privacy-link = Zásady ochrany osobních údajů


legal-privacy-heading = Zásady ochrany osobních údajů


legal-terms-heading = Podmínky služby


pair-auth-allow-heading-text = Přihlásili jste se právě do { -product-firefox(case: "gen") }?
pair-auth-allow-confirm-button = Ano, schválit zařízení
pair-auth-allow-refuse-device-link = Pokud jste to nebyli vy, <link>změňte si heslo</link>


pair-auth-complete-heading = Zařízení připojeno
pair-auth-complete-now-syncing-device-text = Nyní synchronizujete: { $deviceFamily } ({ $deviceOS })
pair-auth-complete-sync-benefits-text = Nyní máte přístup k otevřeným panelům, heslům a záložkám na všech svých zařízeních.
pair-auth-complete-see-tabs-button = Zobrazit panely ze synchronizovaných zařízení
pair-auth-complete-manage-devices-link = Správa zařízení


auth-totp-heading-w-default-service = Zadejte ověřovací kód <span>pro pokračování do nastavení účtu</span>
auth-totp-heading-w-custom-service = Zadejte ověřovací kód <span>a pokračujte do služby { $serviceName }</span>
auth-totp-instruction = Otevřete svoji ověřovací aplikaci a zadejte ověřovací kód, který vám poskytne.
auth-totp-input-label = Zadejte šestimístný kód
auth-totp-confirm-button = Potvrdit
auth-totp-code-required-error = Je vyžadován ověřovací kód


pair-wait-for-supp-heading-text = Je požadováno schválení <span>z vašeho dalšího zařízení</span>


pair-failure-header = Párování se nezdařilo
pair-failure-message = Nastavování bylo ukončeno.


pair-sync-header = Synchronizujte { -brand-firefox(case: "acc") }  se svým telefonem či tabletem
pair-cad-header = Připojit { -brand-firefox } na jiném zařízení
pair-already-have-firefox-paragraph = Už máte { -brand-firefox } na telefonu nebo tabletu?
pair-sync-your-device-button = Synchronizovat zařízení
pair-or-download-subheader = Nebo stáhnout
pair-scan-to-download-message = Naskenujte a stáhněte si { -brand-firefox } pro mobil, nebo si pošlete <linkExternal>odkaz ke stažení</linkExternal>.
pair-not-now-button = Teď ne
pair-take-your-data-message = Vezměte si své panely, záložky a hesla všude tam, kde používáte { -brand-firefox }.
pair-get-started-button = Začít
pair-qr-code-aria-label = QR kód


pair-success-header-2 = Zařízení připojeno
pair-success-message-2 = Párování dokončeno.


pair-supp-allow-heading-text = Potvrdit párování <span>pro { $email }</span>
pair-supp-allow-confirm-button = Potvrdit párování
pair-supp-allow-cancel-link = Zrušit


pair-wait-for-auth-heading-text = Je požadováno schválení <span>z vašeho dalšího zařízení</span>


pair-unsupported-header = Spárovat pomocí aplikace
pair-unsupported-message = Použili jste systémový fotoaparát? Párování je potřeba zahájit z { -brand-firefox(case: "gen") }.




set-password-heading-v2 = Pro potřeby synchronizace si vytvořte heslo
set-password-info-v2 = Tím se vaše data zašifrují. Musí se lišit od hesla k účtu { -brand-google } nebo { -brand-apple }.


third-party-auth-callback-message = Čekejte prosím, budete přesměrováni na autorizovanou aplikaci.


account-recovery-confirm-key-heading = Zadejte váš obnovovací klíč k účtu
account-recovery-confirm-key-instruction = Tento klíč obnovuje vaše zašifrovaná data o prohlížení, jako jsou hesla a záložky, ze serverů { -brand-firefox(case: "gen") }.
account-recovery-confirm-key-input-label =
    .label = Zadejte 32místný obnovovací klíč
account-recovery-confirm-key-hint = Vaše nápověda k uložení je:
account-recovery-confirm-key-button-2 = Pokračovat
account-recovery-lost-recovery-key-link-2 = Nemůžete najít svůj obnovovací klíč k účtu?


complete-reset-pw-header-v2 = Vytvořte si nové heslo
complete-reset-password-success-alert = Heslo nastaveno
complete-reset-password-error-alert = Vaše heslo se nepodařilo nastavit
complete-reset-pw-recovery-key-link = Použít obnovovací klíč
reset-password-complete-banner-heading = Vaše heslo bylo obnoveno.
reset-password-complete-banner-message = Abyste předešli budoucím problémům s přihlášením, nezapomeňte si v nastavení { -product-mozilla-account(case: "gen", capitalization: "lower") } vygenerovat nový obnovovací klíč k účtu.
complete-reset-password-desktop-relay = { -brand-firefox } se vás pokusí po přihlášení přesměrovat na e-mailovou masku.


confirm-backup-code-reset-password-input-label = Zadejte 10místný kód
confirm-backup-code-reset-password-confirm-button = Potvrdit
confirm-backup-code-reset-password-subheader = Zadejte záložní ověřovací kód
confirm-backup-code-reset-password-instruction = Zadejte jeden z jednorázových kódů, které jste uložili při nastavení dvoufázového ověřování.
confirm-backup-code-reset-password-locked-out-link = Ztratili jste přístup?


confirm-reset-password-with-code-heading = Zkontrolujte svou e-mailovou schránku
confirm-reset-password-with-code-instruction = Potvrzovací kód jsme odeslali na adresu <span>{ $email }</span>.
confirm-reset-password-code-input-group-label = Zadejte 8místný kód do 10 minut
confirm-reset-password-otp-submit-button = Pokračovat
confirm-reset-password-otp-resend-code-button = Znovu odeslat kód
confirm-reset-password-otp-different-account-link = Použít jiný účet


confirm-totp-reset-password-header = Obnovit heslo
confirm-totp-reset-password-subheader-v2 = Zadejte kód pro dvoufázové ověření
confirm-totp-reset-password-instruction-v2 = Pro obnovení hesla se podívejte do své <strong>ověřovací aplikace</strong>.
confirm-totp-reset-password-trouble-code = Problém se zadáváním kódu?
confirm-totp-reset-password-confirm-button = Potvrdit
confirm-totp-reset-password-input-label-v2 = Zadejte šestimístný kód
confirm-totp-reset-password-use-different-account = Použít jiný účet


password-reset-flow-heading = Obnovení hesla
password-reset-body-2 = Abychom mohli vést váš účet v bezpečí, požádáme vás o několik věcí, které znáte jen vy.
password-reset-email-input =
    .label = Zadejte svoji e-mailovou adresu
password-reset-submit-button-2 = Pokračovat


reset-password-complete-header = Vaše heslo bylo obnoveno
reset-password-confirmed-cta = Pokračovat do služby { $serviceName }




password-reset-recovery-method-header = Obnovit heslo
password-reset-recovery-method-subheader = Vyberte způsob obnovení
password-reset-recovery-method-details = Ujistěte se, že jste to vy, kdo používá vaše metody obnovy.
password-reset-recovery-method-phone = Telefon pro obnovení
password-reset-recovery-method-code = Záložní ověřovací kódy
password-reset-recovery-method-code-info =
    { $numBackupCodes ->
        [one] Zbývá { $numBackupCodes } kód
        [few] Zbývají { $numBackupCodes } kódy
       *[other] Zbývá { $numBackupCodes } kódů
    }
password-reset-recovery-method-send-code-error-heading = Došlo k problému s odesláním kódu do telefonu pro obnovení
password-reset-recovery-method-send-code-error-description = Zkuste to prosím později nebo použijte záložní ověřovací kódy.


reset-password-recovery-phone-flow-heading = Obnovit heslo
reset-password-recovery-phone-heading = Zadejte obnovovací kód
reset-password-recovery-phone-instruction-v3 = Na telefonní číslo končící číslicemi <span>{ $lastFourPhoneDigits }</span> byl odeslán šestimístný kód formou textové zprávy. Tento kód vyprší po 5 minutách. Tento kód s nikým nesdílejte.
reset-password-recovery-phone-input-label = Zadejte šestimístný kód
reset-password-recovery-phone-code-submit-button = Potvrdit
reset-password-recovery-phone-resend-code-button = Znovu odeslat kód
reset-password-recovery-phone-resend-success = Kód byl odeslán
reset-password-recovery-phone-locked-out-link = Ztratili jste přístup?
reset-password-recovery-phone-send-code-error-heading = Při odesílání kódu se vyskytl problém
reset-password-recovery-phone-code-verification-error-heading = Váš kód se nepodařilo ověřit
reset-password-recovery-phone-general-error-description = Prosím zopakujte pokus později
reset-password-recovery-phone-invalid-code-error-description = Kód je neplatný nebo jeho platnost vypršela.
reset-password-recovery-phone-invalid-code-error-link = Chcete místo toho použít záložní ověřovací kódy?
reset-password-with-recovery-key-verified-page-title = Heslo bylo úspěšně obnoveno
reset-password-complete-new-password-saved = Nové heslo uloženo!
reset-password-complete-recovery-key-created = Nový obnovovací klíč k účtu byl vytvořen. Stáhněte si ho a uložte.
reset-password-complete-recovery-key-download-info = Tento klíč je nezbytný pro obnovu dat v případě, že zapomenete své heslo. <b>Hned si ho stáhněte a bezpečně uložte, později už k němu nebudete moci přistupovat.</b>


error-label = Chyba:
validating-signin = Ověřuje se přihlášení…
complete-signin-error-header = Chyba při potvrzení
signin-link-expired-header = Platnost odkazu pro potvrzení vypršela
signin-link-expired-message-2 = Odkaz, na který jste klepli, vypršel nebo byl již použit.


signin-password-needed-header-2 = Zadejte své heslo <span>k účtu { -product-mozilla-account }</span>
signin-subheader-without-logo-with-servicename = Pokračovat do služby { $serviceName }
signin-subheader-without-logo-default = Pokračujte do nastavení účtu
signin-button = Přihlásit se
signin-header = Přihlásit se
signin-use-a-different-account-link = Použít jiný účet
signin-forgot-password-link = Zapomněli jste heslo?
signin-password-button-label = Heslo
signin-desktop-relay = { -brand-firefox } se vás pokusí po přihlášení přesměrovat na e-mailovou masku.
signin-code-expired-error = Platnost kódu vypršela. Přihlaste se prosím znovu.
signin-recovery-error = Něco se pokazilo. Přihlaste se prosím znovu.
signin-account-locked-banner-heading = Obnovit heslo
signin-account-locked-banner-description = Váš účet jsme uzamkli, abychom ho ochránili před podezřelou aktivitou.
signin-account-locked-banner-link = Před přihlášením si obnovte heslo


report-signin-link-damaged-body = V odkazu, na který jste klepli, chyběly znaky a váš e-mailový klient jej mohl poškodit. Pečlivě si adresu zkopírujte a zkuste to znovu.
report-signin-header = Nahlásit neoprávněné přihlášení?
report-signin-body = Obdrželi jste e-mail o pokusu o přihlášení k vašemu účtu. Chcete tuto aktivitu nahlásit jako podezřelou?
report-signin-submit-button = Nahlásit aktivitu
report-signin-support-link = Proč se to stalo?
report-signin-error = Omlouváme se, ale při odesílání hlášení nastal problém.
signin-bounced-header = Omlouváme se, váš účet byl uzamčen.
signin-bounced-message = Potvrzovací e-mail, který jsme poslali na adresu { $email }, se vrátil zpět. Uzamkli jsme proto váš účet, abychom ochránili vaše data { -brand-firefox(case: "gen") }.
signin-bounced-help = Pokud se jedná o platnou e-mailovou adresu, <linkExternal>dejte nám vědět</linkExternal> a my vám pomůžeme odemknout váš účet.
signin-bounced-create-new-account = Už tento e-mail nevlastníte? Vytvořte si nový účet
back = Zpět


signin-push-code-heading-w-default-service = <span>Pro pokračování do nastavení účtu</span> ověřte toto přihlášení
signin-push-code-heading-w-custom-service = Ověřit toto přihlášení <span>a pokračovat do služby { $serviceName }</span>
signin-push-code-instruction = Zkontrolujte prosím svá ostatní zařízení a schvalte toto přihlášení z prohlížeče { -brand-firefox }.
signin-push-code-did-not-recieve = Nedostali jste oznámení?
signin-push-code-send-email-link = Odeslat kód na e-mail


signin-push-code-confirm-instruction = Potvrďte své přihlášení
signin-push-code-confirm-description = Zjistili jsme pokus o přihlášení z následujícího zařízení. Pokud jste to byli vy, potvrďte přihlášení
signin-push-code-confirm-verifying = Ověřuje se
signin-push-code-confirm-login = Potvrdit přihlášení
signin-push-code-confirm-wasnt-me = Toto nebylo mé přihlášení, změnit heslo.
signin-push-code-confirm-login-approved = Vaše přihlášení bylo schváleno. Zavřete prosím toto okno.
signin-push-code-confirm-link-error = Odkaz je poškozen. Zkuste to prosím znovu.


signin-recovery-method-header = Přihlásit se
signin-recovery-method-subheader = Vyberte způsob obnovení
signin-recovery-method-details = Ujistěte se, že jste to vy, kdo používá vaše metody obnovy.
signin-recovery-method-phone = Telefon pro obnovení
signin-recovery-method-code-v2 = Záložní ověřovací kódy
signin-recovery-method-code-info-v2 =
    { $numBackupCodes ->
        [one] Zbývá { $numBackupCodes } kód
        [few] Zbývá { $numBackupCodes } kódy
       *[other] Zbývá { $numBackupCodes } kódů
    }
signin-recovery-method-send-code-error-heading = Nepodařilo se odeslat kód na vaše telefonní číslo
signin-recovery-method-send-code-error-description = Zkuste to prosím později nebo použijte záložní ověřovací kódy.


signin-recovery-code-heading = Přihlásit se
signin-recovery-code-sub-heading = Zadejte záložní ověřovací kód
signin-recovery-code-instruction-v3 = Zadejte jeden z jednorázových kódů, které jste uložili při nastavení dvoufázového ověřování.
signin-recovery-code-input-label-v2 = Zadejte 10místný kód
signin-recovery-code-confirm-button = Potvrdit
signin-recovery-code-phone-link = Použít telefon pro obnovení
signin-recovery-code-support-link = Ztratili jste přístup?
signin-recovery-code-required-error = Je vyžadován záložní ověřovací kód
signin-recovery-code-use-phone-failure = Došlo k problému s odesláním kódu do telefonu pro obnovení
signin-recovery-code-use-phone-failure-description = Zkuste to prosím později.


signin-recovery-phone-flow-heading = Přihlásit se
signin-recovery-phone-heading = Zadejte obnovovací kód
signin-recovery-phone-instruction-v3 = Na telefonní číslo končící číslicemi <span>{ $lastFourPhoneDigits }</span> byl odeslán šestimístný kód formou textové zprávy. Tento kód vyprší po 5 minutách. Tento kód s nikým nesdílejte.
signin-recovery-phone-input-label = Zadejte šestimístný kód
signin-recovery-phone-code-submit-button = Potvrdit
signin-recovery-phone-resend-code-button = Znovu odeslat kód
signin-recovery-phone-resend-success = Kód byl odeslán
signin-recovery-phone-locked-out-link = Ztratili jste přístup?
signin-recovery-phone-send-code-error-heading = Při odesílání kódu se vyskytl problém
signin-recovery-phone-code-verification-error-heading = Váš kód se nepodařilo ověřit
signin-recovery-phone-general-error-description = Prosím zopakujte pokus později
signin-recovery-phone-invalid-code-error-description = Kód je neplatný nebo jeho platnost vypršela.
signin-recovery-phone-invalid-code-error-link = Chcete místo toho použít záložní ověřovací kódy?
signin-recovery-phone-success-message = Přihlášení bylo úspěšné. Při opětovném použití svého telefonu pro obnovení mohou platit omezení.


signin-reported-header = Děkujeme za vaši ostražitost
signin-reported-message = Náš tým byl upozorněn. Zprávy jako tato nám pomáhají odrážet útočníky.


signin-token-code-heading-2 = Zadejte potvrzovací kód<span> pro váš { -product-mozilla-account(case: "acc", capitalization: "lower") }</span>
signin-token-code-instruction-v2 = Vložte během 5 minut kód, který vám byl zaslán na <email>{ $email }</email>.
signin-token-code-input-label-v2 = Zadejte šestimístný kód
signin-token-code-confirm-button = Potvrdit
signin-token-code-code-expired = Platnost kódu vypršela?
signin-token-code-resend-code-link = Zaslat e-mailem nový kód.
signin-token-code-resend-code-countdown =
    { $seconds ->
        [one] Odeslat nový kód e-mailem za { $seconds } sekundu
        [few] Odeslat nový kód e-mailem za { $seconds } sekundy
        [many] Odeslat nový kód e-mailem za { $seconds } sekund
       *[other] Odeslat nový kód e-mailem za { $seconds } sekund
    }
signin-token-code-required-error = Je vyžadován potvrzovací kód
signin-token-code-resend-error = Něco se pokazilo. Nový kód se nepodařilo odeslat.
signin-token-code-instruction-desktop-relay = { -brand-firefox } se vás pokusí po přihlášení přesměrovat na e-mailovou masku.


signin-totp-code-header = Přihlásit se
signin-totp-code-subheader-v2 = Zadejte kód pro dvoufázové ověření
signin-totp-code-instruction-v4 = Podívejte se do své <strong>ověřovací aplikace</strong> a potvrďte přihlášení.
signin-totp-code-input-label-v4 = Zadejte šestimístný kód
signin-totp-code-aal-banner-header = Proč jste požádáni o ověření?
signin-totp-code-aal-banner-content = Pro váš účet jste nastavili dvoufázové ověřování, ale zatím jste se na tomto zařízení nepřihlásili pomocí kódu.
signin-totp-code-aal-sign-out = Odhlásit se na tomto zařízení
signin-totp-code-aal-sign-out-error = Omlouváme se, došlo k problému s odhlášením.
signin-totp-code-confirm-button = Potvrdit
signin-totp-code-other-account-link = Použít jiný účet
signin-totp-code-recovery-code-link = Problém se zadáváním kódu?
signin-totp-code-required-error = Je vyžadován ověřovací kód
signin-totp-code-desktop-relay = { -brand-firefox } se vás pokusí po přihlášení přesměrovat na e-mailovou masku.


signin-unblock-header = Autorizovat toto přihlášení
signin-unblock-body = Zkontrolujte autorizační kód, který jsme poslali na adresu { $email }.
signin-unblock-code-input = Zadejte autorizační kód
signin-unblock-submit-button = Pokračovat
signin-unblock-code-required-error = Je vyžadován autorizační kód
signin-unblock-code-incorrect-length = Autorizační kód musí obsahovat 8 znaků
signin-unblock-code-incorrect-format-2 = Autorizační kód může obsahovat pouze písmena a/nebo čísla
signin-unblock-resend-code-button = Žádný email jste neobdrželi? Znovu odeslat
signin-unblock-support-link = Proč se to stalo?
signin-unblock-desktop-relay = { -brand-firefox } se vás pokusí po přihlášení přesměrovat na e-mailovou masku.




confirm-signup-code-page-title = Zadejte potvrzovací kód
confirm-signup-code-heading-2 = Zadejte potvrzovací kód<span>pro svůj { -product-mozilla-account(case: "acc", capitalization: "lower") }</span>
confirm-signup-code-instruction-v2 = Vložte během 5 minut kód, který vám byl zaslán na <email>{ $email }</email>.
confirm-signup-code-input-label = Zadejte šestimístný kód
confirm-signup-code-confirm-button = Potvrdit
confirm-signup-code-sync-button = Spusťte synchronizaci
confirm-signup-code-code-expired = Platnost kódu vypršela?
confirm-signup-code-resend-code-link = Zaslat e-mailem nový kód.
confirm-signup-code-resend-code-countdown =
    { $seconds ->
        [one] Odeslat nový kód e-mailem za { $seconds } sekund
        [few] Odeslat nový kód e-mailem za { $seconds } sekundy
        [many] Odeslat nový kód e-mailem za { $seconds } sekund
       *[other] Odeslat nový kód e-mailem za { $seconds } sekund
    }
confirm-signup-code-success-alert = Účet byl úspěšně potvrzen
confirm-signup-code-is-required-error = Je vyžadován potvrzovací kód
confirm-signup-code-desktop-relay = { -brand-firefox } se vás pokusí po přihlášení přesměrovat na e-mailovou masku.


signup-heading-v2 = Vytvoření hesla
signup-relay-info = Heslo je potřeba pro bezpečnou správu e-mailových masek a pro přístup k bezpečnostním nástrojům { -brand-mozilla(case: "gen") }.
signup-sync-info = Synchronizujte svá hesla, záložky a další data všude, kde používáte { -brand-firefox }.
signup-sync-info-with-payment = Synchronizujte svá hesla, platební metody, záložky a další svá data všude, kde používáte { -brand-firefox }.
signup-change-email-link = Změna e-mailu


signup-confirmed-sync-header = Synchronizace je zapnuta
signup-confirmed-sync-success-banner = { -product-mozilla-account } potvrzen
signup-confirmed-sync-button = Začít prohlížet
signup-confirmed-sync-description-with-payment-v2 = Vaše hesla, platební metody, adresy, záložky, historie a další data se mohou synchronizovat všude, kde používáte { -brand-firefox }.
signup-confirmed-sync-description-v2 = Vaše hesla, adresy, záložky, historie a další data se mohou synchronizovat všude, kde používáte { -brand-firefox }.
signup-confirmed-sync-add-device-link = Přidat další zařízení
signup-confirmed-sync-manage-sync-button = Správa synchronizace
signup-confirmed-sync-set-password-success-banner = Heslo pro synchronizaci vytvořeno
