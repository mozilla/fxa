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

      // upon logout, make an api request to tear the user's session down
      $.post('/api/logout');
    };

    function authenticate (endpoint, flow) {
      if (window.location.href.indexOf('iframe') > -1) {
        $.getJSON('/api/' + endpoint)
          .done(function (data) {
            var relierClient = new FxaRelierClient(data.client_id, {
              oauthHost: data.oauth_uri,
              contentHost: data.content_uri
            });

            relierClient.auth[flow]({
              ui: 'lightbox',
              state: data.state,
              scope: data.scope,
              redirectUri: data.redirect_uri
            }).then(function (result) {
              document.location.href = result.redirect;
            }, function (err) {
              console.log('iframe auth err: %s', JSON.stringify(err));
            });
        });
      } else {
        $.getJSON('/api/' + endpoint)
          .done(function (data) {
            var relierClient = new FxaRelierClient(data.client_id, {
              oauthHost: data.oauth_uri,
              contentHost: data.content_uri
            });

            relierClient.auth[flow]({
              ui: 'redirect',
              state: data.state,
              scope: data.scope,
              redirectUri: data.redirect_uri
            });
        });
      }
    }

    $('button.signin').click(function(ev) {
      authenticate('login', 'signIn');
    });

    $('button.signup').click(function(ev) {
      authenticate('signup', 'signUp');
    });

    $('button.sign-choose').click(function(ev) {
      authenticate('best_choice', 'bestChoice');
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

  });
});
