var Client = gherkin.Client;
var errorCodes = gherkin.errorCodes;

var serverUrl = fxaUrl || location.origin;

var currentlyShowing = null;

var state = {};
var setupFunctions = {};
var sessionReady = false;

state.device = navigator.userAgent.match('Mobile') ? 'mobile' :
               navigator.userAgent.match('Tablet') ? 'tablet' :
               'desktop';

state.os = navigator.userAgent.match('Mac') ? 'mac' :
           navigator.userAgent.match('Windows') ? 'win' :
           navigator.userAgent.match('Android') ? 'android' :
          'linux';

state.pageToLoad = page;
state.initialLoad = true;

function getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split('&');
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        if (decodeURIComponent(pair[0]) == variable) {
            return decodeURIComponent(pair[1]);
        }
    }
    return null;
}

state.maor_native = (getQueryVariable('maor_native') !== null);


if ((state.device === 'mobile'
    || state.device === 'tablet')
    && window.location.toString().indexOf('/flow') !== -1) {
  window.location = window.location.toString().replace('flow', 'mobile');
}

// each device has a unique id
state.deviceId = localStorage.getItem('deviceId');
if (! state.deviceId) {
  state.deviceId = guid();
  localStorage.setItem("deviceId", guid());
}


function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
               .toString(16)
               .substring(1);
  }

  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
         s4() + '-' + s4() + s4() + s4();
}

var errors = {
  invalid_password: 'Password must be at least 8 characters',
  password_mismatch: 'These passwords don\'t match',
  enter_password: 'Please enter a password',
  enter_email: 'Please enter an email',
  repeat_password: 'Repeat password here',
  missing_email: 'Enter email here',
  invalid_email: 'Please use a valid email address',
  incorrect_password: 'Incorrect password. Please try again.',
  no_account: 'Try another email or <a href="#" class="create">Create an account</a>',
  incorrect_code: 'The code you entered is incorrect',
  expired_code: 'The code you entered has expired, <a href="#" class="resend">resend email</a>',
  unverified: 'You need to verify this email first. <a href="#" class="resend">Click here</a> to resend the verification link.',
  too_many: 'You\'ve entered the incorrect code too many times.',
  exists: 'There is an existing account for this email.<br/>Re-enter email or Sign In.'
};

errors[errorCodes.ACCOUNT_EXISTS] = 'There is an existing account for this email.<br/>Re-enter email or Sign In.';
errors[errorCodes.UNKNOWN_ACCOUNT] = 'Try another email or <a href="#" class="create">Create an account</a>';
errors[errorCodes.INCORRECT_PASSWORD] = 'Incorrect password. Please try again.';
errors[errorCodes.UNVERIFIED_ACCOUNT] = 'You need to verify this email first. <a href="#" class="resend">Click here</a> to resend the verification link.';
errors[errorCodes.INVALID_CODE] = 'The code you entered is incorrect';

function enterError(selector, message) {
  console.log('error!!', selector, message, errors[message]);
  $(selector).addClass('error');
  $(selector + ' .error').html(errors[message]);
}

function leaveError() {
  $('div.error, input.error, x-tabpanel.error').removeClass('error').removeClass('oops').removeClass('ok');
  $('p.error').html('');
}

/*

Account

POST /account/create
GET /account/devices (:lock: sessionToken)
GET /account/keys (:lock: keyFetchToken) (verf-required)
POST /account/reset (:lock: accountResetToken)
POST /account/destroy (:lock: authToken)
Authentication

POST /auth/start
POST /auth/finish
Session

POST /session/create (:lock: authToken)
POST /session/destroy (:lock: sessionToken)
Recovery Email

GET /recovery_email/status (:lock: sessionToken)
POST /recovery_email/resend_code (:lock: sessionToken)
POST /recovery_email/verify_code

*/

function send(verb, body) {
  if (!body) body = {};
  body.deviceId = state.deviceId;

  console.log('sending', verb, body);

  var d = $.Deferred();
  $.ajax({
    type: "POST",
    url: verbMap[verb],
    // what we send:
    contentType: "application/json",
    data: JSON.stringify(body),
    // what we expect:
    dataType: "json",
    complete: function (j) { d.resolve(j.responseJSON); }
  });
  return d;
}

function generatePassword() {
  return "correct-horse-battery-staple";
}

function enterMeansClick(inputSelector, buttonSelector) {
  $(inputSelector).on("keyup", function(e) {
    if (e.keyCode == 13)
      $(buttonSelector).click();
    return false;
  });
}

function deleteAccount(name) {
  console.log('deleting', name);

  send('delete', {email: name}).then(refreshAccounts);
}

function refreshAccounts() {
  console.log('refreshing accounts');

  send("accounts").then(function(accounts) {
    state.accounts = accounts;
    console.log("accounts", accounts);
    $("#all-accounts").empty();
    var verifyLink;
    for (var name in accounts) {
      verifyLink = accounts[name].token ?
          (location.protocol + '//' + location.host +
          '/confirm_email?email=' + name +
          '&token=' + accounts[name].token
          ) : '';
      // never do this in real code
      var s = ("<li>email: <b>"+name+"</b> / password: <b>"+
           accounts[name].password+"</b>" +
           " (<a href=\"javascript: deleteAccount('" + name + "');\">delete</a>)" +
           (verifyLink ? ' (<a href="'+verifyLink+'">verify link</a>)' : '') +
           (accounts[name].reset_code ? ' (reset: ' + accounts[name].reset_code + ')' : '') +
           (accounts[name].confirm_code ? ' (confirm: ' + accounts[name].confirm_code + ')' : '') +
           "</li>");
      $("#all-accounts").append($(s));
    };
  });
}

function switchTo(which) {
  if (currentlyShowing === which) return;

  console.log('switching to ', which);

  function done() {
    var notes = $("#templates .notes-"+which);
    if (notes.length) {
      $("#notes").empty().append(notes.clone());
    }
    //refreshAccounts();
    var focus = $("#dialog .focus");
    if (focus.length == 1) {
      focus.focus();
    }
    currentlyShowing = which;
    console.log(which);
    window.scrollTo(0, 0);
    var f = setupFunctions[which];
    if (f)
      f();
  }
  function add() {
    $("#dialog").empty();
    console.log("showing", which);
    var entry = $("#templates ."+which).clone();
    $("#dialog").append(entry).fadeIn("fast", done);
  }
  $("#sidechannel-container").hide().fadeOut("fast");
  $("#dialog").fadeOut("fast", add);
}

function showSidechannel(which) {
  var container = $("#sidechannel-container");
  container.empty();
  var template = $("#templates .side-"+which).clone();
  container.append(template);
  container.fadeIn("slow");
  return template;
}

function toggleAdmin() {
  $("#notes-container").toggle();
}

function isBusy() {
  var wrap = $("#wrapper, #wrap");
  if( wrap.hasClass("busy") ) return true;
  else return false;
}

function makeBusy() {
  $("#wrapper , #wrap").addClass('busy');
  $('input[type="submit"]').attr('disabled','true');
  $(".spinner").show();
}

function makeNotBusy() {
  $("#wrapper, #wrap").removeClass('busy');
  $('input[type="submit"]').removeAttr('disabled');
  window.scrollTo(0,0);
  $(".spinner").hide();
}

function offsetToError() {
  var yOffset = 0;

  try {
    if($("#wrapper p.error").html() != 0) {
      yOffset = $("#wrapper p.error").offset().top;
    } else {
      yOffset = $("#wrapper input.oops").offset().top;
    }
    console.log("Y OFFSET IS " + yOffset);
    window.scrollTo(0,yOffset);
  } catch (e) {
  }
}

function receiveMessage(event) {
  var type = event.data.type;
  var result = event.data.content;
  switch (event.data.type) {
    case "message":
      console.log("Received message from browser: ", result);
      sentEvents[result.status]--;

      if (result.status === 'session_status') {
        // if we get session data back and the user wasn't previously signed in
        // we'll transition to a signed in user state
        if (result.data && !state.signedIn) {
          state.email = result.data.email;
          state.signedIn = true;
          console.log('signed in!', result.data);
          switchTo("signed-in-placeholder");
        }
        // else, if the user has been signed in and signs out, we'll transition to
        // the sign in screen
        else if (!result.data) {
          console.log('signed out!');
          state.signedIn = false;
          delete state.email;
          if (state.pageToLoad) {
            followPage();
          } else {
            switchTo('t1-create-signin');
          }
        }
      }
      break;
  }
}

function followPage() {
  switchTo(state.pageToLoad);
  delete state.pageToLoad;
}

var sentEvents = {};
var MAX_TRIES = 3;
var retries = {};

function sendToBrowser(command, data) {
  console.log('sending command to browser', command, data);
  var event = new CustomEvent("FirefoxAccountsCommand", {
    detail: {
      command: command,
      data: data,
      bubbles: true
    }
  });
  try {
    window.dispatchEvent(event);
    var count = sentEvents[command] = sentEvents[command] ? sentEvents[command] + 1 : 1;
    if (!(command in retries)) retries[command] = 0;
    if (retries[command] < MAX_TRIES) {
      retries[command]++;
      // try again if the browser doesn't respond within a second
      setTimeout(function () {
        if (sentEvents[command] === count) {
          console.log('retrying command: ', command, data);
          sentEvents[command]--;
          sendToBrowser(command, data);
        }
      }, 1000);
    }
  } catch(e) {
    console.log(e);
  }
}

$(function() {
  window.addEventListener("message", receiveMessage, false);

  if (page) {
    switchTo(page);
  //} else if (user && verified) {
    //switchTo("signed-in-placeholder");
  } else {
    switchTo("t1-create-signin");
  }

});

// konami code!
Mousetrap.bind('up up down down left right left right b a enter', toggleAdmin);
Mousetrap.bind('mod+e', toggleAdmin);
