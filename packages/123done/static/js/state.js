/*
 * This javascript file implements functions that store state for 123done.
 * It exposes three functions:
 *
 *   State.save() - saves todolist to local storage and to the server
 *                    if the user is logged in.
 *   State.load() - loads todolist items from local storage or the server
 *                    if the user is logged in.
 *   State.merge() - merges local todolist items with the server, and saves
 *                     this back to the server.
 *
 * To determine whether the user is authenticated, code in this file uses
 * the global variable window.loggedInEmail.
 */

// enable experimental API features
(function() {
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
    State.save();
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
      State.save();
    };
    ev.preventDefault();
  });

  // state mangement:
  // * when you are not signed in, we use local storage
  // * when you sign in with added todo items, we merge them with your items on the server
  // * when you sign out, we leave your todo items local
  // * when you change items and you're signed in, we blast those items to the server

  function savestate() {
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
  function loadstate() {
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
      State.save();
    });
  }

  window.State = {
    save: savestate,
    load: loadstate,
    merge: mergestate
  };
})();
