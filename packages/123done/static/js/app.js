/*
 * This JavaScript file implements everything authentication
 * related in the 123done demo. This includes interacting
 * with the Persona API, the 123done server, and updating
 * the UI to reflect sign-in state.
 */

const PRO_PRODUCT = '123donePro';

$(document).ready(function() {
  window.loggedInEmail = null;
  window.loggedInSubscriptions = [];

  let paymentURL;
  switch (window.location.host) {
    case '123done-latest.dev.lcip.org':
      paymentURL =
        'https://latest.dev.lcip.org/subscriptions/products/prod_Ex9Z1q5yVydhyk';
      break;
    case '123done-stage.dev.lcip.org':
      paymentURL = 'TBD';
      break;
    default:
      paymentURL = '//127.0.0.1:3030/subscriptions/products/123doneProProduct';
      break;
  }

  $('a.subscribe').each(function(index) {
    $(this).attr('href', paymentURL);
  });

  function isSubscribed() {
    return (
      window.loggedInSubscriptions &&
      window.loggedInSubscriptions.includes(PRO_PRODUCT)
    );
  }

  function initAuthSelector() {
    const selectedFxAType = $("select[name='fxa-type']").val();
    $(`.fxa-button.${selectedFxAType}`).css('display', 'flex');

    $("select[name='fxa-type']").change(e => {
      $('.fxa-button').hide();
      $(`.fxa-button.${e.target.value}`).css('display', 'flex');
    });
  };

  // now check with the server to get our current login state
  $.get('/api/auth_status', function(data) {
    loggedInState = JSON.parse(data);
    loggedInEmail = loggedInState.email;
    loggedInSubscriptions = loggedInState.subscriptions;

    if (loggedInState.acr === 'AAL2') {
      loggedInEmail += ' ' + String.fromCodePoint(0x1f512);
    }

    if (loggedInEmail === null) {
      $('#splash-page').css('display', 'flex');
      $('#auth-page').hide();
    } else {
      $('#auth-page').css('display', 'flex');
      $('#splash-page').hide();
      $('.email-address').text(loggedInEmail);
    }

    if (isSubscribed()) {
      $('body').addClass('is-subscribed');
    } else {
      $('body').removeClass('is-subscribed');
    }

    var logout = function() {
      // upon logout, make an api request to tear the user's session down
      // then change the UI
      $.post('/api/logout')
        .always(function() {
          loggedInEmail = null;
          $('#splash-page').css('display', 'flex');
          $('#auth-page').hide();
          $('body').removeClass('is-subscribed');
        })
        .fail(function() {
          // this should never happen
          alert('Failed to logout');
        });
    };

    function authenticate(endpoint) {
      window.location.href = '/api/' + endpoint;
    }

    $('button.signin').click(function(ev) {
      authenticate('login');
    });

    $('button.signup').click(function(ev) {
      authenticate('signup');
    });

    $('button.sign-choose').click(function(ev) {
      authenticate('best_choice');
    });

    $('button.email-first').click(function(ev) {
      authenticate('email_first');
    });

    $('button.two-step-authentication').click(function(ev) {
      authenticate('two_step_authentication');
    });

    // upon click of logout link navigator.id.logout()
    $('.sign-out').click(function(ev) {
      ev.preventDefault();
      logout();
    });
  });

  initAuthSelector();
});
