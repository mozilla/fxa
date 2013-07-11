/*
 * This JavaScript file implements everything authentication
 * related in the 123done demo.  This includes interacting
 * with the Persona API, the 123done server, and updating
 * the UI to reflect sign-in state.
 */

$(document).ready(function() {
  window.loggedInEmail = null;

  var loginAssertion = null;

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
        if (data.status !== 'okay') throw data.reason;
        success(data);
      } catch(e) {
        failure(e ? e.toString() : e);
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
      $("ul.loginarea li").css('display', 'none');
      if (email) {
        $("#loggedin span").text(email);
        $("#loggedin").css('display', 'block');
      } else {
        $('#loggedin span').text('');
        $("#loggedout").css('display', 'block');
      }
      $("button").removeAttr('disabled').css('opacity', '1');
    }

    // register callbacks with the persona API to be invoked when
    // the user logs in or out.
    navigator.id.watch({
      // pass the currently logged in email address from the server's
      // session.  This will cause onlogin/onlogout to not be invoked
      // when we're up to date.
      loggedInUser: loggedInEmail,
      // onlogin will be called any time the user logs in
      onlogin: function(assertion) {
        loginAssertion = assertion;

        // display spinner
        $("ul.loginarea li").css('display', 'none');
        $(".loginarea .loading").css('display', 'block');

        verifyAssertion(assertion, function(r) {
          loggedInEmail = r.email;
          loginAssertion = null;
          updateUI(loggedInEmail);
          State.merge();
        }, function(err) {
          alert("failed to verify assertion: " + err);
          loggedInEmail = null;
          loginAssertion = null;
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

        // don't display the warning icon at logout time, but wait until the user
        // makes a change to her tasks
        $("#dataState > div").css('display', 'none');

        // upon logout, make an api request to tear the user's session down
        $.post('/api/logout');

      },
      // onready will be called as soon as persona has loaded, at this
      // point we can display our login buttons.
      onready: function() {
        // Only update the UI if no assertion is being verified
        if (null === loginAssertion) {
          updateUI(loggedInEmail);
        }
        
        // display current saved state
        State.load();
      }
    });

    // upon click of signin button call navigator.id.request()
    $('button').click(function(ev) {
      ev.preventDefault();

      // disable the sign-in button when a user clicks it, it will be
      // re-enabled when the assertion passed into onlogin is verified,
      // or if the user cancels the dialog.
      $("button").attr('disabled', 'disabled').css('opacity', '0.5');
      navigator.id.request({
        termsOfService: '/tos.txt',
        privacyPolicy: '/pp.txt',
        siteName: "123done",
        backgroundColor: "#f5f2e4",
// XXX: we need SSL to display a siteLogo in dialog.  Must get certificates.
//        siteLogo: "/img/logo100.png",
        oncancel: function() {
          // when the user cancels the persona dialog, let's re-enable the
          // sign-in button
          $("button").removeAttr('disabled').css('opacity', '1');
        }
      });
    });

    // upon click of logout link navigator.id.logout()
    $("#loggedin a").click(function(ev) {
      ev.preventDefault();
      navigator.id.logout()
    });
  });
});
