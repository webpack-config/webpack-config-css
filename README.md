#webpack-config-css

A curated CSS loader config for [Webpack] with [CSS Modules], [PostCSS], and [JS styles]. 

[![build status](http://img.shields.io/travis/webpack-config/webpack-config-css/master.svg?style=flat)](https://travis-ci.org/webpack-config/webpack-config-css)
[![coverage](http://img.shields.io/coveralls/webpack-config/webpack-config-css/master.svg?style=flat)](https://coveralls.io/github/webpack-config/webpack-config-css?branch=master)
[![license](http://img.shields.io/npm/l/webpack-config-css.svg?style=flat)](https://www.npmjs.com/package/webpack-config-css)
[![version](http://img.shields.io/npm/v/webpack-config-css.svg?style=flat)](https://www.npmjs.com/package/webpack-config-css)
[![downloads](http://img.shields.io/npm/dm/webpack-config-css.svg?style=flat)](https://www.npmjs.com/package/webpack-config-css)

## Usage

Install:

```sh
yarn add webpack-config-css
```

Add to your `webpack.config.babel.js`:

```js
import css from `webpack-config-css`;

css({/* options */})({
  /* existing webpack configuration */
})
```

### Options

|Name|Default|Description|
|:---|:------|:----------|
|**`extract`**|`NODE_ENV` === `production`|Enable/Disable [Extract Text Plugin]|
|**`modules`**|`true`|Enable/Disable [CSS Modules]|
|**`minimize`**|`NODE_ENV` === `production`|Enable/Disable [minification]|
|**`jsStyles`**|`true`|Enable/Disable support for [JS styles]|
|**`postcss`**|`true`|Enable/Disable [PostCSS]|

Any additional properties of the options object are forwarded to [CSS Loader].

## Features

`webpack-config-css` comes with optimal default settings and requires zero additional config out of the box. However all of the included features are fully full configurable through the options argument.

### CSS Modules

Locally scoped CSS is enable by default using [CSS Modules]. Set `modules: false` in the options to disable this and restore traditional global CSS selectors.

### PostCSS

PostCSS (with [`autoprefixer`] and [`postcss-nesting`]) is enabled by default. Set `postcss: false` in the options to disable it.

To use a custom PostCSS config, pass a config object as `postcss` in the options or include a `postcss.config.js` (or equivalent) in your project root or in `config/postcss/`.

### Static CSS Output

Extract Text Plugin is enabled by default when `NODE_ENV` is `production`. It can be disabled by setting `extract: false` in the options.

To change the extracted file name or to further configure the plugin, pass a plugin constructor object as `extract` in the options.

### JS Styles

Support for styles written in JS is enabled by default using [`css-js-loader`]. CSS styles can be loaded from `css.js` files alongside regular `.css` files. 

A `.js.css` file:

```js
export const className = {
  color: 'red',
  fontSize: 24,
};
```

Yields:

```css
.className {
  color: red;
  font-size: 24px;
};
```

To support JS styles written in ES6, [`babel-loader`] must be configured to load the `.css.js` files _before_ `webpack-config-css` in your webpack config:

```js
import flow from 'lodash/fp/flow'
import {loader} from 'webpack-partial';
import css from `webpack-config-css`;

export default flow(
  loader({
    test: /\.js$/,
    exclude: /node_modules/,
    loader: require.resolve('babel-loader'),
  }),
  css(),
)({
  /* existing webpack configuration */
})
```

To disable JS styles, pass `jsStyles: false` in the options.

[webpack]: https://webpack.github.io
[Extract Text Plugin]: https://github.com/webpack-contrib/extract-text-webpack-plugin
[CSS Loader]: https://github.com/webpack-contrib/css-loader
[JS styles]: https://github.com/10xjs/css-js-loader
[CSS Modules]: https://github.com/webpack-contrib/css-loader#css-modules
[minification]: https://github.com/webpack-contrib/css-loader#minification
[PostCSS]: https://github.com/postcss/postcss
[`css-js-loader`]: https://github.com/10xjs/css-js-loader
[`autoprefixer`]: https://github.com/postcss/autoprefixer
[`postcss-nesting`]: https://github.com/jonathantneal/postcss-nesting
[`babel-loader`]: https://github.com/babel/babel-loader
