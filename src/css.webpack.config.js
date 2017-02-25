import {existsSync} from 'fs';
import {dirname, join} from 'path';
import compose from 'lodash/fp/flowRight';
import identity from 'lodash/fp/identity';
import isPlainObject from 'lodash/fp/isPlainObject';
import {loader, plugin} from 'webpack-partial';
import nearest from 'find-nearest-file';
import ExtractTextPlugin from 'extract-text-webpack-plugin';

const PRODUCTION = process.env.NODE_ENV === 'production';
const ROOT = dirname(nearest('package.json'));

const hasPostcssConfig = (root) =>
  existsSync(`${root}/postcss.config.js`) ||
  existsSync(`${root}/.postcssrc.json`) ||
  existsSync(`${root}/.postcssrc.yml`) ||
  existsSync(`${root}/.postcssrc.js`) ||
  existsSync(`${root}/.postcssrc`);

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
    ? /\.(css(\.js)|scss|styl|sass|less)?$/
    : /\.(css|scss|styl|sass|less)?$/;
  const IS_JS_STYLE = /\.css\.js$/;

  const extractor = new ExtractTextPlugin({
    disable: !extract,
    filename: '[name].[hash].css',
    ...extract,
  });

  const importLoaders = postcss ? 1 : 0;

  const query = {modules, localIdentName, minimize, importLoaders, ...options};

  let postcssOptions;

  if (isPlainObject(postcss)) {
    postcssOptions = postcss;
  } else if (hasPostcssConfig(ROOT)) {
    postcssOptions = {};
  } else if (hasPostcssConfig(join(ROOT, 'config', 'postcss'))) {
    postcssOptions = {
      config: join(ROOT, 'config', 'postcss'),
    };
  } else {
    postcssOptions = {
      config: __dirname,
    };
  }

  return (config) => compose(
    plugin(extractor),
    jsStyles ? loader({
      test: IS_JS_STYLE,
      loader: require.resolve('css-js-loader'),
    }) : identity,
    postcss ? loader({
      test: IS_STYLE,
      loader: require.resolve('postcss-loader'),
      options: postcssOptions,
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
