



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



settings-home = Αρχική σελίδα λογαριασμού
settings-project-header-title = { -product-mozilla-account }


coupon-promo-code-applied = Εφαρμόστηκε κωδικός προσφοράς
coupon-submit = Εφαρμογή
coupon-remove = Αφαίρεση
coupon-error = Ο κωδικός που καταχωρίσατε δεν είναι έγκυρος ή έχει λήξει.
coupon-error-generic = Προέκυψε σφάλμα κατά την επεξεργασία του κωδικού. Δοκιμάστε ξανά.
coupon-error-expired = Ο κωδικός που καταχωρήσατε έληξε.
coupon-error-limit-reached = Ο κωδικός που καταχωρήσατε έφτασε στο όριο του.
coupon-error-invalid = Ο κωδικός που καταχωρήσατε δεν είναι έγκυρος.
coupon-enter-code =
    .placeholder = Εισαγωγή κωδικού


default-input-error = Αυτό το πεδίο απαιτείται
input-error-is-required = Απαιτείται το { $label }


brand-name-mozilla-logo = Λογότυπο { -brand-mozilla }


new-user-sign-in-link-2 = Διαθέτετε ήδη { -product-mozilla-account(case: "acc", capitalization: "lower") }; <a>Συνδεθείτε</a>
new-user-enter-email =
    .label = Εισαγάγετε το email σας
new-user-confirm-email =
    .label = Επιβεβαιώστε το email σας
new-user-subscribe-product-updates-mozilla = Επιθυμώ να λαμβάνω ειδήσεις και ενημερώσεις προϊόντων από τη { -brand-mozilla }
new-user-subscribe-product-updates-snp = Επιθυμώ να λαμβάνω ειδήσεις και ενημερώσεις ασφαλείας και απορρήτου από τη { -brand-mozilla }
new-user-subscribe-product-updates-hubs = Επιθυμώ να λαμβάνω ειδήσεις και ενημερώσεις προϊόντων από το { -product-mozilla-hubs } και τη { -brand-mozilla }
new-user-subscribe-product-updates-mdnplus = Επιθυμώ να λαμβάνω ειδήσεις και ενημερώσεις προϊόντων από το { -product-mdn-plus } και τη { -brand-mozilla }
new-user-subscribe-product-assurance = Χρησιμοποιούμε το email σας μόνο για τη δημιουργία του λογαριασμού σας. Δεν θα το πωλήσουμε ποτέ σε τρίτους.
new-user-email-validate = Το email δεν είναι έγκυρο
new-user-email-validate-confirm = Τα email δεν ταιριάζουν
new-user-already-has-account-sign-in = Έχετε ήδη λογαριασμό. <a>Σύνδεση</a>
new-user-invalid-email-domain = Εσφαλμένο email; Το { $domain } δεν προσφέρει email.


payment-confirmation-thanks-heading = Ευχαριστούμε!
payment-confirmation-thanks-heading-account-exists = Ευχαριστούμε, τώρα ελέγξτε το email σας!
payment-confirmation-thanks-subheading = Έχει αποσταλεί ένα email επιβεβαίωσης στο { $email } με βασικές οδηγίες για τη λειτουργία του { $product_name }.
payment-confirmation-thanks-subheading-account-exists = Θα λάβετε ένα email στο { $email } με οδηγίες για τη ρύθμιση του λογαριασμού και των στοιχείων πληρωμής σας.
payment-confirmation-order-heading = Λεπτομέρειες παραγγελίας
payment-confirmation-invoice-number = Παραστατικό #{ $invoiceNumber }
payment-confirmation-invoice-date = { $invoiceDate }
payment-confirmation-details-heading-2 = Στοιχεία πληρωμής
payment-confirmation-amount = { $amount } ανά { $interval }
payment-confirmation-amount-day =
    { $intervalCount ->
        [one] { $amount } ημερισίως
       *[other] { $amount } κάθε { $intervalCount } ημέρες
    }
payment-confirmation-amount-week =
    { $intervalCount ->
        [one] { $amount } εβδομαδιαία
       *[other] { $amount } κάθε { $intervalCount } εβδομάδες
    }
payment-confirmation-amount-month =
    { $intervalCount ->
        [one] { $amount } μηνιαία
       *[other] { $amount } κάθε { $intervalCount } μήνες
    }
payment-confirmation-amount-year =
    { $intervalCount ->
        [one] { $amount } ετησίως
       *[other] { $amount } κάθε { $intervalCount } χρόνια
    }
payment-confirmation-download-button = Συνέχεια στη λήψη


payment-confirm-with-legal-links-static-3 = Εξουσιοδοτώ τη { -brand-mozilla } να χρεώνει τη μέθοδο πληρωμής μου με το αναγραφόμενο ποσό, σύμφωνα με τους <termsOfServiceLink>Όρους υπηρεσίας</termsOfServiceLink> και τη <privacyNoticeLink>Σημείωση απορρήτου</privacyNoticeLink>, μέχρι να ακυρώσω τη συνδρομή μου.
payment-confirm-checkbox-error = Πρέπει να ολοκληρώσετε αυτήν τη διαδικασία πριν προχωρήσετε


payment-error-retry-button = Δοκιμή ξανά
payment-error-manage-subscription-button = Διαχείριση συνδρομής


iap-upgrade-already-subscribed-2 = Διαθέτετε ήδη συνδρομή στο { $productName } μέσω του { -brand-google } Play Store ή του { -brand-apple } App Store.
iap-upgrade-no-bundle-support = Δεν υποστηρίζουμε αναβαθμίσεις για αυτές τις συνδρομές, αλλά θα το κάνουμε σύντομα.
iap-upgrade-contact-support = Μπορείτε ακόμα να αποκτήσετε αυτό το προϊόν. Επικοινωνήστε με την υποστήριξη για να σας βοηθήσουμε.
iap-upgrade-get-help-button = Λήψη βοήθειας


payment-name =
    .placeholder = Πλήρες όνομα
    .label = Το όνομα όπως εμφανίζεται στην κάρτα σας
payment-cc =
    .label = Η κάρτα σας
payment-cancel-btn = Ακύρωση
payment-update-btn = Ενημέρωση
payment-pay-btn = Πληρωμή τώρα
payment-pay-with-paypal-btn-2 = Πληρωμή με { -brand-paypal }
payment-validate-name-error = Εισαγάγετε το όνομά σας


payment-legal-copy-stripe-and-paypal-3 = Η { -brand-mozilla } χρησιμοποιεί τα { -brand-name-stripe } και { -brand-paypal } για την ασφαλή επεξεργασία των πληρωμών.
payment-legal-link-stripe-paypal-2 = <stripePrivacyLink>Πολιτική απορρήτου του { -brand-name-stripe }</stripePrivacyLink> &nbsp; <paypalPrivacyLink>Πολιτική απορρήτου του { -brand-paypal }</paypalPrivacyLink>
payment-legal-copy-paypal-2 = Η { -brand-mozilla } χρησιμοποιεί το { -brand-paypal } για την ασφαλή επεξεργασία των πληρωμών.
payment-legal-link-paypal-3 = <paypalPrivacyLink>Πολιτική απορρήτου του { -brand-paypal }</paypalPrivacyLink>
payment-legal-copy-stripe-3 = Η { -brand-mozilla } χρησιμοποιεί το { -brand-name-stripe } για την ασφαλή επεξεργασία των πληρωμών.
payment-legal-link-stripe-3 = <stripePrivacyLink>Πολιτική απορρήτου του { -brand-name-stripe }</stripePrivacyLink>.


payment-method-header = Επιλέξτε τη μέθοδο πληρωμής σας
payment-method-header-second-step = 2. { payment-method-header }
payment-method-first-approve = Θα πρέπει πρώτα να εγκρίνετε τη συνδρομή σας


payment-processing-message = Περιμένετε όσο επεξεργαζόμαστε την πληρωμή σας…


payment-confirmation-cc-card-ending-in = Κάρτα που λήγει σε { $last4 }


pay-with-heading-paypal-2 = Πληρωμή με { -brand-paypal }


plan-details-header = Λεπτομέρειες προιόντος
plan-details-list-price = Τιμή καταλόγου
plan-details-show-button = Εμφάνιση λεπτομερειών
plan-details-hide-button = Απόκρυψη λεπτομερειών
plan-details-total-label = Σύνολο
plan-details-tax = Φόροι και τέλη


product-no-such-plan = Δεν υπάρχει τέτοιο πρόγραμμα για αυτό το προϊόν.


price-details-no-tax = { $priceAmount }
price-details-tax = { $priceAmount } + φόρος { $taxAmount }
price-details-no-tax-day =
    { $intervalCount ->
        [one] { $priceAmount } ημερησίως
       *[other] { $priceAmount } κάθε { $intervalCount } ημέρες
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } ημερησίως
           *[other] { $priceAmount } κάθε { $intervalCount } ημέρες
        }
price-details-no-tax-week =
    { $intervalCount ->
        [one] { $priceAmount } εβδομαδιαία
       *[other] { $priceAmount } κάθε { $intervalCount } εβδομάδες
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } εβδομαδιαία
           *[other] { $priceAmount } κάθε { $intervalCount } εβδομάδες
        }
price-details-no-tax-month =
    { $intervalCount ->
        [one] { $priceAmount } μηνιαία
       *[other] { $priceAmount } κάθε { $intervalCount } μήνες
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } μηνιαία
           *[other] { $priceAmount } κάθε { $intervalCount } μήνες
        }
price-details-no-tax-year =
    { $intervalCount ->
        [one] { $priceAmount } ετησίως
       *[other] { $priceAmount } κάθε { $intervalCount } έτη
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } ετησίως
           *[other] { $priceAmount } κάθε { $intervalCount } έτη
        }
price-details-tax-day =
    { $intervalCount ->
        [one] { $priceAmount } + { $taxAmount } φόρος ημερησίως
       *[other] { $priceAmount } + { $taxAmount } φόρος κάθε { $intervalCount } ημέρες
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + { $taxAmount } φόρος ημερησίως
           *[other] { $priceAmount } + { $taxAmount } φόρος κάθε { $intervalCount } ημέρες
        }
price-details-tax-week =
    { $intervalCount ->
        [one] { $priceAmount } + { $taxAmount } φόρος εβδομαδιαία
       *[other] { $priceAmount } + { $taxAmount } φόρος κάθε { $intervalCount } εβδομάδες
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + { $taxAmount } φόρος εβδομαδιαία
           *[other] { $priceAmount } + { $taxAmount } φόρος κάθε { $intervalCount } εβδομάδες
        }
price-details-tax-month =
    { $intervalCount ->
        [one] { $priceAmount } + { $taxAmount } φόρος μηνιαία
       *[other] { $priceAmount } + { $taxAmount } φόρος κάθε { $intervalCount } μήνες
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + { $taxAmount } φόρος μηνιαία
           *[other] { $priceAmount } + { $taxAmount } φόρος κάθε { $intervalCount } μήνες
        }
price-details-tax-year =
    { $intervalCount ->
        [one] { $priceAmount } + { $taxAmount } φόρος ετησίως
       *[other] { $priceAmount } + { $taxAmount } φόρος κάθε { $intervalCount } έτη
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + { $taxAmount } φόρος ετησίως
           *[other] { $priceAmount } + { $taxAmount } φόρος κάθε { $intervalCount } έτη
        }


subscription-create-title = Ρύθμιση συνδρομής
subscription-success-title = Επιβεβαίωση συνδρομής
subscription-processing-title = Επιβεβαίωση συνδρομής…
subscription-error-title = Σφάλμα επιβεβαίωσης συνδρομής…
subscription-noplanchange-title = Δεν υποστηρίζεται αυτή η αλλαγή πακέτου συνδρομής
subscription-iapsubscribed-title = Έχετε ήδη εγγραφεί
sub-guarantee = Εγγύηση επιστροφής χρημάτων 30 ημερών


subplat-mozilla-accounts-legal-heading = { -product-mozilla-accounts(case: "nom", capitalization: "upper") }
terms = Όροι υπηρεσίας
privacy = Σημείωση απορρήτου
terms-download = Λήψη όρων


document =
    .title = Λογαριασμός Firefox
close-aria =
    .aria-label = Κλείσιμο διαλόγου
settings-subscriptions-title = Συνδρομές
coupon-promo-code = Κωδικός προσφοράς


plan-price-interval-day =
    { $intervalCount ->
        [one] { $amount } ημερησίως
       *[other] { $amount } κάθε { $intervalCount } ημέρες
    }
    .title =
        { $intervalCount ->
            [one] { $amount } ημερησίως
           *[other] { $amount } κάθε { $intervalCount } ημέρες
        }
plan-price-interval-week =
    { $intervalCount ->
        [one] { $amount } εβδομαδιαία
       *[other] { $amount } κάθε { $intervalCount } εβδομάδες
    }
    .title =
        { $intervalCount ->
            [one] { $amount } εβδομαδιαία
           *[other] { $amount } κάθε { $intervalCount } εβδομάδες
        }
plan-price-interval-month =
    { $intervalCount ->
        [one] { $amount } μηνιαία
       *[other] { $amount } κάθε { $intervalCount } μήνες
    }
    .title =
        { $intervalCount ->
            [one] { $amount } μηνιαία
           *[other] { $amount } κάθε { $intervalCount } μήνες
        }
plan-price-interval-year =
    { $intervalCount ->
        [one] { $amount } ετησίως
       *[other] { $amount } κάθε { $intervalCount } έτη
    }
    .title =
        { $intervalCount ->
            [one] { $amount } ετησίως
           *[other] { $amount } κάθε { $intervalCount } έτη
        }


general-error-heading = Γενικό σφάλμα εφαρμογής
basic-error-message = Κάτι πήγε στραβά. Δοκιμάστε ξανά αργότερα.
payment-error-1 = Προέκυψε πρόβλημα κατά την έγκριση της πληρωμής σας. Δοκιμάστε ξανά ή επικοινωνήστε με τον εκδότη της κάρτας σας.
payment-error-2 = Προέκυψε πρόβλημα κατά την έγκριση της πληρωμής σας. Επικοινωνήστε με τον εκδότη της κάρτας σας.
payment-error-3b = Προέκυψε μη αναμενόμενο σφάλμα κατά την επεξεργασία της πληρωμής σας. Δοκιμάστε ξανά.
expired-card-error = Φαίνεται πως η πιστωτική σας κάρτα έχει λήξει. Δοκιμάστε μια άλλη κάρτα.
insufficient-funds-error = Φαίνεται πως η κάρτα σας δεν διαθέτει επαρκή χρήματα. Δοκιμάστε μια άλλη κάρτα.
withdrawal-count-limit-exceeded-error = Φαίνεται πως αυτή η συναλλαγή θα υπερβεί το πιστωτικό σας όριο. Δοκιμάστε με μια άλλη κάρτα.
charge-exceeds-source-limit = Φαίνεται πως αυτή η συναλλαγή θα υπερβεί το ημερήσιο πιστωτικό σας όριο. Δοκιμάστε με μια άλλη κάρτα ή σε 24 ώρες.
instant-payouts-unsupported = Φαίνεται πως η χρεωστική σας κάρτα δεν έχει ρυθμιστεί για άμεσες πληρωμές. Δοκιμάστε μια άλλη χρεωστική ή πιστωτική κάρτα.
duplicate-transaction = Φαίνεται πως μόλις απεστάλη μια πανομοιότυπη συναλλαγή. Ελέγξτε το ιστορικό πληρωμών σας.
coupon-expired = Φαίνεται πως ο κωδικός της προωθητικής ενέργειας έχει λήξει.
card-error = Δεν ήταν δυνατή η επεξεργασία της συναλλαγής σας. Επαληθεύστε τα στοιχεία της πιστωτικής σας κάρτας και δοκιμάστε ξανά.
country-currency-mismatch = Το νόμισμα της συνδρομής δεν είναι έγκυρο για τη χώρα που σχετίζεται με την πληρωμή σας.
currency-currency-mismatch = Δυστυχώς, δεν μπορείτε να κάνετε εναλλαγή νομισμάτων.
location-unsupported = Η τρέχουσα τοποθεσία σας δεν υποστηρίζεται σύμφωνα με τους Όρους υπηρεσίας μας.
no-subscription-change = Δυστυχώς, δεν μπορείτε να αλλάξετε το πακέτο συνδρομής σας.
iap-already-subscribed = Έχετε ήδη εγγραφεί μέσω του { $mobileAppStore }.
fxa-account-signup-error-2 = Ένα σφάλμα συστήματος προκάλεσε την αποτυχία της εγγραφής σας στο { $productName }. Η μέθοδος πληρωμής σας δεν χρεώθηκε. Δοκιμάστε ξανά.
fxa-post-passwordless-sub-error = Η συνδρομή επιβεβαιώθηκε, αλλά η φόρτωση της σελίδας επιβεβαίωσης απέτυχε. Ελέγξτε το email σας για να ρυθμίσετε τον λογαριασμό σας.
newsletter-signup-error = Δεν έχετε εγγραφεί για email ενημέρωσης προϊόντων. Μπορείτε να δοκιμάσετε ξανά στις ρυθμίσεις του λογαριασμού σας.
product-plan-error =
    .title = Πρόβλημα φόρτωσης προγραμμάτων
product-profile-error =
    .title = Πρόβλημα φόρτωσης προφίλ
product-customer-error =
    .title = Πρόβλημα φόρτωσης πελάτη
product-plan-not-found = Το πρόγραμμα δεν βρέθηκε
product-location-unsupported-error = Η τοποθεσία δεν υποστηρίζεται


coupon-success = Το πρόγραμμά σας θα ανανεωθεί αυτόματα στην τιμή καταλόγου.
coupon-success-repeating = Το πρόγραμμά σας θα ανανεωθεί αυτόματα μετά τις { $couponDurationDate } στην τιμή καταλόγου.


new-user-step-1-2 = 1. Δημιουργήστε έναν { -product-mozilla-account(case: "acc", capitalization: "lower") }
new-user-card-title = Εισαγάγετε τα στοιχεία της κάρτας σας
new-user-submit = Εγγραφή τώρα


sub-update-payment-title = Πληροφορίες πληρωμής


pay-with-heading-card-only = Πληρωμή με κάρτα
product-invoice-preview-error-title = Πρόβλημα φόρτωσης προεπισκόπησης παραστατικού
product-invoice-preview-error-text = Δεν ήταν δυνατή η φόρτωση προεπισκόπησης παραστατικού


subscription-iaperrorupgrade-title = Δεν μπορεί να γίνει αναβάθμιση ακόμα


brand-name-google-play-2 = { -google-play } Store
brand-name-apple-app-store-2 = { -app-store }


product-plan-change-heading = Ελέγξτε την αλλαγή σας
sub-change-failed = Η αλλαγή προγράμματος απέτυχε
sub-update-acknowledgment =
    Το πλάνο σας θα αλλάξει αμέσως και θα χρεωθείτε σήμερα με το ποσό που
    αναλογεί στο υπόλοιπο αυτού του κύκλου χρέωσης. Από τις { $startingDate }
    θα χρεώνεστε με το πλήρες ποσό.
sub-change-submit = Επιβεβαίωση αλλαγής
sub-update-current-plan-label = Τρέχον πλάνο
sub-update-new-plan-label = Νέο πλάνο
sub-update-total-label = Νέο σύνολο
sub-update-prorated-upgrade = Αναλογική αναβάθμιση


sub-update-new-plan-daily = { $productName } (Ημερησίως)
sub-update-new-plan-weekly = { $productName } (Εβδομαδιαία)
sub-update-new-plan-monthly = { $productName } (Μηνιαία)
sub-update-new-plan-yearly = { $productName } (Ετησίως)
sub-update-prorated-upgrade-credit = Το αρνητικό υπόλοιπο που εμφανίζεται θα πιστωθεί στον λογαριασμό σας και θα χρησιμοποιηθεί σε μελλοντικά παραστατικά.


sub-item-cancel-sub = Ακύρωση συνδρομής
sub-item-stay-sub = Μείνετε συνδρομητής


sub-item-cancel-msg =
    Δεν θα μπορείτε πλέον να χρησιμοποιείτε το { $name } μετά από
    { $period }, την τελευταία μέρα του κύκλου χρέωσής σας.
sub-item-cancel-confirm =
    Ακύρωση πρόσβασης και αποθηκευμένων πληροφοριών στο
    { $name } στις { $period }
sub-promo-coupon-applied = Εφαρμόστηκε το κουπόνι «{ $promotion_name }»: <priceDetails></priceDetails>
subscription-management-account-credit-balance = Αυτή η πληρωμή συνδρομής είχε ως αποτέλεσμα μια πίστωση στο υπόλοιπο του λογαριασμού σας: <priceDetails></priceDetails>


sub-route-idx-reactivating = Αποτυχία επανενεργοποίησης της συνδρομής
sub-route-idx-cancel-failed = Αποτυχία ακύρωσης της συνδρομής
sub-route-idx-contact = Επικοινωνία με την υποστήριξη
sub-route-idx-cancel-msg-title = Λυπούμαστε που φεύγετε.
sub-route-idx-cancel-msg =
    Η συνδρομή σας στο { $name } έχει ακυρωθεί.
          <br />
          Θα έχετε ακόμη πρόσβαση στο { $name } μέχρι τις { $date }.
sub-route-idx-cancel-aside-2 = Έχετε απορίες; Επισκεφτείτε την <a>Υποστήριξη { -brand-mozilla }</a>.


sub-customer-error =
    .title = Πρόβλημα φόρτωσης πελάτη
sub-invoice-error =
    .title = Πρόβλημα φόρτωσης παραστατικών
sub-billing-update-success = Τα στοιχεία χρέωσής σας ενημερώθηκαν με επιτυχία
sub-invoice-previews-error-title = Πρόβλημα φόρτωσης προεπισκοπήσεων παραστατικών
sub-invoice-previews-error-text = Δεν ήταν δυνατή η φόρτωση προεπισκοπήσεων παραστατικών


pay-update-change-btn = Αλλαγή
pay-update-manage-btn = Διαχείριση


sub-next-bill = Επόμενη χρέωση στις { $date }
sub-next-bill-due-date = Προθεσμία επόμενου λογαριασμού: { $date }
sub-expires-on = Λήγει στις { $date }




pay-update-card-exp = Λήγει στις { $expirationDate }
sub-route-idx-updating = Ενημέρωση στοιχείων χρέωσης…
sub-route-payment-modal-heading = Μη έγκυρα στοιχεία χρέωσης
sub-route-payment-modal-message-2 = Φαίνεται ότι υπάρχει σφάλμα με τον λογαριασμό σας στο { -brand-paypal }. Θα πρέπει να λάβετε τα απαραίτητα μέτρα για την επίλυση αυτού του προβλήματος πληρωμής.
sub-route-missing-billing-agreement-payment-alert = Μη έγκυρα στοιχεία πληρωμής· υπάρχει σφάλμα με τον λογαριασμό σας. <div>Διαχείριση</div>
sub-route-funding-source-payment-alert = Μη έγκυρα στοιχεία πληρωμής· υπάρχει σφάλμα στον λογαριασμό σας. Αυτή η ειδοποίηση ενδέχεται να χρειαστεί λίγη ώρα για να εξαφανιστεί αφού ενημερώσετε επιτυχώς τα στοιχεία σας. <div>Διαχείριση</div>


sub-item-no-such-plan = Δεν υπάρχει τέτοιο πλάνο για αυτήν τη συνδρομή.
invoice-not-found = Δεν βρέθηκε επόμενο παραστατικό
sub-item-no-such-subsequent-invoice = Δεν βρέθηκε επόμενο παραστατικό για αυτήν τη συνδρομή.
sub-invoice-preview-error-title = Δεν βρέθηκε προεπισκόπηση παραστατικού
sub-invoice-preview-error-text = Δεν βρέθηκε προεπισκόπηση παραστατικού για αυτήν τη συνδρομή


reactivate-confirm-dialog-header = Θέλετε να συνεχίσετε να χρησιμοποιείτε το όνομα { $name };
reactivate-confirm-copy =
    Η πρόσβασή σας στο { $name } θα συνεχιστεί, ενώ ο κύκλος χρέωσής σας
    και οι πληρωμές θα παραμείνουν ως έχουν. Η επόμενη χρέωση θα είναι
    { $amount } στην κάρτα που λήγει σε { $last } στις { $endDate }.
reactivate-confirm-without-payment-method-copy =
    Η πρόσβασή σας στο { $name } θα συνεχιστεί, ενώ ο κύκλος χρέωσής σας
    και οι πληρωμές θα παραμείνουν ως έχουν. Η επόμενη χρέωση θα είναι
    { $amount } στις { $endDate }.
reactivate-confirm-button = Επανανεγγραφή


reactivate-panel-copy = Θα χάσετε την πρόσβαση στο { $name } στις <strong>{ $date }</strong>.
reactivate-success-copy = Ευχαριστούμε! Όλα είναι έτοιμα.
reactivate-success-button = Κλείσιμο


sub-iap-item-google-purchase-2 = { -brand-google }: Αγορά εντός εφαρμογής
sub-iap-item-apple-purchase-2 = { -brand-apple }: Αγορά εντός εφαρμογής
sub-iap-item-manage-button = Διαχείριση
