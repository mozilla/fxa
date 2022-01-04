# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoiceDiscount-subject = { $productName } payment confirmed
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoiceDiscount-title = Thank you for subscribing to { $productName }
subscriptionFirstInvoiceDiscount-content-processing = Your payment is currently processing and may take up to four business days to complete.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoiceDiscount-content-install = You will receive a separate email with download instructions on how to start using { $productName }.
subscriptionFirstInvoiceDiscount-content-auto-renew = Your subscription will automatically renew each billing period unless you choose to cancel.
# Variables:
#  $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
subscriptionFirstInvoiceDiscount-content-invoice-number = Invoice Number: <b>{ $invoiceNumber }</b>
# Variables:
#  $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
subscriptionFirstInvoiceDiscount-content-invoice-number-plaintext = Invoice Number: { $invoiceNumber }
# Variables:
#  $subtotal (String) - The amount, before discount, of the subscription invoice, including currency, e.g. $10.00
subscriptionFirstInvoiceDiscount-content-subtotal = Subtotal: { $subtotal }
# Variables:
#  $discountAmount (String) - The amount of the discount of the subscription invoice, including currency and negative sign, e.g. -$2.00
subscriptionFirstInvoiceDiscount-content-onetime-discount = One-time discount: { $discountAmount }
# Variables:
#  $invoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
#  $invoiceTotal (String) - The amount, after discount, of the subscription invoice, including currency, e.g. $8.00
subscriptionFirstInvoiceDiscount-content-charge = Charged { $invoiceTotal } on { $invoiceDateOnly }
# Variables:
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
subscriptionFirstInvoiceDiscount-content-next-invoice = Next Invoice: { $nextInvoiceDateOnly }
