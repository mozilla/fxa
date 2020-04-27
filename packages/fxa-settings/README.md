# Firefox Accounts Settings

## Development

- `npm run start|stop|restart` to start, stop, and restart the server as a PM2 process
- `npm run build` to create a production build

**External imports**

You can import React components into this project. This is currently restricted to `fxa-components`:

```javascript
// e.g. assuming the component HelloWorld exists
import HelloWorld from '@fxa-components/HelloWorld';
```

**Working with SVGs**

Create React App allows us to use SVGs in a variety of ways, right out of the box.

```javascript
// Inline, full markup:
import { ReactComponent as Logo } from './logo.svg';
const LogoImage = () => <Logo role="img" aria-label="logo" />;

// As an image source:
import logoUrl from './logo.svg';
const LogoImage = () => <img src={logoUrl} alt="Logo" />;

// As a background-image (inline style)
import logoUrl from './logo.svg';
const LogoImage = () => (
  <div
    style={{ backgroundImage: `url(${logoUrl})` }}
    role="img"
    aria-label="logo"
  ></div>
);

// As a background-image (external style)
// Just reference it in CSS, the loader will find it
// .logo { background-image: url('logo.svg'); }
const LogoImage = () => <div class="logo" role="img" aria-label="logo"></div>;
```

## License

MPL-2.0
