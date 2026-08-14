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
    local: 'http://localhost:3030/subscriptions/products/',
    dev: 'https://latest.dev.lcip.org/subscriptions/products/',
    stage: 'https://accounts.stage.mozaws.net/subscriptions/products/',
    prod: 'https://accounts.firefox.com/subscriptions/products',
  };

  const sp3URL = {
    local: 'http://localhost:3035/',
    dev: '',
    stage: 'https://payments-next.allizom.org/',
    prod: '',
  };

  const contentURL = {
    local: 'http://localhost:3030/',
    dev: 'https://latest.dev.lcip.org/',
    stage: 'https://accounts.stage.mozaws.net/',
    prod: 'https://accounts.firefox.com/',
  };

  const subscriptionConfig = {
    sp3links: {
      'sp3-1m': '123donepro/monthly/landing',
      'sp3-6m': '123donepro/halfyearly/landing',
      'sp3-12m': '123donepro/yearly/landing',
      'sp3-1m-gb': 'en-GB/123donepro/monthly/landing',
    },
  };

  let paymentConfig = {};
  switch (window.location.host) {
    case '123done-latest.dev.lcip.org':
      paymentConfig = {
        sp3Url: sp3URL.dev,
        sp3links: subscriptionConfig.sp3links,
        contentEnv: contentURL.dev,
      };
      break;
    case 'stage-123done.herokuapp.com':
      paymentConfig = {
        sp3Url: sp3URL.stage,
        sp3links: subscriptionConfig.sp3links,
        contentEnv: contentURL.stage,
      };
      break;
    // TODO: Enable when functional-tests are setup for prod
    // case 'production-123done.herokuapp.com':
    //   paymentConfig = {
    //     env: 'prod',
    //     contentEnv: contentURL.prod,
    //   };
    //   break;
    default:
      paymentConfig = {
        sp3Url: sp3URL.local,
        sp3links: subscriptionConfig.sp3links,
        contentEnv: contentURL.local,
      };
      break;
  }

  let flowData;
  $.getJSON(
    `${paymentConfig.contentEnv}metrics-flow?form_type=button&utm_campaign=123done`
  ).done(function (data) {
    // Because this is an async request, this happens AFTER we update the href on this button below
    $('.btn-subscribe-rp-provided-flow-metrics').each(function (index) {
      let currencyMappedURL = $(this).attr('href');

      if (data) {
        flowData = data;
        const additionalParams =
          'service=dcdb5ae7add825d2&entrypoint=www.mozilla.org-vpn-product-page&form_type=button&utm_source=www.mozilla.org-vpn-product-page&utm_medium=referral&utm_campaign=vpn-product-page&data_cta_position=pricing';
        currencyMappedURL = `${currencyMappedURL}&${additionalParams}&flow_id=${data.flowId}&flow_begin_time=${data.flowBeginTime}&device_id=${data.deviceId}`;
      }

      $(this).attr('href', currencyMappedURL);
    });
  });

  // Since we don't set up test payment stuff in prod,
  // we can just hide the buttons for that env
  if (paymentConfig.env === 'prod') {
    $('.btn-subscribe').hide();
  } else {
    $('.btn-subscribe, .btn-subscribe-rp-provided-flow-metrics').each(
      function (index) {
        const { env, plans, product, sp3Url, sp3links } = paymentConfig;
        const currency = $(this).attr('data-currency');
        const sp3 = $(this).attr('data-sp3');
        const currencyMappedURL = sp3
          ? `${sp3Url}${sp3links[sp3]}`
          : `${env}${product}?plan=${plans[currency]}`;
        $(this).attr('href', currencyMappedURL);
      }
    );
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
    // Account-level AAL2 marker, distinct from the session AAL2 lock icon.
    if (loggedInState.account_aal2) {
      loggedInEmail += ' ' + String.fromCodePoint(0x1f6e1);
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

      if (loggedInState.keys_jwe) {
        $('#keys').text(`Scoped key: ${loggedInState.keys_jwe}`);
      }

      renderStepUpClaims(email);
    }

    // auth_time is seconds since the epoch; show the raw value and a readable one.
    function formatAuthTime(authTime) {
      if (!authTime) {
        return 'auth_time: (none)';
      }
      return `auth_time: ${authTime} (${new Date(authTime * 1000).toISOString()})`;
    }

    // Two views of the same elevation, which should agree: the id_token claims from
    // redirect time, and what the authorization server reports for the access token.
    function renderStepUpClaims(email) {
      $('#id-token-acr, #id-token-auth-time').text('');
      $('#introspect-acr, #introspect-auth-time, #introspect-amr').text('');
      if (!email) {
        return;
      }

      $('#id-token-acr').text(`acr: ${loggedInState.acr || '(none)'}`);
      $('#id-token-auth-time').text(formatAuthTime(loggedInState.auth_time));

      // Fetched once per page load; /v1/introspect is rate-limited per IP.
      $.get('/api/token_claims')
        .done(function (claims) {
          $('#introspect-acr').text(`acr: ${claims.acr || '(none)'}`);
          $('#introspect-auth-time').text(formatAuthTime(claims.auth_time));
          $('#introspect-amr').text(
            `amr: ${claims.amr ? claims.amr.join(' ') : '(none)'}`
          );
        })
        .fail(function (xhr) {
          $('#introspect-acr').text(`introspection failed: ${xhr.status}`);
        });
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

    function authenticate(endpoint, params = {}) {
      // propagate or override query parameters to the authorization request.
      // This is used by the functional tests to, e.g., override
      // the client_id or propagate an email.

      const currentParams = new URLSearchParams(window.location.search);
      Object.keys(params).forEach((key) => {
        currentParams.set(key, params[key]);
      });

      if (flowData) {
        currentParams.set('flow_id', flowData.flowId);
        currentParams.set('flow_begin_time', flowData.flowBeginTime);
        currentParams.set('device_id', flowData.deviceId);
      }

      window.location.href = `/api/${endpoint}?${currentParams.toString()}`;
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

    $('button.profile-aal2').click(function (ev) {
      authenticate('profile_aal2');
    });

    $('button.third-party').click(function (ev) {
      authenticate('best_choice', {
        forceExperiment: 'thirdPartyAuth',
        forceExperimentGroup: 'google',
        deeplink: 'googleLogin',
      });
    });

    $('button.scope-keys').click(function (ev) {
      authenticate('best_choice', {
        keys_jwk:
          'eyJrdHkiOiJFQyIsImtpZCI6Im9DNGFudFBBSFZRX1pmQ09RRUYycTRaQlZYblVNZ2xISGpVRzdtSjZHOEEiLCJjcnYiOi' +
          'JQLTI1NiIsIngiOiJDeUpUSjVwbUNZb2lQQnVWOTk1UjNvNTFLZVBMaEg1Y3JaQlkwbXNxTDk0IiwieSI6IkJCWDhfcFVZeHpTaldsdX' +
          'U5MFdPTVZwamIzTlpVRDAyN0xwcC04RW9vckEifQ',
        scope: 'profile openid https://identity.mozilla.com/apps/123done',
      });
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
      authenticate('prompt_none');
    });

    $('button.prompt-login').click(function (ev) {
      authenticate('prompt_login');
    });

    // Seeded from `?max_age=` when the page URL carries one, so that override still
    // reaches /api/step_up — the click handler below sends whatever is in the box.
    // Otherwise from config, so the box shows the value the route would use anyway.
    const urlMaxAge = new URLSearchParams(window.location.search).get(
      'max_age'
    );
    $('#step-up-max-age').val(
      urlMaxAge === null ? loggedInState.step_up_max_age : urlMaxAge
    );

    $('button.step-up-auth').click(function (ev) {
      // An empty or non-integer box means "use the route default". Forwarding it raw
      // would send `max_age=`, which fails authorization-parameter validation and
      // drops the tester on an error page.
      const raw = $('#step-up-max-age').val();
      const maxAge = Number(raw);
      const valid = raw !== '' && Number.isInteger(maxAge) && maxAge >= 0;
      authenticate('step_up', valid ? { max_age: maxAge } : {});
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
