const HtmlWebpackPlugin = require('html-webpack-plugin');
const BaseHrefRuntimeWebpackPlugin = require('../index');

module.exports = {
  mode: 'production',
  entry: './index.js',
  output: {
    path: __dirname + '/dist',
    filename: 'bundle.js',
    clean: true,
  },
  plugins: [
    new HtmlWebpackPlugin({
      minify: false,
      publicPath: 'auto',
      base: '/',
    }),
    new BaseHrefRuntimeWebpackPlugin({
      fallbackBaseHref: '/',
      publicPaths: [
        '/base-href-runtime-webpack-plugin/test/dist/',
        '/ui/main/',
      ],
    }),
  ],
};
