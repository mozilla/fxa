// enable experimental API features
$(document).ready(function() {
  if (!navigator.id.request) {
    navigator.id.request = navigator.id.experimental.request;
    navigator.id.watch = navigator.id.experimental.watch;
  }

  var todo = $('#todolist'),
      form = $('#todo form'),
     field = $("#newitem");

  // display current saved state
  retrievestate();

  // upon form submission to add a new element, add it to the list
  form.on('submit', function(e) {
    e.preventDefault();
    // create a new element, set a 'when' attribute which describes when the
    // element was added (used for server sync), and set its value
    todo.append($('<li>').attr('when', new Date().getTime()).text(field.val()));
    // clear and refocus the input field
    field.val('').focus();
    storestate();
  });

  // when a todolist item is clicked on, it is marked done.  if it was already
  // done, it's removed.
  todo.click(function(ev) {
    var t = $(ev.target);
    if (t.is('li')) {
      if (t.hasClass('done')) {
        t.remove(t);
      } else {
        t.addClass('done');
      }
      storestate();
    };
    ev.preventDefault();
  });

  // store current todolist in localstorage
  function storestate() {
    localStorage.todolist = todo.html();
  };

  // retrieve todolist from localstorage
  function retrievestate() {
    if (localStorage.todolist) {
      todo.html(localStorage.todolist);
    }
  };


  // verify the assertion on the server, which will use the
  // verification service provided by mozilla
  // see the '/verify' handler inside server.js for details
  function verifyAssertion(assertion, success, failure)
  {
    $.post('/verify', {
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

  // verify an assertion upon login
  navigator.id.watch({
    onlogin: function(assertion) {
      verifyAssertion(assertion, function(r) {
        $("#loggedin span").text(r.email);
        loggedOut.css('display', 'none');
        loggedIn.css('display', 'block');
      }, function(err) {
        alert("failed to verify assertion: " + JSON.stringify(err));
        loggedOut.css('display', 'block');
        loggedIn.css('display', 'none');
      });
    },
    onlogout: function() {
      loggedOut.css('display', 'block');
      loggedIn.css('display', 'none');
    },
    onready: function() {
      loginDisplay.css('display', 'block');
    }
  });

  // upon click of signin button call navigator.id.request()
  $('button').click(function() {
    navigator.id.request();
  });

  // upon click of logout link navigator.id.logout()
  $("#loggedin a").click(function() {
    navigator.id.logout()
  });
});
