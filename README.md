# base-href-runtime-webpack-plugin

Extension for [html-webpack-plugin](https://github.com/ampedandwired/html-webpack-plugin) to programmatically insert or update [`<base href="...">`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/base) tag **in runtime** depending on *window.location.pathname*.

It inserts inline `<script>` in you `index.html` output which generates `<base href="...">`

# Why

When your application is proxied with many different domains and prefixes you might need to detect `publicPath` so you could resolve requests for assets correctly.

### Example

Your application is hosted on `example.com` and you have 2 known entrypoints (proxies) for this application:
```
app.test.com/ui/app -> example.com
app2.io/ui/test/entrypoint -> example.com
```

So you want to open `app.test.com/ui/app` and resolve `index.js` request to `app.test.com/ui/app/index.js` (`-> example.com/index.js`)

For this purpose you want to generate different `<base>` tag:
```html
<!-- for app.test.com/ui/app (/ui/app) -->
<base href="/ui/app">
<script src="index.js" /> <!-- /ui/app/index.js -->

<!-- for app2.io/ui/test/entrypoint (/ui/test/entrypoint) -->
<base href="/ui/test/entrypoint">
<script src="index.js" /> <!-- /ui/test/entrypoint/index.js -->
```

Thus `<base>` tag for the same `index.html` has to be generated **in runtime**.

# Installation

For webpack v5 use latest (^1.0.0):  
`npm i --save-dev base-href-runtime-webpack-plugin`

# Usage

Prepare `HtmlWebpackPlugin`, it should generate *relative* paths for assets.

```diff
new HtmlWebpackPlugin({
  template: 'public/index.html',
  filename: 'index.html',
  // ...,
- publicPath: '/',
+ publicPath: 'auto', // assets paths must be relative
}),
```

Init `base-href-runtime-webpack-plugin`:

```js
const BaseHrefRuntimeWebpackPlugin = require('base-href-runtime-webpack-plugin');

plugins: [
  // ...,
  new BaseHrefRuntimeWebpackPlugin({
    fallbackBaseHref: '/', // in case when we didn't match location.pathname 
    publicPaths: [ // availabled prefixes
      '/ui/app/', // <base href="/ui/app/">
      '/ui/test/entrypoint/', // <base href="/ui/test/entrypoint/">
      '/a/b/c/d/e/', // <base href="/a/b/c/d/e/">
    ],
  }),
]
```

It will inject `<script></script>` in your `index.html`. This script compares current `window.location.pathname` and provided `publicPaths`. Then it inserts `<base href="...">` if we have a match. Otherwise it inserts *fallbackBaseHref* value in `<base href="...">`

Plugin **leaves your template untouched** if `fallbackBaseHref` and `publicPaths` options are not provided.

### Setup application router (optional) 

You might want to use `publicPaths` to prepare your application router (`react-router`, `vue-router`, etc.)

#### Example with react-router

```jsx
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import { publicPaths, fallbackBaseHref } from './lib/constants/config'; // use same variable as publicPaths in you webpack.config.js

const App = ({ basename }) => {
  <Router basename={basename}>
    {/* ... your app content ... */}
  </Router>
}

const getBasename = (pathname) => {
  const publicPath = publicPaths.find(publicPath => pathname.includes(publicPath.replace(/\/$/, '')));
  return publicPath || fallbackBaseHref;
}

ReactDOM.render(<App basename={getBasename(window.location.pathname)} />, document.getElementById('#app'));
```

# Caveats

<details>
  <summary>Excessive requests (duplicated requests)</summary>

  https://developer.mozilla.org/en-US/docs/Web/Performance/How_browsers_work#preload_scanner


  > The preload scanner will parse through the content available and request high priority resources like CSS, JavaScript, and web fonts. <...> It will retrieve resources in the background so that by the time the main HTML parser reaches requested assets, they may possibly already be in flight, or have been downloaded.


  It means that a browser requests all page's resources before you execute any `<script>`. So if your `<base href="...">` tag is being changed by the `<script>` then your browser will **repeat these requests again**.

  Example:
  ```html
<html>
  <head>
    <base href="/unknown/">
    <script type="text/javascript">
      console.log('Initial document.baseURI:', document.baseURI);
      document.querySelector('base').href = '/'
      console.log('New document.baseURI:', document.baseURI);
    </script>
    <script src="js/index.js"></script>

    <!-- @NOTE: I don't know why, but Chrome won't request script below again even after baseURI change -->
    <!-- <script src="js/index.js" />-->
    <!-- So <script src="..." /> and <script src="..."></script> have different behaviour (WTF?!) -->
  </head>
</html>
  ```
  
  Chrome's Network tab result (`js/index.js` request duplicated):

  <img width="676" alt="chrome_LmDvH3YJzy" src="https://user-images.githubusercontent.com/19373212/152134966-5cd1699b-4951-4a41-bb3a-2a733b1ac754.png">
</details>

# Supported browsers

All modern browsers, even IE7

https://developer.mozilla.org/en-US/docs/Web/HTML/Element/base#browser_compatibility

# References

https://www.npmjs.com/package/base-href-webpack-plugin

# Contribution

Feel free to contribute to this project by submitting issues and/or pull requests.

# License

MIT
