/*
 * This JavaScript file implements everything authentication
 * related in the 123done demo.  This includes interacting
 * with the Persona API, the 123done server, and updating
 * the UI to reflect sign-in state.
 */

$(document).ready(function() {
  window.loggedInEmail = null;

  // enable experimental API features
  if (!navigator.id.request) {
    navigator.id.request = navigator.id.experimental.request;
    navigator.id.watch = navigator.id.experimental.watch;
  }

  // verify the assertion on the server, which will use the
  // verification service provided by mozilla
  // see the '/verify' handler inside server.js for details
  function verifyAssertion(assertion, success, failure)
  {
    $.post('/api/verify', {
      assertion: assertion
    }, function(data, status, xhr) {
      try {
        if (status !== 'success') throw data;
        data = JSON.parse(data);
        success(data);
      } catch(e) {
        failure(e.toString());
      }
    });
  }

  var loggedIn = $("#loggedin");
  var loggedOut = $("#loggedout");
  var loginDisplay = $("ul.loginarea");

  // now check with the server to get our current login state
  $.get('/api/auth_status', function(data) {
    loggedInEmail = JSON.parse(data).logged_in_email;

    function updateUI(email) {
      if (email) {
        $("#loggedin span").text(email);
        loggedOut.css('display', 'none');
        loggedIn.css('display', 'block');
      } else {
        loggedOut.css('display', 'block');
        loggedIn.css('display', 'none');
      }
      $("button").removeAttr('disabled').css('opacity', '1');
    }
    
    // register callbacks with the persona API to be invoked when
    // the user logs in or out.
    navigator.id.watch({
      // pass the currently logged in email address from the server's
      // session.  This will cause onlogin/onlogout to not be invoked
      // when we're up to date.
      loggedInEmail: loggedInEmail,
      // onlogin will be called any time the user logs in
      onlogin: function(assertion) {
        verifyAssertion(assertion, function(r) {
          loggedInEmail = r.email;
          updateUI(loggedInEmail);
          State.merge();
        }, function(err) {
          alert("failed to verify assertion: " + JSON.stringify(err));
          loggedInEmail = null;
          updateUI(loggedInEmail);
        });
      },
      // onlogout will be called any time the user logs out
      onlogout: function() {
        loggedInEmail = null;
        updateUI(loggedInEmail);

        // clear items from the dom at logout
        $("#todolist > li").remove();
        State.save();

        // upon logout, make an api request to tear the user's session down
        $.post('/api/logout');
      },
      // onready will be called as soon as persona has loaded, at this
      // point we can display our login buttons.
      onready: function() {
        updateUI(loggedInEmail);
        loginDisplay.css('display', 'block');

        // display current saved state
        State.load();
      }
    });

    // upon click of signin button call navigator.id.request()
    $('button').click(function() {

      // disable the sign-in button when a user clicks it, it will be
      // re-enabled when the assertion passed into onlogin is verified,
      // or if the user cancels the dialog.
      $("button").attr('disabled', 'disabled').css('opacity', '0.5');
      navigator.id.request({
        tosURL: '/tos.txt',
        privacyURL: '/pp.txt',
        oncancel: function() {
          // when the user cancels the persona dialog, let's re-enable the
          // sign-in button
          $("button").removeAttr('disabled').css('opacity', '1');
        }
      });
    });

    // upon click of logout link navigator.id.logout()
    $("#loggedin a").click(function() {
      navigator.id.logout()
    });
  });
});
