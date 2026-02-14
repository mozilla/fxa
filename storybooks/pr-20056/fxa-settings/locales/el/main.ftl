



-brand-mozilla = Mozilla
-brand-firefox = Firefox
-product-firefox-accounts =
    { $case ->
        [gen]
            { $capitalization ->
                [lower] λογαριασμών Firefox
               *[upper] Λογαριασμών Firefox
            }
        [acc]
            { $capitalization ->
                [lower] λογαριασμούς Firefox
               *[upper] Λογαριασμούς Firefox
            }
       *[nom]
            { $capitalization ->
                [lower] λογαριασμοί Firefox
               *[upper] Λογαριασμοί Firefox
            }
    }
-product-mozilla-account =
    { $case ->
        [gen]
            { $capitalization ->
                [lower] λογαριασμού Mozilla
               *[upper] Λογαριασμού Mozilla
            }
        [acc]
            { $capitalization ->
                [lower] λογαριασμό Mozilla
               *[upper] Λογαριασμό Mozilla
            }
       *[nom]
            { $capitalization ->
                [lower] λογαριασμός Mozilla
               *[upper] Λογαριασμός Mozilla
            }
    }
-product-mozilla-accounts =
    { $case ->
        [gen]
            { $capitalization ->
                [lower] λογαριασμών Mozilla
               *[upper] Λογαριασμών Mozilla
            }
        [acc]
            { $capitalization ->
                [lower] λογαριασμούς Mozilla
               *[upper] Λογαριασμούς Mozilla
            }
       *[nom]
            { $capitalization ->
                [lower] λογαριασμοί Mozilla
               *[upper] Λογαριασμοί Mozilla
            }
    }
-product-firefox-account =
    { $case ->
        [gen]
            { $capitalization ->
                [lower] λογαριασμού Firefox
               *[upper] Λογαριασμού Firefox
            }
        [acc]
            { $capitalization ->
                [lower] λογαριασμό Firefox
               *[upper] Λογαριασμό Firefox
            }
       *[nom]
            { $capitalization ->
                [lower] λογαριασμός Firefox
               *[upper] Λογαριασμός Firefox
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

app-general-err-heading = Γενικό σφάλμα εφαρμογής
app-general-err-message = Κάτι πήγε στραβά. Δοκιμάστε ξανά αργότερα.
app-query-parameter-err-heading = Εσφαλμένο αίτημα: Μη έγκυρες παράμετροι ερωτήματος


app-footer-mozilla-logo-label = Λογότυπο { -brand-mozilla }
app-footer-privacy-notice = Σημείωση απορρήτου ιστοτόπου
app-footer-terms-of-service = Όροι υπηρεσίας


app-default-title-2 = { -product-mozilla-accounts(case: "nom", capitalization: "upper") }
app-page-title-2 = { $title } | { -product-mozilla-accounts(case: "nom", capitalization: "upper") }


link-sr-new-window = Ανοίγει σε νέο παράθυρο


app-loading-spinner-aria-label-loading = Φόρτωση…


app-logo-alt-3 =
    .alt = Λογότυπο «m» της { -brand-mozilla }



resend-code-success-banner-heading = Ένας νέος κωδικός στάλθηκε στο email σας.
resend-link-success-banner-heading = Ένας νέος σύνδεσμος στάλθηκε στο email σας.
resend-success-banner-description = Προσθέστε το { $accountsEmail } στις επαφές σας για να εξασφαλίσετε την ομαλή παράδοση.


brand-banner-dismiss-button-2 =
    .aria-label = Κλείσιμο μηνύματος
brand-prelaunch-title = Οι { -product-firefox-accounts(case: "nom", capitalization: "lower") } θα γίνουν { -product-mozilla-accounts(case: "nom", capitalization: "lower") } την 1η Νοεμβρίου
brand-prelaunch-subtitle = Θα συνεχίσετε να συνδέεστε με το ίδιο όνομα χρήστη και κωδικό πρόσβασης και δεν θα γίνουν άλλες αλλαγές στα προϊόντα που χρησιμοποιείτε.
brand-postlaunch-title = Έχουμε μετονομάσει τους { -product-firefox-accounts(case: "acc", capitalization: "lower") } σε { -product-mozilla-accounts(case: "acc", capitalization: "lower") }. Θα συνεχίσετε να συνδέεστε με το ίδιο όνομα χρήστη και κωδικό πρόσβασης και δεν θα γίνουν άλλες αλλαγές στα προϊόντα που χρησιμοποιείτε.
brand-learn-more = Μάθετε περισσότερα
brand-close-banner =
    .alt = Κλείσιμο μηνύματος
brand-m-logo =
    .alt = Λογότυπο «m» της { -brand-mozilla }


button-back-aria-label = Πίσω
button-back-title = Πίσω


recovery-key-download-button-v3 = Λήψη και συνέχεια
    .title = Λήψη και συνέχεια
recovery-key-pdf-heading = Κλειδί ανάκτησης λογαριασμού
recovery-key-pdf-download-date = Δημιουργία: { $date }
recovery-key-pdf-key-legend = Κλειδί ανάκτησης λογαριασμού
recovery-key-pdf-instructions = Αυτό το κλειδί σάς επιτρέπει να ανακτήσετε τα κρυπτογραφημένα δεδομένα του προγράμματος περιήγησής σας (συμπεριλαμβανομένων των κωδικών πρόσβασης, των σελιδοδεικτών και του ιστορικού) εάν ξεχάσετε τον κωδικό πρόσβασής σας. Αποθηκεύστε το σε ένα μέρος που θα θυμάστε.
recovery-key-pdf-storage-ideas-heading = Τοποθεσίες αποθήκευσης του κλειδιού σας
recovery-key-pdf-support = Μάθετε περισσότερα σχετικά με το κλειδί ανάκτησης του λογαριασμού σας
recovery-key-pdf-download-error = Δυστυχώς, προέκυψε πρόβλημα κατά τη λήψη του κλειδιού ανάκτησης του λογαριασμού σας.


button-passkey-signin = Σύνδεση με κλειδί πρόσβασης
button-passkey-signin-loading = Ασφαλής σύνδεση…


choose-newsletters-prompt-2 = Περισσότερα από τη { -brand-mozilla }:
choose-newsletters-option-latest-news =
    .label = Λάβετε τα τελευταία νέα και ενημερώσεις προϊόντων
choose-newsletters-option-test-pilot =
    .label = Πρώιμη πρόσβαση σε δοκιμές νέων προϊόντων
choose-newsletters-option-reclaim-the-internet =
    .label = Ειδοποιήσεις για δράσεις που αφορούν την ανάκτηση του ελέγχου του διαδικτύου


datablock-download =
    .message = Έγινε λήψη
datablock-copy =
    .message = Έγινε αντιγραφή
datablock-print =
    .message = Έγινε εκτύπωση


datablock-copy-success =
    { $count ->
        [one] Έγινε αντιγραφή του κωδικού
       *[other] Έγινε αντιγραφή των κωδικών
    }
datablock-download-success =
    { $count ->
        [one] Έγινε λήψη του κωδικού
       *[other] Έγινε λήψη των κωδικών
    }
datablock-print-success =
    { $count ->
        [one] Έγινε εκτύπωση του κωδικού
       *[other] Έγινε εκτύπωση των κωδικών
    }


datablock-inline-copy =
    .message = Αντιγράφηκε


device-info-block-location-city-region-country = { $city }, { $region }, { $country } (εκτίμηση)
device-info-block-location-region-country = { $region }, { $country } (εκτίμηση)
device-info-block-location-city-country = { $city }, { $country } (εκτίμηση)
device-info-block-location-country = { $country } (εκτίμηση)
device-info-block-location-unknown = Άγνωστη τοποθεσία
device-info-browser-os = { $browserName } σε { $genericOSName }
device-info-ip-address = Διεύθυνση IP: { $ipAddress }


form-password-with-inline-criteria-signup-new-password-label =
    .label = Κωδικός πρόσβασης
form-password-with-inline-criteria-signup-confirm-password-label =
    .label = Επανάληψη κωδικού πρόσβασης
form-password-with-inline-criteria-signup-submit-button = Δημιουργία λογαριασμού
form-password-with-inline-criteria-reset-new-password =
    .label = Νέος κωδικός πρόσβασης
form-password-with-inline-criteria-confirm-password =
    .label = Επιβεβαίωση κωδικού πρόσβασης
form-password-with-inline-criteria-reset-submit-button = Δημιουργία νέου κωδικού πρόσβασης
form-password-with-inline-criteria-set-password-new-password-label =
    .label = Κωδικός πρόσβασης
form-password-with-inline-criteria-set-password-confirm-password-label =
    .label = Επανάληψη κωδικού πρόσβασης
form-password-with-inline-criteria-set-password-submit-button = Έναρξη συγχρονισμού
form-password-with-inline-criteria-match-error = Οι κωδικοί πρόσβασης δεν ταιριάζουν
form-password-with-inline-criteria-sr-too-short-message = Ο κωδικός πρόσβασης πρέπει να περιέχει τουλάχιστον 8 χαρακτήρες.
form-password-with-inline-criteria-sr-not-email-message = Ο κωδικός πρόσβασης δεν πρέπει να περιέχει τη διεύθυνση email σας.
form-password-with-inline-criteria-sr-not-common-message = Ο κωδικός πρόσβασης δεν πρέπει να είναι ένας συνήθης κωδικός πρόσβασης.
form-password-with-inline-criteria-sr-requirements-met = Ο κωδικός πρόσβασης πληροί όλες τις απαιτήσεις.
form-password-with-inline-criteria-sr-passwords-match = Οι κωδικοί πρόσβασης ταιριάζουν.


form-verify-code-default-error = Αυτό το πεδίο απαιτείται


form-verify-totp-disabled-button-title-numeric = Εισαγάγετε τον { $codeLength }ψήφιο κωδικό για να συνεχίσετε
form-verify-totp-disabled-button-title-alphanumeric = Εισαγάγετε τον κωδικό { $codeLength } χαρακτήρων για να συνεχίσετε


get-data-trio-title-firefox = { -brand-firefox }
get-data-trio-title-firefox-recovery-key = Κλειδί ανάκτησης λογαριασμού { -brand-firefox }
get-data-trio-title-backup-verification-codes = Εφεδρικοί κωδικοί ταυτοποίησης
get-data-trio-download-2 =
    .title = Λήψη
    .aria-label = Λήψη
get-data-trio-copy-2 =
    .title = Αντιγραφή
    .aria-label = Αντιγραφή
get-data-trio-print-2 =
    .title = Εκτύπωση
    .aria-label = Εκτύπωση


alert-icon-aria-label =
    .aria-label = Προειδοποίηση
icon-attention-aria-label =
    .aria-label = Προσοχή
icon-warning-aria-label =
    .aria-label = Προειδοποίηση
authenticator-app-aria-label =
    .aria-label = Εφαρμογή ελέγχου ταυτότητας
backup-codes-icon-aria-label-v2 =
    .aria-label = Οι εφεδρικοί κωδικοί ταυτοποίησης ενεργοποιήθηκαν
backup-codes-disabled-icon-aria-label-v2 =
    .aria-label = Οι εφεδρικοί κωδικοί ταυτοποίησης απενεργοποιήθηκαν
backup-recovery-sms-icon-aria-label =
    .aria-label = Η ανάκτησης μέσω SMS ενεργοποιήθηκε
backup-recovery-sms-disabled-icon-aria-label =
    .aria-label = Η ανάκτησης μέσω SMS απενεργοποιήθηκε
canadian-flag-icon-aria-label =
    .aria-label = Καναδική σημαία
checkmark-icon-aria-label =
    .aria-label = Νύγμα
checkmark-success-icon-aria-label =
    .aria-label = Επιτυχία
checkmark-enabled-icon-aria-label =
    .aria-label = Ενεργοποίηση
close-icon-aria-label =
    .aria-label = Κλείσιμο μηνύματος
code-icon-aria-label =
    .aria-label = Κώδικας
error-icon-aria-label =
    .aria-label = Σφάλμα
info-icon-aria-label =
    .aria-label = Πληροφορίες
usa-flag-icon-aria-label =
    .aria-label = Σημαία Ηνωμένων Πολιτειών
icon-loading-arrow-aria-label =
    .aria-label = Φόρτωση
icon-passkey-aria-label =
    .aria-label = Κλειδί πρόσβασης


hearts-broken-image-aria-label =
    .aria-label = Ένας υπολογιστής, ένα κινητό τηλέφωνο και μια εικόνα ραγισμένης καρδιάς στο καθένα
hearts-verified-image-aria-label =
    .aria-label = Ένας υπολογιστής, ένα κινητό τηλέφωνο και ένα tablet με μια καρδιά που πάλλεται στο καθένα
signin-recovery-code-image-description =
    .aria-label = Έγγραφο που περιέχει κρυφό κείμενο.
signin-totp-code-image-label =
    .aria-label = Μια συσκευή με κρυφό εξαψήφιο κωδικό.
confirm-signup-aria-label =
    .aria-label = Ένας φάκελος που περιέχει έναν σύνδεσμο
security-shield-aria-label =
    .aria-label = Απεικόνιση ενός κλειδιού ανάκτησης λογαριασμού.
recovery-key-image-aria-label =
    .aria-label = Απεικόνιση που αναπαριστά ένα κλειδί ανάκτησης λογαριασμού.
password-image-aria-label =
    .aria-label = Μια απεικόνιση που αναπαριστά πληκτρολόγηση ενός κωδικού πρόσβασης.
lightbulb-aria-label =
    .aria-label = Απεικόνιση που αναπαριστά μια υπόδειξη για δημιουργία χώρου.
email-code-image-aria-label =
    .aria-label = Απεικόνιση που αναπαριστά ένα email που περιέχει έναν κωδικό.
recovery-phone-image-description =
    .aria-label = Κινητή συσκευή που λαμβάνει κωδικό μέσω μηνύματος κειμένου.
recovery-phone-code-image-description =
    .aria-label = Ελήφθη κωδικός σε κινητή συσκευή.
backup-recovery-phone-image-aria-label =
    .aria-label = Κινητή συσκευή με δυνατότητες μηνυμάτων κειμένου SMS
backup-authentication-codes-image-aria-label =
    .aria-label = Οθόνη συσκευής με κωδικούς
sync-clouds-image-aria-label =
    .aria-label = Σύννεφα με εικονίδιο συγχρονισμού
confetti-falling-image-aria-label =
    .aria-label = Κινούμενη πτώση κομφετί


inline-recovery-key-setup-signed-in-firefox-2 = Συνδεθήκατε στο { -brand-firefox }.
inline-recovery-key-setup-create-header = Ασφαλίστε τον λογαριασμό σας
inline-recovery-key-setup-create-subheader = Έχετε χρόνο για να προστατέψετε τα δεδομένα σας;
inline-recovery-key-setup-info = Δημιουργήστε ένα κλειδί ανάκτησης λογαριασμού, ώστε να μπορείτε να επαναφέρετε τα συγχρονισμένα δεδομένα περιήγησής σας εάν ξεχάσετε τον κωδικό πρόσβασής σας.
inline-recovery-key-setup-start-button = Δημιουργία κλειδιού ανάκτησης λογαριασμού
inline-recovery-key-setup-later-button = Κάντε το αργότερα


input-password-hide = Απόκρυψη κωδικού πρόσβασης
input-password-show = Εμφάνιση κωδικού πρόσβασης
input-password-hide-aria-2 = Ο κωδικός πρόσβασής σας είναι επί του παρόντος ορατός στην οθόνη.
input-password-show-aria-2 = Ο κωδικός πρόσβασής σας είναι κρυφός.
input-password-sr-only-now-visible = Ο κωδικός πρόσβασής σας είναι πλέον ορατός στην οθόνη.
input-password-sr-only-now-hidden = Ο κωδικός πρόσβασής σας είναι πλέον κρυφός.


input-phone-number-country-list-aria-label = Επιλογή χώρας
input-phone-number-enter-number = Εισαγάγετε τον αριθμό τηλεφώνου
input-phone-number-country-united-states = Ηνωμένες Πολιτείες
input-phone-number-country-canada = Καναδάς
legal-back-button = Πίσω


reset-pwd-link-damaged-header = Ο σύνδεσμος επαναφοράς κωδικού πρόσβασης είναι κατεστραμμένος
signin-link-damaged-header = Ο σύνδεσμος επιβεβαίωσης είναι κατεστραμμένος
report-signin-link-damaged-header = Κατεστραμμένος σύνδεσμος
reset-pwd-link-damaged-message = Ο σύνδεσμος στον οποίο κάνατε κλικ δεν είχε κάποιους χαρακτήρες και ενδέχεται να έχει καταστραφεί από το πρόγραμμα email σας. Αντιγράψτε προσεκτικά τη διεύθυνση και δοκιμάστε ξανά.


link-expired-new-link-button = Λήψη νέου συνδέσμου


remember-password-text = Απομνημόνευση κωδικού πρόσβασης;
remember-password-signin-link = Σύνδεση


primary-email-confirmation-link-reused = Το κύριο email έχει ήδη επαληθευτεί
signin-confirmation-link-reused = Η σύνδεση έχει ήδη επιβεβαιωθεί
confirmation-link-reused-message = Αυτός ο σύνδεσμος επιβεβαίωσης έχει ήδη χρησιμοποιηθεί και μπορεί να χρησιμοποιηθεί μόνο μία φορά.


locale-toggle-select-label = Επιλογή γλώσσας
locale-toggle-browser-default = Προεπιλογή προγράμματος περιήγησης
error-bad-request = Εσφαλμένο αίτημα


password-info-balloon-why-password-info = Χρειάζεστε αυτόν τον κωδικό πρόσβασης για την πρόσβαση σε τυχόν κρυπτογραφημένα δεδομένα που έχετε αποθηκεύσει σε εμάς.
password-info-balloon-reset-risk-info = Η επαναφορά κωδικού πρόσβασης σημαίνει πιθανή απώλεια δεδομένων, όπως κωδικών πρόσβασης και σελιδοδεικτών.


password-strength-long-instruction = Επιλέξτε έναν ισχυρό κωδικό πρόσβασης που δεν έχετε χρησιμοποιήσει σε άλλους ιστοτόπους. Βεβαιωθείτε ότι πληροί τις απαιτήσεις ασφαλείας:
password-strength-short-instruction = Επιλέξτε έναν ισχυρό κωδικό πρόσβασης:
password-strength-inline-min-length = Τουλάχιστον 8 χαρακτήρες
password-strength-inline-not-email = Όχι τη διεύθυνση email σας
password-strength-inline-not-common = Όχι κάποιο συνήθη κωδικό πρόσβασής σας
password-strength-inline-confirmed-must-match = Η επιβεβαίωση ταιριάζει με τον νέο κωδικό πρόσβασης
password-strength-inline-passwords-match = Οι κωδικοί πρόσβασης ταιριάζουν


account-recovery-notification-cta = Δημιουργία
account-recovery-notification-header-value = Μην χάσετε τα δεδομένα σας εάν ξεχάσετε τον κωδικό πρόσβασής σας
account-recovery-notification-header-description = Δημιουργήστε ένα κλειδί ανάκτησης λογαριασμού, για να επαναφέρετε τα συγχρονισμένα δεδομένα περιήγησής σας σε περίπτωση που ξεχάσετε τον κωδικό πρόσβασής σας.
recovery-phone-promo-cta = Προσθήκη τηλεφώνου ανάκτησης
recovery-phone-promo-heading = Προσθέστε επιπλέον προστασία στον λογαριασμό σας με ένα τηλέφωνο ανάκτησης
recovery-phone-promo-description = Μπορείτε πλέον να συνδεθείτε με έναν κωδικό πρόσβασης μίας χρήσης μέσω SMS εάν δεν μπορείτε να χρησιμοποιήσετε την εφαρμογή ελέγχου ταυτότητας δύο παραγόντων.
recovery-phone-promo-info-link = Μάθετε περισσότερα σχετικά με την ανάκτηση και τον κίνδυνο εναλλαγής SIM
promo-banner-dismiss-button =
    .aria-label = Απόρριψη μηνύματος


ready-complete-set-up-instruction = Ολοκληρώστε τη ρύθμιση εισάγοντας τον νέο κωδικό πρόσβασής σας στις άλλες σας συσκευές με { -brand-firefox }.
manage-your-account-button = Διαχείριση του λογαριασμού σας
ready-use-service = Μπορείτε τώρα να χρησιμοποιήσετε το { $serviceName }
ready-use-service-default = Μπορείτε πλέον χρησιμοποιήσετε τις ρυθμίσεις λογαριασμού
ready-account-ready = Ο λογαριασμός σας είναι έτοιμος!
ready-continue = Συνέχεια
sign-in-complete-header = Η σύνδεση επιβεβαιώθηκε
sign-up-complete-header = Ο λογαριασμός επιβεβαιώθηκε
primary-email-verified-header = Το κύριο email επιβεβαιώθηκε


flow-recovery-key-download-storage-ideas-heading-v2 = Τοποθεσίες αποθήκευσης του κλειδιού σας:
flow-recovery-key-download-storage-ideas-folder-v2 = Φάκελος σε ασφαλή συσκευή
flow-recovery-key-download-storage-ideas-cloud = Αξιόπιστος χώρος αποθήκευσης σε cloud
flow-recovery-key-download-storage-ideas-print-v2 = Εκτυπωμένο φυσικό αντίγραφο
flow-recovery-key-download-storage-ideas-pwd-manager = Διαχείριση κωδικών πρόσβασης


flow-recovery-key-hint-header-v2 = Προσθέστε μια υπόδειξη για να βρείτε εύκολα το κλειδί σας
flow-recovery-key-hint-message-v3 = Αυτή η υπόδειξη θα σας βοηθήσει να θυμηθείτε πού αποθηκεύσατε το κλειδί ανάκτησης του λογαριασμού σας. Μπορούμε να σας την εμφανίσουμε κατά την επαναφορά του κωδικού πρόσβασης για να ανακτήσετε τα δεδομένα σας.
flow-recovery-key-hint-input-v2 =
    .label = Εισαγάγετε μια υπόδειξη (προαιρετικό)
flow-recovery-key-hint-cta-text = Τέλος
flow-recovery-key-hint-char-limit-error = Η υπόδειξη πρέπει να περιέχει λιγότερους από 255 χαρακτήρες.
flow-recovery-key-hint-unsafe-char-error = Η υπόδειξη δεν μπορεί να περιέχει μη ασφαλείς χαρακτήρες unicode. Επιτρέπονται μόνο γράμματα, αριθμοί, σημεία στίξης και σύμβολα.


password-reset-warning-icon = Προειδοποίηση
password-reset-chevron-expanded = Σύμπτυξη προειδοποίησης
password-reset-chevron-collapsed = Ανάπτυξη προειδοποίησης
password-reset-data-may-not-be-recovered = Τα δεδομένα του προγράμματος περιήγησής σας ενδέχεται να μην ανακτηθούν
password-reset-previously-signed-in-device-2 = Είχατε συνδεθεί από κάποια συσκευή στο παρελθόν;
password-reset-data-may-be-saved-locally-2 = Τα δεδομένα του προγράμματος περιήγησής σας ενδέχεται να έχουν αποθηκευτεί σε εκείνη τη συσκευή. Κάντε επαναφορά του κωδικού πρόσβασής σας και συνδεθείτε εκεί για να ανακτήσετε και να συγχρονίσετε τα δεδομένα σας.
password-reset-no-old-device-2 = Έχετε μια νέα συσκευή, αλλά δεν έχετε πρόσβαση σε καμία από τις προηγούμενες;
password-reset-encrypted-data-cannot-be-recovered-2 = Λυπούμαστε, αλλά δεν είναι δυνατή η ανάκτηση των κρυπτογραφημένων δεδομένων περιήγησής σας από τους διακομιστές του { -brand-firefox }.
password-reset-warning-have-key = Διαθέτετε κλειδί ανάκτησης λογαριασμού;
password-reset-warning-use-key-link = Χρησιμοποιήστε το τώρα για να επαναφέρετε τον κωδικό πρόσβασής σας και να διατηρήσετε τα δεδομένα σας


alert-bar-close-message = Κλείσιμο μηνύματος


avatar-your-avatar =
    .alt = Η εικόνα σας
avatar-default-avatar =
    .alt = Προεπιλεγμένη εικόνα χρήστη




bento-menu-title-3 = Προϊόντα { -brand-mozilla }
bento-menu-tagline = Περισσότερα προϊόντα από τη { -brand-mozilla } που προστατεύουν το απόρρητό σας
bento-menu-vpn-2 = { -product-mozilla-vpn }
bento-menu-monitor-3 = { -product-mozilla-monitor }
bento-menu-firefox-relay-2 = { -product-firefox-relay }
bento-menu-firefox-desktop = { -brand-firefox } για υπολογιστές
bento-menu-firefox-mobile = { -brand-firefox } για κινητές συσκευές
bento-menu-made-by-mozilla = Από τη { -brand-mozilla }


connect-another-fx-mobile = Αποκτήστε το { -brand-firefox } για κινητά ή tablet
connect-another-find-fx-mobile-2 = Βρείτε το { -brand-firefox } στο { -google-play } και το { -app-store }.
connect-another-play-store-image-2 =
    .alt = Λήψη του { -brand-firefox } στο { -google-play }
connect-another-app-store-image-3 =
    .alt = Λήψη του { -brand-firefox } στο { -app-store }


cs-heading = Συνδεδεμένες υπηρεσίες
cs-description = Όλες οι υπηρεσίες που χρησιμοποιείτε και έχετε κάνετε σύνδεση.
cs-cannot-refresh =
    Δυστυχώς, προέκυψε πρόβλημα με την ανανέωση της λίστας συνδεδεμένων
    υπηρεσιών.
cs-cannot-disconnect = Η εφαρμογή πελάτη δεν βρέθηκε, δεν είναι δυνατή η αποσύνδεση
cs-logged-out-2 = Έγινε αποσύνδεση από το { $service }
cs-refresh-button =
    .title = Ανανέωση συνδεδεμένων υπηρεσιών
cs-missing-device-help = Απουσία ή διπλή παρουσία στοιχείων;
cs-disconnect-sync-heading = Αποσύνδεση από το Sync


cs-disconnect-sync-content-3 =
    Τα δεδομένα περιήγησής σας θα παραμείνουν στο <span>{ $device }</span>,
    αλλά δεν θα συγχρονίζονται πλέον με τον λογαριασμό σας.
cs-disconnect-sync-reason-3 = Ποιος είναι ο κύριος λόγος για την αποσύνδεση του <span>{ $device }</span>;


cs-disconnect-sync-opt-prefix = Η συσκευή:
cs-disconnect-sync-opt-suspicious = Είναι ύποπτη
cs-disconnect-sync-opt-lost = Έχει χαθεί ή κλαπεί
cs-disconnect-sync-opt-old = Είναι παλιά ή έχει αντικατασταθεί
cs-disconnect-sync-opt-duplicate = Είναι αντίγραφο
cs-disconnect-sync-opt-not-say = Προτιμώ να μην πω


cs-disconnect-advice-confirm = Εντάξει, το κατάλαβα
cs-disconnect-lost-advice-heading = Αποσυνδέθηκε απολεσθείσα ή κλεμμένη συσκευή
cs-disconnect-lost-advice-content-3 = Εφόσον η συσκευή σας χάθηκε ή κλάπηκε, θα πρέπει να αλλάξετε τον κωδικό πρόσβασης του { -product-mozilla-account(case: "gen", capitalization: "lower") } στις ρυθμίσεις λογαριασμού σας, για την προστασία των δεδομένων σας. Θα πρέπει επίσης να αναζητήσετε πληροφορίες από τον κατασκευαστή της συσκευής σας σχετικά με την απομακρυσμένη διαγραφή δεδομένων.
cs-disconnect-suspicious-advice-heading = Η ύποπτη συσκευή αποσυνδέθηκε
cs-disconnect-suspicious-advice-content-2 =
    Αν η αποσυνδεδεμένη συσκευή είναι πράγματι ύποπτη, θα πρέπει να αλλάξετε τον κωδικό πρόσβασης του
    { -product-mozilla-account(case: "gen", capitalization: "lower") } σας, για την προστασία των δεδομένων σας. Θα πρέπει επίσης να αλλάξετε όλους τους άλλους αποθηκευμένους κωδικούς πρόσβασης του { -brand-firefox } στη σελίδα «about:logins».
cs-sign-out-button = Αποσύνδεση


dc-heading = Συλλογή και χρήση δεδομένων
dc-subheader-moz-accounts = { -product-mozilla-accounts(case: "nom", capitalization: "upper") }
dc-subheader-ff-browser = Πρόγραμμα περιήγησης { -brand-firefox }
dc-subheader-content-2 = Να επιτρέπεται στους { -product-mozilla-accounts(case: "acc", capitalization: "lower") } η αποστολή τεχνικών δεδομένων και δεδομένων αλληλεπίδρασης στη { -brand-mozilla }.
dc-subheader-ff-content = Για να ελέγξετε ή να ενημερώσετε τις ρυθμίσεις των τεχνικών δεδομένων και των δεδομένων αλληλεπίδρασης του προγράμματος περιήγησης { -brand-firefox }, ανοίξτε τις ρυθμίσεις του { -brand-firefox } και μεταβείτε στην ενότητα «Απόρρητο και ασφάλεια».
dc-opt-out-success-2 = Επιτυχής απενεργοποίηση. Οι { -product-mozilla-accounts(case: "nom", capitalization: "lower") } δεν θα στέλνουν τεχνικά δεδομένα ή δεδομένα αλληλεπίδρασης στη { -brand-mozilla }.
dc-opt-in-success-2 = Ευχαριστούμε! Η κοινοποίηση αυτών των δεδομένων μάς βοηθά να βελτιώσουμε τους { -product-mozilla-accounts(case: "acc", capitalization: "lower") }.
dc-opt-in-out-error-2 = Δυστυχώς, προέκυψε πρόβλημα κατά την αλλαγή της προτίμησής σας για τη συλλογή δεδομένων
dc-learn-more = Μάθετε περισσότερα


drop-down-menu-title-2 = Μενού { -product-mozilla-account(case: "gen", capitalization: "lower") }
drop-down-menu-signed-in-as-v2 = Συνδεθήκατε ως
drop-down-menu-sign-out = Αποσύνδεση
drop-down-menu-sign-out-error-2 = Δυστυχώς, προέκυψε πρόβλημα κατά την αποσύνδεση


flow-container-back = Πίσω


flow-recovery-key-confirm-pwd-heading-v2 = Εισαγάγετε ξανά τον κωδικό πρόσβασής σας για ασφάλεια
flow-recovery-key-confirm-pwd-input-label = Εισαγάγετε τον κωδικό πρόσβασής σας
flow-recovery-key-confirm-pwd-submit-button = Δημιουργία κλειδιού ανάκτησης λογαριασμού
flow-recovery-key-confirm-pwd-submit-button-change-key = Δημιουργία νέου κλειδιού ανάκτησης λογαριασμού


flow-recovery-key-download-heading-v2 = Το κλειδί ανάκτησης λογαριασμού δημιουργήθηκε. Κάντε λήψη και αποθήκευσή του τώρα
flow-recovery-key-download-info-v2 = Αυτό το κλειδί σάς επιτρέπει να ανακτήσετε τα δεδομένα σας εάν ξεχάσετε τον κωδικό πρόσβασής σας. Αποθηκεύστε το κάπου που θα θυμάστε. Δεν θα μπορείτε να επιστρέψετε σε αυτήν τη σελίδα αργότερα.
flow-recovery-key-download-next-link-v2 = Συνέχεια χωρίς λήψη


flow-recovery-key-success-alert = Το κλειδί ανάκτησης λογαριασμού δημιουργήθηκε


flow-recovery-key-info-header = Δημιουργήστε ένα κλειδί ανάκτησης λογαριασμού σε περίπτωση που ξεχάσετε τον κωδικό πρόσβασής σας
flow-recovery-key-info-header-change-key = Αλλαγή κλειδιού ανάκτησης λογαριασμού
flow-recovery-key-info-shield-bullet-point-v2 = Κρυπτογραφούμε τα δεδομένα περιήγησης, τους κωδικούς πρόσβασης, τους σελιδοδείκτες και πολλά άλλα. Είναι εξαιρετικό για το απόρρητο, αλλά μπορεί να χάσετε τα δεδομένα σας εάν ξεχάσετε τον κωδικό πρόσβασής σας.
flow-recovery-key-info-key-bullet-point-v2 = Αυτός είναι ο λόγος για τον οποίο η δημιουργία ενός κλειδιού ανάκτησης λογαριασμού είναι τόσο σημαντική: μπορείτε να το χρησιμοποιήσετε για να επαναφέρετε τα δεδομένα σας.
flow-recovery-key-info-cta-text-v3 = Έναρξη
flow-recovery-key-info-cancel-link = Ακύρωση


flow-setup-2fa-qr-heading = Συνδεθείτε στην εφαρμογή ελέγχου ταυτότητάς σας
flow-setup-2a-qr-instruction = <strong>Βήμα 1:</strong> Σαρώστε αυτόν τον κωδικό QR με οποιαδήποτε εφαρμογή ελέγχου ταυτότητας, όπως το Duo ή τον Επαληθευτή Google.
flow-setup-2fa-qr-alt-text =
    .alt = Κωδικός QR για τη ρύθμιση της ταυτοποίησης δύο παραγόντων. Σαρώστε τον ή επιλέξτε «Αδυναμία σάρωσης κωδικού QR;» για να αποκτήστε ένα μυστικό κλειδί ρύθμισης.
flow-setup-2fa-cant-scan-qr-button = Αδυναμία σάρωσης κωδικού QR;
flow-setup-2fa-manual-key-heading = Εισαγάγετε τον κωδικό χειροκίνητα
flow-setup-2fa-manual-key-instruction = <strong>Βήμα 1:</strong> Εισαγάγετε αυτόν τον κωδικό στην εφαρμογή ελέγχου ταυτότητας της επιλογής σας.
flow-setup-2fa-scan-qr-instead-button = Σάρωση κωδικού QR;
flow-setup-2fa-more-info-link = Μάθετε περισσότερα για τις εφαρμογές ελέγχου ταυτότητας
flow-setup-2fa-button = Συνέχεια
flow-setup-2fa-step-2-instruction = <strong>Βήμα 2:</strong> Εισαγάγετε τον κωδικό από την εφαρμογή ελέγχου ταυτότητάς σας.
flow-setup-2fa-input-label = Εισαγάγετε τον εξαψήφιο κωδικό
flow-setup-2fa-code-error = Μη έγκυρος ή ληγμένος κωδικός. Ελέγξτε την εφαρμογή ελέγχου ταυτότητας και δοκιμάστε ξανά.


flow-setup-2fa-backup-choice-heading = Επιλέξτε μια μέθοδο ανάκτησης
flow-setup-2fa-backup-choice-description = Αυτή σας επιτρέπει να συνδεθείτε εάν χάσετε την πρόσβαση στην κινητή συσκευή ή την εφαρμογή ελέγχου ταυτότητάς σας.
flow-setup-2fa-backup-choice-phone-title = Τηλέφωνο ανάκτησης
flow-setup-2fa-backup-choice-phone-badge = Ευκολότερη μέθοδος
flow-setup-2fa-backup-choice-phone-info = Λάβετε έναν κωδικό ανάκτησης μέσω γραπτού μηνύματος. Διατίθεται προς το παρόν στις ΗΠΑ και τον Καναδά.
flow-setup-2fa-backup-choice-code-title = Εφεδρικοί κωδικοί ταυτοποίησης
flow-setup-2fa-backup-choice-code-badge = Ασφαλέστερη μέθοδος
flow-setup-2fa-backup-choice-code-info = Δημιουργήστε και αποθηκεύστε κωδικούς ταυτοποίησης μιας χρήσης.
flow-setup-2fa-backup-choice-learn-more-link = Μάθετε για την ανάκτηση και τον κίνδυνο εναλλαγής SIM


flow-setup-2fa-backup-code-confirm-heading = Εισαγάγετε εφεδρικό κωδικό ταυτοποίησης
flow-setup-2fa-backup-code-confirm-confirm-saved = Πληκτρολογήστε έναν από τους κωδικούς σας για να επιβεβαιώσετε ότι τους έχετε αποθηκεύσει. Χωρίς αυτούς τους κωδικούς, ενδέχεται να μην μπορείτε να συνδεθείτε αν δεν έχετε την εφαρμογή ελέγχου ταυτότητάς σας.
flow-setup-2fa-backup-code-confirm-code-input = Εισαγάγετε κωδικό 10 χαρακτήρων
flow-setup-2fa-backup-code-confirm-button-finish = Τέλος


flow-setup-2fa-backup-code-dl-heading = Αποθήκευση εφεδρικών κωδικών ταυτοποίησης
flow-setup-2fa-backup-code-dl-save-these-codes = Διατηρήστε τους σε ένα μέρος που θα θυμάστε. Σε περίπτωση που δεν έχετε πρόσβαση στην εφαρμογή ελέγχου ταυτότητάς σας, θα χρειαστεί να εισαγάγετε έναν από αυτούς τους κωδικούς για να συνδεθείτε.
flow-setup-2fa-backup-code-dl-button-continue = Συνέχεια


flow-setup-2fa-inline-complete-success-banner = Η ταυτοποίηση δύο παραγόντων ενεργοποιήθηκε
flow-setup-2fa-inline-complete-success-banner-description = Για την προστασία όλων των συνδεδεμένων συσκευών σας, θα πρέπει να αποσυνδεθείτε από οπουδήποτε χρησιμοποιείτε αυτόν τον λογαριασμό και έπειτα, να συνδεθείτε ξανά με τη χρήση της νέας σας ταυτοποίησης δύο παραγόντων.
flow-setup-2fa-inline-complete-backup-code = Εφεδρικοί κωδικοί ταυτοποίησης
flow-setup-2fa-inline-complete-backup-phone = Τηλέφωνο ανάκτησης
flow-setup-2fa-inline-complete-backup-code-info =
    { $count ->
        [one] Απομένει { $count } κωδικός
       *[other] Απομένουν { $count } κωδικοί
    }
flow-setup-2fa-inline-complete-backup-code-description = Αυτή είναι η πιο ασφαλής μέθοδος ανάκτησης εάν δεν μπορείτε να συνδεθείτε με την κινητή σας συσκευή ή την εφαρμογή ελέγχου ταυτότητάς σας.
flow-setup-2fa-inline-complete-backup-phone-description = Αυτή είναι η πιο εύκολη μέθοδος ανάκτησης εάν δεν μπορείτε να συνδεθείτε με την εφαρμογή ελέγχου ταυτότητάς σας.
flow-setup-2fa-inline-complete-learn-more-link = Πώς προστατεύεται ο λογαριασμός σας
flow-setup-2fa-inline-complete-continue-button = Συνέχεια στο { $serviceName }
flow-setup-2fa-prompt-heading = Ρύθμιση ταυτοποίησης δύο παραγόντων
flow-setup-2fa-prompt-description = Το { $serviceName } απαιτεί να ρυθμίσετε την ταυτοποίηση δύο παραγόντων για την προστασία του λογαριασμού σας.
flow-setup-2fa-prompt-use-authenticator-apps = Μπορείτε να χρησιμοποιήσετε οποιαδήποτε από <authenticationAppsLink>αυτές τις εφαρμογές ελέγχου ταυτότητας</authenticationAppsLink> για να συνεχίσετε.
flow-setup-2fa-prompt-continue-button = Συνέχεια


flow-setup-phone-confirm-code-heading = Εισάγετε τον κωδικό επαλήθευσής
flow-setup-phone-confirm-code-instruction = Ένας εξαψήφιος κωδικός έχει αποσταλεί στο <span>{ $phoneNumber }</span> μέσω μηνύματος κειμένου. Αυτός ο κωδικός λήγει μετά από 5 λεπτά.
flow-setup-phone-confirm-code-input-label = Εισαγάγετε τον εξαψήφιο κωδικό
flow-setup-phone-confirm-code-button = Επιβεβαίωση
flow-setup-phone-confirm-code-expired = Έληξε ο κωδικός;
flow-setup-phone-confirm-code-resend-code-button = Αποστολή νέου κωδικού
flow-setup-phone-confirm-code-resend-code-success = Ο κωδικός απεστάλη
flow-setup-phone-confirm-code-success-message-v2 = Προστέθηκε τηλέφωνο ανάκτησης
flow-change-phone-confirm-code-success-message = Το τηλέφωνο ανάκτησης άλλαξε


flow-setup-phone-submit-number-heading = Επαληθεύστε τον αριθμό τηλεφώνου σας
flow-setup-phone-verify-number-instruction = Θα λάβετε ένα μήνυμα κειμένου από τη { -brand-mozilla } με έναν κωδικό για την επαλήθευση του αριθμού σας. Μην μοιραστείτε αυτόν τον κωδικό με κανέναν.
flow-setup-phone-submit-number-info-message-v2 = Το τηλέφωνο ανάκτησης είναι διαθέσιμο μόνο στις Ηνωμένες Πολιτείες και τον Καναδά. Δεν προτείνεται η χρήση αριθμών VoIP και μασκών τηλεφώνου.
flow-setup-phone-submit-number-legal = Παρέχοντας τον αριθμό σας, συμφωνείτε με την αποθήκευσή του από εμάς, ώστε να μπορούμε να σας στέλνουμε μηνύματα αποκλειστικά για την επαλήθευση του λογαριασμού σας. Ενδέχεται να ισχύουν χρεώσεις μηνυμάτων και δεδομένων.
flow-setup-phone-submit-number-button = Αποστολή κωδικού


header-menu-open = Κλείσιμο μενού
header-menu-closed = Μενού πλοήγησης ιστοτόπου
header-back-to-top-link =
    .title = Επιστροφή στην κορυφή
header-back-to-settings-link =
    .title = Επιστροφή στις ρυθμίσεις { -product-mozilla-account(case: "gen", capitalization: "lower") }
header-title-2 = { -product-mozilla-account(case: "nom", capitalization: "upper") }
header-help = Βοήθεια


la-heading = Συνδεδεμένοι λογαριασμοί
la-description = Έχετε παραχωρήσει πρόσβαση στους εξής λογαριασμούς.
la-unlink-button = Αποσύνδεση
la-unlink-account-button = Αποσύνδεση
la-set-password-button = Ορισμός κωδικού πρόσβασης
la-unlink-heading = Αποσύνδεση από τρίτο λογαριασμό
la-unlink-content-3 = Θέλετε σίγουρα να αποσυνδέσετε τον λογαριασμό σας; Η αποσύνδεση του λογαριασμού σας δεν θα σας αποσυνδέσει αυτόματα από τις συνδεδεμένες υπηρεσίες σας. Για να το κάνετε αυτό, θα πρέπει να αποσυνδεθείτε χειροκίνητα από την ενότητα «Συνδεδεμένες υπηρεσίες».
la-unlink-content-4 = Πριν αποσυνδέσετε τον λογαριασμό σας, πρέπει να ορίσετε έναν κωδικό πρόσβασης. Χωρίς κωδικό πρόσβασης, δεν θα υπάρχει τρόπος να κάνετε είσοδο μετά την αποσύνδεση του λογαριασμού σας.
nav-linked-accounts = { la-heading }


modal-close-title = Κλείσιμο
modal-cancel-button = Ακύρωση
modal-default-confirm-button = Επιβεβαίωση


modal-mfa-protected-title = Εισαγωγή κωδικού επιβεβαίωσης
modal-mfa-protected-subtitle = Βοηθήστε μας να βεβαιωθούμε ότι εσείς αλλάζετε τα στοιχεία του λογαριασμού σας
modal-mfa-protected-instruction =
    { $expirationTime ->
        [one] Εισαγάγετε τον κωδικό που απεστάλη στο <email>{ $email }</email> εντός { $expirationTime } λεπτού.
       *[other] Εισαγάγετε τον κωδικό που απεστάλη στο <email>{ $email }</email> εντός { $expirationTime } λεπτών.
    }
modal-mfa-protected-input-label = Εισαγάγετε τον εξαψήφιο κωδικό
modal-mfa-protected-cancel-button = Ακύρωση
modal-mfa-protected-confirm-button = Επιβεβαίωση
modal-mfa-protected-code-expired = Έληξε ο κωδικός;
modal-mfa-protected-resend-code-link = Αποστολή νέου κωδικού.


mvs-verify-your-email-2 = Επιβεβαίωση email
mvs-enter-verification-code-2 = Εισαγωγή κωδικού επιβεβαίωσης
mvs-enter-verification-code-desc-2 = Εισαγάγετε τον κωδικό επιβεβαίωσης που απεστάλη στο <email>{ $email }</email> εντός 5 λεπτών.
msv-cancel-button = Ακύρωση
msv-submit-button-2 = Επιβεβαίωση


nav-settings = Ρυθμίσεις
nav-profile = Προφίλ
nav-security = Ασφάλεια
nav-connected-services = Συνδεδεμένες υπηρεσίες
nav-data-collection = Συλλογή και χρήση δεδομένων
nav-paid-subs = Συνδρομές επί πληρωμή
nav-email-comm = Επικοινωνία μέσω email


page-2fa-change-title = Τροποποίηση ελέγχου ταυτότητας δύο παραγόντων
page-2fa-change-success = Η ταυτοποίηση δύο παραγόντων έχει ενημερωθεί
page-2fa-change-success-additional-message = Για την προστασία όλων των συνδεδεμένων συσκευών σας, θα πρέπει να αποσυνδεθείτε από οπουδήποτε χρησιμοποιείτε αυτόν τον λογαριασμό και έπειτα, να συνδεθείτε ξανά με τη χρήση της νέας σας ταυτοποίησης δύο παραγόντων.
page-2fa-change-totpinfo-error = Προέκυψε σφάλμα κατά την αντικατάσταση της εφαρμογής ταυτοποίησης δύο παραγόντων. Δοκιμάστε ξανά αργότερα.
page-2fa-change-qr-instruction = <strong>Βήμα 1:</strong> Σαρώστε τον κωδικό QR με οποιαδήποτε εφαρμογή ελέγχου ταυτότητας, όπως το Duo ή το Google Authenticator. Αυτό δημιουργεί μια νέα σύνδεση και οι παλιές συνδέσεις δεν θα λειτουργούν πλέον.


tfa-backup-codes-page-title = Εφεδρικοί κωδικοί ταυτοποίησης
tfa-replace-code-error-3 = Προέκυψε πρόβλημα κατά την αντικατάσταση των εφεδρικών κωδικών ταυτοποίησής σας
tfa-create-code-error = Προέκυψε πρόβλημα κατά τη δημιουργία των εφεδρικών κωδικών ταυτοποίησής σας
tfa-replace-code-success-alert-4 = Οι εφεδρικοί κωδικοί ταυτοποίησης ενημερώθηκαν
tfa-create-code-success-alert = Οι εφεδρικοί κωδικοί ταυτοποίησης δημιουργήθηκαν
tfa-replace-code-download-description = Φυλάξτε τους σε ένα μέρος που θα θυμάστε. Οι παλιοί σας κωδικοί ταυτοποίησης θα αντικατασταθούν αφού ολοκληρώσετε το επόμενο βήμα.
tfa-replace-code-confirm-description = Επιβεβαιώστε ότι έχετε αποθηκεύσει τους κωδικούς ταυτοποίησης σας εισάγοντας έναν. Οι παλιοί σας εφεδρικοί κωδικοί θα απενεργοποιηθούν μόλις ολοκληρωθεί αυτό το βήμα.
tfa-incorrect-recovery-code-1 = Εσφαλμένος εφεδρικός κωδικός ταυτοποίησης


page-2fa-setup-title = Ταυτοποίηση δύο παραγόντων
page-2fa-setup-totpinfo-error = Προέκυψε σφάλμα κατά τη ρύθμιση της ταυτοποίησης δύο παραγόντων. Δοκιμάστε ξανά αργότερα.
page-2fa-setup-incorrect-backup-code-error = Αυτός ο κωδικός δεν είναι σωστός. Δοκιμάστε ξανά.
page-2fa-setup-success = Η ταυτοποίηση δύο παραγόντων έχει ενεργοποιηθεί
page-2fa-setup-success-additional-message = Για την προστασία όλων των συνδεδεμένων συσκευών σας, θα πρέπει να αποσυνδεθείτε από οπουδήποτε χρησιμοποιείτε αυτόν τον λογαριασμό και έπειτα, να συνδεθείτε ξανά με τη χρήση της ταυτοποίησης δύο παραγόντων.


avatar-page-title =
    .title = Εικόνα προφίλ
avatar-page-add-photo = Προσθήκη φωτογραφίας
avatar-page-add-photo-button =
    .title = { avatar-page-add-photo }
avatar-page-take-photo = Λήψη φωτογραφίας
avatar-page-take-photo-button =
    .title = { avatar-page-take-photo }
avatar-page-remove-photo = Αφαίρεση φωτογραφίας
avatar-page-remove-photo-button =
    .title = { avatar-page-remove-photo }
avatar-page-retake-photo = Νέα λήψη φωτογραφίας
avatar-page-cancel-button = Ακύρωση
avatar-page-save-button = Αποθήκευση
avatar-page-saving-button = Αποθήκευση…
avatar-page-zoom-out-button =
    .title = Σμίκρυνση
avatar-page-zoom-in-button =
    .title = Μεγέθυνση
avatar-page-rotate-button =
    .title = Περιστροφή
avatar-page-camera-error = Δεν ήταν δυνατή η εκκίνηση της κάμερας
avatar-page-new-avatar =
    .alt = νέα εικόνα προφίλ
avatar-page-file-upload-error-3 = Προέκυψε πρόβλημα κατά τη μεταφόρτωση της εικόνας του προφίλ σας
avatar-page-delete-error-3 = Προέκυψε πρόβλημα κατά τη διαγραφή της εικόνας του προφίλ σας
avatar-page-image-too-large-error-2 = Το μέγεθος του αρχείου εικόνας είναι πολύ μεγάλο για μεταφόρτωση


pw-change-header =
    .title = Αλλαγή κωδικού πρόσβασης
pw-8-chars = Τουλάχιστον 8 χαρακτήρες
pw-not-email = Όχι τη διεύθυνση email σας
pw-change-must-match = Ο νέος κωδικός πρόσβασης αντιστοιχεί στην επιβεβαίωση
pw-commonly-used = Όχι κάποιο συνήθη κωδικό πρόσβασής σας
pw-tips = Για την προστασία σας, μην επαναχρησιμοποιείτε κωδικούς πρόσβασης. Δείτε περισσότερες συμβουλές για τη <linkExternal>δημιουργία ισχυρών κωδικών πρόσβασης</linkExternal>.
pw-change-cancel-button = Ακύρωση
pw-change-save-button = Αποθήκευση
pw-change-forgot-password-link = Ξεχάσατε τον κωδικό πρόσβασής σας;
pw-change-current-password =
    .label = Εισαγωγή τρέχοντος κωδικού πρόσβασης
pw-change-new-password =
    .label = Εισαγωγή νέου κωδικού πρόσβασης
pw-change-confirm-password =
    .label = Επιβεβαίωση νέου κωδικού πρόσβασης
pw-change-success-alert-2 = Ο κωδικός πρόσβασης ενημερώθηκε


pw-create-header =
    .title = Δημιουργία κωδικού πρόσβασης
pw-create-success-alert-2 = Ο κωδικός πρόσβασης ορίστηκε
pw-create-error-2 = Δυστυχώς, προέκυψε πρόβλημα κατά τον ορισμό του κωδικού πρόσβασής σας


delete-account-header =
    .title = Διαγραφή λογαριασμού
delete-account-step-1-2 = Βημα 1 απο 2
delete-account-step-2-2 = Βημα 2 απο 2
delete-account-confirm-title-4 = Ίσως έχετε συνδέσει τον { -product-mozilla-account(case: "acc", capitalization: "lower") } σας με ένα ή περισσότερα από τα εξής προϊόντα ή υπηρεσίες της { -brand-mozilla }, που σας προστατεύουν και σας βοηθούν με τις εργασίες σας στο διαδίκτυο:
delete-account-product-mozilla-account = { -product-mozilla-account(case: "nom", capitalization: "upper") }
delete-account-product-mozilla-vpn = { -product-mozilla-vpn }
delete-account-product-mdn-plus = { -product-mdn-plus }
delete-account-product-mozilla-hubs = { -product-mozilla-hubs }
delete-account-product-mozilla-monitor = { -product-mozilla-monitor }
delete-account-product-firefox-relay = { -product-firefox-relay }
delete-account-product-firefox-sync = Συγχρονισμός δεδομένων { -brand-firefox }
delete-account-product-firefox-addons = Πρόσθετα { -brand-firefox }
delete-account-acknowledge = Σημειώστε ότι η διαγραφή του λογαριασμού σας:
delete-account-chk-box-1-v4 =
    .label = Όλες οι επί πληρωμή συνδρομές σας θα ακυρωθούν
delete-account-chk-box-2 =
    .label = Ενδέχεται να χάσετε τις αποθηκευμένες πληροφορίες και λειτουργίες από τα προϊόντα { -brand-mozilla }
delete-account-chk-box-3 =
    .label = Η εκ νέου ενεργοποίηση με το ίδιο email ενδέχεται να μην επαναφέρει τις αποθηκευμένες πληροφορίες σας
delete-account-chk-box-4 =
    .label = Όλες οι επεκτάσεις και τα θέματα που έχετε δημοσιεύει στο addons.mozilla.org θα διαγραφούν
delete-account-continue-button = Συνέχεια
delete-account-password-input =
    .label = Εισαγωγή κωδικού πρόσβασης
delete-account-cancel-button = Ακύρωση
delete-account-delete-button-2 = Διαγραφή


display-name-page-title =
    .title = Εμφανιζόμενο όνομα
display-name-input =
    .label = Εισαγάγετε το εμφανιζόμενο όνομα
submit-display-name = Αποθήκευση
cancel-display-name = Ακύρωση
display-name-update-error-2 = Προέκυψε πρόβλημα κατά την ενημέρωση του εμφανιζόμενου ονόματός σας
display-name-success-alert-2 = Το εμφανιζόμενο όνομα ενημερώθηκε


recent-activity-title = Πρόσφατη δραστηριότητα λογαριασμού
recent-activity-account-create-v2 = Ο λογαριασμός δημιουργήθηκε
recent-activity-account-disable-v2 = Ο λογαριασμός απενεργοποιήθηκε
recent-activity-account-enable-v2 = Ο λογαριασμός ενεργοποιήθηκε
recent-activity-account-login-v2 = Έναρξη σύνδεσης στον λογαριασμό
recent-activity-account-reset-v2 = Ξεκίνησε η επαναφορά κωδικού πρόσβασης
recent-activity-emails-clearBounces-v2 = Οι ειδοποιήσεις αδυναμίας παράδοσης email διαγράφηκαν
recent-activity-account-login-failure = Αποτυχία απόπειρας σύνδεσης στον λογαριασμό
recent-activity-account-two-factor-added = Η ταυτοποίηση δύο παραγόντων ενεργοποιήθηκε
recent-activity-account-two-factor-requested = Ζητήθηκε ταυτοποίηση δύο παραγόντων
recent-activity-account-two-factor-failure = Η ταυτοποίηση δύο παραγόντων απέτυχε
recent-activity-account-two-factor-success = Επιτυχής ταυτοποίηση δύο παραγόντων
recent-activity-account-two-factor-removed = Η ταυτοποίηση δύο παραγόντων καταργήθηκε
recent-activity-account-password-reset-requested = Ο λογαριασμός ζήτησε επαναφορά κωδικού πρόσβασης
recent-activity-account-password-reset-success = Επιτυχής επαναφορά κωδικού πρόσβασης λογαριασμού
recent-activity-account-recovery-key-added = Το κλειδί ανάκτησης λογαριασμού ενεργοποιήθηκε
recent-activity-account-recovery-key-verification-failure = Αποτυχία επαλήθευσης κλειδιού ανάκτησης λογαριασμού
recent-activity-account-recovery-key-verification-success = Επιτυχής επαλήθευση κλειδιού ανάκτησης λογαριασμού
recent-activity-account-recovery-key-removed = Το κλειδί ανάκτησης λογαριασμού αφαιρέθηκε
recent-activity-account-password-added = Προστέθηκε νέος κωδικός πρόσβασης
recent-activity-account-password-changed = Ο κωδικός πρόσβασης άλλαξε
recent-activity-account-secondary-email-added = Προστέθηκε δευτερεύουσα διεύθυνση email
recent-activity-account-secondary-email-removed = Αφαιρέθηκε δευτερεύουσα διεύθυνση email
recent-activity-account-emails-swapped = Έγινε εναλλαγή του κύριου email με το δευτερεύον
recent-activity-session-destroy = Έγινε αποσύνδεση από τη συνεδρία
recent-activity-account-recovery-phone-send-code = Απεστάλη κωδικός τηλεφώνου ανάκτησης
recent-activity-account-recovery-phone-setup-complete = Η ρύθμιση του τηλεφώνου ανάκτησης ολοκληρώθηκε
recent-activity-account-recovery-phone-signin-complete = Η σύνδεση με τηλέφωνο ανάκτησης ολοκληρώθηκε
recent-activity-account-recovery-phone-signin-failed = Η σύνδεση με τηλέφωνο ανάκτησης απέτυχε
recent-activity-account-recovery-phone-removed = Το τηλέφωνο ανάκτησης αφαιρέθηκε
recent-activity-account-recovery-codes-replaced = Οι κωδικοί ανάκτησης αντικαταστάθηκαν
recent-activity-account-recovery-codes-created = Δημιουργήθηκαν κωδικοί ανάκτησης
recent-activity-account-recovery-codes-signin-complete = Η σύνδεση με κωδικούς ανάκτησης ολοκληρώθηκε
recent-activity-password-reset-otp-sent = Έγινε αποστολή του κωδικού επιβεβαίωσης επαναφοράς κωδικού πρόσβασης
recent-activity-password-reset-otp-verified = Έγινε επαλήθευση του κωδικού επιβεβαίωσης επαναφοράς κωδικού πρόσβασης
recent-activity-must-reset-password = Ζητήθηκε επαναφορά του κωδικού πρόσβασης
recent-activity-unknown = Άλλη δραστηριότητα λογαριασμού


recovery-key-create-page-title = Κλειδί ανάκτησης λογαριασμού
recovery-key-create-back-button-title = Πίσω στις ρυθμίσεις


recovery-phone-remove-header = Αφαίρεση αριθμού τηλεφώνου ανάκτησης
settings-recovery-phone-remove-info = Αυτή η ενέργεια θα καταργήσει το <strong>{ $formattedFullPhoneNumber }</strong> από τηλέφωνο ανάκτησης.
settings-recovery-phone-remove-recommend = Προτείνουμε να διατηρήσετε αυτήν τη μέθοδο, επειδή είναι πιο εύκολη από την αποθήκευση εφεδρικών κωδικών ταυτοποίησης.
settings-recovery-phone-remove-recovery-methods = Εάν το διαγράψετε, βεβαιωθείτε ότι διαθέτετε ακόμα τους αποθηκευμένους εφεδρικούς κωδικούς ταυτοποίησής σας. <linkExternal>Σύγκριση μεθόδων ανάκτησης</linkExternal>
settings-recovery-phone-remove-button = Αφαίρεση αριθμού τηλεφώνου
settings-recovery-phone-remove-cancel = Ακύρωση
settings-recovery-phone-remove-success = Το τηλέφωνο ανάκτησης αφαιρέθηκε


page-setup-recovery-phone-heading = Προσθήκη τηλεφώνου ανάκτησης
page-change-recovery-phone = Αλλαγή τηλεφώνου ανάκτησης
page-setup-recovery-phone-back-button-title = Πίσω στις ρυθμίσεις
page-setup-recovery-phone-step2-back-button-title = Αλλαγή αριθμού τηλεφώνου


add-secondary-email-step-1 = Βήμα 1 από 2
add-secondary-email-error-2 = Προέκυψε πρόβλημα κατά τη δημιουργία αυτού του email
add-secondary-email-page-title =
    .title = Δευτερεύον email
add-secondary-email-enter-address =
    .label = Εισαγωγή διεύθυνσης email
add-secondary-email-cancel-button = Ακύρωση
add-secondary-email-save-button = Αποθήκευση
add-secondary-email-mask = Οι μάσκες email δεν μπορούν να χρησιμοποιηθούν ως δευτερεύον email


add-secondary-email-step-2 = Βήμα 2 από 2
verify-secondary-email-page-title =
    .title = Δευτερεύον email
verify-secondary-email-verification-code-2 =
    .label = Εισαγωγή κωδικού επιβεβαίωσης
verify-secondary-email-cancel-button = Ακύρωση
verify-secondary-email-verify-button-2 = Επιβεβαίωση
verify-secondary-email-please-enter-code-2 = Εισαγάγετε τον κωδικό επιβεβαίωσης που απεστάλη στο <strong>{ $email }</strong> εντός 5 λεπτών.
verify-secondary-email-success-alert-2 = Το { $email } προστέθηκε επιτυχώς
verify-secondary-email-resend-code-button = Εκ νέου αποστολή κωδικού επιβεβαίωσης


delete-account-link = Διαγραφή λογαριασμού
inactive-update-status-success-alert = Έγινε επιτυχής σύνδεση. Ο { -product-mozilla-account(case: "nom", capitalization: "lower") } και τα δεδομένα σας θα παραμείνουν ενεργά.


product-promo-monitor =
    .alt = { -product-mozilla-monitor }
product-promo-monitor-description-v2 = Μάθετε πού εκτίθενται τα προσωπικά σας δεδομένα και ανακτήστε τον έλεγχό τους
product-promo-monitor-cta = Δωρεάν σάρωση


profile-heading = Προφίλ
profile-picture =
    .header = Εικόνα
profile-display-name =
    .header = Εμφανιζόμενο όνομα
profile-primary-email =
    .header = Κύριο email


progress-bar-aria-label-v2 = Βήμα { $currentStep } από { $numberOfSteps }.


security-heading = Ασφάλεια
security-password =
    .header = Κωδικός πρόσβασης
security-password-created-date = Δημιουργία: { $date }
security-not-set = Δεν έχει οριστεί
security-action-create = Δημιουργία
security-set-password = Ορίστε έναν κωδικό πρόσβασης για συγχρονισμό και χρήση συγκεκριμένων λειτουργιών ασφαλείας του λογαριασμού.
security-recent-activity-link = Προβολή πρόσφατης δραστηριότητας λογαριασμού
signout-sync-header = Η συνεδρία έληξε
signout-sync-session-expired = Δυστυχώς, κάτι πήγε στραβά. Αποσυνδεθείτε από το μενού του προγράμματος περιήγησης και δοκιμάστε ξανά.


tfa-row-backup-codes-title = Εφεδρικοί κωδικοί ταυτοποίησης
tfa-row-backup-codes-not-available = Δεν υπάρχουν διαθέσιμοι κωδικοί
tfa-row-backup-codes-available-v2 =
    { $numCodesAvailable ->
        [one] Απομένει { $numCodesAvailable } κωδικός
       *[other] Απομένουν { $numCodesAvailable } κωδικοί
    }
tfa-row-backup-codes-get-new-cta-v2 = Δημιουργία νέων κωδικών
tfa-row-backup-codes-add-cta = Προσθήκη
tfa-row-backup-codes-description-2 = Αυτή είναι η πιο ασφαλής μέθοδος ανάκτησης εάν δεν μπορείτε να χρησιμοποιήσετε την κινητή σας συσκευή ή την εφαρμογή ελέγχου ταυτότητάς σας.
tfa-row-backup-phone-title-v2 = Τηλέφωνο ανάκτησης
tfa-row-backup-phone-not-available-v2 = Δεν έχει προστεθεί αριθμός τηλεφώνου
tfa-row-backup-phone-change-cta = Αλλαγή
tfa-row-backup-phone-add-cta = Προσθήκη
tfa-row-backup-phone-delete-button = Αφαίρεση
tfa-row-backup-phone-delete-title-v2 = Αφαίρεση τηλεφώνου ανάκτησης
tfa-row-backup-phone-delete-restriction-v2 = Εάν θέλετε να αφαιρέσετε το τηλέφωνο ανάκτησής σας, προσθέστε εφεδρικούς κωδικούς ταυτοποίησης ή απενεργοποιήστε πρώτα την ταυτοποίηση δύο παραγόντων, ώστε να μην κλειδωθείτε εκτός του λογαριασμού σας.
tfa-row-backup-phone-description-v2 = Αυτή είναι η πιο εύκολη μέθοδος ανάκτησης εάν δεν μπορείτε να χρησιμοποιήσετε την εφαρμογή ελέγχου ταυτότητάς σας.
tfa-row-backup-phone-sim-swap-risk-link = Μάθετε σχετικά με τον κίνδυνο εναλλαγής SIM


switch-turn-off = Απενεργοποίηση
switch-turn-on = Ενεργοποίηση
switch-submitting = Υποβολή…
switch-is-on = ενεργό
switch-is-off = ανενεργό


row-defaults-action-add = Προσθήκη
row-defaults-action-change = Αλλαγή
row-defaults-action-disable = Απενεργοποίηση
row-defaults-status = Κανένα


rk-header-1 = Κλειδί ανάκτησης λογαριασμού
rk-enabled = Ενεργό
rk-not-set = Δεν έχει οριστεί
rk-action-create = Δημιουργία
rk-action-change-button = Αλλαγή
rk-action-remove = Αφαίρεση
rk-key-removed-2 = Το κλειδί ανάκτησης λογαριασμού αφαιρέθηκε
rk-cannot-remove-key = Δεν ήταν δυνατή η κατάργηση του κλειδιού ανάκτησης λογαριασμού.
rk-refresh-key-1 = Ανανέωση κλειδιού ανάκτησης λογαριασμού
rk-content-explain = Ανακτήστε τις πληροφορίες σας εάν ξεχάσετε τον κωδικό πρόσβασής σας.
rk-cannot-verify-session-4 = Δυστυχώς, προέκυψε πρόβλημα με την επιβεβαίωση της συνεδρίας σας
rk-remove-modal-heading-1 = Αφαίρεση κλειδιού ανάκτησης λογαριασμού;
rk-remove-modal-content-1 =
    Σε περίπτωση που επαναφέρετε τον κωδικό πρόσβασής σας, δεν θα μπορείτε να χρησιμοποιήσετε
    το κλειδί ανάκτησης λογαριασμού σας για πρόσβαση στα δεδομένα σας. Αυτή η ενέργεια δεν μπορεί να αναιρεθεί.
rk-remove-error-2 = Δεν ήταν δυνατή η αφαίρεση του κλειδιού ανάκτησης του λογαριασμού σας
unit-row-recovery-key-delete-icon-button-title = Διαγραφή κλειδιού ανάκτησης λογαριασμού


se-heading = Δευτερεύον email
    .header = Δευτερεύον email
se-cannot-refresh-email = Δυστυχώς, προέκυψε πρόβλημα κατά την ανανέωση του email.
se-cannot-resend-code-3 = Δυστυχώς, προέκυψε πρόβλημα κατά την επαναποστολή του κωδικού επιβεβαίωσης
se-set-primary-successful-2 = Το { $email } είναι πλέον το κύριο email σας
se-set-primary-error-2 = Δυστυχώς, προέκυψε πρόβλημα κατά την αλλαγή του κύριου email σας
se-delete-email-successful-2 = Το { $email } διαγράφηκε επιτυχώς
se-delete-email-error-2 = Δυστυχώς, προέκυψε πρόβλημα κατά τη διαγραφή αυτού του email
se-verify-session-3 = Θα χρειαστεί να επιβεβαιώσετε την τρέχουσα συνεδρία σας για την εκτέλεση αυτής της ενέργειας
se-verify-session-error-3 = Δυστυχώς, προέκυψε πρόβλημα με την επιβεβαίωση της συνεδρίας σας
se-remove-email =
    .title = Αφαίρεση email
se-refresh-email =
    .title = Ανανέωση email
se-unverified-2 = μη επιβεβαιωμένο
se-resend-code-2 =
    Απαιτείται επιβεβαίωση. Κάντε <button>νέα αποστολή κωδικού επιβεβαίωσης</button>
    εάν δεν υπάρχει στα εισερχόμενα ή τον φάκελο ανεπιθύμητων μηνυμάτων σας.
se-make-primary = Ορισμός ως κύριο
se-default-content = Αποκτήστε πρόσβαση στον λογαριασμό σας εάν δεν μπορείτε να συνδεθείτε στο κύριο email σας.
se-content-note-1 =
    Σημείωση: ένα δευτερεύον email δεν θα ανακτήσει τα δεδομένα σας. Για τον
    σκοπό αυτό, θα χρειαστείτε ένα <a>κλειδί ανάκτησης λογαριασμού</a>.
se-secondary-email-none = Κανένα


tfa-row-header = Ταυτοποίηση δύο παραγόντων
tfa-row-enabled = Ενεργή
tfa-row-disabled-status = Ανενεργή
tfa-row-action-add = Προσθήκη
tfa-row-action-disable = Απενεργοποίηση
tfa-row-action-change = Αλλαγή
tfa-row-button-refresh =
    .title = Ανανέωση ταυτοποίησης δύο παραγόντων
tfa-row-cannot-refresh =
    Δυστυχώς, προέκυψε πρόβλημα κατά την ανανέωση
    της ταυτοποίησης δύο παραγόντων.
tfa-row-enabled-description = Ο λογαριασμός σας προστατεύεται από ταυτοποίηση δύο παραγόντων. Θα πρέπει να εισαγάγετε έναν κωδικό μίας χρήσης από την εφαρμογή ελέγχου ταυτότητάς σας κατά τη σύνδεση στον { -product-mozilla-account(case: "acc", capitalization: "lower") } σας.
tfa-row-enabled-info-link = Πώς προστατεύεται ο λογαριασμός σας
tfa-row-disabled-description-v2 = Ασφαλίστε τον λογαριασμό σας με μια τρίτη εφαρμογή ελέγχου ταυτότητας ως ένα δεύτερο βήμα για τη σύνδεση.
tfa-row-cannot-verify-session-4 = Δυστυχώς, προέκυψε πρόβλημα με την επιβεβαίωση της συνεδρίας σας
tfa-row-disable-modal-heading = Απενεργοποίηση ταυτοποίησης δύο παραγόντων;
tfa-row-disable-modal-confirm = Απενεργοποίηση
tfa-row-disable-modal-explain-1 =
    Δεν μπορείτε να αναιρέσετε αυτήν την ενέργεια. Έχετε επίσης
    την επιλογή <linkExternal>αντικατάστασης των εφεδρικών κωδικών ταυτοποίησής σας</linkExternal>.
tfa-row-disabled-2 = Η ταυτοποίηση δύο παραγόντων απενεργοποιήθηκε
tfa-row-cannot-disable-2 = Δεν ήταν δυνατή η απενεργοποίηση της ταυτοποίησης δύο παραγόντων
tfa-row-verify-session-info = Θα χρειαστεί να επιβεβαιώσετε την τρέχουσα συνεδρία σας για να ρυθμίσετε την ταυτοποίηση δύο παραγόντων


terms-privacy-agreement-default-2 = Συνεχίζοντας, αποδέχεστε τους <mozillaAccountsTos>Όρους υπηρεσίας</mozillaAccountsTos> και τη <mozillaAccountsPrivacy>Σημείωση απορρήτου</mozillaAccountsPrivacy>.


third-party-auth-options-or = Ή
third-party-auth-options-sign-in-with = Σύνδεση με
continue-with-google-button = Συνέχεια με { -brand-google }
continue-with-apple-button = Συνέχεια με { -brand-apple }


auth-error-102 = Άγνωστος λογαριασμός
auth-error-103 = Λάθος κωδικός πρόσβασης
auth-error-105-2 = Μη έγκυρος κωδικός επιβεβαίωσης
auth-error-110 = Μη έγκυρο διακριτικό
auth-error-114-generic = Έχετε προσπαθήσει πάρα πολλές φορές. Δοκιμάστε ξανά αργότερα.
auth-error-114 = Έχετε προσπαθήσει πάρα πολλές φορές. Δοκιμάστε ξανά { $retryAfter }.
auth-error-125 = Το αίτημα αποκλείστηκε για λόγους ασφαλείας
auth-error-129-2 = Πληκτρολογήσατε μη έγκυρο αριθμό τηλεφώνου. Ελέγξτε τον και δοκιμάστε ξανά.
auth-error-138-2 = Μη επιβεβαιωμένη συνεδρία
auth-error-139 = Το δευτερεύον email πρέπει να είναι διαφορετικό από το email του λογαριασμού σας
auth-error-144 = Αυτή η διεύθυνση email έχει δεσμευτεί από άλλο λογαριασμό. Δοκιμάστε ξανά αργότερα ή χρησιμοποιήστε μια άλλη διεύθυνση email.
auth-error-155 = Δεν βρέθηκε διακριτικό TOTP
auth-error-156 = Δεν βρέθηκε εφεδρικός κωδικός ταυτοποίησης
auth-error-159 = Μη έγκυρο κλειδί ανάκτησης λογαριασμού
auth-error-183-2 = Μη έγκυρος ή παλιός κωδικός επιβεβαίωσης
auth-error-202 = Η λειτουργία δεν είναι ενεργή
auth-error-203 = Το σύστημα δεν είναι διαθέσιμο, δοκιμάστε ξανά σύντομα
auth-error-206 = Δεν είναι δυνατή η δημιουργία κωδικού πρόσβασης, έχει ήδη οριστεί κωδικός πρόσβασης
auth-error-214 = Ο αριθμός τηλεφώνου ανάκτησης υπάρχει ήδη
auth-error-215 = Ο αριθμός τηλεφώνου ανάκτησης δεν υπάρχει
auth-error-216 = Έχετε φτάσει το όριο των μηνυμάτων κειμένου
auth-error-218 = Δεν είναι δυνατή η αφαίρεση του τηλεφώνου ανάκτησης, δεν υπάρχουν εφεδρικοί κωδικοί ταυτοποίησης.
auth-error-219 = Αυτός ο αριθμός τηλεφώνου έχει καταχωρηθεί σε πάρα πολλούς λογαριασμούς. Δοκιμάστε έναν άλλο αριθμό.
auth-error-999 = Απροσδόκητο σφάλμα
auth-error-1001 = Η προσπάθεια σύνδεσης ακυρώθηκε
auth-error-1002 = Η συνεδρία έληξε. Συνδεθείτε για να συνεχίσετε.
auth-error-1003 = Η τοπική αποθήκευση ή τα cookie εξακολουθούν να είναι απενεργοποιημένα
auth-error-1008 = Ο νέος κωδικός πρόσβασής σας πρέπει να είναι διαφορετικός
auth-error-1010 = Απαιτείται έγκυρος κωδικός πρόσβασης
auth-error-1011 = Απαιτείται έγκυρο email
auth-error-1018 = Το email επιβεβαίωσής σας μόλις επιστράφηκε. Μήπως πληκτρολογήσατε λάθος email;
auth-error-1020 = Εσφαλμένο email; Το firefox.com δεν είναι έγκυρη υπηρεσία email
auth-error-1031 = Πρέπει να εισαγάγετε την ηλικία σας για εγγραφή
auth-error-1032 = Πρέπει να εισαγάγετε μια έγκυρη ηλικία για εγγραφή
auth-error-1054 = Μη έγκυρος κωδικός ταυτοποίησης δύο παραγόντων
auth-error-1056 = Μη έγκυρος εφεδρικός κωδικός ταυτοποίησης
auth-error-1062 = Μη έγκυρη ανακατεύθυνση
auth-error-1064 = Εσφαλμένο email; Το { $domain } δεν είναι έγκυρη υπηρεσία email
auth-error-1066 = Οι μάσκες email δεν μπορούν να χρησιμοποιηθούν για τη δημιουργία λογαριασμού.
auth-error-1067 = Εσφαλμένο email;
recovery-phone-number-ending-digits = Αριθμός που λήγει σε { $lastFourPhoneNumber }
oauth-error-1000 = Κάτι πήγε στραβά. Κλείστε αυτήν την καρτέλα και δοκιμάστε ξανά.


connect-another-device-signed-in-header = Συνδεθήκατε στο { -brand-firefox }
connect-another-device-email-confirmed-banner = Το email επιβεβαιώθηκε
connect-another-device-signin-confirmed-banner = Η είσοδος επιβεβαιώθηκε
connect-another-device-signin-to-complete-message = Συνδεθείτε σε αυτό το { -brand-firefox } για να ολοκληρώσετε τη ρύθμιση
connect-another-device-signin-link = Σύνδεση
connect-another-device-still-adding-devices-message = Προσθέτετε ακόμα συσκευές; Συνδεθείτε στο { -brand-firefox } από μια άλλη συσκευή για να ολοκληρώσετε τη ρύθμιση
connect-another-device-signin-another-device-to-complete-message = Συνδεθείτε στο { -brand-firefox } σε κάποια άλλη συσκευή για να ολοκληρώσετε τη ρύθμιση
connect-another-device-get-data-on-another-device-message = Θέλετε να λάβετε τις καρτέλες, τους σελιδοδείκτες και τους κωδικούς πρόσβασής σας σε μια άλλη συσκευή;
connect-another-device-cad-link = Σύνδεση άλλης συσκευής
connect-another-device-not-now-link = Όχι τώρα
connect-another-device-android-complete-setup-message = Συνδεθείτε στο { -brand-firefox } για Android για να ολοκληρώσετε τη ρύθμιση
connect-another-device-ios-complete-setup-message = Συνδεθείτε στο { -brand-firefox } για iOS για να ολοκληρώσετε τη ρύθμιση


cookies-disabled-header = Απαιτούνται cookie και τοπική αποθήκευση
cookies-disabled-enable-prompt-2 = Ενεργοποιήστε τα cookie και τον τοπικό χώρο αποθήκευσης στο πρόγραμμα περιήγησής σας για να αποκτήσετε πρόσβαση στον { -product-mozilla-account(case: "acc", capitalization: "lower") } σας. Με αυτόν τον τρόπο, θα ενεργοποιήσετε λειτουργίες όπως η απομνημόνευση της σύνδεσής σας μεταξύ των συνεδριών.
cookies-disabled-button-try-again = Δοκιμή ξανά
cookies-disabled-learn-more = Μάθετε περισσότερα


index-header = Εισαγάγετε το email σας
index-sync-header = Συνέχεια στον { -product-mozilla-account(case: "acc", capitalization: "lower") } σας
index-sync-subheader = Συγχρονίστε τους κωδικούς πρόσβασης, τις καρτέλες και τους σελιδοδείκτες σας οπουδήποτε χρησιμοποιείτε το { -brand-firefox }.
index-relay-header = Δημιουργία μάσκας email
index-relay-subheader = Εισαγάγετε τη διεύθυνση email όπου θα θέλατε να προωθούνται τα email από τη μάσκα email σας.
index-subheader-with-servicename = Συνέχεια στο { $serviceName }
index-subheader-default = Συνέχεια στις ρυθμίσεις λογαριασμού
index-cta = Εγγραφή ή σύνδεση
index-account-info = Ένας { -product-mozilla-account(case: "nom", capitalization: "lower") } ξεκλειδώνει επίσης την πρόσβαση σε περισσότερα προϊόντα της { -brand-mozilla } που προστατεύουν το απόρρητό σας.
index-email-input =
    .label = Εισαγάγετε το email σας
index-account-delete-success = Επιτυχής διαγραφή λογαριασμού
index-email-bounced = Το email επιβεβαίωσής σας μόλις επιστράφηκε. Μήπως πληκτρολογήσατε λάθος email;


inline-recovery-key-setup-create-error = Ωχ! Δεν ήταν δυνατή η δημιουργία του κλειδιού ανάκτησης του λογαριασμού σας. Δοκιμάστε ξανά αργότερα.
inline-recovery-key-setup-recovery-created = Το κλειδί ανάκτησης λογαριασμού δημιουργήθηκε
inline-recovery-key-setup-download-header = Ασφαλίστε τον λογαριασμό σας
inline-recovery-key-setup-download-subheader = Κάντε το λήψη και αποθήκευση τώρα
inline-recovery-key-setup-download-info = Αποθηκεύστε αυτό το κλειδί σε μέρος που θα θυμάστε. Δεν θα μπορείτε να επιστρέψετε σε αυτήν τη σελίδα αργότερα.
inline-recovery-key-setup-hint-header = Σύσταση ασφαλείας


inline-totp-setup-cancel-setup-button = Ακύρωση ρύθμισης
inline-totp-setup-continue-button = Συνέχεια
inline-totp-setup-add-security-link = Προσθέστε ένα επιπλέον επίπεδο ασφαλείας στον λογαριασμό σας με κωδικούς ταυτοποίησης από μία από <authenticationAppsLink>αυτές τις εφαρμογές ταυτοποίησης</authenticationAppsLink>.
inline-totp-setup-enable-two-step-authentication-default-header-2 = Ενεργοποιήστε την ταυτοποίηση δύο παραγόντων <span>για να συνεχίσετε στις ρυθμίσεις λογαριασμού</span>
inline-totp-setup-enable-two-step-authentication-custom-header-2 = Ενεργοποιήστε την ταυτοποίηση δύο παραγόντων <span>για να συνεχίσετε στο { $serviceName }</span>
inline-totp-setup-ready-button = Έτοιμο
inline-totp-setup-show-qr-custom-service-header-2 = Σαρώστε τον κωδικό ταυτοποίησης <span>για να συνεχίσετε στο { $serviceName }</span>
inline-totp-setup-no-qr-custom-service-header-2 = Εισαγάγετε τον κωδικό χειροκίνητα <span>για να συνεχίσετε στο { $serviceName }</span>
inline-totp-setup-show-qr-default-service-header-2 = Σαρώστε τον κωδικό ταυτοποίησης <span>για να συνεχίσετε στις ρυθμίσεις λογαριασμού</span>
inline-totp-setup-no-qr-default-service-header-2 = Εισαγάγετε τον κωδικό χειροκίνητα <span>για να συνεχίσετε στις ρυθμίσεις λογαριασμού</span>
inline-totp-setup-enter-key-or-use-qr-instructions = Πληκτρολογήστε αυτό το μυστικό κλειδί στην εφαρμογή ταυτοποίησής σας. <toggleToQRButton>Σάρωση κωδικού QR;</toggleToQRButton>
inline-totp-setup-use-qr-or-enter-key-instructions = Σαρώστε τον κωδικό QR στην εφαρμογή ταυτοποίησης και εισαγάγετε τον κωδικό που παρέχει. <toggleToManualModeButton>Δεν μπορείτε να σαρώσετε τον κωδικό;</toggleToManualModeButton>
inline-totp-setup-on-completion-description = Μόλις τελειώσετε, θα αρχίσει η δημιουργία των κωδικών ταυτοποίησής σας.
inline-totp-setup-security-code-placeholder = Κωδικός ταυτοποίησης
inline-totp-setup-code-required-error = Απαιτείται κωδικός ταυτοποίησης
tfa-qr-code-alt = Χρησιμοποιήστε τον κωδικό { $code } για να ρυθμίσετε την ταυτοποίηση δύο παραγόντων στις υποστηριζόμενες εφαρμογές.
inline-totp-setup-page-title = Ταυτοποίηση δύο παραγόντων


legal-header = Νομικά
legal-terms-of-service-link = Όροι υπηρεσίας
legal-privacy-link = Σημείωση απορρήτου


legal-privacy-heading = Σημείωση απορρήτου


legal-terms-heading = Όροι υπηρεσίας


pair-auth-allow-heading-text = Συνδεθήκατε μόλις στο { -product-firefox };
pair-auth-allow-confirm-button = Ναι, έγκριση συσκευής
pair-auth-allow-refuse-device-link = Εάν δεν το κάνατε εσείς, <link>αλλάξτε τον κωδικό πρόσβασής σας</link>


pair-auth-complete-heading = Η συσκευή συνδέθηκε
pair-auth-complete-now-syncing-device-text = Κάνετε τώρα συγχρονισμό με το: { $deviceFamily } με { $deviceOS }
pair-auth-complete-sync-benefits-text = Τώρα μπορείτε να έχετε πρόσβαση στις ανοικτές καρτέλες, τους κωδικούς πρόσβασης και τους σελιδοδείκτες σας σε όλες τις συσκευές σας.
pair-auth-complete-see-tabs-button = Εμφάνιση καρτελών από συγχρονισμένες συσκευές
pair-auth-complete-manage-devices-link = Διαχείριση συσκευών


auth-totp-heading-w-default-service = Εισαγάγετε τον κωδικό ταυτοποίησης <span>για να συνεχίσετε στις ρυθμίσεις λογαριασμού</span>
auth-totp-heading-w-custom-service = Εισαγάγετε τον κωδικό ταυτοποίησης <span>για να συνεχίσετε στο { $serviceName }</span>
auth-totp-instruction = Ανοίξτε την εφαρμογή ταυτοποίησής σας και εισαγάγετε τον κωδικό ταυτοποίησης που σας παρέχει.
auth-totp-input-label = Εισαγάγετε τον εξαψήφιο κωδικό
auth-totp-confirm-button = Επιβεβαίωση
auth-totp-code-required-error = Απαιτείται κωδικός ταυτοποίησης


pair-wait-for-supp-heading-text = Απαιτείται τώρα έγκριση <span>από την άλλη συσκευή σας</span>


pair-failure-header = Ανεπιτυχής σύζευξη
pair-failure-message = Η διαδικασία ρύθμισης τερματίστηκε.


pair-sync-header = Συγχρονίστε το { -brand-firefox } στο τηλέφωνο ή το tablet σας
pair-cad-header = Συνδέστε το { -brand-firefox } σε άλλη συσκευή
pair-already-have-firefox-paragraph = Έχετε ήδη το { -brand-firefox } στο κινητό ή το tablet σας;
pair-sync-your-device-button = Συγχρονισμός συσκευής
pair-or-download-subheader = Ή λήψη
pair-scan-to-download-message = Κάντε σάρωση για λήψη του { -brand-firefox } για κινητές συσκευές ή στείλτε στον εαυτό σας έναν <linkExternal>σύνδεσμο λήψης</linkExternal>.
pair-not-now-button = Όχι τώρα
pair-take-your-data-message = Μεταφέρετε τις καρτέλες, τους σελιδοδείκτες και τους κωδικούς πρόσβασής σας οπουδήποτε χρησιμοποιείτε το { -brand-firefox }.
pair-get-started-button = Έναρξη
pair-qr-code-aria-label = Κωδικός QR


pair-success-header-2 = Η συσκευή συνδέθηκε
pair-success-message-2 = Επιτυχής σύζευξη.


pair-supp-allow-heading-text = Επιβεβαίωση σύζευξης <span>για το { $email }</span>
pair-supp-allow-confirm-button = Επιβεβαίωση σύζευξης
pair-supp-allow-cancel-link = Ακύρωση


pair-wait-for-auth-heading-text = Απαιτείται έγκριση <span>από την άλλη συσκευή σας</span>


pair-unsupported-header = Σύζευξη με εφαρμογή
pair-unsupported-message = Χρησιμοποιήσατε την κάμερα συστήματος; Πρέπει να κάνετε σύζευξη μέσα από την εφαρμογή { -brand-firefox }.




set-password-heading-v2 = Δημιουργία κωδικού πρόσβασης για συγχρονισμό
set-password-info-v2 = Αυτός κρυπτογραφεί τα δεδομένα σας. Πρέπει να είναι διαφορετικός από τον κωδικό πρόσβασης του λογαριασμού { -brand-google } ή { -brand-apple } σας.


third-party-auth-callback-message = Περιμένετε, ανακατευθύνεστε στην εξουσιοδοτημένη εφαρμογή.


account-recovery-confirm-key-heading = Εισαγάγετε το κλειδί ανάκτησης του λογαριασμού σας
account-recovery-confirm-key-instruction = Αυτό το κλειδί ανακτά τα κρυπτογραφημένα δεδομένα περιήγησής σας, όπως κωδικούς πρόσβασης και σελιδοδείκτες, από τους διακομιστές του { -brand-firefox }.
account-recovery-confirm-key-input-label =
    .label = Εισαγάγετε το κλειδί ανάκτησης 32 χαρακτήρων του λογαριασμού σας
account-recovery-confirm-key-hint = Η υπόδειξη για την τοποθεσία αποθήκευσης είναι:
account-recovery-confirm-key-button-2 = Συνέχεια
account-recovery-lost-recovery-key-link-2 = Δεν μπορείτε να βρείτε το κλειδί ανάκτησης του λογαριασμού σας;


complete-reset-pw-header-v2 = Δημιουργία νέου κωδικού πρόσβασης
complete-reset-password-success-alert = Ο κωδικός πρόσβασης ορίστηκε
complete-reset-password-error-alert = Δυστυχώς, προέκυψε πρόβλημα κατά τον ορισμό του κωδικού πρόσβασής σας
complete-reset-pw-recovery-key-link = Χρήση κλειδιού ανάκτησης λογαριασμού
reset-password-complete-banner-heading = Έγινε επαναφορά του κωδικού πρόσβασής σας.
reset-password-complete-banner-message = Μην ξεχάσετε να δημιουργήσετε ένα νέο κλειδί ανάκτησης λογαριασμού από τις ρυθμίσεις του { -product-mozilla-account(case: "gen", capitalization: "lower") } σας για να αποτρέψετε μελλοντικά προβλήματα σύνδεσης.
complete-reset-password-desktop-relay = Το { -brand-firefox } θα προσπαθήσει να σας μεταφέρει στην αρχική καρτέλα για να χρησιμοποιήσετε μια μάσκα email αφού συνδεθείτε.


confirm-backup-code-reset-password-input-label = Εισαγάγετε τον κωδικό 10 χαρακτήρων
confirm-backup-code-reset-password-confirm-button = Επιβεβαίωση
confirm-backup-code-reset-password-subheader = Εισαγάγετε εφεδρικό κωδικό ταυτοποίησης
confirm-backup-code-reset-password-instruction = Εισαγάγετε έναν από τους κωδικούς μίας χρήσης που αποθηκεύσατε κατά τη ρύθμιση της ταυτοποίησης δύο παραγόντων.
confirm-backup-code-reset-password-locked-out-link = Έχετε κλειδωθεί;


confirm-reset-password-with-code-heading = Ελέγξτε τα email σας
confirm-reset-password-with-code-instruction = Στείλαμε έναν κωδικό επιβεβαίωσης στο <span>{ $email }</span>.
confirm-reset-password-code-input-group-label = Εισαγάγετε τον οκταψήφιο κωδικό μέσα σε 10 λεπτά
confirm-reset-password-otp-submit-button = Συνέχεια
confirm-reset-password-otp-resend-code-button = Αποστολή νέου κωδικού
confirm-reset-password-otp-different-account-link = Χρήση διαφορετικού λογαριασμού


confirm-totp-reset-password-header = Επαναφορά κωδικού πρόσβασης
confirm-totp-reset-password-subheader-v2 = Εισαγάγετε κωδικό ταυτοποίησης δύο παραγόντων
confirm-totp-reset-password-instruction-v2 = Ελέγξτε την <strong>εφαρμογή ταυτοποίησής</strong> σας για να επαναφορέρετε τον κωδικό πρόσβασής σας.
confirm-totp-reset-password-trouble-code = Πρόβλημα με την εισαγωγή του κωδικού;
confirm-totp-reset-password-confirm-button = Επιβεβαίωση
confirm-totp-reset-password-input-label-v2 = Εισαγάγετε τον εξαψήφιο κωδικό
confirm-totp-reset-password-use-different-account = Χρήση διαφορετικού λογαριασμού


password-reset-flow-heading = Επαναφορά κωδικού πρόσβασης
password-reset-body-2 =
    Θα σας ρωτήσουμε μερικά πράγματα που μόνο εσείς γνωρίζετε, προκειμένου
    να διατηρήσουμε τον λογαριασμό σας ασφαλή.
password-reset-email-input =
    .label = Εισαγάγετε το email σας
password-reset-submit-button-2 = Συνέχεια


reset-password-complete-header = Έγινε επαναφορά του κωδικού πρόσβασής σας
reset-password-confirmed-cta = Συνέχεια στο { $serviceName }




password-reset-recovery-method-header = Επαναφέρετε τον κωδικό πρόσβασής σας
password-reset-recovery-method-subheader = Επιλέξτε μια μέθοδο ανάκτησης
password-reset-recovery-method-details = Ας βεβαιωθούμε ότι είστε εσείς, χρησιμοποιώντας τις μεθόδους ανάκτησής σας.
password-reset-recovery-method-phone = Τηλέφωνο ανάκτησης
password-reset-recovery-method-code = Εφεδρικοί κωδικοί ταυτοποίησης
password-reset-recovery-method-code-info =
    { $numBackupCodes ->
        [one] Απομένει { $numBackupCodes } κωδικός
       *[other] Απομένουν { $numBackupCodes } κωδικοί
    }
password-reset-recovery-method-send-code-error-heading = Προέκυψε πρόβλημα κατά την αποστολή του κωδικού στο τηλέφωνο ανάκτησής σας
password-reset-recovery-method-send-code-error-description = Δοκιμάστε ξανά αργότερα ή χρησιμοποιήστε τους εφεδρικούς κωδικούς ταυτοποίησής σας.


reset-password-recovery-phone-flow-heading = Επαναφορά κωδικού πρόσβασης
reset-password-recovery-phone-heading = Εισαγάγετε κωδικό ανάκτησης
reset-password-recovery-phone-instruction-v3 = Ένας εξαψήφιος κωδικός έχει αποσταλεί στον αριθμό τηλεφώνου που λήγει σε <span>{ $lastFourPhoneDigits }</span> μέσω μηνύματος κειμένου. Αυτός ο κωδικός λήγει μετά από 5 λεπτά. Μην μοιραστείτε αυτόν τον κωδικό με κανέναν.
reset-password-recovery-phone-input-label = Εισαγάγετε τον εξαψήφιο κωδικό
reset-password-recovery-phone-code-submit-button = Επιβεβαίωση
reset-password-recovery-phone-resend-code-button = Αποστολή νέου κωδικού
reset-password-recovery-phone-resend-success = Ο κωδικός απεστάλη
reset-password-recovery-phone-locked-out-link = Έχετε κλειδωθεί;
reset-password-recovery-phone-send-code-error-heading = Προέκυψε πρόβλημα κατά την αποστολή του κωδικού
reset-password-recovery-phone-code-verification-error-heading = Προέκυψε πρόβλημα κατά την επαλήθευση του κωδικού σας
reset-password-recovery-phone-general-error-description = Δοκιμάστε ξανά αργότερα.
reset-password-recovery-phone-invalid-code-error-description = Ο κωδικός δεν είναι έγκυρος ή έχει λήξει.
reset-password-recovery-phone-invalid-code-error-link = Χρήση εφεδρικών κωδικών ταυτοποίησης;
reset-password-with-recovery-key-verified-page-title = Επιτυχής επαναφορά κωδικού πρόσβασης
reset-password-complete-new-password-saved = Ο νέος κωδικός πρόσβασης αποθηκεύτηκε!
reset-password-complete-recovery-key-created = Το νέο κλειδί ανάκτησης λογαριασμού δημιουργήθηκε. Κάντε λήψη και αποθήκευσή του τώρα
reset-password-complete-recovery-key-download-info =
    Αυτό το κλειδί είναι απαραίτητο για την ανάκτηση των δεδομένων
    σας εάν ξεχάσετε τον κωδικό πρόσβασής σας. <b>Αποθηκεύστε το σε ένα ασφαλές μέρος
    τώρα, καθώς δεν θα μπορέσετε να αποκτήσετε ξανά πρόσβαση σε αυτήν τη σελίδα αργότερα.</b>


error-label = Σφάλμα:
validating-signin = Επικύρωση σύνδεσης…
complete-signin-error-header = Σφάλμα επιβεβαίωσης
signin-link-expired-header = Ο σύνδεσμος επιβεβαίωσης έληξε
signin-link-expired-message-2 = Ο σύνδεσμος στον οποίο κάνατε κλικ έχει λήξει ή έχει ήδη χρησιμοποιηθεί.


signin-password-needed-header-2 = Εισαγάγετε τον κωδικό πρόσβασης <span>για τον { -product-mozilla-account(case: "acc", capitalization: "lower") } σας</span>
signin-subheader-without-logo-with-servicename = Συνέχεια στο { $serviceName }
signin-subheader-without-logo-default = Συνέχεια στις ρυθμίσεις λογαριασμού
signin-button = Σύνδεση
signin-header = Σύνδεση
signin-use-a-different-account-link = Χρήση διαφορετικού λογαριασμού
signin-forgot-password-link = Ξεχάσατε τον κωδικό πρόσβασής σας;
signin-password-button-label = Κωδικός πρόσβασης
signin-desktop-relay = Το { -brand-firefox } θα προσπαθήσει να σας μεταφέρει στην αρχική καρτέλα για να χρησιμοποιήσετε μια μάσκα email αφού συνδεθείτε.
signin-code-expired-error = Ο κωδικός έληξε. Κάντε ξανά σύνδεση.
signin-recovery-error = Κάτι πήγε στραβά. Πραγματοποιήστε ξανά σύνδεση.
signin-account-locked-banner-heading = Επαναφορά κωδικού πρόσβασης
signin-account-locked-banner-description = Κλειδώσαμε τον λογαριασμό σας για να τον προφυλάξουμε από ύποπτη δραστηριότητα.
signin-account-locked-banner-link = Επαναφέρετε τον κωδικό πρόσβασής σας για να συνδεθείτε


report-signin-link-damaged-body = Λείπουν χαρακτήρες απο τον σύνδεσμο που κάνατε κλικ και ενδέχεται να έχει καταστραφεί από το πρόγραμμα email σας. Αντιγράψτε προσεκτικά τη διεύθυνση και δοκιμάστε ξανά.
report-signin-header = Αναφορά μη εξουσιοδοτημένης σύνδεσης;
report-signin-body = Λάβατε ένα email σχετικά με κάποια απόπειρα πρόσβασης στον λογαριασμό σας. Θα θέλατε να αναφέρετε αυτήν τη δραστηριότητα ως ύποπτη;
report-signin-submit-button = Αναφορά δραστηριότητας
report-signin-support-link = Γιατί συμβαίνει αυτό;
report-signin-error = Δυστυχώς, προέκυψε πρόβλημα κατά την υποβολή της αναφοράς.
signin-bounced-header = Συγγνώμη. Έχουμε κλειδώσει τον λογαριασμό σας.
signin-bounced-message = Το email επιβεβαίωσης που στείλαμε στο { $email } επιστράφηκε και έχουμε κλειδώσει τον λογαριασμό σας για να προστατέψουμε τα δεδομένα του { -brand-firefox } σας.
signin-bounced-help = Αν αυτή είναι μια έγκυρη διεύθυνση email, <linkExternal>ενημερώστε μας</linkExternal> και θα σας βοηθήσουμε να ξεκλειδώσετε τον λογαριασμό σας.
signin-bounced-create-new-account = Δεν είστε πλέον κάτοχος αυτού του email; Δημιουργήστε έναν νέο λογαριασμό
back = Πίσω


signin-push-code-heading-w-default-service = Επαληθεύστε αυτά τα στοιχεία σύνδεσης <span>για να συνεχίσετε στις ρυθμίσεις λογαριασμού</span>
signin-push-code-heading-w-custom-service = Επαληθεύστε αυτά τα στοιχεία σύνδεσης <span>για να συνεχίσετε στο { $serviceName }</span>
signin-push-code-instruction = Ελέγξτε τις άλλες σας συσκευές και εγκρίνετε αυτήν τη σύνδεση από το πρόγραμμα περιήγησης { -brand-firefox } σας.
signin-push-code-did-not-recieve = Δεν λάβατε ειδοποίηση;
signin-push-code-send-email-link = Κωδικός email


signin-push-code-confirm-instruction = Επιβεβαιώστε τη σύνδεσή σας
signin-push-code-confirm-description = Εντοπίσαμε μια απόπειρα σύνδεσης από την παρακάτω συσκευή. Αν ήσασταν εσείς, εγκρίνετε τη σύνδεση
signin-push-code-confirm-verifying = Επαλήθευση
signin-push-code-confirm-login = Επιβεβαίωση σύνδεσης
signin-push-code-confirm-wasnt-me = Δεν ήμουν εγώ, αλλαγή κωδικού πρόσβασης.
signin-push-code-confirm-login-approved = Η σύνδεσή σας έχει εγκριθεί. Κλείστε αυτό το παράθυρο.
signin-push-code-confirm-link-error = Ο σύνδεσμος είναι κατεστραμμένος. Δοκιμάστε ξανά.


signin-recovery-method-header = Σύνδεση
signin-recovery-method-subheader = Επιλέξτε μια μέθοδο ανάκτησης
signin-recovery-method-details = Ας βεβαιωθούμε ότι είστε εσείς που χρησιμοποιείτε τις μεθόδους ανάκτησής σας.
signin-recovery-method-phone = Τηλέφωνο ανάκτησης
signin-recovery-method-code-v2 = Εφεδρικοί κωδικοί ταυτοποίησης
signin-recovery-method-code-info-v2 =
    { $numBackupCodes ->
        [one] Απομένει { $numBackupCodes } κωδικός
       *[other] Απομένουν { $numBackupCodes } κωδικοί
    }
signin-recovery-method-send-code-error-heading = Προέκυψε πρόβλημα κατά την αποστολή κωδικού στο τηλέφωνο ανάκτησής σας
signin-recovery-method-send-code-error-description = Δοκιμάστε ξανά αργότερα ή χρησιμοποιήστε τους εφεδρικούς κωδικούς ταυτοποίησής σας.


signin-recovery-code-heading = Σύνδεση
signin-recovery-code-sub-heading = Εισαγάγετε εφεδρικό κωδικό ταυτοποίησης
signin-recovery-code-instruction-v3 = Εισαγάγετε έναν από τους κωδικούς μιας χρήσης που αποθηκεύσατε κατά τη ρύθμιση της ταυτοποίησης δύο παραγόντων.
signin-recovery-code-input-label-v2 = Εισαγάγετε τον κωδικό 10 χαρακτήρων
signin-recovery-code-confirm-button = Επιβεβαίωση
signin-recovery-code-phone-link = Χρήση τηλεφώνου ανάκτησης
signin-recovery-code-support-link = Έχετε κλειδωθεί;
signin-recovery-code-required-error = Απαιτείται εφεδρικός κωδικός ταυτοποίησης
signin-recovery-code-use-phone-failure = Προέκυψε πρόβλημα κατά την αποστολή κωδικού στο τηλέφωνο ανάκτησής σας
signin-recovery-code-use-phone-failure-description = Δοκιμάστε ξανά αργότερα.


signin-recovery-phone-flow-heading = Σύνδεση
signin-recovery-phone-heading = Εισαγάγετε τον κωδικό ανάκτησης
signin-recovery-phone-instruction-v3 = Ένας εξαψήφιος κωδικός έχει αποσταλεί στον αριθμό τηλεφώνου που λήγει σε <span>{ $lastFourPhoneDigits }</span> μέσω μηνύματος κειμένου. Αυτός ο κωδικός λήγει μετά από 5 λεπτά. Μην μοιραστείτε αυτόν τον κωδικό με κανέναν.
signin-recovery-phone-input-label = Εισαγάγετε τον εξαψήφιο κωδικό
signin-recovery-phone-code-submit-button = Επιβεβαίωση
signin-recovery-phone-resend-code-button = Αποστολή νέου κωδικού
signin-recovery-phone-resend-success = Ο κωδικός απεστάλη
signin-recovery-phone-locked-out-link = Έχετε κλειδωθεί;
signin-recovery-phone-send-code-error-heading = Προέκυψε πρόβλημα κατά την αποστολή του κωδικού
signin-recovery-phone-code-verification-error-heading = Προέκυψε πρόβλημα κατά την επαλήθευση του κωδικού σας
signin-recovery-phone-general-error-description = Δοκιμάστε ξανά αργότερα.
signin-recovery-phone-invalid-code-error-description = Ο κωδικός δεν είναι έγκυρος ή έχει λήξει.
signin-recovery-phone-invalid-code-error-link = Χρήση εφεδρικών κωδικών ταυτοποίησης;
signin-recovery-phone-success-message = Έγινε επιτυχής σύνδεση. Ενδέχεται να ισχύσουν περιορισμοί αν χρησιμοποιήσετε ξανά το τηλέφωνο ανάκτησής σας.


signin-reported-header = Σας ευχαριστούμε για την εγρήγορσή σας
signin-reported-message = Η ομάδα μας έχει ειδοποιηθεί. Αναφορές σαν κι αυτή μάς βοηθούν να αποκλείουμε τους εισβολείς.


signin-token-code-heading-2 = Εισαγάγετε τον κωδικό επιβεβαίωσης <span>για τον { -product-mozilla-account(case: "acc", capitalization: "lower") } σας</span>
signin-token-code-instruction-v2 = Εισαγάγετε τον κωδικό επιβεβαίωσης που απεστάλη στο <email>{ $email }</email>, εντός 5 λεπτών.
signin-token-code-input-label-v2 = Εισαγάγετε τον εξαψήφιο κωδικό
signin-token-code-confirm-button = Επιβεβαίωση
signin-token-code-code-expired = Έληξε ο κωδικός;
signin-token-code-resend-code-link = Αποστολή νέου κωδικού.
signin-token-code-resend-code-countdown =
    { $seconds ->
        [one] Αποστολή νέου κωδικού μέσω email σε { $seconds } δευτερόλεπτο
       *[other] Αποστολή νέου κωδικού μέσω email σε { $seconds } δευτερόλεπτα
    }
signin-token-code-required-error = Απαιτείται κωδικός επιβεβαίωσης
signin-token-code-resend-error = Κάτι πήγε στραβά. Δεν ήταν δυνατή η αποστολή νέου κωδικού.
signin-token-code-instruction-desktop-relay = Το { -brand-firefox } θα προσπαθήσει να σας μεταφέρει στην αρχική καρτέλα για να χρησιμοποιήσετε μια μάσκα email αφού συνδεθείτε.


signin-totp-code-header = Σύνδεση
signin-totp-code-subheader-v2 = Εισαγάγετε κωδικό ταυτοποίησης δύο παραγόντων
signin-totp-code-instruction-v4 = Ελέγξτε την <strong>εφαρμογή ταυτοποίησής</strong> σας για να επιβεβαιώσετε τη σύνδεσή σας.
signin-totp-code-input-label-v4 = Εισαγάγετε τον εξαψήφιο κωδικό
signin-totp-code-aal-banner-header = Γιατί σας ζητείται να κάνετε ταυτοποίηση;
signin-totp-code-aal-banner-content = Έχετε ρυθμίσει την ταυτοποίηση δύο παραγόντων στον λογαριασμό σας, αλλά δεν έχετε συνδεθεί ακόμα με κωδικό σε αυτήν τη συσκευή.
signin-totp-code-aal-sign-out = Αποσύνδεση σε αυτήν τη συσκευή
signin-totp-code-aal-sign-out-error = Δυστυχώς, προέκυψε πρόβλημα κατά την αποσύνδεση
signin-totp-code-confirm-button = Επιβεβαίωση
signin-totp-code-other-account-link = Χρήση διαφορετικού λογαριασμού
signin-totp-code-recovery-code-link = Πρόβλημα με την εισαγωγή του κωδικού;
signin-totp-code-required-error = Απαιτείται κωδικός ταυτοποίησης
signin-totp-code-desktop-relay = Το { -brand-firefox } θα προσπαθήσει να σας μεταφέρει στην αρχική καρτέλα για να χρησιμοποιήσετε μια μάσκα email αφού συνδεθείτε.


signin-unblock-header = Πιστοποίηση σύνδεσης
signin-unblock-body = Ελέγξτε το email σας για τον κωδικό ταυτοποίησης που απεστάλη στο { $email }.
signin-unblock-code-input = Εισαγάγετε κωδικό ταυτοποίησης
signin-unblock-submit-button = Συνέχεια
signin-unblock-code-required-error = Απαιτείται κωδικός ταυτοποίησης
signin-unblock-code-incorrect-length = Ο κωδικός ταυτοποίησης πρέπει να περιέχει 8 χαρακτήρες
signin-unblock-code-incorrect-format-2 = Ο κωδικός ταυτοποίησης μπορεί να περιέχει μόνο γράμματα ή/και αριθμούς
signin-unblock-resend-code-button = Δεν βρίσκεται στα εισερχόμενα ή στα ανεπιθύμητα; Αποστολή ξανά
signin-unblock-support-link = Γιατί συμβαίνει αυτό;
signin-unblock-desktop-relay = Το { -brand-firefox } θα προσπαθήσει να σας μεταφέρει στην αρχική καρτέλα για να χρησιμοποιήσετε μια μάσκα email αφού συνδεθείτε.




confirm-signup-code-page-title = Εισαγωγή κωδικού επιβεβαίωσης
confirm-signup-code-heading-2 = Εισαγάγετε τον κωδικό επιβεβαίωσης <span>για τον { -product-mozilla-account(case: "acc", capitalization: "lower") } σας</span>
confirm-signup-code-instruction-v2 = Εισαγάγετε τον κωδικό επιβεβαίωσης που απεστάλη στο <email>{ $email }</email>, εντός 5 λεπτών.
confirm-signup-code-input-label = Εισαγάγετε τον εξαψήφιο κωδικό
confirm-signup-code-confirm-button = Επιβεβαίωση
confirm-signup-code-sync-button = Έναρξη συγχρονισμού
confirm-signup-code-code-expired = Έληξε ο κωδικός;
confirm-signup-code-resend-code-link = Αποστολή νέου κωδικού.
confirm-signup-code-resend-code-countdown =
    { $seconds ->
        [one] Αποστολή νέου κωδικού μέσω email σε { $seconds } δευτερόλεπτο
       *[other] Αποστολή νέου κωδικού μέσω email σε { $seconds } δευτερόλεπτα
    }
confirm-signup-code-success-alert = Επιτυχής επιβεβαίωση λογαριασμού
confirm-signup-code-is-required-error = Απαιτείται κωδικός επιβεβαίωσης
confirm-signup-code-desktop-relay = Το { -brand-firefox } θα προσπαθήσει να σας μεταφέρει στην αρχική καρτέλα για να χρησιμοποιήσετε μια μάσκα email αφού συνδεθείτε.


signup-heading-v2 = Δημιουργία κωδικού πρόσβασης
signup-relay-info = Απαιτείται ένας κωδικός πρόσβασης για τη διαχείριση των μασκών email σας και την πρόσβαση στα εργαλεία ασφαλείας της { -brand-mozilla }.
signup-sync-info = Συγχρονίστε τους κωδικούς πρόσβασης, τους σελιδοδείκτες και πολλά άλλα, σε όποια συσκευή χρησιμοποιείτε το { -brand-firefox }.
signup-sync-info-with-payment = Συγχρονίστε τους κωδικούς πρόσβασης, τις μεθόδους πληρωμής, τους σελιδοδείκτες και πολλά άλλα, σε όποια συσκευή χρησιμοποιείτε το { -brand-firefox }.
signup-change-email-link = Αλλαγή email


signup-confirmed-sync-header = Ο συγχρονισμός είναι ενεργός
signup-confirmed-sync-success-banner = Ο { -product-mozilla-account(case: "nom", capitalization: "lower") } επιβεβαιώθηκε
signup-confirmed-sync-button = Έναρξη περιήγησης
signup-confirmed-sync-description-with-payment-v2 = Οι κωδικοί πρόσβασης, οι μέθοδοι πληρωμής, οι διευθύνσεις, οι σελιδοδείκτες, το ιστορικό σας και πολλά άλλα μπορούν να συγχρονίζονται σε όποια συσκευή χρησιμοποιείτε το { -brand-firefox }.
signup-confirmed-sync-description-v2 = Οι κωδικοί πρόσβασης, οι διευθύνσεις, οι σελιδοδείκτες, το ιστορικό σας και πολλά άλλα μπορούν να συγχρονίζονται σε όποια συσκευή χρησιμοποιείτε το { -brand-firefox }.
signup-confirmed-sync-add-device-link = Προσθήκη άλλης συσκευής
signup-confirmed-sync-manage-sync-button = Διαχείριση συγχρονισμού
signup-confirmed-sync-set-password-success-banner = Ο κωδικός πρόσβασης συγχρονισμού δημιουργήθηκε
