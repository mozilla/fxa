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
  // Logged field by field rather than spreading the session: this runs on every page
  // load, and the session carries the access and refresh tokens. A list of what to
  // print cannot leak a credential added to the session later, the way a list of what
  // to redact would. Presence is what helps when debugging a flow, not the value.
  console.log({
    email: req.session.email,
    uid: req.session.uid,
    acr: req.session.acr,
    amr: req.session.amr,
    auth_time: req.session.auth_time,
    account_aal2: req.session.account_aal2,
    scopes: req.session.scopes,
    hasToken: !!req.session.token,
    hasRefreshToken: !!req.session.refresh_token,
    hasKeysJwe: !!req.session.keys_jwe,
  }); //eslint-disable-line no-console

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

// Resolve an endpoint from the issuer's discovery document, keyed off trusted
// config. Deliberately not read back off the session: the cookie is signed but not
// encrypted, so a session-supplied URL would be an attacker-influenced target for
// requests that carry our access token or client_secret. Doing the lookup per call
// also means sessions minted before this route existed keep working.
async function discoverEndpoint(name) {
  const response = await fetch(
    `${config.get('issuer_uri')}/.well-known/openid-configuration`
  );
  return (await response.json())[name];
}

// The resource-server half of RFC 9470: introspect our own access token and report
// the authentication level and event the authorization server sees. This is the
// check an RP would run before allowing a sensitive action, as opposed to trusting
// the id_token it received at redirect time.
//
// Called once per page load, never polled — /v1/introspect is rate-limited per IP.
app.get('/api/token_claims', checkAuth, async function (req, res) {
  if (!req.session.token) {
    return res.status(409).json({ error: 'no access token on this session' });
  }

  let response, text;
  try {
    response = await fetch(await discoverEndpoint('introspection_endpoint'), {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        token: req.session.token,
        token_type_hint: 'access_token',
      }),
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

// Exchange the refresh token for a fresh access token, replacing the one on the
// session. Test-only, so there is no UI for it: the point it exists to demonstrate
// is that a refreshed access token carries no `acr` and no `auth_time`, because the
// refresh grant never re-evaluates acr_values/max_age and the stored refresh token
// holds no authentication event. An RP must therefore treat a refreshed token as
// unelevated and run step-up again, rather than assuming elevation persists.
app.post('/api/refresh_token', checkAuth, async function (req, res) {
  if (!req.session.refresh_token) {
    return res.status(409).json({ error: 'no refresh token on this session' });
  }

  let response, body;
  try {
    response = await fetch(await discoverEndpoint('token_endpoint'), {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'refresh_token',
        client_id: config.get('client_id'),
        client_secret: config.get('client_secret'),
        refresh_token: req.session.refresh_token,
      }),
    });
    body = await response.json();
  } catch (err) {
    return res.status(502).json({ error: String(err) });
  }
  if (response.status >= 400) {
    return res.status(response.status).json(body);
  }

  // Only the access token is replaced. `acr`/`auth_time` on the session describe
  // the id_token handed over at redirect time and are deliberately left alone, so
  // /api/token_claims can be compared against them to show the two diverging.
  req.session.token = body.access_token;
  req.session.token_type = body.token_type;

  res.json({ token_type: body.token_type, expires_in: body.expires_in });
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
