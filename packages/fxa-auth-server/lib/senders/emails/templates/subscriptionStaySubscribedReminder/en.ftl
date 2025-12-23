# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionStaySubscribedReminder-subject = { $productName } expiry notice
subscriptionStaySubscribedReminder-title = Your { $productName } subscription will expire soon

# Variables:
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
#   $serviceLastActiveDateOnly (String) - The date of last active service, e.g. 01/20/2016
subscriptionStaySubscribedReminder-content-line1 = Your access to { $productName } will end on <strong>{ $serviceLastActiveDateOnly }</strong>.
subscriptionStaySubscribedReminder-content-line2 = If you’d like to continue using { $productName }, you can reactive your subscription in <a data-l10n-name="subscriptionStaySubscribedReminder-account-settings">Account Settings</a> before <strong{ $serviceLastActiveDateOnly }</strong>. If you need assistance, <a data-l10n-name="subscriptionStaySubscribedReminder-contact-support">contact our Support Team</a>.  

subscriptionStaySubscribedReminder-content-closing = Thanks for being a valued subscriber!

subscriptionStaySubscribedReminder-churn-title = Want to keep access?
subscriptionStaySubscribedReminder-churn-terms = <a data-l10n-name="subscriptionStaySubscribedReminder-churn-terms">Limited terms and restrictions apply</a>

# Variables:
#  $churnTermsUrl (String) - URL to the terms and restrictions page applied to this promotion 
subscriptionStaySubscribedReminder-churn-terms-plaintext = Limited terms and restrictions apply: { $churnTermsUrl }

# Variables:
#  $subscriptionSupportUrl (String) - URL to the subscription products support page
subscriptionStaySubscribedReminder-content-support-plaintext = Contact our Support Team: { $subscriptionSupportUrl }
