## Email content
## Emails do not contain buttons, only links. Emails have a rich HTML version and a plaintext
## version. The strings are usually identical but sometimes they differ slightly.

fxa-header-mozilla-logo = <img data-l10n-name="mozilla-logo" alt="Logotip { -brand-mozilla(sklon: "rodilnik") }">
fxa-header-sync-devices-image = <img data-l10n-name="sync-devices-image" alt="Sinhronizirajte naprave">
body-devices-image = <img data-l10n-name="devices-image" alt="Naprave">
fxa-privacy-url = Politika zasebnosti { -brand-mozilla(sklon: "rodilnik") }
moz-accounts-privacy-url-2 = Obvestilo o zasebnosti { -product-mozilla-accounts(sklon: "rodilnik") }
moz-accounts-terms-url = Pogoji uporabe { -product-mozilla-accounts(sklon: "rodilnik") }
account-deletion-info-block-communications = Če bo vaš račun izbrisan, boste še vedno prejemali e-pošto od Mozilla Corporation in Mozilla Foundation, razen če <a data-l10n-name="unsubscribeLink">se odjavite</a>.
account-deletion-info-block-support = Če imate kakršnakoli vprašanja ali potrebujete pomoč, se obrnite na našo <a data-l10n-name="supportLink">ekipo za podporo</a>.
account-deletion-info-block-communications-plaintext = Če bo vaš račun izbrisan, boste še vedno prejemali e-pošto od Mozilla Corporation in Mozilla Foundation, razen če se odjavite:
account-deletion-info-block-support-plaintext = Če imate kakršnakoli vprašanja ali potrebujete pomoč, se obrnite na našo ekipo za podporo:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
body-android-badge = <img data-l10n-name="google-play-badge" alt="Prenesite { $productName } iz trgovine { -google-play }">
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
body-ios-badge = <img data-l10n-name="apple-app-badge" alt="Prenesite { $productName } iz trgovine { -app-store }">
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-desktop-device-2 = Namestite { $productName } na <a data-l10n-name="anotherDeviceLink">drugo namizno napravo</a>.
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-device-2 = Namestite { $productName } na <a data-l10n-name="anotherDeviceLink">drugo napravo</a>.
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
android-download-plaintext = Prenesite { $productName } z Google Play:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
ios-download-plaintext = Prenesite { $productName } iz App Store:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-device-plaintext = Namestite { $productName } na drugo napravo:
automated-email-change-2 = Če tega niste storili vi, takoj <a data-l10n-name="passwordChangeLink">spremenite geslo</a>.
automated-email-support = Za več informacij obiščite <a data-l10n-name="supportLink">Podporo { -brand-mozilla }</a>.
# After the colon, there's a link to https://accounts.firefox.com/settings/change_password
automated-email-change-plaintext-2 = Če tega niste storili vi, takoj spremenite geslo:
#  After the colon, there's a link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
automated-email-support-plaintext = Za več informacij obiščite Podporo { -brand-mozilla }:
automated-email-inactive-account = To je samodejno sporočilo. Prejeli ste ga, ker imate { -product-mozilla-account } in sta minili 2 leti, odkar ste bili nazadnje prijavljeni vanj.
# supportLink - https://support.mozilla.org/kb/im-having-problems-my-firefox-account
automated-email-no-action = { automated-email-no-action-plaintext } Za več informacij obiščite <a data-l10n-name="supportLink">Podporo { -brand-mozilla }</a>.
automated-email-no-action-plaintext = To sporočilo je bilo poslano samodejno. Če ste ga prejeli pomotoma, vam ni treba storiti ničesar.
#  After the colon, there's a link to https://accounts.firefox.com/settings/change_password
automated-email-not-authorized-plaintext = To je samodejno sporočilo. Če niste sprožili tega dejanja, spremenite geslo:
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
# - $uaOS: the user agent's operating system (e.g, MacOS)
# - $uaOSVersion - the user agent's operating system version
automatedEmailRecoveryKey-origin-device-all = Ta zahteva je prišla iz brskalnika { $uaBrowser } v sistemu { $uaOS } { $uaOSVersion }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
# - $uaOS: the user agent's operating system (e.g, MacOS)
automatedEmailRecoveryKey-origin-device-browser-os = Ta zahteva je prišla iz brskalnika { $uaBrowser } v sistemu { $uaOS }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
automatedEmailRecoveryKey-origin-device-browser-only = Ta zahteva je prišla iz brskalnika { $uaBrowser }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaOS: the user agent's operating system (e.g, MacOS)
# - $uaOSVersion - the user agent's operating system version
automatedEmailRecoveryKey-origin-device-OS-version-only = Ta zahteva je prišla iz sistema { $uaOS } { $uaOSVersion }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaOS: the user agent's operating system (e.g, MacOS)
automatedEmailRecoveryKey-origin-device-OS-only = Ta zahteva je prišla iz sistema { $uaOS }.
automatedEmailRecoveryKey-delete-key-change-pwd = Če to niste bili vi, <a data-l10n-name="revokeAccountRecoveryLink">izbrišite nov ključ</a> in <a data-l10n-name="passwordChangeLink">spremenite svoje geslo</a>.
automatedEmailRecoveryKey-change-pwd-only = Če to niste bili vi, <a data-l10n-name="passwordChangeLink">spremenite svoje geslo</a>.
automatedEmailRecoveryKey-more-info = Za več informacij obiščite <a data-l10n-name="supportLink">Podporo { -brand-mozilla }</a>.
# Colon is followed by user device info on a separate line (e.g., "Firefox Nightly on Mac OSX 10.11")
automatedEmailRecoveryKey-origin-plaintext = Ta zahteva prihaja iz:
# Colon is followed by a URL to the account recovery key section of account settings
automatedEmailRecoveryKey-notyou-delete-key-plaintext = Če to niste bili vi, izbrišite nov ključ:
# Colon is followed by a URL to the change password section of account settings
automatedEmailRecoveryKey-notyou-change-pwd-only-plaintext = Če to niste bili vi, spremenite svoje geslo:
# This string is shown on its own line, after automatedEmailRecoveryKey-notyou-delete-key-plaintext and its URL
# Colon is followed by a URL to the change password section of account settings
automatedEmailRecoveryKey-notyou-change-pwd-plaintext = in spremenite geslo:
# Colon is followed by a URL to Mozilla Support's "I'm having problems with my account" page
automatedEmailRecoveryKey-more-info-plaintext = Za več informacij obiščite Podporo { -brand-mozilla }:
automated-email-reset =
    To je samodejno sporočilo. Če niste sprožili tega dejanja, <a data-l10n-name="resetLink">ponastavite svoje geslo</a>.
    Za več informacij obiščite <a data-l10n-name="supportLink">Podporo { -brand-mozilla }</a>.
# Variables:
#  $resetLink (String) - Link to https://accounts.firefox.com/reset_password
automated-email-reset-plaintext-v2 = Če tega dejanja niste sprožili vi, takoj ponastavite geslo na { $resetLink }
# This message is used by multiple automated emails that notify users of security events on their account
# "this action" is meant to be a generic term, and could, for example, refer to using a backup authentication code to confirm a password reset
automated-email-reset-pwd-two-factor = Če tega niste storili vi, takoj <a data-l10n-name="resetLink">ponastavite geslo</a> in <a data-l10n-name="twoFactorSettingsLink">ponastavite overjanje v dveh korakih</a>. Za več informacij obiščite <a data-l10n-name="supportLink">Podporo { -brand-mozilla }</a>.
# Followed by link to https://accounts.firefox.com/reset_password
automated-email-reset-pwd-plaintext-v3 = Če tega dejanja niste storili vi, takoj ponastavite geslo:
# Followed by link to https://accounts.firefox.com/settings#two-step-authentication
automated-email-reset-two-factor-plaintext = Ponastavite tudi overitev v dveh korakih:
automated-email-sign-in = To je samodejno sporočilo; če niste sprožili tega dejanja, <a data-l10n-name="securitySettingsLink">preglejte varnostne nastavitve računa</a>. Za več informacij obiščite <a data-l10n-name="supportLink">podporo za { -brand-mozilla }</a>.
automated-email-sign-in-plaintext = Če niste vi sprožili tega dejanja, si oglejte varnostne nastavitve računa na:
brand-banner-message = Ali ste vedeli, da smo se preimenovali iz { -product-firefox-accounts } v { -product-mozilla-accounts }? <a data-l10n-name="learnMore">Več o tem</a>
change-password-plaintext = Če slutite, da nekdo poskuša pridobiti dostop do vašega računa, spremenite geslo.
manage-account = Upravljanje računa
manage-account-plaintext = { manage-account }:
# Variables:
#  $supportUrl (String) - Link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
support-message-3 = Za več informacij obiščite <a data-l10n-name="supportLink">Podporo { -brand-mozilla }</a>.
# Variables:
#  $supportUrl (String) - Link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
support-message-plaintext = Za več informacij obiščite Podporo { -brand-mozilla }: { $supportUrl }.
# Variables:
#  $uaBrowser (String) - User's browser, e.g. Firefox
#  $uaOS (String) - User's OS, e.g. Mac OSX
#  $uaOSVersion (String) - User's OS version, e.g. 10.11
device-all = { $uaBrowser } v sistemu { $uaOS } { $uaOSVersion }
# Variables:
#  $uaBrowser (String) - User's browser, e.g. Firefox
#  $uaOS (String) - User's OS, e.g. Mac OSX
device-browser-os = { $uaBrowser } v sistemu { $uaOS }
# Variables:
#  $city (String) - User's city
#  $stateCode (String) - User's state
#  $country (String) - User's country
location-all = { $city }, { $stateCode }, { $country } (ocena)
# Variables:
#  $city (String) - User's city
#  $country (String) - User's country
location-city-country = { $city }, { $country } (ocena)
# Variables:
#  $stateCode (String) - User's state
#  $country (String) - User's country
location-state-country = { $stateCode }, { $country } (ocena)
# Variables:
#  $country (stateCode) - User's country
location-country = { $country } (ocena)
cadReminderFirst-subject-1 = Opomnik! Sinhronizirajmo { -brand-firefox }
cadReminderFirst-action = Sinhroniziraj drugo napravo
cadReminderFirst-action-plaintext = { cadReminderFirst-action }:
# In the title of the email, "It takes two to sync", "two" refers to syncing two devices
cadReminderFirst-title-1 = Za sinhronizacijo sta potrebna dva
cadReminderFirst-description-v2 = Uporabljajte svoje zavihke v vseh svojih napravah. Imejte svoje zaznamke, gesla in druge podatke povsod, kjer uporabljate { -brand-firefox }.
cadReminderSecond-subject-2 = Ne zamudite dogajanja! Končajmo nastavitev sinhronizacije
cadReminderSecond-action = Sinhroniziraj drugo napravo
cadReminderSecond-title-2 = Ne pozabite na sinhronizacijo!
cadReminderSecond-description-sync = Sinhronizirajte svoje zaznamke, gesla in ostale podatke – povsod, kjer uporabljate { -brand-firefox }.
cadReminderSecond-description-plus = Poleg tega so vaši podatki vedno šifrirani. Vidite jih lahko samo vi in naprave, ki jih odobrite.
inactiveAccountFinalWarning-subject = Zadnja priložnost, da obdržite svoj { -product-mozilla-account(sklon: "tozilnik") }
inactiveAccountFinalWarning-title = Vaš račun { -brand-mozilla } in podatki bodo izbrisani
inactiveAccountFinalWarning-preview = Prijavite se, če želite obdržati račun
inactiveAccountFinalWarning-account-description = { -product-mozilla-account(zacetnica: "velika") } vam daje dostop do brezplačnih izdelkov za zasebnost in brskanje, kot so sinhronizacija { -brand-firefox(sklon: "rodilnik") }, { -product-mozilla-monitor }, { -product-firefox-relay } in { -product-mdn }.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
# This date will already be formatted with moment.js into Thursday, Jan 9, 2025 format
inactiveAccountFinalWarning-impact = <strong>{ $deletionDate }</strong> bodo vaš račun in osebni podatki trajno izbrisani, razen če se prijavite vanj.
inactiveAccountFinalWarning-action = Prijavite se, če želite obdržati račun
# followed by link to sign in
inactiveAccountFinalWarning-action-plaintext = Prijavite se, če želite obdržati račun:
inactiveAccountFirstWarning-subject = Ne izgubite računa
inactiveAccountFirstWarning-title = Želite obdržati račun { -brand-mozilla } in podatke?
inactiveAccountFirstWarning-account-description-v2 = { -product-mozilla-account(zacetnica: "velika") } vam daje dostop do brezplačnih izdelkov za zasebnost in brskanje, kot so sinhronizacija { -brand-firefox(sklon: "rodilnik") }, { -product-mozilla-monitor }, { -product-firefox-relay } in { -product-mdn }.
inactiveAccountFirstWarning-inactive-status = Opazili smo, da se niste prijavili že dve leti.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
# This date will already be formatted with moment.js into Thursday, Jan 9, 2025 format
inactiveAccountFirstWarning-impact = Zaradi nedejavnosti bo vaš račun in osebni podatki <strong>{ $deletionDate }</strong> trajno izbrisani.
inactiveAccountFirstWarning-action = Prijavite se, če želite obdržati račun
inactiveAccountFirstWarning-preview = Prijavite se, če želite obdržati račun
# followed by link to sign in
inactiveAccountFirstWarning-action-plaintext = Prijavite se, če želite obdržati račun:
inactiveAccountSecondWarning-subject = Potrebno je ukrepanje: račun bo čez 7 dni izbrisan
inactiveAccountSecondWarning-title = Vaš račun { -brand-mozilla } in podatki v njem bodo po 7 dneh izbrisani
inactiveAccountSecondWarning-account-description-v2 = { -product-mozilla-account(zacetnica: "velika") } vam daje dostop do brezplačnih izdelkov za zasebnost in brskanje, kot so sinhronizacija { -brand-firefox(sklon: "rodilnik") }, { -product-mozilla-monitor }, { -product-firefox-relay } in { -product-mdn }.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
inactiveAccountSecondWarning-impact = Zaradi nedejavnosti bodo vaš račun in osebni podatki <strong>{ $deletionDate }</strong> trajno izbrisani.
inactiveAccountSecondWarning-action = Prijavite se, če želite obdržati račun
inactiveAccountSecondWarning-preview = Prijavite se, če želite obdržati račun
# followed by link to sign in
inactiveAccountSecondWarning-action-plaintext = Prijavite se, če želite obdržati račun:
# The user has a low number of valid recovery codes remaining for use
codes-reminder-title-zero = Zmanjkalo vam je rezervnih overitvenih kod!
codes-reminder-title-one = Ostala vam je le še ena rezervna overitvena koda
codes-reminder-title-two = Čas, da ustvarite več rezervnih overitvenih kod
codes-reminder-description-part-one = Rezervne overitvene kode vam omogočajo obnovitev podatkov v primeru, da pozabite geslo.
codes-reminder-description-part-two = Ustvarite nove kode zdaj, da ne bi pozneje izgubili podatkov.
codes-reminder-description-two-left = Ostali sta vam le še dve kodi.
codes-reminder-description-create-codes = Ustvarite nove rezervne overitvene kode, s katerimi se boste lahko vrnili v račun, če boste zaklenjeni iz njega.
lowRecoveryCodes-action-2 = Ustvari kode
codes-create-plaintext = { lowRecoveryCodes-action-2 }:
lowRecoveryCodes-subject-2 =
    { $numberRemaining ->
        [0] Nimate več rezervnih overitvenih kod
        [one] Imate samo še 1 rezervno overitveno kodo
        [two] Imate samo še { $numberRemaining } rezervni overitveni kodi
        [few] Imate samo še { $numberRemaining } rezervne overitvene kode
       *[other] Imate samo še { $numberRemaining } rezervnih overitvenih kod
    }
# Variables:
# $clientName (String) - A client the user hasn't signed into before (e.g. Firefox, Sync)
newDeviceLogin-subject = Nova prijava v { $clientName }
newDeviceLogin-subjectForMozillaAccount = Nova prijava v { -product-mozilla-account }
newDeviceLogin-title-3 = Vaš { -product-mozilla-account } je bil uporabljen za prijavo
# The "Not you?" question is asking whether the recipient of the email is the
# person who performed the action that triggered the email.
newDeviceLogin-change-password = Niste bili vi? <a data-l10n-name="passwordChangeLink">Spremenite geslo</a>.
# The "Not you?" question is asking whether the recipient of the email is the
# person who performed the action that triggered the email.
newDeviceLogin-change-password-plain = Niste bili vi? Spremenite geslo:
newDeviceLogin-action = Upravljanje računa
passwordChangeRequired-subject = Odkrita sumljiva aktivnost
passwordChangeRequired-preview = Takoj spremenite geslo
passwordChangeRequired-title-2 = Ponastavite geslo
passwordChangeRequired-suspicious-activity-3 = Vaš račun smo zaklenili, da bi ga zaščitili pred sumljivo dejavnostjo. Odjavljeni ste bili iz vseh naprav in vsi sinhronizirani podatki so bili preventivno izbrisani.
passwordChangeRequired-sign-in-3 = Če se želite znova prijaviti v svoj račun, morate samo ponastaviti geslo.
passwordChangeRequired-different-password-2 = <b>Pomembno:</b> Izberite močno geslo, različno od dosedanjih.
passwordChangeRequired-different-password-plaintext-2 = Pomembno: Izberite močno geslo, različno od dosedanjih.
passwordChangeRequired-action = Ponastavi geslo
passwordChangeRequired-action-plaintext = { passwordChangeRequired-action }:
passwordChanged-subject = Geslo posodobljeno
passwordChanged-title = Geslo uspešno spremenjeno
passwordChanged-description-2 = Geslo vašega { -product-mozilla-account(sklon: "rodilnik") } je bilo uspešno spremenjeno iz naslednje naprave:
# Variables:
#  $code (String) - The confirmation code for sign-in
password-forgot-otp-subject-2 = Za spremembo gesla uporabite kodo { $code }
password-forgot-otp-preview = Koda poteče čez 10 minut
password-forgot-otp-title = Ste pozabili geslo?
password-forgot-otp-request = Prejeli smo zahtevo za spremembo gesla vašega { -product-mozilla-account(sklon: "rodilnik") } z:
password-forgot-otp-code-2 = Če ste to bili vi, je tu potrditvena koda za nadaljevanje:
password-forgot-otp-expiry-notice = Ta koda poteče čez 10 minut.
passwordReset-subject-2 = Vaše geslo je bilo ponastavljeno
passwordReset-title-2 = Vaše geslo je bilo ponastavljeno
# This sentence is followed by information about the device and time of the password reset
passwordReset-description-2 = Ponastavili ste geslo { -product-mozilla-account(sklon: "rodilnik") } z naslednje naprave:
passwordResetAccountRecovery-subject-2 = Vaše geslo je bilo ponastavljeno
passwordResetAccountRecovery-title-3 = Vaše geslo je bilo ponastavljeno
# Followed by details on the device, location, and date/time of the password reset.
passwordResetAccountRecovery-description-3 = Z uporabo ključa za obnovitev računa ste ponastavili geslo { -product-mozilla-account(sklon: "rodilnik") } z naslednje naprave:
passwordResetAccountRecovery-information = Odjavili smo vas iz vseh sinhroniziranih naprav. Ustvarili smo nov ključ za obnovitev računa, ki je nadomestil uporabljenega dosedanjega. Lahko ga spremenite v nastavitvah računa.
# After the colon there is a link to account settings
passwordResetAccountRecovery-information-txt = Odjavili smo vas iz vseh sinhroniziranih naprav. Ustvarili smo nov ključ za obnovitev računa, ki je nadomestil uporabljenega dosedanjega. Lahko ga spremenite v nastavitvah računa:
passwordResetAccountRecovery-action-4 = Upravljanje računa
passwordResetRecoveryPhone-subject = Uporabljena je telefonska številka za obnovitev
passwordResetRecoveryPhone-preview = Preverite, ali ste to bili vi
passwordResetRecoveryPhone-title = Za potrditev ponastavitve gesla je bila uporabljena vaša obnovitvena telefonska številka
passwordResetRecoveryPhone-device = Uporabljena obnovitvena telefonska številka od:
passwordResetRecoveryPhone-action = Upravljanje računa
passwordResetWithRecoveryKeyPrompt-subject = Vaše geslo je bilo ponastavljeno
passwordResetWithRecoveryKeyPrompt-title = Vaše geslo je bilo ponastavljeno
# Details of the device and date/time where the password was reset
passwordResetWithRecoveryKeyPrompt-description = Ponastavili ste geslo { -product-mozilla-account(sklon: "rodilnik") } z naslednje naprave:
# Text for button action to create a new account recovery key
passwordResetWithRecoveryKeyPrompt-action = Ustvari ključ za obnovitev računa
# colon is followed by a link to create an account recovery key from the account settings page
passwordResetWithRecoveryKeyPrompt-action-txt = Ustvari ključ za obnovitev računa:
passwordResetWithRecoveryKeyPrompt-cta-description = V vseh sinhroniziranih napravah se boste morali znova prijaviti. Naslednjič svoje podatke ohranite varne s ključem za obnovitev računa, ki v primeru, da pozabite geslo, omogoča obnovitev podatkov.
postAddAccountRecovery-subject-3 = Nov ključ za obnovitev računa ustvarjen
postAddAccountRecovery-title2 = Ustvarili ste nov ključ za obnovitev računa
# Key here refers to account recovery key
postAddAccountRecovery-body-part1 = Ta ključ shranite na varno mesto – potrebovali ga boste za obnovitev šifriranih podatkov brskanja, če pozabite geslo.
# Key here refers to account recovery key
postAddAccountRecovery-body-part2 = Ta ključ je mogoče uporabiti samo enkrat. Ko ga porabite, vam bomo samodejno ustvarili novega. Lahko pa kadar koli ustvarite novega v nastavitvah računa.
postAddAccountRecovery-action = Upravljanje računa
postAddLinkedAccount-subject-2 = Nov račun povezan z vašim { -product-mozilla-account(sklon: "orodnik") }
#  Variables:
#  $providerName (String) - The name of the provider, e.g. Apple, Google
postAddLinkedAccount-title-2 = Vaš račun { $providerName } se je povezal z vašim { -product-mozilla-account(sklon: "orodnik") }
postAddLinkedAccount-action = Upravljanje računa
postAddPasskey-subject = Geslo ustvarjeno
postAddPasskey-preview = Zdaj lahko za prijavo uporabljate svojo napravo
postAddPasskey-title = Ustvarili ste geslo
postAddPasskey-description = Zdaj ga lahko uporabljate za prijavo v vse svoje storitve { -product-mozilla-account }.
postAddPasskey-sync-note = Upoštevajte, da bo geslo še naprej zahtevano za dostop do podatkov za sinhronizacijo { -brand-firefox }.
# Links out to a support article about passkeys and { -brand-firefox } sync
postAddPasskey-learn-more = Več o tem
postAddPasskey-requested-from = To ste zahtevali z naslednje naprave:
postAddPasskey-action = Upravljanje računa
postAddRecoveryPhone-subject = Telefonska številka za obnovitev je dodana
postAddRecoveryPhone-preview = Račun je zaščiten s overjanjem v dveh korakih
postAddRecoveryPhone-title-v2 = Dodali ste telefonsko številko za obnovitev
# Variables:
#  $maskedLastFourPhoneNumber (String) - A bullet point mask with the last four digits of the user's phone number, e.g. ••••••1234
postAddRecoveryPhone-description-v2 = { $maskedLastFourPhoneNumber } ste dodali kot telefonsko številko za obnovitev
# Links out to a support article about two factor authentication
postAddRecoveryPhone-how-protect = Kako to ščiti vaš račun
postAddRecoveryPhone-how-protect-plaintext = Kako to ščiti vaš račun:
postAddRecoveryPhone-enabled-device = Omogočili ste jo z naslednje naprave:
postAddRecoveryPhone-action = Upravljanje računa
postAddTwoStepAuthentication-preview = Vaš račun je zaščiten
postAddTwoStepAuthentication-subject-v3 = Overitev v dveh korakih je vklopljena
postAddTwoStepAuthentication-title-2 = Vklopili ste overitev v dveh korakih
# After the colon, there is a description of the device that the user used to enable two-step authentication
postAddTwoStepAuthentication-from-device-v2 = To ste zahtevali z naslednje naprave:
postAddTwoStepAuthentication-action = Upravljanje računa
postAddTwoStepAuthentication-code-required-v4 = Varnostne kode iz vaše aplikacije za overjanje se bodo odslej zahtevale ob vsaki prijavi.
postAddTwoStepAuthentication-recovery-method-codes = Kot metodo za obnovitev ste dodali tudi rezervne overitvene kode.
# Variables:
#  $maskedPhoneNumber (String) - A bullet point mask with the last four digits of the user's phone number, e.g. ••••••1234
postAddTwoStepAuthentication-recovery-method-phone = Kot telefonsko številko za obnovitev ste dodali tudi { $maskedPhoneNumber }.
postAddTwoStepAuthentication-how-protects-link = Kako to ščiti vaš račun
postAddTwoStepAuthentication-how-protects-plaintext = Kako to ščiti vaš račun:
postAddTwoStepAuthentication-device-sign-out-message = Za zaščito vseh povezanih naprav se odjavite povsod, kjer uporabljate ta račun, in se nato prijavite nazaj s pomočjo overjanja v dveh korakih.
postChangeAccountRecovery-subject = Ključ za obnovitev računa spremenjen
postChangeAccountRecovery-title = Spremenili ste ključ za obnovitev računa
postChangeAccountRecovery-body-part1 = Zdaj imate nov ključ za obnovitev računa. Vaš prejšnji ključ je bil izbrisan.
postChangeAccountRecovery-body-part2 = Shranite ta novi ključ na varno mesto – potrebovali ga boste za obnovitev šifriranih podatkov brskanja, če pozabite geslo.
postChangeAccountRecovery-action = Upravljanje računa
postChangePrimary-subject = Glavni e-poštni naslov posodobljen
postChangePrimary-title = Nov glavni e-poštni naslov
# Variables:
#  $email (String) - A user's email address
postChangePrimary-description-2 = Uspešno ste spremenili glavni e-poštni naslov na { $email }. Ta e-poštni naslov je zdaj vaše uporabniško ime za prijavo v { -product-mozilla-account(sklon: "tozilnik") }, kot tudi naslov za prejemanje varnostnih obvestil ter
postChangePrimary-action = Upravljanje računa
postChangeRecoveryPhone-subject = Telefonska številka za obnovitev je posodobljena
postChangeRecoveryPhone-preview = Račun je zaščiten s overjanjem v dveh korakih
postChangeRecoveryPhone-title = Spremenili ste telefonsko številko za obnovitev
postChangeRecoveryPhone-description = Zdaj imate novo telefonsko številko za obnovitev. Prejšnja številka je bila izbrisana.
postChangeRecoveryPhone-requested-device = To ste zahtevali z naslednje naprave:
postChangeTwoStepAuthentication-preview = Vaš račun je zaščiten
postChangeTwoStepAuthentication-subject = Overjanje v dveh korakih ponovno nastavljeno
postChangeTwoStepAuthentication-title = Overjanje v dveh korakih je bilo ponovno nastavljeno
postChangeTwoStepAuthentication-use-new-account = Odslej morate v aplikaciji za overitev uporabljati nov vnos { -product-mozilla-account }. Dosedanji ne bo več deloval in ga lahko odstranite.
# After the colon, there is a description of the device that the user used to enable two-step authentication
postChangeTwoStepAuthentication-from-device = To ste zahtevali z naslednje naprave:
postChangeTwoStepAuthentication-action = Upravljanje računa
postChangeTwoStepAuthentication-how-protects-link = Kako to ščiti vaš račun
postChangeTwoStepAuthentication-how-protects-plaintext = Kako to ščiti vaš račun:
postChangeTwoStepAuthentication-device-sign-out-message = Za zaščito vseh povezanih naprav se odjavite povsod, kjer uporabljate ta račun, in se nato prijavite z novim overjanjem v dveh korakih.
postConsumeRecoveryCode-title-3 = Za potrditev ponastavitve gesla je bila uporabljena vaša rezervna overitvena koda
# After the colon, there is description of the device that the backup authentication code was used on
# E.g., Firefox Nightly on Mac OSX, Thursday Sept 2, 2024
postConsumeRecoveryCode-description-3 = Uporabljena koda iz:
postConsumeRecoveryCode-action = Upravljanje računa
postConsumeRecoveryCode-subject-v3 = Rezervna overitvena koda je bila uporabljena
postConsumeRecoveryCode-preview = Preverite, ali ste to bili vi
postNewRecoveryCodes-subject-2 = Ustvarjene nove rezervne overitvene kode
postNewRecoveryCodes-title-2 = Ustvarili ste nove rezervne overitvene kode
# After the colon, there is information about the device that the authentication codes were created on
postNewRecoveryCodes-description-2 = Ustvarjene so bile na naslednji napravi:
postNewRecoveryCodes-action = Upravljanje računa
postRemoveAccountRecovery-subject-2 = Ključ za obnovitev računa izbrisan
postRemoveAccountRecovery-title-3 = Izbrisali ste ključ za obnovitev računa
postRemoveAccountRecovery-body-part1 = Ključ za obnovitev računa je potreben za obnovitev šifriranih podatkov brskanja, če pozabite geslo.
postRemoveAccountRecovery-body-part2 = Če tega še niste storili, v nastavitvah računa ustvarite nov obnovitveni ključ in preprečite izgubo shranjenih gesel, zaznamkov, zgodovine brskanja in drugega.
postRemoveAccountRecovery-action = Upravljanje računa
postRemovePasskey-subject = Geslo je izbrisano
postRemovePasskey-preview = Geslo je bilo odstranjeno iz vašega računa
postRemovePasskey-title = Izbrisali ste svoje ključ
postRemovePasskey-description = Za prijavo boste morali uporabiti drug način.
postRemovePasskey-requested-from = To ste zahtevali z naslednje naprave:
postRemovePasskey-action = Upravljanje računa
postRemoveRecoveryPhone-subject = Telefonska številka za obnovitev je odstranjena
postRemoveRecoveryPhone-preview = Račun je zaščiten s overjanjem v dveh korakih
postRemoveRecoveryPhone-title = Telefonska številka za obnovitev je odstranjena
postRemoveRecoveryPhone-description-v2 = Vaša telefonska številka za obnovitev je bila odstranjena iz nastavitev overjanja v dveh korakih.
postRemoveRecoveryPhone-description-extra = Za prijavo lahko še vedno uporabite rezervne overitvene kode, če ne morete uporabiti aplikacije za overitev.
postRemoveRecoveryPhone-requested-device = To ste zahtevali z naslednje naprave:
postRemoveSecondary-subject = Pomožni e-poštni naslov odstranjen
postRemoveSecondary-title = Pomožni e-poštni naslov odstranjen
# Variables:
#  $secondaryEmail (String) - A user's email address
postRemoveSecondary-description-2 = Uspešno ste odstranili { $secondaryEmail } kot pomožni e-poštni naslov svojega { -product-mozilla-account(sklon: "rodilnik") }. Varnostnih obvestil in potrditev prijav ne bomo več pošiljali na ta naslov.
postRemoveSecondary-action = Upravljanje računa
postRemoveTwoStepAuthentication-subject-line-2 = Overitev v dveh korakih izklopljena
postRemoveTwoStepAuthentication-title-2 = Izklopili ste overitev v dveh korakih
# After the colon is a description of the device the user used to disable two-step authentication
postRemoveTwoStepAuthentication-from-device = Onemogočili ste jo z naslednje naprave:
postRemoveTwoStepAuthentication-action = Upravljanje računa
postRemoveTwoStepAuthentication-not-required-2 = Ob prijavi ne potrebujete več varnostnih kod iz aplikacije za preverjanje pristnosti.
postSigninRecoveryCode-subject = Rezervna overitvena koda je bila uporabljena za prijavo
postSigninRecoveryCode-preview = Potrdite dejavnost v računu
postSigninRecoveryCode-title = Za prijavo je bila uporabljena vaša rezervna overitvena koda
postSigninRecoveryCode-description = Če tega niste storili vi, takoj spremenite geslo, da zavarujete račun.
postSigninRecoveryCode-device = Prijavili ste se iz:
postSigninRecoveryCode-action = Upravljanje računa
postSigninRecoveryPhone-subject = Obnovitvena telefonska številka je bila uporabljena za prijavo
postSigninRecoveryPhone-preview = Potrdite dejavnost v računu
postSigninRecoveryPhone-title = Vaša obnovitvena telefonska številka je bila uporabljena za prijavo
postSigninRecoveryPhone-description = Če tega niste storili vi, takoj spremenite geslo, da zavarujete račun.
postSigninRecoveryPhone-device = Prijavili ste se iz:
postSigninRecoveryPhone-action = Upravljanje računa
postVerify-sub-title-3 = Veseli nas, da vas vidimo!
postVerify-title-2 = Želite imeti isti zavihek na dveh napravah?
postVerify-description-2 = Preprosto je! Samo namestite { -brand-firefox } na drugo napravo in se prijavite v sinhronizacijo. Kot čarovnija!
postVerify-sub-description = (Ššš … to pomeni tudi, da vam bodo vaši zaznamki, gesla in ostali podatki { -brand-firefox(sklon: "rodilnik") } dostopni povsod, kjer se boste prijavili.)
postVerify-subject-4 = Dobrodošli pri { -brand-mozilla(sklon: "mestnik") }!
postVerify-setup-2 = Povežite drugo napravo:
postVerify-action-2 = Poveži drugo napravo
postVerifySecondary-subject = Pomožni e-poštni naslov dodan
postVerifySecondary-title = Pomožni e-poštni naslov dodan
# Variables:
#  $secondaryEmail (String) - A user's secondary email address
postVerifySecondary-content-3 = Uspešno ste potrdili { $secondaryEmail } kot pomožni e-poštni naslov svojega { -product-mozilla-account(sklon: "rodilnik") }. Varnostna obvestila in potrditve prijav se bodo zdaj pošiljale na oba naslova.
postVerifySecondary-action = Upravljanje računa
recovery-subject = Ponastavite vaše geslo
recovery-title-2 = Ali ste pozabili geslo?
# Information on the device, location, and date and time of the request that triggered the email follows.
recovery-request-origin-2 = Prejeli smo zahtevo za spremembo gesla vašega { -product-mozilla-account(sklon: "rodilnik") } z:
recovery-new-password-button = Ustvarite novo geslo s klikom na spodnji gumb. Ta povezava bo potekla v naslednji uri.
recovery-copy-paste = Ustvarite novo geslo na spodnjem naslovu, ki ga kopirajte in prilepite v brskalnik. Ta povezava bo potekla v naslednji uri.
recovery-action = Ustvarite novo geslo
# Variables:
#  $unblockCode (String) - The authorization code for sign-in
unblockCode-subject-2 = Za prijavo uporabite kodo { $unblockCode }
unblockCode-preview = Koda poteče čez eno uro
unblockCode-title = Se prijavljate vi?
unblockCode-prompt = Če je tako, je to overitvena koda, ki jo potrebujete:
# Variables:
#  $unblockCode (String) - An alphanumeric code
unblockCode-prompt-plaintext = Če je tako, je to overitvena koda, ki jo potrebujete: { $unblockCode }
unblockCode-report = Če to niste vi, nam pomagajte odgnati vsiljivce in <a data-l10n-name="reportSignInLink">nam prijavite poskus zlorabe</a>.
unblockCode-report-plaintext = Če to niste vi, nam pomagajte odgnati vsiljivce in nam prijavite poskus zlorabe.
verificationReminderFinal-subject = Zadnji opomnik za potrditev računa
verificationReminderFinal-description-2 = Pred nekaj tedni ste ustvarili { -product-mozilla-account }, vendar ga niste nikoli potrdili. Zaradi vaše varnosti bomo račun izbrisali, če ne bo potrjen v naslednjih 24 urah.
confirm-account = Potrdi račun
confirm-account-plaintext = { confirm-account }:
verificationReminderFirst-subject-2 = Ne pozabite potrditi svojega računa
verificationReminderFirst-title-3 = Dobrodošli pri { -brand-mozilla(sklon: "mestnik") }!
verificationReminderFirst-description-3 = Pred nekaj dnevi ste ustvarili { -product-mozilla-account }, vendar ga niste potrdili. Potrdite svoj račun v naslednjih 15 dneh, sicer bo samodejno izbrisan.
verificationReminderFirst-sub-description-3 = Ne zamudite brskalnika, ki postavlja vas in vašo zasebnost na prvo mesto.
confirm-email-2 = Potrdi račun
confirm-email-plaintext-2 = { confirm-email-2 }:
verificationReminderFirst-action-2 = Potrdi račun
verificationReminderSecond-subject-2 = Ne pozabite potrditi svojega računa
verificationReminderSecond-title-3 = Ne zamudite { -brand-mozilla(sklon: "rodilnik") }!
verificationReminderSecond-description-4 = Pred nekaj dnevi ste ustvarili { -product-mozilla-account }, vendar ga niste potrdili. Potrdite svoj račun v naslednjih 10 dneh, sicer bo samodejno izbrisan.
verificationReminderSecond-second-description-3 = Vaš { -product-mozilla-account } vam omogoča sinhronizacijo izkušnje s { -brand-firefox(sklon: "orodnik") } med napravami in dostop do več izdelkov { -brand-mozilla(sklon: "rodilnik") }, ki varujejo zasebnost.
verificationReminderSecond-sub-description-2 = Bodite del našega poslanstva spreminjanja interneta v prostor, odprt za vsakogar.
verificationReminderSecond-action-2 = Potrdi račun
verify-title-3 = Odprite internet z { -brand-mozilla(sklon: "orodnik") }
verify-description-2 = Potrdite svoj račun in kar najbolje izkoristite { -brand-mozilla(sklon: "tozilnik") } na vseh napravah, začenši z:
verify-subject = Dokončajte ustvarjanje računa
verify-action-2 = Potrdi račun
# Variables:
# $code (String) - The verification code
verifyAccountChange-subject = Za spremembo računa uporabite kodo { $code }
# Variables:
# $expirationTime (Number) - Represents the expiration time in minutes
verifyAccountChange-preview =
    { $expirationTime ->
        [one] Ta koda poteče čez { $expirationTime } minuto.
        [two] Ta koda poteče čez { $expirationTime } minuti.
        [few] Ta koda poteče čez { $expirationTime } minute.
       *[other] Ta koda poteče čez { $expirationTime } minut.
    }
verifyAccountChange-title = Ali spreminjate podatke o računu?
# After the colon is a description of the device used to sign in to the service
verifyAccountChange-safe = Pomagajte nam zaščititi vaš račun, tako da odobrite to spremembo, storjeno na naslednji napravi:
verifyAccountChange-prompt = Če da, uporabite to overitveno kodo:
# Variables:
# $expirationTime (Number) - Represents the expiration time in minutes
verifyAccountChange-expiry-notice =
    { $expirationTime ->
        [one] Poteče čez { $expirationTime } minuto.
        [two] Poteče čez { $expirationTime } minuti.
        [few] Poteče čez { $expirationTime } minute.
       *[other] Poteče čez { $expirationTime } minut.
    }
# Variables:
#  $clientName (String) - A client the user hasn't signed into before (e.g. Firefox, Sync)
verifyLogin-title-2 = Ali ste se vi prijavili v { $clientName }?
verifyLogin-description-2 = Pomagajte nam zaščititi vaš račun, tako da potrdite, da ste se vi prijavili v:
verifyLogin-subject-2 = Potrdi prijavo
verifyLogin-action = Potrdite prijavo
# Variables:
#  $code (String) - The confirmation code for sign-in
verifyLoginCode-subject-line-3 = Za prijavo uporabite kodo { $code }
verifyLoginCode-preview = Koda poteče čez 5 minut.
# Variables:
#  $serviceName (String) - A service the user hasn't signed into before (e.g. Firefox)
verifyLoginCode-title-2 = Ali ste se vi prijavili v { $serviceName }?
# After the colon is a description of the device used to sign in to the service
verifyLoginCode-safe = Pomagajte nam zaščititi vaš račun, tako da odobrite prijavo na naslednji napravi:
verifyLoginCode-prompt-3 = Če da, uporabite to overitveno kodo:
verifyLoginCode-expiry-notice = Poteče čez 5 minut.
verifyPrimary-title-2 = Potrdi glavni e-poštni naslov
verifyPrimary-description = Poslan je bil zahtevek za spremembo računa z naslednje naprave:
verifyPrimary-subject = Potrdi glavni e-poštni naslov
verifyPrimary-action-2 = Potrdi e-poštni naslov
verifyPrimary-action-plaintext-2 = { verifyPrimary-action-2 }:
verifyPrimary-post-verify-2 = Potem ko ga potrdite, bodo na tej napravi omogočene tudi spremembe računa, kot je dodajanje pomožnega e-poštnega naslova.
# Variables:
#  $code (String) - The confirmation code for secondary email
verifySecondaryCode-subject-2 = Za potrditev pomožnega e-poštnega naslova uporabite kodo { $code }
verifySecondaryCode-preview = Ta koda poteče čez 5 minut.
verifySecondaryCode-title-2 = Potrdi pomožni e-poštni naslov
verifySecondaryCode-action-2 = Potrdi e-poštni naslov
# Variables:
#  $email (string) A user's unverified secondary email address
verifySecondaryCode-explainer-2 = Poslana je bila zahteva za uporabo { $email } kot pomožni e-poštni naslov naslednjega { -product-mozilla-account(sklon: "rodilnik") }:
verifySecondaryCode-prompt-2 = Uporabite to potrditveno kodo:
verifySecondaryCode-expiry-notice-2 = Poteče čez 5 minut. Ko naslov potrdite, bo začel prejemati varnostna obvestila in potrditve.
# Variables:
#  $code (String) - comfirmation code for the account
verifyShortCode-subject-4 = Za potrditev računa uporabite kodo { $code }
verifyShortCode-preview-2 = Koda poteče čez 5 minut
verifyShortCode-title-3 = Odprite internet z { -brand-mozilla(sklon: "orodnik") }
# Information on the browser and device triggering this confirmation email follows below this string.
verifyShortCode-title-subtext-2 = Potrdite svoj račun in kar najbolje izkoristite { -brand-mozilla(sklon: "tozilnik") } na vseh napravah, začenši z:
verifyShortCode-prompt-3 = Uporabite to potrditveno kodo:
verifyShortCode-expiry-notice = Poteče čez 5 minut.
