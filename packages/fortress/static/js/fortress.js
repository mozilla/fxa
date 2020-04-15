/* global q$, document, window, $ */

q$(document).ready(function() {
  let paymentURL;
  switch (window.location.host) {
    case 'fortress-latest.dev.lcip.org':
      paymentURL =
        'https://latest.dev.lcip.org/subscriptions/products/plan_FUUOYlhpIhWtoo';
      break;
    default:
      paymentURL = '//localhost:3030/subscriptions/products/fortressProProduct';
      break;
  }
  $('.btn-subscribe').each(function(index) {
    $(this).attr('href', paymentURL);
  });
});
