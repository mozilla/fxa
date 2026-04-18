## Email content
## Emails do not contain buttons, only links. Emails have a rich HTML version and a plaintext
## version. The strings are usually identical but sometimes they differ slightly.

fxa-header-mozilla-logo = <img data-l10n-name="mozilla-logo" alt="logo { -brand-mozilla }">
fxa-header-sync-devices-image = <img data-l10n-name="sync-devices-image" alt="Cydweddu dyfeisiau">
body-devices-image = <img data-l10n-name="devices-image" alt="Dyfeisiau">
fxa-privacy-url = Polisi Preifatrwydd { -brand-mozilla }
moz-accounts-privacy-url-2 = Hysbysiad Preifatrwydd { -product-mozilla-accounts(cyfalafu: "uppercase") }
moz-accounts-terms-url = Amodau Gwasanaeth { -product-mozilla-accounts(capitalization: "uppercase") }
account-deletion-info-block-communications = Os caiff eich cyfrif ei ddileu, byddwch yn dal i dderbyn e-byst gan y Mozilla Corporation a'r Mozilla Foundation, oni bai eich bod <a data-l10n-name="unsubscribeLink">yn gofyn i ddad-danysgrifio</a>.
account-deletion-info-block-support = Os oes gennych unrhyw gwestiynau, teimlwch yn rydd i gysyllu â'n <a data-l10n-name="supportLink">tîm cymorth</a>.
account-deletion-info-block-communications-plaintext = Os caiff eich cyfrif ei ddileu, byddwch yn dal i dderbyn e-byst gan y Mozilla Corporation a'r Mozilla Foundation, oni bai eich bod yn gofyn i gael dad-danysgrifio:
account-deletion-info-block-support-plaintext = Os oes gennych unrhyw gwestiynau neu os oes angen cymorth arnoch, mae croeso i chi gysylltu â'n tîm cymorth:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
body-android-badge = <img data-l10n-name="google-play-badge" alt="Llwytho { $productName }  i lawr o { -google-play }">
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
body-ios-badge = <img data-l10n-name="apple-app-badge" alt="Llwytho { $productName }  i lawr o { -app-store }">
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-desktop-device-2 = Gosod { $productName } ar <a data-l10n-name="anotherDeviceLink">ddyfais bwrdd gwaith arall</a>.
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-device-2 = Gosod { $productName } ar <a data-l10n-name="anotherDeviceLink">ddyfais arall</a>.
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
android-download-plaintext = Cael { $productName } o Google Play:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
ios-download-plaintext = Llwythwch { $productName } i awr o'r App Store:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-device-plaintext = Gosodwch { $productName } ar ddyfais arall:
automated-email-change-2 = Os nad chi wnaeth hyn, <a data-l10n-name="passwordChangeLink">newidiwch eich cyfrinair</a> ar unwaith.
automated-email-support = Am ragor o wybodaeth, ewch i <a data-l10n-name="supportLink">{ -brand-mozilla } Cefnogaeth</a>.
# After the colon, there's a link to https://accounts.firefox.com/settings/change_password
automated-email-change-plaintext-2 = Os nad chi wnaeth hyn, newidiwch eich cyfrinair ar unwaith:
#  After the colon, there's a link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
automated-email-support-plaintext = Am ragor o wybodaeth, ewch i { -brand-mozilla } Cefnogaeth:
automated-email-inactive-account = E-bost awtomatig yw hwn. Rydych yn ei dderbyn oherwydd bod gennych chi gyfrif { -product-mozilla-account } ac mae'n 2 flynedd ers i chi fewngofnodi diwethaf.
# supportLink - https://support.mozilla.org/kb/im-having-problems-my-firefox-account
automated-email-no-action = { automated-email-no-action-plaintext } Am ragor o wybodaeth, ewch i <a data-l10n-name="supportLink">Cefnogaeth { -brand-mozilla }</a>.
automated-email-no-action-plaintext = Mae hwn yn e-bost awtomataidd. Os gwnaethoch ei dderbyn trwy gamgymeriad, nid oes angen i chi wneud dim.
#  After the colon, there's a link to https://accounts.firefox.com/settings/change_password
automated-email-not-authorized-plaintext = E-bost awtomataidd yw hwn; os na wnaethoch awdurdodi'r weithred hon, yna newidiwch eich cyfrinair:
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
# - $uaOS: the user agent's operating system (e.g, MacOS)
# - $uaOSVersion - the user agent's operating system version
automatedEmailRecoveryKey-origin-device-all = Daeth y cais hwn gan { $uaBrowser } ar { $uaOS } { $uaOSVersion }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
# - $uaOS: the user agent's operating system (e.g, MacOS)
automatedEmailRecoveryKey-origin-device-browser-os = Daeth y cais hwn gan { $uaBrowser } ar { $uaOS }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
automatedEmailRecoveryKey-origin-device-browser-only = Daeth y cais hwn gan { $uaBrowser }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaOS: the user agent's operating system (e.g, MacOS)
# - $uaOSVersion - the user agent's operating system version
automatedEmailRecoveryKey-origin-device-OS-version-only = Daeth y cais hwn gan { $uaOS } { $uaOSVersion }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaOS: the user agent's operating system (e.g, MacOS)
automatedEmailRecoveryKey-origin-device-OS-only = Daeth y cais hwn gan { $uaOS }.
automatedEmailRecoveryKey-delete-key-change-pwd = Os nad chi oedd hwn, <a data-l10n-name="revokeAccountRecoveryLink">dilëwch yr allwedd newydd</a> a <a data-l10n-name="passwordChangeLink">newidiwch eich cyfrinair</a>.
automatedEmailRecoveryKey-change-pwd-only = Os nad chi oedd hwn, <a data-l10n-name="passwordChangeLink">newidiwch eich cyfrinair</a>.
automatedEmailRecoveryKey-more-info = Am ragor o wybodaeth, ewch i'n <a data-l10n-name="supportLink">{ -brand-mozilla } Cefnogaeth</a>.
# Colon is followed by user device info on a separate line (e.g., "Firefox Nightly on Mac OSX 10.11")
automatedEmailRecoveryKey-origin-plaintext = Daeth y cais hwn gan:
# Colon is followed by a URL to the account recovery key section of account settings
automatedEmailRecoveryKey-notyou-delete-key-plaintext = Os nad chi oedd hwn, dilëwch yr allwedd newydd:
# Colon is followed by a URL to the change password section of account settings
automatedEmailRecoveryKey-notyou-change-pwd-only-plaintext = Os nad chi oedd hwn, newidiwch eich cyfrinair:
# This string is shown on its own line, after automatedEmailRecoveryKey-notyou-delete-key-plaintext and its URL
# Colon is followed by a URL to the change password section of account settings
automatedEmailRecoveryKey-notyou-change-pwd-plaintext = a newidiwch eich cyfrinair:
# Colon is followed by a URL to Mozilla Support's "I'm having problems with my account" page
automatedEmailRecoveryKey-more-info-plaintext = Am ragor o wybodaeth, ewch i'n { -brand-mozilla } Cefnogaeth:
automated-email-reset =
    Mae hwn yn e-bost awtomatig; os na wnaethoch chi awdurdodi'r weithred hon, yna <a data-l10n-name="resetLink"> newidiwch eich cyfrinair</a>.
    Am ragor o wybodaeth, ewch i <a data-l10n-name="supportLink">Cymorth { -brand-mozilla }</a>.
# Variables:
#  $resetLink (String) - Link to https://accounts.firefox.com/reset_password
automated-email-reset-plaintext-v2 = Os nad chi wnaeth awdurdodi'r weithred hon, ailosodwch eich cyfrinair nawr yn { $resetLink }
# This message is used by multiple automated emails that notify users of security events on their account
# "this action" is meant to be a generic term, and could, for example, refer to using a backup authentication code to confirm a password reset
automated-email-reset-pwd-two-factor = Os na chi wnaeth hyn, yna <a data-l10n-name="resetLink">ailosodwch eich cyfrinair</a> ac <a data-l10n-name="twoFactorSettingsLink">ailosod dilysiad dau gam</a>yn syth. Am ragor o wybodaeth, ewch i <a data-l10n-name="supportLink">{ -brand-mozilla } Cefnogaeth</a>.
# Followed by link to https://accounts.firefox.com/reset_password
automated-email-reset-pwd-plaintext-v3 = Os nad chi wnaeth hyn, yna ailosodwch eich cyfrinair ar unwaith yn:
# Followed by link to https://accounts.firefox.com/settings#two-step-authentication
automated-email-reset-two-factor-plaintext = Hefyd, ailosodwch ddilysiad dau gam yn:
automated-email-sign-in = E-bost awtomatig yw hwn; os na wnaethoch awdurdodi'r weithred hon, yna <a data-l10n-name="securitySettingsLink">adolygwch osodiadau diogelwch eich cyfrif</a>. Am ragor o wybodaeth, ewch i <a data-l10n-name="supportLink">{ -brand-mozilla } Cefnogaeth</a>.
automated-email-sign-in-plaintext = Os na wnaethoch awdurdodi'r weithred hon, adolygwch eich gosodiadau diogelwch cyfrif yn:
brand-banner-message = Oeddech chi'n gwybod ein bod ni wedi newid ein henw o { -product-firefox-accounts } i { -product-mozilla-accounts }? <a data-l10n-name="learnMore">Darllen rhagor</a>
change-password-plaintext = Os ydych yn amau bod rhywun yn ceisio cael mynediad at eich cyfrif, newidiwch eich cyfrinair.
manage-account = Rheoli cyfrif
manage-account-plaintext = { manage-account }:
# Variables:
#  $supportUrl (String) - Link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
support-message-3 = Am ragor o wybodaeth, ewch i <a data-l10n-name="supportLink">Gefnogaeth { -brand-mozilla }</a>.
# Variables:
#  $supportUrl (String) - Link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
support-message-plaintext = Am ragor o wybodaeth, ewch i Cefnogaeth: { -brand-mozilla } { $supportUrl }.
# Variables:
#  $uaBrowser (String) - User's browser, e.g. Firefox
#  $uaOS (String) - User's OS, e.g. Mac OSX
#  $uaOSVersion (String) - User's OS version, e.g. 10.11
device-all = { $uaBrowser } ar { $uaOS } { $uaOSVersion }
# Variables:
#  $uaBrowser (String) - User's browser, e.g. Firefox
#  $uaOS (String) - User's OS, e.g. Mac OSX
device-browser-os = { $uaBrowser } ar { $uaOS }
# Variables:
#  $city (String) - User's city
#  $stateCode (String) - User's state
#  $country (String) - User's country
location-all = { $city }, { $stateCode }, { $country } (amcan)
# Variables:
#  $city (String) - User's city
#  $country (String) - User's country
location-city-country = { $city }, { $country } (amcan)
# Variables:
#  $stateCode (String) - User's state
#  $country (String) - User's country
location-state-country = { $stateCode }, { $country } (amcan)
# Variables:
#  $country (stateCode) - User's country
location-country = { $country } (amcan)
cadReminderFirst-subject-1 = Beth am gydweddu { -brand-firefox }?
cadReminderFirst-action = Cydweddu dyfais arall
cadReminderFirst-action-plaintext = { cadReminderFirst-action }:
# In the title of the email, "It takes two to sync", "two" refers to syncing two devices
cadReminderFirst-title-1 = Mae'n cymryd dau i gydweddu
cadReminderFirst-description-v2 = Ewch â'ch tabiau ar draws eich holl ddyfeisiau. Cewch eich nodau tudalen, cyfrineiriau, a data arall ym mhob man rydych yn defnyddio { -brand-firefox }.
cadReminderSecond-subject-2 = Peidiwch â cholli allan! Gadewch i ni orffen eich gosodiad cydweddu
cadReminderSecond-action = Cydweddu dyfais arall
cadReminderSecond-title-2 = Peidiwch ag anghofio cydweddu!
cadReminderSecond-description-sync = Cyrchwch a chydweddu eich nodau tudalen, cyfrineiriau, a mwy ym mhob man y byddwch yn defnyddio { -brand-firefox }.
cadReminderSecond-description-plus = Hefyd, mae eich data bob amser wedi'i amgryptio. Dim ond chi a dyfeisiau rydych chi'n eu cymeradwyo all ei weld.
inactiveAccountFinalWarning-subject = Y cyfle olaf i gadw'ch cyfrif { -product-mozilla-account }
inactiveAccountFinalWarning-title = Bydd eich cyfrif a'ch data { -brand-mozilla } yn cael eu dileu
inactiveAccountFinalWarning-preview = Mewngofnodwch i gadw'ch cyfrif
inactiveAccountFinalWarning-account-description = Mae eich cyfrif { -product-mozilla-account } yn cael ei ddefnyddio i gael mynediad at gynnyrch preifatrwydd am ddim a chynnyrch pori fel { -brand-firefox } Sync , { -product-mozilla-monitor }, { -product-firefox-relay }, a { -product-mdn }.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
# This date will already be formatted with moment.js into Thursday, Jan 9, 2025 format
inactiveAccountFinalWarning-impact = Ar <strong>{ $deletionDate }</strong>, bydd eich cyfrif a'ch data personol yn cael eu dileu'n barhaol oni bai eich bod yn mewngofnodi.
inactiveAccountFinalWarning-action = Mewngofnodwch i gadw'ch cyfrif
# followed by link to sign in
inactiveAccountFinalWarning-action-plaintext = Mewngofnodwch i gadw'ch cyfrif:
inactiveAccountFirstWarning-subject = Peidiwch â cholli'ch cyfrif
inactiveAccountFirstWarning-title = Ydych chi am gadw eich cyfrif a'ch data { -brand-mozilla }?
inactiveAccountFirstWarning-account-description-v2 = Mae eich cyfrif { -product-mozilla-account } yn cael ei ddefnyddio i gael mynediad at gynnyrch preifatrwydd am ddim a chynnyrch pori fel { -brand-firefox } Sync , { -product-mozilla-monitor }, { -product-firefox-relay }, a { -product-mdn }.
inactiveAccountFirstWarning-inactive-status = Rydym wedi sylwi nad ydych wedi mewngofnodi ers 2 flynedd.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
# This date will already be formatted with moment.js into Thursday, Jan 9, 2025 format
inactiveAccountFirstWarning-impact = Bydd eich cyfrif a'ch data personol yn cael eu dileu yn barhaol ar <strong>{ $deletionDate }</strong> oherwydd nad ydych wedi bod yn weithredol.
inactiveAccountFirstWarning-action = Mewngofnodwch i gadw'ch cyfrif
inactiveAccountFirstWarning-preview = Mewngofnodwch i gadw'ch cyfrif
# followed by link to sign in
inactiveAccountFirstWarning-action-plaintext = Mewngofnodwch i gadw'ch cyfrif:
inactiveAccountSecondWarning-subject = Camau i'w cymryd: Bydd eich cyfrif yn cael ei ddileu o fewn 7 diwrnod
inactiveAccountSecondWarning-title = Bydd eich cyfrif a'ch data { -brand-mozilla } yn cael eu dileu ymhen 7 diwrnod
inactiveAccountSecondWarning-account-description-v2 = Mae eich cyfrif { -product-mozilla-account } yn cael ei ddefnyddio i gael mynediad at gynnyrch preifatrwydd am ddim a chynnyrch pori fel { -brand-firefox } Sync , { -product-mozilla-monitor }, { -product-firefox-relay }, a { -product-mdn }.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
inactiveAccountSecondWarning-impact = Bydd eich cyfrif a'ch data personol yn cael eu dileu yn barhaol ar <strong>{ $deletionDate }</strong> oherwydd nad ydych wedi bod yn weithredol.
inactiveAccountSecondWarning-action = Mewngofnodwch i gadw'ch cyfrif
inactiveAccountSecondWarning-preview = Mewngofnodwch i gadw'ch cyfrif
# followed by link to sign in
inactiveAccountSecondWarning-action-plaintext = Mewngofnodwch i gadw'ch cyfrif:
# The user has a low number of valid recovery codes remaining for use
codes-reminder-title-zero = Rydych chi allan o godau dilysu wrth gefn!
codes-reminder-title-one = Rydych chi ar eich cod dilysu wrth gefn olaf
codes-reminder-title-two = Mae'n bryd creu mwy o godau dilysu wrth gefn
codes-reminder-description-part-one = Mae codau dilysu wrth gefn yn eich helpu i adfer eich manylion pan fyddwch chi'n anghofio'ch cyfrinair.
codes-reminder-description-part-two = Crëwch godau newydd nawr fel na fyddwch chi'n colli'ch data yn nes ymlaen.
codes-reminder-description-two-left = Dim ond dau god sydd gennych ar ôl.
codes-reminder-description-create-codes = Crëwch godau dilysu wrth gefn newydd i'ch helpu i ddychwelyd i'ch cyfrif os ydych wedi'ch cloi allan.
lowRecoveryCodes-action-2 = Creu codau
codes-create-plaintext = { lowRecoveryCodes-action-2 }:
lowRecoveryCodes-subject-2 =
    { $numberRemaining ->
        [0] Does dim codau dilysu ar ôl!
        [zero] Does dim codau dilysu ar ôl!
        [one] Dim ond 1 cod dilysu wrth gefn ar ôl!
        [two] Dim ond { $numberRemaining } god dilysu wrth gefn ar ôl!
        [few] Dim ond { $numberRemaining } cod dilysu wrth gefn ar ôl!
        [many] Dim ond { $numberRemaining } chod dilysu wrth gefn ar ôl!
       *[other] Dim ond { $numberRemaining } cod dilysu wrth gefn ar ôl!
    }
# Variables:
# $clientName (String) - A client the user hasn't signed into before (e.g. Firefox, Sync)
newDeviceLogin-subject = Mewngofnod newydd i { $clientName }
newDeviceLogin-subjectForMozillaAccount = Mewngofnod newydd i'ch { -product-mozilla-account }
newDeviceLogin-title-3 = Defnyddiwyd eich cyfrif { -product-mozilla-account } i fewngofnodi
# The "Not you?" question is asking whether the recipient of the email is the
# person who performed the action that triggered the email.
newDeviceLogin-change-password = Nid chi? <a data-l10n-name="passwordChangeLink">Newidiwch eich cyfrinair</a>.
# The "Not you?" question is asking whether the recipient of the email is the
# person who performed the action that triggered the email.
newDeviceLogin-change-password-plain = Nid chi? Newidiwch eich cyfrinair:
newDeviceLogin-action = Rheoli cyfrif
passwordChangeRequired-subject = Gweithgaredd amheus wedi’i ganfod
passwordChangeRequired-preview = Newidiwch eich cyfrinair ar unwaith
passwordChangeRequired-title-2 = Ailosodwch eich cyfrinair
passwordChangeRequired-suspicious-activity-3 = Rydym wedi cloi eich cyfrif i'w gadw'n ddiogel rhag gweithgarwch amheus. Rydych chi wedi cael eich allgofnodi o'ch holl ddyfeisiau ac mae unrhyw ddata sydd wedi'u cydweddu wedi'u dileu rhag ofn.
passwordChangeRequired-sign-in-3 = I fewngofnodi'n ôl i'ch cyfrif, y cyfan sydd angen i chi ei wneud yw ailosod eich cyfrinair.
passwordChangeRequired-different-password-2 = <b>Pwysig:</b> Dewiswch gyfrinair cryf sy'n wahanol i'r un rydych chi wedi'i ddefnyddio yn y gorffennol.
passwordChangeRequired-different-password-plaintext-2 = Pwysig: Dewiswch gyfrinair cryf sy'n wahanol i'r un rydych chi wedi'i ddefnyddio yn y gorffennol.
passwordChangeRequired-action = Ailosodwch y cyfrinair
passwordChangeRequired-action-plaintext = { passwordChangeRequired-action }:
passwordChanged-subject = Diweddarwyd y cyfrinair
passwordChanged-title = Mae’r cyfrinair wedi ei newid yn llwyddiannus
passwordChanged-description-2 = Cafodd eich cyfrinair cyfrif { -product-mozilla-account } ei newid yn llwyddiannus o'r ddyfais ganlynol:
# Variables:
#  $code (String) - The confirmation code for sign-in
password-forgot-otp-subject-2 = Defnyddiwch { $code } i newid eich cyfrinair
password-forgot-otp-preview = Mae'r cod hwn yn dod i ben o fewn 10 munud
password-forgot-otp-title = Wedi anghofio eich cyfrinair?
password-forgot-otp-request = Rydym wedi derbyn cais i newid cyfrinair ar eich cyfrif { -product-mozilla-account } oddi wrth:
password-forgot-otp-code-2 = Os mai chi oedd hwn, dyma'ch cod cadarnhau i symud ymlaen:
password-forgot-otp-expiry-notice = Mae'r cod hwn yn dod i ben mewn 10 munud.
passwordReset-subject-2 = Mae eich cyfrinair wedi ei ailosod
passwordReset-title-2 = Mae eich cyfrinair wedi ei ailosod
# This sentence is followed by information about the device and time of the password reset
passwordReset-description-2 = Rydych chi wedi ailosod eich cyfrinair { -product-mozilla-account } ar:
passwordResetAccountRecovery-subject-2 = Mae eich cyfrinair wedi'i ailosod
passwordResetAccountRecovery-title-3 = Mae eich cyfrinair wedi ei ailosod
# Followed by details on the device, location, and date/time of the password reset.
passwordResetAccountRecovery-description-3 = Fe wnaethoch chi ddefnyddio'ch allwedd adfer cyfrif i ailosod eich cyfrinair { -product-mozilla-account } ar:
passwordResetAccountRecovery-information = Fe wnaethom eich allgofnodi o'ch holl ddyfeisiau wedi'u cydweddu. Rydym wedi creu allwedd adfer cyfrif newydd yn lle'r un a ddefnyddiwyd gennych. Gallwch ei newid yng ngosodiadau eich cyfrif.
# After the colon there is a link to account settings
passwordResetAccountRecovery-information-txt = Fe wnaethom eich allgofnodi o'ch holl ddyfeisiau wedi'u cydweddu. Rydym wedi creu allwedd adfer cyfrif newydd yn lle'r un a ddefnyddiwyd gennych. Gallwch ei newid yng ngosodiadau eich cyfrif:
passwordResetAccountRecovery-action-4 = Rheoli cyfrif
passwordResetRecoveryPhone-subject = Ffôn adfer wedi'i ddefnyddio
passwordResetRecoveryPhone-preview = Gwiriwch i wneud yn siŵr mai chi oedd hwn
passwordResetRecoveryPhone-title = Cafodd eich ffôn adfer ei ddefnyddio i gadarnhau ailosod cyfrinair
passwordResetRecoveryPhone-device = Defnyddiwch ffôn adfer o:
passwordResetRecoveryPhone-action = Rheoli cyfrif
passwordResetWithRecoveryKeyPrompt-subject = Mae eich cyfrinair wedi ei ailosod
passwordResetWithRecoveryKeyPrompt-title = Mae eich cyfrinair wedi ei ailosod
# Details of the device and date/time where the password was reset
passwordResetWithRecoveryKeyPrompt-description = Rydych chi wedi ailosod eich cyfrinair { -product-mozilla-account } ar:
# Text for button action to create a new account recovery key
passwordResetWithRecoveryKeyPrompt-action = Crëwch allwedd adfer cyfrif
# colon is followed by a link to create an account recovery key from the account settings page
passwordResetWithRecoveryKeyPrompt-action-txt = Crëwch allwedd adfer cyfrif
passwordResetWithRecoveryKeyPrompt-cta-description = Bydd angen i chi fewngofnodi eto ar bob un o'ch dyfeisiau wedi'u cydweddu. Cadwch eich data yn ddiogel y tro nesaf gydag allwedd adfer cyfrif. Mae hyn yn eich galluogi i adennill eich data os byddwch yn anghofio eich cyfrinair.
postAddAccountRecovery-subject-3 = Allwedd adfer cyfrif newydd wedi'i chreu
postAddAccountRecovery-title2 = Rydych chi wedi creu allwedd adfer cyfrif newydd
# Key here refers to account recovery key
postAddAccountRecovery-body-part1 = Cadwch yr allwedd hon mewn man diogel - bydd ei hangen arnoch i adfer eich data pori wedi'i amgryptio os byddwch yn anghofio eich cyfrinair.
# Key here refers to account recovery key
postAddAccountRecovery-body-part2 = Dim ond unwaith y mae modd defnyddio'r allwedd hon. Ar ôl i chi ei ddefnyddio, byddwn yn creu un newydd i chi'n awtomatig. Neu gallwch greu un newydd ar unrhywadeg o osodiadau eich cyfrif.
postAddAccountRecovery-action = Rheoli cyfrif
postAddLinkedAccount-subject-2 = Cyfrif newydd yn gysylltiedig â'ch cyfrif { -product-mozilla-account }
#  Variables:
#  $providerName (String) - The name of the provider, e.g. Apple, Google
postAddLinkedAccount-title-2 = Mae eich cyfrif { $providerName } wedi'i gysylltu â'ch cyfrif { -product-mozilla-account }
postAddLinkedAccount-action = Rheoli cyfrif
postAddPasskey-subject = Cyfrinallwedd wedi'i greu
postAddPasskey-preview = Gallwch nawr ddefnyddio'ch dyfais i fewngofnodi
postAddPasskey-title = Rydych chi wedi creu cyfrinallwedd
postAddPasskey-description = Gallwch nawr ei ddefnyddio i fewngofnodi i'ch holl wasanaethau { -product-mozilla-account }.
postAddPasskey-sync-note = Sylwch, bydd angen eich cyfrinair o hyd i gael mynediad at eich data cydweddu { -brand-firefox }.
# Links out to a support article about passkeys and { -brand-firefox } sync
postAddPasskey-learn-more = Dysgu rhagor
postAddPasskey-requested-from = Rydych wedi gofyn am hyn oddi wrth:
postAddPasskey-action = Rheoli cyfrif
postAddRecoveryPhone-subject = Ffôn adfer wedi'i ychwanegu
postAddRecoveryPhone-preview = Mae'r cyfrif wedi'i ddiogelu gan ddilysiad dau gam
postAddRecoveryPhone-title-v2 = Rydych wedi ychwanegu rhif ffôn adfer
# Variables:
#  $maskedLastFourPhoneNumber (String) - A bullet point mask with the last four digits of the user's phone number, e.g. ••••••1234
postAddRecoveryPhone-description-v2 = Rydych wedi ychwanegu { $maskedLastFourPhoneNumber } fel eich rhif ffôn adfer
# Links out to a support article about two factor authentication
postAddRecoveryPhone-how-protect = Sut mae hyn yn diogelu eich cyfrif
postAddRecoveryPhone-how-protect-plaintext = Sut mae hyn yn diogelu eich cyfrif:
postAddRecoveryPhone-enabled-device = Rydych chi wedi'i alluogi o:
postAddRecoveryPhone-action = Rheoli cyfrif
postAddTwoStepAuthentication-preview = Mae eich cyfrif wedi'i ddiogelu
postAddTwoStepAuthentication-subject-v3 = Mae dilysu dau gam ymlaen
postAddTwoStepAuthentication-title-2 = Rydych chi wedi troi dilysu dau gam ymlaen
# After the colon, there is a description of the device that the user used to enable two-step authentication
postAddTwoStepAuthentication-from-device-v2 = Rydych wedi gofyn am hyn oddi wrth:
postAddTwoStepAuthentication-action = Rheoli cyfrif
postAddTwoStepAuthentication-code-required-v4 = Bellach mae angen codau diogelwch o'ch ap dilysu bob tro y byddwch chi'n mewngofnodi.
postAddTwoStepAuthentication-recovery-method-codes = Rydych chi hefyd wedi ychwanegu codau dilysu wrth gefn fel eich dull adfer.
# Variables:
#  $maskedPhoneNumber (String) - A bullet point mask with the last four digits of the user's phone number, e.g. ••••••1234
postAddTwoStepAuthentication-recovery-method-phone = Rydych hefyd wedi ychwanegu { $maskedPhoneNumber } fel eich rhif ffôn adfer.
postAddTwoStepAuthentication-how-protects-link = Sut mae hyn yn diogelu eich cyfrif
postAddTwoStepAuthentication-how-protects-plaintext = Sut mae hyn yn diogelu eich cyfrif:
postAddTwoStepAuthentication-device-sign-out-message = Er mwyn diogelu eich holl ddyfeisiau cysylltiedig, dylech allgofnodi ym mhob man rydych chi'n defnyddio'r cyfrif hwn, ac yna mewngofnodi eto gan ddefnyddio dilysiad dau gam.
postChangeAccountRecovery-subject = Allwedd adfer cyfrif wedi'i newid
postChangeAccountRecovery-title = Rydych wedi newid eich allwedd adfer cyfrif
postChangeAccountRecovery-body-part1 = Mae gennych bellach allwedd adfer cyfrif newydd. Cafodd eich allwedd flaenorol ei dileu.
postChangeAccountRecovery-body-part2 = Cadwch yr allwedd newydd hon mewn man diogel - bydd ei hangen arnoch i adfer eich data pori wedi'i amgryptio os byddwch yn anghofio eich cyfrinair.
postChangeAccountRecovery-action = Rheoli cyfrif
postChangePrimary-subject = Diweddarwyd y prif e-bost
postChangePrimary-title = Prif e-bost newydd
# Variables:
#  $email (String) - A user's email address
postChangePrimary-description-2 = Rydych wedi llwyddo i newid eich prif e-bost i { $email }. Y cyfeiriad hwn bellach yw eich enw defnyddiwr ar gyfer mewngofnodi i'ch cyfrif { -product-mozilla-account }, yn ogystal â derbyn hysbysiadau diogelwch a chadarnhau eich mewngofnodi.
postChangePrimary-action = Rheoli cyfrif
postChangeRecoveryPhone-subject = Ffôn adfer wedi'i ddiweddaru
postChangeRecoveryPhone-preview = Mae'r cyfrif wedi'i ddiogelu gan ddilysiad dau gam
postChangeRecoveryPhone-title = Rydych wedi newid eich ffôn adfer
postChangeRecoveryPhone-description = Mae gennych ffôn adfer newydd nawr. Cafodd eich rhif ffôn blaenorol ei ddileu.
postChangeRecoveryPhone-requested-device = Rydych wedi gofyn amdano o:
postChangeTwoStepAuthentication-preview = Mae eich cyfrif wedi'i ddiogelu
postChangeTwoStepAuthentication-subject = Dilysiad dau gam wedi'i ddiweddaru
postChangeTwoStepAuthentication-title = Mae dilysu dau gam wedi'i ddiweddaru
postChangeTwoStepAuthentication-use-new-account = Nawr mae angen i chi ddefnyddio'r cofnod { -product-mozilla-account } newydd yn eich ap dilysu. Bydd yr un hynaf ddim yn gweithio mwyach a gallwch ei dynnu.
# After the colon, there is a description of the device that the user used to enable two-step authentication
postChangeTwoStepAuthentication-from-device = Rydych wedi gofyn am hyn oddi wrth:
postChangeTwoStepAuthentication-action = Rheoli cyfrif
postChangeTwoStepAuthentication-how-protects-link = Sut mae hyn yn diogelu'ch cyfrif
postChangeTwoStepAuthentication-how-protects-plaintext = Sut mae hyn yn diogelu'ch cyfrif:
postChangeTwoStepAuthentication-device-sign-out-message = Er mwyn diogelu eich holl ddyfeisiau cysylltiedig, dylech allgofnodi ym mhobman rydych yn defnyddio'r cyfrif hwn, ac yna mewngofnodi eto gan ddefnyddio'ch dilysiad dau gam newydd.
postConsumeRecoveryCode-title-3 = Defnyddiwyd eich cod dilysu wrth gefn i gadarnhau ailosod y cyfrinair
# After the colon, there is description of the device that the backup authentication code was used on
# E.g., Firefox Nightly on Mac OSX, Thursday Sept 2, 2024
postConsumeRecoveryCode-description-3 = Cod defnyddiwyd o:
postConsumeRecoveryCode-action = Rheoli cyfrif
postConsumeRecoveryCode-subject-v3 = Defnyddiwyd cod dilysu wrth gefn
postConsumeRecoveryCode-preview = Gwiriwch i wneud yn siŵr mai chi oedd hwn
postNewRecoveryCodes-subject-2 = Crëwyd codau dilysu wrth gefn newydd
postNewRecoveryCodes-title-2 = Rydych wedi creu codau dilysu wrth gefn newydd
# After the colon, there is information about the device that the authentication codes were created on
postNewRecoveryCodes-description-2 = Fe'u crëwyd ar:
postNewRecoveryCodes-action = Rheoli cyfrif
postRemoveAccountRecovery-subject-2 = Diëwyd yr allwedd adfer cyfrif.
postRemoveAccountRecovery-title-3 = Rydych wedi dileu allwedd adfer eich cyfrif
postRemoveAccountRecovery-body-part1 = Mae angen eich allwedd adfer cyfrif i adfer eich data pori wedi'i amgryptio os byddwch yn anghofio eich cyfrinair.
postRemoveAccountRecovery-body-part2 = Os nad ydych wedi gwneud hynny eisoes, crëwch allwedd adfer cyfrif newydd yng ngosodiadau eich cyfrif i atal colli eich cyfrineiriau sydd wedi'u cadw, nodau tudalen, hanes pori, a mwy.
postRemoveAccountRecovery-action = Rheoli cyfrif
postRemovePasskey-subject = Cyfrinallwedd wedi'i ddileu
postRemovePasskey-preview = Tynnwyd allwedd cyfrinair o'ch cyfrif
postRemovePasskey-title = Rydych wedi dileu eich cyfrinair
postRemovePasskey-description = Bydd angen i chi ddefnyddio dull arall i fewngofnodi.
postRemovePasskey-requested-from = Rydych wedi gofyn am hyn oddi wrth:
postRemovePasskey-action = Rheoli cyfrif
postRemoveRecoveryPhone-subject = Ffôn adfer wedi'i dynnu
postRemoveRecoveryPhone-preview = Mae'r cyfrif wedi'i ddiogelu gan ddilysiad dau gam
postRemoveRecoveryPhone-title = Ffôn adfer wedi'i dynnu
postRemoveRecoveryPhone-description-v2 = Mae eich ffôn adfer wedi'i dynnu o'ch gosodiadau dilysu dau gam.
postRemoveRecoveryPhone-description-extra = Gallwch barhau i ddefnyddio eich codau dilysu wrth gefn i fewngofnodi os na allwch ddefnyddio eich ap dilysu.
postRemoveRecoveryPhone-requested-device = Rydych wedi gofyn amdano o:
postRemoveSecondary-subject = Tynnwyd yr ail e-bost
postRemoveSecondary-title = Tynnwyd yr ail e-bost
# Variables:
#  $secondaryEmail (String) - A user's email address
postRemoveSecondary-description-2 = Rydych wedi llwyddo i ddileu { $secondaryEmail } fel ail e-bost o'ch cyfrif { -product-mozilla-account }. Ni fydd hysbysiadau diogelwch a chadarnhad mewngofnodi yn cael eu hanfon i'r cyfeiriad hwn mwyach.
postRemoveSecondary-action = Rheoli cyfrif
postRemoveTwoStepAuthentication-subject-line-2 = Mae dilysu dau gam wedi'i ddiffodd
postRemoveTwoStepAuthentication-title-2 = Rydych wedi diffodd dilysu dau gam
# After the colon is a description of the device the user used to disable two-step authentication
postRemoveTwoStepAuthentication-from-device = Rydych wedi'i analluogi o:
postRemoveTwoStepAuthentication-action = Rheoli cyfrif
postRemoveTwoStepAuthentication-not-required-2 = Nid oes angen codau diogelwch arnoch o'ch ap dilysu mwyach pan fyddwch yn mewngofnodi.
postSigninRecoveryCode-subject = Y cod dilysu wrth gefn a ddefnyddiwyd i fewngofnodi
postSigninRecoveryCode-preview = Cadarnhau gweithgarwch cyfrif
postSigninRecoveryCode-title = Defnyddiwyd eich cod dilysu wrth gefn i fewngofnodi
postSigninRecoveryCode-description = Os nad chi wnaeth hyn, dylech newid eich cyfrinair ar unwaith i gadw'ch cyfrif yn ddiogel.
postSigninRecoveryCode-device = Fe wnaethoch chi fewngofnodi o:
postSigninRecoveryCode-action = Rheoli cyfrif
postSigninRecoveryPhone-subject = Ffôn adfer sy'n cael ei ddefnyddio i fewngofnodi
postSigninRecoveryPhone-preview = Cadarnhau gweithgarwch cyfrif
postSigninRecoveryPhone-title = Defnyddiwyd eich ffôn adfer i fewngofnodi
postSigninRecoveryPhone-description = Os nad chi wnaeth hyn, dylech newid eich cyfrinair ar unwaith i gadw'ch cyfrif yn ddiogel.
postSigninRecoveryPhone-device = Rydych chi wedi mewngofnodi o:
postSigninRecoveryPhone-action = Rheoli cyfrif
postVerify-sub-title-3 = Rydym wrth ein bodd eich gweld!
postVerify-title-2 = Eisiau gweld yr un tab ar ddwy ddyfais?
postVerify-description-2 = Mae'n hawdd! Gosodwch { -brand-firefox } ar ddyfais arall a mewngofnodi i gydyweddu. Mae fel hud a lledrith!
postVerify-sub-description = (Psst… Mae hefyd yn golygu y gallwch gael eich holl nodau tudalen, cyfrineiriau, a data { -brand-firefox } ym mhobman rydych wedi mewngofnodi iddo.)
postVerify-subject-4 = Croeso i { -brand-mozilla }!
postVerify-setup-2 = Cysylltwch ddyfais arall:
postVerify-action-2 = Cysylltwch ddyfais arall
postVerifySecondary-subject = Ychwanegwyd ail e-bost
postVerifySecondary-title = Ychwanegwyd ail e-bost
# Variables:
#  $secondaryEmail (String) - A user's secondary email address
postVerifySecondary-content-3 = Rydych wedi llwyddo i gadarnhau { $secondaryEmail } fel ail e-bost ar gyfer eich cyfrif { -product-mozilla-account }. Bydd hysbysiadau diogelwch a chadarnhad mewngofnodi nawr yn cael eu hanfon i'r ddau gyfeiriad e-bost.
postVerifySecondary-action = Rheoli cyfrif
recovery-subject = Ailosod eich cyfrinair
recovery-title-2 = Wedi anghofio eich cyfrinair?
# Information on the device, location, and date and time of the request that triggered the email follows.
recovery-request-origin-2 = Cawsom gais am newid cyfrinair ar eich cyfrif { -product-mozilla-account } oddi wrth:
recovery-new-password-button = Crëwch gyfrinair newydd trwy glicio ar y botwm isod. Bydd y ddolen hon yn dod i ben o fewn yr awr nesaf.
recovery-copy-paste = Crëwch gyfrinair newydd trwy gopïo a gludo'r URL isod i'ch porwr. Bydd y ddolen hon yn dod i ben o fewn yr awr nesaf.
recovery-action = Creu cyfrinair newydd
# Variables:
#  $unblockCode (String) - The authorization code for sign-in
unblockCode-subject-2 = Defnyddiwch { $unblockCode } i fewngofnodi
unblockCode-preview = Daw'r cod hwn i ben o fewn awr
unblockCode-title = Ai hwn yw chi’n allgofnodi?
unblockCode-prompt = Os ie, dyma’r cod awdurdodi sydd ei angen arnoch:
# Variables:
#  $unblockCode (String) - An alphanumeric code
unblockCode-prompt-plaintext = Os ie, dyma'r cod awdurdodi sydd ei angen arnoch: { $unblockCode }
unblockCode-report = Os nad, cynorthwywch ni i gadw ymyrwyr draw ac <a data-l10n-name="reportSignInLink">adrodd arno i ni.</a>
unblockCode-report-plaintext = Os nad, cynorthwywch ni i gadw ymyrwyr draw ac adrodd arno i ni.
verificationReminderFinal-subject = Atgoffwr terfynol i gadarnhau eich cyfrif
verificationReminderFinal-description-2 = Ychydig wythnosau yn ôl fe wnaethoch chi greu cyfrif { -product-mozilla-account }, ond heb ei gadarnhau. Er eich diogelwch, byddwn yn dileu'r cyfrif os na fydd yn cael ei ddilysu yn ystod y 24 awr nesaf.
confirm-account = Cadarnhewch eich cyfrif
confirm-account-plaintext = { confirm-account }:
verificationReminderFirst-subject-2 = Cofiwch gadarnhau eich cyfrif
verificationReminderFirst-title-3 = Croeso i { -brand-mozilla }!
verificationReminderFirst-description-3 = Ychydig ddyddiau yn ôl fe wnaethoch chi greu { -product-mozilla-account }, ond heb ei gadarnhau. Cadarnhewch eich cyfrif o fewn y 15 diwrnod nesaf neu bydd yn cael ei ddileu'n awtomatig.
verificationReminderFirst-sub-description-3 = Peidiwch â cholli allan ar y porwr sy'n eich rhoi chi a'ch preifatrwydd yn gyntaf.
confirm-email-2 = Cadarnhewch eich cyfrif
confirm-email-plaintext-2 = { confirm-email-2 }:
verificationReminderFirst-action-2 = Cadarnhewch eich cyfrif
verificationReminderSecond-subject-2 = Cofiwch gadarnhau eich cyfrif
verificationReminderSecond-title-3 = Peidiwch â cholli allan ar { -brand-mozilla }!
verificationReminderSecond-description-4 = Ychydig ddyddiau yn ôl fe wnaethoch chi greu cyfrif { -product-mozilla-account }, ond heb ei gadarnhau. Cadarnhewch eich cyfrif o fewn y 10 diwrnod nesaf neu bydd yn cael ei ddileu yn awtomatig.
verificationReminderSecond-second-description-3 = Mae eich cyfrif { -product-mozilla-account } yn caniatáu i chi gydweddu eich profiad { -brand-firefox } ar draws dyfeisiau ac yn datgloi mynediad i ragor o gynnyrch sy'n diogelu eich preifatrwydd gan { -brand-mozilla }.
verificationReminderSecond-sub-description-2 = Byddwch yn rhan o’n cenhadaeth i drawsnewid y rhyngrwyd yn lle sy’n agored i bawb.
verificationReminderSecond-action-2 = Cadarnhewch eich cyfrif
verify-title-3 = Agorwch y rhyngrwyd gyda { -brand-mozilla }
verify-description-2 = Cadarnhewch eich cyfrif a chael y gorau o { -brand-mozilla } ym mhob man rydych yn mewngofnodi gan ddechrau gyda:
verify-subject = Gorffen creu eich cyfrif
verify-action-2 = Cadarnhewch eich cyfrif
# Variables:
# $code (String) - The verification code
verifyAccountChange-subject = Defnyddiwch { $code } i newid eich cyfrif
# Variables:
# $expirationTime (Number) - Represents the expiration time in minutes
verifyAccountChange-preview =
    { $expirationTime ->
        [one] Daw'r cod hwn i ben ymhen { $expirationTime } munudau.
        [zero] Daw'r cod hwn i ben ymhen { $expirationTime } munud.
        [two] Daw'r cod hwn i ben ymhen { $expirationTime } funud
        [few] Daw'r cod hwn i ben ymhen { $expirationTime } munud
        [many] Daw'r cod hwn i ben ymhen { $expirationTime } munud
       *[other] Daw'r cod hwn i ben ymhen { $expirationTime } munud
    }
verifyAccountChange-title = Ydych chi'n newid manylion eich cyfrif?
# After the colon is a description of the device used to sign in to the service
verifyAccountChange-safe = Helpwch ni i gadw'ch cyfrif yn ddiogel trwy gymeradwyo'r newid hwn ar:
verifyAccountChange-prompt = Os ydych, dyma eich cod awdurdodi:
# Variables:
# $expirationTime (Number) - Represents the expiration time in minutes
verifyAccountChange-expiry-notice =
    { $expirationTime ->
        [one] Daw i ben ymhen { $expirationTime } munud.
        [zero] Daw i ben ymhen { $expirationTime } munud.
        [two] Daw i ben ymhen { $expirationTime } funud.
        [few] Daw i ben ymhen { $expirationTime } munud.
        [many] Daw i ben ymhen { $expirationTime } munud.
       *[other] Daw i ben ymhen { $expirationTime } munud.
    }
# Variables:
#  $clientName (String) - A client the user hasn't signed into before (e.g. Firefox, Sync)
verifyLogin-title-2 = A wnaethoch chi fewngofnodi i { $clientName }?
verifyLogin-description-2 = Helpwch ni i gadw'ch cyfrif yn ddiogel drwy gadarnhau eich bod wedi mewngofnodi ar:
verifyLogin-subject-2 = Cadarnhewch eich mewngofnodi
verifyLogin-action = Cadarnhau eich mewngofnodi
# Variables:
#  $code (String) - The confirmation code for sign-in
verifyLoginCode-subject-line-3 = Defnyddiwch { $code } i fewngofnodi
verifyLoginCode-preview = Mae'r cod hwn yn dod i ben o fewn 5 munud.
# Variables:
#  $serviceName (String) - A service the user hasn't signed into before (e.g. Firefox)
verifyLoginCode-title-2 = A wnaethoch chi fewngofnodi i { $serviceName }?
# After the colon is a description of the device used to sign in to the service
verifyLoginCode-safe = Helpwch ni i gadw'ch cyfrif yn ddiogel trwy gymeradwyo eich mewngofnodi:
verifyLoginCode-prompt-3 = Os ydych, dyma eich cod awdurdodi:
verifyLoginCode-expiry-notice = Daw i ben mewn 5 munud.
verifyPrimary-title-2 = Cadarnhau'r prif e-bost
verifyPrimary-description = Mae cais wedi ei wneud o’r ddyfais ganlynol i newid cyfrif:
verifyPrimary-subject = Cadarnhau’r prif e-bost
verifyPrimary-action-2 = Cadarnhau'r e-bost
verifyPrimary-action-plaintext-2 = { verifyPrimary-action-2 }:
verifyPrimary-post-verify-2 = Unwaith y bydd wedi ei gadarnhau, bydd newid cyfrif fel ychwanegu ail e-bost yn bosib o'r ddyfais hon.
# Variables:
#  $code (String) - The confirmation code for secondary email
verifySecondaryCode-subject-2 = Defnyddiwch { $code } i gadarnhau eich ail e-bost
verifySecondaryCode-preview = Mae'r cod hwn yn dod i ben o fewn 5 munud.
verifySecondaryCode-title-2 = Cadarnhau'r ail e-bost
verifySecondaryCode-action-2 = Cadarnhau'r e-bost
# Variables:
#  $email (string) A user's unverified secondary email address
verifySecondaryCode-explainer-2 = Mae cais i ddefnyddio { $email } fel cyfeiriad ail e-bost wedi'i wneud o'r cyfrif { -product-mozilla-account } canlynol:
verifySecondaryCode-prompt-2 = Defnyddiwch y cod cadarnhau yma:
verifySecondaryCode-expiry-notice-2 = Daw i ben ymhen 5 munud. Ar ôl ei gadarnhau, bydd y cyfeiriad hwn yn dechrau derbyn hysbysiadau a chadarnhad diogelwch.
# Variables:
#  $code (String) - comfirmation code for the account
verifyShortCode-subject-4 = Defnyddiwch { $code } i gadarnhau eich cyfrif
verifyShortCode-preview-2 = Mae'r cod hwn yn dod i ben o fewn 5 munud
verifyShortCode-title-3 = Agorwch y rhyngrwyd gyda { -brand-mozilla }
# Information on the browser and device triggering this confirmation email follows below this string.
verifyShortCode-title-subtext-2 = Cadarnhewch eich cyfrif a chael y gorau o { -brand-mozilla } ym mhob man rydych yn mewngofnodi gan ddechrau gyda:
verifyShortCode-prompt-3 = Defnyddiwch y cod cadarnhau yma:
verifyShortCode-expiry-notice = Daw i ben mewn 5 munud.
