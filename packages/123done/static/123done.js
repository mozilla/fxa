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

navigator.id.getData = function(assertion, validationservice, 
                                success, failure) {
  request = new XMLHttpRequest();
  var parameters = 'assert=' + assertion;
  request.open('POST', validationservice);
  request.setRequestHeader('If-Modified-Since',
                           'Wed, 05 Apr 2006 00:00:00 GMT');
  request.setRequestHeader('Content-type',
                           'application/x-www-form-urlencoded');
  request.setRequestHeader('Content-length', parameters.length);
  request.setRequestHeader('Connection', 'close');
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
navigator.id.loginButton = function(o) {    
  var elm = document.querySelector(o.element),
            img = o.imageURL || 'https://browserid.org/i/sign_in_green.png',
            alt = o.altText || 'Log in with browserID';
  if(elm) {
    var b = document.createElement('button');
    b.innerHTML = '<img src="' + img + '" alt="'+ alt + '">';
    b.onclick = function() {
      navigator.id.getVerifiedEmail(function(assertion) {
       if (assertion) {
         navigator.id.getData(assertion, o.service, o.success, o.failure);
       } else {
         failure('I still don\'t know you...');
       }
    });
  };
   elm.appendChild(b);
 }
}
navigator.id.loginButton({
 element: '#browserid',
 service: 'verify.php', 
 success: function(response) {
   document.querySelector('#browserid').innerHTML = 'Hi ' +
   response.email;
 },
 failure: function(response) {
   alert('Couldn\'t log you in. Sad panda now!');
 }
});
