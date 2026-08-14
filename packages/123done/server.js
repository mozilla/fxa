const express = require('express');
const morgan = require('morgan');
const path = require('path');
const Redis = require('ioredis');

const oauth = require('./oauth');
const config = require('./config');
const version = require('./version');
const cookieSession = require('cookie-session');

const logger = morgan('short');

// create a connection to the redis datastore
let db = new Redis({
  password: process.env.REDIS_PASSWORD || '',
});

db.on('error', function () {
  // eslint-disable-line handle-callback-err
  db = null;
  console.log(
    "redis error!  the server won't actually store anything! " + //eslint-disable-line no-console
      ' this is just fine for local dev'
  );
});

const app = express();

app.use(logger, express.json());

app.get('/__version__', (_, res) =>
  res.type('application/json').send(JSON.stringify(version))
);

app.use(function (req, res, next) {
  if (/^\/api/.test(req.url)) {
    res.setHeader('Cache-Control', 'no-cache, max-age=0');

    return cookieSession({
      name: config.get('cookie_name'),
      secret: config.get('cookie_secret'),
      path: '/api',
      httpOnly: true,
    })(req, res, next);
  } else {
    return next();
  }
});

// add oauth endpoints. checkAuth is declared below and hoisted; /api/step_up needs
// it to enforce the signed-in session it re-authorizes.
oauth(app, db, checkAuth);

// a function to verify that the current user is authenticated
function checkAuth(req, res, next) {
  if (!req.session.email) {
    res.send('authentication required\n', 401);
  } else {
    next();
  }
}

// auth status reports who the currently logged in user is on this
// session
app.get('/api/auth_status', function (req, res) {
  console.log(req.session); //eslint-disable-line no-console

  res.send(
    JSON.stringify({
      email: req.session.email || null,
      subscriptions: req.session.subscriptions || [],
      amr: req.session.amr || null,
      acr: req.session.acr || '0',
      account_aal2: req.session.account_aal2 || false,
      keys_jwe: req.session.keys_jwe || null,
      // Authentication event from the id_token, in seconds since the epoch.
      auth_time: req.session.auth_time || null,
      // Default for the step-up max_age input, so the UI can't drift from config.
      step_up_max_age: config.get('step_up_max_age'),
    })
  );
});

// The resource-server half of RFC 9470: introspect our own access token and report
// the authentication level and event the authorization server sees. This is the
// check an RP would run before allowing a sensitive action, as opposed to trusting
// the id_token it received at redirect time.
//
// Called once per page load, never polled — /v1/introspect is rate-limited per IP.
app.get('/api/token_claims', checkAuth, async function (req, res) {
  const endpoint = req.session.introspection_endpoint;
  if (!endpoint || !req.session.token) {
    return res.status(409).json({ error: 'no access token on this session' });
  }

  let response, text;
  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ token: req.session.token }),
    });
    text = await response.text();
  } catch (err) {
    // Logged rather than returned: the message names the introspection host.
    console.log('token_claims', err); //eslint-disable-line no-console
    return res.status(502).json({ error: 'introspection request failed' });
  }

  // Check the status before parsing. A proxy or the rate-limiter can answer with
  // HTML, and parsing first would report that as a 502 and lose the real status.
  if (response.status >= 400) {
    return res.status(response.status).send(text);
  }

  let body;
  try {
    body = JSON.parse(text);
  } catch (err) {
    return res
      .status(502)
      .json({ error: 'introspection response was not JSON' });
  }

  res.json({
    active: body.active,
    acr: body.acr || null,
    // Seconds, while iat/exp below are milliseconds. Intentional upstream, for RP
    // back-compat — see lib/routes/oauth/introspect.js in fxa-auth-server.
    auth_time: body.auth_time || null,
    amr: body.amr || null,
    iat: body.iat || null,
    exp: body.exp || null,
  });
});

// logout clears the current authenticated user
app.post('/api/logout', checkAuth, function (req, res) {
  req.session = null;
  res.send(200);
});

// the 'todo/save' api saves a todo list
app.post('/api/todos/save', checkAuth, function (req, res) {
  if (db) {
    db.set(req.session.user, JSON.stringify(req.body));
  }
  res.send(200);
});

app.post('/api/webhook', function (req, res) {
  res.set('Content-Type', 'application/json');
  res.send(req.body);
});

// the 'todo/get' api gets the current version of the todo list
// from the server
app.get('/api/todos/get', checkAuth, function (req, res) {
  if (db) {
    db.get(req.session.user, function (err, reply) {
      if (err) {
        res.send(err.toString(), { 'Content-Type': 'text/plain' }, 500);
      } else {
        res.send(
          reply ? reply : '[]',
          { 'Content-Type': 'application/json' },
          200
        );
      }
    });
  } else {
    res.send(
      '[{"v": "Install redis locally for persistent storage, if I want to"}]',
      { 'Content-Type': 'application/json' },
      200
    );
  }
});

app.get(/^\/iframe(:?\/(?:index.html)?)?$/, function (req, res, next) {
  req.url = '/index.html';
  next();
});

app.use(express.static(path.join(__dirname, 'static')));

const port = config.get('port');
app.listen(port, '0.0.0.0');
console.log('123done started on port', port); //eslint-disable-line no-console
