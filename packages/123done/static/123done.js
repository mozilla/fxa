// enable experimental API features
$(document).ready(function() {
  var loggedInEmail = null;

  if (!navigator.id.request) {
    navigator.id.request = navigator.id.experimental.request;
    navigator.id.watch = navigator.id.experimental.watch;
  }

  var todo = $('#todolist'),
  form = $('#todo form'),
  field = $("#newitem");

  var lastSync = localStorage.lastSync ? parseInt(localStorage.lastSync, 10) : 0;

  function udpateLastSync() {
    var ls = new Date().getTime().toString();
    localStorage.lastSync = lastSync = ls;
  }

  function setSyncStatus(status) {
    $('#dataState').text(status);
  }

  // upon form submission to add a new element, add it to the list
  form.on('submit', function(e) {
    e.preventDefault();
    // create a new element, set its value, and append it
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

  // state mangement:
  // * when you are not signed in, we use local storage
  // * when you sign in with added todo items, we merge them with your items on the server
  // * when you sign out, we leave your todo items local
  // * when you change items and you're signed in, we blast those items to the server

  // store current todolist in localstorage
  function storestate() {
    localStorage.todolist = todo.html();
    setSyncStatus('out of date');
    if (loggedInEmail) {
      setSyncStatus('syncing');

      // let's extract the state from the dom
      var l = [ ];
      $("#todolist > li").each(function(e) {
        var self = $(this);
        l.push({
          v: self.text(),
          done: self.hasClass('done')
        });
      });
      
      // now store it to the server
      $.ajax({
        type: 'POST',
        url: '/api/todos/save',
        data: JSON.stringify(l),
        contentType: 'application/json',
        success: function() {
          setSyncStatus('saved');
          udpateLastSync();
        },
        error: function() {
          setSyncStatus('out of date');
        }
      });
    }
  };

  function updateDomWithArray(a) {
    for (var i = 0; i < a.length; i++) {
      var li = $("<li/>").text(a[i].v);
      if (a[i].done) li.addClass('done');
      todo.append(li);
    }
  }
  
  // retrieve todolist from localstorage
  function retrievestate() {
    if (loggedInEmail) {
      setSyncStatus('syncing');
      $.get('/api/todos/get', function(data) {
        data = JSON.parse(data);
        updateDomWithArray(data);
        setSyncStatus('saved');
      });
    } else if (localStorage.todolist) {
      setSyncStatus('out of date');
      todo.html(localStorage.todolist);
    }
  };

  // merge local state with the server, this is a poor man's sync
  function mergestate() {
    // this is only meaningful when we're connected
    if (!loggedInEmail) return;

    setSyncStatus('syncing');

    var l = [ ];

    // first let's get the list of todo items from the server
    $.get('/api/todos/get', function(data) {
      data = JSON.parse(data);
      for (var i = 0; i < data.length; i++) l.push(data[i]);

      // now let's that list with local items added since the last sync
      $("#todolist > li").each(function(e) {
        var self = $(this);
        var when = self.attr('when') || 0;
        if (when <= lastSync) return;
        l.push({
          v: self.text(),
          done: self.hasClass('done')
        });
      });

      // clear items from the dom
      $("#todolist > li").remove();

      // update the dom with our new merged set
      updateDomWithArray(l)

      // and store that set of items to the server
      storestate();
    });
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
    
    // verify an assertion upon login
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
          mergestate();
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
        storestate();

        // upon logout, make an api request to tear the user's session down
        $.post('/api/logout');
      },
      // onready will be called as soon as persona has loaded, at this
      // point we can display our login buttons.
      onready: function() {
        updateUI(loggedInEmail);
        loginDisplay.css('display', 'block');

        // display current saved state
        retrievestate();
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
