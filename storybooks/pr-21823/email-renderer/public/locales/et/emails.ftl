## Email content
## Emails do not contain buttons, only links. Emails have a rich HTML version and a plaintext
## version. The strings are usually identical but sometimes they differ slightly.

fxa-header-sync-devices-image = <img data-l10n-name="sync-devices-image" alt="Sünkrooniseeri seadmed">
body-devices-image = <img data-l10n-name="devices-image" alt="Seadmed">
fxa-privacy-url = { -brand-mozilla } privaatsuspoliitika
moz-accounts-privacy-url-2 = { -product-mozilla-accounts(capitalization: "uppercase") } privaatsusteatis
moz-accounts-terms-url = { -product-mozilla-accounts(capitalization: "uppercase") } kasutustingimused
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
body-android-badge = <img data-l10n-name="google-play-badge" alt="Laadi { $productName } alla teenusest { -google-play }">
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
body-ios-badge = <img data-l10n-name="apple-app-badge" alt="Laadi { $productName } alla teenusest { -app-store }">
automated-email-support = Lisateabe saamiseks külasta <a data-l10n-name="supportLink">{ -brand-mozilla } kasutajatuge</a>.
#  After the colon, there's a link to https://accounts.firefox.com/settings/change_password
automated-email-not-authorized-plaintext = See on automaatne teavitus. Kui sa ei algatanud seda toimingut, siis palun muuda ära oma parool:
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
# - $uaOS: the user agent's operating system (e.g, MacOS)
# - $uaOSVersion - the user agent's operating system version
automatedEmailRecoveryKey-origin-device-all = See päring tuli { $uaBrowser } brauserilt { $uaOS } { $uaOSVersion } seadmes.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
# - $uaOS: the user agent's operating system (e.g, MacOS)
automatedEmailRecoveryKey-origin-device-browser-os = See päring tuli { $uaBrowser } brauserilt { $uaOS } seadmes.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
automatedEmailRecoveryKey-origin-device-browser-only = See päring tuli { $uaBrowser } brauserilt.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaOS: the user agent's operating system (e.g, MacOS)
# - $uaOSVersion - the user agent's operating system version
automatedEmailRecoveryKey-origin-device-OS-version-only = See päring tuli { $uaOS } { $uaOSVersion } seadmelt.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaOS: the user agent's operating system (e.g, MacOS)
automatedEmailRecoveryKey-origin-device-OS-only = See päring tuli { $uaOS } seadmelt.
automatedEmailRecoveryKey-delete-key-change-pwd = Kui see ei teinud sina, siis <a data-l10n-name="revokeAccountRecoveryLink">kustuta uus võti</a> ja <a data-l10n-name="passwordChangeLink">muuda oma parooli</a>.
# Colon is followed by user device info on a separate line (e.g., "Firefox Nightly on Mac OSX 10.11")
automatedEmailRecoveryKey-origin-plaintext = See päring tuli:
automated-email-reset =
    Tegemist on automaatselt saadetud kirjaga; kui sa pole seda toimingut lubanud, siis <a data-l10n-name="resetLink">palun lähtesta oma parool</a>.
    Lisateabe saamiseks külasta <a data-l10n-name="supportLink">{ -brand-mozilla } abikeskust</a>.
change-password-plaintext = Kui kahtlustad, et keegi teine püüab sinu kontot kasutada, siis palun vaheta ära parool.
manage-account = Konto haldamine
manage-account-plaintext = { manage-account }:
# Variables:
#  $uaBrowser (String) - User's browser, e.g. Firefox
#  $uaOS (String) - User's OS, e.g. Mac OSX
#  $uaOSVersion (String) - User's OS version, e.g. 10.11
device-all = { $uaBrowser } operatsioonisüsteemis { $uaOS } { $uaOSVersion }
# Variables:
#  $uaBrowser (String) - User's browser, e.g. Firefox
#  $uaOS (String) - User's OS, e.g. Mac OSX
device-browser-os = { $uaBrowser } operatsioonisüsteemis { $uaOS }
cadReminderFirst-action = Sünkroniseeri teine seade
cadReminderSecond-subject-2 = Ära jää ilma! Lõpetame sünkroniseerimise seadistamise
cadReminderSecond-action = Sünkroniseeri teine seade
cadReminderSecond-title-2 = Ära unusta sünkroniseerida!
cadReminderSecond-description-sync = Sünkroniseeri oma järjehoidjad, paroolid, avatud kaardid ja muud asjad — kõikjale, kust kasutad { -brand-firefox }i.
cadReminderSecond-description-plus = Lisaks on sinu andmed alati krüptitud. Ainult sina ja sinu heakskiidetud seadmed saavad neid näha.
# Variables:
# $clientName (String) - A client the user hasn't signed into before (e.g. Firefox, Sync)
newDeviceLogin-subject = { $clientName } - uus sisselogimine
newDeviceLogin-action = Halda kontot
passwordChangeRequired-subject = Tuvastati kahtlane tegevus
passwordChanged-subject = Parool uuendatud
passwordChanged-title = Parooli muutmine õnnestus
# Text for button action to create a new account recovery key
passwordResetWithRecoveryKeyPrompt-action = Loo konto taastevõti
# colon is followed by a link to create an account recovery key from the account settings page
passwordResetWithRecoveryKeyPrompt-action-txt = Konto taastevõtme loomine:
postAddAccountRecovery-subject-3 = Uus konto taastevõti on loodud
postAddAccountRecovery-title2 = Lõid uue konto taastevõtme
# Key here refers to account recovery key
postAddAccountRecovery-body-part1 = Salvesta see võti kindlasse kohta – seda on vaja krüpteeritud sirvimisandmete taastamiseks, kui peaksid parooli unustama.
# Key here refers to account recovery key
postAddAccountRecovery-body-part2 = Seda võtit saab kasutada ainult üks kord. Pärast selle kasutamist loome sulle automaatselt uue. Või saad igal ajal konto seadetes uue luua.
postAddAccountRecovery-action = Konto haldamine
postAddLinkedAccount-action = Halda kontot
# Links out to a support article about two factor authentication
postAddRecoveryPhone-how-protect = Kuidas see sinu kontot kaitseb
postAddRecoveryPhone-how-protect-plaintext = Kuidas see sinu kontot kaitseb:
postAddTwoStepAuthentication-action = Konto haldamine
postChangeAccountRecovery-body-part2 = Salvesta uus võti kindlasse kohta – seda on vaja krüpteeritud sirvimisandmete taastamiseks, kui peaksid parooli unustama.
postChangePrimary-subject = Peamine e-posti aadress on uuendatud
postChangePrimary-title = Uus peamine e-posti aadress
postChangePrimary-action = Konto haldamine
postConsumeRecoveryCode-action = Konto haldamine
postNewRecoveryCodes-action = Konto haldamine
postRemoveAccountRecovery-action = Konto haldamine
postRemoveSecondary-subject = Teine e-posti aadress eemaldati
postRemoveSecondary-title = Teine e-posti aadress eemaldati
postRemoveSecondary-action = Konto haldamine
postRemoveTwoStepAuthentication-action = Konto haldamine
postVerifySecondary-subject = Lisati teine e-posti aadress
postVerifySecondary-title = Lisati teine e-posti aadress
postVerifySecondary-action = Konto haldamine
recovery-subject = Lähtesta parool
recovery-action = Uue parooli loomine
unblockCode-title = Kas see on sinu sisselogimine?
unblockCode-prompt = Kui jah, siis siin on vajalik autoriseerimiskood:
# Variables:
#  $unblockCode (String) - An alphanumeric code
unblockCode-prompt-plaintext = Kui jah, siis siin on vajalik autoriseerimiskood: { $unblockCode }
unblockCode-report = Kui mitte, siis aita meil sissetungijaid tõrjuda ning <a data-l10n-name="reportSignInLink">teavita meid.</a>
unblockCode-report-plaintext = Kui mitte, siis aita meil sissetungijaid eemal hoida ning teavita meid.
verify-subject = Vii konto loomine lõpule
verifyLogin-action = Kinnita sisselogimine
verifyLoginCode-expiry-notice = See aegub 5 minuti pärast.
verifyPrimary-description = Nõue konto muutmiseks tehti järgmisest seadmest:
verifyPrimary-subject = Kinnita peamine e-posti aadress
verifyShortCode-expiry-notice = See aegub 5 minuti pärast.
