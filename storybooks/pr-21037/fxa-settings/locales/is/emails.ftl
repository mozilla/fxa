## Email content
## Emails do not contain buttons, only links. Emails have a rich HTML version and a plaintext
## version. The strings are usually identical but sometimes they differ slightly.

fxa-header-mozilla-logo = <img data-l10n-name="mozilla-logo" alt="{ -brand-mozilla } merki">
fxa-header-sync-devices-image = <img data-l10n-name="sync-devices-image" alt="Samstilla tæki">
body-devices-image = <img data-l10n-name="devices-image" alt="Tæki">
fxa-privacy-url = Persónuverndarstefna { -brand-mozilla }
moz-accounts-privacy-url-2 = Persónuverndarstefna { -product-mozilla-accounts(capitalization: "uppercase") }
moz-accounts-terms-url = Þjónustuskilmálar { -product-mozilla-accounts(capitalization: "uppercase") }
account-deletion-info-block-communications = Ef reikningnum þínum er eytt, færðu samt áfram tölvupósta frá Mozilla Corporation og Mozilla Foundation, nema þú <a data-l10n-name="unsubscribeLink">biðjir um að áskriftinni að þeim sé sagt upp</a>.
account-deletion-info-block-support = Ef þú hefur einhverjar spurningar eða þarft aðstoð, skaltu ekki hika við að hafa samband við <a data-l10n-name="supportLink">aðstoðarteymið okkar</a>.
account-deletion-info-block-communications-plaintext = Ef reikningnum þínum er eytt, færðu samt áfram tölvupósta frá Mozilla Corporation og Mozilla Foundation, nema þú biðjir um að áskriftinni að þeim sé sagt upp:
account-deletion-info-block-support-plaintext = Ef þú hefur einhverjar spurningar eða þarft aðstoð, skaltu ekki hika við að hafa samband við aðstoðarteymið okkar:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
body-android-badge = <img data-l10n-name="google-play-badge" alt="Sæktu { $productName } á { -google-play }">
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
body-ios-badge = <img data-l10n-name="apple-app-badge" alt="Sæktu { $productName } í { -app-store }">
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-desktop-device-2 = Settu { $productName } upp á <a data-l10n-name="anotherDeviceLink">annarri vinnutölvu</a>.
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-device-2 = Settu { $productName } upp á <a data-l10n-name="anotherDeviceLink">öðru tæki</a>.
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
android-download-plaintext = Náðu í { $productName } á Google Play:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
ios-download-plaintext = Sæktu { $productName } í App Store:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-device-plaintext = Settu upp { $productName } á öðru tæki:
automated-email-change-2 = Ef það varst ekki þú sem gerðir þessa aðgerð skaltu <a data-l10n-name="passwordChangeLink">breyta lykilorðinu þínu</a> strax.
automated-email-support = Til að sjá nánari upplýsingar, skaltu fara á <a data-l10n-name="supportLink">{ -brand-mozilla } aðstoðargáttina</a>.
# After the colon, there's a link to https://accounts.firefox.com/settings/change_password
automated-email-change-plaintext-2 = Ef það varst ekki þú sem gerðir þessa aðgerð skaltu breyta lykilorðinu þínu strax:
#  After the colon, there's a link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
automated-email-support-plaintext = Til að sjá nánari upplýsingar, skaltu fara á { -brand-mozilla } aðstoðargáttina:
automated-email-inactive-account = Þetta er sjálfvirkur tölvupóstur. Þú ert að fá hann vegna þess að þú ert með { -product-mozilla-account } og að liðin eru 2 ár síðan þú skráðir þig inn síðast.
# supportLink - https://support.mozilla.org/kb/im-having-problems-my-firefox-account
automated-email-no-action = { automated-email-no-action-plaintext }Til að sjá frekari upplýsingar, skaltu fara á <a data-l10n-name="supportLink">{ -brand-mozilla } aðstoðargáttina</a>.
automated-email-no-action-plaintext = Þetta er sjálfvirkur tölvupóstur. Ef þú fékkst hann fyrir mistök þarftu ekki að gera neitt.
#  After the colon, there's a link to https://accounts.firefox.com/settings/change_password
automated-email-not-authorized-plaintext = Þetta er sjálfvirkur tölvupóstur; ef þú leyfðir ekki þessa aðgerð skaltu endilega breyta lykilorðinu þínu:
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
# - $uaOS: the user agent's operating system (e.g, MacOS)
# - $uaOSVersion - the user agent's operating system version
automatedEmailRecoveryKey-origin-device-all = Þessi beiðni kom frá { $uaBrowser } á { $uaOS } { $uaOSVersion }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
# - $uaOS: the user agent's operating system (e.g, MacOS)
automatedEmailRecoveryKey-origin-device-browser-os = Þessi beiðni kom frá { $uaBrowser } á { $uaOS }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
automatedEmailRecoveryKey-origin-device-browser-only = Þessi beiðni kom frá { $uaBrowser }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaOS: the user agent's operating system (e.g, MacOS)
# - $uaOSVersion - the user agent's operating system version
automatedEmailRecoveryKey-origin-device-OS-version-only = Þessi beiðni kom frá { $uaOS } { $uaOSVersion }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaOS: the user agent's operating system (e.g, MacOS)
automatedEmailRecoveryKey-origin-device-OS-only = Þessi beiðni kom frá { $uaOS }.
automatedEmailRecoveryKey-delete-key-change-pwd = Ef þetta varst ekki þú, <a data-l10n-name="revokeAccountRecoveryLink">skaltu eyða nýja lyklinum</a> og <a data-l10n-name="passwordChangeLink">breyta lykilorðinu þínu</a>.
automatedEmailRecoveryKey-change-pwd-only = Ef þetta varst ekki þú, <a data-l10n-name="passwordChangeLink">skaltu breyta lykilorðinu þínu</a>.
automatedEmailRecoveryKey-more-info = Til að sjá nánari upplýsingar, skaltu fara á <a data-l10n-name="supportLink">{ -brand-mozilla } aðstoðargáttina</a>.
# Colon is followed by user device info on a separate line (e.g., "Firefox Nightly on Mac OSX 10.11")
automatedEmailRecoveryKey-origin-plaintext = Þessi beiðni kom frá:
# Colon is followed by a URL to the account recovery key section of account settings
automatedEmailRecoveryKey-notyou-delete-key-plaintext = Ef þetta varst ekki þú, skaltu eyða nýja lyklinum:
# Colon is followed by a URL to the change password section of account settings
automatedEmailRecoveryKey-notyou-change-pwd-only-plaintext = Ef þetta varst ekki þú, skaltu breyta lykilorðinu þínu:
# This string is shown on its own line, after automatedEmailRecoveryKey-notyou-delete-key-plaintext and its URL
# Colon is followed by a URL to the change password section of account settings
automatedEmailRecoveryKey-notyou-change-pwd-plaintext = og breyta lykilorðinu þínu:
# Colon is followed by a URL to Mozilla Support's "I'm having problems with my account" page
automatedEmailRecoveryKey-more-info-plaintext = Til að sjá nánari upplýsingar, skaltu fara á { -brand-mozilla } aðstoðargáttina:
automated-email-reset =
    Þetta er sjálfvirkur tölvupóstur; ef þú heimilaðir ekki þessa aðgerð, skaltu <a data-l10n-name="resetLink">endurstilla lykilorðið þitt</a>.
    Til að sjá frekari upplýsingar, geturðu farið á <a data-l10n-name="supportLink">{ -brand-mozilla } Support aðstoðargáttina</a>.
# Variables:
#  $resetLink (String) - Link to https://accounts.firefox.com/reset_password
automated-email-reset-plaintext-v2 = Ef það varst ekki þú sem leyfðir þessa aðgerð, þá skaltu endurstilla lykilorðið þitt núna á { $resetLink }
# Followed by link to https://accounts.firefox.com/reset_password
automated-email-reset-pwd-plaintext-v3 = Ef það varst ekki þú sem gerðir þessa aðgerð skaltu endurstilla lykilorðið þitt strax:
brand-banner-message = Vissir þú að við breyttum nafni okkar úr { -product-firefox-accounts } í { -product-mozilla-accounts }? <a data-l10n-name="learnMore">Frekari upplýsingar</a>
change-password-plaintext = Ef þig grunar að einhver sé að reyna að fá aðgang að notandaaðgangnum þínum, skaltu endurstilla lykilorðið þitt.
manage-account = Sýsla með reikning
manage-account-plaintext = { manage-account }:
# Variables:
#  $uaBrowser (String) - User's browser, e.g. Firefox
#  $uaOS (String) - User's OS, e.g. Mac OSX
#  $uaOSVersion (String) - User's OS version, e.g. 10.11
device-all = { $uaBrowser } á { $uaOS } { $uaOSVersion }
# Variables:
#  $uaBrowser (String) - User's browser, e.g. Firefox
#  $uaOS (String) - User's OS, e.g. Mac OSX
device-browser-os = { $uaBrowser } á { $uaOS }
# Variables:
#  $city (String) - User's city
#  $stateCode (String) - User's state
#  $country (String) - User's country
location-all = { $city }, { $stateCode }, { $country } (áætlað)
# Variables:
#  $city (String) - User's city
#  $country (String) - User's country
location-city-country = { $city }, { $country } (áætlað)
# Variables:
#  $stateCode (String) - User's state
#  $country (String) - User's country
location-state-country = { $stateCode }, { $country } (áætlað)
# Variables:
#  $country (stateCode) - User's country
location-country = { $country } (áætlað)
cadReminderFirst-subject-1 = Áminning! Við ættum að samstilla { -brand-firefox }
cadReminderFirst-action = Samstilla annað tæki
cadReminderFirst-action-plaintext = { cadReminderFirst-action }:
# In the title of the email, "It takes two to sync", "two" refers to syncing two devices
cadReminderFirst-title-1 = Það þarf tvennt til að samstilla
cadReminderFirst-description-v2 = Taktu flipana með þér yfir á öll tækin þín. Fáðu bókamerkin þín, lykilorð og önnur gögn hvert sem þú notar { -brand-firefox }.
cadReminderSecond-subject-2 = Ekki missa af! Ljúkum við uppsetningu samstillingar hjá þér
cadReminderSecond-action = Samstilla annað tæki
cadReminderSecond-title-2 = Ekki gleyma að samstilla!
cadReminderSecond-description-sync = Samstilltu bókamerkin og lykilorðin þín, allsstaðar þar sem þú notar { -brand-firefox }.
cadReminderSecond-description-plus = Auk þess eru gögnin þín alltaf dulrituð. Aðeins þú og tæki sem þú samþykkir geta séð þau.
inactiveAccountFinalWarning-subject = Síðasti séns til að halda { -product-mozilla-account }-reikningnum þínum
inactiveAccountFinalWarning-title = { -brand-mozilla }-reikningnum þínum og tengdum gögnum verður eytt
inactiveAccountFinalWarning-preview = Skráðu þig inn til að halda reikningnum þínum
inactiveAccountFinalWarning-account-description = { -product-mozilla-account } er notað til að fá aðgang að ókeypis persónuverndar- og vafraþjónustu á borð við { -brand-firefox }-samstillingu, { -product-mozilla-monitor }, { -product-firefox-relay } og { -product-mdn }.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
# This date will already be formatted with moment.js into Thursday, Jan 9, 2025 format
inactiveAccountFinalWarning-impact = Þann <strong>{ $deletionDate }</strong> verður reikningnum þínum og persónulegum gögnum eytt varanlega nema þú skráir þig inn.
inactiveAccountFinalWarning-action = Skráðu þig inn til að halda reikningnum þínum
# followed by link to sign in
inactiveAccountFinalWarning-action-plaintext = Skráðu þig inn til að halda reikningnum þínum:
inactiveAccountFirstWarning-subject = Ekki tapa reikningnum þínum
inactiveAccountFirstWarning-title = Viltu halda { -brand-mozilla }-reikningnum þínum og tengdum gögnum?
inactiveAccountFirstWarning-account-description-v2 = { -product-mozilla-account } er notað til að fá aðgang að ókeypis persónuverndar- og vafraþjónustu á borð við { -brand-firefox }-samstillingu, { -product-mozilla-monitor }, { -product-firefox-relay } og { -product-mdn }.
inactiveAccountFirstWarning-inactive-status = Við höfum tekið eftir því að þú hefur ekki skráð þig inn í 2 ár.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
# This date will already be formatted with moment.js into Thursday, Jan 9, 2025 format
inactiveAccountFirstWarning-impact = Reikningnum þínum og persónulegum gögnum verður varanlega eytt þann <strong>{ $deletionDate }</strong> vegna þess að langt er síðan þú hefur notað þetta.
inactiveAccountFirstWarning-action = Skráðu þig inn til að halda reikningnum þínum
inactiveAccountFirstWarning-preview = Skráðu þig inn til að halda reikningnum þínum
# followed by link to sign in
inactiveAccountFirstWarning-action-plaintext = Skráðu þig inn til að halda reikningnum þínum:
inactiveAccountSecondWarning-subject = Aðgerðar krafist: Reikningi verður eytt eftir 7 daga
inactiveAccountSecondWarning-title = { -brand-mozilla }-reikningnum þínum og tengdum gögnum verður eytt eftir 7 daga
inactiveAccountSecondWarning-account-description-v2 = { -product-mozilla-account } er notað til að fá aðgang að ókeypis persónuverndar- og vafraþjónustu á borð við { -brand-firefox }-samstillingu, { -product-mozilla-monitor }, { -product-firefox-relay } og { -product-mdn }.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
inactiveAccountSecondWarning-impact = Reikningnum þínum og persónulegum gögnum verður varanlega eytt þann <strong>{ $deletionDate }</strong> vegna þess að langt er síðan þú hefur notað þetta.
inactiveAccountSecondWarning-action = Skráðu þig inn til að halda reikningnum þínum
inactiveAccountSecondWarning-preview = Skráðu þig inn til að halda reikningnum þínum
# followed by link to sign in
inactiveAccountSecondWarning-action-plaintext = Skráðu þig inn til að halda reikningnum þínum:
# The user has a low number of valid recovery codes remaining for use
codes-reminder-title-zero = Þú ert búinn með alla varaauðkenningarkóða!
codes-reminder-title-one = Þú ert á síðasta varaauðkenningarkóðanum þínum
codes-reminder-title-two = Tími til kominn að búa til fleiri varaauðkenningarkóða
codes-reminder-description-part-one = Varaauðkenningarkóðar hjálpa þér að endurheimta upplýsingarnar þínar þegar þú gleymir lykilorðinu þínu.
codes-reminder-description-part-two = Útbúðu nýja kóða núna svo þú tapir ekki gögnunum þínum síðar.
codes-reminder-description-two-left = Þú átt aðeins tvo kóða eftir.
codes-reminder-description-create-codes = Búðu til nýja varaauðkenningarkóða til að hjálpa þér að komast aftur inn á reikninginn þinn ef þú lokast úti.
lowRecoveryCodes-action-2 = Útbúa kóða
codes-create-plaintext = { lowRecoveryCodes-action-2 }:
lowRecoveryCodes-subject-2 =
    { $numberRemaining ->
        [0] Enginn varaauðkenningarkóði eftir
        [one] Aðeins 1 varaauðkenningarkóði eftir
       *[other] Aðeins { $numberRemaining } varaauðkenningarkóðar eftir!
    }
# Variables:
# $clientName (String) - A client the user hasn't signed into before (e.g. Firefox, Sync)
newDeviceLogin-subject = Ný innskráning á { $clientName }
newDeviceLogin-subjectForMozillaAccount = Ný innskráning á { -product-mozilla-account }-reikninginn þinn
newDeviceLogin-title-3 = { -product-mozilla-account } þinn var notaður til að skrá þig inn
# The "Not you?" question is asking whether the recipient of the email is the
# person who performed the action that triggered the email.
newDeviceLogin-change-password = Ekki þú? <a data-l10n-name="passwordChangeLink">Breyttu lykilorðinu þínu</a>.
# The "Not you?" question is asking whether the recipient of the email is the
# person who performed the action that triggered the email.
newDeviceLogin-change-password-plain = Ekki þú? Breyttu lykilorðinu þínu:
newDeviceLogin-action = Sýsla með reikning
passwordChangeRequired-subject = Vart við grunsamlega virkni
passwordChangeRequired-action = Endurstilla lykilorð
passwordChangeRequired-action-plaintext = { passwordChangeRequired-action }:
passwordChanged-subject = Lykilorð uppfært
passwordChanged-title = Tókst að breyta lykilorði
passwordChanged-description-2 = Lykilorðinu fyrir { -product-mozilla-account } þinn var breytt af eftirfarandi tæki:
password-forgot-otp-title = Gleymdirðu lykilorðinu þínu?
password-forgot-otp-request = Við fengum beiðni um breytingu á lykilorði á { -product-mozilla-account }-reikningnum þínum frá:
password-forgot-otp-code-2 = Ef þetta varst þú, þá er hér staðfestingarkóði þinn til að halda áfram:
password-forgot-otp-expiry-notice = Þessi kóði rennur út eftir 10 mínútur.
passwordReset-subject-2 = Lykilorðið þitt var endurstillt
passwordReset-title-2 = Lykilorðið þitt var endurstillt
# This sentence is followed by information about the device and time of the password reset
passwordReset-description-2 = Þú endurstilltir { -product-mozilla-account } lykilorðið þitt á:
passwordResetAccountRecovery-subject-2 = Lykilorðið þitt var endurstillt
passwordResetAccountRecovery-title-3 = Lykilorðið þitt var endurstillt
# Followed by details on the device, location, and date/time of the password reset.
passwordResetAccountRecovery-description-3 = Þú notaðir endurheimtulykil reikningsins þíns til að uppfæra { -product-mozilla-account } lykilorðið þitt á:
passwordResetAccountRecovery-information = Við skráðum þig út úr öllum samstilltu tækjunum þínum. Við bjuggum til nýjan endurheimtulykil í stað þess sem þú notaðir. Þú getur breytt þessu í reikningsstillingunum þínum.
# After the colon there is a link to account settings
passwordResetAccountRecovery-information-txt = Við skráðum þig út úr öllum samstilltu tækjunum þínum. Við bjuggum til nýjan endurheimtulykil í stað þess sem þú notaðir. Þú getur breytt þessu í reikningsstillingunum þínum:
passwordResetAccountRecovery-action-4 = Sýsla með reikning
passwordResetRecoveryPhone-subject = Endurheimtusímanúmer sem var notað
passwordResetRecoveryPhone-preview = Göngum úr skugga um að þetta hafi verið þú
passwordResetRecoveryPhone-action = Sýsla með reikning
passwordResetWithRecoveryKeyPrompt-subject = Lykilorðið þitt var endurstillt
passwordResetWithRecoveryKeyPrompt-title = Lykilorðið þitt var endurstillt
# Details of the device and date/time where the password was reset
passwordResetWithRecoveryKeyPrompt-description = Þú endurstilltir { -product-mozilla-account } lykilorðið þitt á:
# Text for button action to create a new account recovery key
passwordResetWithRecoveryKeyPrompt-action = Útbúðu endurheimtulykil reiknings
# colon is followed by a link to create an account recovery key from the account settings page
passwordResetWithRecoveryKeyPrompt-action-txt = Útbúðu endurheimtulykil reiknings:
passwordResetWithRecoveryKeyPrompt-cta-description = Þú þarft að skrá þig inn aftur á öllum samstilltu tækjunum þínum. Næst skaltu halda gögnunum þínum öruggum með endurheimtulykli. Þetta gerir þér kleift að endurheimta gögnin þín ef þú gleymir lykilorðinu þínu.
postAddAccountRecovery-subject-3 = Nýr endurheimtulykill reiknings útbúinn
postAddAccountRecovery-title2 = Þú bjóst til nýjan endurheimtulykil fyrir reikninginn
# Key here refers to account recovery key
postAddAccountRecovery-body-part1 = Vistaðu þennan lykil á öruggum stað - þú þarft hann til að endurheimta dulrituðu vafragögnin þín ef þú gleymir lykilorðinu þínu.
# Key here refers to account recovery key
postAddAccountRecovery-body-part2 = Aðeins er hægt að nota þennan lykil einu sinni. Eftir að þú hefur notað hann munum við sjálfkrafa búa til nýjan fyrir þig. Eða þú getur búið til nýjan hvenær sem er í stillingum reikningsins þíns.
postAddAccountRecovery-action = Sýsla með reikning
postAddLinkedAccount-subject-2 = Nýr reikningur tengdur við { -product-mozilla-account }
#  Variables:
#  $providerName (String) - The name of the provider, e.g. Apple, Google
postAddLinkedAccount-title-2 = { $providerName } reikningurinn þinn hefur verið tengdur við { -product-mozilla-account }
postAddLinkedAccount-action = Sýsla með aðgang
postAddRecoveryPhone-subject = Endurheimtusímanúmeri bætt við
postAddRecoveryPhone-preview = Reikningur er varinn með tveggja-þrepa auðkenningu
postAddRecoveryPhone-title-v2 = Þú bættir við endurheimtusímanúmeri
# Variables:
#  $maskedLastFourPhoneNumber (String) - A bullet point mask with the last four digits of the user's phone number, e.g. ••••••1234
postAddRecoveryPhone-description-v2 = Þú bættir { $maskedLastFourPhoneNumber } við sem endurheimtusímanúmeri
# Links out to a support article about two factor authentication
postAddRecoveryPhone-how-protect = Hvernig þetta verndar reikninginn þinn
postAddRecoveryPhone-how-protect-plaintext = Hvernig þetta verndar reikninginn þinn:
postAddRecoveryPhone-enabled-device = Þú virkjaðir það frá:
postAddRecoveryPhone-action = Sýsla með reikning
postAddTwoStepAuthentication-title-2 = Þú kveiktir á tveggja-þrepa auðkenningu
postAddTwoStepAuthentication-action = Sýsla með reikning
postChangeAccountRecovery-subject = Endurheimtulykli reiknings breytt
postChangeAccountRecovery-title = Þú breyttir endurheimtulykli reikningsins þíns
postChangeAccountRecovery-body-part1 = Þú ert nú með nýjan endurheimtulykil. Fyrri lyklinum þínum var eytt.
postChangeAccountRecovery-body-part2 = Vistaðu þennan nýja lykil á öruggum stað - þú þarft hann til að endurheimta dulrituðu vafragögnin þín ef þú gleymir lykilorðinu þínu.
postChangeAccountRecovery-action = Sýsla með reikning
postChangePrimary-subject = Aðaltölvupóstfang uppfært
postChangePrimary-title = Nýtt aðaltölvupóstfang
# Variables:
#  $email (String) - A user's email address
postChangePrimary-description-2 = Þú hefur náð að breyta aðaltölvupóstfanginu þínu í { $email }. Þetta póstfang er nú notandanafnið sem þú notar til að skrá þig inn á { -product-mozilla-account }, ásamt því að þarna færðu öryggistilkynningar og staðfestingar á innskráningu.
postChangePrimary-action = Sýsla með reikning
postChangeRecoveryPhone-subject = Endurheimtusímanúmer uppfært
postChangeRecoveryPhone-preview = Reikningur er varinn með tveggja-þrepa auðkenningu
postChangeRecoveryPhone-title = Þú breyttir endurheimtusímanúmerinu þínu
postChangeRecoveryPhone-description = Þú ert nú með nýtt endurheimtusímanúmer. Fyrra endurheimtusímanúmeri þínu var eytt.
postChangeRecoveryPhone-requested-device = Þú baðst um það frá:
postConsumeRecoveryCode-title-3 = Varaauðkenningarkóðinn þinn var notaður til að staðfesta endurstillingu lykilorðsins
# After the colon, there is description of the device that the backup authentication code was used on
# E.g., Firefox Nightly on Mac OSX, Thursday Sept 2, 2024
postConsumeRecoveryCode-description-3 = Kóði notaður frá:
postConsumeRecoveryCode-action = Sýsla með reikning
postConsumeRecoveryCode-subject-v3 = Varaauðkenningarkóði sem var notaður
postConsumeRecoveryCode-preview = Göngum úr skugga um að þetta hafi verið þú
postNewRecoveryCodes-subject-2 = Nýjir varaauðkenningarkóðar búnir til
postNewRecoveryCodes-title-2 = Þú bjóst til varaauðkenningarkóða
# After the colon, there is information about the device that the authentication codes were created on
postNewRecoveryCodes-description-2 = Þau voru búin til á:
postNewRecoveryCodes-action = Sýsla með reikning
postRemoveAccountRecovery-subject-2 = Endurheimtulykli reiknings eytt
postRemoveAccountRecovery-title-3 = Þú eyddir endurheimtulykli fyrir reikninginn þinn
postRemoveAccountRecovery-body-part1 = Endurheimtulykillinn þinn er nauðsynlegur til að endurheimta dulrituðu vafragögnin þín ef þú gleymir lykilorðinu þínu.
postRemoveAccountRecovery-body-part2 = Ef þú hefur ekki gert það nú þegar skaltu búa til nýjan endurheimtulykil í stillingum reikningsins þíns til að koma í veg fyrir að vistuð lykilorð þín, bókamerki, vafurferill og fleira glatist.
postRemoveAccountRecovery-action = Sýsla með reikning
postRemoveRecoveryPhone-subject = Endurheimtusímanúmer fjarlægt
postRemoveRecoveryPhone-preview = Reikningur er varinn með tveggja-þrepa auðkenningu
postRemoveRecoveryPhone-title = Endurheimtusímanúmer fjarlægt
postRemoveRecoveryPhone-requested-device = Þú baðst um það frá:
postRemoveSecondary-subject = Aukatölvupóstfang fjarlægt
postRemoveSecondary-title = Aukatölvupóstfang fjarlægt
# Variables:
#  $secondaryEmail (String) - A user's email address
postRemoveSecondary-description-2 = Þú hefur fjarlægt { $secondaryEmail } sem aukapóstfang fyrir { -product-mozilla-account }. Öryggistilkynningar og staðfestingar á innskráningu verða ekki lengur sendar á þetta tölvupóstfang.
postRemoveSecondary-action = Sýsla með reikning
postRemoveTwoStepAuthentication-subject-line-2 = Slökkt er á tveggja-þrepa auðkenningu
postRemoveTwoStepAuthentication-title-2 = Þú slökktir á tveggja-þrepa auðkenningu
# After the colon is a description of the device the user used to disable two-step authentication
postRemoveTwoStepAuthentication-from-device = Þú gerðir hana óvirka frá:
postRemoveTwoStepAuthentication-action = Sýsla með reikning
postRemoveTwoStepAuthentication-not-required-2 = Þú þarft ekki lengur öryggiskóða úr auðkenningarforritinu þínu þegar þú skráir þig inn.
postSigninRecoveryCode-subject = Varaauðkenningarkóði sem notaður var til innskráningar
postSigninRecoveryCode-preview = Staðfestu virkni á reikningi
postSigninRecoveryCode-title = Varaauðkenningarkóðinn þinn var notaður til innskráningar
postSigninRecoveryCode-description = Ef það varst ekki þú sem gerðir það, ættirðu að breyta lykilorðinu þínu strax til að halda reikningnum þínum öruggum.
postSigninRecoveryCode-device = Þú skráðir þig inn frá:
postSigninRecoveryCode-action = Sýsla með reikning
postSigninRecoveryPhone-subject = Endurheimtusímanúmer notað til að skrá inn
postSigninRecoveryPhone-preview = Staðfestu virkni á reikningi
postSigninRecoveryPhone-title = Endurheimtusímanúmerið þitt var notað til að skrá inn
postSigninRecoveryPhone-description = Ef það varst ekki þú sem gerðir það, ættirðu að breyta lykilorðinu þínu strax til að halda reikningnum þínum öruggum.
postSigninRecoveryPhone-device = Þú skráðir þig inn frá:
postSigninRecoveryPhone-action = Sýsla með reikning
postVerify-sub-title-3 = Við erum ánægð að sjá þig!
postVerify-title-2 = Viltu sjá sama flipa á tveimur tækjum?
postVerify-description-2 = Það er einfalt! Settu bara { -brand-firefox } upp á öðru tæki og skráðu þig inn til að samstilla. Það virkar eins og galdrar!
postVerify-sub-description = (Psst… Það þýðir líka að þú getur náð í bókamerkin þín, lykilorð og önnur { -brand-firefox } gögn hvar sem þú ert skráð/ur inn.)
postVerify-subject-4 = Velkomin í { -brand-mozilla }!
postVerify-setup-2 = Tengja annað tæki:
postVerify-action-2 = Tengja annað tæki
postVerifySecondary-subject = Aukapóstfangi bætt við
postVerifySecondary-title = Aukapóstfangi bætt við
# Variables:
#  $secondaryEmail (String) - A user's secondary email address
postVerifySecondary-content-3 = Þú hefur staðfest { $secondaryEmail } sem aukapóstfang fyrir { -product-mozilla-account }. Öryggistilkynningar og staðfestingar á innskráningu verða nú sendar á bæði tölvupóstföngin.
postVerifySecondary-action = Sýsla með reikning
recovery-subject = Endurstilla lykilorð
recovery-title-2 = Gleymt lykilorð?
# Information on the device, location, and date and time of the request that triggered the email follows.
recovery-request-origin-2 = Við fengum beiðni um breytingu á lykilorði á { -product-mozilla-account }-reikningnum þínum frá:
recovery-new-password-button = Búðu til nýtt lykilorð með því að smella á hnappinn hér fyrir neðan. Þessi tengill mun renna út innan klukkustundar.
recovery-copy-paste = Búðu til nýtt lykilorð með því að afrita og líma slóðina hér að neðan í vafrann þinn. Þessi tengill mun renna út innan klukkustundar.
recovery-action = Búa til nýtt lykilorð
unblockCode-title = Er þetta þú að skrá þig inn?
unblockCode-prompt = Ef já, þá er hérna auðkenningarkóðinn sem þú þarft:
# Variables:
#  $unblockCode (String) - An alphanumeric code
unblockCode-prompt-plaintext = Ef já, þá er hérna auðkenningarkóðinn sem þú þarft: { $unblockCode }
unblockCode-report = Ef nei, hjálpaðu okkur að verjast boðflennum með því að <a data-l10n-name="reportSignInLink">tilkynna okkur þetta.</a>
unblockCode-report-plaintext = Ef nei, hjálpaðu okkur að verjast boðflennum með því að tilkynna okkur þetta.
verificationReminderFinal-subject = Lokaáminning um að staðfesta reikninginn þinn
verificationReminderFinal-description-2 = Fyrir nokkrum vikum síðan stofnaðir þú { -product-mozilla-account } en staðfestir hann aldrei. Til að gæta öryggis þíns, munum við eyða reikningnum ef hann er ekki staðfestur innan 24 klukkustunda.
confirm-account = Staðfesta reikning
confirm-account-plaintext = { confirm-account }:
verificationReminderFirst-subject-2 = Mundu að staðfesta reikninginn þinn
verificationReminderFirst-title-3 = Velkomin í { -brand-mozilla }!
verificationReminderFirst-description-3 = Fyrir nokkrum dögum bjóstu til { -product-mozilla-account }, en staðfestir hann aldrei. Staðfestu reikninginn þinn innan 15 daga eða honum verður sjálfkrafa eytt.
verificationReminderFirst-sub-description-3 = Ekki missa af tækni sem setur þig og friðhelgi þína í fyrsta sæti.
confirm-email-2 = Staðfesta reikning
confirm-email-plaintext-2 = { confirm-email-2 }:
verificationReminderFirst-action-2 = Staðfesta reikning
verificationReminderSecond-subject-2 = Mundu að staðfesta reikninginn þinn
verificationReminderSecond-title-3 = Ekki missa af { -brand-mozilla }!
verificationReminderSecond-description-4 = Fyrir nokkrum dögum bjóstu til { -product-mozilla-account }, en staðfestir hann aldrei. Staðfestu reikninginn þinn innan 10 daga eða honum verður sjálfkrafa eytt.
verificationReminderSecond-second-description-3 = { -product-mozilla-account } gerir þér kleift að samstilla { -brand-firefox }-upplýsingarnar þínar á milli tækja og opnar aðgang að meiri persónuverndandi hugbúnaði frá { -brand-mozilla }.
verificationReminderSecond-sub-description-2 = Vertu hluti af verkefni okkar að breyta internetinu í stað sem er opinn fyrir alla.
verificationReminderSecond-action-2 = Staðfesta reikning
verify-title-3 = Opnaðu internetið með { -brand-mozilla }
verify-description-2 = Staðfestu reikninginn þinn og fáðu sem mest út úr { -brand-mozilla } hvar sem þú skráir þig inn, til dæmis fyrst á:
verify-subject = Ljúktu við að búa til reikninginn þinn
verify-action-2 = Staðfesta reikning
# Variables:
#  $clientName (String) - A client the user hasn't signed into before (e.g. Firefox, Sync)
verifyLogin-title-2 = Skráðir þú þig inn á { $clientName }?
verifyLogin-description-2 = Hjálpaðu okkur að halda reikningnum þínum öruggum með því að staðfesta að þú hafir skráð þig inn á:
verifyLogin-subject-2 = Staðfestu innskráningu
verifyLogin-action = Staðfesta innskráningu
# Variables:
#  $serviceName (String) - A service the user hasn't signed into before (e.g. Firefox)
verifyLoginCode-title-2 = Skráðir þú þig inn á { $serviceName }?
# After the colon is a description of the device used to sign in to the service
verifyLoginCode-safe = Hjálpaðu okkur að halda reikningnum þínum öruggum með því að staðfesta innskráninguna þína á:
verifyLoginCode-prompt-3 = Ef já, þá er hérna auðkenningarkóðinn:
verifyLoginCode-expiry-notice = Hann rennur út eftir 5 mínútur.
verifyPrimary-title-2 = Staðfestu aðaltölvupóstfangið
verifyPrimary-description = Beiðni um að breyta reikningi hefur verið gerð úr eftirfarandi tæki:
verifyPrimary-subject = Staðfestu aðaltölvupóstfang
verifyPrimary-action-2 = Staðfestu tölvupóstfangið
verifyPrimary-action-plaintext-2 = { verifyPrimary-action-2 }:
verifyPrimary-post-verify-2 = Þegar staðfesting hefur farið fram, verða mögulegar ýmsar breytingar á borð við að bæta við aukapóstfangi af þessu tæki.
verifySecondaryCode-title-2 = Staðfestu aukatölvupóstfang
verifySecondaryCode-action-2 = Staðfestu tölvupóstfangið
# Variables:
#  $email (string) A user's unverified secondary email address
verifySecondaryCode-explainer-2 = Beiðni um að nota { $email } sem aukatölvupóstfang hefur verið gerð úr eftirfarandi { -product-mozilla-account }-reikningi:
verifySecondaryCode-prompt-2 = Notaðu þennan staðfestingarkóða:
verifySecondaryCode-expiry-notice-2 = Hann rennur út eftir 5 mínútur. Eftir að tölvupóstfangið hefur verið staðfest, mun það fara að fá öryggistilkynningar og staðfestingar.
verifyShortCode-title-3 = Opnaðu internetið með { -brand-mozilla }
# Information on the browser and device triggering this confirmation email follows below this string.
verifyShortCode-title-subtext-2 = Staðfestu reikninginn þinn og fáðu sem mest út úr { -brand-mozilla } hvar sem þú skráir þig inn, til dæmis fyrst á:
verifyShortCode-prompt-3 = Notaðu þennan staðfestingarkóða:
verifyShortCode-expiry-notice = Hann rennur út eftir 5 mínútur.
