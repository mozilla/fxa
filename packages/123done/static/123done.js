(function(){

  var todo = document.querySelector( '#todolist' ),
      form = document.querySelector( 'form' ),
      field = document.querySelector( '#newitem' );
    
  form.addEventListener( 'submit', function( ev ) {
    todo.innerHTML += '<li>' + field.value + '</li>';
    field.value = '';
    field.focus();
    storestate();
    ev.preventDefault();
  }, false);

  todo.addEventListener( 'click', function( ev ) {
    var t = ev.target;
    if ( t.tagName === 'LI' ) {
      if ( t.classList.contains( 'done' ) ) {
        t.parentNode.removeChild( t );
      } else {  
        t.classList.add( 'done' );
      }
      storestate();
    };
    ev.preventDefault();
  }, false);

  document.addEventListener( 'DOMContentLoaded', retrievestate, false );
  
  function storestate() {
    localStorage.todolist = todo.innerHTML;
  };

  function retrievestate() {
    if ( localStorage.todolist ) {
      todo.innerHTML = localStorage.todolist;
    }
  };

})();

function verifyAssertion(assertion, success, failure)
{
  var request = new XMLHttpRequest();
  var parameters = 'assertion=' + assertion;
  request.open('POST', '/verify');
  request.setRequestHeader('Content-Type',
                           'application/x-www-form-urlencoded');
  request.send(encodeURI(parameters));

  request.onreadystatechange = function() {
    if (request.readyState == 4){
      if (request.status && (/200|304/).test(request.status)) {
        response = JSON.parse(request.responseText);
        if(response.status === 'okay') {
          success(response);
        } else {
          failure(response);
        }
      } else{
        failure(request);
      }
    }
  };
}
(function() {
  var loggedIn = document.querySelector("li.browserid#loggedin");
  var loggedOut = document.querySelector("li.browserid#loggedout");

  // verify an assertion upon login
  navigator.id.addEventListener('login', function(event) {
    verifyAssertion(event.assertion, function(r) {
      var e = document.querySelector("#loggedin span");
      e.innerHTML = r.email;
      loggedOut.style.display = 'none';
      loggedIn.style.display = 'block';
    }, function(err) {
      alert("failed to verify assertion: " + JSON.stringify(err));
      loggedOut.style.display = 'block';
      loggedIn.style.display = 'none';
    });
  });

  // display login button on logout
  navigator.id.addEventListener('logout', function(event) {
    loggedOut.style.display = 'block';
    loggedIn.style.display = 'none';
  });

  // upon click of signin button call navigator.id.request()
  var e = document.querySelector(".browserid#loggedout button");
  e.onclick = function() { navigator.id.request() };

  // upon click of logout link navigator.id.logout()
  var e = document.querySelector(".browserid#loggedin a");
  e.onclick = function() {
    navigator.id.logout()
  };
})();
