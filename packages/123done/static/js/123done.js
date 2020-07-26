/*
 * This JavaScript file implements everything authentication
 * related in the 123done demo. This includes interacting
 * with the Persona API, the 123done server, and updating
 * the UI to reflect sign-in state.
 */

/* eslint no-unused-vars:off */
/* global loggedInState:writable, loggedInEmail:writable, loggedInSubscriptions:writable, alert, navigator, State, document, window, $ */

const PRO_PRODUCT = '123donePro';

$(document).ready(function () {
  window.loggedInEmail = null;
  window.loggedInSubscriptions = [];

  const paymentURL = {
    local: '//localhost:3030/subscriptions/products/',
    dev: 'https://latest.dev.lcip.org/subscriptions/products/',
    stage: 'https://accounts.stage.mozaws.net/subscriptions/products/',
    prod: 'https://accounts.firefox.com/subscriptions/products',
  };

  const subscriptionConfig = {
    default: {
      product: 'prod_GqM9ToKK62qjkK',
      plans: {
        usd: 'plan_GqM9N6qyhvxaVk',
        eur: 'price_1H8NnnBVqmGyQTMaLwLRKbF3',
        cad: 'price_1H8NoEBVqmGyQTMa5MtpqAUM',
        myr: 'price_1H8NpGBVqmGyQTMaA6Znyu7U',
      },
    },
    stage: {
      product: 'prod_FfiuDs9u11ESbD',
      plans: {
        usd: 'plan_FfiupsKXZ3mMZ6',
        eur: 'price_1H8OrbKb9q6OnNsLI1Hs9lBU',
        cad: 'price_1H8OroKb9q6OnNsLbn5v95el',
        myr: 'price_1H8Os8Kb9q6OnNsLTDqGHIbC',
      },
    },
  };

  let paymentConfig = {};
  switch (window.location.host) {
    case '123done-latest.dev.lcip.org':
      paymentConfig = {
        env: paymentURL.dev,
        ...subscriptionConfig.default,
      };
      break;
    case '123done-stage.dev.lcip.org':
      paymentConfig = {
        env: paymentURL.stage,
        ...subscriptionConfig.stage,
      };
      break;
    case '123done-prod.dev.lcip.org':
      paymentConfig = {
        env: 'prod',
      };
      break;
    default:
      paymentConfig = {
        env: paymentURL.local,
        ...subscriptionConfig.default,
      };
      break;
  }

  // Since we don't set up test payment stuff in prod,
  // we can just hide the buttons for that env
  if (paymentConfig.env === 'prod') {
    $('.btn-subscribe').hide();
  } else {
    $('.btn-subscribe').each(function (index) {
      const { env, plans, product } = paymentConfig;
      const currency = $(this).attr('data-currency');
      const currencyMappedURL = `${env}${product}?plan=${plans[currency]}`;
      $(this).attr('href', currencyMappedURL);
    });
  }

  function isSubscribed() {
    return (
      window.loggedInSubscriptions &&
      window.loggedInSubscriptions.includes(PRO_PRODUCT)
    );
  }

  // now check with the server to get our current login state
  $.get('/api/auth_status', function (data) {
    loggedInState = JSON.parse(data);
    loggedInEmail = loggedInState.email;
    loggedInSubscriptions = loggedInState.subscriptions;

    if (loggedInState.acr === 'AAL2') {
      loggedInEmail += ' ' + String.fromCodePoint(0x1f512);
    }

    function updateUI(email) {
      $('ul.loginarea li').css('display', 'none');
      if (email) {
        console.log(email);
        $('body').addClass('logged-in');
        $('#loggedin span').text(email);
        $('#loggedin').css('display', 'block');
        $('#splash').hide();
        $('#lists').slideDown(500);
      } else {
        $('#loggedin span').text('');
        $('#loggedout').css('display', 'block');
        $('#splash').show();
        $('#lists').hide();
      }
      $('button').removeAttr('disabled').css('opacity', '1');
      if (isSubscribed()) {
        $('body').addClass('is-subscribed');
      } else {
        $('body').removeClass('is-subscribed');
      }
    }

    function updateListArea(email) {
      $('section.todo ul').css('display', 'none');
      $('section.todo form').css('display', 'none');
      if (email) {
        $('#addform').css('display', 'block');
        $('#todolist').css('display', 'block');
        $('#donelist').css('display', 'block');
      } else {
        $('#signinhere').css('display', 'block');
      }
    }

    var logout = function () {
      // upon logout, make an api request to tear the user's session down
      // then change the UI
      $.post('/api/logout')
        .always(function () {
          loggedInEmail = null;
          updateUI(loggedInEmail);
          updateListArea(loggedInEmail);

          $('body').removeClass('logged-in');
          $('#splash').show();
          $('#lists').hide();

          // clear items from the dom at logout
          $('#todolist > li').remove();
          State.save();

          // don't display the warning icon at logout time, but wait until the user
          // makes a change to her tasks
          $('#dataState > div').css('display', 'none');
        })
        .fail(function () {
          // this should never happen
          alert('Failed to logout');
        });
    };

    function authenticate(endpoint) {
      // propagate query parameters to the authorization request.
      // This is used by the functional tests to, e.g., override
      // the client_id or propagate an email.
      window.location.href = `/api/${endpoint}${window.location.search}`;
    }

    $('button.signin').click(function (ev) {
      authenticate('login');
    });

    $('button.signup').click(function (ev) {
      authenticate('signup');
    });

    $('button.sign-choose').click(function (ev) {
      authenticate('best_choice');
    });

    $('button.sign-choose').click(function (ev) {
      authenticate('best_choice');
    });

    $('button.email-first').click(function (ev) {
      authenticate('email_first');
    });

    $('button.two-step-authentication').click(function (ev) {
      authenticate('two_step_authentication');
    });

    $('button.force-auth').click(function (ev) {
      if (
        !window.location.search.includes('email=') &&
        !window.location.search.includes('login_hint=') &&
        !navigator.userAgent.includes('FxATester')
      ) {
        alert('force_auth requires an `email` or `login_hint` query parameter');
        return;
      }
      authenticate('force_auth');
    });

    $('button.prompt-none').click(function (ev) {
      if (
        !window.location.search.includes('login_hint=') &&
        !navigator.userAgent.includes('FxATester')
      ) {
        alert('prompt=none requires a `login_hint` query parameter');
        return;
      }
      authenticate('prompt_none');
    });

    // upon click of logout link navigator.id.logout()
    $('#logout').click(function (ev) {
      ev.preventDefault();
      logout();
    });

    updateUI(loggedInEmail);
    updateListArea(loggedInEmail);
    // display current saved state
    State.load();
    $('body')
      .addClass('ready')
      .addClass('ready-hash-' + window.location.hash.substr(1));
  });
});
