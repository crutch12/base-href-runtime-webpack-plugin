import { Compiler, WebpackPluginInstance } from 'webpack';

declare interface BaseHrefRuntimeWebpackPluginOptions {
  fallbackBaseHref?: string;
  publicPaths?: string[];
}

declare class BaseHrefRuntimeWebpackPlugin implements WebpackPluginInstance {
  constructor(options: BaseHrefRuntimeWebpackPluginOptions);

  apply: (compiler: Compiler) => void;
}
