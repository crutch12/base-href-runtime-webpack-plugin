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

    const logger = compiler.getInfrastructureLogger('BaseHrefRuntimeWebpackPlugin');
    const scriptTemplateFunction = template(scriptTemplate);

    compiler.hooks.compilation.tap('BaseHrefRuntimeWebpackPlugin', (compilation) => {
      HtmlWebpackPlugin.getHooks(compilation).alterAssetTagGroups.tapAsync('BaseHrefRuntimeWebpackPlugin', (data, callback) => {
        if (!data.plugin.options.base) {
          logger.warn('You didn\'t specify "base" field in html-webpack-plugin');
        }

        const baseTagIndex = data.headTags.findIndex(tag => tag.tagName === 'base');
        const targetIndex = baseTagIndex === -1 ? 0 : (baseTagIndex + 1);

        const scriptInnerHTML = scriptTemplateFunction({
          publicPaths: publicPaths,
          fallbackBaseHref: fallbackBaseHref,
        });

        data.headTags = [
          ...data.headTags.slice(0, targetIndex),
          // @NOTE: Insert our script
          {
            tagName: 'script',
            voidTag: false,
            meta: { plugin: 'base-href-runtime-webpack-plugin' },
            attributes: {
              type: 'text/javascript',
              'data-name': 'base-href-runtime-webpack-plugin',
            },
            innerHTML: scriptInnerHTML,
          },
          ...data.headTags.slice(targetIndex)
        ];

        callback(null, data);
      });
    });
  }
}
