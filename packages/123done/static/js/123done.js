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

  function isSubscribed() {
    return (
      window.loggedInSubscriptions &&
      window.loggedInSubscriptions.includes(PRO_PRODUCT)
    );
  }

  // now check with the server to get our current login state
  $.get('/api/auth_status', function(data) {
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
      $('button')
        .removeAttr('disabled')
        .css('opacity', '1');
      if (isSubscribed()) {
        $('#subscriptionStatus').css('display', 'block');
      } else {
        $('#subscriptionStatus').css('display', 'none');
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
      if (isSubscribed()) {
        $('#subscriptionCTA').css('display', 'none');
      } else {
        $('#subscriptionCTA').css('display', 'block');
      }
    }

    var logout = function() {
      // upon logout, make an api request to tear the user's session down
      // then change the UI
      $.post('/api/logout')
        .always(function() {
          loggedInEmail = null;
          updateUI(loggedInEmail);
          updateListArea(loggedInEmail);

          $('#splash').show();
          $('#lists').hide();

          // clear items from the dom at logout
          $('#todolist > li').remove();
          State.save();

          // don't display the warning icon at logout time, but wait until the user
          // makes a change to her tasks
          $('#dataState > div').css('display', 'none');
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
    $('#logout').click(function(ev) {
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
