## Email content
## Emails do not contain buttons, only links. Emails have a rich HTML version and a plaintext
## version. The strings are usually identical but sometimes they differ slightly.

fxa-header-mozilla-logo = <img data-l10n-name="mozilla-logo" alt="logo { -brand-mozilla(case: "gen") }">
fxa-header-sync-devices-image = <img data-l10n-name="sync-devices-image" alt="Synchronizovat zařízení">
body-devices-image = <img data-l10n-name="devices-image" alt="Zařízení">
fxa-privacy-url = { -brand-mozilla } a soukromí
moz-accounts-privacy-url-2 = Oznámení o ochraně osobních údajů { -product-mozilla-accounts(capitalization: "uppercase", case: "gen") }
moz-accounts-terms-url = Podmínky služby { -product-mozilla-accounts(case: "gen", capitalization: "lowercase") }
account-deletion-info-block-communications = Pokud bude váš účet smazán, budete přesto nadále dostávat e-maily od společností Mozilla Corporation a Mozilla Foundation, pokud <a data-l10n-name="unsubscribeLink">nepožádáte o odhlášení</a>.
account-deletion-info-block-support = Pokud máte jakékoliv otázky nebo potřebujete pomoci, neváhejte kontaktovat <a data-l10n-name="supportLink">náš tým podpory</a>.
account-deletion-info-block-communications-plaintext = Pokud bude váš účet smazán, budete stále dostávat e-maily od Mozilla Corporation a Mozilla Foundation, pokud ovšem nepožádáte o odhlášení:
account-deletion-info-block-support-plaintext = Pokud máte jakékoliv otázky nebo potřebujete pomoci, neváhejte se obrátit na náš tým podpory:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
body-android-badge = <img data-l10n-name="google-play-badge" alt="Stáhnout aplikaci { $productName } z { -google-play(case: "gen") }">
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
body-ios-badge = <img data-l10n-name="apple-app-badge" alt="Stáhnout aplikaci { $productName } z { -app-store(case: "gen") }">
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-desktop-device-2 = Nainstalujte si { $productName } na <a data-l10n-name="anotherDeviceLink">dalším stolním počítači</a>.
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-device-2 = Nainstalujte si { $productName } na <a data-l10n-name="anotherDeviceLink">další zařízení</a>.
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
android-download-plaintext = Získejte { $productName } na Google Play:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
ios-download-plaintext = Stáhnout { $productName } z App Store:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-device-plaintext = Nainstalovat { $productName } na jiné zařízení:
automated-email-change-2 = Pokud jste tuto akci neprovedli, ihned si <a data-l10n-name="passwordChangeLink">změňte heslo</a>.
automated-email-support = Další informace nalezete na stránkách <a data-l10n-name="supportLink">Podpory { -brand-mozilla(case: "gen") }</a>.
# After the colon, there's a link to https://accounts.firefox.com/settings/change_password
automated-email-change-plaintext-2 = Pokud jste tuto akci neprovedli, okamžitě si změňte heslo:
#  After the colon, there's a link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
automated-email-support-plaintext = Pro více informací navštivte podporu { -brand-mozilla(case: "gen") }:
automated-email-inactive-account = Toto je automatický e-mail. Dostali jste ji, protože máte založený { -product-mozilla-account(case: "acc", capitalization: "lower") } a uběhly 2 roky od vašeho posledního přihlášení.
# supportLink - https://support.mozilla.org/kb/im-having-problems-my-firefox-account
automated-email-no-action = { automated-email-no-action-plaintext } Další informace naleznete na stránkách <a data-l10n-name="supportLink">Podpory { -brand-mozilla(case: "gen") }</a>.
automated-email-no-action-plaintext = Tento e-mail byl zaslán automaticky. Pokud jste jej obdrželi omylem, nemusíte nic dělat.
#  After the colon, there's a link to https://accounts.firefox.com/settings/change_password
automated-email-not-authorized-plaintext = Toto je automatický e-mail; pokud jste tuto akci neprovedli, změňte si své heslo:
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
# - $uaOS: the user agent's operating system (e.g, MacOS)
# - $uaOSVersion - the user agent's operating system version
automatedEmailRecoveryKey-origin-device-all = Tento požadavek přišel z prohlížeče { $uaBrowser } v systému { $uaOS } { $uaOSVersion }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
# - $uaOS: the user agent's operating system (e.g, MacOS)
automatedEmailRecoveryKey-origin-device-browser-os = Tento požadavek přišel z prohlížeče { $uaBrowser } v systému { $uaOS }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
automatedEmailRecoveryKey-origin-device-browser-only = Tento požadavek přišel z prohlížeče { $uaBrowser }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaOS: the user agent's operating system (e.g, MacOS)
# - $uaOSVersion - the user agent's operating system version
automatedEmailRecoveryKey-origin-device-OS-version-only = Tento požadavek přišel ze systému { $uaOS } { $uaOSVersion }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaOS: the user agent's operating system (e.g, MacOS)
automatedEmailRecoveryKey-origin-device-OS-only = Tento požadavek přišel ze systému { $uaOS }.
automatedEmailRecoveryKey-delete-key-change-pwd = Pokud jste to nebyli vy, <a data-l10n-name="revokeAccountRecoveryLink">smažte nový klíč</a> a <a data-l10n-name="passwordChangeLink">změňte si heslo</a>.
automatedEmailRecoveryKey-change-pwd-only = Pokud jste to nebyli vy, <a data-l10n-name="passwordChangeLink">změňte si heslo</a>.
automatedEmailRecoveryKey-more-info = Další informace nalezete na stránkách <a data-l10n-name="supportLink">Podpory { -brand-mozilla(case: "gen") }</a>.
# Colon is followed by user device info on a separate line (e.g., "Firefox Nightly on Mac OSX 10.11")
automatedEmailRecoveryKey-origin-plaintext = Tato žádost přišla z:
# Colon is followed by a URL to the account recovery key section of account settings
automatedEmailRecoveryKey-notyou-delete-key-plaintext = Pokud jste to nebyli vy, odstraňte nový klíč:
# Colon is followed by a URL to the change password section of account settings
automatedEmailRecoveryKey-notyou-change-pwd-only-plaintext = Pokud jste to nebyli vy, změňte si heslo:
# This string is shown on its own line, after automatedEmailRecoveryKey-notyou-delete-key-plaintext and its URL
# Colon is followed by a URL to the change password section of account settings
automatedEmailRecoveryKey-notyou-change-pwd-plaintext = a změňte si heslo:
# Colon is followed by a URL to Mozilla Support's "I'm having problems with my account" page
automatedEmailRecoveryKey-more-info-plaintext = Pro více informací navštivte podporu { -brand-mozilla(case: "gen") }:
automated-email-reset =
    Toto je automatický e-mail; pokud jste tuto akci neschválili, tak si prosím <a data-l10n-name="resetLink">obnovte heslo</a>.
    Pro více informací prosím navštivte <a data-l10n-name="supportLink">podporu { -brand-mozilla(case: "gen") }</a>.
# Variables:
#  $resetLink (String) - Link to https://accounts.firefox.com/reset_password
automated-email-reset-plaintext-v2 = Pokud jste tuto akci neschválili, obnovte si prosím své heslo na adrese { $resetLink }
# This message is used by multiple automated emails that notify users of security events on their account
# "this action" is meant to be a generic term, and could, for example, refer to using a backup authentication code to confirm a password reset
automated-email-reset-pwd-two-factor = Pokud jste tuto akci neprovedli, ihned <a data-l10n-name="resetLink">obnovte své heslo</a> a <a data-l10n-name="twoFactorSettingsLink">dvoufázové ověřování</a>. Pro více informací prosím navštivte stránky <a data-l10n-name="supportLink">Podpory { -brand-mozilla(case: "gen") }</a>.
# Followed by link to https://accounts.firefox.com/reset_password
automated-email-reset-pwd-plaintext-v3 = Pokud jste tuto akci neprovedli, okamžitě obnovte své heslo na:
# Followed by link to https://accounts.firefox.com/settings#two-step-authentication
automated-email-reset-two-factor-plaintext = Obnovit dvoufázové ověřování v:
automated-email-sign-in = Toto je automatický e-mail; pokud jste tuto akci neprovedli, pak prosím <a data-l10n-name="securitySettingsLink">zkontrolujte bezpečnostní nastavení svého účtu</a>. Pro více informací prosím navštivte <a data-l10n-name="supportLink">Podporu na { -brand-mozilla }</a>.
automated-email-sign-in-plaintext = Pokud jste tuto akci neschválili, zkontrolujte prosím bezpečnostní nastavení vašeho účtu na:
brand-banner-message = Víte, že jsme změnili název z { -product-firefox-accounts(case: "gen") } na { -product-mozilla-accounts(case: "acc") }? <a data-l10n-name="learnMore">Zjistit více</a>
change-password-plaintext = Pokud máte podezření, že se někdo pokouší neoprávněně získat přístup k vašemu účtu, změňte si prosím své heslo.
manage-account = Správa účtu
manage-account-plaintext = { manage-account }:
# Variables:
#  $supportUrl (String) - Link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
support-message-3 = Další informace nalezete na stránkách <a data-l10n-name="supportLink">Podpora { -brand-mozilla(case: "gen") }</a>.
# Variables:
#  $supportUrl (String) - Link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
support-message-plaintext = Pro více informací navštivte podporu { -brand-mozilla(case: "gen") }: { $supportUrl }.
# Variables:
#  $uaBrowser (String) - User's browser, e.g. Firefox
#  $uaOS (String) - User's OS, e.g. Mac OSX
#  $uaOSVersion (String) - User's OS version, e.g. 10.11
device-all = { $uaBrowser } na { $uaOS } { $uaOSVersion }
# Variables:
#  $uaBrowser (String) - User's browser, e.g. Firefox
#  $uaOS (String) - User's OS, e.g. Mac OSX
device-browser-os = { $uaBrowser } na { $uaOS }
# Variables:
#  $city (String) - User's city
#  $stateCode (String) - User's state
#  $country (String) - User's country
location-all = { $city }, { $stateCode }, { $country } (odhad)
# Variables:
#  $city (String) - User's city
#  $country (String) - User's country
location-city-country = { $city }, { $country } (odhad)
# Variables:
#  $stateCode (String) - User's state
#  $country (String) - User's country
location-state-country = { $stateCode }, { $country } (odhad)
# Variables:
#  $country (stateCode) - User's country
location-country = { $country } (odhad)
cadReminderFirst-subject-1 = Připomenutí! Nastavte si synchronizaci v aplikaci { -brand-firefox }
cadReminderFirst-action = Synchronizovat další zařízení
cadReminderFirst-action-plaintext = { cadReminderFirst-action }:
# In the title of the email, "It takes two to sync", "two" refers to syncing two devices
cadReminderFirst-title-1 = K synchronizaci jsou potřeba dva
cadReminderFirst-description-v2 = Panely můžete používat ve všech zařízeních. Získejte své záložky, hesla a další data všude, kde používáte { -brand-firefox }.
cadReminderSecond-subject-2 = Na nic nečekejte a dokončete nastavení synchronizace
cadReminderSecond-action = Synchronizovat další zařízení
cadReminderSecond-title-2 = Nezapomeňte na synchronizaci!
cadReminderSecond-description-sync = Synchronizujte své záložky, hesla, otevřené panely a další věci — všude, kde používáte { -brand-firefox }.
cadReminderSecond-description-plus = Plus, vaše data jsou vždy šifrovaná. Vidíte je pouze vy a zařízení, které schválíte.
inactiveAccountFinalWarning-subject = Poslední šance ponechat si { -product-mozilla-account(capitalization: "lower") }
inactiveAccountFinalWarning-title = Váš účet { -brand-mozilla } a data budou smazána
inactiveAccountFinalWarning-preview = Pro zachování účtu se přihlaste
inactiveAccountFinalWarning-account-description = Váš účet { -product-mozilla-account } slouží k přístupu k bezplatným produktům pro ochranu soukromí a procházení, jako je synchronizace v prohlížeči { -brand-firefox }, { -product-mozilla-monitor }, { -product-firefox-relay } a { -product-mdn }.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
# This date will already be formatted with moment.js into Thursday, Jan 9, 2025 format
inactiveAccountFinalWarning-impact = Pokud se nepřihlásíte, bude <strong>{ $deletionDate }</strong> váš účet a vaše osobní data trvale smazána.
inactiveAccountFinalWarning-action = Přihlaste se a zachovejte si svůj účet
# followed by link to sign in
inactiveAccountFinalWarning-action-plaintext = Přihlaste se a zachovejte si svůj účet:
inactiveAccountFirstWarning-subject = Neztraťte svůj účet
inactiveAccountFirstWarning-title = Chcete si ponechat účet { -brand-mozilla } a data?
inactiveAccountFirstWarning-account-description-v2 = Váš účet { -product-mozilla-account } slouží k přístupu k bezplatným produktům pro ochranu soukromí a procházení, jako je synchronizace v prohlížeči { -brand-firefox }, { -product-mozilla-monitor }, { -product-firefox-relay } a { -product-mdn }.
inactiveAccountFirstWarning-inactive-status = Všimli jsme si, že jste se dva roky nepřihlásil(a).
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
# This date will already be formatted with moment.js into Thursday, Jan 9, 2025 format
inactiveAccountFirstWarning-impact = Váš účet a vaše osobní data budou dne <strong>{ $deletionDate }</strong> trvale smazána, protože nejste aktivní.
inactiveAccountFirstWarning-action = Přihlaste se a zachovejte si svůj účet
inactiveAccountFirstWarning-preview = Přihlaste se a zachovejte si svůj účet
# followed by link to sign in
inactiveAccountFirstWarning-action-plaintext = Přihlaste se a zachovejte si svůj účet:
inactiveAccountSecondWarning-subject = Je vyžadována akce: účet bude za 7 dní smazán
inactiveAccountSecondWarning-title = Váš účet { -brand-mozilla } a data budou smazána za 7 dní
inactiveAccountSecondWarning-account-description-v2 = Váš účet { -product-mozilla-account } slouží k přístupu k bezplatným produktům pro ochranu soukromí a procházení, jako je synchronizace v prohlížeči { -brand-firefox }, { -product-mozilla-monitor }, { -product-firefox-relay } a { -product-mdn }.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
inactiveAccountSecondWarning-impact = Protože jste nebyli aktivní, bude dne <strong>{ $deletionDate }</strong> váš účet a vaše osobní data trvale smazána.
inactiveAccountSecondWarning-action = Přihlaste se a zachovejte si svůj účet
inactiveAccountSecondWarning-preview = Přihlaste se a zachovejte si svůj účet
# followed by link to sign in
inactiveAccountSecondWarning-action-plaintext = Přihlaste se a zachovejte si svůj účet:
# The user has a low number of valid recovery codes remaining for use
codes-reminder-title-zero = Došly vám záložní ověřovací kódy!
codes-reminder-title-one = Používáte poslední záložní ověřovací kód
codes-reminder-title-two = Je čas vytvořit další záložní ověřovací kódy
codes-reminder-description-part-one = Záložní ověřovací kódy vám pomohou obnovit vaše informace, když zapomenete své heslo.
codes-reminder-description-part-two = Vytvořte nové kódy hned, abyste později o svá data nepřišli.
codes-reminder-description-two-left = Zbývají vám jen dva kódy.
codes-reminder-description-create-codes = Vytvořte si nové záložní ověřovací kódy, které vám pomohou dostat se zpět k účtu, pokud k němu nebudete mít přístup.
lowRecoveryCodes-action-2 = Vytvořit kódy
codes-create-plaintext = { lowRecoveryCodes-action-2 }:
lowRecoveryCodes-subject-2 =
    { $numberRemaining ->
        [0] Nejsou k dispozici žádné záložní ověřovací kódy
        [one] K dispozici 1 záložní ověřovací kód
        [few] K dispozici { $numberRemaining } záložní ověřovací kódy
        [many] K dispozici { $numberRemaining } záložních ověřovacích kódů
       *[other] K dispozici { $numberRemaining } záložních ověřovacích kódů
    }
# Variables:
# $clientName (String) - A client the user hasn't signed into before (e.g. Firefox, Sync)
newDeviceLogin-subject = Nové přihlášení skrze { $clientName }
newDeviceLogin-subjectForMozillaAccount = Nové přihlášení k vašemu { -product-mozilla-account(case: "dat", capitalization: "lower") }
newDeviceLogin-title-3 = K přihlášení byl použit váš { -product-mozilla-account(capitalization: "lower") }
# The "Not you?" question is asking whether the recipient of the email is the
# person who performed the action that triggered the email.
newDeviceLogin-change-password = Nebyli jste to vy? <a data-l10n-name="passwordChangeLink">Zmeňte si heslo</a>.
# The "Not you?" question is asking whether the recipient of the email is the
# person who performed the action that triggered the email.
newDeviceLogin-change-password-plain = Nebyli jste to vy? Změňte si heslo:
newDeviceLogin-action = Správa účtu
passwordChangeRequired-subject = Zjištěna podezřelá aktivita
passwordChangeRequired-preview = Ihned si změňte heslo
passwordChangeRequired-title-2 = Obnovit heslo
passwordChangeRequired-suspicious-activity-3 = Váš účet jsme uzamkli, abychom ho ochránili před podezřelou aktivitou. Byli jste odhlášeni ze všech svých zařízení a veškerá synchronizovaná data byla v rámci opatření smazána.
passwordChangeRequired-sign-in-3 = Pro opětovné přihlášení ke svému účtu stačí obnovit heslo.
passwordChangeRequired-different-password-2 = <b>Důležité:</b> Zvolte silné heslo, které bude odlišné od hesla, které jste používali v minulosti.
passwordChangeRequired-different-password-plaintext-2 = Důležité: Zvolte si silné heslo, které se liší od hesla, které jste používali v minulosti.
passwordChangeRequired-action = Obnovit heslo
passwordChangeRequired-action-plaintext = { passwordChangeRequired-action }:
passwordChanged-subject = Heslo změněno
passwordChanged-title = Heslo bylo úspěšně změněno
passwordChanged-description-2 = Heslo k vašemu { -product-mozilla-account(case: "dat", capitalization: "lower") } bylo úspěšně změněno z následujícího zařízení:
# Variables:
#  $code (String) - The confirmation code for sign-in
password-forgot-otp-subject-2 = Pro změnu hesla použijte { $code }
password-forgot-otp-preview = Platnost kódu vyprší za 10 minut
password-forgot-otp-title = Zapomněli jste heslo?
password-forgot-otp-request = Obdrželi jsme žádost o změnu hesla k vašemu { -product-mozilla-account(case: "dat", capitalization: "lowercase") } z:
password-forgot-otp-code-2 = Pokud jste to byli vy, zde je váš potvrzovací kód:
password-forgot-otp-expiry-notice = Platnost kódu vyprší za 10 minut.
passwordReset-subject-2 = Vaše heslo bylo obnoveno
passwordReset-title-2 = Vaše heslo bylo obnoveno
# This sentence is followed by information about the device and time of the password reset
passwordReset-description-2 = Heslo ke svému { -product-mozilla-account(case: "dat", capitalization: "lower") } jste obnovili:
passwordResetAccountRecovery-subject-2 = Vaše heslo bylo obnoveno
passwordResetAccountRecovery-title-3 = Vaše heslo bylo obnoveno
# Followed by details on the device, location, and date/time of the password reset.
passwordResetAccountRecovery-description-3 = Pomocí obnovovacího klíče k účtu jste obnovili heslo k { -product-mozilla-account(case: "dat", capitalization: "lower") }:
passwordResetAccountRecovery-information = Odhlásili jsme vás ze všech vašich synchronizovaných zařízení. Vytvořili jsme nový obnovovací klíč k účtu, jako náhradu toho, který jste používali dříve. Můžete to změnit v nastavení účtu.
# After the colon there is a link to account settings
passwordResetAccountRecovery-information-txt = Odhlásili jsme vás ze všech vašich synchronizovaných zařízení. Vytvořili jsme nový obnovovací klíč k účtu, jako náhradu toho, který jste používali dříve. Můžete to změnit v nastavení účtu:
passwordResetAccountRecovery-action-4 = Správa účtu
passwordResetRecoveryPhone-subject = Telefon pro obnovení byl použit
passwordResetRecoveryPhone-preview = Zkontrolujte, zda jste to byli vy
passwordResetRecoveryPhone-title = K potvrzení obnovení hesla bylo použito vaše telefonní číslo
passwordResetRecoveryPhone-device = Telefon pro obnovení použit z:
passwordResetRecoveryPhone-action = Správa účtu
passwordResetWithRecoveryKeyPrompt-subject = Vaše heslo bylo obnoveno
passwordResetWithRecoveryKeyPrompt-title = Vaše heslo bylo obnoveno
# Details of the device and date/time where the password was reset
passwordResetWithRecoveryKeyPrompt-description = Heslo ke svému { -product-mozilla-account(case: "dat", capitalization: "lower") } jste obnovili:
# Text for button action to create a new account recovery key
passwordResetWithRecoveryKeyPrompt-action = Vytvořit obnovovací klíč k účtu
# colon is followed by a link to create an account recovery key from the account settings page
passwordResetWithRecoveryKeyPrompt-action-txt = Vytvořit obnovovací klíč k účtu:
passwordResetWithRecoveryKeyPrompt-cta-description = Na všech synchronizovaných zařízeních se budete muset znovu přihlásit. Mějte svá data pro příště v bezpečí pomocí klíče pro obnovení účtu. To vám umožní obnovit vaše data, pokud zapomenete své heslo.
postAddAccountRecovery-subject-3 = Nový obnovovací klíč k účtu byl vytvořen
postAddAccountRecovery-title2 = Vytvořili jste nový obnovovací klíč k účtu
# Key here refers to account recovery key
postAddAccountRecovery-body-part1 = Uložte si tento klíč na bezpečné místo — budete ho potřebovat k obnovení zašifrovaných údajů o prohlížení, pokud zapomenete heslo.
# Key here refers to account recovery key
postAddAccountRecovery-body-part2 = Tento klíč lze použít pouze jednou. Jakmile ho začnete používat, automaticky vám vytvoříme nový. Nebo si můžete kdykoli vytvořit nový v nastavení účtu.
postAddAccountRecovery-action = Správa účtu
postAddLinkedAccount-subject-2 = Nový účet propojený s vaším { -product-mozilla-account(case: "ins", capitalization: "lowercase") }
#  Variables:
#  $providerName (String) - The name of the provider, e.g. Apple, Google
postAddLinkedAccount-title-2 = Váš účet { $providerName } byl propojen s vaším účtem { -product-mozilla-account(case: "ins") }
postAddLinkedAccount-action = Správa účtu
postAddPasskey-subject = Přístupový klíč byl vytvořen
postAddPasskey-preview = Nyní se můžete přihlašovat pomocí svého zařízení
postAddPasskey-title = Vytvořili jste přístupový kód
postAddPasskey-description = Nyní se můžete přihlašovat do všech služeb v aplikaci { -product-mozilla-account }.
postAddPasskey-sync-note = Mějte prosím na paměti, že pro přístup k vašim synchronizovaným datům { -brand-firefox } bude i nadále vyžadováno vaše heslo.
# Links out to a support article about passkeys and { -brand-firefox } sync
postAddPasskey-learn-more = Zjistit více
postAddPasskey-requested-from = Vyžádali jste o to z:
postAddPasskey-action = Správa účtu
postAddRecoveryPhone-subject = Telefon pro obnovení byl přidán
postAddRecoveryPhone-preview = Účet chráněn pomocí dvoufázového ověřování
postAddRecoveryPhone-title-v2 = Přidali jste telefonní číslo pro obnovení
# Variables:
#  $maskedLastFourPhoneNumber (String) - A bullet point mask with the last four digits of the user's phone number, e.g. ••••••1234
postAddRecoveryPhone-description-v2 = Jako telefonní číslo pro obnovení jste přidali číslo { $maskedLastFourPhoneNumber }.
# Links out to a support article about two factor authentication
postAddRecoveryPhone-how-protect = Jak tato funkce chrání váš účet
postAddRecoveryPhone-how-protect-plaintext = Jak tato nastavení chrání váš účet:
postAddRecoveryPhone-enabled-device = Povolili jste ho z:
postAddRecoveryPhone-action = Správa účtu
postAddTwoStepAuthentication-preview = Váš účet je chráněn
postAddTwoStepAuthentication-subject-v3 = Dvoufázové ověřování je zapnuto
postAddTwoStepAuthentication-title-2 = Zapnuli jste dvoufázové ověření
# After the colon, there is a description of the device that the user used to enable two-step authentication
postAddTwoStepAuthentication-from-device-v2 = Vyžádali jste si to z:
postAddTwoStepAuthentication-action = Správa účtu
postAddTwoStepAuthentication-code-required-v4 = Při každém přihlášení nyní bude nutné zadat bezpečnostní kód z vaší ověřovací aplikace.
postAddTwoStepAuthentication-recovery-method-codes = Přidali jste také záložní ověřovací kódy jako metodu obnovení.
# Variables:
#  $maskedPhoneNumber (String) - A bullet point mask with the last four digits of the user's phone number, e.g. ••••••1234
postAddTwoStepAuthentication-recovery-method-phone = Jako telefonní číslo pro obnovení jste přidali také číslo { $maskedLastFourPhoneNumber }.
postAddTwoStepAuthentication-how-protects-link = Jak tato funkce chrání váš účet
postAddTwoStepAuthentication-how-protects-plaintext = Jak tato nastavení chrání váš účet:
postAddTwoStepAuthentication-device-sign-out-message = Pro ochranu všech vašich připojených zařízení byste se měli odhlásit všude, kde používáte tento účet, a poté se znovu přihlásit pomocí dvoufázového ověření.
postChangeAccountRecovery-subject = Obnovovací klíč k účtu byl změněn
postChangeAccountRecovery-title = Změnili jste svůj obnovovací klíč k účtu
postChangeAccountRecovery-body-part1 = Nyní máte nový obnovovací klíč k účtu. Váš předchozí klíč byl smazán.
postChangeAccountRecovery-body-part2 = Tento nový klíč si uložte na bezpečné místo — budete ho potřebovat k obnovení zašifrovaných dat prohlížení, pokud zapomenete své heslo.
postChangeAccountRecovery-action = Spravovat účet
postChangePrimary-subject = Hlavní e-mailová adresa aktualizována
postChangePrimary-title = Nová hlavní e-mailová adresa
# Variables:
#  $email (String) - A user's email address
postChangePrimary-description-2 = Vaše hlavní e-mailová adresa byla úspěšně změněna na { $email }. Tato adresa bude nyní použita pro přihlašování k vašemu { -product-mozilla-account(case: "dat") } a na zasílání bezpečnostních upozornění a potvrzení.
postChangePrimary-action = Správa účtu
postChangeRecoveryPhone-subject = Telefon pro obnovení byl aktualizován
postChangeRecoveryPhone-preview = Účet chráněn pomocí dvoufázového ověřování
postChangeRecoveryPhone-title = Změnili jste své telefonní číslo pro obnovení
postChangeRecoveryPhone-description = Nyní máte nové telefonní číslo pro obnovu. Vaše předchozí telefonní číslo bylo smazáno.
postChangeRecoveryPhone-requested-device = Vyžádali jste si ho z:
postChangeTwoStepAuthentication-preview = Váš účet je chráněn
postChangeTwoStepAuthentication-subject = Dvoufázové ověřování bylo aktualizováno
postChangeTwoStepAuthentication-title = Dvoufázové ověřování bylo aktualizováno
postChangeTwoStepAuthentication-use-new-account = Nyní je potřeba ve své ověřovací aplikaci použít novou položku pro { -product-mozilla-account(case: "acc") }. Starší z nich už nebude fungovat a můžete ji odebrat.
# After the colon, there is a description of the device that the user used to enable two-step authentication
postChangeTwoStepAuthentication-from-device = Vyžádali jste o to z:
postChangeTwoStepAuthentication-action = Správa účtu
postChangeTwoStepAuthentication-how-protects-link = Jak tato funkce chrání váš účet
postChangeTwoStepAuthentication-how-protects-plaintext = Jak to chrání váš účet:
postChangeTwoStepAuthentication-device-sign-out-message = Pro ochranu všech vašich připojených zařízení byste se měli odhlásit všude, kde používáte tento účet, a poté se znovu přihlásit pomocí nového dvoufázového ověření.
postConsumeRecoveryCode-title-3 = Váš záložní ověřovací kód byl použit jako potvrzení obnovení hesla
# After the colon, there is description of the device that the backup authentication code was used on
# E.g., Firefox Nightly on Mac OSX, Thursday Sept 2, 2024
postConsumeRecoveryCode-description-3 = Použitý kód z:
postConsumeRecoveryCode-action = Správa účtu
postConsumeRecoveryCode-subject-v3 = Byl použit záložní ověřovací kód
postConsumeRecoveryCode-preview = Zkontrolujte, zda jste to byli vy
postNewRecoveryCodes-subject-2 = Byly vytvořeny nové záložní ověřovací kódy
postNewRecoveryCodes-title-2 = Vytvořili jste nové záložní ověřovací kódy
# After the colon, there is information about the device that the authentication codes were created on
postNewRecoveryCodes-description-2 = Byly vytvořeny na:
postNewRecoveryCodes-action = Správa účtu
postRemoveAccountRecovery-subject-2 = Obnovovací klíč k účtu byl smazán
postRemoveAccountRecovery-title-3 = Smazali jste svůj obnovovací klíč k účtu
postRemoveAccountRecovery-body-part1 = Pokud zapomenete heslo, je vyžadován obnovovací klíč k vašemu účtu.
postRemoveAccountRecovery-body-part2 = Pokud jste tak ještě neučinili, vytvořte si v nastavení účtu nový obnovovací klíč k účtu, abyste předešli ztrátě svých uložených hesel, záložek, historie prohlížení a dalších věcí.
postRemoveAccountRecovery-action = Správa účtu
postRemoveRecoveryPhone-subject = Telefon pro obnovení byl odebrán
postRemoveRecoveryPhone-preview = Účet chráněn pomocí dvoufázového ověřování
postRemoveRecoveryPhone-title = Telefon pro obnovení byl odebrán
postRemoveRecoveryPhone-description-v2 = Váš telefon pro obnovení byl odstraněn z nastavení dvoufázového ověřování.
postRemoveRecoveryPhone-description-extra = Stále můžete použít své záložní ověřovací kódy pro přihlášení, pokud nebudete moci použít svou ověřovací aplikaci.
postRemoveRecoveryPhone-requested-device = Vyžádali jste si ho z:
postRemoveSecondary-subject = Záložní e-mailová adresa byla odebrána
postRemoveSecondary-title = Záložní e-mailová adresa byla odebrána
# Variables:
#  $secondaryEmail (String) - A user's email address
postRemoveSecondary-description-2 = Úspěšně jste z vašeho účtu { -product-mozilla-account } odebrali { $secondaryEmail } coby záložní e-mailovou adresu. Nadále už nebudou na tuto adresu doručovány bezpečnostní oznámení a potvrzování přihlášení.
postRemoveSecondary-action = Správa účtu
postRemoveTwoStepAuthentication-subject-line-2 = Dvoufázové ověření je vypnuté
postRemoveTwoStepAuthentication-title-2 = Vypnuli jste dvoufázové ověření
# After the colon is a description of the device the user used to disable two-step authentication
postRemoveTwoStepAuthentication-from-device = Zakázali jste ho z:
postRemoveTwoStepAuthentication-action = Správa účtu
postRemoveTwoStepAuthentication-not-required-2 = Při přihlašování již nepotřebujete bezpečnostní kódy z ověřovací aplikace.
postSigninRecoveryCode-subject = Záložní ověřovací kód používaný k přihlášení
postSigninRecoveryCode-preview = Potvrďte aktivitu účtu
postSigninRecoveryCode-title = K přihlášení byl použit váš záložní ověřovací kód
postSigninRecoveryCode-description = Pokud jste tak neudělali, měli byste si okamžitě změnit heslo, aby byl váš účet v bezpečí.
postSigninRecoveryCode-device = Přihlásili jste se z:
postSigninRecoveryCode-action = Správa účtu
postSigninRecoveryPhone-subject = Pro přihlášení byl použit telefon určený pro obnovení účtu
postSigninRecoveryPhone-preview = Potvrďte aktivitu účtu
postSigninRecoveryPhone-title = K přihlášení bylo použito vaše telefonní číslo pro obnovení
postSigninRecoveryPhone-description = Pokud jste tak neudělali, měli byste si okamžitě změnit heslo, aby byl váš účet v bezpečí.
postSigninRecoveryPhone-device = Přihlásili jste se z:
postSigninRecoveryPhone-action = Správa účtu
postVerify-sub-title-3 = Jsme rádi, že vás vidíme!
postVerify-title-2 = Chcete vidět stejné panely na dvou zařízeních?
postVerify-description-2 = Je to snadné! Stačí nainstalovat { -brand-firefox } na jiné zařízení a přihlásit se k synchronizaci. Je to jako kouzlo!
postVerify-sub-description = (Psst… To také znamená, že své záložky, hesla a další data { -brand-firefox(case: "gen") } můžete získat všude, kde jste přihlášeni.)
postVerify-subject-4 = Vítá vás { -brand-mozilla }!
postVerify-setup-2 = Připojit další zařízení:
postVerify-action-2 = Připojte další zařízení
postVerifySecondary-subject = Záložní e-mailová adresa byla přidána
postVerifySecondary-title = Záložní e-mailová adresa byla přidána
# Variables:
#  $secondaryEmail (String) - A user's secondary email address
postVerifySecondary-content-3 = Úspěšně jste potvrdili { $secondaryEmail } jako záložní e-mailovou adresu pro váš { -product-mozilla-account(case: "acc", capitalization: "lower") }. Bezpečnostní oznámení a potvrzení o přihlášení budou nyní doručována na obě e-mailové adresy.
postVerifySecondary-action = Správa účtu
recovery-subject = Obnovit heslo
recovery-title-2 = Zapomněli jste heslo?
# Information on the device, location, and date and time of the request that triggered the email follows.
recovery-request-origin-2 = Obdrželi jsme žádost o změnu hesla k vašemu { -product-mozilla-account(case: "dat") } z:
recovery-new-password-button = Vytvořte si nové heslo klepnutím na tlačítko níže. Platnost tohoto odkazu vyprší v průběhu následující hodiny.
recovery-copy-paste = Vytvořte si nové heslo zkopírováním a vložením adresy URL níže do vašeho prohlížeče. Platnost tohoto odkazu vyprší během následující hodiny.
recovery-action = Vytvořit nové heslo
# Variables:
#  $unblockCode (String) - The authorization code for sign-in
unblockCode-subject-2 = Pro přihlášení použijte { $unblockCode }
unblockCode-preview = Platnost kódu vyprší za hodinu
unblockCode-title = Jste to vy, kdo se přihlašuje?
unblockCode-prompt = Pokud ano, zde je váš autorizační kód, který potřebujete:
# Variables:
#  $unblockCode (String) - An alphanumeric code
unblockCode-prompt-plaintext = Pokud ano, zde je váš autorizační kód, který potřebujete: { $unblockCode }
unblockCode-report = Pokud ne, pomozte nám odrazit útočníky a <a data-l10n-name="reportSignInLink">nahlašte nám to</a>.
unblockCode-report-plaintext = Pokud ne, pomozte nám odrazit útočníky a nahlaste nám to.
verificationReminderFinal-subject = Poslední připomenutí k potvrzení vašeho účtu
verificationReminderFinal-description-2 = Před několika týdny jste vytvořili { -product-mozilla-account(case: "acc") }, ale nikdy jste jej nepotvrdili. Pro vaši bezpečnost účet smažeme, pokud nebude ověřen během následujících 24 hodin.
confirm-account = Potvrdit účet
confirm-account-plaintext = { confirm-account }:
verificationReminderFirst-subject-2 = Nezapomeňte potvrdit svůj účet
verificationReminderFirst-title-3 = Vítá vás { -brand-mozilla }!
verificationReminderFirst-description-3 = Před několika dny jste vytvořili { -product-mozilla-account(case: "acc") }, ale nikdy jste jej nepotvrdili. Potvrďte svůj účet během následujících 15 dní, jinak bude automaticky smazán.
verificationReminderFirst-sub-description-3 = Nenechte si ujít prohlížeč, který staví vás a vaše soukromí na první místo.
confirm-email-2 = Potvrdit účet
confirm-email-plaintext-2 = { confirm-email-2 }:
verificationReminderFirst-action-2 = Potvrdit účet
verificationReminderSecond-subject-2 = Nezapomeňte potvrdit svůj účet
verificationReminderSecond-title-3 = Nenechte si ujít { -brand-mozilla }!
verificationReminderSecond-description-4 = Před několika dny jste vytvořili { -product-mozilla-account(case: "acc") }, ale nikdy jste jej nepotvrdili. Potvrďte svůj účet během následujících 10 dní, jinak bude automaticky smazán.
verificationReminderSecond-second-description-3 = { -product-mozilla-account } vám umožňuje synchronizovat { -brand-firefox(case: "acc") } mezi zařízeními a odemyká přístup k produktům { -brand-mozilla }, které ještě více chrání soukromí.
verificationReminderSecond-sub-description-2 = Staňte se součástí našeho poslání proměnit internet v místo, které je otevřené pro každého.
verificationReminderSecond-action-2 = Potvrdit účet
verify-title-3 = Pojďte na internet pomocí { -brand-mozilla(case: "acc") }
verify-description-2 = Potvrďte svůj účet a využívejte výhody { -brand-mozilla(case: "gen") } všude, kde se přihlásíte, počínaje:
verify-subject = Dokončit vytváření účtu
verify-action-2 = Potvrdit účet
# Variables:
# $code (String) - The verification code
verifyAccountChange-subject = Pro změnu účtu použijte { $code }
# Variables:
# $expirationTime (Number) - Represents the expiration time in minutes
verifyAccountChange-preview =
    { $expirationTime ->
        [one] Platnost kódu vyprší za { $expirationTime } minutu.
        [few] Platnost kódu vyprší za { $expirationTime } minuty.
       *[other] Platnost kódu vyprší za { $expirationTime } minut.
    }
verifyAccountChange-title = Měníte informace o svém účtu?
# After the colon is a description of the device used to sign in to the service
verifyAccountChange-safe = Pomozte nám udržet váš účet v bezpečí tím, že schválíte tuto změnu na:
verifyAccountChange-prompt = Pokud ano, zde je váš autorizační kód:
# Variables:
# $expirationTime (Number) - Represents the expiration time in minutes
verifyAccountChange-expiry-notice =
    { $expirationTime ->
        [one] Platnost vyprší za { $expirationTime } minutu.
        [few] Platnost vyprší za { $expirationTime } minuty.
       *[other] Platnost vyprší za { $expirationTime } minut.
    }
# Variables:
#  $clientName (String) - A client the user hasn't signed into before (e.g. Firefox, Sync)
verifyLogin-title-2 = Přihlásili jste se do produktu { $clientName }?
verifyLogin-description-2 = Pomozte nám udržet váš účet v bezpečí tím, že potvrdíte, že jste se přihlásili:
verifyLogin-subject-2 = Potvrdit přihlášení
verifyLogin-action = Potvrdit přihlášení
# Variables:
#  $code (String) - The confirmation code for sign-in
verifyLoginCode-subject-line-3 = Pro přihlášení použijte { $code }
verifyLoginCode-preview = Platnost kódu vyprší za 5 minut.
# Variables:
#  $serviceName (String) - A service the user hasn't signed into before (e.g. Firefox)
verifyLoginCode-title-2 = Přihlásili jste se do produktu { $serviceName }?
# After the colon is a description of the device used to sign in to the service
verifyLoginCode-safe = Pomozte nám udržet váš účet v bezpečí tím, že schválíte své přihlášení na zařízení:
verifyLoginCode-prompt-3 = Pokud ano, zde je váš autorizační kód:
verifyLoginCode-expiry-notice = Platnost vyprší za 5 minut.
verifyPrimary-title-2 = Ověřit hlavní e-mailovou adresu
verifyPrimary-description = Požadavek na změnu vašeho účtu byl odeslán z tohoto zařízení:
verifyPrimary-subject = Ověřit hlavní e-mailovou adresu
verifyPrimary-action-2 = Potvrdit e-mailovou adresu
verifyPrimary-action-plaintext-2 = { verifyPrimary-action-2 }:
verifyPrimary-post-verify-2 = Po potvrzení budou z tohoto zařízení možné změny účtu, jako je přidání záložní e-mailové adresy.
# Variables:
#  $code (String) - The confirmation code for secondary email
verifySecondaryCode-subject-2 = Použijte { $code } k potvrzení své záložní e-mailové adresy
verifySecondaryCode-preview = Platnost kódu vyprší za 5 minut.
verifySecondaryCode-title-2 = Ověřit záložní e-mailovou adresu
verifySecondaryCode-action-2 = Potvrdit e-mailovou adresu
# Variables:
#  $email (string) A user's unverified secondary email address
verifySecondaryCode-explainer-2 = Žádost o použití adresy { $email } jako záložní e-mailové adresy byla podána z následujícího { -product-mozilla-account(case: "gen") }:
verifySecondaryCode-prompt-2 = Použijte tento potvrzovací kód:
verifySecondaryCode-expiry-notice-2 = Platnost vyprší za 5 minut. Po ověření budete na tuto e-mailovou adresu dostávat bezpečnostní oznámení a potvrzení.
# Variables:
#  $code (String) - comfirmation code for the account
verifyShortCode-subject-4 = Použijte { $code } pro potvrzení svého účtu
verifyShortCode-preview-2 = Platnost kódu vyprší za 5 minut
verifyShortCode-title-3 = Pojďte na internet pomocí { -brand-mozilla(case: "acc") }
# Information on the browser and device triggering this confirmation email follows below this string.
verifyShortCode-title-subtext-2 = Potvrďte svůj účet a využívejte výhody { -brand-mozilla(case: "gen") } všude, kde se přihlásíte, počínaje:
verifyShortCode-prompt-3 = Použijte tento potvrzovací kód:
verifyShortCode-expiry-notice = Platnost vyprší za 5 minut.
