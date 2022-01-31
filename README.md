# base-href-runtime-webpack-plugin

Extension for [html-webpack-plugin](https://github.com/ampedandwired/html-webpack-plugin) to programmatically insert or update `<base href="...">` tag **in runtime** depending on *window.location.pathname*.

It inserts inline `<script>` in you `index.html` output which generates `<base href="...">`

# Why

When your application is proxied with many different domains and prefixes you might need to detect `publicPath` so you could resolve requests for assets correctly.

### Example

You application is hosted on `example.com` and you have 2 known entrypoints (proxies) for this application:
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

# References

https://www.npmjs.com/package/base-href-webpack-plugin

# Contribution

Feel free to contribute to this project by submitting issues and/or pull requests.

# License

MIT
