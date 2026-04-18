## Email content
## Emails do not contain buttons, only links. Emails have a rich HTML version and a plaintext
## version. The strings are usually identical but sometimes they differ slightly.

fxa-header-mozilla-logo = <img data-l10n-name="mozilla-logo" alt="{ -brand-mozilla }-ლოგო">
fxa-header-sync-devices-image = <img data-l10n-name="sync-devices-image" alt="დასინქ. მოწყობილობები">
body-devices-image = <img data-l10n-name="devices-image" alt="მოწყობილობები">
fxa-privacy-url = { -brand-mozilla } – პირადულობის დებულება
moz-accounts-privacy-url-2 = { -product-mozilla-accounts(case: "gen") } პირადულობის განაცხადი
moz-accounts-terms-url = { -product-mozilla-accounts(case: "gen") } მომსახურების პირობები
account-deletion-info-block-communications = თქვენი ანგარიშის წაშლის შემთხვევაში მაინც მიიღებთ წერილებს Mozilla-კორპორაციისა და Mozilla-ფონდისგან, სანამ <a data-l10n-name="unsubscribeLink">გამოწერის გაუქმებას არ მოითხოვთ</a>.
account-deletion-info-block-support = თუ გაქვთ კითხვები ან დახმარება გესაჭიროებათ, შეგიძლიათ შეეხმიანოთ <a data-l10n-name="supportLink">მხარდაჭერის გუნდს</a>.
account-deletion-info-block-communications-plaintext = თქვენი ანგარიშის წაშლის შემთხვევაში მაინც მიიღებთ წერილებს Mozilla-კორპორაციისა და Mozilla-ფონდისგან, სანამ გამოწერის გაუქმებას არ მოითხოვთ.
account-deletion-info-block-support-plaintext = თუ გაქვთ კითხვები ან დახმარება გესაჭიროებათ, შეგიძლიათ შეეხმიანოთ მხარდაჭერის გუნდს:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
body-android-badge = <img data-l10n-name="google-play-badge" alt="ჩამოტვირთეთ { $productName } { -google-play }-იდან">
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
body-ios-badge = <img data-l10n-name="apple-app-badge" alt="ჩამოტვირთეთ { $productName } { -app-store }-იდან">
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-desktop-device-2 = დააყენეთ { $productName } <a data-l10n-name="anotherDeviceLink">სხვა კომპიუტერზე</a>.
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-device-2 = დააყენეთ { $productName } <a data-l10n-name="anotherDeviceLink">სხვა მოწყობილობაზე</a>.
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
android-download-plaintext = გადმოწერეთ { $productName } Google Play-დან:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
ios-download-plaintext = ჩამოტვირთეთ { $productName } App Store-დან:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-device-plaintext = დააყენეთ { $productName } სხვა მოწყობილობაზე:
automated-email-change-2 = თუ ეს თქვენი ნამოქმედარი არაა, <a data-l10n-name="passwordChangeLink">შეცვალეთ პაროლი</a> დაუყოვნებლივ.
automated-email-support = დამატებით იხილეთ <a data-l10n-name="supportLink">{ -brand-mozilla }-ს მხარდაჭერის გვერდი</a>.
# After the colon, there's a link to https://accounts.firefox.com/settings/change_password
automated-email-change-plaintext-2 = თუ ეს თქვენი ნამოქმედარი არაა, შეცვალეთ პაროლი დაუყოვნებლივ:
#  After the colon, there's a link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
automated-email-support-plaintext = დამატებით იხილეთ { -brand-mozilla }-ს მხარდაჭერის გვერდი:
automated-email-inactive-account = ეს ავტომატური შეტყობინებაა. გამოგეგზავნათ იმიტომ, რომ შექმნილი გაქვთ { -product-mozilla-account } და 2 წელია გასული თქვენი ბოლო შესვლიდან.
# supportLink - https://support.mozilla.org/kb/im-having-problems-my-firefox-account
automated-email-no-action = { automated-email-no-action-plaintext } ვრცლად იხილეთ <a data-l10n-name="supportLink">{ -brand-mozilla }-მხარდაჭერა</a>.
automated-email-no-action-plaintext = ეს წერილი ავტომატურად იგზავნება. თუ შეცდომით მიიღეთ, საჭირო არაა რამე მოიმოქმედოთ.
#  After the colon, there's a link to https://accounts.firefox.com/settings/change_password
automated-email-not-authorized-plaintext = ეს ავტომატური შეტყობინებაა; თუ ეს მოქმედება თქვენს უნებართვოდ შესრულდა, მაშინ გთხოვთ, შეცვალოთ პაროლი:
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
# - $uaOS: the user agent's operating system (e.g, MacOS)
# - $uaOSVersion - the user agent's operating system version
automatedEmailRecoveryKey-origin-device-all = მოთხოვნის წყაროა { $uaBrowser } სისტემიდან { $uaOS } { $uaOSVersion }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
# - $uaOS: the user agent's operating system (e.g, MacOS)
automatedEmailRecoveryKey-origin-device-browser-os = მოთხოვნის წყაროა { $uaBrowser } სისტემიდან { $uaOS }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
automatedEmailRecoveryKey-origin-device-browser-only = მოთხოვნის წყაროა { $uaBrowser }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaOS: the user agent's operating system (e.g, MacOS)
# - $uaOSVersion - the user agent's operating system version
automatedEmailRecoveryKey-origin-device-OS-version-only = მოთხოვნის წყაროა { $uaOS } { $uaOSVersion }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaOS: the user agent's operating system (e.g, MacOS)
automatedEmailRecoveryKey-origin-device-OS-only = მოთხოვნის წყაროა { $uaOS }.
automatedEmailRecoveryKey-delete-key-change-pwd = თუ თქვენ არ ყოფილხართ, <a data-l10n-name="revokeAccountRecoveryLink">წაშალეთ ახალი გასაღები</a> და <a data-l10n-name="passwordChangeLink">შეცვალეთ თქვენი პაროლი</a>
automatedEmailRecoveryKey-change-pwd-only = თუ თქვენ არ ყოფილხართ, <a data-l10n-name="passwordChangeLink">შეცვალეთ პაროლი</a>.
automatedEmailRecoveryKey-more-info = დამატებით იხილეთ <a data-l10n-name="supportLink">{ -brand-mozilla }-ს მხარდაჭერის გვერდი</a>.
# Colon is followed by user device info on a separate line (e.g., "Firefox Nightly on Mac OSX 10.11")
automatedEmailRecoveryKey-origin-plaintext = მოთხოვნის წყაროა:
# Colon is followed by a URL to the account recovery key section of account settings
automatedEmailRecoveryKey-notyou-delete-key-plaintext = თუ თქვენ არ ყოფილხართ, წაშალეთ ახალი გასაღები:
# Colon is followed by a URL to the change password section of account settings
automatedEmailRecoveryKey-notyou-change-pwd-only-plaintext = თუ თქვენ არ ყოფილხართ, შეცვალეთ თქვენი პაროლი:
# This string is shown on its own line, after automatedEmailRecoveryKey-notyou-delete-key-plaintext and its URL
# Colon is followed by a URL to the change password section of account settings
automatedEmailRecoveryKey-notyou-change-pwd-plaintext = და შეცვალეთ თქვენი პაროლი:
# Colon is followed by a URL to Mozilla Support's "I'm having problems with my account" page
automatedEmailRecoveryKey-more-info-plaintext = დამატებით იხილეთ { -brand-mozilla }-ს მხარდაჭერის გვერდი:
automated-email-reset =
    ეს ავტომატური შეტყობინებაა; თუ მოცემული მოქმედება, თქვენი ნებართვის გარეშე შესრულდა, მაშინ <a data-l10n-name="resetLink">გთხოვთ, გაანულოთ პაროლი.</a>.
    ვრცლად იხილეთ <a data-l10n-name="supportLink">{ -brand-mozilla } მხარდაჭერის გვერდი</a>.
# Variables:
#  $resetLink (String) - Link to https://accounts.firefox.com/reset_password
automated-email-reset-plaintext-v2 = თუ თქვენ არ მოგიმოქმედებიათ რამე, გთხოვთ, ახლავე გაანულოთ პაროლი ბმულზე { $resetLink }
# This message is used by multiple automated emails that notify users of security events on their account
# "this action" is meant to be a generic term, and could, for example, refer to using a backup authentication code to confirm a password reset
automated-email-reset-pwd-two-factor =
    თუ თქვენ არაფერი მოგიმოქმედებიათ, მაშინ <a data-l10n-name="resetLink">გაანულეთ პაროლი</a> და <a data-l10n-name="twoFactorSettingsLink">ახლიდან გამართეთ ორბიჯიანი დამოწმება</a> დაუყოვნებლივ.
    ვრცლად იხილეთ <a data-l10n-name="supportLink">{ -brand-mozilla } მხარდაჭერა</a>.
# Followed by link to https://accounts.firefox.com/reset_password
automated-email-reset-pwd-plaintext-v3 = თუ თქვენ არაფერი მოგიმოქმედებიათ, მაშინ გაანულეთ პაროლი დაუყოვნებლივ:
# Followed by link to https://accounts.firefox.com/settings#two-step-authentication
automated-email-reset-two-factor-plaintext = ამასთანავე, ხელახლა გამართეთ ორბიჯიანი დამოწმება:
brand-banner-message = იცოდით, რომ { -product-firefox-accounts(case: "dat") } სახელი შეეცვლება და ერქმევა { -product-mozilla-accounts }? <a data-l10n-name="learnMore">ვრცლად</a>
change-password-plaintext = თუ ეჭვობთ, რომ ვინმე თქვენს ანგარიშთან წვდომის მოპოვებას ცდილობს, გთხოვთ, შეცვალეთ თქვენი პაროლი.
manage-account = ანგარიშის მართვა
manage-account-plaintext = { manage-account }:
# Variables:
#  $supportUrl (String) - Link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
support-message-3 = დამატებით იხილეთ <a data-l10n-name="supportLink">{ -brand-mozilla }-ს მხარდაჭერის გვერდი</a>.
# Variables:
#  $supportUrl (String) - Link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
support-message-plaintext = დამატებით იხილეთ { -brand-mozilla }-ს დახმარების გვერდი: { $supportUrl }.
# Variables:
#  $uaBrowser (String) - User's browser, e.g. Firefox
#  $uaOS (String) - User's OS, e.g. Mac OSX
#  $uaOSVersion (String) - User's OS version, e.g. 10.11
device-all = { $uaBrowser }, { $uaOS } { $uaOSVersion }
# Variables:
#  $uaBrowser (String) - User's browser, e.g. Firefox
#  $uaOS (String) - User's OS, e.g. Mac OSX
device-browser-os = { $uaBrowser }, { $uaOS }
# Variables:
#  $city (String) - User's city
#  $stateCode (String) - User's state
#  $country (String) - User's country
location-all = { $city }, { $stateCode }, { $country } (მიახლოებით)
# Variables:
#  $city (String) - User's city
#  $country (String) - User's country
location-city-country = { $city }, { $country } (მიახლოებით)
# Variables:
#  $stateCode (String) - User's state
#  $country (String) - User's country
location-state-country = { $stateCode }, { $country } (მიახლოებით)
# Variables:
#  $country (stateCode) - User's country
location-country = { $country } (მიახლოებით)
cadReminderFirst-subject-1 = შეხსენება! დაასინქრონეთ { -brand-firefox }
cadReminderFirst-action = სხვა მოწყობილობის დასინქრონება
cadReminderFirst-action-plaintext = { cadReminderFirst-action }:
# In the title of the email, "It takes two to sync", "two" refers to syncing two devices
cadReminderFirst-title-1 = სინქრონიზაცია ორს შორისაა
cadReminderFirst-description-v2 = გაიყოლეთ ჩანართები ყველა მოწყობილობაზე. მიიღეთ თქვენი სანიშნები, პაროლები და სხვა მონაცემები ყველგან, სადაც კი გიყენიათ { -brand-firefox }.
cadReminderSecond-subject-2 = არ გამოგრჩეთ! დაასრულეთ სინქრონიზაციის გამართვა
cadReminderSecond-action = სხვა მოწყობილობის დასინქრონება
cadReminderSecond-title-2 = არ დაგავიწყდეთ სინქრონიზაცია!
cadReminderSecond-description-sync = დაასინქრონეთ თქვენი სანიშნები, პაროლები, გახსნილი ჩანართები და ა.შ. — ყველგან, სადაც გიყენიათ { -brand-firefox }.
cadReminderSecond-description-plus = ამასთან ერთად, თქვენი მონაცემები ყოველთვის დაშიფრულია. მხოლოდ თქვენსა და თქვენ მიერ დამოწმებულ მოწყობილობებზე შეიძლება ნახვა.
inactiveAccountFinalWarning-subject = უკანასკნელად გეძლევათ საშუალება, შეინარჩუნოთ { -product-mozilla-account }
inactiveAccountFinalWarning-title = თქვენი { -brand-mozilla }-ანგარიში და მონაცემები წაიშლება
inactiveAccountFinalWarning-preview = შედით, რომ შეინარჩუნოთ ანგარიში
inactiveAccountFinalWarning-account-description = თქვენი { -product-mozilla-account } გამოიყენება უფასო წვდომისთვის პირადულობისა და გვერდების მონახულებისთვის, აგრეთვე ისეთი პროდუქტებისთვის, როგორებიცაა { -brand-firefox }-სინქრონიზაცია, { -product-mozilla-monitor }, { -product-firefox-relay } და { -product-mdn }.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
# This date will already be formatted with moment.js into Thursday, Jan 9, 2025 format
inactiveAccountFinalWarning-impact = <strong>{ $deletionDate }</strong> თქვენი ანგარიშისა და პირადი მონაცემების სამუდამოდ წაშლის ვადაა, ანგარიშზე თუ არ შეხვალთ.
inactiveAccountFinalWarning-action = შედით, რომ შეინარჩუნოთ ანგარიში
# followed by link to sign in
inactiveAccountFinalWarning-action-plaintext = შედით, რომ შეინარჩუნოთ ანგარიში:
inactiveAccountFirstWarning-subject = ნუ დაკარგავთ ანგარიშს
inactiveAccountFirstWarning-title = გსურთ, შეინარჩუნოთ თქვენი { -brand-mozilla }-ანგარიში და მონაცემები?
inactiveAccountFirstWarning-account-description-v2 = თქვენი { -product-mozilla-account } გამოიყენება უფასო წვდომისთვის პირადულობისა და გვერდების მონახულებისთვის, აგრეთვე ისეთი პროდუქტებისთვის, როგორებიცაა { -brand-firefox }-სინქრონიზაცია, { -product-mozilla-monitor }, { -product-firefox-relay } და { -product-mdn }.
inactiveAccountFirstWarning-inactive-status = შევამჩნიეთ, რომ ანგარიშზე 2 წელია არ შესულხართ.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
# This date will already be formatted with moment.js into Thursday, Jan 9, 2025 format
inactiveAccountFirstWarning-impact = თქვენი ანგარიშისა და პირადი მონაცემების სამუდამოდ წაშლის ვადაა <strong>{ $deletionDate }</strong>, რადგან არ ხართ მოქმედი მომხმარებელი.
inactiveAccountFirstWarning-action = შედით, რომ შეინარჩუნოთ ანგარიში
inactiveAccountFirstWarning-preview = შედით, რომ შეინარჩუნოთ ანგარიში
# followed by link to sign in
inactiveAccountFirstWarning-action-plaintext = შედით, რომ შეინარჩუნოთ ანგარიში:
inactiveAccountSecondWarning-subject = საჭიროა მოქმედება: ანგარიში წაიშლება 7 დღეში
inactiveAccountSecondWarning-title = თქვენი { -brand-mozilla }-ანგარიში და მონაცემები წაიშლება 7 დღეში
inactiveAccountSecondWarning-account-description-v2 = თქვენი { -product-mozilla-account } გამოიყენება უფასო წვდომისთვის პირადულობისა და გვერდების მონახულებისთვის, აგრეთვე ისეთი პროდუქტებისთვის, როგორებიცაა { -brand-firefox }-სინქრონიზაცია, { -product-mozilla-monitor }, { -product-firefox-relay } და { -product-mdn }.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
inactiveAccountSecondWarning-impact = თქვენი ანგარიშისა და პირადი მონაცემების სამუდამოდ წაშლის ვადაა <strong>{ $deletionDate }</strong>, რადგან არ ხართ მოქმედი მომხმარებელი.
inactiveAccountSecondWarning-action = შედით, რომ შეინარჩუნოთ ანგარიში
inactiveAccountSecondWarning-preview = შედით, რომ შეინარჩუნოთ ანგარიში
# followed by link to sign in
inactiveAccountSecondWarning-action-plaintext = შედით, რომ შეინარჩუნოთ ანგარიში:
# The user has a low number of valid recovery codes remaining for use
codes-reminder-title-zero = ამოიწურა სამარქაფო კოდები შესვლის დასამოწმებლად!
codes-reminder-title-one = ბოლო სამარქაფო კოდია შესვლის დასამოწმებლად
codes-reminder-title-two = დროა, კიდევ შექმნათ სამარქაფო კოდები შესვლის დასამოწმებლად
codes-reminder-description-part-one = სამარქაფო კოდები შესვლის დასამოწმებლად დაგეხმარებათ მონაცემების აღდგენაში, თუ პაროლი დაგავიწყდებათ.
codes-reminder-description-part-two = შექმენით ახალი კოდები ახლავე, რათა მოგვიანებით არ დაკარგოთ თქვენი მონაცემები.
codes-reminder-description-two-left = მხოლოდ ორი კოდიღა გაქვთ დარჩენილი.
codes-reminder-description-create-codes = შექმენით ახალი სამარქაფო კოდები შესვლის დასამოწმებლად, რომ გამოიყენოთ თქვენს ანგარიშთან წვდომის დასაბრუნებლად, თუ ჩაიკეტება.
lowRecoveryCodes-action-2 = კოდების შექმნა
codes-create-plaintext = { lowRecoveryCodes-action-2 }:
lowRecoveryCodes-subject-2 =
    { $numberRemaining ->
        [0] აღარაა სამარქაფო კოდები შესვლის დასამოწმებლად
        [one] მხოლოდ 1 სამარქაფო კოდია დარჩენილი შესვლის დასამოწმებლად
       *[other] მხოლოდ { $numberRemaining } სამარქაფო კოდია დარჩენილი შესვლის დასამოწმებლად
    }
# Variables:
# $clientName (String) - A client the user hasn't signed into before (e.g. Firefox, Sync)
newDeviceLogin-subject = ახალი შესვლა { $clientName }
newDeviceLogin-subjectForMozillaAccount = თქვენი { -product-mozilla-account } გამოყენებულია შესვლისთვის
newDeviceLogin-title-3 = თქვენი { -product-mozilla-account } გამოყენებულია შესვლისთვის
# The "Not you?" question is asking whether the recipient of the email is the
# person who performed the action that triggered the email.
newDeviceLogin-change-password = თქვენ არ ყოფილხართ? <a data-l10n-name="passwordChangeLink">შეცვალეთ პაროლი</a>.
# The "Not you?" question is asking whether the recipient of the email is the
# person who performed the action that triggered the email.
newDeviceLogin-change-password-plain = თქვენ არ ყოფილხართ? შეცვალეთ პაროლი:
newDeviceLogin-action = ანგარიშის მართვა
passwordChangeRequired-subject = აღმოჩენილია საეჭვო მოქმედება
passwordChangeRequired-preview = დაუყოვნებლივ შეცვალეთ პაროლი
passwordChangeRequired-title-2 = პაროლის განულება
passwordChangeRequired-suspicious-activity-3 = თქვენი ანგარიში ჩაიკეტა საეჭვო მოქმედებებისგან თავდასაცავად. გამოსული ხართ ყველა მოწყობილობიდან და ყველა დასინქრონებული მონაცემიც წაიშალა სიფრთხილის მიზნით.
passwordChangeRequired-sign-in-3 = თქვენს ანგარიშზე ხელახლა შესასვლელად საკმარისი იქნება პაროლის განულება.
passwordChangeRequired-different-password-2 = <b>მნიშვნელოვანია:</b> აირჩიეთ ძლიერი პაროლი, რომელიც განსხვავდება წინათ გამოყენებულისგან.
passwordChangeRequired-different-password-plaintext-2 = მნიშვნელოვანია: აირჩიეთ ძლიერი პაროლი, რომელიც განსხვავდება წინათ გამოყენებულისგან.
passwordChangeRequired-action = პაროლის განულება
passwordChangeRequired-action-plaintext = { passwordChangeRequired-action }:
passwordChanged-subject = პაროლი განახლდა
passwordChanged-title = პაროლი წარმატებით შეიცვალა
passwordChanged-description-2 = თქვენი { -product-mozilla-account(case: "gen") } პაროლი წარმატებით შეიცვალა ამ მოწყობილობიდან:
# Variables:
#  $code (String) - The confirmation code for sign-in
password-forgot-otp-subject-2 = გამოიყენეთ { $code } პაროლის შესაცვლელად
password-forgot-otp-preview = ვადა ამოეწურება 10 წუთში
password-forgot-otp-title = დაგავიწყდათ პაროლი?
password-forgot-otp-request = პაროლის შეცვლის მოთხოვნა მივიღეთ თქვენს { -product-mozilla-account(case: "loc") } აქედან:
password-forgot-otp-code-2 = თუ თქვენ იყავით, განაგრძეთ გამოგზავნილი დამადასტურებელი კოდით:
password-forgot-otp-expiry-notice = ვადა ამოეწურება 10 წუთში.
passwordReset-subject-2 = თქვენი პაროლი აღდგენილია
passwordReset-title-2 = თქვენი პაროლი აღდგენილია
# This sentence is followed by information about the device and time of the password reset
passwordReset-description-2 = თქვენ აღადგინეთ { -product-mozilla-account(case: "gen") } პაროლი:
passwordResetAccountRecovery-subject-2 = თქვენი პაროლი აღდგენილია
passwordResetAccountRecovery-title-3 = თქვენი პაროლი აღდგენილია
# Followed by details on the device, location, and date/time of the password reset.
passwordResetAccountRecovery-description-3 = გამოყენებულია ანგარიშის აღდგენის გასაღები პაროლის { -product-mozilla-account(case: "gen") } აღსადგენად:
passwordResetAccountRecovery-information = ანგარიშიდან გამოხვალთ ყველა დასინქრონებული მოწყობილობიდან. თქვენთვის შექმნილია აღდგენის ახალი გასაღები გამოყენებულის სანაცვლოდ. შეცვლა შეგიძლიათ ანგარიშის პარამეტრებიდან.
# After the colon there is a link to account settings
passwordResetAccountRecovery-information-txt = ანგარიშიდან გამოხვალთ ყველა დასინქრონებული მოწყობილობიდან. თქვენთვის შექმნილია აღდგენის ახალი გასაღები გამოყენებულის სანაცვლოდ. შეცვლა შეგიძლიათ ანგარიშის პარამეტრებიდან:
passwordResetAccountRecovery-action-4 = ანგარიშის მართვა
passwordResetRecoveryPhone-subject = გამოყენებულია აღდგენის ტელეფონი
passwordResetRecoveryPhone-preview = გადაამოწმეთ, რომ ნამდვილად თქვენ იყავით
passwordResetRecoveryPhone-title = თქვენი აღდგენის ტელეფონი გამოყენებულია პაროლის განულების დასადასტურებლად
passwordResetRecoveryPhone-device = აღდგენის ტელეფონის გამოყენების ადგილი:
passwordResetRecoveryPhone-action = ანგარიშის მართვა
passwordResetWithRecoveryKeyPrompt-subject = თქვენი პაროლი აღდგენილია
passwordResetWithRecoveryKeyPrompt-title = თქვენი პაროლი აღდგენილია
# Details of the device and date/time where the password was reset
passwordResetWithRecoveryKeyPrompt-description = თქვენ აღადგინეთ { -product-mozilla-account(case: "gen") } პაროლი:
# Text for button action to create a new account recovery key
passwordResetWithRecoveryKeyPrompt-action = ანგარიშის აღდგენის გასაღების შექმნა
# colon is followed by a link to create an account recovery key from the account settings page
passwordResetWithRecoveryKeyPrompt-action-txt = ანგარიშის აღდგენის გასაღების შექმნა:
passwordResetWithRecoveryKeyPrompt-cta-description = ხელახლა მოგიწევთ შესვლა ყველა დასინქრონებული მოწყობილობიდან. მომავლისთვის დაიცავით თქვენი მონაცემები უსაფრთხოდ ანგარიშის აღდგენის გასაღებით. იგი საშუალებას მოგცემთ დაიბრუნოთ თქვენი მონაცემები პაროლის დავიწყების შემთხვევაში.
postAddAccountRecovery-subject-3 = ანგარიშის აღდგენის ახალი გასაღები შექმნილია
postAddAccountRecovery-title2 = ანგარიშის აღდგენის ახალი გასაღები შეიქმნა
# Key here refers to account recovery key
postAddAccountRecovery-body-part1 = შეინახეთ ეს გასაღები უსაფრთხო ადგილას — დაგჭირდებათ ბრაუზერის დაშიფრული მონაცემების აღსადგენად, თუ დაგავიწყდებათ პაროლი.
# Key here refers to account recovery key
postAddAccountRecovery-body-part2 = ამ გასაღების გამოყენება შესაძლებელია მხოლოდ ერთხელ. გამოყენების შემდეგ, ავტომატურად შეგიქმნით ახალს. გარდა ამისა, ახლის შექმნა შეგიძლიათ ნებისმიერ დროს თქვენი ანგარიშის პარამეტრებიდან.
postAddAccountRecovery-action = ანგარიშის მართვა
postAddLinkedAccount-subject-2 = ახალი ანგარიში დაკავშირებულია თქვენს { -product-mozilla-account(case: "add") }
#  Variables:
#  $providerName (String) - The name of the provider, e.g. Apple, Google
postAddLinkedAccount-title-2 = თქვენი { $providerName } ანგარიში დაუკავშირდა თქვენს { -product-mozilla-account(case: "dat") }
postAddLinkedAccount-action = ანგარიშის მართვა
postAddRecoveryPhone-subject = აღდგენის ტელეფონი დამატებულია
postAddRecoveryPhone-preview = ანგარიში დაცულია ორბიჯიანი დამოწმებით შესვლისას
postAddRecoveryPhone-title-v2 = დამატებულია აღდგენის ნომერი
# Variables:
#  $maskedLastFourPhoneNumber (String) - A bullet point mask with the last four digits of the user's phone number, e.g. ••••••1234
postAddRecoveryPhone-description-v2 = თქვენ დაამატეთ { $maskedLastFourPhoneNumber } ნომერი თქვენს აღდგენის ტელეფონად
# Links out to a support article about two factor authentication
postAddRecoveryPhone-how-protect = როგორ იცავს ეს თქვენს ანგარიშს
postAddRecoveryPhone-how-protect-plaintext = როგორ იცავს ეს თქვენს ანგარიშს:
postAddRecoveryPhone-enabled-device = ჩაირთო აქედან:
postAddRecoveryPhone-action = ანგარიშის მართვა
postAddTwoStepAuthentication-preview = თქვენი ანგარიში დაცულია
postAddTwoStepAuthentication-subject-v3 = ორბიჯიანი დამოწმება ჩართულია
postAddTwoStepAuthentication-title-2 = ორბიჯიანი დამოწმება ჩაირთო
# After the colon, there is a description of the device that the user used to enable two-step authentication
postAddTwoStepAuthentication-from-device-v2 = თქვენი მოთხოვნის წყარო იყო:
postAddTwoStepAuthentication-action = ანგარიშის მართვა
postAddTwoStepAuthentication-code-required-v4 = შესვლის დასამოწმებელი პროგრამიდან კოდები ახლა უკვე მოითხოვება ყოველი შესვლისას.
postAddTwoStepAuthentication-recovery-method-codes = აგრეთვე დამატებული გაქვთ შესვლის სამარქაფო კოდები აღდგენის საშუალებად.
# Variables:
#  $maskedPhoneNumber (String) - A bullet point mask with the last four digits of the user's phone number, e.g. ••••••1234
postAddTwoStepAuthentication-recovery-method-phone = თქვენ დაამატეთ { $maskedPhoneNumber } ნომერი თქვენს აღდგენის ტელეფონად
postAddTwoStepAuthentication-how-protects-link = როგორ იცავს ეს თქვენს ანგარიშს
postAddTwoStepAuthentication-how-protects-plaintext = როგორ იცავს ეს თქვენს ანგარიშს:
postAddTwoStepAuthentication-device-sign-out-message = ყველა დაკავშირებული მოწყობილობის დასაცავად უნდა გამოხვიდეთ ამ ანგარიშით მოსარგებლე თითოეული მათგანიდან, შემდეგ კი კვლავ შეხვიდეთ ორბიჯიანი დამოწმებით.
postChangeAccountRecovery-subject = ანგარიშის აღდგენის გასაღები შეიცვალა
postChangeAccountRecovery-title = თქვენ შეცვალეთ ანგარიშის აღდგენის გასაღები
postChangeAccountRecovery-body-part1 = თქვენ უკვე გაქვთ ანგარიშის აღდგენის ახალი გასაღები. წინა გასაღები წაშლილია.
postChangeAccountRecovery-body-part2 = შეინახეთ ახალი გასაღები უსაფრთხო ადგილას — დაგჭირდებათ ბრაუზერის დაშიფრული მონაცემების აღსადგენად, თუ დაგავიწყდებათ პაროლი.
postChangeAccountRecovery-action = ანგარიშის მართვა
postChangePrimary-subject = მთავარი ელფოსტა განახლებულია
postChangePrimary-title = ახალი მთავარი ელფოსტა
# Variables:
#  $email (String) - A user's email address
postChangePrimary-description-2 = მთავარი ელფოსტა წარმატებით შეიცვალა მისამართით { $email }. უკვე შეგიძლიათ მისი გამოყენება { -product-mozilla-account(case: "loc") } შესასვლელად, ასევე უსაფრთხოების შესახებ ცნობების მისაღებად და ანგარიშზე შესვლების დასამოწმებლად.
postChangePrimary-action = ანგარიშის მართვა
postChangeRecoveryPhone-subject = აღდგენის ტელეფონი განახლებულია
postChangeRecoveryPhone-preview = ანგარიში დაცულია ორბიჯიანი დამოწმებით შესვლისას
postChangeRecoveryPhone-title = თქვენ შეცვალეთ აღდგენის ტელეფონი
postChangeRecoveryPhone-description = თქვენ უკვე გაქვთ მითითებული აღდგენის ახალი ტელეფონი. წინა ტელეფონი წაშლილია.
postChangeRecoveryPhone-requested-device = მოთხოვნა იყო აქედან:
postChangeTwoStepAuthentication-preview = თქვენი ანგარიში დაცულია
postChangeTwoStepAuthentication-subject = ორბიჯიანი დამოწმება განახლდა
postChangeTwoStepAuthentication-title = ორბიჯიანი დამოწმება განახლებულია
postChangeTwoStepAuthentication-use-new-account = ახლა კი საჭიროა, ახლიდან ჩაემატოს { -product-mozilla-account } თქვენს დამმოწმებელ პროგრამაში. ძველი აღარ იმუშავებს და შეგიძლიათ მოაცილოთ.
# After the colon, there is a description of the device that the user used to enable two-step authentication
postChangeTwoStepAuthentication-from-device = თქვენი მოთხოვნის წყარო იყო:
postChangeTwoStepAuthentication-action = ანგარიშის მართვა
postChangeTwoStepAuthentication-how-protects-link = როგორ იცავს ეს თქვენს ანგარიშს
postChangeTwoStepAuthentication-how-protects-plaintext = როგორ იცავს ეს თქვენს ანგარიშს:
postChangeTwoStepAuthentication-device-sign-out-message = ყველა დაკავშირებული მოწყობილობის დასაცავად უნდა გამოხვიდეთ ამ ანგარიშით მოსარგებლე თითოეული მათგანიდან, შემდეგ კი კვლავ შეხვიდეთ ახლად შექმნილი ორბიჯიანი დამოწმებით.
postConsumeRecoveryCode-title-3 = თქვენი სამარქაფო კოდია გამოყენებული პაროლის გასანულებლად
# After the colon, there is description of the device that the backup authentication code was used on
# E.g., Firefox Nightly on Mac OSX, Thursday Sept 2, 2024
postConsumeRecoveryCode-description-3 = კოდის გამოყენების ადგილი:
postConsumeRecoveryCode-action = ანგარიშის მართვა
postConsumeRecoveryCode-subject-v3 = გამოყენებულია შესვლის სამარქაფო კოდი
postConsumeRecoveryCode-preview = გადაამოწმეთ, რომ ნამდვილად თქვენ იყავით
postNewRecoveryCodes-subject-2 = შეიქმნა შესვლის დასამოწმებელი ახალი სამარქაფო კოდები
postNewRecoveryCodes-title-2 = შექმნილია შესვლის დასამოწმებელი ახალი სამარქაფო კოდები
# After the colon, there is information about the device that the authentication codes were created on
postNewRecoveryCodes-description-2 = შეიქმნა აქედან:
postNewRecoveryCodes-action = ანგარიშის მართვა
postRemoveAccountRecovery-subject-2 = ანგარიშის აღდგენის გასაღები წაშლილია
postRemoveAccountRecovery-title-3 = თქვენ წაშალეთ ანგარიშის აღდგენის გასაღები.
postRemoveAccountRecovery-body-part1 = თქვენი ანგარიშის აღდგენის გასაღები საჭიროა ბრაუზერის დაშიფრული მონაცემების აღსადგენად, თუ დაგავიწყდებათ პაროლი.
postRemoveAccountRecovery-body-part2 = თუ ჯერ არ გაქვთ, შექმენით ანგარიშის აღდგენის ახალი გასაღები თქვენი ანგარიშის პარამეტრებიდან, რომ აირიდოთ შენახული პაროლების, სანიშნების, ისტორიისა და სხვა მონაცემების დაკარგვა.
postRemoveAccountRecovery-action = ანგარიშის მართვა
postRemoveRecoveryPhone-subject = აღდგენის ტელეფონი მოცილებულია
postRemoveRecoveryPhone-preview = ანგარიში დაცულია ორბიჯიანი დამოწმებით შესვლისას
postRemoveRecoveryPhone-title = აღდგენის ტელეფონი მოცილებულია
postRemoveRecoveryPhone-description-v2 = თქვენი აღდგენის ტელეფონი მოცილებულია ორბიჯიანი დამოწმების პარამეტრებიდან.
postRemoveRecoveryPhone-description-extra = თქვენ მაინც შეგეძლებათ შესვლა თქვენი სამარქაფო კოდებით, თუ აღარ გექნებათ წვდომა დამმოწმებელ პროგრამასთან.
postRemoveRecoveryPhone-requested-device = მოთხოვნა იყო აქედან:
postRemoveSecondary-subject = დამატებითი ელფოსტა მოცილებულია
postRemoveSecondary-title = დამატებითი ელფოსტა მოცილებულია
# Variables:
#  $secondaryEmail (String) - A user's email address
postRemoveSecondary-description-2 = { $secondaryEmail } მოცილებულია { -product-mozilla-account(case: "gen") } დამატებითი ელფოსტის მისამართებიდან. ამიერიდან, უსაფრთხოების შეტყობინებებისა და შესვლების დასადასტურებელი მოთხოვნები ამ მისამართზე აღარ გამოიგზავნება.
postRemoveSecondary-action = ანგარიშის მართვა
postRemoveTwoStepAuthentication-subject-line-2 = ორბიჯიანი დამოწმება გამორთულია
postRemoveTwoStepAuthentication-title-2 = ორბიჯიანი დამოწმება გამოირთო
# After the colon is a description of the device the user used to disable two-step authentication
postRemoveTwoStepAuthentication-from-device = გამოირთო აქედან:
postRemoveTwoStepAuthentication-action = ანგარიშის მართვა
postRemoveTwoStepAuthentication-not-required-2 = შესვლისას აღარ დაგჭირდებათ უსაფრთხოების კოდები შესვლის დასამოწმებელი აპიდან.
postSigninRecoveryCode-subject = გამოყენებულია სამარქაფო კოდი შესასვლელად
postSigninRecoveryCode-preview = დაამოწმეთ ანგარიშზე მოქმედება
postSigninRecoveryCode-title = თქვენი სამარქაფო კოდია გამოყენებული შესასვლელად
postSigninRecoveryCode-description = თუ ეს თქვენ არ მოგიმოქმედებიათ, დაუყოვნებლივ უნდა შეცვალოთ პაროლი ანგარიშის უსაფრთხოების დასაცავად.
postSigninRecoveryCode-device = შესული ხართ აქედან:
postSigninRecoveryCode-action = ანგარიშის მართვა
postSigninRecoveryPhone-subject = გამოყენებულია აღდგენის ტელეფონი შესვლისთვის
postSigninRecoveryPhone-preview = დაამოწმეთ ანგარიშზე მოქმედება
postSigninRecoveryPhone-title = თქვენს აღდგენის ტელეფონია გამოყენებული შესასვლელად
postSigninRecoveryPhone-description = თუ ეს თქვენ არ მოგიმოქმედებიათ, დაუყოვნებლივ უნდა შეცვალოთ პაროლი ანგარიშის უსაფრთხოების დასაცავად.
postSigninRecoveryPhone-device = შესული ხართ აქედან:
postSigninRecoveryPhone-action = ანგარიშის მართვა
postVerify-sub-title-3 = მოხარულნი ვართ თქვენი ნახვით!
postVerify-title-2 = გსურთ იხილოთ იგივე ჩანართი ორ მოწყობილობაზე?
postVerify-description-2 = უადვილესია! მხოლოდ დააყენეთ { -brand-firefox } სხვა მოწყობილობაზეც და შედით ანგარიშზე სინქრონიზაციისთვის. ნამდვილი ჯადოქრობაა!
postVerify-sub-description = (ჰეი… ეს ნიშნავს იმასაც, რომ შეგიძლიათ თან გაიყოლოთ თქვენი სანიშნები, პაროლები და სხვა { -brand-firefox }-მონაცემები ყველგან, სადაც ანგარიშს გამოიყენებთ).
postVerify-subject-4 = მოგესალმებათ { -brand-mozilla }!
postVerify-setup-2 = სხვა მოწყობილობის დაკავშირება:
postVerify-action-2 = სხვა მოწყობილობის დაკავშირება
postVerifySecondary-subject = ელფოსტის დამატებითი მისამართი დამახსოვრებულია
postVerifySecondary-title = ელფოსტის დამატებითი მისამართი დამახსოვრებულია
# Variables:
#  $secondaryEmail (String) - A user's secondary email address
postVerifySecondary-content-3 = { $secondaryEmail } დამოწმებულია { -product-mozilla-account(case: "gen") } დამატებითი ელფოსტის მისამართად. ამიერიდან, უსაფრთხოების შეტყობინებებისა და შესვლების დასადასტურებელი მოთხოვნები ამ მისამართზე გამოიგზავნება.
postVerifySecondary-action = ანგარიშის მართვა
recovery-subject = პაროლის განულება
recovery-title-2 = დაგავიწყდათ პაროლი?
# Information on the device, location, and date and time of the request that triggered the email follows.
recovery-request-origin-2 = პაროლის შეცვლის მოთხოვნა მივიღეთ თქვენს { -product-mozilla-account(case: "loc") } აქედან:
recovery-new-password-button = შექმენით ახალი პაროლი ქვემოთ მოცემულ ღილაკზე დაჭერით. ბმულს ვადა ამოეწურება მომდევნო საათში.
recovery-copy-paste = შექმენით ახალი პაროლი ქვემოთ მოცემული ბმულის ასლის ბრაუზერში ჩასმით. ბმულს ვადა ამოეწურება მომდევნო საათში.
recovery-action = შექმენით ახალი პაროლი
# Variables:
#  $unblockCode (String) - The authorization code for sign-in
unblockCode-subject-2 = გამოიყენეთ { $unblockCode } შესასვლელად
unblockCode-preview = კოდს ვადა ამოეწურება ერთ საათში
unblockCode-title = ეს თქვენი შესვლაა?
unblockCode-prompt = თუ კი, მაშინ გესაჭიროებათ დაშვების კოდი:
# Variables:
#  $unblockCode (String) - An alphanumeric code
unblockCode-prompt-plaintext = თუ კი, მაშინ გესაჭიროებათ დაშვების კოდი: { $unblockCode }
unblockCode-report = თუ არა, დაგვეხმარეთ დამრღვევების გამოვლენასა და მოგერიებაში და <a data-l10n-name="reportSignInLink">გამოგზავნეთ მოხსენება.</a>
unblockCode-report-plaintext = თუ არა, დაგვეხმარეთ დამრღვევების გამოვლენასა და მოგერიებაში და გამოგზავნეთ მოხსენება.
verificationReminderFinal-subject = საბოლოო შეხსენება ანგარიშის დასადასტურებლად
verificationReminderFinal-description-2 = რამდენიმე კვირის წინ შექმენით { -product-mozilla-account }, მაგრამ ჯერ არ დაგიმოწმებიათ. თქვენი უსაფრთხოებისთვის ჩვენ წავშლით ანგარიშს, თუ მომდევნო 24 საათში არ დაადასტურებთ.
confirm-account = ანგარიშის დადასტურება
confirm-account-plaintext = { confirm-account }:
verificationReminderFirst-subject-2 = არ დაგავიწყდეთ ანგარიშის დადასტურება
verificationReminderFirst-title-3 = მოგესალმებათ { -brand-mozilla }!
verificationReminderFirst-description-3 = რამდენიმე დღის წინ შექმენით { -product-mozilla-account }, მაგრამ ჯერ არ დაგიმოწმებიათ. გთხოვთ დაადასტუროთ მომდევნო 15 დღეში, თუ არადა ავტომატურად წაიშლება.
verificationReminderFirst-sub-description-3 = არ გამოგრჩეთ ბრაუზერი, რომლისთვისაც უწინარესი თქვენი პირადულობაა.
confirm-email-2 = ანგარიშის დადასტურება
confirm-email-plaintext-2 = { confirm-email-2 }:
verificationReminderFirst-action-2 = ანგარიშის დადასტურება
verificationReminderSecond-subject-2 = არ დაგავიწყდეთ ანგარიშის დადასტურება
verificationReminderSecond-title-3 = არ გამოგრჩეთ { -brand-mozilla }!
verificationReminderSecond-description-4 = რამდენიმე დღის წინ შექმენით { -product-mozilla-account }, მაგრამ ჯერ არ დაგიმოწმებიათ. გთხოვთ დაადასტუროთ მომდევნო 10 დღეში, თუ არადა ავტომატურად წაიშლება.
verificationReminderSecond-second-description-3 = თქვენი { -product-mozilla-account } საშუალებას გაძლევთ, დაასინქრონოთ { -brand-firefox } მოწყობილობებს შორის და წვდომა მიიღოთ პირადულობის უზრუნველმყოფ მეტ პროდუქტზე { -brand-mozilla }-ისგან.
verificationReminderSecond-sub-description-2 = გახდით ჩვენი მიზნის მონაწილე, რომ ვაქციოთ ინტერნეტი საყოველთაოდ ღია და თავისუფალი.
verificationReminderSecond-action-2 = ანგარიშის დადასტურება
verify-title-3 = შეაღეთ ინტერნეტის კარი { -brand-mozilla }-თი
verify-description-2 = დაამოწმეთ თქვენი ანგარიში, რომ სრულყოფილად გამოიყენოთ { -brand-mozilla }-ს შესაძლებლობები ყველგან:
verify-subject = დაასრულეთ ანგარიშის შექმნა
verify-action-2 = ანგარიშის დადასტურება
# Variables:
# $code (String) - The verification code
verifyAccountChange-subject = გამოიყენეთ { $code } ანგარიშის შესაცვლელად
# Variables:
# $expirationTime (Number) - Represents the expiration time in minutes
verifyAccountChange-preview =
    { $expirationTime ->
        [one] კოდს ვადა ეწურება { $expirationTime } წუთში.
       *[other] კოდს ვადა ეწურება { $expirationTime } წუთში.
    }
verifyAccountChange-title = ცვლით თქვენი ანგარიშის მონაცემებს?
# After the colon is a description of the device used to sign in to the service
verifyAccountChange-safe = დაგვეხმარეთ თქვენი ანგარიშის უსაფრთხოების უზრუნველყოფაში ამ ცვლილების დამოწმებით:
verifyAccountChange-prompt = თუ კი, მაშინ აქაა თქვენი დასამოწმებელი კოდი:
# Variables:
# $expirationTime (Number) - Represents the expiration time in minutes
verifyAccountChange-expiry-notice =
    { $expirationTime ->
        [one] ვადა ეწურება { $expirationTime } წუთში.
       *[other] ვადა ეწურება { $expirationTime } წუთში.
    }
# Variables:
#  $clientName (String) - A client the user hasn't signed into before (e.g. Firefox, Sync)
verifyLogin-title-2 = თქვენ გამოიყენეთ ანგარიში { $clientName }?
verifyLogin-description-2 = დაგვეხმარეთ თქვენი ანგარიშის უსაფრთხოებაში შესვლის დადასტურებით:
verifyLogin-subject-2 = შესვლის დადასტურება
verifyLogin-action = შესვლის დადასტურება
# Variables:
#  $code (String) - The confirmation code for sign-in
verifyLoginCode-subject-line-3 = გამოიყენეთ { $code } შესასვლელად
verifyLoginCode-preview = ვადა ამოეწურება 5 წუთში.
# Variables:
#  $serviceName (String) - A service the user hasn't signed into before (e.g. Firefox)
verifyLoginCode-title-2 = თქვენ გამოიყენეთ მომსახურება { $serviceName }?
# After the colon is a description of the device used to sign in to the service
verifyLoginCode-safe = დაგვეხმარეთ თქვენი ანგარიშის უსაფრთხოებაში შესვლის დამოწმებით:
verifyLoginCode-prompt-3 = თუ კი, მაშინ აქაა თქვენი დასამოწმებელი კოდი:
verifyLoginCode-expiry-notice = ვადა გაუვა 5 წუთში.
verifyPrimary-title-2 = მთავარი ელფოსტის დადასტურება
verifyPrimary-description = მოთხოვნა ანგარიშის შეცვლის თაობაზე, გამოგზავნილია შემდეგი მოწყობილობიდან:
verifyPrimary-subject = მთავარი ელფოსტის დამოწმება
verifyPrimary-action-2 = ელფოსტის დადასტურება
verifyPrimary-action-plaintext-2 = { verifyPrimary-action-2 }:
verifyPrimary-post-verify-2 = დამოწმების შემდეგ ანგარიშის ცვლილების შესაძლებლობები, როგორიცაა დამატებითი ელფოსტის მითითება, ამ მოწყობილობიდან იქნება ხელმისაწვდომი.
# Variables:
#  $code (String) - The confirmation code for secondary email
verifySecondaryCode-subject-2 = გამოიყენეთ { $code } დამატებითი ელფოსტის დასამოწმებლად
verifySecondaryCode-preview = ვადა ამოეწურება 5 წუთში.
verifySecondaryCode-title-2 = დამატებითი ელფოსტის დადასტურება
verifySecondaryCode-action-2 = ელფოსტის დადასტურება
# Variables:
#  $email (string) A user's unverified secondary email address
verifySecondaryCode-explainer-2 = მოთხოვნის წყარო, რომ { $email } მიეთითოს დამატებით ელფოსტად, არის მოცემული { -product-mozilla-account }:
verifySecondaryCode-prompt-2 = გამოიყენეთ დამადასტურებელი კოდი:
verifySecondaryCode-expiry-notice-2 = ვადა გაუვა 5 წუთში. დამოწმების შემდეგ ამ მისამართზე მიიღებთ უსაფრთხოებისა და დადასტურების შეტყობინებებს.
# Variables:
#  $code (String) - comfirmation code for the account
verifyShortCode-subject-4 = გამოიყენეთ { $code } ანგარიშის დასამოწმებლად
verifyShortCode-preview-2 = ვადა ამოეწურება 5 წუთში
verifyShortCode-title-3 = შეაღეთ ინტერნეტის კარი { -brand-mozilla }-თი
# Information on the browser and device triggering this confirmation email follows below this string.
verifyShortCode-title-subtext-2 = დაამოწმეთ თქვენი ანგარიში, რომ სრულყოფილად გამოიყენოთ { -brand-mozilla }-ს შესაძლებლობები ყველგან:
verifyShortCode-prompt-3 = გამოიყენეთ დამადასტურებელი კოდი:
verifyShortCode-expiry-notice = ვადა გაუვა 5 წუთში.
