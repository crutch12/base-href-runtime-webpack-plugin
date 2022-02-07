const HtmlWebpackPlugin = require('html-webpack-plugin');
const template = require('lodash.template');
const fs = require('fs');
const { validate } = require('schema-utils');
const schema = require('./schema.json');

const scriptTemplate = fs.readFileSync(__dirname + '/script.ejs', 'utf8');

 module.exports = class BaseHrefRuntimeWebpackPlugin {
  constructor(options) {
    validate(schema, options, {
      name: 'BaseHrefRuntimeWebpackPlugin',
      baseDataPath: 'options',
    });
    this.options = options;
  }

  apply(compiler) {
    const publicPaths = (this.options.publicPaths || []).filter(Boolean);
    const fallbackBaseHref = this.options.fallbackBaseHref;

    if (publicPaths.length === 0 && !fallbackBaseHref) {
      return;
    }

    compiler.hooks.compilation.tap('BaseHrefRuntimeWebpackPlugin', (compilation) => {
      HtmlWebpackPlugin.getHooks(compilation).beforeEmit.tapAsync('BaseHrefRuntimeWebpackPlugin', (data, callback) => {
        if (!data.plugin.options.base) {
          const logger = compiler.getInfrastructureLogger('BaseHrefRuntimeWebpackPlugin');
          logger.warn('You didn\'t specify "base" field in html-webpack-plugin');
        }
        const scriptHtml = template(scriptTemplate)({
          publicPaths: publicPaths,
          fallbackBaseHref: fallbackBaseHref,
        });
        data.html = data.html.replace(/<head>/i, '$&' + `${scriptHtml}`);
        callback(null, data);
      });
    });
  }
}
