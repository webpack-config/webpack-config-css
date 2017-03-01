import {existsSync} from 'fs';
import {join} from 'path';
import compose from 'lodash/fp/flowRight';
import identity from 'lodash/fp/identity';
import isPlainObject from 'lodash/fp/isPlainObject';
import {loader, plugin} from 'webpack-partial';
import ExtractTextPlugin from 'extract-text-webpack-plugin';

const PRODUCTION = process.env.NODE_ENV === 'production';

const hasPostcssConfig = (root) =>
  existsSync(`${root}/postcss.config.js`) ||
  existsSync(`${root}/.postcssrc.json`) ||
  existsSync(`${root}/.postcssrc.yml`) ||
  existsSync(`${root}/.postcssrc.js`) ||
  existsSync(`${root}/.postcssrc`);

const getPostCSSOptions = (postcss, context) => {
  if (isPlainObject(postcss)) {
    // The `postcss` option is an object. Pass it through as the
    // `postcss-loader` options.
    return postcss;
  }

  if (hasPostcssConfig(context)) {
    // There is a PostCSS config file at the project root. Return an empty
    // options object to allow the config to be used.
    return {};
  }

  if (hasPostcssConfig(join(context, 'config', 'postcss'))) {
    // There is a PostCSS config file in the `/config/postcss` directory.
    // Return an options object referencing it.
    return {
      config: join(context, 'config', 'postcss'),
    };
  }

  // Return an options object referencing the default PostCSS config that is
  // part of this config partial.
  return {
    config: __dirname,
  };
};

/**
 * CSS Webpack loader partial.
 *
 * @param {Boolean|Object} options.extract Enable/disable Extract Text Plugin.
 * An object value is used as options for the Extract Text Plugin constructor.
 * @param {Boolean} options.minimize Enable/disable cssnano minification.
 * @param {Boolean} options.jsStyles Enable/disable `css-js-loader`.
 * @param {Boolean|Object} options.postcss Enable/disable `postcss-loader`.
 * An object value is used as options for `postcss-loader`.
 * @param {Boolean} options.modules Enable/disable CSS Modules.
 * @param {String} options.localIdentName CSS Modules local identifier template.
 * @returns {Function} Webpack config partial.
 */
export default ({
  extract = PRODUCTION,
  minimize = PRODUCTION,
  jsStyles = true,
  postcss = true,
  modules = true,
  localIdentName = PRODUCTION
    ? '[hash:base64]'
    : '[name]--[local]--[hash:base64:5]',
  ...options,
} = {}) => {
  const IS_STYLE = jsStyles
    ? /\.(css(\.js)?|scss|styl|sass|less)$/
    : /\.(css|scss|styl|sass|less)$/;
  const IS_JS_STYLE = /\.css\.js$/;

  const extractor = new ExtractTextPlugin({
    disable: !extract,
    filename: '[name].[hash].css',
    ...extract,
  });

  const importLoaders = postcss ? 1 : 0;

  const query = {modules, localIdentName, minimize, importLoaders, ...options};

  return (config) => compose(
    plugin(extractor),
    jsStyles ? loader({
      test: IS_JS_STYLE,
      loader: require.resolve('css-js-loader'),
    }) : identity,
    postcss ? loader({
      test: IS_STYLE,
      loader: require.resolve('postcss-loader'),
      options: getPostCSSOptions(postcss, config.context),
    }) : identity,
    config.target === 'web'
      ? loader({
        test: IS_STYLE,
        loader: extractor.extract({
          use: {
            loader: require.resolve('css-loader'),
            query,
          },
          fallback: require.resolve('style-loader'),
        }),
      })
      : loader({
        test: IS_STYLE,
        loader: require.resolve('css-loader/locals'),
        query,
      }),
  )(config);
};
