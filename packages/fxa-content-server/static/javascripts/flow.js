function passChecks() {
  var error = false;
  var passField = $("#dialog form input[name='password']");
  var confirmField = $("#dialog form input.confirm_password");
  var password = passField.val();
  var passwordConfirm = confirmField.val();

  $("#dialog form input[name='password'], #dialog form input.confirm_password")
    .removeClass('oops')
    .removeClass('ok')
    .removeClass('mismatch')
    .removeClass('missing_confirm')
    .removeClass('missing')
    .removeClass('invalid');

  if (passwordConfirm.length && password !== passwordConfirm) {
    confirmField.addClass('oops').addClass('mismatch');
    error = true;
  }

  if (password.length && !validatePassword(password)) {
    passField.addClass('oops').addClass('invalid');
    error = true;
  }

  if (passwordConfirm.length && !validatePassword(passwordConfirm)) {
    confirmField.addClass('oops').addClass('invalid');
    error = true;
  }

  if (error) {
    offsetToError();
  }

  return !error;
}

setupFunctions["t1-create-signin"] = function() {
  $('#dialog form input.email').on('blur', function(e) {
    var email = this.value;
    $(this).removeClass('oops').removeClass('invalid').removeClass('missing');
    if (! validateEmail(email)) {

       $(this).addClass('oops').addClass('invalid');
       offsetToError();
       return;
    }
    $(this).addClass('ok');
  });

  $('#dialog form input.password').on('blur', function(e) {
    passChecks();
  });

  $('#dialog form input.confirm_password').on('blur', function(e) {
    passChecks();
  });

  $('#dialog form.login').on("submit", function(e) {
    leaveError();
    if(isBusy()) return false;
    e.preventDefault();
    var email = state.email = $("#dialog form.login input.email").val();
    var password = state.password = $("#dialog form.login input[name='password']").val();
    var error = false;

    if (! email.length) {
      $(this.email)
        .addClass('error')
        .addClass('oops')
        .addClass('missing');

      error = true;
    }

    if (! password.length) {
      $(this.password)
        .addClass('error')
        .addClass('oops')
        .addClass('missing');

      error = true;
    }

    if (error) {
      offsetToError();
      return false;
    }

    makeBusy();

    var client,
        payload;

    Client.login(serverUrl, email, password)
      .then(function (x) {
        client = state.client = x;
        payload = {
            sessionToken: client.sessionToken,
            email: email
        };
        if (state.maor_native) {
          // this uses more native natives for doing key fetch and assertion generation
          // key fetch will happen in native, so send it over
          payload.keyFetchToken = client.keyFetchToken;
          payload.unwrapBKey = client.unwrapBKey;
          console.log('sendToBrowser maor native payload: ', payload);
          return;
        }
        else {
          return client.keys()
            .then(function () {
              new AssertionService(client).getAssertion(function(err, assertion) {
                var fullAssertion = jwcrypto.cert.unbundle(assertion);
                var cert = jwcrypto.extractComponents(fullAssertion.certs[0]);
                payload.uid = cert.payload.principal.email;
                payload.assertion = assertion;
                payload.kB = client.kB;
                payload.kA = client.kA;
                console.log('sendToBrowser payload: ', payload);
                return;
              });
          });
        }
      })
      .done(function() {
        sendToBrowser('login', payload);
        switchTo("t2-signed-in-page");
        leaveError();
        makeNotBusy();
      }, function (err) {
        console.error('Error?', err);
        enterError('.login-panel', err.errno);
        makeNotBusy();
      });
    return false;
  });

  $('#dialog form.create').on("submit", function(e) {
    e.preventDefault();
    leaveError();
    var email = state.email = $("#dialog form.create input.email").val();
    var password = state.password = $("#dialog form.create input[name='password']").val();
    var passwordConfirm = $("#dialog form.create input[name='password_confirm']").val();

    if(isBusy()) return false;
    var error = false;

    $("#dialog form input[name='password'], #dialog form input.confirm_password")
      .removeClass('oops')
      .removeClass('ok')
      .removeClass('mismatch')
      .removeClass('missing_confirm')
      .removeClass('missing')
      .removeClass('invalid');

    if (! email.length) {
      $(this.email)
        .addClass('error')
        .addClass('oops')
        .addClass('missing');
      error = true;
    }

    if (! password.length) {
      $(this.password)
        .addClass('error')
        .addClass('oops')
        .addClass('missing');
      error = true;
    }
    if (! passwordConfirm.length) {
      $(this.password_confirm)
        .addClass('error')
        .addClass('oops')
        .addClass('missing_confirm');
      error = true;
    }

    if (passwordConfirm.length && password !== passwordConfirm) {
      $(this.password_confirm).addClass('oops').addClass('mismatch');
      error = true;
    }

    if (password.length && !validatePassword(password)) {
      $(this.password).addClass('oops').addClass('invalid');
      error = true;
    }

    if (passwordConfirm.length && !validatePassword(passwordConfirm)) {
      $(this.password_confirm).addClass('oops').addClass('invalid');
      error = true;
    }

    if (error) {
      offsetToError();
      return false;
    }

    var creds = {
      email: state.email,
      password: state.password
    };

    makeBusy();

    var client = null;

    Client.create(serverUrl, email, password)
      .then(function (x) {
        client = state.client = x;
        return client.login();
      })
      .done(function () {
        if (state.maor_native) {
          // this uses more native natives for doing key fetch and assertion generation
          // key fetch will happen in native, so send it over
          var payload = {
            email: email,
            sessionToken: client.sessionToken,
            keyFetchToken: client.keyFetchToken,
            unwrapBKey: client.unwrapBKey
          };
          console.log('sendToBrowser maor native payload: ', payload);
          sendToBrowser('login', payload);
          switchTo("t2-signed-in-page"); // TODO: what do we switch to here?
          leaveError();
          makeNotBusy();
          return;
        }
        else {
          leaveError();
          makeNotBusy();
          switchTo("verify");
        }
      },
      function (err) {
        console.error('Error?', err);
        enterError('.create-panel', err.errno);
        makeNotBusy();
      });

    e.preventDefault();
    return false;
  });
};

setupFunctions["signed-in-placeholder"] = function() {
  console.log('state', state.email);

  $('#dialog .user').html(state.email);


  $("#dialog button.logout").on("click", function() {
    sendToBrowser('sign_out');
    switchTo("t1-create-signin");
    console.log('signing out!!');
  });
};

setupFunctions["t2-signed-in-page"] = function() {
  console.log('state', state.email);

  $('#dialog .user').html(state.email);

  $("#dialog a.prefs").on("click", function() {
    switchTo("preferences");
  });

  // show progress meter
  var progressMeter = $('#progress-meter')[0];
  progressMeter.min = 0;
  progressMeter.max = 100;
  var val = 0;

  function update(type, val) {
    $('#progress-message').html('Syncing your ' + type + '...');
  }

  // should take about 15 seconds on average
  var intv = setInterval(function () {
    progressMeter.value = val += 7 * Math.random();

    if (val >= 100) {
      $('#progress-message').html('Synced!');
      clearInterval(intv);
    } else if (val >= 80) {
      update('passwords', val);
    } else if (val >= 70) {
      update('tabs', val);
    } else if (val >= 40) {
      update('history', val);
    } else {
      update('bookmarks', val);
    }
  }, 600);

};

setupFunctions["verify"] = function() {
  $('#dialog .verify-email').html(state.email);

  console.log('state', state);
  var client = state.client;

  var intv = setInterval(function () {
    client.emailStatus()
    .then(function (r) {
      console.log('verify!!!', r);
      var email = r.email;
      if (r.verified) {
        console.log('getting keys');
        clearInterval(intv);

        client.keys()
        .done(function (keys) {
          new AssertionService(client).getAssertion(function(err, assertion) {
            var fullAssertion = jwcrypto.cert.unbundle(assertion);
            var cert = jwcrypto.extractComponents(fullAssertion.certs[0]);
            var payload = {
              assertion: assertion,
              kB: client.kB,
              kA: client.kA,
              sessionToken: client.sessionToken,
              email: email,
              uid: cert.payload.principal.email
            };
            console.log('sendToBrowser payload: ', payload);
            sendToBrowser('login', payload);
            switchTo('t2-signed-in-page');
          });
        });

      }
    });
  }, 1000);
};


function validateEmail(email) {
  if (!email.length) return true;
  if (email.length < 3) return false;
  if (email.indexOf('@') === -1) return false;
  return true;
}

setupFunctions["reset-password"] = function() {

  $('.cancel').click(function(e) {
    switchTo('t1-create-signin');
    $("x-tabbox")[0].setSelectedIndex(1);
  });

  $('#dialog form.reset').on('submit', function(e) {
    console.log('reset form!!!', e, this.email);
    var email = this.email.value;

    e.preventDefault();

    if (! email.length) {
      return enterError('.reset-password', 'enter_email');
    }

    if (! validateEmail(email)) {
      return enterError('.reset-password', 'invalid_email');
    }

    // send code email
    send('reset_code', { email: email })
    .then(function (r) {
      //leaveError();
      if (r.success) {
        // switch to confirm code page
        state.email = email;
        switchTo('confirm-reset-code');
      } else {
        enterError('.reset-password', r.message);
      }
    });

    return false;
  });
};

setupFunctions["confirm-reset-code"] = function() {
  $('#dialog .email').html(state.email);

  $('#dialog form.reset_code').on('submit', function(e) {
    var code = this.code.value;
    console.log('confirm reset form!!!', e);

    // send code email
    send('confirm_reset_code', {
      email: state.email,
      code: code
    })
    .then(function (r) {
      console.log('reset back!', r);
      if (r.success) {
        // switch to confirm code page
        switchTo('new-password');
      } else {
        enterError('.confirm-reset-code', r.message);
      }
    });

    e.preventDefault();
    return false;
  });
};

function validatePassword(pass) {
  if (pass.length && pass.length < 8) return false;
  return true;
}

setupFunctions["new-password"] = function() {

  $('#dialog form input.password').on('blur', function(e) {
    passChecks();
  });

  $('#dialog form input.confirm_password').on('blur', function(e) {
    passChecks();
  });

  $('#dialog form.new_password').on('submit', function(e) {
    e.preventDefault();
    leaveError();
    $("#dialog form input[name='password'], #dialog form input.confirm_password")
      .removeClass('oops')
      .removeClass('ok')
      .removeClass('mismatch')
      .removeClass('missing_confirm')
      .removeClass('missing')
      .removeClass('invalid');

    var error = false;

    var password = this.password.value;
    var passwordConfirm = this.confirm_password.value;

    if (! password.length) {
      $(this.password)
        .addClass('error')
        .addClass('oops')
        .addClass('missing');

      error = true;
    }

    if (! passwordConfirm.length) {
      $(this.confirm_password)
        .addClass('error')
        .addClass('oops')
        .addClass('missing_confirm');
      error = true;
    }

    if (passwordConfirm.length && password !== passwordConfirm) {
      $(this.confirm_password).addClass('oops').addClass('mismatch');
      error = true;
    }

    if (password.length && !validatePassword(password)) {
      $(this.password).addClass('oops').addClass('invalid');
      error = true;
    }

    if (passwordConfirm.length && !validatePassword(passwordConfirm)) {
      $(this.confirm_password).addClass('oops').addClass('invalid');
      error = true;
    }

    if (error) return false;

    // send code email
    send('new_password', {
      email: state.email,
      password: password,
      confirm_password: passwordConfirm
    })
    .then(function (r) {
      console.log('reset?', r);
      if (r.success) {
        // switch to confirm code page
        switchTo('reset-success');
      }
    });

    e.preventDefault();
    return false;
  });
};


setupFunctions["reset-success"] = function() {
  var account = state.accounts[state.email];

  var devices = Object.keys(account.devices);
  $('#dialog ul.devices').html('');
  if (devices.length) {
    devices.forEach(function(deviceId) {
      var device = account.devices[deviceId];
      $('#dialog ul.devices').append(
        $('<li>')
          .html(device.name.bold())
          .addClass(device.form)
          .addClass(device.syncing ? 'syncing' : 'notsyncing')
      );
    });
  } else {
  }

};


function showDevices() {
  var account = state.accounts[state.email];

  $('#dialog ul.devices').html('');
  Object.keys(account.devices).forEach(function(deviceId) {
    console.log('device??', deviceId);
    var device = account.devices[deviceId];
    if (!device) return;
    $('#dialog ul.devices').append(
      $('<li>')
        .html(device.name.bold())
        .addClass(device.form)
        .attr('data-did', deviceId)
        .addClass(device.syncing ? 'syncing' : 'notsyncing')
    );
  });
}

setupFunctions["preferences"] = function() {
  $('#dialog .email').html(state.email);

  if (state.accounts) {
    showDevices();
  } else {
    send('accounts', {})
    .then(function(r) {
      showDevices();
    });
  }

  leaveError();


  $("button.logout").on("click", function() {
    var alert = document.createElement('x-alert');
    alert.innerHTML =
      '<h3>Firefox Account</h3><p>Sign out will disconnect the browser your account.' +
      '<p><small>You can also:<br/>' +
      '<a href="#" class="clear-data">Clear local data</a> or ' +
      '<a href="#" class="delete-account">Delete account</a>';

    alert.setAttribute('fade-duration', 500);
    alert.setAttribute('secondary-text', 'Cancel');
    alert.setAttribute('primary-text', 'Sign Out');
    //alert.setAttribute('active', null);
    document.body.appendChild(alert);

    alert.addEventListener('hide', function(e) {
      if (e.buttonType === 'primary') {
        send('logout').then(function(r) {
          if (r.success) {
            state.email = null;
            switchTo('preferences-signed-out');
          }
        });
      }
    });
  });

};

setupFunctions["preferences-signed-out"] = function() {
  console.log('state', state.email);
};

$(function() {
  console.log("starting");
  state.email = user;

  console.log('state', state);

  //if (page) {
    //switchTo(page);
  ////} else if (user && verified) {
    ////switchTo("signed-in-placeholder");
  //} else {
    //switchTo("t1-create-signin");
  //}
  //

  sendToBrowser('session_status');

  //$("#notes-container").toggle();

  $("#dialog").on('click', 'a[data-page]', function(e) {
    var page = $(this).data('page');
    switchTo(page);
    e.preventDefault();
    return false;
  });

  $('#dialog').on('click', '.resend',
    function() {
      var el = $(this);
      send('reverify', {
        email: state.email
      }).then(function(r) {
        if (r.success) {
          el.html('Email sent!');
        } else {
        }
      });
    });

  $("#dialog").on("click", '.signin', function() {
    switchTo('t1-create-signin');
    console.log($("x-tabbox"));
    $("x-tabbox")[0].setSelectedIndex(1);
  });

  $("#dialog").on("click", 'a.create, button.create', function() {
    switchTo('t1-create-signin');
    $("x-tabbox")[0].setSelectedIndex(0);
  });

  $("input").attr('autocomplete', 'off');

});

