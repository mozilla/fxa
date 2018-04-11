/*
* This JavaScript file implements everything authentication
* related in the 123done demo. This includes interacting
* with the Persona API, the 123done server, and updating
* the UI to reflect sign-in state.
*/

$(document).ready(function() {
  window.loggedInEmail = null;

  // now check with the server to get our current login state
  $.get('/api/auth_status', function(data) {
    loggedInEmail = JSON.parse(data).email;

    function updateUI(email) {
      $("ul.loginarea li").css('display', 'none');
      if (email) {
        console.log(email);
        $('#loggedin span').text(email);
        $('#loggedin').css('display', 'block');
        $("#splash").hide();
        $("#lists").slideDown(500);
      } else {
        $('#loggedin span').text('');
        $('#loggedout').css('display', 'block');
        $("#splash").show();
        $("#lists").hide();

      }
      $("button").removeAttr('disabled').css('opacity', '1');
    }

    function updateListArea(email) {
      $("section.todo ul").css('display', 'none');
      $("section.todo form").css('display', 'none');
      if (email) {
        $('#addform').css('display', 'block');
        $('#todolist').css('display', 'block');
        $('#donelist').css('display', 'block');
      } else {
        $('#signinhere').css('display', 'block');
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

          $("#splash").show();
          $("#lists").hide();

          // clear items from the dom at logout
          $("#todolist > li").remove();
          State.save();

          // don't display the warning icon at logout time, but wait until the user
          // makes a change to her tasks
          $("#dataState > div").css('display', 'none');
        })
        .fail(function() {
          // this should never happen
          alert('Failed to logout');
        });
    };

    function authenticate (endpoint) {
      $.getJSON('/api/' + endpoint)
        .done(function (data) {
          var queryParams = {
            client_id: data.client_id,
            action: data.action,
            state: data.state,
            scope: 'profile',
          };
          window.location.href = data.oauth_uri + '/authorization' + objectToQueryString(queryParams);
        });
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

    // upon click of logout link navigator.id.logout()
    $("#logout").click(function(ev) {
      ev.preventDefault();
      logout();
    });

    updateUI(loggedInEmail);
    updateListArea(loggedInEmail);
    // display current saved state
    State.load();
    $('body').addClass('ready').addClass('ready-hash-' + window.location.hash.substr(1));
  });

  /**
 * Create a query parameter string from a key and value
 *
 * @method createQueryParam
 * @param {String} key
 * @param {Variant} value
 * @returns {String}
 * URL safe serialized query parameter
 */
function createQueryParam(key, value) {
  return encodeURIComponent(key) + '=' + encodeURIComponent(value);
}


/**
 * Create a query string out of an object.
 * @method objectToQueryString
 * @param {Object} obj
 * Object to create query string from
 * @returns {String}
 * URL safe query string
 */
function objectToQueryString(obj) {
  var queryParams = [];

  for (var key in obj) {
    queryParams.push(createQueryParam(key, obj[key]));
  }

  return '?' + queryParams.join('&');
}

});
