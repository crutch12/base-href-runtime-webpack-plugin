export default function baseHrefRuntimeVitePlugin(options) {
  const { fallbackBaseHref, publicPaths } = options;

  if (publicPaths.length === 0 && !fallbackBaseHref) {
    return;
  }

  const scriptTemplateFunction = `(function () {
        var publicPaths = [${publicPaths.map(
          (path) => "'" + path + "'"
        )}] || [];
        var fallbackBaseHref = '${fallbackBaseHref}' ? '${fallbackBaseHref}' : 'undefined';

        const base = document.createElement("base")

        document.head.append(base)

        document.querySelector('base').href = publicPaths.find(
            (path) => window.location.pathname.includes(path)
        ) || fallbackBaseHref || document.baseURI})();`;

  return {
    name: "base-href-runtime-vite-plugin",

    transformIndexHtml(html) {
      return {
        html: html,
        tags: [
          {
            tag: "script",
            voidTag: false,
            injectTo: "head",
            meta: { plugin: "base-href-runtime-webpack-plugin" },
            attrs: {
              type: "text/javascript",
              "data-name": "base-href-runtime-webpack-plugin",
            },
            children: scriptTemplateFunction,
          },
        ],
      };
    },
  };
}
